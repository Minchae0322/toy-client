<template>
  <aside class="sidebar-left">
    <nav class="nav-menu">
      <!-- 메인 메뉴 섹션 -->
      <div class="nav-section">
        <router-link to="/feed" class="nav-item" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span class="nav-text">홈</span>
        </router-link>

        <router-link to="/battle" class="nav-item" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.5 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-5-2a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
          </svg>
          <span class="nav-text">배틀</span>
          <span class="badge">12</span>
        </router-link>

        <router-link to="/products" class="nav-item" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
          </svg>
          <span class="nav-text">핫 제품</span>
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

      <!-- 프로필 섹션 (로그인 시에만 표시) -->
      <div v-if="isLoggedIn" class="nav-section">
        <button class="nav-item" @click="handleProtectedRoute('profile')">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
          <span class="nav-text">프로필</span>
        </button>

        <button class="nav-item" @click="handleProtectedRoute('mypage')">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
          </svg>
          <span class="nav-text">마이페이지</span>
        </button>
      </div>
    </nav>

    <!-- 인증 올리기 버튼 -->
    <button class="btn-create" @click="handleProtectedRoute('create')">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      <span>인증 올리기</span>
    </button>

    <!-- 제품 등록하기 버튼 -->
    <button class="btn-create-product" @click="handleProtectedRoute('createProduct')">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      <span>제품 등록하기</span>
    </button>

    <!-- 배틀 등록하기 버튼 -->
    <button class="btn-create-battle" @click="handleProtectedRoute('createBattle')">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      <span>배틀 등록하기</span>
    </button>
  </aside>
</template>

<script setup>
import {useRouter} from 'vue-router';
import {useAuth} from '@/composables/useAuth';

const router = useRouter();
const {isLoggedIn, userId} = useAuth();

const handleProtectedRoute = async (routeName) => {
  console.log(`=== ${routeName} 클릭 ===`);
  console.log('로그인 상태:', isLoggedIn.value);

  if (isLoggedIn.value) {
    switch (routeName) {
      case 'profile':
        goToMyProfile();
        break;
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
      case 'messages':
        router.push({name: 'Chat'});
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
      query: {redirect: router.currentRoute.value.fullPath}
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
      params: {userId: String(userId.value)}
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
  width: 240px;
  height: calc(100vh - 64px);
  top: 64px;
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  padding: 28px 16px;
  display: none;
  flex-direction: column;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
}

.nav-item.active .icon {
  color: #9333ea;
}

.nav-text {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
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

/* 인증 올리기 버튼 */
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
  margin-bottom: 10px;
  font-family: inherit;
  box-shadow: 0 1px 3px rgba(147, 51, 234, 0.2);
}

.btn-create:hover {
  transform: translateY(-1px);
  background: #7e22ce;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.btn-create .icon {
  width: 18px;
  height: 18px;
}

/* 제품 등록하기 버튼 */
.btn-create-product {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px;
  background: #f97316;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 10px;
  font-family: inherit;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}

.btn-create-product:hover {
  transform: translateY(-1px);
  background: #ea580c;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-create-product .icon {
  width: 18px;
  height: 18px;
}

/* 배틀 등록하기 버튼 */
.btn-create-battle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20px;
  font-family: inherit;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.2);
}

.btn-create-battle:hover {
  transform: translateY(-1px);
  background: #1e293b;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
}

.btn-create-battle .icon {
  width: 18px;
  height: 18px;
}
</style>