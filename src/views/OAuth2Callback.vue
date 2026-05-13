<template>
  <div class="callback-wrapper">
    <div class="callback-container">
      <!-- 로딩: 어떤 서비스로 로그인 중인지 + 단계별 진행 -->
      <div v-if="loading" class="loading-state">
        <div class="provider-badge" :class="provider">
          <img v-if="provider === 'google'" src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" class="provider-img" />
          <svg v-else-if="provider === 'naver'" width="18" height="18" viewBox="0 0 20 20" fill="white"><path d="M13.5 10.5L6.3 0H0v20h6.5V9.5L13.7 20H20V0h-6.5z"/></svg>
          <svg v-else-if="provider === 'github'" width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        </div>

        <h2>{{ providerLabel }}로 로그인하고 있어요</h2>
        <p class="loading-sub">안전하게 계정을 확인하는 중입니다</p>

        <div class="steps">
          <div v-for="(step, i) in steps" :key="i" class="step" :class="{ active: currentStep === i, done: currentStep > i }">
            <div class="step-dot">
              <svg v-if="currentStep > i" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <div v-else-if="currentStep === i" class="dot-spinner"></div>
              <span v-else class="dot-num">{{ i + 1 }}</span>
            </div>
            <span class="step-text">{{ step }}</span>
          </div>
        </div>
      </div>

      <!-- 에러: 기술 용어 없이 사용자가 이해할 수 있는 안내 -->
      <div v-else-if="error" class="error-state">
        <div class="error-badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h2>로그인에 실패했어요</h2>
        <p class="error-desc">{{ friendlyMessage }}</p>

        <!-- 진단 박스 (오류 코드 + 원본 메시지) — 심사·고객 지원 식별용으로 항상 노출 -->
        <div class="diag-box">
          <div class="diag-row">
            <span class="diag-label">오류 코드</span>
            <code class="diag-code">{{ errorCode || 'ERR-UNKNOWN' }}</code>
          </div>
          <div v-if="errorMessage" class="diag-row diag-row-msg">
            <span class="diag-label">상세</span>
            <span class="diag-msg">{{ errorMessage }}</span>
          </div>
          <details v-if="hasDetails" class="diag-details">
            <summary>기술 정보</summary>
            <pre>{{ detailsJSON }}</pre>
          </details>
        </div>

        <div class="help-box">
          <p class="help-title">이렇게 해보세요</p>
          <ul class="help-list">
            <li v-for="(tip, i) in helpTips" :key="i">{{ tip }}</li>
          </ul>
        </div>

        <div class="error-btns">
          <button @click="retryLogin" class="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            다시 시도
          </button>
          <button @click="goToLogin" class="btn-ghost">다른 방법으로 로그인</button>
        </div>
      </div>

      <!-- 성공: 바로 리다이렉트 (별도 화면 없음) -->
      <div v-else class="loading-state">
        <div class="provider-badge success">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2>로그인 완료</h2>
        <div class="redirect-pill">
          <span class="pulse-dot"></span>
          {{ redirectLabel }}(으)로 이동하고 있어요
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import * as authUtils from '@/utils/auth.js'
import { signInWithApple, signInWithGoogle, LoginError } from '@/services/nativeAuth.js'

const router = useRouter()
const { login } = useAuth()

const loading = ref(true)
const error = ref(false)
const errorCode = ref('')
const errorMessage = ref('')
const errorDetails = ref(null)
const debugInfo = ref('')
const currentStep = ref(0)
const welcomeName = ref('')
const redirectTarget = ref('/feed')
const provider = ref('oauth')

const detailsJSON = computed(() => {
  try {
    return JSON.stringify(errorDetails.value || {}, null, 2)
  } catch {
    return String(errorDetails.value)
  }
})
const hasDetails = computed(() => errorDetails.value && Object.keys(errorDetails.value).length > 0)

const steps = ['서비스 연결 중', '계정 확인 중', '프로필 불러오는 중', '로그인 완료']

// 어떤 소셜 서비스를 선택했는지 감지
const detectProvider = () => {
  const queryProvider = new URLSearchParams(window.location.search).get('provider')
  if (queryProvider) return queryProvider

  const saved = sessionStorage.getItem('oauth_provider')
  if (saved) return saved

  const url = window.location.href.toLowerCase()
  const ref = document.referrer.toLowerCase()
  if (url.includes('google') || ref.includes('google')) return 'google'
  if (url.includes('naver') || ref.includes('naver')) return 'naver'
  if (url.includes('github') || ref.includes('github')) return 'github'
  return 'oauth'
}

const providerLabel = computed(() => {
  const map = { google: 'Google', naver: 'Naver', github: 'GitHub', oauth: '소셜 계정' }
  return map[provider.value] || '소셜 계정'
})

