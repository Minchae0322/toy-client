// services/productService.js
// 상품 서비스 전용 API 클래스

import * as authUtils from '@/utils/auth.js'

/**
 * 상품 서비스 전용 API 클래스
 * Content Server와의 통신을 담당
 * 상품 CRUD, 검색, 리뷰 등의 기능 제공
 */
class ProductService {
  constructor() {
    // Content Server URL 설정
    if (import.meta.env.DEV) {
      this.baseURL = import.meta.env.VITE_CONTENT_BASE_URL || 'http://localhost:8080'
    } else {
      this.baseURL = import.meta.env.VITE_CONTENT_BASE_URL || 'https://your-content-server.com'
    }

    // 상품 API 엔드포인트
    this.productEndpoint = `${this.baseURL}/api/products`

    console.log('📦 [ProductService] 초기화됨')
    console.log('Content API URL:', this.baseURL)
    console.log('Product Endpoint:', this.productEndpoint)
  }

  // ==================== 공통 유틸리티 ====================

  /**
   * API 요청용 헤더 생성
   */
  getHeaders() {
    return authUtils.getApiHeaders()
  }

  /**
   * API 응답 처리
   */
  async handleResponse(response) {
    if (!response.ok) {
      let errorData = {}
      try {
        errorData = await response.json()
      } catch (parseError) {
        console.warn('에러 응답 파싱 실패:', parseError)
      }

      const errorMessage = errorData.message ||
          errorData.error ||
          `HTTP ${response.status} ${response.statusText}`

      const error = new Error(errorMessage)
      error.status = response.status
      error.data = errorData
      throw error
    }
    return response.json()
  }

  /**
   * 요청 로깅
   */
  logRequest(method, url, data = null) {
    console.log(`🌐 [ProductService] [${method}] ${url}`, data || '')
  }

  /**
   * 응답 로깅
   */
  logResponse(method, url, response, error = null) {
    if (error) {
      console.error(`❌ [ProductService] [${method}] ${url} 실패:`, error.message)
    } else {
      console.log(`✅ [ProductService] [${method}] ${url} 성공`)
    }
  }

  // ==================== 상품 CRUD API ====================

