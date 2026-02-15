<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 카테고리 필터 (최상단) -->
      <CommonCategoryFilter
          :categories="categories"
          :show-view-toggle="false"
          :initial-category-id="selectedCategoryId"
          @category-change="handleCategoryChange"
      />

      <div class="ranking-view">
        <!-- 페이지 헤더 -->
        <header class="page-header">
          <div class="header-title">
            <span class="header-label">WEEKLY CHART</span>
            <h1>HOT 100</h1>
          </div>
          <p class="header-desc">이번 주 가장 인기 있는 아이템들을 확인해보세요</p>
        </header>

        <!-- 검색 -->
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
              v-model="searchKeyword"
              type="text"
              class="search-input"
              placeholder="아이템 이름 또는 브랜드로 검색"
          />
          <button v-if="searchKeyword" class="search-clear" @click="searchKeyword = ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 로딩 -->
        <div v-if="loading && !products.length" class="loading-state">
          <div class="spinner"></div>
          <p>랭킹을 불러오는 중...</p>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="!filteredProducts.length" class="empty-state">
          <p v-if="searchKeyword">검색 결과가 없습니다</p>
          <p v-else>등록된 아이템이 없습니다</p>
        </div>

        <template v-else>
          <!-- Top 3 섹션 -->
          <section class="top-section">
            <div class="top-grid">
              <!-- 1위 카드 -->
              <div v-if="hero" class="hero-card" @click="goToDetail(hero)">
                <div class="rank-badge gold">
                  <span>1</span>
                </div>
                <div class="hero-image-wrap">
                  <img :src="getThumbnailUrl(hero)" :alt="hero.name" class="hero-image" />
                </div>
                <div class="hero-info">
                  <span class="brand">{{ hero.brand }}</span>
                  <h2 class="name">{{ hero.name }}</h2>
                  <div class="meta-row">
                    <div class="rating">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="#FBBF24">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="rating-value">{{ formatRating(hero.averageRating) }}</span>
                      <span class="review-count">리뷰 {{ formatCount(hero.reviewCount) }}</span>
                    </div>
                    <RankChange :change="hero.rankChange" :isNew="hero.isNew" />
                  </div>
                  <div class="popularity-section">
                    <div class="popularity-header">
                      <span class="popularity-label">이번 주 관심도</span>
                      <span class="popularity-value">{{ getScorePercent(getPopularityScore(hero)) }}%</span>
                    </div>
                    <div class="popularity-bar">
                      <div class="popularity-fill" style="width: 100%"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2, 3위 카드 -->
              <div
                  v-for="(product, index) in runnerUps"
                  :key="product.id"
                  class="runner-card"
                  @click="goToDetail(product)"
              >
                <div class="rank-badge" :class="index === 0 ? 'silver' : 'bronze'">
                  <span>{{ index + 2 }}</span>
                </div>
                <div class="runner-image-wrap">
                  <img :src="getThumbnailUrl(product)" :alt="product.name" class="runner-image" />
                </div>
                <div class="runner-info">
                  <span class="brand">{{ product.brand }}</span>
                  <h3 class="name">{{ product.name }}</h3>
                  <div class="meta-row">
                    <div class="rating">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="#FBBF24">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="rating-value">{{ formatRating(product.averageRating) }}</span>
                      <span class="review-count">{{ formatCount(product.reviewCount) }}</span>
                    </div>
                    <RankChange :change="product.rankChange" :isNew="product.isNew" />
                  </div>
                  <div class="popularity-section">
                    <div class="popularity-header">
                      <span class="popularity-label">이번 주 관심도</span>
                      <span class="popularity-value">{{ getScorePercent(getPopularityScore(product)) }}%</span>
                    </div>
                    <div class="popularity-bar">
                      <div class="popularity-fill" :style="{ width: getScorePercent(getPopularityScore(product)) + '%' }"></div>
                    </div>
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
                <!-- 순위 + 변동 -->
                <div class="chart-rank">
                  <span class="rank-number">{{ index + 4 }}</span>
                  <RankChange :change="product.rankChange" :isNew="product.isNew" size="small" />
                </div>

                <!-- 썸네일 -->
                <img :src="getThumbnailUrl(product)" :alt="product.name" class="chart-image" />

                <!-- 정보 -->
                <div class="chart-info">
                  <div class="info-top">
                    <h3 class="name">{{ product.name }}</h3>
                    <span v-if="getFirstTag(product)" class="tag">{{ getFirstTag(product) }}</span>
                  </div>
                  <div class="info-bottom">
                    <span class="brand">{{ product.brand }}</span>
                    <span v-if="product.price" class="price">{{ product.price }}</span>
                  </div>
                </div>

                <!-- 핵심 지표 -->
                <div class="chart-metrics">
                  <div class="rating-block">
                    <div class="rating">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="#FBBF24">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="rating-value">{{ formatRating(product.averageRating) }}</span>
                    </div>
                    <span class="review-count">{{ formatCount(product.reviewCount) }}개</span>
                  </div>
                  <div class="popularity-mini">
                    <div class="popularity-bar small">
                      <div class="popularity-fill" :style="{ width: getScorePercent(getPopularityScore(product)) + '%' }"></div>
                    </div>
                  </div>
                </div>

                <!-- 화살표 -->
                <svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
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
import RankChange from '@/components/product/RankChange.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import CommonCategoryFilter from '@/components/category/CommonCategoryFilter.vue';
import { productService } from '@/services/ProductService.js'
import { useCategoryCache } from '@/composables/useCategoryCache.js'

