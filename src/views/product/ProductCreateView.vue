<template>
  <div class="create-container">
    <AuthLoading v-if="authLoading" />
    <AuthError v-if="errors.auth" :error="errors.auth" @login="handleLoginFromModal" />

    <template v-if="isLoggedIn && !authLoading">
      <!-- 헤더 -->
      <header class="create-header">
        <button class="btn-back" @click="goBack">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="header-title">{{ isEditMode ? '아이템 수정' : '아이템 등록' }}</h1>
        <div class="header-spacer"></div>
      </header>

      <main class="create-content">
        <form @submit.prevent="handleSubmit">

          <!-- 1. 이미지 영역 -->
          <section class="section">
            <label class="section-label">
              <span class="label-dot"></span>
              사진 등록
              <span class="req">필수</span>
            </label>
            <div class="image-row">
              <!-- 대표 이미지 -->
              <div
                  class="thumb-box"
                  :class="{ filled: thumbnailFile, error: errors.thumbnail }"
                  @click="$refs.thumbnailInput.click()"
                  @dragover.prevent
                  @drop.prevent="handleThumbnailDrop"
              >
                <template v-if="thumbnailFile">
                  <img :src="thumbnailFile.preview" alt="대표" />
                  <button type="button" class="img-remove" @click.stop="removeThumbnail">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <span class="thumb-badge">대표</span>
                </template>
                <template v-else>
                  <svg class="upload-icon" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path d="M12 5v14m-7-7h14"/>
                  </svg>
                  <span class="upload-text">대표 이미지</span>
                </template>
              </div>
              <input ref="thumbnailInput" type="file" accept="image/*" hidden @change="handleThumbnailChange" />

              <!-- 추가 이미지들 -->
              <div
                  v-for="(file, idx) in additionalFiles"
                  :key="idx"
                  class="extra-img-box"
              >
                <img :src="file.preview" alt="" />
                <button type="button" class="img-remove" @click="removeAdditionalImage(idx)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <!-- 추가 버튼 -->
              <div
                  v-if="additionalFiles.length < 5"
                  class="extra-img-box add-btn"
                  @click="$refs.additionalInput.click()"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 5v14m-7-7h14"/>
                </svg>
                <span>{{ additionalFiles.length === 0 ? '추가' : '' }}</span>
              </div>
              <input ref="additionalInput" type="file" accept="image/*" multiple hidden @change="handleAdditionalChange" />
            </div>
            <span v-if="errors.thumbnail" class="field-error">{{ errors.thumbnail }}</span>
          </section>

          <!-- 2. 제품 정보 -->
          <section class="section">
            <label class="section-label">
              <span class="label-dot"></span>
              제품 정보
              <span class="req">필수</span>
            </label>

            <div class="field">
              <label class="field-label">제품명 <span class="asterisk">*</span></label>
              <input
                  type="text"
                  v-model="form.name"
                  class="input"
                  :class="{ 'input-error': errors.name }"
                  placeholder="제품명을 입력하세요"
                  @blur="validateField('name')"
              />
              <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
            </div>

            <div class="field">
              <label class="field-label">카테고리 <span class="asterisk">*</span></label>
              <CategoryChipSelector
                v-model="form.subCategoryId"
                content-type="PRODUCT"
                @select="handleCategorySelect"
              />
              <span v-if="errors.subCategoryId" class="field-error">{{ errors.subCategoryId }}</span>
            </div>

            <div class="field">
              <label class="field-label">브랜드</label>
              <input
                  type="text"
                  v-model="form.brand"
                  class="input"
                  placeholder="브랜드명 (선택)"
              />
            </div>
          </section>

          <!-- 3. 가격 & 판매 정보 -->
          <section class="section">
            <label class="section-label">
              <span class="label-dot accent"></span>
              가격 & 판매
              <span class="req">필수</span>
            </label>

            <div class="field">
              <label class="field-label">가격 <span class="asterisk">*</span></label>

              <div class="price-row">
                <div class="price-line" :class="{ valued: priceSingle }">
                  <input
                      type="text"
                      inputmode="numeric"
                      v-model="priceSingle"
                      class="price-big"
                      :placeholder="showRange ? '최소' : '0'"
                      maxlength="11"
                      @input="formatPriceSingle"
                  />
                  <span class="price-won">원</span>
                </div>

                <template v-if="showRange">
                  <span class="price-dash">~</span>
                  <div class="price-line" :class="{ valued: priceMax }">
                    <input
                        type="text"
                        inputmode="numeric"
                        v-model="priceMax"
                        class="price-big"
                        placeholder="최대"
                        maxlength="11"
                        @input="formatPriceMax"
                    />
                    <span class="price-won">원</span>
                  </div>
                  <button type="button" class="price-range-close" @click="closeRange">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </template>
              </div>

              <div class="price-sub">
                <p v-if="errors.price" class="field-error">{{ errors.price }}</p>
                <p v-else-if="priceKoreanHint" class="price-hint">{{ priceKoreanHint }}</p>
                <button v-if="!showRange" type="button" class="price-range-btn" @click="showRange = true">
                  범위 입력
                </button>
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label class="field-label">판매처</label>
                <input
                    type="text"
                    v-model="form.distributor"
                    class="input"
                    placeholder="판매처"
                />
              </div>
              <div class="field">
                <label class="field-label">출시일</label>
                <input
                    type="date"
                    v-model="form.releaseDate"
                    class="input"
                />
              </div>
            </div>
          </section>

          <!-- 4. 설명 -->
          <section class="section">
            <label class="section-label">
              <span class="label-dot accent"></span>
              상세 설명
              <span class="opt">선택</span>
            </label>
            <textarea
                v-model="form.description"
                class="textarea"
                placeholder="제품에 대한 상세 설명을 입력하세요"
                rows="3"
            ></textarea>
          </section>

          <!-- 5. 특징 & 태그 -->
          <section class="section">
            <label class="section-label">
              <span class="label-dot accent"></span>
              특징 & 태그
              <span class="opt">선택</span>
            </label>

            <div class="field">
              <label class="field-label">특징</label>
              <div class="inline-input">
                <input
                    type="text"
                    v-model="customFeature"
                    class="input"
                    placeholder="예: 무선충전 지원"
                    @keyup.enter="addCustomFeature"
                />
                <button type="button" class="btn-inline" @click="addCustomFeature">추가</button>
              </div>
              <div v-if="selectedFeatures.length > 0" class="chips">
                <span v-for="(f, i) in selectedFeatures" :key="i" class="chip">
                  {{ f }}
                  <button type="button" class="chip-x" @click="selectedFeatures.splice(i, 1)">&times;</button>
                </span>
              </div>
            </div>

            <div class="field">
              <label class="field-label">태그 <span class="tag-count">{{ selectedTags.length }}/10</span></label>
              <div class="inline-input">
                <input
                    type="text"
                    v-model="tagInput"
                    class="input"
                    placeholder="예: 가성비, 신제품"
                    @keyup.enter="addTag(tagInput); tagInput = ''"
                />
                <button type="button" class="btn-inline tag" @click="addTag(tagInput); tagInput = ''">추가</button>
              </div>
              <div v-if="selectedTags.length > 0" class="chips">
                <span v-for="(t, i) in selectedTags" :key="i" class="chip chip-tag">
                  #{{ t }}
                  <button type="button" class="chip-x" @click="removeTag(i)">&times;</button>
                </span>
              </div>
            </div>
          </section>

        </form>
      </main>

      <!-- 하단 고정 바 -->
      <footer class="bottom-bar">
        <div class="bottom-inner">
          <p v-if="missingFieldsText" class="bottom-hint">{{ missingFieldsText }}</p>
          <button class="btn-submit" :disabled="!canSubmit" @click="handleSubmit">
            <template v-if="isLoading">
              <svg class="spin-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
              {{ isEditMode ? '수정 중...' : '등록 중...' }}
            </template>
            <template v-else>{{ isEditMode ? '아이템 수정' : '아이템 등록' }}</template>
          </button>
        </div>
      </footer>
    </template>

    <LoginModal v-if="showLoginModal" @login="handleLoginFromModal" @close="closeLoginModal" />
    <LoadingOverlay v-if="isLoading" />
    <SuccessModal v-if="showSuccessModal" @view-products="navigateToProducts" @go-home="navigateToHome" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProduct } from '@/composables/useProduct.js'
