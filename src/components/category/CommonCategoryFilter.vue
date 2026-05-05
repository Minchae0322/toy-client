<template>
  <div class="filter-container">
    <div :class="['category-tabs-wrapper', { 'mobile-expanded': isMobile && mobileExpanded }]">
      <div class="category-scroll">
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
      </div>

      <!-- 더보기 버튼 (스크롤 영역 밖, 항상 보이도록) -->
      <button
          v-if="hasMoreCategories"
          @click="handleMoreClick"
          :class="['category-tab', 'more-btn', { 'more-btn-text': isMobile && mobileExpanded }]"
          :title="isMobile && !mobileExpanded ? '펼치기' : '전체 카테고리 보기'"
      >
        <template v-if="isMobile && mobileExpanded">
          <span>전체 카테고리</span>
          <svg class="more-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </template>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="19" cy="12" r="2"/>
        </svg>
      </button>
    </div>

    <CategorySelectModal
        v-if="showCategoryModal"
        :content-type="contentType"
        :initial-category-id="selectedCategory?.categoryId"
        @select="handleModalSelect"
        @close="showCategoryModal = false"
    />

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
      <button class="selected-chip" @click="showCategoryModal = true">
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
import { useCategoryCache } from '@/composables/useCategoryCache.js';
import CategorySelectModal from '@/components/common/CategorySelectModal.vue';
const { loadPopularCategories: loadPopularFromCache } = useCategoryCache();

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  contentType: {
    type: String,
    default: 'PRODUCT' // FEED, PRODUCT
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
const showCategoryModal = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const mobileExpanded = ref(false);

const isMobile = computed(() => windowWidth.value < 768);

// 모바일 확장(2줄) 모드에서 보여줄 최대 개수
const MOBILE_EXPANDED_MAX = 10;

// 화면 크기에 따른 카테고리 개수 (한 줄을 꽉 채우는 반응형)
const maxCategories = computed(() => {
  if (windowWidth.value >= 1280) return 8;
  if (windowWidth.value >= 1024) return 6;
  if (windowWidth.value >= 768) return 5;
  if (windowWidth.value >= 480) return 5;
  if (windowWidth.value >= 380) return 4;
  return 3;
});

// 실제로 화면에 보일 개수 (모바일 확장 시 더 많이)
const visibleCount = computed(() => {
  if (isMobile.value && mobileExpanded.value) return MOBILE_EXPANDED_MAX;
  return maxCategories.value;
});

// 캐시에서 가져올 개수 (확장 모드에서도 충분하도록 여유 있게)
const fetchCount = computed(() => Math.max(maxCategories.value + 2, MOBILE_EXPANDED_MAX + 2));

// 표시할 카테고리 (인기 카테고리 우선, 없으면 props.categories 사용)
const displayCategories = computed(() => {
  const source = popularCategories.value.length > 0
    ? popularCategories.value
    : props.categories;

  const visible = source.slice(0, visibleCount.value);

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
  return total > visibleCount.value;
});

// "..." / "더보기" 버튼 클릭
const handleMoreClick = () => {
  if (isMobile.value && !mobileExpanded.value) {
    mobileExpanded.value = true;
  } else {
    showCategoryModal.value = true;
  }
};

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
  // 데스크톱으로 전환되면 모바일 확장 상태 해제
  if (!isMobile.value) {
    mobileExpanded.value = false;
  }
};

// 인기 카테고리 조회 (캐시 사용)
const fetchPopularCategories = async () => {
  loading.value = true;
  try {
    const data = await loadPopularFromCache(props.contentType, fetchCount.value);
    popularCategories.value = data;
  } catch (error) {
    console.warn('[CategoryFilter] 인기 카테고리 조회 실패, 기본 카테고리 사용:', error.message);
    popularCategories.value = [];
  } finally {
    loading.value = false;
  }
};


const handleModalSelect = ({ categoryId, categoryDepth, category, parent }) => {
  showCategoryModal.value = false;
  if (parent) {
    selectedCategory.value = parent;
    selectedSubCategory.value = category;
  } else {
    selectedCategory.value = category;
    selectedSubCategory.value = null;
  }
  emit('category-change', {
    categoryId,
    categoryDepth,
    category: parent || category,
    subCategory: parent ? category : null
  });
};

const handleAllClick = () => {
  selectedCategory.value = null;
  selectedSubCategory.value = null;
  emit('category-change', {
    categoryId: null,
    categoryDepth: null,
    category: null,
    subCategory: null
  });
};

// 카테고리의 depth 계산 (API에서 depth 필드가 없을 경우 대비)
const getCategoryDepth = (category, isSubCategory = false) => {
  // depth 필드가 있으면 사용
  if (category?.depth) return category.depth;
  // categoryDepth 필드가 있으면 사용
  if (category?.categoryDepth) return category.categoryDepth;
  // 하위 카테고리면 2, 아니면 1
  return isSubCategory ? 2 : 1;
};

