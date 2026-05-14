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
          @click="openLightbox(currentIndex)"
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

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div v-if="lightboxOpen" class="lightbox-overlay" @click="closeLightbox">
          <!-- Close Button -->
          <button class="lightbox-close" @click="closeLightbox">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Image Counter -->
          <div v-if="images.length > 1" class="lightbox-counter">
            {{ lightboxIndex + 1 }} / {{ images.length }}
          </div>

          <!-- Image -->
          <div
            class="lightbox-image-wrapper"
            @click.stop
            @touchstart="onLightboxTouchStart"
            @touchmove="onLightboxTouchMove"
            @touchend="onLightboxTouchEnd"
          >
            <img
              :src="lightboxImage"
              :alt="productName"
              class="lightbox-image"
              draggable="false"
            />
          </div>

          <!-- Navigation -->
          <button
            v-if="lightboxIndex > 0"
            class="lightbox-nav lightbox-prev"
            @click.stop="lightboxPrev"
          >
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
            </svg>
          </button>
          <button
            v-if="lightboxIndex < images.length - 1"
            class="lightbox-nav lightbox-next"
            @click.stop="lightboxNext"
          >
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
            </svg>
          </button>

          <!-- Indicators -->
          <div v-if="images.length > 1" class="lightbox-indicators">
            <button
              v-for="(img, idx) in images"
              :key="idx"
              :class="['lightbox-dot', { active: idx === lightboxIndex }]"
              @click.stop="lightboxIndex = idx"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

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

// Touch swipe state (gallery)
const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwiping = ref(false)

// Lightbox state
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const getCurrentImage = computed(() => {
  if (props.images.length === 0) return ''
  return props.images[currentIndex.value]?.fileUrl || ''
})

const lightboxImage = computed(() => {
  if (props.images.length === 0) return ''
  return props.images[lightboxIndex.value]?.fileUrl || ''
})

const prevImage = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) currentIndex.value++
}

// Touch swipe handlers for gallery
const isPinching = ref(false)

const onTouchStart = (e) => {
  if (e.touches.length >= 2) { isPinching.value = true; return }
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isSwiping.value = false
  isPinching.value = false
}

const onTouchMove = (e) => {
  if (e.touches.length >= 2) { isPinching.value = true; return }
  if (isPinching.value || !touchStartX.value) return

  const diffX = Math.abs(e.touches[0].clientX - touchStartX.value)
  const diffY = Math.abs(e.touches[0].clientY - touchStartY.value)

  // If horizontal swipe is dominant, prevent vertical scroll
  if (diffX > diffY && diffX > 10) {
    isSwiping.value = true
    e.preventDefault()
  }
}

const onTouchEnd = (e) => {
  if (isPinching.value || !isSwiping.value) {
    isPinching.value = false
    touchStartX.value = 0
    touchStartY.value = 0
    isSwiping.value = false
    return
  }

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

// Lightbox
const openLightbox = (index) => {
  if (isSwiping.value) return
  lightboxIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

const lightboxPrev = () => {
  if (lightboxIndex.value > 0) lightboxIndex.value--
}

const lightboxNext = () => {
  if (lightboxIndex.value < props.images.length - 1) lightboxIndex.value++
}

// Lightbox touch swipe
const lbTouchStartX = ref(0)
const lbSwiping = ref(false)
const lbPinching = ref(false)

const onLightboxTouchStart = (e) => {
  if (e.touches.length >= 2) { lbPinching.value = true; return }
  lbTouchStartX.value = e.touches[0].clientX
  lbSwiping.value = false
  lbPinching.value = false
}

const onLightboxTouchMove = (e) => {
  if (e.touches.length >= 2) { lbPinching.value = true; return }
  if (lbPinching.value || !lbTouchStartX.value) return
  const diffX = Math.abs(e.touches[0].clientX - lbTouchStartX.value)
  if (diffX > 10) {
    lbSwiping.value = true
  }
}

const onLightboxTouchEnd = (e) => {
  if (lbPinching.value || !lbSwiping.value) {
    lbPinching.value = false
    lbTouchStartX.value = 0
    lbSwiping.value = false
    return
  }

  const touchEndX = e.changedTouches[0].clientX
  const diff = lbTouchStartX.value - touchEndX
  const threshold = 50

  if (diff > threshold) {
    lightboxNext()
  } else if (diff < -threshold) {
    lightboxPrev()
  }

  lbTouchStartX.value = 0
  lbSwiping.value = false
}

// Keyboard navigation
const onKeydown = (e) => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') lightboxPrev()
  if (e.key === 'ArrowRight') lightboxNext()
}

watch(lightboxOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', onKeydown)
  } else {
    window.removeEventListener('keydown', onKeydown)
  }
})

// Sync lightbox index back to gallery when closing
watch(lightboxOpen, (open) => {
  if (!open) {
    currentIndex.value = lightboxIndex.value
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
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
  background: var(--c-ink-900);
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
  background: var(--header-blur-bg);
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
  color: var(--text-primary);
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
  background: var(--bg-elevated);
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

/* ===== Lightbox ===== */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-counter {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 14px;
  border-radius: 20px;
}

.lightbox-image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  border-radius: 4px;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-prev {
  left: 16px;
}

.lightbox-next {
  right: 16px;
}

.lightbox-indicators {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
}

.lightbox-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.lightbox-dot:hover {
  background: rgba(255, 255, 255, 0.7);
}

.lightbox-dot.active {
  width: 20px;
  border-radius: 4px;
  background: var(--bg-elevated);
}

/* Lightbox Transition */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.25s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* Mobile: hide nav arrows, rely on swipe */
@media (max-width: 640px) {
  .lightbox-nav {
    display: none;
  }

  .lightbox-image-wrapper {
    padding: 50px 0;
  }

  .lightbox-close {
    top: 12px;
    right: 12px;
  }
}
</style>
