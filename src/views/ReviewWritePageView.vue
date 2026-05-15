<!-- ReviewWritePage.vue -->
<template>
  <div class="review-write-page">
    <!-- 헤더 -->
    <div class="page-header">
      <button class="back-button" @click="handleBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">리뷰 작성</h1>
      <div class="header-spacer"></div>
    </div>

    <!-- 상품 정보 -->
    <div v-if="product" class="product-info">
      <div class="product-image">
        <img v-if="product.thumbnailUrl" :src="product.thumbnailUrl" :alt="product.name" />
        <div v-else class="image-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
          </svg>
        </div>
      </div>
      <div class="product-details">
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-brand">{{ product.brand }}</p>
      </div>
    </div>

    <!-- 리뷰 폼 -->
    <form class="review-form" @submit.prevent="handleSubmit">
      <!-- 평점 선택 -->
      <div class="form-section">
        <label class="form-label">
          평점
          <span class="required">*</span>
        </label>
        <div class="rating-selector">
          <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="star-button"
              :class="{ active: star <= formData.rating, hover: star <= hoverRating }"
              @click="selectRating(star)"
              @mouseenter="hoverRating = star"
              @mouseleave="hoverRating = 0"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L19.708 11.528L28 12.756L22 18.588L23.416 26.844L16 22.944L8.584 26.844L10 18.588L4 12.756L12.292 11.528L16 4Z" :fill="star <= (hoverRating || formData.rating) ? '#F59E0B' : 'none'" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div v-if="formData.rating > 0" class="rating-text">
          {{ getRatingText(formData.rating) }}
        </div>
        <div v-if="errors.rating" class="error-message">{{ errors.rating }}</div>
      </div>

      <!-- 리뷰 내용 -->
      <div class="form-section">
        <label class="form-label" for="comment">
          리뷰 내용
          <span class="required">*</span>
        </label>
        <textarea
            id="comment"
            v-model="formData.comment"
            class="form-textarea"
            :class="{ error: errors.comment }"
            placeholder="상품에 대한 솔직한 리뷰를 작성해주세요&#10;&#10;• 상품의 장단점을 구체적으로 작성해주시면 다른 고객들에게 큰 도움이 됩니다&#10;• 최소 10자 이상 작성해주세요"
            rows="8"
            maxlength="1000"
            @input="validateComment"
        ></textarea>
        <div class="textarea-info">
          <span v-if="errors.comment" class="error-message">{{ errors.comment }}</span>
          <span class="char-count" :class="{ limit: formData.comment.length >= 1000 }">
            {{ formData.comment.length }} / 1000
          </span>
        </div>
      </div>

      <!-- 이미지 첨부 (선택사항) -->
      <div class="form-section">
        <label class="form-label">
          사진 첨부
          <span class="optional">(선택)</span>
        </label>
        <div class="image-upload-area">
          <div v-if="previewImages.length > 0" class="image-preview-list">
            <div
                v-for="(image, index) in previewImages"
                :key="index"
                class="image-preview-item"
            >
              <img :src="image.url" :alt="`첨부 이미지 ${index + 1}`" />
              <button type="button" class="remove-image-btn" @click="removeImage(index)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          <label v-if="previewImages.length < 5" class="upload-button">
            <input
                type="file"
                accept="image/*"
                multiple
                class="file-input"
                @change="handleImageUpload"
                :disabled="previewImages.length >= 5"
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>사진 추가</span>
            <span class="upload-limit">(최대 5장)</span>
          </label>
        </div>
        <p class="form-help">JPG, PNG 파일 (최대 10MB)</p>
      </div>

      <!-- 제출 버튼 -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="handleCancel">취소</button>
        <button type="submit" class="btn-submit" :disabled="isSubmitting || !isFormValid">
          {{ isSubmitting ? '등록 중...' : '리뷰 등록' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductDetail } from '@/composables/useProduct'
import { useFile } from '@/services/FileService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const router = useRouter()
const route = useRoute()

const {
  fetchProduct,
  createReview,
  validateReviewData
} = useProductDetail()

const { upload } = useFile()
const { open } = useConfirmDialog()

// State
const product = ref(null)
const loading = ref(false)
const loadError = ref(null)

const formData = reactive({
  rating: 0,
  comment: '',
  images: []
})

const errors = reactive({
  rating: '',
  comment: ''
})

const previewImages = ref([])
const hoverRating = ref(0)
const isSubmitting = ref(false)

// Computed
const isFormValid = computed(() => {
  return formData.rating > 0 &&
      formData.comment.trim().length >= 10 &&
      !errors.rating &&
      !errors.comment
})

// Methods
const selectRating = (rating) => {
  formData.rating = rating
  errors.rating = ''
}

const getRatingText = (rating) => {
  const texts = {
    1: '별로예요',
    2: '그저 그래요',
    3: '괜찮아요',
    4: '좋아요',
    5: '최고예요'
  }
  return texts[rating] || ''
}

const validateComment = () => {
  const comment = formData.comment.trim()
  if (comment.length === 0) {
    errors.comment = '리뷰 내용을 입력해주세요'
  } else if (comment.length < 10) {
    errors.comment = '최소 10자 이상 입력해주세요'
  } else {
    errors.comment = ''
  }
}

const handleImageUpload = async (event) => {
  const files = Array.from(event.target.files)
  const remainingSlots = 5 - previewImages.value.length

  if (files.length > remainingSlots) {
    await open({ type: 'alert', title: '첨부 제한', message: `최대 ${remainingSlots}장까지 추가할 수 있습니다` })
    return
  }

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      await open({ type: 'alert', title: '파일 크기 초과', message: `${file.name}은(는) 10MB를 초과합니다` })
      continue
    }

    if (!file.type.startsWith('image/')) {
      await open({ type: 'alert', title: '파일 형식 오류', message: `${file.name}은(는) 이미지 파일이 아닙니다` })
      continue
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      previewImages.value.push({
        file: file,
        url: e.target.result
      })
    }
    reader.readAsDataURL(file)
  }

  event.target.value = ''
}

