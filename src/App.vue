<script setup>
import {RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import {webSocketService} from '@/services/webSocketService.js'
import {useAuth} from '@/composables/useAuth'
import GlobalConfirmDialog from '@/components/common/GlobalConfirmDialog.vue'
import {useConfirmDialog} from '@/composables/useConfirmDialog'
import NotificationDropdown from '@/components/notification/NotificationDropdown.vue'
import NotificationToast from '@/components/notification/NotificationToast.vue'
import UserLevelTag from '@/components/identity/UserLevelTag.vue'
import UserBadgeInline from '@/components/identity/UserBadgeInline.vue'

const route = useRoute()
const router = useRouter()
const {user, isLoggedIn, isAdmin, logout, userId} = useAuth()
const {open, openLoginRequired} = useConfirmDialog()

const isLoggingOut = ref(false)
const wsConnected = ref(false)
let unsubscribeWsStatus = null

const isAuthPage = computed(() =>
    ['/login', '/register', '/oauth/callback'].includes(route.path)
)

const profileImageUrl = computed(() => {
  return user.value?.profilePicture?.fileUrl || null
})

const primaryBadgeId = computed(() => {
  const u = user.value
  return u?.primaryBadgeId || u?.representativeBadgeId || (Array.isArray(u?.badgeIds) ? u.badgeIds[0] : null)
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
  isLoggingOut.value = true
  try {
    webSocketService.disconnect()
  } catch {}
  await logout()
  isLoggingOut.value = false
}

const handleCarrierClick = async () => {
  const confirmed = await openLoginRequired('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')
  if (confirmed) {
    router.push({ name: 'Login', query: { redirect: '/carrier' } })
  }
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
      <RouterLink to="/" class="logo">
        <img src="/images/logo5.png" alt="요거뜨" class="logo-image" />
      </RouterLink>

      <!-- 데스크톱 네비게이션 -->
      <nav class="nav-desktop">
        <!-- 캐리어 꾸미기 버튼 (항상 표시) -->
        <component
          :is="isLoggedIn ? 'RouterLink' : 'button'"
          :to="isLoggedIn ? '/carrier' : undefined"
          class="carrier-btn"
          title="캐리어 꾸미기"
          @click="!isLoggedIn && handleCarrierClick()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a4 4 0 0 0-8 0v2"/>
            <circle cx="12" cy="15" r="2"/>
          </svg>
          <span>캐리어 꾸미기</span>
        </component>

        <!-- 알림 버튼 (로그인 시에만 표시) -->
        <NotificationDropdown v-if="isLoggedIn" />

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
              <RouterLink to="/admin/bulk-product" class="dropdown-item">벌크 제품 등록</RouterLink>
              <RouterLink to="/admin/category" class="dropdown-item">카테고리</RouterLink>
            </div>
          </div>

          <div class="nav-divider"></div>

          <div class="user-menu">
            <div class="user-info" @click="goToProfile">
              <div class="user-avatar" :class="{ connected: wsConnected }">
                <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" />
                <span v-else>{{ (user?.nickname || user?.username)?.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="user-name-row">
                <span class="user-name">{{ user?.nickname || user?.username }}</span>
                <UserLevelTag v-if="user?.level != null" :level="user.level" size="xs" variant="dark" />
                <UserBadgeInline v-if="primaryBadgeId" :badge-id="primaryBadgeId" size="xs" />
              </div>
            </div>
            <button @click="handleLogout" class="btn-ghost" :disabled="isLoggingOut">
              {{ isLoggingOut ? '...' : '로그아웃' }}
            </button>
          </div>
        </template>
      </nav>

      <!-- 모바일 우측 영역 -->
      <div class="nav-mobile">
        <component
          :is="isLoggedIn ? 'RouterLink' : 'button'"
          :to="isLoggedIn ? '/carrier' : undefined"
          class="mobile-carrier-btn"
          title="캐리어 꾸미기"
          @click="!isLoggedIn && handleCarrierClick()"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a4 4 0 0 0-8 0v2"/>
            <circle cx="12" cy="15" r="2"/>
          </svg>
          <span>캐꾸</span>
        </component>

        <!-- 알림 버튼 (로그인 시에만 표시) -->
        <NotificationDropdown v-if="isLoggedIn" />

        <button class="mobile-msg-btn" @click="handleChatClick" title="메시지">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
          </svg>
        </button>
        <div v-if="isLoggedIn" class="mobile-avatar" :class="{ connected: wsConnected }" @click="goToProfile">
          <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" />
          <span v-else>{{ (user?.nickname || user?.username)?.charAt(0).toUpperCase() }}</span>
        </div>
      </div>
    </div>

  </header>

  <!-- 메인 컨텐츠 -->
  <main :class="['main', { 'auth-page': isAuthPage }]">
    <RouterView/>
  </main>

  <!-- 푸터 -->
  <footer v-if="!isAuthPage" class="site-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <RouterLink to="/" class="footer-logo">요거뜨</RouterLink>
        <div class="footer-links">
          <RouterLink to="/about">소개</RouterLink>
          <RouterLink to="/terms">이용약관</RouterLink>
          <RouterLink to="/privacy">개인정보처리방침</RouterLink>
        </div>
      </div>
      <p class="footer-copy">&copy; {{ new Date().getFullYear() }} 요거뜨(yogurtte). All rights reserved.</p>
    </div>
  </footer>

  <!-- 글로벌 확인 다이얼로그 -->
  <GlobalConfirmDialog />

  <!-- 알림 토스트 -->
  <NotificationToast v-if="isLoggedIn" />
</template>

<style scoped>
/* ===================== 기본 설정 ===================== */
* {
  font-family: 'SUIT', -apple-system, "system-ui", "Segoe UI", "Malgun Gothic", "맑은 고딕", sans-serif !important;
}

/* ===================== 헤더 ===================== */
.header {
  position: sticky;
  top: 0;
  background: #ffffff;
  border-bottom: 1px solid #ede9f8;
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
  gap: 2px;
}

.nav-item {
  text-decoration: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 7px;
  transition: all 0.15s ease;
}

.nav-item:hover {
  color: #111827;
  background: #f5f5f7;
}

.nav-item.router-link-active {
  color: #7c3aed;
  font-weight: 600;
  background: #f3e8ff;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
  margin: 0 10px;
  flex-shrink: 0;
}

/* ===================== 버튼 ===================== */
.btn-primary {
  text-decoration: none;
  background: #7c3aed;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 7px;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: #6d28d9;
}

.btn-ghost {
  background: transparent;
  color: #9ca3af;
  border: none;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-ghost:hover:not(:disabled) {
  color: #4b5563;
  background: transparent;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: transparent;
  border: none;
  color: #6b7280;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-trigger:hover {
  color: #7c3aed;
  background: #f5f3ff;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #ffffff;
  border: 1px solid #ede9f8;
  border-radius: 10px;
  padding: 4px;
  min-width: 148px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
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
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 12px;
  border-radius: 7px;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: #f5f5f7;
  color: #111827;
}

.dropdown-item.router-link-active {
  background: #f3e8ff;
  color: #7c3aed;
  font-weight: 600;
}

/* ===================== 알림 버튼 배지 크기 ===================== */
:deep(.notification-badge) {
  min-width: 16px !important;
  height: 16px !important;
  font-size: 9px !important;
  top: -3px !important;
  right: -3px !important;
}

/* ===================== 캐리어 버튼 ===================== */
.carrier-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  margin-right: auto;
  border: 1.5px solid #7c3aed;
  background: transparent;
  border-radius: 8px;
  color: #7c3aed;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.carrier-btn:hover {
  color: #ffffff;
  background: #7c3aed;
  border-color: #7c3aed;
}

.carrier-btn.router-link-active {
  color: #ffffff;
  background: #7c3aed;
  border-color: #7c3aed;
}

.mobile-carrier-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  margin-right: auto;
  border: 1.5px solid #7c3aed;
  background: transparent;
  border-radius: 8px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.mobile-carrier-btn:hover {
  color: #ffffff;
  background: #7c3aed;
  border-color: #7c3aed;
}

.mobile-carrier-btn.router-link-active {
  color: #ffffff;
  background: #7c3aed;
  border-color: #7c3aed;
}

/* ===================== 메시지 버튼 ===================== */
.msg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  border-radius: 7px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.msg-btn svg {
  width: 17px;
  height: 17px;
}

.msg-btn:hover {
  color: #7c3aed;
  background: #f5f3ff;
}

.mobile-msg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  border-radius: 7px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mobile-msg-btn svg {
  width: 17px;
  height: 17px;
}

.mobile-msg-btn:hover {
  color: #7c3aed;
  background: #f5f3ff;
}

/* ===================== 유저 메뉴 (데스크톱) ===================== */
.user-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.user-info:hover {
  background: #f5f5f7;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: #7c3aed;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  overflow: hidden;
  border: 1.5px solid rgba(124, 58, 237, 0.2);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  flex-shrink: 0;
}

.user-avatar.connected {
  border-color: #00C853;
  box-shadow: 0 0 0 2px rgba(0, 200, 83, 0.18);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* ===================== 모바일 헤더 우측 ===================== */
.nav-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mobile-avatar {
  width: 30px;
  height: 30px;
  background: #7c3aed;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  overflow: hidden;
  cursor: pointer;
  border: 1.5px solid rgba(124, 58, 237, 0.2);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.mobile-avatar.connected {
  border-color: #00C853;
  box-shadow: 0 0 0 2px rgba(0, 200, 83, 0.18);
}

.mobile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


/* ===================== 애니메이션 ===================== */
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
  min-height: calc(100vh - 66px);
  background: #ffffff;
}

.main.auth-page {
  background: #ffffff;
}

/* ===================== 푸터 ===================== */
.site-footer {
  background: #ffffff;
  border-top: 1px solid #ede9f8;
  padding: 24px 24px 32px;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.footer-logo {
  font-size: 15px;
  font-weight: 700;
  color: #888;
  text-decoration: none;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  font-size: 13px;
  color: #888;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.footer-links a:hover {
  color: #333;
}

.footer-copy {
  font-size: 12px;
  color: #bbb;
  margin: 0;
}

/* ===================== 반응형 ===================== */
@media (max-width: 767px) {
  .logo-image {
    margin-left: 0;
  }
  .site-footer {
    padding-bottom: 100px;
  }
}

@media (max-width: 380px) {
  .header-content {
    padding: 0 8px;
    height: 56px;
  }
  .logo-image {
    height: 30px;
    margin-left: 0;
  }
  .nav-mobile {
    gap: 4px;
  }
  .mobile-carrier-btn {
    padding: 4px 8px;
    font-size: 11px;
    gap: 2px;
  }
  .mobile-carrier-btn svg {
    width: 12px;
    height: 12px;
  }
  .mobile-msg-btn {
    width: 28px;
    height: 28px;
  }
  .mobile-msg-btn svg {
    width: 15px;
    height: 15px;
  }
  .mobile-avatar {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
}

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