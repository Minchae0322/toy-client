<script setup>
import {RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import {webSocketService} from '@/services/webSocketService.js'
import {useAuth} from '@/composables/useAuth'
import GlobalConfirmDialog from '@/components/common/GlobalConfirmDialog.vue'
import LoginPromptModal from '@/components/common/LoginPromptModal.vue'
import {useConfirmDialog} from '@/composables/useConfirmDialog'
import NotificationDropdown from '@/components/notification/NotificationDropdown.vue'
import NotificationToast from '@/components/notification/NotificationToast.vue'
import ExpFeedback from '@/components/exp/ExpFeedback.vue'
import UserLevelTag from '@/components/identity/UserLevelTag.vue'
import UserBadgeInline from '@/components/identity/UserBadgeInline.vue'
import YogurtTierArt from '@/components/identity/YogurtTierArt.vue'
import {rewardsService} from '@/services/RewardsService.js'
import {getTierByLevel, getTierColor} from '@/data/levelSystemData.js'
import {registerFcm, unregisterFcm} from '@/services/fcmService.js'
import {useUserBlockStore} from '@/stores/userBlock.js'
import {Capacitor} from '@capacitor/core'
import {SplashScreen} from '@capacitor/splash-screen'
import {App as CapApp} from '@capacitor/app'
import {StatusBar, Style} from '@capacitor/status-bar'

const route = useRoute()
const router = useRouter()
const {user, isLoggedIn, isAdmin, logout, userId} = useAuth()
const {open, openLoginRequired} = useConfirmDialog()
const userBlockStore = useUserBlockStore()

const isLoggingOut = ref(false)
const wsStatus = ref('disconnected') // 'disconnected' | 'connecting' | 'connected' | 'error'
const wsConnected = computed(() => wsStatus.value === 'connected')
const wsConnecting = computed(() => wsStatus.value === 'connecting')
let unsubscribeWsStatus = null

const showAppSplash = ref(Capacitor.isNativePlatform() && isLoggedIn.value)

const isAuthPage = computed(() =>
    ['/login', '/register', '/oauth/callback'].includes(route.path)
)

const isChatRoute = computed(() => route.path.startsWith('/chat'))

const profileImageUrl = computed(() => {
  return user.value?.profilePicture?.fileUrl || null
})

// ===== 보상 데이터 (레벨/뱃지) =====
const userLevel = ref(null)
const userBadges = ref([])
const userTierArt = computed(() => {
  if (userLevel.value == null) return null
  return getTierByLevel(userLevel.value)?.art ?? 'plain'
})
const userTierColor = computed(() => {
  if (userLevel.value == null) return 'white'
  return getTierColor(userLevel.value)
})

const primaryBadgeId = computed(() => {
  const u = user.value
  const authBadge = u?.primaryBadgeId || u?.representativeBadgeId || (Array.isArray(u?.badgeIds) ? u.badgeIds[0] : null)
  if (authBadge) return authBadge
  const pinned = userBadges.value.find(b => b.pinned)
  return pinned?.badgeId || pinned?.id || userBadges.value[0]?.badgeId || userBadges.value[0]?.id || null
})

async function loadHeaderRewards() {
  try {
    const [rewardsRes, badgesRes] = await Promise.all([
      rewardsService.getMyRewards(),
      rewardsService.getMyBadges(),
    ])
    userLevel.value = rewardsRes?.data?.level ?? null
    userBadges.value = Array.isArray(badgesRes?.data) ? badgesRes.data : []
  } catch (e) {
    console.warn('[App] 헤더 보상 데이터 로딩 실패:', e)
  }
}

const syncWsStatus = () => {
  wsStatus.value = webSocketService.getConnectionState().status || 'disconnected'
}

const monitorWebSocketStatus = () => {
  syncWsStatus()
  if (unsubscribeWsStatus) {
    unsubscribeWsStatus()
  }
  unsubscribeWsStatus = webSocketService.onConnectionChange(() => {
    syncWsStatus()
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

const goToCollection = async () => {
  try {
    await router.push({ name: 'Collection' })
  } catch (error) {
    console.error('❌ 컬렉션 이동 실패:', error)
  }
}

function hideAppSplash() {
  showAppSplash.value = false
  if (Capacitor.isNativePlatform()) {
    SplashScreen.hide().catch(() => {})
  }
}

async function runSplashFlow() {
  if (!Capacitor.isNativePlatform()) {
    hideAppSplash()
    return
  }
  // 스플래시는 auth 체크만 끝나면 즉시 종료 — WS는 백그라운드에서 조용히 연결
  // (살짝 호흡감을 위해 최소 400ms만 유지)
  await new Promise(resolve => setTimeout(resolve, 400))
  hideAppSplash()
}

function ensureWsConnected() {
  if (!isLoggedIn.value) return
  if (webSocketService.isConnected()) return
  webSocketService.connect().catch(e => console.warn('[WS] 연결 실패:', e))
}

const appLifecycleHandlers = []
const visibilityHandler = () => {
  if (document.visibilityState === 'visible') {
    ensureWsConnected()
  } else {
    webSocketService.disconnect()
  }
}
const beforeUnloadHandler = () => {
  webSocketService.disconnect()
}

async function setupAppLifecycle() {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setStyle({ style: Style.Light })
      await StatusBar.setBackgroundColor({ color: '#ffffff' })
    } catch (e) {
      console.warn('[StatusBar] 스타일 적용 실패:', e)
    }
    const stateHandle = await CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        StatusBar.setStyle({ style: Style.Light }).catch(() => {})
        ensureWsConnected()
      } else {
        webSocketService.disconnect()
      }
    })
    appLifecycleHandlers.push(stateHandle)
  } else {
    document.addEventListener('visibilitychange', visibilityHandler)
    window.addEventListener('beforeunload', beforeUnloadHandler)
  }
}

