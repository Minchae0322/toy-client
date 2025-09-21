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
        <!-- 사용자 정보 표시 -->
        <div v-if="isLoggedIn" class="user-info">
          <span class="welcome-text">{{ userNickname }}님</span>
          <button type="button" class="btn-link" @click="debugAuthInfo">디버그</button>
        </div>

        <button
            type="button"
            class="save-draft-btn"
            @click="saveDraft"
            :disabled="isLoading || !isLoggedIn"
        >
          💾 임시저장
        </button>
      </div>
    </nav>

    <!-- 인증 상태 확인 중 -->
    <div v-if="authLoading" class="auth-loading">
      <div class="spinner"></div>
      <div>인증 상태를 확인하고 있습니다...</div>
    </div>

    <!-- 인증 에러 표시 -->
    <div v-if="errors.auth" class="auth-error">
      <div class="error-icon">🚫</div>
      <div class="error-message">{{ errors.auth }}</div>
      <button class="btn btn-primary" @click="handleLoginFromModal">
        로그인하러 가기
      </button>
    </div>

    <!-- 메인 컨텐츠 (로그인된 경우에만 표시) -->
    <template v-if="isLoggedIn && !authLoading">
      <!-- 진행 상태 섹션 -->
      <div class="progress-section">
        <div class="progress-header">
          <div class="step-info">제품 등록</div>
        </div>
        <h1 class="progress-title">새 제품을 등록해 주세요</h1>
        <p class="progress-subtitle">
          등록하신 제품은 관리자 승인 후 다른 사용자들도 이용할 수 있어요
        </p>
        <div class="approval-notice">
          ⏱️ 보통 2-3시간 내 승인됩니다
        </div>
      </div>

      <!-- 작성자 정보 표시 -->
      <div class="author-info-section">
        <div class="section-title">👤 작성자 정보</div>
        <div class="author-card">
          <div class="author-details">
            <div class="author-name">{{ userNickname }}</div>
            <div class="author-id">ID: {{ userId }}</div>
            <div v-if="user?.email" class="author-email">{{ user.email }}</div>
          </div>
          <div class="author-role">
            <span class="role-badge" :class="user?.role?.toLowerCase()">
              {{ user?.role === 'ADMIN' ? '관리자' : '일반회원' }}
            </span>
          </div>
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
                    :disabled="!isLoggedIn"
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
                    :disabled="!isLoggedIn"
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
                    :disabled="!isLoggedIn"
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

              <!-- 정가 -->
              <div class="form-group">
                <label class="form-label">정가 (원)</label>
                <div class="price-input-container">
                  <input
                      v-model="form.price"
                      type="text"
                      class="form-input"
                      placeholder="0"
                      pattern="[0-9]*"
                      maxlength="10"
                      :disabled="!isLoggedIn"
                      @input="validatePrice"
                  >
                  <span class="price-unit">원</span>
                </div>
                <div class="form-help">
                  브랜드 공식 판매가격을 입력해주세요. (선택사항)
                </div>
                <div v-if="errors.price" class="validation-message">
                  {{ errors.price }}
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
                    :disabled="!isLoggedIn"
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
                  :disabled="!isLoggedIn"
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
                  :disabled="!isLoggedIn"
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
                    :class="{
                      'active': selectedFeatures.includes(feature),
                      'disabled': !isLoggedIn
                    }"
                >
                  <input
                      type="checkbox"
                      :value="feature"
                      v-model="selectedFeatures"
                      :disabled="!isLoggedIn"
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
                  :disabled="!isLoggedIn"
              >
              <div class="form-help">
                제품의 주요 특징을 선택하거나 직접 입력해주세요.
              </div>
            </div>

            <!-- 태그 -->
            <div class="form-group">
              <label class="form-label">태그</label>
              <div class="tag-input-container"
                   :class="{ 'disabled': !isLoggedIn }"
                   @click="isLoggedIn && focusTagInput()">
                <div
                    v-for="(tag, index) in selectedTags"
                    :key="index"
                    class="tag-item"
                >
                  {{ tag }}
                  <span class="tag-remove"
                        @click="isLoggedIn && removeTag(index)">×</span>
                </div>
                <input
                    ref="tagInput"
                    v-model="currentTag"
                    type="text"
                    class="tag-input"
                    placeholder="태그를 입력하고 Enter를 눌러주세요"
                    @keypress.enter="addTag"
                    @keydown.backspace="handleBackspace"
                    :disabled="!isLoggedIn"
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
                  :class="{
                    'dragover': isDragOver,
                    'disabled': !isLoggedIn
                  }"
                  @click="isLoggedIn && triggerFileInput()"
                  @drop="isLoggedIn && handleFileDrop($event)"
                  @dragover.prevent="isLoggedIn && handleDragOver($event)"
                  @dragleave="isLoggedIn && handleDragLeave()"
              >
                <div class="upload-icon">📷</div>
                <div class="upload-text">
                  <template v-if="isLoggedIn">
                    브랜드 공식 이미지나 제품 패키지 사진을 올려주세요
                  </template>
                  <template v-else>
                    로그인 후 이미지를 업로드할 수 있습니다
                  </template>
                </div>
                <div class="upload-hint" v-if="isLoggedIn">
                  PNG, JPG, JPEG 파일만 가능 • 파일당 최대 5MB • 최대 5개
                </div>
                <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    multiple
                    style="display: none"
                    @change="handleFileSelect"
                    :disabled="!isLoggedIn"
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
                      :disabled="!isLoggedIn"
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

          <!-- 폼 액션 버튼 -->
          <div class="form-actions">
            <button
                type="button"
                class="btn btn-secondary"
                @click="goBack"
                :disabled="isLoading || !isLoggedIn"
            >
              취소
            </button>
            <button
                type="submit"
                class="btn btn-primary"
                :disabled="!canSubmit"
                :class="{
                  'loading': isLoading,
                  'disabled': !isLoggedIn
                }"
            >
              <span v-if="isLoading">등록 중...</span>
              <span v-else-if="!isLoggedIn">로그인 필요</span>
              <span v-else>제품 등록하기</span>
            </button>
          </div>
        </form>
      </div>
    </template>

    <!-- 로그인 필요 모달 -->
    <div v-if="showLoginModal" class="modal-overlay" @click="closeLoginModal">
      <div class="modal-content" @click.stop>
        <div class="modal-icon">🔐</div>
        <h3>로그인이 필요합니다</h3>
        <p>
          제품을 등록하려면 먼저 로그인해주세요.<br>
          로그인 후에 현재 페이지로 돌아와서 작업을 계속할 수 있습니다.
        </p>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="handleLoginFromModal">
            로그인하러 가기
          </button>
          <button class="btn btn-secondary" @click="closeLoginModal">
            홈으로 돌아가기
          </button>
        </div>
      </div>
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
        <p>
          새 제품이 성공적으로 등록되었습니다.<br>
          관리자 승인 후 다른 사용자들도 이용할 수 있습니다.
        </p>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="navigateToProducts">
            제품 목록 보기
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
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProduct } from '@/services/ProductService.js'
import { useCategory } from '@/services/CategoryService.js'
import { useAuth } from '@/composables/useAuth.js'

