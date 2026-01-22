<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 헤더 -->
      <header class="dashboard-header">
        <h1 class="dashboard-title">오늘의 HOT</h1>
        <p class="dashboard-subtitle">지금 가장 인기있는 콘텐츠를 만나보세요</p>
      </header>

      <div class="dashboard-content">
        <!-- 피드 핫 섹션 -->
        <section class="hot-section">
      <div class="section-header">
        <div class="section-title-group">
          <span class="section-icon">🔥</span>
          <h2 class="section-title">피드 HOT</h2>
        </div>
        <button class="view-all-btn" @click="goToFeeds">
          전체보기
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div v-if="feedsLoading" class="loading-container">
        <div class="skeleton-grid">
          <div v-for="i in 4" :key="i" class="skeleton-card"></div>
        </div>
      </div>
      <div v-else-if="hotFeeds.length === 0" class="empty-state">
        <p>아직 인기 피드가 없어요</p>
      </div>
      <div v-else class="feed-grid">
        <FeedCard
          v-for="feed in hotFeeds"
          :key="feed.feedId"
          :feed="feed"
          @click="goToFeedDetail"
        />
      </div>
    </section>

    <!-- 배틀 핫 섹션 -->
    <section class="hot-section">
      <div class="section-header">
        <div class="section-title-group">
          <span class="section-icon">⚔️</span>
          <h2 class="section-title">배틀 HOT</h2>
        </div>
        <button class="view-all-btn" @click="goToBattles">
          전체보기
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div v-if="battlesLoading" class="loading-container">
        <div class="skeleton-grid battle-skeleton">
          <div v-for="i in 3" :key="i" class="skeleton-card battle"></div>
        </div>
      </div>
      <div v-else-if="hotBattles.length === 0" class="empty-state">
        <p>아직 인기 배틀이 없어요</p>
      </div>
      <div v-else class="battle-grid">
        <BattleCard
          v-for="battle in hotBattles"
          :key="battle.battleId || battle.id"
          :battle="battle"
        />
      </div>
    </section>

    <!-- 제품 핫 섹션 -->
    <section class="hot-section">
      <div class="section-header">
        <div class="section-title-group">
          <span class="section-icon">🏆</span>
          <h2 class="section-title">제품 HOT</h2>
        </div>
        <button class="view-all-btn" @click="goToProducts">
          전체보기
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div v-if="productsLoading" class="loading-container">
        <div class="skeleton-grid product-skeleton">
          <div v-for="i in 4" :key="i" class="skeleton-card product"></div>
        </div>
      </div>
      <div v-else-if="hotProducts.length === 0" class="empty-state">
        <p>아직 인기 제품이 없어요</p>
      </div>
      <div v-else class="product-grid">
        <ProductCard
          v-for="product in hotProducts"
          :key="product.id"
          :product="product"
          view-mode="grid"
          @view-detail="goToProductDetail"
        />
        </div>
      </section>
    </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import FeedCard from '@/components/feed/FeedCard.vue'
import BattleCard from '@/components/battle/BattleCard.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import { feedService } from '@/services/FeedService'
import { battleService } from '@/services/BattleService'
import ProductService from '@/services/ProductService'

const router = useRouter()

// 상태
const hotFeeds = ref([])
const hotBattles = ref([])
const hotProducts = ref([])

const feedsLoading = ref(true)
const battlesLoading = ref(true)
const productsLoading = ref(true)

// 데이터 로드
const loadHotFeeds = async () => {
  feedsLoading.value = true
  try {
    const response = await feedService.getHotFeeds({ size: 4 })
    if (response.success) {
      hotFeeds.value = response.data?.content || response.data || []
    }
  } catch (error) {
    console.error('피드 로드 실패:', error)
  } finally {
    feedsLoading.value = false
  }
}

const loadHotBattles = async () => {
  battlesLoading.value = true
  try {
    const response = await battleService.getHotBattleList()
    if (response.success) {
      hotBattles.value = (response.data || []).slice(0, 3)
    }
  } catch (error) {
    console.error('배틀 로드 실패:', error)
  } finally {
    battlesLoading.value = false
  }
}

