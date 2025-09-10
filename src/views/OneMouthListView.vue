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
          @load-more="loadMore"
          @scroll-end="handleScrollEnd"
      />
    </div>

    <FloatingButton @click="addNewFood" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { contentService } from '@/api/axios.js';
import HeaderSection from '@/components/oneMouth/HeaderSection.vue';
import SidebarSection from '@/components/oneMouth/SidebarSection.vue';
import ContentArea from '@/components/oneMouth/ContentArea.vue';
import FloatingButton from '@/components/oneMouth/FloatingButton.vue';

// 라우터
const router = useRouter();

// Reactive state
const searchQuery = ref('');
const activeFilter = ref(null);
const sortBy = ref('latest');
const filteredFoods = ref([]);
const loading = ref(false);
const initialLoading = ref(true);
const hasMore = ref(true);

// 페이지네이션 상태
const currentPage = ref(0);
const pageSize = ref(12);
const totalElements = ref(0);

// 카테고리 관련 상태
const categories = ref([]);
const categoriesLoading = ref(false);

const foods = ref([]);

// 개선된 viewDetail 함수
const viewDetail = async (food) => {
  console.log('상세페이지로 이동 시도:', {
    id: food.id,
    name: food.name,
    currentRoute: router.currentRoute.value.path
  });

  try {
    // 1. food.id 유효성 검사
    if (!food.id) {
      console.error('유효하지 않은 food.id:', food.id);
      alert('상품 정보를 찾을 수 없습니다.');
      return;
    }

    // 2. 현재 라우트와 같은지 확인 (중복 이동 방지)
    const targetPath = `/one-mouth/${food.id}`;
    if (router.currentRoute.value.path === targetPath) {
      console.log('이미 해당 페이지에 있음');
      return;
    }

    // 3. 라우터 이동 시도
    console.log('라우터 이동 시작:', targetPath);

    await router.push({
      name: 'OneMouthDetail',
      params: {
        id: String(food.id)
      }
    });

    console.log('라우터 이동 성공');

  } catch (error) {
    console.error('라우터 이동 실패:', error);

    // NavigationDuplicated 에러는 무시
    if (error.name === 'NavigationDuplicated') {
      console.log('이미 해당 페이지로 이동 중');
      return;
    }

    // 인증 관련 에러 체크
    if (error.message?.includes('auth') || error.message?.includes('login')) {
      console.log('인증 문제로 인한 이동 실패');
      alert('로그인이 필요합니다.');
      await router.push('/login');
      return;
    }

    // 대안 방법들 시도
    try {
      // 대안 1: 직접 경로로 이동
      console.log('대안 1: 직접 경로로 이동 시도');
      await router.push(`/one-mouth/${food.id}`);
      console.log('대안 1 성공');

    } catch (secondError) {
      console.error('대안 1 실패:', secondError);

      try {
        // 대안 2: replace 사용
        console.log('대안 2: replace로 이동 시도');
        await router.replace({
          name: 'OneMouthDetail',
          params: { id: String(food.id) }
        });
        console.log('대안 2 성공');

      } catch (thirdError) {
        console.error('대안 2 실패:', thirdError);

        // 최후의 수단: window.location
        console.log('최후의 수단: window.location 사용');
        const baseUrl = window.location.origin;
        window.location.href = `${baseUrl}/one-mouth/${food.id}`;
      }
    }
  }
};

// 한국어 카테고리명에 맞춘 아이콘 매핑 함수
const getCategoryIcon = (categoryName, keywords) => {
  if (keywords) {
    const emojiMatch = keywords.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu);
    if (emojiMatch && emojiMatch.length > 0) {
      return emojiMatch[0];
    }
  }

  if (!categoryName) return '🍽️';

  const iconMap = {
    '카테고리': '📂', '기본': '📁', '전체': '🍽️', '기타': '🔖',
    '한식': '🍚', '중식': '🥢', '일식': '🍣', '양식': '🍝',
    '분식': '🍜', '치킨': '🍗', '피자': '🍕', '햄버거': '🍔',
    '카페': '☕', '커피': '☕', '디저트': '🍰', '베이커리': '🍞',
    '간식': '🍫', '과자': '🍫', '음료': '🧋', '빵': '🍞',
    '면류': '🍜', '밥류': '🍚', '국물': '🍲',
    '편의점': '🏪', '마트': '🛒', '백화점': '🏬', '온라인': '💻',
    '배달': '🛵', '포장': '📦', '매장': '🏪',
    '인기': '🔥', '추천': '⭐', '신상': '🆕', '할인': '🏷️',
    '한정': '🎁', '이벤트': '🎉', '특가': '💸'
  };

  if (iconMap[categoryName]) {
    return iconMap[categoryName];
  }

  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (categoryName.includes(keyword)) {
      return icon;
    }
  }

  return categoryName.length <= 3 ? '📂' : '🍽️';
};

