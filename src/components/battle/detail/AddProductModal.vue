<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
          <!-- Modal Header -->
          <div class="modal-header">
            <h3 class="modal-title">아이템 추가하기</h3>
            <button @click="$emit('close')" class="btn-close" type="button" aria-label="닫기">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- 입력 방식 탭 -->
            <div class="input-tabs">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                class="tab-btn"
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id"
                type="button"
              >
                <span class="tab-icon" v-html="tab.icon"></span>
                <span class="tab-label">{{ tab.label }}</span>
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

            <!-- 이미지 업로드 탭 — 다중 지원 -->
            <div v-if="activeTab === 'image'" class="input-panel">
              <div class="image-upload-section">
                <!-- 드롭존 -->
                <label
                  class="drop-zone"
                  :class="{ 'drag-over': isDragging }"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden-input"
                    @change="handleFileSelect"
                  />
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

                <!-- 대기 이미지 목록 -->
                <div v-if="pendingImages.length > 0" class="pending-images">
                  <div class="pending-header">
                    <span class="pending-title">업로드된 이미지 ({{ pendingImages.length }})</span>
                    <button
                      type="button"
                      class="add-all-btn"
                      :disabled="!canAddAll"
                      @click="addAllImages"
                    >
                      전체 추가
                    </button>
                  </div>
                  <div class="pending-grid">
                    <div
                      v-for="img in pendingImages"
                      :key="img.id"
                      class="pending-card"
                      :class="{ 'is-failed': img.failed }"
                    >
                      <div class="pending-card-image">
                        <img :src="img.previewUrl" :alt="img.customName || '이미지'" />
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
                          <button type="button" class="retry-btn" @click.stop="retryUpload(img.id)">다시 시도</button>
                        </div>
                        <button
                          class="card-remove-btn"
                          type="button"
                          aria-label="삭제"
                          @click="removePendingImage(img.id)"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      <div class="pending-card-inputs">
                        <div class="fields-column">
                          <div class="field">
                            <label class="field-label">아이템명 <span class="req-mark" aria-label="필수">*</span></label>
                            <input
                              v-model="img.customName"
                              type="text"
                              placeholder="예: 우베라떼"
                              class="card-input"
                              :class="{ 'has-error': img.errorName }"
                              maxlength="30"
                            />
                            <p v-if="img.errorName" class="input-error">아이템명을 입력하세요</p>
                          </div>
                          <div class="field">
                            <template v-if="isEventBattle">
                              <label class="field-label">
                                인스타 아이디 <span class="req-mark" aria-label="필수">*</span>
                                <button
                                  type="button"
                                  class="hint-trigger"
                                  :aria-expanded="img.showEventHint ? 'true' : 'false'"
                                  :aria-label="img.showEventHint ? '안내 닫기' : '이벤트 응모 안내 보기'"
                                  @click="img.showEventHint = !img.showEventHint"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                  </svg>
                                </button>
                              </label>
                              <input
                                v-model="img.eventId"
                                type="text"
                                placeholder="@yogurtte"
                                class="card-input small"
                                maxlength="50"
                                autocapitalize="off"
                                autocorrect="off"
                                spellcheck="false"
                              />
                              <Transition name="hint-slide">
                                <p v-if="img.showEventHint" class="event-id-hint">
                                  <svg class="hint-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                  </svg>
                                  <span class="hint-body">
                                    <strong class="hint-title">비공개 · 운영자만 확인</strong>
                                    <span class="hint-desc">이벤트 추첨/안내 외 용도로는 절대 사용되지 않으며, 다른 사용자에게 노출되지 않아요.</span>
                                  </span>
                                </p>
                              </Transition>
                            </template>
                            <template v-else>
                              <label class="field-label">추가 설명 <span class="opt-mark">(선택)</span></label>
                              <input
                                v-model="img.customBrand"
                                type="text"
                                placeholder="브랜드명 등"
                                class="card-input small"
                                maxlength="20"
                              />
                            </template>
                          </div>
                        </div>
                        <button
                          type="button"
                          class="card-add-btn"
                          :disabled="!canAddSingle(img)"
                          @click="addSingleImage(img.id)"
                        >
                          <svg v-if="img.submitting" width="14" height="14" viewBox="0 0 24 24" class="card-add-spinner">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.3"/>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
                          </svg>
                          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {{ img.submitting ? '추가 중...' : '추가' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 제품 검색 탭 -->
            <div v-if="activeTab === 'search'" class="input-panel">
              <div class="product-search-wrapper">
                <div class="product-search-bar">
                  <svg class="product-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref="searchInput"
                    v-model="searchKeyword"
                    type="text"
                    class="product-search-input"
                    placeholder="제품명을 검색하세요 (예: 나이키 조던 4)"
                    @input="handleSearchInput"
                    @keyup.enter="handleSearch"
                  />
                  <div v-if="searching" class="product-search-spinner">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>

                <div v-if="products.length > 0" class="product-suggestions">
                  <button
                    v-for="p in products"
                    :key="p.productId || p.id"
                    type="button"
                    class="product-suggestion-item"
                    :disabled="submittingProductId === (p.productId || p.id)"
                    @click="selectProduct(p)"
                  >
                    <img
                      :src="getProductImage(p)"
                      :alt="p.name"
                      class="product-suggestion-thumb"
                      @error="handleImageError"
                    />
                    <div class="product-suggestion-info">
                      <p class="product-suggestion-name">{{ p.name }}</p>
                      <p class="product-suggestion-brand">{{ p.brand }}</p>
                    </div>
                    <span
                      v-if="submittingProductId === (p.productId || p.id)"
                      class="product-suggestion-badge"
                    >추가 중...</span>
                    <svg v-else class="product-suggestion-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <p v-if="!searchKeyword.trim() && !searching" class="product-search-hint">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  제품명을 입력하면 등록된 아이템을 자동으로 찾아드려요
                </p>
                <p v-else-if="searchKeyword.trim() && !searching && products.length === 0" class="product-search-hint">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  검색 결과가 없어요. "이미지 업로드" 탭에서 새 아이템을 만들 수 있어요
                </p>
              </div>
            </div>

            <!-- YouTube 탭 -->
            <div v-if="activeTab === 'youtube'" class="input-panel">
              <div class="youtube-input-section">
                <div class="input-row">
                  <input
                    v-model="youtubeUrl"
                    type="text"
                    placeholder="YouTube 링크를 붙여넣으세요"
                    class="youtube-input"
                    @input="handleYoutubeInput"
                    @keyup.enter="submitYoutubeItem"
                  />
                  <button
                    class="add-btn"
                    :disabled="!isYoutubeValid || submittingYoutube"
                    @click="submitYoutubeItem"
                    type="button"
                  >
                    <span v-if="submittingYoutube" class="btn-loading">
                      <span class="spinner-tiny"></span>
                    </span>
                    <span v-else>추가</span>
                  </button>
                </div>

                <div v-if="youtubePreview" class="youtube-preview">
                  <div class="preview-thumbnail">
                    <img :src="youtubePreview.thumbnail" :alt="youtubePreview.customName || 'YouTube 영상'" />
                    <div class="play-overlay">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
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
                    />
                    <input
                      v-model="youtubePreview.customBrand"
                      type="text"
                      placeholder="추가 설명 (선택)"
                      class="preview-input small"
                      maxlength="20"
                    />
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
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { productService } from '@/services/ProductService.js'
import { fileService } from '@/services/FileService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  battleId: {
    type: [String, Number],
    default: null
  }
})
const emit = defineEmits(['close', 'submit-image', 'select-product', 'submit-youtube'])