const { allCategories: cachedCategories, loadAllCategories } = useCategoryCache()

const router = useRouter()
const route = useRoute()

const DEFAULT_THUMBNAIL = 'https://picsum.photos/200'

// 상태
const categories = ref([])
const selectedCategoryId = ref(null)
const selectedCategoryDepth = ref(null)
const products = ref([])
const loading = ref(false)
const hasNext = ref(true)
const currentPage = ref(0)
const pageSize = 10
const totalElements = ref(0)
const searchKeyword = ref('')

// 인기도 점수 계산
const getPopularityScore = (product) => {
  if (!product) return 0
  if (product.popularityScore !== undefined && product.popularityScore !== null) {
    return product.popularityScore
  }
  const viewCount = product.viewCount || 0
  const likeCount = product.likeCount || 0
  const shareCount = product.shareCount || 0
  const reviewCount = product.reviewCount || 0
  return viewCount + (likeCount * 3) + (shareCount * 5) + (reviewCount * 2)
}

// 클라이언트 검색 필터 (나중에 백엔드 keyword 검색으로 대체 예정)
const filteredProducts = computed(() => {
  if (!searchKeyword.value.trim()) return products.value
  const keyword = searchKeyword.value.toLowerCase().trim()
  return products.value.filter(product =>
    product.name?.toLowerCase().includes(keyword) ||
    product.brand?.toLowerCase().includes(keyword)
  )
})

// Computed
const hero = computed(() => filteredProducts.value[0] || null)
const runnerUps = computed(() => filteredProducts.value.slice(1, 3))
const restList = computed(() => filteredProducts.value.slice(3))
const maxScore = computed(() => getPopularityScore(hero.value) || 1)

// 유틸리티 함수
const getThumbnailUrl = (product) => {
  return product.thumbnailDto?.fileUrl || product.thumbnailDto?.filePath || DEFAULT_THUMBNAIL
}

const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 10000) return (count / 10000).toFixed(1) + '만'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toLocaleString()
}

const formatRating = (rating) => {
  if (!rating) return '0.0'
  return typeof rating === 'number' ? rating.toFixed(1) : rating
}

const getScorePercent = (score) => {
  if (!score || !maxScore.value) return 0
  return Math.round((score / maxScore.value) * 100)
}

const getFirstTag = (product) => {
  if (!product.tags) return null
  const tagList = product.tags.split(';').filter(t => t.trim())
  return tagList[0] || null
}

const goToDetail = (product) => {
  router.push({ name: 'ProductDetail', params: { id: product.id } })
}

// 카테고리 변경 핸들러
const handleCategoryChange = ({ categoryId, categoryDepth, category, subCategory }) => {
  console.log('[ProductRanking] 카테고리 변경:', { categoryId, categoryDepth });
  selectedCategoryId.value = categoryId
  // categoryDepth 우선, 없으면 subCategory면 2, 아니면 1
  selectedCategoryDepth.value = categoryDepth || (subCategory ? 2 : 1)
  console.log('[ProductRanking] 선택된 값:', { categoryId: selectedCategoryId.value, categoryDepth: selectedCategoryDepth.value });
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

    const searchCondition = { status: 'APPROVED' }
    if (selectedCategoryId.value) {
      searchCondition.categoryId = selectedCategoryId.value
      searchCondition.categoryDepth = selectedCategoryDepth.value
    }

    const pageable = {
      page: currentPage.value,
      size: pageSize,
      sort: 'popularityScore,DESC'
    }

    const response = await productService.getProducts(searchCondition, pageable)

    if (response.success && response.data) {
      const pageData = response.data
      if (pageData.content) {
        products.value = reset ? pageData.content : [...products.value, ...pageData.content]
        hasNext.value = !pageData.last
        totalElements.value = pageData.totalElements || 0
      } else if (Array.isArray(pageData)) {
        products.value = reset ? pageData : [...products.value, ...pageData]
        hasNext.value = pageData.length >= pageSize
      }
    } else {
      hasNext.value = false
    }
  } catch (e) {
    console.error('랭킹 로드 실패:', e)
    hasNext.value = false
  } finally {
    loading.value = false
  }
}

// 카테고리 조회 (캐시 사용)
const fetchCategories = async () => {
  try {
    await loadAllCategories()
    categories.value = cachedCategories.value
  } catch (e) {
    console.error('카테고리 로드 실패:', e)
  }
}

const loadMore = () => {
  currentPage.value++
  fetchRanking(false)
}

