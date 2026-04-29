<template>
  <div class="verification-container">
    <div class="input-group">
      <label class="input-label">
        이메일 주소
        <span class="required">*</span>
      </label>
      <div class="input-row">
        <div class="input-wrapper">
          <div class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
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
        </div>
        <button
            type="button"
            class="action-btn"
            :class="{ verified: verified, sent: verificationSent && !verified }"
            :disabled="!email || emailError || verified || disabled || sendingCode || verificationSent"
            @click="sendVerificationCode"
        >
          <div v-if="sendingCode" class="spinner-small"></div>
          <span v-else-if="verified">인증 완료</span>
          <span v-else-if="verificationSent">전송됨</span>
          <span v-else>인증번호 전송</span>
        </button>
      </div>
      <span v-if="emailError" class="error-msg">올바른 이메일 형식을 입력해주세요.</span>
    </div>

    <transition name="fade">
      <div v-if="codeSentSuccess" class="banner success">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>인증번호가 발송되었습니다.</span>
      </div>
    </transition>

    <transition name="fade">
      <span v-if="verificationError && !verificationSent" class="error-msg">{{ verificationError }}</span>
    </transition>

    <transition name="expand">
      <div v-if="verificationSent && !verified" class="verify-box">
        <div class="verify-header">
          <span class="verify-title">인증번호 입력</span>
          <span class="timer" :class="{ warning: timer < 60 }">
            {{ formatTimer(timer) }}
          </span>
        </div>
        <div class="verify-input-row">
          <input
              ref="verificationInput"
              type="text"
              maxlength="6"
              inputmode="numeric"
              class="code-input"
              placeholder="000000"
              :disabled="disabled"
              v-model="verificationCode"
              @input="handleVerificationInput"
              @paste="handlePaste"
          />
        </div>
        <div class="verify-footer">
          <button type="button" class="confirm-btn" :disabled="disabled || verificationCode.length !== 6 || verifyingCode" @click="verifyCode">
            <div v-if="verifyingCode" class="spinner-small"></div>
            <span>{{ verifyingCode ? '확인 중' : '인증 확인' }}</span>
          </button>
          <button
              type="button"
              class="resend-btn"
              :disabled="disabled || sendingCode || resendCooldown > 0"
              @click="sendVerificationCode"
          >
            {{ resendCooldown > 0 ? `재시도 ${resendCooldown}초` : '재시도' }}
          </button>
        </div>
        <span v-if="verificationError" class="error-msg text-center">{{ verificationError }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from 'vue'
import { authService } from '@/services/AuthService.js'

// 백엔드 정책 (sendVerificationCode 참조)
//  - Redis 코드 TTL: 5분
//  - 재발송 쿨다운: 60초
//  - 1시간 내 5회 발송 제한
const CODE_TTL_SECONDS = 300
const RESEND_COOLDOWN_SECONDS = 60

const props = defineProps({
  email: String,
  verified: Boolean,
  verificationToken: String,
  disabled: Boolean,
  // 'signup' | 'reset' — 백엔드 엔드포인트 분기 (회원가입 vs 비밀번호 재설정)
  mode: { type: String, default: 'signup' }
})

// mode 별 API 분기 — 두 흐름이 동일한 UX(60초 쿨다운, 5분 TTL, 5회 제한)이라 컴포넌트 재사용
const sendApi = (email) => props.mode === 'reset'
    ? authService.sendPasswordResetCode(email)
    : authService.sendVerificationCode(email)
const verifyApi = (email, code) => props.mode === 'reset'
    ? authService.verifyPasswordResetCode(email, code)
    : authService.verifyEmailCode(email, code)

const emit = defineEmits(['update:email', 'update:verified', 'update:verificationToken'])

const emailError = ref(false)
const verificationSent = ref(false)
const verificationError = ref('')
const verificationInput = ref(null)
const verificationCode = ref('')
const timer = ref(CODE_TTL_SECONDS)
const timerInterval = ref(null)
const sendingCode = ref(false)
const verifyingCode = ref(false)
const codeSentSuccess = ref(false)
const resendCooldown = ref(0)
const cooldownInterval = ref(null)

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (props.email) {
    emailError.value = !emailRegex.test(props.email)
  }
}

const startResendCooldown = (seconds = RESEND_COOLDOWN_SECONDS) => {
  resendCooldown.value = seconds
  if (cooldownInterval.value) clearInterval(cooldownInterval.value)
  cooldownInterval.value = setInterval(() => {
    if (resendCooldown.value > 0) resendCooldown.value--
    else clearInterval(cooldownInterval.value)
  }, 1000)
}

