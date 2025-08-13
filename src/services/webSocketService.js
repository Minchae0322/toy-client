// services/websocketService.js
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ref, reactive } from 'vue'

class WebSocketService {
  constructor() {
    this.client = null
    this.connected = ref(false)
    this.connecting = ref(false)
    this.connectionId = null
    this.deviceInfo = this.generateDeviceInfo()

    // 연결 상태 관리
    this.connectionState = reactive({
      status: 'disconnected', // disconnected, connecting, connected, error, auth-required
      error: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5
    })

    // 채팅방 구독 관리
    this.roomSubscriptions = new Map()
    this.messageHandlers = new Map()
    this.subscriptions = new Map()

    // 재연결 설정
    this.reconnectDelay = 3000
    this.heartbeatIncoming = 4000
    this.heartbeatOutgoing = 4000

    console.log('🔧 WebSocket 서비스 초기화:', this.deviceInfo)
  }

  /**
   * 디바이스 정보 생성 및 감지
   */
  generateDeviceInfo() {
    const stored = localStorage.getItem('device_info')
    if (stored) {
      try {
        const deviceInfo = JSON.parse(stored)
        // 기존 정보가 있지만 디바이스 타입을 다시 확인
        deviceInfo.deviceType = this.detectDeviceType()
        deviceInfo.userAgent = navigator.userAgent
        localStorage.setItem('device_info', JSON.stringify(deviceInfo))
        return deviceInfo
      } catch (error) {
        console.warn('저장된 디바이스 정보 파싱 실패, 새로 생성합니다.')
      }
    }

    // 새 디바이스 정보 생성
    const deviceInfo = {
      deviceId: this.generateDeviceId(),
      deviceType: this.detectDeviceType(),
      deviceName: this.getDeviceName(),
      platform: this.getPlatform(),
      browser: this.getBrowserInfo(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language || 'ko',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    localStorage.setItem('device_info', JSON.stringify(deviceInfo))
    return deviceInfo
  }

  /**
   * 디바이스 ID 생성
   */
  generateDeviceId() {
    const stored = localStorage.getItem('device_id')
    if (stored) {
      return stored
    }

    const deviceId = `web_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
    localStorage.setItem('device_id', deviceId)
    return deviceId
  }

  /**
   * 디바이스 타입 감지
   */
  detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase()

    // 모바일 디바이스 감지
    const mobileKeywords = [
      'mobile', 'android', 'iphone', 'ipad', 'ipod',
      'blackberry', 'opera mini', 'iemobile', 'wpdesktop'
    ]

    const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword))

    // 태블릿 감지
    const isTablet = userAgent.includes('tablet') ||
        (userAgent.includes('ipad')) ||
        (userAgent.includes('android') && !userAgent.includes('mobile'))

    // 터치 지원 여부
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    if (isTablet) {
      return 'tablet'
    } else if (isMobile) {
      return 'mobile'
    } else if (hasTouch) {
      return 'desktop-touch'
    } else {
      return 'desktop'
    }
  }

  /**
   * 디바이스 이름 생성
   */
  getDeviceName() {
    const userAgent = navigator.userAgent

    // iOS 디바이스
    if (/iPhone/.test(userAgent)) {
      return 'iPhone'
    } else if (/iPad/.test(userAgent)) {
      return 'iPad'
    } else if (/iPod/.test(userAgent)) {
      return 'iPod'
    }

    // Android
    else if (/Android/.test(userAgent)) {
      const match = userAgent.match(/Android ([0-9.]+)/)
      return match ? `Android ${match[1]}` : 'Android'
    }

    // Windows
    else if (/Windows/.test(userAgent)) {
      if (/Windows NT 10/.test(userAgent)) return 'Windows 10'
      if (/Windows NT 6.3/.test(userAgent)) return 'Windows 8.1'
      if (/Windows NT 6.2/.test(userAgent)) return 'Windows 8'
      if (/Windows NT 6.1/.test(userAgent)) return 'Windows 7'
      return 'Windows'
    }

    // macOS
    else if (/Mac OS X/.test(userAgent)) {
      const match = userAgent.match(/Mac OS X ([0-9_]+)/)
      if (match) {
        const version = match[1].replace(/_/g, '.')
        return `macOS ${version}`
      }
      return 'macOS'
    }

    // Linux
    else if (/Linux/.test(userAgent)) {
      return 'Linux'
    }

    return 'Unknown Device'
  }

  /**
   * 플랫폼 정보 반환
   */
  getPlatform() {
    return navigator.platform || 'Unknown'
  }

  /**
   * 브라우저 정보 감지
   */
  getBrowserInfo() {
    const userAgent = navigator.userAgent

    if (/Chrome/.test(userAgent) && !/Chromium/.test(userAgent)) {
      const match = userAgent.match(/Chrome\/([0-9.]+)/)
      return { name: 'Chrome', version: match ? match[1] : 'Unknown' }
    } else if (/Firefox/.test(userAgent)) {
      const match = userAgent.match(/Firefox\/([0-9.]+)/)
      return { name: 'Firefox', version: match ? match[1] : 'Unknown' }
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      const match = userAgent.match(/Version\/([0-9.]+)/)
      return { name: 'Safari', version: match ? match[1] : 'Unknown' }
    } else if (/Edge/.test(userAgent)) {
      const match = userAgent.match(/Edge\/([0-9.]+)/)
      return { name: 'Edge', version: match ? match[1] : 'Unknown' }
    }

    return { name: 'Unknown', version: 'Unknown' }
  }

  /**
   * JWT 토큰 만료 확인
   */
  isTokenExpired(token) {
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      // 30초 여유를 두고 만료 체크 (토큰 갱신을 위해)
      return payload.exp < (currentTime + 30)
    } catch (error) {
      console.error('토큰 파싱 실패:', error)
      return true
    }
  }

  /**
   * 토큰 갱신 시도
   */
  async refreshToken() {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token')
      if (!refreshTokenValue) {
        throw new Error('리프레시 토큰이 없습니다')
      }

      console.log('🔄 토큰 갱신 시도 중...')

      // authUtils 사용하여 토큰 갱신 (있다면)
      try {
        const authUtils = await import('@/utils/auth.js')
        if (authUtils.refreshToken) {
          const newToken = await authUtils.refreshToken()
          console.log('✅ authUtils로 토큰 갱신 성공')
          return newToken
        }
      } catch (importError) {
        console.log('authUtils 없음, 직접 API 호출로 진행')
      }

      // 직접 토큰 갱신 API 호출
      const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8081'

      const response = await fetch(`${AUTH_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue
        })
      })

