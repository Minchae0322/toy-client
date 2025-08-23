import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as authUtils from '@/utils/auth.js'

// 전역 상태
const userInfo = ref(null)
const isLoggedIn = ref(false)

export function useAuth() {
    const router = useRouter()

    // 사용자 정보 로드 - JWT에서 정보 추출 로직 강화
    const loadUserInfo = () => {
        const user = authUtils.getUserInfo()
        const token = authUtils.getAccessToken()

        console.log('🔵 loadUserInfo 호출:', { hasToken: !!token, user })

        if (token) {
            let finalUser = user

            // user_info가 없거나 role이 없으면 JWT에서 추출
            if (!user || !user.role) {
                console.log('🔵 JWT에서 사용자 정보 추출 시도')
                const extractedUser = extractUserFromToken()

                if (extractedUser) {
                    // 기존 user 정보와 JWT 정보 병합
                    finalUser = {
                        ...user,
                        ...extractedUser,
                        // 기존 정보가 있으면 우선 사용
                        ...(user && Object.keys(user).length > 0 ? user : {})
                    }

                    console.log('🟢 JWT에서 추출된 사용자 정보:', finalUser)

                    // 추출된 정보를 localStorage에 저장
                    authUtils.setUserInfo(finalUser)
                }
            }

            if (finalUser) {
                userInfo.value = finalUser
                isLoggedIn.value = true

                console.log('🟢 최종 사용자 정보:', {
                    id: finalUser.id,
                    username: finalUser.username,
                    role: finalUser.role,
                    isAdmin: finalUser.role === 'ADMIN'
                })
            } else {
                console.log('🔴 사용자 정보 추출 실패')
                userInfo.value = null
                isLoggedIn.value = false
            }
        } else {
            console.log('🔴 토큰 없음')
            userInfo.value = null
            isLoggedIn.value = false
        }
    }

    // JWT에서 사용자 정보 추출하는 헬퍼 함수
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
                provider: payload.provider
            }
        } catch (error) {
            console.error('🔴 JWT에서 사용자 정보 추출 실패:', error)
            return null
        }
    }

    // 로그인 처리 - JWT 정보 완전 추출
    const login = (tokens, user) => {
        console.log('🔵 login 호출:', { tokens, user })

        // 토큰 저장
        authUtils.setTokens(tokens.accessToken, tokens.refreshToken)

        // JWT에서 완전한 사용자 정보 구성
        let completeUser = { ...user }

        if (tokens.accessToken) {
            try {
                const payload = authUtils.parseJwtToken(tokens.accessToken) // 수정된 부분
                console.log('🔵 로그인 시 JWT 페이로드:', payload)

                if (payload) {
                    // JWT 정보로 사용자 정보 보완/덮어쓰기
                    completeUser = {
                        id: user.id || payload.userId || payload.sub,
                        username: user.username || payload.username || payload.sub,
                        email: user.email || payload.email,
                        nickname: user.nickname || payload.nickname || payload.username,
                        role: payload.auth || payload.role || user.role || 'USER', // JWT 우선
                        provider: user.provider || payload.provider,
                        profileImage: user.profileImage
                    }

                    console.log('🟢 JWT로 보완된 완전한 사용자 정보:', completeUser)
                }
            } catch (error) {
                console.error('🔴 JWT 정보 추출 실패:', error)
            }
        }

        // 완전한 사용자 정보 저장
        authUtils.setUserInfo(completeUser)
        loadUserInfo()
    }

    // 로그아웃 처리
    const logout = () => {
        authUtils.logout()
        loadUserInfo()
        router.push({ name: 'Login' })
    }

    // 권한 확인 - 다중 소스 체크
    const hasRole = (role) => {
        // 1. userInfo에서 확인
        if (userInfo.value?.role === role) {
            return true
        }

        // 2. authUtils에서 확인 (JWT 직접 체크)
        return authUtils.hasRole(role)
    }

    // 계산된 속성들 - 강력한 권한 체크
    const isAdmin = computed(() => {
        // 1. userInfo에서 확인
        if (userInfo.value?.role === 'ADMIN') {
            console.log('🟢 userInfo에서 ADMIN 확인')
            return true
        }

        // 2. authUtils에서 확인 (JWT 직접 체크)
        const result = authUtils.isAdmin()
        console.log('🔵 authUtils.isAdmin():', result)

        // 3. JWT에서 직접 확인 (최후 수단)
        const token = authUtils.getAccessToken()
        if (token && !result) {
            try {
                const payload = authUtils.parseJwtToken(token) // 수정된 부분
                const jwtRole = payload?.auth || payload?.role
                const isAdminFromJWT = jwtRole === 'ADMIN'
                console.log('🔵 JWT에서 직접 확인:', { jwtRole, isAdminFromJWT })

                if (isAdminFromJWT) {
                    // userInfo 업데이트
                    if (userInfo.value) {
                        userInfo.value.role = jwtRole
                    }
                    return true
                }
            } catch (error) {
                console.error('🔴 JWT 직접 체크 실패:', error)
            }
        }

        return result
    })

    const isUser = computed(() => {
        return userInfo.value?.role === 'USER' || authUtils.hasRole('USER')
    })

    const userId = computed(() => {
        return userInfo.value?.id || authUtils.getUserId()
    })

    const userRole = computed(() => {
        // 1. userInfo에서 확인
        if (userInfo.value?.role) {
            return userInfo.value.role
        }

        // 2. authUtils에서 확인 (JWT 포함)
        const role = authUtils.getUserRole()
        console.log('🔵 userRole computed:', {
            fromUserInfo: userInfo.value?.role,
            fromAuthUtils: role
        })

        return role
    })

    // 강제 권한 새로고침 함수 (디버깅/개발용)
    const refreshAuth = () => {
        console.log('🔄 권한 정보 강제 새로고침')
        loadUserInfo()

        // 강제로 computed 재계산 트리거
        const token = authUtils.getAccessToken()
        if (token) {
            try {
                const payload = authUtils.parseJwtToken(token) // 수정된 부분
                console.log('🔵 새로고침 시 JWT 페이로드:', payload)

                if (payload && userInfo.value) {
                    userInfo.value.role = payload.auth || payload.role
                    console.log('🟢 role 강제 업데이트:', userInfo.value.role)
                }
            } catch (error) {
                console.error('🔴 새로고침 실패:', error)
            }
        }
    }

    // 스토리지 변경 감지
    const handleStorageChange = (e) => {
        if (e.key === 'access_token' && e.newValue === null) {
            loadUserInfo()
        }
    }

    onMounted(() => {
        loadUserInfo()
        window.addEventListener('storage', handleStorageChange)

        // 개발 중 디버깅을 위한 전역 함수 등록
        if (import.meta.env.DEV) {
            window.debugAuth = () => {
                console.log('=== useAuth 디버깅 ===')
                console.log('userInfo:', userInfo.value)
                console.log('isLoggedIn:', isLoggedIn.value)
                console.log('isAdmin:', isAdmin.value)
                console.log('userRole:', userRole.value)
                authUtils.debugAuthStatus()
                return {
                    userInfo: userInfo.value,
                    isLoggedIn: isLoggedIn.value,
                    isAdmin: isAdmin.value,
                    userRole: userRole.value
                }
            }

            window.refreshAuth = refreshAuth
        }
    })

    // 사용자 정보 변경 감지
    watch(
        () => authUtils.getUserInfo(),
        (newUserInfo) => {
            console.log('🔵 사용자 정보 변경 감지:', newUserInfo)
            userInfo.value = newUserInfo
            isLoggedIn.value = !!(authUtils.getAccessToken() && newUserInfo)
        },
        { deep: true }
    )

    return {
        // 상태
        userInfo,
        isLoggedIn,
        isAdmin,
        isUser,
        userId,
        userRole,

        // 메서드
        login,
        logout,
        loadUserInfo,
        hasRole,
        refreshAuth, // 디버깅용
        extractUserFromToken, // 새로 추가된 헬퍼 함수

        // 유틸리티
        utils: authUtils
    }
}