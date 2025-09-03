// src/stores/auth.js
import { defineStore } from 'pinia'
import * as authUtils from '@/utils/auth.js'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        loading: false
    }),

    getters: {
        isAdmin: (state) => state.user?.role === 'ADMIN',
        isUser: (state) => state.user?.role === 'USER',
        userId: (state) => {
            // 여러 속성에서 사용자 ID 찾기
            return state.user?.id || state.user?.userId || state.user?.sub || null
        },
        userRole: (state) => state.user?.role,
        hasValidToken: () => {
            const accessToken = authUtils.getAccessToken()
            const refreshToken = authUtils.getRefreshToken()

            // RefreshToken이 유효하면 OK (AccessToken은 인터셉터가 갱신)
            return accessToken && refreshToken && !authUtils.isTokenExpired(refreshToken)
        }
    },

    actions: {
        /**
         * 사용자 정보 로드 (개선된 버전)
         */
        loadUserInfo() {
            console.log('🔄 [Store] 사용자 정보 로드 시작...')

            const accessToken = authUtils.getAccessToken()
            const refreshToken = authUtils.getRefreshToken()

            // 기본 토큰 확인
            if (!accessToken || !refreshToken) {
                console.log('❌ [Store] 토큰 없음')
                this.user = null
                this.isAuthenticated = false
                return false
            }

            // RefreshToken 만료 확인만 (AccessToken은 인터셉터가 처리)
            if (authUtils.isTokenExpired(refreshToken)) {
                console.log('🚨 [Store] RefreshToken 만료')
                this.logout()
                return false
            }

            // 사용자 정보 로드 시도
            let user = null

            // 1. localStorage에서 저장된 사용자 정보 먼저 확인
            const savedUserInfo = authUtils.getUserInfo()
            if (savedUserInfo?.id) {
                console.log('✅ [Store] 저장된 사용자 정보 사용:', savedUserInfo)
                user = savedUserInfo
            } else {
                // 2. 토큰에서 사용자 정보 추출
                try {
                    const payload = JSON.parse(atob(accessToken.split('.')[1]))
                    user = {
                        id: payload.sub || payload.userId || payload.id || payload.user_id,
                        email: payload.email,
                        username: payload.username || payload.name,
                        role: payload.role || 'USER',
                        roles: payload.roles || payload.authorities || [],
                        exp: payload.exp,
                        iat: payload.iat
                    }

                    if (user.id) {
                        console.log('✅ [Store] 토큰에서 사용자 정보 추출:', user)
                        // 추출한 정보를 저장
                        authUtils.setUserInfo(user)
                    }
                } catch (error) {
                    console.error('❌ [Store] 토큰 파싱 실패:', error)
                    this.logout()
                    return false
                }
            }

            if (!user?.id) {
                console.error('❌ [Store] 사용자 ID 없음')
                this.logout()
                return false
            }

            this.user = user
            this.isAuthenticated = true
            console.log('✅ [Store] 사용자 정보 로드 완료, ID:', user.id)
            return true
        },

        /**
         * 로그인 처리
         */
        login(tokens, user) {
            console.log('🔐 [Store] 로그인 처리:', { user, tokens: !!tokens })

            authUtils.setTokens(tokens.accessToken, tokens.refreshToken)
            authUtils.setUserInfo(user)
            this.user = user
            this.isAuthenticated = true

            console.log('✅ [Store] 로그인 완료, 사용자 ID:', user?.id)
        },

        /**
         * 로그아웃 처리
         */
        logout() {
            console.log('🚪 [Store] 로그아웃 처리 중...')

            authUtils.logout()
            this.user = null
            this.isAuthenticated = false

            console.log('✅ [Store] 로그아웃 완료')
        },

        /**
         * 권한 확인
         */
        hasRole(role) {
            return this.user?.role === role || this.user?.roles?.includes(role)
        },

        /**
         * 사용자 정보 업데이트
         */
        updateUserInfo(updatedUser) {
            console.log('🔄 [Store] 사용자 정보 업데이트:', updatedUser)

            this.user = { ...this.user, ...updatedUser }
            authUtils.setUserInfo(this.user)

            console.log('✅ [Store] 사용자 정보 업데이트 완료')
        },

        /**
         * 강제 사용자 정보 새로고침
         */
        async refreshUserInfo() {
            console.log('🔄 [Store] 사용자 정보 강제 새로고침...')

            // 저장된 정보 삭제 후 다시 로드
            authUtils.clearUserInfo()
            return this.loadUserInfo()
        },

        /**
         * 디버깅용 상태 출력
         */
        debugAuthState() {
            console.group('🔍 [Store] 인증 상태 디버깅')
            console.log('사용자:', this.user)
            console.log('인증 상태:', this.isAuthenticated)
            console.log('사용자 ID:', this.userId)
            console.log('사용자 역할:', this.userRole)
            console.log('유효한 토큰:', this.hasValidToken)

            // 토큰 상태도 확인
            const accessToken = authUtils.getAccessToken()
            const refreshToken = authUtils.getRefreshToken()
            console.log('Access Token 존재:', !!accessToken)
            console.log('Refresh Token 존재:', !!refreshToken)

            if (accessToken) {
                console.log('Access Token 만료:', authUtils.isTokenExpired(accessToken))
            }
            if (refreshToken) {
                console.log('Refresh Token 만료:', authUtils.isTokenExpired(refreshToken))
            }

            console.groupEnd()
        }
    }
})