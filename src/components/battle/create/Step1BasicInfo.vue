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
          maxlength="50"
      >
      <div class="char-counter">{{ battleForm.title.length }} / 50</div>
      <div class="form-hint">15~50자 사이로 명확하고 흥미로운 제목을 작성해주세요</div>
    </div>

    <!-- ⭐ 아이템 추가 권한 타입 (백엔드 Enum) -->
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

    <!-- ⭐ 서브 카테고리 (백엔드에서 로드) -->
    <div class="form-group">
      <label class="form-label">
        카테고리 <span class="required">*</span>
      </label>
      <div class="category-grid">
        <div
            v-for="category in categories"
            :key="category.subCategoryId"
            class="category-item"
            :class="{ selected: battleForm.subCategoryId === category.subCategoryId }"
            @click="$emit('update:battleForm', { ...battleForm, subCategoryId: category.subCategoryId })"
        >
          <div class="category-emoji">{{ category.emoji }}</div>
          <div class="category-name">{{ category.subCategoryName }}</div>
        </div>
      </div>
      <div v-if="categories.length === 0" class="form-hint">카테고리를 불러오는 중...</div>
    </div>

    <!-- ⭐ 배틀 기간 (startDate, endDate, participationStartDate) -->
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

    <!-- ⭐ 참여 시작일 (추가) -->
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

    <!-- ⭐ 대표 이미지 업로드 (필수) -->
    <div class="form-group">
      <label class="form-label">
        대표 이미지 <span class="required">*</span>
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

const previewImage = computed(() => {
  if (!props.battleForm.thumbnailFile) return null;
  return URL.createObjectURL(props.battleForm.thumbnailFile);
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 파일 크기 체크 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB를 초과할 수 없습니다.');
    return;
  }

  // 이미지 파일 체크
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
  position: relative;
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

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.category-item {
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  border-color: #9CA3AF;
  background: #FAFBFC;
}

.category-item.selected {
  border-color: #1A1A1A;
  background: #1A1A1A;
  color: white;
}

.category-emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

.category-name {
  font-size: 12px;
  font-weight: 500;
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

  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .date-selector {
    grid-template-columns: 1fr;
  }
}
</style>