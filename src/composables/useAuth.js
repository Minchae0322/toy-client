import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as authUtils from '@/utils/auth.js'

const userInfo = ref(null)
const isLoggedIn = ref(false)

export function useAuth() {
    const router = useRouter()

    const extractUserFromToken = () => {
        try {
            const token = authUtils.getAccessToken()
            if (!token) return null

            const payload = authUtils.parseJwtToken(token)
            if (!payload) return null

            return {
                id: payload.userId || payload.sub,
                username: payload.username || payload.sub,
                email: payload.email,
                nickname: payload.nickname || payload.username,
                role: payload.auth || payload.role || 'USER',
                provider: payload.provider,
                profileImage: payload.picture || payload.avatar_url || null,
            }
        } catch (error) {
            console.error('🔴 JWT에서 사용자 정보 추출 실패:', error)
            return null
        }
    }

    const loadUserInfo = () => {
        const user = authUtils.getUserInfo()
        const token = authUtils.getAccessToken()

        if (!token) {
            console.log('ℹ️ [useAuth] 토큰 없음')
            userInfo.value = null
            isLoggedIn.value = false
            return
        }

        let finalUser = user
        if (!user || !user.role) {
            const extractedUser = extractUserFromToken()
            if (extractedUser) {
                finalUser = { ...user, ...extractedUser }
                authUtils.setUserInfo(finalUser)
            }
        }

        if (finalUser) {
            userInfo.value = finalUser
            isLoggedIn.value = true
            console.log('🟢 [useAuth] 최종 사용자 정보:', finalUser)
        } else {
            console.log('🔴 [useAuth] 사용자 정보 추출 실패')
            userInfo.value = null
            isLoggedIn.value = false
        }
    }

    const login = (tokens, user = {}) => {
        authUtils.setTokens(tokens.accessToken, tokens.refreshToken)

        let completeUser = { ...user }
        if (tokens.accessToken) {
            try {
                const payload = authUtils.parseJwtToken(tokens.accessToken)

                if (payload) {
                    completeUser = {
                        id: user.id || payload.userId || payload.sub,
                        username: user.username || payload.username || payload.sub,
                        email: user.email || payload.email,
                        nickname: user.nickname || payload.nickname || payload.username,
                        role: payload.auth || payload.role || user.role || 'USER',
                        provider: user.provider || payload.provider,
                        profileImage: user.profileImage || payload.picture || payload.avatar_url,
                    }
                }
            } catch (error) {
                console.error('🔴 JWT 정보 추출 실패:', error)
            }
        }

        authUtils.setUserInfo(completeUser)
        userInfo.value = completeUser
        isLoggedIn.value = true

        console.log('🟢 [useAuth] 로그인 완료:', completeUser)
    }

    const logout = () => {
        authUtils.logout()
        userInfo.value = null
        isLoggedIn.value = false
        router.push({ name: 'Login' })
    }

    const isAdmin = computed(() => userInfo.value?.role === 'ADMIN')
    const isUser = computed(() => userInfo.value?.role === 'USER')
    const userId = computed(() => userInfo.value?.id || null)
    const userRole = computed(() => userInfo.value?.role || null)

    const handleStorageChange = (e) => {
        if (e.key === 'access_token' || e.key === 'user_info') {
            loadUserInfo()
        }
    }

    onMounted(() => {
        loadUserInfo()
        window.addEventListener('storage', handleStorageChange)
    })

    return {
        userInfo,
        isLoggedIn,
        isAdmin,
        isUser,
        userId,
        userRole,
        login,
        logout,
        loadUserInfo,
    }
}
