<template>
  <div class="chat-detail-container">
    <!-- 채팅방 헤더 -->
    <div class="chat-detail-header">
      <button class="back-button" @click="$emit('back-to-list')">
        <ArrowLeft :size="20" />
        <span>뒤로</span>
      </button>
      <div class="room-info">
        <h2 class="room-title">{{ roomInfo.title || '채팅방' }}</h2>
        <p class="room-participants">
          {{ roomInfo.participantCount }}명
          <span v-if="onlineUsers.length > 0" class="online-indicator">
            • {{ onlineUsers.length }}명 온라인
          </span>
          <!-- 연결 상태 표시 -->
          <span v-if="connectionState.connected" class="connection-status connected">
            📶 연결됨
          </span>
          <span v-else-if="connectionState.connecting" class="connection-status connecting">
            ⏳ 연결 중...
          </span>
          <span v-else class="connection-status disconnected">
            ❌ 연결 끊김
          </span>
        </p>
      </div>
      <button class="menu-button" @click="showRoomMenu = !showRoomMenu">
        <MoreVertical :size="20" />
      </button>
    </div>

    <!-- 디바이스 정보 표시 (개발 모드) -->
    <div v-if="showDeviceInfo && isDev" class="device-info-banner">
      <div class="device-details">
        <span>{{ deviceInfo.deviceType }}</span> |
        <span>{{ deviceInfo.browser.name }}</span> |
        <span>{{ deviceInfo.deviceName }}</span>
      </div>
      <button @click="showDeviceInfo = false" class="close-device-info">
        <X :size="16" />
      </button>
    </div>

    <!-- 연결 오류 알림 -->
    <div v-if="connectionState.status === 'error'" class="connection-error">
      <AlertCircle :size="16" />
      <span>연결 오류: {{ connectionState.error }}</span>
      <button @click="reconnectWebSocket" class="retry-btn">재연결</button>
    </div>

    <!-- 메시지 목록 -->
    <div class="messages-container" ref="messagesContainer" @scroll="handleScroll">
      <!-- 로딩 인디케이터 (상단) -->
      <div v-if="loadingMore" class="loading-more">
        <div class="spinner-small"></div>
        <span>이전 메시지 불러오는 중...</span>
      </div>

      <!-- 초기 로딩 -->
      <div v-if="loading && messages.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>채팅방을 준비하는 중...</p>
      </div>

      <!-- 메시지 목록 -->
      <div v-else class="messages-list">
        <TransitionGroup name="message" tag="div">
          <ChatMessage
              v-for="message in messages"
              :key="message.messageId || message.id"
              :message="message"
              :is-mine="message.senderId === currentUserId"
              :show-sender="shouldShowSender(message)"
              :show-time="shouldShowTime(message)"
              @message-click="handleMessageClick"
              @retry="retryMessage"
              @delete="deleteMessage"
          />
        </TransitionGroup>
      </div>

      <!-- 타이핑 인디케이터 -->
      <div v-if="typingUsers.length > 0" class="typing-indicator">
        <div class="typing-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="typing-text">
          {{ getTypingText() }}
        </span>
      </div>
    </div>

    <!-- 메시지 입력 -->
    <MessageInput
        @send-message="sendMessage"
        @typing-start="handleTypingStart"
        @typing-stop="handleTypingStop"
        :disabled="sending || !connectionState.connected"
        :placeholder="connectionState.connected ? '메시지를 입력하세요...' : '연결을 기다리는 중...'"
    />

    <!-- 채팅방 메뉴 -->
    <Transition name="fade">
      <div v-if="showRoomMenu" class="room-menu-overlay" @click="showRoomMenu = false">
        <div class="room-menu" @click.stop>
          <button @click="showParticipants">
            <Users :size="16" />
            <span>참여자 보기</span>
          </button>
          <button @click="searchMessages">
            <Search :size="16" />
            <span>메시지 검색</span>
          </button>
          <button @click="toggleNotification">
            <Bell :size="16" />
            <span>알림 설정</span>
          </button>
          <button @click="toggleDeviceInfo">
            <Monitor :size="16" />
            <span>디바이스 정보</span>
          </button>
          <button @click="reconnectWebSocket">
            <RefreshCw :size="16" />
            <span>연결 새로고침</span>
          </button>
          <div class="menu-divider"></div>
          <button @click="leaveRoom" class="danger">
            <LogOut :size="16" />
            <span>채팅방 나가기</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, nextTick, watch, computed} from 'vue'
