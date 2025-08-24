<template>
  <div class="content-area">
    <!-- 헤더 영역 -->
    <div class="content-header">
      <div class="results-info">
        <h2>
          <span v-if="activeFilter">
            {{ getFilterDisplayName(activeFilter) }}
          </span>
          <span v-else>전체</span>
          <small class="count">({{ totalCount }}개)</small>
        </h2>
        <p class="subtitle" v-if="activeFilter">
          {{ getFilterDescription(activeFilter) }}
        </p>
      </div>

      <div class="sort-controls">
        <select v-model="currentSort" @change="handleSortChange" class="sort-select">
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="rating">평점순</option>
          <option value="price">가격낮은순</option>
        </select>
      </div>
    </div>

    <!-- 로딩 상태 (초기 로딩) -->
    <div v-if="initialLoading" class="loading-container">
      <div class="loading-grid">
        <div v-for="n in 6" :key="n" class="skeleton-card">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 음식 목록 -->
    <div v-else-if="filteredFoods.length > 0" class="foods-grid">
      <FoodCard
          v-for="food in filteredFoods"
          :key="`food-${food.id}`"
          :food="food"
          @click="handleCardClick(food)"
          @request-share="handleRequestShare(food)"
          @start-chat="handleStartChat(food)"
      />

      <!-- 무한 스크롤 로딩 -->
      <div v-if="loading" class="infinite-loading">
        <div class="spinner"></div>
        <p>더 많은 음식을 불러오는 중...</p>
      </div>

      <!-- 더 보기 버튼 (무한 스크롤 대신 사용할 경우) -->
      <div v-else-if="hasMore" class="load-more-container">
        <button @click="handleLoadMore" class="load-more-btn">
          더 보기 ({{ remainingCount }}개 더)
        </button>
      </div>

      <!-- 마지막 페이지 표시 -->
      <div v-else-if="filteredFoods.length > 0" class="end-message">
        <p>🎉 모든 음식을 확인했습니다!</p>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">🔍</div>
        <h3>검색 결과가 없습니다</h3>
        <p v-if="activeFilter">
          '<strong>{{ getFilterDisplayName(activeFilter) }}</strong>' 카테고리에서<br>
          조건에 맞는 음식을 찾을 수 없어요.
        </p>
        <p v-else>
          조건에 맞는 음식을 찾을 수 없어요.<br>
          다른 검색어나 필터를 사용해보세요.
        </p>
        <div class="empty-actions">
          <button @click="clearFilters" class="clear-filters-btn">
            전체 보기
          </button>
          <button @click="addNewFood" class="add-food-btn">
            새 음식 등록
          </button>
        </div>
      </div>
    </div>

    <!-- 스크롤 감지용 요소 -->
    <div ref="scrollTrigger" class="scroll-trigger"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import FoodCard from './detail/FoodCard.vue';

// Props
const props = defineProps({
  filteredFoods: {
    type: Array,
    default: () => []
  },
  sortBy: {
    type: String,
    default: 'latest'
  },
  activeFilter: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  initialLoading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  },
  totalCount: {
    type: Number,
    default: 0
  }
});

// Emits
const emit = defineEmits([
  'set-sort',
  'view-detail',
  'request-share',
  'start-chat',
  'load-more',
  'scroll-end',
  'clear-filters',
  'add-new-food'
]);

// 반응형 데이터
const currentSort = ref(props.sortBy);
const scrollTrigger = ref(null);
const observer = ref(null);

// Computed
const remainingCount = computed(() => {
  return Math.max(0, props.totalCount - props.filteredFoods.length);
});

// 필터 표시 이름 가져오기
const getFilterDisplayName = (filterKey) => {
  if (!filterKey) return '전체';

  // 임시 매핑 (실제로는 categories에서 가져와야 함)
  const filterNames = {
    'convenience': '편의점',
    'cafe': '카페',
    'snacks': '간식',
    'drinks': '음료',
    'desserts': '디저트',
    'bakery': '베이커리',
    'korean': '한식',
    'chinese': '중식',
    'japanese': '일식',
    'western': '양식'
  };

  return filterNames[filterKey] || filterKey;
};