onMounted(() => {
  // 리스너를 connect()보다 먼저 부착해야 'connecting' → 'connected' 전이를 놓치지 않음
  monitorWebSocketStatus()
  if (isLoggedIn.value) {
    webSocketService.connect().catch(e => console.warn('[WS] 연결 실패:', e))
    loadHeaderRewards()
    registerFcm().catch(e => console.warn('[FCM] 등록 실패:', e))
    userBlockStore.load(userId.value)
  }
  runSplashFlow()
  setupAppLifecycle()
})

watch(isLoggedIn, (newVal, oldVal) => {
  if (newVal === oldVal) return
  monitorWebSocketStatus()
  if (newVal) {
    loadHeaderRewards()
    webSocketService.connect().catch(e => console.warn('[WS] 연결 실패:', e))
    registerFcm().catch(e => console.warn('[FCM] 등록 실패:', e))
    userBlockStore.load(userId.value)
  } else {
    userLevel.value = null
    userBadges.value = []
    unregisterFcm().catch(e => console.warn('[FCM] 해제 실패:', e))
    webSocketService.disconnect()
    userBlockStore.clear()
  }
})

onUnmounted(() => {
  if (unsubscribeWsStatus) {
    unsubscribeWsStatus()
  }
  appLifecycleHandlers.forEach(h => { try { h.remove() } catch {} })
  appLifecycleHandlers.length = 0
  document.removeEventListener('visibilitychange', visibilityHandler)
  window.removeEventListener('beforeunload', beforeUnloadHandler)
  webSocketService.disconnect()
})
</script>