      if (!response.ok) {
        throw new Error(`토큰 갱신 실패: ${response.status}`)
      }

      const data = await response.json()
      const { accessToken, refreshToken: newRefreshToken } = data

      // 새 토큰들 저장
      localStorage.setItem('access_token', accessToken)
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken)
      }

      console.log('✅ 토큰 갱신 성공')
      return accessToken
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error)
      throw error
    }
  }

  /**
   * 인증 필요 상황 처리
   */
  handleAuthRequired(reason = '인증이 필요합니다') {
    console.warn('🔐 인증 필요:', reason)

    this.connectionState.status = 'auth-required'
    this.connectionState.error = reason
    this.connected.value = false
    this.connecting.value = false

    // 토큰 정리
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_profile')

    // 인증 필요 이벤트 발생
    window.dispatchEvent(new CustomEvent('auth-required', {
      detail: { reason }
    }))

    // Storage 이벤트 발생 (App.vue에서 감지용)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'access_token',
      newValue: null
    }))

    // 연결 정리
    this.cleanup()
  }

  /**
   * WebSocket 연결 초기화
   */
  async connect() {
    if (this.connecting.value || this.connected.value) {
      console.log('🔄 이미 연결 중이거나 연결된 상태입니다')
      return Promise.resolve()
    }

    return new Promise(async (resolve, reject) => {
      try {
        this.connecting.value = true
        this.connectionState.status = 'connecting'
        this.connectionState.error = null

        // 1. 토큰 존재 여부 확인
        let token = localStorage.getItem('access_token')
        if (!token) {
          console.warn('❌ JWT 토큰이 없습니다')
          this.handleAuthRequired('로그인이 필요합니다')
          reject(new Error('인증 토큰이 없습니다'))
          return
        }

        // 2. 토큰 만료 확인 및 갱신
        if (this.isTokenExpired(token)) {
          console.warn('⚠️ JWT 토큰이 만료되었습니다. 갱신을 시도합니다.')

          try {
            await this.refreshToken()
            token = localStorage.getItem('access_token') // 갱신된 토큰 재조회

            if (!token || this.isTokenExpired(token)) {
              throw new Error('토큰 갱신 후에도 유효하지 않습니다')
            }
          } catch (refreshError) {
            console.error('❌ 토큰 갱신 실패:', refreshError)
            this.handleAuthRequired('토큰 갱신에 실패했습니다. 다시 로그인해주세요.')
            reject(refreshError)
            return
          }
        }

        // 3. 토큰 유효성 최종 확인
        const userId = this.getUserIdFromToken()
        if (!userId) {
          console.error('❌ 토큰에서 사용자 ID를 추출할 수 없습니다')
          this.handleAuthRequired('유효하지 않은 토큰입니다')
          reject(new Error('유효하지 않은 토큰'))
          return
        }

        console.log('✅ 토큰 검증 완료. 사용자 ID:', userId)

        // 4. STOMP 클라이언트 설정
        this.client = new Client({
          // SockJS를 사용한 WebSocket 연결 - MSA 채팅 서비스
          webSocketFactory: () => {
            // 환경변수에서 URL 가져오기
            const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8084/api/ws'

            console.log('🔌 WebSocket 연결 URL:', wsUrl)
            console.log('🔌 환경변수 VITE_WS_URL:', import.meta.env.VITE_WS_URL)

            return new SockJS(wsUrl, null, {
              transports: ['websocket', 'xhr-streaming', 'xhr-polling']
            })
          },

          // 연결 헤더 (JWT 토큰 및 디바이스 정보 포함)
          connectHeaders: {
            'Authorization': `Bearer ${token}`,
            'X-Device-ID': this.deviceInfo.deviceId,
            'X-Device-Type': this.deviceInfo.deviceType,
            'X-Device-Name': this.deviceInfo.deviceName,
            'X-Platform': this.deviceInfo.platform,
            'X-Browser': `${this.deviceInfo.browser.name}/${this.deviceInfo.browser.version}`,
            'X-Client-Version': '1.0.0',
            'X-Timezone': this.deviceInfo.timezone,
            'X-Language': this.deviceInfo.language,
            'X-User-ID': userId
          },

          // 하트비트 설정
          heartbeatIncoming: this.heartbeatIncoming,
          heartbeatOutgoing: this.heartbeatOutgoing,

          // 재연결 설정
          reconnectDelay: this.reconnectDelay,

          // 디버그 설정 (개발환경에서만)
          debug: import.meta.env.DEV ? (str) => {
            console.log('🔌 STOMP:', str)
          } : undefined,

          // 연결 성공 콜백
          onConnect: (frame) => {
            console.log('✅ WebSocket 연결 성공:', frame)
            this.connected.value = true
            this.connecting.value = false
            this.connectionState.status = 'connected'
            this.connectionState.reconnectAttempts = 0
            this.connectionId = frame.headers['connection-id']

            // 기본 구독 설정
            this.setupDefaultSubscriptions()
            resolve(frame)
          },

          // 연결 실패 콜백
          onStompError: (frame) => {
            console.error('❌ STOMP 에러:', frame)
            this.connecting.value = false
            this.connected.value = false

            const errorMessage = frame.headers['message'] || 'STOMP 연결 실패'

            // 인증 관련 에러 처리
            if (errorMessage.includes('Unauthorized') || errorMessage.includes('401') ||
                errorMessage.includes('Authentication') || errorMessage.includes('Token')) {
              this.handleAuthRequired('인증에 실패했습니다. 다시 로그인해주세요.')
            } else {
              this.connectionState.status = 'error'
              this.connectionState.error = errorMessage
            }

            reject(new Error(errorMessage))
          },

          // WebSocket 에러 콜백
          onWebSocketError: (error) => {
            console.error('❌ WebSocket 에러:', error)
            this.connecting.value = false
            this.connectionState.status = 'error'
            this.connectionState.error = '네트워크 연결 오류'
            reject(error)
          },

          // 연결 종료 콜백
          onDisconnect: (frame) => {
            console.log('🔌 WebSocket 연결 종료:', frame)
            this.connected.value = false
            this.connectionState.status = 'disconnected'
            this.cleanup()
          }
        })

        // 연결 시작
        this.client.activate()

      } catch (error) {
        console.error('❌ WebSocket 연결 초기화 실패:', error)
        this.connecting.value = false
        this.connectionState.status = 'error'
        this.connectionState.error = error.message
        reject(error)
      }
    })
  }

  /**
   * 기본 구독 설정 (사용자별 디바이스별 개인 큐)
   */
  setupDefaultSubscriptions() {
    const userId = this.getUserIdFromToken()
    if (!userId) {
      console.error('❌ 사용자 ID를 찾을 수 없습니다')
      return
    }

    const deviceId = this.deviceInfo.deviceId
    const baseDestination = `/user/${userId}/device/${deviceId}`

    // 개인 메시지 구독
    this.subscribe(`${baseDestination}/messages`, (message) => {
      this.handlePrivateMessage(JSON.parse(message.body))
    })

    // 시스템 알림 구독
    this.subscribe(`${baseDestination}/notifications`, (message) => {
      this.handleSystemNotification(JSON.parse(message.body))
    })

    // 연결 상태 알림 구독
    this.subscribe(`${baseDestination}/presence`, (message) => {
      this.handlePresenceUpdate(JSON.parse(message.body))
    })

    // 채팅 메시지 구독 (디바이스별)
    this.subscribe(`${baseDestination}/chat`, (message) => {
      this.handleChatMessage(JSON.parse(message.body))
    })

    // 타이핑 상태 구독
    this.subscribe(`${baseDestination}/typing`, (message) => {
      this.handleTypingStatus(JSON.parse(message.body))
    })

    console.log(`📡 기본 구독 설정 완료 - User: ${userId}, Device: ${deviceId}`)
  }

  /**
   * 채팅방 구독 (ChatDetail 컴포넌트와 호환되는 방식)
   */
  async subscribeToRoom(roomId, options = {}) {
    if (!this.connected.value) {
      console.error('❌ WebSocket이 연결되지 않았습니다');
      throw new Error('WebSocket이 연결되지 않았습니다');
    }

    try {
      console.log('🔔 채팅방 구독 시작:', roomId);

      // 백엔드의 토픽 형식에 맞춤: /topic/chatroom/{roomId}
      const destination = `/topic/chatroom/${roomId}`;

      // 이미 구독 중인지 확인
      if (this.roomSubscriptions.has(roomId)) {
        console.log('⚠️ 이미 구독 중인 채팅방:', roomId);
        if (options.onSubscribed) {
          options.onSubscribed();
        }
        return this.roomSubscriptions.get(roomId);
      }

      // STOMP 구독
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('📨 채팅방 메시지 수신:', data);

          // 메시지 타입별 처리
          this.handleReceivedMessage(data, roomId);

        } catch (error) {
          console.error('❌ 메시지 파싱 오류:', error);
        }
      });

      // 구독 정보 저장
      this.roomSubscriptions.set(roomId, {
        subscription,
        destination,
        roomId
      });

      console.log('✅ 채팅방 구독 완료:', roomId);

      // 채팅방 입장 알림 전송
      this.sendMessage('/app/chat/join', {
        roomId: roomId,
        deviceId: this.deviceInfo.deviceId,
        deviceInfo: this.deviceInfo,
        timestamp: Date.now()
      });

      // 구독 성공 콜백
      if (options.onSubscribed) {
        options.onSubscribed();
      }

      return subscription;

    } catch (error) {
      console.error('❌ 채팅방 구독 실패:', error);
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  /**
   * 수신된 메시지 처리 (ChatDetail 컴포넌트와 호환)
   */
  handleReceivedMessage(data, roomId) {
    // 메시지 타입별 핸들러 호출
    switch (data.type) {
      case 'CHAT_MESSAGE':
      case 'TEXT':
      case 'IMAGE':
      case 'FILE':
        this.emitMessage('chat-message', { ...data, roomId });
        break;
      case 'SYSTEM_NOTIFICATION':
      case 'SYSTEM':
        this.emitMessage('system-notification', { ...data, roomId });
        break;
      case 'PRESENCE_UPDATE':
        this.emitMessage('presence-update', { ...data, roomId });
        break;
      case 'TYPING_STATUS':
        this.handleTypingStatus({ ...data, roomId });
        break;
      default:
        console.log('알 수 없는 메시지 타입:', data.type);
        // 기본적으로 chat-message로 처리
        this.emitMessage('chat-message', { ...data, roomId });
    }
  }

  /**
   * 채팅방 구독 해제
   */
  unsubscribeFromRoom(roomId) {
    const roomSub = this.roomSubscriptions.get(roomId)
    if (roomSub) {
      roomSub.subscription.unsubscribe()
      this.roomSubscriptions.delete(roomId)
      console.log(`📡 채팅방 구독 해제: ${roomId}`)

      // 채팅방 퇴장 알림 전송
      if (this.connected.value) {
        this.sendMessage('/app/chat/leave', {
          roomId: roomId,
          deviceId: this.deviceInfo.deviceId,
          timestamp: Date.now()
        })
      }
    }
  }

  /**
   * 타이핑 상태 전송
   */
  sendTypingStatus(roomId, isTyping) {
    if (!this.connected.value) {
      console.warn('❌ WebSocket이 연결되지 않음 - 타이핑 상태 전송 실패')
      return
    }

    try {
      this.sendMessage('/app/chat/typing', {
        roomId: roomId,
        isTyping: isTyping,
        deviceId: this.deviceInfo.deviceId,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('❌ 타이핑 상태 전송 실패:', error)
    }
  }

  /**
   * 일반 구독 (공통)
   */
  subscribe(destination, callback, headers = {}) {
    if (!this.client || !this.connected.value) {
      console.error('❌ WebSocket이 연결되지 않았습니다')
      return null
    }

    try {
      const subscription = this.client.subscribe(destination, callback, headers)
      this.subscriptions.set(destination, subscription)
      console.log(`📡 구독 성공: ${destination}`)
      return subscription
    } catch (error) {
      console.error(`❌ 구독 실패: ${destination}`, error)
      return null
    }
  }

  /**
   * 구독 해제
   */
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(destination)
      console.log(`📡 구독 해제: ${destination}`)
    }
  }

  /**
   * 메시지 전송 (공통)
   */
  sendMessage(destination, body, headers = {}) {
    if (!this.client || !this.connected.value) {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

    try {
      const messageHeaders = {
        'content-type': 'application/json',
        'X-Device-ID': this.deviceInfo.deviceId,
        'X-Device-Type': this.deviceInfo.deviceType,
        ...headers
      }

      this.client.publish({
        destination: destination,
        body: JSON.stringify({
          ...body,
          deviceInfo: this.deviceInfo // 디바이스 정보 포함
        }),
        headers: messageHeaders
      })

      console.log(`📤 메시지 전송: ${destination}`, body)

    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error)
      throw error
    }
  }

  /**
   * 개인 메시지 처리
   */
  handlePrivateMessage(message) {
    console.log('📨 개인 메시지 수신:', message)
    this.emitMessage('private-message', message)
  }

  /**
   * 채팅 메시지 처리
   */
  handleChatMessage(message) {
    console.log('💬 채팅 메시지 수신:', message)
    this.emitMessage('chat-message', message)
  }

  /**
   * 시스템 알림 처리
   */
  handleSystemNotification(notification) {
    console.log('🔔 시스템 알림 수신:', notification)
    this.emitMessage('system-notification', notification)
  }

  /**
   * 접속 상태 업데이트 처리
   */
  handlePresenceUpdate(presence) {
    console.log('👥 접속 상태 업데이트:', presence)
    this.emitMessage('presence-update', presence)
  }

  /**
   * 타이핑 상태 처리
   */
  handleTypingStatus(message) {
    console.log('⌨️ 타이핑 상태 수신:', message)

    // 타이핑 상태를 채팅방별로 관리
    const roomId = message.roomId
    const userId = message.userId

    if (!this.typingStates) {
      this.typingStates = new Map()
    }

    if (!this.typingStates.has(roomId)) {
      this.typingStates.set(roomId, new Map())
    }

    const roomTypingUsers = this.typingStates.get(roomId)

    if (message.isTyping) {
      roomTypingUsers.set(userId, {
        userId: userId,
        userName: message.userName || `사용자${userId}`,
        timestamp: Date.now()
      })
    } else {
      roomTypingUsers.delete(userId)
    }

    this.emitMessage('typing-status', {
      roomId,
      typingUsers: Array.from(roomTypingUsers.values())
    })
  }

  /**
   * 메시지 이벤트 발생
   */
  emitMessage(type, data) {
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`❌ 메시지 핸들러 에러 (${type}):`, error)
        }
      })
    }
  }

  /**
   * 메시지 핸들러 등록
   */
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type).push(handler)
  }

  /**
   * 메시지 핸들러 제거
   */
  offMessage(type, handler) {
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * JWT 토큰에서 사용자 ID 추출
   */
  getUserIdFromToken() {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return null

      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId || payload.sub || payload.id
    } catch (error) {
      console.error('❌ 토큰 파싱 실패:', error)
      return null
    }
  }

  /**
   * 핸들러 존재 여부 확인
   */
  hasHandlers() {
    return this.messageHandlers.size > 0;
  }

  /**
   * 재연결 메서드
   */
  async reconnect() {
    console.log('🔄 WebSocket 재연결 시도...');

    try {
      // 기존 연결 정리
      await this.disconnect();

      // 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 재연결
      await this.connect();

      console.log('✅ WebSocket 재연결 완료');
      return true;

    } catch (error) {
      console.error('❌ WebSocket 재연결 실패:', error);
      throw error;
    }
  }

  /**
   * 연결 상태 확인 및 자동 재연결
   */
  async ensureConnection() {
    if (this.connected.value) {
      return true
    }

    if (this.connecting.value) {
      return false
    }

    try {
      await this.connect()
      return true
    } catch (error) {
      console.error('❌ 자동 재연결 실패:', error)
      return false
    }
  }

  /**
   * 연결 종료
   */
  async disconnect() {
    if (this.client) {
      try {
        // 모든 채팅방 구독 해제
        this.roomSubscriptions.forEach((roomSub, roomId) => {
          roomSub.subscription.unsubscribe()
        })

        // 모든 일반 구독 해제
        this.subscriptions.forEach((subscription) => {
          subscription.unsubscribe()
        })

        // 클라이언트 비활성화
        this.client.deactivate()

        console.log('🔌 WebSocket 연결 종료')
      } catch (error) {
        console.error('❌ WebSocket 연결 종료 실패:', error)
      }
    }
  }

  /**
   * 정리 작업
   */
  cleanup() {
    this.roomSubscriptions.clear()
    this.subscriptions.clear()
    this.messageHandlers.clear()
    this.connectionId = null

    // 타이핑 상태 정리
    if (this.typingStates) {
      this.typingStates.clear()
    }
  }

  /**
   * 연결 상태 확인
   */
  isConnected() {
    return this.connected.value && this.client?.connected
  }

  /**
   * 인증 상태 확인
   */
  isAuthenticated() {
    const token = localStorage.getItem('access_token')
    return token && !this.isTokenExpired(token)
  }

  /**
   * 연결 상태 반환 (reactive)
   */
  getConnectionState() {
    return {
      connected: this.connected,
      connecting: this.connecting,
      connectionState: this.connectionState
    }
  }

  /**
   * 디바이스 정보 반환
   */
  getDeviceInfo() {
    return this.deviceInfo
  }

  /**
   * 디바이스 정보 업데이트
   */
  updateDeviceInfo() {
    this.deviceInfo.lastUpdated = new Date().toISOString()
    this.deviceInfo.deviceType = this.detectDeviceType()
    localStorage.setItem('device_info', JSON.stringify(this.deviceInfo))
    console.log('🔄 디바이스 정보 업데이트:', this.deviceInfo)
  }
}

// 싱글톤 인스턴스
export const websocketService = new WebSocketService()

// 창 크기 변경 시 디바이스 타입 재감지
window.addEventListener('resize', () => {
  websocketService.updateDeviceInfo()
})

// 토큰 변경 감지 (다른 탭에서 로그인/로그아웃 시)
window.addEventListener('storage', (event) => {
  if (event.key === 'access_token') {
    if (!event.newValue && websocketService.connected.value) {
      // 토큰이 삭제된 경우 연결 종료
      console.log('🔐 토큰 삭제 감지, WebSocket 연결 종료')
      websocketService.disconnect()
    }
  }
})

export default websocketService