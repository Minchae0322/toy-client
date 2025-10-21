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
                  v-model="formData.productName"
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
            <div class="category-dropdown">
              <button
                  class="category-select-btn"
                  @click="showCategoryDropdown = !showCategoryDropdown"
              >
                <div v-if="formData.category" class="selected-category">
                  <svg class="category-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getCategoryIcon(formData.category)"/>
                  </svg>
                  <span>{{ getCategoryLabel(formData.category) }}</span>
                </div>
                <span v-else class="placeholder">카테고리를 선택하세요</span>
                <svg class="dropdown-icon" :class="{ open: showCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <div v-if="showCategoryDropdown" class="category-dropdown-menu">
                <button
                    v-for="cat in categories"
                    :key="cat.value"
                    class="category-dropdown-item"
                    :class="{ active: formData.category === cat.value }"
                    @click="selectCategory(cat.value)"
                >
                  <svg class="category-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="cat.icon"/>
                  </svg>
                  <span>{{ cat.label }}</span>
                </button>
              </div>
            </div>

            <!-- Sub Category -->
            <div v-if="formData.category && subCategories[formData.category]" class="sub-category-wrapper">
              <label class="form-label">세부 카테고리</label>
              <div class="sub-category-list">
                <button
                    v-for="sub in subCategories[formData.category]"
                    :key="sub"
                    :class="['sub-category-btn', { active: formData.subCategory === sub }]"
                    @click="formData.subCategory = sub"
                >
                  {{ sub }}
                </button>
              </div>
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
                  <button class="remove-tag" @click="removeHashtag(idx)">
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
    <div v-if="showCancelDialog" class="modal-overlay" @click="showCancelDialog = false">
      <div class="confirm-dialog" @click.stop>
        <h3 class="dialog-title">작성을 취소하시겠어요?</h3>
        <p class="dialog-desc">지금까지 작성한 내용이 모두 사라집니다.</p>
        <div class="dialog-actions">
          <button class="btn-dialog cancel" @click="showCancelDialog = false">
            계속 작성
          </button>
          <button class="btn-dialog confirm" @click="confirmCancel">
            취소
          </button>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFile } from '@/services/FileService';

const router = useRouter();
const fileService = useFile();

const selectedPhotos = ref([]);
const uploadedFileIds = ref([]);
const showCancelDialog = ref(false);
const showSuccessToast = ref(false);
const isSubmitting = ref(false);
const uploadingPhotos = ref(false);
const errorMessage = ref('');
const hashtagInput = ref('');
const productSuggestions = ref([]);
const showCategoryDropdown = ref(false);

// Drag & Drop state
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

const formData = ref({
  productName: '',
  category: '',
  subCategory: '',
  review: '',
  store: '',
  storeCustom: '',
  price: null,
  priceHidden: false,
  status: 'available',
  hashtags: []
});

