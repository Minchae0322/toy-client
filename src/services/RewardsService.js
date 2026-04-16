// services/RewardsService.js
// 보상 시스템 API 서비스 (유저 + 어드민)

import { BaseApiService } from './BaseApiService.js'
import { getServiceUrl } from '@/config/env.js'

class RewardsService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('CONTENT')
    super(baseURL, 'REWARDS')
  }

  // ==================== 유저 API (/rewards) ====================

  /** GET /rewards/me — 내 EXP/레벨 조회 */
  async getMyRewards() {
    return await this.get('/rewards/me')
  }

  /** GET /rewards/me/badges — 내 뱃지 목록 */
  async getMyBadges() {
    return await this.get('/rewards/me/badges')
  }

  /** GET /rewards/me/badges/pinned — 고정 뱃지 목록 */
  async getPinnedBadges() {
    return await this.get('/rewards/me/badges/pinned')
  }

  /** POST /rewards/me/badges/{badgeId}/pin — 뱃지 고정 */
  async pinBadge(badgeId) {
    return await this.post(`/rewards/me/badges/${badgeId}/pin`)
  }

  /** DELETE /rewards/me/badges/{badgeId}/pin — 뱃지 고정 해제 */
  async unpinBadge(badgeId) {
    return await this.delete(`/rewards/me/badges/${badgeId}/pin`)
  }

  /** GET /rewards/me/streaks — 스트릭 조회 */
  async getMyStreak() {
    return await this.get('/rewards/me/streaks')
  }

  /** POST /rewards/me/streaks/recovery — 복구 티켓 사용 */
  async useRecoveryTicket() {
    return await this.post('/rewards/me/streaks/recovery')
  }

  /** GET /rewards/me/missions/daily — 일일 미션 */
  async getDailyMissions() {
    return await this.get('/rewards/me/missions/daily')
  }

  /** POST /rewards/me/missions/{missionId}/claim — 미션 보상 수령 */
  async claimMission(missionId) {
    return await this.post(`/rewards/me/missions/${missionId}/claim`)
  }

  /** GET /rewards/masteries — 내 숙련도 */
  async getMyMasteries() {
    return await this.get('/rewards/masteries')
  }

  /** GET /rewards/masteries/top — 카테고리 상위 유저 */
  async getCategoryTopUsers(categoryId, limit = 10) {
    return await this.get('/rewards/masteries/top', { categoryId, limit })
  }

  /** GET /rewards/predictions/summary — 예측 요약 */
  async getPredictionSummary() {
    return await this.get('/rewards/predictions/summary')
  }

  /** GET /rewards/predictions/history — 예측 기록 */
  async getPredictionHistory({ page = 0, size = 10 } = {}) {
    return await this.get('/rewards/predictions/history', { page, size })
  }

  // ==================== 어드민 API (/rewards/admin) ====================

  // ── 뱃지 관리 ──

  /** POST /rewards/admin/badges — 뱃지 생성 */
  async createBadge(badgeData) {
    return await this.post('/rewards/admin/badges', badgeData)
  }

  /** PUT /rewards/admin/badges/{badgeId} — 뱃지 수정 */
  async updateBadge(badgeId, badgeData) {
    return await this.put(`/rewards/admin/badges/${badgeId}`, badgeData)
  }

  /** DELETE /rewards/admin/badges/{badgeId} — 뱃지 비활성화 */
  async deleteBadge(badgeId) {
    return await this.delete(`/rewards/admin/badges/${badgeId}`)
  }

  /** GET /rewards/admin/badges — 활성 뱃지 목록 */
  async getAdminBadges() {
    return await this.get('/rewards/admin/badges')
  }

  /** GET /rewards/admin/badges/category — 카테고리별 뱃지 */
  async getAdminBadgesByCategory(category) {
    return await this.get('/rewards/admin/badges/category', { category })
  }

  // ── 미션 관리 ──

  /** POST /rewards/admin/missions — 미션 생성 */
  async createMission(missionData) {
    return await this.post('/rewards/admin/missions', missionData)
  }

  /** PUT /rewards/admin/missions/{missionId} — 미션 수정 */
  async updateMission(missionId, missionData) {
    return await this.put(`/rewards/admin/missions/${missionId}`, missionData)
  }

  /** DELETE /rewards/admin/missions/{missionId} — 미션 비활성화 */
  async deleteMission(missionId) {
    return await this.delete(`/rewards/admin/missions/${missionId}`)
  }

  /** GET /rewards/admin/missions — 활성 미션 목록 */
  async getAdminMissions() {
    return await this.get('/rewards/admin/missions')
  }

  /** GET /rewards/admin/missions/fixed-candidates — 고정 후보 미션 */
  async getFixedCandidateMissions() {
    return await this.get('/rewards/admin/missions/fixed-candidates')
  }
}

export const rewardsService = new RewardsService()
