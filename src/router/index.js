// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import * as authUtils from '@/utils/auth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

// Views import (기존 구조 유지)
import LoginView from '@/views/LoginView.vue'
import OAuthCallback from '@/views/OAuth2Callback.vue'
import ConsentView from '@/views/ConsentView.vue'
import WelcomeView from '@/views/WelcomeView.vue'
import CategoryAdminView from '@/views/CategoryAdminView.vue'

// Chat Views import
import ChatApp from '@/views/ChatApp.vue'

// Product Views import
import ProductRankingView from '@/views/product/ProductRankingView.vue'
import ProductCreateView from '@/views/product/ProductCreateView.vue'
import ProductDetailView from '@/views/product/ProductDetailView.vue'
import ProductReviewWrite from '@/views/ReviewWritePageView.vue'
import MyProductView from '@/views/product/MyProductView.vue'

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

// Carrier Views import
import CarrierView from '@/views/carrier/CarrierView.vue'

// Collection Views import
import CollectionView from '@/views/CollectionView.vue'

// User Views import
import MyPageView from '@/views/MyPageView.vue'

// Dashboard View import
import DashboardView from '@/views/DashboardView.vue'

// 404 View import
import NotFoundView from '@/views/NotFoundView.vue'

// ⭐ Admin Views import
import ProductAdminView from '@/views/product/ProductAdminView.vue'
import BulkProductAdminView from '@/views/product/BulkProductAdminView.vue'

