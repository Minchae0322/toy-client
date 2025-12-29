<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <!-- 로고 영역 -->
      <div class="logo-area">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <!-- 요거트 컵 -->
            <ellipse cx="24" cy="14" rx="16" ry="4" fill="#EDE9FE"/>
            <path d="M8 14 C8 14 10 38 24 38 C38 38 40 14 40 14" fill="url(#yogurtGradient)" stroke="#A855F7" stroke-width="1.5"/>
            <ellipse cx="24" cy="14" rx="16" ry="4" fill="#F5F3FF" stroke="#A855F7" stroke-width="1.5"/>
            <!-- 토핑 -->
            <circle cx="18" cy="12" r="2" fill="#9333EA"/>
            <circle cx="26" cy="11" r="1.5" fill="#A8E6CF"/>
            <circle cx="30" cy="13" r="1.8" fill="#FFD93D"/>
            <circle cx="22" cy="14" r="1.2" fill="#A855F7"/>
            <!-- 스푼 -->
            <ellipse cx="36" cy="8" rx="4" ry="2.5" fill="#F8F8F8" stroke="#E0E0E0" stroke-width="1"/>
            <rect x="35" y="10" width="2" height="12" rx="1" fill="#F0F0F0" stroke="#E0E0E0" stroke-width="0.5"/>
            <defs>
              <linearGradient id="yogurtGradient" x1="24" y1="14" x2="24" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FAF5FF"/>
                <stop offset="100%" stop-color="#EDE9FE"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="brand-name">요거뜨</h1>
        <p class="brand-tagline">신선한 하루의 시작</p>
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
  --primary: #9333EA;
  --primary-hover: #7C3AED;
  --primary-light: #F5F3FF;
  --primary-dark: #7C3AED;
  --accent: #A8E6CF;
  --accent-light: #E8F8F0;
  --success: #10B981;
  --success-light: #D1FAE5;
  --warning: #F59E0B;
  --warning-light: #FEF3C7;
  --error: #EF4444;
  --error-light: #FEE2E2;
  --cream: #FAF5FF;
  --gray-50: #FAFAFA;
  --gray-100: #F5F5F5;
  --gray-200: #EEEEEE;
  --gray-300: #E0E0E0;
  --gray-400: #BDBDBD;
  --gray-500: #9E9E9E;
  --gray-600: #757575;
  --gray-700: #616161;
  --gray-800: #424242;
  --gray-900: #212121;
  --border: #E9D5FF;
  --border-focus: #9333EA;
  --shadow-sm: 0 1px 3px 0 rgba(147, 51, 234, 0.1);
  --shadow: 0 4px 6px -1px rgba(147, 51, 234, 0.15);
  --shadow-lg: 0 10px 25px -5px rgba(147, 51, 234, 0.2);
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
  background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 50%, #EDE9FE 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.auth-wrapper::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 20%, rgba(168, 230, 207, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 70% 80%, rgba(255, 217, 61, 0.1) 0%, transparent 40%);
  pointer-events: none;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid #E9D5FF;
  border-radius: 24px;
  box-shadow: 0 8px 32px -8px rgba(147, 51, 234, 0.15),
              0 4px 16px -4px rgba(147, 51, 234, 0.08);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.logo-area {
  padding: 32px 24px 24px;
  text-align: center;
  background: linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%);
  border-bottom: 1px solid #F3E8FF;
}

.logo {
  display: inline-flex;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(147, 51, 234, 0.15));
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05) rotate(-2deg);
}

.brand-name {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #9333EA 0%, #A855F7 50%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.brand-tagline {
  font-size: 13px;
  color: #9E9E9E;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.tab-container {
  background: white;
}

.tab-header {
  display: flex;
  background: #F5F3FF;
  padding: 4px;
  gap: 0;
  margin: 16px 20px 0;
  border-radius: 12px;
  border: 1px solid #E9D5FF;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #9E9E9E;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
  border-radius: 10px;
}

.tab-btn:hover:not(.active) {
  color: #7C3AED;
  background: rgba(255, 255, 255, 0.5);
}

.tab-btn.active {
  color: white;
  background: linear-gradient(135deg, #9333EA 0%, #A855F7 100%);
  box-shadow: 0 2px 8px -2px rgba(147, 51, 234, 0.4);
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