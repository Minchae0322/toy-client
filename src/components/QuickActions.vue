<!-- QuickActions.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <h2 class="text-lg font-bold text-gray-900 mb-4">⚡ 빠른 액션</h2>
    <div class="grid grid-cols-2 gap-3">
      <button
          v-for="action in actions"
          :key="action.id"
          class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center mb-2', action.bgColor]">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.icon"/>
          </svg>
        </div>
        <span class="text-sm font-medium text-gray-900">{{ action.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickActions',
  data() {
    return {
      actions: [
        {
          id: 1,
          name: '트렌드 검색',
          icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
          bgColor: 'bg-blue-500'
        },
        {
          id: 2,
          name: '밈 업로드',
          icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
          bgColor: 'bg-green-500'
        },
        {
          id: 3,
          name: '맛집 추천',
          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
          bgColor: 'bg-red-500'
        },
        {
          id: 4,
          name: '이벤트 참여',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          bgColor: 'bg-purple-500'
        }
      ]
    }
  }
}
</script>
