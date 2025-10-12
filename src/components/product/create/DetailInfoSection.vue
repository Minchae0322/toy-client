<template>
  <div class="form-section">
    <div class="section-header">
      <h3 class="section-title">상세 정보</h3>
      <span class="optional-badge">선택</span>
    </div>

    <!-- 제품 설명 -->
    <div class="form-group">
      <label class="form-label">
        제품 설명 <span class="optional">(선택)</span>
      </label>
      <textarea
          v-model="localForm.description"
          class="form-textarea"
          :class="{ 'success': localForm.description.length > 0 }"
          placeholder="제품의 특징, 맛, 용량, 성분 등을 자세히 설명해주세요&#10;&#10;예시:&#10;- 진한 콜드브루 원액에 부드러운 우유를 더한 시그니처 음료&#10;- 용량: 275ml&#10;- 칼로리: 150kcal"
          maxlength="1000"
          :disabled="!isLoggedIn"
          rows="6"
      ></textarea>
      <div class="input-footer">
        <div v-if="localForm.description.length > 0" class="form-help">
          구매자가 제품을 잘 이해할 수 있도록 상세히 작성해주세요
        </div>
        <div class="char-counter" :class="{ 'warning': localForm.description.length > 900 }">
          {{ localForm.description.length }}/1000
        </div>
      </div>
    </div>

    <!-- 주요 특징 -->
    <div class="form-group">
      <label class="form-label">
        주요 특징 <span class="optional">(선택)</span>
      </label>
      <div class="checkbox-grid">
        <label
            v-for="feature in predefinedFeatures"
            :key="feature"
            class="checkbox-item"
            :class="{
              'active': localSelectedFeatures.includes(feature),
              'disabled': !isLoggedIn
            }"
        >
          <input
              type="checkbox"
              :value="feature"
              v-model="localSelectedFeatures"
              :disabled="!isLoggedIn"
          >
          <span class="checkbox-label">{{ feature }}</span>
        </label>
      </div>

      <div class="custom-feature-wrapper">
        <input
            v-model="localCustomFeature"
            type="text"
            placeholder="직접 입력 후 Enter를 눌러 추가"
            class="form-input"
            @keydown.enter.prevent="$emit('add-custom-feature')"
            :disabled="!isLoggedIn"
        >
        <button
            type="button"
            class="btn-add"
            @click="$emit('add-custom-feature')"
            :disabled="!isLoggedIn || !localCustomFeature.trim()"
        >
          추가
        </button>
      </div>

      <div v-if="localSelectedFeatures.length > 0" class="selected-info">
        {{ localSelectedFeatures.length }}개 선택됨
      </div>
    </div>

    <!-- 검색 태그 -->
    <div class="form-group">
      <label class="form-label">
        검색 태그 <span class="optional">(선택)</span>
        <span class="label-hint">최대 10개</span>
      </label>
      <div class="tag-container"
           :class="{
             'disabled': !isLoggedIn,
             'has-tags': localSelectedTags.length > 0
           }"
           @click="isLoggedIn && focusTagInput()">
        <div
            v-for="(tag, index) in localSelectedTags"
            :key="index"
            class="tag-item"
        >
          <span class="tag-text">{{ tag }}</span>
          <button
              type="button"
              class="tag-remove"
              @click.stop="isLoggedIn && $emit('remove-tag', index)"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <input
            ref="tagInput"
            v-model="currentTag"
            type="text"
            class="tag-input"
            :placeholder="localSelectedTags.length === 0 ? '태그를 입력하고 Enter를 눌러주세요 (예: 달콤한, 쌉싸름한)' : ''"
            @keydown.enter.prevent="handleAddTag"
            @keydown.backspace="handleBackspace"
            :disabled="!isLoggedIn || localSelectedTags.length >= 10"
        >
      </div>
      <div class="input-footer">
        <div class="form-help">
          검색에 도움이 되는 키워드를 입력해주세요
        </div>
        <div v-if="localSelectedTags.length > 0" class="selected-info">
          {{ localSelectedTags.length }}/10
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  selectedFeatures: {
    type: Array,
    required: true
  },
  selectedTags: {
    type: Array,
    required: true
  },
  customFeature: {
    type: String,
    default: ''
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits([
  'update:form',
  'update:selected-features',
  'update:selected-tags',
  'update:custom-feature',
  'add-custom-feature',
  'add-tag',
  'remove-tag'
])

const tagInput = ref(null)
const currentTag = ref('')

const predefinedFeatures = [
  '신제품', '한정판매', '시즌상품', '베스트셀러',
  '프리미엄', '할인상품', '인기상품', '추천상품'
]

const localForm = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const localSelectedFeatures = computed({
  get: () => props.selectedFeatures,
  set: (value) => emit('update:selected-features', value)
})

const localSelectedTags = computed({
  get: () => props.selectedTags,
  set: (value) => emit('update:selected-tags', value)
})

const localCustomFeature = computed({
  get: () => props.customFeature,
  set: (value) => emit('update:custom-feature', value)
})

const focusTagInput = () => {
  nextTick(() => {
    tagInput.value?.focus()
  })
}

const handleAddTag = () => {
  const tag = currentTag.value.trim()
  if (tag) {
    emit('add-tag', tag)
    currentTag.value = ''
  }
}

const handleBackspace = () => {
  if (!currentTag.value && localSelectedTags.value.length > 0) {
    emit('remove-tag', localSelectedTags.value.length - 1)
  }
}

defineExpose({
  focusTagInput
})
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

.optional-badge {
  padding: 4px 12px;
  background: #ECFDF5;
  color: #059669;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.optional {
  font-size: 12px;
  font-weight: 500;
  color: #9CA3AF;
}

.label-hint {
  font-size: 11px;
  font-weight: 500;
  color: #9CA3AF;
  background: #F9FAFB;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.form-textarea {
  padding: 12px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
  color: #111827;
  font-weight: 500;
  letter-spacing: -0.01em;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

.form-textarea:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.form-textarea:disabled {
  background: #F9FAFB;
  color: #9CA3AF;
  cursor: not-allowed;
}

.form-textarea.success {
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

.form-help {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
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

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  background: white;
}

.checkbox-item:hover:not(.disabled) {
  border-color: #059669;
  background: #F9FAFB;
}

.checkbox-item.active {
  border-color: #059669;
  background: #ECFDF5;
  color: #059669;
}

.checkbox-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-item input {
  margin: 0;
  cursor: pointer;
}

.checkbox-label {
  user-select: none;
  cursor: pointer;
}

.custom-feature-wrapper {
  display: flex;
  gap: 8px;
}

.form-input {
  flex: 1;
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

.btn-add {
  padding: 12px 20px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.btn-add:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
}

.btn-add:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
}

.selected-info {
  font-size: 12px;
  color: #059669;
  font-weight: 600;
  padding: 4px 10px;
  background: #ECFDF5;
  border-radius: 10px;
  display: inline-block;
  margin-top: 8px;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  min-height: 48px;
  cursor: text;
  transition: all 0.2s;
  background: white;
}

.tag-container:focus-within {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.tag-container.disabled {
  background: #F9FAFB;
  border-color: #E5E7EB;
  cursor: not-allowed;
  opacity: 0.8;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #059669;
  color: white;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.tag-text {
  user-select: none;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tag-input {
  flex: 1;
  min-width: 120px;
  border: none;
  outline: none;
  padding: 4px 0;
  font-size: 14px;
  background: transparent;
  font-weight: 500;
}

.tag-input:disabled {
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .checkbox-grid {
    grid-template-columns: 1fr;
  }

  .custom-feature-wrapper {
    flex-direction: column;
  }

  .btn-add {
    width: 100%;
  }
}
</style>