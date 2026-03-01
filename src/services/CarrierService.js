// services/CarrierService.js

import { BaseApiService } from './BaseApiService.js'
import { ENV, getServiceUrl } from '@/config/env.js'

export const CARRIER_TYPE = Object.freeze({
  DEFAULT: 'DEFAULT',
  RETRO: 'RETRO',
  SPACE: 'SPACE',
  KITTY: 'KITTY'
})

const VALID_CARRIER_TYPES = new Set(Object.values(CARRIER_TYPE))

export const STICKER_TYPE = Object.freeze({
  EMOJI: 'EMOJI',
  PHOTO_TAG: 'PHOTO_TAG',
  PRESET: 'PRESET'
})

const VALID_STICKER_TYPES = new Set(Object.values(STICKER_TYPE))

class CarrierService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('CONTENT')
    super(baseURL, 'CARRIER')
  }

  // ==================== 캐리어 CRUD ====================

  async getMyCarriers() {
    const response = await this.get('/carriers/me')
    if (response.success && Array.isArray(response.data)) {
      response.data = response.data.map(c => this.normalizeCarrierSummary(c))
    }
    return response
  }

  async getCarrier(carrierId) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    const response = await this.get(`/carriers/${carrierId}`)
    if (response.success && response.data) {
      response.data = this.normalizeCarrierDetail(response.data)
    }
    return response
  }

  async createCarrier(data) {
    const validation = this.validateCreateCarrier(data)
    if (!validation.isValid) throw new Error(validation.errors.join(', '))

    const skinType = data.skinType || CARRIER_TYPE.DEFAULT
    if (!VALID_CARRIER_TYPES.has(skinType)) {
      throw new Error(`유효하지 않은 캐리어 타입입니다: ${skinType}`)
    }

    return await this.post('/carriers', {
      name: data.name.trim(),
      skinType,
      skinColor: data.skinColor || null
    })
  }

  async updateCarrierSkin(carrierId, data) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!data.skinType) throw new Error('스킨 타입은 필수입니다.')
    if (!VALID_CARRIER_TYPES.has(data.skinType)) {
      throw new Error(`유효하지 않은 캐리어 타입입니다: ${data.skinType}`)
    }

    return await this.patch(`/carriers/${carrierId}/skin`, {
      skinType: data.skinType,
      skinColor: data.skinColor || null
    })
  }

  async deleteCarrier(carrierId) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    return await this.delete(`/carriers/${carrierId}`)
  }

  // ==================== 캐리어 아이템 ====================

  async addItem(carrierId, data) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!data.productId) throw new Error('상품 ID가 필요합니다.')

    return await this.post(`/carriers/${carrierId}/items`, {
      productId: data.productId,
      positionX: data.positionX ?? 0.5,
      positionY: data.positionY ?? 0.5,
      zIndex: data.zIndex ?? 0
    })
  }

  async updateItemPosition(carrierId, itemId, data) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!itemId) throw new Error('아이템 ID가 필요합니다.')

    return await this.patch(`/carriers/${carrierId}/items/${itemId}/position`, {
      positionX: data.positionX,
      positionY: data.positionY,
      zIndex: data.zIndex ?? null
    })
  }

  async updateItemPositions(carrierId, items) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!Array.isArray(items) || items.length === 0) throw new Error('아이템 목록이 필요합니다.')

    return await this.put(`/carriers/${carrierId}/items/positions`, items)
  }

  async removeItem(carrierId, itemId) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!itemId) throw new Error('아이템 ID가 필요합니다.')

    return await this.delete(`/carriers/${carrierId}/items/${itemId}`)
  }

  // ==================== 캐리어 스티커 ====================

  async addSticker(carrierId, data) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!data.stickerType) throw new Error('스티커 타입이 필요합니다.')
    if (!VALID_STICKER_TYPES.has(data.stickerType)) {
      throw new Error(`유효하지 않은 스티커 타입입니다: ${data.stickerType}`)
    }

    return await this.post(`/carriers/${carrierId}/stickers`, {
      stickerType: data.stickerType,
      content: data.content || null,
      imageUrl: data.imageUrl || null,
      positionX: data.positionX ?? 0.5,
      positionY: data.positionY ?? 0.5,
      zIndex: data.zIndex ?? 0,
      rotation: data.rotation ?? 0,
      scaleRatio: data.scaleRatio ?? 1.0
    })
  }

  async updateSticker(carrierId, stickerId, data) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!stickerId) throw new Error('스티커 ID가 필요합니다.')

    const body = {
      positionX: data.positionX,
      positionY: data.positionY,
      zIndex: data.zIndex ?? null,
      rotation: data.rotation ?? null,
      scaleRatio: data.scaleRatio ?? null
    }
    if ('imageUrl' in data) body.imageUrl = data.imageUrl ?? null
    return await this.patch(`/carriers/${carrierId}/stickers/${stickerId}`, body)
  }

  async updateStickerPositions(carrierId, stickers) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!Array.isArray(stickers) || stickers.length === 0) throw new Error('스티커 목록이 필요합니다.')

    return await this.put(`/carriers/${carrierId}/stickers/positions`, stickers)
  }

  async removeSticker(carrierId, stickerId) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!stickerId) throw new Error('스티커 ID가 필요합니다.')

    return await this.delete(`/carriers/${carrierId}/stickers/${stickerId}`)
  }

  async bulkDeleteStickers(carrierId, stickerIds) {
    if (!carrierId) throw new Error('캐리어 ID가 필요합니다.')
    if (!Array.isArray(stickerIds) || stickerIds.length === 0) throw new Error('삭제할 스티커 ID 목록이 필요합니다.')
    if (stickerIds.length > 50) throw new Error('일괄 삭제는 최대 50개까지 가능합니다.')

    return await this.post(`/carriers/${carrierId}/stickers/delete`, { stickerIds })
  }

  // ==================== 정규화 ====================

  normalizeCarrierSummary(carrier) {
    if (!carrier) return null
    return {
      id: carrier.id,
      skinType: carrier.skinType?.code || carrier.skinType || CARRIER_TYPE.DEFAULT,
      skinColor: carrier.skinColor || '#FFFFFF',
      isDefault: carrier.isDefault ?? false,
      itemCount: carrier.itemCount ?? 0,
      stickerCount: carrier.stickerCount ?? 0
    }
  }

  normalizeCarrierDetail(carrier) {
    if (!carrier) return null
    return {
      id: carrier.id,
      name: carrier.name || '',
      skinType: carrier.skinType?.code || carrier.skinType || CARRIER_TYPE.DEFAULT,
      skinColor: carrier.skinColor || '#FFFFFF',
      isDefault: carrier.isDefault ?? false,
      items: (carrier.items || []).map(item => this.normalizeItem(item)),
      stickers: (carrier.stickers || []).map(sticker => this.normalizeSticker(sticker))
    }
  }

  normalizeItem(item) {
    if (!item) return null
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName || '',
      brandName: item.brandName || '',
      productImageUrl: item.productImageUrl || null,
      positionX: item.positionX ?? 0,
      positionY: item.positionY ?? 0,
      zIndex: item.zIndex ?? 0
    }
  }

  /**
   * stickerType이 Java enum 객체({ displayName, description })로 올 수 있으므로 문자열로 변환
   */
  _resolveStickerType(raw) {
    if (!raw) return ''
    if (typeof raw === 'string') return raw
    // enum 객체인 경우 displayName으로 매핑
    const nameMap = { '사진택': 'PHOTO_TAG', '이모지': 'EMOJI', '프리셋': 'PRESET' }
    if (raw.displayName && nameMap[raw.displayName]) return nameMap[raw.displayName]
    // code 필드가 있으면 사용
    if (raw.code) return raw.code
    if (raw.name) return raw.name
    return String(raw)
  }

  normalizeSticker(sticker) {
    if (!sticker) return null
    return {
      id: sticker.id,
      stickerType: this._resolveStickerType(sticker.stickerType),
      content: sticker.content || null,
      imageUrl: sticker.imageUrl || null,
      positionX: sticker.positionX ?? 0,
      positionY: sticker.positionY ?? 0,
      zIndex: sticker.zIndex ?? 0,
      rotation: sticker.rotation ?? 0,
      scaleRatio: sticker.scaleRatio ?? 1.0
    }
  }

  // ==================== 검증 ====================

  validateCreateCarrier(data) {
    const errors = []
    if (!data.name?.trim()) errors.push('캐리어 이름은 필수입니다.')
    if (data.name?.length > 50) errors.push('캐리어 이름은 50자 이하여야 합니다.')
    if (data.skinColor && !/^#[0-9A-Fa-f]{6}$/.test(data.skinColor)) {
      errors.push('스킨 색상은 #HEX 형식이어야 합니다.')
    }
    return { isValid: errors.length === 0, errors }
  }
}

export const carrierService = new CarrierService()
export default carrierService
