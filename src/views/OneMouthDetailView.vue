<template>
  <div class="detail-container">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>음식 정보를 불러오는 중...</p>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <h2>😵 오류가 발생했습니다</h2>
        <p>{{ error }}</p>
        <button @click="goBack" class="go-back-btn">목록으로 돌아가기</button>
        <button @click="retryLoad" class="retry-btn">다시 시도</button>
      </div>
    </div>

    <!-- 정상 데이터 표시 -->
    <div v-else-if="food">
      <FoodOverviewCard
          :food="food"
          :isLiked="isLiked"
          @go-back="goBack"
          @toggle-like="toggleLike"
          @share-food="shareFood"
      />

      <SellerCard
          :seller="food.seller"
          @view-profile="viewSellerProfile"
      />

      <FoodDetailsCard
          :food="food"
          @get-category-name="getCategoryName"
      />

      <ReviewsCard
          :reviews="reviews"
          :loading="reviewsLoading"
          @write-review="writeReview"
          @load-more-reviews="loadMoreReviews"
      />

      <BottomActions
          v-if="food.selling"
          :food="food"
          @start-chat="startChat"
          @request-share="requestShare"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { contentService, tokenUtils } from '@/api/axios.js';
import FoodOverviewCard from '@/components/oneMouth/detail/FoodOverviewCard.vue';
import SellerCard from '@/components/oneMouth/detail/SellerCard.vue';
import FoodDetailsCard from '@/components/oneMouth/detail/FoodDetailsCard.vue';
import ReviewsCard from '@/components/oneMouth/detail/ReviewsCard.vue';
import BottomActions from '@/components/oneMouth/detail/BottomActions.vue';

// 라우터 관련
const route = useRoute();
const router = useRouter();

// Props (라우터 파라미터)
const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
});

// 반응형 데이터
const food = ref(null);
const reviews = ref([]);
const loading = ref(true);
const reviewsLoading = ref(false);
const error = ref(null);
const isLiked = ref(false);
const isFavorited = ref(false);

// 리뷰 페이지네이션
const reviewsPage = ref(0);
const reviewsHasMore = ref(true);

// URL에서 ID 추출
const foodId = computed(() => props.id || route.params.id);

// 음식 상세 정보 로드
const fetchFoodDetail = async (id) => {
  try {
    loading.value = true;
    error.value = null;

    console.log('🍽️ 상세 정보 로딩 시작:', id);

    // 백엔드 API 호출
    const response = await contentService.getOneMouthDetail(id);
    const apiData = response.data?.data || response.data;

    console.log('📡 상세 정보 응답:', apiData);

    if (!apiData) {
      throw new Error('상품 정보를 찾을 수 없습니다.');
    }

    // 백엔드 데이터를 프론트엔드 형식으로 변환
    food.value = {
      id: apiData.oneMouthId || apiData.id,
      name: apiData.title || '제목 없음',
      description: apiData.description || '',
      emoji: getEmojiByCategory(apiData.category),
      rating: apiData.rating || 0,
      reviewCount: apiData.hits || 0,
      location: apiData.location || '',
      trending: apiData.trending || false,
      selling: apiData.productStatus === 'FOR_SALE',
      price: apiData.price || 0,
      stock: apiData.stock || 0,
      category: apiData.category?.categoryName || '기타',
      categoryId: apiData.category?.categoryId,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      expiryDate: apiData.expiryDate,
      condition: apiData.condition || '새 상품',
      quantity: apiData.quantity,
      unit: apiData.unit,
      productType: apiData.productType,
      productStatus: apiData.productStatus,
      imageUrl: apiData.imageUrl || '',
      attachments: apiData.oneMouthAttachmentFiles || [],

      // 판매자 정보
      sellerId: apiData.sellerId,
      seller: {
        id: apiData.sellerId,
        name: apiData.sellerName || `판매자${apiData.sellerId}`,
        rating: apiData.sellerRating || 4.5,
        reviewCount: apiData.sellerReviewCount || 0,
        profileImage: apiData.sellerProfileImage || ''
      },

      // 상품 상태 정보
      hits: apiData.hits || 0,
      favoritesCount: apiData.favoritesCount || 0
    };

    // 로그인된 사용자의 좋아요/관심 상태 확인
    if (tokenUtils.isLoggedIn()) {
      await Promise.all([
        checkLikeStatus(),
        checkFavoriteStatus()
      ]);
    }

    // 리뷰 데이터 로드
    await fetchReviews();

    console.log('✅ 상세 정보 로드 완료:', food.value);

  } catch (err) {
    console.error('❌ 상세 정보 로드 실패:', err);

    if (err.response?.status === 404) {
      error.value = '존재하지 않는 상품입니다.';
    } else if (err.response?.status === 403) {
      error.value = '접근 권한이 없습니다.';
    } else {
      error.value = `음식 정보를 불러올 수 없습니다. (${err.message})`;
    }
  } finally {
    loading.value = false;
  }
};

