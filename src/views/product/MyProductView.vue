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

const router = useRouter()
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
  if (!confirm(`"${product.name}"을(를) 삭제하시겠습니까?`)) return

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

/* ===== Soft Modern Design System ===== */
.my-products {
  --soft-bg: #FAFBFC;
  --soft-surface: #FFFFFF;
  --soft-border: #E8ECF0;
  --soft-border-subtle: #F0F3F5;
  --soft-text: #1A1D21;
  --soft-text-secondary: #6B7280;
  --soft-text-muted: #9CA3AF;
  --soft-primary: #6366F1;
  --soft-primary-subtle: #EEF2FF;
  --soft-success: #10B981;
  --soft-success-subtle: #ECFDF5;
  --soft-warning: #F59E0B;
  --soft-warning-subtle: #FFFBEB;
  --soft-danger: #EF4444;
  --soft-danger-subtle: #FEF2F2;
  --soft-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --soft-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --soft-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.08);
  --soft-radius: 12px;
  --soft-radius-sm: 8px;
  --soft-radius-lg: 16px;

  min-height: 100vh;
  background: linear-gradient(180deg, #FAFBFC 0%, #F3F4F6 100%);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--soft-text);
}

/* 헤더 */
.header {
  padding: 0;
  background: transparent;
  border-bottom: none;
}

.header-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--soft-surface);
  border-radius: var(--soft-radius-lg);
  box-shadow: var(--soft-shadow-sm);
  border: 1px solid var(--soft-border-subtle);
  margin-top: 32px;
}

.header-text h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--soft-text);
  letter-spacing: -0.3px;
}

.header-text p {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--soft-text-secondary);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--soft-text);
  color: #fff;
  border: none;
  border-radius: var(--soft-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(26, 29, 33, 0.15);
}

.btn-add:hover {
  background: #2D3139;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 29, 33, 0.2);
}

/* 메인 */
.main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 40px 40px;
}

/* 툴바 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 20px;
}

.stats-inline {
  display: flex;
  gap: 20px;
  padding: 16px 24px;
  background: var(--soft-surface);
  border-radius: var(--soft-radius);
  box-shadow: var(--soft-shadow-sm);
  border: 1px solid var(--soft-border-subtle);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 13px;
  color: var(--soft-text-secondary);
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--soft-text);
}

.filter-tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: var(--soft-surface);
  border-radius: var(--soft-radius);
  box-shadow: var(--soft-shadow-sm);
  border: 1px solid var(--soft-border-subtle);
}

.tab-btn {
  padding: 10px 18px;
  border: none;
  border-radius: var(--soft-radius-sm);
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  color: var(--soft-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--soft-text);
  background: var(--soft-border-subtle);
}

.tab-btn.active {
  background: var(--soft-text);
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 테이블 */
.table-wrapper {
  background: var(--soft-surface);
  border: 1px solid var(--soft-border-subtle);
  border-radius: var(--soft-radius-lg);
  overflow: hidden;
  box-shadow: var(--soft-shadow);
}

.table-header {
  display: grid;
  grid-template-columns: 2.5fr 1fr 80px 80px 100px 90px;
  gap: 16px;
  padding: 14px 24px;
  background: var(--soft-bg);
  font-size: 11px;
  font-weight: 600;
  color: var(--soft-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--soft-border-subtle);
}

.table-body {
  /* body wrapper */
}

.table-row-wrapper {
  transition: background 0.15s ease;
}

.table-row-wrapper:hover {
  background: #FAFBFC;
}

.table-row {
  display: grid;
  grid-template-columns: 2.5fr 1fr 80px 80px 100px 90px;
  gap: 16px;
  padding: 18px 24px;
  align-items: center;
}

.col-product {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-thumb {
  width: 56px;
  height: 56px;
  border-radius: var(--soft-radius);
  object-fit: cover;
  background: var(--soft-bg);
  border: 1px solid var(--soft-border-subtle);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--soft-text);
  line-height: 1.3;
}

.product-meta {
  font-size: 12px;
  color: var(--soft-text-muted);
}

.col-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--soft-text);
}

.col-views,
.col-likes {
  text-align: center;
  font-size: 13px;
  color: var(--soft-text-secondary);
}

.col-status {
  text-align: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.status-badge.pending {
  background: var(--soft-warning-subtle);
  color: #B45309;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-badge.approved {
  background: var(--soft-success-subtle);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-badge.rejected {
  background: var(--soft-danger-subtle);
  color: #B91C1C;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.col-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--soft-radius-sm);
  background: var(--soft-surface);
  border: 1px solid var(--soft-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--soft-text-secondary);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--soft-bg);
  border-color: var(--soft-text-secondary);
  color: var(--soft-text);
  transform: translateY(-2px);
  box-shadow: var(--soft-shadow);
}

.reject-reason {
  margin: 0 24px 18px;
  padding: 14px 18px;
  border-radius: var(--soft-radius);
  background: var(--soft-danger-subtle);
  font-size: 12px;
  color: var(--soft-danger);
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 4px solid var(--soft-danger);
}

.divider {
  height: 1px;
  background: var(--soft-border-subtle);
  margin: 0 24px;
}

/* 빈 상태 & 로딩 */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  color: var(--soft-text-muted);
}

.empty-state svg {
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--soft-text-secondary);
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: var(--soft-text-muted);
  margin: 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--soft-border);
  border-top-color: var(--soft-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
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
  border: 1px solid var(--soft-border);
  background: var(--soft-surface);
  border-radius: var(--soft-radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--soft-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--soft-primary);
  color: var(--soft-primary);
  background: var(--soft-primary-subtle);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.active {
  background: var(--soft-text);
  color: #fff;
  border-color: var(--soft-text);
}

.page-ellipsis {
  padding: 0 8px;
  color: var(--soft-text-muted);
}

/* 토스트 */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 28px;
  border-radius: var(--soft-radius);
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  z-index: 1000;
  animation: slideUp 0.3s ease;
  box-shadow: var(--soft-shadow-lg);
}

.toast.success { background: var(--soft-success); }
.toast.error { background: var(--soft-danger); }

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(16px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 반응형 */
@media (max-width: 768px) {
  .header-inner {
    margin-top: 16px;
    padding: 24px;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .main { padding: 20px; }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .stats-inline {
    justify-content: space-between;
    padding: 14px 20px;
  }

  .filter-tabs {
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .filter-tabs::-webkit-scrollbar {
    display: none;
  }

  .table-header { display: none; }

  .table-row {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 18px 20px;
  }

  .col-product { order: 1; }
  .col-price { order: 2; font-size: 16px; }
  .col-status { order: 3; text-align: left; }
  .col-views, .col-likes { display: none; }
  .col-actions { order: 4; justify-content: flex-start; }

  .reject-reason {
    margin: 0 20px 16px;
  }

  .divider {
    margin: 0 20px;
  }
}
</style>