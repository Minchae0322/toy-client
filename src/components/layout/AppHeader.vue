<template>
  <header class="app-header">
    <!-- 🚨 디버깅 정보 (개발 중에만 사용) -->
    <div v-if="showDebug" class="debug-info">
      <div>로그인: {{ isLoggedIn }}</div>
      <div>관리자: {{ isAdmin }}</div>
      <div>사용자: {{ userInfo?.username }}</div>
      <div>역할: {{ userInfo?.role }}</div>
      <div>토큰: {{ hasToken ? '있음' : '없음' }}</div>
    </div>

    <div class="header-container">
      <div class="logo">
        <RouterLink to="/home" class="mz-title">🍽️ 한입만</RouterLink>
      </div>

      <nav class="main-nav">
        <!-- 로그아웃 진행 중이면 로딩 표시 -->
        <template v-if="isLoggingOut">
          <div class="loading">로그아웃 중...</div>
        </template>

        <!-- 로그인하지 않은 경우 -->
        <template v-else-if="!isLoggedIn">
          <RouterLink to="/login" class="nav-link">로그인</RouterLink>
          <RouterLink to="/register" class="nav-link">회원가입</RouterLink>
        </template>

        <!-- 로그인한 경우 -->
        <template v-else>
          <RouterLink to="/home" class="nav-link">홈</RouterLink>
          <RouterLink to="/one-mouth-list" class="nav-link">한입거리</RouterLink>
          <RouterLink to="/sell" class="nav-link">판매하기</RouterLink>

          <!-- 🎯 관리자 메뉴 -->
          <div v-if="isAdmin" class="admin-menu">
            <RouterLink to="/admin" class="nav-link admin-link">
              🛠️ 관리자
            </RouterLink>
            <RouterLink to="/admin/users" class="nav-link admin-link">
              👥 사용자 관리
            </RouterLink>
            <RouterLink to="/admin/products" class="nav-link admin-link">
              📦 상품 관리
            </RouterLink>
          </div>

          <!-- 사용자 메뉴 -->
          <div class="user-menu">
            <div class="user-info">
              <span class="username">{{ userInfo?.username }}</span>
              <span v-if="isAdmin" class="admin-badge">관리자</span>
            </div>
            <button @click="handleLogout" class="logout-btn">로그아웃</button>
          </div>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import {RouterLink} from 'vue-router'
import {ref, computed, onMounted} from 'vue'
import {useAuth} from '@/composables/useAuth'

// 디버깅 모드 (개발 중에만 true로 설정)
const showDebug = ref(true) // 배포 시 false로 변경

const {userInfo, isLoggedIn, isAdmin, logout, checkAuthStatus} = useAuth()

// 로그아웃 진행 상태
const isLoggingOut = ref(false)

// 토큰 존재 여부
const hasToken = computed(() => !!localStorage.getItem('access_token'))

// 로그아웃 처리
const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await logout()
  } finally {
    isLoggingOut.value = false
  }
}

// 컴포넌트 마운트 시 디버깅 정보 출력
onMounted(() => {
  console.log('=== AppHeader 디버깅 ===')
  console.log('isLoggedIn:', isLoggedIn.value)
  console.log('isAdmin:', isAdmin.value)
  console.log('userInfo:', userInfo.value)
  console.log('hasToken:', hasToken.value)

  // 강제 인증 상태 체크
  checkAuthStatus()

  // JWT 토큰 수동 확인
  const token = localStorage.getItem('access_token')
  if (token) {
    console.log('토큰 일부:', token.substring(0, 50))
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        // Base64 URL 디코딩
        let payload = parts[1]
        payload = payload.replace(/-/g, '+').replace(/_/g, '/')
        while (payload.length % 4) {
          payload += '='
        }
        const decodedPayload = JSON.parse(atob(payload))
        console.log('JWT 페이로드:', decodedPayload)
        console.log('JWT role:', decodedPayload.role)
        console.log('JWT auth:', decodedPayload.auth)
      }
    } catch (e) {
      console.error('JWT 디코딩 실패:', e)
    }
  }
})
</script>

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
}

.admin-link {
  background: linear-gradient(135deg, #ff6b35, #f39c12);
  color: white !important;
  font-weight: 600;
  border-radius: 8px;
  padding: 8px 12px;
  text-decoration: none;
  transition: all 0.3s;
}

.admin-link:hover {
  background: linear-gradient(135deg, #e55a2b, #e67e22);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
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
</style>