<template>
  <nav class="safe-area-bottom">
    <!-- 플로팅 추가 버튼 (네비게이션 위 오른쪽) -->
    <div v-if="!isMoreMenuOpen" class="floating-fab-wrapper">
      <div class="floating-fab-container">
        <button class="fab-btn" :class="{ open: isCreateMenuOpen }" @click="toggleCreateMenu">
          <svg class="fab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
        </button>

        <Transition name="fade-up-right">
          <div v-if="isCreateMenuOpen" class="fab-menu">
            <button class="fab-menu-item" @click="handleCreate('feed')">
              <span class="menu-icon feed">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </span>
              <div class="menu-content">
                <span class="menu-text">인증 올리기</span>
                <span class="menu-desc">자랑하고 싶은 아이템이 있나요?</span>
              </div>
            </button>
            <button class="fab-menu-item" @click="handleCreate('battle')">
              <span class="menu-icon battle">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </span>
              <div class="menu-content">
                <span class="menu-text">요거픽 등록</span>
                <span class="menu-desc">최고의 아이템, 투표로 정해봐요</span>
              </div>
            </button>
            <div class="fab-menu-divider"></div>
            <button class="fab-menu-item" @click="handleCreate('product')">
              <span class="menu-icon product">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </span>
              <div class="menu-content">
                <span class="menu-text">아이템 등록</span>
                <span class="menu-desc">없는 아이템을 직접 추가해요</span>
              </div>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <div class="nav-wrapper">
      <!-- 피드 -->
      <router-link to="/feed" class="nav-item" :class="{ active: isActive('/feed') }">
        <svg v-if="!isActive('/feed')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clip-rule="evenodd"/>
          <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"/>
        </svg>
        <span class="nav-label">피드</span>
      </router-link>

      <!-- 요거픽 -->
      <router-link to="/battle" class="nav-item" :class="{ active: isActive('/battle') }">
        <svg v-if="!isActive('/battle')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd"/>
        </svg>
        <span class="nav-label">요거픽</span>
      </router-link>

      <!-- 핫 아이템 -->
      <router-link to="/products" class="nav-item" :class="{ active: isActive('/products') }">
        <svg v-if="!isActive('/products')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
        </svg>
        <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
        </svg>
        <span class="nav-label">핫 아이템</span>
      </router-link>

      <!-- 더보기 -->
      <div class="more-container">
        <button class="nav-item" :class="{ active: isMoreMenuOpen || isActive('/mypage') || isActive('/chat') }" @click="toggleMoreMenu">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
          </svg>
          <span class="nav-label">더보기</span>
        </button>

        <Transition name="fade-up-right">
          <div v-if="isMoreMenuOpen" class="more-menu">
            <button class="more-menu-item" @click="handleMoreNav('home')">
              <span class="more-icon home">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              </span>
              <div class="more-content">
                <span class="more-text">홈</span>
                <span class="more-desc">대시보드로 이동해요</span>
              </div>
            </button>
            <button class="more-menu-item" @click="handleMoreNav('carrier')">
              <span class="more-icon carrier">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke-width="1.8"/>
                  <path stroke-linecap="round" stroke-width="1.8" d="M16 7V5a4 4 0 00-8 0v2"/>
                  <circle cx="12" cy="15" r="2" stroke-width="1.8"/>
                </svg>
              </span>
              <div class="more-content">
                <span class="more-text">캐리어 꾸미기</span>
                <span class="more-desc">나만의 캐리어를 꾸며봐요</span>
              </div>
            </button>
            <div class="more-menu-divider"></div>
            <button class="more-menu-item" @click="handleMoreNav('chat')">
              <span class="more-icon chat">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </span>
              <div class="more-content">
                <span class="more-text">메시지</span>
                <span class="more-desc">다른 사용자와 대화해요</span>
              </div>
            </button>
            <button class="more-menu-item" @click="handleMoreNav('mypage')">
              <span class="more-icon mypage">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              <div class="more-content">
                <span class="more-text">마이페이지</span>
                <span class="more-desc">내 정보와 활동을 관리해요</span>
              </div>
            </button>
            <template v-if="isAdmin">
              <div class="more-menu-divider"></div>
              <button class="more-menu-item" @click="handleMoreNav('admin')">
                <span class="more-icon admin">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="1.8"/>
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="1.8"/>
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="1.8"/>
                    <rect x="14" y="14" width="7" height="7" rx="1" stroke-width="1.8"/>
                  </svg>
                </span>
                <div class="more-content">
                  <span class="more-text">관리자</span>
                  <span class="more-desc">관리자 대시보드</span>
                </div>
              </button>
            </template>
            <div class="more-menu-divider"></div>
            <button v-if="isLoggedIn" class="more-menu-item logout" @click="handleLogout">
              <span class="more-icon logout-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
              </span>
              <div class="more-content">
                <span class="more-text">로그아웃</span>
              </div>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Overlay (투명) -->
    <div v-if="isCreateMenuOpen || isMoreMenuOpen" class="overlay" @click="closeAllMenus"></div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useConfirmDialog } from '@/composables/useConfirmDialog';

const router = useRouter();
const route = useRoute();
const { isLoggedIn, isAdmin, logout } = useAuth();
const { openLoginRequired, open } = useConfirmDialog();
const isCreateMenuOpen = ref(false);
const isMoreMenuOpen = ref(false);

const isActive = (path) => {
  return route.path.startsWith(path);
};

const toggleCreateMenu = () => {
  isMoreMenuOpen.value = false;
  isCreateMenuOpen.value = !isCreateMenuOpen.value;
};

const toggleMoreMenu = () => {
  isCreateMenuOpen.value = false;
  isMoreMenuOpen.value = !isMoreMenuOpen.value;
};

