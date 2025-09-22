// services/ProductService.js
// 상품 관련 API 서비스 (Fetch API 기반)

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'

/**
 * 상품 서비스
 * Content Server (8080)와의 통신을 담당
 */
class ProductService extends BaseApiService {
  constructor() {
    const baseURL = import.meta.env.DEV
        ? 'http://localhost:8082/api'
        : `${import.meta.env.VITE_CONTENT_BASE_URL}/api`

    super(baseURL, 'PRODUCT')

    console.log(`📦 [PRODUCT] Content Server URL: ${this.baseURL}`)
  }

  // ==================== 상품 CRUD API ====================

  /**
   * 상품 등록 - JSON으로 전송
   */
  async createProduct(productData) {
    const validation = this.validateProductData(productData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      name: productData.name.trim(),
      brand: productData.brand.trim(),
      categoryId: parseInt(productData.categoryId),
      price: productData.price || null,
      description: productData.description?.trim() || null,
      distributor: productData.distributor?.trim() || null,
      releaseDate: productData.releaseDate || null,
      feature: productData.feature?.trim() || null,
      tags: productData.tags || []
    }

    return await this.post('/products', requestData)
  }

  /**
   * 상품 단건 조회
   */
  async getProduct(productId) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    return await this.get(`/products/${productId}`)
  }

  /**
   * 상품 목록 조회 (검색 및 페이징)
   */
  async getProducts(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)

    // null, undefined, 빈 문자열 값 제거
    const cleanedCondition = this.removeEmptyParams(validatedCondition)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)

    const params = {
      ...cleanedCondition,
      ...cleanedPageable
    }

    return await this.get('/products', params)
  }

  /**
   * 상품 수정
   */
  async updateProduct(productId, productData) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    const validation = this.validateProductData(productData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      name: productData.name.trim(),
      brand: productData.brand.trim(),
      categoryId: parseInt(productData.categoryId),
      price: productData.price || null,
      description: productData.description?.trim() || null,
      distributor: productData.distributor?.trim() || null,
      releaseDate: productData.releaseDate || null,
      feature: productData.feature?.trim() || null,
      tags: productData.tags || []
    }

    return await this.put(`/products/${productId}`, requestData)
  }

  /**
   * 상품 삭제
   */
  async deleteProduct(productId) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    return await this.delete(`/products/${productId}`)
  }

  // ==================== 상품 리액션 API ====================

  /**
   * 상품 좋아요/찜하기 토글
   */
  async toggleProductReaction(productId, reactionType) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    const validReactionTypes = ['LIKE', 'BOOKMARK', 'INTEREST', 'SHARE', 'WISH']
    if (!validReactionTypes.includes(reactionType.toUpperCase())) {
      throw new Error('올바른 리액션 타입을 선택해주세요.')
    }

    const requestData = {
      deviceId: authUtils.getDeviceId()
    }

    return await this.post(`/products/${productId}/reactions/${reactionType.toUpperCase()}`, requestData)
  }

  /**
   * 상품 좋아요
   */
  async likeProduct(productId) {
    return this.toggleProductReaction(productId, 'LIKE')
  }

  /**
   * 상품 북마크
   */
  async bookmarkProduct(productId) {
    return this.toggleProductReaction(productId, 'BOOKMARK')
  }

  // ==================== 카테고리 API ====================

  /**
   * 카테고리 목록 조회
   */
  async getCategories() {
    return await this.get('/categories')
  }

  /**
   * 카테고리 상세 조회
   */
  async getCategory(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    return await this.get(`/categories/${categoryId}`)
  }

  // ==================== 검색 및 필터링 ====================

  /**
   * 상품 검색
   */
  async searchProducts(keyword, filters = {}, pageable = {}) {
    if (!keyword || keyword.trim().length === 0) {
      throw new Error('검색 키워드가 필요합니다.')
    }

    const cleanedFilters = this.removeEmptyParams(filters)
    const cleanedPageable = this.removeEmptyParams(this.validatePageable(pageable))

    const params = {
      keyword: keyword.trim(),
      ...cleanedFilters,
      ...cleanedPageable
    }

    return await this.get('/products/search', params)
  }

  /**
   * 인기 상품 조회
   */
  async getPopularProducts(params = {}) {
    const validatedParams = {
      size: params.size || 10,
      categoryId: params.categoryId || null,
      period: params.period || 'WEEK' // DAY, WEEK, MONTH
    }

    // null 값 제거
    const cleanedParams = this.removeEmptyParams(validatedParams)

    return await this.get('/products/popular', cleanedParams)
  }

  // ==================== 샘플 데이터 (개발용) ====================

  /**
   * 샘플 상품 목록 데이터 제공 (API 연결 실패시 폴백용)
   */
  getSampleProducts() {
    return {
      success: true,
      data: {
        content: [
          {
            id: 1,
            name: "스타벅스 콜드브루 커피",
            brand: "스타벅스",
            status: "APPROVED",
            price: "4500",
            viewCount: 1250,
            likeCount: 89,
            averageRating: 4.7,
            reviewCount: 23,
            categoryName: "음료",
            thumbnailUrl: "https://example.com/images/starbucks1.jpg",
            releaseDate: "2024-01-15",
            createdAt: "2024-01-10T10:30:00"
          },
          {
            id: 2,
            name: "맥도날드 빅맥",
            brand: "맥도날드",
            status: "APPROVED",
            price: "6900",
            viewCount: 890,
            likeCount: 156,
            averageRating: 4.9,
            reviewCount: 45,
            categoryName: "도시락/식사",
            thumbnailUrl: "https://example.com/images/bigmac1.jpg",
            releaseDate: "2024-02-01",
            createdAt: "2024-01-25T14:20:00"
          },
          {
            id: 3,
            name: "CU 삼각김밥",
            brand: "CU",
            status: "APPROVED",
            price: "1200",
            viewCount: 650,
            likeCount: 78,
            averageRating: 4.2,
            reviewCount: 12,
            categoryName: "도시락/식사",
            thumbnailUrl: "https://example.com/images/triangle1.jpg",
            releaseDate: "2024-01-20",
            createdAt: "2024-01-15T09:15:00"
          }
        ],
        pageable: {
          page: 0,
          size: 10,
          sort: "createdAt,DESC"
        },
        totalElements: 3,
        totalPages: 1,
        first: true,
        last: true
      }
    }
  }

  /**
   * 샘플 카테고리 데이터 제공
   */
  getSampleCategories() {
    return {
      success: true,
      data: [
        {
          categoryId: 1,
          categoryName: "음료",
          description: "커피, 차, 음료수 등",
          productCount: 45
        },
        {
          categoryId: 2,
          categoryName: "스낵/과자",
          description: "과자, 스낵, 견과류 등",
          productCount: 32
        },
        {
          categoryId: 3,
          categoryName: "베이커리",
          description: "빵, 케이크, 디저트 등",
          productCount: 28
        },
        {
          categoryId: 4,
          categoryName: "도시락/식사",
          description: "도시락, 간편식 등",
          productCount: 67
        },
        {
          categoryId: 5,
          categoryName: "디저트",
          description: "아이스크림, 디저트 등",
          productCount: 21
        },
        {
          categoryId: 6,
          categoryName: "기타",
          description: "기타 상품",
          productCount: 15
        }
      ]
    }
  }

  // ==================== 유틸리티 메서드 ====================

  /**
   * 파라미터에서 null, undefined, 빈 문자열 값 제거
   */
  removeEmptyParams(params) {
    if (!params || typeof params !== 'object') {
      return {}
    }

    const cleaned = {}

    Object.entries(params).forEach(([key, value]) => {
      // null, undefined, 빈 문자열이 아닌 값만 포함
      if (value !== null && value !== undefined && value !== '') {
        // 배열인 경우 빈 배열도 제외
        if (Array.isArray(value)) {
          if (value.length > 0) {
            cleaned[key] = value
          }
        } else {
          cleaned[key] = value
        }
      }
    })

    return cleaned
  }

  /**
   * 상품 등록 데이터 검증
   */
  validateProductData(productData) {
    const errors = []

    if (!productData.name || productData.name.trim().length === 0) {
      errors.push('상품명은 필수입니다.')
    }

    if (productData.name && productData.name.length > 100) {
      errors.push('상품명은 100자 이하여야 합니다.')
    }

    if (!productData.brand || productData.brand.trim().length === 0) {
      errors.push('브랜드명은 필수입니다.')
    }

    if (!productData.categoryId) {
      errors.push('카테고리는 필수입니다.')
    }

    if (productData.description && productData.description.length > 2000) {
      errors.push('상품 설명은 2000자 이하여야 합니다.')
    }

    if (productData.tags && productData.tags.length > 10) {
      errors.push('태그는 최대 10개까지 가능합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 검색 조건 검증
   */
  validateSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') {
      return {}
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']

    const validated = { ...searchCondition }

    // status 검증
    if (validated.status && !validStatuses.includes(validated.status)) {
      validated.status = 'APPROVED'
    }

    // keyword 길이 검증
    if (validated.keyword && validated.keyword.length > 100) {
      validated.keyword = validated.keyword.substring(0, 100)
    }

    // categoryId 숫자 검증
    if (validated.categoryId && isNaN(parseInt(validated.categoryId))) {
      delete validated.categoryId
    } else if (validated.categoryId) {
      validated.categoryId = parseInt(validated.categoryId)
    }

    return validated
  }

  /**
   * 페이징 조건 검증
   */
  validatePageable(pageable) {
    if (!pageable || typeof pageable !== 'object') {
      return {
        page: 0,
        size: 20,
        sort: 'createdAt,DESC'
      }
    }

    const validSorts = [
      'createdAt,DESC', 'createdAt,ASC',
      'releaseDate,DESC', 'releaseDate,ASC',
      'likeCount,DESC', 'likeCount,ASC',
      'viewCount,DESC', 'viewCount,ASC',
      'name,DESC', 'name,ASC'
    ]

    const validated = {
      page: Math.max(0, pageable.page || 0),
      size: Math.min(100, Math.max(1, pageable.size || 20))
    }

    // sort 검증 - 유효한 값만 설정
    if (pageable.sort && validSorts.includes(pageable.sort)) {
      validated.sort = pageable.sort
    } else {
      validated.sort = 'createdAt,DESC'
    }

    return validated
  }

  /**
   * 가격 포맷팅
   */
  formatPrice(price) {
    if (!price) return '가격 정보 없음'
    if (price === '0' || price === 0) return '무료'

    const numPrice = typeof price === 'string' ? parseInt(price) : price
    return new Intl.NumberFormat('ko-KR').format(numPrice) + '원'
  }

  // ==================== 디버깅 ====================

  /**
   * Product Service 상태 디버깅
   */
  debugProductStatus() {
    console.group('🔍 [PRODUCT] 상품 서비스 상태')

    console.log('=== 서버 정보 ===')
    console.log('Content Server URL:', this.baseURL)

    console.log('=== 지원 기능 ===')
    console.log('상품 CRUD: 등록, 조회, 수정, 삭제')
    console.log('리액션: 좋아요, 북마크, 관심상품')
    console.log('검색 및 필터링: 키워드, 카테고리, 브랜드')

    // 부모 클래스의 디버깅도 호출
    this.debugStatus()

    console.groupEnd()
  }
}

// ==================== 필터 및 유틸리티 ====================

/**
 * 상품 필터링 및 검색 유틸리티
 */
export const productFilterUtils = {
  /**
   * 파라미터에서 빈 값 제거 (유틸리티 함수)
   */
  removeEmptyParams(params) {
    if (!params || typeof params !== 'object') {
      return {}
    }

    const cleaned = {}

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            cleaned[key] = value
          }
        } else {
          cleaned[key] = value
        }
      }
    })

    return cleaned
  },

  /**
   * 기본 검색 조건 반환
   */
  getDefaultSearchCondition() {
    return {
      keyword: '',
      categoryId: null,
      status: 'APPROVED',
      creatorId: null
    }
  },

  /**
   * 기본 페이징 조건 반환
   */
  getDefaultPageable() {
    return {
      page: 0,
      size: 20,
      sort: 'createdAt,DESC'
    }
  },

  /**
   * 정렬 옵션 목록 반환
   */
  getSortOptions() {
    return [
      { value: 'createdAt,DESC', label: '최신순' },
      { value: 'createdAt,ASC', label: '오래된순' },
      { value: 'likeCount,DESC', label: '좋아요순' },
      { value: 'viewCount,DESC', label: '조회수순' },
      { value: 'averageRating,DESC', label: '평점높은순' },
      { value: 'name,ASC', label: '이름순' },
      { value: 'releaseDate,DESC', label: '출시일순' }
    ]
  }
}

