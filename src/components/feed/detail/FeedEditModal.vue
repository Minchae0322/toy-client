<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <header class="modal-header">
            <button class="btn-back" @click="handleClose">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="header-title">피드 수정</h1>
            <div class="header-spacer"></div>
          </header>

          <!-- Content -->
          <div class="modal-body">
            <!-- 사진 미리보기 (수정 불가) -->
            <section class="card photo-section">
              <div class="card-header">
                <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <h2 class="card-title">사진</h2>
                <span class="photo-count">{{ images.length }}장</span>
              </div>
              <p class="photo-notice">사진은 수정할 수 없습니다</p>
              <div class="photo-preview-list">
                <div v-for="(image, index) in images" :key="index" class="photo-preview-item">
                  <img :src="image.fileUrl" :alt="`사진 ${index + 1}`" />
                  <div class="photo-order">{{ index + 1 }}</div>
                </div>
              </div>
            </section>

            <!-- 제품 정보 -->
            <section class="card">
              <label class="form-label required">어떤 제품인가요?</label>

              <!-- 선택된 제품 표시 -->
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
                <button type="button" class="btn-clear-product" @click="clearSelectedProduct">
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                  </svg>
                </button>
              </div>

              <!-- 제품 입력 모드 선택 -->
              <div v-else class="product-input-wrapper">
                <!-- 카드 선택 (초기 상태) -->
                <div v-if="productInputMode === 'select'" class="product-mode-cards">
                  <button type="button" class="mode-card" @click="openProductModal">
                    <div class="mode-card-icon search">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                      </svg>
                    </div>
                    <div class="mode-card-content">
                      <h4 class="mode-card-title">제품 연동</h4>
                      <p class="mode-card-desc">등록된 제품 정보 연결</p>
                    </div>
                  </button>

                  <button type="button" class="mode-card" @click="productInputMode = 'custom'">
                    <div class="mode-card-icon custom">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </div>
                    <div class="mode-card-content">
                      <h4 class="mode-card-title">직접 작성</h4>
                      <p class="mode-card-desc">제품명만 간단히 입력</p>
                    </div>
                  </button>
                </div>

                <!-- 직접 작성 모드 -->
                <div v-else class="custom-mode-content">
                  <div class="custom-input-header">
                    <span class="custom-input-label">직접 작성</span>
                    <button type="button" class="btn-back-to-select" @click="resetProductInput">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    class="form-input"
                    placeholder="브랜드 + 제품명 (예: 나이키 조던 4 레트로)"
                    v-model="editData.productNameCustom"
                    ref="customInputRef"
                  />
                </div>
              </div>
            </section>

            <!-- 카테고리 -->
            <section class="card">
              <label class="form-label required">카테고리</label>
              <CategoryChipSelector
                v-model="editData.subCategoryId"
                content-type="FEED"
                @select="handleCategorySelect"
              />
            </section>

            <!-- 한줄평 -->
            <section class="card">
              <label class="form-label required">
                한줄평
                <span class="char-count" :class="{ error: editData.review.length > 100 }">{{ editData.review.length }}/100</span>
              </label>
              <textarea
                class="form-textarea"
                placeholder="제품에 대한 솔직한 리뷰를 작성해주세요"
                v-model="editData.review"
                rows="3"
                maxlength="100"
              ></textarea>
            </section>

            <!-- 구매처 -->
            <section class="card">
              <label class="form-label">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="label-with-required">구매처<span class="required-mark">*</span></span>
              </label>
              <div class="quick-store-list">
                <button
                  v-for="store in quickStores"
                  :key="store"
                  type="button"
                  :class="['quick-store-btn', { active: editData.buyPlace === store }]"
                  @click="selectStore(store)"
                >
                  {{ store }}
                </button>
              </div>
              <input
                v-if="!quickStores.includes(editData.buyPlace)"
                type="text"
                class="form-input mt-8"
                placeholder="직접 입력 (예: 백화점, 해외직구)"
                v-model="editData.buyPlace"
              />
            </section>

            <!-- 구매 가격 -->
            <section class="card">
              <label class="form-label">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                구매 가격
                <span class="optional-label">(선택)</span>
              </label>
              <div class="price-input-box">
                <input
                  type="text"
                  inputmode="numeric"
                  class="price-input-field"
                  placeholder="0"
                  :value="formattedPrice"
                  @input="handlePriceInput"
                />
                <span class="price-suffix">원</span>
              </div>
            </section>

            <!-- 제품 평가 -->
            <section class="card">
              <label class="form-label required">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                제품 평가
              </label>
              <div class="status-grid">
                <button
                  v-for="ev in evaluations"
                  :key="ev.value"
                  :class="['status-btn', ev.value.toLowerCase(), { active: editData.evaluation === ev.value }]"
                  @click="editData.evaluation = ev.value"
                  type="button"
                >
                  <span>{{ ev.label }}</span>
                </button>
              </div>
            </section>

            <!-- 해시태그 -->
            <section class="card">
              <label class="form-label">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                </svg>
                해시태그
                <span class="count-badge">{{ editData.hashtags.length }}/5</span>
              </label>

              <!-- 선택된 해시태그 -->
              <div v-if="editData.hashtags.length > 0" class="selected-hashtags-list">
                <span v-for="(tag, idx) in editData.hashtags" :key="idx" class="hashtag-chip">
                  <span class="hashtag-symbol">#</span>{{ tag }}
                  <button class="remove-tag" @click="removeHashtag(idx)" type="button">
                    <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                  </button>
                </span>
              </div>

              <!-- 해시태그 입력 -->
              <div v-if="editData.hashtags.length < 5" class="hashtag-input-box">
                <span class="input-prefix">#</span>
                <input
                  type="text"
                  class="hashtag-input-field"
                  placeholder="태그 입력"
                  v-model="hashtagInput"
                  @keydown.enter.prevent="addHashtag"
                  @keydown.space.prevent="addHashtag"
                  @keydown.,.prevent="addHashtag"
                />
                <button
                  type="button"
                  class="btn-add-tag"
                  @click="addHashtag"
                  :disabled="!hashtagInput.trim()"
                >
                  추가
                </button>
              </div>

              <!-- 추천 태그 -->
              <div v-if="editData.hashtags.length < 5" class="popular-hashtags">
                <p class="popular-title">추천 태그 <span class="popular-subtitle">클릭하여 추가</span></p>
                <div class="popular-list">
                  <button
                    v-for="tag in popularHashtags"
                    :key="tag"
                    class="popular-tag"
                    @click="addPopularHashtag(tag)"
                    :disabled="editData.hashtags.includes(tag)"
                    type="button"
                  >
                    #{{ tag }}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- Fixed Bottom -->
          <div class="modal-footer">
            <button class="btn-submit" :disabled="!canSave || saving" @click="handleSave" type="button">
              <svg v-if="saving" class="spinner" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
              <span>{{ saving ? '저장 중...' : '수정 완료' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Product Select Modal -->
    <ProductSelectModal
      v-if="showProductModal"
      @select="handleProductSelect"
      @close="closeProductModal"
    />

  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { feedService } from '@/services/FeedService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import ProductSelectModal from '@/components/oneMouth/create/ProductSelectModal.vue'
import CategoryChipSelector from '@/components/common/CategoryChipSelector.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  feed: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])
const { open } = useConfirmDialog()

const saving = ref(false)
const hashtagInput = ref('')
const customInputRef = ref(null)

// Product
const showProductModal = ref(false)
const selectedProduct = ref(null)
const productInputMode = ref('select')

const editData = ref({
  productId: null,
  productNameCustom: '',
  subCategoryId: null,
  review: '',
  buyPlace: '',
  buyPrice: null,
  evaluation: 'BEST',
  hashtags: []
})

const images = computed(() => props.feed?.attachmentFiles || [])

const quickStores = ['무신사', '쿠팡', '네이버', '올리브영', '29CM', 'SSG']

const evaluations = [
  { value: 'BEST', label: '강추' },
  { value: 'GOOD', label: '추천' },
  { value: 'OKAY', label: '괜찮음' },
  { value: 'BAD', label: '비추천' }
]

const popularHashtags = ['데일리', 'OOTD', '추천템', '갓성비', '인생템']

const formattedPrice = computed(() => {
  if (!editData.value.buyPrice) return ''
  return Number(editData.value.buyPrice).toLocaleString()
})

const canSave = computed(() => {
  // 제품: productId가 있거나 productNameCustom이 입력되어야 함
  const hasProduct = editData.value.productId || editData.value.productNameCustom.trim().length > 0

  return hasProduct &&
         editData.value.subCategoryId &&
         editData.value.review.trim().length > 0 &&
         editData.value.buyPlace.trim().length > 0 &&
         editData.value.evaluation
})

// 피드 데이터로 초기화
watch(() => props.visible, async (visible) => {
  if (visible && props.feed) {

    const buyPlace = props.feed.buyPlace || ''
    const evaluation = typeof props.feed.feedEvaluation === 'object'
      ? props.feed.feedEvaluation?.code
      : (props.feed.feedEvaluation || props.feed.evaluation || 'BEST')
    const hashtags = (props.feed.hashtags || []).map(h =>
      typeof h === 'object' ? h.name : h
    )

    // 제품 정보 초기화
    if (props.feed.product) {
      selectedProduct.value = {
        productId: props.feed.product.id,
        name: props.feed.product.name,
        brand: props.feed.product.brand,
        thumbnailUrl: props.feed.product.thumbnailUrl
      }
      productInputMode.value = 'select'
    } else if (props.feed.productNameCustom) {
      productInputMode.value = 'custom'
    }

    // 카테고리 정보 초기화
    const subCategoryDetail = props.feed.subCategoryDetail

    editData.value = {
      productId: props.feed.product?.id || null,
      productNameCustom: props.feed.productNameCustom || props.feed.product?.name || '',
      subCategoryId: subCategoryDetail?.subCategoryId || null,
      review: props.feed.review || '',
      buyPlace: buyPlace,
      buyPrice: props.feed.buyPrice || null,
      evaluation: evaluation,
      hashtags: hashtags
    }
  }
}, { immediate: true })

// Product Methods
const openProductModal = () => { showProductModal.value = true }
const closeProductModal = () => { showProductModal.value = false }

const handleProductSelect = (product) => {
  selectedProduct.value = product
  editData.value.productId = product.productId
  editData.value.productNameCustom = product.name
  showProductModal.value = false
}

const clearSelectedProduct = () => {
  selectedProduct.value = null
  editData.value.productId = null
  editData.value.productNameCustom = ''
  productInputMode.value = 'select'
}

const resetProductInput = () => {
  editData.value.productNameCustom = ''
  productInputMode.value = 'select'
}

// Category Methods
const handleCategorySelect = ({ subCategoryId }) => {
  editData.value.subCategoryId = subCategoryId
}

// Store
const selectStore = (store) => {
  editData.value.buyPlace = editData.value.buyPlace === store ? '' : store
}

const handlePriceInput = (e) => {
  const value = e.target.value.replace(/[^0-9]/g, '')
  editData.value.buyPrice = value ? parseInt(value) : null
}

// Hashtags
const addHashtag = () => {
  if (!hashtagInput.value.trim() || editData.value.hashtags.length >= 5) return
  const tag = hashtagInput.value.trim().replace(/^#/, '').replace(/[,\s]/g, '')
  if (tag && !editData.value.hashtags.includes(tag)) {
    editData.value.hashtags.push(tag)
  }
  hashtagInput.value = ''
}

const addPopularHashtag = (tag) => {
  if (editData.value.hashtags.length < 5 && !editData.value.hashtags.includes(tag)) {
    editData.value.hashtags.push(tag)
  }
}

const removeHashtag = (index) => {
  editData.value.hashtags.splice(index, 1)
}

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  if (!canSave.value || saving.value) return

  saving.value = true
  try {
    const updateData = {
      userId: props.feed.userInfo?.userId,
      categoryId: editData.value.subCategoryId,
      review: editData.value.review.trim(),
      buyPlace: editData.value.buyPlace.trim(),
      buyPrice: editData.value.buyPrice,
      evaluation: editData.value.evaluation,
      hashtags: editData.value.hashtags
    }

    // productId가 있으면 productId만, 없으면 productNameCustom만 전송
    if (editData.value.productId) {
      updateData.productId = editData.value.productId
    } else {
      updateData.productNameCustom = editData.value.productNameCustom.trim()
    }

    const response = await feedService.updateFeed(props.feed.feedId, updateData)

    if (response.success) {
      await open({ type: 'alert', title: '수정 완료', message: '피드가 수정되었습니다.' })
      emit('updated')
      emit('close')
    } else {
      throw new Error(response.message || '피드 수정에 실패했습니다.')
    }
  } catch (err) {
    console.error('피드 수정 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '피드 수정에 실패했습니다.' })
  } finally {
    saving.value = false
  }
}

// 직접 입력 모드 전환 시 자동 포커스
watch(productInputMode, (newMode) => {
  if (newMode === 'custom') {
    nextTick(() => {
      customInputRef.value?.focus()
    })
  }
})
</script>

<style scoped>
/* Modal Base */
.modal-overlay {
  --primary: #111827;
  --secondary: #6b7280;
  --accent: #9333ea;
  --border: #e5e7eb;
  --bg: #ffffff;
  --hover: #f9fafb;

  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

@media (min-width: 640px) {
  .modal-overlay {
    align-items: center;
    padding: 20px;
  }
}

.modal-container {
  background: white;
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (min-width: 640px) {
  .modal-container {
    border-radius: 16px;
    max-height: 85vh;
  }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: var(--primary);
  transition: background 0.15s;
}

.btn-back:hover {
  background: var(--hover);
}

.header-title {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: var(--primary);
}

.header-spacer {
  width: 40px;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Custom Scrollbar */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
  margin: 8px 0;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.modal-body {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

/* Card */
.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.section-icon {
  width: 20px;
  height: 20px;
  color: var(--accent);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  flex: 1;
  margin: 0;
}

.photo-count {
  font-size: 14px;
  color: var(--secondary);
}

/* Photo Section */
.photo-notice {
  font-size: 13px;
  color: var(--secondary);
  margin-bottom: 12px;
}

.photo-preview-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.photo-preview-list::-webkit-scrollbar {
  height: 4px;
}

.photo-preview-list::-webkit-scrollbar-track {
  background: transparent;
}

.photo-preview-list::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}

.photo-preview-item {
  position: relative;
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
}

.photo-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-order {
  position: absolute;
  bottom: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Product Selection */
.product-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-mode-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  background: white;
  border: 2px solid var(--border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.mode-card:hover {
  border-color: var(--accent);
  background: #faf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
}

.mode-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-card-icon svg {
  width: 24px;
  height: 24px;
}

.mode-card-icon.search {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: var(--accent);
}

.mode-card-icon.custom {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.mode-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mode-card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.mode-card-desc {
  font-size: 12px;
  color: var(--secondary);
  margin: 0;
}

.custom-mode-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.btn-back-to-select {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--hover);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-back-to-select:hover {
  background: #fee2e2;
}

.btn-back-to-select svg {
  width: 16px;
  height: 16px;
  color: var(--secondary);
}

.btn-back-to-select:hover svg {
  color: #ef4444;
}

/* Selected Product Card */
.selected-product-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid var(--border);
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

.selected-product-info {
  flex: 1;
  min-width: 0;
}

.selected-product-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-product-brand {
  font-size: 13px;
  color: var(--secondary);
  margin: 0;
}

.btn-clear-product {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.btn-clear-product:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.btn-clear-product .icon {
  width: 16px;
  height: 16px;
  color: var(--secondary);
}

.btn-clear-product:hover .icon {
  color: #ef4444;
}

/* Category */
.selected-category-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 10px;
  margin-bottom: 12px;
}

.selected-category-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}

.selected-category-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.selected-category-clear:hover {
  background: #f3e8ff;
  color: var(--accent);
}

.category-chips-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-chips-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary);
  margin: 0;
}

.category-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-chip {
  padding: 8px 14px;
  background: var(--hover);
  color: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.category-chip:hover {
  border-color: #d8b4fe;
  background: #faf5ff;
  color: var(--accent);
}

.category-chip.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.category-chip.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--accent);
  border-color: #e9d5ff;
  background: #faf5ff;
  font-weight: 600;
}

.category-chip.more-btn:hover {
  background: #f3e8ff;
  border-color: #d8b4fe;
}

.sub-category-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.sub-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sub-category-chip {
  padding: 6px 12px;
  background: white;
  color: #888;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.sub-category-chip:hover {
  background: #faf5ff;
  border-color: #d8b4fe;
  color: var(--accent);
}

.sub-category-chip.active {
  background: #f3e8ff;
  border-color: var(--accent);
  color: var(--accent);
}

/* Form */
.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--primary);
}

.form-label.required::after {
  content: '*';
  color: #ef4444;
}

.inline-icon {
  width: 16px;
  height: 16px;
  color: var(--secondary);
}

.label-with-required {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.required-mark {
  color: #ef4444;
  font-weight: 600;
}

.optional-label {
  font-size: 12px;
  font-weight: 400;
  color: var(--secondary);
}

.char-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--secondary);
}

.char-count.error {
  color: #ef4444;
}

.count-badge {
  margin-left: auto;
  font-size: 13px;
  color: var(--secondary);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.mt-8 {
  margin-top: 8px;
}

/* Quick Store */
.quick-store-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-store-btn {
  padding: 8px 14px;
  background: white;
  color: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.quick-store-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.quick-store-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

/* Price Input */
.price-input-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.price-input-box:focus-within {
  border-color: var(--accent);
}

.price-input-field {
  flex: 1;
  padding: 12px 14px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  text-align: right;
  outline: none;
  font-family: inherit;
}

.price-input-field::placeholder {
  color: #d1d5db;
  font-weight: 400;
}

.price-suffix {
  padding: 12px 14px 12px 0;
  font-size: 14px;
  color: var(--secondary);
}

/* Status Grid (Evaluation) */
.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.status-btn {
  padding: 12px 8px;
  background: white;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.status-btn:hover {
  border-color: var(--secondary);
}

.status-btn.best { border-color: #f97316; color: #f97316; }
.status-btn.best.active { background: #f97316; color: white; }

.status-btn.good { border-color: #10b981; color: #10b981; }
.status-btn.good.active { background: #10b981; color: white; }

.status-btn.okay { border-color: #3b82f6; color: #3b82f6; }
.status-btn.okay.active { background: #3b82f6; color: white; }

.status-btn.bad { border-color: #ef4444; color: #ef4444; }
.status-btn.bad.active { background: #ef4444; color: white; }

/* Hashtags */
.selected-hashtags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.hashtag-chip {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.hashtag-symbol {
  color: #3b82f6;
  font-weight: 700;
}

.hashtag-chip .remove-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  margin-left: 4px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
}

.hashtag-chip .remove-tag:hover {
  background: rgba(59, 130, 246, 0.15);
}

.hashtag-chip .remove-tag .icon {
  width: 12px;
  height: 12px;
  color: #3b82f6;
}

.hashtag-input-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.hashtag-input-box:focus-within {
  border-color: var(--accent);
}

.input-prefix {
  padding: 12px 0 12px 14px;
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
}

.hashtag-input-field {
  flex: 1;
  padding: 12px 8px;
  border: none;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}

.hashtag-input-field::placeholder {
  color: #9ca3af;
}

.btn-add-tag {
  padding: 8px 16px;
  margin: 6px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.btn-add-tag:hover:not(:disabled) {
  background: #7c22ce;
}

.btn-add-tag:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.popular-hashtags {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.popular-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--primary);
}

.popular-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
}

.popular-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.popular-tag {
  padding: 6px 12px;
  background: var(--hover);
  color: var(--secondary);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.popular-tag:hover:not(:disabled) {
  background: #eff6ff;
  color: #1d4ed8;
}

.popular-tag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.modal-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.btn-submit {
  width: 100%;
  padding: 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  background: #7c22ce;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: translateY(100%);
}

.modal-leave-to .modal-container {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .modal-container {
    transform: translateY(20px) scale(0.98);
  }

  .modal-leave-to .modal-container {
    transform: translateY(20px) scale(0.98);
  }
}

/* Mobile adjustments for mode cards */
@media (max-width: 480px) {
  .product-mode-cards {
    gap: 10px;
  }

  .mode-card {
    padding: 16px 12px;
    gap: 10px;
  }

  .mode-card-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .mode-card-icon svg {
    width: 20px;
    height: 20px;
  }

  .mode-card-title {
    font-size: 14px;
  }

  .mode-card-desc {
    font-size: 11px;
  }
}
</style>
