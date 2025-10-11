<template>
  <div class="review-section">
    <!-- 섹션 헤더 -->
    <div class="section-header">
      <div class="section-title-wrapper">
        <h2 class="section-title">💬 리뷰</h2>
        <span class="section-count">{{ product.reviewCount || 0 }}개</span>
      </div>
      <div class="reviews-stats">
        <span class="avg-rating">⭐ {{ formatRating(product.averageRating) }}</span>
        <span class="review-count">평균 평점</span>
      </div>
    </div>

    <!-- 리뷰 액션 -->
    <div class="reviews-actions">
      <button
          class="write-review-btn"
          @click="$emit('write-review')"
          :disabled="!isLoggedIn"
      >
        {{ isLoggedIn ? '✍️ 리뷰 작성하기' : '🔒 로그인 후 리뷰 작성' }}
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
              <div class="user-rating">⭐ {{ formatRating(review.rating) }}</div>
            </div>
          </div>
          <div class="review-date">{{ getRelativeTime(review.createdAt) }}</div>
        </div>
        <div class="review-content">{{ review.comment }}</div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <div class="empty-icon">💬</div>
      <p>아직 작성된 리뷰가 없습니다</p>
      <p class="empty-description">이 상품의 첫 리뷰를 작성해보세요!</p>
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
  padding: 32px 24px;
  border-bottom: 1px solid #f1f5f9;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin: 0;
}

.section-count {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
}

.reviews-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.avg-rating {
  font-size: 20px;
  font-weight: 700;
  color: #169976;
}

.review-count {
  font-size: 13px;
  color: #64748b;
}

/* 리뷰 액션 */
.reviews-actions {
  margin-bottom: 24px;
}

.write-review-btn {
  background: #1DCD9F;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  max-width: 300px;
}

.write-review-btn:hover:not(:disabled) {
  background: #169976;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.3);
}

.write-review-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

/* 리뷰 목록 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.review-item:hover {
  border-color: #e2e8f0;
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
  background: #1DCD9F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #000000;
  font-size: 15px;
}

.user-rating {
  font-size: 13px;
  color: #169976;
  font-weight: 500;
}

.review-date {
  font-size: 12px;
  color: #64748b;
}

.review-content {
  font-size: 15px;
  line-height: 1.6;
  color: #222222;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 18px;
  color: #000000;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px !important;
  color: #64748b !important;
  font-weight: 400 !important;
  margin-bottom: 24px !important;
}

.empty-state .write-review-btn {
  margin: 0 auto;
}

@media (max-width: 768px) {
  .review-section {
    padding: 24px 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .reviews-stats {
    align-items: flex-start;
  }

  .section-title {
    font-size: 22px;
  }

  .write-review-btn {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .review-section {
    padding: 20px 12px;
  }

  .section-title {
    font-size: 20px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .empty-icon {
    font-size: 64px;
  }
}
</style>