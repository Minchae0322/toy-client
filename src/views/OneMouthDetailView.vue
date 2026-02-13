<!-- OneMouthDetailView.vue -->
<template>
  <div class="onemouth-detail">
    <PaymentModal
        v-if="showPaymentModal"
        :total-price="totalPrice"
        :product-price="currentPrice * quantity"
        @close="showPaymentModal = false"
        @confirm="handlePayment"
    />

    <AppHeader />

    <!-- 로딩 -->
    <div v-if="loading" class="loading-wrapper">
      <div class="spinner"></div>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="error-wrapper">
      <h3>상품을 불러올 수 없습니다</h3>
      <p>{{ error }}</p>
      <button @click="fetchOneMouthData" class="btn-retry">다시 시도</button>
    </div>

    <!-- 메인 -->
    <main v-else-if="oneMouth" class="container">
      <div class="detail-grid">
        <!-- 왼쪽 -->
        <div class="left-col">
          <ImageGallery
              :images="oneMouth.images || []"
              :current-index="currentImageIndex"
              :is-favorite="oneMouth.isFavorite"
              @update:current-index="currentImageIndex = $event"
              @toggle-favorite="toggleFavorite"
              @share="handleShare"
          />

          <ProductInfo :product="oneMouth" />

          <SellerInfo :seller="oneMouth.seller" />

          <CommentSection
              :comments="comments"
              :is-logged-in="isLoggedIn"
              :new-comment="newComment"
              @update:new-comment="newComment = $event"
              @submit="submitComment"
          />
        </div>

        <!-- 오른쪽 -->
        <div class="right-col">
          <PurchaseCard
              :product="oneMouth"
              :options="options"
              :selected-option="selectedOption"
              :quantity="quantity"
              :current-price="currentPrice"
              :delivery-fee="deliveryFee"
              :total-price="totalPrice"
              @update:selected-option="selectedOption = $event"
              @update:quantity="quantity = $event"
              @add-to-cart="addToCart"
              @buy-now="showPaymentModal = true"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useOneMouth } from '@/services/SalePostService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import PaymentModal from '@/components/oneMouth/detail/PaymentModal.vue'
import AppHeader from '@/components/oneMouth/detail/AppHeader.vue'
import ImageGallery from '@/components/oneMouth/detail/ImageGallery.vue'
import ProductInfo from '@/components/oneMouth/detail/ProductInfo.vue'
import SellerInfo from '@/components/oneMouth/detail/SellerInfo.vue'
import CommentSection from '@/components/oneMouth/detail/CommentSection.vue'
import PurchaseCard from '@/components/oneMouth/detail/PurchaseCard.vue'

const route = useRoute()
const oneMouthService = useOneMouth()
const { open } = useConfirmDialog()

const loading = ref(false)
const error = ref(null)
const oneMouth = ref(null)
const comments = ref([])
const currentImageIndex = ref(0)
const quantity = ref(1)
const selectedOption = ref('10')
const showPaymentModal = ref(false)
const newComment = ref('')
const isLoggedIn = ref(true)

const options = ref([
  { id: '5', label: '5개', price: 8000 },
  { id: '10', label: '10개', price: 15000 },
  { id: '20', label: '20개', price: 28000 }
])

const currentPrice = computed(() => {
  if (oneMouth.value?.sellingPrice) {
    return oneMouth.value.sellingPrice
  }
  return options.value.find(o => o.id === selectedOption.value)?.price || 15000
})

const deliveryFee = computed(() => 3000)
const totalPrice = computed(() => currentPrice.value * quantity.value + deliveryFee.value)

const fetchOneMouthData = async () => {
  loading.value = true
  error.value = null

  try {
    const id = route.params.id
    const response = await oneMouthService.getDetail(id)

    if (response.success) {
      oneMouth.value = response.data
      await oneMouthService.incrementView(id)
      await fetchComments(id)
    } else {
      error.value = response.error || '상품을 불러올 수 없습니다'
    }
  } catch (err) {
    console.error('Failed to fetch OneMouth:', err)
    error.value = '네트워크 오류가 발생했습니다'
  } finally {
    loading.value = false
  }
}

const fetchComments = async (id) => {
  try {
    const response = await oneMouthService.getComments(id, { size: 20 })
    if (response.data) {
      comments.value = response.data.content || []
    }
  } catch (err) {
    console.error('Failed to fetch comments:', err)
  }
}

const toggleFavorite = async () => {
  try {
    const response = await oneMouthService.toggleFavorite(oneMouth.value.oneMouthId)
    if (response.success) {
      oneMouth.value.isFavorite = !oneMouth.value.isFavorite
    }
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
  }
}

const handleShare = async () => {
  if (navigator.share) {
    navigator.share({
      title: oneMouth.value?.title,
      text: oneMouth.value?.description,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    await open({ type: 'alert', title: '링크 복사', message: '링크가 복사되었습니다' })
  }
}

const addToCart = async () => {
  console.log('Add to cart:', {
    oneMouthId: oneMouth.value?.oneMouthId,
    quantity: quantity.value,
    option: selectedOption.value
  })
  await open({ type: 'alert', title: '장바구니', message: '장바구니에 추가되었습니다' })
}

const handlePayment = async (paymentData) => {
  console.log('Payment:', paymentData)
  await open({ type: 'alert', title: '결제 완료', message: '결제가 완료되었습니다' })
  showPaymentModal.value = false
}

const submitComment = async () => {
  if (!newComment.value.trim()) return

  try {
    const response = await oneMouthService.createComment(
        oneMouth.value.oneMouthId,
        newComment.value
    )

    if (response.data) {
      comments.value.unshift(response.data)
      newComment.value = ''
    }
  } catch (err) {
    console.error('Failed to submit comment:', err)
  }
}

onMounted(() => {
  fetchOneMouthData()
})

watch(() => route.params.id, () => {
  fetchOneMouthData()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.onemouth-detail {
  min-height: 100vh;
  background: #FAFAFA;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  color: #1A1A1A;
}

/* 로딩 & 에러 */
.loading-wrapper,
.error-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #E5E5E5;
  border-top-color: #1A1A1A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-wrapper h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #EF4444;
}

.error-wrapper p {
  color: #737373;
  margin-bottom: 1.5rem;
}

.btn-retry {
  padding: 0.75rem 2rem;
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #404040;
  transform: translateY(-1px);
}

/* 레이아웃 */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}

@media (min-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1.4fr 1fr;
  }
}

.left-col {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.right-col {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

/* 반응형 */
@media (max-width: 1023px) {
  .container {
    padding: 2rem 1rem;
  }

  .detail-grid {
    gap: 2rem;
  }

  .left-col {
    gap: 3rem;
  }

  .right-col {
    position: static;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 1.5rem 1rem;
  }
}
</style>