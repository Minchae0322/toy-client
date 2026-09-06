// services/SchedulerAdminService.js
// 핫 스코어 관리 (ADMIN 전용) — content-service /admin/hot-score
//   GET  /admin/hot-score                      도메인별 시간 상수 현황
//   PUT  /admin/hot-score/{domain}             상수 변경 + 그 도메인 전체 재계산
//   POST /admin/hot-score/{domain}/recalculate 전체 재계산만
import { BaseApiService } from './BaseApiService.js'
import { getServiceUrl } from '@/config/env.js'

class SchedulerAdminService extends BaseApiService {
  constructor() {
    super(getServiceUrl('CONTENT'), 'HOT_SCORE_ADMIN')
  }

  /** → [{ domain, timeDivisorSeconds, defaultSeconds, overridden, days }] */
  async getHotScoreConfig() {
    const res = await this.get('/admin/hot-score')
    return Array.isArray(res.data) ? res.data : []
  }

  /** 동기 실행. 재계산이 끝나야 응답 → { domain, timeDivisorSeconds, recalculated, elapsedMs, days } */
  async updateHotScoreDivisor(domain, timeDivisorSeconds) {
    if (!domain) throw new Error('도메인이 필요합니다.')
    const res = await this.put(`/admin/hot-score/${encodeURIComponent(domain)}`, { timeDivisorSeconds })
    return res.data
  }

  /** 동기 실행 → { domain, timeDivisorSeconds, recalculated, elapsedMs, days } */
  async recalculate(domain) {
    if (!domain) throw new Error('도메인이 필요합니다.')
    const res = await this.post(`/admin/hot-score/${encodeURIComponent(domain)}/recalculate`)
    return res.data
  }
}

export const schedulerAdminService = new SchedulerAdminService()
export default schedulerAdminService
