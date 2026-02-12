import { ref } from 'vue'
import { categoryService } from '@/services/CategoryService.js'

const allCategories = ref([])
let allCategoriesLoaded = false

const popularCache = new Map()
const POPULAR_CACHE_TTL = 5 * 60 * 1000

export function useCategoryCache() {
  async function loadAllCategories() {
    if (allCategoriesLoaded && allCategories.value.length > 0) {
      return allCategories.value
    }
    try {
      const res = await categoryService.getCategories()
      allCategories.value = res.data || res || []
      allCategoriesLoaded = true
    } catch (e) {
      console.error('[useCategoryCache] 전체 카테고리 로드 실패:', e)
      allCategories.value = []
    }
    return allCategories.value
  }

  async function loadPopularCategories(type, size = 10) {
    const cacheKey = `${type}_${size}`
    const cached = popularCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < POPULAR_CACHE_TTL) {
      return cached.data
    }
    try {
      const res = await categoryService.getTopCategories(type, size)
      const data = res.data?.content || res.data || res || []
      popularCache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (e) {
      console.error('[useCategoryCache] 인기 카테고리 로드 실패:', e)
      return cached?.data || []
    }
  }

  return {
    allCategories,
    loadAllCategories,
    loadPopularCategories
  }
}
