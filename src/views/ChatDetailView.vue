<template>
  <div class="chat-detail-container">
    <!-- 헤더 -->
    <header class="detail-header">
      <button @click="goBack" class="back-btn">
        <ChevronLeft :size="24" />
      </button>

      <div class="header-info">
        <div class="header-avatar">
          <img
              v-if="roomInfo.profileImage"
              :src="roomInfo.profileImage"
              :alt="roomInfo.title"
          />
          <div v-else class="avatar-placeholder">
            <User :size="20" />
          </div>
          <span v-if="roomInfo.isOnline" class="online-dot"></span>
        </div>
        <div class="header-text">
          <h2 class="header-title">{{ roomInfo.title || '채팅' }}</h2>
          <span class="header-status">
            {{ connectionState.connected ? (roomInfo.isOnline ? '온라인' : '오프라인') : '연결 중...' }}
          </span>
        </div>
      </div>

      <div class="header-actions">
        <button @click="showRoomMenu = true" class="icon-btn">
          <MoreVertical :size="20" />
        </button>
      </div>
    </header>

    <!-- 연결 오류 배너 -->
    <Transition name="slide">
      <div v-if="connectionState.status === 'error'" class="connection-error">
        <AlertCircle :size="16" />
        <span>연결이 끊어졌습니다</span>
        <button @click="reconnectWebSocket" class="retry-link">재연결</button>
      </div>
    </Transition>

    <!-- 피드 프리뷰 -->
    <div v-if="feedInfo.id" class="feed-preview" @click="goToFeed">
      <img :src="feedInfo.thumbnail" :alt="feedInfo.title" class="feed-thumb" />
      <div class="feed-info">
        <p class="feed-title">{{ feedInfo.title }}</p>
        <p class="feed-price">{{ formatPrice(feedInfo.price) }}원</p>
      </div>
      <ChevronRight :size="20" class="feed-arrow" />
    </div>

    <!-- 메시지 영역 -->
    <div class="messages-area" ref="messagesArea" @scroll="handleScroll">
      <div v-if="loadingMore" class="loading-more">
        <div class="spinner-small"></div>
      </div>

      <div v-if="loading && messages.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>메시지를 불러오는 중...</p>
      </div>

      <template v-else>
        <div v-if="messages.length === 0" class="empty-messages">
          <div class="empty-icon-wrapper">
            <MessageCircle :size="28" />
          </div>
          <p>아직 메시지가 없습니다</p>
          <span>첫 메시지를 보내보세요!</span>
        </div>

        <TransitionGroup v-else name="message" tag="div" class="messages-list">
          <div
              v-for="(message, index) in messages"
              :key="message.messageId"
              class="message-wrapper"
          >
            <div v-if="shouldShowDate(message, index)" class="date-divider">
              <span>{{ formatDate(message.createdAt) }}</span>
            </div>

            <div class="message-row" :class="{ mine: message.senderId === currentUserId }">
              <template v-if="message.senderId !== currentUserId && shouldShowAvatar(message, index)">
                <img
                    v-if="message.senderProfileImage"
                    :src="message.senderProfileImage"
                    class="message-avatar"
                />
                <div v-else class="message-avatar avatar-placeholder-small">
                  <User :size="14" />
                </div>
              </template>
              <div v-else-if="message.senderId !== currentUserId" class="avatar-spacer"></div>

              <div class="message-content">
                <span v-if="message.senderId !== currentUserId && shouldShowSender(message, index)" class="sender-name">
                  {{ message.senderName }}
                </span>

                <!-- 답장 프리뷰 -->
                <div v-if="message.replyToContent" class="reply-bubble">
                  <span class="reply-sender">{{ message.replyToSender }}</span>
                  <span class="reply-text">{{ message.replyToContent }}</span>
                </div>

                <div
                    class="message-bubble"
                    :class="{ mine: message.senderId === currentUserId, failed: message.status === 'FAILED' }"
                    @contextmenu.prevent="openMessageMenu(message)"
                >
                  <!-- 이미지 -->
                  <img v-if="message.type === 'IMAGE'" :src="message.fileUrl" class="message-image" />
                  <!-- 파일 -->
                  <div v-else-if="message.type === 'FILE'" class="file-bubble">
                    <Paperclip :size="16" />
                    <span class="file-name">{{ message.fileName }}</span>
                  </div>
                  <!-- 텍스트 -->
                  <p v-else>{{ message.content }}</p>
                </div>

                <div class="message-meta" :class="{ mine: message.senderId === currentUserId }">
                  <span v-if="message.status === 'SENDING'" class="status sending">전송 중...</span>
                  <span v-else-if="message.status === 'FAILED'" class="status failed" @click="retryMessage(message)">재전송</span>
                  <span v-else class="time">{{ formatTime(message.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </template>

      <div v-if="typingUsers.length > 0" class="typing-indicator">
        <div class="typing-dots"><span></span><span></span><span></span></div>
        <span>{{ typingUsers[0]?.userName }}님이 입력 중...</span>
      </div>
    </div>

    <!-- 답장 프리뷰 -->
    <div v-if="replyTo" class="reply-preview">
      <div class="reply-info">
        <span class="reply-label">{{ replyTo.senderName }}님에게 답장</span>
        <span class="reply-content">{{ replyTo.content }}</span>
      </div>
      <button @click="replyTo = null" class="reply-close">
        <X :size="18" />
      </button>
    </div>

    <!-- 메시지 입력 -->
    <div class="input-area">
      <button @click="openFilePicker" class="attach-btn">
        <Plus :size="22" />
      </button>

      <div class="input-box" :class="{ focused: inputFocused }">
        <input
            ref="messageInput"
            v-model="newMessage"
            type="text"
            placeholder="메시지를 입력하세요..."
            :disabled="!connectionState.connected"
            @keypress.enter="sendMessage"
            @input="handleTyping"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
        />
      </div>

      <button class="send-btn" :disabled="!canSend" @click="sendMessage">
        <Send :size="20" />
      </button>
    </div>

    <!-- 파일 입력 -->
    <input ref="fileInput" type="file" style="display:none" @change="handleFileSelect" accept="image/*,application/pdf,.doc,.docx" multiple />

    <!-- 채팅방 메뉴 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showRoomMenu" class="menu-overlay" @click="showRoomMenu = false">
          <Transition name="slide-up">
            <div v-if="showRoomMenu" class="menu-modal" @click.stop>
              <div class="menu-header">
                <h3>채팅 설정</h3>
                <button @click="showRoomMenu = false" class="menu-close"><X :size="20" /></button>
              </div>
              <div class="menu-body">
                <button class="menu-item" @click="handleMenuAction('participants')">
                  <Users :size="20" /><span>참여자 보기</span><ChevronRight :size="18" class="menu-arrow" />
                </button>
                <button class="menu-item" @click="handleMenuAction('search')">
                  <Search :size="20" /><span>메시지 검색</span><ChevronRight :size="18" class="menu-arrow" />
                </button>
                <button class="menu-item" @click="handleMenuAction('notification')">
                  <Bell :size="20" /><span>알림 설정</span><ChevronRight :size="18" class="menu-arrow" />
                </button>
                <button class="menu-item" @click="reconnectWebSocket">
                  <RefreshCw :size="20" /><span>연결 새로고침</span><ChevronRight :size="18" class="menu-arrow" />
                </button>
              </div>
              <div class="menu-footer">
                <button class="menu-item danger" @click="handleMenuAction('leave')">
                  <LogOut :size="20" /><span>채팅방 나가기</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 메시지 컨텍스트 메뉴 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="messageMenu.show" class="context-overlay" @click="messageMenu.show = false">
          <div class="context-menu" :style="{ top: messageMenu.y + 'px', left: messageMenu.x + 'px' }" @click.stop>
            <button @click="setReply(messageMenu.message)">답장</button>
            <button @click="copyMessage(messageMenu.message)">복사</button>
            <button v-if="messageMenu.message?.senderId === currentUserId" @click="deleteMessage(messageMenu.message)" class="danger">삭제</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeft, ChevronRight, MoreVertical, AlertCircle, MessageCircle,
  Plus, Send, Users, Search, Bell, LogOut, X, RefreshCw, User, Paperclip
} from 'lucide-vue-next'
import { chatService } from '@/services/ChatService.js'
import { webSocketService } from '@/services/webSocketService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  roomId: { type: [String, Number], default: null }
})

