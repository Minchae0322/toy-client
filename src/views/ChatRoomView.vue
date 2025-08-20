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
        :tabs="chatRoomTabs"
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
      <p>API 연동 상태: {{ apiConnected ? '✅' : '❌' }}</p>
      <p>토큰 갱신 중: {{ authStore.refreshing ? '🔄' : '✅' }}</p>
      <p>Auth Server: http://localhost:8081</p>
      <p>Chat Server: http://localhost:8084</p>
      <div class="stats-info">
        <p>통계: 전체({{ getChatRoomStats.total }}) | 1:1({{ getChatRoomStats.normal }}) | 채널({{ getChatRoomStats.channel }}) | 지원({{ getChatRoomStats.support }}) | 보관({{ getChatRoomStats.archived }})</p>
      </div>

      <!-- 디버깅 버튼들 -->
      <div class="debug-controls" style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">
        <button @click="debugAllAuthInfo" class="debug-button">인증 정보 확인</button>
        <button @click="forceTokenRefresh" class="debug-button">강제 토큰 갱신</button>
        <button @click="testApiWithoutAuth" class="debug-button">인증 없이 API 테스트</button>
        <button @click="clearAuthDataAndReload" class="debug-button">인증 데이터 삭제</button>
        <button @click="testBackendRefresh" class="debug-button">백엔드 토큰 갱신 테스트</button>
      </div>
    </div>

    <div class="chat-list">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>채팅방 목록을 불러오는 중...</p>
        <p v-if="authStore.refreshing" class="refresh-status">🔄 토큰 갱신 중...</p>
      </div>

      <!-- 새로고침 버튼 (오류 시) -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-title">채팅방을 불러올 수 없습니다</div>
        <div class="error-message">{{ error }}</div>
        <button @click="loadChatRooms" class="retry-button">
          다시 시도
        </button>
        <button v-if="error.includes('인증')" @click="forceTokenRefresh" class="refresh-button">
          토큰 갱신 시도
        </button>
      </div>

      <!-- 채팅방 목록 -->
      <TransitionGroup v-else name="fade" tag="div">
        <ChatRoomCard
            v-for="room in filteredRooms"
            :key="room.id"
            :room="room"
            @select-room="handleRoomSelect"
            @archive-room="(roomId) => updateChatRoomStatus(roomId, 'ARCHIVED')"
            @restore-room="(roomId) => updateChatRoomStatus(roomId, 'ACTIVE')"
            class="room-card"
            :data-room-type="room.type"
            :data-room-status="room.status"
            :data-has-unread="room.unreadCount > 0"
        >
          <!-- 채팅방 타입 아이콘 표시 -->
          <template #type-icon>
            <span class="room-type-icon">{{ getRoomTypeIcon(room.type) }}</span>
          </template>

          <!-- 상태 뱃지 표시 -->
          <template #status-badge>
            <span
                v-if="room.status !== 'ACTIVE'"
                class="status-badge"
                :class="getStatusBadgeColor(room.status)"
            >
              {{ getStatusText(room.status) }}
            </span>
          </template>
        </ChatRoomCard>
      </TransitionGroup>

      <!-- 빈 상태 -->
      <div v-if="!loading && !error && filteredRooms.length === 0" class="empty-state">
        <div class="empty-icon">{{ getEmptyStateIcon() }}</div>
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

    <!-- 연결 상태 표시 -->
    <div v-if="showConnectionStatus" class="connection-status-container">
      <div class="connection-status" :class="wsConnected ? 'connected' : 'disconnected'">
        {{ wsConnected ? '🟢 실시간 연결됨' : '🔴 실시간 연결 끊김' }}
      </div>
      <div class="connection-status api-status" :class="apiConnected ? 'connected' : 'disconnected'">
        {{ apiConnected ? '🟢 API 연결됨' : '🔴 API 연결 끊김' }}
      </div>
      <div class="connection-status auth-status" :class="getAuthStatusClass()">
        {{ getAuthStatusText() }}
      </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Plus, Check } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.js'
