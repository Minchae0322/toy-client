<template>
  <div class="trade-list">
    <!-- 리스트 헤더 -->
    <div class="list-header">
      <div class="list-info">
        <h3 class="list-title">{{ title }}</h3>
        <span class="list-count">총 {{ filteredTrades.length }}건</span>
      </div>

      <div class="list-actions">
        <button
            class="view-toggle-btn"
            @click="toggleViewMode"
            :title="viewMode === 'grid' ? '리스트 보기' : '그리드 보기'"
        >
          {{ viewMode === 'grid' ? '☰' : '⊞' }}
        </button>
      </div>
    </div>

    <!-- 거래 리스트 -->
    <div
        class="trade-items-container"
        :class="[`view-${viewMode}`, { 'loading': loading }]"
    >
      <TransitionGroup
          name="trade-item"
          tag="div"
          class="trade-items"
      >
        <div
            v-for="trade in displayedTrades"
            :key="trade.id"
            class="trade-item-wrapper"
            @click="handleTradeClick(trade)"
        >
          <TradeItemCard
              :trade="trade"
              :view-mode="viewMode"
              :current-user-id="currentUserId"
              @chat="handleChatClick"
              @favorite="handleFavoriteClick"
              @report="handleReportClick"
          />
        </div>
      </TransitionGroup>

      <!-- 로딩 스켈레톤 -->
      <div v-if="loading" class="skeleton-items">
        <div
            v-for="n in skeletonCount"
            :key="`skeleton-${n}`"
            class="skeleton-item"
        >
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-price"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-meta"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 더보기 버튼 -->
    <div v-if="hasMore && !loading" class="load-more-section">
      <button
          class="load-more-btn"
          @click="loadMore"
          :disabled="loadingMore"
      >
        <span v-if="loadingMore" class="loading-spinner"></span>
        {{ loadingMore ? '로딩 중...' : `더 많은 거래 보기 (${remainingCount}개 더)` }}
      </button>
    </div>

    <!-- 무한 스크롤 감지 요소 -->
    <div
        ref="infiniteScrollTrigger"
        class="infinite-scroll-trigger"
        v-if="infiniteScroll && hasMore"
    ></div>

    <!-- 빈 상태 -->
    <div v-if="!loading && filteredTrades.length === 0" class="empty-state">
      <EmptyTradeState
          :filters="appliedFilters"
          @clear-filters="$emit('clear-filters')"
          @start-selling="$emit('start-selling')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import TradeItemCard from './TradeItemCard.vue';
import EmptyTradeState from './EmptyTradeState.vue';

// Props 정의
const props = defineProps({
  trades: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '개인거래'
  },
  loading: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  currentUserId: {
    type: [String, Number],
    default: null
  },
  pageSize: {
    type: Number,
    default: 10
  },
  infiniteScroll: {
    type: Boolean,
    default: false
  },
  maxDisplayCount: {
    type: Number,
    default: 50 // 최대 표시 개수 (성능 최적화)
  }
});

// Emit 정의
const emit = defineEmits([
  'trade-click',
  'chat-click',
  'favorite-click',
  'report-click',
  'load-more',
  'clear-filters',
  'start-selling'
]);

// 반응형 데이터
const viewMode = ref('list'); // 'list' | 'grid'
const currentPage = ref(1);
const loadingMore = ref(false);
const infiniteScrollTrigger = ref(null);
const appliedFilters = ref({});
const observer = ref(null);