watch(() => route.query, (query) => {
  if (query.categoryId) {
    selectedCategoryId.value = Number(query.categoryId)
  }
}, {immediate: true})

onMounted(async () => {
  await fetchCategories()
  fetchRanking(true)
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app-container {
  background: #fff;
  min-height: 100vh;
  color: #222;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100%;
  overflow-x: clip;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .app-container { padding: 0 2rem; }
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
  .main-content { padding-left: 0; }
}

@media (min-width: 768px) {
  .main-content { padding-bottom: 0; }
}

.ranking-view {
  max-width: 900px;
  margin: 0;
}

/* 페이지 헤더 */
.page-header {
  padding: 20px 0 16px;
}

.header-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #7c3aed;
  display: block;
  margin-bottom: 4px;
  padding-left: 13px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111;
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid #9333ea;
}

.header-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 6px 0 0;
  padding-left: 13px;
}

/* 검색 박스 */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 44px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-clear {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.search-clear:hover {
  background: #e5e7eb;
  color: #374151;
}

/* 로딩 & 빈 상태 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #888;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #f0f0f0;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Top 3 섹션 */
.top-section {
  padding: 16px 0;
}

.top-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 16px;
}

/* 순위 배지 */
.rank-badge {
  position: absolute;
  top: -10px;
  left: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  z-index: 1;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
}

.rank-badge.silver {
  background: linear-gradient(135deg, #E8E8E8, #B8B8B8);
  color: #fff;
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
  color: #fff;
}

/* 1위 히어로 카드 */
.hero-card {
  position: relative;
  background: #fff;
  border: 2px solid #7c3aed;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  grid-row: span 1;
}

.hero-card:hover {
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
  transform: translateY(-2px);
}

.hero-image-wrap {
  margin-top: 8px;
  margin-bottom: 16px;
}

.hero-image {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 12px;
  background: #f5f5f5;
}

.hero-info .brand {
  font-size: 13px;
  color: #888;
  display: block;
  margin-bottom: 4px;
}

.hero-info .name {
  font-size: 18px;
  font-weight: 700;
  color: #111;
  margin: 0 0 12px;
  line-height: 1.3;
}

/* 2, 3위 카드 */
.runner-card {
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.runner-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.runner-image-wrap {
  margin-top: 8px;
  margin-bottom: 12px;
}

.runner-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 10px;
  background: #f5f5f5;
}

.runner-info .brand {
  font-size: 12px;
  color: #888;
  display: block;
  margin-bottom: 2px;
}

.runner-info .name {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  margin: 0 0 10px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 공통: 메타 정보 행 */
.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-value {
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

.review-count {
  font-size: 12px;
  color: #888;
  margin-left: 4px;
}

/* 인기도 섹션 */
.popularity-section {
  margin-top: auto;
}

.popularity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.popularity-label {
  font-size: 11px;
  color: #888;
}

.popularity-value {
  font-size: 11px;
  font-weight: 600;
  color: #7c3aed;
}

.popularity-bar {
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.popularity-bar.small {
  height: 4px;
}

.popularity-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #A78BFA);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 4위 이하 리스트 */
.chart-section {
  padding: 0 0 24px;
}

.chart-list {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
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
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 40px;
  flex-shrink: 0;
}

.chart-rank .rank-number {
  font-size: 18px;
  font-weight: 700;
  color: #888;
}

.chart-image {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f5f5f5;
}

.chart-info {
  flex: 1;
  min-width: 0;
}

.info-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.chart-info .name {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag {
  font-size: 10px;
  background: #f3f4f6;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.info-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #888;
}

.price {
  color: #666;
}

.chart-metrics {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.rating-block {
  text-align: center;
}

.rating-block .review-count {
  display: block;
  margin-left: 0;
  margin-top: 2px;
  font-size: 10px;
}

.popularity-mini {
  width: 60px;
}

.arrow-icon {
  color: #ccc;
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}

.chart-item:hover .arrow-icon {
  color: #7c3aed;
  transform: translateX(2px);
}

/* 더보기 */
.load-more {
  text-align: center;
  padding: 8px 24px 32px;
}

.load-more-btn {
  padding: 12px 32px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}

.load-more-btn:hover:not(:disabled) {
  border-color: #7c3aed;
  color: #7c3aed;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 반응형: 태블릿 */
@media (max-width: 900px) {
  .top-grid {
    grid-template-columns: 1fr 1fr;
  }

  .hero-card {
    grid-column: span 2;
  }
}

/* 반응형: 모바일 */
@media (max-width: 640px) {
  .page-header {
    padding: 16px 0;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .top-section {
    padding: 12px 0;
  }

  .top-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .hero-card {
    grid-column: span 1;
  }

  .hero-image {
    aspect-ratio: 4 / 3;
  }

  .chart-section {
    padding: 0 0 16px;
  }

  .chart-item {
    padding: 12px 16px;
    gap: 12px;
  }

  .chart-metrics {
    display: none;
  }

  .chart-info .name {
    font-size: 14px;
  }

  .arrow-icon {
    display: none;
  }
}
</style>