// services/FeedService.js

import { BaseApiService } from './BaseApiService.js'
import { fileService } from './FileService.js'
import { ENV, getServiceUrl } from "@/config/env.js"

class FeedService extends BaseApiService {
  constructor() {
    const baseURL = `${getServiceUrl('CONTENT')}/api`
    super(baseURL, 'FEED')
    console.log(`⚔️ [FEED] Content Server URL: ${this.baseURL}`)
    console.log(`🌍 [FEED] Environment: ${ENV.MODE}`)
  }

  // ==================== 피드 CRUD 메서드 ====================

  async createFeedWithFiles(feedData, thumbnailFile, additionalFiles = []) {
    console.log('🚀 [FEED_SERVICE] 피드 생성 프로세스 시작')
    try {
      const thumbnailFiles = thumbnailFile ? [thumbnailFile] : []
      const allAdditionalFiles = additionalFiles.filter(f => f)
      let thumbnailInfo = null
      let attachmentFileInfos = []

      if (thumbnailFiles.length > 0) {
        console.log('1️⃣ 대표 이미지 배치 업로드 중...')
        const thumbnailResponse = await fileService.uploadFiles(thumbnailFiles, { fileCode: 'FEED' })
        const uploadedData = thumbnailResponse.data
        const uploadedFile = Array.isArray(uploadedData) ? uploadedData[0] : uploadedData
        if (uploadedFile) {
          thumbnailInfo = this.convertToAttachmentInfo(uploadedFile)
          console.log('✅ 대표 이미지 업로드 완료:', thumbnailInfo)
        }
      }

      if (allAdditionalFiles.length > 0) {
        console.log(`2️⃣ ${allAdditionalFiles.length}개 추가 이미지 배치 업로드 중...`)
        const additionalResponse = await fileService.uploadFiles(allAdditionalFiles, { fileCode: 'FEED' })
        const uploadedData = Array.isArray(additionalResponse.data) ? additionalResponse.data : [additionalResponse.data]
        attachmentFileInfos = uploadedData.filter(file => file).map(file => this.convertToAttachmentInfo(file))
        console.log(`✅ 추가 이미지 ${attachmentFileInfos.length}개 업로드 완료`)
      }

      console.log('3️⃣ 피드 생성 요청 중...')
      const feedCreateData = {
        ...feedData,
        thumbnailAttachmentInfo: thumbnailInfo,
        attachmentFileInfos: attachmentFileInfos
      }
      return await this.createFeed(feedCreateData)
    } catch (error) {
      console.error('❌ [FEED_SERVICE] 피드 생성 실패:', error)
      throw error
    }
  }

  convertToAttachmentInfo(fileResponse) {
    if (!fileResponse) throw new Error('파일 응답이 없습니다.')
    if (fileResponse.fileId && fileResponse.storedPath) return fileResponse
    if (!fileResponse.id || !fileResponse.fileUrl) {
      throw new Error('파일 응답 형식이 올바르지 않습니다.')
    }
    return {
      fileId: fileResponse.id,
      storedPath: fileResponse.fileUrl,
      originName: fileResponse.orgFileNm,
      fileSize: fileResponse.fileSize,
      contentType: `image/${fileResponse.fileExt}`,
      fileExplain: fileResponse.fileExplain || 'FEED 이미지'
    }
  }

  async createFeed(feedData) {
    const validation = this.validateFeedData(feedData)
    if (!validation.isValid) throw new Error(validation.errors.join(', '))
    const requestData = {
      userId: feedData.userId,
      productId: feedData.productId || null,
      productNameCustom: feedData.productNameCustom?.trim() || null,
      subCategoryId: parseInt(feedData.subCategoryId),
      review: feedData.review.trim(),
      buyPlace: feedData.buyPlace?.trim() || null,
      buyPrice: feedData.buyPrice || null,
      price: feedData.price || null,
      evaluation: feedData.evaluation?.toUpperCase() || null,
      thumbnailAttachmentInfo: feedData.thumbnailAttachmentInfo,
      attachmentFileInfos: feedData.attachmentFileInfos || [],
      hashtags: feedData.hashtags || []
    }
    return await this.post('/feeds', requestData)
  }

