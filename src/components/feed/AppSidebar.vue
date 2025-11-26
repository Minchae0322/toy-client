<template>
  <aside class="sidebar-left">
    <div class="sidebar-header">
      <h1 class="logo">HYPE BATTLE</h1>
      <span class="logo-beta">BETA</span>
    </div>

    <nav class="nav-menu">
      <!-- 메인 메뉴 섹션 -->
      <div class="nav-section">
        <router-link
            to="/feed"
            class="nav-item"
            active-class="active"
        >
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span class="nav-text">홈</span>
        </router-link>

        <router-link
            to="/battle"
            class="nav-item"
            active-class="active"
        >
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.5 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-5-2a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
          </svg>
          <span class="nav-text">배틀</span>
          <span class="badge">12</span>
        </router-link>
      </div>

      <!-- 커뮤니케이션 섹션 -->
      <div class="nav-section">
        <button class="nav-item" @click="handleProtectedRoute('messages')">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
          </svg>
          <span class="nav-text">메시지</span>
          <span class="badge badge-red">3</span>
        </button>

        <button class="nav-item" @click="handleProtectedRoute('collections')">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
          </svg>
          <span class="nav-text">컬렉션</span>
        </button>
      </div>

      <!-- 프로필 섹션 -->
      <div class="nav-section">
        <button class="nav-item" @click="handleProtectedRoute('profile')">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
          <span class="nav-text">프로필</span>
        </button>
      </div>
    </nav>

    <button class="btn-create" @click="handleProtectedRoute('create')">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      <span>인증 올리기</span>
    </button>

    <div class="level-card" @click="handleProtectedRoute('profile')">
      <div class="level-info">
        <div class="level-badge">
          <span class="level-emoji">🔥</span>
          <span class="level-text">마니아</span>
          <span class="level-number">Lv.8</span>
        </div>
        <svg class="trending-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
      </div>

      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="progress-info">
          <span class="progress-percent">73%</span>
          <span class="progress-divider">·</span>
          <span class="progress-points">270 / 370</span>
        </div>
      </div>

      <p class="level-desc">다음 레벨까지 100 포인트 남음</p>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { isLoggedIn, userId } = useAuth();

const handleProtectedRoute = async (routeName) => {
  console.log(`=== ${routeName} 클릭 ===`);
  console.log('로그인 상태:', isLoggedIn.value);

  if (isLoggedIn.value) {
    switch (routeName) {
      case 'profile':
        goToMyProfile();
        break;
      case 'create':
        router.push({ name: 'FeedCreate' });
        break;
      case 'messages':
        console.log('메시지 페이지로 이동');
        break;
      case 'collections':
        console.log('컬렉션 페이지로 이동');
        break;
    }
    return;
  }

  const confirmed = confirm('로그인이 필요한 페이지입니다.\n로그인 페이지로 이동하시겠습니까?');

  if (confirmed) {
    console.log('✅ 로그인 페이지로 이동');
    await router.push({
      name: 'Login',
      query: { redirect: router.currentRoute.value.fullPath }
    });
  } else {
    console.log('❌ 취소됨');
  }
};

const goToMyProfile = async () => {
  try {
    if (!userId.value) {
      console.error('❌ userId가 없습니다');
      return;
    }

    console.log('🚀 프로필 페이지로 이동:', userId.value);
    await router.push({
      name: 'UserFeedList',
      params: { userId: String(userId.value) }
    });
    console.log('✅ 이동 완료');

  } catch (error) {
    console.error('❌ 프로필 이동 실패:', error);
    alert('프로필 페이지로 이동할 수 없습니다.');
  }
};
</script>

<style scoped>
.sidebar-left {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  padding: 28px 16px;
  display: none;
  flex-direction: column;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

@media (min-width: 1024px) {
  .sidebar-left {
    display: flex;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 40px;
}

.logo {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #000;
  margin: 0;
}

.logo-beta {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.5);
  font-size: 8px;
  font-weight: 700;
  border-radius: 3px;
  letter-spacing: 0.05em;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* 섹션 구분 */
.nav-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
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
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  text-decoration: none;
  font-family: inherit;
}

.nav-item:hover {
  background: #ffffff;
}

.nav-item .icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.4);
  stroke-width: 2;
}

.nav-item.active .icon {
  color: #9333ea;
  stroke-width: 2.5;
}

/* 텍스트에만 밑줄 */
.nav-text {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: -0.01em;
  transition: all 0.2s;
}

.nav-item.active .nav-text {
  color: #9333ea;
  font-weight: 600;
  border-bottom: 2px solid #9333ea;
  padding-bottom: 2px;
}

.badge {
  margin-left: auto;
  padding: 2px 6px;
  background: #ffffff;
  color: rgba(0, 0, 0, 0.5);
  font-size: 11px;
  font-weight: 600;
  border-radius: 5px;
  min-width: 20px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.badge-red {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.nav-item.active .badge {
  background: rgba(147, 51, 234, 0.08);
  color: #9333ea;
  border-color: rgba(147, 51, 234, 0.2);
}

.btn-create {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px;
  background: #9333ea;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20px;
  font-family: inherit;
  box-shadow: 0 1px 3px rgba(147, 51, 234, 0.2);
}

.btn-create:hover {
  transform: translateY(-1px);
  background: #7c3aed;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.btn-create:active {
  transform: translateY(0);
}

.btn-create .icon {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.level-card {
  margin-top: auto;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.level-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: #f5f5f5;
}

.level-card:active {
  transform: translateY(0);
}

.level-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 5px;
}

.level-emoji {
  font-size: 16px;
}

.level-text {
  font-size: 13px;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.01em;
}

.level-number {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
}

.trending-icon {
  color: rgba(0, 0, 0, 0.4);
  opacity: 0.8;
}

.progress-section {
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 5px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  width: 73%;
  height: 100%;
  background: linear-gradient(90deg, #9333ea 0%, #c084fc 100%);
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.progress-percent {
  font-size: 12px;
  font-weight: 700;
  color: #000;
}

.progress-divider {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.3);
}

.progress-points {
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.5);
}

.level-desc {
  font-size: 11px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.5);
  margin: 0;
  letter-spacing: -0.01em;
}
</style>