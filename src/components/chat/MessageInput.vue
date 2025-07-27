<!-- components/MessageInput.vue -->
<template>
  <div class="message-input-container">
    <!-- 답장 모드 표시 -->
    <div v-if="replyMode" class="reply-preview">
      <div class="reply-info">
        <span class="reply-to">{{ replyMessage.senderName }}님에게 답장</span>
        <p class="reply-content">{{ getPreviewText(replyMessage) }}</p>
      </div>
      <button class="reply-cancel" @click="cancelReply">✕</button>
    </div>

    <!-- 파일 업로드 프리뷰 -->
    <div v-if="uploadingFiles.length > 0" class="file-preview">
      <div class="file-list">
        <div v-for="(file, index) in uploadingFiles" :key="index" class="file-item">
          <div v-if="isImageFile(file.file)" class="image-preview">
            <img :src="file.preview" :alt="file.name" class="preview-image">
            <div v-if="file.uploading" class="upload-overlay">
              <div class="spinner-small"></div>
              <span>{{ file.progress }}%</span>
            </div>
          </div>
          <div v-else class="file-info">
            <span class="file-icon">{{ getFileIcon(file.name) }}</span>
            <div class="file-details">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.file.size) }}</span>
            </div>
            <div v-if="file.uploading" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ file.progress }}%</span>
            </div>
          </div>
          <button class="file-remove" @click="removeFile(index)">✕</button>
        </div>
      </div>
    </div>

    <!-- 메인 입력 영역 -->
    <div class="input-wrapper">
      <button
          class="attachment-button"
          @click="toggleAttachmentMenu"
          :disabled="disabled"
      >
        📎
      </button>

      <div class="input-field">
        <textarea
            ref="textInput"
            v-model="inputText"
            placeholder="메시지를 입력하세요..."
            @keydown="handleKeydown"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            @paste="handlePaste"
            rows="1"
            class="text-input"
            :disabled="disabled"
        ></textarea>

        <!-- 이모지 버튼 -->
        <button
            class="emoji-button"
            @click="toggleEmojiPicker"
            :disabled="disabled"
        >
          😊
        </button>
      </div>

      <button
          class="send-button"
          @click="sendMessage"
          :disabled="!canSend || disabled"
          :class="{ 'can-send': canSend }"
      >
        <span v-if="disabled">⏳</span>
        <span v-else-if="canSend">🚀</span>
        <span v-else>💬</span>
      </button>
    </div>

    <!-- 첨부파일 메뉴 -->
    <Transition name="slide-up">
      <div v-if="showAttachmentMenu" class="attachment-menu">
        <button @click="selectFile('image')" class="menu-item">
          <span class="menu-icon">📷</span>
          <span>사진</span>
        </button>
        <button @click="selectFile('video')" class="menu-item">
          <span class="menu-icon">🎥</span>
          <span>동영상</span>
        </button>
        <button @click="selectFile('file')" class="menu-item">
          <span class="menu-icon">📁</span>
          <span>파일</span>
        </button>
        <button @click="selectLocation" class="menu-item">
          <span class="menu-icon">📍</span>
          <span>위치</span>
        </button>
      </div>
    </Transition>

    <!-- 이모지 피커 -->
    <Transition name="fade">
      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-categories">
          <button
              v-for="category in emojiCategories"
              :key="category.name"
              @click="selectedEmojiCategory = category.name"
              :class="{ active: selectedEmojiCategory === category.name }"
              class="emoji-category"
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
    </Transition>

    <!-- 숨겨진 파일 입력 -->
    <input
        ref="fileInput"
        type="file"
        style="display: none"
        @change="handleFileSelect"
        :accept="fileAccept"
        multiple
    >
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send-message', 'typing-start', 'typing-stop'])

// 기본 상태
const inputText = ref('')
const showAttachmentMenu = ref(false)
const showEmojiPicker = ref(false)
const selectedEmojiCategory = ref('smileys')
const textInput = ref(null)
const fileInput = ref(null)
const fileAccept = ref('*/*')

// 답장 모드
const replyMode = ref(false)
const replyMessage = ref(null)

// 파일 업로드
const uploadingFiles = ref([])

// 타이핑 관련
const isTyping = ref(false)
const typingTimer = ref(null)

// 전송 가능 여부
const canSend = computed(() => {
  return (inputText.value.trim().length > 0 || uploadingFiles.value.length > 0) && !props.disabled
})

