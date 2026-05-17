<template>
  <div class="create-container">
    <!-- Header -->
    <header class="create-header">
      <button class="btn-back" @click="handleCancel">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="header-center">
        <h1 class="header-title">인증 올리기</h1>
        <div class="progress-dots">
          <span class="progress-dot" :class="{ filled: selectedPhotos.length > 0 }"></span>
          <span class="progress-dot" :class="{ filled: formData.review.trim() }"></span>
          <span class="progress-dot" :class="{ filled: formData.productNameCustom.trim() }"></span>
          <span class="progress-dot" :class="{ filled: formData.subCategoryId }"></span>
          <span class="progress-dot" :class="{ filled: formData.store.trim() }"></span>
        </div>
      </div>
      <div class="header-spacer"></div>
    </header>

    <!-- Main Content -->
    <main class="create-content">
      <!-- 사진 -->
      <section class="card photo-section">
        <div class="card-header">
          <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <h2 class="card-title required">사진</h2>
          <span class="photo-count">{{ selectedPhotos.length }}/5</span>
        </div>
        <div v-if="isProcessingImage" class="processing-indicator">
          <svg class="spinner" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <span>이미지 처리 중...</span>
        </div>
        <div v-if="selectedPhotos.length > 0" class="photo-grid">
          <div
              v-for="(photo, index) in selectedPhotos"
              :key="photo.id"
              class="photo-item"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragover.prevent
              @drop="handleDrop($event, index)"
              @dragenter="handleDragEnter(index)"
              @dragleave="handleDragLeave"
              :class="{ 'drag-over': dragOverIndex === index, 'uploading': photo.uploading, 'upload-failed': photo.uploadFailed }"
          >
            <img :src="photo.preview" :alt="`Photo ${index + 1}`" />
            <div v-if="photo.uploading" class="upload-overlay">
              <svg class="upload-spinner" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>
            <div v-if="photo.uploadFailed" class="upload-failed-overlay">
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
              </svg>
            </div>
            <button class="btn-remove" @click="removePhoto(index)" :disabled="photo.uploading">
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
            <div class="photo-order">{{ index + 1 }}</div>
          </div>
        </div>
        <div class="photo-actions">
          <label class="btn-photo-action" :class="{ disabled: selectedPhotos.length >= 5 || isProcessingImage }">
            <input type="file" accept="image/*" multiple @change="handleFileSelect" style="display: none;" :disabled="selectedPhotos.length >= 5 || isProcessingImage" />
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>갤러리</span>
          </label>
          <label class="btn-photo-action mobile-only" :class="{ disabled: selectedPhotos.length >= 5 || isProcessingImage }">
            <input type="file" accept="image/*" capture="environment" @change="handleFileSelect" style="display: none;" :disabled="selectedPhotos.length >= 5 || isProcessingImage" />
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>카메라</span>
          </label>
        </div>
        <p class="hint-text">사진을 드래그하여 순서를 변경할 수 있습니다 (최대 1920px로 자동 최적화)</p>

        <!-- 한줄평 (사진 카드에 통합) -->
        <div class="review-inline">
          <label class="form-label required">
            한줄평
            <span class="char-count" :class="{ error: formData.review.length > 100 }">{{ formData.review.length }}/100</span>
          </label>
          <textarea class="form-textarea" placeholder="솔직한 후기를 자유롭게 적어주세요" v-model="formData.review" rows="2" maxlength="100"></textarea>
        </div>
      </section>

      <!-- 제품 + 카테고리 -->
      <section class="card additional-info">
        <div class="form-group">
          <label class="form-label required">무엇에 대한 글인가요?</label>
          <FeedProductSection
            ref="productSectionRef"
            v-model:productNameCustom="formData.productNameCustom"
            v-model:productId="formData.productId"
            :feed-thumbnail-url="selectedPhotos[0]?.preview ?? null"
            @error="showError"
            @price-change="onProductPriceChange"
            @brand-change="onProductBrandChange"
          />
        </div>
        <div class="form-group">
          <label class="form-label required">카테고리</label>
          <CategoryChipSelector
            v-model="formData.subCategoryId"
            content-type="FEED"
            @select="handleCategorySelect"
          />
        </div>

        <!-- 평가 + 구매처 (같은 카드에 통합) -->
        <div class="section-divider"></div>

        <div class="form-group">
          <label class="form-label required">
            <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            한줄 평가
          </label>
          <div class="status-grid">
            <button v-for="ev in evaluations" :key="ev.value" :class="['status-btn', ev.value.toLowerCase(), { active: formData.evaluation === ev.value }]" @click="formData.evaluation = ev.value" type="button">
              <span>{{ ev.label }}</span>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label required">
            <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            구매처/브랜드
          </label>
          <div class="quick-store-list">
            <button
              v-for="store in quickStores"
              :key="store"
              type="button"
              :class="['quick-store-btn', { active: formData.store === store }]"
              @click="selectStore(store)"
              :disabled="formData.storeUnknown"
            >
              {{ store }}
            </button>
            <button
              type="button"
              :class="['quick-store-btn unknown', { active: formData.storeUnknown }]"
              @click="toggleStoreUnknown"
            >
              모름
            </button>
          </div>
          <input
            v-if="!formData.storeUnknown && !quickStores.includes(formData.store)"
            type="text"
            class="form-input mt-8"
            placeholder="직접 입력 (예: 백화점, 해외직구)"
            v-model="formData.store"
          />
        </div>
      </section>

      <!-- 추가 정보 (선택) -->
      <section class="card additional-info">
        <div class="optional-section-header">
          <span class="optional-section-title">추가 정보</span>
          <span class="optional-badge">선택</span>
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            구매 가격
            <span class="price-toggle-group">
              <button type="button" class="btn-toggle" :class="{ active: formData.priceGift }" @click="togglePriceGift">선물받음</button>
              <button type="button" class="btn-toggle" :class="{ active: formData.priceHidden }" @click="togglePriceHidden">비공개</button>
              <button type="button" class="btn-toggle" :class="{ active: formData.priceUnknown }" @click="togglePriceUnknown">정보 없음</button>
            </span>
          </label>
          <div v-if="!formData.priceHidden && !formData.priceGift && !formData.priceUnknown" class="feed-price-wrap">
            <div class="feed-price-line" :class="{ valued: formData.buyPrice }">
              <input
                type="text"
                inputmode="numeric"
                class="feed-price-input"
                placeholder="0"
                maxlength="11"
                :value="formattedPrice"
                @input="handlePriceInput"
              />
              <span class="feed-price-won">원</span>
            </div>
            <p v-if="feedPriceKoreanHint" class="feed-price-hint">{{ feedPriceKoreanHint }}</p>
          </div>
          <p v-if="formData.priceHidden" class="price-hidden-notice">
            가격이 비공개로 설정됩니다
          </p>
          <p v-if="formData.priceUnknown" class="price-hidden-notice">
            가격 정보 없음으로 표시돼요
          </p>
          <p v-if="formData.priceGift" class="price-hidden-notice">
            선물받은 걸로 표시돼요
          </p>
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
            </svg>
            해시태그
            <span class="count-badge">{{ formData.hashtags.length }}/5</span>
          </label>
          <div v-if="formData.hashtags.length > 0" class="selected-hashtags-list">
            <span v-for="(tag, idx) in formData.hashtags" :key="idx" class="hashtag-chip">
              <span class="hashtag-symbol">#</span>{{ tag }}
              <button class="remove-tag" @click="removeHashtag(idx)" type="button">
                <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
              </button>
            </span>
          </div>
          <div v-if="formData.hashtags.length < 5" class="hashtag-input-box">
            <span class="input-prefix">#</span>
            <input
              type="text"
              class="hashtag-input-field"
              placeholder="태그 입력"
              v-model="hashtagInput"
              @keydown.enter.prevent="addHashtag"
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
          <p class="hashtag-hint">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Enter, 스페이스, 쉼표로 태그 추가
          </p>
          <div class="popular-hashtags">
            <p class="popular-title">추천 태그 <span class="popular-subtitle">클릭하여 추가</span></p>
            <div class="popular-list">
              <button v-for="tag in popularHashtags" :key="tag" class="popular-tag" @click="addPopularHashtag(tag)" :disabled="formData.hashtags.includes(tag) || formData.hashtags.length >= 5" type="button">
                #{{ tag }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Fixed Bottom -->
    <div class="fixed-bottom-bar">
      <div class="fixed-bottom-content">
        <p v-if="!canSubmit && missingFieldsText" class="completion-hint">{{ missingFieldsText }}</p>
        <button class="btn-submit-large" :disabled="!canSubmit" @click="handleSubmit" type="button">
          <svg v-if="isSubmitting" class="spinner" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <span>{{ isSubmitting ? '업로드 중...' : '인증 올리기' }}</span>
        </button>
      </div>
    </div>

    <!-- Cancel Dialog -->
    <Transition name="modal">
      <div v-if="showCancelDialog" class="modal-overlay" @click="showCancelDialog = false">
        <div class="confirm-dialog" @click.stop>
          <h3 class="dialog-title">작성을 취소하시겠어요?</h3>
          <p class="dialog-desc">지금까지 작성한 내용이 모두 사라집니다.</p>
          <div class="dialog-actions">
            <button class="btn-dialog cancel" @click="showCancelDialog = false">계속 작성</button>
            <button class="btn-dialog confirm" @click="confirmCancel">취소</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toasts -->
    <Transition name="toast">
      <div v-if="errorMessage" class="error-toast">
        <span>{{ errorMessage }}</span>
      </div>
    </Transition>
    <Transition name="toast">
      <div v-if="showSuccessToast" class="success-toast">
        <span>인증이 게시되었습니다!</span>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useFeed } from '@/services/FeedService.js'
