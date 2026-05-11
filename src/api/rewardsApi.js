/**
 * ============================================================
 *  Rewards API Service
 * ============================================================
 *
 * 백엔드 미배포 상태이므로 현재는 mock 데이터(levelSystemData.js)를
 * 그대로 반환합니다. 실제 백엔드가 붙으면 아래 USE_MOCK 플래그를 false로
 * 바꾸고 각 함수의 real 구현부만 활성화하면 됩니다.
 *
 * ▶ mock 전체 제거 시:
 *    1. USE_MOCK = false 로 설정
 *    2. 아래 `mockXxx` 구현부와 levelSystemData.js의 mock 섹션 삭제
 *    3. 각 함수에 주석으로 달린 실제 엔드포인트 주석을 실코드로 교체
 *
 * ▶ 실제 API 응답 래퍼: { success, data, message?, errorCode? }
 *    이 서비스는 성공 시 data를 반환하고, 실패 시 throw 합니다.
 * ============================================================
 */

// import { apiClient } from './client' // TODO: 백엔드 연결 시 사용
import {
  STREAK_DATA,
  DAILY_MISSIONS,
  USER_PROFICIENCY,
  CATEGORY_TOP_RANKERS,
  PREDICTION_SUMMARY,
  PREDICTION_HISTORY,
  CATEGORIES,
  getProficiencyTier,
  getNextProficiencyTier,
  getCategoryById,
  getNextLevelExp,
} from '@/data/levelSystemData.js'

export const USE_MOCK = false
const MOCK_LATENCY = 200

// 세션 내에서만 유지되는 mutable mock state (유저 전환 시 reset 하려면 resetMockState 호출)
const mockState = {
  streak: JSON.parse(JSON.stringify(STREAK_DATA)),
  missions: JSON.parse(JSON.stringify(DAILY_MISSIONS)),
  pinnedBadges: {}, // { [userId]: [badgeId, ...] }
}

export function resetMockState() {
  mockState.streak = JSON.parse(JSON.stringify(STREAK_DATA))
  mockState.missions = JSON.parse(JSON.stringify(DAILY_MISSIONS))
  mockState.pinnedBadges = {}
}

