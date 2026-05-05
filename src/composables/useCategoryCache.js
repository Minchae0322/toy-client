// src/composables/useCategoryCache.js
import { ref } from 'vue'
import { categoryService } from '@/services/CategoryService.js'

// 전역 캐시 (싱글톤)
//
// allCategories: 마지막 호출이 type 미지정(전체)일 때 채워지는 캐시. 레거시 호환.
// categoriesByType: type별 분리 캐시. ALL = type 미지정으로 받은 전체.
const allCategories = ref([])
const categoriesByType = ref({
  ALL: [],
  FEED: [],
  PRODUCT: []
})
const popularCategories = ref({
  FEED: [],
  BATTLE: [],
  PRODUCT: []
})
const isLoaded = ref(false)
const isLoading = ref(false)
const lastFetchTime = ref(null)
const lastFetchByType = ref({}) // { ALL: ts, FEED: ts, ... }

// 캐시 유효 시간 (30분)
const CACHE_TTL = 30 * 60 * 1000

export function useCategoryCache() {

  // 캐시가 유효한지 확인
  const isCacheValid = (key = 'ALL') => {
    const ts = lastFetchByType.value[key]
    if (!ts) return false
    return Date.now() - ts < CACHE_TTL
  }

  /**
   * 카테고리 로드.
   *
   * 호출 패턴:
   *   loadAllCategories()                 // 레거시 — 전체(type 무관)
   *   loadAllCategories(true)             // 레거시 — 전체 + force
   *   loadAllCategories('FEED')           // type='FEED'만
   *   loadAllCategories('FEED', true)     // type='FEED' + force
   */
  const loadAllCategories = async (typeOrForce = null, force = false) => {
    let type = null
    let forceFetch = false
    if (typeof typeOrForce === 'boolean') {
      forceFetch = typeOrForce
    } else if (typeof typeOrForce === 'string') {
      type = typeOrForce
      forceFetch = force
    }

    const key = type || 'ALL'

    // 캐시 유효 + 데이터 있으면 스킵
    if (!forceFetch && isCacheValid(key) && categoriesByType.value[key]?.length > 0) {
      if (!type) allCategories.value = categoriesByType.value.ALL
      return categoriesByType.value[key]
    }

    // 이미 같은 키로 로딩 중이면 대기
    if (isLoading.value) {
      return new Promise((resolve) => {
        const checkLoading = setInterval(() => {
          if (!isLoading.value) {
            clearInterval(checkLoading)
            resolve(categoriesByType.value[key])
          }
        }, 100)
      })
    }

    isLoading.value = true

    try {
      const condition = type
        ? { categoryType: type, isActive: true }
        : { isActive: true }
      const response = await categoryService.getCategories(condition)
      if (response.success && response.data) {
        const normalized = response.data.map(cat => ({
          ...cat,
          children: cat.children || []
        }))
        categoriesByType.value[key] = normalized
        lastFetchByType.value[key] = Date.now()

        // 레거시 호환: type 미지정 호출 시 allCategories도 갱신
        if (!type) {
          allCategories.value = normalized
          lastFetchTime.value = Date.now()
          isLoaded.value = true
        }
      }
    } catch (error) {
      console.error('[CategoryCache] 카테고리 로드 실패:', error)
    } finally {
      isLoading.value = false
    }

    return categoriesByType.value[key]
  }

  // contentType (FEED | BATTLE | PRODUCT) → 카테고리의 categoryType 매핑
  // BATTLE도 카테고리는 PRODUCT 사용 (배틀은 제품 카테고리 위에 동작)
  const resolveCategoryType = (contentType) => contentType === 'FEED' ? 'FEED' : 'PRODUCT'

  // 인기 카테고리 로드
  // contentType: FEED | BATTLE | PRODUCT — popular 집계 도메인 + categoryType 매핑 기준
  const loadPopularCategories = async (contentType, size = 8, force = false) => {
    // popularCategories 캐시는 contentType 단위 (FEED/BATTLE/PRODUCT)
    if (!popularCategories.value[contentType]) popularCategories.value[contentType] = []

    if (!force && isCacheValid() && popularCategories.value[contentType]?.length >= size) {
      return popularCategories.value[contentType].slice(0, size)
    }

    // FEED는 부모 카테고리 수가 적어 popular 별도 집계 의미 없음
    // → /categories/popular API 호출 생략하고 일반 목록 그대로 사용
    if (contentType === 'FEED') {
      await loadAllCategories('FEED')
      const list = (categoriesByType.value.FEED || []).slice(0, size)
      popularCategories.value.FEED = list
      return list
    }

    // fallback용 카테고리는 categoryType 기준으로 로드 (BATTLE → PRODUCT)
    const categoryType = resolveCategoryType(contentType)
    await loadAllCategories(categoryType)

    let result = []

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const formatDate = (date) => date.toISOString().split('T')[0]

      const response = await categoryService.getPopularCategories({
        categoryType,
        type: contentType,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        page: 0,
        size,
        sort: 'contentCount,desc'
      })

      if (response.success && response.data?.content?.length > 0) {
        result = [...response.data.content]
      }
    } catch (error) {
      console.warn('[CategoryCache] 인기 카테고리 로드 실패:', error)
    }

    // 인기 카테고리가 size보다 적으면 해당 categoryType의 카테고리에서 채움
    if (result.length < size) {
      const existingIds = new Set(result.map(c => c.categoryId))
      const fallback = categoriesByType.value[categoryType] || []
      const remaining = fallback.filter(c => !existingIds.has(c.categoryId))
      const needed = size - result.length
      result = [...result, ...remaining.slice(0, needed)]
    }

    popularCategories.value[contentType] = result
    return result
  }

  // 캐시 초기화 (필요시 강제 새로고침)
  const clearCache = () => {
    allCategories.value = []
    categoriesByType.value = { ALL: [], FEED: [], PRODUCT: [] }
    popularCategories.value = { FEED: [], BATTLE: [], PRODUCT: [] }
    isLoaded.value = false
    lastFetchTime.value = null
    lastFetchByType.value = {}
  }

  // 카테고리 ID로 카테고리 찾기 — 모든 type 캐시(+ 레거시 allCategories)에서 탐색
  const findCategoryById = (categoryId) => {
    if (categoryId === null || categoryId === undefined) return null
    const targetId = Number(categoryId)
    if (Number.isNaN(targetId)) return null

    const sources = [
      allCategories.value,
      categoriesByType.value.ALL,
      categoriesByType.value.FEED,
      categoriesByType.value.PRODUCT,
    ]

    for (const list of sources) {
      if (!list?.length) continue
      for (const parent of list) {
        if (Number(parent.categoryId) === targetId) {
          return { category: parent, parent: null }
        }
        if (parent.children) {
          const sub = parent.children.find(c => Number(c.categoryId) === targetId)
          if (sub) {
            return { category: sub, parent }
          }
        }
      }
    }
    return null
  }

  return {
    // 상태
    allCategories,
    categoriesByType,
    popularCategories,
    isLoaded,
    isLoading,

    // 메서드
    loadAllCategories,
    loadPopularCategories,
    clearCache,
    findCategoryById,
    isCacheValid
  }
}

export default useCategoryCache
