<template>
  <div :class="['product-card-v1', { selected: productRank !== null }]">
    <!-- 선택된 순위 오버레이 배지 -->
    <div v-if="productRank" :class="['selected-rank-overlay', `rank-${productRank}`]">
      {{ productRank }}위 선택
    </div>

    <div class="rank-indicator">{{ displayRank }}</div>

    <div class="img-box">
      <img :src="itemImage" :alt="itemName" @error="handleImageError" />
      <div class="score-overlay">
        <span class="score-percent">{{ percentage }}%</span>
        <span class="score-count">{{ voteCount }}명 투표</span>
      </div>
    </div>

    <div class="info-box">
      <p class="brand">{{ itemBrand }}</p>
      <h3 class="name">{{ itemName }}</h3>

      <!-- 이전 투표 표시 -->
      <div v-if="item.userBattleVote" class="prev-vote-info">
        <span class="prev-label">이전 투표:</span>
        <span class="prev-rank">{{ item.userBattleVote.rank }}위</span>
      </div>

      <!-- Vote Actions -->
      <div v-if="canVote" class="vote-actions">
        <div v-if="isWeightedVote" class="rank-selector">
          <button
              v-for="r in [1, 2, 3]"
              :key="r"
              @click="onVote(r)"
              :disabled="submitting"
              :class="['rank-chip', { active: productRank === r }]"
          >
            {{ r }}위
          </button>
        </div>
        <button
            v-else
            @click="onVote(1)"
            :disabled="submitting"
            :class="['vote-btn', { active: productRank !== null }]"
        >
          {{ productRank !== null ? '선택됨' : '투표하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  displayRank: {
    type: Number,
    required: true
  },
  productRank: {
    type: Number,
    default: null
  },
  isWeightedVote: {
    type: Boolean,
    required: true
  },
  canVote: {
    type: Boolean,
    required: true
  },
  submitting: {
    type: Boolean,
    default: false
  },
  percentage: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['vote'])

const itemName = computed(() => {
  return props.item.battleItemProduct?.name || props.item.customName || '제품명 없음'
})

const itemBrand = computed(() => {
  return props.item.battleItemProduct?.brand || props.item.customBrand || ''
})

const itemImage = computed(() => {
  return props.item.battleItemProduct?.thumbnailDto?.fileUrl ||
      props.item.customImageUrl ||
      'https://placehold.co/400x400?text=No+Image'
})

const voteCount = computed(() => {
  return props.item.voteCount || 0
})

const handleImageError = (e) => {
  e.target.src = 'https://placehold.co/400x400?text=No+Image'
}

const onVote = (rank) => {
  emit('vote', props.item.id, rank)
}
</script>

<style scoped>
.product-card-v1 {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  position: relative;
  border: 1.5px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.product-card-v1:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.product-card-v1.selected {
  border-color: #6b7df5;
  box-shadow: 0 8px 24px rgba(107, 125, 245, 0.12);
}

/* 선택된 순위 오버레이 */
.selected-rank-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 8px 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.selected-rank-overlay.rank-1 {
  background: linear-gradient(135deg, #f6c34c 0%, #e8a830 100%);
}

.selected-rank-overlay.rank-2 {
  background: linear-gradient(135deg, #a8b4c4 0%, #8c9bb0 100%);
}

.selected-rank-overlay.rank-3 {
  background: linear-gradient(135deg, #e8945a 0%, #d4784a 100%);
}

.rank-indicator {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card-v1.selected .rank-indicator {
  top: 50px;
}

.img-box {
  position: relative;
  aspect-ratio: 1;
  background: #fafafa;
  overflow: hidden;
}

.img-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.product-card-v1:hover .img-box img {
  transform: scale(1.03);
}

.score-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
  padding: 28px 14px 12px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  backdrop-filter: blur(2px);
}

.score-percent {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.score-count {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.85;
}

.info-box {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.brand {
  font-size: 12px;
  color: #999;
  margin: 0 0 4px;
}

.name {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 이전 투표 표시 */
.prev-vote-info {
  margin-top: 10px;
  padding: 6px 10px;
  background: #f5f7ff;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.prev-label {
  color: #888;
}

.prev-rank {
  font-weight: 600;
  color: #6b7df5;
}

.vote-actions {
  margin-top: auto;
  padding-top: 14px;
}

/* 순위 선택 칩 */
.rank-selector {
  display: flex;
  gap: 6px;
}

.rank-chip {
  flex: 1;
  padding: 8px 0;
  border-radius: 8px;
  border: 1.5px solid #e8e8e8;
  background: #fafafa;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s ease;
}

.rank-chip:hover:not(:disabled) {
  border-color: #d0d0d0;
  background: #f5f5f5;
}

.rank-chip.active {
  background: #6b7df5;
  border-color: #6b7df5;
  color: #fff;
}

.rank-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 단순 투표 버튼 */
.vote-btn {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1.5px solid #e8e8e8;
  background: #fafafa;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s ease;
}

.vote-btn:hover:not(:disabled) {
  border-color: #6b7df5;
  color: #6b7df5;
  background: #f8f9ff;
}

.vote-btn.active {
  background: #6b7df5;
  border-color: #6b7df5;
  color: #fff;
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 모바일 컴팩트 디자인 */
@media (max-width: 480px) {
  .product-card-v1 {
    border-radius: 12px;
    border-width: 1px;
  }

  .product-card-v1:hover {
    transform: none;
  }

  .rank-indicator {
    top: 6px;
    left: 6px;
    width: 24px;
    height: 24px;
    font-size: 11px;
    border-radius: 6px;
  }

  .product-card-v1.selected .rank-indicator {
    top: 32px;
  }

  .selected-rank-overlay {
    padding: 5px 0;
    font-size: 11px;
  }

  .score-overlay {
    padding: 20px 10px 8px;
    gap: 6px;
  }

  .score-percent {
    font-size: 18px;
  }

  .score-count {
    font-size: 11px;
  }

  .info-box {
    padding: 10px;
  }

  .brand {
    font-size: 10px;
    margin: 0 0 2px;
  }

  .name {
    font-size: 12px;
    line-height: 1.3;
    -webkit-line-clamp: 2;
  }

  .prev-vote-info {
    margin-top: 6px;
    padding: 4px 6px;
    font-size: 10px;
    gap: 4px;
  }

  .vote-actions {
    padding-top: 8px;
  }

  .rank-selector {
    gap: 4px;
  }

  .rank-chip {
    padding: 6px 0;
    font-size: 11px;
    border-radius: 6px;
    border-width: 1px;
  }

  .vote-btn {
    padding: 8px;
    font-size: 12px;
    border-radius: 8px;
    border-width: 1px;
  }
}
</style>
