// src/router/index.js
import {createRouter, createWebHistory} from 'vue-router'
import * as authUtils from '@/utils/auth.js'

// Views import (기존 구조 유지)
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import OAuthCallback from '@/views/OAuth2Callback.vue'
import OneMouthView from '@/views/OneMouthView.vue'
import OneMouthListView from "@/views/OneMouthListView.vue"
import OneMouthDetailView from "@/views/OneMouthDetailView.vue"
import CategoryAdminView from "@/views/CategoryAdminView.vue"

// Chat Views import
import ChatApp from '@/views/ChatApp.vue'

// Product Views import
import ProductListView from '@/views/ProductListView.vue'
import ProductCreateView from '@/views/ProductCreateView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'

const routes = [
  // ==================== 상품 관련 라우트 ====================
  {
    path: '/products',
    name: 'ProductList',
    component: ProductListView,
    meta: {
      requiresAuth: false,
      public: true,
      title: '상품 목록'
    }
  },
  {
    path: '/products/create',
    name: 'ProductCreate',
    component: ProductCreateView,
    meta: {
      requiresAuth: true,
      title: '상품 등록'
    }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetailView,
    props: true,
    meta: {
      requiresAuth: false,
      public: true,
      title: '상품 상세'
    }
  },
  {
    path: '/products/:id/edit',
    name: 'ProductEdit',
    component: () => import('@/views/ProductEditView.vue'),
    props: true,
    meta: {
      requiresAuth: true,
      title: '상품 수정'
    }
  },

  // ==================== 공개 페이지 (인증 불필요) ====================
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      public: true
    }
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuthCallback,
    meta: {
      requiresAuth: false,
      public: true
    }
  },
  {
    path: '/sell',
    name: 'Sell',
    component: OneMouthView,
    meta: {
      requiresAuth: false,
      public: true
    }
  },
  {
    path: '/sell/step2',
    name: 'SellStep2',
    component: ProductCreateView,
    meta: {
      requiresAuth: true,
      title: '상품 등록 - 단계 2'
    }
  },
  {
    path: '/admin/category',
    name: 'CategoryAdmin',
    component: CategoryAdminView,
    meta: {
      requiresAuth: false,
      requiresAdmin: false,
      title: '카테고리 관리',
      public: true
    }
  },

  // ==================== 보호된 페이지 (인증 필요) ====================
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/one-mouth/list',
    name: 'OneMouthList',
    component: OneMouthListView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/one-mouth/:id',
    name: 'OneMouthDetail',
    component: OneMouthDetailView,
    props: true,
    meta: {
      requiresAuth: false // 상세 페이지는 공개
    }
  },

  // ===== 채팅 관련 라우트 (인증 필요) =====
  {
    path: '/chat',
    name: 'Chat',
    component: ChatApp,
    meta: {
      requiresAuth: true,
      title: '채팅'
    }
  },
  {
    path: '/chat/:roomId',
    name: 'ChatWithRoom',
    component: ChatApp,
    props: route => ({ initialRoomId: route.params.roomId }),
    meta: {
      requiresAuth: true,
      title: '채팅방'
    },
    beforeEnter: (to, from, next) => {
      if (!to.params.roomId || to.params.roomId.trim() === '') {
        next({ name: 'Chat' })
      } else {
        next()
      }
    }
  },

  // ==================== 리다이렉트 ====================
  {
    path: '/',
    redirect: '/products' // 메인 페이지를 상품 목록으로 변경
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/products'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.path.startsWith('/chat')) {
      return false
    }
    return { top: 0 }
  }
})

// ==================== 개선된 인증 가드 (OAuth 호환) ====================

/**
 * OAuth 호환 인증 체크 함수
 */
