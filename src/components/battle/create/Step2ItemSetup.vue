<template>
  <div class="form-section">
    <!-- 상단 안내: 아이템이 뭔지 설명 -->
    <div class="step-intro">
      <div class="intro-header">
        <div class="intro-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </div>
        <h2 class="intro-title">어떤 아이템으로 대결할까요?</h2>
        <span class="intro-meta">최소 1개 · 최대 20개</span>
      </div>
      <p class="intro-desc">
        아래 <strong>3가지 방법</strong> 중 골라서 아이템을 추가하세요.
      </p>
      <ul class="intro-methods">
        <li><span class="method-dot method-photo"></span>직접 찍은 <strong>사진</strong>으로 추가</li>
        <li><span class="method-dot method-item"></span>요거뜨에 등록된 <strong>아이템</strong> 검색</li>
        <li><span class="method-dot method-youtube"></span><strong>YouTube 영상</strong> 링크 붙여넣기</li>
      </ul>
    </div>

    <!-- 입력 방식 탭 -->
    <div class="input-tabs">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
        <span class="tab-label-short">{{ tab.shortLabel }}</span>
      </button>
    </div>

    <!-- 활성 탭 설명 -->
    <div class="tab-hint">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>{{ activeTabHint }}</span>
    </div>

    <!-- YouTube 링크 입력 -->
    <div v-if="activeTab === 'youtube'" class="input-panel">
      <div class="youtube-input-section">
        <div class="input-row">
          <input
              v-model="youtubeUrl"
              type="text"
              placeholder="YouTube 링크를 붙여넣으세요"
              class="youtube-input"
              @input="handleYoutubeInput"
              @keyup.enter="addYoutubeItem"
          >
          <button
              class="add-btn"
              :disabled="!youtubePreview"
              @click="addYoutubeItem"
          >
            추가
          </button>
        </div>

        <!-- YouTube 미리보기 -->
        <div v-if="youtubePreview" class="youtube-preview">
          <div class="preview-thumbnail">
            <img :src="youtubePreview.thumbnail" :alt="youtubePreview.title || 'YouTube 영상'">
            <div class="play-overlay">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div class="preview-info">
            <input
                v-model="youtubePreview.customName"
                type="text"
                placeholder="아이템명 (필수)"
                class="preview-input"
                maxlength="30"
            >
            <input
                v-model="youtubePreview.customBrand"
                type="text"
                placeholder="추가 설명 (선택)"
                class="preview-input small"
                maxlength="20"
            >
          </div>
        </div>

        <div v-else class="youtube-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
          </svg>
          <p>YouTube 링크를 입력하면 썸네일과 함께 아이템으로 추가됩니다</p>
        </div>
      </div>
    </div>

    <!-- 이미지 업로드 (이상형월드컵 스타일) -->
    <div v-if="activeTab === 'image'" class="input-panel">
      <div class="image-upload-section">
        <!-- 드래그 앤 드롭 영역 -->
        <label
            class="drop-zone"
            :class="{ 'drag-over': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
        >
          <input
              type="file"
              accept="image/*"
              multiple
              class="hidden-input"
              @change="handleFileSelect"
          >
          <div class="drop-content">
            <div class="drop-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              한 번에 여러 장 선택 가능
            </div>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p class="drop-title">사진을 끌어다 놓거나 탭하여 선택</p>
            <p class="drop-hint">파일 선택 창에서 여러 장을 한꺼번에 골라보세요 · 최대 10MB/장</p>
          </div>
        </label>

        <!-- 업로드된 이미지 목록 -->
        <div v-if="pendingImages.length > 0" class="pending-images">
          <div class="pending-header">
            <span class="pending-title">업로드된 이미지 ({{ pendingImages.length }})</span>
            <button class="add-all-btn" @click="addAllImages">
              전체 추가
            </button>
          </div>
          <div class="pending-grid">
            <div
                v-for="(img, index) in pendingImages"
                :key="index"
                class="pending-card"
            >
              <div class="pending-card-image" :class="{ 'is-failed': img.failed }">
                <img :src="img.previewUrl" :alt="img.customName || '이미지'">
                <div v-if="img.uploading" class="upload-overlay">
                  <div class="spinner"></div>
                  <span>업로드 중...</span>
                </div>
                <div v-else-if="img.failed" class="upload-overlay failed">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>업로드 실패</span>
                  <button type="button" class="retry-btn" @click.stop="retryUpload(index)">다시 시도</button>
                </div>
                <button
                    class="card-remove-btn"
                    @click="removePendingImage(index)"
                    title="삭제"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="pending-card-inputs">
                <input
                    v-model="img.customName"
                    type="text"
                    placeholder="아이템명 (필수)"
                    class="card-input"
                    :class="{ 'has-error': submitAttempted && !img.customName?.trim() }"
                    maxlength="30"
                >
                <p
                    v-if="submitAttempted && !img.customName?.trim()"
                    class="input-error"
                >
                  아이템명을 입력하세요
                </p>
                <input
                    v-model="img.customBrand"
                    type="text"
                    placeholder="추가 설명 (선택)"
                    class="card-input small"
                    maxlength="20"
                >
                <button
                    class="card-add-btn"
                    :disabled="!img.customName?.trim() || img.uploading || img.failed || !img.uploadedUrl"
                    @click="addSingleImage(index)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 기존 제품 검색 (피드 등록과 동일한 인라인 UI) -->
    <div v-if="activeTab === 'search'" class="input-panel">
      <div class="product-search-wrapper">
        <div class="product-search-bar">
          <svg class="product-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
              type="text"
              class="product-search-input"
              placeholder="제품명을 검색하세요 (예: 나이키 조던 4)"
              v-model="productSearchQuery"
              @input="handleProductSearchInput"
          />
          <div v-if="isSearchingProducts" class="product-search-spinner">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- 검색 결과 -->
        <div v-if="productSuggestions.length > 0" class="product-suggestions">
          <button
              v-for="p in productSuggestions"
              :key="p.productId"
              type="button"
              class="product-suggestion-item"
              :class="{ 'is-disabled': isProductAdded(p.productId) }"
              :disabled="isProductAdded(p.productId)"
              @click="handleProductAdd(p)"
          >
            <img
                :src="p.thumbnailUrl || '/default-product.png'"
                :alt="p.name"
                class="product-suggestion-thumb"
                @error="handleImageError"
            />
            <div class="product-suggestion-info">
              <p class="product-suggestion-name">{{ p.name }}</p>
              <p class="product-suggestion-brand">{{ p.brand }}</p>
            </div>
            <span v-if="isProductAdded(p.productId)" class="product-suggestion-badge">추가됨</span>
            <svg v-else class="product-suggestion-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- 검색 전 안내 -->
        <p
            v-if="!productSearchQuery.trim() && !isSearchingProducts"
            class="product-search-hint"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          제품명을 입력하면 등록된 아이템을 자동으로 찾아드려요
        </p>
        <p
            v-else-if="productSearchQuery.trim() && !isSearchingProducts && productSuggestions.length === 0 && hasSearchedProducts"
            class="product-search-hint"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          검색 결과가 없어요. "이미지 업로드" 탭에서 새 아이템을 만들 수 있어요
        </p>
      </div>
    </div>

    <!-- 선택된 아이템 목록 -->
    <div class="form-group selected-items-section">
      <label class="form-label">선택된 아이템 ({{ selectedItems.length }}/20)</label>
      <div style="min-height: 120px;">
        <!-- Empty State -->
        <div
            v-if="selectedItems.length === 0"
            class="empty-state"
        >
          <div class="empty-icon-svg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/>
            </svg>
          </div>
          <div class="empty-title">아직 추가된 아이템이 없어요</div>
          <div class="empty-desc">위 탭에서 사진, 등록된 제품, YouTube 영상 중 골라 추가하세요</div>
        </div>

        <!-- Selected Items Grid -->
        <div
            v-else
            class="items-grid"
        >
          <div
              v-for="(item, index) in displayItems"
              :key="index"
              class="selected-item"
              :class="{ 'is-youtube': item.isYoutube }"
          >
            <div class="selected-item-remove" @click="removeItem(index)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <div class="item-visual" @click="item.isYoutube && playYoutube(item)">
              <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  @error="handleImageError"
              >
              <div v-else class="item-placeholder">
                {{ item.isCustom ? '✨' : '📦' }}
              </div>
              <!-- YouTube 재생 버튼 오버레이 -->
              <div v-if="item.isYoutube" class="youtube-play-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-brand">{{ item.brand }}</div>
              <div v-if="item.isCustom && !item.isYoutube" class="item-badge custom">커스텀</div>
              <div v-if="item.isYoutube" class="item-badge youtube">YouTube</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- YouTube Player Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showYoutubePlayer" class="youtube-modal-overlay" @click.self="closeYoutubePlayer">
          <div class="youtube-modal">
            <button class="youtube-modal-close" @click="closeYoutubePlayer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div class="youtube-player-wrapper">
              <iframe
                  v-if="currentYoutubeId"
                  :src="normalizeYoutubeEmbedUrl(`https://www.youtube.com/embed/${currentYoutubeId}`)"
                  frameborder="0"
                  allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  playsinline
                  allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useFile } from '@/services/FileService';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import productService from '@/services/ProductService';
