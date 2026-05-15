<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <!-- Modal Header -->
          <div class="modal-header">
            <h3 class="modal-title">아이템 추가</h3>
            <button class="btn-close" @click="handleClose" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- 모드 선택 (초기 화면) -->
            <div v-if="!selectedMode" class="mode-selection">
              <p class="mode-title">어떤 방식으로 아이템을 추가할까요?</p>

              <button type="button" class="mode-card" @click="selectMode('search')">
                <div class="mode-icon search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
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

              <button type="button" class="mode-card" @click="selectMode('custom')">
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

              <!-- 선택된 아이템 미리보기 -->
              <div v-if="tempSelectedItems.length > 0" class="selected-preview">
                <div class="preview-header">
                  <span class="preview-title">추가 예정 아이템</span>
                  <span class="preview-count">{{ tempSelectedItems.length }}개</span>
                </div>
                <div class="preview-list">
                  <div v-for="(item, idx) in tempSelectedItems" :key="idx" class="preview-item">
                    <img v-if="item.imageUrl || item.thumbnailDto?.fileUrl" :src="item.imageUrl || item.thumbnailDto?.fileUrl" class="preview-image" @error="handleImageError">
                    <div v-else class="preview-placeholder">📦</div>
                    <span class="preview-name">{{ item.customName || item.name }}</span>
                    <button type="button" class="preview-remove" @click="removeFromTemp(idx)">×</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 검색 모드 -->
            <div v-else-if="selectedMode === 'search'" class="search-mode">
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
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    ref="searchInputRef"
                    v-model="searchQuery"
                    type="text"
                    placeholder="아이템명, 브랜드로 검색..."
                    class="search-input"
                    @keyup.enter="performSearch"
                    @input="handleSearchInput"
                  >
                  <button v-if="searchQuery" type="button" class="search-clear" @click="clearSearch">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Search Results -->
              <div class="search-results">
                <!-- Loading -->
                <div v-if="loading" class="results-loading">
                  <div class="spinner-medium"></div>
                  <span>검색 중...</span>
                </div>

                <!-- Empty State (initial) -->
                <div v-else-if="!searchQuery && products.length === 0" class="results-empty">
                  <div class="empty-illustration">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <p class="empty-title">아이템을 검색해보세요</p>
                  <p class="empty-desc">아이템명이나 브랜드로 검색할 수 있어요</p>
                </div>

                <!-- No Results -->
                <div v-else-if="searchQuery && products.length === 0 && !loading" class="results-empty">
                  <div class="empty-illustration warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p class="empty-title">"{{ searchQuery }}" 검색 결과가 없어요</p>
                  <p class="empty-desc">직접 입력으로 새 아이템을 추가해보세요</p>
                  <button type="button" class="btn-switch-mode" @click="selectMode('custom')">
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
                  <div class="product-grid">
                    <button
                      v-for="product in products"
                      :key="product.id"
                      type="button"
                      class="product-card"
                      :class="{
                        'is-selected': isProductSelected(product.id),
                        'is-disabled': isAlreadyAdded(product.id)
                      }"
                      @click="toggleProduct(product)"
                    >
                      <div class="product-image">
                        <img v-if="getProductImage(product)" :src="getProductImage(product)" :alt="product.name" @error="handleImageError">
                        <div v-else class="product-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          </svg>
                        </div>
                      </div>
                      <p class="product-name">{{ product.name }}</p>
                      <p class="product-brand">{{ product.brand }}</p>
                      <div v-if="isAlreadyAdded(product.id)" class="product-badge disabled">이미 추가됨</div>
                      <div v-else-if="isProductSelected(product.id)" class="product-badge selected">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 직접 입력 모드 -->
            <div v-else-if="selectedMode === 'custom'" class="custom-mode">
              <button type="button" class="back-to-mode" @click="goBackToMode">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                다른 방식 선택
              </button>

              <!-- Image Upload -->
              <div class="form-section">
                <label class="form-label">
                  아이템 사진
                  <span class="optional">(선택)</span>
                </label>
                <div class="image-upload-area">
                  <div v-if="newItem.customImagePreview || newItem.customImageUrl" class="image-preview-wrapper">
                    <img :src="newItem.customImagePreview || newItem.customImageUrl" alt="미리보기" class="preview-image" @error="handleImageError">
                    <div v-if="uploadingImage" class="upload-overlay">
                      <div class="spinner-small"></div>
                      <span>업로드 중...</span>
                    </div>
                    <button type="button" class="btn-remove-image" @click="removeCustomImage" :disabled="uploadingImage">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <label v-else class="image-upload-label">
                    <div class="upload-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div class="upload-text-wrapper">
                      <span class="upload-text-main">이미지 업로드</span>
                      <span class="upload-text-hint">클릭하여 선택 (최대 10MB)</span>
                    </div>
                    <input type="file" accept="image/*" class="hidden-input" @change="handleImageSelect">
                  </label>
                </div>
              </div>

              <!-- Item Name -->
              <div class="form-section">
                <label class="form-label">
                  아이템명
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input v-model="newItem.customName" type="text" placeholder="예: 나이키 덩크 로우 판다" maxlength="30" class="form-input">
                  <span class="char-count">{{ newItem.customName.length }}/30</span>
                </div>
              </div>

              <!-- Brand -->
              <div class="form-section">
                <label class="form-label">
                  브랜드
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input v-model="newItem.customBrand" type="text" placeholder="예: Nike" maxlength="20" class="form-input">
                  <span class="char-count">{{ newItem.customBrand.length }}/20</span>
                </div>
              </div>

              <!-- Add Button -->
              <button
                type="button"
                class="btn-add-item"
                :disabled="!isNewItemValid || uploadingImage"
                @click="createNewItem"
              >
                <span v-if="uploadingImage">업로드 중...</span>
                <span v-else>아이템 추가하기</span>
              </button>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="handleClose">취소</button>
            <button
              type="button"
              class="btn-confirm"
              :disabled="tempSelectedItems.length === 0"
              @click="confirmSelection"
            >
              {{ tempSelectedItems.length > 0 ? `${tempSelectedItems.length}개 아이템 추가` : '아이템을 선택하세요' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import productService from '@/services/ProductService';
import { useFile } from '@/services/FileService';
import { useConfirmDialog } from '@/composables/useConfirmDialog';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  currentItems: { type: Array, default: () => [] },
  maxItems: { type: Number, default: 20 }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const fileService = useFile();
const { open } = useConfirmDialog();

// Mode state
const selectedMode = ref(null);

// Search state
const searchInputRef = ref(null);
const searchQuery = ref('');
const products = ref([]);
const loading = ref(false);
let searchTimeout = null;

// Selection state
const tempSelectedItems = ref([]);

// Custom item state
const uploadingImage = ref(false);
const newItem = ref({
  customName: '',
  customBrand: '',
  customImageUrl: '',
  customImageFile: null,
  customImagePreview: null,
  customImageAttachmentInfo: null
});

// Computed
const isNewItemValid = computed(() => {
  return newItem.value.customName.trim().length > 0 && newItem.value.customBrand.trim().length > 0;
});

// Methods
const selectMode = async (mode) => {
  selectedMode.value = mode;
  if (mode === 'search') {
    await nextTick();
    searchInputRef.value?.focus();
  }
};

const goBackToMode = () => {
  selectedMode.value = null;
};

const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!searchQuery.value.trim()) {
    products.value = [];
    return;
  }
  searchTimeout = setTimeout(() => performSearch(), 500);
};

