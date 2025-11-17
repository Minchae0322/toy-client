<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <!-- 로고 영역 -->
      <div class="logo-area">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#gradient)"/>
            <path d="M24 14L32 20V28L24 34L16 28V20L24 14Z" fill="white"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stop-color="#5B5FCF"/>
                <stop offset="100%" stop-color="#3F43A4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="brand-name">SERVICE</h1>
      </div>

      <!-- 탭 컨테이너 -->
      <div class="tab-container">
        <div class="tab-header">
          <button
              class="tab-btn"
              :class="{ active: activeTab === 'login' }"
              @click="switchTab('login')"
          >
            로그인
          </button>
          <button
              class="tab-btn"
              :class="{ active: activeTab === 'register' }"
              @click="switchTab('register')"
          >
            회원가입
          </button>
        </div>

        <!-- 탭 콘텐츠 영역 -->
        <div class="tab-content">
          <!-- 로그인 폼 -->
          <transition name="fade" mode="out-in">
            <form v-if="activeTab === 'login'" key="login" @submit.prevent="handleLogin" class="auth-form">
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
                      v-model="loginForm.email"
                      placeholder="name@example.com"
                      required
                      autocomplete="email"
                      :disabled="loading"
                      :class="{ error: loginForm.emailError }"
                      @blur="validateLoginEmail"
                  />
                  <div class="input-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M3 5l7 5 7-5" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </div>
                </div>
                <span v-if="loginForm.emailError" class="error-msg">
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
                  <button type="button" class="text-btn" @click="handleForgotPassword">
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
                <div class="input-wrapper">
                  <input
                      :type="loginForm.showPassword ? 'text' : 'password'"
                      v-model="loginForm.password"
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
                      @click="loginForm.showPassword = !loginForm.showPassword"
                      tabindex="-1"
                  >
                    <svg v-if="!loginForm.showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
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
                  <input type="checkbox" v-model="loginForm.rememberMe" />
                  <span class="checkbox-box">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </span>
                  <span>로그인 상태 유지</span>
                </label>
              </div>

              <!-- 로그인 버튼 -->
              <button type="submit" class="submit-btn primary" :disabled="loading || !canLogin">
                <svg v-if="loading" class="spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="40">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span>{{ loading ? '로그인 중...' : '로그인' }}</span>
              </button>

              <!-- 에러 메시지 -->
              <transition name="shake">
                <div v-if="loginForm.errorMessage" class="alert-box error">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z"/>
                  </svg>
                  {{ loginForm.errorMessage }}
                </div>
              </transition>

              <!-- 소셜 로그인 섹션 -->
              <div class="social-section">
                <div class="divider-text">간편 로그인</div>
                <div class="social-buttons">
                  <button type="button" class="social-btn" @click="handleSocialLogin('google')">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button type="button" class="social-btn" @click="handleSocialLogin('github')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    GitHub
                  </button>
                  <button type="button" class="social-btn kakao" @click="handleSocialLogin('kakao')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                    </svg>
                    Kakao
                  </button>
                </div>
              </div>
            </form>

            <!-- 회원가입 폼 -->
            <form v-else key="register" @submit.prevent="handleRegister" class="auth-form">
              <!-- 이메일 입력 & 인증 -->
              <div class="input-group">
                <label class="input-label">
                  이메일 주소
                  <span class="required">*</span>
                </label>
                <div class="input-with-action">
                  <div class="input-wrapper">
                    <input
                        type="email"
                        v-model="registerForm.email"
                        placeholder="name@example.com"
                        required
                        :disabled="loading || registerForm.emailVerified"
                        :class="{ error: registerForm.emailError, success: registerForm.emailVerified }"
                        @blur="validateRegisterEmail"
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
                      :class="{ success: registerForm.emailVerified }"
                      :disabled="!registerForm.email || registerForm.emailError || registerForm.emailVerified || loading"
                      @click="sendVerificationCode"
                  >
                    {{ registerForm.emailVerified ? '인증완료' : '인증번호 발송' }}
                  </button>
                </div>
                <span v-if="registerForm.emailError" class="error-msg">
                  올바른 이메일 형식을 입력해주세요
                </span>
              </div>

              <!-- 인증번호 입력 영역 -->
              <transition name="expand">
                <div v-if="registerForm.verificationSent && !registerForm.emailVerified" class="verification-section">
                  <div class="verification-header">
                    <span class="verification-title">인증번호 입력</span>
                    <span class="verification-timer" :class="{ warning: verificationTimer < 60 }">
                      {{ formatTimer(verificationTimer) }}
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
                        :disabled="loading"
                        @input="handleVerificationInput(index, $event)"
                        @keydown="handleVerificationKeydown(index, $event)"
                    />
                  </div>
                  <div class="verification-footer">
                    <button type="button" class="text-btn" :disabled="loading" @click="verifyCode">
                      인증하기
                    </button>
                    <span class="separator">·</span>
                    <button type="button" class="text-btn" :disabled="loading" @click="sendVerificationCode">
                      재발송
                    </button>
                  </div>
                </div>
              </transition>

              <!-- 인증 성공 메시지 -->
              <transition name="slide">
                <div v-if="registerForm.emailVerified" class="notification success">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                  이메일 인증이 완료되었습니다
                </div>
              </transition>

              <!-- 비밀번호 입력 -->
              <div class="input-group">
                <label class="input-label">
                  비밀번호
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                      :type="registerForm.showPassword ? 'text' : 'password'"
                      v-model="registerForm.password"
                      placeholder="8자 이상, 영문/숫자/특수문자"
                      required
                      :disabled="loading"
                      @input="checkPasswordStrength"
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
                      @click="registerForm.showPassword = !registerForm.showPassword"
                      tabindex="-1"
                  >
                    <svg v-if="!registerForm.showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823"/>
                    </svg>
                  </button>
                </div>

                <!-- 비밀번호 강도 표시 -->
                <div v-if="registerForm.password" class="password-strength-container">
                  <div class="strength-bars">
                    <div class="strength-bar" :class="{ active: passwordStrength >= 1 }"></div>
                    <div class="strength-bar" :class="{ active: passwordStrength >= 2 }"></div>
                    <div class="strength-bar" :class="{ active: passwordStrength >= 3 }"></div>
                  </div>
                  <span class="strength-text" :class="passwordStrengthClass">
                    {{ passwordStrengthText }}
                  </span>
                </div>

                <!-- 비밀번호 체크리스트 -->
                <div class="checklist">
                  <div class="check-item" :class="{ checked: passwordChecks.length }">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="8" cy="8" r="8" />
                      <path d="M5 8L7 10L11 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>8자 이상</span>
                  </div>
                  <div class="check-item" :class="{ checked: passwordChecks.number }">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="8" cy="8" r="8" />
                      <path d="M5 8L7 10L11 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>숫자 포함</span>
                  </div>
                  <div class="check-item" :class="{ checked: passwordChecks.special }">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="8" cy="8" r="8" />
                      <path d="M5 8L7 10L11 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>특수문자 포함</span>
                  </div>
                </div>
              </div>

              <!-- 비밀번호 확인 -->
              <div class="input-group">
                <label class="input-label">
                  비밀번호 확인
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                      :type="registerForm.showPassword ? 'text' : 'password'"
                      v-model="registerForm.passwordConfirm"
                      placeholder="비밀번호를 다시 입력하세요"
                      required
                      :disabled="loading"
                      :class="{ error: registerForm.passwordError && registerForm.passwordConfirm }"
                      @input="checkPasswordMatch"
                      @blur="checkPasswordMatch"
                  />
                  <div class="input-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="5" y="9" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M10 13v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <span v-if="registerForm.passwordError && registerForm.passwordConfirm" class="error-msg">
                  비밀번호가 일치하지 않습니다
                </span>
              </div>

              <!-- 약관 동의 -->
              <div class="terms-section">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="registerForm.agreeTerms" />
                  <span class="checkbox-box">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </span>
                  <span>
                    <a href="#" class="link" @click.prevent>이용약관</a> 및
                    <a href="#" class="link" @click.prevent>개인정보처리방침</a>에 동의합니다
                  </span>
                </label>
              </div>

              <!-- 회원가입 버튼 -->
              <button type="submit" class="submit-btn primary" :disabled="loading || !canRegister">
                <svg v-if="loading" class="spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="40">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span>{{ loading ? '가입 중...' : '회원가입' }}</span>
              </button>

              <!-- 에러 메시지 -->
              <transition name="shake">
                <div v-if="registerForm.errorMessage" class="alert-box error">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z"/>
                  </svg>
                  {{ registerForm.errorMessage }}
                </div>
              </transition>
            </form>
          </transition>
        </div>
      </div>

      <!-- 개발자 도구 -->
      <div v-if="isDev" class="dev-panel">
        <button @click="debugAuth" class="dev-button">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          인증 상태
        </button>
        <button @click="clearAuth" class="dev-button">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"/>
          </svg>
          초기화
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import * as authUtils from '@/utils/auth.js'
import { authService } from '@/services/AuthService.js'

