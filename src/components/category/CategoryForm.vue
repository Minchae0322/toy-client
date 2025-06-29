<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  categoryName: '',
  description: '',
  categoryCode: '',
  keywords: []
})

const keywordInput = ref('')

const handleSubmit = () => {
  if (!formData.value.categoryName.trim()) {
    alert('카테고리 이름은 필수입니다.')
    return
  }

  // 카테고리 코드가 없으면 카테고리명으로 자동 생성
  const categoryCode = formData.value.categoryCode.trim() ||
      formData.value.categoryName.trim().toUpperCase().replace(/\s+/g, '_')

  const data = {
    categoryName: formData.value.categoryName.trim(),
    description: formData.value.description.trim() || '',
    categoryCode: categoryCode,
    keywords: formData.value.keywords.filter(keyword => keyword.trim() !== '')
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
    keywords: []
  }
  keywordInput.value = ''
}

// 키워드 관리 함수들
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

// 카테고리 코드 자동 생성
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
  <div class="form-section">
    <div class="form-header">
      <h2>새 카테고리 추가</h2>
      <button @click="handleCancel" class="close-button">✕</button>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label for="categoryName">카테고리 이름 *</label>
        <input
            id="categoryName"
            v-model="formData.categoryName"
            type="text"
            placeholder="카테고리 이름을 입력하세요"
            class="form-input"
            maxlength="100"
            required
        />
        <small class="field-hint">최대 100자</small>
      </div>

      <div class="form-group">
        <label for="categoryCode">카테고리 코드</label>
        <div class="input-with-button">
          <input
              id="categoryCode"
              v-model="formData.categoryCode"
              type="text"
              placeholder="자동 생성되거나 직접 입력"
              class="form-input"
              maxlength="50"
          />
          <button
              type="button"
              @click="generateCategoryCode"
              class="generate-button"
              title="카테고리명으로 코드 자동 생성"
          >
            🔄
          </button>
        </div>
        <small class="field-hint">최대 50자, 영문 대문자와 숫자, 언더스코어 권장</small>
      </div>

      <div class="form-group description-full">
        <label for="description">설명</label>
        <textarea
            id="description"
            v-model="formData.description"
            placeholder="카테고리 설명을 입력하세요"
            class="form-textarea"
            maxlength="500"
            rows="3"
        ></textarea>
        <small class="field-hint">최대 500자</small>
      </div>
    </div>

    <!-- 키워드 섹션 -->
    <div class="keywords-section">
      <label class="keywords-label">키워드 (최대 10개)</label>

      <div class="keyword-input-wrapper">
        <input
            v-model="keywordInput"
            type="text"
            placeholder="키워드를 입력하고 Enter를 누르세요"
            class="keyword-input"
            maxlength="20"
            @keyup="handleKeywordKeyup"
        />
        <button
            type="button"
            @click="addKeyword"
            class="add-keyword-button"
            :disabled="!keywordInput.trim() || formData.keywords.length >= 10"
        >
          추가
        </button>
      </div>

      <div v-if="formData.keywords.length > 0" class="keywords-list">
        <div
            v-for="(keyword, index) in formData.keywords"
            :key="index"
            class="keyword-tag"
        >
          <span>{{ keyword }}</span>
          <button
              type="button"
              @click="removeKeyword(index)"
              class="remove-keyword"
              title="키워드 삭제"
          >
            ✕
          </button>
        </div>
      </div>

      <small class="field-hint">
        키워드당 최대 20자, 총 {{ formData.keywords.length }}/10개
      </small>
    </div>

    <div class="form-actions">
      <button @click="handleCancel" class="cancel-button">취소</button>
      <button @click="handleSubmit" class="save-button">추가</button>
    </div>
  </div>
</template>

<style scoped>
.form-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 16px;
  margin-bottom: 16px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input,
.form-textarea,
.form-select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.input-with-button .form-input {
  flex: 1;
}

.generate-button {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.generate-button:hover {
  background: #e5e7eb;
}

.field-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 키워드 섹션 */
.keywords-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.keywords-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
  display: block;
}

.keyword-input-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.keyword-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.keyword-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.add-keyword-button {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-keyword-button:hover:not(:disabled) {
  background: #059669;
}

.add-keyword-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.keyword-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #dbeafe;
  color: #1e40af;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.remove-keyword {
  background: none;
  border: none;
  color: #1e40af;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  margin-left: 2px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-keyword:hover {
  background: rgba(30, 64, 175, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-button,
.save-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-button:hover {
  background: #f9fafb;
}

.save-button {
  background: #10b981;
  color: white;
  border: none;
}

.save-button:hover {
  background: #059669;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .form-section {
    padding: 12px;
    margin-bottom: 12px;
  }

  .form-header {
    margin-bottom: 16px;
  }

  .form-header h2 {
    font-size: 14px;
  }

  .form-grid {
    gap: 12px;
    margin-bottom: 16px;
  }

  .keywords-section {
    padding: 12px;
    margin-bottom: 16px;
  }

  .keyword-input-wrapper {
    flex-direction: column;
    gap: 8px;
  }

  .add-keyword-button {
    width: 100%;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .cancel-button,
  .save-button {
    width: 100%;
    padding: 12px;
  }
}

/* 태블릿 */
@media (min-width: 768px) {
  .form-section {
    padding: 20px;
    margin-bottom: 20px;
  }

  .form-header h2 {
    font-size: 18px;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .description-full {
    grid-column: 1 / -1;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .form-section {
    padding: 24px;
    margin-bottom: 24px;
  }

  .form-grid {
    gap: 24px;
  }

  .keywords-section {
    padding: 20px;
  }
}
</style>