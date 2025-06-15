<template>
  <div class="card seller-card">
    <div class="card-title">
      <h3>판매자 정보</h3>
    </div>
    <div class="seller-info" @click="$emit('view-profile')">
      <div class="seller-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="seller-details">
        <div class="seller-name">{{ seller.name }}</div>
        <div class="seller-rating">
          <span class="stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.floor(seller.rating) }">★</span>
          </span>
          <span class="rating-text">{{ seller.rating }} ({{ seller.reviewCount }}개)</span>
        </div>
      </div>
      <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SellerCard',
  props: {
    seller: {
      type: Object,
      required: true
    }
  },
  emits: ['view-profile']
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

.seller-info {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
}

.seller-info:hover {
  background: #f8f9fa;
}

.seller-avatar {
  width: 48px;
  height: 48px;
  background: #e3f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
}

.seller-details {
  flex: 1;
}

.seller-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.seller-rating .stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 14px;
  transition: all 0.2s ease;
}

.star.filled {
  color: #ffd700;
}

.rating-text {
  color: #6c757d;
  font-size: 14px;
  margin-left: 8px;
}

.chevron {
  color: #a0aec0;
}
</style>