// 이모지 카테고리와 데이터
const emojiCategories = [
  {
    name: 'smileys',
    icon: '😊',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥']
  },
  {
    name: 'people',
    icon: '👋',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄']
  },
  {
    name: 'nature',
    icon: '🌱',
    emojis: ['🌱', '🌿', '🍀', '🍃', '🍂', '🍁', '🌾', '🌴', '🌳', '🌲', '🌵', '🌷', '🌸', '🌹', '🥀', '🌺', '🌻', '🌼', '🌙', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '⭐', '🌟', '💫', '✨', '☄', '☀', '🌤', '⛅', '🌦', '🌧', '⛈', '🌩', '🌨', '❄', '☃', '⛄', '🌬', '💨', '🌪', '🌫', '☁']
  },
  {
    name: 'objects',
    icon: '📱',
    emojis: ['📱', '📲', '💻', '🖥', '🖨', '⌨', '🖱', '🖲', '💽', '💾', '💿', '📀', '🎥', '🎬', '📹', '📷', '📸', '📻', '🎙', '🎚', '🎛', '🎧', '📢', '📣', '📯', '🔔', '🔕', '🎵', '🎶', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '📝', '✏', '🖍', '🖊', '🖋', '✒', '📏', '📐', '📌', '📍', '🧭', '🗺']
  }
]

// 현재 선택된 카테고리의 이모지들
const currentEmojis = computed(() => {
  const category = emojiCategories.find(cat => cat.name === selectedEmojiCategory.value)
  return category ? category.emojis : []
})

// 메시지 전송
const sendMessage = async () => {
  if (!canSend.value) return

  try {
    // 텍스트 메시지가 있는 경우
    if (inputText.value.trim()) {
      const messageData = {
        content: inputText.value.trim(),
        type: 'TEXT'
      }

      // 답장 모드인 경우
      if (replyMode.value && replyMessage.value) {
        messageData.type = 'REPLY'
        messageData.metadata = {
          originalMessageId: replyMessage.value.messageId,
          originalSender: replyMessage.value.senderName,
          originalContent: getPreviewText(replyMessage.value)
        }
      }

      emit('send-message', messageData)
    }

    // 파일이 있는 경우
    if (uploadingFiles.value.length > 0) {
      for (const fileItem of uploadingFiles.value) {
        if (!fileItem.uploading) {
          await sendFileMessage(fileItem)
        }
      }
    }

    // 입력 초기화
    resetInput()

  } catch (error) {
    console.error('메시지 전송 실패:', error)
    alert('메시지 전송에 실패했습니다.')
  }
}

// 파일 메시지 전송
const sendFileMessage = async (fileItem) => {
  try {
    fileItem.uploading = true
    fileItem.progress = 0

    const messageData = {
      file: fileItem.file,
      type: getFileMessageType(fileItem.file),
      metadata: {
        fileName: fileItem.name,
        fileSize: fileItem.file.size,
        mimeType: fileItem.file.type
      }
    }

    // 파일 업로드 진행률 시뮬레이션 (실제로는 API에서 제공)
    const progressInterval = setInterval(() => {
      if (fileItem.progress < 90) {
        fileItem.progress += Math.random() * 10
      }
    }, 100)

    emit('send-message', messageData)

    // 업로드 완료
    clearInterval(progressInterval)
    fileItem.progress = 100
    fileItem.uploading = false

  } catch (error) {
    fileItem.uploading = false
    fileItem.progress = 0
    console.error('파일 전송 실패:', error)
    throw error
  }
}

// 파일 메시지 타입 결정
const getFileMessageType = (file) => {
  if (file.type.startsWith('image/')) return 'IMAGE'
  if (file.type.startsWith('video/')) return 'VIDEO'
  return 'FILE'
}

// 입력 초기화
const resetInput = () => {
  inputText.value = ''
  uploadingFiles.value = []
  replyMode.value = false
  replyMessage.value = null
  showAttachmentMenu.value = false
  showEmojiPicker.value = false
  autoResize()
  stopTyping()
}

// 키보드 이벤트 처리
const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  } else if (event.key === 'Escape') {
    handleEscapeKey()
  }
}

const handleEscapeKey = () => {
  if (replyMode.value) {
    cancelReply()
  } else if (showAttachmentMenu.value) {
    showAttachmentMenu.value = false
  } else if (showEmojiPicker.value) {
    showEmojiPicker.value = false
  }
}