import ChatRoomHeader from '@/components/chat/ChatRoomHeader.vue'
import SearchBar from '@/components/chat/SearchBar.vue'
import ChatRoomTabs from '@/components/chat/ChatRoomTabs.vue'
import ChatRoomCard from '@/components/chat/ChatRoomCard.vue'
import CreateChatRoomModal from '@/components/chat/CreateChatRoomModal.vue'
import { chatService, chatRoomUtils } from '@/services/chatService.js'
import { webSocketService } from '@/services/webSocketService.js'
import * as authUtils from '@/utils/auth.js'

// Pinia 스토어 사용
const authStore = useAuthStore()

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

// 백엔드 enum 상수 정의
const CHAT_ROOM_TYPES = {
  NORMAL: 'NORMAL',
  CHANNEL: 'CHANNEL',
  CUSTOMER_SUPPORT: 'CUSTOMER_SUPPORT'
}

const CHAT_ROOM_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  BLOCKED: 'BLOCKED',
  DELETED: 'DELETED'
}

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

// 연결 상태 관리
const wsConnected = ref(false)
const apiConnected = ref(false)
const subscribedRooms = ref([])

// 채팅방 목록 데이터
const allChatRooms = ref([])
const searchResults = ref([])

// 검색 관련
const isSearching = ref(false)
let searchTimer = null

// 토큰 만료 체크 함수
const isTokenExpired = (token) => {
  if (!token) return true

  try {
    const cleanToken = token.replace('Bearer ', '')
    const payload = JSON.parse(atob(cleanToken.split('.')[1]))
    const currentTime = Date.now() / 1000

    return payload.exp <= currentTime
  } catch (error) {
    console.warn('토큰 파싱 실패:', error)
    return true
  }
}

// 토큰 갱신 필요 여부 체크 (5분 버퍼)
const shouldRefreshToken = (token) => {
  if (!token) return true

  try {
    const cleanToken = token.replace('Bearer ', '')
    const payload = JSON.parse(atob(cleanToken.split('.')[1]))
    const currentTime = Date.now() / 1000
    const bufferTime = 5 * 60 // 5분 버퍼

    return payload.exp <= (currentTime + bufferTime)
  } catch (error) {
    return true
  }
}

// 채팅방 타입별 통계 정보 계산
const getChatRoomStats = computed(() => {
  const stats = {
    total: allChatRooms.value.length,
    normal: 0,
    channel: 0,
    support: 0,
    active: 0,
    archived: 0,
    unread: 0
  }

  allChatRooms.value.forEach(room => {
    if (room.type === CHAT_ROOM_TYPES.NORMAL) stats.normal++
    else if (room.type === CHAT_ROOM_TYPES.CHANNEL) stats.channel++
    else if (room.type === CHAT_ROOM_TYPES.CUSTOMER_SUPPORT) stats.support++

    if (room.status === CHAT_ROOM_STATUS.ACTIVE) stats.active++
    else if (room.status === CHAT_ROOM_STATUS.ARCHIVED) stats.archived++

    if (room.unreadCount > 0) stats.unread++
  })

  return stats
})

// ChatRoomTabs 컴포넌트에서 사용할 탭 설정
const chatRoomTabs = computed(() => [
  {
    key: 'all',
    label: '전체',
    count: getChatRoomStats.value.total,
    icon: '💬'
  },
  {
    key: 'unread',
    label: '읽지않음',
    count: getChatRoomStats.value.unread,
    icon: '🔴'
  },
  {
    key: 'dm',
    label: '1:1 채팅',
    count: getChatRoomStats.value.normal,
    icon: '👤'
  },
  {
    key: 'channel',
    label: '채널',
    count: getChatRoomStats.value.channel,
    icon: '📢'
  },
  {
    key: 'support',
    label: '고객지원',
    count: getChatRoomStats.value.support,
    icon: '🎧'
  },
  {
    key: 'archived',
    label: '보관함',
    count: getChatRoomStats.value.archived,
    icon: '📦'
  }
])

// 필터링된 채팅방 목록
const filteredRooms = computed(() => {
  if (searchQuery.value && searchResults.value.length > 0) {
    return filterByTab(searchResults.value)
  }
  return filterByTab(allChatRooms.value)
})

