<template>
  <nav class="bottom-nav">
    <!-- 플로팅 등록 버튼 (알약 위 우측) -->
    <div v-if="!isMoreMenuOpen && !isOnCarrier" class="fab-wrap">
      <button class="fab" :class="{ open: isCreateMenuOpen }" @click="toggleCreateMenu" aria-label="등록">
        <svg class="fab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
    </div>

    <div class="pill">
      <!-- 피드 -->
      <router-link to="/feed" class="nav-tab" :class="{ active: isActive('/feed') }">
        <span class="icon-slot">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clip-rule="evenodd"/>
            <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"/>
          </svg>
        </span>
        <span class="nav-label">피드</span>
      </router-link>

      <!-- 핫 아이템 -->
      <router-link to="/products" class="nav-tab" :class="{ active: isActive('/products') }">
        <span class="icon-slot">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
          </svg>
        </span>
        <span class="nav-label">핫 아이템</span>
      </router-link>

      <!-- 요거픽 -->
      <router-link to="/battle" class="nav-tab" :class="{ active: isActive('/battle') }">
        <span class="icon-slot">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd"/>
          </svg>
        </span>
        <span class="nav-label">요거픽</span>
      </router-link>

      <!-- 캐꾸 (캐리어 꾸미기) -->
      <button class="nav-tab" :class="{ active: isActive('/carrier') }" @click="handleCarrier">
        <span class="icon-slot">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M8 6a4 4 0 118 0v2h1a3 3 0 013 3v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9a3 3 0 013-3h1V6zm6 2V6a2 2 0 10-4 0v2h4zm-2 4.7a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"/>
          </svg>
        </span>
        <span class="nav-label">캐꾸</span>
      </button>

      <!-- 더보기 -->
      <button class="nav-tab" :class="{ active: isMoreMenuOpen || isActive('/mypage') || isActive('/chat') }" @click="toggleMoreMenu">
        <span class="icon-slot">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
          </svg>
        </span>
        <span class="nav-label">더보기</span>
      </button>
    </div>

    <!-- 등록 메뉴 (FAB 우측 정렬) -->
    <Transition name="sheet-up">
      <div v-if="isCreateMenuOpen" class="action-sheet create-sheet">
        <button class="sheet-item" @click="handleCreate('feed')">
          <span class="sheet-icon feed">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </span>
          <div class="sheet-content">
            <span class="sheet-text">인증 올리기</span>
            <span class="sheet-desc">자랑하고 싶은 아이템이 있나요?</span>
          </div>
        </button>
        <button class="sheet-item" @click="handleCreate('battle')">
          <span class="sheet-icon battle">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </span>
          <div class="sheet-content">
            <span class="sheet-text">요거픽 등록</span>
            <span class="sheet-desc">최고의 아이템, 투표로 정해봐요</span>
          </div>
        </button>
        <div class="sheet-divider"></div>
        <button class="sheet-item" @click="handleCreate('product')">
          <span class="sheet-icon product">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </span>
          <div class="sheet-content">
            <span class="sheet-text">아이템 등록</span>
            <span class="sheet-desc">없는 아이템을 직접 추가해요</span>
          </div>
        </button>
      </div>
    </Transition>

    <!-- 더보기 메뉴 (우측 정렬) -->
    <Transition name="sheet-up">
      <div v-if="isMoreMenuOpen" class="action-sheet more-sheet">
        <button class="sheet-item" @click="handleMoreNav('home')">
          <span class="sheet-icon home">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </span>
          <div class="sheet-content">
            <span class="sheet-text">홈</span>
            <span class="sheet-desc">대시보드로 이동해요</span>
          </div>
        </button>
        <div class="sheet-divider"></div>
        <button class="sheet-item" @click="handleMoreNav('chat')">
          <span class="sheet-icon chat">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </span>
          <div class="sheet-content">
            <span class="sheet-text">메시지</span>
            <span class="sheet-desc">다른 사용자와 대화해요</span>
          </div>
        </button>
        <button class="sheet-item" @click="handleMoreNav('mypage')">
          <span class="sheet-icon mypage">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </span>
          <div class="sheet-content">
            <span class="sheet-text">마이페이지</span>
            <span class="sheet-desc">내 정보와 활동을 관리해요</span>
          </div>
        </button>
        <button class="sheet-item" @click="handleMoreNav('collection')">
          <span class="sheet-icon collection">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 2l2.39 4.84L20 8l-4 3.9.94 5.5L12 14.77 7.06 17.4 8 11.9 4 8l5.61-1.16L12 2z"/>
            </svg>
          </span>
          <div class="sheet-content">
            <span class="sheet-text">컬렉션</span>
            <span class="sheet-desc">레벨과 뱃지를 모아봐요</span>
          </div>
        </button>
        <div class="sheet-divider"></div>
        <button class="sheet-item" @click="openFeedback">
          <span class="sheet-icon feedback">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </span>
          <div class="sheet-content">
            <span class="sheet-text">의견 보내기</span>
            <span class="sheet-desc">익명으로 자유롭게 남겨주세요</span>
          </div>
        </button>
        <template v-if="isAdmin">
          <div class="sheet-divider"></div>
          <button class="sheet-item" @click="handleMoreNav('admin')">
            <span class="sheet-icon admin">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="1.8"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="1.8"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="1.8"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke-width="1.8"/>
              </svg>
            </span>
            <div class="sheet-content">
              <span class="sheet-text">관리자</span>
              <span class="sheet-desc">관리자 대시보드</span>
            </div>
          </button>
        </template>
        <div class="sheet-divider"></div>
        <button v-if="isLoggedIn" class="sheet-item logout" @click="handleLogout">
          <span class="sheet-icon logout-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </span>
          <div class="sheet-content">
            <span class="sheet-text">로그아웃</span>
          </div>
        </button>
      </div>
    </Transition>

    <!-- Overlay (투명) -->
    <div v-if="isCreateMenuOpen || isMoreMenuOpen" class="overlay" @click="closeAllMenus"></div>

    <!-- 의견 보내기 모달 -->
    <FeedbackModal :visible="showFeedback" @close="showFeedback = false" />
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import FeedbackModal from '@/components/common/FeedbackModal.vue';

