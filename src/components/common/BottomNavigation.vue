<template>
  <nav class="safe-area-bottom">
    <div class="nav-wrapper">
      <!-- 홈 -->
      <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }">
        <svg v-if="!isActive('/dashboard')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"/>
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"/>
        </svg>
        <span class="nav-label">홈</span>
      </router-link>

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

      <!-- 배틀 -->
      <router-link to="/battle" class="nav-item" :class="{ active: isActive('/battle') }">
        <svg v-if="!isActive('/battle')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd"/>
        </svg>
        <span class="nav-label">배틀</span>
      </router-link>

      <!-- 제품 -->
      <router-link to="/products" class="nav-item" :class="{ active: isActive('/products') }">
        <svg v-if="!isActive('/products')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
        </svg>
        <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clip-rule="evenodd"/>
        </svg>
        <span class="nav-label">제품</span>
      </router-link>

      <!-- MY -->
      <button class="nav-item" :class="{ active: isActive('/mypage') }" @click="handleProtectedNav('mypage')">
        <svg v-if="!isActive('/mypage')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd"/>
        </svg>
        <span class="nav-label">MY</span>
      </button>
    </div>

    <!-- 우측 FAB -->
    <div class="fab-container">
      <button class="fab-btn" :class="{ open: isMenuOpen }" @click="toggleMenu">
        <svg class="fab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      <Transition name="fade-up">
        <div v-if="isMenuOpen" class="fab-menu">
          <button class="fab-menu-item" @click="handleCreate('feed')">
            <span class="menu-icon feed">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </span>
            <span class="menu-text">피드 작성</span>
          </button>
          <button class="fab-menu-item" @click="handleCreate('battle')">
            <span class="menu-icon battle">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </span>
            <span class="menu-text">배틀 생성</span>
          </button>
          <button class="fab-menu-item" @click="handleCreate('product')">
            <span class="menu-icon product">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </span>
            <span class="menu-text">제품 등록</span>
          </button>
        </div>
      </Transition>
    </div>

    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="isMenuOpen" class="overlay" @click="closeMenu"></div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const route = useRoute();
const { isLoggedIn } = useAuth();
const isMenuOpen = ref(false);

const isActive = (path) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/';
  }
  return route.path.startsWith(path);
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleProtectedNav = async (name) => {
  if (isLoggedIn.value) {
    router.push({ name: name === 'chat' ? 'Chat' : 'MyPage' });
    return;
  }
  if (confirm('로그인이 필요합니다.')) {
    await router.push({ name: 'Login', query: { redirect: route.fullPath } });
  }
};

const handleCreate = async (type) => {
  closeMenu();

  const routes = {
    feed: { name: 'FeedCreate', redirect: '/feed/create' },
    battle: { name: 'BattleCreate', redirect: '/battle/create' },
    product: { name: 'ProductCreate', redirect: '/products/create' }
  };

  const target = routes[type];

  if (isLoggedIn.value) {
    router.push({ name: target.name });
    return;
  }

  if (confirm('로그인이 필요합니다.')) {
    await router.push({ name: 'Login', query: { redirect: target.redirect } });
  }
};

const onKeydown = (e) => {
  if (e.key === 'Escape') closeMenu();
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
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 10px;
}

.nav-wrapper {
  max-width: 420px;
  flex: 1;
  height: 56px;
  background: var(--bg-nav);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: none;
  border: none;
  color: var(--text-dim);
  transition: color 0.2s ease;
  padding: 6px 0;
  cursor: pointer;
  min-width: 0;
}

.nav-item.active {
  color: var(--main);
}

.nav-icon {
  width: 22px;
  height: 22px;
  margin-bottom: 2px;
}

.nav-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

/* FAB Container */
.fab-container {
  position: relative;
}

.fab-btn {
  width: 56px;
  height: 56px;
  background: var(--main);
  border: none;
  border-radius: 18px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(147, 51, 234, 0.4);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-btn:hover {
  background: var(--main-light);
  transform: scale(1.02);
}

.fab-btn.open {
  transform: rotate(45deg);
  background: #7c3aed;
}

.fab-icon {
  width: 26px;
  height: 26px;
}

/* FAB Menu */
.fab-menu {
  position: absolute;
  bottom: 68px;
  right: 0;
  background: white;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
  z-index: 1002;
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.fab-menu-item:hover {
  background: #f4f4f5;
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon svg {
  width: 20px;
  height: 20px;
}

.menu-icon.feed {
  background: #dbeafe;
  color: #3b82f6;
}

.menu-icon.battle {
  background: #fae8ff;
  color: #9333ea;
}

.menu-icon.product {
  background: #d1fae5;
  color: #10b981;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  color: #3f3f46;
}

/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 999;
}

/* Transitions */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.2s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 태블릿 이상에서 숨김 */
@media (min-width: 768px) {
  .safe-area-bottom {
    display: none;
  }
}
</style>
