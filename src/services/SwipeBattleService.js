// services/SwipeBattleService.js
// 스와이프 배틀 (VoteType.SWIPE) API 클라이언트
//
// 백엔드 API:
//  GET  /battles/{id}/swipe/next?size=10      → 다음 스와이프 카드 묶음
//  POST /battles/{id}/swipe { itemId, verdict } → 스와이프 1건 등록
//  GET  /battles/{id}/swipe/result            → 결과 랭킹
//
// 게스트 ID 는 기존 vote 흐름 그대로 (쿠키/세션) — 별도 처리 없음.

import { BaseApiService } from './BaseApiService.js'
import { getServiceUrl } from '@/config/env.js'

export const SWIPE_VERDICT = Object.freeze({
  STRONG_PICK: 'STRONG_PICK',
  PICK: 'PICK',
  PASS: 'PASS',
})

class SwipeBattleService extends BaseApiService {
  constructor() {
    super(getServiceUrl('CONTENT'), 'SWIPE_BATTLE')
  }

  /**
   * 다음 스와이프 카드 묶음 조회
   * @param {number|string} battleId
   * @param {number} [size=10]
   */
  async getNext(battleId, size = 10) {
    if (!battleId) throw new Error('배틀 ID가 필요합니다.')
    return await this.get(`/battles/${battleId}/swipe/next`, { size })
  }

  /**
   * 스와이프 1건 등록 (즉시 저장)
   * @param {number|string} battleId
   * @param {number|string} itemId
   * @param {'STRONG_PICK'|'PICK'|'PASS'} verdict
   */
  async submit(battleId, itemId, verdict) {
    if (!battleId) throw new Error('배틀 ID가 필요합니다.')
    if (!itemId) throw new Error('아이템 ID가 필요합니다.')
    if (!SWIPE_VERDICT[verdict]) throw new Error(`유효하지 않은 verdict: ${verdict}`)
    return await this.post(`/battles/${battleId}/swipe`, { itemId, verdict })
  }

  /**
   * 결과(랭킹) 조회
   * @param {number|string} battleId
   */
  async getResult(battleId) {
    if (!battleId) throw new Error('배틀 ID가 필요합니다.')
    return await this.get(`/battles/${battleId}/swipe/result`)
  }
}

export const swipeBattleService = new SwipeBattleService()
export default swipeBattleService
