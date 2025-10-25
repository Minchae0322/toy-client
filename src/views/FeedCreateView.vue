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
      <button
          class="btn-submit"
          :disabled="!canSubmit"
          @click="handleSubmit"
      >
        {{ isSubmitting ? '업로드 중...' : '게시' }}
      </button>
    </header>

    <!-- Main Content - 2 Column Layout -->
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

            <!-- Selected Photos Grid with Drag & Drop -->
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
                <div class="drag-handle">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                  </svg>
                </div>
                <div v-if="photo.uploading" class="upload-progress">
                  <div class="progress-bar-inner" :style="{ width: `${photo.progress}%` }"></div>
                </div>
              </div>
            </div>

            <!-- Add Photo Buttons -->
            <div class="photo-actions">
              <label class="btn-photo-action" :class="{ disabled: selectedPhotos.length >= 5 }">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handleFileSelect"
                    style="display: none;"
                    :disabled="selectedPhotos.length >= 5"
                />
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>갤러리</span>
              </label>

              <button class="btn-photo-action" @click="openCamera" :disabled="selectedPhotos.length >= 5">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>카메라</span>
              </button>
            </div>
            <p class="hint-text">사진을 드래그하여 순서를 변경할 수 있습니다</p>
          </section>

          <!-- Product Name -->
          <section class="card">
            <label class="form-label required">제품명</label>
            <div class="autocomplete-wrapper">
              <input
                  type="text"
                  class="form-input"
                  placeholder="예: 조던 4 레트로 브레드"
                  v-model="formData.productNameCustom"
                  @input="handleProductNameInput"
              />
              <div v-if="productSuggestions.length > 0" class="suggestions">
                <button
                    v-for="suggestion in productSuggestions"
                    :key="suggestion"
                    class="suggestion-item"
                    @click="selectSuggestion(suggestion)"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </section>

          <!-- Category -->
          <section class="card">
            <label class="form-label required">카테고리</label>

            <!-- Category Dropdown -->
            <div class="category-dropdown" ref="categoryDropdownRef">
              <button
                  class="category-select-btn"
                  @click.stop="toggleCategoryDropdown"
                  :disabled="categoriesLoading"
                  type="button"
              >
                <div v-if="formData.subCategoryId" class="selected-category">
                  <div class="category-icon-wrapper">
                    <svg class="category-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getCategoryIcon(formData.subCategoryId)"/>
                    </svg>
                  </div>
                  <span class="category-text">{{ getSubCategoryLabel(formData.subCategoryId) }}</span>
                </div>
                <span v-else-if="categoriesLoading" class="placeholder">
                  <span class="loading-dots"></span>
                  카테고리 로딩 중...
                </span>
                <span v-else class="placeholder">카테고리를 선택하세요</span>
                <svg class="dropdown-icon" :class="{ open: showCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <Transition name="dropdown">
                <div v-if="showCategoryDropdown && !categoriesLoading" class="category-dropdown-menu">
                  <div class="dropdown-header">
                    <span class="dropdown-title">카테고리 선택</span>
                    <button class="btn-close-dropdown" @click.stop="closeCategoryDropdown" type="button">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <div class="dropdown-content">
                    <div v-if="categories.length === 0" class="empty-message">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                      </svg>
                      <p>카테고리가 없습니다</p>
                    </div>

                    <div v-for="parent in categories" :key="parent.categoryId" class="category-group">
                      <div class="category-group-header">
                        <div class="parent-icon-wrapper">
                          <svg class="parent-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getCategoryIcon(parent.categoryId)"/>
                          </svg>
                        </div>
                        <span class="parent-name">{{ parent.categoryName }}</span>
                      </div>

                      <div v-if="parent.subCategories && parent.subCategories.length > 0" class="sub-categories">
                        <button
                            v-for="sub in parent.subCategories"
                            :key="sub.categoryId"
                            class="sub-category-item"
                            :class="{ active: formData.subCategoryId === sub.categoryId }"
                            @click.stop="selectSubCategory(sub.categoryId)"
                            type="button"
                        >
                          <span class="sub-name">{{ sub.categoryName }}</span>
                          <Transition name="check">
                            <svg v-if="formData.subCategoryId === sub.categoryId" class="check-icon" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          </Transition>
                        </button>
                      </div>

                      <div v-else class="no-subcategories">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>하위 카테고리가 없습니다</span>
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
            <label class="form-label">
              한줄평
              <span class="char-count" :class="{ error: formData.review.length > 100 }">
                {{ formData.review.length }}/100
              </span>
            </label>
            <textarea
                class="form-textarea"
                placeholder="제품에 대한 솔직한 리뷰를 작성해주세요 (선택사항)"
                v-model="formData.review"
                rows="4"
                maxlength="100"
            ></textarea>
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
                구매처
              </label>
              <select class="form-select" v-model="formData.store">
                <option value="">선택 안함</option>
                <option v-for="store in stores" :key="store" :value="store">
                  {{ store }}
                </option>
                <option value="direct">직접 입력</option>
              </select>
              <input
                  v-if="formData.store === 'direct'"
                  type="text"
                  class="form-input mt-2"
                  placeholder="구매처를 입력하세요"
                  v-model="formData.storeCustom"
              />
            </div>

            <!-- Price -->
            <div class="form-group">
              <label class="form-label">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                구매 가격
                <label class="checkbox-label">
                  <input type="checkbox" v-model="formData.priceHidden" />
                  <span>비공개</span>
                </label>
              </label>
              <div class="price-input-wrapper">
                <span class="price-prefix">₩</span>
                <input
                    type="number"
                    class="form-input price-input"
                    placeholder="230000"
                    v-model="formData.price"
                    :disabled="formData.priceHidden"
                />
              </div>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label class="form-label">
                <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                제품 상태
              </label>
              <div class="status-grid">
                <button
                    v-for="status in statuses"
                    :key="status.value"
                    :class="['status-btn', { active: formData.status === status.value }]"
                    @click="formData.status = status.value"
                    type="button"
                >
                  <svg class="status-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="status.icon"/>
                  </svg>
                  <span>{{ status.label }}</span>
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
                <span
                    v-for="(tag, idx) in formData.hashtags"
                    :key="idx"
                    class="hashtag-tag"
                >
                  {{ tag }}
                  <button class="remove-tag" @click="removeHashtag(idx)" type="button">
                    <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                  </button>
                </span>
              </div>
              <input
                  v-if="formData.hashtags.length < 5"
                  type="text"
                  class="hashtag-input"
                  placeholder="#해시태그 입력"
                  v-model="hashtagInput"
                  @keyup.enter="addHashtag"
              />
            </div>
            <p class="form-hint">엔터를 눌러 태그를 추가하세요</p>

            <!-- Popular Hashtags -->
            <div class="popular-hashtags">
              <p class="popular-title">인기 해시태그</p>
              <div class="popular-list">
                <button
                    v-for="tag in popularHashtags"
                    :key="tag"
                    class="popular-tag"
                    @click="addPopularHashtag(tag)"
                    :disabled="formData.hashtags.includes(tag) || formData.hashtags.length >= 5"
                    type="button"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>

    <!-- Fixed Bottom Submit Button -->
    <div class="fixed-bottom-bar">
      <div class="fixed-bottom-content">
        <button
            class="btn-submit-large"
            :disabled="!canSubmit"
            @click="handleSubmit"
            type="button"
        >
          <svg v-if="isSubmitting" class="spinner" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <span v-if="!isSubmitting">인증 올리기</span>
          <span v-else>업로드 중...</span>
        </button>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <Transition name="modal">
      <div v-if="showCancelDialog" class="modal-overlay" @click="showCancelDialog = false">
        <div class="confirm-dialog" @click.stop>
          <h3 class="dialog-title">작성을 취소하시겠어요?</h3>
          <p class="dialog-desc">지금까지 작성한 내용이 모두 사라집니다.</p>
          <div class="dialog-actions">
            <button class="btn-dialog cancel" @click="showCancelDialog = false" type="button">
              계속 작성
            </button>
            <button class="btn-dialog confirm" @click="confirmCancel" type="button">
              취소
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toasts -->
    <Transition name="toast">
      <div v-if="errorMessage" class="error-toast">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 7.293z"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="showSuccessToast" class="success-toast">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
        <span>인증이 게시되었습니다!</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useFeed } from '@/services/FeedService';
