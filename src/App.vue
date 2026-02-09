<script setup>
import {RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import {webSocketService} from '@/services/webSocketService.js'
import {useAuth} from '@/composables/useAuth'
import GlobalConfirmDialog from '@/components/common/GlobalConfirmDialog.vue'
import {useConfirmDialog} from '@/composables/useConfirmDialog'

const route = useRoute()
const router = useRouter()
const {user, isLoggedIn, isAdmin, logout, userId} = useAuth()
const {open, openLoginRequired} = useConfirmDialog()

const isLoggingOut = ref(false)
const wsConnected = ref(false)
const showMobileMenu = ref(false)
let unsubscribeWsStatus = null

const isAuthPage = computed(() =>
    ['/login', '/register', '/oauth/callback'].includes(route.path)
)

const profileImageUrl = computed(() => {
  return user.value?.profilePicture?.fileUrl || null
})

const monitorWebSocketStatus = () => {
  wsConnected.value = webSocketService.isConnected()
  if (unsubscribeWsStatus) {
    unsubscribeWsStatus()
  }
  unsubscribeWsStatus = webSocketService.onConnectionChange((connected) => {
    wsConnected.value = connected
  })
}

const handleLogout = async () => {
  showMobileMenu.value = false
  isLoggingOut.value = true
  try {
    webSocketService.disconnect()
  } catch {}
  await logout()
  isLoggingOut.value = false
}

const handleChatClick = async () => {
  if (isLoggedIn.value) {
    router.push({ name: 'Chat' })
  } else {
    const confirmed = await openLoginRequired('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')
    if (confirmed) {
      router.push({ name: 'Login', query: { redirect: '/chat' } })
    }
  }
}

const goToProfile = async () => {
  showMobileMenu.value = false
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
      <RouterLink to="/dashboard" class="logo">
        <img src="/images/logo5.png" alt="요거뜨" class="logo-image" />
      </RouterLink>

      <!-- 데스크톱 네비게이션 -->
      <nav class="nav-desktop">
        <!-- 메시지 버튼 (항상 표시) -->
        <button class="msg-btn" @click="handleChatClick" title="메시지">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
          </svg>
        </button>

        <template v-if="!isLoggedIn">
          <RouterLink to="/login" class="nav-item">로그인</RouterLink>
        </template>

        <template v-else>
          <div v-if="isAdmin" class="dropdown">
            <button class="dropdown-trigger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
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

          <div class="user-menu">
            <div class="ws-status" :class="{ connected: wsConnected }">
              <span class="ws-dot"></span>
              <span class="ws-label">{{ wsConnected ? '연결됨' : '끊김' }}</span>
            </div>
            <div class="user-info" @click="goToProfile">
              <div class="user-avatar">
                <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" />
                <span v-else>{{ (user?.nickname || user?.username)?.charAt(0).toUpperCase() }}</span>
              </div>
              <span class="user-name">{{ user?.nickname || user?.username }}</span>
            </div>
            <button @click="handleLogout" class="btn-ghost" :disabled="isLoggingOut">
              {{ isLoggingOut ? '...' : '로그아웃' }}
            </button>
          </div>
        </template>
      </nav>

      <!-- 모바일 우측 영역 -->
      <div class="nav-mobile">
        <button class="mobile-msg-btn" @click="handleChatClick" title="메시지">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
          </svg>
        </button>
        <template v-if="isLoggedIn">
          <div class="mobile-ws-dot" :class="{ connected: wsConnected }"></div>
          <div class="mobile-avatar" @click="goToProfile">
            <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" />
            <span v-else>{{ (user?.nickname || user?.username)?.charAt(0).toUpperCase() }}</span>
          </div>
        </template>
        <button class="mobile-menu-btn" @click="showMobileMenu = !showMobileMenu">
          <svg v-if="!showMobileMenu" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 모바일 메뉴 -->
    <Transition name="mobile-menu">
      <div v-if="showMobileMenu" class="mobile-menu">
        <!-- 로그인 상태: 유저 카드 -->
        <div v-if="isLoggedIn" class="mobile-user-card" @click="goToProfile">
          <div class="mobile-user-avatar">
            <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" />
            <span v-else>{{ (user?.nickname || user?.username)?.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="mobile-user-detail">
            <span class="mobile-user-name">{{ user?.nickname || user?.username }}</span>
            <span class="mobile-user-status" :class="{ connected: wsConnected }">
              <span class="status-dot"></span>
              {{ wsConnected ? '온라인' : '오프라인' }}
            </span>
          </div>
          <svg class="mobile-user-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- 메뉴 리스트 -->
        <div class="mobile-menu-list">
          <template v-if="!isLoggedIn">
            <RouterLink to="/login" class="mobile-menu-item" @click="showMobileMenu = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              로그인
            </RouterLink>
          </template>

          <template v-else>
            <RouterLink to="/one-mouth/list" class="mobile-menu-item" @click="showMobileMenu = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              홈
            </RouterLink>

            <!-- 관리자 섹션 -->
            <template v-if="isAdmin">
              <div class="mobile-menu-divider"></div>
              <div class="mobile-menu-label">관리자</div>
              <RouterLink to="/admin" class="mobile-menu-item" @click="showMobileMenu = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                </svg>
                대시보드
              </RouterLink>
              <RouterLink to="/admin/users" class="mobile-menu-item" @click="showMobileMenu = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                사용자
              </RouterLink>
              <RouterLink to="/admin/products" class="mobile-menu-item" @click="showMobileMenu = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                상품 관리
              </RouterLink>
              <RouterLink to="/admin/category" class="mobile-menu-item" @click="showMobileMenu = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                카테고리
              </RouterLink>
            </template>
          </template>
        </div>

        <!-- 로그아웃 버튼 -->
        <div v-if="isLoggedIn" class="mobile-menu-footer">
          <button @click="handleLogout" class="mobile-logout-btn" :disabled="isLoggingOut">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ isLoggingOut ? '로그아웃 중...' : '로그아웃' }}
          </button>
        </div>
      </div>
    </Transition>
  </header>

  <!-- 메인 컨텐츠 -->
  <main :class="['main', { 'auth-page': isAuthPage }]">
    <RouterView/>
  </main>

  <!-- 모바일 메뉴 오버레이 -->
  <Transition name="fade">
    <div v-if="showMobileMenu" class="mobile-overlay" @click="showMobileMenu = false"></div>
  </Transition>

  <!-- 글로벌 확인 다이얼로그 -->
  <GlobalConfirmDialog />
</template>

<style scoped>
/* ===================== 기본 설정 ===================== */
* {
  font-family: 'SUIT-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
}

/* ===================== 헤더 ===================== */
.header {
  position: sticky;
  top: 0;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  z-index: 1000;
}



.header-content {
  height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  max-width: 1920px;
  margin: 0 auto;
}

/* ===================== 로고 ===================== */
.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-image {
  height: 37px;
  width: auto;
  object-fit: contain;
  margin-left: 14px;
}

/* ===================== 데스크톱 네비게이션 ===================== */
.nav-desktop {
  display: none;
  align-items: center;
  gap: 4px;
}

.nav-item {
  text-decoration: none;
  color: #888888;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.nav-item:hover {
  color: #333333;
  background: #f5f5f5;
}

.nav-item.router-link-active {
  color: #9933EA;
  font-weight: 600;
  background: #FAF5FF;
}

.nav-divider {
  width: 1px;
  height: 16px;
  background: #e5e5e5;
  margin: 0 8px;
}

/* ===================== 버튼 ===================== */
.btn-primary {
  text-decoration: none;
  background: #9933EA;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: #8529D4;
}

.btn-ghost {
  background: transparent;
  color: #aaaaaa;
  border: none;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-ghost:hover:not(:disabled) {
  color: #555555;
  background: #f5f5f5;
}

.btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===================== 드롭다운 ===================== */
.dropdown {
  position: relative;
}

.dropdown-trigger {
  background: transparent;
  border: none;
  color: #888888;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-trigger:hover {
  color: #9933EA;
  background: #FAF5FF;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 4px;
  min-width: 140px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: all 0.15s ease;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  text-decoration: none;
  color: #666666;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 12px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: #f5f5f5;
  color: #222222;
}

.dropdown-item.router-link-active {
  background: #FAF5FF;
  color: #9933EA;
  font-weight: 600;
}

/* ===================== 메시지 버튼 ===================== */
.msg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: #FAF5FF;
  border-radius: 10px;
  color: #9933EA;
  cursor: pointer;
  transition: all 0.15s ease;
}

.msg-btn:hover {
  color: #ffffff;
  background: #9933EA;
}

.mobile-msg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  background: #FAF5FF;
  border-radius: 10px;
  color: #9933EA;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mobile-msg-btn:hover {
  color: #ffffff;
  background: #9933EA;
}

/* ===================== 유저 메뉴 (데스크톱) ===================== */
.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ws-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 20px;
  background: #f5f5f5;
}

