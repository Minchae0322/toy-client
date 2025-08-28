<template>
  <div class="detail-container">
    <!-- 로딩 상태 -->
    <LoadingState v-if="loading" />

    <!-- 에러 상태 -->
    <ErrorState
        v-else-if="error"
        :error="error"
        @retry="retryLoad"
        @go-back="goBack"
    />

    <!-- 정상 데이터 표시 -->
    <div v-else-if="food" class="content-wrapper">
      <!-- 헤더 -->
      <ProductHeader
          :is-liked="isLiked"
          @go-back="goBack"
          @share="shareFood"
          @toggle-like="toggleLike"
      />

      <!-- 이미지 섹션 -->
      <ProductImageSection
          :food="food"
          @image-error="handleImageError"
      />

      <!-- 메인 정보 섹션 -->
      <div class="main-content">
        <!-- 기본 정보 -->
        <ProductInfoSection :food="food" />

        <!-- 판매자 정보 -->
        <SellerInfoSection
            :food="food"
            @view-profile="viewSellerProfile"
        />

        <!-- 상품 설명 -->
        <ProductDescriptionSection :food="food" />

        <!-- 리뷰 섹션 -->
        <ReviewSection
            :reviews="reviews"
            :reviews-loading="reviewsLoading"
            :reviews-has-more="reviewsHasMore"
            @write-review="writeReview"
            @load-more="loadMoreReviews"
        />
      </div>
    </div>

    <!-- 하단 고정 액션 버튼 -->
    <BottomActionBar
        v-if="food && food.productStatus === 'FOR_SALE'"
        :food="food"
        :is-favorited="isFavorited"
        :chat-loading="chatLoading"
        @toggle-favorite="toggleFavorite"
        @start-chat="handleStartChat"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { contentService, tokenUtils, chatService } from '@/api/axios.js';

// 컴포넌트 imports
import LoadingState from '@/components/oneMouth/detail/LoadingState.vue';
import ErrorState from '@/components/oneMouth/detail/ErrorState.vue';
import ProductHeader from '@/components/oneMouth/detail/ProductHeader.vue';
import ProductImageSection from '@/components/oneMouth/detail/ProductImageSection.vue';
import ProductInfoSection from '@/components/oneMouth/detail/ProductInfoSection.vue';
import SellerInfoSection from '@/components/oneMouth/detail/SellerInfoSection.vue';
import ProductDescriptionSection from '@/components/oneMouth/detail/ProductDescriptionSection.vue';
import ReviewSection from '@/components/oneMouth/detail/ReviewSection.vue';
import BottomActionBar from '@/components/oneMouth/detail/BottomActionBar.vue';

// 라우터 관련
const route = useRoute();
const router = useRouter();

// Props
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
const processing = ref(false);
const chatLoading = ref(false);

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

    const response = await contentService.getOneMouthDetail(id);
    const apiData = response.data?.data || response.data;

    if (!apiData) {
      throw new Error('상품 정보를 찾을 수 없습니다.');
    }

    const productStatusValue = apiData.productStatus?.title || apiData.productStatus || 'FOR_SALE';

    food.value = {
      id: apiData.oneMouthId,
      name: apiData.title || '제목 없음',
      description: apiData.description || '',
      price: apiData.price || 0,
      location: apiData.location || '',
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      quantity: apiData.quantity,
      unit: apiData.unit?.title || apiData.unit?.description || '개',
      productType: apiData.productType,
      productStatus: productStatusValue,
      productStatusObj: apiData.productStatus,
      imageUrl: apiData.thumbnailUrl || '',
      attachments: apiData.oneMouthAttachmentFiles || [],
      sellerId: apiData.sellerId,
      seller: {
        id: apiData.sellerId,
        name: `판매자${apiData.sellerId}`,
        rating: 4.5,
        reviewCount: 0,
        profileImage: ''
      },
      hits: apiData.hits || 0,
      favoritesCount: apiData.favoritesCount || 0,
      isUserFavorited: apiData.isUserFavorited || false
    };

    if (tokenUtils.isLoggedIn()) {
      await Promise.all([
        checkLikeStatus(),
        checkFavoriteStatus()
      ]);
    }

    // 관심 상품 상태를 API 응답에서 가져옴
    if (apiData.isUserFavorited !== undefined) {
      isFavorited.value = apiData.isUserFavorited;
    }

    await fetchReviews();

  } catch (err) {
    console.error('❌ 상세 정보 로드 실패:', err);
    error.value = err.response?.status === 404 ? '존재하지 않는 상품입니다.' : '상품 정보를 불러올 수 없습니다.';
  } finally {
    loading.value = false;
  }
};

// 좋아요 상태 확인
const checkLikeStatus = async () => {
  try {
    const likedItems = JSON.parse(localStorage.getItem('liked_items') || '[]');
    isLiked.value = likedItems.includes(String(foodId.value));
  } catch (err) {
    console.error('좋아요 상태 확인 실패:', err);
  }
};

// 관심 상태 확인
const checkFavoriteStatus = async () => {
  try {
    const favoritedItems = JSON.parse(localStorage.getItem('favorited_items') || '[]');
    isFavorited.value = favoritedItems.includes(String(foodId.value));
  } catch (err) {
    console.error('관심 상태 확인 실패:', err);
  }
};

