<template>
  <div class="product-create-view">
    <!-- 인증 로딩 -->
    <AuthLoading v-if="authLoading" />

    <!-- 인증 에러 -->
    <AuthError v-if="errors.auth" :error="errors.auth" @login="handleLoginFromModal" />

    <!-- 메인 컨텐츠 -->
    <template v-if="isLoggedIn && !authLoading">
      <!-- 페이지 헤더 -->
      <PageHeader :user-nickname="userNickname" :user-role="user?.role" />

      <!-- 폼 컨테이너 -->
      <div class="form-container">
        <form @submit.prevent="handleSubmit" ref="productForm">
          <!-- 필수 안내 -->
          <RequiredNotice />

          <!-- 기본 정보 -->
          <BasicInfoSection
              v-model:form="form"
              :categories="categories"
              :errors="errors"
              :is-logged-in="isLoggedIn"
              @validate="validateField"
          />

          <!-- 상세 정보 -->
          <DetailInfoSection
              v-model:form="form"
              v-model:selected-features="selectedFeatures"
              v-model:selected-tags="selectedTags"
              v-model:custom-feature="customFeature"
              :is-logged-in="isLoggedIn"
              @add-custom-feature="addCustomFeature"
              @add-tag="addTag"
              @remove-tag="removeTag"
              ref="detailSectionRef"
          />

          <!-- 이미지 업로드 -->
          <ImageUploadSection
              v-model:thumbnail-file="thumbnailFile"
              v-model:additional-files="additionalFiles"
              :errors="errors"
              :is-logged-in="isLoggedIn"
              @remove-thumbnail="removeThumbnail"
              @remove-additional="removeAdditionalImage"
              ref="imageSectionRef"
          />

          <!-- 작성 완료율 -->
          <CompletionStatus
              :completion-percentage="completionPercentage"
              :form="form"
              :thumbnail-file="thumbnailFile"
          />

          <!-- 폼 액션 -->
          <FormActions
              :can-submit="canSubmit"
              :is-loading="isLoading"
              :is-logged-in="isLoggedIn"
              :is-form-valid="isFormValid"
              :completion-percentage="completionPercentage"
              @cancel="goBack"
          />
        </form>
      </div>
    </template>

    <!-- 로그인 모달 -->
    <LoginModal v-if="showLoginModal" @login="handleLoginFromModal" @close="closeLoginModal" />

    <!-- 로딩 오버레이 -->
    <LoadingOverlay v-if="isLoading" />

    <!-- 성공 모달 -->
    <SuccessModal
        v-if="showSuccessModal"
        @view-products="navigateToProducts"
        @go-home="navigateToHome"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProduct } from '@/composables/useProduct.js'
import { useCategory } from '@/services/CategoryService.js'
import { useFile } from '@/services/FileService.js'
import { useAuth } from '@/composables/useAuth.js'

// 컴포넌트 임포트
import AuthLoading from '@/components/product/create/AuthLoading.vue'
import AuthError from '@/components/product/create/AuthError.vue'
import PageHeader from '@/components/product/create/PageHeader.vue'
import RequiredNotice from '@/components/product/create/RequiredNotice.vue'
import BasicInfoSection from '@/components/product/create/BasicInfoSection.vue'
import DetailInfoSection from '@/components/product/create/DetailInfoSection.vue'
import ImageUploadSection from '@/components/product/create/ImageUploadSection.vue'
import CompletionStatus from '@/components/product/create/CompletionStatus.vue'
import FormActions from '@/components/product/create/FormActions.vue'
import LoginModal from '@/components/product/create/LoginModal.vue'
import LoadingOverlay from '@/components/product/create/LoadingOverlay.vue'
import SuccessModal from '@/components/product/create/SuccessModal.vue'

const router = useRouter()

// Composables
const { user, isLoggedIn, loading: authLoading, userId, userNickname, checkAuthStatus, logout } = useAuth()
const { createProduct, debugStatus } = useProduct()
const { getCategories } = useCategory()
const { uploadImage } = useFile()

