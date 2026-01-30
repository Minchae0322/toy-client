<script setup>
import { ref, computed, watch } from 'vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  parentId: {
    type: Number,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  categoryName: '',
  description: '',
  categoryCode: '',
  keywords: [],
  parentId: props.parentId
})

watch(() => props.parentId, (newVal) => {
  formData.value.parentId = newVal
}, { immediate: true })

const { open } = useConfirmDialog()

const keywordInput = ref('')

const availableParentCategories = computed(() => {
  return props.categories.filter(cat => (cat.depth || 0) < 2)
})

const selectedParentName = computed(() => {
  if (!formData.value.parentId) return null
  const parent = props.categories.find(c => c.categoryId === formData.value.parentId)
  return parent ? parent.categoryName : null
})

const onParentChange = (event) => {
  const value = event.target.value
  formData.value.parentId = value === '' || value === 'null' ? null : Number(value)
}

const handleSubmit = async () => {
  if (!formData.value.categoryName.trim()) {
    await open({ type: 'alert', title: '알림', message: '카테고리 이름은 필수입니다.' })
    return
  }

  const categoryCode = formData.value.categoryCode.trim() ||
      formData.value.categoryName.trim().toUpperCase().replace(/\s+/g, '_')

  const keywordsString = formData.value.keywords
  .filter(keyword => keyword.trim() !== '')
  .join(',')

  const data = {
    categoryName: formData.value.categoryName.trim(),
    description: formData.value.description.trim() || null,
    categoryCode: categoryCode,
    keywords: keywordsString,
    parentId: formData.value.parentId
  }

  emit('submit', data)
  resetForm()
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
}

const resetForm = () => {
  formData.value = {
    categoryName: '',
    description: '',
    categoryCode: '',
    keywords: [],
    parentId: props.parentId
  }
  keywordInput.value = ''
}

const addKeyword = () => {
  const keyword = keywordInput.value.trim()
  if (keyword && !formData.value.keywords.includes(keyword) && formData.value.keywords.length < 10) {
    formData.value.keywords.push(keyword)
    keywordInput.value = ''
  }
}

const removeKeyword = (index) => {
  formData.value.keywords.splice(index, 1)
}

const handleKeywordKeyup = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    addKeyword()
  }
}

const generateCategoryCode = () => {
  if (formData.value.categoryName.trim()) {
    formData.value.categoryCode = formData.value.categoryName.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9가-힣]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
  }
}
</script>

