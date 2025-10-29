<template>
  <div>
    <!-- Category & View Controls -->
    <div class="controls-section">
      <!-- 전체 버튼 (showAllButton prop이 true일 때만) -->
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
          <svg v-if="category.children && category.children.length > 0"
               class="chevron"
               :class="{ rotated: showSubCategories && selectedCategory?.categoryId === category.categoryId }"
               viewBox="0 0 16 16"
               fill="currentColor">
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
/* CSS Variables - 부모에서 정의된 변수 사용 */
.controls-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 0;
  background: var(--card, #FFFFFF);
  border-bottom: 1px solid var(--border, #F0F0F3);
}

@media (min-width: 1024px) {
  .controls-section {
    padding: 24px 40px 0;
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
  color: var(--secondary, #737380);
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
  background: var(--hover, #F5F5F7);
  color: var(--primary, #1A1A1A);
}

.category-tab.active {
  background: var(--primary, #1A1A1A);
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
  background: var(--bg, #FAFBFC);
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
  color: var(--secondary, #737380);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.view-btn:hover {
  color: var(--primary, #1A1A1A);
}

.view-btn.active {
  background: white;
  color: var(--primary, #1A1A1A);
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
  background: var(--card, #FFFFFF);
  border-bottom: 1px solid var(--border, #F0F0F3);
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-category-section::-webkit-scrollbar {
  display: none;
}

@media (min-width: 1024px) {
  .sub-category-section {
    padding: 16px 40px 20px;
  }
}

.sub-tab {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--bg, #FAFBFC);
  color: var(--secondary, #737380);
  border: none;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.sub-tab:hover {
  background: var(--hover, #F5F5F7);
  color: var(--primary, #1A1A1A);
}

.sub-tab.active {
  background: #FFF7ED;
  color: var(--accent, #FF6B35);
  border: 1px solid var(--accent, #FF6B35);
}
</style>