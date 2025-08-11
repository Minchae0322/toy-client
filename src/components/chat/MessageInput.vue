<template>
  <div class="message-input-container">
    <!-- 파일 미리보기 -->
    <div v-if="selectedFiles.length > 0" class="files-preview">
      <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-preview-item"
      >
        <!-- 이미지 미리보기 -->
        <div v-if="file.type.startsWith('image/')" class="image-preview">
          <img :src="file.preview" :alt="file.name" />
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <button @click="removeFile(index)" class="remove-file-btn">
            <X :size="16" />
          </button>
        </div>

        <!-- 일반 파일 미리보기 -->
        <div v-else class="file-preview">
          <div class="file-icon">
            <FileText v-if="isTextFile(file.type)" :size="20" />
            <Film v-else-if="file.type.startsWith('video/')" :size="20" />
            <Music v-else-if="file.type.startsWith('audio/')" :size="20" />
            <File v-else :size="20" />
          </div>
          <div class="file-details">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <button @click="removeFile(index)" class="remove-file-btn">
            <X :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- 메인 입력 영역 -->
    <div class="input-area">
      <div class="input-row">
        <!-- 파일 첨부 버튼 -->
        <button
            @click="openFileDialog"
            :disabled="disabled"
            class="action-btn attach-btn"
            title="파일 첨부"
        >
          <Paperclip :size="20" />
        </button>

        <!-- 이모지 버튼 -->
        <button
            @click="toggleEmojiPicker"
            :disabled="disabled"
            class="action-btn emoji-btn"
            title="이모지"
        >
          <Smile :size="20" />
        </button>

        <!-- 텍스트 입력창 -->
        <div class="text-input-wrapper">
          <textarea
              ref="textareaRef"
              v-model="inputText"
              :placeholder="placeholder"
              :disabled="disabled"
              class="text-input"
              rows="1"
              @keydown="handleKeyDown"
              @input="handleInput"
              @paste="handlePaste"
              @focus="handleFocus"
              @blur="handleBlur"
          ></textarea>

          <!-- 글자 수 제한 표시 -->
          <div v-if="showCharCount && inputText.length > 0" class="char-count">
            {{ inputText.length }}/{{ maxLength }}
          </div>
        </div>

        <!-- 음성 메시지 버튼 -->
        <button
            @mousedown="startVoiceRecord"
            @mouseup="stopVoiceRecord"
            @mouseleave="cancelVoiceRecord"
            @touchstart="startVoiceRecord"
            @touchend="stopVoiceRecord"
            :disabled="disabled"
            class="action-btn voice-btn"
            :class="{ 'recording': isRecording }"
            title="음성 메시지 (길게 누르기)"
        >
          <Mic v-if="!isRecording" :size="20" />
          <MicOff v-else :size="20" />
        </button>

        <!-- 전송 버튼 -->
        <button
            @click="handleSend"
            :disabled="!canSend || disabled"
            class="send-btn"
            :class="{ 'can-send': canSend && !disabled }"
            title="메시지 전송"
        >
          <Send :size="20" />
        </button>
      </div>

      <!-- 이모지 피커 -->
      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-categories">
          <button
              v-for="category in emojiCategories"
              :key="category.name"
              @click="activeEmojiCategory = category.name"
              :class="{ active: activeEmojiCategory === category.name }"
              class="emoji-category-btn"
          >
            {{ category.icon }}
          </button>
        </div>
        <div class="emoji-grid">
          <button
              v-for="emoji in currentEmojis"
              :key="emoji"
              @click="insertEmoji(emoji)"
              class="emoji-item"
          >
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- 음성 녹음 상태 -->
      <div v-if="isRecording" class="voice-recording">
        <div class="recording-indicator">
          <div class="recording-dot"></div>
          <span>음성 메시지 녹음 중... ({{ recordingDuration }}s)</span>
        </div>
        <div class="recording-actions">
          <button @click="cancelVoiceRecord" class="cancel-record">
            <X :size="16" />
            <span>취소</span>
          </button>
          <div class="recording-hint">
            손을 떼면 전송됩니다
          </div>
        </div>
      </div>
    </div>

    <!-- 숨겨진 파일 입력 -->
    <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        @change="handleFileSelect"
        class="hidden-file-input"
    />

    <!-- 이모지 피커 오버레이 -->
    <div
        v-if="showEmojiPicker"
        class="emoji-overlay"
        @click="showEmojiPicker = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Paperclip,
  Smile,
  Mic,
  MicOff,
  Send,
  X,
  File,
  FileText,
  Film,
  Music
} from 'lucide-vue-next'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '메시지를 입력하세요...'
  },
  maxLength: {
    type: Number,
    default: 1000
  },
  showCharCount: {
    type: Boolean,
    default: false
  },
  maxFileSize: {
    type: Number,
    default: 50 * 1024 * 1024 // 50MB
  },
  maxFiles: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits([
  'send-message',
  'typing-start',
  'typing-stop',
  'focus',
  'blur'
])

