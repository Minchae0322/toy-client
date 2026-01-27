<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 페이지 헤더 -->
      <header class="page-header">
        <h1 class="page-title">대시보드</h1>
        <p class="page-description">오늘의 트렌드를 한눈에 확인하세요</p>
      </header>

      <!-- 통계 카드 -->
      <div class="stats-grid">
        <div class="stat-card" @click="goToFeeds">
          <div class="stat-icon feeds">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ hotFeeds.length }}</span>
            <span class="stat-label">인기 피드</span>
          </div>
          <svg class="stat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>

        <div class="stat-card" @click="goToBattles">
          <div class="stat-icon battles">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ hotBattles.length }}</span>
            <span class="stat-label">진행중 배틀</span>
          </div>
          <div v-if="hotBattles.length > 0" class="live-dot"></div>
          <svg class="stat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>

        <div class="stat-card" @click="goToProducts">
          <div class="stat-icon products">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ hotProducts.length }}</span>
            <span class="stat-label">명예의 전당</span>
          </div>
          <svg class="stat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- 인기 피드 섹션 -->
        <section class="content-section">
          <div class="section-header">
            <h2 class="section-title">인기 피드</h2>
            <button class="view-all-btn" @click="goToFeeds">
              전체보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div v-if="feedsLoading" class="feed-card-grid">
            <div v-for="i in 5" :key="i" class="feed-card">
              <div class="feed-card-image skeleton"></div>
              <div class="feed-card-body">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>
          </div>
          <div v-else-if="hotFeeds.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <p class="empty-text">아직 인기 피드가 없습니다</p>
          </div>
          <div v-else class="feed-card-grid">
            <div
              v-for="(feed, index) in hotFeeds"
              :key="feed.feedId"
              class="feed-card"
              @click="goToFeedDetail(feed.feedId)"
            >
              <!-- 이미지 영역 -->
              <div class="feed-card-image">
                <img
                  v-if="getThumbnailUrl(feed)"
                  :src="getThumbnailUrl(feed)"
                  :alt="feed.productName"
                  @error="handleImageError"
                />
                <div v-else class="no-image">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>

                <!-- 상단 뱃지 영역 -->
                <div class="image-badges-top">
                  <!-- 순위 뱃지 -->
                  <div :class="['rank-badge', `rank-${index + 1}`]">{{ index + 1 }}</div>
                  <!-- 급상승 뱃지 -->
                  <div v-if="feed.isTrending" class="trend-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                    급상승
                  </div>
                </div>

                <!-- 평가 뱃지 (좌측 하단) -->
                <div v-if="feed.feedEvaluation" :class="['eval-badge', feed.feedEvaluation.code.toLowerCase()]">
                  {{ feed.feedEvaluation.description }}
                </div>

                <!-- 좋아요 누른 유저들 (우측 하단) -->
                <div v-if="feed.recentLikers?.length" class="recent-likers">
                  <div
                    v-for="(liker, likerIndex) in feed.recentLikers.slice(0, 4)"
                    :key="liker.userId"
                    class="liker-avatar"
                    :style="{ zIndex: 4 - likerIndex }"
                  >
                    <img
                      v-if="liker.profileImageUrl"
                      :src="liker.profileImageUrl"
                      :alt="liker.nickname"
                    />
                    <span v-else class="liker-initial">{{ liker.nickname?.charAt(0) || '?' }}</span>
                  </div>
                  <div v-if="(feed.likeCount || 0) > 4" class="liker-more">
                    +{{ (feed.likeCount || 0) - 4 }}
                  </div>
                </div>
              </div>

              <!-- 카드 바디 -->
              <div class="feed-card-body">
                <!-- 제품명 -->
                <h4 class="product-name">{{ feed.productName || feed.content }}</h4>

                <!-- 카테고리 + 가격 -->
                <div class="feed-meta">
                  <span v-if="feed.subCategoryDetail?.subCategoryName" class="category-tag">
                    {{ feed.subCategoryDetail.subCategoryName }}
                  </span>
                  <span v-if="feed.buyPrice || feed.price" class="price">
                    {{ formatPrice(feed.buyPrice || feed.price) }}
                  </span>
                </div>

                <!-- 작성자 -->
                <span class="author-name">{{ feed.userInfo?.nickname || feed.nickname }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 실시간 배틀 섹션 -->
        <section class="content-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2 class="section-title">실시간 배틀</h2>
              <span v-if="hotBattles.length" class="live-badge">LIVE</span>
            </div>
            <button class="view-all-btn" @click="goToBattles">
              전체보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div v-if="battlesLoading" class="battle-grid">
            <div v-for="i in 3" :key="i" class="battle-skeleton">
              <div class="skeleton"></div>
            </div>
          </div>
          <div v-else-if="hotBattles.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <p class="empty-text">진행 중인 배틀이 없습니다</p>
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
            <h2 class="section-title">명예의 전당</h2>
            <button class="view-all-btn" @click="goToProducts">
              전체보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div v-if="productsLoading" class="product-grid">
            <div v-for="i in 4" :key="i" class="product-skeleton">
              <div class="skeleton"></div>
              <div class="skeleton-info">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>
          </div>
          <div v-else-if="hotProducts.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <p class="empty-text">등록된 제품이 없습니다</p>
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
import BattleCard from '@/components/battle/BattleCard.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import { feedService } from '@/services/FeedService'
import { battleService } from '@/services/BattleService'
import ProductService from '@/services/ProductService'

const router = useRouter()

const hotFeeds = ref([])
const hotBattles = ref([])
const hotProducts = ref([])

const feedsLoading = ref(true)
const battlesLoading = ref(true)
const productsLoading = ref(true)

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

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return Math.floor(num / 10000) + '만'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatPrice = (price) => {
  if (!price) return ''
  return price.toLocaleString() + '원'
}

const getThumbnailUrl = (feed) => {
  return feed.thumbnailUrl?.fileUrl || feed.hotFeedThumbnailDto?.fileUrl || null
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

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
  background: #fafafa;
  min-height: 100vh;
  color: #1a1a1a;
  font-family: 'SUIT-Regular', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
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

/* 페이지 헤더 */
.page-header {
  padding: 1.75rem 0 1.25rem;
}

@media (min-width: 768px) {
  .page-header {
    padding: 2rem 0 1.5rem;
  }
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.125rem;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .page-title {
    font-size: 1.375rem;
  }
}

.page-description {
  font-size: 0.8125rem;
  color: #999;
  margin: 0;
}

/* 통계 그리드 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

@media (min-width: 768px) {
  .stats-grid {
    gap: 1rem;
    margin-bottom: 2rem;
  }
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
  position: relative;
}

.stat-card:hover {
  border-color: #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

@media (min-width: 768px) {
  .stat-card {
    padding: 1.25rem;
  }
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.feeds {
  background: #fff5f5;
  color: #e53e3e;
}

.stat-icon.battles {
  background: #fffaf0;
  color: #dd6b20;
}

.stat-icon.products {
  background: #f0fff4;
  color: #38a169;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  display: block;
  font-size: 1.375rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.125rem;
}

@media (max-width: 767px) {
  .stat-value {
    font-size: 1.125rem;
  }

  .stat-label {
    font-size: 0.6875rem;
  }
}

.stat-arrow {
  color: #ccc;
  flex-shrink: 0;
}

.live-dot {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 8px;
  height: 8px;
  background: #e53e3e;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* 대시보드 콘텐츠 */
.dashboard-content {
  max-width: 1200px;
}

/* 섹션 */
.content-section {
  background: #fff;
  border-radius: 14px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid #f0f0f0;
}

@media (min-width: 768px) {
  .content-section {
    padding: 1.5rem;
    margin-bottom: 1.25rem;
  }
}

.content-section:last-child {
  margin-bottom: 0;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 1rem;
  }
}

.live-badge {
  padding: 0.125rem 0.375rem;
  background: #fef2f2;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  color: #dc2626;
  letter-spacing: 0.02em;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.view-all-btn:hover {
  background: #f5f5f5;
  color: #666;
}

/* 피드 카드 그리드 */
.feed-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .feed-card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .feed-card-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }
}