import { normalizeYoutubeEmbedUrl } from '@/utils/youtubeEmbed.js';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const props = defineProps({
  battleForm: {
    type: Object,
    required: true
  },
  selectedItems: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:battleForm', 'update:selectedItems']);

const fileService = useFile();
const { open } = useConfirmDialog();

// 탭 정의 — 모바일에서 가장 많이 쓰는 이미지 업로드를 맨 앞에 배치
const tabs = [
  {
    id: 'image',
    label: '사진 업로드',
    shortLabel: '사진',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
  },
  {
    id: 'search',
    label: '등록 아이템',
    shortLabel: '아이템',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'
  },
  {
    id: 'youtube',
    label: 'YouTube',
    shortLabel: 'YouTube',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>'
  }
];

const activeTab = ref('image');

// 활성 탭별 친절한 안내 문구
const tabHints = {
  image: '직접 찍은 사진을 추가해요. 한 번에 여러 장 선택할 수 있고, 등록 안 된 신상품도 OK!',
  search: '요거뜨에 이미 등록된 제품을 검색해서 빠르게 추가할 수 있어요.',
  youtube: 'YouTube 영상 링크를 붙여넣으면 썸네일까지 자동으로 가져와요.'
};
const activeTabHint = computed(() => tabHints[activeTab.value] || '');

// 요거뜨 아이템 검색 (피드 등록과 동일 방식)
const productSearchQuery = ref('');
const productSuggestions = ref([]);
const isSearchingProducts = ref(false);
const hasSearchedProducts = ref(false);
let productSearchTimer = null;
let productSearchReqId = 0;

// YouTube 관련
const youtubeUrl = ref('');
const youtubePreview = ref(null);
const showYoutubePlayer = ref(false);
const currentYoutubeId = ref(null);

// 이미지 업로드 관련
const isDragging = ref(false);
const pendingImages = ref([]);
const submitAttempted = ref(false);

// YouTube URL에서 Video ID 추출
const extractYoutubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// YouTube 썸네일 URL 생성
const getYoutubeThumbnail = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// YouTube URL 입력 처리
const handleYoutubeInput = () => {
  const videoId = extractYoutubeId(youtubeUrl.value);
  if (videoId) {
    youtubePreview.value = {
      videoId,
      thumbnail: getYoutubeThumbnail(videoId),
      customName: '',
      customBrand: ''
    };
  } else {
    youtubePreview.value = null;
  }
};

// YouTube 아이템 추가
const addYoutubeItem = async () => {
  if (!youtubePreview.value) return;
  if (!youtubePreview.value.customName?.trim()) {
    await open({ type: 'alert', title: '알림', message: '아이템 이름을 입력해주세요.' });
    return;
  }

  if (props.selectedItems.length >= 20) {
    await open({ type: 'alert', title: '알림', message: '최대 20개까지만 추가할 수 있습니다.' });
    return;
  }

  const newItem = {
    itemType: 'YOUTUBE',
    productId: null,
    customName: youtubePreview.value.customName.trim(),
    customBrand: youtubePreview.value.customBrand?.trim() || 'YouTube',
    contentUrl: `https://www.youtube.com/watch?v=${youtubePreview.value.videoId}`,
    imageUrl: youtubePreview.value.thumbnail,
    youtubeVideoId: youtubePreview.value.videoId
  };

  emit('update:selectedItems', [...props.selectedItems, newItem]);

  // 초기화
  youtubeUrl.value = '';
  youtubePreview.value = null;
};

// YouTube 재생
const playYoutube = async (item) => {
  if (!item.youtubeVideoId) return;

  // 네이티브 앱: SFSafariViewController로 열기
  if (Capacitor.isNativePlatform()) {
    const url = `https://www.youtube.com/watch?v=${item.youtubeVideoId}`;
    try {
      await Browser.open({ url, presentationStyle: 'popover' });
    } catch (e) {
      console.warn('[YouTube] Browser.open 실패, iframe fallback:', e);
      currentYoutubeId.value = item.youtubeVideoId;
      showYoutubePlayer.value = true;
    }
    return;
  }

  // 웹: 기존 iframe 모달
  currentYoutubeId.value = item.youtubeVideoId;
  showYoutubePlayer.value = true;
};

const closeYoutubePlayer = () => {
  showYoutubePlayer.value = false;
  currentYoutubeId.value = null;
};

// 이미지 파일 처리
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || []);
  processFiles(files);
  event.target.value = '';
};

