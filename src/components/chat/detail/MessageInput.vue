<template>
  <div class="message-input-container">
    <!-- 답장 표시 영역 -->
    <div v-if="replyMessage" class="reply-preview">
      <div class="reply-content">
        <div class="reply-header">
          <span class="reply-to">{{ replyMessage.senderName }}님에게 답장</span>
          <button @click="clearReply" class="reply-close">
            <X :size="16" />
          </button>
        </div>
        <div class="reply-text">{{ replyMessage.content }}</div>
      </div>
    </div>

    <!-- 툴바 -->
    <div class="input-toolbar">
      <button
          class="toolbar-btn"
          @click="toggleEmojiPicker"
          :disabled="disabled"
          title="이모지"
      >
        😊
      </button>
      <button
          class="toolbar-btn"
          @click="openFileSelector"
          :disabled="disabled"
          title="파일 첨부"
      >
        📎
      </button>
      <button
          class="toolbar-btn"
          @click="openImageSelector"
          :disabled="disabled"
          title="이미지"
      >
        🖼️
      </button>
    </div>

    <!-- 메시지 입력 영역 -->
    <div class="input-area">
      <textarea
          ref="textInput"
          v-model="messageText"
          :placeholder="placeholder"
          :disabled="disabled"
          @keydown="handleKeyDown"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @paste="handlePaste"
          class="message-textarea"
          rows="1"
      ></textarea>

      <button
          class="send-button"
          :disabled="!canSend || disabled"
          @click="sendMessage"
          title="메시지 전송 (Enter)"
      >
        <Send :size="20" />
      </button>
    </div>

    <!-- 파일 입력 -->
    <input
        ref="fileInput"
        type="file"
        style="display: none"
        @change="handleFileSelect"
        accept="*/*"
        multiple
    />

    <!-- 이미지 입력 -->
    <input
        ref="imageInput"
        type="file"
        style="display: none"
        @change="handleImageSelect"
        accept="image/*"
        multiple
    />

    <!-- 타이핑 표시 -->
    <div v-if="showTypingIndicator" class="typing-indicator">
      <div class="typing-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <span class="typing-text">입력 중...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { Send, X } from 'lucide-vue-next'

const props = defineProps({
  placeholder: {
    type: String,
    default: '메시지를 입력하세요...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  replyMessage: {
    type: Object,
    default: null
  },
  showTypingIndicator: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'send-message',
  'typing-start',
  'typing-stop',
  'clear-reply'
])

// Refs
const messageText = ref('')
const textInput = ref(null)
const fileInput = ref(null)
const imageInput = ref(null)

// 상태 관리
const isTyping = ref(false)
const typingTimer = ref(null)

// Computed
const canSend = computed(() => {
  return messageText.value.trim().length > 0 && !props.disabled
})

// 메서드
const handleKeyDown = (event) => {
  // Enter로 전송 (Shift+Enter는 줄바꿈)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (canSend.value) {
      sendMessage()
    }
    return
  }

  // Ctrl+Enter로도 전송 가능
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault()
    if (canSend.value) {
      sendMessage()
    }
    return
  }

  // 타이핑 시작 처리
  handleTypingStart()
}

const handleInput = () => {
  // 자동 높이 조절
  autoResize()

  // 타이핑 상태 관리
  if (messageText.value.trim()) {
    handleTypingStart()
  } else {
    handleTypingStop()
  }
}

const handleFocus = () => {
  // 포커스 시 내용이 있으면 타이핑 시작
  if (messageText.value.trim()) {
    handleTypingStart()
  }
}

const handleBlur = () => {
  // 포커스 잃으면 약간의 딜레이 후 타이핑 중단
  setTimeout(() => {
    if (!textInput.value || document.activeElement !== textInput.value) {
      handleTypingStop()
    }
  }, 100)
}

