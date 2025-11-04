<template>
  <section class="action-section">
    <div class="action-container">
      <div class="action-tabs">
        <div
            v-for="tab in tabs"
            :key="tab.id"
            class="action-tab"
            :class="{ active: activeTab === tab.id }"
            @click="$emit('update:activeTab', tab.id)"
        >
          {{ tab.label }}
        </div>
      </div>
      <div v-if="battle?.status === 'ACTIVE'" class="action-buttons">
        <button class="participate-btn" @click="$emit('participate')">
          제품 등록하기
        </button>
        <button class="vote-btn" @click="$emit('vote')">
          투표하기
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  battle: {
    type: Object,
    default: null
  },
  activeTab: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    required: true
  }
})

defineEmits(['update:activeTab', 'participate', 'vote'])
</script>

<style scoped>
.action-section {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #E8E8E8;
  position: sticky;
  top: 69px;
  z-index: 25;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95);
}

.action-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .action-container {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}

.action-tabs {
  display: flex;
  gap: 32px;
}

@media (max-width: 768px) {
  .action-tabs {
    gap: 16px;
    overflow-x: auto;
  }
}

.action-tab {
  padding: 10px 0;
  font-size: 15px;
  font-weight: 600;
  color: #A3A3A3;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.action-tab.active {
  color: #0A0A0A;
  border-bottom-color: #0A0A0A;
}

.action-tab:hover:not(.active) {
  color: #737373;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .action-buttons {
    width: 100%;
  }

  .action-buttons button {
    flex: 1;
  }
}

.participate-btn, .vote-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.participate-btn {
  background: #0A0A0A;
  color: white;
}

.participate-btn:hover {
  background: #000000;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.vote-btn {
  background: #10B981;
  color: white;
}

.vote-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}
</style>