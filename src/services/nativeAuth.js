// 네이티브 빌드(iOS/Android)에서 Apple/Google 소셜 로그인을 처리한다.
// 1) 네이티브 SDK로 ID Token을 받아 백엔드 native endpoint에 POST
// 2) 백엔드가 자체 accessToken 반환 → 호출 측에서 useAuth.login으로 상태 갱신
//
// ────────────────────────────────────────────────────────────
// 에러 코드 체계 (심사·디버깅용)
//   ERR-A1xx : Apple SDK 단계 (initialize / login / idToken 누락)
//   ERR-A2xx : Apple 백엔드 통신 단계 (network / HTTP 4xx / 5xx)
//   ERR-A3xx : Apple 백엔드 응답 단계 (accessToken 누락 등)
//   ERR-G1xx / ERR-G2xx / ERR-G3xx : Google 동일 구조
// ────────────────────────────────────────────────────────────

import { Capacitor } from '@capacitor/core'
import { SocialLogin } from '@capgo/capacitor-social-login'
import { authClient } from '@/api/client.js'

const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID
const GOOGLE_IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI

let initialized = false

/**
 * 로그인 흐름 어디서 실패했는지 식별할 수 있도록 code를 항상 가지고 다니는 에러
 */
export class LoginError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'LoginError'
    this.code = code
    this.details = details
  }
}

/**
 * 사용자 취소 패턴을 안전하게 식별 (메시지 문자열 매칭 대신 flag 사용)
 */
function makeCancelError(sourceMsg) {
  const e = new Error(`USER_CANCELED: ${sourceMsg || ''}`)
  e.isCancel = true
  return e
}

function isCancelLike(rawMsg, rawCode) {
  const msg = String(rawMsg || '').toLowerCase()
  const code = String(rawCode || '')
  // iOS ASAuthorizationError.canceled == 1001
  return (
    msg.includes('cancel') ||
    msg.includes('canceled') ||
    msg.includes('dismiss') ||
    code === '1001'
  )
}

async function ensureInitialized() {
  if (initialized) return
  // iOS는 ASAuthorizationAppleIDProvider가 bundle ID로 처리하므로 redirectUrl 불필요.
  // redirectUrl을 넘기면 플러그인이 authorizationCode를 자동 POST해서
  // 백엔드 OAuth2 콜백(/login/oauth2/code/apple)이 잘못된 형태로 호출됨.
  const isIos = Capacitor.getPlatform() === 'ios'
  try {
    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iOSClientId: GOOGLE_IOS_CLIENT_ID,
      },
      apple: {
        clientId: APPLE_CLIENT_ID,
        ...(isIos ? {} : { redirectUrl: APPLE_REDIRECT_URI }),
      },
    })
    initialized = true
  } catch (e) {
    throw new LoginError(
      'ERR-INIT-01',
      `소셜 로그인 SDK 초기화 실패: ${e?.message || e}`,
      { rawError: String(e), errorCode: e?.code }
    )
  }
}

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''))
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('[nativeAuth] JWT 디코딩 실패:', e)
    return null
  }
}

function buildUserFromPayload(payload) {
  if (!payload) return null
  return {
    id: payload.userId || payload.sub,
    username: payload.username || payload.sub,
    email: payload.email || `${payload.sub}@oauth.local`,
    nickname: payload.nickname || payload.username || payload.sub,
    role: payload.auth || payload.role || 'USER',
    provider: payload.provider || 'oauth',
    profileImage: payload.picture || payload.avatar_url || null,
  }
}

/**
 * axios 에러를 LoginError(ERR-X2xx/3xx)로 변환
 */
