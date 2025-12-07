// src/stores/auth.js - Pinia 인증 스토어 (useAuth와 연동)
import { defineStore } from 'pinia'
import * as authUtils from '@/utils/auth.js'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        tokenRefreshing: false,
        lastActivity: Date.now()
    }),

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

        // 토큰 관련
        // RefreshToken은 HttpOnly 쿠키로 관리되므로 JS에서 체크 불가
        hasValidToken: () => {
            const accessToken = authUtils.getAccessToken()

            if (!accessToken) return false

            // AccessToken이 유효하면 OK
            // AccessToken 만료 시에는 API 요청 시 자동으로 갱신 시도
            return !authUtils.isTokenExpired(accessToken)
        },

        // 토큰 상태 정보
        // RefreshToken은 HttpOnly 쿠키로 관리됨
        tokenInfo: () => {
            const accessToken = authUtils.getAccessToken()

            return {
                hasAccessToken: !!accessToken,
                hasRefreshToken: 'HttpOnly 쿠키로 관리',
                accessTokenExpired: accessToken ? authUtils.isTokenExpired(accessToken) : true,
                refreshTokenExpired: '서버에서 검증',
                accessTokenExpiry: accessToken ? authUtils.getTokenExpiryTime(accessToken) : null,
                refreshTokenExpiry: 'HttpOnly 쿠키로 관리'
            }
        }
    },

    actions: {
        /**
         * 사용자 정보 로드 및 인증 상태 확인
         */
        async loadUserInfo() {
            console.log('🔄 [AuthStore] 사용자 정보 로드 시작...')

            try {
                this.loading = true

                // AccessToken 확인
                const accessToken = authUtils.getAccessToken()

                if (!accessToken) {
                    console.log('❌ [AuthStore] AccessToken 없음')
                    this.clearAuthState()
                    return false
                }

                // AccessToken 만료 시 갱신 시도
                // RefreshToken은 HttpOnly 쿠키로 관리되므로 JS에서 체크 불가
                if (authUtils.isTokenExpired(accessToken)) {
                    console.log('⏰ [AuthStore] AccessToken 만료 - 갱신 시도')
                    try {
                        await this.refreshAccessToken()
                    } catch (error) {
                        console.error('❌ [AuthStore] 토큰 갱신 실패:', error)
                        this.clearAuthState()
                        return false
                    }
                }

                // 사용자 정보 로드
                const user = authUtils.getCurrentUser()

                if (!user?.id) {
                    console.error('❌ [AuthStore] 유효한 사용자 정보 없음')
                    this.clearAuthState()
                    return false
                }

                // 상태 업데이트
                this.user = user
                this.isAuthenticated = true
                this.lastActivity = Date.now()

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
         * RefreshToken으로 AccessToken 갱신
         */
        async refreshAccessToken() {
            if (this.tokenRefreshing) {
                console.log('⏳ [AuthStore] 이미 토큰 갱신 중... 대기')

                // 갱신이 완료될 때까지 대기
                return new Promise((resolve, reject) => {
                    const checkInterval = setInterval(() => {
                        if (!this.tokenRefreshing) {
                            clearInterval(checkInterval)
                            if (this.hasValidToken) {
                                resolve(true)
                            } else {
                                reject(new Error('토큰 갱신 실패'))
                            }
                        }
                    }, 100)

                    // 최대 10초 대기
                    setTimeout(() => {
                        clearInterval(checkInterval)
                        reject(new Error('토큰 갱신 타임아웃'))
                    }, 10000)
                })
            }

            try {
                this.tokenRefreshing = true
                console.log('🔄 [AuthStore] AccessToken 갱신 시작...')

                const response = await authService.refresh()
                const { accessToken, refreshToken } = response.data.data || response.data

                if (!accessToken) {
                    throw new Error('새로운 AccessToken을 받지 못했습니다')
                }

                // 새 토큰들 저장
                authUtils.setTokens(accessToken, refreshToken)

                console.log('✅ [AuthStore] AccessToken 갱신 완료')
                return true

            } catch (error) {
                console.error('❌ [AuthStore] AccessToken 갱신 실패:', error)
                this.clearAuthState()
                throw error
            } finally {
                this.tokenRefreshing = false
            }
        },

        /**
         * 로그인 처리
         */
        async login(tokens, user = {}) {
            console.log('🔐 [AuthStore] 로그인 처리 시작...', {
                user: user.nickname || user.username,
                hasTokens: !!(tokens?.accessToken)
            })

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
                    // 백엔드 로그아웃 실패해도 로컬 로그아웃은 완료
                    authUtils.logout()
                }

                console.log('✅ [AuthStore] 로그아웃 처리 완료')

            } catch (error) {
                console.error('❌ [AuthStore] 로그아웃 처리 중 오류:', error)
                // 오류가 있어도 상태는 확실히 초기화
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
            this.tokenRefreshing = false
            this.lastActivity = Date.now()

            console.log('🧹 [AuthStore] 인증 상태 초기화 완료')
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

            console.log('🔄 [AuthStore] 사용자 정보 업데이트:', updatedUser)

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

            // 저장된 정보 삭제 후 다시 로드
            authUtils.clearUserInfo()
            return await this.loadUserInfo()
        },

        /**
         * 활동 시간 업데이트 (사용자 활동 추적)
         */
        updateActivity() {
            this.lastActivity = Date.now()
        },

        /**
         * 토큰 유효성 재검증
         */
        async validateAndRefreshTokens() {
            console.log('🔍 [AuthStore] 토큰 유효성 재검증...')

            const tokenValidation = authUtils.validateTokens()

            if (!tokenValidation.isAuthenticated) {
                console.log('❌ [AuthStore] 토큰 무효 - 로그아웃 처리')
                this.clearAuthState()
                return false
            }

            if (tokenValidation.needsRefresh) {
                console.log('🔄 [AuthStore] 토큰 갱신 필요')
                try {
                    await this.refreshAccessToken()
                    return true
                } catch (error) {
                    console.error('❌ [AuthStore] 토큰 갱신 실패')
                    this.clearAuthState()
                    return false
                }
            }

            console.log('✅ [AuthStore] 토큰 유효')
            return true
        },

        /**
         * 디버깅용 상태 출력
         */
        debugAuthState() {
            console.group('🔍 [AuthStore] 인증 상태 디버깅')
            console.log('사용자:', this.user)
            console.log('인증 상태:', this.isAuthenticated)
            console.log('로딩 상태:', this.loading)
            console.log('토큰 갱신 중:', this.tokenRefreshing)
            console.log('마지막 활동:', new Date(this.lastActivity))
            console.log('사용자 ID:', this.userId)
            console.log('사용자 역할:', this.userRole)
            console.log('토큰 정보:', this.tokenInfo)

            // auth utils 디버깅도 호출
            authUtils.debugAuthStatus()

            console.groupEnd()
        }
    }
})