// services/apiService.js
// 백엔드 RefreshJwtFilter와 완전히 연동된 통합 API 서비스

import * as authUtils from '@/utils/auth.js'

/**
 * 통합 API 서비스 클래스
 * - Auth Server (8081): 토큰 발급 및 갱신
 * - Chat Server (8084): 채팅 관련 API
 * - 백엔드 RefreshJwtFilter와 연동하여 자동 토큰 갱신
 */
class IntegratedApiService {
  constructor() {
    // 환경별 URL 설정
    if (import.meta.env.DEV) {
      this.authServerURL = 'http://localhost:8081'
      this.chatServerURL = 'http://localhost:8084'
    } else {
      this.authServerURL = import.meta.env.VITE_AUTH_SERVER_URL || 'https://your-auth-server.com'
      this.chatServerURL = import.meta.env.VITE_CHAT_SERVER_URL || 'https://your-chat-server.com'
    }

    console.log('🌐 통합 API 서비스 초기화됨')
    console.log('Auth Server:', this.authServerURL)
    console.log('Chat Server:', this.chatServerURL)

    // 토큰 갱신 진행 중 요청들을 대기시키기 위한 Promise
    this.refreshPromise = null
  }

  // ==================== 공통 유틸리티 ====================

  // 디바이스 ID 생성/조회
  getDeviceId() {
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = `web_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
      localStorage.setItem('device_id', deviceId)
    }
    return deviceId
  }

  // 공통 헤더 생성
  async getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Device-ID': this.getDeviceId(),
      'X-User-Agent': navigator.userAgent,
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'X-Language': navigator.language || 'ko'
    }

    if (includeAuth) {
      const token = await this.getValidToken()
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      }
    }

    return headers
  }

  // 유효한 토큰 조회 (자동 갱신 포함)
  async getValidToken() {
    let token = authUtils.getAccessToken()

    if (!token) {
      console.warn('⚠️ Access Token이 없습니다.')
      return null
    }

    // 토큰 만료 확인 및 자동 갱신
    if (authUtils.shouldRefreshToken(token)) {
      console.log('🔄 토큰 만료로 인한 자동 갱신...')

      const refreshResult = await this.refreshToken()
      if (refreshResult.success) {
        token = refreshResult.accessToken
      } else {
        console.error('❌ 토큰 갱신 실패')
        return null
      }
    }

    return token
  }

  // ==================== 토큰 갱신 (백엔드 연동) ====================

  // 백엔드 RefreshJwtFilter를 활용한 토큰 갱신
  async refreshToken() {
    // 이미 갱신 중이면 기존 Promise 반환
    if (this.refreshPromise) {
      console.log('🔄 토큰 갱신이 이미 진행 중입니다. 대기...')
      return await this.refreshPromise
    }

    const refreshToken = authUtils.getRefreshToken()
    if (!refreshToken) {
      return { success: false, error: 'No refresh token' }
    }

    // 새로운 갱신 Promise 생성
    this.refreshPromise = this._performTokenRefresh(refreshToken)

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  // 실제 토큰 갱신 수행
  async _performTokenRefresh(refreshToken) {
    try {
      console.log('🔄 백엔드 RefreshJwtFilter를 통한 토큰 갱신...')

      // Auth Server의 보호된 엔드포인트에 Refresh Token으로 요청
      // RefreshJwtFilter가 자동으로 처리하고 응답 헤더에 새 Access Token을 담아줌
      const testEndpoints = [
        `${this.authServerURL}/api/v1/auth/verify`,
        `${this.authServerURL}/api/v1/users/profile`,
        `${this.authServerURL}/api/v1/test/protected`
      ]

      for (const endpoint of testEndpoints) {
        try {
          console.log(`🌐 토큰 갱신 요청: ${endpoint}`)

          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}` // Refresh Token을 Authorization 헤더에
            }
          })

          console.log(`📡 응답 상태: ${response.status}`)

          // 200 OK 또는 404도 인증은 성공
          if (response.ok || response.status === 404) {
            const newAccessToken = response.headers.get('Authorization')

            if (newAccessToken) {
              const cleanToken = newAccessToken.replace('Bearer ', '')
              authUtils.setAccessToken(cleanToken)

              console.log('✅ 토큰 갱신 성공:', endpoint)
              return {
                success: true,
                accessToken: cleanToken,
                refreshToken: refreshToken // 기존 refresh token 유지
              }
            } else {
              console.warn('⚠️ 응답 헤더에 새로운 토큰이 없습니다.')
            }
          } else if (response.status === 401) {
            console.error('❌ Refresh Token이 만료되었습니다.')
            this.handleLogout()
            return { success: false, error: 'Refresh token expired' }
          }

        } catch (endpointError) {
          console.warn(`⚠️ ${endpoint} 요청 실패:`, endpointError.message)
          continue
        }
      }

      console.error('❌ 모든 엔드포인트에서 토큰 갱신 실패')
      return { success: false, error: 'All endpoints failed' }

    } catch (error) {
      console.error('❌ 토큰 갱신 중 오류:', error)
      return { success: false, error: error.message }
    }
  }

  // 로그아웃 처리
  handleLogout() {
    console.log('🚪 로그아웃 처리...')
    authUtils.logout()

    // 로그인 페이지로 리다이렉트
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }

  // ==================== HTTP 요청 래퍼 ====================

  // GET 요청
  async get(url, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = `${url}${queryString ? '?' + queryString : ''}`

    return this.request(fullUrl, {
      method: 'GET',
      ...options
    })
  }

  // POST 요청
  async post(url, data = null, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    })
  }

  // PUT 요청
  async put(url, data = null, options = {}) {
    return this.request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options
    })
  }

  // DELETE 요청
  async delete(url, options = {}) {
    return this.request(url, {
      method: 'DELETE',
      ...options
    })
  }

  // 통합 요청 처리
  async request(url, options = {}) {
    const { retryOnAuth = true, includeAuth = true, ...fetchOptions } = options

    try {
      // 헤더 설정
      const headers = await this.getHeaders(includeAuth)

      const requestOptions = {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers
        }
      }

      console.log(`🌐 [${requestOptions.method}] ${url}`)

      const response = await fetch(url, requestOptions)

      // 401 에러 시 토큰 갱신 후 재시도
      if (response.status === 401 && retryOnAuth && !options._retried) {
        console.log('🔄 401 에러 감지, 토큰 갱신 후 재시도...')

        const refreshResult = await this.refreshToken()
        if (refreshResult.success) {
          console.log('✅ 토큰 갱신 후 재시도...')

          // 재시도 플래그 설정하여 무한 루프 방지
          options._retried = true
          return this.request(url, options)
        } else {
          console.error('❌ 토큰 갱신 실패, 로그아웃 처리')
          this.handleLogout()
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
        }
      }

      // 응답 처리
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

      console.log(`✅ [${requestOptions.method}] ${url} 성공`)
      return await response.json()

    } catch (error) {
      console.error(`❌ [${fetchOptions.method || 'GET'}] ${url} 실패:`, error.message)
      throw error
    }
  }

  // ==================== Auth Server API ====================

  // 로그인
  async login(credentials) {
    const url = `${this.authServerURL}/api/v1/auth/login`
    return this.post(url, credentials, { includeAuth: false })
  }

  // 회원가입
  async register(userData) {
    const url = `${this.authServerURL}/api/v1/auth/register`
    return this.post(url, userData, { includeAuth: false })
  }

  // 토큰 검증
  async verifyToken() {
    const url = `${this.authServerURL}/api/v1/auth/verify`
    return this.get(url)
  }

  // 사용자 프로필 조회
  async getUserProfile() {
    const url = `${this.authServerURL}/api/v1/users/profile`
    return this.get(url)
  }

  // ==================== Chat Server API ====================

  // 채팅방 목록 조회
  async getChatRooms(searchCondition = {}) {
    const url = `${this.chatServerURL}/api/v1/chat/rooms`
    return this.get(url, searchCondition)
  }

  // 채팅방 생성
  async createChatRoom(roomData) {
    const url = `${this.chatServerURL}/api/v1/chat/rooms`
    return this.post(url, roomData)
  }

  // 채팅방 상세 조회
  async getChatRoomDetail(roomId) {
    const url = `${this.chatServerURL}/api/v1/chat/rooms/${roomId}`
    return this.get(url)
  }

  // 채팅방 입장
  async joinChatRoom(roomId) {
    const url = `${this.chatServerURL}/api/v1/chat/rooms/${roomId}/join`
    return this.post(url, { deviceId: this.getDeviceId() })
  }

  // 채팅방 나가기
  async leaveChatRoom(roomId) {
    const url = `${this.chatServerURL}/api/v1/chat/rooms/${roomId}/leave`
    return this.post(url, { deviceId: this.getDeviceId() })
  }

  // 메시지 목록 조회
  async getChatMessages(roomId, params = {}) {
    const url = `${this.chatServerURL}/api/v1/chat/rooms/${roomId}/messages`
    return this.get(url, params)
  }

  // 메시지 전송
  async sendMessage(roomId, messageData) {
    const url = `${this.chatServerURL}/api/v1/chat/rooms/${roomId}/messages`
    const requestData = {
      content: messageData.content,
      type: messageData.type || 'TEXT',
      metadata: messageData.metadata || null,
      deviceId: this.getDeviceId(),
      timestamp: new Date().toISOString()
    }
    return this.post(url, requestData)
  }

  // ==================== 연결 테스트 ====================

  // Auth Server 연결 테스트
  async testAuthConnection() {
    try {
      const testEndpoints = [
        `${this.authServerURL}/actuator/health`,
        `${this.authServerURL}/api/health`,
        `${this.authServerURL}/health`
      ]

      for (const url of testEndpoints) {
        try {
          const response = await fetch(url, { method: 'GET' })
          if (response.ok) {
            console.log('✅ Auth Server 연결 성공:', url)
            return true
          }
        } catch (error) {
          console.warn(`❌ ${url} 연결 실패:`, error.message)
        }
      }

      return false
    } catch (error) {
      console.error('Auth Server 연결 테스트 실패:', error)
      return false
    }
  }

  // Chat Server 연결 테스트
  async testChatConnection() {
    try {
      const testEndpoints = [
        `${this.chatServerURL}/actuator/health`,
        `${this.chatServerURL}/api/health`,
        `${this.chatServerURL}/health`
      ]

      for (const url of testEndpoints) {
        try {
          const response = await fetch(url, { method: 'GET' })
          if (response.ok) {
            console.log('✅ Chat Server 연결 성공:', url)
            return true
          }
        } catch (error) {
          console.warn(`❌ ${url} 연결 실패:`, error.message)
        }
      }

      return false
    } catch (error) {
      console.error('Chat Server 연결 테스트 실패:', error)
      return false
    }
  }

  // 전체 연결 테스트
  async testAllConnections() {
    console.log('🔍 전체 서버 연결 테스트...')

    const authResult = await this.testAuthConnection()
    const chatResult = await this.testChatConnection()

    console.log('Auth Server 연결:', authResult ? '✅' : '❌')
    console.log('Chat Server 연결:', chatResult ? '✅' : '❌')

    return {
      auth: authResult,
      chat: chatResult,
      overall: authResult && chatResult
    }
  }

  // ==================== 디버깅 ====================

  // 토큰 상태 디버깅
  debugTokenStatus() {
    console.group('🔍 통합 API 서비스 토큰 상태')

    const accessToken = authUtils.getAccessToken()
    const refreshToken = authUtils.getRefreshToken()

    console.log('Access Token 존재:', !!accessToken)
    console.log('Refresh Token 존재:', !!refreshToken)

    if (accessToken) {
      console.log('토큰 만료:', authUtils.isTokenExpired(accessToken))
      console.log('토큰 갱신 필요:', authUtils.shouldRefreshToken(accessToken))
      console.log('토큰 남은 시간:', authUtils.getTokenTimeRemaining(accessToken), '분')
    }

    console.log('Auth Server URL:', this.authServerURL)
    console.log('Chat Server URL:', this.chatServerURL)

    console.groupEnd()
  }

  // 전체 상태 디버깅
  async debugSystemStatus() {
    console.group('🔍 시스템 전체 상태 디버깅')

    // 토큰 상태
    this.debugTokenStatus()

    // 서버 연결 상태
    const connections = await this.testAllConnections()
    console.log('서버 연결 상태:', connections)

    // 사용자 정보
    const userInfo = authUtils.getUserInfo()
    console.log('사용자 정보:', userInfo)

    // 인증 상태
    console.log('인증 상태:', authUtils.isAuthenticated())

    console.groupEnd()
  }
}

