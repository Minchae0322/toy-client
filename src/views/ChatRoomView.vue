<template>
  <div class="chat-container">
    <ChatRoomHeader
        @toggle-search="toggleSearch"
        @create-room="showCreateModal = true"
    />

    <SearchBar
        v-if="showSearch"
        v-model:search-query="searchQuery"
        @search="handleSearch"
    />

    <ChatRoomTabs
        :active-tab="activeTab"
        @update-tab="updateTab"
        :unread-count="unreadCount"
    />

    <!-- 디버깅용 정보 표시 (개발환경에서만) -->
    <div v-if="isDev" class="debug-info">
      <p>총 채팅방: {{ allChatRooms.length }}개</p>
      <p>필터된 채팅방: {{ filteredRooms.length }}개</p>
      <p>현재 탭: {{ activeTab }}</p>
      <p>검색어: "{{ searchQuery }}"</p>
      <p>WebSocket 연결: {{ wsConnected ? '✅' : '❌' }}</p>
      <p>현재 구독한 채팅방: {{ subscribedRooms.join(', ') || '없음' }}</p>
      <p>마지막 API 호출: {{ lastApiCall || '없음' }}</p>
    </div>

    <div class="chat-list">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>채팅방 목록을 불러오는 중...</p>
      </div>

      <!-- 새로고침 버튼 (오류 시) -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-title">채팅방을 불러올 수 없습니다</div>
        <div class="error-message">{{ error }}</div>
        <button @click="loadChatRooms" class="retry-button">
          다시 시도
        </button>
      </div>

      <!-- 채팅방 목록 -->
      <TransitionGroup v-else name="fade" tag="div">
        <ChatRoomCard
            v-for="room in filteredRooms"
            :key="room.id"
            :room="room"
            @select-room="handleRoomSelect"
            class="room-card"
        />
      </TransitionGroup>

      <!-- 빈 상태 -->
      <div v-if="!loading && !error && filteredRooms.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-title">
          {{ getEmptyStateTitle() }}
        </div>
        <div class="empty-message">
          {{ getEmptyStateMessage() }}
        </div>
        <button
            v-if="activeTab === 'all' && !searchQuery"
            @click="showCreateModal = true"
            class="create-room-button"
        >
          새 채팅방 만들기
        </button>
      </div>
    </div>

    <!-- 하단 플로팅 버튼 -->
    <button
        v-if="!loading && !error && filteredRooms.length > 0"
        @click="showCreateModal = true"
        class="floating-create-button"
        :title="'새 채팅방 만들기'"
    >
      <Plus :size="24" />
    </button>

    <!-- WebSocket 연결 상태 표시 -->
    <div v-if="showConnectionStatus" class="connection-status" :class="wsConnected ? 'connected' : 'disconnected'">
      {{ wsConnected ? '🟢 연결됨' : '🔴 연결 끊김' }}
    </div>

    <!-- 채팅방 생성 모달 -->
    <Teleport to="body">
      <CreateChatRoomModal
          v-if="showCreateModal"
          @close="showCreateModal = false"
          @created="handleRoomCreated"
      />
    </Teleport>

    <!-- 성공 토스트 -->
    <Transition name="toast">
      <div v-if="showSuccessToast" class="success-toast" @click="showSuccessToast = false">
        <div class="toast-content">
          <Check :size="20" class="toast-icon" />
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import { Plus, Check } from 'lucide-vue-next'
import ChatRoomHeader from '@/components/chat/ChatRoomHeader.vue'
import SearchBar from '@/components/chat/SearchBar.vue'
import ChatRoomTabs from '@/components/chat/ChatRoomTabs.vue'
import ChatRoomCard from '@/components/chat/ChatRoomCard.vue'
import CreateChatRoomModal from '@/components/chat/CreateChatRoomModal.vue'
import {chatApi, chatRoomUtils} from '@/services/chatApi.js'
import {webSocketService} from '@/services/webSocketService.js'

// 이벤트 정의
const emit = defineEmits(['room-selected', 'message-received'])

// Props
const props = defineProps({
  connectionState: {
    type: Object,
    default: () => ({
      connected: false,
      connecting: false,
      status: 'disconnected',
      error: null
    })
  }
})

// 반응형 데이터
const activeTab = ref('all')
const showSearch = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')
const isDev = ref(import.meta.env.DEV)
const showConnectionStatus = ref(true)
const showCreateModal = ref(false)
const showSuccessToast = ref(false)
const successMessage = ref('')
const lastApiCall = ref('')

