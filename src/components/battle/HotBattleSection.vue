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
          v-for="(battle, index) in battles.slice(0, 5)"
          :key="battle.id || battle.battleId"
          :to="{ name: 'BattleDetail', params: { id: battle.id || battle.battleId } }"
          class="hot-card"
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

          <!-- 순위 뱃지 -->
          <div class="rank-badge" :class="getRankClass(index)">
            {{ index + 1 }}
          </div>

          <!-- 1위 HOT 뱃지 -->
          <span class="hot-badge">HOT</span>
        </div>

        <!-- 정보 -->
        <div class="info">
          <h3 class="title">{{ battle.title }}</h3>
          <div class="stats-row">
            <span class="stat">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {{ formatNumber(battle.totalParticipants || 0) }}
            </span>
            <span class="stat">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {{ formatNumber(battle.totalVotes || 0) }}
            </span>
            <span class="stat">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
              </svg>
              {{ formatNumber(battle.totalViews || 0) }}
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
import { Flame, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  battles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['battle-click', 'view-all'])

const imageErrors = reactive(new Set())

// 스크롤 진행 인디케이터 (모바일 한정)
const scrollRef = ref(null)
const scrollProgress = ref(0)

const visibleCount = computed(() => Math.min(props.battles.length, 5))
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
  flex-shrink: 0;
  width: 180px;
  background: var(--bg-elevated);
  border: 1px solid var(--bg-subtle);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}

.hot-card:hover {
  border-color: var(--border-strong);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
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

/* 순위 뱃지 */
.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: var(--bg-elevated);
  color: var(--c-text-500);
}

.rank-badge.first {
  background: var(--c-gold);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(234, 179, 8, 0.28);
}

.rank-badge.second {
  background: var(--c-silver);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(148, 163, 184, 0.28);
}

.rank-badge.third {
  background: var(--c-bronze);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.28);
}

/* HOT 뱃지 */
.hot-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 7px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: #ffffff;
  background: var(--c-heat);
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.25);
}

/* 정보 */
.info {
  padding: 8px 10px;
}

.title {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-600);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 36px;
  letter-spacing: -0.01em;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-400);
}

.stat-icon {
  width: 12px;
  height: 12px;
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

/* 스켈레톤 */
.skeleton {
  pointer-events: none;
}

.skeleton-thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--bg-subtle) 50%, var(--bg-subtle) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skeleton-line {
  height: 13px;
  width: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--bg-subtle) 50%, var(--bg-subtle) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 40%;
  height: 10px;
}

.skeleton-line.tiny {
  width: 50%;
  height: 10px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 큰 화면 */
@media (min-width: 1280px) {
  .section-header {
    margin-bottom: 18px;
  }

  .hot-scroll {
    gap: 20px;
  }

  .hot-card {
    border-radius: 14px;
  }

  .thumb {
    aspect-ratio: 4 / 3;
  }

  .rank-badge {
    top: 10px;
    left: 10px;
    width: 28px;
    height: 28px;
    font-size: 13px;
    border-radius: 8px;
  }

  .hot-badge {
    top: 10px;
    right: 10px;
    padding: 3px 8px;
    font-size: 11px;
  }

  .info {
    padding: 10px 12px;
  }

  .title {
    font-size: 14px;
    margin-bottom: 8px;
    min-height: 40px;
  }

  .stat {
    font-size: 11px;
  }

  .stat-icon {
    width: 13px;
    height: 13px;
  }
}

@media (min-width: 1536px) {
  .hot-scroll {
    gap: 24px;
  }

  .hot-card {
    border-radius: 16px;
  }

  .thumb {
    aspect-ratio: 4 / 3;
  }

  .rank-badge {
    top: 12px;
    left: 12px;
    width: 32px;
    height: 32px;
    font-size: 14px;
    border-radius: 8px;
  }

  .hot-badge {
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    font-size: 12px;
  }

  .info {
    padding: 12px 14px;
  }

  .title {
    font-size: 15px;
    margin-bottom: 8px;
    min-height: 44px;
  }

  .stat {
    font-size: 12px;
  }

  .stat-icon {
    width: 13px;
    height: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hot-card,
  .thumb img,
  .skeleton-thumb,
  .skeleton-line {
    animation: none;
    transition: none;
  }
}
</style>