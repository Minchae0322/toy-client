<template>
  <header class="app-header">
    <!-- 🚨 디버깅 정보 -->
    <div v-if="showDebug" class="debug-info">
      <div>전역 로그인: <span :class="{ active: isLoggedIn }">{{ isLoggedIn ? '✅' : '❌' }}</span></div>
      <div>사용자: <span>{{ userInfo?.nickname || userInfo?.username || '없음' }}</span></div>
      <div>역할: <span>{{ userInfo?.role || '없음' }}</span></div>
      <div>토큰: <span :class="{ active: hasToken }">{{ hasToken ? '있음' : '없음' }}</span></div>
      <div>WebSocket: <span :class="{ active: wsConnected }">{{ wsConnected ? '🟢' : '🔴' }}</span></div>
    </div>

    <div class="header-container">
      <div class="logo">
        <RouterLink to="/" class="mz-title">
          <img src="/images/logo_name2.png" alt="요거뜨" class="logo-image" />
        </RouterLink>
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
          <RouterLink to="/" class="nav-link">홈</RouterLink>

          <!-- 관리자 메뉴 (드롭다운) -->
          <AdminMenu v-if="isAdmin" />

          <!-- 알림 드롭다운 -->
          <NotificationDropdown />

          <!-- 메시지 아이콘 -->
          <button class="message-btn" @click="goToChat" title="메시지">
            <svg class="message-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
            </svg>
            <span v-if="unreadMessageCount > 0" class="message-badge">{{ unreadMessageCount > 99 ? '99+' : unreadMessageCount }}</span>
          </button>

          <!-- 사용자 메뉴 -->
          <div class="user-menu">
            <!-- ✅ WebSocket 연결 상태 표시 -->
            <div
                class="connection-status"
                :class="{
                'connected': wsConnected,
                'disconnected': !wsConnected,
                'error': wsError
              }"
                @click="debugWebSocketStatus"
                :title="`WebSocket: ${wsConnected ? '연결됨' : '끊어짐'}`"
            >
              <div class="status-dot"></div>
              <span class="status-text">{{ getConnectionText() }}</span>
            </div>

            <div class="user-info">
              <div class="user-avatar">
                <img
                  :src="getUserProfileImage()"
                  :alt="userInfo?.nickname || userInfo?.username"
                  @error="handleImageError"
                />
              </div>
              <span class="username">{{ userInfo?.nickname || '사용자' }}</span>
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
import { RouterLink, useRouter } from 'vue-router'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { webSocketService } from '@/services/webSocketService.js'
import * as authUtils from '@/utils/auth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import NotificationDropdown from '@/components/notification/NotificationDropdown.vue'
import AdminMenu from '@/components/layout/AdminMenu.vue'

const { open } = useConfirmDialog()
const router = useRouter()

// 읽지 않은 메시지 수
const unreadMessageCount = ref(0)

// 채팅 페이지로 이동
const goToChat = () => {
  router.push({ name: 'Chat' })
}

// 디버깅 모드
const showDebug = ref(import.meta.env.DEV)

// 🔥 useAuth에서 전역 상태 직접 사용
const { user: userInfo, isLoggedIn, isAdmin, logout } = useAuth()

// 로그아웃 진행 상태
const isLoggingOut = ref(false)

// WebSocket 연결 상태
const wsConnected = ref(false)
const wsError = ref(false)
let unsubscribeWsStatus = null

// 토큰 존재 여부
const hasToken = computed(() => {
  const sessionToken = sessionStorage.getItem('access_token')
  const localToken = localStorage.getItem('access_token')
  return !!(sessionToken || localToken)
})

// WebSocket 연결 텍스트
const getConnectionText = () => {
  if (wsError.value) return '오류'
  if (wsConnected.value) return '온라인'
  return '오프라인'
}

// 프로필 이미지 가져오기
const getUserProfileImage = () => {
  if (userInfo.value?.profileImage) {
    return userInfo.value.profileImage
  }
  // 기본 프로필 이미지 (UI Avatars API 사용)
  const username = userInfo.value?.nickname || userInfo.value?.username || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=9333ea&color=fff&size=128&bold=true`
}

// 이미지 로드 실패 시 처리
const handleImageError = (e) => {
  const username = userInfo.value?.nickname || userInfo.value?.username || 'User'
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=9333ea&color=fff&size=128&bold=true`
}

