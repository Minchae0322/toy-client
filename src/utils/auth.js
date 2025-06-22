/**
 * 인증 관련 유틸리티 함수들
 */

// JWT 토큰 디코딩 함수
export const decodeJWTPayload = (token) => {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))

        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error('JWT 디코딩 오류:', error)
        return null
    }
}

// 토큰 관련 함수들
export const getAccessToken = () => {
    return localStorage.getItem('access_token')
}

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token')
}

export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken)
    if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
    }
}

export const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_info')
}

// 사용자 정보 관련 함수들
export const getUserInfo = () => {
    const userInfoStr = localStorage.getItem('user_info')
    if (userInfoStr) {
        try {
            return JSON.parse(userInfoStr)
        } catch (error) {
            console.error('사용자 정보 파싱 오류:', error)
            return null
        }
    }
    return null
}

export const setUserInfo = (userInfo) => {
    console.log('🔵 setUserInfo 호출:', userInfo)

    // JWT 토큰에서 추가 정보 추출하여 보완
    const token = getAccessToken()
    if (token && userInfo) {
        try {
            const payload = decodeJWTPayload(token)
            console.log('🔵 JWT 페이로드:', payload)

            if (payload) {
                // JWT에서 role 정보 추출하여 보완 (백엔드에서 auth 필드 사용)
                if (payload.auth && !userInfo.role) {
                    userInfo.role = payload.auth
                    console.log('🟢 JWT auth에서 role 추출:', payload.auth)
                }

                // 백엔드에서 role 필드 직접 사용하는 경우
                if (payload.role && !userInfo.role) {
                    userInfo.role = payload.role
                    console.log('🟢 JWT role에서 role 추출:', payload.role)
                }

                // 기타 누락된 정보 보완
                if (payload.email && !userInfo.email) {
                    userInfo.email = payload.email
                }

                if (payload.nickname && !userInfo.nickname) {
                    userInfo.nickname = payload.nickname
                }

                if (payload.username && !userInfo.username) {
                    userInfo.username = payload.username
                }

                if (payload.userId && !userInfo.id) {
                    userInfo.id = payload.userId
                }
            }
        } catch (error) {
            console.error('🔴 JWT 정보 추출 실패:', error)
        }
    }

    console.log('🟢 최종 저장할 사용자 정보:', userInfo)
    localStorage.setItem('user_info', JSON.stringify(userInfo))
}

export const getUserRole = () => {
    const userInfo = getUserInfo()

    // 1. user_info에서 role 확인
    if (userInfo?.role) {
        return userInfo.role
    }

    // 2. user_info에 role이 없으면 JWT에서 직접 추출
    const token = getAccessToken()
    if (token) {
        try {
            const payload = decodeJWTPayload(token)
            const role = payload?.auth || payload?.role

            if (role) {
                console.log('🟢 JWT에서 role 직접 추출:', role)

                // user_info에 role 정보 업데이트
                if (userInfo) {
                    userInfo.role = role
                    setUserInfo(userInfo)
                }

                return role
            }
        } catch (error) {
            console.error('🔴 토큰에서 role 추출 실패:', error)
        }
    }

    return null
}

export const getUserId = () => {
    const userInfo = getUserInfo()
    if (userInfo?.id) {
        return userInfo.id
    }

    // JWT에서 userId 추출 시도
    const token = getAccessToken()
    if (token) {
        try {
            const payload = decodeJWTPayload(token)
            return payload?.userId || payload?.sub || null
        } catch (error) {
            console.error('토큰에서 userId 추출 실패:', error)
        }
    }

    return null
}

// 인증 상태 확인
export const isAuthenticated = () => {
    const token = getAccessToken()
    // 토큰만 있어도 인증된 것으로 간주 (user_info는 JWT에서 추출 가능)
    return !!token
}

// 권한 확인 함수들
export const hasRole = (role) => {
    const userRole = getUserRole()
    const result = userRole === role
    console.log('🔵 hasRole 체크:', { userRole, targetRole: role, result })
    return result
}

export const isAdmin = () => {
    const result = hasRole('ADMIN')
    console.log('🔵 isAdmin 체크:', result)
    return result
}

export const isUser = () => {
    return hasRole('USER')
}

// 권한 배열 확인 (여러 권한 중 하나라도 있으면 true)
export const hasAnyRole = (roles) => {
    const userRole = getUserRole()
    return roles.includes(userRole)
}

// 로그아웃
export const logout = () => {
    clearTokens()

    // storage 이벤트 발생시켜서 다른 탭에서도 감지
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'access_token',
        newValue: null
    }))
}

// 디버깅용 함수 (개발 중에만 사용)
export const debugAuthState = () => {
    console.log('=== 인증 상태 디버깅 ===')

    const token = getAccessToken()
    const userInfo = getUserInfo()
    const userRole = getUserRole()

    console.log('토큰 존재:', !!token)
    console.log('사용자 정보:', userInfo)
    console.log('사용자 역할:', userRole)
    console.log('관리자 권한:', isAdmin())
    console.log('인증 상태:', isAuthenticated())

    if (token) {
        try {
            const payload = decodeJWTPayload(token)
            console.log('JWT 페이로드:', payload)
            console.log('JWT auth 필드:', payload?.auth)
            console.log('JWT role 필드:', payload?.role)
        } catch (error) {
            console.error('JWT 디코딩 실패:', error)
        }
    }

    return {
        hasToken: !!token,
        userInfo,
        userRole,
        isAdmin: isAdmin(),
        isAuthenticated: isAuthenticated()
    }
}


export const extractUserFromToken = () => {
    const token = getAccessToken()
    if (!token) return null

    try {
        const payload = decodeJWTPayload(token)
        if (!payload) return null

        return {
            id: payload.userId || payload.sub,
            username: payload.username || payload.sub,
            email: payload.email,
            nickname: payload.nickname || payload.username,
            role: payload.auth || payload.role || 'USER',
            provider: payload.provider || 'LOCAL'
        }
    } catch (error) {
        console.error('토큰에서 사용자 정보 추출 실패:', error)
        return null
    }
}