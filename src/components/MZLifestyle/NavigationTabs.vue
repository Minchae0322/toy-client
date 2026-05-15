<template>
  <div class="navigation-tabs-container">
    <div class="tabs-wrapper">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="$emit('update-tab', tab.id)"
          :class="{
          'tab-button-active': activeTab === tab.id,
          'tab-button-inactive': activeTab !== tab.id
        }"
          class="tab-button-base"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: String
});

defineEmits(['update-tab']);

const tabs = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'memes', label: '밈/짤', icon: '😂' },
  { id: 'foods', label: '먹거리', icon: '🍔' },
  { id: 'create', label: '만들기', icon: '✨' }
];
</script>

<style scoped>
.navigation-tabs-container {
  /* bg-white border-b */
  background-color: var(--bg-elevated); /* bg-white */
  border-bottom: 1px solid #e5e7eb; /* border-b (Tailwind gray-200 default) */
}

.tabs-wrapper {
  /* flex space-x-8 px-4 */
  display: flex; /* flex */
  gap: 2rem; /* space-x-8 (8 * 0.25rem = 2rem) */
  padding-left: 1rem; /* px-4 */
  padding-right: 1rem; /* px-4 */
  overflow-x: auto; /* 탭이 많아질 경우 스크롤 허용 */
  -ms-overflow-style: none; /* IE, Edge 숨기기 */
  scrollbar-width: none; /* Firefox 숨기기 */
}

/* 스크롤바 숨기기 (Webkit 기반 브라우저) */
.tabs-wrapper::-webkit-scrollbar {
  display: none;
}

.tab-button-base {
  /* py-3 px-2 border-b-2 font-medium text-sm */
  padding-top: 0.75rem; /* py-3 */
  padding-bottom: 0.75rem; /* py-3 */
  padding-left: 0.5rem; /* px-2 */
  padding-right: 0.5rem; /* px-2 */
  border-bottom-width: 2px; /* border-b-2 */
  font-weight: 500; /* font-medium */
  font-size: 0.875rem; /* text-sm */
  background-color: transparent; /* 버튼 기본 배경 제거 */
  border-left: none;
  border-right: none;
  border-top: none; /* 기본 버튼 테두리 제거 */
  cursor: pointer; /* 클릭 가능한 요소임을 표시 */
  white-space: nowrap; /* 탭 텍스트가 줄 바꿈되지 않도록 */
  transition: color 150ms ease-in-out, border-color 150ms ease-in-out; /* 색상 및 테두리 변화에 부드러운 전환 추가 */
}

.tab-button-active {
  /* border-purple-500 text-purple-600 */
  border-color: var(--c-brand); /* border-purple-500 */
  color: #9333ea; /* text-purple-600 */
}

.tab-button-inactive {
  /* border-transparent text-gray-500 hover:text-gray-700 */
  border-color: transparent; /* border-transparent */
  color: #6b7280; /* text-gray-500 */
}

.tab-button-inactive:hover {
  color: #4b5563; /* hover:text-gray-700 */
}

.tab-icon {
  /* mr-2 */
  margin-right: 0.5rem; /* mr-2 */
}
</style>