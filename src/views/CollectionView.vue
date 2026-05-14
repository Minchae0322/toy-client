<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <div class="content-inner">
        <!-- 헤더 -->
        <header class="page-header">
          <h1 class="page-title">컬렉션</h1>
          <p class="page-subtitle">나의 성장 · 뱃지</p>
        </header>

        <!-- 탭 -->
        <nav v-if="tabs.length > 1" class="tab-bar">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab"
            :class="{ active: currentTab === tab.id }"
            @click="currentTab = tab.id"
          >
            <component :is="tab.icon" class="tab-icon" :size="18" :stroke-width="2" />
            <span class="tab-label">{{ tab.label }}</span>
          </button>
        </nav>

        <!-- 보상 탭 -->
        <div v-if="currentTab === 'rewards'" class="tab-panel">
          <!-- 지금의 나 -->
          <section class="section-group hero-group">
            <LevelCard :user="currentUser" :streak="streak" @use-ticket="onUseTicket" />
          </section>

          <!-- 성장 가이드 (세컨더리) -->
          <section class="section-group secondary accent-gray">
            <header class="section-heading">
              <div class="heading-main">
                <span class="accent-dot"></span>
                <h2 class="group-title">성장 가이드</h2>
              </div>
              <button class="toggle-btn" @click="guideExpanded = !guideExpanded">
                {{ guideExpanded ? '접기' : '펼치기' }}
                <span class="arrow" :class="{ open: guideExpanded }">▾</span>
              </button>
            </header>
            <p class="group-desc">레벨을 올리고 등급별 혜택을 확인해 보세요</p>

            <div v-show="guideExpanded" class="secondary-body">
              <ExpGuide />
            </div>
          </section>

          <!-- EXP 획득 이력 -->
          <section class="section-group secondary accent-gray">
            <header class="section-heading">
              <div class="heading-main">
                <span class="accent-dot"></span>
                <h2 class="group-title">EXP 획득 이력</h2>
              </div>
              <button class="toggle-btn" @click="historyExpanded = !historyExpanded">
                {{ historyExpanded ? '접기' : '펼치기' }}
                <span class="arrow" :class="{ open: historyExpanded }">▾</span>
              </button>
            </header>
            <p class="group-desc">최근 경험치 획득 내역을 확인해 보세요</p>

            <div v-show="historyExpanded" class="secondary-body">
              <ExpHistory />
            </div>
          </section>
        </div>

        <Transition name="toast">
          <div v-if="toast" class="toast">
            <component :is="toast.icon" class="toast-icon" :size="18" :stroke-width="2.2" />
            <span class="toast-text">{{ toast.text }}</span>
          </div>
        </Transition>
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { rewardsService } from '@/services/RewardsService.js'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import LevelCard from '@/components/collection/LevelCard.vue'
import ExpGuide from '@/components/collection/ExpGuide.vue'
import ExpHistory from '@/components/collection/ExpHistory.vue'
import {
  Gift,
  Ticket,
  AlertCircle,
} from '@/utils/collectionIcons.js'

const authStore = useAuthStore()

const tabs = [
  { id: 'rewards', icon: Gift, label: '보상' },
]

const currentUser = reactive({
  nickname: authStore.userNickname || '',
  level: 1,
  currentExp: 0,
  totalExp: 0,
  nextLevelExp: 0,
  maxLevel: false,
  certificationCount: 0,
  fireCount: 0,
  followerCount: 0,
})

const currentTab = ref('rewards')
const guideExpanded = ref(false)
const historyExpanded = ref(false)

const streak = ref(null)

const toast = ref(null)
let toastTimer = null

async function loadRewardData() {
  try {
    const [rewardsRes, streakRes] = await Promise.all([
      rewardsService.getMyRewards(),
      rewardsService.getMyStreak(),
    ])

    // 유저 레벨/경험치 반영
    const rewards = rewardsRes?.data
    if (rewards) {
      currentUser.level = rewards.level ?? 1
      currentUser.currentExp = rewards.currentLevelExp ?? 0
      currentUser.totalExp = rewards.totalExp ?? 0
      currentUser.nextLevelExp = rewards.nextLevelExp ?? 0
      currentUser.maxLevel = rewards.maxLevel === true
      currentUser.seasonExp = rewards.seasonExp ?? 0
      currentUser.seasonCode = rewards.seasonCode ?? ''
    }

    streak.value = streakRes?.data ?? null
  } catch (e) {
    console.error('[CollectionView] 데이터 로딩 실패:', e)
  }
}

function showToast(icon, text) {
  toast.value = { icon, text }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 2200)
}

async function onUseTicket() {
  try {
    const updated = await rewardsService.useRecoveryTicket()
    streak.value = updated?.data ?? null
    showToast(Ticket, '복구 티켓 사용! 스트릭이 유지됐어요')
  } catch (e) {
    showToast(AlertCircle, e.message === 'NO_TICKETS' ? '티켓이 없습니다' : '오류가 발생했어요')
  }
}

onMounted(loadRewardData)
</script>

