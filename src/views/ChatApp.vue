<template>
  <div class="chat-app">
    <!-- 연결 상태 표시 -->
    <div v-if="connectionState.connecting.value" class="connection-status connecting">
      <div class="status-content">
        <div class="spinner"></div>
        <span>채팅 서버에 연결 중...</span>
      </div>
    </div>

    <div v-else-if="connectionState.connectionState.status === 'error'" class="connection-status error">
      <div class="status-content">
        <AlertCircle :size="20" />
        <span>연결 실패: {{ connectionState.connectionState.error }}</span>
        <button @click="reconnectWebSocket" class="retry-btn">재연결</button>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="chat-content" :class="{ 'connection-overlay': showConnectionOverlay }">
      <!-- 채팅방 목록 뷰 -->
      <ChatRoomView
          v-if="!selectedRoom"
          @select-room="enterChatRoom"
          :connection-state="connectionState"
      />

      <!-- 채팅 상세 뷰 -->
      <ChatDetailView
          v-else
          :room-id="selectedRoom"
          @back-to-list="leaveChatRoom"
          @new-message="handleNewMessage"
      />
    </div>

    <!-- 전역 알림 토스트 -->
    <Transition name="toast">
      <div v-if="showNotificationToast && !selectedRoom" class="notification-toast" @click="handleToastClick">
        <div class="toast-content">
          <div class="toast-avatar">
            {{ pendingNotification?.senderName?.[0] || '💬' }}
          </div>
          <div class="toast-message">
            <div class="toast-sender">{{ pendingNotification?.senderName || '새 메시지' }}</div>
            <div class="toast-text">{{ pendingNotification?.content || '' }}</div>
          </div>
          <button @click.stop="dismissToast" class="toast-close">
            <X :size="16" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { AlertCircle, X } from 'lucide-vue-next'
import ChatRoomView from '@/views/ChatRoomView.vue'
import ChatDetailView from '@/views/ChatDetailView.vue'
import { chatApi } from '@/services/chatApi.js'
import { websocketService } from '@/services/websocketService.js'

// 상태 관리
const selectedRoom = ref(null)
const currentUserId = ref(null)
const showNotificationToast = ref(false)
const pendingNotification = ref(null)
const toastTimeout = ref(null)

// WebSocket 상태
const connectionState = computed(() => websocketService.getConnectionState())
const showConnectionOverlay = computed(() =>
    connectionState.value.connecting.value ||
    connectionState.value.connectionState.status === 'error'
)

// 사용자 ID 가져오기
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return null

    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub
  } catch {
    return null
  }
}

// WebSocket 연결 초기화
const initializeWebSocket = async () => {
  try {
    if (!websocketService.isConnected()) {
      await websocketService.connect()
    }

    // 전역 메시지 핸들러 설정
    setupGlobalMessageHandlers()

    console.log('✅ WebSocket 연결 및 핸들러 설정 완료')
  } catch (error) {
    console.error('❌ WebSocket 초기화 실패:', error)
    throw error
  }
}

// 전역 메시지 핸들러 설정
const setupGlobalMessageHandlers = () => {
  // 채팅 메시지 핸들러 (채팅방 밖에서)
  websocketService.onMessage('chat-message', (message) => {
    // 현재 해당 채팅방에 있지 않으면 토스트 알림 표시
    if (!selectedRoom.value || selectedRoom.value !== message.roomId) {
      showMessageToast(message)
    }
  })

  // 시스템 알림 핸들러
  websocketService.onMessage('system-notification', (notification) => {
    console.log('🔔 시스템 알림:', notification)
    showSystemToast(notification)
  })

  // 접속 상태 업데이트 핸들러
  websocketService.onMessage('presence-update', (presence) => {
    console.log('👥 전역 접속 상태 업데이트:', presence)
  })
}

