<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div class="form-header">
      <h2 class="form-title">비밀번호 찾기</h2>
      <p class="form-sub">가입한 이메일로 인증 후 새 비밀번호를 설정해 주세요.</p>
    </div>

    <EmailVerification
        v-model:email="form.email"
        v-model:verified="form.emailVerified"
        v-model:verification-token="form.verificationToken"
        :disabled="loading"
        mode="reset"
    />

    <transition name="slide-fade">
      <div v-if="form.emailVerified" class="status-banner success">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>인증 완료. 새 비밀번호를 입력해 주세요.</span>
      </div>
    </transition>

    <transition name="slide-fade">
      <div v-if="form.emailVerified" class="password-section">
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
      </div>
    </transition>

    <button type="submit" class="submit-btn" :disabled="!canSubmit || loading">
      <div v-if="loading" class="spinner"></div>
      <span>{{ loading ? '변경 중' : '비밀번호 변경' }}</span>
    </button>

    <transition name="shake">
      <div v-if="displayError" class="error-alert">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ displayError }}
      </div>
    </transition>

    <button type="button" class="back-btn" @click="$emit('back')" :disabled="loading">
      ← 로그인으로 돌아가기
    </button>
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

const emit = defineEmits(['submit', 'back'])

const form = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  showPassword: false,
  emailVerified: false,
  verificationToken: '',
  passwordError: false
})

const passwordStrength = ref(0)
const displayError = computed(() => props.errorMessage || '')

const handleStrengthChange = (strength) => {
  passwordStrength.value = strength
}

const canSubmit = computed(() => {
  return form.value.email &&
      form.value.emailVerified &&
      form.value.password &&
      form.value.passwordConfirm &&
      !form.value.passwordError &&
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
    token: form.value.verificationToken,
    newPassword: form.value.password
  })
}
</script>

<style scoped>
.auth-form { width: 100%; }

.form-header { margin-bottom: 24px; }
.form-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  margin: 0 0 6px;
}
.form-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-400);
  letter-spacing: -0.1px;
  margin: 0;
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

.password-section { width: 100%; }

/* 입력 그룹 */
.input-group { margin-bottom: 20px; }
.input-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.1px;
}
.input-wrapper { position: relative; }

input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  font-size: 14px;
  font-weight: 500;
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  outline: none;
  transition: all 0.15s ease;
  color: var(--text-primary);
  background: var(--bg-subtle);
  font-family: inherit;
}
input::placeholder { color: var(--c-text-300); font-weight: 400; }
input:focus { border-color: var(--c-brand); box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08); background: var(--bg-elevated); }
input:disabled { background-color: var(--bg-mute); color: var(--c-text-300); }
input.error { border-color: var(--c-danger); background: var(--c-danger-soft); }

.input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--c-text-300); }

.error-msg { font-size: 12px; font-weight: 600; color: var(--c-danger); margin-top: 6px; display: block; }

/* 제출 버튼 */
.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: var(--c-ink-900);
  color: white;
  border: none;
  border-radius: 10px;
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
  margin-top: 8px;
}
.submit-btn:hover:not(:disabled) { background: var(--c-ink-700); }
.submit-btn:disabled { background-color: var(--bg-mute); color: var(--c-text-300); cursor: not-allowed; }

/* 에러 알림 */
.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 14px;
  background-color: var(--c-danger-soft);
  border: 1px solid var(--c-danger-soft);
  border-radius: 10px;
  color: var(--c-danger);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.1px;
}

/* 뒤로가기 */
.back-btn {
  width: 100%;
  margin-top: 14px;
  padding: 10px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-400);
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.1px;
  transition: color 0.15s ease;
}
.back-btn:hover:not(:disabled) { color: var(--c-text-600); }
.back-btn:disabled { cursor: not-allowed; opacity: 0.5; }

/* 스피너 */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 트랜지션 */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-8px); }

.shake-enter-active { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