import { productService } from '@/services/ProductService.js'
import { useFile } from '@/services/FileService.js'
import { useAuth } from '@/composables/useAuth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

import AuthLoading from '@/components/product/create/AuthLoading.vue'
import AuthError from '@/components/product/create/AuthError.vue'
import LoginModal from '@/components/product/create/LoginModal.vue'
import LoadingOverlay from '@/components/product/create/LoadingOverlay.vue'
import SuccessModal from '@/components/product/create/SuccessModal.vue'
import CategoryChipSelector from '@/components/common/CategoryChipSelector.vue'

const router = useRouter()
const route = useRoute()
const { user, isLoggedIn, loading: authLoading, userId, userNickname, checkAuthStatus, logout } = useAuth()
const { createProduct, debugStatus } = useProduct()

const isEditMode = computed(() => !!route.params.id)
const editProductId = computed(() => route.params.id)
const { upload } = useFile()
const { open, openLoginRequired } = useConfirmDialog()

const isLoading = ref(false)
const showSuccessModal = ref(false)
const showLoginModal = ref(false)
const thumbnailFile = ref(null)
const additionalFiles = ref([])
const selectedFeatures = ref([])
const selectedTags = ref([])
const customFeature = ref('')
const tagInput = ref('')
const showRange = ref(false)
const priceSingle = ref('')
const priceMax = ref('')

