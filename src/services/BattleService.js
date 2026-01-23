// services/BattleService.js

import { BaseApiService } from './BaseApiService.js'
import { fileService } from './FileService.js'
import { ENV, getServiceUrl } from '@/config/env.js'

class BattleService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('CONTENT')
    super(baseURL, 'BATTLE')
    console.log(`⚔️ [BATTLE] Content Server URL: ${this.baseURL}`)
    console.log(`🌍 [BATTLE] Environment: ${ENV.MODE}`)
  }

  // ==================== 배틀 CRUD 메서드 ====================

  /**
   * 배틀 생성 권한 체크
   * GET /api/battles/creation/validation
   */
  async validateCreation() {
    console.log('🔍 [BATTLE_SERVICE] 배틀 생성 권한 체크')
    return await this.get('/battles/creation/validation')
  }

  async createBattleWithFiles(battleData, thumbnailFile) {
    console.log('🚀 [BATTLE_SERVICE] 배틀 생성 프로세스 시작')
    console.log('📝 배틀 데이터:', battleData)
    console.log('🖼️ 대표 이미지:', thumbnailFile?.name)

    try {
      console.log('1️⃣ 대표 이미지 업로드 중...')
      const thumbnailResponse = await fileService.uploadFiles(
          thumbnailFile,
          { fileCode: 'BATTLE' }
      )

      const thumbnailInfo = this.convertToAttachmentInfo(thumbnailResponse.data)
      console.log('✅ 대표 이미지 업로드 완료:', thumbnailInfo)

      console.log('2️⃣ 배틀 생성 요청 중...')
      const battleCreateData = {
        ...battleData,
        thumbnailAttachmentInfo: thumbnailInfo
      }

      console.log('📤 최종 배틀 생성 데이터:', JSON.stringify(battleCreateData, null, 2))
      return await this.createBattle(battleCreateData)

    } catch (error) {
      console.error('❌ [BATTLE_SERVICE] 배틀 생성 실패:', error)
      throw error
    }
  }

  /**
   * 파일 업로드 응답을 AttachmentInfo로 변환
   */
  convertToAttachmentInfo(fileResponse) {
    if (!fileResponse) {
      throw new Error('파일 응답이 없습니다.')
    }

    console.log('🔄 파일 응답 변환:', fileResponse)

    if (fileResponse.fileId && fileResponse.storedPath) {
      console.log('✅ 이미 변환된 AttachmentInfo:', fileResponse)
      return fileResponse
    }

    if (!fileResponse.id || !fileResponse.fileUrl) {
      console.error('❌ 잘못된 파일 응답 구조:', fileResponse)
      throw new Error('파일 응답 형식이 올바르지 않습니다.')
    }

    const attachmentInfo = {
      fileId: fileResponse.id,
      storedPath: fileResponse.fileUrl,
      originName: fileResponse.orgFileNm,
      fileSize: fileResponse.fileSize,
      contentType: `image/${fileResponse.fileExt}`,
      fileExplain: fileResponse.fileExplain || 'BATTLE 대표이미지'
    }

    console.log('✅ 변환된 AttachmentInfo:', attachmentInfo)
    return attachmentInfo
  }

  /**
   * 배틀 생성
   * POST /api/battles
   */
  async createBattle(battleData) {
    console.log('🚀 [BATTLE_SERVICE] 배틀 생성 요청 데이터:', JSON.stringify(battleData, null, 2))

    const validation = this.validateBattleData(battleData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      title: battleData.title.trim(),
      description: battleData.description?.trim() || null,
      subCategoryId: parseInt(battleData.subCategoryId),
      itemAddPermissionType: battleData.itemAddPermissionType?.toUpperCase() || 'CREATOR_ONLY',
      startDate: battleData.startDate,
      endDate: battleData.endDate,
      participationStartDate: battleData.participationStartDate,
      voteType: battleData.voteType?.toUpperCase() || 'SINGLE',
      items: battleData.items || [],
      thumbnailAttachmentInfo: battleData.thumbnailAttachmentInfo
    }

    console.log('📤 [BATTLE_SERVICE] 최종 전송 데이터:', JSON.stringify(requestData, null, 2))
    return await this.post('/battles', requestData)
  }

  /**
   * 배틀 목록 조회
   * GET /api/battles
   */
  async getBattles(searchCondition = {}, pageable = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    const validatedPageable = this.validatePageable(pageable)
    const cleanedCondition = this.removeEmptyParams(validatedCondition)
    const cleanedPageable = this.removeEmptyParams(validatedPageable)

    const params = {
      ...cleanedCondition,
      ...cleanedPageable
    }

    const response = await this.get('/battles', params)

    if (response.success && response.data) {
      if (response.data.content) {
        response.data.content = this.normalizeBattleListResponse(response.data.content)
      } else if (Array.isArray(response.data)) {
        response.data = this.normalizeBattleListResponse(response.data)
      }
    }

    return response
  }

  /**
   * HOT 배틀 목록 조회
   * GET /api/battles/hot
   */
  async getHotBattleList() {
    console.log('🔥 [BATTLE_SERVICE] HOT 배틀 목록 조회')

    const response = await this.get('/battles/hot')

    if (response.success && response.data) {
      response.data = this.normalizeHotBattleListResponse(response.data)
    }

    return response
  }

  /**
   * 배틀 상세 조회
   * GET /api/battles/{battleId}
   */
  async getBattle(battleId) {
    if (!battleId) {
      throw new Error('배틀 ID가 필요합니다.')
    }

    const response = await this.get(`/battles/${battleId}`)

    if (response.success && response.data) {
      response.data = this.normalizeBattleDetailResponse(response.data)
    }

    return response
  }

  // ==================== 배틀 아이템 메서드 ====================

  /**
   * 배틀 아이템 추가
   * POST /api/battles/{battleId}/items
   */
  async addBattleItems(battleId, itemsData) {
    if (!battleId) {
      throw new Error('배틀 ID가 필요합니다.')
    }

    const validation = this.validateAddItemsData(itemsData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      items: itemsData.items.map(item => ({
        productId: item.productId || null,
        customName: item.customName?.trim() || null,
        customBrand: item.customBrand?.trim() || null,
        customImageUrl: item.customImageUrl?.trim() || null
      }))
    }

    console.log('📤 [BATTLE_SERVICE] 아이템 추가 요청:', requestData)
    return await this.post(`/battles/${battleId}/items`, requestData)
  }

  /**
   * 배틀 아이템 승인 (검토 중 → 활성)
   * PATCH /api/battles/{battleId}/items/{itemId}/approve
   */
  async approveBattleItem(battleId, itemId) {
    if (!battleId || !itemId) {
      throw new Error('배틀 ID와 아이템 ID가 필요합니다.')
    }

    console.log(`✅ [BATTLE_SERVICE] 아이템 승인: battleId=${battleId}, itemId=${itemId}`)
    return await this.patch(`/battles/${battleId}/items/${itemId}/approve`)
  }

  /**
   * 배틀 아이템 제외 (생성자 전용)
   * PATCH /api/battles/{battleId}/items/{itemId}/exclude
   */
  async excludeBattleItem(battleId, itemId) {
    if (!battleId || !itemId) {
      throw new Error('배틀 ID와 아이템 ID가 필요합니다.')
    }

    console.log(`🚫 [BATTLE_SERVICE] 아이템 제외: battleId=${battleId}, itemId=${itemId}`)
    return await this.patch(`/battles/${battleId}/items/${itemId}/exclude`)
  }

  /**
   * 배틀 아이템 투표
   * POST /api/battles/{battleId}/vote
   */
  async voteBattleItem(battleId, voteData) {
    if (!battleId) {
      throw new Error('배틀 ID가 필요합니다.')
    }

    const validation = this.validateVoteData(voteData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      votes: voteData.votes.map(vote => ({
        itemId: parseInt(vote.itemId),
        rank: parseInt(vote.rank)
      }))
    }

    console.log(`🗳️ [BATTLE_SERVICE] 투표 요청: battleId=${battleId}`, requestData)
    return await this.post(`/battles/${battleId}/items/vote`, requestData)
  }

  /**
   * 배틀 아이템 투표 취소
   * DELETE /api/battles/{battleId}/vote
   */
  async cancelVote(battleId) {
    if (!battleId) {
      throw new Error('배틀 ID가 필요합니다.')
    }

    console.log(`🗑️ [BATTLE_SERVICE] 투표 취소: battleId=${battleId}`)
    return await this.delete(`/battles/${battleId}/vote`)
  }

  /**
   * 배틀 아이템 신고
   * POST /api/battles/{battleId}/items/{itemId}/report
   */
  async reportBattleItem(battleId, itemId, reportData) {
    if (!battleId || !itemId) {
      throw new Error('배틀 ID와 아이템 ID가 필요합니다.')
    }

    const validation = this.validateReportData(reportData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      reason: reportData.reason.trim()
    }

    console.log(`🚨 [BATTLE_SERVICE] 아이템 신고: battleId=${battleId}, itemId=${itemId}`)
    return await this.post(`/battles/${battleId}/items/${itemId}/report`, requestData)
  }

  // ==================== 검색 및 필터 메서드 ====================

  /**
   * 카테고리별 배틀 조회
   */
  async getBattlesByCategory(subCategoryId, pageable = {}) {
    if (!subCategoryId) {
      throw new Error('서브 카테고리 ID가 필요합니다.')
    }

    return await this.getBattles({ subCategoryId }, pageable)
  }

  /**
   * 상태별 배틀 조회
   */
  async getBattlesByStatus(status, searchCondition = {}, pageable = {}) {
    const validStatuses = ['NORMAL', 'SUSPENDED', 'EARLY_CLOSED']
    if (!validStatuses.includes(status?.toUpperCase())) {
      throw new Error('올바른 배틀 상태를 선택해주세요. (NORMAL, SUSPENDED, EARLY_CLOSED)')
    }

    return await this.getBattles({
      ...searchCondition,
      status: status.toUpperCase()
    }, pageable)
  }

  /**
   * 키워드 검색
   */
  async searchBattles(keyword, searchCondition = {}, pageable = {}) {
    if (!keyword || keyword.trim().length === 0) {
      throw new Error('검색 키워드가 필요합니다.')
    }

    return await this.getBattles({ ...searchCondition, keyword }, pageable)
  }

  /**
   * 생성자별 배틀 조회
   */
  async getBattlesByCreator(creatorId, pageable = {}) {
    if (!creatorId) {
      throw new Error('생성자 ID가 필요합니다.')
    }

    return await this.getBattles({ creatorId }, pageable)
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
   * 배틀 목록 응답 정규화
   */
  normalizeBattleListResponse(battles) {
    if (!Array.isArray(battles)) return []

    return battles.map(battle => ({
      ...battle,
      creatorUserInfo: this.normalizeUserInfo(battle.creatorUserInfo),
      subCategoryDetail: this.normalizeSubCategoryDetail(battle.subCategoryDetail),
      thumbnailDto: battle.thumbnailDto || null,
      topItemImages: battle.topItemImages || [],
      totalParticipants: battle.totalParticipants || 0,
      totalVotes: battle.totalVotes || 0,
      totalViews: battle.totalViews || 0
    }))
  }

  /**
   * HOT 배틀 목록 응답 정규화
   */
  normalizeHotBattleListResponse(battles) {
    if (!Array.isArray(battles)) return []

    return battles.map(battle => ({
      ...battle,
      thumbnailDto: battle.thumbnailDto || null,
      topItemImages: battle.topItemImages || [],
      totalParticipants: battle.totalParticipants || 0,
      totalVotes: battle.totalVotes || 0,
      totalViews: battle.totalViews || 0
    }))
  }

  /**
   * 배틀 상세 응답 정규화
   */
  normalizeBattleDetailResponse(battle) {
    if (!battle) return null

    return {
      ...battle,
      creatorUserInfo: this.normalizeUserInfo(battle.creatorUserInfo),
      subCategoryDetail: this.normalizeSubCategoryDetail(battle.subCategoryDetail),
      items: battle.items ? this.normalizeBattleItemsResponse(battle.items) : [],
      totalParticipants: battle.totalParticipants || 0,
      totalVotes: battle.totalVotes || 0,
      totalViews: battle.totalViews || 0
    }
  }

  /**
   * 배틀 아이템 목록 응답 정규화
   */
  normalizeBattleItemsResponse(items) {
    if (!Array.isArray(items)) return []

    return items.map(item => ({
      ...item,
      battleItemProduct: this.normalizeBattleItemProduct(item.battleItemProduct),
      voteCount: item.voteCount || 0,
      votePercentage: item.votePercentage || 0,
      totalScore: item.totalScore || 0,
      rank: item.rank || null,
      reportCount: item.reportCount || 0,
      userBattleVote: item.userBattleVote || null,
      status: item.status
    }))
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
   * 배틀 아이템 상품 정보 정규화
   */
  normalizeBattleItemProduct(product) {
    if (!product) return null

    return {
      id: product.id,
      name: product.name || '상품명 없음',
      brand: product.brand || '',
      price: product.price || '0',
      thumbnailDto: product.thumbnailDto || null
    }
  }

  // ==================== 검증 메서드 ====================

  /**
   * 배틀 생성 데이터 검증
   */
  validateBattleData(battleData) {
    const errors = []

    if (!battleData.title || battleData.title.trim().length === 0) {
      errors.push('배틀 제목을 입력해주세요.')
    }

    if (!battleData.subCategoryId) {
      errors.push('서브 카테고리를 선택해주세요.')
    }

    if (!battleData.itemAddPermissionType) {
      errors.push('아이템 추가 권한 타입을 선택해주세요.')
    }

    if (!battleData.startDate) {
      errors.push('시작일을 입력해주세요.')
    }

    if (!battleData.endDate) {
      errors.push('종료일을 입력해주세요.')
    }

    if (!battleData.participationStartDate) {
      errors.push('참여 시작일을 입력해주세요.')
    }

    if (battleData.startDate && battleData.endDate) {
      if (new Date(battleData.startDate) >= new Date(battleData.endDate)) {
        errors.push('종료일은 시작일보다 이후여야 합니다.')
      }
    }

    if (!battleData.voteType) {
      errors.push('투표 방식을 선택해주세요.')
    }

    if (!battleData.items || !Array.isArray(battleData.items)) {
      errors.push('아이템 목록이 필요합니다.')
    } else if (battleData.items.length < 2 || battleData.items.length > 20) {
      errors.push('아이템은 2~20개 사이여야 합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 아이템 추가 데이터 검증
   */
  validateAddItemsData(itemsData) {
    const errors = []

    if (!itemsData.items || !Array.isArray(itemsData.items)) {
      errors.push('추가할 아이템을 선택해주세요.')
    } else if (itemsData.items.length < 1 || itemsData.items.length > 3) {
      errors.push('한 번에 1~3개까지 추가 가능합니다.')
    }

    if (itemsData.items) {
      itemsData.items.forEach((item, index) => {
        if (!item.productId && !item.customName) {
          errors.push(`아이템 ${index + 1}: 제품 ID 또는 커스텀 제품명이 필요합니다.`)
        }

        if (item.customName && item.customName.length > 30) {
          errors.push(`아이템 ${index + 1}: 제품명은 30자 이내여야 합니다.`)
        }

        if (item.customBrand && item.customBrand.length > 20) {
          errors.push(`아이템 ${index + 1}: 브랜드명은 20자 이내여야 합니다.`)
        }

        if (item.customImageUrl && item.customImageUrl.length > 500) {
          errors.push(`아이템 ${index + 1}: 이미지 URL은 500자 이내여야 합니다.`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 투표 데이터 검증
   */
  validateVoteData(voteData) {
    const errors = []

    if (!voteData.votes || !Array.isArray(voteData.votes)) {
      errors.push('투표할 아이템을 선택해주세요.')
    } else if (voteData.votes.length < 1 || voteData.votes.length > 3) {
      errors.push('투표는 1~3개까지 가능합니다.')
    }

    if (voteData.votes) {
      voteData.votes.forEach((vote, index) => {
        if (!vote.itemId) {
          errors.push(`투표 ${index + 1}: 아이템을 선택해주세요.`)
        }

        if (!vote.rank) {
          errors.push(`투표 ${index + 1}: 순위를 선택해주세요.`)
        } else if (vote.rank < 1 || vote.rank > 3) {
          errors.push(`투표 ${index + 1}: 순위는 1~3 사이여야 합니다.`)
        }
      })

      const ranks = voteData.votes.map(v => v.rank)
      const uniqueRanks = new Set(ranks)
      if (ranks.length !== uniqueRanks.size) {
        errors.push('순위는 중복될 수 없습니다.')
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 신고 데이터 검증
   */
  validateReportData(reportData) {
    const errors = []

    if (!reportData.reason || reportData.reason.trim().length === 0) {
      errors.push('신고 사유를 입력해주세요.')
    } else if (reportData.reason.length < 10 || reportData.reason.length > 200) {
      errors.push('신고 사유는 10~200자 사이여야 합니다.')
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

    if (validated.subCategoryId && isNaN(parseInt(validated.subCategoryId))) {
      delete validated.subCategoryId
    } else if (validated.subCategoryId) {
      validated.subCategoryId = parseInt(validated.subCategoryId)
    }

    if (validated.status) {
      const validStatuses = ['NORMAL', 'SUSPENDED', 'EARLY_CLOSED']
      if (validStatuses.includes(validated.status.toUpperCase())) {
        validated.status = validated.status.toUpperCase()
      } else {
        delete validated.status
      }
    }

    // isActive 필드 검증 추가
    if (validated.isActive !== undefined) {
      validated.isActive = Boolean(validated.isActive)
    }

    if (validated.creatorId && isNaN(parseInt(validated.creatorId))) {
      delete validated.creatorId
    } else if (validated.creatorId) {
      validated.creatorId = parseInt(validated.creatorId)
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
      'updatedAt,DESC', 'updatedAt,ASC',
      'totalVotes,DESC', 'totalVotes,ASC',
      'totalViews,DESC', 'totalViews,ASC',
      'totalParticipants,DESC', 'totalParticipants,ASC',
      'startDate,DESC', 'startDate,ASC',
      'endDate,DESC', 'endDate,ASC'
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

export const battleService = new BattleService()
export default battleService

// ==================== Vue Composables ====================

export function useBattle() {
  const service = new BattleService()

  return {
    // 배틀 생성 및 권한
    validateCreation: () => service.validateCreation(),
    createBattleWithFiles: (data, thumbnail) => service.createBattleWithFiles(data, thumbnail),
    createBattle: (data) => service.createBattle(data),

    // 배틀 조회
    getBattle: (id) => service.getBattle(id),
    getBattles: (condition, pageable) => service.getBattles(condition, pageable),
    getHotBattleList: () => service.getHotBattleList(),
    getBattlesByCategory: (subCategoryId, pageable) => service.getBattlesByCategory(subCategoryId, pageable),
    getBattlesByStatus: (status, condition, pageable) => service.getBattlesByStatus(status, condition, pageable),
    getBattlesByCreator: (creatorId, pageable) => service.getBattlesByCreator(creatorId, pageable),
    searchBattles: (keyword, condition, pageable) => service.searchBattles(keyword, condition, pageable),

    // 배틀 아이템
    addBattleItems: (battleId, data) => service.addBattleItems(battleId, data),
    approveBattleItem: (battleId, itemId) => service.approveBattleItem(battleId, itemId),
    excludeBattleItem: (battleId, itemId) => service.excludeBattleItem(battleId, itemId),
    voteBattleItem: (battleId, data) => service.voteBattleItem(battleId, data),
    cancelVote: (battleId) => service.cancelVote(battleId),
    reportBattleItem: (battleId, itemId, data) => service.reportBattleItem(battleId, itemId, data),

    // 유틸리티
    convertToAttachmentInfo: (response) => service.convertToAttachmentInfo(response)
  }
}

// ==================== 유틸리티 함수 ====================

export const battleUtils = {
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

  formatDateTime(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  getBattleStatusLabel(status) {
    const labels = {
      'DRAFT': '임시저장',
      'ACTIVE': '진행중',
      'CLOSED': '종료',
      'EARLY_CLOSED': '조기종료'
    }
    return labels[status] || ''
  },

  getBattleStatusColor(status) {
    const colors = {
      'DRAFT': '#6B7280',
      'ACTIVE': '#10B981',
      'CLOSED': '#F59E0B',
      'EARLY_CLOSED': '#64748B'
    }
    return colors[status] || '#64748B'
  },

  getItemAddPermissionLabel(type) {
    const labels = {
      'CREATOR_ONLY': '생성자만 추가 가능',
      'PUBLIC_FREE': '누구나 추가 가능',
      'PUBLIC_APPROVAL': '승인 후 추가 가능'
    }
    return labels[type] || ''
  },

  getItemAddPermissionDescription(type) {
    const descriptions = {
      'CREATOR_ONLY': '배틀 생성자만 아이템을 추가할 수 있습니다',
      'PUBLIC_FREE': '모든 사용자가 자유롭게 아이템을 추가할 수 있습니다',
      'PUBLIC_APPROVAL': '아이템 등록 후 생성자의 승인을 받아야 합니다'
    }
    return descriptions[type] || ''
  },

  getVoteTypeLabel(type) {
    const labels = {
      'SINGLE': '1인 1표',
      'MULTIPLE': '1인 3표'
    }
    return labels[type] || ''
  },

  getItemStatusLabel(status) {
    const labels = {
      'ACTIVE': '활성',
      'UNDER_REVIEW': '검토중',
      'EXCLUDED': '제외됨'
    }
    return labels[status] || ''
  },

  getItemStatusColor(status) {
    const colors = {
      'ACTIVE': '#10B981',
      'UNDER_REVIEW': '#F59E0B',
      'EXCLUDED': '#64748B'
    }
    return colors[status] || '#64748B'
  },

  calculateVotePercentage(voteCount, totalVotes) {
    if (!totalVotes || totalVotes === 0) return 0
    return Math.round((voteCount / totalVotes) * 100 * 10) / 10
  },

  formatVotePercentage(percentage) {
    if (!percentage || percentage === 0) return '0%'
    return `${percentage.toFixed(1)}%`
  },

  getRankScore(rank) {
    const scores = {
      1: 3,
      2: 2,
      3: 1
    }
    return scores[rank] || 0
  },

  getRankLabel(rank) {
    const labels = {
      1: '1위',
      2: '2위',
      3: '3위'
    }
    return labels[rank] || ''
  },

  getRankBadgeColor(rank) {
    const colors = {
      1: '#FFD700',
      2: '#C0C0C0',
      3: '#CD7F32'
    }
    return colors[rank] || '#64748B'
  },

  isActive(battle) {
    if (!battle) return false
    return battle.status === 'ACTIVE'
  },

  isEnded(battle) {
    if (!battle) return false
    return battle.status === 'CLOSED' || battle.status === 'EARLY_CLOSED'
  },

  canAddItem(battle, userId) {
    if (!battle || !userId) return false
    if (battle.status !== 'ACTIVE') return false
    if (battle.itemAddPermissionType === 'CREATOR_ONLY') {
      return battle.creatorUserInfo?.userId === userId
    }
    return true
  },

  canVote(battle) {
    if (!battle) return false
    const now = new Date()
    const startDate = new Date(battle.participationStartDate)
    const endDate = new Date(battle.endDate)
    return battle.status === 'ACTIVE' && now >= startDate && now <= endDate
  },

  getDaysLeft(endDate) {
    if (!endDate) return 0
    const now = new Date()
    const end = new Date(endDate)
    const diff = end - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  },

  formatDaysLeft(endDate) {
    const days = this.getDaysLeft(endDate)
    if (days < 0) return '종료'
    if (days === 0) return '오늘 마감'
    if (days === 1) return '내일 마감'
    return `${days}일 남음`
  }
}