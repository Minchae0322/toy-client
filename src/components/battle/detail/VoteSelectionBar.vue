<template>
  <transition name="slide-up">
    <div class="vote-bar">
      <!-- 선택된 아이템들 -->
      <div class="selected-items">
        <div
          v-for="rank in displayRanks"
          :key="rank"
          :data-rank="isWeightedVote ? rank : null"
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
              <svg class="empty-plus" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <template v-if="isWeightedVote">
                <span class="rank-num">{{ rank }}위</span>
                <span class="rank-opt">선택</span>
              </template>
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
          <span v-if="isWeightedVote && selectedCount > 0" class="submit-count">{{ selectedCount }}개</span>
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

// 선택된 개수 (진행 상태 표시용)
const selectedCount = computed(() => selectedRanksList.value.length)

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
  background: var(--bg-elevated);
  padding: 12px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-lg);
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
  background: var(--bg-subtle);
  border: 1.5px solid var(--border-strong);
}

.item-slot.empty {
  background: var(--bg-subtle);
  border: 1.5px dashed var(--c-text-400);
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
  color: var(--c-info);
  text-transform: uppercase;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-mute);
  border: none;
  color: var(--c-text-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.remove-btn:hover:not(:disabled) {
  background: var(--c-danger);
  color: #ffffff;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 빈 슬롯 — 클릭 가능 신호 명확히 */
.empty-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 36px;
  width: 100%;
  color: var(--c-text-500);
}

.empty-plus {
  flex-shrink: 0;
  opacity: 0.85;
}

.rank-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-500);
}

.rank-opt {
  font-size: 10px;
  font-weight: 600;
  color: var(--c-text-500);
  background: var(--bg-mute);
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: -0.1px;
}

.pick-hint {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-500);
}

/* 제출 버튼 — 솔리드 brand, 페이지의 메인 CTA와 통일 */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--c-brand);
  color: #ffffff;
  border: none;
  padding: 12px 22px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.3px;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
  font-family: inherit;
  white-space: nowrap;
  min-width: 110px;
  box-shadow: 0 4px 14px rgba(147, 51, 234, 0.35), 0 2px 4px rgba(147, 51, 234, 0.18);
}

.submit-btn:hover:not(:disabled) {
  background: var(--c-brand-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(147, 51, 234, 0.45), 0 2px 6px rgba(147, 51, 234, 0.22);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
}

.submit-btn:disabled {
  cursor: not-allowed;
  background: var(--bg-mute);
  color: var(--c-text-400);
  box-shadow: none;
}

/* 진행 상태 카운트 */
.submit-count {
  font-size: 12px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.22);
  padding: 2px 8px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
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

  /* 모바일에서 순위 뱃지를 이미지 위에 표시 (가중치 모드만) */
  .item-slot.filled .rank-badge {
    display: none;
  }

  .item-slot.filled[data-rank]::before {
    content: attr(data-rank);
    position: absolute;
    top: -4px;
    left: -4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }

  /* rank별 메달 컬러 — ProductCard와 일관 */
  .item-slot.filled[data-rank="1"]::before { background: var(--c-warning); }
  .item-slot.filled[data-rank="2"]::before { background: var(--c-text-500); }
  .item-slot.filled[data-rank="3"]::before { background: var(--c-heat); }

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

  /* 모바일은 공간 절약 — "선택" 라벨 숨김 (+ 아이콘이 동일 의미 전달) */
  .rank-opt {
    display: none;
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
