<template>
  <div
      class="food-card"
      :class="{
      'not-selling': !food.selling,
      'trending': food.trending,
      'limited': food.isLimited
    }"
      @click="handleCardClick"
  >
    <!-- 상태 배지들 -->
    <div class="badges" v-if="hasBadges">
      <span v-if="food.trending" class="badge trending">🔥 인기</span>
      <span v-if="food.isLimited" class="badge limited">⏰ 한정</span>
      <span v-if="!food.selling" class="badge sold-out">품절</span>
    </div>

    <!-- 이미지 영역 -->
    <div class="image-section">
      <div class="image-container">
        <img
            v-if="food.imageUrl"
            :src="food.imageUrl"
            :alt="food.name"
            class="food-image"
            @error="handleImageError"
            loading="lazy"
        />
        <div v-else class="placeholder-image">
          <span class="emoji">{{ food.emoji }}</span>
        </div>
      </div>

      <!-- 가격 표시 -->
      <div class="price-tag">
        <span class="price">{{ formatPrice(food.price) }}</span>
      </div>
    </div>

    <!-- 정보 영역 -->
    <div class="info-section">
      <div class="main-info">
        <h3 class="food-name">{{ food.name }}</h3>
        <p class="food-description">{{ truncateDescription(food.description) }}</p>
      </div>

      <div class="meta-info">
        <div class="location">
          <span class="icon">📍</span>
          <span class="text">{{ food.location }}</span>
        </div>

        <div class="stats">
          <div class="stat-item">
            <span class="icon">👁️</span>
            <span class="count">{{ formatCount(food.reviewCount) }}</span>
          </div>
          <div class="stat-item" v-if="food.favoritesCount > 0">
            <span class="icon">❤️</span>
            <span class="count">{{ formatCount(food.favoritesCount) }}</span>
          </div>
        </div>
      </div>

      <div class="category-tag">
        <span class="category">{{ getCategoryDisplay(food.category) }}</span>
        <span class="time">{{ formatTimeAgo(food.createdAt) }}</span>
      </div>
    </div>

    <!-- 호버 효과용 오버레이 -->
    <div class="hover-overlay"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  food: {
    type: Object,
    required: true,
    validator: (food) => {
      return food && typeof food.id !== 'undefined' && food.name;
    }
  }
});

// Computed
const hasBadges = computed(() => {
  return props.food.trending || props.food.isLimited || !props.food.selling;
});

// 이벤트 핸들러들
const handleCardClick = () => {
  // 카드 클릭은 부모 컴포넌트에서 @click으로 처리 (상세 페이지로 이동)
  console.log('카드 클릭:', props.food.name);
};

const handleImageError = (event) => {
  console.log('이미지 로드 실패:', props.food.name);
  event.target.style.display = 'none';
};

// 유틸리티 함수들
const formatPrice = (price) => {
  if (!price || price === 0) return '무료';
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

const formatCount = (count) => {
  if (!count) return '0';
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

const truncateDescription = (description) => {
  if (!description) return '';
  return description.length > 60
      ? description.substring(0, 60) + '...'
      : description;
};

const getCategoryDisplay = (category) => {
  if (!category) return '기타';

  const categoryMap = {
    '편의점': '🏪 편의점',
    '카페': '☕ 카페',
    '간식': '🍫 간식',
    '음료': '🧋 음료',
    '디저트': '🍰 디저트',
    '한식': '🍚 한식',
    '중식': '🥢 중식',
    '일식': '🍣 일식',
    '양식': '🍝 양식'
  };

  return categoryMap[category] || `🍽️ ${category}`;
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}분 전`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};
</script>

<style scoped>
.food-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 2px solid transparent;
}

.food-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.food-card.trending {
  border-color: #e74c3c;
}

.food-card.limited {
  border-color: #f39c12;
}

.food-card.not-selling {
  opacity: 0.7;
}

.food-card.not-selling:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: #bdc3c7;
}

/* 배지들 */
.badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.badge.trending {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
}

.badge.limited {
  background: linear-gradient(45deg, #f39c12, #d68910);
}

.badge.sold-out {
  background: rgba(0, 0, 0, 0.8);
}

/* 이미지 영역 */
.image-section {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #f8f9fa;
}

.food-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.food-card:hover .food-image {
  transform: scale(1.05);
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.placeholder-image .emoji {
  font-size: 3em;
}

.price-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.price {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

/* 정보 영역 */
.info-section {
  padding: 16px;
}

.main-info {
  margin-bottom: 12px;
}

.food-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1.3;
}

.food-description {
  color: #7f8c8d;
  font-size: 0.9em;
  line-height: 1.4;
  margin: 0;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.location {
  display: flex;
  align-items: center;
  color: #95a5a6;
  font-size: 0.85em;
}

.location .icon {
  margin-right: 4px;
}

.location .text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  color: #95a5a6;
  font-size: 0.85em;
}

.stat-item .icon {
  margin-right: 2px;
}

.category-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8em;
}

.category {
  background: #ecf0f1;
  color: #34495e;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.time {
  color: #bdc3c7;
}

/* 호버 효과 */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(52, 152, 219, 0.02));
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.food-card:hover .hover-overlay {
  opacity: 1;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .food-card {
    border-radius: 12px;
  }

  .image-section {
    height: 160px;
  }

  .info-section {
    padding: 12px;
  }

  .food-name {
    font-size: 1em;
  }

  .meta-info {
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .image-section {
    height: 140px;
  }

  .badges {
    top: 8px;
    left: 8px;
  }

  .badge {
    font-size: 10px;
    padding: 3px 6px;
  }

  .price-tag {
    top: 8px;
    right: 8px;
    padding: 4px 8px;
  }

  .price {
    font-size: 12px;
  }
}
</style>