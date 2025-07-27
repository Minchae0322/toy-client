import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/router/guards/authGuard.js'

// Views import
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import OAuthCallback from '@/views/OAuth2Callback.vue'
import OneMouthView from '@/views/OneMouthView.vue'
import OneMouthListView from "@/views/OneMouthListView.vue"
import OneMouthDetailView from "@/views/OneMouthDetailView.vue"
import CategoryAdminView from "@/views/CategoryAdminView.vue"

// Chat Views import
import ChatApp from '@/views/ChatApp.vue'
import ChatRoomView from '@/views/ChatRoomView.vue'
import ChatDetailView from '@/views/ChatDetailView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuthCallback
  },
  {
    path: '/sell',
    name: 'Sell',
    component: OneMouthView,
    meta: { requiresAuth: false }
  },
  {
    path: '/one-mouth/list',
    name: 'OneMouthList',
    component: OneMouthListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/one-mouth/detail',
    name: 'OneMouthDetail',
    component: OneMouthDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/category',
    name: 'CategoryAdmin',
    component: CategoryAdminView,
    meta: {
      requiresAuth: false,
      requiresAdmin: false,
      title: '카테고리 관리'
    }
  },

  // ===== 채팅 관련 라우트 =====
  {
    path: '/chat',
    name: 'Chat',
    component: ChatApp,
    meta: {
      requiresAuth: true,
      title: '채팅'
    },
    children: [
      {
        path: '',
        name: 'ChatRoomList',
        component: ChatRoomView,
        meta: {
          requiresAuth: true,
          title: '채팅방 목록'
        }
      },
      {
        path: 'room/:roomId',
        name: 'ChatRoom',
        component: ChatDetailView,
        props: true,
        meta: {
          requiresAuth: true,
          title: '채팅방'
        },
        beforeEnter: (to, from, next) => {
          // 채팅방 ID 유효성 검사
          if (!to.params.roomId || to.params.roomId.trim() === '') {
            next({ name: 'ChatRoomList' })
          } else {
            next()
          }
        }
      }
    ]
  },

  // 채팅방 직접 접근 (뒤로가기 버튼 고려)
  {
    path: '/chat/room/:roomId',
    redirect: to => {
      return { name: 'ChatRoom', params: { roomId: to.params.roomId } }
    }
  },

  // 기본 리다이렉트
  {
    path: '/',
    redirect: '/home'
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 뒤로가기 시 스크롤 위치 복원
    if (savedPosition) {
      return savedPosition
    }
    // 채팅 관련 페이지는 스크롤 위치 유지
    if (to.path.startsWith('/chat')) {
      return false
    }
    // 기본적으로 맨 위로 스크롤
    return { top: 0 }
  }
})

// 가드 적용
router.beforeEach(authGuard)

// 채팅 관련 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  // 채팅방 접근 시 추가 검증
  if (to.name === 'ChatRoom') {
    try {
      // 채팅방 존재 여부 및 접근 권한 확인 (선택사항)
      // const roomId = to.params.roomId
      // const hasAccess = await checkChatRoomAccess(roomId)
      // if (!hasAccess) {
      //   next({ name: 'ChatRoomList' })
      //   return
      // }
    } catch (error) {
      console.error('채팅방 접근 검증 실패:', error)
      next({ name: 'ChatRoomList' })
      return
    }
  }

  next()
})

// 페이지 타이틀 설정
router.afterEach((to) => {
  // 동적 타이틀 설정
  let title = 'ToyChat'

  if (to.meta.title) {
    title = `${to.meta.title} | ToyChat`
  } else if (to.name === 'ChatRoom') {
    // 채팅방 이름을 타이틀로 설정 (실제 구현에서는 API에서 가져옴)
    title = `채팅방 | ToyChat`
  }

  document.title = title
})

export default router

// 채팅 관련 네비게이션 헬퍼 함수들
export const chatNavigation = {
  // 채팅방 목록으로 이동
  toChatRoomList() {
    return router.push({ name: 'ChatRoomList' })
  },

  // 특정 채팅방으로 이동
  toChatRoom(roomId) {
    return router.push({ name: 'ChatRoom', params: { roomId } })
  },

  // 현재 채팅방 ID 가져오기
  getCurrentRoomId() {
    const route = router.currentRoute.value
    return route.name === 'ChatRoom' ? route.params.roomId : null
  },

  // 채팅 관련 페이지인지 확인
  isChatPage() {
    return router.currentRoute.value.path.startsWith('/chat')
  },

  // 채팅방 상세 페이지인지 확인
  isChatRoomPage() {
    return router.currentRoute.value.name === 'ChatRoom'
  }
}

// 전역 네비게이션 이벤트 (필요시 사용)
export const setupChatNavigation = () => {
  // 브라우저 뒤로가기 처리
  window.addEventListener('popstate', (event) => {
    const currentRoute = router.currentRoute.value

    // 채팅방에서 뒤로가기 시 WebSocket 정리
    if (currentRoute.name === 'ChatRoom') {
      // WebSocket 연결 해제 등의 정리 작업
      window.dispatchEvent(new CustomEvent('chat:cleanup'))
    }
  })

  // 페이지 새로고침/종료 시 정리
  window.addEventListener('beforeunload', (event) => {
    const currentRoute = router.currentRoute.value

    if (currentRoute.name === 'ChatRoom') {
      // 채팅방 퇴장 처리 (동기적으로)
      window.dispatchEvent(new CustomEvent('chat:beforeunload'))
    }
  })
}