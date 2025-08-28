<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h3>일시적인 문제가 발생했어요</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="$emit('retry')" class="btn-retry">
          <span>다시 시도</span>
        </button>
        <button @click="$emit('go-back')" class="btn-back">
          <span>돌아가기</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    required: true
  }
});

defineEmits(['retry', 'go-back']);
</script>

<style scoped>
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #191F28;
  margin-bottom: 8px;
}

.error-content p {
  font-size: 14px;
  color: #8B95A1;
  margin-bottom: 24px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-retry, .btn-back {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry {
  background: #FF6B6B;
  color: white;
}

.btn-retry:hover {
  background: #FF5252;
}

.btn-back {
  background: #F2F3F7;
  color: #4E5968;
}

.btn-back:hover {
  background: #E5E8EB;
}
</style>