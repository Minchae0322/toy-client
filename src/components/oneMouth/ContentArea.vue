<template>
  <main class="content-area">
    <div class="content-header">
      <div>
        <h2 class="content-title">{{ getCurrentTitle }}</h2>
        <p class="results-count">
          {{ props.initialLoading ? '검색 중...' :
            loading && filteredFoods.length === 0 ? '검색 중...' :
                `${totalCount}개의 음식을 찾았습니다` }}
        </p>
      </div>
      <div class="sort-options">
        <button
            class="sort-btn"
            :class="{ active: sortBy === 'latest' }"
            @click="$emit('set-sort', 'latest')"
        >
          최신순
        </button>
        <button
            class="sort-btn"
            :class="{ active: sortBy === 'rating' }"
            @click="$emit('set-sort', 'rating')"
        >
          평점순
        </button>
        <button
            class="sort-btn"
            :class="{ active: sortBy === 'price' }"
            @click="$emit('set-sort', 'price')"
        >
          가격순
        </button>
      </div>
    </div>

    <!-- 스크롤 컨테이너 -->
    <div
        class="content-scroll-container"
        ref="scrollContainer"
        @scroll="handleScroll"
    >
      <div class="food-grid" v-if="filteredFoods.length > 0">
        <div
            class="food-card"
            v-for="food in filteredFoods"
            :key="food.id"
            @click="$emit('view-detail', food)"
        >
          <div class="food-image">
            {{ food.emoji }}
            <div class="trending-badge" v-if="food.trending">🌟 HOT</div>
            <div class="selling-badge" v-if="food.selling">💰 판매중</div>
          </div>
          <div class="food-info">
            <h3 class="food-title">{{ food.name }}</h3>
            <p class="food-description">{{ food.description }}</p>
            <div class="food-stats">
              <div class="location">📍 {{ food.location }}</div>
              <div class="time-ago">⏰ {{ getTimeAgo(food.createdAt) }}</div>
            </div>
            <div class="price-section" v-if="food.selling">
              <div class="price">{{ food.price?.toLocaleString() }}원</div>
              <div class="stock-info">{{ food.stock }}개 남음</div>
            </div>
            <div class="action-buttons" v-if="food.selling">
              <button class="btn btn-secondary" @click.stop="$emit('start-chat', food)">💬 채팅하기</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>더 많은 한입거리를 가져오는 중...</p>
        </div>
      </div>

      <!-- 더 보기 버튼 (옵션) -->
      <div v-if="hasMore && !loading && filteredFoods.length > 0" class="load-more-section">
        <button class="load-more-btn" @click="$emit('load-more')">
          <span>더 많은 한입거리 보기</span>
          <span class="load-more-icon">⬇️</span>
        </button>
      </div>

      <!-- 모든 데이터 로드 완료 -->
      <div v-if="!hasMore && filteredFoods.length > 0" class="end-section">
        <div class="end-message">
          <span class="end-icon">🎉</span>
          <p>모든 한입거리를 다 보셨네요!</p>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div class="empty-state" v-if="!initialLoading && !loading && filteredFoods.length === 0">
        <div class="empty-state-icon">🔍</div>
        <h3>검색 결과가 없어요</h3>
        <p>다른 키워드나 카테고리를 선택해보세요!</p>
      </div>

      <!-- 초기 로딩 상태 -->
      <div v-if="initialLoading" class="initial-loading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>한입거리를 불러오는 중...</p>
        </div>
      </div>
    </div>

    <!-- Intersection Observer 타겟 -->
    <div ref="observerTarget" class="observer-target"></div>
  </main>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';

