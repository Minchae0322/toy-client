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
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid #EAEAEA;
  position: sticky;
  top: 49px;
  z-index: 20;
}

.tabs-wrapper {
  display: flex;
  padding: 0 28px;
  gap: 2px;
}

.tab-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #6B6B6B;
  font-size: 13.5px;
  font-weight: 580;
  letter-spacing: -0.008em;
  cursor: pointer;
  transition: color 140ms ease;
  font-family: inherit;
  white-space: nowrap;
}

.tab-button::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #0A0A0A;
  transform: scaleX(0);
  transition: transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tab-button:hover {
  color: var(--text-primary);
}

.tab-button.is-active {
  color: #0A0A0A;
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
  min-width: 19px;
  height: 18px;
  padding: 0 5px;
  background: #F2F2F2;
  color: #6B6B6B;
  font-size: 11px;
  font-weight: 650;
  border-radius: 9px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  transition: all 140ms ease;
}

.tab-button.is-active .tab-count {
  background: #0A0A0A;
  color: #FFFFFF;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .tabs-wrapper {
    padding: 0 20px;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .tabs-wrapper::-webkit-scrollbar {
    display: none;
  }

  .tab-button {
    padding: 11px 14px;
    font-size: 13px;
  }

  .tab-count {
    min-width: 18px;
    height: 17px;
    font-size: 10.5px;
  }
}

@media (max-width: 1024px) {
  .tabs-container {
    top: 0;
  }
}
</style>