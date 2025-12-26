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
  background: white;
  border-top: 1px solid #F0F0F3;
  padding: 24px 40px;
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
  color: #6B7280;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #9CA3AF;
  color: #1A1A1A;
}

.btn-primary {
  padding: 10px 24px;
  background: #1A1A1A;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #000000;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  transform: none;
}

.btn-primary:disabled:not(.loading) {
  background: #E5E7EB;
}

.btn-primary:has(.loading-spinner) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #4B5563;
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
</style>