<!-- TrendingMemesSection.vue -->
<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold flex items-center">
        <TrendingUp class="w-5 h-5 mr-2 text-red-500" />
        지금 핫한 밈/짤
      </h2>
      <button class="text-purple-600 text-sm font-medium">더보기</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
          v-for="meme in memes"
          :key="meme.id"
          class="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <img
            :src="meme.image"
            :alt="meme.title"
            class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h3 class="font-medium mb-2">{{ meme.title }}</h3>
          <div class="flex flex-wrap gap-1 mb-3">
            <span
                v-for="tag in meme.tags"
                :key="tag"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                  @click="$emit('like', meme.id)"
                  class="flex items-center space-x-1 hover:text-red-500 transition-colors"
              >
                <Heart
                    class="w-4 h-4"
                    :class="{ 'fill-red-500 text-red-500': likedItems[meme.id] }"
                />
                <span class="text-sm">{{ meme.likes }}</span>
              </button>
              <div class="flex items-center space-x-1">
                <MessageCircle class="w-4 h-4" />
                <span class="text-sm">{{ meme.comments }}</span>
              </div>
            </div>
            <button class="hover:text-purple-500 transition-colors">
              <Share2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Heart, MessageCircle, Share2, TrendingUp } from 'lucide-vue-next';

defineProps({
  memes: Array,
  likedItems: Object
});

defineEmits(['like']);
</script>