<template>
  <Teleport to="body">
    <Transition name="feed-edit-modal">
      <div v-if="visible" class="feed-edit-overlay" @click="handleClose">
        <div class="feed-edit-container" @click.stop>
          <header class="feed-edit-header">
            <button class="feed-edit-back" @click="handleClose">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="feed-edit-title">피드 수정</h1>
            <div style="width:40px"></div>
          </header>

          <div class="feed-edit-body">
            <!-- 사진 -->
            <section class="feed-edit-card">
              <div class="feed-edit-card-header">
                <svg width="20" height="20" fill="none" stroke="#9333ea" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <h2 class="feed-edit-card-title">사진</h2>
                <span class="feed-edit-photo-count">{{ images.length }}장</span>
              </div>
              <p class="feed-edit-notice">사진은 수정할 수 없습니다</p>
              <div class="feed-edit-photo-list">
                <div v-for="(image, index) in images" :key="index" class="feed-edit-photo-item">
                  <img :src="image.fileUrl" :alt="`사진 ${index + 1}`" />
                  <div class="feed-edit-photo-order">{{ index + 1 }}</div>
                </div>
              </div>
            </section>

            <!-- 제품 정보 -->
            <section class="feed-edit-card">
              <label class="feed-edit-label feed-edit-required">어떤 제품인가요?</label>
              <div v-if="selectedProduct" class="feed-edit-selected-product">
                <img :src="selectedProduct.thumbnailUrl || '/default-product.png'" :alt="selectedProduct.name" class="feed-edit-product-img" />
                <div class="feed-edit-product-info">
                  <p class="feed-edit-product-name">{{ selectedProduct.name }}</p>
                  <p class="feed-edit-product-brand">{{ selectedProduct.brand }}</p>
                </div>
                <button type="button" class="feed-edit-product-clear" @click="clearSelectedProduct">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                </button>
              </div>
              <div v-else>
                <div v-if="productInputMode === 'select'" class="feed-edit-mode-cards">
                  <button type="button" class="feed-edit-mode-card" @click="openProductModal">
                    <div class="feed-edit-mode-icon" style="background:linear-gradient(135deg,#f3e8ff,#e9d5ff);color:#9333ea">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                    </div>
                    <h4 class="feed-edit-mode-title">제품 연동</h4>
                    <p class="feed-edit-mode-desc">등록된 제품 정보 연결</p>
                  </button>
                  <button type="button" class="feed-edit-mode-card" @click="productInputMode = 'custom'">
                    <div class="feed-edit-mode-icon" style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);color:#3b82f6">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </div>
                    <h4 class="feed-edit-mode-title">직접 작성</h4>
                    <p class="feed-edit-mode-desc">제품명만 간단히 입력</p>
                  </button>
                </div>
                <div v-else class="feed-edit-custom-input">
                  <div class="feed-edit-custom-header">
                    <span style="font-size:13px;font-weight:600;color:#9333ea">직접 작성</span>
                    <button type="button" class="feed-edit-custom-close" @click="resetProductInput">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <input type="text" class="feed-edit-input" placeholder="브랜드 + 제품명 (예: 나이키 조던 4 레트로)" v-model="editData.productNameCustom" ref="customInputRef" />
                </div>
              </div>
            </section>

            <!-- 카테고리 -->
            <section class="feed-edit-card">
              <label class="feed-edit-label feed-edit-required">카테고리</label>
              <CategoryChipSelector
                :key="categoryKey"
                v-model="editData.subCategoryId"
                content-type="FEED"
                @select="handleCategorySelect"
              />
            </section>

            <!-- 한줄평 -->
            <section class="feed-edit-card">
              <label class="feed-edit-label feed-edit-required">
                한줄평
                <span class="feed-edit-char-count" :class="{ 'feed-edit-error': editData.review.length > 100 }">{{ editData.review.length }}/100</span>
              </label>
              <textarea class="feed-edit-textarea" placeholder="제품에 대한 솔직한 리뷰를 작성해주세요" v-model="editData.review" rows="3" maxlength="100"></textarea>
            </section>

            <!-- 구매처 -->
            <section class="feed-edit-card">
              <label class="feed-edit-label">
                <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                구매처<span style="color:#ef4444;font-weight:600">*</span>
              </label>
              <div class="feed-edit-store-list">
                <button v-for="store in quickStores" :key="store" type="button" :class="['feed-edit-store-btn', { active: editData.buyPlace === store }]" @click="selectStore(store)">{{ store }}</button>
              </div>
              <input v-if="!quickStores.includes(editData.buyPlace)" type="text" class="feed-edit-input" style="margin-top:8px" placeholder="직접 입력 (예: 백화점, 해외직구)" v-model="editData.buyPlace" />
            </section>

            <!-- 구매 가격 -->
            <section class="feed-edit-card">
              <label class="feed-edit-label">
                <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                구매 가격 <span style="font-size:12px;font-weight:400;color:#6b7280">(선택)</span>
              </label>
              <div class="feed-edit-price-box">
                <input type="text" inputmode="numeric" class="feed-edit-price-input" placeholder="0" :value="formattedPrice" @input="handlePriceInput" />
                <span class="feed-edit-price-suffix">원</span>
              </div>
            </section>

            <!-- 제품 평가 -->
            <section class="feed-edit-card">
              <label class="feed-edit-label feed-edit-required">
                <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                제품 평가
              </label>
              <div class="feed-edit-eval-grid">
                <button v-for="ev in evaluations" :key="ev.value" :class="['feed-edit-eval-btn', ev.value.toLowerCase(), { active: editData.evaluation === ev.value }]" @click="editData.evaluation = ev.value" type="button">{{ ev.label }}</button>
              </div>
            </section>

            <!-- 해시태그 -->
            <section class="feed-edit-card">
              <label class="feed-edit-label">
                <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
                해시태그 <span class="feed-edit-count-badge">{{ editData.hashtags.length }}/5</span>
              </label>
              <div v-if="editData.hashtags.length > 0" class="feed-edit-tags">
                <span v-for="(tag, idx) in editData.hashtags" :key="idx" class="feed-edit-tag-chip">
                  <span style="color:#3b82f6;font-weight:700">#</span>{{ tag }}
                  <button class="feed-edit-tag-remove" @click="removeHashtag(idx)" type="button">
                    <svg width="12" height="12" fill="#3b82f6" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                  </button>
                </span>
              </div>
              <div v-if="editData.hashtags.length < 5" class="feed-edit-tag-input-box">
                <span class="feed-edit-tag-prefix">#</span>
                <input type="text" class="feed-edit-tag-input" placeholder="태그 입력" v-model="hashtagInput" @keydown.enter.prevent="addHashtag" @keydown.space.prevent="addHashtag" @keydown.,.prevent="addHashtag" />
                <button type="button" class="feed-edit-tag-add" @click="addHashtag" :disabled="!hashtagInput.trim()">추가</button>
              </div>
              <div v-if="editData.hashtags.length < 5" class="feed-edit-popular">
                <p class="feed-edit-popular-title">추천 태그 <span style="font-size:11px;font-weight:500;color:#9ca3af">클릭하여 추가</span></p>
                <div class="feed-edit-popular-list">
                  <button v-for="tag in popularHashtags" :key="tag" class="feed-edit-popular-tag" @click="addPopularHashtag(tag)" :disabled="editData.hashtags.includes(tag)" type="button">#{{ tag }}</button>
                </div>
              </div>
            </section>
          </div>

          <div class="feed-edit-footer">
            <button class="feed-edit-submit" :disabled="!canSave || saving" @click="handleSave" type="button">
              <svg v-if="saving" class="feed-edit-spinner" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
              <span>{{ saving ? '저장 중...' : '수정 완료' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <ProductSelectModal v-if="showProductModal" @select="handleProductSelect" @close="closeProductModal" />
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { feedService } from '@/services/FeedService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import ProductSelectModal from '@/components/oneMouth/create/ProductSelectModal.vue'
import CategoryChipSelector from '@/components/common/CategoryChipSelector.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  feed: { type: Object, required: true }
})

