<template>
  <div class="filter-container">
    <!-- 1depth: 가로 스크롤 탭 -->
    <div class="controls-section">
      <div class="category-tabs-wrapper">
        <div class="scroll-fade-left" :class="{ visible: showLeftFade }"></div>
        <div
            class="category-tabs"
            ref="tabsRef"
            @scroll="handleScroll"
        >
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
          </button>
        </div>
        <div class="scroll-fade-right" :class="{ visible: showRightFade }"></div>
      </div>
    </div>

    <!-- 2depth: 서브 카테고리 -->
    <Transition name="slide-fade">
      <div v-if="selectedCategory?.children?.length > 0" class="sub-category-section">
        <div class="sub-indicator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
        <div class="sub-tabs">
          <button
              @click="handleSubCategoryClick(null)"
              :class="['sub-tab', { active: selectedSubCategory === null }]"
          >
            {{ selectedCategory.categoryName }} 전체
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
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

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
    default: true
  },
  initialSelected: {
    type: [Number, String, null],
    default: null
  }
});

const emit = defineEmits(['update:viewMode', 'category-change']);

const selectedCategory = ref(null);
const selectedSubCategory = ref(null);
const tabsRef = ref(null);
const showLeftFade = ref(false);
const showRightFade = ref(true);

const handleScroll = () => {
  if (!tabsRef.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = tabsRef.value;
  showLeftFade.value = scrollLeft > 10;
  showRightFade.value = scrollLeft < scrollWidth - clientWidth - 10;
};

onMounted(() => {
  if (props.initialSelected === null) {
    handleAllClick();
  } else {
    findAndSelectCategory(props.initialSelected);
  }
  setTimeout(handleScroll, 100);
});

watch(() => props.initialSelected, (newVal) => {
  if (newVal === null) {
    selectedCategory.value = null;
    selectedSubCategory.value = null;
  } else {
    findAndSelectCategory(newVal);
  }
});

const findAndSelectCategory = (categoryId) => {
  for (const cat of props.categories) {
    if (cat.categoryId === categoryId) {
      selectedCategory.value = cat;
      selectedSubCategory.value = null;
      return;
    }
    if (cat.children) {
      const sub = cat.children.find(c => c.categoryId === categoryId);
      if (sub) {
        selectedCategory.value = cat;
        selectedSubCategory.value = sub;
        return;
      }
    }
  }
};

const handleAllClick = () => {
  selectedCategory.value = null;
  selectedSubCategory.value = null;
  emit('category-change', {
    categoryId: null,
    category: null,
    subCategory: null
  });
};

const handleCategoryClick = (category) => {
  selectedCategory.value = category;
  selectedSubCategory.value = null;
  emit('category-change', {
    categoryId: category.categoryId,
    category: category,
    subCategory: null
  });
};

const handleSubCategoryClick = (subCategory) => {
  selectedSubCategory.value = subCategory;
  emit('category-change', {
    categoryId: subCategory ? subCategory.categoryId : selectedCategory.value.categoryId,
    category: selectedCategory.value,
    subCategory: subCategory
  });
};
</script>

<style scoped>
.filter-container {
  background: #FAFAFA;
  border-bottom: 1px solid #f0f0f0;
}

/* 메인 컨트롤 섹션 */
.controls-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
}

@media (min-width: 1024px) {
  .controls-section {
    padding: 16px 24px;
  }
}

/* 카테고리 탭 래퍼 */
.category-tabs-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

/* 스크롤 페이드 */
.scroll-fade-left,
.scroll-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 32px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1;
}

.scroll-fade-left {
  left: 0;
  background: linear-gradient(to right, #FAFAFA 20%, transparent 100%);
}

.scroll-fade-right {
  right: 0;
  background: linear-gradient(to left, #FAFAFA 20%, transparent 100%);
}

.scroll-fade-left.visible,
.scroll-fade-right.visible {
  opacity: 1;
}

/* 1depth 탭 */
.category-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding: 2px;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 6px;
  background: #ffffff;
  color: #888888;
  border: 1px solid #eee;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.category-tab:hover {
  border-color: #ddd;
  color: #555555;
}

.category-tab.active {
  background: #9933EA;
  color: #ffffff;
  border-color: #9933EA;
  font-weight: 600;
}

/* 2depth 서브카테고리 */
.sub-category-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 12px;
}

@media (min-width: 1024px) {
  .sub-category-section {
    padding: 0 24px 16px;
  }
}

.sub-indicator {
  display: flex;
  align-items: center;
  color: #d0d0d0;
  flex-shrink: 0;
}

.sub-indicator svg {
  width: 14px;
  height: 14px;
}

.sub-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-tabs::-webkit-scrollbar {
  display: none;
}

.sub-tab {
  padding: 5px 12px;
  border-radius: 5px;
  background: transparent;
  color: #999999;
  border: 1px solid #eeeeee;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sub-tab:hover {
  border-color: #dddddd;
  color: #666666;
}

.sub-tab.active {
  background: #FAF5FF;
  color: #9933EA;
  border-color: #9933EA;
  font-weight: 600;
}

/* Transition */
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>