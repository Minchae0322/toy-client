// services/UserService.js

import { BaseApiService } from './BaseApiService.js'
import { ENV, getServiceUrl } from '@/config/env.js'

class UserService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('AUTH')
    super(baseURL, 'USER')
    console.log(`[USER] AUTH Server URL: ${this.baseURL}`)
    console.log(`[USER] Environment: ${ENV.MODE}`)
  }

  // ==================== 사용자 프로필 메서드 ====================

  /**
   * 사용자 프로필 조회
   * GET /api/user/{userId}/profile
   */
  async getUserProfile(userId) {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    console.log(`🔍 [USER_SERVICE] 프로필 조회: userId=${userId}`)

    const response = await this.get(`/user/${userId}/profile`)

    if (response.success && response.data) {
      response.data = this.normalizeUserProfile(response.data)
      console.log('✅ [USER_SERVICE] 프로필 조회 완료:', response.data)
    }

    return response
  }

  /**
   * 사용자 프로필 수정
   * PUT /api/user/{userId}
   *
   * @param {number} userId - 사용자 ID
   * @param {Object} updateDto - 수정할 프로필 정보
   * @param {string} [updateDto.nickname] - 변경할 닉네임
   * @param {string} [updateDto.description] - 변경할 소개
   * @param {Object} [updateDto.profileImgInfo] - 프로필 이미지 정보
   * @param {number} [updateDto.profileImgInfo.attachmentFileId] - 첨부파일 ID
   */
  async updateUser(userId, updateDto) {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    console.log(`✏️ [USER_SERVICE] 프로필 수정: userId=${userId}`, updateDto)

    const cleanedDto = this.removeEmptyParams({
      nickname: updateDto.nickname,
      description: updateDto.description,
      profileImgInfo: updateDto.profileImgInfo
    })

    const response = await this.put(`/user/${userId}`, cleanedDto)

    if (response.success && response.data) {
      console.log('✅ [USER_SERVICE] 프로필 수정 완료:', response.data)
    }

    return response
  }

  // ==================== 팔로우 메서드 ====================

  /**
   * 팔로우 토글 (팔로우/언팔로우)
   * POST /api/user/{userId}/follow
   */
  async toggleFollow(userId) {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    console.log(`🔄 [USER_SERVICE] 팔로우 토글: userId=${userId}`)

    const response = await this.post(`/user/${userId}/follow`)

    if (response.success && response.data) {
      console.log(`✅ [USER_SERVICE] 팔로우 토글 완료:`, response.data)
    }

    return response
  }

  /**
   * 팔로워 목록 조회 (커서 기반 페이징)
   * GET /api/user/{userId}/followers
   *
   * @param {number} userId - 대상 유저 ID
   * @param {Object} options - 페이징 옵션
   * @param {number} [options.cursor] - 마지막 followId (커서)
   * @param {number} [options.size=20] - 조회 개수
   */
  async getFollowers(userId, { cursor = null, size = 20 } = {}) {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    console.log(`📋 [USER_SERVICE] 팔로워 목록 조회: userId=${userId}, cursor=${cursor}, size=${size}`)

    const params = this.removeEmptyParams({ cursor, size })
    const response = await this.get(`/user/${userId}/followers`, params)

    if (response.success && response.data) {
      response.data = this.normalizeFollowListResponse(response.data, 'followers')
      console.log('✅ [USER_SERVICE] 팔로워 목록 조회 완료:', response.data)
    }

    return response
  }

  /**
   * 팔로잉 목록 조회 (커서 기반 페이징)
   * GET /api/user/{userId}/following
   *
   * @param {number} userId - 대상 유저 ID
   * @param {Object} options - 페이징 옵션
   * @param {number} [options.cursor] - 마지막 followId (커서)
   * @param {number} [options.size=20] - 조회 개수
   */
  async getFollowings(userId, { cursor = null, size = 20 } = {}) {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    console.log(`📋 [USER_SERVICE] 팔로잉 목록 조회: userId=${userId}, cursor=${cursor}, size=${size}`)

    const params = this.removeEmptyParams({ cursor, size })
    const response = await this.get(`/user/${userId}/following`, params)

    if (response.success && response.data) {
      response.data = this.normalizeFollowListResponse(response.data, 'followings')
      console.log('✅ [USER_SERVICE] 팔로잉 목록 조회 완료:', response.data)
    }

    return response
  }

  /**
   * 팔로우 상태 조회
   * GET /api/user/{userId}/follow-status
   */
  async getFollowStatus(userId) {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    console.log(`📊 [USER_SERVICE] 팔로우 상태 조회: userId=${userId}`)

    const response = await this.get(`/user/${userId}/follow-status`)

    if (response.success && response.data) {
      console.log('✅ [USER_SERVICE] 팔로우 상태 조회 완료:', response.data)
    }

    return response
  }

  // ==================== 정규화 메서드 ====================

  /**
   * 사용자 프로필 정규화
   */
  normalizeUserProfile(profile) {
    if (!profile) return null

    return {
      userId: profile.userId,
      nickname: profile.nickname || '알 수 없음',
      description: profile.description || '',
      followerCount: profile.followerCount || 0,
      followingCount: profile.followingCount || 0,
      isFollowing: profile.isFollowing || false,
      profilePicture: this.normalizeAttachmentFile(profile.profilePicture),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }
  }

  /**
   * 팔로우 목록 응답 정규화 (커서 기반 페이징)
   *
   * @param {Object} data - 백엔드 응답 데이터
   * @param {string} type - 'followers' 또는 'followings'
   */
  normalizeFollowListResponse(data, type) {
    if (!data) return null

    const list = data[type] || []

    return {
      [type]: list.map(user => this.normalizeFollowUser(user)),
      totalCount: data.totalCount || 0,
      nextCursor: data.nextCursor || null,
      hasNext: data.hasNext || false
    }
  }

  /**
   * 팔로우 유저 정규화 (백엔드 FollowUserInfo 매핑)
   */
  normalizeFollowUser(user) {
    if (!user) return null

    return {
      userId: user.userId,
      nickname: user.nickname || '알 수 없음',
      profileImageUrl: user.profileImageUrl || null
    }
  }

  /**
   * AttachmentFile 정규화
   */
  normalizeAttachmentFile(file) {
    if (!file) return null

    return {
      id: file.id,
      fileCode: file.fileCode,
      orgFileNm: file.orgFileNm || '',
      storeFileNm: file.storeFileNm || '',
      fileUrl: file.fileUrl || '',
      fileSize: file.fileSize || 0,
      fileExplain: file.fileExplain || '',
      fileExt: file.fileExt || '',
      storageType: file.storageType || 'LOCAL'
    }
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
}

