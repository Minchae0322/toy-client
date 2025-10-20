<!-- ImageGallery.vue -->
<template>
  <div class="gallery">
    <div class="main-image-wrap">
      <img
          :src="images[currentIndex] || '/api/placeholder/800/800'"
          alt="상품 이미지"
          class="main-image"
      />
      <button @click="$emit('toggle-favorite')" class="icon-btn favorite-btn" :class="{ active: isFavorite }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <button @click="$emit('share')" class="icon-btn share-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </div>

    <div v-if="images.length > 1" class="thumbnails">
      <button
          v-for="(image, idx) in images"
          :key="idx"
          @click="$emit('update:current-index', idx)"
          class="thumbnail"
          :class="{ active: currentIndex === idx }"
      >
        <img :src="image" alt="" />
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  images: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false }
})

defineEmits(['update:current-index', 'toggle-favorite', 'share'])
</script>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image-wrap {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-btn {
  position: absolute;
  top: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: white;
  transform: scale(1.05);
}

.icon-btn svg {
  color: #404040;
}

.favorite-btn {
  right: 1rem;
}

.favorite-btn.active svg {
  fill: #EF4444;
  color: #EF4444;
}

.share-btn {
  right: 3.5rem;
}

.thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.75rem;
}

.thumbnail {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail:hover {
  border-color: #D4D4D4;
}

.thumbnail.active {
  border-color: #1A1A1A;
}
</style>