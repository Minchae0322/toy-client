// composables/useChat.js
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { websocketService } from '@/services/websocketService'
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
  const connectionState = websocketService.getConnectionState()

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

      if (!websocketService.isConnected()) {
        await websocketService.connect()
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
    websocketService.onMessage('chat-message', handleChatMessage)

    // 시스템 알림 핸들러
    websocketService.onMessage('system-notification', handleSystemNotification)

    // 접속 상태 업데이트 핸들러
    websocketService.onMessage('presence-update', handlePresenceUpdate)

    // 개인 메시지 핸들러
    websocketService.onMessage('private-message', handlePrivateMessage)
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
      if (!websocketService.isConnected()) {
        await websocketService.connect()
      }

      // 채팅방 입장
      await websocketService.joinChatRoom(roomId)
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
      await websocketService.leaveChatRoom(currentRoom.value)
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
      await websocketService.sendChatMessage(currentRoom.value, content.trim(), type)

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
      websocketService.sendMessage('/app/chat/typing', {
        roomId: currentRoom.value,
        isTyping: isTyping,
        timestamp: Date.now()
      })
    } catch (err) {
      console.error('❌ 타이핑 상태 전송 실패:', err)
    }
  }

  /**
   * 채팅방 메시지 로드 (REST API)
   */
  const loadRoomMessages = async (roomId, page = 0, size = 50) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('메시지 로드 실패')
      }

      const data = await response.json()

      // 기존 메시지와 합치기
      if (page === 0) {
        messages.value = data.messages || []
      } else {
        messages.value = [...(data.messages || []), ...messages.value]
      }

      return data

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
   * 파일 업로드 (Mock)
   */
  const uploadFile = async (file) => {
    // 실제 구현에서는 파일 업로드 API 사용
    return Promise.resolve(`/uploads/${file.name}`)
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
      websocketService.offMessage('chat-message', handleChatMessage)
      websocketService.offMessage('system-notification', handleSystemNotification)
      websocketService.offMessage('presence-update', handlePresenceUpdate)
      websocketService.offMessage('private-message', handlePrivateMessage)

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