const handleFileDrop = (event) => {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files || []);
  processFiles(files);
};

async function uploadOne(imageData) {
  imageData.uploading = true;
  imageData.failed = false;
  try {
    const result = await fileService.upload(imageData.file, { fileCode: 'BATTLE_ITEM' });
    if (result?.success && result?.data && (result.data.fileUrl || result.data.storedPath)) {
      imageData.uploadedUrl = result.data.fileUrl || result.data.storedPath;
      imageData.attachmentInfo = {
        fileId: result.data.id,
        storedPath: result.data.fileUrl,
        originName: result.data.orgFileNm || imageData.file.name,
        fileSize: result.data.fileSize || imageData.file.size,
        contentType: result.data.contentType || imageData.file.type
      };
      imageData.failed = false;
    } else {
      imageData.failed = true;
      console.warn('이미지 업로드 응답 비정상:', result);
    }
  } catch (error) {
    imageData.failed = true;
    console.error('이미지 업로드 실패:', error);
  } finally {
    imageData.uploading = false;
  }
}

const processFiles = async (files) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  // 새 업로드 시작 시 이전 검증 에러 초기화
  if (imageFiles.length > 0) submitAttempted.value = false;

  for (const file of imageFiles) {
    if (file.size > 10 * 1024 * 1024) {
      await open({ type: 'alert', title: '알림', message: `${file.name}은 10MB를 초과합니다.` });
      continue;
    }

    const previewUrl = URL.createObjectURL(file);
    const imageData = {
      file,
      previewUrl,
      customName: '',
      customBrand: '',
      uploading: true,
      uploadedUrl: null,
      attachmentInfo: null,
      failed: false
    };

    pendingImages.value.push(imageData);
    // 병렬 업로드 — 배열에 push 된 reactive proxy 를 넘겨야 .uploading 변경이 화면에 반영됨
    // (로컬 plain object 를 그대로 넘기면 mutation 이 reactive 시스템 밖에서 일어남)
    uploadOne(pendingImages.value[pendingImages.value.length - 1]);
  }
};

