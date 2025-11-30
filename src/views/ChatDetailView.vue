<template>
  <div class="chat-detail-container">
    <!-- 상품 정보 카드 (상품에서 온 경우만 표시) -->
    <ProductInfoCard
        v-if="productInfo.from === 'product' && productInfo.id"
        :product="productInfo"
        @view-product="viewProduct"
    />

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

    <!-- 로딩 상태 -->
    <div v-if="loading && messages.length === 0" class="loading-container">
      <div class="spinner"></div>
      <p>메시지를 불러오는 중...</p>
    </div>

    <!-- 메시지 영역 -->
    <MessagesArea
        v-else
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
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'
import ChatHeader from '@/components/chat/detail/ChatHeader.vue'
import MessagesArea from '@/components/chat/detail/MessagesArea.vue'
import MessageInput from '@/components/chat/detail/MessageInput.vue'
import ChatRoomMenu from '@/components/chat/detail/ChatRoomMenu.vue'
import ProductInfoCard from '@/components/chat/detail/ProductInfoCard.vue'
import { webSocketService } from '@/services/webSocketService.js'
import { chatService } from '@/services/ChatService.js'

const props = defineProps(['roomId', 'initialRoomId'])
const emit = defineEmits(['back-to-list', 'new-message'])

// 라우터 관련
const route = useRoute()
const router = useRouter()

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
const hasMoreMessages = ref(true)
const pageSize = 20

// 상품 정보 (쿼리에서 추출)
const productInfo = computed(() => ({
  from: route.query.from || '',
  id: route.query.productId || '',
  name: route.query.productName || '',
  sellerId: route.query.sellerId || '',
  sellerName: route.query.sellerName || '',
  price: Number(route.query.productPrice) || 0,
  image: route.query.productImage || '',
  status: route.query.productStatus || ''
}))

// 실제 roomId 계산 (props 또는 route에서)
const actualRoomId = computed(() => {
  return props.roomId || props.initialRoomId || route.params.roomId
})

// 현재 사용자 ID 가져오기
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return 1

    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub || payload.id || payload.user_id || 1
  } catch (error) {
    console.warn('사용자 ID 추출 실패, 기본값 사용:', error)
    return 1
  }
}

// ✅ 메시지 변환 함수 (chatService 메서드 사용)
const transformMessage = (msg) => {
  return chatService.transformMessageResponse(msg)
}

// 메시지 조회 함수 (HTTP API - 기존 메시지 로딩용)
const fetchMessages = async (lastMessageId = null, append = false) => {
  try {
    if (!append) loading.value = true
    else loadingMore.value = true

    // 백엔드 API 스펙에 맞는 파라미터 구성
    const cursorPageRequest = {
      size: pageSize,
      lastMessageId: lastMessageId
    }

    console.log('📨 기존 메시지 HTTP 조회 요청:', {
      roomId: actualRoomId.value,
      params: cursorPageRequest
    })

    // 백엔드 채팅 메시지 조회 API 호출 (HTTP)
    const response = await chatService.getChatMessages(actualRoomId.value, cursorPageRequest)

    console.log('📨 기존 메시지 HTTP 조회 응답:', response)

    // API 응답 구조에 맞게 데이터 추출
    const messagesList = response.data || []

    // ✅ 메시지 데이터 변환 (chatService 메서드 사용)
    const transformedMessages = messagesList.map(msg => transformMessage(msg))

    if (append) {
      // 이전 메시지 추가 (역순으로 받아서 앞에 추가)
      const previousScrollHeight = messagesContainer.value?.getScrollHeight() || 0
      messages.value = [...transformedMessages.reverse(), ...messages.value]

      await nextTick()
      messagesContainer.value?.restoreScrollPosition(previousScrollHeight)
    } else {
      // 초기 로드 (최신 메시지부터 표시)
      messages.value = transformedMessages.reverse()
      await nextTick()
      messagesContainer.value?.scrollToBottom()
    }

    // 더 가져올 메시지가 있는지 판단
    hasMoreMessages.value = messagesList.length === pageSize

  } catch (error) {
    console.error('❌ 기존 메시지 조회 실패:', error)

    // 404 에러인 경우 (채팅방이 존재하지 않거나 메시지가 없음)
    if (error.status === 404) {
      messages.value = []
      hasMoreMessages.value = false
      return
    }

    // 에러 상황에서 빈 메시지 표시하지 않고 재시도 옵션 제공
    if (!append) {
      // 샘플 데이터로 폴백 (개발 편의)
      console.warn('⚠️ 메시지 조회 실패, 빈 목록으로 시작')
      messages.value = []
      hasMoreMessages.value = false
    }
  } finally {
    if (append) loadingMore.value = false
    else loading.value = false
  }
}

