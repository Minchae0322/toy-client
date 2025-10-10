<script setup>
import {RouterLink, RouterView, useRoute} from 'vue-router'
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import {webSocketService} from '@/services/webSocketService.js'
import {useAuth} from '@/composables/useAuth'

const route = useRoute()
const {userInfo, isLoggedIn, isAdmin, logout} = useAuth()

const isLoggingOut = ref(false)
const wsConnected = ref(false)
const showDebug = ref(import.meta.env.DEV)

// 인증 페이지 여부
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
  } catch {}
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
  <!-- 디버그 정보 -->
  <div v-if="showDebug && !isAuthPage" class="debug-info">
    <div>로그인: {{ isLoggedIn }}</div>
    <div>관리자: {{ isAdmin }}</div>
    <div>사용자: {{ userInfo?.username }}</div>
    <div>WebSocket: {{ wsConnected ? '🟢' : '🔴' }}</div>
  </div>

  <!-- 헤더 -->
  <header v-if="!isAuthPage" class="app-header">
    <div class="header-container">
      <!-- 로고 -->
      <div class="logo">
        <RouterLink to="/home" class="logo-link">
          <span class="logo-icon">🍽️</span>
          <span class="logo-text">한입만</span>
        </RouterLink>
      </div>

      <!-- 메인 네비게이션 -->
      <nav class="main-nav">
        <template v-if="!isLoggedIn">
          <div class="nav-items">
            <RouterLink to="/one-mouth/list" class="nav-link">둘러보기</RouterLink>
          </div>
          <div class="auth-buttons">
            <RouterLink to="/login" class="btn-login">로그인</RouterLink>
            <RouterLink to="/register" class="btn-register">회원가입</RouterLink>
          </div>
        </template>

        <template v-else>
          <div class="nav-items">
            <RouterLink to="/home" class="nav-link">홈</RouterLink>
            <RouterLink to="/products" class="nav-link">제품</RouterLink>
            <RouterLink to="/one-mouth/list" class="nav-link">한입거리</RouterLink>
            <RouterLink to="/sell" class="nav-link btn-sell">판매하기</RouterLink>
          </div>

          <!-- 관리자 메뉴 -->
          <div v-if="isAdmin" class="admin-dropdown">
            <button class="admin-toggle">관리자 ▾</button>
            <div class="admin-menu">
              <RouterLink to="/admin" class="admin-item">대시보드</RouterLink>
              <RouterLink to="/admin/users" class="admin-item">사용자 관리</RouterLink>
              <RouterLink to="/admin/category" class="admin-item">카테고리 관리</RouterLink>
            </div>
          </div>

          <!-- 사용자 정보 -->
          <div class="user-menu">
            <div class="user-info">
              <span class="user-avatar">{{ userInfo?.username?.charAt(0).toUpperCase() }}</span>
              <span class="user-name">{{ userInfo?.username }}</span>
            </div>
            <button @click="handleLogout" class="btn-logout" :disabled="isLoggingOut">
              {{ isLoggingOut ? '로그아웃 중...' : '로그아웃' }}
            </button>
          </div>
        </template>
      </nav>
    </div>
  </header>

  <!-- 메인 컨텐츠 -->
  <main :class="['app-main', { 'no-padding': isAuthPage }]">
    <RouterView/>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap');

* {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 디버그 정보 */
.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  z-index: 9999;
  line-height: 1.6;
  backdrop-filter: blur(10px);
}

.debug-info div {
  margin: 2px 0;
}

/* 헤더 */
.app-header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* 로고 */
.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 28px;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.5px;
}

/* 메인 네비게이션 */
.main-nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  letter-spacing: -0.3px;
}

.nav-link:hover {
  color: #000;
  background: #f8f8f8;
}

.nav-link.router-link-active {
  color: #1DCD9F;
  background: rgba(29, 205, 159, 0.08);
}

/* 판매하기 버튼 */
.btn-sell {
  background: #1DCD9F;
  color: white;
  font-weight: 600;
  margin-left: 8px;
}

.btn-sell:hover {
  background: #169976;
  color: white;
}

/* 인증 버튼 */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-login {
  text-decoration: none;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-login:hover {
  color: #000;
  background: #f8f8f8;
}

.btn-register {
  text-decoration: none;
  background: #000;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-register:hover {
  background: #333;
}

/* 관리자 드롭다운 */
.admin-dropdown {
  position: relative;
}

.admin-toggle {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-toggle:hover {
  background: #e55a2b;
}

.admin-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 8px;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: all 0.2s;
}

.admin-dropdown:hover .admin-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.admin-item {
  display: block;
  text-decoration: none;
  color: #333;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.admin-item:hover {
  background: #f8f8f8;
  color: #ff6b35;
}

.admin-item.router-link-active {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

/* 사용자 메뉴 */
.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 24px;
  border-left: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1DCD9F, #169976);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  letter-spacing: -0.3px;
}

.btn-logout {
  background: transparent;
  color: #999;
  border: 1px solid #e0e0e0;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover:not(:disabled) {
  color: #666;
  border-color: #ccc;
  background: #f8f8f8;
}

.btn-logout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 메인 컨텐츠 */
.app-main {
  min-height: calc(100vh - 64px);
  background: #fafafa;
}

.app-main.no-padding {
  padding: 0;
  background: white;
}

/* 반응형 */
@media (max-width: 1024px) {
  .header-container {
    padding: 0 40px;
  }

  .nav-items {
    gap: 4px;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 20px;
  }

  .main-nav {
    gap: 16px;
  }

  .nav-items {
    display: none;
  }

  .user-name {
    display: none;
  }
}
</style>