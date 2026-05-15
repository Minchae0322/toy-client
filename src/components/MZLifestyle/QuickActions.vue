<template>
  <div class="quick-actions-grid">
    <button class="action-button">
      <div class="action-content">
        <div class="action-icon">🎭</div>
        <h3 class="action-title">밈 생성기</h3>
        <p class="action-description">AI로 나만의 짤 만들기</p>
      </div>
    </button>
    <button class="action-button">
      <div class="action-content">
        <div class="action-icon">📸</div>
        <h3 class="action-title">먹거리 인증</h3>
        <p class="action-description">먹거리 후기 남기기</p>
      </div>
    </button>
  </div>
</template>

<script setup>
// 이 컴포넌트에는 특별한 스크립트 로직이 필요하지 않습니다.
</script>

<style scoped>
.quick-actions-grid {
  /* grid grid-cols-2 gap-4 */
  display: grid; /* grid */
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* grid-cols-2 */
  gap: 1rem; /* gap-4 (4 * 0.25rem = 1rem) */
}

.action-button {
  /* bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow */
  background-color: var(--bg-elevated); /* bg-white */
  padding: 1.5rem; /* p-6 (6 * 0.25rem = 1.5rem) */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  transition: box-shadow 150ms ease-in-out; /* transition-shadow */
  border: none; /* 버튼 기본 테두리 제거 */
  cursor: pointer; /* 클릭 가능한 요소임을 표시 */
}

.action-button:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06); /* hover:shadow-md */
}

.action-content {
  /* text-center */
  text-align: center; /* text-center */
}

.action-icon {
  /* text-3xl mb-3 */
  font-size: 1.875rem; /* text-3xl (3 * 1rem = 3rem, but Tailwind's text-3xl is 1.875rem) */
  margin-bottom: 0.75rem; /* mb-3 */
  line-height: 1; /* 아이콘과 텍스트의 정렬을 위해 */
}

.action-title {
  /* font-medium mb-1 */
  font-weight: 500; /* font-medium */
  margin-bottom: 0.25rem; /* mb-1 */
}

.action-description {
  /* text-sm text-gray-600 */
  font-size: 0.875rem; /* text-sm */
  color: #4b5563; /* text-gray-600 */
}
</style>