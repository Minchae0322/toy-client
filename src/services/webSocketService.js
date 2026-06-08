// services/webSocketService.js
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import * as authUtils from '@/utils/auth.js'
import { ENV } from '@/config/env.js'

class WebSocketService {
  constructor() {
    this.client = null
    this.connected = false
    this.connecting = false
    this.subscriptions = new Map()
    this.messageHandlers = new Map()
    this.globalHandlers = new Map()

    this.baseURL = ENV.CHAT_BASE_URL
    this.wsURL = ENV.WS_URL

    console.log('🔌 [WebSocket] Base URL:', this.baseURL)
    console.log('🔌 [WebSocket] WS URL:', this.wsURL)

    this.connectionState = {
      connected: false,
      connecting: false,
      status: 'disconnected',
      error: null
    }
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000

    // 이 소켓 세션을 인증한 토큰과 그 토큰에서 추출한 userId.
    // 모든 개인 큐 구독 경로는 sessionUserId 기준으로 만들어 세션 신원과 일치시킨다.
    this.sessionToken = null
    this.sessionUserId = null

    this.topics = {
      chatRoomPrefix: '/topic/chatroom',
      userDevicePrefix: '/user',
      systemNotification: '/topic/system/notifications',
      onlineUsers: '/topic/online-users'
    }

    this.destinations = {
      sendMessage: '/app/chat/send',
      leaveRoom: '/app/chat/leave',
      sendTyping: '/app/chat/typing',
      ping: '/app/ping'
    }
  }

  // ==================== 토픽 헬퍼 메서드 ====================

  getChatRoomTopic(roomId) {
    return `${this.topics.chatRoomPrefix}/${roomId}`
  }

  getUserDeviceQueue(userId, deviceId, queueType) {
    return `${this.topics.userDevicePrefix}/${userId}/device/${deviceId}/queue/${queueType}`
  }

  getUserNotificationTopic(userId) {
    return `/topic/user/${userId}/notifications`
  }

  // ==================== 인증 관련 ====================

  getAuthToken() {
    return authUtils.getAccessToken()
  }

  getDeviceId() {
    return authUtils.getDeviceId()
  }

  getCurrentUserId() {
    return authUtils.getUserId()
  }

  // 토큰(JWT)에서 직접 userId 추출 — 소켓을 인증한 신원과 구독 경로의 신원을 일치시키기 위함.
  // user_info(localStorage) 는 토큰과 별개 시점에 갱신되어 계정 전환 시 drift 가능하므로
  // 개인 큐 구독 경로는 반드시 "소켓을 인증한 그 토큰"의 userId 로 만든다.
  getTokenUserId(token) {
    const payload = authUtils.parseJwtToken(token)
    return payload?.userId ?? payload?.sub ?? null
  }

  // 현재 저장된 토큰이 이 소켓 세션을 인증한 토큰과 다른 유저인지 확인
  isStaleSession() {
    if (!this.sessionUserId) return false
    const currentId = this.getTokenUserId(this.getAuthToken())
    return currentId != null && String(currentId) !== String(this.sessionUserId)
  }

  // ==================== 연결 상태 관리 ====================

  getConnectionState() {
    return this.connectionState
  }

  updateConnectionState(status, error = null) {
    this.connectionState = {
      connected: status === 'connected',
      connecting: status === 'connecting',
      status: status,
      error: error
    }
    this.notifyConnectionChange(status === 'connected')
  }

  onConnectionChange(callback) {
    // 다중 리스너 지원
    const callbacks = this.globalHandlers.get('connection-change') || []
    callbacks.push(callback)
    this.globalHandlers.set('connection-change', callbacks)

    // 리스너 제거 함수 반환
    return () => {
      const current = this.globalHandlers.get('connection-change') || []
      const index = current.indexOf(callback)
      if (index > -1) current.splice(index, 1)
    }
  }

  notifyConnectionChange(connected) {
    const callbacks = this.globalHandlers.get('connection-change') || []
    callbacks.forEach(callback => {
      try {
        callback(connected)
      } catch (e) {
        console.error('❌ [WebSocket] 연결 상태 콜백 오류:', e)
      }
    })
  }

  onMessage(type, handler) {
    this.globalHandlers.set(type, handler)
  }

  offMessage(type) {
    this.globalHandlers.delete(type)
  }

  isConnected() {
    return this.connected &&
        this.client?.connected &&
        this.client?.webSocket?.readyState === WebSocket.OPEN
  }

  // ==================== 디바이스 정보 ====================

  getDeviceType() {
    const ua = navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'TABLET'
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'MOBILE'
    return 'WEB'
  }

  getDeviceInfo() {
    return {
      deviceType: this.getDeviceType(),
      deviceId: this.getDeviceId()
    }
  }

