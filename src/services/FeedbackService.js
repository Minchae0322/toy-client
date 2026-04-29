// services/FeedbackService.js
//
// 의견(피드백) 등록 — 누구나 가능, 인증 헤더 불필요
// (목록 조회는 관리자 전용이지만 현재 클라에서 미사용)
//
// 백엔드 라우팅: USER 서버 가정. 다른 서버라면 getServiceUrl 인자만 변경.

import { BaseApiService } from './BaseApiService.js'
import { getServiceUrl } from '@/config/env.js'

class FeedbackService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('USER')
    super(baseURL, 'FEEDBACK')
  }

  /**
   * 의견 등록
   * POST /feedbacks
   * @param {{ title: string, content: string }} payload
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async createFeedback({ title, content }) {
    return await this.post('/feedbacks', { title, content })
  }
}

export const feedbackService = new FeedbackService()
export default feedbackService
