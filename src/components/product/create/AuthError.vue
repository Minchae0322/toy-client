<template>
  <div class="auth-error">
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" class="error-icon">
      <circle cx="40" cy="40" r="36" stroke="#EF4444" stroke-width="3"/>
      <path d="M40 24V40" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="52" r="3" fill="#EF4444"/>
    </svg>
    <h3>{{ error }}</h3>
    <button class="login-btn" @click="$emit('login')">
      로그인하러 가기
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['login'])
</script>

<style scoped>
.auth-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  background: var(--c-danger-soft);
  border: 2px solid var(--c-danger-soft);
  border-radius: 16px;
  margin: 24px 0;
}

.error-icon {
  margin-bottom: 24px;
}

.auth-error h3 {
  font-size: 18px;
  color: var(--c-danger);
  font-weight: 700;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.login-btn {
  padding: 12px 32px;
  background: var(--c-success);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.login-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}
</style>