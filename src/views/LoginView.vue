<template>
  <div class="login-wrapper">
    <div class="login-container">
      <h1 class="title">로그인</h1>
      <p class="subtitle">계정에 로그인하세요</p>

      <!-- 🚨 세션 만료 알림 -->
      <div v-if="sessionExpired" class="alert alert-warning">
        <div class="alert-icon">⏰</div>
        <div>
          <strong>세션이 만료되었습니다</strong>
          <p>보안을 위해 다시 로그인해주세요.</p>
        </div>
      </div>

      <!-- 🔄 토큰 갱신 실패 알림 -->
      <div v-if="tokenRefreshFailed" class="alert alert-error">
        <div class="alert-icon">🔒</div>
        <div>
          <strong>인증이 만료되었습니다</strong>
          <p>다시 로그인해주세요.</p>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">이메일</label>
          <input
              id="email"
              type="email"
              v-model="email"
              placeholder="name@example.com"
              required
              autocomplete="email"
              :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
              id="password"
              type="password"
              v-model="password"
              required
              autocomplete="current-password"
              :disabled="loading"
          />
        </div>

        <button type="submit" class="submit-button" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ getLoadingText() }}
        </button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>

      <div class="divider">또는 다음으로 계속</div>

      <button class="google-login" @click="handleSocialLogin('google')" :disabled="loading">
        Google로 로그인
      </button>

      <button class="github-login" @click="handleSocialLogin('github')" :disabled="loading">
        GitHub로 로그인
      </button>

      <div class="footer">
        계정이 없으신가요?
        <router-link to="/register" class="register-link">회원가입</router-link>
      </div>

      <!-- 🔧 개발용 디버그 버튼 -->
      <div v-if="isDev" class="debug-section">
        <button @click="debugAuth" class="debug-btn">인증 상태 디버그</button>
        <button @click="clearAuth" class="debug-btn">인증 정보 초기화</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { authService } from '@/api/axios.js'
import * as authUtils from '@/utils/auth.js'

const router = useRouter()
const route = useRoute()
const { login, isLoggedIn } = useAuth()

// 반응형 데이터
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const wsConnecting = ref(false)

// 컴퓨티드 속성
const redirectPath = computed(() => route.query.redirect || '/home')

// 🚨 세션 만료 체크
const sessionExpired = computed(() => {
  return route.query.reason === 'session_expired'
})

// 🔒 토큰 갱신 실패 체크
const tokenRefreshFailed = computed(() => {
  return route.query.reason === 'refresh_failed'
})

// 개발 환경 확인
const isDev = computed(() => import.meta.env.DEV)

// ✅ 로딩 텍스트 동적 변경
const getLoadingText = () => {
  if (wsConnecting.value) {
    return '실시간 연결 중...'
  }
  return loading.value ? '로그인 중...' : '로그인'
}

