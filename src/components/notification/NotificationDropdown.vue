<template>
  <div class="notification-dropdown" ref="dropdownRef">
    <!-- 트리거 (벨 + 미읽음 dot) -->
    <button
      class="notification-trigger"
      @click="toggleDropdown"
      :title="`알림 ${unreadCount}개`"
      :aria-label="`알림 ${unreadCount}개`"
    >
      <Bell :size="18" :stroke-width="2" />
      <span v-if="hasUnread" class="notification-badge">
        {{ unreadCountDisplay }}
      </span>
    </button>

    <!-- 패널 -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown-panel">
        <!-- 헤더: 제목 + 모두 읽음 -->
        <header class="dropdown-header">
          <h3 class="dropdown-title">알림</h3>
          <button
            v-if="hasUnread"
            class="header-action"
            :disabled="isMarkingAllRead"
            @click="handleMarkAllAsRead"
          >
            <CheckCheck :size="14" :stroke-width="2.2" />
            <span>모두 읽음</span>
          </button>
        </header>

        <!-- 세그먼트 컨트롤 필터 -->
        <div class="filter-segment" role="tablist">
          <button
            class="seg-btn"
            :class="{ active: activeFilter === 'all' }"
            role="tab"
            :aria-selected="activeFilter === 'all'"
            @click="activeFilter = 'all'"
          >
            전체
          </button>
          <button
            class="seg-btn"
            :class="{ active: activeFilter === 'unread' }"
            role="tab"
            :aria-selected="activeFilter === 'unread'"
            @click="activeFilter = 'unread'"
          >
            <span>읽지 않음</span>
            <span v-if="hasUnread" class="seg-count">{{ unreadCountDisplay }}</span>
          </button>
        </div>

        <!-- 목록 -->
        <div class="notification-list" ref="listRef" @scroll="handleScroll">
          <!-- 로딩 -->
          <div v-if="isLoading && notifications.length === 0" class="state-block">
            <div class="state-spinner"></div>
            <p class="state-text">알림을 불러오는 중…</p>
          </div>

          <!-- 빈 상태 -->
          <div v-else-if="filteredNotifications.length === 0" class="state-block empty">
            <div class="empty-illust">
              <Bell :size="28" :stroke-width="1.6" />
            </div>
            <p class="state-title">
              {{ activeFilter === 'unread' ? '읽지 않은 알림이 없어요' : '아직 알림이 없어요' }}
            </p>
            <p class="state-text">
              {{ activeFilter === 'unread' ? '모두 확인했어요!' : '새 소식이 오면 여기에 표시돼요' }}
            </p>
          </div>

          <!-- 아이템 -->
          <template v-else>
            <button
              v-for="notification in filteredNotifications"
              :key="notification.id"
              type="button"
              class="notif-row"
              :class="{ unread: !notification.isRead }"
              @click="handleItemClick(notification)"
            >
              <span class="unread-dot" aria-hidden="true"></span>

              <span class="notif-icon" :class="getTypeClass(notification.type)">
                <component :is="getTypeIcon(notification.type)" :size="16" :stroke-width="2.2" />
              </span>

              <span class="notif-content">
                <span class="notif-title" v-html="formatTitle(notification)"></span>
                <span v-if="notification.content" class="notif-preview">{{ notification.content }}</span>
              </span>

              <span class="notif-time">{{ formatTime(notification.createdAt) }}</span>
            </button>

            <div v-if="isLoading && notifications.length > 0" class="loading-more">
              <div class="state-spinner small"></div>
            </div>

            <div v-if="!hasMore && notifications.length > 0" class="end-cap">
              모두 확인했어요
            </div>
          </template>
        </div>

        <!-- 풋터: 모두 비우기 -->
        <footer v-if="notifications.length > 0" class="dropdown-footer">
          <button class="footer-clear" @click="handleDeleteAll">
            <Trash2 :size="14" :stroke-width="2" />
            <span>모두 비우기</span>
          </button>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageCircle,
  Heart,
  UserPlus,
  MessageSquare,
  Trophy,
} from 'lucide-vue-next'
import { useNotification } from '@/composables/useNotification'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { notificationService } from '@/services/NotificationService'

const {
  notifications,
  unreadCount,
  isLoading,
  hasMore,
  hasUnread,
  sortedNotifications,
  unreadCountDisplay,
  loadMoreNotifications,
  markAllAsRead,
  deleteAllNotifications,
  handleNotificationClick,
  fetchUnreadCount,
} = useNotification()

const { open: openConfirm } = useConfirmDialog()

