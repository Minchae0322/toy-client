<template>
  <div class="callback-wrapper">
    <div class="callback-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <h2>OAuth 로그인 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">!</div>
        <h2>로그인 실패</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <button @click="goToLogin" class="retry-btn">다시 로그인</button>

        <!-- 개발용 디버그 정보 -->
        <details v-if="isDev && debugInfo" class="debug-details">
          <summary>디버그 정보</summary>
          <pre>{{ debugInfo }}</pre>
        </details>
      </div>

      <div v-else class="success-state">
        <div class="success-icon">OK</div>
        <h2>로그인 성공!</h2>
        <p>홈 페이지로 이동 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import * as authUtils from '@/utils/auth.js'

const router = useRouter()
const { login } = useAuth()

const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const debugInfo = ref('')

// 개발 환경 확인
const isDev = computed(() => import.meta.env.DEV)

const decodeJWTPayload = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''))
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('[OAuth] JWT 디코딩 실패:', e)
    return null
  }
}

// 강제 상태 동기화 함수
const forceStateSync = () => {
  console.log('[OAuth] 강제 상태 동기화 실행')

  // Storage 이벤트 강제 발생
  const token = authUtils.getAccessToken()
  const userInfo = authUtils.getUserInfo()

  if (token && userInfo) {
    // 커스텀 이벤트로 모든 컴포넌트에 알림
    window.dispatchEvent(new CustomEvent('auth-state-changed', {
      detail: { user: userInfo, loggedIn: true }
    }))

    // Storage 이벤트도 발생
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'access_token',
      newValue: token,
      storageArea: localStorage
    }))

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user_info',
      newValue: JSON.stringify(userInfo),
      storageArea: localStorage
    }))

    console.log('[OAuth] 강제 상태 동기화 완료')
  }
}

const handleOAuthCallback = async () => {
  try {
    console.log('[OAuth] OAuth2 콜백 처리 시작')

    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('token')
    const refreshToken = urlParams.get('refreshToken')
    const errorParam = urlParams.get('error')

    // URL 파라미터 디버깅
    console.log('[OAuth] URL 파라미터:', {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      error: errorParam,
      fullURL: window.location.href
    })

    if (errorParam) {
      throw new Error(`OAuth 인증 실패: ${errorParam}`)
    }

    if (!accessToken) {
      throw new Error('Access Token이 URL에 없습니다.')
    }

    // JWT 페이로드 디코딩
    const payload = decodeJWTPayload(accessToken)
    if (!payload) {
      throw new Error('JWT 디코딩 실패')
    }

    console.log('[OAuth] JWT 페이로드:', payload)

    // 사용자 정보 구성
    const userInfo = {
      id: payload.userId || payload.sub,
      username: payload.username || payload.sub,
      email: payload.email || `${payload.sub}@oauth.local`,
      nickname: payload.nickname || payload.username || payload.sub,
      role: payload.auth || payload.role || 'USER',
      provider: payload.provider || 'oauth',
      profileImage: payload.picture || payload.avatar_url || null,
    }

    console.log('[OAuth] 사용자 정보 구성:', userInfo)

    // RefreshToken 처리 (AccessToken을 RefreshToken으로도 사용)
    const finalRefreshToken = refreshToken || accessToken

    const tokens = {
      accessToken: accessToken,
      refreshToken: finalRefreshToken
    }

    console.log('[OAuth] 토큰 저장 시작:', {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      tokensEqual: tokens.accessToken === tokens.refreshToken
    })

    // useAuth를 통한 로그인 처리
    const loginResult = login(tokens, userInfo)
    console.log('[OAuth] useAuth.login 결과:', loginResult)

    // 추가 상태 동기화 (모든 컴포넌트 강제 업데이트)
    setTimeout(() => {
      forceStateSync()
    }, 100)

    // 저장 상태 최종 검증
    await new Promise(resolve => setTimeout(resolve, 200))

    const finalCheck = {
      savedAccessToken: !!authUtils.getAccessToken(),
      savedRefreshToken: !!authUtils.getRefreshToken(),
      savedUserInfo: !!authUtils.getUserInfo(),
      isAuthenticated: authUtils.isAuthenticated()
    }

    console.log('[OAuth] 최종 저장 상태:', finalCheck)

    if (!finalCheck.isAuthenticated) {
      throw new Error('인증 상태 저장 실패')
    }

    // 리다이렉트 경로 결정
    const redirectPath = sessionStorage.getItem('oauth_redirect') || '/feed'
    sessionStorage.removeItem('oauth_redirect')

    console.log('[OAuth] 리다이렉트 준비:', redirectPath)

    // 상태 안정화를 위한 추가 딜레이
    await new Promise(resolve => setTimeout(resolve, 500))

    // 홈으로 이동
    try {
      console.log('[OAuth] 홈 페이지로 이동 시작...')
      await router.push(redirectPath)
      console.log('[OAuth] 홈 페이지 이동 완료!')
    } catch (routerError) {
      console.warn('[OAuth] 라우터 실패, 강제 이동:', routerError)
      window.location.href = redirectPath
    }

  } catch (err) {
    console.error('[OAuth] 콜백 처리 실패:', err)

    error.value = true
    errorMessage.value = err.message
    debugInfo.value = {
      error: err.message,
      stack: err.stack,
      url: window.location.href,
      tokens: {
        hasAccessToken: !!authUtils.getAccessToken(),
        hasRefreshToken: !!authUtils.getRefreshToken(),
        hasUserInfo: !!authUtils.getUserInfo()
      }
    }
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  // 실패한 인증 정보 정리
  authUtils.clearAllAuthData()
  router.push({ name: 'Login' })
}

onMounted(handleOAuthCallback)
</script>

<style scoped>
.callback-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
}

.callback-container {
  max-width: 400px;
  padding: 40px;
  text-align: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-state h2,
.error-state h2,
.success-state h2 {
  margin: 16px 0 8px;
  font-size: 20px;
  font-weight: 600;
}

.loading-state p,
.error-state p,
.success-state p {
  margin: 0 0 16px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1DCD9F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-icon {
  color: #dc2626;
}

.success-icon {
  color: #1DCD9F;
}

.error-message {
  color: #dc2626;
  font-weight: 500;
}

.retry-btn {
  padding: 10px 20px;
  background-color: #1DCD9F;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background-color: #169976;
}

.debug-details {
  margin-top: 20px;
  text-align: left;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.debug-details summary {
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 8px;
}

.debug-details pre {
  font-size: 11px;
  color: #495057;
  margin: 0;
  overflow-x: auto;
}
</style>
