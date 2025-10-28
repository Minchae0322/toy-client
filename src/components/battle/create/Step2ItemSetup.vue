<template>
  <div class="form-section">
    <!-- 오픈 배틀 설정 -->
    <div v-if="battleForm.type === 'open'">
      <div class="form-group">
        <label class="form-label">참여 조건 설정</label>
        <div class="form-hint">누구나 참여 가능하지만, 조건을 설정할 수 있어요</div>
      </div>

      <div class="form-group">
        <label class="form-label">최소 레벨 제한</label>
        <select
            :value="battleForm.minLevel"
            @change="$emit('update:battleForm', { ...battleForm, minLevel: $event.target.value })"
            class="form-input"
        >
          <option value="">제한 없음</option>
          <option value="3">Level 3 이상</option>
          <option value="5">Level 5 이상</option>
          <option value="10">Level 10 이상</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">최대 참여 제품 수</label>
        <select
            :value="battleForm.maxProducts"
            @change="$emit('update:battleForm', { ...battleForm, maxProducts: $event.target.value })"
            class="form-input"
        >
          <option value="">제한 없음</option>
          <option value="50">최대 50개</option>
          <option value="100">최대 100개</option>
          <option value="200">최대 200개</option>
        </select>
        <div class="form-hint">선착순으로 마감됩니다</div>
      </div>

      <div class="form-group">
        <label class="form-label">중복 제품 허용</label>
        <div style="display: flex; gap: 20px; margin-top: 12px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input
                :checked="!battleForm.allowDuplicate"
                @change="$emit('update:battleForm', { ...battleForm, allowDuplicate: false })"
                type="radio"
            >
            <span style="font-size: 14px;">허용 안 함</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input
                :checked="battleForm.allowDuplicate"
                @change="$emit('update:battleForm', { ...battleForm, allowDuplicate: true })"
                type="radio"
            >
            <span style="font-size: 14px;">허용</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 큐레이션 배틀 설정 -->
    <div v-else>
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
                :key="item.id"
                class="selected-item"
            >
              <div class="selected-item-remove" @click="removeItem(index)">×</div>
              <div
                  class="item-visual"
                  :style="{ background: item.gradient }"
              >
                {{ item.emoji }}
              </div>
              <div class="item-name">{{ item.name }}</div>
              <div class="item-brand">{{ item.brand }}</div>
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
        <div class="tip-box">
          <span style="font-size: 14px;">💡</span>
          <div style="font-size: 13px; color: #92400E;">
            <strong>Tip:</strong> 드래그 앤 드롭으로 순서를 변경할 수 있어요. 첫 번째 아이템이 대표 이미지가 됩니다.
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

// Gradient 옵션
const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
];

// Methods
const handleItemsConfirm = (newItems) => {
  // 각 아이템에 gradient 추가
  const itemsWithGradient = newItems.map((item, index) => ({
    ...item,
    gradient: gradients[(props.selectedItems.length + index) % gradients.length]
  }));

  emit('update:selectedItems', [...props.selectedItems, ...itemsWithGradient]);
};

const removeItem = (index) => {
  const newItems = [...props.selectedItems];
  newItems.splice(index, 1);
  emit('update:selectedItems', newItems);
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

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1A1A1A;
}

/* Empty State */
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

/* Selected Items */
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.item-name {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  color: #1A1A1A;
}

.item-brand {
  font-size: 10px;
  color: #9CA3AF;
  text-align: center;
}

/* Add Button */
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

/* Tip Box */
.tip-box {
  margin-top: 16px;
  padding: 16px;
  background: #FEF3C7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>