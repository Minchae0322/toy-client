// composables/useNotification.js
// 알림 상태 및 로직 관리 Composable

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import webSocketService from '@/services/webSocketService.js'
import { notificationService } from '@/services/NotificationService.js'

// ==================== 전역 상태 (모듈 레벨 - 싱글톤) ====================

const notifications = ref([])
const unreadCount = ref(0)
const isLoading = ref(false)
const error = ref(null)
const hasMore = ref(true)
const currentPage = ref(0)
const pageSize = 20

// WebSocket 핸들러 등록 여부
let isWebSocketSetup = false
let unsubscribeWebSocket = null

/**
 * 알림 관리 Composable
 */
export function useNotification() {
  const router = useRouter()

  // ==================== Computed ====================

  /**
   * 읽지 않은 알림 목록
   */
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.isRead)
  )

  /**
   * 읽은 알림 목록
   */
  const readNotifications = computed(() =>
    notifications.value.filter(n => n.isRead)
  )

  /**
   * 읽지 않은 알림 존재 여부
   */
  const hasUnread = computed(() => unreadCount.value > 0)

  /**
   * 최신순 정렬된 알림 목록
   */
  const sortedNotifications = computed(() =>
    [...notifications.value].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  )

  /**
   * 알림 개수 표시 텍스트
   */
  const unreadCountDisplay = computed(() => {
    if (unreadCount.value > 99) return '99+'
    return unreadCount.value.toString()
  })

  // ==================== 알림 목록 로드 ====================

  /**
   * 알림 목록 조회 (초기 로드 또는 새로고침)
   * @param {boolean} reset - true면 처음부터 다시 로드
   */
  const loadNotifications = async (reset = false) => {
    if (isLoading.value) return

    try {
      isLoading.value = true
      error.value = null

      if (reset) {
        currentPage.value = 0
        notifications.value = []
        hasMore.value = true
      }

      const response = await notificationService.getNotifications({
        page: currentPage.value,
        size: pageSize
      })

      if (response.success && response.data) {
        // Page 응답 구조 처리
        const content = response.data.content || response.data
        const transformed = notificationService.transformNotifications(
          Array.isArray(content) ? content : []
        )

        if (reset) {
          notifications.value = transformed
        } else {
          // 중복 제거하며 추가
          const existingIds = new Set(notifications.value.map(n => n.id))
          const newNotifications = transformed.filter(n => !existingIds.has(n.id))
          notifications.value.push(...newNotifications)
        }

        // 페이지네이션 정보 업데이트
        if (response.data.last !== undefined) {
          hasMore.value = !response.data.last
        } else {
          hasMore.value = transformed.length >= pageSize
        }

        currentPage.value++

        console.log(`🔔 [useNotification] ${transformed.length}개 알림 로드 완료 (총 ${notifications.value.length}개)`)
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ [useNotification] 알림 로드 실패:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 추가 알림 로드 (무한 스크롤)
   */
  const loadMoreNotifications = async () => {
    if (!hasMore.value || isLoading.value) return
    await loadNotifications(false)
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount()
      if (response.success) {
        // 응답 구조에 따라 처리
        const count = response.data?.count ?? response.data?.unreadCount ?? response.data ?? 0
        unreadCount.value = typeof count === 'number' ? count : 0
        console.log(`🔔 [useNotification] 읽지 않은 알림: ${unreadCount.value}개`)
      }
    } catch (err) {
      console.error('❌ [useNotification] 알림 개수 조회 실패:', err)
    }
  }

  /**
   * 알림 목록 새로고침
   */
  const refreshNotifications = async () => {
    await Promise.all([
      loadNotifications(true),
      fetchUnreadCount()
    ])
  }

  // ==================== 알림 읽음 처리 ====================

  /**
   * 단일 알림 읽음 처리
   * @param {string} notificationId
   */
  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId)
      if (response.success) {
        // 로컬 상태 업데이트 - 배열을 새로 할당하여 반응성 보장
        const index = notifications.value.findIndex(n => n.id === notificationId)
        if (index !== -1 && !notifications.value[index].isRead) {
          notifications.value[index] = {
            ...notifications.value[index],
            isRead: true
          }
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        console.log(`✅ [useNotification] 알림 읽음 처리: ${notificationId}`)
      }
      return response
    } catch (err) {
      console.error('❌ [useNotification] 알림 읽음 처리 실패:', err)
      throw err
    }
  }

  /**
   * 모든 알림 읽음 처리
   */
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead()
      if (response.success) {
        // 로컬 상태 업데이트 - 배열을 새로 할당하여 반응성 보장
        notifications.value = notifications.value.map(n => ({
          ...n,
          isRead: true
        }))
        unreadCount.value = 0
        console.log(`✅ [useNotification] 전체 알림 읽음 처리 완료`)
      }
      return response
    } catch (err) {
      console.error('❌ [useNotification] 전체 알림 읽음 처리 실패:', err)
      throw err
    }
  }

  // ==================== 알림 삭제 ====================

  /**
   * 단일 알림 삭제 (로컬에서만 제거 - API에 단일 삭제가 없는 경우)
   * @param {string} notificationId
   */
  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      const notification = notifications.value[index]
      if (!notification.isRead) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
      console.log(`🗑️ [useNotification] 알림 제거: ${notificationId}`)
    }
  }

  /**
   * 모든 알림 삭제
   */
  const deleteAllNotifications = async () => {
    try {
      const response = await notificationService.deleteAllNotifications()
      if (response.success) {
        notifications.value = []
        unreadCount.value = 0
        console.log(`🗑️ [useNotification] 전체 알림 삭제 완료`)
      }
      return response
    } catch (err) {
      console.error('❌ [useNotification] 전체 알림 삭제 실패:', err)
      throw err
    }
  }

  // ==================== 알림 클릭 (페이지 이동) ====================

  /**
   * 알림 클릭 시 해당 페이지로 이동
   * @param {Object} notification
   */
  const handleNotificationClick = async (notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id)
      } catch (err) {
        // 읽음 처리 실패해도 페이지 이동은 진행
        console.warn('알림 읽음 처리 실패, 페이지 이동 계속 진행')
      }
    }

    // 이동 경로 결정
    const route = notificationService.getNotificationRoute(notification)

    if (route) {
      const currentPath = router.currentRoute.value.fullPath

      // 같은 경로인 경우 페이지 리로드
      if (currentPath === route) {
        window.location.href = route
      } else {
        await router.push(route)
      }
      return true
    }

    console.warn('알림에 이동 경로가 없습니다:', notification)
    return false
  }

  // ==================== WebSocket 실시간 알림 ====================

  /**
   * WebSocket 알림 핸들러 설정
   */
  const setupWebSocketHandler = () => {
    if (isWebSocketSetup) {
      console.log('⚠️ [useNotification] WebSocket 핸들러 이미 등록됨')
      return
    }

    // webSocketService의 onMessage 메서드 사용
    webSocketService.onMessage('notifications', handleNewNotification)
    isWebSocketSetup = true

    console.log('✅ [useNotification] WebSocket 알림 핸들러 등록')
  }

  /**
   * 새 알림 수신 처리
   * @param {Object} data - WebSocket으로 수신된 알림 데이터
   */
  const handleNewNotification = (data) => {
    console.log('🔔 [useNotification] 새 알림 수신:', data)

    // 알림 데이터 변환
    const notification = notificationService.transformNotification(data)

    // 중복 체크
    const exists = notifications.value.some(n => n.id === notification.id)
    if (exists) {
      console.log('⚠️ [useNotification] 중복 알림 무시:', notification.id)
      return
    }

    // 목록 맨 앞에 추가
    notifications.value.unshift(notification)

    // 읽지 않은 알림이면 카운트 증가
    if (!notification.isRead) {
      unreadCount.value++
    }

    // 브라우저 알림 표시 (백그라운드)
    showBrowserNotification(notification)

    // 인앱 토스트 알림 표시
    showToastNotification(notification)

    console.log(`🔔 [useNotification] 새 알림 추가됨 (총 ${notifications.value.length}개, 미읽음 ${unreadCount.value}개)`)
  }

  /**
   * 인앱 토스트 알림 표시
   * @param {Object} notification
   */
  const showToastNotification = (notification) => {
    // 커스텀 이벤트로 NotificationToast 컴포넌트에 알림 전달
    window.dispatchEvent(new CustomEvent('new-notification', {
      detail: notification
    }))
  }

  /**
   * 브라우저 알림 표시
   * @param {Object} notification
   */
  const showBrowserNotification = (notification) => {
    // Notification API 지원 여부 확인
    if (!('Notification' in window)) {
      return
    }

    // 권한 확인
    if (Notification.permission !== 'granted') {
      return
    }

    // 페이지가 활성화 상태면 표시하지 않음
    if (!document.hidden) {
      return
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.content,
        icon: notification.actor?.profileImageUrl || '/icons/notification-icon.png',
        tag: `notification-${notification.id}`,
        data: notification,
        requireInteraction: false
      })

      // 클릭 시 해당 페이지로 이동
      browserNotification.onclick = () => {
        window.focus()
        handleNotificationClick(notification)
        browserNotification.close()
      }

      // 5초 후 자동 닫기
      setTimeout(() => {
        browserNotification.close()
      }, 5000)

    } catch (err) {
      console.warn('브라우저 알림 표시 실패:', err)
    }
  }

  /**
   * 브라우저 알림 권한 요청
   */
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('브라우저가 알림을 지원하지 않습니다')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('알림 권한이 거부되어 있습니다')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (err) {
      console.error('알림 권한 요청 실패:', err)
      return false
    }
  }

  // ==================== WebSocket 핸들러 정리 ====================

  /**
   * WebSocket 핸들러 해제
   */
  const cleanupWebSocketHandler = () => {
    if (isWebSocketSetup) {
      webSocketService.offMessage('notifications')
      isWebSocketSetup = false
      console.log('🧹 [useNotification] WebSocket 알림 핸들러 해제')
    }
  }

  // ==================== 초기화 ====================

  /**
   * 알림 시스템 초기화
   * - 컴포넌트에서 명시적으로 호출하거나 onMounted에서 자동 호출
   */
  const initializeNotifications = async () => {
    console.log('🚀 [useNotification] 알림 시스템 초기화')

    // WebSocket 핸들러 설정
    setupWebSocketHandler()

    // 초기 데이터 로드
    await Promise.all([
      loadNotifications(true),
      fetchUnreadCount()
    ])

    // 브라우저 알림 권한 요청 (선택적)
    // await requestNotificationPermission()
  }

  // ==================== 라이프사이클 ====================

  onMounted(() => {
    // 전역 상태이므로 첫 번째 컴포넌트에서만 초기화
    if (notifications.value.length === 0 && !isLoading.value) {
      initializeNotifications()
    }
  })

  onUnmounted(() => {
    // 전역 상태이므로 핸들러 해제하지 않음
    // 개별 컴포넌트에서 해제가 필요하면 cleanupWebSocketHandler 직접 호출
  })

  // ==================== 반환 ====================

  return {
    // 상태
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,

    // Computed
    unreadNotifications,
    readNotifications,
    hasUnread,
    sortedNotifications,
    unreadCountDisplay,

    // 알림 로드
    loadNotifications,
    loadMoreNotifications,
    fetchUnreadCount,
    refreshNotifications,

    // 읽음/삭제
    markAsRead,
    markAllAsRead,
    removeNotification,
    deleteAllNotifications,

    // 네비게이션
    handleNotificationClick,

    // WebSocket
    setupWebSocketHandler,
    cleanupWebSocketHandler,
    initializeNotifications,

    // 유틸리티
    requestNotificationPermission,
    showBrowserNotification
  }
}

export default useNotification
