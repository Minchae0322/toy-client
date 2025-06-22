import { getUserRole, isAuthenticated } from '@/utils/auth.js'

export const authGuard = (to, from, next) => {
    const isLoggedIn = isAuthenticated()
    const userRole = getUserRole()

    // 인증이 필요한 페이지
    if (to.meta.requiresAuth && !isLoggedIn) {
        console.warn('인증이 필요한 페이지입니다.')
        next({
            name: 'Login',
            query: { redirect: to.fullPath } // 로그인 후 리다이렉트할 경로 저장
        })
        return
    }

    // 관리자 권한이 필요한 페이지
    if (to.meta.requiresAdmin && userRole !== 'ADMIN') {
        console.warn('관리자 권한이 필요합니다.')
        alert('관리자 권한이 필요합니다.')

        // 적절한 페이지로 리다이렉트
        if (isLoggedIn) {
            next({ name: 'Home' })
        } else {
            next({ name: 'Login' })
        }
        return
    }

    // 로그인된 상태에서 로그인 페이지 접근 시 홈으로 리다이렉트
    if (to.name === 'Login' && isLoggedIn) {
        next({ name: 'Home' })
        return
    }

    next()
}