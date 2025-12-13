<template>
  <div :class="['product-card', viewMode, { 'is-liked': product.isLiked }]" @click="handleCardClick">
    <!-- 그리드 모드 -->
    <div v-if="viewMode === 'grid'" class="grid-layout">
      <!-- 이미지 영역 -->
      <div class="image-container">
        <img
            v-if="product.thumbnailUrl"
            :src="product.thumbnailUrl"
            :alt="product.name"
            class="product-image"
            @error="handleImageError"
        />
        <div v-else class="image-placeholder">
          <Package :size="48" />
        </div>

        <!-- 배지들 -->
        <div class="badges">
          <span v-if="product.isNew" class="badge new">NEW</span>
          <span v-if="product.averageRating >= 4.5" class="badge top-rated">★</span>
        </div>

        <!-- 찜하기 버튼 -->
        <button
            class="like-btn"
            :class="{ active: product.isLiked }"
            @click.stop="handleLikeClick"
        >
          <Heart :size="18" :fill="product.isLiked ? 'currentColor' : 'none'" />
        </button>
      </div>

      <!-- 정보 영역 -->
      <div class="info-section">
        <div class="brand-name">{{ product.brand }}</div>
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="category">{{ product.categoryName }}</div>

        <!-- 평점 및 리뷰 -->
        <div class="rating-section" v-if="product.averageRating > 0">
          <div class="stars">
            <Star
                v-for="i in 5"
                :key="i"
                :size="14"
                :fill="i <= Math.round(product.averageRating) ? '#fbbf24' : 'none'"
                :color="i <= Math.round(product.averageRating) ? '#fbbf24' : '#d1d5db'"
            />
          </div>
          <span class="rating-text">{{ product.averageRating.toFixed(1) }}</span>
          <span class="review-count">({{ product.reviewCount }})</span>
        </div>

        <!-- 가격 -->
        <div class="price-section">
          <span class="buy-price">{{ product.displayPrice }}</span>
        </div>

        <!-- 통계 -->
        <div class="stats">
          <span class="stat-item">
            <Eye :size="14" />
            {{ formatNumber(product.viewCount) }}
          </span>
          <span class="stat-item">
            <Heart :size="14" />
            {{ formatNumber(product.likeCount) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 리스트 모드 -->
    <div v-else class="list-layout">
      <!-- 이미지 영역 -->
      <div class="image-container">
        <img
            v-if="product.thumbnailUrl"
            :src="product.thumbnailUrl"
            :alt="product.name"
            class="product-image"
            @error="handleImageError"
        />
        <div v-else class="image-placeholder">
          <Package :size="32" />
        </div>
      </div>

      <!-- 정보 영역 -->
      <div class="info-section">
        <div class="main-info">
          <div class="header-section">
            <div class="brand-category">
              <span class="brand-name">{{ product.brand }}</span>
              <span class="category">{{ product.categoryName }}</span>
            </div>
            <div class="badges">
              <span v-if="product.isNew" class="badge new">NEW</span>
              <span v-if="product.averageRating >= 4.5" class="badge top-rated">★</span>
            </div>
          </div>

          <h3 class="product-name">{{ product.name }}</h3>

          <div class="meta-section">
            <!-- 평점 -->
            <div class="rating-section" v-if="product.averageRating > 0">
              <div class="stars">
                <Star
                    v-for="i in 5"
                    :key="i"
                    :size="12"
                    :fill="i <= Math.round(product.averageRating) ? '#fbbf24' : 'none'"
                    :color="i <= Math.round(product.averageRating) ? '#fbbf24' : '#d1d5db'"
                />
              </div>
              <span class="rating-text">{{ product.averageRating.toFixed(1) }}</span>
              <span class="review-count">({{ product.reviewCount }})</span>
            </div>

            <!-- 출시일 -->
            <div class="release-date">
              출시일: {{ formatDate(product.releaseDate) }}
            </div>
          </div>
        </div>

        <!-- 우측 액션 영역 -->
        <div class="action-section">
          <div class="price-section">
            <span class="buy-price">{{ product.displayPrice }}</span>
          </div>

          <div class="stats">
            <span class="stat-item">
              <Eye :size="14" />
              {{ formatNumber(product.viewCount) }}
            </span>
            <span class="stat-item">
              <Heart :size="14" />
              {{ formatNumber(product.likeCount) }}
            </span>
          </div>

          <button
              class="like-btn"
              :class="{ active: product.isLiked }"
              @click.stop="handleLikeClick"
          >
            <Heart :size="16" :fill="product.isLiked ? 'currentColor' : 'none'" />
            찜하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Package, Heart, Star, Eye } from 'lucide-vue-next'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  }
})

