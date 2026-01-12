<template>
  <header class="glass-header">
    <div class="inner">
      <button @click="$emit('back')" class="back-pill">
        <span class="icon">←</span> 배틀 목록
      </button>
      <h2 class="battle-title-mini">{{ title }}</h2>
      <button @click="$emit('share')" class="share-circle">↗</button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})

defineEmits(['back', 'share'])
</script>

<style scoped>
.glass-header {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-pill {
  background: #fff;
  border: 1px solid #eee;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s;
}

.back-pill:hover {
  background: #f9f9f9;
  border-color: #ddd;
}

.back-pill .icon {
  font-size: 14px;
}

.battle-title-mini {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.share-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #eee;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.share-circle:hover {
  background: #f9f9f9;
  border-color: #ddd;
}

@media (max-width: 768px) {
  .battle-title-mini {
    display: none;
  }

  .inner {
    padding: 12px 16px;
  }
}
</style>
