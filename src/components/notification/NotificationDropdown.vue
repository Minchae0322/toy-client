<template>
  <div class="notification-dropdown" ref="dropdownRef">
    <!-- 알림 버튼 (배지 포함) -->
    <button
      class="notification-trigger"
      @click="toggleDropdown"
      :title="`알림 ${unreadCount}개`"
    >
      <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="hasUnread" class="notification-badge">
        {{ unreadCountDisplay }}
      </span>
    </button>

    <!-- 드롭다운 패널 -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown-panel">
        <!-- 헤더 -->
        <div class="dropdown-header">
          <div class="header-top">
            <h3 class="dropdown-title">알림</h3>
            <div class="dropdown-actions">
              <button
                v-if="hasUnread"
                @click="handleMarkAllAsRead"
                class="action-btn"
                title="전체 읽음"
                :disabled="isMarkingAllRead"
              >
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span class="action-text">모두 읽음</span>
              </button>
              <button
                v-if="notifications.length > 0"
                @click="handleDeleteAll"
                class="action-btn danger"
                title="전체 삭제"
              >
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span class="action-text">전체 삭제</span>
              </button>
              <button
                @click="closeDropdown"
                class="action-btn close"
                title="닫기"
              >
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <!-- 읽지 않은 알림 수 안내 -->
          <p v-if="hasUnread" class="unread-summary">
            읽지 않은 알림 {{ unreadCountDisplay }}개
          </p>
          <!-- 필터 탭 -->
          <div class="filter-tabs">
            <button
              class="filter-tab"
              :class="{ active: activeFilter === 'all' }"
              @click="activeFilter = 'all'"
            >
              전체
            </button>
            <button
              class="filter-tab"
              :class="{ active: activeFilter === 'unread' }"
              @click="activeFilter = 'unread'"
            >
              읽지 않음
              <span v-if="hasUnread" class="tab-count">{{ unreadCountDisplay }}</span>
            </button>
          </div>
        </div>

        <!-- 알림 목록 -->
        <div class="notification-list" ref="listRef" @scroll="handleScroll">
          <!-- 로딩 상태 (초기) -->
          <div v-if="isLoading && notifications.length === 0" class="loading-state">
            <div class="loading-spinner"></div>
            <span class="loading-text">알림을 불러오는 중...</span>
          </div>

          <!-- 빈 상태 -->
          <div v-else-if="filteredNotifications.length === 0" class="empty-state">
            <div class="empty-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <p class="empty-title">
              {{ activeFilter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다' }}
            </p>
            <p class="empty-desc">
              {{ activeFilter === 'unread' ? '모든 알림을 확인했습니다' : '새로운 소식이 있으면 여기에 표시됩니다' }}
            </p>
          </div>

          <!-- 알림 아이템 목록 -->
          <template v-else>
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.isRead }"
              @click="handleItemClick(notification)"
            >
              <!-- 타입 아이콘 -->
              <div class="notification-icon-wrapper" :class="getTypeClass(notification.type)">
                <component :is="getTypeIcon(notification.type)" class="type-icon" />
              </div>

              <!-- 알림 내용 -->
              <div class="notification-content">
                <p class="notification-title" v-html="formatTitle(notification)"></p>
                <p class="notification-body">{{ notification.content }}</p>
                <div class="notification-meta">
                  <span class="notification-type-label">{{ getTypeLabel(notification.type) }}</span>
                  <span class="meta-separator"></span>
                  <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
              </div>

              <!-- 삭제 버튼 -->
              <button
                class="delete-btn"
                @click.stop="handleRemove(notification.id)"
                title="삭제"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- 더 보기 로딩 -->
            <div v-if="isLoading && notifications.length > 0" class="loading-more">
              <div class="loading-spinner small"></div>
            </div>

            <!-- 더 이상 알림 없음 -->
            <div v-if="!hasMore && notifications.length > 0" class="no-more">
              모든 알림을 확인했습니다
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, h } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { notificationService } from '@/services/NotificationService'

// Composables
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
  removeNotification,
  deleteAllNotifications,
  handleNotificationClick,
  fetchUnreadCount
} = useNotification()

const { open: openConfirm } = useConfirmDialog()

// 로컬 상태
const isOpen = ref(false)
const dropdownRef = ref(null)
const listRef = ref(null)
const isMarkingAllRead = ref(false)
const activeFilter = ref('all')

// ==================== 필터링된 알림 목록 ====================

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'unread') {
    return sortedNotifications.value.filter(n => !n.isRead)
  }
  return sortedNotifications.value
})

