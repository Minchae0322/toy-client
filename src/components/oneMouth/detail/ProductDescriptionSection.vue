<template>
  <section class="description-section">
    <h2 class="section-title">상품 정보</h2>
    <p class="description-text">{{ food.description || '상품 설명이 없습니다.' }}</p>

    <div class="detail-grid">
      <div class="detail-item">
        <span class="detail-label">수량</span>
        <span class="detail-value">{{ food.quantity }}{{ food.unit }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">상태</span>
        <span class="detail-value">{{ getProductStatusText(food.productStatus) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">거래방법</span>
        <span class="detail-value">직거래</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">상품유형</span>
        <span class="detail-value">{{ food.productType || '일반' }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  food: {
    type: Object,
    required: true
  }
});

// 상품 상태 텍스트 반환
const getProductStatusText = (status) => {
  const statusMap = {
    'FOR_SALE': '판매중',
    'SOLD_OUT': '품절',
    'RESERVED': '예약중',
    'DISCONTINUED': '판매중단'
  };
  return statusMap[status] || '알 수 없음';
};
</script>

<style scoped>
.description-section {
  padding: 24px 20px;
  border-bottom: 8px solid #F8F9FA;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #191F28;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.description-text {
  font-size: 15px;
  line-height: 1.6;
  color: #4E5968;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 13px;
  color: #8B95A1;
}

.detail-value {
  font-size: 15px;
  color: #191F28;
  font-weight: 500;
}

@media (max-width: 480px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>