// 리뷰 데이터 로드
const fetchReviews = async (page = 0, append = false) => {
  try {
    if (append) reviewsLoading.value = true;

    const mockReviews = [
      {
        id: 1,
        userName: '맛집탐험가',
        userProfileImage: '',
        rating: 5,
        content: '정말 맛있어요! 초콜릿이 진짜 진하고 달달해서 기분이 좋아졌어요',
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
      }
    ];

    if (append) {
      reviews.value = [...reviews.value, ...mockReviews];
    } else {
      reviews.value = mockReviews;
    }

    reviewsPage.value = page;
    reviewsHasMore.value = page < 2;

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

// 재시도
const retryLoad = () => {
  fetchFoodDetail(foodId.value);
};

// 이벤트 핸들러들
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/one-mouth/list');
  }
};

// 좋아요 토글
const toggleLike = async () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  try {
    const likedItems = JSON.parse(localStorage.getItem('liked_items') || '[]');
    if (isLiked.value) {
      const updatedItems = likedItems.filter(id => id !== String(foodId.value));
      localStorage.setItem('liked_items', JSON.stringify(updatedItems));
    } else {
      likedItems.push(String(foodId.value));
      localStorage.setItem('liked_items', JSON.stringify(likedItems));
    }
    isLiked.value = !isLiked.value;
  } catch (err) {
    console.error('좋아요 처리 실패:', err);
  }
};

// 관심 상품 토글
const toggleFavorite = async () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  try {
    processing.value = true;

    // API를 통한 관심 상품 토글
    if (isFavorited.value) {
      await contentService.removeOneMouthFavorite(foodId.value);
    } else {
      await contentService.toggleOneMouthFavorite(foodId.value);
    }

    // 로컬 상태 업데이트
    isFavorited.value = !isFavorited.value;

    // 관심수 업데이트
    if (food.value) {
      food.value.favoritesCount += isFavorited.value ? 1 : -1;
    }

  } catch (err) {
    console.error('관심 상품 처리 실패:', err);
    alert('관심 상품 처리에 실패했습니다.');
  } finally {
    processing.value = false;
  }
};

// 채팅하기 핸들러
const handleStartChat = async () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  const currentUser = tokenUtils.getCurrentUser();
  if (currentUser && String(currentUser.id) === String(food.value.sellerId)) {
    alert('본인의 상품입니다.');
    return;
  }

  try {
    chatLoading.value = true;

    // 백엔드 채팅 시작 API 호출
    const chatStartRequest = {
      chatContext: 'PRODUCT_TRADE', // ChatContext.PRODUCT_TRADE 사용
      chatContextId: Number(food.value.id), // 상품 ID - Long 타입으로 변환
      creatorId: Number(food.value.sellerId), // 판매자 ID (컨텍스트 생성자) - Long 타입으로 변환
      participantIds: [
        Number(currentUser.id), // 현재 사용자 (구매자) - Long 타입으로 변환
        Number(food.value.sellerId) // 판매자 - Long 타입으로 변환
      ],
      deviceId: tokenUtils.getDeviceId() || 'web-browser'
    };

    console.log('채팅 시작 요청:', chatStartRequest);

    const response = await chatService.startChat(chatStartRequest);
    const chatRoomData = response.data?.data || response.data;

    console.log('채팅방 생성/조회 완료:', chatRoomData);

    if (!chatRoomData?.roomId) {
      throw new Error('채팅방 정보가 올바르지 않습니다.');
    }

    // 채팅 페이지로 이동 (roomId 전달)
    await router.push({
      name: 'ChatRoom',
      params: { roomId: chatRoomData.roomId },
      query: {
        from: 'product',
        productId: food.value.id,
        productName: food.value.name
      }
    });

  } catch (error) {
    console.error('채팅 시작 실패:', error);

    let errorMessage = '채팅 연결에 실패했습니다.';
    if (error.response?.status === 404) {
      errorMessage = '상품 정보를 찾을 수 없습니다.';
    } else if (error.response?.status === 403) {
      errorMessage = '채팅 권한이 없습니다.';
    } else if (error.response?.status >= 500) {
      errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    alert(errorMessage);
  } finally {
    chatLoading.value = false;
  }
};

const writeReview = () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }
  router.push(`/one-mouth/${foodId.value}/review`);
};

const shareFood = () => {
  const shareData = {
    title: food.value.name,
    text: food.value.description,
    url: window.location.href
  };

  if (navigator.share && navigator.canShare(shareData)) {
    navigator.share(shareData).catch(err => console.error('공유 실패:', err));
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('링크가 복사되었습니다');
    });
  }
};

const viewSellerProfile = () => {
  if (food.value?.seller?.id) {
    router.push(`/users/${food.value.seller.id}`);
  }
};

const handleImageError = (e) => {
  e.target.style.display = 'none';
  e.target.parentElement.classList.add('no-image');
};

// 라이프사이클
onMounted(() => {
  fetchFoodDetail(foodId.value);
});

// URL 파라미터 변경 감지
watch(() => route.params.id, (newId) => {
  if (newId && newId !== foodId.value) {
    fetchFoodDetail(newId);
  }
});

// 페이지 제목 업데이트
watch(food, (newFood) => {
  if (newFood) {
    document.title = `${newFood.name} - 한입거리`;
  }
});
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background: #FFFFFF;
  padding-bottom: env(safe-area-inset-bottom);
}

.main-content {
  padding: 0;
  max-width: 600px;
  margin: 0 auto;
}
</style>