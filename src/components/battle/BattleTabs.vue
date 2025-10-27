<template>
  <div class="tabs-container">
    <div class="tabs">
      <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ active: activeTab === tab.id }"
          @click="handleTabClick(tab.id)"
      >
        {{ tab.label }}
        <span class="tab-count">{{ tab.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:activeTab']);

const handleTabClick = (tabId) => {
  emit('update:activeTab', tabId);
};
</script>

<style scoped>
.tabs-container {
  background: #FFFFFF;
  border-bottom: 1px solid #F0F0F3;
  padding: 0 40px;
}

.tabs {
  display: flex;
  gap: 40px;
}

.tab {
  padding: 20px 0;
  font-size: 14px;
  font-weight: 600;
  color: #9CA3AF;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.tab:hover {
  color: #6B7280;
}

.tab.active {
  color: #1A1A1A;
  border-bottom-color: #1A1A1A;
}

.tab-count {
  margin-left: 6px;
  font-weight: 400;
  color: #9CA3AF;
}

@media (max-width: 768px) {
  .tabs-container {
    padding: 0 16px;
  }

  .tabs {
    gap: 24px;
  }

  .tab {
    padding: 16px 0;
    font-size: 13px;
  }
}
</style>