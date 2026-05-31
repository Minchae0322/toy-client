<template>
  <div class="consent-wrap">
    <div class="consent-card">
      <header class="head">
        <span class="head-badge" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </span>
        <h1>안전한 이용을 위해<br/>약관 동의가 필요해요</h1>
        <p class="head-sub">서비스 제공·회원 식별을 위한 최소한의 정보입니다.</p>
      </header>

      <ul class="terms">
        <li>
          <label class="row">
            <input type="checkbox" v-model="agreePrivacy" />
            <span class="check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
            <span class="row-text">
              <span class="row-title"><span class="req">[필수]</span> 개인정보 수집·이용에 동의합니다</span>
              <span class="row-meta">이메일, 소셜 식별자, 닉네임 · 회원 식별·서비스 제공 · 탈퇴 시까지 보유</span>
            </span>
            <a class="row-detail" :href="privacyUrl" target="_blank" rel="noopener noreferrer">전문 보기</a>
          </label>
        </li>
        <li>
          <label class="row">
            <input type="checkbox" v-model="agreeTerms" />
            <span class="check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
            <span class="row-text">
              <span class="row-title"><span class="req">[필수]</span> 서비스 이용약관에 동의합니다</span>
              <span class="row-meta">서비스 이용 규칙 · 권리 및 책임</span>
            </span>
            <a class="row-detail" :href="termsUrl" target="_blank" rel="noopener noreferrer">전문 보기</a>
          </label>
        </li>
      </ul>

      <p class="refuse-note">
        동의를 거부할 수 있으나, 필수 항목 거부 시 서비스 가입·이용이 제한될 수 있어요.
      </p>

      <button
        type="button"
        class="cta"
        :disabled="!canSubmit || submitting"
        @click="submit"
      >
        <span v-if="submitting" class="spinner" aria-hidden="true"></span>
        {{ submitting ? '처리 중...' : '동의하고 계속하기' }}
      </button>

      <button type="button" class="ghost" @click="cancel" :disabled="submitting">
        취소하고 로그아웃
      </button>

      <p v-if="errorMsg" class="err">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '@/services/AuthService.js'
import { useAuth } from '@/composables/useAuth.js'
import { useConsentGate } from '@/composables/useConsentGate.js'

const router = useRouter()
const route = useRoute()
const { logout } = useAuth()
const { consumePendingRedirect } = useConsentGate()

const privacyUrl = '/privacy-policy'
const termsUrl = '/terms-of-service'

const agreePrivacy = ref(false)
const agreeTerms = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() => agreePrivacy.value && agreeTerms.value)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    const res = await authService.submitPrivacyPolicyConsent()
    if (res?.success === false) {
      throw new Error(res?.message || '동의 처리에 실패했어요.')
    }
    // 성공 — 원래 가려던 경로 또는 query.redirect 또는 /feed
    const fallback = typeof route.query?.redirect === 'string' ? route.query.redirect : '/feed'
    const target = consumePendingRedirect(fallback)
    await router.replace(target)
  } catch (e) {
    console.error('[Consent] 제출 실패:', e)
    errorMsg.value = e?.message || '잠시 후 다시 시도해주세요.'
  } finally {
    submitting.value = false
  }
}

async function cancel() {
  if (submitting.value) return
  try { await logout() } catch {}
  router.replace({ name: 'Login' })
}
</script>

<style scoped>
.consent-wrap {
  min-height: 100vh;
  background: var(--bg-base);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px 60px;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  color: var(--text-primary);
}
.consent-card {
  width: 100%;
  max-width: 480px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 8px 32px rgba(10, 14, 26, 0.06);
}

.head { text-align: center; margin-bottom: 24px; }
.head-badge {
  display: inline-flex;
  align-items: center; justify-content: center;
  width: 48px; height: 48px;
  border-radius: 14px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  margin-bottom: 14px;
}
.head h1 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.4;
}
.head-sub {
  margin: 0;
  font-size: 13px;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
}

.terms { list-style: none; padding: 0; margin: 0 0 14px; display: flex; flex-direction: column; gap: 8px; }
.row {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  cursor: pointer;
}
.row input[type="checkbox"] { position: absolute; opacity: 0; pointer-events: none; }
.check {
  width: 22px; height: 22px;
  border: 1.5px solid var(--border-strong);
  border-radius: 6px;
  display: inline-flex;
  align-items: center; justify-content: center;
  color: transparent;
  background: var(--bg-elevated);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  flex-shrink: 0;
  margin-top: 2px;
}
.row input:checked + .check {
  background: var(--c-brand);
  border-color: var(--c-brand);
  color: white;
}
.row-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.row-title { font-size: 13.5px; font-weight: 700; letter-spacing: -0.01em; }
.req { color: var(--c-brand); margin-right: 2px; }
.row-meta { font-size: 11.5px; color: var(--c-text-500); letter-spacing: -0.01em; line-height: 1.4; }
.row-detail {
  font-size: 11.5px;
  color: var(--c-text-500);
  text-decoration: underline;
  text-underline-offset: 2px;
  flex-shrink: 0;
  align-self: center;
  white-space: nowrap;
}
.row-detail:hover { color: var(--c-brand); }

.refuse-note {
  margin: 0 0 18px;
  padding: 10px 12px;
  background: var(--bg-mute);
  border-radius: 8px;
  font-size: 11.5px;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
  line-height: 1.5;
}

.cta {
  display: inline-flex;
  align-items: center; justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: var(--c-brand);
  color: white;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.cta:hover:not(:disabled) { background: var(--c-brand-hover); }
.cta:active:not(:disabled) { transform: scale(0.99); }
.cta:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

.ghost {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: transparent;
  color: var(--c-text-500);
  border: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: color 0.15s;
}
.ghost:hover:not(:disabled) { color: var(--c-text-600); text-decoration: underline; }
.ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.err {
  margin: 12px 0 0;
  padding: 10px 12px;
  background: var(--c-danger-soft);
  color: var(--c-danger);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .consent-card { padding: 24px 18px; border-radius: 14px; }
  .head h1 { font-size: 17px; }
  .row { grid-template-columns: 20px 1fr; padding: 10px 12px; }
  .row-detail { grid-column: 2 / 3; align-self: flex-start; margin-top: 2px; }
}
</style>
