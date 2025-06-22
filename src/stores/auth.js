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
        userRole: (state) => state.user?.role
    },

    actions: {
        loadUserInfo() {
            const user = authUtils.getUserInfo()
            const token = authUtils.getAccessToken()

            if (token && user) {
                this.user = user
                this.isAuthenticated = true
            } else {
                this.user = null
                this.isAuthenticated = false
            }
        },

        login(tokens, user) {
            authUtils.setTokens(tokens.accessToken, tokens.refreshToken)
            authUtils.setUserInfo(user)
            this.user = user
            this.isAuthenticated = true
        },

        logout() {
            authUtils.logout()
            this.user = null
            this.isAuthenticated = false
        },

        hasRole(role) {
            return this.user?.role === role
        }
    }
})