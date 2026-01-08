<template>
  <section class="product-selector">
    <div class="section-header">
      <h3 class="section-title">연결할 상품</h3>
      <span class="optional-badge">선택사항</span>
    </div>

    <!-- 선택된 상품 표시 (모달에서 선택한 경우) -->
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

    <!-- 직접 입력한 제품명 표시 -->
    <div v-else-if="manualProductName" class="selected-product manual-input">
      <div class="manual-icon-wrapper">
        <svg class="manual-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <div class="product-details">
        <p class="product-name">{{ manualProductName }}</p>
        <p class="product-brand manual-label">직접 입력</p>
      </div>
      <button
          type="button"
          @click="clearManualInput"
          class="remove-btn"
          title="입력 취소"
      >
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 상품 선택 옵션들 -->
    <div v-else class="selection-options">
      <!-- 상품 선택 버튼 -->
      <button
          type="button"
          @click="openModal"
          class="select-btn"
      >
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>상품 선택하기</span>
      </button>

      <!-- 구분선 -->
      <div class="divider">
        <span class="divider-text">또는</span>
      </div>

      <!-- 직접 입력 필드 -->
      <div class="manual-input-wrapper">
        <input
            v-model="inputProductName"
            type="text"
            placeholder="제품명 직접 입력"
            class="manual-input-field"
            @keyup.enter="confirmManualInput"
        />
        <button
            type="button"
            @click="confirmManualInput"
            :disabled="!inputProductName.trim()"
            class="confirm-btn"
        >
          확인
        </button>
      </div>
    </div>

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
  },
  productName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'update:productName']);

const showModal = ref(false);
const selectedProduct = ref(null);
const manualProductName = ref('');
const inputProductName = ref('');

const openModal = () => {
  showModal.value = true;
};

const handleSelect = (product) => {
  selectedProduct.value = product;
  manualProductName.value = '';
  emit('update:modelValue', product.productId);
  emit('update:productName', product.name);
  showModal.value = false;
};

const clearSelection = () => {
  selectedProduct.value = null;
  emit('update:modelValue', null);
  emit('update:productName', '');
};

const confirmManualInput = () => {
  const trimmedName = inputProductName.value.trim();
  if (trimmedName) {
    manualProductName.value = trimmedName;
    selectedProduct.value = null;
    emit('update:modelValue', null);
    emit('update:productName', trimmedName);
    inputProductName.value = '';
  }
};

const clearManualInput = () => {
  manualProductName.value = '';
  inputProductName.value = '';
  emit('update:modelValue', null);
  emit('update:productName', '');
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

/* 직접 입력 관련 스타일 */
.manual-input {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.manual-icon-wrapper {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 0.5rem;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.manual-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #22c55e;
}

.manual-label {
  color: #16a34a;
  font-weight: 500;
}

/* 선택 옵션 영역 */
.selection-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 구분선 */
.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
}

/* 직접 입력 필드 */
.manual-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.manual-input-field {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.2s;
}

.manual-input-field:focus {
  outline: none;
  background: white;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.manual-input-field::placeholder {
  color: #9ca3af;
}

.confirm-btn {
  padding: 0.75rem 1.25rem;
  background: #22c55e;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.confirm-btn:hover:not(:disabled) {
  background: #16a34a;
}

.confirm-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .product-selector {
    padding: 1.25rem;
  }

  .product-thumbnail {
    width: 3.5rem;
    height: 3.5rem;
  }

  .manual-icon-wrapper {
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

  .manual-input-wrapper {
    flex-direction: column;
  }

  .confirm-btn {
    width: 100%;
  }
}
</style>