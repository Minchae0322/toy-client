// utils/auth.js
// 전체 앱에서 사용하는 인증 관련 유틸리티

/**
 * 토큰 저장소 키 상수
 */
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_INFO: 'user_info',
    DEVICE_ID: 'device_id'
}

/**
 * 토큰 저장 방식 설정
 * 개발환경: localStorage (디버깅 편의)
 * 프로덕션: sessionStorage (보안 강화)
 */
const getStorage = () => {
    return import.meta.env.PROD ? sessionStorage : localStorage
}

// ==================== 토큰 관리 ====================

/**
 * Access Token 저장
 */
export const setAccessToken = (token) => {
    if (!token) {
        console.warn('⚠️ [Auth] 빈 Access Token을 저장하려고 시도했습니다.')
        return
    }

    const cleanToken = token.replace('Bearer ', '').trim()
    getStorage().setItem(STORAGE_KEYS.ACCESS_TOKEN, cleanToken)
    console.log('💾 [Auth] Access Token 저장 완료')
}

/**
 * Access Token 조회
 */
export const getAccessToken = () => {
    const token = getStorage().getItem(STORAGE_KEYS.ACCESS_TOKEN)
    return token ? token.trim() : null
}

/**
 * Refresh Token 저장
 */
export const setRefreshToken = (token) => {
    if (!token) {
        console.warn('⚠️ [Auth] 빈 Refresh Token을 저장하려고 시도했습니다.')
        return
    }

    const cleanToken = token.replace('Bearer ', '').trim()
    getStorage().setItem(STORAGE_KEYS.REFRESH_TOKEN, cleanToken)
    console.log('💾 [Auth] Refresh Token 저장 완료')
}

/**
 * Refresh Token 조회
 */
export const getRefreshToken = () => {
    const token = getStorage().getItem(STORAGE_KEYS.REFRESH_TOKEN)
    return token ? token.trim() : null
}

/**
 * 토큰 한번에 저장
 */
export const setTokens = (accessToken, refreshToken) => {
    if (accessToken) setAccessToken(accessToken)
    if (refreshToken) setRefreshToken(refreshToken)
    console.log('💾 [Auth] 토큰 저장 완료 (Access + Refresh)')
}

/**
 * 모든 토큰 삭제
 */
export const clearTokens = () => {
    getStorage().removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    getStorage().removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    console.log('🗑️ [Auth] 모든 토큰 삭제 완료')
}

// ==================== 사용자 정보 관리 ====================

/**
 * 사용자 정보 저장
 */
export const setUserInfo = (userInfo) => {
    if (!userInfo) {
        console.warn('⚠️ [Auth] 빈 사용자 정보를 저장하려고 시도했습니다.')
        return
    }

    getStorage().setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    console.log('💾 [Auth] 사용자 정보 저장 완료:', userInfo)
}

/**
 * 사용자 정보 조회
 */
export const getUserInfo = () => {
    try {
        const userInfoStr = getStorage().getItem(STORAGE_KEYS.USER_INFO)
        if (!userInfoStr) return null

        const userInfo = JSON.parse(userInfoStr)
        return userInfo
    } catch (error) {
        console.error('❌ [Auth] 사용자 정보 파싱 실패:', error)
        return null
    }
}

/**
 * 사용자 ID 조회
 */
export const getUserId = () => {
    const userInfo = getUserInfo()
    return userInfo?.id || userInfo?.userId || null
}

/**
 * 사용자 역할 조회
 */
export const getUserRole = () => {
    const userInfo = getUserInfo()
    return userInfo?.role || userInfo?.roles?.[0] || null
}

/**
 * 사용자 정보 삭제
 */
export const clearUserInfo = () => {
    getStorage().removeItem(STORAGE_KEYS.USER_INFO)
    console.log('🗑️ [Auth] 사용자 정보 삭제 완료')
}

// ==================== 디바이스 관리 ====================

/**
 * 디바이스 ID 생성/조회
 */
export const getDeviceId = () => {
    let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
    if (!deviceId) {
        deviceId = generateDeviceId()
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId)
        console.log('🆔 [Auth] 새 디바이스 ID 생성:', deviceId)
    }
    return deviceId
}

/**
 * 디바이스 ID 생성
 */
const generateDeviceId = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `web_${random}_${timestamp}`
}

// ==================== 토큰 검증 ====================

/**
 * JWT 토큰 파싱
 */