const emit = defineEmits(['back-to-list', 'new-message'])

const route = useRoute()
const router = useRouter()
const { open } = useConfirmDialog()

// State
const loading = ref(true)
const loadingMore = ref(false)
const messages = ref([])
const newMessage = ref('')
const showRoomMenu = ref(false)
const currentUserId = ref(null)
const typingUsers = ref([])
const typingTimer = ref(null)
const inputFocused = ref(false)
const replyTo = ref(null)
const messageMenu = ref({ show: false, message: null, x: 0, y: 0 })

// Refs
const messagesArea = ref(null)
const messageInput = ref(null)
const fileInput = ref(null)

// Room info
const roomInfo = ref({ title: '', profileImage: '', isOnline: false, participantCount: 2 })

// Connection
const connectionState = ref({ connected: false, connecting: false, status: 'disconnected', error: null })

const actualRoomId = computed(() =>
    props.roomId || route.params.roomId || route.params.id
)

const feedInfo = computed(() => ({
  id: route.query.feedId || '',
  title: route.query.feedTitle || '',
  price: route.query.feedPrice || 0,
  thumbnail: route.query.feedThumbnail || ''
}))
const canSend = computed(() => newMessage.value.trim() && connectionState.value.connected)

const goBack = () => {
  emit('back-to-list')
  // router.back()은 브라우저 히스토리상 이전 페이지(메뉴 등)로 돌아갈 수 있어
  // 명시적으로 채팅방 목록 URL로 이동
  router.push({ name: 'Chat' })
}

