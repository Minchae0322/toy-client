// services/AuthService.js
// 인증 관련 API 서비스 (Fetch API 기반)

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'

/**
 * 인증 서비스
 * Auth Server (8081)와의 통신을 담당
 */
class AuthService extends BaseApiService {
  constructor() {
    const baseURL = import.meta.env.DEV
        ? 'http://localhost:8081/api'
        : `${import.meta.env.VITE_AUTH_BASE_URL}/api`

    super(baseURL, 'AUTH')
  }

  // ==================== 인증 API ====================

  /**
   * 로그인
   */
  async login(credentials) {
    const response = await this.post('/auth/login', credentials)

    if (response.success && response.data) {
      // 토큰 저장
      if (response.data.accessToken && response.data.refreshToken) {
        authUtils.setTokens(response.data.accessToken, response.data.refreshToken)
      }

      // 사용자 정보 저장
      if (response.data.user) {
        authUtils.setUserInfo(response.data.user)
      }

      console.log('✅ [AUTH] 로그인 성공')
    }

    return response
  }

  /**
   * 회원가입
   */
  async register(userData) {
    return await this.post('/auth/register', userData)
  }

  /**
   * 로그아웃 (서버 + 로컬)
   */
  async logout() {
    try {
      const refreshTokenValue = authUtils.getRefreshToken()

      if (refreshTokenValue) {
        await this.post('/auth/logout', {
          refreshToken: refreshTokenValue
        })
        console.log('✅ [AUTH] 백엔드 로그아웃 완료')
      }
    } catch (error) {
      console.warn('⚠️ [AUTH] 백엔드 로그아웃 실패:', error.message)
    } finally {
      // 로컬 인증 정보 정리
      authUtils.logout()
      console.log('✅ [AUTH] 로컬 로그아웃 완료')
    }
  }

  /**
   * 토큰 검증
   */
  async verifyToken() {
    return await this.get('/auth/verify')
  }

  /**
   * 토큰 갱신
   */
  async refresh() {
    const newToken = await this.refreshToken()
    return {
      success: true,
      data: { accessToken: newToken }
    }
  }

