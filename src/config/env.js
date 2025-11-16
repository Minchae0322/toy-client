// src/config/env.js
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD
const mode = import.meta.env.MODE

export const ENV = {
  MODE: mode,
  DEV: isDevelopment,
  PROD: isProduction,

  // 개발 환경: AWS EC2 단일 서버
  // 프로덕션 환경: MSA 구조 (여러 서버)
  AUTH_BASE_URL: import.meta.env.VITE_AUTH_BASE_URL,
  CONTENT_BASE_URL: import.meta.env.VITE_CONTENT_BASE_URL,
  USER_BASE_URL: import.meta.env.VITE_USER_BASE_URL,
  CHAT_BASE_URL: import.meta.env.VITE_CHAT_BASE_URL,
  WS_URL: import.meta.env.VITE_WS_URL,
}

/**
 * 환경별 기본 URL 반환
 */
export const getServiceUrl = (serviceName) => {
  if (isDevelopment) {
    // 개발 환경: 모든 요청이 같은 서버로 (54.180.89.70:8082)
    return ENV.CONTENT_BASE_URL || 'http://54.180.89.70:8082'
  }

  // 프로덕션 환경: 각 서비스별 다른 서버
  const urls = {
    'AUTH': ENV.AUTH_BASE_URL,
    'CONTENT': ENV.CONTENT_BASE_URL,
    'USER': ENV.USER_BASE_URL,
    'CHAT': ENV.CHAT_BASE_URL,
  }

  return urls[serviceName]
}

// 개발 환경 로깅
if (isDevelopment) {
  console.log('🔧 Development Environment (Single Server):')
  console.log('  Base URL:', ENV.CONTENT_BASE_URL || 'http://54.180.89.70:8082')
}

// 프로덕션 환경 검증
if (isProduction) {
  console.log('🚀 Production Environment (MSA):')
  console.log('  AUTH_BASE_URL:', ENV.AUTH_BASE_URL)
  console.log('  CONTENT_BASE_URL:', ENV.CONTENT_BASE_URL)
  console.log('  USER_BASE_URL:', ENV.USER_BASE_URL)
  console.log('  CHAT_BASE_URL:', ENV.CHAT_BASE_URL)

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