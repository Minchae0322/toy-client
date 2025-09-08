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
        :chat-error="chatError"
        @toggle-favorite="toggleFavorite"
        @start-chat="handleStartChat"
        @clear-chat-error="clearChatError"
    />

    <!-- 채팅 로딩 오버레이 -->
    <div v-if="chatLoading" class="chat-loading-overlay">
      <div class="chat-loading-content">
        <div class="spinner"></div>
        <p>채팅방을 준비하는 중...</p>
      </div>
    </div>

    <!-- 채팅 에러 모달 -->
    <div v-if="chatError" class="chat-error-modal" @click="clearChatError">
      <div class="chat-error-content" @click.stop>
        <h3>채팅 연결 실패</h3>
        <p>{{ chatError }}</p>
        <div class="error-actions">
          <button @click="clearChatError" class="cancel-btn">확인</button>
          <button @click="retryStartChat" class="retry-btn">다시 시도</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { contentService, tokenUtils, chatService } from '@/api/axios.js';
import { getChatErrorMessage, debugChatInfo } from '@/utils/chatUtils.js';

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
const chatError = ref('');

// 리뷰 페이지네이션
const reviewsPage = ref(0);
const reviewsHasMore = ref(true);

// URL에서 ID 추출
const foodId = computed(() => props.id || route.params.id);

// 현재 사용자 정보 안전하게 가져오기
const getCurrentUserId = () => {
  try {
    // 1. tokenUtils에서 시도
    const currentUser = tokenUtils.getCurrentUser();
    if (currentUser?.id) {
      console.log('tokenUtils에서 사용자 ID 가져옴:', currentUser.id);
      return currentUser.id;
    }

    // 2. 직접 토큰 파싱 시도
    const token = tokenUtils.getAccessToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub || payload.userId || payload.id || payload.user_id;
      if (userId) {
        console.log('직접 토큰 파싱에서 사용자 ID 가져옴:', userId);
        return userId;
      }
    }
  } catch (err) {
    console.error('사용자 ID 추출 중 오류:', err);
  }

  console.error('사용자 ID를 가져올 수 없음');
  return null;
};

// 현재 사용자 체크
const canStartChat = computed(() => {
  const currentUserId = getCurrentUserId();
  return currentUserId &&
      food.value?.sellerId &&
      String(currentUserId) !== String(food.value.sellerId) &&
      food.value.productStatus === 'FOR_SALE';
});

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

    // 디버깅 정보 출력
    debugChatInfo('상품 정보 로드 완료', {
      productId: food.value.id,
      sellerId: food.value.sellerId,
      currentUserId: getCurrentUserId(),
      canStartChat: canStartChat.value
    });

  } catch (err) {
    console.error('상세 정보 로드 실패:', err);
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

// 채팅하기 핸들러 - 기존 백엔드 API 스펙에 맞게 연동
const handleStartChat = async () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    console.error('현재 사용자 ID를 가져올 수 없습니다.');
    alert('사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
    router.push('/login');
    return;
  }

  if (!canStartChat.value) {
    if (String(currentUserId) === String(food.value.sellerId)) {
      alert('본인의 상품입니다.');
    } else if (food.value.productStatus !== 'FOR_SALE') {
      alert('현재 거래할 수 없는 상품입니다.');
    } else {
      alert('채팅을 시작할 수 없습니다.');
    }
    return;
  }

  try {
    chatLoading.value = true;
    chatError.value = '';

    debugChatInfo('채팅 시작 요청', {
      productId: food.value.id,
      sellerId: food.value.sellerId,
      currentUserId: currentUserId
    });

    // 백엔드 채팅 시작 API 호출 (기존 API 스펙에 맞게)
    const chatStartRequest = {
      chatContext: 'PRODUCT_TRADE',
      chatContextId: Number(food.value.id),
      creatorId: Number(food.value.id),
      participantIds: [
        Number(currentUserId),
        Number(food.value.sellerId)
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

    // 채팅방으로 이동 (상품 정보 포함)
    const chatQuery = {
      from: 'product',
      productId: food.value.id,
      productName: food.value.name,
      sellerId: food.value.sellerId,
      sellerName: food.value.seller.name,
      productPrice: food.value.price,
      productImage: food.value.imageUrl,
      productStatus: food.value.productStatus
    };

    await router.push({
      name: 'ChatWithRoom',
      params: { roomId: chatRoomData.roomId },
      query: chatQuery
    });

    console.log('채팅방으로 이동 완료:', chatRoomData.roomId);

  } catch (error) {
    console.error('채팅 시작 실패:', error);
    chatError.value = getChatErrorMessage(error);
  } finally {
    chatLoading.value = false;
  }
};

// 채팅 재시도
const retryStartChat = () => {
  clearChatError();
  handleStartChat();
};

// 채팅 에러 제거
const clearChatError = () => {
  chatError.value = '';
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

// 개발용 디버깅
if (import.meta.env.DEV) {
  window.debugOneMouthDetail = {
    food,
    canStartChat,
    handleStartChat,
    getCurrentUserId,
    chatLoading,
    chatError
  };
}
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background: #FFFFFF;
  padding-bottom: env(safe-area-inset-bottom);
  position: relative;
}

.main-content {
  padding: 0;
  max-width: 600px;
  margin: 0 auto;
}

/* 채팅 로딩 오버레이 */
.chat-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.chat-loading-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.chat-loading-content p {
  margin: 0;
  color: #374151;
  font-size: 16px;
}

/* 채팅 에러 모달 */
.chat-error-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.chat-error-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.chat-error-content h3 {
  margin: 0 0 12px 0;
  color: #dc2626;
  font-size: 18px;
  font-weight: 600;
}

.chat-error-content p {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn,
.retry-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.retry-btn {
  background: #3b82f6;
  color: white;
}

.retry-btn:hover {
  background: #2563eb;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-loading-content {
    margin: 20px;
    padding: 24px;
  }

  .chat-error-content {
    margin: 20px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .detail-container {
    background: #1f2937;
  }

  .chat-loading-content,
  .chat-error-content {
    background: #374151;
    color: #f9fafb;
  }

  .chat-error-content h3 {
    color: #fca5a5;
  }

  .spinner {
    border-color: #4b5563;
    border-top-color: #60a5fa;
  }

  .cancel-btn {
    background: #4b5563;
    color: #f9fafb;
  }

  .cancel-btn:hover {
    background: #6b7280;
  }
}
</style>