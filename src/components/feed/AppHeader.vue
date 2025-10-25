<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <h1 class="mobile-logo">HYPE BATTLE</h1>
        <div class="search-box">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="브랜드, 제품, 사람 검색..." v-model="searchQuery" />
        </div>
      </div>

      <div class="header-right">
        <button class="icon-btn">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span class="notification-dot"></span>
        </button>
        <div class="user-avatar">
          <img src="https://i.pravatar.cc/150?img=12" alt="User" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const searchQuery = ref('');
</script>

<style scoped>
.header {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  max-width: 100%;
}

@media (min-width: 1024px) {
  .header-container {
    padding: 20px 32px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.mobile-logo {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--primary);
}

@media (min-width: 1024px) {
  .mobile-logo {
    display: none;
  }
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 480px;
  display: none;
}

@media (min-width: 768px) {
  .search-box {
    display: block;
  }
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--secondary);
  stroke-width: 2;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--primary);
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
}

.search-box input::placeholder {
  color: var(--secondary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  position: relative;
  padding: 10px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: var(--hover);
}

.icon-btn .icon {
  width: 22px;
  height: 22px;
  color: var(--secondary);
  stroke-width: 2;
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #DC2626;
  border: 2px solid white;
  border-radius: 999px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--border);
  transition: all 0.2s;
}

.user-avatar:hover {
  border-color: var(--primary);
  transform: scale(1.05);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>