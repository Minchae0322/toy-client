<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <AppHeader />

      <div class="ranking-view">
        <!-- 페이지 헤더 -->
        <header class="page-header">
          <div class="header-title">
            <span class="header-label">WEEKLY CHART</span>
            <h1>HOT 100</h1>
          </div>
          <p class="header-desc">이번 주 가장 인기 있는 제품들을 확인해보세요</p>
        </header>

        <!-- 카테고리 필터 (Design 2 적용) -->
        <CommonCategoryFilter
            :categories="categories"
            :show-view-toggle="false"
            :initial-category-id="selectedCategoryId"
            @category-change="handleCategoryChange"
        />

        <!-- 로딩 -->
        <div v-if="loading && !products.length" class="loading-state">
          <div class="spinner"></div>
          <p>랭킹을 불러오는 중...</p>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="!products.length" class="empty-state">
          <p>등록된 제품이 없습니다</p>
        </div>

        <template v-else>
          <!-- Top 3 섹션 -->
          <section class="top-section">
            <!-- 1위 -->
            <div v-if="hero" class="hero-card" @click="goToDetail(hero)">
              <div class="hero-rank">
                <span class="rank-number">1</span>
                <RankChange :change="hero.rankChange" :isNew="hero.isNew" />
              </div>
              <div class="hero-image-wrap">
                <img :src="getThumbnailUrl(hero)" :alt="hero.name" class="hero-image" />
              </div>
              <div class="hero-info">
                <span class="brand">{{ hero.brand }}</span>
                <h2 class="name">{{ hero.name }}</h2>
                <div class="stats">
                  <span class="stat">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="#fbbf24">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {{ formatRating(hero.averageRating) }}
                    <span class="stat-sub">({{ hero.reviewCount || 0 }})</span>
                  </span>
                  <span class="stat hot">
                    🔥 {{ formatScore(getPopularityScore(hero)) }}
                  </span>
                </div>
              </div>
              <div class="hero-score">
                <div class="score-bar">
                  <div class="score-fill" style="width: 100%"></div>
                </div>
                <span class="score-label">최고 점수</span>
              </div>
            </div>

            <!-- 2, 3위 -->
            <div class="runner-grid">
              <div
                  v-for="(product, index) in runnerUps"
                  :key="product.id"
                  class="runner-card"
                  @click="goToDetail(product)"
              >
                <div class="runner-rank">
                  <span class="rank-number">{{ index + 2 }}</span>
                  <RankChange :change="product.rankChange" :isNew="product.isNew" />
                </div>
                <img :src="getThumbnailUrl(product)" :alt="product.name" class="runner-image" />
                <div class="runner-info">
                  <span class="brand">{{ product.brand }}</span>
                  <h3 class="name">{{ product.name }}</h3>
                  <div class="stats">
                    <span class="stat">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="#fbbf24">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      {{ formatRating(product.averageRating) }}
                    </span>
                    <span class="stat hot">🔥 {{ formatScore(getPopularityScore(product)) }}</span>
                  </div>
                </div>
                <div class="runner-score">
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: getScorePercent(getPopularityScore(product)) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 4위 이하 리스트 -->
          <section class="chart-section">
            <div class="chart-list">
              <div
                  v-for="(product, index) in restList"
                  :key="product.id"
                  class="chart-item"
                  @click="goToDetail(product)"
              >
                <div class="chart-rank">
                  <span class="rank-number">{{ index + 4 }}</span>
                  <RankChange :change="product.rankChange" :isNew="product.isNew" />
                </div>
                <img :src="getThumbnailUrl(product)" :alt="product.name" class="chart-image" />
                <div class="chart-info">
                  <h3 class="name">{{ product.name }}</h3>
                  <span class="brand">{{ product.brand }}</span>
                </div>
                <div class="chart-stats">
                  <span class="stat">
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="#fbbf24">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {{ formatRating(product.averageRating) }}
                  </span>
                  <span class="stat hot">🔥 {{ formatScore(getPopularityScore(product)) }}</span>
                </div>
                <div class="chart-bar">
                  <div class="score-bar small">
                    <div class="score-fill" :style="{ width: getScorePercent(getPopularityScore(product)) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 더보기 -->
          <div v-if="hasNext" class="load-more">
            <button class="load-more-btn" :disabled="loading" @click="loadMore">
              <template v-if="loading">불러오는 중...</template>
              <template v-else>더 보기</template>
            </button>
          </div>
        </template>
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import AppHeader from '@/components/feed/AppHeader.vue'
import RankChange from '@/components/product/RankChange.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import CommonCategoryFilter from '@/components/category/CommonCategoryFilter.vue';
import { productService } from '@/services/ProductService.js'
import { categoryService } from '@/services/CategoryService.js'

