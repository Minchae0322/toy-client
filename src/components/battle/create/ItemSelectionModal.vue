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
                  <div class="product-emoji">{{ product.emoji }}</div>
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
                        v-model="newItem.name"
                        type="text"
                        class="field-input"
                        placeholder="예: 나이키 덩크 로우"
                        maxlength="30"
                    >
                  </div>
                  <div class="form-field">
                    <label class="field-label">브랜드 <span class="required">*</span></label>
                    <input
                        v-model="newItem.brand"
                        type="text"
                        class="field-input"
                        placeholder="예: Nike"
                        maxlength="20"
                    >
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">이모지 선택 <span class="required">*</span></label>
                  <div class="emoji-selector">
                    <button
                        v-for="emoji in emojiOptions"
                        :key="emoji"
                        class="emoji-option"
                        :class="{ selected: newItem.emoji === emoji }"
                        @click="newItem.emoji = emoji"
                        type="button"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </div>

                <button
                    class="btn-create"
                    :disabled="!isNewItemValid"
                    @click="createNewItem"
                    type="button"
                >
                  <span>➕</span>
                  아이템 만들고 추가하기
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

// 새 아이템 입력
const newItem = ref({
  name: '',
  brand: '',
  emoji: '👟'
});

// 이모지 옵션
const emojiOptions = ['👟', '👕', '👔', '🎽', '👗', '👠', '👜', '🎒', '⌚', '👓', '🕶️', '💄', '💻', '📱', '🎮', '🎧'];

// Mock 제품 목록 (실제로는 API에서 가져올 데이터)
const products = ref([
  { id: 1, name: '나이키 덩크 로우', brand: 'Nike', emoji: '👟' },
  { id: 2, name: '조던 4 레트로', brand: 'Jordan', emoji: '👟' },
  { id: 3, name: '아디다스 예지', brand: 'Adidas', emoji: '👟' },
  { id: 4, name: '뉴발란스 550', brand: 'New Balance', emoji: '👟' },
  { id: 5, name: '반스 올드스쿨', brand: 'Vans', emoji: '👟' },
  { id: 6, name: '컨버스 척 70', brand: 'Converse', emoji: '👟' },
  { id: 7, name: '나이키 에어포스 1', brand: 'Nike', emoji: '👟' },
  { id: 8, name: '나이키 에어맥스 97', brand: 'Nike', emoji: '👟' },
  { id: 9, name: '아디다스 삼바', brand: 'Adidas', emoji: '👟' },
  { id: 10, name: '푸마 스웨이드', brand: 'Puma', emoji: '👟' }
]);

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
  return newItem.value.name.trim() &&
      newItem.value.brand.trim() &&
      newItem.value.emoji;
});

// Methods
const handleSearch = () => {
  // 검색 로직 (필요시 디바운싱 추가)
};

const isProductSelected = (productId) => {
  return tempSelectedItems.value.some(item => item.id === productId);
};

const selectProduct = (product) => {
  const index = tempSelectedItems.value.findIndex(item => item.id === product.id);

  if (index !== -1) {
    // 이미 선택된 경우 제거
    tempSelectedItems.value.splice(index, 1);
  } else {
    // 최대 개수 체크
    if (props.currentItems.length + tempSelectedItems.value.length >= props.maxItems) {
      alert(`최대 ${props.maxItems}개까지만 선택 가능합니다`);
      return;
    }
    tempSelectedItems.value.push({ ...product });
  }
};

const createNewItem = () => {
  if (!isNewItemValid.value) return;

  // 최대 개수 체크
  if (props.currentItems.length + tempSelectedItems.value.length >= props.maxItems) {
    alert(`최대 ${props.maxItems}개까지만 선택 가능합니다`);
    return;
  }

  const newId = `custom-${Date.now()}`;
  const item = {
    id: newId,
    name: newItem.value.name.trim(),
    brand: newItem.value.brand.trim(),
    emoji: newItem.value.emoji,
    isCustom: true // 사용자가 직접 만든 아이템 표시
  };

  tempSelectedItems.value.push(item);

  // 폼 초기화
  newItem.value = {
    name: '',
    brand: '',
    emoji: '👟'
  };

  // 성공 피드백
  // 필요시 토스트 메시지 추가
};

const confirmSelection = () => {
  if (tempSelectedItems.value.length === 0) return;

  emit('confirm', tempSelectedItems.value);
  handleClose();
};

const handleClose = () => {
  emit('update:modelValue', false);
  // 약간의 딜레이 후 초기화 (애니메이션을 위해)
  setTimeout(() => {
    resetModal();
  }, 200);
};

const resetModal = () => {
  tempSelectedItems.value = [];
  searchQuery.value = '';
  newItem.value = {
    name: '',
    brand: '',
    emoji: '👟'
  };
};

// 모달이 열릴 때 초기화
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetModal();
  }
});
</script>

<style scoped>
/* Modal */
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* Search Section */
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

/* Section Header */
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

/* Product Grid */
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
  padding: 16px 12px;
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

.product-emoji {
  font-size: 32px;
  margin-bottom: 8px;
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

/* No Results */
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

/* Divider */
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

/* Create Section */
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

/* Emoji Selector */
.emoji-selector {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-option {
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid #E5E7EB;
  background: white;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-option:hover {
  border-color: #9CA3AF;
  transform: scale(1.05);
}

.emoji-option.selected {
  border-color: #1A1A1A;
  background: #FAFBFC;
  transform: scale(1.05);
}

/* Buttons */
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

/* 반응형 */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .emoji-selector {
    grid-template-columns: repeat(6, 1fr);
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