// WebSocket 관련 상태
const wsConnected = ref(false)
const subscribedRooms = ref([])

// 채팅방 목록 데이터
const allChatRooms = ref([])
const searchResults = ref([])

// 검색 관련
const isSearching = ref(false)
let searchTimer = null

// 필터링된 채팅방 목록
const filteredRooms = computed(() => {
  // 검색 중이면 검색 결과 사용
  if (searchQuery.value && searchResults.value.length > 0) {
    return filterByTab(searchResults.value)
  }

  return filterByTab(allChatRooms.value)
})

// 읽지 않은 메시지 수 계산
const unreadCount = computed(() => {
  return allChatRooms.value.reduce((total, room) => total + (room.unreadCount || 0), 0)
})

// 메서드
const filterByTab = (rooms) => {
  let filtered = [...rooms]

  // 탭 필터링
  switch (activeTab.value) {
    case 'unread':
      filtered = filtered.filter(room => room.unreadCount > 0)
      break
    case 'group':
      filtered = filtered.filter(room => room.type === 'group')
      break
    case 'dm':
      filtered = filtered.filter(room => room.type === 'dm')
      break
  }

  return chatRoomUtils.sortChatRooms(filtered, 'lastMessage')
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
    searchResults.value = []
  }
}

const updateTab = (tab) => {
  activeTab.value = tab
}

const getEmptyStateTitle = () => {
  if (searchQuery.value) {
    return '검색 결과가 없습니다'
  }

  switch (activeTab.value) {
    case 'unread':
      return '읽지 않은 메시지가 없습니다'
    case 'group':
      return '그룹 채팅방이 없습니다'
    case 'dm':
      return '1:1 채팅방이 없습니다'
    default:
      return '채팅방이 없습니다'
  }
}

const getEmptyStateMessage = () => {
  if (searchQuery.value) {
    return `"${searchQuery.value}"에 대한 검색 결과가 없습니다`
  }

  switch (activeTab.value) {
    case 'unread':
      return '모든 메시지를 확인했습니다! 👍'
    case 'group':
      return '새로운 그룹 채팅을 시작해보세요'
    case 'dm':
      return '새로운 1:1 대화를 시작해보세요'
    default:
      return '새로운 채팅을 시작해보세요!'
  }
}

// WebSocket 연결 (개선된 버전)
const connectWebSocket = async () => {
  try {
    console.log('🔌 WebSocket 연결 시작...')

    // 이미 연결되어 있으면 바로 성공 처리
    if (webSocketService.isConnected()) {
      wsConnected.value = true
      console.log('✅ WebSocket 이미 연결되어 있음')
      return
    }

    await webSocketService.connect()
    wsConnected.value = true
    console.log('✅ WebSocket 연결 완료')

  } catch (error) {
    console.error('❌ WebSocket 연결 실패:', error)
    wsConnected.value = false

    // 연결 실패 시 재시도 안내
    if (error.message?.includes('토큰')) {
      throw new Error('인증 토큰이 유효하지 않습니다')
    } else if (error.message?.includes('시간 초과')) {
      throw new Error('서버 연결 시간이 초과되었습니다')
    } else {
      throw new Error('실시간 연결에 실패했습니다')
    }
  }
}

