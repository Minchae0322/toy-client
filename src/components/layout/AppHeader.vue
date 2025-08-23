<template>
  <header class="app-header">
    <!-- 🚨 디버깅 정보 (개발 중에만 사용) -->
    <div v-if="showDebug" class="debug-info">
      <div>로그인: {{ isLoggedIn }}</div>
      <div>관리자: {{ isAdmin }}</div>
      <div>사용자: {{ userInfo?.username }}</div>
      <div>역할: {{ userInfo?.role }}</div>
      <div>토큰: {{ hasToken ? '있음' : '없음' }}</div>
      <div>WebSocket: {{ wsConnected ? '🟢 연결됨' : '🔴 끊김' }}</div>
      <div>WS Service: {{ wsServiceExists ? '✅ 존재' : '❌ 없음' }}</div>
      <div>WS 초기화: {{ wsInitialized ? '✅ 완료' : '❌ 미완료' }}</div>
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
        <template v-else-if="!displayIsLoggedIn">
          <RouterLink to="/login" class="nav-link">로그인</RouterLink>
          <RouterLink to="/register" class="nav-link">회원가입</RouterLink>
        </template>

        <!-- 로그인한 경우 -->
        <template v-else>
          <RouterLink to="/home" class="nav-link">홈</RouterLink>
          <RouterLink to="/one-mouth-list" class="nav-link">한입거리</RouterLink>
          <RouterLink to="/sell" class="nav-link">판매하기</RouterLink>

          <!-- 🎯 관리자 메뉴 -->
          <div v-if="displayIsAdmin" class="admin-menu">
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
            <!-- ✅ WebSocket 연결 상태 표시 (항상 표시) -->
            <div
                class="connection-status"
                :class="{
                'connected': wsConnected,
                'disconnected': !wsConnected,
                'error': wsError
              }"
                @click="debugWebSocketStatus"
                :title="`WebSocket: ${wsConnected ? '연결됨' : '끊어짐'} (클릭으로 디버그)`"
            >
              <div class="status-dot"></div>
              <span class="status-text">{{ getConnectionText() }}</span>
            </div>

            <div class="user-info">
              <span class="username">{{ displayUserInfo?.username }}</span>
              <span v-if="displayIsAdmin" class="admin-badge">관리자</span>
            </div>
            <button @click="handleLogout" class="logout-btn">로그아웃</button>
          </div>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { webSocketService } from '@/services/webSocketService.js'
import * as authUtils from '@/utils/auth.js'

// 디버깅 모드 (개발 중에만 true로 설정)
const showDebug = ref(import.meta.env.DEV) // 개발환경에서만 디버그 정보 표시

const { userInfo, isLoggedIn, isAdmin, logout, checkAuthStatus } = useAuth()

// 로그아웃 진행 상태
const isLoggingOut = ref(false)

// ✅ WebSocket 연결 상태 (더 상세한 상태 관리)
const wsConnected = ref(false)
const wsError = ref(false)
const wsServiceExists = ref(false)
const wsInitialized = ref(false)

// ✅ 로컬 인증 상태 (useAuth와 별도로 관리)
const localIsLoggedIn = ref(false)
const localUserInfo = ref(null)

// 토큰 존재 여부
const hasToken = computed(() => !!localStorage.getItem('access_token'))

// ✅ 실제 표시할 로그인 상태 (두 상태를 조합)
const displayIsLoggedIn = computed(() => {
  const authResult = isLoggedIn.value
  const localResult = localIsLoggedIn.value
  const tokenExists = hasToken.value

  console.log('🔍 [AppHeader] 로그인 상태 계산:', {
    authResult,
    localResult,
    tokenExists,
    final: authResult || localResult || tokenExists
  })

  return authResult || localResult || tokenExists
})

// ✅ 실제 표시할 사용자 정보
const displayUserInfo = computed(() => {
  return userInfo.value || localUserInfo.value
})

// ✅ 실제 표시할 관리자 여부
const displayIsAdmin = computed(() => {
  const user = displayUserInfo.value
  return user?.role === 'ADMIN'
})

// WebSocket 연결 텍스트 계산
const getConnectionText = () => {
  if (wsError.value) return '오류'
  if (wsConnected.value) return '온라인'
  return '오프라인'
}

