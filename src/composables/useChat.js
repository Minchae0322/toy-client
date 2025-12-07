// composables/useChat.js
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { webSocketService } from '@/services/websocketService'
import { chatService } from '@/services/ChatService'
import { useRouter } from 'vue-router'

export function useChat(roomId = null) {
  const router = useRouter()

  // 상태 관리
  const messages = ref([])
  const currentRoom = ref(roomId)
  const typing = ref(false)
  const onlineUsers = ref([])
  const messageInput = ref('')
  const isLoading = ref(false)
  const error = ref(null)

  // WebSocket 연결 상태
  const connectionState = webSocketService.getConnectionState()

  // 메시지 통계
  const messageStats = computed(() => ({
    total: messages.value.length,
    unread: messages.value.filter(m => !m.read && m.senderId !== getCurrentUserId()).length,
    today: messages.value.filter(m => isToday(m.timestamp)).length
  }))

  // 현재 사용자 ID
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return null

      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId || payload.sub
    } catch {
      return null
    }
  }

  // 오늘 날짜 확인
  const isToday = (timestamp) => {
    const today = new Date().toDateString()
    const messageDate = new Date(timestamp).toDateString()
    return today === messageDate
  }

  /**
   * WebSocket 연결 초기화
   */
  const initializeConnection = async () => {
    try {
      isLoading.value = true
      error.value = null

      if (!webSocketService.isConnected()) {
        await webSocketService.connect()
      }

      // 메시지 핸들러 등록
      setupMessageHandlers()

      console.log('✅ 채팅 서비스 초기화 완료')

    } catch (err) {
      error.value = err.message
      console.error('❌ 채팅 서비스 초기화 실패:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 메시지 핸들러 설정
   */
  const setupMessageHandlers = () => {
    // 채팅 메시지 핸들러
    webSocketService.onMessage('chat-message', handleChatMessage)

    // 시스템 알림 핸들러
    webSocketService.onMessage('system-notification', handleSystemNotification)

    // 접속 상태 업데이트 핸들러
    webSocketService.onMessage('presence-update', handlePresenceUpdate)

    // 개인 메시지 핸들러
    webSocketService.onMessage('private-message', handlePrivateMessage)
  }

  /**
   * 채팅 메시지 처리
   */
  const handleChatMessage = (message) => {
    console.log('💬 채팅 메시지 수신:', message)

    // 현재 채팅방의 메시지인 경우만 추가
    if (message.roomId === currentRoom.value) {
      addMessage({
        id: message.id || generateMessageId(),
        roomId: message.roomId,
        senderId: message.senderId,
        senderName: message.senderName || `사용자${message.senderId}`,
        content: message.content,
        type: message.type || 'TEXT',
        timestamp: message.timestamp || Date.now(),
        read: false,
        metadata: message.metadata
      })
    }

    // 브라우저 알림 표시 (페이지가 비활성 상태일 때)
    if (document.hidden && message.senderId !== getCurrentUserId()) {
      showBrowserNotification(message)
    }
  }

  /**
   * 시스템 알림 처리
   */
  const handleSystemNotification = (notification) => {
    console.log('🔔 시스템 알림:', notification)

    if (notification.type === 'USER_JOIN') {
      addSystemMessage(`${notification.userName}님이 입장했습니다.`)
    } else if (notification.type === 'USER_LEAVE') {
      addSystemMessage(`${notification.userName}님이 퇴장했습니다.`)
    }
  }

  /**
   * 접속 상태 업데이트 처리
   */
  const handlePresenceUpdate = (presence) => {
    console.log('👥 접속 상태 업데이트:', presence)
    onlineUsers.value = presence.onlineUsers || []
  }

  /**
   * 개인 메시지 처리
   */
  const handlePrivateMessage = (message) => {
    console.log('📨 개인 메시지:', message)

    // 개인 메시지는 별도 처리 (알림, 팝업 등)
    if (message.type === 'TYPING_START') {
      typing.value = true
    } else if (message.type === 'TYPING_END') {
      typing.value = false
    }
  }

  /**
   * 메시지 추가
   */
  const addMessage = (message) => {
    messages.value.push(message)

    // 메시지 정렬 (타임스탬프 기준)
    messages.value.sort((a, b) => a.timestamp - b.timestamp)

    // 스크롤 자동 이동
    nextTick(() => {
      scrollToBottom()
    })
  }

  /**
   * 시스템 메시지 추가
   */
  const addSystemMessage = (content) => {
    addMessage({
      id: generateMessageId(),
      roomId: currentRoom.value,
      senderId: 'system',
      senderName: '시스템',
      content: content,
      type: 'SYSTEM',
      timestamp: Date.now(),
      read: true
    })
  }

  /**
   * 채팅방 입장
   */
  const joinRoom = async (roomId) => {
    if (!roomId) {
      throw new Error('채팅방 ID가 필요합니다')
    }

    try {
      isLoading.value = true
      error.value = null

      // 이전 채팅방에서 퇴장
      if (currentRoom.value && currentRoom.value !== roomId) {
        await leaveRoom()
      }

      // WebSocket 연결 확인
      if (!webSocketService.isConnected()) {
        await webSocketService.connect()
      }

      // 채팅방 입장
      await webSocketService.joinChatRoom(roomId)
      currentRoom.value = roomId

      // 메시지 초기화
      messages.value = []

      // 채팅방 정보 및 최근 메시지 로드
      await loadRoomMessages(roomId)

      console.log(`🚪 채팅방 입장 완료: ${roomId}`)

    } catch (err) {
      error.value = err.message
      console.error('❌ 채팅방 입장 실패:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 채팅방 퇴장
   */
  const leaveRoom = async () => {
    if (!currentRoom.value) return

    try {
      await webSocketService.leaveChatRoom(currentRoom.value)
      console.log(`🚪 채팅방 퇴장: ${currentRoom.value}`)

      currentRoom.value = null
      messages.value = []
      onlineUsers.value = []

    } catch (err) {
      console.error('❌ 채팅방 퇴장 실패:', err)
    }
  }

  /**
   * 메시지 전송
   */
  const sendMessage = async (content, type = 'TEXT') => {
    if (!content?.trim() || !currentRoom.value) {
      return
    }

    try {
      await webSocketService.sendChatMessage(currentRoom.value, content.trim(), type)

      // 입력창 비우기
      messageInput.value = ''

      console.log('📤 메시지 전송 완료')

    } catch (err) {
      error.value = '메시지 전송에 실패했습니다'
      console.error('❌ 메시지 전송 실패:', err)
      throw err
    }
  }

  /**
   * 파일 메시지 전송
   */
  const sendFileMessage = async (file) => {
    if (!file || !currentRoom.value) return

    try {
      // 파일 업로드 (실제 구현 시 파일 업로드 API 사용)
      const fileUrl = await uploadFile(file)

      const content = JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: fileUrl
      })

      await sendMessage(content, 'FILE')

    } catch (err) {
      error.value = '파일 전송에 실패했습니다'
      console.error('❌ 파일 전송 실패:', err)
      throw err
    }
  }

  /**
   * 타이핑 상태 전송
   */
  const sendTypingStatus = (isTyping) => {
    if (!currentRoom.value) return

    try {
      webSocketService.sendMessage('/app/chat/typing', {
        roomId: currentRoom.value,
        isTyping: isTyping,
        timestamp: Date.now()
      })
    } catch (err) {
      console.error('❌ 타이핑 상태 전송 실패:', err)
    }
  }

  /**
   * ✅ 채팅방 메시지 로드 (chatService 사용)
   * 백엔드: GET /api/chats/{roomId}/messages
   */
  const loadRoomMessages = async (roomId, lastMessageId = null, size = 50) => {
    try {
      const response = await chatService.getChatMessages(roomId, {
        lastMessageId,
        size
      })

      // 응답 데이터 변환
      const newMessages = (response.data || []).map(msg =>
          chatService.transformMessageResponse(msg)
      )

      // 기존 메시지와 합치기
      if (!lastMessageId) {
        // 첫 로드: 메시지 교체
        messages.value = newMessages
      } else {
        // 추가 로드: 앞에 추가 (이전 메시지)
        messages.value = [...newMessages, ...messages.value]
      }

      console.log(`📨 메시지 로드 완료: ${newMessages.length}개`)

      return response

    } catch (err) {
      console.error('❌ 메시지 로드 실패:', err)
      throw err
    }
  }

  /**
   * 스크롤을 맨 아래로 이동
   */
  const scrollToBottom = () => {
    const chatContainer = document.querySelector('.chat-messages-container')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }

  /**
   * 브라우저 알림 표시
   */
  const showBrowserNotification = (message) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    new Notification(`${message.senderName}`, {
      body: message.content,
      icon: '/favicon.ico',
      tag: `chat-${message.roomId}`
    })
  }

  /**
   * 파일 업로드
   */
  const uploadFile = async (file) => {
    if (!currentRoom.value || !file) {
      throw new Error('채팅방 ID와 파일이 필요합니다')
    }

    try {
      const response = await chatService.uploadFile(currentRoom.value, file)
      return response.data?.fileUrl || `/uploads/${file.name}`
    } catch (err) {
      console.error('❌ 파일 업로드 실패:', err)
      throw err
    }
  }

  /**
   * 메시지 ID 생성
   */
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 정리 작업
   */
  const cleanup = async () => {
    try {
      // 메시지 핸들러 제거
      webSocketService.offMessage('chat-message', handleChatMessage)
      webSocketService.offMessage('system-notification', handleSystemNotification)
      webSocketService.offMessage('presence-update', handlePresenceUpdate)
      webSocketService.offMessage('private-message', handlePrivateMessage)

      // 채팅방 퇴장
      await leaveRoom()

      console.log('🧹 채팅 정리 완료')

    } catch (err) {
      console.error('❌ 채팅 정리 실패:', err)
    }
  }

  // 라이프사이클 훅
  onMounted(async () => {
    try {
      await initializeConnection()

      if (roomId) {
        await joinRoom(roomId)
      }
    } catch (err) {
      console.error('❌ 채팅 초기화 실패:', err)
    }
  })

  onUnmounted(async () => {
    await cleanup()
  })

  // 반환값
  return {
    // 상태
    messages,
    currentRoom,
    typing,
    onlineUsers,
    messageInput,
    isLoading,
    error,
    messageStats,
    connectionState,

    // 메서드
    joinRoom,
    leaveRoom,
    sendMessage,
    sendFileMessage,
    sendTypingStatus,
    loadRoomMessages,
    scrollToBottom,
    cleanup,

    // 유틸리티
    getCurrentUserId,
    isToday
  }
}