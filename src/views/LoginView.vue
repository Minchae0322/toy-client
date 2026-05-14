<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <div class="logo-area">
        <RouterLink to="/">
          <img src="/images/yogodde02.png" alt="요거뜨" class="logo-image" />
        </RouterLink>
      </div>

      <div v-if="activeTab !== 'reset'" class="tab-header">
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

      <div class="tab-content">
        <transition name="fade-slide" mode="out-in">
          <LoginForm
              v-if="activeTab === 'login'"
              key="login"
              :session-expired="sessionExpired"
              :loading="loading"
              :error-message="loginError"
              @submit="handleLogin"
              @social-login="handleSocialLogin"
              @forgot-password="switchTab('reset')"
          />
          <RegisterForm
              v-else-if="activeTab === 'register'"
              key="register"
              :loading="loading"
              :error-message="registerError"
              @submit="handleRegister"
          />
          <PasswordResetForm
              v-else
              key="reset"
              :loading="loading"
              :error-message="resetError"
              @submit="handleResetPassword"
              @back="switchTab('login')"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { useAuth } from '@/composables/useAuth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import * as authUtils from '@/utils/auth.js'
import { authService } from '@/services/AuthService.js'
import LoginForm from '@/components/login/LoginForm.vue'
import RegisterForm from '@/components/login/RegisterForm.vue'
import PasswordResetForm from '@/components/login/PasswordResetForm.vue'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()
const { open } = useConfirmDialog()

const activeTab = ref('login')
const loading = ref(false)
const loginError = ref('')
const registerError = ref('')
const resetError = ref('')

const redirectPath = computed(() => route.query.redirect || '/feed')
const sessionExpired = computed(() => route.query.reason === 'session_expired')

const switchTab = (tab) => {
  activeTab.value = tab
  loginError.value = ''
  registerError.value = ''
  resetError.value = ''
}

/**
 * 이메일 로그인 에러를 코드와 함께 분류한다.
 * 화면에 표시되는 메시지에 [ERR-E-xxx] 형태로 코드를 포함시켜
 * 심사·고객 지원에서 어떤 단계의 실패인지 즉시 식별 가능.
 *
 * ERR-E-200 : 네트워크 도달 실패 (서버 응답 없음)
 * ERR-E-201 : 타임아웃
 * ERR-E-299 : 통신 실패 (원인 불명)
 * ERR-E-400 : 잘못된 요청 (이메일 형식 오류 등)
 * ERR-E-401 : 자격 증명 거부 (비밀번호 불일치)
 * ERR-E-403 : 접근 거부 (정지된 계정 등)
 * ERR-E-404 : 사용자 없음
 * ERR-E-409 : 충돌 (중복 등)
 * ERR-E-429 : 요청 횟수 초과
 * ERR-E-4xx : 기타 클라이언트 오류
 * ERR-E-5xx : 서버 오류
 */
const classifyEmailLoginError = (err) => {
  const status = err?.status
  const rawMsg = String(err?.message || '')
  const rawLower = rawMsg.toLowerCase()

  if (!status) {
    if (rawLower.includes('timeout')) {
      return { code: 'ERR-E-201', text: '서버 응답이 너무 느려요. 잠시 후 다시 시도해주세요.' }
    }
    if (
      rawLower.includes('network') ||
      rawLower.includes('failed to fetch') ||
      rawLower.includes('xhr') ||
      rawLower.includes('err_')
    ) {
      return { code: 'ERR-E-200', text: '서버에 도달할 수 없어요. 네트워크 연결을 확인해주세요.' }
    }
    return { code: 'ERR-E-299', text: '서버 통신 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.' }
  }

  if (status === 400) return { code: 'ERR-E-400', text: '입력값을 다시 확인해주세요.' }
  if (status === 401) return { code: 'ERR-E-401', text: '이메일 또는 비밀번호가 일치하지 않습니다.' }
  if (status === 403) return { code: 'ERR-E-403', text: '접근이 거부되었어요. 계정 상태를 확인해주세요.' }
  if (status === 404) return { code: 'ERR-E-404', text: '존재하지 않는 계정이에요.' }
  if (status === 409) return { code: 'ERR-E-409', text: '계정 상태에 충돌이 있어요. 고객 지원에 문의해주세요.' }
  if (status === 429) return { code: 'ERR-E-429', text: '시도 횟수가 너무 많아요. 잠시 후 다시 시도해주세요.' }
  if (status >= 500) return { code: `ERR-E-${status}`, text: '서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해주세요.' }
  if (status >= 400) return { code: `ERR-E-${status}`, text: '요청이 거부되었어요. 잠시 후 다시 시도해주세요.' }

  return { code: `ERR-E-${status}`, text: '알 수 없는 오류가 발생했어요.' }
}

