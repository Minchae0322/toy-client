<template>
  <section class="dashboard-pick">
    <!-- 헤더 (PC·모바일 통일 톤) -->
    <div class="mpick-header">
      <div class="mpick-header-main">
        <router-link :to="{ name: 'BattleList' }" class="mpick-title-link">
          <h2 class="mpick-title">
            오늘의 <span class="mpick-accent">요거픽</span>
            <svg class="mpick-title-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </h2>
        </router-link>
        <p class="mpick-sub">이거 vs 저거, 투표로 가리는 진짜 1픽</p>
      </div>
      <span v-if="!loading && hotBattles.length > 0" class="mpick-count-chip">
        <span class="chip-dot"></span>
        {{ hotBattles.length }}개 진행중
      </span>
    </div>

    <!-- 모바일 히어로: 1번째 요거픽 큰 카드 -->
    <router-link
      v-if="!loading && featuredBattle"
      :to="{ name: 'BattleDetail', params: { id: featuredBattle.id } }"
      class="pick-hero"
    >
      <div class="hero-visual">
        <img v-if="featuredBattle.thumbnailDto?.fileUrl" :src="featuredBattle.thumbnailDto.fileUrl" :alt="featuredBattle.title" @error="handleImageError" />
        <div v-else class="hero-thumb-none">Y</div>
        <div class="hero-overlay-top">
          <span class="hero-live">
            <span class="hero-live-dot"></span>
            LIVE
          </span>
          <span v-if="getDdayText(featuredBattle.endDate)" class="hero-dday">{{ getDdayText(featuredBattle.endDate) }}</span>
        </div>
        <div class="hero-overlay-bottom">
          <h3 class="hero-title">{{ featuredBattle.title }}</h3>
          <div class="hero-stats">
            <span class="hero-stat"><b>{{ formatNumber(featuredBattle.totalVotes) }}</b>명 참여</span>
            <span class="hero-stat-sep"></span>
            <span class="hero-stat"><b>{{ formatNumber(featuredBattle.totalViews || 0) }}</b> 조회</span>
          </div>
        </div>
      </div>

      <div class="hero-vote-area" v-if="featuredBattle.topItems?.length > 0">
        <div class="hero-gauge">
          <div class="hero-g-bar b1" :style="{ width: formatPercent(featuredBattle.topItems[0]?.votePercentage) + '%' }"></div>
          <div class="hero-g-bar b2" v-if="featuredBattle.topItems[1]" :style="{ width: formatPercent(featuredBattle.topItems[1]?.votePercentage) + '%' }"></div>
        </div>
        <div class="hero-rank-summary">
          <div class="hero-rank-unit">
            <span class="hero-dot d1"></span>
            <span class="hero-name">{{ truncateName(featuredBattle.topItems[0]?.displayName, 10) }}</span>
            <span class="hero-pct">{{ formatPercent(featuredBattle.topItems[0]?.votePercentage) }}%</span>
          </div>
          <div class="hero-rank-unit" v-if="featuredBattle.topItems[1]">
            <span class="hero-dot d2"></span>
            <span class="hero-name">{{ truncateName(featuredBattle.topItems[1]?.displayName, 10) }}</span>
            <span class="hero-pct">{{ formatPercent(featuredBattle.topItems[1]?.votePercentage) }}%</span>
          </div>
        </div>
        <div class="hero-cta">
          한 표 던지러 가기
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </router-link>

    <!-- 로딩 -->
    <div v-if="loading" class="dash-list">
      <div class="pick-hero skeleton-hero">
        <div class="skeleton" style="width: 100%; aspect-ratio: 16/9; border-radius: 14px 14px 0 0;"></div>
        <div style="padding: 14px;">
          <div class="skeleton" style="height: 8px; width: 100%; border-radius: 10px; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 12px; width: 70%;"></div>
        </div>
      </div>
      <div v-for="i in 2" :key="i" class="dash-row skeleton-row">
        <div class="dash-thumb"><div class="skeleton skeleton-thumb"></div></div>
        <div class="dash-info">
          <div class="info-top">
            <div class="skeleton" style="height: 15px; width: 60%;"></div>
            <div class="skeleton" style="height: 11px; width: 80px;"></div>
          </div>
          <div class="skeleton" style="height: 6px; width: 100%; border-radius: 10px; margin-top: 12px;"></div>
        </div>
      </div>
    </div>

    <!-- 엠티 -->
    <div v-else-if="hotBattles.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
      <p class="empty-text">진행 중인 요거픽이 없습니다</p>
      <router-link :to="{ name: 'BattleList' }" class="empty-cta">요거픽 둘러보기</router-link>
    </div>

    <!-- 리스트 (히어로 제외한 나머지) -->
    <div v-else-if="restBattles.length > 0" class="dash-list">
      <p class="rest-label">더 많은 픽</p>
      <router-link
        v-for="battle in restBattles"
        :key="battle.id"
        :to="{ name: 'BattleDetail', params: { id: battle.id } }"
        class="dash-row"
      >
        <!-- 이미지 -->
        <div class="dash-thumb">
          <img v-if="battle.thumbnailDto?.fileUrl" :src="battle.thumbnailDto.fileUrl" :alt="battle.title" @error="handleImageError" />
          <div v-else class="thumb-none">Y</div>
          <span v-if="getDdayText(battle.endDate)" class="dday-mini">{{ getDdayText(battle.endDate) }}</span>
        </div>

        <!-- 정보 -->
        <div class="dash-info">
          <div class="info-top">
            <h3 class="battle-ttl">{{ battle.title }}</h3>
            <span class="stat-line">
              <span class="stat"><b>{{ formatNumber(battle.totalVotes) }}</b> 투표</span>
              <span class="stat-sep"></span>
              <span class="stat"><b>{{ formatNumber(battle.totalViews || 0) }}</b> 조회</span>
            </span>
          </div>

          <div class="dash-gauge-area" v-if="battle.topItems?.length > 0">
            <div class="gauge-track">
              <div class="g-bar b1" :style="{ width: formatPercent(battle.topItems[0]?.votePercentage) + '%' }"></div>
              <div class="g-bar b2" v-if="battle.topItems[1]" :style="{ width: formatPercent(battle.topItems[1]?.votePercentage) + '%' }"></div>
            </div>

            <div class="rank-summary">
              <div class="rank-unit">
                <span class="dot d1"></span>
                <span class="name">{{ truncateName(battle.topItems[0]?.displayName, 6) }}</span>
                <span class="pct">{{ formatPercent(battle.topItems[0]?.votePercentage) }}%</span>
              </div>
              <div class="rank-unit" v-if="battle.topItems[1]">
                <span class="dot d2"></span>
                <span class="name">{{ truncateName(battle.topItems[1]?.displayName, 6) }}</span>
                <span class="pct">{{ formatPercent(battle.topItems[1]?.votePercentage) }}%</span>
              </div>
              <span class="etc-mini">외 {{ getEtcPercent(battle.topItems) }}%</span>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { battleService } from '@/services/BattleService'

