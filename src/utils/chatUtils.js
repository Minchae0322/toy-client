// utils/chatUtils.js
// 채팅 관련 유틸리티 함수들


/**
 * 메시지 타입 상수
 */
export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  SYSTEM: 'SYSTEM',
  NOTIFICATION: 'NOTIFICATION'
}

/**
 * 채팅방 타입 상수
 */
export const ROOM_TYPES = {
  NORMAL: 'NORMAL',
  CHANNEL: 'CHANNEL',
  CUSTOMER_SUPPORT: 'CUSTOMER_SUPPORT'
}

/**
 * 메시지 상태 상수
 */
export const MESSAGE_STATUS = {
  SENDING: 'SENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED'
}

/**
 * 연결 상태 상수
 */
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting'
}

// ==================== 메시지 관련 유틸리티 ====================

/**
 * 메시지 ID 생성
 */
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 임시 메시지 생성
 */
export const createTempMessage = (content, type = MESSAGE_TYPES.TEXT, roomId) => {
  const currentUser = tokenUtils.getCurrentUser()

  return {
    messageId: generateMessageId(),
    roomId: roomId,
    senderId: currentUser?.id || 1,
    senderName: currentUser?.username || '나',
    content: content,
    type: type,
    createdAt: new Date().toISOString(),
    status: MESSAGE_STATUS.SENDING,
    isRead: false,
    replyTo: null,
    metadata: null
  }
}

/**
 * 백엔드 메시지 응답을 프론트엔드 형식으로 변환
 */
export const transformMessageResponse = (backendMessage) => {
  return {
    messageId: backendMessage.messageId,
    roomId: backendMessage.roomId,
    senderId: backendMessage.senderId,
    senderName: backendMessage.senderName || `사용자${backendMessage.senderId}`,
    content: backendMessage.content,
    type: backendMessage.messageType || backendMessage.type || MESSAGE_TYPES.TEXT,
    createdAt: backendMessage.sentAt || backendMessage.createdAt,
    status: MESSAGE_STATUS.SENT,
    isRead: backendMessage.isRead || false,
    replyTo: backendMessage.replyTo,
    metadata: backendMessage.metadata
  }
}

/**
 * 메시지 유효성 검증
 */
