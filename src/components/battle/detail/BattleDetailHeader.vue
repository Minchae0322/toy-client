<template>
  <header class="detail-header">
    <div class="header-content">
      <button class="back-btn" @click="$emit('back')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        배틀 목록
      </button>
      <div class="header-actions">
        <button class="share-btn" @click="$emit('share')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
        </button>
        <button class="more-btn" @click="$emit('more')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(['back', 'share', 'more'])
</script>

<style scoped>
.detail-header {
  background: white;
  border-bottom: 1px solid #E8E8E8;
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95);
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #D4D4D4;
  border-radius: 8px;
  color: #737373;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.back-btn:hover {
  border-color: #A3A3A3;
  background: #FAFAFA;
  color: #0A0A0A;
  transform: translateX(-2px);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.share-btn, .more-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #E8E8E8;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.share-btn:hover, .more-btn:hover {
  border-color: #A3A3A3;
  background: #FAFAFA;
  transform: translateY(-1px);
}
</style>