// ==================== 싱글톤 인스턴스 ====================

export const userService = new UserService()
export default userService

// ==================== Vue Composables ====================

export function useUser() {
  const service = new UserService()

  return {
    // 프로필
    getUserProfile: (userId) => service.getUserProfile(userId),
    updateUser: (userId, updateDto) => service.updateUser(userId, updateDto),

    // 팔로우
    toggleFollow: (userId) => service.toggleFollow(userId),
    getFollowers: (userId, options) => service.getFollowers(userId, options),
    getFollowings: (userId, options) => service.getFollowings(userId, options),
    getFollowStatus: (userId) => service.getFollowStatus(userId)
  }
}

// ==================== 유틸리티 함수 ====================

export const userUtils = {
  /**
   * 팔로워/팔로잉 수 포맷팅
   */
  formatFollowCount(count) {
    if (!count || count === 0) return '0'
    const num = parseInt(count)

    if (num >= 10000) {
      return Math.floor(num / 10000) + '만'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }

    return num.toString()
  },

  /**
   * 날짜 포맷팅
   */
  formatDate(dateString) {
    if (!dateString) return ''

    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  /**
   * 가입일 기준 일수 계산
   */
  getDaysSinceJoined(createdAt) {
    if (!createdAt) return 0

    const created = new Date(createdAt)
    const now = new Date()
    const diff = now - created

    return Math.floor(diff / (1000 * 60 * 60 * 24))
  },

  /**
   * 프로필 이미지 URL 가져오기 (기본 이미지 포함)
   */
  getProfileImageUrl(user) {
    if (!user) return '/images/default-profile.png'

    // normalizeFollowUser 결과 처리
    if (user.profileImageUrl) {
      return user.profileImageUrl
    }

    // normalizeUserProfile 결과 처리
    if (user.profilePicture && user.profilePicture.fileUrl) {
      return user.profilePicture.fileUrl
    }

    return '/images/default-profile.png'
  },

  /**
   * 파일 크기 포맷팅
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  },

  /**
   * FileCode 한글 변환
   */
  getFileCodeLabel(fileCode) {
    const labels = {
      'USER_PROFILE': '프로필 이미지',
      'FEED': '피드 이미지',
      'PRODUCT': '상품 이미지',
      'COMMENT': '댓글 이미지',
      'ETC': '기타'
    }
    return labels[fileCode] || fileCode
  },

  /**
   * StorageType 한글 변환
   */
  getStorageTypeLabel(storageType) {
    const labels = {
      'LOCAL': '로컬 저장소',
      'S3': 'AWS S3',
      'GCS': 'Google Cloud Storage'
    }
    return labels[storageType] || storageType
  }
}