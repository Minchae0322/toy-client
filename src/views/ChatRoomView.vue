<template>
  <div class="chat-container">
    <!-- 헤더 -->
    <header class="header">
      <h1 class="header-title">메시지</h1>
      <div class="header-actions">
        <button @click="toggleSearch" class="icon-btn" :class="{ active: showSearch }">
          <Search :size="20" />
        </button>
      </div>
    </header>

    <!-- 검색바 -->
    <Transition name="slide">
      <div v-if="showSearch" class="search-wrapper">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input
              v-model="searchQuery"
              type="text"
              placeholder="채팅 검색..."
              class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
            <X :size="16" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- 탭 -->
    <nav class="tabs">
      <button
          v-for="tab in visibleTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
      >
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
      </button>
    </nav>

    <!-- 채팅방 목록 -->
    <main class="chat-list">
      <!-- 로딩 -->
      <div v-if="loading" class="state-container">
        <div class="loader"></div>
        <p class="state-text">불러오는 중...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="state-container">
        <div class="error-circle">
          <AlertCircle :size="24" />
        </div>
        <p class="state-title">연결할 수 없습니다</p>
        <p class="state-text">{{ error }}</p>
        <button @click="loadChatRooms" class="btn-primary">다시 시도</button>
      </div>

      <!-- 채팅방 리스트 -->
      <div v-else-if="filteredRooms.length > 0" class="room-list">
        <TransitionGroup name="list">
          <div
              v-for="room in filteredRooms"
              :key="room.id"
              @click="goToChatDetail(room.id)"
              class="room-item"
              :class="{ unread: room.unreadCount > 0 }"
          >
            <!-- 프로필 -->
            <div class="profile">
              <img
                  v-if="room.userInfo?.profileImage"
                  :src="room.userInfo.profileImage"
                  :alt="room.name"
                  class="profile-img"
              />
              <div v-else class="profile-img profile-placeholder">
                <User :size="22" />
              </div>
              <div v-if="room.userInfo?.isOnline" class="online-dot"></div>
            </div>

            <!-- 채팅 내용 -->
            <div class="room-info">
              <div class="room-header">
                <h3 class="room-name">{{ room.name }}</h3>
                <span class="room-time">{{ formatTime(room.lastMessageAt) }}</span>
              </div>
              <p class="room-message">{{ room.lastMessage || '메시지가 없습니다' }}</p>
            </div>

            <!-- 피드 썸네일 -->
            <div class="feed-thumb">
              <img
                  v-if="room.feed?.thumbnail"
                  :src="room.feed.thumbnail"
                  :alt="room.feed?.title"
              />
              <div v-else class="feed-thumb-placeholder">
                <ImageIcon :size="18" />
              </div>
              <span v-if="room.unreadCount > 0" class="unread-badge">
                {{ room.unreadCount > 99 ? '99+' : room.unreadCount }}
              </span>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="state-container">
        <div class="empty-icon-wrapper">
          <component :is="getEmptyIcon()" :size="32" />
        </div>
        <p class="state-title">{{ getEmptyTitle() }}</p>
        <p class="state-text">{{ getEmptyMessage() }}</p>
      </div>
    </main>

    <!-- 토스트 -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <Check v-if="toast.type === 'success'" :size="18" />
        <AlertCircle v-else :size="18" />
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, X, AlertCircle, Check, User, ImageIcon, MessageCircle, CheckCircle } from 'lucide-vue-next'
import { chatService } from '@/services/ChatService.js'

const router = useRouter()

// 상태
const activeTab = ref('all')
const showSearch = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')
const toast = ref({ show: false, message: '', type: 'success' })

// 채팅 데이터
const allChatRooms = ref([])
const emit = defineEmits(['room-selected'])
// 탭 설정
const visibleTabs = computed(() => [
  { key: 'all', label: '전체', count: allChatRooms.value.length },
  { key: 'unread', label: '안읽음', count: allChatRooms.value.filter(r => r.unreadCount > 0).length },
])

