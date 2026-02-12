<template>
  <div v-if="visible" class="category-modal-overlay" @click.self="close">
    <div class="category-modal">
      <h3>카테고리 선택</h3>
      <slot />
      <button @click="close">닫기</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'select'])
const close = () => emit('close')
</script>

<style scoped>
.category-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.category-modal {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 300px;
}
</style>
