<template>
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
            v-for="message in visibleMessages"
            :key="message.messageId || message.id"
            :message="message"
            :is-mine="message.senderId === currentUserId"
            :show-sender="shouldShowSender(message)"
            :show-time="shouldShowTime(message)"
            @message-click="$emit('message-click', $event)"
            @retry="$emit('retry', $event)"
            @delete="$emit('delete', $event)"
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
      <span class="typing-text">{{ getTypingText() }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import { useUserBlock } from '@/composables/useUserBlock.js'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  loadingMore: { type: Boolean, default: false },
  typingUsers: { type: Array, default: () => [] },
  currentUserId: { type: [String, Number], required: true }
})

const { isBlocked } = useUserBlock()
const visibleMessages = computed(() => props.messages.filter((m) => !isBlocked(m?.senderId)))

const emit = defineEmits(['scroll', 'message-click', 'retry', 'delete'])
const messagesContainer = ref(null)

const handleScroll = () => {
  if (!messagesContainer.value) return
  emit('scroll')
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const isAtBottom = () => {
  if (!messagesContainer.value) return false
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  return scrollTop + clientHeight >= scrollHeight - 50
}

const isAtTop = () => {
  if (!messagesContainer.value) return false
  return messagesContainer.value.scrollTop === 0
}

const getScrollHeight = () => messagesContainer.value?.scrollHeight || 0

const restoreScrollPosition = (previousScrollHeight) => {
  if (messagesContainer.value) {
    const newScrollHeight = messagesContainer.value.scrollHeight
    messagesContainer.value.scrollTop = newScrollHeight - previousScrollHeight
  }
}

const shouldShowSender = (message) => {
  const idx = props.messages.findIndex(m => m.messageId === message.messageId)
  if (idx === 0) return true
  const prev = props.messages[idx - 1]
  if (!prev) return true
  const timeDiff = new Date(message.createdAt) - new Date(prev.createdAt)
  return prev.senderId !== message.senderId || timeDiff > 5 * 60 * 1000
}

const shouldShowTime = (message) => {
  const idx = props.messages.findIndex(m => m.messageId === message.messageId)
  if (idx === props.messages.length - 1) return true
  const next = props.messages[idx + 1]
  if (!next) return true
  const timeDiff = new Date(next.createdAt) - new Date(message.createdAt)
  return timeDiff > 5 * 60 * 1000
}

const getTypingText = () => {
  const count = props.typingUsers.length
  if (count === 1) return `${props.typingUsers[0].userName}님이 입력 중...`
  if (count === 2) return `${props.typingUsers[0].userName}님, ${props.typingUsers[1].userName}님이 입력 중...`
  return `${props.typingUsers[0].userName}님 외 ${count - 1}명이 입력 중...`
}

defineExpose({ scrollToBottom, isAtBottom, isAtTop, getScrollHeight, restoreScrollPosition })
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg-subtle);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--c-text-500);
  font-size: 13px;
  gap: 8px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--c-text-500);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--c-brand-soft);
  border-top: 3px solid var(--c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid var(--c-brand-soft);
  border-top: 2px solid var(--c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin-top: 12px;
  background: var(--bg-elevated);
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  width: fit-content;
}

.typing-animation {
  display: flex;
  gap: 4px;
}

.typing-animation span {
  width: 7px;
  height: 7px;
  background: var(--c-brand);
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite both;
}

.typing-animation span:nth-child(1) { animation-delay: -0.32s; }
.typing-animation span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.typing-text {
  font-size: 13px;
  color: var(--c-text-500);
  font-style: italic;
}

.message-enter-active, .message-leave-active { transition: all 0.3s ease; }
.message-enter-from { opacity: 0; transform: translateY(20px); }
.message-leave-to { opacity: 0; transform: translateY(-20px); }

@media (max-width: 768px) {
  .messages-container { padding: 16px; }
}

/* 스크롤바 스타일 */
.messages-container::-webkit-scrollbar { width: 6px; }
.messages-container::-webkit-scrollbar-track { background: transparent; }
.messages-container::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
.messages-container::-webkit-scrollbar-thumb:hover { background: var(--c-text-300); }
</style>