const retryUpload = (index) => {
  const item = pendingImages.value[index];
  if (item) uploadOne(item);
};

// 이미지 개별 추가
const addSingleImage = async (index) => {
  const img = pendingImages.value[index];
  if (!img.customName?.trim()) return;

  if (props.selectedItems.length >= 20) {
    await open({ type: 'alert', title: '알림', message: '최대 20개까지만 추가할 수 있습니다.' });
    return;
  }

  const newItem = {
    itemType: 'CUSTOM',
    productId: null,
    customName: img.customName.trim(),
    customBrand: img.customBrand?.trim() || '',
    customImageUrl: img.uploadedUrl || null,
    imageUrl: img.uploadedUrl || img.previewUrl,
    customImageAttachmentInfo: img.attachmentInfo
  };

  emit('update:selectedItems', [...props.selectedItems, newItem]);
  pendingImages.value.splice(index, 1);
};

// 이미지 전체 추가
const canAddAllImages = computed(() => {
  return pendingImages.value.every(img => img.customName?.trim() && !img.uploading);
});

const addAllImages = async () => {
  submitAttempted.value = true;

  // 1. 아이템명 빈 칸 검증 — 빈 칸 있으면 인라인 에러만 띄우고 중단
  const hasMissingName = pendingImages.value.some(img => !img.customName?.trim());
  if (hasMissingName) return;

  // 2. 업로드 진행 중 체크
  if (pendingImages.value.some(img => img.uploading)) {
    await open({
      type: 'alert',
      title: '업로드 중',
      message: '이미지 업로드가 끝날 때까지 잠시만 기다려주세요'
    });
    return;
  }

  // 3. 슬롯 초과 체크
  const availableSlots = 20 - props.selectedItems.length;
  if (pendingImages.value.length > availableSlots) {
    await open({
      type: 'alert',
      title: '알림',
      message: `${availableSlots}개만 추가할 수 있습니다. (현재 ${props.selectedItems.length}/20)`
    });
    return;
  }

  const newItems = pendingImages.value.map(img => ({
    itemType: 'CUSTOM',
    productId: null,
    customName: img.customName.trim(),
    customBrand: img.customBrand?.trim() || '',
    customImageUrl: img.uploadedUrl || null,
    imageUrl: img.uploadedUrl || img.previewUrl,
    customImageAttachmentInfo: img.attachmentInfo
  }));

  emit('update:selectedItems', [...props.selectedItems, ...newItems]);
  pendingImages.value = [];
  submitAttempted.value = false;
};

