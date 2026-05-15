<template>
  <div class="mbti-banner-container">
    <div class="mbti-banner-content">
      <div>
        <h2 class="mbti-banner-title">ENFP님을 위한 추천! ✨</h2>
        <p class="mbti-banner-description">오늘은 새로운 밈 만들기 어때요?</p>
      </div>
      <Sparkles class="sparkles-icon" />
    </div>
  </div>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next';
</script>

<style scoped>
.mbti-banner-container {
  /* bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 m-4 rounded-xl */
  background: linear-gradient(to right, var(--c-brand), #ec4899); /* purple-500 to pink-500 */
  color: white; /* text-white */
  padding: 1rem; /* p-4 (1rem = 16px) */
  margin: 1rem; /* m-4 */
  border-radius: 0.75rem; /* rounded-xl */
}

.mbti-banner-content {
  /* flex items-center justify-between */
  display: flex; /* flex */
  align-items: center; /* items-center */
  justify-content: space-between; /* justify-between */
}

.mbti-banner-title {
  /* text-lg font-bold */
  font-size: 1.125rem; /* text-lg */
  font-weight: bold; /* font-bold */
  /* Tailwind의 h2 기본 margin-bottom이 있다면 여기에 추가할 수 있습니다. */
}

.mbti-banner-description {
  /* text-sm opacity-90 */
  font-size: 0.875rem; /* text-sm */
  opacity: 0.9; /* opacity-90 */
}

.sparkles-icon {
  /* w-8 h-8 */
  width: 2rem; /* w-8 (8 * 0.25rem = 2rem) */
  height: 2rem; /* h-8 */
  flex-shrink: 0; /* 아이콘이 찌그러지지 않도록 */
}
</style>