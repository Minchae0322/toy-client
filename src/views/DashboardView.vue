<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 페이지 헤더 -->
      <header class="page-header">
        <div class="header-content">
          <div class="title-group">
            <span class="title-badge">HOT</span>
            <h1 class="page-title">오늘의 트렌드</h1>
          </div>
          <p class="page-description">지금 가장 인기 있는 콘텐츠를 확인하세요</p>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- 인기 피드 섹션 -->
        <section class="content-section">
          <div class="section-header">
            <div class="title-group">
              <span class="section-icon">🔥</span>
              <h2 class="section-title">인기 피드</h2>
              <span v-if="hotFeeds.length" class="section-count">{{ hotFeeds.length }}</span>
            </div>
            <button class="view-all-btn" @click="goToFeeds">
              전체보기
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div v-if="feedsLoading" class="card-scroll">
            <div v-for="i in 4" :key="i" class="skeleton-card">
              <div class="skeleton-image shimmer"></div>
              <div class="skeleton-info">
                <div class="skeleton-line shimmer"></div>
                <div class="skeleton-line short shimmer"></div>
              </div>
            </div>
          </div>
          <div v-else-if="hotFeeds.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <p>아직 인기 피드가 없습니다</p>
          </div>
          <div v-else class="card-scroll">
            <FeedCard
              v-for="feed in hotFeeds"
              :key="feed.feedId"
              :feed="feed"
              class="scroll-card"
              @click="goToFeedDetail"
            />
          </div>
        </section>

        <!-- 실시간 배틀 섹션 -->
        <section class="content-section">
          <div class="section-header">
            <div class="title-group">
              <span class="section-icon">⚔️</span>
              <h2 class="section-title">실시간 배틀</h2>
              <span v-if="hotBattles.length" class="section-count">{{ hotBattles.length }}</span>
            </div>
            <button class="view-all-btn" @click="goToBattles">
              전체보기
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div v-if="battlesLoading" class="battle-grid">
            <div v-for="i in 3" :key="i" class="skeleton-card battle">
              <div class="skeleton-image shimmer"></div>
              <div class="skeleton-info">
                <div class="skeleton-line shimmer"></div>
                <div class="skeleton-line short shimmer"></div>
              </div>
            </div>
          </div>
          <div v-else-if="hotBattles.length === 0" class="empty-state">
            <span class="empty-icon">⚔️</span>
            <p>아직 진행 중인 배틀이 없습니다</p>
          </div>
          <div v-else class="battle-grid">
            <BattleCard
              v-for="battle in hotBattles"
              :key="battle.battleId || battle.id"
              :battle="battle"
            />
          </div>
        </section>

        <!-- 명예의 전당 섹션 -->
        <section class="content-section">
          <div class="section-header">
            <div class="title-group">
              <span class="section-icon">🏆</span>
              <h2 class="section-title">명예의 전당</h2>
              <span v-if="hotProducts.length" class="section-count">{{ hotProducts.length }}</span>
            </div>
            <button class="view-all-btn" @click="goToProducts">
              전체보기
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div v-if="productsLoading" class="product-grid">
            <div v-for="i in 4" :key="i" class="skeleton-card">
              <div class="skeleton-image shimmer"></div>
              <div class="skeleton-info">
                <div class="skeleton-line shimmer"></div>
                <div class="skeleton-line short shimmer"></div>
              </div>
            </div>
          </div>
          <div v-else-if="hotProducts.length === 0" class="empty-state">
            <span class="empty-icon">🏆</span>
            <p>아직 등록된 제품이 없습니다</p>
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

// 상태 관리
const hotFeeds = ref([])
const hotBattles = ref([])
const hotProducts = ref([])

const feedsLoading = ref(true)
const battlesLoading = ref(true)
const productsLoading = ref(true)

// 데이터 로딩 함수들
const loadHotFeeds = async () => {
  feedsLoading.value = true
  try {
    const response = await feedService.getHotFeeds({ size: 5 })
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

/* 페이지 헤더 */
.page-header {
  padding: 32px 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

@media (min-width: 768px) {
  .page-header {
    padding: 40px 24px 28px;
  }
}

.header-content {
  max-width: 1200px;
}

.page-header .title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.title-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .page-title {
    font-size: 24px;
  }
}

.page-description {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* 대시보드 컨텐츠 */
.dashboard-content {
  max-width: 1200px;
}

/* 섹션 공통 */
.content-section {
  padding: 28px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.content-section:last-child {
  border-bottom: none;
}

@media (min-width: 768px) {
  .content-section {
    padding: 32px 24px;
  }
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header .title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 18px;
  }
}

.section-count {
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.view-all-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.view-all-btn svg {
  transition: transform 0.2s ease;
}

.view-all-btn:hover svg {
  transform: translateX(2px);
}

/* 카드 스크롤 (피드) */
.card-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.card-scroll::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .card-scroll {
    margin: 0 -24px;
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (min-width: 1024px) {
  .card-scroll {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    overflow-x: visible;
    margin: 0;
    padding-left: 0;
    padding-right: 0;
  }
}

.scroll-card {
  flex-shrink: 0;
  width: 200px;
}

@media (min-width: 1024px) {
  .scroll-card {
    width: auto;
  }
}

/* 배틀 그리드 */
.battle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .battle-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .battle-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

/* 제품 그리드 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

/* 스켈레톤 카드 */
.skeleton-card {
  flex-shrink: 0;
  width: 200px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-card.battle {
  width: auto;
}

@media (min-width: 1024px) {
  .skeleton-card {
    width: auto;
  }
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 4 / 5;
  background: #f8fafc;
}

.skeleton-card.battle .skeleton-image {
  aspect-ratio: 4 / 3;
}

.skeleton-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  width: 100%;
  border-radius: 4px;
  background: #f8fafc;
}

.skeleton-line.short {
  width: 60%;
  height: 12px;
}

.shimmer {
  background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
    background: #f1f5f9;
  }

  .view-all-btn svg {
    transition: none;
  }
}
</style>
