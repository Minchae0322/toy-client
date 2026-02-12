<template>
  <div class="oauth-callback">
    <p>로그인 처리 중...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { setTokens } from '@/utils/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const token = route.query.token || route.query.access_token
  if (token) {
    setTokens(token)
    await authStore.loadUserInfo()
    router.replace({ name: 'Dashboard' })
  } else {
    router.replace({ name: 'Login' })
  }
})
</script>

<style scoped>
.oauth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family: 'SUIT-Regular', sans-serif;
  color: #666;
}
</style>
