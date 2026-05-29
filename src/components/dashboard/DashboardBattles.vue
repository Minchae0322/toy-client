<template>
  <section class="dashboard-pick">
    <DashboardSectionHeader
      prefix="오늘의"
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

    <!-- 1픽 — 매거진 풀너비 카드 (모바일 전용) -->
    <router-link
      v-if="!loading && featuredBattle"
      :to="{ name: 'BattleDetail', params: { id: featuredBattle.id } }"
      class="lead-card"
    >
      <!-- 큰 사진 + 모든 메타 칩을 안에 -->
      <div class="lead-cover">
        <img
          v-if="featuredBattle.thumbnailDto?.fileUrl"
          :src="featuredBattle.thumbnailDto.fileUrl"
          :alt="featuredBattle.title"
          @error="handleImageError"
        />
        <div v-else class="lead-cover-none">Y</div>

        <div class="lead-chip-row lead-chip-tl">
          <span class="lead-chip live"><span class="live-dot"></span>LIVE</span>
          <span v-if="getDdayText(featuredBattle.endDate)" class="lead-chip">{{ getDdayText(featuredBattle.endDate) }}</span>
        </div>

        <div class="lead-chip-row lead-chip-bl">
          <span class="lead-chip glass">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {{ formatNumber(peopleOf(featuredBattle)) }}명 참여
          </span>
        </div>
      </div>

      <!-- 사진 밑 본문 -->
      <div class="lead-body">
        <h3 class="lead-title">{{ featuredBattle.title }}</h3>

        <div v-if="featuredPoll.items.length > 0" class="poll">
          <div class="poll-labels">
            <span
              v-for="seg in featuredPoll.items"
              :key="seg.rank"
              class="poll-label"
              :class="'seg-' + seg.rank"
              :style="{ width: seg.pct + '%' }"
            >
              <span class="poll-label-name">{{ truncateName(seg.name, 14) }}</span>
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
        </div>

        <span class="lead-cta">
          나도 한 표 던지기
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </div>
    </router-link>

    <!-- 1픽 로딩 스켈레톤 (모바일) -->
    <div v-else-if="loading" class="lead-card is-skeleton">
      <div class="skeleton lead-sk-cover"></div>
      <div class="lead-body">
        <div class="skeleton" style="height: 22px; width: 78%; margin-bottom: 20px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 12px; width: 100%; border-radius: 100px; margin-bottom: 12px;"></div>
        <div class="skeleton" style="height: 12px; width: 70%; border-radius: 100px; margin-bottom: 20px;"></div>
        <div class="skeleton" style="height: 48px; width: 100%; border-radius: 12px;"></div>
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

    <!-- 다른 픽도 둘러보기 — 가로 스크롤 큰 사진 카드 -->
    <div v-if="restBattles.length > 0" class="rest-wrap">
      <div class="rest-header">
        <span class="rest-label">다른 픽에도 한 표</span>
        <router-link :to="{ name: 'BattleList' }" class="rest-more">
          전체보기
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </router-link>
      </div>

      <div class="rest-scroll">
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
            <span v-if="getDdayText(battle.endDate)" class="rest-dday">{{ getDdayText(battle.endDate) }}</span>
          </div>
          <div class="rest-body">
            <h4 class="rest-title">{{ battle.title }}</h4>
            <div class="rest-foot">
              <span class="rest-votes">{{ formatNumber(peopleOf(battle)) }}명 참여</span>
              <span v-if="battle.topItems?.[0]" class="rest-lead">
                1위 {{ formatPercent(battle.topItems[0].votePercentage) }}%
              </span>
            </div>
          </div>
        </router-link>
      </div>
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
const restBattles = computed(() => hotBattles.value.slice(1, 6))
const topFive = computed(() => hotBattles.value.slice(0, 5))

