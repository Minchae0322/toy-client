<template>
  <div class="detail-container">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-card">
        <div class="modern-spinner"></div>
        <h3>음식 정보 불러오는 중</h3>
        <p>잠시만 기다려주세요</p>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <div class="error-icon">😵</div>
        <h2>문제가 발생했습니다</h2>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="goBack" class="btn-secondary">목록으로 돌아가기</button>
          <button @click="retryLoad" class="btn-primary">다시 시도</button>
        </div>
      </div>
    </div>

    <!-- 정상 데이터 표시 -->
    <div v-else-if="food" class="content-wrapper">
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

      <!-- 프리미엄 하단 액션 바 -->
      <div class="premium-action-bar" v-if="food.selling">
        <div class="action-background"></div>
        <div class="actions-grid">
          <!-- 관심 버튼 -->
          <button
              @click="toggleFavorite"
              :class="['premium-btn', 'favorite-btn', { 'active': isFavorited }]"
              :disabled="processing"
          >
            <div class="btn-content">
              <div class="icon-wrapper">
                <Heart :size="22" :fill="isFavorited ? 'currentColor' : 'none'" />
              </div>
              <span class="btn-text">{{ isFavorited ? '관심취소' : '관심추가' }}</span>
            </div>
            <div class="btn-glow"></div>
          </button>

          <!-- 나눔 요청 버튼 -->
          <button
              @click="handleRequestShare"
              class="premium-btn share-btn"
              :disabled="processing"
          >
            <div class="btn-content">
              <div class="icon-wrapper">
                <Share2 :size="22" />
              </div>
              <span class="btn-text">나눔요청</span>
            </div>
            <div class="btn-glow"></div>
          </button>

          <!-- 채팅 버튼 -->
          <button
              @click="handleStartChat"
              class="premium-btn chat-btn"
              :disabled="chatLoading"
          >
            <div class="btn-content">
              <div class="icon-wrapper">
                <div v-if="chatLoading" class="micro-spinner"></div>
                <MessageCircle v-else :size="22" />
              </div>
              <span class="btn-text">{{ chatLoading ? '연결중' : '채팅하기' }}</span>
            </div>
            <div class="btn-glow chat-glow"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Heart, Share2, MessageCircle } from 'lucide-vue-next';
import { contentService, tokenUtils, chatService } from '@/api/axios.js';
import { chatNavigation } from '@/router/index.js';
import FoodOverviewCard from '@/components/oneMouth/detail/FoodOverviewCard.vue';
import SellerCard from '@/components/oneMouth/detail/SellerCard.vue';
import FoodDetailsCard from '@/components/oneMouth/detail/FoodDetailsCard.vue';
import ReviewsCard from '@/components/oneMouth/detail/ReviewsCard.vue';

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

    console.log('🍽️ 상세 정보 로딩 시작:', id);

    // 백엔드 API 호출
    const response = await contentService.getOneMouthDetail(id);
    const apiData = response.data?.data || response.data;

    console.log('📡 상세 정보 응답:', apiData);

    if (!apiData) {
      throw new Error('상품 정보를 찾을 수 없습니다.');
    }

    // productStatus 객체 처리
    const productStatusValue = apiData.productStatus?.title || apiData.productStatus || 'FOR_SALE';
    const isForSale = productStatusValue === 'FOR_SALE';

    console.log('📊 상품 상태 분석:', {
      raw: apiData.productStatus,
      extracted: productStatusValue,
      isForSale: isForSale
    });

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

      // 판매 상태 처리 수정
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

    console.log('✅ 상세 정보 로드 완료');

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
    if (append) {
      reviewsLoading.value = true;
    }

    // 임시 목업 데이터
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
      },
      {
        id: 3,
        userName: '초코홀릭',
        userProfileImage: '',
        rating: 5,
        content: '초콜릿 좋아하는 사람이라면 꼭 먹어봐야 할 맛! 추천합니다',
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
    '중식': '🥢', '일식': '🍣', '양식': '🍝', '치킨': '🍗'
  };
  return emojiMap[categoryName] || '🍽️';
};

const retryLoad = () => {
  fetchFoodDetail(foodId.value);
};

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
    if (isLiked.value) {
      const likedItems = JSON.parse(localStorage.getItem('liked_items') || '[]');
      const updatedItems = likedItems.filter(id => id !== String(foodId.value));
      localStorage.setItem('liked_items', JSON.stringify(updatedItems));
      isLiked.value = false;
    } else {
      const likedItems = JSON.parse(localStorage.getItem('liked_items') || '[]');
      likedItems.push(String(foodId.value));
      localStorage.setItem('liked_items', JSON.stringify(likedItems));
      isLiked.value = true;
    }
  } catch (err) {
    console.error('좋아요 처리 실패:', err);
    alert('좋아요 처리에 실패했습니다.');
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

    if (isFavorited.value) {
      const favoritedItems = JSON.parse(localStorage.getItem('favorited_items') || '[]');
      const updatedItems = favoritedItems.filter(id => id !== String(foodId.value));
      localStorage.setItem('favorited_items', JSON.stringify(favoritedItems));
      isFavorited.value = false;
    } else {
      const favoritedItems = JSON.parse(localStorage.getItem('favorited_items') || '[]');
      favoritedItems.push(String(foodId.value));
      localStorage.setItem('favorited_items', JSON.stringify(favoritedItems));
      isFavorited.value = true;
    }
  } catch (err) {
    console.error('관심 상품 처리 실패:', err);
    alert('관심 상품 처리에 실패했습니다.');
  } finally {
    processing.value = false;
  }
};

