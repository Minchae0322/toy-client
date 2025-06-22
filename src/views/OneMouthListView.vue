<template>
  <div class="app-container">
    <HeaderSection :total-foods="totalFoods" :active-sellings="activeSellings" :total-users="totalUsers" />

    <div class="main-content">
      <SidebarSection
          :search-query="searchQuery"
          :filter-options="categories"
          :active-filter="activeFilter"
          :categories-loading="categoriesLoading"
          @update-query="updateSearchQuery"
          @set-filter="setActiveFilter"
          @retry-categories="fetchCategories"
      />

      <ContentArea
          :filtered-foods="filteredFoods"
          :sort-by="sortBy"
          :active-filter="activeFilter"
          :loading="loading"
          :initial-loading="initialLoading"
          :has-more="hasMore"
          :total-count="totalElements"
          @set-sort="setSortBy"
          @view-detail="viewDetail"
          @request-share="requestShare"
          @start-chat="startChat"
          @load-more="loadMore"
          @scroll-end="handleScrollEnd"
      />
    </div>

    <FloatingButton @click="addNewFood" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { contentService } from '@/api/axios.js';
import HeaderSection from '@/components/oneMouth/HeaderSection.vue';
import SidebarSection from '@/components/oneMouth/SidebarSection.vue';
import ContentArea from '@/components/oneMouth/ContentArea.vue';
import FloatingButton from '@/components/oneMouth/FloatingButton.vue';

// Reactive state
const searchQuery = ref('');
const activeFilter = ref('all');
const sortBy = ref('latest');
const filteredFoods = ref([]);
const loading = ref(false);
const initialLoading = ref(true); // 초기 로딩과 구분
const hasMore = ref(true);

// 페이지네이션 상태
const currentPage = ref(0);
const pageSize = ref(12); // 한 번에 로드할 아이템 수
const totalElements = ref(0);

// 카테고리 관련 상태
const categories = ref([]);
const categoriesLoading = ref(false);

// 기본 카테고리 (API 로드 전 기본값 + 핵심 카테고리)
const defaultCategories = [
  // 시스템 기본
  {categoryId: null, categoryKey: 'all', categoryName: '전체', categoryIcon: '🍽️', categoryType: 'SYSTEM'},

  // 🔥 트렌드/신상 카테고리 (가장 인기)
  {categoryId: null, categoryKey: 'new', categoryName: '이번주 신상', categoryIcon: '🆕', categoryType: 'TREND'},
  {categoryId: null, categoryKey: 'trending', categoryName: '화제의 먹거리', categoryIcon: '🌟', categoryType: 'TREND'},
  {categoryId: null, categoryKey: 'limited', categoryName: '한정판/시즌', categoryIcon: '🏷️', categoryType: 'TREND'},
  {categoryId: null, categoryKey: 'tv', categoryName: 'TV에 나온 그거', categoryIcon: '📺', categoryType: 'TREND'},

  // 🏪 장소별 카테고리 (MZ세대 핫플레이스)
  {categoryId: null, categoryKey: 'convenience', categoryName: '편의점 템', categoryIcon: '🏪', categoryType: 'PLACE'},
  {categoryId: null, categoryKey: 'cafe', categoryName: '카페 음료', categoryIcon: '☕', categoryType: 'PLACE'},
  {categoryId: null, categoryKey: 'franchise', categoryName: '프랜차이즈', categoryIcon: '🍕', categoryType: 'PLACE'},

  // 🍭 음식 종류별 카테고리 (기본 분류)
  {categoryId: null, categoryKey: 'snacks', categoryName: '간식/과자', categoryIcon: '🍫', categoryType: 'FOOD'},
  {categoryId: null, categoryKey: 'drinks', categoryName: '음료/디저트', categoryIcon: '🧋', categoryType: 'FOOD'},
  {categoryId: null, categoryKey: 'instant', categoryName: '간편식', categoryIcon: '🍜', categoryType: 'FOOD'},

  // 💰 가격대별 카테고리 (실용적)
  {categoryId: null, categoryKey: 'under3k', categoryName: '천원템', categoryIcon: '💸', categoryType: 'PRICE'},
  {categoryId: null, categoryKey: 'under5k', categoryName: '삼천원템', categoryIcon: '💵', categoryType: 'PRICE'},

  // 🎯 목적별 카테고리 (소셜 커머스 핵심)
  {categoryId: null, categoryKey: 'sharing', categoryName: '나눔/소분', categoryIcon: '🤝', categoryType: 'PURPOSE'},
  {categoryId: null, categoryKey: 'group', categoryName: '공동구매', categoryIcon: '👥', categoryType: 'PURPOSE'},
  {categoryId: null, categoryKey: 'selling', categoryName: '판매중', categoryIcon: '💰', categoryType: 'PURPOSE'},

  // 🏃‍♂️ 라이프스타일별 (MZ세대 라이프)
  {categoryId: null, categoryKey: 'diet', categoryName: '헬스/다이어트', categoryIcon: '💪', categoryType: 'LIFESTYLE'},
  {categoryId: null, categoryKey: 'gaming', categoryName: '야식/게임', categoryIcon: '🎮', categoryType: 'LIFESTYLE'},

  // ⏰ 시간대별 추천 (실용적)
  {categoryId: null, categoryKey: 'morning', categoryName: '아침용', categoryIcon: '🌅', categoryType: 'TIME'},
  {categoryId: null, categoryKey: 'night', categoryName: '저녁/야식', categoryIcon: '🌙', categoryType: 'TIME'},

  // 🔖 특별 태그 (알고리즘 기반)
  {categoryId: null, categoryKey: 'hot', categoryName: '지금 핫한', categoryIcon: '🔥', categoryType: 'SPECIAL'},
  {categoryId: null, categoryKey: 'rising', categoryName: '관심 급상승', categoryIcon: '👀', categoryType: 'SPECIAL'},
  {categoryId: null, categoryKey: 'top_rated', categoryName: '평점 높은', categoryIcon: '⭐', categoryType: 'SPECIAL'},
  {categoryId: null, categoryKey: 'instagramable', categoryName: '인스타그래머블', categoryIcon: '📸', categoryType: 'SPECIAL'}
];

