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
            class="items-grid"
        >
          <div
              v-for="(item, index) in displayItems"
              :key="index"
              class="selected-item"
          >
            <div class="selected-item-remove" @click="removeItem(index)">×</div>
            <div class="item-visual">
              <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  @error="handleImageError"
              >
              <div v-else class="item-placeholder">
                {{ item.isCustom ? '✨' : '📦' }}
              </div>
            </div>
            <div class="item-name">{{ item.name }}</div>
            <div class="item-brand">{{ item.brand }}</div>
            <div v-if="item.isCustom" class="item-badge">커스텀</div>
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
import { ref, computed } from 'vue';
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
const displayItems = computed(() => {
  return props.selectedItems.map(item => {
    // 커스텀 아이템인 경우
    if (item.customName) {
      return {
        name: item.customName,
        brand: item.customBrand || '커스텀',
        imageUrl: item.imageUrl || null, // ⭐ 이미 설정된 미리보기 URL 사용
        isCustom: true
      };
    }

    // 기존 제품인 경우
    return {
      name: item.name || '알 수 없음',
      brand: item.brand || '브랜드 없음',
      imageUrl: item.thumbnailDto?.fileUrl || item.imageUrl || null,
      isCustom: false
    };
  });
});

const handleItemsConfirm = (newItems) => {
  const updatedItems = [...props.selectedItems, ...newItems];
  emit('update:selectedItems', updatedItems);
  emit('update:battleForm', {
    ...props.battleForm
  });
};

const removeItem = (index) => {
  const newItems = [...props.selectedItems];
  newItems.splice(index, 1);
  emit('update:selectedItems', newItems);
  emit('update:battleForm', {
    ...props.battleForm
  });
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
};
</script>

<style scoped>
/* 기존 스타일 유지 */
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

.items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* ===== 모바일 반응형 ===== */
@media (max-width: 1024px) {
  .items-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .form-section {
    padding: 24px 20px;
  }

  .items-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .selected-item {
    padding: 6px;
  }

  .item-visual {
    height: 70px;
  }

  .item-placeholder {
    font-size: 28px;
  }

  .item-name {
    font-size: 10px;
  }

  .item-brand {
    font-size: 9px;
  }

  .selected-item-remove {
    opacity: 1;
    width: 18px;
    height: 18px;
    font-size: 11px;
  }

  .empty-state {
    padding: 32px 16px;
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 8px;
  }

  .empty-title {
    font-size: 14px;
  }

  .add-item-button {
    min-height: 100px;
  }
}

@media (max-width: 480px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .item-visual {
    height: 80px;
  }

  .item-placeholder {
    font-size: 32px;
  }
}
</style>