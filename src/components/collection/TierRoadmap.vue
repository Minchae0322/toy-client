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
            borderColor: (isAchieved(tier) || currentTier.tier === tier.tier) ? tier.color : '#d1d5db',
            background: isAchieved(tier) ? tier.bgColor : (currentTier.tier === tier.tier ? tier.bgColor : '#f9fafb'),
          }"
        >
          <span class="roadmap-emoji">{{ tier.emoji }}</span>
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
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title { font-size: 16px; font-weight: 700; color: #222; margin-bottom: 16px; }

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
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

.roadmap-item.current .roadmap-circle {
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15);
  transform: scale(1.1);
}

.roadmap-emoji { font-size: 18px; line-height: 1; }

.roadmap-item.locked .roadmap-emoji {
  filter: grayscale(0.6);
  opacity: 0.5;
}

.roadmap-info { text-align: center; margin-top: 8px; }
.roadmap-name { display: block; font-size: 11px; font-weight: 700; }
.roadmap-levels { display: block; font-size: 10px; color: #9ca3af; margin-top: 1px; }
</style>