import { useCategory } from '@/services/CategoryService';
import { getUserId } from '@/utils/auth';

const router = useRouter();
const feedService = useFeed();
const categoryService = useCategory();

// 선택된 사진들 (File 객체만 저장, 서버 업로드는 하지 않음)
const selectedPhotos = ref([]);
const showCancelDialog = ref(false);
const showSuccessToast = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const hashtagInput = ref('');
const productSuggestions = ref([]);
const showCategoryDropdown = ref(false);

// 카테고리 데이터
const categories = ref([]);
const categoriesLoading = ref(false);

// Drag & Drop state
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

// 카테고리 드롭다운 ref
const categoryDropdownRef = ref(null);

const formData = ref({
  userId: getUserId(),
  productId: null,
  productNameCustom: '',
  subCategoryId: null,
  review: '',
  store: '',
  storeCustom: '',
  buyPrice: null,
  price: null,
  priceHidden: false,
  status: 'new',
  hashtags: []
});

const stores = [
  '무신사', '29CM', '쿠팡', '네이버 쇼핑',
  '지마켓', '11번가', 'SSG', '롯데온'
];

const statuses = [
  { value: 'new', label: '새 제품', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { value: 'like-new', label: '거의 새것', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { value: 'good', label: '양호', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { value: 'used', label: '사용감 있음', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
];

const popularHashtags = [
  '조던4', '에어팟맥스', '디올립글로우', '나이키', '스니커즈',
  '데일리룩', 'OOTD', '커피스타그램', '테크', '뷰티'
];

const mockProductNames = [
  '조던 4 레트로 브레드',
  '조던 4 화이트 시멘트',
  '조던 4 유니버시티 블루'
];

const canSubmit = computed(() => {
  return selectedPhotos.value.length > 0 &&
      formData.value.productNameCustom.trim() &&
      formData.value.subCategoryId &&
      formData.value.review.trim() &&
      !isSubmitting.value;
});

// ==================== 카테고리 관련 메서드 ====================

const loadCategories = async () => {
  try {
    categoriesLoading.value = true;
    const response = await categoryService.getCategories({ isActive: true });

    if (response.success && response.data) {
      if (response.data.length > 0 && response.data[0].children !== undefined) {
        categories.value = response.data.map(parent => ({
          ...parent,
          subCategories: parent.children || []
        }));
      } else {
        categories.value = buildCategoryTree(response.data);
      }
    } else {
      throw new Error(response.error || '카테고리 조회 실패');
    }
  } catch (error) {
    console.error('❌ 카테고리 로드 실패:', error);
    showError('카테고리를 불러오는데 실패했습니다.');
  } finally {
    categoriesLoading.value = false;
  }
};

const buildCategoryTree = (flatCategories) => {
  if (!flatCategories || flatCategories.length === 0) return [];

  const categoryMap = new Map();
  const result = [];

  flatCategories.forEach(cat => {
    categoryMap.set(cat.categoryId, { ...cat, subCategories: [] });
  });

  flatCategories.forEach(cat => {
    const category = categoryMap.get(cat.categoryId);
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) parent.subCategories.push(category);
    } else {
      result.push(category);
    }
  });

  const sortCategories = (cats) => {
    cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    cats.forEach(cat => {
      if (cat.subCategories && cat.subCategories.length > 0) {
        sortCategories(cat.subCategories);
      }
    });
  };

  sortCategories(result);
  return result;
};

const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value;
};

const closeCategoryDropdown = () => {
  showCategoryDropdown.value = false;
};

const selectSubCategory = (subCategoryId) => {
  formData.value.subCategoryId = subCategoryId;
  showCategoryDropdown.value = false;
};

const getSubCategoryLabel = (subCategoryId) => {
  if (!subCategoryId) return '';

  for (const parent of categories.value) {
    if (parent.categoryId === subCategoryId) {
      return parent.categoryName;
    }
    if (parent.subCategories && parent.subCategories.length > 0) {
      for (const sub of parent.subCategories) {
        if (sub.categoryId === subCategoryId) {
          return `${parent.categoryName} > ${sub.categoryName}`;
        }
      }
    }
  }
  return '';
};

const getCategoryIcon = (categoryId) => {
  return 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z';
};

const handleClickOutside = (event) => {
  if (categoryDropdownRef.value &&
      !categoryDropdownRef.value.contains(event.target) &&
      showCategoryDropdown.value) {
    closeCategoryDropdown();
  }
};

// ==================== 사진 선택 관련 메서드 (업로드는 하지 않음) ====================

const handleDragStart = (event, index) => {
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
};

const handleDragEnter = (index) => {
  dragOverIndex.value = index;
};

const handleDragLeave = () => {
  dragOverIndex.value = null;
};

const handleDrop = (event, dropIndex) => {
  event.preventDefault();

  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    draggedIndex.value = null;
    dragOverIndex.value = null;
    return;
  }

  const photos = [...selectedPhotos.value];
  const [draggedPhoto] = photos.splice(draggedIndex.value, 1);
  photos.splice(dropIndex, 0, draggedPhoto);

  selectedPhotos.value = photos;
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

/**
 * 파일 선택 (미리보기만 생성, 서버 업로드 X)
 */
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files);
  const remainingSlots = 5 - selectedPhotos.value.length;

  if (files.length === 0) return;

  const filesToAdd = files.slice(0, remainingSlots);

  for (const file of filesToAdd) {
    // 파일 검증
    if (!file.type.startsWith('image/')) {
      showError('이미지 파일만 업로드 가능합니다.');
      continue;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError(`${file.name}의 크기가 10MB를 초과합니다.`);
      continue;
    }

    try {
      // 미리보기 URL만 생성
      const previewUrl = URL.createObjectURL(file);

      const photoItem = {
        id: Date.now() + Math.random(),
        file: file,  // File 객체 저장
        preview: previewUrl,  // 미리보기용
        uploaded: false  // 아직 업로드 안됨
      };

      selectedPhotos.value.push(photoItem);
      console.log('✅ 사진 추가 (미리보기만):', file.name);

    } catch (error) {
      console.error('❌ 미리보기 생성 실패:', error);
      showError('이미지 미리보기 생성에 실패했습니다.');
    }
  }

  event.target.value = '';
};