const removeImage = (index) => {
  previewImages.value.splice(index, 1)
}

const validateForm = () => {
  let isValid = true

  if (formData.rating === 0) {
    errors.rating = '평점을 선택해주세요'
    isValid = false
  }

  validateComment()
  if (errors.comment) {
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const productId = route.params.id

    if (!productId) {
      await open({ type: 'alert', title: '오류', message: '상품 ID가 없습니다' })
      return
    }

    console.log('📤 [REVIEW_WRITE] 리뷰 등록 시작')

    // 1. 이미지 파일을 서버에 업로드하고 파일 정보 받기
    const attachmentFileInfos = []

    for (const image of previewImages.value) {
      console.log('📤 이미지 업로드 중:', image.file.name)
      const uploadResult = await upload(image.file, { fileCode: 'REVIEW' })

      if (uploadResult.success && uploadResult.data) {
        // 파일 정보 객체 사용
        attachmentFileInfos.push({
          id: uploadResult.data.id,
          fileUrl: uploadResult.data.fileUrl,
          orgFileNm: uploadResult.data.orgFileNm,
          fileSize: uploadResult.data.fileSize,
          contentType: uploadResult.data.contentType
        })
        console.log('✅ 이미지 업로드 성공:', uploadResult.data.orgFileNm)
      } else {
        console.error('❌ 이미지 업로드 실패:', image.file.name)
      }
    }

    console.log('✅ 모든 이미지 업로드 완료:', attachmentFileInfos.length, '개')

    // 2. 리뷰 데이터 구성
    const reviewData = {
      productId: productId,
      rating: formData.rating,
      comment: formData.comment.trim(),
      attachmentFileInfos: attachmentFileInfos  // 파일 정보 객체 배열
    }

    console.log('📤 [REVIEW_WRITE] 최종 전송 데이터:', JSON.stringify(reviewData, null, 2))

    // 3. 리뷰 등록
    const result = await createReview(reviewData)

    if (result.success) {
      await open({ type: 'alert', title: '등록 완료', message: '리뷰가 등록되었습니다' })
      router.push({
        name: 'ProductDetail',
        params: { id: productId }
      })
    } else {
      await open({ type: 'alert', title: '오류', message: result.error || '리뷰 등록에 실패했습니다' })
    }
  } catch (error) {
    console.error('❌ [REVIEW_WRITE] 리뷰 등록 실패:', error)
    await open({ type: 'alert', title: '오류', message: '리뷰 등록에 실패했습니다' })
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = async () => {
  if (formData.rating > 0 || formData.comment.trim().length > 0) {
    const confirmed = await open({ type: 'confirm', title: '작성 취소', message: '작성 중인 내용이 있습니다. 취소하시겠습니까?' })
    if (confirmed) {
      handleBack()
    }
  } else {
    handleBack()
  }
}

const handleBack = () => {
  router.back()
}

const loadProductInfo = async () => {
  const productId = route.params.id

  console.log('현재 route params:', route.params)
  console.log('사용할 productId:', productId)

  if (!productId) {
    loadError.value = '상품 ID가 올바르지 않습니다'
    return
  }

  loading.value = true
  loadError.value = null

  try {
    const result = await fetchProduct(productId)

    if (result) {
      product.value = result
    } else {
      product.value = {
        id: productId,
        name: '스타벅스 아메리카노 Tall',
        brand: '스타벅스',
        thumbnailUrl: null
      }
    }
  } catch (error) {
    console.error('상품 정보 로드 실패:', error)
    loadError.value = '상품 정보를 불러오는데 실패했습니다'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProductInfo()
})
</script>

<style scoped>
.review-write-page {
  min-height: 100vh;
  background: var(--bg-subtle);
  /* iOS 홈 인디케이터 회피 */
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-default);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--c-text-600);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 8px;
}