// 입력 이벤트 처리
const handleInput = () => {
  autoResize()
  handleTyping()
}

// 포커스/블러 처리
const handleFocus = () => {
  closeAllMenus()
}

const handleBlur = () => {
  stopTyping()
}

// 붙여넣기 처리
const handlePaste = (event) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file) {
        addFile(file)
      }
      break
    }
  }
}

// 자동 크기 조정
const autoResize = async () => {
  await nextTick()
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    const newHeight = Math.min(textInput.value.scrollHeight, 120)
    textInput.value.style.height = newHeight + 'px'
  }
}

// 타이핑 상태 처리
const handleTyping = () => {
  if (!isTyping.value && inputText.value.trim()) {
    isTyping.value = true
    emit('typing-start')
  }

  // 타이핑 타이머 리셋
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  typingTimer.value = setTimeout(() => {
    stopTyping()
  }, 2000)
}

const stopTyping = () => {
  if (isTyping.value) {
    isTyping.value = false
    emit('typing-stop')
  }

  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
}

// 메뉴 토글 함수들
const toggleAttachmentMenu = () => {
  showAttachmentMenu.value = !showAttachmentMenu.value
  if (showAttachmentMenu.value) {
    showEmojiPicker.value = false
  }
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
  if (showEmojiPicker.value) {
    showAttachmentMenu.value = false
  }
}

const closeAllMenus = () => {
  showAttachmentMenu.value = false
  showEmojiPicker.value = false
}

// 파일 관련 함수들
const selectFile = (type) => {
  switch (type) {
    case 'image':
      fileAccept.value = 'image/*'
      break
    case 'video':
      fileAccept.value = 'video/*'
      break
    default:
      fileAccept.value = '*/*'
  }

  fileInput.value?.click()
  showAttachmentMenu.value = false
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  files.forEach(file => addFile(file))
  event.target.value = '' // 같은 파일 선택 가능하도록 초기화
}

const addFile = (file) => {
  // 파일 크기 제한 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert('파일 크기가 10MB를 초과합니다.')
    return
  }

  const fileItem = {
    file: file,
    name: file.name,
    uploading: false,
    progress: 0,
    preview: null
  }

  // 이미지 파일인 경우 미리보기 생성
  if (isImageFile(file)) {
    const reader = new FileReader()
    reader.onload = (e) => {
      fileItem.preview = e.target?.result
    }
    reader.readAsDataURL(file)
  }

  uploadingFiles.value.push(fileItem)
}

const removeFile = (index) => {
  uploadingFiles.value.splice(index, 1)
}

const isImageFile = (file) => {
  return file.type?.startsWith('image/')
}

// 답장 관련 함수들
const setReplyMode = (message) => {
  replyMode.value = true
  replyMessage.value = message
  textInput.value?.focus()
}

const cancelReply = () => {
  replyMode.value = false
  replyMessage.value = null
}

const getPreviewText = (message) => {
  if (!message) return ''

  switch (message.type) {
    case 'IMAGE':
      return '📷 사진'
    case 'VIDEO':
      return '🎥 동영상'
    case 'FILE':
      return `📎 ${message.metadata?.fileName || '파일'}`
    case 'LOCATION':
      return '📍 위치'
    default:
      return message.content || ''
  }
}

// 이모지 관련 함수들
const insertEmoji = (emoji) => {
  const cursorPos = textInput.value?.selectionStart || inputText.value.length
  const textBefore = inputText.value.substring(0, cursorPos)
  const textAfter = inputText.value.substring(cursorPos)

  inputText.value = textBefore + emoji + textAfter

  nextTick(() => {
    if (textInput.value) {
      textInput.value.focus()
      const newCursorPos = cursorPos + emoji.length
      textInput.value.setSelectionRange(newCursorPos, newCursorPos)
    }
  })

  showEmojiPicker.value = false
  handleTyping()
}

