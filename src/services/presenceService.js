// 사용자 presence(오프라인) 비콘
// 앱이 백그라운드/탭 비활성/종료될 때 백엔드에 즉시 오프라인 통보.
// 서버는 grace 5초 후 해당 디바이스를 cluster presence에서 제거 → 그 다음
// 메시지부터 FCM push fallback이 즉시 동작.
//
// 백엔드 스펙:
//   POST /api/connection/offline
//   Authorization: Bearer {jwt}
//   Content-Type: application/json
//   Body: { deviceId: string }   // ← WS CONNECT 시 사용한 동일 deviceId
//
// ⚠️ "online" 통보 엔드포인트는 없음 — WS 재연결(STOMP CONNECT) 자체가 online 신호.
//
// 도착 보장: fetch + keepalive (커스텀 헤더 가능) 우선,
//           sendBeacon 폴백(헤더 못 실어서 query로 token, deviceId 전달)

import { ENV } from '@/config/env.js'
import { getAccessToken, getDeviceId } from '@/utils/auth.js'

// /api 루트 — VITE_USER_BASE_URL이 정확히 https://...../api 형태
function endpoint() {
  return `${ENV.USER_BASE_URL}/connection/offline`
}

let disabled = false

/**
 * 앱이 백그라운드로 가거나 닫힐 때 호출.
 * fire-and-forget — 응답 안 기다림.
 */
export function notifyOffline() {
  if (disabled) return

  const token = getAccessToken()
  if (!token) return

  const deviceId = getDeviceId()
  if (!deviceId) return

  const url = endpoint()
  const payload = JSON.stringify({ deviceId })

  try {
    // 1차: fetch + keepalive — 커스텀 헤더(Authorization) 가능 + unload 중에도 전송
    if (typeof fetch === 'function') {
      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: payload,
        keepalive: true,
      }).catch((e) => {
        if (e?.status === 404 || String(e).includes('404')) disabled = true
      })
      return
    }

    // 2차 폴백: sendBeacon — 헤더 못 실음 → query로 token 전달
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const beaconUrl = `${url}?token=${encodeURIComponent(token)}`
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(beaconUrl, blob)
    }
  } catch {
    // silent
  }
}
