<template>
  <div :class="['product-card', { 'is-selected': isSelected }]">
    <!-- Image Section with Rank Badge -->
    <div class="image-section">
      <div :class="['rank-badge', getRankBadgeClass]">
        {{ rank }}
      </div>

      <div class="product-img-wrapper">
        <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="product-img"
        />
        <div v-else class="img-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div class="info-section">
      <h3 class="product-title">{{ product.name }}</h3>
      <p class="product-brand">{{ product.brand }}</p>

      <!-- Score Section -->
      <div class="score-section">
        <div class="score-main">
          <span class="score-num">{{ product.totalWeightedScore.toLocaleString() }}</span>
          <span class="score-label">점</span>
        </div>

        <div class="score-bar-wrapper">
          <div class="score-bar-bg">
            <div
                class="score-bar-fill"
                :style="{ width: product.percentage + '%' }"
            />
          </div>
          <span class="score-percent">{{ product.percentage }}%</span>
        </div>
      </div>

      <!-- Vote Buttons -->
      <div v-if="!hasVoted && battleStatus === 'ACTIVE'" class="vote-section">
        <div v-if="isWeighted" class="weighted-btns">
          <button
              v-for="r in [1, 2, 3]"
              :key="r"
              @click="$emit('vote', product.id, r)"
              :class="['rank-btn', { 'is-active': productRank === r, [`rank-${r}`]: productRank === r }]"
          >
            {{ r }}위 선택
          </button>
        </div>

        <button
            v-else
            @click="$emit('vote', product.id, 1)"
            :class="['simple-btn', { 'is-active': isSelected }]"
        >
          {{ isSelected ? '✓ 선택됨' : '투표하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  isSelected: {
    type: Boolean,
    required: true
  },
  productRank: {
    type: Number,
    default: null
  },
  isWeighted: {
    type: Boolean,
    required: true
  },
  hasVoted: {
    type: Boolean,
    required: true
  },
  battleStatus: {
    type: String,
    required: true
  }
})

defineEmits(['vote'])

const getRankBadgeClass = computed(() => {
  if (props.rank === 1) return 'gold'
  if (props.rank === 2) return 'silver'
  if (props.rank === 3) return 'bronze'
  return 'default'
})
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #E5E7EB;
  overflow: hidden;
  transition: all 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #D1D5DB;
}

.product-card.is-selected {
  border-color: #3B82F6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
}

/* Image Section */
.image-section {
  position: relative;
}

.rank-badge {
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
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.rank-badge.gold {
  background: linear-gradient(to bottom right, #FBBF24, #F59E0B);
  color: white;
}

.rank-badge.silver {
  background: linear-gradient(to bottom right, #D1D5DB, #9CA3AF);
  color: white;
}

.rank-badge.bronze {
  background: linear-gradient(to bottom right, #FB923C, #F97316);
  color: white;
}

.rank-badge.default {
  background: white;
  color: #374151;
  border: 2px solid #E5E7EB;
}

.product-img-wrapper {
  aspect-ratio: 1;
  background: #F3F4F6;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
}

/* Info Section */
.info-section {
  padding: 16px;
}

.product-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-brand {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 12px 0;
}

/* Score Section */
.score-section {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #F3F4F6;
}

.score-main {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.score-num {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.score-label {
  font-size: 14px;
  color: #6B7280;
}

.score-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-bar-bg {
  flex: 1;
  height: 6px;
  background: #F3F4F6;
  border-radius: 999px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  background: linear-gradient(to right, #3B82F6, #2563EB);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.score-percent {
  font-size: 12px;
  font-weight: 600;
  color: #2563EB;
}

/* Vote Section */
.vote-section {
  margin-top: 8px;
}

.weighted-btns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.rank-btn {
  padding: 8px 4px;
  border: none;
  background: #F3F4F6;
  color: #6B7280;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.rank-btn:hover {
  background: #E5E7EB;
}

.rank-btn.is-active.rank-1 {
  background: #FBBF24;
  color: white;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
}

.rank-btn.is-active.rank-2 {
  background: #9CA3AF;
  color: white;
  box-shadow: 0 2px 8px rgba(156, 163, 175, 0.4);
}

.rank-btn.is-active.rank-3 {
  background: #FB923C;
  color: white;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.4);
}

.simple-btn {
  width: 100%;
  padding: 10px;
  border: none;
  background: #F3F4F6;
  color: #374151;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.simple-btn:hover {
  background: #EFF6FF;
  color: #2563EB;
}

.simple-btn.is-active {
  background: #2563EB;
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}
</style>