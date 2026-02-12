// src/utils/auth.js - 중앙화된 인증 유틸리티 (HttpOnly 쿠키 버전)

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token', // 사용 안 하지만 호환성 유지
    USER_INFO: 'user_info',
    DEVICE_ID: 'device_id',
    REMEMBER_ME: 'remember_me'
}

// ==================== 자동 로그인 관리 ====================

/**
 * 자동 로그인 설정 여부 확인
 * remember_me 값은 항상 localStorage에 저장 (브라우저 닫아도 유지)
 */
export const getRememberMe = () => {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true'
}

/**
 * 자동 로그인 설정 저장
 */
export const setRememberMe = (value) => {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, String(value))
}

/**
 * 현재 자동 로그인 설정에 따른 스토리지 반환
 * - 자동 로그인 ON: localStorage (브라우저 닫아도 유지)
 * - 자동 로그인 OFF: sessionStorage (브라우저 닫으면 삭제)
 */
const getStorage = () => {
    return getRememberMe() ? localStorage : sessionStorage
}

// ==================== 토큰 관리 ====================

/**
 * AccessToken 가져오기 (자동 로그인 설정에 따라 저장소 분기)
 */
export const getAccessToken = () => {
    // 두 저장소 모두 확인 (자동 로그인 설정 변경 대응)
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        || sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * RefreshToken 가져오기
 * - HttpOnly 쿠키로 관리되므로 JavaScript에서 직접 접근 불가
 * - 브라우저가 withCredentials: true 요청 시 자동으로 쿠키 전송
 * - 쿠키 존재 여부는 서버 응답(401)으로만 확인 가능
 * @returns {null} HttpOnly 쿠키는 JS에서 읽을 수 없음
 */
export const getRefreshToken = () => {
    // HttpOnly 쿠키는 JavaScript로 접근 불가
    // 존재 여부 확인이 필요하면 서버에 요청해야 함
    return null
}

/**
 * 토큰 저장
 * @param {string} accessToken - AccessToken (localStorage에 저장)
 * @param {string|null} refreshToken - RefreshToken (무시됨, 쿠키로 관리)
 */
export const setTokens = (accessToken, refreshToken = null) => {
    if (accessToken) {
        const storage = getStorage()
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
        console.log(`✅ AccessToken 저장 완료 (${getRememberMe() ? 'localStorage' : 'sessionStorage'})`)
    }

    // refreshToken은 HttpOnly 쿠키로 관리되므로 무시
    if (refreshToken) {
        console.log('ℹ️ RefreshToken은 HttpOnly 쿠키로 관리됩니다')
    }

    // 다른 탭에 토큰 변경 알림
    window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.ACCESS_TOKEN,
        newValue: accessToken
    }))
}

/**
 * AccessToken만 저장 (토큰 갱신 시 사용)
 * @param {string} accessToken - 새로운 AccessToken
 */
export const setAccessToken = (accessToken) => {
    if (accessToken) {
        const storage = getStorage()
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
        console.log('✅ AccessToken 갱신 저장 완료')

        // 다른 탭에 토큰 변경 알림
        window.dispatchEvent(new StorageEvent('storage', {
            key: STORAGE_KEYS.ACCESS_TOKEN,
            newValue: accessToken
        }))
    }
}

/**
 * 모든 토큰 및 사용자 정보 삭제
 */
export const clearTokens = () => {
    // 두 저장소 모두 정리
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN) // 호환성
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.USER_INFO)

    console.log('🗑️ 로컬 인증 정보 삭제 완료')

    // 다른 탭에 로그아웃 알림
    window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.ACCESS_TOKEN,
        newValue: null
    }))
}

// ==================== 사용자 정보 관리 ====================

/**
 * 저장된 사용자 정보 가져오기
 */
export const getUserInfo = () => {
    try {
        // 두 저장소 모두 확인
        const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
            || sessionStorage.getItem(STORAGE_KEYS.USER_INFO)
        return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
        console.error('❌ 사용자 정보 파싱 실패:', error)
        return null
    }
}

/**
 * 사용자 정보 저장
 */
export const setUserInfo = (user) => {
    if (user) {
        const storage = getStorage()
        storage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
        console.log('✅ 사용자 정보 저장 완료:', user.email || user.username)
    }
}

/**
 * 사용자 정보 삭제
 */
export const clearUserInfo = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    sessionStorage.removeItem(STORAGE_KEYS.USER_INFO)
}

