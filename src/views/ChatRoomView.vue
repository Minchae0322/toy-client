<template>
  <div class="chat-container">
    <!-- 헤더 -->
    <header class="header">
      <h1 class="header-title">메시지</h1>
      <div class="header-actions">
        <button @click="toggleSearch" class="icon-btn" :class="{ active: showSearch }">
          <Search :size="20" />
        </button>
        <button @click="showCreateModal = true" class="icon-btn primary desktop-only">
          <Plus :size="20" />
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
              placeholder="채팅방 검색..."
              class="search-input"
              @input="handleSearch"
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
              @click="handleRoomSelect(room.id)"
              class="room-item"
              :class="{ unread: room.unreadCount > 0 }"
          >
            <div class="room-avatar" :class="getRoomTypeClass(room.type)">
              <span>{{ getAvatarText(room) }}</span>
            </div>
            <div class="room-info">
              <div class="room-header">
                <h3 class="room-name">{{ room.name }}</h3>
                <span class="room-time">{{ formatTime(room.lastMessageAt) }}</span>
              </div>
              <div class="room-footer">
                <p class="room-message">{{ room.lastMessage || '메시지가 없습니다' }}</p>
                <span v-if="room.unreadCount > 0" class="unread-badge">
                  {{ room.unreadCount > 99 ? '99+' : room.unreadCount }}
                </span>
              </div>
            </div>
            <button @click.stop="toggleRoomMenu(room.id)" class="room-menu-btn">
              <MoreVertical :size="16" />
            </button>
          </div>
        </TransitionGroup>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="state-container">
        <div class="empty-icon">{{ getEmptyIcon() }}</div>
        <p class="state-title">{{ getEmptyTitle() }}</p>
        <p class="state-text">{{ getEmptyMessage() }}</p>
        <button v-if="activeTab === 'all' && !searchQuery" @click="showCreateModal = true" class="btn-primary">
          새 채팅 시작
        </button>
      </div>
    </main>

    <!-- 플로팅 버튼 (데스크톱) -->
    <button
        v-if="!loading && filteredRooms.length > 0"
        @click="showCreateModal = true"
        class="fab desktop-only"
    >
      <Plus :size="24" />
    </button>

    <!-- 생성 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
          <div class="modal">
            <div class="modal-header">
              <h2>새 채팅방</h2>
              <button @click="showCreateModal = false" class="close-btn">
                <X :size="20" />
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>채팅방 이름</label>
                <input v-model="newRoomName" type="text" placeholder="이름을 입력하세요" class="form-input" />
              </div>
              <div class="form-group">
                <label>유형</label>
                <div class="type-selector">
                  <button
                      v-for="type in roomTypes"
                      :key="type.value"
                      @click="newRoomType = type.value"
                      class="type-option"
                      :class="{ selected: newRoomType === type.value }"
                  >
                    <span class="type-icon">{{ type.icon }}</span>
                    <span>{{ type.label }}</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button @click="showCreateModal = false" class="btn-secondary">취소</button>
              <button @click="createRoom" class="btn-primary" :disabled="!newRoomName.trim()">생성</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import { Search, Plus, X, MoreVertical, AlertCircle, Check } from 'lucide-vue-next'
import { chatService } from '@/services/ChatService.js'

const emit = defineEmits(['room-selected'])

// 상태
const activeTab = ref('all')
const showSearch = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const newRoomName = ref('')
const newRoomType = ref('NORMAL')
const toast = ref({ show: false, message: '', type: 'success' })

// 채팅방 데이터
const allChatRooms = ref([])

// 탭 설정
const visibleTabs = computed(() => [
  { key: 'all', label: '전체', count: allChatRooms.value.length },
  { key: 'unread', label: '안읽음', count: allChatRooms.value.filter(r => r.unreadCount > 0).length },
  { key: 'dm', label: '1:1', count: allChatRooms.value.filter(r => r.type === 'NORMAL').length },
  { key: 'channel', label: '채널', count: allChatRooms.value.filter(r => r.type === 'CHANNEL').length },
])

const roomTypes = [
  { value: 'NORMAL', label: '1:1 채팅', icon: '👤' },
  { value: 'CHANNEL', label: '채널', icon: '📢' },
  { value: 'CUSTOMER_SUPPORT', label: '고객지원', icon: '🎧' },
]

// 필터링
const filteredRooms = computed(() => {
  let rooms = [...allChatRooms.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    rooms = rooms.filter(r =>
        r.name.toLowerCase().includes(q) || r.lastMessage?.toLowerCase().includes(q)
    )
  }

  switch (activeTab.value) {
    case 'unread':
      return rooms.filter(r => r.unreadCount > 0)
    case 'dm':
      return rooms.filter(r => r.type === 'NORMAL')
    case 'channel':
      return rooms.filter(r => r.type === 'CHANNEL')
    default:
      return rooms
  }
})

