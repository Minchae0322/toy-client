<template>
  <div class="image-gallery">
    <!-- 메인 이미지 영역 -->
    <div class="main-image-container">
      <div class="main-image-wrapper">
        <img
            :src="currentImage"
            :alt="food.name"
            class="main-image"
            @error="handleImageError"
            @load="handleImageLoad"
        />

        <!-- 이미지 로딩 상태 -->
        <div v-if="imageLoading" class="image-loading">
          <div class="loading-spinner"></div>
        </div>

        <!-- 이미지 에러 상태 -->
        <div v-if="imageError" class="image-error">
          <div class="error-icon">📷</div>
          <p>이미지를 불러올 수 없습니다</p>
        </div>

        <!-- 이미지 네비게이션 버튼 (이미지가 여러개일 때만) -->
        <div v-if="images.length > 1" class="nav-buttons">
          <button
              class="nav-btn prev-btn"
              @click="previousImage"
              :disabled="currentIndex === 0"
          >
            ❮
          </button>
          <button
              class="nav-btn next-btn"
              @click="nextImage"
              :disabled="currentIndex === images.length - 1"
          >
            ❯
          </button>
        </div>

        <!-- 이미지 카운터 -->
        <div v-if="images.length > 1" class="image-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- 확대보기 버튼 -->
        <button class="zoom-btn" @click="openZoomModal">
          🔍
        </button>
      </div>
    </div>

    <!-- 썸네일 리스트 (이미지가 여러개일 때만) -->
    <div v-if="images.length > 1" class="thumbnail-list">
      <div
          v-for="(image, index) in images"
          :key="index"
          class="thumbnail-item"
          :class="{ 'active': index === currentIndex }"
          @click="setCurrentImage(index)"
      >
        <img
            :src="image"
            :alt="`${food.name} 이미지 ${index + 1}`"
            class="thumbnail-image"
            @error="handleThumbnailError"
        />
      </div>
    </div>

    <!-- 확대보기 모달 -->
    <div v-if="showZoomModal" class="zoom-modal" @click="closeZoomModal">
      <div class="zoom-modal-content" @click.stop>
        <button class="zoom-close-btn" @click="closeZoomModal">✕</button>

        <div class="zoom-image-container">
          <img
              :src="currentImage"
              :alt="food.name"
              class="zoom-image"
              @wheel="handleZoom"
              :style="zoomStyle"
              @mousedown="startDrag"
              @mousemove="drag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
          />
        </div>

        <!-- 확대 모달에서의 이미지 네비게이션 -->
        <div v-if="images.length > 1" class="zoom-nav-buttons">
          <button
              class="zoom-nav-btn prev"
              @click="previousImage"
              :disabled="currentIndex === 0"
          >
            ❮
          </button>
          <button
              class="zoom-nav-btn next"
              @click="nextImage"
              :disabled="currentIndex === images.length - 1"
          >
            ❯
          </button>
        </div>

        <!-- 확대 컨트롤 -->
        <div class="zoom-controls">
          <button @click="zoomIn" class="zoom-control-btn">+</button>
          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
          <button @click="zoomOut" class="zoom-control-btn">-</button>
          <button @click="resetZoom" class="zoom-control-btn">초기화</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';

// Props 정의
const props = defineProps({
  food: {
    type: Object,
    required: true
  }
});

// Emit 정의
const emit = defineEmits(['image-error']);

// 반응형 데이터
const currentIndex = ref(0);
const imageLoading = ref(false);
const imageError = ref(false);
const showZoomModal = ref(false);

// 확대 기능 관련
const zoomLevel = ref(1);
const zoomX = ref(0);
const zoomY = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);

// 이미지 배열 계산
const images = computed(() => {
  const imageArray = [];

  // 메인 이미지
  if (props.food.imageUrl) {
    imageArray.push(props.food.imageUrl);
  }

  // 첨부 이미지들
  if (props.food.attachments && props.food.attachments.length > 0) {
    props.food.attachments.forEach(attachment => {
      if (attachment.fileUrl && !imageArray.includes(attachment.fileUrl)) {
        imageArray.push(attachment.fileUrl);
      }
    });
  }

  // 기본 이미지 (이미지가 하나도 없을 때)
  if (imageArray.length === 0) {
    imageArray.push('/placeholder-food.jpg');
  }

  return imageArray;
});

// 현재 이미지
const currentImage = computed(() => {
  return images.value[currentIndex.value] || '/placeholder-food.jpg';
});

// 확대 스타일
const zoomStyle = computed(() => {
  return {
    transform: `scale(${zoomLevel.value}) translate(${zoomX.value}px, ${zoomY.value}px)`,
    cursor: isDragging.value ? 'grabbing' : 'grab'
  };
});

