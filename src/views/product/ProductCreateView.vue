<template>
  <div class="product-create-view">
    <!-- 인증 로딩 -->
    <AuthLoading v-if="authLoading" />

    <!-- 인증 에러 -->
    <AuthError v-if="errors.auth" :error="errors.auth" @login="handleLoginFromModal" />

    <!-- 메인 컨텐츠 -->
    <template v-if="isLoggedIn && !authLoading">
      <!-- 헤더 -->
      <header class="page-header">
        <div class="header-inner">
          <button class="back-btn" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12.5 15L7.5 10L12.5 5"/>
            </svg>
          </button>
          <div class="header-title">
            <h1>새 제품 등록</h1>
            <p class="header-subtitle">제품 정보를 입력하여 등록해주세요</p>
          </div>
          <div class="header-user">
            <span class="user-badge">{{ user?.role === 'ADMIN' ? '관리자' : '판매자' }}</span>
            <span class="user-name">{{ userNickname }}</span>
          </div>
        </div>
      </header>

      <!-- 컨텐츠 레이아웃 -->
      <main class="main-content">
        <form @submit.prevent="handleSubmit" ref="productForm">
          <div class="content-layout">
            <!-- 왼쪽: 폼 영역 -->
            <div class="form-area">
              <!-- 기본 정보 -->
              <section class="form-section">
                <div class="section-header">
                  <h2>기본 정보</h2>
                  <span class="required-badge">필수</span>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">
                      제품명
                      <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        v-model="form.name"
                        class="form-input"
                        :class="{ 'has-error': errors.name }"
                        placeholder="제품명을 입력하세요"
                        @blur="validateField('name')"
                    />
                    <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      브랜드
                      <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        v-model="form.brand"
                        class="form-input"
                        :class="{ 'has-error': errors.brand }"
                        placeholder="브랜드명을 입력하세요"
                        @blur="validateField('brand')"
                    />
                    <span v-if="errors.brand" class="error-text">{{ errors.brand }}</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      카테고리
                      <span class="required">*</span>
                    </label>
                    <div class="category-dropdown" ref="categoryDropdownRef">
                      <button class="category-select-btn" @click.stop="toggleCategoryDropdown" :disabled="categoriesLoading" type="button">
                        <div v-if="form.subCategoryId" class="selected-category">
                          <span class="category-text">{{ getSubCategoryLabel(form.subCategoryId) }}</span>
                        </div>
                        <span v-else-if="categoriesLoading" class="placeholder">카테고리 로딩 중...</span>
                        <span v-else class="placeholder">카테고리를 선택하세요</span>
                        <svg class="dropdown-icon" :class="{ open: showCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>

                      <!-- 오버레이 -->
                      <Transition name="overlay-fade">
                        <div v-if="showCategoryDropdown && !categoriesLoading" class="category-dropdown-overlay" @click="closeCategoryDropdown"></div>
                      </Transition>

                      <Transition :name="dropdownDirection === 'up' ? 'dropdown-up' : 'dropdown'">
                        <div v-if="showCategoryDropdown && !categoriesLoading" class="category-dropdown-menu" :class="{ 'dropdown-up': dropdownDirection === 'up' }">
                          <div class="dropdown-header">
                            <span class="dropdown-title">카테고리 선택</span>
                            <button class="btn-close-dropdown" @click.stop="closeCategoryDropdown" type="button">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                          <div class="dropdown-content">
                            <div v-for="parent in categories" :key="parent.categoryId" class="category-group">
                              <div class="category-group-header">
                                <span class="parent-name">{{ parent.categoryName }}</span>
                              </div>
                              <div v-if="parent.subCategories?.length" class="sub-categories">
                                <button v-for="sub in parent.subCategories" :key="sub.categoryId" class="sub-category-item" :class="{ active: form.subCategoryId === sub.categoryId }" @click.stop="selectSubCategory(sub.categoryId)" type="button">
                                  <span class="sub-name">{{ sub.categoryName }}</span>
                                  <svg v-if="form.subCategoryId === sub.categoryId" class="check-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Transition>
                    </div>
                    <span v-if="errors.subCategoryId" class="error-text">{{ errors.subCategoryId }}</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      가격
                      <span class="required">*</span>
                    </label>
                    <div class="input-with-suffix">
                      <input
                          type="text"
                          v-model="form.price"
                          class="form-input"
                          :class="{ 'has-error': errors.price }"
                          placeholder="0"
                          @blur="validateField('price')"
                      />
                      <span class="input-suffix">원</span>
                    </div>
                    <span v-if="errors.price" class="error-text">{{ errors.price }}</span>
                  </div>
                </div>
              </section>

              <!-- 상세 정보 -->
              <section class="form-section">
                <div class="section-header">
                  <h2>상세 정보</h2>
                  <span class="optional-badge">선택</span>
                </div>

                <div class="form-stack">
                  <div class="form-group">
                    <label class="form-label">제품 설명</label>
                    <textarea
                        v-model="form.description"
                        class="form-textarea"
                        placeholder="제품에 대한 상세 설명을 입력하세요"
                        rows="4"
                    ></textarea>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">판매처</label>
                      <input
                          type="text"
                          v-model="form.distributor"
                          class="form-input"
                          placeholder="판매처를 입력하세요"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">출시일</label>
                      <input
                          type="date"
                          v-model="form.releaseDate"
                          class="form-input"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">특징</label>
                    <div class="feature-input-row">
                      <input
                          type="text"
                          v-model="customFeature"
                          class="form-input"
                          placeholder="특징을 입력하고 추가하세요"
                          @keyup.enter="addCustomFeature"
                      />
                      <button type="button" class="add-btn" @click="addCustomFeature">추가</button>
                    </div>
                    <div v-if="selectedFeatures.length > 0" class="chip-list">
                      <span v-for="(feature, idx) in selectedFeatures" :key="idx" class="chip">
                        {{ feature }}
                        <button type="button" class="chip-remove" @click="selectedFeatures.splice(idx, 1)">×</button>
                      </span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">태그</label>
                    <div class="tag-input-row">
                      <input
                          type="text"
                          v-model="tagInput"
                          class="form-input"
                          placeholder="태그를 입력하고 추가하세요 (최대 10개)"
                          @keyup.enter="addTag(tagInput); tagInput = ''"
                      />
                      <button type="button" class="add-btn" @click="addTag(tagInput); tagInput = ''">추가</button>
                    </div>
                    <div v-if="selectedTags.length > 0" class="chip-list">
                      <span v-for="(tag, idx) in selectedTags" :key="idx" class="chip tag-chip">
                        #{{ tag }}
                        <button type="button" class="chip-remove" @click="removeTag(idx)">×</button>
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 이미지 업로드 -->
              <section class="form-section">
                <div class="section-header">
                  <h2>제품 이미지</h2>
                  <span class="required-badge">필수</span>
                </div>

                <div class="image-upload-area">
                  <!-- 대표 이미지 -->
                  <div class="upload-block">
                    <label class="upload-label">
                      대표 이미지
                      <span class="required">*</span>
                    </label>
                    <div
                        class="upload-zone thumbnail-zone"
                        :class="{ 'has-file': thumbnailFile, 'has-error': errors.thumbnail }"
                        @click="$refs.thumbnailInput.click()"
                        @dragover.prevent
                        @drop.prevent="handleThumbnailDrop"
                    >
                      <template v-if="thumbnailFile">
                        <img :src="thumbnailFile.preview" class="preview-image" />
                        <button type="button" class="remove-btn" @click.stop="removeThumbnail">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </template>
                      <template v-else>
                        <div class="upload-placeholder">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span>클릭 또는 드래그하여 업로드</span>
                          <span class="upload-hint">권장: 1:1 비율, 최대 10MB</span>
                        </div>
                      </template>
                    </div>
                    <input
                        ref="thumbnailInput"
                        type="file"
                        accept="image/*"
                        hidden
                        @change="handleThumbnailChange"
                    />
                    <span v-if="errors.thumbnail" class="error-text">{{ errors.thumbnail }}</span>
                  </div>

                  <!-- 추가 이미지 -->
                  <div class="upload-block">
                    <label class="upload-label">추가 이미지 (최대 5장)</label>
                    <div class="additional-images">
                      <div
                          v-for="(file, idx) in additionalFiles"
                          :key="idx"
                          class="additional-item"
                      >
                        <img :src="file.preview" class="preview-image" />
                        <button type="button" class="remove-btn" @click="removeAdditionalImage(idx)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      <div
                          v-if="additionalFiles.length < 5"
                          class="additional-add"
                          @click="$refs.additionalInput.click()"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </div>
                    </div>
                    <input
                        ref="additionalInput"
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        @change="handleAdditionalChange"
                    />
                  </div>
                </div>
              </section>
            </div>

            <!-- 오른쪽: 사이드바 -->
            <aside class="sidebar">
              <div class="sidebar-sticky">
                <!-- 완료율 카드 -->
                <div class="completion-card">
                  <div class="completion-header">
                    <span class="completion-label">작성 완료율</span>
                    <span class="completion-value">{{ completionPercentage }}%</span>
                  </div>
                  <div class="completion-bar">
                    <div class="completion-fill" :style="{ width: completionPercentage + '%' }"></div>
                  </div>
                  <ul class="completion-checklist">
                    <li :class="{ done: form.name.trim() }">
                      <span class="check-icon">{{ form.name.trim() ? '✓' : '○' }}</span>
                      제품명
                    </li>
                    <li :class="{ done: form.brand.trim() }">
                      <span class="check-icon">{{ form.brand.trim() ? '✓' : '○' }}</span>
                      브랜드
                    </li>
                    <li :class="{ done: form.subCategoryId }">
                      <span class="check-icon">{{ form.subCategoryId ? '✓' : '○' }}</span>
                      카테고리
                    </li>
                    <li :class="{ done: form.price && form.price.trim() }">
                      <span class="check-icon">{{ form.price && form.price.trim() ? '✓' : '○' }}</span>
                      가격
                    </li>
                    <li :class="{ done: thumbnailFile }">
                      <span class="check-icon">{{ thumbnailFile ? '✓' : '○' }}</span>
                      대표 이미지
                    </li>
                  </ul>
                </div>

                <!-- 액션 버튼 -->
                <div class="action-buttons">
                  <button type="button" class="btn-secondary" @click="goBack">
                    취소
                  </button>
                  <button
                      type="submit"
                      class="btn-primary"
                      :disabled="!canSubmit"
                  >
                    <template v-if="isLoading">
                      <span class="loading-spinner"></span>
                      등록 중...
                    </template>
                    <template v-else>
                      제품 등록
                    </template>
                  </button>
                </div>

                <!-- 임시저장 안내 -->
                <p class="save-notice">
                  작성 중 페이지를 벗어나면 내용이 임시저장됩니다
                </p>
              </div>
            </aside>
          </div>
        </form>
      </main>
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
import { useAuth } from '@/composables/useAuth.js'

