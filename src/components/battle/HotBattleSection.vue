<template>
  <section class="hot-section">
    <div class="section-header">
      <h2 class="section-title">🔥 지금 가장 핫한 배틀</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">로딩중...</div>
    </div>

    <div v-else class="hot-battles-grid">
      <div
          v-for="(battle, index) in battles"
          :key="battle.battleId"
          class="hot-battle-card"
          :class="{ secondary: index === 1 }"
          @click="$emit('battle-click', battle.battleId)"
      >
        <div class="hot-rank">RANK #{{ index + 1 }}</div>
        <div class="hot-title">{{ battle.title }}</div>
        <div class="hot-stats">
          <div class="hot-stat">
            <span class="hot-stat-value">{{ formatNumber(battle.participantCount) }}</span>
            <span class="hot-stat-label">참여자</span>
          </div>
          <div class="hot-stat">
            <span class="hot-stat-value">{{ formatNumber(battle.voteCount) }}</span>
            <span class="hot-stat-label">투표</span>
          </div>
          <div class="hot-stat">
            <span class="hot-stat-value">{{ battle.productCount }}</span>
            <span class="hot-stat-label">제품</span>
          </div>
        </div>
        <div class="hot-creator">
          <span>@{{ battle.creatorUsername }}</span>
          <span class="dot-separator"></span>
          <span>Lv.{{ battle.creatorLevel }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  battles: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['battle-click']);

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};
</script>

<style scoped>
.hot-section {
  margin-bottom: 56px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  letter-spacing: -0.01em;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner {
  font-size: 14px;
  color: #9CA3AF;
}

.hot-battles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

@media (max-width: 768px) {
  .hot-battles-grid {
    grid-template-columns: 1fr;
  }
}

.hot-battle-card {
  background: #1A1A1A;
  border-radius: 16px;
  padding: 32px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.hot-battle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.hot-battle-card.secondary {
  background: #FFFFFF;
  border: 2px solid #1A1A1A;
  color: #1A1A1A;
}

.hot-rank {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.7;
  margin-bottom: 16px;
  letter-spacing: 0.05em;
}

.hot-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.hot-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.hot-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hot-stat-value {
  font-size: 24px;
  font-weight: 700;
}

.hot-stat-label {
  font-size: 12px;
  opacity: 0.7;
}

.hot-creator {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  opacity: 0.8;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.hot-battle-card.secondary .hot-creator {
  border-top-color: #F0F0F3;
  opacity: 0.6;
}

.dot-separator {
  display: inline-block;
  width: 2px;
  height: 2px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.5;
}
</style>