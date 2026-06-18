// src/api/interceptors.js
// Axios 기반 API 요청의 토큰 자동 갱신 담당
// - apiClient (메인 API): 401 에러 시 자동 갱신 후 재시도
// - authClient (인증 API): 갱신 요청용 (에러 인터셉터 없음 - 무한루프 방지)
//
// 참고: BaseApiService.js는 Fetch API 기반으로 별도 갱신 로직 사용

import axios from 'axios'
import { apiClient, authClient } from './client.js'
import * as authUtils from '@/utils/auth.js'

// 토큰 갱신 직후 WebSocket 도 함께 살린다.
// 인증 만료로 STOMP ERROR 받아 WS 가 자동 재연결 중단된 케이스에서, HTTP 토큰 갱신이
// 성공하면 새 토큰으로 WS 도 다시 붙어야 채팅/알림이 끊김 없이 이어진다.
// 동적 임포트 — webSocketService 로딩 실패가 토큰 갱신 자체를 막지 않도록 안전하게 처리
const notifyWebSocketTokenRefreshed = () => {
  import('@/services/webSocketService.js')
    .then(({ webSocketService }) => {
      try { webSocketService.onTokenRefreshed?.() } catch (e) {
        console.warn('⚠️ [Interceptor] WS onTokenRefreshed 호출 실패:', e)
      }
    })
    .catch((e) => {
      console.warn('⚠️ [Interceptor] webSocketService 로드 실패:', e)
    })
}

// 🔥 무한루프 방지를 위한 상태 관리
let isRefreshing = false
let failedRequestsQueue = []
let logoutInProgress = false

/**
 * 대기 중인 요청들을 처리하는 함수
 */
const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedRequestsQueue = []
}

/**
 * 로그아웃 처리 및 로그인 페이지로 리다이렉트 (무한루프 방지)
 */
const handleLogout = async (reason = 'Token expired') => {
  // 🔥 이미 로그아웃 처리 중이면 중복 실행 방지
  if (logoutInProgress) {
    console.log('⏳ [Interceptor] 이미 로그아웃 처리 중...')
    return
  }

  logoutInProgress = true
  console.log(`🚪 [Interceptor] ${reason} - 자동 로그아웃 시작`)

  try {
    // 인증 정보 정리
    authUtils.logout()

    // 상태 초기화
    isRefreshing = false
    processQueue(new Error(reason), null)

    // 🔥 router 동적 import로 순환 참조 방지
    const { default: router } = await import('@/router')

    // 현재 경로 확인
    const currentPath = router.currentRoute.value.fullPath

    // 이미 로그인 페이지에 있으면 리다이렉트 하지 않음
    if (currentPath !== '/login') {
      console.log('🔀 [Interceptor] Login 페이지로 리다이렉트:', currentPath)

      router.push({
        name: 'Login',
        query: {
          redirect: currentPath,
          reason: 'session_expired'
        }
      }).catch(err => {
        console.warn('❌ [Interceptor] 라우터 푸시 실패, 강제 리다이렉트:', err)
        window.location.href = '/login'
      })
    }
  } catch (error) {
    console.error('❌ [Interceptor] 로그아웃 처리 중 오류:', error)
    // 오류 발생해도 최소한 페이지는 이동
    window.location.href = '/login'
  } finally {
    // 일정 시간 후 로그아웃 상태 해제 (무한루프 방지)
    setTimeout(() => {
      logoutInProgress = false
    }, 2000)
  }
}

/**
 * /reissue API를 통한 토큰 갱신 (HttpOnly Cookie 사용)
 * - RefreshToken은 백엔드가 HttpOnly 쿠키로 설정하므로 JS에서 접근 불가
 * - withCredentials: true로 요청하면 브라우저가 자동으로 쿠키 전송
 */
