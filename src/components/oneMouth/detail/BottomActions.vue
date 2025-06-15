<template>
  <div class="bottom-actions">
    <button @click="$emit('start-chat')" class="action-button secondary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      채팅하기
    </button>
    <button @click="$emit('request-share')" class="action-button primary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16,6 12,2 8,6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
      한입 나눔 요청
    </button>
  </div>
</template>

<script>
export default {
  name: 'BottomActions',
  props: {
    food: {
      type: Object,
      required: true
    }
  },
  emits: ['start-chat', 'request-share']
};
</script>

<style scoped>
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1600px;
  background: white;
  padding: 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
}

.action-button {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-button.secondary {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.action-button.secondary:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
}

.action-button.primary {
  background-color: #1DCD9F;
  color: white;
}

.action-button.primary:hover {
  background-color: #169976;
  transform: translateY(-1px);
}

.action-button:active {
  transform: translateY(0);
}

.action-button svg {
  flex-shrink: 0;
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .bottom-actions {
    padding: 16px;
  }

  .action-button {
    padding: 14px;
    font-size: 15px;
  }
}
</style>