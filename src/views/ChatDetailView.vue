
<template>
  <div class="chat-detail-container">
    <!-- 채팅방 헤더 -->
    <div class="chat-detail-header">
      <button class="back-button" @click="$emit('back-to-list')">
        ← 뒤로
      </button>
      <div class="room-info">
        <h2 class="room-title">{{ roomInfo.title || '채팅방' }}</h2>
        <p class="room-participants">
          {{ roomInfo.participantCount }}명
          <span v-if="onlineUsers.length > 0" class="online-indicator">
            • {{ onlineUsers.length }}명 온라인
          </span>
        </p>
      </div>
      <button class="menu-button" @click="showRoomMenu = !showRoomMenu">⋮</button>
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
        <p>메시지를 불러오는 중...</p>
      </div>

      <!-- 메시지 목록 -->
      <div v-else class="messages-list">
        <TransitionGroup name="message" tag="div">
          <ChatMessage
              v-for="message in messages"
              :key="message.messageId"
              :message="message"
              :is-mine="message.senderId === currentUserId"
              :show-sender="shouldShowSender(message)"
              @message-click="handleMessageClick"
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
        :disabled="sending"
    />

    <!-- 채팅방 메뉴 -->
    <Transition name="fade">
      <div v-if="showRoomMenu" class="room-menu-overlay" @click="showRoomMenu = false">
        <div class="room-menu" @click.stop>
          <button @click="showParticipants">👥 참여자 보기</button>
          <button @click="searchMessages">🔍 메시지 검색</button>
          <button @click="toggleNotification">🔔 알림 설정</button>
          <button @click="leaveRoom" class="danger">🚪 채팅방 나가기</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import { chatApi } from '../services/chatApi.js'
import { webSocketService } from '../services/webSocketService.js'

const props = defineProps(['roomId'])
const emit = defineEmits(['back-to-list', 'new-message'])

// 반응형 데이터
const messages = ref([])
const roomInfo = ref({})
const loading = ref(true)
const loadingMore = ref(false)
const sending = ref(false)
const showRoomMenu = ref(false)
const messagesContainer = ref(null)
const currentUserId = ref(1) // 실제로는 인증에서 가져옴

// 실시간 상태
const onlineUsers = ref([])
const typingUsers = ref([])
const typingTimer = ref(null)

// 페이징 관련
const currentPage = ref(0)
const hasMoreMessages = ref(true)
const pageSize = 50