const routes = [
  // ==================== 대시보드 (홈) ====================
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: false, public: true, description: '요거뜨 - 인기 제품 랭킹, 리뷰, 피드를 한눈에. 좋아하는 제품을 발견하고 공유하세요.' }
  },

  // ==================== 상품 관련 라우트 ====================
  {
    path: '/products',
    name: 'ProductRanking',
    component: ProductRankingView,
    meta: { requiresAuth: false, public: true, title: 'HOT 100', description: 'HOT 100 제품 랭킹 - 가장 인기 있는 제품을 버블 차트로 확인하고 캐리어에 담아보세요.' }
  },
  {
    path: '/products/:id/review/write',
    name: 'ReviewWrite',
    component: ProductReviewWrite,
    meta: { requiresAuth: true, title: '리뷰 작성' }
  },
  {
    path: '/products/create',
    name: 'ProductCreate',
    component: ProductCreateView,
    meta: { requiresAuth: true, title: '상품 등록' }
  },
  {
    path: '/products/:id/edit',
    name: 'ProductEdit',
    component: ProductCreateView,
    props: true,
    meta: { requiresAuth: true, title: '상품 수정' }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetailView,
    props: true,
    meta: { requiresAuth: false, public: true, title: '상품 상세', description: '제품 상세 정보, 리뷰, 평점을 확인하세요.' }
  },
  {
    path: '/my-products',
    name: 'MyProducts',
    component: MyProductView,
    meta: { requiresAuth: true, title: '내 상품' }
  },

  // ==================== 피드(인증) 관련 라우트 ====================
  {
    path: '/feed',
    name: 'FeedHome',
    component: FeedHomeView,
    meta: { requiresAuth: false, public: true, title: '피드', description: '요거뜨 피드 - 사용자들의 제품 인증과 리뷰를 실시간으로 확인하세요.' }
  },
  {
    path: '/feed/create',
    name: 'FeedCreate',
    component: FeedCreateView,
    meta: { requiresAuth: true, title: '피드 올리기' }
  },
  {
    path: '/feed/:id',
    name: 'FeedDetail',
    component: FeedDetailView,
    props: true,
    meta: { requiresAuth: false, public: true, title: '인증 상세', description: '제품 인증 피드 상세 내용을 확인하세요.' }
  },
  {
    path: '/user/:userId/feeds',
    name: 'UserFeedList',
    component: UserFeedListView,
    props: true,
    meta: { requiresAuth: false, public: true, title: '사용자 피드', description: '사용자의 피드 목록을 확인하세요.' }
  },
  {
    path: '/user/:userId/follows',
    name: 'FollowList',
    component: FollowListView,
    props: true,
    meta: { title: '팔로우 목록' }
  },

  // ==================== 캐리어 관련 라우트 ====================
  {
    path: '/carrier',
    name: 'Carrier',
    component: CarrierView,
    meta: { requiresAuth: true, title: '내 캐리어' }
  },

  // ==================== 컬렉션(레벨/뱃지) 관련 라우트 ====================
  {
    path: '/collection',
    name: 'Collection',
    component: CollectionView,
    meta: { requiresAuth: false, public: true, title: '컬렉션 - 레벨 & 뱃지', description: '5단계 레벨 시스템과 10종 뱃지 컬렉션을 확인하세요.' }
  },

  // ==================== 마이페이지 관련 라우트 ====================
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPageView,
    meta: { requiresAuth: true, title: '마이페이지' }
  },
  {
    path: '/user/:userId',
    name: 'UserProfile',
    component: MyPageView,
    props: true,
    meta: { requiresAuth: false, public: true, title: '프로필', description: '사용자 프로필과 활동 내역을 확인하세요.' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: false, public: true, title: '환경설정' }
  },
  {
    path: '/settings/notifications',
    name: 'NotificationSettings',
    component: () => import('@/views/NotificationSettingsView.vue'),
    meta: { requiresAuth: true, title: '알림 설정' }
  },
  {
    path: '/settings/account',
    name: 'AccountSettings',
    component: () => import('@/views/AccountSettingsView.vue'),
    meta: { requiresAuth: true, title: '계정 설정' }
  },
  {
    path: '/settings/blocked-users',
    name: 'BlockedUsers',
    component: () => import('@/views/BlockedUsersView.vue'),
    meta: { requiresAuth: true, title: '차단한 사용자' }
  },

  // ==================== 배틀 관련 라우트 ====================
  {
    path: '/battle',
    name: 'BattleList',
    component: BattleListView,
    meta: { requiresAuth: false, public: true, title: '월간 배틀', description: '월간 배틀 - 제품 대결에 투표하고 결과를 확인하세요.' }
  },
  {
    path: '/battles/create',
    name: 'BattleCreate',
    component: BattleCreateView,
    meta: { requiresAuth: false, title: '배틀 만들기' }
  },
  {
    path: '/battles/:id',
    name: 'BattleDetail',
    component: BattleDetailView,
    props: true,
    meta: { requiresAuth: false, public: true, title: '배틀 상세', description: '배틀 상세 정보와 투표 현황을 확인하세요.' }
  },
  {
    path: '/battles/:id/swipe',
    name: 'SwipeBattle',
    component: () => import('@/views/battle/SwipeBattleView.vue'),
    props: true,
    meta: { requiresAuth: false, public: true, title: '스와이프 배틀' }
  },
  {
    path: '/battles/:id/swipe/result',
    name: 'SwipeBattleResult',
    component: () => import('@/views/battle/SwipeBattleResultView.vue'),
    props: true,
    meta: { requiresAuth: false, public: true, title: '스와이프 배틀 결과' }
  },

  // ==================== ⭐ 관리자 페이지 라우트 ====================
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: '관리자' }
  },
  {
    path: '/admin/products',
    name: 'AdminProductManagement',
    component: ProductAdminView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: '상품 관리'
    }
  },
  {
    path: '/admin/category',
    name: 'CategoryAdmin',
    component: CategoryAdminView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: '카테고리 관리'
    }
  },
  {
    path: '/admin/bulk-product',
    name: 'AdminBulkProduct',
    component: BulkProductAdminView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: '벌크 제품 등록'
    }
  },
  {
    path: '/admin/schedulers',
    name: 'SchedulerAdmin',
    component: () => import('@/views/admin/SchedulerAdminView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: '스케줄러 관리'
    }
  },
  {
    path: '/admin/collection',
    name: 'CollectionAdmin',
    component: () => import('@/views/admin/CollectionAdminView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: '보상 시스템 관리'
    }
  },
  // 추후 확장용
  // {
  //   path: '/admin/users',
  //   name: 'AdminUserManagement',
  //   component: () => import('@/views/admin/AdminUserManagementView.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true, title: '사용자 관리' }
  // },
  // {
  //   path: '/admin/reviews',
  //   name: 'AdminReviewManagement',
  //   component: () => import('@/views/admin/AdminReviewManagementView.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true, title: '리뷰 관리' }
  // },
  // {
  //   path: '/admin/statistics',
  //   name: 'AdminStatistics',
  //   component: () => import('@/views/admin/AdminStatisticsView.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true, title: '통계' }
  // },

  // ==================== 공개 페이지 (인증 불필요) ====================
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false, public: true }
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuthCallback,
    meta: { requiresAuth: false, public: true }
  },
  {
    path: '/consent',
    name: 'Consent',
    component: ConsentView,
    // 토큰은 발급된 상태(로그인 직후) — 미동의 사용자만 보는 화면이라
    // requiresAuth 는 켜되 사용자가 직접 진입은 막지 않음 (가드는 별도 처리 안 함)
    meta: { requiresAuth: true }
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: WelcomeView,
    // 회원가입 직후 첫 로그인 시 1회 노출되는 닉네임 설정 온보딩 (건너뛰기 가능)
    meta: { requiresAuth: true, title: '닉네임 설정' }
  },
  {
    path: '/sell/step2',
    name: 'SellStep2',
    component: ProductCreateView,
    meta: { requiresAuth: true, title: '상품 등록 - 단계 2' }
  },

  // ==================== 보호된 페이지 (인증 필요) ====================
  {
    path: '/chat',
    name: 'Chat',
    component: ChatApp,
    meta: { requiresAuth: true, title: '채팅' }
  },
  {
    path: '/chat/:roomId',
    name: 'ChatWithRoom',
    component: ChatApp,
    props: route => ({ initialRoomId: route.params.roomId }),
    meta: { requiresAuth: true, title: '채팅방' },
    beforeEnter: (to, from, next) => {
      if (!to.params.roomId || to.params.roomId.trim() === '') {
        next({ name: 'Chat' })
      } else {
        next()
      }
    }
  },

  // ==================== 법적 페이지 ====================
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyPolicyView.vue'),
    meta: { requiresAuth: false, public: true, title: '개인정보처리방침' }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/TermsOfServiceView.vue'),
    meta: { requiresAuth: false, public: true, title: '이용약관' }
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/SupportView.vue'),
    meta: { requiresAuth: false, public: true, title: '고객 지원', description: '요거뜨 앱 사용 중 궁금한 점이나 문의 사항을 확인할 수 있는 고객 지원 페이지입니다.' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: { requiresAuth: false, public: true, title: '소개', description: '요거뜨 - 제품 리뷰, 랭킹, 피드를 한눈에 확인할 수 있는 커뮤니티 플랫폼입니다.' }
  },

  // ==================== 리다이렉트 & 404 ====================
  { path: '/dashboard', redirect: '/' },
  { path: '/home', redirect: '/' },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { requiresAuth: false, public: true, title: '페이지를 찾을 수 없습니다' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.path.startsWith('/chat')) return false

    if (savedPosition) {
      // 비동기 데이터 로드로 콘텐츠 높이가 자라기 전에 복원하면 엉뚱한 위치로 가므로,
      // 페이지 높이가 savedPosition 까지 도달할 때까지 폴링
      return new Promise((resolve) => {
        const targetY = savedPosition.top || 0
        const maxAttempts = 30   // 30 * 50ms = 1.5s 한도
        let attempt = 0
        const check = () => {
          const reachable = document.documentElement.scrollHeight - window.innerHeight
          if (reachable >= targetY || attempt >= maxAttempts) {
            resolve(savedPosition)
            return
          }
          attempt += 1
          setTimeout(check, 50)
        }
        setTimeout(check, 50)
      })
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
    console.log('⏰ [AuthCheck] AccessToken 만료됨 - 인터셉터가 자동 갱신 처리')
    // RefreshToken은 HttpOnly 쿠키라 JS에서 확인 불가
    // API 인터셉터가 401 응답 시 자동으로 토큰 갱신을 처리함
    return true
  }

  console.log('✅ [AuthCheck] AccessToken 유효')
  return true
}