// ==================== JWT 토큰 유틸리티 ====================

/**
 * JWT 토큰 파싱
 */
export const parseJwtToken = (token) => {
    if (!token) return null

    try {
        const base64Url = token.split('.')[1]
        if (!base64Url) return null

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join('')
        )
        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error('❌ JWT 토큰 파싱 실패:', error)
        return null
    }
}

/**
 * 토큰 만료 여부 확인
 * @param {string|null} token - JWT 토큰 (null이면 만료로 처리)
 */
export const isTokenExpired = (token) => {
    if (!token) return true

    const payload = parseJwtToken(token)
    if (!payload || !payload.exp) return true

    const currentTime = Date.now() / 1000
    const buffer = 30 // 30초 버퍼
    return payload.exp < (currentTime + buffer)
}

/**
 * 토큰 갱신이 필요한지 확인 (만료 5분 전)
 */
export const shouldRefreshToken = (token) => {
    if (!token) return false

    const payload = parseJwtToken(token)
    if (!payload || !payload.exp) return false

    const currentTime = Date.now() / 1000
    const fiveMinutes = 5 * 60
    return payload.exp < (currentTime + fiveMinutes)
}

/**
 * 토큰 남은 시간 (분)
 */
export const getTokenTimeRemaining = (token) => {
    if (!token) return 0

    const payload = parseJwtToken(token)
    if (!payload || !payload.exp) return 0

    const currentTime = Date.now() / 1000
    const remaining = payload.exp - currentTime
    return Math.max(0, Math.floor(remaining / 60))
}

// ==================== 인증 상태 확인 ====================

/**
 * 사용자 인증 여부 확인
 */
export const isAuthenticated = () => {
    const accessToken = getAccessToken()

    if (!accessToken) {
        console.log('❌ AccessToken이 없습니다')
        return false
    }

    // AccessToken이 유효하면 인증됨
    if (!isTokenExpired(accessToken)) {
        return true
    }

    // AccessToken 만료 - RefreshToken은 HttpOnly 쿠키에서 관리
    console.log('⏰ AccessToken 만료 (RefreshToken은 쿠키로 관리)')
    // 서버가 쿠키 확인 후 401 응답하면 자동으로 갱신 시도
    return true
}

// ==================== 사용자 정보 추출 ====================

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export const getCurrentUser = () => {
    // 1. 저장된 사용자 정보 우선 확인
    let user = getUserInfo()
    if (user?.id && typeof user.id === 'number' && user.id < 1000000000) {
        // 유효한 userId인지 확인 (타임스탬프가 아닌지)
        return user
    }

    // 2. AccessToken에서 사용자 정보 추출
    const token = getAccessToken()
    if (!token) {
        return null
    }

    const payload = parseJwtToken(token)
    if (!payload) {
        return null
    }

    // 3. 토큰 페이로드에서 사용자 정보 구성 - userId를 명시적으로 사용
    user = {
        id: payload.userId,  // 명시적으로 userId만 사용
        email: payload.email || payload.username,
        username: payload.username || payload.sub,
        nickname: payload.nickname || payload.username,
        role: payload.role || payload.auth || 'USER',
        provider: payload.provider || 'local',
        profileImage: null
    }

    // 4. 유효한 사용자 정보가 있으면 저장 후 반환
    if (user.id) {
        setUserInfo(user)
        return user
    }

    return null
}

/**
 * 사용자 역할 가져오기
 */
export const getUserRole = () => {
    const user = getCurrentUser()
    return user?.role || null
}

/**
 * 사용자 ID 가져오기
 */
export const getUserId = () => {
    const user = getCurrentUser()
    return user?.id || null
}

/**
 * 특정 역할 소유 여부 확인
 */
export const hasRole = (role) => {
    const user = getCurrentUser()
    if (!user) return false

    const userRole = user.role
    const userRoles = user.roles

    if (userRole === role) return true
    if (Array.isArray(userRoles) && userRoles.includes(role)) return true

    return false
}

// ==================== 디바이스 관리 ====================

/**
 * 디바이스 ID 가져오기 (없으면 생성)
 */
export const getDeviceId = () => {
    let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
    if (!deviceId) {
        deviceId = 'web-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId)
    }
    return deviceId
}

// ==================== 로그아웃 ====================

/**
 * 로컬 로그아웃 (토큰 및 사용자 정보 삭제)
 */
