<!-- BottomNavigation.vue - 모바일 하단 네비게이션 -->
<template>
  <nav class="bottom-nav">
    <router-link
      to="/feed"
      class="nav-item"
      :class="{ active: isActive('/feed') }"
    >
      <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
      </svg>
      <span class="nav-label">홈</span>
    </router-link>

    <router-link
      to="/battle"
      class="nav-item"
      :class="{ active: isActive('/battle') }"
    >
      <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
      </svg>
      <span class="nav-label">배틀</span>
    </router-link>

    <!-- FAB 버튼 영역 -->
    <div class="fab-container">
      <button class="nav-fab" :class="{ 'fab-open': isMenuOpen }" @click="toggleMenu">
        <svg class="fab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      <!-- FAB 메뉴 -->
      <Transition name="fab-menu">
        <div v-if="isMenuOpen" class="fab-menu">
          <button class="fab-menu-item" @click="handleCreateFeed">
            <div class="fab-menu-icon feed-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="fab-menu-label">새 피드 올리기</span>
          </button>

          <button class="fab-menu-item" @click="handleCreateProduct">
            <div class="fab-menu-icon product-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span class="fab-menu-label">제품 등록하기</span>
          </button>

          <button class="fab-menu-item" @click="handleCreateBattle">
            <div class="fab-menu-icon battle-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <span class="fab-menu-label">새 배틀 만들기</span>
          </button>
        </div>
      </Transition>
    </div>

    <!-- 오버레이 -->
    <Transition name="overlay">
      <div v-if="isMenuOpen" class="fab-overlay" @click="closeMenu"></div>
    </Transition>

    <button
      class="nav-item"
      :class="{ active: isActive('/chat') }"
      @click="handleProtectedNav('chat')"
    >
      <div class="nav-icon-wrapper">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
        </svg>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </div>
      <span class="nav-label">메시지</span>
    </button>

    <button
      class="nav-item"
      :class="{ active: isActive('/mypage') || isActive('/user') }"
      @click="handleProtectedNav('mypage')"
    >
      <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
      </svg>
      <span class="nav-label">MY</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  unreadCount: {
    type: Number,
    default: 0
  }
});

const router = useRouter();
const route = useRoute();
const { isLoggedIn } = useAuth();

const isMenuOpen = ref(false);

const isActive = (path) => {
  if (path === '/feed') {
    return route.path === '/feed' || route.path === '/';
  }
  return route.path === path || route.path.startsWith(path + '/');
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleCreateFeed = async () => {
  closeMenu();

  if (isLoggedIn.value) {
    router.push({ name: 'FeedCreate' });
    return;
  }

  const confirmed = confirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?');
  if (confirmed) {
    await router.push({
      name: 'Login',
      query: { redirect: '/feed/create' }
    });
  }
};

const handleCreateBattle = async () => {
  closeMenu();

  if (isLoggedIn.value) {
    router.push({ name: 'BattleCreate' });
    return;
  }

  const confirmed = confirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?');
  if (confirmed) {
    await router.push({
      name: 'Login',
      query: { redirect: '/battle/create' }
    });
  }
};

const handleCreateProduct = async () => {
  closeMenu();

  if (isLoggedIn.value) {
    router.push({ name: 'ProductCreate' });
    return;
  }

  const confirmed = confirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?');
  if (confirmed) {
    await router.push({
      name: 'Login',
      query: { redirect: '/products/create' }
    });
  }
};

const handleProtectedNav = async (routeName) => {
  if (isLoggedIn.value) {
    switch (routeName) {
      case 'chat':
        router.push({ name: 'Chat' });
        break;
      case 'mypage':
        router.push({ name: 'MyPage' });
        break;
    }
    return;
  }

  const confirmed = confirm('로그인이 필요한 페이지입니다.\n로그인 페이지로 이동하시겠습니까?');
  if (confirmed) {
    await router.push({
      name: 'Login',
      query: { redirect: route.fullPath }
    });
  }
};

// ESC 키로 메뉴 닫기
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isMenuOpen.value) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem 0;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

/* 데스크톱/태블릿에서 숨김 */
@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
  }
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  min-width: 3.5rem;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.nav-item:active {
  transform: scale(0.92);
}

.nav-item.active {
  color: #9333ea;
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.2s ease;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.badge {
  position: absolute;
  top: -0.375rem;
  right: -0.5rem;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

/* FAB Container */
.fab-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* FAB (Floating Action Button) - 중앙 생성 버튼 */
.nav-fab {
  width: 3.25rem;
  height: 3.25rem;
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
  margin-top: -1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  z-index: 102;
}

.nav-fab:active {
  transform: scale(0.92);
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.4);
}

.nav-fab.fab-open {
  transform: rotate(45deg);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
}

.nav-fab.fab-open:active {
  transform: rotate(45deg) scale(0.92);
}

.fab-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* FAB 메뉴 */
.fab-menu {
  position: absolute;
  bottom: 4.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 101;
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: white;
  border: none;
  border-radius: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

.fab-menu-item:active {
  transform: scale(0.96);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.fab-menu-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fab-menu-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.fab-menu-icon.feed-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.fab-menu-icon.product-icon {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
}

.fab-menu-icon.battle-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.fab-menu-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  padding-right: 0.5rem;
}

/* 오버레이 */
.fab-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 99;
  -webkit-tap-highlight-color: transparent;
}

/* 메뉴 트랜지션 */
.fab-menu-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-menu-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.fab-menu-enter-from,
.fab-menu-leave-to {
  opacity: 0;
  transform: translateY(1rem) scale(0.9);
}

.fab-menu-enter-to,
.fab-menu-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 오버레이 트랜지션 */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