// ── 커뮤니티 펄스 집계 ──
const isLive = (endDate) => {
  if (!endDate) return true
  return new Date(endDate) - new Date() > 0
}
const liveCount = computed(() => hotBattles.value.filter(b => isLive(b.endDate)).length)
// 참여자 수 우선, 없으면 투표 수로 폴백
const peopleCount = computed(() =>
  hotBattles.value.reduce((sum, b) => sum + (b.totalParticipants || b.totalVotes || 0), 0)
)
const pulseHeadline = computed(() =>
  liveCount.value > 0 ? `진행 중인 픽 ${liveCount.value}개` : `오늘의 픽 ${hotBattles.value.length}개`
)
// 카드별 "사람 수" — 참여자 우선, 없으면 투표 수
const peopleOf = (b) => b?.totalParticipants || b?.totalVotes || 0

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

onMounted(() => {
  loadHotBattles()
})
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
   1픽 — 매거진 풀너비 카드 (외곽선 X, 사진이 주인공)
================================================================ */
.lead-card {
  display: block;
  text-decoration: none;
  color: inherit;
}

/* PC에선 hero·rest 모두 숨기고 pc-top-grid만 사용
   (selector 특이성 올려 후속 .rest-wrap/.lead-card 룰을 이김) */
@media (min-width: 768px) {
  .dashboard-pick > .lead-card,
  .dashboard-pick > .rest-wrap {
    display: none;
  }
}

/* ================================================================
   PC 1~5위 균등 그리드
================================================================ */
.pc-top-grid { display: none; }

