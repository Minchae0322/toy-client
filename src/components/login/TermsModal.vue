<template>
  <div v-if="visible" class="terms-overlay" @click.self="close">
    <div class="terms-modal">
      <h3>이용약관</h3>
      <div class="terms-content">
        <slot>이용약관 내용</slot>
      </div>
      <button @click="close">확인</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])
const close = () => emit('close')
</script>

<style scoped>
.terms-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.terms-modal {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}
</style>