const thumbnailInput = ref(null)
const additionalInput = ref(null)

const form = reactive({
  name: '',
  brand: '',
  description: '',
  distributor: '',
  price: '',
  feature: '',
  tags: [],
  releaseDate: '',
  subCategoryId: null
})

const errors = reactive({
  name: '',
  subCategoryId: '',
  thumbnail: '',
  price: '',
  auth: ''
})

const isFormValid = computed(() => {
  return isLoggedIn.value && form.name.trim() && form.subCategoryId && thumbnailFile.value !== null && priceSingle.value.replace(/[^\d]/g, '')
})

const canSubmit = computed(() => {
  return isFormValid.value && !isLoading.value && !authLoading.value
})

const missingFieldsText = computed(() => {
  const missing = []
  if (!thumbnailFile.value) missing.push('대표 이미지')
  if (!form.name.trim()) missing.push('제품명')
  if (!form.subCategoryId) missing.push('카테고리')
  if (!priceSingle.value.replace(/[^\d]/g, '')) missing.push('가격')
  if (missing.length === 0) return ''
  if (missing.length <= 2) return `${missing.join(', ')} 입력이 필요합니다`
  return `${missing.length}개 항목을 더 입력해주세요`
})

watch(isLoggedIn, (newValue, oldValue) => {
  if (!newValue && oldValue) handleLoggedOut()
  else if (newValue && !oldValue) handleLoggedIn()
})

onMounted(async () => {
  await checkAuthenticationStatus()
  if (isLoggedIn.value) {
    if (isEditMode.value) {
      window.addEventListener('beforeunload', beforeUnloadHandler)
      await loadProductForEdit()
    } else {
      await initializeComponent()
    }
  } else showAuthRequiredMessage()
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
  if (thumbnailFile.value?.preview) URL.revokeObjectURL(thumbnailFile.value.preview)
  additionalFiles.value.forEach(f => f.preview && URL.revokeObjectURL(f.preview))
})

const checkAuthenticationStatus = async () => {
  try {
    const isAuthenticated = await checkAuthStatus()
    if (!isAuthenticated) { errors.auth = '로그인이 필요한 서비스입니다'; return false }
    errors.auth = ''
    return true
  } catch (error) { errors.auth = '인증 상태를 확인할 수 없습니다'; return false }
}

const showAuthRequiredMessage = () => { showLoginModal.value = true }

const handleLoggedOut = async () => {
  if (hasFormData() && !isEditMode.value) {
    saveDraft()
    await open({ type: 'alert', title: '알림', message: '로그아웃되었습니다. 입력하신 내용은 임시저장되었습니다.' })
  }
  router.push({ name: 'Login', query: { reason: 'session_expired', redirect: router.currentRoute.value.fullPath } })
}

const handleLoggedIn = async () => {
  if (isEditMode.value) {
    await loadProductForEdit()
  } else {
    await initializeComponent()
    if (localStorage.getItem('productFormDraft')) {
      const confirmed = await open({ type: 'confirm', title: '확인', message: '이전에 작성하던 내용이 있습니다. 복원하시겠습니까?' })
      if (confirmed) restoreDraft()
    }
  }
  showLoginModal.value = false
}