  // ==================== WebSocket 연결 ====================

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        console.log('🔌 [WebSocket] 이미 연결됨')
        resolve()
        return
      }

      if (this.connecting) {
        this.waitForConnection(resolve, reject)
        return
      }

      const token = this.getAuthToken()
      if (!token) {
        const error = new Error('인증 토큰이 없습니다')
        this.updateConnectionState('error', error.message)
        reject(error)
        return
      }

      // 이 세션의 신원을 "지금 인증에 쓰는 토큰"으로 고정.
      // 구독 경로(subscribeToEssentialTopics)와 X-User-Id 모두 이 값을 사용한다.
      const sessionUserId = this.getTokenUserId(token)
      this.sessionToken = token
      this.sessionUserId = sessionUserId

      this.connecting = true
      this.updateConnectionState('connecting')

      if (this.client) {
        try { this.client.deactivate() } catch (e) { /* ignore */ }
      }

      const socketUrl = this.wsURL
      console.log('🔌 [WebSocket] Connecting to:', socketUrl)

      // JSONP transport 차단 — 서버 chat-service 가 application/javascript Content-Type 으로 응답할 때
      // Spring 이 LinkedHashMap 직렬화 못 해서 HttpMessageNotWritableException 워닝 발생.
      // websocket 우선, fallback 은 xhr 계열만 허용.
      const socket = new SockJS(socketUrl, null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling']
      })

      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          'Authorization': `Bearer ${token}`,
          'X-Device-Id': this.getDeviceId(),
          // user_info 가 아닌 토큰에서 뽑은 userId 사용 — 세션 신원과 항상 일치
          'X-User-Id': String(sessionUserId || '')
        },
        debug: (str) => {
          if (ENV.DEV) console.log('🔌 [STOMP]', str)
        },
        // STOMP 내장 자동 재연결 비활성화 — 끊긴 client 가 옛 connectHeaders(이전 유저 JWT)를
        // 그대로 재사용해 재연결하면 계정 전환 후 세션 신원이 고착된다.
        // 재연결은 attemptReconnect()/모니터링이 connect() 를 새로 호출해 항상 최신 토큰으로 처리.
        reconnectDelay: 0,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        onConnect: () => {
          console.log('✅ [WebSocket] 연결 성공')
          this.connected = true
          this.connecting = false
          this.reconnectAttempts = 0
          this.updateConnectionState('connected')
          this.subscribeToEssentialTopics()
          this.restoreSubscriptions()
          resolve()
        },

        onStompError: (frame) => {
          console.error('❌ [WebSocket] STOMP 에러:', frame)
          this.connected = false
          this.connecting = false
          this.updateConnectionState('error', frame.body || 'STOMP Error')
          reject(new Error(frame.body || 'STOMP Error'))
        },

        onWebSocketError: (error) => {
          console.error('❌ [WebSocket] 연결 에러:', error)
          this.connected = false
          this.connecting = false
          this.updateConnectionState('error', error.message)
          reject(error)
        },

        onWebSocketClose: (event) => {
          console.log('🔌 [WebSocket] 연결 종료:', event.code)
          this.connected = false
          this.connecting = false
          this.updateConnectionState('disconnected')
          if (event.code !== 1000) this.attemptReconnect()
        }
      })

      const timeout = setTimeout(() => {
        if (this.connecting) {
          this.connecting = false
          this.updateConnectionState('error', '연결 시간 초과')
          try { this.client.deactivate() } catch (e) { /* ignore */ }
          reject(new Error('연결 시간 초과'))
        }
      }, 20000)

      const originalOnConnect = this.client.onConnect
      this.client.onConnect = (frame) => {
        clearTimeout(timeout)
        originalOnConnect(frame)
      }

      this.client.activate()
    })
  }

  waitForConnection(resolve, reject) {
    const check = () => {
      if (this.isConnected()) resolve()
      else if (!this.connecting) reject(new Error('연결 실패'))
      else setTimeout(check, 100)
    }
    setTimeout(() => { if (this.connecting) reject(new Error('연결 시간 초과')) }, 20000)
    check()
  }

  async ensureConnection() {
    // 살아있는 소켓이라도 그 사이 계정이 바뀌었으면(현재 토큰의 userId ≠ 세션 userId)
    // 옛 신원으로 붙어있는 것이므로 강제로 재연결한다.
    if (this.isConnected()) {
      if (this.isStaleSession()) {
        console.warn('⚠️ [WebSocket] 세션 신원 불일치 감지 → 재연결')
        return this.reconnect()
      }
      return
    }
    if (this.connecting) return this.waitForConnection(() => {}, () => {})
    return this.connect()
  }

  // ==================== 필수 토픽 구독 ====================

  async subscribeToEssentialTopics() {
    // 반드시 소켓을 인증한 토큰의 userId(sessionUserId)로 구독.
    // getCurrentUserId()(user_info) 를 쓰면 계정 전환 직후 세션(토큰)과 경로가 어긋나
    // 서버가 INVALID_DESTINATION("잘못된 채팅방 주소") 로 거부한다.
    const userId = this.sessionUserId ?? this.getTokenUserId(this.getAuthToken())
    const deviceId = this.getDeviceId()

    if (!userId || !deviceId) {
      console.warn('⚠️ [WebSocket] userId/deviceId 없음')
      return
    }

    try {
      const queues = ['messages', 'headsup', 'notifications', 'status']
      for (const queue of queues) {
        const dest = this.getUserDeviceQueue(userId, deviceId, queue)
        await this.subscribeToQueue(queue, dest)
      }

      await this.subscribeToTopic('system', this.topics.systemNotification)
      await this.subscribeToTopic('online-users', this.topics.onlineUsers)

      console.log('✅ [WebSocket] 필수 토픽 구독 완료')
    } catch (error) {
      console.error('❌ [WebSocket] 필수 토픽 구독 실패:', error)
    }
  }

  async subscribeToQueue(name, destination) {
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body)
        console.log(`📨 [${name}] 수신:`, data)

        const handler = this.globalHandlers.get(name)
        if (handler) handler(data)

        this.handleQueueMessage(name, data)
      } catch (e) {
        console.error(`❌ [${name}] 파싱 에러:`, e)
      }
    })

    this.subscriptions.set(`queue-${name}`, subscription)
    console.log(`✅ [WebSocket] ${name} 구독: ${destination}`)
  }

  async subscribeToTopic(name, destination) {
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body)
        console.log(`📨 [${name}] 수신:`, data)

        const handler = this.globalHandlers.get(name)
        if (handler) handler(data)
      } catch (e) {
        console.error(`❌ [${name}] 파싱 에러:`, e)
      }
    })

    this.subscriptions.set(`topic-${name}`, subscription)
    console.log(`✅ [WebSocket] ${name} 구독: ${destination}`)
  }

  handleQueueMessage(queueType, data) {
    switch (queueType) {
      case 'messages':
        console.log('💬 개인 메시지:', data)
        break
      case 'headsup':
        console.log('🚨 헤드업 알림:', data)
        break
      case 'notifications':
        console.log('🔔 알림:', data)
        break
      case 'status':
        console.log('📊 상태 업데이트:', data)
        break
    }
  }

  // ==================== 채팅방 구독 ====================

  async subscribeToChatRoom(roomId, messageHandler) {
    await this.ensureConnection()

    const key = `chatroom-${roomId}`
    if (this.subscriptions.has(key)) {
      console.log(`📨 [WebSocket] 이미 구독 중: ${roomId}`)
      return
    }

    if (messageHandler) {
      this.messageHandlers.set(roomId, messageHandler)
    }

    const destination = this.getChatRoomTopic(roomId)
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body)
        console.log(`📨 [채팅방 ${roomId}] 수신:`, data)

        const handler = this.messageHandlers.get(roomId)
        if (handler) handler(data)

        const globalHandler = this.globalHandlers.get('chat-message')
        if (globalHandler) globalHandler(data, roomId)
      } catch (e) {
        console.error('❌ 메시지 파싱 에러:', e)
      }
    })

    this.subscriptions.set(key, subscription)
    console.log(`✅ [WebSocket] 채팅방 구독: ${destination}`)
  }

  unsubscribeFromChatRoom(roomId) {
    const key = `chatroom-${roomId}`
    const subscription = this.subscriptions.get(key)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(key)
      this.messageHandlers.delete(roomId)
      console.log(`📨 [WebSocket] 채팅방 구독 해제: ${roomId}`)
    }
  }

  // ==================== 메시지 전송 ====================

  async sendMessage(roomId, messageData) {
    await this.ensureConnection()

    const message = {
      roomId: roomId,
      actionType: messageData.messageType || messageData.actionType || 'TEXT',
      actorUserId: this.sessionUserId ?? this.getCurrentUserId(),
      messageContent: messageData.content || messageData.messageContent,
      additionalData: messageData.additionalData || {},
      ...(messageData.fileUrl && { fileUrl: messageData.fileUrl }),
      ...(messageData.fileName && { fileName: messageData.fileName }),
      ...(messageData.fileSize && { fileSize: messageData.fileSize }),
      ...(messageData.mimeType && { mimeType: messageData.mimeType }),
      ...(messageData.thumbnailUrl && { thumbnailUrl: messageData.thumbnailUrl }),
      ...(messageData.replyToMessageId && { replyToMessageId: messageData.replyToMessageId }),
      isForwarded: messageData.isForwarded || false,
      forwardCount: messageData.forwardCount || 0
    }

    const headers = { 'Chat-Room-Id': roomId }

    console.log(`📤 [WebSocket] 메시지 전송:`, message)

    this.client.publish({
      destination: this.destinations.sendMessage,
      headers: headers,
      body: JSON.stringify(message)
    })
  }

  // ==================== 채팅방 나가기 ====================

  async leaveChatRoom(roomId) {
    if (!this.isConnected()) return

    this.client.publish({
      destination: this.destinations.leaveRoom,
      headers: { 'Chat-Room-Id': roomId },
      body: JSON.stringify({})
    })

    this.unsubscribeFromChatRoom(roomId)
    console.log(`🚪 [WebSocket] 채팅방 나가기: ${roomId}`)
  }

  // ==================== 타이핑 상태 ====================

  async sendTypingStatus(roomId, isTyping) {
    if (!this.isConnected()) return

    this.client.publish({
      destination: this.destinations.sendTyping,
      body: JSON.stringify({
        roomId: roomId,
        userId: this.sessionUserId ?? this.getCurrentUserId(),
        isTyping: isTyping,
        timestamp: new Date().toISOString()
      })
    })
  }

  // ==================== 채팅방 입장 ====================

  async enterChatRoom(roomId, messageHandler) {
    console.log(`🚪 [WebSocket] 채팅방 입장: ${roomId}`)
    await this.subscribeToChatRoom(roomId, messageHandler)
  }

  // ==================== 재연결 ====================

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [WebSocket] 최대 재연결 횟수 초과')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`🔄 [WebSocket] ${delay}ms 후 재연결 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      if (!this.isConnected()) {
        this.connect().catch(() => this.attemptReconnect())
      }
    }, delay)
  }

  restoreSubscriptions() {
    this.subscriptions.forEach((_, key) => {
      if (key.startsWith('chatroom-')) {
        const roomId = key.replace('chatroom-', '')
        const handler = this.messageHandlers.get(roomId)
        this.subscriptions.delete(key)
        this.subscribeToChatRoom(roomId, handler)
      }
    })
  }

  // ==================== 연결 해제 ====================

  disconnect() {
    this.connecting = false
    this.connected = false

    if (this.client) {
      this.subscriptions.forEach((sub) => {
        try { sub.unsubscribe() } catch (e) { /* ignore */ }
      })
      this.subscriptions.clear()
      this.messageHandlers.clear()

      try { this.client.deactivate() } catch (e) { /* ignore */ }
      this.client = null
    }

    // 세션 신원 초기화 — 다음 connect() 가 최신 토큰으로 다시 고정한다.
    this.sessionToken = null
    this.sessionUserId = null

    this.updateConnectionState('disconnected')
    console.log('✅ [WebSocket] 연결 해제 완료')
  }

  async reconnect() {
    this.disconnect()
    await new Promise(r => setTimeout(r, 1000))
    return this.connect()
  }

  // ==================== 유틸리티 ====================

  isSubscribedTo(roomId) {
    return this.subscriptions.has(`chatroom-${roomId}`)
  }

  unsubscribeAll() {
    this.subscriptions.forEach((sub) => {
      try { sub.unsubscribe() } catch (e) { /* ignore */ }
    })
    this.subscriptions.clear()
    this.messageHandlers.clear()
  }

  getDebugInfo() {
    return {
      connected: this.isConnected(),
      connecting: this.connecting,
      baseURL: this.baseURL,
      wsURL: this.wsURL,
      subscriptions: Array.from(this.subscriptions.keys()),
      handlers: Array.from(this.messageHandlers.keys()),
      topics: this.topics,
      destinations: this.destinations,
      userId: this.getCurrentUserId(),
      sessionUserId: this.sessionUserId,
      staleSession: this.isStaleSession(),
      deviceId: this.getDeviceId(),
      deviceType: this.getDeviceType()
    }
  }

  startConnectionMonitoring() {
    setInterval(() => {
      const was = this.connectionState.connected
      const now = this.isConnected()

      // 살아있는 소켓이지만 계정이 바뀐 경우 backstop 으로 재연결
      if (now && this.isStaleSession()) {
        console.warn('⚠️ [WebSocket] 모니터링: 세션 신원 불일치 → 재연결')
        this.reconnect().catch(() => {})
        return
      }

      if (was && !now) {
        this.updateConnectionState('disconnected')
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect()
        }
      }
    }, 5000)
  }
}

export const webSocketService = new WebSocketService()
webSocketService.startConnectionMonitoring()

if (typeof window !== 'undefined') {
  window.webSocketService = webSocketService
  window.debugWebSocket = () => console.log(webSocketService.getDebugInfo())
}

export default webSocketService