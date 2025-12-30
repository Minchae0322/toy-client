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

      <!-- View Toggle - Desktop Only -->
      <div v-if="showViewToggle" class="view-toggle">
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

    <!-- 2depth: 서브 카테고리 (선택한 카테고리에 children이 있을 때만) -->
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

// 스크롤 페이드 효과 처리
const handleScroll = () => {
  if (!tabsRef.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = tabsRef.value;
  showLeftFade.value = scrollLeft > 10;
  showRightFade.value = scrollLeft < scrollWidth - clientWidth - 10;
};

// 초기 선택 상태 설정
onMounted(() => {
  if (props.initialSelected === null) {
    handleAllClick();
  } else {
    findAndSelectCategory(props.initialSelected);
  }
  // 초기 스크롤 상태 체크
  setTimeout(handleScroll, 100);
});

// initialSelected 변경 감지
watch(() => props.initialSelected, (newVal) => {
  if (newVal === null) {
    selectedCategory.value = null;
    selectedSubCategory.value = null;
  } else {
    findAndSelectCategory(newVal);
  }
});

// 카테고리 ID로 찾아서 선택
const findAndSelectCategory = (categoryId) => {
  for (const cat of props.categories) {
    if (cat.categoryId === categoryId) {
      selectedCategory.value = cat;
      selectedSubCategory.value = null;
      return;
    }
    // children에서 찾기
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

  console.log('📌 [CategoryFilter] 전체 선택');

  emit('category-change', {
    categoryId: null,
    category: null,
    subCategory: null
  });
};

const handleCategoryClick = (category) => {
  selectedCategory.value = category;
  selectedSubCategory.value = null;

  console.log('📌 [CategoryFilter] 카테고리 선택:', category.categoryName);

  emit('category-change', {
    categoryId: category.categoryId,
    category: category,
    subCategory: null
  });
};

const handleSubCategoryClick = (subCategory) => {
  selectedSubCategory.value = subCategory;

  console.log('📌 [CategoryFilter] 서브카테고리 선택:', subCategory?.categoryName || '전체');

  emit('category-change', {
    categoryId: subCategory ? subCategory.categoryId : selectedCategory.value.categoryId,
    category: selectedCategory.value,
    subCategory: subCategory
  });
};
</script>

<style scoped>
.filter-container {
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', sans-serif;
}

/* 메인 컨트롤 섹션 */
.controls-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
}

@media (min-width: 1024px) {
  .controls-section {
    padding: 20px 32px;
  }
}

/* 카테고리 탭 래퍼 */
.category-tabs-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

/* 스크롤 페이드 효과 */
.scroll-fade-left,
.scroll-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1;
}

.scroll-fade-left {
  left: 0;
  background: linear-gradient(to right, #fff 0%, transparent 100%);
}

.scroll-fade-right {
  right: 0;
  background: linear-gradient(to left, #fff 0%, transparent 100%);
}

.scroll-fade-left.visible,
.scroll-fade-right.visible {
  opacity: 1;
}

/* 1depth: 가로 스크롤 탭 */
.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding: 2px 4px;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 4px;
  background: transparent;
  color: #666;
  border: 1px solid #e5e5e5;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;
}

.category-tab:hover {
  border-color: #ccc;
  color: #333;
}

.category-tab.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

/* View Toggle */
.view-toggle {
  display: none;
  gap: 4px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 10px;
  flex-shrink: 0;
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
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.view-btn:hover {
  color: #6b7280;
}

.view-btn.active {
  background: #ffffff;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.view-btn .icon {
  width: 16px;
  height: 16px;
}

/* 2depth: 서브 카테고리 */
.sub-category-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 16px;
  background: #fff;
}

@media (min-width: 1024px) {
  .sub-category-section {
    padding: 0 32px 20px;
  }
}

.sub-indicator {
  display: flex;
  align-items: center;
  color: #d1d5db;
  flex-shrink: 0;
}

.sub-indicator svg {
  width: 16px;
  height: 16px;
}

.sub-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-tabs::-webkit-scrollbar {
  display: none;
}

.sub-tab {
  padding: 5px 12px;
  border-radius: 4px;
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;
}

.sub-tab:hover {
  border-color: #ccc;
  color: #333;
}

.sub-tab.active {
  background: #7c3aed;
  color: #fff;
  border-color: #7c3aed;
}

/* Transition 애니메이션 - 2depth 표시/숨김 */
.slide-fade-enter-active {
  transition: opacity 0.15s ease-out;
}

.slide-fade-leave-active {
  transition: opacity 0.1s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>