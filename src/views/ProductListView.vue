<template>
  <div class="product-list-view">
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
              전체
            </li>
            <li
                v-for="category in categories"
                :key="category.categoryId"
                class="category-item"
                :class="{ active: searchCondition.categoryId === category.categoryId }"
                @click="selectCategory(category.categoryId)"
            >
              {{ category.categoryName }}
              <span class="product-count" v-if="category.productCount">{{ category.productCount }}</span>
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

        <div v-if="isLoggedIn" class="sidebar-section">
          <div class="sidebar-title">마이페이지</div>
          <ul class="category-list">
            <li class="category-item" @click="goToMyProducts">
              📦 내 상품
            </li>
            <li class="category-item" @click="goToLikedProducts">
              ❤️ 찜한 상품
            </li>
            <li class="category-item" @click="goToMyReviews">
              💬 내 리뷰
            </li>
          </ul>
        </div>
      </aside>

      <!-- 메인 콘텐츠 -->
      <main class="main-content">
        <!-- 탭 네비게이션 + 검색 + 액션 -->
        <div class="top-section">
          <div class="tab-nav">
            <div class="tab-content">
              <!-- 검색 영역 -->
              <div class="search-container">
                <div class="search-icon">🔍</div>
                <input
                    type="text"
                    class="search-input"
                    placeholder="먹거리, 브랜드를 검색해보세요"
                    v-model="searchCondition.keyword"
                    @keyup.enter="handleSearch"
                >
                <button
                    v-if="searchCondition.keyword"
                    class="clear-btn"
                    @click="clearSearch"
                >
                  ✕
                </button>
              </div>

              <div v-if="isLoggedIn" class="action-section">
                <router-link to="/products/create" class="create-product-btn">
                  <span class="btn-icon">➕</span>
                  <span class="btn-text">상품 등록</span>
                </router-link>
              </div>
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

            <div v-if="totalElements > 0" class="result-count">
              총 <strong>{{ totalElements.toLocaleString() }}</strong>개
            </div>
          </div>

          <!-- 로딩 상태 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p>로딩 중...</p>
            </div>
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="error" class="error-container">
            <div class="error-icon">⚠️</div>
            <p>{{ error }}</p>
            <button @click="loadProducts" class="retry-btn">다시 시도</button>
          </div>

          <!-- 검색 결과 없음 -->
          <div v-else-if="products.length === 0" class="empty-container">
            <div class="empty-icon">🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 키워드로 검색해보세요</p>
            <button @click="clearSearch" class="clear-search-btn">
              검색 초기화
            </button>
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
                    v-if="getThumbnailUrl(product)"
                    :src="getThumbnailUrl(product)"
                    :alt="product.name"
                    @error="handleImageError"
                >
                <div v-else class="product-placeholder">
                  {{ getProductEmoji(product.categoryName) }}
                </div>
                <div class="product-badge">
                  {{ getProductBadge(product.productType) }}
                </div>
                <button
                    class="heart-btn"
                    @click.stop="handleLikeAction(product.id)"
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
                class="page-nav-btn"
                :disabled="currentPage === 0"
                @click="goToPage(currentPage - 1)"
            >
              ‹
            </button>
            <button
                v-for="page in visiblePages"
                :key="page"
                class="page-btn"
                :class="{ active: page === currentPage + 1 }"
                @click="goToPage(page - 1)"
            >
              {{ page }}
            </button>
            <button
                class="page-nav-btn"
                :disabled="currentPage === totalPages - 1"
                @click="goToPage(currentPage + 1)"
            >
              ›
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
              @click="goToProductDetail(product.id)"
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
              @click="goToProductDetail(product.id)"
          >
            <div class="ranking-info">
              <div class="ranking-name">{{ product.name }}</div>
              <div class="ranking-brand">
                {{ getRandomDistance() }} · {{ formatRating(product.averageRating) }}⭐
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoggedIn" class="widget">
          <div class="widget-title">👤 나만의 정보</div>
          <div class="user-stats">
            <div class="user-stat-item">
              <div class="user-stat-number">{{ userStats.likedCount }}</div>
              <div class="user-stat-label">찜한 상품</div>
            </div>
            <div class="user-stat-item">
              <div class="user-stat-number">{{ userStats.reviewCount }}</div>
              <div class="user-stat-label">작성한 리뷰</div>
            </div>
            <div class="user-stat-item">
              <div class="user-stat-number">{{ userStats.productCount }}</div>
              <div class="user-stat-label">등록한 상품</div>
            </div>
          </div>
        </div>

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

    <!-- 로그인 유도 모달 -->
    <div v-if="showLoginModal" class="login-modal-overlay" @click="closeLoginModal">
      <div class="login-modal-content" @click.stop>
        <div class="login-modal-icon">🔒</div>
        <h3>로그인이 필요한 기능입니다</h3>
        <p>상품에 좋아요를 표시하려면 로그인해주세요.</p>
        <div class="login-modal-actions">
          <button class="modal-btn secondary" @click="closeLoginModal">
            나중에 하기
          </button>
          <router-link to="/login" class="modal-btn primary" @click="closeLoginModal">
            로그인하기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { productService, productUtils, productFilterUtils } from '@/services/productService.js'
