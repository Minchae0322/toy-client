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

    <!-- 스크롤 래퍼 -->
    <div class="scroll-wrapper">
      <!-- PC 네비 화살표 -->
      <button
          v-if="canScrollLeft"
          class="nav-arrow nav-arrow-left"
          @click="scrollByCards(-1)"
          aria-label="이전"
      >
        <ChevronRight :size="16" :stroke-width="2.6" class="arrow-flip" />
      </button>

      <div ref="scrollRef" class="hot-scroll" @scroll.passive="updateScrollState">
        <router-link
            v-for="(battle, index) in topBattles"
            :key="battle.id || battle.battleId"
            :to="{ name: 'BattleDetail', params: { id: battle.id || battle.battleId } }"
            class="hot-card"
            :class="{ 'is-top': index === 0 }"
        >
          <!-- 사진 (전체 카드) -->
          <div class="card-photo">
            <img
                v-if="getOriginalThumbnail(battle) && !imageErrors.has(battle.id || battle.battleId)"
                :src="getOriginalThumbnail(battle)"
                :alt="battle.title"
                loading="lazy"
                @error="handleImageError(battle.id || battle.battleId)"
            />
            <div v-else class="thumb-placeholder">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          </div>

          <!-- 디자인 요소: 큰 italic 랭크 -->
          <div class="rank-display" aria-hidden="true" :class="getRankClass(index)">
            <Crown v-if="index === 0" :size="13" :stroke-width="2.6" class="rank-crown" />
            <span class="rank-number">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>

          <!-- 상단 배지 -->
          <div class="card-top">
            <span v-if="index === 0" class="badge-hot">
              <span class="live-dot" aria-hidden="true"></span>
              HOT
            </span>
            <span v-else-if="getDdayMeta(battle)" class="badge-dday" :class="getDdayMeta(battle).urgent ? 'urgent' : ''">
              <Flame v-if="getDdayMeta(battle).urgent" :size="10" :stroke-width="2.6" />
              <span>{{ getDdayMeta(battle).text }}</span>
            </span>
          </div>

          <!-- 하단 오버레이 정보 -->
          <div class="card-bottom">
            <h3 class="title">{{ battle.title }}</h3>
            <div class="stats-row">
              <span class="stat">
                <Users :size="11" :stroke-width="2.4" class="stat-icon" />
                <span class="stat-value">{{ formatNumber(battle.totalVotes || 0) }}</span>
              </span>
              <span class="stat-divider" aria-hidden="true"></span>
              <span class="stat">
                <Eye :size="11" :stroke-width="2.4" class="stat-icon" />
                <span class="stat-value">{{ formatNumber(battle.totalViews || 0) }}</span>
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- PC 다음 -->
      <button
          v-if="canScrollRight"
          class="nav-arrow nav-arrow-right"
          @click="scrollByCards(1)"
          aria-label="다음"
      >
        <ChevronRight :size="16" :stroke-width="2.6" />
      </button>
    </div>

    <!-- 모바일 스크롤 진행 인디케이터 -->
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

defineEmits(['battle-click', 'view-all'])

const imageErrors = reactive(new Set())

const topBattles = computed(() => props.battles.slice(0, 5))

// D-Day 메타
const getDdayMeta = (battle) => {
  if (!battle?.endDate) return null
  const diff = new Date(battle.endDate) - new Date()
  if (diff <= 0) return null
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days > 7) return null
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

// 스크롤 상태 (PC 화살표 + 모바일 도트 통합)
const scrollRef = ref(null)
const scrollProgress = ref(0)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const visibleCount = computed(() => topBattles.value.length)
const dotCount = computed(() => Math.max(visibleCount.value, 1))
const showScrollDots = computed(() => visibleCount.value >= 2)
const activeDot = computed(() => {
  if (dotCount.value <= 1) return 0
  const idx = Math.round(scrollProgress.value * (dotCount.value - 1))
  return Math.min(Math.max(idx, 0), dotCount.value - 1)
})

const updateScrollState = () => {
  const el = scrollRef.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  scrollProgress.value = max > 0 ? el.scrollLeft / max : 0
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

const scrollByCards = (direction) => {
  const el = scrollRef.value
  if (!el) return
  const card = el.querySelector('.hot-card')
  const cardWidth = card?.offsetWidth || 200
  const gap = 12
  el.scrollBy({ left: direction * (cardWidth + gap) * 2, behavior: 'smooth' })
}

const handleResize = () => nextTick(updateScrollState)

onMounted(() => {
  nextTick(updateScrollState)
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
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
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
  .hot-section { padding: 24px 0 0; }
}

/* ---------- 헤더 ---------- */
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
  .section-title { font-size: 1.25rem; }
  .title-accent-icon { width: 26px; height: 26px; }
  .sub-title { padding-left: 34px; }
}

@media (min-width: 1280px) {
  .section-title { font-size: 1.4375rem; }
  .title-accent-icon { width: 30px; height: 30px; border-radius: 8px; }
  .sub-title { font-size: 13px; padding-left: 38px; }
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

/* ---------- 스크롤 래퍼 ---------- */
.scroll-wrapper {
  position: relative;
}

.nav-arrow { display: none; }

@media (min-width: 768px) {
  .nav-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--border-strong);
    background: var(--header-blur-bg, rgba(255,255,255,0.92));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
    color: var(--c-text-600);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  }

  .nav-arrow:hover {
    background: var(--bg-elevated);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
    color: var(--text-primary);
    transform: translateY(-50%) scale(1.05);
  }

  .nav-arrow-left { left: -16px; }
  .nav-arrow-right { right: -16px; }
  .arrow-flip { transform: scaleX(-1); }
}