// 읽지 않은 메시지 수 계산
const unreadCount = computed(() => {
  return allChatRooms.value.reduce((total, room) => total + (room.unreadCount || 0), 0)
})

// 인증 상태 클래스 계산
const getAuthStatusClass = () => {
  if (authStore.refreshing) return 'refreshing'
  if (authStore.hasValidToken) return 'connected'
  return 'disconnected'
}

// 인증 상태 텍스트 계산
const getAuthStatusText = () => {
  if (authStore.refreshing) return '🔄 토큰 갱신 중'
  if (authStore.hasValidToken) return '🟢 토큰 유효'
  return '🔴 토큰 만료'
}

// 메서드
const filterByTab = (rooms) => {
  let filtered = [...rooms]

  switch (activeTab.value) {
    case 'unread':
      filtered = filtered.filter(room => room.unreadCount > 0)
      break
    case 'dm':
      filtered = filtered.filter(room => room.type === CHAT_ROOM_TYPES.NORMAL)
      break
    case 'channel':
      filtered = filtered.filter(room => room.type === CHAT_ROOM_TYPES.CHANNEL)
      break
    case 'support':
      filtered = filtered.filter(room => room.type === CHAT_ROOM_TYPES.CUSTOMER_SUPPORT)
      break
    case 'active':
      filtered = filtered.filter(room => room.status === CHAT_ROOM_STATUS.ACTIVE)
      break
    case 'archived':
      filtered = filtered.filter(room => room.status === CHAT_ROOM_STATUS.ARCHIVED)
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

const getEmptyStateIcon = () => {
  switch (activeTab.value) {
    case 'unread': return '✅'
    case 'channel': return '📢'
    case 'dm': return '👤'
    case 'support': return '🎧'
    case 'archived': return '📦'
    default: return '💬'
  }
}

const getEmptyStateTitle = () => {
  if (searchQuery.value) {
    return '검색 결과가 없습니다'
  }

  switch (activeTab.value) {
    case 'unread': return '읽지 않은 메시지가 없습니다'
    case 'channel': return '채널이 없습니다'
    case 'dm': return '1:1 채팅방이 없습니다'
    case 'support': return '고객지원 채팅방이 없습니다'
    case 'archived': return '보관된 채팅방이 없습니다'
    default: return '채팅방이 없습니다'
  }
}

const getEmptyStateMessage = () => {
  if (searchQuery.value) {
    return `"${searchQuery.value}"에 대한 검색 결과가 없습니다`
  }

  switch (activeTab.value) {
    case 'unread': return '모든 메시지를 확인했습니다! 👍'
    case 'channel': return '새로운 채널을 만들어보세요'
    case 'dm': return '새로운 1:1 대화를 시작해보세요'
    case 'support': return '고객지원이 필요하시면 채팅을 시작해보세요'
    case 'archived': return '보관된 채팅방이 없습니다'
    default: return '새로운 채팅을 시작해보세요!'
  }
}

const getRoomTypeIcon = (roomType) => {
  switch (roomType) {
    case CHAT_ROOM_TYPES.NORMAL: return '👤'
    case CHAT_ROOM_TYPES.CHANNEL: return '📢'
    case CHAT_ROOM_TYPES.CUSTOMER_SUPPORT: return '🎧'
    default: return '💬'
  }
}

const getStatusBadgeColor = (status) => {
  switch (status) {
    case CHAT_ROOM_STATUS.ACTIVE: return 'bg-green-100 text-green-800'
    case CHAT_ROOM_STATUS.ARCHIVED: return 'bg-gray-100 text-gray-800'
    case CHAT_ROOM_STATUS.BLOCKED: return 'bg-red-100 text-red-800'
    case CHAT_ROOM_STATUS.DELETED: return 'bg-red-200 text-red-900'
    default: return 'bg-blue-100 text-blue-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case CHAT_ROOM_STATUS.ACTIVE: return '활성'
    case CHAT_ROOM_STATUS.ARCHIVED: return '보관'
    case CHAT_ROOM_STATUS.BLOCKED: return '차단'
    case CHAT_ROOM_STATUS.DELETED: return '삭제'
    default: return '알 수 없음'
  }
}

// API 연결 테스트
const testApiConnection = async () => {
  try {
    const isConnected = await chatService.testConnection()
    apiConnected.value = isConnected
    return isConnected
  } catch (error) {
    console.error('API 연결 테스트 실패:', error)
    apiConnected.value = false
    return false
  }
}

// 채팅방 목록 로드
const loadChatRooms = async (showLoadingIndicator = true) => {
  try {
    if (showLoadingIndicator) {
      loading.value = true
    }
    error.value = ''

    console.log('📋 채팅방 목록 로드 시작')
    lastApiCall.value = new Date().toLocaleTimeString()

    // Auth Store 초기화
    try {
      await authStore.loadUserInfo()
    } catch (authError) {
      console.warn('Auth Store 초기화 실패:', authError)
    }

    const accessToken = authUtils.getAccessToken()
    const refreshToken = authUtils.getRefreshToken()

    // 토큰 갱신 로직
    if (!accessToken || shouldRefreshToken(accessToken)) {
      if (refreshToken) {
        console.log('🔄 토큰 갱신 시도...')
        try {
          if (authUtils.refreshTokenWithBackend) {
            const refreshResult = await authUtils.refreshTokenWithBackend()
            if (refreshResult.success) {
              console.log('✅ 백엔드 방식 토큰 갱신 완료')
              await authStore.loadUserInfo()
            } else {
              await authStore.refreshToken()
            }
          } else {
            await authStore.refreshToken()
          }
        } catch (refreshError) {
          console.error('❌ 토큰 갱신 실패:', refreshError)
          error.value = '인증이 만료되었습니다. 다시 로그인해주세요.'
          return
        }
      } else {
        console.warn('⚠️ Refresh Token이 없어 샘플 데이터를 사용합니다.')
        loadSampleData()
        return
      }
    }

    try {
      const isApiConnected = await testApiConnection()
      if (!isApiConnected) {
        throw new Error('Chat API 서버에 연결할 수 없습니다')
      }

      const searchCondition = chatRoomUtils.validateSearchCondition({
        status: CHAT_ROOM_STATUS.ACTIVE,
        keyword: null,
        roomType: null
      })

      const response = await chatService.getChatRooms(searchCondition)

      if (response.success && response.data) {
        const backendRooms = Array.isArray(response.data) ? response.data : []
        allChatRooms.value = backendRooms.map(chatRoomUtils.transformChatRoomResponse)
        console.log('✅ 백엔드에서 채팅방 목록 로드 완료:', allChatRooms.value.length, '개')
        apiConnected.value = true
        error.value = ''
      } else {
        throw new Error(response.message || 'Chat API 응답이 실패했습니다')
      }

    } catch (apiError) {
      console.error('❌ Chat API 호출 실패:', apiError)
      apiConnected.value = false

      if (apiError.status === 401) {
        console.log('🔄 401 에러 감지, 토큰 갱신 재시도...')
        try {
          if (authUtils.refreshTokenWithBackend && !apiError._retried) {
            const refreshResult = await authUtils.refreshTokenWithBackend()
            if (refreshResult.success) {
              apiError._retried = true
              return await loadChatRooms(showLoadingIndicator)
            }
          }
        } catch (retryError) {
          console.error('❌ 토큰 갱신 재시도 실패:', retryError)
        }
        error.value = '인증이 만료되었습니다. 다시 로그인해주세요.'
        return
      }

      if (apiError.status >= 500 || !apiError.status) {
        console.warn('⚠️ 서버 오류로 인해 샘플 데이터를 사용합니다.')
        loadSampleData()
      } else {
        error.value = apiError.message || '채팅방 목록을 불러올 수 없습니다'
      }
    }

  } catch (generalError) {
    console.error('❌ 채팅방 목록 로드 실패:', generalError)
    error.value = generalError.message || '알 수 없는 오류가 발생했습니다'
    apiConnected.value = false
    loadSampleData()
  } finally {
    loading.value = false
  }
}

// 샘플 데이터 로드
const loadSampleData = () => {
  const sampleData = chatService.getSampleChatRooms()
  allChatRooms.value = sampleData.data.map(chatRoomUtils.transformChatRoomResponse)
  apiConnected.value = false
}

// 디버깅 함수들
const debugAllAuthInfo = () => {
  console.group('🔍 전체 인증 정보 디버깅')

  if (authStore.debugTokenStatus) {
    authStore.debugTokenStatus()
  }

  if (authUtils.debugAuthStatus) {
    authUtils.debugAuthStatus()
  }

  console.groupEnd()
}

const forceTokenRefresh = async () => {
  console.log('🔄 강제 토큰 갱신 시도...')
  try {
    const backendResult = await authUtils.refreshTokenWithBackend()
    if (backendResult.success) {
      console.log('✅ 백엔드 방식 토큰 갱신 성공')
      await authStore.loadUserInfo()
      showSuccessToast.value = true
      successMessage.value = '토큰이 성공적으로 갱신되었습니다!'
      setTimeout(() => showSuccessToast.value = false, 3000)
      await loadChatRooms(false)
      return
    }

    const storeResult = await authStore.refreshToken()
    if (storeResult) {
      showSuccessToast.value = true
      successMessage.value = '토큰이 갱신되었습니다!'
      setTimeout(() => showSuccessToast.value = false, 3000)
      await loadChatRooms(false)
    } else {
      showErrorToast('토큰 갱신에 실패했습니다.')
    }
  } catch (error) {
    console.error('강제 토큰 갱신 실패:', error)
    showErrorToast('토큰 갱신 중 오류가 발생했습니다.')
  }
}

const testApiWithoutAuth = async () => {
  console.log('🧪 인증 없이 Chat API 테스트...')
  try {
    const response = await fetch('http://localhost:8084/api/v1/chat/rooms', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    console.log('Chat API 응답 상태:', response.status)
  } catch (error) {
    console.error('Chat API 테스트 실패:', error)
  }
}

const testBackendRefresh = async () => {
  console.log('🧪 백엔드 RefreshJwtFilter 테스트...')
  try {
    const refreshToken = authUtils.getRefreshToken()
    if (!refreshToken) {
      console.error('❌ Refresh Token이 없습니다.')
      return
    }

    const response = await fetch('http://localhost:8081/api/v1/auth/verify', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    })

    console.log('Auth Server 응답 상태:', response.status)
    const newToken = response.headers.get('Authorization')
    if (newToken) {
      console.log('✅ 새로운 Access Token 수신')
    }
  } catch (error) {
    console.error('백엔드 RefreshJwtFilter 테스트 실패:', error)
  }
}

const clearAuthDataAndReload = () => {
  console.log('🧹 인증 데이터 초기화 및 새로고침...')
  authUtils.logout()
  authStore.logout()
  setTimeout(() => window.location.reload(), 100)
}

const showErrorToast = (message) => {
  console.error('🚨 Error:', message)
  if (window.confirm(`${message}\n\n다시 시도하시겠습니까?`)) {
    if (message.includes('토큰') || message.includes('인증')) {
      forceTokenRefresh()
    } else if (message.includes('채팅방')) {
      loadChatRooms()
    }
  }
}

// 이벤트 핸들러
const handleRoomSelect = async (roomId) => {
  console.log('📋 ChatRoomView - 채팅방 선택:', roomId)
  try {
    await authStore.ensureValidToken()
  } catch (error) {
    console.warn('토큰 확인 실패:', error)
  }
  emit('room-selected', roomId)
}

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
      const localResults = allChatRooms.value.filter(room =>
          room.name.toLowerCase().includes(query.toLowerCase()) ||
          (room.lastMessage && room.lastMessage.toLowerCase().includes(query.toLowerCase()))
      )
      searchResults.value = localResults
    } catch (error) {
      console.error('검색 처리 실패:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const handleRoomCreated = async (createdRoom) => {
  console.log('✅ 새 채팅방 생성됨:', createdRoom)
  showCreateModal.value = false
  successMessage.value = '채팅방이 성공적으로 생성되었습니다!'
  showSuccessToast.value = true

  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)

  await loadChatRooms()

  if (createdRoom.roomId) {
    setTimeout(() => {
      handleRoomSelect(createdRoom.roomId)
    }, 500)
  }
}

const updateChatRoomStatus = async (roomId, newStatus) => {
  try {
    console.log(`📋 채팅방 상태 변경: ${roomId} -> ${newStatus}`)

    // 로컬 상태 업데이트
    const roomIndex = allChatRooms.value.findIndex(room => room.id === roomId)
    if (roomIndex !== -1) {
      allChatRooms.value[roomIndex].status = newStatus
    }

    const statusText = newStatus === CHAT_ROOM_STATUS.ARCHIVED ? '보관' : '복원'
    successMessage.value = `채팅방이 ${statusText}되었습니다.`
    showSuccessToast.value = true

    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)

  } catch (error) {
    console.error('❌ 채팅방 상태 변경 실패:', error)
    showErrorToast(error.message || '채팅방 상태 변경에 실패했습니다')
  }
}

