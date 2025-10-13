// ============================================================
// 4. TradeCard.vue (거래 카드)
// ============================================================

<template>
  <article class="trade-card" @click="handleClick">
    <div class="image-container">
      <div v-if="!trade.thumbnailUrl" class="image-placeholder">
        이미지 없음
      </div>
      <img
          v-else
          :src="trade.thumbnailUrl"
          :alt="trade.title"
          class="trade-image"
      />
      <span class="status-badge" v-if="trade.oneMouthStatus !== 'ON_SALE'">
        {{ getStatusText(trade.oneMouthStatus) }}
      </span>
    </div>

    <div class="card-body">
      <h3 class="trade-title">{{ trade.title }}</h3>
      <div class="trade-price">{{ formatPrice(trade.sellingPrice) }}</div>
      <div class="trade-info">
        <span class="info-item">{{ trade.tradeLocation || '지역미정' }}</span>
        <span class="info-divider">·</span>
        <span class="info-item">조회 {{ trade.viewCount }}</span>
        <span class="info-divider">·</span>
        <span class="info-item">관심 {{ trade.favoriteCount }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  trade: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click', props.trade.oneMouthId);
};

const formatPrice = (price) => {
  if (!price) return '0원';
  return price.toLocaleString() + '원';
};

const getStatusText = (status) => {
  const statusMap = {
    'ON_SALE': '판매중',
    'RESERVED': '예약중',
    'SOLD_OUT': '거래완료'
  };
  return statusMap[status] || '';
};
</script>

<style scoped>
.trade-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
}

.trade-card:hover {
  border-color: #4F46E5;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.image-container {
  position: relative;
  width: 100%;
  height: 240px;
  background: #F9FAFB;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 500;
}

.trade-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.trade-card:hover .trade-image {
  transform: scale(1.05);
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: rgba(17, 24, 39, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.01em;
}

.card-body {
  padding: 20px;
}

.trade-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
}

.trade-price {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.trade-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #9CA3AF;
}

.info-item {
  white-space: nowrap;
}

.info-divider {
  color: #E5E7EB;
}

@media (max-width: 768px) {
  .image-container {
    height: 180px;
  }

  .card-body {
    padding: 16px;
  }

  .trade-title {
    font-size: 14px;
  }

  .trade-price {
    font-size: 16px;
  }
}
</style>