import AuthLoading from '@/components/product/create/AuthLoading.vue'
import AuthError from '@/components/product/create/AuthError.vue'
import LoginModal from '@/components/product/create/LoginModal.vue'
import LoadingOverlay from '@/components/product/create/LoadingOverlay.vue'
import SuccessModal from '@/components/product/create/SuccessModal.vue'

const router = useRouter()
const { user, isLoggedIn, loading: authLoading, userId, userNickname, checkAuthStatus, logout } = useAuth()
const { createProduct, debugStatus, uploadReviewImage } = useProduct()
const { getCategories } = useCategory()

// State
const isLoading = ref(false)
const showSuccessModal = ref(false)
const showLoginModal = ref(false)
const categories = ref([])
const categoriesLoading = ref(false)
const showCategoryDropdown = ref(false)
const dropdownDirection = ref('down')
const categoryDropdownRef = ref(null)
const thumbnailFile = ref(null)
const additionalFiles = ref([])
const selectedFeatures = ref([])
const selectedTags = ref([])
const customFeature = ref('')
const tagInput = ref('')

// Refs
const productForm = ref(null)
const thumbnailInput = ref(null)
const additionalInput = ref(null)

// Form
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

// Errors
const errors = reactive({
  name: '',
  brand: '',
  subCategoryId: '',
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
  if (form.subCategoryId) completed++
  if (form.price && form.price.trim()) completed++
  if (thumbnailFile.value) completed++
  return Math.round((completed / total) * 100)
})

