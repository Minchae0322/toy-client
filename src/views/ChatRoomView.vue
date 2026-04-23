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
            <!-- 썸네일 (피드 또는 fallback) -->
            <div class="room-thumb">
              <img
                  v-if="room.feed?.thumbnail"
                  :src="room.feed.thumbnail"
                  :alt="room.feed?.title"
              />
              <div v-else class="room-thumb-fallback">
                <MessageCircle :size="22" />
              </div>
            </div>

            <!-- 채팅 내용 -->
            <div class="room-info">
              <div class="room-top">
                <h3 class="room-name">{{ room.name }}</h3>
                <span class="room-time">{{ formatTime(room.lastMessageAt) }}</span>
              </div>
              <div class="room-bottom">
                <p class="room-message">{{ room.lastMessage || '대화를 시작해보세요' }}</p>
                <span v-if="room.unreadCount > 0" class="unread-badge">
                  {{ room.unreadCount > 99 ? '99+' : room.unreadCount }}
                </span>
              </div>
              <p v-if="room.feed?.title" class="feed-context">
                <span class="feed-label">관련 상품</span>
                <span class="feed-dot">·</span>
                <span class="feed-title-text">{{ room.feed.title }}</span>
              </p>
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
  // 백엔드가 lastMessage를 문자열(신규) 또는 {content, createdAt}(구)로 보낼 수 있음
  lastMessage: typeof room.lastMessage === 'string'
    ? room.lastMessage
    : (room.lastMessage?.content || room.lastMessageContent),
  lastMessageAt: (typeof room.lastMessage === 'object' ? room.lastMessage?.createdAt : null) || room.lastMessageAt,
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
/* 전체 컨테이너 — PC 기준 (디자인 시스템: 배경은 흰색, 카드가 자체 컬러) */
.chat-container {
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  color: #0A0E1A;
  -webkit-font-smoothing: antialiased;
}

.chat-container > * {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

/* 헤더 — PC 기준 */
.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 44px 0 24px;
  background: #FFFFFF;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.header-title {
  font-size: 30px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.04em;
  color: #0A0E1A;
  line-height: 1.15;
}

.header-sub {
  font-size: 13px;
  color: #8B95A1;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.header-actions { display: flex; gap: 10px; }

.icon-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: #ffffff;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4E5968;
  transition: all 0.15s ease;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.04);
}

.icon-btn:hover {
  color: #0A0E1A;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.06);
}
.icon-btn.active {
  background: #9333EA;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.28);
}

/* 검색바 — PC 기준 */
.search-wrapper {
  padding: 0 0 16px;
  background: #FFFFFF;
}

.search-box {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: none;
  border-radius: 14px;
  padding: 0 18px;
  height: 52px;
  transition: box-shadow 0.15s ease;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.05);
}

.search-box:focus-within {
  box-shadow: 0 0 0 2px #9333EA;
}
.search-icon { color: #8B95A1; margin-right: 12px; flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 15px;
  color: #0A0E1A;
  outline: none;
  font-family: inherit;
  letter-spacing: -0.01em;
}

.search-input::placeholder { color: #8B95A1; }

.clear-btn {
  border: none;
  background: none;
  color: #8B95A1;
  cursor: pointer;
  padding: 4px;
  display: flex;
  border-radius: 6px;
}

.clear-btn:hover { color: #4E5968; background: #F2F4F6; }

/* 탭 — Login 스타일 segmented pill (PC 기준) */
.tabs {
  display: flex;
  margin: 0 0 20px;
  background: #F2F4F6;
  border-radius: 14px;
  padding: 5px;
  gap: 2px;
}

.tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #8B95A1;
  cursor: pointer;
  font-family: inherit;
  border-radius: 10px;
  transition: all 0.18s ease;
  letter-spacing: -0.02em;
}

.tab:hover:not(.active) { color: #4E5968; }

.tab.active {
  color: #0A0E1A;
  background: #ffffff;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.tab-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 7px;
  background: #E5E7EB;
  color: #8B95A1;
  font-size: 11px;
  font-weight: 800;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.02em;
}

.tab.active .tab-badge {
  background: #9333EA;
  color: #ffffff;
}

/* 채팅 리스트 — PC 기준 */
.chat-list {
  padding: 0 0 48px;
}

.room-list {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #F1F3F6;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
}

.room-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 28px;
  cursor: pointer;
  background: #ffffff;
  transition: background 0.15s ease;
  position: relative;
}

.room-item + .room-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 102px;
  right: 28px;
  height: 1px;
  background: #F1F3F6;
}