.back-button:hover {
  background: var(--border-default);
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.header-spacer {
  width: 40px;
}

.product-info {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-default);
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: var(--c-text-300);
}

.product-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.product-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.product-brand {
  font-size: 14px;
  color: var(--c-text-500);
  margin: 0;
}

.review-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.required {
  color: var(--c-danger);
  margin-left: 4px;
}

.optional {
  color: var(--c-text-400);
  font-weight: 500;
  font-size: 14px;
  margin-left: 4px;
}

.rating-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.star-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.star-button:hover {
  transform: scale(1.1);
}

.star-button.active,
.star-button.hover {
  transform: scale(1.15);
}

.rating-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-warning);
  margin-top: 8px;
}

.form-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s;
  background: var(--bg-elevated);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--c-success);
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.form-textarea.error {
  border-color: var(--c-danger);
}

.form-textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-textarea::placeholder {
  color: var(--c-text-400);
}

.textarea-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-count {
  font-size: 13px;
  color: var(--c-text-400);
  font-weight: 500;
}

.char-count.limit {
  color: var(--c-danger);
}

.error-message {
  font-size: 13px;
  color: var(--c-danger);
  font-weight: 500;
}

.form-help {
  font-size: 13px;
  color: var(--c-text-400);
  margin-top: 8px;
  margin-bottom: 0;
}

.image-upload-area {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.image-preview-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.image-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-strong);
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.upload-button {
  width: 100px;
  height: 100px;
  border: 2px dashed var(--c-text-300);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--c-text-400);
  font-size: 13px;
  font-weight: 600;
}

.upload-button:hover {
  border-color: var(--c-success);
  color: var(--c-success);
  background: rgba(5, 150, 105, 0.05);
}

.file-input {
  display: none;
}

.upload-limit {
  font-size: 11px;
  color: var(--c-text-300);
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  margin-top: 40px;
  position: sticky;
  bottom: 0;
  background: var(--bg-elevated);
  padding: 20px 0;
  border-top: 1px solid var(--border-default);
}

.btn-cancel {
  padding: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-500);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-cancel:hover {
  border-color: var(--c-text-300);
  background: var(--bg-subtle);
}

.btn-submit {
  padding: 16px;
  background: var(--c-success);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.btn-submit:disabled {
  background: var(--c-text-300);
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .review-form {
    padding: 20px;
  }

  .form-section {
    margin-bottom: 28px;
  }

  .star-button svg {
    width: 28px;
    height: 28px;
  }

  .form-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 16px 20px;
  }

  .page-title {
    font-size: 16px;
  }

  .product-info {
    padding: 20px;
  }

  .product-image {
    width: 64px;
    height: 64px;
  }

  .product-name {
    font-size: 15px;
  }

  .review-form {
    padding: 16px;
  }

  .star-button svg {
    width: 24px;
    height: 24px;
  }

  .rating-selector {
    gap: 4px;
  }
}

/* 모바일/터치: sticky hover 차단 */
@media (hover: none) {
  .star-button:hover { transform: none; }
  .btn-submit:hover:not(:disabled) { transform: none; }
}
</style>