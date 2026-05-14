<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" class="modal-icon">
        <rect x="20" y="35" width="40" height="30" rx="4" stroke="#059669" stroke-width="3"/>
        <path d="M28 35V25C28 19.4772 32.4772 15 38 15H42C47.5228 15 52 19.4772 52 25V35" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
        <circle cx="40" cy="50" r="3" fill="#059669"/>
      </svg>
      <h3>로그인이 필요합니다</h3>
      <p>
        제품을 등록하려면 먼저 로그인해주세요<br>
        로그인 후 현재 페이지로 돌아와서 작업을 계속할 수 있습니다
      </p>
      <div class="modal-actions">
        <button class="modal-btn primary" @click="$emit('login')">
          로그인하러 가기
        </button>
        <button class="modal-btn secondary" @click="$emit('close')">
          홈으로 돌아가기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['login', 'close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--bg-elevated);
  border-radius: 20px;
  padding: 40px;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-icon {
  margin-bottom: 24px;
}

.modal-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.modal-content p {
  font-size: 15px;
  color: var(--c-text-500);
  line-height: 1.6;
  margin-bottom: 32px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.modal-btn.primary {
  background: var(--c-success);
  color: white;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.modal-btn.primary:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}

.modal-btn.secondary {
  background: var(--border-default);
  color: var(--c-text-500);
}

.modal-btn.secondary:hover {
  background: var(--border-strong);
  color: var(--c-text-600);
}

@media (max-width: 480px) {
  .modal-content {
    padding: 32px 24px;
  }

  .modal-content h3 {
    font-size: 20px;
  }

  .modal-content p {
    font-size: 14px;
  }
}
</style>