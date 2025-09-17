<template>
  <div class="product-create-container">
    <!-- 상단 네비게이션 -->
    <nav class="top-nav">
      <div class="nav-left">
        <div class="logo">🛒 TradeLink</div>
        <div class="breadcrumb">
          <router-link to="/">홈</router-link> >
          <router-link to="/sell">판매하기</router-link> >
          새 제품 등록
        </div>
      </div>
      <div class="nav-right">
        <button
            type="button"
            class="save-draft-btn"
            @click="saveDraft"
            :disabled="isLoading"
        >
          💾 임시저장
        </button>
      </div>
    </nav>

    <!-- 진행 상태 섹션 -->
    <div class="progress-section">
      <div class="progress-header">
        <div class="step-info">STEP 2 / 3</div>
      </div>
      <h1 class="progress-title">새 제품을 등록해 주세요</h1>
      <p class="progress-subtitle">
        등록하신 제품은 관리자 승인 후 다른 사용자들도 이용할 수 있어요
      </p>
      <div class="approval-notice">
        ⏱️ 보통 2-3시간 내 승인됩니다
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    </div>

    <!-- 폼 컨테이너 -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit" ref="productForm">

        <!-- 기본 정보 섹션 -->
        <div class="form-section">
          <h3 class="section-title">📝 기본 정보</h3>

          <div class="form-grid">
            <!-- 제품명 -->
            <div class="form-group full-width">
              <label class="form-label">
                제품명 <span class="required">*</span>
              </label>
              <input
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  placeholder="정확한 제품명을 입력해주세요"
                  maxlength="100"
                  required
                  :class="{ 'error': errors.name }"
                  @blur="validateField('name')"
              >
              <div class="char-counter">{{ form.name.length }}/100</div>
              <div class="form-help">
                브랜드명과 제품명을 정확히 입력해주세요. (예: 스타벅스 콜드브루 커피)
              </div>
              <div v-if="errors.name" class="validation-message">
                {{ errors.name }}
              </div>
            </div>

            <!-- 브랜드 -->
            <div class="form-group">
              <label class="form-label">
                브랜드/제조사 <span class="required">*</span>
              </label>
              <input
                  v-model="form.brand"
                  type="text"
                  class="form-input"
                  placeholder="예: 스타벅스, CU, 맥도날드"
                  maxlength="100"
                  required
                  :class="{ 'error': errors.brand }"
                  @blur="validateField('brand')"
              >
              <div v-if="errors.brand" class="validation-message">
                {{ errors.brand }}
              </div>
            </div>

            <!-- 카테고리 -->
            <div class="form-group">
              <label class="form-label">
                카테고리 <span class="required">*</span>
              </label>
              <select
                  v-model="form.categoryId"
                  class="form-input"
                  required
                  :class="{ 'error': errors.categoryId }"
                  @change="validateField('categoryId')"
              >
                <option value="">카테고리를 선택하세요</option>
                <option
                    v-for="category in categories"
                    :key="category.categoryId"
                    :value="category.categoryId"
                >
                  {{ category.categoryName }}
                </option>
              </select>
              <div v-if="errors.categoryId" class="validation-message">
                {{ errors.categoryId }}
              </div>
            </div>

            <!-- 제품 유형 -->
            <div class="form-group">
              <label class="form-label">
                제품 유형 <span class="required">*</span>
              </label>
              <select
                  v-model="form.productType"
                  class="form-input"
                  required
                  :class="{ 'error': errors.productType }"
                  @change="validateField('productType')"
              >
                <option value="">제품 유형을 선택하세요</option>
                <option value="SALE">판매용 (일반 구매 가능)</option>
                <option value="RENTAL">대여용 (임대/대여)</option>
                <option value="INFO">정보제공용 (리뷰/정보만)</option>
              </select>
              <div v-if="errors.productType" class="validation-message">
                {{ errors.productType }}
              </div>
            </div>

            <!-- 정가 -->
            <div class="form-group">
              <label class="form-label">정가 (원)</label>
              <div class="price-input-container">
                <input
                    v-model.number="form.price"
                    type="number"
                    class="form-input"
                    placeholder="0"
                    min="0"
                    max="999999999"
                >
                <span class="price-unit">원</span>
              </div>
              <div class="form-help">
                브랜드 공식 판매가격을 입력해주세요. (선택사항)
              </div>
            </div>

            <!-- 출시일 -->
            <div class="form-group">
              <label class="form-label">출시일</label>
              <input
                  v-model="form.releaseDate"
                  type="date"
                  class="form-input"
                  :max="today"
              >
              <div class="form-help">
                브랜드 공식 출시일을 입력해주세요. (선택사항)
              </div>
            </div>
          </div>
        </div>

        <!-- 상세 정보 섹션 -->
        <div class="form-section">
          <h3 class="section-title">📋 상세 정보</h3>

          <!-- 제품 설명 -->
          <div class="form-group">
            <label class="form-label">제품 설명</label>
            <textarea
                v-model="form.description"
                class="form-input form-textarea"
                placeholder="제품 특징, 맛, 용량, 성분 등을 자세히 설명해주세요"
                maxlength="1000"
            ></textarea>
            <div class="char-counter">{{ form.description.length }}/1000</div>
            <div class="form-help">
              구매자가 제품을 잘 이해할 수 있도록 상세히 작성해주세요.
            </div>
          </div>

          <!-- 판매처 -->
          <div class="form-group">
            <label class="form-label">판매처/유통업체</label>
            <input
                v-model="form.distributor"
                type="text"
                class="form-input"
                placeholder="예: 편의점, 대형마트, 온라인몰, 브랜드 매장"
                maxlength="1000"
            >
            <div class="form-help">
              어디서 구매할 수 있는지 입력해주세요. (선택사항)
            </div>
          </div>

          <!-- 주요 특징 -->
          <div class="form-group">
            <label class="form-label">주요 특징</label>
            <div class="checkbox-group">
              <label
                  v-for="feature in predefinedFeatures"
                  :key="feature"
                  class="checkbox-item"
                  :class="{ 'active': selectedFeatures.includes(feature) }"
              >
                <input
                    type="checkbox"
                    :value="feature"
                    v-model="selectedFeatures"
                >
                {{ feature }}
              </label>
            </div>
            <input
                v-model="customFeature"
                type="text"
                placeholder="기타 특징을 직접 입력하세요"
                class="form-input custom-feature-input"
                @keypress.enter="addCustomFeature"
            >
            <div class="form-help">
              제품의 주요 특징을 선택하거나 직접 입력해주세요.
            </div>
          </div>

          <!-- 태그 -->
          <div class="form-group">
            <label class="form-label">태그</label>
            <div class="tag-input-container" @click="focusTagInput">
              <div
                  v-for="(tag, index) in selectedTags"
                  :key="index"
                  class="tag-item"
              >
                {{ tag }}
                <span class="tag-remove" @click="removeTag(index)">×</span>
              </div>
              <input
                  ref="tagInput"
                  v-model="currentTag"
                  type="text"
                  class="tag-input"
                  placeholder="태그를 입력하고 Enter를 눌러주세요"
                  @keypress.enter="addTag"
                  @keydown.backspace="handleBackspace"
              >
            </div>
            <div class="form-help">
              검색에 도움이 되는 키워드를 입력해주세요. (예: 달콤한, 쌉싸름한, 부드러운)
            </div>
          </div>
        </div>

        <!-- 이미지 업로드 섹션 -->
        <div class="form-section">
          <h3 class="section-title">📷 제품 이미지</h3>

          <div class="form-group">
            <label class="form-label">
              제품 이미지 <span class="required">*</span>
            </label>

            <!-- 파일 업로드 영역 -->
            <div
                class="image-upload-area"
                :class="{ 'dragover': isDragOver }"
                @click="triggerFileInput"
                @drop="handleFileDrop"
                @dragover.prevent="handleDragOver"
                @dragleave="handleDragLeave"
            >
              <div class="upload-icon">📷</div>
              <div class="upload-text">
                브랜드 공식 이미지나 제품 패키지 사진을 올려주세요
              </div>
              <div class="upload-hint">
                PNG, JPG, JPEG 파일만 가능 • 파일당 최대 5MB • 최대 5개
              </div>
              <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  style="display: none"
                  @change="handleFileSelect"
              >
            </div>

            <!-- 이미지 미리보기 -->
            <div v-if="uploadedFiles.length > 0" class="image-preview">
              <div
                  v-for="(file, index) in uploadedFiles"
                  :key="index"
                  class="preview-item"
              >
                <img
                    :src="file.preview"
                    :alt="file.name"
                    class="preview-image"
                >
                <button
                    type="button"
                    class="preview-remove"
                    @click="removeImage(index)"
                >
                  ×
                </button>
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
              </div>
            </div>

            <div v-if="errors.images" class="validation-message">
              {{ errors.images }}
            </div>
          </div>
        </div>

        <!-- 약관 동의 -->
        <div class="form-section">
          <div class="form-group">
            <label class="checkbox-item agreement-checkbox">
              <input
                  v-model="form.agreeTerms"
                  type="checkbox"
                  required
                  :class="{ 'error': errors.agreeTerms }"
              >
              <span>
                저작권 관련 주의사항을 확인했으며, 허위 정보 등록 시 계정 제재될 수 있음을 동의합니다.
                <span class="required">*</span>
              </span>
            </label>
            <div v-if="errors.agreeTerms" class="validation-message">
              {{ errors.agreeTerms }}
            </div>
          </div>
        </div>

        <!-- 폼 액션 버튼 -->
        <div class="form-actions">
          <button
              type="button"
              class="btn btn-secondary"
              @click="goBack"
              :disabled="isLoading"
          >
            이전 단계
          </button>
          <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading">등록 중...</span>
            <span v-else>다음 단계: 거래 정보 입력</span>
          </button>
        </div>
      </form>
    </div>

    <!-- 로딩 오버레이 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <div>제품을 등록하고 있습니다...</div>
    </div>

    <!-- 성공 모달 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="modal-icon">✅</div>
        <h3>제품 등록 완료!</h3>
        <p>새 제품이 성공적으로 등록되었습니다.<br>관리자 승인 후 다른 사용자들도 이용할 수 있습니다.</p>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="navigateToNextStep">
            거래 정보 입력하기
          </button>
          <button class="btn btn-secondary" @click="navigateToHome">
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProduct } from '@/services/ProductService.js'

