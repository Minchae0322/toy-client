// services/webSocketService.js
class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.userId = null
    this.subscriptions = new Map() // roomId -> callback
    this.globalMessageHandlers = []
    this.heartbeatInterval = null
  }

  // WebSocket 연결
  async connect(userId) {
    try {
      this.userId = userId

      // WebSocket URL (실제 환경에 맞게 수정)
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}/ws/chat?userId=${userId}`

      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log('WebSocket 연결 성공')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()

        // 연결 후 사용자 인증
        this.send({
          type: 'AUTH',
          userId: this.userId,
          timestamp: Date.now()
        })
      }

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('메시지 파싱 실패:', error)
        }
      }

      this.socket.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code, event.reason)
        this.isConnected = false
        this.stopHeartbeat()

        // 정상적인 종료가 아니면 재연결 시도
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket 오류:', error)
      }

    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      throw error
    }
  }

  // WebSocket 연결 해제
  disconnect() {
    this.stopHeartbeat()

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
      this.socket = null
    }

    this.isConnected = false
    this.subscriptions.clear()
    this.globalMessageHandlers = []
  }

  // 메시지 전송
  send(message) {
    if (this.isConnected && this.socket) {
      this.socket.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket이 연결되지 않음')
    }
  }

  // 메시지 처리
  handleMessage(message) {
    console.log('WebSocket 메시지 수신:', message)

    switch (message.type) {
      case 'CHAT_MESSAGE':
        this.handleChatMessage(message)
        break
      case 'SYSTEM_MESSAGE':
        this.handleSystemMessage(message)
        break
      case 'USER_STATUS':
        this.handleUserStatus(message)
        break
      case 'HEARTBEAT':
        // 하트비트 응답
        break
      case 'ERROR':
        console.error('서버 오류:', message.error)
        break
      default:
        console.log('알 수 없는 메시지 타입:', message.type)
    }
  }

  // 채팅 메시지 처리
  handleChatMessage(message) {
    const { roomId } = message

    // 해당 채팅방을 구독 중인지 확인
    if (this.subscriptions.has(roomId)) {
      const callback = this.subscriptions.get(roomId)
      callback(message)
    }

    // 전역 메시지 핸들러들에게도 전달 (Push 알림용)
    this.globalMessageHandlers.forEach(handler => {
      handler(message)
    })
  }

  // 시스템 메시지 처리
  handleSystemMessage(message) {
    console.log('시스템 메시지:', message)

    // 입장/퇴장 등의 시스템 메시지 처리
    if (message.roomId && this.subscriptions.has(message.roomId)) {
      const callback = this.subscriptions.get(message.roomId)
      callback(message)
    }
  }

  // 사용자 상태 처리
  handleUserStatus(message) {
    console.log('사용자 상태 변경:', message)
    // 온라인/오프라인/타이핑 상태 처리
  }

  // 채팅방 구독
  subscribeToRoom(roomId, callback) {
    if (!this.isConnected) {
      console.warn('WebSocket이 연결되지 않음')
      return
    }

    this.subscriptions.set(roomId, callback)

    // 서버에 채팅방 구독 요청
    this.send({
      type: 'SUBSCRIBE_ROOM',
      roomId: roomId,
      userId: this.userId,
      timestamp: Date.now()
    })

    console.log(`채팅방 ${roomId} 구독 시작`)
  }

  // 채팅방 구독 해제
  unsubscribeFromRoom(roomId) {
    if (this.subscriptions.has(roomId)) {
      this.subscriptions.delete(roomId)

      // 서버에 구독 해제 요청
      this.send({
        type: 'UNSUBSCRIBE_ROOM',
        roomId: roomId,
        userId: this.userId,
        timestamp: Date.now()
      })

      console.log(`채팅방 ${roomId} 구독 해제`)
    }
  }

  // 전역 메시지 핸들러 등록 (Push 알림용)
  onGlobalMessage(handler) {
    this.globalMessageHandlers.push(handler)
  }

  // 메시지 전송 (채팅방에서 사용)
  sendChatMessage(roomId, content, messageType = 'TEXT', metadata = null) {
    const message = {
      type: 'SEND_MESSAGE',
      roomId: roomId,
      senderId: this.userId,
      content: content,
      messageType: messageType,
      metadata: metadata,
      timestamp: Date.now()
    }

    this.send(message)
  }

  // 타이핑 상태 전송
  sendTypingStatus(roomId, isTyping) {
    this.send({
      type: 'TYPING_STATUS',
      roomId: roomId,
      userId: this.userId,
      isTyping: isTyping,
      timestamp: Date.now()
    })
  }

  // 하트비트 시작
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'HEARTBEAT',
          userId: this.userId,
          timestamp: Date.now()
        })
      }
    }, 30000) // 30초마다
  }

  // 하트비트 중지
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // 재연결 스케줄링
  scheduleReconnect() {
    setTimeout(() => {
      this.reconnectAttempts++
      console.log(`WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      this.connect(this.userId)
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  // 연결 상태 확인
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const webSocketService = new WebSocketService()