<template>
  <div class="form-container">
    <!-- 헤더 -->
    <div class="form-header">
      <div class="header-content">
        <h2 class="form-title">
          {{ parentId ? '하위 카테고리 추가' : '새 카테고리 추가' }}
        </h2>
        <p v-if="parentId && selectedParentName" class="form-subtitle">
          {{ selectedParentName }} 하위에 카테고리를 생성합니다
        </p>
      </div>
      <button @click="handleCancel" class="close-button" type="button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- 바디 -->
    <div class="form-body">
      <div class="form-grid">
        <!-- 부모 카테고리 선택 -->
        <div v-if="!parentId" class="form-group full">
          <label class="form-label">부모 카테고리</label>
          <select
              :value="formData.parentId"
              @change="onParentChange"
              class="form-select"
          >
            <option :value="null">최상위 카테고리</option>
            <option
                v-for="category in availableParentCategories"
                :key="category.categoryId"
                :value="category.categoryId"
            >
              {{ '└ '.repeat(category.depth || 0) }}{{ category.categoryName }}
            </option>
          </select>
          <span class="form-hint">선택하지 않으면 최상위 카테고리로 생성됩니다</span>
        </div>

        <!-- 부모 정보 표시 -->
        <div v-else class="parent-info full">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7h10M5 11h10M5 15h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <div class="info-content">
            <div class="info-label">부모 카테고리</div>
            <div class="info-value">{{ selectedParentName }}</div>
          </div>
        </div>

        <!-- 카테고리명 -->
        <div class="form-group">
          <label class="form-label">
            카테고리명
            <span class="required">*</span>
          </label>
          <input
              v-model="formData.categoryName"
              type="text"
              placeholder="예: 의류, 전자제품"
              class="form-input"
              maxlength="100"
          />
        </div>

        <!-- 카테고리 코드 -->
        <div class="form-group">
          <label class="form-label">카테고리 코드</label>
          <div class="input-with-button">
            <input
                v-model="formData.categoryCode"
                type="text"
                placeholder="자동 생성"
                class="form-input"
                maxlength="50"
            />
            <button
                type="button"
                @click="generateCategoryCode"
                class="generate-button"
                title="카테고리명으로 자동 생성"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 5v6M5 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <span class="form-hint">영문 대문자, 숫자, 언더스코어 권장</span>
        </div>

        <!-- 설명 -->
        <div class="form-group full">
          <label class="form-label">설명</label>
          <textarea
              v-model="formData.description"
              placeholder="카테고리에 대한 설명을 입력하세요"
              class="form-textarea"
              maxlength="500"
              rows="3"
          ></textarea>
        </div>

        <!-- 키워드 -->
        <div class="form-group full">
          <label class="form-label">
            키워드
            <span class="count-badge">{{ formData.keywords.length }}/10</span>
          </label>
          <div class="keyword-input-wrapper">
            <input
                v-model="keywordInput"
                type="text"
                placeholder="키워드 입력 후 Enter"
                class="form-input"
                maxlength="20"
                @keyup="handleKeywordKeyup"
            />
            <button
                type="button"
                @click="addKeyword"
                class="add-button"
                :disabled="!keywordInput.trim() || formData.keywords.length >= 10"
            >
              추가
            </button>
          </div>
          <div v-if="formData.keywords.length > 0" class="keyword-list">
            <span
                v-for="(keyword, index) in formData.keywords"
                :key="index"
                class="keyword-tag"
            >
              {{ keyword }}
              <button @click="removeKeyword(index)" class="remove-button" type="button">×</button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 푸터 -->
    <div class="form-footer">
      <button @click="handleCancel" class="button button-secondary" type="button">
        취소
      </button>
      <button @click="handleSubmit" class="button button-primary" type="button">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        추가
      </button>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  overflow: hidden;
}

/* 헤더 */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.header-content {
  flex: 1;
}

.form-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.2px;
}

.form-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-button:hover {
  background: #e2e8f0;
  color: #475569;
}

/* 바디 */
.form-body {
  padding: 28px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.required {
  color: #ef4444;
}

.count-badge {
  margin-left: auto;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  border: 1px solid #cbd5e0;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  color: #0f172a;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #94a3b8;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
}

.form-textarea {
  resize: vertical;
  min-height: 90px;
  line-height: 1.6;
}

.form-hint {
  font-size: 12px;
  color: #64748b;
}

/* 부모 정보 */
.parent-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
}

.info-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

/* 인풋 그룹 */
.input-with-button {
  display: flex;
  gap: 8px;
}

.input-with-button .form-input {
  flex: 1;
}

.generate-button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: #0f172a;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.generate-button:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

/* 키워드 */
.keyword-input-wrapper {
  display: flex;
  gap: 8px;
}

.keyword-input-wrapper .form-input {
  flex: 1;
}

.add-button {
  padding: 0 20px;
  border-radius: 8px;
  border: none;
  background: #22c55e;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-button:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-1px);
}

.add-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #bfdbfe;
}

.remove-button {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-button:hover {
  background: rgba(59, 130, 246, 0.15);
}

/* 푸터 */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 28px;
  background: #fafbfc;
  border-top: 1px solid #f1f5f9;
}

.button {
  padding: 11px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.button-secondary {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e0;
}

.button-secondary:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.button-primary {
  background: #0f172a;
  color: white;
}

.button-primary:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
}

/* 모바일 */
@media (max-width: 768px) {
  .form-header {
    padding: 20px;
  }

  .form-title {
    font-size: 16px;
  }

  .form-body {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-group.full {
    grid-column: 1;
  }

  .form-footer {
    padding: 16px 20px;
    flex-direction: column-reverse;
  }

  .button {
    width: 100%;
    justify-content: center;
  }

  .keyword-input-wrapper {
    flex-direction: column;
  }

  .add-button {
    width: 100%;
  }
}
</style>