// 백엔드 UserErrorCode 메시지 매핑 (sendVerificationCode 흐름)
//  409 EMAIL_ALREADY_EXISTS, 429 SEND_COOLDOWN_NOT_EXPIRED / SEND_LIMIT_EXCEEDED
const mapSendError = (error) => {
  const status = error?.status
  const msg = error?.message || ''
  if (status === 409) return '이미 가입된 이메일입니다. 로그인해주세요.'
  if (status === 429 && msg.includes('횟수')) {
    // SEND_LIMIT_EXCEEDED: 1시간 락
    return '인증 코드 발송 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.'
  }
  if (status === 429) {
    // SEND_COOLDOWN_NOT_EXPIRED: 클라가 보통 먼저 막지만 클럭 드리프트 시 가능
    return '잠시 후 다시 시도해주세요. (60초 쿨다운)'
  }
  return msg || '인증 코드 발송 중 오류가 발생했습니다'
}

const sendVerificationCode = async () => {
  // 클라이언트 측 가드: 쿨다운 중이면 호출 안 함 (백엔드 60초 쿨다운과 일치)
  if (emailError.value || !props.email || sendingCode.value || resendCooldown.value > 0) return
  verificationError.value = ''
  sendingCode.value = true
  try {
    const response = await sendApi(props.email)
    if (response.success) {
      verificationSent.value = true
      codeSentSuccess.value = true
      setTimeout(() => { codeSentSuccess.value = false }, 3000)

      // Redis 코드 TTL과 동일 (5분)
      timer.value = CODE_TTL_SECONDS
      if (timerInterval.value) clearInterval(timerInterval.value)
      timerInterval.value = setInterval(() => {
        if (timer.value > 0) timer.value--
        else {
          clearInterval(timerInterval.value)
          verificationSent.value = false
          verificationError.value = '인증 시간이 만료되었습니다. 다시 발송해주세요.'
        }
      }, 1000)

      // 재발송 60초 쿨다운 시작
      startResendCooldown()

      setTimeout(() => { verificationInput.value?.focus() }, 100)
    }
  } catch (error) {
    verificationError.value = mapSendError(error)
    // SEND_LIMIT_EXCEEDED 시 클라이언트 쿨다운 길게 잡아 "재시도" 버튼 무력화
    // (정확한 잔여 시간은 모르지만 1시간 = 3600초로 보수적 설정 — 사용자가 페이지 떠날 때까지 막힘)
    if (error?.status === 429 && (error?.message || '').includes('횟수')) {
      startResendCooldown(3600)
    }
  } finally {
    sendingCode.value = false
  }
}

// 이메일이 바뀌면 발송 상태 리셋 — 다른 이메일로 다시 받으려면 상단 버튼이 다시 활성화돼야 함
watch(() => props.email, (newEmail, oldEmail) => {
  if (newEmail === oldEmail || props.verified) return
  verificationSent.value = false
  verificationCode.value = ''
  verificationError.value = ''
  if (timerInterval.value) clearInterval(timerInterval.value)
  if (cooldownInterval.value) clearInterval(cooldownInterval.value)
  resendCooldown.value = 0
})

const handlePaste = (event) => {
  const pastedData = event.clipboardData.getData('text').trim().replace(/\D/g, '')
  if (pastedData.length <= 6) verificationCode.value = pastedData
}

const handleVerificationInput = (event) => {
  verificationCode.value = event.target.value.replace(/\D/g, '')
}

// 백엔드 verifyCode 흐름의 에러를 분류:
//  - codeInvalidated: true 면 백엔드 측에서 code/attempt가 삭제되어 재발송이 필요한 상태
const classifyVerifyError = (error) => {
  const status = error?.status
  const msg = error?.message || ''
  if (status === 429 && msg.includes('시도 횟수')) {
    // VERIFY_ATTEMPT_EXCEEDED — 백엔드가 code도 같이 삭제함
    return { codeInvalidated: true, message: '인증 시도 횟수를 초과했습니다. 인증번호를 다시 발송해주세요.' }
  }
  if (status === 400 && msg.includes('만료')) {
    // VERIFICATION_CODE_EXPIRED
    return { codeInvalidated: true, message: '인증 코드가 만료되었습니다. 다시 발송해주세요.' }
  }
  // VERIFICATION_CODE_MISMATCH 등 — 코드 박스 유지하고 재시도 허용
  return { codeInvalidated: false, message: msg || '인증번호를 다시 확인해주세요.' }
}

