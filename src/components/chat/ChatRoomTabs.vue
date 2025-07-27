<template>
  <div class="tabs-container">
    <div class="tabs">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
          @click="$emit('update-tab', tab.id)"
      >
        <span>{{ tab.icon }}</span>
        <span>{{ tab.name }}</span>
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps(['activeTab'])
defineEmits(['update-tab'])

const tabs = [
  { id: 'all', name: '전체', icon: '💬', count: 12 },
  { id: 'unread', name: '읽지 않음', icon: '🔴', count: 3 },
  { id: 'group', name: '그룹', icon: '👥', count: 8 },
  { id: 'dm', name: 'DM', icon: '💌', count: 4 }
]
</script>

<style scoped>
.tabs-container {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.tabs {
  display: flex;
  gap: 8px;
  min-width: max-content;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 20px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab.active {
  background: #667eea;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.tab:hover:not(.active) {
  background: #e2e8f0;
}

.tab-count {
  background: rgba(0,0,0,0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.tab.active .tab-count {
  background: rgba(255,255,255,0.2);
}

@media (max-width: 768px) {
  .tabs-container {
    padding: 12px 16px;
  }
}
</style>