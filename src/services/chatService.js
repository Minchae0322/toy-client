// services/chatService.js
// 채팅 서비스 전용 API 클래스

import * as authUtils from '@/utils/auth.js'

/**
 * 채팅 서비스 전용 API 클래스
 * Chat Server (8084)와의 통신을 담당
 */
class ChatService {
  constructor() {
    // Chat Server URL 설정
    if (import.meta.env.DEV) {
      this.baseURL = 'http://localhost:8084/api'
      this.wsURL = 'ws://localhost:8084'
    } else {
      this.baseURL = import.meta.env.VITE_CHAT_SERVER_URL || 'https://your-chat-server.com/api'
      this.wsURL = import.meta.env.VITE_CHAT_WS_URL || 'wss://your-chat-server.com'
    }

    console.log('💬 [ChatService] 초기화됨')
    console.log('Chat API URL:', this.baseURL)
    console.log('Chat WS URL:', this.wsURL)
  }

  // ==================== 공통 유틸리티 ====================

  /**
   * API 요청용 헤더 생성
   */
  getHeaders() {
    return authUtils.getApiHeaders()
  }

  /**
   * API 응답 처리
   */
  async handleResponse(response) {
    if (!response.ok) {
      let errorData = {}
      try {
        errorData = await response.json()
      } catch (parseError) {
        console.warn('에러 응답 파싱 실패:', parseError)
      }

      const errorMessage = errorData.message ||
          errorData.error ||
          `HTTP ${response.status} ${response.statusText}`

      const error = new Error(errorMessage)
      error.status = response.status
      error.data = errorData
      throw error
    }
    return response.json()
  }

  /**
   * 요청 로깅
   */
  logRequest(method, url, data = null) {
    console.log(`🌐 [ChatService] [${method}] ${url}`, data || '')
  }

  /**
   * 응답 로깅
   */
  logResponse(method, url, response, error = null) {
    if (error) {
      console.error(`❌ [ChatService] [${method}] ${url} 실패:`, error.message)
    } else {
      console.log(`✅ [ChatService] [${method}] ${url} 성공`)
    }
  }

  // ==================== 채팅방 API ====================

