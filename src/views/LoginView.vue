<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <div class="logo-area">
        <RouterLink to="/dashboard">
          <img src="/images/yogodde02.png" alt="요거뜨" class="logo-image" />
        </RouterLink>
      </div>

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
          />
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import * as authUtils from '@/utils/auth.js'
import { authService } from '@/services/AuthService.js'
import LoginForm from '@/components/login/LoginForm.vue'
import RegisterForm from '@/components/login/RegisterForm.vue'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()
const { open } = useConfirmDialog()

const activeTab = ref('login')
const loading = ref(false)
const loginError = ref('')
const registerError = ref('')

const redirectPath = computed(() => route.query.redirect || '/feed')
const sessionExpired = computed(() => route.query.reason === 'session_expired')

const switchTab = (tab) => {
  activeTab.value = tab
  loginError.value = ''
  registerError.value = ''
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
    loginError.value = '이메일 또는 비밀번호가 일치하지 않습니다.'
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

const handleSocialLogin = (provider) => {
  const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL
  window.location.href = `${authBaseUrl}/oauth2/authorization/${provider}`
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
  background-color: #ffffff;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.logo-area {
  padding: 40px 20px 24px;
  text-align: center;
}

.logo-image {
  max-width: 120px;
  height: auto;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid #f4f4f5;
  margin: 0 24px;
}

.tab-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #a1a1aa;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn.active {
  color: #18181b;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #9333ea;
}

.tab-content {
  padding: 32px 24px 40px;
}

/* 전환 애니메이션 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateY(5px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-5px); }

@media (max-width: 480px) {
  .auth-wrapper { background: white; padding: 0; }
  .auth-container { border: none; box-shadow: none; max-width: 100%; }
}
</style>