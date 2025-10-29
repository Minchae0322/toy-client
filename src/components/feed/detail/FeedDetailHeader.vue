<template>
  <header class="detail-header">
    <button class="btn-back" @click="$emit('back')" aria-label="뒤로 가기">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <div class="header-actions">
      <button class="btn-icon" @click="handleShare" aria-label="공유하기">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
      </button>
      <button class="btn-icon" @click="showMenu = !showMenu" aria-label="더보기 메뉴">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
        </svg>
      </button>
    </div>

    <!-- More Menu -->
    <transition name="fade">
      <div v-if="showMenu" class="more-menu" @click.stop>
        <button class="menu-item" @click="handleCopyLink">
          <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          <span>링크 복사</span>
        </button>
        <button class="menu-item danger" @click="handleReport">
          <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>신고하기</span>
        </button>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['back', 'share', 'copy-link', 'report'])

const showMenu = ref(false)

const handleShare = () => {
  emit('share')
}

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
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 1024px) {
  .detail-header {
    padding: 0 24px;
    height: 60px;
  }
}

.btn-back,
.btn-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--primary);
}

.btn-back:hover,
.btn-icon:hover {
  background: var(--hover);
}

.btn-back:active,
.btn-icon:active {
  transform: scale(0.95);
}

.icon {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-menu {
  position: absolute;
  top: 64px;
  right: 16px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  min-width: 180px;
  z-index: 110;
}

@media (min-width: 1024px) {
  .more-menu {
    right: 24px;
    top: 68px;
  }
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  text-align: left;
  letter-spacing: -0.02em;
}

.menu-item:hover {
  background: var(--hover);
}

.menu-item.danger {
  color: #DC2626;
}

.menu-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  flex-shrink: 0;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>