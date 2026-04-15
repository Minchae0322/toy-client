<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 개발용 유저 스위처 (얇은 상단 바) -->
      <div class="dev-bar">
        <span class="dev-label">TEST</span>
        <div class="dev-chips">
          <button
            v-for="user in testUsers"
            :key="user.userId"
            class="dev-chip"
            :class="{ active: selectedUser.userId === user.userId }"
            @click="selectUser(user)"
          >
            <span class="dev-lv">Lv.{{ user.level }}</span>
            {{ user.nickname }}
          </button>
        </div>
      </div>

      <div class="content-inner">
        <!-- 헤더 -->
        <header class="page-header">
          <h1 class="page-title">컬렉션</h1>
          <p class="page-subtitle">나의 성장 · 뱃지 · 숙련도 · 예측 전적</p>
        </header>

        <!-- 탭 -->
        <nav class="tab-bar">
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
          <!-- 받을 수 있는 보상 배너 -->
          <div v-if="readyMissionCount > 0" class="claim-banner">
            <div class="banner-text">
              <div class="banner-icon">
                <Gift :size="20" :stroke-width="2.2" />
              </div>
              <div>
                <div class="banner-title">받을 수 있는 보상이 {{ readyMissionCount }}개 있어요</div>
                <div class="banner-sub">지금 바로 받고 EXP를 쌓아보세요</div>
              </div>
            </div>
            <button class="banner-btn" @click="scrollToMissions">보상 받으러 가기</button>
          </div>

          <!-- 지금의 나 -->
          <section class="section-group hero-group">
            <LevelCard :user="selectedUser" :streak="streak" @use-ticket="onUseTicket" />
          </section>

          <!-- 오늘 할 일 -->
          <section id="missions-section" class="section-group accent-purple">
            <header class="section-heading">
              <div class="heading-main">
                <span class="accent-dot"></span>
                <h2 class="group-title">오늘의 미션</h2>
              </div>
            </header>
            <p class="group-desc">
              <template v-if="readyMissionCount > 0">
                <strong class="emphasize">{{ readyMissionCount }}개</strong>를 받을 수 있어요
              </template>
              <template v-else-if="missions.length - claimedMissionCount > 0">
                {{ missions.length - claimedMissionCount }}개가 남았어요. 조금만 더!
              </template>
              <template v-else>
                오늘 미션을 모두 완료했어요.
              </template>
            </p>
            <DailyMissions :missions="sortedMissions" @claim="onClaimMission" />
          </section>

          <!-- 뱃지 -->
          <section class="section-group accent-gold">
            <header class="section-heading">
              <div class="heading-main">
                <span class="accent-dot"></span>
                <h2 class="group-title">내가 모은 뱃지</h2>
              </div>
            </header>
            <p class="group-desc">
              <template v-if="earnedBadges.length > 0">
                지금까지 <strong class="emphasize">{{ earnedBadges.length }}개</strong>를 모았어요
                <span v-if="nearCompleteBadges.length > 0"> · 곧 {{ nearCompleteBadges.length }}개 더 얻을 수 있어요</span>
              </template>
              <template v-else>
                첫 뱃지를 목표로 인증을 시작해 보세요
              </template>
            </p>
            <BadgeCollection
              :earned="earnedBadges"
              :unearned="unearnedBadges"
              :total-count="totalBadgeCount"
              :pinned-ids="pinnedIds"
              @select="badgeDetail = $event"
              @toggle-pin="onTogglePin"
            />
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
              <TierRoadmap :user-level="selectedUser.level" />
              <div class="two-col">
                <TierDetail :user-level="selectedUser.level" />
                <ExpGuide />
              </div>
              <ExpHistory :history="selectedUser.recentExpHistory" />
            </div>
          </section>
        </div>

        <!-- 숙련도 탭 -->
        <div v-else-if="currentTab === 'proficiency'" class="tab-panel">
          <ProficiencySection :user-id="selectedUser.userId" />
        </div>

        <!-- 예측 탭 -->
        <div v-else-if="currentTab === 'prediction'" class="tab-panel">
          <PredictionHistory :user-id="selectedUser.userId" />
        </div>

        <BadgeDetailModal
          :badge="badgeDetail"
          @close="badgeDetail = null"
        />

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
import { ref, computed, watch, onMounted } from 'vue'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import LevelCard from '@/components/collection/LevelCard.vue'
import TierRoadmap from '@/components/collection/TierRoadmap.vue'
import TierDetail from '@/components/collection/TierDetail.vue'
import BadgeCollection from '@/components/collection/BadgeCollection.vue'
import ExpGuide from '@/components/collection/ExpGuide.vue'
import ExpHistory from '@/components/collection/ExpHistory.vue'
import BadgeDetailModal from '@/components/collection/BadgeDetailModal.vue'
import DailyMissions from '@/components/collection/DailyMissions.vue'
import ProficiencySection from '@/components/collection/ProficiencySection.vue'
import PredictionHistory from '@/components/collection/PredictionHistory.vue'
import {
  TEST_USERS,
  getTierByLevel,
  getUserBadges,
  getUnearnedBadges,
  ALL_BADGES,
} from '@/data/levelSystemData.js'
import {
  fetchStreak,
  useRecoveryTicket,
  fetchDailyMissions,
  claimMission,
  fetchPinnedBadges,
  toggleBadgePin,
} from '@/api/rewardsApi.js'
import {
  Gift,
  Ticket,
  Sparkles,
  Pin,
  AlertCircle,
  Award,
  Target,
  CheckCircle2,
} from '@/utils/collectionIcons.js'

