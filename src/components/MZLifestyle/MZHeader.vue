<!-- MZHeader.vue -->
<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center space-x-3">
        <Menu class="w-6 h-6 text-gray-600" />
        <h1 class="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          MZ라이프
        </h1>
      </div>
      <div class="flex items-center space-x-3">
        <Search class="w-6 h-6 text-gray-600" />
        <Bell class="w-6 h-6 text-gray-600" />
        <div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <User class="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Menu, Search, Bell, User } from 'lucide-vue-next';
</script>