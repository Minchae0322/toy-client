<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  }
})
</script>

<template>
  <Transition name="slide">
    <div v-if="show" class="notification" :class="type">
      <div class="notification-content">
        <span class="notification-icon">
          {{ type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️' }}
        </span>
        <span class="notification-message">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  backdrop-filter: blur(10px);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-icon {
  flex-shrink: 0;
}

.notification-message {
  flex: 1;
  word-break: break-word;
}

.notification.success {
  background: rgba(220, 252, 231, 0.95);
  color: #166534;
  border: 1px solid #bbf7d0;
}

.notification.error {
  background: rgba(254, 202, 202, 0.95);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.notification.warning {
  background: rgba(254, 240, 138, 0.95);
  color: #92400e;
  border: 1px solid #fcd34d;
}

.notification.info {
  background: rgba(219, 234, 254, 0.95);
  color: #1e40af;
  border: 1px solid #93c5fd;
}

/* 애니메이션 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    font-size: 13px;
    padding: 10px 12px;
  }

  .notification-content {
    gap: 6px;
  }
}

/* 태블릿 */
@media (min-width: 768px) and (max-width: 1023px) {
  .notification {
    max-width: 350px;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .notification {
    max-width: 400px;
  }
}
</style>