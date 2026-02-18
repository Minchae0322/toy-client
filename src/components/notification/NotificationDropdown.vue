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
              전체 읽음
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
            </button>
          </div>
        </div>

        <!-- 알림 목록 -->
        <div class="notification-list" ref="listRef" @scroll="handleScroll">
          <!-- 로딩 상태 (초기) -->
          <div v-if="isLoading && notifications.length === 0" class="loading-state">
            <div class="loading-spinner"></div>
            <span>알림을 불러오는 중...</span>
          </div>

          <!-- 빈 상태 -->
          <div v-else-if="notifications.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <p class="empty-text">새로운 알림이 없습니다</p>
          </div>

          <!-- 알림 아이템 목록 -->
          <template v-else>
            <div
              v-for="notification in sortedNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.isRead }"
              @click="handleItemClick(notification)"
            >
              <!-- 읽지 않음 표시 -->
              <div v-if="!notification.isRead" class="unread-indicator"></div>

              <!-- 액터 프로필 / 타입 아이콘 -->
              <div class="notification-avatar">
                <img
                  v-if="notification.actor?.profileImageUrl"
                  :src="notification.actor.profileImageUrl"
                  :alt="notification.actor.nickname"
                  @error="handleImageError"
                />
                <div
                  v-else
                  class="avatar-fallback"
                  :style="{ background: notification.color }"
                >
                  {{ getNotificationEmoji(notification.type) }}
                </div>
              </div>

              <!-- 알림 내용 -->
              <div class="notification-content">
                <p class="notification-title">{{ notification.title }}</p>
                <p class="notification-body">{{ notification.content }}</p>
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
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
              더 이상 알림이 없습니다
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
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

// ==================== 드롭다운 토글 ====================

const toggleDropdown = () => {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    // 열릴 때 최신 알림 개수 조회
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

  // 스크롤이 바닥 근처에 도달하면 추가 로드
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

const getNotificationEmoji = (type) => {
  return notificationService.getNotificationEmoji(type)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling?.style.removeProperty('display')
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

.notification-trigger:hover .notification-icon {
  color: #ffffff;
}

.notification-icon {
  width: 20px;
  height: 20px;
  color: #9933EA;
  transition: color 0.15s ease;
}

/* 배지 */
.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 드롭다운 패널 */
.dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

/* 헤더 */
.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
}

.dropdown-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.dropdown-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.action-icon {
  width: 14px;
  height: 14px;
}

/* 알림 목록 */
.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

/* 알림 아이템 */
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
  border-bottom: 1px solid #f9fafb;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #faf5ff;
}

.notification-item.unread:hover {
  background: #f3e8ff;
}

/* 읽지 않음 표시 */
.unread-indicator {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #9333ea;
  border-radius: 50%;
}

/* 아바타 */
.notification-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
}

.notification-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

/* 알림 내용 */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-body {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 6px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 11px;
  color: #9ca3af;
}

/* 삭제 버튼 */
.delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #d1d5db;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.delete-btn svg {
  width: 14px;
  height: 14px;
}

.notification-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #fee2e2;
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
  color: #9ca3af;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

/* 로딩 */
.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #9333ea;
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

.loading-more {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.no-more {
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: #9ca3af;
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
  transform: translateY(-8px) scale(0.95);
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .dropdown-panel {
    position: fixed;
    top: 56px;
    left: 8px;
    right: 8px;
    width: auto;
    max-height: calc(100vh - 72px);
    border-radius: 12px;
  }

  .notification-item {
    padding: 12px 16px;
  }

  .notification-avatar {
    width: 40px;
    height: 40px;
  }

  .notification-title {
    font-size: 13px;
  }

  .notification-body {
    font-size: 12px;
  }

  .action-btn span {
    display: none;
  }

  .action-btn {
    padding: 8px;
  }
}
</style>
