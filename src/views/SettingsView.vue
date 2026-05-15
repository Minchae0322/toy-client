<template>
  <div class="settings-page">
    <header class="page-header">
      <button @click="goBack" class="back-btn" aria-label="뒤로 가기">
        <ChevronLeft :size="22" />
      </button>
      <h1 class="page-title">환경설정</h1>
      <span class="page-spacer" />
    </header>

    <main class="page-main">
      <section class="settings-section">
        <div class="section-head">
          <span class="section-title">화면 모드</span>
          <span class="section-desc">앱 전체의 라이트/다크 테마를 선택하세요. 시스템은 OS 설정을 따릅니다.</span>
        </div>
        <div class="theme-segment" role="radiogroup" aria-label="화면 모드 선택">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            class="theme-segment-item"
            :class="{ active: themeMode === opt.value }"
            role="radio"
            :aria-checked="themeMode === opt.value"
            @click="setThemeMode(opt.value)"
          >
            <component :is="opt.icon" :size="16" />
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </section>

      <section v-if="isLoggedIn" class="settings-section">
        <div class="section-head">
          <span class="section-title">계정</span>
        </div>
        <ul class="link-list">
          <li>
            <RouterLink :to="{ name: 'NotificationSettings' }" class="link-item">
              <span class="link-left"><Bell :size="18" /><span>알림 설정</span></span>
              <ChevronRight :size="18" />
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'AccountSettings' }" class="link-item">
              <span class="link-left"><Settings :size="18" /><span>계정 설정</span></span>
              <ChevronRight :size="18" />
            </RouterLink>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Sun, Moon, Monitor, Bell, Settings } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { isLoggedIn } = useAuth()
const { mode: themeMode, setMode: setThemeMode } = useTheme()

const themeOptions = [
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
  { value: 'auto', label: '시스템', icon: Monitor },
]

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<style scoped>
.settings-page {
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
  background: var(--bg-base);
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-section {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 16px;
}

.section-head {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: -0.2px;
}
.section-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  letter-spacing: -0.1px;
}

.theme-segment {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: var(--bg-subtle);
  padding: 4px;
  border-radius: 12px;
}
.theme-segment-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 600;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  font-family: inherit;
  letter-spacing: -0.2px;
}
.theme-segment-item:hover:not(.active) {
  color: var(--text-secondary);
}
.theme-segment-item.active {
  background: var(--bg-elevated);
  color: var(--c-brand);
  box-shadow: var(--shadow-sm);
}
.theme-segment-item svg { flex-shrink: 0; }

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}
.link-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-default);
  font-size: 14px;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.link-list li:last-child .link-item { border-bottom: none; }
.link-item:hover { background: var(--bg-subtle); }
.link-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.link-left svg { color: var(--text-secondary); }
.link-item > svg { color: var(--text-tertiary); }
</style>
