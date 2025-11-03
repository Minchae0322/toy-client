<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">
        배틀 아이템 선택 <span class="required">*</span>
      </label>
      <div class="form-hint">최소 2개, 최대 20개까지 선택 가능합니다</div>
    </div>

    <div class="form-group">
      <label class="form-label">선택된 아이템 ({{ selectedItems.length }}/20)</label>
      <div style="min-height: 120px;">
        <!-- Empty State -->
        <div
            v-if="selectedItems.length === 0"
            class="empty-state"
            @click="showModal = true"
        >
          <div class="empty-icon">📦</div>
          <div class="empty-title">아이템을 추가해주세요</div>
          <div class="empty-desc">제품을 검색하거나 직접 만들 수 있어요</div>
        </div>

        <!-- Selected Items Grid -->
        <div
            v-else
            style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;"
        >
          <div
              v-for="(item, index) in selectedItems"
              :key="index"
              class="selected-item"
          >
            <div class="selected-item-remove" @click="removeItem(index)">×</div>
            <div class="item-visual">
              <img v-if="item._displayImage" :src="item._displayImage" :alt="item._displayName">
              <div v-else class="item-placeholder">
                {{ item._isCustom ? '✨' : '📦' }}
              </div>
            </div>
            <div class="item-name">{{ item._displayName }}</div>
            <div class="item-brand">{{ item._displayBrand }}</div>
            <div v-if="item._isCustom" class="item-badge">커스텀</div>
          </div>

          <!-- Add Button -->
          <div
              v-if="selectedItems.length < 20"
              class="add-item-button"
              @click="showModal = true"
          >
            <div style="font-size: 24px; margin-bottom: 4px;">➕</div>
            <div style="font-size: 11px; color: #6B7280; font-weight: 500;">아이템 추가</div>
          </div>
        </div>
      </div>

      <!-- Tip Box -->
      <div v-if="selectedItems.length > 0" class="tip-box">
        <span style="font-size: 14px;">💡</span>
        <div style="font-size: 13px; color: #92400E;">
          <strong>Tip:</strong> 커스텀 아이템은 제품명, 브랜드, 이미지로 표시됩니다.
        </div>
      </div>
    </div>

    <!-- Item Selection Modal -->
    <ItemSelectionModal
        v-model="showModal"
        :current-items="selectedItems"
        :max-items="20"
        @confirm="handleItemsConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ItemSelectionModal from './ItemSelectionModal.vue';

const props = defineProps({
  battleForm: {
    type: Object,
    required: true
  },
  selectedItems: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:battleForm', 'update:selectedItems']);

const showModal = ref(false);

// Methods
const handleItemsConfirm = (newItems) => {
  // 기존 아이템 + 새로 추가된 아이템
  const updatedItems = [...props.selectedItems, ...newItems];

  // ⭐ battleForm의 items도 업데이트 (백엔드 전송용)
  const battleItems = updatedItems.map(item => ({
    productId: item.productId || null,
    customName: item.customName || null,
    customBrand: item.customBrand || null,
    customImageUrl: item.customImageUrl || null
  }));

  emit('update:selectedItems', updatedItems);
  emit('update:battleForm', {
    ...props.battleForm,
    items: battleItems
  });
};

const removeItem = (index) => {
  const newItems = [...props.selectedItems];
  newItems.splice(index, 1);

  // ⭐ battleForm의 items도 업데이트
  const battleItems = newItems.map(item => ({
    productId: item.productId || null,
    customName: item.customName || null,
    customBrand: item.customBrand || null,
    customImageUrl: item.customImageUrl || null
  }));

  emit('update:selectedItems', newItems);
  emit('update:battleForm', {
    ...props.battleForm,
    items: battleItems
  });
};
</script>

<style scoped>
.form-section {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #F0F0F3;
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.required {
  color: #DC2626;
}

.form-hint {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

.empty-state {
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  color: #9CA3AF;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-state:hover {
  border-color: #9CA3AF;
  background: #FAFBFC;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 13px;
  color: #9CA3AF;
}

.selected-item {
  position: relative;
  padding: 8px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
}

.selected-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.selected-item-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1;
}

.selected-item:hover .selected-item-remove {
  opacity: 1;
}

.item-visual {
  width: 100%;
  height: 80px;
  border-radius: 6px;
  margin-bottom: 6px;
  overflow: hidden;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-placeholder {
  font-size: 32px;
}

.item-name {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  color: #1A1A1A;
  word-break: break-word;
}

.item-brand {
  font-size: 10px;
  color: #9CA3AF;
  text-align: center;
}

.item-badge {
  margin-top: 4px;
  padding: 2px 6px;
  background: #FEF3C7;
  color: #92400E;
  font-size: 9px;
  font-weight: 600;
  border-radius: 4px;
}

.add-item-button {
  padding: 8px;
  background: #F8F9FA;
  border: 2px dashed #E5E7EB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-height: 120px;
  transition: all 0.2s;
}

.add-item-button:hover {
  border-color: #9CA3AF;
  background: #F3F4F6;
}

.tip-box {
  margin-top: 16px;
  padding: 16px;
  background: #FEF3C7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .selected-item {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>