const handleLogin = async (formData) => {
  loading.value = true
  loginError.value = ''
  try {
    const response = await authService.login(formData)
    const { accessToken, refreshToken, user } = response.data
    await login({ accessToken, refreshToken }, user)
    router.push(redirectPath.value)
  } catch (error) {
    const { code, text } = classifyEmailLoginError(error)
    loginError.value = `${text} [${code}]`
    console.error('[Login] 이메일 로그인 실패:', { code, status: error?.status, message: error?.message })
  } finally {
    loading.value = false
  }
}

const handleRegister = async (formData) => {
  loading.value = true
  registerError.value = ''
  try {
    await authService.signup(formData)
    // 회원가입 성공 알림
    await open({
      type: 'alert',
      title: '회원가입 완료',
      message: '회원가입이 완료되었습니다.\n로그인해 주세요.'
    })
    // 로그인 탭으로 전환
    activeTab.value = 'login'
    loginError.value = ''
  } catch (error) {
    registerError.value = error.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = async (provider) => {
  loginError.value = ''

  // 네이티브: Apple/Google은 OAuth 콜백 화면으로 라우팅 (진행 UI 재사용)
  if (Capacitor.isNativePlatform() && (provider === 'apple' || provider === 'google')) {
    sessionStorage.setItem('oauth_provider', provider)
    sessionStorage.setItem('oauth_redirect', redirectPath.value)
    router.push({ path: '/oauth/callback', query: { native: '1', provider } })
    return
  }

  // 네이티브: Naver는 SFSafariViewController + deep link (yogurtte://)
  // 백엔드가 ?platform=ios|android 감지 시 yogurtte://oauth/callback?token=...로 redirect
  if (Capacitor.isNativePlatform() && provider === 'naver') {
    sessionStorage.setItem('oauth_provider', provider)
    sessionStorage.setItem('oauth_redirect', redirectPath.value)
    const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL
    const platform = Capacitor.getPlatform()
    try {
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({
        url: `${authBaseUrl}/oauth2/authorization/naver?platform=${platform}`,
        presentationStyle: 'popover',
      })
    } catch (e) {
      console.error('[LoginView] Naver Browser.open 실패:', e)
      loginError.value = 'Naver 로그인 페이지를 열 수 없습니다.'
    }
    return
  }

  // 웹 (또는 GitHub 네이티브 — 기존 OAuth redirect)
  sessionStorage.setItem('oauth_provider', provider)
  const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL
  window.location.href = `${authBaseUrl}/oauth2/authorization/${provider}`
}

const handleResetPassword = async ({ email, token, newPassword }) => {
  loading.value = true
  resetError.value = ''
  try {
    await authService.resetPassword({ email, token, newPassword })
    await open({
      type: 'alert',
      title: '비밀번호 변경 완료',
      message: '새 비밀번호로 다시 로그인해 주세요.'
    })
    activeTab.value = 'login'
  } catch (error) {
    // 백엔드 PASSWORD_RESET_TOKEN_INVALID(400) / USER_NOT_FOUND(404) 등
    const status = error?.status
    const msg = error?.message || ''
    if (status === 400 && (msg.includes('토큰') || msg.includes('만료'))) {
      resetError.value = '인증 정보가 만료되었습니다. 처음부터 다시 시도해 주세요.'
    } else {
      resetError.value = msg || '비밀번호 변경에 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const accessToken = authUtils.getAccessToken()
  if (accessToken && !authUtils.isTokenExpired(accessToken)) {
    router.replace(redirectPath.value)
  }
})
</script>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-base);
  padding: 20px;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: var(--bg-elevated);
  border-radius: 20px;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.04), 0 8px 32px rgba(15, 23, 42, 0.06);
}

.logo-area {
  padding: 44px 20px 28px;
  text-align: center;
}

.logo-image {
  max-width: 110px;
  height: auto;
}

.tab-header {
  display: flex;
  margin: 0 28px;
  background: var(--bg-mute);
  border-radius: 10px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-400);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.18s ease;
  font-family: inherit;
  letter-spacing: -0.2px;
}

.tab-btn:hover:not(.active) {
  color: var(--c-text-600);
}

.tab-btn.active {
  color: var(--text-primary);
  background: var(--bg-elevated);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.tab-content {
  padding: 32px 28px 40px;
}

/* 전환 애니메이션 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateY(5px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-5px); }

@media (max-width: 480px) {
  .auth-wrapper { background: var(--bg-base); padding: 16px; }
  .auth-container { border-radius: 16px; }
  .tab-header { margin: 0 20px; }
  .tab-content { padding: 28px 20px 36px; }
  .logo-area { padding: 36px 20px 24px; }
}
</style>