<template>
  <div class="image-gallery">
    <div class="image-container" @dblclick="handleDoubleTap" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <img
          :src="getCurrentImage"
          :alt="productName"
          class="main-image"
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

      <!-- Image Indicators -->
      <div v-if="images.length > 1" class="image-indicators">
        <span
            v-for="(img, idx) in images"
            :key="idx"
            :class="['indicator', { active: idx === currentIndex }]"
            @click="currentIndex = idx"
        ></span>
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

const getCurrentImage = computed(() => {
  if (props.images.length === 0) return ''
  return props.images[currentIndex.value]?.fileUrl || ''
})

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

const handleDoubleTap = () => {
  emit('like')
  showLikeAnimation.value = true
  setTimeout(() => {
    showLikeAnimation.value = false
  }, 600)
}
</script>

<style scoped>
.image-gallery {
  background: #FAFAFA;
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  position: relative;
  width: 100%;
  max-height: 600px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
}

.image-container:hover {
  cursor: pointer;
}

.main-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  display: block;
  user-select: none;
}

/* PC 최적화: 고정 높이 + 중앙 정렬 */
@media (min-width: 1024px) {
  .image-gallery {
    flex: 1;
    min-width: 0;
    background: #FAFAFA;
  }

  .image-container {
    height: 100%;
    max-height: calc(100vh - 140px);
    min-height: 500px;
  }

  .main-image {
    max-height: calc(100vh - 140px);
    width: auto;
    max-width: 100%;
    object-fit: contain;
  }
}

/* 초대형 화면 (1440px 이상) */
@media (min-width: 1440px) {
  .image-container {
    max-height: 700px;
  }

  .main-image {
    max-height: 700px;
  }
}

.like-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}

.heart-icon {
  width: 100px;
  height: 100px;
  color: #FFFFFF;
  filter: drop-shadow(0 4px 24px rgba(0, 0, 0, 0.3));
}

/* Like Scale Animation */
.like-scale-enter-active {
  animation: likeScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes likeScale {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.nav-btn:hover {
  background: #FFFFFF;
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.nav-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.nav-btn.prev {
  left: 20px;
}

.nav-btn.next {
  right: 20px;
}

.nav-icon {
  width: 22px;
  height: 22px;
  color: var(--primary);
}

.image-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  border-radius: 24px;
}

.indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.15);
}

.indicator.active {
  width: 22px;
  border-radius: 4px;
  background: #FFFFFF;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>