const goToFeed = () => { if (feedInfo.value.id) router.push(`/feed/${feedInfo.value.id}`) }

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return 1
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub || 1
  } catch { return 1 }
}

const initializeChatRoom = async () => {
  const roomId = actualRoomId.value
  if (!roomId) {
    console.error('[ChatDetail] roomId가 없습니다')
    return
  }

  try {
    loading.value = true
    if (!webSocketService.isConnected()) await webSocketService.connect()
    connectionState.value = { connected: true, connecting: false, status: 'connected', error: null }
    await webSocketService.subscribeToChatRoom(roomId, handleNewMessage)

    try {
      const res = await chatService.getChatRoomDetail(roomId)
      if (res.data) {
        roomInfo.value = {
          title: res.data.title || res.data.participantName || '채팅',
          profileImage: res.data.participantProfileImage,
          isOnline: res.data.isOnline || false,
          participantCount: res.data.participantCount || 2
        }
      }
    } catch { roomInfo.value.title = '채팅' }

    await fetchMessages()
  } catch (error) {
    console.error('[ChatDetail] 채팅방 초기화 실패:', error)
    connectionState.value = { connected: false, connecting: false, status: 'error', error: error.message }
  } finally { loading.value = false }
}

const fetchMessages = async (lastMessageId = null) => {
  const roomId = actualRoomId.value
  if (!roomId) return

  try {
    if (lastMessageId) loadingMore.value = true
    const res = await chatService.getChatMessages(roomId, { size: 20, lastMessageId })
    const newMsgs = (res.data || []).map(m => chatService.transformMessageResponse(m))

    if (lastMessageId) {
      messages.value = [...newMsgs.reverse(), ...messages.value]
    } else {
      messages.value = newMsgs.reverse()
      await nextTick()
      scrollToBottom()
    }
  } catch (e) {
    console.error('[ChatDetail] 메시지 조회 실패:', e)
    if (!lastMessageId) messages.value = getSampleMessages()
  } finally { loadingMore.value = false }
}