const checkAuthenticationStatus = () => {
  const accessToken = authUtils.getAccessToken()
  const userInfo = authUtils.getUserInfo()

  // 기본 정보 확인
  if (!accessToken || !userInfo) {
    console.log('❌ [AuthCheck] 기본 인증 정보 없음')
    return false
  }

  // AccessToken 만료 확인
  if (authUtils.isTokenExpired(accessToken)) {
    console.log('⏰ [AuthCheck] AccessToken 만료됨')

    // RefreshToken 확인
    const refreshToken = authUtils.getRefreshToken()

    if (!refreshToken) {
      // OAuth의 경우 RefreshToken이 없을 수 있음
      console.log('⚠️ [AuthCheck] RefreshToken 없음 - OAuth 로그인으로 추정')

      // AccessToken이 최근에 발급되었으면 유효한 것으로 간주 (1시간 이내)
      const tokenPayload = authUtils.parseJwtToken(accessToken)
      if (tokenPayload && tokenPayload.iat) {
        const tokenAge = Date.now() / 1000 - tokenPayload.iat
        const oneHour = 60 * 60

        if (tokenAge < oneHour) {
          console.log('✅ [AuthCheck] OAuth AccessToken이 최근 발급됨 - 유효한 것으로 간주')
          return true
        }
      }

      console.log('❌ [AuthCheck] AccessToken도 오래됨 - 재로그인 필요')
      return false
    }

    // RefreshToken이 있으면 만료 확인
    if (authUtils.isTokenExpired(refreshToken)) {
      console.log('❌ [AuthCheck] RefreshToken도 만료됨')
      return false
    }

    console.log('✅ [AuthCheck] RefreshToken 유효 - 인터셉터가 갱신 처리할 예정')
    return true
  }

  console.log('✅ [AuthCheck] AccessToken 유효')
  return true
}

/**
 * 스마트 인증 가드 - OAuth 호환 버전
 */
router.beforeEach(async (to, from, next) => {
  console.log(`🧭 [Router] 라우트 이동: ${from.path} → ${to.path}`)

  // 1단계: 공개 페이지 체크
  if (to.meta.requiresAuth === false || to.meta.public === true) {
    console.log('🌍 [Router] 공개 페이지 접근 허용:', to.path)
    next()
    return
  }

  // 2단계: 보호된 페이지 - OAuth 호환 인증 체크
  if (to.meta.requiresAuth === true) {
    console.log('🛡️ [Router] 보호된 페이지 - 인증 확인:', to.path)

    try {
      // OAuth 호환 인증 체크
      const isAuthenticated = checkAuthenticationStatus()

      if (isAuthenticated) {
        // 관리자 권한 체크 (필요한 경우)
        if (to.meta.requiresAdmin === true) {
          const userRole = authUtils.getUserRole()
          if (userRole !== 'ADMIN') {
            console.log('🚫 [Router] 관리자 권한 부족')
            next({
              name: 'Home',
              query: { error: '관리자 권한이 필요합니다' }
            })
            return
          }
        }

        console.log('✅ [Router] 인증 확인 완료 - 페이지 접근 허용')
        next()
      } else {
        console.log('🚫 [Router] 인증 실패 - Login 페이지로')

        // 기존 인증 정보 정리
        authUtils.logout()

        next({
          name: 'Login',
          query: {
            redirect: to.fullPath,
            reason: 'auth_required'
          }
        })
      }

    } catch (error) {
      console.error('❌ [Router] 인증 확인 중 오류:', error)
      next({
        name: 'Login',
        query: {
          redirect: to.fullPath,
          reason: 'auth_error'
        }
      })
    }
  } else {
    // 3단계: requiresAuth가 undefined인 경우 기본 처리
    console.log('❓ [Router] requiresAuth 미지정 - 공개 페이지로 처리:', to.path)
    next()
  }
})

// 페이지 타이틀 설정
router.afterEach((to) => {
  let title = 'ToyChat'

  if (to.meta.title) {
    title = `${to.meta.title} | ToyChat`
  } else if (to.name === 'ChatWithRoom') {
    title = `채팅방 ${to.params.roomId} | ToyChat`
  } else if (to.name === 'ProductDetail') {
    title = `상품 ${to.params.id} | ToyChat`
  }

  document.title = title
  console.log(`✅ [Router] 라우트 이동 완료: ${to.path}`)
})