  /**
   * 채팅 시작 (한입만 상세에서 채팅하기 클릭시)
   */
  async startChat(chatData) {
    const url = `${this.baseURL}/v1/chat/rooms/chat`

    const requestData = {
      chatContext: chatData.chatContext || 'PRODUCT_TRADE',
      chatContextId: chatData.chatContextId,
      creatorId: chatData.creatorId,
      participantIds: chatData.participantIds,
      deviceId: chatData.deviceId || authUtils.getDeviceId()
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || '채팅방이 성공적으로 생성되었습니다'
      }

    } catch (error) {
      this.logResponse('POST', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 채팅방 목록 조회
   */
  async getChatRooms(searchCondition = {}) {
    const url = `${this.baseURL}/v1/chat/rooms`
    this.logRequest('GET', url, searchCondition)

    try {
      const queryParams = new URLSearchParams()

      if (searchCondition.keyword) queryParams.append('keyword', searchCondition.keyword)
      if (searchCondition.roomType) queryParams.append('roomType', searchCondition.roomType)
      if (searchCondition.status) queryParams.append('status', searchCondition.status)

      const requestUrl = `${url}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || [],
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)

      if (error.status === 401) {
        error.needsTokenRefresh = true
      }

      throw error
    }
  }

  /**
   * 채팅방 생성
   */
  async createChatRoom(roomData) {
    const url = `${this.baseURL}/v1/chat/rooms`

    const requestData = {
      title: roomData.title,
      description: roomData.description || null,
      roomType: roomData.roomType || 'NORMAL',
      participantUserIds: roomData.participantUserIds || [],
      isPrivate: roomData.isPrivate || false,
      maxParticipants: roomData.maxParticipants || null,
      thumbnailUrl: roomData.thumbnailUrl || null
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || '채팅방이 성공적으로 생성되었습니다'
      }

    } catch (error) {
      this.logResponse('POST', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 채팅방 상세 조회
   */
  async getChatRoomDetail(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}`
    this.logRequest('GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 채팅방 입장
   */
  async joinChatRoom(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/join`
    const requestData = {
      deviceId: authUtils.getDeviceId()
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('POST', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 채팅방 나가기
   */
  async leaveChatRoom(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/leave`
    const requestData = {
      deviceId: authUtils.getDeviceId()
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('POST', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  // ==================== 메시지 API ====================

  /**
   * 메시지 목록 조회 (커서 기반 페이징)
   */
  async getChatMessages(roomId, cursorPageRequest = {}) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/messages`
    this.logRequest('GET', url, cursorPageRequest)

    try {
      const queryParams = new URLSearchParams()

      // 백엔드 API 스펙에 맞는 파라미터 설정
      if (cursorPageRequest.size) {
        queryParams.append('size', cursorPageRequest.size.toString())
      } else {
        queryParams.append('size', '20') // 기본값
      }

      if (cursorPageRequest.lastMessageId) {
        queryParams.append('lastMessageId', cursorPageRequest.lastMessageId)
      }

      const requestUrl = `${url}?${queryParams}`
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || [],
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 메시지 전송 (HTTP API)
   */
  async sendMessage(roomId, messageData) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/messages`
    const requestData = {
      content: messageData.content,
      type: messageData.type || 'TEXT',
      replyToMessageId: messageData.replyToMessageId || null,
      metadata: messageData.metadata || null,
      deviceId: authUtils.getDeviceId(),
      timestamp: new Date().toISOString()
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('POST', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  // ==================== 연결 테스트 ====================

  /**
   * Chat Server 연결 테스트
   */
  async testConnection() {
    const testEndpoints = [
      `${this.baseURL.replace('/api', '')}/actuator/health`,
      `${this.baseURL}/health`,
      `${this.baseURL}/v1/chat/rooms` // 실제 API 테스트
    ]

    console.log('🔍 [ChatService] Chat Server 연결 테스트...')

    for (const url of testEndpoints) {
      try {
        console.log(`🌐 [ChatService] 테스트 중: ${url}`)

        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          mode: 'cors',
          credentials: 'include'
        })

        console.log(`📡 [ChatService] 응답 상태: ${response.status}`)

        // 200 OK 또는 401 (인증 필요)도 서버 연결 성공으로 간주
        if (response.ok || response.status === 401) {
          console.log(`✅ [ChatService] Chat Server 연결 성공: ${url}`)
          return true
        }
      } catch (error) {
        console.warn(`❌ [ChatService] ${url} 연결 실패:`, error.message)
      }
    }

    console.log('❌ [ChatService] 모든 엔드포인트 연결 실패')
    return false
  }

  // ==================== 디버깅 ====================

  /**
   * Chat Service 상태 디버깅
   */
  debugStatus() {
    console.group('🔍 [ChatService] 상태 디버깅')

    console.log('=== 서버 정보 ===')
    console.log('Base URL:', this.baseURL)
    console.log('WebSocket URL:', this.wsURL)
    console.log('환경:', import.meta.env.MODE)

    console.log('=== 인증 정보 ===')
    console.log('Access Token 존재:', !!authUtils.getAccessToken())
    console.log('사용자 ID:', authUtils.getUserId())
    console.log('디바이스 ID:', authUtils.getDeviceId())
    console.log('인증 상태:', authUtils.isAuthenticated())

    console.groupEnd()
  }
}

// ==================== 채팅방 유틸리티 ====================

/**
 * 채팅방 관련 유틸리티 함수들
 */
export const chatRoomUtils = {
  /**
   * 백엔드 채팅방 타입을 프론트엔드 타입으로 변환
   */
  convertRoomType(backendType) {
    const typeMap = {
      'NORMAL': 'NORMAL',
      'CHANNEL': 'CHANNEL',
      'CUSTOMER_SUPPORT': 'CUSTOMER_SUPPORT'
    }
    return typeMap[backendType] || 'NORMAL'
  },

  /**
   * 프론트엔드 채팅방 타입을 백엔드 타입으로 변환
   */
  convertRoomTypeToBackend(frontendType) {
    const typeMap = {
      'NORMAL': 'NORMAL',
      'CHANNEL': 'CHANNEL',
      'CUSTOMER_SUPPORT': 'CUSTOMER_SUPPORT'
    }
    return typeMap[frontendType] || 'NORMAL'
  },

  /**
   * 백엔드 메시지 응답을 프론트엔드 형식으로 변환
   */
  transformMessageResponse(backendMessage) {
    return {
      messageId: backendMessage.messageId,
      roomId: backendMessage.roomId,
      senderId: backendMessage.senderId,
      senderName: backendMessage.senderName || `사용자${backendMessage.senderId}`,
      content: backendMessage.content,
      type: backendMessage.messageType || backendMessage.type || 'TEXT',
      createdAt: backendMessage.sentAt || backendMessage.createdAt,
      status: 'SENT',
      isRead: backendMessage.isRead || false,
      replyTo: backendMessage.replyTo,
      metadata: backendMessage.metadata
    }
  },

  /**
   * 백엔드 응답을 프론트엔드 형식으로 변환
   */
  transformChatRoomResponse(backendRoom) {
    // roomType이 enum 객체인 경우 처리
    let roomTypeValue = 'NORMAL';
    if (backendRoom.roomType) {
      if (typeof backendRoom.roomType === 'string') {
        roomTypeValue = backendRoom.roomType;
      } else if (backendRoom.roomType.name) {
        roomTypeValue = backendRoom.roomType.name;
      } else if (backendRoom.roomType.toString) {
        roomTypeValue = backendRoom.roomType.toString();
      }
    }

    return {
      id: backendRoom.roomId,
      name: backendRoom.title,
      type: chatRoomUtils.convertRoomType(roomTypeValue),
      participantCount: backendRoom.participantCount || 2,
      lastMessage: backendRoom.lastMessage || '메시지가 없습니다',
      lastMessageSender: null,
      lastMessageType: backendRoom.lastMessageType ? backendRoom.lastMessageType.toLowerCase() : 'text',
      lastMessageAt: backendRoom.lastMessageAt ? new Date(backendRoom.lastMessageAt).getTime() : Date.now(),
      unreadCount: backendRoom.unreadCount || 0,
      status: backendRoom.status || 'ACTIVE',
      avatar: backendRoom.thumbnailUrl,
      description: backendRoom.description,
      createdAt: backendRoom.createdAt
    }
  },

  /**
   * 채팅방 생성 데이터 검증
   */
  validateCreateRoomData(roomData) {
    const errors = []

    if (!roomData.title || roomData.title.trim().length === 0) {
      errors.push('채팅방 제목은 필수입니다.')
    }

    if (roomData.title && roomData.title.length > 50) {
      errors.push('채팅방 제목은 50자 이하여야 합니다.')
    }

    if (!['NORMAL', 'CHANNEL', 'CUSTOMER_SUPPORT'].includes(roomData.roomType)) {
      errors.push('올바른 채팅방 타입을 선택해주세요.')
    }

    if (roomData.roomType === 'NORMAL' && (!roomData.participantUserIds || roomData.participantUserIds.length !== 1)) {
      errors.push('1:1 채팅방은 상대방 1명을 선택해야 합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  },

  /**
   * 검색 조건 검증
   */
  validateSearchCondition(searchCondition) {
    const validRoomTypes = ['NORMAL', 'CHANNEL', 'CUSTOMER_SUPPORT']
    const validStatuses = ['ACTIVE', 'ARCHIVED', 'BLOCKED', 'DELETED']

    if (searchCondition.roomType && !validRoomTypes.includes(searchCondition.roomType)) {
      searchCondition.roomType = null
    }

    if (searchCondition.status && !validStatuses.includes(searchCondition.status)) {
      searchCondition.status = 'ACTIVE'
    }

    if (searchCondition.keyword && searchCondition.keyword.length > 100) {
      searchCondition.keyword = searchCondition.keyword.substring(0, 100)
    }

    return searchCondition
  },

  /**
   * 채팅방 목록 정렬
   */
  sortChatRooms(rooms, sortBy = 'lastMessage') {
    return [...rooms].sort((a, b) => {
      switch (sortBy) {
        case 'lastMessage':
          return new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        case 'name':
          return a.name.localeCompare(b.name, 'ko-KR')
        case 'unreadCount':
          return b.unreadCount - a.unreadCount
        case 'participantCount':
          return b.participantCount - a.participantCount
        default:
          return new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      }
    })
  },

  /**
   * 채팅방 필터링
   */
  filterChatRooms(rooms, filters) {
    return rooms.filter(room => {
      if (filters.type && room.type !== filters.type) {
        return false
      }

      if (filters.unreadOnly && room.unreadCount === 0) {
        return false
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        return room.name.toLowerCase().includes(keyword) ||
            (room.lastMessage && room.lastMessage.toLowerCase().includes(keyword))
      }

      return true
    })
  }
}

// ==================== 내보내기 ====================

// 싱글톤 인스턴스 생성
export const chatService = new ChatService()

// 별칭 (기존 코드 호환성)
export const chatApi = chatService

// 기본 내보내기
export default chatService