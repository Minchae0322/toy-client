// ============================================================
// 1. TradeListPage.vue (메인 페이지)
// ============================================================

<template>
  <div class="app-container">
    <div class="main-wrapper">
      <!-- 사이드바 필터 -->
      <TradeFilter
          :categories="categories"
          :selectedCategory="searchCondition.categoryId"
          :selectedStatus="searchCondition.oneMouthStatus"
          :selectedPrice="priceRange"
          :location="searchCondition.tradeLocation"
          @update:category="handleCategoryUpdate"
          @update:status="handleStatusUpdate"
          @update:price="handlePriceUpdate"
          @update:location="handleLocationUpdate"
      />

      <!-- 메인 컨텐츠 -->
      <main class="main-content">
        <!-- 검색 및 정렬 툴바 -->
        <TradeToolbar
            :searchKeyword="searchKeyword"
            :currentSort="currentSort"
            @update:search="searchKeyword = $event"
            @search:submit="resetAndFetch"
            @update:sort="handleSortUpdate"
        />

        <!-- 로딩 상태 -->
        <div v-if="initialLoading" class="loading-state">
          <div class="spinner"></div>
          <p>상품을 불러오는 중...</p>
        </div>

        <!-- 거래 그리드 -->
        <div v-else-if="trades.length > 0" class="content-area">
          <div class="trade-grid">
            <TradeCard
                v-for="trade in trades"
                :key="trade.oneMouthId"
                :trade="trade"
                @click="viewDetail"
            />
          </div>

          <!-- 인피니티 스크롤 로딩 -->
          <div v-if="loading" class="loading-more">
            <div class="spinner small"></div>
          </div>

          <!-- 더 이상 데이터 없음 -->
          <div v-if="!hasMore && trades.length > 0" class="end-message">
            모든 상품을 확인했습니다
          </div>
        </div>

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
    </div>

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
import TradeFilter from '@/components/oneMouth/TradeFilter.vue';
import TradeToolbar from '@/components/oneMouth/TradeToolbar.vue';
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
  tradeLocation: '',
  minPrice: null,
  maxPrice: null
});

const searchKeyword = ref('');
const priceRange = ref('');
const currentSort = ref('latest');

const sortOptions = [
  { value: 'latest', label: '최신순', sort: 'createdAt,DESC' },
  { value: 'price_asc', label: '낮은 가격순', sort: 'sellingPrice,ASC' },
  { value: 'popular', label: '인기순', sort: 'viewCount,DESC' }
];

// API Methods
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

const handleStatusUpdate = (status) => {
  searchCondition.value.oneMouthStatus = status;
  resetAndFetch();
};

const handlePriceUpdate = (price) => {
  priceRange.value = price;
  if (price) {
    const [min, max] = price.split('-').map(Number);
    searchCondition.value.minPrice = min;
    searchCondition.value.maxPrice = max;
  } else {
    searchCondition.value.minPrice = null;
    searchCondition.value.maxPrice = null;
  }
  resetAndFetch();
};

let locationTimeout = null;
const handleLocationUpdate = (location) => {
  searchCondition.value.tradeLocation = location;
  if (locationTimeout) {
    clearTimeout(locationTimeout);
  }
  locationTimeout = setTimeout(() => {
    resetAndFetch();
  }, 500);
};

const handleSortUpdate = (sortValue) => {
  currentSort.value = sortValue;
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

:root {
  --primary-color: #4F46E5;
  --primary-hover: #4338CA;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --border-color: #E5E7EB;
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
}

.main-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  align-items: start;
}

.main-content {
  min-height: 80vh;
}

.content-area {
  min-height: 600px;
}

.trade-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  gap: 16px;
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
  padding: 48px 20px;
}

.end-message {
  text-align: center;
  padding: 48px 20px;
  font-size: 14px;
  color: var(--text-tertiary);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  padding: 40px 20px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-content h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.empty-content p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.btn-primary {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.floating-button {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s;
  z-index: 1000;
}

.floating-button:hover {
  background: var(--primary-hover);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
}

@media (max-width: 1024px) {
  .main-wrapper {
    grid-template-columns: 1fr;
    padding: 24px 20px;
    gap: 24px;
  }

  .trade-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .main-wrapper {
    padding: 20px 16px;
  }

  .trade-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .floating-button {
    bottom: 24px;
    right: 24px;
    width: 52px;
    height: 52px;
  }
}

@media (max-width: 480px) {
  .trade-grid {
    grid-template-columns: 1fr;
  }
}
</style>