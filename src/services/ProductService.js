// services/ProductService.js

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'
import { ENV, getServiceUrl } from "@/config/env.js"

class ProductService extends BaseApiService {
  constructor() {
    const baseURL = `${getServiceUrl('CONTENT')}/api`
    super(baseURL, 'CONTENT')
    console.log(`⚔️ [PRODUCT] Content Server URL: ${this.baseURL}`)
    console.log(`🌍 [PRODUCT] Environment: ${ENV.MODE}`)
  }

  // ==================== 상품 CRUD ====================

  async createProduct(productData) {
    console.log('🚀 [PRODUCT_SERVICE] 상품 등록 요청 데이터:', JSON.stringify(productData, null, 2))
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
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    const response = await this.get(`/products/${productId}`)
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
    const params = { ...cleanedCondition, ...cleanedPageable }

    console.log('📤 [PRODUCT_SERVICE] getProducts 요청 파라미터:', params)
    const response = await this.get('/products', params)

    if (response.success && response.data) {
      if (response.data.content && Array.isArray(response.data.content)) {
        response.data.content = this.normalizeProductListResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        response.data = this.normalizeProductListResponse(response.data)
      }
    }
    return response
  }

  async getMyProducts(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)
    const params = { ...cleanedCondition, ...cleanedPageable }

    console.log('📤 [PRODUCT_SERVICE] getMyProducts 요청 파라미터:', params)
    const response = await this.get('/products/my', params)

