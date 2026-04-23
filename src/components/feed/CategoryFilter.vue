<template>
  <div class="category-filter">
    <!-- 1depth 카테고리 탭 -->
    <div class="controls-section">
      <div class="category-tabs-wrapper">
        <div class="category-tabs">
          <button
              @click="handleCategoryClick(null)"
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

    <!-- 2depth 서브 카테고리 -->
    <Transition name="slide">
      <div v-if="selectedCategory?.children?.length > 0" class="sub-category-section">
        <div class="sub-category-indicator">
          <svg class="branch-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5v-1z"/>
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
import { ref, watch } from 'vue';

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
  // 외부에서 초기값 설정 가능
  initialCategoryId: {
    type: [Number, String, null],
    default: null
  }
});

const emit = defineEmits(['update:viewMode', 'category-change']);

const selectedCategory = ref(null);
const selectedSubCategory = ref(null);

// 카테고리 클릭 핸들러
const handleCategoryClick = (category) => {
  selectedCategory.value = category;
  selectedSubCategory.value = null;

  emitChange();
};

// 서브 카테고리 클릭 핸들러
const handleSubCategoryClick = (subCategory) => {
  selectedSubCategory.value = subCategory;

  emitChange();
};

// 변경 이벤트 발송
const emitChange = () => {
  // 최종 선택된 카테고리 ID 계산
  let categoryId = null;

  if (selectedSubCategory.value) {
    categoryId = selectedSubCategory.value.categoryId;
  } else if (selectedCategory.value) {
    categoryId = selectedCategory.value.categoryId;
  }

  emit('category-change', {
    categoryId,
    parentCategory: selectedCategory.value,
    subCategory: selectedSubCategory.value
  });
};

// 초기값 설정
watch(() => props.initialCategoryId, (newId) => {
  if (newId === null) {
    selectedCategory.value = null;
    selectedSubCategory.value = null;
    return;
  }

  // 카테고리 찾기
  for (const cat of props.categories) {
    if (cat.categoryId === newId) {
      selectedCategory.value = cat;
      selectedSubCategory.value = null;
      return;
    }
    // children에서 찾기
    if (cat.children) {
      const sub = cat.children.find(c => c.categoryId === newId);
      if (sub) {
        selectedCategory.value = cat;
        selectedSubCategory.value = sub;
        return;
      }
    }
  }
}, { immediate: true });
</script>

<style scoped>
.category-filter {
  background: var(--card, #fff);
  border-bottom: 1px solid var(--border, #eee);
}

/* Controls Section */
.controls-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px 0;
}

@media (min-width: 1024px) {
  .controls-section {
    padding: 20px 32px 0;
  }
}

/* Category Tabs - 1depth */
.category-tabs-wrapper {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.category-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg, #f5f5f5);
  border-radius: 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  flex: 1;
  min-width: fit-content;
  padding: 10px 20px;
  border-radius: 10px;
  background: transparent;
  color: var(--secondary, #666);
  border: none;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.category-tab:hover {
  color: var(--primary, #111);
}

.category-tab.active {
  background: #fff;
  color: var(--primary, #111);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* View Toggle */
.view-toggle {
  display: none;
  background: var(--bg, #f5f5f5);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
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
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary, #666);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.view-btn:hover {
  color: var(--primary, #111);
}

.view-btn.active {
  background: white;
  color: var(--primary, #111);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.view-btn .icon {
  width: 18px;
  height: 18px;
}

/* Sub Category - 2depth */
.sub-category-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px 16px;
}

@media (min-width: 1024px) {
  .sub-category-section {
    padding: 12px 32px 20px;
  }
}

.sub-category-indicator {
  display: flex;
  align-items: center;
  color: var(--secondary, #999);
}

.branch-icon {
  width: 16px;
  height: 16px;
  opacity: 0.4;
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
  padding: 8px 16px;
  border-radius: 20px;
  background: transparent;
  color: var(--secondary, #666);
  border: none;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.sub-tab:hover {
  background: var(--hover, #f5f5f5);
  color: var(--primary, #111);
}

.sub-tab.active {
  background: var(--accent-bg, #f3e8ff);
  color: var(--accent, #7c3aed);
  font-weight: 600;
}

/* Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>