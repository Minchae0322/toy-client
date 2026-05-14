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
  background: var(--bg-base);
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
  border: 1px solid var(--border-default);
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sort-options {
  display: flex;
  gap: 6px;
  background: var(--bg-subtle);
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
  color: var(--c-text-500);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.sort-btn:hover {
  color: var(--c-success);
  background: rgba(5, 150, 105, 0.08);
}

.sort-btn.active {
  background: var(--bg-elevated);
  color: var(--c-success);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.result-count {
  font-size: 14px;
  color: var(--c-text-500);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.result-count strong {
  color: var(--c-success);
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
    background: var(--border-strong);
    border-radius: 2px;
  }

  .result-count {
    text-align: center;
  }
}
</style>