// SVG paths for categories
const categories = [
  { value: 'sneakers', label: '스니커즈', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { value: 'tech', label: '테크', icon: 'M20 3H4c-1.1 0-1.99.9-1.99 2L2 19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v3zm5 5h-4V9h4v8z' },
  { value: 'beauty', label: '뷰티', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
  { value: 'fnb', label: 'F&B', icon: 'M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z' },
  { value: 'fashion', label: '패션', icon: 'M12 2l-5.5 9h11z M7 13v8h10v-8z' },
  { value: 'life', label: '라이프', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { value: 'sports', label: '스포츠', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
  { value: 'books', label: '도서', icon: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z' },
  { value: 'toys', label: '완구/취미', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' },
  { value: 'pet', label: '반려동물', icon: 'M4.5 9.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0 M9 5.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0 M15 5.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0 M19.5 9.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0 M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z' },
  { value: 'health', label: '건강/의료', icon: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z' },
  { value: 'car', label: '자동차', icon: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z' },
  { value: 'music', label: '음악/악기', icon: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' },
  { value: 'art', label: '미술/공예', icon: 'M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z M6.5 9m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0 M9.5 5.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0 M14.5 5.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0 M17.5 9m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0' },
  { value: 'travel', label: '여행/레저', icon: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z' },
  { value: 'etc', label: '기타', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' }
];

const subCategories = {
  sneakers: ['러닝화', '농구화', '라이프스타일', '하이탑', '로우탑', '슬립온', '샌들/슬리퍼'],
  tech: ['스마트폰', '태블릿', '이어폰/헤드폰', '노트북', '웨어러블', '스마트워치', '게이밍기어', '액세서리'],
  beauty: ['스킨케어', '메이크업', '향수', '헤어케어', '네일', '바디케어', '남성화장품'],
  fnb: ['커피', '베이커리', '레스토랑', '주류', '디저트', '건강식품', '간편식'],
  fashion: ['아우터', '상의', '하의', '신발', '액세서리', '가방', '시계', '주얼리'],
  life: ['홈데코', '가구', '침구', '주방용품', '욕실용품', '청소용품', '수납/정리'],
  sports: ['운동화', '운동복', '운동기구', '자전거', '캠핑', '등산', '수영', '골프'],
  books: ['소설', '비소설', '자기계발', '경제경영', '인문', '과학', '만화'],
  toys: ['피규어', '프라모델', '보드게임', '레고', '인형', 'RC', '퍼즐'],
  pet: ['사료', '간식', '용품', '장난감', '의류', '미용', '건강'],
  health: ['영양제', '건강기능식품', '의료기기', '마사지기', '건강관리'],
  car: ['용품', '액세서리', '세차용품', '튜닝', '블랙박스', '네비게이션'],
  music: ['악기', '오디오', '앰프', '이펙터', '악보', '음반'],
  art: ['화구', '공예재료', '캔버스', '액자', '조형재료'],
  travel: ['캐리어', '백팩', '여행용품', '캠핑용품', '아웃도어'],
  etc: ['기타']
};

const stores = [
  '무신사', '크림', '나이키 공식', '아디다스 공식', '애플 공식',
  '올리브영', 'SSENSE', '29CM', 'W컨셉', '브랜디', '쿠팡', '네이버쇼핑',
  '11번가', 'G마켓', '옥션', 'SSG닷컴'
];

const statuses = [
  {
    value: 'available',
    label: '구매 가능',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    value: 'soldout',
    label: '품절',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    value: 'restock',
    label: '재입고 대기',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    value: 'sale',
    label: '세일중',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
  }
];

const popularHashtags = [
  '#조던4', '#에어팟맥스', '#디올립글로우', '#나이키', '#스니커즈',
  '#데일리룩', '#OOTD', '#커피스타그램', '#테크', '#뷰티'
];

const mockProductNames = [
  '조던 4 레트로 브레드',
  '조던 4 화이트 시멘트',
  '조던 4 유니버시티 블루',
  '조던 1 시카고',
  '조던 1 로열'
];

const canSubmit = computed(() => {
  return selectedPhotos.value.length > 0 &&
      uploadedFileIds.value.length > 0 &&
      formData.value.productName &&
      formData.value.category &&
      !isSubmitting.value;
});

// Drag & Drop handlers
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

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files);
  const remainingSlots = 5 - selectedPhotos.value.length;

  if (files.length === 0) return;

  const filesToAdd = files.slice(0, remainingSlots);

  for (const file of filesToAdd) {
    if (!fileService.isImageFile(file)) {
      showError('이미지 파일만 업로드 가능합니다.');
      continue;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError(`${file.name}의 크기가 10MB를 초과합니다.`);
      continue;
    }

    try {
      const previewResult = await fileService.createPreview(file);

      if (previewResult.success) {
        const photoItem = {
          id: Date.now() + Math.random(),
          file: file,
          preview: previewResult.previewUrl,
          uploading: false,
          progress: 0,
          fileId: null
        };

        selectedPhotos.value.push(photoItem);
        await uploadPhotoToServer(photoItem);
      }
    } catch (error) {
      console.error('미리보기 생성 실패:', error);
      showError('이미지 미리보기 생성에 실패했습니다.');
    }
  }

  event.target.value = '';
};

const uploadPhotoToServer = async (photo) => {
  photo.uploading = true;
  photo.progress = 0;

  try {
    const uploadResult = await fileService.uploadImage(photo.file, 'FEED');

    if (uploadResult.success) {
      photo.fileId = uploadResult.data.id;
      photo.progress = 100;
      uploadedFileIds.value.push(uploadResult.data.id);
      console.log('✅ 파일 업로드 성공:', uploadResult.data);
    } else {
      throw new Error(uploadResult.error || '파일 업로드 실패');
    }
  } catch (error) {
    console.error('❌ 파일 업로드 실패:', error);
    showError(error.message || '사진 업로드에 실패했습니다.');
  } finally {
    photo.uploading = false;
  }
};

const removePhoto = (index) => {
  const photo = selectedPhotos.value[index];

  if (photo.fileId) {
    const fileIdIndex = uploadedFileIds.value.indexOf(photo.fileId);
    if (fileIdIndex > -1) {
      uploadedFileIds.value.splice(fileIdIndex, 1);
    }

    fileService.remove(photo.fileId).catch(error => {
      console.warn('파일 삭제 실패:', error);
    });
  }

  selectedPhotos.value.splice(index, 1);
};

const openCamera = () => {
  showError('카메라 기능은 준비 중입니다.');
};

const selectCategory = (value) => {
  formData.value.category = value;
  formData.value.subCategory = '';
  showCategoryDropdown.value = false;
};

const getCategoryLabel = (value) => {
  const cat = categories.find(c => c.value === value);
  return cat ? cat.label : '';
};

const getCategoryIcon = (value) => {
  const cat = categories.find(c => c.value === value);
  return cat ? cat.icon : '';
};

const handleProductNameInput = () => {
  if (formData.value.productName.length >= 2) {
    productSuggestions.value = mockProductNames.filter(name =>
        name.toLowerCase().includes(formData.value.productName.toLowerCase())
    );
  } else {
    productSuggestions.value = [];
  }
};

const selectSuggestion = (suggestion) => {
  formData.value.productName = suggestion;
  productSuggestions.value = [];
};

const addHashtag = () => {
  if (!hashtagInput.value.trim() || formData.value.hashtags.length >= 5) return;

  let tag = hashtagInput.value.trim();
  if (!tag.startsWith('#')) {
    tag = '#' + tag;
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

const handleCancel = () => {
  if (selectedPhotos.value.length > 0 || formData.value.productName || formData.value.review) {
    showCancelDialog.value = true;
  } else {
    router.back();
  }
};

const confirmCancel = async () => {
  if (uploadedFileIds.value.length > 0) {
    await fileService.removeMultiple(uploadedFileIds.value).catch(error => {
      console.warn('임시 파일 삭제 실패:', error);
    });
  }

  showCancelDialog.value = false;
  router.back();
};

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    const feedData = {
      productName: formData.value.productName,
      category: formData.value.category,
      subCategory: formData.value.subCategory,
      review: formData.value.review,
      store: formData.value.store === 'direct' ? formData.value.storeCustom : formData.value.store,
      price: formData.value.priceHidden ? null : formData.value.price,
      status: formData.value.status,
      hashtags: formData.value.hashtags,
      fileIds: uploadedFileIds.value
    };

    console.log('📤 피드 생성 요청:', feedData);

    // TODO: 실제 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000));

    isSubmitting.value = false;
    showSuccessToast.value = true;

    setTimeout(() => {
      router.push('/feed');
    }, 1500);

  } catch (error) {
    console.error('❌ 피드 생성 실패:', error);
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

onMounted(() => {
  console.log('✅ FeedCreateView 마운트 완료');
  fileService.debugStatus();
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

/* Category Dropdown */
.category-dropdown {
  position: relative;
}

.category-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
}

.category-select-btn:hover {
  border-color: var(--accent);
}

.selected-category {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.placeholder {
  color: var(--secondary);
}

.category-icon-svg {
  width: 20px;
  height: 20px;
  color: var(--accent);
  stroke-width: 2;
  flex-shrink: 0;
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  color: var(--secondary);
  transition: transform 0.2s;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.category-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 10;
}

.category-dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 15px;
  font-weight: 500;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.category-dropdown-item:hover {
  background: var(--hover);
}

.category-dropdown-item.active {
  background: #FFF7ED;
  color: var(--accent);
  font-weight: 600;
}

.category-dropdown-item.active .category-icon-svg {
  color: var(--accent);
}

.sub-category-wrapper {
  margin-top: 16px;
}

.sub-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sub-category-btn {
  padding: 10px 16px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.sub-category-btn:hover {
  border-color: var(--accent);
  background: #FFF7ED;
}

.sub-category-btn.active {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
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