<template>
  <div class="pagination">
    <button
        class="page-nav-btn"
        :disabled="currentPage === 0"
        @click="$emit('go-to-page', currentPage - 1)"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button
        v-for="page in visiblePages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage + 1 }"
        @click="$emit('go-to-page', page - 1)"
    >
      {{ page }}
    </button>

    <button
        class="page-nav-btn"
        :disabled="currentPage === totalPages - 1"
        @click="$emit('go-to-page', currentPage + 1)"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  visiblePages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['go-to-page'])
</script>

<style scoped>
.pagination {
  padding: 24px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.page-btn,
.page-nav-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--c-text-500);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.01em;
}

.page-btn:hover:not(.active),
.page-nav-btn:hover:not(:disabled) {
  border-color: var(--c-success);
  color: var(--c-success);
  background: var(--c-success-soft);
}

.page-btn.active {
  background: var(--c-success);
  color: white;
  border-color: var(--c-success);
}

.page-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .pagination {
    padding: 20px 16px;
    gap: 6px;
  }

  .page-btn,
  .page-nav-btn {
    min-width: 36px;
    height: 36px;
    font-size: 13px;
  }
}
</style>