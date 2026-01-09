<template>
  <div class="create-container">
    <!-- Header -->
    <header class="create-header">
      <button class="btn-cancel" @click="handleCancel">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <h1 class="header-title">인증 올리기</h1>
      <button class="btn-submit" :disabled="!canSubmit" @click="handleSubmit">
        {{ isSubmitting ? '업로드 중...' : '게시' }}
      </button>
    </header>

    <!-- Main Content -->
    <main class="create-content">
      <div class="content-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Photo Section -->
          <section class="card photo-section">
            <div class="card-header">
              <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <h2 class="card-title">사진</h2>
              <span class="photo-count">{{ selectedPhotos.length }}/5</span>
            </div>

            <!-- Processing Indicator -->
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
                  :class="{ 'drag-over': dragOverIndex === index }"
              >
                <img :src="photo.preview" :alt="`Photo ${index + 1}`" />
                <button class="btn-remove" @click="removePhoto(index)">
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
              <button class="btn-photo-action" @click="openCamera" :disabled="selectedPhotos.length >= 5 || isProcessingImage">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>카메라</span>
              </button>
            </div>
            <p class="hint-text">사진을 드래그하여 순서를 변경할 수 있습니다 (최대 1920px로 자동 최적화)</p>
          </section>

          <!-- Product Name -->
          <section class="card">
            <label class="form-label required">제품명</label>
            <div class="autocomplete-wrapper">
              <input type="text" class="form-input" placeholder="예: 조던 4 레트로 브레드" v-model="formData.productNameCustom" @input="handleProductNameInput" />
              <div v-if="productSuggestions.length > 0" class="suggestions">
                <button v-for="suggestion in productSuggestions" :key="suggestion" class="suggestion-item" @click="selectSuggestion(suggestion)">
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </section>

          <!-- Category -->
          <section class="card">
            <label class="form-label required">카테고리</label>
            <div class="category-dropdown" ref="categoryDropdownRef">
              <button class="category-select-btn" @click.stop="toggleCategoryDropdown" :disabled="categoriesLoading" type="button">
                <div v-if="formData.subCategoryId" class="selected-category">
                  <span class="category-text">{{ getSubCategoryLabel(formData.subCategoryId) }}</span>
                </div>
                <span v-else-if="categoriesLoading" class="placeholder">카테고리 로딩 중...</span>
                <span v-else class="placeholder">카테고리를 선택하세요</span>
                <svg class="dropdown-icon" :class="{ open: showCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

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
                        <button v-for="sub in parent.subCategories" :key="sub.categoryId" class="sub-category-item" :class="{ active: formData.subCategoryId === sub.categoryId }" @click.stop="selectSubCategory(sub.categoryId)" type="button">
                          <span class="sub-name">{{ sub.categoryName }}</span>
                          <svg v-if="formData.subCategoryId === sub.categoryId" class="check-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </section>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Review -->
          <section class="card">
            <label class="form-label required">
              한줄평
              <span class="char-count" :class="{ error: formData.review.length > 100 }">{{ formData.review.length }}/100</span>
            </label>
            <textarea class="form-textarea" placeholder="제품에 대한 솔직한 리뷰를 작성해주세요" v-model="formData.review" rows="4" maxlength="100"></textarea>
          </section>

          <!-- Additional Info -->
          <section class="card additional-info">
            <!-- Store -->
            <div class="form-group">
              <label class="form-label">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="label-with-required">구매처<span class="required-mark">*</span></span>
                <button type="button" class="btn-toggle" :class="{ active: formData.storeUnknown }" @click="toggleStoreUnknown">모름</button>
              </label>
              <input type="text" class="form-input" placeholder="구매처를 입력하세요 (예: 무신사, 쿠팡)" v-model="formData.store" :disabled="formData.storeUnknown" />
            </div>

            <!-- 구매 가격 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                구매 가격
                <button type="button" class="btn-toggle" :class="{ active: formData.priceHidden }" @click="formData.priceHidden = !formData.priceHidden">비공개</button>
              </label>
              <div class="price-input-wrapper">
                <span class="price-prefix">₩</span>
                <input type="number" class="form-input price-input" placeholder="실제 결제 금액" v-model="formData.buyPrice" :disabled="formData.priceHidden" />
              </div>
            </div>

            <!-- Evaluation -->
            <div class="form-group">
              <label class="form-label required">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                제품 평가
              </label>
              <div class="status-grid">
                <button v-for="ev in evaluations" :key="ev.value" :class="['status-btn', ev.value.toLowerCase(), { active: formData.evaluation === ev.value }]" @click="formData.evaluation = ev.value" type="button">
                  <span>{{ ev.label }}</span>
                </button>
              </div>
            </div>
          </section>

          <!-- Hashtags -->
          <section class="card">
            <label class="form-label">
              <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
              해시태그
              <span class="count-badge">{{ formData.hashtags.length }}/5</span>
            </label>
            <div class="hashtag-input-wrapper">
              <div class="selected-hashtags">
                <span v-for="(tag, idx) in formData.hashtags" :key="idx" class="hashtag-tag">
                  {{ tag }}
                  <button class="remove-tag" @click="removeHashtag(idx)" type="button">
                    <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                  </button>
                </span>
              </div>
              <input v-if="formData.hashtags.length < 5" type="text" class="hashtag-input" placeholder="#해시태그 입력" v-model="hashtagInput" @keyup.enter="addHashtag" />
            </div>
            <div class="popular-hashtags">
              <p class="popular-title">인기 해시태그</p>
              <div class="popular-list">
                <button v-for="tag in popularHashtags" :key="tag" class="popular-tag" @click="addPopularHashtag(tag)" :disabled="formData.hashtags.includes(tag) || formData.hashtags.length >= 5" type="button">
                  {{ tag }}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Fixed Bottom -->
    <div class="fixed-bottom-bar">
      <div class="fixed-bottom-content">
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
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCancelDialog" class="modal-overlay" @click="showCancelDialog = false">
          <Transition name="dialog" appear>
            <div class="confirm-dialog" @click.stop>
              <div class="dialog-icon-wrapper warning">
                <svg class="dialog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 class="dialog-title">작성을 취소하시겠어요?</h3>
              <p class="dialog-desc">지금까지 작성한 내용이 모두 사라집니다.</p>
              <div class="dialog-actions">
                <button class="btn-dialog secondary" @click="showCancelDialog = false">
                  <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  계속 작성
                </button>
                <button class="btn-dialog danger" @click="confirmCancel">
                  <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  취소하기
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Toasts -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="errorMessage" class="toast error-toast">
          <div class="toast-icon error">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="toast-message">{{ errorMessage }}</span>
        </div>
      </Transition>
      <Transition name="toast">
        <div v-if="showSuccessToast" class="toast success-toast">
          <div class="toast-icon success">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="toast-message">인증이 게시되었습니다!</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useFeed } from '@/services/FeedService.js'
