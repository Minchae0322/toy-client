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
    </div>

    <div class="info-box">
      <div class="info-content">
        <p v-if="itemBrand" class="brand">{{ itemBrand }}</p>
        <div class="name-row">
          <h3 :class="['name', { unavailable: productUnavailable }]">{{ itemName }}</h3>
          <ProductStatusBadge :status="productStatus" size="sm" />
        </div>
      </div>

      <!-- Vote Actions -->
      <div class="vote-actions" :class="{ 'is-ended': !canVote }">
        <template v-if="isWeightedVote">
          <div v-if="canVote" class="vote-hint">
            <span>탭하여 순위 투표</span>
          </div>
          <div class="rank-selector">
            <button
                v-for="r in [1, 2, 3]"
                :key="r"
                @click="onVote(r)"
                :disabled="submitting || !canVote"
                :class="['rank-chip', `rank-${r}`, { active: productRank === r }]"
            >
              {{ r }}위
            </button>
          </div>
          <div class="vote-rate-bar" :style="{ '--vote-fill': voteFillWidth }">
            <span class="vote-rate-label">투표율</span>
            <span class="vote-rate-pct">
              {{ percentage }}%
              <span class="vote-rate-count">({{ voteCount }}명/총 {{ totalParticipants }}명)</span>
            </span>
          </div>
        </template>
        <template v-else>
          <button
              @click="onVote(1)"
              :disabled="submitting || !canVote"
              :class="['vote-btn', { active: productRank !== null, ended: !canVote }]"
          >
            <svg class="vote-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <template v-if="productRank !== null">
                <path d="M20 6L9 17l-5-5"/>
              </template>
              <template v-else>
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </template>
            </svg>
            <span class="vote-btn-label">{{ !canVote ? '투표 마감' : (productRank !== null ? '내가 뽑은 픽' : '투표하기') }}</span>
            <svg v-if="canVote && productRank === null" class="vote-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="M13 6l6 6-6 6"/>
            </svg>
          </button>
          <div class="vote-rate-bar" :style="{ '--vote-fill': voteFillWidth }">
            <span class="vote-rate-label">투표율</span>
            <span class="vote-rate-pct">
              {{ percentage }}%
              <span class="vote-rate-count">({{ voteCount }}명/총 {{ totalParticipants }}명)</span>
            </span>
          </div>
        </template>
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

    <!-- 이미지 크게 보기 Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div v-if="lightboxOpen" class="lightbox-overlay" @click="closeLightbox">
          <button class="lightbox-close" @click.stop="closeLightbox" aria-label="닫기">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <div class="lightbox-image-wrapper" @click.stop>
            <img :src="itemImage" :alt="itemName" class="lightbox-image" draggable="false" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import BattleCommentSummary from './BattleCommentSummary.vue'
import ProductStatusBadge from '@/components/product/ProductStatusBadge.vue'

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
  },
  totalParticipants: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['vote', 'open-comments', 'submit-comment', 'play-youtube'])

const commentSubmitting = ref(false)

const isYoutube = computed(() => {
  const itemType = props.item.battleItemType?.title || props.item.battleItemType
  return itemType === 'YOUTUBE'
})

const voteFillWidth = computed(() => {
  const v = Number(props.percentage)
  if (!Number.isFinite(v)) return '0%'
  return Math.max(0, Math.min(100, v)) + '%'
})

const productStatus = computed(() => {
  const raw = props.item.battleItemProduct?.productStatus
  return (typeof raw === 'string' ? raw : raw?.title || raw?.code || '')?.toUpperCase() || null
})

const productApproved = computed(() => !productStatus.value || productStatus.value === 'APPROVED')
const productUnavailable = computed(() => ['REJECTED', 'DELETED'].includes(productStatus.value))

const itemName = computed(() => {
  // REJECTED/DELETED 시 커스텀 이름으로 폴백
  if (productUnavailable.value) {
    return props.item.customName || props.item.battleItemProduct?.name || '제품명 없음'
  }
  return props.item.battleItemProduct?.name || props.item.customName || '제품명 없음'
})

const itemBrand = computed(() => {
  if (productUnavailable.value) {
    return props.item.customBrand || props.item.battleItemProduct?.brand || ''
  }
  return props.item.battleItemProduct?.brand || props.item.customBrand || ''
})

