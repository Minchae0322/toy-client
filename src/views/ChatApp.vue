<template>
  <div class="app-container" :class="{ 'chat-detail-mode': !!selectedRoom }">
    <AppSidebar />

    <main class="main-content">
      <!-- 연결 상태 배너 -->
      <Transition name="slide-down">
        <div v-if="connectionState.connecting" class="connection-banner connecting">
          <div class="banner-content">
            <div class="loader-small"></div>
            <span>서버에 연결 중...</span>
          </div>
        </div>
        <div v-else-if="connectionState.status === 'error'" class="connection-banner error">
          <div class="banner-content">
            <AlertCircle :size="18" />
            <span>연결 실패</span>
            <button @click="reconnectWebSocket" class="banner-btn">재연결</button>
          </div>
        </div>
      </Transition>

      <!-- 초기화 로딩 -->
      <div v-if="!initializationComplete" class="init-screen">
        <div class="init-content">
          <div class="loader-large"></div>
          <p>불러오는 중...</p>
        </div>
      </div>

      <!-- 채팅방 목록 -->
      <ChatRoomView
          v-else-if="!selectedRoom"
          @room-selected="handleRoomSelected"
          :connection-state="connectionState"
      />

      <!-- 채팅 상세 -->
      <ChatDetailView
          v-else
          :room-id="selectedRoom"
          @back-to-list="handleBackToList"
          @new-message="handleNewMessage"
      />
    </main>

    <!-- Bottom Navigation - Mobile Only (채팅 상세에서는 숨김) -->
    <BottomNavigation v-if="!selectedRoom" :unread-count="unreadCount" />

    <!-- 알림 토스트 -->
    <Transition name="toast">
      <div
          v-if="showNotificationToast && !selectedRoom"
          class="notification-toast"
          @click="handleToastClick"
      >
        <div class="toast-avatar">
          {{ pendingNotification?.senderName?.[0] || '?' }}
        </div>
        <div class="toast-body">
          <span class="toast-sender">{{ pendingNotification?.senderName || '새 메시지' }}</span>
          <span class="toast-text">{{ pendingNotification?.content || '' }}</span>
        </div>
        <button @click.stop="dismissToast" class="toast-close">
          <X :size="16" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { AlertCircle, X } from 'lucide-vue-next'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import ChatRoomView from '@/views/ChatRoomView.vue'
import ChatDetailView from '@/views/ChatDetailView.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import { webSocketService } from '@/services/webSocketService.js'
import { useChatDetailMode } from '@/composables/useChatDetailMode.js'

const { isChatDetailOpen } = useChatDetailMode()

const props = defineProps({
  initialRoomId: { type: [String, Number], default: null }
})

const route = useRoute()

// 상태
const selectedRoom = ref(null)
const currentUserId = ref(null)
const showNotificationToast = ref(false)
const pendingNotification = ref(null)
const toastTimeout = ref(null)
const initializationComplete = ref(false)
const unreadCount = ref(3) // 읽지 않은 메시지 수

const connectionState = ref({
  connected: false,
  connecting: false,
  status: 'disconnected',
  error: null
})

// 초기 roomId 결정
const getInitialRoomId = () => {
  if (props.initialRoomId) return String(props.initialRoomId)
  if (route.params.roomId) return String(route.params.roomId)
  return null
}

// 사용자 ID
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub
  } catch { return null }
}

// WebSocket 초기화
const initializeWebSocket = async () => {
  try {
    connectionState.value.connecting = true
    connectionState.value.status = 'connecting'

    if (!webSocketService.isConnected()) {
      await webSocketService.connect()
    }

    setupGlobalMessageHandlers()

    connectionState.value.connected = true
    connectionState.value.connecting = false
    connectionState.value.status = 'connected'
    connectionState.value.error = null
  } catch (error) {
    connectionState.value.connected = false
    connectionState.value.connecting = false
    connectionState.value.status = 'error'
    connectionState.value.error = error.message
    throw error
  }
}

