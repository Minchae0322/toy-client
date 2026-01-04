<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <!-- 로고 영역 -->
      <div class="logo-area">
        <img src="/images/yogodde02.png" alt="요거뜨" class="logo-image" />
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
  background: white;
  padding: 24px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  overflow: hidden;
}

.logo-area {
  padding: 30px 22px 28px;
  text-align: center;
  border-bottom: 1px solid #F0F0F0;
}

.logo-image {
  max-width: 120px;
  height: auto;
}

.tab-container {
  background: white;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid #F0F0F0;
}

.tab-btn {
  flex: 1;
  padding: 14px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  color: #9E9E9E;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -1px;
}

.tab-btn:hover:not(.active) {
  color: #7C3AED;
}

.tab-btn.active {
  color: #9333EA;
  border-bottom-color: #9333EA;
}

.tab-content {
  padding: 28px 32px 32px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .auth-wrapper {
    padding: 0;
  }

  .auth-container {
    max-width: 100%;
    border: none;
    border-radius: 0;
    min-height: 100vh;
  }

  .logo-area {
    padding: 48px 24px 24px;
  }

  .tab-content {
    padding: 24px;
  }
}
</style>