const handlePaste = (event) => {
  // 클립보드에서 이미지 붙여넣기 처리
  const items = event.clipboardData?.items
  if (items) {
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        event.preventDefault()
        const file = item.getAsFile()
        if (file) {
          handleImageUpload([file])
        }
        break
      }
    }
  }

  // 텍스트 붙여넣기는 기본 동작으로 처리
  setTimeout(() => {
    autoResize()
    handleTypingStart()
  }, 0)
}

// 자동 높이 조절
const autoResize = async () => {
  await nextTick()
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    const maxHeight = 120 // 최대 높이 제한
    const newHeight = Math.min(textInput.value.scrollHeight, maxHeight)
    textInput.value.style.height = `${newHeight}px`
  }
}

// 타이핑 상태 처리
const handleTypingStart = () => {
  if (!isTyping.value && messageText.value.trim()) {
    isTyping.value = true
    emit('typing-start')
  }

  // 기존 타이머 클리어
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  // 3초 후 타이핑 중단
  typingTimer.value = setTimeout(() => {
    handleTypingStop()
  }, 3000)
}

const handleTypingStop = () => {
  if (isTyping.value) {
    isTyping.value = false
    emit('typing-stop')
  }

  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
}

// 메시지 전송
const sendMessage = async () => {
  if (!canSend.value) return

  const content = messageText.value.trim()
  if (!content) return

  try {
    // 백엔드 STOMP 구조에 맞는 메시지 데이터 생성
    const messageData = {
      content: content,
      type: 'TEXT', // MessageType enum과 일치
      metadata: {},

      // 답장 관련
      replyToMessageId: props.replyMessage?.messageId || null,
      replyToContent: props.replyMessage?.content || null,
      replyToSender: props.replyMessage?.senderName || null
    }

    console.log('📤 MessageInput에서 메시지 전송:', messageData)

    // 메시지 전송 이벤트 발생
    emit('send-message', messageData)

    // 입력 필드 초기화
    messageText.value = ''
    clearReply()

    // 타이핑 중단
    handleTypingStop()

    // 텍스트 영역 높이 리셋
    await nextTick()
    autoResize()

    // 포커스 유지
    textInput.value?.focus()

  } catch (error) {
    console.error('메시지 전송 중 오류:', error)
  }
}

// 답장 관련
const clearReply = () => {
  emit('clear-reply')
}

// 파일 관련
const toggleEmojiPicker = () => {
  // TODO: 이모지 피커 구현
  console.log('이모지 피커 토글')
}

const openFileSelector = () => {
  if (fileInput.value) {
    fileInput.value.accept = '*/*'
    fileInput.value.click()
  }
}

const openImageSelector = () => {
  if (imageInput.value) {
    imageInput.value.click()
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    handleFileUpload(files)
  }

  // 파일 입력 초기화
  event.target.value = ''
}

const handleImageSelect = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    handleImageUpload(files)
  }

  // 파일 입력 초기화
  event.target.value = ''
}

const handleFileUpload = async (files) => {
  console.log('📎 파일 업로드:', files)

  for (const file of files) {
    const messageData = {
      content: `${getFileEmoji(file)} ${file.name}`,
      type: getMessageType(file),
      metadata: {
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        isFile: true
      },
      // 파일 관련 필드들 (백엔드 DTO와 호환)
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    }

    console.log('📤 파일 메시지 전송:', messageData)
    emit('send-message', messageData)
  }
}

const handleImageUpload = async (files) => {
  console.log('🖼️ 이미지 업로드:', files)

  for (const file of files) {
    // 이미지 미리보기 생성 (선택사항)
    const reader = new FileReader()
    reader.onload = (e) => {
      const messageData = {
        content: `🖼️ ${file.name}`,
        type: 'IMAGE',
        metadata: {
          originalFileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          isImage: true,
          previewUrl: e.target.result
        },
        // 백엔드 DTO 호환 필드들
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        // 이미지 메타데이터 (크기는 별도 처리 필요)
        width: null, // TODO: 이미지 크기 측정
        height: null
      }

      console.log('📤 이미지 메시지 전송:', messageData)
      emit('send-message', messageData)
    }
    reader.readAsDataURL(file)
  }
}