// 나눔 요청
const handleRequestShare = () => {
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

  alert(`${food.value.name} 한입 나눔을 요청했습니다!`);
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
    console.error('채팅방 처리 실패:', error);

    if (error.response?.status === 404) {
      alert('판매자를 찾을 수 없습니다.');
    } else if (error.response?.status === 403) {
      alert('채팅 권한이 없습니다.');
    } else if (error.response?.status === 409) {
      alert('이미 진행 중인 채팅이 있습니다.');
    } else {
      alert('채팅방 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
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
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
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
    if (error.response?.status === 409) {
      const existingRoom = await findExistingChatRoom(buyerId, sellerId);
      if (existingRoom) {
        return existingRoom;
      }
    }
    throw error;
  }
};

const sendWelcomeMessage = async (roomId, product) => {
  const welcomeMessage = {
    content: `안녕하세요! "${product.name}"(${formatPrice(product.price)}) 상품에 관심이 있어서 연락드립니다.`,
    messageType: 'TEXT',
    isSystemMessage: false,
    metadata: {
      relatedProductId: product.id,
      productName: product.name,
      isWelcomeMessage: true
    }
  };

  await chatService.sendMessage(roomId, welcomeMessage);
};

const formatPrice = (price) => {
  if (!price || price === 0) return '무료';
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

const shareFood = () => {
  const shareData = {
    title: food.value.name,
    text: food.value.description,
    url: window.location.href
  };

  if (navigator.share && navigator.canShare(shareData)) {
    navigator.share(shareData).catch(console.error);
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('링크가 클립보드에 복사되었습니다!');
    }).catch(() => {
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
    '간식': '간식', '음료': '음료', '디저트': '디저트',
    '편의점': '편의점', '카페': '카페', '한식': '한식',
    '중식': '중식', '일식': '일식', '양식': '양식'
  };
  return categories[category] || '기타';
};

// 라이프사이클
onMounted(() => {
  fetchFoodDetail(foodId.value);
});

watch(() => route.params.id, (newId) => {
  if (newId && newId !== foodId.value) {
    fetchFoodDetail(newId);
  }
});

watch(food, (newFood) => {
  if (newFood) {
    document.title = `${newFood.name} - 한입거리`;
  }
});
</script>

<style scoped>
/* 기본 컨테이너 - 현대적 배경 */
.detail-container {
  max-width: 100%;
  margin: 0;
  background:
      radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(52, 152, 219, 0.15) 0%, transparent 50%),
      linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  padding: 0;
  position: relative;
  overflow-x: hidden;
}

.content-wrapper {
  padding: 20px 20px 160px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 모던 로딩 디자인 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  padding: 48px;
  border-radius: 32px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
      0 32px 80px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.modern-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  position: relative;
}

.modern-spinner::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, #fff, transparent);
  animation: modernSpin 1.2s linear infinite;
}

.modern-spinner::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

@keyframes modernSpin {
  to { transform: rotate(360deg); }
}

.loading-card h3 {
  color: white;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}

.loading-card p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin: 0;
}

/* 프리미엄 에러 카드 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.error-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40px);
  padding: 56px 48px;
  border-radius: 32px;
  text-align: center;
  box-shadow:
      0 48px 100px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 560px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-icon {
  font-size: 64px;
  margin-bottom: 24px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.error-card h2 {
  margin-bottom: 16px;
  color: #2d3748;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.error-card p {
  margin-bottom: 36px;
  color: #64748b;
  font-size: 17px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-secondary, .btn-primary {
  padding: 14px 32px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.2px;
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
  border: 2px solid rgba(148, 163, 184, 0.2);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background: rgba(148, 163, 184, 0.2);
  border-color: rgba(148, 163, 184, 0.3);
  box-shadow: 0 8px 24px rgba(148, 163, 184, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid transparent;
  box-shadow:
      0 8px 24px rgba(102, 126, 234, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  box-shadow:
      0 12px 32px rgba(102, 126, 234, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* 혁신적인 프리미엄 액션 바 */
.premium-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 24px 20px 36px;
}

.action-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 100%);
  backdrop-filter: blur(40px);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
      0 -16px 40px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.actions-grid {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 20px;
  align-items: center;
}

