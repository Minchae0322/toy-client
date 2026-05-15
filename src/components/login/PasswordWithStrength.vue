<template>
  <div class="input-group">
    <label class="input-label">
      비밀번호
      <span class="required">*</span>
    </label>
    <div class="input-wrapper">
      <input
          :type="showPassword ? 'text' : 'password'"
          :value="password"
          @input="handlePasswordInput"
          placeholder="8자 이상, 영문/숫자/특수문자"
          required
          :disabled="disabled"
      />
      <div class="input-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="5" y="9" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <button
          type="button"
          class="toggle-btn"
          @click="$emit('update:showPassword', !showPassword)"
          tabindex="-1"
      >
        <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823"/>
        </svg>
      </button>
    </div>

    <!-- 비밀번호 강도 표시 -->
    <div v-if="password" class="password-strength-container">
      <div class="strength-bars">
        <div class="strength-bar" :class="{ active: strength >= 1 }"></div>
        <div class="strength-bar" :class="{ active: strength >= 2 }"></div>
        <div class="strength-bar" :class="{ active: strength >= 3 }"></div>
        <div class="strength-bar" :class="{ active: strength >= 4 }"></div>
      </div>
      <span class="strength-text" :class="strengthClass">
        {{ strengthText }}
      </span>
    </div>

    <!-- 비밀번호 체크리스트 -->
    <div v-if="password" class="checklist">
      <div class="check-item" :class="{ checked: checks.hasLength }">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="8" />
          <path d="M5 8L7 10L11 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>8자 이상</span>
      </div>
      <div class="check-item" :class="{ checked: checks.hasLetter }">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="8" />
          <path d="M5 8L7 10L11 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>영문 포함</span>
      </div>
      <div class="check-item" :class="{ checked: checks.hasNumber }">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="8" />
          <path d="M5 8L7 10L11 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>숫자 포함</span>
      </div>
      <div class="check-item" :class="{ checked: checks.hasSpecial }">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="8" />
          <path d="M5 8L7 10L11 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>특수문자 포함</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  password: String,
  showPassword: Boolean,
  disabled: Boolean
})

const emit = defineEmits(['update:password', 'update:showPassword', 'strength-change'])

const checks = ref({
  hasLength: false,
  hasLetter: false,
  hasNumber: false,
  hasSpecial: false
})

const strength = computed(() => {
  return Object.values(checks.value).filter(Boolean).length
})

const strengthClass = computed(() => {
  if (strength.value === 0) return ''
  if (strength.value === 1) return 'weak'
  if (strength.value === 2) return 'medium'
  if (strength.value === 3) return 'strong'
  return 'very-strong'
})

const strengthText = computed(() => {
  if (!props.password) return ''
  if (strength.value === 1) return '약함'
  if (strength.value === 2) return '보통'
  if (strength.value === 3) return '강함'
  if (strength.value === 4) return '매우 강함'
  return ''
})

const handlePasswordInput = (event) => {
  const value = event.target.value
  emit('update:password', value)

  checks.value.hasLength = value.length >= 8
  checks.value.hasLetter = /[a-zA-Z]/.test(value)
  checks.value.hasNumber = /\d/.test(value)
  checks.value.hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(value)
}

watch(strength, (newStrength) => {
  emit('strength-change', newStrength)
})
</script>

<style scoped>
.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.1px;
}

.required {
  color: var(--c-brand);
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
}

input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 12px 42px;
  font-size: 14px;
  font-weight: 500;
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  color: var(--text-primary);
  background: var(--bg-subtle);
  transition: all 0.15s ease;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}

input::placeholder {
  color: var(--c-text-300);
  font-weight: 400;
}

input:hover:not(:focus):not(:disabled) {
  border-color: var(--c-text-300);
}

input:focus {
  border-color: var(--c-brand);
  background: var(--bg-elevated);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
}

input:disabled {
  background: var(--bg-mute);
  cursor: not-allowed;
  color: var(--c-text-300);
  border-color: var(--border-default);
}

.input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-300);
  pointer-events: none;
}

.toggle-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--c-text-300);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s;
}

.toggle-btn:hover {
  color: var(--c-text-600);
  background: var(--bg-mute);
}

.password-strength-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--border-default);
  border-radius: 2px;
  transition: all 0.3s;
}

.strength-bar.active:nth-child(1) { background: var(--c-danger); }
.strength-bar.active:nth-child(2) { background: var(--c-warning); }
.strength-bar.active:nth-child(3) { background: var(--c-success); }
.strength-bar.active:nth-child(4) { background: var(--c-success); }

.strength-text {
  font-size: 11px;
  font-weight: 700;
  min-width: 60px;
}

.strength-text.weak { color: var(--c-danger); }
.strength-text.medium { color: var(--c-warning); }
.strength-text.strong { color: var(--c-success); }
.strength-text.very-strong { color: var(--c-success); }

.checklist {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-subtle);
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  margin-top: 10px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-400);
  transition: color 0.2s;
}

.check-item svg {
  fill: var(--c-text-300);
  transition: fill 0.2s;
}

.check-item.checked {
  color: var(--c-success);
}

.check-item.checked svg {
  fill: var(--c-success);
}

@media (max-width: 640px) {
  .checklist {
    flex-direction: column;
    gap: 8px;
  }
}
</style>