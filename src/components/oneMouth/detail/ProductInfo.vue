<template>
  <div class="product-info">
    <div class="info-section">
      <div class="info-title">제품 소개</div>
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
          #{{ tag }}
        </div>
      </div>
    </div>

    <div class="info-section" v-if="hasDetailInfo">
      <div class="info-title">상세 정보</div>
      <div class="info-content">
        <div v-if="product.distributor">
          <strong>판매처:</strong> {{ product.distributor }}
        </div>
        <div v-if="product.price">
          <strong>가격:</strong> {{ formatPrice(product.price) }}
        </div>
        <div v-if="product.feature">
          <strong>특징:</strong> {{ product.feature }}
        </div>
        <div v-if="product.releaseDate">
          <strong>출시일:</strong> {{ formatDate(product.releaseDate) }}
        </div>
        <div v-if="product.category">
          <strong>카테고리:</strong> {{ product.category.categoryName }}
          <span v-if="product.category.categoryCode" class="category-code">
            ({{ product.category.categoryCode }})
          </span>
        </div>
        <div v-if="getStatusText(product.status)">
          <strong>상태:</strong> {{ getStatusText(product.status) }}
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
  const highlightTags = ['신상', '인기', '한정', '추천']
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
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.info-section {
  margin-bottom: 24px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-title {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 12px;
}

.info-content {
  font-size: 15px;
  line-height: 1.6;
  color: #222222;
}

.info-content div {
  margin-bottom: 4px;
}

.category-code {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.tag {
  background: #f1f5f9;
  color: #222222;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

.tag.highlight {
  background: #1DCD9F;
  color: white;
}

@media (max-width: 768px) {
  .product-info {
    padding: 20px;
  }
}
</style>
