<template>
  <section class="section">
    <div class="section-header">
      <h2>
        상품 이미지
        <span class="required">*</span>
      </h2>
      <span class="image-count">{{ images.length }}/5</span>
    </div>

    <div class="image-grid">
      <!-- 업로드된 이미지 -->
      <div
          v-for="(image, index) in images"
          :key="index"
          class="image-item"
      >
        <img :src="image.fileUrl" alt="" />
        <button
            @click="$emit('remove', index)"
            class="btn-remove"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <span v-if="index === 0" class="badge-thumbnail">대표</span>
      </div>

      <!-- 업로드 버튼 -->
      <label
          v-if="images.length < 5"
          class="upload-button"
          :class="{ disabled: uploading }"
      >
        <input
            type="file"
            accept="image/*"
            multiple
            @change="handleFileChange"
            :disabled="uploading"
        >
        <div v-if="uploading" class="spinner"></div>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>{{ uploading ? '업로드 중' : '사진 추가' }}</span>
      </label>
    </div>

    <p class="guide-text">
      첫 번째 이미지가 대표 사진으로 설정됩니다
    </p>
  </section>
</template>

<script setup>
defineProps({
  images: Array,
  uploading: Boolean
});

const emit = defineEmits(['upload', 'remove']);

const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  emit('upload', files);
  event.target.value = '';
};
</script>

<style scoped>
.section {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.image-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f3f4f6;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.image-item:hover .btn-remove {
  opacity: 1;
}

.btn-remove:hover {
  background: rgba(0, 0, 0, 0.8);
}

.badge-thumbnail {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #4f46e5;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.25rem;
}

.upload-button {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  gap: 0.5rem;
  color: #9ca3af;
}

.upload-button:hover:not(.disabled) {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.upload-button.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.upload-button input {
  display: none;
}

.upload-button span {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.guide-text {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>