// 메서드
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) searchQuery.value = ''
}

const handleSearch = () => {}

const handleRoomSelect = (id) => emit('room-selected', id)

// ✅ API 연동된 채팅방 목록 조회
const loadChatRooms = async () => {
  loading.value = true
  error.value = ''

  try {
    console.log('📋 [ChatRoomView] 채팅방 목록 조회 시작...')

    const searchCondition = {
      status: 'ACTIVE',
      roomType: 'NORMAL'
    }

    const response = await chatService.getChatRooms(searchCondition)
    console.log('📋 [ChatRoomView] API 응답:', response)

    if (response.success && response.data) {
      const backendRooms = Array.isArray(response.data) ? response.data : []
      allChatRooms.value = backendRooms.map(room =>
          chatService.transformChatRoomResponse(room)
      )
      allChatRooms.value = chatService.sortChatRooms(allChatRooms.value, 'lastMessage')
      console.log('✅ [ChatRoomView] 채팅방 목록 로드 완료:', allChatRooms.value.length, '개')
    } else {
      throw new Error(response.message || '채팅방 목록을 불러올 수 없습니다')
    }
  } catch (err) {
    console.error('❌ [ChatRoomView] 채팅방 목록 로드 실패:', err)

    // API 실패 시 샘플 데이터로 폴백
    console.log('⚠️ [ChatRoomView] 샘플 데이터로 대체합니다')
    const sampleData = chatService.getSampleChatRooms()
    allChatRooms.value = sampleData.data.map(room =>
        chatService.transformChatRoomResponse(room)
    )

    if (import.meta.env.DEV) {
      error.value = err.message
    }
  } finally {
    loading.value = false
  }
}

// ✅ 채팅방 생성
const createRoom = async () => {
  if (!newRoomName.value.trim()) return

  try {
    const roomData = {
      title: newRoomName.value.trim(),
      roomType: newRoomType.value,
      participantUserIds: [],
      isPrivate: false
    }

    console.log('➕ [ChatRoomView] 채팅방 생성 요청:', roomData)
    const response = await chatService.createChatRoom(roomData)

    if (response.success && response.data) {
      const newRoom = chatService.transformChatRoomResponse(response.data)
      allChatRooms.value.unshift(newRoom)

      showCreateModal.value = false
      newRoomName.value = ''
      newRoomType.value = 'NORMAL'
      showToast('채팅방이 생성되었습니다', 'success')

      emit('room-selected', newRoom.id)
    } else {
      throw new Error(response.message || '채팅방 생성에 실패했습니다')
    }
  } catch (err) {
    console.error('❌ [ChatRoomView] 채팅방 생성 실패:', err)
    showToast(err.message || '채팅방 생성에 실패했습니다', 'error')
  }
}

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => toast.value.show = false, 3000)
}

