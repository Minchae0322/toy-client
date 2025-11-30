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

    // 🔥 백엔드 WebSocket 서버 URL 명확히 설정
    this.baseURL = import.meta.env.VITE_CHAT_BASE_URL || 'http://localhost:8084'
    console.log('🔌 [WebSocket] Base URL:', this.baseURL)

    this.connectionState = {
      connected: false,
      connecting: false,
      status: 'disconnected',
      error: null
    }
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000

    // 백엔드 토픽 구조에 맞춘 설정
    this.topics = {
      chatRoomPrefix: '/topic/chatroom',
      userDevicePrefix: '/user',
      systemNotification: '/topic/system/notifications',
      onlineUsers: '/topic/online-users'
    }

    this.destinations = {
      sendMessage: '/chat/send',
      leaveRoom: '/app/chat/leave',
      sendTyping: '/app/typing',
      ping: '/app/ping'
    }
  }

  // 토픽 생성 헬퍼 메서드들
  getChatRoomTopic(roomId) {
    return `${this.topics.chatRoomPrefix}/${roomId}`
  }

  getUserDeviceQueue(userId, deviceId, queueType) {
    return `${this.topics.userDevicePrefix}/${userId}/device/${deviceId}/queue/${queueType}`
  }

  getUserNotificationTopic(userId) {
    return `/topic/user/${userId}/notifications`
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

  // 🔥 디버깅을 위한 연결 테스트 메서드 추가
  async testConnection() {
    console.group('🔍 [WebSocket] 연결 테스트')

    console.log('Base URL:', this.baseURL)
    console.log('WebSocket URL:', `${this.baseURL}/api/ws`)
    console.log('Current User ID:', this.getCurrentUserId())
    console.log('Device ID:', this.getDeviceId())
    console.log('Auth Token exists:', !!this.getAuthToken())

    // 백엔드 서버 헬스체크
    try {
      const healthResponse = await fetch(`${this.baseURL}/health`)
      console.log('Backend Health Check:', healthResponse.ok ? '✅ OK' : '❌ Failed')

      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        console.log('Health Data:', healthData)
      }
    } catch (error) {
      console.error('❌ Backend Health Check Failed:', error.message)
    }

    // WebSocket 엔드포인트 확인
    try {
      const wsResponse = await fetch(`${this.baseURL}/api/ws/info`)
      console.log('WebSocket Info:', wsResponse.ok ? '✅ Available' : '❌ Not Available')
    } catch (error) {
      console.warn('⚠️ WebSocket Info Check:', error.message)
    }

    console.groupEnd()
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
        }, 20000) // 20초로 늘림
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
        console.log('🔌 [WebSocket] 연결 URL:', `${this.baseURL}/api/ws`)

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

        // 🔥 SockJS URL 수정 - 백엔드 서버로 연결
        const socketUrl = `${this.baseURL}/api/ws`
        console.log('🔌 [WebSocket] SockJS 연결 URL:', socketUrl)

        const socket = new SockJS(socketUrl)

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

          // 🔥 연결 성공 콜백 수정
          onConnect: (frame) => {
            console.log('✅ [WebSocket] 연결 성공!')
            console.log('✅ [WebSocket] Frame:', frame)
            console.log('✅ [WebSocket] WebSocket URL:', socket.url)

            this.connected = true
            this.connecting = false
            this.reconnectAttempts = 0
            this.updateConnectionState('connected')

            // 연결 후 필수 구독 설정
            this.subscribeToEssentialTopics()
            this.restoreSubscriptions()

            resolve()
          },

          onStompError: (frame) => {
            console.error('❌ [WebSocket] STOMP 에러:', frame)
            console.error('❌ [WebSocket] Error Headers:', frame.headers)
            console.error('❌ [WebSocket] Error Body:', frame.body)

            this.connected = false
            this.connecting = false
            const error = `STOMP Error: ${frame.body || frame.headers?.message || 'Unknown error'}`
            this.updateConnectionState('error', error)
            reject(new Error(error))
          },

          onWebSocketError: (error) => {
            console.error('❌ [WebSocket] WebSocket 에러:', error)
            console.error('❌ [WebSocket] Socket URL was:', socketUrl)

            this.connected = false
            this.connecting = false
            this.updateConnectionState('error', error.message || 'WebSocket connection error')
            reject(error)
          },

          onWebSocketClose: (event) => {
            console.log('🔌 [WebSocket] 연결 종료:', event)
            console.log('🔌 [WebSocket] Close Code:', event.code)
            console.log('🔌 [WebSocket] Close Reason:', event.reason)

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

        // 🔥 연결 시간 초과 처리 (더 길게 설정)
        const connectionTimeout = setTimeout(() => {
          if (this.connecting) {
            console.error('❌ [WebSocket] 연결 시간 초과 (20초)')
            this.connecting = false
            this.updateConnectionState('error', '연결 시간 초과')

            if (this.client) {
              try {
                this.client.deactivate()
              } catch (e) {
                console.warn('타임아웃 시 클라이언트 정리 실패:', e)
              }
            }

            reject(new Error('연결 시간 초과 (20초)'))
          }
        }, 20000) // 20초로 늘림

        // 연결 성공 시 타임아웃 해제
        const originalOnConnect = this.client.onConnect
        this.client.onConnect = (frame) => {
          clearTimeout(connectionTimeout)
          originalOnConnect.call(this.client, frame)
        }

        console.log('🔌 [WebSocket] 클라이언트 활성화 시작...')
        this.client.activate()

      } catch (error) {
        console.error('❌ [WebSocket] 연결 실패:', error)
        this.connecting = false
        this.updateConnectionState('error', error.message)
        reject(error)
      }
    })
  }

  // 필수 토픽 구독 (연결 직후)
  async subscribeToEssentialTopics() {
    const userId = this.getCurrentUserId()
    const deviceId = this.getDeviceId()

    if (!userId || !deviceId) {
      console.warn('⚠️ [WebSocket] 사용자 ID 또는 디바이스 ID가 없어 필수 구독을 건너뜁니다')
      return
    }

    try {
      console.log('📨 [WebSocket] 필수 토픽 구독 시작...')

      // 1. 개인 메시지 큐 구독
      const messageQueue = this.getUserDeviceQueue(userId, deviceId, 'messages')
      await this.subscribeToPersonalQueue('messages', messageQueue)

      // 2. 헤드업 알림 큐 구독
      const headsupQueue = this.getUserDeviceQueue(userId, deviceId, 'headsup')
      await this.subscribeToPersonalQueue('headsup', headsupQueue)

      // 3. 일반 알림 큐 구독
      const notificationQueue = this.getUserDeviceQueue(userId, deviceId, 'notifications')
      await this.subscribeToPersonalQueue('notifications', notificationQueue)

      // 4. 상태 업데이트 큐 구독
      const statusQueue = this.getUserDeviceQueue(userId, deviceId, 'status')
      await this.subscribeToPersonalQueue('status', statusQueue)

      // 5. 시스템 알림 토픽 구독
      await this.subscribeToSystemNotifications()

      // 6. 온라인 사용자 토픽 구독
      await this.subscribeToOnlineUsers()

      console.log('✅ [WebSocket] 필수 토픽 구독 완료')

    } catch (error) {
      console.error('❌ [WebSocket] 필수 토픽 구독 실패:', error)
    }
  }

  // 개인 큐 구독
  async subscribeToPersonalQueue(queueType, destination) {
    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const messageData = JSON.parse(message.body)
          console.log(`📨 [WebSocket] ${queueType} 메시지 수신:`, messageData)

          // 전역 핸들러 호출
          const globalHandler = this.globalHandlers.get(queueType)
          if (globalHandler) {
            globalHandler(messageData)
          }

          // 메시지 타입에 따른 특별 처리
          switch (queueType) {
            case 'messages':
              this.handlePersonalMessage(messageData)
              break
            case 'headsup':
              this.handleHeadsupNotification(messageData)
              break
            case 'notifications':
              this.handleNotification(messageData)
              break
            case 'status':
              this.handleStatusUpdate(messageData)
              break
          }
        } catch (error) {
          console.error(`❌ [WebSocket] ${queueType} 메시지 파싱 에러:`, error)
        }
      })

      this.subscriptions.set(`personal-${queueType}`, subscription)
      console.log(`✅ [WebSocket] ${queueType} 큐 구독 완료: ${destination}`)

    } catch (error) {
      console.error(`❌ [WebSocket] ${queueType} 큐 구독 실패:`, error)
      throw error
    }
  }

  // 시스템 알림 구독
  async subscribeToSystemNotifications() {
    try {
      const destination = this.topics.systemNotification
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const messageData = JSON.parse(message.body)
          console.log('📨 [WebSocket] 시스템 알림 수신:', messageData)

          const globalHandler = this.globalHandlers.get('system-notification')
          if (globalHandler) {
            globalHandler(messageData)
          }
        } catch (error) {
          console.error('❌ [WebSocket] 시스템 알림 파싱 에러:', error)
        }
      })

      this.subscriptions.set('system-notifications', subscription)
      console.log(`✅ [WebSocket] 시스템 알림 구독 완료: ${destination}`)

    } catch (error) {
      console.error('❌ [WebSocket] 시스템 알림 구독 실패:', error)
      throw error
    }
  }

  // 온라인 사용자 토픽 구독
  async subscribeToOnlineUsers() {
    try {
      const destination = this.topics.onlineUsers
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const messageData = JSON.parse(message.body)
          console.log('📨 [WebSocket] 온라인 사용자 업데이트:', messageData)

          const globalHandler = this.globalHandlers.get('online-users')
          if (globalHandler) {
            globalHandler(messageData)
          }
        } catch (error) {
          console.error('❌ [WebSocket] 온라인 사용자 메시지 파싱 에러:', error)
        }
      })

      this.subscriptions.set('online-users', subscription)
      console.log(`✅ [WebSocket] 온라인 사용자 토픽 구독 완료: ${destination}`)

    } catch (error) {
      console.error('❌ [WebSocket] 온라인 사용자 토픽 구독 실패:', error)
      throw error
    }
  }

  // 개인 메시지 처리
  handlePersonalMessage(messageData) {
    // 개인 메시지 특별 처리 로직
    console.log('💬 개인 메시지 처리:', messageData)
  }

  // 헤드업 알림 처리
  handleHeadsupNotification(messageData) {
    // 헤드업 알림 특별 처리 로직 (긴급 알림 등)
    console.log('🚨 헤드업 알림 처리:', messageData)
  }

  // 일반 알림 처리
  handleNotification(messageData) {
    // 일반 알림 처리 로직
    console.log('🔔 알림 처리:', messageData)
  }

  // 상태 업데이트 처리
  handleStatusUpdate(messageData) {
    // 상태 업데이트 처리 로직
    console.log('📊 상태 업데이트 처리:', messageData)
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

    // 필수 구독을 제외한 채팅방 구독만 복원
    subscriptionsToRestore.forEach((subscription, key) => {
      if (key.startsWith('chatroom-')) {
        const roomId = key.replace('chatroom-', '')
        const handler = this.messageHandlers.get(roomId)
        if (handler) {
          // 기존 구독 제거하고 새로 구독
          this.subscriptions.delete(key)
          this.subscribeToChatRoom(roomId, handler)
          .then(() => {
            console.log(`✅ [WebSocket] 채팅방 ${roomId} 구독 복원 완료`)
          })
          .catch((error) => {
            console.error(`❌ [WebSocket] 채팅방 ${roomId} 구독 복원 실패:`, error)
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
        }, 20000) // 20초로 늘림

        checkConnection()
      })
    }

    // 연결되지 않았으면 새로 연결
    return this.connect()
  }

  // 채팅방 구독 (백엔드 토픽 구조에 맞춘 버전)
  async subscribeToChatRoom(roomId, messageHandler) {
    try {
      console.log(`📨 [WebSocket] 채팅방 구독 시작: ${roomId}`)

      // 연결 상태 확인 및 보장
      await this.ensureConnection()

      const destination = this.getChatRoomTopic(roomId) // /topic/chatroom/{roomId}

      // 이미 구독 중인지 확인
      const subscriptionKey = `chatroom-${roomId}`
      if (this.subscriptions.has(subscriptionKey)) {
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
          console.log(`📨 [WebSocket] 채팅방 메시지 수신 (Room: ${roomId}):`, messageData)

          // 등록된 핸들러가 있으면 호출
          const handler = this.messageHandlers.get(roomId)
          if (handler) {
            handler(messageData)
          }

          // 전역 핸들러도 호출
          const globalHandler = this.globalHandlers.get('chat-message')
          if (globalHandler) {
            globalHandler(messageData, roomId)
          }
        } catch (error) {
          console.error('❌ [WebSocket] 채팅방 메시지 파싱 에러:', error, message.body)
        }
      })

      this.subscriptions.set(subscriptionKey, subscription)
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
      const subscriptionKey = `chatroom-${roomId}`
      const subscription = this.subscriptions.get(subscriptionKey)
      if (subscription) {
        subscription.unsubscribe()
        this.subscriptions.delete(subscriptionKey)
        this.messageHandlers.delete(roomId)
        console.log(`📨 [WebSocket] 채팅방 구독 해제: ${roomId}`)
      } else {
        console.warn(`⚠️ [WebSocket] 구독하지 않은 채팅방: ${roomId}`)
      }
    } catch (error) {
      console.error(`❌ [WebSocket] 채팅방 구독 해제 실패 (Room: ${roomId}):`, error)
    }
  }

  // 메시지 전송 (백엔드 ChatStompController에 맞춘 버전)
  async sendMessage(roomId, messageData) {
    try {
      // 연결 상태 확인 및 보장
      await this.ensureConnection()

      const destination = this.destinations.sendMessage // /app/chat/send
      const message = {
        roomId: roomId,
        actionType: messageData.messageType || messageData.actionType || 'TEXT',
        actorUserId: this.getCurrentUserId(),
        messageContent: messageData.content || messageData.messageContent,
        additionalData: messageData.additionalData || {},
        // 파일 관련 필드들
        ...(messageData.fileUrl && { fileUrl: messageData.fileUrl }),
        ...(messageData.fileName && { fileName: messageData.fileName }),
        ...(messageData.fileSize && { fileSize: messageData.fileSize }),
        ...(messageData.mimeType && { mimeType: messageData.mimeType }),
        ...(messageData.thumbnailUrl && { thumbnailUrl: messageData.thumbnailUrl }),
        // 미디어 메타데이터
        ...(messageData.width && { width: messageData.width }),
        ...(messageData.height && { height: messageData.height }),
        ...(messageData.duration && { duration: messageData.duration }),
        // 위치 정보
        ...(messageData.latitude && { latitude: messageData.latitude }),
        ...(messageData.longitude && { longitude: messageData.longitude }),
        ...(messageData.address && { address: messageData.address }),
        ...(messageData.locationName && { locationName: messageData.locationName }),
        // 답장 관련
        ...(messageData.replyToMessageId && { replyToMessageId: messageData.replyToMessageId }),
        ...(messageData.replyToContent && { replyToContent: messageData.replyToContent }),
        ...(messageData.replyToSender && { replyToSender: messageData.replyToSender }),
        // 전달 관련
        isForwarded: messageData.isForwarded || false,
        ...(messageData.originalMessageId && { originalMessageId: messageData.originalMessageId }),
        forwardCount: messageData.forwardCount || 0,
        // 링크 미리보기
        ...(messageData.linkUrl && { linkUrl: messageData.linkUrl }),
        ...(messageData.linkTitle && { linkTitle: messageData.linkTitle }),
        ...(messageData.linkDescription && { linkDescription: messageData.linkDescription }),
        ...(messageData.linkImageUrl && { linkImageUrl: messageData.linkImageUrl })
      }

      // STOMP 헤더 설정 (백엔드에서 Chat-Room-Id 헤더를 확인함)
      const headers = {
        'Chat-Room-Id': roomId
      }

      console.log(`📤 [WebSocket] 메시지 전송 (${destination}):`, message)
      console.log(`📤 [WebSocket] 헤더:`, headers)

      this.client.publish({
        destination: destination,
        headers: headers,
        body: JSON.stringify(message)
      })

      return Promise.resolve()

    } catch (error) {
      console.error(`❌ [WebSocket] 메시지 전송 실패 (Room: ${roomId}):`, error)
      throw error
    }
  }

  // 채팅방 나가기
  async leaveChatRoom(roomId) {
    try {
      if (!this.isConnected()) {
        console.warn('⚠️ [WebSocket] 연결되지 않아 채팅방을 나갈 수 없습니다')
        return
      }

      const destination = this.destinations.leaveRoom // /app/chat/leave

      // STOMP 헤더에 채팅방 ID 설정
      const headers = {
        'Chat-Room-Id': roomId
      }

      console.log(`🚪 [WebSocket] 채팅방 나가기 (${destination}):`, { roomId })

      this.client.publish({
        destination: destination,
        headers: headers,
        body: JSON.stringify({}) // 빈 본문
      })

      // 구독도 함께 해제
      this.unsubscribeFromChatRoom(roomId)

    } catch (error) {
      console.error(`❌ [WebSocket] 채팅방 나가기 실패 (Room: ${roomId}):`, error)
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

      const destination = this.destinations.sendTyping // /app/typing
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
    return this.subscriptions.has(`chatroom-${roomId}`)
  }

  // 채팅방 입장 (구독 + 백엔드 알림)
  async enterChatRoom(roomId, messageHandler) {
    try {
      console.log(`🚪 [WebSocket] 채팅방 입장: ${roomId}`)

      // 1. 채팅방 토픽 구독
      await this.subscribeToChatRoom(roomId, messageHandler)

      // 2. 백엔드에 입장 알림 (첫 메시지 전송 시 자동 처리됨)
      // ChatStompController에서 Chat-Room-Id 헤더가 있으면 자동으로 enterChatRoom 호출

      console.log(`✅ [WebSocket] 채팅방 입장 완료: ${roomId}`)

    } catch (error) {
      console.error(`❌ [WebSocket] 채팅방 입장 실패 (Room: ${roomId}):`, error)
      throw error
    }
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
      subscriptions: Array.from(this.subscriptions.keys()),
      handlersCount: this.messageHandlers.size,
      handlers: Array.from(this.messageHandlers.keys()),
      globalHandlersCount: this.globalHandlers.size,
      globalHandlers: Array.from(this.globalHandlers.keys()),
      connectionState: this.connectionState,
      deviceInfo: this.getDeviceInfo(),
      userId: this.getCurrentUserId(),
      deviceId: this.getDeviceId(),
      reconnectAttempts: this.reconnectAttempts,
      topics: this.topics,
      destinations: this.destinations,
      clientState: this.client ? {
        connected: this.client.connected,
        webSocketState: this.client.webSocket?.readyState
      } : null,
      baseURL: this.baseURL
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
      const testDestination = this.destinations.ping // /app/ping
      this.client.publish({
        destination: testDestination,
        body: JSON.stringify({
          type: 'ping',
          timestamp: Date.now(),
          userId: this.getCurrentUserId(),
          deviceId: this.getDeviceId()
        })
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

  // 백엔드 토픽 구조 확인용 디버그 메서드
  debugTopicStructure() {
    const userId = this.getCurrentUserId()
    const deviceId = this.getDeviceId()

    console.group('🔍 [WebSocket] 백엔드 토픽 구조 디버그')

    console.log('=== 토픽 설정 ===')
    console.log('채팅방 토픽 prefix:', this.topics.chatRoomPrefix)
    console.log('개인 큐 prefix:', this.topics.userDevicePrefix)
    console.log('시스템 알림 토픽:', this.topics.systemNotification)
    console.log('온라인 사용자 토픽:', this.topics.onlineUsers)

    console.log('=== Destination 설정 ===')
    console.log('메시지 전송:', this.destinations.sendMessage)
    console.log('채팅방 나가기:', this.destinations.leaveRoom)
    console.log('타이핑 전송:', this.destinations.sendTyping)
    console.log('핑 전송:', this.destinations.ping)

    if (userId && deviceId) {
      console.log('=== 사용자별 구독 토픽 ===')
      console.log('메시지 큐:', this.getUserDeviceQueue(userId, deviceId, 'messages'))
      console.log('헤드업 큐:', this.getUserDeviceQueue(userId, deviceId, 'headsup'))
      console.log('알림 큐:', this.getUserDeviceQueue(userId, deviceId, 'notifications'))
      console.log('상태 큐:', this.getUserDeviceQueue(userId, deviceId, 'status'))
      console.log('사용자 알림 토픽:', this.getUserNotificationTopic(userId))
    }

    console.log('=== 예시 채팅방 토픽 ===')
    console.log('채팅방 123:', this.getChatRoomTopic('123'))
    console.log('채팅방 456:', this.getChatRoomTopic('456'))

    console.groupEnd()
  }
}

// 싱글톤 인스턴스 생성
export const webSocketService = new WebSocketService()

// 연결 상태 모니터링 시작
webSocketService.startConnectionMonitoring()

// 🔥 개발 도구에서 WebSocket 상태 확인 (브라우저 콘솔에서 실행 가능)
if (typeof window !== 'undefined') {
  window.debugWebSocket = () => {
    console.log('WebSocket Debug Info:', webSocketService.getDebugInfo())
    webSocketService.testConnection()
  }

  window.webSocketService = webSocketService // 디버깅용
}

// 기본 내보내기
export default webSocketService