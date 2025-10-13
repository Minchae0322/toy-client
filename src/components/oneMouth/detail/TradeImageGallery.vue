<!-- TradeImageGallery.vue -->
<template>
  <div class="image-gallery">
    <div class="main-image">
      <div v-if="!currentImage" class="image-placeholder">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
        </svg>
        <span>이미지 없음</span>
      </div>
      <img v-else :src="currentImage" :alt="alt" class="main-image-img" />
    </div>

    <div v-if="allImages.length > 1" class="thumbnail-list">
      <button
          v-for="(image, index) in allImages"
          :key="index"
          class="thumbnail-item"
          :class="{ active: currentIndex === index }"
          @click="selectImage(index)"
      >
        <div v-if="!image" class="thumbnail-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
          </svg>
        </div>
        <img v-else :src="image" :alt="`이미지 ${index + 1}`" class="thumbnail-img" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  thumbnail: {
    type: String,
    default: null
  },
  alt: {
    type: String,
    default: '상품 이미지'
  }
});

const currentIndex = ref(0);

const allImages = computed(() => {
  const imgs = [props.thumbnail, ...props.images].filter(Boolean);
  return imgs.length > 0 ? imgs : [null];
});

const currentImage = computed(() => allImages.value[currentIndex.value]);

const selectImage = (index) => {
  currentIndex.value = index;
};
</script>

<style scoped>
.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 40px;
  background: #FAFAFA;
}

.main-image {
  width: 100%;
  height: 480px;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #9CA3AF;
}

.image-placeholder span {
  font-size: 14px;
  font-weight: 500;
}

.main-image-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumbnail-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.thumbnail-list::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-list::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 2px;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 2px;
}

.thumbnail-item {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  background: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-item:hover {
  border-color: #4F46E5;
}

.thumbnail-item.active {
  border-color: #4F46E5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.thumbnail-placeholder {
  color: #D1D5DB;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .image-gallery {
    padding: 24px;
  }

  .main-image {
    height: 320px;
  }

  .thumbnail-item {
    width: 64px;
    height: 64px;
  }
}
</style>