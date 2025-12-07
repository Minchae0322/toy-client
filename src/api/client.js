// src/api/client.js
import axios from 'axios'

/**
 * 메인 API 클라이언트 인스턴스
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
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
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // 🔥 Cookie 전송 필수!
})

// 기본 내보내기 (기존 코드 호환성)
export default apiClient