const getCategoryType = (categoryName, keywords) => {
  if (!categoryName) return 'FOOD';

  const typeKeywords = {
    'TREND': ['신상', '트렌드', '인기', '핫', '화제', 'TV', '방송', '한정', '시즌'],
    'PLACE': ['편의점', '카페', '마트', '백화점', '온라인', '배달', '매장', '프랜차이즈'],
    'FOOD': ['한식', '중식', '일식', '양식', '분식', '치킨', '피자', '디저트', '간식', '음료', '빵'],
    'PRICE': ['저렴', '할인', '특가', '이벤트', '프로모션'],
    'PURPOSE': ['나눔', '공구', '판매', '교환', '선물', '소분', '공동구매'],
    'LIFESTYLE': ['다이어트', '헬스', '비건', '유기농', '건강', '야식', '게임'],
    'TIME': ['아침', '점심', '저녁', '야식', '간식', '밤', '새벽'],
    'SPECIAL': ['추천', '베스트', '평점', '리뷰', '인스타', '화제', '급상승']
  };

  const searchText = `${categoryName} ${keywords || ''}`.toLowerCase();

  for (const [type, keywordList] of Object.entries(typeKeywords)) {
    if (keywordList.some(keyword => searchText.includes(keyword))) {
      return type;
    }
  }

  return 'FOOD';
};

const generateCategoryKey = (categoryName, categoryId = null) => {
  if (!categoryName) return `unknown_${categoryId || Date.now()}`;

  let baseKey = categoryName
  .trim()
  .replace(/[^\w가-힣]/g, '_')
  .replace(/_+/g, '_')
  .replace(/^_|_$/g, '')
  .toLowerCase();

  if (categoryId) {
    baseKey = `${baseKey}_${categoryId}`;
  }

  return baseKey || `category_${categoryId || Date.now()}`;
};

