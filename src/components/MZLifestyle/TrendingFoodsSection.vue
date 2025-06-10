<!-- TrendingFoodsSection.vue -->
<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold flex items-center">
        <Coffee class="w-5 h-5 mr-2 text-orange-500" />
        한입만! 유행 먹거리
      </h2>
      <button class="text-purple-600 text-sm font-medium">더보기</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
          v-for="food in foods"
          :key="food.id"
          class="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div class="relative">
          <img
              :src="food.image"
              :alt="food.name"
              class="w-full h-40 object-cover"
          />
          <span
              v-if="food.isHot"
              class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
          >
            🔥 HOT
          </span>
          <span
              v-if="food.isNew"
              class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
          >
            ✨ NEW
          </span>
        </div>
        <div class="p-4">
          <h3 class="font-medium mb-1">{{ food.name }}</h3>
          <p class="text-sm text-gray-600 mb-2">{{ food.brand }}</p>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
              <div class="flex items-center">
                <span
                    v-for="i in 5"
                    :key="i"
                    class="text-xs"
                    :class="i <= Math.floor(food.rating) ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ⭐
                </span>
              </div>
              <span class="text-sm text-gray-600">({{ food.reviews }})</span>
            </div>
            <span class="font-medium text-purple-600">{{ food.price }}</span>
          </div>
          <button class="w-full bg-purple-100 text-purple-600 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
            나도 한입만! 👋
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Coffee } from 'lucide-vue-next';

defineProps({
  foods: Array
});
</script>