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
          <a href="#" @click.prevent="openTerms('terms')" class="link">이용약관</a> 및
          <a href="#" @click.prevent="openTerms('privacy')" class="link">개인정보처리방침</a>에 동의합니다.
        </span>
      </label>
    </div>

    <TermsModal
        :visible="termsModalVisible"
        :initial-tab="termsModalTab"
        @close="termsModalVisible = false"
    />

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
import TermsModal from './TermsModal.vue'

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

const termsModalVisible = ref(false)
const termsModalTab = ref('terms')

const openTerms = (tab) => {
  termsModalTab.value = tab
  termsModalVisible.value = true
}

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

/* 상태 배너 */
.status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: -0.1px;
}

.status-banner.success {
  background-color: var(--c-success-soft);
  color: var(--c-success);
  border: 1px solid #BBF7D0;
}

/* 입력 그룹 */
.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.1px;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  font-size: 14px;
  font-weight: 500;
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  background-color: var(--bg-subtle);
  transition: all 0.15s ease;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
}

input::placeholder { color: var(--c-text-300); font-weight: 400; }

input:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
  background: var(--bg-elevated);
}

input.error {
  border-color: var(--c-danger);
  background: var(--c-danger-soft);
}

.input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-300);
}

.error-msg {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-danger);
  margin-top: 6px;
  display: block;
}

/* 약관 동의 */
.terms-container {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--bg-subtle);
  border: 1.5px solid var(--border-default);
  border-radius: 12px;
}

.custom-checkbox {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  gap: 10px;
  font-size: 13px;
  color: var(--c-text-600);
  line-height: 1.5;
  font-weight: 500;
}

.custom-checkbox input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--c-text-300);
  border-radius: 6px;
  background: var(--bg-elevated);
  flex-shrink: 0;
  position: relative;
  transition: all 0.15s;
  margin-top: 1px;
}

.custom-checkbox input:checked + .checkmark {
  background-color: var(--c-brand);
  border-color: var(--c-brand);
}

.custom-checkbox input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 3px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.link {
  color: var(--c-brand);
  font-weight: 700;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* 제출 버튼 */
.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: var(--c-ink-900);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  letter-spacing: -0.2px;
  transition: background 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--c-ink-700);
}

.submit-btn:disabled {
  background-color: var(--bg-mute);
  color: var(--c-text-300);
  cursor: not-allowed;
}

/* 에러 알림 */
.error-alert {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  color: var(--c-danger);
  font-size: 13px;
  font-weight: 600;
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