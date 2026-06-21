<template>
  <section class="dashboard-pick">
    <DashboardSectionHeader
      prefix="지금 뜨는"
      accent="요거픽"
      sub="다 같이 한 표씩, 지금 뜨는 픽"
      :to="{ name: 'BattleList' }"
    />

    <!-- 커뮤니티 펄스 바 — 지금 얼마나 많은 사람이 픽하고 있는지 -->
    <div v-if="!loading && hotBattles.length > 0" class="pick-pulse">
      <span class="pulse-live">
        <span class="pulse-dot"></span>
        LIVE
      </span>
      <p class="pulse-text">
        <span>{{ pulseHeadline }}</span>
        <template v-if="peopleCount > 0">
          <span class="pulse-sep">·</span>
          <span>지금까지 <strong>{{ formatNumber(peopleCount) }}명</strong>이 한 표 던졌어요</span>
        </template>
      </p>
    </div>

    <!-- PC: 1~5위 균등 그리드 (모바일에선 숨김) -->
    <div v-if="!loading && topFive.length > 0" class="pc-top-grid">
      <router-link
        v-for="(battle, idx) in topFive"
        :key="`pc-${battle.id}`"
        :to="{ name: 'BattleDetail', params: { id: battle.id } }"
        class="pc-card"
        :class="{ 'pc-card-lead': idx === 0 }"
      >
        <div class="pc-cover">
          <img
            v-if="battle.thumbnailDto?.fileUrl"
            :src="battle.thumbnailDto.fileUrl"
            :alt="battle.title"
            loading="lazy"
            @error="handleImageError"
          />
          <div v-else class="pc-cover-none">Y</div>
          <span class="pc-rank-badge" :class="{ 'is-top': idx === 0 }">{{ idx + 1 }}</span>
          <span v-if="getDdayText(battle.endDate)" class="pc-dday">{{ getDdayText(battle.endDate) }}</span>
        </div>
        <div class="pc-body">
          <h4 class="pc-title">{{ battle.title }}</h4>

          <!-- 1위 카드: 막대 위 라벨 + 순위별 컬러 누적 막대 -->
          <div v-if="idx === 0 && featuredPoll.items.length > 0" class="pc-vs">
            <div class="poll-labels">
              <span
                v-for="seg in featuredPoll.items"
                :key="seg.rank"
                class="poll-label"
                :class="'seg-' + seg.rank"
                :style="{ width: seg.pct + '%' }"
              >
                <span class="poll-label-name">{{ truncateName(seg.name, 8) }}</span>
                <span class="poll-label-pct">{{ seg.pct }}%</span>
              </span>
            </div>
            <div class="poll-bar">
              <span
                v-for="seg in featuredPoll.items"
                :key="seg.rank"
                class="poll-seg"
                :class="'seg-' + seg.rank"
                :style="{ width: seg.pct + '%' }"
              ></span>
              <span
                v-if="featuredPoll.rest >= 2"
                class="poll-seg seg-rest"
                :style="{ width: featuredPoll.rest + '%' }"
              ></span>
            </div>
            <div class="pc-vs-foot">
              <span class="pc-votes-lead">{{ formatNumber(peopleOf(battle)) }}명 참여 중</span>
            </div>
          </div>

          <!-- 2~5위: 간단 푸터 -->
          <div v-else class="pc-foot">
            <span class="pc-votes">{{ formatNumber(peopleOf(battle)) }}명 참여</span>
            <span v-if="battle.topItems?.[0]" class="pc-lead">
              {{ formatPercent(battle.topItems[0].votePercentage) }}%
            </span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- 모바일: 1~6위 균등 2열 그리드 -->
    <div v-if="!loading && topFour.length > 0" class="mobile-grid">
      <router-link
        v-for="(battle, idx) in topFour"
        :key="`m-${battle.id}`"
        :to="{ name: 'BattleDetail', params: { id: battle.id } }"
        class="m-card"
      >
        <div class="m-cover">
          <img
            v-if="battle.thumbnailDto?.fileUrl"
            :src="battle.thumbnailDto.fileUrl"
            :alt="battle.title"
            loading="lazy"
            @error="handleImageError"
          />
          <div v-else class="m-cover-none">Y</div>
          <span class="m-rank-badge" :class="{ 'is-top': idx === 0 }">{{ idx + 1 }}</span>
          <span v-if="getDdayText(battle.endDate)" class="m-dday">{{ getDdayText(battle.endDate) }}</span>
        </div>
        <div class="m-body">
          <h4 class="m-title">{{ battle.title }}</h4>
          <div class="m-foot">
            <span class="m-votes">{{ formatNumber(peopleOf(battle)) }}명</span>
            <span v-if="battle.topItems?.[0]" class="m-lead">
              {{ formatPercent(battle.topItems[0].votePercentage) }}%
            </span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- 모바일 그리드 스켈레톤 -->
    <div v-else-if="loading" class="mobile-grid">
      <div v-for="i in 4" :key="`m-sk-${i}`" class="m-card">
        <div class="skeleton m-cover"></div>
        <div class="m-body">
          <div class="skeleton" style="height: 12px; width: 90%; border-radius: 6px; margin-bottom: 6px;"></div>
          <div class="skeleton" style="height: 10px; width: 60%; border-radius: 6px;"></div>
        </div>
      </div>
    </div>

    <!-- PC 그리드 스켈레톤 -->
    <div v-if="loading" class="pc-top-grid">
      <div v-for="i in 5" :key="`pc-sk-${i}`" class="pc-card">
        <div class="skeleton pc-cover"></div>
        <div class="pc-body">
          <div class="skeleton" style="height: 12px; width: 90%; border-radius: 6px; margin-bottom: 6px;"></div>
          <div class="skeleton" style="height: 10px; width: 60%; border-radius: 6px;"></div>
        </div>
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

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { battleService } from '@/services/BattleService'
import DashboardSectionHeader from './DashboardSectionHeader.vue'

