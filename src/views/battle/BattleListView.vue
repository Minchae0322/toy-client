<template>
  <div class="app-container">
    <!-- 사이드바 - 데스크탑 -->
    <AppSidebar />

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <!-- 컨텐츠 영역 -->
      <div class="content-wrapper">
        <!-- HOT 배틀 섹션 -->
        <HotBattleSection
            v-if="activeTab === 'ongoing' && !selectedCategory"
            :battles="hotBattles"
            :loading="hotLoading"
            @battle-click="openBattle"
            @view-all="handleViewAllHot"
        />

        <!-- 배틀 리스트 섹션 -->
        <section class="battles-section">
          <header class="battle-list-title">
            <div class="title-with-badge">
              <h2 class="section-title">
                <span class="title-accent-icon" aria-hidden="true">
                  <Trophy :size="16" :stroke-width="2.4" />
                </span>
                전체 <span class="title-accent">요거픽</span>
              </h2>
            </div>
          </header>

          <!-- 검색 + 카테고리 탐색 -->
          <div class="battle-search-row">
            <div class="search-input-wrap">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                  v-model="searchKeyword"
                  type="text"
                  class="battle-search-input"
                  placeholder="요거픽·아이템 검색"
                  @keyup.enter="applySearchNow"
              />
              <button
                  v-if="searchKeyword"
                  type="button"
                  class="search-clear"
                  aria-label="검색어 지우기"
                  @click="clearSearch"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <button type="button" class="category-explore-btn" @click="categoryModalOpen = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
              카테고리 탐색
            </button>
          </div>

          <!-- 선택된 카테고리 칩 -->
          <div v-if="selectedCategory" class="active-category-row">
            <span class="active-category-chip">
              <span class="acc-label">카테고리</span>
              <span class="acc-name">
                {{ selectedCategory.categoryName }}<span v-if="selectedSubCategory"> · {{ selectedSubCategory.categoryName }}</span>
              </span>
              <button type="button" class="acc-clear" aria-label="카테고리 해제" @click="clearCategory">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </span>
          </div>

          <!-- 카테고리 탐색 모달 -->
          <CategorySelectModal
              v-if="categoryModalOpen"
              content-type="BATTLE"
              :initial-category-id="selectedCategoryId"
              @select="handleCategoryModalSelect"
              @close="categoryModalOpen = false"
          />

          <div class="section-header">
            <div class="filter-chips">
              <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  class="filter-chip"
                  :class="{ active: activeTab === tab.id }"
                  @click="activeTab = tab.id"
              >
                <span class="chip-label">{{ tab.label }}</span>
              </button>
            </div>

            <div class="header-actions">
              <!-- 뷰 모드 스위처 -->
              <div class="view-switcher">
                <button
                    class="view-btn"
                    :class="{ active: viewMode === 'grid' }"
                    @click="viewMode = 'grid'"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1"/>
                    <rect x="9" y="1" width="6" height="6" rx="1"/>
                    <rect x="1" y="9" width="6" height="6" rx="1"/>
                    <rect x="9" y="9" width="6" height="6" rx="1"/>
                  </svg>
                </button>
                <button
                    class="view-btn"
                    :class="{ active: viewMode === 'list' }"
                    @click="viewMode = 'list'"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="14" height="3" rx="0.5"/>
                    <rect x="1" y="7" width="14" height="3" rx="0.5"/>
                    <rect x="1" y="12" width="14" height="3" rx="0.5"/>
                  </svg>
                </button>
              </div>

              <div ref="sortDropdownRef" class="sort-dropdown" :class="{ open: sortOpen }">
                <button
                    type="button"
                    class="sort-trigger"
                    :class="{ active: sortOpen }"
                    @click="sortOpen = !sortOpen"
                >
                  <span class="sort-trigger-label">{{ currentSortLabel }}</span>
                  <ChevronDown class="sort-chevron" :class="{ open: sortOpen }" />
                </button>
                <transition name="sort-fade">
                  <div v-if="sortOpen" class="sort-menu" role="listbox">
                    <button
                        v-for="opt in sortOptions"
                        :key="opt.id"
                        type="button"
                        class="sort-option"
                        :class="{ active: sortKey === opt.id }"
                        role="option"
                        :aria-selected="sortKey === opt.id"
                        @click="selectSort(opt.id)"
                    >
                      <span class="sort-option-label">{{ opt.label }}</span>
                      <Check v-if="sortKey === opt.id" class="sort-option-check" />
                    </button>
                  </div>
                </transition>
              </div>

              <button class="create-battle-btn" @click="handleCreateBattle">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>요거픽 만들기</span>
              </button>
            </div>
          </div>

          <BattleList
              ref="battleListRef"
              :battles="filteredBattles"
              :loading="loading"
              :has-next="hasNext"
              :view-mode="viewMode"
              :initial-loaded="initialLoaded"
              @battle-click="openBattle"
          />
        </section>
      </div>
    </main>

    <!-- 모바일 하단 네비게이션 -->
    <BottomNavigation />
  </div>
