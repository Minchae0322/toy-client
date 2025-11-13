<template>
  <div class="filter-container">
    <!-- 메인 필터 바 -->
    <div class="controls-section">
      <div class="category-tabs">
        <button
            v-if="showAllButton"
            @click="handleAllClick"
            :class="['category-tab', { active: selectedCategory === null }]"
        >
          전체
        </button>

        <button
            v-for="category in categories"
            :key="category.categoryId"
            @click="handleCategoryClick(category)"
            :class="['category-tab', { active: selectedCategory?.categoryId === category.categoryId }]"
        >
          {{ category.categoryName }}
          <svg
              v-if="category.children && category.children.length > 0"
              class="chevron"
              :class="{ rotated: showSubCategories && selectedCategory?.categoryId === category.categoryId }"
              viewBox="0 0 16 16"
              fill="currentColor"
          >
            <path d="M4.293 5.293a1 1 0 011.414 0L8 7.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Sub-category -->
    <div v-if="showSubCategories && selectedCategory?.children?.length > 0" class="sub-category-section">
      <button
          @click="handleSubCategoryClick(null)"
          :class="['sub-tab', { active: selectedSubCategory === null }]"
      >
        전체
      </button>
      <button
          v-for="sub in selectedCategory.children"
          :key="sub.categoryId"
          @click="handleSubCategoryClick(sub)"
          :class="['sub-tab', { active: selectedSubCategory?.categoryId === sub.categoryId }]"
      >
        {{ sub.categoryName }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  viewMode: {
    type: String,
    default: 'feed'
  },
  showViewToggle: {
    type: Boolean,
    default: true
  },
  showAllButton: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:viewMode', 'category-change']);

const selectedCategory = ref(null);
const selectedSubCategory = ref(null);
const showSubCategories = ref(false);

const handleAllClick = () => {
  selectedCategory.value = null;
  selectedSubCategory.value = null;
  showSubCategories.value = false;

  emit('category-change', {
    category: null,
    subCategory: null
  });
};

const handleCategoryClick = (category) => {
  // 이미 선택된 카테고리를 다시 클릭하면 서브카테고리 토글
  if (selectedCategory.value?.categoryId === category.categoryId) {
    showSubCategories.value = !showSubCategories.value;
  } else {
    selectedCategory.value = category;
    selectedSubCategory.value = null;
    showSubCategories.value = category.children?.length > 0;
  }

  emit('category-change', {
    category: category,
    subCategory: null
  });
};

const handleSubCategoryClick = (subCategory) => {
  selectedSubCategory.value = subCategory;
  emit('category-change', {
    category: selectedCategory.value,
    subCategory: subCategory
  });
};
</script>

<style scoped>
.filter-container {
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 메인 컨트롤 섹션 */
.controls-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px 0;
  background: #fafbfc;
  border-bottom: 1px solid #e8e8e8;
}

@media (min-width: 1024px) {
  .controls-section {
    padding: 16px 40px 0;
  }
}

/* 카테고리 탭 */
.category-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 12px;
  scrollbar-width: none;
  flex: 1;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  border-radius: 8px;
  background: #ffffff;
  color: #666666;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.category-tab:hover {
  background: #f5f5f5;
  color: #333333;
}

.category-tab.active {
  background: #2a2a2a;
  color: #ffffff;
  border-color: #2a2a2a;
}

.category-tab.active:hover {
  background: #1a1a1a;
}

.category-tab .chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.15s;
  opacity: 0.6;
}

.category-tab .chevron.rotated {
  transform: rotate(180deg);
}

/* View Toggle */
.view-toggle {
  display: none;
  gap: 2px;
  padding: 2px;
  background: #e8e8e8;
  border-radius: 6px;
}

@media (min-width: 1024px) {
  .view-toggle {
    display: flex;
  }
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  background: transparent;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 500;
  color: #999999;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.view-btn:hover {
  background: #d8d8d8;
  color: #666666;
}

.view-btn.active {
  background: #ffffff;
  color: #333333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.view-btn .icon {
  width: 16px;
  height: 16px;
}

/* 서브 카테고리 섹션 */
.sub-category-section {
  display: flex;
  gap: 6px;
  padding: 12px 20px;
  background: #f8f8f8;
  border-bottom: 1px solid #e8e8e8;
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-category-section::-webkit-scrollbar {
  display: none;
}

@media (min-width: 1024px) {
  .sub-category-section {
    padding: 12px 40px 16px;
  }
}

.sub-tab {
  padding: 7px 14px;
  border-radius: 6px;
  background: #ffffff;
  color: #666666;
  border: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.sub-tab:hover {
  border-color: #c0c0c0;
  background: #fafafa;
  color: #333333;
}

.sub-tab.active {
  background: #4a4a4a;
  color: #ffffff;
  border-color: #4a4a4a;
}

.sub-tab.active:hover {
  background: #3a3a3a;
  border-color: #3a3a3a;
}
</style>