const redirectLabel = computed(() => {
  const map = { '/feed': '피드', '/': '홈', '/mypage': '마이페이지', '/products': '상품 목록', '/carrier': '캐리어' }
  return map[redirectTarget.value] || '홈'
})

// 에러 코드 기반 사용자 친화 메시지 매핑
// (코드 자체는 화면에 따로 노출되므로, 여기서는 사용자에게 보일 한국어 설명만)
const friendlyMessage = computed(() => {
  const c = errorCode.value
  if (!c) return '로그인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.'

  // SDK 초기화 실패
  if (c === 'ERR-INIT-01') return '소셜 로그인 SDK 초기화에 실패했어요. 앱을 재설치하면 해결될 수 있어요.'

  // Apple/Google SDK 단계
  if (c === 'ERR-A-101') return 'Apple 로그인 중 시스템 오류가 발생했어요. 잠시 후 다시 시도해주세요.'
  if (c === 'ERR-A-102') return 'Apple로부터 로그인 정보를 받지 못했어요. 설정 → Apple ID 상태를 확인해주세요.'
  if (c === 'ERR-G-101') return 'Google 로그인 중 시스템 오류가 발생했어요. 잠시 후 다시 시도해주세요.'
  if (c === 'ERR-G-102') return 'Google로부터 로그인 정보를 받지 못했어요. 다시 시도해주세요.'

  // 네트워크 단계
  if (c.endsWith('-200')) return '서버에 도달할 수 없어요. 네트워크 연결을 확인해주세요.'
  if (c.endsWith('-201')) return '서버 응답이 너무 느려요. 잠시 후 다시 시도해주세요.'
  if (c.endsWith('-299')) return '서버 통신 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.'

  // HTTP 상태
  if (/^ERR-[AG]-401$/.test(c) || /^ERR-[AG]-403$/.test(c))
    return `${providerLabel.value} 계정 인증이 거부됐어요. 다른 방법으로 로그인해보세요.`
  if (/^ERR-[AG]-4\d{2}$/.test(c))
    return '서버가 요청을 거부했어요. 잠시 후 다시 시도해주세요.'
  if (/^ERR-[AG]-5\d{2}$/.test(c))
    return '서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해주세요.'

  // 응답 누락
  if (c === 'ERR-A-300' || c === 'ERR-G-300')
    return '로그인 응답을 제대로 받지 못했어요. 잠시 후 다시 시도해주세요.'

  // OAuth 웹 콜백
  if (c === 'ERR-O-100') return `${providerLabel.value} 계정 인증에 실패했어요. 계정 상태를 확인해주세요.`
  if (c === 'ERR-O-101') return '로그인 정보를 받아오지 못했어요. 다시 시도해주세요.'
  if (c === 'ERR-O-102') return '받은 로그인 정보에 문제가 있어요. 잠시 후 다시 시도해주세요.'
  if (c === 'ERR-O-103') return '로그인 정보를 저장하지 못했어요. 브라우저 설정을 확인해주세요.'

  return '로그인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.'
})

const helpTips = computed(() => {
  const c = errorCode.value

  if (c === 'ERR-O-103') {
    return [
      '브라우저의 쿠키가 허용되어 있는지 확인해주세요',
      '시크릿(프라이빗) 모드에서는 로그인이 제한될 수 있어요',
      '브라우저 캐시를 지우고 다시 시도해보세요'
    ]
  }
  if (c === 'ERR-A-102') {
    return [
      '설정 → Apple ID → 비밀번호 및 보안 → "Apple로 로그인 사용 중인 앱"에서 요거뜨를 확인해주세요',
      '2단계 인증이 활성화되어 있는지 확인해주세요',
      '잠시 후 다시 시도해주세요'
    ]
  }
  if (c?.endsWith('-200') || c?.endsWith('-201') || c?.endsWith('-299')) {
    return [
      'Wi-Fi 또는 모바일 데이터 연결을 확인해주세요',
      'VPN 사용 중이라면 잠시 꺼보세요',
      '문제가 반복되면 이메일로 로그인해주세요'
    ]
  }
  if (/^ERR-[AG]-4\d{2}$/.test(c || '') || /^ERR-[AG]-5\d{2}$/.test(c || '')) {
    return [
      '잠시 후 다시 시도해주세요',
      '문제가 반복되면 이메일로 로그인해주세요',
      `오류 코드를 고객 지원에 알려주시면 도움이 됩니다`
    ]
  }
  return [
    '인터넷 연결이 안정적인지 확인해주세요',
    '잠시 후 다시 시도해주세요',
    '문제가 반복되면 이메일로 로그인해주세요'
  ]
})

