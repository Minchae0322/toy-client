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

        <!-- 로그인한 사용자에게만 편집/관리 버튼 표시 -->
        <div v-if="isLoggedIn && isOwner" class="header-actions">
          <button class="edit-btn" @click="editProduct">
            ✏️ 수정
          </button>
          <button class="delete-btn" @click="deleteProduct">
            🗑️ 삭제
          </button>
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
            <button @click="fetchProductData" class="retry-btn">다시 시도</button>
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
                <span class="rating">{{ formatRating(product.averageRating) }}</span>
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
          </div>

          <!-- 액션 버튼 섹션 -->
          <div class="action-section">
            <!-- 로그인하지 않은 사용자를 위한 안내 -->
            <div v-if="!isLoggedIn" class="login-notice">
              <div class="login-notice-content">
                <span>💡</span>
                <span>로그인하시면 찜하기, 리뷰 작성 등 더 많은 기능을 이용할 수 있어요!</span>
                <router-link to="/login" class="login-link">로그인하기</router-link>
              </div>
            </div>

            <div class="action-buttons">
              <button
                  class="action-btn"
                  :class="{
                    primary: isLoggedIn && userReaction.hasBookmark,
                    secondary: !isLoggedIn || !userReaction.hasBookmark,
                    disabled: !isLoggedIn
                  }"
                  @click="handleBookmarkAction"
                  :disabled="actionLoading"
              >
                {{ isLoggedIn
                  ? (userReaction.hasBookmark ? '💖 찜했음' : '❤️ 찜하기')
                  : '❤️ 찜하기 (로그인 필요)'
                }}
              </button>
              <button class="action-btn secondary" @click="handleShareAction">
                📤 공유
              </button>
            </div>

            <!-- 로그인한 사용자에게만 추가 리액션 버튼 표시 -->
            <div v-if="isLoggedIn" class="reaction-buttons">
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
                <div class="stat-number">{{ formatCount(product.viewCount) }}</div>
                <div class="stat-label">조회수</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ formatCount(product.likeCount) }}</div>
                <div class="stat-label">찜</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ formatCount(product.interestCount || 0) }}</div>
                <div class="stat-label">관심</div>
              </div>
            </div>
          </div>

          <!-- 탭 네비게이션 -->
          <div class="tabs-section">
            <div class="tabs-nav">
              <button
                  class="tab-btn"
                  :class="{ active: activeTab === 'reviews' }"
                  @click="activeTab = 'reviews'"
              >
                💬 리뷰 ({{ product.reviewCount || 0 }})
              </button>
              <button
                  class="tab-btn"
                  :class="{ active: activeTab === 'trades' }"
                  @click="activeTab = 'trades'"
              >
                🛒 개인거래 ({{ oneMouthTrades.length }})
              </button>
            </div>

            <!-- 리뷰 탭 콘텐츠 -->
            <div v-show="activeTab === 'reviews'" class="tab-content">
              <div class="reviews-header">
                <div class="reviews-stats">
                  <span class="avg-rating">⭐ {{ formatRating(product.averageRating) }}</span>
                  <span class="review-count">{{ product.reviewCount || 0 }}개의 리뷰</span>
                </div>
                <button
                    class="write-review-btn"
                    @click="handleWriteReviewAction"
                    :disabled="!isLoggedIn"
                >
                  {{ isLoggedIn ? '리뷰 작성하기' : '로그인 후 리뷰 작성' }}
                </button>
              </div>

              <!-- 리뷰 목록 -->
              <div v-if="product.recentReviews?.length > 0" class="reviews-list">
                <div
                    v-for="review in product.recentReviews"
                    :key="review.id"
                    class="review-item"
                >
                  <div class="review-header">
                    <div class="review-user">
                      <div class="user-avatar">{{ getInitial(review.userName) }}</div>
                      <div class="user-info">
                        <div class="user-name">{{ review.userName }}</div>
                        <div class="user-rating">⭐ {{ formatRating(review.rating) }}</div>
                      </div>
                    </div>
                    <div class="review-date">{{ getRelativeTime(review.createdAt) }}</div>
                  </div>
                  <div class="review-content">{{ review.comment }}</div>
                </div>
              </div>
              <div v-else class="empty-state">
                <div class="empty-icon">💬</div>
                <p>아직 작성된 리뷰가 없습니다</p>
                <button class="write-review-btn" @click="handleWriteReviewAction" :disabled="!isLoggedIn">
                  첫 리뷰 작성하기
                </button>
              </div>
            </div>

            <!-- 개인거래 탭 콘텐츠 -->
            <div v-show="activeTab === 'trades'" class="tab-content">
              <div class="trades-header">
                <div class="trades-info">
                  <span class="trades-count">{{ oneMouthTrades.length }}개의 거래</span>
                  <span class="trades-desc">이 상품으로 진행중인 개인거래입니다</span>
                </div>
                <button class="create-trade-btn" @click="createTrade">
                  거래 등록하기
                </button>
              </div>

              <!-- 거래 목록 -->
              <div v-if="oneMouthTrades.length > 0" class="trades-grid">
                <div
                    v-for="trade in oneMouthTrades"
                    :key="trade.oneMouthId"
                    class="trade-card"
                    @click="viewTrade(trade.oneMouthId)"
                >
                  <div class="trade-image">
                    <img v-if="trade.thumbnailUrl" :src="trade.thumbnailUrl" :alt="trade.title" />
                    <div v-else class="trade-placeholder">🛒</div>
                    <div class="trade-status-badge" :class="trade.oneMouthStatus.toLowerCase()">
                      {{ getTradeStatusText(trade.oneMouthStatus) }}
                    </div>
                  </div>
                  <div class="trade-info">
                    <h4 class="trade-title">{{ trade.title }}</h4>
                    <div class="trade-price">{{ formatPrice(trade.sellingPrice) }}</div>
                    <div class="trade-meta">
                      <span>📍 {{ trade.tradeLocation || '지역미정' }}</span>
                      <span>👁 {{ trade.viewCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <div class="empty-icon">🛒</div>
                <p>아직 등록된 거래가 없습니다</p>
                <button class="create-trade-btn" @click="createTrade">
                  첫 거래 등록하기
                </button>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

    <!-- 로그인 유도 모달 -->
    <div v-if="showLoginModal" class="login-modal-overlay" @click="closeLoginModal">
      <div class="login-modal-content" @click.stop>
        <div class="login-modal-icon">🔒</div>
        <h3>{{ loginModalTitle }}</h3>
        <p>{{ loginModalMessage }}</p>
        <div class="login-modal-actions">
          <button class="modal-btn secondary" @click="closeLoginModal">
            나중에 하기
          </button>
          <router-link
              :to="{ path: '/login', query: { redirect: $route.fullPath } }"
              class="modal-btn primary"
              @click="closeLoginModal"
          >
            로그인하기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { productService, productUtils } from '@/services/ProductService.js'

// Router
const route = useRoute()
const router = useRouter()

// Auth Composable
const {
  user,
  isLoggedIn,
  userId,
  userNickname
} = useAuth()

// Reactive data
const loading = ref(true)
const error = ref(null)
const actionLoading = ref(false)
const showLoginModal = ref(false)
const loginModalTitle = ref('')
const loginModalMessage = ref('')

const product = ref(null)
const currentImageIndex = ref(0)
const activeTab = ref('reviews') // 'reviews' 또는 'trades'
const oneMouthTrades = ref([]) // 개인거래 목록

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
  if (!product.value?.attachmentFiles) return []

  return product.value.attachmentFiles.filter(file => {
    if (file.contentType) {
      return file.contentType.startsWith('image/')
    }
    if (file.orgFileNm) {
      const ext = file.orgFileNm.split('.').pop().toLowerCase()
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
    }
    return file.fileUrl != null
  })
})

