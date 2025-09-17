<template>
  <div class="product-detail-view">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-container">
        <button class="back-btn" @click="goBack">←</button>
        <div class="breadcrumb">
          <router-link to="/">홈</router-link> >
          <router-link to="/products">상품</router-link> >
          {{ product?.name || '상품 상세' }}
        </div>
      </div>
    </header>

    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 메인 콘텐츠 -->
      <main class="main-content">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>상품 정보를 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
          <div class="error-message">
            <h3>상품을 불러올 수 없습니다</h3>
            <p>{{ error }}</p>
            <button @click="fetchProduct" class="retry-btn">다시 시도</button>
          </div>
        </div>

        <!-- 상품 정보 -->
        <template v-else-if="product">
          <!-- 제품 헤더 -->
          <div class="product-header">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="product-brand">{{ product.brand }}</div>
            <div class="product-meta">
              <div class="meta-item">
                <span>⭐</span>
                <span class="rating">{{ product.averageRating?.toFixed(1) || '0.0' }}</span>
                <span>({{ product.reviewCount || 0 }}개 리뷰)</span>
              </div>
              <div class="meta-item">
                <span>💬</span>
                <span>{{ product.reviewCount || 0 }}</span>
              </div>
              <div class="meta-item">
                <span>🔥</span>
                <span>{{ formatCount(product.likeCount) }}</span>
              </div>
              <div class="meta-item">
                <span>👁️</span>
                <span>{{ formatCount(product.viewCount) }}</span>
              </div>
              <div class="status-badge" :class="getStatusClass(product.status)">
                {{ getStatusIcon(product.productType) }} {{ getProductTypeText(product.productType) }}
              </div>
            </div>
          </div>

          <!-- 이미지 갤러리 -->
          <div class="image-gallery">
            <div class="main-image">
              <img
                  v-if="currentImage?.fileUrl"
                  :src="currentImage.fileUrl"
                  :alt="product.name"
                  @error="handleImageError"
              />
              <div v-else class="placeholder-image">
                📦
              </div>
              <div class="image-nav" v-if="product.attachmentFiles?.length > 1">
                {{ currentImageIndex + 1 }} / {{ product.attachmentFiles.length }}
              </div>
            </div>
            <div class="thumbnail-list" v-if="product.attachmentFiles?.length > 1">
              <div
                  v-for="(file, index) in imageFiles"
                  :key="file.id"
                  class="thumbnail"
                  :class="{ active: index === currentImageIndex }"
                  @click="setCurrentImage(index)"
              >
                <img
                    v-if="file.fileUrl"
                    :src="file.fileUrl"
                    :alt="`${product.name} ${index + 1}`"
                    @error="handleImageError"
                />
                <span v-else>📷</span>
              </div>
            </div>
          </div>

          <!-- 제품 정보 -->
          <div class="product-info">
            <div class="info-section">
              <div class="info-title">제품 소개</div>
              <div class="info-content">
                {{ product.description || '상품 설명이 없습니다.' }}
              </div>
              <div class="tag-list" v-if="product.tags?.length">
                <div
                    v-for="tag in product.tags"
                    :key="tag"
                    class="tag"
                    :class="{ highlight: isHighlightTag(tag) }"
                >
                  #{{ tag }}
                </div>
              </div>
            </div>

            <div class="info-section" v-if="hasDetailInfo">
              <div class="info-title">상세 정보</div>
              <div class="info-content">
                <div v-if="product.distributor">
                  <strong>판매처:</strong> {{ product.distributor }}
                </div>
                <div v-if="product.price">
                  <strong>가격:</strong> {{ formatPrice(product.price) }}
                </div>
                <div v-if="product.feature">
                  <strong>특징:</strong> {{ product.feature }}
                </div>
                <div v-if="product.releaseDate">
                  <strong>출시일:</strong> {{ formatDate(product.releaseDate) }}
                </div>
                <div v-if="product.category">
                  <strong>카테고리:</strong> {{ product.category.categoryName }}
                  <span v-if="product.category.categoryCode" class="category-code">
                    ({{ product.category.categoryCode }})
                  </span>
                </div>
                <div v-if="getStatusText(product.status)">
                  <strong>상태:</strong> {{ getStatusText(product.status) }}
                </div>
              </div>
            </div>

            <!-- 카테고리 키워드 -->
            <div class="info-section" v-if="product.category?.keywords?.length">
              <div class="info-title">관련 키워드</div>
              <div class="keyword-list">
                <span
                    v-for="keyword in product.category.keywords"
                    :key="keyword"
                    class="keyword"
                >
                  {{ keyword }}
                </span>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 섹션 -->
          <div class="action-section">
            <div class="action-buttons">
              <button
                  class="action-btn"
                  :class="{ primary: userReaction.hasBookmark, secondary: !userReaction.hasBookmark }"
                  @click="toggleBookmark"
                  :disabled="actionLoading"
              >
                {{ userReaction.hasBookmark ? '💖 찜했음' : '❤️ 찜하기' }}
              </button>
              <button class="action-btn secondary" @click="toggleShare">
                📤 공유
              </button>
            </div>

            <!-- 추가 리액션 버튼 -->
            <div class="reaction-buttons">
              <button
                  class="reaction-btn"
                  :class="{ active: userReaction.hasLike }"
                  @click="toggleLike"
                  :disabled="actionLoading"
              >
                👍 {{ userReaction.hasLike ? '좋아함' : '좋아요' }}
              </button>
              <button
                  class="reaction-btn"
                  :class="{ active: userReaction.hasInterest }"
                  @click="toggleInterest"
                  :disabled="actionLoading"
              >
                🌟 {{ userReaction.hasInterest ? '관심있음' : '관심상품' }}
              </button>
              <button
                  class="reaction-btn"
                  :class="{ active: userReaction.hasWish }"
                  @click="toggleWish"
                  :disabled="actionLoading"
              >
                🎁 {{ userReaction.hasWish ? '위시리스트' : '위시리스트 추가' }}
              </button>
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ product.reviewCount || 0 }}</div>
                <div class="stat-label">리뷰</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ availableTraders.length }}</div>
                <div class="stat-label">거래가능</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ formatCount(product.viewCount) }}</div>
                <div class="stat-label">조회수</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ formatCount(product.likeCount) }}</div>
                <div class="stat-label">찜</div>
              </div>
            </div>
          </div>

          <!-- 거래 정보 섹션 -->
          <div class="trade-section" v-if="showTradeSection">
            <h2 class="section-title">🤝 거래 가능한 사용자 ({{ availableTraders.length }}명)</h2>

            <!-- 거래 리스트 -->
            <div class="trade-list">
              <div
                  v-for="trader in displayedTraders"
                  :key="trader.id"
                  class="trade-item"
              >
                <div class="trade-header">
                  <div class="trade-user">
                    <div class="user-avatar">{{ trader.name.charAt(0) }}</div>
                    <div class="user-name">{{ trader.name }}</div>
                    <div class="user-rating">⭐ {{ trader.rating }}</div>
                  </div>
                  <div class="trade-distance">📍 {{ trader.distance }}</div>
                </div>
                <div class="trade-info">{{ trader.message }}</div>
                <button class="trade-btn" @click="startTrade(trader)">거래 신청</button>
              </div>
            </div>

            <!-- 더보기 버튼 또는 빈 상태 -->
            <div v-if="availableTraders.length === 0" class="empty-trade">
              <div class="empty-icon">📦</div>
              <h3>아직 거래 가능한 사용자가 없어요</h3>
              <p>이 제품의 첫 번째 거래자가 되어보세요!</p>
              <button class="cta-btn" @click="goToTrade">첫 거래자가 되어보세요!</button>
            </div>

            <div v-else-if="availableTraders.length > displayedTradeCount" class="load-more">
              <button class="load-more-btn" @click="loadMoreTrades">
                더 많은 거래 보기 ({{ availableTraders.length - displayedTradeCount }}개 더)
              </button>
            </div>
          </div>

          <!-- 리뷰 섹션 -->
          <div class="reviews-section">
            <div class="reviews-header">
              <div class="reviews-title">💬 리뷰 ({{ product.reviewCount || 0 }}개)</div>
              <div class="reviews-stats">
                <span>⭐ {{ product.averageRating?.toFixed(1) || '0.0' }}</span>
                <span>|</span>
                <select v-model="reviewSort" @change="fetchReviews" class="sort-select">
                  <option value="latest">최신순</option>
                  <option value="rating">평점순</option>
                  <option value="helpful">도움순</option>
                </select>
              </div>
            </div>

            <!-- 리뷰 목록 -->
            <div class="reviews-container">
              <div v-if="reviews.length > 0" class="reviews-list">
                <div
                    v-for="review in displayedReviews"
                    :key="review.id"
                    class="review-item"
                >
                  <div class="review-header">
                    <div class="review-user">
                      <div class="user-avatar">{{ review.userName.charAt(0) }}</div>
                      <div class="user-name">{{ review.userName }}</div>
                      <div class="user-rating">⭐ {{ review.rating.toFixed(1) }}</div>
                    </div>
                    <div class="review-status" v-if="review.status">
                      <span class="status-indicator" :class="getReviewStatusClass(review.status)">
                        {{ getReviewStatusText(review.status) }}
                      </span>
                    </div>
                  </div>
                  <div class="review-content">{{ review.comment }}</div>
                  <div class="review-meta">
                    <span>{{ getRelativeTime(review.createdAt) }}</span>
                    <span v-if="review.likeCount">도움됨 {{ review.likeCount }}</span>
                    <span v-if="review.reportCount > 0" class="report-count">
                      신고 {{ review.reportCount }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 리뷰 없음 -->
              <div v-else class="no-reviews">
                <p>아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!</p>
              </div>

              <!-- 리뷰 더보기 버튼 -->
              <div v-if="reviews.length > displayedReviewCount" class="review-load-more">
                <button class="load-more-btn" @click="loadMoreReviews">
                  더 많은 리뷰 보기 ({{ reviews.length - displayedReviewCount }}개 더)
                </button>
              </div>

              <!-- 리뷰 작성 버튼 -->
              <div class="review-write-section">
                <button class="write-review-btn" @click="writeReview">
                  리뷰 작성하기
                </button>
              </div>
            </div>
          </div>

          <!-- 관련 제품 섹션 -->
          <div class="related-products-section" v-if="relatedProducts.length">
            <h2 class="section-title">🔗 비슷한 제품</h2>
            <div class="related-products-grid">
              <div
                  v-for="relatedProduct in relatedProducts"
                  :key="relatedProduct.id"
                  class="related-product-card"
                  @click="goToProduct(relatedProduct.id)"
              >
                <div class="related-product-image">
                  <img
                      v-if="relatedProduct.thumbnailUrl"
                      :src="relatedProduct.thumbnailUrl"
                      :alt="relatedProduct.name"
                      @error="handleImageError"
                  />
                  <span v-else class="placeholder">📦</span>
                </div>
                <div class="related-product-info">
                  <div class="related-product-name">{{ relatedProduct.name }}</div>
                  <div class="related-product-brand">{{ relatedProduct.brand }}</div>
                  <div class="related-product-stats">
                    ⭐ {{ relatedProduct.averageRating?.toFixed(1) || '0.0' }} •
                    거래 {{ relatedProduct.tradeCount || 0 }}명
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProduct } from '@/composables/useProduct'
import { useChat } from '@/composables/useChat'
import { productUtils } from '@/services/productService'

