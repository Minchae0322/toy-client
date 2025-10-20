<template>
  <div class="app-container">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-container">
        <h1 class="logo">한입만</h1>

        <nav class="nav">
          <button class="nav-btn">카테고리</button>
          <button class="nav-btn">판매하기</button>
          <button class="nav-btn">내 주문</button>
          <button class="cart">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
            <span class="badge">3</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- 메인 -->
    <main class="container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <h2 class="page-title">한입만 마켓</h2>
        <p class="page-desc">원하는 방식으로 구매하세요</p>
      </div>

      <!-- 필터 -->
      <div class="filter-section">
        <!-- 판매 방식 탭 -->
        <div class="filter-tabs">
          <button
              class="filter-tab"
              :class="{ active: searchCondition.saleType === '' }"
              @click="handleSaleTypeUpdate('')"
          >
            <span>전체</span>
          </button>
          <button
              class="filter-tab"
              :class="{ active: searchCondition.saleType === 'ONEMOUTH' }"
              @click="handleSaleTypeUpdate('ONEMOUTH')"
          >
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"/>
            </svg>
            <span>한입만</span>
          </button>
          <button
              class="filter-tab"
              :class="{ active: searchCondition.saleType === 'NORMAL' }"
              @click="handleSaleTypeUpdate('NORMAL')"
          >
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
            <span>일반 판매</span>
          </button>
          <button
              class="filter-tab"
              :class="{ active: searchCondition.saleType === 'GROUP_BUY' }"
              @click="handleSaleTypeUpdate('GROUP_BUY')"
          >
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
            </svg>
            <span>공동구매</span>
          </button>
          <button
              class="filter-tab"
              :class="{ active: searchCondition.saleType === 'PROXY' }"
              @click="handleSaleTypeUpdate('PROXY')"
          >
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            <span>대리 구매</span>
          </button>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <span class="filter-label">카테고리</span>
            <button
                class="filter-btn"
                :class="{ active: searchCondition.categoryId === '' }"
                @click="handleCategoryUpdate('')"
            >
              전체
            </button>
            <button
                v-for="category in categories"
                :key="category.categoryId"
                class="filter-btn"
                :class="{ active: searchCondition.categoryId === category.categoryId }"
                @click="handleCategoryUpdate(category.categoryId)"
            >
              {{ category.name }}
            </button>
          </div>

          <div class="search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="9" r="7"/>
              <path d="M14 14l5 5"/>
            </svg>
            <input
                type="text"
                class="search-input"
                placeholder="상품 검색..."
                v-model="searchKeyword"
                @keyup.enter="resetAndFetch"
            >
          </div>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="initialLoading" class="loading-state">
        <div class="spinner"></div>
        <p>상품을 불러오는 중...</p>
      </div>

      <!-- 결과 헤더 & 그리드 -->
      <template v-else-if="trades.length > 0">
        <div class="results-header">
          <span class="results-count">총 <strong>{{ totalElements }}</strong>개의 상품</span>
          <select class="sort-select" v-model="currentSort" @change="handleSortUpdate">
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
            <option value="price_asc">낮은 가격순</option>
            <option value="price_desc">높은 가격순</option>
          </select>
        </div>

        <!-- 상품 그리드 -->
        <div class="product-grid">
          <TradeCard
              v-for="trade in trades"
              :key="trade.oneMouthId"
              :trade="trade"
              @click="viewDetail(trade.oneMouthId)"
          />
        </div>

        <!-- 인피니티 스크롤 로딩 -->
        <div v-if="loading" class="loading-more">
          <div class="spinner small"></div>
        </div>

        <!-- 더 이상 데이터 없음 -->
        <div v-if="!hasMore" class="end-message">
          모든 상품을 확인했습니다
        </div>
      </template>

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">📦</div>
          <h2>등록된 상품이 없습니다</h2>
          <p>첫 번째 상품을 등록해보세요</p>
          <button class="btn-primary" @click="handleSellClick">상품 등록하기</button>
        </div>
      </div>
    </main>

    <!-- 플로팅 버튼 -->
    <button class="floating-button" @click="handleSellClick" aria-label="상품 등록">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { oneMouthService } from '@/services/OneMouthService.js';
import TradeCard from '@/components/oneMouth/TradeCard.vue';

const router = useRouter();

// State
const trades = ref([]);
const categories = ref([]);
const loading = ref(false);
const initialLoading = ref(true);
const hasMore = ref(true);

