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
   * 상품 등록
   */
  async createProduct(productData) {
    const validation = this.validateProductData(productData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      name: productData.name,
      brand: productData.brand,
      description: productData.description,
      distributor: productData.distributor,
      price: productData.price,
      feature: productData.feature,
      tags: productData.tags || [],
      categoryId: productData.categoryId,
      productType: productData.productType || 'SALE',
      releaseDate: productData.releaseDate,
      attachmentFiles: productData.attachmentFiles || []
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
      name: productData.name,
      brand: productData.brand,
      description: productData.description,
      distributor: productData.distributor,
      price: productData.price,
      feature: productData.feature,
      tags: productData.tags || [],
      categoryId: productData.categoryId,
      productType: productData.productType,
      releaseDate: productData.releaseDate,
      attachmentFiles: productData.attachmentFiles || []
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

  /**
   * 상품 관심상품 등록
   */
  async interestProduct(productId) {
    return this.toggleProductReaction(productId, 'INTEREST')
  }

  /**
   * 상품 공유
   */
  async shareProduct(productId) {
    return this.toggleProductReaction(productId, 'SHARE')
  }

  /**
   * 상품 위시리스트 등록
   */
  async wishProduct(productId) {
    return this.toggleProductReaction(productId, 'WISH')
  }

  // ==================== 상품 리뷰 API ====================

  /**
   * 상품 리뷰 목록 조회
   */
  async getProductReviews(productId, pageable = {}) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    const validatedPageable = this.validatePageable(pageable)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)

    return await this.get(`/products/${productId}/reviews`, cleanedPageable)
  }

  /**
   * 상품 리뷰 작성
   */
  async createProductReview(productId, reviewData) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    const validation = this.validateReviewData(reviewData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      rating: reviewData.rating,
      comment: reviewData.comment,
      deviceId: authUtils.getDeviceId()
    }

    return await this.post(`/products/${productId}/reviews`, requestData)
  }

  /**
   * 상품 리뷰 수정
   */
  async updateProductReview(reviewId, reviewData) {
    if (!reviewId) {
      throw new Error('리뷰 ID가 필요합니다.')
    }

    const validation = this.validateReviewData(reviewData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    return await this.put(`/reviews/${reviewId}`, {
      rating: reviewData.rating,
      comment: reviewData.comment
    })
  }

  /**
   * 상품 리뷰 삭제
   */
  async deleteProductReview(reviewId) {
    if (!reviewId) {
      throw new Error('리뷰 ID가 필요합니다.')
    }

    return await this.delete(`/reviews/${reviewId}`)
  }

  // ==================== 파일 업로드 ====================

  /**
   * 상품 이미지 업로드
   */
  async uploadProductImage(productId, imageFile, options = {}) {
    if (!productId || !imageFile) {
      throw new Error('상품 ID와 이미지 파일이 필요합니다.')
    }

    const formData = new FormData()
    formData.append('file', imageFile)

    if (options.description) {
      formData.append('description', options.description)
    }

    return await this.uploadFile(`/products/${productId}/images`, formData)
  }

  /**
   * 상품 첨부파일 업로드
   */
  async uploadProductFile(productId, file, options = {}) {
    if (!productId || !file) {
      throw new Error('상품 ID와 파일이 필요합니다.')
    }

    const formData = new FormData()
    formData.append('file', file)

    if (options.description) {
      formData.append('description', options.description)
    }

    if (options.fileType) {
      formData.append('fileType', options.fileType)
    }

    return await this.uploadFile(`/products/${productId}/files`, formData)
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

  /**
   * 추천 상품 조회
   */
  async getRecommendedProducts(params = {}) {
    const validatedParams = {
      size: params.size || 10,
      userId: params.userId || authUtils.getUserId(),
      type: params.type || 'PERSONALIZED' // PERSONALIZED, SIMILAR, RECENT
    }

    // null 값 제거
    const cleanedParams = this.removeEmptyParams(validatedParams)

    return await this.get('/products/recommendations', cleanedParams)
  }

  // ==================== 상품 통계 ====================

  /**
   * 상품 조회수 증가
   */
  async incrementViewCount(productId) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    const requestData = {
      deviceId: authUtils.getDeviceId()
    }

    return await this.post(`/products/${productId}/views`, requestData)
  }

  /**
   * 상품 통계 조회
   */
  async getProductStats(productId) {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    return await this.get(`/products/${productId}/stats`)
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
            name: "건담 RX-78-2 Ver. Ka",
            brand: "반다이",
            status: "APPROVED",
            price: "45000",
            viewCount: 1250,
            likeCount: 89,
            averageRating: 4.7,
            reviewCount: 23,
            categoryName: "프라모델",
            productType: "SALE",
            thumbnailUrl: "https://example.com/images/gundam1.jpg",
            releaseDate: "2024-01-15",
            createdAt: "2024-01-10T10:30:00"
          },
          {
            id: 2,
            name: "포켓몬 피카츄 피규어",
            brand: "굿스마일컴퍼니",
            status: "APPROVED",
            price: "28000",
            viewCount: 890,
            likeCount: 156,
            averageRating: 4.9,
            reviewCount: 45,
            categoryName: "피규어",
            productType: "SALE",
            thumbnailUrl: "https://example.com/images/pikachu1.jpg",
            releaseDate: "2024-02-01",
            createdAt: "2024-01-25T14:20:00"
          }
        ],
        pageable: {
          page: 0,
          size: 10,
          sort: "createdAt,DESC"
        },
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true
      }
    }
  }

  /**
   * 샘플 상품 상세 데이터 제공
   */
  getSampleProductDetail(productId) {
    return {
      success: true,
      data: {
        id: productId,
        name: "건담 RX-78-2 Ver. Ka",
        brand: "반다이",
        status: {
          title: "APPROVED",
          description: "승인"
        },
        description: "마스터 그레이드 건담 RX-78-2 Ver.Ka는 katoki hajime의 리파인 디자인으로 제작된 프라모델입니다.",
        distributor: "반다이코리아",
        price: "45000",
        feature: "리미티드 에디션, 특별 컬러링, 디오라마 베이스 포함",
        tags: ["건담", "프라모델", "한정판", "콜렉션"],
        viewCount: 1250,
        likeCount: 89,
        averageRating: 4.7,
        reviewCount: 23,
        creatorId: 100,
        releaseDate: "2024-01-15",
        createdAt: "2024-01-10T10:30:00",
        updatedAt: "2024-01-12T15:20:00",
        category: {
          categoryId: 1,
          categoryName: "프라모델",
          description: "건담, 자동차, 항공기 등의 프라스틱 모델",
          categoryCode: "PM001",
          keywords: ["건담", "프라모델", "조립", "피규어"],
          iconUrl: "https://example.com/icons/plastic-model.svg",
          colorCode: "#FF6B6B",
          sortOrder: 1,
          isActive: true,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        productType: "SALE",
        attachmentFiles: [
          {
            id: 1,
            fileName: "gundam_detail1.jpg",
            originalFileName: "건담_상세이미지1.jpg",
            fileUrl: "https://example.com/files/gundam_detail1.jpg",
            fileSize: 1024000,
            mimeType: "image/jpeg"
          }
        ],
        recentReviews: [
          {
            id: 1,
            creatorId: 201,
            creatorNickname: "건담매니아",
            rating: 5,
            comment: "정말 훌륭한 퀄리티입니다! 디테일이 살아있어요.",
            status: "ACTIVE",
            likeCount: 8,
            reportCount: 0,
            createdAt: "2024-03-15T10:30:00",
            updatedAt: "2024-03-15T10:30:00"
          },
          {
            id: 2,
            creatorId: 202,
            creatorNickname: "프라모러버",
            rating: 4,
            comment: "조립이 조금 복잡하지만 완성도는 최고!",
            status: "ACTIVE",
            likeCount: 5,
            reportCount: 0,
            createdAt: "2024-03-14T16:45:00",
            updatedAt: "2024-03-14T16:45:00"
          }
        ],
        userReaction: {
          hasLike: false,
          hasBookmark: true,
          hasInterest: false,
          hasShare: false,
          hasWish: false
        }
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
          categoryName: "프라모델",
          description: "건담, 자동차, 항공기 등의 프라스틱 모델",
          categoryCode: "PM001",
          keywords: ["건담", "프라모델", "조립", "피규어"],
          iconUrl: "https://example.com/icons/plastic-model.svg",
          colorCode: "#FF6B6B",
          sortOrder: 1,
          isActive: true,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          categoryId: 2,
          categoryName: "피규어",
          description: "애니메이션, 게임 캐릭터 피규어",
          categoryCode: "FG001",
          keywords: ["피규어", "애니메이션", "게임", "캐릭터"],
          iconUrl: "https://example.com/icons/figure.svg",
          colorCode: "#4ECDC4",
          sortOrder: 2,
          isActive: true,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
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

    if (!productData.price || productData.price.trim().length === 0) {
      errors.push('가격은 필수입니다.')
    }

    if (productData.price && isNaN(parseInt(productData.price))) {
      errors.push('올바른 가격을 입력해주세요.')
    }

    if (productData.description && productData.description.length > 2000) {
      errors.push('상품 설명은 2000자 이하여야 합니다.')
    }

    if (productData.tags && productData.tags.length > 10) {
      errors.push('태그는 최대 10개까지 가능합니다.')
    }

    if (!['SALE', 'AUCTION', 'FREE', 'EXCHANGE'].includes(productData.productType)) {
      errors.push('올바른 상품 타입을 선택해주세요.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 리뷰 데이터 검증
   */
  validateReviewData(reviewData) {
    const errors = []

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('평점은 1~5점 사이여야 합니다.')
    }

    if (!reviewData.comment || reviewData.comment.trim().length === 0) {
      errors.push('리뷰 내용은 필수입니다.')
    }

    if (reviewData.comment && reviewData.comment.length > 1000) {
      errors.push('리뷰 내용은 1000자 이하여야 합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 검색 조건 검증 (개선된 버전)
   */
  validateSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') {
      return {}
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']
    const validProductTypes = ['SALE', 'AUCTION', 'FREE', 'EXCHANGE']

    const validated = { ...searchCondition }

    // status 검증
    if (validated.status && !validStatuses.includes(validated.status)) {
      validated.status = 'APPROVED'
    }

    // productType 검증
    if (validated.productType && !validProductTypes.includes(validated.productType)) {
      delete validated.productType // 잘못된 값은 제거
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

    // creatorId 숫자 검증
    if (validated.creatorId && isNaN(parseInt(validated.creatorId))) {
      delete validated.creatorId
    } else if (validated.creatorId) {
      validated.creatorId = parseInt(validated.creatorId)
    }

    // 가격 범위 검증
    if (validated.priceMin && isNaN(parseFloat(validated.priceMin))) {
      delete validated.priceMin
    } else if (validated.priceMin) {
      validated.priceMin = parseFloat(validated.priceMin)
    }

    if (validated.priceMax && isNaN(parseFloat(validated.priceMax))) {
      delete validated.priceMax
    } else if (validated.priceMax) {
      validated.priceMax = parseFloat(validated.priceMax)
    }

    // 평점 범위 검증
    if (validated.minRating) {
      const rating = parseFloat(validated.minRating)
      if (isNaN(rating) || rating < 1 || rating > 5) {
        delete validated.minRating
      } else {
        validated.minRating = rating
      }
    }

    return validated
  }

  /**
   * 페이징 조건 검증 (개선된 버전)
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

  // ==================== 백엔드 응답 변환 ====================

  /**
   * 백엔드 상품 응답을 프론트엔드 형식으로 변환
   */
  transformProductResponse(backendProduct) {
    return {
      id: backendProduct.id,
      name: backendProduct.name,
      brand: backendProduct.brand,
      description: backendProduct.description,
      distributor: backendProduct.distributor,
      price: backendProduct.price,
      feature: backendProduct.feature,
      tags: backendProduct.tags || [],
      status: this.transformProductStatus(backendProduct.status),
      productType: backendProduct.productType,
      thumbnailUrl: this.getThumbnailUrl(backendProduct.attachmentFiles),
      viewCount: backendProduct.viewCount || 0,
      likeCount: backendProduct.likeCount || 0,
      averageRating: backendProduct.averageRating || 0,
      reviewCount: backendProduct.reviewCount || 0,
      creatorId: backendProduct.creatorId,
      releaseDate: backendProduct.releaseDate,
      categoryName: backendProduct.category?.categoryName || '미분류',
      category: this.transformCategoryResponse(backendProduct.category),
      attachmentFiles: backendProduct.attachmentFiles || [],
      recentReviews: this.transformReviewsResponse(backendProduct.recentReviews),
      userReaction: this.transformUserReactionResponse(backendProduct.userReaction),
      createdAt: backendProduct.createdAt,
      updatedAt: backendProduct.updatedAt
    }
  }

  /**
   * 백엔드 리뷰 응답을 프론트엔드 형식으로 변환
   */
  transformReviewResponse(backendReview) {
    return {
      id: backendReview.id,
      productId: backendReview.productId,
      userId: backendReview.creatorId,
      userName: backendReview.creatorNickname || `사용자${backendReview.creatorId}`,
      rating: backendReview.rating,
      comment: backendReview.comment,
      status: backendReview.status,
      likeCount: backendReview.likeCount || 0,
      reportCount: backendReview.reportCount || 0,
      createdAt: backendReview.createdAt,
      updatedAt: backendReview.updatedAt
    }
  }

  /**
   * ProductStatus enum 변환
   */
  transformProductStatus(status) {
    if (typeof status === 'object' && status.title) {
      return {
        title: status.title,
        description: status.description,
        value: status.title // 호환성을 위한 추가 필드
      }
    }
    return typeof status === 'string' ? status : 'PENDING'
  }

  /**
   * 카테고리 응답 변환
   */
  transformCategoryResponse(category) {
    if (!category) return null

    return {
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      description: category.description,
      categoryCode: category.categoryCode,
      keywords: category.keywords || [],
      iconUrl: category.iconUrl,
      colorCode: category.colorCode,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }
  }

  /**
   * 사용자 리액션 응답 변환
   */
  transformUserReactionResponse(userReaction) {
    if (!userReaction) {
      return {
        hasLike: false,
        hasBookmark: false,
        hasInterest: false,
        hasShare: false,
        hasWish: false
      }
    }

    return {
      hasLike: userReaction.hasLike || false,
      hasBookmark: userReaction.hasBookmark || false,
      hasInterest: userReaction.hasInterest || false,
      hasShare: userReaction.hasShare || false,
      hasWish: userReaction.hasWish || false
    }
  }

  /**
   * 리뷰 목록 응답 변환
   */
  transformReviewsResponse(reviews) {
    if (!reviews || !Array.isArray(reviews)) return []

    return reviews.map(review => this.transformReviewResponse(review))
  }

  // ==================== 유틸리티 ====================

  /**
   * 썸네일 URL 생성
   */
  getThumbnailUrl(attachmentFiles) {
    if (!attachmentFiles || attachmentFiles.length === 0) {
      return '/images/product-placeholder.jpg'
    }

    const imageFile = attachmentFiles.find(file =>
        file.mimeType && file.mimeType.startsWith('image/')
    )

    return imageFile ? imageFile.fileUrl : '/images/product-placeholder.jpg'
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

  /**
   * 상품 목록 정렬
   */
  sortProducts(products, sortBy = 'createdAt') {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'likeCount':
          return b.likeCount - a.likeCount
        case 'viewCount':
          return b.viewCount - a.viewCount
        case 'averageRating':
          return b.averageRating - a.averageRating
        case 'name':
          return a.name.localeCompare(b.name, 'ko-KR')
        case 'price':
          return parseInt(a.price) - parseInt(b.price)
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })
  }

  /**
   * 상품 목록 필터링
   */
  filterProducts(products, filters) {
    return products.filter(product => {
      if (filters.category && product.categoryName !== filters.category) {
        return false
      }

      if (filters.brand && product.brand !== filters.brand) {
        return false
      }

      if (filters.productType && product.productType !== filters.productType) {
        return false
      }

      if (filters.priceMin && parseInt(product.price) < filters.priceMin) {
        return false
      }

      if (filters.priceMax && parseInt(product.price) > filters.priceMax) {
        return false
      }

      if (filters.minRating && product.averageRating < filters.minRating) {
        return false
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        return product.name.toLowerCase().includes(keyword) ||
            product.brand.toLowerCase().includes(keyword) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(keyword)))
      }

      return true
    })
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
    console.log('리뷰: 조회, 작성, 수정, 삭제')
    console.log('파일 업로드: 이미지, 첨부파일')
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
      productType: null,
      priceMin: null,
      priceMax: null,
      minRating: null,
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
  },

  /**
   * 상품 타입 옵션 목록 반환
   */
  getProductTypeOptions() {
    return [
      { value: 'SALE', label: '판매', emoji: '💰' },
      { value: 'AUCTION', label: '경매', emoji: '🔨' },
      { value: 'FREE', label: '무료나눔', emoji: '🆓' },
      { value: 'EXCHANGE', label: '교환', emoji: '🔄' }
    ]
  },

  /**
   * 필터 조건 검증
   */
  validateFilters(filters) {
    const validatedFilters = { ...filters }

    // 가격 범위 검증
    if (validatedFilters.priceMin && validatedFilters.priceMax) {
      if (parseInt(validatedFilters.priceMin) > parseInt(validatedFilters.priceMax)) {
        const temp = validatedFilters.priceMin
        validatedFilters.priceMin = validatedFilters.priceMax
        validatedFilters.priceMax = temp
      }
    }

    // 평점 범위 검증
    if (validatedFilters.minRating) {
      validatedFilters.minRating = Math.max(1, Math.min(5, validatedFilters.minRating))
    }

    return validatedFilters
  },

  /**
   * 검색 조건을 URL 쿼리 파라미터로 변환 (null 값 제거)
   */
  toQueryParams(searchCondition, pageable) {
    const params = new URLSearchParams()

    // 검색 조건에서 null 값 제거
    const cleanedSearch = this.removeEmptyParams(searchCondition)
    const cleanedPageable = this.removeEmptyParams(pageable)

    // 검색 조건 추가
    Object.entries(cleanedSearch).forEach(([key, value]) => {
      params.append(key, value.toString())
    })

    // 페이징 조건 추가
    Object.entries(cleanedPageable).forEach(([key, value]) => {
      params.append(key, value.toString())
    })

    return params.toString()
  },

  /**
   * URL 쿼리 파라미터를 검색 조건으로 변환
   */
  fromQueryParams(queryString) {
    const params = new URLSearchParams(queryString)
    const searchCondition = this.getDefaultSearchCondition()
    const pageable = this.getDefaultPageable()

    // 검색 조건 파싱
    for (const [key, value] of params.entries()) {
      if (key in searchCondition) {
        if (key === 'categoryId' || key === 'creatorId') {
          searchCondition[key] = value ? parseInt(value) : null
        } else if (key === 'priceMin' || key === 'priceMax' || key === 'minRating') {
          searchCondition[key] = value ? parseFloat(value) : null
        } else {
          searchCondition[key] = value
        }
      } else if (key in pageable) {
        if (key === 'page' || key === 'size') {
          pageable[key] = parseInt(value)
        } else {
          pageable[key] = value
        }
      }
    }

    return { searchCondition, pageable }
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
  },

  /**
   * 카테고리별 이모지 반환
   */
  getCategoryEmoji(categoryName) {
    const emojiMap = {
      '음료': '🥤',
      '과자/스낵': '🍫',
      '베이커리': '🍞',
      '도시락/간편식': '🍱',
      '아이스크림': '🍦',
      '라면/면류': '🍜',
      '프라모델': '🤖',
      '피규어': '🎭',
      '블록완구': '🧱',
      '완구': '🧸',
      '게임': '🎮',
      '도서': '📚',
      '전자제품': '📱',
      '의류': '👕',
      '액세서리': '💍',
      '뷰티': '💄',
      '스포츠': '⚽',
      '기타': '🎁'
    }
    return emojiMap[categoryName] || '🍽️'
  },

  /**
   * 상품 타입별 배지 텍스트 반환
   */
  getProductTypeBadge(productType) {
    const badgeMap = {
      'SALE': '💰 거래가능',
      'AUCTION': '🔨 경매',
      'FREE': '🆓 무료나눔',
      'EXCHANGE': '🔄 교환'
    }
    return badgeMap[productType] || '❌ 정보만'
  },

  /**
   * 랜덤 거리 생성 (데모용)
   */
  getRandomDistance() {
    const distances = ['100m', '200m', '300m', '500m', '750m', '900m', '1.2km', '1.5km']
    return distances[Math.floor(Math.random() * distances.length)] + ' 이내'
  },

  /**
   * 상품 상태 텍스트 반환
   */
  getStatusText(status) {
    const statusMap = {
      'PENDING': '검토중',
      'APPROVED': '승인됨',
      'REJECTED': '반려됨',
      'DELETED': '삭제됨'
    }
    return statusMap[status] || '알 수 없음'
  },

  /**
   * 썸네일 URL 생성
   */
  getThumbnailUrl(attachmentFiles, defaultUrl = '/images/product-placeholder.jpg') {
    if (!attachmentFiles || attachmentFiles.length === 0) {
      return defaultUrl
    }

    const imageFile = attachmentFiles.find(file =>
        file.mimeType && file.mimeType.startsWith('image/')
    )

    return imageFile ? imageFile.fileUrl : defaultUrl
  },

  /**
   * 태그 배열을 문자열로 변환
   */
  formatTags(tags) {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return ''
    return tags.map(tag => `#${tag}`).join(' ')
  },

  /**
   * 상품 URL 생성
   */
  getProductUrl(productId) {
    return `/products/${productId}`
  },

  /**
   * 상품 공유 URL 생성
   */
  getShareUrl(productId) {
    return `${window.location.origin}/products/${productId}`
  },

  /**
   * 이미지 에러 처리
   */
  handleImageError(event, fallbackUrl = '/images/product-placeholder.jpg') {
    event.target.src = fallbackUrl
    event.target.onerror = null // 무한 루프 방지
  },

  /**
   * 상품 검색 키워드 하이라이트
   */
  highlightSearchKeyword(text, keyword) {
    if (!keyword || !text) return text

    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }
}

// ==================== Vue Composables ====================

/**
 * Vue Composition API용 상품 훅
 */
export function useProduct() {
  const productService = new ProductService()

  const getProducts = async (searchCondition = {}, pageable = {}) => {
    try {
      const response = await productService.getProducts(searchCondition, pageable)
      return {
        success: true,
        data: response.data || [],
        message: response.message
      }
    } catch (error) {
      console.error('[PRODUCT] 상품 목록 조회 실패:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  const createProduct = async (productData) => {
    try {
      const response = await productService.createProduct(productData)
      return {
        success: true,
        data: response.data,
        message: response.message || '상품이 등록되었습니다'
      }
    } catch (error) {
      console.error('[PRODUCT] 상품 등록 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const likeProduct = async (productId) => {
    try {
      const response = await productService.likeProduct(productId)
      return {
        success: true,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('[PRODUCT] 상품 좋아요 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const uploadImage = async (productId, imageFile, options = {}) => {
    try {
      const response = await productService.uploadProductImage(productId, imageFile, options)
      return {
        success: true,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('[PRODUCT] 이미지 업로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  return {
    // 상품 관리
    getProducts,
    createProduct,
    getProduct: (productId) => productService.getProduct(productId),
    updateProduct: (productId, productData) => productService.updateProduct(productId, productData),
    deleteProduct: (productId) => productService.deleteProduct(productId),

    // 리액션
    likeProduct,
    bookmarkProduct: (productId) => productService.bookmarkProduct(productId),
    interestProduct: (productId) => productService.interestProduct(productId),
    shareProduct: (productId) => productService.shareProduct(productId),
    wishProduct: (productId) => productService.wishProduct(productId),

    // 리뷰
    getReviews: (productId, pageable) => productService.getProductReviews(productId, pageable),
    createReview: (productId, reviewData) => productService.createProductReview(productId, reviewData),

    // 파일 업로드
    uploadImage,
    uploadFile: (productId, file, options) => productService.uploadProductFile(productId, file, options),

    // 카테고리
    getCategories: () => productService.getCategories(),

    // 검색
    searchProducts: (keyword, filters, pageable) => productService.searchProducts(keyword, filters, pageable),
    getPopularProducts: (params) => productService.getPopularProducts(params),
    getRecommendedProducts: (params) => productService.getRecommendedProducts(params),

    // 유틸리티
    transformProduct: (product) => productService.transformProductResponse(product),
    formatPrice: (price) => productService.formatPrice(price),
    sortProducts: (products, sortBy) => productService.sortProducts(products, sortBy),
    filterProducts: (products, filters) => productService.filterProducts(products, filters),

    // 연결 테스트
    testConnection: () => productService.testConnection(),

    // 디버깅
    debugStatus: () => productService.debugProductStatus()
  }
}

// ==================== 싱글톤 인스턴스 ====================

// 싱글톤 인스턴스 생성 및 내보내기
export const productService = new ProductService()

// 별칭 (기존 코드 호환성)
export const productApi = productService

// 기본 내보내기
export default productService