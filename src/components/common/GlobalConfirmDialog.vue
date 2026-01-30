<script setup>
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const { state, confirm, cancel } = useConfirmDialog()

const handleOverlayClick = () => {
  if (state.type === 'alert') {
    confirm()
  } else {
    cancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div v-if="state.visible" class="dialog-overlay" @click.self="handleOverlayClick">
        <div class="dialog-container" :class="`dialog--${state.type}`">
          <!-- 아이콘 -->
          <div class="dialog-icon-wrap">
            <!-- confirm -->
            <svg v-if="state.type === 'confirm'" class="dialog-icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <!-- alert -->
            <svg v-else-if="state.type === 'alert'" class="dialog-icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
            <!-- danger -->
            <svg v-else class="dialog-icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>

          <!-- 텍스트 -->
          <h3 v-if="state.title" class="dialog-title">{{ state.title }}</h3>
          <p v-if="state.message" class="dialog-message">{{ state.message }}</p>

          <!-- 버튼 -->
          <div class="dialog-actions" :class="{ 'single': state.type === 'alert' }">
            <button
              v-if="state.cancelText"
              class="dialog-btn dialog-btn--cancel"
              @click="cancel"
            >
              {{ state.cancelText }}
            </button>
            <button
              class="dialog-btn dialog-btn--confirm"
              :class="`dialog-btn--${state.type}`"
              @click="confirm(true)"
            >
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ===================== 오버레이 ===================== */
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 16px;
}

/* ===================== 컨테이너 ===================== */
.dialog-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 28px 24px;
  width: 100%;
  max-width: 380px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.06);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* ===================== 아이콘 ===================== */
.dialog-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.dialog--confirm .dialog-icon-wrap {
  background: #FAF5FF;
  color: #9933EA;
}

.dialog--alert .dialog-icon-wrap {
  background: #F0FFF4;
  color: #38A169;
}

.dialog--danger .dialog-icon-wrap {
  background: #FFF5F5;
  color: #E53E3E;
}

.dialog-icon {
  flex-shrink: 0;
}

/* ===================== 텍스트 ===================== */
.dialog-title {
  font-size: 17px;
  font-weight: 700;
  color: #111111;
  margin: 8px 0 0;
  line-height: 1.4;
}

.dialog-message {
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  margin: 6px 0 0;
  line-height: 1.6;
  word-break: keep-all;
}

/* ===================== 버튼 영역 ===================== */
.dialog-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 20px;
}

.dialog-actions.single {
  justify-content: center;
}

.dialog-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.dialog-btn--cancel {
  background: #F5F5F5;
  color: #666666;
}

.dialog-btn--cancel:hover {
  background: #EEEEEE;
  color: #444444;
}

/* confirm 타입 */
.dialog-btn--confirm.dialog-btn--confirm {
  background: #9933EA;
  color: #ffffff;
}

.dialog-btn--confirm.dialog-btn--confirm:hover {
  background: #8529D4;
}

/* alert 타입 */
.dialog-btn--confirm.dialog-btn--alert {
  background: #9933EA;
  color: #ffffff;
  max-width: 160px;
}

.dialog-btn--confirm.dialog-btn--alert:hover {
  background: #8529D4;
}

/* danger 타입 */
.dialog-btn--confirm.dialog-btn--danger {
  background: #E53E3E;
  color: #ffffff;
}

.dialog-btn--confirm.dialog-btn--danger:hover {
  background: #C53030;
}

/* ===================== 트랜지션 ===================== */
.confirm-dialog-enter-active {
  transition: opacity 0.2s ease;
}

.confirm-dialog-enter-active .dialog-container {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.confirm-dialog-leave-active {
  transition: opacity 0.15s ease;
}

.confirm-dialog-leave-active .dialog-container {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.confirm-dialog-enter-from {
  opacity: 0;
}

.confirm-dialog-enter-from .dialog-container {
  opacity: 0;
  transform: scale(0.92) translateY(8px);
}

.confirm-dialog-leave-to {
  opacity: 0;
}

.confirm-dialog-leave-to .dialog-container {
  opacity: 0;
  transform: scale(0.95);
}
</style>