const refreshTokenViaBackend = async () => {
  console.log('🔄 [Interceptor] /reissue API를 통한 토큰 갱신 시도')

  try {
    // 🌐 토큰 재발급 API 호출
    // HttpOnly 쿠키(refreshToken)는 브라우저가 자동으로 전송함
    // 🔥 requestInterceptor가 /reissue URL에는 만료된 AccessToken을 보내지 않음
    const response = await authClient.post('/reissue', null, {
      headers: {
        'X-Device-ID': authUtils.getDeviceId()
      },
      withCredentials: true  // 🔥 HttpOnly 쿠키 자동 전송
    })

    console.log(`📡 [Interceptor] 응답 상태: ${response.status}`)

    // 응답 body에서 새 AccessToken 추출
    const newAccessToken = response.data?.accessToken
    const consentRequired = response.data?.consentRequired === true

    if (newAccessToken) {
      authUtils.setAccessToken(newAccessToken)
      // WS 가 인증 만료로 끊겨있었다면 새 토큰으로 다시 붙음 — 채팅·알림 자동 복구
      notifyWebSocketTokenRefreshed()

      console.log('✅ [Interceptor] 토큰 갱신 성공')

      // 약관 버전 갱신 시 백엔드가 consentRequired=true 로 응답.
      // 현재 라우트가 /consent 가 아니면 동의 화면으로 유도.
      if (consentRequired) {
        try {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
          if (currentPath !== '/consent') {
            console.log('🔔 [Interceptor] 약관 재동의 필요 — /consent 로 라우팅')
            // 비동기 라우터 임포트 — 순환 의존 방지
            const { default: router } = await import('@/router/index.js')
            const next = router.currentRoute.value.fullPath
            router.push({ path: '/consent', query: { redirect: next } }).catch(() => {})
          }
        } catch (e) {
          console.warn('⚠️ [Interceptor] 동의 라우팅 실패:', e)
        }
      }

      return newAccessToken
    }

    throw new Error('응답에서 새 AccessToken을 받지 못함')

  } catch (error) {
    console.error('❌ [Interceptor] 토큰 갱신 실패:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })

    // 🚨 401 에러면 RefreshToken 만료 또는 없음 - 로그아웃 처리
    if (error.response?.status === 401) {
      console.log('🚨 [Interceptor] RefreshToken 만료 또는 없음 - 로그아웃 필요')
      throw new Error('Refresh token expired')
    }

    throw error
  }
}

/**
 * 요청 인터셉터 - 모든 요청에 인증 헤더 자동 추가
 * 🔥 /reissue 요청에는 만료된 AccessToken을 보내지 않음
 *    → 백엔드가 Authorization 헤더를 먼저 검증하면 401이 발생하여 갱신 실패
 *    → RefreshToken은 HttpOnly 쿠키로 자동 전송되므로 AccessToken 불필요
 */
const requestInterceptor = (config) => {
  const token = authUtils.getAccessToken()
  const isReissueRequest = config.url?.includes('/reissue')

  if (token && !isReissueRequest) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // 추가 헤더
  config.headers['X-Device-ID'] = authUtils.getDeviceId()
  config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone
  config.headers['X-Language'] = navigator.language || 'ko'

  return config
}

/**
 * 응답 인터셉터 - 성공 응답에서 새 토큰 확인
 */
const responseInterceptor = (response) => {
  // 성공 응답에서 새로운 토큰 확인
  const newToken = response.headers['authorization'] || response.headers['Authorization']
  if (newToken) {
    const cleanToken = newToken.replace('Bearer ', '')
    authUtils.setAccessToken(cleanToken)
    console.log('✅ [Interceptor] 응답에서 새 토큰 저장됨')
  }
  return response
}

/**
 * 에러 인터셉터 - 401 에러 처리 및 자동 토큰 갱신 (무한루프 방지)
 */
const errorInterceptor = async (error) => {
  const originalRequest = error.config

  // 🔥 무한루프 방지 체크들
  if (
      error.response?.status !== 401 ||           // 401이 아님
      originalRequest._retry ||                   // 이미 재시도함
      originalRequest.url?.includes('/auth/') ||  // 인증 API 요청
      logoutInProgress                           // 로그아웃 진행 중
  ) {
    return Promise.reject(error)
  }

  console.log('🔄 [Interceptor] 401 에러 감지 - 토큰 갱신 시도')

  // 이미 갱신 중이면 대기열에 추가
  if (isRefreshing) {
    console.log('⏳ [Interceptor] 토큰 갱신 중 - 대기열 추가')

    return new Promise((resolve, reject) => {
      failedRequestsQueue.push({ resolve, reject })
    }).then(() => {
      // 새 토큰으로 원래 요청 재시도
      const newToken = authUtils.getAccessToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }
      return axios(originalRequest)
    }).catch((err) => {
      return Promise.reject(err)
    })
  }

  originalRequest._retry = true
  isRefreshing = true

  try {
    // HttpOnly 쿠키는 JS에서 체크 불가 - 바로 갱신 시도
    // 쿠키가 없거나 만료되면 백엔드가 401 응답
    const newAccessToken = await refreshTokenViaBackend()

    if (newAccessToken) {
      console.log('✅ [Interceptor] 토큰 갱신 성공 - 대기 요청 처리')

      // 대기 중인 요청들 처리
      processQueue(null, newAccessToken)

      // 원래 요청에 새 토큰 적용 후 재시도
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return axios(originalRequest)
    }

  } catch (refreshError) {
    console.error('❌ [Interceptor] 토큰 갱신 실패:', refreshError.message)

    // 🚨 RefreshToken 만료 또는 갱신 실패 - 자동 로그아웃!
    processQueue(refreshError, null)

    // 🔥 비동기 로그아웃 (무한루프 방지)
    setTimeout(() => {
      handleLogout('RefreshToken 만료 또는 갱신 실패')
    }, 100)

    return Promise.reject(refreshError)
  } finally {
    isRefreshing = false
  }
}

