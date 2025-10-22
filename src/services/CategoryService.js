// services/CategoryService.js
import { BaseApiService } from './BaseApiService.js'

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
   * 카테고리 등록 (계층형 지원)
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
      parentId: categoryData.parentId || null  // 부모 카테고리 ID 추가
    }

    return await this.post('/categories', requestData)
  }

  /**
   * 카테고리 목록 조회 (계층형 트리 구조)
   * GET /categories/tree
   */
  async getCategoryTree(condition = {}) {
    const validatedCondition = this.validateSearchCondition(condition)
    return await this.get('/categories/tree', validatedCondition)
  }

  /**
   * 카테고리 전체 목록 조회 (평면 구조 + children 포함)
   * GET /categories/list
   */
  async getCategories(condition = {}) {
    const validatedCondition = this.validateSearchCondition(condition)
    return await this.get('/categories/list', validatedCondition)
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
      parentId: categoryData.parentId || null  // 부모 변경 지원
    }

    return await this.put(`/categories/${categoryId}`, requestData)
  }

  /**
   * 카테고리 순서 변경 (같은 레벨 내에서만)
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

  // ==================== 계층형 유틸리티 ====================

  /**
   * 평면 구조를 트리 구조로 변환
   */
  buildCategoryTree(categories) {
    if (!categories || !Array.isArray(categories)) return []

    const categoryMap = new Map()
    const rootCategories = []

    // 1단계: 모든 카테고리를 Map에 저장
    categories.forEach(category => {
      categoryMap.set(category.categoryId, {
        ...category,
        children: category.children || []
      })
    })

    // 2단계: 부모-자식 관계 구성
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
        // 최상위 카테고리
        const root = categoryMap.get(category.categoryId)
        if (root) {
          rootCategories.push(root)
        }
      }
    })

    return rootCategories.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  /**
   * 트리 구조를 평면 구조로 변환
   */
  flattenCategoryTree(categories, parentId = null, depth = 0) {
    let result = []

    categories.forEach(category => {
      result.push({
        ...category,
        parentId: parentId,
        depth: depth,
        children: undefined  // 평면화 시 children 제거
      })

      if (category.children && category.children.length > 0) {
        result = result.concat(
            this.flattenCategoryTree(category.children, category.categoryId, depth + 1)
        )
      }
    })

    return result
  }

  /**
   * 특정 카테고리의 전체 경로 생성
   */
  getCategoryPath(categoryId, categories) {
    const categoryMap = new Map()
    categories.forEach(cat => categoryMap.set(cat.categoryId, cat))

    const path = []
    let current = categoryMap.get(categoryId)

    while (current) {
      path.unshift(current.categoryName)
      current = current.parentId ? categoryMap.get(current.parentId) : null
    }

    return path.join(' > ')
  }

  /**
   * 카테고리의 모든 하위 ID 조회
   */
  getDescendantIds(categoryId, categories) {
    const descendants = []
    const category = categories.find(c => c.categoryId === categoryId)

    if (!category || !category.children) return descendants

    const collectIds = (children) => {
      children.forEach(child => {
        descendants.push(child.categoryId)
        if (child.children && child.children.length > 0) {
          collectIds(child.children)
        }
      })
    }

    collectIds(category.children)
    return descendants
  }

  /**
   * 카테고리 이동 가능 여부 확인
   */
  canMoveCategory(categoryId, targetParentId, categories) {
    // 자기 자신의 하위로 이동 불가
    if (categoryId === targetParentId) return false

    // 자신의 하위 카테고리로 이동 불가 (순환 참조 방지)
    const descendants = this.getDescendantIds(categoryId, categories)
    return !descendants.includes(targetParentId)
  }

  /**
   * depth 계산
   */
  calculateDepth(parentId, categories) {
    if (!parentId) return 0

    const parent = categories.find(c => c.categoryId === parentId)
    if (!parent) return 0

    return (parent.depth || 0) + 1
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
      parentId: backendCategory.parentId || null,
      depth: backendCategory.depth || 0,
      fullPath: backendCategory.fullPath || backendCategory.categoryName,
      childrenCount: backendCategory.childrenCount || 0,
      children: backendCategory.children
          ? backendCategory.children.map(child => this.transformCategoryResponse(child))
          : [],
      createdAt: backendCategory.createdAt,
      updatedAt: backendCategory.updatedAt
    }
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

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

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

  // ==================== 디버깅 ====================

  debugCategoryStatus() {
    console.group('🔍 [CATEGORY] 카테고리 서비스 상태')
    console.log('Content Server URL:', this.baseURL)
    console.log('=== 계층형 구조 지원 ===')
    console.log('POST   /categories - 카테고리 생성 (parentId 지원)')
    console.log('GET    /categories/tree - 트리 구조 조회')
    console.log('GET    /categories/root - 최상위 카테고리만 조회')
    console.log('GET    /categories/parent/{id} - 자식 카테고리 조회')
    console.log('PUT    /categories/{id}/reorder - 같은 레벨 내 순서 변경')
    this.debugStatus()
    console.groupEnd()
  }
}

export const categoryService = new CategoryService()
export default categoryService