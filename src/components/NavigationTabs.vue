<template>
  <div class="bg-white border-b border-gray-200">
    <div class="flex overflow-x-auto px-4">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="$emit('tab-change', tab.id)"
          :class="[
          'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
          activeTab === tab.id
            ? 'border-purple-500 text-purple-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        {{ tab.name }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavigationTabs',
  props: {
    activeTab: {
      type: String,
      default: 'home'
    }
  },
  emits: ['tab-change'],
  data() {
    return {
      tabs: [
        { id: 'home', name: '홈' },
        { id: 'memes', name: '밈/짤' },
        { id: 'food', name: '먹거리' },
        { id: 'fashion', name: '패션' },
        { id: 'culture', name: '문화' }
      ]
    }
  }
}
</script>