import {
  ArrowLeft,
  MoreVertical,
  X,
  AlertCircle,
  Users,
  Search,
  Bell,
  Monitor,
  RefreshCw,
  LogOut
} from 'lucide-vue-next'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import {chatApi} from '@/services/chatService.js'
import {webSocketService} from '@/services/webSocketService.js'

const props = defineProps(['roomId'])
const emit = defineEmits(['back-to-list', 'new-message'])

// 반응형 데이터
const messages = ref([])
const roomInfo = ref({})
const loading = ref(true)
const loadingMore = ref(false)
const sending = ref(false)
const showRoomMenu = ref(false)
const showDeviceInfo = ref(false)
const messagesContainer = ref(null)
const currentUserId = ref(null)
const isDev = ref(import.meta.env.DEV)

// 실시간 상태
const onlineUsers = ref([])
const typingUsers = ref([])
const typingTimer = ref(null)

// WebSocket 상태
const connectionState = ref({
  connected: false,
  connecting: false,
  status: 'disconnected',
  error: null
})

const deviceInfo = ref({
  deviceType: 'Desktop',
  browser: { name: 'Chrome' },
  deviceName: 'Web Browser'
})

// 페이징 관련
const currentPage = ref(0)
const hasMoreMessages = ref(true)
const pageSize = 50

// 현재 사용자 ID 가져오기
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return 1 // 임시 사용자 ID

    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub || 1
  } catch (error) {
    console.warn('사용자 ID 추출 실패, 기본값 사용:', error)
    return 1
  }
}

