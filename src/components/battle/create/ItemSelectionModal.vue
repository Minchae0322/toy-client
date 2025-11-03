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
              >
              <button
                  v-if="searchQuery"
                  class="search-clear"
                  @click="searchQuery = ''"
              >
                ×
              </button>
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
                    <img v-if="product.thumbnailDto?.fileUrl" :src="product.thumbnailDto.fileUrl" :alt="product.name">
                    <div v-else class="product-placeholder">📦</div>
                  </div>
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-brand">{{ product.brand }}</div>
                  <div v-if="isProductSelected(product.id)" class="product-check">✓</div>
                </div>
              </div>
            </div>

            <!-- 검색 결과 없음 -->
            <div v-else-if="searchQuery && filteredProducts.length === 0" class="no-results">
              <div class="no-results-icon">🔍</div>
              <div class="no-results-title">"{{ searchQuery }}" 검색 결과가 없어요</div>
              <div class="no-results-desc">아래에서 직접 아이템을 만들어보세요</div>
            </div>

            <!-- 구분선 -->
            <div v-if="searchQuery" class="divider">
              <span>또는</span>
            </div>

            <!-- ⭐ 직접 입력 폼 (백엔드 ItemRequest 스펙) -->
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

                <div class="form-field">
                  <label class="field-label">이미지 URL (선택)</label>
                  <input
                      v-model="newItem.customImageUrl"
                      type="text"
                      class="field-input"
                      placeholder="https://example.com/image.jpg"
                      maxlength="500"
                  >
                  <div class="field-hint">이미지 URL을 입력하거나 비워두세요</div>
                </div>

                <button
                    class="btn-create"
                    :disabled="!isNewItemValid"
                    @click="createNewItem"
                    type="button"
                >
                  <span>➕</span>
                  커스텀 아이템 추가하기
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
import { useProduct } from '@/composables/useProduct';

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

const productService = useProduct();

// 상태
const searchQuery = ref('');
const tempSelectedItems = ref([]);
const products = ref([]);
const loading = ref(false);

// ⭐ 백엔드 ItemRequest 스펙에 맞춤
const newItem = ref({
  productId: null,
  customName: '',
  customBrand: '',
  customImageUrl: ''
});

// Computed
const filteredProducts = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
  );
});

const isNewItemValid = computed(() => {
  return newItem.value.customName.trim().length > 0 &&
      newItem.value.customBrand.trim().length > 0;
});

// Methods
const handleSearch = async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    products.value = [];
    return;
  }

  try {
    loading.value = true;
    const response = await productService.getProducts({
      keyword: searchQuery.value
    }, {
      page: 0,
      size: 20
    });

    if (response.success && response.data) {
      products.value = response.data.content || response.data;
    }
  } catch (error) {
    console.error('❌ 상품 검색 실패:', error);
  } finally {
    loading.value = false;
  }
};

const isProductSelected = (productId) => {
  return tempSelectedItems.value.some(item => item.productId === productId);
};

const selectProduct = (product) => {
  const index = tempSelectedItems.value.findIndex(item => item.productId === product.id);

  if (index !== -1) {
    tempSelectedItems.value.splice(index, 1);
  } else {
    if (props.currentItems.length + tempSelectedItems.value.length >= props.maxItems) {
      alert(`최대 ${props.maxItems}개까지만 선택 가능합니다`);
      return;
    }

    // ⭐ 백엔드 ItemRequest 형식
    tempSelectedItems.value.push({
      productId: product.id,
      customName: null,
      customBrand: null,
      customImageUrl: null,
      // UI 표시용 추가 정보
      _displayName: product.name,
      _displayBrand: product.brand,
      _displayImage: product.thumbnailDto?.fileUrl
    });
  }
};

const createNewItem = () => {
  if (!isNewItemValid.value) return;

  if (props.currentItems.length + tempSelectedItems.value.length >= props.maxItems) {
    alert(`최대 ${props.maxItems}개까지만 선택 가능합니다`);
    return;
  }

  // ⭐ 백엔드 ItemRequest 형식 (커스텀 아이템)
  const item = {
    productId: null, // 커스텀 아이템이므로 null
    customName: newItem.value.customName.trim(),
    customBrand: newItem.value.customBrand.trim(),
    customImageUrl: newItem.value.customImageUrl.trim() || null,
    // UI 표시용
    _displayName: newItem.value.customName.trim(),
    _displayBrand: newItem.value.customBrand.trim(),
    _displayImage: newItem.value.customImageUrl.trim() || null,
    _isCustom: true
  };

  tempSelectedItems.value.push(item);

  // 폼 초기화
  newItem.value = {
    productId: null,
    customName: '',
    customBrand: '',
    customImageUrl: ''
  };
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
  newItem.value = {
    productId: null,
    customName: '',
    customBrand: '',
    customImageUrl: ''
  };
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetModal();
  }
});
</script>

<style scoped>
/* 기존 스타일 유지 */
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