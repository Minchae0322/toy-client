<template>
  <div class="admin-container">
    <!-- 사이드바 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">Admin</h1>
      </div>
      <nav class="sidebar-nav">
        <a href="#" class="nav-item active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          상품 관리
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          사용자 관리
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          리뷰 관리
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          통계
        </a>
      </nav>
    </aside>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <!-- 헤더 -->
      <header class="page-header">
        <div class="header-left">
          <h2>상품 관리</h2>
          <p class="header-desc">등록된 상품을 검토하고 관리합니다</p>
        </div>
        <div class="header-right">
          <span class="admin-badge">관리자</span>
        </div>
      </header>

      <!-- 필터 & 검색 -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <button
              v-for="tab in statusTabs"
              :key="tab.value"
              :class="['tab-btn', { active: selectedStatus === tab.value }]"
              @click="handleStatusChange(tab.value)"
          >
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
        <div class="filter-actions">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
                v-model="searchKeyword"
                type="text"
                placeholder="상품명, 브랜드 검색..."
                @keyup.enter="handleSearch"
            />
          </div>
          <select v-model="selectedSort" class="sort-select" @change="handleSortChange">
            <option value="createdAt,DESC">최신순</option>
            <option value="createdAt,ASC">오래된순</option>
            <option value="name,ASC">이름순</option>
            <option value="popularityScore,DESC">인기순</option>
          </select>
        </div>
      </div>

      <!-- 벌크 액션 바 -->
      <div v-if="selectedProducts.length > 0" class="bulk-action-bar">
        <span class="selected-count">{{ selectedProducts.length }}개 선택됨</span>
        <div class="bulk-actions">
          <button class="bulk-btn approve" @click="bulkApprove">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            일괄 승인
          </button>
          <button class="bulk-btn reject" @click="bulkReject">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            일괄 거부
          </button>
          <button class="bulk-btn delete" @click="bulkDelete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            삭제
          </button>
        </div>
      </div>

      <!-- 상품 테이블 -->
      <div class="table-container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>불러오는 중...</p>
        </div>

        <div v-else-if="!products.length" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <p>등록된 상품이 없습니다</p>
        </div>

        <table v-else class="product-table">
          <thead>
          <tr>
            <th class="col-check">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
            </th>
            <th class="col-product">상품 정보</th>
            <th class="col-category">카테고리</th>
            <th class="col-stats">통계</th>
            <th class="col-status">상태</th>
            <th class="col-date">등록일</th>
            <th class="col-actions">관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="product in products" :key="product.id" :class="{ selected: selectedProducts.includes(product.id) }">
            <td class="col-check">
              <input type="checkbox" :checked="selectedProducts.includes(product.id)" @change="toggleSelect(product.id)" />
            </td>
            <td class="col-product">
              <div class="product-info">
                <img :src="getThumbnailUrl(product)" :alt="product.name" class="product-thumb" />
                <div class="product-details">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-brand">{{ product.brand }}</span>
                </div>
              </div>
            </td>
            <td class="col-category">
              <span class="category-tag">{{ product.categoryName || '미분류' }}</span>
            </td>
            <td class="col-stats">
              <div class="stats-grid">
                  <span class="stat-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ formatCount(product.viewCount) }}
                  </span>
                <span class="stat-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff6b6b" stroke="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {{ formatCount(product.likeCount) }}
                  </span>
                <span class="stat-item">
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="#fbbf24">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {{ formatRating(product.averageRating) }}
                  </span>
              </div>
            </td>
            <td class="col-status">
                <span :class="['status-badge', getStatusClass(product.status)]">
                  {{ getStatusLabel(product.status) }}
                </span>
            </td>
            <td class="col-date">
              {{ formatDate(product.createdAt) }}
            </td>
            <td class="col-actions">
              <div class="action-buttons">
                <button class="action-btn view" title="상세보기" @click="viewProduct(product)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button v-if="product.status === 'PENDING'" class="action-btn approve" title="승인" @click="approveProduct(product)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <button v-if="product.status === 'PENDING'" class="action-btn reject" title="거부" @click="rejectProduct(product)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                <button class="action-btn delete" title="삭제" @click="deleteProduct(product)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 0" @click="goToPage(currentPage - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="page-ellipsis">...</span>
          <button v-else :class="['page-btn', { active: page === currentPage }]" @click="goToPage(page)">
            {{ page + 1 }}
          </button>
        </template>
        <button class="page-btn" :disabled="currentPage >= totalPages - 1" @click="goToPage(currentPage + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </main>

    <!-- 상세 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>상품 상세</h3>
          <button class="modal-close" @click="closeDetailModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div v-if="selectedProduct" class="modal-body">
          <div class="detail-image">
            <img :src="getThumbnailUrl(selectedProduct)" :alt="selectedProduct.name" />
          </div>
          <div class="detail-info">
            <div class="detail-row">
              <label>상품명</label>
              <span>{{ selectedProduct.name }}</span>
            </div>
            <div class="detail-row">
              <label>브랜드</label>
              <span>{{ selectedProduct.brand }}</span>
            </div>
            <div class="detail-row">
              <label>카테고리</label>
              <span>{{ selectedProduct.categoryName || '미분류' }}</span>
            </div>
            <div class="detail-row">
              <label>가격</label>
              <span>{{ formatPrice(selectedProduct.price) }}</span>
            </div>
            <div class="detail-row">
              <label>상태</label>
              <span :class="['status-badge', getStatusClass(selectedProduct.status)]">
                {{ getStatusLabel(selectedProduct.status) }}
              </span>
            </div>
            <div class="detail-row full">
              <label>설명</label>
              <p>{{ selectedProduct.description || '설명 없음' }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="selectedProduct?.status === 'PENDING'" class="modal-btn approve" @click="approveProduct(selectedProduct); closeDetailModal()">
            승인
          </button>
          <button v-if="selectedProduct?.status === 'PENDING'" class="modal-btn reject" @click="rejectProduct(selectedProduct); closeDetailModal()">
            거부
          </button>
          <button class="modal-btn secondary" @click="closeDetailModal">닫기</button>
        </div>
      </div>
    </div>

    <!-- 토스트 알림 -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
// import { productService } from '@/services/ProductService.js'

const DEFAULT_THUMBNAIL = 'https://picsum.photos/200'

// 상태
const products = ref([])
const loading = ref(false)
const currentPage = ref(0)
const pageSize = 15
const totalElements = ref(0)
const totalPages = ref(0)

const selectedStatus = ref(null)
const selectedSort = ref('createdAt,DESC')
const searchKeyword = ref('')
const selectedProducts = ref([])

const showDetailModal = ref(false)
const selectedProduct = ref(null)

const toast = ref({ show: false, message: '', type: 'success' })

// 상태별 탭
const statusTabs = ref([
  { value: null, label: '전체', count: 0 },
  { value: 'PENDING', label: '대기중', count: 0 },
  { value: 'APPROVED', label: '승인됨', count: 0 },
  { value: 'REJECTED', label: '거부됨', count: 0 }
])

// Computed
const isAllSelected = computed(() => {
  return products.value.length > 0 && selectedProducts.value.length === products.value.length
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 0; i < total; i++) pages.push(i)
  } else {
    pages.push(0)
    if (current > 3) pages.push('...')
    for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 4) pages.push('...')
    pages.push(total - 1)
  }
  return pages
})

