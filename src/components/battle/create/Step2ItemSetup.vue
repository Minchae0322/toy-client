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

      <div style="display: flex; gap: 16px; margin-bottom: 24px;">
        <button
            class="btn-secondary"
            @click="showProductSearch = !showProductSearch"
            style="flex: 1; padding: 16px;"
        >
          📦 제품 목록에서 선택
        </button>
        <button
            class="btn-secondary"
            @click="showNewItemModal"
            style="flex: 1; padding: 16px;"
        >
          ➕ 새 아이템 직접 만들기
        </button>
      </div>

      <!-- 제품 검색 영역 -->
      <div v-if="showProductSearch" style="margin-bottom: 24px;">
        <div style="position: relative; margin-bottom: 16px;">
          <input
              v-model="searchQuery"
              type="text"
              class="form-input"
              placeholder="제품명으로 검색..."
              style="padding-left: 40px;"
          >
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);">🔍</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-height: 300px; overflow-y: auto;">
          <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-item"
              :class="{ selected: isProductSelected(product.id) }"
              @click="toggleProduct(product)"
              style="padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer;"
          >
            <div style="width: 100%; height: 80px; background: #F3F4F6; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              {{ product.emoji }}
            </div>
            <div style="font-size: 12px; font-weight: 600;">{{ product.name }}</div>
            <div style="font-size: 11px; color: #9CA3AF;">{{ product.brand }}</div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">선택된 아이템 ({{ selectedItems.length }}/20)</label>
        <div style="min-height: 120px;">
          <div
              v-if="selectedItems.length === 0"
              style="border: 2px dashed #E5E7EB; border-radius: 12px; padding: 40px; text-align: center; color: #9CA3AF;"
          >
            <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
            <div>아이템을 선택해주세요</div>
          </div>
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
              <div :style="`width: 100%; height: 80px; background: ${item.gradient}; border-radius: 6px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;`">
                {{ item.emoji }}
              </div>
              <div style="font-size: 11px; font-weight: 600; text-align: center; line-height: 1.2;">
                {{ item.name }}
              </div>
              <div style="font-size: 10px; color: #9CA3AF; text-align: center;">
                {{ item.brand }}
              </div>
            </div>

            <!-- 추가 버튼 -->
            <div
                v-if="selectedItems.length < 20"
                style="padding: 8px; background: #F8F9FA; border: 2px dashed #E5E7EB; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; min-height: 120px; transition: all 0.2s;"
                @click="showProductSearch = true"
                @mouseover="$event.currentTarget.style.borderColor='#9CA3AF'; $event.currentTarget.style.background='#F3F4F6'"
                @mouseout="$event.currentTarget.style.borderColor='#E5E7EB'; $event.currentTarget.style.background='#F8F9FA'"
            >
              <div style="font-size: 24px; margin-bottom: 4px;">➕</div>
              <div style="font-size: 11px; color: #6B7280;">아이템 추가</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 16px; padding: 16px; background: #FEF3C7; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px;">💡</span>
            <div style="font-size: 13px; color: #92400E;">
              <strong>Tip:</strong> 드래그 앤 드롭으로 순서를 변경할 수 있어요. 첫 번째 아이템이 대표 이미지가 됩니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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

const showProductSearch = ref(false);
const searchQuery = ref('');

// Mock 제품 목록
const products = ref([
  { id: 1, name: '나이키 덩크 로우', brand: 'Nike', emoji: '👟' },
  { id: 2, name: '조던 4 레트로', brand: 'Jordan', emoji: '👟' },
  { id: 3, name: '아디다스 예지', brand: 'Adidas', emoji: '👟' },
  { id: 4, name: '뉴발란스 550', brand: 'New Balance', emoji: '👟' },
  { id: 5, name: '반스 올드스쿨', brand: 'Vans', emoji: '👟' },
  { id: 6, name: '컨버스 척 70', brand: 'Converse', emoji: '👟' }
]);

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const isProductSelected = (productId) => {
  return props.selectedItems.some(item => item.id === productId);
};

const toggleProduct = (product) => {
  const index = props.selectedItems.findIndex(item => item.id === product.id);

  if (index !== -1) {
    const newItems = [...props.selectedItems];
    newItems.splice(index, 1);
    emit('update:selectedItems', newItems);
  } else {
    if (props.selectedItems.length < 20) {
      const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)'
      ];

      emit('update:selectedItems', [
        ...props.selectedItems,
        {
          ...product,
          gradient: gradients[props.selectedItems.length % gradients.length]
        }
      ]);
    } else {
      alert('최대 20개까지만 선택 가능합니다');
    }
  }
};

const removeItem = (index) => {
  const newItems = [...props.selectedItems];
  newItems.splice(index, 1);
  emit('update:selectedItems', newItems);
};

const showNewItemModal = () => {
  alert('새 아이템 추가 모달 (구현 예정)');
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

.btn-secondary {
  padding: 10px 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #9CA3AF;
  color: #1A1A1A;
}

.product-item {
  transition: all 0.2s;
}

.product-item:hover {
  border-color: #9CA3AF !important;
  transform: translateY(-2px);
}

.product-item.selected {
  border-color: #1A1A1A !important;
  background: #FAFBFC;
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
}

.selected-item:hover .selected-item-remove {
  opacity: 1;
}
</style>