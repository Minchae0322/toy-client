<!-- BottomNavigation.vue -->
<template>
  <nav class="bg-white border-t sticky bottom-0">
    <div class="flex justify-around py-2">
      <button
          v-for="(item, index) in navItems"
          :key="index"
          class="flex flex-col items-center py-2 px-3"
      >
        <span class="text-xl mb-1">{{ item.icon }}</span>
        <span class="text-xs text-gray-600">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
const navItems = [
  { icon: '🏠', label: '홈' },
  { icon: '😂', label: '밈/짤' },
  { icon: '✨', label: '만들기' },
  { icon: '🍔', label: '먹거리' },
  { icon: '👤', label: '마이' }
];
</script>