// 싱글톤 인스턴스 생성
export const apiService = new IntegratedApiService()

// ==================== 편의 함수들 ====================

// Auth 관련 편의 함수들
export const authAPI = {
  login: (credentials) => apiService.login(credentials),
  register: (userData) => apiService.register(userData),
  verifyToken: () => apiService.verifyToken(),
  getUserProfile: () => apiService.getUserProfile(),
  refreshToken: () => apiService.refreshToken(),
  logout: () => apiService.handleLogout(),

  // 인증 상태 확인
  isAuthenticated: () => authUtils.isAuthenticated(),
  getValidToken: () => apiService.getValidToken(),

  // 디버깅
  debugStatus: () => apiService.debugTokenStatus()
}

// Chat 관련 편의 함수들
export const chatAPI = {
  getRooms: (searchCondition) => apiService.getChatRooms(searchCondition),
  createRoom: (roomData) => apiService.createChatRoom(roomData),
  getRoomDetail: (roomId) => apiService.getChatRoomDetail(roomId),
  joinRoom: (roomId) => apiService.joinChatRoom(roomId),
  leaveRoom: (roomId) => apiService.leaveChatRoom(roomId),
  getMessages: (roomId, params) => apiService.getChatMessages(roomId, params),
  sendMessage: (roomId, messageData) => apiService.sendMessage(roomId, messageData),

  // 연결 테스트
  testConnection: () => apiService.testChatConnection()
}

