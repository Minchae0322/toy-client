<template>
  <div class="chat-room-card" @click="$emit('select-room', room.id)">
    <div class="room-avatar">
      <img
          v-if="room.avatar"
          :src="room.avatar"
          :alt="room.name"
          class="avatar-image"
      />
      <div v-else class="avatar-placeholder">
        {{ getAvatarText(room.name) }}
      </div>
      <div v-if="room.status === 'online'" class="online-indicator"></div>
    </div>

    <div class="room-content">
      <div class="room-header">
        <h3 class="room-name">{{ room.name }}</h3>
        <span class="room-time">{{ formatTime(room.lastMessageAt) }}</span>
      </div>

      <div class="room-footer">
        <div class="last-message">
          <span v-if="room.lastMessageSender && room.type === 'group'" class="message-sender">
            {{ room.lastMessageSender }}:
          </span>
          <span class="message-content">
            {{ formatLastMessage(room) }}
          </span>
        </div>

        <div class="room-meta">
          <span v-if="room.unreadCount > 0" class="unread-badge">
            {{ room.unreadCount > 99 ? '99+' : room.unreadCount }}
          </span>
          <span v-if="room.type === 'group'" class="participant-count">
            {{ room.participantCount }}명
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['room'])
const emit = defineEmits(['select-room'])

const getAvatarText = (name) => {
  return name.charAt(0).toUpperCase()
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''

  const now = new Date()
  const messageTime = new Date(timestamp)
  const diffInMs = now - messageTime
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return '방금'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분`
  } else if (diffInHours < 24) {
    return `${diffInHours}시간`
  } else if (diffInDays < 7) {
    return `${diffInDays}일`
  } else {
    return messageTime.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }
}

const formatLastMessage = (room) => {
  if (!room.lastMessage) return '메시지가 없습니다'

  switch (room.lastMessageType) {
    case 'image':
      return '📷 사진'
    case 'video':
      return '🎥 동영상'
    case 'audio':
      return '🎵 음성메시지'
    case 'file':
      return '📎 파일'
    case 'location':
      return '📍 위치'
    default:
      return room.lastMessage.length > 30
          ? room.lastMessage.substring(0, 30) + '...'
          : room.lastMessage
  }
}
</script>

<style scoped>
.chat-room-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.chat-room-card:hover {
  background: #f8fafc;
}

.chat-room-card:active {
  background: #f1f5f9;
}

.room-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar-image {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  object-fit: cover;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}

.room-content {
  flex: 1;
  min-width: 0;
}

.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.room-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.room-time {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 8px;
  flex-shrink: 0;
}

.room-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.last-message {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.message-sender {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}

.message-content {
  font-size: 14px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.participant-count {
  font-size: 11px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .chat-room-card {
    padding: 12px 16px;
  }

  .avatar-image,
  .avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 20px;
  }

  .avatar-placeholder {
    font-size: 16px;
  }

  .room-name {
    font-size: 15px;
  }

  .message-content {
    font-size: 13px;
  }
}
</style>