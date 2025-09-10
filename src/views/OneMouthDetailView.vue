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

      <!-- 메인 컨테이너 -->
      <div class="main-container">
        <!-- 메인 콘텐츠 -->
        <main class="main-content">
          <!-- 제품 헤더 -->
          <div class="product-header">
            <h1 class="product-title">{{ food.name }}</h1>
            <div class="product-brand">{{ food.seller?.name || '판매자' }}</div>
            <div class="product-meta">
              <div class="meta-item">
                <span>⭐</span>
                <span class="rating">{{ (food.seller?.rating || 4.5).toFixed(1) }}</span>
                <span>({{ reviews.length }}개 리뷰)</span>
              </div>
              <div class="meta-item">
                <span>💬</span>
                <span>{{ reviews.length }}</span>
              </div>
              <div class="meta-item">
                <span>🔥</span>
                <span>{{ food.hits || 0 }}</span>
              </div>
              <div class="meta-item">
                <span>👁️</span>
                <span>{{ food.hits || 0 }}</span>
              </div>
              <div
                  class="status-badge"
                  :class="{ 'info-only': food.productStatus !== 'FOR_SALE' }"
              >
                {{ food.productStatus === 'FOR_SALE' ? '💰 거래가능' : '❌ 정보만' }}
              </div>
            </div>
          </div>

          <!-- 이미지 섹션 -->
          <ProductImageSection
              :food="food"
              @image-error="handleImageError"
          />

          <!-- 제품 정보 -->
          <div class="product-info">
            <div class="info-section">
              <div class="info-title">제품 소개</div>
              <div class="info-content">
                {{ food.description || '상품 설명이 없습니다.' }}
              </div>
              <div class="tag-list">
                <div class="tag highlight">#신메뉴</div>
                <div class="tag highlight">#화제</div>
                <div class="tag">#{{ food.productType || '기타' }}</div>
                <div class="tag">#한입만</div>
              </div>
            </div>

            <div class="info-section">
              <div class="info-title">상세 정보</div>
              <div class="info-content">
                <strong>가격:</strong> {{ food.price?.toLocaleString() || 0 }}원<br>
                <strong>수량:</strong> {{ food.quantity || 1 }}{{ food.unit || '개' }}<br>
                <strong>위치:</strong> {{ food.location || '위치 정보 없음' }}<br>
                <strong>등록일:</strong> {{ formatDate(food.createdAt) }}<br>
                <strong>상태:</strong> {{ food.productStatus === 'FOR_SALE' ? '거래가능' : '정보제공' }}
              </div>
            </div>
          </div>

          <!-- 출시 정보 섹션 -->
          <div class="launch-info-section">
            <h2 class="section-title">🚀 출시 정보</h2>

            <div class="launch-info-grid">
              <div class="launch-item">
                <span class="launch-label">출시일</span>
                <span class="launch-value">{{ formatDate(food.launchDate || food.createdAt) }}</span>
              </div>
              <div class="launch-item">
                <span class="launch-label">판매기간</span>
                <span class="launch-value">{{ food.isLimited ? '한정판매' : '상시판매' }}</span>
              </div>
              <div class="launch-item">
                <span class="launch-label">지역</span>
                <span class="launch-value">전국 출시</span>
              </div>
              <div class="launch-item" v-if="food.eventInfo">
                <span class="launch-label">이벤트</span>
                <span class="launch-value">{{ food.eventInfo }}</span>
              </div>
            </div>
          </div>

          <!-- 개인거래 섹션 -->
          <div class="personal-trade-section">
            <h2 class="section-title">🛒 개인거래</h2>

            <!-- 거래 리스트 -->
            <div class="trade-list">
              <div
                  v-for="trade in displayedTrades"
                  :key="trade.id"
                  class="trade-item"
                  @click="goToTradeDetail(trade.id)"
              >
                <div class="trade-image">
                  <img :src="trade.imageUrl || '/placeholder-image.jpg'" :alt="trade.title" />
                </div>

                <div class="trade-info">
                  <div class="trade-price">{{ trade.price.toLocaleString() }}원</div>
                  <div class="trade-condition">{{ getConditionText(trade.condition) }}</div>
                  <div class="trade-quantity">{{ trade.quantity }}개</div>
                </div>

                <div class="seller-info">
                  <div class="seller-profile">
                    <div class="seller-avatar">{{ trade.sellerName.charAt(0) }}</div>
                    <div class="seller-details">
                      <div class="seller-name">{{ trade.sellerName }}</div>
                      <div class="seller-rating">⭐ {{ trade.sellerRating.toFixed(1) }}</div>
                    </div>
                  </div>
                  <div class="seller-distance">{{ trade.distance }}m</div>
                </div>

                <div class="trade-actions">
                  <button
                      class="chat-btn"
                      @click.stop="startChatWithSeller(trade)"
                      :disabled="trade.sellerId === currentUserId"
                  >
                    {{ trade.sellerId === currentUserId ? '내 상품' : '채팅하기' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 더보기 버튼 또는 빈 상태 -->
            <div v-if="personalTrades.length === 0" class="empty-trade">
              <div class="empty-icon">📦</div>
              <h3>아직 판매중인 상품이 없어요</h3>
              <p>이 제품의 첫 번째 판매자가 되어보세요!</p>
              <button class="cta-btn" @click="goToSell">내가 첫 판매자가 되어보세요!</button>
            </div>

            <div v-else-if="personalTrades.length > displayedTradeCount" class="load-more">
              <button class="load-more-btn" @click="loadMoreTrades">
                더 많은 거래 보기 ({{ personalTrades.length - displayedTradeCount }}개 더)
              </button>
            </div>
          </div>

          <!-- 리뷰 섹션 -->
          <div class="reviews-section">
            <div class="reviews-header">
              <div class="reviews-title">💬 리뷰 ({{ reviews.length }}개)</div>
              <div class="reviews-stats">
                <span>⭐ {{ (food.seller?.rating || 4.5).toFixed(1) }}</span>
                <span>|</span>
                <span>최신순</span>
              </div>
            </div>

            <div v-if="reviews.length > 0">
              <div
                  v-for="review in reviews"
                  :key="review.id"
                  class="review-item"
              >
                <div class="review-header">
                  <div class="review-user">
                    <div class="user-avatar">{{ review.userName.charAt(0) }}</div>
                    <div class="user-name">{{ review.userName }}</div>
                    <div class="user-rating">⭐ {{ review.rating.toFixed(1) }}</div>
                  </div>
                </div>
                <div class="review-content">
                  {{ review.content }}
                </div>
                <div class="review-meta">
                  <span>{{ formatDate(review.createdAt) }}</span>
                  <span>도움됨 {{ Math.floor(Math.random() * 20) }}</span>
                  <span>거래완료</span>
                </div>
              </div>
            </div>

            <div v-else class="no-reviews">
              <p>아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!</p>
            </div>

            <ReviewSection
                :reviews="reviews"
                :reviews-loading="reviewsLoading"
                :reviews-has-more="reviewsHasMore"
                @write-review="writeReview"
                @load-more="loadMoreReviews"
            />
          </div>
        </main>

        <!-- 사이드바 -->
        <aside class="sidebar">
          <!-- 액션 버튼 -->
          <div class="widget">
            <div class="action-buttons">
              <button
                  class="action-btn primary"
                  :class="{ 'favorited': isFavorited }"
                  @click="toggleFavorite"
                  :disabled="processing"
              >
                {{ isFavorited ? '💚 찜완료' : '❤️ 찜하기' }}
              </button>
              <button class="action-btn secondary" @click="shareFood">
                📤 공유
              </button>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ reviews.length }}</div>
                <div class="stat-label">리뷰</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ food.productStatus === 'FOR_SALE' ? '가능' : '불가' }}</div>
                <div class="stat-label">거래</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ formatNumber(food.hits || 0) }}</div>
                <div class="stat-label">조회수</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ formatNumber(food.favoritesCount || 0) }}</div>
                <div class="stat-label">찜</div>
              </div>
            </div>
          </div>

          <!-- 관련 제품 -->
          <div class="widget">
            <div class="widget-title">🔗 비슷한 제품</div>
            <div class="related-item">
              <div class="related-image">🍔</div>
              <div class="related-info">
                <div class="related-name">버거킹 신상 와퍼</div>
                <div class="related-brand">버거킹</div>
                <div class="related-stats">⭐ 4.2 • 거래 8명</div>
              </div>
            </div>
            <div class="related-item">
              <div class="related-image">🍟</div>
              <div class="related-info">
                <div class="related-name">맥도날드 치즈스틱</div>
                <div class="related-brand">맥도날드</div>
                <div class="related-stats">⭐ 4.4 • 거래 15명</div>
              </div>
            </div>
            <div class="related-item">
              <div class="related-image">🥤</div>
              <div class="related-info">
                <div class="related-name">KFC 트위스터</div>
                <div class="related-brand">KFC</div>
                <div class="related-stats">⭐ 4.0 • 거래 6명</div>
              </div>
            </div>
          </div>

          <!-- 위치 정보 -->
          <div class="widget">
            <div class="widget-title">📍 내 근처 정보</div>
            <div class="info-content">
              <strong>{{ food.location || '위치 정보 없음' }}</strong><br>
              평균 거리: <strong>680m</strong><br>
              상태: <strong>{{ food.productStatus === 'FOR_SALE' ? '거래가능' : '정보만' }}</strong>
            </div>
          </div>
        </aside>
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



