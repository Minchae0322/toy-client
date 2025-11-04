<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <AppHeader
          title="월간 배틀"
          :show-create-button="true"
          create-button-text="배틀 만들기"
          @create="handleCreateBattle"
      />

      <BattleTabs
          :tabs="tabs"
          v-model:active-tab="activeTab"
      />

      <CommonCategoryFilter
          :categories="categories"
          :show-all-button="true"
          @category-change="handleCategoryChange"
      />

      <div class="content-area">
        <!-- HOT 배틀 섹션 -->
        <HotBattleSection
            v-if="activeTab === 'ongoing' && !selectedCategory"
            :battles="hotBattles"
            :loading="hotLoading"
            @battle-click="openBattle"
        />

        <!-- 전체 배틀 리스트 -->
        <section>
          <div class="section-header">
            <h2 class="section-title">{{ currentCategoryTitle }}</h2>
            <div class="section-info">
              <span class="battle-count">{{ formatCount(totalCount) }}</span>
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

    <RightSidebar>
      <template #trending>
        <TrendingBattles
            :battles="trendingBattles"
            @battle-click="openBattle"
        />
      </template>

      <template #deadline>
        <DeadlineBattles
            :battles="deadlineBattles"
            @vote="handleVote"
        />
      </template>
    </RightSidebar>

    <!-- Bottom Navigation - Mobile Only -->
    <nav class="bottom-nav">
      <button class="bottom-nav-item" @click="$router.push('/feed')">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        <span>홈</span>
      </button>
      <button class="bottom-nav-item active">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
        </svg>
        <span>배틀</span>
        <span class="nav-badge">{{ activeBattleCount }}</span>
      </button>
      <button class="bottom-nav-fab" @click="handleCreateBattle">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
        </svg>
        <span>메시지</span>
      </button>
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
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
import AppHeader from '@/components/battle/AppHeader.vue'
import RightSidebar from '@/components/battle/RightSidebar.vue'
import BattleTabs from '@/components/battle/BattleTabs.vue'
import HotBattleSection from '@/components/battle/HotBattleSection.vue'
import BattleList from '@/components/battle/BattleList.vue'
import TrendingBattles from '@/components/battle/TrendingBattles.vue'
import DeadlineBattles from '@/components/battle/DeadlineBattles.vue'

const router = useRouter()

// State
const tabs = ref([
  { id: 'ongoing', label: '진행중', count: 0 },
  { id: 'ended', label: '종료됨', count: 0 },
  { id: 'my', label: '내 배틀', count: 0 }
])

const activeTab = ref('ongoing')
const battles = ref([])
const hotBattles = ref([])
const trendingBattles = ref([])
const deadlineBattles = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const totalCount = ref(0)
const hasNext = ref(true)
const loading = ref(false)
const hotLoading = ref(false)
const battleListRef = ref(null)
const viewMode = ref('feed')

const selectedCategory = ref(null)
const selectedSubCategory = ref(null)
const categories = ref([])

// Computed
const currentCategoryTitle = computed(() => {
  if (!selectedCategory.value) return '전체 배틀'
  let title = selectedCategory.value.categoryName
  if (selectedSubCategory.value) {
    title += ` > ${selectedSubCategory.value.subCategoryName}`
  }
  return title
})

const filteredBattles = computed(() => {
  return battles.value
})

const activeBattleCount = computed(() => {
  return tabs.value.find(tab => tab.id === 'ongoing')?.count || 0
})