// 상태
const isLoading = ref(false)
const showSuccessModal = ref(false)
const showLoginModal = ref(false)
const categories = ref([])
const thumbnailFile = ref(null)
const additionalFiles = ref([])
const selectedFeatures = ref([])
const selectedTags = ref([])
const customFeature = ref('')

// Refs
const productForm = ref(null)
const detailSectionRef = ref(null)
const imageSectionRef = ref(null)

// 폼 데이터
const form = reactive({
  name: '',
  brand: '',
  description: '',
  distributor: '',
  price: '',
  feature: '',
  tags: [],
  releaseDate: '',
  categoryId: null
})

// 에러
const errors = reactive({
  name: '',
  brand: '',
  categoryId: '',
  price: '',
  thumbnail: '',
  additionalImages: '',
  auth: ''
})

// Computed
const completionPercentage = computed(() => {
  let completed = 0
  const total = 5
  if (form.name.trim()) completed++
  if (form.brand.trim()) completed++
  if (form.categoryId) completed++
  if (form.price && form.price.trim()) completed++
  if (thumbnailFile.value) completed++
  return Math.round((completed / total) * 100)
})

const isFormValid = computed(() => {
  return isLoggedIn.value &&
      form.name.trim() &&
      form.brand.trim() &&
      form.categoryId &&
      form.price && form.price.trim() &&
      thumbnailFile.value !== null &&
      Object.values(errors).every(error => !error)
})

const canSubmit = computed(() => {
  return isFormValid.value && !isLoading.value && !authLoading.value
})

// 인증 관련
watch(isLoggedIn, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    handleLoggedOut()
  } else if (newValue && !oldValue) {
    handleLoggedIn()
  }
})

