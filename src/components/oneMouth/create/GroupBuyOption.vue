<template>
  <section class="section">
    <h2>공동구매 옵션</h2>

    <div class="form-group">
      <label>
        공동구매 타입
        <span class="required">*</span>
      </label>
      <div class="radio-group">
        <label class="radio-card" :class="{ active: localValue.groupBuyType === 'OPEN' }">
          <input
              type="radio"
              value="OPEN"
              v-model="localValue.groupBuyType"
          >
          <div class="radio-label">오픈형</div>
          <div class="radio-desc">누구나 참여 가능</div>
        </label>

        <label class="radio-card" :class="{ active: localValue.groupBuyType === 'PRIVATE' }">
          <input
              type="radio"
              value="PRIVATE"
              v-model="localValue.groupBuyType"
          >
          <div class="radio-label">지인끼리</div>
          <div class="radio-desc">초대 링크 필요</div>
        </label>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>
          목표 인원
          <span class="required">*</span>
        </label>
        <input
            v-model.number="localValue.targetCount"
            type="number"
            placeholder="20"
            min="2"
            class="input"
        >
        <p class="hint">최소 2명 이상</p>
      </div>

      <div class="form-group">
        <label>
          마감 기한
          <span class="required">*</span>
        </label>
        <input
            v-model="localValue.deadline"
            type="datetime-local"
            :min="minDateTime"
            class="input"
        >
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>
          할인 가격
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
              v-model.number="localValue.discountedPrice"
              type="number"
              placeholder="10000"
              min="0"
              class="input with-suffix"
          >
          <span class="suffix">원</span>
        </div>
        <p class="hint">목표 달성 시 가격</p>
      </div>

      <div class="form-group">
        <label>정상 가격 (선택)</label>
        <div class="input-wrapper">
          <input
              v-model.number="localValue.normalPrice"
              type="number"
              placeholder="15000"
              min="0"
              class="input with-suffix"
          >
          <span class="suffix">원</span>
        </div>
        <p class="hint">목표 미달 시 가격</p>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>할인율 (선택)</label>
        <div class="input-wrapper">
          <input
              v-model.number="localValue.discountRate"
              type="number"
              placeholder="33"
              min="0"
              max="100"
              class="input with-suffix"
          >
          <span class="suffix">%</span>
        </div>
      </div>

      <div class="form-group">
        <label>옵션명 (선택)</label>
        <input
            v-model="localValue.optionName"
            type="text"
            placeholder="예: 20명 공동구매"
            maxlength="100"
            class="input"
        >
      </div>
    </div>

    <!-- 미리보기 -->
    <div v-if="localValue.discountedPrice && localValue.targetCount" class="preview">
      <div class="preview-item">
        <span>목표 인원</span>
        <strong>{{ localValue.targetCount }}명</strong>
      </div>
      <div class="preview-item">
        <span>할인 가격</span>
        <strong>{{ formatPrice(localValue.discountedPrice) }}</strong>
      </div>
      <div v-if="localValue.normalPrice" class="preview-item">
        <span>정상 가격</span>
        <strong>{{ formatPrice(localValue.normalPrice) }}</strong>
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

.radio-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.radio-card {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-card:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.radio-card.active {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.radio-card input {
  display: none;
}

.radio-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.radio-desc {
  font-size: 0.75rem;
  color: #6b7280;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .radio-group {
    grid-template-columns: 1fr;
  }
}
</style>