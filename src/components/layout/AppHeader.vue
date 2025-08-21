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
          <div class="loading">
            <span class="loading-spinner">⏳</span>
            로그아웃 중...
          </div>
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

            <!-- 🚪 로그아웃 버튼들 -->
            <div class="logout-menu">
              <button
                  @click="handleLogout"
                  :disabled="isLoggingOut"
                  class="logout-btn"
              >
                <span v-if="isLoggingOut">⏳</span>
                <span v-else>🚪</span>
                로그아웃
              </button>

              <!-- 강제 로그아웃 버튼 (옵션) -->
              <button
                  @click="handleForceLogoutAll"
                  :disabled="isLoggingOut"
                  class="force-logout-btn"
                  title="모든 기기에서 로그아웃"
              >
                🔒 전체 로그아웃
              </button>
            </div>
          </div>
        </template>
      </nav>
    </div>

    <!-- 로그아웃 결과 토스트 -->
    <div v-if="logoutMessage" class="logout-toast" :class="logoutMessageType">
      {{ logoutMessage }}
    </div>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { logoutWithBackend, forceLogoutAllDevices } from '@/utils/auth'

// 디버깅 모드 (개발 중에만 true로 설정)
const showDebug = ref(true) // 배포 시 false로 변경

const router = useRouter()
const { userInfo, isLoggedIn, isAdmin, logout: localLogout, checkAuthStatus } = useAuth()

// 로그아웃 진행 상태
const isLoggingOut = ref(false)

// 로그아웃 메시지
const logoutMessage = ref('')
const logoutMessageType = ref('success') // 'success' | 'warning' | 'error'

// 토큰 존재 여부
const hasToken = computed(() => !!localStorage.getItem('access_token'))

// 🚪 일반 로그아웃 (백엔드 API 호출)
const handleLogout = async () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true
  logoutMessage.value = ''

  try {
    console.log('🚪 [AppHeader] 로그아웃 시작...')

    const result = await logoutWithBackend()

    if (result.success) {
      logoutMessage.value = result.message || '로그아웃되었습니다'
      logoutMessageType.value = 'success'
      console.log('✅ [AppHeader] 백엔드 로그아웃 성공')
    } else {
      logoutMessage.value = result.localCleared
          ? '서버 오류가 있었지만 로그아웃되었습니다'
          : '로그아웃 처리 중 오류가 발생했습니다'
      logoutMessageType.value = result.localCleared ? 'warning' : 'error'
      console.warn('⚠️ [AppHeader] 백엔드 로그아웃 부분 실패:', result.error)
    }

    // useAuth의 로컬 상태도 업데이트
    await localLogout()

    // 3초 후 토스트 메시지 제거
    setTimeout(() => {
      logoutMessage.value = ''
    }, 3000)

    // 로그인 페이지로 리다이렉트
    router.push('/login')

  } catch (error) {
    console.error('❌ [AppHeader] 로그아웃 처리 중 예외:', error)

    logoutMessage.value = '로그아웃 중 예상치 못한 오류가 발생했습니다'
    logoutMessageType.value = 'error'

    // 예외 발생해도 로컬 로그아웃은 수행
    await localLogout()
    router.push('/login')

  } finally {
    isLoggingOut.value = false
  }
}

// 🔒 강제 로그아웃 (모든 기기에서)
const handleForceLogoutAll = async () => {
  if (isLoggingOut.value) return

  const confirmed = confirm('모든 기기에서 로그아웃하시겠습니까?\n다른 기기에서도 자동으로 로그아웃됩니다.')
  if (!confirmed) return

  isLoggingOut.value = true
  logoutMessage.value = ''

  try {
    console.log('🔒 [AppHeader] 모든 기기 로그아웃 시작...')

    const result = await forceLogoutAllDevices()

    if (result.success) {
      logoutMessage.value = result.message || '모든 기기에서 로그아웃되었습니다'
      logoutMessageType.value = 'success'
      console.log('✅ [AppHeader] 강제 로그아웃 성공')
    } else {
      logoutMessage.value = result.localCleared
          ? '일부 기기에서 오류가 있었지만 현재 기기는 로그아웃되었습니다'
          : '강제 로그아웃 처리 중 오류가 발생했습니다'
      logoutMessageType.value = result.localCleared ? 'warning' : 'error'
      console.warn('⚠️ [AppHeader] 강제 로그아웃 부분 실패:', result.error)
    }

    // useAuth의 로컬 상태도 업데이트
    await localLogout()

    // 3초 후 토스트 메시지 제거
    setTimeout(() => {
      logoutMessage.value = ''
    }, 3000)

    // 로그인 페이지로 리다이렉트
    router.push('/login')

  } catch (error) {
    console.error('❌ [AppHeader] 강제 로그아웃 처리 중 예외:', error)

    logoutMessage.value = '강제 로그아웃 중 예상치 못한 오류가 발생했습니다'
    logoutMessageType.value = 'error'

    // 예외 발생해도 로컬 로그아웃은 수행
    await localLogout()
    router.push('/login')

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

/* 로그아웃 메뉴 스타일 */
.logout-menu {
  display: flex;
  gap: 8px;
  align-items: center;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.logout-btn:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.logout-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.force-logout-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.force-logout-btn:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-1px);
}

.force-logout-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.loading {
  color: #6b7280;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 토스트 메시지 스타일 */
.logout-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.logout-toast.success {
  background: #10b981;
  color: white;
}

.logout-toast.warning {
  background: #f59e0b;
  color: white;
}

.logout-toast.error {
  background: #ef4444;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>