// ==================== 타입별 아이콘 ====================

const IconComment = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
    ])
  }
}

const IconHeart = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })
    ])
  }
}

const IconUser = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: '12', cy: '7', r: '4' })
    ])
  }
}

const IconMessage = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
      h('polyline', { points: '22,6 12,13 2,6' })
    ])
  }
}

const IconBell = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
      h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
    ])
  }
}

const IconStar = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
    ])
  }
}

const getTypeIcon = (type) => {
  const iconMap = {
    'COMMENT': IconComment,
    'FEED_COMMENT': IconComment,
    'LIKE': IconHeart,
    'FEED_LIKE': IconHeart,
    'FOLLOW': IconUser,
    'CHAT': IconMessage,
    'SYSTEM': IconBell,
    'BATTLE': IconStar,
    'BATTLE_VOTE': IconStar
  }
  return iconMap[type] || IconBell
}

const getTypeClass = (type) => {
  const classMap = {
    'COMMENT': 'type-comment',
    'FEED_COMMENT': 'type-comment',
    'LIKE': 'type-like',
    'FEED_LIKE': 'type-like',
    'FOLLOW': 'type-follow',
    'CHAT': 'type-chat',
    'SYSTEM': 'type-system',
    'BATTLE': 'type-battle',
    'BATTLE_VOTE': 'type-battle'
  }
  return classMap[type] || 'type-default'
}

const getTypeLabel = (type) => {
  const labelMap = {
    'COMMENT': '댓글',
    'FEED_COMMENT': '피드 댓글',
    'LIKE': '좋아요',
    'FEED_LIKE': '피드 좋아요',
    'FOLLOW': '팔로우',
    'CHAT': '채팅',
    'SYSTEM': '시스템',
    'BATTLE': '배틀',
    'BATTLE_VOTE': '배틀 투표'
  }
  return labelMap[type] || '알림'
}

// ==================== 드롭다운 토글 ====================

const toggleDropdown = () => {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    fetchUnreadCount()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

// ==================== 이벤트 핸들러 ====================

const handleItemClick = async (notification) => {
  await handleNotificationClick(notification)
  closeDropdown()
}

const handleRemove = (notificationId) => {
  removeNotification(notificationId)
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
    title: '전체 삭제',
    message: '모든 알림을 삭제하시겠습니까?\n삭제된 알림은 복구할 수 없습니다.',
    confirmText: '삭제',
    cancelText: '취소'
  })

  if (confirmed) {
    await deleteAllNotifications()
  }
}

// ==================== 무한 스크롤 ====================

const handleScroll = () => {
  const el = listRef.value
  if (!el) return

  const threshold = 50
  const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold

  if (isNearBottom && hasMore.value && !isLoading.value) {
    loadMoreNotifications()
  }
}

// ==================== 외부 클릭 감지 ====================

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// ==================== 키보드 이벤트 ====================

const handleKeyDown = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

// ==================== 유틸리티 ====================

const formatTime = (dateString) => {
  return notificationService.formatRelativeTime(dateString)
}

const formatTitle = (notification) => {
  const title = notification.title || ''
  const actorName = notification.actor?.nickname

  if (actorName && title.includes(actorName)) {
    // actorName을 bold 처리 (XSS 방지를 위해 escape 처리)
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

// ==================== 라이프사이클 ====================

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

/* 트리거 버튼 */
.notification-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: #FAF5FF;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.notification-trigger:hover {
  background: #9933EA;
}

.notification-icon {
  width: 20px;
  height: 20px;
  color: #9933EA;
  transition: color 0.15s ease;
}

.notification-trigger:hover .notification-icon {
  color: #ffffff;
}

/* 배지 */
.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #dc2626;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border: 2px solid #ffffff;
}

/* 드롭다운 패널 */
.dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 400px;
  max-height: 560px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

/* 헤더 */
.dropdown-header {
  padding: 0;
  border-bottom: 1px solid #e5e5e5;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0 20px;
}

.dropdown-title {
  font-size: 18px;
  font-weight: 700;
  color: #171717;
  margin: 0;
  letter-spacing: -0.02em;
}

.dropdown-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
  color: #525252;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #d4d4d4;
  color: #262626;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn.danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.action-btn.close {
  padding: 6px;
  border: none;
  background: #f5f5f5;
}

.action-btn.close:hover {
  background: #e5e5e5;
  color: #171717;
}

.action-icon {
  width: 14px;
  height: 14px;
}

.action-text {
  display: inline;
}

