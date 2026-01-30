<template>
  <section class="section">
    <div class="section-header">
      <h2>일반 판매 옵션</h2>
      <button
          v-if="localValue.length < 5"
          @click="addOption"
          class="btn-add"
      >
        + 옵션 추가
      </button>
    </div>

    <div class="options-list">
      <div
          v-for="(option, index) in localValue"
          :key="index"
          class="option-card"
      >
        <div class="option-header">
          <h3>옵션 {{ index + 1 }}</h3>
          <button
              v-if="localValue.length > 1"
              @click="removeOption(index)"
              class="btn-remove"
          >
            삭제
          </button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>
              옵션명
              <span class="required">*</span>
            </label>
            <input
                v-model="option.optionName"
                type="text"
                placeholder="예: 5개입"
                maxlength="100"
                class="input"
            >
          </div>

          <div class="form-group">
            <label>
              가격
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <input
                  v-model.number="option.price"
                  type="number"
                  placeholder="15000"
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
              재고
              <span class="required">*</span>
            </label>
            <input
                v-model.number="option.totalStock"
                type="number"
                placeholder="50"
                min="0"
                class="input"
            >
          </div>

          <div class="form-group">
            <label>원가 (선택)</label>
            <div class="input-wrapper">
              <input
                  v-model.number="option.originalPrice"
                  type="number"
                  placeholder="20000"
                  min="0"
                  class="input with-suffix"
              >
              <span class="suffix">원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useConfirmDialog } from '@/composables/useConfirmDialog';

const props = defineProps({
  modelValue: Array
});

const emit = defineEmits(['update:modelValue']);

const { open } = useConfirmDialog();

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const addOption = async () => {
  if (localValue.value.length >= 5) {
    await open({ type: 'alert', title: '알림', message: '옵션은 최대 5개까지만 추가 가능합니다.' });
    return;
  }

  localValue.value = [
    ...localValue.value,
    {
      optionName: '',
      price: null,
      totalStock: null,
      originalPrice: null
    }
  ];
};

const removeOption = async (index) => {
  if (localValue.value.length <= 1) {
    await open({ type: 'alert', title: '알림', message: '최소 1개의 옵션이 필요합니다.' });
    return;
  }
  localValue.value = localValue.value.filter((_, i) => i !== index);
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

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-add {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4f46e5;
  background: none;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: inherit;
}

.btn-add:hover {
  background: rgba(79, 70, 229, 0.1);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-card {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.option-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-remove {
  padding: 0;
  font-size: 0.875rem;
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.btn-remove:hover {
  color: #dc2626;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row:last-child {
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>