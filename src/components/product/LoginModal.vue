<template>
  <div class="login-modal-overlay" @click="$emit('close')">
    <div class="login-modal-content" @click.stop>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" class="modal-icon">
        <circle cx="32" cy="32" r="30" stroke="#D1D5DB" stroke-width="3"/>
        <path d="M32 20V32" stroke="#6B7280" stroke-width="3" stroke-linecap="round"/>
        <circle cx="32" cy="40" r="2" fill="#6B7280"/>
      </svg>
      <h3>로그인이 필요한 기능입니다</h3>
      <p>상품에 좋아요를 표시하려면 로그인해주세요</p>
      <div class="modal-actions">
        <button class="modal-btn secondary" @click="$emit('close')">
          나중에 하기
        </button>
        <router-link to="/login" class="modal-btn primary" @click="$emit('close')">
          로그인하기
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close'])
</script>

<style scoped>
.login-modal-overlay {
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

.login-modal-content {
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  max-width: 420px;
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

.login-modal-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.login-modal-content p {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 28px;
  line-height: 1.6;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 130px;
  letter-spacing: -0.01em;
}

.modal-btn.secondary {
  background: #F3F4F6;
  color: #6B7280;
}

.modal-btn.secondary:hover {
  background: #E5E7EB;
  color: #374151;
}

.modal-btn.primary {
  background: #059669;
  color: white;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.modal-btn.primary:hover {
  background: #047857;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}

@media (max-width: 480px) {
  .login-modal-content {
    padding: 32px 24px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }
}
</style>