const sendMessage = async () => {
  if (!canSend.value) return
  const content = newMessage.value.trim()
  newMessage.value = ''

  const tempMsg = {
    messageId: `temp-${Date.now()}`,
    senderId: currentUserId.value,
    senderName: '나',
    content,
    type: 'TEXT',
    createdAt: new Date().toISOString(),
    status: 'SENDING',
    replyToMessageId: replyTo.value?.messageId,
    replyToContent: replyTo.value?.content,
    replyToSender: replyTo.value?.senderName
  }

  messages.value.push(tempMsg)
  replyTo.value = null
  await nextTick()
  scrollToBottom()

  try {
    await webSocketService.sendMessage(actualRoomId.value, { content, type: 'TEXT', replyToMessageId: tempMsg.replyToMessageId })
    const idx = messages.value.findIndex(m => m.messageId === tempMsg.messageId)
    if (idx !== -1) messages.value[idx].status = 'SENT'
    emit('new-message', tempMsg)
  } catch {
    const idx = messages.value.findIndex(m => m.messageId === tempMsg.messageId)
    if (idx !== -1) messages.value[idx].status = 'FAILED'
  }
}

const handleNewMessage = (msg) => {
  if (msg.senderId === currentUserId.value) return
  if (messages.value.find(m => m.messageId === msg.messageId)) return
  messages.value.push(chatService.transformMessageResponse(msg))
  nextTick(() => { if (isAtBottom()) scrollToBottom() })
  emit('new-message', msg)
}

const retryMessage = async (msg) => {
  const idx = messages.value.findIndex(m => m.messageId === msg.messageId)
  if (idx !== -1) {
    messages.value.splice(idx, 1)
    newMessage.value = msg.content
    await sendMessage()
  }
}

const deleteMessage = (msg) => {
  const idx = messages.value.findIndex(m => m.messageId === msg.messageId)
  if (idx !== -1) messages.value.splice(idx, 1)
  messageMenu.value.show = false
}

const handleTyping = () => {
  if (typingTimer.value) clearTimeout(typingTimer.value)
  webSocketService.sendTypingStatus?.(actualRoomId.value, true)
  typingTimer.value = setTimeout(() => webSocketService.sendTypingStatus?.(actualRoomId.value, false), 3000)
}

const handleScroll = () => {
  if (messagesArea.value?.scrollTop === 0 && !loadingMore.value && messages.value.length > 0) {
    fetchMessages(messages.value[0]?.messageId)
  }
}

const scrollToBottom = () => { if (messagesArea.value) messagesArea.value.scrollTop = messagesArea.value.scrollHeight }
const isAtBottom = () => {
  if (!messagesArea.value) return true
  const { scrollTop, scrollHeight, clientHeight } = messagesArea.value
  return scrollTop + clientHeight >= scrollHeight - 50
}

const reconnectWebSocket = async () => {
  showRoomMenu.value = false
  connectionState.value.connecting = true
  try {
    await webSocketService.connect()
    await webSocketService.subscribeToChatRoom(actualRoomId.value, handleNewMessage)
    connectionState.value = { connected: true, connecting: false, status: 'connected', error: null }
  } catch (e) {
    connectionState.value = { connected: false, connecting: false, status: 'error', error: e.message }
  }
}

const handleMenuAction = async (action) => {
  showRoomMenu.value = false
  if (action === 'leave') {
    const confirmed = await open({ type: 'danger', title: '채팅방 나가기', message: '채팅방을 나가시겠습니까?' })
    if (confirmed) {
      emit('back-to-list')
      router.push({ name: 'Chat' })
    }
  }
}

// Message menu
const openMessageMenu = (msg) => {
  messageMenu.value = { show: true, message: msg, x: event.clientX, y: event.clientY }
}

const setReply = (msg) => {
  replyTo.value = msg
  messageMenu.value.show = false
  messageInput.value?.focus()
}

const copyMessage = (msg) => {
  navigator.clipboard.writeText(msg.content)
  messageMenu.value.show = false
}