// 필터링된 거래 목록
const filteredTrades = computed(() => {
  let trades = [...props.trades];

  // 필터 적용
  if (props.filters.condition && props.filters.condition !== 'all') {
    trades = trades.filter(trade => trade.condition === props.filters.condition);
  }

  if (props.filters.tradeMethod && props.filters.tradeMethod !== 'all') {
    trades = trades.filter(trade => trade.tradeMethod === props.filters.tradeMethod);
  }

  if (props.filters.priceRange) {
    trades = trades.filter(trade =>
        trade.price >= props.filters.priceRange.min &&
        trade.price <= props.filters.priceRange.max
    );
  }

  if (props.filters.maxDistance) {
    trades = trades.filter(trade => trade.distance <= props.filters.maxDistance);
  }

  if (props.filters.minRating) {
    trades = trades.filter(trade => trade.sellerRating >= props.filters.minRating);
  }

  if (props.filters.dateRange && props.filters.dateRange !== 'all') {
    const now = new Date();
    trades = trades.filter(trade => {
      const tradeDate = new Date(trade.createdAt);
      const diffTime = now - tradeDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      switch (props.filters.dateRange) {
        case 'today': return diffDays < 1;
        case '3days': return diffDays < 3;
        case 'week': return diffDays < 7;
        case 'month': return diffDays < 30;
        default: return true;
      }
    });
  }

  if (props.filters.quantityRange && props.filters.quantityRange !== 'all') {
    trades = trades.filter(trade => {
      const qty = trade.quantity;
      switch (props.filters.quantityRange) {
        case '1': return qty === 1;
        case '2-5': return qty >= 2 && qty <= 5;
        case '6-10': return qty >= 6 && qty <= 10;
        case '10+': return qty >= 10;
        default: return true;
      }
    });
  }

  // 정렬 적용
  const sortBy = props.filters.sort || 'latest';

  switch (sortBy) {
    case 'price-low':
      trades.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      trades.sort((a, b) => b.price - a.price);
      break;
    case 'distance':
      trades.sort((a, b) => a.distance - b.distance);
      break;
    case 'rating':
      trades.sort((a, b) => b.sellerRating - a.sellerRating);
      break;
    case 'latest':
    default:
      trades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  return trades;
});

// 표시되는 거래 목록 (페이지네이션 적용)
const displayedTrades = computed(() => {
  const maxCount = Math.min(
      currentPage.value * props.pageSize,
      props.maxDisplayCount,
      filteredTrades.value.length
  );

  return filteredTrades.value.slice(0, maxCount);
});

// 더 많은 데이터가 있는지 확인
const hasMore = computed(() => {
  return displayedTrades.value.length < filteredTrades.value.length &&
      displayedTrades.value.length < props.maxDisplayCount;
});

// 남은 개수
const remainingCount = computed(() => {
  return Math.min(
      filteredTrades.value.length - displayedTrades.value.length,
      props.maxDisplayCount - displayedTrades.value.length
  );
});

// 스켈레톤 개수
const skeletonCount = computed(() => {
  return Math.min(props.pageSize, 6);
});

// 뷰 모드 토글
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list';
  localStorage.setItem('trade-list-view-mode', viewMode.value);
};

// 더보기 로드
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  currentPage.value++;

  try {
    // 실제로는 API 호출이 있을 수 있음
    await new Promise(resolve => setTimeout(resolve, 500));
    emit('load-more', currentPage.value);
  } catch (error) {
    console.error('더보기 로드 실패:', error);
    currentPage.value--; // 롤백
  } finally {
    loadingMore.value = false;
  }
};

// 무한 스크롤 설정
const setupInfiniteScroll = () => {
  if (!props.infiniteScroll || !infiniteScrollTrigger.value) return;

  observer.value = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore.value && !loadingMore.value && !props.loading) {
          loadMore();
        }
      },
      {
        rootMargin: '100px'
      }
  );

  observer.value.observe(infiniteScrollTrigger.value);
};

// 이벤트 핸들러
const handleTradeClick = (trade) => {
  emit('trade-click', trade);
};

const handleChatClick = (trade, event) => {
  event?.stopPropagation();
  emit('chat-click', trade);
};

const handleFavoriteClick = (trade, event) => {
  event?.stopPropagation();
  emit('favorite-click', trade);
};