// 필터 설명 가져오기
const getFilterDescription = (filterKey) => {
  if (!filterKey) return '';

  const descriptions = {
    'convenience': '편의점에서 만나는 특별한 맛',
    'cafe': '카페의 달콤한 음료와 디저트',
    'snacks': '간식거리와 과자류',
    'drinks': '시원하고 달콤한 음료',
    'desserts': '달콤한 디저트와 케이크',
    'bakery': '갓 구운 빵과 베이커리'
  };

  return descriptions[filterKey] || '';
};

// 이벤트 핸들러들
const handleCardClick = (food) => {
  console.log('🍽️ 카드 클릭:', food.name);
  emit('view-detail', food);
};

const handleRequestShare = (food) => {
  emit('request-share', food);
};

const handleStartChat = (food) => {
  emit('start-chat', food);
};

const handleSortChange = () => {
  emit('set-sort', currentSort.value);
};

const handleLoadMore = () => {
  emit('load-more');
};

const clearFilters = () => {
  emit('clear-filters');
};

const addNewFood = () => {
  emit('add-new-food');
};

// 무한 스크롤 설정
const setupInfiniteScroll = () => {
  if (!scrollTrigger.value) return;

  observer.value = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && props.hasMore && !props.loading) {
          console.log('🔄 무한 스크롤 트리거');
          emit('scroll-end');
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
  );

  observer.value.observe(scrollTrigger.value);
};

// 무한 스크롤 해제
const cleanupInfiniteScroll = () => {
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }
};

// Watchers
watch(() => props.sortBy, (newSort) => {
  if (currentSort.value !== newSort) {
    currentSort.value = newSort;
  }
});

// Lifecycle
onMounted(async () => {
  await nextTick();
  setupInfiniteScroll();
});

onUnmounted(() => {
  cleanupInfiniteScroll();
});

// 필터나 음식 목록이 변경될 때 스크롤을 맨 위로
watch([() => props.activeFilter, () => props.filteredFoods.length],
    ([newFilter], [oldFilter]) => {
      // 필터가 변경되었을 때만 스크롤을 맨 위로
      if (newFilter !== oldFilter) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
);
</script>

<style scoped>
.content-area {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
}

.results-info h2 {
  font-size: 1.5em;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.results-info .count {
  font-size: 0.9em;
  color: #7f8c8d;
  font-weight: normal;
}

.results-info .subtitle {
  color: #7f8c8d;
  font-size: 0.9em;
  margin: 0;
}

.sort-controls {
  flex-shrink: 0;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.sort-select:hover,
.sort-select:focus {
  outline: none;
  border-color: #3498db;
}

/* 로딩 스켈레톤 */
.loading-container {
  width: 100%;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-image {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.skeleton-title {
  height: 20px;
  margin-bottom: 8px;
}

.skeleton-text {
  height: 16px;
  margin-bottom: 6px;
}

.skeleton-text.short {
  width: 60%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 음식 목록 */
.foods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 무한 스크롤 로딩 */
.infinite-loading {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #666;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 더 보기 버튼 */
.load-more-container {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.load-more-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

/* 끝 메시지 */
.end-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

/* 빈 상태 */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-content h3 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 1.3em;
}

.empty-content p {
  color: #7f8c8d;
  line-height: 1.5;
  margin-bottom: 24px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.clear-filters-btn,
.add-food-btn {
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.clear-filters-btn {
  background: #ecf0f1;
  color: #2c3e50;
}

.clear-filters-btn:hover {
  background: #d5dbdb;
}

.add-food-btn {
  background: #e74c3c;
  color: white;
}

.add-food-btn:hover {
  background: #c0392b;
}

/* 스크롤 트리거 */
.scroll-trigger {
  height: 10px;
  margin-top: 20px;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .foods-grid,
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .sort-controls {
    align-self: flex-end;
  }

  .foods-grid,
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  .empty-actions {
    flex-direction: column;
  }

  .clear-filters-btn,
  .add-food-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .foods-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }

  .results-info h2 {
    font-size: 1.3em;
  }
}</style>