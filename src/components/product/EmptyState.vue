<!-- EmptyState.vue -->
<template>
  <div class="empty-container">
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" class="empty-icon">
      <path d="M36.6667 36.6667C36.6667 34.0145 38.8145 31.8667 41.4667 31.8667H60.4667C63.1188 31.8667 65.2667 34.0145 65.2667 36.6667V55.6667C65.2667 58.3188 63.1188 60.4667 60.4667 60.4667H41.4667C38.8145 60.4667 36.6667 58.3188 36.6667 55.6667V36.6667Z" stroke="#D1D5DB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28 43.3333H19.5333C16.8812 43.3333 14.7333 41.1855 14.7333 38.5333V19.5333C14.7333 16.8812 16.8812 14.7333 19.5333 14.7333H38.5333C41.1855 14.7333 43.3333 16.8812 43.3333 19.5333V28" stroke="#D1D5DB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="51" cy="46" r="8" stroke="#D1D5DB" stroke-width="3"/>
      <path d="M56.5 51.5L62 57" stroke="#D1D5DB" stroke-width="3" stroke-linecap="round"/>
    </svg>
    <h3>검색 결과가 없습니다</h3>
    <p>다른 키워드로 검색해보세요</p>
    <button @click="$emit('clear')" class="clear-search-btn">
      검색 초기화
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['clear'])
</script>

<style scoped>
.empty-container {
  padding: 80px 24px;
  text-align: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-container h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.empty-container p {
  font-size: 14px;
  color: var(--c-text-500);
  margin-bottom: 24px;
  font-weight: 500;
}

.clear-search-btn {
  padding: 12px 24px;
  background: var(--bg-subtle);
  color: var(--c-text-600);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.clear-search-btn:hover {
  background: var(--border-default);
  border-color: var(--c-text-300);
}
</style>