<script setup>
import {RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import {computed, ref, onMounted, onUnmounted, watch} from 'vue'

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
      <RouterLink to="/">로고</RouterLink>
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
</style>