<template>
  <div class="level-card" :style="cardStyle">
    <div class="level-card-header">
      <div class="level-info">
        <span class="tier-emoji">{{ tier.emoji }}</span>
        <div>
          <div class="tier-name" :style="{ color: tier.color }">{{ tier.name }}</div>
          <div class="level-number">Lv. {{ user.level }}</div>
        </div>
      </div>
      <div class="user-nickname">{{ user.nickname }}</div>
    </div>

    <div class="level-progress-section">
      <div class="progress-header">
        <span class="progress-label">다음 레벨까지</span>
        <span class="progress-value">
          {{ user.currentExp }} / {{ nextExp }} EXP
        </span>
      </div>
      <div class="progress-bar-track">
        <div
          class="progress-bar-fill"
          :style="{ width: progress + '%', background: tier.color }"
        ></div>
      </div>
      <div class="progress-percentage">{{ progress }}%</div>
    </div>

    <div class="level-stats">
      <div class="stat-box">
        <span class="stat-value">{{ formatNumber(user.totalExp) }}</span>
        <span class="stat-label">총 EXP</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">{{ user.certificationCount }}</span>
        <span class="stat-label">인증</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">{{ formatNumber(user.fireCount) }}</span>
        <span class="stat-label">받은 🔥</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">{{ formatNumber(user.followerCount) }}</span>
        <span class="stat-label">팔로워</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getTierByLevel, getNextLevelExp, getLevelProgress } from '@/data/levelSystemData.js'

const props = defineProps({
  user: { type: Object, required: true },
})

const tier = computed(() => getTierByLevel(props.user.level))
const nextExp = computed(() => getNextLevelExp(props.user.level) || '∞')
const progress = computed(() => getLevelProgress(props.user.level, props.user.currentExp))

const cardStyle = computed(() => ({
  borderColor: tier.value.borderColor,
  background: tier.value.bgColor,
}))

function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + '만'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}
</script>

<style scoped>
.level-card {
  border: 2px solid;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.level-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tier-emoji { font-size: 36px; line-height: 1; }

.tier-name {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-number {
  font-size: 22px;
  font-weight: 800;
  color: #222;
}

.user-nickname {
  font-size: 14px;
  font-weight: 600;
  color: #64748B;
  background: white;
  padding: 4px 12px;
  border-radius: 20px;
}

.level-progress-section { margin-bottom: 20px; }

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label { font-size: 12px; color: #64748B; font-weight: 500; }
.progress-value { font-size: 13px; font-weight: 600; color: #222; }

.progress-bar-track {
  height: 10px;
  background: rgba(255,255,255,0.8);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s ease;
}

.progress-percentage {
  text-align: right;
  font-size: 11px;
  color: #64748B;
  margin-top: 4px;
  font-weight: 500;
}

.level-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-box {
  text-align: center;
  padding: 10px 4px;
  background: rgba(255,255,255,0.7);
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.04);
}

.stat-value { display: block; font-size: 16px; font-weight: 700; color: #222; }
.stat-label { display: block; font-size: 11px; color: #64748B; margin-top: 2px; }
</style>