// Vue Router
const router = useRouter()

// Auth Composable
const {
  user,
  isLoggedIn,
  loading: authLoading,
  userId,
  userNickname,
  checkAuthStatus,
  login,
  logout
} = useAuth()

// Product Service
const {
  createProduct,
  debugStatus,
  formatFileSize,
  validateProductData
} = useProduct()

// Category Service
const {
  getCategories
} = useCategory()

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
const showLoginModal = ref(false)

// 폼 레퍼런스
const productForm = ref(null)
const fileInput = ref(null)
const tagInput = ref(null)

// 폼 데이터 (백엔드 DTO에 맞춤)
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

// 에러 상태
const errors = reactive({
  name: '',
  brand: '',
  categoryId: '',
  price: '',
  images: '',
  auth: ''
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
  return isLoggedIn.value &&
      form.name.trim() &&
      form.brand.trim() &&
      form.categoryId &&
      uploadedFiles.value.length > 0 &&
      Object.values(errors).every(error => !error)
})

const canSubmit = computed(() => {
  return isFormValid.value && !isLoading.value && !authLoading.value
})

const currentUserInfo = computed(() => {
  if (!user.value) return null

  return {
    id: user.value.id,
    nickname: userNickname.value,
    email: user.value.email,
    role: user.value.role
  }
})