<style scoped>
/* ===== 컨테이너 (Neo-Brutalism) ===== */
.app-container {
  background: var(--bg-base);
  min-height: 100vh;
  color: var(--text-primary);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100%;
  overflow-x: clip;
  padding: 0 1rem;
}

@media (min-width: 768px) { .app-container { padding: 0 2rem; } }
@media (min-width: 1280px) { .app-container { padding: 0 3rem; max-width: 1920px; margin-left: auto; margin-right: auto; } }
@media (min-width: 1920px) { .app-container { padding: 0 4rem; } }

.main-content {
  flex: 1;
  min-width: 0;
  /* BottomNavigation + iOS 홈 인디케이터 */
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
}

@media (min-width: 768px) { .main-content { padding-bottom: 3rem; } }

.content-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 768px) { .content-inner { max-width: 820px; padding: 0; } }
@media (min-width: 1280px) { .content-inner { max-width: 900px; } }

/* ===== 페이지 헤더 ===== */
.page-header {
  padding: 20px 0 16px;
}

@media (min-width: 768px) { .page-header { padding: 32px 0 20px; } }

.page-title {
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -1.2px;
  line-height: 1.05;
  text-transform: uppercase;
}

@media (min-width: 768px) { .page-title { font-size: 38px; letter-spacing: -1.6px; } }

.page-subtitle {
  font-size: 12px;
  color: var(--text-primary);
  margin-top: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

@media (min-width: 768px) { .page-subtitle { font-size: 13px; } }

/* ===== 탭 바 (Neo-Brutalism 세그먼트) ===== */
.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 28px;
  padding: 4px;
  background: var(--bg-elevated);
  border: 2px solid var(--c-ink-900);
  border-radius: 4px;
  box-shadow: 4px 4px 0 var(--c-ink-900);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tab-bar::-webkit-scrollbar { display: none; }

@media (min-width: 768px) { .tab-bar { margin-bottom: 28px; } }

.tab {
  flex: 1;
  min-width: 0;
  justify-content: center;
  padding: 10px 12px;
  border: 2px solid transparent;
  background: transparent;
  font-size: 13px;
  font-weight: 800;
  font-family: inherit;
  color: var(--text-primary);
  cursor: pointer;
  transition: transform 0.08s ease, background 0.18s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 2px;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  white-space: nowrap;
}

@media (min-width: 768px) { .tab { font-size: 14px; padding: 11px 16px; } }

.tab-icon { color: currentColor; flex-shrink: 0; }

.tab:hover:not(.active) {
  color: var(--text-primary);
  background: var(--bg-mute);
}

.tab:active { transform: scale(0.96); }

.tab.active {
  /* 라임 그린은 다크/라이트 모두 밝은 색 → 글씨/아이콘은 항상 검정 유지 */
  color: var(--c-ink-900);
  background: #B4FF39;
  border-color: var(--c-ink-900);
  box-shadow: 2px 2px 0 var(--c-ink-900);
}

.tab.active .tab-icon { color: var(--c-ink-900); }

/* ===== 탭 패널 ===== */
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: fadeIn 0.25s ease;
}

@media (min-width: 768px) { .tab-panel { gap: 36px; } }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 섹션 그룹 ===== */
.section-group { display: flex; flex-direction: column; gap: 14px; }
@media (min-width: 768px) { .section-group { gap: 16px; } }

/* hero는 헤딩 없이 카드만 */
.hero-group { gap: 0; }

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 0 4px;
}

.heading-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.accent-dot {
  width: 14px;
  height: 14px;
  border-radius: 0;
  border: 2px solid var(--c-ink-900);
  flex-shrink: 0;
}

.accent-purple .accent-dot { background: #B4FF39; }
.accent-gold .accent-dot { background: var(--c-warning); }
.accent-orange .accent-dot { background: var(--c-heat); }
.accent-green .accent-dot { background: var(--c-success); }
.accent-gray .accent-dot { background: var(--bg-elevated); }

.group-title {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  line-height: 1.15;
  text-transform: uppercase;
}

@media (min-width: 768px) { .group-title { font-size: 22px; } }

.group-desc {
  font-size: 13px;
  color: var(--c-text-500);
  padding: 0 4px 0 20px;
  font-weight: 500;
  line-height: 1.4;
  margin-top: -6px;
}

@media (min-width: 768px) { .group-desc { font-size: 14px; } }

.group-meta {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-400);
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.group-meta strong {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.4px;
  margin-right: 2px;
}

.accent-purple .group-meta strong { color: var(--c-brand); }
.accent-gold .group-meta strong { color: var(--c-warning); }

.group-desc .emphasize { color: var(--c-brand); font-weight: 800; }

/* ===== Claim ready 배너 (Neo-Brutalism) ===== */
.claim-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: #B4FF39;
  border: 2px solid var(--c-ink-900);
  border-radius: 4px;
  box-shadow: 4px 4px 0 var(--c-ink-900);
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.banner-text { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }

.banner-icon {
  width: 40px;
  height: 40px;
  border-radius: 2px;
  background: var(--c-ink-900);
  color: #B4FF39;
  border: 2px solid var(--c-ink-900);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-title {
  font-size: 14px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  line-height: 1.25;
  text-transform: uppercase;
}

.banner-sub {
  font-size: 12px;
  color: var(--text-primary);
  margin-top: 3px;
  font-weight: 700;
}

.banner-btn {
  padding: 10px 16px;
  border: 2px solid var(--c-ink-900);
  border-radius: 2px;
  background: var(--c-ink-900);
  color: #B4FF39;
  font-size: 12.5px;
  font-weight: 900;
  font-family: inherit;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
  flex-shrink: 0;
  box-shadow: 3px 3px 0 var(--bg-elevated);
}

.banner-btn:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--bg-elevated); }
.banner-btn:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--bg-elevated); }

