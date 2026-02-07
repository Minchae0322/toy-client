<template>
  <div class="message-input-container">
    <!-- 답장 표시 영역 -->
    <div v-if="replyMessage" class="reply-preview">
      <div class="reply-content">
        <div class="reply-header">
          <span class="reply-to">{{ replyMessage.senderName }}님에게 답장</span>
          <button @click="clearReply" class="reply-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="reply-text">{{ replyMessage.content }}</div>
      </div>
    </div>

    <!-- 툴바 -->
    <div class="input-toolbar">
      <button class="toolbar-btn" @click="toggleEmojiPicker" :disabled="disabled" title="이모지">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="openFileSelector" :disabled="disabled" title="파일 첨부">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="openImageSelector" :disabled="disabled" title="이미지">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13"/>
          <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </div>

    <!-- 파일 입력 -->
    <input ref="fileInput" type="file" style="display: none" @change="handleFileSelect" accept="*/*" multiple />
    <input ref="imageInput" type="file" style="display: none" @change="handleImageSelect" accept="image/*" multiple />

    <!-- 타이핑 표시 -->
    <div v-if="showTypingIndicator" class="typing-indicator">
      <div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      <span class="typing-text">입력 중...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: '메시지를 입력하세요...' },
  disabled: { type: Boolean, default: false },
  replyMessage: { type: Object, default: null },
  showTypingIndicator: { type: Boolean, default: false }
})

const emit = defineEmits(['send-message', 'typing-start', 'typing-stop', 'clear-reply'])

const messageText = ref('')
const textInput = ref(null)
const fileInput = ref(null)
const imageInput = ref(null)
const isTyping = ref(false)
const typingTimer = ref(null)

const canSend = computed(() => messageText.value.trim().length > 0 && !props.disabled)

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (canSend.value) sendMessage()
    return
  }
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault()
    if (canSend.value) sendMessage()
    return
  }
  handleTypingStart()
}

const handleInput = () => {
  autoResize()
  if (messageText.value.trim()) handleTypingStart()
  else handleTypingStop()
}

const handleFocus = () => { if (messageText.value.trim()) handleTypingStart() }

const handleBlur = () => {
  setTimeout(() => {
    if (!textInput.value || document.activeElement !== textInput.value) handleTypingStop()
  }, 100)
}

const handlePaste = (event) => {
  const items = event.clipboardData?.items
  if (items) {
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        event.preventDefault()
        const file = item.getAsFile()
        if (file) handleImageUpload([file])
        break
      }
    }
  }
  setTimeout(() => { autoResize(); handleTypingStart() }, 0)
}

const autoResize = async () => {
  await nextTick()
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    textInput.value.style.height = `${Math.min(textInput.value.scrollHeight, 120)}px`
  }
}

const handleTypingStart = () => {
  if (!isTyping.value && messageText.value.trim()) {
    isTyping.value = true
    emit('typing-start')
  }
  if (typingTimer.value) clearTimeout(typingTimer.value)
  typingTimer.value = setTimeout(() => handleTypingStop(), 3000)
}

const handleTypingStop = () => {
  if (isTyping.value) { isTyping.value = false; emit('typing-stop') }
  if (typingTimer.value) { clearTimeout(typingTimer.value); typingTimer.value = null }
}

const sendMessage = async () => {
  if (!canSend.value) return
  const content = messageText.value.trim()
  if (!content) return

  const messageData = {
    content,
    type: 'TEXT',
    metadata: {},
    replyToMessageId: props.replyMessage?.messageId || null,
    replyToContent: props.replyMessage?.content || null,
    replyToSender: props.replyMessage?.senderName || null
  }

  emit('send-message', messageData)
  messageText.value = ''
  clearReply()
  handleTypingStop()
  await nextTick()
  autoResize()
  textInput.value?.focus()
}