// 반응형 데이터
const inputText = ref('')
const selectedFiles = ref([])
const isRecording = ref(false)
const recordingDuration = ref(0)
const showEmojiPicker = ref(false)
const activeEmojiCategory = ref('faces')

// 참조
const textareaRef = ref(null)
const fileInputRef = ref(null)

// 타이핑 상태 관리
const typingTimer = ref(null)
const isTyping = ref(false)

// 음성 녹음 관련
const mediaRecorder = ref(null)
const audioChunks = ref([])
const recordingTimer = ref(null)

// 이모지 데이터
const emojiCategories = ref([
  {
    name: 'faces',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😶‍🌫️', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱']
  },
  {
    name: 'gestures',
    icon: '👍',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '💪', '🦾', '🖕', '✍️', '🙏', '🦶', '🦵', '🦿', '💄', '💋', '👄', '🦷', '👅', '👂', '🦻', '👃', '👣', '👁️', '👀', '🧠', '🗣️', '👤', '👥']
  },
  {
    name: 'objects',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '💤', '💢', '💣', '💥', '💦', '💨', '💫', '💬', '🗨️', '🗯️', '💭', '💮']
  }
])

// 계산된 값들
const canSend = computed(() => {
  return (inputText.value.trim().length > 0 || selectedFiles.value.length > 0) &&
      inputText.value.length <= props.maxLength
})

const currentEmojis = computed(() => {
  const category = emojiCategories.value.find(cat => cat.name === activeEmojiCategory.value)
  return category ? category.emojis : []
})

// 메서드들
const handleInput = () => {
  autoResize()

  if (inputText.value.trim() && !isTyping.value) {
    isTyping.value = true
    emit('typing-start')
  }

  // 타이핑 타이머 리셋
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  typingTimer.value = setTimeout(() => {
    if (isTyping.value) {
      isTyping.value = false
      emit('typing-stop')
    }
  }, 2000)
}

const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Shift + Enter: 줄바꿈
      return
    } else {
      // Enter: 메시지 전송
      event.preventDefault()
      handleSend()
    }
  }
}

const handleSend = () => {
  if (!canSend.value || props.disabled) return

  const messageData = {
    content: inputText.value.trim(),
    type: 'TEXT',
    files: selectedFiles.value.length > 0 ? [...selectedFiles.value] : null
  }

  // 파일이 있으면 타입을 변경
  if (selectedFiles.value.length > 0) {
    const firstFile = selectedFiles.value[0]
    if (firstFile.type.startsWith('image/')) {
      messageData.type = 'IMAGE'
    } else if (firstFile.type.startsWith('video/')) {
      messageData.type = 'VIDEO'
    } else if (firstFile.type.startsWith('audio/')) {
      messageData.type = 'AUDIO'
    } else {
      messageData.type = 'FILE'
    }
  }

  emit('send-message', messageData)

  // 입력 내용 초기화
  inputText.value = ''
  selectedFiles.value = []

  // 타이핑 상태 중지
  if (isTyping.value) {
    isTyping.value = false
    emit('typing-stop')
  }

  // 텍스트 영역 크기 리셋
  autoResize()

  // 포커스 유지
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  })
}

const autoResize = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      const newHeight = Math.min(textareaRef.value.scrollHeight, 100) // 최대 100px
      textareaRef.value.style.height = newHeight + 'px'
    }
  })
}

