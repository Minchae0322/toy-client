<template>
  <aside class="sidebar-left">
    <div class="logo">
      <h1>HYPE BATTLE</h1>
    </div>

    <nav class="nav-menu">
      <a href="#" class="nav-item">
        <span class="nav-icon">🏠</span>
        <span>홈</span>
      </a>
      <a href="#" class="nav-item active">
        <span class="nav-icon">⚔️</span>
        <span>배틀</span>
      </a>
      <a href="#" class="nav-item">
        <span class="nav-icon">🔥</span>
        <span>인기</span>
      </a>
      <a href="#" class="nav-item">
        <span class="nav-icon">🏆</span>
        <span>랭킹</span>
      </a>
      <a href="#" class="nav-item">
        <span class="nav-icon">💬</span>
        <span>메시지</span>
      </a>
      <a href="#" class="nav-item">
        <span class="nav-icon">👤</span>
        <span>프로필</span>
      </a>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-left {
  width: 260px;
  background: var(--bg-elevated);
  border-right: 1px solid #F0F0F3;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 32px 24px;
  border-bottom: 1px solid #F0F0F3;
}

.logo h1 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.nav-menu {
  flex: 1;
  padding: 24px 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  color: #737380;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  margin-bottom: 2px;
  cursor: pointer;
}

.nav-item:hover {
  background: #F8F9FA;
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--c-ink-900);
  color: #ffffff;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
</style>