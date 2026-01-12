<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="handleClose">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">아이템 추가</h3>
          <button class="modal-close" @click="handleClose">×</button>
        </div>

        <div class="modal-body">
          <!-- 검색 영역 -->
          <div class="search-section">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input
                  v-model="searchQuery"
                  type="text"
                  class="search-input"
                  placeholder="제품명이나 브랜드를 검색해보세요..."
                  @input="handleSearch"
                  @keydown="handleSearchKeydown"
              >
              <button
                  v-if="searchQuery"
                  class="search-clear"
                  @click="clearSearch"
              >
                ×
              </button>
            </div>
            <!-- 검색 상태 피드백 -->
            <div class="search-feedback">
              <!-- 타이핑 중 -->
              <div v-if="isTyping && searchQuery.length >= 2" class="feedback-typing">
                <span class="typing-dots"></span>
                <span>입력 중...</span>
              </div>
              <!-- 최소 글자 수 안내 -->
              <div v-else-if="searchQuery.length > 0 && searchQuery.length < 2" class="feedback-hint">
                <span>2글자 이상 입력해주세요</span>
              </div>
              <!-- 로딩 중 -->
              <div v-else-if="loading" class="feedback-loading">
                <span class="loading-spinner"></span>
                <span>검색 중...</span>
              </div>
              <!-- 엔터키 힌트 -->
              <div v-else-if="searchQuery.length >= 2 && !loading" class="feedback-enter-hint">
                <span>Enter로 즉시 검색</span>
              </div>
            </div>
          </div>

          <!-- 검색 결과 또는 직접 입력 -->
          <div class="modal-content">
            <!-- 검색 결과가 있을 때 -->
            <div v-if="filteredProducts.length > 0" class="search-results">
              <div class="section-header">
                <span class="section-title">검색 결과 ({{ filteredProducts.length }})</span>
                <span class="section-desc">선택하여 추가하거나 아래에서 직접 만드세요</span>
              </div>
              <div class="product-grid">
                <div
                    v-for="product in filteredProducts"
                    :key="product.id"
                    class="product-card"
                    :class="{ 'product-selected': isProductSelected(product.id) }"
                    @click="selectProduct(product)"
                >
                  <div class="product-image">
                    <img
                        v-if="getProductImage(product)"
                        :src="getProductImage(product)"
                        :alt="product.name"
                        @error="handleImageError"
                    >
                    <div v-else class="product-placeholder">📦</div>
                  </div>
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-brand">{{ product.brand }}</div>
                  <div v-if="isProductSelected(product.id)" class="product-check">✓</div>
                </div>
              </div>
            </div>

            <!-- 검색 결과 없음 -->
            <div v-else-if="searchQuery && !loading && filteredProducts.length === 0" class="no-results">
              <div class="no-results-icon">🔍</div>
              <div class="no-results-title">"{{ searchQuery }}" 검색 결과가 없어요</div>
              <div class="no-results-desc">아래에서 직접 아이템을 만들어보세요</div>
            </div>

            <!-- 구분선 -->
            <div v-if="searchQuery" class="divider">
              <span>또는</span>
            </div>

            <!-- 직접 입력 폼 -->
            <div class="create-section">
              <div class="section-header">
                <span class="section-title">✨ 직접 아이템 만들기</span>
                <span class="section-desc">새로운 제품을 추가해보세요</span>
              </div>

              <div class="create-form">
                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">제품명 <span class="required">*</span></label>
                    <input
                        v-model="newItem.customName"
                        type="text"
                        class="field-input"
                        placeholder="예: 나이키 덩크 로우 판다"
                        maxlength="30"
                    >
                    <div class="field-hint">{{ newItem.customName.length }} / 30</div>
                  </div>
                  <div class="form-field">
                    <label class="field-label">브랜드 <span class="required">*</span></label>
                    <input
                        v-model="newItem.customBrand"
                        type="text"
                        class="field-input"
                        placeholder="예: Nike"
                        maxlength="20"
                    >
                    <div class="field-hint">{{ newItem.customBrand.length }} / 20</div>
                  </div>
                </div>

                <!-- 이미지 업로드 영역 -->
                <div class="form-field">
                  <label class="field-label">이미지 (선택)</label>

                  <!-- 이미지 미리보기 -->
                  <div v-if="newItem.customImagePreview || newItem.customImageUrl" class="image-preview-area">
                    <div class="image-preview-wrapper">
                      <img
                          :src="newItem.customImagePreview || newItem.customImageUrl"
                          alt="미리보기"
                          class="image-preview"
                          @error="handleImageError"
                      >
                      <button
                          type="button"
                          class="image-remove-btn"
                          @click="removeCustomImage"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <!-- 이미지 업로드 또는 URL 입력 -->
                  <div v-else class="image-input-area">
                    <!-- 파일 업로드 버튼 -->
                    <label for="custom-image-input" class="image-upload-btn">
                      <span class="upload-icon">📷</span>
                      <span>이미지 파일 선택</span>
                      <input
                          id="custom-image-input"
                          type="file"
                          accept="image/*"
                          style="display: none;"
                          @change="handleImageSelect"
                      >
                    </label>

                    <div class="divider-small">
                      <span>또는</span>
                    </div>

                    <!-- URL 입력 -->
                    <input
                        v-model="newItem.customImageUrl"
                        type="text"
                        class="field-input"
                        placeholder="이미지 URL을 입력하세요"
                        maxlength="500"
                        @input="handleUrlInput"
                    >
                  </div>

                  <div class="field-hint">
                    <span v-if="uploadingImage">⏳ 이미지 업로드 중...</span>
                    <span v-else>파일 선택 또는 URL 입력 (최대 5MB)</span>
                  </div>
                </div>

                <button
                    class="btn-create"
                    :disabled="!isNewItemValid || uploadingImage"
                    @click="createNewItem"
                    type="button"
                >
                  <span>➕</span>
                  {{ uploadingImage ? '업로드 중...' : '커스텀 아이템 추가하기' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="handleClose" type="button">취소</button>
          <button
              class="btn-confirm"
              :disabled="tempSelectedItems.length === 0"
              @click="confirmSelection"
              type="button"
          >
            {{ tempSelectedItems.length > 0 ? `${tempSelectedItems.length}개 아이템 추가` : '아이템을 선택해주세요' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import productService from '@/services/ProductService';
import fileService from '@/services/FileService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentItems: {
    type: Array,
    default: () => []
  },
  maxItems: {
    type: Number,
    default: 20
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

// 상태
const searchQuery = ref('');
const tempSelectedItems = ref([]);
const products = ref([]);
const loading = ref(false);
const uploadingImage = ref(false);
const isTyping = ref(false); // 타이핑 중 상태

const newItem = ref({
  productId: null,
  customName: '',
  customBrand: '',
  customImageUrl: '',
  customImageFile: null,
  customImagePreview: null
});

// 디바운스 타이머
let searchTimeout = null;

// Computed
const filteredProducts = computed(() => {
  if (!searchQuery.value) return [];
  if (products.value.length > 0) {
    return products.value;
  }
  return [];
});

const isNewItemValid = computed(() => {
  return newItem.value.customName.trim().length > 0 &&
      newItem.value.customBrand.trim().length > 0;
});

const hasImageInput = computed(() => {
  return newItem.value.customImageUrl.trim().length > 0 ||
      newItem.value.customImageFile !== null;
});

// 상품 이미지 가져오기
const getProductImage = (product) => {
  if (!product) return null;
  return product.thumbnailDto?.fileUrl || null;
};

// 이미지 로드 실패 처리
const handleImageError = (event) => {
  event.target.style.display = 'none';
};

// Methods
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // 타이핑 시작 표시
  if (searchQuery.value.length > 0) {
    isTyping.value = true;
  } else {
    isTyping.value = false;
    products.value = [];
    return;
  }

  // 500ms 디바운스 적용 - 사용자가 타이핑을 멈춘 후 검색
  searchTimeout = setTimeout(async () => {
    isTyping.value = false;
    await performSearch();
  }, 500);
};

// 엔터키로 즉시 검색
const handleSearchKeydown = (event) => {
  if (event.key === 'Enter') {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    isTyping.value = false;
    performSearch();
  }
};

const performSearch = async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    products.value = [];
    return;
  }

  try {
    loading.value = true;

    const response = await productService.getProducts({
      keyword: searchQuery.value,
      status: 'APPROVED'
    }, {
      page: 0,
      size: 20,
      sort: 'createdAt,DESC'
    });

    if (response.success && response.data) {
      if (response.data.content && Array.isArray(response.data.content)) {
        products.value = response.data.content;
      } else if (Array.isArray(response.data)) {
        products.value = response.data;
      } else {
        products.value = [];
      }
    } else {
      products.value = [];
    }
  } catch (error) {
    console.error('상품 검색 오류:', error);
    products.value = [];
    alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    loading.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  products.value = [];
  isTyping.value = false;
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
};

const isProductSelected = (productId) => {
  return tempSelectedItems.value.some(item => item.productId === productId);
};const selectProduct = (product) => {
  const index = tempSelectedItems.value.findIndex(item => item.productId === product.id);

  if (index !== -1) {
    tempSelectedItems.value.splice(index, 1);
  } else {
    if (props.currentItems.length + tempSelectedItems.value.length >= props.maxItems) {
      alert(`최대 ${props.maxItems}개까지만 선택 가능합니다`);
      return;
    }

    // ⭐ 제품의 전체 정보를 포함하여 저장 (화면 표시용)
    const item = {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      thumbnailDto: product.thumbnailDto, // ⭐ 썸네일 정보 포함
      imageUrl: product.thumbnailDto?.fileUrl || null, // ⭐ 직접 URL도 포함
      customName: null,
      customBrand: null,
      customImageUrl: null
    };

    tempSelectedItems.value.push(item);
  }
};

// 이미지 파일 선택 핸들러
const handleImageSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 선택 가능합니다.');
    event.target.value = '';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('이미지 크기는 5MB 이하여야 합니다.');
    event.target.value = '';
    return;
  }

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      newItem.value.customImagePreview = e.target.result;
      newItem.value.customImageFile = file;
      newItem.value.customImageUrl = '';
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('이미지 미리보기 생성 실패:', error);
    alert('이미지 미리보기 생성에 실패했습니다.');
  }
};

