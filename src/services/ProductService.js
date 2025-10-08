// services/ProductService.js

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'

class ProductService extends BaseApiService {
  constructor() {
    const baseURL = import.meta.env.DEV
        ? 'http://localhost:8082/api'
        : `${import.meta.env.VITE_CONTENT_BASE_URL}/api`

    super(baseURL, 'PRODUCT')
    console.log(`📦 [PRODUCT] Content Server URL: ${this.baseURL}`)
  }

  async createProduct(productData) {
    console.log('🚀 [PRODUCT_SERVICE] 상품 등록 요청 데이터 (전체):', JSON.stringify(productData, null, 2))

    const validation = this.validateProductData(productData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    // thumbnailAttachmentInfo와 attachmentFileInfos 분리
    const requestData = {
      name: productData.name.trim(),
      brand: productData.brand.trim(),
      categoryId: parseInt(productData.categoryId),
      price: productData.price || null,
      description: productData.description?.trim() || null,
      distributor: productData.distributor?.trim() || null,
      releaseDate: productData.releaseDate || null,
      feature: productData.feature?.trim() || null,
      tags: productData.tags || [],
      thumbnailAttachmentInfo: productData.thumbnailAttachmentInfo || null,  // 대표 이미지
      attachmentFileInfos: productData.attachmentFileInfos || []  // 추가 첨부파일
    }

    console.log('📤 [PRODUCT_SERVICE] 최종 전송 데이터:', JSON.stringify(requestData, null, 2))
    console.log('🖼️ [PRODUCT_SERVICE] thumbnailAttachmentInfo:', requestData.thumbnailAttachmentInfo)
    console.log('📎 [PRODUCT_SERVICE] attachmentFileInfos:', requestData.attachmentFileInfos)

    return await this.post('/products', requestData)
  }

  async getProduct(productId) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }
    return await this.get(`/products/${productId}`)
  }

  async getProducts(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)

    const params = {
      ...cleanedCondition,
      ...cleanedPageable
    }

    return await this.get('/products', params)
  }

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

  async deleteProduct(productId) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }
    return await this.delete(`/products/${productId}`)
  }

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

  async likeProduct(productId) {
    return this.toggleProductReaction(productId, 'LIKE')
  }

  async bookmarkProduct(productId) {
    return this.toggleProductReaction(productId, 'BOOKMARK')
  }

  async getCategories() {
    return await this.get('/categories')
  }

  async getCategory(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }
    return await this.get(`/categories/${categoryId}`)
  }

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

  async getPopularProducts(params = {}) {
    const validatedParams = {
      size: params.size || 10,
      categoryId: params.categoryId || null,
      period: params.period || 'WEEK'
    }

    const cleanedParams = this.removeEmptyParams(validatedParams)
    return await this.get('/products/popular', cleanedParams)
  }

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
  }

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

  validateSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') {
      return {}
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']
    const validated = { ...searchCondition }

    if (validated.status && !validStatuses.includes(validated.status)) {
      validated.status = 'APPROVED'
    }

    if (validated.keyword && validated.keyword.length > 100) {
      validated.keyword = validated.keyword.substring(0, 100)
    }

    if (validated.categoryId && isNaN(parseInt(validated.categoryId))) {
      delete validated.categoryId
    } else if (validated.categoryId) {
      validated.categoryId = parseInt(validated.categoryId)
    }

    return validated
  }

  // services/ProductService.js 내부에 추가

  /**
   * 상품 목록 응답 데이터 정규화
   * 백엔드 응답 구조를 프론트엔드에서 사용하기 쉽게 변환
   */
  normalizeProductListResponse(products) {
    if (!Array.isArray(products)) return []

    return products.map(product => ({
      ...product,
      // thumbnailDto를 thumbnailUrl로도 매핑 (하위 호환성)
      thumbnailUrl: product.thumbnailDto?.fileUrl || product.thumbnailUrl || null,
      // 썸네일 정보 보존
      thumbnail: product.thumbnailDto ? {
        id: product.thumbnailDto.id,
        fileUrl: product.thumbnailDto.fileUrl,
        orgFileNm: product.thumbnailDto.orgFileNm,
        fileSize: product.thumbnailDto.fileSize,
        contentType: product.thumbnailDto.contentType
      } : null
    }))
  }

  async getProducts(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)

    const params = {
      ...cleanedCondition,
      ...cleanedPageable
    }

    const response = await this.get('/products', params)

    // 응답 데이터 정규화
    if (response.success && response.data) {
      if (response.data.content) {
        // 페이징 응답
        response.data.content = this.normalizeProductListResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        // 배열 응답
        response.data = this.normalizeProductListResponse(response.data)
      }
    }

    return response
  }

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

    if (pageable.sort && validSorts.includes(pageable.sort)) {
      validated.sort = pageable.sort
    } else {
      validated.sort = 'createdAt,DESC'
    }

    return validated
  }

  formatPrice(price) {
    if (!price) return '가격 정보 없음'
    if (price === '0' || price === 0) return '무료'

    const numPrice = typeof price === 'string' ? parseInt(price) : price
    return new Intl.NumberFormat('ko-KR').format(numPrice) + '원'
  }

  debugProductStatus() {
    console.group('🔍 [PRODUCT] 상품 서비스 상태')
    console.log('=== 서버 정보 ===')
    console.log('Content Server URL:', this.baseURL)
    console.log('=== 지원 기능 ===')
    console.log('상품 CRUD: 등록, 조회, 수정, 삭제')
    console.log('리액션: 좋아요, 북마크, 관심상품')
    console.log('검색 및 필터링: 키워드, 카테고리, 브랜드')
    this.debugStatus()
    console.groupEnd()
  }
}



// 싱글톤 인스턴스만 export
export const productService = new ProductService()
export default productService

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