// 라우트 에러 처리
router.onError((error) => {
  console.error('❌ [Router] 라우트 오류:', error)

  if (error.message.includes('Loading chunk') || error.message.includes('fetch')) {
    if (confirm('페이지 로드 중 오류가 발생했습니다. 새로고침하시겠습니까?')) {
      window.location.reload()
    }
  }
})

export default router

// ==================== 채팅 네비게이션 헬퍼 ====================
export const chatNavigation = {
  toChat() {
    return router.push({ name: 'Chat' })
  },

  toChatRoom(roomId) {
    if (!roomId) {
      console.warn('채팅방 ID가 없습니다')
      return this.toChat()
    }
    return router.push({ name: 'ChatWithRoom', params: { roomId } })
  },

  getCurrentRoomId() {
    const route = router.currentRoute.value
    return route.name === 'ChatWithRoom' ? route.params.roomId : null
  },

  isChatPage() {
    const route = router.currentRoute.value
    return route.name === 'Chat' || route.name === 'ChatWithRoom'
  },

  getChatRoomUrl(roomId) {
    const route = router.resolve({ name: 'ChatWithRoom', params: { roomId } })
    return window.location.origin + route.href
  }
}

// ==================== 상품 네비게이션 헬퍼 ====================
export const productNavigation = {
  /**
   * 상품 목록 페이지로 이동
   */
  toProductList(query = {}) {
    return router.push({ name: 'ProductList', query })
  },

  /**
   * 상품 상세 페이지로 이동
   */
  toProductDetail(productId) {
    if (!productId) {
      console.warn('상품 ID가 없습니다')
      return this.toProductList()
    }
    return router.push({ name: 'ProductDetail', params: { id: productId } })
  },

  /**
   * 상품 등록 페이지로 이동
   */
  toProductCreate() {
    return router.push({ name: 'ProductCreate' })
  },

  /**
   * 판매 단계별 페이지로 이동
   */
  toSellStep2() {
    return router.push({ name: 'SellStep2' })
  },

  toSellStep3() {
    return router.push({ name: 'SellStep3' })
  },

  /**
   * 상품 수정 페이지로 이동
   */
  toProductEdit(productId) {
    if (!productId) {
      console.warn('상품 ID가 없습니다')
      return this.toProductList()
    }
    return router.push({ name: 'ProductEdit', params: { id: productId } })
  },

  /**
   * 상품 관련 페이지인지 확인
   */
  isProductPage() {
    const route = router.currentRoute.value
    return route.name?.startsWith('Product') || route.name?.startsWith('Sell')
  },

  /**
   * 상품 URL 생성
   */
  getProductUrl(productId) {
    const route = router.resolve({ name: 'ProductDetail', params: { id: productId } })
    return window.location.origin + route.href
  },

  /**
   * 카테고리별 상품 목록으로 이동
   */
  toProductsByCategory(categoryId, categoryName) {
    return this.toProductList({
      categoryId: categoryId,
      categoryName: categoryName
    })
  },

  /**
   * 브랜드별 상품 목록으로 이동
   */
  toProductsByBrand(brand) {
    return this.toProductList({
      brand: brand
    })
  },

  /**
   * 검색 결과 페이지로 이동
   */
  toProductSearch(keyword) {
    return this.toProductList({
      keyword: keyword
    })
  }
}

// ==================== 통합 네비게이션 헬퍼 ====================
export const navigation = {
  // 기존 채팅 네비게이션
  chat: chatNavigation,

  // 새로운 상품 네비게이션
  product: productNavigation,

  /**
   * 홈으로 이동
   */
  toHome() {
    return router.push({ name: 'Home' })
  },

  /**
   * 로그인 페이지로 이동
   */
  toLogin(redirectPath) {
    const query = redirectPath ? { redirect: redirectPath } : {}
    return router.push({ name: 'Login', query })
  },

  /**
   * 현재 경로 정보
   */
  getCurrentRoute() {
    return router.currentRoute.value
  },

  /**
   * 이전 페이지로 이동
   */
  goBack() {
    return router.go(-1)
  },

  /**
   * 페이지 새로고침 (SPA 방식)
   */
  refresh() {
    const current = router.currentRoute.value
    return router.replace({ path: '/redirect' + current.fullPath })
  }
}