const hotBattles = ref([])
const loading = ref(true)

const featuredBattle = computed(() => hotBattles.value[0] || null)
const topFive = computed(() => hotBattles.value.slice(0, 5))
const topFour = computed(() => hotBattles.value.slice(0, 4))

// ── 커뮤니티 펄스 집계 ──
const isLive = (endDate) => {
  if (!endDate) return true
  return new Date(endDate) - new Date() > 0
}
const liveCount = computed(() => hotBattles.value.filter(b => isLive(b.endDate)).length)
// SWIPE 배틀이면 totalSwipes, 일반 배틀이면 totalVotes 로 신호 선택
const voteTypeOf = (b) => b?.voteType?.title || b?.voteType
const engagementOf = (b) =>
  voteTypeOf(b) === 'SWIPE' ? (b?.totalSwipes || 0) : (b?.totalVotes || 0)

// 참여자 수 우선, 없으면 배틀 타입에 맞는 engagement 로 폴백
const peopleCount = computed(() =>
  hotBattles.value.reduce((sum, b) => sum + (b.totalParticipants || engagementOf(b)), 0)
)
const pulseHeadline = computed(() =>
  liveCount.value > 0 ? `진행 중인 픽 ${liveCount.value}개` : `오늘의 픽 ${hotBattles.value.length}개`
)
// 카드별 "사람 수" — 참여자 우선, 없으면 배틀 타입에 맞는 engagement
const peopleOf = (b) => b?.totalParticipants || engagementOf(b)

// 1픽 누적 막대 세그먼트 — 순위별 득표율 + '그 외' 잔여분
const PICK_MAX_SEGMENTS = 4
function buildPoll(battle) {
  const items = (battle?.topItems || []).slice(0, PICK_MAX_SEGMENTS).map((it, i) => ({
    rank: i + 1,
    name: it?.displayName,
    pct: formatPercent(it?.votePercentage)
  }))
  const used = items.reduce((sum, it) => sum + it.pct, 0)
  return { items, rest: Math.max(0, 100 - used) }
}
const featuredPoll = computed(() => buildPoll(featuredBattle.value))

const loadHotBattles = async () => {
  loading.value = true
  try {
    // 한 번 호출로 PC(5개) + 모바일(hero 1 + rest 5 = 6개) 모두 커버
    const response = await battleService.getHotBattleList({ size: 7 })
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

const truncateName = (name, maxLength = 24) => {
  if (!name) return '-'
  return name.length > maxLength ? name.slice(0, maxLength) + '…' : name
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(loadHotBattles)
</script>

<style scoped>
.dashboard-pick {
  width: 100%;
}

/* ================================================================
   커뮤니티 펄스 바 — "지금 다 같이 픽하는 중"
================================================================ */
.pick-pulse {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 13px;
  background: var(--bg-elevated, #fff);
  border: 1px solid var(--border-default, #F1F3F6);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.04));
}

@media (min-width: 768px) {
  .pick-pulse {
    gap: 12px;
    padding: 12px 16px;
    border-radius: 14px;
    margin-bottom: 20px;
  }
}

.pulse-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  padding: 4px 9px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--c-danger, #EF4444);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  border-radius: 100px;
  line-height: 1;
}

.pulse-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: chip-pulse 1.5s ease-in-out infinite;
}

.pulse-text {
  margin: 0;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--c-text-500, #64748B);
  letter-spacing: -0.01em;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 768px) {
  .pulse-text { font-size: 13.5px; }
}

.pulse-text strong {
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.pulse-sep {
  margin: 0 6px;
  color: var(--c-text-300, #CBD5E1);
}

/* ================================================================
   모바일: 1~6위 균등 2열 그리드
================================================================ */
.mobile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

@media (min-width: 480px) {
  .mobile-grid { gap: 16px; }
}

@media (min-width: 768px) {
  .mobile-grid { display: none; }
}

.m-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  transition: transform 0.18s ease;
  min-width: 0;
}
.m-card:active { transform: scale(0.98); }

.m-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-mute, #F2F4F6);
  margin-bottom: 8px;
  isolation: isolate;
}
.m-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.m-cover-none {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: var(--c-text-400);
  font-size: 28px;
  background: var(--bg-mute);
}

.m-rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 8px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 2;
  letter-spacing: -0.02em;
}
.m-rank-badge.is-top { background: var(--c-brand); }

.m-dday {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  border-radius: 100px;
  letter-spacing: 0.02em;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 2;
}

.m-body {
  padding: 0 2px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.m-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.m-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 11.5px;
  color: var(--c-text-500, #64748B);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.m-lead {
  color: var(--c-brand);
  font-weight: 800;
}

/* ================================================================
   PC 1~5위 균등 그리드
================================================================ */
.pc-top-grid { display: none; }

@media (min-width: 768px) {
  .pc-top-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr 1fr 1fr;
    gap: 14px;
    align-items: start;
  }
}
@media (min-width: 1280px) {
  .pc-top-grid { gap: 18px; }
}

.pc-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  transition: transform 0.18s ease;
  min-width: 0;
}
.pc-card:hover { transform: translateY(-2px); }
.pc-card:active { transform: scale(0.98); }

.pc-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-mute, #F2F4F6);
  margin-bottom: 10px;
  isolation: isolate;
}
.pc-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.pc-card:hover .pc-cover img { transform: scale(1.04); }

