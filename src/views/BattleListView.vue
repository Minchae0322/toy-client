<template>
  <div class="app-container">
    <!-- 사이드바 - 데스크탑 -->
    <AppSidebar class="desktop-sidebar" />

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
            :show-all-button="true"
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
    <nav class="mobile-nav">
      <button class="nav-item">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
        </svg>
        <span>홈</span>
      </button>
      <button class="nav-item active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5V3M15 5V3M9 5h6"/>
        </svg>
        <span>배틀</span>
        <span class="nav-badge">{{ activeBattleCount }}</span>
      </button>
      <button class="nav-fab" @click="handleCreateBattle">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="nav-item">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
        </svg>
        <span>메시지</span>
      </button>
      <button class="nav-item">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 21a8 8 0 10-16 0M12 13a4 4 0 100-8 4 4 0 000 8z"/>
        </svg>
        <span>MY</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { battleService } from '@/services/BattleService'
import { categoryService } from '@/services/CategoryService'

// Components
import CommonCategoryFilter from '@/components/category/CommonCategoryFilter.vue'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import HotBattleSection from '@/components/battle/HotBattleSection.vue'
import BattleList from '@/components/battle/BattleList.vue'

const router = useRouter()

// State
const tabs = ref([
  { id: 'ongoing', label: '진행중', count: 0 },
  { id: 'ended', label: '종료됨', count: 0 },
  { id: 'my', label: '내 배틀', count: 0 }
])

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
    const response = await battleService.getBattles(
        { status: 'ACTIVE' },
        { page: 0, size: 5, sort: 'hotScore,DESC' }
    )
    if (response.success && response.data) {
      hotBattles.value = response.data.content || response.data
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
      tabs.value[0].count = ongoingResponse.data.totalElements
    }

    const endedResponse = await battleService.getBattles(
        { status: 'CLOSED' },
        { page: 0, size: 1 }
    )
    if (endedResponse.success && endedResponse.data.totalElements !== undefined) {
      tabs.value[1].count = endedResponse.data.totalElements
    }
  } catch (error) {
    console.error('탭 카운트 업데이트 실패:', error)
  }
}

// Event Handlers
const handleCategoryChange = ({ category, subCategory }) => {
  selectedCategory.value = category
  selectedSubCategory.value = subCategory
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

/* BattleHomeView.vue - style 부분만 수정 */

/* BattleHomeView.vue - style 부분만 수정 */
<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #222222;
  --secondary: #64748B;
  --accent: #F97316;
  --bg: #FFFFFF;
  --card: #FFFFFF;
  --border: #E2E8F0;
  --hover: #F8FAFC;
  --shadow: rgba(0, 0, 0, 0.04);
}

/* 기본 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  display: flex;
  max-width: 100vw;
}

/* 모바일: 작은 여백 */
.app-container {
  padding: 0 1rem;
}

/* 태블릿: 중간 여백 */
@media (min-width: 768px) {
  .app-container {
    padding: 0 2rem;
  }
}

/* 데스크톱: 큰 여백 */
@media (min-width: 1280px) {
  .app-container {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* 대형 화면: 더 큰 여백 */
@media (min-width: 1920px) {
  .app-container {
    padding: 0 4rem;
  }
}

/* 메인 컨텐츠 */
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
  background: white;
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
  color: var(--secondary);
  font-size: 0.875rem;
  font-weight: 600;
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
  color: var(--primary);
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-count {
  padding: 0.1875rem 0.5rem;
  background: var(--hover);
  color: var(--secondary);
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: 0.375rem;
  min-width: 1.25rem;
  text-align: center;
  border: 1px solid var(--border);
}

.tab-button.active .tab-count {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.view-switcher {
  display: flex;
  background: var(--hover);
  border-radius: 0.5rem;
  padding: 0.1875rem;
  gap: 0.125rem;
  border: 1px solid var(--border);
}

@media (max-width: 768px) {
  .view-switcher {
    display: none;
  }
}

.view-btn {
  width: 2.125rem;
  height: 2.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  color: var(--primary);
}

.view-btn.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

/* 컨텐츠 영역 */
.content-wrapper {
  padding: 1.5rem 0;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1.25rem 0;
  }
}

/* 배틀 섹션 */
.battles-section {
  margin-top: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

@media (max-width: 640px) {
  .section-header {
    margin-bottom: 1rem;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

@media (max-width: 768px) {
  .header-right {
    gap: 0.5rem;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: -0.02em;
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 640px) {
  .section-title {
    font-size: 1rem;
  }
}

.section-count {
  padding: 0.25rem 0.625rem;
  background: var(--hover);
  color: var(--secondary);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

@media (max-width: 640px) {
  .section-count {
    font-size: 0.6875rem;
    padding: 0.1875rem 0.5rem;
  }
}

.sort-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  background: var(--hover);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--primary);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  transition: all 0.2s;
  font-family: inherit;
}

.sort-select:hover {
  background: white;
  border-color: #CBD5E1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
}

.create-battle-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.125rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .create-battle-btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 640px) {
  .create-battle-btn span {
    display: none;
  }

  .create-battle-btn {
    width: 2.375rem;
    height: 2.375rem;
    padding: 0;
    justify-content: center;
  }
}

.create-battle-btn:hover {
  background: #1E293B;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.create-battle-btn:active {
  transform: translateY(0);
}

.create-battle-btn svg {
  flex-shrink: 0;
}

/* 모바일 네비게이션 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card);
  border-top: 1px solid var(--border);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem 0;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

@media (min-width: 1024px) {
  .mobile-nav {
    display: none;
  }
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  min-width: 3.5rem;
}

.nav-item.active {
  color: var(--primary);
}

.nav-item svg {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.nav-item span:not(.nav-badge) {
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
}

.nav-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.3125rem;
  background: #DC2626;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 0.5625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-fab {
  width: 3.5rem;
  height: 3.5rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0.5rem 1.25rem rgba(249, 115, 22, 0.4);
  margin-top: -1.75rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.nav-fab:active {
  transform: scale(0.95);
}

.nav-fab svg {
  width: 1.75rem;
  height: 1.75rem;
  stroke-width: 2.5;
  flex-shrink: 0;
}

/* 고해상도 디스플레이 대응 */
@media (max-resolution: 1dppx) {
  .nav-item svg {
    width: 1.375rem;
    height: 1.375rem;
  }

  .nav-fab {
    width: 3.25rem;
    height: 3.25rem;
  }
}

/* 스크롤바 */
::-webkit-scrollbar {
  width: 0.5rem;
  height: 0.5rem;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 0.25rem;
}

::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
</style>