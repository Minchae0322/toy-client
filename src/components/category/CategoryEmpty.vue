<script setup>
const emit = defineEmits(['add-category'])

const handleAddClick = () => {
  emit('add-category')
}
</script>

<template>
  <div class="empty-container">
    <div class="empty-icon">📂</div>
    <h3>등록된 카테고리가 없습니다</h3>
    <p>새로운 카테고리를 추가해보세요.</p>
    <button @click="handleAddClick" class="empty-add-button">
      <span class="icon">➕</span>
      첫 번째 카테고리 추가하기
    </button>
  </div>
</template>

<style scoped>
.empty-container {
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-container h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.empty-container p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.empty-add-button {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.empty-add-button:hover {
  background: #059669;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .empty-container {
    padding: 32px 16px;
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  .empty-container h3 {
    font-size: 14px;
  }

  .empty-container p {
    font-size: 13px;
    margin-bottom: 20px;
  }

  .empty-add-button {
    width: 100%;
    justify-content: center;
  }
}

/* 태블릿 */
@media (min-width: 768px) {
  .empty-container {
    padding: 56px 24px;
  }

  .empty-icon {
    font-size: 52px;
  }

  .empty-container h3 {
    font-size: 18px;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .empty-container {
    padding: 64px 24px;
  }
}
</style>