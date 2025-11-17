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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
          {{ verified ? '인증완료' : '인증번호 발송' }}
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
          <span class="verification-title">인증번호 입력</span>
          <span class="verification-timer" :class="{ warning: timer < 60 }">
            {{ formatTimer(timer) }}
          </span>
        </div>
        <div class="verification-inputs">
          <input
              v-for="(_, index) in 6"
              :key="index"
              :ref="el => verificationInputs[index] = el"
              type="text"
              maxlength="1"
              inputmode="numeric"
              pattern="[0-9]"
              class="code-input"
              :disabled="disabled"
              @input="handleInput(index, $event)"
              @keydown="handleKeydown(index, $event)"
          />
        </div>
        <div class="verification-footer">
          <button type="button" class="text-btn" :disabled="disabled" @click="verifyCode">
            인증하기
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
const verificationInputs = ref([])
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
    } else {
      throw new Error(response.message || '인증 코드 발송에 실패했습니다')
    }
  } catch (error) {
    console.error('❌ 인증 코드 발송 실패:', error)
    verificationError.value = error.message || '인증 코드 발송 중 오류가 발생했습니다'
  }
}

const handleInput = (index, event) => {
  const value = event.target.value

  if (value && !/^\d$/.test(value)) {
    event.target.value = ''
    return
  }

  if (value && index < 5) {
    verificationInputs.value[index + 1]?.focus()
  }
}

const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !event.target.value && index > 0) {
    verificationInputs.value[index - 1]?.focus()
  }
}

const verifyCode = async () => {
  const code = verificationInputs.value
  .map(input => input?.value || '')
  .join('')

  if (code.length !== 6) {
    verificationError.value = '6자리 인증 코드를 입력해주세요'
    return
  }

  verificationError.value = ''

  try {
    const response = await authService.verifyEmailCode(props.email, code)

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

    verificationInputs.value.forEach(input => {
      if (input) input.value = ''
    })
    verificationInputs.value[0]?.focus()
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
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 8px;
}

.required {
  color: var(--error);
  margin-left: 2px;
}

.input-with-action {
  display: flex;
  gap: 8px;
}

.input-with-action .input-wrapper {
  flex: 1;
}

.input-wrapper {
  position: relative;
}

input[type="email"] {
  width: 100%;
  padding: 11px 40px;
  font-size: 14px;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  color: var(--gray-800);
  background: white;
  transition: all 0.2s;
  outline: none;
}

input::placeholder {
  color: var(--gray-400);
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
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  pointer-events: none;
}

.action-btn {
  padding: 0 16px;
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.action-btn:disabled {
  background: var(--gray-100);
  color: var(--gray-400);
  border-color: var(--gray-200);
  cursor: not-allowed;
}

.action-btn.success {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.error-msg {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--error);
  font-weight: 500;
}

.verification-section {
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  padding: 20px;
  margin-top: 12px;
}

.verification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.verification-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
}

.verification-timer {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

.verification-timer.warning {
  color: var(--error);
}

.verification-inputs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.code-input {
  flex: 1;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  color: var(--gray-800);
  transition: all 0.2s;
  padding: 0;
}

.code-input:focus {
  border-color: var(--primary);
  background: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(91, 95, 207, 0.1);
}

.verification-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.text-btn {
  font-size: 12px;
  color: var(--primary);
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

.separator {
  color: var(--gray-300);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  transform: scaleY(0.95);
  opacity: 0;
}

@media (max-width: 640px) {
  .verification-inputs {
    gap: 4px;
  }

  .code-input {
    height: 44px;
    font-size: 16px;
  }
}
</style>