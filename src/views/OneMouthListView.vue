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
// 초기 activeFilter 값을 null로 설정 (아무것도 선택되지 않은 상태)
const activeFilter = ref(null);
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

const foods = ref([]);

// 한국어 카테고리명에 맞춘 아이콘 매핑 함수
const getCategoryIcon = (categoryName, keywords) => {
  // keywords에서 이모지 추출 시도
  if (keywords) {
    const emojiMatch = keywords.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu);
    if (emojiMatch && emojiMatch.length > 0) {
      return emojiMatch[0];
    }
  }

  if (!categoryName) return '🍽️';

  // 실제 데이터에 맞춘 매핑 (한국어 포함)
  const iconMap = {
    // 일반적인 카테고리명
    '카테고리': '📂',
    '기본': '📁',
    '전체': '🍽️',
    '기타': '🔖',

    // 음식 관련 (한국어)
    '한식': '🍚', '중식': '🥢', '일식': '🍣', '양식': '🍝',
    '분식': '🍜', '치킨': '🍗', '피자': '🍕', '햄버거': '🍔',
    '카페': '☕', '커피': '☕', '디저트': '🍰', '베이커리': '🍞',
    '간식': '🍫', '과자': '🍫', '음료': '🧋', '빵': '🍞',
    '면류': '🍜', '밥류': '🍚', '국물': '🍲',

    // 장소 관련
    '편의점': '🏪', '마트': '🛒', '백화점': '🏬', '온라인': '💻',
    '배달': '🛵', '포장': '📦', '매장': '🏪',

    // 특성 관련
    '인기': '🔥', '추천': '⭐', '신상': '🆕', '할인': '🏷️',
    '한정': '🎁', '이벤트': '🎉', '특가': '💸',

    // 자음/모음이 포함된 테스트 데이터 처리
    'ㅋㅋㅋ': '😄',
    'ㄴㅇㅁㄹ': '📝',
    'ㅇㄴㅁㄹ': '📄'
  };

  // 정확한 매칭 우선
  if (iconMap[categoryName]) {
    return iconMap[categoryName];
  }

  // 부분 매칭
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (categoryName.includes(keyword)) {
      return icon;
    }
  }

  // 기본 아이콘 (카테고리 성격에 따라)
  if (categoryName.length <= 3) {
    return '📂'; // 짧은 이름은 폴더 아이콘
  }

  return '🍽️'; // 기본값
};