const tabs = [
  { id: 'rewards', icon: Gift, label: '보상' },
  { id: 'proficiency', icon: Award, label: '숙련도' },
  { id: 'prediction', icon: Target, label: '예측' },
]

const testUsers = ref(TEST_USERS)
const selectedUser = ref(TEST_USERS[2])
const badgeDetail = ref(null)
const currentTab = ref('rewards')
const guideExpanded = ref(false)

const streak = ref(null)
const missions = ref([])
const pinnedIds = ref([])

const toast = ref(null)
let toastTimer = null

const earnedBadges = computed(() => getUserBadges(selectedUser.value))
const unearnedBadges = computed(() => getUnearnedBadges(selectedUser.value))
const totalBadgeCount = computed(() => ALL_BADGES.basic.length + ALL_BADGES.special.length)
const claimedMissionCount = computed(() => missions.value.filter((m) => m.status === 'CLAIMED').length)
const readyMissionCount = computed(() => missions.value.filter((m) => m.status === 'COMPLETED').length)

// 받을 보상 있는 미션이 먼저 보이도록 정렬
const sortedMissions = computed(() => {
  const order = { COMPLETED: 0, IN_PROGRESS: 1, CLAIMED: 2 }
  return [...missions.value].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))
})

// 획득 임박 뱃지 (progress ≥ 70%)
const nearCompleteBadges = computed(() =>
  unearnedBadges.value.filter((b) => b.progress && (b.progress.current / b.progress.target) >= 0.7)
)

function scrollToMissions() {
  const el = document.getElementById('missions-section')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function loadRewardData() {
  const uid = selectedUser.value.userId
  const [s, m, p] = await Promise.all([
    fetchStreak(uid),
    fetchDailyMissions(uid),
    fetchPinnedBadges(uid),
  ])
  streak.value = s
  missions.value = m
  pinnedIds.value = p
}

function selectUser(user) {
  selectedUser.value = user
  badgeDetail.value = null
}

function showToast(icon, text) {
  toast.value = { icon, text }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 2200)
}

async function onUseTicket() {
  try {
    const updated = await useRecoveryTicket(selectedUser.value.userId)
    streak.value = updated
    showToast(Ticket, '복구 티켓 사용! 스트릭이 유지됐어요')
  } catch (e) {
    showToast(AlertCircle, e.message === 'NO_TICKETS' ? '티켓이 없습니다' : '오류가 발생했어요')
  }
}

