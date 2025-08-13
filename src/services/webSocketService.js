// services/webSocketService.js
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

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
  }

  // 연결 상태 반환
  getConnectionState() {
    return this.connectionState
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

  // 인증 토큰 가져오기
  getAuthToken() {
    return localStorage.getItem('access_token') ||
        sessionStorage.getItem('access_token')
  }

  // 디바이스 ID 가져오기
  getDeviceId() {
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = this.generateDeviceId()
      localStorage.setItem('device_id', deviceId)
    }
    return deviceId
  }

  // 디바이스 ID 생성
  generateDeviceId() {
    return `web_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
  }

  // 현재 사용자 ID 가져오기
  getCurrentUserId() {
    try {
      const token = this.getAuthToken()
      if (!token) return null

      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId || payload.sub || payload.id
    } catch (error) {
      console.warn('사용자 ID 추출 실패:', error)
      return null
    }
  }

  // WebSocket 연결
  connect() {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve()
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
        this.updateConnectionState('connecting')

        // SockJS를 사용한 WebSocket 연결 설정
        const socket = new SockJS(`${this.baseURL}/api/ws`)

        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            'Authorization': `Bearer ${token}`,
            'X-Device-ID': this.getDeviceId(),
            'X-User-ID': this.getCurrentUserId()?.toString()
          },
          debug: (str) => {
            console.log('🔌 [WebSocket Debug]', str)
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: (frame) => {
            console.log('✅ [WebSocket] 연결 성공:', frame)
            this.connected = true
            this.connecting = false
            this.updateConnectionState('connected')
            resolve()
          },
          onStompError: (frame) => {
            console.error('❌ [WebSocket] STOMP 에러:', frame)
            this.connected = false
            this.connecting = false
            const error = `STOMP Error: ${frame.body}`
            this.updateConnectionState('error', error)
            reject(new Error(error))
          },
          onWebSocketError: (error) => {
            console.error('❌ [WebSocket] WebSocket 에러:', error)
            this.connected = false
            this.connecting = false
            this.updateConnectionState('error', error.message)
            reject(error)
          },
          onDisconnect: () => {
            console.log('🔌 [WebSocket] 연결 해제됨')
            this.connected = false
            this.connecting = false
            this.updateConnectionState('disconnected')
            this.subscriptions.clear()
          }
        })

        this.client.activate()

      } catch (error) {
        console.error('❌ [WebSocket] 연결 실패:', error)
        this.connecting = false
        this.updateConnectionState('error', error.message)
        reject(error)
      }
    })
  }

  // 연결 상태 업데이트
  updateConnectionState(status, error = null) {
    this.connectionState = {
      connected: status === 'connected',
      connecting: status === 'connecting',
      status: status,
      error: error
    }
  }

  // WebSocket 연결 해제
  disconnect() {
    if (this.client) {
      this.subscriptions.clear()
      this.messageHandlers.clear()
      this.globalHandlers.clear()
      this.client.deactivate()
      this.connected = false
      this.connecting = false
      this.updateConnectionState('disconnected')
      console.log('🔌 [WebSocket] 연결 해제 완료')
    }
  }

  // 재연결
  async reconnect() {
    console.log('🔄 [WebSocket] 재연결 시작...')
    if (this.client) {
      this.disconnect()
    }
    await this.connect()
  }

  // 전역 메시지 핸들러 등록
  onMessage(type, handler) {
    this.globalHandlers.set(type, handler)
    console.log(`📨 [WebSocket] 전역 메시지 핸들러 등록: ${type}`)
  }

  // 전역 메시지 핸들러 해제
  offMessage(type, handler) {
    this.globalHandlers.delete(type)
    console.log(`📨 [WebSocket] 전역 메시지 핸들러 해제: ${type}`)
  }

  // 채팅방 구독
  subscribeToChatRoom(roomId, messageHandler) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('WebSocket이 연결되지 않았습니다'))
        return
      }

      try {
        const destination = `/topic/chat/rooms/${roomId}`

        // 이미 구독 중인지 확인
        if (this.subscriptions.has(roomId)) {
          console.log(`📨 [WebSocket] 이미 구독 중인 채팅방: ${roomId}`)
          resolve()
          return
        }

        // 메시지 핸들러 등록
        if (messageHandler) {
          this.messageHandlers.set(roomId, messageHandler)
        }

        console.log(`📨 [WebSocket] 채팅방 구독 시작: ${destination}`)

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
            console.error('❌ [WebSocket] 메시지 파싱 에러:', error)
          }
        })

        this.subscriptions.set(roomId, subscription)
        console.log(`✅ [WebSocket] 채팅방 구독 완료: ${roomId}`)
        resolve()

      } catch (error) {
        console.error(`❌ [WebSocket] 채팅방 구독 실패 (Room: ${roomId}):`, error)
        reject(error)
      }
    })
  }

  // 채팅방 구독 해제
  unsubscribeFromChatRoom(roomId) {
    const subscription = this.subscriptions.get(roomId)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(roomId)
      this.messageHandlers.delete(roomId)
      console.log(`📨 [WebSocket] 채팅방 구독 해제: ${roomId}`)
    }
  }

  // 채팅방 입장 (새로운 API)
  subscribeToRoom(roomId, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('WebSocket이 연결되지 않았습니다'))
        return
      }

      try {
        // 채팅방 메시지 구독
        this.subscribeToChatRoom(roomId, options.onMessage || ((message) => {
          const globalHandler = this.globalHandlers.get('chat-message')
          if (globalHandler) {
            globalHandler(message)
          }
        }))

        // 온라인 사용자 구독
        const presenceDestination = `/topic/chat/rooms/${roomId}/presence`
        const presenceSubscription = this.client.subscribe(presenceDestination, (message) => {
          try {
            const presenceData = JSON.parse(message.body)
            console.log(`👥 [WebSocket] 접속 상태 업데이트 (Room: ${roomId}):`, presenceData)

            const globalHandler = this.globalHandlers.get('presence-update')
            if (globalHandler) {
              globalHandler(presenceData)
            }
          } catch (error) {
            console.error('❌ [WebSocket] 접속 상태 파싱 에러:', error)
          }
        })

        // 타이핑 상태 구독
        const typingDestination = `/topic/chat/rooms/${roomId}/typing`
        const typingSubscription = this.client.subscribe(typingDestination, (message) => {
          try {
            const typingData = JSON.parse(message.body)
            console.log(`⌨️ [WebSocket] 타이핑 상태 업데이트 (Room: ${roomId}):`, typingData)

            const globalHandler = this.globalHandlers.get('typing-status')
            if (globalHandler) {
              globalHandler(typingData)
            }
          } catch (error) {
            console.error('❌ [WebSocket] 타이핑 상태 파싱 에러:', error)
          }
        })

        // 추가 구독 정보 저장
        this.subscriptions.set(`${roomId}-presence`, presenceSubscription)
        this.subscriptions.set(`${roomId}-typing`, typingSubscription)

        if (options.onSubscribed) {
          options.onSubscribed()
        }

        resolve()

      } catch (error) {
        console.error(`❌ [WebSocket] 채팅방 구독 실패 (Room: ${roomId}):`, error)
        if (options.onError) {
          options.onError(error)
        }
        reject(error)
      }
    })
  }

  // 채팅방 구독 해제 (새로운 API)
  unsubscribeFromRoom(roomId) {
    // 메인 채팅방 구독 해제
    this.unsubscribeFromChatRoom(roomId)

    // 추가 구독들 해제
    const presenceSubscription = this.subscriptions.get(`${roomId}-presence`)
    if (presenceSubscription) {
      presenceSubscription.unsubscribe()
      this.subscriptions.delete(`${roomId}-presence`)
    }

    const typingSubscription = this.subscriptions.get(`${roomId}-typing`)
    if (typingSubscription) {
      typingSubscription.unsubscribe()
      this.subscriptions.delete(`${roomId}-typing`)
    }

    console.log(`📨 [WebSocket] 채팅방 전체 구독 해제: ${roomId}`)
  }

  // 메시지 전송
  sendMessage(destination, messageData) {
    if (!this.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

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
  }

  // 채팅방에 메시지 전송
  sendMessage(roomId, messageData) {
    const destination = `/app/chat/rooms/${roomId}/messages`
    return this.sendMessage(destination, messageData)
  }

  // 타이핑 상태 전송
  sendTypingStatus(roomId, isTyping) {
    if (!this.connected) {
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
  }

  // 온라인 사용자 구독
  subscribeToOnlineUsers(roomId, userHandler) {
    if (!this.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

    const destination = `/topic/chat/rooms/${roomId}/users`

    return this.client.subscribe(destination, (message) => {
      try {
        const userData = JSON.parse(message.body)
        console.log(`👥 [WebSocket] 온라인 사용자 정보 (Room: ${roomId}):`, userData)

        if (userHandler) {
          userHandler(userData)
        }
      } catch (error) {
        console.error('❌ [WebSocket] 온라인 사용자 정보 파싱 에러:', error)
      }
    })
  }

  // 시스템 알림 구독
  subscribeToSystemNotifications() {
    if (!this.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

    const destination = `/topic/notifications/system`

    return this.client.subscribe(destination, (message) => {
      try {
        const notificationData = JSON.parse(message.body)
        console.log(`🔔 [WebSocket] 시스템 알림:`, notificationData)

        const globalHandler = this.globalHandlers.get('system-notification')
        if (globalHandler) {
          globalHandler(notificationData)
        }
      } catch (error) {
        console.error('❌ [WebSocket] 시스템 알림 파싱 에러:', error)
      }
    })
  }

  // 개인 알림 구독
  subscribeToPersonalNotifications() {
    if (!this.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

    const userId = this.getCurrentUserId()
    if (!userId) {
      throw new Error('사용자 ID를 찾을 수 없습니다')
    }

    const destination = `/topic/notifications/user/${userId}`

    return this.client.subscribe(destination, (message) => {
      try {
        const notificationData = JSON.parse(message.body)
        console.log(`🔔 [WebSocket] 개인 알림:`, notificationData)

        const globalHandler = this.globalHandlers.get('personal-notification')
        if (globalHandler) {
          globalHandler(notificationData)
        }
      } catch (error) {
        console.error('❌ [WebSocket] 개인 알림 파싱 에러:', error)
      }
    })
  }

  // 연결 상태 확인
  isConnected() {
    return this.connected && this.client?.connected
  }

  // 구독 상태 확인
  isSubscribedTo(roomId) {
    return this.subscriptions.has(roomId)
  }

  // 모든 구독 해제
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe()
      console.log(`📨 [WebSocket] 구독 해제: ${key}`)
    })
    this.subscriptions.clear()
    this.messageHandlers.clear()
  }

  // 연결 상태 모니터링
  startConnectionMonitoring() {
    setInterval(() => {
      if (this.connected && this.client?.connected) {
        // 연결 상태 양호
        if (this.connectionState.status !== 'connected') {
          this.updateConnectionState('connected')
        }
      } else if (this.connecting) {
        // 연결 중
        if (this.connectionState.status !== 'connecting') {
          this.updateConnectionState('connecting')
        }
      } else {
        // 연결 끊김
        if (this.connectionState.status !== 'disconnected') {
          this.updateConnectionState('disconnected')
        }
      }
    }, 1000)
  }

  // 디버그 정보 출력
  getDebugInfo() {
    return {
      connected: this.connected,
      connecting: this.connecting,
      subscriptionsCount: this.subscriptions.size,
      handlersCount: this.messageHandlers.size,
      globalHandlersCount: this.globalHandlers.size,
      connectionState: this.connectionState,
      deviceInfo: this.getDeviceInfo(),
      userId: this.getCurrentUserId(),
      deviceId: this.getDeviceId()
    }
  }

  // 통계 정보
  getStats() {
    return {
      totalSubscriptions: this.subscriptions.size,
      totalHandlers: this.messageHandlers.size + this.globalHandlers.size,
      uptime: this.connected ? Date.now() - this.connectTime : 0,
      reconnectCount: this.reconnectCount || 0
    }
  }
}

// 싱글톤 인스턴스 생성
export const webSocketService = new WebSocketService()

// 연결 상태 모니터링 시작
webSocketService.startConnectionMonitoring()

// 기본 내보내기
export default webSocketService