// Router
const route = useRoute()
const router = useRouter()

// Composables
const {
  getProduct,
  getReviews,
  likeProduct,
  bookmarkProduct,
  interestProduct,
  shareProduct,
  wishProduct,
  getRecommendedProducts
} = useProduct()
const { startChat } = useChat()

// Reactive data
const loading = ref(true)
const error = ref(null)
const actionLoading = ref(false)
const loadingReviews = ref(false)
const chatLoading = ref(false)
const chatError = ref('')

const product = ref(null)
const reviews = ref([])
const relatedProducts = ref([])
const availableTraders = ref([])

const currentImageIndex = ref(0)
const reviewSort = ref('latest')
const reviewPage = ref(0)
const hasMoreReviews = ref(false)

// 페이지네이션 관련
const displayedTradeCount = ref(5)
const displayedReviewCount = ref(3)

const userReaction = ref({
  hasLike: false,
  hasBookmark: false,
  hasInterest: false,
  hasShare: false,
  hasWish: false
})

// Computed
const currentImage = computed(() => {
  return imageFiles.value[currentImageIndex.value] || null
})

const imageFiles = computed(() => {
  return product.value?.attachmentFiles?.filter(file =>
      file.mimeType?.startsWith('image/')
  ) || []
})

const hasDetailInfo = computed(() => {
  return product.value?.distributor ||
      product.value?.price ||
      product.value?.feature ||
      product.value?.releaseDate ||
      product.value?.category ||
      product.value?.status
})

