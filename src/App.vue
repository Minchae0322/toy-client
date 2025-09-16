<script setup>

import {RouterLink, RouterView, useRoute} from 'vue-router'
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import {webSocketService} from '@/services/webSocketService.js'
import {useAuth} from '@/composables/useAuth'

const route = useRoute()
const {userInfo, isLoggedIn, isAdmin, logout} = useAuth()

const isLoggingOut = ref(false)
const wsConnected = ref(false)
const showDebug = ref(import.meta.env.DEV) // 개발환경에서만 디버깅 정보 표시

// 인증(로그인/회원가입/콜백) 전용 페이지 여부
const isAuthPage = computed(() =>
    ['/login', '/register', '/oauth/callback'].includes(route.path)
)

// WebSocket 연결 상태 감시
const monitorWebSocketStatus = () => {
  wsConnected.value = webSocketService.isConnected()
  webSocketService.onConnectionChange((connected) => {
    wsConnected.value = connected
  })
}

// 로그아웃 처리
const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    webSocketService.disconnect()
  } catch {
  }
  await logout()
  isLoggingOut.value = false
}
onMounted(() => {
  if (isLoggedIn.value) {
    webSocketService.connect().catch(console.error)
  }
  monitorWebSocketStatus()
})

watch(isLoggedIn, (newVal) => {
  if (newVal) {
    webSocketService.connect().catch(console.error)
  } else {
    webSocketService.disconnect()
  }
  monitorWebSocketStatus()
})

onUnmounted(() => webSocketService.disconnect())
</script>

<template>
  <!-- 디버그 정보 (개발환경에서만 보임) -->
  <div v-if="showDebug && !isAuthPage" class="debug-info">
    <div>로그인: {{ isLoggedIn }}</div>
    <div>관리자: {{ isAdmin }}</div>
    <div>사용자: {{ userInfo?.username }}</div>
    <div>역할: {{ userInfo?.role }}</div>
    <div>WebSocket: {{ wsConnected ? '🟢 연결됨' : '🔴 끊김' }}</div>
  </div>

  <!-- 헤더 -->
  <header v-if="!isAuthPage" class="app-header">
    <div class="header-container">
      <div class="logo">
        <RouterLink to="/home" class="mz-title">🍽️ 한입만</RouterLink>
      </div>
      <nav class="main-nav">
        <template v-if="isLoggingOut">
          <div class="loading">로그아웃 중...</div>
        </template>
        <template v-else-if="!isLoggedIn">
          <RouterLink to="/login" class="nav-link">로그인</RouterLink>
          <RouterLink to="/register" class="nav-link">회원가입</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/home" class="nav-link">홈</RouterLink>
          <RouterLink to="/products" class="nav-link">제품</RouterLink>
          <RouterLink to="/one-mouth/list" class="nav-link">한입거리</RouterLink>
          <RouterLink to="/sell" class="nav-link">판매하기</RouterLink>
          <div v-if="isAdmin" class="admin-menu">
            <RouterLink to="/admin" class="admin-link">🛠️ 관리자</RouterLink>
            <RouterLink to="/admin/users" class="admin-link">👥 사용자 관리</RouterLink>
            <RouterLink to="/admin/category" class="admin-link">카테고리 관리</RouterLink>
          </div>
          <div class="user-section">
            <span class="username">{{ userInfo?.username || '사용자' }}</span>
            <span v-if="isAdmin" class="admin-badge">관리자</span>
            <button @click="handleLogout" class="logout-btn">로그아웃</button>
          </div>
        </template>
      </nav>
    </div>
  </header>

  <!-- 메인 라우터 뷰 -->
  <main :class="['app-main', { 'no-padding': isAuthPage }]">
    <RouterView/>
  </main>
</template>

<style scoped>
.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 9999;
  line-height: 1.4;
}

.debug-info div {
  margin: 2px 0;
}

.app-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo .mz-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  background: linear-gradient(to right, #9333ea, #db2777);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #9333ea;
}

.nav-link.router-link-active {
  background: #9333ea;
  color: white;
}

.admin-menu {
  display: flex;
  gap: 10px;
  padding: 0 15px;
  border-left: 2px solid #e5e7eb;
  border-right: 2px solid #e5e7eb;
  margin: 0 10px;
}

.admin-link {
  background: linear-gradient(135deg, #ff6b35, #f39c12) !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  text-decoration: none !important;
  transition: all 0.3s !important;
  font-size: 0.9rem;
}

.admin-link:hover {
  background: linear-gradient(135deg, #e55a2b, #e67e22) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 15px;
  border-left: 1px solid #e5e7eb;
}

.username {
  font-weight: 600;
  color: #333;
}

.admin-badge {
  background: linear-gradient(135deg, #ff6b35, #f39c12);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #dc2626;
}

.loading {
  color: #6b7280;
  font-style: italic;
}

.app-main {
  padding: 2rem;
}

.app-main.no-padding {
  padding: 0;
}
</style>
