<template>
  <div class="image-gallery">
    <div
        class="image-container"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
      <img
          :src="getCurrentImage"
          :alt="productName"
          class="main-image"
          loading="lazy"
          draggable="false"
      />

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

const currentIndex = ref(0)
const isHovered = ref(false)

// Touch swipe state
const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwiping = ref(false)

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

// Touch swipe handlers for mobile
const onTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isSwiping.value = false
}

const onTouchMove = (e) => {
  if (!touchStartX.value) return

  const diffX = Math.abs(e.touches[0].clientX - touchStartX.value)
  const diffY = Math.abs(e.touches[0].clientY - touchStartY.value)

  // If horizontal swipe is dominant, prevent vertical scroll
  if (diffX > diffY && diffX > 10) {
    isSwiping.value = true
    e.preventDefault()
  }
}

const onTouchEnd = (e) => {
  if (!isSwiping.value) return

  const touchEndX = e.changedTouches[0].clientX
  const diff = touchStartX.value - touchEndX
  const threshold = 50

  if (diff > threshold) {
    nextImage()
  } else if (diff < -threshold) {
    prevImage()
  }

  touchStartX.value = 0
  touchStartY.value = 0
  isSwiping.value = false
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
  touch-action: pan-y pinch-zoom;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
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
