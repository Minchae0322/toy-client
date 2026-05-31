// src/config/env.js
// 환경 설정 모듈 - 모든 환경변수를 중앙에서 관리

/**
 * 환경 타입 정의
 * - local: 로컬 개발 (localhost 백엔드)
 * - development: 개발 서버 (원격 개발 서버)
 * - production: 운영 서버 (nginx 프록시)
 */

const mode = import.meta.env.MODE
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD
const envName = import.meta.env.VITE_ENV_NAME || 'local'

/**
 * 환경 설정 객체
 */
export const ENV = {
  // Vite 기본 환경 정보
  MODE: mode,
  DEV: isDevelopment,
  PROD: isProduction,

  // 커스텀 환경 식별자 (local, development, production)
  ENV_NAME: envName,

  // 환경 체크 헬퍼
  isLocal: envName === 'local',
  isDevelopment: envName === 'development',
  isProduction: envName === 'production',

  // MSA 서비스 URL
  AUTH_BASE_URL: import.meta.env.VITE_AUTH_BASE_URL,
  CONTENT_BASE_URL: import.meta.env.VITE_CONTENT_BASE_URL,
  USER_BASE_URL: import.meta.env.VITE_USER_BASE_URL,
  CHAT_BASE_URL: import.meta.env.VITE_CHAT_BASE_URL,
  WS_URL: import.meta.env.VITE_WS_URL,
}

/**
 * 환경별 기본 URL 맵
 */
const DEFAULT_URLS = {
  local: {
    AUTH: 'http://localhost:8081',
    CONTENT: 'http://localhost:8082',
    USER: 'http://localhost:8083',
    CHAT: 'http://localhost:8084',
    WS: 'http://localhost:8084/api/ws',
  },
  development: {
    AUTH: 'http://54.180.89.70:8081',
    CONTENT: 'http://54.180.89.70:8082',
    USER: 'http://54.180.89.70:8083',
    CHAT: 'http://54.180.89.70:8084',
    WS: 'http://54.180.89.70:8084/api/ws',
  },
  production: {
    AUTH: 'http://54.180.89.70/auth',
    CONTENT: 'http://54.180.89.70/content',
    USER: 'http://54.180.89.70',
    CHAT: 'http://54.180.89.70/chat',
    WS: 'http://54.180.89.70/api/ws',
  },
}

/**
 * 서비스 URL 가져오기
 * @param {'AUTH' | 'CONTENT' | 'USER' | 'CHAT' | 'WS'} serviceName
 * @returns {string} 서비스 URL
 */
export const getServiceUrl = (serviceName) => {
  const envUrls = {
    AUTH: ENV.AUTH_BASE_URL,
    CONTENT: ENV.CONTENT_BASE_URL,
    USER: ENV.USER_BASE_URL,
    CHAT: ENV.CHAT_BASE_URL,
    WS: ENV.WS_URL,
  }

  // 환경변수가 있으면 사용, 없으면 기본값 사용
  return envUrls[serviceName] || DEFAULT_URLS[envName]?.[serviceName] || DEFAULT_URLS.local[serviceName]
}

/**
 * API Base URL 가져오기 (서비스별)
 */
export const API_URLS = {
  get AUTH() { return getServiceUrl('AUTH') },
  get CONTENT() { return getServiceUrl('CONTENT') },
  get USER() { return getServiceUrl('USER') },
  get CHAT() { return getServiceUrl('CHAT') },
  get WS() { return getServiceUrl('WS') },
}

/**
 * 외부 공유용 공개 웹 URL 베이스
 * - 네이티브 앱(WebView)에서는 hostname 이 'app.yogurtte.com' 인데, 카카오·X 등으로
 *   공유한 링크를 받은 외부 사용자는 PWA/웹사이트에서 접근해야 하므로
 *   별도의 공개 도메인을 사용해야 한다.
 * - VITE_PUBLIC_WEB_URL 환경변수가 있으면 그걸 사용, 없으면 기본값.
 */
export const PUBLIC_WEB_URL =
  import.meta.env.VITE_PUBLIC_WEB_URL || 'https://yogurtte.com'

/**
 * 현재 경로(path) 또는 임의 경로를 공개 공유 URL 로 변환.
 *
 * @param {string} [path] - '/battles/123' 형태. 생략 시 window.location.pathname + search
 * @returns {string} 'https://app.yogurtte.com/battles/123?...'
 */
export const buildShareUrl = (path) => {
  const base = PUBLIC_WEB_URL.replace(/\/+$/, '')
  let p
  if (typeof path === 'string' && path) {
    p = path.startsWith('/') ? path : `/${path}`
  } else if (typeof window !== 'undefined' && window.location) {
    p = `${window.location.pathname || '/'}${window.location.search || ''}`
  } else {
    p = '/'
  }
  return `${base}${p}`
}

/**
 * 환경 정보 로깅 (개발 환경에서만)
 */
if (isDevelopment) {
  const envEmoji = {
    local: '🏠',
    development: '🔧',
    production: '🚀',
  }

  console.log(`${envEmoji[envName] || '❓'} Environment: ${envName.toUpperCase()}`)
  console.log('  Mode:', mode)
  console.log('  AUTH_BASE_URL:', API_URLS.AUTH)
  console.log('  CONTENT_BASE_URL:', API_URLS.CONTENT)
  console.log('  USER_BASE_URL:', API_URLS.USER)
  console.log('  CHAT_BASE_URL:', API_URLS.CHAT)
  console.log('  WS_URL:', API_URLS.WS)
}

/**
 * 프로덕션 환경 검증
 */
if (isProduction) {
  const requiredVars = [
    'VITE_AUTH_BASE_URL',
    'VITE_CONTENT_BASE_URL',
    'VITE_USER_BASE_URL',
    'VITE_CHAT_BASE_URL',
    'VITE_WS_URL'
  ]

  const missing = requiredVars.filter(v => !import.meta.env[v])

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export default ENV
