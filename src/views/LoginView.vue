<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <!-- 로고 영역 -->
      <div class="logo-area">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#gradient)"/>
            <path d="M24 14L32 20V28L24 34L16 28V20L24 14Z" fill="white"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stop-color="#5B5FCF"/>
                <stop offset="100%" stop-color="#3F43A4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="brand-name">SERVICE</h1>
      </div>

      <!-- 탭 컨테이너 -->
      <div class="tab-container">
        <div class="tab-header">
          <button
              class="tab-btn"
              :class="{ active: activeTab === 'login' }"
              @click="switchTab('login')"
          >
            로그인
          </button>
          <button
              class="tab-btn"
              :class="{ active: activeTab === 'register' }"
              @click="switchTab('register')"
          >
            회원가입
          </button>
        </div>

        <!-- 탭 콘텐츠 영역 -->
        <div class="tab-content">
          <transition name="fade" mode="out-in">
            <!-- 로그인 폼 -->
            <LoginForm
                v-if="activeTab === 'login'"
                key="login"
                :session-expired="sessionExpired"
                :loading="loading"
                :error-message="loginError"
                @submit="handleLogin"
                @social-login="handleSocialLogin"
            />

            <!-- 회원가입 폼 -->
            <RegisterForm
                v-else
                key="register"
                :loading="loading"
                :error-message="registerError"
                @submit="handleRegister"
            />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import * as authUtils from '@/utils/auth.js'
import { authService } from '@/services/AuthService.js'
import LoginForm from '@/components/login/LoginForm.vue'
import RegisterForm from '@/components/login/RegisterForm.vue'

const router = useRouter()
const route = useRoute()
const { login, isLoggedIn } = useAuth()

const activeTab = ref('login')
const loading = ref(false)
const loginError = ref('')
const registerError = ref('')

const redirectPath = computed(() => route.query.redirect || '/home')
const sessionExpired = computed(() => route.query.reason === 'session_expired')
const isDev = computed(() => import.meta.env.DEV)

const switchTab = (tab) => {
  activeTab.value = tab
  // 탭 전환 시 에러 메시지 초기화
  loginError.value = ''
  registerError.value = ''
}

const handleLogin = async (formData) => {
  loading.value = true
  loginError.value = ''

  try {
    const response = await authService.login({
      email: formData.email,
      password: formData.password
    })

    const { accessToken, refreshToken, user } = response.data

    if (!accessToken) {
      throw new Error('액세스 토큰을 받지 못했습니다')
    }

    const userInfo = user || {
      id: Date.now(),
      email: formData.email,
      nickname: formData.email.split('@')[0],
      role: 'USER',
      profileImage: null
    }

    login({ accessToken, refreshToken }, userInfo)
    await router.push(redirectPath.value)

  } catch (error) {
    console.error('로그인 오류:', error)

    // HTTP 상태 코드별 에러 메시지 설정
    if (error.status === 401 || error.response?.status === 401) {
      loginError.value = '이메일 또는 비밀번호가 올바르지 않습니다'
    } else if (error.status === 403 || error.response?.status === 403) {
      loginError.value = '계정이 비활성화되었습니다. 관리자에게 문의하세요.'
    } else if (error.status === 429 || error.response?.status === 429) {
      loginError.value = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
    } else if (!navigator.onLine) {
      loginError.value = '인터넷 연결을 확인해주세요.'
    } else {
      loginError.value = error.message || '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
  } finally {
    loading.value = false
  }
}

const handleRegister = async (formData) => {
  loading.value = true
  registerError.value = ''

  try {
    const response = await authService.signup({
      email: formData.email,
      password: formData.password,
      verificationToken: formData.verificationToken
    })

    if (response.success) {
      alert('회원가입이 완료되었습니다. 로그인해주세요.')
      activeTab.value = 'login'
    } else {
      throw new Error(response.message || '회원가입에 실패했습니다')
    }

  } catch (error) {
    console.error('회원가입 오류:', error)

    // HTTP 상태 코드별 에러 메시지 설정
    if (error.status === 409 || error.response?.status === 409) {
      registerError.value = '이미 사용중인 이메일입니다'
    } else if (error.status === 400 || error.response?.status === 400) {
      registerError.value = error.response?.data?.message || error.message || '입력 정보를 확인해주세요'
    } else if (error.status === 422 || error.response?.status === 422) {
      registerError.value = '이메일 인증이 만료되었습니다. 다시 인증해주세요.'
    } else if (!navigator.onLine) {
      registerError.value = '인터넷 연결을 확인해주세요.'
    } else {
      registerError.value = error.message || '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = (provider) => {
  // window.location.href는 Vite 프록시를 거치지 않으므로 절대 URL 사용
  const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL
  const redirectUrl = `${authBaseUrl}/api/oauth2/authorization/${provider}`

  console.log('[OAuth] 소셜 로그인 시작:', { provider, redirectUrl })

  sessionStorage.setItem('oauth_redirect', redirectPath.value)
  window.location.href = redirectUrl
}

const debugAuth = () => {
  authUtils.debugAuthStatus()
}

const clearAuth = () => {
  if (confirm('인증 정보를 초기화하시겠습니까?')) {
    authUtils.clearAllAuthData()
    window.location.reload()
  }
}

onMounted(async () => {
  // AccessToken이 유효하면 리다이렉트
  // RefreshToken은 HttpOnly 쿠키로 관리되므로 JS에서 체크 불가
  const accessToken = authUtils.getAccessToken()

  if (accessToken && !authUtils.isTokenExpired(accessToken)) {
    try {
      await router.replace(redirectPath.value)
    } catch (error) {
      console.warn('리다이렉트 실패:', error)
    }
  }
})
</script>

<style scoped>
:root {
  --primary: #5B5FCF;
  --primary-hover: #4A4EBF;
  --primary-light: #F0F0FF;
  --primary-dark: #3F43A4;
  --success: #10B981;
  --success-light: #D1FAE5;
  --warning: #F59E0B;
  --warning-light: #FEF3C7;
  --error: #EF4444;
  --error-light: #FEE2E2;
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  --border: #D1D5DB;
  --border-focus: #5B5FCF;
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.logo-area {
  padding: 24px 24px 20px;
  text-align: center;
  border-bottom: 1px solid var(--gray-200);
}

.logo {
  display: inline-flex;
  margin-bottom: 12px;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-800);
  letter-spacing: -0.02em;
}

.tab-container {
  background: white;
}

.tab-header {
  display: flex;
  background: var(--gray-50);
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  border-radius: 6px;
}

.tab-btn:hover {
  color: var(--gray-900);
  background: rgba(255, 255, 255, 0.5);
}

.tab-btn.active {
  color: var(--gray-900);
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.tab-content {
  padding: 24px;
}

.dev-panel {
  padding: 16px 32px;
  background: white;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 8px;
}

.dev-button {
  flex: 1;
  padding: 8px 12px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.dev-button:hover {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 높이가 낮은 화면 최적화 */
@media (max-height: 700px) {
  .auth-wrapper {
    padding: 16px;
  }

  .logo-area {
    padding: 20px 24px 16px;
  }

  .tab-content {
    padding: 20px 24px;
  }
}

@media (max-width: 640px) {
  .auth-wrapper {
    padding: 20px 16px;
  }

  .tab-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .auth-wrapper {
    padding: 0;
    align-items: stretch;
  }

  .auth-container {
    max-width: 100%;
    border: none;
    border-radius: 0;
    min-height: 100vh;
  }

  .logo-area {
    padding: 28px 20px 24px;
  }

  .tab-content {
    padding: 20px 16px;
  }
}
</style>