// 대기 이미지 삭제
const removePendingImage = (index) => {
  const img = pendingImages.value[index];
  if (img.previewUrl) {
    URL.revokeObjectURL(img.previewUrl);
  }
  pendingImages.value.splice(index, 1);
};

// 선택된 아이템 표시용 데이터
const displayItems = computed(() => {
  return props.selectedItems.map(item => {
    // YouTube 아이템
    if (item.itemType === 'YOUTUBE' || item.youtubeVideoId) {
      return {
        name: item.customName || item.name || '알 수 없음',
        brand: item.customBrand || item.brand || 'YouTube',
        imageUrl: item.imageUrl || (item.youtubeVideoId ? getYoutubeThumbnail(item.youtubeVideoId) : null),
        isYoutube: true,
        youtubeVideoId: item.youtubeVideoId,
        isCustom: false
      };
    }

    // 커스텀 아이템
    if (item.itemType === 'CUSTOM' || item.customName) {
      return {
        name: item.customName,
        brand: item.customBrand || '',
        imageUrl: item.imageUrl || item.customImageUrl || null,
        isCustom: true,
        isYoutube: false
      };
    }

    // 기존 제품 (PRODUCT)
    return {
      name: item.name || '알 수 없음',
      brand: item.brand || '브랜드 없음',
      imageUrl: item.thumbnailDto?.fileUrl || item.imageUrl || null,
      isCustom: false,
      isYoutube: false
    };
  });
});

// 제품 검색 (debounce + race-guard)
const handleProductSearchInput = () => {
  const keyword = productSearchQuery.value.trim();
  if (productSearchTimer) clearTimeout(productSearchTimer);

  if (keyword.length < 1) {
    productSuggestions.value = [];
    hasSearchedProducts.value = false;
    isSearchingProducts.value = false;
    return;
  }

  isSearchingProducts.value = true;
  productSearchTimer = setTimeout(async () => {
    const currentKeyword = productSearchQuery.value.trim();
    if (currentKeyword.length < 1) {
      isSearchingProducts.value = false;
      return;
    }
    const reqId = ++productSearchReqId;
    try {
      const response = await productService.getProducts(
          { keyword: currentKeyword, status: 'APPROVED' },
          { page: 0, size: 8, sort: 'popularityScore,DESC' }
      );
      if (reqId !== productSearchReqId) return;
      if (response.success && response.data) {
        productSuggestions.value = response.data.content || response.data || [];
      } else {
        productSuggestions.value = [];
      }
    } catch (error) {
      if (reqId !== productSearchReqId) return;
      console.error('아이템 검색 실패:', error);
      productSuggestions.value = [];
    } finally {
      if (reqId === productSearchReqId) {
        isSearchingProducts.value = false;
        hasSearchedProducts.value = true;
      }
    }
  }, 200);
};

const isProductAdded = (productId) => {
  return props.selectedItems.some(item => item.productId === productId);
};

const handleProductAdd = async (product) => {
  if (isProductAdded(product.productId)) return;

  if (props.selectedItems.length >= 20) {
    await open({ type: 'alert', title: '알림', message: '최대 20개까지만 추가할 수 있습니다.' });
    return;
  }

  const newItem = {
    itemType: 'PRODUCT',
    productId: product.productId,
    name: product.name,
    brand: product.brand,
    imageUrl: product.thumbnailUrl || null,
    thumbnailDto: product.thumbnailDto || null
  };

  emit('update:selectedItems', [...props.selectedItems, newItem]);
  emit('update:battleForm', { ...props.battleForm });

  // 검색어/결과 초기화 → 이어서 바로 다른 제품 검색 가능
  productSearchQuery.value = '';
  productSuggestions.value = [];
  hasSearchedProducts.value = false;
};

