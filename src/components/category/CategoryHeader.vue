<script setup>
defineEmits(['add-category'])
</script>

<template>
  <div class="category-header">
    <div class="header-content">
      <div class="header-left">
        <div class="icon-wrapper">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor" opacity="0.8"/>
            <rect x="18" y="4" width="10" height="10" rx="2" fill="currentColor" opacity="0.6"/>
            <rect x="4" y="18" width="10" height="10" rx="2" fill="currentColor" opacity="0.4"/>
            <rect x="18" y="18" width="10" height="10" rx="2" fill="currentColor" opacity="0.2"/>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="header-title">카테고리 관리</h1>
          <p class="header-subtitle">체계적인 컨텐츠 분류 시스템</p>
        </div>
      </div>
      <button @click="$emit('add-category')" class="add-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>새 카테고리</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-header {
  background: white;
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.add-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-button:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
}

.add-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .category-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    margin-bottom: 16px;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .header-title {
    font-size: 20px;
  }

  .header-subtitle {
    font-size: 13px;
  }

  .add-button {
    width: 100%;
    justify-content: center;
    padding: 14px;
  }
}
</style>