.pc-cover-none {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: var(--c-text-400);
  font-size: 28px;
  background: var(--bg-mute);
}

.pc-rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 8px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 2;
  letter-spacing: -0.02em;
}
.pc-rank-badge.is-top {
  background: var(--c-brand);
}

.pc-dday {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  border-radius: 100px;
  letter-spacing: 0.02em;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 2;
}

.pc-body {
  padding: 0 2px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pc-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* 1줄 제목일 때 vote 정보가 제목 바로 밑에 붙도록 min-height 제거 */
}

@media (min-width: 1280px) {
  .pc-title {
    font-size: 14.5px;
  }
}

.pc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 11.5px;
  color: var(--c-text-500, #64748B);
  font-weight: 600;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.pc-lead {
  color: var(--c-brand);
  font-weight: 800;
}

/* ─ 1위 카드: 살짝 큰 cover + vote bar 풍부하게 (다른 카드와 균형 유지) ─ */
.pc-card-lead .pc-cover {
  aspect-ratio: 4 / 3;
  border-radius: 14px;
}
@media (min-width: 1280px) {
  .pc-card-lead .pc-cover { border-radius: 16px; }
}
.pc-card-lead .pc-title {
  font-size: 14px;
  min-height: 0;
  -webkit-line-clamp: 1;
}
@media (min-width: 1280px) {
  .pc-card-lead .pc-title { font-size: 15px; }
}

.pc-vs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
/* PC 1위 카드: 막대·라벨 컴팩트 */
.pc-vs .poll-bar { height: 10px; }
.pc-vs .poll-labels { margin-bottom: 6px; }
.pc-vs .poll-label-name { font-size: 11.5px; }
.pc-vs .poll-label-pct { font-size: 11.5px; margin-left: 3px; }
.pc-vs-foot {
  display: flex;
  align-items: center;
  margin-top: 2px;
}
.pc-votes-lead {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--c-text-500, #64748B);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

@keyframes chip-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ================================================================
   누적 막대 poll — PC 1위 카드 전용
================================================================ */
/* 라벨 행: 막대와 동일한 폭 비율로 셀을 나눠 각 세그먼트 시작점에 정렬 */
.poll-labels {
  display: flex;
  width: 100%;
  margin-bottom: 7px;
}

.poll-label {
  /* width 는 인라인 스타일로 세그먼트와 동일하게 지정 → 텍스트가 시작점에서 시작 */
  min-width: 0;
  padding-right: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.poll-label-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.poll-label-pct {
  margin-left: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-500, #64748B);
}

/* 라벨 이름을 세그먼트 컬러로 — 점 없이 색으로 매칭 */
.poll-label.seg-1 .poll-label-name { color: var(--c-brand, #9333EA); }
.poll-label.seg-2 .poll-label-name { color: #3B82F6; }
.poll-label.seg-3 .poll-label-name { color: #F97316; }
.poll-label.seg-4 .poll-label-name { color: #16A34A; }

.poll-bar {
  display: flex;
  width: 100%;
  height: 14px;
  border-radius: 100px;
  overflow: hidden;
  background: var(--bg-subtle, #F7F8FA);
}

.poll-seg {
  height: 100%;
  min-width: 2px;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 순위별 솔리드 컬러 (그라데이션 X) */
.poll-seg.seg-1 { background: var(--c-brand, #9333EA); }
.poll-seg.seg-2 { background: #3B82F6; }
.poll-seg.seg-3 { background: #F97316; }
.poll-seg.seg-4 { background: #16A34A; }
.poll-seg.seg-rest { background: var(--c-text-300, #CBD5E1); }

/* ================================================================
   Skeleton
================================================================ */
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

/* ================================================================
   Empty
================================================================ */
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

/* ================================================================
   미디어 적응
================================================================ */
@media (prefers-reduced-motion: reduce) {
  .pulse-dot { animation: none; }
  .skeleton { animation: none; background: var(--bg-subtle); }
  .poll-seg { transition: none; }
}
</style>
