<template>
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>로딩 중...</p>
  </div>
</template>

<style scoped>
.loading-container {
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-container p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .loading-container {
    padding: 32px 16px;
  }

  .loading-spinner {
    width: 28px;
    height: 28px;
    border-width: 2px;
  }

  .loading-container p {
    font-size: 13px;
  }
}

/* 태블릿 */
@media (min-width: 768px) {
  .loading-container {
    padding: 56px 24px;
  }
}
</style>