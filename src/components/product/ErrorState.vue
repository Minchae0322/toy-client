<!-- ErrorState.vue -->
<template>
  <div class="error-container">
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" class="error-icon">
      <path d="M40 73.3333C58.4095 73.3333 73.3333 58.4095 73.3333 40C73.3333 21.5905 58.4095 6.66666 40 6.66666C21.5905 6.66666 6.66666 21.5905 6.66666 40C6.66666 58.4095 21.5905 73.3333 40 73.3333Z" stroke="#EF4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 26.6667V40" stroke="#EF4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 53.3333H40.0333" stroke="#EF4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <h3>상품을 불러올 수 없습니다</h3>
    <p>{{ error }}</p>
    <button @click="$emit('retry')" class="retry-btn">다시 시도</button>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['retry'])
</script>

<style scoped>
.error-container {
  padding: 80px 24px;
  text-align: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.error-icon {
  margin-bottom: 20px;
}

.error-container h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-danger);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.error-container p {
  font-size: 14px;
  color: var(--c-text-500);
  margin-bottom: 24px;
}

.retry-btn {
  padding: 12px 24px;
  background: var(--c-success);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.retry-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}
</style>