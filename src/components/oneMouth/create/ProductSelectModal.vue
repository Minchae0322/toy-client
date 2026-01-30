<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">상품 선택</h2>
          <button type="button" @click="$emit('close')" class="close-btn">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search Section -->
        <div class="search-section">
          <div class="search-wrapper">
            <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                v-model="searchKeyword"
                type="text"
                placeholder="상품명, 브랜드로 검색"
                @keyup.enter="handleSearch"
                class="search-input"
            />
          </div>
        </div>

        <!-- Product List -->
        <div class="product-list">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p class="loading-text">상품을 불러오는 중...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="products.length === 0" class="empty-state">
            <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="empty-title">
              {{ searchKeyword ? '검색 결과가 없습니다' : '등록된 상품이 없습니다' }}
            </p>
            <p class="empty-description">먼저 상품을 등록해주세요</p>
          </div>

          <!-- Product Items -->
          <div v-else class="product-items">
            <button
                v-for="product in products"
                :key="product.productId"
                type="button"
                @click="$emit('select', product)"
                class="product-item"
            >
              <img
                  :src="product.thumbnailUrl || '/default-product.png'"
                  :alt="product.name"
                  class="product-image"
              />
              <div class="product-info">
                <p class="product-name">{{ product.name }}</p>
                <p class="product-brand">{{ product.brand }}</p>
                <p class="product-price" v-if="product.price">
                  {{ formatPrice(product.price) }}
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && totalPages > 1" class="pagination">
          <button
              type="button"
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 0"
              class="page-btn"
          >
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="page-info">
            {{ currentPage + 1 }} / {{ totalPages }}
          </span>
          <button
              type="button"
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages - 1"
              class="page-btn"
          >
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { productService } from '@/services/ProductService.js';
import { useConfirmDialog } from '@/composables/useConfirmDialog';

const props = defineProps({
  initialProducts: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select', 'close']);

const { open } = useConfirmDialog();

const products = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const currentPage = ref(0);
const totalPages = ref(1);
const pageSize = 10;

onMounted(() => {
  fetchProducts();
});

const fetchProducts = async (page = 0) => {
  loading.value = true;
  try {
    const searchCondition = {
      status: 'APPROVED',
      ...(searchKeyword.value.trim() ? { keyword: searchKeyword.value.trim() } : {})
    };

    const pageable = {
      page: page,
      size: pageSize,
      sort: 'createdAt,DESC'
    };

    const response = await productService.getProducts(searchCondition, pageable);

    if (response.success && response.data) {
      if (response.data.content) {
        products.value = response.data.content;
        totalPages.value = response.data.totalPages || 1;
        currentPage.value = response.data.number || 0;
      } else if (Array.isArray(response.data)) {
        products.value = response.data;
        totalPages.value = 1;
        currentPage.value = 0;
      }
    }
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    await open({ type: 'alert', title: '오류', message: '상품 목록을 불러올 수 없습니다.' });
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 0;
  fetchProducts(0);
};

const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    fetchProducts(page);
  }
};

const formatPrice = (price) => {
  if (!price) return '가격 미정';
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 42rem;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.close-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

/* Search */
.search-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

/* Product List */
.product-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 16rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 9999px;
  animation: spin 0.6s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 16rem;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1rem;
  font-weight: 500;
  color: #4b5563;
  margin: 0 0 0.25rem 0;
}

.empty-description {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

/* Product Items */
.product-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.product-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.product-image {
  width: 5rem;
  height: 5rem;
  object-fit: cover;
  border-radius: 0.5rem;
  flex-shrink: 0;
  background: #f3f4f6;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.product-item:hover .product-name {
  color: #2563eb;
}

.product-brand {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.product-price {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.page-btn {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #4b5563;
}

.page-info {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  min-width: 3.75rem;
  text-align: center;
}

@media (max-width: 640px) {
  .modal-container {
    max-height: 90vh;
  }

  .modal-header,
  .search-section,
  .product-list,
  .pagination {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .product-image {
    width: 4rem;
    height: 4rem;
  }
}
</style>