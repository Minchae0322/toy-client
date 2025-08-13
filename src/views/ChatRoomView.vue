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

    <div class="chat-list">
      <TransitionGroup name="fade">
        <ChatRoomCard
            v-for="room in filteredRooms"
            :key="room.id"
            :room="room"
            @select-room="selectRoom"
        />
      </TransitionGroup>

      <div v-if="filteredRooms.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-title">채팅방이 없습니다</div>
        <div class="empty-message">새로운 채팅을 시작해보세요!</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { chatNavigation } from '@/router' // 라우터 헬퍼 함수 import
import ChatRoomHeader from '@/components/chat/ChatRoomHeader.vue'
import SearchBar from '@/components/chat/SearchBar.vue'
import ChatRoomTabs from '@/components/chat/ChatRoomTabs.vue'
import ChatRoomCard from '@/components/chat/ChatRoomCard.vue'

// Vue Router 사용
const router = useRouter()

const activeTab = ref('all')
const showSearch = ref(false)
const searchQuery = ref('')

// 샘플 채팅방 데이터
const chatRooms = ref([
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
])

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

// 채팅방 선택 시 실제 네비게이션 구현
const selectRoom = async (roomId) => {
  console.log('채팅방 선택:', roomId)

  try {
    // 1. 채팅방 입장 API 호출
    await joinChatRoom(roomId)

    // 2. 라우터 헬퍼 함수 사용 또는 직접 라우팅
    await chatNavigation.toChatRoom(roomId)

    // 또는 직접 라우팅:
    // await router.push({ name: 'ChatRoom', params: { roomId } })

  } catch (error) {
    console.error('채팅방 이동 실패:', error)
    // 에러 처리 (토스트 메시지 등)
    alert('채팅방 입장에 실패했습니다.')
  }
}

// API 호출 함수 (필요시 구현)
const joinChatRoom = async (roomId) => {
  const deviceId = localStorage.getItem('deviceId') || generateDeviceId()

  const response = await fetch(`/v1/chat/rooms/${roomId}/join?deviceId=${deviceId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('채팅방 입장에 실패했습니다')
  }
}

// 디바이스 ID 생성
const generateDeviceId = () => {
  const deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  localStorage.setItem('deviceId', deviceId)
  return deviceId
}

// 인증 토큰 가져오기
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background: white;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.chat-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
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
}
</style>