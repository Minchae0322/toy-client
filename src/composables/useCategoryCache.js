// src/composables/useCategoryCache.js
import { ref } from 'vue'
import { categoryService } from '@/services/CategoryService.js'

// 전역 캐시 (싱글톤)
const allCategories = ref([])
const popularCategories = ref({
  FEED: [],
  BATTLE: [],
  PRODUCT: []
})
const isLoaded = ref(false)
const isLoading = ref(false)
const lastFetchTime = ref(null)

// 캐시 유효 시간 (30분)
const CACHE_TTL = 30 * 60 * 1000

export function useCategoryCache() {

  // 캐시가 유효한지 확인
  const isCacheValid = () => {
    if (!isLoaded.value || !lastFetchTime.value) return false
    return Date.now() - lastFetchTime.value < CACHE_TTL
  }

  // 전체 카테고리 로드
  const loadAllCategories = async (force = false) => {
    // 이미 유효한 캐시가 있으면 스킵
    if (!force && isCacheValid() && allCategories.value.length > 0) {
      return allCategories.value
    }

    // 이미 로딩 중이면 대기
    if (isLoading.value) {
      return new Promise((resolve) => {
        const checkLoading = setInterval(() => {
          if (!isLoading.value) {
            clearInterval(checkLoading)
            resolve(allCategories.value)
          }
        }, 100)
      })
    }

    isLoading.value = true

    try {
      const response = await categoryService.getCategories({ isActive: true })
      if (response.success && response.data) {
        allCategories.value = response.data.map(cat => ({
          ...cat,
          children: cat.children || []
        }))
        lastFetchTime.value = Date.now()
        isLoaded.value = true
      }
    } catch (error) {
      console.error('[CategoryCache] 카테고리 로드 실패:', error)
    } finally {
      isLoading.value = false
    }

    return allCategories.value
  }

  // 인기 카테고리 로드 (타입별)
  const loadPopularCategories = async (type, size = 8, force = false) => {
    // 이미 유효한 캐시가 있고 충분한 개수면 스킵
    if (!force && isCacheValid() && popularCategories.value[type]?.length >= size) {
      return popularCategories.value[type].slice(0, size)
    }

    // 전체 카테고리 먼저 로드 (fallback용)
    await loadAllCategories()

    let result = []

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const formatDate = (date) => date.toISOString().split('T')[0]

      const response = await categoryService.getPopularCategories({
        type,
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

    // 인기 카테고리가 size보다 적으면 전체 카테고리에서 채움 (1뎁스 with children)
    if (result.length < size) {
      const existingIds = new Set(result.map(c => c.categoryId))
      const remaining = allCategories.value.filter(c => !existingIds.has(c.categoryId))
      const needed = size - result.length
      result = [...result, ...remaining.slice(0, needed)]
    }

    popularCategories.value[type] = result
    return result
  }

  // 캐시 초기화 (필요시 강제 새로고침)
  const clearCache = () => {
    allCategories.value = []
    popularCategories.value = { FEED: [], BATTLE: [], PRODUCT: [] }
    isLoaded.value = false
    lastFetchTime.value = null
  }

  // 카테고리 ID로 카테고리 찾기
  const findCategoryById = (categoryId) => {
    for (const parent of allCategories.value) {
      if (parent.categoryId === categoryId) {
        return { category: parent, parent: null }
      }
      if (parent.children) {
        const sub = parent.children.find(c => c.categoryId === categoryId)
        if (sub) {
          return { category: sub, parent }
        }
      }
    }
    return null
  }

  return {
    // 상태
    allCategories,
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