const handleReportClick = (trade, event) => {
  event?.stopPropagation();
  emit('report-click', trade);
};

// 필터 초기화 시 페이지 리셋
const resetPagination = () => {
  currentPage.value = 1;
  loadingMore.value = false;
};

// 워치
watch(() => props.filters, () => {
  resetPagination();
  appliedFilters.value = { ...props.filters };
}, { deep: true, immediate: true });

watch(() => props.trades, () => {
  resetPagination();
}, { deep: true });

// 라이프사이클
onMounted(() => {
  // 뷰 모드 복원
  const savedViewMode = localStorage.getItem('trade-list-view-mode');
  if (savedViewMode && ['list', 'grid'].includes(savedViewMode)) {
    viewMode.value = savedViewMode;
  }

  nextTick(() => {
    setupInfiniteScroll();
  });
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});
</script>

<style scoped>
.trade-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 리스트 헤더 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.list-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.list-count {
  background: #e2e8f0;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.view-toggle-btn {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.view-toggle-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

/* 거래 아이템 컨테이너 */
.trade-items-container {
  position: relative;
  min-height: 200px;
}

.trade-items-container.loading {
  pointer-events: none;
}

/* 리스트 뷰 */
.trade-items.view-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 그리드 뷰 */
.trade-items.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.trade-item-wrapper {
  cursor: pointer;
  transition: transform 0.2s;
}

.trade-item-wrapper:hover {
  transform: translateY(-2px);
}

/* 트랜지션 */
.trade-item-enter-active {
  transition: all 0.3s ease;
}

.trade-item-leave-active {
  transition: all 0.3s ease;
}

.trade-item-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.trade-item-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 스켈레톤 로딩 */
.skeleton-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.view-grid .skeleton-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.skeleton-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.view-grid .skeleton-item {
  flex-direction: column;
  gap: 16px;
}

.skeleton-image {
  width: 80px;
  height: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  flex-shrink: 0;
}

.view-grid .skeleton-image {
  width: 100%;
  height: 160px;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
}

.skeleton-price,
.skeleton-title,
.skeleton-meta {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  height: 16px;
}

.skeleton-price {
  width: 80px;
  height: 20px;
}

.skeleton-title {
  width: 60%;
}

.skeleton-meta {
  width: 40%;
  height: 14px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 더보기 버튼 */
.load-more-section {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.load-more-btn {
  background: white;
  color: #1DCD9F;
  border: 2px solid #1DCD9F;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  justify-content: center;
}

.load-more-btn:hover:not(:disabled) {
  background: #1DCD9F;
  color: white;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 무한 스크롤 트리거 */
.infinite-scroll-trigger {
  height: 1px;
  margin: 20px 0;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .list-header {
    padding: 0;
  }

  .list-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .trade-items.view-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .skeleton-items {
    gap: 8px;
  }

  .view-grid .skeleton-items {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .skeleton-item {
    padding: 12px;
  }

  .skeleton-image {
    width: 60px;
    height: 60px;
  }

  .view-grid .skeleton-image {
    height: 120px;
  }
}

@media (max-width: 480px) {
  .list-title {
    font-size: 16px;
  }

  .trade-items {
    gap: 8px;
  }

  .load-more-btn {
    min-width: auto;
    width: 100%;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .list-title {
    color: #e2e8f0;
  }

  .list-count {
    background: #4a5568;
    color: #e2e8f0;
  }

  .view-toggle-btn {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }

  .view-toggle-btn:hover {
    background: #4a5568;
    border-color: #718096;
  }

  .skeleton-item {
    background: #2d3748;
  }

  .skeleton-image,
  .skeleton-price,
  .skeleton-title,
  .skeleton-meta {
    background: linear-gradient(90deg, #4a5568 25%, #718096 50%, #4a5568 75%);
  }

  .load-more-btn {
    background: #2d3748;
    border-color: #1DCD9F;
  }
}
</style>