<template>
  <div class="product-create-container">

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

          <!-- 필수 정보 안내 -->
          <div class="required-notice">
            <span class="notice-icon">ℹ️</span>
            <span class="notice-text">
              <span class="required">*</span> 표시는 필수 입력 항목입니다.
            </span>
          </div>

          <!-- 기본 정보 섹션 -->
          <div class="form-section">
            <h3 class="section-title">
              📝 기본 정보
              <span class="section-badge required-badge">필수</span>
            </h3>

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
                    :class="{
                      'error': errors.name,
                      'success': form.name.length >= 2 && !errors.name
                    }"
                    placeholder="정확한 제품명을 입력해주세요 (예: 스타벅스 콜드브루 커피)"
                    maxlength="100"
                    required
                    @blur="validateField('name')"
                    @input="validateField('name')"
                    :disabled="!isLoggedIn"
                >
                <div class="input-footer">
                  <div v-if="errors.name" class="validation-message error">
                    {{ errors.name }}
                  </div>
                  <div v-else-if="form.name.length >= 2" class="validation-message success">
                    ✓ 올바른 제품명입니다
                  </div>
                  <div v-else class="form-help">
                    브랜드명과 제품명을 정확히 입력해주세요
                  </div>
                  <div class="char-counter" :class="{ 'warning': form.name.length > 90 }">
                    {{ form.name.length }}/100
                  </div>
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
                    :class="{
                      'error': errors.brand,
                      'success': form.brand.length >= 1 && !errors.brand
                    }"
                    placeholder="예: 스타벅스, CU, 맥도날드"
                    maxlength="100"
                    required
                    @blur="validateField('brand')"
                    @input="validateField('brand')"
                    :disabled="!isLoggedIn"
                >
                <div v-if="errors.brand" class="validation-message error">
                  {{ errors.brand }}
                </div>
                <div v-else-if="form.brand.length >= 1" class="validation-message success">
                  ✓ 확인됨
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
                    :class="{
                      'error': errors.categoryId,
                      'success': form.categoryId && !errors.categoryId,
                      'placeholder': !form.categoryId
                    }"
                    required
                    @change="validateField('categoryId')"
                    :disabled="!isLoggedIn"
                >
                  <option value="" disabled>카테고리를 선택하세요</option>
                  <option
                      v-for="category in categories"
                      :key="category.categoryId"
                      :value="category.categoryId"
                  >
                    {{ category.categoryName }}
                  </option>
                </select>
                <div v-if="errors.categoryId" class="validation-message error">
                  {{ errors.categoryId }}
                </div>
                <div v-else-if="form.categoryId" class="validation-message success">
                  ✓ 선택 완료
                </div>
              </div>

              <!-- 정가 -->
              <div class="form-group">
                <label class="form-label">
                  정가 <span class="optional">(선택)</span>
                </label>
                <div class="price-input-container">
                  <input
                      v-model="form.price"
                      type="text"
                      class="form-input"
                      :class="{ 'success': form.price && !errors.price }"
                      placeholder="0"
                      pattern="[0-9]*"
                      maxlength="10"
                      :disabled="!isLoggedIn"
                      @input="validatePrice"
                  >
                  <span class="price-unit">원</span>
                </div>
                <div v-if="errors.price" class="validation-message error">
                  {{ errors.price }}
                </div>
                <div v-else class="form-help">
                  브랜드 공식 판매가격
                </div>
              </div>

              <!-- 출시일 -->
              <div class="form-group">
                <label class="form-label">
                  출시일 <span class="optional">(선택)</span>
                </label>
                <input
                    v-model="form.releaseDate"
                    type="date"
                    class="form-input"
                    :class="{ 'success': form.releaseDate }"
                    :max="today"
                    :disabled="!isLoggedIn"
                >
                <div class="form-help">
                  브랜드 공식 출시일
                </div>
              </div>
            </div>
          </div>

          <!-- 상세 정보 섹션 -->
          <div class="form-section">
            <h3 class="section-title">
              📋 상세 정보
              <span class="section-badge optional-badge">선택</span>
            </h3>

            <!-- 제품 설명 -->
            <div class="form-group">
              <label class="form-label">
                제품 설명 <span class="optional">(선택)</span>
              </label>
              <textarea
                  v-model="form.description"
                  class="form-input form-textarea"
                  :class="{ 'success': form.description.length > 0 }"
                  placeholder="제품의 특징, 맛, 용량, 성분 등을 자세히 설명해주세요&#10;&#10;예시:&#10;- 진한 콜드브루 원액에 부드러운 우유를 더한 시그니처 음료&#10;- 용량: 275ml&#10;- 칼로리: 150kcal"
                  maxlength="1000"
                  :disabled="!isLoggedIn"
                  rows="6"
              ></textarea>
              <div class="input-footer">
                <div v-if="form.description.length > 0" class="form-help">
                  구매자가 제품을 잘 이해할 수 있도록 상세히 작성해주세요
                </div>
                <div class="char-counter" :class="{ 'warning': form.description.length > 900 }">
                  {{ form.description.length }}/1000
                </div>
              </div>
            </div>

            <!-- 판매처 -->
            <div class="form-group">
              <label class="form-label">
                판매처/유통업체 <span class="optional">(선택)</span>
              </label>
              <input
                  v-model="form.distributor"
                  type="text"
                  class="form-input"
                  :class="{ 'success': form.distributor.length > 0 }"
                  placeholder="예: 편의점(GS25, CU, 세븐일레븐), 대형마트, 온라인몰"
                  maxlength="1000"
                  :disabled="!isLoggedIn"
              >
              <div class="form-help">
                어디서 구매할 수 있는지 입력해주세요
              </div>
            </div>

            <!-- 주요 특징 -->
            <div class="form-group">
              <label class="form-label">
                주요 특징 <span class="optional">(선택)</span>
              </label>
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
                  <span class="checkbox-label">{{ feature }}</span>
                </label>
              </div>
              <div class="custom-feature-wrapper">
                <input
                    v-model="customFeature"
                    type="text"
                    placeholder="직접 입력 후 Enter를 눌러 추가"
                    class="form-input custom-feature-input"
                    @keydown.enter.prevent="addCustomFeature"
                    :disabled="!isLoggedIn"
                >
                <button
                    type="button"
                    class="btn-add-feature"
                    @click="addCustomFeature"
                    :disabled="!isLoggedIn || !customFeature.trim()"
                >
                  추가
                </button>
              </div>
              <div v-if="selectedFeatures.length > 0" class="selected-count">
                {{ selectedFeatures.length }}개 선택됨
              </div>
            </div>

            <!-- 태그 -->
            <div class="form-group">
              <label class="form-label">
                검색 태그 <span class="optional">(선택)</span>
                <span class="label-hint">최대 10개</span>
              </label>
              <div class="tag-input-container"
                   :class="{
                     'disabled': !isLoggedIn,
                     'has-tags': selectedTags.length > 0
                   }"
                   @click="isLoggedIn && focusTagInput()">
                <div
                    v-for="(tag, index) in selectedTags"
                    :key="index"
                    class="tag-item"
                >
                  <span class="tag-text">{{ tag }}</span>
                  <span class="tag-remove"
                        @click.stop="isLoggedIn && removeTag(index)">×</span>
                </div>
                <input
                    ref="tagInput"
                    v-model="currentTag"
                    type="text"
                    class="tag-input"
                    :placeholder="selectedTags.length === 0 ? '태그를 입력하고 Enter를 눌러주세요 (예: 달콤한, 쌉싸름한)' : ''"
                    @keydown.enter.prevent="addTag"
                    @keydown.backspace="handleBackspace"
                    :disabled="!isLoggedIn || selectedTags.length >= 10"
                >
              </div>
              <div class="input-footer">
                <div class="form-help">
                  검색에 도움이 되는 키워드를 입력해주세요
                </div>
                <div v-if="selectedTags.length > 0" class="selected-count">
                  {{ selectedTags.length }}/10
                </div>
              </div>
            </div>
          </div>

          <!-- 이미지 업로드 섹션 -->
          <div class="form-section">
            <h3 class="section-title">
              📷 제품 이미지
              <span class="section-badge required-badge">필수</span>
            </h3>

            <!-- 대표 이미지 업로드 -->
            <div class="form-group">
              <label class="form-label">
                대표 이미지 <span class="required">*</span>
              </label>
              <div class="image-requirement-box">
                <div class="requirement-item">
                  <span class="req-icon">📐</span>
                  <span class="req-text">권장 비율: 1:1 (정사각형)</span>
                </div>
                <div class="requirement-item">
                  <span class="req-icon">📦</span>
                  <span class="req-text">최대 용량: 5MB</span>
                </div>
                <div class="requirement-item">
                  <span class="req-icon">🎨</span>
                  <span class="req-text">형식: PNG, JPG, JPEG</span>
                </div>
              </div>

              <!-- 대표 이미지 업로드 영역 -->
              <div
                  class="image-upload-area thumbnail-upload"
                  :class="{
                    'dragover': isThumbnailDragOver,
                    'disabled': !isLoggedIn || thumbnailFile !== null,
                    'has-image': thumbnailFile !== null,
                    'error': errors.thumbnail
                  }"
                  @click="isLoggedIn && !thumbnailFile && triggerThumbnailInput()"
                  @drop.prevent="isLoggedIn && !thumbnailFile && handleThumbnailDrop($event)"
                  @dragover.prevent="isLoggedIn && !thumbnailFile && handleThumbnailDragOver($event)"
                  @dragleave="isLoggedIn && handleThumbnailDragLeave()"
              >
                <template v-if="!thumbnailFile">
                  <div class="upload-icon">🖼️</div>
                  <div class="upload-text">
                    <template v-if="isLoggedIn">
                      <strong>클릭</strong>하거나 <strong>드래그</strong>하여 이미지 업로드
                    </template>
                    <template v-else>
                      로그인 후 이미지를 업로드할 수 있습니다
                    </template>
                  </div>
                  <div class="upload-hint" v-if="isLoggedIn">
                    제품의 대표 이미지를 등록해주세요
                  </div>
                </template>

                <template v-else>
                  <div class="thumbnail-preview">
                    <div class="image-badge success-badge">✓ 대표 이미지</div>
                    <img
                        :src="thumbnailFile.preview"
                        :alt="thumbnailFile.name"
                        class="preview-image-large"
                    >
                    <button
                        type="button"
                        class="preview-remove-large"
                        @click.stop="removeThumbnail"
                        :disabled="!isLoggedIn"
                        title="이미지 제거"
                    >
                      ×
                    </button>
                    <div class="file-info-overlay">
                      <div class="file-name">{{ thumbnailFile.name }}</div>
                      <div class="file-size">{{ formatFileSize(thumbnailFile.size) }}</div>
                    </div>
                  </div>
                </template>

                <input
                    ref="thumbnailInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleThumbnailSelect"
                    :disabled="!isLoggedIn"
                >
              </div>

              <div v-if="errors.thumbnail" class="validation-message error">
                {{ errors.thumbnail }}
              </div>
              <div v-else-if="thumbnailFile" class="validation-message success">
                ✓ 대표 이미지가 등록되었습니다
              </div>
            </div>

            <!-- 추가 이미지 업로드 -->
            <div class="form-group">
              <label class="form-label">
                추가 이미지 <span class="optional">(선택)</span>
                <span class="label-hint">최대 4개</span>
              </label>
              <div class="image-info">
                <span class="info-icon">💡</span>
                <span>제품의 다양한 각도나 상세 이미지를 추가로 등록할 수 있습니다</span>
              </div>

              <!-- 추가 이미지 업로드 영역 -->
              <div
                  class="image-upload-area additional-upload"
                  :class="{
                    'dragover': isAdditionalDragOver,
                    'disabled': !isLoggedIn || additionalFiles.length >= 4
                  }"
                  @click="isLoggedIn && additionalFiles.length < 4 && triggerAdditionalInput()"
                  @drop.prevent="isLoggedIn && additionalFiles.length < 4 && handleAdditionalDrop($event)"
                  @dragover.prevent="isLoggedIn && additionalFiles.length < 4 && handleAdditionalDragOver($event)"
                  @dragleave="isLoggedIn && handleAdditionalDragLeave()"
              >
                <div class="upload-icon">📷</div>
                <div class="upload-text">
                  <template v-if="isLoggedIn">
                    <template v-if="additionalFiles.length < 4">
                      <strong>클릭</strong>하거나 <strong>드래그</strong>하여 추가 이미지 업로드
                    </template>
                    <template v-else>
                      최대 4개까지 업로드 가능합니다
                    </template>
                  </template>
                  <template v-else>
                    로그인 후 이미지를 업로드할 수 있습니다
                  </template>
                </div>
                <div class="upload-hint" v-if="isLoggedIn && additionalFiles.length < 4">
                  <span class="upload-count">{{ additionalFiles.length }}/4</span>
                  <span>PNG, JPG, JPEG • 최대 5MB</span>
                </div>
                <input
                    ref="additionalInput"
                    type="file"
                    accept="image/*"
                    multiple
                    style="display: none"
                    @change="handleAdditionalSelect"
                    :disabled="!isLoggedIn"
                >
              </div>

              <!-- 추가 이미지 미리보기 -->
              <div v-if="additionalFiles.length > 0" class="image-preview-grid">
                <div class="preview-header">
                  <span class="preview-title">등록된 추가 이미지</span>
                  <span class="preview-count">{{ additionalFiles.length }}/4</span>
                </div>
                <div class="image-preview">
                  <div
                      v-for="(file, index) in additionalFiles"
                      :key="index"
                      class="preview-item"
                  >
                    <div class="image-badge">{{ index + 1 }}</div>
                    <img
                        :src="file.preview"
                        :alt="file.name"
                        class="preview-image"
                    >
                    <button
                        type="button"
                        class="preview-remove"
                        @click="removeAdditionalImage(index)"
                        :disabled="!isLoggedIn"
                        title="이미지 제거"
                    >
                      ×
                    </button>
                    <div class="file-info">
                      <div class="file-name" :title="file.name">{{ file.name }}</div>
                      <div class="file-size">{{ formatFileSize(file.size) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="errors.additionalImages" class="validation-message error">
                {{ errors.additionalImages }}
              </div>
            </div>
          </div>

          <!-- 작성 완료율 표시 -->
          <div class="completion-status">
            <div class="status-header">
              <span class="status-title">작성 완료율</span>
              <span class="status-percentage">{{ completionPercentage }}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: completionPercentage + '%' }"></div>
            </div>
            <div class="status-items">
              <div class="status-item" :class="{ 'completed': form.name.trim() }">
                <span class="status-icon">{{ form.name.trim() ? '✓' : '○' }}</span>
                <span class="status-text">제품명</span>
              </div>
              <div class="status-item" :class="{ 'completed': form.brand.trim() }">
                <span class="status-icon">{{ form.brand.trim() ? '✓' : '○' }}</span>
                <span class="status-text">브랜드</span>
              </div>
              <div class="status-item" :class="{ 'completed': form.categoryId }">
                <span class="status-icon">{{ form.categoryId ? '✓' : '○' }}</span>
                <span class="status-text">카테고리</span>
              </div>
              <div class="status-item" :class="{ 'completed': thumbnailFile }">
                <span class="status-icon">{{ thumbnailFile ? '✓' : '○' }}</span>
                <span class="status-text">대표이미지</span>
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
              <span class="btn-icon">←</span>
              <span>취소</span>
            </button>
            <button
                type="submit"
                class="btn btn-primary btn-submit"
                :disabled="!canSubmit"
                :class="{
                  'loading': isLoading,
                  'disabled': !isLoggedIn || !isFormValid
                }"
            >
              <span v-if="isLoading" class="btn-content">
                <span class="spinner-small"></span>
                <span>등록 중...</span>
              </span>
              <span v-else-if="!isLoggedIn" class="btn-content">
                <span class="btn-icon">🔒</span>
                <span>로그인 필요</span>
              </span>
              <span v-else-if="!isFormValid" class="btn-content">
                <span class="btn-icon">⚠️</span>
                <span>필수 항목 입력 필요 ({{ completionPercentage }}%)</span>
              </span>
              <span v-else class="btn-content">
                <span class="btn-icon">✓</span>
                <span>제품 등록하기</span>
              </span>
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
import { useProduct } from '@/composables/useProduct.js'
import { useCategory } from '@/services/CategoryService.js'
import { useFile } from '@/services/FileService.js'
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
  validateProductData
} = useProduct()