import { categoryService, categoryUtils, useCategory } from '@/services/CategoryService.js'

const router = useRouter()

const {
  user,
  isLoggedIn,
  userNickname,
  userId,
  logout
} = useAuth()

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
const showLoginModal = ref(false)

const userStats = ref({
  likedCount: 0,
  reviewCount: 0,
  productCount: 0
})

const searchCondition = reactive(productFilterUtils.getDefaultSearchCondition())
const pageable = reactive(productFilterUtils.getDefaultPageable())

const filters = reactive({
  tradeAvailable: false,
  nearby: false,
  highRating: false,
  newProduct: false
})

const sortOptions = computed(() => productFilterUtils.getSortOptions())

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 3)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 검색 초기화
const clearSearch = () => {
  searchCondition.keyword = ''
  handleSearch()
}

const handleLikeAction = async (productId) => {
  if (!isLoggedIn.value) {
    showLoginRequiredModal()
    return
  }
  await toggleLike(productId)
}

const showLoginRequiredModal = () => {
  showLoginModal.value = true
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

const loadUserStats = async () => {
  if (!isLoggedIn.value || !userId.value) return
  try {
    userStats.value = {
      likedCount: Math.floor(Math.random() * 50) + 1,
      reviewCount: Math.floor(Math.random() * 30) + 1,
      productCount: Math.floor(Math.random() * 10) + 1
    }
  } catch (err) {
    console.error('사용자 통계 로딩 실패:', err)
  }
}

const goToMyProducts = () => {
  if (isLoggedIn.value) router.push('/my/products')
}

const goToLikedProducts = () => {
  if (isLoggedIn.value) router.push('/my/liked')
}

const goToMyReviews = () => {
  if (isLoggedIn.value) router.push('/my/reviews')
}

const loadProducts = async () => {
  try {
    loading.value = true
    error.value = null

    const enhancedSearchCondition = {
      ...searchCondition,
      userId: isLoggedIn.value ? userId.value : null
    }

    const response = await productService.getProducts(enhancedSearchCondition, pageable)

    if (response.success && response.data) {
      if (response.data.content) {
        products.value = response.data.content
        totalPages.value = response.data.totalPages || 1
        totalElements.value = response.data.totalElements || 0
        currentPage.value = response.data.pageable?.page || 0

        if (isLoggedIn.value) {
          loadUserLikedProducts(response.data.content)
        }
      } else {
        products.value = Array.isArray(response.data) ? response.data : []
      }
    } else {
      throw new Error(response.message || '상품을 불러오는데 실패했습니다.')
    }
  } catch (err) {
    console.error('상품 로딩 실패:', err)
    error.value = err.message

    if (import.meta.env.DEV) {
      const sampleData = productService.getSampleProducts()
      products.value = sampleData.data.content || []
      totalPages.value = sampleData.data.totalPages || 1
    }
  } finally {
    loading.value = false
  }
}

const loadUserLikedProducts = (productList) => {
  if (!isLoggedIn.value) return
  const newLikedProducts = new Set()
  productList.forEach(product => {
    if (Math.random() > 0.7) {
      newLikedProducts.add(product.id)
    }
  })
  likedProducts.value = newLikedProducts
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
    topProducts.value = products.value.slice(0, 5)
  }
}

