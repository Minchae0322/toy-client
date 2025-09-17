<template>
  <div class="product-list-view">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-container">
        <router-link to="/" class="logo">
          <div class="logo-icon">🍽️</div>
          한입만
        </router-link>

        <div class="search-container">
          <input
              type="text"
              class="search-input"
              placeholder="먹거리, 브랜드를 검색해보세요"
              v-model="searchCondition.keyword"
              @keyup.enter="handleSearch"
          >
          <div class="search-icon">🔍</div>
        </div>

        <div class="header-actions">
          <button class="location-btn">
            📍 강남구
          </button>
          <button class="notification-btn">
            🔔
            <div class="notification-badge">3</div>
          </button>
        </div>
      </div>
    </header>

    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 왼쪽 사이드바 -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-title">카테고리</div>
          <ul class="category-list">
            <li
                class="category-item"
                :class="{ active: !searchCondition.categoryId }"
                @click="selectCategory(null)"
            >
              🔥 전체
            </li>
            <li
                v-for="category in categories"
                :key="category.categoryId"
                class="category-item"
                :class="{ active: searchCondition.categoryId === category.categoryId }"
                @click="selectCategory(category.categoryId)"
            >
              {{ getCategoryIcon(category.categoryName) }} {{ category.categoryName }}
              <span class="product-count" v-if="category.productCount">({{ category.productCount }})</span>
            </li>
          </ul>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-title">필터</div>
          <ul class="category-list">
            <li
                class="category-item"
                :class="{ active: filters.tradeAvailable }"
                @click="toggleFilter('tradeAvailable')"
            >
              💰 거래 가능
            </li>
            <li
                class="category-item"
                :class="{ active: filters.nearby }"
                @click="toggleFilter('nearby')"
            >
              📍 5km 이내
            </li>
            <li
                class="category-item"
                :class="{ active: filters.highRating }"
                @click="toggleFilter('highRating')"
            >
              ⭐ 4.0 이상
            </li>
            <li
                class="category-item"
                :class="{ active: filters.newProduct }"
                @click="toggleFilter('newProduct')"
            >
              🆕 신상품
            </li>
          </ul>
        </div>
      </aside>

      <!-- 메인 콘텐츠 -->
      <main class="main-content">
        <!-- 탭 네비게이션 -->
        <div class="tab-nav">
          <div class="tab-list">
            <div
                class="tab"
                :class="{ active: activeTab === 'trending' }"
                @click="setActiveTab('trending')"
            >
              <span>🔥</span>
              <span>트렌딩</span>
            </div>
            <div
                class="tab"
                :class="{ active: activeTab === 'nearby' }"
                @click="setActiveTab('nearby')"
            >
              <span>📍</span>
              <span>내 근처</span>
            </div>
            <div
                class="tab"
                :class="{ active: activeTab === 'new' }"
                @click="setActiveTab('new')"
            >
              <span>💫</span>
              <span>신상품</span>
            </div>
            <div
                class="tab"
                :class="{ active: activeTab === 'recent' }"
                @click="setActiveTab('recent')"
            >
              <span>⏰</span>
              <span>최근 본</span>
            </div>
          </div>
        </div>

        <!-- 메인 피드 -->
        <div class="main-feed">
          <div class="feed-header">
            <div class="sort-options">
              <button
                  v-for="option in sortOptions"
                  :key="option.value"
                  class="sort-btn"
                  :class="{ active: pageable.sort === option.value }"
                  @click="setSortOption(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- 로딩 상태 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner">로딩 중...</div>
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="error" class="error-container">
            <p>{{ error }}</p>
            <button @click="loadProducts" class="retry-btn">다시 시도</button>
          </div>

          <!-- 상품 그리드 -->
          <div v-else class="products-grid">
            <div
                v-for="product in products"
                :key="product.id"
                class="product-card"
                @click="goToProductDetail(product.id)"
            >
              <div class="product-image">
                <img
                    v-if="product.thumbnailUrl"
                    :src="product.thumbnailUrl"
                    :alt="product.name"
                    @error="onImageError"
                >
                <div v-else class="product-placeholder">
                  {{ getProductEmoji(product.categoryName) }}
                </div>
                <div class="product-badge">
                  {{ getProductBadge(product.productType) }}
                </div>
                <button
                    class="heart-btn"
                    @click.stop="toggleLike(product.id)"
                    :class="{ liked: likedProducts.has(product.id) }"
                >
                  {{ likedProducts.has(product.id) ? '❤️' : '🤍' }}
                </button>
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-brand">{{ product.brand }}</div>
                <div class="product-stats">
                  <span class="stat">⭐ {{ formatRating(product.averageRating) }}</span>
                  <span class="stat">💬 {{ formatCount(product.reviewCount) }}</span>
                  <span class="stat">🔥 {{ formatCount(product.likeCount) }}</span>
                </div>
                <div class="distance">📍 {{ getRandomDistance() }}</div>
              </div>
            </div>
          </div>

          <!-- 페이지네이션 -->
          <div v-if="totalPages > 1" class="pagination">
            <button
                v-for="page in visiblePages"
                :key="page"
                class="page-btn"
                :class="{ active: page === currentPage + 1 }"
                @click="goToPage(page - 1)"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </main>

      <!-- 오른쪽 사이드바 -->
      <aside class="right-sidebar">
        <!-- 실시간 랭킹 -->
        <div class="widget">
          <div class="widget-title">🏆 실시간 랭킹</div>
          <div
              v-for="(product, index) in topProducts"
              :key="product.id"
              class="ranking-item"
          >
            <div
                class="rank-number"
                :class="{ top3: index < 3 }"
            >
              {{ index + 1 }}
            </div>
            <div class="ranking-info">
              <div class="ranking-name">{{ product.name }}</div>
              <div class="ranking-brand">{{ product.brand }}</div>
            </div>
            <div v-if="index === 0" class="trend-badge">🚀 급상승</div>
            <div v-else-if="index === 2" class="trend-badge">🆕 신규</div>
          </div>
        </div>

        <!-- 내 근처 인기 -->
        <div class="widget">
          <div class="widget-title">📍 내 근처 인기</div>
          <div
              v-for="product in nearbyProducts"
              :key="product.id"
              class="ranking-item"
          >
            <div class="ranking-info">
              <div class="ranking-name">{{ product.name }}</div>
              <div class="ranking-brand">
                {{ getRandomDistance() }} · {{ formatRating(product.averageRating) }}⭐
              </div>
            </div>
          </div>
        </div>

        <!-- 카테고리 통계 위젯 -->
        <div class="widget">
          <div class="widget-title">📊 카테고리별 현황</div>
          <div
              v-for="stat in categoryStats"
              :key="stat.categoryId"
              class="category-stat-item"
          >
            <div class="category-stat-info">
              <div class="category-stat-name">
                {{ getCategoryIcon(stat.categoryName) }} {{ stat.categoryName }}
              </div>
              <div class="category-stat-count">{{ stat.productCount }}개</div>
            </div>
            <div class="category-progress">
              <div
                  class="category-progress-bar"
                  :style="{ width: `${stat.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productService, productUtils, productFilterUtils } from '@/services/productService.js'
