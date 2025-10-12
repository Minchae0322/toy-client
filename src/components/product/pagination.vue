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
  background: white;
  border: 1px solid #F3F4F6;
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.page-btn,
.page-nav-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.01em;
}

.page-btn:hover:not(.active),
.page-nav-btn:hover:not(:disabled) {
  border-color: #059669;
  color: #059669;
  background: #F0FDF4;
}

.page-btn.active {
  background: #059669;
  color: white;
  border-color: #059669;
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