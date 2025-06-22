<template>
  <div class="callback-wrapper">
    <div class="callback-container">
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <h2>로그인 처리 중...</h2>
        <p>OAuth 토큰을 처리하고 있습니다.</p>
      </div>

      <div v-else-if="error" class="error-section">
        <div class="error-icon">❌</div>
        <h2>로그인 실패</h2>
        <p>{{ errorMessage }}</p>
        <div class="debug-info" v-if="debugInfo">
          <h4>디버깅 정보:</h4>
          <p>URL: {{ currentUrl }}</p>
          <p>토큰: {{ tokenFromUrl ? '있음' : '없음' }}</p>
          <p>오류: {{ debugInfo }}</p>
        </div>
        <button @click="goToLogin" class="retry-button">
          다시 시도
        </button>
      </div>

      <div v-else class="success-section">
        <div class="success-icon">✅</div>
        <h2>로그인 성공!</h2>
        <p>홈 페이지로 이동합니다...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {useAuth} from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const {login} = useAuth()

const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const debugInfo = ref('')
const currentUrl = ref('')
const tokenFromUrl = ref('')

// JWT 토큰 디코딩 함수 (페이로드만 추출)
const decodeJWTPayload = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT 디코딩 오류:', error)
    return null
  }
}

const handleOAuthCallback = async () => {
  try {
    currentUrl.value = window.location.href
    console.log('🔵 OAuth 콜백 URL:', currentUrl.value)

    // URL에서 파라미터 추출
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const errorParam = urlParams.get('error')

    tokenFromUrl.value = token

    console.log('🔵 URL 파라미터:', {
      token: token ? '있음' : '없음',
      error: errorParam,
      allParams: Object.fromEntries(urlParams)
    })

    // 에러 파라미터가 있으면 실패 처리
    if (errorParam) {
      throw new Error(`OAuth 인증 실패: ${errorParam}`)
    }

    // 토큰이 없으면 실패
    if (!token) {
      throw new Error('토큰이 URL에 포함되지 않았습니다.')
    }

    console.log('🔵 받은 토큰:', token.substring(0, 50) + '...')

    // JWT 토큰에서 사용자 정보 추출
    const payload = decodeJWTPayload(token)
    console.log('🔵 토큰 페이로드:', payload)

    if (!payload) {
      throw new Error('토큰 디코딩에 실패했습니다.')
    }

    // 토큰 페이로드에서 사용자 정보 구성
    const userInfo = {
      id: payload.userId || payload.sub || Date.now(),
      email: payload.email || `${payload.username || payload.sub}@oauth.local`,
      nickname: payload.username || payload.sub || 'OAuth 사용자',
      role: payload.auth || payload.role || 'USER',
      provider: payload.provider || 'oauth',
      profileImage: payload.picture || payload.avatar_url || null
    }

    console.log('🔵 구성된 사용자 정보:', userInfo)

    // useAuth를 통한 로그인 처리
    login(
        {
          accessToken: token,
          refreshToken: null // OAuth의 경우 refresh token이 없을 수 있음
        },
        userInfo
    )

    console.log('🟢 OAuth 로그인 성공')

    // 저장된 리다이렉트 경로 가져오기
    const redirectPath = sessionStorage.getItem('oauth_redirect') || '/home'
    sessionStorage.removeItem('oauth_redirect')

    console.log('🔵 리다이렉트 경로:', redirectPath)

    // 즉시 리다이렉트 (지연 없이)
    try {
      await router.push(redirectPath)
      console.log('🟢 리다이렉트 성공')
    } catch (routerError) {
      console.log('🔴 router.push 실패, 강제 리다이렉트:', routerError)
      window.location.href = redirectPath
    }

  } catch (err) {
    console.error('🔴 OAuth 콜백 처리 오류:', err)
    error.value = true
    errorMessage.value = err.message || 'OAuth 로그인 처리 중 오류가 발생했습니다.'
    debugInfo.value = err.stack || err.toString()
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  console.log('🔵 OAuth2Callback 컴포넌트 마운트')
  handleOAuthCallback()
})
</script>

<style scoped>
.callback-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
}

.callback-container {
  width: 100%;
  max-width: 500px;
  padding: 48px 32px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.loading-section,
.error-section,
.success-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #1DCD9F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon,
.success-icon {
  font-size: 48px;
}

h2 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.debug-info {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: left;
  font-size: 12px;
  color: #374151;
}

.debug-info h4 {
  margin: 0 0 8px 0;
  color: #111827;
}

.debug-info p {
  margin: 4px 0;
  font-size: 12px;
  word-break: break-all;
}

.retry-button {
  padding: 12px 24px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #b91c1c;
}

/* 반응형 */
@media (max-width: 600px) {
  .callback-container {
    margin: 20px;
    padding: 32px 20px;
  }

  .debug-info p {
    font-size: 11px;
  }
}
</style>