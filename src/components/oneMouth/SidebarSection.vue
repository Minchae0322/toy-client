<template>
  <aside class="sidebar">
    <div class="search-section">
      <h3>🔍 검색</h3>
      <input
          type="text"
          class="search-box"
          placeholder="맛있는 한입거리를 찾아보세요..."
          :value="searchQuery"
          @input="$emit('update-query', $event.target.value)"
      >
    </div>

    <div class="filter-section">
      <h3>📂 카테고리</h3>

      <!-- 카테고리 로딩 중 -->
      <div v-if="categoriesLoading" class="categories-loading">
        <div class="loading-spinner"></div>
        <p>카테고리 로딩 중...</p>
      </div>

      <!-- 카테고리 목록 -->
      <div v-else class="filter-list">
        <div
            class="filter-item"
            :class="{ active: activeFilter === getFilterKey(filter) }"
            v-for="filter in filterOptions"
            :key="getFilterKey(filter)"
            @click="$emit('set-filter', getFilterKey(filter))"
        >
          <span class="filter-icon">{{ getFilterIcon(filter) }}</span>
          <span class="filter-label">{{ getFilterLabel(filter) }}</span>
          <span v-if="filter.itemCount > 0" class="item-count">({{ filter.itemCount }})</span>
        </div>
      </div>

      <!-- 카테고리 로드 실패 시 -->
      <div v-if="!categoriesLoading && filterOptions.length <= 1" class="categories-error">
        <p>카테고리를 불러올 수 없습니다 😅</p>
        <button @click="$emit('retry-categories')" class="retry-btn">다시 시도</button>
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
    },
    categoriesLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-query', 'set-filter', 'retry-categories'],
  methods: {
    // 백엔드/프론트엔드 카테고리 구조 통합 처리
    getFilterKey(filter) {
      // 백엔드 카테고리: categoryKey 사용
      // 기존 프론트엔드 카테고리: key 사용
      return filter.categoryKey || filter.key;
    },

    getFilterIcon(filter) {
      // 백엔드 카테고리: categoryIcon 사용
      // 기존 프론트엔드 카테고리: icon 사용
      return filter.categoryIcon || filter.icon || '🍽️';
    },

    getFilterLabel(filter) {
      // 백엔드 카테고리: categoryName 사용
      // 기존 프론트엔드 카테고리: label 사용
      return filter.categoryName || filter.label;
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

/* 카테고리 로딩 */
.categories-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #169976;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.categories-loading p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 카테고리 에러 */
.categories-error {
  text-align: center;
  padding: 20px;
}

.categories-error p {
  color: #666;
  margin-bottom: 12px;
}

.retry-btn {
  padding: 8px 16px;
  background: #169976;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #128a64;
}

/* 필터 목록 */
.filter-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* 스크롤 제거 - 전체 리스트 표시 */
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
  position: relative;
}

.filter-item:hover {
  background: #f8f9fa;
  border-color: #1DCD9F;
  transform: translateX(2px);
}

.filter-item.active {
  background: #169976;
  color: white;
  border-color: #169976;
  font-weight: 600;
}

.filter-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.filter-label {
  flex: 1;
  text-align: left;
}

.item-count {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  margin-left: auto;
}

.filter-item.active .item-count {
  color: rgba(255, 255, 255, 0.8);
}

/* 반응형 */
@media (max-width: 1024px) {
  .sidebar {
    width: 100%;
    margin-bottom: 20px;
  }

  .filter-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
    max-height: none;
  }

  .filter-item {
    padding: 10px 12px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .search-section,
  .filter-section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .filter-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>