<template>
  <div class="modal-overlay" @click="$emit('go-home')">
    <div class="modal-content" @click.stop>
      <div class="success-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" fill="#ECFDF5" stroke="#059669" stroke-width="3"/>
          <path d="M25 40L35 50L55 30" stroke="#059669" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>제품 등록 완료!</h3>
      <p>
        새 제품이 성공적으로 등록되었습니다<br>
        관리자 승인 후 다른 사용자들도 이용할 수 있습니다
      </p>
      <div class="modal-actions">
        <button class="modal-btn primary" @click="$emit('view-products')">
          제품 목록 보기
        </button>
        <button class="modal-btn secondary" @click="$emit('go-home')">
          홈으로 이동
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['view-products', 'go-home'])
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

.success-icon {
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
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