const emit = defineEmits(['view-detail', 'toggle-like'])

// 메서드
const handleCardClick = () => {
  emit('view-detail', props.product)
}

const handleLikeClick = () => {
  emit('toggle-like', props.product)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling?.classList.add('visible')
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return Math.floor(num / 1000000) + 'M'
  } else if (num >= 1000) {
    return Math.floor(num / 1000) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.product-card.is-liked {
  border: 2px solid #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

/* 그리드 모드 스타일 */
.grid-layout {
  display: flex;
  flex-direction: column;
}

.grid-layout .image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f8fafc;
}

.grid-layout .product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .grid-layout .product-image {
  transform: scale(1.05);
}

.grid-layout .image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  background: #f1f5f9;
}

.grid-layout .badges {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

.grid-layout .like-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.grid-layout .like-btn:hover {
  background: white;
  color: #ef4444;
  transform: scale(1.1);
}

.grid-layout .like-btn.active {
  background: #fef2f2;
  color: #ef4444;
}

.grid-layout .info-section {
  padding: 1.25rem;
}

.grid-layout .brand-name {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.grid-layout .product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.grid-layout .category {
  font-size: 0.75rem;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 0.75rem;
}

.grid-layout .rating-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.grid-layout .stars {
  display: flex;
  gap: 2px;
}

.grid-layout .rating-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.grid-layout .review-count {
  font-size: 0.75rem;
  color: #64748b;
}

.grid-layout .price-section {
  margin-bottom: 0.75rem;
}

.grid-layout .buy-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.grid-layout .stats {
  display: flex;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.grid-layout .stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
}

/* 리스트 모드 스타일 */
.list-layout {
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
}

.list-layout .image-container {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

.list-layout .product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-layout .image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  background: #f1f5f9;
}

.list-layout .info-section {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.list-layout .main-info {
  flex: 1;
}

.list-layout .header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.list-layout .brand-category {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.list-layout .brand-name {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

.list-layout .category {
  font-size: 0.75rem;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.list-layout .badges {
  display: flex;
  gap: 0.5rem;
}

.list-layout .product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.list-layout .meta-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-layout .rating-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.list-layout .stars {
  display: flex;
  gap: 1px;
}

.list-layout .rating-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.list-layout .review-count {
  font-size: 0.75rem;
  color: #64748b;
}

.list-layout .release-date {
  font-size: 0.75rem;
  color: #64748b;
}

.list-layout .action-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  min-width: 120px;
}

.list-layout .price-section {
  text-align: right;
}

.list-layout .buy-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.list-layout .stats {
  display: flex;
  gap: 0.75rem;
}

.list-layout .stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
}

.list-layout .like-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-layout .like-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.list-layout .like-btn.active {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

/* 공통 배지 스타일 */
.badge {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.new {
  background: #dcfce7;
  color: #166534;
}

.badge.top-rated {
  background: #fef3c7;
  color: #92400e;
}

/* 반응형 */
@media (max-width: 768px) {
  .list-layout {
    flex-direction: column;
    gap: 1rem;
  }

  .list-layout .image-container {
    width: 100%;
    height: 200px;
  }

  .list-layout .info-section {
    flex-direction: column;
    gap: 1rem;
  }

  .list-layout .action-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: auto;
  }

  .list-layout .stats {
    order: -1;
  }
}

/* 호버 효과 */
.product-card:hover .like-btn {
  transform: scale(1.05);
}

/* 포커스 접근성 */
.product-card:focus,
.like-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .product-card {
    background: #1f2937;
    color: #f9fafb;
  }

  .product-name {
    color: #f9fafb;
  }

  .brand-name {
    color: #9ca3af;
  }

  .buy-price {
    color: #f9fafb;
  }

  .category {
    background: #1e3a8a;
    color: #bfdbfe;
  }

  .like-btn {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }

  .like-btn:hover {
    background: #4b5563;
  }

  .like-btn.active {
    background: #7f1d1d;
    border-color: #b91c1c;
    color: #fca5a5;
  }

  .image-placeholder {
    background: #374151;
  }

  .grid-layout .image-container,
  .list-layout .image-container {
    background: #374151;
  }

  .grid-layout .stats {
    border-top-color: #374151;
  }
}

/* 애니메이션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .product-image,
  .like-btn {
    transition: none !important;
  }

  .product-card:hover {
    transform: none !important;
  }

  .product-card:hover .product-image {
    transform: none !important;
  }
}
</style>