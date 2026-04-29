// FCM (Firebase Cloud Messaging) 서비스 — 네이티브 푸시 전용
// iOS/Android Capacitor 환경에서만 동작. 웹은 no-op.

import { Capacitor } from '@capacitor/core'
import { FirebaseMessaging } from '@capacitor-firebase/messaging'
import { apiClient } from '@/api/client.js'

let initialized = false
let registeredToken = null

/**
 * 권한 요청 → FCM 토큰 발급 → 백엔드 등록
 * 로그인 직후 호출
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

  const { token } = await FirebaseMessaging.getToken()
  if (!token) {
    return { skipped: true, reason: 'no-token' }
  }

  await sendTokenToBackend(token)
  registeredToken = token

  if (!initialized) {
    FirebaseMessaging.addListener('tokenReceived', async (event) => {
      if (event.token && event.token !== registeredToken) {
        try {
          await sendTokenToBackend(event.token)
          registeredToken = event.token
        } catch (e) {
          console.warn('[FCM] 토큰 갱신 등록 실패:', e)
        }
      }
    })

    FirebaseMessaging.addListener('notificationReceived', (event) => {
      console.log('[FCM] foreground 수신:', event)
    })

    FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      console.log('[FCM] 알림 탭:', event)
      // TODO: event.notification.data.roomId로 라우팅
    })

    initialized = true
  }

  return { token }
}

async function sendTokenToBackend(token) {
  const platform = Capacitor.getPlatform() // 'ios' | 'android'
  await apiClient.post('/users/me/fcm-token', { token, platform })
}

/**
 * 로그아웃 시 토큰 폐기
 */
export async function unregisterFcm() {
  if (!Capacitor.isNativePlatform() || !registeredToken) return

  try {
    await apiClient.delete('/users/me/fcm-token', {
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
