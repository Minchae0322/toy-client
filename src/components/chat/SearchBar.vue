<template>
  <Transition name="slide-down">
    <div class="search-container">
      <div class="search-box">
        <input
            type="text"
            class="search-input"
            placeholder="채팅방이나 친구 검색..."
            :value="searchQuery"
            @input="updateQuery"
        >
        <span class="search-icon">🔍</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps(['searchQuery'])
const emit = defineEmits(['update:searchQuery'])

const updateQuery = (event) => {
  emit('update:searchQuery', event.target.value)
}
</script>

<style scoped>
.search-container {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  background: #f8fafc;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}
.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