// 카테고리 로드 함수
const fetchCategories = async () => {
  if (categoriesLoading.value) return;

  categoriesLoading.value = true;
  try {
    const response = await contentService.getCategories();
    const serverCategories = response.data?.data || response.data || [];

    console.log('서버에서 받은 카테고리:', serverCategories);

    const mappedServerCategories = serverCategories
    .filter(cat => cat.isActive === true)
    .map(cat => ({
      categoryId: cat.categoryId,
      categoryKey: generateCategoryKey(cat.categoryName, cat.categoryId),
      categoryName: cat.categoryName,
      categoryIcon: getCategoryIcon(cat.categoryName, cat.keywords),
      categoryType: getCategoryType(cat.categoryName, cat.keywords),
      parentId: null,
      displayOrder: cat.sortOrder,
      isActive: cat.isActive,
      itemCount: 0,
      description: cat.description || '',
      keywords: cat.keywords || '',
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

    categories.value = mappedServerCategories;
    console.log('최종 카테고리 목록:', categories.value);

  } catch (error) {
    console.error('카테고리 로딩 실패:', error);
    categories.value = [];
  } finally {
    categoriesLoading.value = false;
  }
};

const getCurrentCategory = () => {
  return categories.value.find(cat => cat.categoryKey === activeFilter.value) || null;
};

const getCategoryParams = (categoryKey) => {
  if (!categoryKey || categoryKey === null) {
    console.log('선택된 카테고리: 전체 (필터 없음)');
    return {};
  }

  const category = categories.value.find(cat => cat.categoryKey === categoryKey);
  if (!category) {
    console.log('선택된 카테고리: 찾을 수 없음 -', categoryKey);
    return {};
  }

  console.log('선택된 카테고리:', category);

  if (category.categoryId) {
    return {
      categoryId: category.categoryId,
      categoryName: category.categoryName
    };
  }

  return {};
};

// API 호출 함수 - 백엔드 응답 구조에 맞게 수정
const fetchFoods = async (page = 0, append = false) => {
  if (loading.value) return;

  if (append) {
    loading.value = true;
  }

  try {
    // API 파라미터 구성
    const params = {
      page: page,
      size: pageSize.value,
      sort: sortBy.value === 'latest' ? 'createdAt,DESC' :
          sortBy.value === 'popular' ? 'hits,DESC' :
              sortBy.value === 'favorites' ? 'favoritesCount,DESC' :
                  sortBy.value === 'price' ? 'price,ASC' : 'createdAt,DESC'
    };

    // 검색어가 있으면 추가
    if (searchQuery.value.trim()) {
      params.keyword = searchQuery.value.trim();
    }

    // 카테고리 파라미터 추가
    const categoryParams = getCategoryParams(activeFilter.value);
    Object.assign(params, categoryParams);

    console.log('API 요청 파라미터:', params);

    const response = await contentService.getOneMouths(params);

    // 백엔드 응답은 Page<ListView> 형태
    const pageData = response.data?.data || response.data;
    const contents = pageData?.content || [];

    // 페이지네이션 정보 추출
    const pagination = {
      number: pageData?.number || 0,
      totalElements: pageData?.totalElements || 0,
      last: pageData?.last !== false
    };

    console.log('API 응답:', { contents: contents.length, pagination });

    // 백엔드 ListView 응답을 프론트엔드 형태로 변환
    const newFoods = contents.map(item => ({
      id: item.oneMouthId,
      name: item.title || '제목 없음',
      description: item.description || '',
      emoji: getEmojiByCategory(item.categoryName),
      rating: 0, // ListView에 rating 필드가 없음
      reviewCount: item.hits || 0, // 조회수를 리뷰수로 사용
      location: item.location || '',
      trending: item.hits > 100, // 조회수 기준으로 트렌딩 판단
      // productStatus가 객체 형태로 오므로 .title 속성 사용
      selling: item.productStatus?.title === 'FOR_SALE' || item.productStatus?.title === 'RESERVED',
      price: item.price || 0,
      stock: 0, // ListView에 stock 필드가 없음
      quantity: item.quantity || '',
      // unit도 객체 형태로 오므로 .title 속성 사용
      unit: item.unit?.title || 'CUSTOM',
      category: item.categoryName || '기타',
      categoryId: item.categoryId,
      imageUrl: item.thumbnailUrl || '',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      isLimited: false, // ListView에 해당 필드 없음
      sellerId: item.sellerId,
      productStatus: item.productStatus?.title, // title만 저장
      productType: item.productType,
      favoritesCount: item.favoritesCount || 0
    }));

    console.log('변환된 데이터 샘플:', newFoods.slice(0, 2));

    if (append) {
      foods.value = [...foods.value, ...newFoods];
    } else {
      foods.value = newFoods;
    }

    // 클라이언트 사이드 필터링 적용
    filteredFoods.value = applyClientSideFiltering(foods.value);

    // 페이지네이션 정보 업데이트
    currentPage.value = pagination.number;
    totalElements.value = pagination.totalElements;
    hasMore.value = !pagination.last;

    console.log(`데이터 로드 완료: ${newFoods.length}개 아이템, 총 ${totalElements.value}개`);

  } catch (error) {
    console.error('음식 데이터 로딩 실패:', error);

    if (!append) {
      foods.value = [];
      filteredFoods.value = [];
      totalElements.value = 0;
      hasMore.value = false;
      console.log('API 실패: 빈 데이터로 설정');
    }
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

// 카테고리별 이모지 반환
const getEmojiByCategory = (categoryName) => {
  if (!categoryName) return '🍽️';

  const emojiMap = {
    '편의점': '🏪', '편의점 템': '🏪',
    '카페': '☕', '카페 음료': '☕',
    '베이커리': '🍞',
    '프랜차이즈': '🍕',
    '분식': '🍜', '길거리': '🍜',
    '간식': '🍫', '과자': '🍫',
    '음료': '🧋', '디저트': '🍰',
    '빵': '🍞',
    '간편식': '🍜',
    '냉동식품': '🥟',
    '건강식품': '🍎', '과일': '🍎',
    '한정판': '🏷️',
    '신상': '🆕',
    '트렌딩': '🌟',
    '판매중': '💰'
  };
  return emojiMap[categoryName] || '🍽️';
};

const applyClientSideFiltering = (foods) => {
  return foods;
};

const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  const nextPage = currentPage.value + 1;
  await fetchFoods(nextPage, true);
};

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
  if (activeFilter.value === filter) return;
  console.log('필터 변경:', activeFilter.value, '->', filter);
  activeFilter.value = filter;
  resetAndFetch();
};

const setSortBy = (newSortBy) => {
  if (sortBy.value === newSortBy) return;
  console.log('정렬 변경:', sortBy.value, '->', newSortBy);
  sortBy.value = newSortBy;
  resetAndFetch();
};

let searchTimeout = null;

const updateSearchQuery = (query) => {
  console.log('검색어 변경:', searchQuery.value, '->', query);
  searchQuery.value = query;

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    resetAndFetch();
  }, 300);
};

const resetAndFetch = () => {
  if (loading.value) return;

  currentPage.value = 0;
  foods.value = [];
  filteredFoods.value = [];
  hasMore.value = true;
  fetchFoods(0, false);
};

const addNewFood = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  router.push('/one-mouth/create');
};

// Watchers
watch(sortBy, (newSortBy, oldSortBy) => {
  if (newSortBy !== oldSortBy) {
    console.log('정렬 변경:', oldSortBy, '->', newSortBy);
    resetAndFetch();
  }
});

watch(activeFilter, (newFilter, oldFilter) => {
  if (newFilter !== oldFilter) {
    console.log('카테고리 변경 감지:', oldFilter, '->', newFilter);
  }
});

// Lifecycle
onMounted(() => {
  console.log('컴포넌트 마운트 시작');

  fetchCategories().then(() => {
    console.log('카테고리 로드 완료, 음식 데이터 로드 시작');
    fetchFoods();
  }).catch(error => {
    console.error('초기 로딩 실패:', error);
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