import { categoryService, categoryUtils, useCategory } from '@/services/CategoryService.js'

// Router
const router = useRouter()

// Category composable 사용
const {
  getCategories,
  getAllCategoriesStats,
  sortCategories,
  filterCategories
} = useCategory()

// 반응형 데이터
const loading = ref(false)
const error = ref(null)
const products = ref([])
const categories = ref([])
const categoryStats = ref([])
const topProducts = ref([])
const nearbyProducts = ref([])
const likedProducts = ref(new Set())
const activeTab = ref('trending')
const currentPage = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)

// 검색 조건
const searchCondition = reactive(productFilterUtils.getDefaultSearchCondition())
const pageable = reactive(productFilterUtils.getDefaultPageable())

// 필터
const filters = reactive({
  tradeAvailable: false,
  nearby: false,
  highRating: false,
  newProduct: false
})

// 정렬 옵션
const sortOptions = computed(() => productFilterUtils.getSortOptions())

// 페이지네이션
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 3)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// ==================== 상품 관련 메서드 ====================

const loadProducts = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await productService.getProducts(searchCondition, pageable)

    if (response.success && response.data) {
      if (response.data.content) {
        // 페이징 응답 처리
        products.value = response.data.content
        totalPages.value = response.data.totalPages || 1
        totalElements.value = response.data.totalElements || 0
        currentPage.value = response.data.pageable?.page || 0
      } else {
        // 단순 배열 응답 처리
        products.value = Array.isArray(response.data) ? response.data : []
      }
    } else {
      throw new Error(response.message || '상품을 불러오는데 실패했습니다.')
    }
  } catch (err) {
    console.error('상품 로딩 실패:', err)
    error.value = err.message

    // 개발 환경에서 샘플 데이터 사용
    if (import.meta.env.DEV) {
      const sampleData = productService.getSampleProducts()
      products.value = sampleData.data.content || []
      totalPages.value = sampleData.data.totalPages || 1
    }
  } finally {
    loading.value = false
  }
}

