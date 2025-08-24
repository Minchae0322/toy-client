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
  }
})

/**
 * 인증 서버 전용 클라이언트 (토큰 갱신용)
 */
export const authClient = axios.create({
  baseURL: import.meta.env.DEV
      ? 'http://localhost:8081'
      : (import.meta.env.VITE_AUTH_SERVER_URL || 'https://your-auth-server.com'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 기본 내보내기 (기존 코드 호환성)
export default apiClient