// WebSocket 연결 관리 - App.vue에서 전역 관리로 이동
const initializeWebSocket = () => {
  console.warn('⚠️ WebSocket 연결은 App.vue에서 전역적으로 관리됩니다.')
  // App.vue에서 이미 연결되어 있으므로 별도 처리 불필요
}

const disconnectWebSocket = () => {
  console.warn('⚠️ WebSocket 해제는 App.vue에서 전역적으로 관리됩니다.')
  // App.vue에서 관리하므로 여기서는 구독만 정리
  if (webSocketService) {
    // 현재 채팅방 관련 구독만 해제
    subscribedRooms.value.forEach(roomId => {
      webSocketService.unsubscribeFromChatRoom(roomId)
    })
    subscribedRooms.value = []
  }
}

// WebSocket 상태를 주기적으로 확인하는 함수 (fallback)
let wsStatusCheckInterval = null

const startWebSocketStatusCheck = () => {
  if (wsStatusCheckInterval) {
    clearInterval(wsStatusCheckInterval)
  }

  wsStatusCheckInterval = setInterval(() => {
    if (webSocketService) {
      // WebSocket 연결 상태 확인 (다양한 속성명 시도)
      let isConnected = false

      if (typeof webSocketService.isConnected === 'function') {
        isConnected = webSocketService.isConnected()
      } else if (typeof webSocketService.connected === 'boolean') {
        isConnected = webSocketService.connected
      } else if (webSocketService.readyState !== undefined) {
        isConnected = webSocketService.readyState === 1 // WebSocket.OPEN
      } else if (webSocketService.socket && webSocketService.socket.readyState !== undefined) {
        isConnected = webSocketService.socket.readyState === 1
      }

      if (wsConnected.value !== isConnected) {
        console.log('🔌 WebSocket 상태 변경 감지:', isConnected)
        wsConnected.value = isConnected
      }
    }
  }, 5000) // 5초마다 확인
}

