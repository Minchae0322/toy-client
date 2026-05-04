<template>
  <section class="dashboard-pick">
    <!-- PC 헤더 -->
    <header class="section-header pc-header">
      <div class="title-with-badge">
        <h2 class="section-title">실시간 <span class="title-accent">요거픽</span></h2>
        <span class="sub-title">유저들이 직접 고르는 인기 승부</span>
      </div>
      <router-link :to="{ name: 'BattleList' }" class="view-all-link">
        더보기
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6" /></svg>
      </router-link>
    </header>

    <!-- 모바일 헤더 (DashboardHotFeeds의 mhot-header 톤과 동일) -->
    <div class="mpick-header">
      <div class="mpick-header-main">
        <h2 class="mpick-title">
          실시간 <span class="mpick-accent">요거픽</span>
          <span class="mpick-live"><span class="mpick-live-dot"></span>LIVE</span>
        </h2>
        <p class="mpick-sub">유저들이 직접 고르는 인기 승부</p>
      </div>
      <router-link :to="{ name: 'BattleList' }" class="mpick-more">
        <span>전체보기</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </router-link>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="dash-list">
      <div v-for="i in 3" :key="i" class="dash-row skeleton-row">
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
    </div>

    <!-- 리스트 -->
    <div v-else class="dash-list">
      <router-link
        v-for="battle in hotBattles.slice(0, 3)"
        :key="battle.id"
        :to="{ name: 'BattleDetail', params: { id: battle.id } }"
        class="dash-row"
      >
        <!-- 이미지 -->
        <div class="dash-thumb">
          <img v-if="battle.thumbnailDto?.fileUrl" :src="battle.thumbnailDto.fileUrl" :alt="battle.title" @error="handleImageError" />
          <div v-else class="thumb-none">Y</div>
          <span class="dday-mini">{{ getDdayText(battle.endDate) }}</span>
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
import { ref, onMounted } from 'vue'
import { battleService } from '@/services/BattleService'

const hotBattles = ref([])
const loading = ref(true)

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
  if (!endDate) return '진행중'
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return '종료'
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
  background: #fff;
  border: 1px solid #efefef;
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
    border-bottom: 1px solid #f1f3f6;
    border-radius: 0;
    box-shadow: none;
    padding: 22px 0.625rem 24px 0.625rem;
    margin-bottom: 0;
  }
}

/* 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
  padding: 0 4px;
}
.title-with-badge {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #18181b;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.section-title .title-accent { color: #9333ea; }
.sub-title {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  letter-spacing: -0.1px;
}

@media (min-width: 1280px) {
  .section-title { font-size: 1.3125rem; }
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  color: #adb5bd;
  text-decoration: none;
  transition: color 0.2s;
}
.view-all-link:hover { color: #6b7684; }

/* 모바일 헤더 (PC에선 숨김) */
.mpick-header { display: none; }
.mpick-header-main { flex: 1; min-width: 0; }
.mpick-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.03em;
  margin: 0;
}
.mpick-accent { color: #9333ea; }
.mpick-live {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #ef4444;
  font-weight: 700;
  margin-left: 4px;
}
.mpick-live-dot {
  width: 5px;
  height: 5px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: mpick-pulse 1.5s infinite;
}
@keyframes mpick-pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}
.mpick-sub {
  font-size: 13px;
  color: #71717a;
  margin: 4px 0 0;
}
.mpick-more {
  font-size: 13px;
  font-weight: 600;
  color: #a1a1aa;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .mpick-title { font-size: 1.125rem; }
}

/* 리스트 */
.dash-list { display: flex; flex-direction: column; }

.dash-row {
  display: flex;
  gap: 16px;
  padding: 16px 4px;
  text-decoration: none;
  border-bottom: 1px solid #f2f4f6;
  transition: background 0.15s ease;
}
.dash-row:last-child { border-bottom: none; }
.dash-row:hover { background: #fafafa; }

/* 이미지 */
.dash-thumb {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e9ecef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.dash-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-none {
  width: 100%; height: 100%; background: #e9ecef;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; color: #adb5bd;
  font-size: 24px;
}
.dday-mini {
  position: absolute; bottom: 0; width: 100%;
  background: rgba(0,0,0,0.6);
  color: #fff;
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
  font-weight: 700; color: #333d4b;
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
  color: #8b95a1;
  flex-shrink: 0;
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.stat { white-space: nowrap; }
.stat b { color: #4e5968; font-weight: 700; }
.stat-sep {
  width: 2px; height: 2px; border-radius: 50%;
  background: #d1d6db;
  flex-shrink: 0;
}

/* 게이지 + 랭킹 */
.gauge-track {
  display: flex;
  height: 6px;
  background: #f1f3f5;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}
.g-bar { height: 100%; transition: width 0.8s ease-out; }
.g-bar.b1 { background: #9333ea; }
.g-bar.b2 { background: #d8b4fe; }

.rank-summary { display: flex; align-items: center; gap: 14px; }
.rank-unit {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600;
  min-width: 0;
}
.dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.d1 { background: #9333ea; }
.d2 { background: #d8b4fe; }
.name {
  color: #4e5968; max-width: 70px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pct {
  color: #191f28;
  font-variant-numeric: tabular-nums;
}
.etc-mini {
  margin-left: auto; font-size: 10px; color: #adb5bd; font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* 스켈레톤 */
.skeleton {
  background: linear-gradient(90deg, #f1f3f6 25%, #e8eaed 37%, #f1f3f6 63%);
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
  padding: 32px 16px; color: #94a3b8; gap: 10px;
}
.empty-icon {
  width: 44px; height: 44px; border-radius: 50%; background: #f4f4f5;
  display: flex; align-items: center; justify-content: center; color: #a1a1aa;
}
.empty-text { font-size: 13px; font-weight: 500; margin: 0; }

/* PC: 썸네일 확대 */
@media (min-width: 768px) {
  .dash-thumb { width: 96px; height: 96px; border-radius: 14px; }
  .dash-row { gap: 18px; padding: 18px 4px; }
  .battle-ttl { font-size: 16px; }
}
@media (min-width: 1280px) {
  .dash-thumb { width: 104px; height: 104px; border-radius: 16px; }
  .dash-row { gap: 20px; padding: 20px 4px; }
}

/* 모바일 헤더 swap */
@media (max-width: 767px) {
  .pc-header { display: none; }
  .mpick-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
    padding: 0 4px;
  }
}

/* 좁은 화면 */
@media (max-width: 400px) {
  .dash-thumb { width: 60px; height: 60px; }
  .dash-row { gap: 12px; }
  .name { max-width: 50px; }
  .rank-unit:nth-child(2) { display: none; }
}
</style>
