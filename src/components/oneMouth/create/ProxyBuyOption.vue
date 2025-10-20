<template>
  <section class="section">
    <h2>대리구매 옵션</h2>

    <div class="form-row">
      <div class="form-group">
        <label>
          예상 제품 가격
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
              v-model.number="localValue.estimatedProductPrice"
              type="number"
              placeholder="50000"
              min="0"
              class="input with-suffix"
          >
          <span class="suffix">원</span>
        </div>
      </div>

      <div class="form-group">
        <label>
          대리구매 수수료
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
              v-model.number="localValue.serviceFee"
              type="number"
              placeholder="5000"
              min="0"
              class="input with-suffix"
          >
          <span class="suffix">원</span>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label>
        구매 예정 장소
        <span class="required">*</span>
      </label>
      <input
          v-model="localValue.purchaseLocation"
          type="text"
          placeholder="예: 명동 매장"
          maxlength="500"
          class="input"
      >
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>예상 구매 일시</label>
        <input
            v-model="localValue.expectedPurchaseDate"
            type="datetime-local"
            :min="minDateTime"
            class="input"
        >
      </div>

      <div class="form-group">
        <label>
          최대 수량
          <span class="required">*</span>
        </label>
        <input
            v-model.number="localValue.maxQuantity"
            type="number"
            placeholder="5"
            min="1"
            class="input"
        >
      </div>
    </div>

    <div class="form-group">
      <label>옵션명 (선택)</label>
      <input
          v-model="localValue.optionName"
          type="text"
          placeholder="예: 명동 대리구매"
          maxlength="100"
          class="input"
      >
    </div>

    <!-- 총액 미리보기 -->
    <div v-if="localValue.estimatedProductPrice && localValue.serviceFee" class="preview">
      <div class="preview-item">
        <span>예상 제품 가격</span>
        <strong>{{ formatPrice(localValue.estimatedProductPrice) }}</strong>
      </div>
      <div class="preview-item">
        <span>수수료</span>
        <strong>{{ formatPrice(localValue.serviceFee) }}</strong>
      </div>
      <div class="preview-item total">
        <span>총 예상 금액</span>
        <strong>{{ formatPrice(localValue.estimatedProductPrice + localValue.serviceFee) }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const minDateTime = computed(() => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().slice(0, 16);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(price);
};
</script>

<style scoped>
.section {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.section h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-wrapper {
  position: relative;
}

.input.with-suffix {
  padding-right: 2.5rem;
}

.suffix {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  color: #6b7280;
  pointer-events: none;
}

.preview {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-item span {
  color: #6b7280;
}

.preview-item strong {
  color: #111827;
  font-weight: 600;
}

.preview-item.total {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
}

.preview-item.total strong {
  color: #4f46e5;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>