// 아이템 삭제
const removeItem = (index) => {
  const newItems = [...props.selectedItems];
  newItems.splice(index, 1);
  emit('update:selectedItems', newItems);
  emit('update:battleForm', { ...props.battleForm });
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
};
</script>

<style scoped>
.form-section {
  flex: 1;
  width: 100%;
  background: var(--bg-elevated);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #F0F0F3;
  box-sizing: border-box;
}

/* ===== 상단 안내 ===== */
.step-intro {
  padding: 20px 22px;
  margin-bottom: 20px;
  background: var(--bg-elevated);
  border-radius: 14px;
  border: 1px solid var(--border-strong);
}

.intro-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.intro-icon {
  width: 36px;
  height: 36px;
  background: #FAF5FF;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9333EA;
  flex-shrink: 0;
}

.intro-title {
  flex: 1;
  font-size: 19px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.4px;
}

.intro-meta {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: var(--bg-subtle);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: -0.2px;
}

.intro-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
  letter-spacing: -0.2px;
}

.intro-desc strong {
  color: #9333EA;
  font-weight: 700;
}

.intro-methods {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  margin: 0;
  list-style: none;
  background: var(--bg-subtle);
  border-radius: 10px;
}

.intro-methods li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: -0.2px;
  line-height: 1.5;
}

.intro-methods strong {
  color: var(--text-primary);
  font-weight: 700;
}

.method-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.method-dot.method-photo {
  background: #9333EA;
}

.method-dot.method-item {
  background: #3B82F6;
}

.method-dot.method-youtube {
  background: #EF4444;
}

/* ===== 활성 탭 설명 ===== */
.tab-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: -8px 0 20px;
  padding: 10px 14px;
  background: var(--c-brand-soft);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-brand-hover);
  line-height: 1.5;
}

.tab-hint svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.required {
  color: var(--c-danger);
}

.form-hint {
  font-size: 12px;
  color: var(--c-text-400);
  margin-top: 4px;
}

/* ===== 입력 방식 탭 ===== */
.input-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  padding: 4px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
  background: var(--bg-mute);
}

.tab-btn.active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--border-strong);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.tab-icon {
  display: flex;
  align-items: center;
}

.tab-label-short {
  display: none;
}

/* ===== 입력 패널 공통 ===== */
.input-panel {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--bg-subtle);
  border-radius: 12px;
  border: 1px solid var(--border-strong);
}

/* ===== YouTube 입력 ===== */
.youtube-input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.youtube-input {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid var(--border-strong);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.youtube-input:focus {
  outline: none;
  border-color: #FF0000;
  box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
}

.add-btn {
  padding: 14px 24px;
  background: var(--c-ink-900);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-btn:hover:not(:disabled) {
  background: var(--c-ink-900);
}

.add-btn:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

.youtube-preview {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-elevated);
  border-radius: 12px;
  border: 1px solid var(--border-strong);
}

.preview-thumbnail {
  position: relative;
  width: 160px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.preview-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-input {
  padding: 10px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

.preview-input:focus {
  outline: none;
  border-color: var(--c-brand);
}

.preview-input.small {
  font-size: 13px;
  padding: 8px 12px;
}

.youtube-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  color: var(--c-text-400);
  text-align: center;
}

.youtube-empty svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

.youtube-empty p {
  font-size: 13px;
  margin: 0;
}

/* ===== 이미지 업로드 ===== */
.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  border: 2px dashed var(--c-text-300);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-elevated);
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--c-brand);
  background: var(--c-brand-soft);
}

.hidden-input {
  display: none;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.drop-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  margin-bottom: 14px;
  background: var(--c-brand);
  color: white;
  font-size: 11.5px;
  font-weight: 700;
  border-radius: 999px;
  letter-spacing: -0.1px;
}

.drop-content > svg {
  color: var(--c-text-400);
  margin-bottom: 12px;
}

.drop-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-600);
  margin: 0 0 4px 0;
}

.drop-hint {
  font-size: 12px;
  color: var(--c-text-400);
  margin: 0;
}

/* 대기 이미지 목록 */
.pending-images {
  background: var(--bg-elevated);
  border-radius: 12px;
  border: 1px solid var(--border-strong);
  overflow: hidden;
}

