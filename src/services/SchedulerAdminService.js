// services/SchedulerAdminService.js
// 스케줄러 수동 실행 (ADMIN 전용) — content-service /admin/schedulers
import { BaseApiService } from './BaseApiService.js'
import { getServiceUrl } from '@/config/env.js'

class SchedulerAdminService extends BaseApiService {
  constructor() {
    super(getServiceUrl('CONTENT'), 'SCHEDULER_ADMIN')
  }

  /**
   * 수동 실행 가능한 작업 키 목록
   * GET /admin/schedulers → string[]
   */
  async listJobs() {
    const res = await this.get('/admin/schedulers')
    return Array.isArray(res.data) ? res.data : []
  }

  /**
   * 작업 즉시 실행 (동기). 완료될 때까지 응답이 오지 않는다.
   * POST /admin/schedulers/{job} → { job, startedAt, elapsedMs }
   */
  async run(job) {
    if (!job) throw new Error('작업 키가 필요합니다.')
    const res = await this.post(`/admin/schedulers/${encodeURIComponent(job)}`)
    return res.data
  }
}

export const schedulerAdminService = new SchedulerAdminService()
export default schedulerAdminService
