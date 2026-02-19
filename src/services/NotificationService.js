// services/NotificationService.js
// 알림 관련 REST API 서비스 (Fetch API 기반)

import { BaseApiService } from './BaseApiService.js'
import { getServiceUrl } from '@/config/env.js'

/**
 * 알림 타입 상수
 */
export const NOTIFICATION_TYPES = {
  COMMENT: 'COMMENT',
  LIKE: 'LIKE',
  FOLLOW: 'FOLLOW',
  CHAT: 'CHAT',
  SYSTEM: 'SYSTEM'
}

/**
 * 알림 참조 타입 상수
 */
export const NOTIFICATION_REFERENCE_TYPES = {
  POST: 'POST',
  FEED: 'FEED',
  BATTLE: 'BATTLE',
  CHAT_ROOM: 'CHAT_ROOM',
  USER: 'USER',
  PRODUCT: 'PRODUCT',
  SYSTEM: 'SYSTEM'
}

/**
 * 알림 서비스
 * - 백엔드 알림 API와 통신
 * - BaseApiService 상속으로 토큰 자동 갱신 지원
 */
class NotificationService extends BaseApiService {
  constructor() {
    // CHAT 서버에서 알림 API 제공
    const baseURL = getServiceUrl('CHAT')
    super(baseURL, 'NOTIFICATION')
  }

  // ==================== 알림 목록 조회 ====================

  /**
   * 알림 목록 조회 (페이지네이션)
   * @param {Object} params - { page, size, type }
   */
  async getNotifications(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20,
      ...(params.type && { type: params.type })
    }

    console.log(`🔔 [NOTIFICATION] 알림 목록 조회:`, queryParams)
    return await this.get('/notifications', queryParams)
  }

  /**
   * 읽지 않은 알림 목록 조회
   * @param {Object} params - { page, size }
   */
  async getUnreadNotifications(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20
    }

    console.log(`🔔 [NOTIFICATION] 읽지 않은 알림 조회:`, queryParams)
    return await this.get('/notifications/unread', queryParams)
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  async getUnreadCount() {
    console.log(`🔔 [NOTIFICATION] 읽지 않은 알림 개수 조회`)
    return await this.get('/notifications/unread/count')
  }

  // ==================== 알림 읽음 처리 ====================

  /**
   * 단일 알림 읽음 처리
   * @param {string} notificationId
   */
  async markAsRead(notificationId) {
    console.log(`✅ [NOTIFICATION] 알림 읽음 처리: ${notificationId}`)
    return await this.post(`/notifications/${notificationId}/read`)
  }

  /**
   * 여러 알림 읽음 처리
   * @param {Array<string>} notificationIds
   */
  async markMultipleAsRead(notificationIds) {
    console.log(`✅ [NOTIFICATION] 여러 알림 읽음 처리:`, notificationIds)
    return await this.post('/notifications/read', { notificationIds })
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead() {
    console.log(`✅ [NOTIFICATION] 전체 알림 읽음 처리`)
    return await this.post('/notifications/read/all')
  }

  // ==================== 알림 삭제 ====================

  /**
   * 모든 알림 삭제
   */
  async deleteAllNotifications() {
    console.log(`🗑️ [NOTIFICATION] 전체 알림 삭제`)
    return await this.delete('/notifications')
  }

  // ==================== 알림 데이터 변환 ====================

  /**
   * 백엔드 알림 응답을 프론트엔드 형식으로 변환
   * @param {Object} backendNotification
   */
  transformNotification(backendNotification) {
    return {
      id: backendNotification.id,
      type: backendNotification.type,
      title: backendNotification.title,
      content: backendNotification.content,
      referenceId: backendNotification.referenceId,
      referenceType: backendNotification.referenceType,
      actionUrl: backendNotification.actionUrl,
      // API 응답이 'read' 또는 'isRead' 둘 다 지원
      isRead: backendNotification.read ?? backendNotification.isRead ?? false,
      createdAt: backendNotification.createdAt,
      actor: backendNotification.actor ? {
        userId: backendNotification.actor.userId,
        nickname: backendNotification.actor.nickname,
        profileImageUrl: backendNotification.actor.profileImageUrl
      } : null,
      // 타입별 아이콘/색상 매핑
      icon: this.getNotificationIcon(backendNotification.type),
      color: this.getNotificationColor(backendNotification.type)
    }
  }

  /**
   * 알림 목록 변환
   * @param {Array} notifications
   */
  transformNotifications(notifications) {
    return notifications.map(n => this.transformNotification(n))
  }

  /**
   * 알림 타입별 아이콘 반환
   * @param {string} type
   */
  getNotificationIcon(type) {
    const iconMap = {
      [NOTIFICATION_TYPES.COMMENT]: 'comment',
      [NOTIFICATION_TYPES.LIKE]: 'heart',
      [NOTIFICATION_TYPES.FOLLOW]: 'user-plus',
      [NOTIFICATION_TYPES.CHAT]: 'message',
      [NOTIFICATION_TYPES.SYSTEM]: 'bell'
    }
    return iconMap[type] || 'bell'
  }

  /**
   * 알림 타입별 색상 반환
   * @param {string} type
   */
  getNotificationColor(type) {
    const colorMap = {
      [NOTIFICATION_TYPES.COMMENT]: '#3b82f6',   // blue
      [NOTIFICATION_TYPES.LIKE]: '#ef4444',      // red
      [NOTIFICATION_TYPES.FOLLOW]: '#22c55e',    // green
      [NOTIFICATION_TYPES.CHAT]: '#9333ea',      // purple (메인 컬러)
      [NOTIFICATION_TYPES.SYSTEM]: '#6b7280'     // gray
    }
    return colorMap[type] || '#6b7280'
  }

  /**
   * 알림 타입별 이모지 반환
   * @param {string} type
   */
  getNotificationEmoji(type) {
    const emojiMap = {
      [NOTIFICATION_TYPES.COMMENT]: '💬',
      [NOTIFICATION_TYPES.LIKE]: '❤️',
      [NOTIFICATION_TYPES.FOLLOW]: '👤',
      [NOTIFICATION_TYPES.CHAT]: '✉️',
      [NOTIFICATION_TYPES.SYSTEM]: '📢'
    }
    return emojiMap[type] || '🔔'
  }

  /**
   * referenceType에 따른 라우트 경로 생성
   * @param {Object} notification
   */
  getNotificationRoute(notification) {
    // actionUrl이 있으면 우선 사용
    if (notification.actionUrl) {
      return notification.actionUrl
    }

    // referenceType에 따른 기본 경로 매핑
    const routeMap = {
      [NOTIFICATION_REFERENCE_TYPES.POST]: `/feed/${notification.referenceId}`,
      [NOTIFICATION_REFERENCE_TYPES.FEED]: `/feed/${notification.referenceId}`,
      [NOTIFICATION_REFERENCE_TYPES.BATTLE]: `/battle/${notification.referenceId}`,
      [NOTIFICATION_REFERENCE_TYPES.CHAT_ROOM]: `/chat/${notification.referenceId}`,
      [NOTIFICATION_REFERENCE_TYPES.USER]: `/profile/${notification.referenceId}`,
      [NOTIFICATION_REFERENCE_TYPES.PRODUCT]: `/product/${notification.referenceId}`
    }

    return routeMap[notification.referenceType] || null
  }

  /**
   * 상대 시간 포맷팅
   * @param {string} dateString
   */
  formatRelativeTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`

    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}

// ==================== 싱글톤 인스턴스 ====================

export const notificationService = new NotificationService()
export default notificationService
