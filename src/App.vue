<script setup>
import {RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import {computed, ref, onMounted, onUnmounted, watch} from 'vue'
import {Menu} from "lucide-vue-next";

const route = useRoute()
const router = useRouter()

// 로그인 상태 관리
const isLoggedIn = ref(false)

// 인증 페이지 확인
const isAuthPage = computed(() =>
    ['/login', '/register'].includes(route.path)
)

// 토큰 확인 함수
const checkAuthStatus = () => {
  const token = localStorage.getItem('access_token')
  isLoggedIn.value = !!token
}

// 로그아웃 진행 중 상태
const isLoggingOut = ref(false)

// 로그아웃 함수
const handleLogout = async () => {
  // 로그아웃 진행 중 상태로 변경
  isLoggingOut.value = true

  // 모든 토큰 제거 (refresh_token도 포함)
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  isLoggedIn.value = false

  // Vue Router를 사용하여 즉시 페이지 이동
  await router.push('/login')

  // 로그아웃 진행 완료
  isLoggingOut.value = false
}

// localStorage 변경 감지 (다른 탭에서 로그아웃 시에도 반영)
const handleStorageChange = (e) => {
  if (e.key === 'access_token') {
    checkAuthStatus()
  }
}

// 컴포넌트 마운트 시 토큰 확인
onMounted(() => {
  checkAuthStatus()

  // storage 이벤트 리스너 추가
  window.addEventListener('storage', handleStorageChange)
})

// 라우트 변경 시 토큰 상태 확인
watch(route, () => {
  checkAuthStatus()
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<template>
  <header v-if="!isAuthPage" class="app-header">
    <div class="logo">
      <RouterLink to="/home" class="mz-title">MZ라이프</RouterLink>
    </div>

    <nav class="main-nav">
      <!-- 로그아웃 진행 중이면 아무것도 표시하지 않음 -->
      <template v-if="isLoggingOut">
        <!-- 빈 템플릿 또는 로딩 스피너 -->
      </template>

      <!-- 로그인하지 않은 경우 로그인/회원가입 표시 -->
      <template v-else-if="!isLoggedIn">
        <RouterLink to="/login">로그인</RouterLink>
        <RouterLink to="/register">회원가입</RouterLink>
      </template>

      <!-- 로그인한 경우 대시보드/로그아웃 표시 -->
      <template v-else>
        <RouterLink to="/dashboard">대시보드</RouterLink>
        <button @click="handleLogout" class="logout-btn">로그아웃</button>
      </template>
    </nav>
  </header>

  <main :class="['app-main', { 'no-padding': isAuthPage }]">
    <RouterView/>
  </main>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.logo a {
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-nav a {
  font-weight: bold;
  text-decoration: none;
  color: #333;
  transition: color 0.2s;
}

.main-nav a:hover {
  color: #42b983;
}

.main-nav a.router-link-exact-active {
  color: #42b983;
}

.logout-btn {
  background: none;
  border: none;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: color 0.2s;
}

.logout-btn:hover {
  color: #e74c3c;
}

.app-main {
  padding: 2rem;
}

.app-main.no-padding {
  padding: 0;
}

.mz-header {
  /* bg-white shadow-sm sticky top-0 z-50 */
  background-color: white; /* bg-white */
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