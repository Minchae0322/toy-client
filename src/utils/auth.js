// src/utils/auth.js - 중앙화된 인증 유틸리티
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_INFO: 'user_info',
    DEVICE_ID: 'device_id'
}

// 토큰 관리 함수들
export const getAccessToken = () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
export const getRefreshToken = () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

export const setTokens = (accessToken, refreshToken) => {
    if (accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    }
    if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    }

    // 다른 탭에 토큰 변경 알림
    window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.ACCESS_TOKEN,
        newValue: accessToken
    }))
}

export const clearTokens = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)

    // 다른 탭에 로그아웃 알림
    window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.ACCESS_TOKEN,
        newValue: null
    }))
}

// 사용자 정보 관리
export const getUserInfo = () => {
    try {
        const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
        return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
        console.error('사용자 정보 파싱 실패:', error)
        return null
    }
}

export const setUserInfo = (user) => {
    if (user) {
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
    }
}

export const clearUserInfo = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
}

// JWT 토큰 유틸리티
export const parseJwtToken = (token) => {
    if (!token) return null

    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join('')
        )
        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error('JWT 토큰 파싱 실패:', error)
        return null
    }
}

export const isTokenExpired = (token) => {
    if (!token) return true

    const payload = parseJwtToken(token)
    if (!payload || !payload.exp) return true

    const currentTime = Date.now() / 1000
    const buffer = 30 // 30초 버퍼
    return payload.exp < (currentTime + buffer)
}

// 인증 상태 확인
export const isAuthenticated = () => {
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()

    if (!accessToken) {
        console.log('AccessToken이 없습니다')
        return false
    }

    // AccessToken이 유효하면 인증됨
    if (!isTokenExpired(accessToken)) {
        return true
    }

    // AccessToken 만료시 RefreshToken 확인
    if (!refreshToken) {
        console.log('RefreshToken이 없습니다')
        return false
    }

    if (isTokenExpired(refreshToken)) {
        console.log('RefreshToken이 만료되었습니다')
        return false
    }

    console.log('RefreshToken은 유효합니다 (AccessToken 갱신 필요)')
    return true
}

// 사용자 정보 추출 및 관리
export const getCurrentUser = () => {
    // 저장된 사용자 정보 우선 확인
    let user = getUserInfo()
    if (user?.id) {
        return user
    }

    // 토큰에서 사용자 정보 추출
    const token = getAccessToken()
    if (!token) {
        return null
    }

    const payload = parseJwtToken(token)
    if (!payload) {
        return null
    }

    // 토큰에서 사용자 정보 구성
    user = {
        id: payload.sub || payload.userId || payload.id || payload.user_id,
        email: payload.email,
        username: payload.username || payload.name || payload.sub,
        nickname: payload.nickname || payload.username || payload.name,
        role: payload.role || payload.auth || payload.authority || 'USER',
        roles: payload.roles || payload.authorities || [],
        provider: payload.provider || 'local',
        profileImage: payload.picture || payload.avatar_url || null,
        exp: payload.exp,
        iat: payload.iat
    }

    // 유효한 사용자 정보가 있으면 저장 후 반환
    if (user.id) {
        setUserInfo(user)
        return user
    }

    return null
}

export const getUserRole = () => {
    const user = getCurrentUser()
    return user?.role || null
}

export const getUserId = () => {
    const user = getCurrentUser()
    return user?.id || null
}

export const hasRole = (role) => {
    const user = getCurrentUser()
    if (!user) return false

    const userRole = user.role
    const userRoles = user.roles

    if (userRole === role) return true
    if (Array.isArray(userRoles) && userRoles.includes(role)) return true

    return false
}

// 디바이스 ID 관리
export const getDeviceId = () => {
    let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
    if (!deviceId) {
        deviceId = 'web-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId)
    }
    return deviceId
}

// 로그아웃 처리
export const logout = () => {
    console.log('로컬 인증 정보 정리 중...')
    clearTokens()
    clearUserInfo()
}

// 백엔드 로그아웃 (별도 처리)
export const logoutWithBackend = async () => {
    // 이 함수는 axios.js에서 구현
    throw new Error('백엔드 로그아웃은 authService.logout()을 사용하세요')
}

// 토큰 검증
export const validateTokens = () => {
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()

    const result = {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenValid: accessToken ? !isTokenExpired(accessToken) : false,
        refreshTokenValid: refreshToken ? !isTokenExpired(refreshToken) : false,
        needsRefresh: false,
        isAuthenticated: false
    }

    if (!accessToken) {
        return result
    }

    if (!isTokenExpired(accessToken)) {
        result.isAuthenticated = true
        return result
    }

    // AccessToken 만료, RefreshToken 확인
    if (refreshToken && !isTokenExpired(refreshToken)) {
        result.needsRefresh = true
        result.isAuthenticated = true
    }

    return result
}

// 디버깅 함수
export const debugAuthStatus = () => {
    console.group('🔍 인증 상태 디버깅')

    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()
    const user = getCurrentUser()
    const validation = validateTokens()

    console.log('Access Token:', accessToken ? '존재' : '없음')
    console.log('Refresh Token:', refreshToken ? '존재' : '없음')
    console.log('사용자 정보:', user)
    console.log('인증 상태:', isAuthenticated())
    console.log('토큰 검증 결과:', validation)

    if (accessToken) {
        const payload = parseJwtToken(accessToken)
        console.log('Access Token 만료:', isTokenExpired(accessToken))
        console.log('Access Token 만료 시간:', payload?.exp ? new Date(payload.exp * 1000) : 'N/A')
    }

    if (refreshToken) {
        const payload = parseJwtToken(refreshToken)
        console.log('Refresh Token 만료:', isTokenExpired(refreshToken))
        console.log('Refresh Token 만료 시간:', payload?.exp ? new Date(payload.exp * 1000) : 'N/A')
    }

    console.groupEnd()
}

// 토큰 만료 시간 계산
export const getTokenExpiryTime = (token) => {
    const payload = parseJwtToken(token)
    return payload?.exp ? new Date(payload.exp * 1000) : null
}

export const getTokenTimeLeft = (token) => {
    const expiryTime = getTokenExpiryTime(token)
    if (!expiryTime) return 0

    const now = new Date()
    const timeLeft = expiryTime.getTime() - now.getTime()
    return Math.max(0, timeLeft)
}

// OAuth 관련 유틸리티
export const isOAuthUser = () => {
    const user = getCurrentUser()
    return user?.provider && user.provider !== 'local'
}

export const getOAuthProvider = () => {
    const user = getCurrentUser()
    return user?.provider || 'local'
}

// API 헤더 생성
export const getApiHeaders = () => {
    const headers = {
        'Content-Type': 'application/json'
    }

    const accessToken = getAccessToken()
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
    }

    return headers
}