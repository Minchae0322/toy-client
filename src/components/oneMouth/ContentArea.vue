<!-- src/components/oneMouth/ContentArea.vue -->
<template>
  <div class="content-area">
    <!-- 로딩 상태 -->
    <div v-if="loading || initialLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>상품을 불러오는 중...</p>
    </div>

    <!-- 데이터가 없는 경우 -->
    <div v-else-if="!filteredFoods.length" class="empty-container">
      <p>표시할 상품이 없습니다.</p>
    </div>

    <!-- 상품 그리드 -->
    <div v-else class="food-grid">
      <div
          v-for="food in filteredFoods"
          :key="`food-${food.id}`"
          class="food-card"
          @click="handleFoodClick(food)"
          @keydown.enter="handleFoodClick(food)"
          tabindex="0"
          role="button"
          :aria-label="`${food.name} 상세보기`"
      >
        <!-- 이미지 영역 -->
        <div class="food-image">
          <img
              v-if="food.imageUrl"
              :src="food.imageUrl"
              :alt="food.name"
              @error="handleImageError"
              loading="lazy"
          />
          <div v-else class="no-image">
            <span class="food-emoji">{{ food.emoji || '🍽️' }}</span>
          </div>

          <!-- 상태 배지 -->
          <div v-if="food.trending" class="status-badge trending">🔥 인기</div>
          <div v-if="!food.selling" class="status-badge sold-out">품절</div>
        </div>

        <!-- 상품 정보 -->
        <div class="food-info">
          <h3 class="food-name">{{ food.name }}</h3>
          <p class="food-description">{{ food.description }}</p>

          <div class="food-meta">
            <span class="food-price">{{ formatPrice(food.price) }}</span>
            <span class="food-location">{{ food.location }}</span>
          </div>

          <div class="food-stats">
            <span class="rating">⭐ {{ food.rating || 0 }}</span>
            <span class="reviews">({{ food.reviewCount || 0 }})</span>
            <span class="views">👁️ {{ food.hits || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 더보기 버튼 -->
    <div v-if="hasMore && !loading" class="load-more-container">
      <button
          class="load-more-btn"
          @click="handleLoadMore"
          :disabled="loading"
      >
        더보기
      </button>
    </div>

    <!-- 로딩 중 (더보기) -->
    <div v-if="loading && filteredFoods.length > 0" class="loading-more">
      <div class="loading-spinner small"></div>
      <span>더 많은 상품을 불러오는 중...</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props 정의
const props = defineProps({
  filteredFoods: {
    type: Array,
    default: () => []
  },
  sortBy: {
    type: String,
    default: 'latest'
  },
  activeFilter: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  initialLoading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

// Emits 정의
const emit = defineEmits([
  'set-sort',
  'view-detail',
  'load-more',
  'scroll-end'
])

// 상품 카드 클릭 처리
const handleFoodClick = (food) => {
  console.log('ContentArea: 카드 클릭됨', {
    id: food.id,
    name: food.name,
    type: typeof food.id
  })

  // 이벤트 전달 확인
  emit('view-detail', food)

  console.log('ContentArea: view-detail 이벤트 emit 완료')
}

// 더보기 버튼 클릭 처리
const handleLoadMore = () => {
  console.log('ContentArea: 더보기 버튼 클릭')
  emit('load-more')
}

// 이미지 에러 처리
const handleImageError = (event) => {
  console.log('이미지 로드 실패:', event.target.src)
  event.target.style.display = 'none'
  event.target.parentElement.classList.add('error')
}

// 가격 포맷팅
const formatPrice = (price) => {
  if (!price || price === 0) return '무료'
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

// 스크롤 이벤트 처리 (무한 스크롤)
const handleScroll = () => {
  const container = document.querySelector('.content-area')
  if (!container || props.loading || !props.hasMore) return

  const { scrollTop, scrollHeight, clientHeight } = container

  // 스크롤이 바닥에 가까워지면 더보기
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    emit('scroll-end')
  }
}

// 컴포넌트 마운트 시 스크롤 이벤트 등록
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  const container = document.querySelector('.content-area')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const container = document.querySelector('.content-area')
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #1DCD9F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 빈 상태 */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 16px;
}

/* 상품 그리드 */
.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 상품 카드 */
.food-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.food-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #1DCD9F;
}

.food-card:focus {
  outline: none;
  border-color: #1DCD9F;
  box-shadow: 0 0 0 3px rgba(29, 205, 159, 0.1);
}

/* 이미지 영역 */
.food-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f8fafc;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.food-card:hover .food-image img {
  transform: scale(1.05);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #f8fafc, #e2e8f0);
}

.food-emoji {
  font-size: 48px;
}

/* 상태 배지 */
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.status-badge.trending {
  background: #ef4444;
}

.status-badge.sold-out {
  background: #6b7280;
}

/* 상품 정보 */
.food-info {
  padding: 16px;
}

.food-name {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.food-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.food-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.food-price {
  font-size: 16px;
  font-weight: 700;
  color: #1DCD9F;
}

.food-location {
  font-size: 12px;
  color: #9ca3af;
}

.food-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.rating {
  color: #f59e0b;
}

/* 더보기 버튼 */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.load-more-btn {
  padding: 12px 32px;
  background: #1DCD9F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-more-btn:hover {
  background: #169976;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 로딩 더보기 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 32px 0;
  color: #6b7280;
  font-size: 14px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .food-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .content-area {
    padding: 16px;
  }

  .food-image {
    height: 160px;
  }
}

@media (max-width: 480px) {
  .food-grid {
    grid-template-columns: 1fr;
  }

  .food-image {
    height: 140px;
  }
}
</style>