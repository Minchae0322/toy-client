<template>
  <section class="dashboard-pick">
    <DashboardSectionHeader
      prefix="오늘의"
      accent="요거픽"
      sub="투표로 가리는 진짜 1픽"
      :to="{ name: 'BattleList' }"
    />

    <!-- 히어로 (1번째 요거픽) -->
    <article v-if="!loading && featuredBattle" class="pick-hero">
      <router-link
        :to="{ name: 'BattleDetail', params: { id: featuredBattle.id } }"
        class="hero-cover"
      >
        <img
          v-if="featuredBattle.thumbnailDto?.fileUrl"
          :src="featuredBattle.thumbnailDto.fileUrl"
          :alt="featuredBattle.title"
          @error="handleImageError"
        />
        <div v-else class="hero-cover-none">Y</div>

        <!-- 좌상단: LIVE / D-day -->
        <div class="cover-chip-row top-left">
          <span class="cover-chip live"><span class="dot"></span>LIVE</span>
          <span v-if="getDdayText(featuredBattle.endDate)" class="cover-chip">{{ getDdayText(featuredBattle.endDate) }}</span>
        </div>

        <!-- 우하단: 참여자 -->
        <div class="cover-chip-row bottom-right">
          <span class="cover-chip glass">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {{ formatNumber(featuredBattle.totalVotes) }} 참여
          </span>
        </div>
      </router-link>

      <!-- 제목 + 비교 + CTA -->
      <div class="hero-body">
        <router-link
          :to="{ name: 'BattleDetail', params: { id: featuredBattle.id } }"
          class="hero-title-link"
        >
          <h3 class="hero-title">{{ featuredBattle.title }}</h3>
        </router-link>

        <div class="cmp-list" v-if="featuredBattle.topItems?.length > 0">
          <div class="cmp-item">
            <div class="cmp-head">
              <span class="cmp-rank">1</span>
              <span class="cmp-name">{{ truncateName(featuredBattle.topItems[0]?.displayName, 22) }}</span>
              <span class="cmp-pct lead">{{ formatPercent(featuredBattle.topItems[0]?.votePercentage) }}%</span>
            </div>
            <div class="cmp-track">
              <div class="cmp-fill lead" :style="{ width: formatPercent(featuredBattle.topItems[0]?.votePercentage) + '%' }"></div>
            </div>
          </div>

          <div class="cmp-item" v-if="featuredBattle.topItems[1]">
            <div class="cmp-head">
              <span class="cmp-rank runner">2</span>
              <span class="cmp-name runner">{{ truncateName(featuredBattle.topItems[1]?.displayName, 22) }}</span>
              <span class="cmp-pct">{{ formatPercent(featuredBattle.topItems[1]?.votePercentage) }}%</span>
            </div>
            <div class="cmp-track">
              <div class="cmp-fill" :style="{ width: formatPercent(featuredBattle.topItems[1]?.votePercentage) + '%' }"></div>
            </div>
          </div>
        </div>

        <router-link
          :to="{ name: 'BattleDetail', params: { id: featuredBattle.id } }"
          class="hero-cta"
        >
          한 표 던지러 가기
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </router-link>
      </div>
    </article>

    <!-- 히어로 로딩 스켈레톤 -->
    <div v-else-if="loading" class="pick-hero is-skeleton">
      <div class="skeleton hero-sk-cover"></div>
      <div class="hero-body">
        <div class="skeleton" style="height: 18px; width: 70%; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 12px; width: 100%; border-radius: 100px; margin-bottom: 10px;"></div>
        <div class="skeleton" style="height: 12px; width: 80%; border-radius: 100px; margin-bottom: 18px;"></div>
        <div class="skeleton" style="height: 42px; width: 100%; border-radius: 12px;"></div>
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

    <!-- 더 많은 픽 — 사진 위주 카드 그리드 -->
    <div v-if="restBattles.length > 0" class="rest-grid">
      <router-link
        v-for="battle in restBattles"
        :key="battle.id"
        :to="{ name: 'BattleDetail', params: { id: battle.id } }"
        class="rest-card"
      >
        <div class="rest-cover">
          <img
            v-if="battle.thumbnailDto?.fileUrl"
            :src="battle.thumbnailDto.fileUrl"
            :alt="battle.title"
            loading="lazy"
            @error="handleImageError"
          />
          <div v-else class="rest-cover-none">Y</div>

          <span v-if="getDdayText(battle.endDate)" class="rest-chip top-left">{{ getDdayText(battle.endDate) }}</span>

          <span v-if="battle.topItems?.[0]" class="rest-chip glass bottom-left">
            <span class="rest-chip-dot"></span>
            1위 {{ formatPercent(battle.topItems[0].votePercentage) }}%
          </span>
        </div>
        <div class="rest-body">
          <h4 class="rest-title">{{ battle.title }}</h4>
          <p class="rest-meta">{{ formatNumber(battle.totalVotes) }}명 참여</p>
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

const truncateName = (name, maxLength = 22) => {
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
  gap: 28px;
}

@media (min-width: 768px) {
  .dashboard-pick { gap: 32px; }
}

/* ====================================================
   히어로 — 외곽선 카드 X, 사진이 주인공
==================================================== */
.pick-hero {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@media (min-width: 768px) {
  .pick-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: 28px;
    align-items: stretch;
  }
}

@media (min-width: 1280px) {
  .pick-hero { gap: 36px; }
}

