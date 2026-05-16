<template>
  <aside class="sidebar-left">
    <nav class="nav-menu">
      <!-- 메인 메뉴 섹션 -->
      <div class="nav-section">
        <router-link to="/" class="nav-item" active-class="active">
          <HomeOutline class="icon icon-line" />
          <HomeSolid class="icon icon-solid" />
          <span class="nav-text">홈</span>
        </router-link>

        <router-link to="/feed" class="nav-item" active-class="active">
          <FeedOutline class="icon icon-line" />
          <FeedSolid class="icon icon-solid" />
          <span class="nav-text">피드</span>
        </router-link>

        <router-link to="/products" class="nav-item" active-class="active">
          <HotOutline class="icon icon-line" />
          <HotSolid class="icon icon-solid" />
          <span class="nav-text">핫 아이템</span>
        </router-link>

        <router-link to="/battle" class="nav-item" active-class="active">
          <PickOutline class="icon icon-line" />
          <PickSolid class="icon icon-solid" />
          <span class="nav-text">요거픽</span>
        </router-link>

        <component
          :is="isLoggedIn ? 'router-link' : 'button'"
          :to="isLoggedIn ? '/carrier' : undefined"
          class="nav-item"
          active-class="active"
          @click="!isLoggedIn && handleProtectedRoute('carrier')"
        >
          <CarrierOutline class="icon icon-line" />
          <CarrierSolid class="icon icon-solid" />
          <span class="nav-text">캐리어 꾸미기</span>
        </component>
      </div>

      <!-- 커뮤니케이션 섹션 -->
      <div class="nav-section">
        <button class="nav-item" :class="{ active: isCollectionsActive }" @click="handleProtectedRoute('collections')">
          <CollectionOutline class="icon icon-line" />
          <CollectionSolid class="icon icon-solid" />
          <span class="nav-text">컬렉션</span>
        </button>
      </div>

      <!-- 마이페이지 섹션 (로그인 시에만 표시) -->
      <div v-if="isLoggedIn" class="nav-section">
        <button class="nav-item" :class="{ active: isMyPageActive }" @click="handleProtectedRoute('mypage')">
          <MyOutline class="icon icon-line" />
          <MySolid class="icon icon-solid" />
          <span class="nav-text">마이페이지</span>
        </button>
      </div>

      <!-- 환경설정 (로그인 무관) -->
      <div class="nav-section">
        <router-link to="/settings" class="nav-item" active-class="active">
          <SettingsOutline class="icon icon-line" />
          <SettingsSolid class="icon icon-solid" />
          <span class="nav-text">환경설정</span>
        </router-link>
      </div>
    </nav>

    <!-- 액션 버튼들 (서브틀 컬러 바) -->
    <div class="action-buttons">
      <!-- 사용자 활동 버튼 -->
      <button class="btn-subtle btn-purple" @click="handleProtectedRoute('create')">
        <div class="btn-content">
          <span class="btn-text">피드 올리기</span>
          <span class="btn-desc">자랑하고 싶은 아이템이 있나요?</span>
        </div>
        <div class="btn-icon-circle btn-icon-purple">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
      </button>

      <button class="btn-subtle btn-orange" @click="handleProtectedRoute('createBattle')">
        <div class="btn-content">
          <span class="btn-text">요거픽 등록하기</span>
          <span class="btn-desc">최고의 아이템, 투표로 정해봐요</span>
        </div>
        <div class="btn-icon-circle btn-icon-orange">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
      </button>

      <!-- 구분선 -->
      <div class="action-divider"></div>

      <!-- 관리자/제품 등록 버튼 -->
      <button class="btn-subtle btn-dark" @click="handleProtectedRoute('createProduct')">
        <div class="btn-content">
          <span class="btn-text">새로운 아이템 등록하기</span>
          <span class="btn-desc">없는 아이템을 직접 추가해요</span>
        </div>
        <div class="btn-icon-circle btn-icon-dark">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
      </button>
    </div>

    <!-- 사이드바 최하단: 의견 보내기 (저시각 비중) -->
    <button type="button" class="feedback-link" @click="showFeedback = true">
      <svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <span>의견 보내기 <span class="feedback-anon">(익명)</span></span>
    </button>

    <FeedbackModal :visible="showFeedback" @close="showFeedback = false" />
  </aside>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {computed} from 'vue';
import {
  HomeIcon as HomeOutline,
  ChatBubbleLeftRightIcon as FeedOutline,
  FireIcon as HotOutline,
  TrophyIcon as PickOutline,
  SparklesIcon as CollectionOutline,
  UserCircleIcon as MyOutline,
  Cog6ToothIcon as SettingsOutline
} from '@heroicons/vue/24/outline';
import {
  HomeIcon as HomeSolid,
  ChatBubbleLeftRightIcon as FeedSolid,
  FireIcon as HotSolid,
  TrophyIcon as PickSolid,
  SparklesIcon as CollectionSolid,
  UserCircleIcon as MySolid,
  Cog6ToothIcon as SettingsSolid
} from '@heroicons/vue/24/solid';
import CarrierOutline from '@/components/icons/CarrierLineIcon.vue';
import CarrierSolid from '@/components/icons/CarrierSolidIcon.vue';
import {useAuth} from '@/composables/useAuth';
import {useConfirmDialog} from '@/composables/useConfirmDialog';
import FeedbackModal from '@/components/common/FeedbackModal.vue';

