<template>
  <section v-if="battles.length > 0" class="hot-section">
    <!-- 헤더 -->
    <div class="section-header">
      <div class="title-with-badge">
        <h2 class="section-title">
          <span class="title-accent-icon" aria-hidden="true">
            <Flame :size="16" :stroke-width="2.4" />
          </span>
          실시간 <span class="title-accent">HOT</span>
        </h2>
        <span class="sub-title">지금 가장 뜨거운 승부</span>
      </div>
      <button class="view-all-btn" @click="$emit('view-all')">
        <span>더보기</span>
        <ChevronRight :size="14" :stroke-width="2.2" />
      </button>
    </div>

    <!-- 배틀 리스트 -->
    <div ref="scrollRef" class="hot-scroll" @scroll.passive="updateScrollProgress">
      <router-link
          v-for="(battle, index) in topBattles"
          :key="battle.id || battle.battleId"
          :to="{ name: 'BattleDetail', params: { id: battle.id || battle.battleId } }"
          class="hot-card"
          :class="{ 'is-top': index === 0 }"
      >
        <!-- 썸네일 -->
        <div class="thumb">
          <img
              v-if="getOriginalThumbnail(battle) && !imageErrors.has(battle.id || battle.battleId)"
              :src="getOriginalThumbnail(battle)"
              :alt="battle.title"
              loading="lazy"
              @error="handleImageError(battle.id || battle.battleId)"
          />
          <div v-else class="thumb-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>

          <!-- 순위 메달 -->
          <div class="rank-medal" :class="getRankClass(index)">
            <Crown v-if="index === 0" :size="11" :stroke-width="2.6" />
            <span class="rank-num">{{ index + 1 }}</span>
          </div>

          <!-- #1 HOT 라이브 펄스 -->
          <span v-if="index === 0" class="hot-badge">
            <span class="live-dot" aria-hidden="true"></span>
            HOT
          </span>

          <!-- D-Day (≤7일 진행중) -->
          <span v-else-if="getDdayMeta(battle)" class="dday-badge" :class="getDdayMeta(battle).urgent ? 'urgent' : ''">
            <Flame v-if="getDdayMeta(battle).urgent" :size="10" :stroke-width="2.6" />
            <span>{{ getDdayMeta(battle).text }}</span>
          </span>

          <!-- 상대 인기도 메터 -->
          <div class="heat-meter" aria-hidden="true">
            <span class="heat-fill" :style="{ width: heatRatio(battle.totalVotes) + '%' }"></span>
          </div>
        </div>

        <!-- 정보 -->
        <div class="info">
          <span class="category-chip">{{ getCategoryName(battle) }}</span>
          <h3 class="title">{{ battle.title }}</h3>
          <div class="stats-row">
            <span class="stat">
              <Users :size="12" :stroke-width="2.2" class="stat-icon" />
              <span class="stat-value">{{ formatNumber(battle.totalVotes || 0) }}</span>
            </span>
            <span class="stat-divider" aria-hidden="true"></span>
            <span class="stat">
              <Eye :size="12" :stroke-width="2.2" class="stat-icon" />
              <span class="stat-value">{{ formatNumber(battle.totalViews || 0) }}</span>
            </span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- 모바일 스크롤 진행 인디케이터 (4개 이상일 때) -->
    <div v-if="showScrollDots" class="scroll-dots" aria-hidden="true">
      <span
          v-for="i in dotCount"
          :key="`dot-${i}`"
          class="scroll-dot"
          :class="{ active: activeDot === i - 1 }"
      ></span>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Flame, ChevronRight, Crown, Users, Eye } from 'lucide-vue-next'

const props = defineProps({
  battles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['battle-click', 'view-all'])

const imageErrors = reactive(new Set())

// Top 5 슬라이스
const topBattles = computed(() => props.battles.slice(0, 5))

// 상대 인기도 (1위 totalVotes 대비 비율)
const maxHotVotes = computed(() => {
  return topBattles.value.reduce((max, b) => Math.max(max, b.totalVotes || 0), 0) || 1
})

const heatRatio = (votes) => {
  const r = ((votes || 0) / maxHotVotes.value) * 100
  // 최소 10% 보이게 (시각적 hint)
  return Math.max(Math.min(r, 100), 10)
}

// 카테고리 추출
const getCategoryName = (battle) => {
  return battle?.subCategoryDetail?.subCategoryName
      || battle?.categoryName
      || '기타'
}

// D-Day 메타 (≤7일 진행중일 때만)
const getDdayMeta = (battle) => {
  if (!battle?.endDate) return null
  const diff = new Date(battle.endDate) - new Date()
  if (diff <= 0) return null
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days > 7) return null
  // 진행중 상태 확인
  const status = battle?.status?.title || battle?.status
  const isActive = battle?.isActive !== undefined
      ? battle.isActive
      : (status === 'ACTIVE' || status === 'NORMAL')
  if (!isActive) return null
  return {
    text: days === 0 ? '오늘 마감' : `D-${days}`,
    urgent: days <= 3
  }
}

