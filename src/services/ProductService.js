// services/ProductService.js

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'
import {ENV, getServiceUrl} from "@/config/env.js";

class ProductService extends BaseApiService {
  constructor() {
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

  async toggleProductReaction(productId, reactionType) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')
    const validReactionTypes = ['LIKE', 'BOOKMARK', 'INTEREST', 'SHARE', 'WISH']
    if (!validReactionTypes.includes(reactionType.toUpperCase())) {
      throw new Error('올바른 리액션 타입을 선택해주세요.')
    }
    const requestData = { deviceId: authUtils.getDeviceId() }
    return await this.post(`/products/${productId}/reactions/${reactionType.toUpperCase()}`, requestData)
  }

  async likeProduct(productId) { return this.toggleProductReaction(productId, 'LIKE') }
  async bookmarkProduct(productId) { return this.toggleProductReaction(productId, 'BOOKMARK') }

  async getCategories() { return await this.get('/categories') }
  async getCategory(categoryId) {
    if (!categoryId) throw new Error('카테고리 ID가 필요합니다.')
    return await this.get(`/categories/${categoryId}`)
  }

  async searchProducts(keyword, filters = {}, pageable = {}) {
    if (!keyword || keyword.trim().length === 0) throw new Error('검색 키워드가 필요합니다.')

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

  // ==================== 상품 피드/배틀 관련 메서드 (NEW) ====================

  /**
   * 상품 피드 목록 조회 (커서 기반 페이지네이션)
   */
  async getProductFeeds(productId, options = {}) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')

    const params = this.removeEmptyParams({
      cursor: options.cursor || null,
      size: Math.min(100, Math.max(1, options.size || 20))
    })

    console.log('📤 [PRODUCT_SERVICE] getProductFeeds 요청:', { productId, params })
    return await this.get(`/products/${productId}/feeds`, params)
  }

  /**
   * 상품 배틀 목록 조회 (커서 기반 페이지네이션)
   */
  async getProductBattles(productId, options = {}) {
    if (!productId) throw new Error('상품 ID가 필요합니다.')

    const params = this.removeEmptyParams({
      cursor: options.cursor || null,
      size: Math.min(100, Math.max(1, options.size || 20))
    })

    console.log('📤 [PRODUCT_SERVICE] getProductBattles 요청:', { productId, params })
    return await this.get(`/products/${productId}/battles`, params)
  }

  // ==================== 리뷰 관련 메서드 ====================

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

  async uploadReviewImage(file) {
    if (!file) throw new Error('파일이 필요합니다.')
    if (file.size > 5 * 1024 * 1024) throw new Error('파일 크기는 5MB 이하여야 합니다.')
    if (!file.type.startsWith('image/')) throw new Error('이미지 파일만 업로드 가능합니다.')

    const formData = new FormData()
    formData.append('file', file)
    return await this.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  }

  // ==================== 유틸리티/검증 메서드 ====================

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

  normalizeProduct(product) { return product || null }
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
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) errors.push('평점은 1~5 사이여야 합니다.')
    if (!reviewData.comment?.trim()) errors.push('리뷰 내용을 입력해주세요.')
    else if (reviewData.comment.trim().length < 10) errors.push('리뷰는 최소 10자 이상 작성해주세요.')
    else if (reviewData.comment.length > 1000) errors.push('리뷰는 1000자 이하로 작성해주세요.')
    if (reviewData.attachmentFileInfos?.length > 5) errors.push('이미지는 최대 5장까지 첨부 가능합니다.')
    return { isValid: errors.length === 0, errors }
  }

  validateSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') return {}
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']
    const validated = { ...searchCondition }
    if (validated.status && !validStatuses.includes(validated.status)) validated.status = 'APPROVED'
    if (validated.keyword?.length > 100) validated.keyword = validated.keyword.substring(0, 100)
    if (validated.categoryId) {
      if (isNaN(parseInt(validated.categoryId))) delete validated.categoryId
      else validated.categoryId = parseInt(validated.categoryId)
    }
    return validated
  }

  validatePageable(pageable) {
    const validSorts = ['createdAt,DESC', 'createdAt,ASC', 'releaseDate,DESC', 'releaseDate,ASC', 'likeCount,DESC', 'likeCount,ASC', 'viewCount,DESC', 'viewCount,ASC', 'name,DESC', 'name,ASC']
    return {
      page: Math.max(0, pageable?.page || 0),
      size: Math.min(100, Math.max(1, pageable?.size || 20)),
      sort: validSorts.includes(pageable?.sort) ? pageable.sort : 'createdAt,DESC'
    }
  }

  validateReviewPageable(pageable) {
    const validSorts = ['createdAt,DESC', 'createdAt,ASC', 'rating,DESC', 'rating,ASC', 'likeCount,DESC', 'likeCount,ASC']
    return {
      page: Math.max(0, pageable?.page || 0),
      size: Math.min(50, Math.max(1, pageable?.size || 10)),
      sort: validSorts.includes(pageable?.sort) ? pageable.sort : 'createdAt,DESC'
    }
  }

  formatPrice(price) {
    if (!price) return '가격 정보 없음'
    if (price === '0' || price === 0) return '무료'
    return new Intl.NumberFormat('ko-KR').format(typeof price === 'string' ? parseInt(price) : price) + '원'
  }

  debugProductStatus() {
    console.group('🔍 [PRODUCT] 상품 서비스 상태')
    console.log('Content Server URL:', this.baseURL)
    console.log('지원 기능: 상품 CRUD, 리액션, 리뷰, 피드/배틀 조회')
    this.debugStatus()
    console.groupEnd()
  }
}

export const productService = new ProductService()
export default productService