export const parseJwtToken = (token) => {
    try {
        if (!token) return null

        const cleanToken = token.replace('Bearer ', '')
        const parts = cleanToken.split('.')

        if (parts.length !== 3) {
            throw new Error('올바르지 않은 JWT 형식')
        }

        const payload = JSON.parse(atob(parts[1]))
        return payload
    } catch (error) {
        console.error('❌ [Auth] JWT 토큰 파싱 실패:', error)
        return null
    }
}

/**
 * 토큰 만료 확인
 */
export const isTokenExpired = (token) => {
    const payload = parseJwtToken(token)
    if (!payload || !payload.exp) return true

    const currentTime = Date.now() / 1000
    return payload.exp <= currentTime
}

/**
 * 토큰 갱신 필요 여부 확인 (5분 버퍼)
 */
export const shouldRefreshToken = (token, bufferMinutes = 5) => {
    const payload = parseJwtToken(token)
    if (!payload || !payload.exp) return true

    const currentTime = Date.now() / 1000
    const bufferTime = bufferMinutes * 60

    return payload.exp <= (currentTime + bufferTime)
}

/**
 * 토큰 남은 시간 (분 단위)
 */
export const getTokenTimeRemaining = (token) => {
    const payload = parseJwtToken(token)
    if (!payload || !payload.exp) return 0

    const currentTime = Date.now() / 1000
    const remainingSeconds = payload.exp - currentTime

    return Math.max(0, Math.floor(remainingSeconds / 60))
}

/**
 * 현재 사용 중인 토큰이 유효한지 확인
 */
export const hasValidToken = () => {
    const token = getAccessToken()
    if (!token) return false

    return !isTokenExpired(token)
}

// ==================== 인증 상태 ====================

/**
 * 인증 상태 확인
 */
export const isAuthenticated = () => {
    const token = getAccessToken()
    const userInfo = getUserInfo()

    if (!token || !userInfo) {
        return false
    }

    return hasValidToken()
}

/**
 * 관리자 권한 확인
 */
export const isAdmin = () => {
    const role = getUserRole()
    return role === 'ADMIN' || role === 'admin'
}

/**
 * 특정 역할 확인
 */
export const hasRole = (role) => {
    const userRole = getUserRole()
    const userInfo = getUserInfo()

    // 단일 역할 확인
    if (userRole === role) return true

    // 복수 역할 확인
    if (userInfo?.roles && Array.isArray(userInfo.roles)) {
        return userInfo.roles.includes(role)
    }

    return false
}

// ==================== 로그아웃 ====================

/**
 * 완전 로그아웃 (모든 인증 정보 삭제)
 */
export const logout = () => {
    console.log('🚪 [Auth] 로그아웃 처리 중...')

    clearTokens()
    clearUserInfo()
    // 디바이스 ID는 유지 (재로그인 시 같은 디바이스로 인식)

    console.log('✅ [Auth] 로그아웃 완료')
}

// ==================== 백엔드 토큰 갱신 ====================

/**
 * 백엔드 RefreshJwtFilter를 활용한 토큰 갱신
 */
