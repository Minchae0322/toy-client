<template>
  <div class="feed-product-section">
    <!-- 선택된 제품 카드 -->
    <div v-if="selectedProduct" class="selected-product-card">
      <img
        :src="selectedProduct.thumbnailUrl || '/default-product.png'"
        :alt="selectedProduct.name"
        class="selected-product-image"
      />
      <div class="selected-product-info">
        <p class="selected-product-name">{{ selectedProduct.name }}</p>
        <p class="selected-product-brand">{{ selectedProduct.brand }}</p>
      </div>
      <button type="button" class="btn-clear-product" @click="clearSelectedProduct" :disabled="disabled">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
        </svg>
      </button>
    </div>

    <!-- 검색 바 + 자동완성 -->
    <div v-else class="product-search-wrapper">
      <div class="product-search-row">
        <div class="product-search-bar">
          <svg class="product-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            class="product-search-input"
            placeholder="제품명을 검색하세요 (예: 나이키 조던 4)"
            v-model="productNameCustom"
            @input="handleProductNameInput"
            maxlength="40"
            ref="customInputRef"
            :disabled="disabled"
          />
          <div v-if="isSearchingProducts" class="product-search-spinner">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        <label
          v-if="showRegisterToggle"
          class="register-toggle"
          :class="{ active: registerAsProduct }"
        >
          <input type="checkbox" v-model="registerAsProduct" class="register-toggle-input" :disabled="disabled"/>
          <svg v-if="registerAsProduct" class="register-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
          <svg v-else class="register-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span class="register-toggle-text">{{ registerAsProduct ? '새 아이템으로 등록 중' : '새 아이템으로 등록' }}</span>
          <span v-if="registerAsProduct" class="register-toggle-close" aria-hidden="true">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <span class="register-toggle-close-text">끄기</span>
          </span>
        </label>
      </div>

      <!-- 새 아이템 등록 안내 (토글 OFF일 때만, 가벼운 한 줄) -->
      <p
        v-if="showRegisterToggle && !registerAsProduct"
        class="register-toggle-hint"
      >
        찾는 아이템이 없나요? 새 아이템으로 등록하면 요거픽·핫아이템에 연동돼요
      </p>

      <!-- 검색 결과 (등록 모드에서는 숨김) -->
      <div v-if="productSuggestions.length > 0 && !registerAsProduct" class="product-suggestions">
        <button
          v-for="p in productSuggestions"
          :key="p.productId"
          type="button"
          class="product-suggestion-item"
          @click="handleProductSelect(p)"
          :disabled="disabled"
        >
          <img
            :src="p.thumbnailUrl || '/default-product.png'"
            :alt="p.name"
            class="product-suggestion-thumb"
          />
          <div class="product-suggestion-info">
            <p class="product-suggestion-name">{{ p.name }}</p>
            <p class="product-suggestion-brand">{{ p.brand }}</p>
          </div>
          <svg class="product-suggestion-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- 새 제품 등록 ON: 브랜드 + 정가 + 대표 이미지 -->
      <div v-if="registerAsProduct" class="brand-input-block">
        <div class="register-block-header">
          <span class="register-block-title">새 아이템 정보 입력</span>
          <button type="button" class="register-help" aria-label="새 아이템 등록 안내">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="register-help-tooltip" role="tooltip">
              <span class="register-help-row">• 다른 분들도 검색해서 쓸 수 있게 돼요</span>
              <span class="register-help-row">• 요거픽, 핫아이템에도 연동돼요</span>
              <span class="register-help-row">• 관리자 승인 후 공개 · 중복 시 삭제될 수 있어요</span>
            </span>
          </button>
        </div>

        <div class="register-field">
          <label class="register-field-label">브랜드</label>
          <input
            type="text"
            class="form-input brand-input"
            placeholder="브랜드명 (예: 나이키)"
            v-model="productBrandCustom"
            maxlength="40"
            :disabled="disabled"
          />
        </div>

        <div class="register-field">
          <label class="register-field-label">제품 정가 <span class="register-field-hint">(선택, 원 단위)</span></label>
          <input
            type="text"
            inputmode="numeric"
            class="form-input brand-input"
            placeholder="예: 4500"
            maxlength="9"
            v-model="productPriceCustom"
            @input="handleProductPriceInput"
            :disabled="disabled"
          />
        </div>

        <div class="register-field" v-if="allowCustomProductImage">
          <label class="register-field-label">제품 대표 이미지</label>
          <div class="product-image-options">
            <button
              type="button"
              class="product-image-option"
              :class="{ active: productImageMode === 'feed', disabled: !feedThumbnailAvailable }"
              :disabled="!feedThumbnailAvailable || disabled"
              @click="productImageMode = 'feed'"
            >
              <div class="product-image-thumb">
                <img
                  v-if="feedThumbnailAvailable"
                  :src="feedThumbnailUrl"
                  alt="피드 대표 이미지"
                />
                <div v-else class="product-image-empty">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <div class="product-image-option-meta">
                <span class="product-image-radio" :class="{ checked: productImageMode === 'feed' && feedThumbnailAvailable }">
                  <svg v-if="productImageMode === 'feed' && feedThumbnailAvailable" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
                <span class="product-image-option-text">피드 대표 이미지 사용</span>
              </div>
            </button>

            <button
              type="button"
              class="product-image-option"
              :class="{ active: productImageMode === 'custom' }"
              @click="triggerProductImagePick"
              :disabled="disabled"
            >
              <div class="product-image-thumb">
                <img
                  v-if="customProductImage?.preview"
                  :src="customProductImage.preview"
                  alt="직접 업로드"
                />
                <div v-else class="product-image-empty plus">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                <div v-if="customProductImage?.uploading" class="product-image-upload-overlay">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
              <div class="product-image-option-meta">
                <span class="product-image-radio" :class="{ checked: productImageMode === 'custom' }">
                  <svg v-if="productImageMode === 'custom'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
                <span class="product-image-option-text">
                  {{ customProductImage?.preview ? '다른 이미지 변경' : '다른 이미지 업로드' }}
                </span>
              </div>
            </button>
          </div>
          <input
            ref="productImageInputRef"
            type="file"
            accept="image/*"
            class="product-image-hidden-input"
            @change="handleProductImageSelect"
          />
        </div>

        <!-- 이미지 변경 불가 모드 (edit) — 피드 사진 자동 사용 안내 -->
        <p v-else class="product-image-fixed-hint">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          제품 대표 이미지는 피드의 첫 번째 사진이 자동으로 사용됩니다
        </p>
      </div>

      <!-- 검색 전 안내 -->
      <p
        v-if="!productNameCustom?.trim() && !isSearchingProducts"
        class="product-search-hint"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        제품명을 자유롭게 적어주세요. 등록된 제품이 있으면 추천해드릴게요
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { productService } from '@/services/ProductService.js'
import { useFeed } from '@/services/FeedService.js'
import { useFile } from '@/services/FileService.js'

