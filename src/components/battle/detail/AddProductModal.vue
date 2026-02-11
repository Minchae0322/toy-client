<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="true" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
          <!-- Modal Header -->
          <div class="modal-header">
            <h3 class="modal-title">아이템 추가하기</h3>
            <button @click="$emit('close')" class="btn-close" type="button">
              <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- 모드 선택이 안됐을 때: 초기 화면 -->
            <div v-if="!selectedMode" class="mode-selection">
              <p class="mode-title">어떤 방식으로 아이템을 추가할까요?</p>

              <button type="button" class="mode-card" @click="selectedMode = 'search'">
                <div class="mode-icon search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <div class="mode-info">
                  <span class="mode-name">아이템 검색하기</span>
                  <span class="mode-desc">등록된 아이템 중에서 선택해요</span>
                </div>
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>

              <button type="button" class="mode-card" @click="selectedMode = 'custom'">
                <div class="mode-icon custom">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <div class="mode-info">
                  <span class="mode-name">직접 입력하기</span>
                  <span class="mode-desc">새로운 아이템을 등록해요</span>
                </div>
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            <!-- 검색 모드 -->
            <div v-else-if="selectedMode === 'search'" class="search-mode">
              <!-- 뒤로가기 -->
              <button type="button" class="back-to-mode" @click="goBackToMode">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                다른 방식 선택
              </button>

              <!-- Search Input -->
              <div class="search-section">
                <div class="search-wrapper">
                  <svg class="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    ref="searchInput"
                    v-model="searchKeyword"
                    type="text"
                    placeholder="아이템명, 브랜드로 검색..."
                    class="search-input"
                    @keyup.enter="handleSearch"
                    @input="handleSearchInput"
                  />
                  <button
                    v-if="searchKeyword"
                    type="button"
                    class="search-clear"
                    @click="clearSearch"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Search Results -->
              <div class="search-results">
                <!-- Loading -->
                <div v-if="searching" class="results-loading">
                  <div class="spinner-medium"></div>
                  <span>검색 중...</span>
                </div>

                <!-- Empty State (initial) -->
                <div v-else-if="!searchKeyword && products.length === 0" class="results-empty">
                  <div class="empty-illustration">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <p class="empty-title">아이템을 검색해보세요</p>
                  <p class="empty-desc">아이템명이나 브랜드로 검색할 수 있어요</p>
                </div>

                <!-- No Results -->
                <div v-else-if="searchKeyword && products.length === 0 && !searching" class="results-empty">
                  <div class="empty-illustration warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p class="empty-title">"{{ searchKeyword }}" 검색 결과가 없어요</p>
                  <p class="empty-desc">직접 입력으로 새 아이템을 추가해보세요</p>
                  <button type="button" class="btn-switch-mode" @click="selectedMode = 'custom'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    직접 입력하기
                  </button>
                </div>

                <!-- Product List -->
                <div v-else class="product-list">
                  <p class="results-count">검색 결과 {{ products.length }}개</p>
                  <button
                    v-for="product in products"
                    :key="product.productId || product.id"
                    type="button"
                    class="product-item"
                    @click="selectProduct(product)"
                  >
                    <img
                      :src="getProductImage(product)"
                      :alt="product.name"
                      class="product-image"
                      @error="handleImageError"
                    />
                    <div class="product-info">
                      <p class="product-name">{{ product.name }}</p>
                      <p class="product-brand">{{ product.brand }}</p>
                    </div>
                    <div class="select-badge">선택</div>
                  </button>
                </div>
              </div>
            </div>

            <!-- 직접 입력 모드 -->
            <div v-else-if="selectedMode === 'custom'" class="custom-mode">
              <!-- 뒤로가기 -->
              <button type="button" class="back-to-mode" @click="goBackToMode">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                다른 방식 선택
              </button>

              <!-- Image Upload Section -->
              <div class="form-section">
                <label class="form-label">
                  아이템 사진
                  <span class="required">*</span>
                </label>

                <div class="image-upload-area">
                  <!-- 이미지 미리보기 -->
                  <div v-if="imagePreview" class="image-preview-wrapper" :class="{ uploading: imageUploading, 'upload-failed': uploadFailed }">
                    <img :src="imagePreview" alt="Preview" class="preview-image" />

                    <!-- 업로드 중 오버레이 -->
                    <div v-if="imageUploading" class="upload-overlay">
                      <div class="spinner-small"></div>
                      <span class="overlay-text">업로드 중...</span>
                    </div>

                    <!-- 업로드 실패 오버레이 -->
                    <div v-if="uploadFailed" class="upload-failed-overlay">
                      <svg class="failed-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span class="overlay-text">업로드 실패</span>
                    </div>

                    <!-- 삭제 버튼 -->
                    <button
                      @click="$emit('clear-image')"
                      class="btn-remove-image"
                      :disabled="imageUploading"
                      type="button"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>

                  <!-- 업로드 영역 -->
                  <label v-else class="image-upload-label">
                    <div class="upload-icon-wrapper">
                      <svg class="upload-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div class="upload-text-wrapper">
                      <span class="upload-text-main">이미지 업로드</span>
                      <span class="upload-text-hint">클릭하여 선택 (최대 5MB)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      @change="handleImageChange"
                      class="hidden-input"
                    />
                  </label>
                </div>
              </div>

              <!-- Product Name -->
              <div class="form-section">
                <label class="form-label">
                  아이템명
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    :value="name"
                    @input="$emit('update:name', $event.target.value)"
                    type="text"
                    placeholder="예: AirPods Pro 2"
                    maxlength="30"
                    class="form-input"
                  />
                  <span class="char-count">{{ name.length }}/30</span>
                </div>
              </div>

              <!-- Brand -->
              <div class="form-section">
                <label class="form-label">
                  브랜드
                  <span class="optional">(선택)</span>
                </label>
                <div class="input-wrapper">
                  <input
                    :value="brand"
                    @input="$emit('update:brand', $event.target.value)"
                    type="text"
                    placeholder="예: Apple"
                    maxlength="20"
                    class="form-input"
                  />
                  <span class="char-count">{{ brand.length }}/20</span>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                @click="$emit('submit')"
                :disabled="submitting || !isCustomValid"
                class="btn-submit-custom"
                type="button"
              >
                <span v-if="submitting" class="btn-loading">
                  <span class="spinner-tiny"></span>
                  등록 중...
                </span>
                <span v-else>아이템 등록하기</span>
              </button>
            </div>
          </div>

          <!-- Modal Footer (초기 화면에서만) -->
          <div v-if="!selectedMode" class="modal-footer">
            <button @click="$emit('close')" class="btn-cancel-full" type="button">
              취소
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { productService } from '@/services/ProductService.js'