const { open } = useConfirmDialog()

// 이벤트 배틀(현재 battleId=21) — '추가 설명' 자리를 '인스타 아이디' 로 교체하고
// 백엔드에는 customBrand 가 아닌 eventId 필드로 전송
const EVENT_BATTLE_IDS = new Set([21])
const isEventBattle = computed(() => EVENT_BATTLE_IDS.has(Number(props.battleId)))

const tabs = [
  {
    id: 'image',
    label: '이미지 업로드',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
  },
  {
    id: 'search',
    label: '요거뜨 아이템',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>'
  }
]

const activeTab = ref('image')
const isDragging = ref(false)

const tabHints = {
  image: '한 번에 여러 장도 OK — 각 사진에 이름을 적고 "추가" 버튼을 눌러주세요.',
  search: '요거뜨에 이미 등록된 제품을 검색해서 빠르게 추가할 수 있어요.',
  youtube: 'YouTube 영상 링크를 붙여넣으면 썸네일까지 자동으로 가져와요.'
}

const activeTabHint = computed(() => tabHints[activeTab.value])

// ===== 다중 이미지 상태 =====
const pendingImages = ref([])
let nextImageId = 1

function makeImageEntry(file, previewUrl) {
  return {
    id: nextImageId++,
    file,
    previewUrl,
    customName: '',
    customBrand: '',
    eventId: '', // 이벤트 배틀일 때만 사용 (인스타 아이디)
    showEventHint: false, // 이벤트 안내 펼침 토글
    uploading: true,
    uploadedUrl: null,
    failed: false,
    submitting: false,
    errorName: false
  }
}

