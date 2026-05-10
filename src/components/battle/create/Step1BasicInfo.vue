<template>
  <div class="step-container">
    <!-- 상단 안내 -->
    <div class="step-intro">
      <div class="intro-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
      <div class="intro-content">
        <h2 class="intro-title">요거픽 기본 정보</h2>
        <p class="intro-desc">제목, 카테고리, 진행 기간 등 요거픽의 핵심 정보를 설정하세요.</p>
      </div>
    </div>

    <!-- 요거픽 제목 -->
    <div class="form-card">
      <div class="card-header">
        <div class="card-number">1</div>
        <div class="card-title-group">
          <label class="card-title">요거픽 제목</label>
          <span class="card-subtitle">사람들의 관심을 끌 수 있는 제목을 작성해보세요</span>
        </div>
      </div>
      <div class="card-body">
        <input
            :value="battleForm.title"
            @input="onTitleInput"
            @compositionend="onTitleInput"
            type="text"
            maxlength="30"
            class="form-input title-input"
            :class="{ filled: battleForm.title.trim().length > 0 }"
            placeholder="예: 2025 최고의 무선 이어폰은?"
        >
        <div class="input-footer">
          <span class="char-count" :class="{ warning: battleForm.title.length >= 30 }">
            {{ battleForm.title.length }}/30
          </span>
        </div>
      </div>
    </div>

    <!-- 카테고리 선택 -->
    <div class="form-card">
      <div class="card-header">
        <div class="card-number">2</div>
        <div class="card-title-group">
          <label class="card-title">카테고리</label>
          <span class="card-subtitle">요거픽 주제에 맞는 카테고리를 선택해주세요</span>
        </div>
      </div>
      <div class="card-body">
        <CategoryChipSelector
          v-model="battleForm.subCategoryId"
          content-type="BATTLE"
          @select="handleCategorySelect"
        />
      </div>
    </div>

    <!-- 아이템 추가 권한 -->
    <div class="form-card">
      <div class="card-header">
        <div class="card-number">3</div>
        <div class="card-title-group">
          <label class="card-title">아이템 추가 권한</label>
          <span class="card-subtitle">다른 사람이 요거픽에 아이템을 추가할 수 있게 할까요?</span>
        </div>
      </div>
      <div class="card-body">
        <div class="permission-options">
          <button
              v-for="type in itemAddPermissionTypes"
              :key="type.value"
              type="button"
              class="permission-option"
              :class="{ selected: battleForm.itemAddPermissionType === type.value }"
              @click="$emit('update:battleForm', { ...battleForm, itemAddPermissionType: type.value })"
          >
            <div class="option-radio">
              <div class="radio-dot"></div>
            </div>
            <div class="option-icon" :class="type.iconType">
              <svg v-if="type.iconType === 'lock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <svg v-else-if="type.iconType === 'globe'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <svg v-else-if="type.iconType === 'check-circle'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="option-content">
              <span class="option-title">{{ type.title }}</span>
              <span class="option-desc">{{ type.desc }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 요거픽 기간 -->
    <div class="form-card">
      <div class="card-header">
        <div class="card-number">4</div>
        <div class="card-title-group">
          <label class="card-title">요거픽 기간</label>
          <span class="card-subtitle">요거픽이 진행될 기간을 설정해주세요</span>
        </div>
      </div>
      <div class="card-body">
        <div class="date-range-picker">
          <div class="date-field">
            <label class="date-field-label">시작일</label>
            <div class="date-input-wrapper">
              <svg class="date-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input
                  :value="battleForm.startDate"
                  @input="$emit('update:battleForm', { ...battleForm, startDate: $event.target.value })"
                  type="date"
                  class="date-input"
              >
            </div>
          </div>
          <div class="date-separator">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
          <div class="date-field">
            <label class="date-field-label">종료일</label>
            <div class="date-input-wrapper">
              <svg class="date-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input
                  :value="battleForm.endDate"
                  @input="$emit('update:battleForm', { ...battleForm, endDate: $event.target.value })"
                  type="date"
                  class="date-input"
              >
            </div>
          </div>
        </div>
        <div v-if="dateDuration" class="duration-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{{ dateDuration }}일간 진행</span>
        </div>
      </div>
    </div>

    <!-- 투표 시작일 -->
    <div class="form-card">
      <div class="card-header">
        <div class="card-number">5</div>
        <div class="card-title-group">
          <label class="card-title">투표 시작일</label>
          <span class="card-subtitle">언제부터 투표를 받을 수 있게 할까요?</span>
        </div>
      </div>
      <div class="card-body">
        <div class="date-input-wrapper single">
          <svg class="date-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <input
              :value="battleForm.participationStartDate"
              @input="$emit('update:battleForm', { ...battleForm, participationStartDate: $event.target.value })"
              type="date"
              class="date-input"
          >
        </div>
        <p class="field-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          투표 시작 전까지는 아이템만 등록할 수 있습니다
        </p>
      </div>
    </div>

    <!-- 대표 이미지 (선택) -->
    <div class="form-card optional">
      <div class="card-header">
        <div class="card-number optional">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <div class="card-title-group">
          <label class="card-title">
            대표 이미지
            <span class="optional-badge">선택</span>
          </label>
          <span class="card-subtitle">요거픽 목록에서 보여질 이미지입니다</span>
        </div>
      </div>
      <div class="card-body">
        <div class="image-upload-zone">
          <div
              v-if="!previewImage"
              class="upload-dropzone"
              @click="$refs.thumbnailInput.click()"
              @dragover.prevent
              @drop.prevent="handleDrop"
          >
            <div class="dropzone-content">
              <div class="dropzone-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <span class="dropzone-text">클릭하거나 이미지를 여기에 드래그하세요</span>
              <span class="dropzone-hint">JPG, PNG, GIF / 최대 10MB</span>
            </div>
          </div>
          <div v-else class="image-preview-box">
            <img :src="previewImage" alt="대표 이미지">
            <div v-if="isUploading" class="upload-progress">
              <svg class="spinner" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
              <span>업로드 중...</span>
            </div>
            <button class="btn-remove-image" @click="removeImage" :disabled="isUploading" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
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

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useFile } from '@/services/FileService.js';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import CategoryChipSelector from '@/components/common/CategoryChipSelector.vue';

