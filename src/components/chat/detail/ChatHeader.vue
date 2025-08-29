<template>
  <div>
    <!-- 채팅방 헤더 -->
    <div class="chat-detail-header">
      <button class="back-button" @click="$emit('back-to-list')">
        <ArrowLeft :size="20" />
        <span>뒤로</span>
      </button>
      <div class="room-info">
        <h2 class="room-title">{{ roomInfo.title || '채팅방' }}</h2>
        <p class="room-participants">
          {{ roomInfo.participantCount }}명
          <span v-if="onlineUsers.length > 0" class="online-indicator">
            • {{ onlineUsers.length }}명 온라인
          </span>
          <!-- 연결 상태 표시 -->
          <span v-if="connectionState.connected" class="connection-status connected">
            📶 연결됨
          </span>
          <span v-else-if="connectionState.connecting" class="connection-status connecting">
            ⏳ 연결 중...
          </span>
          <span v-else class="connection-status disconnected">
            ❌ 연결 끊김
          </span>
        </p>
      </div>
      <button class="menu-button" @click="$emit('toggle-menu')">
        <MoreVertical :size="20" />
      </button>
    </div>

    <!-- 디바이스 정보 표시 (개발 모드) -->
    <div v-if="showDeviceInfo && isDev" class="device-info-banner">
      <div class="device-details">
        <span>{{ deviceInfo.deviceType }}</span> |
        <span>{{ deviceInfo.browser.name }}</span> |
        <span>{{ deviceInfo.deviceName }}</span>
      </div>
      <button @click="$emit('close-device-info')" class="close-device-info">
        <X :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {ArrowLeft, MoreVertical, X} from 'lucide-vue-next'

defineProps({
  roomInfo: {
    type: Object,
    default: () => ({})
  },
  onlineUsers: {
    type: Array,
    default: () => []
  },
  connectionState: {
    type: Object,
    required: true
  },
  showDeviceInfo: {
    type: Boolean,
    default: false
  },
  deviceInfo: {
    type: Object,
    required: true
  },
  isDev: {
    type: Boolean,
    default: false
  }
})

defineEmits(['back-to-list', 'toggle-menu', 'close-device-info', 'reconnect'])
</script>

<style scoped>
.chat-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-button, .menu-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover, .menu-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.room-info {
  flex: 1;
  text-align: center;
  margin: 0 16px;
}

.room-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.room-participants {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.online-indicator {
  color: #10b981;
}

.connection-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.connection-status.connected {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.connection-status.connecting {
  background: rgba(251, 191, 36, 0.2);
  color: #f59e0b;
}

.connection-status.disconnected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.device-info-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
}

.device-details {
  display: flex;
  gap: 8px;
}

.close-device-info {
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
}

.close-device-info:hover {
  background: #e2e8f0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-detail-header {
    padding: 12px 16px;
  }

  .room-title {
    font-size: 16px;
  }

  .room-participants {
    font-size: 11px;
  }

  .back-button span {
    display: none;
  }

  .device-info-banner {
    font-size: 11px;
    padding: 6px 12px;
  }

  .device-details {
    flex-direction: column;
    gap: 4px;
  }
}

/* 접근성 개선 */
.back-button:focus,
.menu-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .device-info-banner {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
}

/* 터치 디바이스 최적화 */
@media (hover: none) and (pointer: coarse) {
  .back-button,
  .menu-button {
    min-height: 44px;
    min-width: 44px;
  }

  .close-device-info {
    min-height: 32px;
    min-width: 32px;
  }
}

/* 키보드 내비게이션 지원 */
.back-button:focus-visible,
.menu-button:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  background: rgba(255, 255, 255, 0.3);
}

/* 프린트 스타일 */
@media print {
  .chat-detail-header,
  .device-info-banner {
    display: none !important;
  }
}

/* 애니메이션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .back-button,
  .menu-button {
    transition: none !important;
  }
}
</style>