// 필터링
const filteredRooms = computed(() => {
  let rooms = [...allChatRooms.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    rooms = rooms.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.lastMessage?.toLowerCase().includes(q) ||
        r.feed?.title?.toLowerCase().includes(q)
    )
  }

  if (activeTab.value === 'unread') {
    return rooms.filter(r => r.unreadCount > 0)
  }

  return rooms
})

// 메서드
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) searchQuery.value = ''
}

const goToChatDetail = (roomId) => {
  emit('room-selected', roomId)
}

const loadChatRooms = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await chatService.getChatRooms({ status: 'ACTIVE' })

    if (response.success && response.data) {
      const backendRooms = Array.isArray(response.data) ? response.data : []
      allChatRooms.value = backendRooms.map(room => transformRoom(room))
      allChatRooms.value = chatService.sortChatRooms(allChatRooms.value, 'lastMessage')
    } else {
      throw new Error(response.message || '채팅방 목록을 불러올 수 없습니다')
    }
  } catch (err) {
    console.error('[ChatRoomView] 채팅방 목록 로드 실패:', err)

    // 샘플 데이터로 폴백
    allChatRooms.value = getSampleChatRooms()

    if (import.meta.env.DEV) {
      error.value = err.message
    }
  } finally {
    loading.value = false
  }
}

// 유틸리티
const transformRoom = (room) => ({
  id: room.chatRoomId || room.roomId || room.id,
  name: room.title || room.participantName || '알 수 없음',
  lastMessage: room.lastMessage?.content || room.lastMessageContent,
  lastMessageAt: room.lastMessage?.createdAt || room.lastMessageAt,
  unreadCount: room.unreadCount || 0,
  userInfo: {
    profileImage: room.participantProfileImage,
    isOnline: room.isOnline || false
  },
  feed: room.relatedFeed ? {
    id: room.relatedFeed.feedId,
    title: room.relatedFeed.productName || room.relatedFeed.title,
    price: room.relatedFeed.price,
    thumbnail: room.relatedFeed.thumbnailUrl,
    likeCount: room.relatedFeed.likeCount,
    commentCount: room.relatedFeed.commentCount
  } : null
})

