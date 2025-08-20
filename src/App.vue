<script setup>
import {RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import {computed, ref, onMounted, onUnmounted, watch} from 'vue'
import {Menu} from "lucide-vue-next"
import { webSocketService } from '@/services/webSocketService.js'

const route = useRoute()
const router = useRouter()

// 상태 관리
const isLoggedIn = ref(false)
const userInfo = ref(null)
const isLoggingOut = ref(false)
const wsConnected = ref(false) // ✅ WebSocket 연결 상태
const showDebug = ref(false)   // 디버깅 모드

// 인증 페이지 여부
const isAuthPage = computed(() =>
    ['/login', '/register'].includes(route.path)
)

// JWT 디코딩 함수
const decodeJWTPayload = (token) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }
    let payload = parts[1]
    payload = payload.replace(/-/g, '+').replace(/_/g, '/')
    while (payload.length % 4) {
      payload += '='
    }
    const jsonPayload = atob(payload)
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT 디코딩 실패:', error)
    return null
  }
}

// ✅ WebSocket 상태 감시
const monitorWebSocketStatus = () => {
  wsConnected.value = webSocketService.isConnected()
  webSocketService.onConnectionChange((connected) => {
    console.log('🔌 [App.vue] WebSocket 연결 상태 변경:', connected)
    wsConnected.value = connected
  })
}

// ✅ WebSocket 해제 (로그아웃 시에만)
const disconnectWebSocket = () => {
  try {
    console.log('🔌 [App.vue] 로그아웃으로 인한 WebSocket 연결 해제...')
    webSocketService.disconnect()
    wsConnected.value = false
  } catch (error) {
    console.error('❌ [App.vue] WebSocket 해제 실패:', error)
  }
}

// 인증 상태 확인
const checkAuthStatus = () => {
  console.log('🔍 App.vue 인증 상태 확인 중...')
  const token = localStorage.getItem('access_token')

  if (!token) {
    console.log('❌ 토큰 없음')
    isLoggedIn.value = false
    userInfo.value = null
    return
  }

  console.log('✅ 토큰 발견:', token.substring(0, 50) + '...')
  isLoggedIn.value = true

  const payload = decodeJWTPayload(token)
  if (payload) {
    userInfo.value = {
      id: payload.userId || payload.sub,
      username: payload.username || payload.sub,
      role: payload.role || payload.auth,
      provider: payload.provider
    }
    console.log('✅ App.vue 사용자 정보 추출 완료:', userInfo.value)
  } else {
    console.log('❌ JWT 디코딩 실패')
  }
}

// 관리자 여부
const isAdmin = computed(() => {
  const role = userInfo.value?.role
  const result = role === 'ADMIN'
  console.log('🔵 App.vue isAdmin 계산:', { role, result })
  return result
})

// 토큰 존재 여부
const hasToken = computed(() => !!localStorage.getItem('access_token'))

// 로그아웃
const handleLogout = async () => {
  console.log('👋 App.vue 로그아웃 처리 중...')
  isLoggingOut.value = true

  try {
    disconnectWebSocket() // ✅ 로그아웃 시 WebSocket 해제
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    isLoggedIn.value = false
    userInfo.value = null
    await router.push('/login')
    console.log('✅ App.vue 로그아웃 완료')
  } finally {
    isLoggingOut.value = false
  }
}

// localStorage 변경 감지 (다른 탭 반영)
const handleStorageChange = (e) => {
  if (e.key === 'access_token') {
    checkAuthStatus()
  }
}

// 마운트 시 실행
onMounted(() => {
  checkAuthStatus()
  monitorWebSocketStatus() // ✅ WebSocket 상태 감시 시작
  window.addEventListener('storage', handleStorageChange)
})

// 언마운트 시 정리
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<template>
  <!-- ✅ 디버깅 정보 -->
  <div v-if="showDebug && !isAuthPage" class="debug-info">
    <div>로그인: {{ isLoggedIn }}</div>
    <div>관리자: {{ isAdmin }}</div>
    <div>사용자: {{ userInfo?.username }}</div>
    <div>역할: {{ userInfo?.role }}</div>
    <div>토큰: {{ hasToken ? '있음' : '없음' }}</div>
    <div>WebSocket: {{ wsConnected ? '🟢 연결됨' : '🔴 끊김' }}</div>
  </div>

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
          <RouterLink to="/dashboard" class="nav-link">대시보드</RouterLink>
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

/* 기존 스타일 유지 */
.mz-header {
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
}

.mz-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.mz-header-left,
.mz-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mz-icon-default {
  width: 1.5rem;
  height: 1.5rem;
  color: #4b5563;
  flex-shrink: 0;
}

.mz-title {
  font-size: 1.25rem;
  font-weight: bold;
  background: linear-gradient(to right, #9333ea, #db2777);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.mz-user-icon-bg {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(to right, #c084fc, #f472b6);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mz-user-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
  flex-shrink: 0;
}
</style>