// 채팅방 입장
const enterChatRoom = async (roomId) => {
  try {
    console.log(`🚪 채팅방 ${roomId} 입장 시도...`)

    // 토스트 알림 숨기기
    dismissToast()

    // WebSocket이 연결되어 있는지 확인
    if (!websocketService.isConnected()) {
      await initializeWebSocket()
    }

    // 채팅방 입장 (REST API는 ChatDetailView에서 처리)
    selectedRoom.value = roomId

    console.log(`✅ 채팅방 ${roomId}에 입장했습니다`)

  } catch (error) {
    console.error('❌ 채팅방 입장 실패:', error)
    alert('채팅방 입장에 실패했습니다. 다시 시도해주세요.')
  }
}

// 채팅방 퇴장
const leaveChatRoom = async () => {
  if (selectedRoom.value) {
    const roomId = selectedRoom.value
    try {
      console.log(`🚪 채팅방 ${roomId}에서 퇴장 중...`)

      // 채팅방 나가기 (WebSocket 구독 해제는 ChatDetailView에서 처리)
      selectedRoom.value = null

      console.log(`✅ 채팅방 ${roomId}에서 퇴장했습니다`)

    } catch (error) {
      console.error('❌ 채팅방 퇴장 실패:', error)
      selectedRoom.value = null
    }
  }
}

// 새 메시지 처리 (ChatDetailView에서 올라온 이벤트)
const handleNewMessage = (message) => {
  console.log('📨 새 메시지 처리:', message)

  // 필요시 추가 처리 (읽음 상태 업데이트, 알림 설정 등)
  // 예: 채팅방 목록의 마지막 메시지 업데이트, 읽지 않은 메시지 수 업데이트
}

// 메시지 토스트 표시
const showMessageToast = (message) => {
  // 자신이 보낸 메시지는 토스트로 표시하지 않음
  if (message.senderId === currentUserId.value) {
    return
  }

  console.log('📱 메시지 토스트 표시:', message)

  pendingNotification.value = {
    type: 'message',
    roomId: message.roomId,
    senderName: message.senderName || `사용자${message.senderId}`,
    content: formatMessageContent(message),
    messageId: message.messageId
  }

  showNotificationToast.value = true

  // 5초 후 자동 숨김
  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value)
  }

  toastTimeout.value = setTimeout(() => {
    dismissToast()
  }, 5000)

  // 브라우저 알림도 표시 (권한이 있고 페이지가 비활성 상태일 때)
  if (document.hidden && Notification.permission === 'granted') {
    new Notification(pendingNotification.value.senderName, {
      body: pendingNotification.value.content,
      icon: '/favicon.ico',
      tag: `chat-${message.roomId}`,
      renotify: true
    })
  }
}

// 시스템 토스트 표시
const showSystemToast = (notification) => {
  console.log('🔔 시스템 토스트 표시:', notification)

  pendingNotification.value = {
    type: 'system',
    senderName: '시스템 알림',
    content: notification.message || notification.content,
    roomId: notification.roomId
  }

  showNotificationToast.value = true

  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value)
  }

  toastTimeout.value = setTimeout(() => {
    dismissToast()
  }, 4000)
}

// 메시지 내용 포맷팅
const formatMessageContent = (message) => {
  switch (message.type) {
    case 'TEXT':
      return message.content.length > 50
          ? message.content.substring(0, 50) + '...'
          : message.content
    case 'IMAGE':
      return '📷 사진을 보냈습니다'
    case 'VIDEO':
      return '🎥 동영상을 보냈습니다'
    case 'FILE':
      return '📎 파일을 보냈습니다'
    case 'AUDIO':
      return '🎵 음성 메시지를 보냈습니다'
    case 'LOCATION':
      return '📍 위치를 공유했습니다'
    default:
      return '새 메시지가 도착했습니다'
  }
}

