<!-- LoadingState.vue -->
<template>
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>상품을 불러오는 중입니다</p>
  </div>
</template>

<style scoped>
.loading-container {
  padding: 80px 24px;
  text-align: center;
  background: white;
  border: 1px solid #F3F4F6;
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F3F4F6;
  border-top: 3px solid #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  font-size: 15px;
  color: #6B7280;
  font-weight: 500;
}
</style>
