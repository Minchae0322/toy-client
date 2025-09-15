<template>
  <div class="product-list-container">
    <!-- 헤더 섹션 -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">제품 목록</h1>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-number">{{ totalProducts }}</span>
            <span class="stat-label">전체 제품</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ newProductsCount }}</span>
            <span class="stat-label">신제품</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalLikes }}</span>
            <span class="stat-label">총 찜하기</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 사이드바 - 검색 및 필터 -->
      <div class="sidebar">
        <div class="search-section">
          <div class="search-input-container">
            <Search :size="20" class="search-icon" />
            <input
                v-model="searchQuery"
                type="text"
                placeholder="제품명, 브랜드 검색..."
                class="search-input"
                @input="handleSearchInput"
            />
          </div>
        </div>

        <!-- 카테고리 필터 -->
        <div class="filter-section">
          <h3 class="filter-title">카테고리</h3>
          <div class="filter-options">
            <button
                @click="setActiveFilter(null)"
                :class="['filter-option', { active: activeFilter === null }]"
            >
              <span class="filter-icon">🔄</span>
              <span class="filter-text">전체</span>
            </button>
            <button
                v-for="category in categories"
                :key="category.id"
                @click="setActiveFilter('category', category.id)"
                :class="['filter-option', { active: activeFilter?.type === 'category' && activeFilter?.value === category.id }]"
            >
              <span class="filter-icon">{{ getCategoryIcon(category.name) }}</span>
              <span class="filter-text">{{ category.name }}</span>
            </button>
          </div>
        </div>

        <!-- 브랜드 필터 -->
        <div class="filter-section">
          <h3 class="filter-title">브랜드</h3>
          <div class="filter-options">
            <button
                v-for="brand in popularBrands"
                :key="brand"
                @click="setActiveFilter('brand', brand)"
                :class="['filter-option', { active: activeFilter?.type === 'brand' && activeFilter?.value === brand }]"
            >
              <span class="filter-icon">🏢</span>
              <span class="filter-text">{{ brand }}</span>
            </button>
          </div>
        </div>

        <!-- 정렬 옵션 -->
        <div class="filter-section">
          <h3 class="filter-title">정렬</h3>
          <div class="sort-options">
            <label
                v-for="option in sortOptions"
                :key="option.value"
                :class="['sort-option', { active: sortBy === option.value }]"
            >
              <input
                  type="radio"
                  :value="option.value"
                  v-model="sortBy"
                  @change="handleSortChange"
              />
              <span class="sort-text">{{ option.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 메인 컨텐츠 영역 -->
      <div class="content-area">
        <!-- 툴바 -->
        <div class="toolbar">
          <div class="results-info">
            <span v-if="!loading">{{ totalProducts }}개 제품</span>
            <span v-if="activeFilter" class="filter-info">
              • {{ getFilterText() }}
            </span>
          </div>

          <div class="view-controls">
            <button
                @click="viewMode = 'grid'"
                :class="['view-btn', { active: viewMode === 'grid' }]"
            >
              <Grid3X3 :size="16" />
            </button>
            <button
                @click="viewMode = 'list'"
                :class="['view-btn', { active: viewMode === 'list' }]"
            >
              <List :size="16" />
            </button>
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="initialLoading" class="loading-container">
          <div class="spinner"></div>
          <p>제품을 불러오는 중...</p>
        </div>

        <!-- 제품 목록 -->
        <div v-else-if="products.length > 0" :class="['products-container', viewMode]">
          <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              :view-mode="viewMode"
              @view-detail="viewProductDetail"
              @toggle-like="handleToggleLike"
          />
        </div>

        <!-- 빈 상태 -->
        <div v-else class="empty-state">
          <Package :size="64" class="empty-icon" />
          <h3>제품이 없습니다</h3>
          <p v-if="searchQuery">
            "{{ searchQuery }}"에 대한 검색 결과가 없습니다.
          </p>
          <p v-else-if="activeFilter">
            해당 조건에 맞는 제품이 없습니다.
          </p>
          <p v-else>
            아직 등록된 제품이 없습니다.
          </p>
        </div>

        <!-- 더 보기 버튼 -->
        <div v-if="hasMore && !loading" class="load-more-container">
          <button @click="loadMore" class="load-more-btn">
            더 많은 제품 보기
          </button>
        </div>

        <!-- 로딩 더보기 -->
        <div v-if="loading && !initialLoading" class="loading-more">
          <div class="spinner-small"></div>
          <span>더 많은 제품을 불러오는 중...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Grid3X3, List, Package } from 'lucide-vue-next'
import ProductCard from '@/components/product/ProductCard.vue'
import { useProduct } from '@/services/ProductService.js'
import { useAuth } from '@/composables/useAuth.js'

// 라우터
const router = useRouter()

// Composables
const { getList, getDetail, toggleLike, incrementView } = useProduct()
const { isLoggedIn } = useAuth()

// 반응형 상태
const products = ref([])
const searchQuery = ref('')
const activeFilter = ref(null)
const sortBy = ref('release')
const viewMode = ref('grid')
const loading = ref(false)
const initialLoading = ref(true)
const hasMore = ref(true)

// 페이징 상태
const currentPage = ref(0)
const pageSize = ref(12)
const totalProducts = ref(0)

// 카테고리 및 브랜드 데이터
const categories = ref([])
const popularBrands = ref([])

// 정렬 옵션
const sortOptions = [
  { value: 'release', label: '최신 출시순' },
  { value: 'latest', label: '등록순' },
  { value: 'popular', label: '인기순 (찜하기)' },
  { value: 'views', label: '조회수순' },
  { value: 'rating', label: '평점순' },
  { value: 'name', label: '이름순' }
]

// 검색 디바운스 타이머
let searchTimeout = null

// 계산된 속성
const newProductsCount = computed(() => {
  return products.value.filter(product => product.isNew).length
})

const totalLikes = computed(() => {
  return products.value.reduce((sum, product) => sum + (product.likeCount || 0), 0)
})

// 메서드
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    '피규어': '🤖',
    '프라모델': '✈️',
    '게임': '🎮',
    '만화': '📚',
    '음식': '🍽️',
    '의류': '👕',
    '전자제품': '📱',
    '완구': '🧸',
    '스포츠': '⚽',
    '뷰티': '💄'
  }
  return iconMap[categoryName] || '📦'
}

