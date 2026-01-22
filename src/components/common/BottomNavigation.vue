<template>
  <nav class="bottom-nav">
    <!-- 홈 -->
    <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }">
      <svg v-if="!isActive('/dashboard')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
      <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"/>
        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"/>
      </svg>
    </router-link>

    <!-- 피드 -->
    <router-link to="/feed" class="nav-item" :class="{ active: isActive('/feed') }">
      <svg v-if="!isActive('/feed')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
      <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clip-rule="evenodd"/>
        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"/>
      </svg>
    </router-link>

    <!-- 만들기 (중앙) -->
    <button class="nav-item create-btn" @click="openCreateMenu">
      <div class="create-icon-wrapper">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v16m8-8H4"/>
        </svg>
      </div>
    </button>

    <!-- 배틀 -->
    <router-link to="/battle" class="nav-item" :class="{ active: isActive('/battle') }">
      <svg v-if="!isActive('/battle')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
      <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd"/>
      </svg>
    </router-link>

    <!-- MY -->
    <button class="nav-item" :class="{ active: isActive('/mypage') }" @click="handleMyPage">
      <svg v-if="!isActive('/mypage')" class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd"/>
      </svg>
    </button>

    <!-- 만들기 바텀시트 -->
    <Transition name="sheet">
      <div v-if="showCreateMenu" class="create-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-content">
          <button class="sheet-item" @click="handleCreate('feed')">
            <div class="sheet-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <div class="sheet-text">
              <span class="sheet-title">피드</span>
              <span class="sheet-desc">일상을 공유해보세요</span>
            </div>
          </button>
          <button class="sheet-item" @click="handleCreate('battle')">
            <div class="sheet-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div class="sheet-text">
              <span class="sheet-title">배틀</span>
              <span class="sheet-desc">제품 대결을 만들어보세요</span>
            </div>
          </button>
          <button class="sheet-item" @click="handleCreate('product')">
            <div class="sheet-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div class="sheet-text">
              <span class="sheet-title">제품</span>
              <span class="sheet-desc">새 제품을 등록해보세요</span>
            </div>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 오버레이 -->
    <Transition name="fade">
      <div v-if="showCreateMenu" class="overlay" @click="closeCreateMenu"></div>
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
const showCreateMenu = ref(false);

const isActive = (path) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/';
  }
  return route.path.startsWith(path);
};

const openCreateMenu = () => {
  showCreateMenu.value = true;
};

const closeCreateMenu = () => {
  showCreateMenu.value = false;
};

const handleMyPage = async () => {
  if (isLoggedIn.value) {
    router.push({ name: 'MyPage' });
    return;
  }
  if (confirm('로그인이 필요합니다.')) {
    await router.push({ name: 'Login', query: { redirect: route.fullPath } });
  }
};

const handleCreate = async (type) => {
  closeCreateMenu();

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
  if (e.key === 'Escape') closeCreateMenu();
};

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: calc(50px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  border-top: 1px solid #efefef;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.nav-item {
  flex: 1;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #262626;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s ease;
}

.nav-item:active {
  transform: scale(0.92);
}

.nav-item.active {
  color: #262626;
}

.nav-icon {
  width: 26px;
  height: 26px;
}

/* 중앙 만들기 버튼 */
.create-btn .create-icon-wrapper {
  width: 26px;
  height: 26px;
  border: 1.5px solid #262626;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-btn .nav-icon {
  width: 18px;
  height: 18px;
}

/* 바텀시트 */
.create-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom));
  z-index: 1002;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: #dbdbdb;
  border-radius: 2px;
  margin: 0 auto 16px;
}

.sheet-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sheet-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 12px;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.sheet-item:hover {
  background: #fafafa;
}

.sheet-item:active {
  background: #f0f0f0;
}

.sheet-icon {
  width: 44px;
  height: 44px;
  background: #fafafa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #262626;
}

.sheet-icon svg {
  width: 22px;
  height: 22px;
}

.sheet-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sheet-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}

.sheet-desc {
  font-size: 13px;
  color: #8e8e8e;
}

/* 오버레이 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1001;
}

/* 트랜지션 */
.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
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
  .bottom-nav {
    display: none;
  }
}
</style>
