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

      <!-- 인기 카테고리 (4-5개) -->
      <button
          v-for="category in topCategories"
          :key="category.categoryId"
          @click="handleCategoryClick(category)"
          :class="['category-tab', { active: selectedCategory?.categoryId === category.categoryId }]"
      >
        {{ category.categoryName }}
      </button>

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

    <!-- 선택된 카테고리가 상위 4개 외일 경우 표시 -->
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

const router = useRouter();

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
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
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

// 화면 크기에 따른 카테고리 개수
const maxCategories = computed(() => {
  if (windowWidth.value >= 1280) return 8;  // 대형 PC
  if (windowWidth.value >= 1024) return 6;  // PC
  if (windowWidth.value >= 768) return 5;   // 태블릿
  return 3;                                  // 모바일
});

// 상위 카테고리
const topCategories = computed(() => {
  return props.categories.slice(0, maxCategories.value);
});

const hasMoreCategories = computed(() => {
  return props.categories.length > maxCategories.value;
});

// 윈도우 리사이즈 핸들러
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// 선택된 카테고리가 상위 목록에 없을 경우 칩으로 표시
const showSelectedChip = computed(() => {
  if (!selectedCategory.value) return false;
  const isInTop = topCategories.value.some(c => c.categoryId === selectedCategory.value.categoryId);
  return !isInTop;
});

const goToCategoryPage = () => {
  router.push({ name: 'CategoryList' });
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

onMounted(() => {
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
</style>