const getFilterText = () => {
  if (!activeFilter.value) return ''

  if (activeFilter.value.type === 'category') {
    const category = categories.value.find(c => c.id === activeFilter.value.value)
    return `카테고리: ${category?.name || '알 수 없음'}`
  }

  if (activeFilter.value.type === 'brand') {
    return `브랜드: ${activeFilter.value.value}`
  }

  return ''
}

const setActiveFilter = (type, value) => {
  if (type === null) {
    activeFilter.value = null
  } else {
    activeFilter.value = { type, value }
  }
  resetAndFetch()
}

const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    resetAndFetch()
  }, 300)
}

const handleSortChange = () => {
  resetAndFetch()
}

const buildSearchCondition = () => {
  const condition = {
    status: 'APPROVED' // 승인된 제품만
  }

  if (searchQuery.value.trim()) {
    condition.keyword = searchQuery.value.trim()
  }

  if (activeFilter.value?.type === 'category') {
    condition.categoryId = activeFilter.value.value
  }

  if (activeFilter.value?.type === 'brand') {
    condition.brand = activeFilter.value.value
  }

  return condition
}

const buildPageable = (page = 0) => {
  const sortMap = {
    'latest': 'createdAt,DESC',
    'release': 'releaseDate,DESC',
    'popular': 'likeCount,DESC',
    'views': 'viewCount,DESC',
    'rating': 'averageRating,DESC',
    'name': 'name,ASC'
  }

  return {
    page,
    size: pageSize.value,
    sort: sortMap[sortBy.value] || 'releaseDate,DESC'
  }
}

const fetchProducts = async (page = 0, append = false) => {
  if (loading.value) return

  loading.value = true

  try {
    const searchCondition = buildSearchCondition()
    const pageable = buildPageable(page)

    console.log('API 요청:', { searchCondition, pageable })

    const result = await getList(searchCondition, pageable)

    if (result.success) {
      const pageData = result.data
      const newProducts = pageData.content || []

      // 제품 데이터 변환
      const transformedProducts = newProducts.map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        viewCount: product.viewCount || 0,
        likeCount: product.likeCount || 0,
        averageRating: product.averageRating || 0,
        reviewCount: product.reviewCount || 0,
        categoryName: product.categoryName,
        thumbnailUrl: product.thumbnailUrl || '',
        releaseDate: product.releaseDate,
        createdAt: product.createdAt,
        isNew: isNewProduct(product.releaseDate),
        isLiked: false, // 추후 개별 조회 필요
        displayPrice: formatPrice(product.price)
      }))

      if (append) {
        products.value = [...products.value, ...transformedProducts]
      } else {
        products.value = transformedProducts
      }

      // 페이징 정보 업데이트
      currentPage.value = pageData.number || 0
      totalProducts.value = pageData.totalElements || 0
      hasMore.value = !pageData.last

      console.log(`제품 로드 완료: ${transformedProducts.length}개, 총 ${totalProducts.value}개`)

    } else {
      throw new Error(result.error || '제품 조회에 실패했습니다')
    }

  } catch (error) {
    console.error('제품 데이터 로딩 실패:', error)

    if (!append) {
      products.value = []
      totalProducts.value = 0
      hasMore.value = false
    }

    // 사용자에게 에러 알림
    if (error.message.includes('401') || error.message.includes('auth')) {
      alert('로그인이 필요합니다.')
      router.push('/login')
    } else {
      alert('제품을 불러오는 중 오류가 발생했습니다.')
    }

  } finally {
    loading.value = false
    initialLoading.value = false
  }
}

