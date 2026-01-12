<template>
  <div :class="['product-card', { 'selected': productRank !== null }]">
    <!-- Rank Badge -->
    <div class="product-image-wrapper">
      <div :class="['product-rank-badge', `rank-${displayRank}`]">
        {{ displayRank }}
      </div>

      <!-- Product Image -->
      <div class="product-image">
        <img
            :src="itemImage"
            :alt="itemName"
            @error="handleImageError"
        />
      </div>
    </div>

    <!-- Product Info -->
    <div class="product-content">
      <h3 class="product-name">{{ itemName }}</h3>
      <p class="product-brand">{{ itemBrand }}</p>

      <!-- Score -->
      <div class="product-score">
        <div class="score-number">
          <span class="score-value">{{ item.totalScore || 0 }}</span>
          <span class="score-unit">{{ isWeightedVote ? '점' : '표' }}</span>
        </div>
        <div class="score-bar-wrapper">
          <div class="score-bar">
            <div class="score-fill" :style="{ width: `${percentage}%` }"></div>
          </div>
          <span class="score-percent">{{ percentage }}%</span>
        </div>
      </div>

      <!-- Previous Vote Badge -->
      <div v-if="item.userBattleVote" class="previous-vote-badge">
        <span class="vote-icon">✓</span>
        <span v-if="isWeightedVote">이전 투표: {{ item.userBattleVote.rank }}위</span>
        <span v-else>내 투표</span>
      </div>

      <!-- Vote Buttons -->
      <div v-if="canVote" class="vote-buttons">
        <div v-if="isWeightedVote" class="vote-buttons-weighted">
          <button
              v-for="r in [1, 2, 3]"
              :key="r"
              @click="$emit('vote', item.id, r)"
              :disabled="submitting"
              :class="['btn-vote-rank', { 'active': productRank === r }, `rank-${r}`]"
          >
            {{ r }}위 선택
          </button>
        </div>
        <button
            v-else
            @click="$emit('vote', item.id, 1)"
            :disabled="submitting"
            :class="['btn-vote-simple', { 'active': productRank !== null }]"
        >
          {{ productRank !== null ? '✓ 선택됨' : '투표하기' }}
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

defineEmits(['vote'])

const itemName = computed(() => {
  return props.item.battleItemProduct?.name || props.item.customName || '제품명 없음'
})

const itemBrand = computed(() => {
  return props.item.battleItemProduct?.brand || props.item.customBrand || ''
})

const itemImage = computed(() => {
  return props.item.battleItemProduct?.thumbnailDto?.storedPath ||
      props.item.customImageUrl ||
      'https://placehold.co/400x400?text=No+Image'
})

const handleImageError = (e) => {
  e.target.src = 'https://placehold.co/400x400?text=No+Image'
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s;
}

.product-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.product-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.product-image-wrapper {
  position: relative;
}

.product-rank-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.product-rank-badge.rank-1 {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.product-rank-badge.rank-2 {
  background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  color: white;
}

.product-rank-badge.rank-3 {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  color: white;
}

.product-rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.product-image {
  aspect-ratio: 1;
  background-color: #f3f4f6;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-content {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.product-brand {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.product-score {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.score-number {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: #111827;
}

.score-unit {
  font-size: 14px;
  color: #6b7280;
}

.score-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-bar {
  flex: 1;
  height: 6px;
  background-color: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 999px;
  transition: width 0.3s;
}

.score-percent {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
}

.previous-vote-badge {
  margin-bottom: 8px;
  padding: 6px 10px;
  background-color: #dbeafe;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.previous-vote-badge .vote-icon {
  font-size: 12px;
}

.vote-buttons {
  margin-top: 8px;
}

.vote-buttons-weighted {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.btn-vote-rank {
  padding: 8px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f3f4f6;
  color: #6b7280;
  font-family: inherit;
}

.btn-vote-rank:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-vote-rank:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-vote-rank.active.rank-1 {
  background-color: #fbbf24;
  color: white;
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
}

.btn-vote-rank.active.rank-2 {
  background-color: #9ca3af;
  color: white;
  box-shadow: 0 2px 4px rgba(156, 163, 175, 0.3);
}

.btn-vote-rank.active.rank-3 {
  background-color: #fb923c;
  color: white;
  box-shadow: 0 2px 4px rgba(251, 146, 60, 0.3);
}

.btn-vote-simple {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f3f4f6;
  color: #374151;
  font-family: inherit;
}

.btn-vote-simple:hover:not(:disabled) {
  background-color: #eff6ff;
  color: #2563eb;
}

.btn-vote-simple:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-vote-simple.active {
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}
</style>
