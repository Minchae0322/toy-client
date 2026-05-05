<template>
  <nav class="bottom-navigation">
    <div class="nav-items-wrapper">
      <button
          v-for="(item, index) in navItems"
          :key="index"
          class="nav-item-button"
          @click="handleNavClick(item)"
      >
        <span class="nav-item-icon">{{ item.icon }}</span>
        <span class="nav-item-label">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navItems = [
  { icon: '🏠', label: '홈', route: '/' },
  { icon: '😂', label: '밈/짤', route: '/memes' },
  { icon: '✨', label: '만들기', route: '/create' },
  { icon: '👤', label: '마이', route: '/profile' }
];

const handleNavClick = (item) => {
  if (item.route) {
    router.push(item.route);
  }
};
</script>

<style scoped>
.bottom-navigation {
  /* bg-white border-t sticky bottom-0 */
  background-color: white; /* bg-white */
  border-top: 1px solid #e5e7eb; /* border-t (border-gray-200, Tailwind default) */
  position: sticky; /* sticky */
  bottom: 0; /* bottom-0 */
  width: 100%; /* 너비 100%로 설정 */
  z-index: 10; /* 다른 요소 위에 오도록 z-index 설정 (선택 사항) */
}

.nav-items-wrapper {
  /* flex justify-around py-2 */
  display: flex; /* flex */
  justify-content: space-around; /* justify-around */
  padding-top: 0.5rem; /* py-2 */
  padding-bottom: 0.5rem; /* py-2 */
}

.nav-item-button {
  /* flex flex-col items-center py-2 px-3 */
  display: flex; /* flex */
  flex-direction: column; /* flex-col */
  align-items: center; /* items-center */
  padding-top: 0.5rem; /* py-2 */
  padding-bottom: 0.5rem; /* py-2 */
  padding-left: 0.75rem; /* px-3 */
  padding-right: 0.75rem; /* px-3 */
  background-color: transparent; /* 버튼 기본 배경 제거 */
  border: none; /* 버튼 기본 테두리 제거 */
  cursor: pointer; /* 클릭 가능한 요소임을 표시 */
  transition: all 0.2s ease; /* 부드러운 전환 효과 */
  -webkit-tap-highlight-color: transparent; /* 모바일 탭 하이라이트 제거 */
}

.nav-item-button:hover {
  background-color: #f3f4f6; /* hover:bg-gray-100 */
  border-radius: 0.5rem; /* 호버 시 둥근 모서리 */
}

.nav-item-button:active {
  transform: scale(0.95); /* 클릭 시 살짝 작아지는 효과 */
}

.nav-item-icon {
  /* text-xl mb-1 */
  font-size: 1.25rem; /* text-xl */
  margin-bottom: 0.25rem; /* mb-1 */
  line-height: 1; /* 아이콘과 텍스트의 정렬을 위해 */
}

.nav-item-label {
  /* text-xs text-gray-600 */
  font-size: 0.75rem; /* text-xs */
  color: #4b5563; /* text-gray-600 */
  white-space: nowrap; /* 텍스트가 줄 바꿈되지 않도록 */
}
</style>