.hot-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 4px;
  overscroll-behavior-x: contain;
}

.hot-scroll::-webkit-scrollbar { display: none; }

/* ---------- 카드 (사진 풀블리드) ---------- */
.hot-card,
.hot-card:link,
.hot-card:visited {
  position: relative;
  flex-shrink: 0;
  width: 172px;
  aspect-ratio: 3 / 4.1;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  color: #ffffff;
  background: #0A0E1A;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 12px 24px rgba(15, 23, 42, 0.12);
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  isolation: isolate;
  scroll-snap-align: start;
}

@media (min-width: 768px) {
  .hot-card,
  .hot-card:link,
  .hot-card:visited {
    width: 198px;
    border-radius: 20px;
    aspect-ratio: 3 / 4;
  }
}

@media (min-width: 1280px) {
  .hot-card,
  .hot-card:link,
  .hot-card:visited {
    width: 218px;
    border-radius: 22px;
    aspect-ratio: 3 / 4;
  }
}

@media (hover: hover) {
  .hot-card:hover {
    transform: translateY(-6px);
    box-shadow:
      0 2px 4px rgba(15, 23, 42, 0.08),
      0 22px 38px rgba(15, 23, 42, 0.18);
  }
}

.hot-card.is-top {
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 12px 28px rgba(249, 115, 22, 0.22);
}

@media (hover: hover) {
  .hot-card.is-top:hover {
    box-shadow:
      0 2px 4px rgba(15, 23, 42, 0.08),
      0 22px 40px rgba(249, 115, 22, 0.28);
  }
}

/* 사진 */
.card-photo {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.card-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (hover: hover) {
  .hot-card:hover .card-photo img { transform: scale(1.06); }
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  background: var(--bg-subtle, #F7F8FA);
}

/* 사진 위 그라데이션 (상하단 가독성) */
.card-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0) 22%,
      rgba(0, 0, 0, 0) 38%,
      rgba(0, 0, 0, 0.55) 64%,
      rgba(0, 0, 0, 0.85) 84%,
      rgba(0, 0, 0, 0.95) 100%);
  pointer-events: none;
}

/* 디자인 요소: 큰 italic 랭크 숫자 */
.rank-display {
  position: absolute;
  top: -6px;
  right: 6px;
  z-index: 1;
  pointer-events: none;
  display: inline-flex;
  align-items: flex-start;
  gap: 2px;
  line-height: 0.85;
  color: rgba(255, 255, 255, 0.92);
  text-shadow:
    0 2px 10px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

.rank-display.rank-first { color: #FACC15; }
.rank-display.rank-second { color: #E2E8F0; }
.rank-display.rank-third { color: #FDBA74; }

.rank-crown {
  margin-top: 14px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.rank-number {
  font-size: 64px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

@media (min-width: 768px) {
  .rank-number { font-size: 74px; }
}

@media (min-width: 1280px) {
  .rank-number { font-size: 84px; }
}

/* 상단 배지 */
.card-top {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: flex;
  gap: 6px;
}

.badge-hot {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px 4px 7px;
  background: var(--c-heat, #F97316);
  border-radius: 100px;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
  line-height: 1;
  box-shadow: 0 3px 10px rgba(249, 115, 22, 0.45);
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6);
  animation: live-pulse 1.6s ease-out infinite;
  flex-shrink: 0;
}

@keyframes live-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.65); }
  60%, 100% { box-shadow: 0 0 0 7px rgba(255, 255, 255, 0); }
}

.badge-dday {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 9px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1;
  border-radius: 100px;
  color: #fff;
  background: rgba(15, 18, 24, 0.62);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.badge-dday.urgent {
  background: var(--c-danger, #EF4444);
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.38);
}

.badge-dday svg { display: block; }

/* 하단 오버레이 정보 */
.card-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 36px 13px 13px;
  color: #ffffff;
}

.title {
  margin: 0 0 9px;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.3;
  letter-spacing: -0.028em;
  word-break: keep-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6),
               0 1px 2px rgba(0, 0, 0, 0.5);
}

@media (min-width: 768px) {
  .title { font-size: 16.5px; margin-bottom: 10px; }
}

@media (min-width: 1280px) {
  .title { font-size: 18px; margin-bottom: 11px; }
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
}

.stat-icon {
  display: block;
  color: #ffffff;
  opacity: 0.95;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.stat-value {
  line-height: 1;
  color: #ffffff;
}

.stat-divider {
  width: 1px;
  height: 11px;
  background: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .stat { font-size: 13px; gap: 6px; }
  .stat-icon { width: 12px; height: 12px; }
  .stat-divider { height: 12px; }
}

@media (min-width: 1280px) {
  .stat { font-size: 13.5px; }
  .stat-icon { width: 13px; height: 13px; }
  .stat-divider { height: 13px; }
}

/* ---------- 스크롤 도트 (모바일) ---------- */
.scroll-dots {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 12px;
}

.scroll-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--c-text-300, #CBD5E1);
  transition: width 0.2s ease, background 0.2s ease;
}

.scroll-dot.active {
  width: 18px;
  background: var(--c-heat, #F97316);
}

@media (max-width: 767px) {
  .scroll-dots { display: flex; }
}

@media (prefers-reduced-motion: reduce) {
  .hot-card,
  .card-photo img,
  .live-dot {
    animation: none;
    transition: none;
  }
}
</style>
