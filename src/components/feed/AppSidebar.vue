<template>
  <aside class="sidebar-left">
    <div class="sidebar-header">
      <h1 class="logo">HYPE BATTLE</h1>
      <span class="logo-beta">BETA</span>
    </div>

    <nav class="nav-menu">
      <button class="nav-item active">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        <span>홈</span>
      </button>
      <button class="nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.5 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-5-2a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
        </svg>
        <span>배틀</span>
        <span class="badge">12</span>
      </button>
      <button class="nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
        </svg>
        <span>메시지</span>
        <span class="badge badge-red">3</span>
      </button>
      <button class="nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
        </svg>
        <span>컬렉션</span>
      </button>
      <button class="nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
        </svg>
        <span>프로필</span>
      </button>
    </nav>

    <button class="btn-create">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      <span>인증 올리기</span>
    </button>

    <div class="level-card">
      <div class="level-info">
        <div class="level-badge">
          <span class="level-emoji">🔥</span>
          <span class="level-text">마니아 Lv.8</span>
        </div>
        <p class="level-desc">다음 레벨까지</p>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 73%"></div>
      </div>
      <p class="progress-text">73% <span>·</span> 270 / 370 포인트</p>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-left {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: var(--card);
  border-right: 1px solid var(--border);
  padding: 24px;
  display: none;
  flex-direction: column;
  overflow-y: auto;
}

@media (min-width: 1024px) {
  .sidebar-left {
    display: flex;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;
}

.logo {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--primary);
}

.logo-beta {
  padding: 2px 6px;
  background: var(--accent);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  position: relative;
}

.nav-item:hover {
  background: var(--hover);
  color: var(--primary);
}

.nav-item.active {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.nav-item .icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.nav-item .badge {
  margin-left: auto;
  padding: 2px 8px;
  background: var(--hover);
  color: var(--secondary);
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
}

.nav-item.active .badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.badge-red {
  background: #FEE2E2 !important;
  color: #DC2626 !important;
}

.nav-item.active .badge-red {
  background: #DC2626 !important;
  color: white !important;
}

.btn-create {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  margin-bottom: 24px;
}

.btn-create:hover {
  background: #EA580C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-create .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

.level-card {
  margin-top: auto;
  padding: 20px;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  border-radius: 16px;
  border: 1px solid #FED7AA;
}

.level-info {
  margin-bottom: 12px;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.level-emoji {
  font-size: 20px;
}

.level-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
}

.level-desc {
  font-size: 13px;
  color: var(--secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary);
}

.progress-text span {
  margin: 0 4px;
}
</style>