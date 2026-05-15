<template>
  <div class="chat-container">
    <div class="content-inner">
      <!-- 컨트롤: 탭 + 검색 버튼 -->
      <section class="control-bar">
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
        <button @click="toggleSearch" class="icon-btn" :class="{ active: showSearch }" aria-label="검색">
          <Search :size="18" />
        </button>
      </section>

      <Transition name="search-expand">
        <div v-if="showSearch" class="search-wrapper">
          <div class="search-box">
            <Search :size="18" class="search-icon" />
            <input
                v-model="searchQuery"
                type="text"
                placeholder="닉네임, 메시지, 상품으로 검색"
                class="search-input"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
              <X :size="16" />
            </button>
          </div>
        </div>
      </Transition>

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
          <div class="list-header">
            <span class="list-header-title">{{ activeTab === 'unread' ? '안읽은 대화' : '대화 목록' }}</span>
            <span class="list-header-count">{{ filteredRooms.length }}</span>
          </div>

          <TransitionGroup name="list" tag="div" class="room-list-body">
            <div
                v-for="room in filteredRooms"
                :key="room.id"
                @click="goToChatDetail(room.id)"
                class="room-item"
                :class="{ unread: room.unreadCount > 0 }"
            >
              <!-- 썸네일 + 온라인 인디케이터 -->
              <div class="room-thumb-wrap">
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
                <span v-if="room.unreadCount > 0" class="unread-dot" aria-hidden="true"></span>
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
                  <span class="feed-title-text">{{ room.feed.title }}</span>
                </p>
              </div>

              <!-- 우측 chevron -->
              <ChevronRight :size="18" class="room-chevron" />
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
    </div>

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
import { Search, X, AlertCircle, Check, MessageCircle, CheckCircle, ChevronRight } from 'lucide-vue-next'
import { chatService } from '@/services/ChatService.js'
import { useUserBlock } from '@/composables/useUserBlock.js'

const router = useRouter()
const { isBlocked } = useUserBlock()

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
  // 차단된 상대와의 1:1 방은 제외
  let rooms = allChatRooms.value.filter(r => !isBlocked(r.participantUserId))

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
  // 1:1 채팅의 상대 userId (차단 필터링용)
  participantUserId: room.participantUserId || room.participantId || room.targetUserId || room.otherUserId || null,
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
/* 전체 컨테이너 (디자인 시스템: 배경은 흰색, 카드가 자체 컬러) */
.chat-container {
  width: 100%;
  /* 헤더(66px + safe-area-top)와 BottomNavigation(약 84px + safe-area-bottom) 사이의
     가시 영역을 채워 빈 상태에서 불필요한 페이지 스크롤이 생기지 않도록. */
  min-height: calc(100dvh - 66px - env(safe-area-inset-top));
  background: var(--bg-elevated);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

/* content-inner — AppSidebar와 붙어 시작하도록 left-align */
.content-inner {
  max-width: 100%;
  margin: 0;
  padding: 24px 16px 0;
}

@media (min-width: 768px) {
  .content-inner { max-width: 720px; padding: 28px 0 0; }
}

@media (min-width: 1280px) {
  .content-inner { max-width: 820px; padding: 32px 0 0; }
}

.icon-btn {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-strong);
  background: var(--bg-elevated);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-600);
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.icon-btn:hover {
  color: var(--text-primary);
  border-color: var(--c-text-300);
  background: var(--bg-subtle);
}
.icon-btn.active {
  background: var(--c-brand);
  color: #ffffff;
  border-color: var(--c-brand);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.28);
}

/* ============ 컨트롤 바: 탭 + 검색 버튼 (가로 배치) ============ */
.control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.search-wrapper { margin-bottom: 14px; }

.tabs {
  display: flex;
  background: var(--bg-mute);
  border-radius: 12px;
  padding: 4px;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c-text-400);
  cursor: pointer;
  font-family: inherit;
  border-radius: 8px;
  transition: all 0.18s ease;
  letter-spacing: -0.02em;
}

.tab:hover:not(.active) { color: var(--c-text-600); }

.tab.active {
  color: var(--text-primary);
  background: var(--bg-elevated);
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.tab-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 7px;
  background: var(--border-strong);
  color: var(--c-text-400);
  font-size: 11px;
  font-weight: 800;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.02em;
}

.tab.active .tab-badge {
  background: var(--c-brand);
  color: #ffffff;
}

/* 검색바 */
.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 0 14px;
  height: 44px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-box:focus-within {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}
.search-icon { color: var(--c-text-400); margin-right: 10px; flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
  letter-spacing: -0.01em;
}

.search-input::placeholder { color: var(--c-text-400); }

