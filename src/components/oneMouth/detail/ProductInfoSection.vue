<template>
  <section class="info-section">
    <h1 class="product-title">{{ food.name }}</h1>
    <div class="price-row">
      <span class="price">{{ formatPrice(food.price) }}</span>
      <span v-if="food.price === 0" class="price-badge">무료나눔</span>
    </div>

    <!-- 상품 메타 정보 -->
    <div class="meta-info">
      <div class="meta-item">
        <Clock :size="14" />
        <span>{{ formatRelativeTime(food.createdAt) }}</span>
      </div>
      <div class="meta-item">
        <Eye :size="14" />
        <span>조회 {{ food.hits || 0 }}</span>
      </div>
      <div class="meta-item">
        <Heart :size="14" />
        <span>관심 {{ food.favoritesCount || 0 }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Clock, Eye, Heart } from 'lucide-vue-next';

defineProps({
  food: {
    type: Object,
    required: true
  }
});

const formatPrice = (price) => {
  if (!price || price === 0) return '무료나눔';
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

  return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.info-section {
  padding: 20px;
  border-bottom: 1px solid #F2F3F7;
}

.product-title {
  font-size: 22px;
  font-weight: 700;
  color: #191F28;
  line-height: 1.3;
  margin-bottom: 12px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #191F28;
}

.price-badge {
  padding: 4px 8px;
  background: #FF6B6B;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.meta-info {
  display: flex;
  gap: 16px;
  color: #8B95A1;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .product-title {
    font-size: 20px;
  }

  .price {
    font-size: 22px;
  }
}
</style>