const hotBattles = ref([])
const loading = ref(true)

const featuredBattle = computed(() => hotBattles.value[0] || null)
const restBattles = computed(() => hotBattles.value.slice(1, 4))

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

const getEtcPercent = (topItems) => {
  if (!topItems || topItems.length === 0) return 0
  const first = topItems[0]?.votePercentage || 0
  const second = topItems[1]?.votePercentage || 0
  return Math.max(0, Math.round((1 - first - second) * 100))
}

const getDdayText = (endDate) => {
  if (!endDate) return ''
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  // 7일 초과 또는 이미 종료된 배틀은 D-day 미표시
  if (diffDays < 0 || diffDays > 7) return ''
  if (diffDays === 0) return 'D-Day'
  return `D-${diffDays}`
}

const truncateName = (name, maxLength = 6) => {
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
/* 컨테이너 — PC 카드 / 모바일 플랫 */
.dashboard-pick {
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  padding: 1.375rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .dashboard-pick {
    padding: 1.625rem;
    margin-bottom: 1.125rem;
  }
}

/* 모바일에선 카드 외곽 제거 + 하단 구분선만 */
@media (max-width: 767px) {
  .dashboard-pick {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-default);
    border-radius: 0;
    box-shadow: none;
    padding: 18px 0 20px;
    margin-bottom: 0;
  }
}