// 이미지 제거
const removeCustomImage = () => {
  newItem.value.customImageFile = null;
  newItem.value.customImagePreview = null;
  newItem.value.customImageUrl = '';

  const fileInput = document.getElementById('custom-image-input');
  if (fileInput) {
    fileInput.value = '';
  }
};

// URL 입력 시 파일 입력 초기화
const handleUrlInput = () => {
  if (newItem.value.customImageUrl.trim()) {
    newItem.value.customImageFile = null;
    newItem.value.customImagePreview = null;
  }
};const createNewItem = async () => {
  if (!isNewItemValid.value) return;

  if (props.currentItems.length + tempSelectedItems.value.length >= props.maxItems) {
    alert(`최대 ${props.maxItems}개까지만 선택 가능합니다`);
    return;
  }

  // ⭐ 미리보기 URL 생성
  let previewUrl = null;
  if (newItem.value.customImageFile) {
    previewUrl = URL.createObjectURL(newItem.value.customImageFile);
  } else if (newItem.value.customImageUrl.trim()) {
    previewUrl = newItem.value.customImageUrl.trim();
  }

  const item = {
    productId: null,
    customName: newItem.value.customName.trim(),
    customBrand: newItem.value.customBrand.trim(),
    customImageFile: newItem.value.customImageFile, // ⭐ File 객체 저장 (업로드용)
    customImageUrl: newItem.value.customImageUrl.trim() || null, // URL 입력한 경우
    imageUrl: previewUrl // ⭐ 미리보기용 URL
  };

  tempSelectedItems.value.push(item);
  resetNewItemForm();
};

