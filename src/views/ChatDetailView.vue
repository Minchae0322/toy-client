<template>
  <div class="chat-detail-container">
    <!-- 채팅방 헤더 -->
    <ChatHeader
        :room-info="roomInfo"
        :online-users="onlineUsers"
        :connection-state="connectionState"
        :show-device-info="showDeviceInfo"
        :device-info="deviceInfo"
        :is-dev="isDev"
        @back-to-list="$emit('back-to-list')"
        @toggle-menu="showRoomMenu = !showRoomMenu"
        @close-device-info="showDeviceInfo = false"
        @reconnect="reconnectWebSocket"
    />

    <!-- 연결 오류 알림 -->
    <div v-if="connectionState.status === 'error'" class="connection-error">
      <AlertCircle :size="16" />
      <span>연결 오류: {{ connectionState.error }}</span>
      <button @click="reconnectWebSocket" class="retry-btn">재연결</button>
    </div>

    <!-- 메시지 영역 -->
    <MessagesArea
        ref="messagesContainer"
        :messages="messages"
        :loading="loading"
        :loading-more="loadingMore"
        :typing-users="typingUsers"
        :current-user-id="currentUserId"
        @scroll="handleScroll"
        @message-click="handleMessageClick"
        @retry="retryMessage"
        @delete="deleteMessage"
    />

    <!-- 메시지 입력 -->
    <MessageInput
        @send-message="sendMessage"
        @typing-start="handleTypingStart"
        @typing-stop="handleTypingStop"
        :disabled="sending || !connectionState.connected"
        :placeholder="connectionState.connected ? '메시지를 입력하세요...' : '연결을 기다리는 중...'"
    />

    <!-- 채팅방 메뉴 -->
    <ChatRoomMenu
        v-model:show="showRoomMenu"
        @show-participants="showParticipants"
        @search-messages="searchMessages"
        @toggle-notification="toggleNotification"
        @toggle-device-info="toggleDeviceInfo"
        @reconnect="reconnectWebSocket"
        @leave-room="leaveRoom"
    />
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, nextTick, watch} from 'vue'
import {AlertCircle} from 'lucide-vue-next'
import ChatHeader from '@/components/chat/detail/ChatHeader.vue'
import MessagesArea from '@/components/chat/detail/MessagesArea.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import ChatRoomMenu from '@/components/chat/detail/ChatRoomMenu.vue'
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
    if (!token) return 1

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

    // WebSocket 연결
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

    // 채팅방 구독
    console.log('📡 채팅방 구독 시작:', props.roomId)
    try {
      await webSocketService.subscribeToChatRoom(props.roomId, handleNewMessage)
      console.log('✅ 채팅방 구독 완료:', props.roomId)
    } catch (error) {
      console.error('❌ 채팅방 구독 오류:', error)
      throw new Error('채팅방 구독에 실패했습니다')
    }

    // 채팅방 입장
    try {
      await chatApi.joinRoom(props.roomId)
    } catch (error) {
      console.warn('⚠️ 채팅방 입장 API 실패 (계속 진행):', error)
    }

    // 데이터 로딩
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
            }
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
            }
          }
        })
      ])

      // 데이터 설정
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
      messages.value = messagesList.reverse()

      // 페이징 정보 설정
      hasMoreMessages.value = !messagesPage.last
      currentPage.value = messagesPage.number || 0

      console.log('✅ 채팅방 초기화 완료')

      // 스크롤을 맨 아래로
      await nextTick()
      messagesContainer.value?.scrollToBottom()

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
    messagesContainer.value?.scrollToBottom()

    // WebSocket 전송
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
      if (messagesContainer.value?.isAtBottom()) {
        messagesContainer.value?.scrollToBottom()
      }
    })

    emit('new-message', message)
  }
}

// 스크롤 처리
const handleScroll = () => {
  if (messagesContainer.value?.isAtTop() && hasMoreMessages.value && !loadingMore.value) {
    loadMoreMessages()
  }
}

// 이전 메시지 더 로드
const loadMoreMessages = async () => {
  if (!hasMoreMessages.value || loadingMore.value) return

  const nextPage = currentPage.value + 1
  await fetchMessages(nextPage, true)
}

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
      const previousScrollHeight = messagesContainer.value?.getScrollHeight() || 0
      messages.value = [...newMessages, ...messages.value]

      await nextTick()
      messagesContainer.value?.restoreScrollPosition(previousScrollHeight)
    } else {
      messages.value = newMessages
      await nextTick()
      messagesContainer.value?.scrollToBottom()
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

// 타이핑 처리
const handleTypingStart = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  typingTimer.value = setTimeout(() => {
    handleTypingStop()
  }, 3000)
}

const handleTypingStop = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
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

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .chat-detail-container {
    background: #1f2937;
    color: #f9fafb;
  }

  .connection-error {
    background: #7f1d1d;
    border-color: #b91c1c;
    color: #fca5a5;
  }
}
</style>