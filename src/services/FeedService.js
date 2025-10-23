// services/FeedService.js

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'

class FeedService extends BaseApiService {
  constructor() {
    const baseURL = import.meta.env.DEV
        ? 'http://localhost:8082/api'
        : `${import.meta.env.VITE_CONTENT_BASE_URL}/api`

    super(baseURL, 'FEED')
    console.log(`📰 [FEED] Content Server URL: ${this.baseURL}`)
  }

  // ==================== 피드 CRUD 메서드 ====================

  /**
   * 피드 생성
   * POST /api/feeds
   */
  async createFeed(feedData) {
    console.log('🚀 [FEED_SERVICE] 피드 생성 요청 데이터:', JSON.stringify(feedData, null, 2))

    const validation = this.validateFeedData(feedData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      userId: feedData.userId,
      productId: feedData.productId || null,
      productNameCustom: feedData.productNameCustom?.trim() || null,
      subCategoryId: parseInt(feedData.subCategoryId),
      review: feedData.review.trim(),
      buyPrice: feedData.buyPrice || null,
      price: feedData.price || null,
      imageUrls: feedData.imageUrls || [],
      hashtags: feedData.hashtags || []
    }

    console.log('📤 [FEED_SERVICE] 최종 전송 데이터:', JSON.stringify(requestData, null, 2))
    return await this.post('/feeds', requestData)
  }

  /**
   * 피드 단건 조회
   * GET /api/feeds/{feedId}
   */
  async getFeed(feedId) {
    if (!feedId) {
      throw new Error('피드 ID가 필요합니다.')
    }
    return await this.get(`/feeds/${feedId}`)
  }

  /**
   * 피드 목록 조회 (페이징)
   * GET /api/feeds
   */
  async getFeeds(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)

    const params = {
      ...cleanedCondition,
      ...cleanedPageable
    }

    const response = await this.get('/feeds', params)

    if (response.success && response.data) {
      if (response.data.content) {
        response.data.content = this.normalizeFeedListResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        response.data = this.normalizeFeedListResponse(response.data)
      }
    }