@media (min-width: 768px) {
  .pc-top-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
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

/* ─ 1위 카드: 더 큰 cover + vote bar 풍부하게 ─ */
.pc-card-lead .pc-cover {
  aspect-ratio: 16 / 10;
  border-radius: 14px;
}
@media (min-width: 1280px) {
  .pc-card-lead .pc-cover { border-radius: 16px; }
}
.pc-card-lead .pc-title {
  font-size: 15px;
  min-height: 0;
  -webkit-line-clamp: 1;
}
@media (min-width: 1280px) {
  .pc-card-lead .pc-title { font-size: 17px; }
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

.lead-card.is-skeleton { pointer-events: none; }

.lead-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 11;
  border-radius: 18px;
  overflow: hidden;
  background: var(--bg-mute, #F2F4F6);
  isolation: isolate;
  margin-bottom: 14px;
}

@media (min-width: 480px) {
  .lead-cover { aspect-ratio: 16 / 10; border-radius: 20px; margin-bottom: 16px; }
}


.lead-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.lead-card:hover .lead-cover img { transform: scale(1.03); }

.lead-cover-none {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: var(--c-text-300, #CBD5E1);
  font-size: 40px;
  background: var(--bg-mute);
  letter-spacing: -0.04em;
}

@media (min-width: 768px) {
  .lead-cover-none { font-size: 56px; }
}

/* 사진 위 글래스 칩 */
.lead-chip-row {
  position: absolute;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.lead-chip-tl { top: 16px; left: 16px; }
.lead-chip-bl { bottom: 16px; left: 16px; }

@media (min-width: 768px) {
  .lead-chip-tl { top: 20px; left: 20px; }
  .lead-chip-bl { bottom: 20px; left: 20px; }
}

.lead-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  background: rgba(10, 14, 26, 0.78);
  color: #fff;
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 100px;
  letter-spacing: 0.02em;
  line-height: 1.2;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.lead-chip.glass {
  /* 사진 위에 항상 흰 배경 칩 → 글자는 라이트/다크 무관 고정 다크 */
  background: rgba(255, 255, 255, 0.94);
  color: #0A0E1A;
  font-weight: 700;
}

.lead-chip.live { background: var(--c-danger, #EF4444); }
.lead-chip.live .live-dot {
  width: 5px;
  height: 5px;
  background: #fff;
  border-radius: 50%;
  animation: chip-pulse 1.5s ease-in-out infinite;
}

@keyframes chip-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 본문 */
.lead-body {
  display: flex;
  flex-direction: column;
  /* title↔vs-list 는 바로 붙고, CTA 와의 간격만 .lead-cta margin 으로 띄움 */
  gap: 6px;
}

@media (min-width: 768px) {
  .lead-body { gap: 8px; }
}

.lead-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.03em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 768px) {
  .lead-title { font-size: 26px; }
}

/* ================================================================
   누적 막대 poll — 한 줄 막대 + 각 세그먼트 시작점 위에 아이템명 (1픽 / PC 1위 공용)
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

.lead-cta {
  /* vs-list 와는 시각적 분리 — CTA 만 별도 간격 */
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 12px 14px;
  /* 브랜드 컬러 — 라이트/다크 모두 또렷하게 보이는 주요 액션 */
  background: var(--c-brand, #9333EA);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  letter-spacing: -0.01em;
  transition: background 0.15s ease;
  box-shadow: var(--shadow-brand, 0 4px 12px rgba(147, 51, 234, 0.28));
}

.lead-card:hover .lead-cta {
  background: var(--c-brand-hover, #7C3AED);
}

@media (min-width: 768px) {
  .lead-cta { padding: 17px 18px; font-size: 15.5px; }
}

/* ================================================================
   다른 픽도 둘러보기 — 가로 스크롤 큰 사진 카드
================================================================ */
.rest-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 24px;
}

.rest-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.rest-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .rest-label { font-size: 15.5px; }
}

.rest-more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text-500, #64748B);
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.rest-more:hover { color: var(--text-primary); }

/* 가로 스크롤 */
.rest-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  margin: 0 -16px;
  padding: 0 16px 4px;
}

.rest-scroll::-webkit-scrollbar { display: none; }

@media (min-width: 768px) {
  .rest-scroll {
    gap: 16px;
    margin: 0 -32px;
    padding: 0 32px 4px;
  }
}

@media (min-width: 1024px) {
  .rest-scroll {
    margin: 0 -40px;
    padding: 0 40px 4px;
  }
}

.rest-card {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  transition: transform 0.18s ease;
}

.rest-card:hover { transform: translateY(-2px); }
.rest-card:active { transform: scale(0.98); }

@media (min-width: 480px) {
  .rest-card { flex: 0 0 220px; }
}

@media (min-width: 768px) {
  .rest-card { flex: 0 0 240px; }
}

@media (min-width: 1280px) {
  .rest-card { flex: 0 0 260px; }
}

.rest-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  overflow: hidden;
  background: var(--bg-mute, #F2F4F6);
  margin-bottom: 10px;
  isolation: isolate;
}

@media (min-width: 768px) {
  .rest-cover { border-radius: 16px; margin-bottom: 12px; }
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

.rest-dday {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 9px;
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

.rest-body {
  padding: 0 2px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rest-title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* 1줄 제목에서 vote 정보가 바로 밑에 붙도록 min-height 제거 */
}

@media (min-width: 768px) {
  .rest-title {
    font-size: 15.5px;
  }
}

.rest-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--c-text-400);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

@media (min-width: 768px) {
  .rest-foot { font-size: 12.5px; }
}

.rest-votes {
  white-space: nowrap;
}

.rest-lead {
  position: relative;
  padding-left: 9px;
  color: var(--c-brand);
  font-weight: 700;
  white-space: nowrap;
}

.rest-lead::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  transform: translateY(-50%);
  opacity: 0.6;
}

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

.lead-sk-cover {
  width: 100%;
  aspect-ratio: 16 / 11;
  border-radius: 18px;
  margin-bottom: 14px;
}

@media (min-width: 480px) {
  .lead-sk-cover { aspect-ratio: 16 / 10; border-radius: 20px; margin-bottom: 16px; }
}

@media (min-width: 768px) {
  .lead-sk-cover {
    width: 280px;
    flex-shrink: 0;
    aspect-ratio: 1 / 1;
    border-radius: 18px;
    margin-bottom: 0;
  }
}

@media (min-width: 1024px) {
  .lead-sk-cover { width: 320px; border-radius: 20px; }
}

@media (min-width: 1280px) {
  .lead-sk-cover { width: 360px; }
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
@media (max-width: 380px) {
  .lead-title { font-size: 18.5px; }
  .poll-label-name { font-size: 12.5px; }
  .poll-label-pct { font-size: 12.5px; }
  .lead-cta { padding: 14px; font-size: 14.5px; }
  .rest-card { flex: 0 0 180px; }
}

@media (hover: none) {
  .lead-card:hover .lead-cover img,
  .rest-card:hover,
  .rest-card:hover .rest-cover img {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lead-chip.live .live-dot { animation: none; }
  .skeleton { animation: none; background: var(--bg-subtle); }
  .poll-seg { transition: none; }
}
</style>