const props = defineProps({
  imagePreview: {
    type: String,
    default: null
  },
  imageUploading: {
    type: Boolean,
    default: false
  },
  uploadFailed: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    default: ''
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update:image', 'clear-image', 'update:name', 'update:brand', 'submit', 'select-product'])

// Mode state
const selectedMode = ref(null) // null, 'search', 'custom'

// Search state
const searchInput = ref(null)
const searchKeyword = ref('')
const products = ref([])
const searching = ref(false)
let searchTimeout = null

// Computed
const isCustomValid = computed(() => {
  return props.imagePreview && props.name.trim().length > 0 && !props.imageUploading && !props.uploadFailed
})

// Methods
const goBackToMode = () => {
  selectedMode.value = null
  searchKeyword.value = ''
  products.value = []
}

const handleImageChange = (e) => {
  emit('update:image', e)
}

const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (searchKeyword.value.trim().length === 0) {
    products.value = []
    return
  }

  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
}

const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    products.value = []
    return
  }

  searching.value = true

  try {
    const response = await productService.getProducts(
      { keyword, status: 'APPROVED' },
      { page: 0, size: 20, sort: 'createdAt,DESC' }
    )

    if (response.success && response.data) {
      if (response.data.content && Array.isArray(response.data.content)) {
        products.value = response.data.content
      } else if (Array.isArray(response.data)) {
        products.value = response.data
      } else {
        products.value = []
      }
    } else {
      products.value = []
    }
  } catch (error) {
    console.error('아이템 검색 실패:', error)
    products.value = []
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  products.value = []
  if (searchTimeout) clearTimeout(searchTimeout)
}

const selectProduct = (product) => {
  emit('select-product', {
    productId: product.productId || product.id,
    name: product.name,
    brand: product.brand,
    thumbnailUrl: getProductImage(product)
  })
}

const getProductImage = (product) => {
  return product.thumbnailDto?.fileUrl || product.thumbnailUrl || '/default-product.png'
}

const handleImageError = (e) => {
  e.target.src = '/default-product.png'
}

