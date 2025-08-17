<template>
  <header class="chat-header">
    <div class="header-content">
      <!-- 로고/타이틀 -->
      <div class="header-left">
        <div class="app-logo">
          <MessageCircle :size="24" class="logo-icon" />
          <h1 class="app-title">채팅</h1>
        </div>
      </div>

      <!-- 헤더 액션 버튼들 -->
      <div class="header-actions">
        <!-- 검색 버튼 -->
        <button
            @click="$emit('toggle-search')"
            class="action-button"
            :class="{ 'active': showSearch }"
            title="검색"
        >
          <Search :size="20" />
        </button>

        <!-- 새 채팅방 생성 버튼 -->
        <button
            @click="$emit('create-room')"
            class="action-button create-button"
            title="새 채팅방 만들기"
        >
          <Plus :size="20" />
        </button>

        <!-- 메뉴 버튼 -->
        <button
            @click="showMenu = !showMenu"
            class="action-button"
            :class="{ 'active': showMenu }"
            title="메뉴"
        >
          <MoreVertical :size="20" />
        </button>
      </div>
    </div>

    <!-- 드롭다운 메뉴 -->
    <Transition name="menu">
      <div v-if="showMenu" class="dropdown-menu">
        <div class="menu-overlay" @click="showMenu = false"></div>
        <div class="menu-content">
          <button @click="handleMenuAction('profile')" class="menu-item">
            <User :size="16" />
            <span>프로필</span>
          </button>
          <button @click="handleMenuAction('settings')" class="menu-item">
            <Settings :size="16" />
            <span>설정</span>
          </button>
          <button @click="handleMenuAction('notifications')" class="menu-item">
            <Bell :size="16" />
            <span>알림 설정</span>
          </button>
          <div class="menu-divider"></div>
          <button @click="handleMenuAction('help')" class="menu-item">
            <HelpCircle :size="16" />
            <span>도움말</span>
          </button>
          <button @click="handleMenuAction('about')" class="menu-item">
            <Info :size="16" />
            <span>정보</span>
          </button>
          <div class="menu-divider"></div>
          <button @click="handleMenuAction('logout')" class="menu-item danger">
            <LogOut :size="16" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 온라인 상태 표시 -->
    <div v-if="showOnlineStatus" class="online-status">
      <div class="status-indicator" :class="connectionStatus"></div>
      <span class="status-text">{{ getStatusText() }}</span>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  MessageCircle,
  Search,
  Plus,
  MoreVertical,
  User,
  Settings,
  Bell,
  HelpCircle,
  Info,
  LogOut
} from 'lucide-vue-next'

// Props
const props = defineProps({
  showSearch: {
    type: Boolean,
    default: false
  },
  connectionStatus: {
    type: String,
    default: 'connected', // connected, connecting, disconnected
    validator: (value) => ['connected', 'connecting', 'disconnected'].includes(value)
  },
  showOnlineStatus: {
    type: Boolean,
    default: false
  },
  userInfo: {
    type: Object,
    default: () => ({
      name: '사용자',
      avatar: null,
      status: 'online'
    })
  }
})

// 이벤트 정의
const emit = defineEmits(['toggle-search', 'create-room', 'menu-action'])

// 반응형 데이터
const showMenu = ref(false)

// 계산된 속성
const getStatusText = () => {
  switch (props.connectionStatus) {
    case 'connected':
      return '온라인'
    case 'connecting':
      return '연결 중...'
    case 'disconnected':
      return '오프라인'
    default:
      return '알 수 없음'
  }
}

// 메서드
const handleMenuAction = (action) => {
  showMenu.value = false

  // 메뉴 액션 처리
  switch (action) {
    case 'profile':
      console.log('프로필 메뉴 클릭')
      break
    case 'settings':
      console.log('설정 메뉴 클릭')
      break
    case 'notifications':
      console.log('알림 설정 메뉴 클릭')
      break
    case 'help':
      console.log('도움말 메뉴 클릭')
      break
    case 'about':
      showAboutDialog()
      break
    case 'logout':
      handleLogout()
      break
    default:
      console.log('알 수 없는 메뉴 액션:', action)
  }

  // 부모 컴포넌트에 이벤트 전달
  emit('menu-action', action)
}

const showAboutDialog = () => {
  alert('채팅 앱 v1.0.0\n\n실시간 채팅 서비스입니다.')
}

const handleLogout = () => {
  if (confirm('정말 로그아웃 하시겠습니까?')) {
    // 로그아웃 처리
    localStorage.removeItem('access_token')
    sessionStorage.removeItem('access_token')
    window.location.reload()
  }
}

// 외부 클릭 시 메뉴 닫기
const handleClickOutside = (event) => {
  if (showMenu.value && !event.target.closest('.dropdown-menu')) {
    showMenu.value = false
  }
}

// 컴포넌트 마운트 시 이벤트 리스너 등록
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: white;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.action-button:active {
  transform: translateY(0);
}

.action-button.active {
  background: rgba(255, 255, 255, 0.25);
}

.create-button {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.create-button:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
}

.menu-content {
  position: relative;
  top: 8px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  padding: 8px;
  min-width: 200px;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.menu-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.menu-item.danger {
  color: #dc2626;
}

.menu-item.danger:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.connected {
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.status-indicator.connecting {
  background: #f59e0b;
  animation: pulse 2s infinite;
}

.status-indicator.disconnected {
  background: #ef4444;
}

.status-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* 애니메이션 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

/* 메뉴 트랜지션 */
.menu-enter-active {
  transition: all 0.2s ease-out;
}

.menu-leave-active {
  transition: all 0.15s ease-in;
}

.menu-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.menu-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
  }

  .app-title {
    font-size: 18px;
  }

  .action-button {
    width: 36px;
    height: 36px;
  }

  .header-actions {
    gap: 6px;
  }

  .menu-content {
    right: 16px;
    min-width: 180px;
  }

  .online-status {
    padding: 6px 16px;
  }
}

@media (max-width: 480px) {
  .app-logo {
    gap: 8px;
  }

  .app-title {
    display: none;
  }

  .action-button {
    width: 32px;
    height: 32px;
  }

  .menu-content {
    right: 12px;
    min-width: 160px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .menu-content {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .menu-item {
    color: #d1d5db;
  }

  .menu-item:hover {
    background: #4b5563;
    color: #f9fafb;
  }

  .menu-item.danger {
    color: #fca5a5;
  }

  .menu-item.danger:hover {
    background: #7f1d1d;
    color: #fecaca;
  }

  .menu-divider {
    background: #4b5563;
  }
}

/* 접근성 개선 */
.action-button:focus,
.menu-item:focus {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

/* 터치 디바이스 최적화 */
@media (hover: none) and (pointer: coarse) {
  .action-button {
    min-width: 44px;
    min-height: 44px;
  }

  .menu-item {
    min-height: 44px;
    padding: 16px;
  }
}

/* 고해상도 디스플레이 지원 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .status-indicator {
    border: 0.5px solid rgba(255, 255, 255, 0.2);
  }
}

/* 애니메이션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .action-button,
  .menu-item,
  .status-indicator,
  .menu-enter-active,
  .menu-leave-active {
    transition: none !important;
    animation: none !important;
  }

  .action-button:hover {
    transform: none !important;
  }
}

/* 키보드 내비게이션 지원 */
.action-button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
  background: rgba(255, 255, 255, 0.25);
}

.menu-item:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  background: #f1f5f9;
}

/* 프린트 스타일 */
@media print {
  .chat-header {
    background: #666 !important;
    box-shadow: none !important;
  }

  .dropdown-menu {
    display: none !important;
  }
}
</style>