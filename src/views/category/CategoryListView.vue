<template>
  <div class="category-page">
    <header class="page-header">
      <button @click="goBack" class="back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1>카테고리</h1>
    </header>

    <!-- 검색 -->
    <div class="search-section">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
            type="text"
            v-model="searchQuery"
            placeholder="카테고리 검색..."
            class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- 검색 결과 -->
    <div v-else-if="searchQuery" class="search-results">
      <div v-if="searchResults.length === 0" class="empty">
        "{{ searchQuery }}" 검색 결과가 없습니다
      </div>
      <button
          v-for="result in searchResults"
          :key="result.categoryId"
          @click="selectCategory(result)"
          class="search-result-item"
      >
        <span v-if="result.parentName" class="result-parent">{{ result.parentName }} ›</span>
        <span class="result-name">{{ result.categoryName }}</span>
      </button>
    </div>

    <!-- 카테고리 목록 -->
    <div v-else class="category-list">
      <div
          v-for="category in categories"
          :key="category.categoryId"
          class="category-group"
      >
        <!-- 1depth 카테고리 -->
        <button
            @click="toggleCategory(category)"
            :class="['category-header', { expanded: expandedId === category.categoryId }]"
        >
          <span class="category-name">{{ category.categoryName }}</span>
          <span v-if="category.children?.length" class="child-count">{{ category.children.length }}</span>
          <svg v-if="category.children?.length" class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
          <svg v-else class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <!-- 2depth 서브카테고리 -->
        <Transition name="slide">
          <div v-if="expandedId === category.categoryId && category.children?.length" class="sub-list">
            <button
                @click="selectCategory(category)"
                class="sub-item all"
            >
              {{ category.categoryName }} 전체
            </button>
            <button
                v-for="sub in category.children"
                :key="sub.categoryId"
                @click="selectCategory(sub, category)"
                class="sub-item"
            >
              {{ sub.categoryName }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { categoryService } from '@/services/CategoryService.js';

const router = useRouter();
const route = useRoute();

const categories = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const expandedId = ref(null);

// 검색 결과
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.toLowerCase().trim();
  const results = [];

  for (const cat of categories.value) {
    if (cat.categoryName.toLowerCase().includes(query)) {
      results.push({ ...cat, parentName: null });
    }
    if (cat.children) {
      for (const sub of cat.children) {
        if (sub.categoryName.toLowerCase().includes(query)) {
          results.push({ ...sub, parentName: cat.categoryName, parent: cat });
        }
      }
    }
  }

  return results.slice(0, 20);
});

const goBack = () => {
  router.back();
};

const toggleCategory = (category) => {
  if (category.children?.length) {
    expandedId.value = expandedId.value === category.categoryId ? null : category.categoryId;
  } else {
    selectCategory(category);
  }
};

const selectCategory = (category, parent = null) => {
  // 이전 페이지로 돌아가면서 카테고리 정보 전달
  const from = route.query.from || 'ProductRanking';
  router.push({
    name: from,
    query: { categoryId: category.categoryId }
  });
};

const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await categoryService.getCategories({ isActive: true });
    if (response.success && response.data) {
      categories.value = Array.isArray(response.data) ? response.data : [];
    }
  } catch (e) {
    console.error('카테고리 로드 실패:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background: var(--bg-elevated);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--bg-subtle);
  position: sticky;
  top: 0;
  background: var(--bg-elevated);
  z-index: 10;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--bg-subtle);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: var(--border-strong);
}

.back-btn svg {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
}

.page-header h1 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* 검색 */
.search-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--bg-subtle);
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--c-text-400);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 44px;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-subtle);
}

.search-input:focus {
  outline: none;
  border-color: var(--c-brand);
  background: var(--bg-elevated);
}

.search-input::placeholder {
  color: var(--c-text-400);
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: var(--border-strong);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  background: var(--c-text-300);
}

.search-clear svg {
  width: 12px;
  height: 12px;
  color: var(--c-text-500);
}

/* 로딩 */
.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-subtle);
  border-top-color: var(--c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 검색 결과 */
.search-results {
  padding: 8px;
}

.empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--c-text-400);
}

.search-result-item {
  width: 100%;
  padding: 14px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}

.search-result-item:hover {
  background: var(--bg-subtle);
}

.result-parent {
  color: var(--c-text-400);
  font-size: 14px;
}

.result-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 카테고리 목록 */
.category-list {
  padding: 8px;
}

.category-group {
  margin-bottom: 4px;
}

.category-header {
  width: 100%;
  padding: 14px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s;
}

.category-header:hover {
  background: var(--bg-subtle);
}

.category-header.expanded {
  background: var(--c-brand-soft);
}

.category-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.child-count {
  font-size: 12px;
  color: var(--c-text-400);
  background: var(--border-default);
  padding: 2px 8px;
  border-radius: 10px;
}

.expand-icon,
.arrow-icon {
  width: 18px;
  height: 18px;
  color: var(--c-text-400);
  transition: transform 0.2s;
}

.category-header.expanded .expand-icon {
  transform: rotate(180deg);
}

/* 서브카테고리 */
.sub-list {
  padding: 4px 0 8px 20px;
}

.sub-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-600);
  transition: all 0.15s;
}

.sub-item:hover {
  background: var(--bg-subtle);
  color: var(--c-brand);
}

.sub-item.all {
  color: var(--c-brand);
  font-weight: 600;
}

/* Transition */
.slide-enter-active {
  transition: all 0.2s ease-out;
}

.slide-leave-active {
  transition: all 0.15s ease-in;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
