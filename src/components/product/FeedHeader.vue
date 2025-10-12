<template>
  <div class="feed-header">
    <div class="sort-options">
      <button
          v-for="option in sortOptions"
          :key="option.value"
          class="sort-btn"
          :class="{ active: currentSort === option.value }"
          @click="$emit('set-sort', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div v-if="totalElements > 0" class="result-count">
      총 <strong>{{ totalElements.toLocaleString() }}</strong>개
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  sortOptions: {
    type: Array,
    required: true
  },
  currentSort: {
    type: String,
    required: true
  },
  totalElements: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['set-sort'])
</script>

<style scoped>
.feed-header {
  background: white;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
  border: 1px solid #F3F4F6;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sort-options {
  display: flex;
  gap: 6px;
  background: #F9FAFB;
  padding: 4px;
  border-radius: 8px;
}

.sort-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.sort-btn:hover {
  color: #059669;
  background: rgba(5, 150, 105, 0.08);
}

.sort-btn.active {
  background: white;
  color: #059669;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.result-count {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.result-count strong {
  color: #059669;
  font-weight: 700;
}

@media (max-width: 768px) {
  .feed-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .sort-options {
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .sort-options::-webkit-scrollbar {
    height: 4px;
  }

  .sort-options::-webkit-scrollbar-thumb {
    background: #E5E7EB;
    border-radius: 2px;
  }

  .result-count {
    text-align: center;
  }
}
</style>