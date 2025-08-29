<template>
  <div class="bottom-bar">
    <button @click="$emit('toggle-favorite')" class="action-icon-btn" :class="{ active: isFavorited }">
      <Heart :size="24" :fill="isFavorited ? '#FF6B6B' : 'none'" :stroke="isFavorited ? '#FF6B6B' : '#8B95A1'" />
    </button>

    <div class="action-price">
      <span class="price-label">가격</span>
      <span class="price-value">{{ formatPrice(food.price) }}</span>
    </div>

    <button @click="$emit('start-chat')" class="chat-btn" :disabled="chatLoading">
      <span v-if="!chatLoading">채팅으로 거래하기</span>
      <span v-else>연결 중...</span>
    </button>
  </div>
</template>

<script setup>
import { Heart } from 'lucide-vue-next';

defineProps({
  food: {
    type: Object,
    required: true
  },
  isFavorited: {
    type: Boolean,
    default: false
  },
  chatLoading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-favorite', 'start-chat']);

const formatPrice = (price) => {
  if (!price || price === 0) return '무료나눔';
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};
</script>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #E5E8EB;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.action-icon-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #E5E8EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon-btn:hover {
  background: #F8F9FA;
}

.action-icon-btn.active {
  background: #FFF5F5;
  border-color: #FF6B6B;
}

.action-price {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-label {
  font-size: 12px;
  color: #8B95A1;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
  color: #191F28;
}

.chat-btn {
  flex: 2;
  padding: 14px 24px;
  background: #FF6B6B;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-btn:hover:not(:disabled) {
  background: #FF5252;
}

.chat-btn:disabled {
  background: #B0B8C1;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .chat-btn {
    font-size: 15px;
  }
}
</style>