<!-- components/ChatMessage.vue -->
<template>
  <div :class="['message', { 'message-mine': isMine, 'message-other': !isMine, 'message-system': message.isSystem }]">
    <!-- 시스템 메시지 -->
    <div v-if="message.isSystem" class="system-message">
      <span class="system-icon">ℹ️</span>
      <span class="system-text">{{ message.content }}</span>
    </div>

    <!-- 일반 메시지 -->
    <template v-else>
      <!-- 상대방 메시지의 아바타 -->
      <div v-if="!isMine && showSender" class="message-avatar">
        <img :src="senderAvatar" :alt="senderName" class="avatar">
      </div>

      <div class="message-content">
        <!-- 발신자 이름 (상대방 메시지이고 표시해야 할 때만) -->
        <div v-if="!isMine && showSender" class="message-sender">{{ senderName }}</div>

        <div :class="['message-bubble', { 'message-failed': message.status === 'FAILED' }]">
          <!-- 텍스트 메시지 -->
          <div v-if="message.type === 'TEXT'" class="message-text">
            {{ message.content }}
          </div>

          <!-- 이미지 메시지 -->
          <div v-else-if="message.type === 'IMAGE'" class="message-image" @click="openImageViewer">
            <img :src="message.content" alt="이미지" class="image-content" loading="lazy">
            <div v-if="message.status === 'SENDING'" class="image-overlay">
              <div class="spinner-small"></div>
            </div>
          </div>

          <!-- 동영상 메시지 -->
          <div v-else-if="message.type === 'VIDEO'" class="message-video">
            <video :src="message.content" class="video-content" controls>
              Your browser does not support the video tag.
            </video>
          </div>

          <!-- 파일 메시지 -->
          <div v-else-if="message.type === 'FILE'" class="message-file" @click="downloadFile">
            <div class="file-icon">{{ getFileIcon(message.metadata?.fileName) }}</div>
            <div class="file-info">
              <div class="file-name">{{ message.metadata?.fileName || '파일' }}</div>
              <div class="file-size">{{ formatFileSize(message.metadata?.fileSize) }}</div>
            </div>
            <div class="file-download">⬇️</div>
          </div>

          <!-- 위치 메시지 -->
          <div v-else-if="message.type === 'LOCATION'" class="message-location" @click="openMap">
            <div class="location-icon">📍</div>
            <div class="location-info">
              <div class="location-title">위치 공유</div>
              <div class="location-address">{{ message.metadata?.address || '위치 정보' }}</div>
            </div>
          </div>

          <!-- 답장 메시지 -->
          <div v-else-if="message.type === 'REPLY'" class="message-reply">
            <div class="reply-original" @click="scrollToOriginal">
              <div class="reply-line"></div>
              <div class="reply-content">
                <div class="reply-sender">{{ message.metadata?.originalSender }}</div>
                <div class="reply-text">{{ message.metadata?.originalContent }}</div>
              </div>
            </div>
            <div class="reply-text">{{ message.content }}</div>
          </div>

          <!-- 메시지 상태 표시 -->
          <div v-if="isMine" class="message-status">
            <span v-if="message.status === 'SENDING'" class="status-sending">⏳</span>
            <span v-else-if="message.status === 'FAILED'" class="status-failed">❌</span>
            <span v-else-if="message.status === 'SENT'" class="status-sent">✓</span>
            <span v-else-if="message.status === 'DELIVERED'" class="status-delivered">✓✓</span>
            <span v-else-if="message.status === 'READ'" class="status-read">✓✓</span>
          </div>
        </div>

        <!-- 메시지 시간 -->
        <div class="message-time">
          {{ formatTime(message.createdAt) }}
          <span v-if="message.updatedAt && message.updatedAt !== message.createdAt" class="edited-indicator">
            (수정됨)
          </span>
        </div>
      </div>

      <!-- 메시지 액션 버튼들 -->
      <div v-if="showActions" class="message-actions">
        <button @click="replyToMessage" title="답장">↩️</button>
        <button @click="copyMessage" title="복사">📋</button>
        <button v-if="isMine" @click="editMessage" title="수정">✏️</button>
        <button v-if="isMine" @click="deleteMessage" title="삭제">🗑️</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isMine: {
    type: Boolean,
    default: false
  },
  showSender: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['message-click', 'reply', 'edit', 'delete'])

const showActions = ref(false)
const longPressTimer = ref(null)

// 계산된 속성들
const senderName = computed(() => {
  return props.message.senderName || `사용자${props.message.senderId}`
})

const senderAvatar = computed(() => {
  return props.message.senderAvatar ||
      `https://via.placeholder.com/32/667eea/FFFFFF?text=${senderName.value.charAt(0)}`
})

// 시간 포맷팅
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // 오늘
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } else if (diffDays === 1) {
    // 어제
    return '어제 ' + date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } else {
    // 그 이전
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
}

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const kb = bytes / 1024
  const mb = kb / 1024
  const gb = mb / 1024

  if (gb >= 1) return `${gb.toFixed(1)}GB`
  if (mb >= 1) return `${mb.toFixed(1)}MB`
  return `${kb.toFixed(1)}KB`
}

// 파일 아이콘 가져오기
const getFileIcon = (fileName) => {
  if (!fileName) return '📄'

  const extension = fileName.split('.').pop()?.toLowerCase()

  const iconMap = {
    pdf: '📕',
    doc: '📘', docx: '📘',
    xls: '📗', xlsx: '📗',
    ppt: '📙', pptx: '📙',
    txt: '📄',
    zip: '🗜️', rar: '🗜️',
    mp3: '🎵', wav: '🎵',
    mp4: '🎬', avi: '🎬',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️'
  }

  return iconMap[extension] || '📄'
}

