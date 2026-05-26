<template>
  <section class="dashboard-pick">
    <DashboardSectionHeader
      prefix="오늘의"
      accent="요거픽"
      sub="투표로 가리는 진짜 1픽"
      :to="{ name: 'BattleList' }"
    />

    <!-- 히어로 (1번째 요거픽) -->
    <router-link
      v-if="!loading && featuredBattle"
      :to="{ name: 'BattleDetail', params: { id: featuredBattle.id } }"
      class="pick-hero"
    >
      <!-- 큰 배경 비주얼 -->
      <div class="hero-visual">
        <img
          v-if="featuredBattle.thumbnailDto?.fileUrl"
          :src="featuredBattle.thumbnailDto.fileUrl"
          :alt="featuredBattle.title"
          @error="handleImageError"
        />
        <div v-else class="hero-thumb-none">Y</div>

        <!-- 상단 메타 칩 -->
        <div class="hero-meta-row">
          <span class="hero-tag live"><span class="dot"></span>LIVE</span>
          <span v-if="getDdayText(featuredBattle.endDate)" class="hero-tag">{{ getDdayText(featuredBattle.endDate) }}</span>
        </div>

        <!-- 하단 제목 + 참여자 -->
        <div class="hero-title-row">
          <h3 class="hero-title">{{ featuredBattle.title }}</h3>
          <span class="hero-votes">{{ formatNumber(featuredBattle.totalVotes) }}명 참여</span>
        </div>
      </div>

      <!-- 1·2위 후보 비교 (스택형) -->
      <div class="hero-compare" v-if="featuredBattle.topItems?.length > 0">
        <div class="cmp-row cmp-leader">
          <div class="cmp-info">
            <span class="cmp-badge">1</span>
            <span class="cmp-name">{{ truncateName(featuredBattle.topItems[0]?.displayName, 18) }}</span>
          </div>
          <span class="cmp-pct">{{ formatPercent(featuredBattle.topItems[0]?.votePercentage) }}%</span>
        </div>
        <div class="cmp-track">
          <div class="cmp-fill is-lead" :style="{ width: formatPercent(featuredBattle.topItems[0]?.votePercentage) + '%' }"></div>
        </div>

        <div class="cmp-row cmp-runner" v-if="featuredBattle.topItems[1]">
          <div class="cmp-info">
            <span class="cmp-badge runner">2</span>
            <span class="cmp-name">{{ truncateName(featuredBattle.topItems[1]?.displayName, 18) }}</span>
          </div>
          <span class="cmp-pct runner">{{ formatPercent(featuredBattle.topItems[1]?.votePercentage) }}%</span>
        </div>
        <div class="cmp-track" v-if="featuredBattle.topItems[1]">
          <div class="cmp-fill" :style="{ width: formatPercent(featuredBattle.topItems[1]?.votePercentage) + '%' }"></div>
        </div>

        <div class="hero-cta">
          한 표 던지러 가기
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </router-link>

    <!-- 히어로 로딩 스켈레톤 -->
    <div v-else-if="loading" class="pick-hero skeleton-hero">
      <div class="skeleton hero-sk-img"></div>
      <div class="hero-sk-body">
        <div class="skeleton" style="height: 14px; width: 50%; margin-bottom: 12px;"></div>
        <div class="skeleton" style="height: 8px; width: 100%; border-radius: 10px; margin-bottom: 14px;"></div>
        <div class="skeleton" style="height: 14px; width: 40%; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 8px; width: 100%; border-radius: 10px;"></div>
      </div>
    </div>

    <!-- 엠티 -->
    <div v-else-if="hotBattles.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
      <p class="empty-text">진행 중인 요거픽이 없어요</p>
      <router-link :to="{ name: 'BattleList' }" class="empty-cta">요거픽 둘러보기</router-link>
    </div>

    <!-- 더 많은 픽 — 컴팩트 카드 그리드 -->
    <div v-if="restBattles.length > 0" class="rest-grid">
      <router-link
        v-for="battle in restBattles"
        :key="battle.id"
        :to="{ name: 'BattleDetail', params: { id: battle.id } }"
        class="rest-card"
      >
        <div class="rest-thumb">
          <img
            v-if="battle.thumbnailDto?.fileUrl"
            :src="battle.thumbnailDto.fileUrl"
            :alt="battle.title"
            loading="lazy"
            @error="handleImageError"
          />
          <div v-else class="rest-thumb-none">Y</div>
          <span v-if="getDdayText(battle.endDate)" class="rest-dday">{{ getDdayText(battle.endDate) }}</span>
        </div>
        <div class="rest-body">
          <h4 class="rest-title">{{ battle.title }}</h4>
          <div class="rest-meta">
            <span class="rest-votes">{{ formatNumber(battle.totalVotes) }}명 참여</span>
            <span v-if="battle.topItems?.[0]" class="rest-lead-pct">{{ formatPercent(battle.topItems[0].votePercentage) }}%</span>
          </div>
          <div class="rest-track" v-if="battle.topItems?.[0]">
            <div class="rest-fill" :style="{ width: formatPercent(battle.topItems[0].votePercentage) + '%' }"></div>
          </div>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { battleService } from '@/services/BattleService'