// 시스템 관련 편의 함수들
export const systemAPI = {
  testAllConnections: () => apiService.testAllConnections(),
  debugSystemStatus: () => apiService.debugSystemStatus(),

  // 개별 서버 테스트
  testAuth: () => apiService.testAuthConnection(),
  testChat: () => apiService.testChatConnection()
}

// ==================== Vue Composables ====================

// Vue Composition API용 훅들
export function useAuth() {
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)

      if (response.success && response.data) {
        // 토큰 저장
        authUtils.setTokens(response.data.accessToken, response.data.refreshToken)

        // 사용자 정보 저장
        if (response.data.user) {
          authUtils.setUserInfo(response.data.user)
        }

        console.log('✅ 로그인 성공')
        return { success: true, user: response.data.user }
      } else {
        throw new Error(response.message || '로그인에 실패했습니다')
      }
    } catch (error) {
      console.error('❌ 로그인 실패:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    authAPI.logout()
  }

  const checkAuth = async () => {
    try {
      if (!authUtils.isAuthenticated()) {
        return false
      }

      // 서버에서 토큰 검증
      await authAPI.verifyToken()
      return true
    } catch (error) {
      console.warn('토큰 검증 실패:', error)
      return false
    }
  }

  const refreshToken = async () => {
    try {
      const result = await authAPI.refreshToken()
      return result.success
    } catch (error) {
      console.error('토큰 갱신 실패:', error)
      return false
    }
  }

  return {
    login,
    logout,
    checkAuth,
    refreshToken,
    isAuthenticated: authAPI.isAuthenticated,
    getValidToken: authAPI.getValidToken
  }
}

