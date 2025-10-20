<template>
  <section class="section">
    <h2>한입만 판매 옵션</h2>

    <div class="form-row">
      <div class="form-group">
        <label>
          한입 수량
          <span class="required">*</span>
        </label>
        <input
            v-model.number="localValue.unitQuantity"
            type="number"
            placeholder="2"
            min="1"
            class="input"
        >
        <p class="hint">한 번에 판매할 개수</p>
      </div>

      <div class="form-group">
        <label>
          한입 가격
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
              v-model.number="localValue.unitPrice"
              type="number"
              placeholder="3000"
              min="0"
              class="input with-suffix"
          >
          <span class="suffix">원</span>
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>
          총 판매 수량
          <span class="required">*</span>
        </label>
        <input
            v-model.number="localValue.totalBiteCount"
            type="number"
            placeholder="10"
            min="1"
            class="input"
        >
        <p class="hint">총 몇 개 판매할지</p>
      </div>

      <div class="form-group">
        <label>원가 (선택)</label>
        <div class="input-wrapper">
          <input
              v-model.number="localValue.originalPrice"
              type="number"
              placeholder="5000"
              min="0"
              class="input with-suffix"
          >
          <span class="suffix">원</span>
        </div>
        <p class="hint">할인율 계산용</p>
      </div>
    </div>

    <div class="form-group">
      <label>옵션명 (선택)</label>
      <input
          v-model="localValue.optionName"
          type="text"
          placeholder="예: 2개 한입 세트"
          maxlength="100"
          class="input"
      >
    </div>

    <!-- 가격 미리보기 -->
    <div v-if="localValue.unitPrice && localValue.unitQuantity" class="preview">
      <div class="preview-item">
        <span>한입 가격</span>
        <strong>{{ formatPrice(localValue.unitPrice) }}</strong>
      </div>
      <div class="preview-item">
        <span>총 수량</span>
        <strong>{{ localValue.totalBiteCount }}개</strong>
      </div>
      <div v-if="localValue.originalPrice" class="preview-item discount">
        <span>할인율</span>
        <strong>{{ calculateDiscount(localValue.unitPrice, localValue.originalPrice) }}%</strong>
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

const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(price);
};

const calculateDiscount = (price, originalPrice) => {
  if (!originalPrice || originalPrice === 0) return 0;
  return Math.round((1 - price / originalPrice) * 100);
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

.hint {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
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

.preview-item.discount strong {
  color: #ef4444;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>