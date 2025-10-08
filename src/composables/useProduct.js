// composables/useProduct.js
// Vue Composition API를 위한 상품 관련 Composable

import { ref, reactive, computed, readonly } from 'vue'
import { productService } from '@/services/ProductService.js'
import { useAuth } from '@/composables/useAuth.js'

/**
 * 상품 관리 Composable
 * 상태 관리, 비즈니스 로직, 에러 처리 등을 담당
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

  // ==================== 계산된 속성 ====================

  const hasProducts = computed(() => products.value.length > 0)
  const hasNextPage = computed(() => !pagination.last)
  const hasPrevPage = computed(() => !pagination.first)
  const isEmpty = computed(() => !loading.value && products.value.length === 0)

  // ==================== 에러 처리 ====================

  /**
   * 에러 상태 초기화
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 에러 처리 공통 로직
   * @param {Error} err 에러 객체
   * @param {string} context 에러 발생 맥락
   */
  const handleError = (err, context = '') => {
    console.error(`[PRODUCT_COMPOSABLE] ${context} 오류:`, err)
    error.value = err.message || '알 수 없는 오류가 발생했습니다.'
  }

  // ==================== 상품 CRUD 메서드 ====================

  /**
   * 상품 목록 조회
   * @param {Object} params 검색 조건 및 페이징 파라미터
   * @returns {Promise<boolean>} 성공 여부
   */
  const fetchProducts = async (params = {}) => {
    loading.value = true
    clearError()

    try {
      const response = await productService.getProducts(params)

      if (response.success && response.data) {
        products.value = response.data.content || response.data

        // 페이징 정보 업데이트 (백엔드에서 제공하는 경우)
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

  /**
   * 상품 단건 조회
   * @param {number} productId 상품 ID
   * @returns {Promise<Object|null>} 상품 데이터 또는 null
   */
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
      console.log('🚀 [PRODUCT] 상품 등록 시작:', productData)

      // 대표 이미지 필수 검증
      if (!productData.thumbnailAttachmentInfo) {
        return {
          success: false,
          error: '대표 이미지는 필수입니다.'
        }
      }

      const response = await productService.createProduct(productData)

      if (response.success) {
        console.log('✅ [PRODUCT] 상품 등록 성공:', response.data?.id || '알 수 없음')
        return {
          success: true,
          data: response.data,
          message: '상품이 성공적으로 등록되었습니다.'
        }
      } else {
        throw new Error(response.error || '상품 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [PRODUCT] 상품 등록 실패:', error)
      return {
        success: false,
        error: error.message || '상품 등록 중 오류가 발생했습니다.'
      }
    }
  }

  /**
   * 상품 수정
   * @param {number} productId 상품 ID
   * @param {Object} productData 수정할 상품 데이터
   * @returns {Promise<Object|null>} 수정된 상품 데이터 또는 null
   */
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
        // 현재 상품 정보 업데이트
        if (currentProduct.value?.id === productId) {
          currentProduct.value = response.data
        }

        // 목록에서도 업데이트
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

  /**
   * 상품 삭제
   * @param {number} productId 상품 ID
   * @returns {Promise<boolean>} 성공 여부
   */
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
        // 목록에서 제거
        products.value = products.value.filter(p => p.id !== productId)

        // 현재 상품이 삭제된 상품이면 초기화
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

  /**
   * 카테고리 목록 조회
   * @returns {Promise<boolean>} 성공 여부
   */
  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories()

      if (response.success && response.data) {
        categories.value = response.data
        return true
      } else {
        // 실패 시 기본 카테고리 제공
        categories.value = getDefaultCategories()
        console.warn('[PRODUCT_COMPOSABLE] 카테고리 조회 실패, 기본값 사용:', response.error)
        return false
      }
    } catch (err) {
      categories.value = getDefaultCategories()
      console.error('[PRODUCT_COMPOSABLE] 카테고리 조회 오류:', err)
      return false
    }
  }

  /**
   * 기본 카테고리 반환
   * @returns {Array} 기본 카테고리 배열
   */
  const getDefaultCategories = () => [
    { categoryId: 1, categoryName: '음료' },
    { categoryId: 2, categoryName: '스낵/과자' },
    { categoryId: 3, categoryName: '베이커리' },
    { categoryId: 4, categoryName: '도시락/식사' },
    { categoryId: 5, categoryName: '디저트' },
    { categoryId: 6, categoryName: '기타' }
  ]

  // ==================== 리액션 관리 ====================

  /**
   * 상품 좋아요 토글
   * @param {number} productId 상품 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  const toggleLike = async (productId) => {
    try {
      const response = await productService.likeProduct(productId)

      if (response.success) {
        // UI 상태 즉시 업데이트 (옵티미스틱 업데이트)
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

  /**
   * 상품 북마크 토글
   * @param {number} productId 상품 ID
   * @returns {Promise<boolean>} 성공 여부
   */
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

  /**
   * 상품 리액션 상태 업데이트 (UI 동기화)
   * @param {number} productId 상품 ID
   * @param {string} reactionType 리액션 타입
   * @param {boolean} hasReaction 리액션 상태
   */
  const updateProductReaction = (productId, reactionType, hasReaction) => {
    // 목록에서 업데이트
    const productInList = products.value.find(p => p.id === productId)
    if (productInList?.userReaction) {
      productInList.userReaction[`has${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`] = hasReaction
    }

    // 현재 상품에서 업데이트
    if (currentProduct.value?.id === productId && currentProduct.value.userReaction) {
      currentProduct.value.userReaction[`has${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`] = hasReaction
    }
  }

  // ==================== 검색 및 필터링 ====================

  /**
   * 상품 검색
   * @param {string} keyword 검색 키워드
   * @param {Object} filters 필터 조건
   * @param {Object} pageable 페이징 조건
   * @returns {Promise<boolean>} 성공 여부
   */
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

        // 페이징 정보 업데이트
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

  // ==================== 유효성 검증 ====================

  /**
   * 상품 데이터 유효성 검증
   * @param {Object} productData 검증할 상품 데이터
   * @returns {Object} 검증 결과
   */
  const validateProductData = (productData) => {
    const errors = []

    // 필수 필드 검증
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

    // 대표 이미지 필수 검증
    if (!productData.thumbnailAttachmentInfo) {
      errors.push('대표 이미지는 필수입니다.')
    }

    // 선택적 필드 검증
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

  // ==================== 초기화 ====================

  /**
   * 상태 초기화
   */
  const reset = () => {
    loading.value = false
    error.value = null
    products.value = []
    currentProduct.value = null
    Object.assign(pagination, {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    })
  }

  // ==================== 반환값 ====================

  return {
    // 반응형 상태
    loading: readonly(loading),
    error: readonly(error),
    products: readonly(products),
    currentProduct: readonly(currentProduct),
    categories: readonly(categories),
    pagination: readonly(pagination),

    // 계산된 속성
    hasProducts,
    hasNextPage,
    hasPrevPage,
    isEmpty,

    // 메서드
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

    // 유틸리티
    validateProductData,
    clearError,
    reset
  }
}

/**
 * 상품 목록 전용 Composable
 * 메인 페이지, 검색 페이지 등에서 사용
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
    // 목록 관련 상태만 노출
    loading,
    error,
    products,
    pagination,
    hasProducts,
    hasNextPage,
    hasPrevPage,
    isEmpty,

    // 목록 관련 메서드만 노출
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
 * 상품 상세 페이지에서 사용
 */
export function useProductDetail() {
  const {
    loading,
    error,
    currentProduct,
    fetchProduct,
    toggleLike,
    toggleBookmark,
    clearError
  } = useProduct()

  return {
    loading,
    error,
    product: currentProduct,
    fetchProduct,
    toggleLike,
    toggleBookmark,
    clearError
  }
}