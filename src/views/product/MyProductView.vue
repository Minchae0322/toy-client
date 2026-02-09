<template>
  <div class="my-products">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-inner">
        <div class="header-text">
          <h1>내 상품</h1>
          <p>등록한 상품을 관리하세요</p>
        </div>
        <button class="btn-add" @click="$router.push('/products/register')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          새 상품 등록
        </button>
      </div>
    </header>

    <main class="main">
      <!-- 통계 + 필터 -->
      <div class="toolbar">
        <div class="stats-inline">
          <div v-for="stat in statsList" :key="stat.label" class="stat-item">
            <span class="stat-dot" :style="{ background: stat.color }"></span>
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        </div>
        <div class="filter-tabs">
          <button
              v-for="tab in statusTabs"
              :key="tab.value"
              :class="['tab-btn', { active: selectedStatus === tab.value }]"
              @click="handleStatusChange(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 테이블 -->
      <div class="table-wrapper">
        <!-- 테이블 헤더 -->
        <div class="table-header">
          <span class="col-product">상품</span>
          <span class="col-price">가격</span>
          <span class="col-views">조회</span>
          <span class="col-likes">좋아요</span>
          <span class="col-status">상태</span>
          <span class="col-actions">관리</span>
        </div>

        <!-- 로딩 -->
        <div v-if="loading" class="empty-state">
          <div class="spinner"></div>
          <p>불러오는 중...</p>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="!products.length" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <p class="empty-title">등록된 상품이 없습니다</p>
          <p class="empty-desc">새 상품을 등록해보세요</p>
        </div>

        <!-- 상품 리스트 -->
        <div v-else class="table-body">
          <div v-for="(product, idx) in products" :key="product.id" class="table-row-wrapper">
            <div class="table-row">
              <!-- 상품 정보 -->
              <div class="col-product">
                <img :src="getThumbnailUrl(product)" :alt="product.name" class="product-thumb" />
                <div class="product-info">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-meta">{{ product.brand }} · {{ formatDate(product.createdAt) }}</span>
                </div>
              </div>

              <!-- 가격 -->
              <div class="col-price">{{ formatPrice(product.price) }}</div>

              <!-- 조회수 -->
              <div class="col-views">{{ formatCount(product.viewCount) }}</div>

              <!-- 좋아요 -->
              <div class="col-likes">{{ formatCount(product.likeCount) }}</div>

              <!-- 상태 -->
              <div class="col-status">
                <span :class="['status-badge', getStatusClass(product.status)]">
                  {{ getStatusLabel(product.status) }}
                </span>
              </div>

              <!-- 관리 -->
              <div class="col-actions">
                <button class="action-btn" title="수정" @click="editProduct(product)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="action-btn" title="삭제" @click="deleteProduct(product)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 반려 사유 -->
            <div v-if="getStatusValue(product.status) === 'REJECTED'" class="reject-reason">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              반려 사유: {{ product.rejectReason || '사유가 명시되지 않았습니다' }}
            </div>

            <!-- 구분선 -->
            <div v-if="idx < products.length - 1" class="divider"></div>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
            class="page-btn"
            :disabled="currentPage === 0"
            @click="goToPage(currentPage - 1)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="page-ellipsis">...</span>
          <button
              v-else
              :class="['page-btn', { active: page === currentPage }]"
              @click="goToPage(page)"
          >
            {{ page + 1 }}
          </button>
        </template>
        <button
            class="page-btn"
            :disabled="currentPage >= totalPages - 1"
            @click="goToPage(currentPage + 1)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </main>

    <!-- 토스트 -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '@/services/ProductService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const router = useRouter()
const { open } = useConfirmDialog()
const DEFAULT_THUMBNAIL = 'https://picsum.photos/200'

// 상태
const products = ref([])
const loading = ref(false)
const currentPage = ref(0)
const pageSize = 15
const totalElements = ref(0)
const totalPages = ref(0)
const selectedStatus = ref(null)

const toast = ref({ show: false, message: '', type: 'success' })

// 통계
const stats = ref({ total: 0, pending: 0, approved: 0, rejected: 0 })