export const refreshTokenWithBackend = async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
        return { success: false, error: 'No refresh token' }
    }

    try {
        console.log('🔄 [Auth] 백엔드 RefreshJwtFilter를 통한 토큰 갱신...')

        const authServerUrl = import.meta.env.DEV
            ? 'http://localhost:8081'
            : (import.meta.env.VITE_AUTH_SERVER_URL || 'https://your-auth-server.com')

        // 백엔드의 보호된 엔드포인트들
        const testEndpoints = [
            `${authServerUrl}/api/v1/auth/verify`,
            `${authServerUrl}/api/v1/users/profile`,
            `${authServerUrl}/api/v1/test/protected`
        ]

        for (const endpoint of testEndpoints) {
            try {
                console.log(`🌐 [Auth] 토큰 갱신 요청: ${endpoint}`)

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${refreshToken}`
                    }
                })

                console.log(`📡 [Auth] 응답 상태: ${response.status}`)

                // 200 OK 또는 404도 인증은 성공 (엔드포인트가 없을 수 있음)
                if (response.ok || response.status === 404) {
                    const newAccessToken = response.headers.get('Authorization')

                    if (newAccessToken) {
                        const cleanToken = newAccessToken.replace('Bearer ', '')
                        setAccessToken(cleanToken)

                        console.log('✅ [Auth] 백엔드 토큰 갱신 성공:', endpoint)
                        return {
                            success: true,
                            accessToken: cleanToken,
                            refreshToken: refreshToken
                        }
                    } else {
                        console.warn('⚠️ [Auth] 응답 헤더에 새로운 토큰이 없습니다.')
                    }
                } else if (response.status === 401) {
                    console.error('❌ [Auth] Refresh Token이 만료되었습니다.')
                    logout()
                    return { success: false, error: 'Refresh token expired' }
                }

            } catch (endpointError) {
                console.warn(`⚠️ [Auth] ${endpoint} 요청 실패:`, endpointError.message)
                continue
            }
        }

        console.error('❌ [Auth] 모든 엔드포인트에서 토큰 갱신 실패')
        return { success: false, error: 'All endpoints failed' }

    } catch (error) {
        console.error('❌ [Auth] 토큰 갱신 중 오류:', error)
        return { success: false, error: error.message }
    }
}

// ==================== 디버깅 ====================

/**
 * 인증 상태 디버깅
 */
export const debugAuthStatus = () => {
    console.group('🔍 [Auth] 인증 상태 디버깅')

    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()
    const userInfo = getUserInfo()

    console.log('=== 토큰 정보 ===')
    console.log('Access Token 존재:', !!accessToken)
    console.log('Refresh Token 존재:', !!refreshToken)

    if (accessToken) {
        console.log('Access Token 길이:', accessToken.length)
        console.log('토큰 시작 부분:', accessToken.substring(0, 20) + '...')
        console.log('토큰 만료:', isTokenExpired(accessToken))
        console.log('토큰 갱신 필요:', shouldRefreshToken(accessToken))
        console.log('토큰 남은 시간:', getTokenTimeRemaining(accessToken), '분')

        const payload = parseJwtToken(accessToken)
        if (payload) {
            console.log('토큰 발급 시간:', new Date(payload.iat * 1000).toLocaleString())
            console.log('토큰 만료 시간:', new Date(payload.exp * 1000).toLocaleString())
        }
    }

    console.log('=== 사용자 정보 ===')
    console.log('사용자 정보 존재:', !!userInfo)
    if (userInfo) {
        console.log('사용자 ID:', getUserId())
        console.log('사용자 역할:', getUserRole())
        console.log('전체 사용자 정보:', userInfo)
    }

    console.log('=== 인증 상태 ===')
    console.log('인증됨:', isAuthenticated())
    console.log('관리자:', isAdmin())
    console.log('유효한 토큰:', hasValidToken())

    console.log('=== 저장소 정보 ===')
    console.log('저장 방식:', import.meta.env.PROD ? 'sessionStorage' : 'localStorage')
    console.log('디바이스 ID:', getDeviceId())

    console.groupEnd()
}

/**
 * 저장소 정리 (개발용)
 */
export const clearAllAuthData = () => {
    console.log('🧹 [Auth] 모든 인증 데이터 삭제 중...')

    // 모든 저장소에서 인증 관련 데이터 삭제
    const storages = [localStorage, sessionStorage]
    const keys = Object.values(STORAGE_KEYS)

    storages.forEach(storage => {
        keys.forEach(key => {
            storage.removeItem(key)
        })
    })

    console.log('✅ [Auth] 모든 인증 데이터 삭제 완료')
}

// ==================== 유틸리티 ====================

/**
 * 인증 헤더 생성
 */
export const getAuthHeader = () => {
    const token = getAccessToken()
    if (!token) return {}

    return {
        'Authorization': `Bearer ${token}`
    }
}

/**
 * API 요청용 공통 헤더 생성
 */
export const getApiHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'X-Device-ID': getDeviceId(),
        'X-User-Agent': navigator.userAgent,
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'X-Language': navigator.language || 'ko',
        ...getAuthHeader()
    }
}

// ==================== 내보내기 ====================

// 상수 내보내기
export { STORAGE_KEYS }

// 기본 객체로 모든 함수 내보내기 (기존 코드 호환성)
export default {
    // 토큰 관리
    setAccessToken,
    getAccessToken,
    setRefreshToken,
    getRefreshToken,
    setTokens,
    clearTokens,

    // 사용자 정보
    setUserInfo,
    getUserInfo,
    getUserId,
    getUserRole,
    clearUserInfo,

    // 디바이스
    getDeviceId,

    // 토큰 검증
    parseJwtToken,
    isTokenExpired,
    shouldRefreshToken,
    getTokenTimeRemaining,
    hasValidToken,

    // 인증 상태
    isAuthenticated,
    isAdmin,
    hasRole,

    // 로그아웃
    logout,

    // 백엔드 연동
    refreshTokenWithBackend,

    // 디버깅
    debugAuthStatus,
    clearAllAuthData,

    // 유틸리티
    getAuthHeader,
    getApiHeaders
}