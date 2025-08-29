<template>
  <section class="reviews-section">
    <div class="section-header">
      <h2 class="section-title">
        리뷰
        <span class="review-count">{{ reviews.length }}</span>
      </h2>
      <button @click="$emit('write-review')" class="write-review-btn">
        리뷰 작성
      </button>
    </div>

    <div v-if="reviews.length > 0" class="reviews-list">
      <div v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">
              <img v-if="review.userProfileImage" :src="review.userProfileImage" :alt="review.userName" />
              <User v-else :size="16" />
            </div>
            <span class="reviewer-name">{{ review.userName }}</span>
          </div>
          <div class="review-rating">
            <Star v-for="i in 5" :key="i" :size="14" :fill="i <= review.rating ? '#FFB800' : 'none'" stroke="#FFB800" />
          </div>
        </div>
        <p class="review-content">{{ review.content }}</p>
        <span class="review-date">{{ formatRelativeTime(review.createdAt) }}</span>
      </div>
    </div>

    <div v-else class="empty-reviews">
      <MessageSquare :size="48" />
      <p>아직 리뷰가 없어요</p>
      <span>첫 번째 리뷰를 남겨보세요!</span>
    </div>

    <button v-if="reviewsHasMore" @click="$emit('load-more')" class="load-more-btn" :disabled="reviewsLoading">
      {{ reviewsLoading ? '로딩 중...' : '더 보기' }}
    </button>
  </section>
</template>

<script setup>
import { Star, User, MessageSquare } from 'lucide-vue-next';

defineProps({
  reviews: {
    type: Array,
    required: true
  },
  reviewsLoading: {
    type: Boolean,
    default: false
  },
  reviewsHasMore: {
    type: Boolean,
    default: false
  }
});

defineEmits(['write-review', 'load-more']);

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

  return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.reviews-section {
  padding: 24px 20px 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #191F28;
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-count {
  font-size: 14px;
  color: #8B95A1;
  font-weight: 500;
}

.write-review-btn {
  padding: 8px 16px;
  background: #FF6B6B;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.write-review-btn:hover {
  background: #FF5252;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px;
  background: #F8F9FA;
  border-radius: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #B0B8C1;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 600;
  color: #191F28;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-content {
  font-size: 14px;
  line-height: 1.5;
  color: #4E5968;
  margin-bottom: 8px;
}

.review-date {
  font-size: 12px;
  color: #8B95A1;
}

.empty-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #B0B8C1;
}

.empty-reviews p {
  margin-top: 16px;
  font-size: 16px;
  color: #4E5968;
}

.empty-reviews span {
  font-size: 14px;
  color: #8B95A1;
}

.load-more-btn {
  width: 100%;
  padding: 14px;
  margin-top: 20px;
  background: white;
  border: 1px solid #E5E8EB;
  border-radius: 8px;
  color: #4E5968;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #F8F9FA;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>