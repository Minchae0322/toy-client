<template>
  <header class="app-header">
    <div class="header-container">
      <h1 class="header-title">{{ title }}</h1>
      <button
          v-if="showCreateButton"
          class="create-button"
          @click="$emit('create')"
      >
        <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
        </svg>
        <span class="button-text">{{ createButtonText }}</span>
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
.app-header {
  background: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  max-width: 100%;
}

.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #171717;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.create-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #171717;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.create-button:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.create-button:active {
  transform: translateY(0);
}

.create-button:focus-visible {
  outline: 2px solid #525252;
  outline-offset: 2px;
}

.button-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

.button-text {
  line-height: 1;
}

@media (max-width: 768px) {
  .header-container {
    padding: 20px 16px;
  }

  .header-title {
    font-size: 20px;
  }

  .create-button {
    padding: 10px 16px;
    font-size: 13px;
  }

  .button-icon {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .button-text {
    display: none;
  }

  .create-button {
    padding: 10px;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    justify-content: center;
  }
}
</style>