// 위치 공유
const selectLocation = () => {
  if ('geolocation' in navigator) {
    showAttachmentMenu.value = false

    navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // 역지오코딩으로 주소 가져오기 (선택사항)
            const address = await getAddressFromCoords(latitude, longitude)

            emit('send-message', {
              type: 'LOCATION',
              content: `위치: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              metadata: {
                latitude,
                longitude,
                address: address || '현재 위치'
              }
            })
          } catch (error) {
            console.error('위치 전송 실패:', error)
          }
        },
        (error) => {
          console.error('위치 정보 가져오기 실패:', error)
          let message = '위치 정보를 가져올 수 없습니다.'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = '위치 권한이 거부되었습니다.'
              break
            case error.POSITION_UNAVAILABLE:
              message = '위치 정보를 사용할 수 없습니다.'
              break
            case error.TIMEOUT:
              message = '위치 정보 요청 시간이 초과되었습니다.'
              break
          }

          alert(message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
    )
  } else {
    alert('이 브라우저는 위치 서비스를 지원하지 않습니다.')
    showAttachmentMenu.value = false
  }
}

// 좌표에서 주소 가져오기 (선택사항)
const getAddressFromCoords = async (lat, lng) => {
  try {
    // 실제 구현에서는 Google Maps API나 카카오 맵 API 사용
    const response = await fetch(
        `https://api.example.com/geocode?lat=${lat}&lng=${lng}`
    )
    const data = await response.json()
    return data.address
  } catch (error) {
    console.warn('주소 변환 실패:', error)
    return null
  }
}

// 유틸리티 함수들
const formatFileSize = (bytes) => {
  if (!bytes) return ''

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const getFileIcon = (fileName) => {
  if (!fileName) return '📄'

  const extension = fileName.split('.').pop()?.toLowerCase()

  const iconMap = {
    // 문서
    pdf: '📕',
    doc: '📘', docx: '📘',
    xls: '📗', xlsx: '📗',
    ppt: '📙', pptx: '📙',
    txt: '📄',

    // 압축
    zip: '🗜️', rar: '🗜️', '7z': '🗜️',

    // 오디오
    mp3: '🎵', wav: '🎵', flac: '🎵',

    // 비디오
    mp4: '🎬', avi: '🎬', mov: '🎬',

    // 이미지
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️'
  }

  return iconMap[extension] || '📄'
}

// 외부 클릭 처리
const handleClickOutside = (event) => {
  const inputContainer = event.target.closest('.message-input-container')
  if (!inputContainer) {
    closeAllMenus()
  }
}

// 외부에서 호출 가능한 함수들
defineExpose({
  setReplyMode,
  focus: () => textInput.value?.focus(),
  insertText: (text) => {
    inputText.value += text
    handleTyping()
  }
})

// 라이프사이클
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  stopTyping()
})

// 입력 감시
watch(() => props.disabled, (newVal) => {
  if (newVal) {
    closeAllMenus()
    stopTyping()
  }
})
</script>

<style scoped>
.message-input-container {
  position: relative;
  background: white;
  border-top: 1px solid #e2e8f0;
  z-index: 1;
}

.reply-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.reply-info {
  flex: 1;
  min-width: 0;
}

.reply-to {
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
}

