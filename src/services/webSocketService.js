// services/webSocketService.js
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import * as authUtils from '@/utils/auth.js'

class WebSocketService {
  constructor() {
    this.client = null
    this.connected = false
    this.connecting = false
    this.subscriptions = new Map()
    this.messageHandlers = new Map()
    this.globalHandlers = new Map()
    this.baseURL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8084'
    this.connectionState = {
      connected: false,
      connecting: false,
      status: 'disconnected',
      error: null
    }
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  // 인증 토큰 가져오기
  getAuthToken() {
    return authUtils.getAccessToken()
  }

  // 디바이스 ID 가져오기
  getDeviceId() {
    return authUtils.getDeviceId()
  }

  // 현재 사용자 ID 가져오기
  getCurrentUserId() {
    return authUtils.getUserId()
  }

  // 연결 상태 반환
  getConnectionState() {
    return this.connectionState
  }

  // 연결 상태 업데이트
  updateConnectionState(status, error = null) {
    this.connectionState = {
      connected: status === 'connected',
      connecting: status === 'connecting',
      status: status,
      error: error
    }

    // 연결 상태 변화 알림
    this.notifyConnectionChange(status === 'connected')
  }

  // 연결 상태 변화 리스너 등록
  onConnectionChange(callback) {
    this.globalHandlers.set('connection-change', callback)
  }

  // 연결 상태 변화 알림
  notifyConnectionChange(connected) {
    const callback = this.globalHandlers.get('connection-change')
    if (callback) {
      callback(connected)
    }
  }

  // 전역 메시지 핸들러 등록
  onMessage(type, handler) {
    this.globalHandlers.set(type, handler)
    console.log(`📨 [WebSocket] 전역 메시지 핸들러 등록: ${type}`)
  }

  // 전역 메시지 핸들러 해제
  offMessage(type) {
    this.globalHandlers.delete(type)
    console.log(`📨 [WebSocket] 전역 메시지 핸들러 해제: ${type}`)
  }

  // 디바이스 정보 반환
  getDeviceInfo() {
    return {
      deviceType: this.getDeviceType(),
      browser: this.getBrowserInfo(),
      deviceName: this.getDeviceName()
    }
  }

  // 디바이스 타입 감지
  getDeviceType() {
    const userAgent = navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'Tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'Mobile'
    }
    return 'Desktop'
  }

