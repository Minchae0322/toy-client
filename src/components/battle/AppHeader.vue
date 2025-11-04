<template>
  <header class="app-header">
    <div class="header-container">
      <h1 class="header-title">{{ title }}</h1>
      <button
          v-if="showCreateButton"
          class="create-button"
          @click="$emit('create')"
      >
        <svg class="button-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M10 4v12M4 10h12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
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
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid #EAEAEA;
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  max-width: 100%;
}

.header-title {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
  color: #0A0A0A;
  letter-spacing: -0.022em;
  line-height: 1.1;
}

.create-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #0A0A0A;
  color: #FFFFFF;
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 590;
  letter-spacing: -0.006em;
  cursor: pointer;
  transition: all 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: inherit;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.create-button:hover {
  background: #1A1A1A;
  transform: translateY(-0.5px) scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.create-button:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.create-button:focus-visible {
  outline: 2px solid #007AFF;
  outline-offset: 2px;
}

.button-icon {
  width: 15px;
  height: 15px;
  stroke-width: 2;
}

.button-text {
  line-height: 1;
}

@media (max-width: 768px) {
  .header-container {
    padding: 14px 20px;
  }

  .header-title {
    font-size: 16px;
  }

  .create-button {
    padding: 7px 12px;
    font-size: 12.5px;
  }

  .button-icon {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 12px 16px;
  }

  .button-text {
    display: none;
  }

  .create-button {
    padding: 8px;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    justify-content: center;
  }
}
</style>