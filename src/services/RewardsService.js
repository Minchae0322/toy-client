// services/RewardsService.js
// 보상 시스템 API — 유저 + 어드민

import { BaseApiService } from './BaseApiService.js'
import { getServiceUrl } from '@/config/env.js'

/**
 * 백엔드 UserTier (@JsonFormat OBJECT: { code, description, minLevel, maxLevel }) →
 * 프론트 컨벤션 lowercase 키('plain'|'fruity'|'granola'|'parfait'|'signature').
 * 리치 메타는 컴포넌트에서 getTierByLevel(level)로 조회.
 */
function normalizeTier(tier) {
  if (!tier) return null
  if (typeof tier === 'string') return tier.toLowerCase()
  return tier.code?.toLowerCase() || null
}

class RewardsService extends BaseApiService {
  constructor() {
    super(getServiceUrl('CONTENT'), 'REWARDS')
  }

  // ── 유저: EXP / 레벨 ──
  async getMyRewards() {
    const res = await this.get('/rewards/me')
    if (res?.data) res.data = { ...res.data, tier: normalizeTier(res.data.tier) }
    return res
  }

  // ── 유저: 뱃지 ──
  getMyBadges() { return this.get('/rewards/me/badges') }
  pinBadge(badgeId) { return this.post(`/rewards/me/badges/${badgeId}/pin`) }
  unpinBadge(badgeId) { return this.delete(`/rewards/me/badges/${badgeId}/pin`) }

  // ── 유저: 스트릭 ──
  getMyStreak() { return this.get('/rewards/me/streak') }
  useRecoveryTicket() { return this.post('/rewards/me/streak/recovery') }

  // ── 유저: 미션 ──
  getDailyMissions() { return this.get('/rewards/me/missions/today') }
  claimMission(assignmentId) { return this.post(`/rewards/me/missions/${assignmentId}/claim`) }

  // ── 어드민: 뱃지 ──
  getAdminBadges() { return this.get('/rewards/admin/badges') }
  getAdminBadgesByCategory(category) { return this.get('/rewards/admin/badges/category', { category }) }
  createBadge(data) { return this.post('/rewards/admin/badges', data) }
  updateBadge(id, data) { return this.put(`/rewards/admin/badges/${id}`, data) }
  deleteBadge(id) { return this.delete(`/rewards/admin/badges/${id}`) }

  // ── 어드민: 미션 ──
  getAdminMissions() { return this.get('/rewards/admin/missions') }
  getFixedCandidateMissions() { return this.get('/rewards/admin/missions/fixed-candidates') }
  createMission(data) { return this.post('/rewards/admin/missions', data) }
  updateMission(id, data) { return this.put(`/rewards/admin/missions/${id}`, data) }
  deleteMission(id) { return this.delete(`/rewards/admin/missions/${id}`) }
}

export const rewardsService = new RewardsService()
