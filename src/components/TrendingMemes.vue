<!-- TrendingMemes.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-bold text-gray-900">🔥 트렌딩 밈/짤</h2>
      <p class="text-sm text-gray-600 mt-1">지금 핫한 밈들을 확인해보세요</p>
    </div>
    <div class="p-4 space-y-4">
      <div
          v-for="meme in memes"
          :key="meme.id"
          class="bg-gray-50 rounded-lg overflow-hidden"
      >
        <img
            :src="meme.image"
            :alt="meme.title"
            class="w-full h-48 object-cover"
        />
        <div class="p-3">
          <h3 class="font-medium text-gray-900 mb-2">{{ meme.title }}</h3>
          <div class="flex flex-wrap gap-1 mb-3">
            <span
                v-for="tag in meme.tags"
                :key="tag"
                class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                  @click="$emit('like', meme.id)"
                  :class="[
                  'flex items-center space-x-1 text-sm',
                  likedItems[meme.id] ? 'text-red-500' : 'text-gray-600'
                ]"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{{ meme.likes }}</span>
              </button>
              <div class="flex items-center space-x-1 text-sm text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <span>{{ meme.comments }}</span>
              </div>
            </div>
            <button class="text-gray-600 hover:text-gray-800">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrendingMemes',
  props: {
    memes: {
      type: Array,
      required: true
    },
    likedItems: {
      type: Object,
      required: true
    }
  },
  emits: ['like']
}
</script>