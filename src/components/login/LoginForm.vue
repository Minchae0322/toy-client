<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <!-- 세션 만료 알림 -->
    <transition name="slide">
      <div v-if="sessionExpired" class="notification warning">
        <div class="notification-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 3a1 1 0 011 1v4a1 1 0 01-2 0V6a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z"/>
          </svg>
        </div>
        <div class="notification-content">
          <strong>세션 만료</strong>
          <p>보안을 위해 다시 로그인해주세요</p>
        </div>
      </div>
    </transition>

    <!-- 이메일 입력 -->
    <div class="input-group">
      <label class="input-label">
        이메일 주소
        <span class="required">*</span>
      </label>
      <div class="input-wrapper">
        <input
            type="email"
            v-model="form.email"
            placeholder="name@example.com"
            required
            autocomplete="email"
            :disabled="loading"
            :class="{ error: form.emailError }"
            @blur="validateEmail"
        />
        <div class="input-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M3 5l7 5 7-5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </div>
      </div>
      <span v-if="form.emailError" class="error-msg">
        올바른 이메일 형식을 입력해주세요
      </span>
    </div>

    <!-- 비밀번호 입력 -->
    <div class="input-group">
      <div class="label-wrapper">
        <label class="input-label">
          비밀번호
          <span class="required">*</span>
        </label>
        <button type="button" class="text-btn" @click="$emit('forgot-password')">
          비밀번호를 잊으셨나요?
        </button>
      </div>
      <div class="input-wrapper">
        <input
            :type="form.showPassword ? 'text' : 'password'"
            v-model="form.password"
            placeholder="비밀번호를 입력하세요"
            required
            autocomplete="current-password"
            :disabled="loading"
        />
        <div class="input-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="5" y="9" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <button
            type="button"
            class="toggle-btn"
            @click="form.showPassword = !form.showPassword"
            tabindex="-1"
        >
          <svg v-if="!form.showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 로그인 옵션 -->
    <div class="checkbox-group">
      <label class="checkbox-label">
        <input type="checkbox" v-model="form.rememberMe" />
        <span class="checkbox-box">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <span>로그인 상태 유지</span>
      </label>
    </div>

    <!-- 로그인 버튼 -->
    <button type="submit" class="submit-btn primary" :disabled="loading || !canSubmit">
      <svg v-if="loading" class="spinner" width="20" height="20" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="40">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <span>{{ loading ? '로그인 중...' : '로그인' }}</span>
    </button>

    <!-- 에러 메시지 -->
    <transition name="shake">
      <div v-if="form.errorMessage" class="alert-box error">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z"/>
        </svg>
        {{ form.errorMessage }}
      </div>
    </transition>

    <!-- 소셜 로그인 섹션 -->
    <div class="social-section">
      <div class="divider-text">간편 로그인</div>
      <div class="social-buttons">
        <button type="button" class="social-btn" @click="$emit('social-login', 'google')">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
        <button type="button" class="social-btn" @click="$emit('social-login', 'github')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          GitHub
        </button>
        <button type="button" class="social-btn kakao" @click="$emit('social-login', 'kakao')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
          </svg>
          Kakao
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  sessionExpired: Boolean,
  loading: Boolean
})

const emit = defineEmits(['submit', 'social-login', 'forgot-password'])

const form = ref({
  email: '',
  password: '',
  rememberMe: false,
  showPassword: false,
  emailError: false,
  errorMessage: ''
})

const canSubmit = computed(() =>
    form.value.email &&
    form.value.password &&
    !form.value.emailError
)

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (form.value.email) {
    form.value.emailError = !emailRegex.test(form.value.email)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  form.value.errorMessage = ''

  try {
    await emit('submit', {
      email: form.value.email,
      password: form.value.password,
      rememberMe: form.value.rememberMe
    })
  } catch (error) {
    if (error.response?.status === 401) {
      form.value.errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다'
    } else if (error.response?.status === 403) {
      form.value.errorMessage = '계정이 비활성화되었습니다'
    } else {
      form.value.errorMessage = '로그인 중 오류가 발생했습니다'
    }
  }
}
</script>

<style scoped>
.auth-form {
  width: 100%;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  border: 2px solid;
}

.notification.warning {
  background: #FEF3C7;
  border-color: #FCD34D;
  color: #92400E;
}

.notification-icon {
  flex-shrink: 0;
}

.notification-content strong {
  display: block;
  font-weight: 600;
  margin-bottom: 2px;
}

.notification-content p {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #EF4444;
  margin-left: 2px;
}

.label-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.text-btn {
  font-size: 12px;
  color: #5B5FCF;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  transition: opacity 0.2s;
}

.text-btn:hover {
  opacity: 0.8;
}

.input-wrapper {
  position: relative;
}

input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 11px 40px;
  font-size: 14px;
  border: 2px solid #D1D5DB;
  border-radius: 8px;
  color: #1F2937;
  background: white;
  transition: all 0.2s;
  outline: none;
  box-sizing: border-box;
}

input::placeholder {
  color: #9CA3AF;
}

input:hover:not(:focus):not(:disabled) {
  border-color: #9CA3AF;
}

input:focus {
  border-color: #5B5FCF;
  background: white;
  box-shadow: 0 0 0 3px rgba(91, 95, 207, 0.1);
}

input:disabled {
  background: #F9FAFB;
  cursor: not-allowed;
  opacity: 0.6;
  border-color: #E5E7EB;
}

input.error {
  border-color: #EF4444;
}

input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  pointer-events: none;
}

.toggle-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: #4B5563;
}

.error-msg {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #EF4444;
  font-weight: 500;
}

.checkbox-group {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  min-width: 18px;
  border: 2px solid #D1D5DB;
  border-radius: 4px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
}

.checkbox-box svg {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
}

.checkbox-label input:checked ~ .checkbox-box {
  background: #5B5FCF;
  border-color: #5B5FCF;
}

.checkbox-label input:checked ~ .checkbox-box svg {
  opacity: 1;
  transform: scale(1);
}

.checkbox-label:hover .checkbox-box {
  border-color: #5B5FCF;
}

.submit-btn {
  width: 100%;
  padding: 13px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn.primary {
  background: #5B5FCF;
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.submit-btn.primary:hover:not(:disabled) {
  background: #4A4EB8;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #D1D5DB;
  color: #6B7280;
  cursor: not-allowed;
  box-shadow: none;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.alert-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 500;
}

.alert-box.error {
  background: #FEE2E2;
  color: #991B1B;
  border: 2px solid #FCA5A5;
}

.social-section {
  margin-top: 28px;
  padding-top: 28px;
  border-top: 1px solid #E5E7EB;
}

.divider-text {
  text-align: center;
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
  margin-bottom: 16px;
}

.social-buttons {
  display: flex;
  gap: 8px;
}

.social-btn {
  flex: 1;
  padding: 11px 14px;
  border: 2px solid #D1D5DB;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.social-btn:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.social-btn.kakao {
  background: #FEE500;
  border-color: #FEE500;
  color: #000000;
}

.social-btn.kakao:hover {
  background: #FDD835;
  border-color: #FDD835;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.shake-enter-active {
  animation: shake 0.3s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@media (max-width: 640px) {
  .social-buttons {
    flex-direction: column;
  }
}
</style>