function classifyAxiosError(error, providerLetter) {
  const prefix = `ERR-${providerLetter}`

  // 응답이 아예 없음 = 네트워크 단에서 실패 (DNS, CORS, 차단, timeout 등)
  if (!error?.response) {
    const msg = String(error?.message || '').toLowerCase()
    if (msg.includes('timeout')) {
      return new LoginError(
        `${prefix}-201`,
        `백엔드 응답 시간 초과 (서버 응답 없음)`,
        { rawMessage: error?.message }
      )
    }
    if (
      msg.includes('network') ||
      msg.includes('failed to fetch') ||
      msg.includes('xhr') ||
      msg.includes('err_')
    ) {
      return new LoginError(
        `${prefix}-200`,
        `백엔드에 도달할 수 없음 (네트워크/방화벽/CORS/DNS)`,
        { rawMessage: error?.message }
      )
    }
    return new LoginError(
      `${prefix}-299`,
      `백엔드 통신 실패 (원인 불명)`,
      { rawMessage: error?.message }
    )
  }

  const status = error.response.status
  const body = error.response.data
  const bodyStr = typeof body === 'string'
    ? body
    : JSON.stringify(body || {})

  if (status >= 500) {
    return new LoginError(
      `${prefix}-${status}`,
      `백엔드 서버 오류 (HTTP ${status})`,
      { status, body: bodyStr.slice(0, 400) }
    )
  }
  if (status === 401 || status === 403) {
    return new LoginError(
      `${prefix}-${status}`,
      `백엔드 인증 거부 (HTTP ${status}) — idToken 검증 실패 가능성 (audience/signature 불일치)`,
      { status, body: bodyStr.slice(0, 400) }
    )
  }
  if (status >= 400) {
    return new LoginError(
      `${prefix}-${status}`,
      `백엔드가 요청 거부 (HTTP ${status})`,
      { status, body: bodyStr.slice(0, 400) }
    )
  }

  return new LoginError(
    `${prefix}-2${status}`,
    `예상치 못한 HTTP 응답 (${status})`,
    { status, body: bodyStr.slice(0, 400) }
  )
}

async function postToBackend(provider, body) {
  const providerLetter = provider === 'apple' ? 'A' : 'G'
  let data
  try {
    const resp = await authClient.post(`/login/${provider}/native`, body, {
      withCredentials: true,
    })
    data = resp.data
  } catch (e) {
    throw classifyAxiosError(e, providerLetter)
  }

  const accessToken = data?.accessToken
  if (!accessToken) {
    const bodyStr = typeof data === 'string' ? data : JSON.stringify(data || {})
    throw new LoginError(
      `ERR-${providerLetter}-300`,
      `백엔드 응답에 accessToken 없음 (200 OK이지만 토큰 누락)`,
      { responseBody: bodyStr.slice(0, 400) }
    )
  }
  const user = data.user || buildUserFromPayload(decodeJwtPayload(accessToken))
  return {
    accessToken,
    user,
    refreshToken: data.refreshToken || accessToken,
    consentRequired: data.consentRequired === true,
  }
}

export async function signInWithApple() {
  await ensureInitialized()
  let result
  try {
    result = await SocialLogin.login({
      provider: 'apple',
      options: { scopes: ['email', 'name'] },
    })
  } catch (e) {
    if (isCancelLike(e?.message, e?.code)) {
      throw makeCancelError(e?.message)
    }
    throw new LoginError(
      'ERR-A-101',
      `Apple SDK 로그인 실패: ${e?.message || e}`,
      { rawError: String(e), errorCode: e?.code }
    )
  }

  const identityToken = result?.result?.idToken
  if (!identityToken) {
    throw new LoginError(
      'ERR-A-102',
      'Apple SDK가 identityToken을 반환하지 않음 (Sign in with Apple capability/Provisioning Profile 점검 필요)',
      { result: JSON.stringify(result || {}).slice(0, 400) }
    )
  }
  return await postToBackend('apple', { identityToken })
}

export async function signInWithGoogle() {
  await ensureInitialized()
  let result
  try {
    result = await SocialLogin.login({
      provider: 'google',
      options: { scopes: ['profile', 'email'] },
    })
  } catch (e) {
    if (isCancelLike(e?.message, e?.code)) {
      throw makeCancelError(e?.message)
    }
    throw new LoginError(
      'ERR-G-101',
      `Google SDK 로그인 실패: ${e?.message || e}`,
      { rawError: String(e), errorCode: e?.code }
    )
  }

  const idToken = result?.result?.idToken
  if (!idToken) {
    throw new LoginError(
      'ERR-G-102',
      'Google SDK가 idToken을 반환하지 않음 (OAuth Client ID/SHA 지문 점검 필요)',
      { result: JSON.stringify(result || {}).slice(0, 400) }
    )
  }
  return await postToBackend('google', { idToken })
}

export async function signOutNative(provider) {
  if (!Capacitor.isNativePlatform()) return
  try {
    await SocialLogin.logout({ provider })
  } catch (e) {
    console.warn(`[nativeAuth] ${provider} logout 실패:`, e)
  }
}