const decodeJWTPayload = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''))
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('[OAuth] JWT 디코딩 실패:', e)
    return null
  }
}

const forceStateSync = () => {
  const token = authUtils.getAccessToken()
  const userInfo = authUtils.getUserInfo()

  if (token && userInfo) {
    window.dispatchEvent(new CustomEvent('auth-state-changed', {
      detail: { user: userInfo, loggedIn: true }
    }))
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'access_token', newValue: token, storageArea: localStorage
    }))
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user_info', newValue: JSON.stringify(userInfo), storageArea: localStorage
    }))
  }
}

const handleOAuthCallback = async () => {
  try {
    provider.value = detectProvider()

    // Step 1: 서비스 연결
    currentStep.value = 0

    const urlParams = new URLSearchParams(window.location.search)
    const isNative = urlParams.get('native') === '1'
    const errorParam = urlParams.get('error')
    if (errorParam) {
      throw new LoginError(
        'ERR-O-100',
        `OAuth 콜백 URL에 에러 파라미터: ${errorParam}`,
        { errorParam }
      )
    }

    let accessToken, refreshToken, nativeUser
    if (isNative) {
      // 네이티브 SDK 호출 (Apple/Google)
      const fn = provider.value === 'apple' ? signInWithApple : signInWithGoogle
      const res = await fn()
      accessToken = res.accessToken
      refreshToken = res.refreshToken
      nativeUser = res.user
    } else {
      accessToken = urlParams.get('token')
      refreshToken = urlParams.get('refreshToken')
      if (!accessToken) {
        throw new LoginError(
          'ERR-O-101',
          '웹 OAuth 콜백 URL에 access token 쿼리 누락',
          { search: window.location.search.slice(0, 200) }
        )
      }
    }

    // Step 2: 계정 확인
    await new Promise(r => setTimeout(r, 400))
    currentStep.value = 1

    const payload = decodeJWTPayload(accessToken)
    if (!payload) {
      throw new LoginError(
        'ERR-O-102',
        '백엔드가 발급한 accessToken을 JWT로 디코딩할 수 없음 (포맷 손상)',
        { tokenLength: accessToken?.length || 0 }
      )
    }

    if (payload.provider) {
      provider.value = payload.provider.toLowerCase()
    }

    // Step 3: 프로필 불러오기
    await new Promise(r => setTimeout(r, 400))
    currentStep.value = 2

    const userInfo = nativeUser || {
      id: payload.userId || payload.sub,
      username: payload.username || payload.sub,
      email: payload.email || `${payload.sub}@oauth.local`,
      nickname: payload.nickname || payload.username || payload.sub,
      role: payload.auth || payload.role || 'USER',
      provider: payload.provider || 'oauth',
      profileImage: payload.picture || payload.avatar_url || null,
    }

    welcomeName.value = userInfo.nickname || userInfo.username

    const finalRefreshToken = refreshToken || accessToken
    const tokens = { accessToken, refreshToken: finalRefreshToken }

    const loginResult = await login(tokens, userInfo)
    console.log('[OAuth] login 결과:', loginResult)

    setTimeout(() => forceStateSync(), 100)
    await new Promise(r => setTimeout(r, 200))

    const finalCheck = {
      savedAccessToken: !!authUtils.getAccessToken(),
      savedRefreshToken: !!authUtils.getRefreshToken(),
      savedUserInfo: !!authUtils.getUserInfo(),
      isAuthenticated: authUtils.isAuthenticated()
    }

    if (!finalCheck.isAuthenticated) {
      throw new LoginError(
        'ERR-O-103',
        '토큰은 받았지만 인증 상태 저장에 실패 (localStorage/스토어 동기화 실패)',
        finalCheck
      )
    }

    // Step 4: 완료
    currentStep.value = 3

    const redirectPath = sessionStorage.getItem('oauth_redirect') || '/feed'
    sessionStorage.removeItem('oauth_redirect')
    sessionStorage.removeItem('oauth_provider')
    redirectTarget.value = redirectPath

    // 바로 이동
    loading.value = false
    await new Promise(r => setTimeout(r, 300))

    try {
      await router.push(redirectPath)
    } catch (routerError) {
      window.location.href = redirectPath
    }

  } catch (err) {
    console.error('[OAuth] 콜백 처리 실패:', err)
    // 사용자가 네이티브 시트에서 취소한 경우 → 조용히 로그인 화면으로 복귀
    if (err?.isCancel) {
      router.replace({ name: 'Login' })
      return
    }
    error.value = true
    errorCode.value = err?.code || 'ERR-UNKNOWN'
    errorMessage.value = err?.message || String(err)
    errorDetails.value = {
      ...(err?.details || {}),
      provider: provider.value,
      step: currentStep.value,
      url: window.location.href.slice(0, 200),
      tokens: {
        hasAccessToken: !!authUtils.getAccessToken(),
        hasRefreshToken: !!authUtils.getRefreshToken(),
        hasUserInfo: !!authUtils.getUserInfo()
      }
    }
    debugInfo.value = {
      code: errorCode.value,
      message: errorMessage.value,
      stack: err?.stack,
      ...errorDetails.value
    }
    loading.value = false
  }
}

