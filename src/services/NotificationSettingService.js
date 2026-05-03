// services/NotificationSettingService.js
// Auth 서비스의 사용자 알림 설정 API 클라이언트
// 응답에 없는 (카테고리, 채널) 조합은 default ON 으로 처리한다.

import { BaseApiService } from './BaseApiService.js'
import { getServiceUrl } from '@/config/env.js'

/**
 * 카테고리 enum (서버 NotificationCategory 와 동기화)
 */
export const NOTIFICATION_CATEGORY = {
  FOLLOW: 'FOLLOW',
  COMMENT: 'COMMENT',
  LIKE: 'LIKE',
  MENTION: 'MENTION',
  CHAT: 'CHAT',
  MARKETING: 'MARKETING',
}

/**
 * 채널 enum (서버 NotificationChannel 과 동기화)
 * 현재는 PUSH 만 운영. IN_APP / EMAIL 등 추가 시 여기에 한 줄씩만 추가하면
 * 화면에 토글이 자동으로 늘어남.
 */
export const NOTIFICATION_CHANNEL = {
  PUSH: 'PUSH',
}

/**
 * 화면 표기용 메타 데이터
 */
export const CATEGORY_META = {
  FOLLOW:    { label: '팔로우',    desc: '누가 나를 팔로우했을 때' },
  COMMENT:   { label: '댓글',      desc: '내 게시물·배틀에 댓글이 달렸을 때' },
  LIKE:      { label: '좋아요',    desc: '내 게시물·댓글에 좋아요가 눌렸을 때' },
  MENTION:   { label: '멘션',      desc: '누가 나를 언급했을 때' },
  CHAT:      { label: '채팅 메시지', desc: '새 채팅 메시지가 도착했을 때' },
  MARKETING: { label: '마케팅·이벤트', desc: '프로모션과 이벤트 안내 (기본 OFF)' },
}

export const CHANNEL_META = {
  PUSH: { label: '푸시', desc: '브라우저/모바일 푸시 알림' },
}

/**
 * MARKETING 등 default-OFF 정책이 있는 카테고리는 기본값을 false 로.
 */
const DEFAULT_OFF_CATEGORIES = new Set(['MARKETING'])

/**
 * 응답에 없는 항목은 default ON 으로 채워서 화면에서 통일적으로 다루기.
 * @param {Array<{category, channel, enabled}>} settings - 서버 응답 항목들
 * @returns {Object} key = `${category}:${channel}`, value = boolean
 */
export const normalizeSettingsToMap = (settings = []) => {
  const map = {}
  // 1) default 채움
  for (const category of Object.values(NOTIFICATION_CATEGORY)) {
    for (const channel of Object.values(NOTIFICATION_CHANNEL)) {
      map[`${category}:${channel}`] = !DEFAULT_OFF_CATEGORIES.has(category)
    }
  }
  // 2) 서버 값으로 덮어쓰기
  for (const item of settings) {
    if (!item) continue
    map[`${item.category}:${item.channel}`] = !!item.enabled
  }
  return map
}

class NotificationSettingService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('AUTH')
    super(baseURL, 'NOTIFICATION_SETTING')
  }

  /**
   * 알림 설정 전체 조회
   * @param {number|string} userId
   * @returns {Promise<{success:boolean, data:any, ...}>}
   */
  async getSettings(userId) {
    return await this.get(`/user/${userId}/notification-settings`)
  }

  /**
   * 알림 설정 단건 변경
   * @param {number|string} userId
   * @param {{category:string, channel:string, enabled:boolean}} payload
   */
  async updateOne(userId, payload) {
    return await this.put(`/user/${userId}/notification-settings`, payload)
  }

  /**
   * 알림 설정 일괄 변경
   * @param {number|string} userId
   * @param {Array<{category:string, channel:string, enabled:boolean}>} settings
   */
  async updateBulk(userId, settings) {
    return await this.put(`/user/${userId}/notification-settings/bulk`, { settings })
  }
}

export const notificationSettingService = new NotificationSettingService()
