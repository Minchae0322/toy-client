<template>
  <div class="auth-loading">
    <div class="loading-spinner"></div>
    <p>인증 상태를 확인하고 있습니다</p>
  </div>
</template>

<style scoped>
.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  background: white;
  border-radius: 16px;
  margin: 24px 0;
  border: 1px solid #F3F4F6;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #F3F4F6;
  border-top: 4px solid #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-loading p {
  font-size: 15px;
  color: #6B7280;
  font-weight: 500;
  letter-spacing: -0.01em;
}
</style>