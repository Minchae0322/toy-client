<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-stack">
      <button
        v-for="toast in toasts"
        :key="toast._toastId"
        type="button"
        class="toast-card"
        @click="handleClick(toast)"
      >
        <span class="toast-icon" :class="getTypeClass(toast.type)">
          <component :is="getTypeIcon(toast.type)" :size="18" :stroke-width="2.2" />
        </span>
        <span class="toast-body">
          <span class="toast-title">{{ toast.title || getTypeLabel(toast.type) }}</span>
          <span v-if="toast.content" class="toast-preview">{{ toast.content }}</span>
        </span>
      </button>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { MessageCircle, Heart, UserPlus, MessageSquare, Bell, Trophy } from 'lucide-vue-next'
import webSocketService from '@/services/webSocketService.js'
import { notificationService } from '@/services/NotificationService.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const toasts = ref([])
const duration = 4500
const maxToasts = 3

let toastId = 0

const getTypeIcon = (type) => {
  const iconMap = {
    'COMMENT': MessageCircle,
    'FEED_COMMENT': MessageCircle,
    'BATTLE_ITEM_COMMENT': MessageCircle,
    'LIKE': Heart,
    'FEED_LIKE': Heart,
    'FOLLOW': UserPlus,
    'CHAT': MessageSquare,
    'SYSTEM': Bell,
    'BATTLE': Trophy,
    'BATTLE_VOTE': Trophy
  }
  return iconMap[type] || Bell
}

const getTypeClass = (type) => {
  const classMap = {
    'COMMENT': 'type-comment',
    'FEED_COMMENT': 'type-comment',
    'BATTLE_ITEM_COMMENT': 'type-comment',
    'LIKE': 'type-like',
    'FEED_LIKE': 'type-like',
    'FOLLOW': 'type-follow',
    'CHAT': 'type-chat',
    'SYSTEM': 'type-system',
    'BATTLE': 'type-battle',
    'BATTLE_VOTE': 'type-battle'
  }
  return classMap[type] || 'type-default'
}

const getTypeLabel = (type) => {
  const labelMap = {
    'COMMENT': '새 댓글',
    'FEED_COMMENT': '새 댓글',
    'LIKE': '새 좋아요',
    'FEED_LIKE': '새 좋아요',
    'FOLLOW': '새 팔로워',
    'CHAT': '새 메시지',
    'SYSTEM': '알림',
    'BATTLE': '배틀 소식',
    'BATTLE_VOTE': '배틀 투표',
    'BATTLE_ITEM_COMMENT': '요거픽 댓글'
  }
  return labelMap[type] || '알림'
}

// ==================== 토스트 관리 ====================

const addToast = (notification) => {
  if (toasts.value.length >= maxToasts) {
    toasts.value.shift()
  }

  const id = ++toastId
  const toast = { ...notification, _toastId: id }
  toasts.value.push(toast)

  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t._toastId === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

const handleClick = (toast) => {
  const route = notificationService.getNotificationRoute(toast)
  if (route) {
    router.push(route)
  }
  removeToast(toast._toastId)
}

const handleNewNotification = (data) => {
  console.log('[NotificationToast] New notification received:', data)
  const notification = notificationService.transformNotification(data)
  addToast(notification)
}

let isSetup = false

const handleHeadsUp = (data) => {
  if (!data) return
  addToast({
    type: 'CHAT',
    title: data.senderName || '새 메시지',
    content: data.content || '',
    referenceType: 'CHAT_ROOM',
    referenceId: data.chatRoomId,
  })
}

onMounted(() => {
  if (!isSetup) {
    webSocketService.onMessage('notification-toast', handleNewNotification)
    webSocketService.onMessage('headsup', handleHeadsUp)
    window.addEventListener('new-notification', (e) => {
      addToast(e.detail)
    })
    isSetup = true
  }
})

onUnmounted(() => {
  webSocketService.offMessage('notification-toast')
  webSocketService.offMessage('headsup')
  isSetup = false
})

defineExpose({ addToast })
</script>

<style scoped>
/* 스택 — PC: 우상단, 모바일: 상단 중앙 */
.toast-stack {
  position: fixed;
  top: calc(20px + env(safe-area-inset-top, 0px));
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
  /* iOS safe-area + 글로벌 헤더 회피 */
}

/* 카드 — 화이트 / 헤어라인 / soft shadow, 좌측 컬러 아이콘 + 1줄 제목 + 1줄 본문 */
.toast-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 360px;
  max-width: calc(100vw - 32px);
  padding: 12px 16px;
  background: var(--bg-elevated, #ffffff);
  border: 1px solid var(--border-strong, #f1f3f6);
  border-radius: 16px;
  box-shadow:
    0 10px 28px rgba(15, 23, 42, 0.08),
    0 4px 8px rgba(15, 23, 42, 0.04);
  pointer-events: auto;
  cursor: pointer;
  text-align: left;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  letter-spacing: -0.2px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.toast-card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 14px 34px rgba(15, 23, 42, 0.1),
    0 6px 10px rgba(15, 23, 42, 0.05);
}

.toast-card:active {
  transform: translateY(0);
  box-shadow:
    0 6px 16px rgba(15, 23, 42, 0.08),
    0 2px 4px rgba(15, 23, 42, 0.04);
}

/* 아이콘 — 솔리드 soft bg + 타입 컬러 stroke */
.toast-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-comment { background: var(--c-info-soft, #E0F2FE); color: var(--c-info, #0284C7); }
.type-like { background: var(--c-danger-soft, #FEE2E2); color: var(--c-danger, #EF4444); }
.type-follow { background: var(--c-success-soft, #DCFCE7); color: var(--c-success, #16A34A); }
.type-chat { background: var(--c-brand-soft, #FAF5FF); color: var(--c-brand, #9333EA); }
.type-system { background: var(--bg-subtle, #F7F8FA); color: var(--c-text-600, #475569); }
.type-battle { background: var(--c-warning-soft, #FEF9C3); color: var(--c-bronze, #D97706); }
.type-default { background: var(--bg-subtle, #F7F8FA); color: var(--c-text-600, #475569); }

/* 텍스트 — 굵은 제목 1줄 + 회색 본문 1줄 */
.toast-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary, #0A0E1A);
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-preview {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-500, #64748B);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 트랜지션 — 위에서 살짝 튕기며 슬라이드 다운 */
.toast-enter-active {
  transition:
    transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    opacity 0.25s ease-out;
}

.toast-leave-active {
  transition: transform 0.22s ease-in, opacity 0.22s ease-in;
  position: absolute;
  right: 0;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.toast-move {
  transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 모바일 — 상단 중앙, 좌우 16px 마진 */
@media (max-width: 640px) {
  .toast-stack {
    top: calc(12px + env(safe-area-inset-top, 0px));
    right: 16px;
    left: 16px;
    align-items: stretch;
  }

  .toast-card {
    width: auto;
    max-width: none;
    padding: 12px 14px;
    border-radius: 14px;
  }

  .toast-icon {
    width: 34px;
    height: 34px;
    border-radius: 11px;
  }

  .toast-title { font-size: 13px; }
  .toast-preview { font-size: 12px; }

  .toast-leave-active {
    right: 16px;
    left: 16px;
  }
}
</style>
