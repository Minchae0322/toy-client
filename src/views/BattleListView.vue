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
            <h2 class="section-title">
              {{ currentCategoryTitle }}
            </h2>
            <div class="section-info">
              <span class="battle-count">{{ totalCount }}개</span>
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
import { battleService, battleUtils } from '@/services/BattleService'
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

// ==================== State ====================
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

// 카테고리 상태
const selectedCategory = ref(null)
const selectedSubCategory = ref(null)
const categories = ref([])

// ==================== Computed ====================
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

// ==================== API Methods ====================

/**
 * 카테고리 목록 로드
 */
const loadCategories = async () => {
  try {
    console.log('📂 [BATTLE_LIST] 카테고리 로드 시작')
    const response = await categoryService.getCategories()

    if (response.success && response.data) {
      categories.value = response.data
      console.log('✅ [BATTLE_LIST] 카테고리 로드 성공:', categories.value.length)
    }
  } catch (error) {
    console.error('❌ [BATTLE_LIST] 카테고리 로드 실패:', error)
  }
}

/**
 * HOT 배틀 로드 (인기 배틀)
 */
const loadHotBattles = async () => {
  try {
    hotLoading.value = true
    console.log('🔥 [BATTLE_LIST] HOT 배틀 로드 시작')

    // 조회수와 투표수가 높은 배틀 조회
    const response = await battleService.getBattles(
        {
          status: 'ACTIVE'
        },
        {
          page: 0,
          size: 2,
          sort: 'totalVotes,DESC'
        }
    )

    if (response.success && response.data) {
      hotBattles.value = response.data.content || response.data
      console.log('✅ [BATTLE_LIST] HOT 배틀 로드 성공:', hotBattles.value.length)
    }
  } catch (error) {
    console.error('❌ [BATTLE_LIST] HOT 배틀 로드 실패:', error)
    hotBattles.value = []
  } finally {
    hotLoading.value = false
  }
}

/**
 * 배틀 목록 로드
 */