const canAddSingle = (img) => {
  return !img.uploading && !img.failed && img.uploadedUrl && img.customName.trim().length > 0 && !img.submitting
}

const canAddAll = computed(() => {
  return pendingImages.value.some(canAddSingle) && !pendingImages.value.some(i => i.submitting)
})

// 이미지 리사이징 (메모리 효율 + S3 비용 절감)
function resizeImage(file, maxSize = 1920, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      if (width <= maxSize && height <= maxSize) {
        resolve(file)
        return
      }

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
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resized = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(resized)
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

async function uploadOne(entry) {
  entry.uploading = true
  entry.failed = false
  try {
    const result = await fileService.uploadFiles(entry.file, { fileCode: 'BATTLE_ITEM' })
    if (result?.success && result?.data?.fileUrl) {
      entry.uploadedUrl = result.data.fileUrl
      entry.uploading = false
      entry.failed = false
    } else {
      entry.uploading = false
      entry.failed = true
      console.warn('[AddProductModal] 업로드 응답 비정상:', result)
    }
  } catch (error) {
    entry.uploading = false
    entry.failed = true
    console.error('[AddProductModal] 이미지 업로드 실패:', error)
  }
}

async function ingestFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    if (file.size > 10 * 1024 * 1024) {
      await open({ type: 'alert', title: '파일 크기 초과', message: `${file.name}은(는) 10MB를 초과합니다.` })
      continue
    }

    let resized
    try {
      resized = await resizeImage(file, 1920, 0.85)
    } catch (e) {
      console.error('[AddProductModal] 리사이즈 실패:', e)
      resized = file
    }

    const previewUrl = URL.createObjectURL(resized)
    const entry = makeImageEntry(resized, previewUrl)
    pendingImages.value.push(entry)
    // 배열에 push 된 reactive proxy 를 넘겨야 .uploading 변경이 화면에 반영됨
    // (로컬 plain object 를 그대로 넘기면 mutation 이 reactive 시스템 밖에서 일어남)
    uploadOne(pendingImages.value[pendingImages.value.length - 1])
  }
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  await ingestFiles(files)
}

const handleDrop = async (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  await ingestFiles(files)
}

const removePendingImage = (id) => {
  const idx = pendingImages.value.findIndex(i => i.id === id)
  if (idx === -1) return
  const item = pendingImages.value[idx]
  if (item.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
  pendingImages.value.splice(idx, 1)
}

const retryUpload = (id) => {
  const entry = pendingImages.value.find(i => i.id === id)
  if (!entry) return
  uploadOne(entry)
}

const addSingleImage = (id) => {
  const entry = pendingImages.value.find(i => i.id === id)
  if (!entry) return
  if (!entry.customName.trim()) {
    entry.errorName = true
    return
  }
  entry.errorName = false
  if (!canAddSingle(entry)) return
  entry.submitting = true
  emit('submit-image', {
    id: entry.id,
    customName: entry.customName.trim(),
    // 이벤트 배틀이면 customBrand 자리에는 입력 자체가 없음 → null
    customBrand: isEventBattle.value ? null : (entry.customBrand.trim() || null),
    customImageUrl: entry.uploadedUrl,
    // 이벤트 배틀일 때만 eventId 동봉 (백엔드는 battleId=21 일 때만 처리)
    eventId: isEventBattle.value ? (entry.eventId.trim() || null) : null
  })
}

const addAllImages = () => {
  pendingImages.value
    .filter(canAddSingle)
    .forEach(img => addSingleImage(img.id))
}

// 부모가 호출 — 단건 추가 성공/실패
function markItemSuccess(id) {
  removePendingImage(id)
}
function markItemFailure(id) {
  const entry = pendingImages.value.find(i => i.id === id)
  if (entry) entry.submitting = false
}

// ===== 제품 검색 =====
const searchInput = ref(null)
const searchKeyword = ref('')
const products = ref([])
const searching = ref(false)
const submittingProductId = ref(null)
let searchTimeout = null

const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (searchKeyword.value.trim().length === 0) {
    products.value = []
    return
  }
  searchTimeout = setTimeout(handleSearch, 300)
}

