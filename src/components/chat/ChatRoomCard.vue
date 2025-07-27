<template>
  <div class="chat-room" @click="$emit('select-room', room.id)">
    <div class="room-avatar">
      <img v-if="room.type !== 'group'"
           :src="room.avatar"
           :alt="room.name"
           class="avatar-img">
      <div v-else class="group-avatar">👥</div>

      <div v-if="room.type !== 'group'"
           :class="['status-dot', getStatusClass(room.status)]">
      </div>
    </div>

    <div class="room-content">
      <div class="room-header">
        <div class="room-name">
          {{ room.name }}
          <span v-if="room.participantCount" class="participant-count">
            {{ room.participantCount }}
          </span>
        </div>
        <span class="room-time">{{ formatTime(room.lastMessageAt) }}</span>
      </div>

      <div class="room-footer">
        <div class="last-message">
          <span v-if="room.lastMessageSender" class="message-sender">
            {{ room.lastMessageSender }}:
          </span>
          <span :class="{ 'message-type': room.lastMessageType !== 'text' }">
            {{ getMessagePreview(room) }}
          </span>
        </div>
        <div v-if="room.unreadCount" class="unread-badge">
          {{ room.unreadCount > 99 ? '99+' : room.unreadCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps(['room'])
defineEmits(['select-room'])

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time

  if (diff < 60000) return '방금 전'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`
  return time.toLocaleDateString()
}

const getStatusClass = (status) => {
  return `status-${status}`
}

const getMessagePreview = (room) => {
  switch (room.lastMessageType) {
    case 'image':
      return '📷 사진'
    case 'video':
      return '🎥 동영상'
    case 'file':
      return '📎 파일'
    case 'location':
      return '📍 위치'
    default:
      return room.lastMessage
  }
}
</script>

<style scoped>
.chat-room {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.chat-room:hover {
  background: #f8fafc;
  transform: translateX(4px);
}

.chat-room:active {
  transform: translateX(2px);
}

.room-avatar {
  position: relative;
  margin-right: 16px;
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.group-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-online { background: #10b981; }
.status-away { background: #f59e0b; }
.status-offline { background: #6b7280; }

.room-content {
  flex: 1;
  min-width: 0;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.room-name {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.participant-count {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 8px;
}

.room-time {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  flex: 1;
  font-size: 14px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 12px;
}

.message-sender {
  font-weight: 500;
  margin-right: 4px;
}

.message-type {
  color: #667eea;
  font-weight: 500;
}

.unread-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@media (max-width: 768px) {
  .chat-room {
    padding: 12px 16px;
  }
}
</style>