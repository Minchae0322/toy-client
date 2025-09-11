// src/composables/useAuth.js - 통합된 인증 Composable
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as authUtils from '@/utils/auth.js'
import { authService } from '@/api/axios.js'

// 전역 상태 (모든 컴포넌트에서 공유)
const globalUser = ref(null)
const globalIsLoggedIn = ref(false)
const globalLoading = ref(false)

// 초기화 상태
let isInitialized = false
let storageEventListener = null

export function useAuth() {
    const router = useRouter()

    // 전역 상태 업데이트 함수
    const updateGlobalState = (user = null, loggedIn = false) => {
        console.log('🔄 [useAuth] 전역 상태 업데이트:', {
            user: user?.nickname || user?.username,
            loggedIn
        })

        globalUser.value = user
        globalIsLoggedIn.value = loggedIn

        // 다른 컴포넌트들에게 상태 변경 알림
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { user, loggedIn }
        }))
    }

    // 사용자 정보 로드
    const loadUser = async () => {
        try {
            globalLoading.value = true
            console.log('🔄 [useAuth] 사용자 정보 로드 시작...')

            // 인증 상태 확인
            if (!authUtils.isAuthenticated()) {
                console.log('❌ [useAuth] 인증되지 않음')
                updateGlobalState(null, false)
                return false
            }

            // 사용자 정보 가져오기
            const user = authUtils.getCurrentUser()
            if (user?.id) {
                console.log('✅ [useAuth] 사용자 정보 로드 완료:', user.nickname || user.username)
                updateGlobalState(user, true)
                return true
            } else {
                console.log('❌ [useAuth] 유효한 사용자 정보 없음')
                updateGlobalState(null, false)
                return false
            }
        } catch (error) {
            console.error('❌ [useAuth] 사용자 정보 로드 실패:', error)
            updateGlobalState(null, false)
            return false
        } finally {
            globalLoading.value = false
        }
    }

    // 로그인 처리
    const login = async (tokens, user = {}) => {
        console.log('🔐 [useAuth] 로그인 처리 시작...')

        try {
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

            // 사용자 정보 저장
            if (completeUser.id) {
                authUtils.setUserInfo(completeUser)
                updateGlobalState(completeUser, true)
                console.log('✅ [useAuth] 로그인 완료:', completeUser.nickname || completeUser.username)
                return true
            } else {
                console.error('❌ [useAuth] 유효한 사용자 정보가 없습니다')
                return false
            }
        } catch (error) {
            console.error('❌ [useAuth] 로그인 처리 실패:', error)
            updateGlobalState(null, false)
            return false
        }
    }

    // 로그아웃 처리
    const logout = async () => {
        console.log('🚪 [useAuth] 로그아웃 처리 시작...')

        try {
            // 즉시 UI 상태 초기화 (사용자가 즉시 로그아웃 상태를 볼 수 있도록)
            updateGlobalState(null, false)

            // 백엔드 로그아웃 시도
            try {
                await authService.logout()
                console.log('✅ [useAuth] 백엔드 로그아웃 완료')
            } catch (error) {
                console.warn('⚠️ [useAuth] 백엔드 로그아웃 실패:', error)
                // 백엔드 로그아웃 실패해도 로컬 로그아웃은 계속 진행
                authUtils.logout()
            }

            // 로그인 페이지로 이동 (현재 페이지가 로그인 페이지가 아닌 경우)
            const currentRoute = router.currentRoute.value
            if (currentRoute.name !== 'Login') {
                await router.push({
                    name: 'Login',
                    query: { reason: 'logout' }
                }).catch(err => {
                    console.warn('❌ [useAuth] 라우터 이동 실패:', err)
                    // 라우터 이동 실패시 직접 리다이렉트
                    window.location.href = '/login'
                })
            }

            console.log('✅ [useAuth] 로그아웃 처리 완료')
        } catch (error) {
            console.error('❌ [useAuth] 로그아웃 처리 중 오류:', error)

            // 오류가 있어도 상태는 초기화
            updateGlobalState(null, false)
            authUtils.logout()
        }
    }

    // 인증 상태 강제 확인
    const checkAuthStatus = async () => {
        console.log('🔍 [useAuth] 인증 상태 강제 확인')
        return await loadUser()
    }

    // 사용자 정보 새로고침
    const refreshUserInfo = async () => {
        console.log('🔄 [useAuth] 사용자 정보 새로고침')

        // 저장된 사용자 정보 삭제 후 다시 로드
        authUtils.clearUserInfo()
        return await loadUser()
    }

    // 컴퓨티드 속성들
    const isAdmin = computed(() => {
        return globalUser.value?.role === 'ADMIN'
    })

    const isUser = computed(() => {
        return globalUser.value?.role === 'USER'
    })

    const userId = computed(() => {
        return globalUser.value?.id || null
    })

    const userRole = computed(() => {
        return globalUser.value?.role || null
    })

    const userNickname = computed(() => {
        return globalUser.value?.nickname || globalUser.value?.username || null
    })

    const userEmail = computed(() => {
        return globalUser.value?.email || null
    })

    const isOAuthUser = computed(() => {
        return globalUser.value?.provider && globalUser.value.provider !== 'local'
    })

    // 권한 확인 함수
    const hasRole = (role) => {
        if (!globalUser.value) return false

        const userRole = globalUser.value.role
        const userRoles = globalUser.value.roles

        if (userRole === role) return true
        if (Array.isArray(userRoles) && userRoles.includes(role)) return true

        return false
    }

    // 다중 권한 확인
    const hasAnyRole = (roles) => {
        if (!Array.isArray(roles) || roles.length === 0) return false
        return roles.some(role => hasRole(role))
    }

    // 모든 권한 확인
    const hasAllRoles = (roles) => {
        if (!Array.isArray(roles) || roles.length === 0) return false
        return roles.every(role => hasRole(role))
    }

    // 스토리지 변경 감지 (다른 탭에서의 로그인/로그아웃 동기화)
    const handleStorageChange = (e) => {
        if (e.key === authUtils.STORAGE_KEYS.ACCESS_TOKEN) {
            console.log('📡 [useAuth] 다른 탭에서 인증 상태 변경 감지')

            // 약간의 지연 후 상태 재로드
            setTimeout(() => {
                loadUser()
            }, 100)
        }
    }

    // 페이지 가시성 변경 감지 (탭 전환시 토큰 만료 체크)
    const handleVisibilityChange = () => {
        if (!document.hidden && globalIsLoggedIn.value) {
            console.log('👁️ [useAuth] 페이지 활성화 - RefreshToken 상태 확인')

            const refreshToken = authUtils.getRefreshToken()
            if (!refreshToken || authUtils.isTokenExpired(refreshToken)) {
                console.log('🚨 [useAuth] RefreshToken 만료 감지 - 로그아웃 처리')
                logout()
            }
        }
    }

    // 사용자 정보 업데이트 (프로필 수정 등)
    const updateUserInfo = (updatedInfo) => {
        if (!globalUser.value) return false

        const updatedUser = { ...globalUser.value, ...updatedInfo }
        authUtils.setUserInfo(updatedUser)
        updateGlobalState(updatedUser, true)

        console.log('✅ [useAuth] 사용자 정보 업데이트 완료')
        return true
    }

    // 토큰 만료 시간 확인
    const getTokenInfo = () => {
        const accessToken = authUtils.getAccessToken()
        const refreshToken = authUtils.getRefreshToken()

        return {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            accessTokenExpiry: accessToken ? authUtils.getTokenExpiryTime(accessToken) : null,
            refreshTokenExpiry: refreshToken ? authUtils.getTokenExpiryTime(refreshToken) : null,
            accessTokenTimeLeft: accessToken ? authUtils.getTokenTimeLeft(accessToken) : 0,
            refreshTokenTimeLeft: refreshToken ? authUtils.getTokenTimeLeft(refreshToken) : 0
        }
    }

    // 초기화 함수
    const initializeAuth = () => {
        if (isInitialized) {
            console.log('⏭️ [useAuth] 이미 초기화됨 - 건너뜀')
            return
        }

        console.log('🚀 [useAuth] 전역 인증 시스템 초기화 중...')

        // 기존 인증 정보 로드
        loadUser()

        // 이벤트 리스너 등록 (중복 등록 방지)
        if (!storageEventListener) {
            storageEventListener = handleStorageChange
            window.addEventListener('storage', storageEventListener)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        isInitialized = true
        console.log('✅ [useAuth] 전역 인증 시스템 초기화 완료')
    }

    // 정리 함수
    const cleanup = () => {
        console.log('🧹 [useAuth] 이벤트 리스너 정리')

        if (storageEventListener) {
            window.removeEventListener('storage', storageEventListener)
            storageEventListener = null
        }

        document.removeEventListener('visibilitychange', handleVisibilityChange)
    }

    // 디버깅 함수
    const debugAuthState = () => {
        console.group('🔍 [useAuth] 인증 상태 디버깅')
        console.log('전역 사용자:', globalUser.value)
        console.log('전역 로그인 상태:', globalIsLoggedIn.value)
        console.log('로딩 상태:', globalLoading.value)
        console.log('토큰 정보:', getTokenInfo())

        // auth utils 디버깅도 호출
        authUtils.debugAuthStatus()

        console.groupEnd()
    }

    // 라이프사이클 훅
    onMounted(() => {
        initializeAuth()
    })

    onUnmounted(() => {
        // 전역 이벤트 리스너는 유지하되 컴포넌트별 정리만 수행
        console.log('🧹 [useAuth] 컴포넌트 언마운트 (전역 상태는 유지)')
    })

    // 반환할 객체
    return {
        // 상태 (읽기 전용)
        user: globalUser,
        isLoggedIn: globalIsLoggedIn,
        loading: globalLoading,

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

// 전역 인증 상태 접근용 헬퍼 함수들
export const getGlobalAuthState = () => {
    return {
        user: globalUser.value,
        isLoggedIn: globalIsLoggedIn.value,
        loading: globalLoading.value
    }
}

export const isGloballyLoggedIn = () => globalIsLoggedIn.value

export const getGlobalUser = () => globalUser.value

export const getGlobalUserId = () => globalUser.value?.id || null