@media (max-width: 480px) {
  .claim-banner { flex-direction: column; align-items: stretch; }
  .banner-btn { width: 100%; }
}

/* 세컨더리 — Neo-Brutalism 블록 */
.section-group.secondary {
  background: var(--bg-elevated);
  border: 2px solid var(--c-ink-900);
  margin: 0;
  padding: 24px 20px;
  border-radius: 4px;
  box-shadow: 4px 4px 0 var(--c-ink-900);
}

@media (min-width: 768px) {
  .section-group.secondary {
    padding: 28px 24px;
  }
}

.section-group.secondary .group-title { font-size: 17px; color: var(--c-text-600); }
@media (min-width: 768px) { .section-group.secondary .group-title { font-size: 19px; } }

.toggle-btn {
  border: 2px solid var(--c-ink-900);
  background: var(--bg-elevated);
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  color: var(--text-primary);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 2px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 2px 2px 0 var(--c-ink-900);
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}

.toggle-btn:hover { background: #B4FF39; }
.toggle-btn:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--c-ink-900); }
.toggle-btn .arrow { transition: transform 0.2s; display: inline-block; }
.toggle-btn .arrow.open { transform: rotate(180deg); }

.secondary-body { display: flex; flex-direction: column; gap: 16px; }

/* ===== 카드 공통 오버라이드 (Neo-Brutalism) ===== */
.tab-panel :deep(.section-card),
.tab-panel :deep(.hero-card) {
  margin-bottom: 0 !important;
  border: 2px solid var(--c-ink-900) !important;
  border-radius: 4px !important;
  box-shadow: 5px 5px 0 var(--c-ink-900) !important;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.tab-panel :deep(.section-card) {
  background: var(--bg-elevated) !important;
}

.tab-panel :deep(.hero-card) {
  box-shadow: 6px 6px 0 var(--c-ink-900) !important;
}

.tab-panel :deep(.section-card):hover,
.tab-panel :deep(.hero-card):hover {
  transform: translate(-1px, -1px);
  box-shadow: 6px 6px 0 var(--c-ink-900) !important;
}

/* 세컨더리 영역 카드 */
.section-group.secondary :deep(.section-card) {
  border: 2px solid var(--c-ink-900) !important;
  box-shadow: 3px 3px 0 var(--c-ink-900) !important;
  background: var(--bg-elevated) !important;
  padding: 20px !important;
  border-radius: 4px !important;
}

@media (min-width: 768px) {
  .section-group.secondary :deep(.section-card) {
    padding: 24px !important;
  }
}

.section-group.secondary :deep(.section-title) {
  font-size: 14px !important;
  color: var(--c-text-600) !important;
}

/* ===== 준비중 placeholder ===== */
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 56px 24px;
  background: var(--bg-elevated);
  border: 2px solid var(--c-ink-900);
  border-radius: 4px;
  box-shadow: 4px 4px 0 var(--c-ink-900);
  text-align: center;
}

.coming-soon-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #B4FF39;
  color: var(--text-primary);
  border: 2px solid var(--c-ink-900);
  border-radius: 4px;
  box-shadow: 3px 3px 0 var(--c-ink-900);
}

.coming-soon-title {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  text-transform: uppercase;
  margin: 4px 0 0;
}

.coming-soon-desc {
  font-size: 13px;
  color: var(--c-text-500);
  font-weight: 600;
  letter-spacing: -0.1px;
  margin: 0;
}

@media (min-width: 768px) {
  .coming-soon { padding: 72px 32px; }
  .coming-soon-title { font-size: 20px; }
  .coming-soon-desc { font-size: 14px; }
}

/* ===== 토스트 (Neo-Brutalism) ===== */
.toast {
  position: fixed;
  /* BottomNav 88 + iOS 홈 인디케이터 */
  bottom: calc(88px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  background: var(--c-ink-900);
  color: #B4FF39;
  padding: 12px 20px;
  border: 2px solid var(--c-ink-900);
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 4px 4px 0 #B4FF39, 4px 4px 0 2px var(--c-ink-900);
  z-index: 1000;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

@media (min-width: 768px) { .toast { bottom: 40px; font-size: 14px; padding: 14px 24px; } }

.toast-icon { color: currentColor; flex-shrink: 0; }
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }

/* 모바일/터치: sticky hover 차단 */
@media (hover: none) {
  .banner-btn:hover { transform: none; box-shadow: 4px 4px 0 var(--bg-elevated); }
  .tab-panel :deep(.hero-card):hover { transform: none; }
}
</style>
