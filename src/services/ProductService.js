// services/ProductService.js
// 제품 관련 API 서비스 (Fetch API 기반)

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'

/**
 * 제품 서비스
 * Product Server와의 통신을 담당
 */
class ProductService extends BaseApiService {
  constructor() {
    const baseURL = import.meta.env.DEV
        ? 'http://localhost:8080/api'
        : `${import.meta.env.VITE_CHAT_BASE_URL}/api`

    super(baseURL, 'PRODUCT')
  }

  // ==================== 제품 목록 API ====================

  /**
   * 제품 목록 조회 (페이징, 검색, 정렬)
   */
  async getProducts(searchCondition = {}, pageable = {}) {
    const params = {
      // 페이징 파라미터
      page: pageable.page || 0,
      size: pageable.size || 10,
      sort: pageable.sort || 'releaseDate,DESC',

      // 검색 조건
      ...this.buildSearchParams(searchCondition)
    }

    return await this.get('/products', params)
  }

  /**
   * 제품 상세 조회
   */
  async getProductDetail(productId) {
    if (!productId) {
      throw new Error('제품 ID가 필요합니다.')
    }

    return await this.get(`/products/${productId}`)
  }

  /**
   * 제품 검색
   */
  async searchProducts(keyword, searchCondition = {}, pageable = {}) {
    const params = {
      page: pageable.page || 0,
      size: pageable.size || 10,
      sort: pageable.sort || 'releaseDate,DESC',
      keyword: keyword,
      ...this.buildSearchParams(searchCondition)
    }

    return await this.get('/products/search', params)
  }

  // ==================== 카테고리별 조회 ====================

  /**
   * 카테고리별 제품 조회
   */
  async getProductsByCategory(categoryId, pageable = {}) {
    const params = {
      page: pageable.page || 0,
      size: pageable.size || 10,
      sort: pageable.sort || 'releaseDate,DESC',
      categoryId: categoryId
    }

    return await this.get('/products', params)
  }

  /**
   * 브랜드별 제품 조회
   */
  async getProductsByBrand(brand, pageable = {}) {
    const params = {
      page: pageable.page || 0,
      size: pageable.size || 10,
      sort: pageable.sort || 'releaseDate,DESC',
      brand: brand
    }

    return await this.get('/products', params)
  }

  // ==================== 제품 상호작용 API ====================

  /**
   * 제품 찜하기 추가/제거
   */
  async toggleProductLike(productId) {
    if (!productId) {
      throw new Error('제품 ID가 필요합니다.')
    }

    return await this.post(`/products/${productId}/like`)
  }

  /**
   * 제품 찜하기 제거
   */
  async removeProductLike(productId) {
    if (!productId) {
      throw new Error('제품 ID가 필요합니다.')
    }

    return await this.delete(`/products/${productId}/like`)
  }

  /**
   * 사용자 찜한 제품 목록 조회
   */
  async getUserLikedProducts(pageable = {}) {
    const params = {
      page: pageable.page || 0,
      size: pageable.size || 10,
      sort: pageable.sort || 'createdAt,DESC'
    }

    return await this.get('/products/liked', params)
  }

  /**
   * 제품 조회수 증가
   */
  async incrementViewCount(productId) {
    if (!productId) {
      throw new Error('제품 ID가 필요합니다.')
    }

    return await this.post(`/products/${productId}/view`)
  }

  // ==================== 리뷰 관련 API ====================

  /**
   * 제품 리뷰 목록 조회
   */
  async getProductReviews(productId, pageable = {}) {
    if (!productId) {
      throw new Error('제품 ID가 필요합니다.')
    }

    const params = {
      page: pageable.page || 0,
      size: pageable.size || 10,
      sort: pageable.sort || 'createdAt,DESC'
    }

    return await this.get(`/products/${productId}/reviews`, params)
  }

  /**
   * 리뷰 작성
   */
  async createProductReview(productId, reviewData) {
    if (!productId) {
      throw new Error('제품 ID가 필요합니다.')
    }

    const requestData = {
      rating: reviewData.rating,
      content: reviewData.content,
      images: reviewData.images || []
    }

    return await this.post(`/products/${productId}/reviews`, requestData)
  }

  // ==================== 통계 및 집계 API ====================

  /**
   * 인기 제품 조회 (찜하기 기준)
   */
  async getPopularProducts(limit = 10) {
    const params = {
      page: 0,
      size: limit,
      sort: 'likeCount,DESC'
    }

    return await this.get('/products', params)
  }

