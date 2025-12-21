<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-600">로그인 처리 중...</p>
      </div>
      <div v-else-if="error" class="space-y-4">
        <div class="text-red-500 text-4xl">!</div>
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="goToLogin"
          class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          로그인 페이지로 이동
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as authUtils from '@/utils/auth.js'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)

const processOAuthCallback = () => {
  try {
    // URL에서 token 파라미터 가져오기
    const token = route.query.token

    if (!token) {
      error.value = '토큰이 없습니다. 다시 로그인해주세요.'
      loading.value = false
      return
    }

    console.log('🔐 [OAuth] 토큰 수신 완료')

    // 토큰 저장
    authUtils.setTokens(token)

    // JWT에서 사용자 정보 추출
    const payload = authUtils.parseJwtToken(token)

    if (payload) {
      const userInfo = {
        id: payload.userId,
        email: payload.email || payload.username,
        username: payload.username || payload.sub,
        nickname: payload.nickname || payload.username,
        role: payload.role || payload.auth || 'USER',
        provider: payload.provider || 'github',
        profileImage: payload.profileImage || null
      }

      authUtils.setUserInfo(userInfo)
      console.log('✅ [OAuth] 사용자 정보 저장 완료:', userInfo.username)
    }

    // 리다이렉트 URL이 있으면 해당 경로로, 없으면 피드 홈으로
    const redirectPath = route.query.redirect || '/feed'

    console.log('🚀 [OAuth] 로그인 성공, 리다이렉트:', redirectPath)

    // 약간의 딜레이 후 리다이렉트 (상태 업데이트를 위해)
    setTimeout(() => {
      router.replace(redirectPath)
    }, 500)

  } catch (err) {
    console.error('❌ [OAuth] 콜백 처리 실패:', err)
    error.value = '로그인 처리 중 오류가 발생했습니다.'
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  processOAuthCallback()
})
</script>