// 좋아요 상태 확인
const checkLikeStatus = async () => {
  try {
    // 실제 API가 있다면 사용
    // const response = await contentService.checkLikeStatus(foodId.value, 'one-mouths');
    // isLiked.value = response.data.isLiked;

    // 임시로 로컬 스토리지 확인
    const likedItems = JSON.parse(localStorage.getItem('liked_items') || '[]');
    isLiked.value = likedItems.includes(String(foodId.value));

  } catch (err) {
    console.error('좋아요 상태 확인 실패:', err);
  }
};

// 관심 상태 확인
const checkFavoriteStatus = async () => {
  try {
    // 실제 API가 있다면 사용
    // const response = await contentService.checkFavoriteStatus(foodId.value, 'one-mouths');
    // isFavorited.value = response.data.isFavorited;

    // 임시로 로컬 스토리지 확인
    const favoritedItems = JSON.parse(localStorage.getItem('favorited_items') || '[]');
    isFavorited.value = favoritedItems.includes(String(foodId.value));

  } catch (err) {
    console.error('관심 상태 확인 실패:', err);
  }
};

// 리뷰 데이터 로드
const fetchReviews = async (page = 0, append = false) => {
  try {
    if (append) {
      reviewsLoading.value = true;
    }

    // 실제 리뷰 API가 있다면 사용
    // const response = await contentService.getComments(foodId.value, 'one-mouths', {
    //   page: page,
    //   size: 10,
    //   sort: 'createdAt,DESC'
    // });

    // 임시 목업 데이터
    const mockReviews = [
      {
        id: 1,
        userName: '맛집탐험가',
        userProfileImage: '',
        rating: 5,
        content: '정말 맛있어요! 초콜릿이 진짜 진하고 달달해서 기분이 좋아졌어요 ☺️',
        createdAt: '2024-12-08T10:30:00',
        images: []
      },
      {
        id: 2,
        userName: '간식매니아',
        userProfileImage: '',
        rating: 4,
        content: '가격도 저렴하고 맛도 좋네요. 다음에 또 사고싶어요!',
        createdAt: '2024-12-07T15:45:00',
        images: []
      },
      {
        id: 3,
        userName: '초코홀릭',
        userProfileImage: '',
        rating: 5,
        content: '초콜릿 좋아하는 사람이라면 꼭 먹어봐야 할 맛! 추천합니다 👍',
        createdAt: '2024-12-06T20:15:00',
        images: []
      }
    ];

    if (append) {
      reviews.value = [...reviews.value, ...mockReviews];
    } else {
      reviews.value = mockReviews;
    }

    // 페이지네이션 정보 업데이트
    reviewsPage.value = page;
    reviewsHasMore.value = page < 2; // 임시로 3페이지까지만

  } catch (err) {
    console.error('리뷰 로드 실패:', err);
  } finally {
    reviewsLoading.value = false;
  }
};

// 더 많은 리뷰 로드
const loadMoreReviews = async () => {
  if (!reviewsHasMore.value || reviewsLoading.value) return;

  const nextPage = reviewsPage.value + 1;
  await fetchReviews(nextPage, true);
};

// 카테고리별 이모지 반환
const getEmojiByCategory = (category) => {
  if (!category) return '🍽️';

  const categoryName = typeof category === 'string' ? category : category.categoryName;
  const emojiMap = {
    '편의점': '🏪', '카페': '☕', '간식': '🍫', '음료': '🧋',
    '디저트': '🍰', '빵': '🍞', '분식': '🍜', '한식': '🍚',
    '중식': '🥢', '일식': '🍣', '양식': '🍝', '치킨': '🍗',
    '피자': '🍕', '햄버거': '🍔', '베이커리': '🍞', '과자': '🍫'
  };
  return emojiMap[categoryName] || '🍽️';
};

// 재시도
const retryLoad = () => {
  fetchFoodDetail(foodId.value);
};

// 이벤트 핸들러들
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/one-mouth');
  }
};