// 인증 상태 감시
watch(isLoggedIn, (newValue, oldValue) => {
  console.log('🔄 [PRODUCT] 로그인 상태 변경:', { newValue, oldValue })

  if (!newValue && oldValue) {
    handleLoggedOut()
  } else if (newValue && !oldValue) {
    handleLoggedIn()
  }
})

watch(user, (newUser, oldUser) => {
  if (newUser && newUser.id !== oldUser?.id) {
    console.log('👤 [PRODUCT] 사용자 정보 변경:', newUser.nickname || newUser.username)
  }
})

// 생명주기
onMounted(async () => {
  console.log('🚀 [PRODUCT] 컴포넌트 마운트 시작')

  await checkAuthenticationStatus()

  if (isLoggedIn.value) {
    await initializeComponent()
  } else {
    showAuthRequiredMessage()
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)

  uploadedFiles.value.forEach(fileObj => {
    if (fileObj.preview) {
      URL.revokeObjectURL(fileObj.preview)
    }
  })

  console.log('🧹 [PRODUCT] 컴포넌트 언마운트')
})

// === 인증 관련 메서드들 ===

const checkAuthenticationStatus = async () => {
  console.log('🔐 [PRODUCT] 인증 상태 확인 중...')

  try {
    const isAuthenticated = await checkAuthStatus()

    if (!isAuthenticated) {
      console.log('❌ [PRODUCT] 인증되지 않음 - 로그인 필요')
      errors.auth = '로그인이 필요한 서비스입니다.'
      return false
    }

    console.log('✅ [PRODUCT] 인증 확인 완료:', user.value?.nickname || user.value?.username)
    errors.auth = ''
    return true

  } catch (error) {
    console.error('❌ [PRODUCT] 인증 상태 확인 실패:', error)
    errors.auth = '인증 상태를 확인할 수 없습니다.'
    return false
  }
}

const showAuthRequiredMessage = () => {
  console.log('🚨 [PRODUCT] 로그인 필요')
  showLoginModal.value = true
}

const handleLoggedOut = () => {
  console.log('🚪 [PRODUCT] 로그아웃 감지')

  if (hasFormData()) {
    saveDraft()
    alert('로그아웃되었습니다. 입력하신 내용은 임시저장되었습니다.')
  }

  router.push({
    name: 'Login',
    query: {
      reason: 'session_expired',
      redirect: router.currentRoute.value.fullPath
    }
  })
}

const handleLoggedIn = async () => {
  console.log('✅ [PRODUCT] 로그인 완료 감지')

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
    query: {
      redirect: router.currentRoute.value.fullPath
    }
  })
}

const closeLoginModal = () => {
  showLoginModal.value = false
  router.push('/')
}

// === 컴포넌트 초기화 ===

const initializeComponent = async () => {
  console.log('🔄 [PRODUCT] 컴포넌트 초기화 시작')

  try {
    await loadCategories()
    restoreDraft()
    debugStatus()

    window.addEventListener('beforeunload', beforeUnloadHandler)

    console.log('✅ [PRODUCT] 컴포넌트 초기화 완료')
  } catch (error) {
    console.error('❌ [PRODUCT] 컴포넌트 초기화 실패:', error)
  }
}

