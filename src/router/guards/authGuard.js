// src/router/guards/authGuard.js
// 🔒 보안: Access Token은 메모리에, Refresh Token은 HttpOnly 쿠키로 관리
import * as authUtils from '@/utils/auth.js'

/**
 * 🔒 인증 가드 - 로그인이 필요한 페이지 보호
 * - Access Token: 메모리(Pinia/모듈 변수)에서 확인
 * - Refresh Token: HttpOnly 쿠키 (JS에서 접근 불가, 서버가 관리)
 */
export const authGuard = async (to, from, next) => {
    // OneMouthDetail 페이지는 항상 허용 (최우선 처리)
    if (to.name === 'OneMouthDetail') {
        next()
        return
    }

    // OneMouthList 페이지도 공개 허용
    if (to.name === 'OneMouthList') {
        next()
        return
    }

    // requiresAuth가 false인 페이지는 인증 체크 하지 않음
    if (to.meta.requiresAuth === false) {
        next()
        return
    }

    // requiresAuth가 true이거나 명시되지 않은 보호된 페이지
    if (to.meta.requiresAuth === true || to.meta.requiresAuth === undefined) {
        try {
            // 🔒 메모리에서 Access Token 확인
            const accessToken = authUtils.getAccessToken()
            const userInfo = authUtils.getUserInfo()

            // 1️⃣ 인증 정보 확인 (Access Token + 사용자 정보)
            // 🔒 Refresh Token은 HttpOnly 쿠키라 JS에서 확인 불가
            //    → 토큰이 없으면 앱 초기화 시 자동 재발급 시도함
            if (!accessToken || !userInfo) {
                console.log('🚫 [AuthGuard] 인증 정보 없음 - Login 페이지로')
                next({
                    name: 'Login',
                    query: { redirect: to.fullPath }
                })
                return
            }

            // 2️⃣ Access Token 만료 확인
            // 🔒 만료되어도 API 요청 시 자동 갱신되므로 통과
            //    (401 → refresh → 재시도 패턴)
            if (authUtils.isTokenExpired(accessToken)) {
                console.log('🔄 [AuthGuard] AccessToken 만료됨 - API 호출 시 자동 갱신 예정')
            }

            // 3️⃣ 관리자 권한 확인 (필요한 경우)
            if (to.meta.requiresAdmin === true) {
                const userRole = authUtils.getUserRole()
                if (userRole !== 'ADMIN') {
                    console.log('🚫 [AuthGuard] 관리자 권한 부족')
                    next({
                        name: 'Home',
                        query: { error: '관리자 권한이 필요합니다' }
                    })
                    return
                }
            }

            next()

        } catch (error) {
            console.error('❌ [AuthGuard] 인증 확인 중 오류:', error)
            next({
                name: 'Login',
                query: {
                    redirect: to.fullPath,
                    reason: 'auth_error'
                }
            })
        }
    } else {
        next()
    }
}

/**
 * OneMouth 전용 가드 (공개 접근 허용)
 */
export const oneMouthGuard = async (to, from, next) => {
    console.log('🍽️ [OneMouthGuard] OneMouth 페이지 접근:', to.path)

    // OneMouth 관련 페이지는 모두 공개 접근 허용
    if (to.name === 'OneMouthList' || to.name === 'OneMouthDetail') {
        console.log('✅ [OneMouthGuard] OneMouth 페이지 공개 접근 허용')

        // OneMouthDetail의 경우 ID 유효성 검사만 수행
        if (to.name === 'OneMouthDetail') {
            if (!to.params.id || to.params.id === 'undefined' || to.params.id === 'null') {
                console.error('❌ [OneMouthGuard] 잘못된 상품 ID:', to.params.id)
                next({ name: 'OneMouthList' })
                return
            }
            console.log('✅ [OneMouthGuard] 상품 ID 유효:', to.params.id)
        }

        next()
        return
    }

    // OneMouth 페이지가 아닌 경우 기본 인증 가드로 처리
    authGuard(to, from, next)
}

/**
 * 🔒 관리자 전용 가드
 */
export const adminGuard = async (to, from, next) => {
    // 🔒 메모리에서 인증 정보 확인
    const accessToken = authUtils.getAccessToken()
    const userInfo = authUtils.getUserInfo()

    if (!accessToken || !userInfo) {
        next({
            name: 'Login',
            query: { redirect: to.fullPath }
        })
        return
    }

    // 관리자 권한 확인
    const userRole = authUtils.getUserRole()
    if (userRole !== 'ADMIN') {
        next({
            name: 'Home',
            query: { error: '관리자 권한이 필요합니다' }
        })
        return
    }

    next()
}

/**
 * 🔒 게스트 전용 가드 (로그인 페이지 등)
 */
export const guestGuard = async (to, from, next) => {
    // 🔒 메모리에서 인증 상태 확인
    if (authUtils.isAuthenticated()) {
        const redirectTo = to.query.redirect || '/dashboard'
        next(redirectTo)
    } else {
        next()
    }
}

export default { authGuard, oneMouthGuard, adminGuard, guestGuard }