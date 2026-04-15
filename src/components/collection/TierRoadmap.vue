<template>
  <div class="section-card">
    <h3 class="section-title">등급 로드맵</h3>
    <div class="tier-roadmap">
      <div
        v-for="(tier, idx) in tiers"
        :key="tier.tier"
        class="roadmap-item"
        :class="{
          current: currentTier.tier === tier.tier,
          achieved: isAchieved(tier),
          locked: !isAchieved(tier) && currentTier.tier !== tier.tier
        }"
      >
        <div class="roadmap-connector" v-if="idx > 0">
          <div
            class="connector-line"
            :class="{ filled: isAchieved(tier) || currentTier.tier === tier.tier }"
          ></div>
        </div>
        <div
          class="roadmap-circle"
          :style="{
            borderColor: (isAchieved(tier) || currentTier.tier === tier.tier) ? tier.color : '#E5E7EB',
            background: (isAchieved(tier) || currentTier.tier === tier.tier) ? tier.color : 'white',
            color: (isAchieved(tier) || currentTier.tier === tier.tier) ? 'white' : '#CBD5E1',
          }"
        >
          <component :is="getTierIcon(tier.tier)" :size="18" :stroke-width="2.2" />
        </div>
        <div class="roadmap-info">
          <span
            class="roadmap-name"
            :style="{ color: (isAchieved(tier) || currentTier.tier === tier.tier) ? tier.color : '#9ca3af' }"
          >{{ tier.name }}</span>
          <span class="roadmap-levels">Lv.{{ tier.levelRange[0] }}-{{ tier.levelRange[1] === 99 ? '∞' : tier.levelRange[1] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { LEVEL_TIERS, getTierByLevel } from '@/data/levelSystemData.js'
import { getTierIcon } from '@/utils/collectionIcons.js'

const props = defineProps({
  userLevel: { type: Number, required: true },
})

const tiers = LEVEL_TIERS
const currentTier = computed(() => getTierByLevel(props.userLevel))

function isAchieved(tier) {
  const userTierIdx = LEVEL_TIERS.findIndex((t) => t.tier === currentTier.value.tier)
  const thisTierIdx = LEVEL_TIERS.findIndex((t) => t.tier === tier.tier)
  return thisTierIdx < userTierIdx
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
  margin-bottom: 16px;
  letter-spacing: -0.2px;
}

@media (min-width: 768px) { .section-title { font-size: 16px; } }

.tier-roadmap {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding: 0 4px;
}

.roadmap-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 0;
}

.roadmap-connector {
  position: absolute;
  top: 22px;
  right: 50%;
  width: 100%;
  height: 3px;
  z-index: 0;
}

.connector-line {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  border-radius: 2px;
}

.connector-line.filled { background: #a855f7; }

.roadmap-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2.5px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
  background: white;
}

.roadmap-item.current .roadmap-circle {
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15);
  transform: scale(1.1);
}

.roadmap-circle svg { line-height: 1; }

.roadmap-info { text-align: center; margin-top: 10px; }
.roadmap-name { display: block; font-size: 12px; font-weight: 800; letter-spacing: -0.1px; }
.roadmap-levels { display: block; font-size: 11px; color: #94a3b8; margin-top: 2px; font-weight: 600; }

.roadmap-connector { top: 24px; }
</style>