const loadBattles = async (reset = false) => {
  if (loading.value) return
  if (!reset && !hasNext.value) return

  try {
    loading.value = true

    if (reset) {
      currentPage.value = 0
      battles.value = []
    }

    console.log('📋 [BATTLE_LIST] 배틀 목록 로드 시작', {
      page: currentPage.value,
      tab: activeTab.value,
      category: selectedSubCategory.value?.subCategoryId || selectedCategory.value?.categoryId
    })

    // 검색 조건 구성
    const searchCondition = {}

    // 탭별 상태 필터
    if (activeTab.value === 'ongoing') {
      searchCondition.status = 'ACTIVE'
    } else if (activeTab.value === 'ended') {
      searchCondition.status = 'CLOSED'
    }

    // 카테고리 필터
    if (selectedSubCategory.value) {
      searchCondition.category = selectedSubCategory.value.subCategoryId
    } else if (selectedCategory.value) {
      searchCondition.category = selectedCategory.value.categoryId
    }

    // API 호출
    const response = await battleService.getBattles(
        searchCondition,
        {
          page: currentPage.value,
          size: 20,
          sort: 'createdAt,DESC'
        }
    )

    if (response.success && response.data) {
      const pageData = response.data.content ? response.data : { content: response.data }

      battles.value = reset
          ? pageData.content
          : [...battles.value, ...pageData.content]

      // 페이징 정보 업데이트
      if (response.data.totalElements !== undefined) {
        totalCount.value = response.data.totalElements
        totalPages.value = response.data.totalPages
        hasNext.value = !response.data.last
      } else {
        hasNext.value = false
      }

      currentPage.value++

      console.log('✅ [BATTLE_LIST] 배틀 목록 로드 성공:', {
        loaded: pageData.content.length,
        total: battles.value.length,
        hasNext: hasNext.value
      })
    }
  } catch (error) {
    console.error('❌ [BATTLE_LIST] 배틀 목록 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 트렌딩 배틀 로드 (사이드바)
 */
const loadTrendingBattles = async () => {
  try {
    console.log('📈 [BATTLE_LIST] 트렌딩 배틀 로드 시작')

    const response = await battleService.getBattles(
        {
          status: 'ACTIVE'
        },
        {
          page: 0,
          size: 5,
          sort: 'totalViews,DESC'
        }
    )

    if (response.success && response.data) {
      trendingBattles.value = response.data.content || response.data
      console.log('✅ [BATTLE_LIST] 트렌딩 배틀 로드 성공:', trendingBattles.value.length)
    }
  } catch (error) {
    console.error('❌ [BATTLE_LIST] 트렌딩 배틀 로드 실패:', error)
    trendingBattles.value = []
  }
}

/**
 * 마감 임박 배틀 로드 (사이드바)
 */
const loadDeadlineBattles = async () => {
  try {
    console.log('⏰ [BATTLE_LIST] 마감 임박 배틀 로드 시작')

    const response = await battleService.getBattles(
        {
          status: 'ACTIVE'
        },
        {
          page: 0,
          size: 3,
          sort: 'endDate,ASC'
        }
    )

    if (response.success && response.data) {
      deadlineBattles.value = response.data.content || response.data
      console.log('✅ [BATTLE_LIST] 마감 임박 배틀 로드 성공:', deadlineBattles.value.length)
    }
  } catch (error) {
    console.error('❌ [BATTLE_LIST] 마감 임박 배틀 로드 실패:', error)
    deadlineBattles.value = []
  }
}

/**
 * 탭별 카운트 업데이트
 */
const updateTabCounts = async () => {
  try {
    console.log('🔢 [BATTLE_LIST] 탭 카운트 업데이트 시작')

    // 진행중 배틀 수
    const ongoingResponse = await battleService.getBattles(
        { status: 'ACTIVE' },
        { page: 0, size: 1 }
    )
    if (ongoingResponse.success && ongoingResponse.data.totalElements !== undefined) {
      tabs.value[0].count = ongoingResponse.data.totalElements
    }

    // 종료된 배틀 수
    const endedResponse = await battleService.getBattles(
        { status: 'CLOSED' },
        { page: 0, size: 1 }
    )
    if (endedResponse.success && endedResponse.data.totalElements !== undefined) {
      tabs.value[1].count = endedResponse.data.totalElements
    }

    console.log('✅ [BATTLE_LIST] 탭 카운트 업데이트 완료:', {
      ongoing: tabs.value[0].count,
      ended: tabs.value[1].count
    })
  } catch (error) {
    console.error('❌ [BATTLE_LIST] 탭 카운트 업데이트 실패:', error)
  }
}

// ==================== Event Handlers ====================

/**
 * 카테고리 변경 핸들러
 */
const handleCategoryChange = ({ category, subCategory }) => {
  console.log('🏷️ [BATTLE_LIST] 카테고리 변경:', { category, subCategory })

  selectedCategory.value = category
  selectedSubCategory.value = subCategory

  resetAndLoadBattles()
}

/**
 * 배틀 목록 초기화 및 재로드
 */
const resetAndLoadBattles = () => {
  console.log('🔄 [BATTLE_LIST] 배틀 목록 초기화')
  battles.value = []
  currentPage.value = 0
  hasNext.value = true
  loadBattles(true)
}

/**
 * 배틀 상세 페이지 이동
 */
const openBattle = (battleId) => {
  console.log('📖 [BATTLE_LIST] 배틀 상세 페이지로 이동:', battleId)
  router.push({ name: 'BattleDetail', params: { id: battleId } })
}

/**
 * 배틀 생성 페이지 이동
 */
const handleCreateBattle = async () => {
  try {
    console.log('🔍 [BATTLE_LIST] 배틀 생성 권한 체크')

    // 생성 권한 체크
    const response = await battleService.validateCreation()

    if (response.success) {
      console.log('✅ [BATTLE_LIST] 생성 권한 확인 완료')
      router.push({ name: 'BattleCreate' })
    }
  } catch (error) {
    console.error('❌ [BATTLE_LIST] 생성 권한 체크 실패:', error)
    alert(error.message || '배틀을 생성할 수 없습니다.')
  }
}

/**
 * 투표 핸들러
 */
const handleVote = (battleId) => {
  console.log('🗳️ [BATTLE_LIST] 투표:', battleId)
  router.push({ name: 'BattleDetail', params: { id: battleId } })
}

// ==================== Watchers ====================
watch(activeTab, () => {
  console.log('📌 [BATTLE_LIST] 탭 변경:', activeTab.value)
  resetAndLoadBattles()
})

// ==================== Lifecycle ====================
let observer = null

onMounted(async () => {
  console.log('✅ [BATTLE_LIST] 컴포넌트 마운트')

  // 초기 데이터 로드
  await Promise.all([
    loadCategories(),
    updateTabCounts()
  ])

  // 메인 콘텐츠 로드
  await Promise.all([
    loadHotBattles(),
    loadBattles(true),
    loadTrendingBattles(),
    loadDeadlineBattles()
  ])

  // Intersection Observer 설정
  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext.value && !loading.value) {
          console.log('👁️ [BATTLE_LIST] 스크롤 감지 - 다음 페이지 로드')
          loadBattles()
        }
      },
      {
        threshold: 0.5,
        rootMargin: '100px'
      }
  )

  setTimeout(() => {
    if (battleListRef.value?.observerTarget) {
      observer.observe(battleListRef.value.observerTarget)
      console.log('✅ [BATTLE_LIST] Intersection Observer 연결')
    }
  }, 100)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    console.log('🔌 [BATTLE_LIST] Intersection Observer 해제')
  }
})
</script>

<style scoped>
/* CSS Variables */
:root {
  --primary: #1A1A1A;
  --secondary: #737380;
  --accent: #FF6B35;
  --bg: #FAFBFC;
  --card: #FFFFFF;
  --border: #F0F0F3;
  --hover: #F5F5F7;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  margin-right: 360px;
  background: var(--bg);
  min-height: 100vh;
  padding-bottom: 40px;
}

@media (max-width: 1280px) {
  .main-content {
    margin-right: 0;
  }
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding-bottom: 80px;
  }
}

.content-area {
  padding: 40px;
}

@media (max-width: 768px) {
  .content-area {
    padding: 24px 16px;
  }
}

.section-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: -0.01em;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.battle-count {
  font-size: 14px;
  color: var(--secondary);
  padding: 4px 12px;
  background: var(--hover);
  border-radius: 12px;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card);
  border-top: 1px solid var(--border);
  z-index: 50;
  display: none;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
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
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.bottom-nav-item.active {
  color: var(--primary);
}

.bottom-nav-item .icon {
  width: 24px;
  height: 24px;
}

.bottom-nav-item span:not(.nav-badge) {
  font-size: 11px;
  font-weight: 600;
}

.nav-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #FF5850;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-nav-fab {
  width: 56px;
  height: 56px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(26, 26, 26, 0.3);
  margin-top: -28px;
  transition: all 0.2s;
}

.bottom-nav-fab:hover {
  background: #000000;
  transform: translateY(-1px);
}

.bottom-nav-fab:active {
  transform: scale(0.95);
}

.bottom-nav-fab .icon {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}
</style>