</template>

<script setup>
defineOptions({ name: 'BattleListView' })

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, Check, Trophy } from 'lucide-vue-next'
import { battleService } from '@/services/BattleService.js'
import { useCategoryCache } from '@/composables/useCategoryCache.js'
import { useAuthStore } from '@/stores/auth.js'

// Components
import CategorySelectModal from '@/components/common/CategorySelectModal.vue'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import HotBattleSection from '@/components/battle/HotBattleSection.vue'
import BattleList from '@/components/battle/BattleList.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()
const { allCategories: cachedCategories, loadAllCategories } = useCategoryCache()

// State
const allTabs = ref([
  { id: 'ongoing', label: '진행중', count: 0 },
  { id: 'ended', label: '종료됨', count: 0 },
  { id: 'my', label: 'MY', count: 0, requiresAuth: true }
])

// 로그인 상태에 따라 탭 필터링
const tabs = computed(() => {
  return allTabs.value.filter(tab => !tab.requiresAuth || authStore.isAuthenticated)
})

const activeTab = ref('ongoing')
const viewMode = ref('grid')

// 정렬
const sortOptions = [
  { id: 'popular', label: '인기순', value: 'hotScore,DESC' },
  { id: 'deadline', label: '마감일순', value: 'endDate,ASC' },
  { id: 'latest', label: '최신순', value: 'createdAt,DESC' }
]
const sortKey = ref('latest')
const sortOpen = ref(false)
const sortDropdownRef = ref(null)
const currentSortLabel = computed(() => sortOptions.find(o => o.id === sortKey.value)?.label || '최신순')
const currentSortValue = computed(() => sortOptions.find(o => o.id === sortKey.value)?.value || 'createdAt,DESC')

const battles = ref([])
const hotBattles = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const totalCount = ref(0)
const hasNext = ref(true)
const loading = ref(false)
const hotLoading = ref(true)
const initialLoaded = ref(false)
const battleListRef = ref(null)

const selectedCategory = ref(null)
const selectedSubCategory = ref(null)
const selectedCategoryId = ref(null)
const selectedCategoryDepth = ref(null)
const categories = ref([])

// 검색 + 카테고리 모달
const searchKeyword = ref('')
const categoryModalOpen = ref(false)
let searchDebounceTimer = null

// Computed
const currentCategoryTitle = computed(() => {
  if (!selectedCategory.value) return '전체 요거픽'
  let title = selectedCategory.value.categoryName
  if (selectedSubCategory.value) {
    title += ` > ${selectedSubCategory.value.categoryName}`
  }
  return title
})

const filteredBattles = computed(() => battles.value)

const activeBattleCount = computed(() => {
  return tabs.value.find(tab => tab.id === 'ongoing')?.count || 0
})

// API Methods
const loadCategories = async () => {
  try {
    // 배틀(요거픽) 카테고리는 제품 카테고리 사용 — type=PRODUCT
    const data = await loadAllCategories('PRODUCT')
    categories.value = data
  } catch (error) {
    console.error('카테고리 로드 실패:', error)
  }
}

const loadHotBattles = async () => {
  try {
    hotLoading.value = true
    const response = await battleService.getHotBattleList()
    if (response.success && response.data) {
      hotBattles.value = response.data
    }
  } catch (error) {
    console.error('HOT 배틀 로드 실패:', error)
  } finally {
    hotLoading.value = false
  }
}

