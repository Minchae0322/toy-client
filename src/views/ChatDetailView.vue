<template>
  <div class="chat-detail-container">
    <!-- 헤더 -->
    <header class="detail-header">
      <button @click="goBack" class="back-btn">
        <ChevronLeft :size="24" />
      </button>

      <div class="header-info">
        <div class="header-avatar">
          <img :src="roomInfo.profileImage || defaultAvatar" :alt="roomInfo.title" />
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
          <MessageCircle :size="48" />
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
              <img
                  v-if="message.senderId !== currentUserId && shouldShowAvatar(message, index)"
                  :src="message.senderProfileImage || defaultAvatar"
                  class="message-avatar"
              />
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
                    <span class="file-icon">📎</span>
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
  Plus, Send, Users, Search, Bell, LogOut, X, RefreshCw
} from 'lucide-vue-next'
import { chatService } from '@/services/ChatService.js'
import { webSocketService } from '@/services/webSocketService.js'

// ✅ Props 정의 추가
const props = defineProps({
  roomId: { type: [String, Number], default: null }
})

// ✅ Emits 정의
const emit = defineEmits(['back-to-list', 'new-message'])

const route = useRoute()
const router = useRouter()

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

// ✅ Computed - props.roomId 우선 사용
const actualRoomId = computed(() =>
    props.roomId || route.params.roomId || route.params.id
)

const feedInfo = computed(() => ({
  id: route.query.feedId || '',
  title: route.query.feedTitle || '',
  price: route.query.feedPrice || 0,
  thumbnail: route.query.feedThumbnail || ''
}))
const defaultAvatar = computed(() => `https://ui-avatars.com/api/?name=${encodeURIComponent(roomInfo.value.title || '?')}&background=9333ea&color=fff`)
const canSend = computed(() => newMessage.value.trim() && connectionState.value.connected)

// ✅ Methods - emit 사용
const goBack = () => {
  emit('back-to-list')
  router.back()
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
    console.error('❌ roomId가 없습니다')
    return
  }

  console.log(`🚪 채팅방 초기화: roomId=${roomId}`)

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
    console.error('❌ 채팅방 초기화 실패:', error)
    connectionState.value = { connected: false, connecting: false, status: 'error', error: error.message }
  } finally { loading.value = false }
}

const fetchMessages = async (lastMessageId = null) => {
  const roomId = actualRoomId.value
  if (!roomId) {
    console.error('❌ fetchMessages: roomId가 없습니다')
    return
  }

  console.log(`📨 메시지 조회: roomId=${roomId}, lastMessageId=${lastMessageId}`)

  try {
    if (lastMessageId) loadingMore.value = true
    const res = await chatService.getChatMessages(roomId, { size: 20, lastMessageId })
    const newMsgs = (res.data || []).map(m => chatService.transformMessageResponse(m))

    console.log(`📨 메시지 ${newMsgs.length}개 수신`)

    if (lastMessageId) {
      messages.value = [...newMsgs.reverse(), ...messages.value]
    } else {
      messages.value = newMsgs.reverse()
      await nextTick()
      scrollToBottom()
    }
  } catch (e) {
    console.error('❌ 메시지 조회 실패:', e)
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

    // ✅ 새 메시지 이벤트 emit
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

  // ✅ 새 메시지 이벤트 emit
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

const handleMenuAction = (action) => {
  showRoomMenu.value = false
  if (action === 'leave' && confirm('채팅방을 나가시겠습니까?')) {
    emit('back-to-list')
    router.back()
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

    // TODO: 실제 파일 업로드 구현
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
  console.log(`📌 ChatDetail mounted: roomId=${actualRoomId.value}`)
  initializeChatRoom()
})

onUnmounted(() => {
  if (typingTimer.value) clearTimeout(typingTimer.value)
  webSocketService.unsubscribeFromChatRoom?.(actualRoomId.value)
})

// ✅ props.roomId 변경 감시
watch(actualRoomId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    console.log(`🔄 roomId 변경: ${oldVal} → ${newVal}`)
    messages.value = []
    initializeChatRoom()
  }
})
</script>

