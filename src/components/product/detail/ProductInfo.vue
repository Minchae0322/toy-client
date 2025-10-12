<template>
  <div class="product-info">
    <div class="info-section">
      <h2 class="info-title">상품 소개</h2>
      <div class="info-content">
        {{ product.description || '상품 설명이 없습니다.' }}
      </div>
      <div class="tag-list" v-if="product.tags?.length">
        <div
            v-for="tag in product.tags"
            :key="tag"
            class="tag"
            :class="{ highlight: isHighlightTag(tag) }"
        >
          {{ tag }}
        </div>
      </div>
    </div>

    <div class="info-section" v-if="hasDetailInfo">
      <h2 class="info-title">상세 정보</h2>
      <div class="info-grid">
        <div v-if="product.distributor" class="info-row">
          <div class="info-label">판매처</div>
          <div class="info-value">{{ product.distributor }}</div>
        </div>
        <div v-if="product.price" class="info-row">
          <div class="info-label">가격</div>
          <div class="info-value">{{ formatPrice(product.price) }}</div>
        </div>
        <div v-if="product.feature" class="info-row">
          <div class="info-label">특징</div>
          <div class="info-value">{{ product.feature }}</div>
        </div>
        <div v-if="product.releaseDate" class="info-row">
          <div class="info-label">출시일</div>
          <div class="info-value">{{ formatDate(product.releaseDate) }}</div>
        </div>
        <div v-if="product.category" class="info-row">
          <div class="info-label">카테고리</div>
          <div class="info-value">
            {{ product.category.categoryName }}
            <span v-if="product.category.categoryCode" class="category-code">
              {{ product.category.categoryCode }}
            </span>
          </div>
        </div>
        <div v-if="getStatusText(product.status)" class="info-row">
          <div class="info-label">상태</div>
          <div class="info-value">{{ getStatusText(product.status) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { productUtils } from '@/services/ProductService.js'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const formatPrice = (price) => productUtils.formatPrice(price)
const formatDate = (date) => productUtils.formatDate(date)

const hasDetailInfo = computed(() => {
  return props.product?.distributor ||
      props.product?.price ||
      props.product?.feature ||
      props.product?.releaseDate ||
      props.product?.category ||
      props.product?.status
})

const isHighlightTag = (tag) => {
  const highlightTags = ['신상', '인기', '한정', '추천', '베스트']
  return highlightTags.some(highlight => tag.includes(highlight))
}

const getStatusText = (status) => {
  const statusValue = typeof status === 'object' ? status.title : status
  const statusMap = {
    'APPROVED': '승인됨',
    'PENDING': '대기중',
    'REJECTED': '거부됨'
  }
  return statusMap[statusValue] || ''
}
</script>

<style scoped>
.product-info {
  padding: 32px;
  border-bottom: 1px solid #F3F4F6;
}

.info-section {
  margin-bottom: 40px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.info-content {
  font-size: 15px;
  line-height: 1.7;
  color: #374151;
  letter-spacing: -0.01em;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #F3F4F6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  letter-spacing: -0.01em;
}

.info-value {
  font-size: 15px;
  color: #111827;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.category-code {
  font-size: 13px;
  color: #9CA3AF;
  font-weight: 400;
  margin-left: 6px;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.tag {
  background: #F3F4F6;
  color: #4B5563;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: all 0.2s;
}

.tag:hover {
  background: #E5E7EB;
}

.tag.highlight {
  background: #ECFDF5;
  color: #059669;
  border: 1px solid #D1FAE5;
}

@media (max-width: 768px) {
  .product-info {
    padding: 24px;
  }

  .info-section {
    margin-bottom: 32px;
  }

  .info-title {
    font-size: 18px;
    margin-bottom: 14px;
  }

  .info-content {
    font-size: 14px;
  }

  .info-row {
    grid-template-columns: 100px 1fr;
    gap: 16px;
    padding: 14px 0;
  }

  .info-label {
    font-size: 13px;
  }

  .info-value {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .product-info {
    padding: 20px;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px 0;
  }

  .info-label {
    font-size: 12px;
    color: #9CA3AF;
  }

  .tag {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>