export const validateMessage = (message) => {
  const errors = []

  if (!message.content || message.content.trim().length === 0) {
    errors.push('메시지 내용은 필수입니다.')
  }

  if (message.content && message.content.length > 1000) {
    errors.push('메시지는 1000자 이하여야 합니다.')
  }

  if (!Object.values(MESSAGE_TYPES).includes(message.type)) {
    errors.push('올바른 메시지 타입을 선택해주세요.')
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

/**
 * 메시지 중복 체크
 */
export const isDuplicateMessage = (newMessage, existingMessages) => {
  return existingMessages.some(existing =>
      existing.messageId === newMessage.messageId ||
      (existing.content === newMessage.content &&
          existing.senderId === newMessage.senderId &&
          Math.abs(new Date(existing.createdAt) - new Date(newMessage.createdAt)) < 1000)
  )
}

/**
 * 메시지 시간 포맷팅
 */
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return '방금'
  } else if (diffMins < 60) {
    return `${diffMins}분 전`
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

/**
 * 메시지 날짜 그룹핑
 */
export const groupMessagesByDate = (messages) => {
  const groups = {}

  messages.forEach(message => {
    const date = new Date(message.createdAt).toLocaleDateString('ko-KR')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
  })

  return groups
}

/**
 * 메시지 검색 필터링
 */
export const filterMessages = (messages, searchKeyword) => {
  if (!searchKeyword) return messages

  const keyword = searchKeyword.toLowerCase()
  return messages.filter(message =>
      message.content.toLowerCase().includes(keyword) ||
      message.senderName.toLowerCase().includes(keyword)
  )
}

// ==================== 채팅방 관련 유틸리티 ====================

/**
 * 채팅방 ID 생성
 */
export const generateRoomId = () => {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 백엔드 채팅방 응답을 프론트엔드 형식으로 변환
 */
export const transformChatRoomResponse = (backendRoom) => {
  // roomType이 enum 객체인 경우 처리
  let roomTypeValue = 'NORMAL';
  if (backendRoom.roomType) {
    if (typeof backendRoom.roomType === 'string') {
      roomTypeValue = backendRoom.roomType;
    } else if (backendRoom.roomType.name) {
      roomTypeValue = backendRoom.roomType.name;
    } else if (backendRoom.roomType.toString) {
      roomTypeValue = backendRoom.roomType.toString();
    }
  }

  return {
    id: backendRoom.roomId,
    name: backendRoom.title,
    type: convertRoomType(roomTypeValue),
    participantCount: backendRoom.participantCount || 2,
    lastMessage: backendRoom.lastMessage || '메시지가 없습니다',
    lastMessageSender: null,
    lastMessageType: backendRoom.lastMessageType ? backendRoom.lastMessageType.toLowerCase() : 'text',
    lastMessageAt: backendRoom.lastMessageAt ? new Date(backendRoom.lastMessageAt).getTime() : Date.now(),
    unreadCount: backendRoom.unreadCount || 0,
    status: backendRoom.status || 'ACTIVE',
    avatar: backendRoom.thumbnailUrl,
    description: backendRoom.description,
    createdAt: backendRoom.createdAt
  }
}

/**
 * 백엔드 채팅방 타입을 프론트엔드 타입으로 변환
 */
export const convertRoomType = (backendType) => {
  const typeMap = {
    'NORMAL': ROOM_TYPES.NORMAL,
    'CHANNEL': ROOM_TYPES.CHANNEL,
    'CUSTOMER_SUPPORT': ROOM_TYPES.CUSTOMER_SUPPORT
  }
  return typeMap[backendType] || ROOM_TYPES.NORMAL
}

/**
 * 프론트엔드 채팅방 타입을 백엔드 타입으로 변환
 */
export const convertRoomTypeToBackend = (frontendType) => {
  const typeMap = {
    [ROOM_TYPES.NORMAL]: 'NORMAL',
    [ROOM_TYPES.CHANNEL]: 'CHANNEL',
    [ROOM_TYPES.CUSTOMER_SUPPORT]: 'CUSTOMER_SUPPORT'
  }
  return typeMap[frontendType] || 'NORMAL'
}

/**
 * 채팅방 생성 데이터 검증
 */
export const validateCreateRoomData = (roomData) => {
  const errors = []

  if (!roomData.title || roomData.title.trim().length === 0) {
    errors.push('채팅방 제목은 필수입니다.')
  }

  if (roomData.title && roomData.title.length > 50) {
    errors.push('채팅방 제목은 50자 이하여야 합니다.')
  }

  if (!Object.values(ROOM_TYPES).includes(roomData.roomType)) {
    errors.push('올바른 채팅방 타입을 선택해주세요.')
  }

  if (roomData.roomType === ROOM_TYPES.NORMAL && (!roomData.participantUserIds || roomData.participantUserIds.length !== 1)) {
    errors.push('1:1 채팅방은 상대방 1명을 선택해야 합니다.')
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

/**
 * 채팅방 검색 조건 검증
 */
export const validateSearchCondition = (searchCondition) => {
  const validRoomTypes = Object.values(ROOM_TYPES)
  const validStatuses = ['ACTIVE', 'ARCHIVED', 'BLOCKED', 'DELETED']

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
}

/**
 * 채팅방 목록 정렬
 */
export const sortChatRooms = (rooms, sortBy = 'lastMessage') => {
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
}

/**
 * 채팅방 필터링
 */
export const filterChatRooms = (rooms, filters) => {
  return rooms.filter(room => {
    if (filters.type && room.type !== filters.type) {
      return false
    }

    if (filters.unreadOnly && room.unreadCount === 0) {
      return false
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      return room.name.toLowerCase().includes(keyword) ||
          (room.lastMessage && room.lastMessage.toLowerCase().includes(keyword))
    }

    return true
  })
}

/**
 * 채팅방 제목 생성 (상품 기반)
 */
export const generateChatRoomTitle = (productInfo) => {
  if (productInfo && productInfo.name) {
    return `${productInfo.name} 관련 채팅`
  }
  return '1:1 채팅'
}

// ==================== 연결 상태 관련 유틸리티 ====================

/**
 * 연결 상태 생성
 */
export const createConnectionState = (status = CONNECTION_STATUS.DISCONNECTED) => {
  return {
    connected: status === CONNECTION_STATUS.CONNECTED,
    connecting: status === CONNECTION_STATUS.CONNECTING || status === CONNECTION_STATUS.RECONNECTING,
    status: status,
    error: null,
    lastConnectedAt: null,
    reconnectAttempts: 0
  }
}

/**
 * 연결 상태 업데이트
 */
export const updateConnectionState = (currentState, newStatus, error = null) => {
  const newState = { ...currentState }

  newState.status = newStatus
  newState.connected = newStatus === CONNECTION_STATUS.CONNECTED
  newState.connecting = newStatus === CONNECTION_STATUS.CONNECTING || newStatus === CONNECTION_STATUS.RECONNECTING
  newState.error = error

  if (newStatus === CONNECTION_STATUS.CONNECTED) {
    newState.lastConnectedAt = new Date().toISOString()
    newState.reconnectAttempts = 0
  } else if (newStatus === CONNECTION_STATUS.RECONNECTING) {
    newState.reconnectAttempts = (newState.reconnectAttempts || 0) + 1
  }

  return newState
}

/**
 * 재연결 가능 여부 체크
 */
export const canReconnect = (connectionState, maxAttempts = 5) => {
  return connectionState.reconnectAttempts < maxAttempts
}

// ==================== 파일 관련 유틸리티 ====================

/**
 * 파일 크기 포맷팅
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 파일 타입 검증
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf']
  } = options

  const errors = []

  if (file.size > maxSize) {
    errors.push(`파일 크기는 ${formatFileSize(maxSize)} 이하여야 합니다.`)
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push('지원하지 않는 파일 형식입니다.')
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

/**
 * 이미지 파일 여부 체크
 */
export const isImageFile = (file) => {
  return file.type.startsWith('image/')
}

// ==================== 사용자 관련 유틸리티 ====================

/**
 * 현재 사용자 ID 가져오기
 */
export const getCurrentUserId = () => {
  const user = tokenUtils.getCurrentUser()
  return user ? user.id : null
}

/**
 * 메시지가 내 메시지인지 체크
 */
export const isMyMessage = (message) => {
  const currentUserId = getCurrentUserId()
  return message.senderId === currentUserId
}

/**
 * 사용자 이름 포맷팅
 */
export const formatUserName = (userName, maxLength = 10) => {
  if (!userName) return '익명'

  if (userName.length > maxLength) {
    return userName.substring(0, maxLength) + '...'
  }

  return userName
}

// ==================== 디바이스 정보 유틸리티 ====================

/**
 * 디바이스 정보 가져오기
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent

  let deviceType = 'Desktop'
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = 'Mobile'
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'Tablet'
  }

  let browser = { name: 'Unknown' }
  if (userAgent.includes('Chrome')) {
    browser.name = 'Chrome'
  } else if (userAgent.includes('Firefox')) {
    browser.name = 'Firefox'
  } else if (userAgent.includes('Safari')) {
    browser.name = 'Safari'
  } else if (userAgent.includes('Edge')) {
    browser.name = 'Edge'
  }

  return {
    deviceType,
    browser,
    deviceName: `${browser.name} on ${deviceType}`,
    userAgent: userAgent
  }
}

// ==================== 디버깅 유틸리티 ====================

/**
 * 채팅 디버그 정보 출력
 */
export const debugChatInfo = (context, data) => {
  if (!import.meta.env.DEV) return

  console.group(`🔍 [ChatDebug] ${context}`)
  console.log('현재 시간:', new Date().toISOString())
  console.log('사용자 ID:', getCurrentUserId())
  console.log('디바이스 정보:', getDeviceInfo())
  console.log('데이터:', data)
  console.groupEnd()
}

/**
 * 메시지 로그 출력
 */
export const logMessage = (action, message, extra = null) => {
  if (!import.meta.env.DEV) return

  console.log(`💬 [Message] ${action}:`, {
    messageId: message.messageId,
    roomId: message.roomId,
    senderId: message.senderId,
    content: message.content?.substring(0, 50) + (message.content?.length > 50 ? '...' : ''),
    type: message.type,
    status: message.status,
    createdAt: message.createdAt,
    extra: extra
  })
}

// ==================== 에러 처리 유틸리티 ====================

/**
 * 채팅 에러 메시지 생성
 */
export const getChatErrorMessage = (error) => {
  if (error.response?.status === 401) {
    return '로그인이 필요합니다.'
  }

  if (error.response?.status === 403) {
    return '채팅 권한이 없습니다.'
  }

  if (error.response?.status === 404) {
    return '채팅방을 찾을 수 없습니다.'
  }

  if (error.response?.status === 409) {
    return '이미 존재하는 채팅방입니다.'
  }

  if (error.message?.includes('네트워크') || error.message?.includes('Network')) {
    return '네트워크 연결을 확인해주세요.'
  }

  if (error.message?.includes('WebSocket')) {
    return '실시간 연결에 실패했습니다.'
  }

  return error.message || '알 수 없는 오류가 발생했습니다.'
}

/**
 * 재시도 가능한 에러인지 체크
 */
export const isRetryableError = (error) => {
  const retryableStatuses = [408, 429, 500, 502, 503, 504]
  return retryableStatuses.includes(error.response?.status) ||
      error.message?.includes('네트워크') ||
      error.message?.includes('Network')
}

// ==================== 기본 Export ====================

export default {
  // 상수
  MESSAGE_TYPES,
  ROOM_TYPES,
  MESSAGE_STATUS,
  CONNECTION_STATUS,

  // 메시지 관련
  generateMessageId,
  createTempMessage,
  transformMessageResponse,
  validateMessage,
  isDuplicateMessage,
  formatMessageTime,
  groupMessagesByDate,
  filterMessages,

  // 채팅방 관련
  generateRoomId,
  transformChatRoomResponse,
  convertRoomType,
  convertRoomTypeToBackend,
  validateCreateRoomData,
  validateSearchCondition,
  sortChatRooms,
  filterChatRooms,
  generateChatRoomTitle,

  // 연결 상태 관련
  createConnectionState,
  updateConnectionState,
  canReconnect,

  // 파일 관련
  formatFileSize,
  validateFile,
  isImageFile,

  // 사용자 관련
  getCurrentUserId,
  isMyMessage,
  formatUserName,

  // 디바이스 정보
  getDeviceInfo,

  // 디버깅
  debugChatInfo,
  logMessage,

  // 에러 처리
  getChatErrorMessage,
  isRetryableError
}