// Vue Router
const router = useRouter()

// Composables
const {
  createProduct,
  getCategories,
  uploadImage,
  debugStatus
} = useProduct()

// 반응형 상태
const isLoading = ref(false)
const isDragOver = ref(false)
const showSuccessModal = ref(false)
const categories = ref([])
const uploadedFiles = ref([])
const selectedFeatures = ref([])
const selectedTags = ref([])
const currentTag = ref('')
const customFeature = ref('')

// 폼 레퍼런스
const productForm = ref(null)
const fileInput = ref(null)
const tagInput = ref(null)

// 폼 데이터
const form = reactive({
  name: '',
  brand: '',
  categoryId: '',
  productType: '',
  description: '',
  distributor: '',
  price: null,
  releaseDate: '',
  agreeTerms: false
})

// 에러 상태
const errors = reactive({
  name: '',
  brand: '',
  categoryId: '',
  productType: '',
  images: '',
  agreeTerms: ''
})

// 미리 정의된 특징 옵션
const predefinedFeatures = [
  '신제품', '한정판매', '시즌상품', '베스트셀러',
  '프리미엄', '할인상품', '인기상품', '추천상품'
]

// 계산된 속성들
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return form.name.trim() &&
      form.brand.trim() &&
      form.categoryId &&
      form.productType &&
      uploadedFiles.value.length > 0 &&
      form.agreeTerms &&
      Object.values(errors).every(error => !error)
})