async function onClaimMission(mission) {
  try {
    const result = await claimMission(selectedUser.value.userId, mission.missionId)
    const found = missions.value.find((m) => m.missionId === result.missionId)
    if (found) found.status = 'CLAIMED'
    showToast(Sparkles, `+${result.exp} EXP 획득!`)
  } catch (e) {
    showToast(AlertCircle, '보상을 받을 수 없습니다')
  }
}

async function onTogglePin(badge) {
  const result = await toggleBadgePin(selectedUser.value.userId, badge.id)
  pinnedIds.value = await fetchPinnedBadges(selectedUser.value.userId)
  showToast(Pin, result.pinned ? '프로필에 고정됐어요' : '고정이 해제됐어요')
}

onMounted(loadRewardData)
watch(() => selectedUser.value.userId, loadRewardData)
</script>

<style scoped>
/* ===== 컨테이너 ===== */
.app-container {
  background: #fff;
  min-height: 100vh;
  color: #0A0E1A;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  padding: 0 1rem;
}

@media (min-width: 768px) { .app-container { padding: 0 2rem; } }
@media (min-width: 1280px) { .app-container { padding: 0 3rem; max-width: 1920px; margin: 0 auto; } }

.main-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 5rem;
}

@media (min-width: 768px) { .main-content { padding-bottom: 3rem; } }

/* ===== 개발 바 ===== */
.dev-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #F2F4F6;
  border-radius: 10px;
  margin: 12px 0 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.dev-bar::-webkit-scrollbar { display: none; }

@media (min-width: 768px) { .dev-bar { padding: 8px 16px; gap: 10px; } }

