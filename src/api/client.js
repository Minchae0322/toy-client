// src/api/client.js
import axios from 'axios'

// 환경에 따른 기본 URL 설정
const getAuthBaseUrl = () => {
  const envUrl = import.meta.env.VITE_AUTH_BASE_URL
  if (envUrl) return envUrl  // env에 이미 전체 경로 포함 (e.g. /api/auth)
  // 개발 서버에서는 프록시 사용, 프로덕션에서는 공개 도메인으로 직접 요청
  return import.meta.env.DEV ? '/api' : 'https://yogurtte.com/api/auth'
}

/**
 * 메인 API 클라이언트 인스턴스
 */
export const apiClient = axios.create({
  baseURL: getAuthBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // 🔥 HttpOnly 쿠키 자동 전송
})

/**
 * 인증 서버 전용 클라이언트 (토큰 갱신용)
 */
export const authClient = axios.create({
  baseURL: getAuthBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // 🔥 Cookie 전송 필수!
})

// 기본 내보내기 (기존 코드 호환성)
export default apiClient