<template>
  <transition name="slide-up">
    <div class="sticky-vote-pill">
      <!-- 순위 dots -->
      <div class="selection-dots">
        <div
            v-for="rank in (isWeightedVote ? [1, 2, 3] : [1])"
            :key="rank"
            :class="['dot', { filled: selectedRanks[rank] }]"
        >
          {{ rank }}
        </div>
      </div>

      <!-- 선택된 상품명 (PC만) -->
      <div class="selection-names" v-if="hasAnySelection">
        <span
          v-for="rank in selectedRanksList"
          :key="rank"
          class="selected-name"
        >
          <span class="rank-label">{{ rank }}위</span>
          {{ getSelectedProductName(rank) }}
        </span>
      </div>

      <!-- 한줄 변론 입력란 -->
      <div class="argument-input-wrap">
        <input
          v-model="argumentText"
          type="text"
          class="arg-input"
          :placeholder="argumentPlaceholder"
          maxlength="100"
        />
        <span class="opt-tag">선택</span>
      </div>

      <!-- 선택 개수 (모바일) -->
      <div class="vote-count-info" v-if="isWeightedVote">
        <span class="count">{{ selectedCount }}/3</span>
      </div>

      <button @click="handleSubmit" :disabled="submitting" class="glow-submit-btn">
        {{ submitting ? '전송 중...' : '요거 픽하기!' }}
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const emit = defineEmits(['submit'])

const argumentText = ref('')

// 선택된 순위 목록 (1, 2, 3 중 선택된 것만)
const selectedRanksList = computed(() => {
  const ranks = []
  if (props.selectedRanks[1]) ranks.push(1)
  if (props.selectedRanks[2]) ranks.push(2)
  if (props.selectedRanks[3]) ranks.push(3)
  return ranks
})

// 선택된 픽 개수
const selectedCount = computed(() => selectedRanksList.value.length)

// 최소 1개 이상 선택했는지
const hasAnySelection = computed(() => selectedCount.value > 0)

// PICK 한마디 입력 placeholder
const argumentPlaceholder = computed(() => {
  if (props.selectedRanks[1]) {
    return '1위를 픽한 이유는? (선택)'
  }
  return 'PICK 한마디를 남겨보세요! (선택)'
})

const getSelectedProductName = (rank) => {
  const itemId = props.selectedRanks[rank]
  const item = props.sortedItems.find(i => i.id === itemId)
  if (!item) return ''
  const name = props.getItemName(item)
  return name.length > 8 ? name.slice(0, 8) + '...' : name
}

const handleSubmit = () => {
  emit('submit', argumentText.value.trim())
  argumentText.value = ''
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
  padding: 14px 20px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  max-width: 820px;
}

.selection-dots {
  display: flex;
  gap: 6px;
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
  gap: 6px;
  font-size: 12px;
  color: #ccc;
  flex-wrap: wrap;
  max-width: 200px;
}

.selected-name {
  padding: 5px 10px;
  background: #222;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.rank-label {
  color: #4a6cf7;
  font-weight: 700;
  font-size: 11px;
}

/* 한줄 변론 입력란 */
.argument-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.arg-input {
  flex: 1;
  padding: 9px 14px;
  border: 1.5px solid #333;
  border-radius: 12px;
  background: #1a1a1a;
  color: #fff;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.arg-input::placeholder {
  color: #555;
}

.arg-input:focus {
  border-color: #4a6cf7;
}

.opt-tag {
  font-size: 10px;
  color: #666;
  white-space: nowrap;
}

.vote-count-info {
  display: none;
}

.vote-count-info .count {
  font-size: 13px;
  font-weight: 600;
  color: #4a6cf7;
  background: rgba(74, 108, 247, 0.15);
  padding: 4px 10px;
  border-radius: 12px;
}

.glow-submit-btn {
  background: #4a6cf7;
  color: #fff;
  border: none;
  padding: 10px 28px;
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

/* 모바일 */
@media (max-width: 768px) {
  .sticky-vote-pill {
    bottom: 20px;
    padding: 12px 16px;
    gap: 10px;
    left: 16px;
    right: 16px;
    transform: none;
    border-radius: 20px;
    max-width: none;
    flex-wrap: wrap;
  }

  .selection-names {
    display: none;
  }

  .argument-input-wrap {
    order: 10;
    width: 100%;
    min-width: 0;
    flex: unset;
  }

  .arg-input {
    font-size: 13px;
    padding: 9px 12px;
  }

  .vote-count-info {
    display: flex;
    align-items: center;
  }

  .vote-count-info .count {
    font-size: 12px;
    padding: 3px 8px;
  }

  .glow-submit-btn {
    flex: 1;
    text-align: center;
    padding: 10px 16px;
  }
}
</style>