.dev-label {
  font-size: 10px;
  font-weight: 800;
  color: #94A3B8;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.dev-chips { display: flex; gap: 4px; }

.dev-chip {
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 12px;
  font-family: inherit;
  color: #64748B;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 600;
  transition: all 0.1s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dev-lv {
  font-size: 10px;
  font-weight: 800;
  color: #94A3B8;
  letter-spacing: -0.1px;
}

.dev-chip:hover { background: #F2F4F6; color: #0A0E1A; }
.dev-chip:hover .dev-lv { color: #64748B; }
.dev-chip.active { background: #0A0E1A; color: white; }
.dev-chip.active .dev-lv { color: rgba(255,255,255,0.6); }

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
  font-size: 22px;
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.6px;
  line-height: 1.15;
}

@media (min-width: 768px) { .page-title { font-size: 26px; } }

.page-subtitle {
  font-size: 13px;
  color: #64748B;
  margin-top: 6px;
  font-weight: 500;
}

@media (min-width: 768px) { .page-subtitle { font-size: 14px; } }

/* ===== 탭 바 (세그먼트 컨트롤 스타일) ===== */
.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  padding: 4px;
  background: #F2F4F6;
  border-radius: 12px;
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
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  color: #64748B;
  cursor: pointer;
  transition: all 0.18s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 9px;
  letter-spacing: -0.2px;
  white-space: nowrap;
}

@media (min-width: 768px) { .tab { font-size: 14px; padding: 11px 16px; } }

.tab-icon { color: currentColor; flex-shrink: 0; }

.tab:hover:not(.active) {
  color: #0A0E1A;
  background: rgba(255, 255, 255, 0.5);
}

.tab.active {
  color: #0A0E1A;
  background: white;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.04);
}

.tab.active .tab-icon { color: #9333EA; }

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
  width: 4px;
  height: 18px;
  border-radius: 2px;
  flex-shrink: 0;
}

.accent-purple .accent-dot { background: #9333EA; }
.accent-gold .accent-dot { background: #EAB308; }
.accent-orange .accent-dot { background: #F97316; }
.accent-green .accent-dot { background: #16A34A; }
.accent-gray .accent-dot { background: #94A3B8; }

.group-title {
  font-size: 17px;
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

@media (min-width: 768px) { .group-title { font-size: 19px; } }

.group-desc {
  font-size: 13px;
  color: #64748B;
  padding: 0 4px 0 20px;
  font-weight: 500;
  line-height: 1.4;
  margin-top: -6px;
}

@media (min-width: 768px) { .group-desc { font-size: 14px; } }

.group-meta {
  font-size: 14px;
  font-weight: 700;
  color: #94A3B8;
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.group-meta strong {
  color: #0A0E1A;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.4px;
  margin-right: 2px;
}

.accent-purple .group-meta strong { color: #9333EA; }
.accent-gold .group-meta strong { color: #CA8A04; }

.group-desc .emphasize { color: #9333EA; font-weight: 800; }

/* ===== Claim ready 배너 ===== */
.claim-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #FAF5FF;
  border: 1.5px solid #E9D5FF;
  border-radius: 14px;
  margin-bottom: -4px;
  flex-wrap: wrap;
}

.banner-text { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }

.banner-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: white;
  color: #9333EA;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.2px;
  line-height: 1.3;
}

.banner-sub {
  font-size: 12px;
  color: #64748B;
  margin-top: 2px;
  font-weight: 500;
}

.banner-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 9px;
  background: #9333EA;
  color: white;
  font-size: 12.5px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(147, 51, 234, 0.26);
}

.banner-btn:hover { background: #7C3AED; transform: translateY(-1px); box-shadow: 0 8px 18px rgba(147, 51, 234, 0.35); }

@media (max-width: 480px) {
  .claim-banner { flex-direction: column; align-items: stretch; }
  .banner-btn { width: 100%; }
}

/* 세컨더리 — 회색 recessed 블록 */
.section-group.secondary {
  background: #F7F8FA;
  margin: 0 -16px;
  padding: 24px 16px;
  border-radius: 16px;
}

@media (min-width: 768px) {
  .section-group.secondary {
    margin: 0 -24px;
    padding: 28px 24px;
  }
}

.section-group.secondary .group-title { font-size: 17px; color: #334155; }
@media (min-width: 768px) { .section-group.secondary .group-title { font-size: 19px; } }

.toggle-btn {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #64748B;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: background 0.15s;
}

.toggle-btn:hover { background: #F7F8FA; color: #0A0E1A; }
.toggle-btn .arrow { transition: transform 0.2s; display: inline-block; }
.toggle-btn .arrow.open { transform: rotate(180deg); }

.secondary-body { display: flex; flex-direction: column; gap: 16px; }

.two-col { display: grid; gap: 16px; grid-template-columns: 1fr; }
@media (min-width: 960px) { .two-col { grid-template-columns: 1fr 1fr; gap: 16px; } }

/* ===== 카드 공통 디자인 시스템 오버라이드 ===== */
.tab-panel :deep(.section-card),
.tab-panel :deep(.hero-card) {
  margin-bottom: 0 !important;
  border: none !important;
  border-radius: 20px !important;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.05), 0 6px 20px rgba(15, 23, 42, 0.05) !important;
  transition: box-shadow 0.25s ease;
}

.tab-panel :deep(.section-card) {
  background: white !important;
}

/* Hero는 자체 컬러 유지 - 그림자만 살짝 더 */
.tab-panel :deep(.hero-card) {
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04) !important;
}

/* 세컨더리 영역 카드 */
.section-group.secondary :deep(.section-card) {
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.06) !important;
  background: white !important;
  padding: 20px !important;
}

@media (min-width: 768px) {
  .section-group.secondary :deep(.section-card) {
    padding: 24px !important;
  }
}

.section-group.secondary :deep(.section-title) {
  font-size: 14px !important;
  color: #334155 !important;
}

/* ===== 토스트 (토스 스타일 pill + blur) ===== */
.toast {
  position: fixed;
  bottom: 88px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(25, 31, 40, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: white;
  padding: 14px 26px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  z-index: 1000;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

@media (min-width: 768px) { .toast { bottom: 40px; font-size: 15px; padding: 14px 28px; } }

.toast-icon { color: currentColor; flex-shrink: 0; }
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }
</style>