import { useCategory } from '@/services/CategoryService.js'
import { getUserId } from '@/utils/auth.js'

const router = useRouter()
const feedService = useFeed()
const categoryService = useCategory()

const selectedPhotos = ref([])
const showCancelDialog = ref(false)
const showSuccessToast = ref(false)
const isSubmitting = ref(false)
const isProcessingImage = ref(false)
const errorMessage = ref('')
const hashtagInput = ref('')
const productSuggestions = ref([])
const showCategoryDropdown = ref(false)
const dropdownDirection = ref('down') // 'down' 또는 'up'
const categories = ref([])
const categoriesLoading = ref(false)
const draggedIndex = ref(null)
const dragOverIndex = ref(null)
const categoryDropdownRef = ref(null)

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

const popularHashtags = ['조던4', '에어팟맥스', '디올립글로우', '나이키', '스니커즈', '데일리룩', 'OOTD', '커피스타그램', '테크', '뷰티']

const mockProductNames = ['조던 4 레트로 브레드', '조던 4 화이트 시멘트', '조던 4 유니버시티 블루']

const canSubmit = computed(() => {
  return selectedPhotos.value.length > 0 &&
      formData.value.productNameCustom.trim() &&
      formData.value.subCategoryId &&
      formData.value.review.trim() &&
      formData.value.store.trim() &&
      formData.value.evaluation &&
      !isSubmitting.value &&
      !isProcessingImage.value
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
const loadCategories = async () => {
  try {
    categoriesLoading.value = true
    const response = await categoryService.getCategories({ isActive: true })
    if (response.success && response.data) {
      categories.value = response.data.map(parent => ({
        ...parent,
        subCategories: parent.children || []
      }))
    }
  } catch (error) {
    showError('카테고리를 불러오는데 실패했습니다.')
  } finally {
    categoriesLoading.value = false
  }
}

const toggleCategoryDropdown = () => {
  if (!showCategoryDropdown.value && categoryDropdownRef.value) {
    // 드롭다운을 열 때 방향 계산
    const rect = categoryDropdownRef.value.getBoundingClientRect()
    const dropdownHeight = 400 // 드롭다운 메뉴 최대 높이
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    // 아래 공간이 부족하고 위 공간이 더 많으면 위로 펼치기
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      dropdownDirection.value = 'up'
    } else {
      dropdownDirection.value = 'down'
    }
  }
  showCategoryDropdown.value = !showCategoryDropdown.value
}
const closeCategoryDropdown = () => { showCategoryDropdown.value = false }
const selectSubCategory = (id) => { formData.value.subCategoryId = id; showCategoryDropdown.value = false }

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

        selectedPhotos.value.push({
          id: Date.now() + Math.random(),
          file: resizedFile,
          preview: URL.createObjectURL(resizedFile)
        })
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

const openCamera = () => { showError('카메라 기능은 준비 중입니다.') }

// Product Name
const handleProductNameInput = () => {
  if (formData.value.productNameCustom.length >= 2) {
    productSuggestions.value = mockProductNames.filter(n => n.toLowerCase().includes(formData.value.productNameCustom.toLowerCase()))
  } else {
    productSuggestions.value = []
  }
}
const selectSuggestion = (s) => { formData.value.productNameCustom = s; productSuggestions.value = [] }

// Hashtags
const addHashtag = () => {
  if (!hashtagInput.value.trim() || formData.value.hashtags.length >= 5) return
  let tag = hashtagInput.value.trim().replace(/^#/, '')
  if (tag && !formData.value.hashtags.includes(tag)) formData.value.hashtags.push(tag)
  hashtagInput.value = ''
}
const removeHashtag = (index) => { formData.value.hashtags.splice(index, 1) }
const addPopularHashtag = (tag) => {
  if (formData.value.hashtags.length < 5 && !formData.value.hashtags.includes(tag)) formData.value.hashtags.push(tag)
}

// Submit
const handleCancel = () => {
  if (selectedPhotos.value.length > 0 || formData.value.productNameCustom || formData.value.review) {
    showCancelDialog.value = true
  } else {
    router.back()
  }
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
    const feedData = {
      userId: formData.value.userId,
      productId: formData.value.productId,
      productNameCustom: formData.value.productNameCustom.trim(),
      subCategoryId: formData.value.subCategoryId,
      review: formData.value.review.trim(),
      buyPlace: formData.value.store.trim(),
      buyPrice: formData.value.buyPrice ? parseInt(formData.value.buyPrice) : null,
      evaluation: formData.value.evaluation,
      hashtags: formData.value.hashtags
    }

    const result = await feedService.createFeedWithFiles(feedData, thumbnail.file, additional.map(p => p.file))

    if (result.success) {
      selectedPhotos.value.forEach(p => URL.revokeObjectURL(p.preview))
      showSuccessToast.value = true
      setTimeout(() => router.push('/feed'), 1500)
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
  await loadCategories()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  selectedPhotos.value.forEach(p => URL.revokeObjectURL(p.preview))
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
:root {
  --primary: #111827;
  --secondary: #6b7280;
  --accent: #9333ea;
  --border: #e5e7eb;
  --bg: #ffffff;
  --hover: #f9fafb;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

.create-container {
  font-family: 'SUIT-Regular', 'Noto Sans KR', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
  padding-bottom: 100px;
}

/* Header */
.create-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-cancel {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-cancel .icon { width: 24px; height: 24px; }

.header-title { font-size: 18px; font-weight: 700; }

.btn-submit {
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Content */
.create-content { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }
.content-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
@media (min-width: 1024px) { .content-grid { grid-template-columns: 1fr 1fr; } }

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border);
}

.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.section-icon { width: 20px; height: 20px; color: var(--accent); }
.card-title { font-size: 16px; font-weight: 700; flex: 1; }
.photo-count { font-size: 14px; color: var(--secondary); }

/* Processing Indicator */
.processing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f3e8ff;
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
.photo-item img { width: 100%; height: 100%; object-fit: cover; }
.photo-item.drag-over { border: 2px dashed var(--accent); opacity: 0.5; }

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

.photo-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-photo-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px;
  background: white;
  border: 2px dashed var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-photo-action:hover:not(:disabled) { border-color: var(--accent); background: #faf5ff; }
.btn-photo-action:disabled, .btn-photo-action.disabled { opacity: 0.5; cursor: not-allowed; }
.btn-photo-action .icon { width: 24px; height: 24px; color: var(--accent); }

.hint-text { font-size: 12px; color: var(--secondary); text-align: center; margin-top: 8px; }

/* Form */
.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
.form-label.required::after { content: '*'; color: #ef4444; }

.inline-icon { width: 16px; height: 16px; color: var(--secondary); }
.char-count { margin-left: auto; font-size: 12px; color: var(--secondary); }
.char-count.error { color: #ef4444; }

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
}
.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent);
}
.form-textarea { resize: vertical; min-height: 100px; }
.mt-2 { margin-top: 8px; }

/* Autocomplete */
.autocomplete-wrapper { position: relative; }
.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 10;
}
.suggestion-item {
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}
.suggestion-item:hover { background: var(--hover); }

/* Category Dropdown */
.category-dropdown { position: relative; }
.category-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
}
.category-select-btn:hover { border-color: var(--accent); }
.placeholder { color: var(--secondary); }
.dropdown-icon { width: 20px; height: 20px; color: var(--secondary); transition: transform 0.2s; }
.dropdown-icon.open { transform: rotate(180deg); }

.category-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  max-height: 400px;
  overflow: hidden;
  z-index: 100;
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
  border-bottom: 1px solid var(--border);
}
.dropdown-title { font-size: 15px; font-weight: 700; }
.btn-close-dropdown {
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
}
.btn-close-dropdown svg { width: 20px; height: 20px; }

.dropdown-content { overflow-y: auto; max-height: 340px; padding: 8px; }
.category-group { margin-bottom: 8px; }
.category-group-header {
  padding: 10px 12px;
  background: var(--hover);
  border-radius: 8px;
  margin-bottom: 4px;
}
.parent-name { font-size: 13px; font-weight: 700; color: var(--secondary); text-transform: uppercase; }

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
}
.sub-category-item:hover { background: var(--hover); }
.sub-category-item.active { background: #f3e8ff; }
.sub-name { font-size: 14px; font-weight: 500; }
.sub-category-item.active .sub-name { color: var(--accent); font-weight: 600; }
.check-icon { width: 18px; height: 18px; color: var(--accent); }

/* Additional Info */
.additional-info { display: flex; flex-direction: column; gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }

/* Required Mark */
.label-with-required {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.required-mark {
  color: #ef4444;
  font-weight: 600;
}

.btn-toggle {
  margin-left: auto;
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
  background: #e5e7eb;
}
.btn-toggle.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.price-input-wrapper { position: relative; }
.price-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary);
}
.price-input { padding-left: 32px; }

/* Evaluation Buttons */
.status-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.status-btn {
  padding: 12px 8px;
  background: white;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.status-btn:hover { border-color: var(--secondary); }

.status-btn.best { border-color: #f97316; color: #f97316; }
.status-btn.best.active { background: #f97316; color: white; }

.status-btn.good { border-color: #10b981; color: #10b981; }
.status-btn.good.active { background: #10b981; color: white; }

.status-btn.okay { border-color: #3b82f6; color: #3b82f6; }
.status-btn.okay.active { background: #3b82f6; color: white; }

.status-btn.bad { border-color: #ef4444; color: #ef4444; }
.status-btn.bad.active { background: #ef4444; color: white; }

/* Hashtags */
.count-badge { margin-left: auto; font-size: 13px; color: var(--secondary); }

.hashtag-input-wrapper {
  padding: 10px 12px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 50px;
}
.selected-hashtags { display: flex; flex-wrap: wrap; gap: 6px; }
.hashtag-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}
.remove-tag {
  padding: 2px;
  background: none;
  border: none;
  cursor: pointer;
}
.remove-tag .icon { width: 12px; height: 12px; }

.hashtag-input {
  flex: 1;
  min-width: 100px;
  padding: 4px;
  border: none;
  font-size: 14px;
  outline: none;
}

.popular-hashtags { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
.popular-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.popular-list { display: flex; flex-wrap: wrap; gap: 6px; }
.popular-tag {
  padding: 6px 12px;
  background: var(--hover);
  color: var(--secondary);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.popular-tag:hover:not(:disabled) { background: #eff6ff; color: #1d4ed8; }
.popular-tag:disabled { opacity: 0.5; cursor: not-allowed; }

/* Fixed Bottom */
.fixed-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--border);
  padding: 16px;
  z-index: 40;
}
.fixed-bottom-content { max-width: 1200px; margin: 0 auto; }
.btn-submit-large {
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
}
.btn-submit-large:hover:not(:disabled) { background: #7c22ce; }
.btn-submit-large:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner { width: 20px; height: 20px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-dialog {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.dialog-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.dialog-icon-wrapper.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.dialog-icon {
  width: 32px;
  height: 32px;
  color: #d97706;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
}

.dialog-desc {
  font-size: 14px;
  color: var(--secondary);
  margin-bottom: 28px;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.btn-dialog {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-dialog .btn-icon {
  width: 18px;
  height: 18px;
}

.btn-dialog.secondary {
  background: #f3f4f6;
  color: var(--primary);
}

.btn-dialog.secondary:hover {
  background: #e5e7eb;
}

.btn-dialog.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-dialog.danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* Toasts */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  z-index: 1100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-icon svg {
  width: 20px;
  height: 20px;
}

.toast-icon.error {
  color: white;
}

.toast-icon.success {
  color: white;
}

.toast-message {
  white-space: nowrap;
}

.error-toast {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.success-toast {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

/* Transitions */
.dropdown-enter-active { animation: dropIn 0.2s ease; }
.dropdown-leave-active { animation: dropOut 0.15s ease; }
@keyframes dropIn { from { opacity: 0; transform: translateY(-8px); } }
@keyframes dropOut { to { opacity: 0; transform: translateY(-8px); } }

.dropdown-up-enter-active { animation: dropUpIn 0.2s ease; }
.dropdown-up-leave-active { animation: dropUpOut 0.15s ease; }
@keyframes dropUpIn { from { opacity: 0; transform: translateY(8px); } }
@keyframes dropUpOut { to { opacity: 0; transform: translateY(8px); } }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.dialog-enter-active { animation: dialogIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dialog-leave-active { animation: dialogOut 0.2s ease; }
@keyframes dialogIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
}
@keyframes dialogOut {
  to {
    opacity: 0;
    transform: scale(0.95) translateY(5px);
  }
}

.toast-enter-active {
  animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  animation: toastOut 0.3s ease;
}
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.9);
  }
}
@keyframes toastOut {
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px) scale(0.95);
  }
}
</style>