    return response
  }

  /**
   * 피드 전체 목록 조회
   * GET /api/feeds/list
   */
  async getFeedList(searchCondition = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)

    const response = await this.get('/feeds/list', cleanedCondition)

    if (response.success && response.data) {
      response.data = this.normalizeFeedListResponse(response.data)
    }

    return response
  }

  /**
   * 피드 수정
   * PUT /api/feeds/{feedId}
   */
  async updateFeed(feedId, feedData) {
    if (!feedId) {
      throw new Error('피드 ID가 필요합니다.')
    }

    const validation = this.validateFeedData(feedData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      feedId: parseInt(feedId),
      userId: feedData.userId,
      productId: feedData.productId || null,
      productNameCustom: feedData.productNameCustom?.trim() || null,
      categoryId: parseInt(feedData.categoryId),
      review: feedData.review.trim(),
      buyPrice: feedData.buyPrice || null,
      price: feedData.price || null,
      imageUrls: feedData.imageUrls || [],
      hashtags: feedData.hashtags || []
    }

    console.log('📤 [FEED_SERVICE] 피드 수정 요청:', requestData)
    return await this.put(`/feeds/${feedId}`, requestData)
  }

  /**
   * 피드 삭제
   * DELETE /api/feeds/{feedId}
   */
  async deleteFeed(feedId) {
    if (!feedId) {
      throw new Error('피드 ID가 필요합니다.')
    }
    return await this.delete(`/feeds/${feedId}`)
  }

  // ==================== 피드 반응 메서드 ====================

  /**
   * 피드 반응 토글
   * POST /api/feeds/{feedId}/reactions/{reactionType}
   */
  async toggleFeedReaction(feedId, reactionType) {
    if (!feedId) {
      throw new Error('피드 ID가 필요합니다.')
    }

    const validReactionTypes = ['LIKE', 'INTEREST', 'SHARE']
    if (!validReactionTypes.includes(reactionType.toUpperCase())) {
      throw new Error('올바른 리액션 타입을 선택해주세요.')
    }

    const requestData = {
      userId: authUtils.getUserId(),
      deviceId: authUtils.getDeviceId()
    }

    return await this.post(`/feeds/${feedId}/reactions/${reactionType.toUpperCase()}`, requestData)
  }

  /**
   * 피드 좋아요
   */
  async likeFeed(feedId) {
    return this.toggleFeedReaction(feedId, 'LIKE')
  }

  /**
   * 피드 관심
   */
  async interestFeed(feedId) {
    return this.toggleFeedReaction(feedId, 'INTEREST')
  }

  /**
   * 피드 공유
   */
  async shareFeed(feedId) {
    return this.toggleFeedReaction(feedId, 'SHARE')
  }

  // ==================== 검색 및 필터 메서드 ====================

  /**
   * 피드 검색
   * GET /api/feeds/search
   */
  async searchFeeds(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)

    const params = {
      ...cleanedCondition,
      ...cleanedPageable
    }

    return await this.get('/feeds/search', params)
  }

  /**
   * 카테고리별 피드 조회
   * GET /api/feeds/category/{categoryId}
   */
  async getFeedsByCategory(categoryId, pageable = {}) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    const validatedPageable = this.validatePageable(pageable)
    const params = this.removeEmptyParams(validatedPageable)

    return await this.get(`/feeds/category/${categoryId}`, params)
  }

  /**
   * 해시태그별 피드 조회
   * GET /api/feeds/hashtag/{hashtag}
   */
  async getFeedsByHashtag(hashtag, pageable = {}) {
    if (!hashtag || hashtag.trim().length === 0) {
      throw new Error('해시태그가 필요합니다.')
    }

    const validatedPageable = this.validatePageable(pageable)
    const params = this.removeEmptyParams(validatedPageable)

    return await this.get(`/feeds/hashtag/${encodeURIComponent(hashtag)}`, params)
  }

  /**
   * 사용자별 피드 조회
   * GET /api/feeds/user/{userId}
   */
  async getFeedsByUser(userId, pageable = {}) {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    const validatedPageable = this.validatePageable(pageable)
    const params = this.removeEmptyParams(validatedPageable)

    return await this.get(`/feeds/user/${userId}`, params)
  }

  /**
   * 내가 작성한 피드 조회
   * GET /api/feeds/my
   */
  async getMyFeeds(pageable = {}) {
    const validatedPageable = this.validatePageable(pageable)
    const params = this.removeEmptyParams(validatedPageable)

    return await this.get('/feeds/my', params)
  }

  /**
   * 인기 피드 조회
   * GET /api/feeds/popular
   */
  async getPopularFeeds(params = {}) {
    const validatedParams = {
      size: params.size || 10,
      categoryId: params.categoryId || null,
      period: params.period || 'WEEK'
    }

    const cleanedParams = this.removeEmptyParams(validatedParams)
    return await this.get('/feeds/popular', cleanedParams)
  }

  // ==================== 이미지 업로드 ====================

  /**
   * 피드 이미지 업로드
   * POST /api/files/upload
   */
  async uploadFeedImage(file) {
    if (!file) {
      throw new Error('파일이 필요합니다.')
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('파일 크기는 10MB 이하여야 합니다.')
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.')
    }

    const formData = new FormData()
    formData.append('file', file)

    console.log('📤 [FEED_SERVICE] 피드 이미지 업로드 시작')
    return await this.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * 다중 이미지 업로드
   */
  async uploadFeedImages(files) {
    if (!files || files.length === 0) {
      throw new Error('파일이 필요합니다.')
    }

    if (files.length > 10) {
      throw new Error('이미지는 최대 10개까지 업로드 가능합니다.')
    }

    const uploadPromises = Array.from(files).map(file => this.uploadFeedImage(file))
    return await Promise.all(uploadPromises)
  }

  // ==================== 유틸리티 메서드 ====================

  /**
   * 빈 파라미터 제거
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
  }

  /**
   * 피드 목록 응답 정규화
   */
  normalizeFeedListResponse(feeds) {
    if (!Array.isArray(feeds)) return []

    return feeds.map(feed => ({
      ...feed,
      thumbnailUrl: feed.thumbnailUrl || null,
      hashtags: feed.hashtags || [],
      reactionStats: feed.reactionStats || {
        totalCount: 0,
        likeCount: 0,
        greatCount: 0,
        badCount: 0
      }
    }))
  }

  // ==================== 검증 메서드 ====================

  /**
   * 피드 데이터 검증
   */
  validateFeedData(feedData) {
    const errors = []

    if (!feedData.userId) {
      errors.push('사용자 ID는 필수입니다.')
    }

    if (!feedData.productId && (!feedData.productNameCustom || feedData.productNameCustom.trim().length === 0)) {
      errors.push('상품을 선택하거나 상품명을 입력해주세요.')
    }

    if (feedData.productNameCustom && feedData.productNameCustom.length > 200) {
      errors.push('상품명은 200자 이하여야 합니다.')
    }

    if (!feedData.subCategoryId && !feedData.categoryId) {
      errors.push('카테고리는 필수입니다.')
    }

    if (!feedData.review || feedData.review.trim().length === 0) {
      errors.push('리뷰 내용은 필수입니다.')
    } else if (feedData.review.length > 1000) {
      errors.push('리뷰는 1000자 이하로 작성해주세요.')
    }

    if (feedData.buyPrice !== null && feedData.buyPrice !== undefined) {
      if (feedData.buyPrice < 0 || feedData.buyPrice > 999999999) {
        errors.push('구매 가격은 0원 이상 999,999,999원 이하여야 합니다.')
      }
    }

    if (feedData.price !== null && feedData.price !== undefined) {
      if (feedData.price < 0 || feedData.price > 999999999) {
        errors.push('정가는 0원 이상 999,999,999원 이하여야 합니다.')
      }
    }

    if (feedData.imageUrls && feedData.imageUrls.length > 10) {
      errors.push('이미지는 최대 10개까지 업로드 가능합니다.')
    }

    if (feedData.hashtags && feedData.hashtags.length > 20) {
      errors.push('해시태그는 최대 20개까지 등록 가능합니다.')
    }

    if (feedData.hashtags) {
      const invalidHashtags = feedData.hashtags.filter(tag => tag.length > 50)
      if (invalidHashtags.length > 0) {
        errors.push('각 해시태그는 50자 이하여야 합니다.')
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
  validateSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') {
      return {}
    }

    const validated = { ...searchCondition }

    if (validated.keyword && validated.keyword.length > 100) {
      validated.keyword = validated.keyword.substring(0, 100)
    }

    if (validated.categoryId && isNaN(parseInt(validated.categoryId))) {
      delete validated.categoryId
    } else if (validated.categoryId) {
      validated.categoryId = parseInt(validated.categoryId)
    }

    if (validated.hashtags && Array.isArray(validated.hashtags)) {
      validated.hashtags = validated.hashtags.slice(0, 10)
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
      'viewCount,DESC', 'viewCount,ASC',
      'likeCount,DESC', 'likeCount,ASC'
    ]

    const validated = {
      page: Math.max(0, pageable.page || 0),
      size: Math.min(100, Math.max(1, pageable.size || 20))
    }

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
    if (!price || price === 0) return '무료'
    const numPrice = typeof price === 'string' ? parseInt(price) : price
    return new Intl.NumberFormat('ko-KR').format(numPrice) + '원'
  }

  /**
   * 할인율 계산
   */
  calculateDiscountRate(price, buyPrice) {
    if (!price || !buyPrice || price === 0) return 0
    return Math.round(((price - buyPrice) / price) * 100)
  }

  /**
   * 디버그 정보 출력
   */
  debugFeedStatus() {
    console.group('🔍 [FEED] 피드 서비스 상태')
    console.log('=== 서버 정보 ===')
    console.log('Content Server URL:', this.baseURL)
    console.log('=== 지원 기능 ===')
    console.log('피드 CRUD: 생성, 조회, 수정, 삭제')
    console.log('반응: 좋아요, 관심, 공유')
    console.log('검색: 키워드, 카테고리, 해시태그, 사용자')
    console.log('이미지: 단일/다중 업로드 (최대 10장)')
    this.debugStatus()
    console.groupEnd()
  }
}

// ==================== 싱글톤 인스턴스 ====================

export const feedService = new FeedService()
export default feedService

// ==================== Vue Composables ====================

export function useFeed() {
  const service = new FeedService()

  return {
    createFeed: (data) => service.createFeed(data),
    getFeed: (id) => service.getFeed(id),
    getFeeds: (condition, pageable) => service.getFeeds(condition, pageable),
    updateFeed: (id, data) => service.updateFeed(id, data),
    deleteFeed: (id) => service.deleteFeed(id),
    likeFeed: (id) => service.likeFeed(id),
    searchFeeds: (condition, pageable) => service.searchFeeds(condition, pageable),
    uploadImage: (file) => service.uploadFeedImage(file),
    debugStatus: () => service.debugFeedStatus()
  }
}

// ==================== 피드 필터링 유틸리티 ====================

export const feedFilterUtils = {
  getDefaultSearchCondition() {
    return {
      keyword: '',
      categoryId: null,
      hashtags: [],
      userId: null
    }
  },

  getDefaultPageable() {
    return {
      page: 0,
      size: 20,
      sort: 'createdAt,DESC'
    }
  },

  getSortOptions() {
    return [
      { value: 'createdAt,DESC', label: '최신순' },
      { value: 'createdAt,ASC', label: '오래된순' },
      { value: 'viewCount,DESC', label: '조회수순' },
      { value: 'likeCount,DESC', label: '좋아요순' }
    ]
  }
}

// ==================== 피드 유틸리티 함수 ====================

export const feedUtils = {
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

  formatPrice(price) {
    if (!price || price === 0) return '무료'
    const numPrice = typeof price === 'string' ? parseInt(price) : price
    return new Intl.NumberFormat('ko-KR').format(numPrice) + '원'
  },

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

  calculateDiscountRate(price, buyPrice) {
    if (!price || !buyPrice || price === 0) return 0
    return Math.round(((price - buyPrice) / price) * 100)
  },

  formatHashtag(tag) {
    if (!tag) return ''
    return tag.startsWith('#') ? tag : `#${tag}`
  },

  parseHashtags(hashtagString) {
    if (!hashtagString) return []
    return hashtagString
    .split(/[,\s]+/)
    .map(tag => tag.replace('#', '').trim())
    .filter(tag => tag.length > 0)
  }
}