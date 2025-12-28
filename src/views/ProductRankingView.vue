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

        <!-- 필터 -->
        <div class="filter-section">
          <div class="filter-group">
            <div class="period-tabs">
              <button
                  v-for="p in periods"
                  :key="p.value"
                  :class="['tab-btn', { active: selectedPeriod === p.value }]"
                  @click="handlePeriodChange(p.value)"
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <div class="category-tabs">
            <button
                v-for="c in categories"
                :key="c.value"
                :class="['category-btn', { active: selectedCategory === c.value }]"
                @click="handleCategoryChange(c.value)"
            >
              {{ c.label }}
            </button>
          </div>
        </div>

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
                <img :src="hero.thumbnailUrl" :alt="hero.name" class="hero-image" />
              </div>
              <div class="hero-info">
                <span class="brand">{{ hero.brand }}</span>
                <h2 class="name">{{ hero.name }}</h2>
                <div class="stats">
                  <span class="stat">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="#fbbf24">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {{ hero.avgRating }}
                    <span class="stat-sub">({{ hero.reviewCount }})</span>
                  </span>
                  <span class="stat hot">
                    🔥 {{ hero.hotScore?.toLocaleString() }}
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
                  v-for="product in runnerUps"
                  :key="product.id"
                  class="runner-card"
                  @click="goToDetail(product)"
              >
                <div class="runner-rank">
                  <span class="rank-number">{{ product.rank }}</span>
                  <RankChange :change="product.rankChange" :isNew="product.isNew" />
                </div>
                <img :src="product.thumbnailUrl" :alt="product.name" class="runner-image" />
                <div class="runner-info">
                  <span class="brand">{{ product.brand }}</span>
                  <h3 class="name">{{ product.name }}</h3>
                  <div class="stats">
                    <span class="stat">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="#fbbf24">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      {{ product.avgRating }}
                    </span>
                    <span class="stat hot">🔥 {{ formatScore(product.hotScore) }}</span>
                  </div>
                </div>
                <div class="runner-score">
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: getScorePercent(product.hotScore) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 4위 이하 리스트 -->
          <section class="chart-section">
            <div class="chart-list">
              <div
                  v-for="product in restList"
                  :key="product.id"
                  class="chart-item"
                  @click="goToDetail(product)"
              >
                <div class="chart-rank">
                  <span class="rank-number">{{ product.rank }}</span>
                  <RankChange :change="product.rankChange" :isNew="product.isNew" />
                </div>
                <img :src="product.thumbnailUrl" :alt="product.name" class="chart-image" />
                <div class="chart-info">
                  <h3 class="name">{{ product.name }}</h3>
                  <span class="brand">{{ product.brand }}</span>
                </div>
                <div class="chart-stats">
                  <span class="stat">
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="#fbbf24">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {{ product.avgRating }}
                  </span>
                  <span class="stat hot">🔥 {{ formatScore(product.hotScore) }}</span>
                </div>
                <div class="chart-bar">
                  <div class="score-bar small">
                    <div class="score-fill" :style="{ width: getScorePercent(product.hotScore) + '%' }"></div>
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

const router = useRouter()
const route = useRoute()

const periods = [
  { label: '실시간', value: 'REALTIME' },
  { label: '주간', value: 'WEEKLY' },
  { label: '월간', value: 'MONTHLY' }
]

const categories = [
  { label: '전체', value: null },
  { label: '전자기기', value: 1 },
  { label: '뷰티', value: 2 },
  { label: '식품', value: 3 },
  { label: '패션', value: 4 },
  { label: '생활', value: 5 }
]

const selectedPeriod = ref('WEEKLY')
const selectedCategory = ref(null)
const products = ref([])
const loading = ref(false)
const hasNext = ref(true)
const currentPage = ref(0)
const pageSize = 10

const hero = computed(() => products.value[0] || null)
const runnerUps = computed(() => products.value.slice(1, 3))
const restList = computed(() => products.value.slice(3))
const maxScore = computed(() => hero.value?.hotScore || 1)

const formatScore = (score) => {
  if (!score) return '0'
  return score >= 1000 ? (score / 1000).toFixed(1) + 'k' : score
}

const getScorePercent = (score) => {
  return Math.round((score / maxScore.value) * 100)
}

const goToDetail = (product) => {
  router.push({ name: 'ProductDetail', params: { id: product.id } })
}

