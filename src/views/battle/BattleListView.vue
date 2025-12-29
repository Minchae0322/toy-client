<template>
  <div class="app-container">
    <!-- 사이드바 - 데스크탑 -->
    <AppSidebar />

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <!-- 통합 헤더 -->
      <header class="main-header">
        <!-- 탭 네비게이션 -->
        <nav class="tab-navigation">
          <div class="tabs-group">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                class="tab-button"
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id"
            >
              <span class="tab-label">{{ tab.label }}</span>
              <span v-if="tab.count" class="tab-count">{{ formatCount(tab.count) }}</span>
            </button>
          </div>

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
        </nav>

        <!-- 카테고리 필터 -->
        <CommonCategoryFilter
            :categories="categories"
            :initial-selected="selectedCategoryId"
            @category-change="handleCategoryChange"
        />
      </header>

      <!-- 컨텐츠 영역 -->
      <div class="content-wrapper">
        <!-- HOT 배틀 섹션 -->
        <HotBattleSection
            v-if="activeTab === 'ongoing' && !selectedCategory"
            :battles="hotBattles"
            :loading="hotLoading"
            @battle-click="openBattle"
        />

        <!-- 배틀 리스트 섹션 -->
        <section class="battles-section">
          <div class="section-header">
            <h2 class="section-title">
              {{ currentCategoryTitle }}
              <span class="section-count">{{ formatCount(totalCount) }}</span>
            </h2>

            <div class="header-right">
              <!-- 정렬 옵션 -->
              <select class="sort-select">
                <option value="latest">최신순</option>
                <option value="popular">인기순</option>
                <option value="ending">마감임박순</option>
              </select>

              <!-- 배틀 만들기 버튼 -->
              <button class="create-battle-btn" @click="handleCreateBattle">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>배틀 만들기</span>
              </button>
            </div>
          </div>

          <BattleList
              ref="battleListRef"
              :battles="filteredBattles"
              :loading="loading"
              :has-next="hasNext"
              :view-mode="viewMode"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { battleService } from '@/services/BattleService.js'
import { categoryService } from '@/services/CategoryService.js'
import { useAuthStore } from '@/stores/auth.js'

// Components
import CommonCategoryFilter from '@/components/category/CommonCategoryFilter.vue'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import HotBattleSection from '@/components/battle/HotBattleSection.vue'
import BattleList from '@/components/battle/BattleList.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const allTabs = ref([
  { id: 'ongoing', label: '진행중', count: 0 },
  { id: 'ended', label: '종료됨', count: 0 },
  { id: 'my', label: '내 배틀', count: 0, requiresAuth: true }
])

// 로그인 상태에 따라 탭 필터링
const tabs = computed(() => {
  return allTabs.value.filter(tab => !tab.requiresAuth || authStore.isAuthenticated)
})

const activeTab = ref('ongoing')
const viewMode = ref('grid')
const battles = ref([])
const hotBattles = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const totalCount = ref(0)
const hasNext = ref(true)
const loading = ref(false)
const hotLoading = ref(false)
const battleListRef = ref(null)

const selectedCategory = ref(null)
const selectedSubCategory = ref(null)
const selectedCategoryId = ref(null)
const categories = ref([])

