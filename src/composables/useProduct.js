// composables/useProduct.js

import { ref, reactive, computed, readonly } from 'vue'
import { productService } from '@/services/ProductService.js'

/**
 * 상품 관리 Composable
 */
export function useProduct() {
  // ==================== 반응형 상태 ====================

  const loading = ref(false)
  const error = ref(null)
  const products = ref([])
  const currentProduct = ref(null)
  const categories = ref([])
  const pagination = reactive({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  })

  // 리뷰 관련 상태
  const reviews = ref([])
  const reviewStats = ref(null)
  const reviewPagination = reactive({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  })

  // ==================== 계산된 속성 ====================

  const hasProducts = computed(() => products.value.length > 0)
  const hasNextPage = computed(() => !pagination.last)
  const hasPrevPage = computed(() => !pagination.first)
  const isEmpty = computed(() => !loading.value && products.value.length === 0)

  // 리뷰 관련 계산된 속성
  const hasReviews = computed(() => reviews.value.length > 0)
  const hasNextReviewPage = computed(() => !reviewPagination.last)
  const averageRating = computed(() => reviewStats.value?.averageRating || 0)
  const totalReviewCount = computed(() => reviewStats.value?.totalCount || 0)

  // ==================== 에러 처리 ====================

  const clearError = () => {
    error.value = null
  }

  const handleError = (err, context = '') => {
    console.error(`[PRODUCT_COMPOSABLE] ${context} 오류:`, err)
    error.value = err.message || '알 수 없는 오류가 발생했습니다.'
  }

  // ==================== 상품 CRUD 메서드 ====================

  const fetchProducts = async (params = {}) => {
    loading.value = true
    clearError()

    try {
      const response = await productService.getProducts(params)

      if (response.success && response.data) {
        products.value = response.data.content || response.data

        if (response.data.pageable) {
          Object.assign(pagination, {
            page: response.data.pageable.page || 0,
            size: response.data.pageable.size || 20,
            totalElements: response.data.totalElements || 0,
            totalPages: response.data.totalPages || 0,
            first: response.data.first ?? true,
            last: response.data.last ?? true
          })
        }

        return true
      } else {
        throw new Error(response.error || '상품 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '상품 목록 조회')
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (productId) => {
    if (!productId) {
      error.value = '상품 ID가 필요합니다.'
      return null
    }

    loading.value = true
    clearError()

    try {
      const response = await productService.getProduct(productId)

      if (response.success && response.data) {
        currentProduct.value = response.data
        return response.data
      } else {
        throw new Error(response.error || '상품 정보를 불러오는데 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '상품 조회')
      return null
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    try {
      if (!productData.thumbnailAttachmentInfo) {
        return {
          success: false,
          error: '대표 이미지는 필수입니다.'
        }
      }

      const response = await productService.createProduct(productData)

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: '상품이 성공적으로 등록되었습니다.'
        }
      } else {
        throw new Error(response.error || '상품 등록에 실패했습니다.')
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || '상품 등록 중 오류가 발생했습니다.'
      }
    }
  }

  const updateProduct = async (productId, productData) => {
    if (!productId) {
      error.value = '상품 ID가 필요합니다.'
      return null
    }

    if (!productData) {
      error.value = '수정할 상품 데이터가 필요합니다.'
      return null
    }

    loading.value = true
    clearError()

    try {
      const response = await productService.updateProduct(productId, productData)

      if (response.success && response.data) {
        if (currentProduct.value?.id === productId) {
          currentProduct.value = response.data
        }

        const index = products.value.findIndex(p => p.id === productId)
        if (index !== -1) {
          products.value[index] = response.data
        }

        return response.data
      } else {
        throw new Error(response.error || '상품 수정에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '상품 수정')
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (productId) => {
    if (!productId) {
      error.value = '상품 ID가 필요합니다.'
      return false
    }

    loading.value = true
    clearError()

    try {
      const response = await productService.deleteProduct(productId)

      if (response.success) {
        products.value = products.value.filter(p => p.id !== productId)

        if (currentProduct.value?.id === productId) {
          currentProduct.value = null
        }

        return true
      } else {
        throw new Error(response.error || '상품 삭제에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '상품 삭제')
      return false
    } finally {
      loading.value = false
    }
  }

  // ==================== 카테고리 관리 ====================

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories()

      if (response.success && response.data) {
        categories.value = response.data
        return true
      } else {
        categories.value = getDefaultCategories()
        return false
      }
    } catch (err) {
      categories.value = getDefaultCategories()
      return false
    }
  }

  const getDefaultCategories = () => [
    { categoryId: 1, categoryName: '음료' },
    { categoryId: 2, categoryName: '스낵/과자' },
    { categoryId: 3, categoryName: '베이커리' },
    { categoryId: 4, categoryName: '도시락/식사' },
    { categoryId: 5, categoryName: '디저트' },
    { categoryId: 6, categoryName: '기타' }
  ]

  // ==================== 리액션 관리 ====================

  const toggleLike = async (productId) => {
    try {
      const response = await productService.likeProduct(productId)

      if (response.success) {
        updateProductReaction(productId, 'like', response.data?.hasLike)
        return true
      } else {
        throw new Error(response.error || '좋아요 처리에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '좋아요')
      return false
    }
  }

  const toggleBookmark = async (productId) => {
    try {
      const response = await productService.bookmarkProduct(productId)

      if (response.success) {
        updateProductReaction(productId, 'bookmark', response.data?.hasBookmark)
        return true
      } else {
        throw new Error(response.error || '북마크 처리에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '북마크')
      return false
    }
  }

  const updateProductReaction = (productId, reactionType, hasReaction) => {
    const productInList = products.value.find(p => p.id === productId)
    if (productInList?.userReaction) {
      productInList.userReaction[`has${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`] = hasReaction
    }

    if (currentProduct.value?.id === productId && currentProduct.value.userReaction) {
      currentProduct.value.userReaction[`has${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`] = hasReaction
    }
  }

  // ==================== 검색 및 필터링 ====================

  const searchProducts = async (keyword, filters = {}, pageable = {}) => {
    if (!keyword?.trim()) {
      error.value = '검색 키워드를 입력해주세요.'
      return false
    }

    loading.value = true
    clearError()

    try {
      const response = await productService.searchProducts(keyword, filters, pageable)

      if (response.success && response.data) {
        products.value = response.data.content || response.data

        if (response.data.pageable) {
          Object.assign(pagination, response.data.pageable)
        }

        return true
      } else {
        throw new Error(response.error || '검색에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '상품 검색')
      return false
    } finally {
      loading.value = false
    }
  }

  // ==================== 리뷰 관련 메서드 ====================

  /**
   * 상품별 리뷰 목록 조회
   */
  const fetchProductReviews = async (productId, pageable = {}) => {
    if (!productId) {
      error.value = '상품 ID가 필요합니다.'
      return false
    }

    loading.value = true
    clearError()

    try {
      const response = await productService.getProductReviews(productId, pageable)

      if (response.success && response.data) {
        reviews.value = response.data.content || response.data

        if (response.data.pageable) {
          Object.assign(reviewPagination, {
            page: response.data.number || 0,
            size: response.data.size || 10,
            totalElements: response.data.totalElements || 0,
            totalPages: response.data.totalPages || 0,
            first: response.data.first ?? true,
            last: response.data.last ?? true
          })
        }

        return true
      } else {
        throw new Error(response.error || '리뷰를 불러오는데 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '리뷰 목록 조회')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 리뷰 등록 (파일 업로드 로직 포함)
   */
  const createReview = async (reviewData) => {
    loading.value = true
    clearError()

    try {
      const productId = reviewData.productId

      if (!productId) {
        return {
          success: false,
          error: '상품 ID가 필요합니다.'
        }
      }

      const response = await productService.createReview(productId, reviewData)

      if (response.success && response.data) {
        reviews.value.unshift(response.data)

        return {
          success: true,
          data: response.data,
          message: '리뷰가 등록되었습니다.'
        }
      } else {
        throw new Error(response.error || '리뷰 등록에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '리뷰 등록')
      return {
        success: false,
        error: err.message
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 리뷰 수정
   */
  const updateReview = async (reviewId, reviewData) => {
    if (!reviewId) {
      error.value = '리뷰 ID가 필요합니다.'
      return { success: false, error: error.value }
    }

    loading.value = true
    clearError()

    try {
      const response = await productService.updateReview(reviewId, reviewData)

      if (response.success && response.data) {
        const index = reviews.value.findIndex(r => r.id === reviewId)
        if (index !== -1) {
          reviews.value[index] = response.data
        }

        return {
          success: true,
          data: response.data,
          message: '리뷰가 수정되었습니다.'
        }
      } else {
        throw new Error(response.error || '리뷰 수정에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '리뷰 수정')
      return {
        success: false,
        error: err.message
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 리뷰 삭제
   */
  const deleteReview = async (reviewId) => {
    if (!reviewId) {
      error.value = '리뷰 ID가 필요합니다.'
      return false
    }

    loading.value = true
    clearError()

    try {
      const response = await productService.deleteReview(reviewId)

      if (response.success) {
        reviews.value = reviews.value.filter(r => r.id !== reviewId)
        return true
      } else {
        throw new Error(response.error || '리뷰 삭제에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '리뷰 삭제')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 리뷰 좋아요 토글
   */
  const toggleReviewLike = async (reviewId) => {
    try {
      const response = await productService.toggleReviewLike(reviewId)

      if (response.success) {
        const review = reviews.value.find(r => r.id === reviewId)
        if (review) {
          review.hasLike = response.data?.hasLike
          review.likeCount = response.data?.hasLike
              ? (review.likeCount || 0) + 1
              : Math.max(0, (review.likeCount || 0) - 1)
        }
        return true
      } else {
        throw new Error(response.error || '좋아요 처리에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '리뷰 좋아요')
      return false
    }
  }

  /**
   * 리뷰 신고
   */
  const reportReview = async (reviewId, reason) => {
    if (!reviewId) {
      error.value = '리뷰 ID가 필요합니다.'
      return false
    }

    if (!reason || reason.trim().length === 0) {
      error.value = '신고 사유를 입력해주세요.'
      return false
    }

    loading.value = true
    clearError()

    try {
      const response = await productService.reportReview(reviewId, reason)

      if (response.success) {
        return true
      } else {
        throw new Error(response.error || '리뷰 신고에 실패했습니다.')
      }
    } catch (err) {
      handleError(err, '리뷰 신고')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 리뷰 통계 조회
   */
  const fetchReviewStats = async (productId) => {
    if (!productId) {
      error.value = '상품 ID가 필요합니다.'
      return false
    }

    try {
      const response = await productService.getReviewStats(productId)

      if (response.success && response.data) {
        reviewStats.value = response.data
        return true
      } else {
        throw new Error(response.error || '리뷰 통계 조회에 실패했습니다.')
      }
    } catch (err) {
      console.error('[PRODUCT_COMPOSABLE] 리뷰 통계 조회 오류:', err)
      return false
    }
  }

  /**
   * 리뷰 이미지 업로드 (파일 서버로 업로드 후 파일 정보 반환)
   */
  const uploadReviewImage = async (file) => {
    if (!file) {
      error.value = '파일이 필요합니다.'
      return null
    }

    try {
      console.log('📤 [COMPOSABLE] 리뷰 이미지 업로드 시작:', file.name)

      const response = await productService.uploadReviewImage(file)

      if (response.success && response.data) {
        // ProductCreate처럼 파일 정보 객체 반환
        const fileInfo = {
          id: response.data.id,
          fileUrl: response.data.fileUrl,
          orgFileNm: response.data.orgFileNm || file.name,
          fileSize: response.data.fileSize || file.size,
          contentType: response.data.contentType || file.type
        }

        console.log('✅ [COMPOSABLE] 리뷰 이미지 업로드 성공:', fileInfo)
        return fileInfo
      } else {
        throw new Error(response.error || '이미지 업로드에 실패했습니다.')
      }
    } catch (err) {
      console.error('❌ [COMPOSABLE] 이미지 업로드 실패:', err)
      handleError(err, '이미지 업로드')
      return null
    }
  }

  // ==================== 유효성 검증 ====================

  const validateProductData = (productData) => {
    const errors = []

    if (!productData.name?.trim()) {
      errors.push('상품명은 필수입니다.')
    } else if (productData.name.length > 100) {
      errors.push('상품명은 100자 이하여야 합니다.')
    }

    if (!productData.brand?.trim()) {
      errors.push('브랜드명은 필수입니다.')
    } else if (productData.brand.length > 100) {
      errors.push('브랜드명은 100자 이하여야 합니다.')
    }

    if (!productData.categoryId) {
      errors.push('카테고리는 필수입니다.')
    }

    if (!productData.thumbnailAttachmentInfo) {
      errors.push('대표 이미지는 필수입니다.')
    }

    if (productData.description && productData.description.length > 1000) {
      errors.push('상품 설명은 1000자 이하여야 합니다.')
    }

    if (productData.price && productData.price < 0) {
      errors.push('가격은 0 이상이어야 합니다.')
    }

    if (productData.tags && productData.tags.length > 10) {
      errors.push('태그는 최대 10개까지 가능합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const validateReviewData = (reviewData) => {
    const errors = []

    if (!reviewData.productId) {
      errors.push('상품 ID가 필요합니다.')
    }

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('평점은 1~5 사이여야 합니다.')
    }

    if (!reviewData.comment || reviewData.comment.trim().length === 0) {
      errors.push('리뷰 내용을 입력해주세요.')
    } else if (reviewData.comment.trim().length < 10) {
      errors.push('리뷰는 최소 10자 이상 작성해주세요.')
    } else if (reviewData.comment.length > 1000) {
      errors.push('리뷰는 1000자 이하로 작성해주세요.')
    }

    if (reviewData.attachmentFileInfos && reviewData.attachmentFileInfos.length > 5) {
      errors.push('이미지는 최대 5장까지 첨부 가능합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // ==================== 초기화 ====================

  const reset = () => {
    loading.value = false
    error.value = null
    products.value = []
    currentProduct.value = null
    reviews.value = []
    reviewStats.value = null
    Object.assign(pagination, {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    })
    Object.assign(reviewPagination, {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    })
  }

  // ==================== 반환값 ====================

  return {
    // 상품 상태
    loading: readonly(loading),
    error: readonly(error),
    products: readonly(products),
    currentProduct: readonly(currentProduct),
    categories: readonly(categories),
    pagination: readonly(pagination),

    // 리뷰 상태
    reviews: readonly(reviews),
    reviewStats: readonly(reviewStats),
    reviewPagination: readonly(reviewPagination),

    // 계산된 속성
    hasProducts,
    hasNextPage,
    hasPrevPage,
    isEmpty,
    hasReviews,
    hasNextReviewPage,
    averageRating,
    totalReviewCount,

    // 상품 메서드
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,

    // 카테고리
    fetchCategories,

    // 리액션
    toggleLike,
    toggleBookmark,

    // 검색
    searchProducts,

    // 리뷰 메서드
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleReviewLike,
    reportReview,
    fetchReviewStats,
    uploadReviewImage,

    // 유틸리티
    validateProductData,
    validateReviewData,
    clearError,
    reset
  }
}

/**
 * 상품 목록 전용 Composable
 */
export function useProductList() {
  const {
    loading,
    error,
    products,
    pagination,
    hasProducts,
    hasNextPage,
    hasPrevPage,
    isEmpty,
    fetchProducts,
    searchProducts,
    toggleLike,
    toggleBookmark,
    clearError,
    reset
  } = useProduct()

  return {
    loading,
    error,
    products,
    pagination,
    hasProducts,
    hasNextPage,
    hasPrevPage,
    isEmpty,
    fetchProducts,
    searchProducts,
    toggleLike,
    toggleBookmark,
    clearError,
    reset
  }
}

/**
 * 상품 상세 전용 Composable
 */
export function useProductDetail() {
  const {
    loading,
    error,
    currentProduct,
    reviews,
    reviewStats,
    reviewPagination,
    hasReviews,
    hasNextReviewPage,
    averageRating,
    totalReviewCount,
    fetchProduct,
    toggleLike,
    toggleBookmark,
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleReviewLike,
    reportReview,
    fetchReviewStats,
    uploadReviewImage,
    validateReviewData,
    clearError
  } = useProduct()

  return {
    loading,
    error,
    product: currentProduct,
    reviews,
    reviewStats,
    reviewPagination,
    hasReviews,
    hasNextReviewPage,
    averageRating,
    totalReviewCount,
    fetchProduct,
    toggleLike,
    toggleBookmark,
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleReviewLike,
    reportReview,
    fetchReviewStats,
    uploadReviewImage,
    validateReviewData,
    clearError
  }
}