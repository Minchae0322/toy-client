// services/FeedService.js

import { BaseApiService } from './BaseApiService.js'
import { fileService } from './FileService.js'
import {ENV, getServiceUrl} from "@/config/env.js";

class FeedService extends BaseApiService {
  constructor() {
    const baseURL = `${getServiceUrl('CONTENT')}/api`

    super(baseURL, 'FEED')
    console.log(`⚔️ [FEED] Content Server URL: ${this.baseURL}`)
    console.log(`🌍 [FEED] Environment: ${ENV.MODE}`)
  }

  // ==================== 피드 CRUD 메서드 ====================

  /**
   * 피드 생성 (파일 배치 업로드)
   */
  /**
   * 피드 생성 (파일 배치 업로드)
   */
  async createFeedWithFiles(feedData, thumbnailFile, additionalFiles = []) {
    console.log('🚀 [FEED_SERVICE] 피드 생성 프로세스 시작')
    console.log('📝 피드 데이터:', feedData)
    console.log('🖼️ 대표 이미지:', thumbnailFile?.name)
    console.log('📎 추가 이미지 개수:', additionalFiles.length)

    try {
      // ⭐ 1. 업로드할 모든 파일 수집
      const thumbnailFiles = thumbnailFile ? [thumbnailFile] : [];
      const allAdditionalFiles = additionalFiles.filter(f => f);

      let thumbnailInfo = null;
      let attachmentFileInfos = [];

      // ⭐ 2. 대표 이미지 배치 업로드 (FEED_THUMBNAIL)
      if (thumbnailFiles.length > 0) {
        console.log('1️⃣ 대표 이미지 배치 업로드 중...');

        // ⭐ fileService 직접 호출
        const thumbnailResponse = await fileService.uploadFiles(
            thumbnailFiles,
            { fileCode: 'FEED' }
        );

        const uploadedData = thumbnailResponse.data;
        const uploadedFile = Array.isArray(uploadedData) ? uploadedData[0] : uploadedData;

        if (uploadedFile) {
          thumbnailInfo = this.convertToAttachmentInfo(uploadedFile);
          console.log('✅ 대표 이미지 업로드 완료:', thumbnailInfo);
        }
      }

      // ⭐ 3. 추가 이미지 배치 업로드 (FEED)
      if (allAdditionalFiles.length > 0) {
        console.log(`2️⃣ ${allAdditionalFiles.length}개 추가 이미지 배치 업로드 중...`);

        // ⭐ fileService 직접 호출
        const additionalResponse = await fileService.uploadFiles(
            allAdditionalFiles,
            { fileCode: 'FEED' }
        );

        const uploadedData = Array.isArray(additionalResponse.data)
            ? additionalResponse.data
            : [additionalResponse.data];

        attachmentFileInfos = uploadedData
        .filter(file => file)
        .map(file => this.convertToAttachmentInfo(file));

        console.log(`✅ 추가 이미지 ${attachmentFileInfos.length}개 업로드 완료`);
      }

      // ⭐ 4. 피드 생성 요청
      console.log('3️⃣ 피드 생성 요청 중...');
      const feedCreateData = {
        ...feedData,
        thumbnailAttachmentInfo: thumbnailInfo,
        attachmentFileInfos: attachmentFileInfos
      };

      console.log('📤 최종 피드 생성 데이터:', JSON.stringify(feedCreateData, null, 2));
      return await this.createFeed(feedCreateData);

    } catch (error) {
      console.error('❌ [FEED_SERVICE] 피드 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 파일 업로드 응답을 AttachmentInfo로 변환
   */
  convertToAttachmentInfo(fileResponse) {
    if (!fileResponse) {
      throw new Error('파일 응답이 없습니다.');
    }

    console.log('🔄 파일 응답 변환:', fileResponse);

    // 이미 변환된 경우
    if (fileResponse.fileId && fileResponse.storedPath) {
      console.log('✅ 이미 변환된 AttachmentInfo:', fileResponse);
      return fileResponse;
    }

    // AttachmentFileResponse 구조 확인
    if (!fileResponse.id || !fileResponse.fileUrl) {
      console.error('❌ 잘못된 파일 응답 구조:', fileResponse);
      throw new Error('파일 응답 형식이 올바르지 않습니다.');
    }

    const attachmentInfo = {
      fileId: fileResponse.id,
      storedPath: fileResponse.fileUrl,
      originName: fileResponse.orgFileNm,
      fileSize: fileResponse.fileSize,
      contentType: `image/${fileResponse.fileExt}`,
      fileExplain: fileResponse.fileExplain || 'FEED 이미지'
    };

    console.log('✅ 변환된 AttachmentInfo:', attachmentInfo);
    return attachmentInfo;
  }

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
      buyPlace: feedData.buyPlace?.trim() || null,
      buyPrice: feedData.buyPrice || null,
      price: feedData.price || null,
      evaluation: feedData.evaluation?.toUpperCase() || null,
      thumbnailAttachmentInfo: feedData.thumbnailAttachmentInfo,
      attachmentFileInfos: feedData.attachmentFileInfos || [],
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

    const response = await this.get(`/feeds/${feedId}`)

    if (response.success && response.data) {
      response.data = this.normalizeFeedDetailResponse(response.data)
    }

    return response
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
   * 핫 피드 목록 조회
   * GET /api/feeds/hot
   */
  async getHotFeeds(pageable = {}) {
    const validatedPageable = this.validatePageable(pageable)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)

    const response = await this.get('/feeds/hot', cleanedPageable)

    if (response.success && response.data) {
      if (response.data.content) {
        response.data.content = this.normalizeHotFeedResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        response.data = this.normalizeHotFeedResponse(response.data)
      }
    }

    return response
  }

  /**
   * 피드 목록 조회 (커서 페이징)
   * GET /api/feeds/scroll
   */
  async getFeedsWithCursor(searchCondition = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)

    const response = await this.get('/feeds/scroll', cleanedCondition)

    if (response.success && response.data) {
      if (response.data.feeds) {
        response.data.feeds = this.normalizeFeedListResponse(response.data.feeds)
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

    const validation = this.validateUpdateFeedData(feedData)
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
      buyPlace: feedData.buyPlace?.trim() || null,
      buyPrice: feedData.buyPrice || null,
      price: feedData.price || null,
      evaluation: feedData.evaluation?.toUpperCase() || null,
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

  // ==================== 피드 리액션 메서드 ====================

  /**
   * 피드 리액션 토글 (좋아요 또는 핫)
   * POST /api/feeds/{feedId}/reactions?reactionType={type}
   */
  async toggleFeedReaction(feedId, reactionType) {
    if (!feedId) {
      throw new Error('피드 ID가 필요합니다.')
    }

    const validReactionTypes = ['LIKE', 'HOT']
    const upperType = reactionType.toUpperCase()

    if (!validReactionTypes.includes(upperType)) {
      throw new Error('올바른 리액션 타입을 선택해주세요. (LIKE, HOT)')
    }

    console.log(`🔄 [FEED_SERVICE] ${upperType} 토글 요청: feedId=${feedId}`)

    const response = await this.post(`/feeds/${feedId}/reactions?reactionType=${upperType}`)

    if (response.success && response.data) {
      response.data = {
        ...response.data,
        likeCount: response.data.likeCount || 0,
        hotCount: response.data.hotCount || 0
      }
      console.log(`✅ [FEED_SERVICE] ${upperType} 토글 완료:`, response.data)
    }

    return response
  }

  /**
   * 특정 타입 리액션 제거
   * DELETE /api/feeds/{feedId}/reactions?reactionType={type}
   */
  async removeFeedReaction(feedId, reactionType) {
    if (!feedId) {
      throw new Error('피드 ID가 필요합니다.')
    }

    const validReactionTypes = ['LIKE', 'HOT']
    const upperType = reactionType.toUpperCase()

    if (!validReactionTypes.includes(upperType)) {
      throw new Error('올바른 리액션 타입을 선택해주세요. (LIKE, HOT)')
    }

    console.log(`🗑️ [FEED_SERVICE] ${upperType} 제거 요청: feedId=${feedId}`)

    const response = await this.delete(`/feeds/${feedId}/reactions?reactionType=${upperType}`)

    if (response.success && response.data) {
      response.data = {
        ...response.data,
        likeCount: response.data.likeCount || 0,
        hotCount: response.data.hotCount || 0
      }
      console.log(`✅ [FEED_SERVICE] ${upperType} 제거 완료:`, response.data)
    }

    return response
  }

  /**
   * 좋아요 토글 (하트 아이콘)
   */
  async toggleLike(feedId) {
    return this.toggleFeedReaction(feedId, 'LIKE')
  }

  /**
   * 핫 토글 (불꽃 아이콘)
   */
  async toggleHot(feedId) {
    return this.toggleFeedReaction(feedId, 'HOT')
  }

  /**
   * 좋아요 제거
   */
  async removeLike(feedId) {
    return this.removeFeedReaction(feedId, 'LIKE')
  }

  /**
   * 핫 제거
   */
  async removeHot(feedId) {
    return this.removeFeedReaction(feedId, 'HOT')
  }

  // ==================== 해시태그 메서드 ====================

  /**
   * 인기 해시태그 조회
   * GET /api/hashtags/hot
   */
  async getHotHashtags(searchCondition = {}, pageable = {}) {
    console.log('🔥 [FEED_SERVICE] 인기 해시태그 조회')

    const validatedCondition = this.validateHashtagSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)

    const params = {
      ...cleanedCondition,
      ...cleanedPageable
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

  /**
   * 카테고리별 피드 조회
   */
  async getFeedsByCategory(categoryId, pageable = {}) {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.')
    }

    return await this.getFeeds({ categoryId }, pageable)
  }

  /**
   * 해시태그별 피드 조회
   */
  async getFeedsByHashtag(hashtag, pageable = {}) {
    if (!hashtag || hashtag.trim().length === 0) {
      throw new Error('해시태그가 필요합니다.')
    }

    return await this.getFeeds({ hashtags: [hashtag] }, pageable)
  }

  /**
   * 키워드 검색
   */
  async searchFeeds(keyword, searchCondition = {}, pageable = {}) {
    if (!keyword || keyword.trim().length === 0) {
      throw new Error('검색 키워드가 필요합니다.')
    }

    return await this.getFeeds({ ...searchCondition, keyword }, pageable)
  }

  /**
   * 평가별 피드 조회
   * @param {string} evaluation - BEST, GOOD, OKAY, BAD
   */
  async getFeedsByEvaluation(evaluation, searchCondition = {}, pageable = {}) {
    const validEvaluations = ['BEST', 'GOOD', 'OKAY', 'BAD']
    if (!validEvaluations.includes(evaluation?.toUpperCase())) {
      throw new Error('올바른 평가 타입을 선택해주세요. (BEST, GOOD, OKAY, BAD)')
    }

    return await this.getFeeds({
      ...searchCondition,
      evaluation: evaluation.toUpperCase()
    }, pageable)
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
      userInfo: this.normalizeUserInfo(feed.userInfo),
      thumbnailUrl: feed.thumbnailUrl || null,
      hashtags: feed.hashtags || [],
      feedEvaluation: this.normalizeFeedEvaluation(feed.feedEvaluation),
      likeCount: feed.likeCount || 0,
      hotCount: feed.hotCount || 0,
      commentCount: feed.commentCount || 0,
      viewCount: feed.viewCount || 0,
      userReactions: feed.userReactions || {
        hasLike: false,
        hasHot: false
      }
    }))
  }

  /**
   * 피드 상세 응답 정규화
   */
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
      userReactions: feed.userReactions || {
        hasLike: false,
        hasHot: false
      }
    }
  }

  /**
   * 사용자 정보 정규화
   */
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

  /**
   * 상품 정보 정규화
   */
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

  /**
   * 카테고리 상세 정보 정규화
   */
  normalizeSubCategoryDetail(subCategoryDetail) {
    if (!subCategoryDetail) return null

    return {
      categoryId: subCategoryDetail.categoryId,
      subCategoryId: subCategoryDetail.subCategoryId,
      categoryName: subCategoryDetail.categoryName || '',
      subCategoryName: subCategoryDetail.subCategoryName || ''
    }
  }

  /**
   * 핫 피드 응답 정규화
   */
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

  /**
   * 인기 해시태그 응답 정규화
   */
  normalizeHotHashtagResponse(hashtags) {
    if (!Array.isArray(hashtags)) return []

    return hashtags.map(hashtag => ({
      id: hashtag.id,
      name: hashtag.name,
      usageCount: hashtag.usageCount || 0
    }))
  }

  /**
   * FeedEvaluation 정규화
   */
  normalizeFeedEvaluation(evaluation) {
    if (!evaluation) return null

    if (typeof evaluation === 'string') {
      return evaluation
    }

    if (evaluation.code) {
      return evaluation.code
    }

    return null
  }

  // ==================== 검증 메서드 ====================

  /**
   * 피드 생성 데이터 검증
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

    if (!feedData.subCategoryId) {
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

    if (feedData.evaluation) {
      const validEvaluations = ['BEST', 'GOOD', 'OKAY', 'BAD']
      if (!validEvaluations.includes(feedData.evaluation.toUpperCase())) {
        errors.push('올바른 평가를 선택해주세요. (강추, 추천, 괜찮음, 비추천)')
      }
    }

    if (!feedData.thumbnailAttachmentInfo) {
      errors.push('대표 이미지는 필수입니다.')
    }

    if (feedData.attachmentFileInfos && feedData.attachmentFileInfos.length > 10) {
      errors.push('상세 이미지는 최대 10개까지 업로드 가능합니다.')
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
   * 피드 수정 데이터 검증
   */
  validateUpdateFeedData(feedData) {
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

    if (!feedData.categoryId) {
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

    if (feedData.evaluation) {
      const validEvaluations = ['BEST', 'GOOD', 'OKAY', 'BAD']
      if (!validEvaluations.includes(feedData.evaluation.toUpperCase())) {
        errors.push('올바른 평가를 선택해주세요. (강추, 추천, 괜찮음, 비추천)')
      }
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

  /**
   * 해시태그 검색 조건 검증
   */
  validateHashtagSearchCondition(searchCondition) {
    if (!searchCondition || typeof searchCondition !== 'object') {
      return {}
    }

    const validated = { ...searchCondition }

    // 키워드 검증
    if (validated.keyword && validated.keyword.length > 50) {
      validated.keyword = validated.keyword.substring(0, 50)
    }

    // 최소 사용 횟수 검증
    if (validated.minUsageCount !== undefined && validated.minUsageCount !== null) {
      validated.minUsageCount = Math.max(0, parseInt(validated.minUsageCount) || 0)
    }

    // 카테고리 ID 검증
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
    getFeedList: (condition) => service.getFeedList(condition),
    updateFeed: (id, data) => service.updateFeed(id, data),
    deleteFeed: (id) => service.deleteFeed(id),

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
  },

  getEvaluationLabel(evaluation) {
    const code = typeof evaluation === 'string' ? evaluation : evaluation?.code

    const labels = {
      'BEST': '강추',
      'GOOD': '추천',
      'OKAY': '괜찮음',
      'BAD': '비추천'
    }
    return labels[code] || ''
  },

  getEvaluationColor(evaluation) {
    const code = typeof evaluation === 'string' ? evaluation : evaluation?.code

    const colors = {
      'BEST': '#F97316',
      'GOOD': '#10B981',
      'OKAY': '#3B82F6',
      'BAD': '#EF4444'
    }
    return colors[code] || '#64748B'
  },

  getEvaluationIcon(evaluation) {
    const code = typeof evaluation === 'string' ? evaluation : evaluation?.code

    const icons = {
      'BEST': '🔥',
      'GOOD': '👍',
      'OKAY': '👌',
      'BAD': '👎'
    }
    return icons[code] || ''
  },

  formatHotScore(score) {
    if (!score || score === 0) return '0.0'
    return parseFloat(score).toFixed(1)
  },

  /**
   * 해시태그 사용 횟수 포맷팅
   */
  formatUsageCount(count) {
    if (!count || count === 0) return '0회'
    const num = parseInt(count)

    if (num >= 10000) {
      return Math.floor(num / 10000) + '만+'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }

    return num.toString() + '회'
  },

  /**
   * 해시태그 배열을 문자열로 변환
   */
  hashtagsToString(hashtags) {
    if (!Array.isArray(hashtags) || hashtags.length === 0) return ''
    return hashtags.map(tag => this.formatHashtag(tag)).join(' ')
  },

  /**
   * 해시태그 유효성 검사
   */
  isValidHashtag(tag) {
    if (!tag || typeof tag !== 'string') return false
    const cleanTag = tag.replace('#', '').trim()
    return cleanTag.length > 0 && cleanTag.length <= 50
  },

  /**
   * 해시태그 배열 필터링 (중복 제거 및 유효성 검사)
   */
  filterHashtags(hashtags) {
    if (!Array.isArray(hashtags)) return []

    const uniqueTags = [...new Set(hashtags)]
    return uniqueTags
    .map(tag => tag.replace('#', '').trim())
    .filter(tag => this.isValidHashtag(tag))
    .slice(0, 20) // 최대 20개
  }
}