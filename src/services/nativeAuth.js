// 네이티브 빌드(iOS/Android)에서 Apple/Google 소셜 로그인을 처리한다.
// 1) 네이티브 SDK로 ID Token을 받아 백엔드 native endpoint에 POST
// 2) 백엔드가 자체 accessToken 반환 → 호출 측에서 useAuth.login으로 상태 갱신

import { Capacitor } from '@capacitor/core'
import { SocialLogin } from '@capgo/capacitor-social-login'
import { authClient } from '@/api/client.js'

const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID
const GOOGLE_IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI

let initialized = false

async function ensureInitialized() {
  if (initialized) return
  // iOS는 ASAuthorizationAppleIDProvider가 bundle ID로 처리하므로 redirectUrl 불필요.
  // redirectUrl을 넘기면 플러그인이 authorizationCode를 자동 POST해서
  // 백엔드 OAuth2 콜백(/login/oauth2/code/apple)이 잘못된 형태로 호출됨.
  const isIos = Capacitor.getPlatform() === 'ios'
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

async function postToBackend(provider, body) {
  // 백엔드 매핑: /login/{apple|google}/native — accessToken 응답
  const { data } = await authClient.post(`/login/${provider}/native`, body, {
    withCredentials: true,
  })
  const accessToken = data?.accessToken
  if (!accessToken) {
    throw new Error('서버에서 accessToken을 받지 못했습니다.')
  }
  const user = data.user || buildUserFromPayload(decodeJwtPayload(accessToken))
  return { accessToken, user, refreshToken: data.refreshToken || accessToken }
}

export async function signInWithApple() {
  await ensureInitialized()
  const result = await SocialLogin.login({
    provider: 'apple',
    options: { scopes: ['email', 'name'] },
  })
  const identityToken = result?.result?.idToken
  if (!identityToken) throw new Error('Apple 로그인에서 identityToken을 받지 못했습니다.')
  return await postToBackend('apple', { identityToken })
}

export async function signInWithGoogle() {
  await ensureInitialized()
  const result = await SocialLogin.login({
    provider: 'google',
    options: { scopes: ['profile', 'email'] },
  })
  const idToken = result?.result?.idToken
  if (!idToken) throw new Error('Google 로그인에서 idToken을 받지 못했습니다.')
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