// 파일 타입 분류
const getMessageType = (file) => {
  if (file.type.startsWith('image/')) return 'IMAGE'
  if (file.type.startsWith('video/')) return 'VIDEO'
  if (file.type.startsWith('audio/')) return 'AUDIO'
  return 'FILE'
}

// 파일 이모지
const getFileEmoji = (file) => {
  if (file.type.startsWith('image/')) return '🖼️'
  if (file.type.startsWith('video/')) return '🎥'
  if (file.type.startsWith('audio/')) return '🎵'
  if (file.type.includes('pdf')) return '📄'
  if (file.type.includes('word')) return '📝'
  if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊'
  if (file.type.includes('zip') || file.type.includes('rar')) return '🗜️'
  return '📎'
}

// 포커스 메서드 노출
const focus = () => {
  textInput.value?.focus()
}

// 텍스트 설정 메서드 노출
const setText = (text) => {
  messageText.value = text
  nextTick(() => {
    autoResize()
  })
}

// 라이프사이클
onMounted(() => {
  // 초기 포커스
  if (textInput.value) {
    textInput.value.focus()
  }
})

onUnmounted(() => {
  // 타이머 정리
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
})

// 답장 메시지 변경 감지
watch(() => props.replyMessage, (newReply) => {
  if (newReply) {
    // 답장 시 포커스
    nextTick(() => {
      textInput.value?.focus()
    })
  }
})

// 외부에서 사용할 메서드 노출
defineExpose({
  focus,
  setText
})
</script>

<style scoped>
.message-input-container {
  background: white;
  border-top: 1px solid #e2e8f0;
  position: relative;
}

/* 답장 미리보기 */
.reply-preview {
  margin: 16px 16px 0 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.reply-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-to {
  font-size: 12px;
  color: #3b82f6;
  font-weight: 600;
}

.reply-close {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.reply-close:hover {
  background: #e2e8f0;
  color: #374151;
}

.reply-text {
  font-size: 13px;
  color: #64748b;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 툴바 */
.input-toolbar {
  display: flex;
  gap: 8px;
  padding: 16px 16px 8px 16px;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 16px;
}

.toolbar-btn:hover:not(:disabled) {
  background: #e2e8f0;
  transform: scale(1.05);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 입력 영역 */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin: 0 16px 16px 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.input-area:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  min-height: 24px;
  max-height: 120px;
  font-family: inherit;
  color: #1e293b;
}

.message-textarea::placeholder {
  color: #94a3b8;
}

.message-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 타이핑 표시 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #64748b;
  font-size: 12px;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.dot {
  width: 4px;
  height: 4px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes typing-bounce {
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
  font-style: italic;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .input-toolbar {
    padding: 12px 12px 8px 12px;
  }

  .input-area {
    margin: 0 12px 12px 12px;
    padding: 8px 12px;
  }

  .toolbar-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .send-button {
    width: 36px;
    height: 36px;
  }

  .message-textarea {
    font-size: 16px; /* iOS 줌 방지 */
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .message-input-container {
    background: #1f2937;
    border-color: #374151;
  }

  .reply-preview {
    background: #374151;
    border-left-color: #60a5fa;
  }

  .reply-to {
    color: #60a5fa;
  }

  .reply-text {
    color: #9ca3af;
  }

  .toolbar-btn {
    background: #374151;
    color: #f9fafb;
  }

  .toolbar-btn:hover:not(:disabled) {
    background: #4b5563;
  }

  .input-area {
    background: #374151;
    border-color: #4b5563;
  }

  .input-area:focus-within {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }

  .message-textarea {
    color: #f9fafb;
  }

  .message-textarea::placeholder {
    color: #6b7280;
  }

  .typing-indicator {
    color: #9ca3af;
  }
}

/* 접근성 개선 */
.toolbar-btn:focus,
.send-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.message-textarea:focus {
  outline: none; /* input-area의 focus-within으로 처리 */
}

/* 스크롤바 스타일링 */
.message-textarea::-webkit-scrollbar {
  width: 4px;
}

.message-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.message-textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.message-textarea::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>