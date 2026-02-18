<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="[`toast-${toast.type || 'default'}`]"
        @click="handleClick(toast)"
      >
        <!-- 아이콘/아바타 -->
        <div class="toast-avatar">
          <img
            v-if="toast.actor?.profileImageUrl"
            :src="toast.actor.profileImageUrl"
            :alt="toast.actor.nickname"
            @error="handleImageError"
          />
          <div v-else class="avatar-fallback" :style="{ background: toast.color || '#9333ea' }">
            {{ getNotificationEmoji(toast.type) }}
          </div>
        </div>

        <!-- 내용 -->
        <div class="toast-content">
          <p class="toast-title">{{ toast.title }}</p>
          <p class="toast-body">{{ toast.content }}</p>
        </div>

        <!-- 닫기 버튼 -->
        <button class="toast-close" @click.stop="removeToast(toast.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- 프로그레스 바 -->
        <div class="toast-progress" :style="{ animationDuration: `${duration}ms` }"></div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import webSocketService from '@/services/webSocketService.js'
import { notificationService } from '@/services/NotificationService.js'
import { useRouter } from 'vue-router'

const router = useRouter()

// 토스트 목록
const toasts = ref([])
const duration = 5000 // 5초 후 자동 닫힘
const maxToasts = 3 // 최대 3개까지 표시

let toastId = 0

/**
 * 토스트 추가
 */
const addToast = (notification) => {
  // 최대 개수 초과 시 오래된 것 제거
  if (toasts.value.length >= maxToasts) {
    toasts.value.shift()
  }

  const id = ++toastId
  const toast = {
    id,
    ...notification
  }

  toasts.value.push(toast)

  // 자동 제거 타이머
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

/**
 * 토스트 제거
 */
const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

/**
 * 토스트 클릭 시 해당 페이지로 이동
 */
const handleClick = (toast) => {
  const route = notificationService.getNotificationRoute(toast)
  if (route) {
    router.push(route)
  }
  removeToast(toast.id)
}

/**
 * 알림 타입별 이모지
 */
const getNotificationEmoji = (type) => {
  return notificationService.getNotificationEmoji(type)
}

/**
 * 이미지 로드 실패 처리
 */
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

/**
 * WebSocket 알림 수신 핸들러
 */
const handleNewNotification = (data) => {
  console.log('🔔 [NotificationToast] 새 알림 수신:', data)

  // 알림 데이터 변환
  const notification = notificationService.transformNotification(data)

  // 토스트 표시
  addToast(notification)
}

// WebSocket 핸들러 등록
let isSetup = false

onMounted(() => {
  if (!isSetup) {
    // 기존 notifications 핸들러와 별개로 toast용 핸들러 등록
    webSocketService.onMessage('notification-toast', handleNewNotification)

    // notifications 핸들러에서도 호출하도록 글로벌 이벤트 사용
    window.addEventListener('new-notification', (e) => {
      addToast(e.detail)
    })

    isSetup = true
    console.log('✅ [NotificationToast] 마운트 완료')
  }
})

onUnmounted(() => {
  webSocketService.offMessage('notification-toast')
  isSetup = false
})

// 외부에서 토스트 추가할 수 있도록 expose
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
  gap: 12px;
  width: 360px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast-item:hover {
  transform: translateX(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 아바타 */
.toast-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
}

.toast-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

/* 내용 */
.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toast-body {
  font-size: 13px;
  color: #6b7280;
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
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #d1d5db;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
}

.toast-close svg {
  width: 14px;
  height: 14px;
}

.toast-item:hover .toast-close {
  opacity: 1;
}

.toast-close:hover {
  background: #f3f4f6;
  color: #6b7280;
}

/* 프로그레스 바 */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #9333ea, #c084fc);
  animation: progress linear forwards;
  border-radius: 0 0 0 12px;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
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
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .toast-container {
    top: 70px;
    right: 12px;
    left: 12px;
  }

  .toast-item {
    width: auto;
  }

  .toast-avatar {
    width: 40px;
    height: 40px;
  }

  .toast-title {
    font-size: 13px;
  }

  .toast-body {
    font-size: 12px;
  }
}
</style>
