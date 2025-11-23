<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-box">
      <!-- Header -->
      <div class="modal-head">
        <h2 class="modal-heading">제품 추가하기</h2>
        <button @click="$emit('close')" class="close-x">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="modal-main">
        <!-- Image Upload -->
        <div class="form-group">
          <label class="group-label">제품 사진 *</label>

          <div v-if="newProduct.imagePreview" class="preview-box">
            <img :src="newProduct.imagePreview" alt="미리보기" class="preview-img" />
            <button @click="$emit('clear-image')" class="remove-x">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <label v-else class="upload-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <span class="upload-main">사진 업로드</span>
            <span class="upload-sub">클릭하여 선택</span>
            <input
                type="file"
                accept="image/*"
                @change="$emit('update:image', $event)"
                class="hidden-file"
            />
          </label>
        </div>

        <!-- Product Name -->
        <div class="form-group">
          <label class="group-label">제품명 *</label>
          <input
              type="text"
              :value="newProduct.name"
              @input="$emit('update:name', $event.target.value)"
              placeholder="예: AirPods Pro 2"
              class="text-field"
          />
        </div>

        <!-- Brand -->
        <div class="form-group">
          <label class="group-label">브랜드 *</label>
          <input
              type="text"
              :value="newProduct.brand"
              @input="$emit('update:brand', $event.target.value)"
              placeholder="예: Apple"
              class="text-field"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-foot">
        <button @click="$emit('close')" class="cancel-btn">
          취소
        </button>
        <button @click="$emit('submit')" class="submit-btn">
          제품 등록
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  newProduct: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'update:image', 'clear-image', 'update:name', 'update:brand', 'submit'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.modal-box {
  background: white;
  border-radius: 16px;
  max-width: 512px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-heading {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close-x {
  padding: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6B7280;
  border-radius: 8px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-x:hover {
  background: #F3F4F6;
}

.modal-main {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.group-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.preview-box {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #E5E7EB;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-x {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 8px;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #6B7280;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-x:hover {
  background: #F3F4F6;
}

.upload-box {
  aspect-ratio: 1;
  border: 2px dashed #D1D5DB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #9CA3AF;
}

.upload-box:hover {
  border-color: #3B82F6;
  background: #EFF6FF;
  color: #2563EB;
}

.upload-main {
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
}

.upload-sub {
  font-size: 12px;
  margin-top: 4px;
}

.hidden-file {
  display: none;
}

.text-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  transition: all 0.15s ease;
  font-family: inherit;
}

.text-field:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.text-field::placeholder {
  color: #9CA3AF;
}

.modal-foot {
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #D1D5DB;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.cancel-btn:hover {
  background: #F9FAFB;
}

.submit-btn {
  padding: 10px 20px;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.submit-btn:hover {
  background: #1D4ED8;
}
</style>