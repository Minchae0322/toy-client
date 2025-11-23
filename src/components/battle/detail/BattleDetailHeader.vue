<template>
  <header class="battle-header">
    <div class="header-container">
      <button @click="$emit('back')" class="back-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        목록
      </button>

      <div class="header-actions">
        <button @click="$emit('share')" class="share-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(['back', 'share'])
</script>

<style scoped>
.battle-header {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  z-index: 50;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  margin-left: -8px;
  background: transparent;
  border: none;
  color: #374151;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  font-family: inherit;
}

.back-button:hover {
  background: #F9FAFB;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.share-button {
  padding: 8px;
  background: transparent;
  border: none;
  color: #6B7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-button:hover {
  background: #F9FAFB;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }
}
</style>