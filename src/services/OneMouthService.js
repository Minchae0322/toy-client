// services/OneMouthService.js
// 한입만 컨텐츠 관련 API 서비스 (Fetch API 기반)

import { BaseApiService } from './base/BaseApiService.js'
import * as authUtils from '@/utils/auth.js'

/**
 * 한입만 컨텐츠 서비스
 * Content Server (8082)와의 통신을 담당
 */
class OneMouthService extends BaseApiService {
  constructor() {
    const baseURL = import.meta.env.DEV
        ? 'http://localhost:8082/api'
        : `${import.meta.env.VITE_CONTENT_BASE_URL}/api`

    super(baseURL, 'CONTENT')
  }

  // ==================== 한입만 게시물 API ====================

  /**
   * 한입만 게시물 목록 조회
   */
  async getOneMouths(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20,
      sort: params.sort || 'createdAt,desc',
      ...params
    }

    return await this.get('/one-mouths', queryParams)
  }

  /**
   * 한입만 게시물 상세 조회
   */
  async getOneMouthDetail(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.get(`/one-mouths/${id}`)
  }

  /**
   * 한입만 게시물 생성
   */
  async createOneMouth(data) {
    const validation = this.validateOneMouthData(data)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      title: data.title,
      content: data.content,
      price: data.price,
      location: data.location,
      categoryId: data.categoryId,
      tags: data.tags || [],
      images: data.images || [],
      isNegotiable: data.isNegotiable || false,
      condition: data.condition || 'GOOD',
      deliveryMethod: data.deliveryMethod || 'DIRECT',
      paymentMethod: data.paymentMethod || 'CASH'
    }

    return await this.post('/one-mouths', requestData)
  }

  /**
   * 한입만 게시물 수정
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
   */
  async deleteOneMouth(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.delete(`/one-mouths/${id}`)
  }

  /**
   * 한입만 게시물 상태 변경 (판매중/예약중/판매완료)
   */
  async updateOneMouthStatus(id, status) {
    const validStatuses = ['SELLING', 'RESERVED', 'SOLD', 'HIDDEN']

    if (!validStatuses.includes(status)) {
      throw new Error('올바른 상태값을 입력해주세요.')
    }

    return await this.patch(`/one-mouths/${id}/status`, { status })
  }

  // ==================== 관심 상품 API ====================

  /**
   * 관심 상품 추가/제거 토글
   */
  async toggleOneMouthFavorite(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.post(`/one-mouths/${id}/favorite`)
  }

  /**
   * 관심 상품 제거
   */
  async removeOneMouthFavorite(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.delete(`/one-mouths/${id}/favorite`)
  }

  /**
   * 사용자 관심 상품 목록 조회
   */
  async getUserFavorites(params = {}) {
    return await this.get('/one-mouths/favorites', params)
  }

  // ==================== 검색 및 필터링 API ====================

  /**
   * 한입만 게시물 검색
   */
  async searchOneMouths(query, filters = {}) {
    const params = {
      query,
      page: filters.page || 0,
      size: filters.size || 20,
      sort: filters.sort || 'createdAt,desc',
      ...filters
    }

    return await this.get('/one-mouths/search', params)
  }

  /**
   * 카테고리별 한입만 게시물 조회
   */
  async getOneMouthsByCategory(categoryId, params = {}) {
    return await this.get(`/one-mouths/categories/${categoryId}`, params)
  }

  /**
   * 가격 범위별 한입만 게시물 조회
   */
  async getOneMouthsByPriceRange(minPrice, maxPrice, params = {}) {
    const queryParams = {
      minPrice,
      maxPrice,
      ...params
    }

    return await this.get('/one-mouths/price-range', queryParams)
  }

  /**
   * 지역별 한입만 게시물 조회
   */
  async getOneMouthsByLocation(location, params = {}) {
    const queryParams = {
      location,
      ...params
    }

    return await this.get('/one-mouths/location', queryParams)
  }

  // ==================== 이미지 관리 API ====================

  /**
   * 이미지 업로드
   */
  async uploadImages(files, options = {}) {
    if (!files || files.length === 0) {
      throw new Error('업로드할 이미지가 필요합니다.')
    }

    const formData = new FormData()

    // 여러 파일 추가
    Array.from(files).forEach((file, index) => {
      formData.append('images', file)
    })

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    return await this.uploadFile('/one-mouths/images', formData)
  }

  /**
   * 단일 이미지 업로드
   */
  async uploadSingleImage(file, options = {}) {
    const formData = new FormData()
    formData.append('image', file)

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    return await this.uploadFile('/one-mouths/image', formData)
  }

  /**
   * 이미지 삭제
   */
  async deleteImage(imageUrl) {
    if (!imageUrl) {
      throw new Error('이미지 URL이 필요합니다.')
    }

    return await this.delete('/one-mouths/images', {
      body: JSON.stringify({ imageUrl })
    })
  }

  // ==================== 좋아요 및 조회수 API ====================

  /**
   * 좋아요 추가/제거
   */
  async toggleLike(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.post(`/one-mouths/${id}/like`)
  }

  /**
   * 좋아요 제거
   */
  async removeLike(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.delete(`/one-mouths/${id}/like`)
  }

  /**
   * 조회수 증가
   */
  async incrementViewCount(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.post(`/one-mouths/${id}/view`)
  }

  // ==================== 댓글 API ====================

  /**
   * 댓글 목록 조회
   */
  async getComments(id, params = {}) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.get(`/one-mouths/${id}/comments`, params)
  }

  /**
   * 댓글 작성
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
   */
  async getCategoriesPages(pageable = {}, condition = {}) {
    const params = {
      page: pageable.page || 0,
      size: pageable.size || 20,
      sort: pageable.sort || 'name,asc',
      ...condition
    }

    return await this.get('/categories', params)
  }

  /**
   * 전체 카테고리 목록 조회
   */
  async getCategories(condition = {}) {
    return await this.get('/categories/list', condition)
  }

  /**
   * 카테고리 상세 조회
   */
  async getCategoryDetail(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    return await this.get(`/categories/${categoryId}`)
  }

  /**
   * 카테고리 생성 (관리자 전용)
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
   */
  async getOneMouthStats(id) {
    if (!id) {
      throw new Error('게시물 ID가 필요합니다.')
    }

    return await this.get(`/one-mouths/${id}/stats`)
  }

  /**
   * 사용자 판매 통계 조회
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

    if (isCreate || data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push('제목은 필수입니다.')
      } else if (data.title.length > 100) {
        errors.push('제목은 100자 이하여야 합니다.')
      }
    }

    if (isCreate || data.content !== undefined) {
      if (!data.content || data.content.trim().length === 0) {
        errors.push('내용은 필수입니다.')
      } else if (data.content.length > 2000) {
        errors.push('내용은 2000자 이하여야 합니다.')
      }
    }

    if (isCreate || data.price !== undefined) {
      if (data.price === null || data.price === undefined) {
        errors.push('가격은 필수입니다.')
      } else if (data.price < 0) {
        errors.push('가격은 0원 이상이어야 합니다.')
      } else if (data.price > 999999999) {
        errors.push('가격은 999,999,999원 이하여야 합니다.')
      }
    }

    if (isCreate || data.location !== undefined) {
      if (!data.location || data.location.trim().length === 0) {
        errors.push('거래 지역은 필수입니다.')
      }
    }

    if (isCreate || data.categoryId !== undefined) {
      if (!data.categoryId) {
        errors.push('카테고리는 필수입니다.')
      }
    }

    if (data.condition) {
      const validConditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']
      if (!validConditions.includes(data.condition)) {
        errors.push('올바른 상품 상태를 선택해주세요.')
      }
    }

    if (data.deliveryMethod) {
      const validMethods = ['DIRECT', 'DELIVERY', 'BOTH']
      if (!validMethods.includes(data.deliveryMethod)) {
        errors.push('올바른 거래 방법을 선택해주세요.')
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

    if (isCreate || data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('카테고리 이름은 필수입니다.')
      } else if (data.name.length > 50) {
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

    console.log('=== 지원 기능 ===')
    console.log('게시물 CRUD: 생성, 조회, 수정, 삭제')
    console.log('이미지 업로드: 단일/다중 이미지 지원')
    console.log('검색/필터링: 카테고리, 가격, 지역별 검색')
    console.log('소셜 기능: 좋아요, 관심상품, 댓글')
    console.log('신고 시스템: 게시물/댓글 신고')

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
  const oneMouthService = new OneMouthService()

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

  const search = async (query, filters = {}) => {
    try {
      const response = await oneMouthService.searchOneMouths(query, filters)
      return {
        success: true,
        data: response.data || [],
        message: response.message
      }
    } catch (error) {
      console.error('[CONTENT] 한입만 검색 실패:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  return {
    // CRUD 기본 기능
    getList,
    getDetail,
    create,
    update,
    remove,

    // 상태 관리
    updateStatus: (id, status) => oneMouthService.updateOneMouthStatus(id, status),

    // 관심상품
    toggleFavorite,
    removeFavorite: (id) => oneMouthService.removeOneMouthFavorite(id),
    getFavorites: (params) => oneMouthService.getUserFavorites(params),

    // 검색 및 필터링
    search,
    getByCategory: (categoryId, params) => oneMouthService.getOneMouthsByCategory(categoryId, params),
    getByPriceRange: (min, max, params) => oneMouthService.getOneMouthsByPriceRange(min, max, params),
    getByLocation: (location, params) => oneMouthService.getOneMouthsByLocation(location, params),

    // 이미지 관리
    uploadImages,
    uploadSingleImage: (file, options) => oneMouthService.uploadSingleImage(file, options),
    deleteImage: (imageUrl) => oneMouthService.deleteImage(imageUrl),

    // 소셜 기능
    toggleLike: (id) => oneMouthService.toggleLike(id),
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
export const oneMouthService = new OneMouthService()

// 별칭 (기존 코드 호환성)
export const contentService = oneMouthService

// 기본 내보내기
export default oneMouthService