const statsList = computed(() => [
  { label: '전체', value: stats.value.total, color: '#6366F1' },
  { label: '검토중', value: stats.value.pending, color: '#F59E0B' },
  { label: '승인', value: stats.value.approved, color: '#10B981' },
  { label: '반려', value: stats.value.rejected, color: '#EF4444' }
])

const statusTabs = [
  { value: null, label: '전체' },
  { value: 'PENDING', label: '검토중' },
  { value: 'APPROVED', label: '승인됨' },
  { value: 'REJECTED', label: '반려됨' }
]

// Computed
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
const getThumbnailUrl = (product) => {
  return product.thumbnailDto?.fileUrl || product.thumbnailDto?.filePath || DEFAULT_THUMBNAIL
}

const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 10000) return Math.floor(count / 10000) + '만'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toString()
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
}

const formatPrice = (price) => {
  if (!price || price === 0) return '무료'
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

const getStatusValue = (status) => {
  if (!status) return 'PENDING'
  return typeof status === 'object' ? status.title : status
}

const getStatusClass = (status) => {
  const statusValue = getStatusValue(status)
  return ({
    'PENDING': 'pending',
    'APPROVED': 'approved',
    'REJECTED': 'rejected'
  }[statusValue] || 'pending')
}

const getStatusLabel = (status) => {
  if (status && typeof status === 'object' && status.description) {
    return status.description
  }
  const statusValue = getStatusValue(status)
  return ({
    'PENDING': '검토중',
    'APPROVED': '승인됨',
    'REJECTED': '반려됨'
  }[statusValue] || '알 수 없음')
}

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// API
const fetchProducts = async () => {
  loading.value = true
  try {
    const searchCondition = { status: selectedStatus.value }
    const pageable = { page: currentPage.value, size: pageSize, sort: 'createdAt,DESC' }

    const response = await productService.getMyProducts(searchCondition, pageable)

    if (response.success && response.data) {
      if (response.data.content) {
        products.value = response.data.content
        totalElements.value = response.data.totalElements || 0
        totalPages.value = response.data.totalPages || 0
      } else {
        products.value = response.data
        totalElements.value = response.data.length
        totalPages.value = 1
      }
      await updateStats()
    }
  } catch (e) {
    console.error('상품 로드 실패:', e)
    showToast('상품 목록을 불러오는데 실패했습니다', 'error')
  } finally {
    loading.value = false
  }
}

const updateStats = async () => {
  try {
    const [all, pending, approved, rejected] = await Promise.all([
      productService.getMyProducts({}, { page: 0, size: 1 }),
      productService.getMyProducts({ status: 'PENDING' }, { page: 0, size: 1 }),
      productService.getMyProducts({ status: 'APPROVED' }, { page: 0, size: 1 }),
      productService.getMyProducts({ status: 'REJECTED' }, { page: 0, size: 1 })
    ])
    stats.value = {
      total: all.data?.totalElements || 0,
      pending: pending.data?.totalElements || 0,
      approved: approved.data?.totalElements || 0,
      rejected: rejected.data?.totalElements || 0
    }
  } catch (e) {
    console.error('통계 업데이트 실패:', e)
  }
}

// 핸들러
const handleStatusChange = (status) => {
  selectedStatus.value = status
  currentPage.value = 0
  fetchProducts()
}

const goToPage = (page) => {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  fetchProducts()
}

const editProduct = (product) => {
  router.push(`/products/${product.id}/edit`)
}

const deleteProduct = async (product) => {
  const confirmed = await open({ type: 'danger', title: '상품 삭제', message: `"${product.name}"을(를) 삭제하시겠습니까?` })
  if (!confirmed) return

  try {
    const response = await productService.deleteProduct(product.id)
    if (response.success) {
      showToast('삭제되었습니다')
      fetchProducts()
    } else {
      showToast('삭제에 실패했습니다', 'error')
    }
  } catch (e) {
    console.error('삭제 실패:', e)
    showToast('삭제에 실패했습니다', 'error')
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
* { box-sizing: border-box; }

.my-products {
  min-height: 100vh;
  background: #fff;
  font-family: 'SUIT-Regular', 'Noto Sans KR', sans-serif;
  color: #111;
}

/* 헤더 */
.header {
  padding: 28px 40px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.header-text p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #888;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-add:hover {
  background: #6d28d9;
  transform: translateY(-1px);
}

/* 메인 */
.main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 40px;
}

/* 툴바 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.stats-inline {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #fafafa;
  border-radius: 8px;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-label {
  font-size: 13px;
  color: #888;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
}

.filter-tabs {
  display: flex;
  gap: 6px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.tab-btn:hover {
  border-color: #7c3aed;
  color: #7c3aed;
}

.tab-btn.active {
  background: #7c3aed;
  color: #fff;
  border-color: #7c3aed;
}

/* 테이블 */
.table-wrapper {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 80px 80px 90px 80px;
  gap: 16px;
  padding: 14px 20px;
  background: #fafafa;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f0f0f0;
}

.table-body {
  /* body wrapper */
}

.table-row-wrapper {
  /* row + reject reason wrapper */
  transition: background 0.15s;
}

.table-row-wrapper:hover {
  background: #fafafa;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 80px 80px 90px 80px;
  gap: 16px;
  padding: 16px 20px;
  align-items: center;
}

.col-product {
  display: flex;
  align-items: center;
  gap: 14px;
}

.product-thumb {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  background: #f5f5f5;
  border: 1px solid #f0f0f0;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 3px;
}

.product-meta {
  font-size: 12px;
  color: #999;
}

.col-price {
  font-size: 14px;
  font-weight: 600;
  color: #7c3aed;
}

.col-views,
.col-likes {
  text-align: center;
  font-size: 13px;
  color: #666;
}

.col-status {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.approved { background: #d1fae5; color: #065f46; }
.status-badge.rejected { background: #fee2e2; color: #991b1b; }

.col-actions {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #ddd;
  color: #333;
}

.reject-reason {
  margin: 0 20px 16px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #fef2f2;
  font-size: 12px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.divider {
  height: 1px;
  background: #f5f5f5;
  margin: 0 20px;
}

/* 빈 상태 & 로딩 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}

.empty-state svg {
  opacity: 0.5;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid #f0f0f0;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 28px;
}

.page-btn {
  min-width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8e8e8;
  background: #fff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.page-btn:hover:not(:disabled) {
  border-color: #7c3aed;
  color: #7c3aed;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.active {
  background: #7c3aed;
  color: #fff;
  border-color: #7c3aed;
}

.page-ellipsis {
  padding: 0 8px;
  color: #999;
}

/* 토스트 */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  z-index: 1000;
  animation: slideUp 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.toast.success { background: #10b981; }
.toast.error { background: #ef4444; }

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 반응형 */
@media (max-width: 768px) {
  .header { padding: 20px 16px; }
  .main { padding: 20px 16px; }

  .header-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .toolbar { flex-direction: column; align-items: stretch; }

  .stats-inline {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-item {
    justify-content: center;
  }

  .filter-tabs {
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .filter-tabs::-webkit-scrollbar {
    display: none;
  }

  .table-header { display: none; }

  .table-wrapper {
    border-radius: 12px;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }

  .table-row-wrapper:hover {
    background: transparent;
  }

  .col-product { order: 1; }

  .product-thumb {
    width: 48px;
    height: 48px;
  }

  .col-price {
    order: 2;
    font-size: 16px;
    padding-left: 62px;
    margin-top: -8px;
  }

  .col-status {
    order: 3;
    text-align: left;
    padding-left: 62px;
  }

  .col-views, .col-likes { display: none; }

  .col-actions {
    order: 4;
    justify-content: flex-start;
    padding-left: 62px;
  }

  .divider {
    margin: 0 16px;
  }

  .reject-reason {
    margin: 0 16px 16px;
  }

  .pagination {
    gap: 4px;
  }

  .page-btn {
    min-width: 34px;
    height: 34px;
    font-size: 12px;
  }
}
</style>