const handlePaste = (event) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        addFile(file)
        event.preventDefault()
        break
      }
    }
  }
}

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}

// 파일 관련 메서드
const openFileDialog = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  files.forEach(file => addFile(file))

  // 파일 입력 초기화
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const addFile = (file) => {
  // 파일 크기 검증
  if (file.size > props.maxFileSize) {
    alert(`파일 크기가 너무 큽니다. 최대 ${formatFileSize(props.maxFileSize)}까지 가능합니다.`)
    return
  }

  // 파일 개수 검증
  if (selectedFiles.value.length >= props.maxFiles) {
    alert(`최대 ${props.maxFiles}개의 파일만 첨부할 수 있습니다.`)
    return
  }

  // 미리보기 생성
  const fileData = {
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    preview: null
  }

  // 이미지인 경우 미리보기 생성
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      fileData.preview = e.target?.result
    }
    reader.readAsDataURL(file)
  }

  selectedFiles.value.push(fileData)
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isTextFile = (type) => {
  return type.includes('text/') ||
      type.includes('application/pdf') ||
      type.includes('application/msword') ||
      type.includes('application/vnd.openxml')
}

// 이모지 관련 메서드
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji) => {
  const cursorPos = textareaRef.value?.selectionStart || inputText.value.length
  const textBefore = inputText.value.substring(0, cursorPos)
  const textAfter = inputText.value.substring(cursorPos)

  inputText.value = textBefore + emoji + textAfter

  // 커서 위치 조정
  nextTick(() => {
    if (textareaRef.value) {
      const newPos = cursorPos + emoji.length
      textareaRef.value.setSelectionRange(newPos, newPos)
      textareaRef.value.focus()
    }
  })

  showEmojiPicker.value = false
}

// 음성 녹음 관련 메서드
const startVoiceRecord = async () => {
  if (props.disabled) return

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
      const audioFile = new File([audioBlob], `voice_${Date.now()}.wav`, { type: 'audio/wav' })

      emit('send-message', {
        content: '',
        type: 'AUDIO',
        files: [{ file: audioFile, name: audioFile.name, size: audioFile.size, type: audioFile.type }]
      })

      // 스트림 정리
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.value.start()
    isRecording.value = true
    recordingDuration.value = 0

    // 녹음 시간 카운터
    recordingTimer.value = setInterval(() => {
      recordingDuration.value++

      // 최대 60초로 제한
      if (recordingDuration.value >= 60) {
        stopVoiceRecord()
      }
    }, 1000)

  } catch (error) {
    console.error('음성 녹음 시작 실패:', error)
    alert('마이크에 접근할 수 없습니다. 권한을 확인해주세요.')
  }
}

const stopVoiceRecord = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false

    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }
  }
}

const cancelVoiceRecord = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false

    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }

    // 오디오 청크 초기화
    audioChunks.value = []
  }
}

// 라이프사이클
onMounted(() => {
  // 외부 클릭으로 이모지 피커 닫기
  document.addEventListener('click', (event) => {
    if (showEmojiPicker.value && !event.target.closest('.emoji-picker') && !event.target.closest('.emoji-btn')) {
      showEmojiPicker.value = false
    }
  })
})

onUnmounted(() => {
  // 타이핑 타이머 정리
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  // 녹음 타이머 정리
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
  }

  // 타이핑 상태 정리
  if (isTyping.value) {
    emit('typing-stop')
  }
})

// Watch
watch(inputText, () => {
  if (inputText.value.length === 0 && isTyping.value) {
    isTyping.value = false
    emit('typing-stop')
  }
})
</script>

<style scoped>
.message-input-container {
  background: white;
  border-top: 1px solid #e2e8f0;
  position: relative;
}

