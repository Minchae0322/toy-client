<template>
  <div :class="['product-card-v1', { selected: productRank !== null }]">
    <!-- 선택된 표시 -->
    <div v-if="productRank" :class="['selected-rank-badge', isWeightedVote ? `rank-${productRank}` : 'single-pick']">
      <template v-if="isWeightedVote">
        <span class="rank-number">{{ productRank }}</span>
        <span class="rank-text">위</span>
      </template>
      <template v-else>
        <span class="pick-text">PICK</span>
      </template>
    </div>

    <div :class="['rank-indicator', displayRank <= 3 ? `rank-pos-${displayRank}` : '']">{{ displayRank }}</div>

    <div class="img-box" :class="{ 'is-youtube': isYoutube }" @click="handleImageClick">
      <img :src="itemImage" :alt="itemName" @error="handleImageError" />
      <!-- 이전 픽 뱃지 -->
      <div v-if="item.userBattleVote" class="my-pick-badge">
        {{ isWeightedVote && item.userBattleVote.rank ? `MY ${item.userBattleVote.rank}위` : 'MY PICK' }}
      </div>
      <!-- YouTube 재생 버튼 오버레이 -->
      <div v-if="isYoutube" class="youtube-play-overlay">
        <div class="youtube-play-btn">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <span class="youtube-label">YouTube</span>
      </div>
      <div class="score-overlay">
        <span class="score-percent">{{ percentage }}%</span>
        <span class="score-count">{{ voteCount }}명 투표</span>
      </div>
    </div>

    <div class="info-box">
      <div class="info-content">
        <p v-if="itemBrand" class="brand">{{ itemBrand }}</p>
        <h3 class="name">{{ itemName }}</h3>
      </div>

      <!-- Vote Actions -->
      <div v-if="canVote" class="vote-actions">
        <div v-if="isWeightedVote" class="rank-selector">
          <button
              v-for="r in [1, 2, 3]"
              :key="r"
              @click="onVote(r)"
              :disabled="submitting"
              :class="['rank-chip', `rank-${r}`, { active: productRank === r }]"
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
      :item-image="itemImage"
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

const emit = defineEmits(['vote', 'open-comments', 'submit-comment', 'play-youtube'])

const commentSubmitting = ref(false)

const isYoutube = computed(() => {
  const itemType = props.item.battleItemType?.title || props.item.battleItemType
  return itemType === 'YOUTUBE'
})

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

const handleImageClick = () => {
  if (isYoutube.value && props.item.embedUrl) {
    emit('play-youtube', props.item)
  }
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
  border: 1.5px solid #efefef;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  box-sizing: border-box;
}

.product-card-v1:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}


.product-card-v1.highlight-card {
  animation: highlightCard 1.5s ease;
}

@keyframes highlightCard {
  0% { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
  20% { box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.3); }
  100% { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
}

/* 선택된 순위 뱃지 */
.selected-rank-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: popIn 0.25s ease;
}

