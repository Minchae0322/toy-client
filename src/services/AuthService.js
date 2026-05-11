// services/AuthService.js
// 인증 관련 API 서비스 (Fetch API 기반)

import { BaseApiService } from './BaseApiService.js'
import * as authUtils from '@/utils/auth.js'
import {ENV, getServiceUrl} from "@/config/env.js";

/**
 * 인증 서비스
 * Auth Server (8081)와의 통신을 담당
 */
class AuthService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('AUTH')
    super(baseURL, 'AUTH')
    console.log(`[AUTH] AUTH Server URL: ${this.baseURL}`)
    console.log(`[AUTH] Environment: ${ENV.MODE}`)
  }

  // ==================== 인증 API ====================

  // AuthService.js 수정
  async login(credentials) {
    const response = await this.post('/login', credentials, {
      credentials: 'include' // ⭐ 쿠키 포함
    })

    if (response.success && response.data) {
      // AccessToken만 localStorage에 저장
      if (response.data.accessToken) {
        authUtils.setTokens(response.data.accessToken, null) // RefreshToken은 null
      }

      if (response.data.user) {
        authUtils.setUserInfo(response.data.user)
      }

      console.log('✅ [AUTH] 로그인 성공')
    }

    return response
  }

  /**
   * 1단계: 이메일 인증 코드 발송
   * @param {string} email - 인증받을 이메일
   */
  async sendVerificationCode(email) {
    return await this.post('/user/auth/email/send-code', { email })
  }

  /**
   * 2단계: 이메일 인증 코드 검증
   * @param {string} email - 인증받을 이메일
   * @param {string} code - 6자리 인증 코드
   * @returns {Promise<{success: boolean, data: string}>} 검증 토큰 반환
   */
  async verifyEmailCode(email, code) {
    const response = await this.post('/user/auth/email/verify-code', {
      email,
      code
    })

    // 검증 토큰을 data에 담아서 반환
    if (response.success && response.data) {
      console.log('✅ [AUTH] 이메일 인증 성공')
    }

    return response
  }

  /**
   * 3단계: 회원가입
   * @param {Object} signupData - 회원가입 데이터
   * @param {string} signupData.email - 이메일
   * @param {string} signupData.password - 비밀번호 (8~20자, 영문+숫자+특수문자)
   * @param {string} signupData.verificationToken - 이메일 인증 토큰
   */
  async signup(signupData) {
    const response = await this.post('/user/auth/signup', signupData)

    if (response.success && response.data) {
      console.log('✅ [AUTH] 회원가입 성공:', response.data)
    }

    return response
  }

  /**
   * 회원가입 (레거시 - 기존 코드와 호환성 유지)
   * @deprecated signup() 메서드 사용 권장
   */
  async register(userData) {
    return await this.signup(userData)
  }

  /**
   * 로그아웃 (서버 + 로컬)
   */
  async logout() {
    try {
      // refreshToken은 HttpOnly 쿠키라 JS로 읽을 수 없음 → getRefreshToken()은 항상 null
      // 백엔드 /auth/logout이 쿠키를 직접 읽고 Set-Cookie로 만료시키도록 항상 호출
      // (withCredentials: true는 전역 axios client에 설정되어 쿠키 자동 전송)
      await this.post('/auth/logout', {})
      console.log('✅ [AUTH] 백엔드 로그아웃 완료')
    } catch (error) {
      console.warn('⚠️ [AUTH] 백엔드 로그아웃 실패:', error.message)
    } finally {
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
   * 비밀번호 재설정 — 1단계: 인증 코드 발송
   * 가입 여부와 무관하게 200 OK (이메일 enumeration 방지)
   */
  async sendPasswordResetCode(email) {
    return await this.post('/user/auth/password/send-code', { email })
  }

  /**
   * 비밀번호 재설정 — 2단계: 인증 코드 검증
   * @returns {Promise<{success: boolean, data: string}>} 일회용 reset 토큰 (10분 TTL)
   */
  async verifyPasswordResetCode(email, code) {
    return await this.post('/user/auth/password/verify-code', { email, code })
  }

  /**
   * 비밀번호 재설정 — 3단계: 토큰으로 비밀번호 변경
   */
  async resetPassword({ email, token, newPassword }) {
    return await this.post('/user/auth/password/reset', { email, token, newPassword })
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
   * 회원 탈퇴
   * DELETE /user/{userId} → 204 No Content
   * 성공 시 백엔드 로그아웃(/auth/logout)으로 refreshToken 쿠키를 만료시키고
   * 로컬의 accessToken / user_info도 모두 제거한다.
   */
  async deleteAccount() {
    const userId = authUtils.getUserId()
    if (!userId) {
      return {
        success: false,
        message: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.'
      }
    }

    const response = await this.delete(`/user/${userId}`)

    if (response.success) {
      try {
        await this.post('/auth/logout', {})
        console.log('✅ [AUTH] 탈퇴 후 백엔드 로그아웃(refresh 쿠키 만료) 완료')
      } catch (error) {
        console.warn('⚠️ [AUTH] 탈퇴 후 백엔드 로그아웃 실패:', error.message)
      }
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
   * 사용자 팔로우/언팔로우 토글
   */
  async toggleFollow(userId) {
    return await this.post(`/user/${userId}/follow`)
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
      authUtils.logout()
      return { success: false, error: error.message }
    }
  }

  /**
   * 이메일 인증 코드 발송
   */
  const sendVerificationCode = async (email) => {
    try {
      const response = await authService.sendVerificationCode(email)
      return {
        success: response.success,
        message: response.message || '인증 코드가 발송되었습니다'
      }
    } catch (error) {
      console.error('❌ [AUTH] 인증 코드 발송 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 이메일 인증 코드 검증
   */
  const verifyEmailCode = async (email, code) => {
    try {
      const response = await authService.verifyEmailCode(email, code)

      if (response.success) {
        return {
          success: true,
          verificationToken: response.data,
          message: response.message || '이메일 인증이 완료되었습니다'
        }
      } else {
        throw new Error(response.message || '인증 코드가 올바르지 않습니다')
      }
    } catch (error) {
      console.error('❌ [AUTH] 인증 코드 검증 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 회원가입
   */
  const signup = async (signupData) => {
    try {
      const response = await authService.signup(signupData)

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || '회원가입이 완료되었습니다'
        }
      } else {
        throw new Error(response.message || '회원가입에 실패했습니다')
      }
    } catch (error) {
      console.error('❌ [AUTH] 회원가입 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 회원가입 (레거시)
   * @deprecated signup() 사용 권장
   */
  const register = async (userData) => {
    return await signup(userData)
  }

  const checkAuth = async () => {
    try {
      if (!authService.isAuthenticated()) {
        return false
      }

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
    sendVerificationCode,
    verifyEmailCode,
    signup,
    register, // 레거시 호환성
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

export const authService = new AuthService()
export default authService