const loadTopProducts = async () => {
  try {
    const response = await productService.getProducts(
        { status: 'APPROVED' },
        { page: 0, size: 5, sort: 'likeCount,DESC' }
    )

    if (response.success && response.data) {
      const data = response.data.content || response.data
      topProducts.value = Array.isArray(data) ? data.slice(0, 5) : []
    }
  } catch (err) {
    console.error('인기 상품 로딩 실패:', err)
    // 기본 상품에서 상위 5개 사용
    topProducts.value = products.value.slice(0, 5)
  }
}

const loadNearbyProducts = async () => {
  try {
    // ProductService의 getProducts 메서드 사용 시 올바른 파라미터 전달
    const response = await productService.getProducts(
        { status: 'APPROVED' },
        { page: 0, size: 3, sort: 'viewCount,DESC' }
    )

    if (response.success && response.data) {
      const data = response.data.content || response.data
      nearbyProducts.value = Array.isArray(data) ? data.slice(0, 3) : []
    }
  } catch (err) {
    console.error('근처 상품 로딩 실패:', err)
    console.error('Error details:', err)

    // 개발 환경에서 샘플 데이터 사용
    if (import.meta.env.DEV) {
      const sampleData = productService.getSampleProducts()
      const sampleProducts = sampleData.data.content || []
      nearbyProducts.value = sampleProducts.slice(0, 3)
    }
  }
}

// ==================== 카테고리 관련 메서드 ====================

const loadCategories = async () => {
  try {
    const response = await getCategories({ isActive: true })
    if (response.success) {
      // 카테고리 정렬 (sortOrder 기준)
      categories.value = sortCategories(response.data || [], 'sortOrder')
    }
  } catch (err) {
    console.error('카테고리 로딩 실패:', err)

    // 개발 환경에서 샘플 데이터 사용
    if (import.meta.env.DEV) {
      const sampleData = categoryService.getSampleCategories()
      categories.value = sortCategories(sampleData.data || [], 'sortOrder')
    }
  }
}