const router = useRouter()
const route = useRoute()
const { login, isLoggedIn } = useAuth()

const activeTab = ref('login')

const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false,
  showPassword: false,
  emailError: false,
  errorMessage: ''
})

const registerForm = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  showPassword: false,
  emailError: false,
  passwordError: false,
  emailVerified: false,
  verificationSent: false,
  verificationToken: '',
  agreeTerms: false,
  errorMessage: ''
})

const passwordChecks = ref({
  length: false,
  number: false,
  special: false
})

const verificationInputs = ref([])
const verificationTimer = ref(180)
const timerInterval = ref(null)
const loading = ref(false)

const redirectPath = computed(() => route.query.redirect || '/home')
const sessionExpired = computed(() => route.query.reason === 'session_expired')
const isDev = computed(() => import.meta.env.DEV)

const canLogin = computed(() =>
    loginForm.value.email &&
    loginForm.value.password &&
    !loginForm.value.emailError
)

const canRegister = computed(() =>
    registerForm.value.email &&
    registerForm.value.password &&
    registerForm.value.passwordConfirm &&
    registerForm.value.emailVerified &&
    !registerForm.value.emailError &&
    !registerForm.value.passwordError &&
    registerForm.value.agreeTerms &&
    passwordChecks.value.length &&
    passwordChecks.value.number &&
    passwordChecks.value.special
)