// Watch for mode change to focus search input
const focusSearchInput = async () => {
  await nextTick()
  if (searchInput.value) {
    searchInput.value.focus()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

@media (min-width: 640px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-container {
  background: white;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.15);
}

@media (min-width: 640px) {
  .modal-container {
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 20px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
}

.btn-close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
}

.close-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

/* Mode Selection */
.mode-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-title {
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
  margin-bottom: 8px;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.mode-card:hover {
  border-color: #9333ea;
  background: #faf5ff;
}

.mode-card:hover .mode-icon {
  transform: scale(1.05);
}

.mode-card:hover .arrow-icon {
  color: #9333ea;
  transform: translateX(4px);
}

.mode-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.mode-icon.search {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
}

.mode-icon.search svg {
  width: 26px;
  height: 26px;
  color: #9333ea;
}

.mode-icon.custom {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.mode-icon.custom svg {
  width: 26px;
  height: 26px;
  color: #3b82f6;
}

.mode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mode-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.mode-desc {
  font-size: 13px;
  color: #9ca3af;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: #d1d5db;
  flex-shrink: 0;
  transition: all 0.2s;
}

/* Back Button */
.back-to-mode {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
  width: fit-content;
}

.back-to-mode svg {
  width: 16px;
  height: 16px;
}

.back-to-mode:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Search Mode */
.search-mode {
  display: flex;
  flex-direction: column;
}

.search-section {
  margin-bottom: 16px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon-svg {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 16px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-clear {
  position: absolute;
  right: 12px;
  width: 28px;
  height: 28px;
  background: #e5e7eb;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.search-clear:hover {
  background: #d1d5db;
}

.search-clear svg {
  width: 14px;
  height: 14px;
  color: #6b7280;
}

/* Search Results */
.search-results {
  flex: 1;
  min-height: 240px;
}

.results-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  color: #6b7280;
  font-size: 14px;
}

.results-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
}

.empty-illustration {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-illustration svg {
  width: 32px;
  height: 32px;
  color: #9333ea;
}

.empty-illustration.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.empty-illustration.warning svg {
  color: #d97706;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px 0;
}

.empty-desc {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 20px 0;
}

.btn-switch-mode {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #9333ea;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-switch-mode svg {
  width: 18px;
  height: 18px;
}

.btn-switch-mode:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

/* Product List */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.results-count {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  margin: 0 0 12px 0;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.product-item:hover {
  background: #faf5ff;
  border-color: #9333ea;
}

.product-item:hover .select-badge {
  background: #9333ea;
  color: white;
}

.product-image {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
  background: #e5e7eb;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-brand {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.select-badge {
  padding: 6px 14px;
  background: #f3e8ff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #9333ea;
  flex-shrink: 0;
  transition: all 0.2s;
}

/* Custom Mode */
.custom-mode {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #ef4444;
}

.optional {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
}

/* Image Upload Area */
.image-upload-area {
  width: 100%;
}

.image-preview-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  transition: all 0.2s;
}

.image-preview-wrapper.uploading {
  border-color: #9333ea;
}

.image-preview-wrapper.upload-failed {
  border-color: #ef4444;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Upload Overlay */
.upload-overlay,
.upload-failed-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.upload-overlay {
  background: rgba(147, 51, 234, 0.85);
}

.upload-failed-overlay {
  background: rgba(239, 68, 68, 0.85);
}

.overlay-text {
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.failed-icon-svg {
  width: 24px;
  height: 24px;
  color: white;
}

/* Spinner */
.spinner-tiny {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-medium {
  width: 32px;
  height: 32px;
  border: 3px solid #f3e8ff;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Remove Image Button */
.btn-remove-image {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-image:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.8);
}

.btn-remove-image:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-remove-image svg {
  width: 14px;
  height: 14px;
  color: white;
}

/* Upload Label */
.image-upload-label {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.image-upload-label:hover {
  border-color: #9333ea;
  background: #faf5ff;
}

.upload-icon-wrapper {
  width: 56px;
  height: 56px;
  background: #f3e8ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.image-upload-label:hover .upload-icon-wrapper {
  background: #e9d5ff;
}

.upload-icon-svg {
  width: 28px;
  height: 28px;
  color: #9333ea;
  transition: all 0.2s;
}

.upload-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-text-main {
  font-size: 15px;
  font-weight: 700;
  color: #374151;
}

.upload-text-hint {
  font-size: 13px;
  color: #9ca3af;
}

.hidden-input {
  display: none;
}

/* Input */
.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  padding-right: 60px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.char-count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9ca3af;
  pointer-events: none;
}

/* Submit Button */
.btn-submit-custom {
  width: 100%;
  padding: 16px 24px;
  background: #9333ea;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  margin-top: 8px;
}

.btn-submit-custom:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-2px);
}

.btn-submit-custom:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Footer */
.modal-footer {
  padding: 16px 24px 24px;
  flex-shrink: 0;
}

.btn-cancel-full {
  width: 100%;
  padding: 14px 24px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-cancel-full:hover {
  background: #e5e7eb;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .modal-container {
    transform: translateY(20px) scale(0.95);
  }
}

.modal-leave-to .modal-container {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-leave-to .modal-container {
    transform: translateY(20px) scale(0.95);
  }
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .modal-header {
    padding: 20px 20px 16px;
  }

  .modal-body {
    padding: 0 20px 20px;
  }

  .modal-footer {
    padding: 12px 20px 20px;
  }

  .mode-card {
    padding: 16px;
  }

  .mode-icon {
    width: 44px;
    height: 44px;
  }

  .mode-icon svg {
    width: 22px;
    height: 22px;
  }

  .image-preview-wrapper {
    width: 100px;
    height: 100px;
  }

  .image-upload-label {
    padding: 16px;
    gap: 14px;
  }

  .upload-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .upload-icon-svg {
    width: 24px;
    height: 24px;
  }

  .form-input {
    padding: 12px 14px;
    padding-right: 54px;
    font-size: 14px;
  }

  .product-item {
    padding: 12px;
  }

  .product-image {
    width: 48px;
    height: 48px;
  }
}
</style>
