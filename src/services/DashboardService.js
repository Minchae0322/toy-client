// services/DashboardService.js

import { BaseApiService } from './BaseApiService.js'
import { ENV, getServiceUrl } from '@/config/env.js'

class DashboardService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('CONTENT')
    super(baseURL, 'DASHBOARD')
  }

  /**
   * 대시보드 요약 정보 조회
   * @returns {Promise<{activeBattleCount: number, totalItemCount: number, popularFeedCount: number}>}
   */
  async getSummary() {
    return await this.get('/dashboard/summary')
  }
}

export const dashboardService = new DashboardService()
export default dashboardService