const fetchRanking = async (reset = false) => {
  if (loading.value) return
  loading.value = true

  try {
    if (reset) {
      products.value = []
      currentPage.value = 0
      hasNext.value = true
    }

    // Mock data
    const mockData = [
      { id: 1, rank: 1, rankChange: 2, name: '에어팟 프로 2세대', brand: 'Apple', avgRating: 4.8, reviewCount: 326, hotScore: 12450, thumbnailUrl: 'https://picsum.photos/200?1' },
      { id: 2, rank: 2, rankChange: -1, name: '갤럭시 버즈3 프로', brand: 'Samsung', avgRating: 4.6, reviewCount: 218, hotScore: 8230, thumbnailUrl: 'https://picsum.photos/200?2' },
      { id: 3, rank: 3, rankChange: 0, name: '다이슨 에어랩', brand: 'Dyson', avgRating: 4.7, reviewCount: 412, hotScore: 7890, thumbnailUrl: 'https://picsum.photos/200?3' },
      { id: 4, rank: 4, rankChange: 3, name: '스탠리 텀블러', brand: 'Stanley', avgRating: 4.5, reviewCount: 189, hotScore: 6540, thumbnailUrl: 'https://picsum.photos/200?4' },
      { id: 5, rank: 5, rankChange: -2, name: '소니 WH-1000XM5', brand: 'Sony', avgRating: 4.7, reviewCount: 287, hotScore: 5980, thumbnailUrl: 'https://picsum.photos/200?5' },
      { id: 6, rank: 6, rankChange: 1, name: '애플워치 시리즈 9', brand: 'Apple', avgRating: 4.6, reviewCount: 156, hotScore: 5420, thumbnailUrl: 'https://picsum.photos/200?6' },
      { id: 7, rank: 7, rankChange: -1, isNew: true, name: '로지텍 MX Master 3S', brand: 'Logitech', avgRating: 4.8, reviewCount: 98, hotScore: 4890, thumbnailUrl: 'https://picsum.photos/200?7' },
      { id: 8, rank: 8, rankChange: 0, name: '샤오미 공기청정기', brand: 'Xiaomi', avgRating: 4.4, reviewCount: 234, hotScore: 4560, thumbnailUrl: 'https://picsum.photos/200?8' },
      { id: 9, rank: 9, rankChange: 2, name: '닌텐도 스위치 OLED', brand: 'Nintendo', avgRating: 4.7, reviewCount: 445, hotScore: 4230, thumbnailUrl: 'https://picsum.photos/200?9' },
      { id: 10, rank: 10, rankChange: -3, name: '라네즈 립 마스크', brand: 'Laneige', avgRating: 4.5, reviewCount: 567, hotScore: 3980, thumbnailUrl: 'https://picsum.photos/200?10' },
    ]

    products.value = mockData
    hasNext.value = true
  } catch (e) {
    console.error('랭킹 로드 실패:', e)
  } finally {
    loading.value = false
  }
}

const handlePeriodChange = (period) => {
  selectedPeriod.value = period
  fetchRanking(true)
}

const handleCategoryChange = (categoryId) => {
  selectedCategory.value = categoryId
  fetchRanking(true)
}

const loadMore = () => {
  currentPage.value++
  fetchRanking()
}

watch(() => route.query, (query) => {
  if (query.period) selectedPeriod.value = query.period
  if (query.categoryId) selectedCategory.value = Number(query.categoryId)
}, { immediate: true })

onMounted(() => {
  fetchRanking()
})
</script>

<style scoped>
* { box-sizing: border-box; }

.app-container {
  background: #fff;
  min-height: 100vh;
  color: #222;
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

.main-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 80px;
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 0;
  }
}

.ranking-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 페이지 헤더 */
.page-header {
  margin-bottom: 32px;
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

/* 필터 */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
}
.period-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 8px;
}
.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}
.tab-btn:hover {
  color: #333;
}
.tab-btn.active {
  background: #fff;
  color: #111;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.category-btn {
  padding: 6px 14px;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}
.category-btn:hover {
  border-color: #ddd;
  color: #333;
}
.category-btn.active {
  background: #111;
  border-color: #111;
  color: #fff;
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
@keyframes spin { to { transform: rotate(360deg); } }

/* Top 섹션 */
.top-section {
  margin-bottom: 24px;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
  margin-bottom: 24px;
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
  .ranking-view {
    padding: 20px 16px;
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
  padding-top: 8px;
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