const router = useRouter();
const route = useRoute();
const isCollectionsActive = computed(() => route.path.startsWith('/collection'));
const isMyPageActive = computed(() => route.path.startsWith('/mypage'));
const {isLoggedIn, userId} = useAuth();
const {open, openLoginRequired} = useConfirmDialog();

const showFeedback = ref(false);

const handleProtectedRoute = async (routeName) => {
  console.log(`=== ${routeName} 클릭 ===`);
  console.log('로그인 상태:', isLoggedIn.value);

  if (isLoggedIn.value) {
    switch (routeName) {
      case 'mypage':
        router.push({name: 'MyPage'});
        break;
      case 'create':
        router.push({name: 'FeedCreate'});
        break;
      case 'createProduct':
        router.push({name: 'ProductCreate'});
        break;
      case 'createBattle':
        router.push({name: 'BattleCreate'});
        break;
      case 'collections':
        router.push({ name: 'Collection' });
        break;
      case 'carrier':
        router.push('/carrier');
        break;
    }
    return;
  }

  const confirmed = await openLoginRequired('로그인이 필요한 페이지입니다.\n로그인 페이지로 이동하시겠습니까?');

  if (confirmed) {
    console.log('✅ 로그인 페이지로 이동');
    await router.push({
      name: 'Login',
      query: {redirect: router.currentRoute.value.fullPath}
    });
  } else {
    console.log('❌ 취소됨');
  }
};
</script>

<style scoped>
.sidebar-left {
  width: 240px;
  height: calc(100vh - 66px);
  top: 66px;
  background: var(--bg-base);
  border-right: 1px solid var(--border-default);
  padding: 24px 14px;
  display: none;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  position: sticky;
  align-self: flex-start;
  flex-shrink: 0;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .sidebar-left {
    display: flex;
  }
}

/* ===== 네비게이션 ===== */
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-default);
}

.nav-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.nav-section:first-child {
  padding-top: 0;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
  font-family: inherit;
}

.nav-item:hover {
  background: var(--bg-subtle);
}

.nav-item.active {
  background: var(--c-brand-soft);
}

.nav-item .icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--c-text-400);
  transition: color 0.15s ease;
}
/* 활성 상태: outline 숨기고 solid 표시 */
.nav-item .icon-solid { display: none; }
.nav-item.active .icon-line { display: none; }
.nav-item.active .icon-solid { display: block; }

.nav-item:hover .icon {
  color: var(--c-text-600);
}

.nav-item.active .icon {
  color: var(--c-brand);
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-600);
  letter-spacing: -0.2px;
  transition: color 0.15s ease;
}

.nav-item:hover .nav-text {
  color: var(--text-primary);
}

.nav-item.active .nav-text {
  color: var(--c-brand-hover);
  font-weight: 600;
}

.badge {
  margin-left: auto;
  padding: 2px 7px;
  background: var(--bg-subtle);
  color: var(--c-text-500);
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  min-width: 20px;
  text-align: center;
}

.badge-red {
  background: var(--c-danger-soft);
  color: var(--c-danger);
}

/* ===== 액션 버튼 ===== */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-divider {
  height: 1px;
  background: var(--border-default);
  margin: 4px 0;
}

.btn-subtle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

/* 보라 */
.btn-purple {
  background: var(--c-brand-soft);
  border: 1px solid var(--c-brand-soft);
}

.btn-purple:hover {
  background: var(--c-brand-soft);
  border-color: var(--c-brand-soft);
}

.btn-purple .btn-text {
  color: var(--c-brand-hover);
}

/* 주황 */
.btn-orange {
  background: var(--c-heat-soft);
  border: 1px solid var(--c-heat-soft);
}

.btn-orange:hover {
  background: var(--c-heat-soft);
  border-color: var(--c-heat);
}

.btn-orange .btn-text {
  color: var(--c-heat);
}

/* 다크 */
.btn-dark {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
}

.btn-dark:hover {
  background: var(--bg-mute);
  border-color: var(--c-text-300);
}

.btn-dark .btn-text {
  color: var(--text-primary);
}

/* 다크 모드: soft 톤 배경 위에 같은 컬러 텍스트면 가독성 떨어짐 → 흰색으로 */
:root[data-theme="dark"] .btn-purple .btn-text,
:root[data-theme="dark"] .btn-orange .btn-text {
  color: var(--text-primary);
}

/* 버튼 내부 */
.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.btn-text {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: -0.2px;
  transition: color 0.15s ease;
}

.btn-desc {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-400);
  letter-spacing: -0.1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.btn-subtle:hover .btn-desc {
  color: var(--c-text-500);
}

/* + 아이콘 */
.btn-icon-circle {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.btn-subtle:hover .btn-icon-circle {
  transform: scale(1.08);
}

.btn-icon-purple {
  background: var(--c-brand);
}

.btn-icon-orange {
  background: var(--c-heat);
}

.btn-icon-dark {
  background: var(--c-ink-900);
}

.btn-icon {
  width: 13px;
  height: 13px;
  color: #ffffff;
  stroke-width: 2.5;
}

/* ===== 사이드바 최하단: 의견 보내기 ===== */
.feedback-link {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding: 8px 4px 0;
  background: transparent;
  border: none;
  border-top: 1px solid var(--border-default);
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-400);
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.1px;
  transition: color 0.15s ease;
}
.feedback-link:hover { color: var(--c-text-600); }
.feedback-icon { width: 13px; height: 13px; flex-shrink: 0; }
.feedback-anon { color: var(--c-text-300); font-weight: 400; margin-left: 2px; }
</style>