// 개인거래 관련 새로운 데이터
const personalTrades = ref([]);
const tradeSort = ref('latest');
const tradeCondition = ref('all');
const priceRange = ref({ min: 0, max: 50000 });
const displayedTradeCount = ref(5); // 처음에 5개만 표시

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

// 유틸리티 함수들
const formatDate = (dateString) => {
  if (!dateString) return '날짜 정보 없음';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString();
  }
};

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// 기존 스크립트 로직 그대로 유지
const getCurrentUserId = () => {
  try {
    const currentUser = tokenUtils.getCurrentUser();
    if (currentUser?.id) {
      console.log('tokenUtils에서 사용자 ID 가져옴:', currentUser.id);
      return currentUser.id;
    }

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

const canStartChat = computed(() => {
  const currentUserId = getCurrentUserId();
  return currentUserId &&
      food.value?.sellerId &&
      String(currentUserId) !== String(food.value.sellerId) &&
      food.value.productStatus === 'FOR_SALE';
});

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
        fetchPersonalTrades(),
        fetchReviews(),
        checkLikeStatus(),
        checkFavoriteStatus()
      ]);
    }

    if (apiData.isUserFavorited !== undefined) {
      isFavorited.value = apiData.isUserFavorited;
    }

    await fetchReviews();

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

