<!-- TrendingFoods.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-bold text-gray-900">🍔 유행 먹거리</h2>
      <p class="text-sm text-gray-600 mt-1">MZ가 주목하는 맛집과 신메뉴</p>
    </div>
    <div class="p-4">
      <div class="grid grid-cols-1 gap-4">
        <div
            v-for="food in foods"
            :key="food.id"
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          <img
              :src="food.image"
              :alt="food.name"
              class="w-16 h-16 rounded-lg object-cover"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-medium text-gray-900">{{ food.name }}</h3>
              <span v-if="food.isHot" class="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">HOT</span>
              <span v-if="food.isNew" class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">NEW</span>
            </div>
            <p class="text-sm text-gray-600 mb-1">{{ food.brand }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span class="text-sm text-gray-700 ml-1">{{ food.rating }}</span>
                </div>
                <span class="text-sm text-gray-500">({{ food.reviews }})</span>
              </div>
              <span class="font-medium text-purple-600">{{ food.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrendingFoods',
  props: {
    foods: {
      type: Array,
      required: true
    }
  }
}
</script>