// 채팅방 초기화
const initializeChatRoom = async () => {
  try {
    loading.value = true
    console.log('🏠 채팅방 초기화 시작:', props.roomId)

    // 1. WebSocket 연결 상태 확인
    if (!webSocketService.isConnected()) {
      console.log('🔌 WebSocket 연결 시도...')
      try {
        connectionState.value.connecting = true
        await webSocketService.connect()
        connectionState.value.connected = true
        connectionState.value.connecting = false
        connectionState.value.status = 'connected'
        console.log('✅ WebSocket 연결 완료')
      } catch (error) {
        console.error('❌ WebSocket 연결 실패:', error)
        connectionState.value.connecting = false
        connectionState.value.status = 'error'
        connectionState.value.error = error.message
        throw new Error('실시간 연결에 실패했습니다')
      }
    }

    // 2. WebSocket 핸들러 설정
    console.log('🎯 WebSocket 핸들러 설정...')
    setupWebSocketHandlers()

    // 3. 채팅방 구독
    console.log('📡 채팅방 구독 시작:', props.roomId)
    try {
      await webSocketService.subscribeToChatRoom(props.roomId, handleNewMessage)
      console.log('✅ 채팅방 구독 완료:', props.roomId)
    } catch (error) {
      console.error('❌ 채팅방 구독 오류:', error)
      throw new Error('채팅방 구독에 실패했습니다')
    }

    // 4. 채팅방 입장 API 호출 (선택사항)
    try {
      await chatApi.joinRoom(props.roomId)
    } catch (error) {
      console.warn('⚠️ 채팅방 입장 API 실패 (계속 진행):', error)
    }

    // 5. 병렬로 채팅방 정보와 메시지 목록 가져오기
    console.log('📊 채팅방 데이터 로딩...')
    try {
      const [roomDataResponse, messagesResponse] = await Promise.all([
        chatApi.getRoomDetail(props.roomId).catch(error => {
          console.warn('⚠️ 채팅방 정보 조회 실패, 기본값 사용:', error)
          return {
            success: true,
            data: {
              title: `채팅방 ${props.roomId}`,
              participantCount: 0,
              roomId: props.roomId,
              roomType: 'GROUP',
              status: 'ACTIVE'
            },
            message: 'default data'
          }
        }),
        chatApi.getMessages(props.roomId, {
          page: 0,
          size: pageSize,
          sort: 'createdAt,desc'
        }).catch(error => {
          console.warn('⚠️ 메시지 목록 조회 실패, 빈 목록 사용:', error)
          return {
            success: true,
            data: {
              content: [],
              last: true,
              totalElements: 0,
              size: pageSize,
              number: 0
            },
            message: 'empty data'
          }
        })
      ])

      // 6. 데이터 설정
      roomInfo.value = {
        title: roomDataResponse.data.title,
        participantCount: roomDataResponse.data.participantCount || 0,
        roomId: roomDataResponse.data.roomId,
        description: roomDataResponse.data.description,
        roomType: roomDataResponse.data.roomType,
        status: roomDataResponse.data.status
      }

      // 메시지 목록 설정
      const messagesPage = messagesResponse.data
      const messagesList = messagesPage.content || []
      messages.value = messagesList.reverse() // 오래된 메시지부터 표시

      // 페이징 정보 설정
      hasMoreMessages.value = !messagesPage.last
      currentPage.value = messagesPage.number || 0

      console.log('✅ 채팅방 초기화 완료')
      console.log('- 채팅방 정보:', roomInfo.value)
      console.log('- 메시지 수:', messages.value.length)
      console.log('- 더 불러올 메시지:', hasMoreMessages.value)

      // 7. 스크롤을 맨 아래로 이동
      await nextTick()
      scrollToBottom()

    } catch (error) {
      console.error('❌ 데이터 로딩 실패:', error)
      throw error
    }

  } catch (error) {
    console.error('❌ 채팅방 초기화 실패:', error)

    let errorMessage = '채팅방 접속에 실패했습니다.'
    if (error.message.includes('네트워크') || error.message.includes('Network')) {
      errorMessage = '네트워크 연결을 확인해주세요.'
    } else if (error.message.includes('권한') || error.message.includes('Unauthorized')) {
      errorMessage = '채팅방 접근 권한이 없습니다.'
    } else if (error.message.includes('WebSocket') || error.message.includes('실시간')) {
      errorMessage = '실시간 연결에 실패했습니다. 새로고침 후 다시 시도해주세요.'
    }

    alert(errorMessage)
    emit('back-to-list')
  } finally {
    loading.value = false
  }
}

// 메시지 목록 조회
const fetchMessages = async (page = 0, append = false) => {
  try {
    if (page === 0) loading.value = true
    else loadingMore.value = true

    const params = {
      page,
      size: pageSize,
      sort: 'createdAt,desc'
    }

    if (append && messages.value.length > 0) {
      params.lastMessageId = messages.value[0].messageId
    }

    const response = await chatApi.getMessages(props.roomId, params)
    const messagesPage = response.data
    const newMessages = messagesPage.content.reverse()

    if (append) {
      const previousScrollHeight = messagesContainer.value?.scrollHeight || 0
      messages.value = [...newMessages, ...messages.value]

      await nextTick()
      if (messagesContainer.value) {
        const newScrollHeight = messagesContainer.value.scrollHeight
        messagesContainer.value.scrollTop = newScrollHeight - previousScrollHeight
      }
    } else {
      messages.value = newMessages
      await nextTick()
      scrollToBottom()
    }

    hasMoreMessages.value = !messagesPage.last
    currentPage.value = messagesPage.number

  } catch (error) {
    console.error('메시지 조회 실패:', error)
    throw error
  } finally {
    if (page > 0) loadingMore.value = false
  }
}

