<template>
  <aside class="sidebar-right">
    <slot name="trending"></slot>
    <slot name="deadline"></slot>
  </aside>
</template>

<script setup>
</script>

<style scoped>
.sidebar-right {
  width: 280px;
  background: #FFFFFF;
  border-left: 0.5px solid #E8E8E8;
  position: fixed;
  height: 100vh;
  right: 0;
  top: 0;
  overflow-y: auto;
  padding: 24px 20px;
}

@media (max-width: 1280px) {
  .sidebar-right {
    display: none;
  }
}

/* 스크롤바 스타일 */
.sidebar-right::-webkit-scrollbar {
  width: 4px;
}

.sidebar-right::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-right::-webkit-scrollbar-thumb {
  background: #E8E8E8;
  border-radius: 2px;
}

.sidebar-right::-webkit-scrollbar-thumb:hover {
  background: #D4D4D4;
}
</style>