.files-preview {
  padding: 12px 16px 0;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.file-preview-item {
  position: relative;
}

.image-preview {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px;
  gap: 8px;
  max-width: 200px;
}

.image-preview img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.file-preview {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px;
  gap: 8px;
  max-width: 200px;
}

.file-icon {
  width: 32px;
  height: 32px;
  background: #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  display: block;
  font-size: 11px;
  color: #6b7280;
}

.remove-file-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.input-area {
  position: relative;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 18px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #334155;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-btn.recording {
  background: #ef4444;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.text-input-wrapper {
  flex: 1;
  position: relative;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s;
}

.text-input-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.text-input {
  width: 100%;
  min-height: 36px;
  max-height: 100px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  color: #374151;
}

.text-input::placeholder {
  color: #9ca3af;
}

.text-input:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.char-count {
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 11px;
  color: #9ca3af;
  pointer-events: none;
}

.send-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #e5e7eb;
  border-radius: 18px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-btn.can-send {
  background: #3b82f6;
  color: white;
  transform: scale(1.05);
}

.send-btn:hover.can-send {
  background: #2563eb;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 이모지 피커 */
.emoji-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 998;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 60px;
  width: 320px;
  max-height: 300px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  z-index: 999;
  overflow: hidden;
}

.emoji-categories {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px;
  gap: 4px;
}

.emoji-category-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.emoji-category-btn:hover {
  background: #e2e8f0;
}

.emoji-category-btn.active {
  background: #3b82f6;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-item:hover {
  background: #f1f5f9;
  transform: scale(1.2);
}

/* 음성 녹음 */
.voice-recording {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 14px;
}

.recording-dot {
  width: 8px;
  height: 8px;
  background: #dc2626;
  border-radius: 50%;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.recording-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cancel-record {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #dc2626;
  border-radius: 6px;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-record:hover {
  background: #fef2f2;
}

.recording-hint {
  font-size: 12px;
  color: #6b7280;
}

/* 숨겨진 파일 입력 */
.hidden-file-input {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}

/* 반응형 */
@media (max-width: 768px) {
  .input-row {
    padding: 10px 12px;
    gap: 6px;
  }

  .action-btn, .send-btn {
    width: 32px;
    height: 32px;
  }

  .text-input {
    font-size: 16px; /* iOS 줌 방지 */
  }

  .emoji-picker {
    width: calc(100vw - 24px);
    right: 12px;
    max-width: 320px;
  }

  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .files-preview {
    padding: 8px 12px 0;
  }

  .voice-recording {
    padding: 8px 12px;
  }

  .recording-hint {
    display: none;
  }
}

/* 접근성 */
.action-btn:focus,
.send-btn:focus,
.emoji-category-btn:focus,
.emoji-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 스크롤바 스타일 */
.files-preview::-webkit-scrollbar,
.emoji-grid::-webkit-scrollbar {
  width: 4px;
}

.files-preview::-webkit-scrollbar-track,
.emoji-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.files-preview::-webkit-scrollbar-thumb,
.emoji-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.files-preview::-webkit-scrollbar-thumb:hover,
.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .message-input-container {
    background: #1f2937;
    border-color: #374151;
  }

  .text-input-wrapper {
    background: #374151;
    border-color: #4b5563;
  }

  .text-input {
    color: #f9fafb;
  }

  .text-input::placeholder {
    color: #9ca3af;
  }

  .action-btn {
    background: #374151;
    color: #9ca3af;
  }

  .action-btn:hover:not(:disabled) {
    background: #4b5563;
    color: #f9fafb;
  }

  .emoji-picker {
    background: #374151;
    border-color: #4b5563;
  }

  .emoji-categories {
    background: #1f2937;
    border-color: #4b5563;
  }

  .emoji-category-btn:hover {
    background: #4b5563;
  }

  .emoji-item:hover {
    background: #4b5563;
  }

  .file-preview,
  .image-preview {
    background: #374151;
  }

  .file-icon {
    background: #4b5563;
    color: #9ca3af;
  }

  .file-name {
    color: #f9fafb;
  }

  .file-size {
    color: #9ca3af;
  }

  .voice-recording {
    background: #7f1d1d;
    border-color: #b91c1c;
  }

  .cancel-record {
    background: #374151;
    border-color: #ef4444;
    color: #ef4444;
  }

  .cancel-record:hover {
    background: #7f1d1d;
  }
}

/* 애니메이션 */
.files-preview {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 200px;
    opacity: 1;
  }
}

.emoji-picker {
  animation: fadeInUp 0.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.voice-recording {
  animation: slideDown 0.3s ease-out;
}
</style>