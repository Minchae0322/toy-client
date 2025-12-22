// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import * as authUtils from '@/utils/auth.js'

// Views import (기존 구조 유지)
import LoginView from '@/views/LoginView.vue'
import OAuthCallback from '@/views/OAuth2Callback.vue'
import OneMouthView from '@/views/OneMouthView.vue'
import OneMouthListView from '@/views/OneMouthListView.vue'
import OneMouthDetailView from '@/views/OneMouthDetailView.vue'
import CategoryAdminView from '@/views/CategoryAdminView.vue'

// Chat Views import
import ChatApp from '@/views/ChatApp.vue'

// Product Views import
import ProductListView from '@/views/ProductListView.vue'
import ProductCreateView from '@/views/ProductCreateView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import ProductReviewWrite from '@/views/ReviewWritePageView.vue'

// Sale Post Views import
import SalePostCreateView from '@/views/SalePostCreateView.vue'

// Feed Views import
import FeedHomeView from '@/views/feed/FeedHomeView.vue'
import FeedDetailView from '@/views/feed/FeedDetailView.vue'
import FeedCreateView from '@/views/feed/FeedCreateView.vue'
import UserFeedListView from '@/views/UserFeedListView.vue'
import FollowListView from '@/views/FollowListView.vue'

// Battle Views import
import BattleListView from '@/views/battle/BattleListView.vue'
import BattleCreateView from '@/views/battle/BattleCreateView.vue'
import BattleDetailView from '@/views/battle/BattleDetailView.vue'

