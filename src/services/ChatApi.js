// services/chatApi.js
class ChatApi {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
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

  // 공통 헤더 생성
  getHeaders() {
    const token = this.getAuthToken()
    const deviceId = this.getDeviceId()

    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-Device-ID': deviceId,
      'X-User-Agent': navigator.userAgent,
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'X-Language': navigator.language || 'ko'
    }
  }

  // API 응답 처리
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

  // 요청 로깅
  logRequest(method, url, data = null) {
    console.log(`🌐 [${method}] ${url}`, data ? data : '')
  }

  // 응답 로깅
  logResponse(method, url, response, error = null) {
    if (error) {
      console.error(`❌ [${method}] ${url} 실패:`, error.message)
    } else {
      console.log(`✅ [${method}] ${url} 성공:`, response)
    }
  }

  // === 채팅방 관련 API ===

  // 채팅방 목록 조회 (백엔드 API 연동)
  async getChatRooms(searchCondition = {}) {
    const url = `${this.baseURL}/v1/chat/rooms`
    this.logRequest('GET', url, searchCondition)

    try {
      const queryParams = new URLSearchParams()

      // 백엔드 ChatRoomSearchCondition에 맞는 파라미터 설정
      if (searchCondition.roomType) queryParams.append('roomType', searchCondition.roomType)
      if (searchCondition.status) queryParams.append('status', searchCondition.status)
      if (searchCondition.keyword) queryParams.append('keyword', searchCondition.keyword)

      // 페이징 파라미터 추가 (필요한 경우)
      if (searchCondition.page !== undefined) queryParams.append('page', searchCondition.page)
      if (searchCondition.size !== undefined) queryParams.append('size', searchCondition.size)
      if (searchCondition.sort) queryParams.append('sort', searchCondition.sort)

      const requestUrl = `${url}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      // 백엔드 ApiResponse<List<ChatRoomResponse.List>> 구조에 맞게 처리
      return {
        success: apiResponse.success || true,
        data: apiResponse.data || [], // List<ChatRoomResponse.List>
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)

      // 네트워크 오류나 서버 오류인 경우 샘플 데이터 반환
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ API 오류로 인해 샘플 데이터를 반환합니다.')
        return this.getSampleChatRooms()
      }

      throw error
    }
  }

  // 채팅방 생성 (백엔드 API 연동)
  async createChatRoom(roomData) {
    const url = `${this.baseURL}/v1/chat/rooms`

    // 백엔드 ChatRoomRequest.Create 구조에 맞게 요청 데이터 변환
    const requestData = {
      title: roomData.title,
      description: roomData.description || null,
      roomType: roomData.roomType || 'GROUP', // GROUP, ONE_TO_ONE, CHANNEL
      participantUserIds: roomData.participantUserIds || [],
      isPrivate: roomData.isPrivate || false,
      maxParticipants: roomData.maxParticipants || null,
      thumbnailUrl: roomData.thumbnailUrl || null,
      // creatorId는 백엔드에서 @AuthenticationPrincipal로 자동 설정됨
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

      // 백엔드 ApiResponse<ChatRoomResponse.CreateResult> 구조 처리
      return {
        success: apiResponse.success || true,
        data: apiResponse.data, // ChatRoomResponse.CreateResult
        message: apiResponse.message || '채팅방이 성공적으로 생성되었습니다'
      }

    } catch (error) {
      this.logResponse('POST', url, null, error)
      throw error
    }
  }

  // 샘플 채팅방 데이터 (API 실패 시 사용)
  getSampleChatRooms() {
    return {
      success: true,
      data: [
        {
          roomId: '1',
          title: '개발팀 프로젝트',
          roomType: 'GROUP',
          participantCount: 8,
          lastMessage: '내일 회의 시간 확정했습니다',
          lastMessageType: 'TEXT',
          lastMessageAt: new Date(Date.now() - 300000).toISOString(),
          unreadCount: 3,
          thumbnailUrl: null,
          status: 'ACTIVE'
        },
        {
          roomId: '2',
          title: '이지수',
          roomType: 'ONE_TO_ONE',
          participantCount: 2,
          lastMessage: '점심 뭐 먹을까요?',
          lastMessageType: 'TEXT',
          lastMessageAt: new Date(Date.now() - 600000).toISOString(),
          unreadCount: 1,
          thumbnailUrl: 'https://via.placeholder.com/48/FF6B6B/FFFFFF?text=이',
          status: 'ACTIVE'
        },
        {
          roomId: '3',
          title: '주말 모임 💻',
          roomType: 'GROUP',
          participantCount: 12,
          lastMessage: '사진',
          lastMessageType: 'IMAGE',
          lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
          unreadCount: 7,
          thumbnailUrl: null,
          status: 'ACTIVE'
        },
        {
          roomId: '4',
          title: '최민재',
          roomType: 'ONE_TO_ONE',
          participantCount: 2,
          lastMessage: '내일 봐요!',
          lastMessageType: 'TEXT',
          lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 0,
          thumbnailUrl: 'https://via.placeholder.com/48/4ECDC4/FFFFFF?text=최',
          status: 'ACTIVE'
        },
        {
          roomId: '5',
          title: '가족 단톡방',
          roomType: 'GROUP',
          participantCount: 4,
          lastMessage: '위치',
          lastMessageType: 'LOCATION',
          lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
          unreadCount: 0,
          thumbnailUrl: null,
          status: 'ACTIVE'
        }
      ],
      message: 'sample data'
    }
  }

  // 채팅방 상세 정보 조회
  async getRoomDetail(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}`
    this.logRequest('GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      // 백엔드 ApiResponse<ChatRoomResponse.Detail> 구조 처리
      return {
        success: apiResponse.success || true,
        data: apiResponse.data, // ChatRoomResponse.Detail
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)

      // 오류 시 기본 데이터 반환
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ API 오류로 인해 기본 데이터를 반환합니다.')
        return {
          success: true,
          data: {
            roomId: roomId,
            title: `채팅방 ${roomId}`,
            description: null,
            roomType: 'GROUP',
            status: 'ACTIVE',
            participantCount: 1,
            createdAt: new Date().toISOString(),
            lastMessageAt: null,
            lastMessage: null,
            lastMessageType: null,
            thumbnailUrl: null
          },
          message: 'default data'
        }
      }

      throw error
    }
  }

  // 채팅방 입장
  async joinRoom(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/join`
    const requestData = {
      deviceId: this.getDeviceId(),
      userId: this.getCurrentUserId()
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

      // 입장 API는 실패해도 계속 진행할 수 있도록
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ 채팅방 입장 API 실패했지만 계속 진행합니다.')
        return {
          success: false,
          message: 'join api failed but continue'
        }
      }

      throw error
    }
  }

  // 채팅방 나가기
  async leaveRoom(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/leave`
    const requestData = {
      deviceId: this.getDeviceId(),
      userId: this.getCurrentUserId()
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

      // 나가기 API도 실패해도 UI에서는 처리
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ 채팅방 나가기 API 실패했지만 UI에서는 처리합니다.')
        return {
          success: false,
          message: 'leave api failed but continue'
        }
      }

      throw error
    }
  }

  // 온라인 사용자 조회
  async getOnlineUsers(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/online-users`
    this.logRequest('GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('GET', url, null, error)
      throw error
    }
  }

  // === 메시지 관련 API ===

  // 메시지 목록 조회 (페이징 및 커서 기반)
  async getMessages(roomId, params = {}) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/messages`
    this.logRequest('GET', url, params)

    try {
      // Pageable 파라미터
      const queryParams = new URLSearchParams({
        page: params.page || 0,
        size: params.size || 50,
        sort: params.sort || 'createdAt,desc'
      })

      // 커서 페이징 파라미터가 있는 경우 추가
      if (params.lastMessageId) {
        queryParams.append('lastMessageId', params.lastMessageId)
      }

      // 사용자 ID 추가
      const userId = this.getCurrentUserId()
      if (userId) {
        queryParams.append('userId', userId)
      }

      const requestUrl = `${url}?${queryParams}`
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      // 백엔드 ApiResponse<Page<ChatDetail>> 구조
      return {
        success: apiResponse.success || true,
        data: apiResponse.data, // Page<ChatDetail>
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)

      // 오류 시 빈 페이지 반환
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ 메시지 목록 API 오류로 인해 빈 데이터를 반환합니다.')
        return {
          success: true,
          data: {
            content: this.getSampleMessages(roomId),
            last: true,
            totalElements: 0,
            size: params.size || 50,
            number: params.page || 0
          },
          message: 'sample data due to api error'
        }
      }

      throw error
    }
  }

  // 샘플 메시지 데이터
  getSampleMessages(roomId) {
    const currentUserId = this.getCurrentUserId() || 1

    return [
      {
        messageId: `sample-1-${roomId}`,
        roomId: roomId,
        senderId: currentUserId === 1 ? 2 : 1,
        senderName: currentUserId === 1 ? '상대방' : '나',
        content: '안녕하세요! 잘 지내시나요?',
        type: 'TEXT',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        readCount: 1,
        metadata: null
      },
      {
        messageId: `sample-2-${roomId}`,
        roomId: roomId,
        senderId: currentUserId,
        senderName: '나',
        content: '네, 안녕하세요! 저도 잘 지내고 있어요.',
        type: 'TEXT',
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        readCount: 1,
        metadata: null
      },
      {
        messageId: `sample-3-${roomId}`,
        roomId: roomId,
        senderId: currentUserId === 1 ? 2 : 1,
        senderName: currentUserId === 1 ? '상대방' : '나',
        content: '오늘 날씨가 정말 좋네요!',
        type: 'TEXT',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        readCount: 1,
        metadata: null
      }
    ]
  }

  // 메시지 전송
  async sendMessage(roomId, messageData) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/messages`
    const requestData = {
      ...messageData,
      senderId: this.getCurrentUserId(),
      deviceId: this.getDeviceId(),
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

      // 메시지 전송 실패 시 임시 응답 반환
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ 메시지 전송 API 실패, 임시 응답을 반환합니다.')
        return {
          success: false,
          data: {
            message: {
              messageId: `temp-${Date.now()}`,
              roomId: roomId,
              senderId: this.getCurrentUserId(),
              senderName: '나',
              content: messageData.content,
              type: messageData.type || 'TEXT',
              createdAt: new Date().toISOString(),
              status: 'FAILED'
            }
          },
          message: 'send failed'
        }
      }

      throw error
    }
  }

  // === 유틸리티 메서드 ===

  // 연결 테스트
  async testConnection() {
    const url = `${this.baseURL}/health`
    this.logRequest('GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)
      return true

    } catch (error) {
      this.logResponse('GET', url, null, error)
      return false
    }
  }

  // 인증 상태 확인
  isAuthenticated() {
    const token = this.getAuthToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (error) {
      return false
    }
  }

  // 토큰 만료 시간 확인
  getTokenExpiryTime() {
    const token = this.getAuthToken()
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return new Date(payload.exp * 1000)
    } catch (error) {
      return null
    }
  }

  // 네트워크 상태 확인
  async checkNetworkStatus() {
    if (!navigator.onLine) {
      return { online: false, message: '네트워크 연결이 끊어졌습니다.' }
    }

    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'HEAD',
        cache: 'no-cache'
      })
      return {
        online: response.ok,
        message: response.ok ? '네트워크 연결 정상' : '서버 연결 불가'
      }
    } catch (error) {
      return { online: false, message: '서버에 연결할 수 없습니다.' }
    }
  }
}

// 싱글톤 인스턴스 생성
export const chatApi = new ChatApi()

// 기본 내보내기
export default chatApi

// 채팅방 관련 유틸리티 함수들
export const chatRoomUtils = {
  // 채팅방 타입 변환 (백엔드 -> 프론트엔드)
  convertRoomType(backendType) {
    const typeMap = {
      'ONE_TO_ONE': 'dm',
      'GROUP': 'group',
      'CHANNEL': 'channel'
    }
    return typeMap[backendType] || 'group'
  },

  // 채팅방 타입 변환 (프론트엔드 -> 백엔드)
  convertRoomTypeToBackend(frontendType) {
    const typeMap = {
      'dm': 'ONE_TO_ONE',
      'group': 'GROUP',
      'channel': 'CHANNEL'
    }
    return typeMap[frontendType] || 'GROUP'
  },

  // 백엔드 응답을 프론트엔드 형식으로 변환
  transformChatRoomResponse(backendRoom) {
    return {
      id: backendRoom.roomId,
      name: backendRoom.title,
      type: this.convertRoomType(backendRoom.roomType),
      participantCount: backendRoom.participantCount,
      lastMessage: backendRoom.lastMessage || '메시지가 없습니다',
      lastMessageSender: null,
      lastMessageType: backendRoom.lastMessageType ? backendRoom.lastMessageType.toLowerCase() : 'text',
      lastMessageAt: backendRoom.lastMessageAt ? new Date(backendRoom.lastMessageAt).getTime() : Date.now(),
      unreadCount: backendRoom.unreadCount || 0,
      status: backendRoom.status === 'ACTIVE' ? 'online' : 'offline',
      avatar: backendRoom.thumbnailUrl
    }
  },

  // 채팅방 생성 요청 데이터 검증
  validateCreateRoomData(roomData) {
    const errors = []

    if (!roomData.title || roomData.title.trim().length === 0) {
      errors.push('채팅방 제목은 필수입니다.')
    }

    if (roomData.title && roomData.title.length > 50) {
      errors.push('채팅방 제목은 50자 이하여야 합니다.')
    }

    if (!['GROUP', 'ONE_TO_ONE', 'CHANNEL'].includes(roomData.roomType)) {
      errors.push('올바른 채팅방 타입을 선택해주세요.')
    }

    if (roomData.roomType === 'ONE_TO_ONE' && (!roomData.participantUserIds || roomData.participantUserIds.length !== 1)) {
      errors.push('1:1 채팅방은 상대방 1명을 선택해야 합니다.')
    }

    if (roomData.roomType === 'GROUP' && roomData.maxParticipants && roomData.maxParticipants < 2) {
      errors.push('그룹 채팅방은 최소 2명 이상이어야 합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  },

  // 검색 조건 검증
  validateSearchCondition(searchCondition) {
    const validRoomTypes = ['GROUP', 'ONE_TO_ONE', 'CHANNEL']
    const validStatuses = ['ACTIVE', 'INACTIVE', 'DELETED']

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

  // 채팅방 목록 정렬
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

  // 채팅방 필터링
  filterChatRooms(rooms, filters) {
    return rooms.filter(room => {
      // 타입 필터
      if (filters.type && room.type !== filters.type) {
        return false
      }

      // 읽지 않은 메시지 필터
      if (filters.unreadOnly && room.unreadCount === 0) {
        return false
      }

      // 검색 키워드 필터
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        return room.name.toLowerCase().includes(keyword) ||
            (room.lastMessage && room.lastMessage.toLowerCase().includes(keyword))
      }

      return true
    })
  }
}