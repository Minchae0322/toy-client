<!-- BottomNavigation.vue -->
<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
    <div class="flex items-center justify-around py-2">
      <button
          v-for="item in navItems"
          :key="item.id"
          :class="[
          'flex flex-col items-center py-2 px-3 rounded-lg transition-colors',
          item.active ? 'text-purple-600' : 'text-gray-600'
        ]"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"/>
        </svg>
        <span class="text-xs">{{ item.name }}</span>
      </button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'BottomNavigation',
  data() {
    return {
      navItems: [
        {
          id: 1,
          name: '홈',
          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
          active: true
        },
        {
          id: 2,
          name: '탐색',
          icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
          active: false
        },
        {
          id: 3,
          name: '만들기',
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
          active: false
        },
        {
          id: 4,
          name: '활동',
          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
          active: false
        },
        {
          id: 5,
          name: '프로필',
          icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
          active: false
        }
      ]
    }
  }
}
</script>