// 🔥 채팅방 초기화 (WebSocket 우선순위 적용)
const initializeChatRoom = async () => {
  try {
    loading.value = true
    console.log('🎯 채팅방 초기화 시작:', actualRoomId.value)

    if (!actualRoomId.value) {
      throw new Error('채팅방 ID가 없습니다.')
    }

    // 🔥 WebSocket 연결을 최우선으로 처리
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

        // WebSocket 연결 실패해도 채팅방 상세는 유지 (HTTP로 메시지 조회 가능)
        console.warn('⚠️ WebSocket 연결 실패했지만 채팅방 계속 진행')
      }
    } else {
      connectionState.value.connected = true
      connectionState.value.status = 'connected'
    }

    // 🔥 WebSocket이 연결된 경우에만 채팅방 구독
    if (webSocketService.isConnected()) {
      console.log('📨 채팅방 구독 시작:', actualRoomId.value)
      try {
        await webSocketService.subscribeToChatRoom(actualRoomId.value, handleNewMessage)
        console.log('✅ 채팅방 구독 완료:', actualRoomId.value)
      } catch (error) {
        console.error('❌ 채팅방 구독 오류:', error)
      }
    }

    // 채팅방 정보 조회 (HTTP API)
    try {
      const roomResponse = await chatService.getChatRoomDetail(actualRoomId.value)
      const roomData = roomResponse.data

      roomInfo.value = {
        title: roomData.title || (productInfo.value.name
            ? `${productInfo.value.name} 관련 채팅`
            : `채팅방 ${actualRoomId.value}`),
        participantCount: roomData.participantCount || 2,
        roomId: actualRoomId.value,
        roomType: roomData.roomType || 'NORMAL',
        status: roomData.status || 'ACTIVE'
      }
    } catch (error) {
      console.warn('⚠️ 채팅방 정보 조회 실패, 기본 정보 사용:', error)
      roomInfo.value = {
        title: productInfo.value.name
            ? `${productInfo.value.name} 관련 채팅`
            : `채팅방 ${actualRoomId.value}`,
        participantCount: 2,
        roomId: actualRoomId.value,
        roomType: 'NORMAL',
        status: 'ACTIVE'
      }
    }

    // 🔥 메시지 로딩 (HTTP API 사용)
    await fetchMessages(null, false)

    console.log('✅ 채팅방 초기화 완료, 메시지 수:', messages.value.length)

  } catch (error) {
    console.error('❌ 채팅방 초기화 실패:', error)

    let errorMessage = '채팅방 접속에 실패했습니다.'
    if (error.message.includes('네트워크') || error.message.includes('Network')) {
      errorMessage = '네트워크 연결을 확인해주세요.'
    } else if (error.message.includes('권한') || error.message.includes('Unauthorized')) {
      errorMessage = '채팅방 접근 권한이 없습니다.'
    } else if (error.message.includes('찾을 수 없')) {
      errorMessage = '존재하지 않는 채팅방입니다.'
    }

    alert(errorMessage)
    emit('back-to-list')
  } finally {
    loading.value = false
  }
}