const showTradeSection = computed(() => {
  return product.value?.productType === 'SALE'
})

// 표시할 데이터 계산
const displayedTraders = computed(() =>
    availableTraders.value.slice(0, displayedTradeCount.value)
)

const displayedReviews = computed(() =>
    reviews.value.slice(0, displayedReviewCount.value)
)

// Methods
const fetchProduct = async () => {
  try {
    loading.value = true
    error.value = null

    const productId = route.params.id
    const response = await getProduct(productId)

    if (response.success) {
      product.value = response.data
      userReaction.value = response.data.userReaction || userReaction.value

      // 추가 데이터 로드
      await Promise.all([
        fetchReviews(),
        fetchRelatedProducts(),
        fetchAvailableTraders()
      ])
    } else {
      error.value = response.error || '상품을 불러올 수 없습니다.'
    }
  } catch (err) {
    error.value = err.message || '네트워크 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const fetchReviews = async () => {
  try {
    const response = await getReviews(product.value.id, {
      page: 0,
      size: 10,
      sort: getSortParam(reviewSort.value)
    })

    if (response.success) {
      reviews.value = response.data.content || []
      hasMoreReviews.value = !response.data.last
      reviewPage.value = 0
    }
  } catch (err) {
    console.error('리뷰 로드 실패:', err)
  }
}

const loadMoreReviews = async () => {
  try {
    loadingReviews.value = true
    const nextPage = reviewPage.value + 1

    const response = await getReviews(product.value.id, {
      page: nextPage,
      size: 10,
      sort: getSortParam(reviewSort.value)
    })

    if (response.success) {
      reviews.value.push(...(response.data.content || []))
      hasMoreReviews.value = !response.data.last
      reviewPage.value = nextPage
    }
  } catch (err) {
    console.error('추가 리뷰 로드 실패:', err)
  } finally {
    loadingReviews.value = false
  }
}

const fetchRelatedProducts = async () => {
  try {
    const response = await getRecommendedProducts({
      type: 'SIMILAR',
      size: 6,
      excludeId: product.value.id
    })

    if (response.success) {
      relatedProducts.value = response.data || []
    }
  } catch (err) {
    console.error('관련 상품 로드 실패:', err)
  }
}

const fetchAvailableTraders = async () => {
  // 실제로는 API에서 거래 가능한 사용자 목록을 가져옴
  // 여기서는 샘플 데이터 사용
  availableTraders.value = [
    {
      id: 1,
      name: '김민수',
      rating: 4.8,
      distance: '300m',
      message: '내일 저녁에 강남역에서 픽업 가능해요! 2명분 정도 나눠드려요'
    },
    {
      id: 2,
      name: '박지영',
      rating: 4.6,
      distance: '550m',
      message: '오늘 오후에 신논현역 근처에서 만나실 분! 세트로 시켜서 나눠먹어요'
    },
    {
      id: 3,
      name: '이서준',
      rating: 4.9,
      distance: '720m',
      message: '주말에 홍대에서 만나실 분들 구해요! 3-4명 정도 함께해요'
    },
    {
      id: 4,
      name: '최우진',
      rating: 4.3,
      distance: '1.2km',
      message: '택배 거래 가능해요. 안전거래 선호합니다'
    },
    {
      id: 5,
      name: '한지민',
      rating: 4.7,
      distance: '890m',
      message: '평일 오후 시간대 거래 가능합니다. 연락주세요!'
    }
  ]
}

const loadMoreTrades = () => {
  displayedTradeCount.value = Math.min(
      displayedTradeCount.value + 5,
      availableTraders.value.length
  )
}

const loadMoreReviewsDisplay = () => {
  displayedReviewCount.value = Math.min(
      displayedReviewCount.value + 3,
      reviews.value.length
  )
}

// 리액션 토글 메서드들
const toggleBookmark = async () => {
  try {
    actionLoading.value = true
    const response = await bookmarkProduct(product.value.id)

    if (response.success) {
      userReaction.value.hasBookmark = !userReaction.value.hasBookmark
      updateLikeCount()
    }
  } catch (err) {
    console.error('찜하기 실패:', err)
  } finally {
    actionLoading.value = false
  }
}

const toggleLike = async () => {
  try {
    actionLoading.value = true
    const response = await likeProduct(product.value.id)

    if (response.success) {
      userReaction.value.hasLike = !userReaction.value.hasLike
      updateLikeCount()
    }
  } catch (err) {
    console.error('좋아요 실패:', err)
  } finally {
    actionLoading.value = false
  }
}

const toggleInterest = async () => {
  try {
    actionLoading.value = true
    const response = await interestProduct(product.value.id)

    if (response.success) {
      userReaction.value.hasInterest = !userReaction.value.hasInterest
    }
  } catch (err) {
    console.error('관심상품 실패:', err)
  } finally {
    actionLoading.value = false
  }
}

const toggleShare = async () => {
  try {
    actionLoading.value = true
    const response = await shareProduct(product.value.id)

    if (response.success) {
      userReaction.value.hasShare = !userReaction.value.hasShare
      await shareToSystem()
    }
  } catch (err) {
    console.error('공유 실패:', err)
  } finally {
    actionLoading.value = false
  }
}

const toggleWish = async () => {
  try {
    actionLoading.value = true
    const response = await wishProduct(product.value.id)

    if (response.success) {
      userReaction.value.hasWish = !userReaction.value.hasWish
    }
  } catch (err) {
    console.error('위시리스트 실패:', err)
  } finally {
    actionLoading.value = false
  }
}

const updateLikeCount = () => {
  const hasAnyPositiveReaction = userReaction.value.hasLike || userReaction.value.hasBookmark
  if (hasAnyPositiveReaction) {
    product.value.likeCount = (product.value.likeCount || 0) + 1
  } else {
    product.value.likeCount = Math.max((product.value.likeCount || 0) - 1, 0)
  }
}

const shareToSystem = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: product.value.name,
        text: product.value.description,
        url: window.location.href
      })
    } catch (err) {
      // 공유 취소된 경우 무시
    }
  } else {
    // 폴백: 클립보드에 복사
    await navigator.clipboard.writeText(window.location.href)
    alert('링크가 클립보드에 복사되었습니다!')
  }
}