const loadNearbyProducts = async () => {
  try {
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

    if (import.meta.env.DEV) {
      const sampleData = productService.getSampleProducts()
      const sampleProducts = sampleData.data.content || []
      nearbyProducts.value = sampleProducts.slice(0, 3)
    }
  }
}

const loadCategories = async () => {
  try {
    const response = await getCategories({ isActive: true })
    if (response.success) {
      categories.value = sortCategories(response.data || [], 'sortOrder')
    }
  } catch (err) {
    console.error('카테고리 로딩 실패:', err)

    if (import.meta.env.DEV) {
      const sampleData = categoryService.getSampleCategories()
      categories.value = sortCategories(sampleData.data || [], 'sortOrder')
    }
  }
}

const loadCategoryStats = async () => {
  try {
    if (categories.value && categories.value.length > 0) {
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
    } else {
      categoryStats.value = []
    }
  } catch (err) {
    console.error('카테고리 통계 생성 실패:', err)

    if (import.meta.env.DEV) {
      const sampleData = categoryService.getSampleCategoriesStats()
      if (sampleData.data && sampleData.data.categoriesStats) {
        categoryStats.value = sampleData.data.categoriesStats.slice(0, 5)
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

const toggleFilter = (filterType) => {
  filters[filterType] = !filters[filterType]
  applyFilters()
}

const applyFilters = () => {
  if (filters.tradeAvailable) {
    searchCondition.productType = 'SALE'
  } else {
    searchCondition.productType = null
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

const handleSearch = () => {
  pageable.page = 0
  currentPage.value = 0
  loadProducts()
}

const goToPage = (page) => {
  pageable.page = page
  currentPage.value = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

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

    loadProducts()
    loadUserStats()
  } catch (err) {
    console.error('좋아요 처리 실패:', err)
  }
}

const getThumbnailUrl = (product) => {
  if (product.thumbnailDto?.fileUrl) {
    return product.thumbnailDto.fileUrl
  }

  if (product.thumbnailUrl) {
    return product.thumbnailUrl
  }

  if (product.attachments && product.attachments.length > 0) {
    return product.attachments[0].fileUrl
  }

  return null
}

const handleImageError = (event) => {
  console.warn('[PRODUCT] 이미지 로딩 실패:', event.target.src)
  event.target.style.display = 'none'
  const placeholder = event.target.nextElementSibling
  if (placeholder && placeholder.classList.contains('product-placeholder')) {
    placeholder.style.display = 'flex'
  }
}

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
    'SALE': '거래가능',
    'AUCTION': '경매',
    'FREE': '무료나눔',
    'EXCHANGE': '교환'
  }
  return badgeMap[productType] || '거래가능'
}

const getRandomDistance = () => {
  const distances = ['100m', '200m', '300m', '500m', '750m', '900m', '1.2km']
  return distances[Math.floor(Math.random() * distances.length)] + ' 이내'
}

onMounted(async () => {
  console.log('🚀 [PRODUCT-LIST] 컴포넌트 마운트 시작')

  await Promise.all([
    loadCategories(),
    loadProducts()
  ])

  await Promise.all([
    loadTopProducts(),
    loadNearbyProducts()
  ])

  await loadCategoryStats()

  if (isLoggedIn.value) {
    await loadUserStats()
  }

  console.log('✅ [PRODUCT-LIST] 모든 데이터 로드 완료')
})

watch([() => searchCondition.keyword], () => {
  if (!searchCondition.keyword && searchCondition.keyword !== '') return

  const searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)

  return () => clearTimeout(searchTimeout)
})

watch(isLoggedIn, (newValue) => {
  if (newValue) {
    loadUserStats()
    loadProducts()
  } else {
    likedProducts.value.clear()
    userStats.value = {
      likedCount: 0,
      reviewCount: 0,
      productCount: 0
    }
    if (activeTab.value === 'recent') {
      activeTab.value = 'trending'
      setSortOption('likeCount,DESC')
    }
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.product-list-view {
  background: #fafafa;
  color: #333;
  line-height: 1.6;
  min-height: 100vh;
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 60px;
  display: grid;
  grid-template-columns: 220px 1fr 300px;
  gap: 24px;
}

/* 사이드바 */
.sidebar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  border: 1px solid #f0f0f0;
  position: sticky;
  top: 24px;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 700;
  color: #000;
  margin-bottom: 12px;
  letter-spacing: -0.3px;
}

.category-list {
  list-style: none;
}

.category-item {
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #888;
}

.category-item:hover {
  background: #f8f8f8;
  color: #333;
}

.category-item.active {
  background: #1DCD9F;
  color: white;
  font-weight: 600;
}

.product-count {
  font-size: 12px;
  opacity: 0.6;
  font-weight: 400;
}

/* 상단 섹션 (검색 + 액션) */
.top-section {
  margin-bottom: 20px;
}

.tab-nav {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #f0f0f0;
}

.tab-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

/* 검색 컨테이너 */
.search-container {
  position: relative;
  flex: 1;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #999;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 48px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fafafa;
}

.search-input:focus {
  outline: none;
  border-color: #1DCD9F;
  background: white;
  box-shadow: 0 0 0 3px rgba(29, 205, 159, 0.1);
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #e0e0e0;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #d0d0d0;
  color: #333;
}

/* 액션 섹션 */
.action-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.create-product-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #1DCD9F 0%, #169976 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(29, 205, 159, 0.2);
}

.create-product-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.3);
}

.create-product-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-size: 14px;
}

