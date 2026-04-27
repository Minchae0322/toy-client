<template>
  <header class="detail-header">
    <button class="btn-back" @click="$emit('back')" aria-label="뒤로 가기">
      <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <h1 class="header-title">피드</h1>

    <div class="header-actions">
      <button class="action-btn" @click="$emit('share')" aria-label="공유하기">
        <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
        </svg>
      </button>

      <button v-if="isOwner" class="action-btn" @click="showMenu = !showMenu" aria-label="더보기">
        <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      </button>

      <button v-if="!isOwner" class="action-btn" @click="showMenu = !showMenu" aria-label="더보기">
        <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      </button>
    </div>

    <!-- 드롭다운 메뉴 -->
    <Transition name="menu">
      <div v-if="showMenu" class="menu-overlay" @click="showMenu = false">
        <div class="menu-dropdown" @click.stop>
          <button class="menu-item" @click="handleAction('copy-link')">
            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            링크 복사
          </button>
          <template v-if="isOwner">
            <button class="menu-item" @click="handleAction('edit')">
              <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              수정하기
            </button>
            <div class="menu-divider" />
            <button class="menu-item menu-item--danger" @click="handleAction('delete')">
              <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              삭제하기
            </button>
          </template>
          <template v-else>
            <div class="menu-divider" />
            <button class="menu-item menu-item--danger" @click="handleAction('report')">
              <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              신고하기
            </button>
            <template v-if="isAdmin">
              <div class="menu-divider" />
              <button class="menu-item menu-item--danger" @click="handleAction('delete')">
                <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                삭제하기 <span class="menu-tag">관리자</span>
              </button>
            </template>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  isOwner: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['back', 'share', 'copy-link', 'report', 'edit', 'delete'])

const showMenu = ref(false)

const handleAction = (action) => {
  showMenu.value = false
  emit(action)
}
</script>

<style scoped>
.detail-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #F2F4F6;
  padding: 0 12px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #191F28;
  transition: background 0.15s ease;
  flex-shrink: 0;
}
.btn-back:active { background: #F2F4F6; }
.back-icon { width: 22px; height: 22px; }

.header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: #191F28;
  letter-spacing: -0.02em;
  margin: 0;
  padding-left: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #4E5968;
  transition: all 0.15s ease;
}
.action-btn:active { background: #F2F4F6; }
.action-icon { width: 20px; height: 20px; }

/* 드롭다운 메뉴 */
.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
}

.menu-dropdown {
  position: absolute;
  top: 48px;
  right: 12px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #F2F4F6;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  min-width: 160px;
  padding: 4px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #191F28;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;
}
.menu-item:active { background: #F2F4F6; }
.menu-item--danger { color: #E53935; }
.menu-item--danger:active { background: #FFF5F5; }

.menu-tag {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 4px;
  background: #FEE2E2;
  color: #B91C1C;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.menu-icon { width: 18px; height: 18px; flex-shrink: 0; }

.menu-divider { height: 1px; background: #F2F4F6; margin: 4px 0; }

/* 메뉴 트랜지션 */
.menu-enter-active { transition: opacity 0.15s ease; }
.menu-leave-active { transition: opacity 0.1s ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; }

@media (min-width: 1024px) {
  .detail-header { padding: 0 20px; }
}
</style>