// 스크롤 진행 인디케이터 (모바일 한정)
const scrollRef = ref(null)
const scrollProgress = ref(0)

const visibleCount = computed(() => topBattles.value.length)
const dotCount = computed(() => Math.max(visibleCount.value, 1))
const showScrollDots = computed(() => visibleCount.value >= 2)
const activeDot = computed(() => {
  if (dotCount.value <= 1) return 0
  const idx = Math.round(scrollProgress.value * (dotCount.value - 1))
  return Math.min(Math.max(idx, 0), dotCount.value - 1)
})

const updateScrollProgress = () => {
  const el = scrollRef.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  scrollProgress.value = max > 0 ? el.scrollLeft / max : 0
}

const handleResize = () => nextTick(updateScrollProgress)

onMounted(() => {
  nextTick(updateScrollProgress)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return `${Math.floor(num / 10000)}만`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

const getOriginalThumbnail = (battle) => {
  return battle?.thumbnailDto?.fileUrl
      || battle?.thumbnailFile?.fileUrl
      || battle?.topItemImages?.[0]
      || null
}

const getRankClass = (index) => {
  if (index === 0) return 'first'
  if (index === 1) return 'second'
  if (index === 2) return 'third'
  return ''
}

const handleImageError = (battleId) => {
  imageErrors.add(battleId)
}
</script>

<style scoped>
.hot-section {
  padding: 20px 0 0;
}

@media (min-width: 768px) {
  .hot-section {
    padding: 24px 0 0;
  }
}

/* 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
}

.title-with-badge {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 1.1875rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.title-accent-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: var(--c-heat-soft);
  color: var(--c-heat);
}

.section-title .title-accent {
  color: var(--c-heat);
  font-weight: 800;
  letter-spacing: -0.04em;
}

.sub-title {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--c-text-400);
  padding-left: 32px;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 1.25rem;
  }
  .title-accent-icon {
    width: 26px;
    height: 26px;
  }
  .sub-title {
    padding-left: 34px;
  }
}

@media (min-width: 1280px) {
  .section-title {
    font-size: 1.4375rem;
  }
  .title-accent-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
  }
  .sub-title {
    font-size: 13px;
    padding-left: 38px;
  }
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text-400);
  background: none;
  border: none;
  padding: 6px 4px 6px 8px;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.02em;
  border-radius: 8px;
  transition: color 0.15s ease, background 0.15s ease;
  white-space: nowrap;
}

.view-all-btn:hover {
  color: var(--text-primary);
  background: var(--bg-subtle);
}

/* 스크롤 - 항상 가로 한 줄 */
.hot-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.hot-scroll::-webkit-scrollbar {
  display: none;
}

/* 모바일 한정: scroll-snap (PC는 자유 스크롤 유지) */
@media (max-width: 767px) {
  .hot-scroll {
    scroll-snap-type: x mandatory;
    scroll-padding-left: 4px;
    overscroll-behavior-x: contain;
  }
  .hot-card {
    scroll-snap-align: start;
  }
}

/* 카드 */
.hot-card {
  position: relative;
  flex-shrink: 0;
  width: 180px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
              border-color 0.22s ease,
              box-shadow 0.22s ease;
}

.hot-card:hover {
  transform: translateY(-2px);
  border-color: transparent;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.07), 0 2px 6px rgba(15, 23, 42, 0.04);
}

.hot-card.is-top {
  border-color: rgba(249, 115, 22, 0.35);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.08);
}

.hot-card.is-top:hover {
  border-color: transparent;
  box-shadow: 0 10px 26px rgba(249, 115, 22, 0.18), 0 2px 8px rgba(15, 23, 42, 0.05);
}

@media (min-width: 768px) {
  .hot-card {
    width: 200px;
  }
}

@media (min-width: 1280px) {
  .hot-card {
    width: 220px;
  }
}

/* 썸네일 4:3 */
.thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--bg-subtle);
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.hot-card:hover .thumb img {
  transform: scale(1.03);
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-300);
}

