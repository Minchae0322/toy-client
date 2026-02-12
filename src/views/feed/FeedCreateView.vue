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
                  :class="{ 'drag-over': dragOverIndex === index, 'uploading': photo.uploading, 'upload-failed': photo.uploadFailed }"
              >
                <img :src="photo.preview" :alt="`Photo ${index + 1}`" />
                <!-- 업로드 중 오버레이 -->
                <div v-if="photo.uploading" class="upload-overlay">
                  <svg class="upload-spinner" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                  </svg>
                </div>
                <!-- 업로드 실패 표시 -->
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
          </section>

          <!-- Product Info -->
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
                <div class="autocomplete-wrapper">
                  <input
                    type="text"
                    class="form-input custom-input"
                    placeholder="브랜드 + 제품명 (예: 나이키 조던 4 레트로)"
                    v-model="formData.productNameCustom"
                    @input="handleProductNameInput"
                    ref="customInputRef"
                  />
                  <div v-if="productSuggestions.length > 0" class="suggestions">
                    <button v-for="suggestion in productSuggestions" :key="suggestion" class="suggestion-item" @click="selectSuggestion(suggestion)">
                      {{ suggestion }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Category -->
          <section class="card">
            <label class="form-label required">카테고리</label>

            <!-- 선택된 카테고리 표시 -->
            <div v-if="selectedCategoryInfo" class="selected-category-display">
              <span class="selected-category-label">{{ selectedCategoryInfo.label }}</span>
              <button type="button" class="selected-category-clear" @click="clearCategory">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- 1뎁스 카테고리 칩 -->
            <div class="category-chips-section">
              <p class="category-chips-title">인기 카테고리</p>
              <div class="category-chips-list">
                <button
                  v-for="cat in popularCategories"
                  :key="cat.categoryId"
                  type="button"
                  :class="['category-chip', { active: selectedParentCategory?.categoryId === cat.categoryId }]"
                  @click="handleParentCategoryClick(cat)"
                >
                  {{ cat.categoryName }}
                </button>
                <button type="button" class="category-chip more-btn" @click="openCategoryModal">
                  더보기
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 2뎁스 하위 카테고리 -->
            <div v-if="selectedParentCategory && subCategories.length > 0" class="sub-category-section">
              <div class="sub-category-list">
                <button
                  v-for="subCat in subCategories"
                  :key="subCat.categoryId"
                  type="button"
                  :class="['sub-category-chip', { active: formData.subCategoryId === subCat.categoryId }]"
                  @click="selectSubCategory(subCat)"
                >
                  {{ subCat.categoryName }}
                </button>
              </div>
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
              <p v-if="formData.store && !formData.storeUnknown && !quickStores.includes(formData.store)" class="input-hint">
                또는 위 버튼을 눌러 빠르게 선택하세요
              </p>
            </div>

            <!-- 구매 가격 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                구매 가격
                <button type="button" class="btn-toggle" :class="{ active: formData.priceHidden }" @click="togglePriceHidden">비공개</button>
              </label>
              <div v-if="!formData.priceHidden" class="price-input-box">
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
              <p v-if="formData.priceHidden" class="price-hidden-notice">
                💰 가격이 비공개로 설정됩니다
              </p>
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

            <!-- 선택된 해시태그 -->
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

            <!-- 해시태그 입력 -->
            <div v-if="formData.hashtags.length < 5" class="hashtag-input-box">
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

    <!-- Product Select Modal -->
    <ProductSelectModal
      v-if="showProductModal"
      @select="handleProductSelect"
      @close="closeProductModal"
    />

    <!-- Category Select Modal -->
    <CategorySelectModal
      v-if="showCategoryModal"
      content-type="FEED"
      :initial-category-id="formData.subCategoryId"
      @select="handleCategorySelect"
      @close="closeCategoryModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFeed } from '@/services/FeedService.js'
import { useFile } from '@/services/FileService.js'
import { useCategoryCache } from '@/composables/useCategoryCache.js'
import { getUserId } from '@/utils/auth.js'
import ProductSelectModal from '@/components/oneMouth/create/ProductSelectModal.vue'
import CategorySelectModal from '@/components/common/CategorySelectModal.vue'

const router = useRouter()
const feedService = useFeed()
const fileService = useFile()
const { loadPopularCategories, loadAllCategories, allCategories: cachedAllCategories } = useCategoryCache()

const selectedPhotos = ref([])
const showCancelDialog = ref(false)
const showSuccessToast = ref(false)
const isSubmitting = ref(false)
const isProcessingImage = ref(false)
const errorMessage = ref('')
const hashtagInput = ref('')
const productSuggestions = ref([])
const showCategoryModal = ref(false)
const selectedCategoryInfo = ref(null)
const allCategories = ref([])
const popularCategories = ref([])
const selectedParentCategory = ref(null)
const draggedIndex = ref(null)
const dragOverIndex = ref(null)
const showProductModal = ref(false)
const selectedProduct = ref(null)
const productInputMode = ref('select') // 'select' | 'custom'
const customInputRef = ref(null)

// 선택된 1뎁스 카테고리의 하위 카테고리 목록
const subCategories = computed(() => {
  if (!selectedParentCategory.value) return []
  return selectedParentCategory.value.children || []
})

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

const quickStores = ['무신사', '쿠팡', '네이버', '올리브영', '29CM', 'SSG']

const selectStore = (store) => {
  if (formData.value.storeUnknown) return
  formData.value.store = formData.value.store === store ? '' : store
}

const formattedPrice = computed(() => {
  if (!formData.value.buyPrice) return ''
  return Number(formData.value.buyPrice).toLocaleString()
})

const handlePriceInput = (e) => {
  const value = e.target.value.replace(/[^0-9]/g, '')
  formData.value.buyPrice = value ? parseInt(value) : null
}

const togglePriceHidden = () => {
  formData.value.priceHidden = !formData.value.priceHidden
  if (formData.value.priceHidden) {
    formData.value.buyPrice = null
  }
}

const popularHashtags = ['조던4', '에어팟맥스', '디올립글로우', '나이키', '스니커즈', '데일리룩', 'OOTD', '커피스타그램', '테크', '뷰티']

const mockProductNames = ['조던 4 레트로 브레드', '조던 4 화이트 시멘트', '조던 4 유니버시티 블루']

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
    // 전체 카테고리 로드 (캐시 활용)
    await loadAllCategories()
    allCategories.value = cachedAllCategories.value

    // 실제 인기 카테고리 API 호출 (최근 30일 기준 콘텐츠 수로 정렬)
    const popular = await loadPopularCategories('FEED', 8)
    popularCategories.value = popular
  } catch (error) {
    console.error('카테고리 로드 실패:', error)
  }
}