const retryLogin = () => {
  const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL
  if (provider.value && provider.value !== 'oauth') {
    window.location.href = `${authBaseUrl}/oauth2/authorization/${provider.value}`
  } else {
    goToLogin()
  }
}

const goToLogin = () => {
  authUtils.clearAllAuthData()
  router.push({ name: 'Login' })
}

onMounted(handleOAuthCallback)
</script>

<style scoped>
.callback-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  padding: 20px;
}

.callback-container {
  width: 100%;
  max-width: 420px;
  padding: 48px 36px;
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 1px solid #e4e4e7;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  animation: fadeUp 0.35s ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 제공자 배지 ===== */
.provider-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  background: #71717a;
}
.provider-badge.google { background: #fff; border: 1px solid #e4e4e7; }
.provider-badge.naver { background: #03C75A; }
.provider-badge.github { background: #24292e; }
/* 로그인 완료 상태: provider 무관, 체크마크가 흰색이므로 어두운 배경 필요 */
.provider-badge.success { background: #1DCD9F; }
.provider-img { width: 28px; height: 28px; }

/* ===== 로딩 ===== */
.loading-state h2 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #18181b;
}

.loading-sub {
  margin: 0 0 28px;
  font-size: 13px;
  color: #a1a1aa;
}

.steps {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 8px;
  transition: background 0.25s;
}
.step.active { background: #f4f4f5; }

.step-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f4f4f5;
  transition: all 0.25s;
}
.step.active .step-dot { background: #18181b; }
.step.done .step-dot { background: #ecfdf5; }

.dot-num { font-size: 11px; font-weight: 600; color: #a1a1aa; }

.dot-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.step-text {
  font-size: 14px;
  color: #a1a1aa;
  transition: color 0.25s;
}
.step.active .step-text { color: #18181b; font-weight: 500; }
.step.done .step-text { color: #1DCD9F; }
.step.done .step-dot svg { color: #1DCD9F; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 에러 ===== */
.error-state { animation: fadeUp 0.35s ease-out; }

.error-badge {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.error-state h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #18181b;
}

.error-desc {
  margin: 0 0 20px;
  font-size: 14px;
  color: #71717a;
  line-height: 1.6;
}

/* ===== 진단 박스 (오류 코드 + 원본 메시지) ===== */
.diag-box {
  background: #fff7f7;
  border: 1px solid #fee2e2;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
  text-align: left;
  font-size: 12px;
}
.diag-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 4px 0;
}
.diag-row-msg { align-items: flex-start; }
.diag-label {
  flex-shrink: 0;
  width: 56px;
  color: #991b1b;
  font-weight: 700;
  letter-spacing: -0.2px;
}
.diag-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  background: #fee2e2;
  color: #991b1b;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
  word-break: break-all;
}
.diag-msg {
  color: #7f1d1d;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
}
.diag-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #fecaca;
}
.diag-details summary {
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: #991b1b;
}
.diag-details pre {
  margin: 6px 0 0;
  font-size: 10px;
  color: #7f1d1d;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.4;
}

.help-box {
  background: #fafafa;
  border: 1px solid #f4f4f5;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 20px;
  text-align: left;
}

.help-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #3f3f46;
}

.help-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.help-list li {
  position: relative;
  padding-left: 14px;
  margin-bottom: 5px;
  font-size: 13px;
  color: #71717a;
  line-height: 1.5;
}
.help-list li:last-child { margin-bottom: 0; }
.help-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d4d4d8;
}

.error-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  background: #18181b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s;
}
.btn-primary:hover { background: #3f3f46; }

.btn-ghost {
  width: 100%;
  padding: 12px;
  background: white;
  color: #71717a;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
}
.btn-ghost:hover { background: #fafafa; color: #18181b; }

/* ===== 성공 (리다이렉트 안내만 표시) ===== */

.redirect-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: #f4f4f5;
  border-radius: 20px;
  font-size: 13px;
  color: #71717a;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1DCD9F;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .3; }
}

/* ===== 모바일 ===== */
@media (max-width: 480px) {
  .callback-wrapper { background: #ffffff; padding: 0; align-items: flex-start; padding-top: 60px; }
  .callback-container { border: none; box-shadow: none; border-radius: 0; padding: 32px 24px; }
}
</style>
