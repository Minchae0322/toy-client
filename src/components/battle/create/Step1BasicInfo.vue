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
          <div class="type-icon" :class="type.iconType">
            <!-- Lock Icon -->
            <svg v-if="type.iconType === 'lock'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <!-- Globe Icon -->
            <svg v-else-if="type.iconType === 'globe'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <!-- Check Circle Icon -->
            <svg v-else-if="type.iconType === 'check-circle'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
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
            <div class="category-emoji">
              <span v-if="category.emoji">{{ category.emoji }}</span>
              <svg v-else class="folder-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
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
            <div class="category-emoji">
              <span v-if="subCategory.emoji">{{ subCategory.emoji }}</span>
              <svg v-else class="file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
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
        <svg class="hint-icon warning" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        하위 카테고리를 반드시 선택해야 합니다
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
          <div class="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
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
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #F0F0F3;
  box-sizing: border-box;
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint-icon {
  flex-shrink: 0;
}

.hint-icon.warning {
  color: #F59E0B;
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
  background: #FAFBFC;
}

/* 선택 상태 테두리 - 각 타입별 색상 */
.type-option.selected:has(.type-icon.lock) {
  border-color: #374151;
}

.type-option.selected:has(.type-icon.globe) {
  border-color: #2563EB;
}

.type-option.selected:has(.type-icon.check-circle) {
  border-color: #059669;
}

.type-icon {
  width: 36px;
  height: 36px;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.2s;
}

/* 아이콘별 색상 */
.type-icon.lock {
  color: #6B7280;
  background: #F3F4F6;
}

.type-icon.globe {
  color: #3B82F6;
  background: #EFF6FF;
}

.type-icon.check-circle {
  color: #10B981;
  background: #ECFDF5;
}

/* 선택 상태 - 각 아이콘별 진한 색상 */
.type-option.selected .type-icon.lock {
  background: #374151;
  color: #fff;
}

.type-option.selected .type-icon.globe {
  background: #2563EB;
  color: #fff;
}

.type-option.selected .type-icon.check-circle {
  background: #059669;
  color: #fff;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-emoji .folder-icon {
  color: #F59E0B;
}

.category-emoji .file-icon {
  color: #6366F1;
}

.category-item.selected .category-emoji .folder-icon,
.category-item.selected .category-emoji .file-icon {
  color: #fff;
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
  margin-bottom: 12px;
  color: #6366F1;
}

.upload-icon svg {
  width: 48px;
  height: 48px;
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
  .form-section {
    padding: 24px 20px;
    border-radius: 12px;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .form-input {
    padding: 14px 16px;
    font-size: 16px; /* iOS 줌 방지 */
  }

  .permission-type-selector {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .type-option {
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-direction: row;
  }

  .type-icon {
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .type-option .type-title,
  .type-option .type-desc {
    text-align: left;
  }

  .type-desc {
    display: none;
  }

  .category-grid.parent {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .category-grid.sub {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .category-item {
    padding: 10px 8px;
  }

  .category-emoji {
    font-size: 20px;
  }

  .sub-item .category-emoji {
    font-size: 18px;
  }

  .category-name {
    font-size: 11px;
  }

  .date-selector {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .upload-placeholder {
    padding: 32px 16px;
  }

  .upload-icon svg {
    width: 40px;
    height: 40px;
  }

  .upload-icon {
    margin-bottom: 8px;
  }

  .upload-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 20px 16px;
  }

  .category-grid.parent {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-grid.sub {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-item {
    padding: 10px 6px;
  }

  .category-emoji {
    font-size: 18px;
    margin-bottom: 2px;
  }

  .category-name {
    font-size: 10px;
  }

  .sub-count {
    font-size: 9px;
  }

  .selected-path {
    padding: 8px 12px;
  }

  .path-text {
    font-size: 12px;
  }
}
</style>