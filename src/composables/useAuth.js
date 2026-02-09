// src/composables/useAuth.js - Pinia 스토어 래퍼 (리팩토링됨)
// 기존 useAuth 인터페이스를 유지하면서 Pinia 스토어에 위임

import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.js'
import * as authUtils from '@/utils/auth.js'

// 초기화 상태 (앱 전체에서 한 번만 초기화)
let isInitialized = false

export function useAuth() {
    const router = useRouter()
    const authStore = useAuthStore()

    // Pinia 스토어의 상태를 반응형으로 추출
    const { user, isAuthenticated, loading } = storeToRefs(authStore)

    // 로그인 처리 (스토어에 위임)
    const login = async (tokens, userInfo = {}) => {
        const result = await authStore.login(tokens, userInfo)

        if (result) {
            // 다른 컴포넌트들에게 상태 변경 알림 (하위 호환성)
            window.dispatchEvent(new CustomEvent('auth-state-changed', {
                detail: { user: authStore.user, loggedIn: true }
            }))
        }

        return result
    }

    // 로그아웃 처리 (스토어에 위임 + 라우터 처리)
    const logout = async () => {
        await authStore.logout()

        // 다른 컴포넌트들에게 상태 변경 알림 (하위 호환성)
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { user: null, loggedIn: false }
        }))

        // 로그인 페이지로 이동
        const currentRoute = router.currentRoute.value
        if (currentRoute.name !== 'Login') {
            await router.push({
                name: 'Login',
                query: { reason: 'logout' }
            }).catch(err => {
                console.warn('❌ [useAuth] 라우터 이동 실패:', err)
                window.location.href = '/login'
            })
        }
    }

    // 사용자 정보 로드 (스토어에 위임)
    const loadUser = async () => {
        return await authStore.loadUserInfo()
    }

    // 인증 상태 확인 (스토어에 위임)
    const checkAuthStatus = async () => {
        return await authStore.loadUserInfo()
    }

    // 사용자 정보 새로고침 (스토어에 위임)
    const refreshUserInfo = async () => {
        return await authStore.refreshUserInfo()
    }

    // 사용자 정보 업데이트 (스토어에 위임)
    const updateUserInfo = (updatedInfo) => {
        return authStore.updateUserInfo(updatedInfo)
    }

    // 컴퓨티드 속성들 (스토어 getter 사용)
    const isAdmin = computed(() => authStore.isAdmin)
    const isUser = computed(() => authStore.isUser)
    const userId = computed(() => authStore.userId)
    const userRole = computed(() => authStore.userRole)
    const userNickname = computed(() => authStore.userNickname)
    const userEmail = computed(() => authStore.userEmail)
    const isOAuthUser = computed(() => authStore.isOAuthUser)

    // 하위 호환성: isLoggedIn alias
    const isLoggedIn = isAuthenticated

    // 권한 확인 함수들 (스토어에 위임)
    const hasRole = (role) => authStore.hasRole(role)
    const hasAnyRole = (roles) => authStore.hasAnyRole(roles)
    const hasAllRoles = (roles) => authStore.hasAllRoles(roles)

    // 토큰 정보 (스토어 getter 사용)
    const getTokenInfo = () => authStore.tokenInfo

    // 🔒 보안: Access Token은 메모리에만 저장되므로
    // 다른 탭과의 동기화는 불가능 (각 탭이 독립적인 세션)
    // 로그아웃 시에만 userInfo 변경 감지
    const handleStorageChange = (e) => {
        if (e.key === authUtils.STORAGE_KEYS?.USER_INFO || e.key === 'user_info') {
            const newValue = e.newValue
            if (!newValue) {
                // 다른 탭에서 로그아웃됨
                console.log('📡 [useAuth] 다른 탭에서 로그아웃 감지')
                authStore.clearAuthState()
            }
        }
    }

    // 초기화 함수 (main.js에서 initializeAuth 호출됨)
    const initializeAuth = () => {
        if (isInitialized) {
            return
        }

        // 스토리지 이벤트 리스너 등록 (로그아웃 동기화용)
        window.addEventListener('storage', handleStorageChange)

        isInitialized = true
    }

    // 디버깅 함수
    const debugAuthState = () => {
        authStore.debugAuthState()
    }

    // 라이프사이클 훅
    onMounted(() => {
        initializeAuth()
    })

    // 반환할 객체 (기존 인터페이스 유지)
    return {
        // 상태 (Pinia 스토어에서 추출)
        user,
        isLoggedIn,
        isAuthenticated,
        loading,

        // 컴퓨티드 속성들
        isAdmin,
        isUser,
        userId,
        userRole,
        userNickname,
        userEmail,
        isOAuthUser,

        // 액션 메서드들
        login,
        logout,
        loadUser,
        checkAuthStatus,
        refreshUserInfo,
        updateUserInfo,

        // 유틸리티 메서드들
        hasRole,
        hasAnyRole,
        hasAllRoles,
        getTokenInfo,

        // 디버깅
        debugAuthState,

        // 하위 호환성을 위한 alias
        checkAuth: authUtils.isAuthenticated,
        debugAuth: authUtils.debugAuthStatus
    }
}

// 전역 인증 상태 접근용 헬퍼 함수들 (하위 호환성)
export const getGlobalAuthState = () => {
    const authStore = useAuthStore()
    return {
        user: authStore.user,
        isLoggedIn: authStore.isAuthenticated,
        loading: authStore.loading
    }
}

export const isGloballyLoggedIn = () => {
    const authStore = useAuthStore()
    return authStore.isAuthenticated
}

export const getGlobalUser = () => {
    const authStore = useAuthStore()
    return authStore.user
}

export const getGlobalUserId = () => {
    const authStore = useAuthStore()
    return authStore.userId
}