/* 읽지 않은 알림 수 안내 */
.unread-summary {
  margin: 8px 20px 0 20px;
  font-size: 13px;
  font-weight: 500;
  color: #9333EA;
}

/* 필터 탭 */
.filter-tabs {
  display: flex;
  gap: 0;
  padding: 0 20px;
  margin-top: 12px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  background: none;
  color: #737373;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.15s ease;
}

.filter-tab:hover {
  color: #262626;
}

.filter-tab.active {
  color: #171717;
  font-weight: 600;
}

.filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: #171717;
  border-radius: 1px;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #9333EA;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  line-height: 1;
}

/* 알림 목록 */
.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 420px;
}

/* 알림 아이템 */
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
  border-bottom: 1px solid #f5f5f5;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-item.unread {
  background: #FAF5FF;
}

.notification-item.unread:hover {
  background: #F3E8FF;
}

/* 타입 아이콘 */
.notification-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon-wrapper .type-icon {
  width: 18px;
  height: 18px;
}

.type-comment {
  background: #EFF6FF;
  color: #2563EB;
}

.type-like {
  background: #FEF2F2;
  color: #DC2626;
}

.type-follow {
  background: #F0FDF4;
  color: #16A34A;
}

.type-chat {
  background: #FAF5FF;
  color: #9333EA;
}

.type-system {
  background: #F5F5F5;
  color: #525252;
}

.type-battle {
  background: #FFFBEB;
  color: #D97706;
}

.type-default {
  background: #F5F5F5;
  color: #525252;
}

/* 알림 내용 */
.notification-content {
  flex: 1;
  min-width: 0;
  padding-right: 28px;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #171717;
  margin: 0 0 3px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-title :deep(.actor-name) {
  font-weight: 700;
  color: #171717;
}

.notification-item.unread .notification-title {
  font-weight: 600;
}

.notification-item.unread .notification-title :deep(.actor-name) {
  font-weight: 800;
}

.notification-body {
  font-size: 13px;
  color: #525252;
  margin: 0 0 6px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 알림 메타 정보 (타입 라벨 + 시간) */
.notification-meta {
  display: flex;
  align-items: center;
  gap: 0;
  font-size: 12px;
  line-height: 1;
}

.notification-type-label {
  color: #9333EA;
  font-weight: 600;
}

.notification-type-label::before {
  content: '[';
}

.notification-type-label::after {
  content: ']';
}

.meta-separator {
  display: inline-block;
  width: 3px;
  height: 3px;
  background: #d4d4d4;
  border-radius: 50%;
  margin: 0 8px;
}

.notification-time {
  color: #a3a3a3;
}

/* 삭제 버튼 */
.delete-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #d4d4d4;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s ease;
}

.delete-btn svg {
  width: 14px;
  height: 14px;
}

.notification-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* 빈 상태 */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.empty-icon-wrapper {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #d4d4d4;
}

.empty-icon-wrapper svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #525252;
  margin: 0 0 4px 0;
}

.empty-desc {
  font-size: 13px;
  color: #a3a3a3;
  margin: 0;
}

/* 로딩 */
.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e5e5;
  border-top-color: #9333EA;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin-bottom: 0;
}

.loading-text {
  font-size: 13px;
  color: #a3a3a3;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.no-more {
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: #a3a3a3;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 애니메이션 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .dropdown-panel {
    position: fixed;
    top: 66px;
    left: auto;
    right: 8px;
    width: calc(100vw - 16px);
    max-width: 380px;
    max-height: calc(100vh - 80px);
    border-radius: 12px;
  }

  .header-top {
    padding: 14px 16px 0 16px;
  }

  .dropdown-title {
    font-size: 16px;
  }

  .unread-summary {
    margin: 6px 16px 0 16px;
    font-size: 12px;
  }

  .filter-tabs {
    padding: 0 16px;
    margin-top: 10px;
  }

  .filter-tab {
    padding: 8px 12px;
    font-size: 12px;
  }

  .notification-item {
    padding: 12px 16px;
    gap: 12px;
  }

  .notification-icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .notification-icon-wrapper .type-icon {
    width: 16px;
    height: 16px;
  }

  .notification-title {
    font-size: 13px;
  }

  .notification-body {
    font-size: 12px;
  }

  .notification-meta {
    font-size: 11px;
  }

  .action-text {
    display: none;
  }

  .action-btn {
    padding: 6px 8px;
  }

  /* 모바일에서는 삭제 버튼 항상 표시 */
  .delete-btn {
    opacity: 0.6;
  }
}
</style>
