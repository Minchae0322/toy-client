<template>
  <nav class="bottom-nav">
    <!-- 플로팅 등록 버튼 (알약 위 우측) -->
    <div v-if="!isMoreMenuOpen && !isOnCarrier" class="fab-wrap">
      <button class="fab" :class="{ open: isCreateMenuOpen, collapsed: isFabCollapsed }" @click="toggleCreateMenu" aria-label="글쓰기">
        <svg class="fab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        <span class="fab-label">글쓰기</span>
      </button>
    </div>

    <div class="pill">
      <!-- 피드 -->
      <router-link to="/feed" class="nav-tab" :class="{ active: isActive('/feed') }">
        <span class="icon-slot">
          <MessageSquareText class="nav-icon" :stroke-width="1.8" />
        </span>
        <span class="nav-label">피드</span>
      </router-link>

      <!-- 핫 아이템 -->
      <router-link to="/products" class="nav-tab" :class="{ active: isActive('/products') }">
        <span class="icon-slot">
          <Flame class="nav-icon" :stroke-width="1.8" />
        </span>
        <span class="nav-label">핫 아이템</span>
      </router-link>

      <!-- 요거픽 -->
      <router-link to="/battle" class="nav-tab" :class="{ active: isActive('/battle') }">
        <span class="icon-slot">
          <Trophy class="nav-icon nav-icon-line" :stroke-width="1.8" />
          <TrophySolid class="nav-icon nav-icon-solid" />
        </span>
        <span class="nav-label">요거픽</span>
      </router-link>

      <!-- 캐꾸 (캐리어 꾸미기) -->
      <button class="nav-tab" :class="{ active: isActive('/carrier') }" @click="handleCarrier">
        <span class="icon-slot">
          <Luggage class="nav-icon" :stroke-width="1.8" />
        </span>
        <span class="nav-label">캐꾸</span>
      </button>

      <!-- 더보기 -->
      <button class="nav-tab" :class="{ active: isMoreMenuOpen || isActive('/mypage') || isActive('/chat') }" @click="toggleMoreMenu">
        <span class="icon-slot">
          <MoreHorizontal class="nav-icon" :stroke-width="1.8" />
        </span>
        <span class="nav-label">더보기</span>
      </button>
    </div>

    <!-- 등록 메뉴 (FAB 우측 정렬) -->
    <Transition name="sheet-up">
      <div v-if="isCreateMenuOpen" class="action-sheet create-sheet">
        <button class="sheet-item" @click="handleCreate('feed')">
          <span class="sheet-icon feed">
            <PenSquare :stroke-width="1.8" />
          </span>
          <div class="sheet-content">
            <span class="sheet-text">피드 올리기</span>
            <span class="sheet-desc">자랑하고 싶은 아이템이 있나요?</span>
          </div>
        </button>
        <button class="sheet-item" @click="handleCreate('battle')">
          <span class="sheet-icon battle">
            <Trophy :stroke-width="1.8" />
          </span>
          <div class="sheet-content">
            <span class="sheet-text">요거픽 등록</span>
            <span class="sheet-desc">최고의 아이템, 투표로 정해봐요</span>
          </div>
        </button>
        <div class="sheet-divider"></div>
        <button class="sheet-item" @click="handleCreate('product')">
          <span class="sheet-icon product">
            <Package :stroke-width="1.8" />
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
            <Home :stroke-width="1.8" />
          </span>
          <div class="sheet-content">
            <span class="sheet-text">홈</span>
            <span class="sheet-desc">대시보드로 이동해요</span>
          </div>
        </button>
        <div class="sheet-divider"></div>
        <button class="sheet-item" @click="handleMoreNav('chat')">
          <span class="sheet-icon chat">
            <MessageCircle :stroke-width="1.8" />
          </span>
          <div class="sheet-content">
            <span class="sheet-text">메시지</span>
            <span class="sheet-desc">다른 사용자와 대화해요</span>
          </div>
        </button>
        <button class="sheet-item" @click="handleMoreNav('collection')">
          <span class="sheet-icon collection">
            <Sparkles :stroke-width="1.8" />
          </span>
          <div class="sheet-content">
            <span class="sheet-text">컬렉션</span>
            <span class="sheet-desc">레벨과 뱃지를 모아봐요</span>
          </div>
        </button>
        <div class="sheet-divider"></div>
        <button class="sheet-item" @click="handleMoreNav('settings')">
          <span class="sheet-icon settings">
            <Settings :stroke-width="1.8" />
          </span>
          <div class="sheet-content">
            <span class="sheet-text">환경설정</span>
            <span class="sheet-desc">화면 모드(라이트/다크)를 바꿔요</span>
          </div>
        </button>
        <button class="sheet-item" @click="openFeedback">
          <span class="sheet-icon feedback">
            <MessageSquare :stroke-width="1.8" />
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
              <LayoutGrid :stroke-width="1.8" />
            </span>
            <div class="sheet-content">
              <span class="sheet-text">관리자</span>
              <span class="sheet-desc">관리자 대시보드</span>
            </div>
          </button>
        </template>
        <div class="sheet-divider"></div>
        <button class="sheet-item" @click="handleMoreNav('mypage')">
          <span class="sheet-icon mypage">
            <UserCircle :stroke-width="1.8" />
          </span>
          <div class="sheet-content">
            <span class="sheet-text">마이페이지</span>
            <span class="sheet-desc">내 정보와 활동을 관리해요</span>
          </div>
        </button>
        <button v-if="isLoggedIn" class="sheet-item logout" @click="handleLogout">
          <span class="sheet-icon logout-icon">
            <LogOut :stroke-width="1.8" />
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
import {
  MessageSquareText, Flame, Trophy, Luggage, MoreHorizontal,
  PenSquare, Package, Home, MessageCircle, Sparkles,
  Settings, MessageSquare, LayoutGrid, UserCircle, LogOut
} from 'lucide-vue-next';
import { TrophyIcon as TrophySolid } from '@heroicons/vue/24/solid';
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
  notifications: { name: 'NotificationSettings', path: '/settings/notifications' },
  settings: { name: 'Settings', path: '/settings' },
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

  if (key === 'home' || key === 'collection' || key === 'settings') {
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

// FAB 축소/확장 (당근마켓처럼 스크롤 시 글쓰기 라벨 숨김)
const isFabCollapsed = ref(false);
const handleFabScroll = () => {
  isFabCollapsed.value = window.scrollY > 80;
};

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('scroll', handleFabScroll, { passive: true });
  handleFabScroll();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  window.removeEventListener('scroll', handleFabScroll);
});
</script>