/* 헤더 (PC·모바일 공통) */
.mpick-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  padding: 0 4px;
}
.mpick-header-main { flex: 1; min-width: 0; }
.mpick-title-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
}
.mpick-title-link:active { opacity: 0.6; }
.mpick-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  gap: 2px;
  letter-spacing: -0.03em;
  margin: 0;
}
.mpick-accent { color: var(--c-brand); }
.mpick-title-arrow {
  color: var(--c-text-400);
  flex-shrink: 0;
  margin-left: 2px;
}
.mpick-sub {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-600);
  margin: 4px 0 0;
  letter-spacing: -0.01em;
}
.mpick-more {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-400);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.mpick-count-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  letter-spacing: -0.01em;
  flex-shrink: 0;
  margin-bottom: 3px;
}
.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--c-brand);
  animation: chip-pulse 1.6s infinite;
}
@keyframes chip-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ===== 히어로 카드 (1번째 요거픽) ===== */
.pick-hero {
  display: block;
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 16px;
}
.pick-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}
.pick-hero:active { transform: scale(0.99); }

.hero-visual {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--bg-mute);
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

.hero-overlay-top {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}
.hero-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  background: var(--c-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  border-radius: 6px;
}
.hero-live-dot {
  width: 5px;
  height: 5px;
  background: #fff;
  border-radius: 50%;
  animation: chip-pulse 1.6s infinite;
}
.hero-dday {
  padding: 4px 9px;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 6px;
  letter-spacing: 0.02em;
}

.hero-overlay-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 36px 16px 14px;
  background: linear-gradient(to top, rgba(10, 14, 26, 0.85) 0%, rgba(10, 14, 26, 0.45) 60%, transparent 100%);
  color: #fff;
}
.hero-title {
  font-size: 17px;
  font-weight: 800;
  margin: 0 0 6px;
  line-height: 1.35;
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hero-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-variant-numeric: tabular-nums;
}
.hero-stat b {
  color: #fff;
  font-weight: 700;
}
.hero-stat-sep {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

.hero-vote-area {
  padding: 14px 16px 16px;
}
.hero-gauge {
  display: flex;
  height: 8px;
  background: var(--bg-subtle);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}
.hero-g-bar { height: 100%; transition: width 0.8s ease-out; }
.hero-g-bar.b1 { background: var(--c-brand); }
.hero-g-bar.b2 { background: var(--c-brand-soft); border-left: 1px solid var(--bg-base); }

.hero-rank-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.hero-rank-unit {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}
.hero-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.hero-dot.d1 { background: var(--c-brand); }
.hero-dot.d2 { background: var(--c-brand-soft); border: 1.5px solid var(--c-brand); }
.hero-name {
  flex: 1;
  min-width: 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}
.hero-pct {
  color: var(--text-primary);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.hero-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 12px 16px;
  background: var(--c-brand);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border-radius: 10px;
  letter-spacing: -0.01em;
  transition: background 0.15s ease;
}
.pick-hero:hover .hero-cta {
  background: var(--c-brand-hover, #7e22ce);
}

.rest-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-text-400);
  margin: 4px 4px 6px;
  letter-spacing: 0.02em;
}

