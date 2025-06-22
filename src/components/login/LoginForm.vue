<template>
  <div class="login-wrapper">
    <div class="login-container">
      <h1 class="title">로그인</h1>
      <p class="subtitle">계정에 로그인하세요</p>

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
          {{ loading ? '로그인 중...' : '로그인' }}
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { authService } from '@/api/axios.js'

const router = useRouter()
const route = useRoute()
const { login, isLoggedIn } = useAuth()

// 반응형 데이터
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

// 로그인 처리
const handleLogin = async () => {
  if (loading.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    console.log('로그인 시도:', email.value)

    const response = await authService.login({
      email: email.value,
      password: password.value
    })

    console.log('로그인 응답:', response.data)

    // 응답 구조 확인 및 처리
    const { accessToken, refreshToken, user } = response.data

    if (!accessToken) {
      throw new Error('토큰이 응답에 포함되지 않았습니다')
    }

    // 사용자 정보가 없으면 기본값 설정
    const userInfo = user || {
      id: 1,
      email: email.value,
      nickname: email.value.split('@')[0],
      role: 'USER', // 기본값
      profileImage: null
    }

    console.log('저장할 사용자 정보:', userInfo)

    // 인증 정보 저장 (useAuth 컴포저블 사용)
    login(
        { accessToken, refreshToken },
        userInfo
    )

    console.log('로그인 성공 - 리다이렉트 처리')

    // 리다이렉트 처리
    const redirectPath = route.query.redirect || '/home'
    await router.push(redirectPath)

  } catch (error) {
    console.error('로그인 오류:', error)

    // 에러 메시지 처리
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
  }
}

// 소셜 로그인
const handleSocialLogin = (provider) => {
  if (loading.value) return

  const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8081'
  const redirectUrl = `${AUTH_BASE_URL}/api/oauth2/authorization/${provider}`

  console.log('소셜 로그인 리다이렉트:', redirectUrl)
  window.location.href = redirectUrl
}

// 이미 로그인된 상태면 홈으로 리다이렉트
onMounted(() => {
  if (isLoggedIn.value) {
    console.log('이미 로그인된 상태 - 홈으로 리다이렉트')
    router.push('/home')
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

.github-login {
  color: #444;
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

/* 반응형 */
@media (max-width: 480px) {
  .login-container {
    margin: 20px;
    padding: 32px 20px;
  }
}
</style>