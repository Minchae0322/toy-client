<!-- ChatMessage.vue -->
<template>
  <div class="chat-message" :class="{ 'is-mine': isMine }">
    <div v-if="showSender && !isMine" class="message-sender">
      {{ message.senderName }}
    </div>

    <div class="message-bubble" :class="messageTypeClass">
      <div class="message-content">
        <template v-if="message.type === 'TEXT'">
          {{ message.content }}
        </template>

        <template v-else-if="message.type === 'IMAGE'">
          <img :src="message.content" alt="이미지" class="message-image" />
        </template>

        <template v-else-if="message.type === 'FILE'">
          <div class="message-file">
            📎 {{ message.metadata?.fileName || '파일' }}
          </div>
        </template>

        <template v-else>
          {{ message.content }}
        </template>
      </div>

      <div class="message-meta">
        <span v-if="showTime" class="message-time">
          {{ formatTime(message.createdAt) }}
        </span>
        <span v-if="message.status" class="message-status">
          {{ getStatusIcon(message.status) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: Object,
  isMine: Boolean,
  showSender: Boolean,
  showTime: Boolean
})

const emit = defineEmits(['message-click', 'retry', 'delete'])

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

const getStatusIcon = (status) => {
  switch (status) {
    case 'SENDING': return '⏳'
    case 'SENT': return '✓'
    case 'READ': return '✓✓'
    case 'FAILED': return '❌'
    default: return ''
  }
}
</script>

<style scoped>
.chat-message {
  margin-bottom: 12px;
}

.chat-message.is-mine {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-sender {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  margin-left: 12px;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.message-bubble.is-mine {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-bubble.is-system {
  background: #f1f5f9;
  color: #64748b;
  text-align: center;
  font-style: italic;
  max-width: 80%;
  margin: 0 auto;
}

.message-bubble.is-failed {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.message-content {
  margin-bottom: 4px;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 11px;
  opacity: 0.7;
}

.message-time {
  color: inherit;
}

.message-status {
  color: inherit;
}

@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
}
</style>