const getSampleChatRooms = () => [
  {
    id: 1,
    name: '김민준',
    lastMessage: '안녕하세요! 이거 어디서 구매하셨어요?',
    lastMessageAt: new Date().toISOString(),
    unreadCount: 2,
    userInfo: { profileImage: 'https://i.pravatar.cc/150?img=11', isOnline: true },
    feed: { id: 101, title: '무신사 스탠다드 오버핏 맨투맨', price: 29900, thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300', likeCount: 234, commentCount: 18 }
  },
  {
    id: 2,
    name: '이서연',
    lastMessage: '사이즈 정보 알려주실 수 있나요?',
    lastMessageAt: new Date(Date.now() - 300000).toISOString(),
    unreadCount: 1,
    userInfo: { profileImage: 'https://i.pravatar.cc/150?img=5', isOnline: false },
    feed: { id: 102, title: '나이키 에어포스1 화이트', price: 139000, thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', likeCount: 892, commentCount: 45 }
  },
  {
    id: 3,
    name: '박준혁',
    lastMessage: '네 좋은 정보 감사합니다!',
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    unreadCount: 0,
    userInfo: { profileImage: 'https://i.pravatar.cc/150?img=12', isOnline: true },
    feed: { id: 103, title: '애플워치 울트라2 오션밴드', price: 1249000, thumbnail: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300', likeCount: 567, commentCount: 89 }
  },
  {
    id: 4,
    name: '최유진',
    lastMessage: '착용샷 올려주셔서 도움됐어요',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    unreadCount: 0,
    userInfo: { profileImage: 'https://i.pravatar.cc/150?img=9', isOnline: false },
    feed: { id: 104, title: '아크네 머플러 그레이', price: 290000, thumbnail: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=300', likeCount: 1203, commentCount: 156 }
  },
  {
    id: 5,
    name: '정하은',
    lastMessage: '오프라인 매장에서도 살 수 있나요?',
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
    userInfo: { profileImage: 'https://i.pravatar.cc/150?img=23', isOnline: true },
    feed: { id: 105, title: '르메르 크로와상백 스몰', price: 1890000, thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300', likeCount: 2341, commentCount: 203 }
  }
]

const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  if (diff < 60000) return '방금'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const getEmptyIcon = () => activeTab.value === 'unread' ? CheckCircle : MessageCircle
const getEmptyTitle = () => {
  if (searchQuery.value) return '검색 결과 없음'
  return activeTab.value === 'unread' ? '모두 읽었습니다' : '채팅이 없습니다'
}
const getEmptyMessage = () => {
  if (searchQuery.value) return `"${searchQuery.value}"에 대한 결과가 없습니다`
  return '피드에서 대화를 시작해보세요'
}

// 마운트
onMounted(() => {
  loadChatRooms()
})
</script>

<style scoped>
.chat-container {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'SUIT-Regular', 'Noto Sans KR', sans-serif;
  color: #111827;
  -webkit-font-smoothing: antialiased;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
}

@media (min-width: 768px) {
  .header { padding: 16px 32px; }
}

.header-title { font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.02em; color: #111827; }
.header-actions { display: flex; gap: 8px; }

.icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
}

.icon-btn:hover { background: #f9fafb; }
.icon-btn.active { background: #faf5ff; border-color: #9333ea; color: #9333ea; }

/* 검색바 */
.search-wrapper {
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #f3f4f6;
}

@media (min-width: 768px) {
  .search-wrapper { padding: 12px 32px; }
}

.search-box {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 14px;
  height: 44px;
  transition: border-color 0.2s;
}

.search-box:focus-within { border-color: #9333ea; }

.search-icon { color: #9ca3af; margin-right: 10px; }

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #111827;
  outline: none;
  font-family: inherit;
}

.search-input::placeholder { color: #9ca3af; }

.clear-btn {
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
}

/* 탭 */
.tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid #f3f4f6;
  background: #ffffff;
}

@media (min-width: 768px) {
  .tabs { padding: 0 32px; }
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  cursor: pointer;
  position: relative;
  font-family: inherit;
  transition: color 0.2s;
}

.tab:hover { color: #6b7280; }
.tab.active { color: #111827; font-weight: 600; }

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: #9333ea;
  border-radius: 1px;
}

.tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #9333ea;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 채팅 리스트 */
.chat-list {
  background: #ffffff;
}

.room-list { padding: 0; }

.room-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 24px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f3f4f6;
}

@media (min-width: 768px) {
  .room-item { padding: 16px 32px; }
}

.room-item:hover { background: #f9fafb; }
.room-item.unread { background: #faf5ff; }

/* 프로필 */
.profile {
  position: relative;
  flex-shrink: 0;
}

.profile-img {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
}

.profile-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #d1d5db;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

/* 채팅 내용 */
.room-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.room-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.room-time { font-size: 12px; color: #9ca3af; }

.room-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-item.unread .room-message {
  color: #111827;
  font-weight: 500;
}

/* 피드 썸네일 */
.feed-thumb {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background: #f9fafb;
}

.feed-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feed-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.unread-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  background: #9333ea;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

/* 상태 컨테이너 */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 40px;
  text-align: center;
  background: #ffffff;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid #f3e8ff;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.state-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 8px; }
.state-text { font-size: 14px; color: #6b7280; margin: 0 0 24px; }

.btn-primary {
  padding: 10px 24px;
  background: #9333ea;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary:hover { background: #7c3aed; }

/* 토스트 */
.toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: #111827;
  color: #fff;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1001;
}

.toast.success { background: #059669; }
.toast.error { background: #dc2626; }

/* 트랜지션 */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }

.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }
</style>