const router = useRouter();
const route = useRoute();
const { isLoggedIn, isAdmin, logout } = useAuth();
const { openLoginRequired, open } = useConfirmDialog();
const isCreateMenuOpen = ref(false);
const isMoreMenuOpen = ref(false);
const showFeedback = ref(false);

const openFeedback = () => {
  closeAllMenus();
  showFeedback.value = true;
};

const isActive = (path) => {
  return route.path.startsWith(path);
};

const isOnCarrier = computed(() => route.path.startsWith('/carrier'));

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
  home: { name: 'Dashboard', path: '/' },
  chat: { name: 'Chat', path: '/chat' },
  mypage: { name: 'MyPage', path: '/mypage' },
  collection: { name: 'Collection', path: '/collection' },
  admin: { name: 'AdminDashboard', path: '/admin' },
};

const handleCarrier = async () => {
  closeAllMenus();
  if (isLoggedIn.value) {
    router.push('/carrier');
    return;
  }
  const confirmed = await openLoginRequired('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?');
  if (confirmed) {
    await router.push({ name: 'Login', query: { redirect: '/carrier' } });
  }
};

const handleMoreNav = async (key) => {
  closeAllMenus();
  const target = moreNavMap[key];
  if (!target) return;

  if (key === 'home' || key === 'collection') {
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
/* ===================== Container ===================== */
.bottom-nav {
  --brand: #9333EA;
  --brand-deep: #7c3aed;
  --ink: #0A0E1A;
  --text-dim: #94A3B8;
  --border: #F1F3F6;
  --surface: #ffffff;

  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.bottom-nav > * {
  pointer-events: auto;
}

/* ===================== Pill ===================== */
.pill {
  width: 100%;
  max-width: 420px;
  height: 60px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 22px;
  display: flex;
  align-items: stretch;
  padding: 6px;
  box-shadow:
    0 1px 2px rgba(10, 14, 26, 0.04),
    0 8px 24px rgba(10, 14, 26, 0.08),
    0 24px 48px -12px rgba(10, 14, 26, 0.1);
  position: relative;
  z-index: 2;
}

.nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: none;
  border: none;
  text-decoration: none;
  color: var(--text-dim);
  cursor: pointer;
  border-radius: 16px;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s ease, background 0.15s ease, transform 0.1s ease;
}

.nav-tab:active {
  transform: scale(0.94);
}

.nav-tab.active {
  color: var(--ink);
}

.icon-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.nav-icon {
  width: 22px;
  height: 22px;
}

.nav-label {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: -0.2px;
  line-height: 1;
}

.nav-tab.active .nav-label {
  font-weight: 800;
}

/* ===================== Floating FAB ===================== */
.fab-wrap {
  position: absolute;
  bottom: calc(100% + 14px);
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 420px;
  display: flex;
  justify-content: flex-end;
  padding-right: 8px;
  box-sizing: border-box;
  z-index: 3;
  pointer-events: none;
}

.fab {
  pointer-events: auto;
  width: 52px;
  height: 52px;
  background: var(--brand);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 1px 2px rgba(124, 58, 237, 0.2),
    0 8px 20px rgba(124, 58, 237, 0.32);
  transition: transform 0.2s ease, background 0.15s ease, box-shadow 0.2s ease;
}

.fab:active {
  transform: scale(0.93);
}

.fab.open {
  background: var(--ink);
  transform: rotate(45deg);
  box-shadow:
    0 1px 2px rgba(10, 14, 26, 0.2),
    0 8px 20px rgba(10, 14, 26, 0.28);
}

.fab-icon {
  width: 22px;
  height: 22px;
}

/* ===================== Action Sheet (공통 팝업) ===================== */
.action-sheet {
  position: absolute;
  bottom: calc(100% + 8px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 6px;
  box-shadow:
    0 1px 2px rgba(10, 14, 26, 0.04),
    0 12px 32px rgba(10, 14, 26, 0.1),
    0 24px 48px -16px rgba(10, 14, 26, 0.12);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 1002;
  min-width: 248px;
  max-width: calc(100vw - 32px);
  max-height: 65vh;
  overflow-y: auto;
}

.create-sheet {
  right: 24px;
}

.more-sheet {
  right: 24px;
}

.sheet-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s ease;
  text-align: left;
}

.sheet-item:active {
  background: #F7F8FA;
}

.sheet-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sheet-icon svg {
  width: 18px;
  height: 18px;
}

.sheet-icon.feed { background: #EFF6FF; color: #3b82f6; }
.sheet-icon.battle { background: #FEF3C7; color: #f97316; }
.sheet-icon.product { background: #F0FDF4; color: #10b981; }
.sheet-icon.home { background: #F0FDF4; color: #16a34a; }
.sheet-icon.carrier { background: #FAF5FF; color: #9333ea; }
.sheet-icon.chat { background: #FEF3C7; color: #d97706; }
.sheet-icon.mypage { background: #E0E7FF; color: #4f46e5; }
.sheet-icon.collection { background: #FEF9C3; color: #EAB308; }
.sheet-icon.admin { background: #FFF7ED; color: #ea580c; }
.sheet-icon.feedback { background: #F1F5F9; color: #475569; }
.sheet-icon.logout-icon { background: #FEF2F2; color: #dc2626; }

.sheet-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sheet-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.2px;
}

.sheet-desc {
  font-size: 11px;
  font-weight: 500;
  color: #94A3B8;
  letter-spacing: -0.1px;
}

.sheet-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 12px;
}

.sheet-item.logout .sheet-text {
  color: #dc2626;
}

/* ===================== Overlay ===================== */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
}

/* ===================== Transitions ===================== */
.sheet-up-enter-active,
.sheet-up-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.sheet-up-enter-from,
.sheet-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* 태블릿 이상에서 숨김 */
@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}
</style>
