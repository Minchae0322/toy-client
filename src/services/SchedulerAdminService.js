// services/SchedulerAdminService.js
// 핫 스코어 전체 재계산·시간 상수 관리 (ADMIN 전용) — content-service /admin/schedulers · /admin/hot-score
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

  /**
   * 도메인별 핫 스코어 시간 상수 현재값
   * GET /admin/hot-score → [{ domain, timeDivisorSeconds, days, defaultSeconds, overridden }]
   */
  async getHotScoreConfig() {
    const res = await this.get('/admin/hot-score')
    return Array.isArray(res.data) ? res.data : []
  }

  /**
   * 시간 상수 변경 + 그 도메인 전체 재계산 (동기, 끝나야 응답)
   * PUT /admin/hot-score/{domain} { timeDivisorSeconds }
   * → { domain, timeDivisorSeconds, days, recalculated, startedAt, elapsedMs }
   */
  async updateHotScoreDivisor(domain, timeDivisorSeconds) {
    if (!domain) throw new Error('도메인이 필요합니다.')
    const res = await this.put(`/admin/hot-score/${encodeURIComponent(domain)}`, { timeDivisorSeconds })
    return res.data
  }
}

export const schedulerAdminService = new SchedulerAdminService()
export default schedulerAdminService