  // 브라우저 정보 감지
  getBrowserInfo() {
    const userAgent = navigator.userAgent
    let browserName = 'Unknown'

    if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome'
    } else if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox'
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari'
    } else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge'
    } else if (userAgent.indexOf('Opera') > -1) {
      browserName = 'Opera'
    }

    return { name: browserName }
  }

  // 디바이스 이름 생성
  getDeviceName() {
    return `${this.getBrowserInfo().name} on ${this.getDeviceType()}`
  }

  // WebSocket 연결 상태 확인
  isConnected() {
    return this.connected &&
        this.client &&
        this.client.connected &&
        this.client.webSocket &&
        this.client.webSocket.readyState === WebSocket.OPEN
  }

  // WebSocket 연결
  connect() {
    return new Promise((resolve, reject) => {
      // 이미 연결되어 있으면 바로 성공 처리
      if (this.isConnected()) {
        console.log('🔌 [WebSocket] 이미 연결되어 있음')
        resolve()
        return
      }

      // 연결 중이면 기존 연결 프로세스 대기
      if (this.connecting) {
        console.log('🔌 [WebSocket] 연결 중... 대기')
        const checkConnection = () => {
          if (this.isConnected()) {
            resolve()
          } else if (!this.connecting) {
            reject(new Error('연결 실패'))
          } else {
            setTimeout(checkConnection, 100)
          }
        }
        setTimeout(() => {
          if (this.connecting) {
            reject(new Error('연결 시간 초과'))
          }
        }, 10000)
        checkConnection()
        return
      }

      const token = this.getAuthToken()
      if (!token) {
        const error = new Error('인증 토큰이 없습니다')
        this.updateConnectionState('error', error.message)
        reject(error)
        return
      }

      try {
        console.log('🔌 [WebSocket] 새로운 연결 시작...')
        this.connecting = true
        this.updateConnectionState('connecting')

        // 기존 클라이언트가 있으면 정리
        if (this.client) {
          try {
            this.client.deactivate()
          } catch (e) {
            console.warn('기존 클라이언트 정리 중 오류:', e)
          }
        }

        // SockJS를 사용한 WebSocket 연결 설정
        const socket = new SockJS(`${this.baseURL}/api/ws`)

        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            'Authorization': `Bearer ${token}`,
            'X-Device-ID': this.getDeviceId(),
            'X-User-ID': this.getCurrentUserId()?.toString() || 'unknown'
          },
          debug: (str) => {
            if (import.meta.env.DEV) {
              console.log('🔌 [WebSocket Debug]', str)
            }
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          onConnect: (frame) => {
            console.log('✅ [WebSocket] 연결 성공:', frame)
            this.connected = true
            this.connecting = false
            this.reconnectAttempts = 0
            this.updateConnectionState('connected')

            // 연결 후 기존 구독 복원
            this.restoreSubscriptions()

            resolve()
          },
          onStompError: (frame) => {
            console.error('❌ [WebSocket] STOMP 에러:', frame)
            this.connected = false
            this.connecting = false
            const error = `STOMP Error: ${frame.body || frame.headers?.message || 'Unknown error'}`
            this.updateConnectionState('error', error)
            reject(new Error(error))
          },
          onWebSocketError: (error) => {
            console.error('❌ [WebSocket] WebSocket 에러:', error)
            this.connected = false
            this.connecting = false
            this.updateConnectionState('error', error.message || 'WebSocket connection error')
            reject(error)
          },
          onWebSocketClose: (event) => {
            console.log('🔌 [WebSocket] 연결 종료:', event)
            this.connected = false
            this.connecting = false
            this.updateConnectionState('disconnected')

            // 자동 재연결 시도 (정상 종료가 아닌 경우)
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.attemptReconnect()
            }
          },
          onDisconnect: (receipt) => {
            console.log('🔌 [WebSocket] 연결 해제됨:', receipt)
            this.connected = false
            this.connecting = false
            this.updateConnectionState('disconnected')
          }
        })

        // 연결 시간 초과 처리
        const connectionTimeout = setTimeout(() => {
          if (this.connecting) {
            console.error('❌ [WebSocket] 연결 시간 초과')
            this.connecting = false
            this.updateConnectionState('error', '연결 시간 초과')
            reject(new Error('연결 시간 초과'))
          }
        }, 15000)

        // 연결 성공 시 타임아웃 해제
        const originalOnConnect = this.client.onConnect
        this.client.onConnect = (frame) => {
          clearTimeout(connectionTimeout)
          originalOnConnect.call(this.client, frame)
        }

        this.client.activate()

      } catch (error) {
        console.error('❌ [WebSocket] 연결 실패:', error)
        this.connecting = false
        this.updateConnectionState('error', error.message)
        reject(error)
      }
    })
  }

  // 자동 재연결 시도
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [WebSocket] 최대 재연결 시도 횟수 초과')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // 지수 백오프

    console.log(`🔄 [WebSocket] ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      if (!this.isConnected()) {
        this.connect()
        .then(() => {
          console.log('✅ [WebSocket] 재연결 성공')
        })
        .catch((error) => {
          console.error('❌ [WebSocket] 재연결 실패:', error)
          this.attemptReconnect()
        })
      }
    }, delay)
  }

  // 기존 구독 복원
  restoreSubscriptions() {
    console.log('🔄 [WebSocket] 구독 복원 중...')
    const subscriptionsToRestore = new Map(this.subscriptions)
    this.subscriptions.clear()

    subscriptionsToRestore.forEach((subscription, key) => {
      if (key.includes('-')) {
        // 특수 구독 (presence, typing 등)
        const [roomId, type] = key.split('-')
        if (type === 'presence' || type === 'typing') {
          // 특수 구독은 subscribeToRoom을 통해 복원
          return
        }
      } else {
        // 일반 채팅방 구독 복원
        const handler = this.messageHandlers.get(key)
        if (handler) {
          this.subscribeToChatRoom(key, handler)
          .then(() => {
            console.log(`✅ [WebSocket] 채팅방 ${key} 구독 복원 완료`)
          })
          .catch((error) => {
            console.error(`❌ [WebSocket] 채팅방 ${key} 구독 복원 실패:`, error)
          })
        }
      }
    })
  }

  // WebSocket 연결 해제
  disconnect() {
    console.log('🔌 [WebSocket] 연결 해제 시작...')

    this.connecting = false
    this.connected = false

    if (this.client) {
      try {
        // 모든 구독 해제
        this.subscriptions.forEach((subscription, key) => {
          try {
            subscription.unsubscribe()
          } catch (error) {
            console.warn(`구독 해제 실패 (${key}):`, error)
          }
        })

        this.subscriptions.clear()
        this.messageHandlers.clear()
        // globalHandlers는 유지 (재연결 시 필요)

        // STOMP 클라이언트 비활성화
        this.client.deactivate()
      } catch (error) {
        console.warn('클라이언트 해제 중 오류:', error)
      }

      this.client = null
    }

    this.updateConnectionState('disconnected')
    console.log('✅ [WebSocket] 연결 해제 완료')
  }

  // 재연결
  async reconnect() {
    console.log('🔄 [WebSocket] 수동 재연결 시작...')
    this.disconnect()
    await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 대기
    return this.connect()
  }

  // 연결 보장 메서드
  async ensureConnection() {
    if (this.isConnected()) {
      return Promise.resolve()
    }

    if (this.connecting) {
      // 연결 중이면 완료까지 대기
      return new Promise((resolve, reject) => {
        const checkConnection = () => {
          if (this.isConnected()) {
            resolve()
          } else if (!this.connecting) {
            reject(new Error('연결 실패'))
          } else {
            setTimeout(checkConnection, 100)
          }
        }

        setTimeout(() => {
          if (this.connecting) {
            reject(new Error('연결 시간 초과'))
          }
        }, 15000)

        checkConnection()
      })
    }

    // 연결되지 않았으면 새로 연결
    return this.connect()
  }

  // 채팅방 구독
  async subscribeToChatRoom(roomId, messageHandler) {
    try {
      console.log(`📨 [WebSocket] 채팅방 구독 시작: ${roomId}`)

      // 연결 상태 확인 및 보장
      await this.ensureConnection()

      const destination = `/topic/chat/rooms/${roomId}`

      // 이미 구독 중인지 확인
      if (this.subscriptions.has(roomId)) {
        console.log(`📨 [WebSocket] 이미 구독 중인 채팅방: ${roomId}`)
        return Promise.resolve()
      }

      // 메시지 핸들러 등록
      if (messageHandler) {
        this.messageHandlers.set(roomId, messageHandler)
      }

      console.log(`📨 [WebSocket] 채팅방 구독 요청: ${destination}`)

      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const messageData = JSON.parse(message.body)
          console.log(`📨 [WebSocket] 메시지 수신 (Room: ${roomId}):`, messageData)

          // 등록된 핸들러가 있으면 호출
          const handler = this.messageHandlers.get(roomId)
          if (handler) {
            handler(messageData)
          }

          // 전역 핸들러도 호출
          const globalHandler = this.globalHandlers.get('chat-message')
          if (globalHandler) {
            globalHandler(messageData)
          }
        } catch (error) {
          console.error('❌ [WebSocket] 메시지 파싱 에러:', error, message.body)
        }
      })

      this.subscriptions.set(roomId, subscription)
      console.log(`✅ [WebSocket] 채팅방 구독 완료: ${roomId}`)

      return Promise.resolve()

    } catch (error) {
      console.error(`❌ [WebSocket] 채팅방 구독 실패 (Room: ${roomId}):`, error)
      throw error
    }
  }

  // 채팅방 구독 해제
  unsubscribeFromChatRoom(roomId) {
    try {
      const subscription = this.subscriptions.get(roomId)
      if (subscription) {
        subscription.unsubscribe()
        this.subscriptions.delete(roomId)
        this.messageHandlers.delete(roomId)
        console.log(`📨 [WebSocket] 채팅방 구독 해제: ${roomId}`)
      } else {
        console.warn(`⚠️ [WebSocket] 구독하지 않은 채팅방: ${roomId}`)
      }
    } catch (error) {
      console.error(`❌ [WebSocket] 채팅방 구독 해제 실패 (Room: ${roomId}):`, error)
    }
  }

  // 메시지 전송
  async sendMessage(roomId, messageData) {
    try {
      // 연결 상태 확인 및 보장
      await this.ensureConnection()

      const destination = `/app/chat/rooms/${roomId}/messages`
      const message = {
        ...messageData,
        senderId: this.getCurrentUserId(),
        deviceId: this.getDeviceId(),
        timestamp: new Date().toISOString()
      }

      console.log(`📤 [WebSocket] 메시지 전송 (${destination}):`, message)

      this.client.publish({
        destination: destination,
        body: JSON.stringify(message)
      })

      return Promise.resolve()

    } catch (error) {
      console.error(`❌ [WebSocket] 메시지 전송 실패 (Room: ${roomId}):`, error)
      throw error
    }
  }

  // 타이핑 상태 전송
  async sendTypingStatus(roomId, isTyping) {
    try {
      if (!this.isConnected()) {
        console.warn('⚠️ [WebSocket] 연결되지 않아 타이핑 상태를 전송할 수 없습니다')
        return
      }

      const destination = `/app/chat/rooms/${roomId}/typing`
      const message = {
        roomId: roomId,
        userId: this.getCurrentUserId(),
        isTyping: isTyping,
        timestamp: new Date().toISOString()
      }

      console.log(`⌨️ [WebSocket] 타이핑 상태 전송:`, message)

      this.client.publish({
        destination: destination,
        body: JSON.stringify(message)
      })
    } catch (error) {
      console.error('❌ [WebSocket] 타이핑 상태 전송 실패:', error)
    }
  }

  // 구독 상태 확인
  isSubscribedTo(roomId) {
    return this.subscriptions.has(roomId)
  }

  // 모든 구독 해제
  unsubscribeAll() {
    console.log('📨 [WebSocket] 모든 구독 해제 중...')
    this.subscriptions.forEach((subscription, key) => {
      try {
        subscription.unsubscribe()
        console.log(`📨 [WebSocket] 구독 해제: ${key}`)
      } catch (error) {
        console.warn(`구독 해제 실패 (${key}):`, error)
      }
    })
    this.subscriptions.clear()
    this.messageHandlers.clear()
  }

  // 디버그 정보 출력
  getDebugInfo() {
    return {
      connected: this.isConnected(),
      connecting: this.connecting,
      subscriptionsCount: this.subscriptions.size,
      handlersCount: this.messageHandlers.size,
      globalHandlersCount: this.globalHandlers.size,
      connectionState: this.connectionState,
      deviceInfo: this.getDeviceInfo(),
      userId: this.getCurrentUserId(),
      deviceId: this.getDeviceId(),
      reconnectAttempts: this.reconnectAttempts,
      clientState: this.client ? {
        connected: this.client.connected,
        webSocketState: this.client.webSocket?.readyState
      } : null
    }
  }

  // 헬스체크
  async healthCheck() {
    if (!this.isConnected()) {
      return {
        healthy: false,
        status: 'disconnected',
        message: 'WebSocket이 연결되지 않았습니다'
      }
    }

    try {
      // 간단한 핑 메시지 전송으로 연결 상태 확인
      const testDestination = '/app/ping'
      this.client.publish({
        destination: testDestination,
        body: JSON.stringify({ type: 'ping', timestamp: Date.now() })
      })

      return {
        healthy: true,
        status: 'connected',
        message: 'WebSocket 연결 정상'
      }
    } catch (error) {
      return {
        healthy: false,
        status: 'error',
        message: `헬스체크 실패: ${error.message}`
      }
    }
  }

  // 연결 상태 모니터링
  startConnectionMonitoring() {
    setInterval(() => {
      const wasConnected = this.connectionState.connected
      const isNowConnected = this.isConnected()

      if (wasConnected !== isNowConnected) {
        if (isNowConnected) {
          this.updateConnectionState('connected')
        } else {
          this.updateConnectionState('disconnected')

          // 예상치 못한 연결 끊김 감지 시 재연결 시도
          if (wasConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.warn('⚠️ [WebSocket] 예상치 못한 연결 끊김 감지, 재연결 시도')
            this.attemptReconnect()
          }
        }
      }
    }, 5000) // 5초마다 체크
  }
}

// 싱글톤 인스턴스 생성
export const webSocketService = new WebSocketService()

// 연결 상태 모니터링 시작
webSocketService.startConnectionMonitoring()

// 기본 내보내기
export default webSocketService