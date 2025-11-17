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
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #EF4444;
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
}

input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 11px 40px;
  font-size: 14px;
  border: 2px solid #D1D5DB;
  border-radius: 8px;
  color: #1F2937;
  background: white;
  transition: all 0.2s;
  outline: none;
  box-sizing: border-box;
}

input::placeholder {
  color: #9CA3AF;
}

input:hover:not(:focus):not(:disabled) {
  border-color: #9CA3AF;
}

input:focus {
  border-color: #5B5FCF;
  background: white;
  box-shadow: 0 0 0 3px rgba(91, 95, 207, 0.1);
}

input:disabled {
  background: #F9FAFB;
  cursor: not-allowed;
  opacity: 0.6;
  border-color: #E5E7EB;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  pointer-events: none;
}

.toggle-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: #4B5563;
}

.password-strength-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  margin-bottom: 10px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  flex: 1;
  height: 3px;
  background: #E5E7EB;
  border-radius: 2px;
  transition: all 0.3s;
}

.strength-bar.active:nth-child(1) { background: #EF4444; }
.strength-bar.active:nth-child(2) { background: #F59E0B; }
.strength-bar.active:nth-child(3) { background: #10B981; }
.strength-bar.active:nth-child(4) { background: #059669; }

.strength-text {
  font-size: 11px;
  font-weight: 600;
  min-width: 60px;
}

.strength-text.weak { color: #EF4444; }
.strength-text.medium { color: #F59E0B; }
.strength-text.strong { color: #10B981; }
.strength-text.very-strong { color: #059669; }

.checklist {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  margin-top: 10px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6B7280;
  transition: color 0.2s;
}

.check-item svg {
  fill: #D1D5DB;
  transition: fill 0.2s;
}

.check-item.checked {
  color: #10B981;
}

.check-item.checked svg {
  fill: #10B981;
}

@media (max-width: 640px) {
  .checklist {
    flex-direction: column;
    gap: 8px;
  }
}
</style>