// 메시지 전송
const sendMessage = async (messageData) => {
  if (!messageData.content?.trim() && !messageData.file) return
  if (!connectionState.value.connected) {
    alert('연결이 끊어진 상태입니다. 잠시 후 다시 시도해주세요.')
    return
  }

  try {
    sending.value = true

    // 임시 메시지 생성
    const tempMessage = {
      messageId: `temp-${Date.now()}`,
      roomId: props.roomId,
      senderId: currentUserId.value,
      senderName: '나',
      content: messageData.content,
      type: messageData.type || 'TEXT',
      createdAt: new Date().toISOString(),
      status: 'SENDING'
    }

    messages.value.push(tempMessage)
    await nextTick()
    scrollToBottom()

    // WebSocket을 통한 메시지 전송
    webSocketService.sendMessage(props.roomId, {
      content: messageData.content,
      type: messageData.type || 'TEXT',
      metadata: messageData.metadata
    })

    // REST API 호출
    const response = await chatApi.sendMessage(props.roomId, {
      content: messageData.content,
      type: messageData.type || 'TEXT',
      metadata: messageData.metadata
    })

    // 임시 메시지를 실제 메시지로 교체
    const tempIndex = messages.value.findIndex(m => m.messageId === tempMessage.messageId)
    if (tempIndex !== -1) {
      messages.value[tempIndex] = {
        ...response.data.message,
        status: 'SENT'
      }
    }

    emit('new-message', response.data.message)

  } catch (error) {
    console.error('메시지 전송 실패:', error)
    const tempIndex = messages.value.findIndex(m => m.messageId === tempMessage.messageId)
    if (tempIndex !== -1) {
      messages.value[tempIndex].status = 'FAILED'
    }
    alert('메시지 전송에 실패했습니다')
  } finally {
    sending.value = false
  }
}

// WebSocket 메시지 처리 함수들
const setupWebSocketHandlers = () => {
  console.log('🎯 WebSocket 핸들러 설정 시작')
  // 핸들러는 이미 subscribeToChatRoom에서 설정됨
}

// 새 메시지 처리
const handleNewMessage = (message) => {
  console.log('📨 새 채팅 메시지 수신:', message)

  if (message.senderId !== currentUserId.value && message.roomId === props.roomId) {
    const existingMessage = messages.value.find(m =>
        m.messageId === message.messageId ||
        (m.content === message.content && m.senderId === message.senderId &&
            Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000)
    )

    if (existingMessage) {
      console.log('⚠️ 중복 메시지 무시:', message.messageId)
      return
    }

    console.log('✅ 새 메시지 추가:', message)
    messages.value.push(message)

    nextTick(() => {
      if (isAtBottom()) {
        scrollToBottom()
      }
    })

    emit('new-message', message)
  }
}

// 타이핑 시작
const handleTypingStart = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  typingTimer.value = setTimeout(() => {
    handleTypingStop()
  }, 3000)
}

// 타이핑 중지
const handleTypingStop = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
}

// 스크롤 처리
const handleScroll = () => {
  if (!messagesContainer.value) return

  const {scrollTop} = messagesContainer.value

  if (scrollTop === 0 && hasMoreMessages.value && !loadingMore.value) {
    loadMoreMessages()
  }
}

// 이전 메시지 더 로드
const loadMoreMessages = async () => {
  if (!hasMoreMessages.value || loadingMore.value) return

  const nextPage = currentPage.value + 1
  await fetchMessages(nextPage, true)
}

// 스크롤 유틸리티
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const isAtBottom = () => {
  if (!messagesContainer.value) return false

  const {scrollTop, scrollHeight, clientHeight} = messagesContainer.value
  return scrollTop + clientHeight >= scrollHeight - 50
}

