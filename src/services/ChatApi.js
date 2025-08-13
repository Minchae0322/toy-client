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

  // 채팅방 목록 조회
  async getChatRooms(searchCondition = {}) {
    const url = `${this.baseURL}/api/chat/rooms`
    this.logRequest('GET', url, searchCondition)

    try {
      const queryParams = new URLSearchParams()
      if (searchCondition.roomType) queryParams.append('roomType', searchCondition.roomType)
      if (searchCondition.status) queryParams.append('status', searchCondition.status)
      if (searchCondition.keyword) queryParams.append('keyword', searchCondition.keyword)

      const requestUrl = `${url}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      // ApiResponse<List<ChatRoomResponse.List>> 구조
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

  // 샘플 채팅방 데이터
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
          thumbnailUrl: null
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
          thumbnailUrl: 'https://via.placeholder.com/48/FF6B6B/FFFFFF?text=이'
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
          thumbnailUrl: null
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
          thumbnailUrl: 'https://via.placeholder.com/48/4ECDC4/FFFFFF?text=최'
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
          thumbnailUrl: null
        }
      ],
      message: 'sample data'
    }
  }

  // 채팅방 정보 조회
  async getRoomDetail(roomId) {
    const url = `${this.baseURL}/api/chat/rooms/${roomId}`
    this.logRequest('GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      // ApiResponse<ChatRoomResponse.Detail> 구조
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
            participantCount: 1
          },
          message: 'default data'
        }
      }

      throw error
    }
  }

  // 채팅방 생성
  async createRoom(roomData) {
    const url = `${this.baseURL}/api/chat/rooms`
    this.logRequest('POST', url, roomData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(roomData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('POST', url, null, error)
      throw error
    }
  }

  // 채팅방 입장
  async joinRoom(roomId) {
    const url = `${this.baseURL}/api/chat/rooms/${roomId}/join`
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
    const url = `${this.baseURL}/api/chat/rooms/${roomId}/leave`
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
    const url = `${this.baseURL}/api/chat/rooms/${roomId}/online-users`
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
    const url = `${this.baseURL}/api/chat/rooms/${roomId}/messages`
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

      // ApiResponse<Page<ChatDetail>> 구조
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
    const url = `${this.baseURL}/api/chat/rooms/${roomId}/messages`
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

  // 메시지 수정
  async updateMessage(roomId, messageId, messageData) {
    const url = `${this.baseURL}/api/chat/rooms/${roomId}/messages/${messageId}`
    this.logRequest('PUT', url, messageData)

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(messageData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('PUT', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('PUT', url, null, error)
      throw error
    }
  }

  // 메시지 삭제
  async deleteMessage(roomId, messageId) {
    const url = `${this.baseURL}/api/chat/rooms/${roomId}/messages/${messageId}`
    this.logRequest('DELETE', url)

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('DELETE', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('DELETE', url, null, error)
      throw error
    }
  }

  // 메시지 읽음 처리
  async markAsRead(roomId, messageId) {
    const url = `${this.baseURL}/api/chat/rooms/${roomId}/messages/${messageId}/read`
    const requestData = {
      userId: this.getCurrentUserId(),
      deviceId: this.getDeviceId(),
      readAt: new Date().toISOString()
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
      throw error
    }
  }

  // === 파일 업로드 관련 API ===

  // 파일 업로드
  async uploadFile(file, roomId = null) {
    const url = `${this.baseURL}/api/chat/files/upload`
    this.logRequest('POST', url, { fileName: file.name, fileSize: file.size, roomId })

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (roomId) formData.append('roomId', roomId)
      formData.append('deviceId', this.getDeviceId())

      // FormData 사용 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
      const headers = { ...this.getHeaders() }
      delete headers['Content-Type']

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('POST', url, null, error)
      throw error
    }
  }

  // === 검색 관련 API ===

  // 메시지 검색
  async searchMessages(roomId, query, params = {}) {
    const url = `${this.baseURL}/api/chat/rooms/${roomId}/messages/search`
    const searchParams = { query, ...params }
    this.logRequest('GET', url, searchParams)

    try {
      const queryParams = new URLSearchParams({
        q: query,
        page: params.page || 0,
        size: params.size || 20,
        sort: params.sort || 'createdAt,desc'
      })

      const requestUrl = `${url}?${queryParams}`
      const response = await fetch(requestUrl, {
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

  // === 유틸리티 메서드 ===

  // 연결 테스트
  async testConnection() {
    const url = `${this.baseURL}/api/health`
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
      const response = await fetch(`${this.baseURL}/api/health`, {
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

// 추가 유틸리티 함수들
export const chatApiUtils = {
  // 메시지 타입 검증
  isValidMessageType(type) {
    const validTypes = ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LOCATION', 'SYSTEM']
    return validTypes.includes(type?.toUpperCase())
  },

  // 채팅방 타입 검증
  isValidRoomType(type) {
    const validTypes = ['ONE_TO_ONE', 'GROUP', 'CHANNEL']
    return validTypes.includes(type?.toUpperCase())
  },

  // 파일 크기 검증 (10MB 제한)
  isValidFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  },

  // 지원되는 파일 타입 검증
  isValidFileType(file) {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'application/pdf', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    return allowedTypes.includes(file.type)
  },

  // 메시지 내용 검증
  isValidMessageContent(content, type = 'TEXT') {
    if (type === 'TEXT') {
      return content && content.trim().length > 0 && content.length <= 1000
    }
    return true // 다른 타입은 별도 검증
  },

  // 에러 메시지 포맷팅
  formatErrorMessage(error) {
    if (error.status === 401) {
      return '인증이 필요합니다. 다시 로그인해주세요.'
    } else if (error.status === 403) {
      return '권한이 없습니다.'
    } else if (error.status === 404) {
      return '요청한 리소스를 찾을 수 없습니다.'
    } else if (error.status === 429) {
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    } else if (error.status >= 500) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    } else {
      return error.message || '알 수 없는 오류가 발생했습니다.'
    }
  },

  // 시간 포맷팅
  formatMessageTime(timestamp) {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInMs = now - messageTime
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) {
      return '방금 전'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`
    } else {
      return messageTime.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },

  // 메시지 내용 미리보기 생성
  generateMessagePreview(message) {
    switch (message.type?.toUpperCase()) {
      case 'TEXT':
        return message.content?.length > 50
            ? message.content.substring(0, 50) + '...'
            : message.content
      case 'IMAGE':
        return '📷 사진'
      case 'VIDEO':
        return '🎥 동영상'
      case 'AUDIO':
        return '🎵 음성메시지'
      case 'FILE':
        return '📎 파일'
      case 'LOCATION':
        return '📍 위치'
      case 'SYSTEM':
        return message.content || '시스템 메시지'
      default:
        return '메시지'
    }
  },

  // 읽지 않은 메시지 수 계산
  calculateUnreadCount(messages, lastReadMessageId, currentUserId) {
    if (!lastReadMessageId || !messages.length) return 0

    const lastReadIndex = messages.findIndex(msg => msg.messageId === lastReadMessageId)
    if (lastReadIndex === -1) return messages.length

    return messages.slice(lastReadIndex + 1)
    .filter(msg => msg.senderId !== currentUserId).length
  },

  // 채팅방 정렬
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

  // 메시지 그룹화 (날짜별)
  groupMessagesByDate(messages) {
    const groups = {}

    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return groups
  },

  // 온라인 상태 확인
  isUserOnline(lastSeen, thresholdMinutes = 5) {
    if (!lastSeen) return false

    const now = new Date()
    const lastSeenTime = new Date(lastSeen)
    const diffInMinutes = (now - lastSeenTime) / (1000 * 60)

    return diffInMinutes <= thresholdMinutes
  },

  // 디바이스 타입 감지
  getDeviceType() {
    const userAgent = navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile'
    }
    return 'desktop'
  },

  // 알림 권한 확인
  checkNotificationPermission() {
    if (!('Notification' in window)) {
      return 'not-supported'
    }
    return Notification.permission
  },

  // 브라우저 알림 표시
  showBrowserNotification(title, options = {}) {
    if (this.checkNotificationPermission() === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'chat-notification',
        renotify: true,
        ...options
      })
    }
    return null
  }
}