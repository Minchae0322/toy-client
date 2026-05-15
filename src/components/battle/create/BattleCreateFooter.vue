<template>
  <div class="action-footer">
    <div class="action-container">
      <div class="step-info">
        {{ currentStep }}/4 단계 - {{ steps[currentStep - 1] }}
      </div>
      <div class="action-buttons">
        <button class="btn-secondary" @click="$emit('previous')">
          {{ currentStep === 1 ? '취소' : '이전' }}
        </button>
        <button
            class="btn-primary"
            @click="$emit('next')"
            :disabled="!canProceed || loading"
        >
          <span v-if="loading && currentStep === 4" class="loading-spinner"></span>
          {{ loading && currentStep === 4 ? '생성 중...' : (currentStep === 4 ? '배틀 생성하기' : '다음 단계') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  },
  canProceed: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['previous', 'next']);
</script>

<style scoped>
.action-footer {
  background: var(--bg-elevated);
  border-top: 1px solid #F0F0F3;
  /* iOS 홈 인디케이터 회피 */
  padding: 24px 40px calc(24px + env(safe-area-inset-bottom));
  position: sticky;
  bottom: 0;
  z-index: 20;
}

.action-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-info {
  font-size: 14px;
  color: var(--c-text-500);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 20px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  color: var(--c-text-500);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: var(--c-text-400);
  color: var(--text-primary);
}

.btn-primary {
  padding: 10px 24px;
  background: var(--c-ink-900);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--c-ink-900);
  transform: translateY(-1px);
}
/* 모바일 sticky hover 차단 */
@media (hover: none) {
  .btn-primary:hover {
    transform: none;
  }
}

.btn-primary:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
  transform: none;
}

.btn-primary:disabled:not(.loading) {
  background: var(--border-strong);
}

.btn-primary:has(.loading-spinner) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--c-text-600);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 모바일 반응형 ===== */
@media (max-width: 768px) {
  .action-footer {
    padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  }

  .action-container {
    flex-direction: column;
    gap: 12px;
  }

  .step-info {
    font-size: 13px;
    text-align: center;
  }

  .action-buttons {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .btn-secondary,
  .btn-primary {
    padding: 14px 16px;
    font-size: 15px;
    justify-content: center;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .action-footer {
    padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
  }

  .step-info {
    font-size: 12px;
  }

  .action-buttons {
    gap: 10px;
  }

  .btn-secondary,
  .btn-primary {
    padding: 12px 14px;
    font-size: 14px;
    border-radius: 10px;
  }
}
</style>