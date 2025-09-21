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
   * 상품 등록 (기존 방식: FormData로 직접 전송)
   */
  async createProduct(productData) {
    const validation = this.validateProductData(productData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    // 기존 FormData 방식 유지
    const formData = new FormData()

    // 기본 상품 정보 추가
    formData.append('name', productData.name.trim())
    formData.append('brand', productData.brand.trim())
    formData.append('categoryId', productData.categoryId)
    formData.append('productType', productData.productType || 'SALE')

    // 선택적 필드
    if (productData.description) {
      formData.append('description', productData.description.trim())
    }
    if (productData.distributor) {
      formData.append('distributor', productData.distributor.trim())
    }
    if (productData.price) {
      formData.append('price', productData.price.toString())
    }
    if (productData.releaseDate) {
      formData.append('releaseDate', productData.releaseDate)
    }
    if (productData.feature) {
      formData.append('feature', productData.feature)
    }

    // 태그 처리
    if (productData.tags && productData.tags.length > 0) {
      productData.tags.forEach(tag => formData.append('tags', tag))
    }

    // 작성자 정보 추가 (기존 코드 호환)
    if (productData.creatorId) {
      formData.append('creatorId', productData.creatorId)
    }
    if (productData.creatorNickname) {
      formData.append('creatorNickname', productData.creatorNickname)
    }

    // 첨부파일 추가 (기존 방식)
    if (productData.attachmentFiles && productData.attachmentFiles.length > 0) {
      productData.attachmentFiles.forEach((file, index) => {
        formData.append('attachmentFiles', file)
        console.log(`📎 [PRODUCT] 파일 ${index + 1}:`, file.name)
      })
    }

    return await this.uploadFile('/products', formData)
  }

  /**
   * JSON 방식 상품 등록 (백엔드 DTO 준수)
   */
  async createProductJson(productData) {
    const validation = this.validateProductData(productData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    // 백엔드 DTO에 맞춘 요청 데이터 구성
    const requestData = {
      name: productData.name?.trim(),
      brand: productData.brand?.trim(),
      description: productData.description?.trim() || null,
      distributor: productData.distributor?.trim() || null,
      price: productData.price ? productData.price.toString() : null,
      feature: productData.feature || null,
      tags: productData.tags || [],
      releaseDate: productData.releaseDate || null,
      categoryId: productData.categoryId,
      attachmentIds: productData.attachmentIds || []
    }

    return await this.post('/products', requestData)
  }

  /**
   * 파일 업로드 먼저 수행 후 상품 등록 (분리된 방식)
   */
  async createProductWithFiles(productData, files = []) {
    try {
      console.log('📤 [PRODUCT] 파일 업로드 및 상품 등록 시작')

      let attachmentIds = []

      // 1. 파일이 있으면 먼저 업로드
      if (files && files.length > 0) {
        console.log(`📎 [PRODUCT] ${files.length}개 파일 업로드 중...`)

        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)

          const uploadResponse = await this.uploadFile('/files/upload', formData)
          if (uploadResponse.success && uploadResponse.data?.id) {
            attachmentIds.push(uploadResponse.data.id)
            console.log(`✅ [PRODUCT] 파일 업로드 성공: ${file.name} -> ID: ${uploadResponse.data.id}`)
          } else {
            console.warn(`⚠️ [PRODUCT] 파일 업로드 실패: ${file.name}`)
          }
        }
      }

      // 2. 상품 데이터에 첨부파일 ID 추가
      const productWithAttachments = {
        ...productData,
        attachmentIds: attachmentIds
      }

      // 3. JSON 방식으로 상품 등록
      const createResponse = await this.createProductJson(productWithAttachments)

      if (createResponse.success) {
        console.log('✅ [PRODUCT] 상품 등록 완료:', createResponse.data?.id)
        return {
          success: true,
          data: createResponse.data,
          message: '상품이 성공적으로 등록되었습니다.'
        }
      } else {
        throw new Error(createResponse.error || '상품 등록에 실패했습니다.')
      }

    } catch (error) {
      console.error('❌ [PRODUCT] 상품 등록 실패:', error)
      throw error
    }
  }

  /**
   * 단일 파일 업로드
   */
  async uploadSingleFile(file) {
    if (!file) {
      throw new Error('업로드할 파일이 없습니다.')
    }

    const formData = new FormData()
    formData.append('file', file)

    return await this.uploadFile('/files/upload', formData)
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
      name: productData.name?.trim(),
      brand: productData.brand?.trim(),
      description: productData.description?.trim() || null,
      distributor: productData.distributor?.trim() || null,
      price: productData.price ? productData.price.toString() : null,
      feature: productData.feature || null,
      tags: productData.tags || [],
      releaseDate: productData.releaseDate || null,
      categoryId: productData.categoryId,
      attachmentIds: productData.attachmentIds || []
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
   * 상품 등록 데이터 검증 (백엔드 DTO 기준으로 업데이트)
   */
  validateProductData(productData) {
    const errors = []

    // 필수 필드 검증
    if (!productData.name || productData.name.trim().length === 0) {
      errors.push('제품명은 필수입니다.')
    }

    if (productData.name && (productData.name.length < 2 || productData.name.length > 100)) {
      errors.push('제품명은 2자 이상 100자 이하로 입력해주세요.')
    }

    if (!productData.brand || productData.brand.trim().length === 0) {
      errors.push('브랜드명은 필수입니다.')
    }

    if (productData.brand && (productData.brand.length < 1 || productData.brand.length > 100)) {
      errors.push('브랜드명은 1자 이상 100자 이하로 입력해주세요.')
    }

    if (!productData.categoryId || productData.categoryId <= 0) {
      errors.push('올바른 카테고리를 선택해주세요.')
    }

    // 선택적 필드 검증
    if (productData.description && productData.description.length > 1000) {
      errors.push('제품 설명은 1000자 이하로 입력해주세요.')
    }

    if (productData.distributor && productData.distributor.length > 1000) {
      errors.push('판매처 정보는 1000자 이하로 입력해주세요.')
    }

    if (productData.feature && productData.feature.length > 1000) {
      errors.push('제품 특징은 1000자 이하로 입력해주세요.')
    }

    // 가격 검증 (숫자만, 최대 10자리)
    if (productData.price) {
      const priceRegex = /^[0-9]{1,10}$/
      if (!priceRegex.test(productData.price.toString())) {
        errors.push('가격은 숫자만 입력 가능하며 최대 10자리까지 입력할 수 있습니다.')
      }
    }

    // 태그 검증
    if (productData.tags && productData.tags.length > 10) {
      errors.push('태그는 최대 10개까지 입력 가능합니다.')
    }

    // productType 검증 (선택사항이므로 제공될 때만 검증)
    if (productData.productType && !['SALE', 'RENTAL', 'INFO'].includes(productData.productType)) {
      errors.push('올바른 상품 타입을 선택해주세요.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 검색 조건 검증
   */
  validateSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') {
      return {}
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']
    const validProductTypes = ['SALE', 'RENTAL', 'INFO']

    const validated = { ...searchCondition }

    // status 검증
    if (validated.status && !validStatuses.includes(validated.status)) {
      validated.status = 'APPROVED'
    }

    // productType 검증
    if (validated.productType && !validProductTypes.includes(validated.productType)) {
      delete validated.productType
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

    return validated
  }

  /**
   * 페이징 조건 검증
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
   * 샘플 카테고리 데이터 제공
   */
  getSampleCategories() {
    return {
      success: true,
      data: [
        {
          categoryId: 1,
          categoryName: "음료",
          description: "커피, 차, 음료수 등",
          productCount: 45
        },
        {
          categoryId: 2,
          categoryName: "스낵/과자",
          description: "과자, 스낵, 견과류 등",
          productCount: 32
        },
        {
          categoryId: 3,
          categoryName: "베이커리",
          description: "빵, 케이크, 디저트 등",
          productCount: 28
        },
        {
          categoryId: 4,
          categoryName: "도시락/식사",
          description: "도시락, 간편식 등",
          productCount: 67
        },
        {
          categoryId: 5,
          categoryName: "디저트",
          description: "아이스크림, 디저트 등",
          productCount: 21
        },
        {
          categoryId: 6,
          categoryName: "기타",
          description: "기타 상품",
          productCount: 15
        }
      ]
    }
  }

  /**
   * Product Service 상태 디버깅
   */
  debugProductStatus() {
    console.group('🔍 [PRODUCT] 상품 서비스 상태')

    console.log('=== 서버 정보 ===')
    console.log('Content Server URL:', this.baseURL)

    console.log('=== 지원 기능 ===')
    console.log('상품 CRUD: 등록, 조회, 수정, 삭제')
    console.log('파일 업로드: 이미지, 첨부파일')
    console.log('검색 및 필터링: 키워드, 카테고리, 브랜드')

    // 부모 클래스의 디버깅도 호출
    this.debugStatus()

    console.groupEnd()
  }
}

// ==================== Vue Composables ====================

/**
 * Vue Composition API용 상품 훅
 * Vue 컴포넌트에서 사용하는 메인 인터페이스
 */
export function useProduct() {
  const productService = new ProductService()

  /**
   * 상품 등록 (Vue 컴포넌트용 래퍼) - 기존 FormData 방식 사용
   */
  const createProduct = async (productData, files = []) => {
    try {
      console.log('🚀 [PRODUCT] 상품 등록 시작:', {
        name: productData.name,
        filesCount: files?.length || 0
      })

      // 유효성 검증
      const validation = productService.validateProductData(productData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // 파일이 있는 경우 attachmentFiles로 추가
      if (files && files.length > 0) {
        productData.attachmentFiles = files
      }

      // 기존 FormData 방식으로 상품 등록
      const response = await productService.createProduct(productData)

      if (response.success) {
        console.log('✅ [PRODUCT] 상품 등록 성공:', response.data?.id || '알 수 없음')
        return {
          success: true,
          data: response.data,
          message: '상품이 성공적으로 등록되었습니다.'
        }
      } else {
        throw new Error(response.error || '상품 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [PRODUCT] 상품 등록 실패:', error)
      return {
        success: false,
        error: error.message || '상품 등록 중 오류가 발생했습니다.'
      }
    }
  }

  /**
   * 분리된 방식 상품 등록 (파일 먼저 업로드 후 상품 등록)
   */
  const createProductSeparate = async (productData, files = []) => {
    try {
      console.log('🚀 [PRODUCT] 분리된 방식 상품 등록 시작')

      // 유효성 검증
      const validation = productService.validateProductData(productData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // 분리된 방식으로 파일과 함께 상품 등록
      const response = await productService.createProductWithFiles(productData, files)

      if (response.success) {
        console.log('✅ [PRODUCT] 상품 등록 성공:', response.data?.id || '알 수 없음')
        return response
      } else {
        throw new Error(response.error || '상품 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [PRODUCT] 상품 등록 실패:', error)
      return {
        success: false,
        error: error.message || '상품 등록 중 오류가 발생했습니다.'
      }
    }
  }

  /**
   * 카테고리 목록 조회 (Vue 컴포넌트용 래퍼)
   */
  const getCategories = async () => {
    try {
      const response = await productService.getCategories()

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        }
      } else {
        // API 실패 시 기본 카테고리 제공
        console.warn('[PRODUCT] 카테고리 API 실패, 기본값 사용')
        return productService.getSampleCategories()
      }
    } catch (error) {
      console.error('[PRODUCT] 카테고리 조회 실패:', error)
      // 에러 시에도 기본 카테고리 제공
      return productService.getSampleCategories()
    }
  }

  /**
   * 파일 업로드 (Vue 컴포넌트용 래퍼)
   */
  const uploadFile = async (file) => {
    try {
      if (!file) {
        throw new Error('업로드할 파일이 필요합니다.')
      }

      const response = await productService.uploadSingleFile(file)

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: '파일이 업로드되었습니다.'
        }
      } else {
        throw new Error(response.error || '파일 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('[PRODUCT] 파일 업로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 디버깅 정보 출력
   */
  const debugStatus = () => {
    productService.debugProductStatus()
  }

  /**
   * 파일 크기 포맷팅 유틸리티
   */
  const formatFileSize = (size) => {
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    // 주요 메서드 (Vue 컴포넌트에서 직접 사용)
    createProduct,
    createProductSeparate, // 분리된 방식 추가
    getCategories,
    uploadFile,
    debugStatus,

    // 상품 관리 (기존 메서드들 유지)
    getProducts: (searchCondition, pageable) => productService.getProducts(searchCondition, pageable),
    getProduct: (productId) => productService.getProduct(productId),
    updateProduct: (productId, productData) => productService.updateProduct(productId, productData),
    deleteProduct: (productId) => productService.deleteProduct(productId),

    // 리액션 (기존 메서드들 유지)
    likeProduct: (productId) => productService.likeProduct(productId),
    bookmarkProduct: (productId) => productService.bookmarkProduct(productId),
    toggleProductReaction: (productId, reactionType) => productService.toggleProductReaction(productId, reactionType),

    // 검색 (기존 메서드들 유지)
    searchProducts: (keyword, filters, pageable) => productService.searchProducts(keyword, filters, pageable),
    getPopularProducts: (params) => productService.getPopularProducts(params),

    // 기존 이미지 업로드 메서드 유지
    uploadImage: (productId, imageFile, options) => uploadImage(productId, imageFile, options),
    uploadProductImage: (productId, imageFile, options) => productService.uploadProductImage(productId, imageFile, options),

    // 유틸리티
    formatPrice: (price) => productService.formatPrice(price),
    formatFileSize,
    validateProductData: (productData) => productService.validateProductData(productData),

    // 연결 테스트
    testConnection: () => productService.testConnection()
  }
}

// ==================== 싱글톤 인스턴스 ====================

// 싱글톤 인스턴스 생성 및 내보내기
export const productService = new ProductService()

// 별칭 (기존 코드 호환성)
export const productApi = productService

// 기본 내보내기
export default productService