const foods = ref([]);

// 카테고리 로드 함수
const fetchCategories = async () => {
  if (categoriesLoading.value) return;

  categoriesLoading.value = true;
  try {
    const response = await contentService.getCategories();
    const serverCategories = response.data;

    // 기본 카테고리 + 서버 카테고리 병합
    categories.value = [
      ...defaultCategories,
      ...serverCategories.map(cat => ({
        categoryId: cat.categoryId,
        categoryKey: cat.categoryKey,
        categoryName: cat.categoryName,
        categoryIcon: cat.categoryIcon || '🍽️',
        categoryType: cat.categoryType,
        parentId: cat.parentId,
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
        itemCount: cat.itemCount || 0
      }))
    ].filter(cat => cat.isActive !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  } catch (error) {
    console.error('🗂️ 카테고리 로딩 실패:', error);
    // 실패 시 기본 카테고리만 사용
    categories.value = defaultCategories;
  } finally {
    categoriesLoading.value = false;
  }
};

// 현재 선택된 카테고리 정보 가져오기
const getCurrentCategory = () => {
  return categories.value.find(cat => cat.categoryKey === activeFilter.value) || defaultCategories[0];
};

// 카테고리별 API 파라미터 생성
const getCategoryParams = (categoryKey) => {
  const category = categories.value.find(cat => cat.categoryKey === categoryKey);
  if (!category || categoryKey === 'all') return {};

  // 백엔드에서 관리하는 카테고리는 categoryId로 필터링
  if (category.categoryId) {
    return { categoryId: category.categoryId };
  }

  // 특수 카테고리들 (시스템 레벨) - 기본 카테고리 처리
  switch (categoryKey) {
      // 트렌드/신상
    case 'new':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { startDate: weekAgo.toISOString().split('T')[0] };
    case 'trending':
    case 'hot':
      return { trending: true };
    case 'limited':
      return { isLimited: true };
    case 'tv':
      return { categoryKey: 'tv' }; // 백엔드에서 TV 태그로 처리

      // 장소별
    case 'convenience':
      return { placeType: 'CONVENIENCE_STORE' };
    case 'cafe':
      return { placeType: 'CAFE' };
    case 'franchise':
      return { placeType: 'FRANCHISE' };

      // 음식 종류별
    case 'snacks':
      return { foodType: 'SNACK' };
    case 'drinks':
      return { foodType: 'DRINK' };
    case 'instant':
      return { foodType: 'INSTANT' };

      // 가격대별
    case 'under3k':
      return { minPrice: 0, maxPrice: 3000 };
    case 'under5k':
      return { minPrice: 3000, maxPrice: 5000 };
    case 'under10k':
      return { minPrice: 5000, maxPrice: 10000 };
    case 'over10k':
      return { minPrice: 10000 };

      // 목적별
    case 'sharing':
      return { purposeType: 'SHARING' };
    case 'group':
      return { purposeType: 'GROUP_BUY' };
    case 'selling':
      return { productStatus: 'FOR_SALE' };

      // 라이프스타일별
    case 'diet':
      return { lifestyleType: 'DIET' };
    case 'gaming':
      return { lifestyleType: 'GAMING' };

      // 시간대별
    case 'morning':
      return { timeType: 'MORNING' };
    case 'night':
      return { timeType: 'NIGHT' };

    default:
      return { categoryKey: categoryKey };
  }
};

// API 호출 함수 (페이지네이션 적용)
const fetchFoods = async (page = 0, append = false) => {
  if (loading.value) return;

  // 무한 스크롤일 때만 로딩 표시, 필터/검색 변경 시에는 로딩 숨김
  if (append) {
    loading.value = true;
  }

  try {
    // API 파라미터 구성 (실제 API 스펙에 맞게)
    const params = {
      page: page,
      size: pageSize.value,
      sort: sortBy.value === 'latest' ? 'createdAt,DESC' :
          sortBy.value === 'popular' ? 'hits,DESC' :
              sortBy.value === 'rating' ? 'rating,DESC' :
                  sortBy.value === 'price' ? 'price,ASC' : 'createdAt,DESC'
    };

    // 검색어가 있으면 추가 (keyword 파라미터로)
    if (searchQuery.value.trim()) {
      params.keyword = searchQuery.value.trim();
    }

    // 카테고리 파라미터 추가
    const categoryParams = getCategoryParams(activeFilter.value);
    Object.assign(params, categoryParams);

    const res = await contentService.getOneMouths(params);
    const contents = res.data.content;

    // 데이터 변환
    const newFoods = contents.map(item => ({
      id: item.oneMouthId,
      name: item.title,
      description: item.description,
      emoji: getEmojiByCategory(item.category),
      rating: item.rating || 4.5,
      reviewCount: item.hits,
      location: item.location,
      trending: item.trending || item.hits > 50,
      selling: item.productStatus === 'FOR_SALE',
      price: item.price,
      stock: item.stock || 1,
      category: item.category?.categoryName || '기타',
      categoryId: item.category?.categoryId,
      imageUrl: item.imageUrl,
      createdAt: item.createdAt,
      isLimited: item.isLimited
    }));

    if (append) {
      // 기존 데이터에 추가 (무한 스크롤)
      foods.value = [...foods.value, ...newFoods];
    } else {
      // 새로운 데이터로 교체 (검색/필터)
      foods.value = newFoods;
    }

    // 클라이언트 사이드 필터링 적용
    filteredFoods.value = applyClientSideFiltering(foods.value);

    // 페이지네이션 정보 업데이트
    currentPage.value = res.data.number;
    totalElements.value = res.data.totalElements;
    hasMore.value = !res.data.last;

  } catch (error) {
    console.error('🍽 음식 데이터 로딩 실패:', error);
  } finally {
    loading.value = false;
    initialLoading.value = false; // 초기 로딩 완료
  }
};

// 카테고리별 이모지 반환 (백엔드 데이터 우선)
const getEmojiByCategory = (category) => {
  // 백엔드에서 categoryIcon이 있으면 우선 사용
  if (category && typeof category === 'object' && category.categoryIcon) {
    return category.categoryIcon;
  }

  // categoryName으로 매핑 (백업용)
  const categoryName = typeof category === 'string' ? category : category?.categoryName;
  const emojiMap = {
    // 장소별
    '편의점': '🏪', '편의점 템': '🏪',
    '카페': '☕', '카페 음료': '☕',
    '베이커리': '🍞',
    '프랜차이즈': '🍕',
    '분식': '🍜', '길거리': '🍜',
    // 음식 종류별
    '간식': '🍫', '과자': '🍫',
    '음료': '🧋', '디저트': '🍰',
    '빵': '🍞',
    '간편식': '🍜',
    '냉동식품': '🥟',
    '건강식품': '🍎', '과일': '🍎',
    // 특별
    '한정판': '🏷️',
    '신상': '🆕',
    '트렌딩': '🌟',
    '판매중': '💰'
  };
  return emojiMap[categoryName] || '🍽️';
};

// 클라이언트 사이드 필터링 함수 (특별한 경우만)
const applyClientSideFiltering = (foods) => {
  let filtered = foods;

  // 일부 특수 필터는 클라이언트에서 추가 처리
  switch (activeFilter.value) {
    case 'rising':
      // 관심 급상승 - 최근 생성되고 조회수가 높은 것
      filtered = filtered.filter(food => {
        const created = new Date(food.createdAt);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return created > threeDaysAgo && food.hits > 50;
      });
      break;

    case 'top_rated':
      filtered = filtered.filter(food => food.rating >= 4.0);
      break;

    case 'instagramable':
      // 인스타그래머블 - 이미지가 있고 평점이 높은 것
      filtered = filtered.filter(food => food.imageUrl && food.rating >= 4.0);
      break;

    case 'tv':
      // TV에 나온 것 - 태그나 설명에 TV 관련 키워드 (백엔드에서 처리 안 되는 경우)
      filtered = filtered.filter(food =>
          food.description?.includes('TV') ||
          food.description?.includes('방송') ||
          food.description?.includes('텔레비전') ||
          food.name?.includes('TV') ||
          food.name?.includes('방송')
      );
      break;

    case 'hot':
      // 지금 핫한 - trending이 true이거나 최근 조회수가 높은 것
      if (!filtered.some(food => food.trending)) {
        // 백엔드에서 trending 필터가 작동하지 않는 경우 클라이언트에서 처리
        filtered = filtered.filter(food => food.trending || food.hits > 100);
      }
      break;
  }

  return filtered;
};
const loadMore = async () => {
  if (!hasMore.value || loading.value) return;

  const nextPage = currentPage.value + 1;
  await fetchFoods(nextPage, true);
};

// 스크롤 끝 감지 핸들러
const handleScrollEnd = () => {
  loadMore();
};

// Computed properties
const totalFoods = computed(() => totalElements.value);

const activeSellings = computed(() =>
    foods.value.filter(food => food.selling).length
);

const totalUsers = computed(() => 1247);

// Methods
const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  // 필터 변경 시 API 다시 호출
  resetAndFetch();
};