const emit = defineEmits(['close', 'updated'])
const { open } = useConfirmDialog()

const saving = ref(false)
const hashtagInput = ref('')
const customInputRef = ref(null)
const categoryKey = ref(0)
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
  const hasProduct = editData.value.productId || editData.value.productNameCustom.trim().length > 0
  return hasProduct &&
    editData.value.subCategoryId &&
    editData.value.review.trim().length > 0 &&
    editData.value.buyPlace.trim().length > 0 &&
    editData.value.evaluation
})

watch(() => props.visible, (visible) => {
  if (visible && props.feed) {
    document.body.style.overflow = 'hidden'
    const feed = props.feed

    const evaluation = typeof feed.feedEvaluation === 'object'
      ? feed.feedEvaluation?.code
      : (feed.feedEvaluation || feed.evaluation || 'BEST')
    const hashtags = (feed.hashtags || []).map(h => typeof h === 'object' ? (h.name || '') : h).filter(Boolean)
    const subCategoryId = feed.subCategoryDetail?.subCategoryId || feed.subCategoryDetail?.categoryId || feed.subCategoryId || feed.categoryId || null

    if (feed.product) {
      selectedProduct.value = {
        productId: feed.product.id || feed.product.productId,
        name: feed.product.name || '상품명 없음',
        brand: feed.product.brand || '',
        thumbnailUrl: feed.product.thumbnailUrl || feed.product.thumbnailDto?.fileUrl || null
      }
      productInputMode.value = 'select'
    } else {
      selectedProduct.value = null
      productInputMode.value = feed.productNameCustom ? 'custom' : 'select'
    }

    editData.value = {
      productId: feed.product?.id || feed.product?.productId || null,
      productNameCustom: feed.productNameCustom || feed.product?.name || '',
      subCategoryId,
      review: feed.review || '',
      buyPlace: feed.buyPlace || '',
      buyPrice: feed.buyPrice || null,
      evaluation,
      hashtags
    }

    categoryKey.value++
    hashtagInput.value = ''
    showProductModal.value = false
    saving.value = false
  } else {
    document.body.style.overflow = ''
    showProductModal.value = false
    hashtagInput.value = ''
    saving.value = false
  }
}, { immediate: true })