const router = useRouter()
const route = useRoute()

const DEFAULT_THUMBNAIL = 'https://picsum.photos/200'

// 상태
const categories = ref([])
const selectedCategoryId = ref(null)
const products = ref([])
const loading = ref(false)
const hasNext = ref(true)
const currentPage = ref(0)
const pageSize = 10
const totalElements = ref(0)

// 인기도 점수 계산 (API에서 제공하지 않을 경우 대비)
const getPopularityScore = (product) => {
  if (!product) return 0
  if (product.popularityScore !== undefined && product.popularityScore !== null) {
    return product.popularityScore
  }
  // fallback: viewCount + likeCount*3 + shareCount*5 + reviewCount*2
  const viewCount = product.viewCount || 0
  const likeCount = product.likeCount || 0
  const shareCount = product.shareCount || 0
  const reviewCount = product.reviewCount || 0
  return viewCount + (likeCount * 3) + (shareCount * 5) + (reviewCount * 2)
}

// Computed
const hero = computed(() => products.value[0] || null)
const runnerUps = computed(() => products.value.slice(1, 3))
const restList = computed(() => products.value.slice(3))
const maxScore = computed(() => getPopularityScore(hero.value) || 1)

// 유틸리티 함수
const getThumbnailUrl = (product) => {
  return product.thumbnailDto?.fileUrl || product.thumbnailDto?.filePath || DEFAULT_THUMBNAIL
}

const formatScore = (score) => {
  if (!score) return '0'
  if (score >= 10000) return (score / 10000).toFixed(1) + '만'
  if (score >= 1000) return (score / 1000).toFixed(1) + 'k'
  return score.toLocaleString()
}

const formatRating = (rating) => {
  if (!rating) return '0.0'
  return typeof rating === 'number' ? rating.toFixed(1) : rating
}

const getScorePercent = (score) => {
  if (!score || !maxScore.value) return 0
  return Math.round((score / maxScore.value) * 100)
}

const goToDetail = (product) => {
  router.push({ name: 'ProductDetail', params: { id: product.id } })
}

// 카테고리 변경 핸들러
const handleCategoryChange = ({ categoryId }) => {
  console.log('🔄 [RANKING] 카테고리 변경:', categoryId)
  selectedCategoryId.value = categoryId
  fetchRanking(true)
}

// API 호출
const fetchRanking = async (reset = false) => {
  if (loading.value) return
  loading.value = true

  try {
    if (reset) {
      products.value = []
      currentPage.value = 0
      hasNext.value = true
    }

    const searchCondition = {
      status: 'APPROVED'
    }

    if (selectedCategoryId.value) {
      searchCondition.categoryId = selectedCategoryId.value
    }

    const pageable = {
      page: currentPage.value,
      size: pageSize,
      sort: 'popularityScore,DESC'
    }

    console.log('📤 [RANKING] API 요청:', { searchCondition, pageable })

    const response = await productService.getProducts(searchCondition, pageable)

    console.log('📥 [RANKING] API 응답:', response)

    if (response.success && response.data) {
      const pageData = response.data

      if (pageData.content) {
        if (reset) {
          products.value = pageData.content
        } else {
          products.value = [...products.value, ...pageData.content]
        }

        hasNext.value = !pageData.last
        totalElements.value = pageData.totalElements || 0

        console.log('✅ [RANKING] 로드 완료:', {
          loaded: products.value.length,
          total: totalElements.value,
          hasNext: hasNext.value
        })
      } else if (Array.isArray(pageData)) {
        products.value = reset ? pageData : [...products.value, ...pageData]
        hasNext.value = pageData.length >= pageSize
      }
    } else {
      console.error('❌ [RANKING] API 오류:', response.message)
      hasNext.value = false
    }
  } catch (e) {
    console.error('❌ [RANKING] 랭킹 로드 실패:', e)
    hasNext.value = false
  } finally {
    loading.value = false
  }
}