const handleLoginFromModal = () => {
  router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
}

const closeLoginModal = () => { showLoginModal.value = false; router.push('/') }

const initializeComponent = async () => {
  try { restoreDraft(); debugStatus(); window.addEventListener('beforeunload', beforeUnloadHandler) }
  catch (error) { console.error('컴포넌트 초기화 실패:', error) }
}

const loadProductForEdit = async () => {
  isLoading.value = true
  try {
    const response = await productService.getProduct(editProductId.value)
    if (!response.success || !response.data) {
      await open({ type: 'alert', title: '오류', message: '상품 정보를 불러오는데 실패했습니다.' })
      router.push('/'); return
    }
    const p = response.data
    form.name = p.name || ''
    form.brand = p.brand || ''
    form.description = p.description || ''
    form.distributor = p.distributor || ''
    form.releaseDate = p.releaseDate || ''
    form.subCategoryId = p.subCategoryDetail?.subCategoryId || p.category?.id || p.categoryId || null

    if (p.price) {
      if (p.price.includes('~')) {
        const [min, max] = p.price.split('~')
        priceSingle.value = formatNumber(min)
        priceMax.value = formatNumber(max)
        showRange.value = true
      } else {
        priceSingle.value = formatNumber(p.price)
      }
    }

    if (p.feature) {
      selectedFeatures.value = p.feature.split(';').filter(f => f.trim())
    }

    if (p.tags) {
      if (typeof p.tags === 'string') {
        selectedTags.value = p.tags.split(';').filter(t => t.trim())
      } else if (Array.isArray(p.tags)) {
        selectedTags.value = [...p.tags]
      }
    }

    const thumbUrl = p.thumbnailUrl || p.thumbnailDto?.fileUrl || (p.attachmentFiles?.length > 0 ? p.attachmentFiles[0].fileUrl : null)
    if (thumbUrl) {
      thumbnailFile.value = { file: null, preview: thumbUrl, isExisting: true, existingInfo: p.thumbnailDto || p.attachmentFiles?.[0] }
    }

    const allFiles = p.attachmentFiles || []
    const thumbFileId = thumbnailFile.value?.existingInfo?.id || thumbnailFile.value?.existingInfo?.fileId
    const additionalImgs = thumbFileId ? allFiles.filter(f => (f.id || f.fileId) !== thumbFileId) : allFiles.slice(1)
    additionalFiles.value = additionalImgs.map(f => ({
      file: null,
      preview: f.fileUrl,
      isExisting: true,
      existingInfo: f
    }))
  } catch (error) {
    console.error('상품 로드 실패:', error)
    await open({ type: 'alert', title: '오류', message: '상품 정보를 불러오는데 실패했습니다.' })
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

const validateField = (fieldName) => {
  errors[fieldName] = ''
  switch (fieldName) {
    case 'name':
      if (!form.name.trim()) errors.name = '제품명은 필수입니다'
      else if (form.name.length < 2) errors.name = '최소 2자 이상 입력해주세요'
      else if (form.name.length > 100) errors.name = '최대 100자까지 입력 가능합니다'
      break
    case 'subCategoryId':
      if (!form.subCategoryId) errors.subCategoryId = '카테고리를 선택해주세요'
      break
    case 'price':
      if (!priceSingle.value.replace(/[^\d]/g, '')) errors.price = '가격은 필수입니다'
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('subCategoryId')
  validateField('price')
  if (!thumbnailFile.value) errors.thumbnail = '대표 이미지는 필수입니다'
  else errors.thumbnail = ''
  return !Object.values(errors).some(e => e !== '')
}

const handleThumbnailChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (thumbnailFile.value?.preview) URL.revokeObjectURL(thumbnailFile.value.preview)
    thumbnailFile.value = { file, preview: URL.createObjectURL(file) }
    errors.thumbnail = ''
  }
}

const handleThumbnailDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    if (thumbnailFile.value?.preview) URL.revokeObjectURL(thumbnailFile.value.preview)
    thumbnailFile.value = { file, preview: URL.createObjectURL(file) }
    errors.thumbnail = ''
  }
}

const removeThumbnail = () => {
  if (thumbnailFile.value?.preview) URL.revokeObjectURL(thumbnailFile.value.preview)
  thumbnailFile.value = null
}