const loadBattles = async (reset = false) => {
  if (loading.value) return
  if (!reset && !hasNext.value) return

  try {
    loading.value = true

    if (reset) {
      currentPage.value = 0
    }

    const searchCondition = {}
    if (activeTab.value === 'ongoing') {
      searchCondition.isActive = true
    } else if (activeTab.value === 'ended') {
      searchCondition.isActive = false
    } else if (activeTab.value === 'my') {
      searchCondition.creatorId = authStore.userId
    }

    if (selectedSubCategory.value) {
      searchCondition.category = selectedSubCategory.value.categoryId
      searchCondition.categoryDepth = selectedSubCategory.value.depth || 2
    } else if (selectedCategory.value) {
      searchCondition.category = selectedCategory.value.categoryId
      searchCondition.categoryDepth = selectedCategoryDepth.value || selectedCategory.value.depth || 1
    }

    const trimmedKeyword = searchKeyword.value.trim()
    if (trimmedKeyword) {
      searchCondition.keyword = trimmedKeyword
    }

    const response = await battleService.getBattles(
        searchCondition,
        { page: currentPage.value, size: 20, sort: currentSortValue.value }
    )

    if (response.success && response.data) {
      const pageData = response.data.content ? response.data : { content: response.data }
      battles.value = reset ? pageData.content : [...battles.value, ...pageData.content]

      if (response.data.totalElements !== undefined) {
        totalCount.value = response.data.totalElements
        totalPages.value = response.data.totalPages
        hasNext.value = !response.data.last
      } else {
        hasNext.value = false
      }
      currentPage.value++
    }
  } catch (error) {
    console.error('배틀 목록 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 검색
// 한글 IME 조합 중에는 @input 시점에 v-model 값이 갱신되지 않아 @input + debounce 가
// 미반영되는 문제가 있다. watch 로 바꾸면 조합 종료 후 ref 갱신을 정확히 감지한다.
let lastSearchedKeyword = ''
const applySearchNow = () => {
  clearTimeout(searchDebounceTimer)
  lastSearchedKeyword = searchKeyword.value.trim()
  resetAndLoadBattles()
}
const clearSearch = () => {
  searchKeyword.value = ''
  // watch 가 트리거되어 빈 키워드로 다시 로드함
}
watch(searchKeyword, (val) => {
  const trimmed = (val || '').trim()
  if (trimmed === lastSearchedKeyword) return
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    lastSearchedKeyword = trimmed
    resetAndLoadBattles()
  }, 300)
})

// 카테고리 모달 선택
const handleCategoryModalSelect = ({ category, parent, categoryDepth }) => {
  // 모달은 단일 카테고리만 emit — parent 가 있으면 sub-category 선택, 없으면 top-level
  if (parent) {
    selectedCategory.value = parent
    selectedSubCategory.value = category
    selectedCategoryId.value = category.categoryId
    selectedCategoryDepth.value = categoryDepth || category.depth || 2
  } else {
    selectedCategory.value = category
    selectedSubCategory.value = null
    selectedCategoryId.value = category.categoryId
    selectedCategoryDepth.value = categoryDepth || category.depth || 1
  }
  categoryModalOpen.value = false
  resetAndLoadBattles()
}
const clearCategory = () => {
  selectedCategory.value = null
  selectedSubCategory.value = null
  selectedCategoryId.value = null
  selectedCategoryDepth.value = null
  resetAndLoadBattles()
}

// Event Handlers
const handleCategoryChange = ({ category, subCategory, categoryDepth }) => {
  console.log('[BattleList] 카테고리 변경:', { category: category?.categoryName, subCategory: subCategory?.categoryName, categoryDepth });
  if (!category && !subCategory) {
    selectedCategoryId.value = null
    selectedCategoryDepth.value = null
    selectedCategory.value = null
    selectedSubCategory.value = null
  } else {
    selectedCategory.value = category
    selectedSubCategory.value = subCategory
    const targetCategory = subCategory || category
    selectedCategoryId.value = targetCategory?.categoryId
    // categoryDepth 우선, 없으면 depth 필드, 그래도 없으면 subCategory면 2, 아니면 1
    selectedCategoryDepth.value = categoryDepth || targetCategory?.depth || targetCategory?.categoryDepth || (subCategory ? 2 : 1)
  }
  console.log('[BattleList] 선택된 값:', { categoryId: selectedCategoryId.value, categoryDepth: selectedCategoryDepth.value });
  resetAndLoadBattles()
}

const resetAndLoadBattles = () => {
  battles.value = []
  currentPage.value = 0
  hasNext.value = true
  loadBattles(true)
}

const openBattle = (battleId) => {
  router.push({ name: 'BattleDetail', params: { id: battleId } })
}

const handleCreateBattle = () => {
  router.push({ name: 'BattleCreate' })
}

const handleViewAllHot = () => {
  // 배틀 리스트 섹션으로 스크롤
  const battlesSection = document.querySelector('.battles-section')
  if (battlesSection) {
    battlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const selectSort = (id) => {
  if (sortKey.value === id) {
    sortOpen.value = false
    return
  }
  sortKey.value = id
  sortOpen.value = false
}

const handleClickOutsideSort = (e) => {
  if (!sortOpen.value) return
  if (sortDropdownRef.value && !sortDropdownRef.value.contains(e.target)) {
    sortOpen.value = false
  }
}

const handleKeydownSort = (e) => {
  if (e.key === 'Escape' && sortOpen.value) {
    sortOpen.value = false
  }
}

// Watchers
watch(activeTab, () => {
  resetAndLoadBattles()
})

watch(sortKey, () => {
  resetAndLoadBattles()
})

// Lifecycle
let observer = null

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadHotBattles(),
    loadBattles(true)
  ])
  initialLoaded.value = true

  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext.value && !loading.value) {
          loadBattles()
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
  )

  setTimeout(() => {
    if (battleListRef.value?.observerTarget) {
      observer.observe(battleListRef.value.observerTarget)
    }
  }, 100)

  document.addEventListener('mousedown', handleClickOutsideSort)
  document.addEventListener('keydown', handleKeydownSort)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  document.removeEventListener('mousedown', handleClickOutsideSort)
  document.removeEventListener('keydown', handleKeydownSort)
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.app-container {
  --primary: var(--text-primary);
  --primary-accent: var(--c-brand);
  --secondary: var(--c-text-500);
  --bg: var(--bg-base);
  --card: var(--bg-elevated);
  --border: var(--bg-subtle);
  --border-hover: var(--border-strong);
  --text-primary: var(--text-primary);
  --text-secondary: var(--c-text-500);
  --text-muted: var(--c-text-400);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


.app-container {
  background: var(--bg);
  min-height: 100vh;
  color: var(--text-primary);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100%;
  overflow-x: clip;
}

.app-container {
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .app-container {
    padding: 0 2rem;
  }
}

@media (min-width: 1280px) {
  .app-container {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 1920px) {
  .app-container {
    padding: 0 4rem;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  /* BottomNavigation + iOS 홈 인디케이터 */
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  padding-left: 1.5rem;
}

@media (max-width: 767px) {
  .main-content {
    padding-left: 0;
  }
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0;
  }
}

/* 배틀 섹션 (HOT 섹션과의 간격) */
.battles-section {
  margin-top: 20px;
  padding: 0 0 20px;
}

@media (min-width: 768px) {
  .battles-section {
    margin-top: 26px;
    padding: 0 0 24px;
  }
}

@media (min-width: 1280px) {
  .battles-section {
    margin-top: 32px;
  }
}

/* 배틀 리스트 제목 (HOT 섹션과 톤 일치 — 아이콘 + 굵은 타이포) */
.battle-list-title {
  margin-bottom: 14px;
}

.title-with-badge {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.25;
}

.title-accent-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
}

.section-title .title-accent {
  color: var(--c-brand);
  font-weight: 800;
  letter-spacing: -0.04em;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 1.1875rem;
  }
  .title-accent-icon {
    width: 26px;
    height: 26px;
  }
}

