<template>
  <div class="detail-container">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <div class="skeleton-header"></div>
        <div class="skeleton-image"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3>일시적인 문제가 발생했어요</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="retryLoad" class="btn-retry">
            <span>다시 시도</span>
          </button>
          <button @click="goBack" class="btn-back">
            <span>돌아가기</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 정상 데이터 표시 -->
    <div v-else-if="food" class="content-wrapper">
      <!-- 커스텀 헤더 -->
      <header class="detail-header">
        <button @click="goBack" class="header-btn">
          <ChevronLeft :size="24" />
        </button>
        <div class="header-actions">
          <button @click="shareFood" class="header-btn">
            <Share2 :size="20" />
          </button>
          <button @click="toggleLike" class="header-btn">
            <Heart :size="20" :fill="isLiked ? '#FF6B6B' : 'none'" :stroke="isLiked ? '#FF6B6B' : 'currentColor'" />
          </button>
        </div>
      </header>

      <!-- 이미지 섹션 -->
      <div class="image-section">
        <div class="image-wrapper">
          <img
              v-if="food.imageUrl"
              :src="food.imageUrl"
              :alt="food.name"
              @error="handleImageError"
          />
          <div v-else class="image-placeholder">
            <Camera :size="48" />
          </div>

          <!-- 상태 뱃지 -->
          <div v-if="!food.selling" class="status-badge sold-out">
            거래완료
          </div>

          <!-- 이미지 인디케이터 -->
          <div v-if="food.attachments && food.attachments.length > 1" class="image-indicator">
            <span>1 / {{ food.attachments.length }}</span>
          </div>
        </div>
      </div>

      <!-- 메인 정보 섹션 -->
      <div class="main-content">
        <!-- 기본 정보 -->
        <section class="info-section">
          <div class="category-tag">{{ getCategoryName(food.category) }}</div>
          <h1 class="product-title">{{ food.name }}</h1>
          <div class="price-row">
            <span class="price">{{ formatPrice(food.price) }}</span>
            <span v-if="food.price > 0" class="price-badge">무료나눔</span>
          </div>

          <!-- 상품 메타 정보 -->
          <div class="meta-info">
            <div class="meta-item">
              <Clock :size="14" />
              <span>{{ formatRelativeTime(food.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <Eye :size="14" />
              <span>조회 {{ food.hits || 0 }}</span>
            </div>
            <div class="meta-item">
              <Heart :size="14" />
              <span>관심 {{ food.favoritesCount || 0 }}</span>
            </div>
          </div>
        </section>

        <!-- 판매자 정보 -->
        <section class="seller-section" @click="viewSellerProfile">
          <div class="seller-profile">
            <div class="seller-avatar">
              <img v-if="food.seller.profileImage" :src="food.seller.profileImage" :alt="food.seller.name" />
              <User v-else :size="24" />
            </div>
            <div class="seller-info">
              <h3 class="seller-name">{{ food.seller.name }}</h3>
              <div class="seller-location">
                <MapPin :size="12" />
                <span>{{ food.location || '서울시 강남구' }}</span>
              </div>
            </div>
          </div>
          <div class="seller-stats">
            <div class="trust-score">
              <span class="score-value">{{ food.seller.rating || 4.5 }}</span>
              <span class="score-label">신뢰지수</span>
            </div>
            <ChevronRight :size="20" class="arrow-icon" />
          </div>
        </section>

        <!-- 상품 설명 -->
        <section class="description-section">
          <h2 class="section-title">상품 정보</h2>
          <p class="description-text">{{ food.description || '상품 설명이 없습니다.' }}</p>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">상태</span>
              <span class="detail-value">{{ food.condition || '새 상품' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">수량</span>
              <span class="detail-value">{{ food.quantity || 1 }}{{ food.unit || '개' }}</span>
            </div>
            <div class="detail-item" v-if="food.expiryDate">
              <span class="detail-label">유통기한</span>
              <span class="detail-value">{{ formatDate(food.expiryDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">거래방법</span>
              <span class="detail-value">직거래</span>
            </div>
          </div>
        </section>

        <!-- 리뷰 섹션 -->
        <section class="reviews-section">
          <div class="section-header">
            <h2 class="section-title">
              리뷰
              <span class="review-count">{{ reviews.length }}</span>
            </h2>
            <button @click="writeReview" class="write-review-btn">
              리뷰 작성
            </button>
          </div>

          <div v-if="reviews.length > 0" class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="reviewer-avatar">
                    <img v-if="review.userProfileImage" :src="review.userProfileImage" :alt="review.userName" />
                    <User v-else :size="16" />
                  </div>
                  <span class="reviewer-name">{{ review.userName }}</span>
                </div>
                <div class="review-rating">
                  <Star v-for="i in 5" :key="i" :size="14" :fill="i <= review.rating ? '#FFB800' : 'none'" stroke="#FFB800" />
                </div>
              </div>
              <p class="review-content">{{ review.content }}</p>
              <span class="review-date">{{ formatRelativeTime(review.createdAt) }}</span>
            </div>
          </div>

          <div v-else class="empty-reviews">
            <MessageSquare :size="48" />
            <p>아직 리뷰가 없어요</p>
            <span>첫 번째 리뷰를 남겨보세요!</span>
          </div>

          <button v-if="reviewsHasMore" @click="loadMoreReviews" class="load-more-btn" :disabled="reviewsLoading">
            {{ reviewsLoading ? '로딩 중...' : '더 보기' }}
          </button>
        </section>

        <!-- 추천 상품 (선택적) -->
        <section class="recommend-section">
          <h2 class="section-title">이런 상품은 어때요?</h2>
          <div class="recommend-grid">
            <!-- 추천 상품 카드들 -->
          </div>
        </section>
      </div>
    </div>

    <!-- 하단 고정 액션 버튼 -->
    <div v-if="food && food.selling" class="bottom-bar">
      <button @click="toggleFavorite" class="action-icon-btn" :class="{ active: isFavorited }">
        <Heart :size="24" :fill="isFavorited ? '#FF6B6B' : 'none'" :stroke="isFavorited ? '#FF6B6B' : '#8B95A1'" />
      </button>

      <div class="action-price">
        <span class="price-label">가격</span>
        <span class="price-value">{{ formatPrice(food.price) }}</span>
      </div>

      <button @click="handleStartChat" class="chat-btn" :disabled="chatLoading">
        <span v-if="!chatLoading">채팅으로 거래하기</span>
        <span v-else>연결 중...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Heart, Share2, MessageCircle, ChevronLeft, ChevronRight,
  MapPin, Clock, Eye, Star, User, Camera, MessageSquare
} from 'lucide-vue-next';
import { contentService, tokenUtils, chatService } from '@/api/axios.js';
import { chatNavigation } from '@/router/index.js';

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
    const isForSale = productStatusValue === 'FOR_SALE';

    food.value = {
      id: apiData.oneMouthId || apiData.id,
      name: apiData.title || '제목 없음',
      description: apiData.description || '',
      emoji: getEmojiByCategory(apiData.category),
      rating: apiData.rating || 0,
      reviewCount: apiData.hits || 0,
      location: apiData.location || '',
      trending: apiData.trending || false,
      selling: isForSale,
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
      productStatus: productStatusValue,
      productStatusObj: apiData.productStatus,
      imageUrl: apiData.imageUrl || '',
      attachments: apiData.oneMouthAttachmentFiles || [],
      sellerId: apiData.sellerId,
      seller: {
        id: apiData.sellerId,
        name: apiData.sellerName || `판매자${apiData.sellerId}`,
        rating: apiData.sellerRating || 4.5,
        reviewCount: apiData.sellerReviewCount || 0,
        profileImage: apiData.sellerProfileImage || ''
      },
      hits: apiData.hits || 0,
      favoritesCount: apiData.favoritesCount || 0
    };

    if (tokenUtils.isLoggedIn()) {
      await Promise.all([
        checkLikeStatus(),
        checkFavoriteStatus()
      ]);
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
    const favoritedItems = JSON.parse(localStorage.getItem('favorited_items') || '[]');
    if (isFavorited.value) {
      const updatedItems = favoritedItems.filter(id => id !== String(foodId.value));
      localStorage.setItem('favorited_items', JSON.stringify(updatedItems));
    } else {
      favoritedItems.push(String(foodId.value));
      localStorage.setItem('favorited_items', JSON.stringify(favoritedItems));
    }
    isFavorited.value = !isFavorited.value;
  } catch (err) {
    console.error('관심 상품 처리 실패:', err);
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
    const existingRoom = await findExistingChatRoom(currentUser.id, food.value.sellerId);

    if (existingRoom) {
      chatNavigation.toChatRoom(existingRoom.id);
    } else {
      const newRoom = await createDirectChatRoom(currentUser.id, food.value.sellerId, food.value);
      chatNavigation.toChatRoom(newRoom.id);
    }
  } catch (error) {
    console.error('❌ 채팅방 처리 실패:', error);
    alert('채팅방 연결에 실패했습니다.');
  } finally {
    chatLoading.value = false;
  }
};

const findExistingChatRoom = async (buyerId, sellerId) => {
  try {
    const response = await chatService.getChatRooms({
      roomType: 'ONE_TO_ONE',
      participantId: sellerId,
      isActive: true,
      limit: 10
    });

    const rooms = response.data?.data || response.data?.content || [];
    const existingRoom = rooms.find(room => {
      const participants = room.participants || [];
      const participantIds = participants.map(p => String(p.userId));
      return participants.length === 2 &&
          participantIds.includes(String(buyerId)) &&
          participantIds.includes(String(sellerId));
    });

    return existingRoom || null;
  } catch (error) {
    console.error('기존 채팅방 조회 실패:', error);
    return null;
  }
};

const createDirectChatRoom = async (buyerId, sellerId, product) => {
  try {
    const roomData = {
      title: `${product.name} 문의`,
      description: `${product.name}(${formatPrice(product.price)})에 대한 문의`,
      roomType: 'NORMAL',
      participantIds: [String(sellerId)],
      creatorId: 5,
      deviceId: 2,
      metadata: {
        relatedProductId: product.id,
        relatedProductType: 'ONE_MOUTH',
        productName: product.name,
        productPrice: product.price,
        sellerId: sellerId,
        buyerId: buyerId
      }
    };

    const response = await chatService.createChatRoom(roomData);
    const newRoom = response.data?.data || response.data;

    if (!newRoom || !newRoom.id) {
      throw new Error('채팅방 생성 응답이 유효하지 않습니다.');
    }

    try {
      await sendWelcomeMessage(newRoom.id, product);
    } catch (msgError) {
      console.warn('환영 메시지 전송 실패:', msgError);
    }

    return newRoom;
  } catch (error) {
    console.error('새 채팅방 생성 실패:', error);
    throw error;
  }
};

const sendWelcomeMessage = async (roomId, product) => {
  try {
    const welcomeMessage = {
      content: `안녕하세요! "${product.name}"(${formatPrice(product.price)}) 상품에 관심이 있어서 연락드립니다. 😊`,
      messageType: 'TEXT',
      isSystemMessage: false,
      metadata: {
        relatedProductId: product.id,
        productName: product.name,
        isWelcomeMessage: true
      }
    };

    await chatService.sendMessage(roomId, welcomeMessage);
  } catch (error) {
    console.error('환영 메시지 전송 실패:', error);
    throw error;
  }
};

const formatPrice = (price) => {
  if (!price || price === 0) return '무료나눔';
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return formatDate(dateString);
};

const handleImageError = (e) => {
  e.target.style.display = 'none';
  e.target.parentElement.classList.add('no-image');
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

const writeReview = () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }
  router.push(`/one-mouth/${foodId.value}/review`);
};

const getCategoryName = (category) => {
  const categories = {
    '간식': '간식',
    '음료': '음료',
    '디저트': '디저트',
    '편의점': '편의점',
    '카페': '카페',
    '한식': '한식',
    '중식': '중식',
    '일식': '일식',
    '양식': '양식'
  };
  return categories[category] || '기타';
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
/* 전체 컨테이너 */
.detail-container {
  min-height: 100vh;
  background: #FFFFFF;
  padding-bottom: env(safe-area-inset-bottom);
}

/* 로딩 상태 */
.loading-container {
  padding: 20px;
}

.loading-content {
  max-width: 600px;
  margin: 0 auto;
}

.skeleton-header {
  height: 56px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 20px;
}

.skeleton-image {
  width: 100%;
  height: 375px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  margin-bottom: 20px;
}

.skeleton-text {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-text.short {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 에러 상태 */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #191F28;
  margin-bottom: 8px;
}

.error-content p {
  font-size: 14px;
  color: #8B95A1;
  margin-bottom: 24px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-retry, .btn-back {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry {
  background: #FF6B6B;
  color: white;
}

.btn-retry:hover {
  background: #FF5252;
}

.btn-back {
  background: #F2F3F7;
  color: #4E5968;
}

.btn-back:hover {
  background: #E5E8EB;
}

/* 헤더 */
.detail-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  color: #191F28;
}

.header-btn:hover {
  background: #F2F3F7;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 이미지 섹션 */
.image-section {
  position: relative;
  background: #000;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 375px;
  background: #F8F9FA;
  overflow: hidden;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8F9FA;
  color: #B0B8C1;
}

.status-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.status-badge.sold-out {
  background: rgba(0, 0, 0, 0.8);
}

.image-indicator {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  backdrop-filter: blur(10px);
}

/* 메인 컨텐츠 */
.main-content {
  padding: 0;
  max-width: 600px;
  margin: 0 auto;
}

/* 정보 섹션 */
.info-section {
  padding: 20px;
  border-bottom: 1px solid #F2F3F7;
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #F2F3F7;
  color: #4E5968;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
}

.product-title {
  font-size: 22px;
  font-weight: 700;
  color: #191F28;
  line-height: 1.3;
  margin-bottom: 12px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #191F28;
}

.price-badge {
  padding: 4px 8px;
  background: #FF6B6B;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.meta-info {
  display: flex;
  gap: 16px;
  color: #8B95A1;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 판매자 섹션 */
.seller-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 8px solid #F8F9FA;
  cursor: pointer;
  transition: background 0.2s;
}

.seller-section:hover {
  background: #FAFBFC;
}

.seller-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #F2F3F7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #8B95A1;
}

.seller-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seller-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.seller-name {
  font-size: 15px;
  font-weight: 600;
  color: #191F28;
}

.seller-location {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8B95A1;
  font-size: 13px;
}

.seller-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trust-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.score-value {
  font-size: 18px;
  font-weight: 700;
  color: #FF6B6B;
}

.score-label {
  font-size: 11px;
  color: #8B95A1;
}

.arrow-icon {
  color: #B0B8C1;
}

/* 설명 섹션 */
.description-section {
  padding: 24px 20px;
  border-bottom: 8px solid #F8F9FA;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #191F28;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-count {
  font-size: 14px;
  color: #8B95A1;
  font-weight: 500;
}

.description-text {
  font-size: 15px;
  line-height: 1.6;
  color: #4E5968;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 13px;
  color: #8B95A1;
}

.detail-value {
  font-size: 15px;
  color: #191F28;
  font-weight: 500;
}

/* 리뷰 섹션 */
.reviews-section {
  padding: 24px 20px 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.write-review-btn {
  padding: 8px 16px;
  background: #FF6B6B;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.write-review-btn:hover {
  background: #FF5252;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px;
  background: #F8F9FA;
  border-radius: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #B0B8C1;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 600;
  color: #191F28;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-content {
  font-size: 14px;
  line-height: 1.5;
  color: #4E5968;
  margin-bottom: 8px;
}

.review-date {
  font-size: 12px;
  color: #8B95A1;
}

.empty-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #B0B8C1;
}

.empty-reviews p {
  margin-top: 16px;
  font-size: 16px;
  color: #4E5968;
}

.empty-reviews span {
  font-size: 14px;
  color: #8B95A1;
}

.load-more-btn {
  width: 100%;
  padding: 14px;
  margin-top: 20px;
  background: white;
  border: 1px solid #E5E8EB;
  border-radius: 8px;
  color: #4E5968;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #F8F9FA;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 추천 섹션 */
.recommend-section {
  padding: 24px 20px 100px;
  background: #F8F9FA;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* 하단 고정 바 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #E5E8EB;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.action-icon-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #E5E8EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon-btn:hover {
  background: #F8F9FA;
}

.action-icon-btn.active {
  background: #FFF5F5;
  border-color: #FF6B6B;
}

.action-price {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-label {
  font-size: 12px;
  color: #8B95A1;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
  color: #191F28;
}

.chat-btn {
  flex: 2;
  padding: 14px 24px;
  background: #FF6B6B;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-btn:hover:not(:disabled) {
  background: #FF5252;
}

.chat-btn:disabled {
  background: #B0B8C1;
  cursor: not-allowed;
}

/* 반응형 */
@media (max-width: 768px) {
  .detail-header {
    padding: 8px 12px;
  }

  .image-wrapper {
    height: 300px;
  }

  .product-title {
    font-size: 20px;
  }

  .price {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .image-wrapper {
    height: 250px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .chat-btn {
    font-size: 15px;
  }
}
</style>