// 발신자 표시 여부 결정
const shouldShowSender = (message) => {
  const messageIndex = messages.value.findIndex(m => m.messageId === message.messageId)
  if (messageIndex === 0) return true

  const prevMessage = messages.value[messageIndex - 1]
  if (!prevMessage) return true

  const timeDiff = new Date(message.createdAt) - new Date(prevMessage.createdAt)
  return prevMessage.senderId !== message.senderId || timeDiff > 5 * 60 * 1000
}

// 시간 표시 여부 결정
const shouldShowTime = (message) => {
  const messageIndex = messages.value.findIndex(m => m.messageId === message.messageId)
  if (messageIndex === messages.value.length - 1) return true

  const nextMessage = messages.value[messageIndex + 1]
  if (!nextMessage) return true

  const timeDiff = new Date(nextMessage.createdAt) - new Date(message.createdAt)
  return timeDiff > 5 * 60 * 1000
}

// 타이핑 텍스트 생성
const getTypingText = () => {
  const count = typingUsers.value.length
  if (count === 1) {
    return `${typingUsers.value[0].userName}님이 입력 중...`
  } else if (count === 2) {
    return `${typingUsers.value[0].userName}님, ${typingUsers.value[1].userName}님이 입력 중...`
  } else {
    return `${typingUsers.value[0].userName}님 외 ${count - 1}명이 입력 중...`
  }
}

// 메시지 액션 처리
const handleMessageClick = (message) => {
  console.log('메시지 클릭:', message)
}

const retryMessage = (messageId) => {
  console.log('메시지 재전송:', messageId)
}

const deleteMessage = (messageId) => {
  console.log('메시지 삭제:', messageId)
}

// 채팅방 메뉴 기능들
const showParticipants = () => {
  console.log('참여자 보기')
  showRoomMenu.value = false
}

const searchMessages = () => {
  console.log('메시지 검색')
  showRoomMenu.value = false
}

const toggleNotification = () => {
  console.log('알림 설정')
  showRoomMenu.value = false
}

const toggleDeviceInfo = () => {
  showDeviceInfo.value = !showDeviceInfo.value
  showRoomMenu.value = false
}

const reconnectWebSocket = async () => {
  showRoomMenu.value = false
  try {
    if (!webSocketService.isConnected()) {
      connectionState.value.connecting = true
      await webSocketService.connect()
      connectionState.value.connected = true
      connectionState.value.connecting = false
      connectionState.value.status = 'connected'
    }

    await webSocketService.subscribeToChatRoom(props.roomId, handleNewMessage)
  } catch (error) {
    console.error('재연결 실패:', error)
    connectionState.value.connecting = false
    connectionState.value.status = 'error'
    connectionState.value.error = error.message
    alert('연결 재시도에 실패했습니다.')
  }
}

const leaveRoom = async () => {
  if (confirm('정말 채팅방을 나가시겠습니까?')) {
    webSocketService.unsubscribeFromChatRoom(props.roomId)
    console.log('🔴 채팅방 구독 해제:', props.roomId)

    try {
      await chatApi.leaveRoom(props.roomId)
    } catch (error) {
      console.warn('⚠️ 채팅방 나가기 API 실패:', error)
    }

    emit('back-to-list')
  }
  showRoomMenu.value = false
}

// 라이프사이클
onMounted(async () => {
  currentUserId.value = getCurrentUserId()
  console.log('👤 현재 사용자 ID:', currentUserId.value)
  await initializeChatRoom()
})

onUnmounted(() => {
  console.log('🔌 채팅방 컴포넌트 해제')

  if (typingTimer.value) {
    handleTypingStop()
  }

  webSocketService.unsubscribeFromChatRoom(props.roomId)
  console.log('🔴 채팅방 구독 해제:', props.roomId)
})