// 메시지 액션들
const replyToMessage = () => {
  emit('reply', props.message)
  showActions.value = false
}

const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    // 토스트 메시지 표시 (실제 구현에서)
    console.log('메시지가 복사되었습니다')
  } catch (error) {
    console.error('복사 실패:', error)
  }
  showActions.value = false
}

const editMessage = () => {
  emit('edit', props.message)
  showActions.value = false
}

const deleteMessage = () => {
  if (confirm('메시지를 삭제하시겠습니까?')) {
    emit('delete', props.message)
  }
  showActions.value = false
}

// 미디어 관련 액션들
const openImageViewer = () => {
  // 이미지 뷰어 열기
  console.log('이미지 뷰어 열기:', props.message.content)
}

const downloadFile = () => {
  // 파일 다운로드
  const link = document.createElement('a')
  link.href = props.message.content
  link.download = props.message.metadata?.fileName || 'file'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const openMap = () => {
  // 지도 열기
  if (props.message.metadata?.latitude && props.message.metadata?.longitude) {
    const url = `https://maps.google.com/?q=${props.message.metadata.latitude},${props.message.metadata.longitude}`
    window.open(url, '_blank')
  }
}

const scrollToOriginal = () => {
  // 원본 메시지로 스크롤
  console.log('원본 메시지로 이동:', props.message.metadata?.originalMessageId)
}

// 터치 이벤트 처리 (모바일)
const handleTouchStart = () => {
  longPressTimer.value = setTimeout(() => {
    showActions.value = true
  }, 500) // 0.5초 롱프레스
}

const handleTouchEnd = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

// 마우스 이벤트 처리 (데스크톱)
const handleContextMenu = (event) => {
  event.preventDefault()
  showActions.value = !showActions.value
}

// 외부 클릭 시 액션 메뉴 닫기
const handleClickOutside = (event) => {
  if (showActions.value && !event.target.closest('.message')) {
    showActions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }
})
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 16px;
  max-width: 70%;
  position: relative;
}

.message-mine {
  align-self: flex-end;
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-other {
  align-self: flex-start;
}

.message-system {
  align-self: center;
  max-width: 80%;
  margin: 8px auto;
}

.system-message {
  color: #64748b;
  font-size: 14px;
  text-align: center;
}

.system-icon {
  font-size: 16px;
}

.system-text {
  font-style: italic;
}

.message-avatar {
  margin: 0 8px;
  align-self: flex-end;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.message-mine .message-content {
  align-items: flex-end;
}

.message-sender {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
}

.message-bubble {
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  word-break: break-word;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.message-bubble:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.message-mine .message-bubble {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.message-failed {
  background: #fee2e2 !important;
  border: 1px solid #fecaca;
  color: #dc2626 !important;
}

.message-text {
  line-height: 1.4;
  white-space: pre-wrap;
}

.message-image {
  position: relative;
  cursor: pointer;
}

.image-content {
  max-width: 250px;
  max-height: 300px;
  border-radius: 12px;
  object-fit: cover;
  width: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.message-video {
  max-width: 300px;
}

.video-content {
  width: 100%;
  border-radius: 12px;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.message-file:hover {
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
}

.message-mine .message-file:hover {
  background: rgba(255,255,255,0.1);
}

.file-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  opacity: 0.7;
}

.file-download {
  font-size: 16px;
  opacity: 0.7;
}

.message-location {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.2s;
}

.message-location:hover {
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
}

.location-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.location-info {
  flex: 1;
}

.location-title {
  font-weight: 500;
  font-size: 14px;
}

.location-address {
  font-size: 12px;
  opacity: 0.7;
}

.message-reply {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-original {
  border-left: 3px solid #667eea;
  padding-left: 12px;
  background: rgba(102, 126, 234, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.reply-original:hover {
  background: rgba(102, 126, 234, 0.15);
}

.message-mine .reply-original {
  border-left-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.1);
}

.message-mine .reply-original:hover {
  background: rgba(255,255,255,0.15);
}

.reply-line {
  width: 3px;
  background: #667eea;
  margin-right: 8px;
}

.reply-content {
  flex: 1;
}

.reply-sender {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
}

.reply-text {
  font-size: 13px;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-status {
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 12px;
}

.status-sending {
  color: #94a3b8;
}

.status-failed {
  color: #dc2626;
}

.status-sent {
  color: #94a3b8;
}

.status-delivered {
  color: #06b6d4;
}

.status-read {
  color: #10b981;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  text-align: right;
}

.message-mine .message-time {
  text-align: left;
}

.edited-indicator {
  font-style: italic;
  opacity: 0.7;
}

.message-actions {
  position: absolute;
  top: -40px;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  gap: 4px;
  padding: 8px;
  z-index: 10;
}

.message-mine .message-actions {
  right: auto;
  left: 0;
}

.message-actions button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}

.message-actions button:hover {
  background: #f1f5f9;
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

/* 모바일 최적화 */
@media (max-width: 768px) {
  .message {
    max-width: 85%;
  }

  .message-bubble {
    padding: 10px 14px;
  }

  .image-content {
    max-width: 200px;
    max-height: 250px;
  }

  .message-video {
    max-width: 250px;
  }

  .message-file {
    min-width: 180px;
  }

  .message-location {
    min-width: 180px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .message-bubble {
    background: #374151;
    color: #f9fafb;
  }

  .message-sender {
    color: #9ca3af;
  }

  .message-time {
    color: #6b7280;
  }

  .system-message {
    background: #374151;
    color: #9ca3af;
  }

  .message-actions {
    background: #374151;
  }

  .message-actions button:hover {
    background: #4b5563;
  }
}
</style>