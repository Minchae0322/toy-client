// src/composables/useAuth.js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as authUtils from '@/utils/auth.js'

// 🔥 전역 상태 (모든 컴포넌트에서 공유)
const globalUserInfo = ref(null)
const globalIsLoggedIn = ref(false)
const globalLoading = ref(false)

// 초기화 상태 추적
let isInitialized = false

export function useAuth() {
    const router = useRouter()

    /**
     * JWT에서 사용자 정보 추출
     */
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
            console.error('❌ [useAuth] JWT에서 사용자 정보 추출 실패:', error)
            return null
        }
    }

    /**
     * 🔥 강제 상태 업데이트 (즉시 반영)
     */
    const updateGlobalState = (user, loggedIn) => {
        console.log('🔄 [useAuth] 전역 상태 업데이트:', { user: user?.nickname, loggedIn })

        globalUserInfo.value = user
        globalIsLoggedIn.value = loggedIn

        // 🔥 다른 컴포넌트들에게 상태 변경 알림
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { user, loggedIn }
        }))

        console.log('✅ [useAuth] 전역 상태 업데이트 완료')
    }

    /**
     * 사용자 정보 로드
     */
    const loadUserInfo = () => {
        console.log('🔄 [useAuth] 사용자 정보 로드 중...')

        const user = authUtils.getUserInfo()
        const accessToken = authUtils.getAccessToken()
        const refreshToken = authUtils.getRefreshToken()

        // 토큰이 없으면 미인증
        if (!accessToken) {
            console.log('ℹ️ [useAuth] AccessToken 없음 - 미인증 상태')
            updateGlobalState(null, false)
            return false
        }

        // RefreshToken 체크 (OAuth는 없을 수 있음)
        if (refreshToken && authUtils.isTokenExpired(refreshToken)) {
            console.log('🚨 [useAuth] RefreshToken 만료 - 로그아웃')
            logout()
            return false
        }

        // 사용자 정보 보완
        let finalUser = user
        if (!user || !user.role) {
            const extractedUser = extractUserFromToken()
            if (extractedUser) {
                finalUser = { ...user, ...extractedUser }
                authUtils.setUserInfo(finalUser)
            }
        }

        if (finalUser) {
            updateGlobalState(finalUser, true)
            console.log('✅ [useAuth] 인증 상태 활성화:', finalUser.nickname || finalUser.username)
            return true
        } else {
            console.log('❌ [useAuth] 사용자 정보 없음')
            updateGlobalState(null, false)
            return false
        }
    }

    /**
     * 인증 상태 강제 확인 (LoginView에서 사용)
     */
    const checkAuthStatus = () => {
        console.log('🔍 [useAuth] 인증 상태 강제 확인')
        return loadUserInfo()
    }

    /**
     * 🔥 로그인 처리 (즉시 상태 반영)
     */
    const login = (tokens, user = {}) => {
        console.log('🔑 [useAuth] 로그인 처리 시작...')

        try {
            // 토큰 저장
            authUtils.setTokens(tokens.accessToken, tokens.refreshToken)

            // 사용자 정보 보완
            let completeUser = { ...user }
            if (tokens.accessToken && (!user.role || !user.id)) {
                const extractedUser = extractUserFromToken()
                if (extractedUser) {
                    completeUser = { ...completeUser, ...extractedUser }
                }
            }

            // 사용자 정보 저장
            authUtils.setUserInfo(completeUser)

            // 🔥 즉시 전역 상태 업데이트
            updateGlobalState(completeUser, true)

            console.log('✅ [useAuth] 로그인 완료:', completeUser.nickname || completeUser.username)
            return true
        } catch (error) {
            console.error('❌ [useAuth] 로그인 처리 실패:', error)
            updateGlobalState(null, false)
            return false
        }
    }

    /**
     * 🔥 로그아웃 처리 (즉시 상태 반영)
     */
    const logout = async () => {
        try {
            console.log('🚪 [useAuth] 로그아웃 처리 중...')

            // 🔥 즉시 전역 상태 초기화 (다른 컴포넌트들이 즉시 반응하도록)
            updateGlobalState(null, false)

            // 백엔드 로그아웃 시도 (에러 발생해도 계속 진행)
            try {
                await authUtils.logoutWithBackend()
                console.log('✅ [useAuth] 백엔드 로그아웃 성공')
            } catch (backendError) {
                console.warn('⚠️ [useAuth] 백엔드 로그아웃 실패:', backendError)
            }

            // 로컬 인증 정보 삭제
            authUtils.logout()

            // 현재 페이지가 로그인 페이지가 아닐 때만 이동
            const currentRoute = router.currentRoute.value
            if (currentRoute.name !== 'Login') {
                router.push({ name: 'Login' }).catch(err => {
                    console.warn('❌ [useAuth] 라우터 이동 실패:', err)
                    window.location.href = '/login'
                })
            }

            console.log('✅ [useAuth] 로그아웃 완료')
        } catch (error) {
            console.error('❌ [useAuth] 로그아웃 중 오류:', error)

            // 오류가 있어도 상태는 초기화
            updateGlobalState(null, false)
            authUtils.logout()
        }
    }

    // 컴퓨티드 속성들
    const isAdmin = computed(() => globalUserInfo.value?.role === 'ADMIN')
    const isUser = computed(() => globalUserInfo.value?.role === 'USER')
    const userId = computed(() => globalUserInfo.value?.id || null)
    const userRole = computed(() => globalUserInfo.value?.role || null)

    /**
     * 권한 확인
     */
    const hasRole = (role) => {
        if (!globalUserInfo.value) return false

        const userRole = globalUserInfo.value.role
        const userRoles = globalUserInfo.value.roles

        if (userRole === role) return true
        if (Array.isArray(userRoles) && userRoles.includes(role)) return true

        return false
    }

    /**
     * 🔥 스토리지 변경 감지 (다른 탭 동기화)
     */
    const handleStorageChange = (e) => {
        if (e.key === authUtils.STORAGE_KEYS.ACCESS_TOKEN ||
            e.key === authUtils.STORAGE_KEYS.USER_INFO) {
            console.log('📡 [useAuth] 다른 탭에서 인증 상태 변경 감지')

            // 🔥 즉시 상태 재로드
            setTimeout(() => {
                loadUserInfo()
            }, 50)
        }
    }

    /**
     * 페이지 가시성 변경 감지
     */
    const handleVisibilityChange = () => {
        if (!document.hidden && globalIsLoggedIn.value) {
            console.log('👁️ [useAuth] 페이지 활성화 - RefreshToken 상태 확인')

            const refreshToken = authUtils.getRefreshToken()
            if (!refreshToken || authUtils.isTokenExpired(refreshToken)) {
                console.log('🚨 [useAuth] RefreshToken 만료 감지 - 로그아웃')
                logout()
            }
        }
    }

    /**
     * 🔥 초기화 (한 번만 실행)
     */
    const initializeAuth = () => {
        if (isInitialized) {
            console.log('⏭️ [useAuth] 이미 초기화됨')
            return
        }

        console.log('🚀 [useAuth] 전역 인증 시스템 초기화')

        // 기존 인증 정보 로드
        loadUserInfo()

        // 이벤트 리스너 등록
        window.addEventListener('storage', handleStorageChange)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        isInitialized = true
        console.log('✅ [useAuth] 전역 인증 시스템 초기화 완료')
    }

    /**
     * 마운트 시 초기화
     */
    onMounted(() => {
        initializeAuth()
    })

    /**
     * 언마운트 시 정리 (전역 상태는 유지)
     */
    onUnmounted(() => {
        // 🔥 전역 이벤트 리스너는 유지 (다른 컴포넌트에서도 사용)
        console.log('🧹 [useAuth] 컴포넌트 언마운트 (전역 상태 유지)')
    })

    return {
        // 🔥 전역 상태 반환 (모든 컴포넌트에서 동일한 상태 공유)
        userInfo: globalUserInfo,
        isLoggedIn: globalIsLoggedIn,
        isAdmin,
        isUser,
        userId,
        userRole,
        loading: globalLoading,

        // 액션
        login,
        logout,
        loadUserInfo,
        checkAuthStatus,

        // 유틸리티
        hasRole,

        // 디버깅
        debugAuthStatus: authUtils.debugAuthStatus
    }
}