const isFormValid = computed(() => {
  return isLoggedIn.value &&
      form.name.trim() &&
      form.brand.trim() &&
      form.subCategoryId &&
      form.price && form.price.trim() &&
      thumbnailFile.value !== null &&
      Object.values(errors).every(error => !error)
})

const canSubmit = computed(() => {
  return isFormValid.value && !isLoading.value && !authLoading.value
})

// Watch
watch(isLoggedIn, (newValue, oldValue) => {
  if (!newValue && oldValue) handleLoggedOut()
  else if (newValue && !oldValue) handleLoggedIn()
})

// Lifecycle
onMounted(async () => {
  await checkAuthenticationStatus()
  if (isLoggedIn.value) await initializeComponent()
  else showAuthRequiredMessage()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
  document.removeEventListener('click', handleClickOutside)
  if (thumbnailFile.value?.preview) URL.revokeObjectURL(thumbnailFile.value.preview)
  additionalFiles.value.forEach(f => f.preview && URL.revokeObjectURL(f.preview))
})

// Methods
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

const showAuthRequiredMessage = () => { showLoginModal.value = true }

const handleLoggedOut = () => {
  if (hasFormData()) {
    saveDraft()
    alert('로그아웃되었습니다. 입력하신 내용은 임시저장되었습니다.')
  }
  router.push({ name: 'Login', query: { reason: 'session_expired', redirect: router.currentRoute.value.fullPath } })
}