router.beforeEach(async (to, from, next) => {
  console.log(`🧭 [Router] 라우트 이동: ${from.path} → ${to.path}`)

  // OAuth 토큰 처리
  const tokenParam = to.query.token
  if (tokenParam && to.path !== '/oauth/callback') {
    console.log('🔐 [Router] OAuth 토큰 감지')
    try {
      authUtils.setTokens(tokenParam, null)
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
        console.log('✅ [Router] OAuth 토큰 저장 완료:', userInfo.nickname)
      }
      const cleanQuery = { ...to.query }
      delete cleanQuery.token
      next({ path: to.path, query: cleanQuery, replace: true })
      return
    } catch (error) {
      console.error('❌ [Router] OAuth 토큰 처리 실패:', error)
    }
  }

  // 공개 페이지
  if (to.meta.requiresAuth === false || to.meta.public === true) {
    console.log('🌍 [Router] 공개 페이지 접근 허용:', to.path)
    next()
    return
  }

  // 보호된 페이지
  if (to.meta.requiresAuth === true) {
    console.log('🛡️ [Router] 보호된 페이지 - 인증 확인:', to.path)

    try {
      const isAuthenticated = checkAuthenticationStatus()

      if (isAuthenticated) {
        // ⭐ 관리자 권한 체크 강화
        if (to.meta.requiresAdmin === true) {
          const userRole = authUtils.getUserRole()
          console.log('👑 [Router] 관리자 권한 확인:', userRole)

          if (userRole !== 'ADMIN' && userRole !== 'ROLE_ADMIN') {
            console.log('🚫 [Router] 관리자 권한 부족')
            next({
              name: 'FeedHome',
              query: { error: '관리자 권한이 필요합니다' }
            })
            return
          }
          console.log('✅ [Router] 관리자 권한 확인 완료')
        }

        console.log('✅ [Router] 인증 확인 완료 - 페이지 접근 허용')
        next()
      } else {
        console.log('🚫 [Router] 인증 실패 - Login 페이지로')
        authUtils.logout()
        next({
          name: 'Login',
          query: { redirect: to.fullPath, reason: 'auth_required' }
        })
      }
    } catch (error) {
      console.error('❌ [Router] 인증 확인 중 오류:', error)
      next({
        name: 'Login',
        query: { redirect: to.fullPath, reason: 'auth_error' }
      })
    }
  } else {
    console.log('❓ [Router] requiresAuth 미지정 - 공개 페이지로 처리:', to.path)
    next()
  }
})

