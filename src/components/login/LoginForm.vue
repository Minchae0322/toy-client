<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <transition name="slide">
      <div v-if="sessionExpired" class="banner warning">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>세션이 만료되었습니다. 다시 로그인해주세요.</span>
      </div>
    </transition>

    <div class="input-group">
      <label class="input-label">이메일 주소</label>
      <div class="input-wrapper">
        <div class="input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <input
            type="email"
            v-model="form.email"
            placeholder="name@example.com"
            required
            :disabled="loading"
            :class="{ error: form.emailError }"
            @blur="validateEmail"
        />
      </div>
      <span v-if="form.emailError" class="error-msg">유효한 이메일을 입력하세요.</span>
    </div>

    <div class="input-group">
      <div class="label-row">
        <label class="input-label">비밀번호</label>
        <button type="button" class="link-btn" @click="$emit('forgot-password')">비밀번호 찾기</button>
      </div>
      <div class="input-wrapper">
        <div class="input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <input
            :type="form.showPassword ? 'text' : 'password'"
            v-model="form.password"
            placeholder="••••••••"
            required
            :disabled="loading"
        />
        <button type="button" class="eye-btn" @click="form.showPassword = !form.showPassword">
          <span v-if="!form.showPassword">표시</span>
          <span v-else>숨김</span>
        </button>
      </div>
    </div>

    <label class="remember-id">
      <input
          type="checkbox"
          v-model="form.rememberEmail"
          :disabled="loading"
      />
      <span class="remember-id-text">아이디 저장</span>
    </label>

    <button type="submit" class="submit-btn" :disabled="loading || !canSubmit">
      <div v-if="loading" class="spinner"></div>
      <span>{{ loading ? '진행 중' : '로그인' }}</span>
    </button>

    <transition name="shake">
      <div v-if="displayError" class="error-text">
        {{ displayError }}
      </div>
    </transition>

    <div class="social-area">
      <div class="divider"><span>또는 간편 로그인</span></div>
      <div class="social-grid">
        <!-- Apple은 네이티브에서만 표시 (App Store 가이드라인 4.8) -->
        <button v-if="isNative" type="button" class="social-btn apple" @click="$emit('social-login', 'apple')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12-1.103.42-2.31 1.05-3.097.85-.99 2.27-1.7 3.114-1.553zM21.36 17.04c-.595 1.36-.86 1.96-1.62 3.16-1.06 1.67-2.55 3.74-4.4 3.76-1.65.02-2.07-1.07-4.31-1.06-2.24.01-2.7 1.08-4.36 1.06-1.85-.02-3.27-1.9-4.32-3.56C-.6 16.83-.92 9.06 2.97 5.59c1.27-1.13 2.97-1.78 4.7-1.78 1.92 0 3.13 1.05 4.71 1.05 1.54 0 2.47-1.05 4.7-1.05 1.55 0 3.2.84 4.36 2.3-3.84 2.1-3.21 7.58.92 8.93z"/>
          </svg>
          Apple로 시작하기
        </button>
        <button type="button" class="social-btn" @click="$emit('social-login', 'google')">
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="G" />
          Google
        </button>
        <button type="button" class="social-btn naver" @click="$emit('social-login', 'naver')">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.5 10.5L6.3 0H0v20h6.5V9.5L13.7 20H20V0h-6.5z"/>
          </svg>
          Naver
        </button>
        <button v-if="!isNative" type="button" class="social-btn github" @click="$emit('social-login', 'github')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          GitHub
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Capacitor } from '@capacitor/core'

const REMEMBERED_EMAIL_KEY = 'login_remembered_email'
const isNative = Capacitor.isNativePlatform()

const props = defineProps({
  sessionExpired: Boolean,
  loading: Boolean,
  errorMessage: String
})

const emit = defineEmits(['submit', 'social-login', 'forgot-password'])

const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) || ''

const form = ref({
  email: savedEmail,
  password: '',
  showPassword: false,
  emailError: false,
  rememberEmail: !!savedEmail
})