    if (response.success && response.data) {
      if (response.data.content && Array.isArray(response.data.content)) {
        response.data.content = this.normalizeProductListResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        response.data = this.normalizeProductListResponse(response.data)
      }
    }
    return response
  }

  async getAllProductsForAdmin(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)
    const params = { ...cleanedCondition, ...cleanedPageable }

    console.log('📤 [PRODUCT_SERVICE] getAllProductsForAdmin 요청 파라미터:', params)
    const response = await this.get('/products/admin/all', params)

    if (response.success && response.data) {
      if (response.data.content && Array.isArray(response.data.content)) {
        response.data.content = this.normalizeProductListResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        response.data = this.normalizeProductListResponse(response.data)
      }
    }
    return response
  }

  async updateProduct(productId, productData) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    const validation = this.validateProductData(productData)
    if (!validation.isValid) throw new Error(validation.errors.join(', '))

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
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    return await this.delete(`/products/${productId}`)
  }

  // ==================== 상품 상태 관리 (관리자) ====================

  async updateProductStatus(productId, status, reason = null) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']
    if (!validStatuses.includes(status)) {
      throw new Error('올바른 상태값이 아닙니다.')
    }

    if (status === 'REJECTED' && !reason?.trim()) {
      throw new Error('반려 시 사유는 필수입니다.')
    }

    const requestData = {
      status,
      rejectReason: reason?.trim() || null
    }

    console.log('📤 [PRODUCT_SERVICE] updateProductStatus 요청:', { productId, ...requestData })
    return await this.patch(`/products/${productId}/status`, requestData)
  }

  async bulkUpdateProductStatus(productIds, status, reason = null) {
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new Error('상품 ID 목록이 필요합니다.')
    }

    if (productIds.length > 100) {
      throw new Error('한 번에 최대 100개까지 처리 가능합니다.')
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']
    if (!validStatuses.includes(status)) {
      throw new Error('올바른 상태값이 아닙니다.')
    }

    if (status === 'REJECTED' && !reason?.trim()) {
      throw new Error('반려 시 사유는 필수입니다.')
    }

    const requestData = {
      productIds,
      status,
      rejectReason: reason?.trim() || null
    }

    console.log('📤 [PRODUCT_SERVICE] bulkUpdateProductStatus 요청:', requestData)
    return await this.patch('/products/bulk/status', requestData)
  }

  // 편의 메서드 (기존 호출부 호환)
  async approveProduct(productId) {
    return this.updateProductStatus(productId, 'APPROVED')
  }

  async rejectProduct(productId, reason) {
    return this.updateProductStatus(productId, 'REJECTED', reason)
  }

  async bulkApproveProducts(productIds) {
    return this.bulkUpdateProductStatus(productIds, 'APPROVED')
  }

  async bulkRejectProducts(productIds, reason) {
    return this.bulkUpdateProductStatus(productIds, 'REJECTED', reason)
  }

  async bulkDeleteProducts(productIds) {
    return this.bulkUpdateProductStatus(productIds, 'DELETED')
  }

  // ==================== 리액션 ====================

  async toggleProductReaction(productId, reactionType) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    const validReactionTypes = ['LIKE', 'BOOKMARK', 'INTEREST', 'SHARE', 'WISH']
    if (!validReactionTypes.includes(reactionType.toUpperCase())) {
      throw new Error('올바른 리액션 타입을 선택해주세요.')
    }
    const requestData = { deviceId: authUtils.getDeviceId() }
    return await this.post(`/products/${productId}/reactions/${reactionType.toUpperCase()}`, requestData)
  }

  async likeProduct(productId) {
    return this.toggleProductReaction(productId, 'LIKE')
  }

  async bookmarkProduct(productId) {
    return this.toggleProductReaction(productId, 'BOOKMARK')
  }

  // ==================== 카테고리 ====================

  async getCategories() {
    return await this.get('/categories')
  }

  async getCategory(categoryId) {
    if (!categoryId) throw new Error('카테고리 ID가 필요합니다.')
    return await this.get(`/categories/${categoryId}`)
  }

  // ==================== 검색/인기 ====================

  async searchProducts(keyword, filters = {}, pageable = {}) {
    if (!keyword || keyword.trim().length === 0) {
      throw new Error('검색 키워드가 필요합니다.')
    }

    const params = {
      keyword: keyword.trim(),
      ...this.removeEmptyParams(filters),
      ...this.removeEmptyParams(this.validatePageable(pageable))
    }

    const response = await this.get('/products/search', params)
    if (response.success && response.data) {
      if (response.data.content) {
        response.data.content = this.normalizeProductListResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        response.data = this.normalizeProductListResponse(response.data)
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
    const response = await this.get('/products/popular', this.removeEmptyParams(validatedParams))
    if (response.success && Array.isArray(response.data)) {
      response.data = this.normalizeProductListResponse(response.data)
    }
    return response
  }

  // ==================== 피드/배틀 ====================

  async getProductFeeds(productId, options = {}) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    const params = this.removeEmptyParams({
      cursor: options.cursor || null,
      size: Math.min(100, Math.max(1, options.size || 20))
    })
    console.log('📤 [PRODUCT_SERVICE] getProductFeeds 요청:', { productId, params })
    return await this.get(`/products/${productId}/feeds`, params)
  }

  async getProductBattles(productId, options = {}) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    const params = this.removeEmptyParams({
      cursor: options.cursor || null,
      size: Math.min(100, Math.max(1, options.size || 20))
    })
    console.log('📤 [PRODUCT_SERVICE] getProductBattles 요청:', { productId, params })
    return await this.get(`/products/${productId}/battles`, params)
  }

  // ==================== 리뷰 ====================

  async createReview(productId, reviewData) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    const validation = this.validateReviewData(reviewData)
    if (!validation.isValid) throw new Error(validation.errors.join(', '))

    const requestData = {
      productId: parseInt(productId),
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      attachmentFileInfos: reviewData.attachmentFileInfos || []
    }
    return await this.post(`/products/${productId}/reviews`, requestData)
  }

  async getProductReviews(productId, pageable = {}) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    const params = this.removeEmptyParams(this.validateReviewPageable(pageable))
    return await this.get(`/products/${productId}/reviews`, params)
  }

  async getReview(reviewId) {
    if (!reviewId) throw new Error('리뷰 ID가 필요합니다.')
    return await this.get(`/reviews/${reviewId}`)
  }

  async getMyReviews(pageable = {}) {
    return await this.get('/reviews/my', this.removeEmptyParams(this.validateReviewPageable(pageable)))
  }

  async updateReview(reviewId, reviewData) {
    if (!reviewId) throw new Error('리뷰 ID가 필요합니다.')
    const validation = this.validateReviewData(reviewData)
    if (!validation.isValid) throw new Error(validation.errors.join(', '))

    return await this.put(`/reviews/${reviewId}`, {
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      imageUrls: reviewData.imageUrls || []
    })
  }

  async deleteReview(reviewId) {
    if (!reviewId) throw new Error('리뷰 ID가 필요합니다.')
    return await this.delete(`/reviews/${reviewId}`)
  }

  async toggleReviewLike(reviewId) {
    if (!reviewId) throw new Error('리뷰 ID가 필요합니다.')
    return await this.post(`/reviews/${reviewId}/like`)
  }

  async reportReview(reviewId, reason) {
    if (!reviewId) throw new Error('리뷰 ID가 필요합니다.')
    if (!reason?.trim()) throw new Error('신고 사유를 입력해주세요.')
    return await this.post(`/reviews/${reviewId}/report`, { reason: reason.trim() })
  }

  async getReviewStats(productId) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    return await this.get(`/products/${productId}/reviews/stats`)
  }

  // ==================== 유틸리티/검증 ====================

  removeEmptyParams(params) {
    if (!params || typeof params !== 'object') return {}
    const cleaned = {}
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) ? value.length > 0 : true) cleaned[key] = value
      }
    })
    return cleaned
  }

  normalizeProduct(product) {
    if (!product) return null

    // popularityScore가 없으면 viewCount, likeCount, shareCount, reviewCount 기반으로 계산
    if (product.popularityScore === undefined || product.popularityScore === null) {
      const viewCount = product.viewCount || 0
      const likeCount = product.likeCount || 0
      const shareCount = product.shareCount || 0
      const reviewCount = product.reviewCount || 0
      // 가중치: 조회수(1) + 좋아요(3) + 공유(5) + 리뷰(2)
      product.popularityScore = viewCount + (likeCount * 3) + (shareCount * 5) + (reviewCount * 2)
    }

    return product
  }

  normalizeProductListResponse(products) {
    return Array.isArray(products) ? products.map(p => this.normalizeProduct(p)) : []
  }

  validateProductData(productData) {
    const errors = []
    if (!productData.name?.trim()) errors.push('상품명은 필수입니다.')
    if (productData.name?.length > 100) errors.push('상품명은 100자 이하여야 합니다.')
    if (!productData.brand?.trim()) errors.push('브랜드명은 필수입니다.')
    if (!productData.categoryId) errors.push('카테고리는 필수입니다.')
    if (productData.description?.length > 2000) errors.push('상품 설명은 2000자 이하여야 합니다.')
    if (productData.tags?.length > 10) errors.push('태그는 최대 10개까지 가능합니다.')
    return { isValid: errors.length === 0, errors }
  }

  validateReviewData(reviewData) {
    const errors = []
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('평점은 1~5 사이여야 합니다.')
    }
    if (!reviewData.comment?.trim()) {
      errors.push('리뷰 내용을 입력해주세요.')
    } else if (reviewData.comment.trim().length < 10) {
      errors.push('리뷰는 최소 10자 이상 작성해주세요.')
    } else if (reviewData.comment.length > 1000) {
      errors.push('리뷰는 1000자 이하로 작성해주세요.')
    }
    if (reviewData.attachmentFileInfos?.length > 5) {
      errors.push('이미지는 최대 5장까지 첨부 가능합니다.')
    }
    return { isValid: errors.length === 0, errors }
  }

  validateSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') return {}
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']
    const validated = { ...searchCondition }
    if (validated.status && !validStatuses.includes(validated.status)) {
      validated.status = 'APPROVED'
    }
    if (validated.keyword?.length > 100) {
      validated.keyword = validated.keyword.substring(0, 100)
    }
    if (validated.categoryId) {
      if (isNaN(parseInt(validated.categoryId))) delete validated.categoryId
      else validated.categoryId = parseInt(validated.categoryId)
    }
    return validated
  }

  validatePageable(pageable) {
    const validSorts = [
      'createdAt,DESC', 'createdAt,ASC',
      'releaseDate,DESC', 'releaseDate,ASC',
      'updatedAt,DESC', 'updatedAt,ASC',
      'name,DESC', 'name,ASC',
      'popularityScore,DESC', 'popularityScore,ASC',
      'likeCount,DESC', 'likeCount,ASC',
      'viewCount,DESC', 'viewCount,ASC',
      'averageRating,DESC', 'averageRating,ASC',
      'shareCount,DESC', 'shareCount,ASC',
      'reviewCount,DESC', 'reviewCount,ASC'
    ]
    return {
      page: Math.max(0, pageable?.page || 0),
      size: Math.min(100, Math.max(1, pageable?.size || 20)),
      sort: validSorts.includes(pageable?.sort) ? pageable.sort : 'createdAt,DESC'
    }
  }

  validateReviewPageable(pageable) {
    const validSorts = [
      'createdAt,DESC', 'createdAt,ASC',
      'rating,DESC', 'rating,ASC',
      'likeCount,DESC', 'likeCount,ASC'
    ]
    return {
      page: Math.max(0, pageable?.page || 0),
      size: Math.min(50, Math.max(1, pageable?.size || 10)),
      sort: validSorts.includes(pageable?.sort) ? pageable.sort : 'createdAt,DESC'
    }
  }

  formatPrice(price) {
    if (!price) return '가격 정보 없음'
    if (price === '0' || price === 0) return '무료'
    return new Intl.NumberFormat('ko-KR').format(
        typeof price === 'string' ? parseInt(price) : price
    ) + '원'
  }

  debugProductStatus() {
    console.group('🔍 [PRODUCT] 상품 서비스 상태')
    console.log('Content Server URL:', this.baseURL)
    console.log('지원 기능: 상품 CRUD, 상태관리, 리액션, 리뷰, 피드/배틀 조회')
    this.debugStatus()
    console.groupEnd()
  }
}

