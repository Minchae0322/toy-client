<template>
  <div class="product-header">
    <h1 class="product-title">{{ product.name }}</h1>
    <div class="product-brand">{{ product.brand }}</div>
    <div class="product-meta">
      <div class="meta-item">
        <span>⭐</span>
        <span class="rating">{{ formatRating(product.averageRating) }}</span>
        <span>({{ product.reviewCount || 0 }}개 리뷰)</span>
      </div>
      <div class="meta-item">
        <span>💬</span>
        <span>{{ product.reviewCount || 0 }}</span>
      </div>
      <div class="meta-item">
        <span>🔥</span>
        <span>{{ formatCount(product.likeCount) }}</span>
      </div>
      <div class="meta-item">
        <span>👁️</span>
        <span>{{ formatCount(product.viewCount) }}</span>
      </div>
      <div class="status-badge" :class="getStatusClass(product.status)">
        {{ getStatusIcon(product.productType) }} {{ getProductTypeText(product.productType) }}
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
    'APPROVED': '',
    'PENDING': 'pending',
    'REJECTED': 'rejected'
  }
  return statusMap[statusValue] || ''
}

const getStatusIcon = (productType) => {
  const iconMap = {
    'SALE': '💰',
    'AUCTION': '🔨',
    'FREE': '🎁',
    'EXCHANGE': '🔄'
  }
  return iconMap[productType] || '📦'
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
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.product-title {
  font-size: 28px;
  font-weight: 800;
  color: #000000;
  margin-bottom: 8px;
}

.product-brand {
  font-size: 16px;
  color: #222222;
  opacity: 0.7;
  margin-bottom: 16px;
}

.product-meta {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

.rating {
  color: #169976;
  font-weight: 600;
}

.status-badge {
  background: #1DCD9F;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  background: #f59e0b;
}

.status-badge.rejected {
  background: #ef4444;
}

@media (max-width: 768px) {
  .product-header {
    padding: 20px;
  }

  .product-title {
    font-size: 24px;
  }

  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .meta-item {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .product-title {
    font-size: 20px;
  }

  .meta-item {
    font-size: 14px;
  }
}
</style>