/**
 * 상품 관련 유틸리티 함수들
 */
export const productUtils = {
  /**
   * 숫자를 한국어 단위로 포맷팅
   */
  formatCount(count) {
    if (!count || count === 0) return '0'

    const num = parseInt(count)

    if (num >= 10000) {
      return Math.floor(num / 10000) + '만+'
    } else if (num >= 1000) {
      return Math.floor(num / 1000) + 'k'
    }

    return num.toString()
  },

  /**
   * 가격 포맷팅
   */
  formatPrice(price) {
    if (!price || price === '0' || price === 0) return '무료'

    const numPrice = typeof price === 'string' ? parseInt(price) : price
    return new Intl.NumberFormat('ko-KR').format(numPrice) + '원'
  },

  /**
   * 평점 포맷팅
   */
  formatRating(rating) {
    if (!rating) return '0.0'
    return typeof rating === 'number' ? rating.toFixed(1) : rating
  },

  /**
   * 날짜 포맷팅
   */
  formatDate(dateString) {
    if (!dateString) return ''

    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`

    return date.toLocaleDateString('ko-KR')
  }
}

// ==================== Vue Composables ====================

/**
 * Vue Composition API용 상품 훅
 * Vue 컴포넌트에서 사용하는 메인 인터페이스
 */
export function useProduct() {
  const productService = new ProductService()

  /**
   * 상품 등록 (Vue 컴포넌트용 래퍼)
   */
  const createProduct = async (productData) => {
    try {
      // 유효성 검증
      const validation = productService.validateProductData(productData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      console.log('🚀 [PRODUCT] 상품 등록 시작:', {
        name: productData.name,
        categoryId: productData.categoryId
      })

      // JSON 데이터로 전송
      const requestData = {
        name: productData.name.trim(),
        brand: productData.brand.trim(),
        categoryId: parseInt(productData.categoryId),
        price: productData.price || null,
        description: productData.description?.trim() || null,
        distributor: productData.distributor?.trim() || null,
        releaseDate: productData.releaseDate || null,
        feature: productData.feature?.trim() || null,
        tags: productData.tags || []
      }

      // API 호출 (post 메서드 사용 - JSON 전송)
      const response = await productService.post('/products', requestData)

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
   * 카테고리 목록 조회 (Vue 컴포넌트용 래퍼)
   */
  const getCategories = async () => {
    try {
      const response = await productService.getCategories()

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        }
      } else {
        // API 실패 시 기본 카테고리 제공
        console.warn('[PRODUCT] 카테고리 API 실패, 기본값 사용')
        return productService.getSampleCategories()
      }
    } catch (error) {
      console.error('[PRODUCT] 카테고리 조회 실패:', error)
      // 에러 시에도 기본 카테고리 제공
      return productService.getSampleCategories()
    }
  }

  /**
   * 디버깅 정보 출력
   */
  const debugStatus = () => {
    productService.debugProductStatus()
  }

  /**
   * 파일 크기 포맷팅 유틸리티
   */
  const formatFileSize = (size) => {
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    // 주요 메서드 (Vue 컴포넌트에서 직접 사용)
    createProduct,
    getCategories,
    debugStatus,

    // 상품 관리
    getProducts: (searchCondition, pageable) => productService.getProducts(searchCondition, pageable),
    getProduct: (productId) => productService.getProduct(productId),
    updateProduct: (productId, productData) => productService.updateProduct(productId, productData),
    deleteProduct: (productId) => productService.deleteProduct(productId),

    // 리액션
    likeProduct: (productId) => productService.likeProduct(productId),
    bookmarkProduct: (productId) => productService.bookmarkProduct(productId),

    // 검색
    searchProducts: (keyword, filters, pageable) => productService.searchProducts(keyword, filters, pageable),
    getPopularProducts: (params) => productService.getPopularProducts(params),

    // 유틸리티
    formatPrice: (price) => productService.formatPrice(price),
    formatFileSize,
    validateProductData: (productData) => productService.validateProductData(productData),

    // 연결 테스트
    testConnection: () => productService.testConnection()
  }
}

// ==================== 싱글톤 인스턴스 ====================

// 싱글톤 인스턴스 생성 및 내보내기
export const productService = new ProductService()

// 별칭 (기존 코드 호환성)
export const productApi = productService

// 기본 내보내기
export default productService