/**
 * 사진 제거 (메모리 정리)
 */
const removePhoto = (index) => {
  const photo = selectedPhotos.value[index];

  // 미리보기 URL 메모리 해제
  if (photo.preview) {
    URL.revokeObjectURL(photo.preview);
  }

  selectedPhotos.value.splice(index, 1);
  console.log('✅ 사진 제거:', index);
};

const openCamera = () => {
  showError('카메라 기능은 준비 중입니다.');
};

// ==================== 제품명 자동완성 ====================

const handleProductNameInput = () => {
  if (formData.value.productNameCustom.length >= 2) {
    productSuggestions.value = mockProductNames.filter(name =>
        name.toLowerCase().includes(formData.value.productNameCustom.toLowerCase())
    );
  } else {
    productSuggestions.value = [];
  }
};

const selectSuggestion = (suggestion) => {
  formData.value.productNameCustom = suggestion;
  productSuggestions.value = [];
};

// ==================== 해시태그 관련 메서드 ====================

const addHashtag = () => {
  if (!hashtagInput.value.trim() || formData.value.hashtags.length >= 5) return;

  let tag = hashtagInput.value.trim();
  if (tag.startsWith('#')) {
    tag = tag.substring(1);
  }

  if (tag.length > 50) {
    showError('해시태그는 최대 50자까지 입력 가능합니다.');
    return;
  }

  if (!formData.value.hashtags.includes(tag)) {
    formData.value.hashtags.push(tag);
  }

  hashtagInput.value = '';
};