// 메시지 목록 조회
const fetchMessages = async (page = 0, append = false) => {
  try {
    if (page === 0) loading.value = true
    else loadingMore.value = true

    const response = await chatApi.getMessages(props.roomId, {
      page,
      size: pageSize,
      sort: 'createdAt,desc'
    })

    const newMessages = response.data.content.reverse()

    if (append) {
      // 이전 메시지를 앞에 추가
      messages.value = [...newMessages, ...messages.value]
    } else {
      // 새로운 메시지로 교체
      messages.value = newMessages
    }

    // 더 불러올 메시지가 있는지 확인
    hasMoreMessages.value = !response.data.last
    currentPage.value = page

    await nextTick()
    if (!append) {
      scrollToBottom()
    }
  } catch (error) {
    console.error('메시지 조회 실패:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 채팅방 정보 조회
const fetchRoomInfo = async () => {
  try {
    const response = await chatApi.getRoomDetail(props.roomId)
    roomInfo.value = response.data
  } catch (error) {
    console.error('채팅방 정보 조회 실패:', error)
  }
}

// 메시지 전송
const sendMessage = async (messageData) => {
  if (!messageData.content?.trim() && !messageData.file) return

  try {
    sending.value = true

    // 임시 메시지 생성 (즉시 화면에 표시)
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

    // 실제 API 호출
    const response = await chatApi.sendMessage(props.roomId, {
      content: messageData.content,
      type: messageData.type || 'TEXT',
      metadata: messageData.metadata
    })

    // 임시 메시지를 실제 메시지로 교체
    const tempIndex = messages.value.findIndex(m => m.messageId === tempMessage.messageId)
    if (tempIndex !== -1) {
      messages.value[tempIndex] = response.data.message
    }

    emit('new-message', response.data.message)

  } catch (error) {
    console.error('메시지 전송 실패:', error)

    // 실패한 메시지 표시
    const tempIndex = messages.value.findIndex(m => m.messageId === tempMessage.messageId)
    if (tempIndex !== -1) {
      messages.value[tempIndex].status = 'FAILED'
    }

    alert('메시지 전송에 실패했습니다')
  } finally {
    sending.value = false
  }
}

// WebSocket 메시지 처리
const handleWebSocketMessage = (message) => {
  console.log('WebSocket 메시지 수신:', message)

  switch (message.type) {
    case 'CHAT_MESSAGE':
      handleNewMessage(message)
      break
    case 'SYSTEM_MESSAGE':
      handleSystemMessage(message)
      break
    case 'USER_STATUS':
      handleUserStatus(message)
      break
    case 'TYPING_STATUS':
      handleTypingStatus(message)
      break
  }
}

// 새 메시지 처리
const handleNewMessage = (message) => {
  // 이미 있는 메시지인지 확인 (중복 방지)
  const existingMessage = messages.value.find(m => m.messageId === message.messageId)
  if (existingMessage) return

  messages.value.push(message)

  nextTick(() => {
    // 스크롤이 맨 아래에 있었다면 자동 스크롤
    if (isAtBottom()) {
      scrollToBottom()
    }
  })

  emit('new-message', message)
}

// 시스템 메시지 처리
const handleSystemMessage = (message) => {
  messages.value.push({
    ...message,
    isSystem: true
  })

  nextTick(() => {
    if (isAtBottom()) {
      scrollToBottom()
    }
  })
}

// 사용자 상태 처리
const handleUserStatus = (message) => {
  if (message.status === 'ONLINE') {
    if (!onlineUsers.value.includes(message.userId)) {
      onlineUsers.value.push(message.userId)
    }
  } else {
    onlineUsers.value = onlineUsers.value.filter(id => id !== message.userId)
  }
}

// 타이핑 상태 처리
const handleTypingStatus = (message) => {
  const userId = message.userId

  if (message.isTyping) {
    if (!typingUsers.value.some(user => user.userId === userId)) {
      typingUsers.value.push({
        userId: userId,
        userName: message.userName || `사용자${userId}`
      })
    }
  } else {
    typingUsers.value = typingUsers.value.filter(user => user.userId !== userId)
  }
}

// 타이핑 시작
const handleTypingStart = () => {
  webSocketService.sendTypingStatus(props.roomId, true)

  // 타이핑 타이머 리셋
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  typingTimer.value = setTimeout(() => {
    handleTypingStop()
  }, 3000) // 3초 후 자동으로 타이핑 중지
}

// 타이핑 중지
const handleTypingStop = () => {
  webSocketService.sendTypingStatus(props.roomId, false)

  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
}

// 스크롤 처리
const handleScroll = () => {
  if (!messagesContainer.value) return

  const { scrollTop } = messagesContainer.value

  // 맨 위에 도달하면 이전 메시지 로드
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

  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  return scrollTop + clientHeight >= scrollHeight - 50 // 50px 여유
}

// 발신자 표시 여부 결정
const shouldShowSender = (message) => {
  const messageIndex = messages.value.findIndex(m => m.messageId === message.messageId)
  if (messageIndex === 0) return true

  const prevMessage = messages.value[messageIndex - 1]
  if (!prevMessage) return true

  // 이전 메시지와 발신자가 다르거나, 시간 차이가 5분 이상이면 표시
  const timeDiff = new Date(message.createdAt) - new Date(prevMessage.createdAt)
  return prevMessage.senderId !== message.senderId || timeDiff > 5 * 60 * 1000
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

// 메시지 클릭 처리
const handleMessageClick = (message) => {
  console.log('메시지 클릭:', message)
  // 메시지 상세보기, 답장 등의 기능
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

const leaveRoom = async () => {
  if (confirm('정말 채팅방을 나가시겠습니까?')) {
    emit('back-to-list')
  }
  showRoomMenu.value = false
}

// 라이프사이클
onMounted(() => {
  fetchRoomInfo()
  fetchMessages()

  // WebSocket 메시지 리스너 등록
  webSocketService.subscribeToRoom(props.roomId, handleWebSocketMessage)
})

onUnmounted(() => {
  // 타이핑 중지
  if (typingTimer.value) {
    handleTypingStop()
  }

  // WebSocket 구독 해제
  webSocketService.unsubscribeFromRoom(props.roomId)
})

// roomId 변경 감지
watch(() => props.roomId, (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    // 이전 채팅방 구독 해제
    if (oldRoomId) {
      webSocketService.unsubscribeFromRoom(oldRoomId)
    }

    // 새 채팅방 초기화
    messages.value = []
    onlineUsers.value = []
    typingUsers.value = []
    currentPage.value = 0
    hasMoreMessages.value = true

    // 새 채팅방 데이터 로드
    fetchRoomInfo()
    fetchMessages()
    webSocketService.subscribeToRoom(newRoomId, handleWebSocketMessage)
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
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.back-button, .menu-button {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover, .menu-button:hover {
  background: rgba(255,255,255,0.3);
}

.room-info {
  flex: 1;
  text-align: center;
}

.room-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.room-participants {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
}

.online-indicator {
  color: #10b981;
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
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
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
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.room-menu {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 8px;
  min-width: 200px;
}

.room-menu button {
  display: block;
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
</style>