  async getFeed(feedId) {
    if (!feedId) throw new Error('피드 ID가 필요합니다.')
    const response = await this.get(`/feeds/${feedId}`)
    if (response.success && response.data) {
      response.data = this.normalizeFeedDetailResponse(response.data)
    }
    return response
  }

  async getFeeds(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const params = {
      ...this.removeEmptyParams(validatedCondition),
      ...this.removeEmptyParams(validatedPageable)
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

  async getHotFeeds(pageable = {}) {
    const validatedPageable = this.validatePageable(pageable)
    const response = await this.get('/feeds/hot', this.removeEmptyParams(validatedPageable))
    if (response.success && response.data) {
      if (response.data.content) {
        response.data.content = this.normalizeHotFeedResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        response.data = this.normalizeHotFeedResponse(response.data)
      }
    }
    return response
  }

  async getFeedsWithCursor(searchCondition = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const response = await this.get('/feeds/scroll', this.removeEmptyParams(validatedCondition))
    if (response.success && response.data?.feeds) {
      response.data.feeds = this.normalizeFeedListResponse(response.data.feeds)
    }
    return response
  }

  async getFollowingFeeds(searchCondition = {}) {
    const params = {
      cursor: searchCondition.cursor || null,
      size: Math.min(100, Math.max(1, searchCondition.size || 20))
    }
    console.log('👥 [FEED_SERVICE] 팔로잉 피드 조회:', params)
    const response = await this.get('/feeds/following', this.removeEmptyParams(params))
    if (response.success && response.data) {
      if (response.data.feeds) {
        response.data.feeds = this.normalizeFeedListResponse(response.data.feeds)
      }
      console.log('✅ [FEED_SERVICE] 팔로잉 피드 조회 완료:', {
        count: response.data.feeds?.length || 0,
        hasNext: response.data.hasNext
      })
    }
    return response
  }

  async getFeedList(searchCondition = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const response = await this.get('/feeds/list', this.removeEmptyParams(validatedCondition))
    if (response.success && response.data) {
      response.data = this.normalizeFeedListResponse(response.data)
    }
    return response
  }

  async updateFeed(feedId, feedData) {
    if (!feedId) throw new Error('피드 ID가 필요합니다.')
    const validation = this.validateUpdateFeedData(feedData)
    if (!validation.isValid) throw new Error(validation.errors.join(', '))
    const requestData = {
      feedId: parseInt(feedId),
      userId: feedData.userId,
      productId: feedData.productId || null,
      productNameCustom: feedData.productNameCustom?.trim() || null,
      categoryId: parseInt(feedData.categoryId),
      review: feedData.review.trim(),
      buyPlace: feedData.buyPlace?.trim() || null,
      buyPrice: feedData.buyPrice || null,
      price: feedData.price || null,
      evaluation: feedData.evaluation?.toUpperCase() || null,
      hashtags: feedData.hashtags || []
    }
    return await this.put(`/feeds/${feedId}`, requestData)
  }

  async deleteFeed(feedId) {
    if (!feedId) throw new Error('피드 ID가 필요합니다.')
    return await this.delete(`/feeds/${feedId}`)
  }

  // ==================== 댓글 CRUD 메서드 ====================

  async getComments(feedId, pageable = {}) {
    if (!feedId) throw new Error('피드 ID가 필요합니다.')
    const validatedPageable = this.validateCommentPageable(pageable)
    const params = this.removeEmptyParams(validatedPageable)
    console.log('💬 [FEED_SERVICE] 댓글 목록 조회:', { feedId, params })
    const response = await this.get(`/feeds/${feedId}/comments`, params)
    if (response.success && response.data) {
      response.data = this.normalizeCommentListResponse(response.data)
      console.log('✅ [FEED_SERVICE] 댓글 조회 완료:', {
        count: response.data.comments?.length || 0,
        totalElements: response.data.totalElements
      })
    }
    return response
  }

  async createComment(feedId, content) {
    if (!feedId) throw new Error('피드 ID가 필요합니다.')
    const validation = this.validateCommentData({ content })
    if (!validation.isValid) throw new Error(validation.errors.join(', '))
    console.log('✍️ [FEED_SERVICE] 댓글 생성:', { feedId, contentLength: content.length })
    const response = await this.post(`/feeds/${feedId}/comments`, { content: content.trim() })
    if (response.success) {
      console.log('✅ [FEED_SERVICE] 댓글 생성 완료')
    }
    return response
  }

  async updateComment(feedId, commentId, content) {
    if (!feedId) throw new Error('피드 ID가 필요합니다.')
    if (!commentId) throw new Error('댓글 ID가 필요합니다.')
    const validation = this.validateCommentData({ content })
    if (!validation.isValid) throw new Error(validation.errors.join(', '))
    console.log('📝 [FEED_SERVICE] 댓글 수정:', { feedId, commentId })
    const response = await this.put(`/feeds/${feedId}/comments/${commentId}`, { content: content.trim() })
    if (response.success) {
      console.log('✅ [FEED_SERVICE] 댓글 수정 완료')
    }
    return response
  }

  async deleteComment(feedId, commentId) {
    if (!feedId) throw new Error('피드 ID가 필요합니다.')
    if (!commentId) throw new Error('댓글 ID가 필요합니다.')
    console.log('🗑️ [FEED_SERVICE] 댓글 삭제:', { feedId, commentId })
    const response = await this.delete(`/feeds/${feedId}/comments/${commentId}`)
    if (response.success) {
      console.log('✅ [FEED_SERVICE] 댓글 삭제 완료')
    }
    return response
  }

  // ==================== 피드 리액션 메서드 ====================

  async toggleFeedReaction(feedId, reactionType) {
    if (!feedId) throw new Error('피드 ID가 필요합니다.')
    const validReactionTypes = ['LIKE', 'HOT']
    const upperType = reactionType.toUpperCase()
    if (!validReactionTypes.includes(upperType)) {
      throw new Error('올바른 리액션 타입을 선택해주세요. (LIKE, HOT)')
    }
    const response = await this.post(`/feeds/${feedId}/reactions?reactionType=${upperType}`)
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        likeCount: response.data.likeCount || 0,
        hotCount: response.data.hotCount || 0
      }
    }
    return response
  }

