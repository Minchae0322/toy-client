// FCM (Firebase Cloud Messaging) 서비스 — 네이티브 푸시 전용
// iOS/Android Capacitor 환경에서만 동작. 웹은 no-op (모바일 한정 정책).
//
// 백엔드 스펙: POST/DELETE /user/me/fcm-tokens (AUTH 서비스, FcmTokenController)
//   POST   body: { token, deviceId, platform: 'IOS' | 'ANDROID' }
//   DELETE body: { token }

import { Capacitor } from '@capacitor/core'
import { FirebaseMessaging } from '@capacitor-firebase/messaging'
import { apiClient } from '@/api/client.js'
import { getDeviceId } from '@/utils/auth.js'
import router from '@/router'
import { notificationService } from '@/services/NotificationService.js'

let initialized = false
let registeredToken = null
let inflightTokenPost = null

/** Capacitor의 'ios'/'android' → 백엔드 enum 'IOS'/'ANDROID' */
function platformCode() {
  const p = Capacitor.getPlatform()
  if (p === 'ios') return 'IOS'
  if (p === 'android') return 'ANDROID'
  return p.toUpperCase()
}

/**
 * 권한 요청 → FCM 토큰 발급 → 백엔드 등록
 * 로그인 직후 / 앱 시작 시 호출 (idempotent)
 */
export async function registerFcm() {
  if (!Capacitor.isNativePlatform()) {
    return { skipped: true, reason: 'web' }
  }

  if (initialized && registeredToken) {
    return { token: registeredToken, alreadyRegistered: true }
  }

  const perm = await FirebaseMessaging.requestPermissions()
  if (perm.receive !== 'granted') {
    return { skipped: true, reason: 'permission-denied' }
  }

  // Android 알림 채널 등록 (멱등) — 채널은 한 번 만들어지면 변경 불가능하므로 신중히
  if (Capacitor.getPlatform() === 'android') {
    try {
      await FirebaseMessaging.createChannel({
        id: 'yogurtte_default',
        name: '요거뜨 알림',
        description: '채팅, 댓글, 좋아요 등 일반 알림',
        importance: 4, // IMPORTANCE_HIGH (헤드업 노티 + 사운드)
        visibility: 1, // VISIBILITY_PUBLIC (잠금화면에서 내용 표시)
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#9333EA',
      })
    } catch (e) {
      // 이미 존재하면 무시
      console.log('[FCM] 채널 등록 스킵:', e?.message)
    }
  }

  const { token } = await FirebaseMessaging.getToken()
  if (!token) {
    return { skipped: true, reason: 'no-token' }
  }

  console.log('[FCM] 발급된 토큰:', token)

  await sendTokenToBackend(token)

  if (!initialized) {
    FirebaseMessaging.addListener('tokenReceived', async (event) => {
      if (!event.token) return
      try {
        await sendTokenToBackend(event.token)
      } catch (e) {
        console.warn('[FCM] 토큰 갱신 등록 실패:', e)
      }
    })

    FirebaseMessaging.addListener('notificationReceived', (event) => {
      console.log('[FCM] foreground 수신:', JSON.stringify(event, null, 2))
    })

    FirebaseMessaging.addListener('notificationActionPerformed', async (event) => {
      console.log('[FCM] 알림 탭:', event)
      await routeFromPushPayload(event?.notification?.data)
    })

    initialized = true
  }

  return { token }
}

async function routeFromPushPayload(data) {
  if (!data) return
  const route = notificationService.getNotificationRoute({
    actionUrl: data.actionUrl,
    referenceType: data.referenceType,
    referenceId: data.referenceId,
  })
  if (!route) return
  try {
    await router.isReady()
    // 푸시 탭으로 진입할 땐 동일 라우트여도 신규 데이터 반영을 위해
    // _push 타임스탬프 쿼리를 붙여 <RouterView :key> 가 컴포넌트를 remount 하도록 함
    const target = typeof route === 'string'
      ? { path: route, query: { _push: String(Date.now()) } }
      : { ...route, query: { ...(route.query || {}), _push: String(Date.now()) } }
    await router.push(target)
  } catch (e) {
    console.warn('[FCM] 푸시 라우팅 실패:', e)
  }
}

async function sendTokenToBackend(token) {
  if (registeredToken === token) return
  if (inflightTokenPost) {
    try { await inflightTokenPost.promise } catch {}
    if (registeredToken === token) return
  }
  const promise = apiClient.post('/user/me/fcm-tokens', {
    token,
    deviceId: getDeviceId(),
    platform: platformCode(),
  }).then(() => {
    registeredToken = token
  }).finally(() => {
    if (inflightTokenPost?.token === token) inflightTokenPost = null
  })
  inflightTokenPost = { token, promise }
  await promise
}

/**
 * 로그아웃 시 토큰 폐기
 */
export async function unregisterFcm() {
  if (!Capacitor.isNativePlatform() || !registeredToken) return

  try {
    await apiClient.delete('/user/me/fcm-tokens', {
      data: { token: registeredToken }
    })
  } catch (e) {
    console.warn('[FCM] 백엔드 토큰 삭제 실패:', e)
  }

  try {
    await FirebaseMessaging.deleteToken()
  } catch (e) {
    console.warn('[FCM] 디바이스 토큰 삭제 실패:', e)
  }

  registeredToken = null
}