  /**
   * 상품 등록
   */
  async createProduct(productData, userId) {
    const url = this.productEndpoint

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

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || '상품이 성공적으로 등록되었습니다'
      }

    } catch (error) {
      this.logResponse('POST', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 상품 단건 조회
   */
  async getProduct(productId, userId = null) {
    const url = `${this.productEndpoint}/${productId}`
    this.logRequest('GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 상품 목록 조회 (검색 및 페이징)
   */
  async getProducts(searchCondition = {}, pageable = {}) {
    const url = this.productEndpoint
    this.logRequest('GET', url, { searchCondition, pageable })

    try {
      const queryParams = new URLSearchParams()

      // 검색 조건
      if (searchCondition.keyword) queryParams.append('keyword', searchCondition.keyword)
      if (searchCondition.categoryId) queryParams.append('categoryId', searchCondition.categoryId.toString())
      if (searchCondition.brand) queryParams.append('brand', searchCondition.brand)
      if (searchCondition.status) queryParams.append('status', searchCondition.status)
      if (searchCondition.productType) queryParams.append('productType', searchCondition.productType)

      // 페이징 조건
      if (pageable.page !== undefined) queryParams.append('page', pageable.page.toString())
      if (pageable.size !== undefined) queryParams.append('size', pageable.size.toString())
      if (pageable.sort) {
        // sort 배열이나 문자열 처리
        const sortParams = Array.isArray(pageable.sort) ? pageable.sort : [pageable.sort]
        sortParams.forEach(sort => queryParams.append('sort', sort))
      }

      const requestUrl = `${url}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 상품 수정
   */
  async updateProduct(productId, productData) {
    const url = `${this.productEndpoint}/${productId}`

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

    this.logRequest('PUT', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('PUT', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || '상품이 성공적으로 수정되었습니다'
      }

    } catch (error) {
      this.logResponse('PUT', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 상품 삭제
   */
  async deleteProduct(productId) {
    const url = `${this.productEndpoint}/${productId}`
    this.logRequest('DELETE', url)

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      })

      // 204 No Content의 경우 JSON 파싱하지 않음
      if (response.status === 204) {
        this.logResponse('DELETE', url, { success: true })
        return {
          success: true,
          message: '상품이 성공적으로 삭제되었습니다'
        }
      }

      const apiResponse = await this.handleResponse(response)
      this.logResponse('DELETE', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || null,
        message: apiResponse.message || '상품이 성공적으로 삭제되었습니다'
      }

    } catch (error) {
      this.logResponse('DELETE', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  // ==================== 상품 리액션 API ====================

  /**
   * 상품 좋아요/찜하기 토글
   */
  async toggleProductReaction(productId, reactionType) {
    const url = `${this.productEndpoint}/${productId}/reactions/${reactionType}`
    this.logRequest('POST', url)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          deviceId: authUtils.getDeviceId()
        })
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('POST', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 상품 좋아요
   */
  async likeProduct(productId) {
    return this.toggleProductReaction(productId, 'like')
  }

  /**
   * 상품 북마크
   */
  async bookmarkProduct(productId) {
    return this.toggleProductReaction(productId, 'bookmark')
  }

  /**
   * 상품 관심상품 등록
   */
  async interestProduct(productId) {
    return this.toggleProductReaction(productId, 'interest')
  }

  // ==================== 상품 리뷰 API ====================

  /**
   * 상품 리뷰 목록 조회
   */
  async getProductReviews(productId, pageable = {}) {
    const url = `${this.productEndpoint}/${productId}/reviews`
    this.logRequest('GET', url, pageable)

    try {
      const queryParams = new URLSearchParams()

      if (pageable.page !== undefined) queryParams.append('page', pageable.page.toString())
      if (pageable.size !== undefined) queryParams.append('size', pageable.size.toString())
      if (pageable.sort) queryParams.append('sort', pageable.sort)

      const requestUrl = `${url}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || [],
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  /**
   * 상품 리뷰 작성
   */
  async createProductReview(productId, reviewData) {
    const url = `${this.productEndpoint}/${productId}/reviews`

    const requestData = {
      rating: reviewData.rating,
      comment: reviewData.comment,
      deviceId: authUtils.getDeviceId()
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || '리뷰가 성공적으로 작성되었습니다'
      }

    } catch (error) {
      this.logResponse('POST', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
  }

  // ==================== 카테고리 API ====================

  /**
   * 카테고리 목록 조회
   */
  async getCategories() {
    const url = `${this.baseURL}/api/categories`
    this.logRequest('GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || [],
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)
      if (error.status === 401) {
        error.needsTokenRefresh = true
      }
      throw error
    }
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
          },
          {
            id: 3,
            name: "레고 크리에이터 자동차",
            brand: "레고",
            status: "APPROVED",
            price: "89000",
            viewCount: 2340,
            likeCount: 78,
            averageRating: 4.5,
            reviewCount: 12,
            categoryName: "블록완구",
            productType: "SALE",
            thumbnailUrl: "https://example.com/images/lego1.jpg",
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
        last: true,
        numberOfElements: 3
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
        status: "APPROVED",
        description: "마스터 그레이드 건담 RX-78-2 Ver.Ka는 katoki hajime의 리파인 디자인으로 제작된 프라모델입니다.",
        distributor: "반다이코리아, 인터넷 쇼핑몰",
        price: "45000",
        feature: "리미티드 에디션, 특별 컬러링, 디오라마 베이스 포함",
        tags: ["건담", "프라모델", "한정판", "콜렉션", "마스터그레이드"],
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
          isActive: true
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
          hasWish: true
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
          isActive: true
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
          isActive: true
        },
        {
          categoryId: 3,
          categoryName: "블록완구",
          description: "레고, 조립형 블록 완구",
          categoryCode: "BL001",
          keywords: ["레고", "블록", "조립", "창의"],
          iconUrl: "https://example.com/icons/blocks.svg",
          colorCode: "#45B7D1",
          sortOrder: 3,
          isActive: true
        }
      ]
    }
  }

  // ==================== 연결 테스트 ====================

  /**
   * Content Server 연결 테스트
   */
  async testConnection() {
    const testEndpoints = [
      `${this.baseURL.replace('/api', '')}/actuator/health`,
      `${this.baseURL}/health`,
      `${this.productEndpoint}` // 실제 API 테스트
    ]

    console.log('🔍 [ProductService] Content Server 연결 테스트...')

    for (const url of testEndpoints) {
      try {
        console.log(`🌐 [ProductService] 테스트 중: ${url}`)

        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          mode: 'cors',
          credentials: 'include'
        })

        console.log(`📡 [ProductService] 응답 상태: ${response.status}`)

        // 200 OK 또는 401 (인증 필요)도 서버 연결 성공으로 간주
        if (response.ok || response.status === 401) {
          console.log(`✅ [ProductService] Content Server 연결 성공: ${url}`)
          return true
        }
      } catch (error) {
        console.warn(`❌ [ProductService] ${url} 연결 실패:`, error.message)
      }
    }

    console.log('❌ [ProductService] 모든 엔드포인트 연결 실패')
    return false
  }

  // ==================== 디버깅 ====================

  /**
   * Product Service 상태 디버깅
   */
  debugStatus() {
    console.group('🔍 [ProductService] 상태 디버깅')

    console.log('=== 서버 정보 ===')
    console.log('Base URL:', this.baseURL)
    console.log('Product Endpoint:', this.productEndpoint)
    console.log('환경:', import.meta.env.MODE)

    console.log('=== 인증 정보 ===')
    console.log('Access Token 존재:', !!authUtils.getAccessToken())
    console.log('사용자 ID:', authUtils.getUserId())
    console.log('디바이스 ID:', authUtils.getDeviceId())
    console.log('인증 상태:', authUtils.isAuthenticated())

    console.log('=== API 기능 ===')
    console.log('지원 기능: CRUD, 검색, 페이징, 리액션, 리뷰')
    console.log('정렬 옵션: releaseDate, createdAt, likeCount, viewCount, name')
    console.log('리액션 타입: like, bookmark, interest')

    console.groupEnd()
  }
}