onBeforeUnmount(() => { document.body.style.overflow = '' })

const openProductModal = () => { showProductModal.value = true }
const closeProductModal = () => { showProductModal.value = false }
const handleProductSelect = (product) => {
  selectedProduct.value = product
  editData.value.productId = product.productId || product.id
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
const handleCategorySelect = ({ subCategoryId }) => {
  editData.value.subCategoryId = subCategoryId
}
const selectStore = (store) => {
  editData.value.buyPlace = editData.value.buyPlace === store ? '' : store
}
const handlePriceInput = (e) => {
  const value = e.target.value.replace(/[^0-9]/g, '')
  editData.value.buyPrice = value ? parseInt(value) : null
}
const addHashtag = () => {
  if (!hashtagInput.value.trim() || editData.value.hashtags.length >= 5) return
  const tag = hashtagInput.value.trim().replace(/^#/, '').replace(/[,\s]/g, '')
  if (tag && !editData.value.hashtags.includes(tag)) editData.value.hashtags.push(tag)
  hashtagInput.value = ''
}
const addPopularHashtag = (tag) => {
  if (editData.value.hashtags.length < 5 && !editData.value.hashtags.includes(tag)) editData.value.hashtags.push(tag)
}
const removeHashtag = (index) => { editData.value.hashtags.splice(index, 1) }
const handleClose = () => { emit('close') }

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

watch(productInputMode, (newMode) => {
  if (newMode === 'custom') nextTick(() => { customInputRef.value?.focus() })
})
</script>

<style>
/* ===== Feed Edit Modal (non-scoped for Teleport compatibility) ===== */
.feed-edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
@media (min-width: 640px) {
  .feed-edit-overlay { align-items: center; padding: 20px; }
}

.feed-edit-container {
  background: #fff;
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'SUIT','Noto Sans KR',sans-serif;
  color: #111827;
}
@media (min-width: 640px) {
  .feed-edit-container { border-radius: 16px; max-height: 85vh; }
}

.feed-edit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.feed-edit-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; height: 40px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #111827;
}
.feed-edit-back:hover { background: #f9fafb; }
.feed-edit-title {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  margin: 0;
}

.feed-edit-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}
.feed-edit-body::-webkit-scrollbar { width: 6px; }
.feed-edit-body::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }

