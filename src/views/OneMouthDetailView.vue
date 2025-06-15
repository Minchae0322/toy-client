<template>
  <div class="detail-container">
    <!-- Header with back button -->
    <header class="detail-header">
      <button class="back-btn" @click="goBack">
        ← 목록으로
      </button>
      <div class="header-actions">
        <button class="heart-btn" :class="{ liked: isLiked }" @click="toggleLike">
          {{ isLiked ? '❤️' : '🤍' }}
        </button>
        <button class="share-btn" @click="shareFood">
          📤
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main class="detail-main">
      <!-- Food overview section with left image -->
      <section class="food-overview-section">
        <!-- Food image (left side) -->
        <div class="food-image-container">
          <div class="food-emoji">{{ food.emoji }}</div>
          <div class="badges">
            <div class="trending-badge" v-if="food.trending">🌟 HOT</div>
            <div class="selling-badge" v-if="food.selling">💰 판매중</div>
          </div>
        </div>

        <!-- Food info (right side) -->
        <div class="food-info-container">
          <div class="food-basic-info">
            <h1 class="food-name">{{ food.name }}</h1>
            <p class="food-description">{{ food.description }}</p>

            <div class="food-meta">
              <div class="rating-info">
                <span class="rating">⭐ {{ food.rating }}</span>
                <span class="review-count">({{ food.reviewCount }}개 리뷰)</span>
              </div>
              <div class="location-info">
                <span class="location">📍 {{ food.location }}</span>
              </div>
            </div>
          </div>

          <!-- Price and stock info -->
          <div class="price-stock-section" v-if="food.selling">
            <div class="price-info">
              <span class="price-label">가격</span>
              <span class="price">{{ food.price.toLocaleString() }}원</span>
            </div>
            <div class="stock-info">
              <span class="stock-label">재고</span>
              <span class="stock" :class="{ 'low-stock': food.stock <= 5 }">
                {{ food.stock }}개 남음
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Seller info section -->
      <section class="seller-section">
        <div class="seller-info">
          <div class="seller-avatar">👤</div>
          <div class="seller-details">
            <h3 class="seller-name">{{ food.seller.name }}</h3>
            <p class="seller-rating">⭐ {{ food.seller.rating }} ({{ food.seller.reviewCount }})</p>
          </div>
        </div>
        <button class="seller-profile-btn" @click="viewSellerProfile">
          프로필 보기
        </button>
      </section>

      <!-- Food details section -->
      <section class="food-details-section">
        <h3 class="section-title">상세 정보</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">카테고리</span>
            <span class="detail-value">{{ getCategoryName(food.category) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">등록일</span>
            <span class="detail-value">{{ formatDate(food.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">유통기한</span>
            <span class="detail-value">{{ formatDate(food.expiryDate) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">상태</span>
            <span class="detail-value">{{ food.condition }}</span>
          </div>
        </div>
      </section>

      <!-- Reviews section -->
      <section class="reviews-section">
        <div class="reviews-header">
          <h3 class="section-title">리뷰 ({{ reviews.length }})</h3>
          <button class="write-review-btn" @click="writeReview">
            리뷰 쓰기
          </button>
        </div>

        <div class="reviews-list" v-if="reviews.length > 0">
          <div class="review-item" v-for="review in reviews" :key="review.id">
            <div class="review-header">
              <div class="reviewer-info">
                <span class="reviewer-name">{{ review.userName }}</span>
                <span class="review-rating">⭐ {{ review.rating }}</span>
              </div>
              <span class="review-date">{{ formatDate(review.createdAt) }}</span>
            </div>
            <p class="review-content">{{ review.content }}</p>
          </div>
        </div>

        <div class="no-reviews" v-else>
          <p>아직 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요! 🌟</p>
        </div>
      </section>
    </main>

    <!-- Fixed bottom actions -->
    <div class="bottom-actions" v-if="food.selling">
      <button class="chat-btn" @click="startChat">
        💬 채팅하기
      </button>
      <button class="request-btn" @click="requestShare">
        🍽️ 한입 나눔 요청
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoodDetailPage',
  data() {
    return {
      isLiked: false,
      food: {
        id: 1,
        name: 'CU 신상 초코바',
        description: '진짜 맛있다는 소문의 그 초코바! 달콤한 초콜릿과 바삭한 쿠키가 만나 환상적인 조화를 이룹니다.',
        emoji: '🍫',
        rating: 4.8,
        reviewCount: 127,
        location: '강남구 역삼동',
        trending: true,
        selling: true,
        price: 1500,
        stock: 3,
        category: 'snacks',
        createdAt: '2024-12-10',
        expiryDate: '2024-12-25',
        condition: '새 상품',
        seller: {
          name: '음식러버123',
          rating: 4.9,
          reviewCount: 234
        }
      },
      reviews: [
        {
          id: 1,
          userName: '맛집탐험가',
          rating: 5,
          content: '정말 맛있어요! 초콜릿이 진짜 진하고 달달해서 기분이 좋아졌어요 ☺️',
          createdAt: '2024-12-08'
        },
        {
          id: 2,
          userName: '간식매니아',
          rating: 4,
          content: '가격도 저렴하고 맛도 좋네요. 다음에 또 사고싶어요!',
          createdAt: '2024-12-07'
        },
        {
          id: 3,
          userName: '초코홀릭',
          rating: 5,
          content: '초콜릿 좋아하는 사람이라면 꼭 먹어봐야 할 맛! 추천합니다 👍',
          createdAt: '2024-12-06'
        }
      ]
    }
  },
  methods: {
    goBack() {
      alert('목록 페이지로 돌아갑니다!');
    },
    toggleLike() {
      this.isLiked = !this.isLiked;
    },
    shareFood() {
      alert('음식 정보를 공유합니다!');
    },
    viewSellerProfile() {
      alert(`${this.food.seller.name}의 프로필을 확인합니다!`);
    },
    startChat() {
      alert(`${this.food.seller.name}과 채팅을 시작합니다!`);
    },
    requestShare() {
      alert(`${this.food.name} 한입 나눔을 요청했습니다!`);
    },
    writeReview() {
      alert('리뷰 작성 페이지로 이동합니다!');
    },
    getCategoryName(category) {
      const categories = {
        'snacks': '🥟 간식',
        'drinks': '🧋 음료',
        'desserts': '🍰 디저트'
      };
      return categories[category] || '🍽️ 기타';
    },
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
.detail-container {
  max-width: 1600px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 100px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  padding: 10px 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e9ecef;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.heart-btn,
.share-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.heart-btn.liked {
  background: #ff4757;
  border-color: #ff4757;
  color: white;
}

.detail-main {
  background: white;
  margin: 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Main overview section with left image layout */
.food-overview-section {
  display: flex;
  min-height: 300px;
}

.food-image-container {
  flex: 0 0 500px;
  position: relative;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.food-emoji {
  font-size: 180px;
}

.badges {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trending-badge,
.selling-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.trending-badge {
  background: #ff4757;
}

.selling-badge {
  background: #1DCD9F;
}

.food-info-container {
  flex: 1;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.food-basic-info {
  margin-bottom: 32px;
}

.food-name {
  font-size: 36px;
  font-weight: 700;
  color: #222;
  margin-bottom: 16px;
}

.food-description {
  font-size: 18px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
}

.food-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating {
  font-size: 18px;
  font-weight: 600;
  color: #ffa500;
}

.review-count {
  font-size: 16px;
  color: #888;
}

.location {
  font-size: 16px;
  color: #888;
}

.price-stock-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: auto;
}

.price-info,
.stock-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.price-label,
.stock-label {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #169976;
}

.stock {
  font-size: 16px;
  font-weight: 600;
  color: #169976;
}

.stock.low-stock {
  color: #ff4757;
}

.seller-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.seller-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.seller-name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.seller-rating {
  font-size: 14px;
  color: #ffa500;
}

.seller-profile-btn {
  padding: 8px 16px;
  background: #169976;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.seller-profile-btn:hover {
  background: #128a64;
}

.food-details-section,
.reviews-section {
  padding: 32px;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #222;
  font-weight: 600;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.write-review-btn {
  padding: 8px 16px;
  background: #169976;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.write-review-btn:hover {
  background: #128a64;
}

.reviews-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.review-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 16px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.review-rating {
  font-size: 12px;
  color: #ffa500;
}

.review-date {
  font-size: 12px;
  color: #888;
}

.review-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  color: #888;
  font-size: 14px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1600px;
  background: white;
  padding: 20px 48px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 16px;
}

.chat-btn,
.request-btn {
  flex: 1;
  max-width: 300px;
  padding: 18px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chat-btn {
  background: #f8f9fa;
  color: #169976;
  border: 1px solid #169976;
}

.chat-btn:hover {
  background: #e9ecef;
}

.request-btn {
  background: #169976;
  color: white;
}

.request-btn:hover {
  background: #128a64;
  transform: translateY(-1px);
}

/* Mobile and Tablet responsive */
@media (max-width: 1200px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .reviews-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-container {
    margin: 0;
  }

  .detail-main {
    margin: 0;
    border-radius: 0;
  }

  .food-overview-section {
    flex-direction: column;
    min-height: auto;
  }

  .food-image-container {
    flex: none;
    height: 250px;
  }

  .food-info-container {
    padding: 24px 20px;
  }

  .food-name {
    font-size: 24px;
  }

  .seller-section,
  .food-details-section,
  .reviews-section {
    padding: 24px 20px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .price-stock-section {
    padding: 16px;
  }

  .bottom-actions {
    padding: 16px 20px;
    gap: 12px;
  }

  .chat-btn,
  .request-btn {
    max-width: none;
    padding: 16px;
  }
}
</style>