.pending-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border-strong);
}

.pending-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-600);
}

.add-all-btn {
  padding: 8px 16px;
  background: var(--c-brand);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.add-all-btn:hover:not(:disabled) {
  background: var(--c-brand-hover);
}

.add-all-btn:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

.pending-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
}

.pending-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.pending-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pending-card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: var(--border-default);
  overflow: hidden;
}

.pending-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.pending-card:hover .card-remove-btn {
  opacity: 1;
}

.card-remove-btn:hover {
  background: var(--c-danger);
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(147, 51, 234, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.upload-overlay.failed {
  background: rgba(239, 68, 68, 0.88);
  gap: 4px;
}

.upload-overlay .retry-btn {
  margin-top: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1.5px solid white;
  background: transparent;
  color: white;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: background 0.15s, color 0.15s;
}

.upload-overlay .retry-btn:hover {
  background: white;
  color: var(--c-danger);
}

.pending-card-image.is-failed {
  outline: 1.5px solid var(--c-danger);
  outline-offset: -1.5px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pending-card-inputs {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;
}

.card-input:focus {
  outline: none;
  border-color: var(--c-brand);
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.1);
}

.card-input.has-error {
  border-color: var(--c-danger);
  background: var(--c-danger-soft);
}

.card-input.has-error:focus {
  box-shadow: 0 0 0 2px var(--c-danger-soft);
}

.input-error {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: -2px 0 0 2px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--c-danger);
}

.card-input.small {
  font-size: 12px;
  padding: 8px 12px;
}

.card-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 16px;
  background: var(--c-ink-900);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}

.card-add-btn:hover:not(:disabled) {
  background: var(--c-ink-900);
}

.card-add-btn:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

/* ===== 제품 검색 (피드 등록과 동일) ===== */
.product-search-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-subtle);
  border: 1.5px solid var(--border-default);
  border-radius: 12px;
  transition: all 0.15s ease;
}

.product-search-bar:focus-within {
  background: var(--bg-elevated);
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
}

.product-search-icon {
  width: 18px;
  height: 18px;
  color: var(--c-text-400);
  margin-left: 14px;
  flex-shrink: 0;
}

.product-search-input {
  flex: 1;
  padding: 13px 14px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  color: var(--text-primary);
}

.product-search-input::placeholder {
  color: var(--c-text-300);
  font-weight: 400;
}

.product-search-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.product-search-spinner svg {
  width: 18px;
  height: 18px;
  color: var(--c-brand);
  animation: spin 0.8s linear infinite;
}

.product-suggestions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 2px;
}

.product-suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  font-family: inherit;
}

.product-suggestion-item:hover:not(:disabled) {
  border-color: var(--c-brand);
  background: var(--c-brand-soft);
}

.product-suggestion-item.is-disabled,
.product-suggestion-item:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.product-suggestion-thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--bg-subtle);
  flex-shrink: 0;
}

.product-suggestion-info {
  flex: 1;
  min-width: 0;
}

.product-suggestion-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-suggestion-brand {
  font-size: 12px;
  color: var(--c-text-500);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-suggestion-arrow {
  width: 18px;
  height: 18px;
  color: var(--c-text-300);
  flex-shrink: 0;
}

.product-suggestion-item:hover:not(:disabled) .product-suggestion-arrow {
  color: var(--c-brand);
}

.product-suggestion-badge {
  flex-shrink: 0;
  padding: 3px 8px;
  background: var(--border-default);
  color: var(--c-text-500);
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
}

.product-search-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 2px 0 0 2px;
  font-size: 12px;
  color: var(--c-text-400);
}

.product-search-hint svg {
  color: var(--c-text-400);
  flex-shrink: 0;
}

/* ===== 선택된 아이템 섹션 ===== */
.selected-items-section {
  margin-top: 8px;
}

.empty-state {
  border: 2px dashed var(--border-strong);
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--c-text-400);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  background: var(--bg-subtle);
  border-radius: 50%;
  color: var(--c-text-400);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 13px;
  color: var(--c-text-400);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.selected-item {
  position: relative;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s;
}

.selected-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.selected-item.is-youtube {
  border-color: var(--c-danger-soft);
  background: var(--c-danger-soft);
}

.selected-item-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 1;
}

.selected-item:hover .selected-item-remove {
  opacity: 1;
}