// 유틸리티
const getThumbnailUrl = (product) => product.thumbnailDto?.filePath || DEFAULT_THUMBNAIL

const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 10000) return Math.floor(count / 10000) + '만'
  if (count >= 1000) return Math.floor(count / 1000) + 'k'
  return count.toString()
}

const formatRating = (rating) => rating ? rating.toFixed(1) : '0.0'

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
}

const formatPrice = (price) => {
  if (!price || price === 0) return '무료'
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

const getStatusClass = (status) => ({
  'PENDING': 'pending',
  'APPROVED': 'approved',
  'REJECTED': 'rejected',
  'DELETED': 'deleted'
}[status] || 'pending')

const getStatusLabel = (status) => ({
  'PENDING': '대기중',
  'APPROVED': '승인됨',
  'REJECTED': '거부됨',
  'DELETED': '삭제됨'
}[status] || '알 수 없음')

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// API 호출 (Mock)
const fetchProducts = async () => {
  loading.value = true
  try {
    // 실제 구현시 productService.getProducts() 호출
    // Mock 데이터
    await new Promise(r => setTimeout(r, 500))

    const mockProducts = Array.from({ length: 15 }, (_, i) => ({
      id: currentPage.value * 15 + i + 1,
      name: `상품 ${currentPage.value * 15 + i + 1}`,
      brand: ['Apple', 'Samsung', 'LG', 'Sony'][i % 4],
      categoryName: ['전자기기', '의류', '식품', '가구'][i % 4],
      viewCount: Math.floor(Math.random() * 10000),
      likeCount: Math.floor(Math.random() * 1000),
      averageRating: (Math.random() * 2 + 3).toFixed(1),
      status: ['PENDING', 'APPROVED', 'REJECTED'][i % 3],
      price: Math.floor(Math.random() * 500000),
      description: '상품 설명입니다.',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }))

    products.value = selectedStatus.value
        ? mockProducts.filter(p => p.status === selectedStatus.value)
        : mockProducts

    totalElements.value = 150
    totalPages.value = 10

    // 상태별 카운트 업데이트
    statusTabs.value[0].count = 150
    statusTabs.value[1].count = 50
    statusTabs.value[2].count = 80
    statusTabs.value[3].count = 20

  } catch (e) {
    console.error('상품 로드 실패:', e)
    showToast('상품 목록을 불러오는데 실패했습니다', 'error')
  } finally {
    loading.value = false
  }
}

// 핸들러
const handleStatusChange = (status) => {
  selectedStatus.value = status
  currentPage.value = 0
  selectedProducts.value = []
  fetchProducts()
}

const handleSortChange = () => {
  currentPage.value = 0
  fetchProducts()
}

const handleSearch = () => {
  currentPage.value = 0
  fetchProducts()
}

const goToPage = (page) => {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  selectedProducts.value = []
  fetchProducts()
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedProducts.value = []
  } else {
    selectedProducts.value = products.value.map(p => p.id)
  }
}