const loadHotProducts = async () => {
  productsLoading.value = true
  try {
    const productService = new ProductService()
    const response = await productService.getProducts({}, { size: 4, sort: 'viewCount,DESC' })
    if (response.success) {
      hotProducts.value = response.data?.content || response.data || []
    }
  } catch (error) {
    console.error('제품 로드 실패:', error)
  } finally {
    productsLoading.value = false
  }
}

// 네비게이션
const goToFeeds = () => router.push({ name: 'FeedHome' })
const goToFeedDetail = (feedId) => router.push({ name: 'FeedDetail', params: { id: feedId } })
const goToBattles = () => router.push({ name: 'BattleList' })
const goToProducts = () => router.push({ name: 'ProductRanking' })
const goToProductDetail = (product) => router.push({ name: 'ProductDetail', params: { id: product.id } })

// 초기화
onMounted(() => {
  loadHotFeeds()
  loadHotBattles()
  loadHotProducts()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  background: #ffffff;
  min-height: 100vh;
  color: #1a1a1a;
  font-family: 'SUIT-Regular', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100vw;
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

.dashboard-content {
  max-width: 1200px;
  padding: 0 20px 40px;
  background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
}

/* 헤더 */
.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 32px 0;
}

.dashboard-title {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.dashboard-subtitle {
  font-size: 15px;
  color: #8b8b9e;
  margin: 0;
  font-weight: 400;
}

/* 섹션 공통 */
.hot-section {
  background: #ffffff;
  border-radius: 24px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.01em;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  background: #f8f8fc;
  border: 1px solid #ebebf0;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: #6b6b80;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: #f0f0f8;
  color: #9333ea;
  border-color: #e0e0eb;
}

.view-all-btn svg {
  transition: transform 0.2s ease;
}

.view-all-btn:hover svg {
  transform: translateX(2px);
}

/* 그리드 레이아웃 */
.feed-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.battle-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 로딩 스켈레톤 */
.loading-container {
  padding: 8px 0;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.skeleton-grid.battle-skeleton {
  grid-template-columns: repeat(3, 1fr);
}

.skeleton-card {
  background: linear-gradient(90deg, #f0f0f5 25%, #fafafa 50%, #f0f0f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 20px;
  height: 320px;
}

.skeleton-card.battle {
  height: 280px;
}

.skeleton-card.product {
  height: 360px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 빈 상태 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  background: #fafbfc;
  border-radius: 16px;
  border: 1px dashed #e0e0e8;
}

.empty-state p {
  color: #9898a8;
  font-size: 14px;
  margin: 0;
}

/* 반응형: 태블릿 */
@media (max-width: 1024px) {
  .feed-grid,
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .battle-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .skeleton-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .skeleton-grid.battle-skeleton {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 반응형: 모바일 */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 0 0 40px;
    background: #f8f8fc;
  }

  .dashboard-header {
    padding: 24px 16px;
    margin-bottom: 16px;
  }

  .dashboard-title {
    font-size: 24px;
  }

  .dashboard-subtitle {
    font-size: 13px;
  }

  .hot-section {
    border-radius: 0;
    padding: 20px 16px;
    margin-bottom: 12px;
    border-left: none;
    border-right: none;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-icon {
    font-size: 20px;
  }

  .section-title {
    font-size: 17px;
  }

  .view-all-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .feed-grid,
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .battle-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .skeleton-grid.battle-skeleton {
    grid-template-columns: 1fr;
  }

  .skeleton-card {
    height: 260px;
  }

  .skeleton-card.battle {
    height: 220px;
  }

  .skeleton-card.product {
    height: 300px;
  }
}

/* 반응형: 작은 모바일 */
@media (max-width: 480px) {
  .feed-grid,
  .product-grid {
    grid-template-columns: 1fr;
  }

  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .skeleton-card {
    animation: none;
    background: #f0f0f5;
  }

  .view-all-btn,
  .view-all-btn svg {
    transition: none;
  }
}
</style>
