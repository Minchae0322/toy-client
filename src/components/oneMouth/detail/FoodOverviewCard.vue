<template>
  <div class="card food-overview-card">
    <div class="card-header">
      <button @click="$emit('go-back')" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      <div class="header-actions">
        <button @click="$emit('toggle-like')" class="action-btn" :class="{ liked: isLiked }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button @click="$emit('share-food')" class="action-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16,6 12,2 8,6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="food-main-info">
      <div class="food-emoji">
        <img :src="food.image" alt="음식 이미지" class="food-image" />
      </div>
      <div class="food-details">
        <h1 class="food-name">{{ food.name }}</h1>
        <div class="badges">
          <span v-if="food.trending" class="badge trending">🔥 인기</span>
          <span class="badge category">{{ getCategoryName(food.category) }}</span>
        </div>
        <div class="rating-info">
          <div class="stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.floor(food.rating) }">★</span>
            <span class="rating-text">{{ food.rating }} ({{ food.reviewCount }}개 리뷰)</span>
          </div>
        </div>
        <p class="food-description">{{ food.description }}</p>
        <div class="location">📍 {{ food.location }}</div>

        <!-- 가격 정보 이곳으로 이동 -->
        <div class="price-stock">
          <div class="price">₩{{ food.price.toLocaleString() }}</div>
          <div class="stock">재고 {{ food.stock }}개</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoodOverviewCard',
  props: {
    food: {
      type: Object,
      required: true
    },
    isLiked: {
      type: Boolean,
      default: false
    }
  },
  emits: ['go-back', 'toggle-like', 'share-food'],
  methods: {
    getCategoryName(category) {
      const categories = {
        snacks: '🥟 간식',
        drinks: '🧋 음료',
        desserts: '🍰 디저트'
      };
      return categories[category] || '🍽️ 기타';
    }
  }
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 400px; /* 컴포넌트 높이 확장 */
}

.card:hover {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.12);
}

.food-overview-card {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f2f5;
}

.back-btn {
  background: #f8f9fa;
  border: none;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e9ecef;
  transform: translateX(-2px);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: #f8f9fa;
  border: none;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e9ecef;
}

.action-btn.liked {
  background: #ff6b6b;
  color: white;
}



.food-main-info {
  padding: 32px;
  display: flex;
  align-items: stretch;
  gap: 32px;
}
.food-emoji {
  flex: 1;
  background: #f8f9fa;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  min-height: 260px;
}

.food-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.food-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 12px;
}

.food-name {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2d3748;
}

.badges {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge.trending {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
}

.badge.category {
  background: #e3f2fd;
  color: #1976d2;
}

.rating-info {
  margin-bottom: 16px;
}

.stars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star {
  color: #ddd;
  font-size: 18px;
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

.food-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 12px;
}

.location {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 16px;
}

.price-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
}

.stock {
  color: #6c757d;
  font-size: 14px;
}

@media (max-width: 768px) {
  .food-main-info {
    flex-direction: column;
    padding: 20px;
    text-align: center;
  }

  .food-emoji {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 16px;
  }

  .food-details {
    align-items: center;
  }

  .price-stock {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>
