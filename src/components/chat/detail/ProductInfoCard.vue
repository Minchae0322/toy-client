<template>
  <div class="product-info-card">
    <div class="product-header">
      <ShoppingCart :size="16" />
      <span>거래 상품</span>
    </div>

    <div class="product-content" @click="$emit('view-product')">
      <div class="product-image">
        <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            @error="handleImageError"
        />
        <div v-else class="no-image">
          <ImageIcon :size="24" />
        </div>
      </div>

      <div class="product-details">
        <h4 class="product-name">{{ product.name }}</h4>
        <div class="product-price">{{ formatPrice(product.price) }}</div>
        <div class="product-status" :class="statusClass">
          {{ statusText }}
        </div>
      </div>

      <ChevronRight :size="16" class="arrow-icon" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ShoppingCart, ImageIcon, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      price: 0,
      image: '',
      status: 'FOR_SALE'
    })
  }
})

const emit = defineEmits(['view-product'])

// 가격 포맷팅
const formatPrice = (price) => {
  if (!price && price !== 0) return '0원'
  const s = String(price).replace(/,/g, '').trim()
  const rangeMatch = s.match(/^(\d+)\s*~\s*(\d+)$/)
  if (rangeMatch) {
    return Number(rangeMatch[1]).toLocaleString() + ' ~ ' + Number(rangeMatch[2]).toLocaleString() + '원'
  }
  const num = Number(s)
  if (isNaN(num)) return '0원'
  return num.toLocaleString() + '원'
}

// 상품 상태 관련
const statusText = computed(() => {
  switch (props.product.status) {
    case 'FOR_SALE':
      return '판매중'
    case 'RESERVED':
      return '예약중'
    case 'SOLD':
      return '판매완료'
    default:
      return '판매중'
  }
})

const statusClass = computed(() => {
  switch (props.product.status) {
    case 'FOR_SALE':
      return 'status-sale'
    case 'RESERVED':
      return 'status-reserved'
    case 'SOLD':
      return 'status-sold'
    default:
      return 'status-sale'
  }
})

// 이미지 에러 처리
const handleImageError = (e) => {
  e.target.style.display = 'none'
  e.target.parentElement.querySelector('.no-image').style.display = 'flex'
}
</script>

<style scoped>
.product-info-card {
  margin: 12px 16px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  overflow: hidden;
}

.product-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--border-strong);
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-500);
}

.product-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.product-content:hover {
  background: var(--bg-subtle);
}

.product-image {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--border-strong);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-400);
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-600);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--c-danger);
  margin-bottom: 4px;
}

.product-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-sale {
  background: var(--c-success-soft);
  color: var(--c-success);
}

.status-reserved {
  background: var(--c-warning-soft);
  color: var(--c-warning);
}

.status-sold {
  background: var(--border-default);
  color: var(--c-text-500);
}

.arrow-icon {
  color: var(--c-text-400);
  flex-shrink: 0;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .product-info-card {
    background: var(--c-text-600);
    border-color: var(--c-text-600);
  }

  .product-header {
    background: var(--c-text-600);
    color: var(--c-text-400);
  }

  .product-content:hover {
    background: var(--c-text-600);
  }

  .product-name {
    color: var(--bg-subtle);
  }

  .product-image {
    background: var(--c-text-600);
  }

  .no-image {
    color: var(--c-text-500);
  }

  .status-sale {
    background: #065f46;
    color: var(--c-success);
  }

  .status-reserved {
    background: #78350f;
    color: var(--c-warning);
  }

  .status-sold {
    background: var(--c-text-600);
    color: var(--c-text-400);
  }
}
</style>