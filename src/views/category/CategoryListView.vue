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
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: #eee;
}

.back-btn svg {
  width: 20px;
  height: 20px;
  color: #333;
}

.page-header h1 {
  font-size: 18px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

/* 검색 */
.search-section {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
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
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 44px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  color: #111;
  background: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #9933EA;
  background: #fff;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: #e5e7eb;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  background: #d1d5db;
}

.search-clear svg {
  width: 12px;
  height: 12px;
  color: #666;
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
  border: 3px solid #f0f0f0;
  border-top-color: #9933EA;
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
  color: #9ca3af;
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
  background: #f5f5f5;
}

.result-parent {
  color: #9ca3af;
  font-size: 14px;
}

.result-name {
  font-size: 15px;
  font-weight: 500;
  color: #111;
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
  background: #f5f5f5;
}

.category-header.expanded {
  background: #FAF5FF;
}

.category-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.child-count {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
}

.expand-icon,
.arrow-icon {
  width: 18px;
  height: 18px;
  color: #9ca3af;
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
  color: #555;
  transition: all 0.15s;
}

.sub-item:hover {
  background: #f5f5f5;
  color: #9933EA;
}

.sub-item.all {
  color: #9933EA;
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
