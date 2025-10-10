<!-- TradeListPage.vue -->
<template>
  <div class="app-container">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="goToHome">
          <div class="logo-icon">🛒</div>
          <span>편의점 거래</span>
        </div>
        <nav class="nav-menu">
          <div class="nav-item active">개인거래</div>
          <div class="nav-item">공식제품</div>
          <div class="nav-item">커뮤니티</div>
        </nav>
        <div class="header-actions">
          <button class="btn-secondary">로그인</button>
          <button class="btn-primary" @click="handleSellClick">판매하기</button>
        </div>
      </div>
    </header>

    <!-- 히어로 섹션 - 심플하게 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">편의점 제품 개인거래</h1>
        <p class="hero-subtitle">필요한 사람에게, 합리적인 가격으로</p>
      </div>
    </section>

    <!-- 필터 섹션 -->
    <div class="container">
      <div class="filter-section">
        <div class="filter-controls">
          <div class="filter-group">
            <select class="filter-select" v-model="searchCondition.oneMouthStatus">
              <option value="">전체 상태</option>
              <option value="ON_SALE">판매중</option>
              <option value="RESERVED">예약중</option>
              <option value="SOLD_OUT">판매완료</option>
            </select>
          </div>
          <div class="filter-group">
            <select class="filter-select" v-model="searchCondition.categoryId">
              <option value="">전체 카테고리</option>
              <option v-for="category in categories" :key="category.categoryId" :value="category.categoryId">
                {{ category.categoryName }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <select class="filter-select" v-model="priceRange">
              <option value="">가격대</option>
              <option value="0-10000">1만원 이하</option>
              <option value="10000-20000">1~2만원</option>
              <option value="20000-999999">2만원 이상</option>
            </select>
          </div>
          <div class="filter-group">
            <input
                type="text"
                class="filter-input"
                v-model="searchCondition.tradeLocation"
                placeholder="지역 검색"
            />
          </div>
        </div>
        <div class="sort-tabs">
          <button
              v-for="sort in sortOptions"
              :key="sort.value"
              class="sort-tab"
              :class="{ active: currentSort === sort.value }"
              @click="changeSort(sort.value)"
          >
            {{ sort.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="initialLoading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <!-- 거래 그리드 -->
    <div v-else-if="trades.length > 0" class="trade-grid-wrapper">
      <div class="trade-grid" ref="tradeGrid">
        <div
            v-for="trade in trades"
            :key="trade.oneMouthId"
            class="trade-card"
            @click="viewDetail(trade.oneMouthId)"
        >
          <div class="trade-image-wrapper">
            <div class="trade-image" v-if="!trade.thumbnailUrl">
              {{ getCategoryEmoji(trade.categoryName) }}
            </div>
            <img
                v-else
                :src="trade.thumbnailUrl"
                :alt="trade.title"
                class="trade-image-real"
            />
            <div class="trade-badge" v-if="trade.oneMouthStatus !== 'ON_SALE'">
              {{ getStatusText(trade.oneMouthStatus) }}
            </div>
          </div>
          <div class="trade-content">
            <h3 class="trade-title">{{ trade.title }}</h3>
            <div class="trade-price">{{ formatPrice(trade.sellingPrice) }}</div>
            <div class="trade-meta">
              <span class="meta-item">📍 {{ trade.tradeLocation || '지역미정' }}</span>
              <span class="meta-item">👁 {{ trade.viewCount }}</span>
              <span class="meta-item">❤️ {{ trade.favoriteCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 인피니티 스크롤 로딩 -->
      <div v-if="loading" class="infinite-loading">
        <div class="loading-spinner small"></div>
      </div>

      <!-- 더 이상 데이터 없음 -->
      <div v-if="!hasMore && trades.length > 0" class="no-more-data">
        모든 상품을 확인했습니다
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-container">
      <div class="empty-icon">📦</div>
      <h2>등록된 상품이 없습니다</h2>
      <p>첫 번째 상품을 등록해보세요</p>
      <button class="btn-primary" @click="handleSellClick">상품 등록하기</button>
    </div>

    <!-- 플로팅 버튼 -->
    <div class="fab" @click="handleSellClick">+</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { oneMouthService } from '@/services/OneMouthService.js';

const router = useRouter();

// State
const trades = ref([]);
const categories = ref([]);
const loading = ref(false);
const initialLoading = ref(true);
const hasMore = ref(true);
const tradeGrid = ref(null);

// 페이지네이션
const currentPage = ref(0);
const pageSize = ref(12);
const totalElements = ref(0);

// 필터/정렬
const searchCondition = ref({
  oneMouthStatus: '',
  categoryId: '',
  tradeLocation: '',
  minPrice: null,
  maxPrice: null
});

const priceRange = ref('');
const currentSort = ref('latest');

const sortOptions = [
  { value: 'latest', label: '최신순', sort: 'createdAt,DESC' },
  { value: 'price_asc', label: '낮은가격순', sort: 'sellingPrice,ASC' },
  { value: 'popular', label: '인기순', sort: 'viewCount,DESC' }
];

// Methods
const fetchTrades = async (page = 0, append = false) => {
  if (loading.value || (!hasMore.value && append)) return;

  loading.value = true;

  try {
    const sortOption = sortOptions.find(s => s.value === currentSort.value);

    const params = {
      page: page,
      size: pageSize.value,
      sort: sortOption?.sort || 'createdAt,DESC',
      ...searchCondition.value
    };

    // 빈 값 제거
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    const response = await oneMouthService.getOneMouths(params);
    const pageData = response.data?.data || response.data;

    if (append) {
      trades.value = [...trades.value, ...(pageData.content || [])];
    } else {
      trades.value = pageData.content || [];
    }

    currentPage.value = pageData.number || 0;
    totalElements.value = pageData.totalElements || 0;
    hasMore.value = !pageData.last;

  } catch (error) {
    console.error('거래 목록 조회 실패:', error);

    if (!append) {
      trades.value = [];
      totalElements.value = 0;
      hasMore.value = false;
    }
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await oneMouthService.getCategories();
    categories.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    categories.value = [];
  }
};

const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  const nextPage = currentPage.value + 1;
  await fetchTrades(nextPage, true);
};

// 인피니티 스크롤 핸들러
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // 하단에서 500px 전에 다음 페이지 로드
  if (scrollTop + windowHeight >= documentHeight - 500) {
    loadMore();
  }
};

const changeSort = (sortValue) => {
  if (currentSort.value === sortValue) return;
  currentSort.value = sortValue;
  resetAndFetch();
};

const resetAndFetch = () => {
  currentPage.value = 0;
  trades.value = [];
  hasMore.value = true;
  fetchTrades(0, false);
};

const viewDetail = (tradeId) => {
  router.push({
    name: 'OneMouthDetail',
    params: { id: tradeId }
  });
};

const handleSellClick = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }
  router.push('/one-mouth/create');
};

const goToHome = () => {
  router.push('/');
};

// Utility Methods
const formatPrice = (price) => {
  if (!price) return '0원';
  return price.toLocaleString() + '원';
};

const getStatusText = (status) => {
  const statusMap = {
    'ON_SALE': '판매중',
    'RESERVED': '예약중',
    'SOLD_OUT': '판매완료'
  };
  return statusMap[status] || '';
};

const getCategoryEmoji = (categoryName) => {
  const emojiMap = {
    '편의점': '🏪',
    '카페': '☕',
    '베이커리': '🍞',
    '프랜차이즈': '🍕',
    '분식': '🍜',
    '간식': '🍫',
    '음료': '🧋',
    '디저트': '🍰'
  };
  return emojiMap[categoryName] || '🍽️';
};

// Watchers
watch(priceRange, (newValue) => {
  if (newValue) {
    const [min, max] = newValue.split('-').map(Number);
    searchCondition.value.minPrice = min;
    searchCondition.value.maxPrice = max;
  } else {
    searchCondition.value.minPrice = null;
    searchCondition.value.maxPrice = null;
  }
  resetAndFetch();
});

watch(() => searchCondition.value.oneMouthStatus, () => {
  resetAndFetch();
});

watch(() => searchCondition.value.categoryId, () => {
  resetAndFetch();
});

let locationTimeout = null;
watch(() => searchCondition.value.tradeLocation, () => {
  if (locationTimeout) {
    clearTimeout(locationTimeout);
  }
  locationTimeout = setTimeout(() => {
    resetAndFetch();
  }, 500);
});

// Lifecycle
onMounted(async () => {
  await fetchCategories();
  await fetchTrades();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #1DCD9F;
  --primary-dark: #169976;
  --secondary: #000000;
  --gray: #333;
  --light-gray: #999;
  --bg: #ffffff;
  --border: #e5e7eb;
}

.app-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #fafafa;
  color: var(--secondary);
  line-height: 1.6;
  min-width: 1200px;
}

/* 헤더 - 심플하게 */
.header {
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--secondary);
  cursor: pointer;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.nav-menu {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-item {
  color: var(--gray);
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-item:hover {
  color: var(--primary);
}

.nav-item.active {
  color: var(--primary);
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: var(--gray);
  border: 1px solid var(--border);
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px;
}

/* 히어로 - 미니멀하게 */
.hero {
  padding: 60px 60px 40px;
  text-align: center;
  background: white;
  border-bottom: 1px solid var(--border);
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 12px;
}

.hero-subtitle {
  font-size: 16px;
  color: var(--light-gray);
  font-weight: 400;
}

/* 필터 - 깔끔하게 */
.filter-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 32px auto;
  border: 1px solid var(--border);
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-select,
.filter-input {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 400;
}

.filter-select:hover,
.filter-select:focus,
.filter-input:hover,
.filter-input:focus {
  border-color: var(--primary);
  outline: none;
}

.sort-tabs {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  justify-content: center;
}

.sort-tab {
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gray);
}

.sort-tab:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.sort-tab.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* 거래 그리드 - 정보 위계 명확화 */
.trade-grid-wrapper {
  min-height: 60vh;
}

.trade-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 0 60px 80px;
  max-width: 1520px;
  margin: 0 auto;
}

.trade-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.trade-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.trade-image-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  background: #fafafa;
  overflow: hidden;
}

