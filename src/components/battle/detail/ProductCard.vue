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

      <!-- Previous Vote Badge - 항상 표시 -->
      <div v-if="item.userBattleVote && isWeightedVote" class="my-vote-badge">
        <span class="my-vote-label">내 투표</span>
        <span :class="['my-vote-rank', `rank-${item.userBattleVote.rank}`]">
          {{ item.userBattleVote.rank }}위
        </span>
      </div>

      <!-- Vote Actions -->
      <div v-if="canVote" class="vote-actions">
        <div v-if="isWeightedVote" class="rank-buttons">
          <button
              v-for="r in [1, 2, 3]"
              :key="r"
              @click="onVote(r)"
              :disabled="submitting"
              :class="['rank-btn', `rank-btn-${r}`, { active: productRank === r }]"
          >
            <span class="rank-num">{{ r }}</span>
            <span class="rank-text">위</span>
          </button>
        </div>
        <button
            v-else
            @click="onVote(1)"
            :disabled="submitting"
            :class="['simple-vote-btn', {
              active: productRank !== null,
              'prev-vote': !productRank && item.userBattleVote
            }]"
        >
          {{ productRank !== null ? '선택됨' : (item.userBattleVote ? '다시 투표' : '투표') }}
        </button>
      </div>

      <!-- 투표 불가 시 이전 투표 표시 -->
      <div v-else-if="item.userBattleVote && !isWeightedVote" class="previous-vote-badge">
        내 투표
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
  if (props.isWeightedVote) {
    return props.item.totalScore || 0
  }
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

/* 내 투표 배지 */
.my-vote-badge {
  margin-top: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e0e7ff;
}

.my-vote-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.my-vote-rank {
  font-size: 13px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
}

.my-vote-rank.rank-1 {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #fff;
}

.my-vote-rank.rank-2 {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: #fff;
}

.my-vote-rank.rank-3 {
  background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
  color: #fff;
}

.previous-vote-badge {
  margin-top: 12px;
  padding: 10px 14px;
  background: #f0f4ff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #4a6cf7;
  text-align: center;
}

.vote-actions {
  margin-top: 16px;
}

.rank-buttons {
  display: flex;
  gap: 8px;
}

.rank-btn {
  flex: 1;
  padding: 12px 8px;
  border-radius: 14px;
  border: 2px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all 0.2s ease;
}

.rank-num {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

.rank-text {
  font-size: 11px;
  font-weight: 600;
  color: #999;
}

/* 1위 버튼 */
.rank-btn-1 {
  border-color: #fde68a;
  background: #fffbeb;
}

.rank-btn-1 .rank-num {
  color: #d97706;
}

.rank-btn-1:hover:not(:disabled) {
  border-color: #fbbf24;
  background: #fef3c7;
  transform: scale(1.02);
}

.rank-btn-1.active {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.rank-btn-1.active .rank-num,
.rank-btn-1.active .rank-text {
  color: #fff;
}

/* 2위 버튼 */
.rank-btn-2 {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.rank-btn-2 .rank-num {
  color: #64748b;
}

.rank-btn-2:hover:not(:disabled) {
  border-color: #94a3b8;
  background: #f1f5f9;
  transform: scale(1.02);
}

.rank-btn-2.active {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  border-color: #64748b;
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.4);
}

.rank-btn-2.active .rank-num,
.rank-btn-2.active .rank-text {
  color: #fff;
}

/* 3위 버튼 */
.rank-btn-3 {
  border-color: #fed7aa;
  background: #fff7ed;
}

.rank-btn-3 .rank-num {
  color: #ea580c;
}

.rank-btn-3:hover:not(:disabled) {
  border-color: #fb923c;
  background: #ffedd5;
  transform: scale(1.02);
}

.rank-btn-3.active {
  background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
  border-color: #ea580c;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.4);
}

.rank-btn-3.active .rank-num,
.rank-btn-3.active .rank-text {
  color: #fff;
}

.rank-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.simple-vote-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 2px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  color: #666;
  transition: all 0.2s ease;
  font-family: inherit;
}

.simple-vote-btn:hover:not(:disabled) {
  border-color: #4a6cf7;
  color: #4a6cf7;
  background: #f8faff;
  transform: scale(1.01);
}

.simple-vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.simple-vote-btn.active {
  background: linear-gradient(135deg, #4a6cf7 0%, #3b5bdb 100%);
  color: #fff;
  border-color: #3b5bdb;
  box-shadow: 0 4px 12px rgba(74, 108, 247, 0.4);
}

.simple-vote-btn.prev-vote {
  border-color: #4a6cf7;
  color: #4a6cf7;
  background: #f0f4ff;
}
</style>
