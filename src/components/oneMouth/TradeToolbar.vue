// ============================================================
// 3. TradeToolbar.vue (검색/정렬 툴바)
// ============================================================

<template>
  <div class="toolbar">
    <div class="search-section">
      <input
          type="text"
          class="search-input"
          :value="searchKeyword"
          @input="handleSearchInput"
          @keyup.enter="handleSearchSubmit"
          placeholder="상품명, 키워드로 검색하세요"
      />
    </div>

    <div class="sort-section">
      <button
          v-for="option in sortOptions"
          :key="option.value"
          class="sort-button"
          :class="{ active: currentSort === option.value }"
          @click="handleSortChange(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  },
  currentSort: {
    type: String,
    default: 'latest'
  }
});

const emit = defineEmits(['update:search', 'search:submit', 'update:sort']);

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'price_asc', label: '낮은 가격순' },
  { value: 'popular', label: '인기순' }
];

const handleSearchInput = (event) => {
  emit('update:search', event.target.value);
};

const handleSearchSubmit = () => {
  emit('search:submit');
};

const handleSortChange = (sortValue) => {
  if (props.currentSort !== sortValue) {
    emit('update:sort', sortValue);
  }
};
</script>

<style scoped>
.toolbar {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 280px;
  max-width: 480px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: #F9FAFB;
  color: #111827;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #4F46E5;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.search-input::placeholder {
  color: #9CA3AF;
}

.sort-section {
  display: flex;
  gap: 8px;
}

.sort-button {
  padding: 8px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.sort-button:hover {
  border-color: #4F46E5;
  color: #4F46E5;
}

.sort-button.active {
  background: #4F46E5;
  border-color: #4F46E5;
  color: white;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }

  .search-section {
    max-width: none;
  }

  .sort-section {
    width: 100%;
    justify-content: space-between;
  }

  .sort-button {
    flex: 1;
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>