function updateMetaTag(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (content) {
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, key)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  } else if (el) {
    el.remove()
  }
}

router.afterEach((to) => {
  const siteName = '요거뜨'
  const defaultDesc = '요거뜨 - 인기 제품 랭킹, 리뷰, 피드를 한눈에. 좋아하는 제품을 발견하고 공유하세요.'
  const baseUrl = 'https://yogurtte.com'

  // 타이틀
  let title = siteName
  if (to.meta.title) {
    title = `${to.meta.title} | ${siteName}`
  }
  document.title = title

  // description
  const desc = to.meta.description || defaultDesc
  updateMetaTag('name', 'description', desc)

  // OG 태그
  updateMetaTag('property', 'og:title', title)
  updateMetaTag('property', 'og:description', desc)
  updateMetaTag('property', 'og:url', baseUrl + to.fullPath)

  // canonical URL
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', baseUrl + to.fullPath)

  console.log(`✅ [Router] 라우트 이동 완료: ${to.path}`)
})

router.onError(async (error) => {
  console.error('❌ [Router] 라우트 오류:', error)
  if (error.message.includes('Loading chunk') || error.message.includes('fetch')) {
    const { open } = useConfirmDialog()
    const confirmed = await open({ type: 'confirm', title: '페이지 로드 오류', message: '페이지 로드 중 오류가 발생했습니다. 새로고침하시겠습니까?' })
    if (confirmed) {
      window.location.reload()
    }
  }
})

export default router

// ==================== ⭐ 관리자 네비게이션 헬퍼 ====================
export const adminNavigation = {
  toDashboard() {
    return router.push({ name: 'AdminDashboard' })
  },

  toProductManagement(query = {}) {
    return router.push({ name: 'AdminProductManagement', query })
  },

  toCategoryManagement() {
    return router.push({ name: 'CategoryAdmin' })
  },

  toUserManagement() {
    return router.push({ name: 'AdminUserManagement' })
  },

  toReviewManagement() {
    return router.push({ name: 'AdminReviewManagement' })
  },

  toStatistics() {
    return router.push({ name: 'AdminStatistics' })
  },

  toBulkProduct() {
    return router.push({ name: 'AdminBulkProduct' })
  },

  isAdminPage() {
    const route = router.currentRoute.value
    return route.path.startsWith('/admin')
  },

  // 상품 관리 필터 네비게이션
  toProductsByStatus(status) {
    return this.toProductManagement({ status })
  },

  toPendingProducts() {
    return this.toProductManagement({ status: 'PENDING' })
  },

  toApprovedProducts() {
    return this.toProductManagement({ status: 'APPROVED' })
  },

  toRejectedProducts() {
    return this.toProductManagement({ status: 'REJECTED' })
  }
}

