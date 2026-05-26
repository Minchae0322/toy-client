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
        <p class="mpick-sub">투표로 가리는 진짜 1픽</p>
      </div>
    </div>

    <!-- 본문: PC 1024+ 2열 (hero 좌 / 리스트 우), 그 이하는 세로 스택 -->
    <div class="pick-body">
      <!-- 히어로: 1번째 요거픽 큰 카드 -->
      <router-link
        v-if="!loading && featuredBattle"
        :to="{ name: 'BattleDetail', params: { id: featuredBattle.id } }"
        class="pick-hero"
      >
        <div class="hero-visual">
          <img v-if="featuredBattle.thumbnailDto?.fileUrl" :src="featuredBattle.thumbnailDto.fileUrl" :alt="featuredBattle.title" @error="handleImageError" />
          <div v-else class="hero-thumb-none">Y</div>
          <div class="hero-overlay-top">
            <span v-if="getDdayText(featuredBattle.endDate)" class="hero-dday">{{ getDdayText(featuredBattle.endDate) }}</span>
          </div>
          <div class="hero-overlay-bottom">
            <h3 class="hero-title">{{ featuredBattle.title }}</h3>
            <div class="hero-stats">
              <span class="hero-stat"><b>{{ formatNumber(featuredBattle.totalVotes) }}</b>명 참여중</span>
            </div>
          </div>
        </div>

        <div class="hero-vote-area" v-if="featuredBattle.topItems?.length > 0">
          <!-- 1·2위 양옆 배치 — 시선이 좌↔우 흐름으로 자연스럽게 비교 -->
          <div class="hero-rank-row">
            <div class="hero-rank-side rank-left">
              <span class="hero-rank-name">{{ truncateName(featuredBattle.topItems[0]?.displayName, 10) }}</span>
              <span class="hero-rank-pct">{{ formatPercent(featuredBattle.topItems[0]?.votePercentage) }}%</span>
            </div>
            <div class="hero-rank-side rank-right" v-if="featuredBattle.topItems[1]">
              <span class="hero-rank-pct rank-pct-sub">{{ formatPercent(featuredBattle.topItems[1]?.votePercentage) }}%</span>
              <span class="hero-rank-name">{{ truncateName(featuredBattle.topItems[1]?.displayName, 10) }}</span>
            </div>
          </div>
          <div class="hero-gauge">
            <div class="hero-g-bar b1" :style="{ width: formatPercent(featuredBattle.topItems[0]?.votePercentage) + '%' }"></div>
            <div class="hero-g-bar b2" v-if="featuredBattle.topItems[1]" :style="{ width: formatPercent(featuredBattle.topItems[1]?.votePercentage) + '%' }"></div>
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
        <div class="skeleton" style="width: 100%; aspect-ratio: 16/9; border-radius: 14px 14px 0 0;"></div>
        <div style="padding: 14px;">
          <div class="skeleton" style="height: 8px; width: 100%; border-radius: 10px; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 12px; width: 70%;"></div>
        </div>
      </div>

      <!-- 우측(또는 하단) 컬럼: 더 많은 픽 / 엠티 / 로딩 행 -->
      <div
        v-if="loading || hotBattles.length === 0 || restBattles.length > 0"
        class="pick-list-col"
      >
        <!-- 로딩 행 -->
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
              <h3 class="battle-ttl">{{ battle.title }}</h3>
              <span class="vote-line"><b>{{ formatNumber(battle.totalVotes) }}</b>명 참여중</span>

              <div class="dash-gauge-area" v-if="battle.topItems?.length > 0">
                <!-- 이름: 양쪽 끝 정렬 -->
                <div class="rank-names">
                  <span class="rank-name r-name-1">{{ truncateName(battle.topItems[0]?.displayName, 7) }}</span>
                  <span v-if="battle.topItems[1]" class="rank-name r-name-2">{{ truncateName(battle.topItems[1]?.displayName, 7) }}</span>
                </div>
                <!-- 게이지 + 각 바 시작점에 % 라벨 -->
                <div class="gauge-stack">
                  <div class="gauge-marks">
                    <span class="g-mark g-mark-1">{{ formatPercent(battle.topItems[0]?.votePercentage) }}%</span>
                    <span
                      v-if="battle.topItems[1]"
                      class="g-mark g-mark-2"
                      :class="markEdgeClass(battle)"
                      :style="markStyle(battle)"
                    >{{ formatPercent(battle.topItems[1]?.votePercentage) }}%</span>
                  </div>
                  <div class="gauge-track">
                    <div class="g-bar b1" :style="{ width: formatPercent(battle.topItems[0]?.votePercentage) + '%' }"></div>
                    <div class="g-bar b2" v-if="battle.topItems[1]" :style="{ width: formatPercent(battle.topItems[1]?.votePercentage) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
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