const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    products.value = []
    return
  }
  searching.value = true
  try {
    const response = await productService.getProducts(
      { keyword, status: 'APPROVED' },
      { page: 0, size: 20, sort: 'createdAt,DESC' }
    )
    if (response.success && response.data) {
      products.value = response.data.content || response.data || []
    } else {
      products.value = []
    }
  } catch (error) {
    console.error('아이템 검색 실패:', error)
    products.value = []
  } finally {
    searching.value = false
  }
}

const selectProduct = (product) => {
  const id = product.productId || product.id
  if (submittingProductId.value) return
  submittingProductId.value = id
  emit('select-product', {
    productId: id,
    name: product.name,
    brand: product.brand,
    thumbnailUrl: getProductImage(product)
  })
}

function markProductDone() {
  submittingProductId.value = null
}

const getProductImage = (product) => {
  return product.thumbnailDto?.fileUrl || product.thumbnailUrl || '/default-product.png'
}

const handleImageError = (e) => {
  e.target.src = '/default-product.png'
}

// ===== YouTube =====
const youtubeUrl = ref('')
const youtubePreview = ref(null)
const submittingYoutube = ref(false)

const isYoutubeValid = computed(() => {
  return youtubePreview.value && youtubePreview.value.customName?.trim().length > 0
})

const extractYoutubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const getYoutubeThumbnail = (videoId) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

const handleYoutubeInput = () => {
  const videoId = extractYoutubeId(youtubeUrl.value)
  if (videoId) {
    youtubePreview.value = {
      videoId,
      thumbnail: getYoutubeThumbnail(videoId),
      customName: '',
      customBrand: ''
    }
  } else {
    youtubePreview.value = null
  }
}

const submitYoutubeItem = () => {
  if (!isYoutubeValid.value || submittingYoutube.value) return
  submittingYoutube.value = true
  emit('submit-youtube', {
    customName: youtubePreview.value.customName.trim(),
    customBrand: youtubePreview.value.customBrand?.trim() || '',
    customImageUrl: youtubePreview.value.thumbnail,
    youtubeVideoId: youtubePreview.value.videoId,
    contentUrl: `https://www.youtube.com/watch?v=${youtubePreview.value.videoId}`
  })
}

function markYoutubeDone(success) {
  submittingYoutube.value = false
  if (success) {
    youtubeUrl.value = ''
    youtubePreview.value = null
  }
}

// Focus search input when switching to search tab
watch(activeTab, async (newTab) => {
  if (newTab === 'search') {
    await nextTick()
    if (searchInput.value) searchInput.value.focus()
  }
})

onBeforeUnmount(() => {
  pendingImages.value.forEach(img => {
    if (img.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(img.previewUrl)
  })
  if (searchTimeout) clearTimeout(searchTimeout)
})

defineExpose({ markItemSuccess, markItemFailure, markProductDone, markYoutubeDone })
</script>

<style scoped>
/* ============================= */
/* 배틀 만들기 Step2 와 동일한 톤  */
/* ============================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

@media (min-width: 640px) {
  .modal-overlay { align-items: center; }
}

.modal-container {
  background: var(--bg-elevated);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

@media (min-width: 640px) {
  .modal-container {
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin: 0;
}

.btn-close {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  color: var(--c-text-500);
  transition: background 0.15s, color 0.15s;
}

.btn-close:hover {
  background: var(--border-default);
  color: var(--text-primary);
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

/* ===== 탭 ===== */
.input-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 14px;
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
  padding: 11px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
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

.tab-icon { display: flex; align-items: center; }
.tab-label { white-space: nowrap; }

/* ===== 탭 안내 ===== */
.tab-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: var(--c-brand-soft);
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--c-brand-hover);
  line-height: 1.5;
}

.tab-hint svg {
  flex-shrink: 0;
  margin-top: 2px;
}

/* ===== 입력 패널 공통 ===== */
.input-panel {
  padding: 20px;
  background: var(--bg-subtle);
  border-radius: 12px;
  border: 1px solid var(--border-strong);
}

/* ===== 이미지 업로드 ===== */
.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px 24px;
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

.hidden-input { display: none; }

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

/* ===== 대기 이미지 목록 ===== */
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
  padding: 12px 16px;
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border-strong);
}

.pending-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-600);
}