.ws-status.connected {
  background: rgba(0, 200, 83, 0.08);
}

.ws-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cccccc;
}

.ws-status.connected .ws-dot {
  background: #00C853;
}

.ws-label {
  font-size: 11px;
  font-weight: 500;
  color: #aaaaaa;
}

.ws-status.connected .ws-label {
  color: #00C853;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: #9933EA;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #222222;
}

/* ===================== 모바일 헤더 우측 ===================== */
.nav-mobile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-ws-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
}

.mobile-ws-dot.connected {
  background: #00C853;
  box-shadow: 0 0 6px rgba(0, 200, 83, 0.5);
}

.mobile-avatar {
  width: 32px;
  height: 32px;
  background: #9933EA;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  cursor: pointer;
}

.mobile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #333;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.mobile-menu-btn:hover {
  background: #f5f5f5;
}

/* ===================== 모바일 메뉴 ===================== */
.mobile-menu {
  position: fixed;
  top: 57px;
  right: 0;
  width: 280px;
  max-height: calc(100vh - 57px);
  background: #ffffff;
  border-left: 1px solid #f0f0f0;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
  z-index: 999;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.mobile-overlay {
  position: fixed;
  top: 57px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
}

/* 유저 카드 */
.mobile-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #FAF5FF;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.mobile-user-avatar {
  width: 44px;
  height: 44px;
  background: #9933EA;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;
  overflow: hidden;
}

