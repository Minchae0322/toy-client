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

// Chat Views import (수정된 구조)
import ChatApp from '@/views/ChatApp.vue'

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
    path: '/one-mouth/:id',
    name: 'OneMouthDetail',
    component: OneMouthDetailView,
    props: true
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

  // ===== 채팅 관련 라우트 (단순화된 구조) =====
  {
    path: '/chat',
    name: 'Chat',
    component: ChatApp,
    meta: {
      requiresAuth: true,
      title: '채팅'
    }
  },

  // 채팅방 직접 접근을 위한 쿼리 파라미터 지원
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
      // 채팅방 ID 유효성 검사
      if (!to.params.roomId || to.params.roomId.trim() === '') {
        next({ name: 'Chat' })
      } else {
        next()
      }
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
  if (to.name === 'ChatWithRoom') {
    try {
      // 채팅방 존재 여부 및 접근 권한 확인 (선택사항)
      const roomId = to.params.roomId

      // 채팅방 ID 형식 검증
      if (!isValidRoomId(roomId)) {
        console.warn('유효하지 않은 채팅방 ID:', roomId)
        next({ name: 'Chat' })
        return
      }

      // 필요시 API 호출로 채팅방 존재 여부 확인
      // const hasAccess = await checkChatRoomAccess(roomId)
      // if (!hasAccess) {
      //   next({ name: 'Chat' })
      //   return
      // }

    } catch (error) {
      console.error('채팅방 접근 검증 실패:', error)
      next({ name: 'Chat' })
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
  } else if (to.name === 'ChatWithRoom') {
    // 채팅방 이름을 타이틀로 설정
    title = `채팅방 ${to.params.roomId} | ToyChat`
  }

  document.title = title
})

// 채팅방 ID 유효성 검사 함수
function isValidRoomId(roomId) {
  if (!roomId || typeof roomId !== 'string') return false

  // 기본적인 형식 검증 (필요에 따라 수정)
  const roomIdPattern = /^[a-zA-Z0-9_-]+$/
  return roomIdPattern.test(roomId) && roomId.length > 0 && roomId.length <= 50
}

// 채팅방 접근 권한 확인 함수 (필요시 구현)
async function checkChatRoomAccess(roomId) {
  try {
    // chatApi를 사용하여 채팅방 정보 확인
    // const { chatApi } = await import('@/services/chatApi.js')
    // const response = await chatApi.getRoomDetail(roomId)
    // return response.success

    // 현재는 항상 true 반환 (모든 채팅방 접근 허용)
    return true
  } catch (error) {
    console.error('채팅방 접근 권한 확인 실패:', error)
    return false
  }
}

export default router

// 채팅 관련 네비게이션 헬퍼 함수들 (수정된 구조에 맞춤)
export const chatNavigation = {
  // 채팅 메인으로 이동 (채팅방 목록)
  toChat() {
    return router.push({ name: 'Chat' })
  },

  // 특정 채팅방으로 이동
  toChatRoom(roomId) {
    if (!roomId) {
      console.warn('채팅방 ID가 없습니다')
      return this.toChat()
    }
    return router.push({ name: 'ChatWithRoom', params: { roomId } })
  },

  // 현재 채팅방 ID 가져오기
  getCurrentRoomId() {
    const route = router.currentRoute.value
    return route.name === 'ChatWithRoom' ? route.params.roomId : null
  },

  // 초기 채팅방 ID 가져오기 (props로 전달된)
  getInitialRoomId() {
    const route = router.currentRoute.value
    return route.name === 'ChatWithRoom' ? route.params.roomId : null
  },

  // 채팅 관련 페이지인지 확인
  isChatPage() {
    const route = router.currentRoute.value
    return route.name === 'Chat' || route.name === 'ChatWithRoom'
  },

  // 채팅방 상세 페이지인지 확인
  isChatRoomPage() {
    return router.currentRoute.value.name === 'ChatWithRoom'
  },

  // 채팅방 URL 생성 (공유용)
  getChatRoomUrl(roomId) {
    const route = router.resolve({ name: 'ChatWithRoom', params: { roomId } })
    return window.location.origin + route.href
  },

  // 브라우저 히스토리 관리
  replaceToChatRoom(roomId) {
    // push 대신 replace 사용 (뒤로가기 히스토리에 남지 않음)
    return router.replace({ name: 'ChatWithRoom', params: { roomId } })
  }
}

// 전역 네비게이션 이벤트 설정
export const setupChatNavigation = () => {
  // 브라우저 뒤로가기 처리
  window.addEventListener('popstate', (event) => {
    const currentRoute = router.currentRoute.value

    // 채팅방에서 뒤로가기 시 WebSocket 정리
    if (currentRoute.name === 'ChatWithRoom') {
      // WebSocket 연결 해제 등의 정리 작업
      window.dispatchEvent(new CustomEvent('chat:cleanup', {
        detail: { roomId: currentRoute.params.roomId }
      }))
    }
  })

  // 페이지 새로고침/종료 시 정리
  window.addEventListener('beforeunload', (event) => {
    const currentRoute = router.currentRoute.value

    if (currentRoute.name === 'ChatWithRoom') {
      // 채팅방 퇴장 처리 (동기적으로)
      window.dispatchEvent(new CustomEvent('chat:beforeunload', {
        detail: { roomId: currentRoute.params.roomId }
      }))
    }
  })

  // 페이지 포커스 이벤트 (채팅방 활성화/비활성화)
  document.addEventListener('visibilitychange', () => {
    const currentRoute = router.currentRoute.value

    if (currentRoute.name === 'ChatWithRoom') {
      const event = document.hidden ? 'chat:blur' : 'chat:focus'
      window.dispatchEvent(new CustomEvent(event, {
        detail: { roomId: currentRoute.params.roomId }
      }))
    }
  })
}

// 라우터 이벤트 리스너 (채팅 앱에서 사용)
export const chatRouterEvents = {
  // 채팅방 변경 감지
  onRoomChange(callback) {
    const unwatch = router.afterEach((to, from) => {
      if (to.name === 'ChatWithRoom' && from.name === 'ChatWithRoom') {
        const oldRoomId = from.params.roomId
        const newRoomId = to.params.roomId

        if (oldRoomId !== newRoomId) {
          callback(newRoomId, oldRoomId)
        }
      } else if (to.name === 'ChatWithRoom' && from.name !== 'ChatWithRoom') {
        // 채팅방으로 처음 진입
        callback(to.params.roomId, null)
      } else if (to.name !== 'ChatWithRoom' && from.name === 'ChatWithRoom') {
        // 채팅방에서 나감
        callback(null, from.params.roomId)
      }
    })

    return unwatch
  },

  // 채팅 페이지 진입/이탈 감지
  onChatPageChange(callback) {
    const unwatch = router.afterEach((to, from) => {
      const toChatPage = chatNavigation.isChatPage()
      const fromChatPage = from.name === 'Chat' || from.name === 'ChatWithRoom'

      if (toChatPage !== fromChatPage) {
        callback(toChatPage)
      }
    })

    return unwatch
  }
}