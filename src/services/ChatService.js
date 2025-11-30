// services/ChatService.js
// 채팅 관련 API 서비스 (Fetch API 기반)

import { BaseApiService } from './BaseApiService.js'
import { ENV, getServiceUrl } from '@/config/env.js'
import * as authUtils from '@/utils/auth.js'

/**
 * 채팅 서비스
 * Chat Server와의 통신을 담당
 */
class ChatService extends BaseApiService {
  constructor() {
    const baseURL = `${getServiceUrl('CHAT')}/api`

    super(baseURL, 'CHAT')

    // WebSocket URL 설정
    this.wsURL = ENV.WS_URL

    console.log(`💬 [CHAT] Chat Server URL: ${this.baseURL}`)
    console.log(`🔌 [CHAT] WebSocket URL: ${this.wsURL}`)
    console.log(`🌍 [CHAT] Environment: ${ENV.MODE}`)
  }

  // ==================== WebSocket URL Getter ====================

  getWebSocketUrl() {
    return this.wsURL
  }

  // ==================== 채팅방 API ====================

  /**
   * 채팅 시작 (피드 상세에서 채팅하기 클릭시)
   */
  async startChat(chatData) {
    console.log(`💬 [CHAT] 채팅 시작:`, chatData)

    const requestData = {
      chatContext: chatData.chatContext || 'PRODUCT_TRADE',
      chatContextId: chatData.chatContextId,
      creatorId: chatData.creatorId,
      participantIds: chatData.participantIds,
      deviceId: chatData.deviceId || authUtils.getDeviceId()
    }

    return await this.post('/v1/chat/rooms/chat', requestData)
  }

  /**
   * 채팅방 목록 조회
   */
  async getChatRooms(searchCondition = {}) {
    const validatedCondition = this.validateSearchCondition(searchCondition)
    console.log(`📋 [CHAT] 채팅방 목록 조회:`, validatedCondition)
    return await this.get('/v1/chat/rooms', validatedCondition)
  }