import { useFile } from '@/services/FileService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { showExpGrant } from '@/composables/useExpToast'
import { getUserId } from '@/utils/auth.js'
import { productService } from '@/services/ProductService.js'
import CategoryChipSelector from '@/components/common/CategoryChipSelector.vue'
import FeedProductSection from '@/components/feed/FeedProductSection.vue'

const FEED_DRAFT_KEY = 'feed_draft'

const router = useRouter()
const feedService = useFeed()
const fileService = useFile()
const { open } = useConfirmDialog()

const selectedPhotos = ref([])
const showCancelDialog = ref(false)
const showSuccessToast = ref(false)
const isSubmitting = ref(false)
const isProcessingImage = ref(false)
const errorMessage = ref('')
const hashtagInput = ref('')
const draggedIndex = ref(null)
const dragOverIndex = ref(null)
const productSectionRef = ref(null)

// 정가 입력 시 구매가도 동일하게 동기화 (비공개/선물 토글 시 무시)
// 제품 섹션 구매처/브랜드 → 추가 정보의 구매처 자동 동기화
// "모름" 토글이 켜져있지 않을 때만 자동 채움
const onProductBrandChange = (raw) => {
  const v = String(raw || '').trim()
  if (!v) return
  if (formData.value.storeUnknown) return
  formData.value.store = v
}