const clearReply = () => emit('clear-reply')
const toggleEmojiPicker = () => console.log('이모지 피커')
const openFileSelector = () => fileInput.value?.click()
const openImageSelector = () => imageInput.value?.click()

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) handleFileUpload(files)
  event.target.value = ''
}

const handleImageSelect = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) handleImageUpload(files)
  event.target.value = ''
}

const handleFileUpload = async (files) => {
  for (const file of files) {
    emit('send-message', {
      content: file.name,
      type: getMessageType(file),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    })
  }
}

const handleImageUpload = async (files) => {
  for (const file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      emit('send-message', {
        content: file.name,
        type: 'IMAGE',
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      })
    }
    reader.readAsDataURL(file)
  }
}

const getMessageType = (file) => {
  if (file.type.startsWith('image/')) return 'IMAGE'
  if (file.type.startsWith('video/')) return 'VIDEO'
  if (file.type.startsWith('audio/')) return 'AUDIO'
  return 'FILE'
}

const focus = () => textInput.value?.focus()
const setText = (text) => { messageText.value = text; nextTick(() => autoResize()) }

onMounted(() => textInput.value?.focus())
onUnmounted(() => { if (typingTimer.value) clearTimeout(typingTimer.value) })

watch(() => props.replyMessage, (newReply) => {
  if (newReply) nextTick(() => textInput.value?.focus())
})

defineExpose({ focus, setText })
</script>

<style scoped>
.message-input-container {
  background: #FFFFFF;
  border-top: 1px solid #f0f0f0;
  position: relative;
}

/* 답장 미리보기 */
.reply-preview {
  margin: 16px 16px 0 16px;
  padding: 12px 14px;
  background: #faf5ff;
  border-radius: 14px;
  border-left: 3px solid #a855f7;
}

.reply-content { display: flex; flex-direction: column; gap: 4px; }
.reply-header { display: flex; justify-content: space-between; align-items: center; }
.reply-to { font-size: 12px; color: #9333ea; font-weight: 600; }

.reply-close {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s;
}

.reply-close svg {
  width: 16px;
  height: 16px;
}

.reply-close:hover { background: #f3e8ff; color: #9333ea; }

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
  gap: 6px;
  padding: 12px 16px 8px 16px;
}

.toolbar-btn {
  width: 38px;
  height: 38px;
  border: none;
  background: #f5f5f5;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #64748b;
}

.toolbar-btn svg {
  width: 20px;
  height: 20px;
}

.toolbar-btn:hover:not(:disabled) {
  background: #f3e8ff;
  color: #9333ea;
  transform: translateY(-1px);
}

.toolbar-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* 입력 영역 */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin: 0 16px 16px 16px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.input-area:focus-within {
  background: #FFFFFF;
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.message-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 15px;
  line-height: 1.5;
  min-height: 24px;
  max-height: 120px;
  font-family: inherit;
  color: #1e293b;
}

.message-textarea::placeholder { color: #94a3b8; }
.message-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

.send-button {
  width: 42px;
  height: 42px;
  border: none;
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
  color: white;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.25);
}

.send-button svg {
  width: 20px;
  height: 20px;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.35);
}

.send-button:disabled {
  background: #e2e8f0;
  box-shadow: none;
  cursor: not-allowed;
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

.typing-dots { display: flex; gap: 3px; }

.dot {
  width: 5px;
  height: 5px;
  background: #a855f7;
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.typing-text { font-style: italic; }

@media (max-width: 768px) {
  .input-toolbar { padding: 10px 12px 6px 12px; }
  .input-area { margin: 0 12px 12px 12px; padding: 10px 12px; }
  .toolbar-btn { width: 34px; height: 34px; border-radius: 10px; }
  .toolbar-btn svg { width: 18px; height: 18px; }
  .send-button { width: 38px; height: 38px; border-radius: 12px; }
  .send-button svg { width: 18px; height: 18px; }
  .message-textarea { font-size: 16px; }
}
</style>
