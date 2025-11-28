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
/* 기본 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  display: flex;
  min-height: 100vh;
  background: #FFFFFF;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0 20px;
}

@media (min-width: 768px) {
  .app-container {
    margin: 0 32px;
  }
}

@media (min-width: 1280px) {
  .app-container {
    margin: 0 60px;
  }
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding-bottom: 80px;
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 40px;
  }
}

/* 메인 헤더 */
.main-header {
  background: white;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  z-index: 30;
}

/* 탭 네비게이션 */
.tab-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid #E2E8F0;
}

.tabs-group {
  display: flex;
  gap: 24px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748B;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.tab-button:hover {
  color: #0F172A;
}

.tab-button.active {
  color: #0F172A;
  border-bottom-color: #0F172A;
}

.tab-count {
  padding: 3px 8px;
  background: #F8FAFC;
  color: #64748B;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  min-width: 20px;
  text-align: center;
  border: 1px solid #E2E8F0;
}

.tab-button.active .tab-count {
  background: #0F172A;
  color: white;
  border-color: #0F172A;
}

.view-switcher {
  display: flex;
  background: #F8FAFC;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
  border: 1px solid #E2E8F0;
}

.view-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  color: #0F172A;
}

.view-btn.active {
  background: white;
  color: #0F172A;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

@media (max-width: 768px) {
  .tab-navigation {
    padding: 0 16px;
  }

  .tabs-group {
    gap: 16px;
  }

  .tab-button {
    padding: 14px 0;
    font-size: 13px;
  }

  .view-switcher {
    display: none;
  }
}

/* 컨텐츠 영역 */
.content-wrapper {
  padding: 24px 0;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 0;
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
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E2E8F0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.02em;
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 20px;
  }
}

.section-count {
  padding: 4px 10px;
  background: #F8FAFC;
  color: #64748B;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
}

.create-battle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #0F172A;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
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

@media (max-width: 768px) {
  .header-right {
    gap: 8px;
  }

  .create-battle-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
}

@media (max-width: 640px) {
  .section-header {
    margin-bottom: 16px;
  }

  .create-battle-btn span {
    display: none;
  }

  .create-battle-btn {
    width: 38px;
    height: 38px;
    padding: 0;
    justify-content: center;
  }

  .section-title {
    font-size: 16px;
  }

  .section-count {
    font-size: 11px;
    padding: 3px 8px;
  }
}

.sort-select {
  padding: 8px 32px 8px 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  color: #0F172A;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
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
  border-color: #0F172A;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
}

/* 모바일 네비게이션 */
.mobile-nav {
  display: none;
}

@media (max-width: 1023px) {
  .mobile-nav {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #E2E8F0;
    padding: 8px 0 max(8px, env(safe-area-inset-bottom));
    z-index: 40;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: #64748B;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  font-family: inherit;
}

.nav-item.active {
  color: #0F172A;
}

.nav-item svg {
  width: 24px;
  height: 24px;
}

.nav-item span {
  font-size: 11px;
  font-weight: 600;
}

.nav-badge {
  position: absolute;
  top: 2px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #EF4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-fab {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0F172A;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -24px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.nav-fab:active {
  transform: scale(0.95);
}

/* 스크롤바 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
</style>