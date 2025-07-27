// services/chatApi.js
class ChatApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    this.timeout = 30000 // 30초 타임아웃
    this.retryAttempts = 3
    this.retryDelay = 1000
  }

  // HTTP 요청 헬퍼 함수 (재시도 로직 포함)
  async request(endpoint, options = {}) {
    let lastError

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await this._makeRequest(endpoint, options)
      } catch (error) {
        lastError = error

        // 재시도할 수 없는 에러들
        if (error.status >= 400 && error.status < 500) {
          throw error
        }

        // 마지막 시도가 아니면 재시도
        if (attempt < this.retryAttempts) {
          console.warn(`API 요청 실패, ${attempt}/${this.retryAttempts} 재시도 중...`, error.message)
          await this._delay(this.retryDelay * attempt)
        }
      }
    }

    throw lastError
  }

  // 실제 HTTP 요청 수행
  async _makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      },
      ...options
    }

    // body가 FormData가 아닌 경우에만 JSON으로 변환
    if (config.body && !(config.body instanceof FormData) && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    // FormData인 경우 Content-Type 헤더 제거 (브라우저가 자동 설정)
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type']
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return response

    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다')
      }
      throw error
    }
  }

  // 지연 함수
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 인증 헤더 가져오기
  getAuthHeaders() {
    const token = this.getAccessToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // 액세스 토큰 가져오기
  getAccessToken() {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  }

  // 리프레시 토큰 가져오기
  getRefreshToken() {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
  }

  // 토큰 저장
  setTokens(accessToken, refreshToken, remember = true) {
    const storage = remember ? localStorage : sessionStorage

    if (accessToken) {
      storage.setItem('accessToken', accessToken)
    }
    if (refreshToken) {
      storage.setItem('refreshToken', refreshToken)
    }
  }

  // 토큰 제거
  clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
  }

  // 에러 응답 처리
  async handleErrorResponse(response) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let errorData = null

    try {
      errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      }
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }

    // 인증 에러 처리
    if (response.status === 401) {
      await this.handleUnauthorized()
    }

    const error = new Error(errorMessage)
    error.status = response.status
    error.response = response
    error.data = errorData
    throw error
  }

  // 인증 실패 처리
  async handleUnauthorized() {
    const refreshToken = this.getRefreshToken()

    if (refreshToken) {
      try {
        // 토큰 갱신 시도
        await this.refreshAccessToken()
        return // 성공하면 종료
      } catch (error) {
        console.warn('토큰 갱신 실패:', error)
      }
    }

    // 토큰 갱신 실패 또는 리프레시 토큰이 없는 경우
    this.clearTokens()

    // 로그인 페이지로 리다이렉트 (실제 구현에서는 라우터 사용)
    if (typeof window !== 'undefined') {
      console.warn('인증이 만료되었습니다. 다시 로그인해주세요.')
      // 커스텀 이벤트 발행 (앱에서 처리)
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }
  }

  // CRUD 메서드들
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item))
        } else {
          searchParams.append(key, value)
        }
      }
    })

    const queryString = searchParams.toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request(url, { method: 'GET' })
  }

  async post(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    })
  }

  async put(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    })
  }

  async patch(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // 파일 업로드 (진행률 추적 지원)
  async uploadFile(endpoint, file, onProgress = null, metadata = {}) {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)

      // 메타데이터 추가
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const xhr = new XMLHttpRequest()

      // 진행률 추적
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            onProgress(percentComplete)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch {
            resolve({ data: { fileUrl: xhr.responseText } })
          }
        } else {
          reject(new Error(`업로드 실패: ${xhr.status} ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('네트워크 오류가 발생했습니다'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('업로드 시간이 초과되었습니다'))
      })

      xhr.open('POST', `${this.baseURL}${endpoint}`)
      xhr.timeout = this.timeout

      // 인증 헤더 추가
      const authHeaders = this.getAuthHeaders()
      Object.entries(authHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      xhr.send(formData)
    })
  }

  // ===== 인증 관련 API =====

  // 로그인
  async login(credentials) {
    const response = await this.post('/auth/login', credentials)

    if (response.data?.accessToken) {
      this.setTokens(
          response.data.accessToken,
          response.data.refreshToken,
          credentials.remember
      )
    }

    return response
  }

  // 로그아웃
  async logout() {
    try {
      await this.post('/auth/logout', {
        refreshToken: this.getRefreshToken()
      })
    } catch (error) {
      console.warn('로그아웃 API 호출 실패:', error)
    } finally {
      this.clearTokens()
    }
  }

  // 토큰 갱신
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('Refresh token not found')
    }

    const response = await this.post('/auth/refresh', { refreshToken })

    if (response.data?.accessToken) {
      this.setTokens(
          response.data.accessToken,
          response.data.refreshToken || refreshToken,
          true
      )
      return response.data.accessToken
    }

    throw new Error('Invalid refresh response')
  }

  // 현재 사용자 정보 조회
  async getCurrentUser() {
    return this.get('/v1/users/me')
  }

  // ===== 채팅방 관련 API =====

  // 채팅방 목록 조회
  async getChatRooms(searchCondition = {}) {
    return this.get('/v1/chat/rooms', searchCondition)
  }

  // 채팅방 상세 조회
  async getRoomDetail(roomId) {
    return this.get(`/v1/chat/rooms/${roomId}`)
  }

  // 채팅방 생성
  async createRoom(roomData) {
    return this.post('/v1/chat/rooms', roomData)
  }

  // 채팅방 수정
  async updateRoom(roomId, updateData) {
    return this.put(`/v1/chat/rooms/${roomId}`, updateData)
  }

  // 채팅방 입장
  async joinRoom(roomId) {
    return this.post(`/v1/chat/rooms/${roomId}/join`)
  }

  // 채팅방 퇴장
  async leaveRoom(roomId) {
    return this.post(`/v1/chat/rooms/${roomId}/leave`)
  }

  // 채팅방 삭제
  async deleteRoom(roomId) {
    return this.delete(`/v1/chat/rooms/${roomId}`)
  }

  // ===== 메시지 관련 API =====

  // 메시지 목록 조회
  async getMessages(roomId, params = {}) {
    return this.get(`/api/chat/${roomId}/messages`, params)
  }

  // 텍스트 메시지 전송
  async sendMessage(roomId, messageData) {
    return this.post(`/api/chat/rooms/${roomId}/messages`, messageData)
  }

  // 파일 메시지 전송
  async sendFileMessage(roomId, file, messageType = 'FILE', metadata = {}, onProgress = null) {
    try {
      // 1. 파일 업로드
      const uploadResponse = await this.uploadFile(
          '/api/files/upload',
          file,
          onProgress,
          {
            roomId: roomId,
            messageType: messageType
          }
      )

      // 2. 메시지 전송
      const messageData = {
        content: uploadResponse.data.fileUrl,
        type: messageType,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileId: uploadResponse.data.fileId,
          ...metadata
        }
      }

      return this.sendMessage(roomId, messageData)

    } catch (error) {
      console.error('파일 메시지 전송 실패:', error)
      throw error
    }
  }

  // 메시지 수정
  async updateMessage(roomId, messageId, content) {
    return this.put(`/api/chat/rooms/${roomId}/messages/${messageId}`, { content })
  }

  // 메시지 삭제
  async deleteMessage(roomId, messageId) {
    return this.delete(`/api/chat/rooms/${roomId}/messages/${messageId}`)
  }

  // 메시지 읽음 처리
  async markAsRead(roomId, messageId) {
    return this.post(`/api/chat/rooms/${roomId}/messages/${messageId}/read`)
  }

  // 메시지 검색
  async searchMessages(roomId, query, params = {}) {
    return this.get(`/api/chat/rooms/${roomId}/messages/search`, {
      query,
      ...params
    })
  }

  // ===== 참여자 관련 API =====

  // 채팅방 참여자 목록 조회
  async getRoomParticipants(roomId) {
    return this.get(`/v1/chat/rooms/${roomId}/participants`)
  }

  // 채팅방에 사용자 초대
  async inviteUsers(roomId, userIds) {
    return this.post(`/v1/chat/rooms/${roomId}/invite`, { userIds })
  }

  // 채팅방에서 사용자 제거
  async removeUser(roomId, userId) {
    return this.delete(`/v1/chat/rooms/${roomId}/participants/${userId}`)
  }

  // 채팅방 관리자 권한 부여
  async grantAdminRole(roomId, userId) {
    return this.post(`/v1/chat/rooms/${roomId}/participants/${userId}/admin`)
  }

  // 채팅방 관리자 권한 해제
  async revokeAdminRole(roomId, userId) {
    return this.delete(`/v1/chat/rooms/${roomId}/participants/${userId}/admin`)
  }

  // ===== 사용자 관련 API =====

  // 사용자 검색
  async searchUsers(query, params = {}) {
    return this.get('/v1/users/search', { query, ...params })
  }

  // 친구 목록 조회
  async getFriends() {
    return this.get('/v1/users/friends')
  }

  // 친구 요청 전송
  async sendFriendRequest(userId) {
    return this.post(`/v1/users/${userId}/friend-request`)
  }

  // 친구 요청 수락
  async acceptFriendRequest(requestId) {
    return this.post(`/v1/users/friend-requests/${requestId}/accept`)
  }

  // 친구 요청 거절
  async rejectFriendRequest(requestId) {
    return this.post(`/v1/users/friend-requests/${requestId}/reject`)
  }

  // 사용자 프로필 조회
  async getUserProfile(userId) {
    return this.get(`/v1/users/${userId}/profile`)
  }

  // 내 프로필 수정
  async updateMyProfile(profileData) {
    return this.put('/v1/users/me/profile', profileData)
  }

  // ===== 알림 관련 API =====

  // Push 알림 구독 등록
  async subscribePushNotification(subscription) {
    return this.post('/api/push/subscribe', {
      subscription,
      userId: await this.getCurrentUserId()
    })
  }

  // Push 알림 구독 해제
  async unsubscribePushNotification(subscription) {
    return this.post('/api/push/unsubscribe', {
      subscription,
      userId: await this.getCurrentUserId()
    })
  }

  // 알림 설정 조회
  async getNotificationSettings() {
    return this.get('/api/notifications/settings')
  }

  // 알림 설정 업데이트
  async updateNotificationSettings(settings) {
    return this.put('/api/notifications/settings', settings)
  }

  // 알림 목록 조회
  async getNotifications(params = {}) {
    return this.get('/api/notifications', params)
  }

  // 알림 읽음 처리
  async markNotificationAsRead(notificationId) {
    return this.post(`/api/notifications/${notificationId}/read`)
  }

  // ===== 파일 관련 API =====

  // 파일 다운로드 URL 생성
  getFileDownloadUrl(fileId) {
    const token = this.getAccessToken()
    const params = token ? `?token=${encodeURIComponent(token)}` : ''
    return `${this.baseURL}/api/files/${fileId}/download${params}`
  }

  // 이미지 썸네일 URL 생성
  getImageThumbnailUrl(fileId, size = 'medium') {
    const token = this.getAccessToken()
    const params = new URLSearchParams({ size })
    if (token) params.append('token', token)
    return `${this.baseURL}/api/files/${fileId}/thumbnail?${params.toString()}`
  }

  // 파일 정보 조회
  async getFileInfo(fileId) {
    return this.get(`/api/files/${fileId}`)
  }

  // 파일 삭제
  async deleteFile(fileId) {
    return this.delete(`/api/files/${fileId}`)
  }

  // ===== 유틸리티 메서드 =====

  // 연결 상태 확인
  async healthCheck() {
    try {
      await this.get('/health')
      return true
    } catch {
      return false
    }
  }

  // 현재 사용자 ID 가져오기
  async getCurrentUserId() {
    try {
      const user = await this.getCurrentUser()
      return user.data?.userId
    } catch {
      return null
    }
  }

  // API 응답 래퍼 (성공/실패 처리)
  async safeRequest(requestFn, fallbackValue = null) {
    try {
      return await requestFn()
    } catch (error) {
      console.warn('API 요청 실패:', error.message)
      return fallbackValue
    }
  }

  // 배치 요청 처리
  async batchRequest(requests) {
    const results = await Promise.allSettled(requests)

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, data: result.value, index }
      } else {
        return { success: false, error: result.reason, index }
      }
    })
  }

  // WebSocket 토큰 가져오기 (WebSocket 인증용)
  async getWebSocketToken() {
    try {
      const response = await this.post('/auth/ws-token')
      return response.data?.token
    } catch (error) {
      console.error('WebSocket 토큰 생성 실패:', error)
      return null
    }
  }

  // 디버깅용 로그
  enableDebugMode() {
    this._debugMode = true
    console.log('Chat API Debug Mode 활성화')
  }

  disableDebugMode() {
    this._debugMode = false
  }

  _debugLog(...args) {
    if (this._debugMode) {
      console.log('[ChatAPI]', ...args)
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const chatApi = new ChatApiService()

// 개별 API 함수들도 내보내기 (편의성)
export const {
  refreshAccessToken,
  getCurrentUser,

  // 채팅방
  getChatRooms,
  getRoomDetail,
  createRoom,
  updateRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,

  // 메시지
  getMessages,
  sendMessage,
  sendFileMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
  searchMessages,

  // 참여자
  getRoomParticipants,
  inviteUsers,
  removeUser,
  grantAdminRole,
  revokeAdminRole,

  // 사용자
  searchUsers,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getUserProfile,
  updateMyProfile,

  // 알림
  subscribePushNotification,
  unsubscribePushNotification,
  getNotificationSettings,
  updateNotificationSettings,
  getNotifications,
  markNotificationAsRead,

  // 파일
  getFileDownloadUrl,
  getImageThumbnailUrl,
  getFileInfo,
  deleteFile,

  // 유틸리티
  healthCheck,
  getCurrentUserId,
  safeRequest,
  batchRequest,
  getWebSocketToken
} = chatApi

// API 상태 관리
export class ApiStatus {
  static isOnline = navigator.onLine
  static lastHealthCheck = null
  static healthCheckInterval = null

  static startHealthCheck(interval = 60000) {
    this.stopHealthCheck()

    this.healthCheckInterval = setInterval(async () => {
      try {
        const isHealthy = await chatApi.healthCheck()
        this.lastHealthCheck = Date.now()

        if (!isHealthy && this.isOnline) {
          window.dispatchEvent(new CustomEvent('api:unhealthy'))
        }
      } catch (error) {
        console.warn('Health check failed:', error)
      }
    }, interval)
  }

  static stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  static getStatus() {
    return {
      isOnline: this.isOnline,
      lastHealthCheck: this.lastHealthCheck,
      isHealthy: this.lastHealthCheck && (Date.now() - this.lastHealthCheck) < 120000
    }
  }
}

// 네트워크 상태 감지
window.addEventListener('online', () => {
  ApiStatus.isOnline = true
  window.dispatchEvent(new CustomEvent('api:online'))
})

window.addEventListener('offline', () => {
  ApiStatus.isOnline = false
  window.dispatchEvent(new CustomEvent('api:offline'))
})

// API 에러 타입 정의
export class ApiError extends Error {
  constructor(message, status, response, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.response = response
    this.data = data
  }
}

// 특수 에러 타입들
export class NetworkError extends ApiError {
  constructor(message = '네트워크 연결을 확인해주세요') {
    super(message, 0, null, null)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends ApiError {
  constructor(message = '요청 시간이 초과되었습니다') {
    super(message, 408, null, null)
    this.name = 'TimeoutError'
  }
}

export class AuthError extends ApiError {
  constructor(message = '인증이 필요합니다') {
    super(message, 401, null, null)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = '권한이 없습니다') {
    super(message, 403, null, null)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = '요청한 리소스를 찾을 수 없습니다') {
    super(message, 404, null, null)
    this.name = 'NotFoundError'
  }
}

export class ServerError extends ApiError {
  constructor(message = '서버 오류가 발생했습니다') {
    super(message, 500, null, null)
    this.name = 'ServerError'
  }
}


export default chatApi