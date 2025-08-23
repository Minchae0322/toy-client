<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const debugInfo = ref('')

const decodeJWTPayload = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''))
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

const handleOAuthCallback = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const errorParam = urlParams.get('error')

    if (errorParam) throw new Error(`OAuth 인증 실패: ${errorParam}`)
    if (!token) throw new Error('토큰이 URL에 없습니다.')

    const payload = decodeJWTPayload(token)
    if (!payload) throw new Error('JWT 디코딩 실패')

    const userInfo = {
      id: payload.userId || payload.sub,
      username: payload.username || payload.sub,
      email: payload.email || `${payload.sub}@oauth.local`,
      nickname: payload.nickname || payload.username || payload.sub,
      role: payload.auth || payload.role || 'USER',
      provider: payload.provider || 'oauth',
      profileImage: payload.picture || payload.avatar_url || null,
    }

    login({ accessToken: token, refreshToken: null }, userInfo)

    const redirectPath = sessionStorage.getItem('oauth_redirect') || '/home'
    sessionStorage.removeItem('oauth_redirect')
    await router.push(redirectPath)
  } catch (err) {
    error.value = true
    errorMessage.value = err.message
    debugInfo.value = err.stack
  } finally {
    loading.value = false
  }
}

onMounted(handleOAuthCallback)
</script>

<template>
  <div class="callback-wrapper">
    <div v-if="loading">로그인 처리 중...</div>
    <div v-else-if="error">로그인 실패: {{ errorMessage }}</div>
    <div v-else>로그인 성공! 이동중...</div>
  </div>
</template>