const resetNewItemForm = () => {
  newItem.value = {
    productId: null,
    customName: '',
    customBrand: '',
    customImageUrl: '',
    customImageFile: null,
    customImagePreview: null
  };

  const fileInput = document.getElementById('custom-image-input');
  if (fileInput) {
    fileInput.value = '';
  }
};

const confirmSelection = () => {
  if (tempSelectedItems.value.length === 0) return;
  emit('confirm', tempSelectedItems.value);
  handleClose();
};

const handleClose = () => {
  emit('update:modelValue', false);
  setTimeout(() => {
    resetModal();
  }, 200);
};

const resetModal = () => {
  tempSelectedItems.value = [];
  searchQuery.value = '';
  products.value = [];
  isTyping.value = false;
  resetNewItemForm();

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetModal();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #F0F0F3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #F3F4F6;
  border-radius: 8px;
  font-size: 20px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #E5E7EB;
  color: #1A1A1A;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid #F0F0F3;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-shrink: 0;
}

.search-section {
  margin-bottom: 24px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 18px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 48px 14px 48px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #1A1A1A;
}

.search-clear {
  position: absolute;
  right: 12px;
  width: 24px;
  height: 24px;
  border: none;
  background: #E5E7EB;
  border-radius: 50%;
  font-size: 16px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  background: #D1D5DB;
}