// 생명주기
onMounted(async () => {
  await loadCategories()
  restoreDraft()
  debugStatus()
  window.addEventListener('beforeunload', beforeUnloadHandler)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)

  // 메모리 정리
  uploadedFiles.value.forEach(fileObj => {
    if (fileObj.preview) {
      URL.revokeObjectURL(fileObj.preview)
    }
  })
})

// 메서드들
const loadCategories = async () => {
  try {
    const response = await getCategories()
    if (response.success) {
      categories.value = response.data
    } else {
      console.warn('[PRODUCT] 카테고리 로드 실패:', response.error)
      // 샘플 데이터 사용
      categories.value = [
        { categoryId: 1, categoryName: '음료' },
        { categoryId: 2, categoryName: '스낵/과자' },
        { categoryId: 3, categoryName: '베이커리' },
        { categoryId: 4, categoryName: '도시락/식사' },
        { categoryId: 5, categoryName: '디저트' },
        { categoryId: 6, categoryName: '기타' }
      ]
    }
  } catch (error) {
    console.error('[PRODUCT] 카테고리 로드 에러:', error)
  }
}

const validateField = (fieldName) => {
  errors[fieldName] = ''

  switch (fieldName) {
    case 'name':
      if (!form.name.trim()) {
        errors.name = '제품명을 입력해주세요.'
      } else if (form.name.length > 100) {
        errors.name = '제품명은 100자 이하여야 합니다.'
      }
      break

    case 'brand':
      if (!form.brand.trim()) {
        errors.brand = '브랜드명을 입력해주세요.'
      } else if (form.brand.length > 100) {
        errors.brand = '브랜드명은 100자 이하여야 합니다.'
      }
      break

    case 'categoryId':
      if (!form.categoryId) {
        errors.categoryId = '카테고리를 선택해주세요.'
      }
      break

    case 'productType':
      if (!form.productType) {
        errors.productType = '제품 유형을 선택해주세요.'
      }
      break
  }
}

