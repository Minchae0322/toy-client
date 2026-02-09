// src/stores/auth.js - Pinia 인증 스토어 (중앙 상태 관리)
// 🔒 보안: Access Token은 메모리(Pinia state)에만 저장
//         Refresh Token은 HttpOnly 쿠키로 백엔드가 관리
import { defineStore } from 'pinia'
import * as authUtils from '@/utils/auth.js'
import { authService } from '@/services/AuthService.js'
import { userService } from '@/services/UserService.js'

export const useAuthStore = defineStore('auth', {
    state: () => {
        // 🔒 보안: 새로고침 시 메모리 토큰은 사라짐
        // 앱 초기화 시 initializeAuth()를 호출하여 refresh 쿠키로 토큰 재발급
        const savedUser = authUtils.getUserInfo()

        return {
            // 🔒 Access Token은 메모리에만 저장 (XSS 방어)
            accessToken: null,
            user: savedUser,
            isAuthenticated: false,
            loading: false,
            initializing: true, // 앱 초기화 중 여부
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

        // 🔒 토큰 관련 (메모리 기반)
        hasValidToken: (state) => {
            if (!state.accessToken) return false
            return !authUtils.isTokenExpired(state.accessToken)
        },

        // 🔒 Access Token getter (메모리에서 직접 반환)
        getAccessToken: (state) => state.accessToken,

        // 토큰 상태 정보
        tokenInfo: (state) => {
            return {
                hasAccessToken: !!state.accessToken,
                hasRefreshToken: 'HttpOnly 쿠키로 관리',
                accessTokenExpired: state.accessToken ? authUtils.isTokenExpired(state.accessToken) : true,
                accessTokenExpiry: state.accessToken ? authUtils.getTokenExpiryTime(state.accessToken) : null
            }
        }
    },

    actions: {
        /**
         * 🔒 앱 초기화 시 토큰 재발급 (새로고침 대응)
         * - Refresh Token은 HttpOnly 쿠키에 있으므로 /reissue API 호출
         * - 성공하면 메모리에 Access Token 저장
         */
        async initializeAuth() {
            console.log('🔄 [AuthStore] 앱 초기화 - 토큰 재발급 시도...')
            this.initializing = true

            try {
                const authBaseURL = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8081'

                const response = await fetch(`${authBaseURL}/reissue`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' // HttpOnly 쿠키 포함
                })

                if (!response.ok) {
                    console.log('ℹ️ [AuthStore] 세션 없음 또는 만료 - 비로그인 상태')
                    this.clearAuthState()
                    return false
                }

                const data = await response.json()
                if (data.accessToken) {
                    // 🔒 메모리에만 저장
                    this.accessToken = data.accessToken

                    // JWT에서 사용자 ID/역할 추출
                    const jwtPayload = authUtils.parseJwtToken(data.accessToken)
                    if (jwtPayload) {
                        const userId = jwtPayload.userId

                        // 캐시된 userInfo가 있으면 nickname 등 유지
                        const cachedUser = authUtils.getUserInfo()

                        // 기본 정보 (JWT에서)
                        let userInfo = {
                            id: userId,
                            email: jwtPayload.email || jwtPayload.username,
                            username: jwtPayload.username || jwtPayload.sub,
                            // 캐시된 nickname 우선 사용
                            nickname: cachedUser?.nickname || jwtPayload.nickname || jwtPayload.username,
                            role: jwtPayload.role || jwtPayload.auth || 'USER',
                            provider: jwtPayload.provider || 'local',
                            // 캐시된 프로필 정보 유지
                            profilePicture: cachedUser?.profilePicture || null,
                            description: cachedUser?.description || null
                        }

                        this.user = userInfo
                        this.isAuthenticated = true

                        console.log('✅ [AuthStore] 토큰 재발급 성공:', userInfo.nickname)

                        // 프로필 API에서 최신 정보 가져오기 (await로 기다림)
                        try {
                            const profileResponse = await userService.getUserProfile(userId)
                            if (profileResponse.success && profileResponse.data) {
                                userInfo = {
                                    ...userInfo,
                                    nickname: profileResponse.data.nickname || userInfo.nickname,
                                    profilePicture: profileResponse.data.profilePicture,
                                    description: profileResponse.data.description
                                }
                                this.user = userInfo
                                console.log('✅ [AuthStore] 프로필 로드 완료:', userInfo.nickname)
                            }
                        } catch (profileError) {
                            console.warn('⚠️ [AuthStore] 프로필 로드 실패 (캐시 사용):', profileError.message)
                        }

                        // 최종 정보 캐시에 저장
                        authUtils.setUserInfo(userInfo)
                        return true
                    }
                }

                this.clearAuthState()
                return false

            } catch (error) {
                console.log('ℹ️ [AuthStore] 토큰 재발급 실패 (비로그인 상태):', error.message)
                this.clearAuthState()
                return false
            } finally {
                this.initializing = false
            }
        },

        /**
         * 프로필 정보 로드 (백그라운드)
         */
        async loadUserProfile(userId) {
            try {
                const profileResponse = await userService.getUserProfile(userId)
                if (profileResponse.success && profileResponse.data) {
                    this.user = {
                        ...this.user,
                        profilePicture: profileResponse.data.profilePicture,
                        nickname: profileResponse.data.nickname || this.user?.nickname,
                        description: profileResponse.data.description
                    }
                    authUtils.setUserInfo(this.user)
                }
            } catch (error) {
                console.warn('⚠️ [AuthStore] 프로필 로드 실패:', error.message)
            }
        },

        /**
         * 사용자 정보 로드 및 인증 상태 확인
         */
        async loadUserInfo() {
            try {
                this.loading = true

                // 🔒 메모리에서 토큰 확인
                if (!this.accessToken) {
                    this.clearAuthState()
                    return false
                }

                // JWT에서 사용자 정보 추출
                const payload = authUtils.parseJwtToken(this.accessToken)
                if (!payload) {
                    console.error('❌ [AuthStore] 토큰 파싱 실패')
                    this.clearAuthState()
                    return false
                }

                const user = {
                    id: payload.userId,
                    email: payload.email || payload.username,
                    username: payload.username || payload.sub,
                    nickname: payload.nickname || payload.username,
                    role: payload.role || payload.auth || 'USER',
                    provider: payload.provider || 'local'
                }

                if (!user.id) {
                    console.error('❌ [AuthStore] 유효한 사용자 정보 없음')
                    this.clearAuthState()
                    return false
                }

                // 프로필 API에서 최신 정보 가져오기
                try {
                    const profileResponse = await userService.getUserProfile(user.id)
                    if (profileResponse.success && profileResponse.data) {
                        user.profilePicture = profileResponse.data.profilePicture
                        user.nickname = profileResponse.data.nickname || user.nickname
                        user.description = profileResponse.data.description || user.description
                        console.log('✅ [AuthStore] 프로필 정보 로드 완료')
                    }
                } catch (profileError) {
                    console.warn('⚠️ [AuthStore] 프로필 정보 로드 실패:', profileError)
                }

                this.user = user
                this.isAuthenticated = true
                this.lastActivity = Date.now()
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
         * 🔒 Access Token 설정 (토큰 갱신 시 사용)
         */
        setAccessToken(token) {
            this.accessToken = token
            console.log('✅ [AuthStore] Access Token 메모리 저장 완료')
        },

        /**
         * 로그인 처리
         */
        async login(tokens, user = {}) {
            console.log('🔐 [AuthStore] 로그인 처리 시작...')

            try {
                this.loading = true

                // 🔒 Access Token은 메모리에만 저장
                if (tokens.accessToken) {
                    this.accessToken = tokens.accessToken
                }

                // 사용자 정보 보완 (토큰에서 추출)
                let completeUser = { ...user }
                if (!user.id && tokens.accessToken) {
                    const payload = authUtils.parseJwtToken(tokens.accessToken)
                    if (payload) {
                        completeUser = {
                            ...completeUser,
                            id: payload.userId,
                            email: payload.email || payload.username,
                            username: payload.username || payload.sub,
                            nickname: payload.nickname || payload.username,
                            role: payload.role || payload.auth || 'USER',
                            provider: payload.provider || 'local'
                        }
                    }
                }

                // 사용자 정보 저장 및 상태 업데이트
                if (completeUser.id) {
                    this.user = completeUser
                    this.isAuthenticated = true
                    this.lastActivity = Date.now()

                    // 프로필 API에서 실제 nickname 가져오기
                    try {
                        const profileResponse = await userService.getUserProfile(completeUser.id)
                        if (profileResponse.success && profileResponse.data) {
                            completeUser = {
                                ...completeUser,
                                nickname: profileResponse.data.nickname || completeUser.nickname,
                                profilePicture: profileResponse.data.profilePicture,
                                description: profileResponse.data.description
                            }
                            this.user = completeUser
                        }
                    } catch (profileError) {
                        console.warn('⚠️ [AuthStore] 프로필 로드 실패:', profileError.message)
                    }

                    authUtils.setUserInfo(completeUser)
                    console.log('✅ [AuthStore] 로그인 완료:', completeUser.nickname)
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
         * 🔒 로그아웃 처리
         */
        async logout() {
            console.log('🚪 [AuthStore] 로그아웃 처리 시작...')

            try {
                // 🔒 즉시 메모리 토큰 및 상태 초기화 (UI 반응성)
                this.clearAuthState()

                // 백엔드 로그아웃 시도 (쿠키 삭제)
                try {
                    await authService.logout()
                    console.log('✅ [AuthStore] 백엔드 로그아웃 완료 (쿠키 삭제)')
                } catch (error) {
                    console.warn('⚠️ [AuthStore] 백엔드 로그아웃 실패:', error)
                }

                // 로컬 인증 정보 정리 (userInfo 삭제)
                authUtils.logout()

                console.log('✅ [AuthStore] 로그아웃 처리 완료')

            } catch (error) {
                console.error('❌ [AuthStore] 로그아웃 처리 중 오류:', error)
                this.clearAuthState()
                authUtils.logout()
            }
        },

        /**
         * 🔒 인증 상태 완전 초기화
         */
        clearAuthState() {
            // 메모리 토큰 삭제
            this.accessToken = null
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
