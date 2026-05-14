<template>
  <div>
    <!-- 채팅방 헤더 -->
    <div class="chat-detail-header">
      <button class="back-button" @click="$emit('back-to-list')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span>뒤로</span>
      </button>
      <div class="room-info">
        <h2 class="room-title">{{ roomInfo.title || '채팅방' }}</h2>
        <p class="room-participants">
          {{ roomInfo.participantCount }}명
          <span v-if="onlineUsers.length > 0" class="online-indicator">
            <span class="online-dot"></span>
            {{ onlineUsers.length }}명 온라인
          </span>
          <!-- 연결 상태 표시 -->
          <span v-if="connectionState.connected" class="connection-status connected">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12.55a11 11 0 0114.08 0"/>
              <path d="M1.42 9a16 16 0 0121.16 0"/>
              <path d="M8.53 16.11a6 6 0 016.95 0"/>
              <circle cx="12" cy="20" r="1" fill="currentColor"/>
            </svg>
            연결됨
          </span>
          <span v-else-if="connectionState.connecting" class="connection-status connecting">
            <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            연결 중...
          </span>
          <span v-else class="connection-status disconnected">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/>
              <path d="M5 12.55a10.94 10.94 0 015.17-2.39"/>
              <path d="M10.71 5.05A16 16 0 0122.58 9"/>
              <path d="M1.42 9a15.91 15.91 0 014.7-2.88"/>
              <path d="M8.53 16.11a6 6 0 016.95 0"/>
              <circle cx="12" cy="20" r="1" fill="currentColor"/>
            </svg>
            연결 끊김
          </span>
        </p>
      </div>
      <button class="menu-button" @click="$emit('toggle-menu')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
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
  background: linear-gradient(135deg, var(--c-brand) 0%, var(--c-brand) 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(147, 51, 234, 0.2);
}

.back-button, .menu-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.back-button svg, .menu-button svg {
  width: 20px;
  height: 20px;
}

.back-button:hover, .menu-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.menu-button {
  padding: 10px;
}

.room-info {
  flex: 1;
  text-align: center;
  margin: 0 16px;
}

.room-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.room-participants {
  font-size: 12px;
  opacity: 0.9;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.online-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.online-dot {
  width: 6px;
  height: 6px;
  background: #34d399;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.connection-status svg {
  width: 12px;
  height: 12px;
}

.connection-status.connected {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
}

.connection-status.connecting {
  background: rgba(251, 191, 36, 0.2);
  color: var(--c-warning);
}

.connection-status.connecting .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.connection-status.disconnected {
  background: rgba(248, 113, 113, 0.2);
  color: var(--c-danger);
}

.device-info-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border-strong);
  font-size: 12px;
  color: var(--c-text-500);
}

.device-details {
  display: flex;
  gap: 8px;
}

.close-device-info {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--c-text-400);
  cursor: pointer;
  padding: 0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.close-device-info svg {
  width: 16px;
  height: 16px;
}

.close-device-info:hover {
  background: var(--border-strong);
  color: var(--c-text-500);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-detail-header {
    padding: 12px 16px;
  }

  .back-button, .menu-button {
    padding: 8px 12px;
    border-radius: 10px;
  }

  .menu-button {
    padding: 8px;
  }

  .room-title {
    font-size: 15px;
  }

  .room-participants {
    font-size: 11px;
  }

  .back-button span {
    display: none;
  }

  .device-info-banner {
    font-size: 11px;
    padding: 8px 12px;
  }

  .device-details {
    flex-direction: column;
    gap: 4px;
  }
}

/* 접근성 개선 */
.back-button:focus-visible,
.menu-button:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
  background: rgba(255, 255, 255, 0.3);
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

/* 애니메이션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .back-button,
  .menu-button,
  .online-dot,
  .spin {
    animation: none !important;
    transition: none !important;
  }
}
</style>