// 전역 메시지 핸들러
const setupGlobalMessageHandlers = () => {
  webSocketService.onMessage('chat-message', (message) => {
    if (!selectedRoom.value || selectedRoom.value !== message.roomId) {
      showMessageToast(message)
    }
  })

  webSocketService.onMessage('system-notification', (notification) => {
    showSystemToast(notification)
  })

  // 헤드업 알림은 NotificationToast(전역)에서 처리
}

// 앱 초기화
const initializeApp = async () => {
  try {
    initializationComplete.value = false
    currentUserId.value = getCurrentUserId()
    if (!currentUserId.value) return

    await initializeWebSocket()

    const initialRoomId = getInitialRoomId()
    selectedRoom.value = initialRoomId || null

    await requestNotificationPermission()
    initializationComplete.value = true
  } catch (error) {
    console.error('초기화 실패:', error)
    initializationComplete.value = true
  }
}

// 채팅방 선택
const handleRoomSelected = async (roomId) => {
  try {
    dismissToast()
    if (!webSocketService.isConnected()) {
      await initializeWebSocket()
    }
    selectedRoom.value = String(roomId)
  } catch (error) {
    console.error('채팅방 입장 실패:', error)
  }
}

// 목록으로 돌아가기
const handleBackToList = () => {
  selectedRoom.value = null
}

// 새 메시지 처리
const handleNewMessage = (message) => {
  console.log('새 메시지:', message)
}

// 메시지 토스트
const showMessageToast = (message, duration = 5000) => {
  if (message.senderId === currentUserId.value) return

  pendingNotification.value = {
    type: 'message',
    roomId: message.roomId,
    senderName: message.senderName || `사용자${message.senderId}`,
    content: formatMessageContent(message),
  }

  showNotificationToast.value = true

  if (toastTimeout.value) clearTimeout(toastTimeout.value)
  toastTimeout.value = setTimeout(dismissToast, duration)

  if (document.hidden && Notification.permission === 'granted') {
    new Notification(pendingNotification.value.senderName, {
      body: pendingNotification.value.content,
      icon: '/favicon.ico',
    })
  }
}

// 시스템 토스트
const showSystemToast = (notification) => {
  pendingNotification.value = {
    type: 'system',
    senderName: '시스템',
    content: notification.message || notification.content,
    roomId: notification.roomId,
  }

  showNotificationToast.value = true
  if (toastTimeout.value) clearTimeout(toastTimeout.value)
  toastTimeout.value = setTimeout(dismissToast, 4000)
}

// 메시지 포맷
const formatMessageContent = (message) => {
  const types = {
    TEXT: message.content?.length > 50 ? message.content.substring(0, 50) + '...' : message.content,
    IMAGE: '사진',
    VIDEO: '동영상',
    FILE: '파일',
    AUDIO: '음성',
    LOCATION: '위치',
  }
  return types[message.type] || '새 메시지'
}

// 토스트 클릭
const handleToastClick = () => {
  if (pendingNotification.value?.roomId) {
    handleRoomSelected(pendingNotification.value.roomId)
  }
  dismissToast()
}

// 토스트 닫기
const dismissToast = () => {
  showNotificationToast.value = false
  pendingNotification.value = null
  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value)
    toastTimeout.value = null
  }
}

// 재연결
const reconnectWebSocket = async () => {
  try {
    await webSocketService.disconnect()
    await initializeWebSocket()
  } catch (error) {
    console.error('재연결 실패:', error)
  }
}

// 알림 권한
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

// 가시성 변경
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') dismissToast()
}

// 라우트 감시
watch(
    [() => props.initialRoomId, () => route.params.roomId],
    ([newInitial, newRoute]) => {
      if (!initializationComplete.value) return
      const roomId = newInitial || newRoute
      if (roomId && roomId !== selectedRoom.value) {
        handleRoomSelected(roomId)
      } else if (!roomId && selectedRoom.value) {
        selectedRoom.value = null
      }
    },
    { immediate: false }
)