const handleLoggedIn = async () => {
  await initializeComponent()
  if (localStorage.getItem('productFormDraft')) {
    if (confirm('이전에 작성하던 내용이 있습니다. 복원하시겠습니까?')) restoreDraft()
  }
  showLoginModal.value = false
}

const handleLoginFromModal = () => {
  router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
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
    categoriesLoading.value = true
    const response = await getCategories({ isActive: true })
    if (response.success && response.data) {
      categories.value = response.data.map(parent => ({
        ...parent,
        subCategories: parent.children || []
      }))
    } else {
      alert('카테고리를 불러올 수 없습니다.')
      categories.value = []
    }
  } catch (error) {
    alert('카테고리를 불러오는 중 오류가 발생했습니다.')
    categories.value = []
  } finally {
    categoriesLoading.value = false
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
    case 'subCategoryId':
      if (!form.subCategoryId) errors.subCategoryId = '카테고리를 선택해주세요'
      break
    case 'price':
      if (!form.price || form.price.trim() === '') errors.price = '가격은 필수입니다'
      else if (parseInt(form.price) <= 0) errors.price = '가격은 0보다 커야 합니다'
      else if (parseInt(form.price) > 9999999999) errors.price = '가격이 너무 큽니다'
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('brand')
  validateField('subCategoryId')
  validateField('price')
  if (!thumbnailFile.value) errors.thumbnail = '대표 이미지는 필수입니다'
  else errors.thumbnail = ''
  errors.additionalImages = ''
  return !Object.values(errors).some(error => error !== '')
}

// Image handlers
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
  errors.thumbnail = '대표 이미지는 필수입니다'
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

