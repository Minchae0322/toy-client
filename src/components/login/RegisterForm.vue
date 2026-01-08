<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <EmailVerification
        v-model:email="form.email"
        v-model:verified="form.emailVerified"
        v-model:verification-token="form.verificationToken"
        :disabled="loading"
    />

    <transition name="slide-fade">
      <div v-if="form.emailVerified" class="status-banner success">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>이메일 인증이 완료되었습니다.</span>
      </div>
    </transition>

    <PasswordWithStrength
        v-model:password="form.password"
        v-model:show-password="form.showPassword"
        :disabled="loading"
        @strength-change="handleStrengthChange"
    />

    <div class="input-group">
      <label class="input-label">비밀번호 확인</label>
      <div class="input-wrapper">
        <div class="input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <input
            :type="form.showPassword ? 'text' : 'password'"
            v-model="form.passwordConfirm"
            placeholder="비밀번호를 다시 한 번 입력하세요"
            required
            :disabled="loading"
            :class="{ error: form.passwordError && form.passwordConfirm }"
            @input="checkPasswordMatch"
            @blur="checkPasswordMatch"
        />
      </div>
      <span v-if="form.passwordError && form.passwordConfirm" class="error-msg">
        비밀번호가 일치하지 않습니다.
      </span>
    </div>

    <div class="terms-container">
      <label class="custom-checkbox">
        <input type="checkbox" v-model="form.agreeTerms" />
        <span class="checkmark"></span>
        <span class="terms-label">
          <a href="#" @click.prevent class="link">이용약관</a> 및
          <a href="#" @click.prevent class="link">개인정보처리방침</a>에 동의합니다.
        </span>
      </label>
    </div>

    <button type="submit" class="submit-btn" :disabled="!canSubmit || loading">
      <div v-if="loading" class="spinner"></div>
      <span>{{ loading ? '가입 처리 중' : '계정 생성하기' }}</span>
    </button>

    <transition name="shake">
      <div v-if="displayError" class="error-alert">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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

const passwordStrength = ref(0)
const displayError = computed(() => props.errorMessage || '')

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

/* Linear 스타일의 상태 배너 */
.status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 20px;
  font-weight: 500;
}

.status-banner.success {
  background-color: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

/* 입력 그룹 공통 스타일 */
.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #27272a;
  margin-bottom: 6px;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  font-size: 14px;
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  background-color: #ffffff;
  transition: all 0.2s ease;
  outline: none;
}

input:focus {
  border-color: #18181b;
  box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.05);
}

input.error {
  border-color: #ef4444;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a1a1aa;
}

.error-msg {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
  display: block;
}

/* 약관 동의 섹션: 정갈한 박스 형태 */
.terms-container {
  margin-bottom: 24px;
  padding: 14px;
  background-color: #fafafa;
  border: 1px solid #f4f4f5;
  border-radius: 8px;
}

.custom-checkbox {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  gap: 10px;
  font-size: 13px;
  color: #52525b;
  line-height: 1.4;
}

.custom-checkbox input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 1px solid #d4d4d8;
  border-radius: 4px;
  background: white;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s;
}

.custom-checkbox input:checked + .checkmark {
  background-color: #9333ea;
  border-color: #9333ea;
}

.custom-checkbox input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.link {
  color: #9333ea;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* 제출 버튼 */
.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #18181b; /* Linear 특유의 블랙 버튼 */
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  background-color: #f4f4f5;
  color: #a1a1aa;
  cursor: not-allowed;
}

/* 에러 알림 */
.error-alert {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
}

/* 로딩 스피너 */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 애니메이션 */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-10px); }

.shake-enter-active {
  animation: shake 0.3s;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>