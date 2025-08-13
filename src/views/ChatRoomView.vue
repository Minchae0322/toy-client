<template>
  <div class="chat-container">
    <ChatRoomHeader @toggle-search="toggleSearch" />

    <SearchBar
        v-if="showSearch"
        v-model:search-query="searchQuery"
    />

    <ChatRoomTabs
        :active-tab="activeTab"
        @update-tab="updateTab"
    />

    <!-- 디버깅용 정보 표시 (개발환경에서만) -->
    <div v-if="isDev" class="debug-info">
      <p>총 채팅방: {{ chatRooms.length }}개</p>
      <p>필터된 채팅방: {{ filteredRooms.length }}개</p>
      <p>현재 탭: {{ activeTab }}</p>
      <p>검색어: "{{ searchQuery }}"</p>
    </div>

    <div class="chat-list">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>채팅방 목록을 불러오는 중...</p>
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
      <div v-if="!loading && filteredRooms.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-title">채팅방이 없습니다</div>
        <div class="empty-message">새로운 채팅을 시작해보세요!</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import ChatRoomHeader from '@/components/chat/ChatRoomHeader.vue'
import SearchBar from '@/components/chat/SearchBar.vue'
import ChatRoomTabs from '@/components/chat/ChatRoomTabs.vue'
import ChatRoomCard from '@/components/chat/ChatRoomCard.vue'
import {chatApi} from '@/services/chatApi.js'

// 이벤트 정의
const emit = defineEmits(['room-selected'])

// 반응형 데이터
const activeTab = ref('all')
const showSearch = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const isDev = ref(import.meta.env.DEV)

// 채팅방 목록 데이터
const chatRooms = ref([])

// 필터링된 채팅방 목록
const filteredRooms = computed(() => {
  let filtered = chatRooms.value

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

  // 검색 필터링
  if (searchQuery.value) {
    filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        room.lastMessage.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
  }
}

const updateTab = (tab) => {
  activeTab.value = tab
}

// 채팅방 선택 핸들러
const handleRoomSelect = (roomId) => {
  console.log('📋 ChatRoomView - 채팅방 선택 이벤트 수신:', roomId)
  emit('room-selected', roomId)
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

// 채팅방 목록 로드 (백엔드 API 연동)
const loadChatRooms = async () => {
  try {
    loading.value = true
    console.log('📋 채팅방 목록 로드 시작')

    // 인증 토큰 확인
    const token = getAuthToken()
    if (!token) {
      console.warn('⚠️ 인증 토큰이 없습니다. 샘플 데이터를 사용합니다.')
      loadSampleData()
      return
    }

    try {
      // 실제 API 호출
      const response = await chatApi.getChatRooms({
        roomType: null, // 전체 조회
        status: 'ACTIVE', // 활성 채팅방만
        keyword: searchQuery.value || null
      })

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const backendRooms = response.data || []
      chatRooms.value = backendRooms.map(room => ({
        id: room.roomId,
        name: room.title,
        type: room.roomType === 'ONE_TO_ONE' ? 'dm' : 'group',
        participantCount: room.participantCount,
        lastMessage: room.lastMessage || '메시지가 없습니다',
        lastMessageSender: null, // 백엔드에서 제공하지 않음
        lastMessageType: room.lastMessageType ? room.lastMessageType.toLowerCase() : 'text',
        lastMessageAt: room.lastMessageAt ? new Date(room.lastMessageAt).getTime() : Date.now(),
        unreadCount: room.unreadCount || 0,
        status: 'online', // 임시값
        avatar: room.thumbnailUrl // DM용 아바타
      }))

      console.log('✅ 채팅방 목록 로드 완료:', chatRooms.value.length, '개')

    } catch (apiError) {
      console.error('❌ API 호출 실패, 샘플 데이터 사용:', apiError)
      loadSampleData()
    }

  } catch (error) {
    console.error('❌ 채팅방 목록 로드 실패:', error)
    loadSampleData()
  } finally {
    loading.value = false
  }
}

// 샘플 데이터 로드 (API 실패 시 사용)
const loadSampleData = () => {
  console.log('📋 샘플 데이터 로드')
  chatRooms.value = [
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
      lastMessage: '내일 봐요!',
      lastMessageType: 'text',
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

// 검색어 변경 시 다시 로드
watch(searchQuery, (newQuery) => {
  if (newQuery && newQuery.length > 0) {
    // 실시간 검색을 원한다면 여기서 API 재호출
    // loadChatRooms()
  }
})

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  console.log('🏠 ChatRoomView 컴포넌트 마운트됨')
  loadChatRooms()
})
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
}

.empty-message {
  font-size: 14px;
}

/* 트랜지션 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .chat-container {
    box-shadow: none;
  }

  .debug-info {
    margin: 5px;
    font-size: 11px;
  }
}
</style>