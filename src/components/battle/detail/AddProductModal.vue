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
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" />
              <button @click="$emit('clear-image')" class="btn-remove-image">
                <span class="icon">×</span>
              </button>
            </div>
            <label v-else class="image-upload-label">
              <span class="icon upload-icon">⬆</span>
              <span class="upload-text">사진 업로드</span>
              <span class="upload-hint">클릭하여 선택</span>
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

        <!-- Brand -->
        <div class="form-group">
          <label class="form-label">브랜드 *</label>
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

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
