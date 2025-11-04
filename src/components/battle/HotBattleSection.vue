<template>
  <section class="hot-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="fire-emoji">🔥</span>
        지금 가장 핫한 배틀
      </h2>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <div v-else class="hot-battles-grid">
      <div
          v-for="(battle, index) in battles"
          :key="battle.battleId"
          class="hot-battle-card"
          :class="{ 'rank-1': index === 0, 'rank-2': index === 1 }"
          @click="$emit('battle-click', battle.battleId)"
      >
        <div class="hot-rank">#{{ index + 1 }}</div>
        <div class="hot-title">{{ battle.title }}</div>
        <div class="hot-stats">
          <div class="hot-stat">
            <span class="hot-stat-value">{{ formatNumber(battle.participantCount) }}</span>
            <span class="hot-stat-label">참여</span>
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
          <span class="creator-level">Lv.{{ battle.creatorLevel }}</span>
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
  if (num >= 10000) {
    return Math.floor(num / 1000) / 10 + '만';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};
</script>

<style scoped>
.hot-section {
  margin-bottom: 44px;
}

.section-header {
  margin-bottom: 18px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 650;
  color: #0A0A0A;
  letter-spacing: -0.018em;
  margin: 0;
}

.fire-emoji {
  font-size: 18px;
  line-height: 1;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 240px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #F2F2F2;
  border-top-color: #0A0A0A;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hot-battles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .hot-battles-grid {
    grid-template-columns: 1fr;
  }
}

.hot-battle-card {
  background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%);
  border-radius: 14px;
  padding: 24px;
  color: white;
  cursor: pointer;
  transition: all 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hot-battle-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 220ms ease;
}

.hot-battle-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.24);
  border-color: rgba(255, 255, 255, 0.12);
}

.hot-battle-card:hover::before {
  opacity: 1;
}

.hot-battle-card.rank-1 {
  background: linear-gradient(135deg, #FF6B35 0%, #F73859 100%);
}

.hot-battle-card.rank-2 {
  background: #FFFFFF;
  color: #0A0A0A;
  border: 1.5px solid #E8E8E8;
}

.hot-battle-card.rank-2::before {
  display: none;
}

.hot-battle-card.rank-2:hover {
  border-color: #D4D4D4;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.hot-rank {
  font-size: 11px;
  font-weight: 650;
  opacity: 0.6;
  margin-bottom: 12px;
  letter-spacing: 0.04em;
}

.hot-battle-card.rank-2 .hot-rank {
  opacity: 0.5;
}

.hot-title {
  font-size: 17px;
  font-weight: 650;
  margin-bottom: 18px;
  line-height: 1.3;
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-stats {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.hot-battle-card.rank-2 .hot-stats {
  border-bottom-color: #E8E8E8;
}

.hot-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hot-stat-value {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.014em;
  font-variant-numeric: tabular-nums;
}

.hot-stat-label {
  font-size: 11px;
  opacity: 0.7;
  font-weight: 500;
}

.hot-creator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  opacity: 0.8;
  font-weight: 500;
}

.hot-battle-card.rank-2 .hot-creator {
  opacity: 0.6;
}

.creator-level {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 590;
}

.hot-battle-card.rank-2 .creator-level {
  background: #F2F2F2;
}

@media (max-width: 640px) {
  .hot-battle-card {
    padding: 20px;
  }

  .hot-title {
    font-size: 15.5px;
  }

  .hot-stat-value {
    font-size: 18px;
  }
}
</style>