const props = defineProps({
  battleForm: {
    type: Object,
    required: true
  },
  itemAddPermissionTypes: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:battleForm']);

const TITLE_MAX = 20;
const onTitleInput = (e) => {
  const raw = e.target.value;
  const chars = Array.from(raw);
  if (chars.length > TITLE_MAX) {
    const truncated = chars.slice(0, TITLE_MAX).join('');
    e.target.value = truncated;
    emit('update:battleForm', { ...props.battleForm, title: truncated });
    return;
  }
  if (raw !== props.battleForm.title) {
    emit('update:battleForm', { ...props.battleForm, title: raw });
  }
};

const fileService = useFile();
const { open } = useConfirmDialog();
const isUploading = ref(false);

const thumbnailInput = ref(null);

// 요거픽 기간 계산
const dateDuration = computed(() => {
  if (!props.battleForm.startDate || !props.battleForm.endDate) return null;
  const start = new Date(props.battleForm.startDate);
  const end = new Date(props.battleForm.endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
});

// 카테고리 선택 처리
const handleCategorySelect = ({ categoryId, subCategoryId, categoryName, subCategoryName, categoryEmoji }) => {
  emit('update:battleForm', {
    ...props.battleForm,
    categoryId,
    subCategoryId,
    categoryName,
    subCategoryName,
    categoryEmoji
  });
};

// 미리보기: 서버 URL 우선, 없으면 로컬 preview
const previewImage = computed(() => {
  if (props.battleForm.thumbnailPreviewUrl) {
    return props.battleForm.thumbnailPreviewUrl;
  }
  if (props.battleForm.thumbnailFile) {
    return URL.createObjectURL(props.battleForm.thumbnailFile);
  }
  return null;
});

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    processImageFile(file);
  }
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    await processImageFile(file);
  }
};