// ✅ WebSocket 상태 디버깅 함수
const debugWebSocketStatus = () => {
  console.group('🔍 WebSocket 디버깅 정보')

  // WebSocket 서비스 존재 여부
  console.log('webSocketService 존재:', !!webSocketService)

  if (webSocketService) {
    // 서비스 메서드들 확인
    console.log('isConnected 메서드:', typeof webSocketService.isConnected)
    console.log('onConnectionChange 메서드:', typeof webSocketService.onConnectionChange)
    console.log('getConnectionState 메서드:', typeof webSocketService.getConnectionState)

    // 실제 상태 확인
    try {
      const isConnected = webSocketService.isConnected()
      console.log('실제 연결 상태:', isConnected)

      const connectionState = webSocketService.getConnectionState()
      console.log('연결 상태 객체:', connectionState)

      const debugInfo = webSocketService.getDebugInfo()
      console.log('디버그 정보:', debugInfo)
    } catch (error) {
      console.error('WebSocket 메서드 호출 오류:', error)
    }
  }

  // 컴포넌트 상태
  console.log('컴포넌트 상태:', {
    wsConnected: wsConnected.value,
    wsError: wsError.value,
    wsServiceExists: wsServiceExists.value,
    wsInitialized: wsInitialized.value,
    isLoggedIn: isLoggedIn.value
  })

  console.groupEnd()
}

// ✅ WebSocket 상태 모니터링 설정 (강화된 버전)
const setupWebSocketStatusMonitoring = () => {
  console.log('📶 [AppHeader] WebSocket 상태 모니터링 설정 시작...')

  try {
    // WebSocket 서비스 존재 확인
    wsServiceExists.value = !!webSocketService
    console.log('📶 [AppHeader] WebSocket 서비스 존재:', wsServiceExists.value)

    if (!webSocketService) {
      console.error('❌ [AppHeader] webSocketService가 존재하지 않습니다!')
      wsError.value = true
      return
    }

    // WebSocket 서비스 메서드 존재 확인
    if (typeof webSocketService.isConnected !== 'function') {
      console.error('❌ [AppHeader] webSocketService.isConnected가 함수가 아닙니다!')
      wsError.value = true
      return
    }

    if (typeof webSocketService.onConnectionChange !== 'function') {
      console.error('❌ [AppHeader] webSocketService.onConnectionChange가 함수가 아닙니다!')
      wsError.value = true
      return
    }

    // 초기 상태 설정
    try {
      wsConnected.value = webSocketService.isConnected()
      console.log('📶 [AppHeader] 초기 WebSocket 상태:', wsConnected.value)
    } catch (error) {
      console.error('❌ [AppHeader] 초기 상태 확인 오류:', error)
      wsError.value = true
      wsConnected.value = false
    }

    // 연결 상태 변화 리스너 등록
    try {
      webSocketService.onConnectionChange((connected) => {
        console.log('📶 [AppHeader] WebSocket 연결 상태 변경:', connected)
        wsConnected.value = connected
        wsError.value = false // 상태 변경이 오면 오류 해제
      })

      wsInitialized.value = true
      console.log('✅ [AppHeader] WebSocket 모니터링 설정 완료')
    } catch (error) {
      console.error('❌ [AppHeader] 리스너 등록 오류:', error)
      wsError.value = true
    }

  } catch (generalError) {
    console.error('❌ [AppHeader] WebSocket 모니터링 설정 전체 오류:', generalError)
    wsError.value = true
    wsServiceExists.value = false
  }
}

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
  console.log('useAuth isLoggedIn:', isLoggedIn.value)
  console.log('useAuth isAdmin:', isAdmin.value)
  console.log('useAuth userInfo:', userInfo.value)
  console.log('hasToken:', hasToken.value)

  // ✅ 로컬 인증 상태 체크
  checkLocalAuthStatus()

  // 강제 인증 상태 체크 (useAuth)
  checkAuthStatus()

  // ✅ WebSocket 상태 모니터링 설정
  setupWebSocketStatusMonitoring()

  // ✅ localStorage 변화 감지 리스너 추가
  const handleStorageChange = (e) => {
    console.log('📦 [AppHeader] Storage 변화 감지:', e.key, e.newValue ? '토큰 추가' : '토큰 제거')

    if (e.key === 'access_token') {
      // 토큰 변화 시 인증 상태 재확인
      setTimeout(async () => {
        checkAuthStatus() // useAuth 상태 갱신
        checkLocalAuthStatus() // 로컬 상태 갱신

        console.log('🔄 [AppHeader] 인증 상태 재확인 후:', {
          useAuthLoggedIn: isLoggedIn.value,
          localLoggedIn: localIsLoggedIn.value,
          displayLoggedIn: displayIsLoggedIn.value,
          hasToken: hasToken.value
        })

        // WebSocket 재연결 시도
        if (displayIsLoggedIn.value) {
          await forceWebSocketCheck()
        }
      }, 100)
    }
  }

  window.addEventListener('storage', handleStorageChange)

  // 컴포넌트 언마운트 시 리스너 제거
  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
  })

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

