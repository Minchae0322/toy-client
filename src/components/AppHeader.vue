<!-- AppHeader.vue -->
<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span class="text-white font-bold text-sm">MZ</span>
        </div>
        <h1 class="text-xl font-bold text-gray-900">MZ Life</h1>
      </div>
      <div class="flex items-center space-x-3">
        <button class="p-2 rounded-full hover:bg-gray-100">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 19h16"/>
          </svg>
        </button>
        <button class="p-2 rounded-full hover:bg-gray-100">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader'
}
</script>