@media (min-width: 1280px) {
  .section-title {
    font-size: 1.25rem;
  }
  .title-accent-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1rem;
  }
}

.sub-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-400);
  letter-spacing: -0.02em;
  padding-left: 32px;
}

@media (min-width: 768px) {
  .sub-title {
    padding-left: 34px;
  }
}

@media (min-width: 1280px) {
  .sub-title {
    padding-left: 38px;
  }
}

@media (max-width: 480px) {
  .sub-title {
    font-size: 12.5px;
  }
}

/* 검색 + 카테고리 탐색 줄 */
.battle-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
}

.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrap .search-icon {
  position: absolute;
  left: 13px;
  width: 18px;
  height: 18px;
  color: var(--c-brand);
  pointer-events: none;
}

.battle-search-input {
  width: 100%;
  padding: 12px 36px 12px 38px;
  border: 1.5px solid transparent;
  border-radius: 14px;
  background: var(--c-brand-soft);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  letter-spacing: -0.01em;
  outline: none;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.battle-search-input::placeholder {
  color: var(--c-brand-hover, var(--c-brand));
  opacity: 0.7;
  font-weight: 500;
}
.battle-search-input:hover {
  background: var(--bg-elevated);
  border-color: var(--c-brand-soft);
}
.battle-search-input:focus {
  background: var(--bg-elevated);
  border-color: var(--c-brand);
  box-shadow: 0 0 0 4px var(--c-brand-soft);
}

.search-clear {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: var(--bg-mute);
  color: var(--c-text-500);
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.search-clear:hover {
  background: var(--border-default);
}

.category-explore-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.category-explore-btn:hover {
  background: var(--bg-mute);
  border-color: var(--c-text-300, #CBD5E1);
}

@media (max-width: 480px) {
  .category-explore-btn {
    padding: 10px 12px;
    font-size: 12.5px;
  }
  .battle-search-input { font-size: 13.5px; padding: 10px 32px 10px 34px; }
  .search-input-wrap .search-icon { left: 11px; width: 15px; height: 15px; }
}

/* 선택된 카테고리 칩 */
.active-category-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
}

.active-category-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 6px 12px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.active-category-chip .acc-label {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--c-brand);
  opacity: 0.75;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.active-category-chip .acc-name {
  color: var(--text-primary);
}

.active-category-chip .acc-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-primary);
  cursor: pointer;
}
.active-category-chip .acc-clear:hover {
  background: rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .section-header {
    margin-bottom: 0.75rem;
    gap: 8px;
  }
}

