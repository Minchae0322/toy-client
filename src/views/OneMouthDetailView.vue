<!-- TradeDetailPage.vue -->
<template>
  <div class="detail-page">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="goToList">
          <div class="logo-icon">🛒</div>
          <span>편의점 거래</span>
        </div>
        <nav class="nav-menu">
          <div class="nav-item active">개인거래</div>
          <div class="nav-item">공식제품</div>
          <div class="nav-item">커뮤니티</div>
          <div class="nav-item">이용가이드</div>
        </nav>
        <div class="header-actions">
          <button class="btn-secondary">로그인</button>
          <button class="btn-primary">판매하기</button>
        </div>
      </div>
    </header>

    <!-- 상세 컨텐츠 -->
    <div v-if="trade" class="detail-container">
      <div class="detail-wrapper">
        <!-- 이미지 섹션 -->
        <div class="detail-images">
          <div class="detail-image main">{{ trade.emoji }}</div>
          <div class="detail-image">📦</div>
          <div class="detail-image">✨</div>
        </div>

        <!-- 정보 섹션 -->
        <div class="detail-body">
          <!-- 제품 링크 배너 -->
          <div class="product-link-banner">
            <div class="product-link-icon">{{ trade.emoji }}</div>
            <div class="product-link-info">
              <div class="product-link-title">연관 공식 제품</div>
              <div class="product-link-sub">
                {{ trade.productInfo.name }} · ⭐ {{ trade.productInfo.rating }} ({{ trade.productInfo.reviews }}개 리뷰)
              </div>
            </div>
            <button class="btn-secondary small">제품 정보 보기</button>
          </div>

          <!-- 가격 정보 -->
          <div class="detail-price-section">
            <span class="detail-price">{{ formatPrice(trade.price) }}</span>
            <span class="detail-discount">-{{ trade.discount }}%</span>
            <span class="detail-badge">{{ trade.badge }}</span>
          </div>

          <!-- 제목 -->
          <h2 class="detail-title">{{ trade.title }}</h2>

          <!-- 상세 정보 그리드 -->
          <div class="detail-info-grid">
            <div class="info-item">
              <span class="info-label">상태</span>
              <span class="info-value">{{ trade.condition }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">수량</span>
              <span class="info-value">{{ trade.quantity }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">거래방법</span>
              <span class="info-value">{{ trade.tradeMethod }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">희망지역</span>
              <span class="info-value">{{ trade.location }}</span>
            </div>
          </div>

          <!-- 상세 설명 -->
          <div class="detail-description">
            <h3 class="section-title">상세 설명</h3>
            <p class="description-text">{{ trade.description }}</p>
          </div>

          <!-- 판매자 정보 -->
          <div class="seller-card">
            <div class="seller-main">
              <div class="seller-avatar-large">{{ trade.seller.avatar }}</div>
              <div class="seller-info-detailed">
                <div class="seller-name-large">{{ trade.seller.name }}</div>
                <div class="seller-stats">
                  ⭐ {{ trade.seller.rating }} · {{ trade.seller.tradeCount }}회 거래 · 최근 활동: 1시간 전
                </div>
              </div>
            </div>
            <button class="btn-secondary">다른 판매상품 보기</button>
          </div>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="detail-actions">
        <button class="btn-back" @click="goToList">목록으로</button>
        <button class="btn-chat">💬 채팅하기</button>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-else-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>상품 정보를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>상품을 찾을 수 없습니다</h2>
      <p>요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
      <button class="btn-primary" @click="goToList">목록으로 돌아가기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const trade = ref(null);
const loading = ref(true);

// 더미 데이터 (실제로는 API에서 가져옴)
const tradeData = {
  1: {
    id: 1,
    emoji: '☕',
    badge: '새상품',
    price: 7500,
    discount: 25,
    originalPrice: 10000,
    title: '스타벅스 아메리카노 Tall 쿠폰 1매',
    seller: {
      name: '카페인중독자',
      avatar: 'K',
      rating: 4.8,
      tradeCount: 32
    },
    distance: 0.5,
    condition: '새상품 (미개봉)',
    quantity: '1개',
    tradeMethod: '직거래, 택배',
    location: '강남역 2번 출구',
    description: '선물 받았는데 커피를 안 마셔서 판매합니다. 유효기간은 3개월 이상 남았어요. 직거래는 강남역 2번 출구에서 가능하고, 택배도 가능합니다! 포장은 완전히 뜯지 않은 새 상품이에요. 궁금하신 점 있으면 편하게 채팅 주세요 😊',
    productInfo: {
      name: '스타벅스 아메리카노 Tall',
      rating: 4.7,
      reviews: 234
    }
  },
  2: {
    id: 2,
    emoji: '🍱',
    badge: '거의 새것',
    price: 15000,
    discount: 20,
    originalPrice: 18800,
    title: 'CU 프리미엄 도시락 세트 (2개입)',
    seller: {
      name: '편의점러버',
      avatar: 'P',
      rating: 4.9,
      tradeCount: 45
    },
    distance: 1.2,
    condition: '거의 새것',
    quantity: '2개',
    tradeMethod: '직거래',
    location: '신논현역 근처',
    description: '오늘 구매했는데 계획이 취소되어 판매합니다. 유통기한 충분하고 냉장 보관 중입니다. 신논현역 근처에서 직거래 가능합니다.',
    productInfo: {
      name: 'CU 프리미엄 도시락',
      rating: 4.5,
      reviews: 156
    }
  },
  3: {
    id: 3,
    emoji: '🍪',
    badge: '사용감 있음',
    price: 3000,
    discount: 40,
    originalPrice: 5000,
    title: '롯데 초코파이 1박스 (6개입)',
    seller: {
      name: '초코좋아',
      avatar: 'C',
      rating: 4.6,
      tradeCount: 28
    },
    distance: 2.3,
    condition: '사용감 있음',
    quantity: '1박스',
    tradeMethod: '직거래, 편의점택배',
    location: '역삼동',
    description: '개봉했지만 상태 좋습니다. 유통기한 충분합니다. 직거래나 편의점택배 모두 가능합니다.',
    productInfo: {
      name: '롯데 초코파이',
      rating: 4.8,
      reviews: 892
    }
  }
};

// Methods
const formatPrice = (price) => {
  return price.toLocaleString() + '원';
};

const goToList = () => {
  router.push({ name: 'TradeList' });
};

const fetchTradeDetail = async (id) => {
  loading.value = true;

  try {
    // 실제로는 API 호출
    // const response = await tradeService.getTradeDetail(id);
    // trade.value = response.data;

    // 더미 데이터 사용
    await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션

    const tradeId = parseInt(id);
    trade.value = tradeData[tradeId] || null;

  } catch (error) {
    console.error('거래 정보 로딩 실패:', error);
    trade.value = null;
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        fetchTradeDetail(newId);
      }
    },
    { immediate: true }
);

// Lifecycle
onMounted(() => {
  console.log('거래 상세 페이지 마운트, ID:', route.params.id);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #1DCD9F;
  --primary-dark: #169976;
  --secondary: #000000;
  --gray: #222222;
  --light-gray: #666;
  --bg: #ffffff;
  --bg-secondary: #fafafa;
  --border: #e5e7eb;
}

.detail-page {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #fafafa;
  color: var(--secondary);
  line-height: 1.6;
  min-height: 100vh;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 26px;
  font-weight: 800;
  color: var(--secondary);
  cursor: pointer;
  transition: transform 0.3s;
}

.logo:hover {
  transform: translateY(-2px);
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 16px rgba(29, 205, 159, 0.3);
}

.nav-menu {
  display: flex;
  gap: 48px;
  align-items: center;
}

.nav-item {
  color: var(--gray);
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  padding: 10px 0;
  transition: color 0.3s;
}

.nav-item:hover {
  color: var(--primary);
}

.nav-item.active {
  color: var(--primary);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 3px;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(29, 205, 159, 0.4);
}

.btn-secondary {
  background: white;
  color: var(--gray);
  border: 2px solid var(--border);
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-secondary.small {
  padding: 10px 20px;
  font-size: 14px;
}

.detail-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 60px 100px;
}

.detail-wrapper {
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 4px 32px rgba(29, 205, 159, 0.12);
  border: 1px solid var(--border);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-images {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  padding: 40px;
  height: 450px;
}

.detail-image {
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  overflow: hidden;
  transition: transform 0.3s;
}

.detail-image:hover {
  transform: scale(1.02);
}

.detail-image.main {
  grid-row: span 2;
  font-size: 150px;
}

.detail-body {
  padding: 50px;
}

.product-link-banner {
  background: linear-gradient(135deg, rgba(29, 205, 159, 0.1) 0%, rgba(22, 153, 118, 0.05) 100%);
  border: 2px dashed var(--primary);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.product-link-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 4px 16px rgba(29, 205, 159, 0.3);
  flex-shrink: 0;
}

.product-link-info {
  flex: 1;
}

.product-link-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 6px;
}

.product-link-sub {
  font-size: 14px;
  color: var(--light-gray);
}

.detail-price-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.detail-price {
  font-size: 56px;
  font-weight: 800;
  color: var(--secondary);
}

.detail-discount {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
}

.detail-badge {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(29, 205, 159, 0.3);
}

.detail-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 40px;
  line-height: 1.4;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  background: var(--bg-secondary);
  padding: 32px;
  border-radius: 24px;
  margin-bottom: 40px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 15px;
  color: var(--light-gray);
  font-weight: 600;
}

.info-value {
  font-size: 16px;
  color: var(--secondary);
  font-weight: 700;
}

.detail-description {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 18px;
}

.description-text {
  font-size: 16px;
  color: var(--gray);
  line-height: 1.8;
}

.seller-card {
  background: var(--bg-secondary);
  padding: 32px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.seller-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.seller-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(29, 205, 159, 0.3);
}

.seller-info-detailed {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seller-name-large {
  font-size: 19px;
  font-weight: 700;
  color: var(--secondary);
}

.seller-stats {
  font-size: 14px;
  color: var(--light-gray);
}

.detail-actions {
  display: flex;
  gap: 20px;
  margin-top: 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.btn-back {
  flex: 1;
  padding: 20px;
  background: white;
  color: var(--gray);
  border: 2px solid var(--border);
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-chat {
  flex: 2;
  padding: 20px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(29, 205, 159, 0.3);
}

.btn-chat:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(29, 205, 159, 0.4);
}

.loading-container,
.error-container {
  text-align: center;
  padding: 100px 20px;
  max-width: 600px;
  margin: 0 auto;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 30px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p,
.error-container p {
  font-size: 16px;
  color: var(--light-gray);
  margin-top: 20px;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 30px;
}

.error-container h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 20px;
}

.error-container .btn-primary {
  margin-top: 40px;
}

@media (max-width: 768px) {
  .detail-images {
    grid-template-columns: 1fr;
    height: auto;
  }

  .detail-image.main {
    grid-row: span 1;
    height: 300px;
  }

  .detail-info-grid {
    grid-template-columns: 1fr;
  }

  .seller-card {
    flex-direction: column;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>