// ✅ WebSocket 상태 모니터링 설정
const setupWebSocketStatusMonitoring = () => {
  console.log('📶 [AppHeader] WebSocket 모니터링 설정')

  try {
    if (!webSocketService) {
      console.warn('⚠️ [AppHeader] webSocketService 없음')
      wsError.value = true
      return
    }

    // 초기 상태 설정
    if (typeof webSocketService.isConnected === 'function') {
      wsConnected.value = webSocketService.isConnected()
    }

    // 연결 상태 변화 리스너 (기존 리스너 정리 후 등록)
    if (typeof webSocketService.onConnectionChange === 'function') {
      if (unsubscribeWsStatus) {
        unsubscribeWsStatus()
      }
      unsubscribeWsStatus = webSocketService.onConnectionChange((connected) => {
        console.log('📶 [AppHeader] WebSocket 상태 변경:', connected)
        wsConnected.value = connected
        wsError.value = false
      })
    }

    // 읽지 않은 메시지 수 업데이트 리스너
    if (typeof webSocketService.onUnreadCountChange === 'function') {
      webSocketService.onUnreadCountChange((count) => {
        unreadMessageCount.value = count
      })
    }

    console.log('✅ [AppHeader] WebSocket 모니터링 완료')
  } catch (error) {
    console.error('❌ [AppHeader] WebSocket 모니터링 오류:', error)
    wsError.value = true
  }
}

// WebSocket 디버깅
const debugWebSocketStatus = () => {
  console.group('🔍 [AppHeader] WebSocket 디버깅')
  console.log('webSocketService 존재:', !!webSocketService)

  if (webSocketService) {
    try {
      console.log('isConnected:', typeof webSocketService.isConnected === 'function' ? webSocketService.isConnected() : 'method not found')
      console.log('onConnectionChange:', typeof webSocketService.onConnectionChange)

      if (typeof webSocketService.getDebugInfo === 'function') {
        console.log('WebSocket 디버그 정보:', webSocketService.getDebugInfo())
      }
    } catch (error) {
      console.error('WebSocket 메서드 호출 오류:', error)
    }
  }

  console.log('컴포넌트 상태:', {
    wsConnected: wsConnected.value,
    wsError: wsError.value,
    isLoggedIn: isLoggedIn.value,
    hasToken: hasToken.value
  })

  console.groupEnd()
}

// 로그아웃 처리
const handleLogout = async () => {
  const confirmed = await open({ type: 'confirm', title: '확인', message: '정말 로그아웃하시겠습니까?' })
  if (confirmed) {
    isLoggingOut.value = true
    try {
      console.log('🚪 [AppHeader] 로그아웃 시작')
      await logout()
      console.log('✅ [AppHeader] 로그아웃 완료')
    } catch (error) {
      console.error('❌ [AppHeader] 로그아웃 실패:', error)
    } finally {
      isLoggingOut.value = false
      wsConnected.value = false
    }
  }
}

// ✅ 커스텀 인증 상태 변경 이벤트 리스너
const handleAuthStateChange = (event) => {
  console.log('🎯 [AppHeader] 커스텀 인증 상태 변경 감지:', event.detail)

  const { user, loggedIn } = event.detail

  if (loggedIn && user) {
    console.log('✅ [AppHeader] 로그인 상태 감지 - WebSocket 연결 시도')
    setTimeout(() => {
      setupWebSocketStatusMonitoring()
    }, 1000)
  } else {
    console.log('❌ [AppHeader] 로그아웃 상태 감지 - WebSocket 정리')
    wsConnected.value = false
    wsError.value = false
  }
}

// ✅ 로그인 상태 변화 감지 (watch 사용)
watch(isLoggedIn, (newValue, oldValue) => {
  console.log(`🔑 [AppHeader] useAuth 로그인 상태 변화: ${oldValue} → ${newValue}`)

  if (newValue && !oldValue) {
    // 로그인됨
    console.log('🔌 [AppHeader] 로그인 감지 - WebSocket 설정')
    setTimeout(() => setupWebSocketStatusMonitoring(), 1000)
  } else if (!newValue && oldValue) {
    // 로그아웃됨
    console.log('🔌 [AppHeader] 로그아웃 감지 - WebSocket 정리')
    wsConnected.value = false
    wsError.value = false
  }
}, { immediate: false })