const handleAdditionalChange = (e) => {
  const files = Array.from(e.target.files)
  const remaining = 5 - additionalFiles.value.length
  files.slice(0, remaining).forEach(file => {
    additionalFiles.value.push({ file, preview: URL.createObjectURL(file) })
  })
}

const removeAdditionalImage = (index) => {
  const fileObj = additionalFiles.value[index]
  if (fileObj.preview) URL.revokeObjectURL(fileObj.preview)
  additionalFiles.value.splice(index, 1)
}

const addCustomFeature = async () => {
  const feature = customFeature.value.trim()
  if (!feature) return
  if (selectedFeatures.value.includes(feature)) {
    await open({ type: 'alert', title: '중복', message: '이미 추가된 특징입니다' })
    customFeature.value = ''
    return
  }
  selectedFeatures.value.push(feature)
  customFeature.value = ''
}

const addTag = async (tag) => {
  const t = tag?.trim()
  if (!t) return
  if (selectedTags.value.includes(t)) {
    await open({ type: 'alert', title: '중복', message: '이미 추가된 태그입니다' }); return
  }
  if (selectedTags.value.length >= 10) {
    await open({ type: 'alert', title: '제한 초과', message: '태그는 최대 10개까지입니다' }); return
  }
  selectedTags.value.push(t)
}

const removeTag = (index) => { selectedTags.value.splice(index, 1) }

const handleCategorySelect = ({ subCategoryId }) => {
  form.subCategoryId = subCategoryId
  errors.subCategoryId = ''
}

// Price
const MAX_PRICE = 999999999
const formatNumber = (val) => {
  let digits = val.replace(/[^\d]/g, '')
  if (digits && parseInt(digits, 10) > MAX_PRICE) digits = String(MAX_PRICE)
  return digits ? Number(digits).toLocaleString('ko-KR') : ''
}
const formatPriceSingle = () => { priceSingle.value = formatNumber(priceSingle.value) }
const formatPriceMax = () => { priceMax.value = formatNumber(priceMax.value) }

const closeRange = () => {
  showRange.value = false
  priceMax.value = ''
}

const toKoreanUnit = (str) => {
  const num = parseInt((str || '').replace(/[^\d]/g, ''), 10)
  if (!num || num < 10000) return ''
  const eok = Math.floor(num / 100000000)
  const manPart = Math.floor((num % 100000000) / 10000)
  const subMan = num % 10000
  const parts = []
  if (eok > 0) parts.push(`${eok.toLocaleString()}억`)
  if (manPart > 0) parts.push(`${manPart.toLocaleString()}만`)
  if (subMan > 0) parts.push(`${subMan.toLocaleString()}`)
  return parts.join(' ') + '원'
}
const priceKoreanHint = computed(() => toKoreanUnit(priceSingle.value))

const buildPriceString = () => {
  const single = priceSingle.value.replace(/[^\d]/g, '')
  const max = priceMax.value.replace(/[^\d]/g, '')
  if (!single && !max) return null
  if (showRange.value && single && max) return `${single}~${max}`
  return single || max || null
}

const buildImageInfo = (info) => ({
  fileId: info.id || info.fileId,
  storedPath: info.fileUrl || info.storedPath,
  originName: info.orgFileNm || info.originName,
  fileSize: info.fileSize,
  contentType: info.contentType || 'image/jpeg',
  fileExplain: '제품 이미지'
})