.trade-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  opacity: 0.3;
}

.trade-image-real {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trade-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: white;
  letter-spacing: -0.2px;
}

.trade-content {
  padding: 16px;
}

.trade-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  letter-spacing: -0.3px;
}

.trade-price {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.trade-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.meta-item {
  font-size: 11px;
  color: #aaa;
  font-weight: 400;
  letter-spacing: -0.2px;
}

.meta-item:not(:last-child)::after {
  content: '·';
  margin-left: 8px;
  color: #ddd;
}

/* 로딩 */
.loading-container {
  text-align: center;
  padding: 100px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

.loading-spinner.small {
  width: 30px;
  height: 30px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.infinite-loading {
  text-align: center;
  padding: 40px 20px;
}

.no-more-data {
  text-align: center;
  padding: 40px 20px;
  color: var(--light-gray);
  font-size: 14px;
}

/* 빈 상태 */
.empty-container {
  text-align: center;
  padding: 100px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-container h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 12px;
}

.empty-container p {
  font-size: 14px;
  color: var(--light-gray);
  margin-bottom: 32px;
}

/* 플로팅 버튼 */
.fab {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 56px;
  height: 56px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(29, 205, 159, 0.3);
  transition: all 0.3s;
  z-index: 100;
}

.fab:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px rgba(29, 205, 159, 0.4);
}

/* 반응형 */
@media (max-width: 1400px) {
  .trade-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .app-container {
    min-width: auto;
  }

  .trade-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 40px 60px;
  }

  .filter-controls {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .hero-title {
    font-size: 28px;
  }

  .trade-grid {
    grid-template-columns: 1fr;
    padding: 0 20px 60px;
  }

  .filter-controls {
    grid-template-columns: 1fr;
  }
}
</style>