.reply-content {
  font-size: 14px;
  color: #64748b;
  margin: 2px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reply-cancel {
  width: 24px;
  height: 24px;
  border: none;
  background: #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.reply-cancel:hover {
  background: #cbd5e1;
}

.file-preview {
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.image-preview {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  gap: 4px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  font-size: 24px;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.progress-bar {
  width: 50px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #667eea;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: #64748b;
}

.file-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.file-remove:hover {
  background: #fecaca;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: white;
}

.attachment-button {
  width: 36px;
  height: 36px;
  border: none;
  background: #f8fafc;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 16px;
}

.attachment-button:hover:not(:disabled) {
  background: #e2e8f0;
  transform: scale(1.05);
}

.attachment-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-field {
  flex: 1;
  position: relative;
  background: #f8fafc;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s;
  display: flex;
  align-items: flex-end;
}

.input-field:focus-within {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.text-input {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  padding: 12px 16px;
  max-height: 120px;
  overflow-y: auto;
  min-height: 20px;
}

.text-input::placeholder {
  color: #94a3b8;
}

.text-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.emoji-button {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 16px;
  margin-right: 4px;
}

.emoji-button:hover:not(:disabled) {
  background: #e2e8f0;
}

.emoji-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button {
  width: 44px;
  height: 44px;
  border: none;
  background: #e2e8f0;
  color: #64748b;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 18px;
  flex-shrink: 0;
}

.send-button.can-send {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: scale(1);
}

.send-button.can-send:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

.attachment-menu {
  position: absolute;
  bottom: 80px;
  left: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  padding: 8px;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  z-index: 10;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  white-space: nowrap;
}

.menu-item:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.emoji-picker {
  position: absolute;
  bottom: 80px;
  right: 20px;
  width: 300px;
  height: 250px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.emoji-categories {
  display: flex;
  padding: 8px;
  gap: 4px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.emoji-category {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
}

.emoji-category:hover {
  background: #e2e8f0;
}

.emoji-category.active {
  background: #667eea;
  color: white;
}

.emoji-grid {
  flex: 1;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  overflow-y: auto;
  align-content: start;
}

.emoji-item {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
}

.emoji-item:hover {
  background: #f1f5f9;
  transform: scale(1.2);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 트랜지션 */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .input-wrapper {
    padding: 12px 16px;
    gap: 8px;
  }

  .attachment-button, .emoji-button {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .send-button {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .text-input {
    padding: 10px 12px;
    font-size: 16px; /* iOS 줌 방지 */
  }

  .emoji-picker {
    width: calc(100vw - 40px);
    max-width: 300px;
    right: 20px;
  }

  .attachment-menu {
    left: 16px;
    bottom: 70px;
  }

  .file-item {
    padding: 10px;
  }

  .image-preview {
    width: 50px;
    height: 50px;
  }
}

/* 반응형 디자인 (태블릿) */
@media (max-width: 1024px) and (min-width: 769px) {
  .emoji-picker {
    width: 280px;
    height: 220px;
  }

  .emoji-grid {
    grid-template-columns: repeat(7, 1fr);
  }
}

/* 스크롤바 스타일링 */
.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.text-input::-webkit-scrollbar {
  width: 4px;
}

.text-input::-webkit-scrollbar-track {
  background: transparent;
}

.text-input::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .message-input-container {
    background: #1e293b;
    border-top-color: #374151;
  }

  .reply-preview, .file-preview {
    background: #374151;
    border-bottom-color: #4b5563;
  }

  .reply-to {
    color: #60a5fa;
  }

  .reply-content {
    color: #9ca3af;
  }

  .reply-cancel {
    background: #4b5563;
    color: #f9fafb;
  }

  .reply-cancel:hover {
    background: #6b7280;
  }

  .file-item {
    background: #374151;
  }

  .file-name {
    color: #f9fafb;
  }

  .file-size {
    color: #9ca3af;
  }

  .input-wrapper {
    background: #1e293b;
  }

  .attachment-button {
    background: #374151;
    color: #f9fafb;
  }

  .attachment-button:hover:not(:disabled) {
    background: #4b5563;
  }

  .input-field {
    background: #374151;
    border-color: #4b5563;
  }

  .input-field:focus-within {
    border-color: #60a5fa;
    background: #374151;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }

  .text-input {
    color: #f9fafb;
  }

  .text-input::placeholder {
    color: #6b7280;
  }

  .emoji-button {
    color: #f9fafb;
  }

  .emoji-button:hover:not(:disabled) {
    background: #4b5563;
  }

  .attachment-menu, .emoji-picker {
    background: #374151;
    border: 1px solid #4b5563;
  }

  .emoji-categories {
    background: #4b5563;
    border-bottom-color: #6b7280;
  }

  .emoji-category:hover {
    background: #6b7280;
  }

  .emoji-category.active {
    background: #60a5fa;
  }

  .emoji-item:hover {
    background: #4b5563;
  }

  .menu-item {
    color: #f9fafb;
  }

  .menu-item:hover {
    background: #4b5563;
  }
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .input-field {
    border-width: 3px;
  }

  .attachment-button, .emoji-button, .send-button {
    border: 2px solid currentColor;
  }

  .emoji-category.active {
    border: 2px solid white;
  }
}

/* 애니메이션 감소 모드 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .emoji-item:hover {
    transform: none;
  }

  .menu-item:hover {
    transform: none;
  }
}

/* 포커스 접근성 개선 */
.attachment-button:focus-visible,
.emoji-button:focus-visible,
.send-button:focus-visible,
.emoji-category:focus-visible,
.emoji-item:focus-visible,
.menu-item:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.text-input:focus-visible {
  outline: none; /* input-field의 focus-within 스타일 사용 */
}

/* 터치 디바이스 최적화 */
@media (hover: none) and (pointer: coarse) {
  .attachment-button,
  .emoji-button,
  .send-button,
  .emoji-category,
  .emoji-item,
  .menu-item {
    min-height: 44px; /* 터치 타겟 최소 크기 */
    min-width: 44px;
  }

  .emoji-item {
    font-size: 20px; /* 터치 디바이스에서 더 큰 이모지 */
  }
}
</style>