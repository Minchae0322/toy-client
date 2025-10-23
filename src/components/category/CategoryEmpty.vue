<!-- CategoryEmpty.vue -->
<script setup>
const emit = defineEmits(['add-category'])

const handleAddClick = () => {
  emit('add-category')
}
</script>

<template>
  <div class="empty-state">
    <div class="empty-illustration">
      <div class="illustration-circle circle-1"></div>
      <div class="illustration-circle circle-2"></div>
      <div class="illustration-icon">📂</div>
    </div>

    <div class="empty-content">
      <h3 class="empty-title">아직 카테고리가 없습니다</h3>
      <p class="empty-description">
        첫 번째 카테고리를 만들어 컨텐츠를 체계적으로 관리하세요
      </p>
    </div>

    <button @click="handleAddClick" class="empty-cta">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <span>카테고리 만들기</span>
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  background: white;
  border-radius: 20px;
  padding: 80px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.empty-illustration {
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-circle {
  position: absolute;
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

.circle-1 {
  width: 160px;
  height: 160px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  animation-delay: 0s;
}

.circle-2 {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  animation-delay: 0.5s;
}

.illustration-icon {
  font-size: 72px;
  z-index: 1;
  filter: grayscale(0.3);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.empty-content {
  max-width: 400px;
  margin-bottom: 32px;
}

.empty-title {
  font-size: 24px;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 15px;
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

.empty-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.empty-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
}

.empty-cta:active {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .empty-state {
    padding: 60px 24px;
  }

  .empty-illustration {
    width: 120px;
    height: 120px;
    margin-bottom: 24px;
  }

  .circle-1 {
    width: 120px;
    height: 120px;
  }

  .circle-2 {
    width: 90px;
    height: 90px;
  }

  .illustration-icon {
    font-size: 56px;
  }

  .empty-title {
    font-size: 20px;
  }

  .empty-description {
    font-size: 14px;
  }

  .empty-cta {
    width: 100%;
    justify-content: center;
    padding: 16px 24px;
  }
}
</style>