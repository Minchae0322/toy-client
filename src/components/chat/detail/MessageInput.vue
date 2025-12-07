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
      <button class="toolbar-btn" @click="toggleEmojiPicker" :disabled="disabled" title="이모지">😊</button>
      <button class="toolbar-btn" @click="openFileSelector" :disabled="disabled" title="파일 첨부">📎</button>
      <button class="toolbar-btn" @click="openImageSelector" :disabled="disabled" title="이미지">🖼️</button>
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
import { Send, X } from 'lucide-vue-next'

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
      content: `📎 ${file.name}`,
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
        content: `🖼️ ${file.name}`,
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
  border-top: 1px solid #E2E8F0;
  position: relative;
}

/* 답장 미리보기 */
.reply-preview {
  margin: 16px 16px 0 16px;
  padding: 12px;
  background: #FAF5FF;
  border-radius: 10px;
  border-left: 3px solid #9333EA;
}

.reply-content { display: flex; flex-direction: column; gap: 4px; }
.reply-header { display: flex; justify-content: space-between; align-items: center; }
.reply-to { font-size: 12px; color: #9333EA; font-weight: 600; }

.reply-close {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.reply-close:hover { background: #F3E8FF; color: #9333EA; }

.reply-text {
  font-size: 13px;
  color: #666;
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
  padding: 12px 16px 8px 16px;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #F5F5F5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 16px;
}

.toolbar-btn:hover:not(:disabled) { background: #F3E8FF; transform: scale(1.05); }
.toolbar-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 입력 영역 */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin: 0 16px 16px 16px;
  padding: 12px 16px;
  background: #F5F5F5;
  border-radius: 24px;
  transition: all 0.2s;
}

.input-area:focus-within {
  background: #FFFFFF;
  box-shadow: 0 0 0 2px #9333EA;
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
  color: #222;
}

.message-textarea::placeholder { color: #999; }
.message-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

.send-button {
  width: 44px;
  height: 44px;
  border: none;
  background: #9333EA;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) { background: #7C22CE; transform: scale(1.05); }
.send-button:disabled { background: #E2E8F0; cursor: not-allowed; }

/* 타이핑 표시 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #666;
  font-size: 12px;
}

.typing-dots { display: flex; gap: 3px; }

.dot {
  width: 5px;
  height: 5px;
  background: #9333EA;
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
  .input-area { margin: 0 12px 12px 12px; padding: 10px 14px; }
  .toolbar-btn { width: 32px; height: 32px; font-size: 14px; }
  .send-button { width: 40px; height: 40px; }
  .message-textarea { font-size: 16px; }
}
</style>