const loadCategories = async () => {
  try {
    console.log('🔄 [PRODUCT] 카테고리 로드 시작')

    const response = await getCategories({ isActive: true })

    if (response.success && response.data) {
      categories.value = response.data
      console.log('✅ [PRODUCT] 카테고리 로드 성공:', categories.value.length)
    } else {
      console.warn('[PRODUCT] 카테고리 API 실패, 기본값 사용:', response.error)

      // API 실패 시 기본 카테고리 제공
      categories.value = [
        {
          categoryId: 1,
          categoryName: '프라모델',
          description: '건담, 자동차, 항공기 등의 프라스틱 모델',
          isActive: true
        },
        {
          categoryId: 2,
          categoryName: '피규어',
          description: '애니메이션, 게임 캐릭터 피규어',
          isActive: true
        },
        {
          categoryId: 3,
          categoryName: '블록완구',
          description: '레고, 조립식 블록 완구',
          isActive: true
        },
        {
          categoryId: 4,
          categoryName: '음료',
          description: '음료수, 차, 커피 등',
          isActive: true
        },
        {
          categoryId: 5,
          categoryName: '과자/스낵',
          description: '과자, 스낵, 간식류',
          isActive: true
        },
        {
          categoryId: 6,
          categoryName: '기타',
          description: '기타 상품',
          isActive: true
        }
      ]
    }
  } catch (error) {
    console.error('[PRODUCT] 카테고리 로드 에러:', error)

    // 에러 시에도 기본 카테고리 제공
    categories.value = [
      { categoryId: 1, categoryName: '프라모델', isActive: true },
      { categoryId: 2, categoryName: '피규어', isActive: true },
      { categoryId: 3, categoryName: '블록완구', isActive: true },
      { categoryId: 4, categoryName: '음료', isActive: true },
      { categoryId: 5, categoryName: '과자/스낵', isActive: true },
      { categoryId: 6, categoryName: '기타', isActive: true }
    ]
  }
}

// === 폼 검증 ===

const validateField = (fieldName) => {
  errors[fieldName] = ''

  switch (fieldName) {
    case 'name':
      if (!form.name.trim()) {
        errors.name = '제품명은 필수입니다.'
      } else if (form.name.length < 2 || form.name.length > 100) {
        errors.name = '제품명은 2자 이상 100자 이하로 입력해주세요.'
      }
      break

    case 'brand':
      if (!form.brand.trim()) {
        errors.brand = '브랜드명은 필수입니다.'
      } else if (form.brand.length < 1 || form.brand.length > 100) {
        errors.brand = '브랜드명은 1자 이상 100자 이하로 입력해주세요.'
      }
      break

    case 'categoryId':
      if (!form.categoryId || form.categoryId <= 0) {
        errors.categoryId = '올바른 카테고리를 선택해주세요.'
      }
      break
  }
}

const validatePrice = () => {
  errors.price = ''

  // 숫자만 허용하고 10자리 제한
  form.price = form.price.replace(/[^0-9]/g, '')

  if (form.price && form.price.length > 10) {
    form.price = form.price.substring(0, 10)
    errors.price = '가격은 최대 10자리까지 입력할 수 있습니다.'
  }
}

const validateForm = () => {
  validateField('name')
  validateField('brand')
  validateField('categoryId')

  if (uploadedFiles.value.length === 0) {
    errors.images = '최소 1개의 이미지를 업로드해주세요.'
  } else {
    errors.images = ''
  }

  return Object.values(errors).every(error => !error)
}