/* 필터 칩 */
.filter-chips {
  display: flex;
  gap: 6px;
  align-items: center;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  color: var(--c-text-500);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  white-space: nowrap;
}

.filter-chip:hover {
  background: var(--bg-subtle);
  border-color: var(--c-text-300);
  color: var(--c-text-600);
}

.filter-chip.active {
  background: var(--c-brand);
  border-color: var(--c-brand);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.25);
}

/* 액션 그룹 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 뷰 모드 스위처 */
.view-switcher {
  display: flex;
  gap: 0.125rem;
}


.view-btn {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--c-text-400);
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  color: var(--c-text-500);
}

.view-btn.active {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

/* 정렬 드롭다운 */
.sort-dropdown {
  position: relative;
}

.sort-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--c-text-600);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}

.sort-trigger:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.sort-trigger.active {
  background: var(--bg-mute);
  color: var(--text-primary);
}

.sort-trigger:focus-visible {
  outline: none;
  border-color: var(--c-text-300);
}

.sort-trigger-label {
  line-height: 1;
}

.sort-chevron {
  width: 14px;
  height: 14px;
  color: var(--c-text-400);
  transition: transform 0.18s ease;
}

.sort-chevron.open {
  transform: rotate(180deg);
  color: var(--text-primary);
}

.sort-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 144px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04);
  padding: 4px;
  z-index: 30;
}

.sort-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  padding: 9px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--c-text-600);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  font-family: inherit;
  text-align: left;
}

.sort-option:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.sort-option.active {
  background: var(--c-brand-soft);
  color: var(--c-brand);
}

.sort-option-label {
  flex: 1;
  line-height: 1;
}

.sort-option-check {
  width: 14px;
  height: 14px;
  color: var(--c-brand);
  flex-shrink: 0;
}

/* 드롭다운 트랜지션 */
.sort-fade-enter-active,
.sort-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: top right;
}

.sort-fade-enter-from,
.sort-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* 만들기 버튼 */
.create-battle-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 8px 16px;
  background: var(--c-brand-hover);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
  box-shadow: 0 4px 10px rgba(124, 58, 237, 0.2);
}

.create-battle-btn:hover {
  background: var(--c-brand-hover);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.3);
}

.create-battle-btn svg {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .filter-chip {
    padding: 0.375rem 0.625rem;
  }
  .create-battle-btn span {
    display: none;
  }
  .create-battle-btn {
    width: 2rem;
    height: 2rem;
    padding: 0;
    justify-content: center;
  }
}

/* 큰 화면 */
@media (min-width: 1280px) {
  .filter-chip {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .create-battle-btn {
    padding: 0.5rem 1rem;
  }
}

</style>