const checkLikeStatus = async () => {
  try {
    const likedItems = JSON.parse(localStorage.getItem('liked_items') || '[]');
    isLiked.value = likedItems.includes(String(foodId.value));
  } catch (err) {
    console.error('좋아요 상태 확인 실패:', err);
  }
};

const checkFavoriteStatus = async () => {
  try {
    const favoritedItems = JSON.parse(localStorage.getItem('favorited_items') || '[]');
    isFavorited.value = favoritedItems.includes(String(foodId.value));
  } catch (err) {
    console.error('관심 상태 확인 실패:', err);
  }
};

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

const loadMoreReviews = async () => {
  if (!reviewsHasMore.value || reviewsLoading.value) return;
  const nextPage = reviewsPage.value + 1;
  await fetchReviews(nextPage, true);
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

const toggleFavorite = async () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  try {
    processing.value = true;

    if (isFavorited.value) {
      await contentService.removeOneMouthFavorite(foodId.value);
    } else {
      await contentService.toggleOneMouthFavorite(foodId.value);
    }

    isFavorited.value = !isFavorited.value;

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


const fetchPersonalTrades = async () => {
  try {
    // 실제 API 호출 대신 목업 데이터
    const mockTrades = [
      {
        id: 1,
        productId: foodId.value,
        title: '초콜릿 과자 판매',
        price: 3500,
        condition: 'new',
        quantity: 2,
        imageUrl: '',
        sellerId: 'user123',
        sellerName: '판매자A',
        sellerRating: 4.8,
        distance: 500,
        createdAt: '2024-12-08T10:00:00Z',
        tradeMethod: '직거래'
      },
      {
        id: 2,
        productId: foodId.value,
        title: '초콜릿 과자 급매',
        price: 3000,
        condition: 'like-new',
        quantity: 1,
        imageUrl: '',
        sellerId: 'user456',
        sellerName: '판매자B',
        sellerRating: 4.5,
        distance: 1200,
        createdAt: '2024-12-07T15:30:00Z',
        tradeMethod: '택배'
      },
      {
        id: 3,
        productId: foodId.value,
        title: '초콜릿 과자 나눔',
        price: 2800,
        condition: 'used',
        quantity: 3,
        imageUrl: '',
        sellerId: 'user789',
        sellerName: '판매자C',
        sellerRating: 4.2,
        distance: 800,
        createdAt: '2024-12-06T20:15:00Z',
        tradeMethod: '편의점택배'
      }
    ];

    personalTrades.value = mockTrades;
  } catch (err) {
    console.error('개인거래 정보 로드 실패:', err);
  }
};


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

const retryStartChat = () => {
  clearChatError();
  handleStartChat();
};

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
/* 메인 컨테이너 - Vue 스타일 적용 */
.detail-container {
  min-height: 100vh;
  background: #FFFFFF;
  padding-bottom: env(safe-area-inset-bottom);
  position: relative;
}

.content-wrapper {
  max-width: 100%;
  margin: 0 auto;
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

/* 메인 콘텐츠 */
.main-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  overflow: hidden;
  padding: 0;
  max-width: none;
  margin: 0;
}

/* 제품 헤더 */
.product-header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.product-title {
  font-size: 28px;
  font-weight: 800;
  color: #000000;
  margin-bottom: 8px;
}

.product-brand {
  font-size: 16px;
  color: #222222;
  opacity: 0.7;
  margin-bottom: 16px;
}

.product-meta {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

.rating {
  color: #169976;
  font-weight: 600;
}

.status-badge {
  background: #1DCD9F;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.info-only {
  background: #222222;
}

/* 제품 정보 */
.product-info {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.info-section {
  margin-bottom: 24px;
}

.info-title {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 12px;
}

.info-content {
  font-size: 15px;
  line-height: 1.6;
  color: #222222;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.tag {
  background: #f1f5f9;
  color: #222222;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

.tag.highlight {
  background: #1DCD9F;
  color: white;
}

/* 출시 정보 섹션 */
.launch-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.launch-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.launch-label {
  font-size: 12px;
  font-weight: 500;
  color: #718096;
  text-transform: uppercase;
}

.launch-value {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

/* 거래 리스트 */
.trade-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trade-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.trade-item:hover {
  background: #edf2f7;
  border-color: #1DCD9F;
  transform: translateY(-1px);
}

.trade-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trade-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trade-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trade-price {
  font-size: 18px;
  font-weight: 700;
  color: #1DCD9F;
}

.trade-condition,
.trade-quantity {
  font-size: 13px;
  color: #718096;
}

.seller-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.seller-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seller-avatar {
  width: 32px;
  height: 32px;
  background: #1DCD9F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.seller-details {
  text-align: center;
}

.seller-name {
  font-size: 12px;
  font-weight: 600;
  color: #2d3748;
}

.seller-rating {
  font-size: 11px;
  color: #1DCD9F;
}

.seller-distance {
  font-size: 11px;
  color: #718096;
}

.trade-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-btn {
  padding: 8px 16px;
  background: #1DCD9F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.chat-btn:hover:not(:disabled) {
  background: #16a085;
}

.chat-btn:disabled {
  background: #cbd5e0;
  color: #a0aec0;
  cursor: not-allowed;
}

/* 빈 상태 */
.empty-trade {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-trade h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.empty-trade p {
  font-size: 14px;
  margin-bottom: 24px;
}

.cta-btn {
  background: #1DCD9F;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-btn:hover {
  background: #16a085;
  transform: translateY(-1px);
}

.load-more {
  text-align: center;
  margin-top: 20px;
}

.load-more-btn {
  background: white;
  color: #1DCD9F;
  border: 2px solid #1DCD9F;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #1DCD9F;
  color: white;
}


/* 리뷰 섹션 */
.reviews-section {
  padding: 24px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.reviews-title {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
}

.reviews-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.review-item {
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #1DCD9F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-weight: 600;
  color: #000000;
}

.user-rating {
  font-size: 12px;
  color: #169976;
}

.review-content {
  font-size: 14px;
  line-height: 1.5;
  color: #222222;
  margin-bottom: 8px;
}

.review-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #222222;
  opacity: 0.7;
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: #222222;
  opacity: 0.7;
}

/* 사이드바 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.widget {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.widget-title {
  font-size: 16px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 16px;
}

/* 액션 버튼들 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #1DCD9F;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  text-decoration: none;
  background: white;
  font-size: 14px;
}

.action-btn.primary {
  background: #1DCD9F;
  color: white;
}

.action-btn.primary.favorited {
  background: #169976;
}

.action-btn.secondary {
  background: white;
  color: #1DCD9F;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.3);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 통계 정보 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #222222;
  opacity: 0.7;
}

/* 관련 제품 */
.related-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.related-item:hover {
  background: #f8fafc;
}

.related-item:last-child {
  border-bottom: none;
}

.related-image {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #1DCD9F, #169976);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.related-info {
  flex: 1;
}

.related-name {
  font-size: 13px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 2px;
}

.related-brand {
  font-size: 11px;
  color: #222222;
  opacity: 0.7;
  margin-bottom: 4px;
}

.related-stats {
  font-size: 11px;
  color: #169976;
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
  border-top: 3px solid #1DCD9F;
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
  background: #1DCD9F;
  color: white;
}

.retry-btn:hover {
  background: #169976;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .main-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .sidebar {
    order: -1;
  }

  .widget:not(:first-child) {
    display: none;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 16px;
  }

  .product-title {
    font-size: 24px;
  }

  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .chat-loading-content {
    margin: 20px;
    padding: 24px;
  }

  .chat-error-content {
    margin: 20px;
  }
}
</style>