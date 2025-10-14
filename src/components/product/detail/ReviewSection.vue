<template>
  <section class="review-section">
    <!-- 헤더 -->
    <div class="section-header">
      <div class="header-left">
        <h2 class="section-title">고객 리뷰</h2>
        <span class="review-count">{{ totalReviewCount }}</span>
      </div>

      <button
          v-if="isLoggedIn"
          @click="handleReviewWrite"
          class="btn-write-review"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M11.333 2.667L13.333 4.667L5.333 12.667H3.333V10.667L11.333 2.667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 4L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        리뷰 작성
      </button>
    </div>

    <!-- 평점 통계 -->
    <div v-if="reviewStats" class="stats-container">
      <div class="stats-summary">
        <div class="rating-large">
          <span class="rating-number">{{ formatRating(reviewStats.averageRating) }}</span>
          <div class="rating-stars">
            <div class="stars-display">
              <span
                  v-for="i in 5"
                  :key="i"
                  class="star"
                  :class="{ filled: i <= Math.round(reviewStats.averageRating) }"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 1.667L12.575 6.883L18.333 7.725L14.167 11.783L15.15 17.517L10 14.808L4.85 17.517L5.833 11.783L1.667 7.725L7.425 6.883L10 1.667Z"/>
                </svg>
              </span>
            </div>
          </div>
          <p class="rating-description">{{ totalReviewCount }}개의 평가</p>
        </div>

        <div class="rating-distribution">
          <div
              v-for="i in 5"
              :key="i"
              class="distribution-bar"
          >
            <span class="bar-label">{{ 6 - i }}점</span>
            <div class="bar-track">
              <div
                  class="bar-fill"
                  :style="{ width: getRatingPercentage(6 - i) + '%' }"
              ></div>
            </div>
            <span class="bar-count">{{ getRatingCount(6 - i) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 컨트롤 바 (정렬 + 필터) -->
    <div class="controls-bar">
      <div class="controls-left">
      </div>

      <div class="controls-right">
        <div class="custom-select" :class="{ open: selectOpen }">
          <button @click="selectOpen = !selectOpen" class="select-trigger">
            <span class="select-label">{{ getSortLabel(sortOption) }}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="select-arrow">
              <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <Transition name="dropdown">
            <div v-if="selectOpen" class="select-dropdown">
              <button
                  v-for="option in sortOptions"
                  :key="option.value"
                  @click="handleSortChange(option.value)"
                  class="select-option"
                  :class="{ active: sortOption === option.value }"
              >
                <span>{{ option.label }}</span>
                <svg v-if="sortOption === option.value" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.333 4L6 11.333L2.667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="state-container loading">
      <div class="loading-spinner"></div>
      <p class="state-text">리뷰를 불러오고 있습니다</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="state-container error">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="#EF4444" stroke-width="2"/>
          <path d="M24 16V26M24 32H24.02" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="state-text">{{ error }}</p>
      <button @click="loadReviews" class="btn-retry">다시 시도</button>
    </div>

    <!-- 리뷰 목록 -->
    <div v-else-if="reviews.length > 0" class="reviews-list">
      <ReviewItem
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          :is-logged-in="isLoggedIn"
          @like="handleLikeReview"
          @report="handleReportReview"
          @delete="handleDeleteReview"
      />

      <button
          v-if="hasMore"
          @click="loadMoreReviews"
          :disabled="loadingMore"
          class="btn-load-more"
      >
        <svg v-if="!loadingMore" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3.333V12.667M3.333 8H12.667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span v-if="loadingMore" class="mini-spinner"></span>
        {{ loadingMore ? '로딩 중...' : '더 보기' }}
      </button>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="state-container empty">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="16" width="40" height="36" rx="2" stroke="#D1D5DB" stroke-width="2"/>
          <path d="M20 28H44M20 36H36" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h3 class="empty-title">아직 작성된 리뷰가 없어요</h3>
      <p class="empty-description">첫 번째 리뷰를 남겨주시겠어요?</p>
      <button v-if="isLoggedIn" @click="handleReviewWrite" class="btn-first-review">
        리뷰 작성하기
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '@/services/ProductService.js'
import ReviewItem from './ReviewItem.vue'

const router = useRouter()

const props = defineProps({
  productId: {
    type: Number,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh-product'])

// State
const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
const reviews = ref([])
const reviewStats = ref(null)
const sortOption = ref('createdAt,DESC')
const selectOpen = ref(false)
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)

// 정렬 옵션
const sortOptions = [
  { label: '최신순', value: 'createdAt,DESC' },
  { label: '오래된순', value: 'createdAt,ASC' },
  { label: '높은 평점순', value: 'rating,DESC' },
  { label: '낮은 평점순', value: 'rating,ASC' },
  { label: '도움순', value: 'likeCount,DESC' }
]

// Computed
const hasMore = computed(() => currentPage.value < totalPages.value - 1)
const totalReviewCount = computed(() => reviewStats.value?.totalCount || 0)

// Methods
const getSortLabel = (value) => {
  return sortOptions.find(opt => opt.value === value)?.label || '정렬'
}

const handleSortChange = (value) => {
  sortOption.value = value
  selectOpen.value = false
  loadReviews()
}

const handleReviewWrite = () => {
  if (!props.isLoggedIn) {
    alert('리뷰를 작성하려면 로그인이 필요합니다.')
    return
  }

  if (!props.productId || isNaN(Number(props.productId)) || Number(props.productId) <= 0) {
    alert('상품 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.')
    return
  }

  router.push({
    name: 'ReviewWrite',
    params: { id: String(props.productId) }
  })
}

const loadReviews = async (reset = true) => {
  try {
    if (reset) {
      loading.value = true
      currentPage.value = 0
      reviews.value = []
    } else {
      loadingMore.value = true
    }

    error.value = null

    const response = await productService.getProductReviews(props.productId, {
      page: currentPage.value,
      size: pageSize.value,
      sort: sortOption.value
    })

    if (response.success && response.data) {
      const newReviews = Array.isArray(response.data)
          ? response.data
          : response.data.content || []

      if (reset) {
        reviews.value = newReviews
      } else {
        reviews.value.push(...newReviews)
      }

      if (response.data.totalPages !== undefined) {
        totalPages.value = response.data.totalPages
      }
    } else {
      throw new Error(response.error || '리뷰를 불러오는데 실패했습니다.')
    }
  } catch (err) {
    console.error('리뷰 목록 조회 실패:', err)
    error.value = '리뷰를 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadReviewStats = async () => {
  try {
    const response = await productService.getReviewStats(props.productId)
    if (response.success && response.data) {
      reviewStats.value = response.data
    }
  } catch (err) {
    console.error('리뷰 통계 조회 실패:', err)
  }
}

const loadMoreReviews = async () => {
  if (hasMore.value && !loadingMore.value) {
    currentPage.value++
    await loadReviews(false)
  }
}

const handleLikeReview = async (reviewId) => {
  if (!props.isLoggedIn) {
    alert('로그인이 필요합니다.')
    return
  }

  try {
    const response = await productService.toggleReviewLike(reviewId)
    if (response.success) {
      const review = reviews.value.find(r => r.id === reviewId)
      if (review) {
        review.hasLike = !review.hasLike
        review.likeCount = review.hasLike
            ? (review.likeCount || 0) + 1
            : Math.max((review.likeCount || 0) - 1, 0)
      }
    }
  } catch (err) {
    console.error('리뷰 좋아요 실패:', err)
    alert('좋아요 처리 중 오류가 발생했습니다.')
  }
}

const handleReportReview = async (reviewId) => {
  if (!props.isLoggedIn) {
    alert('로그인이 필요합니다.')
    return
  }

  const reason = prompt('신고 사유를 입력해주세요 (10자 이상):')
  if (!reason || reason.trim().length < 10) {
    alert('신고 사유는 10자 이상 입력해주세요.')
    return
  }

  try {
    const response = await productService.reportReview(reviewId, reason.trim())
    if (response.success) {
      alert('신고가 접수되었습니다.')
    }
  } catch (err) {
    console.error('리뷰 신고 실패:', err)
    alert('신고 처리 중 오류가 발생했습니다.')
  }
}

const handleDeleteReview = async (reviewId) => {
  if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
    return
  }

  try {
    const response = await productService.deleteReview(reviewId)
    if (response.success) {
      alert('리뷰가 삭제되었습니다.')
      await loadReviews()
      await loadReviewStats()
      emit('refresh-product')
    }
  } catch (err) {
    console.error('리뷰 삭제 실패:', err)
    alert('리뷰 삭제 중 오류가 발생했습니다.')
  }
}

// Utility
const formatRating = (value) => value ? value.toFixed(1) : '0.0'

const getRatingPercentage = (star) => {
  if (!reviewStats.value?.ratingDistribution) return 0
  const count = reviewStats.value.ratingDistribution[star] || 0
  const total = reviewStats.value.totalCount || 0
  return total > 0 ? (count / total) * 100 : 0
}

const getRatingCount = (star) => {
  return reviewStats.value?.ratingDistribution?.[star] || 0
}

// 외부 클릭 감지
const handleClickOutside = (event) => {
  if (selectOpen.value && !event.target.closest('.custom-select')) {
    selectOpen.value = false
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', handleClickOutside)
}

// 초기 로드
onMounted(() => {
  loadReviews()
  loadReviewStats()
})

// productId 변경 감지
watch(() => props.productId, () => {
  loadReviews()
  loadReviewStats()
})
</script>

<style scoped>
/* 섹션 레이아웃 */
.review-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

/* 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.03em;
  margin: 0;
}

.review-count {
  font-size: 16px;
  font-weight: 600;
  color: #6B7280;
  background: #F3F4F6;
  padding: 4px 12px;
  border-radius: 12px;
}

.btn-write-review {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 20px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.btn-write-review:hover {
  background: #1F2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.2);
}

/* 평점 통계 */
.stats-container {
  background: linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%);
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
}

.stats-summary {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 48px;
  align-items: center;
}

.rating-large {
  text-align: center;
}

.rating-number {
  display: block;
  font-size: 56px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.rating-stars {
  margin-bottom: 12px;
}

.stars-display {
  display: inline-flex;
  gap: 4px;
}

.star {
  color: #E5E7EB;
  transition: color 0.2s;
}

.star.filled {
  color: #FBBF24;
}

.rating-description {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
  margin: 0;
}

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-bar {
  display: grid;
  grid-template-columns: 32px 1fr 40px;
  gap: 12px;
  align-items: center;
}

.bar-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-align: right;
}

.bar-track {
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-count {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  text-align: right;
}

/* 컨트롤 바 */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #F3F4F6;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.results-info {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.results-info strong {
  color: #111827;
  font-weight: 700;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 커스텀 셀렉트 */
.custom-select {
  position: relative;
}

.select-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
  justify-content: space-between;
}

.select-trigger:hover {
  border-color: #D1D5DB;
  background: #FAFAFA;
}

.custom-select.open .select-trigger {
  border-color: #111827;
  background: #FAFAFA;
}

.select-label {
  flex: 1;
  text-align: left;
}

.select-arrow {
  color: #9CA3AF;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.custom-select.open .select-arrow {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  z-index: 100;
  overflow: hidden;
  padding: 6px;
}

.select-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: none;
  border: none;
  border-radius: 8px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.select-option:hover {
  background: #F3F4F6;
  color: #111827;
}

.select-option.active {
  background: #F3F4F6;
  color: #111827;
  font-weight: 600;
}

.select-option svg {
  color: #059669;
  flex-shrink: 0;
}

/* 드롭다운 트랜지션 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 상태 컨테이너 */
.state-container {
  text-align: center;
  padding: 80px 24px;
}

.state-container.loading {
  padding: 60px 24px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F3F4F6;
  border-top-color: #111827;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.mini-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.state-text {
  font-size: 15px;
  color: #6B7280;
  font-weight: 500;
  margin: 0;
  letter-spacing: -0.01em;
}

.error-icon {
  margin-bottom: 20px;
}

.btn-retry {
  margin-top: 20px;
  padding: 10px 24px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #1F2937;
  transform: translateY(-1px);
}

/* 빈 상태 */
.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 500;
  margin: 0 0 24px 0;
}

.btn-first-review {
  padding: 12px 28px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-first-review:hover {
  background: #1F2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.15);
}

/* 리뷰 목록 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: white;
  color: #374151;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-load-more:hover:not(:disabled) {
  background: #FAFAFA;
  border-color: #D1D5DB;
  transform: translateY(-1px);
}

.btn-load-more:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 반응형 */
@media (max-width: 968px) {
  .stats-summary {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .review-section {
    padding: 32px 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-write-review {
    width: 100%;
    justify-content: center;
  }

  .section-title {
    font-size: 20px;
  }

  .review-count {
    font-size: 14px;
  }

  .stats-container {
    padding: 24px;
  }

  .rating-number {
    font-size: 48px;
  }

  .controls-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .controls-right {
    width: 100%;
  }

  .select-trigger {
    width: 100%;
  }
}
</style>