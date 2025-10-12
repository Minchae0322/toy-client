<template>
  <div class="product-list-view">
    <div class="main-container">
      <!-- 왼쪽 사이드바 -->
      <CategorySidebar
          :categories="categories"
          :selected-category-id="searchCondition.categoryId"
          :filters="filters"
          :is-logged-in="isLoggedIn"
          @select-category="selectCategory"
          @toggle-filter="toggleFilter"
          @go-to-my-products="goToMyProducts"
          @go-to-liked-products="goToLikedProducts"
          @go-to-my-reviews="goToMyReviews"
      />

      <!-- 메인 콘텐츠 -->
      <main class="main-content">
        <!-- 검색 및 액션 -->
        <SearchHeader
            v-model:keyword="searchCondition.keyword"
            :is-logged-in="isLoggedIn"
            @search="handleSearch"
            @clear="clearSearch"
        />

        <!-- 피드 헤더 -->
        <FeedHeader
            :sort-options="sortOptions"
            :current-sort="pageable.sort"
            :total-elements="totalElements"
            @set-sort="setSortOption"
        />

        <!-- 로딩 상태 -->
        <LoadingState v-if="loading" />

        <!-- 에러 상태 -->
        <ErrorState v-else-if="error" :error="error" @retry="loadProducts" />

        <!-- 빈 결과 -->
        <EmptyState v-else-if="products.length === 0" @clear="clearSearch" />

        <!-- 상품 그리드 -->
        <ProductGrid
            v-else
            :products="products"
            :liked-products="likedProducts"
            @like="handleLikeAction"
            @view-product="goToProductDetail"
        />

        <!-- 페이지네이션 -->
        <Pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            :visible-pages="visiblePages"
            @go-to-page="goToPage"
        />
      </main>

      <!-- 오른쪽 사이드바 -->
      <RightSidebar
          :top-products="topProducts"
          :nearby-products="nearbyProducts"
          :user-stats="userStats"
          :category-stats="categoryStats"
          :is-logged-in="isLoggedIn"
          @view-product="goToProductDetail"
      />
    </div>

    <!-- 로그인 모달 -->
    <LoginModal
        v-if="showLoginModal"
        @close="closeLoginModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { productService, productFilterUtils } from '@/services/productService.js'
import { useCategory } from '@/services/CategoryService.js'

// 컴포넌트 임포트
import CategorySidebar from '@/components/product/CategorySidebar.vue'
import SearchHeader from '@/components/product/SearchHeader.vue'
import FeedHeader from '@/components/product/FeedHeader.vue'
import LoadingState from '@/components/product/LoadingState.vue'
import ErrorState from '@/components/product/ErrorState.vue'
import EmptyState from '@/components/product/EmptyState.vue'
import ProductGrid from '@/components/product/ProductGrid.vue'
import Pagination from '@/components/product/Pagination.vue'
import RightSidebar from '@/components/product/RightSidebar.vue'
import LoginModal from '@/components/product/LoginModal.vue'

const router = useRouter()
const { isLoggedIn, userId } = useAuth()
const { getCategories, sortCategories } = useCategory()

// 상태 관리
const loading = ref(false)
const error = ref(null)
const products = ref([])
const categories = ref([])
const categoryStats = ref([])
const topProducts = ref([])
const nearbyProducts = ref([])
const likedProducts = ref(new Set())
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

// 메서드
const clearSearch = () => {
  searchCondition.keyword = ''
  handleSearch()
}

const handleLikeAction = async (productId) => {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }
  await toggleLike(productId)
}

const closeLoginModal = () => {
  showLoginModal.value = false
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
    }
  } catch (err) {
    console.error('카테고리 통계 생성 실패:', err)
  }
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

const selectCategory = (categoryId) => {
  searchCondition.categoryId = categoryId
  pageable.page = 0
  currentPage.value = 0
  loadProducts()
}

const toggleFilter = (filterType) => {
  filters[filterType] = !filters[filterType]
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

const goToMyProducts = () => {
  if (isLoggedIn.value) router.push('/my/products')
}

const goToLikedProducts = () => {
  if (isLoggedIn.value) router.push('/my/liked')
}

const goToMyReviews = () => {
  if (isLoggedIn.value) router.push('/my/reviews')
}

// 라이프사이클
onMounted(async () => {
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
  }
})
</script>

<style scoped>
.product-list-view {
  background: #FAFAFA;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  gap: 24px;
}

.main-content {
  min-height: 600px;
}

@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: 220px 1fr 280px;
    gap: 20px;
  }
}

@media (max-width: 1024px) {
  .main-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .main-container {
    padding: 12px;
  }
}
</style>