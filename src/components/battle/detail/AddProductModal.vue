<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">제품 추가하기</h2>
        <button @click="$emit('close')" class="btn-close">
          <span class="icon">×</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Image Upload -->
        <div class="form-group">
          <label class="form-label">제품 사진 *</label>
          <div class="image-upload">
            <div v-if="imagePreview" class="image-preview" :class="{ uploading: imageUploading, 'upload-failed': uploadFailed }">
              <img :src="imagePreview" alt="Preview" />
              <!-- 업로드 중 오버레이 -->
              <div v-if="imageUploading" class="upload-overlay">
                <svg class="upload-spinner" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                </svg>
                <span class="upload-status-text">업로드 중...</span>
              </div>
              <!-- 업로드 실패 오버레이 -->
              <div v-if="uploadFailed" class="upload-failed-overlay">
                <span class="failed-icon">!</span>
                <span class="failed-text">업로드 실패</span>
              </div>
              <button @click="$emit('clear-image')" class="btn-remove-image" :disabled="imageUploading">
                <span class="icon">×</span>
              </button>
            </div>
            <label v-else class="image-upload-label">
              <span class="icon upload-icon">⬆</span>
              <span class="upload-text">사진 업로드</span>
              <span class="upload-hint">클릭하여 선택 (최대 5MB)</span>
              <input
                  type="file"
                  accept="image/*"
                  @change="handleImageChange"
                  style="display: none"
              />
            </label>
          </div>
        </div>

        <!-- Product Name -->
        <div class="form-group">
          <label class="form-label">제품명 *</label>
          <input
              :value="name"
              @input="$emit('update:name', $event.target.value)"
              type="text"
              placeholder="예: AirPods Pro 2"
              maxlength="30"
              class="form-input"
          />
        </div>

        <!-- Brand (Optional) -->
        <div class="form-group">
          <label class="form-label">브랜드 <span class="optional">(선택)</span></label>
          <input
              :value="brand"
              @input="$emit('update:brand', $event.target.value)"
              type="text"
              placeholder="예: Apple"
              maxlength="20"
              class="form-input"
          />
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          취소
        </button>
        <button @click="$emit('submit')" :disabled="submitting" class="btn-confirm">
          {{ submitting ? '등록 중...' : '제품 등록' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  imagePreview: {
    type: String,
    default: null
  },
  imageUploading: {
    type: Boolean,
    default: false
  },
  uploadFailed: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    default: ''
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update:image', 'clear-image', 'update:name', 'update:brand', 'submit'])

const handleImageChange = (e) => {
  emit('update:image', e)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 512px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #111827;
}

.btn-close {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: #f3f4f6;
}

.btn-close .icon {
  font-size: 20px;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-label .optional {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.image-upload {
  position: relative;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.image-preview.uploading {
  opacity: 0.8;
}

.image-preview.upload-failed {
  border-color: #ef4444;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 업로드 중 오버레이 */
.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-spinner {
  width: 32px;
  height: 32px;
  color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-status-text {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

/* 업로드 실패 오버레이 */
.upload-failed-overlay {
  position: absolute;
  inset: 0;
  background: rgba(239, 68, 68, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.failed-icon {
  width: 32px;
  height: 32px;
  background: white;
  color: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.failed-text {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 8px;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-remove-image:hover {
  background-color: #f3f4f6;
}

.btn-remove-image .icon {
  font-size: 16px;
  color: #6b7280;
}

.image-upload-label {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.image-upload-label:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-icon {
  font-size: 32px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: inherit;
}

.btn-cancel:hover {
  background-color: #f3f4f6;
}

.btn-confirm {
  padding: 10px 20px;
  background-color: #3b82f6;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: inherit;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  font-size: 16px;
  line-height: 1;
}
</style>
