<template>
  <nav class="tabs">
    <button
        v-for="menu in menuItems"
        :key="menu.value"
        :class="['tab', { active: modelValue === menu.value }]"
        @click="handleTabClick(menu.value)"
    >
      {{ menu.label }}
    </button>
  </nav>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  menuItems: {
    type: Array,
    default: () => [
      { label: '내 게시물', value: 'feeds' },
      { label: '좋아요한 글', value: 'liked' },
      { label: '저장한 글', value: 'saved' }
    ]
  }
});

const emit = defineEmits(['update:modelValue']);

const handleTabClick = (value) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
.tabs {
  display: flex;
  justify-content: center;
  gap: 0;
  background: white;
  border-bottom: 1px solid #DBDBDB;
}

.tab {
  flex: 1;
  max-width: 200px;
  padding: 14px 0;
  background: transparent;
  border: none;
  border-top: 1px solid transparent;
  font-size: 13px;
  font-weight: 600;
  color: #737373;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #262626;
}

.tab.active {
  color: #262626;
  border-top-color: #262626;
}

@media (hover: none) {
  .tab {
    min-height: 44px;
  }
}
</style>