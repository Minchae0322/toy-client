<template>
  <div :class="['product-card-v1', { active: productRank !== null }]">
    <div class="rank-indicator">{{ displayRank }}</div>

    <div class="img-box">
      <img :src="itemImage" :alt="itemName" @error="handleImageError" />
      <div class="score-overlay">
        <span class="score-count">{{ voteCount }}{{ isWeightedVote ? '점' : '표' }}</span>
        <span class="score-percent">{{ percentage }}%</span>
      </div>
    </div>

    <div class="info-box">
      <p class="brand">{{ itemBrand }}</p>
      <h3 class="name">{{ itemName }}</h3>

      <!-- Previous Vote Badge -->
      <div v-if="item.userBattleVote" class="previous-vote-badge">
        <span v-if="isWeightedVote">이전 투표: {{ item.userBattleVote.rank }}위</span>
        <span v-else>내 투표</span>
      </div>

      <!-- Vote Actions -->
      <div v-if="canVote" class="vote-actions">
        <div v-if="isWeightedVote" class="rank-buttons">
          <button
              v-for="r in [1, 2, 3]"
              :key="r"
              @click="onVote(r)"
              :disabled="submitting"
              :class="['rank-btn', { active: productRank === r }]"
          >
            {{ r }}위
          </button>
        </div>
        <button
            v-else
            @click="onVote(1)"
            :disabled="submitting"
            :class="['simple-vote-btn', { active: productRank !== null }]"
        >
          {{ productRank !== null ? '선택됨' : '투표' }}
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
  return props.item.battleItemProduct?.thumbnailDto?.storedPath ||
      props.item.customImageUrl ||
      'https://placehold.co/400x400?text=No+Image'
})

const voteCount = computed(() => {
  return props.item.voteCount || props.item.totalScore || 0
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
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid #f0f0f0;
}

.product-card-v1:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.product-card-v1.active {
  border-color: #4a6cf7;
  box-shadow: 0 15px 40px rgba(74, 108, 247, 0.15);
}

.rank-indicator {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  width: 36px;
  height: 36px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  color: #111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.img-box {
  position: relative;
  aspect-ratio: 1;
  background: #f9f9f9;
  overflow: hidden;
}

.img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card-v1:hover .img-box img {
  transform: scale(1.05);
}

.score-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(4px);
}

.score-count {
  font-size: 15px;
  font-weight: 800;
}

.score-percent {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
}

.info-box {
  padding: 20px;
}

.brand {
  font-size: 13px;
  color: #888;
  margin: 0 0 4px;
}

.name {
  font-size: 16px;
  font-weight: 700;
  color: #111;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.previous-vote-badge {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f0f4ff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #4a6cf7;
  text-align: center;
}

.vote-actions {
  margin-top: 16px;
}

.rank-buttons {
  display: flex;
  gap: 6px;
}

.rank-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
  font-family: inherit;
}

.rank-btn:hover:not(:disabled) {
  border-color: #ddd;
  background: #f9f9f9;
}

.rank-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rank-btn.active {
  background: #4a6cf7;
  color: #fff;
  border-color: #4a6cf7;
}

.simple-vote-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  font-family: inherit;
}

.simple-vote-btn:hover:not(:disabled) {
  border-color: #4a6cf7;
  color: #4a6cf7;
  background: #f8faff;
}

.simple-vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.simple-vote-btn.active {
  background: #4a6cf7;
  color: #fff;
  border-color: #4a6cf7;
}
</style>
