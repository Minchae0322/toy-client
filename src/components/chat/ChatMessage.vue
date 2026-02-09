<template>
  <!-- 🔒 XSS 방어: 모든 사용자 입력은 sanitize 처리됨 -->
  <div class="chat-message" :class="{ 'is-mine': isMine }">
    <div v-if="showSender && !isMine" class="message-sender">
      {{ sanitizedSenderName }}
    </div>

    <div class="message-bubble" :class="messageTypeClass">
      <div class="message-content">
        <!-- 🔒 TEXT: sanitizeText로 HTML 제거 -->
        <template v-if="message.type === 'TEXT'">
          {{ sanitizedContent }}
        </template>

        <!-- 🔒 IMAGE: sanitizeUrl로 위험한 프로토콜 차단 -->
        <template v-else-if="message.type === 'IMAGE'">
          <img v-if="sanitizedImageUrl" :src="sanitizedImageUrl" alt="이미지" class="message-image" />
          <span v-else class="image-error">이미지를 불러올 수 없습니다</span>
        </template>

        <!-- 🔒 FILE: sanitizeFilename으로 경로 탐색 방지 -->
        <template v-else-if="message.type === 'FILE'">
          <div class="message-file">
            <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
            <span class="file-name">{{ sanitizedFileName }}</span>
          </div>
        </template>

        <template v-else>
          {{ sanitizedContent }}
        </template>
      </div>

      <div class="message-meta">
        <span v-if="showTime" class="message-time">
          {{ formatTime(message.createdAt) }}
        </span>
        <span v-if="message.status" class="message-status">
          <!-- SENDING -->
          <svg v-if="message.status === 'SENDING'" class="status-icon sending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <!-- SENT -->
          <svg v-else-if="message.status === 'SENT'" class="status-icon sent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <!-- READ -->
          <svg v-else-if="message.status === 'READ'" class="status-icon read" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 7l-8 8-4-4"/>
            <path d="M22 7l-8 8-1-1"/>
          </svg>
          <!-- FAILED -->
          <svg v-else-if="message.status === 'FAILED'" class="status-icon failed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { sanitizeText, sanitizeUrl, sanitizeFilename } from '@/utils/sanitize.js'

const props = defineProps({
  message: Object,
  isMine: Boolean,
  showSender: Boolean,
  showTime: Boolean
})

const emit = defineEmits(['message-click', 'retry', 'delete'])

// 🔒 XSS 방어: 메시지 내용 sanitize
const sanitizedContent = computed(() => {
    return sanitizeText(props.message?.content || '')
})

// 🔒 XSS 방어: 발신자 이름 sanitize
const sanitizedSenderName = computed(() => {
    return sanitizeText(props.message?.senderName || '')
})

// 🔒 XSS 방어: 이미지 URL sanitize
const sanitizedImageUrl = computed(() => {
    return sanitizeUrl(props.message?.content || '')
})

// 🔒 XSS 방어: 파일명 sanitize
const sanitizedFileName = computed(() => {
    return sanitizeFilename(props.message?.metadata?.fileName || '파일')
})

const messageTypeClass = computed(() => {
  return {
    'is-mine': props.isMine,
    'is-system': props.message.type === 'SYSTEM',
    'is-failed': props.message.status === 'FAILED'
  }
})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.chat-message {
  margin-bottom: 8px;
}

.chat-message.is-mine {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-sender {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
  margin-left: 14px;
  font-weight: 500;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  word-wrap: break-word;
  transition: all 0.2s ease;
}

.message-bubble:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.message-bubble.is-mine {
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
  color: white;
  border-bottom-right-radius: 6px;
}

.message-bubble:not(.is-mine) {
  border-bottom-left-radius: 6px;
}

.message-bubble.is-system {
  background: #f8fafc;
  color: #64748b;
  text-align: center;
  font-size: 13px;
  max-width: 85%;
  margin: 8px auto;
  padding: 10px 16px;
  border-radius: 12px;
}

.message-bubble.is-failed {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.message-content {
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.message-image {
  max-width: 220px;
  max-height: 220px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.message-image:hover {
  transform: scale(1.02);
}

.message-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.message-file:hover {
  background: rgba(0, 0, 0, 0.1);
}

.is-mine .message-file {
  background: rgba(255, 255, 255, 0.15);
}

.is-mine .message-file:hover {
  background: rgba(255, 255, 255, 0.25);
}

.file-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 2px;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
}

.message-status {
  display: flex;
  align-items: center;
}

.status-icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.status-icon.sending {
  animation: pulse 1.5s ease-in-out infinite;
}

.status-icon.sent {
  opacity: 0.6;
}

.status-icon.read {
  opacity: 0.9;
}

.status-icon.failed {
  color: #dc2626;
  opacity: 1;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }

  .message-content {
    font-size: 14px;
  }
}
</style>
