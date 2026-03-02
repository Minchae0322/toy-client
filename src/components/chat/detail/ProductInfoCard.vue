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
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.product-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #e2e8f0;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
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
  background: #f1f5f9;
}

.product-image {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: #e2e8f0;
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
  color: #94a3b8;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: #dc2626;
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
  background: #dcfce7;
  color: #166534;
}

.status-reserved {
  background: #fef3c7;
  color: #92400e;
}

.status-sold {
  background: #f3f4f6;
  color: #6b7280;
}

.arrow-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .product-info-card {
    background: #374151;
    border-color: #4b5563;
  }

  .product-header {
    background: #4b5563;
    color: #9ca3af;
  }

  .product-content:hover {
    background: #4b5563;
  }

  .product-name {
    color: #f9fafb;
  }

  .product-image {
    background: #4b5563;
  }

  .no-image {
    color: #6b7280;
  }

  .status-sale {
    background: #065f46;
    color: #10b981;
  }

  .status-reserved {
    background: #78350f;
    color: #f59e0b;
  }

  .status-sold {
    background: #4b5563;
    color: #9ca3af;
  }
}
</style>