// ==================== 채팅 네비게이션 헬퍼 ====================
export const chatNavigation = {
  toChat() { return router.push({ name: 'Chat' }) },
  toChatRoom(roomId) {
    if (!roomId) return this.toChat()
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
  toRanking(query = {}) { return router.push({ name: 'ProductRanking', query }) },
  toProductDetail(productId) {
    if (!productId) return this.toRanking()
    return router.push({ name: 'ProductDetail', params: { id: productId } })
  },
  toProductCreate() { return router.push({ name: 'ProductCreate' }) },
  toProductEdit(productId) {
    if (!productId) return this.toRanking()
    return router.push({ name: 'ProductEdit', params: { id: productId } })
  },
  toSellStep2() { return router.push({ name: 'SellStep2' }) },
  isProductPage() {
    const route = router.currentRoute.value
    return route.name?.startsWith('Product') || route.name?.startsWith('Sell')
  },
  getProductUrl(productId) {
    const route = router.resolve({ name: 'ProductDetail', params: { id: productId } })
    return window.location.origin + route.href
  },
  toRankingByCategory(categoryId) { return this.toRanking({ categoryId }) }
}

// ==================== 피드(인증) 네비게이션 헬퍼 ====================
export const feedNavigation = {
  toFeedHome(query = {}) { return router.push({ name: 'FeedHome', query }) },
  toFeedDetail(feedId) {
    if (!feedId) return this.toFeedHome()
    return router.push({ name: 'FeedDetail', params: { id: feedId } })
  },
  toFeedCreate() { return router.push({ name: 'FeedCreate' }) },
  toUserFeedList(userId) {
    if (!userId) return this.toFeedHome()
    return router.push({ name: 'UserFeedList', params: { userId } })
  },
  isFeedPage() {
    const route = router.currentRoute.value
    return route.name?.startsWith('Feed') || route.name === 'UserFeedList'
  },
  getFeedUrl(feedId) {
    const route = router.resolve({ name: 'FeedDetail', params: { id: feedId } })
    return window.location.origin + route.href
  }
}

// ==================== 캐리어 네비게이션 헬퍼 ====================
export const carrierNavigation = {
  toCarrier() { return router.push({ name: 'Carrier' }) },
  isCarrierPage() {
    const route = router.currentRoute.value
    return route.name === 'Carrier'
  }
}

// ==================== 배틀 네비게이션 헬퍼 ====================
export const battleNavigation = {
  toList(query = {}) { return router.push({ name: 'BattleList', query }) },
  toDetail(battleId) {
    if (!battleId) return this.toList()
    return router.push({ name: 'BattleDetail', params: { id: battleId } })
  },
  toCreate() { return router.push({ name: 'BattleCreate' }) },
  isBattlePage() {
    const route = router.currentRoute.value
    return route.name?.startsWith('Battle')
  },
  getBattleUrl(battleId) {
    const route = router.resolve({ name: 'BattleDetail', params: { id: battleId } })
    return window.location.origin + route.href
  }
}

// ==================== 마이페이지 네비게이션 헬퍼 ====================
export const userNavigation = {
  toMyPage() { return router.push({ name: 'MyPage' }) },
  toUserProfile(userId) {
    if (!userId) return this.toMyPage()
    return router.push({ name: 'UserProfile', params: { userId } })
  },
  isProfilePage() {
    const route = router.currentRoute.value
    return route.name === 'MyPage' || route.name === 'UserProfile'
  },
  getProfileUrl(userId) {
    const route = router.resolve({ name: 'UserProfile', params: { userId } })
    return window.location.origin + route.href
  }
}

// ==================== 대시보드 네비게이션 헬퍼 ====================
export const dashboardNavigation = {
  toDashboard() {
    return router.push({ name: 'Dashboard' })
  },
  isDashboardPage() {
    const route = router.currentRoute.value
    return route.name === 'Dashboard'
  }
}

// ==================== 통합 네비게이션 헬퍼 ====================
export const navigation = {
  admin: adminNavigation,  // ⭐ 추가
  chat: chatNavigation,
  product: productNavigation,
  carrier: carrierNavigation,
  feed: feedNavigation,
  battle: battleNavigation,
  user: userNavigation,
  dashboard: dashboardNavigation,

  toHome() { return router.push({ name: 'Dashboard' }) },
  toMyPage() { return userNavigation.toMyPage() },
  toLogin(redirectPath) {
    const query = redirectPath ? { redirect: redirectPath } : {}
    return router.push({ name: 'Login', query })
  },
  toAdmin() { return adminNavigation.toDashboard() },  // ⭐ 추가
  getCurrentRoute() { return router.currentRoute.value },
  goBack() { return router.go(-1) }
}