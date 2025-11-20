<template>
  <div>
    <div class="input-group">
      <label class="input-label">
        이메일 주소
        <span class="required">*</span>
      </label>
      <div class="input-with-action">
        <div class="input-wrapper">
          <input
              type="email"
              :value="email"
              @input="$emit('update:email', $event.target.value)"
              placeholder="name@example.com"
              required
              :disabled="disabled || verified"
              :class="{ error: emailError, success: verified }"
              @blur="validateEmail"
          />
          <div class="input-icon">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 5l7 5 7-5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
        </div>
        <button
            type="button"
            class="action-btn"
            :class="{ success: verified }"
            :disabled="!email || emailError || verified || disabled"
            @click="sendVerificationCode"
        >
          <span v-if="verified">✓ 완료</span>
          <span v-else>인증</span>
        </button>
      </div>
      <span v-if="emailError" class="error-msg">
        올바른 이메일 형식을 입력해주세요
      </span>
    </div>

    <!-- 인증번호 입력 영역 -->
    <transition name="expand">
      <div v-if="verificationSent && !verified" class="verification-section">
        <div class="verification-header">
          <span class="verification-title">인증번호 6자리 입력</span>
          <span class="verification-timer" :class="{ warning: timer < 60 }">
            {{ formatTimer(timer) }}
          </span>
        </div>
        <div class="verification-input-wrapper">
          <input
              ref="verificationInput"
              type="text"
              maxlength="6"
              inputmode="numeric"
              pattern="[0-9]*"
              class="verification-input"
              placeholder="000000"
              :disabled="disabled"
              v-model="verificationCode"
              @input="handleVerificationInput"
              @paste="handlePaste"
          />
        </div>
        <div class="verification-footer">
          <button type="button" class="text-btn primary" :disabled="disabled || verificationCode.length !== 6" @click="verifyCode">
            인증 확인
          </button>
          <span class="separator">·</span>
          <button type="button" class="text-btn" :disabled="disabled" @click="sendVerificationCode">
            재발송
          </button>
        </div>
        <span v-if="verificationError" class="error-msg">
          {{ verificationError }}
        </span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { authService } from '@/services/AuthService.js'

const props = defineProps({
  email: String,
  verified: Boolean,
  verificationToken: String,
  disabled: Boolean
})

const emit = defineEmits(['update:email', 'update:verified', 'update:verificationToken'])

const emailError = ref(false)
const verificationSent = ref(false)
const verificationError = ref('')
const verificationInput = ref(null)
const verificationCode = ref('')
const timer = ref(180)
const timerInterval = ref(null)

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (props.email) {
    emailError.value = !emailRegex.test(props.email)
  }
}

const sendVerificationCode = async () => {
  if (emailError.value || !props.email) return

  verificationError.value = ''

  try {
    const response = await authService.sendVerificationCode(props.email)

    if (response.success) {
      console.log('✅ 인증번호 발송 성공')
      verificationSent.value = true

      timer.value = 180
      if (timerInterval.value) clearInterval(timerInterval.value)
      timerInterval.value = setInterval(() => {
        if (timer.value > 0) {
          timer.value--
        } else {
          clearInterval(timerInterval.value)
          verificationSent.value = false
          verificationError.value = '인증 시간이 만료되었습니다. 다시 시도해주세요.'
        }
      }, 1000)

      // 첫 번째 입력칸에 자동 포커스
      setTimeout(() => {
        verificationInput.value?.focus({ preventScroll: true })
      }, 100)
    } else {
      throw new Error(response.message || '인증 코드 발송에 실패했습니다')
    }
  } catch (error) {
    console.error('❌ 인증 코드 발송 실패:', error)
    verificationError.value = error.message || '인증 코드 발송 중 오류가 발생했습니다'
  }
}

const handlePaste = (event) => {
  const pastedData = event.clipboardData.getData('text').trim().replace(/\D/g, '')
  if (pastedData.length <= 6) {
    verificationCode.value = pastedData
  }
}

const handleVerificationInput = (event) => {
  // 숫자만 허용
  verificationCode.value = event.target.value.replace(/\D/g, '')
}