  /**
   * 최신 출시 제품 조회
   */
  async getLatestProducts(limit = 10) {
    const params = {
      page: 0,
      size: limit,
      sort: 'releaseDate,DESC'
    }

    return await this.get('/products', params)
  }

  /**
   * 추천 제품 조회
   */
  async getRecommendedProducts(limit = 10) {
    const params = {
      page: 0,
      size: limit,
      sort: 'averageRating,DESC'
    }

    return await this.get('/products/recommended', params)
  }

  // ==================== 유틸리티 메서드 ====================

  /**
   * 검색 조건을 API 파라미터로 변환
   */
  buildSearchParams(searchCondition) {
    const params = {}

    if (searchCondition.keyword) {
      params.keyword = searchCondition.keyword.trim()
    }

    if (searchCondition.categoryId) {
      params.categoryId = searchCondition.categoryId
    }

    if (searchCondition.brand) {
      params.brand = searchCondition.brand
    }

    if (searchCondition.status) {
      params.status = searchCondition.status
    } else {
      params.status = 'APPROVED' // 기본값: 승인된 제품만
    }

    if (searchCondition.productType) {
      params.productType = searchCondition.productType
    }

    return params
  }

  /**
   * 정렬 옵션 변환
   */
  convertSortOption(sortBy) {
    const sortMap = {
      'latest': 'createdAt,DESC',
      'release': 'releaseDate,DESC',
      'popular': 'likeCount,DESC',
      'views': 'viewCount,DESC',
      'rating': 'averageRating,DESC',
      'name': 'name,ASC',
      'oldest': 'createdAt,ASC'
    }

    return sortMap[sortBy] || 'releaseDate,DESC'
  }

  /**
   * 백엔드 제품 응답을 프론트엔드 형식으로 변환
   */
  transformProductResponse(backendProduct) {
    return {
      id: backendProduct.id,
      name: backendProduct.name,
      brand: backendProduct.brand,
      status: backendProduct.status,
      price: backendProduct.price,
      viewCount: backendProduct.viewCount || 0,
      likeCount: backendProduct.likeCount || 0,
      averageRating: backendProduct.averageRating || 0,
      reviewCount: backendProduct.reviewCount || 0,
      categoryName: backendProduct.categoryName,
      productType: backendProduct.productType,
      thumbnailUrl: backendProduct.thumbnailUrl || '',
      releaseDate: backendProduct.releaseDate,
      createdAt: backendProduct.createdAt,

      // 추가 프론트엔드 필드
      isLiked: false, // 별도 API로 확인 필요
      trending: backendProduct.likeCount > 50,
      isNew: this.isNewProduct(backendProduct.releaseDate),
      displayPrice: this.formatPrice(backendProduct.price)
    }
  }

  /**
   * 신제품 여부 확인 (30일 이내 출시)
   */
  isNewProduct(releaseDate) {
    if (!releaseDate) return false

    const release = new Date(releaseDate)
    const now = new Date()
    const diffDays = (now - release) / (1000 * 60 * 60 * 24)

    return diffDays <= 30
  }

  /**
   * 가격 포맷팅
   */
  formatPrice(price) {
    if (!price || price === '0') return '무료'

    // 숫자인 경우 원화 포맷팅
    const numPrice = parseInt(price.replace(/[^0-9]/g, ''))
    if (!isNaN(numPrice)) {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
      }).format(numPrice)
    }

    return price
  }

  /**
   * 제품 데이터 검증
   */
  validateProductData(productData) {
    const errors = []

    if (!productData.name || productData.name.trim().length === 0) {
      errors.push('제품명은 필수입니다.')
    }

    if (!productData.brand || productData.brand.trim().length === 0) {
      errors.push('브랜드명은 필수입니다.')
    }

    if (!productData.categoryId) {
      errors.push('카테고리는 필수입니다.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 제품 목록 정렬
   */
  sortProducts(products, sortBy = 'latest') {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'release':
          return new Date(b.releaseDate) - new Date(a.releaseDate)
        case 'popular':
          return b.likeCount - a.likeCount
        case 'views':
          return b.viewCount - a.viewCount
        case 'rating':
          return b.averageRating - a.averageRating
        case 'name':
          return a.name.localeCompare(b.name, 'ko-KR')
        default:
          return new Date(b.releaseDate) - new Date(a.releaseDate)
      }
    })
  }

  /**
   * 제품 목록 필터링
   */
  filterProducts(products, filters) {
    return products.filter(product => {
      if (filters.category && product.categoryName !== filters.category) {
        return false
      }

      if (filters.brand && product.brand !== filters.brand) {
        return false
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        return product.name.toLowerCase().includes(keyword) ||
            product.brand.toLowerCase().includes(keyword)
      }

      if (filters.minRating && product.averageRating < filters.minRating) {
        return false
      }

      if (filters.newOnly && !product.isNew) {
        return false
      }

      return true
    })
  }

  // ==================== 디버깅 ====================

  /**
   * Product Service 상태 디버깅
   */
  debugProductStatus() {
    console.group('🔍 [PRODUCT] 제품 서비스 상태')

    console.log('=== 지원 기능 ===')
    console.log('제품 조회: 목록, 상세, 검색')
    console.log('카테고리/브랜드별 조회')
    console.log('찜하기 기능')
    console.log('리뷰 시스템')
    console.log('통계 및 추천')

    // 부모 클래스의 디버깅도 호출
    this.debugStatus()

    console.groupEnd()
  }
}

