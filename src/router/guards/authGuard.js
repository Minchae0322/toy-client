// src/router/guards/authGuard.js
import * as authUtils from '@/utils/auth.js'

/**
 * 인증 가드 - 로그인이 필요한 페이지 보호
 * RefreshToken 만료 시 자동으로 Login 페이지로 리다이렉트
 */
export const authGuard = async (to, from, next) => {
    // requiresAuth가 false인 페이지는 인증 체크 하지 않음
    if (to.meta.requiresAuth === false) {
        console.log('🌍 [AuthGuard] 공개 페이지 접근:', to.path)
        next()
        return
    }

    // requiresAuth가 true이거나 명시되지 않은 보호된 페이지
    if (to.meta.requiresAuth === true || to.meta.requiresAuth === undefined) {
        console.log('🛡️ [AuthGuard] 보호된 페이지 접근 시도:', to.path)

        try {
            const accessToken = authUtils.getAccessToken()
            const refreshToken = authUtils.getRefreshToken()
            const userInfo = authUtils.getUserInfo()

            // 1️⃣ 기본 인증 정보 확인
            if (!accessToken || !refreshToken || !userInfo) {
                console.log('🚫 [AuthGuard] 인증 정보 부족 - Login 페이지로')
                next({
                    name: 'Login',
                    query: { redirect: to.fullPath }
                })
                return
            }

            // 2️⃣ RefreshToken 만료 확인 (가장 중요!)
            if (authUtils.isTokenExpired(refreshToken)) {
                console.log('🚨 [AuthGuard] RefreshToken 만료 - 즉시 로그아웃 후 Login 페이지로')

                // 만료된 인증 정보 정리
                authUtils.logout()

                next({
                    name: 'Login',
                    query: {
                        redirect: to.fullPath,
                        reason: 'session_expired'
                    }
                })
                return
            }

            // 3️⃣ AccessToken 만료 확인 (RefreshToken이 유효하면 인터셉터가 자동 갱신)
            if (authUtils.isTokenExpired(accessToken)) {
                console.log('🔄 [AuthGuard] AccessToken 만료됨 - 인터셉터가 자동 갱신 처리할 예정')
                // AccessToken 만료는 인터셉터가 자동으로 처리하므로 통과
            }

            // 4️⃣ 관리자 권한 확인 (필요한 경우)
            if (to.meta.requiresAdmin === true) {
                const userRole = authUtils.getUserRole()
                if (userRole !== 'ADMIN') {
                    console.log('🚫 [AuthGuard] 관리자 권한 부족')
                    next({
                        name: 'Home',
                        query: {
                            error: '관리자 권한이 필요합니다'
                        }
                    })
                    return
                }
            }

            console.log('✅ [AuthGuard] 인증 확인 완료 - 페이지 접근 허용')
            next()

        } catch (error) {
            console.error('❌ [AuthGuard] 인증 확인 중 오류:', error)

            // 오류 발생 시 로그인 페이지로
            next({
                name: 'Login',
                query: {
                    redirect: to.fullPath,
                    reason: 'auth_error'
                }
            })
        }
    } else {
        // requiresAuth가 명시적으로 false가 아닌 다른 값인 경우
        console.log('🌍 [AuthGuard] 인증 불필요 페이지:', to.path)
        next()
    }
}

/**
 * 관리자 전용 가드
 */
export const adminGuard = async (to, from, next) => {
    console.log('🛡️ [AdminGuard] 관리자 권한 확인:', to.path)

    // 먼저 기본 인증 확인
    const accessToken = authUtils.getAccessToken()
    const refreshToken = authUtils.getRefreshToken()
    const userInfo = authUtils.getUserInfo()

    if (!accessToken || !refreshToken || !userInfo) {
        console.log('🚫 [AdminGuard] 인증 정보 없음')
        next({
            name: 'Login',
            query: { redirect: to.fullPath }
        })
        return
    }

    // RefreshToken 만료 확인
    if (authUtils.isTokenExpired(refreshToken)) {
        console.log('🚨 [AdminGuard] RefreshToken 만료')
        authUtils.logout()
        next({
            name: 'Login',
            query: {
                redirect: to.fullPath,
                reason: 'session_expired'
            }
        })
        return
    }

    // 관리자 권한 확인
    const userRole = authUtils.getUserRole()
    if (userRole !== 'ADMIN') {
        console.log('🚫 [AdminGuard] 관리자 권한 부족:', userRole)
        next({
            name: 'Home',
            query: {
                error: '관리자 권한이 필요합니다'
            }
        })
        return
    }

    console.log('✅ [AdminGuard] 관리자 권한 확인 완료')
    next()
}

/**
 * 게스트 전용 가드 (로그인 페이지 등)
 */
export const guestGuard = async (to, from, next) => {
    console.log('🛡️ [GuestGuard] 게스트 페이지 접근:', to.path)

    // 로그인된 사용자는 홈으로 리다이렉트
    if (authUtils.isAuthenticated()) {
        console.log('ℹ️ [GuestGuard] 이미 로그인됨 - 홈으로 리다이렉트')
        const redirectTo = to.query.redirect || '/home'
        next(redirectTo)
    } else {
        console.log('✅ [GuestGuard] 미인증 사용자 - 페이지 접근 허용')
        next()
    }
}

export default { authGuard, adminGuard, guestGuard }