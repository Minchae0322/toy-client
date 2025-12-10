<template>
  <header class="detail-header">
    <button class="btn-icon" @click="$emit('back')" aria-label="뒤로 가기">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <div class="header-actions">
      <button class="btn-icon" @click="$emit('share')" aria-label="공유하기">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
      </button>

      <div class="menu-wrapper">
        <button class="btn-icon" @click="showMenu = !showMenu" aria-label="더보기">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
        </button>

        <transition name="fade">
          <div v-if="showMenu" class="dropdown-menu" @click.stop>
            <button class="menu-item" @click="handleCopyLink">
              <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              링크 복사
            </button>
            <button class="menu-item menu-item--danger" @click="handleReport">
              <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              신고하기
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['back', 'share', 'copy-link', 'report'])
const showMenu = ref(false)

const handleCopyLink = () => {
  showMenu.value = false
  emit('copy-link')
}

const handleReport = () => {
  showMenu.value = false
  emit('report')
}
</script>

<style scoped>
.detail-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f3f4f6;
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 1024px) {
  .detail-header {
    padding: 0 24px;
  }
}

.btn-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.2s;
  color: #111827;
}

.btn-icon:hover {
  background: #f9fafb;
}

.btn-icon:active {
  transform: scale(0.96);
}

.icon {
  width: 20px;
  height: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.menu-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 48px;
  right: 0;
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-width: 160px;
  z-index: 110;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item--danger {
  color: #dc2626;
}

.menu-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>