const toggleSelect = (id) => {
  const index = selectedProducts.value.indexOf(id)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(id)
  }
}

const viewProduct = (product) => {
  selectedProduct.value = product
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedProduct.value = null
}

const approveProduct = async (product) => {
  // API 호출
  product.status = 'APPROVED'
  showToast(`"${product.name}" 승인 완료`)
}

const rejectProduct = async (product) => {
  product.status = 'REJECTED'
  showToast(`"${product.name}" 거부 처리됨`, 'warning')
}

const deleteProduct = async (product) => {
  if (!confirm(`"${product.name}"을(를) 삭제하시겠습니까?`)) return
  products.value = products.value.filter(p => p.id !== product.id)
  showToast('삭제 완료')
}

const bulkApprove = () => {
  products.value.forEach(p => {
    if (selectedProducts.value.includes(p.id)) p.status = 'APPROVED'
  })
  showToast(`${selectedProducts.value.length}개 상품 승인 완료`)
  selectedProducts.value = []
}

const bulkReject = () => {
  products.value.forEach(p => {
    if (selectedProducts.value.includes(p.id)) p.status = 'REJECTED'
  })
  showToast(`${selectedProducts.value.length}개 상품 거부 처리됨`, 'warning')
  selectedProducts.value = []
}

const bulkDelete = () => {
  if (!confirm(`${selectedProducts.value.length}개 상품을 삭제하시겠습니까?`)) return
  products.value = products.value.filter(p => !selectedProducts.value.includes(p.id))
  showToast('삭제 완료')
  selectedProducts.value = []
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
* { box-sizing: border-box; }

.admin-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  color: #333;
}

/* 사이드바 */
.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: #fff;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.sidebar-nav { padding: 16px 12px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.15s;
  margin-bottom: 4px;
}

.nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.nav-item.active { background: rgba(124, 58, 237, 0.3); color: #fff; }

/* 메인 콘텐츠 */
.main-content {
  flex: 1;
  padding: 24px 32px;
  overflow-x: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h2 { font-size: 24px; font-weight: 600; margin: 0 0 4px; }
.header-desc { font-size: 14px; color: #888; margin: 0; }

.admin-badge {
  background: #7c3aed;
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* 필터 바 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-tabs { display: flex; gap: 8px; }

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn:hover { border-color: #7c3aed; }
.tab-btn.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }
.tab-count { font-size: 11px; opacity: 0.7; }

.filter-actions { display: flex; gap: 12px; }

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 13px;
  width: 200px;
}

.sort-select {
  padding: 8px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
}

/* 벌크 액션 */
.bulk-action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #f0f0ff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.selected-count { font-size: 13px; font-weight: 500; color: #7c3aed; }
.bulk-actions { display: flex; gap: 8px; margin-left: auto; }

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.bulk-btn:hover { opacity: 0.85; }
.bulk-btn.approve { background: #10b981; color: #fff; }
.bulk-btn.reject { background: #f59e0b; color: #fff; }
.bulk-btn.delete { background: #ef4444; color: #fff; }

/* 테이블 */
.table-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th,
.product-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.product-table th {
  background: #fafafa;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.product-table tr:hover { background: #fafafa; }
.product-table tr.selected { background: #f5f3ff; }

.col-check { width: 40px; }
.col-product { min-width: 250px; }
.col-category { width: 100px; }
.col-stats { width: 160px; }
.col-status { width: 80px; }
.col-date { width: 100px; }
.col-actions { width: 120px; }

.product-info { display: flex; align-items: center; gap: 12px; }

.product-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.product-name {
  display: block;
  font-weight: 500;
  font-size: 14px;
  color: #111;
}

.product-brand {
  font-size: 12px;
  color: #888;
}

.category-tag {
  display: inline-block;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.stats-grid { display: flex; gap: 12px; }

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.approved { background: #d1fae5; color: #065f46; }
.status-badge.rejected { background: #fee2e2; color: #991b1b; }
.status-badge.deleted { background: #f3f4f6; color: #6b7280; }

.action-buttons { display: flex; gap: 6px; }

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  background: #f5f5f5;
}

.action-btn:hover { transform: scale(1.05); }
.action-btn.view { color: #666; }
.action-btn.view:hover { background: #e5e5e5; }
.action-btn.approve { color: #10b981; }
.action-btn.approve:hover { background: #d1fae5; }
.action-btn.reject { color: #f59e0b; }
.action-btn.reject:hover { background: #fef3c7; }
.action-btn.delete { color: #ef4444; }
.action-btn.delete:hover { background: #fee2e2; }

/* 로딩 & 빈 상태 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #999;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #eee;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 24px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e5e5;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) { border-color: #7c3aed; color: #7c3aed; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }
.page-ellipsis { padding: 0 8px; color: #999; }

/* 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 { margin: 0; font-size: 18px; }

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
}

.modal-body { padding: 24px; }

.detail-image {
  margin-bottom: 20px;
}

.detail-image img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
  background: #f5f5f5;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
}

.detail-row label {
  width: 80px;
  font-size: 13px;
  color: #888;
  flex-shrink: 0;
}

.detail-row span,
.detail-row p {
  font-size: 14px;
  color: #333;
  margin: 0;
}

.detail-row.full {
  flex-direction: column;
  gap: 8px;
}

.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.modal-btn:hover { opacity: 0.85; }
.modal-btn.approve { background: #10b981; color: #fff; }
.modal-btn.reject { background: #f59e0b; color: #fff; }
.modal-btn.secondary { background: #f0f0f0; color: #666; }

/* 토스트 */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  z-index: 2000;
  animation: slideUp 0.3s ease;
}

.toast.success { background: #10b981; }
.toast.warning { background: #f59e0b; }
.toast.error { background: #ef4444; }

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 반응형 */
@media (max-width: 1024px) {
  .sidebar { display: none; }
  .main-content { padding: 16px; }
  .col-stats, .col-date { display: none; }
}

@media (max-width: 768px) {
  .filter-bar { flex-direction: column; align-items: stretch; }
  .filter-tabs { overflow-x: auto; }
  .search-box input { width: 140px; }
}
</style>