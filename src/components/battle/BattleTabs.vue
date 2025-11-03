<template>
  <div class="tabs-container">
    <div class="tabs-wrapper">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{ 'is-active': activeTab === tab.id }"
          @click="handleTabClick(tab.id)"
      >
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="tab-count">{{ formatCount(tab.count) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    default: () => []
  },
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:activeTab'])

const handleTabClick = (tabId) => {
  emit('update:activeTab', tabId)
}

const formatCount = (count) => {
  if (count >= 10000) {
    return Math.floor(count / 1000) / 10 + '만'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count
}
</script>

<style scoped>
.tabs-container {
  background: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
  position: sticky;
  top: 73px;
  z-index: 20;
}

.tabs-wrapper {
  display: flex;
  padding: 0 40px;
  gap: 8px;
}

.tab-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  background: transparent;
  border: none;
  color: #737373;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: color 150ms ease;
  font-family: inherit;
  white-space: nowrap;
}

.tab-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #171717;
  transform: scaleX(0);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button:hover {
  color: #171717;
}

.tab-button.is-active {
  color: #171717;
}

.tab-button.is-active::after {
  transform: scaleX(1);
}

.tab-label {
  line-height: 1;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  background: #F5F5F5;
  color: #525252;
  font-size: 12px;
  font-weight: 700;
  border-radius: 10px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.tab-button.is-active .tab-count {
  background: #171717;
  color: #FFFFFF;
}

@media (max-width: 768px) {
  .tabs-wrapper {
    padding: 0 16px;
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .tabs-wrapper::-webkit-scrollbar {
    display: none;
  }

  .tab-button {
    padding: 14px 16px;
    font-size: 14px;
  }

  .tab-count {
    min-width: 20px;
    height: 18px;
    font-size: 11px;
  }
}

@media (max-width: 1024px) {
  .tabs-container {
    top: 0;
  }
}
</style>