const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  if (diff < 60000) return '방금'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}일`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const getAvatarText = (room) => room.name?.charAt(0) || '?'

const getRoomTypeClass = (type) => ({
  'type-normal': type === 'NORMAL',
  'type-channel': type === 'CHANNEL',
  'type-support': type === 'CUSTOMER_SUPPORT',
})

const getEmptyIcon = () => {
  const icons = { all: '💬', unread: '✅', dm: '👤', channel: '📢' }
  return icons[activeTab.value] || '💬'
}

const getEmptyTitle = () => {
  if (searchQuery.value) return '검색 결과 없음'
  const titles = {
    all: '채팅방이 없습니다',
    unread: '모두 읽었습니다',
    dm: '1:1 채팅 없음',
    channel: '채널 없음'
  }
  return titles[activeTab.value] || '채팅방 없음'
}

const getEmptyMessage = () => {
  if (searchQuery.value) return `"${searchQuery.value}"에 대한 결과가 없습니다`
  return '새로운 대화를 시작해보세요'
}

const toggleRoomMenu = (id) => console.log('Menu:', id)

// ✅ 컴포넌트 마운트 시 API 호출
onMounted(() => {
  console.log('🚀 [ChatRoomView] 컴포넌트 마운트됨')
  loadChatRooms()
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #222222;
  --secondary: #64748B;
  --accent: #9333ea;
  --bg: #FFFFFF;
  --card: #FFFFFF;
  --border: #E2E8F0;
  --hover: #F8FAFC;
}

* { box-sizing: border-box; }

.chat-container {
  width: 100%;
  min-height: 100vh;
  background: var(--bg);
  position: relative;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  color: var(--primary);
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.header-actions { display: flex; gap: 8px; }

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #f5f5f7;
  color: var(--secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover { background: #eee; }
.icon-btn.active { background: #f3e8ff; color: #9333ea; }
.icon-btn.primary { background: #9333ea; color: #fff; }
.icon-btn.primary:hover { background: #7c22ce; }

/* 검색 */
.search-wrapper { padding: 16px 0; }

.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f7;
  border-radius: 12px;
  padding: 0 16px;
  height: 48px;
}

.search-icon { color: #999; margin-right: 12px; }

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 15px;
  color: var(--primary);
  outline: none;
  font-family: inherit;
}

.search-input::placeholder { color: #999; }

.clear-btn {
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
}

/* 탭 */
.tabs {
  display: flex;
  gap: 8px;
  padding: 16px 0;
  overflow-x: auto;
  border-bottom: 1px solid var(--border);
}

.tabs::-webkit-scrollbar { display: none; }

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  background: #f5f5f7;
  color: var(--secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  font-family: inherit;
}

.tab:hover { background: #eee; }
.tab.active { background: #9333ea; color: #fff; }

.tab-badge {
  background: rgba(0,0,0,0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.tab.active .tab-badge { background: rgba(255,255,255,0.25); }

/* 채팅방 리스트 */
.chat-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
}

@media (min-width: 1024px) {
  .chat-list { padding-bottom: 20px; }
}

.room-list { padding: 8px 0; }

.room-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 8px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.room-item:hover { background: var(--hover); }
.room-item.unread { background: #faf5ff; }

.room-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.room-avatar.type-normal { background: linear-gradient(135deg, #9333ea, #a855f7); }
.room-avatar.type-channel { background: linear-gradient(135deg, #7c3aed, #9333ea); }
.room-avatar.type-support { background: linear-gradient(135deg, #a855f7, #c084fc); }

.room-info { flex: 1; min-width: 0; }

.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.room-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-time { font-size: 12px; color: #999; flex-shrink: 0; }

.room-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.room-message {
  font-size: 14px;
  color: var(--secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  background: #9333ea;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.room-menu-btn {
  border: none;
  background: none;
  color: #ccc;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  opacity: 0;
  transition: all 0.2s;
}

.room-item:hover .room-menu-btn { opacity: 1; }
.room-menu-btn:hover { background: #f0f0f0; color: var(--secondary); }

/* 상태 컨테이너 */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.loader {
  width: 36px;
  height: 36px;
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
  margin-bottom: 16px;
}

.empty-icon { font-size: 48px; margin-bottom: 16px; }
.state-title { font-size: 17px; font-weight: 600; color: var(--primary); margin: 0 0 8px; }
.state-text { font-size: 14px; color: var(--secondary); margin: 0 0 24px; }

/* 버튼 */
.btn-primary {
  padding: 12px 28px;
  background: #9333ea;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary:hover { background: #7c22ce; }
.btn-primary:disabled { background: #d8b4fe; cursor: not-allowed; }

.btn-secondary {
  padding: 12px 28px;
  background: #f5f5f7;
  color: var(--secondary);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-secondary:hover { background: #eee; }

/* FAB */
.fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  background: #9333ea;
  color: #fff;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(147, 51, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(147, 51, 234, 0.5);
}

.desktop-only { display: none; }

@media (min-width: 1024px) {
  .desktop-only { display: flex; }
}

/* 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

@media (min-width: 768px) {
  .modal-overlay { align-items: center; }
}

.modal {
  background: #fff;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
}

@media (min-width: 768px) {
  .modal { border-radius: 24px; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 { font-size: 18px; font-weight: 700; margin: 0; }

.close-btn {
  border: none;
  background: #f5f5f7;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary);
}

.modal-body { padding: 24px; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; color: #333; margin-bottom: 8px; }

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus { border-color: #9333ea; box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1); }

.type-selector { display: flex; gap: 10px; }

.type-option {
  flex: 1;
  padding: 14px 12px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--secondary);
  transition: all 0.2s;
  font-family: inherit;
}

.type-option:hover { border-color: #c4b5fd; }
.type-option.selected { border-color: #9333ea; background: #faf5ff; color: #9333ea; }
.type-icon { font-size: 24px; }

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border);
}

.modal-footer button { flex: 1; }

/* 토스트 */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: #111;
  color: #fff;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 1001;
}

.toast.success { background: #059669; }
.toast.error { background: #dc2626; }

@media (min-width: 1024px) {
  .toast { bottom: 40px; }
}

/* 트랜지션 */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }

.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }

.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: translateY(100%); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }
</style>