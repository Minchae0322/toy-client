// src/stores/userBlock.js
// 사용자 차단 store — 클라이언트 LocalStorage 전용 (Phase 1)
// Apple Guideline 1.2 (UGC block) 충족용. Phase 2 (백엔드 연동)는 docs/user-block-system.md 참조.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'

const STORAGE_KEY_PREFIX = 'yogurtte:blocked-users:'

function storageKey(userId) {
  return `${STORAGE_KEY_PREFIX}${userId}`
}

function toKey(id) {
  return id == null ? '' : String(id)
}

export const useUserBlockStore = defineStore('userBlock', () => {
  // 차단된 항목: { userId: string, nickname: string|null, profileImage: string|null, blockedAt: number }
  const blockedItems = ref([])
  // 현재 load 된 currentUserId — 다른 유저 로그인 시 재로드 트리거
  const loadedFor = ref(null)

  const blockedIds = computed(() => blockedItems.value.map((it) => it.userId))
  const blockedSet = computed(() => new Set(blockedIds.value))

  function load(currentUserId) {
    const key = toKey(currentUserId)
    if (!key) {
      blockedItems.value = []
      loadedFor.value = null
      return
    }
    if (loadedFor.value === key) return
    try {
      const raw = localStorage.getItem(storageKey(key))
      const parsed = raw ? JSON.parse(raw) : []
      blockedItems.value = Array.isArray(parsed)
        ? parsed
            .filter((it) => it && it.userId != null)
            .map((it) => ({
              userId: toKey(it.userId),
              nickname: it.nickname ?? null,
              profileImage: it.profileImage ?? null,
              blockedAt: typeof it.blockedAt === 'number' ? it.blockedAt : Date.now(),
            }))
        : []
    } catch (e) {
      console.warn('[userBlock] load failed:', e)
      blockedItems.value = []
    }
    loadedFor.value = key
  }

  function persist() {
    if (!loadedFor.value) return
    try {
      localStorage.setItem(storageKey(loadedFor.value), JSON.stringify(blockedItems.value))
    } catch (e) {
      console.warn('[userBlock] persist failed:', e)
    }
  }

  function isBlocked(userId) {
    if (userId == null) return false
    return blockedSet.value.has(toKey(userId))
  }

  /**
   * 사용자 차단
   * @param {string|number} userId
   * @param {{ nickname?: string, profileImage?: string }} [meta]
   * @returns {'ok' | 'already' | 'self' | 'invalid'}
   */
  function block(userId, meta = null) {
    const key = toKey(userId)
    if (!key) return 'invalid'

    const auth = useAuthStore()
    if (toKey(auth.userId) === key) return 'self'

    if (blockedSet.value.has(key)) return 'already'

    blockedItems.value = [
      ...blockedItems.value,
      {
        userId: key,
        nickname: meta?.nickname ?? null,
        profileImage: meta?.profileImage ?? null,
        blockedAt: Date.now(),
      },
    ]
    persist()
    return 'ok'
  }

  function unblock(userId) {
    const key = toKey(userId)
    if (!key) return false
    if (!blockedSet.value.has(key)) return false
    blockedItems.value = blockedItems.value.filter((it) => it.userId !== key)
    persist()
    return true
  }

  function clear() {
    blockedItems.value = []
    loadedFor.value = null
  }

  /**
   * 리스트에서 차단된 작성자의 항목 제외
   * @param {Array} list
   * @param {(item:any)=>string|number} getUserId - 항목에서 userId 추출
   */
  function filterBlocked(list, getUserId = (x) => x?.userId) {
    if (!Array.isArray(list) || blockedItems.value.length === 0) return list
    return list.filter((item) => !isBlocked(getUserId(item)))
  }

  return {
    blockedItems,
    blockedIds,
    blockedSet,
    load,
    persist,
    isBlocked,
    block,
    unblock,
    clear,
    filterBlocked,
  }
})
