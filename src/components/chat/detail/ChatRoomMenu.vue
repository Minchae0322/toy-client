<template>
  <Transition name="fade">
    <div v-if="show" class="room-menu-overlay" @click="$emit('update:show', false)">
      <div class="room-menu" @click.stop>
        <button @click="$emit('show-participants')">
          <Users :size="16" />
          <span>참여자 보기</span>
        </button>
        <button @click="$emit('search-messages')">
          <Search :size="16" />
          <span>메시지 검색</span>
        </button>
        <button @click="$emit('toggle-notification')">
          <Bell :size="16" />
          <span>알림 설정</span>
        </button>
        <button @click="$emit('toggle-device-info')">
          <Monitor :size="16" />
          <span>디바이스 정보</span>
        </button>
        <button @click="$emit('reconnect')">
          <RefreshCw :size="16" />
          <span>연결 새로고침</span>
        </button>
        <div class="menu-divider"></div>
        <button @click="$emit('leave-room')" class="danger">
          <LogOut :size="16" />
          <span>채팅방 나가기</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import {
  Users,
  Search,
  Bell,
  Monitor,
  RefreshCw,
  LogOut
} from 'lucide-vue-next'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:show',
  'show-participants',
  'search-messages',
  'toggle-notification',
  'toggle-device-info',
  'reconnect',
  'leave-room'
])
</script>

<style scoped>
.room-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.room-menu {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 200px;
}

.room-menu button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.room-menu button:hover {
  background: #f1f5f9;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
}

.room-menu button.danger {
  color: #dc2626;
}

.room-menu button.danger:hover {
  background: #fef2f2;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .room-menu {
    margin: 16px;
    min-width: calc(100vw - 32px);
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .room-menu {
    background: #374151;
    color: #f9fafb;
  }

  .room-menu button:hover {
    background: #4b5563;
  }

  .menu-divider {
    background: #4b5563;
  }

  .room-menu button.danger:hover {
    background: #7f1d1d;
  }
}

/* 키보드 내비게이션 지원 */
.room-menu button:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  background: #f1f5f9;
}

@media (prefers-color-scheme: dark) {
  .room-menu button:focus-visible {
    background: #4b5563;
  }
}

/* 터치 디바이스 최적화 */
@media (hover: none) and (pointer: coarse) {
  .room-menu button {
    min-height: 44px;
    min-width: 44px;
  }
}

/* 프린트 스타일 */
@media print {
  .room-menu-overlay {
    display: none !important;
  }
}

/* 애니메이션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .room-menu button {
    transition: none !important;
  }
}
</style>