import DashboardSectionHeader from './DashboardSectionHeader.vue'

const hotBattles = ref([])
const loading = ref(true)

const featuredBattle = computed(() => hotBattles.value[0] || null)
const restBattles = computed(() => hotBattles.value.slice(1, 5))

const loadHotBattles = async () => {
  loading.value = true
  try {
    const response = await battleService.getHotBattleList()
    if (response.success) {
      hotBattles.value = response.data || []
    }
  } catch (error) {
    console.error('배틀 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return Math.floor(num / 10000) + '만'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatPercent = (votePercentage) => {
  if (!votePercentage) return 0
  return Math.round(votePercentage * 100)
}

const getDdayText = (endDate) => {
  if (!endDate) return ''
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays < 0 || diffDays > 7) return ''
  if (diffDays === 0) return 'D-Day'
  return `D-${diffDays}`
}

const truncateName = (name, maxLength = 12) => {
  if (!name) return '-'
  return name.length > maxLength ? name.slice(0, maxLength) + '…' : name
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  loadHotBattles()
})
</script>

<style scoped>
.dashboard-pick {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 768px) {
  .dashboard-pick { gap: 28px; }
}

/* ===== 히어로 카드 ===== */
.pick-hero {
  display: block;
  background: var(--bg-base);
  border: 1px solid var(--border-default, #F1F3F6);
  border-radius: 20px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.pick-hero:hover { border-color: var(--border-strong, #E5E7EB); }
.pick-hero:active { transform: scale(0.995); }

/* 상단 비주얼 */
.hero-visual {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--bg-mute, #F2F4F6);
  overflow: hidden;
}

.hero-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-thumb-none {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: var(--c-text-400);
  font-size: 48px;
  background: var(--bg-mute);
}

.hero-meta-row {
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 100px;
  letter-spacing: 0.02em;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.hero-tag.live {
  background: var(--c-danger, #EF4444);
}

.hero-tag.live .dot {
  width: 5px;
  height: 5px;
  background: #fff;
  border-radius: 50%;
  animation: live-pulse 1.5s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-title-row {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 18px 16px;
  background: linear-gradient(to top, rgba(10, 14, 26, 0.85) 0%, rgba(10, 14, 26, 0.4) 55%, transparent 100%);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  z-index: 1;
}

.hero-title {
  font-size: 17px;
  font-weight: 800;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
  flex: 1;
  min-width: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-votes {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 1·2위 비교 영역 */
.hero-compare {
  padding: 20px 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cmp-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.cmp-info {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.cmp-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--c-brand);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

.cmp-badge.runner {
  background: var(--c-text-400, #94A3B8);
}

.cmp-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.cmp-pct {
  font-size: 22px;
  font-weight: 800;
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  flex-shrink: 0;
  line-height: 1;
}

.cmp-pct.runner {
  font-size: 16px;
  color: var(--c-text-500, #64748B);
}

.cmp-track {
  height: 8px;
  background: var(--bg-subtle, #F7F8FA);
  border-radius: 100px;
  overflow: hidden;
  margin: -2px 0 6px;
}

.cmp-fill {
  height: 100%;
  background: var(--c-text-300, #CBD5E1);
  border-radius: 100px;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.cmp-fill.is-lead {
  background: var(--c-brand);
}

.cmp-row.cmp-runner {
  margin-top: 4px;
}

.hero-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  margin-top: 8px;
  padding: 13px 16px;
  background: var(--c-ink-900, #0A0E1A);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  letter-spacing: -0.01em;
  transition: background 0.15s ease;
}

.pick-hero:hover .hero-cta {
  background: var(--c-ink-700, #1E293B);
}

/* ===== 더 많은 픽 — 컴팩트 카드 그리드 ===== */
.rest-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .rest-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}

@media (min-width: 1024px) {
  .rest-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

.rest-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--bg-base);
  border: 1px solid var(--border-default, #F1F3F6);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.rest-card:hover {
  border-color: var(--border-strong, #E5E7EB);
  transform: translateY(-2px);
}

.rest-card:active {
  transform: scale(0.98);
}

.rest-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--bg-mute, #F2F4F6);
  overflow: hidden;
}

.rest-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.rest-card:hover .rest-thumb img {
  transform: scale(1.04);
}

.rest-thumb-none {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: var(--c-text-400);
  font-size: 28px;
}

.rest-dday {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  border-radius: 100px;
  letter-spacing: 0.02em;
  backdrop-filter: blur(4px);
}

.rest-body {
  padding: 12px 14px 14px;
}

.rest-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
  line-height: 1.35;
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(14px * 1.35 * 2);
}

.rest-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}

.rest-votes {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--c-text-400);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rest-lead-pct {
  font-size: 13px;
  font-weight: 800;
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.rest-track {
  height: 5px;
  background: var(--bg-subtle, #F7F8FA);
  border-radius: 100px;
  overflow: hidden;
}

.rest-fill {
  height: 100%;
  background: var(--c-brand);
  border-radius: 100px;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ===== 스켈레톤 ===== */
.skeleton {
  background: linear-gradient(90deg, var(--border-default, #F1F3F6) 25%, #E8EAED 37%, var(--border-default, #F1F3F6) 63%);
  background-size: 400% 100%;
  animation: pick-shimmer 1.4s ease-in-out infinite;
  border-radius: 6px;
}

@keyframes pick-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.skeleton-hero {
  pointer-events: none;
}

.hero-sk-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 0;
}

.hero-sk-body {
  padding: 20px;
}

/* ===== Empty ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: var(--bg-subtle, #F7F8FA);
  border-radius: 16px;
  gap: 10px;
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-400);
}

.empty-text {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--c-text-500);
  margin: 0;
}

.empty-cta {
  margin-top: 6px;
  padding: 8px 16px;
  background: var(--c-brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 100px;
  text-decoration: none;
}

/* ===== PC 와이드: 히어로를 가로 2열 (이미지 좌 / 비교 우)로 ===== */
@media (min-width: 768px) {
  .pick-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  }

  .hero-visual {
    aspect-ratio: 4 / 3;
    height: 100%;
  }

  .hero-compare {
    padding: 26px 28px;
    justify-content: center;
  }

  .hero-title { font-size: 19px; }
  .cmp-name { font-size: 15px; }
  .cmp-pct { font-size: 26px; }
  .cmp-pct.runner { font-size: 18px; }
}

@media (min-width: 1280px) {
  .pick-hero {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  }
  .hero-compare { padding: 32px 32px; gap: 12px; }
  .hero-title { font-size: 22px; }
  .cmp-pct { font-size: 30px; }
}

/* ===== 모바일 ≤ 767px ===== */
@media (max-width: 767px) {
  .pick-hero { border-radius: 16px; }
  .hero-visual { aspect-ratio: 16 / 10; }
  .hero-title-row { padding: 32px 14px 14px; }
  .hero-title { font-size: 15.5px; }
  .hero-votes { font-size: 11.5px; }
  .hero-meta-row { top: 12px; left: 12px; }
  .hero-tag { font-size: 10.5px; padding: 3px 9px; }

  .hero-compare { padding: 16px 16px 18px; gap: 8px; }
  .cmp-name { font-size: 13px; }
  .cmp-pct { font-size: 20px; }
  .cmp-pct.runner { font-size: 15px; }
  .hero-cta { padding: 12px 14px; font-size: 13.5px; }

  .rest-card { border-radius: 12px; }
  .rest-body { padding: 10px 12px 12px; }
  .rest-title { font-size: 13px; min-height: calc(13px * 1.35 * 2); }
  .rest-votes { font-size: 11px; }
  .rest-lead-pct { font-size: 12.5px; }
}

@media (max-width: 380px) {
  .rest-grid { gap: 10px; }
  .rest-body { padding: 8px 10px 10px; }
  .rest-title { font-size: 12.5px; }
}

@media (hover: none) {
  .pick-hero:hover,
  .rest-card:hover {
    transform: none;
    border-color: var(--border-default, #F1F3F6);
  }
  .rest-card:hover .rest-thumb img {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-tag.live .dot { animation: none; }
  .skeleton { animation: none; background: var(--bg-subtle); }
  .cmp-fill, .rest-fill { transition: none; }
}
</style>