function delay(ms = MOCK_LATENCY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ============================================================
 *  EXP
 *  GET /rewards/exp
 * ============================================================ */
export async function fetchExp(user) {
  if (USE_MOCK) {
    await delay()
    return {
      level: user.level,
      totalExp: user.totalExp,
      currentLevelExp: user.currentExp,
      nextLevelExp: getNextLevelExp(user.level) || null,
      seasonExp: Math.round(user.totalExp * 0.35),
      seasonCode: '2026-Q2',
    }
  }
  // const { data } = await apiClient.get('/rewards/exp')
  // return unwrap(data)
}

/* ============================================================
 *  Streak
 *  GET  /rewards/streak
 *  POST /rewards/streak/recovery
 * ============================================================ */
export async function fetchStreak(userId) {
  if (USE_MOCK) {
    await delay()
    return (
      mockState.streak[userId] || {
        currentStreak: 0,
        maxStreak: 0,
        lastPostedDate: null,
        recoveryTickets: 0,
      }
    )
  }
  // const { data } = await apiClient.get('/rewards/streak')
  // return unwrap(data)
}

export async function useRecoveryTicket(userId) {
  if (USE_MOCK) {
    await delay()
    const s = mockState.streak[userId]
    if (!s) throw new Error('USER_NOT_FOUND')
    if (s.recoveryTickets <= 0) throw new Error('NO_TICKETS')
    s.recoveryTickets -= 1
    s.currentStreak += 1
    return { ...s }
  }
  // const { data } = await apiClient.post('/rewards/streak/recovery')
  // return unwrap(data)
}

/* ============================================================
 *  Daily Missions
 *  GET  /missions/today
 *  POST /missions/{missionId}/claim
 * ============================================================ */
export async function fetchDailyMissions(userId) {
  if (USE_MOCK) {
    await delay()
    return mockState.missions[userId] ? [...mockState.missions[userId]] : []
  }
  // const { data } = await apiClient.get('/missions/daily')
  // return unwrap(data)
}

export async function claimMission(userId, missionId) {
  if (USE_MOCK) {
    await delay()
    const list = mockState.missions[userId] || []
    const found = list.find((m) => m.missionId === missionId)
    if (!found) throw new Error('MISSION_NOT_FOUND')
    if (found.status !== 'COMPLETED') throw new Error('NOT_CLAIMABLE')
    found.status = 'CLAIMED'
    return { missionId, exp: found.exp, status: 'CLAIMED' }
  }
  // const { data } = await apiClient.post(`/missions/${missionId}/claim`)
  // return unwrap(data)
}

/* ============================================================
 *  Badge Pinning
 *  POST /badges/{badgeId}/pin
 *  DELETE /badges/{badgeId}/pin
 *  ※ 현재 스펙에는 없지만 길게 누르기 고정 기능을 위해 프론트 상태로 관리.
 *    백엔드 엔드포인트가 준비되면 아래를 실호출로 교체.
 * ============================================================ */
export async function fetchPinnedBadges(userId) {
  if (USE_MOCK) {
    await delay(50)
    return [...(mockState.pinnedBadges[userId] || [])]
  }
  // const { data } = await apiClient.get('/badges/pinned')
  // return unwrap(data)
}

export async function toggleBadgePin(userId, badgeId) {
  if (USE_MOCK) {
    await delay(80)
    if (!mockState.pinnedBadges[userId]) mockState.pinnedBadges[userId] = []
    const arr = mockState.pinnedBadges[userId]
    const idx = arr.indexOf(badgeId)
    if (idx >= 0) {
      arr.splice(idx, 1)
      return { badgeId, pinned: false }
    } else {
      arr.push(badgeId)
      return { badgeId, pinned: true }
    }
  }
  // const pinned = /* 현재 상태 조회 */
  // const method = pinned ? 'delete' : 'post'
  // const { data } = await apiClient[method](`/badges/${badgeId}/pin`)
  // return unwrap(data)
}

/* ============================================================
 *  Category Proficiency
 *  GET /proficiency/me
 *  GET /proficiency/categories/{categoryId}/top?limit=N
 * ============================================================ */
export async function fetchMyProficiency(userId) {
  if (USE_MOCK) {
    await delay()
    const list = USER_PROFICIENCY[userId] || []
    return list.map((p) => {
      const tier = getProficiencyTier(p.activity)
      const next = getNextProficiencyTier(p.activity)
      return {
        categoryId: p.categoryId,
        category: getCategoryById(p.categoryId),
        activity: p.activity,
        tier,
        next,
      }
    })
  }
  // const { data } = await apiClient.get('/proficiency/me')
  // return unwrap(data)
}

export async function fetchCategoryTopRankers(categoryId, limit = 10) {
  if (USE_MOCK) {
    await delay()
    return (CATEGORY_TOP_RANKERS[categoryId] || []).slice(0, limit)
  }
  // const { data } = await apiClient.get(`/proficiency/categories/${categoryId}/top`, { params: { limit } })
  // return unwrap(data)
}

export function fetchCategories() {
  return CATEGORIES
}

/* ============================================================
 *  Battle Prediction History
 *  GET /predictions/summary
 *  GET /predictions/history?page=N&size=M
 * ============================================================ */
export async function fetchPredictionSummary(userId) {
  if (USE_MOCK) {
    await delay()
    return PREDICTION_SUMMARY[userId] || { hitCount: 0, totalPredictions: 0 }
  }
  // const { data } = await apiClient.get('/predictions/summary')
  // return unwrap(data)
}

export async function fetchPredictionHistory(userId, { page = 1, size = 10 } = {}) {
  if (USE_MOCK) {
    await delay()
    const all = PREDICTION_HISTORY[userId] || []
    const start = (page - 1) * size
    const items = all.slice(start, start + size)
    return {
      items,
      page,
      size,
      total: all.length,
      hasNext: start + size < all.length,
    }
  }
  // const { data } = await apiClient.get('/predictions/history', { params: { page, size } })
  // return unwrap(data)
}

/* ============================================================
 *  응답 래퍼 유틸 (백엔드 붙이면 주석 해제해서 사용)
 * ============================================================ */
// function unwrap(res) {
//   if (res?.success) return res.data
//   throw Object.assign(new Error(res?.message || 'API_ERROR'), {
//     errorCode: res?.errorCode,
//   })
// }