  /**
   * 채팅방 생성
   */
  async createChatRoom(roomData) {
    const validation = this.validateCreateRoomData(roomData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const requestData = {
      title: roomData.title,
      description: roomData.description || null,
      roomType: roomData.roomType || 'NORMAL',
      participantUserIds: roomData.participantUserIds || [],
      isPrivate: roomData.isPrivate || false,
      maxParticipants: roomData.maxParticipants || null,
      thumbnailUrl: roomData.thumbnailUrl || null
    }

    console.log(`➕ [CHAT] 채팅방 생성:`, requestData)
    return await this.post('/v1/chat/rooms', requestData)
  }

  /**
   * 채팅방 상세 조회
   */
  async getChatRoomDetail(roomId) {
    if (!roomId) {
      throw new Error('채팅방 ID가 필요합니다.')
    }

    console.log(`🔍 [CHAT] 채팅방 상세 조회: roomId=${roomId}`)
    return await this.get(`/v1/chat/rooms/${roomId}`)
  }

  /**
   * 채팅방 입장
   */
  async joinChatRoom(roomId) {
    const requestData = {
      deviceId: authUtils.getDeviceId()
    }

    console.log(`🚪 [CHAT] 채팅방 입장: roomId=${roomId}`)
    return await this.post(`/v1/chat/rooms/${roomId}/join`, requestData)
  }

  /**
   * 채팅방 나가기
   */
  async leaveChatRoom(roomId) {
    const requestData = {
      deviceId: authUtils.getDeviceId()
    }

    console.log(`🚪 [CHAT] 채팅방 나가기: roomId=${roomId}`)
    return await this.post(`/v1/chat/rooms/${roomId}/leave`, requestData)
  }

  /**
   * 채팅방 삭제
   */
  async deleteChatRoom(roomId) {
    console.log(`🗑️ [CHAT] 채팅방 삭제: roomId=${roomId}`)
    return await this.delete(`/v1/chat/rooms/${roomId}`)
  }

  /**
   * 채팅방 설정 변경
   */
  async updateChatRoomSettings(roomId, settings) {
    console.log(`⚙️ [CHAT] 채팅방 설정 변경: roomId=${roomId}`, settings)
    return await this.put(`/v1/chat/rooms/${roomId}/settings`, settings)
  }

  // ==================== 메시지 API ====================

  /**
   * ✅ 메시지 목록 조회 (커서 기반 페이징) - 경로 수정
   * 백엔드: GET /{roomId}/messages
   */
  async getChatMessages(roomId, cursorPageRequest = {}) {
    if (!roomId) {
      throw new Error('채팅방 ID가 필요합니다.')
    }

    const params = {
      size: cursorPageRequest.size || 20
    }

    if (cursorPageRequest.lastMessageId) {
      params.lastMessageId = cursorPageRequest.lastMessageId
    }

    console.log(`📨 [CHAT] 메시지 목록 조회: roomId=${roomId}`, params)

    // ✅ 백엔드 API 경로에 맞게 수정: /v1/chat/rooms/{roomId}/messages
    return await this.get(`/chat/${roomId}/messages`, params)
  }

  /**
   * 메시지 전송 (HTTP) - 주로 파일 메시지용
   * 일반 텍스트 메시지는 WebSocket 사용 권장
   */
  async sendMessage(roomId, messageData) {
    if (!roomId) {
      throw new Error('채팅방 ID가 필요합니다.')
    }

    const requestData = {
      content: messageData.content,
      type: messageData.type || 'TEXT',
      replyToMessageId: messageData.replyToMessageId || null,
      metadata: messageData.metadata || null
    }

    console.log(`📤 [CHAT] 메시지 전송 (HTTP): roomId=${roomId}`, requestData)
    return await this.post(`/v1/chat/rooms/${roomId}/messages`, requestData)
  }

  /**
   * 메시지 수정
   */
  async updateMessage(messageId, content) {
    console.log(`✏️ [CHAT] 메시지 수정: messageId=${messageId}`)
    return await this.put(`/v1/chat/messages/${messageId}`, { content })
  }

  /**
   * 메시지 삭제
   */
  async deleteMessage(messageId) {
    console.log(`🗑️ [CHAT] 메시지 삭제: messageId=${messageId}`)
    return await this.delete(`/v1/chat/messages/${messageId}`)
  }

  // ==================== 파일 업로드 ====================

  async uploadFile(roomId, file, options = {}) {
    if (!roomId || !file) {
      throw new Error('채팅방 ID와 파일이 필요합니다.')
    }

    const formData = new FormData()
    formData.append('file', file)

    if (options.messageType) {
      formData.append('messageType', options.messageType)
    }

    if (options.description) {
      formData.append('description', options.description)
    }

    console.log(`📎 [CHAT] 파일 업로드: roomId=${roomId}, file=${file.name}`)
    return await super.uploadFile(`/v1/chat/rooms/${roomId}/upload`, formData)
  }

  async uploadImage(roomId, imageFile, description = '') {
    console.log(`🖼️ [CHAT] 이미지 업로드: roomId=${roomId}, file=${imageFile.name}`)
    return await this.uploadFile(roomId, imageFile, {
      messageType: 'IMAGE',
      description
    })
  }

  // ==================== 읽음 처리 및 알림 ====================

  async markAsRead(roomId, messageId = null) {
    const requestData = messageId ? { messageId } : {}
    console.log(`✅ [CHAT] 메시지 읽음 처리: roomId=${roomId}`, requestData)
    return await this.post(`/v1/chat/rooms/${roomId}/read`, requestData)
  }

  async getUnreadCount(roomId = null) {
    const url = roomId
        ? `/v1/chat/rooms/${roomId}/unread-count`
        : '/v1/chat/unread-count'

    console.log(`🔔 [CHAT] 읽지 않은 메시지 개수 조회: ${url}`)
    return await this.get(url)
  }

  async getTotalUnreadCount() {
    console.log(`🔔 [CHAT] 전체 읽지 않은 메시지 개수 조회`)
    return await this.get('/v1/chat/unread-count')
  }

  // ==================== 채팅방 멤버 관리 ====================

  async getChatRoomMembers(roomId, params = {}) {
    console.log(`👥 [CHAT] 채팅방 멤버 목록 조회: roomId=${roomId}`)
    return await this.get(`/v1/chat/rooms/${roomId}/members`, params)
  }

  async inviteMembers(roomId, userIds) {
    console.log(`➕ [CHAT] 멤버 초대: roomId=${roomId}, userIds=${userIds}`)
    return await this.post(`/v1/chat/rooms/${roomId}/members`, {
      userIds: Array.isArray(userIds) ? userIds : [userIds]
    })
  }

  async removeMember(roomId, userId) {
    console.log(`➖ [CHAT] 멤버 제거: roomId=${roomId}, userId=${userId}`)
    return await this.delete(`/v1/chat/rooms/${roomId}/members/${userId}`)
  }

  async updateMemberRole(roomId, userId, role) {
    console.log(`👑 [CHAT] 멤버 역할 변경: roomId=${roomId}, userId=${userId}, role=${role}`)
    return await this.put(`/v1/chat/rooms/${roomId}/members/${userId}/role`, { role })
  }

  // ==================== 검색 및 필터링 ====================

  async searchChatRooms(keyword, filters = {}) {
    const params = { keyword, ...filters }
    console.log(`🔍 [CHAT] 채팅방 검색:`, params)
    return await this.get('/v1/chat/rooms/search', params)
  }

  async searchMessages(roomId, keyword, params = {}) {
    console.log(`🔍 [CHAT] 메시지 검색: roomId=${roomId}, keyword=${keyword}`)
    return await this.get(`/v1/chat/rooms/${roomId}/messages/search`, {
      keyword,
      ...params
    })
  }

  // ==================== 샘플 데이터 (개발용) ====================

  getSampleChatRooms() {
    console.log(`📦 [CHAT] 샘플 채팅방 데이터 반환`)
    return {
      success: true,
      data: [
        {
          roomId: 'sample-room-1',
          title: '맥북 에어 M2 거래',
          roomType: 'NORMAL',
          participantCount: 2,
          lastMessage: '안녕하세요, 맥북 상태가 어떤가요?',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          unreadCount: 2,
          status: 'ACTIVE',
          thumbnailUrl: null,
          description: null,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        },
        {
          roomId: 'sample-room-2',
          title: '아이폰 15 Pro 문의',
          roomType: 'NORMAL',
          participantCount: 2,
          lastMessage: '네, 거래 가능합니다!',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          unreadCount: 0,
          status: 'ACTIVE',
          thumbnailUrl: null,
          description: null,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
        }
      ]
    }
  }

  getSampleMessages(roomId) {
    console.log(`📦 [CHAT] 샘플 메시지 데이터 반환: roomId=${roomId}`)
    return {
      success: true,
      data: [
        {
          messageId: `msg-${roomId}-1`,
          roomId: roomId,
          senderId: 2,
          senderName: '상대방',
          content: '안녕하세요!',
          messageType: 'TEXT',
          sentAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          isRead: true
        },
        {
          messageId: `msg-${roomId}-2`,
          roomId: roomId,
          senderId: 1,
          senderName: '나',
          content: '네, 안녕하세요. 잘 부탁드립니다.',
          messageType: 'TEXT',
          sentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          isRead: true
        }
      ]
    }
  }

  // ==================== 유틸리티 메서드 ====================

  validateCreateRoomData(roomData) {
    const errors = []

    if (!roomData.title || roomData.title.trim().length === 0) {
      errors.push('채팅방 제목은 필수입니다.')
    }

    if (roomData.title && roomData.title.length > 50) {
      errors.push('채팅방 제목은 50자 이하여야 합니다.')
    }

    if (!['NORMAL', 'CHANNEL', 'CUSTOMER_SUPPORT'].includes(roomData.roomType)) {
      errors.push('올바른 채팅방 타입을 선택해주세요.')
    }

    if (roomData.roomType === 'NORMAL' && (!roomData.participantUserIds || roomData.participantUserIds.length !== 1)) {
      errors.push('1:1 채팅방은 상대방 1명을 선택해야 합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  validateSearchCondition(searchCondition) {
    const validRoomTypes = ['NORMAL', 'CHANNEL', 'CUSTOMER_SUPPORT']
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

  // ==================== 데이터 변환 유틸리티 ====================

  /**
   * ✅ 백엔드 채팅방 응답을 프론트엔드 형식으로 변환
   */
  transformChatRoomResponse(backendRoom) {
    let roomTypeValue = 'NORMAL'
    if (backendRoom.roomType) {
      if (typeof backendRoom.roomType === 'string') {
        roomTypeValue = backendRoom.roomType
      } else if (backendRoom.roomType.name) {
        roomTypeValue = backendRoom.roomType.name
      } else if (backendRoom.roomType.toString) {
        roomTypeValue = backendRoom.roomType.toString()
      }
    }

    return {
      id: backendRoom.roomId,
      name: backendRoom.title,
      type: roomTypeValue,
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
   * ✅ 백엔드 메시지 응답을 프론트엔드 형식으로 변환
   */
  transformMessageResponse(backendMessage) {
    return {
      messageId: backendMessage.messageId || backendMessage.id,
      roomId: backendMessage.roomId,
      senderId: backendMessage.senderId,
      senderName: backendMessage.senderName || `사용자${backendMessage.senderId}`,
      content: backendMessage.content,
      type: backendMessage.messageType || backendMessage.type || 'TEXT',
      createdAt: backendMessage.sentAt || backendMessage.createdAt || new Date().toISOString(),
      status: 'SENT',
      isRead: backendMessage.isRead || false,
      replyTo: backendMessage.replyTo,
      metadata: backendMessage.metadata
    }
  }

  /**
   * 채팅방 목록 정렬
   */
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
  }

  /**
   * 채팅방 필터링
   */
  filterChatRooms(rooms, filters) {
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

  // ==================== 디버깅 ====================

  debugChatStatus() {
    console.group('🔍 [CHAT] 채팅 서비스 상태')
    console.log('Environment:', ENV.MODE)
    console.log('Base URL:', this.baseURL)
    console.log('WebSocket URL:', this.wsURL)
    console.log('메시지 조회 경로: /v1/chat/rooms/{roomId}/messages')
    this.debugStatus()
    console.groupEnd()
  }
}

// ==================== 싱글톤 인스턴스 ====================

export const chatService = new ChatService()
export const chatApi = chatService
export default chatService

// ==================== Vue Composables ====================

export function useChat() {
  const service = new ChatService()

  const getRooms = async (searchCondition = {}) => {
    try {
      const response = await service.getChatRooms(searchCondition)
      return {
        success: true,
        data: response.data || [],
        message: response.message
      }
    } catch (error) {
      console.error('❌ [CHAT] 채팅방 목록 조회 실패:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  const createRoom = async (roomData) => {
    try {
      const response = await service.createChatRoom(roomData)
      return {
        success: true,
        data: response.data,
        message: response.message || '채팅방이 생성되었습니다'
      }
    } catch (error) {
      console.error('❌ [CHAT] 채팅방 생성 실패:', error)
      return { success: false, error: error.message }
    }
  }

  const sendMessage = async (roomId, messageData) => {
    try {
      const response = await service.sendMessage(roomId, messageData)
      return { success: true, data: response.data, message: response.message }
    } catch (error) {
      console.error('❌ [CHAT] 메시지 전송 실패:', error)
      return { success: false, error: error.message }
    }
  }

  const uploadFile = async (roomId, file, options = {}) => {
    try {
      const response = await service.uploadFile(roomId, file, options)
      return { success: true, data: response.data, message: response.message }
    } catch (error) {
      console.error('❌ [CHAT] 파일 업로드 실패:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    getRooms,
    createRoom,
    getRoomDetail: (roomId) => service.getChatRoomDetail(roomId),
    joinRoom: (roomId) => service.joinChatRoom(roomId),
    leaveRoom: (roomId) => service.leaveChatRoom(roomId),
    getMessages: (roomId, params) => service.getChatMessages(roomId, params),
    sendMessage,
    uploadFile,
    uploadImage: (roomId, imageFile, description) => service.uploadImage(roomId, imageFile, description),
    markAsRead: (roomId, messageId) => service.markAsRead(roomId, messageId),
    getUnreadCount: (roomId) => service.getUnreadCount(roomId),
    getWebSocketUrl: () => service.getWebSocketUrl(),
    transformRoom: (room) => service.transformChatRoomResponse(room),
    transformMessage: (message) => service.transformMessageResponse(message),
    sortRooms: (rooms, sortBy) => service.sortChatRooms(rooms, sortBy),
    filterRooms: (rooms, filters) => service.filterChatRooms(rooms, filters),
    testConnection: () => service.testConnection(),
    debugStatus: () => service.debugChatStatus()
  }
}