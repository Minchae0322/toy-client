<template>
  <transition name="slide-up">
    <div class="vote-bar">
      <!-- 선택된 아이템들 -->
      <div class="selected-items">
        <div
          v-for="rank in displayRanks"
          :key="rank"
          :class="['item-slot', { filled: selectedRanks[rank], empty: !selectedRanks[rank] }]"
        >
          <template v-if="selectedRanks[rank]">
            <img
              :src="getSelectedItemImage(rank)"
              :alt="getSelectedProductName(rank)"
              class="item-thumb"
            />
            <div class="item-info">
              <span v-if="isWeightedVote" class="rank-badge">{{ rank }}위</span>
              <span class="item-name">{{ getSelectedProductName(rank) }}</span>
            </div>
            <button class="remove-btn" @click.stop="handleRemove(rank)" :disabled="submitting">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </template>
          <template v-else>
            <div class="empty-slot">
              <span v-if="isWeightedVote" class="rank-num">{{ rank }}위</span>
              <span v-else class="pick-hint">선택해주세요</span>
            </div>
          </template>
        </div>
      </div>

      <!-- 제출 버튼 -->
      <button
        @click="handleSubmit"
        :disabled="submitting || !hasAnySelection"
        class="submit-btn"
      >
        <template v-if="submitting">
          <span class="spinner"></span>
        </template>
        <template v-else>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>픽 완료</span>
        </template>
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

const emit = defineEmits(['submit', 'remove'])

// 표시할 순위들
const displayRanks = computed(() => {
  return props.isWeightedVote ? [1, 2, 3] : [1]
})

// 선택된 순위 목록
const selectedRanksList = computed(() => {
  const ranks = []
  if (props.selectedRanks[1]) ranks.push(1)
  if (props.selectedRanks[2]) ranks.push(2)
  if (props.selectedRanks[3]) ranks.push(3)
  return ranks
})

// 최소 1개 이상 선택했는지
const hasAnySelection = computed(() => selectedRanksList.value.length > 0)

// 선택된 아이템 찾기
const getSelectedItem = (rank) => {
  const itemId = props.selectedRanks[rank]
  return props.sortedItems.find(i => i.id === itemId)
}

// 선택된 상품명
const getSelectedProductName = (rank) => {
  const item = getSelectedItem(rank)
  if (!item) return ''
  const name = props.getItemName(item)
  return name.length > 12 ? name.slice(0, 12) + '...' : name
}

// 선택된 아이템 이미지
const getSelectedItemImage = (rank) => {
  const item = getSelectedItem(rank)
  if (!item) return ''
  return item.battleItemProduct?.thumbnailDto?.fileUrl ||
         item.customImageUrl ||
         'https://placehold.co/40x40?text=?'
}

// 제출
const handleSubmit = () => {
  emit('submit', '')
}

// 선택 취소
const handleRemove = (rank) => {
  emit('remove', rank)
}
</script>

<style scoped>
.vote-bar {
  position: fixed;
  /* iOS 홈 인디케이터 회피 */
  bottom: calc(24px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  background: #111;
  padding: 12px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.05);
  z-index: 1000;
  max-width: 600px;
}

/* 선택된 아이템들 */
.selected-items {
  display: flex;
  gap: 8px;
}

.item-slot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 12px;
  transition: all 0.2s;
  min-width: 120px;
}

.item-slot.filled {
  background: #1e1e1e;
  border: 1.5px solid #333;
}

.item-slot.empty {
  background: transparent;
  border: 1.5px dashed #444;
}

.item-thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rank-badge {
  font-size: 10px;
  font-weight: 700;
  color: #4a6cf7;
  text-transform: uppercase;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #333;
  border: none;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.remove-btn:hover:not(:disabled) {
  background: #ef4444;
  color: #fff;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 빈 슬롯 */
.empty-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 100%;
}

.rank-num {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.pick-hint {
  font-size: 12px;
  color: #555;
}

/* 제출 버튼 */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #4a6cf7 0%, #6366f1 100%);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
  min-width: 110px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(74, 108, 247, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #333;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  .vote-bar {
    bottom: 16px;
    left: 12px;
    right: 12px;
    transform: none;
    padding: 10px 12px;
    gap: 10px;
    border-radius: 16px;
    max-width: none;
  }

  .selected-items {
    flex: 1;
    overflow-x: auto;
    gap: 6px;
    -webkit-overflow-scrolling: touch;
  }

  .selected-items::-webkit-scrollbar {
    display: none;
  }

  .item-slot {
    min-width: auto;
    padding: 5px 8px;
  }

  .item-slot.empty {
    min-width: 70px;
  }

  .item-thumb {
    width: 32px;
    height: 32px;
  }

  .item-info {
    display: none;
  }

  .item-slot.filled {
    position: relative;
  }

  /* 모바일에서 순위 뱃지를 이미지 위에 표시 */
  .item-slot.filled .rank-badge {
    display: none;
  }

  .item-slot.filled::before {
    content: attr(data-rank);
    position: absolute;
    top: -4px;
    left: -4px;
    width: 18px;
    height: 18px;
    background: #4a6cf7;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .remove-btn {
    width: 20px;
    height: 20px;
  }

  .remove-btn svg {
    width: 12px;
    height: 12px;
  }

  .empty-slot {
    height: 32px;
  }

  .rank-num {
    font-size: 12px;
  }

  .submit-btn {
    padding: 10px 16px;
    font-size: 14px;
    min-width: 90px;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .vote-bar {
    bottom: 12px;
    left: 8px;
    right: 8px;
  }
}
</style>
