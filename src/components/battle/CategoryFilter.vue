<template>
  <div>
    <!-- Category & View Controls -->
    <div class="controls-section">
      <div class="category-tabs">
        <button
            v-for="category in categories"
            :key="category.categoryId"
            @click="handleCategoryClick(category)"
            :class="['category-tab', { active: selectedCategory?.categoryId === category.categoryId }]"
        >
          {{ category.categoryName }}
          <svg v-if="category.children && category.children.length > 0"
               class="chevron"
               :class="{ rotated: showSubCategories && selectedCategory?.categoryId === category.categoryId }"
               viewBox="0 0 16 16"
               fill="currentColor">
            <path d="M4.293 5.293a1 1 0 011.414 0L8 7.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>

      <!-- View Toggle - Desktop Only -->
      <div class="view-toggle">
        <button
            @click="$emit('update:viewMode', 'feed')"
            :class="['view-btn', { active: viewMode === 'feed' }]"
            title="피드 뷰"
        >
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          <span>피드</span>
        </button>
        <button
            @click="$emit('update:viewMode', 'list')"
            :class="['view-btn', { active: viewMode === 'list' }]"
            title="리스트 뷰"
        >
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
          </svg>
          <span>리스트</span>
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
  }
});

const emit = defineEmits(['update:viewMode', 'category-change']);

const selectedCategory = ref(null);
const selectedSubCategory = ref(null);
const showSubCategories = ref(false);

const handleCategoryClick = (category) => {
  selectedCategory.value = category;
  selectedSubCategory.value = null;

  if (category.children && category.children.length > 0) {
    showSubCategories.value = true;
  } else {
    showSubCategories.value = false;
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
.controls-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 0;
  background: var(--card);
  border-bottom: 1px solid var(--border);
}

@media (min-width: 1024px) {
  .controls-section {
    padding: 24px 32px 0;
  }
}

.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 16px;
  scrollbar-width: none;
  flex: 1;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  padding: 10px 18px;
  border-radius: 12px;
  background: transparent;
  color: var(--secondary);
  border: none;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}

.category-tab:hover {
  background: var(--hover);
  color: var(--primary);
}

.category-tab.active {
  background: var(--primary);
  color: white;
}

.category-tab .chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.category-tab .chevron.rotated {
  transform: rotate(180deg);
}

/* View Toggle */
.view-toggle {
  display: none;
  background: var(--bg);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

@media (min-width: 1024px) {
  .view-toggle {
    display: flex;
  }
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.view-btn:hover {
  color: var(--primary);
}

.view-btn.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.view-btn .icon {
  width: 18px;
  height: 18px;
}

/* Sub Category */
.sub-category-section {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-category-section::-webkit-scrollbar {
  display: none;
}

@media (min-width: 1024px) {
  .sub-category-section {
    padding: 16px 32px 20px;
  }
}

.sub-tab {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--bg);
  color: var(--secondary);
  border: none;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.sub-tab:hover {
  background: var(--hover);
  color: var(--primary);
}

.sub-tab.active {
  background: #FFF7ED;
  color: var(--accent);
  border: 1px solid var(--accent);
}
</style>