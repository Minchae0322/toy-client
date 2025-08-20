// stores/auth.js
import { defineStore } from 'pinia'
import * as authUtils from '@/utils/auth.js'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        refreshing: false // 토큰 갱신 중 상태
    }),

    getters: {
        isAdmin: (state) => state.user?.role === 'ADMIN',
        isUser: (state) => state.user?.role === 'USER',
        userId: (state) => state.user?.id,
        userRole: (state) => state.user?.role,
        hasValidToken: (state) => {
            const token = authUtils.getAccessToken()
            if (!token) return false

            try {
                const payload = JSON.parse(atob(token.replace('Bearer ', '').split('.')[1]))
                return payload.exp > Date.now() / 1000
            } catch {
                return false
            }
        }
    },

    actions: {
        // 사용자 정보 로드 (토큰 검증 포함)
        async loadUserInfo() {
            const user = authUtils.getUserInfo()
            const token = authUtils.getAccessToken()

            if (!token || !user) {
                this.user = null
                this.isAuthenticated = false
                return false
            }

            // 토큰 만료 확인
            if (!this.hasValidToken) {
                console.log('🔄 토큰이 만료되어 갱신을 시도합니다...')
                const refreshResult = await this.refreshToken()
                if (!refreshResult) {
                    this.logout()
                    return false
                }
            }

            this.user = user
            this.isAuthenticated = true
            return true
        },

        // 로그인
        login(tokens, user) {
            authUtils.setTokens(tokens.accessToken, tokens.refreshToken)
            authUtils.setUserInfo(user)
            this.user = user
            this.isAuthenticated = true
        },

        // 로그아웃
        logout() {
            authUtils.logout()
            this.user = null
            this.isAuthenticated = false
            this.refreshing = false
        },

        // 토큰 갱신 (Auth Server 8081포트 - 백엔드 방식에 맞춤)
        async refreshToken() {
            if (this.refreshing) {
                console.log('⏳ 이미 토큰 갱신 중입니다...')
                return false
            }

            const refreshToken = authUtils.getRefreshToken()
            if (!refreshToken) {
                console.warn('❌ Refresh Token이 없습니다.')
                return false
            }

            try {
                this.refreshing = true
                console.log('🔄 토큰 갱신 시도 중... (백엔드 방식)')

                const authServerUrl = import.meta.env.DEV
                    ? 'http://localhost:8081'
                    : (import.meta.env.VITE_AUTH_SERVER_URL || 'https://your-auth-domain.com')

                // 백엔드 RefreshJwtFilter에 맞춘 요청 방식
                const response = await fetch(`${authServerUrl}/api/v1/chat/rooms`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${refreshToken}` // Refresh Token을 Authorization 헤더에
                    }
                })

                if (response.ok) {
                    // 백엔드에서 응답 헤더의 Authorization에 새로운 Access Token을 담아서 보냄
                    const newAccessToken = response.headers.get('Authorization')

                    if (newAccessToken) {
                        // "Bearer " 접두사 제거
                        const cleanToken = newAccessToken.replace('Bearer ', '')

                        // 새로운 Access Token 저장 (Refresh Token은 그대로 유지)
                        authUtils.setAccessToken(cleanToken)

                        console.log('✅ 토큰 갱신 성공 (헤더에서 수신)')
                        return true
                    } else {
                        console.error('❌ 응답 헤더에 새로운 토큰이 없습니다.')
                        return false
                    }
                } else {
                    if (response.status === 401) {
                        console.error('❌ Refresh Token이 만료되었습니다. 다시 로그인하세요.')
                    } else {
                        console.error('❌ 토큰 갱신 실패:', response.status, response.statusText)
                    }
                    return false
                }

            } catch (error) {
                console.error('❌ 토큰 갱신 중 오류:', error)
                return false
            } finally {
                this.refreshing = false
            }
        },

        // 백엔드 방식 토큰 갱신 (특정 API 엔드포인트 사용)
        async refreshTokenWithAPI() {
            if (this.refreshing) {
                console.log('⏳ 이미 토큰 갱신 중입니다...')
                return false
            }

            const refreshToken = authUtils.getRefreshToken()
            if (!refreshToken) {
                console.warn('❌ Refresh Token이 없습니다.')
                return false
            }

            try {
                this.refreshing = true
                console.log('🔄 API 토큰 갱신 시도 중...')

                const authServerUrl = import.meta.env.DEV
                    ? 'http://localhost:8081'
                    : (import.meta.env.VITE_AUTH_SERVER_URL || 'https://your-auth-domain.com')

                // 아무 보호된 API 엔드포인트에 Refresh Token으로 요청
                // 백엔드 RefreshJwtFilter가 자동으로 처리함
                const testEndpoints = [
                    `${authServerUrl}/api/v1/auth/verify`,
                    `${authServerUrl}/api/v1/users/profile`,
                    `${authServerUrl}/api/v1/test/protected`
                ]

                for (const endpoint of testEndpoints) {
                    try {
                        const response = await fetch(endpoint, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${refreshToken}`
                            }
                        })

                        if (response.ok || response.status === 404) { // 404도 인증은 성공
                            const newAccessToken = response.headers.get('Authorization')

                            if (newAccessToken) {
                                const cleanToken = newAccessToken.replace('Bearer ', '')
                                authUtils.setAccessToken(cleanToken)
                                console.log('✅ API 토큰 갱신 성공:', endpoint)
                                return true
                            }
                        }
                    } catch (endpointError) {
                        console.warn(`⚠️ ${endpoint} 시도 실패:`, endpointError.message)
                        continue
                    }
                }

                console.error('❌ 모든 엔드포인트에서 토큰 갱신 실패')
                return false

            } catch (error) {
                console.error('❌ API 토큰 갱신 중 오류:', error)
                return false
            } finally {
                this.refreshing = false
            }
        },

        // 인증이 필요한 API 호출 전 토큰 확인
        async ensureValidToken() {
            if (this.hasValidToken) {
                return true
            }

            console.log('🔄 토큰 만료로 인한 자동 갱신...')

            // 먼저 일반적인 방식 시도, 실패하면 API 방식 시도
            const refreshResult = await this.refreshToken()
            if (refreshResult) {
                return true
            }

            console.log('🔄 일반 갱신 실패, API 방식으로 재시도...')
            return await this.refreshTokenWithAPI()
        },

        // 권한 확인
        hasRole(role) {
            return this.user?.role === role
        },

        // 토큰 상태 디버깅
        debugTokenStatus() {
            console.group('🔍 Auth Store 토큰 상태 (백엔드 연동)')
            console.log('인증 상태:', this.isAuthenticated)
            console.log('사용자 정보:', this.user)
            console.log('토큰 갱신 중:', this.refreshing)
            console.log('유효한 토큰:', this.hasValidToken)

            const accessToken = authUtils.getAccessToken()
            const refreshToken = authUtils.getRefreshToken()

            console.log('Access Token 존재:', !!accessToken)
            console.log('Refresh Token 존재:', !!refreshToken)

            if (accessToken) {
                try {
                    const payload = JSON.parse(atob(accessToken.replace('Bearer ', '').split('.')[1]))
                    console.log('토큰 만료 시간:', new Date(payload.exp * 1000).toLocaleString())
                    console.log('현재 시간:', new Date().toLocaleString())
                    console.log('토큰 만료까지:', Math.floor((payload.exp * 1000 - Date.now()) / 60000), '분')
                } catch (error) {
                    console.warn('토큰 파싱 실패:', error)
                }
            }

            console.groupEnd()
        }
    }
})