const loadCategoryStats = async () => {
  try {
    // /api/categories/stats가 없으므로 개별 카테고리에서 통계 계산
    // 또는 기존 categories 데이터에서 productCount 활용
    if (categories.value && categories.value.length > 0) {
      // 기존 카테고리 데이터에서 통계 생성
      const totalProducts = categories.value.reduce((sum, cat) => sum + (cat.productCount || 0), 0)

      const stats = categories.value
      .filter(cat => cat.productCount > 0)
      .map(cat => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        productCount: cat.productCount || 0,
        percentage: totalProducts > 0 ? ((cat.productCount || 0) / totalProducts * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5)

      categoryStats.value = stats
      console.log('카테고리 통계를 기존 데이터로 생성:', stats)
    } else {
      console.log('카테고리 데이터가 없어 통계를 생성할 수 없음')
      categoryStats.value = []
    }
  } catch (err) {
    console.error('카테고리 통계 생성 실패:', err)

    // 개발 환경에서 샘플 데이터 사용
    if (import.meta.env.DEV) {
      const sampleData = categoryService.getSampleCategoriesStats()
      if (sampleData.data && sampleData.data.categoriesStats) {
        categoryStats.value = sampleData.data.categoriesStats.slice(0, 5)
        console.log('샘플 카테고리 통계 데이터 사용')
      } else {
        categoryStats.value = []
      }
    } else {
      categoryStats.value = []
    }
  }
}

const selectCategory = (categoryId) => {
  searchCondition.categoryId = categoryId
  pageable.page = 0
  currentPage.value = 0
  loadProducts()
}

// ==================== 필터 및 정렬 메서드 ====================

const toggleFilter = (filterType) => {
  filters[filterType] = !filters[filterType]
  applyFilters()
}

const applyFilters = () => {
  // 필터 로직 구현
  if (filters.tradeAvailable) {
    searchCondition.productType = 'SALE'
  } else {
    searchCondition.productType = null
  }

  pageable.page = 0
  currentPage.value = 0
  loadProducts()
}

const setActiveTab = (tab) => {
  activeTab.value = tab

  // 탭에 따른 정렬 변경
  switch (tab) {
    case 'trending':
      pageable.sort = 'likeCount,DESC'
      break
    case 'nearby':
      // 실제로는 위치 기반 정렬이 필요하지만 여기서는 조회수로 대체
      pageable.sort = 'viewCount,DESC'
      break
    case 'new':
      pageable.sort = 'releaseDate,DESC'
      break
    case 'recent':
      pageable.sort = 'createdAt,DESC'
      break
  }

  pageable.page = 0
  currentPage.value = 0
  loadProducts()
}

const setSortOption = (sortValue) => {
  pageable.sort = sortValue
  pageable.page = 0
  currentPage.value = 0
  loadProducts()
}

// ==================== 검색 및 페이징 메서드 ====================

const handleSearch = () => {
  pageable.page = 0
  currentPage.value = 0
  loadProducts()
}

const goToPage = (page) => {
  pageable.page = page
  currentPage.value = page
  loadProducts()
}

// ==================== 네비게이션 및 액션 메서드 ====================

const goToProductDetail = (productId) => {
  router.push(`/products/${productId}`)
}

const toggleLike = async (productId) => {
  try {
    await productService.likeProduct(productId)

    if (likedProducts.value.has(productId)) {
      likedProducts.value.delete(productId)
    } else {
      likedProducts.value.add(productId)
    }

    // 상품 목록 갱신
    loadProducts()
  } catch (err) {
    console.error('좋아요 처리 실패:', err)
  }
}

// ==================== 유틸리티 메서드 ====================

const formatRating = (rating) => {
  if (!rating) return '0.0'
  return typeof rating === 'number' ? rating.toFixed(1) : rating
}

const formatCount = (count) => {
  if (!count) return '0'
  return productUtils.formatCount(count)
}

const getCategoryIcon = (categoryName) => {
  return categoryUtils.getCategoryIcon(categoryName)
}

const getProductEmoji = (categoryName) => {
  return categoryUtils.getCategoryIcon(categoryName)
}

const getProductBadge = (productType) => {
  const badgeMap = {
    'SALE': '💰 거래가능',
    'AUCTION': '🔨 경매',
    'FREE': '🆓 무료나눔',
    'EXCHANGE': '🔄 교환'
  }
  return badgeMap[productType] || '❌ 정보만'
}

const getRandomDistance = () => {
  const distances = ['100m', '200m', '300m', '500m', '750m', '900m', '1.2km']
  return distances[Math.floor(Math.random() * distances.length)] + ' 이내'
}

const onImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}

// ==================== 라이프사이클 ====================

onMounted(async () => {
  console.log('🚀 [PRODUCT-LIST] 컴포넌트 마운트 시작')

  // 카테고리와 상품 데이터 동시 로드
  await Promise.all([
    loadCategories(),
    loadProducts()
  ])

  // 사이드바 데이터 로드 (메인 데이터 로드 후)
  // loadCategoryStats는 categories 로드 후에 실행되도록 순서 변경
  await Promise.all([
    loadTopProducts(),
    loadNearbyProducts()
  ])

  // 카테고리 통계는 카테고리 로드 완료 후 실행
  await loadCategoryStats()

  console.log('✅ [PRODUCT-LIST] 모든 데이터 로드 완료')
})

// ==================== 감시자 ====================

watch([() => searchCondition.keyword], () => {
  if (!searchCondition.keyword) return

  // 디바운스 검색
  const searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)

  return () => clearTimeout(searchTimeout)
})

// 카테고리 변경 감시
watch([() => searchCondition.categoryId], () => {
  console.log('🔄 [PRODUCT-LIST] 카테고리 변경됨:', searchCondition.categoryId)
})

// ==================== 디버깅 ====================

// 개발 환경에서 디버깅 정보 출력
if (import.meta.env.DEV) {
  watch([categories, categoryStats], ([newCategories, newStats]) => {
    console.group('🔍 [PRODUCT-LIST] 카테고리 데이터 상태')
    console.log('Categories:', newCategories)
    console.log('Category Stats:', newStats)
    console.groupEnd()
  })
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.product-list-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  color: #222222;
  line-height: 1.6;
  min-height: 100vh;
}

/* 헤더 */
.header {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 800;
  color: #000000;
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1DCD9F, #169976);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.search-container {
  flex: 1;
  max-width: 600px;
  margin: 0 40px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #1DCD9F;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #222222;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.location-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  color: #222222;
  cursor: pointer;
}

