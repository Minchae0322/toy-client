<template>
  <nav class="safe-area-bottom">
    <div class="nav-wrapper">
      <router-link to="/feed" class="nav-item" :class="{ active: isActive('/feed') }">
        <div class="icon-box">
          <svg v-if="!isActive('/feed')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <svg v-else class="nav-icon active-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"/>
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"/>
          </svg>
        </div>
        <span class="nav-label">홈</span>
      </router-link>

      <router-link to="/battle" class="nav-item" :class="{ active: isActive('/battle') }">
        <div class="icon-box">
          <svg v-if="!isActive('/battle')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <svg v-else class="nav-icon active-icon" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span class="nav-label">배틀</span>
      </router-link>

      <div class="fab-center">
        <button class="action-btn" :class="{ open: isMenuOpen }" @click="toggleMenu">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>

        <Transition name="slide-up">
          <div v-if="isMenuOpen" class="action-menu">
            <button class="menu-row" @click="handleCreateFeed"><span>새 피드</span><i class="dot blue"></i></button>
            <button class="menu-row" @click="handleCreateProduct"><span>제품 등록</span><i class="dot teal"></i></button>
            <button class="menu-row" @click="handleCreateBattle"><span>배틀 생성</span><i class="dot main"></i></button>
          </div>
        </Transition>
      </div>

      <button class="nav-item" :class="{ active: isActive('/chat') }" @click="handleProtectedNav('chat')">
        <div class="icon-box relative">
          <svg v-if="!isActive('/chat')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <svg v-else class="nav-icon active-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z"/>
          </svg>
          <span v-if="unreadCount > 0" class="mini-badge"></span>
        </div>
        <span class="nav-label">메시지</span>
      </button>

      <button class="nav-item" :class="{ active: isActive('/mypage') }" @click="handleProtectedNav('mypage')">
        <div class="icon-box">
          <svg v-if="!isActive('/mypage')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <svg v-else class="nav-icon active-icon" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span class="nav-label">MY</span>
      </button>
    </div>

    <div v-if="isMenuOpen" class="minimal-overlay" @click="closeMenu"></div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

defineProps({ unreadCount: { type: Number, default: 0 } });

const router = useRouter();
const route = useRoute();
const { isLoggedIn } = useAuth();
const isMenuOpen = ref(false);

const isActive = (path) => path === '/feed'
    ? route.path === '/feed' || route.path === '/'
    : route.path.startsWith(path);

const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value;
const closeMenu = () => isMenuOpen.value = false;

const requireAuth = async (redirect, cb) => {
  closeMenu();
  if (isLoggedIn.value) return cb();
  if (confirm('로그인이 필요합니다.')) {
    await router.push({ name: 'Login', query: { redirect } });
  }
};

const handleCreateFeed = () => requireAuth('/feed/create', () => router.push({ name: 'FeedCreate' }));
const handleCreateBattle = () => requireAuth('/battle/create', () => router.push({ name: 'BattleCreate' }));
const handleCreateProduct = () => requireAuth('/products/create', () => router.push({ name: 'ProductCreate' }));
const handleProtectedNav = (name) => requireAuth(route.fullPath, () => router.push({ name: name === 'chat' ? 'Chat' : 'MyPage' }));

const onKey = (e) => e.key === 'Escape' && closeMenu();
onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<style scoped>
.safe-area-bottom {
  /* Design Tokens - Modern Neutral & Suble Accent */
  --main: #9993ea;
  --bg-nav: rgba(255, 255, 255, 0.85);
  --border-light: rgba(0, 0, 0, 0.05);
  --text-dim: #a1a1aa;
  --text-main: #3f3f46;

  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 10px 16px calc(12px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
}

.nav-wrapper {
  max-width: 500px;
  width: 100%;
  height: 64px;
  background: var(--bg-nav);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
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
  transition: all 0.2s ease;
  padding-top: 4px;
}

.nav-item.active {
  color: var(--main);
}

.icon-box {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.nav-icon {
  width: 22px;
  height: 22px;
  stroke-width: 1.8;
}

.active-icon {
  transform: scale(1.05);
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: -0.02em;
}

/* FAB - Minimalist Action Button */
.fab-center {
  position: relative;
  width: 56px;
  display: flex;
  justify-content: center;
}

.action-btn {
  width: 44px;
  height: 44px;
  background: var(--main);
  border: none;
  border-radius: 14px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(153, 147, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.action-btn svg { width: 24px; height: 24px; }
.action-btn.open { transform: rotate(45deg); background: #3f3f46; }

/* Notion-like Action Menu */
.action-menu {
  position: absolute;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 8px;
  width: 140px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1002;
}

.menu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
}

.menu-row:hover { background: #f4f4f5; }

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot.blue { background: #3b82f6; }
.dot.teal { background: #14b8a6; }
.dot.main { background: var(--main); }

/* Message Badge */
.mini-badge {
  position: absolute;
  top: 1px;
  right: 0px;
  width: 8px;
  height: 8px;
  background: #f43f5e;
  border-radius: 50%;
  border: 1.5px solid white;
}

/* Minimal Overlay */
.minimal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 999;
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.2s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

@media (min-width: 1024px) {
  .safe-area-bottom { display: none; }
}
</style>