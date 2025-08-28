<template>
  <header class="detail-header">
    <button @click="$emit('go-back')" class="header-btn">
      <ChevronLeft :size="24" />
    </button>
    <div class="header-actions">
      <button @click="$emit('share')" class="header-btn">
        <Share2 :size="20" />
      </button>
      <button @click="$emit('toggle-like')" class="header-btn">
        <Heart :size="20" :fill="isLiked ? '#FF6B6B' : 'none'" :stroke="isLiked ? '#FF6B6B' : 'currentColor'" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { ChevronLeft, Share2, Heart } from 'lucide-vue-next';

defineProps({
  isLiked: {
    type: Boolean,
    default: false
  }
});

defineEmits(['go-back', 'share', 'toggle-like']);
</script>

<style scoped>
.detail-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  color: #191F28;
}

.header-btn:hover {
  background: #F2F3F7;
}

.header-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .detail-header {
    padding: 8px 12px;
  }
}
</style>