const validateForm = () => {
  // 모든 필수 필드 검증
  validateField('name')
  validateField('brand')
  validateField('categoryId')
  validateField('productType')

  // 이미지 검증
  if (uploadedFiles.value.length === 0) {
    errors.images = '최소 1개의 이미지를 업로드해주세요.'
  } else {
    errors.images = ''
  }

  // 약관 동의 검증
  if (!form.agreeTerms) {
    errors.agreeTerms = '약관에 동의해주세요.'
  } else {
    errors.agreeTerms = ''
  }

  return Object.values(errors).every(error => !error)
}

// 파일 처리
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  processFiles(files)
  event.target.value = '' // 파일 입력 초기화
}

const handleFileDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = Array.from(event.dataTransfer.files)
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  processFiles(imageFiles)
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const processFiles = (files) => {
  files.forEach(file => {
    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name}: 파일 크기는 5MB 이하만 업로드 가능합니다.`)
      return
    }

    // 파일 형식 체크
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert(`${file.name}: PNG, JPG, JPEG 파일만 업로드 가능합니다.`)
      return
    }

    // 최대 파일 수 체크
    if (uploadedFiles.value.length >= 5) {
      alert('최대 5개의 이미지만 업로드할 수 있습니다.')
      return
    }

    // 파일 객체 생성
    const fileObj = {
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file)
    }

    uploadedFiles.value.push(fileObj)
  })

  // 에러 상태 업데이트
  if (uploadedFiles.value.length > 0) {
    errors.images = ''
  }
}

const removeImage = (index) => {
  const fileObj = uploadedFiles.value[index]
  if (fileObj.preview) {
    URL.revokeObjectURL(fileObj.preview)
  }
  uploadedFiles.value.splice(index, 1)

  if (uploadedFiles.value.length === 0) {
    errors.images = '최소 1개의 이미지를 업로드해주세요.'
  }
}

const formatFileSize = (size) => {
  if (size === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 태그 처리
const focusTagInput = () => {
  nextTick(() => {
    tagInput.value?.focus()
  })
}

const addTag = () => {
  const tag = currentTag.value.trim()
  if (tag && !selectedTags.value.includes(tag) && selectedTags.value.length < 10) {
    selectedTags.value.push(tag)
    currentTag.value = ''
  }
}

const removeTag = (index) => {
  selectedTags.value.splice(index, 1)
}

const handleBackspace = () => {
  if (!currentTag.value && selectedTags.value.length > 0) {
    selectedTags.value.pop()
  }
}

// 특징 처리
const addCustomFeature = () => {
  const feature = customFeature.value.trim()
  if (feature && !selectedFeatures.value.includes(feature)) {
    selectedFeatures.value.push(feature)
    customFeature.value = ''
  }
}

// 폼 제출
const handleSubmit = async () => {
  if (!validateForm()) {
    alert('필수 항목을 모두 입력해주세요.')
    return
  }

  isLoading.value = true

  try {
    // 특징 데이터 준비
    const allFeatures = [...selectedFeatures.value]
    if (customFeature.value.trim()) {
      allFeatures.push(customFeature.value.trim())
    }

    // 제품 등록 데이터
    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      categoryId: form.categoryId,
      productType: form.productType,
      description: form.description.trim(),
      distributor: form.distributor.trim(),
      price: form.price ? form.price.toString() : '0',
      releaseDate: form.releaseDate,
      feature: allFeatures.join(';'),
      tags: selectedTags.value,
      attachmentFiles: uploadedFiles.value.map(fileObj => fileObj.file)
    }

    // 제품 등록 API 호출
    const response = await createProduct(productData)

    if (response.success) {
      // 임시저장 데이터 삭제
      localStorage.removeItem('productFormDraft')

      // 성공 모달 표시
      showSuccessModal.value = true

      // 진행률 업데이트
      updateProgress(100)
    } else {
      throw new Error(response.error || '제품 등록에 실패했습니다.')
    }

  } catch (error) {
    console.error('[PRODUCT] 제품 등록 실패:', error)
    alert(error.message || '제품 등록 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 임시저장
const saveDraft = () => {
  const draftData = {
    timestamp: new Date().toISOString(),
    form: { ...form },
    selectedFeatures: [...selectedFeatures.value],
    selectedTags: [...selectedTags.value],
    customFeature: customFeature.value
  }

  localStorage.setItem('productFormDraft', JSON.stringify(draftData))
  alert('현재 입력 내용이 임시저장되었습니다.')
}

// 임시저장 데이터 복원
const restoreDraft = () => {
  const savedDraft = localStorage.getItem('productFormDraft')
  if (savedDraft) {
    try {
      const draftData = JSON.parse(savedDraft)

      // 폼 데이터 복원
      Object.assign(form, draftData.form || {})

      // 배열 데이터 복원
      if (draftData.selectedFeatures) {
        selectedFeatures.value = draftData.selectedFeatures
      }
      if (draftData.selectedTags) {
        selectedTags.value = draftData.selectedTags
      }
      if (draftData.customFeature) {
        customFeature.value = draftData.customFeature
      }

      console.log('[PRODUCT] 임시저장 데이터가 복원되었습니다.')
    } catch (error) {
      console.warn('[PRODUCT] 임시저장 데이터 복원 실패:', error)
    }
  }
}

// 네비게이션
const goBack = () => {
  if (hasFormData()) {
    if (confirm('이전 단계로 돌아가시겠습니까?\n입력된 내용은 임시저장됩니다.')) {
      saveDraft()
      router.push('/sell')
    }
  } else {
    router.push('/sell')
  }
}

const hasFormData = () => {
  return form.name.trim() ||
      form.description.trim() ||
      uploadedFiles.value.length > 0 ||
      selectedTags.value.length > 0
}

const navigateToNextStep = () => {
  showSuccessModal.value = false
  // 실제로는 제품 ID와 함께 다음 단계로 이동
  router.push('/sell/step3')
}

const navigateToHome = () => {
  showSuccessModal.value = false
  router.push('/')
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

// 진행률 업데이트
const updateProgress = (percentage) => {
  const progressFill = document.querySelector('.progress-fill')
  if (progressFill) {
    progressFill.style.width = `${percentage}%`
  }
}

// 페이지 떠날 때 확인
const beforeUnloadHandler = (event) => {
  if (hasFormData()) {
    event.preventDefault()
    event.returnValue = '입력된 내용이 있습니다. 페이지를 벗어나시겠습니까?'
  }
}
</script>