const handleCategoryClick = (category) => {
  // 같은 카테고리를 다시 클릭하면 선택 해제
  if (selectedCategory.value?.categoryId === category.categoryId) {
    selectedCategory.value = null;
    selectedSubCategory.value = null;
    emit('category-change', {
      categoryId: null,
      categoryDepth: null,
      category: null,
      subCategory: null
    });
    return;
  }

  selectedCategory.value = category;
  selectedSubCategory.value = null;
  // 1뎁스 카테고리 (부모 카테고리)
  const depth = getCategoryDepth(category, false);
  console.log('[CategoryFilter] 1뎁스 선택:', category.categoryName, 'depth:', depth);
  emit('category-change', {
    categoryId: category.categoryId,
    categoryDepth: depth,
    category: category,
    subCategory: null
  });
};

const handleSubCategoryClick = (subCategory) => {
  selectedSubCategory.value = subCategory;
  if (subCategory) {
    // 2뎁스 카테고리 (하위 카테고리)
    const depth = getCategoryDepth(subCategory, true);
    console.log('[CategoryFilter] 2뎁스 선택:', subCategory.categoryName, 'depth:', depth);
    emit('category-change', {
      categoryId: subCategory.categoryId,
      categoryDepth: depth,
      category: selectedCategory.value,
      subCategory: subCategory
    });
  } else {
    // "전체" 선택 시 1뎁스 카테고리 ID 사용
    const depth = getCategoryDepth(selectedCategory.value, false);
    console.log('[CategoryFilter] 1뎁스 전체 선택:', selectedCategory.value.categoryName, 'depth:', depth);
    emit('category-change', {
      categoryId: selectedCategory.value.categoryId,
      categoryDepth: depth,
      category: selectedCategory.value,
      subCategory: null
    });
  }
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
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #f2f2f7;
}

/* 1뎁스 컨테이너: 스크롤 영역 + 항상 보이는 더보기 버튼 */
.category-tabs-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px 0;
}

/* 스크롤 가능한 카테고리 탭 영역 */
.category-scroll {
  display: flex;
  gap: 6px;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.category-scroll::-webkit-scrollbar { display: none; }

/* 더보기 버튼은 절대 줄어들지 않음 */
.more-btn {
  flex-shrink: 0;
}

.category-tab {
  padding: 8px 14px;
  border-radius: 6px;
  background: #f2f2f7;
  color: #3a3a3c;
  border: none;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.category-tab:hover {
  background: #e5e5ea;
}

.category-tab.active {
  background: #9933EA;
  color: #ffffff;
}

.category-tab.more-btn {
  padding: 8px 10px;
  background: transparent;
  color: #8e8e93;
}

.category-tab.more-btn:hover {
  background: #f2f2f7;
  color: #3a3a3c;
}

.category-tab.more-btn svg {
  width: 20px;
  height: 20px;
}

.category-tab.more-btn.more-btn-text {
  padding: 8px 12px;
  background: #ffffff;
  color: #9333ea;
  border: 1px dashed #c084fc;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.category-tab.more-btn.more-btn-text:hover {
  background: #faf5ff;
  border-color: #9333ea;
}

.more-chevron {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

/* 로딩 애니메이션: 은은하게 */
.loading-placeholder {
  display: flex;
  gap: 4px;
  padding: 0 12px;
}

.loading-dot {
  width: 4px;
  height: 4px;
  background: #d1d1d6;
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
  gap: 6px;
  padding: 6px 12px;
  background: #f2f2f7;
  color: #3a3a3c;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.chip-separator {
  opacity: 0.7;
  margin: 0 2px;
}

.chip-clear {
  width: 14px;
  height: 14px;
  margin-left: 4px;
  color: #8e8e93;
  cursor: pointer;
}

.chip-clear:hover {
  color: #3a3a3c;
}

/* 2뎁스 하위 카테고리 */
.sub-category-tabs {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 10px 20px 0;
  padding-top: 10px;
  border-top: 1px solid #f2f2f7;
  flex-wrap: wrap;
}

.sub-category-tab {
  padding: 6px 12px;
  border-radius: 6px;
  background: transparent;
  color: #8e8e93;
  border: none;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sub-category-tab:hover {
  background: #f2f2f7;
  color: #3a3a3c;
}

.sub-category-tab.active {
  background: #3a3a3c;
  color: #ffffff;
}

@media (max-width: 767px) {
  .filter-container {
    padding: 6px 0 8px;
  }
  .category-tabs-wrapper {
    padding: 6px 16px 0;
  }
  /* 모바일 확장 모드: 카테고리는 wrap, 더보기 버튼은 별도 줄로 */
  .category-tabs-wrapper.mobile-expanded {
    flex-wrap: wrap;
    row-gap: 6px;
  }
  .category-tabs-wrapper.mobile-expanded .category-scroll {
    flex: 1 1 100%;
    flex-wrap: wrap;
    overflow-x: visible;
    row-gap: 6px;
  }
  .selected-chip-wrapper {
    margin-top: 6px;
  }
  .sub-category-tabs {
    margin: 6px 16px 0;
    padding-top: 6px;
  }
}
</style>