// Computed
const currentCategoryTitle = computed(() => {
  if (!selectedCategory.value) return '전체 배틀'
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

// Utils
const formatCount = (num) => {
  if (!num) return '0'
  if (num >= 10000) return `${Math.floor(num / 10000)}만`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// API Methods
const loadCategories = async () => {
  try {
    const response = await categoryService.getCategories()
    if (response.success && response.data) {
      categories.value = response.data
    }
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
      battles.value = []
    }

    const searchCondition = {}
    if (activeTab.value === 'ongoing') {
      searchCondition.status = 'ACTIVE'
    } else if (activeTab.value === 'ended') {
      searchCondition.status = 'CLOSED'
    } else if (activeTab.value === 'my') {
      searchCondition.creatorId = authStore.userId
    }

    if (selectedSubCategory.value) {
      searchCondition.category = selectedSubCategory.value.categoryId
    } else if (selectedCategory.value) {
      searchCondition.category = selectedCategory.value.categoryId
    }

    const response = await battleService.getBattles(
        searchCondition,
        { page: currentPage.value, size: 20, sort: 'createdAt,DESC' }
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

const updateTabCounts = async () => {
  try {
    const ongoingResponse = await battleService.getBattles(
        { status: 'ACTIVE' },
        { page: 0, size: 1 }
    )
    if (ongoingResponse.success && ongoingResponse.data.totalElements !== undefined) {
      allTabs.value[0].count = ongoingResponse.data.totalElements
    }

    const endedResponse = await battleService.getBattles(
        { status: 'CLOSED' },
        { page: 0, size: 1 }
    )
    if (endedResponse.success && endedResponse.data.totalElements !== undefined) {
      allTabs.value[1].count = endedResponse.data.totalElements
    }

    // 로그인한 경우에만 내 배틀 카운트 조회
    if (authStore.isAuthenticated && authStore.userId) {
      const myResponse = await battleService.getBattles(
          { creatorId: authStore.userId },
          { page: 0, size: 1 }
      )
      if (myResponse.success && myResponse.data.totalElements !== undefined) {
        allTabs.value[2].count = myResponse.data.totalElements
      }
    }
  } catch (error) {
    console.error('탭 카운트 업데이트 실패:', error)
  }
}

// Event Handlers
const handleCategoryChange = ({ category, subCategory }) => {
  if (!category && !subCategory) {
    selectedCategoryId.value = null
    selectedCategory.value = null
    selectedSubCategory.value = null
  } else {
    selectedCategory.value = category
    selectedSubCategory.value = subCategory
    selectedCategoryId.value = subCategory?.categoryId || category?.categoryId
  }
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

const handleCreateBattle = async () => {
  try {
    const response = await battleService.validateCreation()
    if (response.success) {
      router.push({ name: 'BattleCreate' })
    }
  } catch (error) {
    console.error('배틀 생성 권한 체크 실패:', error)
    alert(error.message || '배틀을 생성할 수 없습니다.')
  }
}

// Watchers
watch(activeTab, () => {
  resetAndLoadBattles()
})

// Lifecycle
let observer = null

onMounted(async () => {
  await Promise.all([loadCategories(), updateTabCounts()])
  await Promise.all([
    loadHotBattles(),
    loadBattles(true)
  ])

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
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #0f172a;
  --primary-accent: #9333ea;
  --secondary: #64748b;
  --bg: #ffffff;
  --card: #ffffff;
  --border: #f1f5f9;
  --border-hover: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  display: flex;
  max-width: 100vw;
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
  padding-bottom: 5rem;
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
  }
}

/* 메인 헤더 */
.main-header {
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 30;
}

/* 탭 네비게이션 */
.tab-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--border);
}

@media (max-width: 768px) {
  .tab-navigation {
    padding: 0 1rem;
  }
}

.tabs-group {
  display: flex;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .tabs-group {
    gap: 1rem;
  }
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 1rem 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

@media (max-width: 768px) {
  .tab-button {
    padding: 0.875rem 0;
    font-size: 0.8125rem;
  }
}

.tab-button:hover {
  color: var(--text-secondary);
}

.tab-button.active {
  color: var(--text-primary);
  font-weight: 600;
  border-bottom-color: var(--text-primary);
}

.tab-count {
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  border-radius: 0.25rem;
  color: var(--text-muted);
}

.tab-button.active .tab-count {
  color: var(--primary-accent);
}

.view-switcher {
  display: flex;
  background: var(--border);
  border-radius: 0.5rem;
  padding: 0.125rem;
  gap: 0.125rem;
}

@media (max-width: 768px) {
  .view-switcher {
    display: none;
  }
}

.view-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  color: var(--text-secondary);
}

.view-btn.active {
  background: var(--bg);
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0;
  }
}

/* 배틀 섹션 */
.battles-section {
  margin-top: 0;
  padding: 20px 16px;
}

@media (min-width: 768px) {
  .battles-section {
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .battles-section {
    padding: 24px 32px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

@media (max-width: 640px) {
  .section-header {
    margin-bottom: 0.75rem;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-count {
  font-weight: 400;
  color: var(--text-muted);
}

.sort-select {
  padding: 0.375rem 1.5rem 0.375rem 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0 center;
  font-family: inherit;
}

.sort-select:focus {
  outline: none;
}

.create-battle-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.875rem;
  background: var(--primary-accent);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

@media (max-width: 768px) {
  .create-battle-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .create-battle-btn span {
    display: none;
  }

  .create-battle-btn {
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    justify-content: center;
    border-radius: 0.5rem;
  }
}

.create-battle-btn:hover {
  background: #7e22ce;
}

.create-battle-btn svg {
  flex-shrink: 0;
}

</style>