// ==================== 인터셉터 등록 (무한루프 방지) ====================

// 🔥 메인 API 클라이언트에만 에러 인터셉터 등록
apiClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error))
apiClient.interceptors.response.use(responseInterceptor, errorInterceptor)

// 🔥 인증 클라이언트에는 요청 인터셉터만 등록 (에러 인터셉터 없음 - 무한루프 방지!)
authClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error))

console.log('✅ [Interceptor] 토큰 자동 갱신 인터셉터 등록 완료 (Cookie 기반)')

// ==================== 수동 토큰 갱신 함수 (긴급용) ====================

/**
 * 수동 토큰 갱신 (컴포넌트에서 직접 호출용)
 * - 이미 갱신 중이면 진행 중인 갱신 완료를 대기 (false 즉시 반환하지 않음)
 */
export const manualRefreshToken = async () => {
  if (isRefreshing) {
    console.log('⏳ [Manual] 이미 토큰 갱신 중 - 완료 대기')
    return new Promise((resolve) => {
      failedRequestsQueue.push({
        resolve: () => resolve(true),
        reject: () => resolve(false)
      })
    })
  }

  try {
    isRefreshing = true
    console.log('🔄 [Manual] 수동 토큰 갱신 시도')

    const newToken = await refreshTokenViaBackend()

    if (newToken) {
      console.log('✅ [Manual] 수동 토큰 갱신 성공')
      processQueue(null, newToken)
      return true
    }

    processQueue(new Error('Token refresh returned null'), null)
    return false
  } catch (error) {
    console.error('❌ [Manual] 수동 토큰 갱신 실패:', error)
    processQueue(error, null)
    return false
  } finally {
    isRefreshing = false
  }
}

/**
 * 토큰 상태 확인 (무한루프 없는 버전)
 */
export const checkTokenStatus = () => {
  const accessToken = authUtils.getAccessToken()

  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: true,  // HttpOnly 쿠키로 관리 (JS 접근 불가)
    accessTokenExpired: accessToken ? authUtils.isTokenExpired(accessToken) : true,
    refreshTokenExpired: false,  // 서버가 검증 (JS에서 확인 불가)
    needsRefresh: accessToken ? authUtils.shouldRefreshToken(accessToken) : true
  }
}

// ==================== 토큰 모니터링 (백그라운드 체크) ====================

/**
 * 토큰 모니터 - 주기적 체크 및 선제적 갱신
 */
class TokenMonitor {
  constructor() {
    this.checkInterval = null
    this.CHECK_INTERVAL_MS = 60 * 1000 // 1분마다 체크
  }

  /**
   * 모니터링 시작 (앱 초기화 시 호출)
   */
  start() {
    // 1. 앱 시작 시 즉시 체크
    this.checkAndRefresh()

    // 2. 주기적 체크 시작
    this.checkInterval = setInterval(() => {
      this.checkAndRefresh()
    }, this.CHECK_INTERVAL_MS)

    // 3. 탭 활성화 시 체크
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    console.log('✅ [TokenMonitor] 토큰 모니터링 시작')
  }

  /**
   * 모니터링 중지
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    console.log('🛑 [TokenMonitor] 토큰 모니터링 중지')
  }

  /**
   * 탭 활성화 시 체크
   */
  handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('👁️ [TokenMonitor] 탭 활성화 - 토큰 체크')
      this.checkAndRefresh()
    }
  }

  /**
   * 토큰 체크 및 필요 시 갱신
   */
  async checkAndRefresh() {
    const accessToken = authUtils.getAccessToken()

    // 로그인 상태가 아니면 무시
    if (!accessToken) {
      return
    }

    // AccessToken 완전 만료 → 즉시 갱신 시도
    if (authUtils.isTokenExpired(accessToken)) {
      console.log('⏰ [TokenMonitor] AccessToken 만료됨 - 갱신 시도')
      const success = await manualRefreshToken()
      if (!success) {
        console.log('❌ [TokenMonitor] 갱신 실패 - 로그아웃')
        handleLogout('세션이 만료되었습니다')
      }
      return
    }

    // AccessToken 만료 임박 (5분 이내) → 선제적 갱신
    if (authUtils.shouldRefreshToken(accessToken)) {
      const remaining = authUtils.getTokenTimeRemaining(accessToken)
      console.log(`⚠️ [TokenMonitor] AccessToken ${remaining}분 후 만료 - 선제적 갱신`)
      await manualRefreshToken()
    }
  }
}

// 싱글톤 인스턴스
export const tokenMonitor = new TokenMonitor()