const feedService = useFeed()
const fileService = useFile()

const MAX_PRICE = 999999999

// v-model props (Vue 3.4+ defineModel)
const productNameCustom = defineModel('productNameCustom', { type: String, default: '' })
const productId = defineModel('productId', { type: [Number, String, null], default: null })

const props = defineProps({
  feedThumbnailUrl: { type: String, default: null },
  initialProduct: { type: Object, default: null },
  allowCustomProductImage: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['error'])

// 내부 상태
const selectedProduct = ref(props.initialProduct || null)
const productSuggestions = ref([])
const isSearchingProducts = ref(false)
const hasSearchedProducts = ref(false)
const registerAsProduct = ref(false)
const productBrandCustom = ref('')
const productPriceCustom = ref('')
const productImageMode = ref('feed') // 'feed' | 'custom'
const customProductImage = ref(null) // { preview, attachmentInfo, uploading, uploadFailed, file }

const customInputRef = ref(null)
const productImageInputRef = ref(null)

let productSearchTimer = null
let productSearchReqId = 0

// 외부에서 initialProduct가 비동기로 들어올 때 동기화 (edit 모달)
watch(() => props.initialProduct, (newProduct) => {
  if (newProduct && !selectedProduct.value) {
    selectedProduct.value = newProduct
  }
}, { immediate: false })

const showRegisterToggle = computed(() =>
  !selectedProduct.value &&
  productNameCustom.value?.trim().length >= 2 &&
  hasSearchedProducts.value &&
  !isSearchingProducts.value
)

const feedThumbnailAvailable = computed(() => !!props.feedThumbnailUrl)

// 제품 검색 (디바운스 + race-guard)
const handleProductNameInput = () => {
  const keyword = productNameCustom.value?.trim() || ''
  if (productSearchTimer) clearTimeout(productSearchTimer)

  if (keyword.length < 1) {
    productSuggestions.value = []
    hasSearchedProducts.value = false
    isSearchingProducts.value = false
    return
  }

  isSearchingProducts.value = true
  productSearchTimer = setTimeout(async () => {
    const currentKeyword = productNameCustom.value?.trim() || ''
    if (currentKeyword.length < 1) {
      isSearchingProducts.value = false
      return
    }
    const reqId = ++productSearchReqId
    try {
      const response = await productService.getProducts(
        { keyword: currentKeyword, status: 'APPROVED' },
        { page: 0, size: 8, sort: 'popularityScore,DESC' }
      )
      if (reqId !== productSearchReqId) return
      if (response.success && response.data) {
        productSuggestions.value = response.data.content || response.data || []
      } else {
        productSuggestions.value = []
      }
    } catch (error) {
      if (reqId !== productSearchReqId) return
      console.error('제품 검색 실패:', error)
      productSuggestions.value = []
    } finally {
      if (reqId === productSearchReqId) {
        isSearchingProducts.value = false
        hasSearchedProducts.value = true
      }
    }
  }, 200)
}

const handleProductSelect = (product) => {
  selectedProduct.value = product
  productId.value = product.productId ?? product.id ?? null
  productNameCustom.value = product.name
  productSuggestions.value = []
  registerAsProduct.value = false
  productBrandCustom.value = ''
  productPriceCustom.value = ''
  hasSearchedProducts.value = false
  resetCustomProductImage()
  productImageMode.value = 'feed'
}

const clearSelectedProduct = () => {
  selectedProduct.value = null
  productId.value = null
  productNameCustom.value = ''
  productSuggestions.value = []
  hasSearchedProducts.value = false
  registerAsProduct.value = false
  productBrandCustom.value = ''
  productPriceCustom.value = ''
  resetCustomProductImage()
  productImageMode.value = 'feed'
}

const resetCustomProductImage = () => {
  if (customProductImage.value?.preview && customProductImage.value.preview.startsWith('blob:')) {
    URL.revokeObjectURL(customProductImage.value.preview)
  }
  customProductImage.value = null
}

const triggerProductImagePick = () => {
  if (customProductImage.value?.preview) {
    productImageMode.value = 'custom'
  }
  productImageInputRef.value?.click()
}

const handleProductPriceInput = () => {
  let v = productPriceCustom.value.replace(/[^0-9]/g, '')
  if (v && parseInt(v, 10) > MAX_PRICE) v = String(MAX_PRICE)
  productPriceCustom.value = v
}

// 이미지 리사이즈 (장축 maxSize 픽셀 이하로)
const resizeImage = (file, maxSize = 1920, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      if (width <= maxSize && height <= maxSize) {
        resolve(file)
        return
      }

      if (width > height) {
        height = Math.round((height / width) * maxSize)
        width = maxSize
      } else {
        width = Math.round((width / height) * maxSize)
        height = maxSize
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('이미지 리사이징 실패'))
          return
        }
        const resized = new File([blob], file.name, { type: blob.type, lastModified: Date.now() })
        resolve(resized)
      }, file.type || 'image/jpeg', quality)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지 로드 실패'))
    }
    img.src = objectUrl
  })
}

