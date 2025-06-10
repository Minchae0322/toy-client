<template>
  <div class="promo-container">
    <div class="content-wrapper">
      <div>
        <h3 class="title">나만의 짤 만들기 🎨</h3>
        <p class="description">AI가 도와주는 개인화 밈 생성기</p>
        <button class="create-button">
          지금 만들기
        </button>
      </div>
      <div class="emoji-icon">🤖</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIMemeGeneratorPromo',
};
</script>

<style scoped>
.promo-container {
  /* bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl p-6 text-white */
  background: linear-gradient(to right, #60a5fa, #a855f7); /* blue-400 to purple-500 */
  border-radius: 0.75rem; /* rounded-xl */
  padding: 1.5rem; /* p-6 (1rem = 16px, so 6 * 0.25rem = 1.5rem) */
  color: white; /* text-white */
}

.content-wrapper {
  /* flex items-center justify-between */
  display: flex;
  align-items: center; /* items-center */
  justify-content: space-between; /* justify-between */
}

.title {
  /* text-xl font-bold mb-2 */
  font-size: 1.25rem; /* text-xl */
  font-weight: bold; /* font-bold */
  margin-bottom: 0.5rem; /* mb-2 */
}

.description {
  /* text-sm opacity-90 mb-4 */
  font-size: 0.875rem; /* text-sm */
  opacity: 0.9; /* opacity-90 */
  margin-bottom: 1rem; /* mb-4 */
}

.create-button {
  /* bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors */
  background-color: white; /* bg-white */
  color: #9333ea; /* text-purple-600 */
  padding-left: 1rem; /* px-4 */
  padding-right: 1rem; /* px-4 */
  padding-top: 0.5rem; /* py-2 */
  padding-bottom: 0.5rem; /* py-2 */
  border-radius: 0.5rem; /* rounded-lg */
  font-weight: 500; /* font-medium */
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; /* transition-colors */
  transition-duration: 150ms; /* transition-colors (default duration) */
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* transition-colors (default ease-in-out) */
  border: none; /* 기본 버튼 테두리 제거 */
  cursor: pointer; /* 클릭 가능한 요소임을 표시 */
}

.create-button:hover {
  background-color: #f3f4f6; /* hover:bg-gray-100 */
}

.emoji-icon {
  /* text-6xl */
  font-size: 3.75rem; /* text-6xl (6 * 1rem = 6rem, but Tailwind's text-6xl is 4rem or 3.75rem depending on config) */
  /* 여기서는 Tailwind의 기본값 중 text-6xl (96px, 6rem)에 가까운 값을 60px(3.75rem)로 설정했습니다.
     정확한 px 값은 Tailwind 기본 설정을 확인해야 하지만, 시각적으로 유사하게 맞추기 위해 선택했습니다. */
}
</style>