<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">
        배틀 제목 <span class="required">*</span>
      </label>
      <input
          :value="battleForm.title"
          @input="$emit('update:battleForm', { ...battleForm, title: $event.target.value })"
          type="text"
          class="form-input"
          placeholder="예: 2025년 2월 최고의 스니커즈는?"
      >
      <div class="form-hint">배틀을 대표하는 명확하고 흥미로운 제목을 작성해주세요</div>
    </div>


    <!-- ⭐ 아이템 추가 권한 타입 -->
    <div class="form-group">
      <label class="form-label">
        아이템 추가 권한 <span class="required">*</span>
      </label>
      <div class="permission-type-selector">
        <div
            v-for="type in itemAddPermissionTypes"
            :key="type.value"
            class="type-option"
            :class="{ selected: battleForm.itemAddPermissionType === type.value }"
            @click="$emit('update:battleForm', { ...battleForm, itemAddPermissionType: type.value })"
        >
          <div class="type-icon">{{ type.icon }}</div>
          <div class="type-title">{{ type.title }}</div>
          <div class="type-desc">{{ type.desc }}</div>
        </div>
      </div>
    </div>

    <!-- ⭐ 2depth 카테고리 선택 -->
    <div class="form-group">
      <label class="form-label">
        카테고리 <span class="required">*</span>
      </label>

      <!-- 1단계: 상위 카테고리 선택 -->
      <div class="category-section">
        <div class="section-title">상위 카테고리</div>
        <div class="category-grid parent">
          <div
              v-for="category in categories"
              :key="category.categoryId"
              class="category-item"
              :class="{ selected: selectedParentCategory?.categoryId === category.categoryId }"
              @click="selectParentCategory(category)"
          >
            <div class="category-emoji">{{ category.emoji || '📁' }}</div>
            <div class="category-name">{{ category.categoryName }}</div>
            <div class="sub-count">{{ (category.children?.length || 0) }}개</div>
          </div>
        </div>
      </div>

      <!-- 2단계: 하위 카테고리 선택 (필수) -->
      <div v-if="selectedParentCategory" class="category-section">
        <div class="section-title">
          하위 카테고리 선택
          <span class="required-badge">필수</span>
        </div>

        <div v-if="selectedParentCategory.children && selectedParentCategory.children.length > 0" class="category-grid sub">
          <div
              v-for="subCategory in selectedParentCategory.children"
              :key="subCategory.categoryId"
              class="category-item sub-item"
              :class="{ selected: battleForm.subCategoryId === subCategory.categoryId }"
              @click="selectSubCategory(subCategory)"
          >
            <div class="category-emoji">{{ subCategory.emoji || '📄' }}</div>
            <div class="category-name">{{ subCategory.categoryName }}</div>
          </div>
        </div>
        <div v-else class="no-subcategory">
          <div class="info-icon"></div>
          <div class="info-text">하위 카테고리가 없습니다. 관리자에게 문의하세요.</div>
        </div>
      </div>

      <!-- 선택된 카테고리 표시 -->
      <div v-if="selectedCategoryPath" class="selected-path">
        <span class="path-icon">✓</span>
        <span class="path-text">{{ selectedCategoryPath }}</span>
      </div>

      <div v-if="categories.length === 0" class="form-hint">카테고리를 불러오는 중...</div>
      <div v-else-if="!selectedParentCategory" class="form-hint">
        먼저 상위 카테고리를 선택해주세요
      </div>
      <div v-else-if="!battleForm.subCategoryId" class="form-hint error">
        ⚠️ 하위 카테고리를 반드시 선택해야 합니다
      </div>
    </div>

    <!-- ⭐ 배틀 기간 -->
    <div class="form-group">
      <label class="form-label">
        배틀 기간 <span class="required">*</span>
      </label>
      <div class="date-selector">
        <div class="date-input-group">
          <span class="date-label">시작일</span>
          <input
              :value="battleForm.startDate"
              @input="$emit('update:battleForm', { ...battleForm, startDate: $event.target.value })"
              type="date"
              class="form-input"
          >
        </div>
        <div class="date-input-group">
          <span class="date-label">종료일</span>
          <input
              :value="battleForm.endDate"
              @input="$emit('update:battleForm', { ...battleForm, endDate: $event.target.value })"
              type="date"
              class="form-input"
          >
        </div>
      </div>
      <div class="form-hint">최소 7일, 최대 31일까지 설정 가능합니다</div>
    </div>

    <!-- ⭐ 참여 시작일 -->
    <div class="form-group">
      <label class="form-label">
        참여 시작일 <span class="required">*</span>
      </label>
      <input
          :value="battleForm.participationStartDate"
          @input="$emit('update:battleForm', { ...battleForm, participationStartDate: $event.target.value })"
          type="date"
          class="form-input"
      >
      <div class="form-hint">투표를 시작할 수 있는 날짜를 설정하세요</div>
    </div>

    <!-- ⭐ 대표 이미지 업로드 (선택) -->
    <div class="form-group">
      <label class="form-label">
        대표 이미지
      </label>
      <div class="image-upload-area">
        <div
            v-if="!previewImage"
            class="upload-placeholder"
            @click="$refs.thumbnailInput.click()"
        >
          <div class="upload-icon">🖼️</div>
          <div class="upload-text">클릭하여 이미지 업로드</div>
          <div class="upload-hint">JPG, PNG, GIF (최대 5MB)</div>
        </div>
        <div v-else class="image-preview">
          <img :src="previewImage" alt="대표 이미지">
          <button class="image-remove" @click="removeImage">×</button>
        </div>
      </div>
      <input
          ref="thumbnailInput"
          type="file"
          accept="image/*"
          style="display: none;"
          @change="handleImageUpload"
      >
      <div class="form-hint">이미지를 등록하지 않으면 기본 이미지가 사용됩니다</div>
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
  itemAddPermissionTypes: {
    type: Array,
    required: true
  },
  categories: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:battleForm']);

