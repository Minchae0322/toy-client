<!-- MemeGeneratorPromo.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <div class="flex items-center space-x-3">
      <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-gray-900">AI 밈 생성기</h3>
        <p class="text-sm text-gray-600">몇 초 만에 나만의 밈을 만들어보세요</p>
      </div>
      <button class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
        만들기
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemeGeneratorPromo'
}
</script>