// 카테고리 조회
const fetchCategories = async () => {
  try {
    console.log('📤 [RANKING] 카테고리 API 호출 중...')
    const response = await categoryService.getCategories({isActive: true})

    console.log('📥 [RANKING] 카테고리 API 응답:', response)

    if (response.success && response.data) {
      // 계층 구조 그대로 유지 (children 포함)
      categories.value = Array.isArray(response.data) ? response.data : []
      console.log('✅ [RANKING] 카테고리 로드 완료:', categories.value)
    }
  } catch (e) {
    console.error('❌ [RANKING] 카테고리 로드 실패:', e)
  }
}

const loadMore = () => {
  currentPage.value++
  fetchRanking(false)
}

// URL 쿼리 파라미터 감시
watch(() => route.query, (query) => {
  if (query.categoryId) {
    selectedCategoryId.value = Number(query.categoryId)
  }
}, {immediate: true})

// 마운트 시 데이터 로드
onMounted(async () => {
  await fetchCategories()
  fetchRanking(true)
})
</script>

<style scoped>
/* 기존 스타일 유지 - 변경 없음 */
* {
  box-sizing: border-box;
}

.app-container {
  background: #fff;
  min-height: 100vh;
  color: #222;
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
  padding-bottom: 80px;
  padding-left: 1.5rem;
}

@media (max-width: 767px) {
  .main-content {
    padding-left: 0;
  }
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 0;
  }
}

.ranking-view {
  max-width: 900px;
  margin: 0 auto;
}

/* 페이지 헤더 */
.page-header {
  padding: 32px 24px 24px;
}

.header-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #7c3aed;
  display: block;
  margin-bottom: 4px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.header-desc {
  font-size: 14px;
  color: #999;
  margin: 8px 0 0;
}

/* 로딩 & 빈 상태 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #999;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #eee;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Top 섹션 */
.top-section {
  padding: 24px;
}

/* 1위 히어로 카드 */
.hero-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.hero-card:hover {
  border-color: #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.hero-rank {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.hero-rank .rank-number {
  font-size: 40px;
  font-weight: 800;
  color: #7c3aed;
  line-height: 1;
}

.hero-image-wrap {
  flex-shrink: 0;
}

.hero-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-info .brand {
  font-size: 13px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.hero-info .name {
  font-size: 20px;
  font-weight: 600;
  color: #111;
  margin: 0 0 12px;
}

.hero-score {
  width: 100px;
  text-align: right;
}

.score-bar {
  height: 6px;
  background: #f5f5f5;
  border-radius: 3px;
  overflow: hidden;
}

.score-bar.small {
  height: 4px;
}

.score-fill {
  height: 100%;
  background: #7c3aed;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.score-label {
  font-size: 11px;
  color: #999;
  margin-top: 6px;
  display: block;
}

/* 2, 3위 */
.runner-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.runner-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.runner-card:hover {
  border-color: #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.runner-rank {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.runner-rank .rank-number {
  font-size: 28px;
  font-weight: 800;
  color: #ddd;
  line-height: 1;
}

.runner-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 12px;
}

.runner-info {
  flex: 1;
}

.runner-info .brand {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 2px;
}

.runner-info .name {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.runner-score {
  margin-top: 12px;
}

/* 공통 통계 */
.stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.stat-sub {
  color: #999;
  font-weight: 400;
}

.stat.hot {
  color: #7c3aed;
}

/* 차트 리스트 */
.chart-section {
  padding: 0 24px 24px;
}

.chart-list {
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s;
}

.chart-item:last-child {
  border-bottom: none;
}

.chart-item:hover {
  background: #fafafa;
}

.chart-rank {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 70px;
}

.chart-rank .rank-number {
  font-size: 16px;
  font-weight: 700;
  color: #999;
  width: 24px;
  text-align: center;
}

.chart-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.chart-info {
  flex: 1;
  min-width: 0;
}

.chart-info .name {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-info .brand {
  font-size: 12px;
  color: #999;
}

.chart-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-bar {
  width: 80px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px 16px;
  }

  .top-section {
    padding: 16px;
  }

  .chart-section {
    padding: 0 16px 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .hero-card {
    flex-wrap: wrap;
    gap: 16px;
  }

  .hero-image {
    width: 80px;
    height: 80px;
  }

  .hero-score {
    width: 100%;
  }

  .runner-grid {
    grid-template-columns: 1fr;
  }

  .chart-stats, .chart-bar {
    display: none;
  }
}

/* 더보기 */
.load-more {
  text-align: center;
  padding: 8px 24px 32px;
}

.load-more-btn {
  padding: 12px 32px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}

.load-more-btn:hover:not(:disabled) {
  border-color: #ddd;
  color: #333;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>