const performSearch = async () => {
  const keyword = searchQuery.value.trim();
  if (!keyword) {
    products.value = [];
    return;
  }

  loading.value = true;
  try {
    const response = await productService.getProducts(
      { keyword, status: 'APPROVED' },
      { page: 0, size: 20, sort: 'createdAt,DESC' }
    );

    if (response.success && response.data) {
      products.value = response.data.content || response.data || [];
    } else {
      products.value = [];
    }
  } catch (error) {
    console.error('아이템 검색 실패:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  products.value = [];
  if (searchTimeout) clearTimeout(searchTimeout);
};

const getProductImage = (product) => product?.thumbnailDto?.fileUrl || null;

const handleImageError = (e) => { e.target.style.display = 'none'; };

const isProductSelected = (productId) => tempSelectedItems.value.some(item => item.productId === productId);

const isAlreadyAdded = (productId) => props.currentItems.some(item => item.productId === productId);

const toggleProduct = async (product) => {
  if (isAlreadyAdded(product.id)) return;

  const idx = tempSelectedItems.value.findIndex(item => item.productId === product.id);
  if (idx !== -1) {
    tempSelectedItems.value.splice(idx, 1);
  } else {
    if (props.currentItems.length + tempSelectedItems.value.length >= props.maxItems) {
      await open({ type: 'alert', title: '알림', message: `최대 ${props.maxItems}개까지만 선택 가능합니다` });
      return;
    }
    tempSelectedItems.value.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      thumbnailDto: product.thumbnailDto,
      imageUrl: product.thumbnailDto?.fileUrl || null
    });
  }
};

const removeFromTemp = (idx) => {
  tempSelectedItems.value.splice(idx, 1);
};