// 토스트 클릭 처리
const handleToastClick = () => {
  if (pendingNotification.value?.roomId) {
    enterChatRoom(pendingNotification.value.roomId)
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

// WebSocket 재연결
const reconnectWebSocket = async () => {
  try {
    await websocketService.disconnect()
    await initializeWebSocket()
  } catch (error) {
    console.error('❌ 재연결 실패:', error)
  }
}

// 브라우저 알림 권한 요청
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission()
      console.log('🔔 알림 권한:', permission)
    } catch (error) {
      console.error('❌ 알림 권한 요청 실패:', error)
    }
  }
}

// 페이지 가시성 변경 처리
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // 페이지가 보이게 되면 토스트 숨기기
    dismissToast()
  }
}

// 앱 초기화
onMounted(async () => {
  try {
    console.log('🚀 채팅 앱 초기화 시작...')

    // 사용자 ID 설정
    currentUserId.value = getCurrentUserId()
    if (!currentUserId.value) {
      console.error('❌ 사용자 ID를 찾을 수 없습니다')
      // 로그인 페이지로 리다이렉트 등의 처리
      return
    }

    console.log('👤 현재 사용자 ID:', currentUserId.value)

    // WebSocket 연결 초기화
    await initializeWebSocket()

    // 브라우저 알림 권한 요청
    await requestNotificationPermission()

    // 페이지 가시성 변경 이벤트 리스너
    document.addEventListener('visibilitychange', handleVisibilityChange)

    console.log('✅ 채팅 앱 초기화 완료')

  } catch (error) {
    console.error('❌ 채팅 앱 초기화 실패:', error)
  }
})

// 페이지를 떠날 때 정리
onBeforeUnmount(async () => {
  console.log('🧹 채팅 앱 정리 중...')

  // 토스트 타이머 정리
  dismissToast()

  // 채팅방 퇴장
  await leaveChatRoom()

  // 이벤트 리스너 제거
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  // WebSocket 연결 해제 (필요시)
  // websocketService.disconnect()
})

// 브라우저 종료/새로고침 시 정리
window.addEventListener('beforeunload', () => {
  console.log('🔄 페이지 새로고침/종료 - 정리 작업')
  dismissToast()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.chat-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
  position: relative;
}

/* 연결 상태 */
.connection-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 12px 16px;
  display: flex;
  justify-content: center;
}

.connection-status.connecting {
  background: #fef3c7;
  border-bottom: 1px solid #f59e0b;
  color: #92400e;
}

.connection-status.error {
  background: #fef2f2;
  border-bottom: 1px solid #ef4444;
  color: #dc2626;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  padding: 4px 8px;
  background: currentColor;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  opacity: 0.8;
}

/* 메인 콘텐츠 */
.chat-content {
  min-height: 100vh;
  transition: all 0.3s ease;
}

.chat-content.connection-overlay {
  padding-top: 60px;
}

/* 알림 토스트 */
.notification-toast {
  position: fixed;
  top: 80px;
  right: 16px;
  max-width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  z-index: 999;
  overflow: hidden;
  transition: all 0.3s ease;
}

.notification-toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.2);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  position: relative;
}

.toast-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-sender {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.toast-text {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-close {
  width: 24px;
  height: 24px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* 토스트 애니메이션 */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

/* 반응형 */
@media (max-width: 768px) {
  .notification-toast {
    right: 12px;
    left: 12px;
    max-width: none;
  }

  .status-content {
    font-size: 13px;
  }

  .connection-status {
    padding: 10px 12px;
  }

  .chat-content.connection-overlay {
    padding-top: 50px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .chat-app {
    background-color: #0f172a;
    color: #f1f5f9;
  }

  .notification-toast {
    background: #1e293b;
    border-color: #334155;
  }

  .toast-sender {
    color: #f1f5f9;
  }

  .toast-text {
    color: #94a3b8;
  }

  .toast-close {
    background: #334155;
    color: #94a3b8;
  }

  .toast-close:hover {
    background: #475569;
    color: #f1f5f9;
  }
}

/* 접근성 개선 */
.notification-toast:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.retry-btn:focus,
.toast-close:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>