<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
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
      <div v-if="displayError" class="alert-box error">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z"/>
        </svg>
        {{ displayError }}
      </div>
    </transition>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import EmailVerification from './EmailVerification.vue'
import PasswordWithStrength from './PasswordWithStrength.vue'

const props = defineProps({
  loading: Boolean,
  errorMessage: String
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
  agreeTerms: false
})

// 에러 메시지는 props에서 받음
const displayError = computed(() => props.errorMessage || '')

const passwordStrength = ref(0)

const handleStrengthChange = (strength) => {
  passwordStrength.value = strength
}

const canSubmit = computed(() => {
  return form.value.email &&
      form.value.password &&
      form.value.passwordConfirm &&
      form.value.emailVerified &&
      !form.value.passwordError &&
      form.value.agreeTerms &&
      passwordStrength.value >= 3
})

const checkPasswordMatch = () => {
  if (form.value.passwordConfirm) {
    form.value.passwordError = form.value.password !== form.value.passwordConfirm
  } else {
    form.value.passwordError = false
  }
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', {
    email: form.value.email,
    password: form.value.password,
    verificationToken: form.value.verificationToken
  })
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
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 500;
  border: 2px solid;
}

.notification.success {
  background: #E8F8F0;
  border-color: #A8E6CF;
  color: #065F46;
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #616161;
  margin-bottom: 8px;
}

.required {
  color: #9333EA;
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
}

input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 12px 44px;
  font-size: 14px;
  border: 1px solid #E9D5FF;
  border-radius: 12px;
  color: #424242;
  background: #FDFCFF;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
}

input::placeholder {
  color: #BDBDBD;
}

input:hover:not(:focus):not(:disabled) {
  border-color: #C4B5FD;
  background: white;
}

input:focus {
  border-color: #9333EA;
  background: white;
  box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1);
}

input:disabled {
  background: #FAFAFA;
  cursor: not-allowed;
  opacity: 0.6;
  border-color: #EEEEEE;
}

input.error {
  border-color: #EF4444;
  background: #FFF5F5;
}

input.error:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #C4B5FD;
  pointer-events: none;
  transition: color 0.2s;
}

input:focus ~ .input-icon {
  color: #9333EA;
}

.error-msg {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #EF4444;
  font-weight: 500;
}

.terms-section {
  margin-bottom: 16px;
  padding: 14px;
  background: #FAF5FF;
  border: 1px solid #F3E8FF;
  border-radius: 12px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: #616161;
  line-height: 1.5;
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
  border: 2px solid #E9D5FF;
  border-radius: 6px;
  margin-right: 10px;
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
  background: #9333EA;
  border-color: #9333EA;
}

.checkbox-label input:checked ~ .checkbox-box svg {
  opacity: 1;
  transform: scale(1);
}

.checkbox-label:hover .checkbox-box {
  border-color: #9333EA;
}

.terms-text {
  flex: 1;
}

.link {
  color: #9333EA;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.link:hover {
  color: #7C3AED;
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn.primary {
  background: linear-gradient(135deg, #9333EA 0%, #A855F7 100%);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(147, 51, 234, 0.4);
}

.submit-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
  box-shadow: 0 6px 16px -2px rgba(147, 51, 234, 0.5);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background: #EEEEEE;
  color: #9E9E9E;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
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
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  margin-top: 16px;
  font-size: 13px;
  font-weight: 500;
}

.alert-box.error {
  background: #FFF0F3;
  color: #C62828;
  border: 2px solid #FFCDD2;
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