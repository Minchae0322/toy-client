// services/webSocketService.js
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class WebSocketService {
  constructor() {
    this.client = null
    this.connected = false
    this.subscriptions = new Map()
    this.messageHandlers = new Map()
    this.baseURL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8084'
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
        reject(new Error('인증 토큰이 없습니다'))
        return
      }

      try {
        // SockJS를 사용한 WebSocket 연결 설정
        const socket = new SockJS(`${this.baseURL}/ws`)

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
            resolve()
          },
          onStompError: (frame) => {
            console.error('❌ [WebSocket] STOMP 에러:', frame)
            this.connected = false
            reject(new Error(`STOMP Error: ${frame.body}`))
          },
          onWebSocketError: (error) => {
            console.error('❌ [WebSocket] WebSocket 에러:', error)
            this.connected = false
            reject(error)
          },
          onDisconnect: () => {
            console.log('🔌 [WebSocket] 연결 해제됨')
            this.connected = false
            this.subscriptions.clear()
          }
        })

        this.client.activate()

      } catch (error) {
        console.error('❌ [WebSocket] 연결 실패:', error)
        reject(error)
      }
    })
  }

  // WebSocket 연결 해제
  disconnect() {
    if (this.client) {
      this.subscriptions.clear()
      this.messageHandlers.clear()
      this.client.deactivate()
      this.connected = false
      console.log('🔌 [WebSocket] 연결 해제 완료')
    }
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

  // 메시지 전송
  sendMessage(roomId, messageData) {
    if (!this.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

    const destination = `/app/chat/rooms/${roomId}/messages`
    const message = {
      ...messageData,
      senderId: this.getCurrentUserId(),
      deviceId: this.getDeviceId(),
      timestamp: new Date().toISOString()
    }

    console.log(`📤 [WebSocket] 메시지 전송 (Room: ${roomId}):`, message)

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
    this.subscriptions.forEach((subscription, roomId) => {
      subscription.unsubscribe()
      console.log(`📨 [WebSocket] 구독 해제: ${roomId}`)
    })
    this.subscriptions.clear()
    this.messageHandlers.clear()
  }
}

// 싱글톤 인스턴스 생성
export const webSocketService = new WebSocketService()

// 기본 내보내기
export default webSocketService