const passwordStrength = computed(() => {
  return Object.values(passwordChecks.value).filter(Boolean).length
})

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value === 0) return ''
  if (passwordStrength.value === 1) return 'weak'
  if (passwordStrength.value === 2) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  if (!registerForm.value.password) return ''
  if (passwordStrength.value === 1) return '약함'
  if (passwordStrength.value === 2) return '보통'
  if (passwordStrength.value === 3) return '강함'
  return ''
})

const switchTab = (tab) => {
  activeTab.value = tab
  loginForm.value.errorMessage = ''
  registerForm.value.errorMessage = ''
}

const validateLoginEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (loginForm.value.email) {
    loginForm.value.emailError = !emailRegex.test(loginForm.value.email)
  }
}

const validateRegisterEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (registerForm.value.email) {
    registerForm.value.emailError = !emailRegex.test(registerForm.value.email)
  }
}

const checkPasswordStrength = () => {
  const password = registerForm.value.password
  passwordChecks.value.length = password.length >= 8
  passwordChecks.value.number = /\d/.test(password)
  passwordChecks.value.special = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(password)

  if (registerForm.value.passwordConfirm) {
    checkPasswordMatch()
  }
}

const checkPasswordMatch = () => {
  if (registerForm.value.passwordConfirm) {
    registerForm.value.passwordError =
        registerForm.value.password !== registerForm.value.passwordConfirm
  }
}

const sendVerificationCode = async () => {
  if (registerForm.value.emailError || !registerForm.value.email) return

  loading.value = true
  registerForm.value.errorMessage = ''

  try {
    const response = await authService.sendVerificationCode(registerForm.value.email)

    if (response.success) {
      console.log('✅ 인증번호 발송 성공')
      registerForm.value.verificationSent = true

      verificationTimer.value = 180
      if (timerInterval.value) clearInterval(timerInterval.value)
      timerInterval.value = setInterval(() => {
        if (verificationTimer.value > 0) {
          verificationTimer.value--
        } else {
          clearInterval(timerInterval.value)
          registerForm.value.verificationSent = false
          registerForm.value.errorMessage = '인증 시간이 만료되었습니다. 다시 시도해주세요.'
        }
      }, 1000)
    } else {
      throw new Error(response.message || '인증 코드 발송에 실패했습니다')
    }
  } catch (error) {
    console.error('❌ 인증 코드 발송 실패:', error)
    registerForm.value.errorMessage = error.message || '인증 코드 발송 중 오류가 발생했습니다'
  } finally {
    loading.value = false
  }
}

const handleVerificationInput = (index, event) => {
  const value = event.target.value

  if (value && !/^\d$/.test(value)) {
    event.target.value = ''
    return
  }

  if (value && index < 5) {
    verificationInputs.value[index + 1]?.focus()
  }
}

const handleVerificationKeydown = (index, event) => {
  if (event.key === 'Backspace' && !event.target.value && index > 0) {
    verificationInputs.value[index - 1]?.focus()
  }
}