const isNewProduct = (releaseDate) => {
  if (!releaseDate) return false

  const release = new Date(releaseDate)
  const now = new Date()
  const diffDays = (now - release) / (1000 * 60 * 60 * 24)

  return diffDays <= 30
}

const formatPrice = (price) => {
  if (!price || price === '0') return '무료'

  const numPrice = parseInt(price.replace(/[^0-9]/g, ''))
  if (!isNaN(numPrice)) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(numPrice)
  }

  return price
}

const resetAndFetch = () => {
  if (loading.value) return

  currentPage.value = 0
  products.value = []
  hasMore.value = true
  fetchProducts(0, false)
}

const loadMore = async () => {
  if (!hasMore.value || loading.value) return

  const nextPage = currentPage.value + 1
  await fetchProducts(nextPage, true)
}

const viewProductDetail = async (product) => {
  try {
    // 조회수 증가
    await incrementView(product.id)

    // 상세 페이지로 이동
    await router.push({
      name: 'ProductDetail',
      params: { id: product.id }
    })
  } catch (error) {
    console.error('제품 상세 이동 실패:', error)

    // 대안: 직접 URL 이동
    router.push(`/products/${product.id}`)
  }
}

const handleToggleLike = async (product) => {
  if (!isLoggedIn.value) {
    alert('로그인 후 이용해주세요.')
    router.push('/login')
    return
  }

  try {
    const result = await toggleLike(product.id)

    if (result.success) {
      // 로컬 상태 업데이트
      const productIndex = products.value.findIndex(p => p.id === product.id)
      if (productIndex !== -1) {
        const updatedProduct = products.value[productIndex]
        updatedProduct.isLiked = !updatedProduct.isLiked
        updatedProduct.likeCount += updatedProduct.isLiked ? 1 : -1
      }
    } else {
      throw new Error(result.error || '찜하기 실패')
    }

  } catch (error) {
    console.error('찜하기 실패:', error)
    alert('찜하기 처리 중 오류가 발생했습니다.')
  }
}

const fetchCategories = async () => {
  try {
    // 카테고리 목록 조회 (별도 API 필요)
    // 임시로 하드코딩된 데이터 사용
    categories.value = [
      { id: 1, name: '피규어' },
      { id: 2, name: '프라모델' },
      { id: 3, name: '게임' },
      { id: 4, name: '만화' },
      { id: 5, name: '음식' }
    ]

    // 인기 브랜드도 임시 데이터
    popularBrands.value = ['반다이', '코토부키야', '굿스마일', '맥팔레인', '핫토이즈']

  } catch (error) {
    console.error('카테고리 로딩 실패:', error)
    categories.value = []
    popularBrands.value = []
  }
}

// 감시자
watch(searchQuery, () => {
  handleSearchInput()
})

watch(sortBy, () => {
  handleSortChange()
})

// 라이프사이클
onMounted(async () => {
  console.log('ProductListView 마운트')

  // 카테고리 먼저 로드
  await fetchCategories()

  // 제품 목록 로드
  await fetchProducts()
})
</script>

<style scoped>
.product-list-container {
  min-height: 100vh;
  background: #f8fafc;
}

.header-section {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 2rem;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.search-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-input-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.filter-option:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.filter-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

.filter-icon {
  font-size: 1.25rem;
}

.filter-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.sort-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sort-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.sort-option:hover {
  background: #f8fafc;
}

.sort-option.active {
  background: #eff6ff;
  color: #1d4ed8;
}

.sort-option input[type="radio"] {
  margin: 0;
}

.sort-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.content-area {
  flex: 1;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.results-info {
  font-size: 0.875rem;
  color: #64748b;
}

.filter-info {
  color: #3b82f6;
  font-weight: 500;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  border-color: #cbd5e1;
}

.view-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.products-container {
  display: grid;
  gap: 1.5rem;
}

.products-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.products-container.list {
  grid-template-columns: 1fr;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.load-more-container {
  text-align: center;
  margin-top: 2rem;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #2563eb;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 반응형 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    padding: 1rem;
  }

  .sidebar {
    width: 100%;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .products-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .toolbar {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>