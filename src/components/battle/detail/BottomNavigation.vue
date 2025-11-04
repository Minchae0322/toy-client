<template>
  <nav class="bottom-nav">
    <button class="bottom-nav-item" @click="$emit('navigate', '/feed')">
      <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
      </svg>
      <span>홈</span>
    </button>
    <button class="bottom-nav-item active" @click="$emit('navigate', '/battle')">
      <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
      </svg>
      <span>배틀</span>
    </button>
    <button class="bottom-nav-fab" @click="$emit('navigate', '/battle/create')">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
      </svg>
    </button>
    <button class="bottom-nav-item">
      <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
      </svg>
      <span>메시지</span>
    </button>
    <button class="bottom-nav-item" @click="$emit('navigate', '/profile')">
      <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
      </svg>
      <span>MY</span>
    </button>
  </nav>
</template>

<script setup>
defineEmits(['navigate'])
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-top: 0.5px solid #E8E8E8;
  z-index: 50;
  display: none;
  align-items: center;
  justify-content: space-around;
  padding: 4px 0 6px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.02);
}

@media (max-width: 1024px) {
  .bottom-nav {
    display: flex;
  }
}

.bottom-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 5px 8px;
  background: transparent;
  border: none;
  color: #A3A3A3;
  cursor: pointer;
  transition: color 160ms ease;
  font-family: inherit;
}

.bottom-nav-item.active {
  color: #0A0A0A;
}

.bottom-nav-item .icon {
  width: 20px;
  height: 20px;
}

.bottom-nav-item span {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: -0.006em;
}

.bottom-nav-fab {
  width: 48px;
  height: 48px;
  background: #0A0A0A;
  color: white;
  border: none;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.16), 0 1px 3px rgba(10, 10, 10, 0.08);
  margin-top: -24px;
  transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-nav-fab:hover {
  background: #000000;
  transform: translateY(-0.5px) scale(1.01);
  box-shadow: 0 6px 16px rgba(10, 10, 10, 0.2), 0 2px 4px rgba(10, 10, 10, 0.1);
}

.bottom-nav-fab:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(10, 10, 10, 0.12);
}

.bottom-nav-fab .icon {
  width: 24px;
  height: 24px;
  stroke-width: 2.5;
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    padding-bottom: max(6px, env(safe-area-inset-bottom));
  }
}
</style>