// 2위 % 라벨 위치: 1위 바가 끝나는 지점(= 2위 바 시작점)에 anchor
// 좁아질 때 충돌(1위 라벨과 겹침) 또는 우측 오버플로우를 방지
const markStyle = (battle) => {
  const p1 = formatPercent(battle.topItems[0]?.votePercentage)
  return { left: p1 + '%' }
}
const markEdgeClass = (battle) => {
  const p1 = formatPercent(battle.topItems[0]?.votePercentage)
  const p2 = formatPercent(battle.topItems[1]?.votePercentage)
  // 1위 바가 너무 짧으면 → 2위 라벨이 1위 라벨과 충돌
  if (p1 < 18) return 'g-mark-collide'
  // 1·2위 합이 90% 이상이면 → 2위 라벨이 우측 오버플로우
  if (p1 + p2 > 90) return 'g-mark-edge'
  return ''
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

/* 본문 wrapper — 모바일·태블릿은 세로 스택, PC 1024+는 2열 그리드 */
.pick-body {
  display: flex;
  flex-direction: column;
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
  padding: 16px 16px 18px;
}

/* 1·2위 양옆 한 줄 — 시선이 좌↔우로 자연스럽게 비교되도록 */
.hero-rank-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.hero-rank-side {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.hero-rank-side.rank-left {
  flex: 1;
  min-width: 0;
}
.hero-rank-side.rank-right {
  flex: 0 0 auto;
  justify-content: flex-end;
}
.hero-rank-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.rank-right .hero-rank-name {
  color: var(--c-text-500);
  font-weight: 600;
}
.hero-rank-pct {
  font-size: 22px;
  font-weight: 800;
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  flex-shrink: 0;
}
.hero-rank-pct.rank-pct-sub {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-gold);
}

.hero-gauge {
  display: flex;
  height: 10px;
  background: var(--bg-mute);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}
.hero-g-bar { height: 100%; transition: width 0.8s ease-out; }
.hero-g-bar.b1 { background: var(--c-brand); }
.hero-g-bar.b2 {
  background: var(--c-gold);
  box-shadow: inset 2px 0 0 var(--bg-elevated);
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
  gap: 4px;
}
.battle-ttl {
  font-size: 15px;
  font-weight: 700; color: var(--text-primary);
  margin: 0; line-height: 1.35;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  letter-spacing: -0.015em;
  min-width: 0;
}
.vote-line {
  font-size: 11px;
  color: var(--c-text-400);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.vote-line b { color: var(--c-text-600); font-weight: 700; }

/* 게이지 + 1·2위 한 줄 */
.dash-gauge-area {
  margin-top: 6px;
}
.rank-names {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.rank-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 84px;
}
.r-name-2 {
  color: var(--c-text-500);
  font-weight: 500;
}

/* 게이지 + 시작점 % 라벨 */
.gauge-stack { position: relative; }
.gauge-marks {
  position: relative;
  height: 15px;
  margin-bottom: 3px;
}
.g-mark {
  position: absolute;
  top: 0;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.g-mark-1 {
  left: 0;
  color: var(--c-brand);
}
.g-mark-2 {
  color: var(--c-text-700);
  font-weight: 700;
  /* 1·2위 바 경계선 바로 우측에 살짝 띄움 */
  transform: translateX(3px);
}
/* 1·2위 합이 90% 이상 → 우측 오버플로우 방지 (오른쪽 끝 고정) */
.g-mark-2.g-mark-edge {
  left: auto !important;
  right: 0;
  transform: none;
}
/* 1위 바가 너무 짧음 → 1위 라벨과 충돌 방지 (오른쪽 끝 고정) */
.g-mark-2.g-mark-collide {
  left: auto !important;
  right: 0;
  transform: none;
}

.gauge-track {
  display: flex;
  height: 7px;
  background: var(--bg-mute);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}
.g-bar { height: 100%; transition: width 0.8s ease-out; }
.g-bar.b1 { background: var(--c-brand); }
.g-bar.b2 {
  background: var(--c-gold);
  box-shadow: inset 2px 0 0 var(--bg-elevated);
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

/* 태블릿(768~1023): 썸네일 확대 + 히어로 가로 레이아웃 (full-width) */
@media (min-width: 768px) {
  .dash-thumb { width: 96px; height: 96px; border-radius: 14px; }
  .dash-row { gap: 18px; padding: 18px 14px; }
  .battle-ttl { font-size: 16px; }

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
  .hero-rank-name { font-size: 15px; }
  .hero-rank-pct { font-size: 26px; }
  .hero-rank-pct.rank-pct-sub { font-size: 20px; }
  .hero-cta { padding: 14px 18px; font-size: 15px; }
}

/* PC 1024+: hero(좌) + 더 많은 픽(우) 2열 그리드. hero 내부는 세로 스택으로 변경 */
@media (min-width: 1024px) {
  .pick-body {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }

  /* 좁아진 컬럼에 맞춰 hero는 세로 스택, 이미지 비율도 16/9로 축소 */
  .pick-hero {
    display: block;
    grid-template-columns: none;
    margin-bottom: 0;
  }
  .skeleton-hero { margin-bottom: 0; }

  .hero-visual { aspect-ratio: 16 / 9; }
  .hero-vote-area { padding: 18px 22px 20px; }
  .hero-title { font-size: 18px; }
  .hero-rank-pct { font-size: 24px; }
  .hero-rank-pct.rank-pct-sub { font-size: 19px; }

  /* 우측 리스트 컬럼: 가로 간격이 좁아진 만큼 row padding 축소 */
  .pick-list-col .dash-row { padding: 14px 12px; gap: 14px; }
  .pick-list-col .dash-thumb { width: 84px; height: 84px; border-radius: 12px; }
  .pick-list-col .battle-ttl { font-size: 15px; }

  /* 엣지 케이스: hero 또는 리스트 단독 렌더링 시 전체 너비 사용 */
  .pick-body > .pick-hero:only-child {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(320px, 1.2fr) 1fr;
  }
  .pick-body > .pick-hero:only-child .hero-visual { aspect-ratio: 4 / 3; }
  .pick-body > .pick-hero:only-child .hero-vote-area { padding: 24px 28px; }
  .pick-body > .pick-list-col:only-child { grid-column: 1 / -1; }
}

@media (min-width: 1280px) {
  .dash-thumb { width: 104px; height: 104px; border-radius: 16px; }
  .dash-row { gap: 20px; padding: 20px 16px; }

  /* 우측 컬럼은 카드형 외관과 별개로 컴팩트 유지 */
  .pick-list-col .dash-thumb { width: 92px; height: 92px; }
  .pick-list-col .dash-row { padding: 16px 14px; gap: 16px; }
}

/* ===== 모바일 가독성 최적화 (≤ 767px) ===== */
@media (max-width: 767px) {
  /* 히어로: 카드 라운드 줄이고 좌우 여백 0 (배경 transparent 라 가운데 정렬) */
  .pick-hero {
    border-radius: 14px;
    margin-bottom: 14px;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  }
  .hero-visual { aspect-ratio: 16 / 10; }
  .hero-overlay-bottom { padding: 32px 14px 12px; }
  .hero-title { font-size: 16px; line-height: 1.3; margin-bottom: 4px; }
  .hero-stats { font-size: 11.5px; }

  .hero-vote-area { padding: 14px 14px 14px; }
  .hero-rank-row { margin-bottom: 8px; gap: 10px; }
  .hero-rank-name { font-size: 13px; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hero-rank-pct { font-size: 20px; }
  .hero-rank-pct.rank-pct-sub { font-size: 17px; }
  .hero-gauge { margin-bottom: 12px; height: 7px; }
  .hero-cta { padding: 11px 14px; font-size: 13.5px; border-radius: 10px; }

  /* 리스트 행: 컴팩트 + 시각 위계 강화 */
  .dash-row { padding: 12px 4px; gap: 12px; border-radius: 8px; }
  .dash-thumb { width: 68px; height: 68px; border-radius: 10px; }
  .dash-info { gap: 3px; }
  .battle-ttl { font-size: 14px; }
  .vote-line { font-size: 10.5px; }
  .dash-gauge-area { margin-top: 4px; }
  .rank-names { margin-bottom: 3px; gap: 6px; }
  .rank-name { font-size: 11.5px; max-width: 64px; }
  .gauge-marks { height: 13px; margin-bottom: 2px; }
  .g-mark { font-size: 11.5px; }
  .rest-label { font-size: 11px; margin: 4px 4px; }
}

/* 좁은 화면 (≤ 400px): 이름 더 짧게, 2위 이름 숨김 */
@media (max-width: 400px) {
  .dash-thumb { width: 60px; height: 60px; }
  .dash-row { gap: 10px; padding: 11px 2px; }
  .rank-name { max-width: 52px; }
  .r-name-2 { display: none; }
  .hero-rank-name { max-width: 80px; }
}
</style>