.selected-item-remove:hover {
  background: var(--c-danger);
}

.item-visual {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-item.is-youtube .item-visual {
  cursor: pointer;
}

.item-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}

.item-placeholder {
  font-size: 40px;
}

.youtube-play-btn {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.selected-item.is-youtube:hover .youtube-play-btn {
  opacity: 1;
}

.item-info {
  padding: 10px 12px;
  text-align: center;
}

.item-name {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  word-break: break-word;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-brand {
  font-size: 11px;
  color: var(--c-text-400);
}

.item-badge {
  display: inline-block;
  margin-top: 6px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
}

.item-badge.custom {
  background: var(--c-warning-soft);
  color: var(--c-warning);
}

.item-badge.youtube {
  background: var(--c-danger-soft);
  color: var(--c-danger);
}

/* ===== YouTube 플레이어 모달 ===== */
.youtube-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.youtube-modal {
  position: relative;
  width: 100%;
  max-width: 900px;
}

.youtube-modal-close {
  position: absolute;
  top: -50px;
  right: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.youtube-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.youtube-player-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 12px;
}

.youtube-player-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 모달 트랜지션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* ===== 반응형 ===== */
@media (max-width: 1024px) {
  .items-grid {
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .form-section {
    padding: 24px 20px;
  }

  .step-intro {
    padding: 16px 16px;
    margin-bottom: 16px;
  }

  .intro-header {
    gap: 10px;
    margin-bottom: 8px;
  }

  .intro-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .intro-title {
    font-size: 16px;
    letter-spacing: -0.3px;
  }

  .intro-meta {
    font-size: 11px;
    padding: 3px 9px;
  }

  .intro-desc {
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 10px;
  }

  .intro-methods {
    padding: 10px 12px;
    gap: 5px;
  }

  .intro-methods li {
    font-size: 12.5px;
  }

  .tab-hint {
    font-size: 13px;
    padding: 10px 12px;
    line-height: 1.5;
  }

  .input-tabs {
    gap: 4px;
  }

  .tab-btn {
    flex: 1;
    padding: 10px 8px;
    font-size: 12px;
    gap: 6px;
  }

  .input-panel {
    padding: 16px;
  }

  .input-row {
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
  }

  .youtube-preview {
    flex-direction: column;
  }

  .preview-thumbnail {
    width: 100%;
    height: 180px;
  }

  .items-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .item-info {
    padding: 8px 10px;
  }

  .item-name {
    font-size: 12px;
  }

  .item-brand {
    font-size: 10px;
  }

  .item-placeholder {
    font-size: 32px;
  }

  .selected-item-remove {
    opacity: 1;
  }

  .empty-state {
    padding: 32px 16px;
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 8px;
  }

  .empty-title {
    font-size: 14px;
  }

  /* 업로드 직후 입력 카드 — 모바일에선 가로 레이아웃으로 컴팩트하게 */
  .pending-grid {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }

  .pending-card {
    display: flex;
    flex-direction: row;
    border-radius: 10px;
  }

  .pending-card-image {
    width: 92px;
    height: 92px;
    aspect-ratio: 1;
    flex-shrink: 0;
  }

  .pending-card-inputs {
    flex: 1;
    min-width: 0;
    padding: 8px 10px;
    gap: 6px;
  }

  .card-input {
    padding: 7px 10px;
    font-size: 12.5px;
    border-radius: 6px;
  }

  .card-input.small {
    padding: 6px 10px;
    font-size: 11.5px;
  }

  .card-add-btn {
    padding: 7px 12px;
    font-size: 12px;
    margin-top: 0;
    border-radius: 6px;
  }

  .card-remove-btn {
    opacity: 1;
    width: 22px;
    height: 22px;
    top: 4px;
    right: 4px;
  }
}

@media (max-width: 480px) {
  .tab-label {
    display: none;
  }

  .tab-label-short {
    display: inline;
  }

  .tab-btn {
    flex: 1;
    flex-direction: column;
    gap: 4px;
    padding: 10px 6px;
    font-size: 11.5px;
    justify-content: center;
    letter-spacing: -0.2px;
  }

  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .item-info {
    padding: 6px 8px;
  }

  .item-name {
    font-size: 11px;
  }

  .item-brand {
    font-size: 9px;
  }

  .item-badge {
    font-size: 9px;
    padding: 2px 6px;
  }

  .item-placeholder {
    font-size: 28px;
  }

}
</style>
