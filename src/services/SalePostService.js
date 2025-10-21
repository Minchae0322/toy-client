// services/SalePostService.js
// 한입만 컨텐츠 관련 API 서비스 (Fetch API 기반)

import { BaseApiService } from './BaseApiService.js'

/**
 * 한입만 컨텐츠 서비스
 * Content Server (8082)와의 통신을 담당
 */
class SalePostService extends BaseApiService {
  constructor() {
    const baseURL = import.meta.env.DEV
        ? 'http://localhost:8082/api'
        : `${import.meta.env.VITE_CONTENT_BASE_URL}/api`

    super(baseURL, 'CONTENT')
  }

  // ==================== 한입만 게시물 API ====================

  /**
   * 한입만 게시물 목록 조회 (페이징)
   * GET /api/one-mouths
   */
  async getOneMouths(params = {}) {
    const queryParams = {
      page: params.page ?? 0,
      size: params.size ?? 10,
      sort: params.sort || 'createdAt,DESC'
    }

    // 검색 조건 추가
    if (params.oneMouthStatus) {
      queryParams.oneMouthStatus = params.oneMouthStatus
    }
    if (params.categoryId) {
      queryParams.categoryId = params.categoryId
    }
    if (params.tradeLocation) {
      queryParams.tradeLocation = params.tradeLocation
    }
    if (params.minPrice !== null && params.minPrice !== undefined) {
      queryParams.minPrice = params.minPrice
    }
    if (params.maxPrice !== null && params.maxPrice !== undefined) {
      queryParams.maxPrice = params.maxPrice
    }
    if (params.keyword) {
      queryParams.keyword = params.keyword
    }

    return await this.get('/one-mouths', queryParams)
  }

  /**
   * 한입만 게시물 상세 조회
   * GET /api/one-mouths/{id}
   */
  async getOneMouthDetail(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.get(`/one-mouths/${id}`)
  }

  /**
   * 한입만 게시물 생성
   * POST /api/one-mouths
   */
  async createOneMouth(data) {
    const validation = this.validateOneMouthData(data)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    return await this.post('/one-mouths', data)
  }

  /**
   * 한입만 게시물 임시저장
   * POST /api/one-mouths/draft
   */
  async createOneMouthDraft(data) {
    return await this.post('/one-mouths/draft', data)
  }