const handleProductImageSelect = async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    emit('error', '이미지 파일만 업로드 가능합니다.')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    emit('error', '파일 크기는 10MB 이하만 가능합니다.')
    return
  }

  try {
    const resized = await resizeImage(file, 1920, 0.85)
    const previewUrl = URL.createObjectURL(resized)

    resetCustomProductImage()

    customProductImage.value = {
      file: resized,
      preview: previewUrl,
      uploading: true,
      uploadFailed: false,
      attachmentInfo: null
    }
    productImageMode.value = 'custom'

    const uploadResult = await fileService.upload(resized, { fileCode: 'PRODUCT' })
    if (uploadResult.success && uploadResult.data) {
      customProductImage.value.attachmentInfo = feedService.convertToAttachmentInfo(uploadResult.data)
      customProductImage.value.uploading = false
      const serverUrl = uploadResult.data.fileUrl || uploadResult.data.storedPath
      if (serverUrl) {
        URL.revokeObjectURL(customProductImage.value.preview)
        customProductImage.value.preview = serverUrl
      }
    } else {
      throw new Error(uploadResult.error || '업로드 실패')
    }
  } catch (err) {
    console.error('❌ 제품 이미지 업로드 실패:', err)
    if (customProductImage.value) {
      customProductImage.value.uploading = false
      customProductImage.value.uploadFailed = true
    }
    emit('error', '제품 이미지 업로드에 실패했습니다. 다시 시도해주세요.')
  }
}

