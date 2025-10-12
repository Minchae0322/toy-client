<template>
  <div class="form-actions">
    <button
        type="button"
        class="btn btn-secondary"
        @click="$emit('cancel')"
        :disabled="isLoading || !isLoggedIn"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>취소</span>
    </button>

    <button
        type="submit"
        class="btn btn-primary"
        :disabled="!canSubmit"
        :class="{ 'loading': isLoading, 'disabled': !isLoggedIn || !isFormValid }"
    >
      <template v-if="isLoading">
        <div class="spinner-small"></div>
        <span>등록 중...</span>
      </template>
      <template v-else-if="!isLoggedIn">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <path d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>로그인 필요</span>
      </template>
      <template v-else-if="!isFormValid">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="8" cy="11" r="0.5" fill="currentColor"/>
        </svg>
        <span>필수 항목 입력 필요 ({{ completionPercentage }}%)</span>
      </template>
      <template v-else>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>제품 등록하기</span>
      </template>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  canSubmit: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  },
  isFormValid: {
    type: Boolean,
    required: true
  },
  completionPercentage: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['cancel'])
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #F3F4F6;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2);
}

.btn-secondary {
  background: #F3F4F6;
  color: #6B7280;
  border: 2px solid #E5E7EB;
}

.btn-secondary:hover:not(:disabled) {
  background: #E5E7EB;
  color: #374151;
  border-color: #D1D5DB;
}

.btn-primary {
  flex: 1;
  background: #059669;
  color: white;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.btn-primary:hover:not(:disabled):not(.disabled) {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}

.btn:disabled,
.btn.disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  border-color: #E5E7EB;
}

.btn.loading {
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .btn-primary {
    order: -1;
  }
}
</style>