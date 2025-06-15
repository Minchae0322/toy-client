<template>
  <div class="card details-card">
    <div class="card-title">
      <h3>상품 정보</h3>
    </div>
    <div class="details-grid">
      <div class="detail-item">
        <span class="label">등록일</span>
        <span class="value">{{ formatDate(food.createdAt) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">유통기한</span>
        <span class="value">{{ formatDate(food.expiryDate) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">상태</span>
        <span class="value">{{ food.condition }}</span>
      </div>
      <div class="detail-item">
        <span class="label">카테고리</span>
        <span class="value">{{ getCategoryName(food.category) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoodDetailsCard',
  props: {
    food: {
      type: Object,
      required: true
    }
  },
  methods: {
    getCategoryName(category) {
      const categories = {
        snacks: '🥟 간식',
        drinks: '🧋 음료',
        desserts: '🍰 디저트'
      };
      return categories[category] || '🍽️ 기타';
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
};
</script>

<style scoped>
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.12);
}

.card-title {
  padding: 20px 20px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.details-grid {
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.value {
  color: #2d3748;
  font-weight: 600;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>