<template>
  <div class="form-section">
    <div class="section-header">
      <h3 class="section-title">제품 이미지</h3>
      <span class="required-badge">필수</span>
    </div>

    <!-- 대표 이미지 -->
    <div class="form-group">
      <label class="form-label">
        대표 이미지 <span class="required">*</span>
      </label>

      <div class="image-requirements">
        <div class="req-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="#6B7280" stroke-width="1.5"/>
            <path d="M2 10L5 7L8 10L13 5" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>권장 비율: 1:1</span>
        </div>
        <div class="req-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V14M2 8H14" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>최대: 5MB</span>
        </div>
        <div class="req-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 11V13C13 13.5523 12.5523 14 12 14H4C3.44772 14 3 13.5523 3 13V11M11 5L8 2M8 2L5 5M8 2V11" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>PNG, JPG, JPEG</span>
        </div>
      </div>

      <ThumbnailUpload
          :thumbnail-file="localThumbnailFile"
          :is-logged-in="isLoggedIn"
          :error="errors.thumbnail"
          @update="updateThumbnail"
          @remove="$emit('remove-thumbnail')"
          ref="thumbnailUploadRef"
      />
    </div>

    <!-- 추가 이미지 -->
    <div class="form-group">
      <label class="form-label">
        추가 이미지 <span class="optional">(선택)</span>
        <span class="label-hint">최대 4개</span>
      </label>

      <div class="image-info">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#6B7280" stroke-width="1.5"/>
          <path d="M8 5V8L10 10" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>제품의 다양한 각도나 상세 이미지를 추가로 등록할 수 있습니다</span>
      </div>

      <AdditionalImagesUpload
          :additional-files="localAdditionalFiles"
          :is-logged-in="isLoggedIn"
          :error="errors.additionalImages"
          @update="updateAdditional"
          @remove="handleRemoveAdditional"
          ref="additionalUploadRef"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ThumbnailUpload from '@/components/product/create/ThumbnailUpload.vue'
import AdditionalImagesUpload from '@/components/product/create/AdditionalImagesUpload.vue'

const props = defineProps({
  thumbnailFile: {
    type: Object,
    default: null
  },
  additionalFiles: {
    type: Array,
    default: () => []
  },
  errors: {
    type: Object,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits([
  'update:thumbnail-file',
  'update:additional-files',
  'remove-thumbnail',
  'remove-additional'
])

const thumbnailUploadRef = ref(null)
const additionalUploadRef = ref(null)

const localThumbnailFile = computed({
  get: () => props.thumbnailFile,
  set: (value) => emit('update:thumbnail-file', value)
})

const localAdditionalFiles = computed({
  get: () => props.additionalFiles,
  set: (value) => emit('update:additional-files', value)
})

const updateThumbnail = (file) => {
  localThumbnailFile.value = file
}

const updateAdditional = (files) => {
  localAdditionalFiles.value = files
}

const handleRemoveAdditional = (index) => {
  emit('remove-additional', index)
}

defineExpose({
  thumbnailUploadRef,
  additionalUploadRef
})
</script>

<style scoped>
.form-section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #F3F4F6;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.required-badge {
  padding: 4px 12px;
  background: #FEE2E2;
  color: #DC2626;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.required {
  color: #DC2626;
  font-weight: 700;
}

.optional {
  font-size: 12px;
  font-weight: 500;
  color: #9CA3AF;
}

.label-hint {
  font-size: 11px;
  font-weight: 500;
  color: #9CA3AF;
  background: #F9FAFB;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.image-requirements {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px;
  background: #FAFAFA;
  border-radius: 10px;
  border: 1px solid #F3F4F6;
  margin-bottom: 16px;
}

.req-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
}

.image-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #075985;
  font-weight: 500;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .image-requirements {
    grid-template-columns: 1fr;
  }
}
</style>