const handleSubmit = async () => {
  if (!isLoggedIn.value) {
    await openLoginRequired('제품을 등록하려면 로그인이 필요해요')
    showAuthRequiredMessage(); return
  }
  if (!userId.value) {
    await open({ type: 'alert', title: '오류', message: '사용자 정보를 확인할 수 없습니다' })
    await logout(); return
  }
  if (!thumbnailFile.value) {
    await open({ type: 'alert', title: '필수 항목', message: '대표 이미지는 필수입니다' }); return
  }
  if (!validateForm()) {
    await open({ type: 'alert', title: '입력 오류', message: '입력 정보를 확인해주세요' }); return
  }

  isLoading.value = true
  try {
    // 대표 이미지 처리
    let thumbnailAttachmentInfo
    if (thumbnailFile.value.isExisting) {
      thumbnailAttachmentInfo = { ...buildImageInfo(thumbnailFile.value.existingInfo), fileExplain: '제품 대표 이미지' }
    } else {
      const thumbnailUploadResult = await upload(thumbnailFile.value.file, { fileCode: 'PRODUCT' })
      if (!thumbnailUploadResult.success) throw new Error(`대표 이미지 업로드 실패: ${thumbnailUploadResult.error}`)
      thumbnailAttachmentInfo = {
        fileId: thumbnailUploadResult.data.id,
        storedPath: thumbnailUploadResult.data.fileUrl,
        originName: thumbnailUploadResult.data.orgFileNm,
        fileSize: thumbnailUploadResult.data.fileSize,
        contentType: thumbnailUploadResult.data.contentType || 'image/jpeg',
        fileExplain: '제품 대표 이미지'
      }
    }

    // 추가 이미지 처리
    const attachmentFileInfos = []
    for (const fileObj of additionalFiles.value) {
      if (fileObj.isExisting) {
        attachmentFileInfos.push({ ...buildImageInfo(fileObj.existingInfo), fileExplain: `제품 추가 이미지 ${attachmentFileInfos.length + 1}`, sortOrder: attachmentFileInfos.length + 1 })
      } else {
        const uploadResult = await upload(fileObj.file, { fileCode: 'PRODUCT' })
        if (!uploadResult.success) throw new Error(`추가 이미지 업로드 실패: ${uploadResult.error}`)
        attachmentFileInfos.push({
          fileId: uploadResult.data.id, storedPath: uploadResult.data.fileUrl, originName: uploadResult.data.orgFileNm,
          fileSize: uploadResult.data.fileSize, contentType: uploadResult.data.contentType || 'image/jpeg',
          fileExplain: `제품 추가 이미지 ${attachmentFileInfos.length + 1}`, sortOrder: attachmentFileInfos.length + 1
        })
      }
    }

    const allFeatures = [...selectedFeatures.value]
    if (customFeature.value.trim()) allFeatures.push(customFeature.value.trim())

    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      description: form.description.trim() || null,
      distributor: form.distributor.trim() || null,
      price: buildPriceString(),
      feature: allFeatures.length > 0 ? allFeatures.join(';') : null,
      tags: selectedTags.value,
      releaseDate: form.releaseDate || null,
      categoryId: form.subCategoryId,
      thumbnailAttachmentInfo,
      attachmentFileInfos
    }

    if (isEditMode.value) {
      const response = await productService.updateProduct(editProductId.value, productData)
      if (response.success) {
        await open({ type: 'alert', title: '수정 완료', message: '상품 정보가 수정되었습니다.' })
        router.push(`/products/${editProductId.value}`)
      } else {
        throw new Error(response.error || '제품 수정에 실패했습니다')
      }
    } else {
      const response = await createProduct(productData)
      if (response.success) {
        localStorage.removeItem('productFormDraft')
        showSuccessModal.value = true
      } else {
        throw new Error(response.error || '제품 등록에 실패했습니다')
      }
    }
  } catch (error) {
    console.error(isEditMode.value ? '제품 수정 실패:' : '제품 등록 실패:', error)
    if (error.message.includes('인증') || error.message.includes('권한')) {
      await open({ type: 'alert', title: '인증 만료', message: '인증이 만료되었습니다. 다시 로그인해주세요' })
      await logout()
    } else {
      await open({ type: 'alert', title: '오류', message: error.message || '제품 처리 중 오류가 발생했습니다' })
    }
  } finally { isLoading.value = false }
}

const saveDraft = () => {
  if (!isLoggedIn.value) return
  localStorage.setItem('productFormDraft', JSON.stringify({
    timestamp: new Date().toISOString(), userId: userId.value, userNickname: userNickname.value,
    form: { ...form }, selectedFeatures: [...selectedFeatures.value],
    selectedTags: [...selectedTags.value], customFeature: customFeature.value
  }))
}

const restoreDraft = async () => {
  if (!isLoggedIn.value) return
  const saved = localStorage.getItem('productFormDraft')
  if (saved) {
    try {
      const d = JSON.parse(saved)
      if (d.userId && d.userId !== userId.value) {
        const ok = await open({ type: 'danger', title: '임시저장 데이터', message: '다른 계정의 임시저장 데이터입니다. 삭제하시겠습니까?' })
        if (ok) localStorage.removeItem('productFormDraft')
        return
      }
      Object.assign(form, d.form || {})
      if (d.selectedFeatures) selectedFeatures.value = d.selectedFeatures
      if (d.selectedTags) selectedTags.value = d.selectedTags
      if (d.customFeature) customFeature.value = d.customFeature
    } catch { localStorage.removeItem('productFormDraft') }
  }
}

