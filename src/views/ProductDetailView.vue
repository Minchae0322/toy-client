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

          <!-- 리뷰 섹션 -->
          <div class="reviews-section" v-if="product.recentReviews?.length > 0">
            <div class="reviews-header">
              <div class="reviews-title">💬 최근 리뷰</div>
              <div class="reviews-stats">
                <span>⭐ {{ formatRating(product.averageRating) }}</span>
              </div>
            </div>

            <!-- 리뷰 목록 -->
            <div class="reviews-container">
              <div class="reviews-list">
                <div
                    v-for="review in product.recentReviews"
                    :key="review.id"
                    class="review-item"
                >
                  <div class="review-header">
                    <div class="review-user">
                      <div class="user-avatar">{{ getInitial(review.userName) }}</div>
                      <div class="user-name">{{ review.userName }}</div>
                      <div class="user-rating">⭐ {{ formatRating(review.rating) }}</div>
                    </div>
                  </div>
                  <div class="review-content">{{ review.comment }}</div>
                  <div class="review-meta">
                    <span>{{ getRelativeTime(review.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- 리뷰 작성 버튼 -->
              <div class="review-write-section">
                <button
                    class="write-review-btn"
                    @click="handleWriteReviewAction"
                    :disabled="!isLoggedIn"
                >
                  {{ isLoggedIn ? '리뷰 작성하기' : '로그인 후 리뷰 작성' }}
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

const isOwner = computed(() => {
  return isLoggedIn.value &&
      userId.value &&
      product.value?.creatorId &&
      userId.value === product.value.creatorId
})

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

// ==================== 데이터 로드 메서드 ====================

const fetchProductData = async () => {
  try {
    loading.value = true
    error.value = null

    const productId = route.params.id
    const response = await productService.getProduct(productId)

    if (response.success) {
      product.value = response.data

      // 로그인한 사용자의 리액션 정보 설정
      if (isLoggedIn.value && response.data.userReaction) {
        userReaction.value = response.data.userReaction
      }
    } else {
      error.value = response.error || '상품을 불러올 수 없습니다.'
    }
  } catch (err) {
    error.value = err.message || '네트워크 오류가 발생했습니다.'
  } finally {
    loading.value = false
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

    // 로그인한 사용자는 공유 통계에 반영
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

// 로그인 상태 변경 감지
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    // 로그인 후 상품 정보 다시 로드 (개인화된 정보 포함)
    fetchProductData()
  } else {
    // 로그아웃 시 개인 리액션 정보 초기화
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

/* 섹션 제목 */
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 20px;
  padding: 24px 24px 0 24px;
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

.write-review-btn:hover:not(:disabled) {
  background: #16a085;
  transform: translateY(-1px);
}

.write-review-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
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

  .related-products-grid {
    padding: 0 20px 20px 20px;
  }

  .login-modal-content {
    padding: 24px;
  }

  .login-modal-actions {
    flex-direction: column;
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

  .breadcrumb {
    font-size: 12px;
  }

  .login-notice-content span:nth-child(2) {
    font-size: 13px;
  }
}

/* 접근성 개선 */
.action-btn:focus,
.reaction-btn:focus,
.write-review-btn:focus {
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
</style>