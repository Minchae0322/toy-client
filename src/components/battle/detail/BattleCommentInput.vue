<template>
  <div class="comment-input-wrapper">
    <div class="input-container">
      <input
        ref="inputRef"
        v-model="content"
        type="text"
        class="comment-input"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :disabled="disabled"
        @keyup.enter="handleSubmit"
      />
      <span class="char-count" :class="{ warning: content.length >= maxLength - 10 }">
        {{ content.length }}/{{ maxLength }}
      </span>
    </div>
    <button
      class="submit-btn"
      :disabled="!canSubmit"
      @click="handleSubmit"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: Number,
    default: 100
  },
  placeholder: {
    type: String,
    default: 'PICK 한마디를 남겨보세요!'
  }
})

const emit = defineEmits(['submit'])

const content = ref('')
const inputRef = ref(null)

const canSubmit = computed(() => {
  return content.value.trim().length > 0 && !props.disabled
})

const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', content.value.trim())
  content.value = ''
}

const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<style scoped>
.comment-input-wrapper {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.input-container {
  flex: 1;
  position: relative;
}

.comment-input {
  width: 100%;
  padding: 12px 60px 12px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;
}

.comment-input:focus {
  border-color: #6b7df5;
}

.comment-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.comment-input::placeholder {
  color: #9ca3af;
}

.char-count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #9ca3af;
}

.char-count.warning {
  color: #f97316;
}

.submit-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #6b7df5;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.submit-btn:hover:not(:disabled) {
  background: #5a6be0;
  transform: scale(1.05);
}

.submit-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