.empty-cta {
  margin-top: 10px;
  padding: 8px 16px;
  background: var(--c-brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 100px;
  text-decoration: none;
}

.skeleton-hero {
  pointer-events: none;
  margin-bottom: 16px;
}

@media (min-width: 1280px) {
  .mpick-title { font-size: 1.375rem; }
}

@media (max-width: 640px) {
  .mpick-title { font-size: 1.125rem; }
}

/* 리스트 */
.dash-list { display: flex; flex-direction: column; }

.dash-row {
  display: flex;
  gap: 16px;
  padding: 16px 12px;
  text-decoration: none;
  border-bottom: 1px solid var(--bg-mute);
  border-radius: 10px;
  transition: background 0.15s ease;
}
.dash-row:last-child { border-bottom: none; }
.dash-row:hover { background: var(--bg-subtle); }

/* 이미지 */
.dash-thumb {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-mute);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.dash-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-none {
  width: 100%; height: 100%; background: var(--bg-mute);
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; color: var(--c-text-400);
  font-size: 24px;
}
.dday-mini {
  position: absolute; bottom: 0; width: 100%;
  background: rgba(0,0,0,0.6);
  color: #ffffff;
  font-size: 10px; font-weight: 800; text-align: center; padding: 3px 0;
  letter-spacing: 0.3px;
}

/* 정보 */
.dash-info {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  justify-content: center;
}
.info-top {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
  margin-bottom: 8px;
}
.battle-ttl {
  font-size: 15px;
  font-weight: 700; color: var(--text-primary);
  margin: 0; line-height: 1.4;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  letter-spacing: -0.01em;
  flex: 1; min-width: 0;
}

/* 통계 — 투표 + 조회 (인라인 도트 구분) */
.stat-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--c-text-400);
  flex-shrink: 0;
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.stat { white-space: nowrap; }
.stat b { color: var(--c-text-600); font-weight: 700; }
.stat-sep {
  width: 2px; height: 2px; border-radius: 50%;
  background: var(--c-text-300);
  flex-shrink: 0;
}

/* 게이지 + 랭킹 */
.gauge-track {
  display: flex;
  height: 6px;
  background: var(--bg-subtle);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}
.g-bar { height: 100%; transition: width 0.8s ease-out; }
.g-bar.b1 { background: var(--c-brand); }
.g-bar.b2 { background: var(--c-brand-soft); }

.rank-summary { display: flex; align-items: center; gap: 14px; }
.rank-unit {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600;
  min-width: 0;
}
.dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.d1 { background: var(--c-brand); }
.d2 { background: var(--c-brand-soft); }
.name {
  color: var(--c-text-600); max-width: 70px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pct {
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
.etc-mini {
  margin-left: auto; font-size: 10px; color: var(--c-text-400); font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* 스켈레톤 */
.skeleton {
  background: linear-gradient(90deg, var(--border-default) 25%, #e8eaed 37%, var(--border-default) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
  border-radius: 4px;
}
.skeleton-thumb { width: 100%; height: 100%; border-radius: 12px; }
.skeleton-row { pointer-events: none; }
@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

/* 엠티 */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 32px 16px; color: var(--c-text-400); gap: 10px;
}
.empty-icon {
  width: 44px; height: 44px; border-radius: 50%; background: var(--bg-mute);
  display: flex; align-items: center; justify-content: center; color: var(--c-text-400);
}
.empty-text { font-size: 13px; font-weight: 500; margin: 0; }

/* PC: 썸네일 확대 */
@media (min-width: 768px) {
  .dash-thumb { width: 96px; height: 96px; border-radius: 14px; }
  .dash-row { gap: 18px; padding: 18px 14px; }
  .battle-ttl { font-size: 16px; }

  /* 히어로 가로 레이아웃 */
  .pick-hero {
    display: grid;
    grid-template-columns: minmax(320px, 1.2fr) 1fr;
    border-radius: 20px;
    margin-bottom: 20px;
  }
  .hero-visual {
    aspect-ratio: 4 / 3;
    border-radius: 0;
  }
  .hero-vote-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 24px 28px;
    gap: 4px;
  }
  .hero-title { font-size: 20px; }
  .hero-rank-summary { margin-bottom: 18px; }
  .hero-rank-unit { font-size: 14px; }
  .hero-cta { padding: 14px 18px; font-size: 15px; }
}
@media (min-width: 1280px) {
  .dash-thumb { width: 104px; height: 104px; border-radius: 16px; }
  .dash-row { gap: 20px; padding: 20px 16px; }
}

/* 좁은 화면 */
@media (max-width: 400px) {
  .dash-thumb { width: 60px; height: 60px; }
  .dash-row { gap: 12px; }
  .name { max-width: 50px; }
  .rank-unit:nth-child(2) { display: none; }
}
</style>