  async removeFeedReaction(feedId, reactionType) {
    if (!feedId) throw new Error('피드 ID가 필요합니다.')
    const validReactionTypes = ['LIKE', 'HOT']
    const upperType = reactionType.toUpperCase()
    if (!validReactionTypes.includes(upperType)) {
      throw new Error('올바른 리액션 타입을 선택해주세요. (LIKE, HOT)')
    }
    const response = await this.delete(`/feeds/${feedId}/reactions?reactionType=${upperType}`)
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        likeCount: response.data.likeCount || 0,
        hotCount: response.data.hotCount || 0
      }
    }
    return response
  }

  async toggleLike(feedId) { return this.toggleFeedReaction(feedId, 'LIKE') }
  async toggleHot(feedId) { return this.toggleFeedReaction(feedId, 'HOT') }
  async removeLike(feedId) { return this.removeFeedReaction(feedId, 'LIKE') }
  async removeHot(feedId) { return this.removeFeedReaction(feedId, 'HOT') }

  // ==================== 해시태그 메서드 ====================

  async getHotHashtags(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateHashtagSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const params = {
      ...this.removeEmptyParams(validatedCondition),
      ...this.removeEmptyParams(validatedPageable)
    }
    const response = await this.get('/hashtags/hot', params)
    if (response.success && response.data) {
      if (response.data.content) {
        response.data.content = this.normalizeHotHashtagResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        response.data = this.normalizeHotHashtagResponse(response.data)
      }
    }
    return response
  }

  // ==================== 검색 및 필터 메서드 ====================

  async getFeedsByCategory(categoryId, pageable = {}) {
    if (!categoryId) throw new Error('카테고리 ID가 필요합니다.')
    return await this.getFeeds({ categoryId }, pageable)
  }

  async getFeedsByHashtag(hashtag, pageable = {}) {
    if (!hashtag || hashtag.trim().length === 0) throw new Error('해시태그가 필요합니다.')
    return await this.getFeeds({ hashtags: [hashtag] }, pageable)
  }

  async searchFeeds(keyword, searchCondition = {}, pageable = {}) {
    if (!keyword || keyword.trim().length === 0) throw new Error('검색 키워드가 필요합니다.')
    return await this.getFeeds({ ...searchCondition, keyword }, pageable)
  }

  async getFeedsByEvaluation(evaluation, searchCondition = {}, pageable = {}) {
    const validEvaluations = ['BEST', 'GOOD', 'OKAY', 'BAD']
    if (!validEvaluations.includes(evaluation?.toUpperCase())) {
      throw new Error('올바른 평가 타입을 선택해주세요. (BEST, GOOD, OKAY, BAD)')
    }
    return await this.getFeeds({ ...searchCondition, evaluation: evaluation.toUpperCase() }, pageable)
  }

  // ==================== 유틸리티 메서드 ====================

  removeEmptyParams(params) {
    if (!params || typeof params !== 'object') return {}
    const cleaned = {}
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) cleaned[key] = value
        } else {
          cleaned[key] = value
        }
      }
    })
    return cleaned
  }

  // ==================== 피드 정규화 메서드 ====================

  normalizeFeedListResponse(feeds) {
    if (!Array.isArray(feeds)) return []
    return feeds.map(feed => ({
      ...feed,
      userInfo: this.normalizeUserInfo(feed.userInfo),
      thumbnailUrl: feed.thumbnailUrl || null,
      hashtags: feed.hashtags || [],
      feedEvaluation: this.normalizeFeedEvaluation(feed.feedEvaluation),
      likeCount: feed.likeCount || 0,
      hotCount: feed.hotCount || 0,
      commentCount: feed.commentCount || 0,
      viewCount: feed.viewCount || 0,
      userReactions: feed.userReactions || { hasLike: false, hasHot: false }
    }))
  }

  normalizeFeedDetailResponse(feed) {
    if (!feed) return null
    return {
      ...feed,
      userInfo: this.normalizeUserInfo(feed.userInfo),
      product: this.normalizeProduct(feed.product),
      subCategoryDetail: this.normalizeSubCategoryDetail(feed.subCategoryDetail),
      attachmentFiles: feed.attachmentFiles || [],
      hashtags: feed.hashtags || [],
      feedEvaluation: this.normalizeFeedEvaluation(feed.feedEvaluation),
      likeCount: feed.likeCount || 0,
      hotCount: feed.hotCount || 0,
      viewCount: feed.viewCount || 0,
      userReactions: feed.userReactions || { hasLike: false, hasHot: false }
    }
  }

  normalizeUserInfo(userInfo) {
    if (!userInfo) return null
    return {
      userId: userInfo.userId,
      nickname: userInfo.nickname || '알 수 없음',
      email: userInfo.email || '',
      profileImageFile: userInfo.profileImageFile || null,
      role: userInfo.role || 'USER',
      activated: userInfo.activated !== undefined ? userInfo.activated : true,
      fcmToken: userInfo.fcmToken || null
    }
  }

  normalizeProduct(product) {
    if (!product) return null
    return {
      id: product.id,
      name: product.name || '상품명 없음',
      brand: product.brand || '',
      price: product.price || '0',
      thumbnailDto: product.thumbnailDto || null
    }
  }

  normalizeSubCategoryDetail(subCategoryDetail) {
    if (!subCategoryDetail) return null
    return {
      categoryId: subCategoryDetail.categoryId,
      subCategoryId: subCategoryDetail.subCategoryId,
      categoryName: subCategoryDetail.categoryName || '',
      subCategoryName: subCategoryDetail.subCategoryName || ''
    }
  }

  normalizeHotFeedResponse(feeds) {
    if (!Array.isArray(feeds)) return []
    return feeds.map(feed => ({
      feedId: feed.feedId,
      productName: feed.productName || '상품명 없음',
      reviewSummary: feed.reviewSummary || '',
      hotFeedThumbnailDto: feed.hotFeedThumbnailDto || null,
      likeCount: feed.likeCount || 0,
      hotCount: feed.hotCount || 0,
      viewCount: feed.viewCount || 0,
      hotScore: feed.hotScore || 0
    }))
  }

  normalizeHotHashtagResponse(hashtags) {
    if (!Array.isArray(hashtags)) return []
    return hashtags.map(hashtag => ({
      id: hashtag.id,
      name: hashtag.name,
      usageCount: hashtag.usageCount || 0
    }))
  }

  normalizeFeedEvaluation(evaluation) {
    if (!evaluation) return null
    if (typeof evaluation === 'string') return evaluation
    if (evaluation.code) return evaluation.code
    return null
  }

  // ==================== 댓글 정규화 메서드 ====================

  normalizeCommentListResponse(data) {
    if (!data) return { comments: [], page: 0, size: 20, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false }

    // API 응답이 content 배열을 사용하는 경우 처리
    const commentArray = data.content || data.comments || []

    return {
      comments: Array.isArray(commentArray) ? commentArray.map(comment => this.normalizeCommentItem(comment)) : [],
      page: data.pageable?.pageNumber ?? data.page ?? 0,
      size: data.pageable?.pageSize ?? data.size ?? 20,
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      hasNext: !data.last,  // last가 true면 hasNext는 false
      hasPrevious: !data.first  // first가 true면 hasPrevious는 false
    }
  }

  normalizeCommentItem(comment) {
    if (!comment) return null
    return {
      commentId: comment.commentId,
      creatorId: comment.creatorId,
      creatorNickname: comment.creatorNickname || '알 수 없음',
      creatorProfileUrl: comment.creatorProfileUrl || null,
      content: comment.content || '',
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }
  }

  // ==================== 검증 메서드 ====================

  validateFeedData(feedData) {
    const errors = []
    if (!feedData.userId) errors.push('사용자 ID는 필수입니다.')
    if (!feedData.productId && (!feedData.productNameCustom || feedData.productNameCustom.trim().length === 0)) {
      errors.push('상품을 선택하거나 상품명을 입력해주세요.')
    }
    if (feedData.productNameCustom && feedData.productNameCustom.length > 200) {
      errors.push('상품명은 200자 이하여야 합니다.')
    }
    if (!feedData.subCategoryId) errors.push('카테고리는 필수입니다.')
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
    if (feedData.evaluation) {
      const validEvaluations = ['BEST', 'GOOD', 'OKAY', 'BAD']
      if (!validEvaluations.includes(feedData.evaluation.toUpperCase())) {
        errors.push('올바른 평가를 선택해주세요.')
      }
    }
    if (!feedData.thumbnailAttachmentInfo) errors.push('대표 이미지는 필수입니다.')
    if (feedData.attachmentFileInfos && feedData.attachmentFileInfos.length > 10) {
      errors.push('상세 이미지는 최대 10개까지 업로드 가능합니다.')
    }
    if (feedData.hashtags && feedData.hashtags.length > 20) {
      errors.push('해시태그는 최대 20개까지 등록 가능합니다.')
    }
    if (feedData.hashtags) {
      const invalidHashtags = feedData.hashtags.filter(tag => tag.length > 50)
      if (invalidHashtags.length > 0) errors.push('각 해시태그는 50자 이하여야 합니다.')
    }
    return { isValid: errors.length === 0, errors }
  }

  validateUpdateFeedData(feedData) {
    const errors = []
    if (!feedData.userId) errors.push('사용자 ID는 필수입니다.')
    if (!feedData.productId && (!feedData.productNameCustom || feedData.productNameCustom.trim().length === 0)) {
      errors.push('상품을 선택하거나 상품명을 입력해주세요.')
    }
    if (feedData.productNameCustom && feedData.productNameCustom.length > 200) {
      errors.push('상품명은 200자 이하여야 합니다.')
    }
    if (!feedData.categoryId) errors.push('카테고리는 필수입니다.')
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
    if (feedData.evaluation) {
      const validEvaluations = ['BEST', 'GOOD', 'OKAY', 'BAD']
      if (!validEvaluations.includes(feedData.evaluation.toUpperCase())) {
        errors.push('올바른 평가를 선택해주세요.')
      }
    }
    if (feedData.hashtags && feedData.hashtags.length > 20) {
      errors.push('해시태그는 최대 20개까지 등록 가능합니다.')
    }
    if (feedData.hashtags) {
      const invalidHashtags = feedData.hashtags.filter(tag => tag.length > 50)
      if (invalidHashtags.length > 0) errors.push('각 해시태그는 50자 이하여야 합니다.')
    }
    return { isValid: errors.length === 0, errors }
  }

  validateCommentData(commentData) {
    const errors = []
    if (!commentData.content || commentData.content.trim().length === 0) {
      errors.push('댓글 내용을 입력해주세요.')
    } else if (commentData.content.length > 200) {
      errors.push('댓글은 200자 이하로 작성해주세요.')
    }
    return { isValid: errors.length === 0, errors }
  }

  validateSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') return {}
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
    if (validated.evaluation) {
      const validEvaluations = ['BEST', 'GOOD', 'OKAY', 'BAD']
      if (validEvaluations.includes(validated.evaluation.toUpperCase())) {
        validated.evaluation = validated.evaluation.toUpperCase()
      } else {
        delete validated.evaluation
      }
    }
    if (validated.isActive !== undefined && validated.isActive !== null) {
      validated.isActive = Boolean(validated.isActive)
    }
    if (validated.cursor && isNaN(parseInt(validated.cursor))) {
      delete validated.cursor
    } else if (validated.cursor) {
      validated.cursor = parseInt(validated.cursor)
    }
    if (validated.size && isNaN(parseInt(validated.size))) {
      delete validated.size
    } else if (validated.size) {
      validated.size = Math.min(100, Math.max(1, parseInt(validated.size)))
    }
    return validated
  }

  validateHashtagSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') return {}
    const validated = { ...searchCondition }
    if (validated.keyword && validated.keyword.length > 50) {
      validated.keyword = validated.keyword.substring(0, 50)
    }
    if (validated.minUsageCount !== undefined && validated.minUsageCount !== null) {
      validated.minUsageCount = Math.max(0, parseInt(validated.minUsageCount) || 0)
    }
    if (validated.categoryId && isNaN(parseInt(validated.categoryId))) {
      delete validated.categoryId
    } else if (validated.categoryId) {
      validated.categoryId = parseInt(validated.categoryId)
    }
    return validated
  }

  validatePageable(pageable) {
    if (!pageable || typeof pageable !== 'object') {
      return { page: 0, size: 20, sort: 'createdAt,DESC' }
    }
    const validSorts = [
      'createdAt,DESC', 'createdAt,ASC',
      'viewCount,DESC', 'viewCount,ASC',
      'likeCount,DESC', 'hotCount,DESC',
      'usageCount,DESC', 'usageCount,ASC'
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

  validateCommentPageable(pageable) {
    if (!pageable || typeof pageable !== 'object') {
      return { page: 0, size: 20 }
    }
    return {
      page: Math.max(0, parseInt(pageable.page) || 0),
      size: Math.min(100, Math.max(1, parseInt(pageable.size) || 20))
    }
  }
}

// ==================== 싱글톤 인스턴스 ====================

export const feedService = new FeedService()
export default feedService

// ==================== Vue Composables ====================

export function useFeed() {
  const service = new FeedService()
  return {
    // 피드 CRUD
    createFeedWithFiles: (data, thumbnail, files) => service.createFeedWithFiles(data, thumbnail, files),
    createFeed: (data) => service.createFeed(data),
    getFeed: (id) => service.getFeed(id),
    getFeeds: (condition, pageable) => service.getFeeds(condition, pageable),
    getHotFeeds: (pageable) => service.getHotFeeds(pageable),
    getFeedsWithCursor: (condition) => service.getFeedsWithCursor(condition),
    getFollowingFeeds: (condition) => service.getFollowingFeeds(condition),
    getFeedList: (condition) => service.getFeedList(condition),
    updateFeed: (id, data) => service.updateFeed(id, data),
    deleteFeed: (id) => service.deleteFeed(id),
    // 댓글
    getComments: (feedId, pageable) => service.getComments(feedId, pageable),
    createComment: (feedId, content) => service.createComment(feedId, content),
    updateComment: (feedId, commentId, content) => service.updateComment(feedId, commentId, content),
    deleteComment: (feedId, commentId) => service.deleteComment(feedId, commentId),
    // 리액션
    toggleLike: (id) => service.toggleLike(id),
    toggleHot: (id) => service.toggleHot(id),
    removeLike: (id) => service.removeLike(id),
    removeHot: (id) => service.removeHot(id),
    toggleReaction: (id, type) => service.toggleFeedReaction(id, type),
    removeReaction: (id, type) => service.removeFeedReaction(id, type),
    // 검색/필터
    searchFeeds: (keyword, condition, pageable) => service.searchFeeds(keyword, condition, pageable),
    getFeedsByCategory: (categoryId, pageable) => service.getFeedsByCategory(categoryId, pageable),
    getFeedsByHashtag: (hashtag, pageable) => service.getFeedsByHashtag(hashtag, pageable),
    getFeedsByEvaluation: (evaluation, condition, pageable) => service.getFeedsByEvaluation(evaluation, condition, pageable),
    // 해시태그
    getHotHashtags: (condition, pageable) => service.getHotHashtags(condition, pageable),
    // 유틸리티
    convertToAttachmentInfo: (response) => service.convertToAttachmentInfo(response)
  }
}

// ==================== 유틸리티 함수 ====================

export const feedUtils = {
  formatCount(count) {
    if (!count || count === 0) return '0'
    const num = parseInt(count)
    if (num >= 10000) return Math.floor(num / 10000) + '만+'
    if (num >= 1000) return Math.floor(num / 1000) + 'k'
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
  formatCommentDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (seconds < 60) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    if (days < 30) return `${Math.floor(days / 7)}주 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  },
  truncateComment(content, maxLength = 100) {
    if (!content) return ''
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  },
  formatCommentCount(count) {
    if (!count || count === 0) return '댓글 작성'
    const num = parseInt(count)
    if (num >= 1000) return `댓글 ${Math.floor(num / 1000)}k+`
    return `댓글 ${num}개`
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
    return hashtagString.split(/[,\s]+/).map(tag => tag.replace('#', '').trim()).filter(tag => tag.length > 0)
  },
  getEvaluationLabel(evaluation) {
    const code = typeof evaluation === 'string' ? evaluation : evaluation?.code
    const labels = { 'BEST': '강추', 'GOOD': '추천', 'OKAY': '괜찮음', 'BAD': '비추천' }
    return labels[code] || ''
  },
  getEvaluationColor(evaluation) {
    const code = typeof evaluation === 'string' ? evaluation : evaluation?.code
    const colors = { 'BEST': '#F97316', 'GOOD': '#10B981', 'OKAY': '#3B82F6', 'BAD': '#EF4444' }
    return colors[code] || '#64748B'
  },
  getEvaluationIcon(evaluation) {
    const code = typeof evaluation === 'string' ? evaluation : evaluation?.code
    const icons = { 'BEST': '🔥', 'GOOD': '👍', 'OKAY': '👌', 'BAD': '👎' }
    return icons[code] || ''
  },
  formatHotScore(score) {
    if (!score || score === 0) return '0.0'
    return parseFloat(score).toFixed(1)
  },
  formatUsageCount(count) {
    if (!count || count === 0) return '0회'
    const num = parseInt(count)
    if (num >= 10000) return Math.floor(num / 10000) + '만+'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString() + '회'
  },
  hashtagsToString(hashtags) {
    if (!Array.isArray(hashtags) || hashtags.length === 0) return ''
    return hashtags.map(tag => this.formatHashtag(tag)).join(' ')
  },
  isValidHashtag(tag) {
    if (!tag || typeof tag !== 'string') return false
    const cleanTag = tag.replace('#', '').trim()
    return cleanTag.length > 0 && cleanTag.length <= 50
  },
  filterHashtags(hashtags) {
    if (!Array.isArray(hashtags)) return []
    const uniqueTags = [...new Set(hashtags)]
    return uniqueTags.map(tag => tag.replace('#', '').trim()).filter(tag => this.isValidHashtag(tag)).slice(0, 20)
  }
}