.notification-btn {
  position: relative;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #1DCD9F;
  color: white;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 240px 1fr 320px;
  gap: 24px;
}

/* 사이드바 */
.sidebar {
  background: white;
  border-radius: 16px;
  padding: 20px;
  height: fit-content;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 12px;
}

.category-list {
  list-style: none;
}

.category-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.category-item:hover {
  background: #f1f5f9;
}

.category-item.active {
  background: #1DCD9F;
  color: white;
}

/* 탭 네비게이션 */
.tab-nav {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.tab-list {
  display: flex;
  gap: 32px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #222222;
  position: relative;
  transition: color 0.2s;
}

.tab:hover {
  color: #1DCD9F;
}

.tab.active {
  color: #1DCD9F;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 0;
  right: 0;
  height: 3px;
  background: #1DCD9F;
  border-radius: 2px;
}

/* 메인 피드 */
.main-feed {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.feed-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sort-options {
  display: flex;
  gap: 16px;
}

.sort-btn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn.active {
  background: #1DCD9F;
  color: white;
  border-color: #1DCD9F;
}

.loading-container, .error-container {
  padding: 60px 24px;
  text-align: center;
}

.loading-spinner {
  font-size: 16px;
  color: #1DCD9F;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #1DCD9F;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.products-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: #1DCD9F;
}

.product-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #1DCD9F, #169976);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
}

.product-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.heart-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.heart-btn.liked {
  background: rgba(255,182,193,0.9);
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
  line-height: 1.3;
}

.product-brand {
  font-size: 12px;
  color: #222222;
  opacity: 0.6;
  margin-bottom: 12px;
}

.product-stats {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.stat {
  font-size: 12px;
  color: #222222;
}

.distance {
  font-size: 11px;
  color: #169976;
  font-weight: 500;
}

.pagination {
  padding: 20px 24px;
  display: flex;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid #f1f5f9;
}

.page-btn {
  padding: 8px 12px;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn.active {
  background: #1DCD9F;
  color: white;
  border-color: #1DCD9F;
}

/* 오른쪽 사이드바 */
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.widget {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.widget-title {
  font-size: 16px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 20px;
  height: 20px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #222222;
  flex-shrink: 0;
}

.rank-number.top3 {
  background: #1DCD9F;
  color: white;
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-size: 13px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-brand {
  font-size: 11px;
  color: #222222;
  opacity: 0.6;
}

.trend-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  background: #169976;
  color: white;
  flex-shrink: 0;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: 200px 1fr 280px;
    gap: 20px;
  }
}

@media (max-width: 1024px) {
  .main-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .sidebar,
  .right-sidebar {
    display: none;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: 56px;
  }

  .search-container {
    margin: 0 16px;
  }

  .main-container {
    padding: 16px;
  }

  .tab-list {
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    padding: 16px;
    gap: 12px;
  }

  .sort-options {
    gap: 8px;
    flex-wrap: wrap;
  }

  .feed-header {
    padding: 16px;
  }
}

@media (max-width: 640px) {
  .logo {
    font-size: 18px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .search-container {
    margin: 0 12px;
  }

  .search-input {
    padding: 10px 14px 10px 40px;
    font-size: 13px;
  }

  .header-actions {
    gap: 8px;
  }

  .location-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .product-card {
    max-width: 100%;
  }

  .tab-list {
    gap: 16px;
  }

  .tab {
    font-size: 14px;
  }
}

/* 로딩 애니메이션 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner::after {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-left: 8px;
  border: 2px solid #1DCD9F;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 트랜지션 효과 */
.product-card,
.category-item,
.tab,
.sort-btn,
.page-btn,
.heart-btn {
  transition: all 0.2s ease-in-out;
}

/* 접근성 개선 */
.product-card:focus,
.category-item:focus,
.tab:focus,
.sort-btn:focus,
.page-btn:focus {
  outline: 2px solid #1DCD9F;
  outline-offset: 2px;
}

/* 스크롤바 스타일링 */
.tab-list::-webkit-scrollbar {
  height: 4px;
}

.tab-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.tab-list::-webkit-scrollbar-thumb {
  background: #1DCD9F;
  border-radius: 2px;
}

.tab-list::-webkit-scrollbar-thumb:hover {
  background: #169976;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #64748b;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #334155;
}

.empty-state-description {
  font-size: 14px;
  line-height: 1.5;
}

/* 추가 유틸리티 클래스 */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>