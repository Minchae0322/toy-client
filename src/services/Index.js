// services/index.js
// 모든 API 서비스를 통합 관리하는 인덱스 파일

// ==================== 기반 클래스 및 유틸리티 ====================
export { BaseApiService, ApiError } from './BaseApiService.js'

// ==================== 서비스 클래스들 ====================
export { default as authService, useAuth } from './AuthService.js'
export { default as chatService, useChat } from './ChatService.js'
export { default as oneMouthService, useOneMouth } from './OneMouthService.js'

// ==================== 통합 API 매니저 ====================

/**
 * 통합 API 서비스 매니저
 * 모든 서비스를 중앙에서 관리하고 공통 기능 제공
 */
class ApiServiceManager {
  constructor() {
    this.services = new Map()
    this.isInitialized = false

    console.log('🌐 [API MANAGER] 통합 API 서비스 매니저 초기화됨')
  }

  // ==================== 서비스 등록 및 관리 ====================

  /**
   * 서비스 등록
   */
  registerService(name, service) {
    if (!name || !service) {
      throw new Error('서비스 이름과 인스턴스가 필요합니다.')
    }

    this.services.set(name, service)
    console.log(`✅ [API MANAGER] ${name} 서비스 등록됨`)

    return this
  }

  /**
   * 서비스 조회
   */
  getService(name) {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`${name} 서비스를 찾을 수 없습니다.`)
    }
    return service
  }

  /**
   * 모든 서비스 초기화
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ [API MANAGER] 이미 초기화되었습니다.')
      return
    }

    console.log('🔄 [API MANAGER] 서비스들 초기화 중...')

    try {
      // 동적 import로 서비스들 불러오기
      const [
        { default: AuthService },
        { default: ChatService },
        { default: OneMouthService }
      ] = await Promise.all([
        import('./AuthService.js'),
        import('./ChatService.js'),
        import('./OneMouthService.js')
      ])

      // 서비스 인스턴스들 등록
      this.registerService('auth', new AuthService())
      this.registerService('chat', new ChatService())
      this.registerService('oneMouth', new OneMouthService())

      this.isInitialized = true
      console.log('✅ [API MANAGER] 모든 서비스 초기화 완료')

    } catch (error) {
      console.error('❌ [API MANAGER] 서비스 초기화 실패:', error)
      throw error
    }
  }

  // ==================== 전체 연결 테스트 ====================

  /**
   * 모든 서비스 연결 테스트
   */
  async testAllConnections() {
    console.log('🔍 [API MANAGER] 전체 서버 연결 테스트...')

    const results = {}

    for (const [name, service] of this.services) {
      try {
        const isConnected = await service.testConnection()
        results[name] = isConnected

        console.log(`${isConnected ? '✅' : '❌'} [API MANAGER] ${name.toUpperCase()} 서버:`,
            isConnected ? '연결됨' : '연결 실패')
      } catch (error) {
        results[name] = false
        console.error(`❌ [API MANAGER] ${name.toUpperCase()} 서버 테스트 실패:`, error.message)
      }
    }

    const totalServices = Object.keys(results).length
    const connectedServices = Object.values(results).filter(Boolean).length

    console.log(`📊 [API MANAGER] 연결 테스트 결과: ${connectedServices}/${totalServices} 서비스 연결됨`)

    return {
      results,
      summary: {
        total: totalServices,
        connected: connectedServices,
        success: connectedServices === totalServices
      }
    }
  }

  // ==================== 통합 에러 핸들링 ====================

  /**
   * 전역 에러 핸들러 설정
   */
  setupGlobalErrorHandler() {
    // 네트워크 에러 감지
    window.addEventListener('online', () => {
      console.log('🌐 [API MANAGER] 네트워크 연결 복구됨')
      this.handleNetworkRestore()
    })

    window.addEventListener('offline', () => {
      console.warn('⚠️ [API MANAGER] 네트워크 연결 끊김')
      this.handleNetworkDisconnect()
    })

    // Unhandled Promise Rejection 감지
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.name === 'ApiError') {
        console.error('❌ [API MANAGER] 처리되지 않은 API 에러:', event.reason)

        // 사용자에게 알림 (선택적)
        this.notifyApiError(event.reason)

        // 에러 방지
        event.preventDefault()
      }
    })
  }

  /**
   * 네트워크 연결 복구 처리
   */
  handleNetworkRestore() {
    // 모든 서비스 연결 재테스트
    this.testAllConnections()
  }

  /**
   * 네트워크 연결 끊김 처리
   */
  handleNetworkDisconnect() {
    // 오프라인 모드 활성화 등의 처리
    console.log('📱 [API MANAGER] 오프라인 모드 활성화')
  }

  /**
   * API 에러 알림
   */
  notifyApiError(error) {
    // 개발 환경에서만 상세 에러 표시
    if (import.meta.env.DEV) {
      console.error('🚨 [API MANAGER] API 에러 알림:', error.toLogObject())
    }

    // 운영 환경에서는 사용자 친화적 메시지만 표시
    if (error.status === 401) {
      console.log('🔒 [API MANAGER] 인증 필요 - 로그인 페이지로 이동')
      // 로그인 페이지로 리다이렉트 로직
    } else if (error.status >= 500) {
      console.log('🔧 [API MANAGER] 서버 오류 - 잠시 후 다시 시도해주세요')
      // 서버 오류 토스트 표시 로직
    }
  }

  // ==================== 개발 도구 ====================

  /**
   * 모든 서비스 상태 디버깅
   */
  debugAllServices() {
    console.group('🔍 [API MANAGER] 전체 서비스 상태 디버깅')

    console.log('=== 매니저 정보 ===')
    console.log('초기화 상태:', this.isInitialized)
    console.log('등록된 서비스 수:', this.services.size)
    console.log('등록된 서비스:', Array.from(this.services.keys()))

    console.log('=== 환경 정보 ===')
    console.log('Environment:', import.meta.env.MODE)
    console.log('Development:', import.meta.env.DEV)
    console.log('API URLs:')
    console.log('  - Auth:', import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8081')
    console.log('  - Content:', import.meta.env.VITE_CONTENT_BASE_URL || 'http://localhost:8082')
    console.log('  - Chat:', import.meta.env.VITE_CHAT_BASE_URL || 'http://localhost:8084')

    // 각 서비스별 상태 디버깅
    for (const [name, service] of this.services) {
      if (typeof service.debugStatus === 'function') {
        service.debugStatus()
      }
    }

    console.groupEnd()
  }

  /**
   * 성능 모니터링 정보
   */
  getPerformanceInfo() {
    const perfData = {
      services: {},
      timestamp: new Date().toISOString()
    }

    for (const [name, service] of this.services) {
      perfData.services[name] = {
        baseURL: service.baseURL,
        serviceName: service.serviceName,
        isRefreshing: service.isRefreshing,
        queueSize: service.failedQueue?.length || 0
      }
    }

    return perfData
  }
}

