<template>
  <header class="mz-header">
    <div class="mz-header-content">
      <div class="mz-header-left">
        <Menu class="mz-icon-default" />
        <h1 class="mz-title">MZ라이프</h1>
      </div>
      <div class="mz-header-right">
        <Search class="mz-icon-default" />
        <Bell class="mz-icon-default" />
        <div class="mz-user-icon-bg">
          <User class="mz-user-icon" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Menu, Search, Bell, User } from 'lucide-vue-next';
</script>

<style scoped>
.mz-header {
  /* bg-white shadow-sm sticky top-0 z-50 */
  background-color: var(--bg-elevated); /* bg-white */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  position: sticky; /* sticky */
  top: 0; /* top-0 */
  z-index: 50; /* z-50 */
  width: 100%; /* 전체 너비 */
}

.mz-header-content {
  /* flex items-center justify-between px-4 py-3 */
  display: flex; /* flex */
  align-items: center; /* items-center */
  justify-content: space-between; /* justify-between */
  padding-left: 1rem; /* px-4 */
  padding-right: 1rem; /* px-4 */
  padding-top: 0.75rem; /* py-3 */
  padding-bottom: 0.75rem; /* py-3 */
}

.mz-header-left,
.mz-header-right {
  /* flex items-center space-x-3 */
  display: flex; /* flex */
  align-items: center; /* items-center */
  gap: 0.75rem; /* space-x-3 (Tailwind의 기본 간격 1단위 = 0.25rem이므로 3 * 0.25rem = 0.75rem) */
}

.mz-icon-default {
  /* w-6 h-6 text-gray-600 */
  width: 1.5rem; /* w-6 (6 * 0.25rem = 1.5rem) */
  height: 1.5rem; /* h-6 */
  color: #4b5563; /* text-gray-600 */
  flex-shrink: 0; /* 아이콘이 찌그러지지 않도록 */
}

.mz-title {
  /* text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent */
  font-size: 1.25rem; /* text-xl */
  font-weight: bold; /* font-bold */
  /* 그라데이션 텍스트 효과는 일반 CSS로 구현하기 까다롭습니다.
     아래는 Webkit 기반 브라우저(Chrome, Safari 등)에서 작동하는 방법입니다. */
  background: linear-gradient(to right, #9333ea, #db2777); /* purple-600 to pink-600 */
  -webkit-background-clip: text; /* 텍스트 클립 */
  -webkit-text-fill-color: transparent; /* 텍스트 채우기 색상 투명 */
  background-clip: text; /* 표준 속성 (아직 모든 브라우저 지원 아님) */
  color: transparent; /* fallback for browsers that don't support text-fill-color */
}

.mz-user-icon-bg {
  /* w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center */
  width: 2rem; /* w-8 */
  height: 2rem; /* h-8 */
  background: linear-gradient(to right, #c084fc, #f472b6); /* purple-400 to pink-400 */
  border-radius: 9999px; /* rounded-full (매우 큰 값으로 원형 만듬) */
  display: flex; /* flex */
  align-items: center; /* items-center */
  justify-content: center; /* justify-center */
}

.mz-user-icon {
  /* w-5 h-5 text-white */
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  color: white; /* text-white */
  flex-shrink: 0; /* 아이콘이 찌그러지지 않도록 */
}
</style>