const onProductPriceChange = (raw) => {
  // null = 제품 섹션에서 "가격 정보 없음" 토글이 켜진 상태 → 구매가도 "정보 없음"으로 동기화
  if (raw === null) {
    if (!formData.value.priceUnknown) {
      formData.value.priceUnknown = true
      formData.value.priceHidden = false
      formData.value.priceGift = false
      formData.value.buyPrice = null
    }
    return
  }
  // 일반 입력값이 들어오면 "정보 없음" 자동 해제
  if (formData.value.priceUnknown) formData.value.priceUnknown = false
  if (formData.value.priceHidden || formData.value.priceGift) return
  const num = Number(String(raw || '').replace(/[^0-9]/g, ''))
  formData.value.buyPrice = num > 0 ? num : null
}

const formData = ref({
  userId: getUserId(),
  productId: null,
  productNameCustom: '',
  subCategoryId: null,
  review: '',
  store: '',
  storeUnknown: false,
  buyPrice: null,
  priceHidden: false,
  priceGift: false,
  priceUnknown: false,
  evaluation: 'BEST',
  hashtags: []
})

const toggleStoreUnknown = () => {
  formData.value.storeUnknown = !formData.value.storeUnknown
  if (formData.value.storeUnknown) {
    formData.value.store = '모름'
  } else {
    formData.value.store = ''
  }
}

const evaluations = [
  { value: 'BEST', label: '강추' },
  { value: 'GOOD', label: '추천' },
  { value: 'OKAY', label: '괜찮음' },
  { value: 'BAD', label: '비추천' }
]

const quickStores = ['GS25', 'CU', '무신사', '쿠팡', '네이버', '올리브영', '29CM', 'SSG']

const selectStore = (store) => {
  if (formData.value.storeUnknown) return
  formData.value.store = formData.value.store === store ? '' : store
}

const formattedPrice = computed(() => {
  if (!formData.value.buyPrice) return ''
  return Number(formData.value.buyPrice).toLocaleString()
})

const feedPriceKoreanHint = computed(() => {
  const num = formData.value.buyPrice
  if (!num || num < 10000) return ''
  const eok = Math.floor(num / 100000000)
  const manPart = Math.floor((num % 100000000) / 10000)
  const subMan = num % 10000
  const parts = []
  if (eok > 0) parts.push(`${eok.toLocaleString()}억`)
  if (manPart > 0) parts.push(`${manPart.toLocaleString()}만`)
  if (subMan > 0) parts.push(`${subMan.toLocaleString()}`)
  return parts.join(' ') + '원'
})

const MAX_PRICE = 999999999

const handlePriceInput = (e) => {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  let num = raw ? parseInt(raw, 10) : 0
  if (num > MAX_PRICE) num = MAX_PRICE
  formData.value.buyPrice = num === 0 ? null : num
  const display = num > 0 ? num.toLocaleString() : ''
  if (e.target.value !== display) e.target.value = display
}

const togglePriceHidden = () => {
  formData.value.priceHidden = !formData.value.priceHidden
  if (formData.value.priceHidden) {
    formData.value.priceGift = false
    formData.value.priceUnknown = false
    formData.value.buyPrice = null
  }
}

const togglePriceGift = () => {
  formData.value.priceGift = !formData.value.priceGift
  if (formData.value.priceGift) {
    formData.value.priceHidden = false
    formData.value.priceUnknown = false
    formData.value.buyPrice = 0
  } else {
    formData.value.buyPrice = null
  }
}

const togglePriceUnknown = () => {
  formData.value.priceUnknown = !formData.value.priceUnknown
  if (formData.value.priceUnknown) {
    formData.value.priceHidden = false
    formData.value.priceGift = false
    formData.value.buyPrice = null
  }
}

const popularHashtags = ['조던4', '에어팟맥스', '디올립글로우', '나이키', '스니커즈', '데일리룩', 'OOTD', '커피스타그램', '테크', '뷰티']

const canSubmit = computed(() => {
  const hasUploadingPhotos = selectedPhotos.value.some(p => p.uploading)
  return selectedPhotos.value.length > 0 &&
      formData.value.productNameCustom.trim() &&
      formData.value.subCategoryId &&
      formData.value.review.trim() &&
      formData.value.store.trim() &&
      formData.value.evaluation &&
      !isSubmitting.value &&
      !isProcessingImage.value &&
      !hasUploadingPhotos
})