<style scoped>
.chat-detail-container { display: flex; flex-direction: column; height: 100vh; background: #FFF; font-family: 'Pretendard', -apple-system, sans-serif; }

/* Header */
.detail-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #FFF; border-bottom: 1px solid #E2E8F0; position: sticky; top: 0; z-index: 100; }
.back-btn { width: 40px; height: 40px; border: none; background: none; color: #222; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
.back-btn:hover { background: #F5F5F5; }
.header-info { flex: 1; display: flex; align-items: center; gap: 12px; }
.header-avatar { position: relative; width: 44px; height: 44px; }
.header-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: linear-gradient(135deg, #f3e8ff, #e9d5ff); }
.header-avatar .online-dot { position: absolute; bottom: 1px; right: 1px; width: 12px; height: 12px; background: #22C55E; border: 2px solid #FFF; border-radius: 50%; }
.header-text { display: flex; flex-direction: column; gap: 2px; }
.header-title { font-size: 16px; font-weight: 600; margin: 0; color: #222; }
.header-status { font-size: 13px; color: #999; }
.icon-btn { width: 40px; height: 40px; border: none; background: none; color: #666; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
.icon-btn:hover { background: #F5F5F5; }

/* Connection Error */
.connection-error { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #FEF2F2; color: #DC2626; font-size: 13px; }
.retry-link { margin-left: auto; background: none; border: none; color: #9333EA; font-weight: 600; cursor: pointer; }

/* Feed Preview */
.feed-preview { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #FAFAFA; border-bottom: 1px solid #E2E8F0; cursor: pointer; }
.feed-preview:hover { background: #F5F5F5; }
.feed-thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
.feed-info { flex: 1; min-width: 0; }
.feed-title { font-size: 14px; font-weight: 500; color: #222; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.feed-price { font-size: 15px; font-weight: 700; color: #9333EA; margin: 0; }
.feed-arrow { color: #999; }

/* Messages Area */
.messages-area { flex: 1; overflow-y: auto; padding: 16px; background: #FAFAFA; }
.loading-more { display: flex; justify-content: center; padding: 16px; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999; gap: 12px; }
.spinner { width: 32px; height: 32px; border: 3px solid #f3e8ff; border-top-color: #9333EA; border-radius: 50%; animation: spin 0.8s linear infinite; }
.spinner-small { width: 20px; height: 20px; border: 2px solid #f3e8ff; border-top-color: #9333EA; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-messages { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999; text-align: center; }
.empty-messages svg { color: #DDD; margin-bottom: 12px; }
.empty-messages p { font-size: 16px; font-weight: 500; color: #666; margin: 0 0 4px; }
.messages-list { display: flex; flex-direction: column; gap: 4px; }

/* Date Divider */
.date-divider { display: flex; justify-content: center; padding: 16px 0; }
.date-divider span { font-size: 12px; color: #999; background: #FAFAFA; padding: 4px 12px; border-radius: 12px; }

/* Message Row */
.message-row { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 4px; }
.message-row.mine { flex-direction: row-reverse; }
.message-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.avatar-spacer { width: 32px; }
.message-content { display: flex; flex-direction: column; max-width: 70%; }
.sender-name { font-size: 12px; color: #666; margin-bottom: 4px; margin-left: 4px; }

/* Reply Bubble */
.reply-bubble { padding: 8px 12px; margin-bottom: 4px; background: rgba(147,51,234,0.1); border-radius: 12px; border-left: 3px solid #9333EA; }
.reply-bubble .reply-sender { display: block; font-size: 11px; font-weight: 600; color: #9333EA; margin-bottom: 2px; }
.reply-bubble .reply-text { font-size: 12px; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Message Bubble */
.message-bubble { padding: 10px 14px; border-radius: 18px; background: #FFF; box-shadow: 0 1px 2px rgba(0,0,0,0.05); cursor: pointer; }
.message-bubble.mine { background: #9333EA; color: #FFF; }
.message-bubble.failed { background: #FEE2E2; color: #DC2626; }
.message-bubble p { margin: 0; font-size: 14px; line-height: 1.5; word-break: break-word; }
.message-image { max-width: 200px; border-radius: 12px; display: block; }
.file-bubble { display: flex; align-items: center; gap: 8px; }
.file-icon { font-size: 20px; }
.file-name { font-size: 14px; }

/* Message Meta */
.message-meta { display: flex; gap: 6px; margin-top: 4px; padding: 0 4px; }
.message-meta.mine { justify-content: flex-end; }
.message-meta .time { font-size: 11px; color: #999; }
.message-meta .status { font-size: 11px; }
.message-meta .status.sending { color: #999; }
.message-meta .status.failed { color: #DC2626; cursor: pointer; font-weight: 500; }

/* Typing Indicator */
.typing-indicator { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #FFF; border-radius: 18px; width: fit-content; margin-top: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.typing-dots { display: flex; gap: 4px; }
.typing-dots span { width: 6px; height: 6px; background: #9333EA; border-radius: 50%; animation: typing-bounce 1.4s ease-in-out infinite both; }
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing-bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
.typing-indicator > span { font-size: 12px; color: #666; }

/* Reply Preview */
.reply-preview { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #FAF5FF; border-top: 1px solid #E2E8F0; }
.reply-info { flex: 1; min-width: 0; }
.reply-label { display: block; font-size: 12px; font-weight: 600; color: #9333EA; margin-bottom: 2px; }
.reply-content { font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.reply-close { width: 32px; height: 32px; border: none; background: none; color: #999; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.reply-close:hover { background: #F3E8FF; color: #9333EA; }

/* Input Area */
.input-area { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #FFF; border-top: 1px solid #E2E8F0; }
.attach-btn { width: 40px; height: 40px; border: none; background: #F5F5F5; color: #666; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.attach-btn:hover { background: #EEE; }
.input-box { flex: 1; background: #F5F5F5; border-radius: 24px; padding: 0 16px; height: 44px; display: flex; align-items: center; transition: all 0.2s; }
.input-box.focused { background: #FFF; box-shadow: 0 0 0 2px #9333EA; }
.input-box input { width: 100%; border: none; background: none; font-size: 14px; color: #222; outline: none; font-family: inherit; }
.input-box input::placeholder { color: #999; }
.send-btn { width: 44px; height: 44px; border: none; background: #9333EA; color: #FFF; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.send-btn:hover:not(:disabled) { background: #7C22CE; transform: scale(1.05); }
.send-btn:disabled { background: #E2E8F0; cursor: not-allowed; }

/* Menu Modal */
.menu-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; }
.menu-modal { background: #FFF; border-radius: 20px 20px 0 0; width: 100%; max-width: 500px; max-height: 80vh; overflow: hidden; }
@media (min-width: 768px) { .menu-overlay { align-items: center; } .menu-modal { border-radius: 20px; } }
.menu-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #E2E8F0; }
.menu-header h3 { font-size: 18px; font-weight: 700; margin: 0; }
.menu-close { width: 36px; height: 36px; border: none; background: #F5F5F5; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #666; }
.menu-body { padding: 8px 0; }
.menu-footer { padding: 8px 0; border-top: 1px solid #E2E8F0; }
.menu-item { display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 24px; border: none; background: none; font-size: 15px; color: #222; cursor: pointer; font-family: inherit; }
.menu-item:hover { background: #FAF5FF; }
.menu-item.danger { color: #DC2626; }
.menu-item.danger:hover { background: #FEF2F2; }
.menu-arrow { margin-left: auto; color: #CCC; }

/* Context Menu */
.context-overlay { position: fixed; inset: 0; z-index: 1001; }
.context-menu { position: fixed; background: #FFF; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 4px; min-width: 120px; }
.context-menu button { display: block; width: 100%; padding: 10px 16px; border: none; background: none; text-align: left; font-size: 14px; color: #222; cursor: pointer; border-radius: 8px; font-family: inherit; }
.context-menu button:hover { background: #F5F5F5; }
.context-menu button.danger { color: #DC2626; }
.context-menu button.danger:hover { background: #FEF2F2; }

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