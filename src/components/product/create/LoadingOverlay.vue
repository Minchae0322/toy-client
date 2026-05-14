<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>제품을 등록하고 있습니다</p>
      <span class="loading-hint">잠시만 기다려주세요</span>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--header-blur-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-default);
  border-top: 4px solid var(--c-success);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-content p {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.loading-hint {
  font-size: 14px;
  color: var(--c-text-400);
  font-weight: 500;
}
</style>