const processImageFile = async (file) => {
  if (file.size > 10 * 1024 * 1024) {
    await open({ type: 'alert', title: '알림', message: '파일 크기는 10MB를 초과할 수 없습니다.' });
    return;
  }

  if (!file.type.startsWith('image/')) {
    await open({ type: 'alert', title: '알림', message: '이미지 파일만 업로드 가능합니다.' });
    return;
  }

  isUploading.value = true;
  emit('update:battleForm', {
    ...props.battleForm,
    thumbnailFile: file,
    thumbnailPreviewUrl: null,
    thumbnailAttachmentInfo: null
  });

  try {
    const uploadResult = await fileService.upload(file, { fileCode: 'BATTLE' });

    if (uploadResult.success && uploadResult.data) {
      const attachmentData = uploadResult.data;
      const serverUrl = attachmentData.fileUrl || attachmentData.storedPath;

      emit('update:battleForm', {
        ...props.battleForm,
        thumbnailFile: file,
        thumbnailPreviewUrl: serverUrl,
        thumbnailAttachmentInfo: {
          fileId: attachmentData.id,
          storedPath: attachmentData.fileUrl,
          originName: attachmentData.orgFileNm || file.name,
          fileSize: attachmentData.fileSize || file.size,
          contentType: attachmentData.contentType || file.type
        }
      });
    } else {
      throw new Error(uploadResult.error || '업로드 실패');
    }
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    await open({ type: 'alert', title: '오류', message: '이미지 업로드에 실패했습니다.' });
    emit('update:battleForm', {
      ...props.battleForm,
      thumbnailFile: null,
      thumbnailPreviewUrl: null,
      thumbnailAttachmentInfo: null
    });
  } finally {
    isUploading.value = false;
  }
};

const removeImage = () => {
  emit('update:battleForm', {
    ...props.battleForm,
    thumbnailFile: null,
    thumbnailPreviewUrl: null,
    thumbnailAttachmentInfo: null
  });
};
</script>

<style scoped>
.step-container {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: transparent;
}

/* 상단 안내 */
.step-intro {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.intro-icon {
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.intro-content {
  flex: 1;
}

.intro-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px 0;
}

.intro-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* 폼 카드 */
.form-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s;
}

.form-card:hover {
  border-color: #d1d5db;
}

.form-card.optional {
  border-style: dashed;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 24px 0;
}

.card-number {
  width: 28px;
  height: 28px;
  background: #374151;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.card-number.optional {
  background: #e5e7eb;
  color: #6b7280;
}

.card-title-group {
  flex: 1;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

.optional-badge {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-body {
  padding: 16px 24px 24px;
}

/* 입력 필드 */
.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.2s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #1a1a1a;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.08);
}

.form-input.filled {
  border-color: #d1fae5;
  background: #f9fdfb;
}

.title-input {
  font-size: 16px;
  font-weight: 500;
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.char-count {
  font-size: 12px;
  color: #9ca3af;
}

.char-count.warning {
  color: #f59e0b;
}

/* 카테고리 버튼 */
.category-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-select-btn:hover {
  border-color: #1a1a1a;
  background: white;
}

.category-select-btn.selected {
  border-color: #d1fae5;
  background: #f9fdfb;
}

.category-btn-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 36px;
  height: 36px;
  background: #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.category-select-btn.selected .category-icon {
  background: #d1fae5;
  color: #059669;
}

.category-text {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.category-placeholder {
  font-size: 14px;
  color: #9ca3af;
}

.chevron-icon {
  color: #9ca3af;
}

/* Category Inline Selection */
.selected-category-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 10px;
  margin-bottom: 12px;
}
.selected-category-label {
  font-size: 14px;
  font-weight: 600;
  color: #7c3aed;
}
.selected-category-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}
.selected-category-clear:hover {
  background: #f3e8ff;
  color: #7c3aed;
}

.category-chips-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.category-chips-title {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
}
.category-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.category-chip {
  padding: 8px 14px;
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.category-chip:hover {
  border-color: #d8b4fe;
  background: #faf5ff;
  color: #7c3aed;
}
.category-chip.active {
  background: #7c3aed;
  color: white;
  border-color: #7c3aed;
}
.category-chip.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #7c3aed;
  border-color: #e9d5ff;
  background: #faf5ff;
  font-weight: 600;
}
.category-chip.more-btn:hover {
  background: #f3e8ff;
  border-color: #d8b4fe;
}