// Props 정의
const props = defineProps({
  filteredFoods: {
    type: Array,
    required: true
  },
  sortBy: {
    type: String,
    required: true
  },
  activeFilter: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  initialLoading: {
    type: Boolean,
    default: true
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

// Emits 정의
const emit = defineEmits(['set-sort', 'view-detail', 'request-share', 'start-chat', 'load-more', 'scroll-end']);

// Refs
const scrollContainer = ref(null);
const observerTarget = ref(null);
let intersectionObserver = null;

// Computed properties
const getCurrentTitle = computed(() => {
  // 현재 선택된 카테고리 정보 가져오기 - 기본 카테고리 매핑 추가
  const filterTitleMap = {
    'all': '전체 한입거리',

    // 트렌드/신상
    'new': '🆕 이번주 신상',
    'trending': '🌟 화제의 먹거리',
    'limited': '🏷️ 한정판/시즌',
    'tv': '📺 TV에 나온 그거',

    // 장소별
    'convenience': '🏪 편의점 템',
    'cafe': '☕ 카페 음료',
    'franchise': '🍕 프랜차이즈',

    // 음식 종류별
    'snacks': '🍫 간식/과자',
    'drinks': '🧋 음료/디저트',
    'instant': '🍜 간편식',

    // 가격대별
    'under3k': '💸 천원템',
    'under5k': '💵 삼천원템',
    'under10k': '💴 오천원템',
    'over10k': '💎 만원 이상',

    // 목적별
    'sharing': '🤝 나눔/소분',
    'group': '👥 공동구매',
    'selling': '💰 판매중',

    // 라이프스타일별
    'diet': '💪 헬스/다이어트',
    'gaming': '🎮 야식/게임',

    // 시간대별
    'morning': '🌅 아침용',
    'night': '🌙 저녁/야식',

    // 특별 태그
    'hot': '🔥 지금 핫한',
    'rising': '👀 관심 급상승',
    'top_rated': '⭐ 평점 높은',
    'instagramable': '📸 인스타그래머블'
  };

  return filterTitleMap[props.activeFilter] || `${props.activeFilter}`;
});

// 시간 경과 계산 함수
const getTimeAgo = (createdAt) => {
  if (!createdAt) return '';

  const now = new Date();
  const created = new Date(createdAt);
  const diffInMs = now.getTime() - created.getTime();

  // 밀리초를 시간 단위로 변환
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // 1분 미만
  if (diffInMinutes < 1) {
    return '방금 전';
  }
  // 1시간 미만
  else if (diffInHours < 1) {
    return `${diffInMinutes}분 전`;
  }
  // 24시간 미만
  else if (diffInDays < 1) {
    return `${diffInHours}시간 전`;
  }
  // 7일 미만
  else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }
  // 30일 미만
  else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks}주 전`;
  }
  // 365일 미만
  else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months}개월 전`;
  }
  // 1년 이상
  else {
    const years = Math.floor(diffInDays / 365);
    return `${years}년 전`;
  }
};

// 스크롤 핸들러
const handleScroll = () => {
  if (!scrollContainer.value || props.loading || !props.hasMore) return;

  const container = scrollContainer.value;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  // 스크롤이 끝에서 200px 이내에 도달하면 더 로드
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    emit('scroll-end');
  }
};

// Intersection Observer 설정
const setupIntersectionObserver = () => {
  if (!observerTarget.value) return;

  intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && props.hasMore && !props.loading) {
            emit('load-more');
          }
        });
      },
      {
        root: scrollContainer.value,
        rootMargin: '200px',
        threshold: 0.1
      }
  );

  intersectionObserver.observe(observerTarget.value);
};

// Lifecycle
onMounted(async () => {
  await nextTick();
  setupIntersectionObserver();
});

onUnmounted(() => {
  if (intersectionObserver) {
    intersectionObserver.disconnect();
  }
});
</script>

<style scoped>
.content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-shrink: 0;
}

.content-title {
  font-size: 28px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.results-count {
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
}

.sort-options {
  display: flex;
  gap: 12px;
}

.sort-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.sort-btn.active {
  background: #169976;
  color: white;
  border-color: #169976;
}

.sort-btn:hover:not(.active) {
  border-color: #169976;
  color: #169976;
}

/* 스크롤 컨테이너 */
.content-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  /* 커스텀 스크롤바 */
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.content-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.content-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.content-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.food-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.food-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.food-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  position: relative;
}

.trending-badge,
.selling-badge {
  position: absolute;
  top: 12px;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.trending-badge {
  left: 12px;
  background: #ff4757;
}

.selling-badge {
  right: 12px;
  background: #1DCD9F;
}

.food-info {
  padding: 12px;
}

.food-title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
  line-height: 1.3;
}

.food-description {
  font-size: 11px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.food-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.location,
.time-ago {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 2px;
}

.time-ago {
  color: #999;
  font-weight: 500;
  white-space: nowrap;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.price {
  font-size: 17px;
  font-weight: 700;
  color: #169976;
}

.stock-info {
  font-size: 12px;
  color: #ffa500;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  flex: 1;
  text-align: center;
}

.btn-secondary {
  background: #f8f9fa;
  color: #169976;
  border: 1px solid #169976;
}

.btn-secondary:hover {
  background: #169976;
  color: white;
}

/* 로딩 섹션 */
.loading-section {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #169976;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 더 보기 섹션 */
.load-more-section {
  display: flex;
  justify-content: center;
  padding: 30px 20px;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #169976;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(22, 153, 118, 0.3);
}

.load-more-btn:hover {
  background: #128a64;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 153, 118, 0.4);
}

.load-more-icon {
  transition: transform 0.3s ease;
}

.load-more-btn:hover .load-more-icon {
  transform: translateY(2px);
}

/* 끝 섹션 */
.end-section {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.end-message {
  text-align: center;
  color: #666;
}

.end-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 12px;
}

.end-message p {
  margin: 0;
  font-size: 14px;
}

/* 초기 로딩 */
.initial-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 20px;
  min-height: 300px;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state-icon {
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
}

/* Observer 타겟 */
.observer-target {
  height: 1px;
  visibility: hidden;
}

/* 반응형 */
@media (max-width: 1200px) {
  .food-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .food-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .sort-options {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .food-grid {
    grid-template-columns: 1fr;
  }

  .sort-options {
    flex-wrap: wrap;
    gap: 8px;
  }

  .sort-btn {
    flex: 1;
    min-width: 80px;
  }
}
</style>