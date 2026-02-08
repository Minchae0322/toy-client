<template>
  <div class="filter-container">
    <div class="category-tabs">
      <button
          v-if="showAllButton"
          @click="handleAllClick"
          :class="['category-tab', { active: selectedCategory === null }]"
      >
        전체
      </button>

      <!-- 인기 카테고리 -->
      <button
          v-for="category in displayCategories"
          :key="category.categoryId"
          @click="handleCategoryClick(category)"
          :class="['category-tab', { active: selectedCategory?.categoryId === category.categoryId }]"
      >
        {{ category.categoryName }}
      </button>

      <!-- 로딩 중 -->
      <div v-if="loading" class="loading-placeholder">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>

      <!-- 더보기 버튼 -->
      <button
          v-if="hasMoreCategories"
          @click="goToCategoryPage"
          class="category-tab more-btn"
          title="전체 카테고리"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="19" cy="12" r="2"/>
        </svg>
      </button>
    </div>

    <!-- 2뎁스 하위 카테고리 -->
    <div v-if="selectedCategory && subCategories.length > 0" class="sub-category-tabs">
      <button
          @click="handleSubCategoryClick(null)"
          :class="['sub-category-tab', { active: selectedSubCategory === null }]"
      >
        전체
      </button>
      <button
          v-for="subCat in subCategories"
          :key="subCat.categoryId"
          @click="handleSubCategoryClick(subCat)"
          :class="['sub-category-tab', { active: selectedSubCategory?.categoryId === subCat.categoryId }]"
      >
        {{ subCat.categoryName }}
      </button>
    </div>

    <!-- 선택된 카테고리가 인기 목록에 없을 경우 표시 -->
    <div v-if="showSelectedChip" class="selected-chip-wrapper">
      <button class="selected-chip" @click="goToCategoryPage">
        <span>{{ selectedCategory?.categoryName }}</span>
        <span v-if="selectedSubCategory" class="chip-separator">›</span>
        <span v-if="selectedSubCategory">{{ selectedSubCategory?.categoryName }}</span>
        <svg @click.stop="handleAllClick" class="chip-clear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoryCache } from '@/composables/useCategoryCache.js';

const router = useRouter();
const { loadPopularCategories: loadPopularFromCache } = useCategoryCache();

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  contentType: {
    type: String,
    default: 'PRODUCT' // BATTLE, FEED, PRODUCT
  },
  showAllButton: {
    type: Boolean,
    default: true
  },
  initialCategoryId: {
    type: [Number, String, null],
    default: null
  }
});

const emit = defineEmits(['category-change']);

const selectedCategory = ref(null);
const selectedSubCategory = ref(null);
const popularCategories = ref([]);
const loading = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

// 화면 크기에 따른 카테고리 개수
const maxCategories = computed(() => {
  if (windowWidth.value >= 1280) return 8;
  if (windowWidth.value >= 1024) return 6;
  if (windowWidth.value >= 768) return 5;
  return 3;
});

// 표시할 카테고리 (인기 카테고리 우선, 없으면 props.categories 사용)
const displayCategories = computed(() => {
  const source = popularCategories.value.length > 0
    ? popularCategories.value
    : props.categories;

  const visible = source.slice(0, maxCategories.value);

  // 선택된 카테고리가 visible에 없으면 추가
  if (selectedCategory.value) {
    const isVisible = visible.some(c => c.categoryId === selectedCategory.value.categoryId);
    if (!isVisible) {
      visible.push(selectedCategory.value);
    }
  }

  return visible;
});

const hasMoreCategories = computed(() => {
  const total = popularCategories.value.length > 0
    ? popularCategories.value.length
    : props.categories.length;
  return total > maxCategories.value;
});

// 선택된 카테고리가 표시 목록에 없을 경우 칩으로 표시
const showSelectedChip = computed(() => {
  if (!selectedCategory.value) return false;
  const isInDisplay = displayCategories.value.some(c => c.categoryId === selectedCategory.value.categoryId);
  return !isInDisplay;
});

// 선택된 1뎁스 카테고리의 하위 카테고리 목록
const subCategories = computed(() => {
  if (!selectedCategory.value) return [];
  return selectedCategory.value.children || [];
});

// 윈도우 리사이즈 핸들러
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// 인기 카테고리 조회 (캐시 사용)
const fetchPopularCategories = async () => {
  loading.value = true;
  try {
    const data = await loadPopularFromCache(props.contentType, maxCategories.value + 2);
    popularCategories.value = data;
  } catch (error) {
    console.warn('[CategoryFilter] 인기 카테고리 조회 실패, 기본 카테고리 사용:', error.message);
    popularCategories.value = [];
  } finally {
    loading.value = false;
  }
};

const goToCategoryPage = () => {
  router.push({
    name: 'CategoryList',
    query: { from: router.currentRoute.value.name }
  });
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
  // 같은 카테고리를 다시 클릭하면 선택 해제
  if (selectedCategory.value?.categoryId === category.categoryId) {
    selectedCategory.value = null;
    selectedSubCategory.value = null;
    emit('category-change', {
      categoryId: null,
      category: null,
      subCategory: null
    });
    return;
  }

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

const findAndSelectCategory = (categoryId) => {
  // 인기 카테고리에서 먼저 찾기
  for (const cat of popularCategories.value) {
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

  // props.categories에서 찾기
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

onMounted(() => {
  fetchPopularCategories();

  if (props.initialCategoryId) {
    findAndSelectCategory(props.initialCategoryId);
  }

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

watch(() => props.initialCategoryId, (newVal) => {
  if (newVal === null) {
    selectedCategory.value = null;
    selectedSubCategory.value = null;
  } else {
    findAndSelectCategory(newVal);
  }
});

watch(() => props.contentType, () => {
  fetchPopularCategories();
});
</script>

<style scoped>
.filter-container {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 20px;
}

@media (min-width: 1024px) {
  .filter-container {
    padding: 14px 24px;
  }
}

.category-tabs {
  display: flex;
  gap: 8px;
  align-items: center;
}

.category-tab {
  padding: 8px 18px;
  border-radius: 20px;
  background: #f5f5f5;
  color: #666;
  border: none;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.category-tab:hover {
  background: #eee;
}

.category-tab.active {
  background: #9933EA;
  color: #ffffff;
}

.category-tab.more-btn {
  padding: 8px 12px;
  background: transparent;
  color: #888;
}

.category-tab.more-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.category-tab.more-btn svg {
  width: 20px;
  height: 20px;
}

/* 로딩 */
.loading-placeholder {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
}

.loading-dot {
  width: 6px;
  height: 6px;
  background: #ddd;
  border-radius: 50%;
  animation: loading-pulse 1.2s ease-in-out infinite;
}

.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes loading-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}

/* 선택된 카테고리 칩 */
.selected-chip-wrapper {
  margin-top: 10px;
}

.selected-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px 6px 14px;
  background: #9933EA;
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.chip-separator {
  opacity: 0.7;
  margin: 0 2px;
}

.chip-clear {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  opacity: 0.7;
  cursor: pointer;
}

.chip-clear:hover {
  opacity: 1;
}

/* 2뎁스 하위 카테고리 */
.sub-category-tabs {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.sub-category-tab {
  padding: 6px 14px;
  border-radius: 16px;
  background: #fff;
  color: #888;
  border: 1px solid #e5e5e5;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sub-category-tab:hover {
  background: #faf5ff;
  border-color: #d8b4fe;
  color: #9333ea;
}

.sub-category-tab.active {
  background: #f3e8ff;
  border-color: #9333ea;
  color: #9333ea;
}
</style>
