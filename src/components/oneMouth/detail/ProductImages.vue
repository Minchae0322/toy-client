<!-- components/ProductImages.vue -->
<template>
  <div class="product-images">
    <div class="main-image">
      <img
          :src="currentImage || '/api/placeholder/800/800'"
          :alt="productName"
          class="image"
      />

      <div class="image-actions">
        <button @click="$emit('like')" class="action-btn" :class="{ active: liked }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 8.66c0-3.44-2.78-6.22-6.22-6.22-1.95 0-3.69.9-4.84 2.31a6.215 6.215 0 0 0-4.72-2.31C1.78 2.44-.01 5.22-.01 8.66c0 1.33.42 2.56 1.13 3.58L12 23l10.87-10.76c.71-1.02 1.13-2.25 1.13-3.58z"/>
          </svg>
        </button>
        <button @click="$emit('share')" class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="images.length > 1" class="thumbnails">
      <button
          v-for="(image, index) in displayImages"
          :key="index"
          @click="currentIndex = index"
          class="thumbnail"
          :class="{ active: currentIndex === index }"
      >
        <img :src="image || '/api/placeholder/100/100'" :alt="`${productName} ${index + 1}`" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  images: { type: Array, default: () => [] },
  productName: String,
  liked: Boolean
})

defineEmits(['like', 'share'])

const currentIndex = ref(0)

const displayImages = computed(() => {
  return props.images.length > 0
      ? props.images
      : ['/api/placeholder/800/800']
})

const currentImage = computed(() => displayImages.value[currentIndex.value])
</script>

<style scoped>
.product-images {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.05);
}

.action-btn svg {
  width: 20px;
  height: 20px;
  color: #495057;
}

.action-btn.active svg {
  fill: #e03131;
  color: #e03131;
}

.thumbnails {
  display: flex;
  gap: 8px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail:hover {
  border-color: #dee2e6;
}

.thumbnail.active {
  border-color: #212529;
}
</style>