// roomId 변경 감지
watch(() => props.roomId, async (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    console.log('🔄 채팅방 변경:', oldRoomId, '=>', newRoomId)

    if (typingTimer.value) {
      handleTypingStop()
    }

    if (oldRoomId) {
      webSocketService.unsubscribeFromChatRoom(oldRoomId)
      console.log('🔴 이전 채팅방 구독 해제:', oldRoomId)
    }

    messages.value = []
    onlineUsers.value = []
    typingUsers.value = []
    currentPage.value = 0
    hasMoreMessages.value = true

    await initializeChatRoom()
  }
})
</script>

<style scoped>
.chat-detail-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
}

.chat-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-button, .menu-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover, .menu-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.room-info {
  flex: 1;
  text-align: center;
  margin: 0 16px;
}

.room-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.room-participants {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.online-indicator {
  color: #10b981;
}

.connection-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.connection-status.connected {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.connection-status.connecting {
  background: rgba(251, 191, 36, 0.2);
  color: #f59e0b;
}

.connection-status.disconnected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.device-info-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
}

.device-details {
  display: flex;
  gap: 8px;
}

.close-device-info {
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
}

.close-device-info:hover {
  background: #e2e8f0;
}

.connection-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
  color: #dc2626;
  font-size: 14px;
}

.retry-btn {
  margin-left: auto;
  padding: 4px 8px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #64748b;
  font-size: 14px;
  gap: 8px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  width: fit-content;
}

.typing-animation {
  display: flex;
  gap: 4px;
}

.typing-animation span {
  width: 6px;
  height: 6px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite both;
}

.typing-animation span:nth-child(1) { animation-delay: -0.32s; }
.typing-animation span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-size: 14px;
  color: #64748b;
  font-style: italic;
}

.room-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.room-menu {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 200px;
}

.room-menu button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.room-menu button:hover {
  background: #f1f5f9;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
}

.room-menu button.danger {
  color: #dc2626;
}

.room-menu button.danger:hover {
  background: #fef2f2;
}

.message-enter-active, .message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-detail-header {
    padding: 12px 16px;
  }

  .room-title {
    font-size: 16px;
  }

  .room-participants {
    font-size: 11px;
  }

  .back-button span {
    display: none;
  }

  .messages-container {
    padding: 16px;
  }

  .room-menu {
    margin: 16px;
    min-width: calc(100vw - 32px);
  }

  .device-info-banner {
    font-size: 11px;
    padding: 6px 12px;
  }

  .device-details {
    flex-direction: column;
    gap: 4px;
  }
}

/* 스크롤바 스타일 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 접근성 개선 */
.back-button:focus,
.menu-button:focus,
.room-menu button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .chat-detail-container {
    background: #1f2937;
    color: #f9fafb;
  }

  .messages-container {
    background: #111827;
  }

  .room-menu {
    background: #374151;
    color: #f9fafb;
  }

  .room-menu button:hover {
    background: #4b5563;
  }

  .device-info-banner {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }

  .connection-error {
    background: #7f1d1d;
    border-color: #b91c1c;
    color: #fca5a5;
  }

  .typing-indicator {
    background: #374151;
  }
}

/* 키보드 내비게이션 지원 */
.room-menu button:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  background: #f1f5f9;
}

/* 터치 디바이스 최적화 */
@media (hover: none) and (pointer: coarse) {
  .back-button,
  .menu-button,
  .room-menu button {
    min-height: 44px;
    min-width: 44px;
  }

  .close-device-info {
    min-height: 32px;
    min-width: 32px;
  }
}

/* 고해상도 디스플레이 지원 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .spinner,
  .spinner-small {
    border-width: 1px;
  }
}

/* 프린트 스타일 */
@media print {
  .chat-detail-header,
  .room-menu-overlay,
  .device-info-banner,
  .connection-error {
    display: none !important;
  }

  .messages-container {
    overflow: visible !important;
    height: auto !important;
    padding: 0 !important;
  }

  .typing-indicator {
    display: none !important;
  }
}

/* 애니메이션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .spinner,
  .spinner-small,
  .typing-animation span,
  .message-enter-active,
  .message-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    animation: none !important;
    transition: none !important;
  }
}
</style>