const stopWebSocketStatusCheck = () => {
  if (wsStatusCheckInterval) {
    clearInterval(wsStatusCheckInterval)
    wsStatusCheckInterval = null
  }
}

// 자동 새로고침
let refreshInterval = null

const startAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }

  refreshInterval = setInterval(() => {
    if (!loading.value && !error.value && apiConnected.value && authStore.hasValidToken) {
      loadChatRooms(false)
    }
  }, 30000)
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Watchers
watch(searchQuery, (newQuery) => {
  if (newQuery !== undefined) {
    handleSearch(newQuery)
  }
})

watch(() => authStore.isAuthenticated, (newValue) => {
  console.log(`🔑 인증 상태 변경: ${newValue ? '인증됨' : '인증 해제'}`)
  if (!newValue) {
    apiConnected.value = false
    disconnectWebSocket()
  } else {
    initializeWebSocket()
  }
})

watch(() => authStore.refreshing, (newValue) => {
  console.log(`🔄 토큰 갱신 상태: ${newValue ? '진행 중' : '완료'}`)
})

watch(() => authStore.hasValidToken, (newValue) => {
  console.log(`🎫 토큰 유효성: ${newValue ? '유효' : '무효'}`)
})

// 컴포넌트 라이프사이클
onMounted(async () => {
  console.log('🏠 ChatRoomView 컴포넌트 마운트됨')

  try {
    await authStore.loadUserInfo()
    console.log('✅ Auth Store 초기화 완료')
  } catch (error) {
    console.warn('⚠️ Auth Store 초기화 실패:', error)
  }

  if (isDev.value) {
    debugAllAuthInfo()
  }

  await loadChatRooms()

  if (authStore.isAuthenticated) {
    initializeWebSocket()
  }

  startAutoRefresh()
})

