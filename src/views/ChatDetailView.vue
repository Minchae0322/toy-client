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
          <span v-if="connectionState.connected.value" class="connection-status connected">
            📶 연결됨
          </span>
          <span v-else-if="connectionState.connecting.value" class="connection-status connecting">
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
    <div v-if="connectionState.connectionState.status === 'error'" class="connection-error">
      <AlertCircle :size="16" />
      <span>연결 오류: {{ connectionState.connectionState.error }}</span>
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
        :disabled="sending || !connectionState.connected.value"
        :placeholder="connectionState.connected.value ? '메시지를 입력하세요...' : '연결을 기다리는 중...'"
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
import {chatApi} from '@/services/chatApi.js'
import {websocketService} from '@/services/websocketService.js'

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
const connectionState = computed(() => websocketService.getConnectionState())
const deviceInfo = computed(() => websocketService.getDeviceInfo())

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
    if (!websocketService.isConnected()) {
      console.log('🔌 WebSocket 연결 시도...')
      try {
        await websocketService.connect()
        console.log('✅ WebSocket 연결 완료')
      } catch (error) {
        console.error('❌ WebSocket 연결 실패:', error)
        throw new Error('실시간 연결에 실패했습니다')
      }
    }

    // 2. WebSocket 핸들러 설정
    console.log('🎯 WebSocket 핸들러 설정...')
    setupWebSocketHandlers()

    // 3. 채팅방 구독
    console.log('📡 채팅방 구독 시작:', props.roomId)
    try {
      await websocketService.subscribeToRoom(props.roomId, {
        onSubscribed: () => {
          console.log('✅ 채팅방 구독 완료:', props.roomId)
        },
        onError: (error) => {
          console.error('❌ 채팅방 구독 실패:', error)
          throw error
        }
      })
    } catch (error) {
      console.error('❌ 채팅방 구독 오류:', error)
      throw new Error('채팅방 구독에 실패했습니다')
    }

    // 4. 채팅방 입장 API 호출 (선택사항)
    try {
      await chatApi.joinRoom(props.roomId)
    } catch (error) {
      console.warn('⚠️ 채팅방 입장 API 실패 (계속 진행):', error)
      // 입장 API 실패해도 계속 진행
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

      // 6. 데이터 설정 (백엔드 응답 구조에 맞춤)
      // ChatRoomResponse.Detail 구조
      roomInfo.value = {
        title: roomDataResponse.data.title,
        participantCount: roomDataResponse.data.participantCount || 0,
        roomId: roomDataResponse.data.roomId,
        description: roomDataResponse.data.description,
        roomType: roomDataResponse.data.roomType,
        status: roomDataResponse.data.status
      }

      // Spring Data Page<ChatDetail> 구조
      const messagesPage = messagesResponse.data
      const messagesList = messagesPage.content || []

      // 메시지 목록 설정 (최신순으로 정렬된 것을 시간순으로 뒤집기)
      messages.value = messagesList.reverse() // 오래된 메시지부터 표시

      // 페이징 정보 설정 (Spring Data Page 구조)
      hasMoreMessages.value = !messagesPage.last
      currentPage.value = messagesPage.number || 0

      console.log('✅ 채팅방 초기화 완료')
      console.log('- 채팅방 정보:', roomInfo.value)
      console.log('- 메시지 수:', messages.value.length)
      console.log('- 더 불러올 메시지:', hasMoreMessages.value)
      console.log('- 현재 페이지:', currentPage.value)

      // 7. 스크롤을 맨 아래로 이동
      await nextTick()
      scrollToBottom()

    } catch (error) {
      console.error('❌ 데이터 로딩 실패:', error)
      throw error
    }

  } catch (error) {
    console.error('❌ 채팅방 초기화 실패:', error)

    // 사용자에게 친화적인 오류 메시지 표시
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

// 메시지 목록 조회 (커서 페이징 지원)
const fetchMessages = async (page = 0, append = false) => {
  try {
    if (page === 0) loading.value = true
    else loadingMore.value = true

    // 커서 기반 페이징 지원
    const params = {
      page,
      size: pageSize,
      sort: 'createdAt,desc'
    }

    // 이전 메시지를 불러올 때는 마지막 메시지 ID 사용 (커서 페이징)
    if (append && messages.value.length > 0) {
      params.lastMessageId = messages.value[0].messageId
    }

    const response = await chatApi.getMessages(props.roomId, params)
    const messagesPage = response.data
    const newMessages = messagesPage.content.reverse()

    if (append) {
      // 스크롤 위치 보존을 위한 높이 저장
      const previousScrollHeight = messagesContainer.value?.scrollHeight || 0

      // 이전 메시지를 앞에 추가
      messages.value = [...newMessages, ...messages.value]

      // 스크롤 위치 복원
      await nextTick()
      if (messagesContainer.value) {
        const newScrollHeight = messagesContainer.value.scrollHeight
        messagesContainer.value.scrollTop = newScrollHeight - previousScrollHeight
      }
    } else {
      // 새로운 메시지로 교체
      await nextTick()
      scrollToBottom()
      return newMessages
    }

    // 더 불러올 메시지가 있는지 확인 (Spring Data Page 구조)
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
  if (!connectionState.value.connected.value) {
    alert('연결이 끊어진 상태입니다. 잠시 후 다시 시도해주세요.')
    return
  }

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

    // WebSocket을 통한 메시지 전송 (즉시 전송)
    await websocketService.sendMessage('/app/chat/send', {
      roomId: props.roomId,
      content: messageData.content,
      type: messageData.type || 'TEXT',
      metadata: messageData.metadata
    })

    // REST API 호출 (영속성 보장)
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

// WebSocket 메시지 처리 함수들
const setupWebSocketHandlers = () => {
  console.log('🎯 WebSocket 핸들러 설정 시작')

  // 기존 핸들러 제거 (중복 방지)
  websocketService.offMessage('chat-message', handleNewMessage)
  websocketService.offMessage('system-notification', handleSystemMessage)
  websocketService.offMessage('presence-update', handleUserStatus)
  websocketService.offMessage('typing-status', handleTypingStatusUpdate)

  // 새 핸들러 등록
  websocketService.onMessage('chat-message', handleNewMessage)
  websocketService.onMessage('system-notification', handleSystemMessage)
  websocketService.onMessage('presence-update', handleUserStatus)
  websocketService.onMessage('typing-status', handleTypingStatusUpdate)

  console.log('✅ WebSocket 핸들러 설정 완료')
}

// 새 메시지 처리
const handleNewMessage = (message) => {
  console.log('📨 새 채팅 메시지 수신:', message)
  console.log('- 현재 채팅방:', props.roomId)
  console.log('- 메시지 채팅방:', message.roomId)
  console.log('- 발신자:', message.senderId)
  console.log('- 현재 사용자:', currentUserId.value)

  // 자신이 보낸 메시지가 아니고, 현재 채팅방의 메시지인 경우만 처리
  if (message.senderId !== currentUserId.value && message.roomId === props.roomId) {
    // 이미 있는 메시지인지 확인 (중복 방지)
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
      // 스크롤이 맨 아래에 있었다면 자동 스크롤
      if (isAtBottom()) {
        scrollToBottom()
      }
    })

    emit('new-message', message)
  } else {
    console.log('⚠️ 메시지 무시 (자신의 메시지이거나 다른 채팅방)')
  }
}

// 시스템 메시지 처리
const handleSystemMessage = (message) => {
  if (message.roomId === props.roomId) {
    messages.value.push({
      ...message,
      messageId: `system-${Date.now()}`,
      isSystem: true,
      type: 'SYSTEM'
    })

    nextTick(() => {
      if (isAtBottom()) {
        scrollToBottom()
      }
    })
  }
}

// 사용자 상태 처리
const handleUserStatus = (presence) => {
  if (presence.roomId === props.roomId) {
    onlineUsers.value = presence.onlineUsers || []
  }
}

// 타이핑 상태 업데이트 처리
const handleTypingStatusUpdate = (data) => {
  if (data.roomId === props.roomId) {
    // 자신을 제외한 타이핑 사용자들만 표시
    typingUsers.value = data.typingUsers.filter(user => user.userId !== currentUserId.value)
  }
}

// 타이핑 시작
const handleTypingStart = () => {
  websocketService.sendTypingStatus(props.roomId, true)

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
  websocketService.sendTypingStatus(props.roomId, false)

  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
}

// 스크롤 처리
const handleScroll = () => {
  if (!messagesContainer.value) return

  const {scrollTop} = messagesContainer.value

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

  const {scrollTop, scrollHeight, clientHeight} = messagesContainer.value
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

// 시간 표시 여부 결정
const shouldShowTime = (message) => {
  const messageIndex = messages.value.findIndex(m => m.messageId === message.messageId)
  if (messageIndex === messages.value.length - 1) return true // 마지막 메시지는 항상 표시

  const nextMessage = messages.value[messageIndex + 1]
  if (!nextMessage) return true

  // 다음 메시지와 시간 차이가 5분 이상이면 표시
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
  // 실패한 메시지 재전송 로직
}

const deleteMessage = (messageId) => {
  console.log('메시지 삭제:', messageId)
  // 메시지 삭제 로직
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
    // WebSocket 재연결
    if (!websocketService.isConnected()) {
      await websocketService.reconnect()
    }

    // 채팅방 재구독
    await websocketService.subscribeToRoom(props.roomId, {
      onSubscribed: () => {
        console.log('✅ 채팅방 재구독 완료:', props.roomId)
      },
      onError: (error) => {
        console.error('❌ 채팅방 재구독 실패:', error)
        throw error
      }
    })
  } catch (error) {
    console.error('재연결 실패:', error)
    alert('연결 재시도에 실패했습니다.')
  }
}

const leaveRoom = async () => {
  if (confirm('정말 채팅방을 나가시겠습니까?')) {
    // 채팅방 구독 해제
    websocketService.unsubscribeFromRoom(props.roomId)
    console.log('🔴 채팅방 구독 해제:', props.roomId)

    // 채팅방 나가기 API 호출
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
  // 사용자 ID 설정
  currentUserId.value = getCurrentUserId()
  console.log('👤 현재 사용자 ID:', currentUserId.value)

  // 채팅방 초기화
  await initializeChatRoom()
})

onUnmounted(() => {
  console.log('🔌 채팅방 컴포넌트 해제')

  // 타이핑 중지
  if (typingTimer.value) {
    handleTypingStop()
  }

  // 채팅방 구독 해제
  websocketService.unsubscribeFromRoom(props.roomId)
  console.log('🔴 채팅방 구독 해제:', props.roomId)

  // 메시지 핸들러 정리
  websocketService.offMessage('chat-message', handleNewMessage)
  websocketService.offMessage('system-notification', handleSystemMessage)
  websocketService.offMessage('presence-update', handleUserStatus)
  websocketService.offMessage('typing-status', handleTypingStatusUpdate)
})

// roomId 변경 감지
watch(() => props.roomId, async (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    console.log('🔄 채팅방 변경:', oldRoomId, '=>', newRoomId)

    // 타이핑 중지
    if (typingTimer.value) {
      handleTypingStop()
    }

    // 이전 채팅방 구독 해제
    if (oldRoomId) {
      websocketService.unsubscribeFromRoom(oldRoomId)
      console.log('🔴 이전 채팅방 구독 해제:', oldRoomId)
    }

    // 상태 초기화
    messages.value = []
    onlineUsers.value = []
    typingUsers.value = []
    currentPage.value = 0
    hasMoreMessages.value = true

    // 새 채팅방 초기화
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

.typing-animation span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-animation span:nth-child(2) {
  animation-delay: -0.16s;
}

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
}
</style>