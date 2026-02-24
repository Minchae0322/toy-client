// services/BaseApiService.js
// Fetch API 기반 HTTP 클라이언트
// - 모든 API 서비스의 공통 기반 클래스
// - 401 에러 시 자동 토큰 갱신 및 재시도
//
// 참고: Axios 기반 요청은 api/interceptors.js가 토큰 갱신 담당

import * as authUtils from '@/utils/auth.js'
import { manualRefreshToken } from '@/api/interceptors.js'

/**
 * API 서비스 기반 클래스
 * - Fetch API 기반 HTTP 통신
 * - 토큰 자동 갱신
 * - 공통 에러 처리
 * - 요청/응답 인터셉터 기능
 */
export class BaseApiService {
  constructor(baseURL, serviceName = 'API') {
    this.baseURL = baseURL
    this.serviceName = serviceName

    // 토큰 갱신 상태 관리
    this.isRefreshing = false
    this.failedQueue = []

    console.log(`🌐 [${this.serviceName}] 서비스 초기화됨: ${baseURL}`)
  }

  // ==================== 공통 헤더 생성 ====================

  /**
   * API 요청용 기본 헤더 생성
   */
  getDefaultHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Device-ID': authUtils.getDeviceId(),
      'X-User-Agent': navigator.userAgent,
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'X-Language': navigator.language || 'ko'
    }

    if (includeAuth) {
      const token = authUtils.getAccessToken()
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      }
    }

    return headers
  }

  // ==================== 토큰 갱신 ====================

  /**
   * 토큰 갱신 - interceptors.js의 manualRefreshToken에 위임하여
   * Axios/Fetch 양쪽의 갱신 요청을 단일 채널로 통합 (경쟁 조건 방지)
   */
  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      })
    }

    this.isRefreshing = true

    try {
      console.log(`🔄 [${this.serviceName}] 토큰 갱신 시작 (interceptor 위임)`)

      const success = await manualRefreshToken()

      if (success) {
        const accessToken = authUtils.getAccessToken()
        console.log(`✅ [${this.serviceName}] 토큰 갱신 완료`)
        this.processQueue(null, accessToken)
        return accessToken
      }

      throw new Error('토큰 갱신 실패')

    } catch (error) {
      console.error(`❌ [${this.serviceName}] 토큰 갱신 실패:`, error.message)

      this.processQueue(error, null)

      // interceptor 쪽에서 이미 logout/redirect를 처리하므로 여기서는 중복 실행하지 않음
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * 대기열 처리
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    this.failedQueue = []
  }

  // ==================== 핵심 요청 메서드 ====================

  /**
   * 통합 fetch 요청 처리
   */
  async request(url, options = {}) {
    const { retryOnAuth = true, includeAuth = true, ...fetchOptions } = options

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`

    try {
      let headers = {
        ...this.getDefaultHeaders(includeAuth),
        ...fetchOptions.headers
      }

      if (fetchOptions.body instanceof FormData) {
        delete headers['Content-Type']
      }

      const requestOptions = {
        ...fetchOptions,
        headers,
        credentials: 'include' // ⭐ 모든 요청에 쿠키 포함
      }

      // 요청 로깅
      if (import.meta.env.DEV) {
        console.log(`📤 [${this.serviceName}] ${requestOptions.method || 'GET'} ${fullUrl}`)
      }

      const response = await fetch(fullUrl, requestOptions)

      // 401 에러 시 토큰 갱신 후 재시도
      if (response.status === 401 && retryOnAuth && !options._retried) {
        console.log(`🔄 [${this.serviceName}] 401 에러 감지, 토큰 갱신 후 재시도...`)

        try {
          const newToken = await this.refreshToken()

          // 새 토큰으로 헤더 업데이트
          const newHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`
          }

          // 재시도 플래그 설정하여 무한 루프 방지
          const retryOptions = {
            ...requestOptions,
            headers: newHeaders,
            _retried: true
          }

          console.log(`✅ [${this.serviceName}] 토큰 갱신 후 재시도...`)
          return this.request(url, { ...options, _retried: true })

        } catch (refreshError) {
          console.error(`❌ [${this.serviceName}] 토큰 갱신 실패, 로그아웃 처리`)
          throw new ApiError('인증이 만료되었습니다. 다시 로그인해주세요.', 401, null, this.serviceName)
        }
      }

      // 응답 처리
      if (!response.ok) {
        let errorData = {}
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json()
          } else {
            errorData = { message: await response.text() }
          }
        } catch (parseError) {
          console.warn(`⚠️ [${this.serviceName}] 에러 응답 파싱 실패:`, parseError)
          errorData = { message: response.statusText }
        }

        const errorMessage = errorData.message ||
            errorData.error ||
            errorData.detail ||
            `HTTP ${response.status} ${response.statusText}`

        throw new ApiError(errorMessage, response.status, errorData, this.serviceName)
      }

      // 성공 응답 로깅
      if (import.meta.env.DEV) {
        console.log(`📥 [${this.serviceName}] ${response.status} ${fullUrl}`)
      }

      // JSON 응답 파싱
      const contentType = response.headers.get('content-type')
      let responseData = null

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      return this.handleSuccessResponse({
        data: responseData,
        status: response.status,
        headers: response.headers
      })

    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      console.error(`❌ [${this.serviceName}] ${fetchOptions.method || 'GET'} ${fullUrl} 실패:`, error.message)
      throw new ApiError(error.message, null, null, this.serviceName)
    }
  }

  // ==================== HTTP 메서드 래퍼 ====================

  /**
   * GET 요청
   */
  async get(url, params = {}, options = {}) {
    // 쿼리 파라미터 처리
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = `${url}${queryString ? '?' + queryString : ''}`

    return this.request(fullUrl, {
      method: 'GET',
      ...options
    })
  }

  /**
   * POST 요청
   */
  async post(url, data = null, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    })
  }

  /**
   * PUT 요청
   */
  async put(url, data = null, options = {}) {
    return this.request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options
    })
  }

  /**
   * DELETE 요청
   */
  async delete(url, options = {}) {
    return this.request(url, {
      method: 'DELETE',
      ...options
    })
  }

  /**
   * PATCH 요청
   */
  async patch(url, data = null, options = {}) {
    return this.request(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
      ...options
    })
  }

  // ==================== 응답 처리 ====================

  /**
   * 성공 응답 표준화
   */
  handleSuccessResponse(response) {
    // 백엔드 응답 구조에 맞게 표준화
    const data = response.data

    return {
      success: data?.success !== false,
      data: data?.data || data,
      message: data?.message || 'success',
      status: response.status,
      headers: response.headers
    }
  }

  // ==================== 파일 업로드 ====================

  /**
   * 파일 업로드 (multipart/form-data)
   */
  async uploadFile(url, formData, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: formData,
      ...options
    })
  }

  // ==================== 연결 테스트 ====================

  /**
   * 서버 연결 테스트
   */
  async testConnection() {
    const testEndpoints = [
      '/actuator/health',
      '/health'
    ]

    console.log(`🔍 [${this.serviceName}] 서버 연결 테스트...`)

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: 'GET',
          headers: this.getDefaultHeaders(false),
          signal: AbortSignal.timeout(5000)
        })

        if (response.ok) {
          console.log(`✅ [${this.serviceName}] 서버 연결 성공: ${endpoint}`)
          return true
        }
      } catch (error) {
        console.warn(`❌ [${this.serviceName}] ${endpoint} 연결 실패:`, error.message)
      }
    }

    console.log(`❌ [${this.serviceName}] 모든 엔드포인트 연결 실패`)
    return false
  }

  // ==================== 디버깅 ====================

  /**
   * 서비스 상태 디버깅
   */
  debugStatus() {
    console.group(`🔍 [${this.serviceName}] 서비스 상태`)

    console.log('=== 서비스 정보 ===')
    console.log('Service Name:', this.serviceName)
    console.log('Base URL:', this.baseURL)
    console.log('Environment:', import.meta.env.MODE)

    console.log('=== 인증 정보 ===')
    console.log('Access Token 존재:', !!authUtils.getAccessToken())
    console.log('Refresh Token 존재:', !!authUtils.getRefreshToken())
    console.log('사용자 인증 상태:', authUtils.isAuthenticated())
    console.log('사용자 ID:', authUtils.getUserId())
    console.log('디바이스 ID:', authUtils.getDeviceId())

    console.log('=== 토큰 갱신 상태 ===')
    console.log('갱신 진행 중:', this.isRefreshing)
    console.log('대기열 크기:', this.failedQueue.length)

    console.groupEnd()
  }
}

// ==================== 커스텀 에러 클래스 ====================

export class ApiError extends Error {
  constructor(message, status, data, serviceName) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.serviceName = serviceName
    this.timestamp = new Date().toISOString()
  }

  static isAuthError(error) {
    return error.status === 401 || error.status === 403
  }

  static isNetworkError(error) {
    return !error.status && (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')
    )
  }

  static isServerError(error) {
    return error.status >= 500
  }

  static isClientError(error) {
    return error.status >= 400 && error.status < 500
  }

  toLogObject() {
    return {
      service: this.serviceName,
      message: this.message,
      status: this.status,
      data: this.data,
      timestamp: this.timestamp
    }
  }
}