// src/stores/auth.js - Pinia 인증 스토어 (중앙 상태 관리)
import { defineStore } from 'pinia'
import * as authUtils from '@/utils/auth.js'
import { authService } from '@/services/AuthService.js'
import { userService } from '@/services/UserService.js'

export const useAuthStore = defineStore('auth', {
    state: () => {
        // 새로고침 시 localStorage에서 동기적으로 초기 상태 복원
        // 이렇게 하면 Pinia store 생성 시점부터 올바른 인증 상태를 가짐
        const accessToken = authUtils.getAccessToken()
        const savedUser = accessToken ? authUtils.getCurrentUser() : null
        const isAuth = !!(accessToken && savedUser?.id)

        if (isAuth) {
            console.log('🔄 [AuthStore] 초기 상태 복원:', savedUser?.nickname || savedUser?.username)
        }

        return {
            user: savedUser,
            isAuthenticated: isAuth,
            loading: false,
            lastActivity: Date.now()
        }
    },

    getters: {
        // 기본 사용자 정보
        isAdmin: (state) => state.user?.role === 'ADMIN',
        isUser: (state) => state.user?.role === 'USER',
        isModerator: (state) => state.user?.role === 'MODERATOR',

        // 사용자 ID (여러 필드에서 추출)
        userId: (state) => {
            return state.user?.id ||
                state.user?.userId ||
                state.user?.sub ||
                null
        },

        // 사용자 정보
        userRole: (state) => state.user?.role || 'GUEST',
        userNickname: (state) => state.user?.nickname || state.user?.username || null,
        userEmail: (state) => state.user?.email || null,
        userProfileImage: (state) => state.user?.profileImage || null,

        // OAuth 관련
        isOAuthUser: (state) => state.user?.provider && state.user.provider !== 'local',
        authProvider: (state) => state.user?.provider || 'local',

        // 토큰 관련 (HttpOnly 쿠키 기반)
        hasValidToken: () => {
            const accessToken = authUtils.getAccessToken()
            if (!accessToken) return false
            return !authUtils.isTokenExpired(accessToken)
        },

        // 토큰 상태 정보
        tokenInfo: () => {
            const accessToken = authUtils.getAccessToken()
            return {
                hasAccessToken: !!accessToken,
                hasRefreshToken: 'HttpOnly 쿠키로 관리',
                accessTokenExpired: accessToken ? authUtils.isTokenExpired(accessToken) : true,
                accessTokenExpiry: accessToken ? authUtils.getTokenExpiryTime(accessToken) : null
            }
        }
    },

    actions: {
        /**
         * 사용자 정보 로드 및 인증 상태 확인
         */
        async loadUserInfo() {
            try {
                this.loading = true

                const accessToken = authUtils.getAccessToken()

                if (!accessToken) {
                    this.clearAuthState()
                    return false
                }

                // 사용자 기본 정보 로드 (JWT/localStorage)
                const user = authUtils.getCurrentUser()

                if (!user?.id) {
                    console.error('❌ [AuthStore] 유효한 사용자 정보 없음')
                    this.clearAuthState()
                    return false
                }

                // 프로필 API에서 최신 정보 가져오기 (프로필 사진 포함)
                try {
                    const profileResponse = await userService.getUserProfile(user.id)

                    if (profileResponse.success && profileResponse.data) {
                        // 프로필 정보를 user 객체에 병합
                        user.profilePicture = profileResponse.data.profilePicture
                        user.nickname = profileResponse.data.nickname || user.nickname
                        user.description = profileResponse.data.description || user.description

                        console.log('✅ [AuthStore] 프로필 정보 로드 완료')
                    }
                } catch (profileError) {
                    console.warn('⚠️ [AuthStore] 프로필 정보 로드 실패 (기본 정보만 사용):', profileError)
                }

                // 상태 업데이트
                this.user = user
                this.isAuthenticated = true
                this.lastActivity = Date.now()

                // localStorage에도 업데이트된 정보 저장
                authUtils.setUserInfo(user)

                console.log('✅ [AuthStore] 사용자 정보 로드 완료:', user.nickname || user.username)
                return true

            } catch (error) {
                console.error('❌ [AuthStore] 사용자 정보 로드 실패:', error)
                this.clearAuthState()
                return false
            } finally {
                this.loading = false
            }
        },

        /**
         * 로그인 처리
         */
        async login(tokens, user = {}) {
            console.log('🔐 [AuthStore] 로그인 처리 시작...')

            try {
                this.loading = true

                // 토큰 저장
                authUtils.setTokens(tokens.accessToken, tokens.refreshToken)

                // 사용자 정보 보완 (토큰에서 추출)
                let completeUser = { ...user }
                if (!user.id && tokens.accessToken) {
                    const tokenUser = authUtils.getCurrentUser()
                    if (tokenUser) {
                        completeUser = { ...completeUser, ...tokenUser }
                    }
                }

                // 사용자 정보 저장 및 상태 업데이트
                if (completeUser.id) {
                    authUtils.setUserInfo(completeUser)
                    this.user = completeUser
                    this.isAuthenticated = true
                    this.lastActivity = Date.now()

                    console.log('✅ [AuthStore] 로그인 완료:', completeUser.nickname || completeUser.username)
                    return true
                } else {
                    throw new Error('유효한 사용자 정보가 없습니다')
                }

            } catch (error) {
                console.error('❌ [AuthStore] 로그인 처리 실패:', error)
                this.clearAuthState()
                return false
            } finally {
                this.loading = false
            }
        },

        /**
         * 로그아웃 처리
         */
        async logout() {
            console.log('🚪 [AuthStore] 로그아웃 처리 시작...')

            try {
                // 즉시 상태 초기화 (UI 반응성)
                this.clearAuthState()

                // 백엔드 로그아웃 시도
                try {
                    await authService.logout()
                    console.log('✅ [AuthStore] 백엔드 로그아웃 완료')
                } catch (error) {
                    console.warn('⚠️ [AuthStore] 백엔드 로그아웃 실패:', error)
                }

                // 로컬 인증 정보 정리
                authUtils.logout()

                console.log('✅ [AuthStore] 로그아웃 처리 완료')

            } catch (error) {
                console.error('❌ [AuthStore] 로그아웃 처리 중 오류:', error)
                this.clearAuthState()
                authUtils.logout()
            }
        },

        /**
         * 인증 상태 초기화
         */
        clearAuthState() {
            this.user = null
            this.isAuthenticated = false
            this.lastActivity = Date.now()
        },

        /**
         * 권한 확인
         */
        hasRole(role) {
            if (!this.user) return false

            const userRole = this.user.role
            const userRoles = this.user.roles

            if (userRole === role) return true
            if (Array.isArray(userRoles) && userRoles.includes(role)) return true

            return false
        },

        /**
         * 다중 권한 확인
         */
        hasAnyRole(roles) {
            if (!Array.isArray(roles) || roles.length === 0) return false
            return roles.some(role => this.hasRole(role))
        },

        /**
         * 모든 권한 확인
         */
        hasAllRoles(roles) {
            if (!Array.isArray(roles) || roles.length === 0) return false
            return roles.every(role => this.hasRole(role))
        },

        /**
         * 사용자 정보 업데이트
         */
        updateUserInfo(updatedUser) {
            if (!this.user) {
                console.warn('⚠️ [AuthStore] 로그인되지 않은 상태에서 사용자 정보 업데이트 시도')
                return false
            }

            // 기존 정보와 병합
            this.user = { ...this.user, ...updatedUser }

            // localStorage에도 저장
            authUtils.setUserInfo(this.user)

            this.lastActivity = Date.now()

            console.log('✅ [AuthStore] 사용자 정보 업데이트 완료')
            return true
        },

        /**
         * 사용자 정보 강제 새로고침
         */
        async refreshUserInfo() {
            console.log('🔄 [AuthStore] 사용자 정보 강제 새로고침...')
            authUtils.clearUserInfo()
            return await this.loadUserInfo()
        },

        /**
         * 활동 시간 업데이트
         */
        updateActivity() {
            this.lastActivity = Date.now()
        },

        /**
         * 디버깅용 상태 출력
         */
        debugAuthState() {
            console.group('🔍 [AuthStore] 인증 상태 디버깅')
            console.log('사용자:', this.user)
            console.log('인증 상태:', this.isAuthenticated)
            console.log('로딩 상태:', this.loading)
            console.log('마지막 활동:', new Date(this.lastActivity))
            console.log('사용자 ID:', this.userId)
            console.log('사용자 역할:', this.userRole)
            console.log('토큰 정보:', this.tokenInfo)
            authUtils.debugAuthStatus()
            console.groupEnd()
        }
    }
})
