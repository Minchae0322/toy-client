// services/ProductService.js

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'
import {ENV, getServiceUrl} from "@/config/env.js";

class ProductService extends BaseApiService {
  constructor() {
    // 개발: http://54.180.89.70:8082/api (단일 서버)
    // 프로덕션: https://content.yourdomain.com/api (MSA)
    const baseURL = `${getServiceUrl('PRODUCT')}/api`

    super(baseURL, 'FEED')
    console.log(`⚔️ [PRODUCT] Content Server URL: ${this.baseURL}`)
    console.log(`🌍 [PRODUCT] Environment: ${ENV.MODE}`)
  }


  // ==================== 상품 관련 메서드 ====================

  async createProduct(productData) {
    console.log('🚀 [PRODUCT_SERVICE] 상품 등록 요청 데이터 (전체):', JSON.stringify(productData, null, 2))

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
      tags: productData.tags || [],
      thumbnailAttachmentInfo: productData.thumbnailAttachmentInfo || null,
      attachmentFileInfos: productData.attachmentFileInfos || []
    }

    console.log('📤 [PRODUCT_SERVICE] 최종 전송 데이터:', JSON.stringify(requestData, null, 2))
    return await this.post('/products', requestData)
  }

  async getProduct(productId) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }
    const response = await this.get(`/products/${productId}`)

    // ⭐ 단일 상품도 정규화
    if (response.success && response.data) {
      response.data = this.normalizeProduct(response.data)
    }

    return response
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

    console.log('📤 [PRODUCT_SERVICE] getProducts 요청 파라미터:', params)
    const response = await this.get('/products', params)
    console.log('📥 [PRODUCT_SERVICE] getProducts 원본 응답:', {
      success: response.success,
      hasData: !!response.data,
      dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
      firstItem: response.data?.content?.[0] || response.data?.[0]
    })

    // ⭐ 응답 정규화 (Spring Page 응답)
    if (response.success && response.data) {
      if (response.data.content && Array.isArray(response.data.content)) {
        // 페이징 응답 (Spring Page)
        console.log('📦 [PRODUCT_SERVICE] Spring Page 응답 처리:', response.data.content.length, '개')
        response.data.content = this.normalizeProductListResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        // 배열 응답
        console.log('📦 [PRODUCT_SERVICE] 배열 응답 처리:', response.data.length, '개')
        response.data = this.normalizeProductListResponse(response.data)
      }
    }

    return response
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

    console.log('🔍 [PRODUCT_SERVICE] searchProducts 요청:', params)
    const response = await this.get('/products/search', params)
    console.log('📥 [PRODUCT_SERVICE] searchProducts 원본 응답:', JSON.stringify(response, null, 2))

    // ⭐ 응답 정규화 - 검색 응답도 동일하게 처리
    if (response.success && response.data) {
      if (response.data.content) {
        // 페이징 응답
        console.log('📦 정규화 전 content:', response.data.content.length, '개')
        response.data.content = this.normalizeProductListResponse(response.data.content)
        console.log('✅ 정규화 후 content:', response.data.content.length, '개')
      } else if (Array.isArray(response.data)) {
        // 배열 응답
        console.log('📦 정규화 전 array:', response.data.length, '개')
        response.data = this.normalizeProductListResponse(response.data)
        console.log('✅ 정규화 후 array:', response.data.length, '개')
      }
    }

    return response
  }

  async getPopularProducts(params = {}) {
    const validatedParams = {
      size: params.size || 10,
      categoryId: params.categoryId || null,
      period: params.period || 'WEEK'
    }

    const cleanedParams = this.removeEmptyParams(validatedParams)
    const response = await this.get('/products/popular', cleanedParams)

    // ⭐ 인기 상품도 정규화
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        response.data = this.normalizeProductListResponse(response.data)
      }
    }

    return response
  }

  // ==================== 리뷰 관련 메서드 ====================

  async createReview(productId, reviewData) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    const validation = this.validateReviewData(reviewData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      productId: parseInt(productId),
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      attachmentFileInfos: reviewData.attachmentFileInfos || []
    }

    console.log('📤 [PRODUCT_SERVICE] 리뷰 등록 요청:', requestData)
    return await this.post(`/products/${productId}/reviews`, requestData)
  }

  async getProductReviews(productId, pageable = {}) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    const validatedPageable = this.validateReviewPageable(pageable)
    const params = this.removeEmptyParams(validatedPageable)

    console.log('📤 [PRODUCT_SERVICE] 리뷰 목록 조회:', { productId, params })
    return await this.get(`/products/${productId}/reviews`, params)
  }

  async getReview(reviewId) {
    if (!reviewId) {
      throw new Error('리뷰 ID가 필요합니다.')
    }
    return await this.get(`/reviews/${reviewId}`)
  }

  async getMyReviews(pageable = {}) {
    const validatedPageable = this.validateReviewPageable(pageable)
    const params = this.removeEmptyParams(validatedPageable)

    return await this.get('/reviews/my', params)
  }

  async updateReview(reviewId, reviewData) {
    if (!reviewId) {
      throw new Error('리뷰 ID가 필요합니다.')
    }

    const validation = this.validateReviewData(reviewData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      imageUrls: reviewData.imageUrls || []
    }

    return await this.put(`/reviews/${reviewId}`, requestData)
  }

  async deleteReview(reviewId) {
    if (!reviewId) {
      throw new Error('리뷰 ID가 필요합니다.')
    }
    return await this.delete(`/reviews/${reviewId}`)
  }

  async toggleReviewLike(reviewId) {
    if (!reviewId) {
      throw new Error('리뷰 ID가 필요합니다.')
    }
    return await this.post(`/reviews/${reviewId}/like`)
  }

  async reportReview(reviewId, reason) {
    if (!reviewId) {
      throw new Error('리뷰 ID가 필요합니다.')
    }
    if (!reason || reason.trim().length === 0) {
      throw new Error('신고 사유를 입력해주세요.')
    }

    return await this.post(`/reviews/${reviewId}/report`, { reason: reason.trim() })
  }

  async getReviewStats(productId) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }
    return await this.get(`/products/${productId}/reviews/stats`)
  }

  async uploadReviewImage(file) {
    if (!file) {
      throw new Error('파일이 필요합니다.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('파일 크기는 5MB 이하여야 합니다.')
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.')
    }

    const formData = new FormData()
    formData.append('file', file)

    console.log('📤 [PRODUCT_SERVICE] 리뷰 이미지 업로드 시작')
    return await this.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // ==================== 유틸리티 메서드 ====================

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

  // ⭐ 단일 상품 정규화 메서드 (백엔드 ProductList 스펙 반영)
  normalizeProduct(product) {
    if (!product) return null

    // ⭐ 백엔드 응답을 그대로 반환 (추가 필드 없이)
    return product
  }

  // ⭐ 상품 목록 정규화 메서드
  normalizeProductListResponse(products) {
    if (!Array.isArray(products)) {
      console.warn('⚠️ [PRODUCT_SERVICE] products가 배열이 아닙니다:', products)
      return []
    }

    return products.map(product => this.normalizeProduct(product))
  }

  // ==================== 검증 메서드 ====================

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

  validateReviewData(reviewData) {
    const errors = []

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

  validateReviewPageable(pageable) {
    if (!pageable || typeof pageable !== 'object') {
      return {
        page: 0,
        size: 10,
        sort: 'createdAt,DESC'
      }
    }

    const validSorts = [
      'createdAt,DESC', 'createdAt,ASC',
      'rating,DESC', 'rating,ASC',
      'likeCount,DESC', 'likeCount,ASC'
    ]

    return {
      page: Math.max(0, pageable.page || 0),
      size: Math.min(50, Math.max(1, pageable.size || 10)),
      sort: validSorts.includes(pageable.sort) ? pageable.sort : 'createdAt,DESC'
    }
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
    console.log('리뷰 CRUD: 등록, 조회, 수정, 삭제')
    console.log('리뷰 기능: 좋아요, 신고, 이미지 업로드')
    console.log('검색 및 필터링: 키워드, 카테고리, 브랜드')
    this.debugStatus()
    console.groupEnd()
  }
}

// 싱글톤 인스턴스
export const productService = new ProductService()
export default productService

/**
 * 상품 필터링 및 검색 유틸리티
 */
export const productFilterUtils = {
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

  getDefaultSearchCondition() {
    return {
      keyword: '',
      categoryId: null,
      status: 'APPROVED',
      creatorId: null
    }
  },

  getDefaultPageable() {
    return {
      page: 0,
      size: 20,
      sort: 'createdAt,DESC'
    }
  },

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

  formatPrice(price) {
    if (!price || price === '0' || price === 0) return '무료'

    const numPrice = typeof price === 'string' ? parseInt(price) : price
    return new Intl.NumberFormat('ko-KR').format(numPrice) + '원'
  },

  formatRating(rating) {
    if (!rating) return '0.0'
    return typeof rating === 'number' ? rating.toFixed(1) : rating
  },

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
  },

  getRatingText(rating) {
    const texts = {
      1: '별로예요',
      2: '그저 그래요',
      3: '괜찮아요',
      4: '좋아요',
      5: '최고예요'
    }
    return texts[Math.round(rating)] || '평가 없음'
  },

  getRatingStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return '★'.repeat(fullStars) +
        (hasHalfStar ? '☆' : '') +
        '☆'.repeat(emptyStars)
  }
}