.feed-edit-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-sizing: border-box;
}
.feed-edit-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.feed-edit-card-title { font-size: 16px; font-weight: 700; flex: 1; margin: 0; }
.feed-edit-photo-count { font-size: 14px; color: #6b7280; }
.feed-edit-notice { font-size: 13px; color: #6b7280; margin-bottom: 12px; }

.feed-edit-photo-list { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; }
.feed-edit-photo-item { position: relative; flex-shrink: 0; width: 72px; height: 72px; border-radius: 10px; overflow: hidden; background: #f3f4f6; }
.feed-edit-photo-item img { width: 100%; height: 100%; object-fit: cover; }
.feed-edit-photo-order { position: absolute; bottom: 4px; left: 4px; width: 20px; height: 20px; background: rgba(0,0,0,0.7); color: #fff; border-radius: 50%; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }

.feed-edit-label { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; margin-bottom: 10px; color: #111827; }
.feed-edit-required::after { content: '*'; color: #ef4444; margin-left: 2px; }
.feed-edit-char-count { margin-left: auto; font-size: 12px; color: #6b7280; }
.feed-edit-char-count.feed-edit-error { color: #ef4444; }
.feed-edit-count-badge { margin-left: auto; font-size: 13px; color: #6b7280; }

.feed-edit-input, .feed-edit-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  background: #fff;
  color: #111827;
}
.feed-edit-input:focus, .feed-edit-textarea:focus { outline: none; border-color: #9333ea; }
.feed-edit-textarea { resize: vertical; min-height: 80px; }

/* Product */
.feed-edit-selected-product { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; }
.feed-edit-product-img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0; background: #e5e7eb; }
.feed-edit-product-info { flex: 1; min-width: 0; }
.feed-edit-product-name { font-size: 15px; font-weight: 600; margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.feed-edit-product-brand { font-size: 13px; color: #6b7280; margin: 0; }
.feed-edit-product-clear { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #fff; border: 1px solid #e5e7eb; border-radius: 50%; cursor: pointer; flex-shrink: 0; color: #6b7280; }
.feed-edit-product-clear:hover { background: #fee2e2; border-color: #ef4444; color: #ef4444; }

.feed-edit-mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.feed-edit-mode-card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px 16px; background: #fff; border: 2px solid #e5e7eb; border-radius: 16px; cursor: pointer; text-align: center; transition: all 0.2s; }
.feed-edit-mode-card:hover { border-color: #9333ea; background: #faf5ff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(147,51,234,0.1); }
.feed-edit-mode-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.feed-edit-mode-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0; }
.feed-edit-mode-desc { font-size: 12px; color: #6b7280; margin: 0; }

.feed-edit-custom-input { display: flex; flex-direction: column; gap: 10px; }
.feed-edit-custom-header { display: flex; align-items: center; justify-content: space-between; }
.feed-edit-custom-close { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #f9fafb; border: none; border-radius: 8px; cursor: pointer; color: #6b7280; }
.feed-edit-custom-close:hover { background: #fee2e2; color: #ef4444; }

/* Store */
.feed-edit-store-list { display: flex; flex-wrap: wrap; gap: 8px; }
.feed-edit-store-btn { padding: 8px 14px; background: #fff; color: #6b7280; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.feed-edit-store-btn:hover { border-color: #9333ea; color: #9333ea; }
.feed-edit-store-btn.active { background: #9333ea; color: #fff; border-color: #9333ea; }

/* Price */
.feed-edit-price-box { display: flex; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.feed-edit-price-box:focus-within { border-color: #9333ea; }
.feed-edit-price-input { flex: 1; padding: 12px 14px; border: none; font-size: 16px; font-weight: 600; text-align: right; outline: none; font-family: inherit; box-sizing: border-box; }
.feed-edit-price-input::placeholder { color: #d1d5db; font-weight: 400; }
.feed-edit-price-suffix { padding: 12px 14px 12px 0; font-size: 14px; color: #6b7280; }

/* Evaluation */
.feed-edit-eval-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.feed-edit-eval-btn { padding: 12px 8px; background: #fff; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.feed-edit-eval-btn:hover { border-color: #6b7280; }
.feed-edit-eval-btn.best { border-color: #f97316; color: #f97316; }
.feed-edit-eval-btn.best.active { background: #f97316; color: #fff; }
.feed-edit-eval-btn.good { border-color: #10b981; color: #10b981; }
.feed-edit-eval-btn.good.active { background: #10b981; color: #fff; }
.feed-edit-eval-btn.okay { border-color: #3b82f6; color: #3b82f6; }
.feed-edit-eval-btn.okay.active { background: #3b82f6; color: #fff; }
.feed-edit-eval-btn.bad { border-color: #ef4444; color: #ef4444; }
.feed-edit-eval-btn.bad.active { background: #ef4444; color: #fff; }

/* Hashtags */
.feed-edit-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.feed-edit-tag-chip { display: flex; align-items: center; gap: 2px; padding: 6px 12px; background: #eff6ff; color: #1d4ed8; border-radius: 20px; font-size: 13px; font-weight: 600; }
.feed-edit-tag-remove { display: flex; align-items: center; justify-content: center; padding: 2px; margin-left: 4px; background: none; border: none; cursor: pointer; border-radius: 50%; }
.feed-edit-tag-remove:hover { background: rgba(59,130,246,0.15); }

.feed-edit-tag-input-box { display: flex; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.feed-edit-tag-input-box:focus-within { border-color: #9333ea; }
.feed-edit-tag-prefix { padding: 12px 0 12px 14px; font-size: 15px; font-weight: 700; color: #9333ea; }
.feed-edit-tag-input { flex: 1; padding: 12px 8px; border: none; font-size: 14px; outline: none; font-family: inherit; box-sizing: border-box; }
.feed-edit-tag-input::placeholder { color: #9ca3af; }
.feed-edit-tag-add { padding: 8px 16px; margin: 6px; background: #9333ea; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.feed-edit-tag-add:hover:not(:disabled) { background: #7c22ce; }
.feed-edit-tag-add:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }

.feed-edit-popular { margin-top: 14px; padding-top: 14px; border-top: 1px solid #e5e7eb; }
.feed-edit-popular-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; margin-bottom: 10px; color: #111827; }
.feed-edit-popular-list { display: flex; flex-wrap: wrap; gap: 6px; }
.feed-edit-popular-tag { padding: 6px 12px; background: #f9fafb; color: #6b7280; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
.feed-edit-popular-tag:hover:not(:disabled) { background: #eff6ff; color: #1d4ed8; }
.feed-edit-popular-tag:disabled { opacity: 0.5; cursor: not-allowed; }

/* Footer */
.feed-edit-footer { padding: 16px; border-top: 1px solid #e5e7eb; flex-shrink: 0; }
.feed-edit-submit { width: 100%; padding: 16px; background: #9333ea; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; }
.feed-edit-submit:hover:not(:disabled) { background: #7c22ce; }
.feed-edit-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.feed-edit-spinner { width: 20px; height: 20px; animation: feed-edit-spin 1s linear infinite; }
@keyframes feed-edit-spin { to { transform: rotate(360deg); } }

/* Transitions */
.feed-edit-modal-enter-active, .feed-edit-modal-leave-active { transition: opacity 0.2s; }
.feed-edit-modal-enter-active .feed-edit-container, .feed-edit-modal-leave-active .feed-edit-container { transition: transform 0.25s ease-out; }
.feed-edit-modal-enter-from, .feed-edit-modal-leave-to { opacity: 0; }
.feed-edit-modal-enter-from .feed-edit-container { transform: translateY(100%); }
.feed-edit-modal-leave-to .feed-edit-container { transform: translateY(100%); }
@media (min-width: 640px) {
  .feed-edit-modal-enter-from .feed-edit-container { transform: translateY(20px) scale(0.98); }
  .feed-edit-modal-leave-to .feed-edit-container { transform: translateY(20px) scale(0.98); }
}

@media (max-width: 480px) {
  .feed-edit-mode-cards { gap: 10px; }
  .feed-edit-mode-card { padding: 16px 12px; gap: 10px; }
  .feed-edit-mode-icon { width: 40px; height: 40px; border-radius: 12px; }
  .feed-edit-mode-title { font-size: 14px; }
  .feed-edit-mode-desc { font-size: 11px; }
}
</style>
