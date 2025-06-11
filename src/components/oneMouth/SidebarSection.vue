<template>
  <aside class="sidebar">
    <div class="search-section">
      <h3>🔍 검색</h3>
      <input
          type="text"
          class="search-box"
          placeholder="맛있는 음식을 찾아보세요..."
          :value="searchQuery"
          @input="$emit('update-query', $event.target.value)"
      >
    </div>

    <div class="filter-section">
      <h3>📂 카테고리</h3>
      <div class="filter-list">
        <div
            class="filter-item"
            :class="{ active: activeFilter === filter.key }"
            v-for="filter in filterOptions"
            :key="filter.key"
            @click="$emit('set-filter', filter.key)"
        >
          <span>{{ filter.icon }}</span>
          <span>{{ filter.label }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'SidebarSection',
  props: {
    searchQuery: {
      type: String,
      required: true
    },
    filterOptions: {
      type: Array,
      required: true
    },
    activeFilter: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.search-section,
.filter-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.search-section h3,
.filter-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
}

.search-box {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  width: 100%;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.search-box:focus {
  outline: none;
  border-color: #1DCD9F;
  background: white;
  box-shadow: 0 0 0 3px rgba(29, 205, 159, 0.1);
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item {
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item:hover {
  background: #f8f9fa;
  border-color: #1DCD9F;
}

.filter-item.active {
  background: #169976;
  color: white;
  border-color: #169976;
}
</style>
