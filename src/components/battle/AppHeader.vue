<template>
  <header class="main-header">
    <div class="header-content">
      <h1 class="page-title">{{ title }}</h1>
      <button
          v-if="showCreateButton"
          class="create-battle-btn"
          @click="$emit('create')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        {{ createButtonText }}
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '월간 배틀'
  },
  showCreateButton: {
    type: Boolean,
    default: false
  },
  createButtonText: {
    type: String,
    default: '배틀 만들기'
  }
});

defineEmits(['create']);
</script>

<style scoped>
.main-header {
  background: #FFFFFF;
  padding: 28px 40px;
  border-bottom: 1px solid #F0F0F3;
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1A1A1A;
  letter-spacing: -0.02em;
}

.create-battle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.create-battle-btn:hover {
  background: #000000;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .main-header {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .create-battle-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>