const startTrade = async (trader) => {
  try {
    const response = await startChat({
      chatContext: 'PRODUCT_TRADE',
      chatContextId: product.value.id,
      creatorId: trader.id,
      participantIds: [trader.id]
    })

    if (response.success) {
      router.push(`/chat/${response.data.roomId}`)
    }
  } catch (err) {
    console.error('거래 채팅 시작 실패:', err)
  }
}

const writeReview = () => {
  router.push(`/products/${product.value.id}/review`)
}

const goToTrade = () => {
  router.push(`/products/${product.value.id}/trade`)
}

const retryStartChat = () => {
  clearChatError()
  // 재시도 로직 구현
}

const clearChatError = () => {
  chatError.value = ''
}

const setCurrentImage = (index) => {
  currentImageIndex.value = index
}

const goBack = () => {
  router.go(-1)
}

const goToProduct = (productId) => {
  router.push(`/products/${productId}`)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// Utility methods
const formatPrice = (price) => productUtils.formatPrice(price)
const formatCount = (count) => productUtils.formatCount(count)
const formatDate = (date) => productUtils.formatDate(date)
const getRelativeTime = (date) => productUtils.getRelativeTime(date)

const getStatusClass = (status) => {
  const statusValue = typeof status === 'object' ? status.title : status
  const statusMap = {
    'APPROVED': '',
    'PENDING': 'pending',
    'REJECTED': 'rejected'
  }
  return statusMap[statusValue] || ''
}

const getStatusText = (status) => {
  const statusValue = typeof status === 'object' ? status.title : status
  const statusMap = {
    'APPROVED': '승인됨',
    'PENDING': '대기중',
    'REJECTED': '거부됨'
  }
  return statusMap[statusValue] || ''
}

const getStatusIcon = (productType) => {
  const iconMap = {
    'SALE': '💰',
    'AUCTION': '🔨',
    'FREE': '🎁',
    'EXCHANGE': '🔄'
  }
  return iconMap[productType] || '📦'
}

const getProductTypeText = (productType) => {
  return productUtils.getProductTypeText(productType)
}

const getReviewStatusText = (status) => {
  const statusMap = {
    'ACTIVE': '활성',
    'DELETED': '삭제됨',
    'REPORTED': '신고됨',
    'HIDDEN': '숨김'
  }
  return statusMap[status] || status
}

const isHighlightTag = (tag) => {
  const highlightTags = ['신상', '인기', '한정', '추천']
  return highlightTags.some(highlight => tag.includes(highlight))
}

const getSortParam = (sort) => {
  const sortMap = {
    'latest': 'createdAt,DESC',
    'rating': 'rating,DESC',
    'helpful': 'likeCount,DESC'
  }
  return sortMap[sort] || 'createdAt,DESC'
}

// Lifecycle
onMounted(() => {
  fetchProduct()
})

// Watchers
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchProduct()
  }
})
</script>

