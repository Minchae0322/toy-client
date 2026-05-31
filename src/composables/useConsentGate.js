// 개인정보 처리방침 동의 게이트
// 로그인 / OAuth 콜백 / 토큰 재발급 응답의 consentRequired 플래그를 받아
// true 면 /consent 화면으로 라우팅한다.
//
// 모듈 스코프 단일 상태로 가장 최근 redirect 의도를 보관 (재진입 보호).

import { ref } from 'vue'

// 동의 후 돌아갈 경로 (기본값 /feed)
const pendingRedirect = ref(null)

export function useConsentGate() {
  function setPendingRedirect(path) {
    pendingRedirect.value = path
  }
  function consumePendingRedirect(fallback = '/feed') {
    const p = pendingRedirect.value || fallback
    pendingRedirect.value = null
    return p
  }
  function parseConsentFlag(value) {
    if (value === true) return true
    if (typeof value === 'string') return value === 'true' || value === '1'
    return false
  }
  return {
    pendingRedirect,
    setPendingRedirect,
    consumePendingRedirect,
    parseConsentFlag,
  }
}
