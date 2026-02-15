<template>
  <div :class="['product-card-v1', { selected: productRank !== null }]">
    <!-- 선택된 순위 오버레이 배지 -->
    <div v-if="productRank" :class="['selected-rank-overlay', `rank-${productRank}`]">
      {{ productRank }}위 선택
    </div>

    <div :class="['rank-indicator', displayRank <= 3 ? `rank-pos-${displayRank}` : '']">{{ displayRank }}</div>

    <div class="img-box">
      <img :src="itemImage" :alt="itemName" @error="handleImageError" />
      <div class="score-overlay">
        <span class="score-percent">{{ percentage }}%</span>
        <span class="score-count">{{ voteCount }}명 투표</span>
      </div>
    </div>

    <div class="info-box">
      <div class="info-content">
        <p v-if="itemBrand" class="brand">{{ itemBrand }}</p>
        <h3 class="name">{{ itemName }}</h3>

        <!-- 이전 투표 표시 -->
        <div v-if="item.userBattleVote" class="prev-vote-info">
          <span class="prev-label">이전 픽:</span>
          <span class="prev-rank">{{ item.userBattleVote.rank }}위</span>
        </div>
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
          {{ productRank !== null ? '선택됨' : '요거 픽하기' }}
        </button>
      </div>
    </div>

    <!-- 한줄 변론 요약 -->
    <BattleCommentSummary
      :comment-summary="item.commentSummary"
      :item-id="item.id"
      :item-name="itemName"
      :submitting="commentSubmitting"
      @open-comments="$emit('open-comments', item)"
      @submit-comment="handleSubmitComment"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BattleCommentSummary from './BattleCommentSummary.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  battleId: {
    type: [String, Number],
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

const emit = defineEmits(['vote', 'open-comments', 'submit-comment'])

const commentSubmitting = ref(false)

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

const handleSubmitComment = (content) => {
  emit('submit-comment', props.item.id, content)
}

// 외부에서 submitting 상태 변경
const setCommentSubmitting = (value) => {
  commentSubmitting.value = value
}

defineExpose({ setCommentSubmitting })
</script>

<style scoped>
.product-card-v1 {
  background: #fff;
  border-radius: 14px;
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
  padding: 6px 0;
  text-align: center;
  font-size: 11px;
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
  top: 10px;
  left: 10px;
  z-index: 10;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #555;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}

.rank-indicator.rank-pos-1 {
  background: #e8a830;
  color: #fff;
  box-shadow: 0 3px 12px rgba(232, 168, 48, 0.35);
}

.rank-indicator.rank-pos-2 {
  background: #8c9bb0;
  color: #fff;
  box-shadow: 0 3px 12px rgba(140, 155, 176, 0.35);
}

.rank-indicator.rank-pos-3 {
  background: #d4784a;
  color: #fff;
  box-shadow: 0 3px 12px rgba(212, 120, 74, 0.35);
}

.product-card-v1.selected .rank-indicator {
  top: 38px;
}

.img-box {
  position: relative;
  aspect-ratio: 4 / 3;
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
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.15) 40%, rgba(0, 0, 0, 0.6) 100%);
  color: #fff;
  padding: 24px 10px 8px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.score-percent {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.score-count {
  font-size: 11px;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.info-box {
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.info-content {
  min-height: 80px;
}

.brand {
  font-size: 11px;
  color: #999;
  margin: 0 0 2px;
}

.name {
  font-size: 13px;
  font-weight: 600;
  color: #222;
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 이전 픽 표시 */
.prev-vote-info {
  margin-top: 8px;
  padding: 4px 8px;
  background: #f5f7ff;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.prev-label {
  color: #888;
}

.prev-rank {
  font-weight: 600;
  color: #6b7df5;
}

.vote-actions {
  padding-top: 8px;
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
  border: 1.5px solid #e9d5ff;
  background: #faf5ff;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #9333ea;
  transition: all 0.2s ease;
}

.rank-chip:hover:not(:disabled) {
  border-color: #d8b4fe;
  background: #f3e8ff;
}

.rank-chip.active {
  background: #9333ea;
  border-color: #9333ea;
  color: #fff;
}

.rank-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 요거 픽 버튼 */
.vote-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: #9333ea;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  transition: all 0.2s ease;
}

.vote-btn:hover:not(:disabled) {
  background: #7e22ce;
}

.vote-btn.active {
  background: #10b981;
}

.vote-btn.active:hover:not(:disabled) {
  background: #059669;
}

.vote-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 모바일 컴팩트 디자인 */
@media (max-width: 480px) {
  .product-card-v1 {
    border-radius: 10px;
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
    top: 26px;
  }

  .selected-rank-overlay {
    padding: 4px 0;
    font-size: 10px;
  }

  .score-overlay {
    padding: 16px 8px 6px;
    gap: 4px;
  }

  .score-percent {
    font-size: 16px;
  }

  .score-count {
    font-size: 10px;
  }

  .info-box {
    padding: 8px;
  }

  .info-content {
    min-height: 65px;
  }

  .brand {
    font-size: 9px;
    margin: 0 0 1px;
  }

  .name {
    font-size: 11px;
    line-height: 1.3;
    -webkit-line-clamp: 2;
  }

  .prev-vote-info {
    margin-top: 5px;
    padding: 3px 5px;
    font-size: 9px;
    gap: 3px;
  }

  .vote-actions {
    padding-top: 4px;
  }

  .rank-selector {
    gap: 4px;
  }

  .rank-chip {
    padding: 7px 0;
    font-size: 11px;
    border-radius: 6px;
    border-width: 1.5px;
  }

  .vote-btn {
    padding: 8px 10px;
    font-size: 12px;
    border-radius: 8px;
  }
}
</style>