/* 피드 카드 */
.feed-card {
  position: relative;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feed-card:hover {
  border-color: #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

/* 상단 뱃지 영역 */
.image-badges-top {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 3;
}

/* 순위 뱃지 */
.rank-badge {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  color: white;
  background: #999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

/* 급상승 뱃지 */
.trend-badge {
  display: flex;
  align-items: center;
  gap: 0.1875rem;
  padding: 0.1875rem 0.375rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 4px;
  font-size: 0.5625rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  animation: pulse-trend 2s ease-in-out infinite;
}

@keyframes pulse-trend {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 좋아요 유저 목록 */
.recent-likers {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  z-index: 3;
}

.liker-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.liker-avatar:first-child {
  margin-left: 0;
}

.liker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.liker-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.5rem;
  font-weight: 600;
  color: white;
}

.liker-more {
  margin-left: 0.25rem;
  padding: 0.125rem 0.375rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 10px;
  font-size: 0.5625rem;
  font-weight: 600;
  color: white;
}

/* 카드 헤더 */
.feed-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-info .nickname {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-info .time {
  display: block;
  font-size: 0.625rem;
  color: #999;
}

/* 카드 이미지 */
.feed-card-image {
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  overflow: hidden;
}

.feed-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.feed-card:hover .feed-card-image img {
  transform: scale(1.02);
}

.feed-card-image .no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ccc;
}

/* 평가 뱃지 */
.eval-badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  z-index: 3;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.eval-badge.best {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.eval-badge.good {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.eval-badge.okay {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  color: white;
}

.eval-badge.bad {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

/* 카드 바디 */
.feed-card-body {
  padding: 0.625rem 0.75rem 0.75rem;
}

.product-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.375rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 메타 정보 */
.feed-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
  flex-wrap: wrap;
}

.category-tag {
  padding: 0.125rem 0.375rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 0.5625rem;
  color: #666;
  font-weight: 500;
}

.price {
  font-size: 0.625rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* 작성자 */
.author-name {
  font-size: 0.625rem;
  color: #999;
}

/* 카드 콘텐츠 (레거시) */
.feed-card-content {
  padding: 0.625rem 0.75rem 0.5rem;
}

.content-text {
  font-size: 0.75rem;
  color: #444;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 카드 푸터 */
.feed-card-footer {
  padding: 0.5rem 0.75rem 0.75rem;
  border-top: 1px solid #f5f5f5;
}

.stats {
  display: flex;
  gap: 0.75rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: #888;
}

.stat svg {
  color: #bbb;
}

/* 스켈레톤 */
.avatar-skeleton {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.feed-card-image.skeleton {
  aspect-ratio: 1;
}

.skeleton-line.tiny {
  width: 60px;
  height: 8px;
}

/* 배틀 그리드 */
.battle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .battle-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .battle-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 제품 그리드 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 스켈레톤 */
.skeleton {
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 10px;
}

.battle-skeleton .skeleton {
  aspect-ratio: 16 / 9;
}

.product-skeleton .skeleton {
  aspect-ratio: 1;
  margin-bottom: 0.625rem;
}

.skeleton-info {
  padding: 0 0.125rem;
}

.skeleton-line {
  height: 10px;
  border-radius: 3px;
  margin-bottom: 0.375rem;
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 50%;
  height: 8px;
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
  padding: 2.5rem 1rem;
  background: #fafafa;
  border-radius: 10px;
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.625rem;
  color: #bbb;
}

.empty-text {
  font-size: 0.8125rem;
  color: #999;
  margin: 0;
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .skeleton,
  .skeleton-line {
    animation: none;
    background: #f0f0f0;
  }

  .live-dot,
  .trend-badge {
    animation: none;
  }

  .feed-card:hover {
    transform: none;
  }

  .feed-card:hover .feed-card-image img {
    transform: none;
  }
}
</style>