  /**
   * 한입만 게시물 수정
   * PUT /api/one-mouths/{id}
   */
  async updateOneMouth(id, data) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    const validation = this.validateOneMouthData(data, false)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    return await this.put(`/one-mouths/${id}`, data)
  }

  /**
   * 한입만 게시물 삭제
   * DELETE /api/one-mouths/{id}
   */
  async deleteOneMouth(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.delete(`/one-mouths/${id}`)
  }

  /**
   * 한입만 게시물 상태 변경 (판매중/예약중/판매완료)
   * PATCH /api/one-mouths/{id}/status
   */
  async updateOneMouthStatus(id, status) {
    const validStatuses = ['ON_SALE', 'RESERVED', 'SOLD_OUT']

    if (!validStatuses.includes(status)) {
      throw new Error('올바른 상태값을 입력해주세요. (ON_SALE, RESERVED, SOLD_OUT)')
    }

    return await this.patch(`/one-mouths/${id}/status`, { status })
  }

  // ==================== 관심 상품 API ====================

  /**
   * 관심 상품 추가/제거 토글
   * POST /api/one-mouths/{id}/favorite
   */
  async toggleOneMouthFavorite(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.post(`/one-mouths/${id}/favorite`)
  }

  /**
   * 관심 상품 제거
   * DELETE /api/one-mouths/{id}/favorite
   */
  async removeOneMouthFavorite(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.delete(`/one-mouths/${id}/favorite`)
  }

  /**
   * 사용자 관심 상품 목록 조회
   * GET /api/one-mouths/favorites
   */
  async getUserFavorites(params = {}) {
    const queryParams = {
      page: params.page ?? 0,
      size: params.size ?? 10,
      sort: params.sort || 'createdAt,DESC'
    }

    return await this.get('/one-mouths/favorites', queryParams)
  }

  // ==================== 조회수 API ====================

  /**
   * 조회수 증가
   * POST /api/one-mouths/{id}/view
   */
  async incrementViewCount(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.post(`/one-mouths/${id}/view`)
  }

  // ==================== 이미지 관리 API ====================

  /**
   * 이미지 업로드 (다중)
   * POST /api/one-mouths/images
   */
  async uploadImages(files, options = {}) {
    if (!files || files.length === 0) {
      throw new Error('업로드할 이미지가 필요합니다.')
    }

    const formData = new FormData()

    // 여러 파일 추가
    Array.from(files).forEach((file) => {
      formData.append('images', file)
    })

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    return await this.uploadFile('/one-mouths/images', formData)
  }

  /**
   * 단일 이미지 업로드
   * POST /api/one-mouths/image
   */
  async uploadSingleImage(file, options = {}) {
    if (!file) {
      throw new Error('업로드할 이미지가 필요합니다.')
    }

    const formData = new FormData()
    formData.append('image', file)

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    return await this.uploadFile('/one-mouths/image', formData)
  }

  /**
   * 이미지 삭제
   * DELETE /api/one-mouths/images
   */
  async deleteImage(imageUrl) {
    if (!imageUrl) {
      throw new Error('이미지 URL이 필요합니다.')
    }

    return await this.delete('/one-mouths/images', {
      body: JSON.stringify({ imageUrl })
    })
  }

  // ==================== 댓글 API ====================

  /**
   * 댓글 목록 조회
   * GET /api/one-mouths/{id}/comments
   */
  async getComments(id, params = {}) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    const queryParams = {
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort || 'createdAt,DESC'
    }

    return await this.get(`/one-mouths/${id}/comments`, queryParams)
  }

  /**
   * 댓글 작성
   * POST /api/one-mouths/{id}/comments
   */
  async createComment(id, content, parentId = null) {
    if (!id || !content) {
      throw new Error('게시물 ID와 댓글 내용이 필요합니다.')
    }

    const requestData = {
      content: content.trim(),
      parentId
    }

    return await this.post(`/one-mouths/${id}/comments`, requestData)
  }

  /**
   * 댓글 수정
   * PUT /api/comments/{commentId}
   */
  async updateComment(commentId, content) {
    if (!commentId || !content) {
      throw new Error('댓글 ID와 내용이 필요합니다.')
    }

    return await this.put(`/comments/${commentId}`, {
      content: content.trim()
    })
  }

  /**
   * 댓글 삭제
   * DELETE /api/comments/{commentId}
   */
  async deleteComment(commentId) {
    if (!commentId) {
      throw new Error('댓글 ID가 필요합니다.')
    }

    return await this.delete(`/comments/${commentId}`)
  }

  // ==================== 신고 API ====================

  /**
   * 게시물 신고
   * POST /api/one-mouths/{id}/report
   */
  async reportOneMouth(id, reason, description = '') {
    if (!id || !reason) {
      throw new Error('게시물 ID와 신고 사유가 필요합니다.')
    }

    const requestData = {
      reason,
      description: description.trim()
    }

    return await this.post(`/one-mouths/${id}/report`, requestData)
  }

  /**
   * 댓글 신고
   * POST /api/comments/{commentId}/report
   */
  async reportComment(commentId, reason, description = '') {
    if (!commentId || !reason) {
      throw new Error('댓글 ID와 신고 사유가 필요합니다.')
    }

    const requestData = {
      reason,
      description: description.trim()
    }

    return await this.post(`/comments/${commentId}/report`, requestData)
  }

  // ==================== 카테고리 API ====================

  /**
   * 카테고리 목록 조회 (페이징)
   * GET /api/categories
   */
  async getCategoriesPages(pageable = {}, condition = {}) {
    const params = {
      page: pageable.page ?? 0,
      size: pageable.size ?? 20,
      sort: pageable.sort || 'sortOrder,ASC',
      ...condition
    }

    return await this.get('/categories', params)
  }

  /**
   * 전체 카테고리 목록 조회
   * GET /api/categories/list
   */
  async getCategories(condition = {}) {
    return await this.get('/categories/list', condition)
  }

  /**
   * 카테고리 상세 조회
   * GET /api/categories/{categoryId}
   */
  async getCategoryDetail(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    return await this.get(`/categories/${categoryId}`)
  }

  /**
   * 카테고리 생성 (관리자 전용)
   * POST /api/categories
   */
  async createCategory(data) {
    const validation = this.validateCategoryData(data)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    return await this.post('/categories', data)
  }

  /**
   * 카테고리 수정 (관리자 전용)
   * PUT /api/categories/{categoryId}
   */
  async updateCategory(categoryId, data) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    const validation = this.validateCategoryData(data, false)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    return await this.put(`/categories/${categoryId}`, data)
  }

  /**
   * 카테고리 삭제 (관리자 전용)
   * DELETE /api/categories/{categoryId}
   */
  async deleteCategory(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    return await this.delete(`/categories/${categoryId}`)
  }

  // ==================== 통계 API ====================

  /**
   * 게시물 통계 조회
   * GET /api/one-mouths/{id}/stats
   */
  async getOneMouthStats(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.get(`/one-mouths/${id}/stats`)
  }

  /**
   * 사용자 판매 통계 조회
   * GET /api/one-mouths/my-stats 또는 /api/one-mouths/users/{userId}/stats
   */
  async getUserSalesStats(userId = null) {
    const url = userId
        ? `/one-mouths/users/${userId}/stats`
        : '/one-mouths/my-stats'

    return await this.get(url)
  }

  // ==================== 유틸리티 메서드 ====================

  /**
   * 한입만 게시물 데이터 검증
   */
  validateOneMouthData(data, isCreate = true) {
    const errors = []

    // 제목 검증
    if (isCreate || data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push('제목은 필수입니다.')
      } else if (data.title.length > 500) {
        errors.push('제목은 500자 이하여야 합니다.')
      }
    }

    // 설명 검증
    if (isCreate || data.description !== undefined) {
      if (data.description && data.description.length > 1000) {
        errors.push('설명은 1000자 이하여야 합니다.')
      }
    }

    // 판매 타입에 따른 옵션 검증
    if (isCreate && data.saleType) {
      switch (data.saleType) {
        case 'ONEMOUTH':
          if (!data.biteSizeOption) {
            errors.push('한입 판매 옵션이 필요합니다.')
          } else {
            if (!data.biteSizeOption.unitPrice || data.biteSizeOption.unitPrice <= 0) {
              errors.push('단위 가격은 필수이며 0보다 커야 합니다.')
            }
            if (!data.biteSizeOption.unitQuantity || data.biteSizeOption.unitQuantity <= 0) {
              errors.push('단위 수량은 필수이며 0보다 커야 합니다.')
            }
            if (!data.biteSizeOption.totalBiteCount || data.biteSizeOption.totalBiteCount <= 0) {
              errors.push('총 한입 개수는 필수이며 0보다 커야 합니다.')
            }
          }
          break

        case 'NORMAL':
          if (!data.normalSaleOptions || data.normalSaleOptions.length === 0) {
            errors.push('일반 판매 옵션이 필요합니다.')
          } else {
            data.normalSaleOptions.forEach((opt, idx) => {
              if (!opt.optionName || opt.optionName.trim().length === 0) {
                errors.push(`옵션 ${idx + 1}의 이름은 필수입니다.`)
              }
              if (!opt.price || opt.price <= 0) {
                errors.push(`옵션 ${idx + 1}의 가격은 필수이며 0보다 커야 합니다.`)
              }
              if (!opt.totalStock || opt.totalStock <= 0) {
                errors.push(`옵션 ${idx + 1}의 재고는 필수이며 0보다 커야 합니다.`)
              }
            })
          }
          break

        case 'GROUP_BUY':
          if (!data.groupBuyOption) {
            errors.push('공동구매 옵션이 필요합니다.')
          } else {
            if (!data.groupBuyOption.targetCount || data.groupBuyOption.targetCount <= 0) {
              errors.push('목표 인원은 필수이며 0보다 커야 합니다.')
            }
            if (!data.groupBuyOption.discountedPrice || data.groupBuyOption.discountedPrice <= 0) {
              errors.push('할인 가격은 필수이며 0보다 커야 합니다.')
            }
            if (!data.groupBuyOption.deadline) {
              errors.push('마감일은 필수입니다.')
            }
          }
          break

        case 'PROXY':
          if (!data.proxyBuyOption) {
            errors.push('대리구매 옵션이 필요합니다.')
          } else {
            if (!data.proxyBuyOption.estimatedProductPrice || data.proxyBuyOption.estimatedProductPrice <= 0) {
              errors.push('예상 상품 가격은 필수이며 0보다 커야 합니다.')
            }
            if (!data.proxyBuyOption.serviceFee || data.proxyBuyOption.serviceFee < 0) {
              errors.push('대행 수수료는 필수이며 0 이상이어야 합니다.')
            }
            if (!data.proxyBuyOption.purchaseLocation || data.proxyBuyOption.purchaseLocation.trim().length === 0) {
              errors.push('구매 장소는 필수입니다.')
            }
            if (!data.proxyBuyOption.maxQuantity || data.proxyBuyOption.maxQuantity <= 0) {
              errors.push('최대 수량은 필수이며 0보다 커야 합니다.')
            }
          }
          break

        default:
          errors.push('올바른 판매 타입을 선택해주세요.')
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 카테고리 데이터 검증
   */
  validateCategoryData(data, isCreate = true) {
    const errors = []

    if (isCreate || data.categoryName !== undefined) {
      if (!data.categoryName || data.categoryName.trim().length === 0) {
        errors.push('카테고리 이름은 필수입니다.')
      } else if (data.categoryName.length > 50) {
        errors.push('카테고리 이름은 50자 이하여야 합니다.')
      }
    }

    if (data.description && data.description.length > 200) {
      errors.push('카테고리 설명은 200자 이하여야 합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 가격 포맷팅
   */
  formatPrice(price) {
    if (typeof price !== 'number' || price < 0) {
      return '0원'
    }

    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }

  /**
   * 상대적 시간 계산
   */
  getRelativeTime(timestamp) {
    const now = new Date()
    const target = new Date(timestamp)
    const diffMs = now - target
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`

    return target.toLocaleDateString('ko-KR')
  }

  /**
   * 이미지 URL 검증
   */
  isValidImageUrl(url) {
    if (!url || typeof url !== 'string') {
      return false
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const urlLower = url.toLowerCase()

    return imageExtensions.some(ext => urlLower.includes(ext)) ||
        url.startsWith('data:image/') ||
        url.includes('/api/') // API 이미지 경로
  }

  // ==================== 디버깅 ====================

  /**
   * OneMouth Service 상태 디버깅
   */
  debugOneMouthStatus() {
    console.group('🔍 [CONTENT] 한입만 서비스 상태')

    console.log('=== API 엔드포인트 ===')
    console.log('GET    /api/one-mouths - 목록 조회')
    console.log('GET    /api/one-mouths/{id} - 상세 조회')
    console.log('POST   /api/one-mouths - 게시물 생성')
    console.log('POST   /api/one-mouths/draft - 임시저장')
    console.log('PUT    /api/one-mouths/{id} - 게시물 수정')
    console.log('DELETE /api/one-mouths/{id} - 게시물 삭제')
    console.log('PATCH  /api/one-mouths/{id}/status - 상태 변경')

    console.log('\n=== 지원 상태 ===')
    console.log('ON_SALE: 판매중')
    console.log('RESERVED: 예약중')
    console.log('SOLD_OUT: 판매완료')

    // 부모 클래스의 디버깅도 호출
    this.debugStatus()

    console.groupEnd()
  }
}

// ==================== Vue Composables ====================

/**
 * Vue Composition API용 한입만 훅
 */
export function useOneMouth() {
  const oneMouthService = new SalePostService()

  const getList = async (params = {}) => {
    try {
      const response = await oneMouthService.getOneMouths(params)
      return {
        success: true,
        data: response.data || [],
        message: response.message
      }
    } catch (error) {
      console.error('[CONTENT] 한입만 목록 조회 실패:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  const getDetail = async (id) => {
    try {
      const response = await oneMouthService.getOneMouthDetail(id)
      return {
        success: true,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('[CONTENT] 한입만 상세 조회 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const create = async (data) => {
    try {
      const response = await oneMouthService.createOneMouth(data)
      return {
        success: true,
        data: response.data,
        message: response.message || '게시물이 등록되었습니다'
      }
    } catch (error) {
      console.error('[CONTENT] 한입만 생성 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const createDraft = async (data) => {
    try {
      const response = await oneMouthService.createOneMouthDraft(data)
      return {
        success: true,
        data: response.data,
        message: response.message || '임시저장되었습니다'
      }
    } catch (error) {
      console.error('[CONTENT] 한입만 임시저장 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const update = async (id, data) => {
    try {
      const response = await oneMouthService.updateOneMouth(id, data)
      return {
        success: true,
        data: response.data,
        message: response.message || '게시물이 수정되었습니다'
      }
    } catch (error) {
      console.error('[CONTENT] 한입만 수정 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const remove = async (id) => {
    try {
      const response = await oneMouthService.deleteOneMouth(id)
      return {
        success: true,
        message: response.message || '게시물이 삭제되었습니다'
      }
    } catch (error) {
      console.error('[CONTENT] 한입만 삭제 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const toggleFavorite = async (id) => {
    try {
      const response = await oneMouthService.toggleOneMouthFavorite(id)
      return {
        success: true,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('[CONTENT] 관심상품 토글 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const uploadImages = async (files, options = {}) => {
    try {
      const response = await oneMouthService.uploadImages(files, options)
      return {
        success: true,
        data: response.data,
        message: response.message || '이미지가 업로드되었습니다'
      }
    } catch (error) {
      console.error('[CONTENT] 이미지 업로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  return {
    // CRUD 기본 기능
    getList,
    getDetail,
    create,
    createDraft,
    update,
    remove,

    // 상태 관리
    updateStatus: (id, status) => oneMouthService.updateOneMouthStatus(id, status),

    // 관심상품
    toggleFavorite,
    removeFavorite: (id) => oneMouthService.removeOneMouthFavorite(id),
    getFavorites: (params) => oneMouthService.getUserFavorites(params),

    // 이미지 관리
    uploadImages,
    uploadSingleImage: (file, options) => oneMouthService.uploadSingleImage(file, options),
    deleteImage: (imageUrl) => oneMouthService.deleteImage(imageUrl),

    // 조회수
    incrementView: (id) => oneMouthService.incrementViewCount(id),

    // 댓글
    getComments: (id, params) => oneMouthService.getComments(id, params),
    createComment: (id, content, parentId) => oneMouthService.createComment(id, content, parentId),
    updateComment: (commentId, content) => oneMouthService.updateComment(commentId, content),
    deleteComment: (commentId) => oneMouthService.deleteComment(commentId),

    // 신고
    report: (id, reason, description) => oneMouthService.reportOneMouth(id, reason, description),
    reportComment: (commentId, reason, description) => oneMouthService.reportComment(commentId, reason, description),

    // 카테고리
    getCategories: (condition) => oneMouthService.getCategories(condition),
    getCategoriesPages: (pageable, condition) => oneMouthService.getCategoriesPages(pageable, condition),
    getCategoryDetail: (categoryId) => oneMouthService.getCategoryDetail(categoryId),

    // 통계
    getStats: (id) => oneMouthService.getOneMouthStats(id),
    getUserStats: (userId) => oneMouthService.getUserSalesStats(userId),

    // 유틸리티
    formatPrice: (price) => oneMouthService.formatPrice(price),
    getRelativeTime: (timestamp) => oneMouthService.getRelativeTime(timestamp),
    isValidImageUrl: (url) => oneMouthService.isValidImageUrl(url),
    validateData: (data, isCreate) => oneMouthService.validateOneMouthData(data, isCreate),

    // 연결 테스트
    testConnection: () => oneMouthService.testConnection(),

    // 디버깅
    debugStatus: () => oneMouthService.debugOneMouthStatus()
  }
}

// ==================== 싱글톤 인스턴스 ====================

// 싱글톤 인스턴스 생성 및 내보내기
export const oneMouthService = new SalePostService()

// 별칭 (기존 코드 호환성)
export const contentService = oneMouthService

// 기본 내보내기
export default oneMouthService