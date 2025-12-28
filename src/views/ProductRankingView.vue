<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <AppHeader />

      <div class="ranking-wrapper">
        <!-- Header -->
        <div class="header">
          <p class="header-label">WEEKLY CHART</p>
          <h1 class="header-title">HOT 100</h1>
        </div>

        <!-- Filters -->
        <div class="filters">
          <div class="period-tabs">
            <button
                v-for="p in periods"
                :key="p.value"
                :class="['period-btn', { active: selectedPeriod === p.value }]"
                @click="handlePeriodChange(p.value)"
            >
              {{ p.label }}
            </button>
          </div>

          <div class="divider-v" />

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

        <!-- Loading -->
        <div v-if="loading && !products.length" class="loading-state">
          <div class="spinner" />
          <p>랭킹을 불러오는 중...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="!products.length" class="empty-state">
          <p>등록된 제품이 없습니다</p>
        </div>

        <template v-else>
          <!-- Hero - #1 -->
          <div v-if="hero" class="hero-card" @click="goToDetail(hero)">
            <div class="hero-inner">
              <div class="hero-rank">
                <span class="hero-rank-num">1</span>
                <RankChange :change="hero.rankChange" :isNew="hero.isNew" />
              </div>

              <div class="hero-img-wrap">
                <img :src="hero.thumbnailUrl" class="hero-img" alt="" />
                <div class="hero-img-overlay">
                  <div class="play-btn large">
                    <svg class="play-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>

              <div class="hero-info">
                <p class="hero-brand">{{ hero.brand }}</p>
                <h2 class="hero-name">{{ hero.name }}</h2>
                <div class="hero-stats">
                  <span class="stat">
                    <svg class="icon star" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <span class="stat-value">{{ hero.avgRating }}</span>
                    <span class="stat-sub">({{ hero.reviewCount }})</span>
                  </span>
                  <span class="stat hot">
                    <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/></svg>
                    <span class="stat-value">{{ hero.hotScore?.toLocaleString() }}</span>
                  </span>
                </div>
              </div>

              <div class="hero-bar">
                <div class="bar-track">
                  <div class="bar-fill full" />
                </div>
                <p class="bar-label">최고 점수</p>
              </div>
            </div>
          </div>

          <!-- Runner-ups - #2, #3 -->
          <div class="runner-grid">
            <div
                v-for="product in runnerUps"
                :key="product.id"
                class="runner-card"
                @click="goToDetail(product)"
            >
              <div class="runner-inner">
                <div class="runner-rank">
                  <span class="runner-rank-num">{{ product.rank }}</span>
                  <RankChange :change="product.rankChange" :isNew="product.isNew" />
                </div>

                <div class="runner-img-wrap">
                  <img :src="product.thumbnailUrl" class="runner-img" alt="" />
                  <div class="runner-img-overlay">
                    <div class="play-btn">
                      <svg class="play-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>

                <div class="runner-info">
                  <p class="runner-brand">{{ product.brand }}</p>
                  <h3 class="runner-name">{{ product.name }}</h3>
                  <div class="runner-stats">
                    <span class="stat">
                      <svg class="icon star" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <span class="stat-value">{{ product.avgRating }}</span>
                    </span>
                    <span class="stat hot">
                      <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/></svg>
                      <span class="stat-value">{{ formatScore(product.hotScore) }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="runner-bar">
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: getScorePercent(product.hotScore) + '%' }" />
                </div>
              </div>
            </div>
          </div>

          <!-- Chart List - #4 ~ -->
          <div class="chart-list">
            <div
                v-for="product in restList"
                :key="product.id"
                :class="['chart-item', { hovered: hoveredRank === product.rank }]"
                @mouseenter="hoveredRank = product.rank"
                @mouseleave="hoveredRank = null"
                @click="goToDetail(product)"
            >
              <div class="chart-rank">
                <span class="chart-rank-num">{{ product.rank }}</span>
                <RankChange :change="product.rankChange" :isNew="product.isNew" />
              </div>

              <img :src="product.thumbnailUrl" class="chart-img" alt="" />

              <div class="chart-info">
                <h3 class="chart-name">{{ product.name }}</h3>
                <p class="chart-brand">{{ product.brand }}</p>
              </div>

              <div class="chart-stats">
                <span class="stat">
                  <svg class="icon star" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span class="stat-value">{{ product.avgRating }}</span>
                </span>
                <span class="stat hot">
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/></svg>
                  <span class="stat-value">{{ formatScore(product.hotScore) }}</span>
                </span>
              </div>

              <div class="chart-bar">
                <div class="bar-track mini">
                  <div class="bar-fill light" :style="{ width: getScorePercent(product.hotScore) + '%' }" />
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="hasNext" class="load-more">
            <button class="load-more-btn" :disabled="loading" @click="loadMore">
              <span v-if="loading">불러오는 중...</span>
              <span v-else>{{ (currentPage + 1) * pageSize + 1 }} - 100위 보기</span>
            </button>
          </div>
        </template>
      </div>
    </main>

    <!-- Bottom Navigation - Mobile -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import AppHeader from '@/components/feed/AppHeader.vue'