// 채팅방 선택 핸들러
const handleRoomSelect = async (roomId) => {
  console.log('📋 ChatRoomView - 채팅방 선택 이벤트 수신:', roomId)

  try {
    // 1. 기존 구독 해제 (다른 채팅방으로 이동하는 경우)
    if (subscribedRooms.value.length > 0) {
      subscribedRooms.value.forEach(room => {
        webSocketService.unsubscribeFromChatRoom(room)
      })
      subscribedRooms.value = []
    }

    // 2. WebSocket 연결 확인 및 보장
    console.log('🔌 WebSocket 연결 상태 확인...')
    try {
      await webSocketService.ensureConnection()
      wsConnected.value = webSocketService.isConnected()
      console.log('✅ WebSocket 연결 확인 완료')
    } catch (connectionError) {
      console.error('❌ WebSocket 연결 실패:', connectionError)

      // WebSocket 연결 없이도 채팅방으로 이동은 가능하도록 처리
      console.warn('⚠️ WebSocket 연결 없이 채팅방으로 이동합니다')
      wsConnected.value = false
    }

    // 3. 선택된 채팅방 구독 (WebSocket이 연결된 경우만)
    if (wsConnected.value && webSocketService.isConnected()) {
      try {
        console.log(`📨 채팅방 구독 시작: ${roomId}`)
        await webSocketService.subscribeToChatRoom(roomId, handleMessageReceived)
        subscribedRooms.value.push(roomId)
        console.log(`✅ 채팅방 구독 완료: ${roomId}`)
      } catch (subscribeError) {
        console.error('❌ 채팅방 구독 실패:', subscribeError)
        // 구독 실패해도 채팅방 이동은 계속 진행
        wsConnected.value = false
      }
    } else {
      console.warn('⚠️ WebSocket 연결이 없어 실시간 메시지를 받을 수 없습니다')
    }

    // 4. 해당 채팅방의 읽지 않은 메시지 수 초기화 (UI 업데이트)
    const roomIndex = allChatRooms.value.findIndex(room => room.id === roomId)
    if (roomIndex !== -1) {
      allChatRooms.value[roomIndex].unreadCount = 0
    }

    // 5. 부모 컴포넌트에 이벤트 전달
    emit('room-selected', roomId)

  } catch (error) {
    console.error('❌ 채팅방 선택 중 오류 발생:', error)

    // 오류 타입에 따른 메시지 분류
    let errorMessage = '채팅방 접속에 실패했습니다.'

    if (error.message?.includes('토큰') || error.message?.includes('인증')) {
      errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.'
    } else if (error.message?.includes('네트워크') || error.message?.includes('connection')) {
      errorMessage = '네트워크 연결을 확인해주세요.'
    } else if (error.message?.includes('시간 초과')) {
      errorMessage = '연결 시간이 초과되었습니다. 다시 시도해주세요.'
    }

    // 사용자에게 오류 알림
    showErrorToast(errorMessage)
  }
}

