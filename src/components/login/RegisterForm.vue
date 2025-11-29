<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <!-- 디버깅 정보 -->
    <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 11px; border-radius: 4px;">
      <div>이메일: {{ form.email }}</div>
      <div>이메일 인증: {{ form.emailVerified }}</div>
      <div>비밀번호: {{ form.password }}</div>
      <div>비밀번호 확인: {{ form.passwordConfirm }}</div>
      <div>비밀번호 일치: {{ !form.passwordError }}</div>
      <div>약관 동의: {{ form.agreeTerms }}</div>
      <div>비밀번호 강도: {{ passwordStrength }} / 4</div>
      <div style="font-weight: bold; color: {{ canSubmit ? 'green' : 'red' }};">
        버튼 활성화: {{ canSubmit }}
      </div>
    </div>

    <!-- 이메일 입력 & 인증 -->
    <EmailVerification
        v-model:email="form.email"
        v-model:verified="form.emailVerified"
        v-model:verification-token="form.verificationToken"
        :disabled="loading"
    />

    <!-- 인증 성공 메시지 -->
    <transition name="slide">
      <div v-if="form.emailVerified" class="notification success">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
        이메일 인증 완료
      </div>
    </transition>

    <!-- 비밀번호 입력 -->
    <PasswordWithStrength
        v-model:password="form.password"
        v-model:show-password="form.showPassword"
        :disabled="loading"
        @strength-change="handleStrengthChange"
    />

    <!-- 비밀번호 확인 -->
    <div class="input-group">
      <label class="input-label">
        비밀번호 확인
        <span class="required">*</span>
      </label>
      <div class="input-wrapper">
        <input
            :type="form.showPassword ? 'text' : 'password'"
            v-model="form.passwordConfirm"
            placeholder="비밀번호를 다시 입력하세요"
            required
            :disabled="loading"
            :class="{ error: form.passwordError && form.passwordConfirm }"
            @input="checkPasswordMatch"
            @blur="checkPasswordMatch"
        />
        <div class="input-icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="5" y="9" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M10 13v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      <span v-if="form.passwordError && form.passwordConfirm" class="error-msg">
        비밀번호가 일치하지 않습니다
      </span>
    </div>

    <!-- 약관 동의 -->
    <div class="terms-section">
      <label class="checkbox-label">
        <input type="checkbox" v-model="form.agreeTerms" />
        <span class="checkbox-box">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="terms-text">
          <a href="#" class="link" @click.prevent>이용약관</a> 및
          <a href="#" class="link" @click.prevent>개인정보처리방침</a>에 동의합니다
        </span>
      </label>
    </div>

    <!-- 회원가입 버튼 -->
    <button type="submit" class="submit-btn primary" :disabled="!canSubmit || loading">
      <svg v-if="loading" class="spinner" width="18" height="18" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="40">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <span>{{ loading ? '가입 중...' : '회원가입' }}</span>
    </button>

    <!-- 에러 메시지 -->
    <transition name="shake">
      <div v-if="form.errorMessage" class="alert-box error">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z"/>
        </svg>
        {{ form.errorMessage }}
      </div>
    </transition>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import EmailVerification from './EmailVerification.vue'
import PasswordWithStrength from './PasswordWithStrength.vue'

const props = defineProps({
  loading: Boolean
})

const emit = defineEmits(['submit'])

const form = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  showPassword: false,
  emailVerified: false,
  verificationToken: '',
  passwordError: false,
  agreeTerms: false,
  errorMessage: ''
})

const passwordStrength = ref(0)

// 비밀번호 강도 변경 핸들러 추가
const handleStrengthChange = (strength) => {
  console.log('비밀번호 강도 변경:', strength)
  passwordStrength.value = strength
}

const canSubmit = computed(() => {
  const result =
      form.value.email &&
      form.value.password &&
      form.value.passwordConfirm &&
      form.value.emailVerified &&
      !form.value.passwordError &&
      form.value.agreeTerms &&
      passwordStrength.value >= 3  // 4 대신 3으로 완화 (테스트용)

  console.log('canSubmit 계산:', {
    email: !!form.value.email,
    password: !!form.value.password,
    passwordConfirm: !!form.value.passwordConfirm,
    emailVerified: form.value.emailVerified,
    passwordError: !form.value.passwordError,
    agreeTerms: form.value.agreeTerms,
    passwordStrength: passwordStrength.value,
    result
  })

  return result
})

const checkPasswordMatch = () => {
  if (form.value.passwordConfirm) {
    form.value.passwordError = form.value.password !== form.value.passwordConfirm
  } else {
    form.value.passwordError = false
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) {
    console.log('제출 불가 - canSubmit이 false입니다')
    return
  }

  form.value.errorMessage = ''

  try {
    await emit('submit', {
      email: form.value.email,
      password: form.value.password,
      verificationToken: form.value.verificationToken
    })
  } catch (error) {
    if (error.response?.status === 409) {
      form.value.errorMessage = '이미 사용중인 이메일입니다'
    } else if (error.response?.status === 400) {
      form.value.errorMessage = error.response?.data?.message || '입력 정보를 확인해주세요'
    } else {
      form.value.errorMessage = error.message || '회원가입 중 오류가 발생했습니다'
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
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 2px solid;
}

.notification.success {
  background: #D1FAE5;
  border-color: #6EE7B7;
  color: #065F46;
}

.input-group {
  margin-bottom: 12px;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #EF4444;
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
}

input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 10px 36px;
  font-size: 14px;
  border: 2px solid #D1D5DB;
  border-radius: 6px;
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
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  pointer-events: none;
}

.error-msg {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #EF4444;
  font-weight: 500;
}

.terms-section {
  margin-bottom: 12px;
  padding: 12px;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 6px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  color: #374151;
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  width: 16px;
  height: 16px;
  min-width: 16px;
  border: 2px solid #D1D5DB;
  border-radius: 4px;
  margin-right: 8px;
  margin-top: 1px;
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

.terms-text {
  flex: 1;
}

.link {
  color: #111827;
  text-decoration: underline;
  font-weight: 600;
}

.link:hover {
  opacity: 0.7;
}

.submit-btn {
  width: 100%;
  padding: 11px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
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
  padding: 10px 12px;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 500;
}

.alert-box.error {
  background: #FEE2E2;
  color: #991B1B;
  border: 2px solid #FCA5A5;
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
</style>