<template>
  <!-- 앱 스플래시 (네이티브 + 로그인 상태에서 WS 연결까지 표시) -->
  <transition name="splash-fade">
    <div v-if="showAppSplash" class="app-splash">
      <img src="/images/yogodde_01.png" alt="요거뜨" class="app-splash-logo" />
    </div>
  </transition>

  <!-- 헤더 -->
  <header v-if="!isAuthPage" class="header">
    <div class="header-content">
      <!-- 로고 -->
      <RouterLink to="/" class="logo">
        <img src="/images/logo5.png" alt="요거뜨" class="logo-image" />
      </RouterLink>

      <!-- 데스크톱 네비게이션 -->
      <nav class="nav-desktop">
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
              <div class="user-avatar" :class="{ connected: wsConnected, connecting: wsConnecting }">
                <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" />
                <span v-else>{{ (user?.nickname || user?.username)?.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="user-name-row">
                <span class="user-name">{{ user?.nickname || user?.username }}</span>
                <span
                  v-if="userLevel != null"
                  class="tier-click"
                  title="컬렉션으로 이동"
                  @click.stop="goToCollection"
                >
                  <UserLevelTag :level="userLevel" size="sm" variant="dark" />
                </span>
                <UserBadgeInline v-if="primaryBadgeId" :badge-id="primaryBadgeId" size="sm" />
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
        <!-- 알림 버튼 (로그인 시에만 표시) -->
        <NotificationDropdown v-if="isLoggedIn" />

        <button class="mobile-msg-btn" @click="handleChatClick" title="메시지">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
          </svg>
        </button>
        <div v-if="isLoggedIn" class="mobile-avatar-wrap" @click="goToProfile">
          <div class="mobile-avatar" :class="{ connected: wsConnected, connecting: wsConnecting }">
            <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" />
            <span v-else>{{ (user?.nickname || user?.username)?.charAt(0).toUpperCase() }}</span>
          </div>
          <span v-if="userLevel != null" class="mobile-level-badge">{{ userLevel }}</span>
        </div>
        <RouterLink v-else to="/login" class="nav-item mobile-auth-btn">로그인</RouterLink>
      </div>
    </div>

  </header>

  <!-- 메인 컨텐츠 -->
  <main :class="['main', { 'auth-page': isAuthPage }]">
    <RouterView v-slot="{ Component }">
      <KeepAlive :include="['FeedHomeView']">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </main>

  <!-- 푸터 -->
  <footer v-if="!isAuthPage" class="site-footer" :class="{ 'hide-on-mobile-chat': isChatRoute }">
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

  <!-- 로그인 유도 모달 -->
  <LoginPromptModal />

  <!-- 알림 토스트 -->
  <NotificationToast v-if="isLoggedIn" />

  <!-- EXP 지급 피드백 (burst + pill) -->
  <ExpFeedback />
</template>

<style scoped>
/* ===================== 기본 설정 ===================== */
/* font-family 는 main.css / index.html 의 html,body 에서 상속 */

/* ===================== 앱 스플래시 ===================== */
.app-splash {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
.app-splash-logo {
  width: min(32vw, 220px);
  height: auto;
  animation: app-splash-pulse 1.6s ease-in-out infinite;
}
@keyframes app-splash-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.96); }
}
.splash-fade-leave-active {
  transition: opacity 0.3s ease;
}
.splash-fade-leave-to {
  opacity: 0;
}

/* ===================== 헤더 ===================== */
.header {
  position: sticky;
  top: 0;
  background: #ffffff;
  border-bottom: 1px solid #ede9f8;
  z-index: 1000;
  /* iOS 노치/다이내믹 아일랜드 회피 — 일반 브라우저에서는 0이라 영향 없음 */
  padding-top: env(safe-area-inset-top);
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

.tier-avatar-wrap {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

.user-avatar.connecting {
  border-color: #f59e0b;
  animation: ws-pulse 1.2s ease-in-out infinite;
}

.user-avatar.connected {
  border-color: #00C853;
  box-shadow: 0 0 0 2px rgba(0, 200, 83, 0.18);
  animation: none;
}

@keyframes ws-pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.18); }
  50%      { box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.34); }
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
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.02em;
}

.tier-click {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  transition: transform 0.12s ease, opacity 0.12s ease;
}

.tier-click:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.tier-click:active {
  transform: translateY(0);
}

/* ===================== 모바일 헤더 우측 ===================== */
.nav-mobile {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-mobile .mobile-msg-btn,
.nav-mobile :deep(.notification-trigger) {
  width: 30px;
  height: 30px;
}

.mobile-avatar-wrap {
  position: relative;
  margin-left: 4px;
  cursor: pointer;
  display: inline-flex;
}

.mobile-level-badge {
  position: absolute;
  bottom: -3px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #0A0E1A;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #ffffff;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
  pointer-events: none;
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

.mobile-avatar.connecting {
  border-color: #f59e0b;
  animation: ws-pulse 1.2s ease-in-out infinite;
}

.mobile-avatar.connected {
  border-color: #00C853;
  box-shadow: 0 0 0 2px rgba(0, 200, 83, 0.18);
  animation: none;
}

.mobile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 모바일 로그인/로그아웃: PC와 동일한 .btn-ghost / .nav-item 스타일 사용, 폭만 살짝 조정 */
.mobile-auth-btn {
  margin-left: 4px;
  padding: 6px 8px;
  font-size: 12px;
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
  .site-footer.hide-on-mobile-chat {
    display: none;
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
    gap: 0;
  }
  .nav-mobile .mobile-msg-btn,
  .nav-mobile :deep(.notification-trigger) {
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