// User Views import
import MyPageView from '@/views/MyPageView.vue'

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
    path: '/products/:id/review/write',
    name: 'ReviewWrite',
    component: ProductReviewWrite,
    meta: {
      requiresAuth: true,
      title: '리뷰 작성'
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

  // ==================== 한입만 거래 관련 라우트 ====================
  {
    path: '/one-mouth',
    name: 'OneMouthList',
    component: OneMouthListView,
    meta: {
      requiresAuth: false,
      public: true,
      title: '한입만 거래'
    }
  },
  {
    path: '/one-mouth/create',
    name: 'SalePostCreate',
    component: SalePostCreateView,
    meta: {
      requiresAuth: true,
      title: '상품 등록'
    }
  },
  {
    path: '/one-mouth/:id',
    name: 'OneMouthDetail',
    component: OneMouthDetailView,
    props: true,
    meta: {
      requiresAuth: false,
      public: true,
      title: '게시글 상세'
    }
  },

  // ==================== 피드(인증) 관련 라우트 ====================
  {
    path: '/feed',
    name: 'FeedHome',
    component: FeedHomeView,
    meta: {
      requiresAuth: false,
      public: true,
      title: '피드'
    }
  },
  {
    path: '/feed/create',
    name: 'FeedCreate',
    component: FeedCreateView,
    meta: {
      requiresAuth: true,
      title: '인증 올리기'
    }
  },
  {
    path: '/feed/:id',
    name: 'FeedDetail',
    component: FeedDetailView,
    props: true,
    meta: {
      requiresAuth: false,
      public: true,
      title: '인증 상세'
    }
  },
  {
    path: '/user/:userId/feeds',
    name: 'UserFeedList',
    component: UserFeedListView,
    props: true,
    meta: {
      requiresAuth: false,
      public: true,
      title: '사용자 피드'
    }
  },

  {
    path: '/user/:userId/follows',
    name: 'FollowList',
    component: FollowListView,
    props: true,
    meta: {
      title: '팔로우 목록'
    }
  },

  // ==================== 마이페이지 관련 라우트 ====================
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPageView,
    meta: {
      requiresAuth: true,
      title: '마이페이지'
    }
  },
  {
    path: '/user/:userId',
    name: 'UserProfile',
    component: MyPageView,
    props: true,
    meta: {
      requiresAuth: false,
      public: true,
      title: '프로필'
    }
  },

  // ==================== 배틀 관련 라우트 ====================
  {
    path: '/battle',
    name: 'BattleList',
    component: BattleListView,
    meta: {
      requiresAuth: false,
      public: true,
      title: '월간 배틀'
    }
  },
  {
    path: '/battle/create',
    name: 'BattleCreate',
    component: BattleCreateView,
    meta: {
      requiresAuth: false,
      title: '배틀 만들기'
    }
  },
  {
    path: '/battles/:id',
    name: 'BattleDetail',
    component: BattleDetailView,
    props: true,
    meta: {
      requiresAuth: false,
      public: true,
      title: '배틀 상세'
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
    redirect: '/feed'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/feed'
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

const checkAuthenticationStatus = () => {
  const accessToken = authUtils.getAccessToken()
  const userInfo = authUtils.getUserInfo()

  if (!accessToken || !userInfo) {
    console.log('❌ [AuthCheck] 기본 인증 정보 없음')
    return false
  }

  if (authUtils.isTokenExpired(accessToken)) {
    console.log('⏰ [AuthCheck] AccessToken 만료됨')

    const refreshToken = authUtils.getRefreshToken()

    if (!refreshToken) {
      console.log('⚠️ [AuthCheck] RefreshToken 없음 - OAuth 로그인으로 추정')

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

router.beforeEach(async (to, from, next) => {
  console.log(`🧭 [Router] 라우트 이동: ${from.path} → ${to.path}`)

  // ==================== OAuth 토큰 처리 ====================
  // URL에 token 파라미터가 있으면 (백엔드 OAuth 리다이렉트)
  const tokenParam = to.query.token
  if (tokenParam) {
    console.log('🔐 [Router] OAuth 토큰 감지, 저장 처리 시작...')

    try {
      // 토큰 저장
      authUtils.setTokens(tokenParam, null)

      // JWT에서 사용자 정보 추출
      const payload = authUtils.parseJwtToken(tokenParam)
      if (payload) {
        const userInfo = {
          id: payload.userId || payload.sub,
          username: payload.username || payload.sub,
          email: payload.email || `${payload.sub}@oauth.local`,
          nickname: payload.nickname || payload.username || payload.sub,
          role: payload.auth || payload.role || 'USER',
          provider: payload.provider || 'oauth',
          profileImage: payload.picture || payload.avatar_url || null,
        }
        authUtils.setUserInfo(userInfo)
        console.log('✅ [Router] OAuth 토큰 및 사용자 정보 저장 완료:', userInfo.nickname)
      }

      // token 파라미터 제거하고 같은 경로로 리다이렉트
      const cleanQuery = { ...to.query }
      delete cleanQuery.token

      next({
        path: to.path,
        query: cleanQuery,
        replace: true  // 히스토리에서 토큰 URL 제거
      })
      return
    } catch (error) {
      console.error('❌ [Router] OAuth 토큰 처리 실패:', error)
      // 실패해도 계속 진행
    }
  }

  if (to.meta.requiresAuth === false || to.meta.public === true) {
    console.log('🌍 [Router] 공개 페이지 접근 허용:', to.path)
    next()
    return
  }

  if (to.meta.requiresAuth === true) {
    console.log('🛡️ [Router] 보호된 페이지 - 인증 확인:', to.path)

    try {
      const isAuthenticated = checkAuthenticationStatus()

      if (isAuthenticated) {
        if (to.meta.requiresAdmin === true) {
          const userRole = authUtils.getUserRole()
          if (userRole !== 'ADMIN') {
            console.log('🚫 [Router] 관리자 권한 부족')
            next({
              name: 'FeedHome',
              query: { error: '관리자 권한이 필요합니다' }
            })
            return
          }
        }

        console.log('✅ [Router] 인증 확인 완료 - 페이지 접근 허용')
        next()
      } else {
        console.log('🚫 [Router] 인증 실패 - Login 페이지로')

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
    console.log('❓ [Router] requiresAuth 미지정 - 공개 페이지로 처리:', to.path)
    next()
  }
})

router.afterEach((to) => {
  let title = 'ToyChat'

  if (to.meta.title) {
    title = `${to.meta.title} | ToyChat`
  } else if (to.name === 'ChatWithRoom') {
    title = `채팅방 ${to.params.roomId} | ToyChat`
  } else if (to.name === 'ProductDetail') {
    title = `상품 ${to.params.id} | ToyChat`
  } else if (to.name === 'OneMouthDetail') {
    title = `게시글 ${to.params.id} | ToyChat`
  } else if (to.name === 'FeedDetail') {
    title = `인증 ${to.params.id} | ToyChat`
  } else if (to.name === 'UserFeedList') {
    title = `사용자 피드 | ToyChat`
  } else if (to.name === 'BattleDetail') {
    title = `배틀 상세 | ToyChat`
  } else if (to.name === 'UserProfile') {
    title = `프로필 | ToyChat`
  }

  document.title = title
  console.log(`✅ [Router] 라우트 이동 완료: ${to.path}`)
})

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
  toProductList(query = {}) {
    return router.push({ name: 'ProductList', query })
  },

  toProductDetail(productId) {
    if (!productId) {
      console.warn('상품 ID가 없습니다')
      return this.toProductList()
    }
    return router.push({ name: 'ProductDetail', params: { id: productId } })
  },

  toProductCreate() {
    return router.push({ name: 'ProductCreate' })
  },

  toSellStep2() {
    return router.push({ name: 'SellStep2' })
  },

  toSellStep3() {
    return router.push({ name: 'SellStep3' })
  },

  toProductEdit(productId) {
    if (!productId) {
      console.warn('상품 ID가 없습니다')
      return this.toProductList()
    }
    return router.push({ name: 'ProductEdit', params: { id: productId } })
  },

  isProductPage() {
    const route = router.currentRoute.value
    return route.name?.startsWith('Product') || route.name?.startsWith('Sell')
  },

  getProductUrl(productId) {
    const route = router.resolve({ name: 'ProductDetail', params: { id: productId } })
    return window.location.origin + route.href
  },

  toProductsByCategory(categoryId, categoryName) {
    return this.toProductList({
      categoryId: categoryId,
      categoryName: categoryName
    })
  },

  toProductsByBrand(brand) {
    return this.toProductList({ brand: brand })
  },

  toProductSearch(keyword) {
    return this.toProductList({ keyword: keyword })
  }
}

// ==================== 한입만 거래 네비게이션 헬퍼 ====================
export const salePostNavigation = {
  toList(query = {}) {
    return router.push({ name: 'OneMouthList', query })
  },

  toCreate() {
    return router.push({ name: 'SalePostCreate' })
  },

  toDetail(postId) {
    if (!postId) {
      console.warn('게시글 ID가 없습니다')
      return this.toList()
    }
    return router.push({ name: 'OneMouthDetail', params: { id: postId } })
  },

  toEdit(postId) {
    if (!postId) {
      console.warn('게시글 ID가 없습니다')
      return this.toList()
    }
    return router.push({ name: 'SalePostEdit', params: { id: postId } })
  },

  isOneMouthPage() {
    const route = router.currentRoute.value
    return route.name?.startsWith('OneMouth') || route.name?.startsWith('SalePost')
  },

  getPostUrl(postId) {
    const route = router.resolve({ name: 'OneMouthDetail', params: { id: postId } })
    return window.location.origin + route.href
  },

  toPostsByCategory(categoryId) {
    return this.toList({ categoryId })
  },

  toPostsBySaleType(saleType) {
    return this.toList({ saleType })
  },

  toSearch(keyword) {
    return this.toList({ keyword })
  }
}

// ==================== 피드(인증) 네비게이션 헬퍼 ====================
export const feedNavigation = {
  toFeedHome(query = {}) {
    return router.push({ name: 'FeedHome', query })
  },

  toFeedDetail(feedId) {
    if (!feedId) {
      console.warn('피드 ID가 없습니다')
      return this.toFeedHome()
    }
    return router.push({ name: 'FeedDetail', params: { id: feedId } })
  },

  toFeedCreate() {
    return router.push({ name: 'FeedCreate' })
  },

  toUserFeedList(userId) {
    if (!userId) {
      console.warn('사용자 ID가 없습니다')
      return this.toFeedHome()
    }
    return router.push({ name: 'UserFeedList', params: { userId } })
  },

  isFeedPage() {
    const route = router.currentRoute.value
    return route.name?.startsWith('Feed') || route.name === 'UserFeedList'
  },

  getFeedUrl(feedId) {
    const route = router.resolve({ name: 'FeedDetail', params: { id: feedId } })
    return window.location.origin + route.href
  },

  getUserFeedUrl(userId) {
    const route = router.resolve({ name: 'UserFeedList', params: { userId } })
    return window.location.origin + route.href
  },

  toFeedsByCategory(category) {
    return this.toFeedHome({ category })
  },

  toFeedsByTag(tag) {
    return this.toFeedHome({ tag })
  },

  toFeedSearch(keyword) {
    return this.toFeedHome({ keyword })
  },

  toFeedsByUser(userId) {
    return this.toUserFeedList(userId)
  }
}

// ==================== 배틀 네비게이션 헬퍼 ====================
export const battleNavigation = {
  toList(query = {}) {
    return router.push({ name: 'BattleList', query })
  },

  toDetail(battleId) {
    if (!battleId) {
      console.warn('배틀 ID가 없습니다')
      return this.toList()
    }
    return router.push({ name: 'BattleDetail', params: { id: battleId } })
  },

  toCreate() {
    return router.push({ name: 'BattleCreate' })
  },

  isBattlePage() {
    const route = router.currentRoute.value
    return route.name?.startsWith('Battle')
  },

  getBattleUrl(battleId) {
    const route = router.resolve({ name: 'BattleDetail', params: { id: battleId } })
    return window.location.origin + route.href
  },

  toSubmitProduct(battleId) {
    if (!battleId) {
      console.warn('배틀 ID가 없습니다')
      return this.toList()
    }
    return router.push({ path: `/battle/${battleId}/submit` })
  },

  toVote(battleId) {
    if (!battleId) {
      console.warn('배틀 ID가 없습니다')
      return this.toList()
    }
    return router.push({ path: `/battle/${battleId}/vote` })
  },

  toProductDetail(battleId, productId) {
    if (!battleId || !productId) {
      console.warn('배틀 ID 또는 제품 ID가 없습니다')
      return this.toList()
    }
    return router.push({ path: `/battle/${battleId}/products/${productId}` })
  },

  toBattlesByCategory(categoryId) {
    return this.toList({ categoryId })
  },

  toBattlesByStatus(status) {
    return this.toList({ status })
  }
}

// ==================== 마이페이지 네비게이션 헬퍼 ====================
export const userNavigation = {
  toMyPage() {
    return router.push({ name: 'MyPage' })
  },

  toUserProfile(userId) {
    if (!userId) {
      console.warn('사용자 ID가 없습니다')
      return this.toMyPage()
    }
    return router.push({ name: 'UserProfile', params: { userId } })
  },

  isMyPage() {
    const route = router.currentRoute.value
    return route.name === 'MyPage'
  },

  isUserProfilePage() {
    const route = router.currentRoute.value
    return route.name === 'UserProfile'
  },

  isProfilePage() {
    const route = router.currentRoute.value
    return route.name === 'MyPage' || route.name === 'UserProfile'
  },

  getProfileUrl(userId) {
    const route = router.resolve({ name: 'UserProfile', params: { userId } })
    return window.location.origin + route.href
  },

  toUserFeeds(userId) {
    return feedNavigation.toUserFeedList(userId)
  },

  toFollowers(userId) {
    return router.push({
      name: 'UserProfile',
      params: { userId },
      query: { tab: 'followers' }
    })
  },

  toFollowings(userId) {
    return router.push({
      name: 'UserProfile',
      params: { userId },
      query: { tab: 'followings' }
    })
  }
}

// ==================== 통합 네비게이션 헬퍼 ====================
export const navigation = {
  chat: chatNavigation,
  product: productNavigation,
  salePost: salePostNavigation,
  feed: feedNavigation,
  battle: battleNavigation,
  user: userNavigation,

  toHome() {
    return router.push({ name: 'FeedHome' })
  },

  toMyPage() {
    return userNavigation.toMyPage()
  },

  toLogin(redirectPath) {
    const query = redirectPath ? { redirect: redirectPath } : {}
    return router.push({ name: 'Login', query })
  },

  getCurrentRoute() {
    return router.currentRoute.value
  },

  goBack() {
    return router.go(-1)
  },

  refresh() {
    const current = router.currentRoute.value
    return router.replace({ path: '/redirect' + current.fullPath })
  }
}