// 라이프사이클
onMounted(async () => {
  await checkAuthenticationStatus()
  if (isLoggedIn.value) {
    await initializeComponent()
  } else {
    showAuthRequiredMessage()
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
  if (thumbnailFile.value?.preview) URL.revokeObjectURL(thumbnailFile.value.preview)
  additionalFiles.value.forEach(fileObj => {
    if (fileObj.preview) URL.revokeObjectURL(fileObj.preview)
  })
})

// 메서드
const checkAuthenticationStatus = async () => {
  try {
    const isAuthenticated = await checkAuthStatus()
    if (!isAuthenticated) {
      errors.auth = '로그인이 필요한 서비스입니다'
      return false
    }
    errors.auth = ''
    return true
  } catch (error) {
    errors.auth = '인증 상태를 확인할 수 없습니다'
    return false
  }
}

const showAuthRequiredMessage = () => {
  showLoginModal.value = true
}

const handleLoggedOut = () => {
  if (hasFormData()) {
    saveDraft()
    alert('로그아웃되었습니다. 입력하신 내용은 임시저장되었습니다.')
  }
  router.push({
    name: 'Login',
    query: { reason: 'session_expired', redirect: router.currentRoute.value.fullPath }
  })
}

const handleLoggedIn = async () => {
  await initializeComponent()
  if (localStorage.getItem('productFormDraft')) {
    if (confirm('이전에 작성하던 내용이 있습니다. 복원하시겠습니까?')) {
      restoreDraft()
    }
  }
  showLoginModal.value = false
}

const handleLoginFromModal = () => {
  router.push({
    name: 'Login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}

const closeLoginModal = () => {
  showLoginModal.value = false
  router.push('/')
}

const initializeComponent = async () => {
  try {
    await loadCategories()
    restoreDraft()
    debugStatus()
    window.addEventListener('beforeunload', beforeUnloadHandler)
  } catch (error) {
    console.error('컴포넌트 초기화 실패:', error)
  }
}

const loadCategories = async () => {
  try {
    const response = await getCategories({ isActive: true })
    if (response.success && response.data && response.data.length > 0) {
      categories.value = response.data
      console.log('✅ 카테고리 로딩 성공:', categories.value.length, '개')
    } else {
      console.warn('⚠️ 카테고리 API 응답이 비어있습니다')
      alert('카테고리를 불러올 수 없습니다. 관리자에게 문의하세요.')
      categories.value = []
    }
  } catch (error) {
    console.error('❌ 카테고리 로딩 실패:', error)
    alert('카테고리를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.')
    categories.value = []
  }
}

const validateField = (fieldName) => {
  errors[fieldName] = ''
  switch (fieldName) {
    case 'name':
      if (!form.name.trim()) errors.name = '제품명은 필수입니다'
      else if (form.name.length < 2) errors.name = '제품명은 최소 2자 이상입니다'
      else if (form.name.length > 100) errors.name = '제품명은 최대 100자입니다'
      break
    case 'brand':
      if (!form.brand.trim()) errors.brand = '브랜드명은 필수입니다'
      else if (form.brand.length > 100) errors.brand = '브랜드명은 최대 100자입니다'
      break
    case 'categoryId':
      if (!form.categoryId) errors.categoryId = '카테고리를 선택해주세요'
      break
    case 'price':
      if (!form.price || form.price.trim() === '') {
        errors.price = '가격은 필수입니다'
      } else if (parseInt(form.price) <= 0) {
        errors.price = '가격은 0보다 커야 합니다'
      } else if (parseInt(form.price) > 9999999999) {
        errors.price = '가격이 너무 큽니다'
      }
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('brand')
  validateField('categoryId')
  validateField('price')

  if (!thumbnailFile.value) errors.thumbnail = '대표 이미지는 필수입니다'
  else errors.thumbnail = ''

  errors.additionalImages = ''

  return !Object.values(errors).some(error => error !== '')
}

const removeThumbnail = () => {
  if (thumbnailFile.value?.preview) URL.revokeObjectURL(thumbnailFile.value.preview)
  thumbnailFile.value = null
  errors.thumbnail = '대표 이미지는 필수입니다'
}

const removeAdditionalImage = (index) => {
  const fileObj = additionalFiles.value[index]
  if (fileObj.preview) URL.revokeObjectURL(fileObj.preview)
  additionalFiles.value.splice(index, 1)
}

const addCustomFeature = () => {
  const feature = customFeature.value.trim()
  if (!feature) return
  if (selectedFeatures.value.includes(feature)) {
    alert('이미 추가된 특징입니다')
    customFeature.value = ''
    return
  }
  selectedFeatures.value.push(feature)
  customFeature.value = ''
}

const addTag = (tag) => {
  if (!tag) return
  if (selectedTags.value.includes(tag)) {
    alert('이미 추가된 태그입니다')
    return
  }
  if (selectedTags.value.length >= 10) {
    alert('태그는 최대 10개까지입니다')
    return
  }
  selectedTags.value.push(tag)
}

const removeTag = (index) => {
  selectedTags.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (!isLoggedIn.value) {
    alert('로그인이 필요합니다')
    showAuthRequiredMessage()
    return
  }

  if (!userId.value) {
    alert('사용자 정보를 확인할 수 없습니다')
    await logout()
    return
  }

  if (!thumbnailFile.value) {
    alert('대표 이미지는 필수입니다')
    return
  }

  if (!validateForm()) {
    alert('입력 정보를 확인해주세요')
    return
  }

  isLoading.value = true

  try {
    const thumbnailUploadResult = await uploadImage(thumbnailFile.value.file, 'PRODUCT')
    if (!thumbnailUploadResult.success) {
      throw new Error(`대표 이미지 업로드 실패: ${thumbnailUploadResult.error}`)
    }

    const additionalUploadResults = []
    for (const fileObj of additionalFiles.value) {
      const uploadResult = await uploadImage(fileObj.file, 'PRODUCT')
      if (!uploadResult.success) {
        throw new Error(`추가 이미지 업로드 실패: ${uploadResult.error}`)
      }
      additionalUploadResults.push(uploadResult.data)
    }

    const thumbnailAttachmentInfo = {
      fileId: thumbnailUploadResult.data.id,
      storedPath: thumbnailUploadResult.data.fileUrl,
      originName: thumbnailUploadResult.data.orgFileNm,
      fileSize: thumbnailUploadResult.data.fileSize,
      contentType: thumbnailUploadResult.data.fileExt ? `image/${thumbnailUploadResult.data.fileExt}` : 'image/jpeg',
      fileExplain: '제품 대표 이미지'
    }

    const attachmentFileInfos = additionalUploadResults.map((uploadData, index) => ({
      fileId: uploadData.id,
      storedPath: uploadData.fileUrl,
      originName: uploadData.orgFileNm,
      fileSize: uploadData.fileSize,
      contentType: uploadData.fileExt ? `image/${uploadData.fileExt}` : 'image/jpeg',
      fileExplain: `제품 추가 이미지 ${index + 1}`,
      sortOrder: index + 1
    }))

    const allFeatures = [...selectedFeatures.value]
    if (customFeature.value.trim()) allFeatures.push(customFeature.value.trim())

    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim() || null,
      distributor: form.distributor.trim() || null,
      price: form.price || null,
      feature: allFeatures.length > 0 ? allFeatures.join(';') : null,
      tags: selectedTags.value,
      releaseDate: form.releaseDate || null,
      categoryId: form.categoryId,
      thumbnailAttachmentInfo,
      attachmentFileInfos
    }

    const response = await createProduct(productData)

    if (response.success) {
      localStorage.removeItem('productFormDraft')
      showSuccessModal.value = true
    } else {
      throw new Error(response.error || '제품 등록에 실패했습니다')
    }
  } catch (error) {
    console.error('제품 등록 실패:', error)
    if (error.message.includes('인증') || error.message.includes('권한')) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요')
      await logout()
    } else {
      alert(error.message || '제품 등록 중 오류가 발생했습니다')
    }
  } finally {
    isLoading.value = false
  }
}

const saveDraft = () => {
  if (!isLoggedIn.value) return
  const draftData = {
    timestamp: new Date().toISOString(),
    userId: userId.value,
    userNickname: userNickname.value,
    form: { ...form },
    selectedFeatures: [...selectedFeatures.value],
    selectedTags: [...selectedTags.value],
    customFeature: customFeature.value
  }
  localStorage.setItem('productFormDraft', JSON.stringify(draftData))
}

const restoreDraft = () => {
  if (!isLoggedIn.value) return
  const savedDraft = localStorage.getItem('productFormDraft')
  if (savedDraft) {
    try {
      const draftData = JSON.parse(savedDraft)
      if (draftData.userId && draftData.userId !== userId.value) {
        if (confirm('다른 계정의 임시저장 데이터입니다. 삭제하시겠습니까?')) {
          localStorage.removeItem('productFormDraft')
        }
        return
      }
      Object.assign(form, draftData.form || {})
      if (draftData.selectedFeatures) selectedFeatures.value = draftData.selectedFeatures
      if (draftData.selectedTags) selectedTags.value = draftData.selectedTags
      if (draftData.customFeature) customFeature.value = draftData.customFeature
    } catch (error) {
      localStorage.removeItem('productFormDraft')
    }
  }
}

const goBack = () => {
  if (hasFormData()) {
    if (confirm('작성을 취소하시겠습니까?\n입력된 내용은 임시저장됩니다.')) {
      saveDraft()
      router.push('/')
    }
  } else {
    router.push('/')
  }
}

const hasFormData = () => {
  return form.name.trim() || form.description.trim() || thumbnailFile.value !== null || additionalFiles.value.length > 0 || selectedTags.value.length > 0
}

const navigateToProducts = () => {
  showSuccessModal.value = false
  router.push('/products')
}

const navigateToHome = () => {
  showSuccessModal.value = false
  router.push('/')
}

const beforeUnloadHandler = (event) => {
  if (isLoggedIn.value && hasFormData()) {
    event.preventDefault()
    event.returnValue = '입력된 내용이 있습니다. 페이지를 벗어나시겠습니까?'
  }
}
</script>

<style scoped>
.product-create-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #FAFAFA;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.form-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #F3F4F6;
}

@media (max-width: 768px) {
  .product-create-view {
    padding: 16px;
  }

  .form-container {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .product-create-view {
    padding: 12px;
  }

  .form-container {
    padding: 20px;
  }
}
</style>