// 페이지네이션
const currentPage = ref(0);
const pageSize = ref(12);
const totalElements = ref(0);

// 필터/정렬
const searchCondition = ref({
  oneMouthStatus: '',
  categoryId: '',
  saleType: '',
  tradeLocation: '',
  minPrice: null,
  maxPrice: null
});

const searchKeyword = ref('');
const currentSort = ref('latest');

const sortOptions = {
  'latest': 'createdAt,DESC',
  'price_asc': 'sellingPrice,ASC',
  'price_desc': 'sellingPrice,DESC',
  'popular': 'viewCount,DESC'
};

// API Methods
const fetchTrades = async (page = 0, append = false) => {
  if (loading.value || (!hasMore.value && append)) return;

  loading.value = true;

  try {
    const params = {
      page: page,
      size: pageSize.value,
      sort: sortOptions[currentSort.value] || 'createdAt,DESC',
      ...searchCondition.value
    };

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }

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

// Event Handlers
const handleCategoryUpdate = (categoryId) => {
  searchCondition.value.categoryId = categoryId;
  resetAndFetch();
};

const handleSaleTypeUpdate = (saleType) => {
  searchCondition.value.saleType = saleType;
  resetAndFetch();
};

const handleSortUpdate = () => {
  resetAndFetch();
};

const resetAndFetch = () => {
  currentPage.value = 0;
  trades.value = [];
  hasMore.value = true;
  fetchTrades(0, false);
};

const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  const nextPage = currentPage.value + 1;
  await fetchTrades(nextPage, true);
};

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 500) {
    loadMore();
  }
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
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background: #FAFAFA;
  color: #1A1A1A;
  min-height: 100vh;
}

/* 헤더 */
.header {
  background: white;
  border-bottom: 1px solid #E5E5E5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1A1A1A;
  cursor: pointer;
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #525252;
  cursor: pointer;
  transition: color 0.2s;
  font-family: inherit;
}

.nav-btn:hover {
  color: #1A1A1A;
}

.cart {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.cart svg {
  color: #525252;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #1A1A1A;
  color: white;
  font-size: 0.625rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* 메인 컨테이너 */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

/* 페이지 헤더 */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-desc {
  color: #737373;
  font-size: 0.9375rem;
}

/* 필터 섹션 */
.filter-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #E5E5E5;
  overflow-x: auto;
}

.filter-tab {
  padding: 0.625rem 1.25rem;
  background: white;
  border: 1px solid #D4D4D4;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #525252;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: inherit;
}

.filter-tab:hover {
  border-color: #A3A3A3;
}

.filter-tab.active {
  background: #1A1A1A;
  color: white;
  border-color: #1A1A1A;
}

.filter-tab .icon {
  width: 16px;
  height: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1A1A1A;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #D4D4D4;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #525252;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.filter-btn:hover {
  border-color: #A3A3A3;
}

.filter-btn.active {
  background: #F3F4F6;
  border-color: #1A1A1A;
  color: #1A1A1A;
}

.search-box {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #D4D4D4;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: #1A1A1A;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #737373;
  pointer-events: none;
}

/* 결과 헤더 */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-count {
  font-size: 0.875rem;
  color: #737373;
}

.sort-select {
  padding: 0.5rem 2rem 0.5rem 1rem;
  border: 1px solid #D4D4D4;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5L6 8L9 5' stroke='%23525252' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  font-family: inherit;
}

/* 그리드 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  gap: 1rem;
}

.loading-state p {
  font-size: 0.875rem;
  color: #737373;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #E5E5E5;
  border-top-color: #1A1A1A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.small {
  width: 32px;
  height: 32px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 3rem 1.25rem;
}

.end-message {
  text-align: center;
  padding: 3rem 1.25rem;
  font-size: 0.875rem;
  color: #A3A3A3;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  padding: 2.5rem 1.25rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 0.5rem;
}

.empty-content p {
  font-size: 0.9375rem;
  color: #737373;
  margin-bottom: 2rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary:hover {
  background: #404040;
  transform: translateY(-1px);
}

.floating-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  z-index: 1000;
}

.floating-button:hover {
  background: #404040;
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2);
}

/* 반응형 */
@media (max-width: 768px) {
  .container {
    padding: 2rem 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .nav-btn:not(:last-of-type) {
    display: none;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .floating-button {
    bottom: 1.5rem;
    right: 1.5rem;
  }
}
</style>