/* 검색 피드백 영역 */
.search-feedback {
  min-height: 28px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-typing,
.feedback-hint,
.feedback-loading,
.feedback-enter-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 16px;
}

.feedback-typing {
  color: #9333ea;
  background: #f3e8ff;
}

.feedback-hint {
  color: #f59e0b;
  background: #fef3c7;
}

.feedback-loading {
  color: #3b82f6;
  background: #dbeafe;
}

.feedback-enter-hint {
  color: #6b7280;
  background: #f3f4f6;
  font-size: 12px;
}

/* 타이핑 애니메이션 */
.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots::before,
.typing-dots::after {
  content: '';
  width: 6px;
  height: 6px;
  background: #9333ea;
  border-radius: 50%;
  animation: typingBounce 1.2s infinite ease-in-out;
}

.typing-dots::before {
  animation-delay: -0.4s;
}

.typing-dots::after {
  animation-delay: 0s;
}

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 로딩 스피너 */
.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #dbeafe;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-indicator {
  margin-top: 8px;
  text-align: center;
  font-size: 13px;
  color: #9CA3AF;
  padding: 8px;
}

.debug-info {
  margin-bottom: 16px;
  padding: 12px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 8px;
  font-size: 11px;
}

.debug-info summary {
  cursor: pointer;
  font-weight: 600;
  color: #92400E;
  margin-bottom: 8px;
}

.debug-info pre {
  margin: 4px 0;
  color: #78350F;
  white-space: pre-wrap;
  word-break: break-all;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.section-desc {
  display: block;
  font-size: 13px;
  color: #9CA3AF;
}

.search-results {
  margin-bottom: 24px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.product-card {
  position: relative;
  padding: 12px;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.product-card:hover {
  border-color: #9CA3AF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.product-card.product-selected {
  border-color: #1A1A1A;
  background: #FAFBFC;
}

.product-image {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-placeholder {
  font-size: 32px;
}

.product-name {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 2px;
  word-break: break-word;
}

.product-brand {
  font-size: 11px;
  color: #9CA3AF;
}

.product-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #1A1A1A;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #9CA3AF;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.no-results-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.no-results-desc {
  font-size: 14px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 32px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #E5E7EB;
}

.divider span {
  position: relative;
  display: inline-block;
  padding: 0 16px;
  background: white;
  color: #9CA3AF;
  font-size: 13px;
  font-weight: 500;
}

.create-section {
  padding: 24px;
  background: #F8F9FA;
  border-radius: 12px;
}

.create-form {
  margin-top: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 6px;
}

.required {
  color: #DC2626;
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.field-input:focus {
  outline: none;
  border-color: #1A1A1A;
}

.field-hint {
  font-size: 11px;
  color: #9CA3AF;
  margin-top: 4px;
}

/* 이미지 업로드 관련 스타일 */
.image-preview-area {
  margin-bottom: 12px;
}

.image-preview-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #E5E7EB;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.image-remove-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.image-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 2px dashed #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.image-upload-btn:hover {
  border-color: #9CA3AF;
  background: #F9FAFB;
}

.upload-icon {
  font-size: 20px;
}

.divider-small {
  position: relative;
  text-align: center;
  margin: 4px 0;
}

.divider-small::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #E5E7EB;
}

.divider-small span {
  position: relative;
  display: inline-block;
  padding: 0 12px;
  background: #F8F9FA;
  color: #9CA3AF;
  font-size: 12px;
}

.btn-create {
  width: 100%;
  padding: 12px 20px;
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.btn-create:hover:not(:disabled) {
  background: #000000;
  transform: translateY(-1px);
}

.btn-create:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  padding: 10px 24px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: #9CA3AF;
  color: #1A1A1A;
}

.btn-confirm {
  padding: 10px 24px;
  background: #1A1A1A;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-confirm:hover:not(:disabled) {
  background: #000000;
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>