// File handling
const openFilePicker = () => fileInput.value?.click()

const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files)
  for (const file of files) {
    const isImage = file.type.startsWith('image/')
    const tempMsg = {
      messageId: `temp-${Date.now()}`,
      senderId: currentUserId.value,
      senderName: '나',
      content: isImage ? '' : file.name,
      type: isImage ? 'IMAGE' : 'FILE',
      fileName: file.name,
      fileUrl: isImage ? URL.createObjectURL(file) : null,
      createdAt: new Date().toISOString(),
      status: 'SENDING'
    }
    messages.value.push(tempMsg)
    await nextTick()
    scrollToBottom()

    setTimeout(() => {
      const idx = messages.value.findIndex(m => m.messageId === tempMsg.messageId)
      if (idx !== -1) messages.value[idx].status = 'SENT'
    }, 1000)
  }
  e.target.value = ''
}

// Helpers
const shouldShowDate = (msg, idx) => {
  if (idx === 0) return true
  return new Date(msg.createdAt).toDateString() !== new Date(messages.value[idx-1].createdAt).toDateString()
}
const shouldShowSender = (msg, idx) => idx === 0 || messages.value[idx-1].senderId !== msg.senderId
const shouldShowAvatar = (msg, idx) => shouldShowSender(msg, idx)

const formatTime = (d) => d ? new Date(d).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''
const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (date.toDateString() === new Date().toDateString()) return '오늘'
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}
const formatPrice = (p) => Number(p || 0).toLocaleString()

const getSampleMessages = () => [
  { messageId: '1', senderId: 2, senderName: '김민준', content: '안녕하세요! 이 상품 아직 있나요?', createdAt: new Date(Date.now() - 300000).toISOString(), status: 'SENT' },
  { messageId: '2', senderId: currentUserId.value, senderName: '나', content: '네, 있습니다!', createdAt: new Date(Date.now() - 240000).toISOString(), status: 'SENT' },
]

// Lifecycle
onMounted(() => {
  currentUserId.value = getCurrentUserId()
  initializeChatRoom()
})

onUnmounted(() => {
  if (typingTimer.value) clearTimeout(typingTimer.value)
  const roomId = actualRoomId.value
  if (roomId) webSocketService.leaveChatRoom?.(roomId)
})

watch(actualRoomId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    if (oldVal) webSocketService.leaveChatRoom?.(oldVal)
    messages.value = []
    initializeChatRoom()
  }
})
</script>

<style scoped>
.chat-detail-container {
  display: flex;
  flex-direction: column;
  /* 앱 헤더(66px) 제외한 뷰포트 높이에 딱 맞춰 채팅창이 한 화면에 담김 */
  height: calc(100vh - 66px);
  background: #FFFFFF;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  color: #0A0E1A;
  /* AppSidebar와 붙어 시작 (left-align) — ChatRoomView와 동일 */
  max-width: 100%;
  margin: 0;
  width: 100%;
  padding: 0 16px;
  /* 페이지 자체 스크롤 차단 — 메시지 영역만 내부 스크롤 */
  overflow: hidden;
  min-height: 0;
}

@media (min-width: 768px) {
  .chat-detail-container { max-width: 720px; padding: 0; }
}

@media (min-width: 1280px) {
  .chat-detail-container { max-width: 820px; }
}

/* 모바일: 부모(.main-content)가 한 화면 높이를 보장하므로 그대로 채움
   (BottomNavigation은 채팅 상세에서 숨겨지므로 safe-area만 보정) */
@media (max-width: 767px) {
  .chat-detail-container {
    height: 100%;
    padding: 0 12px env(safe-area-inset-bottom);
  }
}

/* Header */
.detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 0;
  background: #FFFFFF;
  border-bottom: 1px solid #F1F3F6;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .detail-header {
    gap: 10px;
    padding: 12px 0;
  }
  .detail-header .back-btn,
  .detail-header .icon-btn {
    width: 36px;
    height: 36px;
  }
  .detail-header .header-avatar {
    width: 36px;
    height: 36px;
  }
  .detail-header .header-title { font-size: 15px; }
  .detail-header .header-status { font-size: 11px; }
}

