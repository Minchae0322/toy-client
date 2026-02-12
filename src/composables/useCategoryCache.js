import { ref } from 'vue'

const categoryCache = ref(new Map())

export function useCategoryCache() {
  const getCategory = (id) => categoryCache.value.get(id)
  const setCategory = (id, data) => categoryCache.value.set(id, data)
  const clearCache = () => categoryCache.value.clear()

  return {
    categoryCache,
    getCategory,
    setCategory,
    clearCache
  }
}
