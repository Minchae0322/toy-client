<template>
  <div class="product-header">
    <div class="status-badge" :class="getStatusClass(product.status)">
      {{ getProductTypeText(product.productType) }}
    </div>

    <h1 class="product-title">{{ product.name }}</h1>
    <div class="product-brand">{{ product.brand }}</div>

    <div class="product-meta">
      <div class="meta-item">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.33334L10.06 5.50668L14.6667 6.18001L11.3333 9.42668L12.12 14.0133L8 11.8467L3.88 14.0133L4.66667 9.42668L1.33333 6.18001L5.94 5.50668L8 1.33334Z" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="rating-value">{{ formatRating(product.averageRating) }}</span>
        <span class="rating-count">({{ product.reviewCount || 0 }})</span>
      </div>

      <div class="meta-divider"></div>

      <div class="meta-item">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 7.33334C14.3667 7.72667 14.6667 8.21334 14.8667 8.76001C15.2667 9.86001 15.2 11.0867 14.6933 12.1467C13.9133 13.68 12.3133 14.6667 10.5867 14.6667H5.41333C3.68667 14.6667 2.08667 13.68 1.30667 12.1467C0.8 11.0867 0.733333 9.86001 1.13333 8.76001C1.33333 8.21334 1.63333 7.72667 2 7.33334" stroke="#6B7280" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 1.33334V9.72668" stroke="#6B7280" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="meta-value">{{ formatCount(product.likeCount) }}</span>
      </div>

      <div class="meta-divider"></div>

      <div class="meta-item">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10.3867 7.33334C11.6067 7.33334 12.6 6.34001 12.6 5.12001C12.6 3.90001 11.6067 2.90668 10.3867 2.90668C9.16667 2.90668 8.17333 3.90001 8.17333 5.12001C8.17333 6.34001 9.16667 7.33334 10.3867 7.33334Z" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M1.92667 13.0933C1.92667 11.02 3.62667 9.32001 5.7 9.32001C6.24667 9.32001 6.76667 9.43334 7.24 9.63334" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5.61333 7.33334C6.83333 7.33334 7.82667 6.34001 7.82667 5.12001C7.82667 3.90001 6.83333 2.90668 5.61333 2.90668C4.39333 2.90668 3.4 3.90001 3.4 5.12001C3.4 6.34001 4.39333 7.33334 5.61333 7.33334Z" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14.0733 13.0933C14.0733 11.02 12.3733 9.32001 10.3 9.32001C9.97333 9.32001 9.66 9.36668 9.36 9.45334" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="meta-value">{{ formatCount(product.viewCount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { productUtils } from '@/services/ProductService.js'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

const formatRating = (rating) => productUtils.formatRating(rating)
const formatCount = (count) => productUtils.formatCount(count)

const getStatusClass = (status) => {
  const statusValue = typeof status === 'object' ? status.title : status
  const statusMap = {
    'APPROVED': 'approved',
    'PENDING': 'pending',
    'REJECTED': 'rejected'
  }
  return statusMap[statusValue] || 'approved'
}

const getProductTypeText = (productType) => {
  const textMap = {
    'SALE': '판매',
    'AUCTION': '경매',
    'FREE': '무료나눔',
    'EXCHANGE': '교환'
  }
  return textMap[productType] || '기타'
}
</script>

<style scoped>
.product-header {
  padding: 32px 32px 28px;
  border-bottom: 1px solid #F3F4F6;
}

.status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}

.status-badge.approved {
  background: #ECFDF5;
  color: #059669;
}

.status-badge.pending {
  background: #FEF3C7;
  color: #D97706;
}

.status-badge.rejected {
  background: #FEE2E2;
  color: #DC2626;
}

.product-title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.product-brand {
  font-size: 16px;
  color: #6B7280;
  margin-bottom: 24px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #F3F4F6;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-divider {
  width: 1px;
  height: 16px;
  background: #E5E7EB;
}

.rating-value {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.rating-count {
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 500;
}

.meta-value {
  font-size: 14px;
  color: #6B7280;
  font-weight: 600;
  letter-spacing: -0.01em;
}

@media (max-width: 768px) {
  .product-header {
    padding: 24px 24px 20px;
  }

  .product-title {
    font-size: 26px;
  }

  .product-brand {
    font-size: 15px;
  }

  .product-meta {
    padding-top: 20px;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .product-header {
    padding: 20px 20px 16px;
  }

  .product-title {
    font-size: 22px;
  }

  .product-brand {
    font-size: 14px;
  }

  .meta-item {
    gap: 4px;
  }

  .rating-value,
  .meta-value {
    font-size: 13px;
  }

  .rating-count {
    font-size: 13px;
  }
}
</style>