// ✅ 로컬 인증 상태 확인 함수 추가
const checkLocalAuthStatus = () => {
  console.log('🔍 [AppHeader] 로컬 인증 상태 확인 중...')

  try {
    const token = authUtils.getAccessToken()

    if (!token) {
      console.log('❌ [AppHeader] 토큰 없음')
      localIsLoggedIn.value = false
      localUserInfo.value = null
      return false
    }

    if (!authUtils.isTokenValid(token)) {
      console.log('❌ [AppHeader] 토큰 만료')
      authUtils.clearTokens()
      localIsLoggedIn.value = false
      localUserInfo.value = null
      return false
    }

    // 사용자 정보 추출
    const extractedUserInfo = authUtils.extractUserInfoFromToken(token)
    if (extractedUserInfo) {
      localIsLoggedIn.value = true
      localUserInfo.value = extractedUserInfo
      console.log('✅ [AppHeader] 로컬 인증 상태 확인 완료:', extractedUserInfo)
      return true
    } else {
      console.log('❌ [AppHeader] 사용자 정보 추출 실패')
      localIsLoggedIn.value = false
      localUserInfo.value = null
      return false
    }
  } catch (error) {
    console.error('❌ [AppHeader] 로컬 인증 상태 확인 오류:', error)
    localIsLoggedIn.value = false
    localUserInfo.value = null
    return false
  }
}

// ✅ 로그인 상태 변화 감지 - 추가된 부분
watch(displayIsLoggedIn, async (newValue, oldValue) => {
  console.log(`🔑 [AppHeader] 표시 로그인 상태 변화: ${oldValue} -> ${newValue}`)

  if (newValue) {
    // 로그인되면 WebSocket 모니터링 재설정 및 연결 시도
    console.log('🔌 [AppHeader] 로그인 감지 - WebSocket 모니터링 재시작')
    setupWebSocketStatusMonitoring()

    // 추가로 WebSocket 연결 강제 시도
    setTimeout(async () => {
      await forceWebSocketCheck()
    }, 2000) // 2초 딜레이
  } else {
    // 로그아웃되면 WebSocket 상태 초기화
    console.log('🔌 [AppHeader] 로그아웃 감지 - WebSocket 상태 초기화')
    wsConnected.value = false
    wsError.value = false
    wsInitialized.value = false
  }
}, { immediate: false })

// ✅ 토큰 변화 감지 - 추가된 부분
watch(hasToken, async (newValue, oldValue) => {
  console.log(`🎫 [AppHeader] 토큰 상태 변화: ${oldValue} -> ${newValue}`)

  if (newValue && !oldValue) {
    // 토큰이 새로 생겼을 때 (로그인)
    console.log('🔌 [AppHeader] 토큰 감지 - 로컬 상태 갱신')
    checkLocalAuthStatus()

    setTimeout(async () => {
      setupWebSocketStatusMonitoring()
      await forceWebSocketCheck()
    }, 1000) // 1초 딜레이를 두어 다른 초기화가 완료되기를 기다림
  } else if (!newValue && oldValue) {
    // 토큰이 사라졌을 때 (로그아웃)
    localIsLoggedIn.value = false
    localUserInfo.value = null
  }
}, { immediate: false })

// ✅ 컴포넌트 언마운트 시 리스너 해제
onUnmounted(() => {
  console.log('🧹 [AppHeader] WebSocket 리스너 해제')
  try {
    if (webSocketService && typeof webSocketService.offMessage === 'function') {
      webSocketService.offMessage('connection-change')
    }
  } catch (error) {
    console.error('❌ [AppHeader] 리스너 해제 오류:', error)
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

/* ✅ WebSocket 연결 상태 스타일 (강화된 버전) */
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
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.connection-status.disconnected {
  background: rgba(156, 163, 175, 0.1);
  color: #6b7280;
  border: 1px solid rgba(156, 163, 175, 0.2);
}

.connection-status.error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
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
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.connection-status.connected .status-dot::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 2s infinite;
}

.connection-status.disconnected .status-dot {
  background: #9ca3af;
}

.connection-status.error .status-dot {
  background: #ef4444;
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .connection-status {
    padding: 3px 6px;
  }

  .status-text {
    display: none; /* 모바일에서는 텍스트 숨김 */
  }

  .status-dot {
    width: 10px;
    height: 10px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .connection-status.connected {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .connection-status.disconnected {
    background: rgba(156, 163, 175, 0.15);
    color: #9ca3af;
  }

  .connection-status.error {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }
}
</style>