<template>
  <button class="floating-button" @click="$emit('click')" title="새 음식 등록">
    ➕
  </button>
</template>

<script>
export default {
  name: 'FloatingButton'
};
</script>

<style scoped>
.floating-button {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #169976 0%, #1DCD9F 100%);
  border-radius: 50%;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(22, 153, 118, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
}

.floating-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(22, 153, 118, 0.5);
}
</style>