// 부모가 submit 시점에 호출
const getSubmitState = () => ({
  productId: productId.value,
  productNameCustom: productNameCustom.value || '',
  registerAsProduct: registerAsProduct.value,
  productBrandCustom: productBrandCustom.value,
  productPriceCustom: productPriceCustom.value,
  productImageMode: productImageMode.value,
  customAttachmentInfo: customProductImage.value?.attachmentInfo || null,
  customUploading: !!customProductImage.value?.uploading,
  customUploadFailed: !!customProductImage.value?.uploadFailed
})

// draft 저장용 — File/Blob URL 제외
const getDraftPayload = () => ({
  selectedProduct: selectedProduct.value,
  registerAsProduct: registerAsProduct.value,
  productBrandCustom: productBrandCustom.value,
  productPriceCustom: productPriceCustom.value,
  productImageMode: productImageMode.value
})

const restoreFromDraft = (draft) => {
  if (!draft) return
  if (draft.selectedProduct) {
    selectedProduct.value = draft.selectedProduct
  }
  registerAsProduct.value = !!draft.registerAsProduct
  productBrandCustom.value = draft.productBrandCustom || ''
  productPriceCustom.value = draft.productPriceCustom || ''
  productImageMode.value = draft.productImageMode || 'feed'
}

defineExpose({
  getSubmitState,
  getDraftPayload,
  restoreFromDraft,
  clearSelectedProduct
})
</script>

<style scoped>
.feed-product-section { width: 100%; }

