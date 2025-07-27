<template>
  <header class="chat-header">
    <div class="header-content">
      <div class="header-left">
        <div class="app-icon">💬</div>
        <div>
          <h1 class="header-title">채팅</h1>
          <p class="header-subtitle">온라인 친구들과 대화해요</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="header-btn" @click="$emit('toggle-search')" title="검색">
          🔍
        </button>
        <button class="header-btn" title="메뉴">
          ⋮
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(['toggle-search'])
</script>

<style scoped>
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.header-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .header-title {
    font-size: 20px;
  }
}
</style>