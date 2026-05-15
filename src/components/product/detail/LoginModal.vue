<template>
  <div class="login-modal-overlay" @click="$emit('close')">
    <div class="login-modal-content" @click.stop>
      <div class="login-modal-icon">🔒</div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="login-modal-actions">
        <button class="modal-btn secondary" @click="$emit('close')">
          나중에 하기
        </button>
        <router-link
            :to="{ path: '/login', query: { redirect: $route.fullPath } }"
            class="modal-btn primary"
            @click="$emit('close')"
        >
          로그인하기
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

defineEmits(['close'])
</script>

<style scoped>
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.login-modal-content {
  background: var(--bg-elevated);
  padding: 32px;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.login-modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-modal-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.login-modal-content p {
  font-size: 14px;
  color: var(--c-text-500);
  margin-bottom: 24px;
  line-height: 1.5;
}

.login-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-btn.secondary {
  background: var(--bg-subtle);
  color: var(--c-text-500);
}

.modal-btn.secondary:hover {
  background: var(--border-strong);
}

.modal-btn.primary {
  background: var(--c-success);
  color: white;
}

.modal-btn.primary:hover {
  background: #169976;
}

@media (max-width: 768px) {
  .login-modal-content {
    padding: 24px;
  }

  .login-modal-actions {
    flex-direction: column;
  }
}
</style>