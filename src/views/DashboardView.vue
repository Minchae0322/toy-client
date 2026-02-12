<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 페이지 헤더 -->
      <header class="page-header">
        <h1 class="page-title">트렌드 한눈에</h1>
        <p class="page-description">인기 피드, 요거픽, 제품 랭킹을 모아봤어요</p>
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
            <span class="stat-label">진행중 요거픽</span>
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
            <span class="stat-label">지금 뜨는 제품</span>
          </div>
          <svg class="stat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>

      <!-- 실시간 요거 봄 섹션 -->
      <section class="yogurt-bom-section">
        <div class="yb-left">
          <div class="yb-title-box">
            <svg class="yb-icon" width="26" height="20" viewBox="0 0 30 24" fill="none">
              <!-- 왼쪽 눈 (세로로 긴) -->
              <ellipse cx="8" cy="12" rx="5.5" ry="8" fill="rgba(255,255,255,0.25)" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="9" cy="10" r="3" fill="currentColor"/>
              <circle cx="10" cy="8.5" r="1.2" fill="rgba(255,255,255,0.95)"/>
              <circle cx="7.5" cy="11" r="0.5" fill="rgba(255,255,255,0.5)"/>
              <!-- 오른쪽 눈 (세로로 긴) -->
              <ellipse cx="22" cy="12" rx="5.5" ry="8" fill="rgba(255,255,255,0.25)" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="23" cy="10" r="3" fill="currentColor"/>
              <circle cx="24" cy="8.5" r="1.2" fill="rgba(255,255,255,0.95)"/>
              <circle cx="21.5" cy="11" r="0.5" fill="rgba(255,255,255,0.5)"/>
            </svg>
            <h2 class="yb-main-title">실시간 요거 봄</h2>
          </div>
          <span class="yb-update-time">업데이트 {{ lastUpdateTime }}</span>
        </div>

        <div class="yb-right">
          <div v-if="yogurtBomLoading" class="yb-list">
            <div v-for="i in 6" :key="i" class="yb-item skeleton-item">
              <div class="skeleton yb-sk-rank"></div>
              <div class="yb-sk-content">
                <div class="skeleton yb-sk-line"></div>
                <div class="skeleton yb-sk-line short"></div>
              </div>
            </div>
          </div>

          <div v-else-if="yogurtBomFeeds.length === 0" class="empty-state compact">
            <p class="empty-text">실시간 데이터가 없습니다</p>
          </div>

          <div v-else class="yb-list">
            <div
              v-for="(feed, index) in currentYogurtBomFeeds"
              :key="feed.feedId"
              class="yb-item"
              @click="goToFeedDetail(feed.feedId)"
            >
              <span class="yb-rank-num">{{ ybCurrentPage * 6 + index + 1 }}</span>
              <div class="yb-info">
                <span class="yb-product">{{ feed.productName }}</span>
                <span class="yb-author-name">{{ feed.buyPlace || '' }}</span>
              </div>
              <span v-if="isNewFeed(feed)" class="yb-tag new">NEW</span>
              <span v-if="isHotFeed(feed)" class="yb-tag hot">HOT</span>
            </div>
          </div>
        </div>

        <div class="yb-pagination">
          <button
            class="yb-page-btn"
            :class="{ active: ybCurrentPage === 0 }"
            @click="setYbPage(0)"
          ></button>
          <button
            class="yb-page-btn"
            :class="{ active: ybCurrentPage === 1 }"
            @click="setYbPage(1)"
          ></button>
        </div>
      </section>

      <div class="dashboard-content">
        <!-- 핫 피드 섹션 -->
        <section class="content-section hot-feeds-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2 class="section-title">지금 뜨는 핫-기록</h2>
              <span class="sub-title">실시간 인기 리뷰</span>
            </div>
            <button class="view-all-link" @click="goToFeeds">
              전체보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          <div v-if="feedsLoading" class="dashboard-feed-scroll">
            <div v-for="i in 3" :key="i" class="skeleton dash-card-skeleton"></div>
          </div>

          <div v-else-if="hotFeeds.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <p class="empty-text">아직 인기 피드가 없습니다</p>
          </div>

          <div v-else class="dashboard-feed-scroll">
            <div
              v-for="(feed, index) in hotFeeds"
              :key="feed.feedId"
              class="dash-feed-card"
              @click="goToFeedDetail(feed.feedId)"
            >
              <div class="card-visual-wrapper">
                <img :src="feed.hotFeedThumbnailDto?.fileUrl" :alt="feed.productName" @error="handleImageError" />

                <div class="card-overlay">
                  <div class="overlay-top">
                    <span class="rank-num">0{{ index + 1 }}</span>
                    <span v-if="feed.isTrending" class="trending-tag">HOT</span>
                  </div>

                  <div class="overlay-bottom">
                    <span v-if="feed.feedEvaluation?.code" :class="['eval-pill', feed.feedEvaluation.code.toLowerCase()]">
                      {{ feed.feedEvaluation.description }}
                    </span>
                    <p v-if="feed.reviewSummary" class="review-main">"{{ feed.reviewSummary }}"</p>
                    <span class="product-name-sub">{{ feed.productName }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 실시간 배틀 섹션 -->
        <section class="content-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2 class="section-title">실시간 요거픽</h2>
              <span class="sub-title">유저들이 직접 고르는 승부</span>
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
            <p class="empty-text">진행 중인 요거픽이 없습니다</p>
          </div>
          <div v-else class="battle-grid">
            <BattleCard
              v-for="battle in hotBattles"
              :key="battle.battleId || battle.id"
              :battle="battle"
              :hide-creator="true"
            />
          </div>
        </section>

        <!-- 실시간 제품 랭킹 섹션 -->
        <section class="content-section ranking-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2 class="section-title">실시간 제품 랭킹</h2>
              <span class="sub-title">요즘 뜨는 인기 아이템</span>
            </div>
            <button class="view-all-btn" @click="goToProducts">
              전체보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div v-if="productsLoading" class="product-rank-container">
            <div class="skeleton hero-skeleton"></div>
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

          <div v-else class="product-rank-container">
            <!-- 1위 히어로 카드 -->
            <div class="rank-hero-card" @click="goToProductDetail(hotProducts[0])">
              <div class="hero-badge">BEST 1</div>
              <img :src="getProductThumbnail(hotProducts[0])" class="hero-image" />
              <div class="hero-overlay">
                <div class="hero-info">
                  <span class="hero-brand">{{ hotProducts[0].brand }}</span>
                  <h3 class="hero-name">{{ hotProducts[0].name }}</h3>
                  <div class="hero-stats">
                    <div class="trend-score">
                      <span class="score-dot"></span>
                      인기지수 {{ formatNumber(getProductPopularityScore(hotProducts[0])) }}
                    </div>
                    <div v-if="hotProducts[0].averageRating" class="hero-rating">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      {{ Number(hotProducts[0].averageRating).toFixed(1) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2-5위 리스트 -->
            <div v-if="hotProducts.length > 1" class="rank-sub-list">
              <div
                v-for="(product, index) in hotProducts.slice(1)"
                :key="product.id"
                class="rank-sub-item"
                @click="goToProductDetail(product)"
              >
                <div class="sub-rank-number">{{ index + 2 }}</div>
                <img :src="getProductThumbnail(product)" class="sub-image" @error="handleImageError" />
                <div class="sub-info">
                  <span class="sub-brand">{{ product.brand }}</span>
                  <h4 class="sub-name">{{ product.name }}</h4>
                  <div class="sub-meta">
                    <div v-if="product.averageRating" class="sub-rating">
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="#FBBF24">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      {{ Number(product.averageRating).toFixed(1) }}
                    </div>
                    <span v-if="product.reviewCount" class="sub-reviews">리뷰 {{ formatNumber(product.reviewCount) }}</span>
                  </div>
                </div>
                <div class="sub-score">
                  <span class="sub-score-value">{{ getProductScorePercent(product, index + 1) }}%</span>
                </div>
                <svg class="sub-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import BattleCard from '@/components/battle/BattleCard.vue'
import { feedService } from '@/services/FeedService'
import { battleService } from '@/services/BattleService'
import { productService } from '@/services/ProductService'

const router = useRouter()

const hotFeeds = ref([])
const hotBattles = ref([])
const hotProducts = ref([])

const yogurtBomFeeds = ref([])
const lastUpdateTime = ref('')
const ybCurrentPage = ref(0)
let ybAutoSlideTimer = null

// 캐시 관리 (5분 유효)
const CACHE_DURATION = 5 * 60 * 1000
let yogurtBomCache = {
  data: null,
  timestamp: 0,
  updateTime: ''
}

const currentYogurtBomFeeds = computed(() => {
  const start = ybCurrentPage.value * 6
  return yogurtBomFeeds.value.slice(start, start + 6)
})

const setYbPage = (page) => {
  ybCurrentPage.value = page
  resetYbAutoSlide()
}

const resetYbAutoSlide = () => {
  if (ybAutoSlideTimer) {
    clearInterval(ybAutoSlideTimer)
  }
  ybAutoSlideTimer = setInterval(() => {
    ybCurrentPage.value = ybCurrentPage.value === 0 ? 1 : 0
  }, 5000)
}

const feedsLoading = ref(true)
const yogurtBomLoading = ref(true)
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
    console.log('📦 [DASHBOARD] 제품 조회 시작')
    const response = await productService.getProducts({}, { size: 5, sort: 'viewCount,DESC' })
    console.log('📦 [DASHBOARD] 제품 응답:', response)
    if (response.success) {
      hotProducts.value = response.data?.content || response.data || []
      console.log('📦 [DASHBOARD] 제품 로드 완료:', hotProducts.value.length, '개')
    } else {
      console.warn('📦 [DASHBOARD] 제품 응답 실패:', response)
    }
  } catch (error) {
    console.error('📦 [DASHBOARD] 제품 로드 실패:', error)
  } finally {
    productsLoading.value = false
  }
}

const loadYogurtBomFeeds = async (forceRefresh = false) => {
  // 캐시가 유효하면 캐시 데이터 사용
  const now = Date.now()
  if (!forceRefresh && yogurtBomCache.data && (now - yogurtBomCache.timestamp < CACHE_DURATION)) {
    yogurtBomFeeds.value = yogurtBomCache.data
    lastUpdateTime.value = yogurtBomCache.updateTime
    yogurtBomLoading.value = false
    return
  }

  yogurtBomLoading.value = true
  try {
    const response = await feedService.getHotFeeds({ size: 12, sort: 'viewCount,desc' })
    if (response.success) {
      const feeds = response.data?.content || response.data || []
      yogurtBomFeeds.value = feeds

      // 업데이트 시간 설정 (YYYY.MM.DD (요일) HH:00) - 매시간 정각
      const date = new Date()
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const dayNames = ['일', '월', '화', '수', '목', '금', '토']
      const dayName = dayNames[date.getDay()]
      const hours = date.getHours().toString().padStart(2, '0')
      const updateTimeStr = `${year}.${month}.${day} (${dayName}) ${hours}:00`
      lastUpdateTime.value = updateTimeStr

      // 캐시 저장
      yogurtBomCache = {
        data: feeds,
        timestamp: now,
        updateTime: updateTimeStr
      }
    }
  } catch (error) {
    console.error('요거 봄 피드 로드 실패:', error)
  } finally {
    yogurtBomLoading.value = false
  }
}

const isNewFeed = (feed) => {
  if (!feed.createdAt) return false
  let createdAt
  if (Array.isArray(feed.createdAt)) {
    // LocalDateTime 배열 형식: [year, month, day, hour, minute, second]
    const [y, m, d, h = 0, min = 0, s = 0] = feed.createdAt
    createdAt = new Date(y, m - 1, d, h, min, s)
  } else {
    // "2026-02-08 14:00:33" 또는 "2026-02-08T14:00:33" 형식
    const dateStr = feed.createdAt.replace(' ', 'T')
    createdAt = new Date(dateStr)
  }
  if (isNaN(createdAt.getTime())) return false
  // KST 기준 현재시간으로부터 24시간 이내면 NEW
  const now = new Date()
  const diffHours = (now - createdAt) / (1000 * 60 * 60)
  return diffHours < 24
}

const isHotFeed = (feed) => {
  return hotFeeds.value.some(hotFeed => hotFeed.feedId === feed.feedId)
}

let refreshTimer = null

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

const getProductThumbnail = (product) => {
  return product.thumbnailUrl || product.thumbnailDto?.fileUrl || 'https://placehold.co/56x56?text=No+Image'
}

const getProductScorePercent = (product, index) => {
  if (index === 0) return 100
  const firstScore = getProductPopularityScore(hotProducts.value[0])
  const score = getProductPopularityScore(product)
  if (!firstScore) return 0
  return Math.round((score / firstScore) * 100)
}

const getProductPopularityScore = (product) => {
  if (!product) return 0
  if (product.popularityScore) return product.popularityScore
  return (product.viewCount || 0) + ((product.likeCount || 0) * 3) + ((product.reviewCount || 0) * 2)
}

const topTrendName = computed(() => {
  if (hotFeeds.value.length > 0) return hotFeeds.value[0].productName || '인기 피드'
  if (hotProducts.value.length > 0) return hotProducts.value[0].name || '인기 제품'
  return '트렌드'
})

const goToTopTrend = () => {
  if (hotFeeds.value.length > 0) {
    router.push({ name: 'FeedDetail', params: { id: hotFeeds.value[0].feedId } })
  } else {
    router.push({ name: 'FeedHome' })
  }
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
  loadYogurtBomFeeds()

  // 요거 봄 자동 슬라이드 시작
  resetYbAutoSlide()

  refreshTimer = setInterval(() => {
    loadYogurtBomFeeds()
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  if (ybAutoSlideTimer) {
    clearInterval(ybAutoSlideTimer)
    ybAutoSlideTimer = null
  }
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
  padding: 1.25rem 0 0.75rem;
}

@media (min-width: 768px) {
  .page-header {
    padding: 1.5rem 0 0.875rem;
  }
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
}

@media (min-width: 1280px) {
  .page-title {
    font-size: 1.75rem;
  }
}

.page-description {
  font-size: 0.8125rem;
  color: #a78bfa;
  margin: 0;
}

@media (min-width: 768px) {
  .page-description {
    font-size: 0.875rem;
  }
}

@media (min-width: 1280px) {
  .page-description {
    font-size: 0.9375rem;
  }
}

/* 글래스 배너 */
.glass-banner {
  position: relative;
  margin-bottom: 0.75rem;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.glass-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(147, 51, 234, 0.08);
}

.glass-banner:active {
  transform: scale(0.985);
}

.banner-glow {
  display: none;
}

.banner-inner {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #f0f0f0;
  transition: border-color 0.2s;
}

.glass-banner:hover .banner-inner {
  border-color: #e9d5ff;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.banner-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: 8px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  border: 1px solid rgba(220, 38, 38, 0.12);
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
  animation: dot-blink 1.5s ease-in-out infinite;
}

@keyframes dot-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.banner-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
  min-width: 0;
}

.banner-title {
  font-size: 0.9375rem;
  color: #1c1917;
  margin: 0;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-title strong {
  font-weight: 700;
  color: #1c1917;
}

.banner-sub {
  font-size: 0.75rem;
  color: #a8a29e;
  margin: 0;
  font-weight: 400;
}

.banner-action {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a3a3a3;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.glass-banner:hover .banner-action {
  background: #f3e8ff;
  color: #9333ea;
}

/* 통계 그리드 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .stats-grid {
    gap: 0.75rem;
    margin-bottom: 1.25rem;
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
  border-color: #e9d5ff;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.08);
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
  color: #7c3aed;
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: 0.8125rem;
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

@media (min-width: 1280px) {
  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
  }
}

.stat-arrow {
  color: #d4d4d8;
  flex-shrink: 0;
  transition: color 0.15s;
}

.stat-card:hover .stat-arrow {
  color: #9333ea;
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

/* ===== 실시간 요거 봄 섹션 ===== */
.yogurt-bom-section {
  display: flex;
  gap: 1rem;
  background: #fff;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.625rem;
  border: 1px solid #f0f0f0;
}

@media (min-width: 768px) {
  .yogurt-bom-section {
    padding: 1.25rem 1.5rem;
    margin-bottom: 0.75rem;
  }
}

.yb-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.yb-title-box {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #9333ea;
  padding: 0.625rem 1.125rem;
  border-radius: 50px;
}

.yb-icon {
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.yb-main-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .yb-main-title {
    font-size: 1rem;
  }
}

.yb-update-time {
  font-size: 0.6875rem;
  color: #9ca3af;
  padding-left: 0.25rem;
}

.yb-right {
  flex: 1;
  min-width: 0;
}

.yb-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 0.375rem 1.5rem;
}

@media (min-width: 768px) {
  .yb-list {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 0.5rem 2rem;
  }
}

.yb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 6px;
}

.yb-item:hover {
  background: #faf5ff;
  padding-left: 0.375rem;
  margin-left: -0.375rem;
}

.yb-rank-num {
  font-size: 0.875rem;
  font-weight: 700;
  color: #9333ea;
  min-width: 16px;
}

.yb-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.yb-product {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.yb-author-name {
  font-size: 0.6875rem;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.yb-tag {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  flex-shrink: 0;
}

.yb-tag.hot {
  background: #fef2f2;
  color: #ef4444;
}

.yb-tag.new {
  background: #eff6ff;
  color: #3b82f6;
}

/* 요거 봄 스켈레톤 */
.yb-item.skeleton-item {
  background: transparent;
}

.yb-sk-rank {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.yb-sk-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.yb-sk-line {
  height: 14px;
  border-radius: 4px;
  width: 60%;
}

.yb-sk-line.short {
  width: 30%;
  height: 12px;
}

/* 요거 봄 페이지네이션 */
.yb-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
  padding-left: 0.75rem;
}

.yb-page-btn {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #e5e7eb;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.yb-page-btn:hover {
  background: #c4b5fd;
}

.yb-page-btn.active {
  background: #9333ea;
  width: 20px;
  border-radius: 10px;
}

/* 요거 봄 빈 상태 */
.empty-state.compact {
  padding: 1.5rem 1rem;
  background: #fafafa;
  border-radius: 10px;
}

/* 대시보드 콘텐츠 */
.dashboard-content {
  max-width: 1200px;
}

/* 섹션 */
.content-section {
  background: #fff;
  border-radius: 14px;
  padding: 1rem;
  margin-bottom: 0.625rem;
  border: 1px solid #f0f0f0;
}

@media (min-width: 768px) {
  .content-section {
    padding: 1.25rem;
    margin-bottom: 0.75rem;
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
  margin-bottom: 0.75rem;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid #9333ea;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 1.125rem;
  }
}

@media (min-width: 1280px) {
  .section-title {
    font-size: 1.3125rem;
  }
}

.sub-title {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 100px;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.view-all-btn:hover {
  background: #faf5ff;
  color: #9333ea;
}

@media (min-width: 1280px) {
  .view-all-btn {
    font-size: 0.875rem;
  }

  .view-all-link {
    font-size: 0.875rem;
  }

  .sub-title {
    font-size: 13px;
  }
}

/* 핫 피드 섹션 */
.hot-feeds-section {
  margin-bottom: 0.75rem !important;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.view-all-link:hover {
  background: #faf5ff;
  color: #9333ea;
}

/* 가로 스크롤 영역 */
.dashboard-feed-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 6px 4px 14px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dashboard-feed-scroll::-webkit-scrollbar {
  display: none;
}

/* 카드 디자인 */
.dash-feed-card {
  flex: 0 0 160px;
  height: 230px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
}

@media (min-width: 640px) {
  .dash-feed-card {
    flex: 0 0 180px;
    height: 250px;
  }
}

@media (min-width: 1280px) {
  .dash-feed-card {
    flex: 0 0 200px;
    height: 280px;
  }
}

.dash-feed-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 30px rgba(124, 58, 237, 0.15);
}

.card-visual-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.card-visual-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.dash-feed-card:hover .card-visual-wrapper img {
  transform: scale(1.05);
}

/* 럭셔리 그라데이션 오버레이 */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.3) 0%,
    transparent 40%,
    rgba(0,0,0,0.85) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px;
}

@media (min-width: 640px) {
  .card-overlay {
    padding: 16px;
  }
}

.overlay-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.rank-num {
  font-size: 24px;
  font-weight: 900;
  color: rgba(255,255,255,0.35);
  font-style: italic;
  line-height: 1;
}

@media (min-width: 640px) {
  .rank-num {
    font-size: 26px;
  }
}

@media (min-width: 1280px) {
  .rank-num {
    font-size: 30px;
  }
}

.trending-tag {
  background: rgba(251, 113, 133, 0.85);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 0.3px;
}

.overlay-bottom {
  color: #fff;
}

.eval-pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
  backdrop-filter: blur(4px);
}

.eval-pill.best {
  background: rgba(251, 191, 36, 0.85);
  color: #fff;
}

.eval-pill.good {
  background: rgba(34, 197, 94, 0.8);
  color: #fff;
}

.eval-pill.okay {
  background: rgba(139, 92, 246, 0.8);
  color: #fff;
}

.eval-pill.bad {
  background: rgba(239, 68, 68, 0.8);
  color: #fff;
}

.review-main {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 640px) {
  .review-main {
    font-size: 15px;
  }
}

@media (min-width: 1280px) {
  .review-main {
    font-size: 16px;
  }
}

.product-name-sub {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 스켈레톤 */
.dash-card-skeleton {
  flex: 0 0 160px;
  height: 230px;
  border-radius: 20px;
}

@media (min-width: 640px) {
  .dash-card-skeleton {
    flex: 0 0 180px;
    height: 250px;
  }
}

@media (min-width: 1280px) {
  .dash-card-skeleton {
    flex: 0 0 200px;
    height: 280px;
  }
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
  position: relative;
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

/* 평가 뱃지 - 파스텔 스타일 */
.eval-badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.eval-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.eval-badge.best { background-color: #fef3c7; color: #92400e; }
.eval-badge.best .eval-dot { background-color: #f59e0b; }

.eval-badge.good { background-color: #dcfce7; color: #166534; }
.eval-badge.good .eval-dot { background-color: #10b981; }

.eval-badge.okay { background-color: #f3e8ff; color: #6b21a8; }
.eval-badge.okay .eval-dot { background-color: #9333ea; }

.eval-badge.bad { background-color: #fee2e2; color: #991b1b; }
.eval-badge.bad .eval-dot { background-color: #ef4444; }

/* 카드 바디 */
.feed-card-body {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 리뷰 요약 */
.review-summary {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
}

/* 제품 정보 행 */
.product-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #f8f8fa;
  border-radius: 8px;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.category-tag {
  display: inline-block;
  font-size: 9px;
  font-weight: 800;
  color: #9333ea;
  text-transform: uppercase;
  margin-bottom: 1px;
}

.product-name {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  font-size: 12px;
  font-weight: 800;
  color: #9333ea;
  white-space: nowrap;
}

/* 하단 푸터 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-name {
  font-size: 10px;
  font-weight: 500;
  color: #999;
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 600;
  color: #b0b0b0;
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

/* 제품 랭킹 섹션 커스텀 스타일 */
.ranking-section {
  background: linear-gradient(to bottom, #ffffff, #faf8ff);
}


.product-rank-container {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

/* 1위 히어로 카드 디자인 */
.rank-hero-card {
  position: relative;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.rank-hero-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
}

@media (min-width: 1280px) {
  .rank-hero-card {
    height: 260px;
  }
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.rank-hero-card:hover .hero-image {
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  display: flex;
  align-items: flex-end;
  padding: 1.25rem;
}

.hero-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);
  z-index: 2;
}

.hero-info {
  color: white;
  width: 100%;
}

.hero-brand {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
}

.hero-name {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 2px 0 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 1280px) {
  .hero-brand {
    font-size: 13px;
  }

  .hero-name {
    font-size: 1.375rem;
  }
}

.hero-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-score {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  padding: 4px 10px;
  border-radius: 20px;
}

.score-dot {
  width: 6px;
  height: 6px;
  background: #c084fc;
  border-radius: 50%;
  box-shadow: 0 0 8px #c084fc;
  animation: pulse-dot 2s ease-in-out infinite;
}

.hero-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #facc15;
}

/* 2-5위 리스트 디자인 */
.rank-sub-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rank-sub-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.2s ease;
  cursor: pointer;
}

.rank-sub-item:hover {
  background: #faf5ff;
  transform: translateX(4px);
}

.sub-rank-number {
  font-size: 15px;
  font-weight: 800;
  color: #6b7280;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.rank-sub-item:nth-child(1) .sub-rank-number {
  color: #9ca3af;
}

.rank-sub-item:nth-child(2) .sub-rank-number {
  color: #d97706;
}

.sub-image {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #e5e7eb;
}

.sub-info {
  flex: 1;
  min-width: 0;
}

.sub-brand {
  font-size: 11px;
  color: #9ca3af;
  display: block;
  margin-bottom: 1px;
}

.sub-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.sub-reviews {
  font-size: 11px;
  color: #9ca3af;
}

.sub-score {
  flex-shrink: 0;
}

.sub-score-value {
  font-size: 13px;
  font-weight: 700;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 3px 8px;
  border-radius: 12px;
}

.sub-arrow {
  color: #d1d5db;
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}

.rank-sub-item:hover .sub-arrow {
  color: #7c3aed;
  transform: translateX(2px);
}

@media (min-width: 1280px) {
  .sub-rank-number {
    font-size: 16px;
  }

  .sub-brand {
    font-size: 12px;
  }

  .sub-name {
    font-size: 15px;
  }

  .sub-rating {
    font-size: 13px;
  }

  .sub-reviews {
    font-size: 12px;
  }

  .sub-score-value {
    font-size: 14px;
  }

  .sub-image {
    width: 56px;
    height: 56px;
  }
}

/* 히어로 스켈레톤 */
.hero-skeleton {
  height: 200px;
  border-radius: 16px;
}

/* 글래스 배너 모바일 대응 */
@media (max-width: 640px) {
  .banner-inner {
    padding: 0.875rem 1rem;
  }

  .banner-title {
    font-size: 0.875rem;
  }
}

@media (min-width: 1280px) {
  .banner-title {
    font-size: 1.0625rem;
  }

  .banner-sub {
    font-size: 0.8125rem;
  }

  .banner-tag {
    font-size: 0.75rem;
  }
}

/* 모바일 대응 */
@media (max-width: 640px) {
  .rank-hero-card {
    height: 180px;
  }

  .hero-name {
    font-size: 1rem;
  }

  .rank-sub-item {
    padding: 8px 10px;
    gap: 10px;
  }

  .sub-image {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }

  .sub-name {
    font-size: 12px;
  }

  .sub-score {
    display: none;
  }

  .sub-arrow {
    display: none;
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
  font-size: 0.875rem;
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

/* ===== 모바일 컴팩트 레이아웃 ===== */
@media (max-width: 767px) {
  /* 실시간 요거 봄 모바일 */
  .yogurt-bom-section {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 12px;
  }

  .yb-left {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .yb-title-box {
    padding: 0.375rem 0.875rem;
    border-radius: 50px;
  }

  .yb-icon {
    width: 14px;
    height: 14px;
  }

  .yb-main-title {
    font-size: 0.8125rem;
  }

  .yb-pagination {
    position: absolute;
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    padding-left: 0;
  }

  .yogurt-bom-section {
    position: relative;
    padding-bottom: 2rem;
  }

  .yb-update-time {
    font-size: 0.625rem;
    padding-left: 0;
  }

  .yb-list {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, auto);
    grid-auto-flow: column;
    gap: 0.25rem 1rem;
  }

  .yb-item {
    padding: 0.25rem 0;
    gap: 0.375rem;
  }

  .yb-rank-num {
    font-size: 0.75rem;
    min-width: 14px;
  }

  .yb-product {
    font-size: 0.75rem;
    max-width: 80px;
  }

  .yb-author-name {
    font-size: 0.625rem;
  }

  .yb-tag {
    font-size: 0.5625rem;
    padding: 0.0625rem 0.25rem;
  }

  .yb-sk-rank {
    width: 14px;
    height: 14px;
  }

  .yb-sk-line {
    height: 12px;
  }

  .yb-sk-line.short {
    height: 10px;
  }

  /* 페이지 헤더 축소 */
  .page-header {
    padding: 0.75rem 0 0.5rem;
  }

  .page-title {
    font-size: 1.1rem;
    margin-bottom: 0.125rem;
  }

  .page-description {
    font-size: 0.75rem;
  }

  /* 글래스 배너 컴팩트 */
  .glass-banner {
    margin-bottom: 0.5rem;
    border-radius: 14px;
  }

  .banner-inner {
    padding: 0.625rem 0.875rem;
    border-radius: 14px;
  }

  .banner-tag {
    padding: 0.25rem 0.5rem;
    font-size: 0.625rem;
    border-radius: 6px;
  }

  .tag-dot {
    width: 5px;
    height: 5px;
  }

  .banner-text-group {
    gap: 0.125rem;
  }

  .banner-title {
    font-size: 0.8125rem;
  }

  .banner-sub {
    font-size: 0.6875rem;
  }

  .banner-action {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }

  .banner-action svg {
    width: 14px;
    height: 14px;
  }

  /* 통계 카드 컴팩트 */
  .stats-grid {
    gap: 0.375rem;
    margin-bottom: 0.625rem;
  }

  .stat-card {
    padding: 0.625rem 0.5rem;
    border-radius: 10px;
    gap: 0.5rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .stat-icon svg {
    width: 16px;
    height: 16px;
  }

  .stat-value {
    font-size: 1rem;
  }

  .stat-label {
    font-size: 0.625rem;
  }

  .stat-arrow {
    display: none;
  }

  .live-dot {
    top: 0.5rem;
    right: 0.5rem;
    width: 6px;
    height: 6px;
  }

  /* 섹션 컴팩트 */
  .content-section {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 12px;
  }

  .hot-feeds-section {
    margin-bottom: 0.5rem !important;
  }

  .section-header {
    margin-bottom: 0.5rem;
  }

  .section-title {
    font-size: 0.875rem;
    padding-left: 8px;
    border-left-width: 2.5px;
  }

  .sub-title {
    font-size: 10px;
    padding: 2px 6px;
  }

  .view-all-link,
  .view-all-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.375rem;
  }

  /* 핫 피드 카드 컴팩트 */
  .dashboard-feed-scroll {
    gap: 10px;
    padding: 4px 2px 10px 0;
  }

  .dash-feed-card {
    flex: 0 0 140px;
    height: 200px;
    border-radius: 18px;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  }

  .dash-card-skeleton {
    flex: 0 0 140px;
    height: 200px;
    border-radius: 18px;
  }

  .card-overlay {
    padding: 10px;
  }

  .rank-num {
    font-size: 18px;
  }

  .trending-tag {
    font-size: 8px;
    padding: 3px 7px;
  }

  .eval-pill {
    font-size: 8px;
    padding: 2px 6px;
    margin-bottom: 4px;
  }

  .review-main {
    font-size: 11px;
    margin-bottom: 3px;
    -webkit-line-clamp: 1;
  }

  .product-name-sub {
    font-size: 10px;
  }

  /* 배틀 그리드 컴팩트 */
  .battle-grid {
    gap: 0.5rem;
  }

  /* 제품 랭킹 컴팩트 */

  .product-rank-container {
    gap: 0.5rem;
  }

  .rank-hero-card {
    height: 150px;
    border-radius: 14px;
  }

  .hero-badge {
    top: 0.75rem;
    left: 0.75rem;
    font-size: 11px;
    padding: 3px 8px;
  }

  .hero-overlay {
    padding: 0.875rem;
  }

  .hero-brand {
    font-size: 10px;
  }

  .hero-name {
    font-size: 0.875rem;
    margin: 1px 0 5px;
  }

  .trend-score {
    font-size: 11px;
    padding: 3px 8px;
  }

  .hero-rating {
    font-size: 11px;
  }

  .rank-sub-list {
    gap: 0.375rem;
  }

  .rank-sub-item {
    padding: 6px 8px;
    gap: 8px;
    border-radius: 10px;
  }

  .sub-rank-number {
    font-size: 13px;
    width: 20px;
  }

  .sub-image {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .sub-brand {
    font-size: 9px;
  }

  .sub-name {
    font-size: 11px;
    margin-bottom: 2px;
  }

  .sub-rating {
    font-size: 10px;
  }

  .sub-reviews {
    font-size: 9px;
  }

  /* 빈 상태 컴팩트 */
  .empty-state {
    padding: 1.5rem 0.75rem;
  }

  .empty-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 0.5rem;
  }

  .empty-text {
    font-size: 0.8125rem;
  }
}
</style>