// Category Service
const {
  getCategories
} = useCategory()

// File Service
const {
  uploadImage,
  validateFile,
  isImageFile,
  createPreview,
  formatFileSize
} = useFile()

// 반응형 상태
const isLoading = ref(false)
const isThumbnailDragOver = ref(false)
const isAdditionalDragOver = ref(false)
const showSuccessModal = ref(false)
const showLoginModal = ref(false)
const categories = ref([])

// 대표 이미지 상태
const thumbnailFile = ref(null)

// 추가 이미지 상태
const additionalFiles = ref([])

const selectedFeatures = ref([])
const selectedTags = ref([])
const currentTag = ref('')
const customFeature = ref('')

// 폼 레퍼런스
const productForm = ref(null)
const thumbnailInput = ref(null)
const additionalInput = ref(null)
const tagInput = ref(null)

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

// 에러 상태
const errors = reactive({
  name: '',
  brand: '',
  categoryId: '',
  price: '',
  thumbnail: '',
  additionalImages: '',
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

const completionPercentage = computed(() => {
  let completed = 0
  const total = 4 // 필수 항목 개수

  if (form.name.trim()) completed++
  if (form.brand.trim()) completed++
  if (form.categoryId) completed++
  if (thumbnailFile.value) completed++

  return Math.round((completed / total) * 100)
})

const isFormValid = computed(() => {
  return isLoggedIn.value &&
      form.name.trim() &&
      form.brand.trim() &&
      form.categoryId &&
      thumbnailFile.value !== null &&
      Object.values(errors).every(error => !error)
})

const canSubmit = computed(() => {
  return isFormValid.value &&
      !isLoading.value &&
      !authLoading.value
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
  console.log('🔄 [PRODUCT] 로그인 상태 변경:', {newValue, oldValue})

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

  if (thumbnailFile.value?.preview) {
    URL.revokeObjectURL(thumbnailFile.value.preview)
  }

  additionalFiles.value.forEach(fileObj => {
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

    const response = await getCategories({isActive: true})

    if (response.success && response.data) {
      categories.value = response.data
      console.log('✅ [PRODUCT] 카테고리 로드 성공:', categories.value.length)
    } else {
      console.warn('[PRODUCT] 카테고리 API 실패, 기본값 사용:', response.error)
      categories.value = getDefaultCategories()
    }
  } catch (error) {
    console.error('[PRODUCT] 카테고리 로드 에러:', error)
    categories.value = getDefaultCategories()
  }
}

const getDefaultCategories = () => {
  return [
    {categoryId: 1, categoryName: '프라모델', isActive: true},
    {categoryId: 2, categoryName: '피규어', isActive: true},
    {categoryId: 3, categoryName: '블록완구', isActive: true},
    {categoryId: 4, categoryName: '음료', isActive: true},
    {categoryId: 5, categoryName: '과자/스낵', isActive: true},
    {categoryId: 6, categoryName: '기타', isActive: true}
  ]
}

// === 폼 검증 ===

const validateField = (fieldName) => {
  errors[fieldName] = ''

  switch (fieldName) {
    case 'name':
      if (!form.name.trim()) {
        errors.name = '제품명은 필수입니다.'
      } else if (form.name.length < 2) {
        errors.name = '제품명은 최소 2자 이상 입력해주세요.'
      } else if (form.name.length > 100) {
        errors.name = '제품명은 최대 100자까지 입력 가능합니다.'
      }
      break

    case 'brand':
      if (!form.brand.trim()) {
        errors.brand = '브랜드명은 필수입니다.'
      } else if (form.brand.length > 100) {
        errors.brand = '브랜드명은 최대 100자까지 입력 가능합니다.'
      }
      break

    case 'categoryId':
      if (!form.categoryId) {
        errors.categoryId = '카테고리를 선택해주세요.'
      } else if (form.categoryId <= 0) {
        errors.categoryId = '올바른 카테고리를 선택해주세요.'
      }
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('brand')
  validateField('categoryId')

  if (!thumbnailFile.value) {
    errors.thumbnail = '대표 이미지는 필수입니다.'
  } else {
    errors.thumbnail = ''
  }

  errors.additionalImages = ''

  const hasErrors = Object.values(errors).some(error => error !== '')

  if (hasErrors) {
    console.log('❌ [PRODUCT] 검증 실패:', errors)
  }

  return !hasErrors
}

const validatePrice = () => {
  errors.price = ''

  form.price = form.price.replace(/[^0-9]/g, '')

  if (form.price && form.price.length > 10) {
    form.price = form.price.substring(0, 10)
    errors.price = '가격은 최대 10자리까지 입력할 수 있습니다.'
  }
}

// === 대표 이미지 처리 ===

const triggerThumbnailInput = () => {
  thumbnailInput.value?.click()
}

const handleThumbnailSelect = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    await processThumbnailFile(files[0])
  }
  event.target.value = ''
}

const handleThumbnailDrop = async (event) => {
  event.preventDefault()
  isThumbnailDragOver.value = false

  const files = Array.from(event.dataTransfer.files)
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length > 0) {
    await processThumbnailFile(imageFiles[0])
  }
}

const handleThumbnailDragOver = (event) => {
  event.preventDefault()
  isThumbnailDragOver.value = true
}

const handleThumbnailDragLeave = () => {
  isThumbnailDragOver.value = false
}

const processThumbnailFile = async (file) => {
  if (!isLoggedIn.value) {
    alert('로그인이 필요합니다.')
    return
  }

  errors.thumbnail = ''

  if (!isImageFile(file)) {
    errors.thumbnail = 'PNG, JPG, JPEG 파일만 업로드 가능합니다.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errors.thumbnail = '파일 크기는 5MB 이하만 업로드 가능합니다.'
    return
  }

  if (file.size === 0) {
    errors.thumbnail = '빈 파일은 업로드할 수 없습니다.'
    return
  }

  if (thumbnailFile.value?.preview) {
    URL.revokeObjectURL(thumbnailFile.value.preview)
  }

  const previewResult = await createPreview(file)
  if (!previewResult.success) {
    errors.thumbnail = '이미지 미리보기 생성에 실패했습니다.'
    console.error('미리보기 생성 실패:', previewResult.error)
    return
  }

  thumbnailFile.value = {
    file: file,
    name: file.name,
    size: file.size,
    preview: previewResult.previewUrl
  }

  console.log(`✅ [THUMBNAIL] 대표 이미지 추가: ${file.name}`)
}

const removeThumbnail = () => {
  if (!isLoggedIn.value) return

  if (thumbnailFile.value?.preview) {
    URL.revokeObjectURL(thumbnailFile.value.preview)
  }

  console.log(`🗑️ [THUMBNAIL] 대표 이미지 제거: ${thumbnailFile.value?.name}`)

  thumbnailFile.value = null
  errors.thumbnail = '대표 이미지는 필수입니다.'
}

// === 추가 이미지 처리 ===

const triggerAdditionalInput = () => {
  additionalInput.value?.click()
}

const handleAdditionalSelect = async (event) => {
  const files = Array.from(event.target.files)
  await processAdditionalFiles(files)
  event.target.value = ''
}

const handleAdditionalDrop = async (event) => {
  event.preventDefault()
  isAdditionalDragOver.value = false

  const files = Array.from(event.dataTransfer.files)
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  await processAdditionalFiles(imageFiles)
}

const handleAdditionalDragOver = (event) => {
  event.preventDefault()
  isAdditionalDragOver.value = true
}

const handleAdditionalDragLeave = () => {
  isAdditionalDragOver.value = false
}

const processAdditionalFiles = async (files) => {
  if (!isLoggedIn.value) {
    alert('로그인이 필요합니다.')
    return
  }

  const remainingSlots = 4 - additionalFiles.value.length

  if (files.length > remainingSlots) {
    alert(`추가 이미지는 최대 4개까지만 업로드할 수 있습니다. (현재: ${additionalFiles.value.length}/4)`)
    files = files.slice(0, remainingSlots)
  }

  errors.additionalImages = ''

  for (const file of files) {
    if (!isImageFile(file)) {
      alert(`${file.name}: PNG, JPG, JPEG 파일만 업로드 가능합니다.`)
      continue
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name}: 파일 크기는 5MB 이하만 업로드 가능합니다.`)
      continue
    }

    if (file.size === 0) {
      alert(`${file.name}: 빈 파일은 업로드할 수 없습니다.`)
      continue
    }

    const previewResult = await createPreview(file)
    if (!previewResult.success) {
      console.error('미리보기 생성 실패:', previewResult.error)
      continue
    }

    additionalFiles.value.push({
      file: file,
      name: file.name,
      size: file.size,
      preview: previewResult.previewUrl
    })

    console.log(`✅ [ADDITIONAL] 추가 이미지 추가: ${file.name}`)
  }
}

const removeAdditionalImage = (index) => {
  if (!isLoggedIn.value) return

  const fileObj = additionalFiles.value[index]

  if (fileObj.preview) {
    URL.revokeObjectURL(fileObj.preview)
  }

  console.log(`🗑️ [ADDITIONAL] 추가 이미지 제거: ${fileObj.name}`)

  additionalFiles.value.splice(index, 1)
}

// === 태그 처리 ===

const focusTagInput = () => {
  nextTick(() => {
    tagInput.value?.focus()
  })
}

const addTag = () => {
  const tag = currentTag.value.trim()

  if (!tag) {
    return
  }

  if (selectedTags.value.includes(tag)) {
    alert('이미 추가된 태그입니다.')
    currentTag.value = ''
    return
  }

  if (selectedTags.value.length >= 10) {
    alert('태그는 최대 10개까지만 추가할 수 있습니다.')
    return
  }

  selectedTags.value.push(tag)
  currentTag.value = ''
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

  if (!feature) {
    return
  }

  if (selectedFeatures.value.includes(feature)) {
    alert('이미 추가된 특징입니다.')
    customFeature.value = ''
    return
  }

  selectedFeatures.value.push(feature)
  customFeature.value = ''
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

  if (!thumbnailFile.value) {
    alert('대표 이미지는 필수입니다.')
    return
  }

  if (!validateForm()) {
    alert('입력 정보를 확인해주세요.')
    return
  }

  isLoading.value = true

  try {
    console.log('📤 [THUMBNAIL] 대표 이미지 업로드 시작')
    const thumbnailUploadResult = await uploadImage(thumbnailFile.value.file, 'PRODUCT')

    if (!thumbnailUploadResult.success) {
      throw new Error(`대표 이미지 업로드 실패: ${thumbnailUploadResult.error}`)
    }

    console.log('✅ [THUMBNAIL] 대표 이미지 업로드 완료:', thumbnailUploadResult.data)

    const additionalUploadResults = []

    if (additionalFiles.value.length > 0) {
      console.log('📤 [ADDITIONAL] 추가 이미지 업로드 시작')

      for (const fileObj of additionalFiles.value) {
        const uploadResult = await uploadImage(fileObj.file, 'PRODUCT')

        if (!uploadResult.success) {
          throw new Error(`추가 이미지 업로드 실패: ${uploadResult.error}`)
        }

        console.log('✅ [ADDITIONAL] 추가 이미지 업로드 완료:', uploadResult.data)
        additionalUploadResults.push(uploadResult.data)
      }
    }

    const thumbnailAttachmentInfo = {
      fileId: thumbnailUploadResult.data.id,
      storedPath: thumbnailUploadResult.data.fileUrl,
      originName: thumbnailUploadResult.data.orgFileNm,
      fileSize: thumbnailUploadResult.data.fileSize,
      contentType: thumbnailUploadResult.data.fileExt
          ? `image/${thumbnailUploadResult.data.fileExt}` : 'image/jpeg',
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

    console.log('📦 [PRODUCT] thumbnailAttachmentInfo:',
        JSON.stringify(thumbnailAttachmentInfo, null, 2))
    console.log('📦 [PRODUCT] attachmentFileInfos:', JSON.stringify(attachmentFileInfos, null, 2))

    const allFeatures = [...selectedFeatures.value]
    if (customFeature.value.trim()) {
      allFeatures.push(customFeature.value.trim())
    }

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
      thumbnailAttachmentInfo: thumbnailAttachmentInfo,
      attachmentFileInfos: attachmentFileInfos
    }

    console.log('📤 [PRODUCT] 최종 전송 데이터:', JSON.stringify(productData, null, 2))

    const response = await createProduct(productData)

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
    form: {...form},
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
      thumbnailFile.value !== null ||
      additionalFiles.value.length > 0 ||
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

.image-info {
  font-size: 13px;
  color: #495057;
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
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
  position: relative;
}

.image-upload-area:hover:not(.disabled):not(.has-image) {
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

.image-upload-area.thumbnail-upload {
  min-height: 300px;
}

.image-upload-area.thumbnail-upload.has-image {
  padding: 0;
  border: 2px solid #007bff;
}

.image-upload-area.additional-upload {
  min-height: 150px;
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

/* === 대표 이미지 미리보기 === */
.thumbnail-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.preview-image-large {
  width: 100%;
  height: 100%;
  min-height: 300px;
  object-fit: contain;
  border-radius: 10px;
}

.preview-remove-large {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
}

.preview-remove-large:hover:not(:disabled) {
  background-color: #dc3545;
  transform: scale(1.1);
}

.preview-remove-large:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  border-radius: 0 0 10px 10px;
}

.file-info-overlay .file-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-info-overlay .file-size {
  font-size: 12px;
  opacity: 0.9;
}

/* === 추가 이미지 미리보기 === */
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
  transition: all 0.2s ease;
}

.preview-remove:hover:not(:disabled) {
  background-color: #dc3545;
  transform: scale(1.1);
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
/* === UI/UX 개선 추가 스타일 === */

/* 필수 정보 안내 */
.required-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%);
  border: 1px solid #ffc107;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #856404;
}

.notice-icon {
  font-size: 18px;
}

.notice-text {
  flex: 1;
  font-weight: 500;
}

/* 섹션 배지 */
.section-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 8px;
}

.required-badge {
  background-color: #fee;
  color: #dc3545;
}

.optional-badge {
  background-color: #e8f5e9;
  color: #28a745;
}

/* 레이블 개선 */
.optional {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  font-style: italic;
}

.label-hint {
  font-size: 11px;
  font-weight: 500;
  color: #6c757d;
  background-color: #f8f9fa;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

/* 입력 필드 상태별 스타일 */
.form-input.success {
  border-color: #28a745;
  background-color: #f8fff9;
}

.form-input.placeholder {
  color: #adb5bd;
}

/* 입력 푸터 */
.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  gap: 12px;
}

/* 검증 메시지 개선 */
.validation-message.error {
  color: #dc3545;
}

.validation-message.error::before {
  content: '⚠️';
  font-size: 14px;
}

.validation-message.success {
  color: #28a745;
  font-size: 13px;
}

.validation-message.success::before {
  content: '';
}

/* 문자 카운터 개선 */
.char-counter.warning {
  color: #ffc107;
  font-weight: 600;
}

/* 선택된 항목 카운트 */
.selected-count {
  font-size: 12px;
  color: #007bff;
  font-weight: 600;
  padding: 4px 8px;
  background-color: #e3f2fd;
  border-radius: 10px;
  white-space: nowrap;
}

/* 이미지 정보 박스 개선 */
.image-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  font-size: 16px;
}

/* 이미지 요구사항 박스 */
.image-requirement-box {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #dee2e6;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #495057;
}

.req-icon {
  font-size: 18px;
}

.req-text {
  font-weight: 500;
}

/* 이미지 배지 */
.image-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 10px;
  background-color: rgba(0, 123, 255, 0.9);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  z-index: 5;
  backdrop-filter: blur(4px);
}

.image-badge.success-badge {
  background-color: rgba(40, 167, 69, 0.9);
}

/* 이미지 업로드 영역 개선 */
.image-upload-area.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

/* 추가 이미지 프리뷰 그리드 */
.image-preview-grid {
  margin-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
  border: 1px solid #e9ecef;
  border-bottom: none;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.preview-count {
  font-size: 13px;
  font-weight: 600;
  color: #007bff;
  background-color: #e3f2fd;
  padding: 4px 10px;
  border-radius: 12px;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px;
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 0 0 8px 8px;
}

/* 체크박스 개선 */
.checkbox-label {
  user-select: none;
}

/* 커스텀 특징 입력 래퍼 */
.custom-feature-wrapper {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.custom-feature-wrapper .form-input {
  flex: 1;
}

.btn-add-feature {
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-add-feature:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.btn-add-feature:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

/* 태그 입력 개선 */
.tag-input-container.has-tags {
  background-color: #f8f9fa;
}

.tag-text {
  user-select: none;
}

/* 업로드 카운트 */
.upload-count {
  display: inline-block;
  padding: 2px 8px;
  background-color: #007bff;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  margin-right: 8px;
}

/* 작성 완료율 */
.completion-status {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
}

.status-percentage {
  font-size: 24px;
  font-weight: 700;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.status-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.status-item.completed {
  background-color: rgba(40, 167, 69, 0.3);
}

.status-icon {
  font-size: 16px;
  font-weight: bold;
}

.status-text {
  font-size: 13px;
  font-weight: 500;
}

/* 제출 버튼 개선 */
.btn-submit {
  min-width: 250px;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  font-size: 16px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 반응형 개선 */
@media (max-width: 1024px) {
  .image-requirement-box {
    grid-template-columns: 1fr;
  }

  .status-items {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .btn-submit {
    min-width: 100%;
  }

  .status-items {
    grid-template-columns: 1fr;
  }

  .custom-feature-wrapper {
    flex-direction: column;
  }

  .btn-add-feature {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .completion-status {
    padding: 16px;
  }

  .status-percentage {
    font-size: 20px;
  }
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

  .image-upload-area.thumbnail-upload {
    min-height: 200px;
  }

  .thumbnail-preview {
    min-height: 200px;
  }

  .preview-image-large {
    min-height: 200px;
  }
}

@media (max-width: 480px) {
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
</style>