const goBack = async () => {
  if (isEditMode.value) {
    router.push(`/products/${editProductId.value}`)
    return
  }
  if (hasFormData()) {
    const ok = await open({ type: 'confirm', title: '임시저장', message: '작성 중인 내용을 임시저장하시겠습니까?', confirmText: '임시저장', cancelText: '저장 안 함' })
    if (ok) saveDraft()
    router.push('/')
  } else { router.push('/') }
}

const hasFormData = () => {
  return form.name.trim() || form.description.trim() || thumbnailFile.value !== null || additionalFiles.value.length > 0 || selectedTags.value.length > 0
}

const navigateToProducts = () => { showSuccessModal.value = false; router.push('/products') }
const navigateToHome = () => { showSuccessModal.value = false; router.push('/') }

const beforeUnloadHandler = (event) => {
  if (isLoggedIn.value && hasFormData()) {
    event.preventDefault()
    event.returnValue = '입력된 내용이 있습니다. 페이지를 벗어나시겠습니까?'
  }
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.create-container {
  font-family: 'SUIT', 'Noto Sans KR', -apple-system, sans-serif;
  background: var(--bg-base);
  min-height: 100vh;
  color: var(--text-primary);
  /* iOS 홈 인디케이터 회피 */
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}

/* ── Header ── */
.create-header {
  position: sticky;
  top: 66px;
  z-index: 50;
  background: var(--header-blur-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #ebedf0;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-back {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; background: transparent; border: none;
  border-radius: 10px; cursor: pointer; color: var(--text-primary); transition: background 0.15s;
}
.btn-back:hover { background: var(--border-default); }
.header-title { flex: 1; font-size: 17px; font-weight: 700; }
.header-spacer { width: 36px; }

/* ── Content ── */
.create-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.create-content form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Section ── */
.section {
  background: var(--bg-elevated);
  border-radius: 14px;
  padding: 18px 18px 20px;
  border: 1px solid var(--border-strong);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 14px;
}
.label-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--c-brand);
  flex-shrink: 0;
}
.label-dot.accent { background: var(--c-text-300); }

.req {
  margin-left: auto;
  padding: 2px 7px;
  background: var(--c-danger-soft);
  color: var(--c-danger);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.opt {
  margin-left: auto;
  padding: 2px 7px;
  background: var(--bg-subtle);
  color: var(--c-text-400);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

/* ── Image Row ── */
.image-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}
.image-row::-webkit-scrollbar { display: none; }

.thumb-box {
  width: 110px; height: 110px;
  border: 2px dashed var(--c-text-300);
  border-radius: 14px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--c-brand-soft);
}
.thumb-box:hover { border-color: var(--c-brand); }
.thumb-box.filled { border: none; background: none; }
.thumb-box.error { border-color: var(--c-danger); background: var(--c-danger-soft); }
.thumb-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }

.upload-icon { color: var(--c-brand); opacity: 0.6; }
.upload-text { font-size: 11px; font-weight: 600; color: var(--c-brand); opacity: 0.7; }

.thumb-badge {
  position: absolute;
  bottom: 6px; left: 6px;
  padding: 2px 8px;
  background: var(--c-brand);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 6px;
}

.extra-img-box {
  width: 80px; height: 80px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  align-self: flex-end;
}
.extra-img-box img { width: 100%; height: 100%; object-fit: cover; }

.extra-img-box.add-btn {
  border: 2px dashed var(--c-text-300);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 2px;
  cursor: pointer;
  color: var(--c-text-400);
  font-size: 11px;
  font-weight: 500;
  transition: all 0.15s;
  background: var(--bg-elevated);
}
.extra-img-box.add-btn:hover { border-color: var(--c-brand); color: var(--c-brand); background: var(--c-brand-soft); }

.img-remove {
  position: absolute;
  top: 5px; right: 5px;
  width: 22px; height: 22px;
  background: rgba(0,0,0,0.55);
  color: white; border: none; border-radius: 50%;
  cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  transition: background 0.15s;
}
.img-remove:hover { background: rgba(0,0,0,0.8); }

