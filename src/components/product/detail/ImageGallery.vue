<template>
  <div class="image-gallery">
    <div class="main-image">
      <img
          v-if="currentImage?.fileUrl"
          :src="currentImage.fileUrl"
          :alt="product.name"
          @error="handleImageError"
      />
      <div v-else class="placeholder-image">📦</div>
      <div class="image-nav" v-if="imageFiles.length > 1">
        {{ currentImageIndex + 1 }} / {{ imageFiles.length }}
      </div>
    </div>
    <div class="thumbnail-list" v-if="imageFiles.length > 1">
      <div
          v-for="(file, index) in imageFiles"
          :key="file.id"
          class="thumbnail"
          :class="{ active: index === currentImageIndex }"
          @click="setCurrentImage(index)"
      >
        <img
            v-if="file.fileUrl"
            :src="file.fileUrl"
            :alt="`${product.name} ${index + 1}`"
            @error="handleImageError"
        />
        <span v-else>📷</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  currentImageIndex: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:currentImageIndex'])

const imageFiles = computed(() => {
  if (!props.product?.attachmentFiles) return []

  return props.product.attachmentFiles.filter(file => {
    if (file.contentType) {
      return file.contentType.startsWith('image/')
    }
    if (file.orgFileNm) {
      const ext = file.orgFileNm.split('.').pop().toLowerCase()
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
    }
    return file.fileUrl != null
  })
})

const currentImage = computed(() => {
  return imageFiles.value[props.currentImageIndex] || null
})

const setCurrentImage = (index) => {
  emit('update:currentImageIndex', index)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>

<style scoped>
.image-gallery {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.main-image {
  width: 100%;
  height: 400px;
  background: linear-gradient(45deg, #1DCD9F, #169976);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 80px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  font-size: 80px;
}

.image-nav {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.thumbnail-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #1DCD9F, #169976);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail.active {
  border-color: #1DCD9F;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1DCD9F;
}

.thumbnail-list::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  background: #1DCD9F;
  border-radius: 2px;
}

.thumbnail-list::-webkit-scrollbar-thumb:hover {
  background: #169976;
}

@media (max-width: 768px) {
  .image-gallery {
    padding: 20px;
  }

  .main-image {
    height: 300px;
    font-size: 60px;
  }

  .placeholder-image {
    font-size: 60px;
  }
}
</style>