// Custom item methods
const handleImageSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    await open({ type: 'alert', title: '알림', message: '이미지 파일만 선택 가능합니다.' });
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    await open({ type: 'alert', title: '알림', message: '이미지 크기는 10MB 이하여야 합니다.' });
    return;
  }

  // Local preview
  const reader = new FileReader();
  reader.onload = (e) => { newItem.value.customImagePreview = e.target.result; };
  reader.readAsDataURL(file);

  newItem.value.customImageFile = file;
  newItem.value.customImageUrl = '';
  newItem.value.customImageAttachmentInfo = null;

  // Upload
  uploadingImage.value = true;
  try {
    const result = await fileService.upload(file, { fileCode: 'BATTLE_ITEM' });
    if (result.success && result.data) {
      const serverUrl = result.data.fileUrl || result.data.storedPath;
      newItem.value.customImagePreview = serverUrl;
      newItem.value.customImageAttachmentInfo = {
        fileId: result.data.id,
        storedPath: result.data.fileUrl,
        originName: result.data.orgFileNm || file.name,
        fileSize: result.data.fileSize || file.size,
        contentType: result.data.contentType || file.type
      };
    }
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
  } finally {
    uploadingImage.value = false;
  }
};

const removeCustomImage = () => {
  newItem.value.customImageFile = null;
  newItem.value.customImagePreview = null;
  newItem.value.customImageUrl = '';
  newItem.value.customImageAttachmentInfo = null;
};

const createNewItem = async () => {
  if (!isNewItemValid.value) return;

  if (props.currentItems.length + tempSelectedItems.value.length >= props.maxItems) {
    await open({ type: 'alert', title: '알림', message: `최대 ${props.maxItems}개까지만 선택 가능합니다` });
    return;
  }

  let previewUrl = newItem.value.customImageAttachmentInfo?.storedPath
    || (newItem.value.customImageFile ? URL.createObjectURL(newItem.value.customImageFile) : null)
    || newItem.value.customImageUrl.trim() || null;

  tempSelectedItems.value.push({
    productId: null,
    customName: newItem.value.customName.trim(),
    customBrand: newItem.value.customBrand.trim(),
    customImageFile: newItem.value.customImageFile,
    customImageUrl: newItem.value.customImageUrl.trim() || null,
    customImageAttachmentInfo: newItem.value.customImageAttachmentInfo,
    imageUrl: previewUrl
  });

  resetNewItemForm();
  goBackToMode(); // 추가 후 초기 화면으로
};

const resetNewItemForm = () => {
  newItem.value = {
    customName: '',
    customBrand: '',
    customImageUrl: '',
    customImageFile: null,
    customImagePreview: null,
    customImageAttachmentInfo: null
  };
};

const confirmSelection = () => {
  if (tempSelectedItems.value.length === 0) return;
  emit('confirm', tempSelectedItems.value);
  handleClose();
};

const handleClose = () => {
  emit('update:modelValue', false);
  setTimeout(resetModal, 200);
};

const resetModal = () => {
  selectedMode.value = null;
  searchQuery.value = '';
  products.value = [];
  tempSelectedItems.value = [];
  resetNewItemForm();
  if (searchTimeout) clearTimeout(searchTimeout);
};

watch(() => props.modelValue, (val) => { if (val) resetModal(); });
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container {
  background: var(--bg-elevated);
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 20px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.btn-close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--border-default);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover { background: var(--border-strong); }

.btn-close svg {
  width: 20px;
  height: 20px;
  color: var(--c-text-500);
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 28px 28px;
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
  color: var(--c-text-500);
  text-align: center;
  margin-bottom: 8px;
}

.mode-card {
  display: grid;
  grid-template-columns: 48px 1fr 20px;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-elevated);
  border: 2px solid var(--border-strong);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.mode-card:hover {
  border-color: var(--c-brand);
  background: var(--c-brand-soft);
}

.mode-card:hover .arrow-icon {
  color: var(--c-brand);
}

.mode-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-icon.search {
  background: var(--c-brand-soft);
}

.mode-icon.search svg {
  width: 24px;
  height: 24px;
  color: var(--c-brand);
}

.mode-icon.custom {
  background: var(--c-info-soft);
}

.mode-icon.custom svg {
  width: 24px;
  height: 24px;
  color: var(--c-info);
}

.mode-info {
  text-align: left;
}

.mode-name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.mode-desc {
  display: block;
  font-size: 13px;
  color: var(--c-text-400);
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: var(--c-text-300);
  transition: color 0.2s;
}

/* Selected Preview */
.selected-preview {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-subtle);
  border-radius: 14px;
  border: 1px solid var(--border-strong);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-600);
}

.preview-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-brand);
  background: var(--c-brand-soft);
  padding: 4px 10px;
  border-radius: 20px;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
}

.preview-image {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
}