/* 메인 피드 */
.main-feed {
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.feed-header {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sort-options {
  display: flex;
  gap: 6px;
  background: #f8f8f8;
  padding: 4px;
  border-radius: 8px;
}

.sort-btn {
  padding: 7px 14px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.sort-btn:hover {
  color: #1DCD9F;
  background: rgba(29, 205, 159, 0.08);
}

.sort-btn.active {
  background: white;
  color: #1DCD9F;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.result-count {
  font-size: 13px;
  color: #666;
}

.result-count strong {
  color: #1DCD9F;
  font-weight: 700;
}

/* 로딩 상태 */
.loading-container {
  padding: 80px 24px;
  text-align: center;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #1DCD9F;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner p {
  font-size: 14px;
  color: #666;
}

/* 에러 상태 */
.error-container {
  padding: 80px 24px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-container p {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 10px 24px;
  background: #1DCD9F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #169976;
}

/* 빈 결과 */
.empty-container {
  padding: 80px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-container h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-container p {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.clear-search-btn {
  padding: 10px 24px;
  background: #f8f8f8;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: #e8e8e8;
  border-color: #d0d0d0;
}

/* 상품 그리드 */
.products-grid {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.product-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.product-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #fafafa;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1DCD9F 0%, #169976 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 56px;
  opacity: 0.9;
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.heart-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.heart-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.heart-btn.liked {
  background: rgba(255, 182, 193, 0.95);
  animation: heartbeat 0.3s ease;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.product-info {
  padding: 14px;
}

.product-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.3px;
  min-height: 42px;
}

.product-brand {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

.product-stats {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.stat {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 400;
}

.distance {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

/* 페이지네이션 */
.pagination {
  padding: 24px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-top: 1px solid #f0f0f0;
}

.page-btn,
.page-nav-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(.active),
.page-nav-btn:hover:not(:disabled) {
  border-color: #1DCD9F;
  color: #1DCD9F;
  background: rgba(29, 205, 159, 0.05);
}

.page-btn.active {
  background: #1DCD9F;
  color: white;
  border-color: #1DCD9F;
  font-weight: 600;
}

.page-nav-btn {
  font-size: 18px;
  font-weight: 700;
}

.page-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 오른쪽 사이드바 */
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 24px;
  height: fit-content;
}

.widget {
  background: white;
  border-radius: 12px;
  padding: 18px;
  border: 1px solid #f0f0f0;
}

.widget-title {
  font-size: 14px;
  font-weight: 700;
  color: #000;
  margin-bottom: 14px;
  letter-spacing: -0.3px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-bottom: 1px solid #f8f8f8;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
  margin-bottom: 4px;
}

.ranking-item:hover {
  background: #f8f8f8;
}

.ranking-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.rank-number {
  width: 24px;
  height: 24px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #999;
  flex-shrink: 0;
}

.rank-number.top3 {
  background: linear-gradient(135deg, #1DCD9F, #169976);
  color: white;
  box-shadow: 0 2px 8px rgba(29, 205, 159, 0.3);
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.ranking-brand {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trend-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  flex-shrink: 0;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
}

/* 사용자 통계 */
.user-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.user-stat-item {
  text-align: center;
  padding: 14px 10px;
  background: linear-gradient(135deg, #f8f8f8 0%, #fafafa 100%);
  border-radius: 10px;
  transition: all 0.2s;
  cursor: default;
}

.user-stat-item:hover {
  background: linear-gradient(135deg, #f0f0f0 0%, #f5f5f5 100%);
  transform: translateY(-2px);
}

.user-stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #1DCD9F;
  margin-bottom: 4px;
}

.user-stat-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

/* 카테고리 통계 */
.category-stat-item {
  margin-bottom: 14px;
}

.category-stat-item:last-child {
  margin-bottom: 0;
}

.category-stat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.category-stat-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.category-stat-count {
  font-size: 11px;
  color: #1DCD9F;
  font-weight: 600;
}

.category-progress {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.category-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #1DCD9F, #169976);
  border-radius: 3px;
  transition: width 0.4s ease;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

/* 로그인 모달 */
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.login-modal-content {
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-modal-icon {
  font-size: 56px;
  margin-bottom: 20px;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.login-modal-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #000;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.login-modal-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 28px;
  line-height: 1.6;
}

.login-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.modal-btn.secondary {
  background: #f0f0f0;
  color: #666;
}

.modal-btn.secondary:hover {
  background: #e0e0e0;
  color: #333;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #1DCD9F 0%, #169976 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.3);
}

.modal-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(29, 205, 159, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: 200px 1fr 280px;
    gap: 20px;
    padding: 20px 40px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 1024px) {
  .main-container {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 24px;
  }

  .sidebar,
  .right-sidebar {
    display: none;
  }

  .search-container {
    max-width: none;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 12px 16px;
  }

  .tab-nav {
    padding: 12px 16px;
  }

  .tab-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .search-container {
    max-width: none;
  }

  .search-input {
    font-size: 13px;
    padding: 11px 36px 11px 44px;
  }

  .action-section {
    justify-content: stretch;
  }

  .create-product-btn {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
  }

  .feed-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .sort-options {
    justify-content: flex-start;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .sort-options::-webkit-scrollbar {
    height: 4px;
  }

  .sort-options::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 2px;
  }

  .result-count {
    text-align: center;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 16px;
    gap: 12px;
  }

  .product-image {
    height: 160px;
  }

  .pagination {
    padding: 20px 16px;
    gap: 4px;
  }

  .page-btn,
  .page-nav-btn {
    min-width: 32px;
    height: 32px;
    font-size: 13px;
  }
}

@media (max-width: 640px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-image {
    height: 220px;
  }

  .login-modal-content {
    padding: 32px 24px;
  }

  .modal-btn {
    flex: 1;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .main-container {
    padding: 8px 12px;
  }

  .tab-nav {
    padding: 10px 12px;
  }

  .search-input {
    font-size: 12px;
    padding: 10px 32px 10px 40px;
  }

  .search-icon {
    left: 14px;
    font-size: 16px;
  }

  .create-product-btn {
    font-size: 13px;
    padding: 10px 16px;
  }

  .btn-icon {
    font-size: 14px;
  }

  .products-grid {
    padding: 12px;
  }

  .product-name {
    font-size: 13px;
  }
}
</style>