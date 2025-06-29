<script setup>
const emit = defineEmits(['add-category'])

const handleAddClick = () => {
  emit('add-category')
}
</script>

<template>
  <div class="header-section">
    <div class="header-content">
      <div class="header-info">
        <h1>카테고리 관리</h1>
        <p>한입만 앱의 카테고리를 관리합니다</p>
      </div>
      <button @click="handleAddClick" class="add-button">
        <span class="icon">➕</span>
        <span class="button-text">카테고리 추가</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.header-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 16px;
  margin-bottom: 16px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-info h1 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.header-info p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.add-button {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.add-button:hover {
  background: #059669;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .header-section {
    padding: 12px;
    margin-bottom: 12px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-info h1 {
    font-size: 18px;
  }

  .header-info p {
    font-size: 13px;
  }

  .add-button {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }

  .button-text {
    display: block;
  }
}

@media (max-width: 480px) {
  .button-text {
    display: none;
  }

  .add-button {
    width: auto;
    padding: 10px;
  }
}

/* 태블릿 */
@media (min-width: 768px) {
  .header-section {
    padding: 24px;
    margin-bottom: 24px;
  }

  .header-info h1 {
    font-size: 24px;
  }

  .add-button {
    padding: 12px 16px;
  }
}
</style>