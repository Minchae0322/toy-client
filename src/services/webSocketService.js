// services/webSocketService.js
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import * as authUtils from '@/utils/auth.js'
import { STORAGE_KEYS } from '@/utils/auth.js'
import { ENV, API_URLS } from '@/config/env.js'

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
    // 재연결 정책 (Slack/Discord/WhatsApp 류 표준)
    //  - 절대 영구 포기하지 않는다: 상한(capped) 지수 백오프 + 지터(jitter)로 무한 재시도
    //  - shouldConnect: "연결돼 있어야 하는가"(사용자 인텐트). 로그아웃/백그라운드 disconnect 시 false
    //    → 의도적으로 끊은 동안에는 자동 재연결하지 않는다
    this.shouldConnect = false
    this.reconnecting = false           // 재연결 타이머 예약 중 가드 (중복 타이머 방지)
    this.reconnectTimer = null
    this.reconnectAttempts = 0
    this.baseReconnectDelay = 1000      // 첫 백오프 1s
    this.maxReconnectDelay = 30000      // 상한 30s — 이 이상 길어지지 않음

    // 이 소켓 세션을 인증한 토큰과 그 토큰에서 추출한 userId.
    // 모든 개인 큐 구독 경로는 sessionUserId 기준으로 만들어 세션 신원과 일치시킨다.
    this.sessionToken = null
    this.sessionUserId = null

    // 동시 연결/대기 정리용 — disconnect 시 모두 reject 시켜 promise hanging 방지
    this.pendingConnectPromises = []
    // startConnectionMonitoring 의 setInterval handle (HMR / 정리용)
    this.monitorIntervalId = null
    // connect() 의 timeout handle — 모든 종료 경로에서 clear 위해 인스턴스 레벨에 보관
    this.connectTimeoutId = null

    // ── 자동 회복 / 진단 ────────────────────────────────────────────────
    // everConnected: 이 세션에서 단 한 번이라도 STOMP onConnect 가 불렸는지.
    //   false 상태로 누적 실패가 쌓이면 "한 번도 못 붙은 단말" → 자동 회복 트리거.
    this.everConnected = false
    // 텔레메트리 1회 전송 가드 (사용자 단말 영구 실패 케이스 분석용)
    this.diagnosticsSent = false
    // 영구 실패 콜백 — 외부에서 HTTP 폴링 fallback 등으로 전환 가능
    this.permanentFailureCalled = false

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

    // ── 전송 확인 & stop-and-wait 전송 큐 ────────────────────────────────
    // 서버 접수 ack(/topic/user/{id}/ack)가 오기 전에는 다음 메시지를 publish 하지 않는다.
    // 같은 발신자의 연속 메시지가 서버 스레드풀에서 역전되는 것을 원천 차단 —
    // 동시에 서버에 떠 있는 "내 메시지"가 항상 1개가 되기 때문.
    // UI 는 큐와 무관하게 즉시 말풍선을 그리므로(낙관적 렌더링) 사용자 체감 지연은 없다.
    this.sendQueue = []            // 발신 대기: { roomId, message, clientMessageId, resolve, reject }
    this.sendingInFlight = false   // 접수 ack 대기 중인 전송 존재 여부
    this.pendingAcks = new Map()   // clientMessageId → { item, timer }
    this.ackTimeoutMs = 10000      // ack 유실 대비 — 초과 시 실패 처리 후 큐 계속 진행
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

      // 연결 인텐트 ON — 이후 끊기면 자동 재연결 대상이 된다
      this.shouldConnect = true

      this.connecting = true
      this.updateConnectionState('connecting')

      if (this.client) {
        try { this.client.deactivate() } catch (e) { /* ignore */ }
      }

      const socketUrl = this.wsURL
      console.log('🔌 [WebSocket] Connecting to:', socketUrl)

      // JSONP transport 차단 — 서버 chat-service 가 application/javascript Content-Type 으로 응답할 때
      // Spring 이 LinkedHashMap 직렬화 못 해서 HttpMessageNotWritableException 워닝 발생.
      // 시도 횟수에 따라 transport 조합을 회전 — WS 가 막힌 단말(회사망/WebView/CloudFront 미설정 등)
      // 에서도 xhr 계열로 떨어져서 자동 회복 가능.
      const transports = this.getTransportsForAttempt(this.reconnectAttempts)
      console.log('🔌 [WebSocket] Transports:', transports)
      const socket = new SockJS(socketUrl, null, { transports })

      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          'Authorization': `Bearer ${token}`,
          'X-Device-Id': this.getDeviceId(),
          // user_info 가 아닌 토큰에서 뽑은 userId 사용 — 세션 신원과 항상 일치
          'X-User-Id': String(sessionUserId || '')
        },
        debug: (str) => {
          // prod 환경에서도 운영 진단이 필요한 사용자만 toggle 가능:
          //   localStorage.setItem('ws-debug', '1') 후 재접속
          if (ENV.DEV || this.isDebugEnabled()) console.log('🔌 [STOMP]', str)
        },
        // STOMP 내장 자동 재연결 비활성화 — 끊긴 client 가 옛 connectHeaders(이전 유저 JWT)를
        // 그대로 재사용해 재연결하면 계정 전환 후 세션 신원이 고착된다.
        // 재연결은 attemptReconnect()/모니터링이 connect() 를 새로 호출해 항상 최신 토큰으로 처리.
        reconnectDelay: 0,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        onConnect: () => {
          this.clearConnectTimeout()
          console.log('✅ [WebSocket] 연결 성공')
          this.connected = true
          this.connecting = false
          this.reconnectAttempts = 0
          // 한 번이라도 붙은 단말은 회복 로직 트리거 대상에서 제외 (사이드 이펙트 0)
          this.everConnected = true
          this.permanentFailureCalled = false
          this.updateConnectionState('connected')
          this.subscribeToEssentialTopics()
          this.restoreSubscriptions()
          this.resolvePendingConnects()
          resolve()
        },

        onStompError: (frame) => {
          this.clearConnectTimeout()
          console.error('❌ [WebSocket] STOMP 에러:', frame)
          this.connected = false
          this.connecting = false
          const body = frame?.body || ''
          this.updateConnectionState('error', body || 'STOMP Error')
          // 인증 실패(만료된 토큰) → 자동 재연결 중단. 토큰 갱신은 상위(interceptor) 에서
          if (this.isAuthError(body) || this.isAuthError(frame?.headers?.message)) {
            console.warn('🔐 [WebSocket] 인증 실패 — 자동 재연결 중단. 새 토큰 받은 후 다시 connect() 호출 필요')
            this.shouldConnect = false
            this.resetReconnect()
          }
          const err = new Error(body || 'STOMP Error')
          this.rejectPendingConnects(err)
          reject(err)
        },

        onWebSocketError: (error) => {
          this.clearConnectTimeout()
          console.error('❌ [WebSocket] 연결 에러:', error)
          this.connected = false
          this.connecting = false
          const err = error instanceof Error
            ? error
            : new Error(error?.message || String(error) || 'WebSocket Error')
          this.updateConnectionState('error', err.message)
          this.rejectPendingConnects(err)
          reject(err)
        },

        onWebSocketClose: (event) => {
          this.clearConnectTimeout()
          console.log('🔌 [WebSocket] 연결 종료:', event?.code)
          this.connected = false
          this.connecting = false
          this.updateConnectionState('disconnected')
          // 정상 종료(1000) 또는 의도적 disconnect 가 아니면 재연결
          if (event?.code !== 1000 && this.shouldConnect) this.attemptReconnect()
        }
      })

      this.connectTimeoutId = setTimeout(() => {
        if (this.connecting) {
          this.connecting = false
          this.updateConnectionState('error', '연결 시간 초과')
          try { this.client.deactivate() } catch (e) { /* ignore */ }
          const err = new Error('연결 시간 초과')
          this.rejectPendingConnects(err)
          reject(err)
        }
        this.connectTimeoutId = null
      }, 20000)

      this.client.activate()
    })
  }

  waitForConnection(resolve, reject) {
    // poll 핸들 + 전체 timeout 핸들을 둘 다 추적해 어느 한쪽이 끝나면 다른 쪽 취소.
    // settled 가드로 resolve/reject 중복 호출 방지 (이전 구현은 timeout 후에도 poll 이 계속 돌았음).
    let settled = false
    let pollHandle = null
    let timeoutHandle = null

    const cleanup = () => {
      if (pollHandle) { clearTimeout(pollHandle); pollHandle = null }
      if (timeoutHandle) { clearTimeout(timeoutHandle); timeoutHandle = null }
      this.pendingConnectPromises = this.pendingConnectPromises.filter(p => p.token !== token)
    }
    const doResolve = () => {
      if (settled) return
      settled = true
      cleanup()
      resolve()
    }
    const doReject = (err) => {
      if (settled) return
      settled = true
      cleanup()
      reject(err)
    }
    const token = { reject: doReject }

    const check = () => {
      if (settled) return
      if (this.isConnected()) doResolve()
      else if (!this.connecting) doReject(new Error('연결 실패'))
      else pollHandle = setTimeout(check, 100)
    }
    timeoutHandle = setTimeout(() => {
      if (!settled && this.connecting) doReject(new Error('연결 시간 초과'))
    }, 20000)
    // disconnect() 호출 시 일괄 reject 가능하도록 pending list 에 등록
    this.pendingConnectPromises.push(token)
    check()
  }

  // STOMP ERROR frame body / header.message 에서 인증 실패 시그널 판별
  // 서버가 401/403 을 STOMP ERROR frame 으로 변환해 보내는 경우 본문에 키워드가 있음
  isAuthError(text) {
    if (!text) return false
    const t = String(text).toLowerCase()
    return t.includes('unauthorized') || t.includes('401') ||
      t.includes('forbidden') || t.includes('403') ||
      t.includes('jwt') || t.includes('expired') ||
      t.includes('invalid token') || t.includes('authentication')
  }

  clearConnectTimeout() {
    if (this.connectTimeoutId) {
      clearTimeout(this.connectTimeoutId)
      this.connectTimeoutId = null
    }
  }

  // 연결 성공 시: 대기 중인 waitForConnection 들이 다음 poll tick 에서 자연스럽게 resolve 됨.
  // 별도 호출 안 해도 되지만 즉시 끝내려면 cleanup 해도 무방
  resolvePendingConnects() {
    // no-op — poll 이 알아서 isConnected() 보고 resolve
  }

  // disconnect 등으로 강제 종료 시: 모든 대기 promise 를 즉시 reject
  rejectPendingConnects(err) {
    const list = this.pendingConnectPromises
    this.pendingConnectPromises = []
    list.forEach(p => { try { p.reject(err) } catch (e) { /* ignore */ } })
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
    // 여기까지 왔다는 건 "지금 붙어야 함"이라는 강한 신호(채팅 진입/메시지 전송 등).
    // 백오프 대기 중이어도 취소하고 즉시 연결을 시도한다.
    this.resetReconnect()
    // 이미 연결 진행 중이면 그 시도가 끝날 때까지 실제로 기다린다(awaitable).
    if (this.connecting) {
      return new Promise((resolve, reject) => this.waitForConnection(resolve, reject))
    }
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
      await this.subscribeToAckChannels(userId)

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

  // ==================== 접수 ack / 실패 채널 ====================

  // 서버의 전송 확인 계층: 접수 ack(발행 큐 진입) → 에코(파이프라인 완주) → SEND_FAILURE(발행 실패)
  // ack 는 전송 큐의 다음 메시지 발사 트리거, 에코·실패는 말풍선 상태 확정용.
  async subscribeToAckChannels(userId) {
    const ackSub = this.client.subscribe(`/topic/user/${userId}/ack`, (message) => {
      try {
        const data = JSON.parse(message.body)
        this.handleSendAck(data)
        const handler = this.globalHandlers.get('message-ack')
        if (handler) handler(data)
      } catch (e) {
        console.error('❌ [ack] 파싱 에러:', e)
      }
    })
    this.subscriptions.set('topic-message-ack', ackSub)

    const errSub = this.client.subscribe(`/topic/user/${userId}/errors`, (message) => {
      try {
        const data = JSON.parse(message.body)
        this.handleSendError(data)
        const handler = this.globalHandlers.get('message-error')
        if (handler) handler(data)
      } catch (e) {
        console.error('❌ [errors] 파싱 에러:', e)
      }
    })
    this.subscriptions.set('topic-message-error', errSub)
  }

  handleSendAck(data) {
    const pending = this.pendingAcks.get(data?.clientMessageId)
    if (!pending) return
    clearTimeout(pending.timer)
    this.pendingAcks.delete(data.clientMessageId)
    pending.item.resolve(data)   // SendResult { messageId, sentAt, clientMessageId }
    this.sendingInFlight = false
    this.pumpSendQueue()
  }

  handleSendError(data) {
    // 접수 ack 이전에 온 실패(발행 즉시 실패)면 대기 중인 전송을 실패 처리하고 큐를 진행.
    // ack 이후에 온 실패(늦은 발행 실패)는 여기 매칭이 없고, 뷰가 'message-error' 핸들러로 처리.
    const pending = this.pendingAcks.get(data?.clientMessageId)
    if (!pending) return
    clearTimeout(pending.timer)
    this.pendingAcks.delete(data.clientMessageId)
    pending.item.reject(new Error(data?.reason || 'SEND_FAILURE'))
    this.sendingInFlight = false
    this.pumpSendQueue()
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

  // 말풍선 매칭 키 — 서버가 접수 ack·에코·SEND_FAILURE 에 그대로 반사해 돌려준다
  generateClientMessageId() {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    } catch { /* ignore */ }
    return `cmid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }

  /**
   * 메시지 전송 — stop-and-wait 큐 경유.
   * 반환 promise 는 서버 접수 ack(SendResult) 로 resolve, 실패/타임아웃으로 reject.
   * "접수"이지 최종 확정이 아니다 — 확정은 에코(채팅방 브로드캐스트)가 담당.
   */
  async sendMessage(roomId, messageData) {
    await this.ensureConnection()

    const clientMessageId = messageData.clientMessageId || this.generateClientMessageId()
    const message = {
      roomId: roomId,
      clientMessageId: clientMessageId,
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

    return new Promise((resolve, reject) => {
      this.sendQueue.push({ roomId, message, clientMessageId, resolve, reject })
      this.pumpSendQueue()
    })
  }

  // 큐 헤드를 publish 하고 접수 ack 를 기다린다. ack/실패/타임아웃이 다음 발사를 트리거.
  pumpSendQueue() {
    if (this.sendingInFlight) return
    const item = this.sendQueue.shift()
    if (!item) return

    // ensureConnection 통과해도 publish 직전 race 로 client 가 끊길 수 있음
    if (!this.client || !this.client.connected) {
      item.reject(new Error('메시지 전송 실패: 연결 끊김'))
      this.pumpSendQueue()
      return
    }

    console.log(`📤 [WebSocket] 메시지 전송:`, item.message)
    try {
      this.client.publish({
        destination: this.destinations.sendMessage,
        headers: { 'Chat-Room-Id': item.roomId },
        body: JSON.stringify(item.message)
      })
    } catch (e) {
      console.error('❌ [WebSocket] publish 실패:', e)
      item.reject(e)
      this.pumpSendQueue()
      return
    }

    this.sendingInFlight = true
    const timer = setTimeout(() => {
      this.pendingAcks.delete(item.clientMessageId)
      this.sendingInFlight = false
      item.reject(new Error('접수 응답 시간 초과'))
      this.pumpSendQueue()
    }, this.ackTimeoutMs)
    this.pendingAcks.set(item.clientMessageId, { item, timer })
  }

  // 연결 해제 등으로 큐/대기 전송을 일괄 실패 처리
  flushSendQueue(err) {
    this.pendingAcks.forEach(({ item, timer }) => {
      clearTimeout(timer)
      try { item.reject(err) } catch { /* ignore */ }
    })
    this.pendingAcks.clear()
    const queued = this.sendQueue
    this.sendQueue = []
    queued.forEach(item => { try { item.reject(err) } catch { /* ignore */ } })
    this.sendingInFlight = false
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

  // ── 사이드 이펙트 가드 ────────────────────────────────────────────────
  // 모든 자동 회복은 "이 세션에서 한 번도 STOMP onConnect 가 불리지 않은 단말"에만 적용.
  // 즉 평상시 잘 붙던 사용자에겐 트리거 자체가 안 됨.
  isDebugEnabled() {
    try { return localStorage.getItem('ws-debug') === '1' } catch { return false }
  }

  // SockJS transport 조합 — 5회 안에는 기존과 동일(잘 되는 사용자는 영향 0).
  // 10회 넘게 실패한 단말만 xhr 계열 우선/강제로 떨어트려 회복 시도.
  getTransportsForAttempt(attempt) {
    if (attempt < 5) return ['websocket', 'xhr-streaming', 'xhr-polling']
    if (attempt < 10) return ['xhr-streaming', 'xhr-polling', 'websocket']
    return ['xhr-polling']
  }

  // best-effort 텔레메트리 — endpoint 없어도 무해(에러 swallow), 1회만 보냄.
  // 트리거 조건: 한 번도 못 붙은 단말 + 임계 attempt 도달.
  sendDiagnosticsOnce(lastError) {
    if (this.diagnosticsSent) return
    if (this.everConnected) return
    this.diagnosticsSent = true
    try {
      const payload = {
        type: 'ws-fail',
        userId: this.sessionUserId ?? this.getCurrentUserId() ?? null,
        deviceId: this.getDeviceId(),
        ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        online: typeof navigator !== 'undefined' ? navigator.onLine : null,
        wsURL: this.wsURL,
        attempts: this.reconnectAttempts,
        lastError: lastError ? String(lastError).slice(0, 500) : null,
        ts: new Date().toISOString()
      }
      const url = `${API_URLS.AUTH}/diagnostics/ws-fail`
      // keepalive: 페이지 닫혀도 전송 보장. 4xx/5xx/네트워크 에러 모두 무시.
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {})
      console.log('🛰️ [WebSocket] 진단 텔레메트리 발신 시도(best-effort)')
    } catch { /* never throw */ }
  }

  // deviceId 1회 리셋 — 서버에 stale 등록된 단말 우회.
  // localStorage 마커로 영구 1회 제한 → 무한 리셋·다중 디바이스 생성 방지.
  tryDeviceIdResetOnce() {
    if (this.everConnected) return false
    try {
      if (localStorage.getItem('ws-device-reset') === '1') return false
      console.warn('🔧 [WebSocket] deviceId 1회 자동 리셋 — stale 단말 등록 우회 시도')
      localStorage.removeItem(STORAGE_KEYS.DEVICE_ID)
      localStorage.setItem('ws-device-reset', '1')
      // 다음 connect() 가 getDeviceId() 새로 호출하면서 새 ID 생성·저장됨
      return true
    } catch { return false }
  }

  // 영구 실패 진입 — 외부에서 HTTP 폴링 fallback 등으로 전환 가능.
  // 1회만 호출, everConnected 가 true 되면 다시 사용 가능.
  notifyPermanentFailureOnce(error) {
    if (this.permanentFailureCalled || this.everConnected) return
    this.permanentFailureCalled = true
    console.error('💀 [WebSocket] 영구 실패 모드 진입 — fallback 가능')
    const handler = this.globalHandlers.get('permanent-failure')
    if (typeof handler === 'function') {
      try { handler({ error, attempts: this.reconnectAttempts }) } catch { /* ignore */ }
    }
  }

  // 상한 지수 백오프 + 지터로 무한 재시도 (영구 포기 없음).
  // 유명 메신저(Slack/Discord/WhatsApp)와 동일하게, 끊긴 동안에는 계속 붙으려 시도하되
  // 백오프 상한(30s)과 jitter 로 서버 thundering-herd 를 피한다.
  attemptReconnect() {
    if (!this.shouldConnect) return        // 의도적으로 끊은 상태면 재연결하지 않음
    if (this.reconnecting) return          // 이미 타이머 예약됨
    if (this.isConnected() || this.connecting) return

    this.reconnecting = true
    this.reconnectAttempts++

    // ── 자동 회복: "한 번도 못 붙은 단말"만 트리거 (정상 사용자 영향 0) ──
    if (!this.everConnected) {
      if (this.reconnectAttempts === 3) {
        // attempt 3: deviceId stale 의심 → 1회 리셋
        this.tryDeviceIdResetOnce()
      }
      if (this.reconnectAttempts === 5) {
        // attempt 5: 진단 데이터 1회 전송 (best-effort)
        this.sendDiagnosticsOnce(this.connectionState?.error)
      }
      if (this.reconnectAttempts >= 15) {
        // attempt 15: HTTP 폴링 fallback 등 외부 전환 신호
        this.notifyPermanentFailureOnce(this.connectionState?.error)
      }
    }

    // equal jitter: cap/2 + random(0, cap/2) → 0ms 폭주 방지 + 분산
    const cap = Math.min(
      this.maxReconnectDelay,
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    )
    const delay = Math.round(cap / 2 + Math.random() * (cap / 2))

    console.log(`🔄 [WebSocket] ${delay}ms 후 재연결 시도 (#${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnecting = false
      this.reconnectTimer = null
      if (!this.shouldConnect || this.isConnected() || this.connecting) return
      this.connect().catch(() => this.attemptReconnect())
    }, delay)
  }

  // 백오프 상태 초기화 (예약된 타이머 취소 + 횟수 리셋)
  resetReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnecting = false
    this.reconnectAttempts = 0
  }

  // 네트워크 복구/포그라운드 복귀 등 "지금 당장 붙어야 하는" 신호에서 호출.
  // 백오프를 리셋하고 즉시 재연결 — 긴 백오프 대기 중이어도 곧장 시도한다.
  kickReconnect() {
    if (!this.shouldConnect) return
    if (this.isConnected()) return
    this.resetReconnect()
    if (!this.connecting) {
      this.connect().catch(() => this.attemptReconnect())
    }
  }

  // 토큰 갱신 직후 호출 — 인증 실패(STOMP ERROR)로 자동 재연결 중단된 상태를 회복.
  // 정상 연결 상태면 no-op (기존 세션 재사용). 끊겨 있으면 새 토큰으로 다시 connect.
  onTokenRefreshed() {
    if (this.isConnected()) return
    // 토큰이 있으면 이제 연결돼야 한다는 의도로 간주
    if (!this.getAuthToken()) return
    this.shouldConnect = true
    this.resetReconnect()
    if (!this.connecting) {
      this.connect().catch(() => this.attemptReconnect())
    }
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
    // 의도적 종료 — 자동 재연결 중단 + 예약된 백오프 타이머 취소
    this.shouldConnect = false
    this.resetReconnect()
    this.clearConnectTimeout()

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

    // connecting 중에 disconnect 호출됐을 때 hanging 되지 않도록 pending promise 정리
    this.rejectPendingConnects(new Error('연결이 해제되었습니다'))
    // 전송 큐/접수 대기도 일괄 실패 처리 — 뷰가 FAILED + 재전송 버튼으로 복구 경로 제공
    this.flushSendQueue(new Error('연결이 해제되었습니다'))

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
    // 이미 모니터링 중이면 중복 실행 방지 (HMR / 테스트 환경에서 누적되는 사고 차단)
    if (this.monitorIntervalId) return
    this.monitorIntervalId = setInterval(() => {
      const now = this.isConnected()

      // 살아있는 소켓이지만 계정이 바뀐 경우 backstop 으로 재연결
      if (now && this.isStaleSession()) {
        console.warn('⚠️ [WebSocket] 모니터링: 세션 신원 불일치 → 재연결')
        this.reconnect().catch(() => {})
        return
      }

      // 연결돼 있어야 하는데(shouldConnect) 안 붙어 있으면 — 최초 연결 실패 케이스 포함 —
      // 계속 되살린다. attemptReconnect 내부 가드가 중복/백오프를 관리.
      if (this.shouldConnect && !now && !this.connecting && !this.reconnecting) {
        if (this.connectionState.connected) this.updateConnectionState('disconnected')
        this.attemptReconnect()
      }
    }, 5000)
  }

  stopConnectionMonitoring() {
    if (this.monitorIntervalId) {
      clearInterval(this.monitorIntervalId)
      this.monitorIntervalId = null
    }
  }
}

export const webSocketService = new WebSocketService()
webSocketService.startConnectionMonitoring()

if (typeof window !== 'undefined') {
  window.webSocketService = webSocketService
  window.debugWebSocket = () => console.log(webSocketService.getDebugInfo())

  // 네트워크 복구 시 즉시 재연결 (모바일 셀룰러↔Wi-Fi 전환, 터널 진입/탈출 등).
  // shouldConnect 가 true(=연결돼 있어야 함)일 때만 동작 → 백그라운드/로그아웃 중엔 무시.
  window.addEventListener('online', () => {
    console.log('🌐 [WebSocket] 네트워크 복구 감지 → 즉시 재연결')
    webSocketService.kickReconnect()
  })
  window.addEventListener('offline', () => {
    console.log('🌐 [WebSocket] 네트워크 끊김 감지')
  })
}

export default webSocketService