// services/CategoryService.js
import { BaseApiService } from './BaseApiService.js'
import { ENV, getServiceUrl } from '@/config/env.js'

class CategoryService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('CONTENT')
    super(baseURL, 'CATEGORY')
    console.log(`⚔️ [CATEGORY] Content Server URL: ${this.baseURL}`)
    console.log(`🌍 [CATEGORY] Environment: ${ENV.MODE}`)
  }

  // ==================== 카테고리 CRUD API ====================

  /**
   * 카테고리 등록
   * POST /categories
   */
  async createCategory(categoryData) {
    const validation = this.validateCategoryData(categoryData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      categoryName: categoryData.categoryName,
      description: categoryData.description || null,
      categoryCode: categoryData.categoryCode || null,
      keywords: categoryData.keywords || [],
      parentId: categoryData.parentId || null
    }

    return await this.post('/categories', requestData)
  }

  /**
   * 카테고리 단건 조회
   * GET /categories/{categoryId}
   */
  async getCategory(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }
    return await this.get(`/categories/${categoryId}`)
  }

  /**
   * 카테고리 전체 목록 조회 (평면 구조)
   * GET /categories/list
   */
  async getCategories(condition = {}) {
    const validatedCondition = this.validateSearchCondition(condition)
    return await this.get('/categories/list', validatedCondition)
  }

  /**
   * 카테고리 목록 조회 (페이징)
   * GET /categories
   */
  async getCategoriesPages(pageable = {}, condition = {}) {
    const validatedPageable = this.validatePageable(pageable)
    const validatedCondition = this.validateSearchCondition(condition)

    const params = {
      ...validatedCondition,
      ...validatedPageable
    }

    return await this.get('/categories', params)
  }

  /**
   * 카테고리 트리 구조 조회
   * GET /categories/tree
   */
  async getCategoryTree(condition = {}) {
    const validatedCondition = this.validateSearchCondition(condition)
    return await this.get('/categories/tree', validatedCondition)
  }

  /**
   * 최상위 카테고리만 조회
   * GET /categories/root
   */
  async getRootCategories(condition = {}) {
    const validatedCondition = this.validateSearchCondition(condition)
    return await this.get('/categories/root', validatedCondition)
  }

  /**
   * 특정 부모의 자식 카테고리 조회
   * GET /categories/parent/{parentId}
   */
  async getChildCategories(parentId) {
    if (!parentId) {
      throw new Error('부모 카테고리 ID가 필요합니다.')
    }
    return await this.get(`/categories/parent/${parentId}`)
  }

  /**
   * 카테고리 수정
   * PUT /categories/{categoryId}
   */
  async updateCategory(categoryId, categoryData) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    const validation = this.validateCategoryData(categoryData, true)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      categoryName: categoryData.categoryName,
      description: categoryData.description || null,
      keywords: categoryData.keywords || [],
      sortOrder: categoryData.sortOrder,
      parentId: categoryData.parentId || null
    }

    return await this.put(`/categories/${categoryId}`, requestData)
  }

  /**
   * 카테고리 삭제
   * DELETE /categories/{categoryId}
   */
  async deleteCategory(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }
    return await this.delete(`/categories/${categoryId}`)
  }

  /**
   * 카테고리 순서 변경
   * PUT /categories/{categoryId}/reorder
   */
  async updateCategoryOrder(categoryId, targetPosition) {
    if (!categoryId || targetPosition === undefined) {
      throw new Error('카테고리 ID와 목표 위치가 필요합니다.')
    }

    if (targetPosition < 1) {
      throw new Error('목표 위치는 1 이상이어야 합니다.')
    }

    const requestData = {
      targetPosition: targetPosition
    }

    return await this.put(`/categories/${categoryId}/reorder`, requestData)
  }

  /**
   * 카테고리 활성화/비활성화 토글
   * PATCH /categories/{categoryId}/toggle-status
   */
  async toggleCategoryStatus(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }
    return await this.patch(`/categories/${categoryId}/toggle-status`)
  }

  // ==================== 인기 카테고리 API ====================

  /**
   * 인기 카테고리 목록 조회
   * GET /categories/popular
   * @param {Object} params - 조회 조건
   * @param {string} params.type - 콘텐츠 타입 (BATTLE, FEED, PRODUCT)
   * @param {string} params.startDate - 조회 시작일 (yyyy-MM-dd)
   * @param {string} params.endDate - 조회 종료일 (yyyy-MM-dd)
   * @param {number} params.page - 페이지 번호 (기본값: 0)
   * @param {number} params.size - 페이지당 항목 수 (기본값: 20)
   * @param {string} params.sort - 정렬 기준 (기본값: contentCount,desc)
   */
  async getPopularCategories(params = {}) {
    // 호출부 호환: type / categoryType 둘 다 받음
    const { type, categoryType, startDate, endDate, page = 0, size = 20, sort = 'contentCount,desc' } = params
    const ctype = categoryType || type

    if (!ctype) {
      throw new Error('콘텐츠 타입(categoryType)은 필수입니다.')
    }

    if (!startDate || !endDate) {
      throw new Error('조회 기간(startDate, endDate)은 필수입니다.')
    }

    const queryParams = {
      categoryType: ctype,
      startDate,
      endDate,
      page,
      size,
      sort,
      isActive: true
    }

    return await this.get('/categories/popular', queryParams)
  }

  /**
   * 인기 카테고리 간편 조회 (최근 30일 기준)
   * @param {string} type - 콘텐츠 타입 (BATTLE, FEED, PRODUCT)
   * @param {number} size - 조회할 개수 (기본값: 10)
   */
  async getTopCategories(type, size = 10) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const formatDate = (date) => {
      return date.toISOString().split('T')[0]
    }

    return await this.getPopularCategories({
      type,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      page: 0,
      size,
      sort: 'contentCount,desc'
    })
  }

  // ==================== 통계 API ====================

  /**
   * 카테고리별 상품 수 조회
   */
  async getCategoryProductCount(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }
    return await this.get(`/categories/${categoryId}/product-count`)
  }

  /**
   * 카테고리별 통계 조회
   */
  async getCategoryStats(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }
    return await this.get(`/categories/${categoryId}/stats`)
  }

  /**
   * 전체 카테고리 통계 조회
   */
  async getAllCategoriesStats() {
    return await this.get('/categories/stats')
  }

  // ==================== 검증 ====================

  /**
   * 카테고리 등록/수정 데이터 검증
   */
  validateCategoryData(categoryData, isUpdate = false) {
    const errors = []

    if (!categoryData.categoryName || categoryData.categoryName.trim().length === 0) {
      errors.push('카테고리명은 필수입니다.')
    }

    if (categoryData.categoryName && categoryData.categoryName.length > 100) {
      errors.push('카테고리명은 100자 이하여야 합니다.')
    }

    if (categoryData.description && categoryData.description.length > 500) {
      errors.push('카테고리 설명은 500자 이하여야 합니다.')
    }

    if (categoryData.categoryCode && categoryData.categoryCode.length > 50) {
      errors.push('카테고리 코드는 50자 이하여야 합니다.')
    }

    if (categoryData.keywords && Array.isArray(categoryData.keywords)) {
      if (categoryData.keywords.length > 10) {
        errors.push('키워드는 최대 10개까지 가능합니다.')
      }

      const invalidKeywords = categoryData.keywords.filter(k =>
          !k || k.trim().length === 0 || k.length > 20
      )

      if (invalidKeywords.length > 0) {
        errors.push('각 키워드는 1-20자여야 합니다.')
      }
    }

    if (isUpdate) {
      if (categoryData.sortOrder === undefined || categoryData.sortOrder === null) {
        errors.push('정렬 순서는 필수입니다.')
      }

      if (categoryData.sortOrder !== undefined && categoryData.sortOrder < 0) {
        errors.push('정렬 순서는 0 이상이어야 합니다.')
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 검색 조건 검증
   */
  validateSearchCondition(condition) {
    const validatedCondition = { ...condition }

    if (validatedCondition.keyword && validatedCondition.keyword.length > 100) {
      validatedCondition.keyword = validatedCondition.keyword.substring(0, 100)
    }

    if (validatedCondition.isActive !== undefined) {
      validatedCondition.isActive = Boolean(validatedCondition.isActive)
    }

    return validatedCondition
  }

  /**
   * 페이징 조건 검증
   */
  validatePageable(pageable) {
    const validSorts = [
      'categoryId,DESC', 'categoryId,ASC',
      'categoryName,DESC', 'categoryName,ASC',
      'sortOrder,DESC', 'sortOrder,ASC',
      'createdAt,DESC', 'createdAt,ASC',
      'updatedAt,DESC', 'updatedAt,ASC'
    ]

    const validated = {
      page: Math.max(0, pageable.page || 0),
      size: Math.min(100, Math.max(1, pageable.size || 20))
    }

    if (pageable.sort && validSorts.includes(pageable.sort)) {
      validated.sort = pageable.sort
    } else {
      validated.sort = 'sortOrder,ASC'
    }

    return validated
  }

  // ==================== 유틸리티 ====================

  /**
   * 키워드 문자열을 배열로 변환
   */
  parseKeywords(keywordString) {
    if (!keywordString) return []
    if (Array.isArray(keywordString)) return keywordString

    return keywordString
    .split(',')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0)
  }

  /**
   * 키워드 배열을 문자열로 변환
   */
  formatKeywords(keywords) {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) return ''
    return keywords.join(',')
  }

  /**
   * 카테고리 목록 정렬
   */
  sortCategories(categories, sortBy = 'sortOrder') {
    if (!categories || !Array.isArray(categories)) return []

    return [...categories].sort((a, b) => {
      switch (sortBy) {
        case 'sortOrder':
          return (a.sortOrder || 0) - (b.sortOrder || 0)
        case 'categoryName':
          return a.categoryName.localeCompare(b.categoryName, 'ko-KR')
        case 'productCount':
          return (b.productCount || 0) - (a.productCount || 0)
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return (a.sortOrder || 0) - (b.sortOrder || 0)
      }
    })
  }

  /**
   * 카테고리 목록 필터링
   */
  filterCategories(categories, filters) {
    if (!categories || !Array.isArray(categories)) return []

    return categories.filter(category => {
      if (filters.isActive !== undefined && category.isActive !== filters.isActive) {
        return false
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        const keywordsArray = this.parseKeywords(category.keywords)

        return category.categoryName.toLowerCase().includes(keyword) ||
            category.description?.toLowerCase().includes(keyword) ||
            keywordsArray.some(tag => tag.toLowerCase().includes(keyword))
      }

      return true
    })
  }

  /**
   * 평면 구조를 트리 구조로 변환
   */
  buildCategoryTree(categories) {
    if (!categories || !Array.isArray(categories)) return []

    const categoryMap = new Map()
    const rootCategories = []

    categories.forEach(category => {
      categoryMap.set(category.categoryId, {
        ...category,
        children: category.children || []
      })
    })

    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          const child = categoryMap.get(category.categoryId)
          if (child && !parent.children.find(c => c.categoryId === child.categoryId)) {
            parent.children.push(child)
          }
        }
      } else {
        const root = categoryMap.get(category.categoryId)
        if (root) {
          rootCategories.push(root)
        }
      }
    })

    return rootCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  }

  // ==================== 디버깅 ====================

  debugCategoryStatus() {
    console.group('🔍 [CATEGORY] 카테고리 서비스 상태')
    console.log('Content Server URL:', this.baseURL)
    console.log('=== 지원 API ===')
    console.log('POST   /categories - 카테고리 생성')
    console.log('GET    /categories/list - 카테고리 전체 목록')
    console.log('GET    /categories/tree - 트리 구조 조회')
    console.log('GET    /categories/root - 최상위 카테고리만 조회')
    console.log('GET    /categories/parent/{id} - 자식 카테고리 조회')
    console.log('PUT    /categories/{id}/reorder - 순서 변경')
    console.log('PATCH  /categories/{id}/toggle-status - 활성화 토글')
    this.debugStatus()
    console.groupEnd()
  }
}

// ==================== Vue Composables ====================

export function useCategory() {
  const service = new CategoryService()

  const getCategories = async (condition = {}) => {
    try {
      const response = await service.getCategories(condition)
      return response
    } catch (error) {
      console.error('[CATEGORY] 카테고리 목록 조회 실패:', error)
      throw error
    }
  }

  const sortCategories = (categories, sortBy = 'sortOrder') => {
    return service.sortCategories(categories, sortBy)
  }

  const filterCategories = (categories, filters) => {
    return service.filterCategories(categories, filters)
  }

  return {
    getCategories,
    sortCategories,
    filterCategories,
    createCategory: (data) => service.createCategory(data),
    updateCategory: (id, data) => service.updateCategory(id, data),
    deleteCategory: (id) => service.deleteCategory(id),
    toggleStatus: (id) => service.toggleCategoryStatus(id),
    reorderCategory: (id, position) => service.updateCategoryOrder(id, position),
    getPopularCategories: (params) => service.getPopularCategories(params),
    getTopCategories: (type, size) => service.getTopCategories(type, size),
    debugStatus: () => service.debugCategoryStatus()
  }
}

// ==================== 싱글톤 인스턴스 ====================

export const categoryService = new CategoryService()
export default categoryService