// ==================== Vue Composables ====================

/**
 * Vue Composition API용 제품 훅
 */
export function useProduct() {
  const productService = new ProductService()

  const getList = async (searchCondition = {}, pageable = {}) => {
    try {
      const response = await productService.getProducts(searchCondition, pageable)
      return {
        success: true,
        data: response.data || {},
        message: response.message
      }
    } catch (error) {
      console.error('[PRODUCT] 제품 목록 조회 실패:', error)
      return {
        success: false,
        error: error.message,
        data: { content: [], totalElements: 0 }
      }
    }
  }

  const getDetail = async (productId) => {
    try {
      const response = await productService.getProductDetail(productId)
      return {
        success: true,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('[PRODUCT] 제품 상세 조회 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const search = async (keyword, searchCondition = {}, pageable = {}) => {
    try {
      const response = await productService.searchProducts(keyword, searchCondition, pageable)
      return {
        success: true,
        data: response.data || {},
        message: response.message
      }
    } catch (error) {
      console.error('[PRODUCT] 제품 검색 실패:', error)
      return {
        success: false,
        error: error.message,
        data: { content: [], totalElements: 0 }
      }
    }
  }

  const toggleLike = async (productId) => {
    try {
      const response = await productService.toggleProductLike(productId)
      return {
        success: true,
        data: response.data,
        message: response.message || '찜하기가 완료되었습니다'
      }
    } catch (error) {
      console.error('[PRODUCT] 찜하기 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const incrementView = async (productId) => {
    try {
      await productService.incrementViewCount(productId)
      return { success: true }
    } catch (error) {
      console.error('[PRODUCT] 조회수 증가 실패:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    // CRUD 기능
    getList,
    getDetail,
    search,

    // 카테고리/브랜드별 조회
    getByCategory: (categoryId, pageable) => productService.getProductsByCategory(categoryId, pageable),
    getByBrand: (brand, pageable) => productService.getProductsByBrand(brand, pageable),

    // 상호작용
    toggleLike,
    removeLike: (productId) => productService.removeProductLike(productId),
    incrementView,

    // 찜한 제품
    getLikedProducts: (pageable) => productService.getUserLikedProducts(pageable),

    // 리뷰
    getReviews: (productId, pageable) => productService.getProductReviews(productId, pageable),
    createReview: (productId, reviewData) => productService.createProductReview(productId, reviewData),

    // 추천/인기 제품
    getPopular: (limit) => productService.getPopularProducts(limit),
    getLatest: (limit) => productService.getLatestProducts(limit),
    getRecommended: (limit) => productService.getRecommendedProducts(limit),

    // 유틸리티
    transformProduct: (product) => productService.transformProductResponse(product),
    formatPrice: (price) => productService.formatPrice(price),
    sortProducts: (products, sortBy) => productService.sortProducts(products, sortBy),
    filterProducts: (products, filters) => productService.filterProducts(products, filters),
    validateData: (productData) => productService.validateProductData(productData),

    // 연결 테스트
    testConnection: () => productService.testConnection(),

    // 디버깅
    debugStatus: () => productService.debugProductStatus()
  }
}

// ==================== 싱글톤 인스턴스 ====================

// 싱글톤 인스턴스 생성 및 내보내기
export const productService = new ProductService()

// 기본 내보내기
export default productService