// Feature & Tag
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
  const t = tag?.trim()
  if (!t) return
  if (selectedTags.value.includes(t)) {
    alert('이미 추가된 태그입니다')
    return
  }
  if (selectedTags.value.length >= 10) {
    alert('태그는 최대 10개까지입니다')
    return
  }
  selectedTags.value.push(t)
}

const removeTag = (index) => { selectedTags.value.splice(index, 1) }

// Category Methods
const toggleCategoryDropdown = () => {
  if (!showCategoryDropdown.value && categoryDropdownRef.value) {
    const rect = categoryDropdownRef.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom - 16 // 16px padding
    const spaceAbove = rect.top - 80 // 80px for header
    const minDropdownHeight = 300

    // 아래 공간이 충분하면 아래로, 아니면 위로
    if (spaceBelow >= minDropdownHeight) {
      dropdownDirection.value = 'down'
    } else if (spaceAbove >= minDropdownHeight) {
      dropdownDirection.value = 'up'
    } else {
      // 둘 다 부족하면 더 넓은 쪽 선택
      dropdownDirection.value = spaceBelow > spaceAbove ? 'down' : 'up'
    }
  }
  showCategoryDropdown.value = !showCategoryDropdown.value
}

const closeCategoryDropdown = () => { showCategoryDropdown.value = false }

const selectSubCategory = (id) => {
  form.subCategoryId = id
  showCategoryDropdown.value = false
  errors.subCategoryId = ''
}

const getSubCategoryLabel = (subCategoryId) => {
  for (const parent of categories.value) {
    if (parent.categoryId === subCategoryId) return parent.categoryName
    for (const sub of (parent.subCategories || [])) {
      if (sub.categoryId === subCategoryId) return `${parent.categoryName} > ${sub.categoryName}`
    }
  }
  return ''
}

const handleClickOutside = (e) => {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target)) closeCategoryDropdown()
}