const toggleLike = async () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  try {
    if (isLiked.value) {
      // 좋아요 취소
      // await contentService.unlikeContent(foodId.value, 'one-mouths');

      // 임시로 로컬 스토리지에서 제거
      const likedItems = JSON.parse(localStorage.getItem('liked_items') || '[]');
      const updatedItems = likedItems.filter(id => id !== String(foodId.value));
      localStorage.setItem('liked_items', JSON.stringify(updatedItems));

      isLiked.value = false;
      console.log('좋아요 취소됨');

    } else {
      // 좋아요 추가
      // await contentService.likeContent(foodId.value, 'one-mouths');

      // 임시로 로컬 스토리지에 추가
      const likedItems = JSON.parse(localStorage.getItem('liked_items') || '[]');
      likedItems.push(String(foodId.value));
      localStorage.setItem('liked_items', JSON.stringify(likedItems));

      isLiked.value = true;
      console.log('좋아요 추가됨');
    }

  } catch (err) {
    console.error('좋아요 처리 실패:', err);
    alert('좋아요 처리에 실패했습니다.');
  }
};

const shareFood = () => {
  const shareData = {
    title: food.value.name,
    text: food.value.description,
    url: window.location.href
  };

  if (navigator.share && navigator.canShare(shareData)) {
    navigator.share(shareData).catch(err => {
      console.error('공유 실패:', err);
    });
  } else {
    // 폴백: 클립보드에 복사
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('링크가 클립보드에 복사되었습니다!');
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
      alert('공유 링크: ' + window.location.href);
    });
  }
};

const viewSellerProfile = () => {
  if (food.value?.seller?.id) {
    router.push(`/users/${food.value.seller.id}`);
  } else {
    alert('판매자 정보를 찾을 수 없습니다.');
  }
};

const startChat = () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  // 본인 상품인지 확인
  const currentUser = tokenUtils.getCurrentUser();
  if (currentUser && String(currentUser.id) === String(food.value.sellerId)) {
    alert('본인의 상품입니다.');
    return;
  }

  // 채팅 페이지로 이동
  router.push({
    name: 'Chat',
    query: {
      sellerId: food.value.sellerId,
      productId: foodId.value,
      productName: food.value.name
    }
  });
};

const requestShare = () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  // 본인 상품인지 확인
  const currentUser = tokenUtils.getCurrentUser();
  if (currentUser && String(currentUser.id) === String(food.value.sellerId)) {
    alert('본인의 상품입니다.');
    return;
  }

  // 나눔 요청 처리 (실제 API 호출)
  alert(`${food.value.name} 한입 나눔을 요청했습니다!`);
};

const writeReview = () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  // 리뷰 작성 페이지로 이동
  router.push(`/one-mouth/${foodId.value}/review`);
};

const getCategoryName = (category) => {
  const categories = {
    '간식': '🥟 간식',
    '음료': '🧋 음료',
    '디저트': '🍰 디저트',
    '편의점': '🏪 편의점',
    '카페': '☕ 카페',
    '한식': '🍚 한식',
    '중식': '🥢 중식',
    '일식': '🍣 일식',
    '양식': '🍝 양식'
  };
  return categories[category] || '🍽️ 기타';
};

// 라이프사이클
onMounted(() => {
  console.log('🚀 상세페이지 마운트, ID:', foodId.value);
  fetchFoodDetail(foodId.value);
});

// URL 파라미터 변경 감지 (같은 컴포넌트에서 다른 상품으로 이동할 때)
watch(() => route.params.id, (newId) => {
  if (newId && newId !== foodId.value) {
    console.log('🔄 상품 ID 변경:', foodId.value, '->', newId);
    fetchFoodDetail(newId);
  }
}, { immediate: false });

// 페이지 제목 업데이트
watch(food, (newFood) => {
  if (newFood) {
    document.title = `${newFood.name} - 한입거리`;
  }
}, { immediate: true });
</script>

<style scoped>
.detail-container {
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
  padding: 20px 20px 120px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-spinner {
  text-align: center;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.error-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.error-card h2 {
  color: #e74c3c;
  margin-bottom: 16px;
  font-size: 1.5em;
}

.error-card p {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.go-back-btn,
.retry-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin: 0 8px;
  font-size: 14px;
  transition: background 0.2s;
}

.go-back-btn:hover,
.retry-btn:hover {
  background: #2980b9;
}

.retry-btn {
  background: #27ae60;
}

.retry-btn:hover {
  background: #219a52;
}

@media (max-width: 768px) {
  .detail-container {
    padding: 16px 16px 100px;
  }

  .error-card {
    margin: 16px;
    padding: 24px;
  }

  .go-back-btn,
  .retry-btn {
    display: block;
    width: 100%;
    margin: 8px 0;
  }
}
</style>