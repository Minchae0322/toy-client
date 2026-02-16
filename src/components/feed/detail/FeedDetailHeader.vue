<template>
  <header class="detail-header">
    <button class="btn-icon" @click="$emit('back')" aria-label="뒤로 가기">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <div class="header-actions">
      <!-- 공유 -->
      <button class="btn-icon" @click="$emit('share')" aria-label="공유하기">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
      </button>

      <!-- 링크 복사 -->
      <button class="btn-icon" @click="$emit('copy-link')" aria-label="링크 복사">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
      </button>

      <!-- 수정 (본인만) -->
      <button v-if="isOwner" class="btn-icon" @click="$emit('edit')" aria-label="수정하기">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>

      <!-- 삭제 (본인만) -->
      <button v-if="isOwner" class="btn-icon btn-icon--danger" @click="$emit('delete')" aria-label="삭제하기">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>

      <!-- 신고 (타인 글만) -->
      <button v-if="!isOwner" class="btn-icon btn-icon--danger" @click="$emit('report')" aria-label="신고하기">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isOwner: {
    type: Boolean,
    default: false
  }
})

defineEmits(['back', 'share', 'copy-link', 'report', 'edit', 'delete'])
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
  transition: all 0.2s;
  color: #111827;
}

.btn-icon:hover {
  background: #f3f4f6;
}

.btn-icon:active {
  transform: scale(0.96);
}

.btn-icon--danger {
  color: #6b7280;
}

.btn-icon--danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.icon {
  width: 20px;
  height: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
</style>