// ==================== 상품 유틸리티 ====================

/**
 * 상품 관련 유틸리티 함수들
 */
export const productUtils = {
  /**
   * 상품 상태 한국어 변환
   */
  getStatusText(status) {
    const statusMap = {
      'PENDING': '대기중',
      'APPROVED': '승인됨',
      'REJECTED': '거부됨',
      'DELETED': '삭제됨'
    }
    return statusMap[status] || status
  },

  /**
   * 상품 타입 한국어 변환
   */
  getProductTypeText(productType) {
    const typeMap = {
      'SALE': '판매',
      'AUCTION': '경매',
      'FREE': '무료나눔',
      'EXCHANGE': '교환'
    }
    return typeMap[productType] || productType
  },

  /**
   * 가격 포맷팅
   */
  formatPrice(price) {
    if (!price) return '가격 정보 없음'
    if (price === '0' || price === 0) return '무료'

    const numPrice = typeof price === 'string' ? parseInt(price) : price
    return new Intl.NumberFormat('ko-KR').format(numPrice) + '원'
  },

  /**
   * 날짜 포맷팅
   */
  formatDate(dateString) {
    if (!dateString) return '-'

    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  /**
   * 상대적 시간 표시
   */
  getRelativeTime(dateString) {
    if (!dateString) return '-'

    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now - date
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInDays < 7) return `${diffInDays}일 전`

    return this.formatDate(dateString)
  },

  /**
   * 평점 표시
   */
  formatRating(rating) {
    if (rating === null || rating === undefined) return '평점 없음'
    return `⭐ ${rating.toFixed(1)}`
  },

  /**
   * 수량 포맷팅 (K, M 단위)
   */
  formatCount(count) {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  },

  /**
   * 검색 조건 검증
   */
  validateSearchCondition(condition) {
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']
    const validProductTypes = ['SALE', 'AUCTION', 'FREE', 'EXCHANGE']

    if (condition.status && !validStatuses.includes(condition.status)) {
      condition.status = 'APPROVED'
    }

    if (condition.productType && !validProductTypes.includes(condition.productType)) {
      condition.productType = null
    }

    if (condition.keyword && condition.keyword.length > 100) {
      condition.keyword = condition.keyword.substring(0, 100)
    }

    return condition
  },

  /**
   * 정렬 옵션 검증
   */
  validateSortOption(sort) {
    const validSorts = [
      'releaseDate,DESC', 'releaseDate,ASC',
      'createdAt,DESC', 'createdAt,ASC',
      'likeCount,DESC', 'likeCount,ASC',
      'viewCount,DESC', 'viewCount,ASC',
      'name,DESC', 'name,ASC',
      'updatedAt,DESC', 'updatedAt,ASC'
    ]

    if (!validSorts.includes(sort)) {
      return 'createdAt,DESC' // 기본값
    }

    return sort
  },

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
  },

  /**
   * 상품 리뷰 데이터 검증
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
  },

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

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  },

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
  }
}

// ==================== 검색 필터 유틸리티 ====================

/**
 * 상품 검색 필터 관리 유틸리티
 */