<style scoped>
/* 기본 스타일 */
.product-detail-view {
  min-height: 100vh;
  background: #f8fafc;
  color: #222222;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

/* 헤더 */
.header {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  height: 60px;
  gap: 20px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #f1f5f9;
}

.breadcrumb {
  color: #222222;
  font-size: 14px;
  opacity: 0.7;
}

.breadcrumb a {
  color: #1DCD9F;
  text-decoration: none;
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 메인 콘텐츠 */
.main-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  overflow: hidden;
}

/* 로딩 및 에러 상태 */
.loading-container, .error-container {
  padding: 60px 24px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #1DCD9F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message h3 {
  color: #ef4444;
  margin-bottom: 8px;
}

.retry-btn {
  background: #1DCD9F;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
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

.status-badge.pending {
  background: #f59e0b;
}

.status-badge.rejected {
  background: #ef4444;
}

/* 이미지 갤러리 */
.image-gallery {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.main-image {
  width: 100%;
  height: 400px;
  background: linear-gradient(45deg, #1DCD9F, #169976);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 80px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  font-size: 80px;
}

.image-nav {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.thumbnail-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #1DCD9F, #169976);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  overflow: hidden;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail.active {
  border-color: #1DCD9F;
}

/* 제품 정보 */
.product-info {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.info-section {
  margin-bottom: 24px;
}

.info-section:last-child {
  margin-bottom: 0;
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

.info-content div {
  margin-bottom: 4px;
}

.category-code {
  font-size: 12px;
  color: #666;
  font-weight: normal;
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

.keyword-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.keyword {
  background: #e2e8f0;
  color: #475569;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
}

/* 액션 섹션 */
.action-section {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

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
  font-size: 14px;
}

.action-btn.primary {
  background: #1DCD9F;
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #1DCD9F;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 리액션 버튼들 */
.reaction-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.reaction-btn {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  flex: 1;
  min-width: 120px;
}

.reaction-btn:hover:not(:disabled) {
  border-color: #1DCD9F;
  color: #1DCD9F;
}

.reaction-btn.active {
  border-color: #1DCD9F;
  background: #f0fdfa;
  color: #065f46;
}

.reaction-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 통계 정보 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: white;
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

/* 섹션 제목 */
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 20px;
  padding: 24px 24px 0 24px;
}

/* 거래 섹션 */
.trade-section {
  border-bottom: 1px solid #f1f5f9;
}

.trade-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 24px;
}

.trade-item {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s;
}

.trade-item:hover {
  border-color: #1DCD9F;
}

.trade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.trade-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  background: #1DCD9F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
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

.trade-distance {
  font-size: 12px;
  color: #222222;
  opacity: 0.7;
}

.trade-info {
  font-size: 13px;
  color: #222222;
  margin-bottom: 8px;
}

.trade-btn {
  background: #1DCD9F;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.trade-btn:hover {
  background: #169976;
}

.empty-trade {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
  margin: 0 24px;
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
  margin: 20px 24px 24px 24px;
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
  border-bottom: 1px solid #f1f5f9;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 24px 24px 0 24px;
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

.sort-select {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}

.reviews-container {
  padding: 0 24px 24px 24px;
}

.reviews-list {
  margin-bottom: 16px;
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

.review-status {
  font-size: 12px;
}

.status-indicator {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.status-indicator.active {
  background: #dcfce7;
  color: #166534;
}

.status-indicator.deleted {
  background: #fee2e2;
  color: #991b1b;
}

.status-indicator.reported {
  background: #fef3c7;
  color: #92400e;
}

.status-indicator.hidden {
  background: #f1f5f9;
  color: #64748b;
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

.report-count {
  color: #ef4444 !important;
  opacity: 1 !important;
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: #222222;
  opacity: 0.7;
}

.review-load-more {
  text-align: center;
  margin-bottom: 20px;
}

.review-write-section {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.write-review-btn {
  background: #1DCD9F;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.write-review-btn:hover {
  background: #16a085;
  transform: translateY(-1px);
}

/* 관련 제품 섹션 */
.related-products-section {
  border-bottom: 1px solid #f1f5f9;
}

.related-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 0 24px 24px 24px;
}

.related-product-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.related-product-card:hover {
  border-color: #1DCD9F;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.2);
}

.related-product-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(45deg, #1DCD9F, #169976);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
  overflow: hidden;
}

.related-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-product-image .placeholder {
  font-size: 40px;
}

.related-product-info {
  padding: 16px;
}

.related-product-name {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
  line-height: 1.4;
}

.related-product-brand {
  font-size: 12px;
  color: #222222;
  opacity: 0.7;
  margin-bottom: 8px;
}

.related-product-stats {
  font-size: 12px;
  color: #169976;
}

/* 채팅 로딩 및 에러 */
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
@media (max-width: 768px) {
  .main-container {
    padding: 16px;
  }

  .header-container {
    padding: 0 16px;
  }

  .product-title {
    font-size: 24px;
  }

  .main-image {
    height: 300px;
    font-size: 60px;
  }

  .placeholder-image {
    font-size: 60px;
  }

  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .reaction-buttons {
    flex-direction: column;
  }

  .reaction-btn {
    min-width: auto;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .related-products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }

  .section-title {
    font-size: 18px;
    padding: 20px 20px 0 20px;
  }

  .product-info,
  .action-section,
  .reviews-container {
    padding: 20px;
  }

  .trade-list {
    padding: 0 20px;
  }

  .related-products-grid {
    padding: 0 20px 20px 20px;
  }
}

@media (max-width: 480px) {
  .main-container {
    padding: 12px;
  }

  .product-title {
    font-size: 20px;
  }

  .meta-item {
    font-size: 14px;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 8px;
  }

  .stat-number {
    font-size: 16px;
  }

  .stat-label {
    font-size: 10px;
  }

  .related-products-grid {
    grid-template-columns: 1fr;
  }
}
</style>