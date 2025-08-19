// services/chatApi.js
// services/chatApi.js
import * as authUtils from '@/utils/auth.js'

class ChatApi {
  constructor() {
    // Vite 환경변수 사용
    // 개발환경에서는 프록시를 사용하므로 상대 경로 사용
    // 프로덕션에서는 절대 경로 사용
    if (import.meta.env.DEV) {
      this.baseURL = 'http://localhost:8084/api' // 프록시 사용으로 빈 문자열
      this.wsURL = 'ws://localhost:8084' // WebSocket은 직접 연결 (CORS 문제 없음)
    } else {
      this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-domain.com'
      this.wsURL = import.meta.env.VITE_WS_URL || 'wss://your-api-domain.com'
    }

    console.log('🌐 ChatApi 초기화됨 (Vite + Pinia)')
    console.log('환경:', import.meta.env.MODE)
    console.log('HTTP API Base URL:', this.baseURL)
    console.log('WebSocket URL:', this.wsURL)
    console.log('📊 HTTP는 프록시 사용, WebSocket은 직접 연결')
  }

  // WebSocket URL 반환 메서드 추가
  getWebSocketURL() {
    return this.wsURL
  }

  // 인증 토큰 가져오기 (authUtils 사용)
  getAuthToken() {
    const token = authUtils.getAccessToken()

    if (token && token.trim() !== '') {
      console.log('🔑 인증 토큰 발견 (authUtils):', token.substring(0, 20) + '...')
      return token.trim()
    }

    console.warn('⚠️ 인증 토큰을 찾을 수 없습니다 (authUtils)')
    return null
  }