/* ── Price ── */
.price-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.price-line {
  flex: 1;
  display: flex;
  align-items: baseline;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-default);
  transition: border-color 0.2s ease;
  min-width: 0;
}
.price-line:focus-within { border-bottom-color: var(--c-brand); }
.price-line.valued { border-bottom-color: var(--text-primary); }
.price-line.valued:focus-within { border-bottom-color: var(--c-brand); }

.price-big {
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
  caret-color: var(--c-brand);
  line-height: 1.3;
}
.price-big::placeholder { color: var(--c-text-300); font-weight: 400; font-size: 15px; }

.price-won {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-400);
  margin-left: 4px;
  flex-shrink: 0;
}
.price-line.valued .price-won { color: var(--c-text-600); }

.price-dash {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text-300);
  flex-shrink: 0;
  padding-bottom: 8px;
}

.price-range-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  color: var(--c-text-300);
  cursor: pointer;
  border-radius: 50%;
  flex-shrink: 0;
  margin-bottom: 4px;
  transition: all 0.15s;
}
.price-range-close:hover { background: #F2F3F5; color: #6B6E76; }

.price-sub {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  min-height: 20px;
}

.price-hint {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-400);
  margin: 0;
}

.price-range-btn {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-brand);
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  font-family: inherit;
  transition: opacity 0.15s;
}
.price-range-btn:hover { opacity: 0.7; }

/* ── Fields ── */
.field { margin-bottom: 14px; }
.field:last-child { margin-bottom: 0; }

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-600);
  margin-bottom: 6px;
}
.asterisk { color: var(--c-danger); }
.tag-count { float: right; font-weight: 500; color: var(--c-text-400); font-size: 12px; }

.input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-elevated);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
  outline: none;
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
}
.input::placeholder { color: #c4c9d1; }
.input-error { border-color: var(--c-danger); }

.textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text-primary);
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.15s;
}
.textarea:focus {
  outline: none;
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
}
.textarea::placeholder { color: #c4c9d1; }

.field-error {
  display: block;
  font-size: 12px;
  color: var(--c-danger);
  margin-top: 4px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field-row .field { margin-bottom: 0; }

/* ── Inline Input + Button ── */
.inline-input {
  display: flex;
  gap: 8px;
}
.inline-input .input { flex: 1; }

.btn-inline {
  padding: 0 16px;
  background: var(--border-default);
  color: var(--c-text-600);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  font-family: inherit;
}
.btn-inline:hover { background: var(--border-strong); color: var(--text-primary); }
.btn-inline.tag { background: var(--c-brand-soft); color: var(--c-brand); border-color: var(--c-brand-soft); }
.btn-inline.tag:hover { background: var(--c-brand-soft); }

/* ── Chips ── */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  background: var(--border-default);
  border-radius: 8px;
  font-size: 13px;
  color: var(--c-text-600);
  font-weight: 500;
}
.chip-tag {
  background: var(--c-brand-soft);
  color: var(--c-brand-hover);
}
.chip-x {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px;
  background: none; border: none;
  color: var(--c-text-400); cursor: pointer;
  font-size: 15px; line-height: 1;
  border-radius: 50%;
  transition: all 0.1s;
}
.chip-x:hover { background: rgba(0,0,0,0.06); color: var(--c-text-500); }

/* ── Bottom Bar ── */
.bottom-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--header-blur-bg);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-default);
  /* iOS 홈 인디케이터 회피 */
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  z-index: 40;
}
.bottom-inner { max-width: 720px; margin: 0 auto; }

.bottom-hint {
  text-align: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--c-text-400);
  font-weight: 500;
}
.btn-submit {
  width: 100%;
  padding: 14px;
  background: var(--c-brand);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-submit:hover:not(:disabled) { background: var(--c-brand); }
.btn-submit:disabled { background: var(--c-text-300); color: #fff; cursor: not-allowed; }

.spin-icon { width: 18px; height: 18px; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 640px) {
  .create-content { padding: 16px 12px; gap: 8px; }
  .section { padding: 16px 14px 18px; border-radius: 12px; }
  .field-row { grid-template-columns: 1fr; gap: 0; }
  .field-row .field { margin-bottom: 14px; }
  .field-row .field:last-child { margin-bottom: 0; }
  .thumb-box { width: 100px; height: 100px; }
  .extra-img-box { width: 68px; height: 68px; }
}
</style>
