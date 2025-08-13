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
      throw error
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

      // 사용자 ID 추가 (백엔드에서 필요한 경우)
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
        data: apiResponse.data, // Page<ChatDetail> - Spring Data의 Page 객체
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)
      throw error
    }
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
  }
}