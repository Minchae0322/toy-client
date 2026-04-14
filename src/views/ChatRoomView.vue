<template>
  <div class="chat-container">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-left">
        <h1 class="header-title">메시지</h1>
        <span class="header-sub">{{ allChatRooms.length }}개의 대화</span>
      </div>
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
            <!-- 피드 썸네일 (왼쪽) -->
            <div class="feed-thumb">
              <img
                  v-if="room.feed?.thumbnail"
                  :src="room.feed.thumbnail"
                  :alt="room.feed?.title"
              />
              <div v-else class="feed-thumb-placeholder">
                <ImageIcon :size="18" />
              </div>
            </div>

            <!-- 채팅 내용 -->
            <div class="room-info">
              <div class="room-header">
                <h3 class="room-name">{{ room.name }}</h3>
                <span class="room-time">{{ formatTime(room.lastMessageAt) }}</span>
              </div>
              <p v-if="room.feed?.title" class="feed-title">
                <span class="feed-title-text">{{ room.feed.title }}</span>
                <span v-if="room.feed?.price" class="feed-price">{{ formatPrice(room.feed.price) }}</span>
              </p>
              <div class="room-footer">
                <p class="room-message">{{ room.lastMessage || '메시지가 없습니다' }}</p>
                <span v-if="room.unreadCount > 0" class="unread-badge">
                  {{ room.unreadCount > 99 ? '99+' : room.unreadCount }}
                </span>
              </div>
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
import { Search, X, AlertCircle, Check, ImageIcon, MessageCircle, CheckCircle } from 'lucide-vue-next'
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

const formatPrice = (price) => {
  if (!price) return ''
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

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
  background: #f5f3fb;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  color: #111827;
  -webkit-font-smoothing: antialiased;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  background: #ffffff;
  border-bottom: 1px solid #eee9f8;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.03em;
  color: #111827;
}

.header-sub {
  font-size: 12px;
  color: #a78bfa;
  font-weight: 500;
}

.header-actions { display: flex; gap: 8px; }

.icon-btn {
  width: 38px;
  height: 38px;
  border: 1.5px solid #ede9f8;
  background: #faf8ff;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  transition: all 0.18s;
}

.icon-btn:hover { background: #f3e8ff; border-color: #c4b5fd; }
.icon-btn.active { background: #f3e8ff; border-color: #9333ea; color: #9333ea; }

/* 검색바 */
.search-wrapper {
  padding: 10px 16px;
  background: #ffffff;
  border-bottom: 1px solid #eee9f8;
}

.search-box {
  display: flex;
  align-items: center;
  background: #faf8ff;
  border: 1.5px solid #ede9f8;
  border-radius: 10px;
  padding: 0 14px;
  height: 42px;
  transition: all 0.18s;
}

.search-box:focus-within { border-color: #9333ea; background: #fff; box-shadow: 0 0 0 3px rgba(147,51,234,0.08); }
.search-icon { color: #a78bfa; margin-right: 10px; flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #111827;
  outline: none;
  font-family: inherit;
}

.search-input::placeholder { color: #c4b5fd; }

.clear-btn {
  border: none;
  background: none;
  color: #a78bfa;
  cursor: pointer;
  padding: 4px;
  display: flex;
}

/* 탭 */
.tabs {
  display: flex;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #eee9f8;
  gap: 4px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #b0a8c8;
  cursor: pointer;
  position: relative;
  font-family: inherit;
  transition: color 0.18s;
}

.tab:hover { color: #7c3aed; }
.tab.active { color: #7c3aed; font-weight: 700; }

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 14px;
  right: 14px;
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
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 채팅 리스트 */
.chat-list {
  padding: 14px 14px 28px;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.room-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  background: #ffffff;
  border-radius: 16px;
  border: 1.5px solid #ede9f8;
  box-shadow: 0 1px 4px rgba(147, 51, 234, 0.05);
  transition: all 0.18s;
}

.room-item:hover {
  background: #faf7ff;
  border-color: #c4b5fd;
  box-shadow: 0 4px 16px rgba(147, 51, 234, 0.1);
  transform: translateY(-1px);
}

.room-item.unread {
  background: #faf7ff;
  border-color: #c4b5fd;
  box-shadow: inset 3px 0 0 #9333ea, 0 1px 6px rgba(147, 51, 234, 0.08);
}

.room-item.unread:hover {
  box-shadow: inset 3px 0 0 #9333ea, 0 4px 16px rgba(147, 51, 234, 0.12);
}

/* 피드 썸네일 */
.feed-thumb {
  width: 62px;
  height: 62px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #ede9f8;
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
  background: #f5f3fb;
  color: #c4b5fd;
}

/* 채팅 내용 */
.room-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 1px;
}

.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.room-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-time {
  font-size: 11px;
  color: #c4b5fd;
  font-weight: 500;
  flex-shrink: 0;
}

.feed-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  min-width: 0;
}

.feed-title-text {
  font-size: 12px;
  color: #8b5cf6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.feed-price {
  font-size: 11px;
  background: #f3e8ff;
  color: #9333ea;
  padding: 1px 7px;
  border-radius: 6px;
  font-weight: 700;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

.room-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 1px;
}

.room-message {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.room-item.unread .room-name { color: #1a1040; }
.room-item.unread .room-time { color: #9333ea; }

.room-item.unread .room-message {
  color: #374151;
  font-weight: 600;
}

.unread-badge {
  flex-shrink: 0;
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
  padding: 100px 40px;
  text-align: center;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid #f3e8ff;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-circle {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #f3e8ff;
  color: #a78bfa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.state-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 6px; }
.state-text { font-size: 14px; color: #9ca3af; margin: 0 0 24px; }

.btn-primary {
  padding: 10px 24px;
  background: #9333ea;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
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
  background: #1a1040;
  color: #fff;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  z-index: 1001;
}

.toast.success { background: #059669; }
.toast.error { background: #dc2626; }

/* 트랜지션 */
.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

.list-enter-active, .list-leave-active { transition: all 0.25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-16px); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 16px); }
</style>
