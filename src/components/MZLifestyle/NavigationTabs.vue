<!-- NavigationTabs.vue -->
<template>
  <div class="bg-white border-b">
    <div class="flex space-x-8 px-4">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="$emit('update-tab', tab.id)"
          :class="{
          'border-purple-500 text-purple-600': activeTab === tab.id,
          'border-transparent text-gray-500 hover:text-gray-700': activeTab !== tab.id
        }"
          class="py-3 px-2 border-b-2 font-medium text-sm"
      >
        <span class="mr-2">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: String
});

defineEmits(['update-tab']);

const tabs = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'memes', label: '밈/짤', icon: '😂' },
  { id: 'foods', label: '먹거리', icon: '🍔' },
  { id: 'create', label: '만들기', icon: '✨' }
];
</script>