onUnmounted(() => {
  console.log('🏠 ChatRoomView 컴포넌트 언마운트됨')
  stopAutoRefresh()
  disconnectWebSocket()
  stopWebSocketStatusCheck() // WebSocket 상태 체크 정리
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

.stats-info {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #bae6fd;
}

.debug-button {
  padding: 4px 8px;
  font-size: 11px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.debug-button:hover {
  background: #2563eb;
}

.debug-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
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

.refresh-status {
  margin-top: 8px;
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
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

.retry-button, .refresh-button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 4px;
}

.retry-button:hover, .refresh-button:hover {
  background: #2563eb;
}

.refresh-button {
  background: #f59e0b;
}

.refresh-button:hover {
  background: #d97706;
}

.room-card {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
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

.connection-status-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 1000;
}

.connection-status {
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid transparent;
}

.connection-status.connected {
  background: rgba(220, 252, 231, 0.9);
  color: #166534;
  border-color: #bbf7d0;
}

.connection-status.disconnected {
  background: rgba(254, 242, 242, 0.9);
  color: #991b1b;
  border-color: #fecaca;
}

.connection-status.refreshing {
  background: rgba(254, 243, 199, 0.9);
  color: #92400e;
  border-color: #fcd34d;
  animation: pulse-refresh 1.5s infinite;
}

@keyframes pulse-refresh {
  0%, 100% { background: rgba(254, 243, 199, 0.9); }
  50% { background: rgba(254, 243, 199, 0.7); }
}

.api-status {
  font-size: 10px;
}

.auth-status {
  font-size: 10px;
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

  .debug-button {
    padding: 3px 6px;
    font-size: 10px;
  }

  .connection-status-container {
    bottom: 10px;
    right: 10px;
  }

  .connection-status {
    font-size: 10px;
    padding: 5px 8px;
  }

  .api-status, .auth-status {
    font-size: 9px;
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

  .debug-button {
    background: #1e40af;
  }

  .debug-button:hover {
    background: #1d4ed8;
  }

  .connection-status.connected {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border-color: #22c55e;
  }

  .connection-status.disconnected {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: #ef4444;
  }

  .connection-status.refreshing {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border-color: #f59e0b;
  }
}

/* 채팅방 타입별 스타일 */
.room-card[data-room-type="NORMAL"] {
  border-left: 3px solid #10b981;
}

.room-card[data-room-type="CHANNEL"] {
  border-left: 3px solid #3b82f6;
}

.room-card[data-room-type="CUSTOMER_SUPPORT"] {
  border-left: 3px solid #f59e0b;
}

/* 읽지 않은 메시지 강조 */
.room-card[data-has-unread="true"] {
  background: linear-gradient(90deg, #fef7cd 0%, transparent 100%);
  border-left-color: #f59e0b !important;
  border-left-width: 4px !important;
}

/* 애니메이션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .spinner,
  .room-card,
  .floating-create-button,
  .success-toast,
  .connection-status.refreshing {
    animation: none !important;
    transition: none !important;
  }
}

/* 백엔드 연동 상태 표시 */
.backend-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
}

.backend-status.connected {
  background: #d1fae5;
  color: #065f46;
}

.backend-status.disconnected {
  background: #fee2e2;
  color: #991b1b;
}

.backend-status.refreshing {
  background: #fef3c7;
  color: #92400e;
}
</style>