const verifyCode = async () => {
  if (verificationCode.value.length !== 6) {
    verificationError.value = '6자리 인증 코드를 입력해주세요'
    return
  }

  verificationError.value = ''

  try {
    const response = await authService.verifyEmailCode(props.email, verificationCode.value)

    if (response.success && response.data) {
      console.log('✅ 이메일 인증 성공')
      emit('update:verified', true)
      emit('update:verificationToken', response.data)
      verificationSent.value = false
      clearInterval(timerInterval.value)
    } else {
      throw new Error(response.message || '인증 코드가 올바르지 않습니다')
    }
  } catch (error) {
    console.error('❌ 인증 코드 검증 실패:', error)
    verificationError.value = error.message || '인증 코드 확인 중 오류가 발생했습니다'
    verificationCode.value = ''
    verificationInput.value?.focus({ preventScroll: true })
  }
}

const formatTimer = (seconds) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style scoped>
.input-group {
  margin-bottom: 12px;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 6px;
}

.required {
  color: var(--error);
  margin-left: 2px;
}

.input-with-action {
  display: flex;
  gap: 6px;
}

.input-with-action .input-wrapper {
  flex: 1;
  min-width: 0;
}

.input-wrapper {
  position: relative;
}

input[type="email"] {
  width: 100%;
  padding: 10px 36px;
  font-size: 14px;
  border: 2px solid var(--gray-300);
  border-radius: 6px;
  color: var(--gray-800);
  background: white;
  transition: all 0.2s;
  outline: none;
}

input::placeholder {
  color: var(--gray-400);
  font-size: 13px;
}

input:hover:not(:focus):not(:disabled) {
  border-color: var(--gray-400);
}

input:focus {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(91, 95, 207, 0.1);
}

input:disabled {
  background: var(--gray-50);
  cursor: not-allowed;
  opacity: 0.6;
  border-color: var(--gray-200);
}

input.error {
  border-color: var(--error);
}

input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

input.success {
  border-color: var(--success);
}

input.success:focus {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  pointer-events: none;
}

.action-btn {
  min-width: 56px;
  padding: 0 14px;
  background: #5B5FCF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.action-btn:hover:not(:disabled) {
  background: #4A4EB8;
}

.action-btn:disabled {
  background: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
}

.action-btn.success {
  background: var(--success);
  color: white;
}

.error-msg {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--error);
  font-weight: 500;
}

.verification-section {
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: 6px;
  padding: 10px;
  margin-top: 8px;
}

.verification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.verification-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--gray-700);
}

.verification-timer {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
}

.verification-timer.warning {
  color: var(--error);
}

.verification-input-wrapper {
  margin-bottom: 8px;
}

.verification-input {
  width: 100%;
  height: 42px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 8px;
  border: 2px solid var(--gray-300);
  border-radius: 6px;
  color: var(--gray-800);
  transition: all 0.2s;
  padding: 0 12px;
  background: white;
}

.verification-input::placeholder {
  letter-spacing: 6px;
  color: var(--gray-300);
}

.verification-input:focus {
  border-color: var(--primary);
  background: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(91, 95, 207, 0.1);
}

.verification-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.text-btn {
  font-size: 11px;
  color: var(--gray-600);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  padding: 3px 6px;
  transition: all 0.2s;
  border-radius: 4px;
}

.text-btn:hover {
  background: var(--gray-200);
}

.text-btn.primary {
  color: var(--primary);
  font-weight: 600;
}

.text-btn.primary:hover {
  background: rgba(91, 95, 207, 0.1);
}

.separator {
  color: var(--gray-300);
  font-size: 11px;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  transform-origin: top;
}

.expand-enter-from,
.expand-leave-to {
  transform: scaleY(0.9);
  opacity: 0;
}

@media (max-width: 640px) {
  .verification-input {
    height: 40px;
    font-size: 18px;
    letter-spacing: 6px;
  }

  .action-btn {
    min-width: 50px;
    padding: 0 10px;
    font-size: 12px;
  }
}
</style>