// Submit
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
    // 리뷰 작성과 동일한 방식으로 이미지 업로드
    const thumbnailUploadResult = await uploadReviewImage(thumbnailFile.value.file, 'PRODUCT')
    if (!thumbnailUploadResult) throw new Error('대표 이미지 업로드 실패')

    const additionalUploadResults = []
    for (const fileObj of additionalFiles.value) {
      const uploadResult = await uploadReviewImage(fileObj.file, 'PRODUCT')
      if (!uploadResult) throw new Error('추가 이미지 업로드 실패')
      additionalUploadResults.push(uploadResult)
    }

    // 파일 정보 객체 구성 (리뷰와 동일한 형태)
    const thumbnailAttachmentInfo = {
      fileId: thumbnailUploadResult.id,
      storedPath: thumbnailUploadResult.fileUrl,
      originName: thumbnailUploadResult.orgFileNm,
      fileSize: thumbnailUploadResult.fileSize,
      contentType: thumbnailUploadResult.contentType,
      fileExplain: '제품 대표 이미지'
    }

    const attachmentFileInfos = additionalUploadResults.map((uploadData, index) => ({
      fileId: uploadData.id,
      storedPath: uploadData.fileUrl,
      originName: uploadData.orgFileNm,
      fileSize: uploadData.fileSize,
      contentType: uploadData.contentType,
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
      categoryId: form.subCategoryId,
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

// Draft
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
* { box-sizing: border-box; }

.product-create-view {
  min-height: 100vh;
  background: #fff;
}

/* Header */
.page-header {
  border-bottom: 1px solid #eee;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #fff;
  color: #333;
  cursor: pointer;
  transition: background 0.15s;
}
.back-btn:hover { background: #f5f5f5; }
.header-title {
  flex: 1;
}
.header-title h1 {
  font-size: 18px;
  font-weight: 600;
  color: #111;
  margin: 0;
}
.header-subtitle {
  font-size: 13px;
  color: #999;
  margin: 2px 0 0;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-badge {
  padding: 4px 10px;
  background: #f5f5f5;
  color: #666;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* Main */
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px;
}

.content-layout {
  display: flex;
  gap: 40px;
}

.form-area {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
}
.sidebar-sticky {
  position: sticky;
  top: 96px;
}

/* Form Section */
.form-section {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f5;
}
.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin: 0;
}
.required-badge {
  padding: 3px 8px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.optional-badge {
  padding: 3px 8px;
  background: #f5f5f5;
  color: #666;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

/* Form Elements */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.form-label .required {
  color: #dc2626;
  margin-left: 2px;
}
.form-input, .form-select, .form-textarea {
  padding: 12px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
.form-input::placeholder, .form-textarea::placeholder {
  color: #bbb;
}
.form-input.has-error, .form-select.has-error {
  border-color: #dc2626;
}
.form-textarea {
  resize: vertical;
  min-height: 100px;
}
.form-select {
  cursor: pointer;
}

.input-with-suffix {
  position: relative;
}
.input-with-suffix .form-input {
  padding-right: 40px;
}
.input-suffix {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #999;
}

.error-text {
  font-size: 12px;
  color: #dc2626;
}

/* Feature & Tag Input */
.feature-input-row, .tag-input-row {
  display: flex;
  gap: 8px;
}
.feature-input-row .form-input, .tag-input-row .form-input {
  flex: 1;
}
.add-btn {
  padding: 12px 20px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.add-btn:hover {
  background: #eee;
  color: #333;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
}
.chip.tag-chip {
  background: #ede9fe;
  color: #7c3aed;
}
.chip-remove {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
.chip-remove:hover {
  color: #666;
}

/* Image Upload */
.image-upload-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.upload-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.upload-label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.upload-label .required {
  color: #dc2626;
  margin-left: 2px;
}

.upload-zone {
  border: 2px dashed #e5e5e5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  overflow: hidden;
}
.upload-zone:hover {
  border-color: #7c3aed;
  background: #faf5ff;
}
.upload-zone.has-error {
  border-color: #dc2626;
}
.upload-zone.has-file {
  border-style: solid;
  border-color: #e5e5e5;
}

.thumbnail-zone {
  aspect-ratio: 1;
  max-width: 280px;
}
.thumbnail-zone .preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #999;
  padding: 40px;
}
.upload-placeholder span {
  font-size: 14px;
}
.upload-hint {
  font-size: 12px !important;
  color: #bbb !important;
}

.preview-image {
  display: block;
}
.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}
.remove-btn:hover {
  background: rgba(0,0,0,0.8);
}

.additional-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.additional-item {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid #eee;
}
.additional-item .preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.additional-item .remove-btn {
  width: 22px;
  height: 22px;
  top: 6px;
  right: 6px;
}
.additional-add {
  width: 100px;
  height: 100px;
  border: 2px dashed #e5e5e5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  cursor: pointer;
  transition: all 0.15s;
}
.additional-add:hover {
  border-color: #7c3aed;
  color: #7c3aed;
  background: #faf5ff;
}

/* Sidebar */
.completion-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}
.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.completion-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.completion-value {
  font-size: 20px;
  font-weight: 700;
  color: #7c3aed;
}
.completion-bar {
  height: 6px;
  background: #f5f5f5;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
}
.completion-fill {
  height: 100%;
  background: #7c3aed;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.completion-checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.completion-checklist li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #999;
}
.completion-checklist li.done {
  color: #333;
}
.check-icon {
  width: 18px;
  font-size: 12px;
}
.completion-checklist li.done .check-icon {
  color: #7c3aed;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-primary, .btn-secondary {
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary {
  background: #7c3aed;
  color: #fff;
  border: none;
}
.btn-primary:hover:not(:disabled) {
  background: #6d28d9;
}
.btn-primary:disabled {
  background: #e5e5e5;
  color: #999;
  cursor: not-allowed;
}
.btn-secondary {
  background: #fff;
  color: #666;
  border: 1px solid #e5e5e5;
}
.btn-secondary:hover {
  background: #f5f5f5;
  color: #333;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.save-notice {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 16px;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    order: -1;
  }
  .sidebar-sticky {
    position: relative;
    top: 0;
  }
  .completion-card {
    display: none;
  }
  .action-buttons {
    flex-direction: row;
  }
  .btn-primary, .btn-secondary {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  .header-inner {
    padding: 0 16px;
  }
  .header-subtitle {
    display: none;
  }
  .form-grid, .form-row {
    grid-template-columns: 1fr;
  }
  .form-section {
    padding: 20px;
  }

  /* 모바일에서 카테고리 드롭다운 전체 화면처럼 표시 */
  .category-dropdown-menu {
    position: fixed;
    top: 64px !important;
    bottom: auto !important;
    left: 0;
    right: 0;
    max-height: calc(100vh - 64px);
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .category-dropdown-menu.dropdown-up {
    top: 64px !important;
    bottom: auto !important;
  }
  .dropdown-content {
    max-height: calc(100vh - 120px);
  }
}

/* Category Dropdown */
.category-dropdown { position: relative; }
.category-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.category-select-btn:hover { border-color: #7c3aed; }
.category-select-btn:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
.category-select-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.selected-category { display: flex; align-items: center; }
.category-text { color: #333; }
.placeholder { color: #bbb; }
.dropdown-icon { width: 20px; height: 20px; color: #999; transition: transform 0.2s; }
.dropdown-icon.open { transform: rotate(180deg); }

/* 드롭다운 오버레이 */
.category-dropdown-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 150;
}

/* 오버레이 페이드 애니메이션 */
.overlay-fade-enter-active, .overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-fade-enter-from, .overlay-fade-leave-to {
  opacity: 0;
}

.category-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  max-height: min(500px, calc(100vh - 200px));
  overflow: hidden;
  z-index: 200;
}
.category-dropdown-menu.dropdown-up {
  top: auto;
  bottom: calc(100% + 8px);
}
.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
}
.dropdown-title { font-size: 15px; font-weight: 700; color: #111; }
.btn-close-dropdown {
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}
.btn-close-dropdown:hover { color: #333; }
.btn-close-dropdown svg { width: 20px; height: 20px; }

.dropdown-content {
  overflow-y: auto;
  max-height: min(440px, calc(100vh - 260px));
  padding: 8px;
  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}
.dropdown-content::-webkit-scrollbar {
  width: 6px;
}
.dropdown-content::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 3px;
}
.dropdown-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.category-group { margin-bottom: 8px; }
.category-group-header {
  padding: 10px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 4px;
}
.parent-name { font-size: 13px; font-weight: 700; color: #666; text-transform: uppercase; }

.sub-categories { padding-left: 8px; }
.sub-category-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: none;
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}
.sub-category-item:hover { background: #f5f5f5; }
.sub-category-item.active { background: #f3e8ff; }
.sub-name { font-size: 14px; font-weight: 500; color: #333; }
.sub-category-item.active .sub-name { color: #7c3aed; font-weight: 600; }
.check-icon { width: 18px; height: 18px; color: #7c3aed; }

/* Dropdown Transitions */
.dropdown-enter-active { animation: dropIn 0.2s ease; }
.dropdown-leave-active { animation: dropOut 0.15s ease; }
@keyframes dropIn { from { opacity: 0; transform: translateY(-8px); } }
@keyframes dropOut { to { opacity: 0; transform: translateY(-8px); } }

.dropdown-up-enter-active { animation: dropUpIn 0.2s ease; }
.dropdown-up-leave-active { animation: dropUpOut 0.15s ease; }
@keyframes dropUpIn { from { opacity: 0; transform: translateY(8px); } }
@keyframes dropUpOut { to { opacity: 0; transform: translateY(8px); } }
</style>