export const productService = new ProductService()
export default productService

// ==================== 유틸리티 객체 ====================

export const productFilterUtils = {
  removeEmptyParams(params) {
    if (!params || typeof params !== 'object') return {}
    const cleaned = {}
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) ? value.length > 0 : true) cleaned[key] = value
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
      { value: 'popularityScore,DESC', label: '인기순' },
      { value: 'likeCount,DESC', label: '좋아요순' },
      { value: 'viewCount,DESC', label: '조회수순' },
      { value: 'averageRating,DESC', label: '평점높은순' },
      { value: 'reviewCount,DESC', label: '리뷰많은순' },
      { value: 'shareCount,DESC', label: '공유순' },
      { value: 'name,ASC', label: '이름순' },
      { value: 'releaseDate,DESC', label: '출시일순' },
      { value: 'updatedAt,DESC', label: '수정일순' }
    ]
  },

  getStatusOptions() {
    return [
      { value: 'PENDING', label: '승인 대기' },
      { value: 'APPROVED', label: '승인됨' },
      { value: 'REJECTED', label: '반려됨' },
      { value: 'DELETED', label: '삭제됨' }
    ]
  }
}

export const productUtils = {
  formatCount(count) {
    if (!count || count === 0) return '0'
    const num = parseInt(count)
    if (num >= 10000) return Math.floor(num / 10000) + '만+'
    if (num >= 1000) return Math.floor(num / 1000) + 'k'
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

  getStatusLabel(status) {
    const labels = {
      PENDING: '승인 대기',
      APPROVED: '승인됨',
      REJECTED: '반려됨',
      DELETED: '삭제됨'
    }
    return labels[status] || '알 수 없음'
  },

  getStatusColor(status) {
    const colors = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
      DELETED: 'default'
    }
    return colors[status] || 'default'
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
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars)
  }
}