// Utils
const formatCount = (num) => {
  if (num >= 10000) {
    return Math.floor(num / 1000) / 10 + '만'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num
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
    hotBattles.value = []
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
      searchCondition.category = selectedSubCategory.value.subCategoryId
    } else if (selectedCategory.value) {
      searchCondition.category = selectedCategory.value.categoryId
    }

    const response = await battleService.getBattles(
        searchCondition,
        { page: currentPage.value, size: 20, sort: 'createdAt,DESC' }
    )

    if (response.success && response.data) {
      const pageData = response.data.content ? response.data : { content: response.data }

      battles.value = reset
          ? pageData.content
          : [...battles.value, ...pageData.content]

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

const loadTrendingBattles = async () => {
  try {
    const response = await battleService.getBattles(
        { status: 'ACTIVE' },
        { page: 0, size: 5, sort: 'totalViews,DESC' }
    )
    if (response.success && response.data) {
      trendingBattles.value = response.data.content || response.data
    }
  } catch (error) {
    console.error('트렌딩 배틀 로드 실패:', error)
    trendingBattles.value = []
  }
}

const loadDeadlineBattles = async () => {
  try {
    const response = await battleService.getBattles(
        { status: 'ACTIVE' },
        { page: 0, size: 3, sort: 'endDate,ASC' }
    )
    if (response.success && response.data) {
      deadlineBattles.value = response.data.content || response.data
    }
  } catch (error) {
    console.error('마감 임박 배틀 로드 실패:', error)
    deadlineBattles.value = []
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

const handleVote = (battleId) => {
  router.push({ name: 'BattleDetail', params: { id: battleId } })
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
    loadBattles(true),
    loadTrendingBattles(),
    loadDeadlineBattles()
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
:root {
  --neutral-0: #FFFFFF;
  --neutral-50: #FAFAFA;
  --neutral-100: #F2F2F2;
  --neutral-200: #E8E8E8;
  --neutral-300: #D4D4D4;
  --neutral-400: #A3A3A3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-900: #0A0A0A;
  --bg: #FAFAFA;
  --accent: #0A0A0A;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Pretendard', system-ui, sans-serif;
  background: var(--bg);
  color: var(--neutral-900);
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  margin-right: 280px;
  background: var(--bg);
  min-height: 100vh;
  padding-bottom: 24px;
}

@media (max-width: 1280px) {
  .main-content {
    margin-right: 0;
  }
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding-bottom: 68px;
  }
}

.content-area {
  padding: 20px 24px;
}

@media (max-width: 768px) {
  .content-area {
    padding: 16px;
  }
}

.section-header {
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--neutral-900);
  letter-spacing: -0.014em;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.battle-count {
  font-size: 11.5px;
  font-weight: 550;
  color: var(--neutral-500);
  padding: 2px 8px;
  background: var(--neutral-100);
  border-radius: 6px;
  letter-spacing: -0.006em;
  font-variant-numeric: tabular-nums;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-top: 0.5px solid var(--neutral-200);
  z-index: 50;
  display: none;
  align-items: center;
  justify-content: space-around;
  padding: 4px 0 6px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.02);
}

@media (max-width: 1024px) {
  .bottom-nav {
    display: flex;
  }
}

.bottom-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 5px 8px;
  background: transparent;
  border: none;
  color: var(--neutral-400);
  cursor: pointer;
  transition: color 160ms ease;
  font-family: inherit;
}

.bottom-nav-item.active {
  color: var(--neutral-900);
}

.bottom-nav-item .icon {
  width: 20px;
  height: 20px;
}

.bottom-nav-item span:not(.nav-badge) {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: -0.006em;
}

.nav-badge {
  position: absolute;
  top: 2px;
  right: 4px;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  background: #FF3B30;
  color: white;
  font-size: 9px;
  font-weight: 700;
  border-radius: 7.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(255, 59, 48, 0.24);
  font-variant-numeric: tabular-nums;
}

.bottom-nav-fab {
  width: 48px;
  height: 48px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.16), 0 1px 3px rgba(10, 10, 10, 0.08);
  margin-top: -24px;
  transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-nav-fab:hover {
  background: #000000;
  transform: translateY(-0.5px) scale(1.01);
  box-shadow: 0 6px 16px rgba(10, 10, 10, 0.2), 0 2px 4px rgba(10, 10, 10, 0.1);
}

.bottom-nav-fab:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(10, 10, 10, 0.12);
}

.bottom-nav-fab .icon {
  width: 24px;
  height: 24px;
  stroke-width: 2.5;
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    padding-bottom: max(6px, env(safe-area-inset-bottom));
  }
}
</style>