const removeHashtag = (index) => {
  formData.value.hashtags.splice(index, 1);
};

const addPopularHashtag = (tag) => {
  if (formData.value.hashtags.length >= 5 || formData.value.hashtags.includes(tag)) return;
  formData.value.hashtags.push(tag);
};

// ==================== 취소 및 제출 ====================

const handleCancel = () => {
  if (selectedPhotos.value.length > 0 || formData.value.productNameCustom || formData.value.review) {
    showCancelDialog.value = true;
  } else {
    router.back();
  }
};

const confirmCancel = () => {
  // 미리보기 URL 메모리 해제
  selectedPhotos.value.forEach(photo => {
    if (photo.preview) {
      URL.revokeObjectURL(photo.preview);
    }
  });

  showCancelDialog.value = false;
  router.back();
};

/**
 * Feed 생성 (파일 업로드 + Feed 생성을 한 번에 처리)
 */
const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  if (selectedPhotos.value.length === 0) {
    showError('최소 1장 이상의 사진이 필요합니다.');
    return;
  }

  isSubmitting.value = true;

  try {
    console.log('🚀 Feed 생성 시작...');

    // 1. File 객체 추출
    const [thumbnailPhoto, ...additionalPhotos] = selectedPhotos.value;
    const thumbnailFile = thumbnailPhoto.file;
    const additionalFiles = additionalPhotos.map(photo => photo.file);

    console.log('📸 대표 이미지:', thumbnailFile.name);
    console.log('📎 추가 이미지:', additionalFiles.map(f => f.name));

    // 2. Feed 데이터 준비
    const feedData = {
      userId: formData.value.userId,
      productId: formData.value.productId,
      productNameCustom: formData.value.productNameCustom.trim(),
      subCategoryId: formData.value.subCategoryId,
      review: formData.value.review.trim(),
      buyPrice: formData.value.buyPrice ? parseInt(formData.value.buyPrice) : null,
      price: formData.value.price ? parseInt(formData.value.price) : null,
      hashtags: formData.value.hashtags
    };

    console.log('📝 Feed 데이터:', feedData);

    // 3. createFeedWithFiles 호출 (파일 업로드 + Feed 생성)
    const result = await feedService.createFeedWithFiles(
        feedData,
        thumbnailFile,
        additionalFiles
    );

    if (result.success) {
      console.log('✅ Feed 생성 완료:', result.data);

      // 미리보기 URL 메모리 해제
      selectedPhotos.value.forEach(photo => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });

      isSubmitting.value = false;
      showSuccessToast.value = true;

      setTimeout(() => {
        router.push('/feed');
      }, 1500);
    } else {
      throw new Error(result.error || 'Feed 생성 실패');
    }

  } catch (error) {
    console.error('❌ Feed 생성 실패:', error);
    showError(error.message || '게시글 등록에 실패했습니다.');
    isSubmitting.value = false;
  }
};

