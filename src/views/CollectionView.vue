<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
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
            <LevelCard :user="currentUser" :streak="streak" @use-ticket="onUseTicket" />
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
              <ExpGuide />
              <ExpHistory :history="currentUser.recentExpHistory" />
            </div>
          </section>
        </div>

        <!-- 숙련도 탭 -->
        <div v-else-if="currentTab === 'proficiency'" class="tab-panel">
          <ProficiencySection :user-id="authStore.userId" />
        </div>

        <!-- 예측 탭 -->
        <div v-else-if="currentTab === 'prediction'" class="tab-panel">
          <PredictionHistory :user-id="authStore.userId" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { rewardsService } from '@/services/RewardsService.js'
import { showExpGrant } from '@/composables/useExpToast'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import LevelCard from '@/components/collection/LevelCard.vue'
import BadgeCollection from '@/components/collection/BadgeCollection.vue'
import ExpGuide from '@/components/collection/ExpGuide.vue'
import ExpHistory from '@/components/collection/ExpHistory.vue'
import BadgeDetailModal from '@/components/collection/BadgeDetailModal.vue'
import DailyMissions from '@/components/collection/DailyMissions.vue'
import ProficiencySection from '@/components/collection/ProficiencySection.vue'
import PredictionHistory from '@/components/collection/PredictionHistory.vue'
import {
  Gift,
  Ticket,
  Pin,
  AlertCircle,
  Award,
  Target,
  CheckCircle2,
} from '@/utils/collectionIcons.js'

const authStore = useAuthStore()

const tabs = [
  { id: 'rewards', icon: Gift, label: '보상' },
  { id: 'proficiency', icon: Award, label: '숙련도' },
  { id: 'prediction', icon: Target, label: '예측' },
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
  recentExpHistory: [],
})

const badgeDetail = ref(null)
const currentTab = ref('rewards')
const guideExpanded = ref(false)

const streak = ref(null)
const missions = ref([])
const pinnedIds = ref([])
const earnedBadges = ref([])
const unearnedBadges = ref([])
const totalBadgeCount = ref(0)

const toast = ref(null)
let toastTimer = null

const claimedMissionCount = computed(() => missions.value.filter((m) => m.status === 'CLAIMED').length)
const readyMissionCount = computed(() => missions.value.filter((m) => m.status === 'COMPLETED').length)

const sortedMissions = computed(() => {
  const order = { COMPLETED: 0, IN_PROGRESS: 1, CLAIMED: 2 }
  return [...missions.value].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))
})

const nearCompleteBadges = computed(() =>
  unearnedBadges.value.filter((b) => b.progress && (b.progress.current / b.progress.target) >= 0.7)
)

