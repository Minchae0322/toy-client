<template>
  <div class="form-section">
    <div class="section-header">
      <h3 class="section-title">기본 정보</h3>
      <span class="required-badge">필수</span>
    </div>

    <div class="form-grid">
      <!-- 제품명 -->
      <div class="form-group full-width">
        <label class="form-label">
          제품명 <span class="required">*</span>
        </label>
        <input
            v-model="localForm.name"
            type="text"
            class="form-input"
            :class="{
              'error': errors.name,
              'success': localForm.name.length >= 2 && !errors.name
            }"
            placeholder="정확한 제품명을 입력해주세요 (예: 스타벅스 콜드브루 커피)"
            maxlength="100"
            :disabled="!isLoggedIn"
            @blur="$emit('validate', 'name')"
            @input="$emit('validate', 'name')"
        >
        <div class="input-footer">
          <div v-if="errors.name" class="validation-message error">
            {{ errors.name }}
          </div>
          <div v-else-if="localForm.name.length >= 2" class="validation-message success">
            올바른 제품명입니다
          </div>
          <div class="char-counter" :class="{ 'warning': localForm.name.length > 90 }">
            {{ localForm.name.length }}/100
          </div>
        </div>
      </div>

      <!-- 브랜드 -->
      <div class="form-group">
        <label class="form-label">
          브랜드/제조사 <span class="required">*</span>
        </label>
        <input
            v-model="localForm.brand"
            type="text"
            class="form-input"
            :class="{
              'error': errors.brand,
              'success': localForm.brand.length >= 1 && !errors.brand
            }"
            placeholder="예: 스타벅스, CU, 맥도날드"
            maxlength="100"
            :disabled="!isLoggedIn"
            @blur="$emit('validate', 'brand')"
            @input="$emit('validate', 'brand')"
        >
        <div v-if="errors.brand" class="validation-message error">
          {{ errors.brand }}
        </div>
        <div v-else-if="localForm.brand.length >= 1" class="validation-message success">
          확인됨
        </div>
      </div>

      <!-- 카테고리 -->
      <div class="form-group">
        <label class="form-label">
          카테고리 <span class="required">*</span>
        </label>
        <select
            v-model="localForm.categoryId"
            class="form-input"
            :class="{
              'error': errors.categoryId,
              'success': localForm.categoryId && !errors.categoryId
            }"
            :disabled="!isLoggedIn || categories.length === 0"
            @change="$emit('validate', 'categoryId')"
        >
          <option value="" disabled>{{
              categories.length === 0 ? '카테고리를 불러오는 중...' : '카테고리를 선택하세요'
            }}
          </option>
          <option
              v-for="category in categories"
              :key="category.categoryId"
              :value="category.categoryId"
          >
            {{ category.categoryName }}
          </option>
        </select>
        <div v-if="errors.categoryId" class="validation-message error">
          {{ errors.categoryId }}
        </div>
        <div v-else-if="localForm.categoryId" class="validation-message success">
          선택 완료
        </div>
        <div v-else-if="categories.length === 0" class="form-help error">
          카테고리를 불러올 수 없습니다
        </div>
      </div>

      <!-- 정가 -->
      <div class="form-group">
        <label class="form-label">
          정가 <span class="required">*</span>
        </label>
        <div class="price-input-wrapper">
          <input
              v-model="localForm.price"
              type="text"
              class="form-input"
              :class="{
                'error': errors.price,
                'success': localForm.price && !errors.price
              }"
              placeholder="0"
              pattern="[0-9]*"
              maxlength="10"
              :disabled="!isLoggedIn"
              @input="validatePrice"
              @blur="$emit('validate', 'price')"
          >
          <span class="price-unit">원</span>
        </div>
        <div v-if="errors.price" class="validation-message error">
          {{ errors.price }}
        </div>
        <div v-else-if="localForm.price && !errors.price" class="validation-message success">
          확인됨
        </div>
        <div v-else class="form-help">
          브랜드 공식 판매가격 (필수)
        </div>
      </div>

      <!-- 출시일 -->
      <div class="form-group">
        <label class="form-label">
          출시일 <span class="optional">(선택)</span>
        </label>
        <input
            v-model="localForm.releaseDate"
            type="date"
            class="form-input"
            :class="{ 'success': localForm.releaseDate }"
            :max="today"
            :disabled="!isLoggedIn"
        >
        <div class="form-help">
          브랜드 공식 출시일
        </div>
      </div>

      <!-- 판매처 -->
      <div class="form-group">
        <label class="form-label">
          판매처/유통업체 <span class="optional">(선택)</span>
        </label>
        <input
            v-model="localForm.distributor"
            type="text"
            class="form-input"
            :class="{ 'success': localForm.distributor.length > 0 }"
            placeholder="예: 편의점(GS25, CU), 대형마트, 온라인몰"
            maxlength="1000"
            :disabled="!isLoggedIn"
        >
        <div class="form-help">
          어디서 구매할 수 있는지 입력해주세요
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    required: true
  },
  errors: {
    type: Object,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:form', 'validate'])

const localForm = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const validatePrice = () => {
  localForm.value.price = localForm.value.price.replace(/[^0-9]/g, '')
  if (localForm.value.price && localForm.value.price.length > 10) {
    localForm.value.price = localForm.value.price.substring(0, 10)
  }
}
</script>

<style scoped>
.form-section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #F3F4F6;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.required-badge {
  padding: 4px 12px;
  background: #FEE2E2;
  color: #DC2626;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.required {
  color: #DC2626;
  font-weight: 700;
}

.optional {
  font-size: 12px;
  font-weight: 500;
  color: #9CA3AF;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
  color: #111827;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.form-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.form-input:disabled {
  background: #F9FAFB;
  color: #9CA3AF;
  cursor: not-allowed;
}

.form-input.error {
  border-color: #EF4444;
  background: #FEF2F2;
}

.form-input.success {
  border-color: #10B981;
  background: #F0FDF4;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  gap: 12px;
}

.validation-message {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.validation-message.error {
  color: #DC2626;
}

.validation-message.success {
  color: #059669;
}

.char-counter {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
}

.char-counter.warning {
  color: #F59E0B;
  font-weight: 600;
}

.form-help {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 6px;
  font-weight: 500;
}

.form-help.error {
  color: #DC2626;
}

.price-input-wrapper {
  position: relative;
}

.price-unit {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>