const missingFieldsText = computed(() => {
  const missing = []
  if (selectedPhotos.value.length === 0) missing.push('사진')
  if (!formData.value.productNameCustom.trim()) missing.push('이름')
  if (!formData.value.subCategoryId) missing.push('카테고리')
  if (!formData.value.review.trim()) missing.push('한줄평')
  if (!formData.value.store.trim()) missing.push('구매처')
  if (!formData.value.evaluation) missing.push('한줄 평가')
  if (missing.length === 0) return ''
  if (missing.length <= 2) return `${missing.join(', ')} 입력이 필요합니다`
  return `${missing.length}개 항목을 더 입력해주세요`
})

// 이미지 리사이징 유틸 함수
const resizeImage = (file, maxSize = 1920, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // 이미 충분히 작으면 원본 반환
      if (width <= maxSize && height <= maxSize) {
        resolve(file)
        return
      }

      // 비율 유지하면서 리사이징
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
      // 고품질 리샘플링
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(resizedFile)
            } else {
              reject(new Error('이미지 변환 실패'))
            }
          },
          'image/jpeg',
          quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지 로드 실패'))
    }

    img.src = objectUrl
  })
}

// Category Methods
const handleCategorySelect = ({ subCategoryId }) => {
  formData.value.subCategoryId = subCategoryId
}

// Photo Methods
const handleDragStart = (e, index) => { draggedIndex.value = index }
const handleDragEnter = (index) => { dragOverIndex.value = index }
const handleDragLeave = () => { dragOverIndex.value = null }
const handleDrop = (e, dropIndex) => {
  e.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) return
  const photos = [...selectedPhotos.value]
  const [dragged] = photos.splice(draggedIndex.value, 1)
  photos.splice(dropIndex, 0, dragged)
  selectedPhotos.value = photos
  draggedIndex.value = null
  dragOverIndex.value = null
}

const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files)
  const remaining = 5 - selectedPhotos.value.length

  if (files.length === 0) return

  isProcessingImage.value = true

  try {
    for (const file of files.slice(0, remaining)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 10 * 1024 * 1024) {
        showError('파일 크기는 10MB 이하만 가능합니다.')
        continue
      }

      try {
        // 리사이징 적용 (최대 1920px, 품질 85%)
        const resizedFile = await resizeImage(file, 1920, 0.85)

        // 로컬 미리보기용 URL 생성 (업로드 중 표시용)
        const localPreview = URL.createObjectURL(resizedFile)
        const photoId = Date.now() + Math.random()

        // 먼저 로컬 미리보기로 추가 (업로드 진행 중 상태)
        const photoIndex = selectedPhotos.value.push({
          id: photoId,
          file: resizedFile,
          preview: localPreview,
          uploading: true,
          attachmentInfo: null
        }) - 1

        // Presigned URL로 S3 업로드 후 complete 콜백
        try {
          const uploadResult = await fileService.upload(resizedFile, { fileCode: 'FEED' })

          if (uploadResult.success && uploadResult.data) {
            const attachmentData = uploadResult.data
            // complete 응답의 fileUrl로 미리보기 교체
            const serverUrl = attachmentData.fileUrl || attachmentData.storedPath

            // 해당 사진 찾아서 업데이트
            const photo = selectedPhotos.value.find(p => p.id === photoId)
            if (photo) {
              // 로컬 URL 해제
              URL.revokeObjectURL(photo.preview)
              // 서버 URL로 교체 및 attachmentInfo 저장
              photo.preview = serverUrl || localPreview
              photo.uploading = false
              photo.attachmentInfo = feedService.convertToAttachmentInfo(attachmentData)
              console.log('✅ 파일 업로드 완료:', photo.attachmentInfo)
            }
          } else {
            throw new Error(uploadResult.error || '업로드 실패')
          }
        } catch (uploadError) {
          console.error('❌ 파일 업로드 실패:', uploadError)
          // 업로드 실패해도 로컬 미리보기는 유지, 제출 시 재업로드 시도
          const photo = selectedPhotos.value.find(p => p.id === photoId)
          if (photo) {
            photo.uploading = false
            photo.uploadFailed = true
          }
          showError('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
        }
      } catch (error) {
        console.error('Image resize error:', error)
        showError('이미지 처리 중 오류가 발생했습니다.')
      }
    }
  } finally {
    isProcessingImage.value = false
    e.target.value = ''
  }
}

const removePhoto = (index) => {
  URL.revokeObjectURL(selectedPhotos.value[index].preview)
  selectedPhotos.value.splice(index, 1)
}