/* ===== 커버 (큰 사진) ===== */
.hero-cover {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  overflow: hidden;
  background: var(--bg-mute, #F2F4F6);
  text-decoration: none;
  isolation: isolate;
}

@media (min-width: 768px) {
  .hero-cover { aspect-ratio: 5 / 4; border-radius: 20px; }
}

@media (min-width: 1280px) {
  .hero-cover { border-radius: 24px; }
}

.hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-cover:hover img { transform: scale(1.03); }

.hero-cover-none {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: var(--c-text-400);
  font-size: 64px;
  background: var(--bg-mute);
}

/* 글래스 칩 */
.cover-chip-row {
  position: absolute;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.cover-chip-row.top-left { top: 14px; left: 14px; }
.cover-chip-row.bottom-right { bottom: 14px; right: 14px; }

.cover-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 100px;
  letter-spacing: 0.02em;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  line-height: 1.2;
}

.cover-chip.glass {
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-primary);
  font-weight: 700;
}

.cover-chip.live { background: var(--c-danger, #EF4444); }
.cover-chip.live .dot {
  width: 5px; height: 5px;
  background: #fff;
  border-radius: 50%;
  animation: chip-pulse 1.5s ease-in-out infinite;
}

@keyframes chip-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (min-width: 768px) {
  .cover-chip { font-size: 11.5px; padding: 5px 11px; }
  .cover-chip-row.top-left { top: 16px; left: 16px; }
  .cover-chip-row.bottom-right { bottom: 16px; right: 16px; }
}

/* ===== Body (제목 + 비교 + CTA) ===== */
.hero-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}

@media (min-width: 768px) {
  .hero-body {
    gap: 18px;
    justify-content: center;
  }
}

.hero-title-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.hero-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.03em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 768px) {
  .hero-title { font-size: 22px; line-height: 1.3; }
}

@media (min-width: 1280px) {
  .hero-title { font-size: 26px; }
}

.cmp-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cmp-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.cmp-rank {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--c-brand);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}

.cmp-rank.runner { background: var(--c-text-400, #94A3B8); }

.cmp-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmp-name.runner {
  font-weight: 600;
  color: var(--c-text-500, #64748B);
}

.cmp-pct {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-500, #64748B);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.cmp-pct.lead {
  font-size: 18px;
  font-weight: 800;
  color: var(--c-brand);
}

@media (min-width: 768px) {
  .cmp-name { font-size: 15px; }
  .cmp-pct { font-size: 15px; }
  .cmp-pct.lead { font-size: 22px; }
}

.cmp-track {
  height: 6px;
  background: var(--bg-subtle, #F7F8FA);
  border-radius: 100px;
  overflow: hidden;
}

.cmp-fill {
  height: 100%;
  background: var(--c-text-300, #CBD5E1);
  border-radius: 100px;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.cmp-fill.lead { background: var(--c-brand); }

.hero-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 14px 16px;
  background: var(--c-ink-900, #0A0E1A);
  color: #fff;
  font-size: 14.5px;
  font-weight: 700;
  border-radius: 12px;
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: background 0.15s ease;
  margin-top: 2px;
}

.hero-cta:hover { background: var(--c-ink-700, #1E293B); }
.hero-cta:active { transform: scale(0.99); }

/* ====================================================
   더 많은 픽 — 사진 위주 카드, 외곽선 없음
==================================================== */
.rest-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 12px;
}

@media (min-width: 640px) {
  .rest-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px 14px;
  }
}

@media (min-width: 1024px) {
  .rest-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 22px 18px;
  }
}

.rest-card {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: transform 0.18s ease;
}

.rest-card:hover { transform: translateY(-2px); }
.rest-card:active { transform: scale(0.98); }

.rest-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: var(--bg-mute, #F2F4F6);
  border-radius: 14px;
  overflow: hidden;
  isolation: isolate;
  margin-bottom: 10px;
}

@media (min-width: 768px) {
  .rest-cover { border-radius: 16px; }
}

.rest-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.rest-card:hover .rest-cover img { transform: scale(1.04); }

.rest-cover-none {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: var(--c-text-400);
  font-size: 32px;
}

.rest-chip {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 100px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.2;
  z-index: 2;
}

.rest-chip.top-left {
  top: 10px;
  left: 10px;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.rest-chip.glass.bottom-left {
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--c-brand);
  font-weight: 800;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.rest-chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--c-brand);
}

.rest-body {
  padding: 0 2px;
}

.rest-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
  line-height: 1.4;
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 768px) {
  .rest-title { font-size: 15px; }
}

.rest-meta {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-400);
  margin: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

/* ====================================================
   Skeleton
==================================================== */
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

.is-skeleton { pointer-events: none; }

.hero-sk-cover {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
}

@media (min-width: 768px) {
  .hero-sk-cover { aspect-ratio: 5 / 4; border-radius: 20px; }
}

/* ====================================================
   Empty
==================================================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 44px 16px;
  background: var(--bg-subtle, #F7F8FA);
  border-radius: 18px;
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
  padding: 9px 18px;
  background: var(--c-brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 100px;
  text-decoration: none;
}

/* ====================================================
   미디어
==================================================== */
@media (max-width: 480px) {
  .hero-title { font-size: 17px; }
  .cmp-name { font-size: 13.5px; }
  .cmp-pct { font-size: 13.5px; }
  .cmp-pct.lead { font-size: 17px; }
  .hero-cta { padding: 13px 14px; font-size: 14px; }
  .rest-title { font-size: 13.5px; }
  .rest-meta { font-size: 11.5px; }
}

@media (max-width: 380px) {
  .rest-grid { gap: 12px 10px; }
  .rest-title { font-size: 13px; }
}

@media (hover: none) {
  .hero-cover:hover img,
  .rest-card:hover,
  .rest-card:hover .rest-cover img {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cover-chip.live .dot { animation: none; }
  .skeleton { animation: none; background: var(--bg-subtle); }
  .cmp-fill { transition: none; }
}
</style>