  /**
   * 비밀번호 재설정 요청
   */
  async forgotPassword(email) {
    return await this.post('/auth/forgot-password', { email })
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(token, password) {
    return await this.post('/auth/reset-password', { token, password })
  }

  /**
   * 이메일 인증
   */
  async verifyEmail(token) {
    return await this.post('/auth/verify-email', { token })
  }

  /**
   * 인증 이메일 재전송
   */
  async resendVerification(email) {
    return await this.post('/auth/resend-verification', { email })
  }

  // ==================== 사용자 프로필 API ====================

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile() {
    return await this.get('/users/profile')
  }

  /**
   * 사용자 프로필 수정
   */
  async updateUserProfile(profileData) {
    return await this.put('/users/profile', profileData)
  }

  /**
   * 사용자 계정 삭제
   */
  async deleteAccount() {
    const response = await this.delete('/users/profile')

    // 계정 삭제 성공시 로컬 정보도 정리
    if (response.success) {
      authUtils.logout()
    }

    return response
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(currentPassword, newPassword) {
    return await this.put('/users/password', {
      currentPassword,
      newPassword
    })
  }

  // ==================== 사용자 활동 API ====================

  /**
   * 사용자 게시물 조회
   */
  async getUserPosts(userId, params = {}) {
    return await this.get(`/users/${userId}/posts`, params)
  }

  /**
   * 사용자 좋아요 목록 조회
   */
  async getUserLikes(userId, params = {}) {
    return await this.get(`/users/${userId}/likes`, params)
  }

  /**
   * 사용자 북마크 목록 조회
   */
  async getUserBookmarks(params = {}) {
    return await this.get('/users/bookmarks', params)
  }

  // ==================== 팔로우 API ====================

  /**
   * 사용자 팔로우
   */
  async followUser(userId) {
    return await this.post(`/users/${userId}/follow`)
  }

  /**
   * 사용자 언팔로우
   */
  async unfollowUser(userId) {
    return await this.delete(`/users/${userId}/follow`)
  }

  /**
   * 팔로워 목록 조회
   */
  async getFollowers(userId, params = {}) {
    return await this.get(`/users/${userId}/followers`, params)
  }

  /**
   * 팔로잉 목록 조회
   */
  async getFollowing(userId, params = {}) {
    return await this.get(`/users/${userId}/following`, params)
  }

  // ==================== 알림 API ====================

  /**
   * 알림 목록 조회
   */
  async getNotifications(params = {}) {
    return await this.get('/users/notifications', params)
  }

  /**
   * 알림 읽음 처리
   */
  async markNotificationAsRead(notificationId) {
    return await this.patch(`/users/notifications/${notificationId}/read`)
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllNotificationsAsRead() {
    return await this.patch('/users/notifications/read-all')
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  async getUnreadNotificationCount() {
    return await this.get('/users/notifications/unread-count')
  }

  // ==================== 차단 및 신고 API ====================

  /**
   * 사용자 차단
   */
  async blockUser(userId) {
    return await this.post(`/users/${userId}/block`)
  }

  /**
   * 사용자 차단 해제
   */
  async unblockUser(userId) {
    return await this.delete(`/users/${userId}/block`)
  }

  /**
   * 차단된 사용자 목록 조회
   */
  async getBlockedUsers(params = {}) {
    return await this.get('/users/blocked', params)
  }

  /**
   * 사용자 신고
   */
  async reportUser(userId, reason, description) {
    return await this.post(`/users/${userId}/report`, {
      reason,
      description
    })
  }

  // ==================== 검색 API ====================

  /**
   * 사용자 검색
   */
  async searchUsers(query, params = {}) {
    return await this.get('/users/search', {
      query,
      ...params
    })
  }

  // ==================== 헬퍼 메서드 ====================

  /**
   * 현재 로그인한 사용자 정보 조회
   */
  getCurrentUser() {
    return authUtils.getCurrentUser()
  }

  /**
   * 인증 상태 확인
   */
  isAuthenticated() {
    return authUtils.isAuthenticated()
  }

  /**
   * 토큰 만료 확인
   */
  isTokenExpired() {
    const token = authUtils.getAccessToken()
    return token ? authUtils.isTokenExpired(token) : true
  }

  /**
   * 토큰 갱신 필요 여부 확인
   */
  shouldRefreshToken() {
    const token = authUtils.getAccessToken()
    return token ? authUtils.shouldRefreshToken(token) : false
  }

  // ==================== 디버깅 ====================

  /**
   * 인증 상태 디버깅
   */
  debugAuthStatus() {
    console.group('🔍 [AUTH] 인증 상태 디버깅')

    const accessToken = authUtils.getAccessToken()
    const refreshToken = authUtils.getRefreshToken()

    console.log('=== 토큰 상태 ===')
    console.log('Access Token 존재:', !!accessToken)
    console.log('Refresh Token 존재:', !!refreshToken)

    if (accessToken) {
      console.log('토큰 만료:', authUtils.isTokenExpired(accessToken))
      console.log('토큰 갱신 필요:', authUtils.shouldRefreshToken(accessToken))
      console.log('토큰 남은 시간:', authUtils.getTokenTimeRemaining(accessToken), '분')
    }

    console.log('=== 사용자 정보 ===')
    console.log('사용자 정보:', authUtils.getCurrentUser())
    console.log('사용자 ID:', authUtils.getUserId())
    console.log('사용자 역할:', authUtils.getUserRole())
    console.log('인증 상태:', authUtils.isAuthenticated())

    // 부모 클래스의 디버깅도 호출
    this.debugStatus()

    console.groupEnd()
  }
}

// ==================== Vue Composables ====================

/**
 * Vue Composition API용 인증 훅
 */
export function useAuth() {
  const authService = new AuthService()

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)

      if (response.success) {
        return {
          success: true,
          user: response.data.user || authUtils.getCurrentUser(),
          message: response.message
        }
      } else {
        throw new Error(response.message || '로그인에 실패했습니다')
      }
    } catch (error) {
      console.error('❌ [AUTH] 로그인 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      return { success: true }
    } catch (error) {
      console.error('❌ [AUTH] 로그아웃 실패:', error)
      // 로그아웃은 실패해도 로컬 정보는 정리
      authUtils.logout()
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      return {
        success: response.success,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('❌ [AUTH] 회원가입 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const checkAuth = async () => {
    try {
      if (!authService.isAuthenticated()) {
        return false
      }

      // 서버에서 토큰 검증
      const response = await authService.verifyToken()
      return response.success
    } catch (error) {
      console.warn('⚠️ [AUTH] 토큰 검증 실패:', error)
      return false
    }
  }

  const refreshToken = async () => {
    try {
      const response = await authService.refresh()
      return response.success
    } catch (error) {
      console.error('❌ [AUTH] 토큰 갱신 실패:', error)
      return false
    }
  }

  return {
    // 메서드
    login,
    logout,
    register,
    checkAuth,
    refreshToken,

    // 상태 확인
    isAuthenticated: () => authService.isAuthenticated(),
    getCurrentUser: () => authService.getCurrentUser(),
    isTokenExpired: () => authService.isTokenExpired(),
    shouldRefreshToken: () => authService.shouldRefreshToken(),

    // 디버깅
    debugStatus: () => authService.debugAuthStatus()
  }
}

// ==================== 싱글톤 인스턴스 ====================

// 싱글톤 인스턴스 생성 및 내보내기
export const authService = new AuthService()

// 기본 내보내기
export default authService