@keyframes popIn {
  0% { transform: translate(-50%, -50%) scale(0); }
  70% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.selected-rank-badge .rank-number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.selected-rank-badge .rank-text {
  font-size: 12px;
  font-weight: 700;
  margin-top: 2px;
}

.selected-rank-badge.rank-1 {
  background: #f59e0b;
}

.selected-rank-badge.rank-2 {
  background: #6b7280;
}

.selected-rank-badge.rank-3 {
  background: #ea580c;
}

.selected-rank-badge.single-pick {
  background: #9333ea;
}

.selected-rank-badge .pick-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

/* 선택된 카드 테두리 */
.product-card-v1.selected {
  border-width: 3px;
}

.product-card-v1.selected:has(.rank-1) {
  border-color: #f59e0b;
}

.product-card-v1.selected:has(.rank-2) {
  border-color: #6b7280;
}

.product-card-v1.selected:has(.rank-3) {
  border-color: #ea580c;
}

.product-card-v1.selected:has(.single-pick) {
  border-color: #9333ea;
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
  font-weight: 700;
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


.img-box {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #111;
  overflow: hidden;
}

.img-box.is-youtube {
  cursor: pointer;
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

/* MY PICK 뱃지 */
.my-pick-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 15;
  padding: 4px 8px;
  background: #9333ea;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(147, 51, 234, 0.3);
}

/* YouTube 재생 오버레이 */
.youtube-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.img-box.is-youtube:hover .youtube-play-overlay {
  opacity: 1;
}

.youtube-play-btn {
  width: 64px;
  height: 64px;
  background: rgba(255, 0, 0, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background 0.2s;
}

.img-box.is-youtube:hover .youtube-play-btn {
  transform: scale(1.1);
  background: #ff0000;
}

.youtube-label {
  font-size: 12px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
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
  font-weight: 700;
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
  /* 컨텐츠 높이에 맞춤 */
}

.brand {
  font-size: 11px;
  color: #999;
  margin: 0 0 2px;
}

.name {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;
}

/* 1위 - 골드 */
.rank-chip.rank-1 {
  border: 1.5px solid #fde68a;
  background: #fffbeb;
  color: #b45309;
}

.rank-chip.rank-1:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #fcd34d;
}

.rank-chip.rank-1.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: #fff;
}

/* 2위 - 실버 */
.rank-chip.rank-2 {
  border: 1.5px solid #d1d5db;
  background: #f9fafb;
  color: #4b5563;
}

.rank-chip.rank-2:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.rank-chip.rank-2.active {
  background: #6b7280;
  border-color: #6b7280;
  color: #fff;
}

/* 3위 - 브론즈 */
.rank-chip.rank-3 {
  border: 1.5px solid #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.rank-chip.rank-3:hover:not(:disabled) {
  background: #ffedd5;
  border-color: #fdba74;
}

.rank-chip.rank-3.active {
  background: #ea580c;
  border-color: #ea580c;
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
  border: 1.5px solid #e9d5ff;
  background: #faf5ff;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #9333ea;
  transition: all 0.2s ease;
}

.vote-btn:hover:not(:disabled) {
  background: #f3e8ff;
  border-color: #d8b4fe;
}

.vote-btn.active {
  background: #9333ea;
  border-color: #9333ea;
  color: #fff;
}

.vote-btn.active:hover:not(:disabled) {
  background: #7e22ce;
  border-color: #7e22ce;
}

.vote-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .vote-actions {
    padding-top: 6px;
  }
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

  .img-box {
    aspect-ratio: 1 / 1;
  }

  /* 모바일에서 YouTube 오버레이 항상 표시 */
  .img-box.is-youtube .youtube-play-overlay {
    opacity: 1;
    background: rgba(0, 0, 0, 0.25);
  }

  .youtube-play-btn {
    width: 44px;
    height: 44px;
  }

  .youtube-play-btn svg {
    width: 32px;
    height: 32px;
  }

  .youtube-label {
    font-size: 10px;
  }

  .rank-indicator {
    top: 5px;
    left: 5px;
    width: 20px;
    height: 20px;
    font-size: 10px;
    border-radius: 5px;
  }

  .product-card-v1.selected .rank-indicator {
    top: 5px;
  }

  .selected-rank-badge {
    width: 48px;
    height: 48px;
  }

  .selected-rank-badge .rank-number {
    font-size: 22px;
  }

  .selected-rank-badge .rank-text {
    font-size: 10px;
  }

  .my-pick-badge {
    top: 6px;
    right: 6px;
    padding: 3px 6px;
    font-size: 8px;
    border-radius: 4px;
  }

  .score-overlay {
    padding: 12px 6px 4px;
    gap: 3px;
  }

  .score-percent {
    font-size: 14px;
  }

  .score-count {
    font-size: 9px;
  }

  .info-box {
    padding: 6px;
  }

  .brand {
    font-size: 8px;
    margin: 0 0 1px;
  }

  .name {
    font-size: 13px;
    line-height: 1.25;
    -webkit-line-clamp: 2;
  }

  .vote-actions {
    padding-top: 3px;
  }

  .rank-selector {
    gap: 3px;
  }

  .rank-chip {
    padding: 6px 0;
    font-size: 10px;
    border-radius: 5px;
    border-width: 1px;
  }

  .vote-btn {
    padding: 6px 8px;
    font-size: 11px;
    border-radius: 6px;
  }
}
</style>