// 모바일 채팅 디테일 진입 시 페이지 자체 스크롤 잠금 (메시지 영역만 스크롤)
const setBodyScrollLock = (lock) => {
  if (typeof window === 'undefined') return
  if (!window.matchMedia('(max-width: 767px)').matches) return
  document.body.style.overflow = lock ? 'hidden' : ''
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

watch(
    () => !!selectedRoom.value,
    (isDetail) => {
      setBodyScrollLock(isDetail)
      isChatDetailOpen.value = isDetail
    }
)

onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  await initializeApp()
  // 초기 진입이 디테일 라우트일 수 있어 한 번 더 동기화
  if (selectedRoom.value) {
    setBodyScrollLock(true)
    isChatDetailOpen.value = true
  }
})

onBeforeUnmount(async () => {
  setBodyScrollLock(false)
  isChatDetailOpen.value = false
  dismissToast()
  await handleBackToList()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  // 메시지 핸들러만 해제, disconnect는 App.vue에서 관리
  webSocketService.offMessage('chat-message')
  webSocketService.offMessage('system-notification')
  webSocketService.offMessage('headsup')
})
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.app-container {
  background: var(--bg-base);
  min-height: 100vh;
  color: var(--text-primary);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100%;
  overflow-x: clip;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .app-container { padding: 0 2rem; }
}

@media (min-width: 1280px) {
  .app-container {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  /* BottomNavigation + iOS 홈 인디케이터 */
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  padding-left: 1.5rem;
  position: relative;
}

@media (max-width: 767px) {
  .main-content {
    padding-left: 0;
  }

  /* 모바일 채팅방 진입 시: 채팅 컨테이너를 position: fixed 로 잠가
     페이지 자체가 스크롤되는 현상(iOS 키보드 띄울 때 뷰포트 점프 등)을 차단.
     - 글로벌 헤더(요거뜨 로고)는 채팅방에서 숨기므로 top = safe-area-inset-top
     - bottom: 키보드 높이 또는 홈 인디케이터(safe-area-bottom) 중 더 큰 쪽
     ChatDetailView 가 visualViewport 로 --chat-kb-h(키보드 높이) 를 업데이트하면
     컨테이너의 bottom 이 자동으로 줄어들어 입력창이 키보드 바로 위에 붙는다. */
  .app-container.chat-detail-mode {
    position: fixed;
    top: env(safe-area-inset-top);
    left: 0;
    right: 0;
    bottom: max(var(--chat-kb-h, 0px), env(safe-area-inset-bottom));
    height: auto;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }
  .app-container.chat-detail-mode .main-content {
    min-height: 0;
    height: 100%;
    padding: 0;
  }
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
  }
}

/* 연결 배너 */
.connection-banner {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
}

.connection-banner.connecting {
  background: var(--c-warning-soft);
  color: var(--c-warning);
}

.connection-banner.error {
  background: var(--c-danger-soft);
  color: var(--c-danger);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
}

.banner-btn {
  padding: 4px 12px;
  background: var(--c-brand);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.banner-btn:hover { background: var(--c-brand-hover); }

/* 로더 */
.loader-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loader-large {
  width: 32px;
  height: 32px;
  border: 3px solid var(--c-brand-soft);
  border-top-color: var(--c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 초기화 화면 */
.init-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.init-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.init-content p {
  font-size: 15px;
  color: var(--c-text-500);
  font-weight: 500;
}

/* 알림 토스트 */
.notification-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-elevated);
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--border-default);
  cursor: pointer;
  z-index: 1001;
  max-width: 360px;
  transition: all 0.2s;
}

.notification-toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.toast-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-brand), var(--c-brand));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.toast-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-sender {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.toast-text {
  font-size: 13px;
  color: var(--c-text-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-close {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--border-default);
  border-radius: 8px;
  color: var(--c-text-400);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.toast-close:hover {
  background: var(--border-strong);
  color: var(--c-text-500);
}

/* 트랜지션 */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-100%); }

.toast-enter-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100%); }

/* 반응형 */
@media (max-width: 768px) {
  .notification-toast {
    top: auto;
    bottom: 100px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
}
</style>