<template>
  <div class="welcome-wrap">
    <div class="welcome-card">
      <header class="head">
        <span class="head-badge" aria-hidden="true">
          <Sparkles :size="22" :stroke-width="2" />
        </span>
        <h1>요거뜨에 오신 걸<br/>환영해요!</h1>
        <p class="head-sub">다른 사람에게 보여질 닉네임을 정해주세요.<br/>언제든 마이페이지에서 바꿀 수 있어요.</p>
      </header>

      <!-- 닉네임 미리보기 아바타 -->
      <div class="preview">
        <div class="preview-avatar">{{ avatarInitial }}</div>
        <span class="preview-name">{{ nickname.trim() || '닉네임' }}</span>
      </div>

      <!-- 닉네임 입력 -->
      <div class="field">
        <label class="field-label" for="welcome-nickname">닉네임</label>
        <div class="input-wrap" :class="{ error: !!errorMsg }">
          <input
            id="welcome-nickname"
            ref="inputRef"
            v-model="nickname"
            type="text"
            maxlength="20"
            placeholder="예: 요거러버"
            autocomplete="off"
            :disabled="saving"
            @keydown.enter.prevent="submit"
          />
          <span class="counter">{{ nickname.trim().length }}/20</span>
        </div>
        <p v-if="errorMsg" class="field-err">{{ errorMsg }}</p>
        <p v-else class="field-hint">2~20자로 입력해주세요.</p>
      </div>

      <button
        type="button"
        class="cta"
        :disabled="!canSubmit || saving"
        @click="submit"
      >
        <span v-if="saving" class="spinner" aria-hidden="true"></span>
        {{ saving ? '저장 중...' : '이 닉네임으로 시작하기' }}
      </button>

      <button type="button" class="ghost" :disabled="saving" @click="skip">
        나중에 할게요
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Sparkles } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth.js'
import { userService } from '@/services/UserService.js'

const router = useRouter()
const route = useRoute()
const { userId, user, updateUserInfo } = useAuth()

const PENDING_KEY = 'pending_nickname_setup'

const nickname = ref('')
const saving = ref(false)
const errorMsg = ref('')
const inputRef = ref(null)

const avatarInitial = computed(() => {
  const n = nickname.value.trim()
  return n ? n.charAt(0).toUpperCase() : '?'
})

const canSubmit = computed(() => {
  const n = nickname.value.trim()
  return n.length >= 2 && n.length <= 20
})

const redirectTarget = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r ? r : '/feed'
})

function clearPending() {
  try { localStorage.removeItem(PENDING_KEY) } catch {}
}

async function leave() {
  clearPending()
  try {
    await router.replace(redirectTarget.value)
  } catch {
    window.location.href = redirectTarget.value
  }
}

async function submit() {
  if (!canSubmit.value || saving.value) return
  const next = nickname.value.trim()

  if (!userId.value) {
    errorMsg.value = '로그인 정보를 확인할 수 없어요. 다시 로그인해주세요.'
    return
  }

  saving.value = true
  errorMsg.value = ''
  try {
    const res = await userService.updateUser(userId.value, {
      nickname: next,
      description: user.value?.description ?? '',
      profileImgInfo: null,
    })
    if (res?.success === false) {
      throw new Error(res?.message || '닉네임 저장에 실패했어요.')
    }
    // 헤더 등 전역 표시 즉시 갱신
    updateUserInfo({ nickname: next })
    await leave()
  } catch (e) {
    console.error('[Welcome] 닉네임 저장 실패:', e)
    errorMsg.value = e?.message || '잠시 후 다시 시도해주세요.'
  } finally {
    saving.value = false
  }
}

function skip() {
  if (saving.value) return
  leave()
}

onMounted(async () => {
  await nextTick()
  inputRef.value?.focus()
})
</script>

<style scoped>
.welcome-wrap {
  min-height: 100vh;
  background: var(--bg-base);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px 60px;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  color: var(--text-primary);
}
.welcome-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 32px 24px 28px;
  box-shadow: 0 8px 32px rgba(10, 14, 26, 0.06);
}

/* ===== 헤더 ===== */
.head { text-align: center; margin-bottom: 22px; }
.head-badge {
  display: inline-flex;
  align-items: center; justify-content: center;
  width: 52px; height: 52px;
  border-radius: 15px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  margin-bottom: 14px;
}
.head h1 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.35;
}
.head-sub {
  margin: 0;
  font-size: 13px;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
  line-height: 1.6;
}

/* ===== 미리보기 ===== */
.preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}
.preview-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--c-brand);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
}
.preview-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 입력 ===== */
.field { margin-bottom: 22px; }
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-wrap input {
  width: 100%;
  padding: 13px 56px 13px 14px;
  font-size: 15px;
  font-weight: 500;
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-subtle);
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}
.input-wrap input::placeholder { color: var(--c-text-300); font-weight: 400; }
.input-wrap input:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
  background: var(--bg-elevated);
}
.input-wrap.error input {
  border-color: var(--c-danger);
  background: var(--c-danger-soft);
}
.counter {
  position: absolute;
  right: 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-300);
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}
.field-hint, .field-err {
  margin: 7px 2px 0;
  font-size: 12px;
  letter-spacing: -0.01em;
}
.field-hint { color: var(--c-text-400); }
.field-err { color: var(--c-danger); font-weight: 600; }

/* ===== 버튼 ===== */
.cta {
  display: inline-flex;
  align-items: center; justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: var(--c-brand);
  color: #fff;
  border: none;
  border-radius: 11px;
  font-family: inherit;
  font-size: 15px;
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
  padding: 11px;
  background: transparent;
  color: var(--c-text-500);
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: color 0.15s;
}
.ghost:hover:not(:disabled) { color: var(--c-text-600); text-decoration: underline; }
.ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .welcome-wrap { padding: 32px 16px 48px; }
  .welcome-card { padding: 28px 18px 24px; border-radius: 14px; }
  .head h1 { font-size: 20px; }
}
</style>
