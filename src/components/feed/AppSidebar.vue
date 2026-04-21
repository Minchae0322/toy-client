<template>
  <aside class="sidebar-left">
    <nav class="nav-menu">
      <!-- 메인 메뉴 섹션 -->
      <div class="nav-section">
        <router-link to="/" class="nav-item" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span class="nav-text">홈</span>
        </router-link>

        <router-link to="/feed" class="nav-item" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H7v-2h5v2zm3-4H7v-2h8v2zm0-4H7V7h8v2z"/>
          </svg>
          <span class="nav-text">피드</span>
        </router-link>

        <router-link to="/battle" class="nav-item" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.5 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-5-2a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
          </svg>
          <span class="nav-text">요거픽</span>
        </router-link>

        <router-link to="/products" class="nav-item" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
          </svg>
          <span class="nav-text">핫 아이템</span>
        </router-link>

        <component
          :is="isLoggedIn ? 'router-link' : 'button'"
          :to="isLoggedIn ? '/carrier' : undefined"
          class="nav-item"
          active-class="active"
          @click="!isLoggedIn && handleProtectedRoute('carrier')"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a4 4 0 0 0-8 0v2"/>
            <circle cx="12" cy="15" r="2"/>
          </svg>
          <span class="nav-text">캐리어 꾸미기</span>
        </component>
      </div>

      <!-- 커뮤니케이션 섹션 -->
      <div class="nav-section">
        <button class="nav-item" @click="handleProtectedRoute('collections')">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
          </svg>
          <span class="nav-text">컬렉션</span>
        </button>
      </div>

      <!-- 마이페이지 섹션 (로그인 시에만 표시) -->
      <div v-if="isLoggedIn" class="nav-section">
        <button class="nav-item" @click="handleProtectedRoute('mypage')">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
          </svg>
          <span class="nav-text">마이페이지</span>
        </button>
      </div>
    </nav>

    <!-- 액션 버튼들 (서브틀 컬러 바) -->
    <div class="action-buttons">
      <!-- 사용자 활동 버튼 -->
      <button class="btn-subtle btn-purple" @click="handleProtectedRoute('create')">
        <div class="btn-content">
          <span class="btn-text">인증 올리기</span>
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
  </aside>
</template>

<script setup>
import {useRouter} from 'vue-router';
import {useAuth} from '@/composables/useAuth';
import {useConfirmDialog} from '@/composables/useConfirmDialog';

const router = useRouter();
const {isLoggedIn, userId} = useAuth();
const {open, openLoginRequired} = useConfirmDialog();

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
  background: #ffffff;
  border-right: 1px solid #F1F3F6;
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
  border-bottom: 1px solid #F1F3F6;
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
  background: #F7F8FA;
}

.nav-item.active {
  background: #F3EAFD;
}

.nav-item .icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #8B95A1;
  transition: color 0.15s ease;
}

.nav-item:hover .icon {
  color: #4E5968;
}

.nav-item.active .icon {
  color: #9333EA;
}

.nav-text {
  font-size: 14px;
  font-weight: 600;
  color: #4E5968;
  letter-spacing: -0.2px;
  transition: color 0.15s ease;
}

.nav-item:hover .nav-text {
  color: #333D4B;
}

.nav-item.active .nav-text {
  color: #7C3AED;
  font-weight: 700;
}

.badge {
  margin-left: auto;
  padding: 2px 7px;
  background: #F7F8FA;
  color: #6B7684;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  min-width: 20px;
  text-align: center;
}

.badge-red {
  background: #FEF2F2;
  color: #DC2626;
}

/* ===== 액션 버튼 ===== */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-divider {
  height: 1px;
  background: #F1F3F6;
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
  background: #FAF5FF;
  border: 1px solid #EDE5F7;
}

.btn-purple:hover {
  background: #F3EAFD;
  border-color: #D8B4FE;
}

.btn-purple .btn-text {
  color: #7C3AED;
}

/* 주황 */
.btn-orange {
  background: #FFF7ED;
  border: 1px solid #FEE4C8;
}

.btn-orange:hover {
  background: #FFEDD5;
  border-color: #FDBA74;
}

.btn-orange .btn-text {
  color: #C2410C;
}

/* 다크 */
.btn-dark {
  background: #F7F8FA;
  border: 1px solid #E5E8EB;
}

.btn-dark:hover {
  background: #F2F4F6;
  border-color: #D1D6DB;
}

.btn-dark .btn-text {
  color: #333D4B;
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
  color: #8B95A1;
  letter-spacing: -0.1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.btn-subtle:hover .btn-desc {
  color: #6B7684;
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
  background: #9333EA;
}

.btn-icon-orange {
  background: #F97316;
}

.btn-icon-dark {
  background: #333D4B;
}

.btn-icon {
  width: 13px;
  height: 13px;
  color: #ffffff;
  stroke-width: 2.5;
}
</style>