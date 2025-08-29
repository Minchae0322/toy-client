<template>
  <div class="image-section">
    <div class="image-wrapper">
      <img
          v-if="food.imageUrl"
          :src="food.imageUrl"
          :alt="food.name"
          @error="$emit('image-error', $event)"
      />
      <div v-else-if="food.attachments && food.attachments.length > 0" class="multiple-images">
        <img
            :src="food.attachments[0].fileUrl"
            :alt="food.name"
            @error="$emit('image-error', $event)"
        />
      </div>
      <div v-else class="image-placeholder">
        <Camera :size="48" />
      </div>

      <!-- 상태 뱃지 -->
      <div v-if="food.productStatus !== 'FOR_SALE'" class="status-badge sold-out">
        {{ getProductStatusText(food.productStatus) }}
      </div>

      <!-- 이미지 인디케이터 -->
      <div v-if="food.attachments && food.attachments.length > 1" class="image-indicator">
        <span>1 / {{ food.attachments.length }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Camera } from 'lucide-vue-next';

defineProps({
  food: {
    type: Object,
    required: true
  }
});

defineEmits(['image-error']);

// 상품 상태 텍스트 반환
const getProductStatusText = (status) => {
  const statusMap = {
    'FOR_SALE': '판매중',
    'SOLD_OUT': '품절',
    'RESERVED': '예약중',
    'DISCONTINUED': '판매중단'
  };
  return statusMap[status] || '알 수 없음';
};
</script>

<style scoped>
.image-section {
  position: relative;
  background: #000;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 375px;
  background: #F8F9FA;
  overflow: hidden;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8F9FA;
  color: #B0B8C1;
}

.multiple-images img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.status-badge.sold-out {
  background: rgba(0, 0, 0, 0.8);
}

.image-indicator {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .image-wrapper {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .image-wrapper {
    height: 250px;
  }
}
</style>