.back-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #4E5968;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.15s ease;
}

.back-btn:hover { background: #FAFAFB; color: #0A0E1A; border-color: #CBD5E1; }

.header-info { flex: 1; display: flex; align-items: center; gap: 12px; min-width: 0; }

.header-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.header-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  object-fit: cover;
}

.header-avatar .avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FAF5FF;
  color: #9333EA;
}

.header-avatar .online-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border: 2.5px solid #FFFFFF;
  border-radius: 50%;
}

.header-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.header-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #0A0E1A;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.header-status {
  font-size: 12px;
  color: #8B95A1;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #4E5968;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.15s ease;
}

.icon-btn:hover { background: #FAFAFB; color: #0A0E1A; border-color: #CBD5E1; }

/* Connection Error */
.connection-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 13px;
}

.retry-link {
  margin-left: auto;
  background: none;
  border: none;
  color: #9333ea;
  font-weight: 600;
  cursor: pointer;
}

/* Feed Preview — 카드 스타일 */
.feed-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  margin: 16px 0 0;
  background: #FFFFFF;
  border: 1px solid #F1F3F6;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.feed-preview:hover {
  background: #FAFAFB;
  border-color: #E5E7EB;
}

.feed-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.feed-info { flex: 1; min-width: 0; }

.feed-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #0A0E1A;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.feed-price {
  font-size: 14px;
  font-weight: 800;
  color: #9333EA;
  margin: 0;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.feed-arrow { color: #CBD5E1; flex-shrink: 0; }

/* Messages Area */
.messages-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 0;
  background: #FAFAFB;
  margin: 16px 0 0;
  border-radius: 16px 16px 0 0;
  border: 1px solid #F1F3F6;
  border-bottom: none;
}

.loading-more { display: flex; justify-content: center; padding: 16px; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3e8ff;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #f3e8ff;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  text-align: center;
}

