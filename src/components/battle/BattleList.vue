<template>
  <div class="battles-container">
    <div v-if="loading && battles.length === 0" class="loading-container">
      <div class="loading-spinner">배틀을 불러오는 중...</div>
    </div>

    <div v-else-if="battles.length === 0" class="empty-container">
      <p class="empty-message">배틀이 없습니다.</p>
    </div>

    <div v-else class="battles-grid">
      <div
          v-for="battle in battles"
          :key="battle.battleId"
          class="battle-card"
          @click="$emit('battle-click', battle.battleId)"
      >
        <div class="battle-meta">
          <span class="battle-category">{{ battle.category }}</span>
          <span class="battle-type" :class="{ curation: battle.type === 'CURATION' }">
            {{ battle.type === 'CURATION' ? '큐레이션' : '오픈배틀' }}
          </span>
        </div>
        <div class="battle-title">{{ battle.title }}</div>
        <div class="battle-stats">
          <div class="battle-stat">
            <span class="stat-value">{{ battle.participantCount }}</span>
            <span class="stat-label">참여자</span>
          </div>
          <div class="battle-stat">
            <span class="stat-value">{{ formatNumber(battle.voteCount) }}</span>
            <span class="stat-label">투표</span>
          </div>
          <div class="battle-stat">
            <span class="stat-value">{{ battle.productCount }}</span>
            <span class="stat-label">제품</span>
          </div>
        </div>
        <div class="battle-footer">
          <div class="battle-creator">@{{ battle.creatorUsername }}</div>
          <div class="battle-dday" :class="{ urgent: battle.dDay <= 7 }">
            D-{{ battle.dDay }}
          </div>
        </div>
      </div>
    </div>

    <!-- Intersection Observer Target -->
    <div v-if="hasNext" ref="observerTarget" class="observer-target"></div>

    <div v-if="loading && battles.length > 0" class="loading-more">
      <div class="loading-spinner">더 불러오는 중...</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  battles: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasNext: {
    type: Boolean,
    default: true
  }
});

defineEmits(['battle-click']);

const observerTarget = ref(null);

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};

defineExpose({
  observerTarget
});
</script>

<style scoped>
.battles-container {
  position: relative;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner,
.empty-message {
  font-size: 14px;
  color: #9CA3AF;
}

.battles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

@media (max-width: 768px) {
  .battles-grid {
    grid-template-columns: 1fr;
  }
}

.battle-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #F0F0F3;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.battle-card:hover {
  border-color: #E5E7EB;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.battle-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.battle-category {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
}

.battle-type {
  padding: 3px 8px;
  background: #F3F4F6;
  color: #6B7280;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.battle-type.curation {
  background: #FEF3C7;
  color: #92400E;
}

.battle-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  line-height: 1.4;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}

.battle-stats {
  display: flex;
  gap: 32px;
  padding: 20px 0;
  border-top: 1px solid #F9FAFB;
  border-bottom: 1px solid #F9FAFB;
  margin-bottom: 20px;
}

.battle-stat {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #9CA3AF;
}

.battle-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.battle-creator {
  font-size: 13px;
  color: #6B7280;
}

.battle-dday {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
}

.battle-dday.urgent {
  color: #DC2626;
}

.observer-target {
  height: 20px;
  margin-top: 20px;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>