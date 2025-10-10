// services/CategoryService.js
// 카테고리 관련 API 서비스 (백엔드 API 스펙에 맞춤)

import { BaseApiService } from './BaseApiService.js'

/**
 * 카테고리 서비스
 * Content Server (8082)와의 통신을 담당
 */
class CategoryService extends BaseApiService {
  constructor() {
    const baseURL = import.meta.env.DEV
        ? 'http://localhost:8082/api'
        : `${import.meta.env.VITE_CONTENT_BASE_URL}/api`

    super(baseURL, 'CATEGORY')

    console.log(`📂 [CATEGORY] Content Server URL: ${this.baseURL}`)
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
      keywords: categoryData.keywords || []
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
   * 카테고리 전체 목록 조회
   * GET /categories/list
   */
  async getCategories(condition = {}) {
    const validatedCondition = this.validateSearchCondition(condition)
    return await this.get('/categories/list', validatedCondition)
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
      sortOrder: categoryData.sortOrder
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

  // ==================== 카테고리 정렬 API ====================

  /**
   * 카테고리 순서 변경 (드래그 앤 드롭)
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

  // ==================== 카테고리 활성화 관리 ====================

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

  // ==================== 샘플 데이터 (개발용) ====================

  /**
   * 샘플 카테고리 목록 데이터 제공
   */
  getSampleCategories() {
    return {
      success: true,
      data: [
        {
          categoryId: 1,
          categoryName: "프라모델",
          description: "건담, 자동차, 항공기 등의 프라스틱 모델",
          keywords: "건담,프라모델,조립,피규어",
          sortOrder: 1,
          isActive: true,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          categoryId: 2,
          categoryName: "피규어",
          description: "애니메이션, 게임 캐릭터 피규어",
          keywords: "피규어,애니메이션,게임,캐릭터",
          sortOrder: 2,
          isActive: true,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          categoryId: 3,
          categoryName: "블록완구",
          description: "레고, 조립식 블록 완구",
          keywords: "레고,블록,조립,완구",
          sortOrder: 3,
          isActive: true,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          categoryId: 4,
          categoryName: "음료",
          description: "음료수, 차, 커피 등",
          keywords: "음료,음료수,차,커피",
          sortOrder: 4,
          isActive: true,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          categoryId: 5,
          categoryName: "과자/스낵",
          description: "과자, 스낵, 간식류",
          keywords: "과자,스낵,간식,쿠키",
          sortOrder: 5,
          isActive: true,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        }
      ]
    }
  }

  /**
   * 샘플 카테고리 상세 데이터 제공
   */
  getSampleCategoryDetail(categoryId) {
    const categories = this.getSampleCategories().data
    const category = categories.find(c => c.categoryId === parseInt(categoryId))

    if (!category) {
      return {
        success: false,
        message: '카테고리를 찾을 수 없습니다.'
      }
    }

    return {
      success: true,
      data: {
        ...category,
        categoryCode: null,
        keywords: this.parseKeywords(category.keywords),
        iconUrl: null,
        colorCode: null
      }
    }
  }

  // ==================== 유틸리티 메서드 ====================

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

  // ==================== 백엔드 응답 변환 ====================

  /**
   * 백엔드 카테고리 응답을 프론트엔드 형식으로 변환
   */
  transformCategoryResponse(backendCategory) {
    return {
      categoryId: backendCategory.categoryId,
      categoryName: backendCategory.categoryName,
      description: backendCategory.description,
      categoryCode: backendCategory.categoryCode || null,
      keywords: this.parseKeywords(backendCategory.keywords),
      iconUrl: backendCategory.iconUrl || null,
      colorCode: backendCategory.colorCode || null,
      sortOrder: backendCategory.sortOrder || 0,
      isActive: backendCategory.isActive !== false,
      createdAt: backendCategory.createdAt,
      updatedAt: backendCategory.updatedAt
    }
  }

  // ==================== 유틸리티 ====================

  /**
   * 카테고리 목록 정렬
   */
  sortCategories(categories, sortBy = 'sortOrder') {
    return [...categories].sort((a, b) => {
      switch (sortBy) {
        case 'sortOrder':
          return a.sortOrder - b.sortOrder
        case 'categoryName':
          return a.categoryName.localeCompare(b.categoryName, 'ko-KR')
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return a.sortOrder - b.sortOrder
      }
    })
  }

  /**
   * 카테고리 목록 필터링
   */
  filterCategories(categories, filters) {
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
   * 키워드 문자열을 배열로 변환
   */
  parseKeywords(keywordString) {
    if (!keywordString) return []
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
   * 키워드를 해시태그 형식으로 표시
   */
  formatKeywordsWithHash(keywords) {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) return ''
    return keywords.map(keyword => `#${keyword}`).join(' ')
  }

  /**
   * 카테고리별 색상 생성 (UI용)
   */
  generateCategoryColor(index) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#686DE0', '#4834D4', '#130F40', '#30336B', '#95A5A6'
    ]
    return colors[index % colors.length]
  }

  // ==================== 디버깅 ====================

  /**
   * Category Service 상태 디버깅
   */
  debugCategoryStatus() {
    console.group('🔍 [CATEGORY] 카테고리 서비스 상태')

    console.log('=== 서버 정보 ===')
    console.log('Content Server URL:', this.baseURL)

    console.log('=== 지원 API ===')
    console.log('POST   /categories - 카테고리 생성')
    console.log('GET    /categories - 카테고리 목록 조회 (페이징)')
    console.log('GET    /categories/list - 카테고리 전체 목록')
    console.log('GET    /categories/{id} - 카테고리 상세 조회')
    console.log('PUT    /categories/{id} - 카테고리 수정')
    console.log('DELETE /categories/{id} - 카테고리 삭제')
    console.log('PATCH  /categories/{id}/toggle-status - 활성화 토글')
    console.log('PUT    /categories/{id}/reorder - 순서 변경')

    this.debugStatus()

    console.groupEnd()
  }
}

// ==================== 카테고리 유틸리티 ====================

/**
 * 카테고리 관련 유틸리티 함수들
 */
export const categoryUtils = {
  /**
   * 카테고리별 아이콘 반환
   */
  getCategoryIcon(categoryName) {
    const iconMap = {
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
      '음료': '🥤',
      '과자/스낵': '🍫',
      '베이커리': '🍞',
      '도시락/간편식': '🍱',
      '아이스크림': '🍦',
      '라면/면류': '🍜',
      '기타': '🎁'
    }
    return iconMap[categoryName] || '📂'
  },

  /**
   * 카테고리 상태 텍스트 반환
   */
  getStatusText(isActive) {
    return isActive ? '활성' : '비활성'
  },

  /**
   * 카테고리 상태 배지 색상
   */
  getStatusBadgeClass(isActive) {
    return isActive ? 'badge-success' : 'badge-secondary'
  }
}

// ==================== Vue Composables ====================

/**
 * Vue Composition API용 카테고리 훅
 */
export function useCategory() {
  const categoryService = new CategoryService()

  const getCategories = async (condition = {}) => {
    try {
      const response = await categoryService.getCategories(condition)
      return {
        success: true,
        data: response.data || [],
        message: response.message
      }
    } catch (error) {
      console.error('[CATEGORY] 카테고리 목록 조회 실패:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  const createCategory = async (categoryData) => {
    try {
      const response = await categoryService.createCategory(categoryData)
      return {
        success: true,
        data: response.data,
        message: response.message || '카테고리가 등록되었습니다'
      }
    } catch (error) {
      console.error('[CATEGORY] 카테고리 등록 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const reorderCategory = async (categoryId, targetPosition) => {
    try {
      const response = await categoryService.updateCategoryOrder(categoryId, targetPosition)
      return {
        success: true,
        data: response.data,
        message: response.message || '카테고리 순서가 변경되었습니다'
      }
    } catch (error) {
      console.error('[CATEGORY] 카테고리 순서 변경 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const toggleStatus = async (categoryId) => {
    try {
      const response = await categoryService.toggleCategoryStatus(categoryId)
      return {
        success: true,
        data: response.data,
        message: response.message || '카테고리 상태가 변경되었습니다'
      }
    } catch (error) {
      console.error('[CATEGORY] 카테고리 상태 변경 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  return {
    // 카테고리 관리
    getCategories,
    createCategory,
    getCategory: (categoryId) => categoryService.getCategory(categoryId),
    updateCategory: (categoryId, categoryData) => categoryService.updateCategory(categoryId, categoryData),
    deleteCategory: (categoryId) => categoryService.deleteCategory(categoryId),

    // 페이징 조회
    getCategoriesPages: (pageable, condition) => categoryService.getCategoriesPages(pageable, condition),

    // 순서 관리
    reorderCategory,

    // 상태 관리
    toggleStatus,

    // 유틸리티
    transformCategory: (category) => categoryService.transformCategoryResponse(category),
    sortCategories: (categories, sortBy) => categoryService.sortCategories(categories, sortBy),
    filterCategories: (categories, filters) => categoryService.filterCategories(categories, filters),
    parseKeywords: (keywords) => categoryService.parseKeywords(keywords),
    formatKeywords: (keywords) => categoryService.formatKeywords(keywords),
    formatKeywordsWithHash: (keywords) => categoryService.formatKeywordsWithHash(keywords),

    // 연결 테스트
    testConnection: () => categoryService.testConnection(),

    // 디버깅
    debugStatus: () => categoryService.debugCategoryStatus()
  }
}

// ==================== 싱글톤 인스턴스 ====================

export const categoryService = new CategoryService()
export const categoryApi = categoryService
export default categoryService