const verifyCode = async () => {
  const code = verificationInputs.value
  .map(input => input?.value || '')
  .join('')

  if (code.length !== 6) {
    registerForm.value.errorMessage = '6자리 인증 코드를 입력해주세요'
    return
  }

  loading.value = true
  registerForm.value.errorMessage = ''

  try {
    const response = await authService.verifyEmailCode(registerForm.value.email, code)

    if (response.success && response.data) {
      console.log('✅ 이메일 인증 성공')
      registerForm.value.emailVerified = true
      registerForm.value.verificationToken = response.data
      registerForm.value.verificationSent = false
      clearInterval(timerInterval.value)
    } else {
      throw new Error(response.message || '인증 코드가 올바르지 않습니다')
    }
  } catch (error) {
    console.error('❌ 인증 코드 검증 실패:', error)
    registerForm.value.errorMessage = error.message || '인증 코드 확인 중 오류가 발생했습니다'

    verificationInputs.value.forEach(input => {
      if (input) input.value = ''
    })
    verificationInputs.value[0]?.focus()
  } finally {
    loading.value = false
  }
}

const formatTimer = (seconds) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const handleForgotPassword = () => {
  console.log('비밀번호 찾기')
}

const handleLogin = async () => {
  if (loading.value || !canLogin.value) return

  loading.value = true
  loginForm.value.errorMessage = ''

  try {
    const response = await authService.login({
      email: loginForm.value.email,
      password: loginForm.value.password
    })

    const { accessToken, refreshToken, user } = response.data

    if (!accessToken) {
      throw new Error('액세스 토큰을 받지 못했습니다')
    }

    const userInfo = user || {
      id: Date.now(),
      email: loginForm.value.email,
      nickname: loginForm.value.email.split('@')[0],
      role: 'USER',
      profileImage: null
    }

    login({ accessToken, refreshToken }, userInfo)
    await router.push(redirectPath.value)

  } catch (error) {
    console.error('로그인 오류:', error)

    if (error.response?.status === 401) {
      loginForm.value.errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다'
    } else if (error.response?.status === 403) {
      loginForm.value.errorMessage = '계정이 비활성화되었습니다'
    } else {
      loginForm.value.errorMessage = '로그인 중 오류가 발생했습니다'
    }
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (loading.value || !canRegister.value) return

  loading.value = true
  registerForm.value.errorMessage = ''

  try {
    const response = await authService.signup({
      email: registerForm.value.email,
      password: registerForm.value.password,
      verificationToken: registerForm.value.verificationToken
    })

    if (response.success) {
      console.log('✅ 회원가입 성공:', response.data)
      alert('회원가입이 완료되었습니다. 로그인해주세요.')

      switchTab('login')
      loginForm.value.email = registerForm.value.email

      registerForm.value = {
        email: '',
        password: '',
        passwordConfirm: '',
        showPassword: false,
        emailError: false,
        passwordError: false,
        emailVerified: false,
        verificationSent: false,
        verificationToken: '',
        agreeTerms: false,
        errorMessage: ''
      }
    } else {
      throw new Error(response.message || '회원가입에 실패했습니다')
    }

  } catch (error) {
    console.error('회원가입 오류:', error)

    if (error.response?.status === 409) {
      registerForm.value.errorMessage = '이미 사용중인 이메일입니다'
    } else if (error.response?.status === 400) {
      registerForm.value.errorMessage = error.response?.data?.message || '입력 정보를 확인해주세요'
    } else {
      registerForm.value.errorMessage = error.message || '회원가입 중 오류가 발생했습니다'
    }
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = (provider) => {
  if (loading.value) return

  const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8081'
  const redirectUrl = `${AUTH_BASE_URL}/api/oauth2/authorization/${provider}`

  sessionStorage.setItem('oauth_redirect', redirectPath.value)
  window.location.href = redirectUrl
}

const debugAuth = () => {
  authUtils.debugAuthStatus()
}

const clearAuth = () => {
  if (confirm('인증 정보를 초기화하시겠습니까?')) {
    authUtils.clearAllAuthData()
    window.location.reload()
  }
}

onMounted(async () => {
  const hasValidTokens = () => {
    const accessToken = authUtils.getAccessToken()
    const refreshToken = authUtils.getRefreshToken()

    if (!accessToken || !refreshToken) return false
    return !authUtils.isTokenExpired(refreshToken)
  }

  if (hasValidTokens()) {
    try {
      await router.replace(redirectPath.value)
    } catch (error) {
      console.warn('리다이렉트 실패:', error)
    }
  }
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style scoped>
:root {
  --primary: #5B5FCF;
  --primary-hover: #4A4EBF;
  --primary-light: #F0F0FF;
  --primary-dark: #3F43A4;

  --success: #10B981;
  --success-light: #D1FAE5;
  --warning: #F59E0B;
  --warning-light: #FEF3C7;
  --error: #EF4444;
  --error-light: #FEE2E2;

  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;

  --border: #D1D5DB;
  --border-focus: #5B5FCF;
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  padding: 60px 40px;
}

.auth-container {
  width: 100%;
  max-width: 520px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.logo-area {
  padding: 48px 48px 40px;
  text-align: center;
  border-bottom: 1px solid var(--gray-200);
}

.logo {
  display: inline-flex;
  margin-bottom: 20px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-800);
  letter-spacing: -0.02em;
}

.tab-container {
  background: white;
}

.tab-header {
  display: flex;
  background: var(--gray-50);
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  border-radius: 6px;
}

.tab-btn:hover {
  color: var(--gray-900);
  background: rgba(255, 255, 255, 0.5);
}

.tab-btn.active {
  color: var(--gray-900);
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.tab-content {
  padding: 32px;
}

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
  background: var(--warning-light);
  border-color: #FCD34D;
  color: #92400E;
}

.notification.success {
  background: var(--success-light);
  border-color: #6EE7B7;
  color: #065F46;
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
  color: var(--gray-700);
  margin-bottom: 8px;
}

.required {
  color: var(--error);
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

.input-wrapper {
  position: relative;
}

input[type="email"],
input[type="password"],
input[type="text"]:not(.code-input) {
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
  background: white;
}

input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

input.success {
  border-color: var(--success);
  background: white;
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

.toggle-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: var(--gray-600);
}

.error-msg {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--error);
  font-weight: 500;
}

.input-with-action {
  display: flex;
  gap: 8px;
}

.input-with-action .input-wrapper {
  flex: 1;
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

.verification-section {
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
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

.separator {
  color: var(--gray-300);
}

.password-strength-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  margin-bottom: 10px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  flex: 1;
  height: 3px;
  background: var(--gray-200);
  border-radius: 2px;
  transition: all 0.3s;
}

.strength-bar.active:nth-child(1) { background: var(--error); }
.strength-bar.active:nth-child(2) { background: var(--warning); }
.strength-bar.active:nth-child(3) { background: var(--success); }

.strength-text {
  font-size: 11px;
  font-weight: 600;
  min-width: 36px;
}

.strength-text.weak { color: var(--error); }
.strength-text.medium { color: var(--warning); }
.strength-text.strong { color: var(--success); }

.checklist {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  margin-top: 10px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--gray-500);
  transition: color 0.2s;
}

.check-item svg {
  fill: var(--gray-300);
  transition: fill 0.2s;
}

.check-item.checked {
  color: var(--success);
}

.check-item.checked svg {
  fill: var(--success);
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
  color: var(--gray-700);
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--gray-300);
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
  background: var(--primary);
  border-color: var(--primary);
}

.checkbox-label input:checked ~ .checkbox-box svg {
  opacity: 1;
  transform: scale(1);
}

.checkbox-label:hover .checkbox-box {
  border-color: var(--primary);
}

.terms-section {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: 8px;
}

.link {
  color: var(--gray-900);
  text-decoration: underline;
  font-weight: 500;
}

.link:hover {
  opacity: 0.7;
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
  background: var(--primary);
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.submit-btn.primary:hover:not(:disabled) {
  background: var(--primary-hover);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.submit-btn.primary:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: var(--gray-300);
  color: var(--gray-500);
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
  background: var(--error-light);
  color: #991B1B;
  border: 2px solid #FCA5A5;
}

.social-section {
  margin-top: 28px;
  padding-top: 28px;
  border-top: 1px solid var(--gray-200);
}

.divider-text {
  text-align: center;
  font-size: 12px;
  color: var(--gray-500);
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
  border: 2px solid var(--gray-300);
  background: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.social-btn:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
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

.dev-panel {
  padding: 16px 32px;
  background: white;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 8px;
}

.dev-button {
  flex: 1;
  padding: 8px 12px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.dev-button:hover {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
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

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  transform: scaleY(0.95);
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
  .auth-wrapper {
    padding: 20px 16px;
  }

  .tab-content {
    padding: 24px 20px;
  }

  .social-buttons {
    flex-direction: column;
  }

  .checklist {
    flex-direction: column;
    gap: 8px;
  }

  .verification-inputs {
    gap: 4px;
  }

  .code-input {
    height: 44px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .auth-wrapper {
    padding: 0;
    align-items: stretch;
  }

  .auth-container {
    max-width: 100%;
    border: none;
    border-radius: 0;
    min-height: 100vh;
  }

  .logo-area {
    padding: 32px 20px 28px;
  }

  .tab-content {
    padding: 20px 16px;
  }
}
</style>