.add-all-btn {
  padding: 7px 14px;
  background: var(--c-brand);
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.pending-card {
  display: flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s;
}

.pending-card.is-failed {
  border-color: var(--c-danger);
}

.pending-card-image {
  position: relative;
  width: 92px;
  height: 92px;
  flex-shrink: 0;
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
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  z-index: 2;
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
  gap: 6px;
  color: white;
  font-size: 11.5px;
  font-weight: 500;
}

.upload-overlay.failed {
  background: rgba(239, 68, 68, 0.85);
  gap: 4px;
}

.upload-overlay .retry-btn {
  margin-top: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1.5px solid white;
  background: transparent;
  color: white;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}

.upload-overlay .retry-btn:hover {
  background: white;
  color: var(--c-danger);
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.pending-card-inputs {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.fields-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.field-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.req-mark {
  color: var(--c-danger);
  font-weight: 800;
  font-size: 11px;
  line-height: 1;
}

.opt-mark {
  color: var(--c-text-400);
  font-size: 10px;
  font-weight: 500;
}

.pending-card-inputs .card-add-btn {
  margin-top: 18px; /* 라벨 위 공간만큼 내려서 첫 input 과 정렬 */
  align-self: flex-start; /* stretch 해제 → 본연의 높이 유지 */
  width: auto;
  padding: 8px 14px;
  font-size: 12px;
  flex-shrink: 0;
}

.card-input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--border-strong);
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 500;
  font-family: inherit;
  background: var(--bg-elevated);
  color: var(--text-primary);
  letter-spacing: -0.01em;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.card-input::placeholder {
  color: var(--c-text-400);
  font-weight: 500;
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

.card-input.small {
  font-size: 11.5px;
  padding: 6px 10px;
}

.input-error {
  margin: -2px 0 0 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-danger);
}

/* 라벨 옆 ⓘ 안내 토글 버튼 */
.hint-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 2px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--c-text-400);
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.15s, color 0.15s;
}
.hint-trigger:hover,
.hint-trigger[aria-expanded="true"] {
  background: var(--c-brand-soft);
  color: var(--c-brand);
}

/* 안내 박스 슬라이드 인/아웃 */
.hint-slide-enter-active,
.hint-slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease, max-height 0.22s ease;
  overflow: hidden;
}
.hint-slide-enter-from,
.hint-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}
.hint-slide-enter-to,
.hint-slide-leave-from {
  opacity: 1;
  max-height: 200px;
}

/* 이벤트 응모(인스타 ID) 안내 — 잠금 아이콘 + 비공개 톤 */
.event-id-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 4px 0 0;
  padding: 10px 12px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  border-radius: 8px;
  line-height: 1.45;
  letter-spacing: -0.01em;
}
.event-id-hint .hint-icon {
  flex-shrink: 0;
  margin-top: 1px;
}
.event-id-hint .hint-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.event-id-hint .hint-title {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.event-id-hint .hint-desc {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--c-brand);
  opacity: 0.85;
}

.card-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 9px 14px;
  background: var(--c-brand);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: background 0.15s;
  margin-top: 2px;
}

.card-add-btn:hover:not(:disabled) {
  background: var(--c-brand-hover);
}

.card-add-btn:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

.card-add-spinner {
  animation: spin 0.8s linear infinite;
}

/* ===== 제품 검색 ===== */
.product-search-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: 12px;
  transition: all 0.15s ease;
}

.product-search-bar:focus-within {
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
  width: 100%;
}

.product-suggestion-item:hover:not(:disabled) {
  border-color: var(--c-brand);
  background: var(--c-brand-soft);
}

.product-suggestion-item:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.product-suggestion-thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
  background: var(--bg-mute);
}

.product-suggestion-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-suggestion-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-suggestion-brand {
  font-size: 12px;
  color: var(--c-text-500);
  font-weight: 500;
  margin: 0;
}

.product-suggestion-arrow {
  width: 16px;
  height: 16px;
  color: var(--c-text-400);
  flex-shrink: 0;
}

.product-suggestion-item:hover .product-suggestion-arrow {
  color: var(--c-brand);
}

.product-suggestion-badge {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  font-size: 11px;
  font-weight: 700;
}

.product-search-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  margin: 0;
  background: var(--bg-elevated);
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  font-size: 12.5px;
  color: var(--c-text-500);
  font-weight: 500;
  line-height: 1.5;
}

.product-search-hint svg {
  flex-shrink: 0;
  color: var(--c-text-400);
}

/* ===== YouTube ===== */
.youtube-input-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-row {
  display: flex;
  gap: 10px;
}