// 1뎁스 카테고리 클릭
const handleParentCategoryClick = (cat) => {
  // 같은 카테고리를 다시 클릭하면 선택 해제
  if (selectedParentCategory.value?.categoryId === cat.categoryId) {
    selectedParentCategory.value = null
    return
  }
  selectedParentCategory.value = cat
}

// 2뎁스 카테고리 선택
const selectSubCategory = (subCat) => {
  formData.value.subCategoryId = subCat.categoryId

  selectedCategoryInfo.value = {
    label: `${selectedParentCategory.value.categoryName} > ${subCat.categoryName}`,
    category: subCat,
    parent: selectedParentCategory.value
  }
}

const clearCategory = () => {
  formData.value.subCategoryId = null
  selectedCategoryInfo.value = null
  selectedParentCategory.value = null
}

const openCategoryModal = () => {
  showCategoryModal.value = true
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
}

const handleCategorySelect = ({ categoryId, category, parent }) => {
  formData.value.subCategoryId = categoryId

  if (parent) {
    selectedCategoryInfo.value = {
      label: `${parent.categoryName} > ${category.categoryName}`,
      category,
      parent
    }
    // 모달에서 선택한 경우 1뎁스도 활성화
    selectedParentCategory.value = parent
  } else {
    selectedCategoryInfo.value = {
      label: category.categoryName,
      category,
      parent: null
    }
    selectedParentCategory.value = null
  }

  showCategoryModal.value = false
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
      if (file.size > 5 * 1024 * 1024) {
        showError('파일 크기는 5MB 이하만 가능합니다.')
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


// Product Name
const handleProductNameInput = () => {
  if (formData.value.productNameCustom.length >= 2) {
    productSuggestions.value = mockProductNames.filter(n => n.toLowerCase().includes(formData.value.productNameCustom.toLowerCase()))
  } else {
    productSuggestions.value = []
  }
}
const selectSuggestion = (s) => { formData.value.productNameCustom = s; productSuggestions.value = [] }

// Product Modal
const openProductModal = () => { showProductModal.value = true }
const closeProductModal = () => { showProductModal.value = false }
const handleProductSelect = (product) => {
  selectedProduct.value = product
  formData.value.productId = product.productId
  formData.value.productNameCustom = product.name
  showProductModal.value = false
  productSuggestions.value = []
}
const clearSelectedProduct = () => {
  selectedProduct.value = null
  formData.value.productId = null
  formData.value.productNameCustom = ''
  productInputMode.value = 'select'
}

const resetProductInput = () => {
  formData.value.productNameCustom = ''
  productSuggestions.value = []
  productInputMode.value = 'select'
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

    const feedData = {
      userId: formData.value.userId,
      productId: formData.value.productId,
      productNameCustom: formData.value.productNameCustom.trim(),
      subCategoryId: formData.value.subCategoryId,
      review: formData.value.review.trim(),
      buyPlace: formData.value.store.trim(),
      buyPrice: formData.value.buyPrice ? parseInt(formData.value.buyPrice) : null,
      evaluation: formData.value.evaluation,
      hashtags: formData.value.hashtags,
      thumbnailAttachmentInfo,
      attachmentFileInfos
    }

    console.log('📤 Feed 생성 요청:', feedData)
    const result = await feedService.createFeed(feedData)

    if (result.success) {
      // 로컬 preview URL만 해제 (서버 URL은 해제 불필요)
      selectedPhotos.value.forEach(p => {
        if (p.preview && p.preview.startsWith('blob:')) {
          URL.revokeObjectURL(p.preview)
        }
      })
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

// 직접 입력 모드 전환 시 자동 포커스
watch(productInputMode, (newMode) => {
  if (newMode === 'custom') {
    nextTick(() => {
      customInputRef.value?.focus()
    })
  }
})

onMounted(() => {
  loadCategories()
})

onBeforeUnmount(() => {
  selectedPhotos.value.forEach(p => URL.revokeObjectURL(p.preview))
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
.photo-item img { width: 100%; height: 100%; object-fit: contain; background: #f3f4f6; }
.photo-item.drag-over { border: 2px dashed var(--accent); opacity: 0.5; }
.photo-item.uploading { opacity: 0.7; }
.photo-item.upload-failed { border: 2px solid #ef4444; }

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

/* Product Input */
.product-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 카드 선택 모드 */
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

/* 직접 입력 모드 */
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

.custom-input {
  padding: 14px 16px !important;
  font-size: 15px !important;
  border-radius: 12px !important;
}

.custom-input:focus {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

/* 모바일 카드 */
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

/* Category Inline Selection */
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

/* 2뎁스 하위 카테고리 */
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
  color: #9ca3af;
  border-style: dashed;
}

.quick-store-btn.unknown.active {
  background: #6b7280;
  color: white;
  border-style: solid;
  border-color: #6b7280;
}

.quick-store-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.input-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
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

.price-hidden-notice {
  padding: 12px 14px;
  background: #f9fafb;
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


/* Hashtags */
.count-badge { margin-left: auto; font-size: 13px; color: var(--secondary); }

/* 선택된 해시태그 목록 */
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

/* 해시태그 입력 박스 */
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

/* 힌트 텍스트 */
.hashtag-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
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
  margin-bottom: 10px;
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
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.confirm-dialog {
  background: white;
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
.btn-dialog.confirm { background: #dc2626; color: white; }

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
.error-toast { background: #dc2626; color: white; }
.success-toast { background: var(--primary); color: white; }

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>