const thumbnailInput = ref(null);
const selectedParentCategory = ref(null);

// 🔍 디버깅: categories prop 확인
console.log('📦 전달받은 categories:', props.categories);
console.log('📦 categories 타입:', typeof props.categories);
console.log('📦 categories 배열 여부:', Array.isArray(props.categories));
if (Array.isArray(props.categories) && props.categories.length > 0) {
  console.log('📦 첫 번째 카테고리:', props.categories[0]);
  console.log('📦 children 존재:', props.categories[0].children);
}

// 선택된 카테고리 경로 표시
const selectedCategoryPath = computed(() => {
  if (!selectedParentCategory.value || !props.battleForm.subCategoryId) {
    return null;
  }

  const subCategory = selectedParentCategory.value.children?.find(
      sub => sub.categoryId === props.battleForm.subCategoryId
  );

  if (!subCategory) return null;

  return `${selectedParentCategory.value.categoryName} > ${subCategory.categoryName}`;
});

const previewImage = computed(() => {
  if (!props.battleForm.thumbnailFile) return null;
  return URL.createObjectURL(props.battleForm.thumbnailFile);
});

// 상위 카테고리 선택
const selectParentCategory = (category) => {
  console.log('🔍 선택된 상위 카테고리:', category);
  console.log('📁 하위 카테고리 개수:', category.children?.length || 0);

  selectedParentCategory.value = category;

  // 상위 카테고리 변경 시 하위 카테고리 선택 초기화
  emit('update:battleForm', {
    ...props.battleForm,
    categoryId: category.categoryId,
    subCategoryId: null
  });
};

// 하위 카테고리 선택 (최종 선택)
const selectSubCategory = (subCategory) => {
  emit('update:battleForm', {
    ...props.battleForm,
    subCategoryId: subCategory.categoryId
  });
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB를 초과할 수 없습니다.');
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    return;
  }

  emit('update:battleForm', {
    ...props.battleForm,
    thumbnailFile: file
  });
};

const removeImage = () => {
  emit('update:battleForm', {
    ...props.battleForm,
    thumbnailFile: null
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

.form-hint.error {
  color: #DC2626;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1A1A1A;
}

.char-counter {
  text-align: right;
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

.permission-type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.type-option {
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-option:hover {
  border-color: #9CA3AF;
}

.type-option.selected {
  border-color: #1A1A1A;
  background: #FAFBFC;
}

.type-icon {
  width: 36px;
  height: 36px;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 8px;
}

.type-option.selected .type-icon {
  background: #1A1A1A;
}

.type-title {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 11px;
  color: #6B7280;
  line-height: 1.4;
}

/* ⭐ 2depth 카테고리 스타일 */
.category-section {
  margin-top: 16px;
}

.category-section:first-child {
  margin-top: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.required-badge {
  display: inline-block;
  padding: 2px 6px;
  background: #FEE2E2;
  color: #DC2626;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
}

.category-grid {
  display: grid;
  gap: 12px;
}

.category-grid.parent {
  grid-template-columns: repeat(4, 1fr);
}

.category-grid.sub {
  grid-template-columns: repeat(5, 1fr);
}

.category-item {
  padding: 12px;
  border: 1.5px solid #E5E7EB;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.category-item:hover {
  border-color: #9CA3AF;
  background: #FAFBFC;
  transform: translateY(-1px);
}

.category-item.selected {
  border-color: #1A1A1A;
  background: #1A1A1A;
  color: white;
}

.sub-item {
  padding: 10px;
}

.category-emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

.sub-item .category-emoji {
  font-size: 20px;
}

.category-name {
  font-size: 12px;
  font-weight: 500;
}

.sub-count {
  font-size: 10px;
  color: #9CA3AF;
  margin-top: 2px;
}

.category-item.selected .sub-count {
  color: rgba(255, 255, 255, 0.7);
}

/* 하위 카테고리 없음 경고 */
.no-subcategory {
  margin-top: 12px;
  padding: 14px 16px;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  font-size: 16px;
}

.info-text {
  font-size: 13px;
  color: #991B1B;
  font-weight: 500;
}

/* 선택된 경로 표시 */
.selected-path {
  margin-top: 12px;
  padding: 10px 14px;
  background: #F0FDF4;
  border: 1px solid #86EFAC;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.path-icon {
  color: #16A34A;
  font-size: 14px;
  font-weight: 700;
}

.path-text {
  font-size: 13px;
  font-weight: 600;
  color: #166534;
}

.date-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-label {
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
}

/* 이미지 업로드 */
.image-upload-area {
  margin-top: 12px;
}

.upload-placeholder {
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-placeholder:hover {
  border-color: #9CA3AF;
  background: #FAFBFC;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #9CA3AF;
}

.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  max-width: 400px;
  margin: 0 auto;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.image-remove {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.image-remove:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .permission-type-selector {
    grid-template-columns: 1fr;
  }

  .category-grid.parent {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-grid.sub {
    grid-template-columns: repeat(3, 1fr);
  }

  .date-selector {
    grid-template-columns: 1fr;
  }
}
</style>