// 이미지 네비게이션
const nextImage = () => {
  if (currentIndex.value < images.value.length - 1) {
    currentIndex.value++;
  }
};

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const setCurrentImage = (index) => {
  currentIndex.value = index;
  imageError.value = false;
};

// 이미지 이벤트 핸들러
const handleImageLoad = () => {
  imageLoading.value = false;
  imageError.value = false;
};

const handleImageError = (event) => {
  imageLoading.value = false;
  imageError.value = true;
  emit('image-error', event);

  // 기본 이미지로 대체
  event.target.src = '/placeholder-food.jpg';
};

const handleThumbnailError = (event) => {
  event.target.src = '/placeholder-food.jpg';
};

// 확대보기 모달
const openZoomModal = () => {
  showZoomModal.value = true;
  resetZoom();
  document.body.style.overflow = 'hidden';
};

const closeZoomModal = () => {
  showZoomModal.value = false;
  document.body.style.overflow = '';
  resetZoom();
};

// 확대/축소 기능
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.25;
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.25;
  }
};

const resetZoom = () => {
  zoomLevel.value = 1;
  zoomX.value = 0;
  zoomY.value = 0;
};

const handleZoom = (event) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  const newZoom = Math.max(0.5, Math.min(3, zoomLevel.value + delta));
  zoomLevel.value = newZoom;
};

// 드래그 기능
const startDrag = (event) => {
  if (zoomLevel.value > 1) {
    isDragging.value = true;
    dragStartX.value = event.clientX - zoomX.value;
    dragStartY.value = event.clientY - zoomY.value;
  }
};

const drag = (event) => {
  if (isDragging.value && zoomLevel.value > 1) {
    zoomX.value = event.clientX - dragStartX.value;
    zoomY.value = event.clientY - dragStartY.value;
  }
};

const endDrag = () => {
  isDragging.value = false;
};

// 키보드 이벤트 (확대보기 모달에서)
const handleKeydown = (event) => {
  if (!showZoomModal.value) return;

  switch (event.key) {
    case 'Escape':
      closeZoomModal();
      break;
    case 'ArrowLeft':
      previousImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
    case '0':
      resetZoom();
      break;
  }
};

// 이미지 변경 시 에러 상태 초기화
watch(currentIndex, () => {
  imageError.value = false;
  imageLoading.value = true;
});

// 마운트 시 이벤트 리스너 등록
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  imageLoading.value = true;
});

// 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.image-gallery {
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 메인 이미지 컨테이너 */
.main-image-container {
  position: relative;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: #f7fafc;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

/* 로딩 상태 */
.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(247, 250, 252, 0.9);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #1DCD9F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 에러 상태 */
.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  color: #718096;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.image-error p {
  font-size: 14px;
  margin: 0;
}

/* 네비게이션 버튼 */
.nav-buttons {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 12px;
  pointer-events: none;
}

.nav-btn {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 이미지 카운터 */
.image-counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 확대보기 버튼 */
.zoom-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-btn:hover {
  background: white;
  transform: scale(1.1);
}

/* 썸네일 리스트 */
.thumbnail-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.thumbnail-list::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-list::-webkit-scrollbar-track {
  background: transparent;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.thumbnail-item {
  flex: 0 0 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.thumbnail-item.active {
  border-color: #1DCD9F;
}

.thumbnail-item:hover {
  transform: scale(1.05);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 확대보기 모달 */
.zoom-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.zoom-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.zoom-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  z-index: 1;
  transition: background 0.2s;
}

.zoom-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.zoom-image-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.zoom-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.1s;
  user-select: none;
}

/* 확대 모달 네비게이션 */
.zoom-nav-buttons {
  position: absolute;
  top: 50%;
  left: -60px;
  right: -60px;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.zoom-nav-btn {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.zoom-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 확대 컨트롤 */
.zoom-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 24px;
}

.zoom-control-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.zoom-level {
  color: white;
  font-size: 14px;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .image-gallery {
    flex: 1;
    max-width: none;
  }

  .main-image-container {
    height: 250px;
  }

  .thumbnail-list {
    padding: 8px 0;
  }

  .thumbnail-item {
    flex: 0 0 50px;
    height: 50px;
  }

  .zoom-nav-buttons {
    left: -40px;
    right: -40px;
  }

  .zoom-nav-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .zoom-controls {
    margin-top: 16px;
    padding: 8px;
  }

  .zoom-control-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .main-image-container {
    height: 200px;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .zoom-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .image-counter {
    font-size: 10px;
    padding: 2px 6px;
  }
}
</style>