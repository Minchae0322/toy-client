<template>
  <section class="trending-foods-section">
    <div class="section-header">
      <h2 class="section-title">
        <Coffee class="section-title-icon" />
        요즘 뜨는 먹거리
      </h2>
      <button class="view-more-button">더보기</button>
    </div>

    <div class="foods-grid">
      <div
          v-for="food in foods"
          :key="food.id"
          class="food-card"
      >
        <div class="food-image-container">
          <img
              :src="food.image"
              :alt="food.name"
              class="food-image"
          />
          <span
              v-if="food.isHot"
              class="food-tag hot-tag"
          >
            🔥 HOT
          </span>
          <span
              v-if="food.isNew"
              class="food-tag new-tag"
          >
            ✨ NEW
          </span>
        </div>
        <div class="food-info">
          <h3 class="food-name">{{ food.name }}</h3>
          <p class="food-brand">{{ food.brand }}</p>
          <div class="food-rating-price">
            <div class="food-rating">
              <div class="star-rating">
                <span
                    v-for="i in 5"
                    :key="i"
                    class="star-icon"
                    :class="{
                    'star-filled': i <= Math.floor(food.rating),
                    'star-empty': i > Math.floor(food.rating)
                  }"
                >
                  ⭐
                </span>
              </div>
              <span class="review-count">({{ food.reviews }})</span>
            </div>
            <span class="food-price">{{ food.price }}</span>
          </div>
          <button class="action-button">
            줍줍하기 👋
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {Coffee} from 'lucide-vue-next';

defineProps({
  foods: Array
});
</script>

<style scoped>
.trending-foods-section {
  /* 섹션 전체에 특별한 Tailwind 클래스 없음, 컨테이너 역할 */
  padding: 1rem; /* 컨테이너에 패딩이 있다면 여기에 추가 */
}

.section-header {
  /* flex items-center justify-between mb-4 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem; /* mb-4 */
}

.section-title {
  /* text-xl font-bold flex items-center */
  font-size: 1.25rem; /* text-xl */
  font-weight: bold;
  display: flex;
  align-items: center;
  /* text-black 또는 기본 텍스트 색상 */
}

.section-title-icon {
  /* w-5 h-5 mr-2 text-orange-500 */
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  margin-right: 0.5rem; /* mr-2 */
  color: #f97316; /* text-orange-500 */
  flex-shrink: 0; /* 아이콘이 찌그러지지 않도록 */
}

.view-more-button {
  /* text-purple-600 text-sm font-medium */
  color: #9333ea; /* text-purple-600 */
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  background: none;
  border: none;
  cursor: pointer;
  padding: 0; /* 기본 버튼 패딩 제거 */
}

.foods-grid {
  /* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 */
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr)); /* grid-cols-1 */
  gap: 1rem; /* gap-4 */
}

/* 반응형 디자인: md (768px 이상) */
@media (min-width: 768px) {
  .foods-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)); /* md:grid-cols-2 */
  }
}

/* 반응형 디자인: lg (1024px 이상) */
@media (min-width: 1024px) {
  .foods-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)); /* lg:grid-cols-3 */
  }
}

.food-card {
  /* bg-white rounded-xl shadow-sm overflow-hidden */
  background-color: var(--bg-elevated);
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  overflow: hidden;
}

.food-image-container {
  /* relative */
  position: relative;
}

.food-image {
  /* w-full h-40 object-cover */
  width: 100%;
  height: 10rem; /* h-40 (40 * 0.25rem = 10rem) */
  object-fit: cover;
}

.food-tag {
  /* absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full */
  position: absolute;
  top: 0.5rem; /* top-2 */
  left: 0.5rem; /* left-2 */
  color: white;
  font-size: 0.75rem; /* text-xs */
  padding: 0.25rem 0.5rem; /* px-2 py-1 */
  border-radius: 9999px; /* rounded-full */
}

.hot-tag {
  /* bg-red-500 */
  background-color: #ef4444; /* red-500 */
}

.new-tag {
  /* bg-green-500 */
  background-color: #22c55e; /* green-500 */
}

.food-info {
  /* p-4 */
  padding: 1rem; /* p-4 */
}

.food-name {
  /* font-medium mb-1 */
  font-weight: 500;
  margin-bottom: 0.25rem; /* mb-1 */
  /* text-black 또는 기본 텍스트 색상 */
}

.food-brand {
  /* text-sm text-gray-600 mb-2 */
  font-size: 0.875rem; /* text-sm */
  color: #4b5563; /* text-gray-600 */
  margin-bottom: 0.5rem; /* mb-2 */
}

.food-rating-price {
  /* flex items-center justify-between mb-3 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem; /* mb-3 */
}

.food-rating {
  /* flex items-center space-x-2 */
  display: flex;
  align-items: center;
  gap: 0.5rem; /* space-x-2 */
}

.star-rating {
  /* flex items-center */
  display: flex;
  align-items: center;
}

.star-icon {
  /* text-xs */
  font-size: 0.75rem; /* text-xs */
}

.star-filled {
  /* text-yellow-400 */
  color: #facc15; /* yellow-400 */
}

.star-empty {
  /* text-gray-300 */
  color: #d1d5db; /* gray-300 */
}

.review-count {
  /* text-sm text-gray-600 */
  font-size: 0.875rem; /* text-sm */
  color: #4b5563; /* text-gray-600 */
}

.food-price {
  /* font-medium text-purple-600 */
  font-weight: 500;
  color: #9333ea; /* purple-600 */
}

.action-button {
  /* w-full bg-purple-100 text-purple-600 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors */
  width: 100%; /* w-full */
  background-color: #f3e8ff; /* purple-100 */
  color: #9333ea; /* purple-600 */
  padding-top: 0.5rem; /* py-2 */
  padding-bottom: 0.5rem; /* py-2 */
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  border: none;
  cursor: pointer;
  transition: background-color 150ms ease-in-out; /* transition-colors */
}

.action-button:hover {
  background-color: #e9d5ff; /* hover:bg-purple-200 */
}
</style>