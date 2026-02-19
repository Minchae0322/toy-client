<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast._toastId"
        class="toast-item"
        @click="handleClick(toast)"
      >
        <!-- 타입 아이콘 -->
        <div class="toast-icon" :class="getTypeClass(toast.type)">
          <component :is="getTypeIcon(toast.type)" class="icon" />
        </div>

        <!-- 내용 -->
        <div class="toast-content">
          <div class="toast-header">
            <span class="toast-type-label">{{ getTypeLabel(toast.type) }}</span>
            <span class="toast-time">방금 전</span>
          </div>
          <p class="toast-title">{{ toast.title }}</p>
          <p class="toast-body">{{ toast.content }}</p>
        </div>

        <!-- 닫기 버튼 -->
        <button class="toast-close" @click.stop="removeToast(toast._toastId)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- 프로그레스 바 (단색) -->
        <div class="toast-progress" :style="{ animationDuration: `${duration}ms` }"></div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, h } from 'vue'
import webSocketService from '@/services/webSocketService.js'
import { notificationService } from '@/services/NotificationService.js'
import { useRouter } from 'vue-router'

const router = useRouter()

// 토스트 목록
const toasts = ref([])
const duration = 5000
const maxToasts = 3

let toastId = 0

// ==================== 타입별 아이콘 ====================

const IconComment = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
    ])
  }
}

const IconHeart = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })
    ])
  }
}

const IconUser = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: '12', cy: '7', r: '4' })
    ])
  }
}

const IconMessage = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
      h('polyline', { points: '22,6 12,13 2,6' })
    ])
  }
}

const IconBell = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
      h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
    ])
  }
}

const IconStar = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
    ])
  }
}

const getTypeIcon = (type) => {
  const iconMap = {
    'COMMENT': IconComment,
    'FEED_COMMENT': IconComment,
    'LIKE': IconHeart,
    'FEED_LIKE': IconHeart,
    'FOLLOW': IconUser,
    'CHAT': IconMessage,
    'SYSTEM': IconBell,
    'BATTLE': IconStar,
    'BATTLE_VOTE': IconStar
  }
  return iconMap[type] || IconBell
}

const getTypeClass = (type) => {
  const classMap = {
    'COMMENT': 'type-comment',
    'FEED_COMMENT': 'type-comment',
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
    'COMMENT': '댓글',
    'FEED_COMMENT': '피드 댓글',
    'LIKE': '좋아요',
    'FEED_LIKE': '피드 좋아요',
    'FOLLOW': '팔로우',
    'CHAT': '채팅',
    'SYSTEM': '시스템',
    'BATTLE': '배틀',
    'BATTLE_VOTE': '배틀 투표'
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

onMounted(() => {
  if (!isSetup) {
    webSocketService.onMessage('notification-toast', handleNewNotification)
    window.addEventListener('new-notification', (e) => {
      addToast(e.detail)
    })
    isSetup = true
  }
})

onUnmounted(() => {
  webSocketService.offMessage('notification-toast')
  isSetup = false
})

defineExpose({ addToast })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 380px;
  padding: 16px 18px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e5e5;
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast-item:hover {
  transform: translateX(-4px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
}

/* 타입 아이콘 */
.toast-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-icon .icon {
  width: 18px;
  height: 18px;
}

.type-comment {
  background: #EFF6FF;
  color: #2563EB;
}

.type-like {
  background: #FEF2F2;
  color: #DC2626;
}

.type-follow {
  background: #F0FDF4;
  color: #16A34A;
}

.type-chat {
  background: #FAF5FF;
  color: #9333EA;
}

.type-system {
  background: #F5F5F5;
  color: #525252;
}

.type-battle {
  background: #FFFBEB;
  color: #D97706;
}

.type-default {
  background: #F5F5F5;
  color: #525252;
}

/* 내용 */
.toast-content {
  flex: 1;
  min-width: 0;
  padding-right: 24px;
}

.toast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.toast-type-label {
  font-size: 11px;
  font-weight: 600;
  color: #737373;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.toast-time {
  font-size: 11px;
  color: #a3a3a3;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #171717;
  margin: 0 0 3px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toast-body {
  font-size: 13px;
  color: #525252;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 닫기 버튼 */
.toast-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: #d4d4d4;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.toast-close svg {
  width: 12px;
  height: 12px;
}

.toast-close:hover {
  background: #f5f5f5;
  color: #737373;
}

/* 프로그레스 바 (단색) */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #9333EA;
  animation: progress linear forwards;
  border-radius: 0 0 0 12px;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

/* 트랜지션 */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* 모바일 */
@media (max-width: 480px) {
  .toast-container {
    top: 70px;
    right: 12px;
    left: 12px;
  }

  .toast-item {
    width: auto;
    padding: 14px 16px;
    gap: 12px;
  }

  .toast-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .toast-icon .icon {
    width: 16px;
    height: 16px;
  }

  .toast-title {
    font-size: 13px;
  }

  .toast-body {
    font-size: 12px;
  }

  .toast-type-label,
  .toast-time {
    font-size: 10px;
  }
}
</style>
