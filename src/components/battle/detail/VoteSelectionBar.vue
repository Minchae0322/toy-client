<template>
  <transition name="slide-up">
    <div class="sticky-vote-pill">
      <div class="selection-dots">
        <div
            v-for="rank in (isWeightedVote ? [1, 2, 3] : [1])"
            :key="rank"
            :class="['dot', { filled: selectedRanks[rank] }]"
        >
          {{ rank }}
        </div>
      </div>

      <div class="selection-names" v-if="hasAllSelections">
        <span v-for="rank in (isWeightedVote ? [1, 2, 3] : [1])" :key="rank" class="selected-name">
          {{ getSelectedProductName(rank) }}
        </span>
      </div>

      <button @click="$emit('submit')" :disabled="submitting" class="glow-submit-btn">
        {{ submitting ? '전송 중...' : '투표 확정하기' }}
      </button>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

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

const hasAllSelections = computed(() => {
  if (props.isWeightedVote) {
    return props.selectedRanks[1] && props.selectedRanks[2] && props.selectedRanks[3]
  }
  return props.selectedRanks[1]
})

const getSelectedProductName = (rank) => {
  const itemId = props.selectedRanks[rank]
  const item = props.sortedItems.find(i => i.id === itemId)
  if (!item) return ''
  const name = props.getItemName(item)
  return name.length > 10 ? name.slice(0, 10) + '...' : name
}
</script>

<style scoped>
.sticky-vote-pill {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #111;
  color: #fff;
  padding: 14px 24px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  z-index: 1000;
}

.selection-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s;
}

.dot.filled {
  background: #4a6cf7;
  box-shadow: 0 0 12px rgba(74, 108, 247, 0.5);
}

.selection-names {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: #aaa;
}

.selected-name {
  padding: 4px 8px;
  background: #222;
  border-radius: 6px;
}

.glow-submit-btn {
  background: #4a6cf7;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.glow-submit-btn:hover:not(:disabled) {
  background: #3a5ce7;
  box-shadow: 0 0 20px rgba(74, 108, 247, 0.4);
}

.glow-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

@media (max-width: 768px) {
  .sticky-vote-pill {
    bottom: 20px;
    padding: 12px 16px;
    gap: 12px;
    left: 16px;
    right: 16px;
    transform: none;
    border-radius: 20px;
  }

  .selection-names {
    display: none;
  }

  .glow-submit-btn {
    flex: 1;
    text-align: center;
  }
}
</style>
