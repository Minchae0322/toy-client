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
            v-for="message in messages"
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
      <span class="typing-text">
        {{ getTypingText() }}
      </span>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  typingUsers: {
    type: Array,
    default: () => []
  },
  currentUserId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['scroll', 'message-click', 'retry', 'delete'])

const messagesContainer = ref(null)

// 스크롤 처리
const handleScroll = () => {
  if (!messagesContainer.value) return
  emit('scroll')
}

// 스크롤 유틸리티 메서드
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

const isAtTop = () => {
  if (!messagesContainer.value) return false
  return messagesContainer.value.scrollTop === 0
}

const getScrollHeight = () => {
  return messagesContainer.value?.scrollHeight || 0
}

const restoreScrollPosition = (previousScrollHeight) => {
  if (messagesContainer.value) {
    const newScrollHeight = messagesContainer.value.scrollHeight
    messagesContainer.value.scrollTop = newScrollHeight - previousScrollHeight
  }
}

// 발신자 표시 여부 결정
const shouldShowSender = (message) => {
  const messageIndex = props.messages.findIndex(m => m.messageId === message.messageId)
  if (messageIndex === 0) return true

  const prevMessage = props.messages[messageIndex - 1]
  if (!prevMessage) return true

  const timeDiff = new Date(message.createdAt) - new Date(prevMessage.createdAt)
  return prevMessage.senderId !== message.senderId || timeDiff > 5 * 60 * 1000
}

// 시간 표시 여부 결정
const shouldShowTime = (message) => {
  const messageIndex = props.messages.findIndex(m => m.messageId === message.messageId)
  if (messageIndex === props.messages.length - 1) return true

  const nextMessage = props.messages[messageIndex + 1]
  if (!nextMessage) return true

  const timeDiff = new Date(nextMessage.createdAt) - new Date(message.createdAt)
  return timeDiff > 5 * 60 * 1000
}

// 타이핑 텍스트 생성
const getTypingText = () => {
  const count = props.typingUsers.length
  if (count === 1) {
    return `${props.typingUsers[0].userName}님이 입력 중...`
  } else if (count === 2) {
    return `${props.typingUsers[0].userName}님, ${props.typingUsers[1].userName}님이 입력 중...`
  } else {
    return `${props.typingUsers[0].userName}님 외 ${count - 1}명이 입력 중...`
  }
}

// 외부에서 호출할 수 있도록 expose
defineExpose({
  scrollToBottom,
  isAtBottom,
  isAtTop,
  getScrollHeight,
  restoreScrollPosition
})
</script>

<style scoped>
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .messages-container {
    padding: 16px;
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

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .messages-container {
    background: #111827;
  }

  .typing-indicator {
    background: #374151;
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
  .message-leave-active {
    animation: none !important;
    transition: none !important;
  }
}
</style>