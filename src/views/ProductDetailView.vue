<template>
  <div class="product-detail-view">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="breadcrumb">
          <router-link to="/">홈</router-link>
          <span class="separator">/</span>
          <router-link to="/products">상품</router-link>
          <span class="separator">/</span>
          <span class="current">{{ product?.name || '상품 상세' }}</span>
        </div>

        <div v-if="isLoggedIn && isOwner" class="header-actions">
          <button class="edit-btn" @click="editProduct">수정</button>
          <button class="delete-btn" @click="deleteProduct">삭제</button>
        </div>
      </div>
    </header>

    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <main class="main-content">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>상품 정보를 불러오는 중입니다</p>
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
          <ProductHeader
              v-if="product"
              :product="product"
              :is-logged-in="isLoggedIn"
          />

          <!-- 이미지 갤러리 -->
          <ImageGallery
              v-if="product"
              :product="product"
              :current-image-index="currentImageIndex"
              @update:current-image-index="currentImageIndex = $event"
          />

          <!-- 제품 정보 -->
          <ProductInfo
              v-if="product"
              :product="product"
          />

          <!-- 액션 버튼 섹션 -->
          <ActionSection
              v-if="product"
              :is-logged-in="isLoggedIn"
              :product="product"
              :user-reaction="userReaction"
              :action-loading="actionLoading"
              @bookmark="handleBookmarkAction"
              @share="handleShareAction"
              @like="toggleLike"
              @interest="toggleInterest"
              @wish="toggleWish"
          />

          <!-- 리뷰 섹션 -->
          <ReviewSection
              :product-id="product.id"
              :is-logged-in="isLoggedIn"
              @write-review="handleWriteReviewAction"
              @refresh-product="fetchProductData"
          />

          <!-- 개인거래 섹션 -->
          <TradeSection
              v-if="product && oneMouthTrades"
              :trades="oneMouthTrades"
              :is-logged-in="isLoggedIn"
              :product-id="product.id"
              @create-trade="createTrade"
              @view-trade="viewTrade"
          />
        </template>
      </main>
    </div>

    <!-- 로그인 유도 모달 -->
    <LoginModal
        v-if="showLoginModal"
        :title="loginModalTitle"
        :message="loginModalMessage"
        @close="closeLoginModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { productService } from '@/services/ProductService.js'

// 컴포넌트 임포트
import ProductHeader from '@/components/product/detail/ProductHeader.vue'
import ImageGallery from '@/components/product/detail/ImageGallery.vue'
import ProductInfo from '@/components/product/detail/ProductInfo.vue'
import ActionSection from '@/components/product/detail/ActionSection.vue'
import ReviewSection from '@/components/product/detail/ReviewSection.vue'
import TradeSection from '@/components/product/detail/TradeSection.vue'
import LoginModal from '@/components/product/detail/LoginModal.vue'

const route = useRoute()
const router = useRouter()

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
const oneMouthTrades = ref([])

const userReaction = ref({
  hasLike: false,
  hasBookmark: false,
  hasInterest: false,
  hasShare: false,
  hasWish: false
})

// Computed
const isOwner = computed(() => {
  return isLoggedIn.value &&
      userId.value &&
      product.value?.creatorId &&
      userId.value === product.value.creatorId
})

// 데이터 로드
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

const fetchOneMouthTrades = async (productId) => {
  try {
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

// 인증 관련 액션
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
    showLoginRequiredModal('로그인이 필요합니다', '상품을 찜하려면 로그인해주세요.')
    return
  }
  await toggleBookmark()
}

const handleShareAction = async () => {
  await shareToSystem()
}

const handleWriteReviewAction = () => {
  if (!isLoggedIn.value) {
    showLoginRequiredModal('로그인이 필요합니다', '리뷰를 작성하려면 로그인해주세요.')
    return
  }
  writeReview()
}

// 상품 관리
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

// 리액션
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

// 리뷰
const writeReview = () => {
  router.push(`/products/${product.value.id}/review`)
}

// 개인거래
const createTrade = () => {
  if (!isLoggedIn.value) {
    showLoginRequiredModal('로그인이 필요합니다', '거래를 등록하려면 로그인해주세요.')
    return
  }
  router.push(`/one-mouth/create?productId=${product.value.id}`)
}

const viewTrade = (tradeId) => {
  router.push(`/one-mouth/${tradeId}`)
}

// 네비게이션
const goBack = () => {
  router.go(-1)
}

// 라이프사이클
onMounted(() => {
  fetchProductData()
})

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
.product-detail-view {
  min-height: 100vh;
  background: #FAFAFA;
  color: #1F2937;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  letter-spacing: -0.01em;
}

.header {
  background: white;
  border-bottom: 1px solid #E5E7EB;
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
  height: 64px;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: #F3F4F6;
  color: #111827;
}

.breadcrumb {
  color: #9CA3AF;
  font-size: 14px;
  flex: 1;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb a {
  color: #059669;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: #047857;
}

.breadcrumb .separator {
  color: #D1D5DB;
}

.breadcrumb .current {
  color: #1F2937;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.edit-btn {
  border-color: #D1D5DB;
  color: #374151;
  background: white;
}

.edit-btn:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.delete-btn {
  border-color: #FEE2E2;
  color: #DC2626;
  background: #FEF2F2;
}

.delete-btn:hover {
  background: #FEE2E2;
  border-color: #FECACA;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.main-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.loading-container, .error-container {
  padding: 80px 24px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F3F4F6;
  border-top: 3px solid #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  font-size: 15px;
  color: #6B7280;
  font-weight: 500;
}

.error-message h3 {
  color: #DC2626;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.error-message p {
  color: #6B7280;
  margin-bottom: 24px;
  font-size: 14px;
}

.retry-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.retry-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

@media (max-width: 768px) {
  .main-container {
    padding: 24px 16px 60px;
  }

  .header-container {
    padding: 0 16px;
    height: 56px;
  }

  .header-actions {
    display: none;
  }

  .breadcrumb {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .main-container {
    padding: 16px 12px 60px;
  }

  .main-content {
    border-radius: 12px;
  }
}
</style>