.room-item:hover {
  background: #FAFAFB;
}

.room-item:active {
  background: #F3E8FF;
}

/* 썸네일 — PC 기준 */
.room-thumb {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  background: #F7F8FA;
  position: relative;
}

.room-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FAF5FF;
  color: #9333EA;
}

.room-item.unread .room-thumb {
  box-shadow: 0 0 0 2px #9333EA;
}

/* 채팅 내용 */
.room-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.room-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.room-name {
  font-size: 16px;
  font-weight: 700;
  color: #0A0E1A;
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.room-time {
  font-size: 12px;
  color: #94A3B8;
  font-weight: 500;
  flex-shrink: 0;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.room-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.room-message {
  font-size: 14px;
  color: #64748B;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.feed-context {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 4px 0 0;
  min-width: 0;
}

.feed-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #9333EA;
  background: #FAF5FF;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}

.feed-dot {
  color: #CBD5E1;
  font-size: 10px;
  flex-shrink: 0;
}

.feed-title-text {
  font-size: 11.5px;
  color: #94A3B8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* 안읽음 상태 — 메시지·시간 진하게 */
.room-item.unread .room-message {
  color: #0A0E1A;
  font-weight: 600;
}

.room-item.unread .room-time {
  color: #9333EA;
  font-weight: 700;
}

.unread-badge {
  flex-shrink: 0;
  min-width: 22px;
  height: 22px;
  background: #9333EA;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  box-shadow: 0 2px 6px rgba(147, 51, 234, 0.25);
}

/* 상태 컨테이너 — 리스트와 같은 카드 톤 */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 40px;
  text-align: center;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #F1F3F6;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid #f2f2f7;
  border-top-color: #1a1a1c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-circle {
  width: 56px;
  height: 56px;
  border-radius: 14px;
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
  border-radius: 18px;
  background: #FAF5FF;
  color: #9333EA;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.state-title { font-size: 16px; font-weight: 700; color: #1a1a1c; margin: 0 0 6px; }
.state-text { font-size: 14px; color: #8e8e93; margin: 0 0 24px; }

.btn-primary {
  padding: 10px 24px;
  background: #9333EA;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.28);
}

.btn-primary:hover { background: #7C3AED; }

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
  background: #1a1a1c;
  color: #ffffff;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  z-index: 1001;
}

.toast.success { background: #1a1a1c; }
.toast.error { background: #dc2626; }

/* 트랜지션 */
.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

.list-enter-active, .list-leave-active { transition: all 0.25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-16px); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 16px); }

/* 모바일/태블릿 adaptation (PC 기준을 좁힘) */
@media (max-width: 1023px) {
  .chat-container > * { padding-left: 20px; padding-right: 20px; }
  .header { padding: 32px 0 20px; }
  .header-title { font-size: 26px; }
  .room-list { border-radius: 16px; }
  .room-item { padding: 16px 20px; gap: 14px; }
  .room-item + .room-item::before { left: 88px; right: 20px; }
  .room-thumb { width: 52px; height: 52px; border-radius: 14px; }
  .state-container { padding: 80px 32px; border-radius: 16px; }
}

@media (max-width: 480px) {
  .chat-container > * { padding-left: 16px; padding-right: 16px; }
  .header { padding: 24px 0 16px; }
  .header-title { font-size: 22px; }
  .header-sub { font-size: 12px; }
  .icon-btn { width: 40px; height: 40px; }
  .search-box { height: 44px; padding: 0 14px; border-radius: 12px; }
  .search-input { font-size: 14px; }
  .tabs { margin: 0 0 14px; border-radius: 12px; padding: 4px; }
  .tab { font-size: 13px; padding: 10px 12px; }
  .chat-list { padding: 0 0 32px; }
  .room-list { border-radius: 14px; }
  .room-item { padding: 14px 16px; gap: 12px; }
  .room-item + .room-item::before { left: 76px; right: 16px; }
  .room-thumb { width: 48px; height: 48px; border-radius: 12px; }
  .room-name { font-size: 15px; }
  .room-message { font-size: 13px; }
  .state-container { padding: 60px 24px; }
}
</style>