const itemImage = computed(() => {
  if (productUnavailable.value) {
    return props.item.customImageUrl ||
        props.item.battleItemProduct?.thumbnailDto?.fileUrl ||
        'https://placehold.co/400x400?text=No+Image'
  }
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

const lightboxOpen = ref(false)

const openLightbox = () => {
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

const onKeydown = (e) => {
  if (lightboxOpen.value && e.key === 'Escape') closeLightbox()
}

watch(lightboxOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', onKeydown)
  } else {
    window.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (lightboxOpen.value) document.body.style.overflow = ''
})

const handleImageClick = () => {
  if (isYoutube.value && props.item.embedUrl) {
    emit('play-youtube', props.item)
    return
  }
  openLightbox()
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
  background: #f5f5f7;
  overflow: hidden;
  cursor: zoom-in;
}

.img-box.is-youtube {
  cursor: pointer;
}

.img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.name-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  flex-wrap: wrap;
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
  flex: 1;
  min-width: 0;
}

.name.unavailable {
  color: #6B7280;
  text-decoration: line-through;
}

.vote-actions {
  padding-top: 8px;
}

/* 탭하라는 힌트 */
.vote-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #9333ea;
  letter-spacing: -0.2px;
}

/* 순위 선택 칩 */
.rank-selector {
  display: flex;
  gap: 6px;
}

.rank-chip {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.18s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.rank-chip:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
}

.rank-chip:active:not(:disabled) {
  transform: translateY(0);
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

/* 투표하기 CTA */
.vote-btn {
  position: relative;
  width: 100%;
  padding: 9px 14px;
  border-radius: 10px;
  border: none;
  background: #9333ea;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.3px;
  transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.28), 0 2px 4px rgba(147, 51, 234, 0.12);
}

.vote-btn:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(147, 51, 234, 0.36), 0 2px 4px rgba(147, 51, 234, 0.18);
}

.vote-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(147, 51, 234, 0.28);
}

.vote-btn-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.vote-btn-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.18s ease;
}

.vote-btn:hover:not(:disabled) .vote-btn-arrow {
  transform: translateX(3px);
}

.vote-btn-label {
  flex: 1;
  text-align: center;
}

/* 가중치 투표 모드용 투표율 바 */
.vote-rate-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #faf5ff;
  border: 1px solid #f3e8ff;
  overflow: hidden;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.15;
}

.vote-rate-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--vote-fill, 0%);
  background: #e9d5ff;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.vote-rate-bar > * {
  position: relative;
  z-index: 1;
}

.vote-rate-label {
  color: #7e22ce;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.vote-rate-pct {
  color: #6b21a8;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.vote-rate-count {
  margin-left: 4px;
  color: #9333ea;
  font-weight: 600;
  font-size: 11px;
  opacity: 0.8;
}

/* 이미 투표함 — 선택된 상태로 식별 */
.vote-btn.active {
  background: #faf5ff;
  border: 1.5px solid #9333ea;
  color: #9333ea;
  box-shadow: 0 1px 2px rgba(147, 51, 234, 0.08);
  font-weight: 700;
}

.vote-btn.active:hover:not(:disabled) {
  background: #f3e8ff;
  border-color: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(147, 51, 234, 0.16);
}

/* 투표 마감 */
.vote-btn.ended {
  background: #f3f4f6;
  color: #94a3b8;
  box-shadow: none;
  font-weight: 700;
}

.vote-btn:disabled {
  cursor: not-allowed;
}

.vote-btn:disabled:not(.active):not(.ended) {
  opacity: 0.7;
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
    padding: 8px 0;
    font-size: 11px;
    border-radius: 6px;
    border-width: 1px;
  }

  .vote-hint {
    margin-bottom: 4px;
    font-size: 10px;
  }

  .vote-btn {
    padding: 7px 10px;
    font-size: 11px;
    border-radius: 8px;
    gap: 6px;
    box-shadow: 0 3px 8px rgba(147, 51, 234, 0.24), 0 1px 2px rgba(147, 51, 234, 0.12);
  }

  .vote-btn-icon {
    width: 14px;
    height: 14px;
  }

  .vote-btn-arrow {
    width: 13px;
    height: 13px;
  }
}

/* 모바일/터치: sticky hover 차단 */
@media (hover: none) {
  .product-card-v1:hover {
    transform: none;
  }
  .product-card-v1:hover .img-box img {
    transform: none;
  }
}

/* ===== 이미지 크게 보기 Lightbox ===== */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  border-radius: 4px;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.25s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .lightbox-image-wrapper {
    padding: 50px 0;
  }
  .lightbox-close {
    top: 12px;
    right: 12px;
  }
}
</style>
