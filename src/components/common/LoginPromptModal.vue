<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { useLoginPrompt } from '@/composables/useLoginPrompt'

const { state, closeLoginPrompt } = useLoginPrompt()
const route = useRoute()
const router = useRouter()

const isNative = Capacitor.isNativePlatform()
const headline = computed(() => state.message || '로그인하고 더 많은 기능을 이용해보세요')

const startSocialLogin = (provider) => {
  try {
    sessionStorage.setItem('oauth_provider', provider)
    sessionStorage.setItem('oauth_redirect', route.fullPath || '/feed')
  } catch {}
  closeLoginPrompt(false)

  // 네이티브 Apple/Google → OAuth 콜백 화면 진행 UI 재사용
  if (isNative && (provider === 'apple' || provider === 'google')) {
    router.push({ path: '/oauth/callback', query: { native: '1', provider } })
    return
  }

  const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL
  window.location.href = `${authBaseUrl}/oauth2/authorization/${provider}`
}

const goToEmailLogin = () => {
  const redirect = route.fullPath || '/feed'
  closeLoginPrompt(false)
  router.push({ name: 'Login', query: { redirect } })
}

const handleClose = () => closeLoginPrompt(false)
const handleOverlayClick = () => closeLoginPrompt(false)
</script>

<template>
  <Teleport to="body">
    <Transition name="login-prompt">
      <div v-if="state.visible" class="lp-overlay" @click.self="handleOverlayClick">
        <div class="lp-container" role="dialog" aria-modal="true" aria-labelledby="lp-title">
          <button class="lp-close" type="button" @click="handleClose" aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div class="lp-logo">
            <img src="/images/yogodde02.png" alt="요거뜨" />
          </div>

          <h2 id="lp-title" class="lp-title">{{ headline }}</h2>
          <p class="lp-sub">3초 만에 시작하고 좋아요·댓글·팔로우까지 모두 즐겨보세요</p>

          <div class="lp-social">
            <button type="button" class="lp-btn lp-btn--google" @click="startSocialLogin('google')">
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="" class="lp-icon-img" />
              <span>Google로 계속하기</span>
            </button>
            <button type="button" class="lp-btn lp-btn--naver" @click="startSocialLogin('naver')">
              <span class="lp-icon-svg">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 10.5L6.3 0H0v20h6.5V9.5L13.7 20H20V0h-6.5z"/>
                </svg>
              </span>
              <span>네이버로 계속하기</span>
            </button>
            <button v-if="isNative" type="button" class="lp-btn lp-btn--apple" @click="startSocialLogin('apple')">
              <span class="lp-icon-svg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </span>
              <span>Apple로 계속하기</span>
            </button>
            <button v-else type="button" class="lp-btn lp-btn--github" @click="startSocialLogin('github')">
              <span class="lp-icon-svg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </span>
              <span>GitHub로 계속하기</span>
            </button>
          </div>

          <div class="lp-divider"><span>또는</span></div>

          <button type="button" class="lp-email-link" @click="goToEmailLogin">
            이메일로 로그인 · 회원가입
          </button>

          <p class="lp-footnote">
            계속 진행하면 <a href="/terms" target="_blank" rel="noopener">이용약관</a> 및
            <a href="/privacy" target="_blank" rel="noopener">개인정보처리방침</a>에 동의하게 됩니다
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lp-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 16px;
}

.lp-container {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  padding: 36px 28px 24px;
  width: 100%;
  max-width: 380px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.lp-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F2F4F6;
  color: #4E5968;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}
.lp-close:hover { background: #E5E8EB; color: #191F28; }

.lp-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}
.lp-logo img {
  width: 56px;
  height: auto;
}

.lp-title {
  font-size: 18px;
  font-weight: 800;
  color: #0A0E1A;
  margin: 0 0 6px;
  line-height: 1.4;
  letter-spacing: -0.3px;
  word-break: keep-all;
  white-space: pre-line;
}

.lp-sub {
  font-size: 13.5px;
  font-weight: 500;
  color: #8B95A1;
  margin: 0 0 22px;
  line-height: 1.5;
  letter-spacing: -0.2px;
  word-break: keep-all;
}

.lp-social {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.lp-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.2px;
  font-family: inherit;
  transition: transform 0.1s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.lp-btn:active { transform: scale(0.98); }

.lp-icon-img { width: 18px; height: 18px; }
.lp-icon-svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.lp-btn--google {
  background: #ffffff;
  color: #191F28;
  border: 1px solid #E5E8EB;
}
.lp-btn--google:hover { background: #F7F8FA; }

.lp-btn--naver {
  background: #03C75A;
  color: #ffffff;
}
.lp-btn--naver:hover { background: #02B351; }

.lp-btn--github {
  background: #24292E;
  color: #ffffff;
}
.lp-btn--github:hover { background: #1B1F23; }

.lp-btn--apple {
  background: #000000;
  color: #ffffff;
}
.lp-btn--apple:hover { background: #1A1A1A; }

.lp-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 14px;
  color: #B0B8C1;
  font-size: 12px;
  font-weight: 500;
}
.lp-divider::before,
.lp-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #F2F4F6;
}

.lp-email-link {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: #4E5968;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: inherit;
  transition: color 0.15s ease, background 0.15s ease;
  letter-spacing: -0.2px;
}
.lp-email-link:hover {
  color: #191F28;
  background: #F7F8FA;
}

.lp-footnote {
  margin: 16px 0 0;
  font-size: 11px;
  color: #B0B8C1;
  line-height: 1.5;
  letter-spacing: -0.1px;
  word-break: keep-all;
}
.lp-footnote a {
  color: #8B95A1;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.lp-footnote a:hover { color: #4E5968; }

/* 트랜지션 */
.login-prompt-enter-active { transition: opacity 0.2s ease; }
.login-prompt-enter-active .lp-container {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}
.login-prompt-leave-active { transition: opacity 0.15s ease; }
.login-prompt-leave-active .lp-container {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.login-prompt-enter-from { opacity: 0; }
.login-prompt-enter-from .lp-container {
  opacity: 0;
  transform: scale(0.92) translateY(8px);
}
.login-prompt-leave-to { opacity: 0; }
.login-prompt-leave-to .lp-container {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 480px) {
  .lp-container {
    padding: 32px 22px 22px;
    border-radius: 18px;
  }
  .lp-title { font-size: 17px; }
  .lp-sub { font-size: 13px; margin-bottom: 18px; }
  .lp-btn { height: 44px; font-size: 13.5px; }
}
</style>