const closeAllMenus = () => {
  isCreateMenuOpen.value = false;
  isMoreMenuOpen.value = false;
};

const handleCreate = async (type) => {
  closeAllMenus();

  const routes = {
    feed: { name: 'FeedCreate', redirect: '/feed/create' },
    battle: { name: 'BattleCreate', redirect: '/battles/create' },
    product: { name: 'ProductCreate', redirect: '/products/create' }
  };

  const target = routes[type];

  if (isLoggedIn.value) {
    router.push({ name: target.name });
    return;
  }

  const confirmed = await openLoginRequired();
  if (confirmed) {
    await router.push({ name: 'Login', query: { redirect: target.redirect } });
  }
};

const moreNavMap = {
  home: { name: 'Dashboard', path: '/dashboard' },
  carrier: { name: 'Carrier', path: '/carrier' },
  chat: { name: 'Chat', path: '/chat' },
  mypage: { name: 'MyPage', path: '/mypage' },
  admin: { name: 'AdminDashboard', path: '/admin' },
};

const handleMoreNav = async (key) => {
  closeAllMenus();
  const target = moreNavMap[key];
  if (!target) return;

  if (key === 'home') {
    router.push(target.path);
    return;
  }

  if (isLoggedIn.value) {
    router.push(target.path);
    return;
  }

  const confirmed = await openLoginRequired();
  if (confirmed) {
    await router.push({ name: 'Login', query: { redirect: target.path } });
  }
};

const handleLogout = async () => {
  closeAllMenus();
  const confirmed = await open({ type: 'confirm', title: '확인', message: '정말 로그아웃하시겠습니까?' });
  if (confirmed) {
    await logout();
  }
};

const onKeydown = (e) => {
  if (e.key === 'Escape') closeAllMenus();
};

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.safe-area-bottom {
  --main: #9333ea;
  --main-light: #a855f7;
  --bg-nav: rgba(255, 255, 255, 0.95);
  --border-light: rgba(0, 0, 0, 0.06);
  --text-dim: #9ca3af;

  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
}

.nav-wrapper {
  max-width: 400px;
  width: 100%;
  height: 60px;
  background: var(--bg-nav);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-light);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  padding: 0 8px;
  z-index: 2;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: none;
  border: none;
  color: var(--text-dim);
  transition: color 0.15s ease;
  padding: 8px 16px;
  cursor: pointer;
}

.nav-item.active {
  color: var(--main);
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

/* 플로팅 FAB (네비게이션 위 오른쪽) */
.floating-fab-wrapper {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  max-width: 400px;
  width: 100%;
  padding-right: 8px;
  box-sizing: border-box;
}

.floating-fab-container {
  position: relative;
  pointer-events: auto;
}

.fab-btn {
  width: 48px;
  height: 48px;
  background: var(--main);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(147, 51, 234, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.fab-btn:active {
  transform: scale(0.93);
}

.fab-btn.open {
  transform: rotate(45deg);
  background: #7c3aed;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.5);
}

.fab-icon {
  width: 24px;
  height: 24px;
}

/* FAB Menu (오른쪽 정렬) */
.fab-menu {
  position: absolute;
  bottom: 58px;
  right: 0;
  background: white;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1002;
  min-width: 220px;
}

.fab-menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 8px;
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.fab-menu-item:active {
  background: #f5f5f5;
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon svg {
  width: 20px;
  height: 20px;
}

.menu-icon.feed {
  background: #EFF6FF;
  color: #3b82f6;
}

.menu-icon.battle {
  background: #FEF3C7;
  color: #f97316;
}

.menu-icon.product {
  background: #F0FDF4;
  color: #10b981;
}

.menu-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.menu-text {
  font-size: 14px;
  font-weight: 600;
  color: #171717;
  white-space: nowrap;
}

.menu-desc {
  font-size: 11px;
  font-weight: 400;
  color: #737373;
  white-space: nowrap;
}

/* 더보기 Container */
.more-container {
  position: relative;
  display: flex;
  justify-content: center;
}

/* 더보기 Menu */
.more-menu {
  position: absolute;
  bottom: calc(100% + 12px);
  right: -12px;
  background: white;
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 1002;
  min-width: 200px;
  max-width: calc(100vw - 32px);
  max-height: 60vh;
  overflow-y: auto;
}

.more-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: none;
  background: none;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.more-menu-item:active {
  background: #f5f5f5;
}

.more-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.more-icon svg {
  width: 17px;
  height: 17px;
}

.more-icon.home {
  background: #f0fdf4;
  color: #16a34a;
}

.more-icon.carrier {
  background: #faf5ff;
  color: #9333ea;
}

.more-icon.chat {
  background: #fef3c7;
  color: #d97706;
}

.more-icon.mypage {
  background: #e0e7ff;
  color: #4f46e5;
}

.more-icon.admin {
  background: #fff7ed;
  color: #ea580c;
}

.more-icon.logout-icon {
  background: #fef2f2;
  color: #dc2626;
}

.more-menu-item.logout .more-text {
  color: #dc2626;
}

.more-menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 2px 8px;
}

.more-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}

.more-text {
  font-size: 13px;
  font-weight: 600;
  color: #171717;
  white-space: nowrap;
}

.more-desc {
  font-size: 10px;
  font-weight: 400;
  color: #737373;
  white-space: nowrap;
}

/* Overlay (투명 - 클릭 감지용) */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
}

/* Transitions */
.fade-up-right-enter-active,
.fade-up-right-leave-active {
  transition: all 0.15s ease;
}

.fade-up-right-enter-from,
.fade-up-right-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* 태블릿 이상에서 숨김 */
@media (min-width: 768px) {
  .safe-area-bottom {
    display: none;
  }
}
</style>
