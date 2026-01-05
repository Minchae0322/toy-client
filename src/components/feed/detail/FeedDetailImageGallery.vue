<template>
  <div class="image-gallery">
    <div
        class="image-container"
        @dblclick="handleDoubleTap"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
    >
      <img
          :src="getCurrentImage"
          :alt="productName"
          class="main-image"
          loading="lazy"
      />

      <!-- Like Animation -->
      <transition name="like-scale">
        <div v-if="showLikeAnimation" class="like-animation">
          <svg class="heart-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
          </svg>
        </div>
      </transition>

      <!-- Navigation Arrows -->
      <transition name="fade">
        <button v-if="currentIndex > 0 && isHovered" class="nav-btn prev" @click="prevImage">
          <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
          </svg>
        </button>
      </transition>

      <transition name="fade">
        <button v-if="currentIndex < images.length - 1 && isHovered" class="nav-btn next" @click="nextImage">
          <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
          </svg>
        </button>
      </transition>

      <!-- Quick Like Button -->
      <button
          class="quick-like-btn"
          :class="{ active: isLiked }"
          @click.stop="handleLike"
      >
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
        </svg>
      </button>

      <!-- Image Indicators -->
      <div v-if="images.length > 1" class="image-indicators">
        <button
            v-for="(img, idx) in images"
            :key="idx"
            :class="['indicator', { active: idx === currentIndex }]"
            @click="currentIndex = idx"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  productName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['like'])

const currentIndex = ref(0)
const showLikeAnimation = ref(false)
const isHovered = ref(false)
const isLiked = ref(false)

const getCurrentImage = computed(() => {
  if (props.images.length === 0) return ''
  return props.images[currentIndex.value]?.fileUrl || ''
})

const prevImage = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) currentIndex.value++
}

const handleDoubleTap = () => {
  isLiked.value = true
  emit('like')
  showLikeAnimation.value = true
  setTimeout(() => {
    showLikeAnimation.value = false
  }, 600)
}

const handleLike = () => {
  isLiked.value = !isLiked.value
  emit('like')
}
</script>

<style scoped>
.image-gallery {
  position: relative;
  width: 100%;
}

.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #1a1a1a;
  cursor: pointer;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
}

/* Like Animation */
.like-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}

.heart-icon {
  width: 80px;
  height: 80px;
  color: #9333ea;
  filter: drop-shadow(0 4px 20px rgba(147, 51, 234, 0.4));
}

.like-scale-enter-active {
  animation: likeScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes likeScale {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

/* Navigation Buttons */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 5;
}

.nav-btn:hover {
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.nav-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.nav-btn.prev {
  left: 12px;
}

.nav-btn.next {
  right: 12px;
}

.nav-icon {
  width: 20px;
  height: 20px;
  color: #111827;
}

/* Quick Like Button */
.quick-like-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  z-index: 5;
}

.quick-like-btn svg {
  width: 22px;
  height: 22px;
  color: #d1d5db;
  transition: all 0.2s;
}

.quick-like-btn:hover {
  transform: scale(1.08);
}

.quick-like-btn:hover svg {
  color: #9333ea;
}

.quick-like-btn.active svg {
  color: #9333ea;
}

/* Image Indicators */
.image-indicators {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

.indicator.active {
  width: 18px;
  border-radius: 3px;
  background: white;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>