// 검색 핸들러
const handleSearch = (query) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(async () => {
    if (!query || query.trim().length === 0) {
      searchResults.value = []
      return
    }

    try {
      isSearching.value = true

      // 로컬 검색 (현재 로드된 채팅방에서)
      const localResults = allChatRooms.value.filter(room =>
          room.name.toLowerCase().includes(query.toLowerCase()) ||
          (room.lastMessage && room.lastMessage.toLowerCase().includes(query.toLowerCase()))
      )

      // 서버 검색 (추가 검색이 필요한 경우)
      try {
        const serverResults = await chatApi.getChatRooms({
          keyword: query.trim(),
          status: 'ACTIVE'
        })

        if (serverResults.success) {
          const transformedResults = serverResults.data.map(chatRoomUtils.transformChatRoomResponse)

          // 로컬 결과와 서버 결과를 합치고 중복 제거
          const combinedResults = [...localResults]
          transformedResults.forEach(serverRoom => {
            if (!combinedResults.find(localRoom => localRoom.id === serverRoom.id)) {
              combinedResults.push(serverRoom)
            }
          })

          searchResults.value = combinedResults
        } else {
          searchResults.value = localResults
        }
      } catch (error) {
        console.warn('서버 검색 실패, 로컬 검색 결과만 사용:', error)
        searchResults.value = localResults
      }

    } catch (error) {
      console.error('검색 처리 실패:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

// WebSocket 메시지 수신 핸들러
const handleMessageReceived = (messageData) => {
  console.log('📨 새 메시지 수신:', messageData)

  // 채팅방 목록의 마지막 메시지 업데이트
  const roomIndex = allChatRooms.value.findIndex(room => room.id === messageData.roomId)
  if (roomIndex !== -1) {
    allChatRooms.value[roomIndex] = {
      ...allChatRooms.value[roomIndex],
      lastMessage: messageData.content || messageData.message,
      lastMessageAt: Date.now(),
      lastMessageSender: messageData.senderName,
      lastMessageType: messageData.type?.toLowerCase() || 'text',
      unreadCount: allChatRooms.value[roomIndex].unreadCount + 1
    }

    // 배열 순서 재정렬 (최신 메시지가 있는 채팅방을 맨 위로)
    const updatedRoom = allChatRooms.value.splice(roomIndex, 1)[0]
    allChatRooms.value.unshift(updatedRoom)
  }

  // 부모 컴포넌트에 메시지 전달
  emit('message-received', messageData)
}

// 채팅방 생성 완료 핸들러
const handleRoomCreated = async (createdRoom) => {
  console.log('✅ 새 채팅방 생성됨:', createdRoom)

  // 모달 닫기
  showCreateModal.value = false

  // 성공 메시지 표시
  successMessage.value = '채팅방이 성공적으로 생성되었습니다!'
  showSuccessToast.value = true

  // 3초 후 토스트 자동 숨김
  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)

  // 채팅방 목록 다시 로드
  await loadChatRooms()

  // 생성된 채팅방으로 자동 이동
  if (createdRoom.roomId) {
    setTimeout(() => {
      handleRoomSelect(createdRoom.roomId)
    }, 500)
  }
}

// WebSocket 연결 해제
const disconnectWebSocket = () => {
  console.log('🔌 WebSocket 연결 해제...')
  try {
    webSocketService.disconnect()
    wsConnected.value = false
    subscribedRooms.value = []
    console.log('✅ WebSocket 연결 해제 완료')
  } catch (error) {
    console.warn('⚠️ WebSocket 연결 해제 중 오류:', error)
  }
}

// WebSocket 상태 모니터링
const startWebSocketMonitoring = () => {
  setInterval(() => {
    const isActuallyConnected = webSocketService.isConnected()
    if (wsConnected.value !== isActuallyConnected) {
      wsConnected.value = isActuallyConnected
      console.log(`🔌 WebSocket 연결 상태 변경: ${isActuallyConnected ? '연결됨' : '끊어짐'}`)

      // 연결이 끊어진 경우 구독 목록 초기화
      if (!isActuallyConnected) {
        subscribedRooms.value = []
      }
    }
  }, 2000) // 2초마다 체크
}

// 유틸리티 함수들
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}

const generateDeviceId = () => {
  return `web_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
}

const getAuthToken = () => {
  return localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken')
}

// 에러 토스트 표시 함수 개선
const showErrorToast = (message) => {
  // 실제 구현에서는 전역 토스트 시스템을 사용하는 것이 좋습니다
  // 여기서는 간단한 알림으로 대체
  console.error('🚨 Error Toast:', message)

  // 브라우저 알림 대신 더 나은 UX를 위한 토스트 구현
  if (window.confirm(`${message}\n\n다시 시도하시겠습니까?`)) {
    // 재시도 로직
    if (message.includes('WebSocket') || message.includes('실시간')) {
      // WebSocket 재연결 시도
      connectWebSocket().catch(error => {
        console.error('재연결 실패:', error)
      })
    } else if (message.includes('채팅방')) {
      // 채팅방 목록 다시 로드
      loadChatRooms().catch(error => {
        console.error('재로드 실패:', error)
      })
    }
  }
}

// 채팅방 목록 로드 (백엔드 API 연동)
const loadChatRooms = async (showLoadingIndicator = true) => {
  try {
    if (showLoadingIndicator) {
      loading.value = true
    }
    error.value = ''

    console.log('📋 채팅방 목록 로드 시작')
    lastApiCall.value = new Date().toLocaleTimeString()

    // 인증 토큰 확인
    const token = getAuthToken()
    if (!token) {
      console.warn('⚠️ 인증 토큰이 없습니다. 샘플 데이터를 사용합니다.')
      loadSampleData()
      return
    }

    try {
      // 실제 백엔드 API 호출
      const searchCondition = {
        status: 'ACTIVE', // 활성 채팅방만
        keyword: null // 전체 조회
      }

      const response = await chatApi.getChatRooms(searchCondition)

      if (response.success) {
        // 백엔드 응답을 프론트엔드 형식으로 변환
        const backendRooms = response.data || []
        allChatRooms.value = backendRooms.map(chatRoomUtils.transformChatRoomResponse)

        console.log('✅ 채팅방 목록 로드 완료:', allChatRooms.value.length, '개')
      } else {
        throw new Error(response.message || 'API 응답이 실패했습니다')
      }

    } catch (apiError) {
      console.error('❌ API 호출 실패:', apiError)

      // 네트워크 오류인 경우 샘플 데이터 사용
      if (apiError.status >= 500 || !apiError.status) {
        console.warn('⚠️ 서버 오류로 인해 샘플 데이터를 사용합니다.')
        loadSampleData()
      } else {
        // 인증 오류 등의 경우
        error.value = apiError.message || '채팅방 목록을 불러올 수 없습니다'
      }
    }

  } catch (error) {
    console.error('❌ 채팅방 목록 로드 실패:', error)
    error.value = error.message || '알 수 없는 오류가 발생했습니다'
  } finally {
    loading.value = false
  }
}

// 샘플 데이터 로드 (API 실패 시 사용)
const loadSampleData = () => {
  console.log('📋 샘플 데이터 로드')
  allChatRooms.value = [
    {
      id: '1',
      name: '개발팀 프로젝트',
      type: 'group',
      participantCount: 8,
      lastMessage: '내일 회의 시간 확정했습니다',
      lastMessageSender: '김팀장',
      lastMessageType: 'text',
      lastMessageAt: Date.now() - 300000,
      unreadCount: 3,
      status: 'online'
    },
    {
      id: '2',
      name: '이지수',
      type: 'dm',
      avatar: 'https://via.placeholder.com/48/FF6B6B/FFFFFF?text=이',
      lastMessage: '점심 뭐 먹을까요?',
      lastMessageType: 'text',
      lastMessageAt: Date.now() - 600000,
      unreadCount: 1,
      status: 'online'
    },
    {
      id: '3',
      name: '주말 모임 💻',
      type: 'group',
      participantCount: 12,
      lastMessage: '📷 사진',
      lastMessageSender: '박성호',
      lastMessageType: 'image',
      lastMessageAt: Date.now() - 1800000,
      unreadCount: 7,
      status: 'online'
    },
    {
      id: '4',
      name: '최민재',
      type: 'dm',
      avatar: 'https://via.placeholder.com/48/4ECDC4/FFFFFF?text=최',
      lastMessageAt: Date.now() - 3600000,
      unreadCount: 0,
      status: 'away'
    },
    {
      id: '5',
      name: '가족 단톡방',
      type: 'group',
      participantCount: 4,
      lastMessage: '📍 위치',
      lastMessageSender: '엄마',
      lastMessageType: 'location',
      lastMessageAt: Date.now() - 7200000,
      unreadCount: 0,
      status: 'online'
    }
  ]
}

// 검색어 변경 감시
watch(searchQuery, (newQuery) => {
  if (newQuery !== undefined) {
    handleSearch(newQuery)
  }
})

// WebSocket 연결 상태에 따른 UI 업데이트
watch(wsConnected, (newValue) => {
  console.log(`🔌 WebSocket 연결 상태 변경: ${newValue ? '연결됨' : '끊어짐'}`)

  if (!newValue) {
    // 연결이 끊어지면 구독 목록 초기화
    subscribedRooms.value = []
  }
})

// 페이지 가시성 변경 감지 (백그라운드에서 돌아왔을 때 연결 상태 확인)
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    console.log('📱 페이지가 다시 활성화됨 - 연결 상태 확인')

    // WebSocket 연결 상태 확인
    const isConnected = webSocketService.isConnected()
    if (wsConnected.value !== isConnected) {
      wsConnected.value = isConnected

      // 연결이 끊어져있으면 재연결 시도
      if (!isConnected && getAuthToken()) {
        console.log('🔄 페이지 활성화 후 WebSocket 재연결 시도')
        connectWebSocket().catch(error => {
          console.warn('페이지 활성화 후 재연결 실패:', error)
        })
      }
    }

    // 채팅방 목록 새로고침 (백그라운드에서 변경사항이 있을 수 있음)
    if (!loading.value && !error.value) {
      loadChatRooms(false)
    }
  }
}

// 온라인/오프라인 상태 감지
const handleOnlineStatusChange = () => {
  if (navigator.onLine) {
    console.log('🌐 네트워크 연결 복구됨')

    // 온라인 상태로 복구되면 WebSocket 재연결 시도
    if (!wsConnected.value && getAuthToken()) {
      setTimeout(() => {
        connectWebSocket().catch(error => {
          console.warn('네트워크 복구 후 재연결 실패:', error)
        })
      }, 1000)
    }
  } else {
    console.log('🌐 네트워크 연결 끊어짐')
    wsConnected.value = false
  }
}

// 자동 새로고침 (30초마다)
let refreshInterval = null

const startAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }

  refreshInterval = setInterval(() => {
    if (!loading.value && !error.value) {
      loadChatRooms(false) // 로딩 인디케이터 없이 백그라운드에서 새로고침
    }
  }, 30000) // 30초
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  console.log('🏠 ChatRoomView 컴포넌트 마운트됨')

  // 이벤트 리스너 등록
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('online', handleOnlineStatusChange)
  window.addEventListener('offline', handleOnlineStatusChange)

  // 1. 채팅방 목록 로드
  await loadChatRooms()

  // 2. WebSocket 연결 시도 (토큰이 있고 API 로드가 성공한 경우만)
  const token = getAuthToken()
  if (token && !error.value) {
    try {
      await connectWebSocket()
    } catch (error) {
      console.warn('⚠️ WebSocket 초기 연결 실패 (채팅방 목록은 정상 표시):', error)
      // WebSocket 연결 실패해도 채팅방 목록은 표시되도록 함
    }
  } else if (!token) {
    console.warn('⚠️ 인증 토큰이 없어 WebSocket 연결을 건너뜁니다')
  }

  // 3. 자동 새로고침 시작
  startAutoRefresh()

  // 4. WebSocket 상태 모니터링 시작
  startWebSocketMonitoring()
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  console.log('🏠 ChatRoomView 컴포넌트 언마운트됨')

  // 이벤트 리스너 제거
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('online', handleOnlineStatusChange)
  window.removeEventListener('offline', handleOnlineStatusChange)

  // 정리 작업
  stopAutoRefresh()
  disconnectWebSocket()

  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.debug-info {
  padding: 10px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  margin: 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #0c4a6e;
}

.debug-info p {
  margin: 4px 0;
}

.chat-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 8px;
}

.error-message {
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.retry-button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

.room-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.room-card:hover {
  background-color: #f8fafc;
  transform: translateX(2px);
}

.room-card:active {
  background-color: #e2e8f0;
  transform: translateX(0);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.empty-message {
  font-size: 14px;
  margin-bottom: 24px;
}

.create-room-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.create-room-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.floating-create-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.floating-create-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
}

.floating-create-button:active {
  transform: translateY(-1px) scale(0.98);
}

.connection-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  z-index: 1000;
  transition: all 0.3s ease;
}

.connection-status.connected {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.connection-status.disconnected {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.success-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  max-width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #bbf7d0;
  border-left: 4px solid #10b981;
  cursor: pointer;
  z-index: 999;
  overflow: hidden;
  transition: all 0.3s ease;
}

.success-toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.toast-icon {
  color: #10b981;
  flex-shrink: 0;
}

.toast-content span {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

/* 트랜지션 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-container {
    box-shadow: none;
  }

  .debug-info {
    margin: 5px;
    font-size: 11px;
  }

  .connection-status {
    bottom: 10px;
    right: 10px;
    font-size: 11px;
  }

  .floating-create-button {
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
  }

  .success-toast {
    right: 12px;
    left: 12px;
    max-width: none;
  }

  .empty-state {
    padding: 40px 20px;
  }

  .empty-icon {
    font-size: 40px;
  }

  .empty-title {
    font-size: 16px;
  }

  .create-room-button {
    padding: 10px 20px;
    font-size: 13px;
  }

  .retry-button {
    padding: 10px 20px;
    font-size: 13px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .chat-container {
    background-color: #1f2937;
    color: #f9fafb;
  }

  .debug-info {
    background: #1e3a8a;
    border-color: #3b82f6;
    color: #dbeafe;
  }

  .loading-state,
  .error-state,
  .empty-state {
    color: #d1d5db;
  }

  .empty-title {
    color: #f9fafb;
  }

  .error-title {
    color: #fca5a5;
  }

  .room-card:hover {
    background-color: #374151;
  }

  .room-card:active {
    background-color: #4b5563;
  }

  .success-toast {
    background: #1f2937;
    border-color: #10b981;
  }

  .toast-content span {
    color: #f9fafb;
  }
}

/* 접근성 개선 */
.retry-button:focus,
.create-room-button:focus,
.floating-create-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 스크롤바 스타일 */
.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.chat-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 애니메이션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .spinner,
  .room-card,
  .floating-create-button,
  .success-toast,
  .fade-enter-active,
  .fade-leave-active,
  .toast-enter-active,
  .toast-leave-active {
    animation: none !important;
    transition: none !important;
  }

  .floating-create-button:hover,
  .create-room-button:hover,
  .success-toast:hover {
    transform: none !important;
  }
}
</style>