.empty-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.empty-messages p { font-size: 16px; font-weight: 500; color: #6b7280; margin: 0 0 4px; }
.empty-messages > span { font-size: 14px; color: #9ca3af; }

.messages-list { display: flex; flex-direction: column; gap: 4px; }

/* Date Divider */
.date-divider { display: flex; justify-content: center; padding: 16px 0; }
.date-divider span {
  font-size: 11.5px;
  font-weight: 600;
  color: #8B95A1;
  background: #FFFFFF;
  border: 1px solid #F1F3F6;
  padding: 5px 14px;
  border-radius: 12px;
  letter-spacing: -0.01em;
}

.messages-list { padding: 0 16px; }

/* Message Row */
.message-row { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 4px; }
.message-row.mine { flex-direction: row-reverse; }

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-placeholder-small {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #d1d5db;
  flex-shrink: 0;
}

.avatar-spacer { width: 32px; flex-shrink: 0; }
.message-content { display: flex; flex-direction: column; max-width: 70%; }
.sender-name { font-size: 12px; color: #6b7280; margin-bottom: 4px; margin-left: 4px; }

/* Reply Bubble */
.reply-bubble {
  padding: 8px 12px;
  margin-bottom: 4px;
  background: rgba(147, 51, 234, 0.06);
  border-radius: 12px;
  border-left: 3px solid #9333ea;
}

.reply-bubble .reply-sender { display: block; font-size: 11px; font-weight: 600; color: #9333ea; margin-bottom: 2px; }
.reply-bubble .reply-text { font-size: 12px; color: #6b7280; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Message Bubble */
.message-bubble {
  padding: 11px 15px;
  border-radius: 16px;
  background: #FFFFFF;
  border: 1px solid #F1F3F6;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.message-bubble:hover { border-color: #E5E7EB; }
.message-bubble.mine {
  background: #9333EA;
  color: #ffffff;
  border-color: #9333EA;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.18);
}
.message-bubble.mine:hover { border-color: #7C3AED; }
.message-bubble.failed { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
.message-bubble p { margin: 0; font-size: 14px; line-height: 1.55; word-break: break-word; letter-spacing: -0.01em; }
.message-image { max-width: 200px; border-radius: 12px; display: block; }
.file-bubble { display: flex; align-items: center; gap: 8px; }
.file-name { font-size: 14px; }

/* Message Meta */
.message-meta { display: flex; gap: 6px; margin-top: 4px; padding: 0 4px; }
.message-meta.mine { justify-content: flex-end; }
.message-meta .time { font-size: 11px; color: #9ca3af; }
.message-meta .status { font-size: 11px; }
.message-meta .status.sending { color: #9ca3af; }
.message-meta .status.failed { color: #dc2626; cursor: pointer; font-weight: 500; }

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 18px;
  width: fit-content;
  margin-top: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.typing-dots { display: flex; gap: 4px; }

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #9333ea;
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.typing-indicator > span { font-size: 12px; color: #6b7280; }

/* Reply Preview */
.reply-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #faf5ff;
  border-top: 1px solid #f3f4f6;
}

.reply-info { flex: 1; min-width: 0; }
.reply-label { display: block; font-size: 12px; font-weight: 600; color: #9333ea; margin-bottom: 2px; }
.reply-content { font-size: 13px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

.reply-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.reply-close:hover { background: #f3e8ff; color: #9333ea; }

/* Input Area */
.input-area {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #FFFFFF;
  border: 1px solid #F1F3F6;
  border-top: none;
  border-radius: 0 0 16px 16px;
  flex-shrink: 0;
}

.attach-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #4E5968;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.attach-btn:hover { background: #FAFAFB; color: #9333EA; border-color: #CBD5E1; }

.input-box {
  flex: 1;
  background: #F7F8FA;
  border-radius: 12px;
  padding: 0 16px;
  height: 44px;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.input-box.focused {
  background: #FFFFFF;
  border-color: #9333EA;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.input-box input {
  width: 100%;
  border: none;
  background: none;
  font-size: 14px;
  color: #0A0E1A;
  outline: none;
  font-family: inherit;
  letter-spacing: -0.01em;
}

.input-box input::placeholder { color: #8B95A1; }

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: #9333EA;
  color: #FFFFFF;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.28);
}

.send-btn:hover:not(:disabled) { background: #7C3AED; }
.send-btn:active:not(:disabled) { transform: scale(0.96); }
.send-btn:disabled { background: #E5E7EB; color: #B0B8C1; cursor: not-allowed; box-shadow: none; }

/* Menu Modal */
.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.menu-modal {
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
}

@media (min-width: 768px) {
  .menu-overlay { align-items: center; }
  .menu-modal { border-radius: 16px; }
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.menu-header h3 { font-size: 18px; font-weight: 700; margin: 0; color: #111827; }

.menu-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.menu-close:hover { background: #e5e7eb; }

.menu-body { padding: 8px 0; }
.menu-footer { padding: 8px 0; border-top: 1px solid #f3f4f6; }

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 24px;
  border: none;
  background: none;
  font-size: 15px;
  color: #111827;
  cursor: pointer;
  font-family: inherit;
}

.menu-item:hover { background: #f9fafb; }
.menu-item.danger { color: #dc2626; }
.menu-item.danger:hover { background: #fef2f2; }
.menu-arrow { margin-left: auto; color: #d1d5db; }

/* Context Menu */
.context-overlay { position: fixed; inset: 0; z-index: 1001; }

.context-menu {
  position: fixed;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  padding: 4px;
  min-width: 120px;
}

.context-menu button {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  font-size: 14px;
  color: #111827;
  cursor: pointer;
  border-radius: 8px;
  font-family: inherit;
}

.context-menu button:hover { background: #f9fafb; }
.context-menu button.danger { color: #dc2626; }
.context-menu button.danger:hover { background: #fef2f2; }

/* Transitions */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
.message-enter-active { transition: all 0.3s ease; }
.message-enter-from { opacity: 0; transform: translateY(20px); }
</style>
