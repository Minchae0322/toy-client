<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <button @click="$emit('back')" class="btn-back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>상품 등록</h1>
      </div>

      <div class="header-actions">
        <button @click="$emit('draft')" :disabled="saving" class="btn-draft">
          임시저장
        </button>
        <button @click="$emit('submit')" :disabled="saving || !isValid" class="btn-submit">
          {{ saving ? '등록 중...' : '등록하기' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  saving: Boolean,
  isValid: Boolean
});

defineEmits(['back', 'draft', 'submit']);
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.header-container {
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-back {
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #374151;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-back:hover {
  background-color: #f9fafb;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-draft {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-draft:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-submit {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background-color: #4f46e5;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  background-color: #4338ca;
}

.btn-draft:disabled,
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>