export const productFilterUtils = {
  /**
   * 기본 검색 조건
   */
  getDefaultSearchCondition() {
    return {
      keyword: '',
      categoryId: null,
      brand: '',
      status: 'APPROVED',
      productType: null
    }
  },

  /**
   * 기본 페이징 조건
   */
  getDefaultPageable() {
    return {
      page: 0,
      size: 20,
      sort: 'createdAt,DESC'
    }
  },

  /**
   * URL 쿼리 파라미터를 검색 조건으로 변환
   */
  parseUrlParams(urlSearchParams) {
    const condition = this.getDefaultSearchCondition()
    const pageable = this.getDefaultPageable()

    // 검색 조건
    if (urlSearchParams.get('keyword')) {
      condition.keyword = urlSearchParams.get('keyword')
    }
    if (urlSearchParams.get('categoryId')) {
      condition.categoryId = parseInt(urlSearchParams.get('categoryId'))
    }
    if (urlSearchParams.get('brand')) {
      condition.brand = urlSearchParams.get('brand')
    }
    if (urlSearchParams.get('productType')) {
      condition.productType = urlSearchParams.get('productType')
    }

    // 페이징 조건
    if (urlSearchParams.get('page')) {
      pageable.page = parseInt(urlSearchParams.get('page'))
    }
    if (urlSearchParams.get('size')) {
      pageable.size = parseInt(urlSearchParams.get('size'))
    }
    if (urlSearchParams.get('sort')) {
      pageable.sort = urlSearchParams.get('sort')
    }

    return { condition, pageable }
  },

  /**
   * 검색 조건을 URL 쿼리 파라미터로 변환
   */
  toUrlParams(condition, pageable) {
    const params = new URLSearchParams()

    // 검색 조건
    if (condition.keyword) params.set('keyword', condition.keyword)
    if (condition.categoryId) params.set('categoryId', condition.categoryId.toString())
    if (condition.brand) params.set('brand', condition.brand)
    if (condition.productType) params.set('productType', condition.productType)

    // 페이징 조건
    if (pageable.page > 0) params.set('page', pageable.page.toString())
    if (pageable.size !== 20) params.set('size', pageable.size.toString())
    if (pageable.sort !== 'createdAt,DESC') params.set('sort', pageable.sort)

    return params.toString()
  },

  /**
   * 정렬 옵션 목록
   */
  getSortOptions() {
    return [
      { value: 'createdAt,DESC', label: '최신 등록순' },
      { value: 'likeCount,DESC', label: '인기순 (찜하기)' },
      { value: 'viewCount,DESC', label: '조회수 높은순' },
      { value: 'releaseDate,DESC', label: '최신 출시순' },
      { value: 'releaseDate,ASC', label: '오래된 출시순' },
      { value: 'name,ASC', label: '이름 오름차순' },
      { value: 'name,DESC', label: '이름 내림차순' }
    ]
  },

  /**
   * 상품 타입 옵션 목록
   */
  getProductTypeOptions() {
    return [
      { value: '', label: '전체' },
      { value: 'SALE', label: '판매' },
      { value: 'AUCTION', label: '경매' },
      { value: 'FREE', label: '무료나눔' },
      { value: 'EXCHANGE', label: '교환' }
    ]
  }
}

// ==================== 상품 캐시 유틸리티 ====================

/**
 * 상품 데이터 캐싱 유틸리티 (로컬 스토리지 활용)
 */
export const productCacheUtils = {
  CACHE_PREFIX: 'product_cache_',
  CACHE_DURATION: 5 * 60 * 1000, // 5분

  /**
   * 캐시 키 생성
   */
  getCacheKey(type, params = '') {
    return `${this.CACHE_PREFIX}${type}_${params}`
  },

  /**
   * 캐시 데이터 저장
   */
  setCache(key, data) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('[ProductCache] 캐시 저장 실패:', error)
    }
  },

  /**
   * 캐시 데이터 조회
   */
  getCache(key) {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const cacheData = JSON.parse(cached)

      // 만료 확인
      if (Date.now() > cacheData.expires) {
        localStorage.removeItem(key)
        return null
      }

      return cacheData.data
    } catch (error) {
      console.warn('[ProductCache] 캐시 조회 실패:', error)
      return null
    }
  },

  /**
   * 캐시 삭제
   */
  removeCache(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('[ProductCache] 캐시 삭제 실패:', error)
    }
  },

  /**
   * 전체 상품 캐시 삭제
   */
  clearProductCache() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('[ProductCache] 전체 캐시 삭제 실패:', error)
    }
  }
}

// ==================== 내보내기 ====================

// 싱글톤 인스턴스 생성
export const productService = new ProductService()

// 별칭 (기존 코드 호환성)
export const productApi = productService

// 기본 내보내기
export default productService