// 카테고리 타입 결정 함수
const getCategoryType = (categoryName, keywords) => {
  if (!categoryName) return 'FOOD';

  // keywords나 categoryName에서 타입 추론
  const typeKeywords = {
    'TREND': ['신상', '트렌드', '인기', '핫', '화제', 'TV', '방송', '한정', '시즌'],
    'PLACE': ['편의점', '카페', '마트', '백화점', '온라인', '배달', '매장', '프랜차이즈'],
    'FOOD': ['한식', '중식', '일식', '양식', '분식', '치킨', '피자', '디저트', '간식', '음료', '빵'],
    'PRICE': ['저렴', '할인', '특가', '이벤트', '프로모션', '천원', '삼천원', '만원'],
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

  return 'FOOD'; // 기본값
};

// categoryKey 생성 함수 (한국어 지원 + 중복 방지)
const generateCategoryKey = (categoryName, categoryId = null) => {
  if (!categoryName) return `unknown_${categoryId || Date.now()}`;

  // 한국어, 영어, 숫자만 허용하고 나머지는 언더스코어로 변환
  let baseKey = categoryName
  .trim()
  .replace(/[^\w가-힣]/g, '_') // 한국어, 영어, 숫자, 언더스코어만 허용
  .replace(/_+/g, '_') // 연속된 언더스코어를 하나로
  .replace(/^_|_$/g, '') // 앞뒤 언더스코어 제거
  .toLowerCase();

  // categoryId가 있으면 고유성 보장을 위해 추가
  if (categoryId) {
    baseKey = `${baseKey}_${categoryId}`;
  }

  return baseKey || `category_${categoryId || Date.now()}`;
};

// 카테고리 로드 함수 (백엔드 데이터만 사용)
const fetchCategories = async () => {
  if (categoriesLoading.value) return;

  categoriesLoading.value = true;
  try {
    // 올바른 API 호출: getCategories() 사용
    const response = await contentService.getCategories();

    // 실제 백엔드 응답 구조: { success: true, data: [...] }
    const serverCategories = response.data?.data || response.data || [];

    console.log('🗂️ 서버에서 받은 카테고리 (/categories/list):', serverCategories);

    // 백엔드 응답을 Vue 컴포넌트 형식으로 변환 (중복 키 방지)
    const mappedServerCategories = serverCategories
    .filter(cat => cat.isActive === true) // 활성 카테고리만
    .map(cat => ({
      categoryId: cat.categoryId,
      categoryKey: generateCategoryKey(cat.categoryName, cat.categoryId), // categoryId 포함하여 고유성 보장
      categoryName: cat.categoryName, // SidebarSection에서 getFilterLabel()로 사용
      categoryIcon: getCategoryIcon(cat.categoryName, cat.keywords), // SidebarSection에서 getFilterIcon()로 사용
      categoryType: getCategoryType(cat.categoryName, cat.keywords), // 타입 결정
      parentId: null,
      displayOrder: cat.sortOrder, // 백엔드 sortOrder 그대로 사용
      isActive: cat.isActive,
      itemCount: 0, // TODO: 백엔드에서 실제 아이템 수를 제공하면 사용
      description: cat.description || '',
      keywords: cat.keywords || '',
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder); // sortOrder 기준 정렬

    console.log('🔄 매핑된 서버 카테고리:', mappedServerCategories);

    // 중복 키 체크
    const keys = mappedServerCategories.map(cat => cat.categoryKey);
    const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
    if (duplicateKeys.length > 0) {
      console.warn('⚠️ 중복된 카테고리 키 발견:', duplicateKeys);
      console.log('📋 전체 키 목록:', keys);
    }

    // 백엔드 카테고리만 사용 (기본 카테고리 제거)
    categories.value = mappedServerCategories;

    console.log('✅ 최종 카테고리 목록 (백엔드만):', categories.value);

  } catch (error) {
    console.error('🗂️ 카테고리 로딩 실패 (/categories/list):', error);
    console.error('📡 에러 상세:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // 실패 시 빈 배열로 설정 (기본 카테고리 사용 안 함)
    categories.value = [];
  } finally {
    categoriesLoading.value = false;
  }
};

// 현재 선택된 카테고리 정보 가져오기
const getCurrentCategory = () => {
  return categories.value.find(cat => cat.categoryKey === activeFilter.value) || null;
};

// 카테고리별 API 파라미터 생성 (null 처리 포함)
const getCategoryParams = (categoryKey) => {
  // null이나 빈 값이면 필터링 없이 전체 조회
  if (!categoryKey || categoryKey === null) {
    console.log('🔍 선택된 카테고리: 전체 (필터 없음)');
    return {};
  }

  const category = categories.value.find(cat => cat.categoryKey === categoryKey);
  if (!category) {
    console.log('🔍 선택된 카테고리: 찾을 수 없음 -', categoryKey);
    return {};
  }

  console.log('🔍 선택된 카테고리:', category);

  // 백엔드에서 관리하는 카테고리는 categoryId로 필터링
  if (category.categoryId) {
    return {
      categoryId: category.categoryId,
      // 추가적으로 categoryName도 함께 전송 (백엔드에서 참고용)
      categoryName: category.categoryName
    };
  }

  // 백엔드 카테고리만 사용하므로 기본 특수 카테고리 처리 제거
  return {};
};

// API 호출 함수 (목업 데이터 완전 제거)
const fetchFoods = async (page = 0, append = false) => {
  if (loading.value) return;

  // 무한 스크롤일 때만 로딩 표시
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
              sortBy.value === 'rating' ? 'rating,DESC' :
                  sortBy.value === 'price' ? 'price,ASC' : 'createdAt,DESC'
    };

    // 검색어가 있으면 추가
    if (searchQuery.value.trim()) {
      params.keyword = searchQuery.value.trim();
    }

    // 카테고리 파라미터 추가
    const categoryParams = getCategoryParams(activeFilter.value);
    Object.assign(params, categoryParams);

    console.log('📡 API 요청 파라미터:', params);

    const response = await contentService.getOneMouths(params);

    // 실제 백엔드 응답 구조에 맞춰 데이터 추출
    const apiData = response.data?.data || response.data;
    const contents = apiData?.content || apiData || [];

    // 페이지네이션 정보 추출
    const pagination = {
      number: apiData?.number || 0,
      totalElements: apiData?.totalElements || contents.length,
      last: apiData?.last !== false
    };

    console.log('📡 API 응답:', { contents: contents.length, pagination });

    // 데이터 변환 (실제 백엔드 데이터만 사용)
    const newFoods = contents.map(item => ({
      id: item.oneMouthId || item.id,
      name: item.title || item.name || '제목 없음',
      description: item.description || '',
      emoji: getEmojiByCategory(item.category),
      rating: item.rating || 0,
      reviewCount: item.hits || 0,
      location: item.location || '',
      trending: item.trending || false,
      selling: item.productStatus === 'FOR_SALE',
      price: item.price || 0,
      stock: item.stock || 0,
      category: item.category?.categoryName || '기타',
      categoryId: item.category?.categoryId,
      imageUrl: item.imageUrl || '',
      createdAt: item.createdAt || new Date().toISOString(),
      isLimited: item.isLimited || false
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
    currentPage.value = pagination.number;
    totalElements.value = pagination.totalElements;
    hasMore.value = !pagination.last;

    console.log(`📊 데이터 로드 완료: ${newFoods.length}개 아이템, 총 ${totalElements.value}개`);

  } catch (error) {
    console.error('🍽 음식 데이터 로딩 실패:', error);

    // 에러 발생 시 빈 배열로 설정 (목업 데이터 사용 안 함)
    if (!append) {
      foods.value = [];
      filteredFoods.value = [];
      totalElements.value = 0;
      hasMore.value = false;
      console.log('❌ API 실패: 빈 데이터로 설정');
    }
  } finally {
    loading.value = false;
    initialLoading.value = false;
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

// 클라이언트 사이드 필터링 함수 (기본 카테고리 제거로 단순화)
const applyClientSideFiltering = (foods) => {
  // 백엔드 카테고리만 사용하므로 특별한 클라이언트 필터링 불필요
  return foods;
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

// Methods (null 처리 포함)
const setActiveFilter = (filter) => {
  if (activeFilter.value === filter) return; // 동일한 필터면 무시

  console.log('🔄 필터 변경:', activeFilter.value, '->', filter);
  activeFilter.value = filter;
  // 필터 변경 시 API 다시 호출
  resetAndFetch();
};

const setSortBy = (newSortBy) => {
  if (sortBy.value === newSortBy) return; // 동일한 정렬이면 무시

  console.log('🔄 정렬 변경:', sortBy.value, '->', newSortBy);
  sortBy.value = newSortBy;
  resetAndFetch();
};

// 디바운스 타이머 저장용
let searchTimeout = null;

const updateSearchQuery = (query) => {
  console.log('🔍 검색어 변경:', searchQuery.value, '->', query);
  searchQuery.value = query;

  // 기존 타이머 제거
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // 디바운스를 위해 약간의 지연 후 API 다시 호출
  searchTimeout = setTimeout(() => {
    resetAndFetch();
  }, 300);
};

// 데이터 리셋 후 새로 가져오기 (무한 루프 방지)
const resetAndFetch = () => {
  // 이미 로딩 중이면 무시
  if (loading.value) return;

  currentPage.value = 0;
  foods.value = [];
  filteredFoods.value = [];
  hasMore.value = true;
  fetchFoods(0, false);
};

// ===== 상세페이지 이동 함수 수정 =====
const viewDetail = (food) => {
  console.log('🔗 상세페이지로 이동:', food.id, food.name);

  // Vue Router를 사용한 페이지 이동
  router.push({
    name: 'OneMouthDetail',
    params: { id: food.id }
  });
};

const requestShare = (food) => {
  alert(`${food.name} 한입 나눔을 요청했습니다!`);
};

const startChat = (food) => {
  // 로그인 체크
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  // 채팅 페이지로 이동
  router.push({
    name: 'Chat',
    query: {
      sellerId: food.sellerId || food.seller?.id,
      productId: food.id,
      productName: food.name
    }
  });
};

const addNewFood = () => {
  // 로그인 체크
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  // 새 음식 등록 페이지로 이동
  router.push('/one-mouth/create');
};

// Watchers (무한 루프 방지)
watch(sortBy, (newSortBy, oldSortBy) => {
  if (newSortBy !== oldSortBy) {
    console.log('🔄 정렬 변경:', oldSortBy, '->', newSortBy);
    resetAndFetch();
  }
});

// 카테고리 변경 감지 (무한 루프 방지)
watch(activeFilter, (newFilter, oldFilter) => {
  if (newFilter !== oldFilter) {
    console.log('👀 카테고리 변경 감지:', oldFilter, '->', newFilter);
  }
});

// Lifecycle (무한 루프 방지)
onMounted(() => {
  console.log('🚀 컴포넌트 마운트 시작');

  // 카테고리 먼저 로드 후 음식 데이터 로드
  fetchCategories().then(() => {
    console.log('✅ 카테고리 로드 완료, 음식 데이터 로드 시작');
    // 첫 번째 로드이므로 필터 없이 전체 데이터 로드
    fetchFoods();
  }).catch(error => {
    console.error('❌ 초기 로딩 실패:', error);
    // 카테고리 로드 실패해도 음식 데이터는 로드 시도
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