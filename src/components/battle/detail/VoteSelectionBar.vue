<template>
  <div class="vote-bar">
    <div class="vote-bar-content">
      <div class="vote-selected">
        <span class="vote-label">선택:</span>
        <div v-if="isWeightedVote" class="vote-ranks">
          <div v-for="rank in [1, 2, 3]" :key="rank" class="vote-rank-item">
            <span :class="['rank-badge', `rank-${rank}`]">
              {{ rank }}위
            </span>
            <span class="vote-product-name">
              {{ getSelectedProductName(rank) }}
            </span>
          </div>
        </div>
        <span v-else class="vote-product-name">
          {{ getSelectedProductName(1) }}
        </span>
      </div>

      <button @click="$emit('submit')" :disabled="submitting" class="btn-submit">
        {{ submitting ? '투표 중...' : '투표 완료하기' }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedRanks: {
    type: Object,
    required: true
  },
  isWeightedVote: {
    type: Boolean,
    required: true
  },
  sortedItems: {
    type: Array,
    required: true
  },
  submitting: {
    type: Boolean,
    default: false
  },
  getItemName: {
    type: Function,
    required: true
  }
})

defineEmits(['submit'])

const getSelectedProductName = (rank) => {
  const itemId = props.selectedRanks[rank]
  const item = props.sortedItems.find(i => i.id === itemId)
  return item ? props.getItemName(item) : '미선택'
}
</script>

<style scoped>
.vote-bar {
  position: sticky;
  top: 56px;
  background: white;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 40;
}

.vote-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vote-selected {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.vote-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.vote-ranks {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.vote-rank-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank-badge {
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}

.rank-badge.rank-1 {
  background-color: #fef3c7;
  color: #92400e;
}

.rank-badge.rank-2 {
  background-color: #f3f4f6;
  color: #374151;
}

.rank-badge.rank-3 {
  background-color: #fed7aa;
  color: #9a3412;
}

.vote-product-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.btn-submit {
  padding: 10px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .vote-bar-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .vote-selected {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-submit {
    width: 100%;
  }
}
</style>