// Hashtags
const addHashtag = () => {
  if (!hashtagInput.value.trim() || formData.value.hashtags.length >= 5) return
  // #, 쉼표, 공백 제거
  let tag = hashtagInput.value.trim().replace(/^#/, '').replace(/[,\s]/g, '')
  if (tag && !formData.value.hashtags.includes(tag)) formData.value.hashtags.push(tag)
  hashtagInput.value = ''
}
const removeHashtag = (index) => { formData.value.hashtags.splice(index, 1) }
const addPopularHashtag = (tag) => {
  if (formData.value.hashtags.length < 5 && !formData.value.hashtags.includes(tag)) formData.value.hashtags.push(tag)
}

// Draft Functions
const saveDraft = () => {
  try {
    const productDraft = productSectionRef.value?.getDraftPayload() || {}
    const draftData = {
      formData: {
        ...formData.value,
        // File 객체는 저장 불가, productId와 텍스트 데이터만
      },
      selectedCategoryInfo: selectedCategoryInfo.value,
      selectedParentCategory: selectedParentCategory.value ? {
        categoryId: selectedParentCategory.value.categoryId,
        categoryName: selectedParentCategory.value.categoryName
      } : null,
      ...productDraft,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(FEED_DRAFT_KEY, JSON.stringify(draftData))
    return true
  } catch (error) {
    console.error('임시저장 실패:', error)
    return false
  }
}

const loadDraft = async () => {
  try {
    const draft = localStorage.getItem(FEED_DRAFT_KEY)
    if (!draft) return false

    const draftData = JSON.parse(draft)
    const savedTime = formatSavedTime(new Date(draftData.savedAt))

    const confirmed = await open({
      type: 'confirm',
      title: '임시저장 불러오기',
      message: `임시저장된 데이터가 있습니다.\n(${savedTime})\n\n불러오시겠습니까?`
    })

    if (confirmed) {
      // 폼 데이터 복원
      formData.value = { ...formData.value, ...draftData.formData }
      selectedCategoryInfo.value = draftData.selectedCategoryInfo
      productSectionRef.value?.restoreFromDraft(draftData)

      // 부모 카테고리 복원
      if (draftData.selectedParentCategory) {
        const parent = cachedAllCategories.value.find(
          c => c.categoryId === draftData.selectedParentCategory.categoryId
        )
        if (parent) {
          selectedParentCategory.value = parent
        }
      }

      return true
    } else {
      // 불러오지 않으면 삭제 여부
      const shouldDelete = await open({
        type: 'confirm',
        title: '임시저장 삭제',
        message: '임시저장된 데이터를 삭제하시겠습니까?'
      })
      if (shouldDelete) {
        localStorage.removeItem(FEED_DRAFT_KEY)
      }
    }
    return false
  } catch (error) {
    console.error('임시저장 로드 실패:', error)
    return false
  }
}

const clearDraft = () => {
  localStorage.removeItem(FEED_DRAFT_KEY)
}

const formatSavedTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '방금 전'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`

  if (date.toDateString() === now.toDateString()) {
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const period = hours >= 12 ? '오후' : '오전'
    const hour12 = hours % 12 || 12
    return `오늘 ${period} ${hour12}:${minutes}`
  }

  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

// Submit
const handleCancel = async () => {
  const hasContent = selectedPhotos.value.length > 0 ||
      formData.value.productNameCustom ||
      formData.value.review

  console.log('handleCancel called', {
    hasContent,
    photos: selectedPhotos.value.length,
    productName: formData.value.productNameCustom,
    review: formData.value.review
  })

  if (hasContent) {
    // 임시저장 여부 먼저 묻기
    const shouldSave = await open({
      type: 'confirm',
      title: '임시저장',
      message: '작성 중인 내용을 임시저장하시겠습니까?\n(사진은 저장되지 않습니다)',
      confirmText: '임시저장',
      cancelText: '저장 안 함'
    })

    if (shouldSave) {
      saveDraft()
      cleanupAndGoBack()
    } else {
      cleanupAndGoBack()
    }
  } else {
    router.back()
  }
}

const cleanupAndGoBack = () => {
  selectedPhotos.value.forEach(p => {
    if (p.preview && p.preview.startsWith('blob:')) {
      URL.revokeObjectURL(p.preview)
    }
  })
  router.back()
}

const confirmCancel = () => {
  selectedPhotos.value.forEach(p => URL.revokeObjectURL(p.preview))
  showCancelDialog.value = false
  router.back()
}

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return
  isSubmitting.value = true

  try {
    const [thumbnail, ...additional] = selectedPhotos.value

    // 업로드 중인 파일이 있는지 확인
    const uploadingPhotos = selectedPhotos.value.filter(p => p.uploading)
    if (uploadingPhotos.length > 0) {
      showError('이미지 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요.')
      isSubmitting.value = false
      return
    }

    // 업로드 실패한 파일 재업로드
    for (const photo of selectedPhotos.value) {
      if (photo.uploadFailed || !photo.attachmentInfo) {
        console.log('🔄 업로드 실패한 파일 재업로드:', photo.file.name)
        try {
          const uploadResult = await fileService.upload(photo.file, { fileCode: 'FEED' })
          if (uploadResult.success && uploadResult.data) {
            photo.attachmentInfo = feedService.convertToAttachmentInfo(uploadResult.data)
            photo.uploadFailed = false
            console.log('✅ 재업로드 완료:', photo.attachmentInfo)
          } else {
            throw new Error('재업로드 실패')
          }
        } catch (err) {
          showError('이미지 업로드에 실패했습니다.')
          isSubmitting.value = false
          return
        }
      }
    }

    // 이미 업로드된 attachmentInfo 사용
    const thumbnailAttachmentInfo = thumbnail.attachmentInfo
    const attachmentFileInfos = additional
      .filter(p => p.attachmentInfo)
      .map(p => p.attachmentInfo)

    // 제품으로 등록 체크 시 먼저 제품 생성
    const productState = productSectionRef.value?.getSubmitState() || {}
    let finalProductId = formData.value.productId
    if (!finalProductId && productState.registerAsProduct) {
      if (!productState.productBrandCustom?.trim()) {
        showError('브랜드명을 입력해주세요.')
        isSubmitting.value = false
        return
      }

      // 제품 썸네일 결정
      let productThumbnail = null
      if (productState.productImageMode === 'custom') {
        if (productState.customUploading) {
          showError('제품 이미지 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요.')
          isSubmitting.value = false
          return
        }
        if (!productState.customAttachmentInfo) {
          showError('제품 이미지 업로드에 실패했어요. 다시 업로드해주세요.')
          isSubmitting.value = false
          return
        }
        productThumbnail = productState.customAttachmentInfo
      } else {
        // feed 대표 이미지 사용
        productThumbnail = thumbnail?.attachmentInfo || null
      }

      try {
        const productResult = await productService.createProduct({
          name: formData.value.productNameCustom.trim(),
          brand: productState.productBrandCustom.trim(),
          categoryId: formData.value.subCategoryId,
          price: productState.productPriceCustom?.trim() || '0',
          thumbnailAttachmentInfo: productThumbnail
        })
        if (productResult.success && productResult.data) {
          finalProductId = productResult.data.productId || productResult.data.id || null
          console.log('✅ 제품 등록 완료:', finalProductId)
        }
      } catch (error) {
        console.error('제품 등록 실패:', error)
        showError('제품 등록에 실패했어요. 제품명만으로 게시글을 등록합니다.')
      }
    }

    const feedData = {
      userId: formData.value.userId,
      productId: finalProductId,
      productNameCustom: formData.value.productNameCustom.trim(),
      subCategoryId: formData.value.subCategoryId,
      review: formData.value.review.trim(),
      buyPlace: formData.value.store.trim(),
      buyPrice: formData.value.priceUnknown
          ? null
          : (formData.value.priceGift
              ? 0
              : (formData.value.buyPrice ? parseInt(formData.value.buyPrice) : null)),
      evaluation: formData.value.evaluation,
      hashtags: formData.value.hashtags,
      thumbnailAttachmentInfo,
      attachmentFileInfos
    }

    console.log('📤 Feed 생성 요청:', feedData)
    const result = await feedService.createFeed(feedData)

    if (result.success) {
      // 임시저장 삭제
      clearDraft()
      // 로컬 preview URL만 해제 (서버 URL은 해제 불필요)
      selectedPhotos.value.forEach(p => {
        if (p.preview && p.preview.startsWith('blob:')) {
          URL.revokeObjectURL(p.preview)
        }
      })
      showExpGrant(result.data?.expGrant, { mode: 'full' })
      showSuccessToast.value = true
      setTimeout(() => router.push({ path: '/feed', query: { _r: Date.now() } }), 1500)
    } else {
      throw new Error(result.error || 'Feed 생성 실패')
    }
  } catch (error) {
    showError(error.message || '게시글 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const showError = (msg) => {
  errorMessage.value = msg
  setTimeout(() => { errorMessage.value = '' }, 3000)
}

onMounted(async () => {
  await loadDraft()
})

onBeforeUnmount(() => {
  selectedPhotos.value.forEach(p => URL.revokeObjectURL(p.preview))
})
</script>

<style>
.create-container {
  --primary: var(--text-primary);
  --secondary: var(--c-text-400);
  --accent: var(--c-brand);
  --border: var(--border-default);
  --bg: var(--bg-base);
  --hover: var(--bg-subtle);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

.create-container {
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
  /* iOS 홈 인디케이터 회피 */
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

/* Smooth scroll & custom scrollbar */
.create-container {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.create-container::-webkit-scrollbar {
  width: 6px;
}

.create-container::-webkit-scrollbar-track {
  background: transparent;
}

.create-container::-webkit-scrollbar-thumb {
  background: var(--c-text-300);
  border-radius: 3px;
}

.create-container::-webkit-scrollbar-thumb:hover {
  background: var(--c-text-400);
}

/* Header */
.create-header {
  position: sticky;
  top: 66px;
  z-index: 50;
  background: var(--header-blur-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
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

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.header-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: var(--primary);
}

.progress-dots {
  display: flex;
  gap: 5px;
}

.progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border-default);
  transition: all 0.25s ease;
}

.progress-dot.filled {
  background: var(--accent);
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.15);
}

.header-spacer {
  width: 40px;
}

/* Content - Single Column */
.create-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--bg-elevated);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
  min-width: 0;
  overflow: hidden;
}

.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.section-icon { width: 20px; height: 20px; color: var(--accent); }
.card-title { font-size: 16px; font-weight: 800; flex: 1; color: var(--primary); letter-spacing: -0.2px; }
.photo-count { font-size: 13px; font-weight: 700; color: var(--secondary); }

/* Processing Indicator */
.processing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--c-brand-soft);
  border-radius: 10px;
  margin-bottom: 16px;
  color: var(--accent);
  font-size: 14px;
  font-weight: 500;
}

/* Photo Grid */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: move;
}
.photo-item img { width: 100%; height: 100%; object-fit: contain; background: var(--border-default); }
.photo-item.drag-over { border: 2px dashed var(--accent); opacity: 0.5; }
.photo-item.uploading { opacity: 0.7; }
.photo-item.upload-failed { border: 2px solid var(--c-danger); }

/* 업로드 중 오버레이 */
.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}
.upload-spinner {
  width: 32px;
  height: 32px;
  color: white;
  animation: spin 1s linear infinite;
}

/* 업로드 실패 오버레이 */
.upload-failed-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(239, 68, 68, 0.9);
  border-radius: 50%;
  padding: 8px;
}
.upload-failed-overlay .icon {
  width: 24px;
  height: 24px;
  color: white;
}

.btn-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-remove .icon { width: 14px; height: 14px; }

.photo-order {
  position: absolute;
  bottom: 6px;
  left: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.7);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-actions { display: grid; grid-template-columns: 1fr; gap: 10px; }
.btn-photo-action.mobile-only { display: none !important; }

@media (max-width: 768px) {
  .photo-actions { grid-template-columns: 1fr 1fr; }
  .btn-photo-action.mobile-only { display: flex !important; }
}
.btn-photo-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px;
  background: var(--bg-subtle);
  border: 2px dashed var(--c-text-300);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-600);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.btn-photo-action:hover:not(:disabled) { border-color: var(--accent); background: var(--c-brand-soft); }
.btn-photo-action:disabled, .btn-photo-action.disabled { opacity: 0.5; cursor: not-allowed; }
.btn-photo-action .icon { width: 24px; height: 24px; color: var(--accent); }

.hint-text { font-size: 12px; color: var(--secondary); text-align: center; margin-top: 8px; }

/* Review inline in photo card */
.review-inline {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

/* Section divider inside merged card */
.section-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

/* Form */
.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
  letter-spacing: -0.1px;
}
.form-label.required::after, .card-title.required::after { content: '*'; color: var(--c-brand); margin-left: 2px; }

.inline-icon { width: 16px; height: 16px; color: var(--secondary); }
.optional-badge {
  padding: 2px 8px;
  background: var(--bg-subtle);
  color: var(--c-text-400);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
.char-count { margin-left: auto; font-size: 12px; font-weight: 600; color: var(--secondary); }
.char-count.error { color: var(--c-danger); }

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  background: var(--bg-subtle);
  color: var(--primary);
  transition: all 0.15s ease;
}
.form-input::placeholder, .form-textarea::placeholder { color: var(--c-text-300); font-weight: 400; }
.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
  background: var(--bg-elevated);
}
.form-textarea { resize: vertical; min-height: 100px; }
.mt-2 { margin-top: 8px; }


/* Category Inline Selection — iOS tone (CommonCategoryFilter 동기화) */
.selected-category-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-mute);
  border: none;
  border-radius: 6px;
  margin-bottom: 12px;
}
.selected-category-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-600);
}
.selected-category-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--c-text-400);
  cursor: pointer;
  transition: all 0.15s;
  margin-left: 4px;
}
.selected-category-clear:hover {
  color: var(--c-text-600);
}

.category-chips-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.category-chips-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-400);
}
.category-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.category-chip {
  padding: 8px 14px;
  background: var(--bg-mute);
  color: var(--c-text-600);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.category-chip:hover {
  background: var(--bg-subtle);
}
.category-chip.active {
  background: var(--c-brand);
  color: #ffffff;
}
.category-chip.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  background: transparent;
  color: var(--c-text-400);
  font-weight: 600;
}
.category-chip.more-btn:hover {
  background: var(--bg-mute);
  color: var(--c-text-600);
}

/* 2뎁스 하위 카테고리 */
.sub-category-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--bg-mute);
}
.sub-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sub-category-chip {
  padding: 6px 12px;
  background: transparent;
  color: var(--c-text-400);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.sub-category-chip:hover {
  background: var(--bg-mute);
  color: var(--c-text-600);
}
.sub-category-chip.active {
  background: var(--c-text-600);
  color: #ffffff;
}

/* Additional Info */
.additional-info { display: flex; flex-direction: column; gap: 28px; }
.form-group { display: flex; flex-direction: column; gap: 10px; }
.mt-8 { margin-top: 8px; }

/* Quick Store Selection */
.quick-store-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-store-btn {
  padding: 8px 14px;
  background: var(--bg-elevated);
  color: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.quick-store-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.quick-store-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.quick-store-btn.unknown {
  color: var(--c-text-400);
  border-style: dashed;
}

.quick-store-btn.unknown.active {
  background: var(--c-text-500);
  color: white;
  border-style: solid;
  border-color: var(--c-text-500);
}

.quick-store-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.input-hint {
  font-size: 12px;
  color: var(--c-text-400);
  margin-top: 4px;
}

/* Price Input - Underline Style */
.feed-price-wrap {
  padding: 4px 0;
}

.feed-price-line {
  display: flex;
  align-items: baseline;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-default);
  transition: border-color 0.2s ease;
}
.feed-price-line:focus-within { border-bottom-color: var(--accent); }
.feed-price-line.valued { border-bottom-color: var(--text-primary); }
.feed-price-line.valued:focus-within { border-bottom-color: var(--accent); }

.feed-price-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: left;
  padding: 0;
  min-width: 0;
  font-family: inherit;
  letter-spacing: -0.02em;
  caret-color: var(--accent);
  line-height: 1.3;
}
.feed-price-input::placeholder { color: var(--c-text-300); font-weight: 400; font-size: 15px; }

.feed-price-won {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-400);
  margin-left: 4px;
  flex-shrink: 0;
}
.feed-price-line.valued .feed-price-won { color: var(--c-text-600); }

.feed-price-hint {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-400);
}

.price-hidden-notice {
  padding: 12px 14px;
  background: var(--bg-subtle);
  border-radius: 10px;
  font-size: 13px;
  color: var(--secondary);
  text-align: center;
}

/* Evaluation Buttons */
.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.status-btn {
  padding: 12px 8px;
  background: var(--bg-subtle);
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  letter-spacing: -0.1px;
}

.status-btn:hover {
  border-color: var(--c-text-300);
}

.status-btn.best { border-color: var(--c-heat); color: var(--c-heat); }
.status-btn.best.active { background: var(--c-heat); color: white; }

.status-btn.good { border-color: var(--c-success); color: var(--c-success); }
.status-btn.good.active { background: var(--c-success); color: white; }

.status-btn.okay { border-color: var(--c-info); color: var(--c-info); }
.status-btn.okay.active { background: var(--c-info); color: white; }

.status-btn.bad { border-color: var(--c-danger); color: var(--c-danger); }
.status-btn.bad.active { background: var(--c-danger); color: white; }

/* Required Mark */
.label-with-required {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.required-mark {
  color: var(--c-danger);
  font-weight: 600;
}

/* 선택 섹션 헤더 */
.optional-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
.optional-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}

.price-toggle-group {
  display: flex;
  gap: 6px;
  margin-left: auto;
}
.btn-toggle {
  padding: 4px 10px;
  background: var(--hover);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-toggle:hover {
  background: var(--border-strong);
}
.btn-toggle.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}


/* Hashtags */
.count-badge { margin-left: auto; font-size: 13px; color: var(--secondary); }

/* 선택된 해시태그 목록 */
.selected-hashtags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  max-width: 100%;
}

.hashtag-chip {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  background: var(--c-info-soft);
  color: var(--c-info);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.hashtag-symbol {
  color: var(--c-info);
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
  color: var(--c-info);
}

/* 해시태그 입력 박스 */
.hashtag-input-box {
  display: flex;
  align-items: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  max-width: 100%;
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
  min-width: 0;
  padding: 12px 8px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  font-family: inherit;
}

.hashtag-input-field::placeholder {
  color: var(--c-text-400);
}

.btn-add-tag {
  flex-shrink: 0;
  white-space: nowrap;
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
  background: var(--c-brand);
}

.btn-add-tag:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

/* 힌트 텍스트 */
.hashtag-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--c-text-400);
}

/* 추천 해시태그 */
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
  color: var(--text-primary);
  margin-bottom: 10px;
}

.popular-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-400);
}

.popular-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 100%;
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
  background: var(--c-info-soft);
  color: var(--c-info);
}

.popular-tag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Fixed Bottom */
.fixed-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border);
  /* iOS 홈 인디케이터: 하단 패딩 16 + safe area */
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
  z-index: 40;
}
.fixed-bottom-content { max-width: 640px; margin: 0 auto; }
.completion-hint {
  text-align: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--c-text-400);
  font-weight: 600;
}
.btn-submit-large {
  width: 100%;
  padding: 16px;
  background: var(--c-ink-900);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  letter-spacing: -0.2px;
  transition: background 0.15s ease;
}
.btn-submit-large:hover:not(:disabled) { background: var(--c-ink-700); }
.btn-submit-large:disabled { background: var(--bg-mute); color: var(--c-text-300); cursor: not-allowed; opacity: 1; }

.spinner { width: 20px; height: 20px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.confirm-dialog {
  background: var(--bg-elevated);
  border-radius: 16px;
  padding: 28px;
  max-width: 360px;
  width: 100%;
  text-align: center;
}
.dialog-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.dialog-desc { font-size: 14px; color: var(--secondary); margin-bottom: 20px; }
.dialog-actions { display: flex; gap: 10px; }
.btn-dialog {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-dialog.cancel { background: var(--hover); color: var(--primary); }
.btn-dialog.confirm { background: var(--c-danger); color: white; }

/* Toasts */
.error-toast, .success-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  z-index: 300;
}
.error-toast { background: var(--c-danger); color: white; }
.success-toast { background: var(--primary); color: white; }

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }

@media (max-width: 640px) {
  .create-content { padding: 16px 12px; }
}
</style>