.clear-btn {
  border: none;
  background: none;
  color: var(--c-text-400);
  cursor: pointer;
  padding: 4px;
  display: flex;
  border-radius: 6px;
}

.clear-btn:hover { color: var(--c-text-600); background: var(--bg-mute); }

/* 검색 expand 트랜지션 */
.search-expand-enter-active, .search-expand-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.search-expand-enter-from, .search-expand-leave-to { opacity: 0; max-height: 0; transform: translateY(-4px); }
.search-expand-enter-to, .search-expand-leave-from { opacity: 1; max-height: 60px; transform: translateY(0); }

/* ============ 채팅 리스트 ============ */
.chat-list { padding: 0; }

.room-list {
  display: flex;
  flex-direction: column;
  background: var(--bg-elevated);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--border-default);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
}

.list-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 28px;
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border-default);
}

.list-header-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--c-text-600);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.list-header-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  color: var(--c-text-600);
  font-size: 11px;
  font-weight: 800;
  border-radius: 10px;
  font-variant-numeric: tabular-nums;
}

.room-list-body { display: flex; flex-direction: column; }

.room-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 28px;
  cursor: pointer;
  background: var(--bg-elevated);
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
  background: var(--border-default);
}

.room-item:hover { background: var(--bg-subtle); }
.room-item:hover .room-chevron { color: var(--c-brand); transform: translateX(2px); }
.room-item:active { background: var(--c-brand-soft); }

.room-chevron {
  color: var(--c-text-300);
  flex-shrink: 0;
  transition: transform 0.15s ease, color 0.15s ease;
}

/* 썸네일 wrap (+ unread dot) */
.room-thumb-wrap {
  position: relative;
  flex-shrink: 0;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: var(--c-brand);
  border: 2.5px solid var(--bg-elevated);
  border-radius: 50%;
  pointer-events: none;
}

/* 썸네일 — PC 기준 */
.room-thumb {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-subtle);
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
  background: var(--c-brand-soft);
  color: var(--c-brand);
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
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.room-time {
  font-size: 12px;
  color: var(--c-text-400);
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
  color: var(--c-text-500);
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
  gap: 8px;
  margin: 8px 0 0;
  min-width: 0;
}

.feed-label {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--c-brand);
  background: var(--c-brand-soft);
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.feed-title-text {
  font-size: 12px;
  color: var(--c-text-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* 안읽음 상태 — 메시지·시간 진하게 */
.room-item.unread .room-message {
  color: var(--text-primary);
  font-weight: 600;
}

.room-item.unread .room-time {
  color: var(--c-brand);
  font-weight: 700;
}

.unread-badge {
  flex-shrink: 0;
  min-width: 22px;
  height: 22px;
  background: var(--c-brand);
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
  background: var(--bg-elevated);
  border-radius: 20px;
  border: 1px solid var(--border-default);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-mute);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-circle {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--c-danger-soft);
  color: var(--c-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.state-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; }
.state-text { font-size: 14px; color: var(--c-text-400); margin: 0 0 24px; }

.btn-primary {
  padding: 10px 24px;
  background: var(--c-brand);
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

.btn-primary:hover { background: var(--c-brand-hover); }

/* 토스트 */
.toast {
  position: fixed;
  /* iOS 홈 인디케이터 회피 */
  bottom: calc(40px + env(safe-area-inset-bottom));
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
.toast.error { background: var(--c-danger); }

/* 트랜지션 */
.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

.list-enter-active, .list-leave-active { transition: all 0.25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-16px); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 16px); }

/* ============ 모바일 adaptation ============ */
@media (max-width: 1023px) {
  .room-list { border-radius: 16px; }
  .list-header { padding: 14px 20px; }
  .room-item { padding: 16px 20px; gap: 14px; }
  .room-item + .room-item::before { left: 88px; right: 20px; }
  .room-thumb { width: 52px; height: 52px; border-radius: 14px; }
  .state-container { padding: 80px 32px; border-radius: 16px; }
}

@media (max-width: 480px) {
  .icon-btn { width: 40px; height: 40px; }
  .tab { padding: 10px 12px; font-size: 13px; }
  .room-list { border-radius: 14px; }
  .list-header { padding: 12px 16px; }
  .list-header-title { font-size: 11.5px; }
  .room-item { padding: 14px 16px; gap: 12px; }
  .room-item + .room-item::before { left: 76px; right: 16px; }
  .room-thumb { width: 48px; height: 48px; border-radius: 12px; }
  .room-name { font-size: 15px; }
  .room-message { font-size: 13px; }
  .room-chevron { display: none; }
  .state-container { padding: 60px 24px; }
}
</style>