.youtube-input {
  flex: 1;
  min-width: 0;
  padding: 13px 16px;
  border: 2px solid var(--border-strong);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: var(--bg-elevated);
  color: var(--text-primary);
  transition: all 0.2s;
  box-sizing: border-box;
}

.youtube-input:focus {
  outline: none;
  border-color: #FF0000;
  box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
}

.youtube-input::placeholder {
  color: var(--c-text-400);
}

.add-btn {
  flex-shrink: 0;
  padding: 13px 22px;
  background: var(--c-brand);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: background 0.15s;
}

.add-btn:hover:not(:disabled) {
  background: var(--c-brand-hover);
}

.add-btn:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

.btn-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.spinner-tiny {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.youtube-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: var(--bg-elevated);
  border-radius: 12px;
  border: 1px solid var(--border-strong);
}

.preview-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
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
  opacity: 0.85;
}

.preview-info {
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
  background: var(--bg-subtle);
  color: var(--text-primary);
  transition: border-color 0.15s;
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
  padding: 24px;
  color: var(--c-text-400);
  text-align: center;
  background: var(--bg-elevated);
  border-radius: 12px;
  border: 1px dashed var(--border-strong);
}

.youtube-empty svg {
  margin-bottom: 10px;
  opacity: 0.6;
}

.youtube-empty p {
  font-size: 13px;
  margin: 0;
  font-weight: 500;
}

/* ===== Transition ===== */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .modal-container {
    transform: translateY(20px) scale(0.95);
  }
}

.modal-leave-to .modal-container {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-leave-to .modal-container {
    transform: translateY(20px) scale(0.95);
  }
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .modal-header { padding: 18px 20px 10px; }
  .modal-body { padding: 0 20px 20px; }
  .tab-btn { padding: 9px 8px; font-size: 12px; gap: 6px; }
  .input-panel { padding: 16px; }
  .drop-zone { padding: 28px 18px; }
  .youtube-input { padding: 12px 14px; font-size: 13px; }
  .add-btn { padding: 12px 18px; font-size: 13px; }

  /* 모바일 — 카드 = block 레이아웃, 이미지는 float 으로 좌측 상단에 두고
     이미지 높이까지는 옆에서 내용이 흐르다가 아래는 전체 폭 사용 → 빈 공간 제거 */
  .modal-body { padding: 0 12px 16px; }
  .input-panel { padding: 12px; }

  .pending-card {
    display: block;
    padding: 14px;
    border-radius: 12px;
    background: var(--bg-elevated);
    border-color: var(--border-default);
  }

  /* 이미지 — float 으로 좌측 상단, 텍스트가 옆/아래로 흐르게 */
  .pending-card-image {
    float: left;
    width: 100px;
    height: 100px;
    margin: 0 14px 10px 0;
    border-radius: 10px;
  }

  /* 인풋 패널: block 으로 변경 → 자연 흐름. 끝에 clearfix 로 float 해제 */
  .pending-card-inputs {
    display: block;
    padding: 0;
  }
  .pending-card-inputs::after {
    content: "";
    display: block;
    clear: both;
  }

  .fields-column { gap: 10px; }
  .field { gap: 5px; }

  .field-label {
    font-size: 11px;
    color: var(--c-text-600);
    font-weight: 700;
  }
  .req-mark { font-size: 11.5px; }
  .opt-mark { font-size: 10.5px; }

  .card-input {
    padding: 9px 12px;
    font-size: 13px;
    border-radius: 8px;
    border-color: var(--border-default);
  }
  .card-input.small {
    padding: 9px 12px;
    font-size: 12.5px;
  }
  .card-input::placeholder { font-size: 12.5px; }

  /* 추가 버튼 — fields 아래 풀너비 CTA, 시각 비중 살림 */
  .pending-card-inputs .card-add-btn {
    margin-top: 6px;
    align-self: stretch;
    width: 100%;
    padding: 11px;
    font-size: 13px;
    font-weight: 800;
    border-radius: 8px;
    min-width: 0;
    box-shadow: 0 1px 2px rgba(147, 51, 234, 0.18);
  }
  .card-add-btn svg {
    width: 14px;
    height: 14px;
  }

  .event-id-hint {
    margin-top: 4px;
    padding: 9px 11px;
    gap: 7px;
    line-height: 1.45;
    border-radius: 8px;
  }
  .event-id-hint .hint-icon { width: 12px; height: 12px; }
  .event-id-hint .hint-title { font-size: 11px; }
  .event-id-hint .hint-desc { font-size: 10.5px; }
}
</style>
