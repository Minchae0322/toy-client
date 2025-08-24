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
        userId: (state) => state.user?.id,
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
         * 간단한 사용자 정보 로드 (무한루프 방지)
         */
        loadUserInfo() {
            const user = authUtils.getUserInfo()
            const accessToken = authUtils.getAccessToken()
            const refreshToken = authUtils.getRefreshToken()

            // 기본 정보 확인
            if (!accessToken || !refreshToken || !user) {
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

            this.user = user
            this.isAuthenticated = true
            console.log('✅ [Store] 사용자 정보 로드 완료')
            return true
        },

        /**
         * 로그인 처리
         */
        login(tokens, user) {
            authUtils.setTokens(tokens.accessToken, tokens.refreshToken)
            authUtils.setUserInfo(user)
            this.user = user
            this.isAuthenticated = true
            console.log('✅ [Store] 로그인 완료')
        },

        /**
         * 로그아웃 처리 (간단 버전)
         */
        logout() {
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
        }
    }
})