const hasDetailInfo = computed(() => {
  return product.value?.distributor ||
      product.value?.price ||
      product.value?.feature ||
      product.value?.releaseDate ||
      product.value?.category ||
      product.value?.status
})

const isOwner = computed(() => {
  return isLoggedIn.value &&
      userId.value &&
      product.value?.creatorId &&
      userId.value === product.value.creatorId
})

// ==================== 데이터 로드 메서드 ====================
const fetchProductData = async () => {
  try {
    loading.value = true
    error.value = null

    const productId = route.params.id
    const response = await productService.getProduct(productId)

    if (response.success) {
      product.value = response.data

      if (isLoggedIn.value && response.data.userReaction) {
        userReaction.value = response.data.userReaction
      }

      // 개인거래 목록 로드
      await fetchOneMouthTrades(productId)
    } else {
      error.value = response.error || '상품을 불러올 수 없습니다.'
    }
  } catch (err) {
    error.value = err.message || '네트워크 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// 개인거래 목록 조회
const fetchOneMouthTrades = async (productId) => {
  try {
    // API 호출 (실제 구현 시)
    // const response = await oneMouthService.getTradesByProduct(productId)
    // oneMouthTrades.value = response.data || []

    // 샘플 데이터
    oneMouthTrades.value = [
      {
        oneMouthId: 1,
        title: '스타벅스 콜드브루 할인 판매',
        sellingPrice: 3500,
        tradeLocation: '강남역',
        viewCount: 45,
        oneMouthStatus: 'ON_SALE',
        thumbnailUrl: ''
      },
      {
        oneMouthId: 2,
        title: '급처! 스타벅스 쿠폰',
        sellingPrice: 3000,
        tradeLocation: '홍대입구',
        viewCount: 32,
        oneMouthStatus: 'RESERVED',
        thumbnailUrl: ''
      }
    ]
  } catch (err) {
    console.error('개인거래 목록 조회 실패:', err)
    oneMouthTrades.value = []
  }
}

// ==================== 인증 관련 액션 핸들러 ====================
const showLoginRequiredModal = (title, message) => {
  loginModalTitle.value = title
  loginModalMessage.value = message
  showLoginModal.value = true
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

const handleBookmarkAction = async () => {
  if (!isLoggedIn.value) {
    showLoginRequiredModal(
        '로그인이 필요합니다',
        '상품을 찜하려면 로그인해주세요.'
    )
    return
  }
  await toggleBookmark()
}

const handleShareAction = async () => {
  await shareToSystem()
}

const handleWriteReviewAction = () => {
  if (!isLoggedIn.value) {
    showLoginRequiredModal(
        '로그인이 필요합니다',
        '리뷰를 작성하려면 로그인해주세요.'
    )
    return
  }
  writeReview()
}

// ==================== 상품 관리 액션 ====================
const editProduct = () => {
  router.push(`/products/${product.value.id}/edit`)
}

const deleteProduct = async () => {
  if (confirm('정말로 이 상품을 삭제하시겠습니까?')) {
    try {
      await productService.deleteProduct(product.value.id)
      alert('상품이 삭제되었습니다.')
      router.push('/products')
    } catch (err) {
      console.error('상품 삭제 실패:', err)
      alert('상품 삭제에 실패했습니다.')
    }
  }
}

// ==================== 리액션 토글 메서드들 ====================
const toggleBookmark = async () => {
  try {
    actionLoading.value = true
    const response = await productService.bookmarkProduct(product.value.id)

    if (response.success) {
      userReaction.value.hasBookmark = !userReaction.value.hasBookmark
      updateLikeCount()
    }
  } catch (err) {
    console.error('찜하기 실패:', err)
    alert('찜하기 처리 중 오류가 발생했습니다.')
  } finally {
    actionLoading.value = false
  }
}

const toggleLike = async () => {
  try {
    actionLoading.value = true
    const response = await productService.likeProduct(product.value.id)

    if (response.success) {
      userReaction.value.hasLike = !userReaction.value.hasLike
      updateLikeCount()
    }
  } catch (err) {
    console.error('좋아요 실패:', err)
    alert('좋아요 처리 중 오류가 발생했습니다.')
  } finally {
    actionLoading.value = false
  }
}

const toggleInterest = async () => {
  try {
    actionLoading.value = true
    const response = await productService.toggleProductReaction(product.value.id, 'INTEREST')

    if (response.success) {
      userReaction.value.hasInterest = !userReaction.value.hasInterest
    }
  } catch (err) {
    console.error('관심상품 실패:', err)
    alert('관심상품 처리 중 오류가 발생했습니다.')
  } finally {
    actionLoading.value = false
  }
}

const toggleWish = async () => {
  try {
    actionLoading.value = true
    const response = await productService.toggleProductReaction(product.value.id, 'WISH')

    if (response.success) {
      userReaction.value.hasWish = !userReaction.value.hasWish
    }
  } catch (err) {
    console.error('위시리스트 실패:', err)
    alert('위시리스트 처리 중 오류가 발생했습니다.')
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
  try {
    if (navigator.share) {
      await navigator.share({
        title: product.value.name,
        text: product.value.description,
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다!')
    }

    if (isLoggedIn.value) {
      try {
        await productService.toggleProductReaction(product.value.id, 'SHARE')
      } catch (err) {
        console.warn('공유 통계 업데이트 실패:', err)
      }
    }
  } catch (err) {
    console.log('공유 취소됨:', err)
  }
}

// ==================== 리뷰 관련 메서드 ====================
const writeReview = () => {
  router.push(`/products/${product.value.id}/review`)
}

// ==================== 개인거래 관련 메서드 ====================
const createTrade = () => {
  if (!isLoggedIn.value) {
    showLoginRequiredModal(
        '로그인이 필요합니다',
        '거래를 등록하려면 로그인해주세요.'
    )
    return
  }
  router.push(`/one-mouth/create?productId=${product.value.id}`)
}

const viewTrade = (tradeId) => {
  router.push(`/one-mouth/${tradeId}`)
}

const getTradeStatusText = (status) => {
  const statusMap = {
    'ON_SALE': '판매중',
    'RESERVED': '예약중',
    'SOLD_OUT': '판매완료'
  }
  return statusMap[status] || '알 수 없음'
}

// ==================== 네비게이션 및 UI 메서드 ====================
const setCurrentImage = (index) => {
  currentImageIndex.value = index
}

const goBack = () => {
  router.go(-1)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// ==================== 유틸리티 메서드 ====================
const formatPrice = (price) => productUtils.formatPrice(price)
const formatCount = (count) => productUtils.formatCount(count)
const formatDate = (date) => productUtils.formatDate(date)
const getRelativeTime = (date) => productUtils.formatDate(date)
const formatRating = (rating) => productUtils.formatRating(rating)

const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?'
}

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
  const textMap = {
    'SALE': '판매',
    'AUCTION': '경매',
    'FREE': '무료나눔',
    'EXCHANGE': '교환'
  }
  return textMap[productType] || '기타'
}

const isHighlightTag = (tag) => {
  const highlightTags = ['신상', '인기', '한정', '추천']
  return highlightTags.some(highlight => tag.includes(highlight))
}

// ==================== 라이프사이클 ====================
onMounted(() => {
  fetchProductData()
})

// ==================== 감시자 ====================
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchProductData()
  }
})

watch(isLoggedIn, (newValue) => {
  if (newValue) {
    fetchProductData()
  } else {
    userReaction.value = {
      hasLike: false,
      hasBookmark: false,
      hasInterest: false,
      hasShare: false,
      hasWish: false
    }
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  flex: 1;
}

.breadcrumb a {
  color: #1DCD9F;
  text-decoration: none;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  border-color: #1DCD9F;
  color: #1DCD9F;
  background: white;
}

.edit-btn:hover {
  background: #1DCD9F;
  color: white;
}

.delete-btn {
  border-color: #ef4444;
  color: #ef4444;
  background: white;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  background: rgba(0, 0, 0, 0.7);
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
  flex-shrink: 0;
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

/* 액션 섹션 */
.action-section {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

/* 로그인 안내 */
.login-notice {
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
  border-radius: 12px;
  border-left: 4px solid #1DCD9F;
}

.login-notice-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.login-notice-content span:first-child {
  font-size: 20px;
}

.login-notice-content span:nth-child(2) {
  flex: 1;
  font-size: 14px;
  color: #0369a1;
}

.login-link {
  padding: 6px 16px;
  background: #1DCD9F;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
}

.login-link:hover {
  background: #169976;
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

.action-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
}

.action-btn:hover:not(:disabled):not(.disabled) {
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

/* 탭 섹션 */
.tabs-section {
  border-bottom: 1px solid #f1f5f9;
}

.tabs-nav {
  display: flex;
  border-bottom: 2px solid #f1f5f9;
  padding: 0 24px;
}

.tab-btn {
  padding: 16px 24px;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #1DCD9F;
}

.tab-btn.active {
  color: #1DCD9F;
  font-weight: 600;
  border-bottom-color: #1DCD9F;
}

.tab-content {
  padding: 24px;
}

/* 리뷰 헤더 */
.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.reviews-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.avg-rating {
  font-size: 18px;
  font-weight: 600;
  color: #169976;
}

.review-count {
  font-size: 14px;
  color: #64748b;
}

.write-review-btn {
  background: #1DCD9F;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.write-review-btn:hover:not(:disabled) {
  background: #169976;
  transform: translateY(-1px);
}

.write-review-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

/* 리뷰 목록 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
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

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #000000;
  font-size: 14px;
}

.user-rating {
  font-size: 12px;
  color: #169976;
}

.review-date {
  font-size: 12px;
  color: #64748b;
}

.review-content {
  font-size: 14px;
  line-height: 1.6;
  color: #222222;
}

/* 거래 헤더 */
.trades-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.trades-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trades-count {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
}

.trades-desc {
  font-size: 13px;
  color: #64748b;
}

.create-trade-btn {
  background: #1DCD9F;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-trade-btn:hover {
  background: #169976;
  transform: translateY(-1px);
}

/* 거래 그리드 */
.trades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.trade-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.trade-card:hover {
  border-color: #1DCD9F;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.15);
}

.trade-image {
  width: 100%;
  height: 180px;
  background: #f8fafc;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.trade-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trade-placeholder {
  font-size: 48px;
  opacity: 0.3;
}

.trade-status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.trade-status-badge.on_sale {
  background: #1DCD9F;
}

.trade-status-badge.reserved {
  background: #f59e0b;
}

.trade-status-badge.sold_out {
  background: #64748b;
}

.trade-info {
  padding: 16px;
}

.trade-title {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trade-price {
  font-size: 18px;
  font-weight: 700;
  color: #1DCD9F;
  margin-bottom: 8px;
}

.trade-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 24px;
}

/* 로그인 모달 */
.login-modal-overlay {
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

.login-modal-content {
  background: white;
  padding: 32px;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.login-modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-modal-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 12px;
}

.login-modal-content p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.5;
}

.login-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
}

.modal-btn.secondary:hover {
  background: #e2e8f0;
}

.modal-btn.primary {
  background: #1DCD9F;
  color: white;
}

.modal-btn.primary:hover {
  background: #169976;
}

/* 접근성 개선 */
.action-btn:focus,
.reaction-btn:focus,
.write-review-btn:focus,
.create-trade-btn:focus {
  outline: 2px solid #1DCD9F;
  outline-offset: 2px;
}

/* 스크롤바 스타일링 */
.thumbnail-list::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  background: #1DCD9F;
  border-radius: 2px;
}

.thumbnail-list::-webkit-scrollbar-thumb:hover {
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

  .header-actions {
    display: none;
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

  .tabs-nav {
    padding: 0 16px;
  }

  .tab-btn {
    padding: 14px 16px;
    font-size: 14px;
  }

  .tab-content {
    padding: 16px;
  }

  .login-notice-content {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 8px;
  }

  .login-link {
    align-self: center;
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

  .reviews-header, .trades-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .reviews-stats {
    justify-content: center;
  }

  .trades-info {
    text-align: center;
  }

  .trades-grid {
    grid-template-columns: 1fr;
  }

  .login-modal-content {
    padding: 24px;
  }

  .login-modal-actions {
    flex-direction: column;
  }

  .product-info,
  .action-section {
    padding: 20px;
  }

  .image-gallery {
    padding: 20px;
  }

  .product-header {
    padding: 20px;
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

  .breadcrumb {
    font-size: 12px;
  }

  .login-notice-content span:nth-child(2) {
    font-size: 13px;
  }

  .tab-btn {
    padding: 12px 12px;
    font-size: 13px;
  }

  .avg-rating {
    font-size: 16px;
  }

  .trades-count {
    font-size: 16px;
  }
}
</style>