const displayError = computed(() => props.errorMessage)
const canSubmit = computed(() => form.value.email && form.value.password && !form.value.emailError)

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  form.value.emailError = form.value.email ? !emailRegex.test(form.value.email) : false
}

// 토글 끄면 저장된 이메일 즉시 제거
watch(() => form.value.rememberEmail, (v) => {
  if (!v) localStorage.removeItem(REMEMBERED_EMAIL_KEY)
})

const handleSubmit = () => {
  if (!canSubmit.value) return
  if (form.value.rememberEmail) {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, form.value.email)
  } else {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY)
  }
  emit('submit', { email: form.value.email, password: form.value.password })
}
</script>

<style scoped>
/* 배너/알림 */
.banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background-color: #FEF9C3;
  border: 1px solid #FDE68A;
  border-radius: 10px;
  color: #92400E;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
  letter-spacing: -0.1px;
}

/* 입력창 공통 */
.input-group { margin-bottom: 20px; }
.label-row { display: flex; justify-content: space-between; align-items: center; }
.input-label {
  font-size: 13px;
  font-weight: 700;
  color: #333D4B;
  margin-bottom: 8px;
  display: block;
  letter-spacing: -0.1px;
}
.link-btn {
  font-size: 12px;
  color: #8B95A1;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s;
}
.link-btn:hover { color: #6B7684; }

.input-wrapper { position: relative; }
input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  font-size: 14px;
  font-weight: 500;
  border: 1.5px solid #E5E8EB;
  border-radius: 10px;
  transition: all 0.15s ease;
  outline: none;
  color: #0A0E1A;
  background: #F7F8FA;
  font-family: inherit;
}
input::placeholder { color: #B0B8C1; font-weight: 400; }
input:focus {
  border-color: #9333EA;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
  background: #fff;
}
input.error { border-color: #EF4444; background: #FEF2F2; }

.input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #B0B8C1; }
.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  font-size: 11px;
  font-weight: 700;
  color: #8B95A1;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.15s;
  font-family: inherit;
}
.eye-btn:hover { background: #F2F4F6; color: #4E5968; }
.error-msg { color: #EF4444; font-size: 12px; font-weight: 600; margin-top: 6px; display: block; }

/* 아이디 저장 토글 */
.remember-id {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: -4px 0 18px;
  cursor: pointer;
  user-select: none;
}
.remember-id input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #9333EA;
  flex-shrink: 0;
  margin: 0;
}
.remember-id-text {
  font-size: 13px;
  font-weight: 600;
  color: #4E5968;
  letter-spacing: -0.1px;
}
.remember-id:hover .remember-id-text { color: #0A0E1A; }

/* 제출 버튼 */
.submit-btn {
  width: 100%;
  padding: 14px;
  background: #0A0E1A;
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
.submit-btn:hover:not(:disabled) { background: #1E293B; }
.submit-btn:disabled {
  background: #F2F4F6;
  color: #B0B8C1;
  cursor: not-allowed;
}

.error-text {
  text-align: center;
  color: #EF4444;
  font-size: 13px;
  font-weight: 600;
  margin-top: 16px;
}

/* 소셜 */
.social-area { margin-top: 28px; }
.divider { display: flex; align-items: center; margin-bottom: 18px; }
.divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: #E5E8EB; }
.divider span {
  padding: 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: #8B95A1;
  white-space: nowrap;
}

.social-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.social-grid:has(.social-btn.apple) { grid-template-columns: 1fr; gap: 10px; }
.social-grid:has(.social-btn.apple) .social-btn { padding: 13px 12px; font-size: 14px; }
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 8px;
  border: 1.5px solid #E5E8EB;
  border-radius: 10px;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #333D4B;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.social-btn:hover { border-color: #D1D6DB; background: #F7F8FA; }
.social-btn img { width: 16px; }
.social-btn.naver {
  background: #03C75A;
  border-color: #03C75A;
  color: white;
}
.social-btn.naver:hover { background: #02b351; }
.social-btn.github {
  background: #24292E;
  border-color: #24292E;
  color: white;
}
.social-btn.github:hover { background: #1b1f23; }
.social-btn.apple {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}
.social-btn.apple:hover { background: #1a1a1a; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>