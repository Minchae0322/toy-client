<!-- MBTIRecommendationBanner.vue -->
<template>
  <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 m-4 rounded-xl">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold">ENFP님을 위한 추천! ✨</h2>
        <p class="text-sm opacity-90">오늘은 새로운 밈 만들기 어때요?</p>
      </div>
      <Sparkles class="w-8 h-8" />
    </div>
  </div>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next';
</script>