const showError = (message) => {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = '';
  }, 3000);
};

// ==================== 라이프사이클 ====================

onMounted(async () => {
  console.log('✅ FeedCreateView 마운트 완료');
  await loadCategories();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  // 컴포넌트 종료 시 메모리 정리
  selectedPhotos.value.forEach(photo => {
    if (photo.preview) {
      URL.revokeObjectURL(photo.preview);
    }
  });
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #0F172A;
  --secondary: #64748B;
  --accent: #F97316;
  --border: #E2E8F0;
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --hover: #F1F5F9;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.create-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
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
  background: rgba(255, 255, 255, 0.95);
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
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: var(--hover);
}

.btn-cancel .icon {
  width: 24px;
  height: 24px;
  color: var(--primary);
  stroke-width: 2;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.btn-submit {
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  background: #EA580C;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Main Content */
.create-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card */
.card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon {
  width: 20px;
  height: 20px;
  color: var(--accent);
  stroke-width: 2;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  flex: 1;
}

.photo-count,
.count-badge {
  font-size: 14px;
  color: var(--secondary);
  font-weight: 600;
}

/* Photo Section with Drag & Drop */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--hover);
  cursor: move;
  transition: all 0.2s;
}

.photo-item:hover {
  transform: scale(1.02);
}

.photo-item.drag-over {
  border: 2px dashed var(--accent);
  opacity: 0.5;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drag-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  display: none;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.photo-item:hover .drag-handle {
  display: flex;
}

.drag-handle svg {
  width: 20px;
  height: 20px;
  color: white;
  stroke-width: 2;
}

.btn-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
}

.btn-remove:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.btn-remove .icon {
  width: 16px;
  height: 16px;
}

.photo-order {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  z-index: 1;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.progress-bar-inner {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

.photo-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-photo-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  background: white;
  border: 2px dashed var(--border);
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-photo-action:hover:not(:disabled):not(.disabled) {
  border-color: var(--accent);
  background: #FFF7ED;
  transform: translateY(-2px);
}

.btn-photo-action:disabled,
.btn-photo-action.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-photo-action .icon {
  width: 28px;
  height: 28px;
  color: var(--accent);
  stroke-width: 2;
}

.hint-text {
  font-size: 13px;
  color: var(--secondary);
  text-align: center;
  margin-top: 8px;
}

/* Form */
.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 8px;
}

.form-label.required::after {
  content: '*';
  color: var(--accent);
}

.inline-icon {
  width: 16px;
  height: 16px;
  color: var(--secondary);
  stroke-width: 2;
}

.char-count {
  margin-left: auto;
  font-size: 13px;
  color: var(--secondary);
  font-weight: 500;
}

.char-count.error {
  color: #DC2626;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 14px 16px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  color: var(--primary);
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--secondary);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  margin-top: 8px;
  font-size: 13px;
  color: var(--secondary);
}

.form-hint.error {
  color: #DC2626;
}

.mt-2 {
  margin-top: 8px;
}

/* Autocomplete */
.autocomplete-wrapper {
  position: relative;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 10;
}

.suggestion-item {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 14px;
  color: var(--primary);
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.suggestion-item:hover {
  background: var(--hover);
}
/* Category Dropdown - Premium Design */
.category-dropdown {
  position: relative;
}

.category-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(to bottom, #ffffff, #fafbfc);
  border: 2px solid var(--border);
  border-radius: 14px;
  font-size: 15px;
  font-family: inherit;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.category-select-btn:hover:not(:disabled) {
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
  transform: translateY(-1px);
}

.category-select-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.selected-category {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.category-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  border-radius: 10px;
  flex-shrink: 0;
}

.category-text {
  font-weight: 600;
  color: var(--primary);
  line-height: 1.4;
}

.placeholder {
  color: var(--secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-dots {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  animation: loading 1.4s infinite;
  position: relative;
}

.loading-dots::before,
.loading-dots::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  animation: loading 1.4s infinite;
}

.loading-dots::before {
  left: -8px;
  animation-delay: -0.2s;
}

.loading-dots::after {
  left: 8px;
  animation-delay: 0.2s;
}

@keyframes loading {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

.category-icon-svg {
  width: 20px;
  height: 20px;
  color: var(--accent);
  stroke-width: 2.5;
  flex-shrink: 0;
}

.dropdown-icon {
  width: 22px;
  height: 22px;
  color: var(--secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.dropdown-icon.open {
  transform: rotate(180deg);
  color: var(--accent);
}

/* Dropdown Menu */
.category-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  max-height: 480px;
  overflow: hidden;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 2px solid var(--border);
  background: linear-gradient(to bottom, #fafbfc, #ffffff);
  flex-shrink: 0;
}

.dropdown-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}

.btn-close-dropdown {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-dropdown:hover {
  background: var(--hover);
}

.btn-close-dropdown svg {
  width: 20px;
  height: 20px;
  color: var(--secondary);
  stroke-width: 2.5;
}

.dropdown-content {
  overflow-y: auto;
  padding: 8px;
}

.dropdown-content::-webkit-scrollbar {
  width: 8px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: var(--secondary);
}

/* Empty State */
.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: var(--secondary);
  gap: 12px;
}

.empty-message svg {
  width: 48px;
  height: 48px;
  opacity: 0.3;
  stroke-width: 1.5;
}

.empty-message p {
  font-size: 14px;
  font-weight: 500;
}

/* Category Group */
.category-group {
  margin-bottom: 4px;
}

.category-group:last-child {
  margin-bottom: 0;
}

.category-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border-radius: 12px;
  margin-bottom: 4px;
}

.parent-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.parent-icon-svg {
  width: 18px;
  height: 18px;
  color: var(--accent);
  stroke-width: 2.5;
}

.parent-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Sub Categories */
.sub-categories {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 12px;
}

.sub-category-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.sub-category-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
  transform: scaleY(0);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sub-category-item:hover::before {
  transform: scaleY(1);
}

.sub-category-item:hover {
  background: linear-gradient(to right, #FFF7ED, transparent);
  padding-left: 20px;
}

.sub-category-item.active {
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  padding-left: 20px;
}

.sub-category-item.active::before {
  transform: scaleY(1);
}

.sub-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--primary);
  transition: all 0.2s;
}

.sub-category-item:hover .sub-name {
  color: var(--accent);
  font-weight: 600;
}

.sub-category-item.active .sub-name {
  color: var(--accent);
  font-weight: 700;
}

.check-icon {
  width: 20px;
  height: 20px;
  color: var(--accent);
  flex-shrink: 0;
}

/* No Subcategories */
.no-subcategories {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  margin-left: 12px;
  background: var(--bg);
  border-radius: 10px;
  color: var(--secondary);
  font-size: 13px;
  font-weight: 500;
}

.no-subcategories svg {
  width: 16px;
  height: 16px;
  opacity: 0.5;
  stroke-width: 2;
  flex-shrink: 0;
}

/* Dropdown Transition */
.dropdown-enter-active {
  animation: dropdownIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-leave-active {
  animation: dropdownOut 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdownOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
}

/* Check Icon Transition */
.check-enter-active {
  animation: checkIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.check-leave-active {
  animation: checkOut 0.2s ease-out;
}

@keyframes checkIn {
  from {
    opacity: 0;
    transform: scale(0) rotate(-90deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes checkOut {
  from {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  to {
    opacity: 0;
    transform: scale(0) rotate(90deg);
  }
}

/* Additional Info */
.additional-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary);
  cursor: pointer;
  margin-left: auto;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.price-input-wrapper {
  position: relative;
}

.price-prefix {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  font-weight: 600;
  color: var(--secondary);
}

.price-input {
  padding-left: 36px;
}

/* Status */
.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.status-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.status-btn:hover {
  border-color: var(--accent);
  background: #FFF7ED;
}

.status-btn.active {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.status-icon-svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

/* Hashtags */
.hashtag-input-wrapper {
  padding: 12px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.selected-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.remove-tag {
  padding: 2px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.remove-tag:hover {
  transform: scale(1.2);
}

.remove-tag .icon {
  width: 14px;
  height: 14px;
}

.hashtag-input {
  flex: 1;
  min-width: 120px;
  padding: 6px;
  border: none;
  font-size: 14px;
  font-family: inherit;
  color: var(--primary);
}

.hashtag-input:focus {
  outline: none;
}

.popular-hashtags {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.popular-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.popular-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.popular-tag {
  padding: 8px 14px;
  background: var(--bg);
  color: var(--secondary);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.popular-tag:hover:not(:disabled) {
  background: #EFF6FF;
  color: #1D4ED8;
}

.popular-tag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.dialog-desc {
  font-size: 15px;
  color: var(--secondary);
  margin-bottom: 24px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.btn-dialog {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-dialog.cancel {
  background: var(--hover);
  color: var(--primary);
}

.btn-dialog.cancel:hover {
  background: var(--border);
}

.btn-dialog.confirm {
  background: #DC2626;
  color: white;
}

.btn-dialog.confirm:hover {
  background: #B91C1C;
}

/* Toasts */
.error-toast,
.success-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
  z-index: 300;
}

.error-toast {
  background: #DC2626;
  color: white;
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
}

.success-toast {
  background: var(--primary);
  color: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.error-toast .icon,
.success-toast .icon {
  width: 24px;
  height: 24px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .photo-actions {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}

/* Fixed Bottom Bar */
.fixed-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--border);
  padding: 16px;
  z-index: 40;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.fixed-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn-submit-large {
  width: 100%;
  padding: 18px 24px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-submit-large:hover:not(:disabled) {
  background: #EA580C;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
}

.btn-submit-large:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.spinner {
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>