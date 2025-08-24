// src/api/interceptors.js
import axios from 'axios'
import { apiClient, authClient } from './client.js'
import * as authUtils from '@/utils/auth.js'

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
 * 백엔드 RefreshJwtFilter를 통한 토큰 갱신 (무한루프 방지)
 */
const refreshTokenViaBackend = async () => {
  const refreshToken = authUtils.getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  // 🔥 RefreshToken 만료 체크 (갱신 시도 전에)
  if (authUtils.isTokenExpired(refreshToken)) {
    console.log('🚨 [Interceptor] RefreshToken이 이미 만료됨')
    throw new Error('Refresh token expired')
  }

  console.log('🔄 [Interceptor] RefreshJwtFilter를 통한 토큰 갱신 시도')

  // 백엔드의 보호된 엔드포인트들 (RefreshJwtFilter가 처리)
  const testEndpoints = [
    '/api/v1/auth/verify',
    '/api/v1/users/profile',
    '/api/v1/chat/rooms'
  ]

  for (const endpoint of testEndpoints) {
    try {
      console.log(`🌐 [Interceptor] 토큰 갱신 요청: ${endpoint}`)

      // 🔥 authClient 사용 (무한루프 방지 - 이 클라이언트는 에러 인터셉터 없음)
      const response = await authClient.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'X-Device-ID': authUtils.getDeviceId()
        }
      })

      console.log(`📡 [Interceptor] 응답 상태: ${response.status}`)

      // 성공 응답 또는 404 (엔드포인트 없음)도 인증은 성공
      if (response.status === 200 || response.status === 404) {
        const newAccessToken = response.headers['authorization'] || response.headers['Authorization']

        if (newAccessToken) {
          const cleanToken = newAccessToken.replace('Bearer ', '')
          authUtils.setAccessToken(cleanToken)

          console.log('✅ [Interceptor] 토큰 갱신 성공:', endpoint)
          return cleanToken
        }
      }

    } catch (error) {
      console.warn(`⚠️ [Interceptor] ${endpoint} 실패:`, error.response?.status, error.message)

      // 🚨 401 에러면 RefreshToken 만료!
      if (error.response?.status === 401) {
        console.log('🚨 [Interceptor] RefreshToken 만료 확인됨')
        throw new Error('Refresh token expired')
      }

      continue
    }
  }

  throw new Error('모든 엔드포인트에서 토큰 갱신 실패')
}

/**
 * 요청 인터셉터 - 모든 요청에 인증 헤더 자동 추가
 */
const requestInterceptor = (config) => {
  const token = authUtils.getAccessToken()

  if (token) {
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
    // 🔥 RefreshToken 사전 체크
    const refreshToken = authUtils.getRefreshToken()
    if (!refreshToken || authUtils.isTokenExpired(refreshToken)) {
      console.log('🚨 [Interceptor] RefreshToken 없거나 만료됨')
      throw new Error('Refresh token expired')
    }

    // RefreshToken으로 갱신 시도
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
// authClient에는 응답 인터셉터 등록하지 않음!

// 🔥 전역 axios에는 등록하지 않음 (기존 fetch와 충돌 방지)
// axios.interceptors는 주석 처리

console.log('✅ [Interceptor] 토큰 자동 갱신 인터셉터 등록 완료 (무한루프 방지)')

// ==================== 수동 토큰 갱신 함수 (긴급용) ====================

/**
 * 수동 토큰 갱신 (컴포넌트에서 직접 호출용)
 */
export const manualRefreshToken = async () => {
  if (isRefreshing) {
    console.log('⏳ [Manual] 이미 토큰 갱신 중...')
    return false
  }

  try {
    isRefreshing = true
    console.log('🔄 [Manual] 수동 토큰 갱신 시도')

    const newToken = await refreshTokenViaBackend()

    if (newToken) {
      console.log('✅ [Manual] 수동 토큰 갱신 성공')
      return true
    }

    return false
  } catch (error) {
    console.error('❌ [Manual] 수동 토큰 갱신 실패:', error)
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
  const refreshToken = authUtils.getRefreshToken()

  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenExpired: accessToken ? authUtils.isTokenExpired(accessToken) : true,
    refreshTokenExpired: refreshToken ? authUtils.isTokenExpired(refreshToken) : true,
    needsRefresh: accessToken ? authUtils.shouldRefreshToken(accessToken) : true
  }
}