export const logout = () => {
    console.log('🚪 로컬 인증 정보 정리 중...')
    clearTokens()
    clearUserInfo()
    // 자동 로그인 설정은 유지 (다음 로그인 시 체크박스 상태 복원용)
    console.log('✅ 로컬 로그아웃 완료')
}

/**
 * 모든 인증 데이터 삭제 (디버깅용)
 */
export const clearAllAuthData = () => {
    console.log('🗑️ 모든 인증 데이터 삭제 중...')
    localStorage.clear()
    console.log('✅ 완료')
}

// ==================== 토큰 검증 ====================

/**
 * 토큰 상태 검증
 */
export const validateTokens = () => {
    const accessToken = getAccessToken()

    const result = {
        hasAccessToken: !!accessToken,
        hasRefreshToken: true, // 쿠키로 관리되므로 항상 true로 가정
        accessTokenValid: accessToken ? !isTokenExpired(accessToken) : false,
        refreshTokenValid: true, // 서버가 검증
        needsRefresh: false,
        isAuthenticated: false
    }

    if (!accessToken) {
        result.hasRefreshToken = false
        return result
    }

    if (!isTokenExpired(accessToken)) {
        result.isAuthenticated = true
        return result
    }

    // AccessToken 만료 - RefreshToken은 쿠키에서 관리
    result.needsRefresh = true
    result.isAuthenticated = true // 서버가 쿠키 검증

    return result
}

// ==================== 토큰 만료 시간 ====================

/**
 * 토큰 만료 시간 가져오기
 */
export const getTokenExpiryTime = (token) => {
    if (!token) return null

    const payload = parseJwtToken(token)
    return payload?.exp ? new Date(payload.exp * 1000) : null
}

/**
 * 토큰 남은 시간 (밀리초)
 */
export const getTokenTimeLeft = (token) => {
    const expiryTime = getTokenExpiryTime(token)
    if (!expiryTime) return 0

    const now = new Date()
    const timeLeft = expiryTime.getTime() - now.getTime()
    return Math.max(0, timeLeft)
}

// ==================== OAuth 관련 ====================

/**
 * OAuth 사용자 여부 확인
 */
export const isOAuthUser = () => {
    const user = getCurrentUser()
    return user?.provider && user.provider !== 'local'
}

/**
 * OAuth 제공자 가져오기
 */
export const getOAuthProvider = () => {
    const user = getCurrentUser()
    return user?.provider || 'local'
}

// ==================== API 헤더 ====================

/**
 * API 요청용 헤더 생성
 */
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

// ==================== 디버깅 ====================

/**
 * 인증 상태 디버깅
 */
export const debugAuthStatus = () => {
    console.group('🔍 인증 상태 디버깅')

    const accessToken = getAccessToken()
    const user = getCurrentUser()
    const validation = validateTokens()

    console.log('=== 토큰 정보 ===')
    console.log('Access Token:', accessToken ? '존재 ✅' : '없음 ❌')
    console.log('Refresh Token:', 'HttpOnly 쿠키로 관리 🍪 (JS 접근 불가)')

    if (accessToken) {
        const payload = parseJwtToken(accessToken)
        console.log('Access Token 만료:', isTokenExpired(accessToken) ? '만료됨 ⏰' : '유효함 ✅')
        console.log('Access Token 만료 시간:', payload?.exp ? new Date(payload.exp * 1000) : 'N/A')
        console.log('남은 시간:', getTokenTimeRemaining(accessToken), '분')
    }

    console.log('=== 사용자 정보 ===')
    console.log('사용자:', user)
    console.log('사용자 ID:', getUserId())
    console.log('사용자 역할:', getUserRole())
    console.log('OAuth 사용자:', isOAuthUser())
    console.log('제공자:', getOAuthProvider())

    console.log('=== 인증 상태 ===')
    console.log('인증됨:', isAuthenticated())
    console.log('토큰 검증 결과:', validation)

    console.log('=== 기타 ===')
    console.log('디바이스 ID:', getDeviceId())

    console.log('=== 쿠키 확인 방법 ===')
    console.log('개발자 도구 → Application → Cookies 에서 refreshToken 쿠키 확인')
    console.log('⚠️ 쿠키가 없다면 백엔드 설정 확인 필요:')
    console.log('   - secure=false (HTTP 환경)')
    console.log('   - SameSite=None 또는 Lax')
    console.log('   - Access-Control-Allow-Credentials: true')

    console.groupEnd()
}