.premium-btn {
  position: relative;
  height: 64px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.3px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.premium-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  filter: grayscale(0.3);
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  width: 100%;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.premium-btn:hover:not(:disabled) .icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.btn-text {
  font-weight: 700;
  letter-spacing: -0.2px;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

/* 관심 버튼 - 세련된 빨간색 */
.favorite-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 50%, #f44336 100%);
  color: white;
}

.favorite-btn .btn-glow {
  background: linear-gradient(135deg, #ff8a80 0%, #ff5722 100%);
  box-shadow:
      0 0 40px rgba(255, 107, 107, 0.6),
      inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.favorite-btn:hover:not(:disabled) {
  transform: translateY(-6px) scale(1.03);
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 50%, #c62828 100%);
  box-shadow:
      0 16px 48px rgba(255, 107, 107, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.favorite-btn:hover:not(:disabled) .btn-glow {
  opacity: 0.3;
}

.favorite-btn.active {
  background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%);
  animation: heartbeat 2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* 나눔 요청 버튼 - 모던 그린 */
.share-btn {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 50%, #2e7d32 100%);
  color: white;
}

.share-btn .btn-glow {
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  box-shadow:
      0 0 40px rgba(76, 175, 80, 0.5),
      inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.share-btn:hover:not(:disabled) {
  transform: translateY(-6px) scale(1.03);
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 50%, #1b5e20 100%);
  box-shadow:
      0 16px 48px rgba(76, 175, 80, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.share-btn:hover:not(:disabled) .btn-glow {
  opacity: 0.3;
}

/* 채팅 버튼 - 프리미엄 디자인 */
.chat-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #5a67d8 100%);
  color: white;
  font-size: 18px;
  font-weight: 800;
  position: relative;
  overflow: hidden;
}

.chat-glow {
  background:
      radial-gradient(circle, rgba(102, 126, 234, 0.6) 0%, transparent 70%),
      linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  box-shadow:
      0 0 60px rgba(102, 126, 234, 0.8),
      inset 0 2px 4px rgba(255, 255, 255, 0.15);
}

.chat-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.8s ease;
  z-index: 1;
}

.chat-btn:hover::before {
  left: 100%;
}

.chat-btn:hover:not(:disabled) {
  transform: translateY(-8px) scale(1.05);
  background: linear-gradient(135deg, #5a67d8 0%, #6366f1 50%, #4f46e5 100%);
  box-shadow:
      0 20px 60px rgba(102, 126, 234, 0.5),
      inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

.chat-btn:hover:not(:disabled) .btn-glow {
  opacity: 0.4;
}

/* 마이크로 로딩 애니메이션 */
.micro-spinner {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-top-color: white;
  animation: microSpin 0.8s linear infinite;
}

@keyframes microSpin {
  to { transform: rotate(360deg); }
}

/* 반응형 최적화 */
@media (max-width: 1024px) {
  .content-wrapper {
    padding: 16px 16px 140px;
  }

  .premium-action-bar {
    padding: 20px 16px 32px;
  }

  .actions-grid {
    gap: 16px;
  }

  .premium-btn {
    height: 60px;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }

  .premium-btn {
    height: 56px;
    font-size: 15px;
    border-radius: 16px;
  }

  .btn-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .premium-action-bar {
    padding: 16px 12px 28px;
  }

  .actions-grid {
    gap: 8px;
  }

  .premium-btn {
    height: 52px;
    font-size: 14px;
    border-radius: 14px;
  }

  .btn-text {
    font-size: 13px;
    font-weight: 600;
  }

  .icon-wrapper svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 360px) {
  .premium-btn {
    height: 48px;
    font-size: 13px;
  }

  .btn-text {
    display: none;
  }

  .premium-btn {
    border-radius: 50%;
    width: 48px;
  }

  .actions-grid {
    justify-content: space-around;
    gap: 16px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .detail-container {
    background:
        radial-gradient(circle at 20% 80%, rgba(139, 69, 233, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  .action-background {
    background:
        linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .loading-card {
    background: rgba(15, 23, 42, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .error-card {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
  }

  .error-card h2 {
    color: #f1f5f9;
  }

  .error-card p {
    color: #94a3b8;
  }
}

/* 접근성 및 포커스 상태 */
.premium-btn:focus {
  outline: none;
  box-shadow:
      0 0 0 3px rgba(102, 126, 234, 0.3),
      0 8px 32px rgba(0, 0, 0, 0.08);
}

.premium-btn:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 3px;
}

/* 고급 애니메이션 */
.content-wrapper > * {
  animation: fadeInSlide 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

.content-wrapper > *:nth-child(1) { animation-delay: 0.1s; }
.content-wrapper > *:nth-child(2) { animation-delay: 0.2s; }
.content-wrapper > *:nth-child(3) { animation-delay: 0.3s; }
.content-wrapper > *:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInSlide {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.premium-action-bar {
  animation: slideUpFade 0.6s ease-out 0.5s both;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>