// 🔥 메시지 전송 (WebSocket 전용)
const sendMessage = async (messageData) => {
  if (!messageData.content?.trim() && !messageData.file) return

  let tempMessage = null

  try {
    sending.value = true

    // 임시 메시지 생성 (UI에 즉시 표시용)
    tempMessage = {
      messageId: `temp-${Date.now()}`,
      roomId: actualRoomId.value,
      senderId: currentUserId.value,
      senderName: '나',
      content: messageData.content,
      type: messageData.type || 'TEXT',
      createdAt: new Date().toISOString(),
      status: 'SENDING',
      replyToMessageId: messageData.replyToMessageId || null,
      replyToContent: messageData.replyToContent || null,
      replyToSender: messageData.replyToSender || null
    }

    // UI에 임시 메시지 추가
    messages.value.push(tempMessage)
    await nextTick()
    messagesContainer.value?.scrollToBottom()

    console.log('📤 WebSocket으로 메시지 전송:', messageData)

    // 🔥 WebSocket으로만 전송
    if (webSocketService.isConnected()) {
      await webSocketService.sendMessage(actualRoomId.value, messageData)

      // 전송 성공 시 임시 메시지 상태 업데이트
      const tempIndex = messages.value.findIndex(m => m.messageId === tempMessage.messageId)
      if (tempIndex !== -1) {
        messages.value[tempIndex].status = 'SENT'
      }

      console.log('✅ WebSocket 메시지 전송 완료')
    } else {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

    emit('new-message', tempMessage)

  } catch (error) {
    console.error('❌ WebSocket 메시지 전송 실패:', error)

    // 전송 실패 시 임시 메시지 상태 업데이트
    if (tempMessage) {
      const tempIndex = messages.value.findIndex(m => m.messageId === tempMessage.messageId)
      if (tempIndex !== -1) {
        messages.value[tempIndex].status = 'FAILED'
      }
    }

    alert('메시지 전송에 실패했습니다.')
  } finally {
    sending.value = false
  }
}

// 🔥 새 메시지 처리 (WebSocket으로 수신)
const handleNewMessage = (message) => {
  console.log('📨 WebSocket에서 새 채팅 메시지 수신:', message)

  // 자신이 보낸 메시지는 이미 임시 메시지로 표시되어 있음
  if (message.senderId === currentUserId.value) {
    console.log('📨 자신이 보낸 메시지는 무시')
    return
  }

  // 다른 사람이 보낸 메시지만 추가
  if (message.roomId === actualRoomId.value) {
    const existingMessage = messages.value.find(m =>
        m.messageId === message.messageId ||
        (m.content === message.content && m.senderId === message.senderId &&
            Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000)
    )

    if (existingMessage) {
      console.log('📨 중복 메시지 무시:', message.messageId)
      return
    }

    console.log('📨 새 메시지 추가:', message)
    // ✅ chatService 메서드 사용
    const transformedMessage = transformMessage(message)
    messages.value.push(transformedMessage)

    nextTick(() => {
      if (messagesContainer.value?.isAtBottom()) {
        messagesContainer.value?.scrollToBottom()
      }
    })

    emit('new-message', transformedMessage)
  }
}

// 스크롤 처리
const handleScroll = () => {
  if (messagesContainer.value?.isAtTop() && hasMoreMessages.value && !loadingMore.value) {
    loadMoreMessages()
  }
}

// 이전 메시지 더 로드 (HTTP API)
const loadMoreMessages = async () => {
  if (!hasMoreMessages.value || loadingMore.value) return

  const lastMessageId = messages.value.length > 0 ? messages.value[0].messageId : null
  await fetchMessages(lastMessageId, true)
}

// 🔥 타이핑 처리 (WebSocket)
const handleTypingStart = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  if (webSocketService.isConnected()) {
    webSocketService.sendTypingStatus(actualRoomId.value, true)
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

  if (webSocketService.isConnected()) {
    webSocketService.sendTypingStatus(actualRoomId.value, false)
  }
}

// 메시지 액션 처리
const handleMessageClick = (message) => {
  console.log('메시지 클릭:', message)
}

const retryMessage = async (messageId) => {
  console.log('메시지 재전송:', messageId)

  const failedMessage = messages.value.find(m => m.messageId === messageId)
  if (failedMessage && failedMessage.status === 'FAILED') {
    const messageData = {
      content: failedMessage.content,
      type: failedMessage.type
    }

    // 실패한 메시지 제거
    const index = messages.value.findIndex(m => m.messageId === messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }

    await sendMessage(messageData)
  }
}

const deleteMessage = (messageId) => {
  console.log('메시지 삭제:', messageId)
  const index = messages.value.findIndex(m => m.messageId === messageId)
  if (index !== -1) {
    messages.value.splice(index, 1)
  }
}

// 상품 보기 기능
const viewProduct = () => {
  if (productInfo.value.id) {
    router.push(`/one-mouth/${productInfo.value.id}`)
  }
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

// 🔥 WebSocket 재연결
const reconnectWebSocket = async () => {
  showRoomMenu.value = false
  try {
    connectionState.value.connecting = true
    connectionState.value.status = 'connecting'

    if (!webSocketService.isConnected()) {
      await webSocketService.connect()
    }

    await webSocketService.subscribeToChatRoom(actualRoomId.value, handleNewMessage)

    connectionState.value.connected = true
    connectionState.value.connecting = false
    connectionState.value.status = 'connected'
    connectionState.value.error = null

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
    if (webSocketService.isConnected()) {
      webSocketService.unsubscribeFromChatRoom(actualRoomId.value)
    }

    try {
      await chatService.leaveChatRoom(actualRoomId.value)
    } catch (error) {
      console.warn('채팅방 나가기 API 실패:', error)
    }

    emit('back-to-list')
  }
  showRoomMenu.value = false
}

// 🔥 연결 상태 체크 메서드
const checkConnectionStatus = () => {
  const wsConnected = webSocketService.isConnected()

  connectionState.value = {
    connected: wsConnected,
    connecting: false,
    status: wsConnected ? 'connected' : 'disconnected',
    error: wsConnected ? null : 'WebSocket 연결이 끊어졌습니다'
  }

  return wsConnected
}

// 🔥 주기적 연결 상태 체크
let connectionCheckInterval = null

// 라이프사이클
onMounted(async () => {
  currentUserId.value = getCurrentUserId()
  console.log('👤 현재 사용자 ID:', currentUserId.value)
  console.log('📦 상품 정보:', productInfo.value)

  // 디바이스 정보 업데이트
  if (webSocketService.getDeviceInfo) {
    deviceInfo.value = webSocketService.getDeviceInfo()
  }

  await initializeChatRoom()

  // 연결 상태 주기적 체크
  connectionCheckInterval = setInterval(() => {
    checkConnectionStatus()
  }, 5000)
})

onUnmounted(() => {
  console.log('🧹 [ChatDetailView] 컴포넌트 해제 시작')

  // 타이핑 타이머 정리
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }

  // 연결 체크 인터벌 정리
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval)
    connectionCheckInterval = null
  }

  // WebSocket 구독 해제
  if (actualRoomId.value && webSocketService.unsubscribeFromChatRoom) {
    webSocketService.unsubscribeFromChatRoom(actualRoomId.value)
  }

  console.log('✅ [ChatDetailView] 컴포넌트 정리 완료')
})

// roomId 변경 감지
watch(actualRoomId, async (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    console.log('🔄 채팅방 변경:', oldRoomId, '=>', newRoomId)

    if (typingTimer.value) {
      handleTypingStop()
    }

    if (oldRoomId && webSocketService.isConnected()) {
      webSocketService.unsubscribeFromChatRoom(oldRoomId)
    }

    messages.value = []
    onlineUsers.value = []
    typingUsers.value = []
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

.retry-btn:hover {
  background: #b91c1c;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

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

  .loading-container {
    color: #9ca3af;
  }

  .spinner {
    border-color: #374151;
    border-top-color: #60a5fa;
  }
}
</style>