.preview-placeholder {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.preview-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-600);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-remove {
  width: 20px;
  height: 20px;
  background: var(--border-default);
  border: none;
  border-radius: 50%;
  font-size: 14px;
  color: var(--c-text-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.preview-remove:hover {
  background: var(--c-danger-soft);
  color: var(--c-danger);
}

/* Back Button */
.back-to-mode {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-500);
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
  background: var(--border-default);
  color: var(--c-text-600);
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
  color: var(--c-text-400);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 16px 48px;
  border: 2px solid var(--border-strong);
  border-radius: 14px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.search-input::placeholder { color: var(--c-text-400); }

.search-clear {
  position: absolute;
  right: 12px;
  width: 28px;
  height: 28px;
  background: var(--border-strong);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.search-clear:hover { background: var(--c-text-300); }

.search-clear svg {
  width: 14px;
  height: 14px;
  color: var(--c-text-500);
}

/* Search Results */
.search-results {
  flex: 1;
  min-height: 200px;
}

.results-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  color: var(--c-text-500);
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
  background: var(--c-brand-soft);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-illustration svg {
  width: 32px;
  height: 32px;
  color: var(--c-brand);
}

.empty-illustration.warning {
  background: var(--c-warning-soft);
}

.empty-illustration.warning svg { color: var(--c-bronze); }

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--c-text-400);
  margin: 0 0 20px 0;
}

.btn-switch-mode {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--c-brand);
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
  background: var(--c-brand-hover);
  transform: translateY(-2px);
}

/* Product List */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.results-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-400);
  margin: 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.product-card {
  position: relative;
  padding: 12px;
  background: var(--bg-subtle);
  border: 2px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.product-card:hover {
  background: var(--c-brand-soft);
  border-color: var(--c-brand);
}

.product-card.is-selected {
  background: var(--c-brand-soft);
  border-color: var(--c-brand);
}

.product-card.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-card.is-disabled:hover {
  background: var(--bg-subtle);
  border-color: transparent;
}

.product-image {
  width: 100%;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
  background: var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-placeholder svg {
  width: 28px;
  height: 28px;
  color: var(--c-text-400);
}

.product-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-brand {
  font-size: 11px;
  color: var(--c-text-500);
  margin: 0;
}

.product-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
}

.product-badge.disabled {
  background: var(--border-strong);
  color: var(--c-text-500);
}

.product-badge.selected {
  width: 24px;
  height: 24px;
  padding: 0;
  background: var(--c-brand);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-badge.selected svg {
  width: 14px;
  height: 14px;
  color: white;
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
  color: var(--c-text-600);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required { color: var(--c-danger); }

.optional {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-400);
}

/* Image Upload */
.image-upload-area { width: 100%; }

.image-preview-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid var(--border-strong);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(147, 51, 234, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: white;
  font-size: 11px;
  font-weight: 600;
}

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
}

.btn-remove-image:hover { background: rgba(0, 0, 0, 0.8); }

.btn-remove-image svg {
  width: 14px;
  height: 14px;
  color: white;
}

.image-upload-label {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px dashed var(--c-text-300);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-subtle);
}

.image-upload-label:hover {
  border-color: var(--c-brand);
  background: var(--c-brand-soft);
}

.upload-icon-wrapper {
  width: 56px;
  height: 56px;
  background: var(--c-brand-soft);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.upload-icon-wrapper svg {
  width: 28px;
  height: 28px;
  color: var(--c-brand);
}

.upload-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-text-main {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text-600);
}

.upload-text-hint {
  font-size: 13px;
  color: var(--c-text-400);
}

.hidden-input { display: none; }

/* Input */
.input-wrapper { position: relative; }

.form-input {
  width: 100%;
  padding: 14px 16px;
  padding-right: 60px;
  border: 2px solid var(--border-strong);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.form-input::placeholder { color: var(--c-text-400); }

.char-count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--c-text-400);
}

/* Add Button */
.btn-add-item {
  width: 100%;
  padding: 16px 24px;
  background: var(--c-brand);
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-add-item:hover:not(:disabled) {
  background: var(--c-brand-hover);
  transform: translateY(-2px);
}

.btn-add-item:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

/* Spinner */
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
  border: 3px solid var(--c-brand-soft);
  border-top-color: var(--c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid var(--bg-subtle);
  flex-shrink: 0;
}

.btn-cancel {
  flex: 1;
  padding: 14px 20px;
  background: var(--bg-elevated);
  border: 2px solid var(--border-strong);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-500);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--c-text-300);
  background: var(--bg-subtle);
}

.btn-confirm {
  flex: 1;
  padding: 14px 20px;
  background: var(--c-brand);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--c-brand-hover);
}

.btn-confirm:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to { opacity: 0; }

.modal-enter-from .modal-container {
  transform: translateY(20px) scale(0.95);
}

.modal-leave-to .modal-container {
  transform: translateY(20px) scale(0.95);
}

/* Mobile */
@media (max-width: 640px) {
  .modal-container {
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
    margin-top: auto;
  }

  .modal-overlay {
    align-items: flex-end;
  }

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
