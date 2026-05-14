<template>
  <div class="notif-settings-page">
    <!-- 헤더 -->
    <header class="page-header">
      <button @click="goBack" class="back-btn" aria-label="뒤로 가기">
        <ChevronLeft :size="22" />
      </button>
      <h1 class="page-title">알림 설정</h1>
      <span class="page-spacer" />
    </header>

    <main class="page-main">
      <!-- 설명 -->
      <p class="page-desc">
        카테고리별로 어떤 채널의 알림을 받을지 선택하세요. 변경은 자동 저장됩니다.
      </p>

      <!-- 로딩 -->
      <div v-if="loading" class="state-block">
        <div class="spinner"></div>
        <span>설정을 불러오는 중...</span>
      </div>

      <!-- 에러 -->
      <div v-else-if="loadError" class="state-block error">
        <AlertCircle :size="20" />
        <span>{{ loadError }}</span>
        <button class="retry-btn" @click="fetchSettings">다시 시도</button>
      </div>

      <!-- 설정 목록 (채널: PUSH 단일) -->
      <ul v-else class="setting-list">
        <li v-for="cat in categories" :key="cat.code" class="setting-row">
          <div class="setting-head">
            <div class="setting-title-row">
              <span class="setting-title">{{ cat.label }}</span>
              <span v-if="cat.code === 'MARKETING'" class="setting-tag">선택</span>
            </div>
            <span class="setting-desc">{{ cat.desc }}</span>
          </div>

          <label
              class="channel-toggle"
              :class="{ saving: isSaving(cat.code, primaryChannel.code) }"
          >
            <input
                type="checkbox"
                :checked="getValue(cat.code, primaryChannel.code)"
                :disabled="isSaving(cat.code, primaryChannel.code)"
                @change="onToggle(cat.code, primaryChannel.code, $event.target.checked)"
            />
            <span class="switch"><span class="knob" /></span>
          </label>
        </li>
      </ul>

      <!-- 저장 상태 토스트 (간단) -->
      <Transition name="fade">
        <div v-if="saveError" class="save-error" @click="saveError = ''">
          <AlertCircle :size="16" /> {{ saveError }} (탭하여 닫기)
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, AlertCircle } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth.js'
import {
  notificationSettingService,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_CHANNEL,
  CATEGORY_META,
  CHANNEL_META,
  normalizeSettingsToMap,
} from '@/services/NotificationSettingService.js'

const router = useRouter()
const { userId } = useAuth()

const categories = Object.values(NOTIFICATION_CATEGORY).map((code) => ({
  code, ...CATEGORY_META[code],
}))
const channels = Object.values(NOTIFICATION_CHANNEL).map((code) => ({
  code, ...CHANNEL_META[code],
}))
// 단일 채널(PUSH)만 사용 — 화면에 채널 라벨 노출 X
const primaryChannel = channels[0]

const loading = ref(true)
const loadError = ref('')
const saveError = ref('')

// `${category}:${channel}` -> boolean
const valueMap = ref({})
// 저장 중인 키 set
const savingKeys = ref(new Set())

const keyOf = (category, channel) => `${category}:${channel}`
const getValue = (category, channel) => !!valueMap.value[keyOf(category, channel)]
const isSaving = (category, channel) => savingKeys.value.has(keyOf(category, channel))

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'MyPage' })
}

const fetchSettings = async () => {
  if (!userId.value) {
    loading.value = false
    loadError.value = '로그인이 필요합니다.'
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    const res = await notificationSettingService.getSettings(userId.value)
    const items = res?.data?.settings || res?.data || []
    valueMap.value = normalizeSettingsToMap(Array.isArray(items) ? items : [])
  } catch (err) {
    console.error('[NotifSettings] 불러오기 실패:', err)
    loadError.value = err?.message || '알림 설정을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const onToggle = async (category, channel, enabled) => {
  const key = keyOf(category, channel)
  const prev = valueMap.value[key]

  // optimistic update
  valueMap.value = { ...valueMap.value, [key]: enabled }
  savingKeys.value = new Set([...savingKeys.value, key])

  try {
    await notificationSettingService.updateOne(userId.value, {
      category, channel, enabled,
    })
  } catch (err) {
    console.error('[NotifSettings] 저장 실패:', err)
    // 롤백
    valueMap.value = { ...valueMap.value, [key]: prev }
    saveError.value = `${CATEGORY_META[category].label}·${CHANNEL_META[channel].label} 저장에 실패했어요.`
  } finally {
    const next = new Set(savingKeys.value)
    next.delete(key)
    savingKeys.value = next
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.notif-settings-page {
  min-height: 100vh;
  background: var(--bg-base);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  color: var(--text-primary);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-default);
  position: sticky;
  top: 0;
  z-index: 10;
}
.back-btn {
  width: 36px; height: 36px;
  border: 1px solid var(--border-strong); background: var(--bg-elevated);
  color: var(--c-text-600); border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease;
}
.back-btn:hover { background: var(--bg-subtle); border-color: var(--c-text-300); }
.page-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}
.page-spacer { width: 36px; }

.page-main {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px 80px;
}

.page-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
}

.state-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  font-size: 13px;
  color: var(--c-text-600);
}
.state-block.error { color: var(--c-danger); border-color: var(--c-danger-soft); background: var(--c-danger-soft); }
.retry-btn {
  margin-left: auto;
  padding: 6px 10px;
  background: var(--bg-elevated); border: 1px solid var(--c-danger-soft); color: var(--c-danger);
  border-radius: 8px; font-weight: 700; font-size: 12px;
  cursor: pointer;
}

.spinner {
  width: 18px; height: 18px;
  border: 2px solid var(--bg-mute); border-top-color: var(--c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 설정 목록 */
.setting-list {
  list-style: none;
  margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 10px;
}
.setting-row {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.setting-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.setting-title-row { display: flex; align-items: center; gap: 8px; }
.setting-title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}
.setting-tag {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--c-brand);
  background: var(--c-brand-soft);
  border-radius: 6px;
  padding: 2px 6px;
  letter-spacing: 0.2px;
}
.setting-desc {
  font-size: 12.5px;
  color: var(--c-text-400);
  letter-spacing: -0.01em;
}

/* 채널 토글 (단일 PUSH) */
.channel-toggle {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  transition: opacity 0.15s ease;
}
.channel-toggle.saving { opacity: 0.6; cursor: wait; }
.channel-toggle input[type="checkbox"] {
  position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;
}

/* iOS 스타일 스위치 */
.switch {
  position: relative;
  width: 36px; height: 20px;
  background: var(--c-text-300);
  border-radius: 999px;
  transition: background 0.18s ease;
  flex-shrink: 0;
}
.knob {
  position: absolute;
  top: 2px; left: 2px;
  width: 16px; height: 16px;
  background: var(--bg-elevated);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.12);
  transition: transform 0.18s ease;
}
.channel-toggle input:checked + .switch { background: var(--c-brand); }
.channel-toggle input:checked + .switch .knob { transform: translateX(16px); }

/* 저장 실패 토스트 */
.save-error {
  position: fixed;
  left: 50%; bottom: calc(96px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 14px;
  background: var(--c-danger); color: #fff;
  border-radius: 10px;
  font-size: 12.5px; font-weight: 600;
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
  cursor: pointer;
  z-index: 100;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }

@media (min-width: 768px) {
  .save-error { bottom: 24px; }
}
</style>
