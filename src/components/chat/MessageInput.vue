<template>
  <div class="message-input-container">
    <div class="input-toolbar">
      <button class="toolbar-btn" @click="toggleEmojiPicker">
        😊
      </button>
      <button class="toolbar-btn" @click="openFileSelector">
        📎
      </button>
    </div>

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
          class="message-textarea"
          rows="1"
      ></textarea>

      <button
          class="send-button"
          :disabled="!canSend || disabled"
          @click="sendMessage"
      >
        <Send :size="20" />
      </button>
    </div>

    <input
        ref="fileInput"
        type="file"
        style="display: none"
        @change="handleFileSelect"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { Send } from 'lucide-vue-next'

const props = defineProps({
  placeholder: {
    type: String,
    default: '메시지를 입력하세요...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send-message', 'typing-start', 'typing-stop'])

const messageText = ref('')
const textInput = ref(null)
const fileInput = ref(null)
const isTyping = ref(false)

const canSend = computed(() => {
  return messageText.value.trim().length > 0
})

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (canSend.value) {
      sendMessage()
    }
  }
}

const handleInput = () => {
  autoResize()

  if (!isTyping.value && messageText.value.trim()) {
    isTyping.value = true
    emit('typing-start')
  } else if (isTyping.value && !messageText.value.trim()) {
    isTyping.value = false
    emit('typing-stop')
  }
}

const handleFocus = () => {
  if (messageText.value.trim()) {
    emit('typing-start')
    isTyping.value = true
  }
}

const handleBlur = () => {
  if (isTyping.value) {
    emit('typing-stop')
    isTyping.value = false
  }
}

const autoResize = async () => {
  await nextTick()
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    textInput.value.style.height = Math.min(textInput.value.scrollHeight, 120) + 'px'
  }
}

const sendMessage = () => {
  if (!canSend.value || props.disabled) return

  const content = messageText.value.trim()

  emit('send-message', {
    content,
    type: 'TEXT'
  })

  messageText.value = ''

  if (isTyping.value) {
    emit('typing-stop')
    isTyping.value = false
  }

  autoResize()
}

const toggleEmojiPicker = () => {
  // 이모지 피커 구현
  console.log('이모지 피커 토글')
}

const openFileSelector = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 파일 처리 로직
    console.log('파일 선택:', file)

    emit('send-message', {
      content: file.name,
      type: getFileType(file),
      file: file
    })
  }

  // 파일 입력 초기화
  event.target.value = ''
}

const getFileType = (file) => {
  if (file.type.startsWith('image/')) return 'IMAGE'
  if (file.type.startsWith('video/')) return 'VIDEO'
  if (file.type.startsWith('audio/')) return 'AUDIO'
  return 'FILE'
}
</script>

<style scoped>
.message-input-container {
  padding: 16px;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.input-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
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
}

.toolbar-btn:hover {
  background: #e2e8f0;
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
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
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .message-input-container {
    padding: 12px;
  }

  .input-area {
    padding: 8px;
  }
}
</style>