// ✅ 사용자 정보 변화 감지
watch(userInfo, (newUser, oldUser) => {
  if (newUser && (!oldUser || newUser.id !== oldUser?.id)) {
    console.log('👤 [AppHeader] 사용자 정보 변경 감지:', newUser.nickname || newUser.username)
  }
}, { immediate: false, deep: true })

// 컴포넌트 마운트
onMounted(() => {
  console.log('🚀 [AppHeader] 마운트 시작')

  // 🔍 초기 상태 로깅
  console.log('🔍 [AppHeader] 초기 상태:', {
    isLoggedIn: isLoggedIn.value,
    userInfo: userInfo.value,
    hasToken: hasToken.value
  })

  // 커스텀 이벤트 리스너 등록
  window.addEventListener('auth-state-changed', handleAuthStateChange)

  // 이미 로그인되어 있으면 WebSocket 설정
  if (isLoggedIn.value) {
    console.log('🔌 [AppHeader] 초기 로그인 상태 - WebSocket 설정')
    setupWebSocketStatusMonitoring()
  }

  console.log('✅ [AppHeader] 마운트 완료')
})

// 언마운트 시 정리
onUnmounted(() => {
  window.removeEventListener('auth-state-changed', handleAuthStateChange)
  if (unsubscribeWsStatus) {
    unsubscribeWsStatus()
    unsubscribeWsStatus = null
  }
  console.log('🧹 [AppHeader] 이벤트 리스너 정리 완료')
})
</script>

<style scoped>
.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 11px;
  z-index: 9999;
  line-height: 1.6;
  font-family: monospace;
  min-width: 220px;
}

.debug-info div {
  margin: 3px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-info .active {
  color: var(--c-success);
  font-weight: bold;
}

.app-header {
  background: var(--bg-elevated);
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
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-image {
  height: 40px;
  width: auto;

  object-fit: contain;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.nav-link:hover {
  background: var(--border-default);
  color: var(--c-brand);
}

.nav-link.router-link-active {
  background: var(--c-brand);
  color: white;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* ✅ WebSocket 연결 상태 스타일 */
.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.connection-status:hover {
  transform: scale(1.02);
}

.connection-status.connected {
  background: rgba(34, 197, 94, 0.1);
  color: var(--c-success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.connection-status.disconnected {
  background: rgba(156, 163, 175, 0.1);
  color: var(--c-text-500);
  border: 1px solid rgba(156, 163, 175, 0.2);
}

.connection-status.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--c-danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
}

.connection-status.connected .status-dot {
  background: var(--c-success);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.connection-status.connected .status-dot::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-success);
  animation: pulse 2s infinite;
}

.connection-status.disconnected .status-dot {
  background: var(--c-text-400);
}

.connection-status.error .status-dot {
  background: var(--c-danger);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.status-text {
  font-size: 11px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-strong);
  transition: all 0.3s;
  flex-shrink: 0;
  background: var(--border-default);
}

.user-avatar:hover {
  border-color: var(--c-brand);
  transform: scale(1.05);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  font-weight: 600;
  color: var(--text-primary);
}

.admin-badge {
  background: linear-gradient(135deg, var(--c-heat), #f39c12);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.logout-btn {
  background: var(--c-danger);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: var(--c-danger);
}

.loading {
  color: var(--c-text-500);
  font-style: italic;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 메시지 버튼 */
.message-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-btn:hover {
  background: var(--border-default);
}

.message-btn:hover .message-icon {
  color: var(--c-brand);
}

.message-icon {
  width: 24px;
  height: 24px;
  color: var(--c-text-600);
  transition: color 0.2s ease;
}

.message-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--c-danger);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }

  .main-nav {
    gap: 12px;
  }

  .connection-status .status-text {
    display: none;
  }

  .user-info .username {
    display: none;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
  }
}
</style>