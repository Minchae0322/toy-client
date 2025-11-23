<template>
  <div class="battle-info-section">
    <div class="info-card">
      <div class="card-header">
        <div class="header-content">
          <div class="meta-badges">
            <span class="category-badge">{{ battle.category }}</span>
            <span v-if="isWeighted" class="weighted-badge">
              순위 투표 (1위 3점, 2위 2점, 3위 1점)
            </span>
          </div>

          <h1 class="battle-title">{{ battle.title }}</h1>
          <p class="battle-desc">{{ battle.description }}</p>
        </div>

        <div class="stats-group">
          <div class="stat-box">
            <div class="stat-number">{{ remainingDays }}</div>
            <div class="stat-text">일 남음</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">{{ formatParticipants }}</div>
            <div class="stat-text">참여</div>
          </div>
        </div>
      </div>

      <button
          v-if="battle.itemAddPermissionType !== 'CREATOR_ONLY' && !hasVoted && battle.status === 'ACTIVE'"
          @click="$emit('add-product')"
          class="add-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
        </svg>
        내가 아는 좋은 제품 추가하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  battle: {
    type: Object,
    required: true
  },
  remainingDays: {
    type: Number,
    required: true
  },
  isWeighted: {
    type: Boolean,
    required: true
  },
  hasVoted: {
    type: Boolean,
    required: true
  }
})

defineEmits(['add-product'])

const formatParticipants = computed(() => {
  const num = props.battle.totalParticipants || 0
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
})
</script>

<style scoped>
.battle-info-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.info-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  padding: 24px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-content {
  flex: 1;
}

.meta-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.category-badge {
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  padding: 4px 8px;
  background: #F3F4F6;
  border-radius: 4px;
}

.weighted-badge {
  font-size: 12px;
  font-weight: 500;
  color: #2563EB;
  padding: 4px 8px;
  background: #DBEAFE;
  border-radius: 4px;
}

.battle-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.battle-desc {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
  line-height: 1.4;
}

.stats-group {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: 24px;
  flex-shrink: 0;
}

.stat-box {
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.stat-text {
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
}

.add-btn {
  width: 100%;
  padding: 12px;
  border: 2px dashed #D1D5DB;
  border-radius: 8px;
  background: transparent;
  color: #6B7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.add-btn:hover {
  border-color: #3B82F6;
  color: #2563EB;
  background: #EFF6FF;
}

@media (max-width: 768px) {
  .battle-info-section {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
  }

  .stats-group {
    margin-left: 0;
    margin-top: 16px;
    width: 100%;
    justify-content: flex-start;
  }

  .battle-title {
    font-size: 20px;
  }
}
</style>