<style scoped>
/* ===================== Container ===================== */
.bottom-nav {
  --brand: var(--c-brand);
  --brand-deep: var(--c-brand-hover);
  /* --ink 는 텍스트 색 용도로 쓰이므로 자동 반전되는 text-primary 사용.
     배경/엄청 어두운 톤이 필요한 곳(.fab.open 등)에선 var(--c-ink-900) 직접 사용 */
  --ink: var(--text-primary);
  --text-dim: var(--c-text-400);
  --border: var(--border-default);
  --surface: var(--bg-elevated);

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
.nav-tab.active .nav-icon {
  fill: currentColor;
}
/* 솔리드 아이콘은 평소 숨김 → 활성 시에만 표시 */
.nav-tab .nav-icon-solid { display: none; }
.nav-tab.active .nav-icon-line { display: none; }
.nav-tab.active .nav-icon-solid { display: block; }

.icon-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.nav-icon {
  width: 20px;
  height: 20px;
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
  position: relative;
  width: 102px;
  height: 52px;
  background: var(--brand);
  border: none;
  border-radius: 26px;
  color: #ffffff;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  display: block;
  box-shadow:
    0 1px 2px rgba(124, 58, 237, 0.2),
    0 8px 20px rgba(124, 58, 237, 0.32);
  transition:
    width 0.42s cubic-bezier(0.32, 0.72, 0, 1),
    background 0.2s ease,
    box-shadow 0.25s ease,
    transform 0.2s ease;
}

.fab:active {
  transform: scale(0.93);
}

.fab.open {
  background: var(--c-ink-900);
  transform: rotate(45deg);
  width: 52px;
  box-shadow:
    0 1px 2px rgba(10, 14, 26, 0.2),
    0 8px 20px rgba(10, 14, 26, 0.28);
}

.fab.collapsed {
  width: 52px;
}

.fab-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  width: 22px;
  height: 22px;
  transform: translateY(-50%);
  transition: left 0.42s cubic-bezier(0.32, 0.72, 0, 1);
  flex-shrink: 0;
}

.fab.collapsed .fab-icon,
.fab.open .fab-icon {
  left: 15px;
}

.fab-label {
  position: absolute;
  top: 50%;
  left: 46px;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
  opacity: 1;
  transition:
    opacity 0.32s ease,
    transform 0.42s cubic-bezier(0.32, 0.72, 0, 1);
}

.fab.collapsed .fab-label,
.fab.open .fab-label {
  opacity: 0;
  transform: translate(-6px, -50%);
  transition:
    opacity 0.18s ease,
    transform 0.42s cubic-bezier(0.32, 0.72, 0, 1);
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
  background: var(--bg-subtle);
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

.sheet-icon.feed { background: var(--c-info-soft); color: var(--c-info); }
.sheet-icon.battle { background: var(--c-warning-soft); color: var(--c-heat); }
.sheet-icon.product { background: var(--c-success-soft); color: var(--c-success); }
.sheet-icon.home { background: var(--c-success-soft); color: var(--c-success); }
.sheet-icon.carrier { background: var(--c-brand-soft); color: var(--c-brand); }
.sheet-icon.chat { background: var(--c-warning-soft); color: var(--c-bronze); }
.sheet-icon.mypage { background: var(--c-info-soft); color: var(--c-info); }
.sheet-icon.collection { background: var(--c-warning-soft); color: var(--c-warning); }
.sheet-icon.admin { background: var(--c-heat-soft); color: var(--c-heat); }
.sheet-icon.notifications { background: var(--c-brand-soft); color: var(--c-brand); }
.sheet-icon.feedback { background: var(--bg-subtle); color: var(--c-text-600); }
.sheet-icon.logout-icon { background: var(--c-danger-soft); color: var(--c-danger); }

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
  color: var(--c-text-400);
  letter-spacing: -0.1px;
}

.sheet-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 12px;
}

.sheet-item.logout .sheet-text {
  color: var(--c-danger);
}

/* 다크 모드: 더보기 시트 가독성 보강 */
:root[data-theme="dark"] .sheet-desc {
  color: var(--c-text-500);
}
:root[data-theme="dark"] .sheet-item:active {
  background: var(--bg-mute);
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
