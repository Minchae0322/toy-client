<script setup>
import {RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import {webSocketService} from '@/services/webSocketService.js'
import {useAuth} from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const {userInfo, isLoggedIn, isAdmin, logout, userId} = useAuth()

const isLoggingOut = ref(false)
const wsConnected = ref(false)
const showMobileMenu = ref(false)
let unsubscribeWsStatus = null

const isAuthPage = computed(() =>
    ['/login', '/register', '/oauth/callback'].includes(route.path)
)

const profileImageUrl = computed(() => {
  return userInfo.value?.profilePicture?.fileUrl || null
})

const monitorWebSocketStatus = () => {
  wsConnected.value = webSocketService.isConnected()
  // 기존 리스너 정리 후 새로 등록
  if (unsubscribeWsStatus) {
    unsubscribeWsStatus()
  }
  unsubscribeWsStatus = webSocketService.onConnectionChange((connected) => {
    wsConnected.value = connected
  })
}

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    webSocketService.disconnect()
  } catch {}
  await logout()
  isLoggingOut.value = false
}

const goToProfile = async () => {
  if (!userId.value) {
    console.error('❌ userId가 없습니다')
    return
  }

  try {
    await router.push({
      name: 'UserFeedList',
      params: {userId: String(userId.value)}
    })
  } catch (error) {
    console.error('❌ 프로필 이동 실패:', error)
  }
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

onUnmounted(() => {
  if (unsubscribeWsStatus) {
    unsubscribeWsStatus()
  }
  webSocketService.disconnect()
})
</script>

<template>
  <!-- 헤더 -->
  <header v-if="!isAuthPage" class="header">
    <div class="header-content">
      <!-- 로고 -->
      <RouterLink to="/home" class="logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">요거뜨</span>
      </RouterLink>

      <!-- 데스크톱 네비게이션 -->
      <nav class="nav">
        <template v-if="!isLoggedIn">
          <RouterLink to="/one-mouth/list" class="nav-item">둘러보기</RouterLink>
          <div class="nav-divider"></div>
          <RouterLink to="/login" class="nav-item">로그인</RouterLink>
          <RouterLink to="/register" class="btn-primary">시작하기</RouterLink>
        </template>

        <template v-else>
          <!-- 관리자 메뉴 -->
          <div v-if="isAdmin" class="dropdown">
            <button class="dropdown-trigger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <div class="dropdown-menu">
              <RouterLink to="/admin" class="dropdown-item">대시보드</RouterLink>
              <RouterLink to="/admin/users" class="dropdown-item">사용자</RouterLink>
              <RouterLink to="/admin/products" class="dropdown-item">상품 관리</RouterLink>
              <RouterLink to="/admin/category" class="dropdown-item">카테고리</RouterLink>
            </div>
          </div>

          <div class="nav-divider"></div>

          <!-- 사용자 메뉴 -->
          <div class="user-menu">
            <div class="ws-status" :class="{ connected: wsConnected }" title="WebSocket 연결 상태">
              <span class="ws-dot"></span>
            </div>
            <div class="user-info" @click="goToProfile" style="cursor: pointer;">
              <div class="user-avatar">
                <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" />
                <span v-else>{{ userInfo?.username?.charAt(0).toUpperCase() }}</span>
              </div>
              <span class="user-name">{{ userInfo?.username }}</span>
            </div>
            <button @click="handleLogout" class="btn-ghost" :disabled="isLoggingOut">
              {{ isLoggingOut ? '...' : '로그아웃' }}
            </button>
          </div>
        </template>
      </nav>

      <!-- 모바일 메뉴 버튼 -->
      <button class="mobile-menu-btn" @click="showMobileMenu = !showMobileMenu">
        <svg v-if="!showMobileMenu" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- 모바일 메뉴 -->
    <Transition name="mobile-menu">
      <div v-if="showMobileMenu" class="mobile-menu">
        <template v-if="!isLoggedIn">
          <RouterLink to="/one-mouth/list" class="mobile-menu-item" @click="showMobileMenu = false">둘러보기</RouterLink>
          <RouterLink to="/login" class="mobile-menu-item" @click="showMobileMenu = false">로그인</RouterLink>
          <RouterLink to="/register" class="mobile-menu-item primary" @click="showMobileMenu = false">시작하기</RouterLink>
        </template>
        <template v-else>
          <div v-if="isAdmin" class="mobile-menu-section">
            <div class="mobile-menu-label">관리자</div>
            <RouterLink to="/admin" class="mobile-menu-item" @click="showMobileMenu = false">대시보드</RouterLink>
            <RouterLink to="/admin/products" class="mobile-menu-item" @click="showMobileMenu = false">상품 관리</RouterLink>
            <RouterLink to="/admin/users" class="mobile-menu-item" @click="showMobileMenu = false">사용자</RouterLink>
            <RouterLink to="/admin/category" class="mobile-menu-item" @click="showMobileMenu = false">카테고리</RouterLink>
          </div>
          <div class="mobile-menu-footer">
            <div class="mobile-user-info" @click="goToProfile" style="cursor: pointer;">
              <div class="ws-status mobile" :class="{ connected: wsConnected }">
                <span class="ws-dot"></span>
                <span class="ws-label">{{ wsConnected ? '연결됨' : '연결 끊김' }}</span>
              </div>
              <div class="user-avatar">
                <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" />
                <span v-else>{{ userInfo?.username?.charAt(0).toUpperCase() }}</span>
              </div>
              <span>{{ userInfo?.username }}</span>
            </div>
            <button @click="handleLogout" class="btn-ghost" :disabled="isLoggingOut">
              {{ isLoggingOut ? '...' : '로그아웃' }}
            </button>
          </div>
        </template>
      </div>
    </Transition>
  </header>

  <!-- 메인 컨텐츠 -->
  <main :class="['main', { 'auth-page': isAuthPage }]">
    <RouterView/>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap');

* {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 헤더 */
.header {
  position: sticky;
  top: 0;
  background: rgb(255, 255, 255);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 1000;
}

.header-content {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

/* 태블릿: 중간 여백 */
@media (min-width: 768px) {
  .header-content {
    padding: 0 2rem;
  }
}

/* 데스크톱: 큰 여백 */
@media (min-width: 1280px) {
  .header-content {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* 대형 화면: 더 큰 여백 */
@media (min-width: 1920px) {
  .header-content {
    padding: 0 4rem;
  }
}

/* 로고 */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #000;
  transition: all 0.2s ease;
}

.logo:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.logo-icon {
  width: 28px;
  height: 28px;
  margin-left: 23px;
  color: #9333ea;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.8px;
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 네비게이션 */
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item {
  text-decoration: none;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  letter-spacing: -0.2px;
}

.nav-item:hover {
  color: #000;
  background: rgba(0, 0, 0, 0.04);
}

.nav-item.router-link-active {
  color: #000;
  background: rgba(0, 0, 0, 0.06);
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 8px;
}

/* 버튼 */
.btn-primary {
  text-decoration: none;
  background: #9333ea;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.2s;
  letter-spacing: -0.2px;
}

.btn-primary:hover {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.btn-ghost {
  background: transparent;
  color: rgba(0, 0, 0, 0.6);
  border: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.2px;
}

.btn-ghost:hover:not(:disabled) {
  color: #000;
  background: rgba(0, 0, 0, 0.04);
}

.btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 드롭다운 */
.dropdown {
  position: relative;
}

.dropdown-trigger {
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-trigger:hover {
  color: #000;
  background: rgba(0, 0, 0, 0.04);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.2s;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  letter-spacing: -0.2px;
}

.dropdown-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #000;
}

.dropdown-item.router-link-active {
  background: rgba(0, 0, 0, 0.06);
  color: #000;
}

/* 사용자 메뉴 */
.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ws-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 50%;
  transition: all 0.2s;
}

.ws-status.connected {
  background: rgba(16, 185, 129, 0.1);
}

.ws-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.ws-status.connected .ws-dot {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.user-info:hover {
  background: rgba(0, 0, 0, 0.04);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  letter-spacing: -0.2px;
}

/* 모바일 메뉴 */
.mobile-menu-btn {
  display: none;
  background: transparent;
  border: none;
  color: #000;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.mobile-menu-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.mobile-menu {
  display: none;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 16px;
}

.mobile-menu-item {
  display: block;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.7);
  font-size: 16px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  letter-spacing: -0.3px;
}

.mobile-menu-item:hover,
.mobile-menu-item.router-link-active {
  background: rgba(0, 0, 0, 0.04);
  color: #000;
}

.mobile-menu-item.primary {
  background: #9333ea;
  color: #fff;
  font-weight: 600;
  margin-top: 8px;
}

.mobile-menu-item.primary:hover {
  background: #7c3aed;
}

.mobile-menu-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.mobile-menu-label {
  color: rgba(0, 0, 0, 0.4);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 16px 8px;
}

.mobile-menu-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.mobile-user-info span {
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

.ws-status.mobile {
  width: auto;
  padding: 6px 12px;
  border-radius: 20px;
  gap: 6px;
  background: rgba(0, 0, 0, 0.04);
}

.ws-status.mobile.connected {
  background: rgba(16, 185, 129, 0.1);
}

.ws-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.5);
}

.ws-status.mobile.connected .ws-label {
  color: #10b981;
}

/* 모바일 메뉴 애니메이션 */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 메인 컨텐츠 */
.main {
  min-height: calc(100vh - 64px);
  background: #ffffff;
}

.main.auth-page {
  background: white;
}

/* 반응형 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .user-menu {
    gap: 8px;
  }

  .nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
}
</style>