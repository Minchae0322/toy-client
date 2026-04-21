<template>
  <div class="section-card">
    <h3 class="section-title">등급 로드맵</h3>

    <div class="roadmap">
      <div
        v-for="(tier, tIdx) in tiers"
        :key="tier.tier"
        class="tier-group"
        :class="{
          current: currentTier.tier === tier.tier,
          achieved: isTierAchieved(tier),
          locked: isTierLocked(tier),
        }"
      >
        <!-- 티어 간 연결선 -->
        <div v-if="tIdx > 0" class="group-divider">
          <div class="divider-line" :class="{ filled: !isTierLocked(tier) }"></div>
        </div>

        <!-- 티어 헤더 -->
        <div class="tier-header">
          <span
            class="tier-name"
            :style="{ color: isTierLocked(tier) ? '#b0b8c4' : tier.color }"
          >{{ tier.name }}</span>
          <span class="tier-range">Lv.{{ tier.levelRange[0] }}–{{ tier.levelRange[1] === 99 ? '∞' : tier.levelRange[1] }}</span>
        </div>

        <!-- 5색 랭크 프로그레션 -->
        <div class="color-row">
          <div
            v-for="(rank, rIdx) in RANKS"
            :key="rank"
            class="rank-cell"
            :class="{
              'is-current': isCurrentSlot(tier, rIdx),
              'is-done': isSlotDone(tier, rIdx),
              'is-locked': isSlotLocked(tier, rIdx),
            }"
          >
            <div class="art-wrap" :class="{ highlight: isCurrentSlot(tier, rIdx) }">
              <YogurtTierArt :tier="tier.art" :color="rank" :size="artSize" />
            </div>
            <span class="rank-lv">{{ slotLabel(tier, rIdx) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { LEVEL_TIERS, getTierByLevel } from '@/data/levelSystemData.js'
import YogurtTierArt from '@/components/identity/YogurtTierArt.vue'

const RANKS = ['white', 'blue', 'violet', 'red', 'gold']

const props = defineProps({
  userLevel: { type: Number, required: true },
})

const tiers = LEVEL_TIERS
const currentTier = computed(() => getTierByLevel(props.userLevel))

// 반응형 아트 사이즈
const vw = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const onResize = () => (vw.value = window.innerWidth)
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
const artSize = computed(() => (vw.value >= 768 ? 36 : 30))

/* ---- 슬롯(rank) 레벨 범위 계산 ---- */
function slotRange(tier, rIdx) {
  const [min, max] = tier.levelRange
  const span = max - min + 1
  const per = span / 5
  const start = min + Math.floor(rIdx * per)
  const end = rIdx === 4 ? max : min + Math.floor((rIdx + 1) * per) - 1
  return [start, end]
}

function slotLabel(tier, rIdx) {
  const [s, e] = slotRange(tier, rIdx)
  return s === e ? `Lv.${s}` : `Lv.${s}`
}

/* ---- 상태 판정 ---- */
function isTierAchieved(tier) {
  const uIdx = LEVEL_TIERS.findIndex((t) => t.tier === currentTier.value.tier)
  const tIdx = LEVEL_TIERS.findIndex((t) => t.tier === tier.tier)
  return tIdx < uIdx
}

function isTierLocked(tier) {
  return !isTierAchieved(tier) && currentTier.value.tier !== tier.tier
}

function isSlotDone(tier, rIdx) {
  const [, end] = slotRange(tier, rIdx)
  return props.userLevel > end
}

function isCurrentSlot(tier, rIdx) {
  const [start, end] = slotRange(tier, rIdx)
  return props.userLevel >= start && props.userLevel <= end
}

function isSlotLocked(tier, rIdx) {
  return !isSlotDone(tier, rIdx) && !isCurrentSlot(tier, rIdx)
}
</script>

<style scoped>
.section-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
}
@media (min-width: 768px) { .section-card { padding: 22px; } }

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #0A0E1A;
  margin-bottom: 18px;
  letter-spacing: -0.2px;
}
@media (min-width: 768px) { .section-title { font-size: 16px; } }

/* ===== 로드맵 전체 ===== */
.roadmap {
  display: flex;
  flex-direction: column;
}

/* ===== 티어 그룹 ===== */
.tier-group { position: relative; }

/* ===== 그룹 간 연결 ===== */
.group-divider {
  display: flex;
  justify-content: center;
  padding: 6px 0;
}
.divider-line {
  width: 2px;
  height: 16px;
  background: #E5E7EB;
  border-radius: 1px;
}
.divider-line.filled { background: #a855f7; }

/* ===== 티어 헤더 ===== */
.tier-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}
.tier-name {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
}
.tier-range {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

/* ===== 5색 랭크 프로그레션 ===== */
.color-row {
  display: flex;
  gap: 6px;
}
@media (min-width: 768px) { .color-row { gap: 10px; } }

.rank-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.art-wrap {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #F7F8FA;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
}
@media (min-width: 768px) {
  .art-wrap { width: 44px; height: 44px; border-radius: 10px; }
}

.art-wrap.highlight {
  background: white;
  box-shadow: 0 0 0 2.5px #a855f7, 0 2px 8px rgba(168, 85, 247, 0.18);
}

.rank-cell.is-done .art-wrap { background: white; }

.rank-cell.is-locked .art-wrap {
  opacity: 0.35;
  filter: saturate(0.15);
}

.rank-lv {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: -0.2px;
}

.rank-cell.is-current .rank-lv {
  color: #7c3aed;
  font-weight: 800;
}

.rank-cell.is-locked .rank-lv {
  color: #cbd5e1;
}
</style>