// ==================== 싱글톤 인스턴스 ====================

// 전역 API 매니저 인스턴스 생성
export const apiManager = new ApiServiceManager()

// ==================== 편의 함수들 ====================

/**
 * API 서비스 초기화 (앱 시작시 호출)
 */
export async function initializeApiServices() {
  try {
    await apiManager.initialize()
    apiManager.setupGlobalErrorHandler()
    return true
  } catch (error) {
    console.error('❌ [API MANAGER] 서비스 초기화 실패:', error)
    return false
  }
}

/**
 * 특정 서비스 가져오기
 */
export function getApiService(serviceName) {
  return apiManager.getService(serviceName)
}

/**
 * 모든 서비스 연결 테스트
 */
export function testApiConnections() {
  return apiManager.testAllConnections()
}

/**
 * 전체 디버깅 정보 출력
 */
export function debugApiServices() {
  apiManager.debugAllServices()
}

// ==================== 기존 코드 호환성 ====================

// 기존 방식으로 import한 사용자들을 위한 호환성 유지
import authService from './AuthService.js'
import chatService from './ChatService.js'
import oneMouthService from './OneMouthService.js'

// 기존 axios.js 스타일 export (하위 호환성)
export {
  authService as authApi,
  chatService as chatApi,
  oneMouthService as contentApi
}

// Vue Composables 재내보내기
export { useAuth, useChat, useOneMouth }

// 통합된 서비스 객체
export const services = {
  auth: authService,
  chat: chatService,
  oneMouth: oneMouthService,
  content: oneMouthService // 별칭
}

// ==================== 기본 내보내기 ====================

export default {
  // 서비스들
  authService,
  chatService,
  oneMouthService,

  // 매니저
  apiManager,

  // 유틸리티 함수들
  initializeApiServices,
  getApiService,
  testApiConnections,
  debugApiServices,

  // Composables
  useAuth,
  useChat,
  useOneMouth
}