import RankChange from '@/components/product/RankChange.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'

const router = useRouter()
const route = useRoute()

const periods = [
  {label: '실시간', value: 'REALTIME'},
  {label: '주간', value: 'WEEKLY'},
  {label: '월간', value: 'MONTHLY'}
]

const categories = [
  {label: '전체', value: null},
  {label: '전자기기', value: 1},
  {label: '뷰티', value: 2},
  {label: '식품', value: 3},
  {label: '패션', value: 4},
  {label: '생활', value: 5}
]

const selectedPeriod = ref('WEEKLY')
const selectedCategory = ref(null)
const hoveredRank = ref(null)
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
  router.push({name: 'ProductDetail', params: {id: product.id}})
}

const goToFeedCreate = () => {
  router.push({name: 'FeedCreate'})
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

    // TODO: API 연동
    // const res = await productService.getRanking({
    //   period: selectedPeriod.value,
    //   categoryId: selectedCategory.value,
    //   page: currentPage.value,
    //   size: pageSize
    // })
    //
    // if (res.success) {
    //   products.value = reset ? res.data.items : [...products.value, ...res.data.items]
    //   hasNext.value = res.data.hasNext
    // }

    // Mock data for preview
    const mockData = [
      {
        id: 1,
        rank: 1,
        rankChange: 2,
        name: '에어팟 프로 2세대',
        brand: 'Apple',
        avgRating: 4.8,
        reviewCount: 326,
        hotScore: 12450,
        thumbnailUrl: 'https://picsum.photos/200?1'
      },
      {
        id: 2,
        rank: 2,
        rankChange: -1,
        name: '갤럭시 버즈3 프로',
        brand: 'Samsung',
        avgRating: 4.6,
        reviewCount: 218,
        hotScore: 8230,
        thumbnailUrl: 'https://picsum.photos/200?2'
      },
      {
        id: 3,
        rank: 3,
        rankChange: 0,
        name: '다이슨 에어랩',
        brand: 'Dyson',
        avgRating: 4.7,
        reviewCount: 412,
        hotScore: 7890,
        thumbnailUrl: 'https://picsum.photos/200?3'
      },
      {
        id: 4,
        rank: 4,
        rankChange: 3,
        name: '스탠리 텀블러',
        brand: 'Stanley',
        avgRating: 4.5,
        reviewCount: 189,
        hotScore: 6540,
        thumbnailUrl: 'https://picsum.photos/200?4'
      },
      {
        id: 5,
        rank: 5,
        rankChange: -2,
        name: '소니 WH-1000XM5',
        brand: 'Sony',
        avgRating: 4.7,
        reviewCount: 287,
        hotScore: 5980,
        thumbnailUrl: 'https://picsum.photos/200?5'
      },
      {
        id: 6,
        rank: 6,
        rankChange: 1,
        name: '애플워치 시리즈 9',
        brand: 'Apple',
        avgRating: 4.6,
        reviewCount: 156,
        hotScore: 5420,
        thumbnailUrl: 'https://picsum.photos/200?6'
      },
      {
        id: 7,
        rank: 7,
        rankChange: -1,
        isNew: true,
        name: '로지텍 MX Master 3S',
        brand: 'Logitech',
        avgRating: 4.8,
        reviewCount: 98,
        hotScore: 4890,
        thumbnailUrl: 'https://picsum.photos/200?7'
      },
      {
        id: 8,
        rank: 8,
        rankChange: 0,
        name: '샤오미 공기청정기',
        brand: 'Xiaomi',
        avgRating: 4.4,
        reviewCount: 234,
        hotScore: 4560,
        thumbnailUrl: 'https://picsum.photos/200?8'
      },
      {
        id: 9,
        rank: 9,
        rankChange: 2,
        name: '닌텐도 스위치 OLED',
        brand: 'Nintendo',
        avgRating: 4.7,
        reviewCount: 445,
        hotScore: 4230,
        thumbnailUrl: 'https://picsum.photos/200?9'
      },
      {
        id: 10,
        rank: 10,
        rankChange: -3,
        name: '라네즈 립 마스크',
        brand: 'Laneige',
        avgRating: 4.5,
        reviewCount: 567,
        hotScore: 3980,
        thumbnailUrl: 'https://picsum.photos/200?10'
      },
    ]

    products.value = mockData
    hasNext.value = true

  } catch (e) {
    console.error('❌ 랭킹 로드 실패:', e)
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

// URL 쿼리 파라미터 처리
watch(() => route.query, (query) => {
  if (query.period) selectedPeriod.value = query.period
  if (query.categoryId) selectedCategory.value = Number(query.categoryId)
}, {immediate: true})

onMounted(() => {
  fetchRanking()
})
</script>

<style scoped>
.app-container {
  background: #fff;
  min-height: 100vh;
  display: flex;
  max-width: 100vw;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.app-container {
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
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
  }
}

.ranking-wrapper {
  max-width: 896px;
  padding: 32px 0;
  padding-left: 1rem;
}

@media (min-width: 768px) {
  .ranking-wrapper {
    padding-left: 2rem;
  }
}

@media (min-width: 1280px) {
  .ranking-wrapper {
    padding-left: 3rem;
  }
}

/* Header */
.header {
  margin-bottom: 32px;
}

.header-label {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #9333ea;
  margin-bottom: 4px;
}

.header-title {
  font-size: 30px;
  font-weight: 700;
  color: #1c1917;
}

/* Filters */
.filters {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.period-tabs {
  display: flex;
  background: #fafaf9;
  border-radius: 9999px;
  padding: 4px;
}

.period-btn {
  padding: 8px 20px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  color: #78716c;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.period-btn:hover {
  color: #1c1917;
}

.period-btn.active {
  background: #9333ea;
  color: #fff;
  box-shadow: 0 2px 4px rgba(147, 51, 234, 0.3);
}

.divider-v {
  width: 1px;
  height: 20px;
  background: #e7e5e4;
}

@media (max-width: 640px) {
  .divider-v {
    display: none;
  }
}

.category-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #78716c;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.category-btn:hover {
  background: #fafaf9;
}

.category-btn.active {
  background: #1c1917;
  color: #fff;
}

/* Loading & Empty */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #a8a29e;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e7e5e4;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Hero Card */
.hero-card {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 16px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f5f5f4;
  transition: box-shadow 0.2s;
}

.hero-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.hero-inner {
  display: flex;
  align-items: center;
  gap: 24px;
}

@media (max-width: 640px) {
  .hero-inner {
    flex-wrap: wrap;
    gap: 16px;
  }

  .hero-bar {
    width: 100%;
  }
}

.hero-rank {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 64px;
}

.hero-rank-num {
  font-size: 48px;
  font-weight: 900;
  color: #9333ea;
  line-height: 1;
}

.hero-img-wrap {
  position: relative;
}

.hero-img {
  width: 128px;
  height: 128px;
  border-radius: 16px;
  object-fit: cover;
}

@media (max-width: 640px) {
  .hero-img {
    width: 100px;
    height: 100px;
  }
}

.hero-img-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.hero-card:hover .hero-img-overlay {
  background: rgba(0, 0, 0, 0.3);
}

.play-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.play-btn.large {
  width: 48px;
  height: 48px;
}

.hero-card:hover .play-btn,
.runner-card:hover .play-btn {
  opacity: 1;
}

.play-icon {
  width: 20px;
  height: 20px;
  color: #1c1917;
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-brand {
  font-size: 14px;
  color: #a8a29e;
  margin-bottom: 4px;
}

.hero-name {
  font-size: 24px;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 12px;
}

@media (max-width: 640px) {
  .hero-name {
    font-size: 18px;
  }
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-bar {
  width: 128px;
}

.bar-track {
  height: 8px;
  background: #f5f5f4;
  border-radius: 9999px;
  overflow: hidden;
}

.bar-track.mini {
  height: 4px;
}

.bar-fill {
  height: 100%;
  background: #9333ea;
  border-radius: 9999px;
  opacity: 0.7;
  transition: width 0.3s;
}

.bar-fill.full {
  width: 100%;
  opacity: 1;
}

.bar-fill.light {
  opacity: 0.5;
}

.bar-label {
  font-size: 12px;
  color: #a8a29e;
  margin-top: 6px;
  text-align: right;
}

/* Runner Cards */
.runner-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .runner-grid {
    grid-template-columns: 1fr;
  }
}

.runner-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  border: 1px solid #f5f5f4;
  transition: box-shadow 0.2s;
}

.runner-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.runner-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.runner-rank {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.runner-rank-num {
  font-size: 30px;
  font-weight: 900;
  color: #d6d3d1;
  line-height: 1;
}

.runner-img-wrap {
  position: relative;
}

.runner-img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
}

.runner-img-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.runner-card:hover .runner-img-overlay {
  background: rgba(0, 0, 0, 0.3);
}

.runner-info {
  flex: 1;
  min-width: 0;
}

.runner-brand {
  font-size: 12px;
  color: #a8a29e;
  margin-bottom: 2px;
}

.runner-name {
  font-size: 15px;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.runner-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.runner-bar {
  margin-top: 16px;
}

.runner-bar .bar-track {
  height: 6px;
}

/* Chart List */
.chart-list {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f5f5f4;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #fafaf9;
}

.chart-item:last-child {
  border-bottom: none;
}

.chart-item.hovered {
  background: #fafaf9;
}

.chart-rank {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 80px;
}

.chart-rank-num {
  font-size: 18px;
  font-weight: 700;
  color: #a8a29e;
  width: 24px;
  text-align: center;
}

.chart-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.chart-info {
  flex: 1;
  min-width: 0;
}

.chart-name {
  font-size: 14px;
  font-weight: 600;
  color: #1c1917;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-brand {
  font-size: 12px;
  color: #a8a29e;
}

.chart-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 640px) {
  .chart-stats {
    display: none;
  }
}

.chart-bar {
  width: 96px;
}

@media (max-width: 768px) {
  .chart-bar {
    display: none;
  }
}

/* Shared Stats */
.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat .icon {
  width: 16px;
  height: 16px;
}

.stat .icon.star {
  color: #fbbf24;
}

.stat.hot {
  color: #9333ea;
}

.stat-value {
  font-weight: 600;
  font-size: 14px;
}

.stat-sub {
  font-size: 14px;
  color: #a8a29e;
}

/* Load More */
.load-more {
  margin-top: 24px;
  text-align: center;
}

.load-more-btn {
  padding: 12px 32px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
  background: #9333ea;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.load-more-btn:hover:not(:disabled) {
  background: #7e22ce;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>