/* 선택된 제품 카드 */
.selected-product-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #E5E8EB;
  border-radius: 12px;
}
.selected-product-image {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
  background: #e5e7eb;
}
.selected-product-info { flex: 1; min-width: 0; }
.selected-product-name {
  font-size: 15px;
  font-weight: 600;
  color: #0A0E1A;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.selected-product-brand {
  font-size: 13px;
  color: #8B95A1;
  margin: 0;
}
.btn-clear-product {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #E5E8EB;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}
.btn-clear-product:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
}
.btn-clear-product:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-clear-product .icon { width: 16px; height: 16px; color: #8B95A1; }

/* 검색 바 */
.product-search-wrapper { display: flex; flex-direction: column; gap: 10px; }
.product-search-row { display: flex; align-items: stretch; gap: 8px; }

.product-search-bar {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: #F7F8FA;
  border: 1.5px solid #E5E8EB;
  border-radius: 12px;
  transition: all 0.15s ease;
  min-width: 0;
}
.product-search-bar:focus-within {
  background: #fff;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
}
.product-search-icon {
  width: 18px;
  height: 18px;
  color: #8B95A1;
  margin-left: 14px;
  flex-shrink: 0;
}
.product-search-input {
  flex: 1;
  padding: 13px 14px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  color: #0A0E1A;
  min-width: 0;
}
.product-search-input::placeholder { color: #B0B8C1; font-weight: 400; }

.product-search-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}
.product-search-spinner svg {
  width: 18px;
  height: 18px;
  color: #9333ea;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 새 제품 등록 토글 */
.register-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  background: #F7F8FA;
  border: 1.5px solid #E5E8EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.register-toggle:hover { border-color: #9333ea; background: #FAF5FF; }
.register-toggle.active {
  background: #9333ea;
  border-color: #9333ea;
  color: #fff;
}
.register-toggle-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}
.register-toggle-icon { width: 16px; height: 16px; color: #8B95A1; }
.register-toggle.active .register-toggle-icon { color: #fff; }
.register-toggle-text {
  font-size: 13px;
  font-weight: 700;
  color: #4E5968;
  letter-spacing: -0.1px;
}
.register-toggle.active .register-toggle-text { color: #fff; }

/* 끄기 칩 (active 상태에서 우측 표시) */
.register-toggle-close {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px 3px 5px;
  margin-left: 4px;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  border-radius: 999px;
  line-height: 1;
  transition: background 0.15s ease;
}
.register-toggle-close svg {
  width: 11px;
  height: 11px;
  color: #fff;
  flex-shrink: 0;
}
.register-toggle-close-text {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: -0.1px;
}
.register-toggle:hover .register-toggle-close {
  background: rgba(255, 255, 255, 0.34);
}

/* 새 아이템 등록 안내 (가벼운 보조 텍스트) */
.register-toggle-hint {
  margin: 2px 2px 0;
  padding: 0;
  font-size: 11.5px;
  font-weight: 500;
  color: #94A3B8;
  line-height: 1.5;
  letter-spacing: -0.1px;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

/* 자동완성 */
.product-suggestions { display: flex; flex-direction: column; gap: 6px; margin-top: 2px; }
.product-suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #E5E8EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  font-family: inherit;
}
.product-suggestion-item:hover { border-color: #9333ea; background: #FAF5FF; }
.product-suggestion-thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
  background: #F7F8FA;
  flex-shrink: 0;
}
.product-suggestion-info { flex: 1; min-width: 0; }
.product-suggestion-name {
  font-size: 14px;
  font-weight: 600;
  color: #0A0E1A;
  margin: 0 0 2px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-suggestion-brand {
  font-size: 12px;
  color: #8B95A1;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-suggestion-arrow { width: 16px; height: 16px; color: #B0B8C1; flex-shrink: 0; }
.product-suggestion-item:hover .product-suggestion-arrow { color: #9333ea; }

/* 새 제품 정보 블록 */
.brand-input-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  background: #FAF5FF;
  border: 1px solid #E9D5FF;
  border-radius: 12px;
}
.register-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.register-block-title {
  font-size: 13px;
  font-weight: 800;
  color: #9333ea;
  letter-spacing: -0.1px;
}
.register-help {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #8B95A1;
  cursor: help;
  transition: all 0.15s ease;
}
.register-help:hover, .register-help:focus-visible {
  background: #fff;
  color: #9333ea;
  outline: none;
}
.register-help svg { width: 16px; height: 16px; }
.register-help-tooltip {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: max-content;
  max-width: 260px;
  padding: 10px 12px;
  background: #0A0E1A;
  color: #fff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  text-align: left;
  white-space: normal;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
  z-index: 20;
  pointer-events: none;
}
.register-help-tooltip::before {
  content: '';
  position: absolute;
  top: -4px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #0A0E1A;
  transform: rotate(45deg);
  border-radius: 1px;
}
.register-help:hover .register-help-tooltip,
.register-help:focus-visible .register-help-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.register-help-row { display: block; }

.register-field { display: flex; flex-direction: column; gap: 8px; }
.register-field-label {
  font-size: 13px;
  font-weight: 700;
  color: #4E5968;
  letter-spacing: -0.1px;
}
.register-field-hint {
  font-size: 11px;
  font-weight: 500;
  color: #94A3B8;
  margin-left: 4px;
}
.brand-input {
  padding: 11px 14px;
  font-size: 14px;
  background: #fff;
  width: 100%;
  border: 1.5px solid #E5E8EB;
  border-radius: 10px;
  font-family: inherit;
  outline: none;
}
.brand-input:focus { border-color: #9333ea; box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08); }

.product-image-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.product-image-option {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 10px;
  background: #fff;
  border: 1.5px solid #E5E8EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  text-align: left;
}
.product-image-option:hover:not(.disabled):not(:disabled) { border-color: #9333ea; }
.product-image-option.active { border-color: #9333ea; background: #F3EAFD; }
.product-image-option.disabled, .product-image-option:disabled { opacity: 0.5; cursor: not-allowed; }

.product-image-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #F7F8FA;
}
.product-image-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.product-image-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B0B8C1;
}
.product-image-empty svg { width: 28px; height: 28px; }
.product-image-empty.plus { background: #F7F8FA; color: #9333ea; }
.product-image-upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-image-upload-overlay svg {
  width: 24px;
  height: 24px;
  color: #fff;
  animation: spin 0.8s linear infinite;
}
.product-image-option-meta { display: flex; align-items: center; gap: 6px; }
.product-image-radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid #C7CDD5;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.product-image-radio.checked { border-color: #9333ea; background: #9333ea; }
.product-image-radio svg { width: 10px; height: 10px; color: #fff; }
.product-image-option-text {
  font-size: 12px;
  font-weight: 600;
  color: #4E5968;
  letter-spacing: -0.1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-image-option.active .product-image-option-text { color: #9333ea; }

.product-image-hidden-input { display: none; }

.product-image-fixed-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 10px 12px;
  background: #F7F8FA;
  border-radius: 8px;
  font-size: 12px;
  color: #8B95A1;
}

.product-search-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 2px 0 0 2px;
  font-size: 12px;
  color: #8B95A1;
}
.product-search-hint svg { color: #8B95A1; flex-shrink: 0; }

@media (max-width: 480px) {
  .product-search-row { flex-direction: column; }
  .register-toggle { justify-content: center; padding: 10px 14px; }
}
</style>