/* 2뎁스 하위 카테고리 */
.sub-category-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}
.sub-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sub-category-chip {
  padding: 6px 12px;
  background: white;
  color: #888;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.sub-category-chip:hover {
  background: #faf5ff;
  border-color: #d8b4fe;
  color: #7c3aed;
}
.sub-category-chip.active {
  background: #f3e8ff;
  border-color: #7c3aed;
  color: #7c3aed;
}

/* 권한 옵션 */
.permission-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.permission-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.permission-option:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.permission-option.selected {
  border-color: #9ca3af;
  background: #f9fafb;
}

.option-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.permission-option.selected .option-radio {
  border-color: #374151;
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: transparent;
  border-radius: 50%;
  transition: all 0.2s;
}

.permission-option.selected .radio-dot {
  background: #374151;
}

.option-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-icon.lock {
  background: #f3f4f6;
  color: #6b7280;
}

.option-icon.globe {
  background: #eff6ff;
  color: #3b82f6;
}

.option-icon.check-circle {
  background: #ecfdf5;
  color: #10b981;
}

.permission-option.selected .option-icon.lock {
  background: #e5e7eb;
  color: #374151;
}

.permission-option.selected .option-icon.globe {
  background: #dbeafe;
  color: #2563eb;
}

.permission-option.selected .option-icon.check-circle {
  background: #d1fae5;
  color: #059669;
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.option-desc {
  font-size: 12px;
  color: #6b7280;
}

/* 날짜 선택 */
.date-range-picker {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.date-field {
  flex: 1;
}

.date-field-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input-wrapper.single {
  max-width: 240px;
}

.date-icon {
  position: absolute;
  left: 14px;
  color: #9ca3af;
  pointer-events: none;
}

.date-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #1a1a1a;
}

.date-separator {
  color: #d1d5db;
  padding-bottom: 8px;
}

.duration-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 8px 14px;
  background: #f0fdf4;
  color: #059669;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 12px;
  color: #9ca3af;
}

/* 이미지 업로드 */
.image-upload-zone {
  width: 100%;
}

.upload-dropzone {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-dropzone:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.dropzone-icon {
  color: #9ca3af;
  margin-bottom: 4px;
}

.dropzone-text {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.dropzone-hint {
  font-size: 12px;
  color: #9ca3af;
}

.image-preview-box {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.image-preview-box img {
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.upload-progress {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.spinner {
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-remove-image {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-image:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.btn-remove-image:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 반응형 */
@media (max-width: 640px) {
  .step-container {
    gap: 16px;
  }

  .step-intro {
    padding: 16px 20px;
    gap: 14px;
  }

  .intro-icon {
    width: 44px;
    height: 44px;
  }

  .intro-title {
    font-size: 16px;
  }

  .intro-desc {
    font-size: 13px;
  }

  .card-header {
    padding: 16px 20px 0;
    gap: 12px;
  }

  .card-number {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }

  .card-title {
    font-size: 14px;
  }

  .card-subtitle {
    font-size: 12px;
  }

  .card-body {
    padding: 14px 20px 20px;
  }

  .form-input {
    padding: 12px 14px;
    font-size: 16px; /* iOS 줌 방지 */
  }

  .date-range-picker {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .date-field {
    width: 100%;
  }

  .date-separator {
    display: none;
  }

  .date-input-wrapper {
    width: 100%;
  }

  .date-input-wrapper.single {
    max-width: 100%;
  }

  .date-input {
    width: 100%;
  }

  .duration-badge {
    margin-top: 12px;
  }

  .permission-option {
    padding: 14px;
    gap: 12px;
  }

  .option-icon {
    width: 32px;
    height: 32px;
  }

  .option-desc {
    display: none;
  }

  .upload-dropzone {
    padding: 32px 20px;
  }

  .dropzone-icon svg {
    width: 28px;
    height: 28px;
  }

  .dropzone-text {
    font-size: 13px;
  }
}
</style>