export function useChat() {
  const getRooms = async (searchCondition = {}) => {
    try {
      const response = await chatAPI.getRooms(searchCondition)
      return {
        success: true,
        data: response.data || [],
        message: response.message
      }
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  const createRoom = async (roomData) => {
    try {
      const response = await chatAPI.createRoom(roomData)
      return {
        success: true,
        data: response.data,
        message: response.message || '채팅방이 생성되었습니다'
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const sendMessage = async (roomId, messageData) => {
    try {
      const response = await chatAPI.sendMessage(roomId, messageData)
      return {
        success: true,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  return {
    getRooms,
    createRoom,
    sendMessage,
    getRoomDetail: chatAPI.getRoomDetail,
    joinRoom: chatAPI.joinRoom,
    leaveRoom: chatAPI.leaveRoom,
    getMessages: chatAPI.getMessages
  }
}

// ==================== 에러 처리 ====================

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }

  static isAuthError(error) {
    return error.status === 401 || error.status === 403
  }

  static isNetworkError(error) {
    return !error.status && error.message.includes('fetch')
  }

  static isServerError(error) {
    return error.status >= 500
  }
}

// ==================== 설정 ====================

export const API_CONFIG = {
  AUTH_SERVER: import.meta.env.DEV ? 'http://localhost:8081' : import.meta.env.VITE_AUTH_SERVER_URL,
  CHAT_SERVER: import.meta.env.DEV ? 'http://localhost:8084' : import.meta.env.VITE_CHAT_SERVER_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  REFRESH_BUFFER_MINUTES: 5
}

// ==================== 기본 내보내기 ====================

// 기본 내보내기 (기존 코드 호환성)
export default apiService

// 모든 API 관련 유틸리티 한번에 내보내기
export {
  apiService,
  authAPI,
  chatAPI,
  systemAPI,
  IntegratedApiService
}