// === 파일 처리 ===

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  processFiles(files)
  event.target.value = ''
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
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name}: 파일 크기는 5MB 이하만 업로드 가능합니다.`)
      return
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert(`${file.name}: PNG, JPG, JPEG 파일만 업로드 가능합니다.`)
      return
    }

    if (uploadedFiles.value.length >= 5) {
      alert('최대 5개의 이미지만 업로드할 수 있습니다.')
      return
    }

    const fileObj = {
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file)
    }

    uploadedFiles.value.push(fileObj)
  })

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

// === 태그 처리 ===

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

// === 특징 처리 ===

const addCustomFeature = () => {
  const feature = customFeature.value.trim()
  if (feature && !selectedFeatures.value.includes(feature)) {
    selectedFeatures.value.push(feature)
    customFeature.value = ''
  }
}

// === 폼 제출 ===

const handleSubmit = async () => {
  console.log('📤 [PRODUCT] 폼 제출 시작')

  if (!isLoggedIn.value) {
    alert('로그인이 필요합니다.')
    showAuthRequiredMessage()
    return
  }

  if (!userId.value) {
    console.error('❌ [PRODUCT] 사용자 ID 없음')
    alert('사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.')
    await logout()
    return
  }

  if (!validateForm()) {
    alert('필수 항목을 모두 입력해주세요.')
    return
  }

  isLoading.value = true

  try {
    // 선택된 특징들을 세미콜론으로 연결
    const allFeatures = [...selectedFeatures.value]
    if (customFeature.value.trim()) {
      allFeatures.push(customFeature.value.trim())
    }

    // 백엔드 DTO에 맞춘 상품 데이터 구성
    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim() || null,
      distributor: form.distributor.trim() || null,
      price: form.price || null,
      feature: allFeatures.length > 0 ? allFeatures.join(';') : null,
      tags: selectedTags.value,
      releaseDate: form.releaseDate || null,
      categoryId: form.categoryId
    }

    // 업로드할 파일들
    const files = uploadedFiles.value.map(fileObj => fileObj.file)

    console.log('📦 [PRODUCT] 등록할 상품 데이터:', {
      name: productData.name,
      categoryId: productData.categoryId,
      filesCount: files.length
    })

    const response = await createProduct(productData, files)

    if (response.success) {
      localStorage.removeItem('productFormDraft')
      console.log('✅ [PRODUCT] 제품 등록 성공:', response.data)
      showSuccessModal.value = true
    } else {
      throw new Error(response.error || '제품 등록에 실패했습니다.')
    }

  } catch (error) {
    console.error('❌ [PRODUCT] 제품 등록 실패:', error)

    if (error.message.includes('인증') || error.message.includes('권한')) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.')
      await logout()
    } else {
      alert(error.message || '제품 등록 중 오류가 발생했습니다.')
    }
  } finally {
    isLoading.value = false
  }
}

// === 임시저장 ===

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
  console.log('💾 [PRODUCT] 임시저장 완료')

  alert('현재 입력 내용이 임시저장되었습니다.')
}

const restoreDraft = () => {
  if (!isLoggedIn.value) return

  const savedDraft = localStorage.getItem('productFormDraft')
  if (savedDraft) {
    try {
      const draftData = JSON.parse(savedDraft)

      if (draftData.userId && draftData.userId !== userId.value) {
        console.log('⚠️ [PRODUCT] 다른 사용자의 임시저장 데이터')

        if (confirm('다른 계정에서 작성된 임시저장 데이터입니다. 삭제하시겠습니까?')) {
          localStorage.removeItem('productFormDraft')
        }
        return
      }

      Object.assign(form, draftData.form || {})

      if (draftData.selectedFeatures) {
        selectedFeatures.value = draftData.selectedFeatures
      }
      if (draftData.selectedTags) {
        selectedTags.value = draftData.selectedTags
      }
      if (draftData.customFeature) {
        customFeature.value = draftData.customFeature
      }

      console.log('📥 [PRODUCT] 임시저장 데이터 복원 완료')
    } catch (error) {
      console.warn('❌ [PRODUCT] 임시저장 데이터 복원 실패:', error)
      localStorage.removeItem('productFormDraft')
    }
  }
}

// === 네비게이션 ===

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
  return form.name.trim() ||
      form.description.trim() ||
      uploadedFiles.value.length > 0 ||
      selectedTags.value.length > 0
}

const navigateToProducts = () => {
  showSuccessModal.value = false
  router.push('/products')
}

const navigateToHome = () => {
  showSuccessModal.value = false
  router.push('/')
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const beforeUnloadHandler = (event) => {
  if (isLoggedIn.value && hasFormData()) {
    event.preventDefault()
    event.returnValue = '입력된 내용이 있습니다. 페이지를 벗어나시겠습니까?'
  }
}

const debugAuthInfo = () => {
  console.group('🔍 [PRODUCT] 인증 정보 디버깅')
  console.log('로그인 상태:', isLoggedIn.value)
  console.log('사용자 정보:', currentUserInfo.value)
  console.log('폼 유효성:', isFormValid.value)
  console.log('제출 가능:', canSubmit.value)
  console.groupEnd()
}
</script>

<style scoped>
/* === 기본 레이아웃 === */
.product-create-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* === 상단 네비게이션 === */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.breadcrumb {
  font-size: 14px;
  color: #6c757d;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.welcome-text {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.btn-link {
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

.btn-link:hover {
  color: #0056b3;
}

.save-draft-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-draft-btn:hover:not(:disabled) {
  background-color: #5a6268;
  transform: translateY(-1px);
}

.save-draft-btn:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
  transform: none;
}

/* === 인증 관련 UI === */
.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin: 20px;
}

.auth-loading .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.auth-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background-color: #fff5f5;
  border: 2px solid #fed7d7;
  border-radius: 12px;
  margin: 20px;
}

.auth-error .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.auth-error .error-message {
  font-size: 18px;
  color: #e53e3e;
  font-weight: 600;
  margin-bottom: 20px;
}

/* === 작성자 정보 === */
.author-info-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.author-details {
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
}

.author-id {
  font-size: 12px;
  color: #6c757d;
  font-family: monospace;
  margin-bottom: 2px;
}

.author-email {
  font-size: 13px;
  color: #6c757d;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.admin {
  background-color: #dc3545;
  color: white;
}

.role-badge.user {
  background-color: #28a745;
  color: white;
}

/* === 진행 상태 === */
.progress-section {
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-info {
  font-size: 14px;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 16px;
}

.progress-title {
  font-size: 28px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 12px;
}

.progress-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 16px;
}

.approval-notice {
  display: inline-block;
  padding: 8px 16px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
}

/* === 폼 스타일 === */
.form-container {
  background-color: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 40px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #dc3545;
  font-weight: 700;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.8;
}

.form-input.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

.char-counter {
  font-size: 12px;
  color: #6c757d;
  text-align: right;
  margin-top: 4px;
}

.form-help {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.validation-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.validation-message::before {
  content: '⚠️';
  font-size: 12px;
}

.price-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.price-unit {
  position: absolute;
  right: 16px;
  color: #6c757d;
  font-size: 14px;
  pointer-events: none;
}

/* === 체크박스 그룹 === */
.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.checkbox-item:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.checkbox-item.active {
  border-color: #007bff;
  background-color: #e3f2fd;
  color: #1976d2;
}

.checkbox-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-item input {
  margin: 0;
}

.custom-feature-input {
  margin-top: 12px;
}

/* === 태그 입력 === */
.tag-input-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  min-height: 44px;
  cursor: text;
  transition: border-color 0.2s ease;
}

.tag-input-container:focus-within {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.tag-input-container.disabled {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  cursor: not-allowed;
  opacity: 0.8;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #007bff;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tag-remove {
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}

.tag-remove:hover {
  color: #ffc107;
}

.tag-input {
  flex: 1;
  min-width: 120px;
  border: none;
  outline: none;
  padding: 4px 0;
  font-size: 14px;
  background: transparent;
}

.tag-input:disabled {
  cursor: not-allowed;
}

/* === 이미지 업로드 === */
.image-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.image-upload-area:hover:not(.disabled) {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.image-upload-area.dragover {
  border-color: #007bff;
  background-color: #e3f2fd;
}

.image-upload-area.disabled {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  cursor: not-allowed;
  opacity: 0.8;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #495057;
  text-align: center;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #6c757d;
  text-align: center;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.preview-item {
  position: relative;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.preview-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-remove:hover:not(:disabled) {
  background-color: #dc3545;
}

.preview-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-info {
  padding: 8px;
  text-align: center;
}

.file-name {
  font-size: 12px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: #6c757d;
}

/* === 버튼 === */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #e9ecef;
}

.btn {
  padding: 12px 24px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
  border-color: #545b62;
}

.btn:disabled,
.btn.disabled {
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.8;
  transform: none;
}

.btn.loading {
  position: relative;
  cursor: not-allowed;
}

.btn.loading::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn.loading span {
  margin-left: 24px;
}

/* === 모달 스타일 === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.modal-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 16px;
}

.modal-content p {
  font-size: 16px;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 32px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-actions .btn {
  min-width: 120px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
}

/* === 로딩 오버레이 === */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  font-size: 18px;
  font-weight: 500;
  color: #495057;
}

.loading-overlay .spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-overlay div:last-child {
  font-size: 18px;
  color: #495057;
}

/* === 반응형 디자인 === */
@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-container {
    padding: 24px;
  }

  .progress-section {
    padding: 24px;
  }

  .author-info-section {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .product-create-container {
    padding: 10px;
  }

  .nav-right {
    flex-direction: column;
    gap: 8px;
  }

  .user-info {
    padding: 6px 10px;
    font-size: 12px;
  }

  .author-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .modal-content {
    padding: 24px;
    margin: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .btn {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .progress-title {
    font-size: 24px;
  }

  .progress-subtitle {
    font-size: 14px;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .image-preview {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 480px) {
  .top-nav {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
    height: auto;
  }

  .nav-left {
    gap: 12px;
  }

  .logo {
    font-size: 18px;
  }

  .breadcrumb {
    font-size: 12px;
  }

  .form-container {
    padding: 16px;
  }

  .progress-section {
    padding: 20px 16px;
  }

  .author-info-section {
    padding: 16px;
  }

  .section-title {
    font-size: 16px;
  }

  .form-section h3 {
    font-size: 18px;
  }

  .upload-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .upload-text {
    font-size: 14px;
  }

  .upload-hint {
    font-size: 11px;
  }
}

/* === 애니메이션 === */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* === 접근성 개선 === */
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
}

/* 스크린 리더용 텍스트 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* === 폼 향상 === */
.form-input:valid {
  border-color: #28a745;
}

.form-input:invalid:not(:focus) {
  border-color: #dc3545;
}

/* 프리미엄 느낌의 그라데이션 */
.btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

/* 인터랙티브 요소 강화 */
.checkbox-item:hover,
.tag-item:hover {
  transform: translateY(-2px);
}

/* 로딩 상태 개선 */
.btn.loading {
  color: transparent;
}

.btn.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  margin-left: -10px;
  margin-top: -10px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

/* 성능 최적화 */
.product-create-container {
  contain: layout style paint;
}

.form-section {
  contain: layout style;
}

/* GPU 가속 */
.btn,
.form-input,
.modal-content {
  transform: translateZ(0);
  will-change: transform;
}

/* 스크롤 최적화 */
.form-container {
  scroll-behavior: smooth;
}

/* 터치 최적화 */
@media (hover: none) and (pointer: coarse) {
  .btn {
    min-height: 44px;
  }

  .form-input {
    min-height: 44px;
  }

  .checkbox-item {
    min-height: 44px;
  }
}
</style>