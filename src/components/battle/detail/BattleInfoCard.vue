<template>
  <div class="battle-info">
    <div class="battle-info-main">
      <div class="battle-info-left">
        <div class="tags">
          <span class="tag">{{ categoryName }}</span>
          <span v-if="isWeightedVote" class="tag tag-primary">
            순위 투표 (1위 3점, 2위 2점, 3위 1점)
          </span>
          <span :class="['tag', 'tag-status', statusClass]">
            {{ statusLabel }}
          </span>
        </div>
        <h1 class="title">{{ battle.title }}</h1>
        <p v-if="battle.description" class="description">{{ battle.description }}</p>
      </div>

      <div class="battle-stats">
        <div class="stat">
          <div class="stat-value">{{ formattedDaysLeft }}</div>
          <div class="stat-label">남은 기간</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ formattedParticipants }}</div>
          <div class="stat-label">참여</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ formattedVotes }}</div>
          <div class="stat-label">투표</div>
        </div>
      </div>
    </div>

    <!-- Add Product Button -->
    <button
        v-if="canUserAddItem && !hasVoted"
        @click="$emit('add-product')"
        class="btn-add-product"
    >
      <span class="icon">+</span>
      내가 아는 좋은 제품 추가하기
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { battleUtils } from '@/services/BattleService.js'

const props = defineProps({
  battle: {
    type: Object,
    required: true
  },
  isWeightedVote: {
    type: Boolean,
    required: true
  },
  canUserAddItem: {
    type: Boolean,
    required: true
  },
  hasVoted: {
    type: Boolean,
    required: true
  }
})

defineEmits(['add-product'])

const categoryName = computed(() => {
  return props.battle.subCategoryDetail?.subCategoryName || '카테고리'
})

const statusTitle = computed(() => {
  return props.battle.status?.title || props.battle.status
})

const statusClass = computed(() => {
  const classes = {
    'DRAFT': 'status-draft',
    'ACTIVE': 'status-active',
    'CLOSED': 'status-closed',
    'EARLY_CLOSED': 'status-early-closed'
  }
  return classes[statusTitle.value] || ''
})

const statusLabel = computed(() => {
  const labels = {
    'DRAFT': '임시저장',
    'ACTIVE': '진행중',
    'CLOSED': '종료',
    'EARLY_CLOSED': '조기종료'
  }
  return labels[statusTitle.value] || ''
})

const formattedDaysLeft = computed(() => {
  return battleUtils.formatDaysLeft(props.battle.endDate)
})

const formattedParticipants = computed(() => {
  return battleUtils.formatCount(props.battle.totalParticipants)
})

const formattedVotes = computed(() => {
  return battleUtils.formatCount(props.battle.totalVotes)
})
</script>

<style scoped>
.battle-info {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 24px;
}

.battle-info-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.battle-info-left {
  flex: 1;
}

.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f3f4f6;
  color: #6b7280;
}

.tag-primary {
  background-color: #eff6ff;
  color: #2563eb;
}

.tag-status {
  font-weight: 600;
}

.status-draft {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-active {
  background-color: #d1fae5;
  color: #059669;
}

.status-closed {
  background-color: #fef3c7;
  color: #d97706;
}

.status-early-closed {
  background-color: #f1f5f9;
  color: #475569;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.battle-stats {
  display: flex;
  gap: 24px;
  margin-left: 24px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.btn-add-product {
  width: 100%;
  padding: 12px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-add-product:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #eff6ff;
}

.icon {
  font-size: 16px;
  line-height: 1;
}

@media (max-width: 768px) {
  .battle-info-main {
    flex-direction: column;
    gap: 16px;
  }

  .battle-stats {
    margin-left: 0;
  }

  .title {
    font-size: 20px;
  }
}
</style>
