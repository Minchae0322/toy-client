<!-- TradeDetailPage.vue -->
<template>
  <div class="detail-page">
    <!-- 메인 컨텐츠 -->
    <div v-if="trade" class="detail-container">
      <div class="content-wrapper">
        <!-- 이미지 갤러리 -->
        <TradeImageGallery :images="trade.images" :thumbnail="trade.thumbnailUrl" />

        <!-- 상세 정보 -->
        <div class="detail-info">
          <!-- 상태 뱃지 -->
          <div class="status-badge" :class="getStatusClass(trade.status)">
            {{ getStatusText(trade.status) }}
          </div>

          <!-- 제목 -->
          <h1 class="trade-title">{{ trade.title }}</h1>

          <!-- 가격 정보 -->
          <div class="price-section">
            <span class="current-price">{{ formatPrice(trade.price) }}</span>
            <span v-if="trade.originalPrice" class="original-price">
              {{ formatPrice(trade.originalPrice) }}
            </span>
          </div>

          <!-- 상세 정보 테이블 -->
          <div class="info-table">
            <div class="info-row">
              <span class="info-label">상태</span>
              <span class="info-value">{{ trade.condition }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">수량</span>
              <span class="info-value">{{ trade.quantity }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">거래방법</span>
              <span class="info-value">{{ trade.tradeMethod }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">거래지역</span>
              <span class="info-value">{{ trade.location }}</span>
            </div>
          </div>

          <!-- 판매자 정보 -->
          <TradeSellerInfo :seller="trade.seller" />

          <!-- 액션 버튼 -->
          <div class="action-buttons">
            <button class="btn-favorite" :class="{ active: isFavorite }" @click="toggleFavorite">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 17.5L8.75 16.375C4.5 12.5 1.66667 10 1.66667 6.875C1.66667 4.375 3.54167 2.5 6.04167 2.5C7.45833 2.5 8.83333 3.125 10 4.16667C11.1667 3.125 12.5417 2.5 13.9583 2.5C16.4583 2.5 18.3333 4.375 18.3333 6.875C18.3333 10 15.5 12.5 11.25 16.375L10 17.5Z" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span>관심</span>
            </button>
            <button class="btn-primary" @click="handleChat">채팅하기</button>
          </div>
        </div>
      </div>

      <!-- 상세 설명 섹션 -->
      <div class="description-section">
        <h2 class="section-title">상세 설명</h2>
        <p class="description-text">{{ trade.description }}</p>
      </div>

      <!-- 연관 상품 (선택사항) -->
      <div v-if="trade.relatedProduct" class="related-product">
        <div class="related-header">
          <h3>연관 공식 제품</h3>
          <p>이 제품의 정식 판매 정보를 확인하세요</p>
        </div>
        <div class="related-content">
          <div class="related-info">
            <h4>{{ trade.relatedProduct.name }}</h4>
            <div class="related-meta">
              <span class="rating">★ {{ trade.relatedProduct.rating }}</span>
              <span class="review-count">리뷰 {{ trade.relatedProduct.reviews }}개</span>
            </div>
          </div>
          <button class="btn-secondary">제품 보기</button>
        </div>
      </div>

      <!-- 네비게이션 -->
      <div class="bottom-nav">
        <button class="btn-back" @click="goToList">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          목록으로
        </button>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>상품 정보를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else class="error-state">
      <div class="error-content">
        <h2>상품을 찾을 수 없습니다</h2>
        <p>요청하신 상품이 존재하지 않거나 삭제되었습니다</p>
        <button class="btn-primary" @click="goToList">목록으로 돌아가기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TradeImageGallery from '@/components/oneMouth/detail/TradeImageGallery.vue';
import TradeSellerInfo from '@/components/oneMouth/detail/TradeSellerInfo.vue';

const router = useRouter();
const route = useRoute();

const trade = ref(null);
const loading = ref(true);
const isFavorite = ref(false);

// 더미 데이터
const tradeData = {
  1: {
    id: 1,
    title: '스타벅스 아메리카노 Tall 쿠폰 1매',
    price: 7500,
    originalPrice: 10000,
    status: 'ON_SALE',
    condition: '새상품 (미개봉)',
    quantity: '1개',
    tradeMethod: '직거래, 택배',
    location: '강남역 2번 출구',
    description: '선물 받았는데 커피를 안 마셔서 판매합니다. 유효기간은 3개월 이상 남았어요. 직거래는 강남역 2번 출구에서 가능하고, 택배도 가능합니다. 포장은 완전히 뜯지 않은 새 상품입니다. 궁금하신 점 있으면 편하게 채팅 주세요.',
    thumbnailUrl: null,
    images: [],
    seller: {
      id: 1,
      name: '카페인중독자',
      rating: 4.8,
      tradeCount: 32,
      responseRate: 95
    },
    relatedProduct: {
      name: '스타벅스 아메리카노 Tall',
      rating: 4.7,
      reviews: 234
    }
  }
};

// Methods
const formatPrice = (price) => {
  if (!price) return '0원';
  return price.toLocaleString() + '원';
};

const getStatusText = (status) => {
  const statusMap = {
    'ON_SALE': '판매중',
    'RESERVED': '예약중',
    'SOLD_OUT': '거래완료'
  };
  return statusMap[status] || '';
};

const getStatusClass = (status) => {
  return status?.toLowerCase().replace('_', '-') || '';
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
};

const handleChat = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }
  // 채팅 페이지로 이동
  console.log('채팅 시작');
};

const goToList = () => {
  router.push({ name: 'TradeList' });
};

const fetchTradeDetail = async (id) => {
  loading.value = true;

  try {
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 500));

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
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary-color: #4F46E5;
  --primary-hover: #4338CA;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --border-color: #E5E7EB;
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --error-color: #EF4444;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.detail-page {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 32px 24px 80px;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  background: var(--bg-primary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 0;
  margin-bottom: 24px;
}

.detail-info {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
}

.status-badge.on-sale {
  background: #ECFDF5;
  color: var(--success-color);
}

.status-badge.reserved {
  background: #FEF3C7;
  color: var(--warning-color);
}

.status-badge.sold-out {
  background: #F3F4F6;
  color: var(--text-secondary);
}

.trade-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.current-price {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.original-price {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-tertiary);
  text-decoration: line-through;
}

.info-table {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.action-buttons {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  margin-top: auto;
}

.btn-favorite {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-favorite:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-favorite.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: #EEF2FF;
}

.btn-primary {
  padding: 16px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-secondary {
  padding: 10px 20px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.description-section {
  background: var(--bg-primary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 40px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}

.description-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
}

.related-product {
  background: var(--bg-primary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 32px;
  margin-bottom: 24px;
}

.related-header {
  margin-bottom: 20px;
}

.related-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.related-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.related-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.related-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.related-meta {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.rating {
  color: var(--warning-color);
  font-weight: 600;
}

.review-count {
  color: var(--text-tertiary);
}

.bottom-nav {
  display: flex;
  justify-content: flex-start;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-back:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.loading-state {
  flex-direction: column;
  gap: 20px;
}

.loading-state p {
  font-size: 14px;
  color: var(--text-secondary);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.error-content p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-page {
    padding: 20px 16px 60px;
  }

  .detail-info {
    padding: 24px;
    gap: 24px;
  }

  .trade-title {
    font-size: 22px;
  }

  .current-price {
    font-size: 26px;
  }

  .description-section,
  .related-product {
    padding: 24px;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .btn-favorite {
    flex-direction: row;
    justify-content: center;
  }
}
</style>