const verifyCode = async () => {
  if (verificationCode.value.length !== 6 || verifyingCode.value) return
  verificationError.value = ''
  verifyingCode.value = true
  try {
    const response = await verifyApi(props.email, verificationCode.value)
    if (response.success && response.data) {
      emit('update:verified', true)
      emit('update:verificationToken', response.data)
      verificationSent.value = false
      clearInterval(timerInterval.value)
    }
  } catch (error) {
    const { codeInvalidated, message } = classifyVerifyError(error)
    verificationError.value = message
    verificationCode.value = ''
    // 백엔드가 코드를 삭제한 경우: verify-box를 닫아 사용자가 재발송 흐름으로 가도록
    if (codeInvalidated) {
      verificationSent.value = false
      if (timerInterval.value) clearInterval(timerInterval.value)
    }
  } finally {
    verifyingCode.value = false
  }
}

const formatTimer = (seconds) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
  if (cooldownInterval.value) clearInterval(cooldownInterval.value)
})
</script>

<style scoped>
.verification-container { width: 100%; margin-bottom: 20px; }

/* 레이아웃 */
.input-group { margin-bottom: 12px; }
.input-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #333D4B;
  margin-bottom: 8px;
  letter-spacing: -0.1px;
}
.required { color: #9333EA; margin-left: 2px; }
.input-row { display: flex; gap: 8px; }
.input-wrapper { position: relative; flex: 1; }

/* 입력창 */
input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  font-size: 14px;
  font-weight: 500;
  border: 1.5px solid #E5E8EB;
  border-radius: 10px;
  outline: none;
  transition: all 0.15s ease;
  color: #0A0E1A;
  background: #F7F8FA;
  font-family: inherit;
}
input::placeholder { color: #B0B8C1; font-weight: 400; }
input:focus { border-color: #9333EA; box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08); background: #fff; }
input:disabled { background-color: #F2F4F6; color: #B0B8C1; }
input.error { border-color: #EF4444; background: #FEF2F2; }
input.success { border-color: #16A34A; background-color: #F0FDF4; }

.input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #B0B8C1; }

/* 인증 버튼 */
.action-btn {
  padding: 0 18px;
  background-color: #0A0E1A;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
  font-family: inherit;
  letter-spacing: -0.1px;
}
.action-btn:hover:not(:disabled) { background: #1E293B; }
.action-btn:disabled { background-color: #F2F4F6; color: #B0B8C1; cursor: not-allowed; }
.action-btn.verified { background-color: #16A34A; color: #fff; cursor: default; }
/* 전송됨: 비활성이지만 시각적으로 "완료된 액션"임을 알림 */
.action-btn.sent:disabled { background-color: #F3E8FF; color: #9333EA; cursor: default; }

/* 인증 박스 */
.verify-box {
  margin-top: 12px;
  padding: 18px;
  background-color: #F7F8FA;
  border: 1.5px solid #E5E8EB;
  border-radius: 12px;
}
.verify-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.verify-title { font-size: 13px; font-weight: 700; color: #333D4B; letter-spacing: -0.1px; }
.timer { font-size: 13px; font-weight: 800; color: #9333EA; font-variant-numeric: tabular-nums; }
.timer.warning { color: #EF4444; }

.code-input {
  height: 48px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 6px;
  margin-bottom: 14px;
  padding: 0;
  background: #fff;
}

.verify-footer { display: flex; gap: 8px; }
.confirm-btn {
  flex: 2;
  padding: 12px;
  background-color: #9333EA;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
  transition: background 0.15s ease;
}
.confirm-btn:hover:not(:disabled) { background: #7C3AED; }
.confirm-btn:disabled { background: #E9D5FF; cursor: not-allowed; }
.resend-btn {
  flex: 1;
  padding: 12px;
  background-color: white;
  border: 1.5px solid #E5E8EB;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #4E5968;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.resend-btn:hover:not(:disabled) { border-color: #D1D6DB; background: #F7F8FA; }
.resend-btn:disabled { color: #B0B8C1; cursor: not-allowed; }

/* 알림 */
.banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 14px;
  background-color: #DCFCE7;
  border: 1px solid #BBF7D0;
  border-radius: 10px;
  color: #16A34A;
  font-size: 12px;
  font-weight: 600;
}
.error-msg { font-size: 12px; font-weight: 600; color: #EF4444; margin-top: 6px; display: block; }
.text-center { text-align: center; }

/* 애니메이션 */
.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.expand-enter-active, .expand-leave-active { transition: all 0.3s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-10px); }
</style>