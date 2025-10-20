<template>
  <section class="product-selector">
    <div class="section-header">
      <h3 class="section-title">연결할 상품</h3>
      <span class="optional-badge">선택사항</span>
    </div>

    <!-- 선택된 상품 표시 -->
    <div v-if="selectedProduct" class="selected-product">
      <img
          :src="selectedProduct.thumbnailUrl || '/default-product.png'"
          :alt="selectedProduct.name"
          class="product-thumbnail"
      />
      <div class="product-details">
        <p class="product-name">{{ selectedProduct.name }}</p>
        <p class="product-brand">{{ selectedProduct.brand }}</p>
        <p class="product-price" v-if="selectedProduct.price">
          {{ formatPrice(selectedProduct.price) }}
        </p>
      </div>
      <button
          type="button"
          @click="clearSelection"
          class="remove-btn"
          title="선택 해제"
      >
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 상품 선택 버튼 -->
    <button
        v-else
        type="button"
        @click="openModal"
        class="select-btn"
    >
      <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span>상품 선택하기</span>
    </button>

    <!-- 상품 선택 모달 -->
    <ProductSelectModal
        v-if="showModal"
        @select="handleSelect"
        @close="showModal = false"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue';
import ProductSelectModal from './ProductSelectModal.vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const showModal = ref(false);
const selectedProduct = ref(null);

const openModal = () => {
  showModal.value = true;
};

const handleSelect = (product) => {
  selectedProduct.value = product;
  emit('update:modelValue', product.productId);
  showModal.value = false;
};

const clearSelection = () => {
  selectedProduct.value = null;
  emit('update:modelValue', null);
};

const formatPrice = (price) => {
  if (!price) return '가격 미정';
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};
</script>

<style scoped>
.product-selector {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.optional-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  background: #f9fafb;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
}

/* 선택된 상품 */
.selected-product {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
}

.product-thumbnail {
  width: 4rem;
  height: 4rem;
  object-fit: cover;
  border-radius: 0.5rem;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.125rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-brand {
  font-size: 0.75rem;
  color: #4b5563;
  margin: 0 0 0.25rem 0;
}

.product-price {
  font-size: 0.875rem;
  font-weight: 700;
  color: #2563eb;
  margin: 0;
}

.remove-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.remove-btn:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.remove-btn:hover .icon {
  color: #ef4444;
}

.remove-btn .icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
  transition: color 0.2s;
}

/* 선택 버튼 */
.select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.select-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  transition: color 0.2s;
}

.select-btn:hover .icon {
  color: #4b5563;
}

.select-btn span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  transition: color 0.2s;
}

.select-btn:hover span {
  color: #1f2937;
}

.icon {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .product-selector {
    padding: 1.25rem;
  }

  .product-thumbnail {
    width: 3.5rem;
    height: 3.5rem;
  }

  .remove-btn {
    width: 1.5rem;
    height: 1.5rem;
  }

  .remove-btn .icon {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>