const setSortBy = (newSortBy) => {
  sortBy.value = newSortBy;
  resetAndFetch();
};

const updateSearchQuery = (query) => {
  searchQuery.value = query;
  // 디바운스를 위해 약간의 지연 후 API 다시 호출
  setTimeout(() => {
    resetAndFetch();
  }, 300);
};

// 데이터 리셋 후 새로 가져오기 (필터/검색용 - 로딩 없이)
const resetAndFetch = () => {
  currentPage.value = 0;
  foods.value = [];
  filteredFoods.value = [];
  hasMore.value = true;
  fetchFoods(0, false);
};

const viewDetail = (food) => {
  // 상세페이지로 라우팅
  // this.$router.push(`/one-mouth/${food.id}`);
  alert(`${food.name} 상세페이지로 이동합니다!`);
};

const requestShare = (food) => {
  alert(`${food.name} 한입 나눔을 요청했습니다!`);
};

const startChat = (food) => {
  alert(`${food.name} 판매자와 채팅을 시작합니다!`);
};

const addNewFood = () => {
  // 새 음식 등록 페이지로 라우팅
  // this.$router.push('/one-mouth/create');
  alert('새로운 음식을 등록합니다!');
};

// Watchers
watch([sortBy], () => {
  resetAndFetch();
});

// Lifecycle
onMounted(() => {
  // 카테고리 먼저 로드 후 음식 데이터 로드
  fetchCategories().then(() => {
    fetchFoods();
  });
});
</script>

<style scoped>
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  background: transparent;
  min-height: 100vh;
}

.main-content {
  display: flex;
  max-width: 1800px;
  margin: 0 auto;
  gap: 40px;
  padding: 40px 60px;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
  }
}
</style>