.mobile-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-user-name {
  font-size: 15px;
  font-weight: 700;
  color: #111;
}

.mobile-user-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: #aaa;
}

.mobile-user-status.connected {
  color: #00C853;
}

.mobile-user-status .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ddd;
}

.mobile-user-status.connected .status-dot {
  background: #00C853;
}

.mobile-user-arrow {
  color: #ccc;
}

/* 메뉴 리스트 */
.mobile-menu-list {
  padding: 8px;
  flex: 1;
}

.mobile-menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 8px 0;
}

.mobile-menu-label {
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  text-decoration: none;
  color: #444;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.mobile-menu-item svg {
  color: #888;
  flex-shrink: 0;
}

.mobile-menu-item:hover {
  background: #f5f5f5;
}

.mobile-menu-item.router-link-active {
  background: #FAF5FF;
  color: #9933EA;
  font-weight: 600;
}

.mobile-menu-item.router-link-active svg {
  color: #9933EA;
}

.mobile-menu-item.highlight {
  background: #9933EA;
  color: #fff;
  font-weight: 600;
  margin-top: 4px;
}

.mobile-menu-item.highlight svg {
  color: #fff;
}

.mobile-menu-item.highlight:hover {
  background: #8529D4;
}

/* 로그아웃 버튼 */
.mobile-menu-footer {
  padding: 8px;
  border-top: 1px solid #f0f0f0;
}

.mobile-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  color: #888;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mobile-logout-btn:hover:not(:disabled) {
  background: #eee;
  color: #555;
}

.mobile-logout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===================== 애니메이션 ===================== */
.mobile-menu-enter-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.mobile-menu-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===================== 메인 컨텐츠 ===================== */
.main {
  min-height: calc(100vh - 56px);
  background: #ffffff;
}

.main.auth-page {
  background: #ffffff;
}

/* ===================== 반응형 ===================== */
@media (min-width: 768px) {
  .header-content {
    padding: 0 2rem;
  }

  .nav-desktop {
    display: flex;
  }

  .nav-mobile {
    display: none;
  }

  .mobile-menu,
  .mobile-overlay {
    display: none;
  }
}

@media (min-width: 1280px) {
  .header-content {
    padding: 0 3rem;
  }
}

@media (min-width: 1920px) {
  .header-content {
    padding: 0 4rem;
  }
}
</style>