function scrollToMissions() {
  const el = document.getElementById('missions-section')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function loadRewardData() {
  try {
    const [rewardsRes, streakRes, missionsRes, badgesRes] = await Promise.all([
      rewardsService.getMyRewards(),
      rewardsService.getMyStreak(),
      rewardsService.getDailyMissions(),
      rewardsService.getMyBadges(),
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
    const missionData = missionsRes?.data
    missions.value = Array.isArray(missionData) ? missionData : []

    // 뱃지 (서버는 List<UserBadgeInfo> 플랫 리스트 반환)
    const badgeList = Array.isArray(badgesRes?.data) ? badgesRes.data : []
    earnedBadges.value = badgeList
    unearnedBadges.value = []
    totalBadgeCount.value = badgeList.length
    pinnedIds.value = badgeList.filter(b => b.pinned).map(b => b.id)
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

async function onClaimMission(mission) {
  try {
    const result = await rewardsService.claimMission(mission.missionId)
    const claimed = result?.data
    const found = missions.value.find((m) => m.id === claimed?.id)
    if (found) found.status = 'CLAIMED'
    showExpGrant(claimed?.expGrant, { mode: 'full' })
  } catch (e) {
    showToast(AlertCircle, '보상을 받을 수 없습니다')
  }
}

async function onTogglePin(badge) {
  try {
    const isPinned = pinnedIds.value.includes(badge.id)
    if (isPinned) {
      await rewardsService.unpinBadge(badge.id)
    } else {
      await rewardsService.pinBadge(badge.id)
    }
    const updatedRes = await rewardsService.getMyBadges()
    const list = Array.isArray(updatedRes?.data) ? updatedRes.data : []
    pinnedIds.value = list.filter(b => b.pinned).map(b => b.id)
    showToast(Pin, isPinned ? '고정이 해제됐어요' : '프로필에 고정됐어요')
  } catch (e) {
    showToast(AlertCircle, '오류가 발생했어요')
  }
}

onMounted(loadRewardData)
</script>

<style scoped>
/* ===== 컨테이너 (Neo-Brutalism) ===== */
.app-container {
  background: #FFFFFF;
  min-height: 100vh;
  color: #0A0E1A;
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
  padding-bottom: 5rem;
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
  color: #0A0E1A;
  letter-spacing: -1.2px;
  line-height: 1.05;
  text-transform: uppercase;
}

@media (min-width: 768px) { .page-title { font-size: 38px; letter-spacing: -1.6px; } }

.page-subtitle {
  font-size: 12px;
  color: #0A0E1A;
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
  background: #FFFFFF;
  border: 2px solid #0A0E1A;
  border-radius: 4px;
  box-shadow: 4px 4px 0 #0A0E1A;
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
  color: #0A0E1A;
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
  color: #0A0E1A;
  background: #FAFAF5;
}

.tab:active { transform: scale(0.96); }

.tab.active {
  color: #0A0E1A;
  background: #B4FF39;
  border-color: #0A0E1A;
  box-shadow: 2px 2px 0 #0A0E1A;
}

.tab.active .tab-icon { color: #0A0E1A; }

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
  border: 2px solid #0A0E1A;
  flex-shrink: 0;
}

.accent-purple .accent-dot { background: #B4FF39; }
.accent-gold .accent-dot { background: #FFD93D; }
.accent-orange .accent-dot { background: #FF6B35; }
.accent-green .accent-dot { background: #4ADE80; }
.accent-gray .accent-dot { background: #FFFFFF; }

.group-title {
  font-size: 18px;
  font-weight: 900;
  color: #0A0E1A;
  letter-spacing: -0.5px;
  line-height: 1.15;
  text-transform: uppercase;
}

@media (min-width: 768px) { .group-title { font-size: 22px; } }

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

/* ===== Claim ready 배너 (Neo-Brutalism) ===== */
.claim-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: #B4FF39;
  border: 2px solid #0A0E1A;
  border-radius: 4px;
  box-shadow: 4px 4px 0 #0A0E1A;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.banner-text { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }

.banner-icon {
  width: 40px;
  height: 40px;
  border-radius: 2px;
  background: #0A0E1A;
  color: #B4FF39;
  border: 2px solid #0A0E1A;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-title {
  font-size: 14px;
  font-weight: 900;
  color: #0A0E1A;
  letter-spacing: -0.3px;
  line-height: 1.25;
  text-transform: uppercase;
}

.banner-sub {
  font-size: 12px;
  color: #0A0E1A;
  margin-top: 3px;
  font-weight: 700;
}

.banner-btn {
  padding: 10px 16px;
  border: 2px solid #0A0E1A;
  border-radius: 2px;
  background: #0A0E1A;
  color: #B4FF39;
  font-size: 12.5px;
  font-weight: 900;
  font-family: inherit;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
  flex-shrink: 0;
  box-shadow: 3px 3px 0 #FFFFFF;
}

.banner-btn:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 #FFFFFF; }
.banner-btn:active { transform: translate(2px, 2px); box-shadow: 0 0 0 #FFFFFF; }

@media (max-width: 480px) {
  .claim-banner { flex-direction: column; align-items: stretch; }
  .banner-btn { width: 100%; }
}

/* 세컨더리 — Neo-Brutalism 블록 */
.section-group.secondary {
  background: #FFFFFF;
  border: 2px solid #0A0E1A;
  margin: 0;
  padding: 24px 20px;
  border-radius: 4px;
  box-shadow: 4px 4px 0 #0A0E1A;
}

@media (min-width: 768px) {
  .section-group.secondary {
    padding: 28px 24px;
  }
}

.section-group.secondary .group-title { font-size: 17px; color: #334155; }
@media (min-width: 768px) { .section-group.secondary .group-title { font-size: 19px; } }

.toggle-btn {
  border: 2px solid #0A0E1A;
  background: #FFFFFF;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  color: #0A0E1A;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 2px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 2px 2px 0 #0A0E1A;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}

.toggle-btn:hover { background: #B4FF39; }
.toggle-btn:active { transform: translate(2px, 2px); box-shadow: 0 0 0 #0A0E1A; }
.toggle-btn .arrow { transition: transform 0.2s; display: inline-block; }
.toggle-btn .arrow.open { transform: rotate(180deg); }

.secondary-body { display: flex; flex-direction: column; gap: 16px; }

/* ===== 카드 공통 오버라이드 (Neo-Brutalism) ===== */
.tab-panel :deep(.section-card),
.tab-panel :deep(.hero-card) {
  margin-bottom: 0 !important;
  border: 2px solid #0A0E1A !important;
  border-radius: 4px !important;
  box-shadow: 5px 5px 0 #0A0E1A !important;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.tab-panel :deep(.section-card) {
  background: white !important;
}

.tab-panel :deep(.hero-card) {
  box-shadow: 6px 6px 0 #0A0E1A !important;
}

.tab-panel :deep(.section-card):hover,
.tab-panel :deep(.hero-card):hover {
  transform: translate(-1px, -1px);
  box-shadow: 6px 6px 0 #0A0E1A !important;
}

/* 세컨더리 영역 카드 */
.section-group.secondary :deep(.section-card) {
  border: 2px solid #0A0E1A !important;
  box-shadow: 3px 3px 0 #0A0E1A !important;
  background: white !important;
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
  color: #334155 !important;
}

/* ===== 토스트 (Neo-Brutalism) ===== */
.toast {
  position: fixed;
  bottom: 88px;
  left: 50%;
  transform: translateX(-50%);
  background: #0A0E1A;
  color: #B4FF39;
  padding: 12px 20px;
  border: 2px solid #0A0E1A;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 4px 4px 0 #B4FF39, 4px 4px 0 2px #0A0E1A;
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
</style>
