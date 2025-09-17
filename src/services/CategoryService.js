// services/CategoryService.js
// 카테고리 관련 API 서비스 (Fetch API 기반)

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'

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
   */
  async createCategory(categoryData) {
    const validation = this.validateCategoryData(categoryData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      categoryName: categoryData.categoryName,
      description: categoryData.description,
      categoryCode: categoryData.categoryCode,
      keywords: categoryData.keywords || [],
      iconUrl: categoryData.iconUrl,
      colorCode: categoryData.colorCode,
      sortOrder: categoryData.sortOrder || 0,
      isActive: categoryData.isActive !== false // 기본값 true
    }

    return await this.post('/categories', requestData)
  }

  /**
   * 카테고리 단건 조회
   */
  async getCategory(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    return await this.get(`/categories/${categoryId}`)
  }

  /**
   * 카테고리 목록 조회 (페이징)
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
   * 카테고리 목록 조회 (전체 목록)
   */
  async getCategories(condition = {}) {
    const validatedCondition = this.validateSearchCondition(condition)
    return await this.get('/categories/list', validatedCondition)
  }

  /**
   * 카테고리 수정
   */
  async updateCategory(categoryId, categoryData) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    const validation = this.validateCategoryData(categoryData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      categoryName: categoryData.categoryName,
      description: categoryData.description,
      categoryCode: categoryData.categoryCode,
      keywords: categoryData.keywords || [],
      iconUrl: categoryData.iconUrl,
      colorCode: categoryData.colorCode,
      sortOrder: categoryData.sortOrder,
      isActive: categoryData.isActive
    }

    return await this.put(`/categories/${categoryId}`, requestData)
  }

  /**
   * 카테고리 삭제
   */
  async deleteCategory(categoryId) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    return await this.delete(`/categories/${categoryId}`)
  }

  // ==================== 카테고리 통계 API ====================

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

  // ==================== 카테고리 정렬 API ====================

  /**
   * 카테고리 순서 변경
   */
  async updateCategoryOrder(categoryId, newOrder) {
    if (!categoryId || newOrder === undefined) {
      throw new Error('카테고리 ID와 새로운 순서가 필요합니다.')
    }

    const requestData = {
      sortOrder: newOrder
    }

    return await this.patch(`/categories/${categoryId}/order`, requestData)
  }

  /**
   * 여러 카테고리 순서 일괄 변경
   */
  async updateCategoriesOrder(orderData) {
    if (!orderData || !Array.isArray(orderData)) {
      throw new Error('순서 데이터 배열이 필요합니다.')
    }

    // 데이터 검증
    const validatedData = orderData.map(item => {
      if (!item.categoryId || item.sortOrder === undefined) {
        throw new Error('각 항목에는 categoryId와 sortOrder가 필요합니다.')
      }
      return {
        categoryId: item.categoryId,
        sortOrder: item.sortOrder
      }
    })

    return await this.patch('/categories/order', { categories: validatedData })
  }

  // ==================== 카테고리 활성화 관리 ====================

  /**
   * 카테고리 활성화/비활성화
   */
  async toggleCategoryStatus(categoryId, isActive) {
    if (!categoryId || isActive === undefined) {
      throw new Error('카테고리 ID와 활성화 상태가 필요합니다.')
    }

    const requestData = {
      isActive: isActive
    }

    return await this.patch(`/categories/${categoryId}/status`, requestData)
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
          categoryCode: "PM001",
          keywords: ["건담", "프라모델", "조립", "피규어"],
          iconUrl: "https://example.com/icons/plastic-model.svg",
          colorCode: "#FF6B6B",
          sortOrder: 1,
          isActive: true,
          productCount: 245,
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
          productCount: 189,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          categoryId: 3,
          categoryName: "블록완구",
          description: "레고, 조립식 블록 완구",
          categoryCode: "BL001",
          keywords: ["레고", "블록", "조립", "완구"],
          iconUrl: "https://example.com/icons/blocks.svg",
          colorCode: "#45B7D1",
          sortOrder: 3,
          isActive: true,
          productCount: 156,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          categoryId: 4,
          categoryName: "음료",
          description: "음료수, 차, 커피 등",
          categoryCode: "DR001",
          keywords: ["음료", "음료수", "차", "커피"],
          iconUrl: "https://example.com/icons/drink.svg",
          colorCode: "#96CEB4",
          sortOrder: 4,
          isActive: true,
          productCount: 324,
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          categoryId: 5,
          categoryName: "과자/스낵",
          description: "과자, 스낵, 간식류",
          categoryCode: "SN001",
          keywords: ["과자", "스낵", "간식", "쿠키"],
          iconUrl: "https://example.com/icons/snack.svg",
          colorCode: "#FECA57",
          sortOrder: 5,
          isActive: true,
          productCount: 412,
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
        recentProducts: [
          {
            id: 1,
            name: "건담 RX-78-2 Ver. Ka",
            brand: "반다이",
            price: "45000",
            thumbnailUrl: "https://example.com/images/gundam1.jpg",
            likeCount: 89,
            createdAt: "2024-01-10T10:30:00"
          },
          {
            id: 2,
            name: "포켓몬 피카츄 피규어",
            brand: "굿스마일컴퍼니",
            price: "28000",
            thumbnailUrl: "https://example.com/images/pikachu1.jpg",
            likeCount: 156,
            createdAt: "2024-01-25T14:20:00"
          }
        ],
        stats: {
          totalProducts: category.productCount,
          activeProducts: Math.floor(category.productCount * 0.9),
          averagePrice: 35000,
          totalViews: 12450,
          totalLikes: 1890
        }
      }
    }
  }

  /**
   * 샘플 카테고리 통계 데이터 제공
   */
  getSampleCategoriesStats() {
    return {
      success: true,
      data: {
        totalCategories: 5,
        activeCategories: 5,
        inactiveCategories: 0,
        totalProducts: 1326,
        categoriesStats: [
          { categoryId: 1, categoryName: "프라모델", productCount: 245, percentage: 18.5 },
          { categoryId: 2, categoryName: "피규어", productCount: 189, percentage: 14.3 },
          { categoryId: 3, categoryName: "블록완구", productCount: 156, percentage: 11.8 },
          { categoryId: 4, categoryName: "음료", productCount: 324, percentage: 24.4 },
          { categoryId: 5, categoryName: "과자/스낵", productCount: 412, percentage: 31.1 }
        ]
      }
    }
  }

  // ==================== 유틸리티 메서드 ====================

  /**
   * 카테고리 등록 데이터 검증
   */
  validateCategoryData(categoryData) {
    const errors = []

    if (!categoryData.categoryName || categoryData.categoryName.trim().length === 0) {
      errors.push('카테고리명은 필수입니다.')
    }

    if (categoryData.categoryName && categoryData.categoryName.length > 50) {
      errors.push('카테고리명은 50자 이하여야 합니다.')
    }

    if (!categoryData.categoryCode || categoryData.categoryCode.trim().length === 0) {
      errors.push('카테고리 코드는 필수입니다.')
    }

    if (categoryData.categoryCode && categoryData.categoryCode.length > 20) {
      errors.push('카테고리 코드는 20자 이하여야 합니다.')
    }

    if (categoryData.description && categoryData.description.length > 500) {
      errors.push('카테고리 설명은 500자 이하여야 합니다.')
    }

    if (categoryData.keywords && categoryData.keywords.length > 20) {
      errors.push('키워드는 최대 20개까지 가능합니다.')
    }

    if (categoryData.colorCode && !/^#[0-9A-F]{6}$/i.test(categoryData.colorCode)) {
      errors.push('올바른 색상 코드를 입력해주세요. (예: #FF6B6B)')
    }

    if (categoryData.sortOrder !== undefined && (isNaN(categoryData.sortOrder) || categoryData.sortOrder < 0)) {
      errors.push('정렬 순서는 0 이상의 숫자여야 합니다.')
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
      categoryCode: backendCategory.categoryCode,
      keywords: backendCategory.keywords || [],
      iconUrl: backendCategory.iconUrl,
      colorCode: backendCategory.colorCode,
      sortOrder: backendCategory.sortOrder || 0,
      isActive: backendCategory.isActive !== false,
      productCount: backendCategory.productCount || 0,
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
        case 'productCount':
          return b.productCount - a.productCount
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
        return category.categoryName.toLowerCase().includes(keyword) ||
            category.description?.toLowerCase().includes(keyword) ||
            (category.keywords && category.keywords.some(tag => tag.toLowerCase().includes(keyword)))
      }

      return true
    })
  }

  /**
   * 카테고리별 색상 생성
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

    console.log('=== 지원 기능 ===')
    console.log('카테고리 CRUD: 등록, 조회, 수정, 삭제')
    console.log('카테고리 정렬: 순서 변경, 일괄 변경')
    console.log('카테고리 활성화: 활성화/비활성화 관리')
    console.log('카테고리 통계: 상품 수, 전체 통계')

    // 부모 클래스의 디버깅도 호출
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
   * 카테고리 코드 생성
   */
  generateCategoryCode(categoryName) {
    const codeMap = {
      '프라모델': 'PM',
      '피규어': 'FG',
      '블록완구': 'BL',
      '완구': 'TO',
      '게임': 'GM',
      '도서': 'BK',
      '전자제품': 'EL',
      '의류': 'CL',
      '액세서리': 'AC',
      '뷰티': 'BT',
      '스포츠': 'SP',
      '음료': 'DR',
      '과자/스낵': 'SN',
      '베이커리': 'BK',
      '도시락/간편식': 'ML',
      '아이스크림': 'IC',
      '라면/면류': 'ND'
    }

    const baseCode = codeMap[categoryName] || 'GN'
    const timestamp = Date.now().toString().slice(-3)
    return `${baseCode}${timestamp}`
  },

  /**
   * 카테고리 색상 생성
   */
  generateCategoryColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  },

  /**
   * 키워드 배열을 문자열로 변환
   */
  formatKeywords(keywords) {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) return ''
    return keywords.map(keyword => `#${keyword}`).join(' ')
  },

  /**
   * 키워드 문자열을 배열로 변환
   */
  parseKeywords(keywordString) {
    if (!keywordString) return []
    return keywordString
    .split(/[,\s]+/)
    .map(keyword => keyword.replace(/^#/, '').trim())
    .filter(keyword => keyword.length > 0)
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

  const updateCategoryOrder = async (categoryId, newOrder) => {
    try {
      const response = await categoryService.updateCategoryOrder(categoryId, newOrder)
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

  return {
    // 카테고리 관리
    getCategories,
    createCategory,
    getCategory: (categoryId) => categoryService.getCategory(categoryId),
    updateCategory: (categoryId, categoryData) => categoryService.updateCategory(categoryId, categoryData),
    deleteCategory: (categoryId) => categoryService.deleteCategory(categoryId),

    // 페이징 조회
    getCategoriesPages: (pageable, condition) => categoryService.getCategoriesPages(pageable, condition),

    // 통계
    getCategoryStats: (categoryId) => categoryService.getCategoryStats(categoryId),
    getAllCategoriesStats: () => categoryService.getAllCategoriesStats(),

    // 순서 관리
    updateCategoryOrder,
    updateCategoriesOrder: (orderData) => categoryService.updateCategoriesOrder(orderData),

    // 상태 관리
    toggleCategoryStatus: (categoryId, isActive) => categoryService.toggleCategoryStatus(categoryId, isActive),

    // 유틸리티
    transformCategory: (category) => categoryService.transformCategoryResponse(category),
    sortCategories: (categories, sortBy) => categoryService.sortCategories(categories, sortBy),
    filterCategories: (categories, filters) => categoryService.filterCategories(categories, filters),

    // 연결 테스트
    testConnection: () => categoryService.testConnection(),

    // 디버깅
    debugStatus: () => categoryService.debugCategoryStatus()
  }
}

// ==================== 싱글톤 인스턴스 ====================

// 싱글톤 인스턴스 생성 및 내보내기
export const categoryService = new CategoryService()

// 별칭 (기존 코드 호환성)
export const categoryApi = categoryService

// 기본 내보내기
export default categoryService