  // 디바이스 ID 가져오기
  getDeviceId() {
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = this.generateDeviceId()
      localStorage.setItem('device_id', deviceId)
    }
    return deviceId
  }

  // 디바이스 ID 생성
  generateDeviceId() {
    return `web_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
  }

  // 현재 사용자 ID 가져오기 (authUtils 사용)
  getCurrentUserId() {
    const userInfo = authUtils.getUserInfo()
    if (userInfo && userInfo.id) {
      console.log('👤 사용자 ID (authUtils):', userInfo.id)
      return userInfo.id
    }

    // fallback: JWT 토큰에서 추출
    try {
      const token = this.getAuthToken()
      if (!token) return null

      const payload = JSON.parse(atob(token.replace('Bearer ', '').split('.')[1]))
      const userId = payload.userId || payload.sub || payload.id
      console.log('👤 사용자 ID (JWT):', userId)
      return userId
    } catch (error) {
      console.warn('사용자 ID 추출 실패:', error)
      return null
    }
  }

  // 공통 헤더 생성 (개선된 버전)
  getHeaders() {
    const token = this.getAuthToken()
    const deviceId = this.getDeviceId()

    const headers = {
      'Content-Type': 'application/json',
      'X-Device-ID': deviceId,
      'X-User-Agent': navigator.userAgent,
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'X-Language': navigator.language || 'ko'
    }

    // 토큰이 있는 경우에만 Authorization 헤더 추가
    if (token) {
      // Bearer 접두사가 없으면 추가
      if (token.startsWith('Bearer ')) {
        headers['Authorization'] = token
      } else {
        headers['Authorization'] = `Bearer ${token}`
      }
      console.log('🔑 Authorization 헤더 추가됨:', headers['Authorization'].substring(0, 20) + '...')
    } else {
      console.warn('⚠️ 인증 토큰이 없어서 Authorization 헤더를 추가하지 않습니다.')
      console.warn('💡 로그인이 필요하거나 토큰이 올바르게 저장되었는지 확인하세요.')
    }

    console.log('📤 요청 헤더:', {
      ...headers,
      'Authorization': headers['Authorization'] ? headers['Authorization'].substring(0, 20) + '...' : '없음'
    })

    return headers
  }

  // API 응답 처리
  async handleResponse(response) {
    if (!response.ok) {
      let errorData = {}
      try {
        errorData = await response.json()
      } catch (parseError) {
        console.warn('에러 응답 파싱 실패:', parseError)
      }

      const errorMessage = errorData.message ||
          errorData.error ||
          `HTTP ${response.status} ${response.statusText}`

      const error = new Error(errorMessage)
      error.status = response.status
      error.data = errorData
      throw error
    }
    return response.json()
  }

  // 요청 로깅
  logRequest(method, url, data = null) {
    console.log(`🌐 [${method}] ${url}`, data ? data : '')
  }

  // 응답 로깅
  logResponse(method, url, response, error = null) {
    if (error) {
      console.error(`❌ [${method}] ${url} 실패:`, error.message)
    } else {
      console.log(`✅ [${method}] ${url} 성공:`, response)
    }
  }

  // === 채팅방 관련 API ===

  // 채팅방 목록 조회 (백엔드 API 연동)
  async getChatRooms(searchCondition = {}) {
    const url = `${this.baseURL}/v1/chat/rooms`
    this.logRequest('GET', url, searchCondition)

    try {
      const queryParams = new URLSearchParams()

      // ChatRoomSearchCondition에 맞는 파라미터 설정
      if (searchCondition.keyword) queryParams.append('keyword', searchCondition.keyword)
      if (searchCondition.roomType) queryParams.append('roomType', searchCondition.roomType)
      if (searchCondition.status) queryParams.append('status', searchCondition.status)

      const requestUrl = `${url}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      // ApiResponse<List<ChatRoomResponse.ChatRoomList>> 구조 처리
      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || [],
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)

      // 네트워크 오류나 서버 오류인 경우 샘플 데이터 반환
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ API 오류로 인해 샘플 데이터를 반환합니다.')
        return this.getSampleChatRooms()
      }

      throw error
    }
  }

  // 채팅방 생성 (백엔드 API 연동)
  async createChatRoom(roomData) {
    const url = `${this.baseURL}/v1/chat/rooms`

    // ChatRoomRequest.Create 구조에 맞게 요청 데이터 변환
    const requestData = {
      title: roomData.title,
      description: roomData.description || null,
      roomType: roomData.roomType || 'GROUP', // GROUP, ONE_TO_ONE, CHANNEL
      participantUserIds: roomData.participantUserIds || [],
      isPrivate: roomData.isPrivate || false,
      maxParticipants: roomData.maxParticipants || null,
      thumbnailUrl: roomData.thumbnailUrl || null
      // userId는 Spring Security의 @AuthenticationPrincipal로 자동 설정됨
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)

      // ApiResponse<ChatRoomResponse.CreateResult> 구조 처리
      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || '채팅방이 성공적으로 생성되었습니다'
      }

    } catch (error) {
      this.logResponse('POST', url, null, error)
      throw error
    }
  }

  // 채팅방 상세 정보 조회
  async getRoomDetail(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}`
    this.logRequest('GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      // ApiResponse<ChatRoomResponse.Detail> 구조 처리
      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)

      // 오류 시 기본 데이터 반환
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ API 오류로 인해 기본 데이터를 반환합니다.')
        return {
          success: true,
          data: {
            roomId: roomId,
            title: `채팅방 ${roomId}`,
            description: null,
            roomType: 'GROUP',
            status: 'ACTIVE',
            participantCount: 1,
            createdAt: new Date().toISOString(),
            lastMessageAt: null,
            lastMessage: null,
            lastMessageType: null,
            thumbnailUrl: null
          },
          message: 'default data'
        }
      }

      throw error
    }
  }

  // 채팅방 입장
  async joinRoom(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/join`
    const requestData = {
      deviceId: this.getDeviceId()
      // userId는 Spring Security로 자동 처리
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('POST', url, null, error)

      // 입장 API는 실패해도 계속 진행할 수 있도록
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ 채팅방 입장 API 실패했지만 계속 진행합니다.')
        return {
          success: false,
          message: 'join api failed but continue'
        }
      }

      throw error
    }
  }

  // 채팅방 나가기
  async leaveRoom(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/leave`
    const requestData = {
      deviceId: this.getDeviceId()
      // userId는 Spring Security로 자동 처리
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('POST', url, null, error)

      // 나가기 API도 실패해도 UI에서는 처리
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ 채팅방 나가기 API 실패했지만 UI에서는 처리합니다.')
        return {
          success: false,
          message: 'leave api failed but continue'
        }
      }

      throw error
    }
  }

  // 온라인 사용자 조회
  async getOnlineUsers(roomId) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/online-users`
    this.logRequest('GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('GET', url, null, error)
      throw error
    }
  }

  // === 메시지 관련 API ===

  // 메시지 목록 조회
  async getMessages(roomId, params = {}) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/messages`
    this.logRequest('GET', url, params)

    try {
      const queryParams = new URLSearchParams({
        page: params.page || 0,
        size: params.size || 50,
        sort: params.sort || 'createdAt,desc'
      })

      // 커서 페이징 파라미터가 있는 경우 추가
      if (params.lastMessageId) {
        queryParams.append('lastMessageId', params.lastMessageId)
      }

      const requestUrl = `${url}?${queryParams}`
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('GET', url, apiResponse)

      // ApiResponse<Page<ChatDetail>> 구조
      return {
        success: apiResponse.success !== false,
        data: apiResponse.data || apiResponse,
        message: apiResponse.message || 'success'
      }

    } catch (error) {
      this.logResponse('GET', url, null, error)

      // 오류 시 빈 페이지 반환
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ 메시지 목록 API 오류로 인해 빈 데이터를 반환합니다.')
        return {
          success: true,
          data: {
            content: this.getSampleMessages(roomId),
            last: true,
            totalElements: 0,
            size: params.size || 50,
            number: params.page || 0
          },
          message: 'sample data due to api error'
        }
      }

      throw error
    }
  }

  // 메시지 전송
  async sendMessage(roomId, messageData) {
    const url = `${this.baseURL}/v1/chat/rooms/${roomId}/messages`
    const requestData = {
      content: messageData.content,
      type: messageData.type || 'TEXT',
      metadata: messageData.metadata || null,
      deviceId: this.getDeviceId(),
      timestamp: new Date().toISOString()
      // senderId는 Spring Security로 자동 처리
    }

    this.logRequest('POST', url, requestData)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      const apiResponse = await this.handleResponse(response)
      this.logResponse('POST', url, apiResponse)
      return apiResponse

    } catch (error) {
      this.logResponse('POST', url, null, error)

      // 메시지 전송 실패 시 임시 응답 반환
      if (error.status >= 500 || !error.status) {
        console.warn('⚠️ 메시지 전송 API 실패, 임시 응답을 반환합니다.')
        return {
          success: false,
          data: {
            message: {
              messageId: `temp-${Date.now()}`,
              roomId: roomId,
              senderId: this.getCurrentUserId(),
              senderName: '나',
              content: messageData.content,
              type: messageData.type || 'TEXT',
              createdAt: new Date().toISOString(),
              status: 'FAILED'
            }
          },
          message: 'send failed'
        }
      }

      throw error
    }
  }

  // 샘플 채팅방 데이터 (백엔드 DTO 형식에 맞춤)
  getSampleChatRooms() {
    return {
      success: true,
      data: [
        {
          roomId: '1',
          title: '개발팀 프로젝트',
          roomType: 'GROUP',
          participantCount: 8,
          lastMessage: '내일 회의 시간 확정했습니다',
          lastMessageType: 'TEXT',
          lastMessageAt: new Date(Date.now() - 300000).toISOString(),
          unreadCount: 3,
          thumbnailUrl: null,
          status: 'ACTIVE'
        },
        {
          roomId: '2',
          title: '이지수',
          roomType: 'ONE_TO_ONE',
          participantCount: 2,
          lastMessage: '점심 뭐 먹을까요?',
          lastMessageType: 'TEXT',
          lastMessageAt: new Date(Date.now() - 600000).toISOString(),
          unreadCount: 1,
          thumbnailUrl: 'https://via.placeholder.com/48/FF6B6B/FFFFFF?text=이',
          status: 'ACTIVE'
        },
        {
          roomId: '3',
          title: '주말 모임 💻',
          roomType: 'GROUP',
          participantCount: 12,
          lastMessage: '사진',
          lastMessageType: 'IMAGE',
          lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
          unreadCount: 7,
          thumbnailUrl: null,
          status: 'ACTIVE'
        }
      ],
      message: 'sample data'
    }
  }

  // 샘플 메시지 데이터
  getSampleMessages(roomId) {
    const currentUserId = this.getCurrentUserId() || 1

    return [
      {
        messageId: `sample-1-${roomId}`,
        roomId: roomId,
        senderId: currentUserId === 1 ? 2 : 1,
        senderName: currentUserId === 1 ? '상대방' : '나',
        content: '안녕하세요! 잘 지내시나요?',
        type: 'TEXT',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        readCount: 1,
        metadata: null
      },
      {
        messageId: `sample-2-${roomId}`,
        roomId: roomId,
        senderId: currentUserId,
        senderName: '나',
        content: '네, 안녕하세요! 저도 잘 지내고 있어요.',
        type: 'TEXT',
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        readCount: 1,
        metadata: null
      }
    ]
  }

  // === 유틸리티 메서드 ===

  // 연결 테스트 (개선된 버전)
  async testConnection() {
    // 여러 엔드포인트를 시도해서 API 서버 상태 확인
    const testEndpoints = [
      `${this.baseURL}/actuator/health`,
      `${this.baseURL}/api/health`,
      `${this.baseURL}/health`,
      `${this.baseURL}/v1/chat/rooms` // 채팅방 API 직접 테스트
    ]

    console.log('🔍 API 연결 테스트 시작...')
    console.log('Base URL:', this.baseURL)
    console.log('테스트할 엔드포인트:', testEndpoints)

    for (const url of testEndpoints) {
      try {
        console.log(`🌐 테스트 중: ${url}`)

        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          // CORS 문제 해결을 위한 옵션
          mode: 'cors',
          credentials: 'include'
        })

        console.log(`📡 응답 상태: ${response.status} ${response.statusText}`)

        if (response.ok || response.status === 401) { // 401도 서버가 응답하는 것이므로 연결됨
          console.log(`✅ API 서버 연결 성공: ${url}`)
          return true
        }
      } catch (error) {
        console.warn(`❌ ${url} 연결 실패:`, error.message)

        // CORS 에러인지 확인
        if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
          console.error('🚨 CORS 에러 감지! Vue.js 프록시 설정이 필요할 수 있습니다.')
          console.log('해결방법: vue.config.js에 프록시 설정 추가')
        }

        // 네트워크 에러인지 확인
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          console.error('🌐 네트워크 에러 감지! 백엔드 서버가 실행 중인지 확인하세요.')
        }
      }
    }

    console.log('❌ 모든 API 엔드포인트 연결 실패')
    return false
  }

  // 인증 상태 확인 (authUtils 연동)
  isAuthenticated() {
    // authUtils에서 토큰 상태 확인
    const token = authUtils.getAccessToken()
    const userInfo = authUtils.getUserInfo()

    if (!token || !userInfo) {
      console.warn('❌ 토큰 또는 사용자 정보가 없습니다.')
      return false
    }

    try {
      // JWT 토큰 파싱 및 검증
      const parts = token.replace('Bearer ', '').split('.')
      if (parts.length !== 3) {
        console.warn('❌ 올바르지 않은 JWT 형식입니다.')
        return false
      }

      const payload = JSON.parse(atob(parts[1]))
      const currentTime = Date.now() / 1000

      console.log('🔍 토큰 정보 (authUtils):')
      console.log('- 사용자 ID:', userInfo.id)
      console.log('- 사용자 역할:', userInfo.role)
      console.log('- 발급시간:', new Date(payload.iat * 1000).toLocaleString())
      console.log('- 만료시간:', new Date(payload.exp * 1000).toLocaleString())
      console.log('- 현재시간:', new Date().toLocaleString())

      if (payload.exp <= currentTime) {
        console.warn('❌ 토큰이 만료되었습니다.')
        return false
      }

      console.log('✅ 토큰이 유효합니다.')
      return true
    } catch (error) {
      console.error('❌ 토큰 검증 실패:', error)
      return false
    }
  }

  // 토큰 상태 디버깅용 메서드 (authUtils 연동)
  debugTokenStatus() {
    console.group('🔍 토큰 상태 디버깅 (Pinia + authUtils)')

    const token = authUtils.getAccessToken()
    const userInfo = authUtils.getUserInfo()

    console.log('토큰 존재:', !!token)
    console.log('사용자 정보 존재:', !!userInfo)

    if (token) {
      console.log('토큰 길이:', token.length)
      console.log('토큰 시작:', token.substring(0, 50) + '...')
      console.log('Bearer 포함:', token.startsWith('Bearer'))
    }

    if (userInfo) {
      console.log('사용자 정보:', userInfo)
    }

    console.log('인증 상태:', this.isAuthenticated())

    // 저장소 상태 확인
    console.log('localStorage 키들:', Object.keys(localStorage))
    console.log('sessionStorage 키들:', Object.keys(sessionStorage))

    console.groupEnd()
  }
}

// 싱글톤 인스턴스 생성
export const chatApi = new ChatApi()

// 기본 내보내기
export default chatApi

// 채팅방 관련 유틸리티 함수들 (백엔드 DTO에 맞춤)
export const chatRoomUtils = {
  // 채팅방 타입 변환 (백엔드 -> 프론트엔드)
  convertRoomType(backendType) {
    const typeMap = {
      'ONE_TO_ONE': 'dm',
      'GROUP': 'group',
      'CHANNEL': 'channel'
    }
    return typeMap[backendType] || 'group'
  },

  // 채팅방 타입 변환 (프론트엔드 -> 백엔드)
  convertRoomTypeToBackend(frontendType) {
    const typeMap = {
      'dm': 'ONE_TO_ONE',
      'group': 'GROUP',
      'channel': 'CHANNEL'
    }
    return typeMap[frontendType] || 'GROUP'
  },

  // 백엔드 ChatRoomResponse.ChatRoomList를 프론트엔드 형식으로 변환
  transformChatRoomResponse(backendRoom) {
    return {
      id: backendRoom.roomId,
      name: backendRoom.title,
      type: chatRoomUtils.convertRoomType(backendRoom.roomType),
      participantCount: backendRoom.participantCount,
      lastMessage: backendRoom.lastMessage || '메시지가 없습니다',
      lastMessageSender: null,
      lastMessageType: backendRoom.lastMessageType ? backendRoom.lastMessageType.toLowerCase() : 'text',
      lastMessageAt: backendRoom.lastMessageAt ? new Date(backendRoom.lastMessageAt).getTime() : Date.now(),
      unreadCount: backendRoom.unreadCount || 0,
      status: backendRoom.status === 'ACTIVE' ? 'online' : 'offline',
      avatar: backendRoom.thumbnailUrl
    }
  },

  // 채팅방 생성 요청 데이터 검증 (백엔드 정책에 맞춘)
  validateCreateRoomData(roomData) {
    const errors = []

    if (!roomData.title || roomData.title.trim().length === 0) {
      errors.push('채팅방 제목은 필수입니다.')
    }

    if (roomData.title && roomData.title.length > 50) {
      errors.push('채팅방 제목은 50자 이하여야 합니다.')
    }

    if (!['GROUP', 'ONE_TO_ONE', 'CHANNEL'].includes(roomData.roomType)) {
      errors.push('올바른 채팅방 타입을 선택해주세요.')
    }

    if (roomData.roomType === 'ONE_TO_ONE' && (!roomData.participantUserIds || roomData.participantUserIds.length !== 1)) {
      errors.push('1:1 채팅방은 상대방 1명을 선택해야 합니다.')
    }

    if (roomData.roomType === 'GROUP' && roomData.maxParticipants && roomData.maxParticipants < 2) {
      errors.push('그룹 채팅방은 최소 2명 이상이어야 합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  },

  // 백엔드 ChatRoomSearchCondition 검증
  validateSearchCondition(searchCondition) {
    const validRoomTypes = ['GROUP', 'ONE_TO_ONE', 'CHANNEL']
    const validStatuses = ['ACTIVE', 'INACTIVE', 'DELETED']

    if (searchCondition.roomType && !validRoomTypes.includes(searchCondition.roomType)) {
      searchCondition.roomType = null
    }

    if (searchCondition.status && !validStatuses.includes(searchCondition.status)) {
      searchCondition.status = 'ACTIVE'
    }

    if (searchCondition.keyword && searchCondition.keyword.length > 100) {
      searchCondition.keyword = searchCondition.keyword.substring(0, 100)
    }

    return searchCondition
  },

  // 채팅방 목록 정렬
  sortChatRooms(rooms, sortBy = 'lastMessage') {
    return [...rooms].sort((a, b) => {
      switch (sortBy) {
        case 'lastMessage':
          return new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        case 'name':
          return a.name.localeCompare(b.name, 'ko-KR')
        case 'unreadCount':
          return b.unreadCount - a.unreadCount
        case 'participantCount':
          return b.participantCount - a.participantCount
        default:
          return new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      }
    })
  },

  // 채팅방 필터링
  filterChatRooms(rooms, filters) {
    return rooms.filter(room => {
      // 타입 필터
      if (filters.type && room.type !== filters.type) {
        return false
      }

      // 읽지 않은 메시지 필터
      if (filters.unreadOnly && room.unreadCount === 0) {
        return false
      }

      // 검색 키워드 필터
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        return room.name.toLowerCase().includes(keyword) ||
            (room.lastMessage && room.lastMessage.toLowerCase().includes(keyword))
      }

      return true
    })
  }
}