const isOpen = ref(false)
const dropdownRef = ref(null)
const listRef = ref(null)
const isMarkingAllRead = ref(false)
const activeFilter = ref('all')

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'unread') {
    return sortedNotifications.value.filter(n => !n.isRead)
  }
  return sortedNotifications.value
})

const getTypeIcon = (type) => {
  const iconMap = {
    'COMMENT': MessageCircle,
    'FEED_COMMENT': MessageCircle,
    'BATTLE_ITEM_COMMENT': MessageCircle,
    'LIKE': Heart,
    'FEED_LIKE': Heart,
    'FOLLOW': UserPlus,
    'CHAT': MessageSquare,
    'SYSTEM': Bell,
    'BATTLE': Trophy,
    'BATTLE_VOTE': Trophy,
  }
  return iconMap[type] || Bell
}

const getTypeClass = (type) => {
  const classMap = {
    'COMMENT': 'type-comment',
    'FEED_COMMENT': 'type-comment',
    'BATTLE_ITEM_COMMENT': 'type-comment',
    'LIKE': 'type-like',
    'FEED_LIKE': 'type-like',
    'FOLLOW': 'type-follow',
    'CHAT': 'type-chat',
    'SYSTEM': 'type-system',
    'BATTLE': 'type-battle',
    'BATTLE_VOTE': 'type-battle',
  }
  return classMap[type] || 'type-default'
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchUnreadCount()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleItemClick = async (notification) => {
  await handleNotificationClick(notification)
  closeDropdown()
}

const handleMarkAllAsRead = async () => {
  if (isMarkingAllRead.value) return
  try {
    isMarkingAllRead.value = true
    await markAllAsRead()
  } finally {
    isMarkingAllRead.value = false
  }
}

const handleDeleteAll = async () => {
  const confirmed = await openConfirm({
    type: 'danger',
    title: '모두 비우기',
    message: '모든 알림을 비울까요?\n비운 알림은 복구할 수 없어요.',
    confirmText: '비우기',
    cancelText: '취소',
  })
  if (confirmed) {
    await deleteAllNotifications()
  }
}

const handleScroll = () => {
  const el = listRef.value
  if (!el) return
  const threshold = 50
  const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  if (isNearBottom && hasMore.value && !isLoading.value) {
    loadMoreNotifications()
  }
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

const handleKeyDown = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

const formatTime = (dateString) => {
  return notificationService.formatRelativeTime(dateString)
}

const formatTitle = (notification) => {
  const title = notification.title || ''
  const actorName = notification.actor?.nickname
  if (actorName && title.includes(actorName)) {
    const escapedTitle = escapeHtml(title)
    const escapedActorName = escapeHtml(actorName)
    return escapedTitle.replace(
      escapedActorName,
      `<strong class="actor-name">${escapedActorName}</strong>`
    )
  }
  return escapeHtml(title)
}

const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.notification-dropdown {
  position: relative;
}

/* ==================== 트리거 ==================== */
.notification-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--c-text-600, #475569);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.notification-trigger:hover {
  background: var(--bg-subtle, #F7F8FA);
  color: var(--text-primary, #0A0E1A);
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--c-danger, #EF4444);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border: 2px solid var(--bg-elevated, #fff);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  letter-spacing: -0.2px;
}

/* ==================== 패널 ==================== */
.dropdown-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 380px;
  max-height: 560px;
  background: var(--bg-elevated, #ffffff);
  border: 1px solid var(--border-strong, #f1f3f6);
  border-radius: 18px;
  box-shadow:
    0 14px 36px rgba(15, 23, 42, 0.1),
    0 4px 10px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  letter-spacing: -0.2px;
}

/* ==================== 헤더 ==================== */
.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 12px 20px;
}

.dropdown-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary, #0A0E1A);
  letter-spacing: -0.4px;
}

.header-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 12px;
  background: var(--bg-subtle, #F7F8FA);
  border: none;
  border-radius: 999px;
  color: var(--c-text-600, #475569);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.header-action:hover {
  background: var(--c-brand-soft, #FAF5FF);
  color: var(--c-brand, #9333EA);
}

.header-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== 세그먼트 컨트롤 ==================== */
.filter-segment {
  display: flex;
  gap: 4px;
  margin: 0 16px 8px 16px;
  padding: 4px;
  background: var(--bg-subtle, #F7F8FA);
  border-radius: 12px;
}

.seg-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding: 0 10px;
  background: transparent;
  border: none;
  border-radius: 9px;
  color: var(--c-text-500, #64748B);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.seg-btn:hover {
  color: var(--text-primary, #0A0E1A);
}

.seg-btn.active {
  background: var(--bg-elevated, #fff);
  color: var(--text-primary, #0A0E1A);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.seg-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background: var(--c-brand, #9333EA);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 9px;
  line-height: 1;
}

/* ==================== 목록 ==================== */
.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 420px;
  padding: 4px 8px 8px 8px;
}

/* row 자체가 button — 키보드 접근성 + 클릭 영역 일관 */
.notif-row {
  width: 100%;
  display: grid;
  grid-template-columns: 8px 36px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  letter-spacing: -0.2px;
  transition: background 0.15s ease;
}

.notif-row:hover {
  background: var(--bg-subtle, #F7F8FA);
}

.notif-row:active {
  background: var(--bg-mute, #F2F4F6);
}

/* unread 좌측 보라 점 — 배경 전체 칠하지 않음 */
.unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
  justify-self: center;
}

.notif-row.unread .unread-dot {
  background: var(--c-brand, #9333EA);
}

/* 아이콘 박스 */
.notif-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-comment { background: var(--c-info-soft, #E0F2FE); color: var(--c-info, #0284C7); }
.type-like { background: var(--c-danger-soft, #FEE2E2); color: var(--c-danger, #EF4444); }
.type-follow { background: var(--c-success-soft, #DCFCE7); color: var(--c-success, #16A34A); }
.type-chat { background: var(--c-brand-soft, #FAF5FF); color: var(--c-brand, #9333EA); }
.type-system { background: var(--bg-subtle, #F7F8FA); color: var(--c-text-600, #475569); }
.type-battle { background: var(--c-warning-soft, #FEF9C3); color: var(--c-bronze, #D97706); }
.type-default { background: var(--bg-subtle, #F7F8FA); color: var(--c-text-600, #475569); }

/* 텍스트 */
.notif-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notif-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #0A0E1A);
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-row.unread .notif-title {
  font-weight: 700;
}

.notif-title :deep(.actor-name) {
  font-weight: 700;
  color: var(--text-primary, #0A0E1A);
}

.notif-preview {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-500, #64748B);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-time {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-400, #94A3B8);
  font-variant-numeric: tabular-nums;
  align-self: flex-start;
  padding-top: 2px;
}

/* ==================== 상태 ==================== */
.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  text-align: center;
}

.empty-illust {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--bg-subtle, #F7F8FA);
  color: var(--c-text-400, #94A3B8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.state-title {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #0A0E1A);
  letter-spacing: -0.3px;
}

.state-text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-500, #64748B);
}

.state-spinner {
  width: 28px;
  height: 28px;
  border: 2.5px solid var(--bg-mute, #F2F4F6);
  border-top-color: var(--c-brand, #9333EA);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-bottom: 12px;
}

.state-spinner.small {
  width: 18px;
  height: 18px;
  border-width: 2px;
  margin-bottom: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-more {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.end-cap {
  text-align: center;
  padding: 14px 16px 6px 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-400, #94A3B8);
}

/* ==================== 풋터 ==================== */
.dropdown-footer {
  display: flex;
  justify-content: center;
  padding: 10px 16px 14px 16px;
  border-top: 1px solid var(--bg-subtle, #F7F8FA);
}

.footer-clear {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  background: transparent;
  border: none;
  border-radius: 999px;
  color: var(--c-text-500, #64748B);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.footer-clear:hover {
  background: var(--c-danger-soft, #FEE2E2);
  color: var(--c-danger, #EF4444);
}

/* ==================== 트랜지션 ==================== */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

/* ==================== 모바일 ==================== */
@media (max-width: 640px) {
  .dropdown-panel {
    position: fixed;
    top: calc(60px + env(safe-area-inset-top, 0px));
    left: 12px;
    right: 12px;
    width: auto;
    max-width: none;
    max-height: calc(100vh - 100px);
    border-radius: 16px;
  }

  .dropdown-header {
    padding: 16px 18px 10px 18px;
  }

  .dropdown-title {
    font-size: 17px;
  }

  .filter-segment {
    margin: 0 14px 6px 14px;
  }

  .notification-list {
    max-height: calc(100vh - 240px);
    padding: 4px 6px 6px 6px;
  }

  .notif-row {
    padding: 11px 10px;
    grid-template-columns: 8px 34px 1fr auto;
    gap: 10px;
  }

  .notif-icon {
    width: 34px;
    height: 34px;
    border-radius: 11px;
  }

  .notif-title { font-size: 13px; }
  .notif-preview { font-size: 12px; }
  .notif-time { font-size: 11px; }
}
</style>
