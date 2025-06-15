<template>
  <div class="card reviews-card">
    <div class="card-title">
      <h3>리뷰 ({{ reviews.length }})</h3>
      <button @click="$emit('write-review')" class="write-review-btn">리뷰 작성</button>
    </div>
    <div class="reviews-list">
      <div v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span class="reviewer-name">{{ review.userName }}</span>
          </div>
          <div class="review-meta">
            <div class="review-rating">
              <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.rating }">★</span>
            </div>
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>
        </div>
        <p class="review-content">{{ review.content }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReviewsCard',
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  emits: ['write-review'],
  methods: {
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

.write-review-btn {
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.write-review-btn:hover {
  background: #3182ce;
}

.reviews-list {
  padding: 0 20px 20px 20px;
}

.review-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-avatar {
  width: 32px;
  height: 32px;
  background: #f0f2f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.reviewer-name {
  font-weight: 600;
  color: #2d3748;
}

.review-meta {
  text-align: right;
}

.review-rating .star {
  color: #ddd;
  font-size: 12px;
  transition: all 0.2s ease;
}

.review-rating .star.filled {
  color: #ffd700;
}

.review-date {
  font-size: 12px;
  color: #a0aec0;
  display: block;
  margin-top: 2px;
}

.review-content {
  color: #4a5568;
  line-height: 1.5;
  margin: 0;
}
</style>