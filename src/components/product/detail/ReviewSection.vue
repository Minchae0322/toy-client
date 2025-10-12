<template>
  <div class="review-section">
    <!-- 섹션 헤더 -->
    <div class="section-header">
      <div class="section-title-wrapper">
        <h2 class="section-title">리뷰</h2>
        <span class="section-count">{{ product.reviewCount || 0 }}</span>
      </div>
      <div class="reviews-stats">
        <div class="avg-rating">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 1.66666L12.575 6.88333L18.3333 7.725L14.1667 11.7833L15.15 17.5167L10 14.8083L4.85 17.5167L5.83333 11.7833L1.66667 7.725L7.425 6.88333L10 1.66666Z" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="rating-value">{{ formatRating(product.averageRating) }}</span>
        </div>
        <span class="rating-label">평균 평점</span>
      </div>
    </div>

    <!-- 리뷰 액션 -->
    <div class="reviews-actions">
      <button
          class="write-review-btn"
          @click="$emit('write-review')"
          :disabled="!isLoggedIn"
      >
        {{ isLoggedIn ? '리뷰 작성하기' : '로그인 후 리뷰 작성' }}
      </button>
    </div>

    <!-- 리뷰 목록 -->
    <div v-if="product.recentReviews?.length > 0" class="reviews-list">
      <div
          v-for="review in product.recentReviews"
          :key="review.id"
          class="review-item"
      >
        <div class="review-header">
          <div class="review-user">
            <div class="user-avatar">{{ getInitial(review.userName) }}</div>
            <div class="user-info">
              <div class="user-name">{{ review.userName }}</div>
              <div class="user-rating">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.16666L8.6025 4.81833L12.8333 5.4075L9.91667 8.24833L10.605 12.4617L7 10.7658L3.395 12.4617L4.08333 8.24833L1.16667 5.4075L5.3975 4.81833L7 1.16666Z" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ formatRating(review.rating) }}</span>
              </div>
            </div>
          </div>
          <div class="review-date">{{ getRelativeTime(review.createdAt) }}</div>
        </div>
        <div class="review-content">{{ review.comment }}</div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" class="empty-icon">
        <path d="M40 73.3333C58.4095 73.3333 73.3333 58.4095 73.3333 40C73.3333 21.5905 58.4095 6.66666 40 6.66666C21.5905 6.66666 6.66666 21.5905 6.66666 40C6.66666 58.4095 21.5905 73.3333 40 73.3333Z" stroke="#D1D5DB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M27.5 33.3333H27.5333" stroke="#D1D5DB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M52.5 33.3333H52.5333" stroke="#D1D5DB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M28.3333 50H51.6667C52.5833 50 53.3333 49.25 53.3333 48.3333C53.3333 47.4167 52.5833 46.6667 51.6667 46.6667H28.3333C27.4167 46.6667 26.6667 47.4167 26.6667 48.3333C26.6667 49.25 27.4167 50 28.3333 50Z" fill="#D1D5DB"/>
      </svg>
      <h3 class="empty-title">아직 작성된 리뷰가 없습니다</h3>
      <p class="empty-description">이 상품의 첫 리뷰를 작성해보세요</p>
      <button
          class="write-review-btn"
          @click="$emit('write-review')"
          :disabled="!isLoggedIn"
      >
        첫 리뷰 작성하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { productUtils } from '@/services/ProductService.js'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['write-review'])

const formatRating = (rating) => productUtils.formatRating(rating)
const getRelativeTime = (date) => productUtils.formatDate(date)

const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?'
}
</script>

<style scoped>
.review-section {
  padding: 32px;
  border-bottom: 1px solid #F3F4F6;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #F3F4F6;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.section-count {
  font-size: 15px;
  color: #6B7280;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.reviews-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.avg-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}

.rating-label {
  font-size: 13px;
  color: #9CA3AF;
  font-weight: 500;
}

/* 리뷰 액션 */
.reviews-actions {
  margin-bottom: 24px;
}

.write-review-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.write-review-btn:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.write-review-btn:disabled {
  background: #D1D5DB;
  cursor: not-allowed;
  transform: none;
  color: #9CA3AF;
}

/* 리뷰 목록 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 20px;
  background: #FAFAFA;
  border-radius: 12px;
  border: 1px solid #F3F4F6;
  transition: all 0.2s;
}

.review-item:hover {
  border-color: #E5E7EB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
  letter-spacing: -0.01em;
}

.user-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6B7280;
  font-weight: 600;
}

.review-date {
  font-size: 13px;
  color: #9CA3AF;
  font-weight: 500;
}

.review-content {
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
  letter-spacing: -0.01em;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.8;
}

.empty-title {
  font-size: 18px;
  color: #111827;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .review-section {
    padding: 24px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding-bottom: 16px;
  }

  .reviews-stats {
    align-items: flex-start;
  }

  .section-title {
    font-size: 18px;
  }

  .review-content {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .review-section {
    padding: 20px;
  }

  .section-title {
    font-size: 17px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
  }

  .empty-title {
    font-size: 16px;
  }
}
</style>