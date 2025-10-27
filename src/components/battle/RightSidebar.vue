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
  width: 360px;
  background: #FFFFFF;
  border-left: 1px solid #F0F0F3;
  position: fixed;
  height: 100vh;
  right: 0;
  top: 0;
  overflow-y: auto;
  padding: 32px 24px;
}

@media (max-width: 1280px) {
  .sidebar-right {
    display: none;
  }
}

/* 스크롤바 스타일 */
.sidebar-right::-webkit-scrollbar {
  width: 6px;
}

.sidebar-right::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-right::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 3px;
}

.sidebar-right::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
</style>