/* 순위 메달 */
.rank-medal {
  position: absolute;
  top: 8px;
  left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px 4px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1;
  background: rgba(15, 18, 24, 0.62);
  backdrop-filter: saturate(140%) blur(10px);
  -webkit-backdrop-filter: saturate(140%) blur(10px);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.rank-medal .rank-num {
  font-variant-numeric: tabular-nums;
}

.rank-medal svg {
  display: block;
}

.rank-medal.first {
  background: var(--c-gold);
  color: #422c0a;
  box-shadow: 0 3px 10px rgba(234, 179, 8, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.rank-medal.second {
  background: var(--c-silver);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(148, 163, 184, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.rank-medal.third {
  background: var(--c-bronze);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(217, 119, 6, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* HOT 뱃지 (#1 전용 — 라이브 펄스) */
.hot-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px 4px 7px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #ffffff;
  background: var(--c-heat);
  border-radius: 999px;
  line-height: 1;
  box-shadow: 0 3px 10px rgba(249, 115, 22, 0.4);
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6);
  animation: live-pulse 1.6s ease-out infinite;
  flex-shrink: 0;
}

@keyframes live-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.65); }
  60%, 100% { box-shadow: 0 0 0 7px rgba(255, 255, 255, 0); }
}

/* D-Day (1위 외) */
.dday-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1;
  border-radius: 999px;
  color: #ffffff;
  background: rgba(15, 18, 24, 0.62);
  backdrop-filter: saturate(140%) blur(10px);
  -webkit-backdrop-filter: saturate(140%) blur(10px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.dday-badge.urgent {
  background: var(--c-danger);
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.35);
}

.dday-badge svg {
  display: block;
}

/* 상대 인기도 메터 */
.heat-meter {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: rgba(15, 18, 24, 0.18);
}

.heat-fill {
  display: block;
  height: 100%;
  background: var(--c-heat);
  transform-origin: left center;
  animation: heat-grow 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.is-top .heat-fill {
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
}

@keyframes heat-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* 정보 */
.info {
  padding: 10px 11px 12px;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  height: 19px;
  padding: 0 7px;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--c-text-500);
  background: var(--bg-subtle);
  border-radius: 999px;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title {
  margin: 0 0 8px;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.35em * 2);
  letter-spacing: -0.025em;
  word-break: keep-all;
  transition: color 0.18s ease;
}

.hot-card:hover .title {
  color: var(--c-brand);
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--c-text-600);
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.stat-icon {
  display: block;
  color: var(--c-text-400);
  flex-shrink: 0;
}

.stat-value {
  line-height: 1;
}

.stat-divider {
  width: 1px;
  height: 10px;
  background: var(--border-strong);
  flex-shrink: 0;
}

/* 스크롤 진행 인디케이터 (모바일 한정) */
.scroll-dots {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 10px;
}

.scroll-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--c-text-300);
  transition: width 0.2s ease, background 0.2s ease;
}

.scroll-dot.active {
  width: 16px;
  background: var(--c-heat);
}

@media (max-width: 767px) {
  .scroll-dots {
    display: flex;
  }
}

/* 큰 화면 */
@media (min-width: 1280px) {
  .section-header {
    margin-bottom: 18px;
  }

  .hot-scroll {
    gap: 18px;
  }

  .hot-card {
    border-radius: 16px;
  }

  .rank-medal {
    top: 10px;
    left: 10px;
    padding: 5px 10px 5px 9px;
    font-size: 12px;
  }

  .rank-medal svg {
    width: 13px;
    height: 13px;
  }

  .hot-badge {
    top: 10px;
    right: 10px;
    padding: 5px 11px 5px 9px;
    font-size: 11px;
  }

  .live-dot {
    width: 7px;
    height: 7px;
  }

  .dday-badge {
    top: 10px;
    right: 10px;
    font-size: 11px;
    padding: 5px 10px;
  }

  .heat-meter {
    height: 4px;
  }

  .info {
    padding: 12px 14px 14px;
  }

  .category-chip {
    height: 22px;
    font-size: 11px;
    padding: 0 9px;
    margin-bottom: 8px;
  }

  .title {
    font-size: 15px;
    margin-bottom: 10px;
  }

  .stat {
    font-size: 12px;
  }

  .stat-icon {
    width: 13px;
    height: 13px;
  }

  .stat-divider {
    height: 11px;
  }
}

@media (min-width: 1536px) {
  .hot-scroll {
    gap: 22px;
  }

  .hot-card {
    border-radius: 18px;
  }

  .rank-medal {
    top: 12px;
    left: 12px;
    padding: 6px 12px 6px 10px;
    font-size: 13px;
  }

  .hot-badge {
    top: 12px;
    right: 12px;
    padding: 6px 12px 6px 10px;
    font-size: 12px;
  }

  .dday-badge {
    top: 12px;
    right: 12px;
    font-size: 11.5px;
    padding: 6px 11px;
  }

  .info {
    padding: 14px 16px 16px;
  }

  .title {
    font-size: 15.5px;
  }

  .stat {
    font-size: 12.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hot-card,
  .thumb img,
  .live-dot,
  .heat-fill {
    animation: none;
    transition: none;
  }
}
</style>