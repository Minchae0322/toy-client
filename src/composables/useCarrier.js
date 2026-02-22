// composables/useCarrier.js

import { ref, reactive, computed, readonly } from 'vue'
import { carrierService } from '@/services/CarrierService.js'

export function useCarrier() {
  const loading = ref(false)
  const error = ref(null)
  const carriers = ref([])
  const currentCarrier = ref(null)

  const hasCarriers = computed(() => carriers.value.length > 0)

  const clearError = () => { error.value = null }

  const handleError = (err, context = '') => {
    console.error(`[CARRIER_COMPOSABLE] ${context} 오류:`, err)
    error.value = err.message || '알 수 없는 오류가 발생했습니다.'
  }

  const fetchMyCarriers = async () => {
    loading.value = true
    clearError()
    try {
      const response = await carrierService.getMyCarriers()
      if (response.success && response.data) {
        carriers.value = response.data
        return true
      }
      throw new Error(response.error || '캐리어 목록을 불러오는데 실패했습니다.')
    } catch (err) {
      handleError(err, '캐리어 목록 조회')
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchCarrier = async (carrierId) => {
    if (!carrierId) { error.value = '캐리어 ID가 필요합니다.'; return null }
    loading.value = true
    clearError()
    try {
      const response = await carrierService.getCarrier(carrierId)
      if (response.success && response.data) {
        currentCarrier.value = response.data
        return response.data
      }
      throw new Error(response.error || '캐리어 정보를 불러오는데 실패했습니다.')
    } catch (err) {
      handleError(err, '캐리어 조회')
      return null
    } finally {
      loading.value = false
    }
  }

  const createCarrier = async (data) => {
    loading.value = true
    clearError()
    try {
      const response = await carrierService.createCarrier(data)
      if (response.success) {
        await fetchMyCarriers()
        return { success: true, data: response.data }
      }
      throw new Error(response.error || '캐리어 생성에 실패했습니다.')
    } catch (err) {
      handleError(err, '캐리어 생성')
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateSkin = async (carrierId, data) => {
    try {
      const response = await carrierService.updateCarrierSkin(carrierId, data)
      if (response.success) {
        if (currentCarrier.value?.id === carrierId) {
          currentCarrier.value = { ...currentCarrier.value, skinType: data.skinType, skinColor: data.skinColor }
        }
        return true
      }
      throw new Error(response.error || '스킨 변경에 실패했습니다.')
    } catch (err) {
      handleError(err, '스킨 변경')
      return false
    }
  }

  const deleteCarrier = async (carrierId) => {
    try {
      const response = await carrierService.deleteCarrier(carrierId)
      if (response.success) {
        carriers.value = carriers.value.filter(c => c.id !== carrierId)
        if (currentCarrier.value?.id === carrierId) currentCarrier.value = null
        return true
      }
      throw new Error(response.error || '캐리어 삭제에 실패했습니다.')
    } catch (err) {
      handleError(err, '캐리어 삭제')
      return false
    }
  }

  const addItem = async (carrierId, data) => {
    try {
      const response = await carrierService.addItem(carrierId, data)
      if (response.success) return { success: true, data: response.data }
      throw new Error(response.error || '아이템 추가에 실패했습니다.')
    } catch (err) {
      handleError(err, '아이템 추가')
      return { success: false, error: err.message }
    }
  }

  const removeItem = async (carrierId, itemId) => {
    try {
      const response = await carrierService.removeItem(carrierId, itemId)
      if (response.success) {
        if (currentCarrier.value?.id === carrierId) {
          currentCarrier.value = {
            ...currentCarrier.value,
            items: currentCarrier.value.items.filter(i => i.id !== itemId)
          }
        }
        return true
      }
      throw new Error(response.error || '아이템 제거에 실패했습니다.')
    } catch (err) {
      handleError(err, '아이템 제거')
      return false
    }
  }

  const addSticker = async (carrierId, data) => {
    try {
      const response = await carrierService.addSticker(carrierId, data)
      if (response.success) return { success: true, data: response.data }
      throw new Error(response.error || '스티커 추가에 실패했습니다.')
    } catch (err) {
      handleError(err, '스티커 추가')
      return { success: false, error: err.message }
    }
  }

  const updateSticker = async (carrierId, stickerId, data) => {
    try {
      const response = await carrierService.updateSticker(carrierId, stickerId, data)
      if (response.success) return true
      throw new Error(response.error || '스티커 수정에 실패했습니다.')
    } catch (err) {
      handleError(err, '스티커 수정')
      return false
    }
  }

  const removeSticker = async (carrierId, stickerId) => {
    try {
      const response = await carrierService.removeSticker(carrierId, stickerId)
      if (response.success) {
        if (currentCarrier.value?.id === carrierId) {
          currentCarrier.value = {
            ...currentCarrier.value,
            stickers: currentCarrier.value.stickers.filter(s => s.id !== stickerId)
          }
        }
        return true
      }
      throw new Error(response.error || '스티커 제거에 실패했습니다.')
    } catch (err) {
      handleError(err, '스티커 제거')
      return false
    }
  }

  const updatePositions = async (carrierId, items, stickers) => {
    try {
      const promises = []
      if (items?.length) promises.push(carrierService.updateItemPositions(carrierId, items))
      if (stickers?.length) promises.push(carrierService.updateStickerPositions(carrierId, stickers))
      await Promise.all(promises)
      return true
    } catch (err) {
      handleError(err, '위치 업데이트')
      return false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    carriers.value = []
    currentCarrier.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    carriers: readonly(carriers),
    currentCarrier: readonly(currentCarrier),
    hasCarriers,
    fetchMyCarriers,
    fetchCarrier,
    createCarrier,
    updateSkin,
    deleteCarrier,
    addItem,
    removeItem,
    addSticker,
    updateSticker,
    removeSticker,
    updatePositions,
    clearError,
    reset
  }
}