// 로그인 처리 (단순화된 버전)
const handleLogin = async () => {
  if (loading.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    console.log('🔑 [Login] 로그인 시작...')

    const response = await authService.login({
      email: email.value,
      password: password.value
    })

    // 토큰과 사용자 정보 추출
    const { accessToken, refreshToken, user } = response.data

    if (!accessToken) {
      throw new Error('액세스 토큰을 받지 못했습니다')
    }

    // 사용자 정보 기본값 설정
    const userInfo = user || {
      id: Date.now(),
      email: email.value,
      nickname: email.value.split('@')[0],
      role: 'USER',
      profileImage: null
    }

    console.log('✅ [Login] 로그인 성공, 토큰 저장 중...')

    // 🔥 useAuth를 통한 로그인 처리
    login({ accessToken, refreshToken }, userInfo)

    console.log('🚀 [Login] 로그인 완료, 리다이렉트 중...')

    // 🔥 즉시 리다이렉트 (WebSocket은 나중에)
    await router.push(redirectPath.value)

  } catch (error) {
    console.error('❌ [Login] 로그인 오류:', error)

    if (error.response?.status === 401) {
      errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    } else if (error.response?.status === 403) {
      errorMessage.value = '계정이 비활성화되었습니다. 관리자에게 문의하세요.'
    } else if (error.response?.status >= 500) {
      errorMessage.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    } else {
      errorMessage.value = error.message || '로그인 중 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false
    wsConnecting.value = false
  }
}

// 소셜 로그인
const handleSocialLogin = (provider) => {
  if (loading.value) return

  console.log(`🔗 [Login] ${provider} 소셜 로그인 시작`)

  const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8081'
  const redirectUrl = `${AUTH_BASE_URL}/api/oauth2/authorization/${provider}`

  // 리다이렉트 경로 저장
  sessionStorage.setItem('oauth_redirect', redirectPath.value)

  // 소셜 로그인 페이지로 이동
  window.location.href = redirectUrl
}

// 🔧 개발용 디버깅 함수들
const debugAuth = () => {
  console.log('🔍 [Login] 인증 상태 디버그')
  authUtils.debugAuthStatus()
}

const clearAuth = () => {
  if (confirm('모든 인증 정보를 삭제하시겠습니까?')) {
    authUtils.clearAllAuthData()
    alert('인증 정보가 삭제되었습니다.')
    window.location.reload() // 페이지 새로고침으로 상태 초기화
  }
}

// 🔥 단순화된 마운트 처리 (무한루프 방지)
onMounted(async () => {
  console.log('🔍 [Login] 마운트 시 상태 확인')

  // 🔥 단순한 토큰 체크만 수행 (loadUserInfo 호출 없음)
  const hasValidTokens = () => {
    const accessToken = authUtils.getAccessToken()
    const refreshToken = authUtils.getRefreshToken()

    if (!accessToken || !refreshToken) return false

    // RefreshToken이 유효하면 로그인된 것으로 간주
    return !authUtils.isTokenExpired(refreshToken)
  }

  // 유효한 토큰이 있으면 리다이렉트
  if (hasValidTokens()) {
    try {
      console.log('✅ [Login] 유효한 토큰 존재, 리다이렉트:', redirectPath.value)
      await router.replace(redirectPath.value)
    } catch (error) {
      console.warn('❌ [Login] 리다이렉트 실패:', error)
    }
  }

  // 알림 메시지 자동 제거
  if (sessionExpired.value || tokenRefreshFailed.value) {
    setTimeout(() => {
      const newQuery = { ...route.query }
      delete newQuery.reason
      router.replace({ query: newQuery }).catch(() => {})
    }, 5000)
  }
})
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.login-container {
  width: 100%;
  max-width: 360px;
  padding: 40px 24px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #111;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

/* 🚨 알림 스타일 */
.alert {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
}

.alert-warning {
  background-color: #fffbeb;
  border: 1px solid #fed7aa;
  color: #92400e;
}

.alert-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.alert-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.alert strong {
  display: block;
  margin-bottom: 2px;
  font-weight: 600;
  font-size: 13px;
}

.alert p {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.form-group {
  margin-bottom: 16px;
  text-align: left;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 6px;
  display: block;
}

input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
  background-color: #fff;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #1DCD9F;
}

input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #1DCD9F;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button:hover:not(:disabled) {
  background-color: #169976;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin-top: 12px;
  font-size: 13px;
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 8px;
  text-align: left;
}

.divider {
  margin: 24px 0 16px;
  color: #999;
  font-size: 13px;
}

.google-login,
.github-login {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #222222;
  transition: background-color 0.2s;
  margin-bottom: 8px;
}

.google-login:hover:not(:disabled),
.github-login:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.google-login:disabled,
.github-login:disabled {
  background-color: #f9f9f9;
  color: #ccc;
  cursor: not-allowed;
}

.footer {
  margin-top: 24px;
  font-size: 13px;
  color: #555;
}

.register-link {
  margin-left: 4px;
  color: #169976;
  font-weight: 600;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

/* 🔧 개발용 디버그 섹션 */
.debug-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.debug-btn {
  flex: 1;
  padding: 6px 10px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 11px;
  color: #495057;
  cursor: pointer;
}

.debug-btn:hover {
  background-color: #e9ecef;
}

/* 반응형 */
@media (max-width: 480px) {
  .login-container {
    margin: 20px;
    padding: 32px 20px;
  }
}
</style>