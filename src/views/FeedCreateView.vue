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
        게시
      </button>
    </header>

    <!-- Main Content -->
    <main class="create-content">
      <!-- Step 1: Photo Selection -->
      <section v-if="currentStep === 1" class="step-section photo-step">
        <div class="step-header">
          <h2 class="step-title">
            <span class="step-number">1</span>
            사진 선택
          </h2>
          <p class="step-desc">최대 5장까지 추가할 수 있어요</p>
        </div>

        <!-- Selected Photos -->
        <div v-if="selectedPhotos.length > 0" class="selected-photos">
          <draggable
              v-model="selectedPhotos"
              class="photo-grid"
              item-key="id"
          >
            <template #item="{ element, index }">
              <div class="photo-item">
                <img :src="element.preview" :alt="`Photo ${index + 1}`" />
                <button class="btn-remove" @click="removePhoto(index)">
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                  </svg>
                </button>
                <div class="photo-order">{{ index + 1 }}</div>
              </div>
            </template>
          </draggable>
        </div>

        <!-- Add Photo Buttons -->
        <div class="photo-actions">
          <label class="btn-photo-action">
            <input
                type="file"
                accept="image/*"
                multiple
                @change="handleFileSelect"
                style="display: none;"
            />
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>갤러리에서 선택</span>
          </label>

          <button class="btn-photo-action" @click="openCamera">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>카메라로 촬영</span>
          </button>
        </div>

        <!-- Tips -->
        <div class="tips-box">
          <h3 class="tips-title">📸 좋은 인증 사진 꿀팁</h3>
          <ul class="tips-list">
            <li>자연광에서 찍으면 색감이 더 잘 나와요</li>
            <li>제품 전체가 나오게 찍어주세요</li>
            <li>배경은 심플할수록 좋아요</li>
            <li>여러 각도에서 찍은 사진을 올려보세요</li>
          </ul>
        </div>

        <button
            class="btn-next"
            :disabled="selectedPhotos.length === 0"
            @click="nextStep"
        >
          다음
        </button>
      </section>

      <!-- Step 2: Product Info -->
      <section v-if="currentStep === 2" class="step-section info-step">
        <div class="step-header">
          <h2 class="step-title">
            <span class="step-number">2</span>
            제품 정보
          </h2>
          <p class="step-desc">어떤 제품인지 알려주세요</p>
        </div>

        <!-- Photo Preview -->
        <div class="preview-photos">
          <div
              v-for="(photo, idx) in selectedPhotos.slice(0, 3)"
              :key="idx"
              class="preview-photo"
          >
            <img :src="photo.preview" alt="Preview" />
          </div>
          <div v-if="selectedPhotos.length > 3" class="preview-more">
            +{{ selectedPhotos.length - 3 }}
          </div>
        </div>

        <!-- Product Name -->
        <div class="form-group">
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
        </div>

        <!-- Category -->
        <div class="form-group">
          <label class="form-label required">카테고리</label>
          <div class="category-grid">
            <button
                v-for="cat in categories"
                :key="cat.value"
                :class="['category-btn', { active: formData.category === cat.value }]"
                @click="formData.category = cat.value"
            >
              <span class="category-icon">{{ cat.icon }}</span>
              <span class="category-name">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- Sub Category -->
        <div v-if="formData.category && subCategories[formData.category]" class="form-group">
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

        <div class="nav-buttons">
          <button class="btn-prev" @click="prevStep">이전</button>
          <button
              class="btn-next"
              :disabled="!formData.productName || !formData.category"
              @click="nextStep"
          >
            다음
          </button>
        </div>
      </section>

      <!-- Step 3: Details & Review -->
      <section v-if="currentStep === 3" class="step-section detail-step">
        <div class="step-header">
          <h2 class="step-title">
            <span class="step-number">3</span>
            상세 정보
          </h2>
          <p class="step-desc">제품에 대한 생각을 들려주세요</p>
        </div>

        <!-- Review (Required) -->
        <div class="form-group">
          <label class="form-label required">
            한줄평
            <span class="char-count" :class="{ error: formData.review.length > 100 }">
              {{ formData.review.length }} / 100
            </span>
          </label>
          <textarea
              class="form-textarea"
              placeholder="제품에 대한 솔직한 리뷰를 10자 이상 작성해주세요"
              v-model="formData.review"
              rows="4"
              maxlength="100"
          ></textarea>
          <p v-if="formData.review.length > 0 && formData.review.length < 10" class="form-hint error">
            최소 10자 이상 작성해주세요
          </p>
        </div>

        <!-- Store (Optional) -->
        <div class="form-group">
          <label class="form-label">구매처</label>
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

        <!-- Price (Optional) -->
        <div class="form-group">
          <label class="form-label">
            구매 가격
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.priceHidden" />
              <span>가격 비공개</span>
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
          <label class="form-label">제품 상태</label>
          <div class="status-grid">
            <button
                v-for="status in statuses"
                :key="status.value"
                :class="['status-btn', { active: formData.status === status.value }]"
                @click="formData.status = status.value"
            >
              <span class="status-icon">{{ status.icon }}</span>
              <span>{{ status.label }}</span>
            </button>
          </div>
        </div>

        <div class="nav-buttons">
          <button class="btn-prev" @click="prevStep">이전</button>
          <button
              class="btn-next"
              :disabled="formData.review.length < 10"
              @click="nextStep"
          >
            다음
          </button>
        </div>
      </section>

      <!-- Step 4: Hashtags & Final -->
      <section v-if="currentStep === 4" class="step-section hashtag-step">
        <div class="step-header">
          <h2 class="step-title">
            <span class="step-number">4</span>
            해시태그 & 최종 확인
          </h2>
          <p class="step-desc">마지막으로 해시태그를 추가해주세요</p>
        </div>

        <!-- Hashtags -->
        <div class="form-group">
          <label class="form-label">해시태그 (최대 5개)</label>
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
        </div>

        <!-- Popular Hashtags -->
        <div class="popular-hashtags">
          <p class="popular-title">🔥 인기 해시태그</p>
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

        <!-- Preview -->
        <div class="preview-section">
          <h3 class="preview-title">미리보기</h3>
          <div class="preview-card">
            <div class="preview-header">
              <img :src="currentUser.image" alt="User" class="preview-avatar" />
              <div class="preview-author">
                <div class="preview-author-name">
                  <span>{{ currentUser.name }}</span>
                  <span class="preview-level">{{ currentUser.level }}</span>
                </div>
                <div class="preview-meta">
                  <span>방금</span>
                  <span>·</span>
                  <span>{{ formData.category }}</span>
                </div>
              </div>
            </div>

            <div class="preview-image">
              <img :src="selectedPhotos[0]?.preview" alt="Preview" />
              <div v-if="selectedPhotos.length > 1" class="preview-indicator">
                1 / {{ selectedPhotos.length }}
              </div>
            </div>

            <div class="preview-content">
              <h4 class="preview-product">{{ formData.productName }}</h4>
              <div class="preview-details">
                <span v-if="formData.store && formData.store !== 'direct'">📍 {{ formData.store }}</span>
                <span v-if="formData.store === 'direct' && formData.storeCustom">📍 {{ formData.storeCustom }}</span>
                <span v-if="formData.price && !formData.priceHidden" class="preview-price">
                  {{ formatPrice(formData.price) }}
                </span>
              </div>
              <p class="preview-review">{{ formData.review }}</p>
              <div v-if="formData.hashtags.length > 0" class="preview-hashtags">
                <span v-for="tag in formData.hashtags" :key="tag" class="preview-hashtag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="nav-buttons">
          <button class="btn-prev" @click="prevStep">이전</button>
          <button
              class="btn-next primary"
              @click="handleSubmit"
              :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">게시하기</span>
            <span v-else>
              <svg class="spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4"/>
              </svg>
              업로드 중...
            </span>
          </button>
        </div>
      </section>
    </main>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${(currentStep / 4) * 100}%` }"></div>
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

    <!-- Success Toast -->
    <Transition name="toast">
      <div v-if="showSuccessToast" class="success-toast">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
        <span>인증이 게시되었습니다! (+50 EXP)</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// State
const currentStep = ref(1);
const selectedPhotos = ref([]);
const showCancelDialog = ref(false);
const showSuccessToast = ref(false);
const isSubmitting = ref(false);
const hashtagInput = ref('');
const productSuggestions = ref([]);

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

// Data
const currentUser = {
  name: 'current_user',
  image: 'https://i.pravatar.cc/150?img=12',
  level: '💪'
};

const categories = [
  { value: 'sneakers', label: '스니커즈', icon: '👟' },
  { value: 'tech', label: '테크', icon: '💻' },
  { value: 'beauty', label: '뷰티', icon: '💄' },
  { value: 'fnb', label: 'F&B', icon: '☕' },
  { value: 'fashion', label: '패션', icon: '👔' },
  { value: 'life', label: '라이프', icon: '🏠' }
];

const subCategories = {
  sneakers: ['러닝화', '농구화', '라이프스타일', '하이탑', '로우탑'],
  tech: ['스마트폰', '태블릿', '이어폰/헤드폰', '노트북', '웨어러블'],
  beauty: ['스킨케어', '메이크업', '향수', '헤어케어', '네일'],
  fnb: ['커피', '베이커리', '레스토랑', '주류', '디저트'],
  fashion: ['아우터', '상의', '하의', '신발', '액세서리'],
  life: ['홈데코', '가전', '반려동물', '피트니스', '여행']
};

const stores = [
  '무신사', '크림', '나이키 공식', '아디다스 공식', '애플 공식',
  '올리브영', 'SSENSE', '29CM', 'W컨셉', '브랜디'
];

const statuses = [
  { value: 'available', label: '구매 가능', icon: '✅' },
  { value: 'soldout', label: '품절', icon: '❌' },
  { value: 'restock', label: '재입고 대기', icon: '⏳' },
  { value: 'sale', label: '세일중', icon: '🏷️' }
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

// Computed
const canSubmit = computed(() => {
  return selectedPhotos.value.length > 0 &&
      formData.value.productName &&
      formData.value.category &&
      formData.value.review.length >= 10;
});

// Methods
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  const remainingSlots = 5 - selectedPhotos.value.length;

  files.slice(0, remainingSlots).forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedPhotos.value.push({
          id: Date.now() + index,
          file: file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  });

  event.target.value = '';
};

const removePhoto = (index) => {
  selectedPhotos.value.splice(index, 1);
};

const openCamera = () => {
  console.log('Open camera');
  // Implement camera functionality
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

const formatPrice = (price) => {
  if (!price) return '';
  return '₩' + Number(price).toLocaleString();
};

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const handleCancel = () => {
  if (selectedPhotos.value.length > 0 || formData.value.productName || formData.value.review) {
    showCancelDialog.value = true;
  } else {
    router.back();
  }
};

const confirmCancel = () => {
  showCancelDialog.value = false;
  router.back();
};

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  isSubmitting.value = true;

  // Simulate upload
  await new Promise(resolve => setTimeout(resolve, 2000));

  isSubmitting.value = false;
  showSuccessToast.value = true;

  setTimeout(() => {
    router.push('/feed');
  }, 1500);
};

onMounted(() => {
  console.log('Create feed page mounted');
});
</script>

<style scoped>
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
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Step Section */
.step-section {
  padding: 32px 0;
}

.step-header {
  margin-bottom: 32px;
}

.step-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.step-number {
  width: 36px;
  height: 36px;
  background: var(--accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.step-desc {
  font-size: 15px;
  color: var(--secondary);
  padding-left: 48px;
}

/* Photo Selection */
.selected-photos {
  margin-bottom: 24px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--hover);
  cursor: move;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}

.photo-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-photo-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  background: white;
  border: 2px dashed var(--border);
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-photo-action:hover {
  border-color: var(--accent);
  background: #FFF7ED;
  transform: translateY(-2px);
}

.btn-photo-action .icon {
  width: 32px;
  height: 32px;
  color: var(--accent);
  stroke-width: 2;
}

/* Tips Box */
.tips-box {
  padding: 20px;
  background: linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 100%);
  border-radius: 16px;
  margin-bottom: 32px;
}

.tips-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.tips-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tips-list li {
  font-size: 14px;
  color: var(--secondary);
  padding-left: 20px;
  position: relative;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 8px;
  color: var(--accent);
  font-weight: 700;
}

/* Preview Photos */
.preview-photos {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.preview-photo {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--hover);
}

.preview-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-more {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: var(--hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--secondary);
}

/* Form Groups */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 8px;
}

.form-label.required::after {
  content: '*';
  color: var(--accent);
  margin-left: 4px;
}

.char-count {
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

/* Category Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
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

.category-btn:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.category-btn.active {
  border-color: var(--accent);
  background: #FFF7ED;
}

.category-icon {
  font-size: 32px;
}

.category-name {
  font-size: 14px;
}

/* Sub Category List */
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

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

/* Price Input */
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

/* Status Grid */
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
  padding: 16px;
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

.status-icon {
  font-size: 20px;
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

/* Popular Hashtags */
.popular-hashtags {
  padding: 20px;
  background: white;
  border-radius: 16px;
  margin-bottom: 32px;
}

.popular-title {
  font-size: 15px;
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

/* Preview */
.preview-section {
  margin-bottom: 32px;
}

.preview-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
}

.preview-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.preview-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  object-fit: cover;
}

.preview-author {
  flex: 1;
}

.preview-author-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.preview-level {
  font-size: 14px;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--secondary);
}

.preview-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: var(--hover);
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-indicator {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.preview-content {
  padding: 16px;
}

.preview-product {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
}

.preview-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--secondary);
  margin-bottom: 12px;
}

.preview-price {
  font-weight: 700;
  color: var(--accent);
}

.preview-review {
  font-size: 14px;
  color: var(--primary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.preview-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-hashtag {
  font-size: 13px;
  color: #1D4ED8;
  font-weight: 600;
}

/* Navigation Buttons */
.nav-buttons {
  display: flex;
  gap: 12px;
}

.btn-prev,
.btn-next {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-prev {
  background: white;
  color: var(--primary);
  border: 2px solid var(--border);
}

.btn-prev:hover {
  border-color: var(--primary);
  background: var(--hover);
}

.btn-next {
  background: var(--accent);
  color: white;
}

.btn-next:hover:not(:disabled) {
  background: #EA580C;
  transform: translateY(-2px);
}

.btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-next.primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Progress Bar */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--border);
  z-index: 100;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
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

/* Success Toast */
.success-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: var(--primary);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 300;
}

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

@media (max-width: 768px) {
  .create-content {
    padding: 0 16px;
  }

  .step-section {
    padding: 24px 0;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .photo-actions {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>