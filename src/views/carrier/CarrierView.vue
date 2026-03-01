<template>
  <div class="carrier-page" :class="{ 'no-select': !!dragId }">
        <!-- 헤더 -->
        <header class="carrier-top-header">
          <div class="header-container">
            <button class="back-btn" @click="router.back()">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12.5 15L7.5 10L12.5 5"/>
              </svg>
            </button>
            <div class="header-title-area">
              <h1 class="header-page-title">내 캐리어</h1>
              <span class="header-item-count">{{ items.length }}개 아이템</span>
            </div>
          </div>
        </header>

        <!-- 모바일 탭 바 -->
        <div class="mobile-tab-bar">
          <button
            class="mobile-tab"
            :class="{ active: mobileTab === 'shop' }"
            @click="mobileTab = 'shop'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>캐꾸샵</span>
          </button>
          <button
            class="mobile-tab"
            :class="{ active: mobileTab === 'carrier' }"
            @click="mobileTab = 'carrier'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/>
            </svg>
            <span>캐리어</span>
          </button>
          <button
            class="mobile-tab"
            :class="{ active: mobileTab === 'items' }"
            @click="mobileTab = 'items'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span>아이템</span>
          </button>
        </div>

        <!-- 로딩 -->
        <div v-if="apiLoading && items.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>캐리어를 불러오는 중...</p>
        </div>

        <!-- 메인 컨텐츠 -->
        <div v-else class="carrier-content">
          <div class="carrier-layout">

            <!-- 좌측: 캐꾸샵 -->
            <div class="left-panel" :class="{ 'mobile-active': mobileTab === 'shop' }">
              <div class="panel-title-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span class="panel-label">캐꾸샵</span>
              </div>

              <SkinCarousel
                :active-skin="activeSkin"
                :all-skin-items="allSkinItems"
                :current-skin-name="currentSkin.name"
                :skin-scroll="skinScroll"
                :skin-max-scroll="skinMaxScroll"
                :has-unsaved-changes="hasUnsavedChanges"
                :saving="saving"
                @update:active-skin="activeSkin = $event"
                @update:skin-scroll="skinScroll = $event"
                @save="saveAllChanges"
              />

              <StickerPackPanel
                :sticker-pack="stickerPack"
                :deco-page="decoPage"
                :has-phototag="hasPhototag"
                :deco-count="decos.length"
                @update:sticker-pack="stickerPack = $event"
                @update:deco-page="decoPage = $event"
                @place-deco="placeDeco"
                @bulk-delete="bulkDeleteAllDecos"
              />
            </div>

            <!-- 중앙: 캐리어 뷰 -->
            <CarrierCanvas
              ref="canvasRef"
              :current-skin="currentSkin"
              :is-open="isOpen"
              :items="items"
              :decos="decos"
              :sel-deco="selDeco"
              :selected="selected"
              :name-tag-img="nameTagImg"
              :phototag-uploading="phototagUploading"
              :has-phototag="hasPhototag"
              :active-skin="activeSkin"
              :default-color="defaultColor"
              :active-slot-idx="activeSlotIdx"
              :slot-carrier-ids="slotCarrierIds"
              :slot-switching="slotSwitching"
              :has-unsaved-changes="hasUnsavedChanges"
              :mobile-tab="mobileTab"
              @toggle="toggleOpen"
              @toggle-select="toggleSelect"
              @remove-item="removeItemFromCarrier"
              @select-slot="selectSlot"
              @deselect="selDeco = null; showColorPicker = false"
              @update:default-color="defaultColor = $event"
              @scale-deco="scaleDeco"
              @flip-deco="flipDeco"
              @remove-deco="removeDeco"
              @bulk-delete="bulkDeleteAllDecos"
              @phototag-upload="!phototagUploading && nameTagInputRef?.click()"
              @phototag-clear="clearPhototagImage"
              @phototag-select="selectPhototag"
              @phototag-remove="removePhototag"
              @bubble-drag-end="dirtyBubbles = true"
              @deco-down="onDecoDown"
              @deco-drag-end="markDecoDirty"
              @deco-resize-end="markDecoDirty"
              @update:decos="decos = $event"
            />

            <!-- 우측: 아이템 목록 -->
            <CarrierItemList
              :items="items"
              :sorted-items="sortedItems"
              :selected="selected"
              :items-expanded="itemsExpanded"
              :mobile-tab="mobileTab"
              @toggle-select="toggleSelect"
              @remove-item="removeItemFromCarrier"
              @update:items-expanded="itemsExpanded = $event"
            />
          </div>
        </div>

        <!-- 우하단 FAB 영역 -->
        <div class="fab-group">
          <button class="mobile-sticker-fab" @click.stop="mobileStickerTray = true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>
          <button class="share-fab" @click.stop="showShareModal = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <Transition name="save-fab">
            <button
              v-if="hasUnsavedChanges"
              class="save-fab"
              :class="{ saving }"
              :disabled="saving"
              @click="saveAllChanges"
            >
              <svg v-if="!saving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <div v-else class="save-spinner"></div>
              <span>{{ saving ? '저장 중...' : '저장' }}</span>
            </button>
          </Transition>
        </div>

        <!-- 모바일 스티커 바텀 트레이 -->
        <MobileStickerTray
          :visible="mobileStickerTray"
          :sticker-pack="stickerPack"
          :cur-stickers="curStickers"
          :has-phototag="hasPhototag"
          @update:visible="mobileStickerTray = $event"
          @update:sticker-pack="stickerPack = $event"
          @place-deco="placeDeco"
        />

        <!-- 공유 모달 -->
        <ShareModal
          :visible="showShareModal"
          :current-skin="currentSkin"
          :is-open="isOpen"
          :share-bubbles="shareBubbles"
          :sorted-items="sortedItems"
          :emoji-decos="emojiDecos"
          :has-phototag="hasPhototag"
          :name-tag-img="nameTagImg"
          :share-nickname="shareNickname"
          :share-bg="shareBg"
          @update:visible="showShareModal = $event"
          @update:share-nickname="shareNickname = $event"
        />

        <!-- 네임택 사진 업로드용 hidden input -->
        <input ref="nameTagInputRef" type="file" accept="image/*" style="display: none" @change="onNameTagImgChange"/>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCarrier } from '@/composables/useCarrier.js'
import { CARRIER_TYPE } from '@/services/CarrierService.js'
import { fileService } from '@/services/FileService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import {
  DMIN, DMAX, SLOT_COUNT, DEFAULT_COLORS, BASE_SKINS, STICKER_PACKS,
  SHARE_BG, SKIN_TYPE_MAP, SKIN_TYPE_REVERSE, IW, G, CVB,
  skinColorToColorId, colorIdToSkinColor, getBounds, getRankStyle
} from './constants.js'
import SkinCarousel from './components/SkinCarousel.vue'
import StickerPackPanel from './components/StickerPackPanel.vue'
import CarrierCanvas from './components/CarrierCanvas.vue'
import CarrierItemList from './components/CarrierItemList.vue'
import MobileStickerTray from './components/MobileStickerTray.vue'
import ShareModal from './components/ShareModal.vue'

const router = useRouter()
const { open: openConfirm } = useConfirmDialog()

// ==================== API Composable ====================
const { loading: apiLoading, error: apiError, carriers, currentCarrier, fetchMyCarriers, fetchCarrier, createCarrier, updateSkin, deleteCarrier, addItem: apiAddItem, removeItem: apiRemoveItem, addSticker: apiAddSticker, updateSticker: apiUpdateSticker, removeSticker: apiRemoveSticker, bulkDeleteStickers: apiBulkDeleteStickers, updatePositions } = useCarrier()

const canvasRef = ref(null)
const carrierId = ref(null)
const activeSlotIdx = ref(0)
const slotCarrierIds = ref([null, null])
const slotSwitching = ref(false)

// ==================== 상태 ====================
const isOpen = ref(false)
const items = ref([])
const selected = ref(null)
const defaultColor = ref('violet')
const showColorPicker = ref(false)
const activeSkin = ref('default')
const skinScroll = ref(0)
const stickerPack = ref('basic')
const decoPage = ref(0)
const decos = ref([])
const selDeco = ref(null)
const showShareModal = ref(false)
const shareNickname = ref('')
const itemsExpanded = ref(false)
const mobileTab = ref('carrier')
const mobileStickerTray = ref(false)
const dragId = ref(null)
const dirtyDecos = ref(new Set())
const dirtyBubbles = ref(false)
const saving = ref(false)

const nameTagImg = ref(null)
const nameTagInputRef = ref(null)
const phototagUploading = ref(false)

const pendingAdds = ref([])
const pendingDeletes = ref([])
const dirtySkin = ref(false)

const hasUnsavedChanges = computed(() =>
  dirtyDecos.value.size > 0 ||
  dirtyBubbles.value ||
  pendingAdds.value.length > 0 ||
  pendingDeletes.value.length > 0 ||
  dirtySkin.value
)

// ==================== 스킨 시스템 ====================
const dc = computed(() => DEFAULT_COLORS.find(c => c.id === defaultColor.value) || DEFAULT_COLORS[0])

const appliedSkins = computed(() => BASE_SKINS.map(s =>
  s.id === 'default'
    ? { ...s, desc: dc.value.label, body: { ...dc.value.body }, groove: { ...dc.value.groove }, handle: { ...dc.value.handle }, wheel: { ...dc.value.wheel } }
    : s
))

const allSkins = computed(() => [...appliedSkins.value])
const currentSkin = computed(() => allSkins.value.find(s => s.id === activeSkin.value) || allSkins.value[0])

const nSkins = computed(() => allSkins.value.filter(s => !s.special))
const sSkins = computed(() => allSkins.value.filter(s => s.special))
const allSkinItems = computed(() => [...nSkins.value, ...sSkins.value])

const skinMaxScroll = computed(() => {
  const totalW = allSkinItems.value.length * (IW + G) - G
  const VW = IW * 2 + G + IW * 0.5
  return Math.max(0, totalW - VW)
})

// ==================== 스티커 ====================
const hasPhototag = computed(() => decos.value.some(d => d.type === 'phototag'))
const emojiDecos = computed(() => decos.value.filter(d => d.type !== 'phototag'))
const curStickers = computed(() => STICKER_PACKS[stickerPack.value] || [])
const sortedItems = computed(() => [...items.value])

// ==================== 공유 ====================
const shareBg = computed(() => SHARE_BG[currentSkin.value.body.stroke] || '#e5e1f7')

const shareBubbles = computed(() => {
  const canvas = canvasRef.value
  if (!canvas?.dims?.w || !canvas?.dims?.h) return []
  const dimsW = canvas.dims.w, dimsH = canvas.dims.h
  const rendered = canvas.posRef.current
  if (!rendered.length) return []
  const b = getBounds(dimsW, dimsH)
  const bw = b.right - b.left, bh = b.bottom - b.top
  const svgW = CVB.x2 - CVB.x1, svgH = CVB.y2 - CVB.y1
  const nodes = sortedItems.value.map((p, i) => {
    const count = sortedItems.value.length
    const ratio = count <= 1 ? 1 : 1 - (i / count) * 0.4
    return { id: p.id, r: 28 + (80 - 28) * ratio }
  })
  return rendered.map((pos, i) => {
    if (!pos || !sortedItems.value[i] || !nodes[i]) return null
    const n = nodes[i]
    const rs = getRankStyle(i + 1, sortedItems.value.length)
    const rx = (pos.x - b.left) / bw
    const ry = (pos.y - b.top) / bh
    const rr = n.r / bw
    return {
      cx: CVB.x1 + rx * svgW,
      cy: CVB.y1 + ry * svgH,
      r: rr * svgW,
      bg: typeof rs.bg === 'string' && rs.bg.includes('gradient') ? (i === 0 ? '#7c3aed' : i === 1 ? '#8b5cf6' : i === 2 ? '#a78bfa' : '#f0edf9') : rs.bg,
      border: rs.border,
      tc: rs.tc,
      sc: rs.sc,
      name: sortedItems.value[i].name,
      brand: sortedItems.value[i].brand
    }
  }).filter(Boolean)
})

// ==================== 아이템 관련 ====================
function toggleSelect(id) {
  selected.value = selected.value === id ? null : id
}

async function removeItemFromCarrier(id) {
  if (carrierId.value) {
    const success = await apiRemoveItem(carrierId.value, id)
    if (!success) return
  }
  items.value = items.value.filter(i => i.id !== id)
  if (selected.value === id) selected.value = null
}

// ==================== 토글 ====================
function toggleOpen() {
  isOpen.value = !isOpen.value
}

// ==================== 데코 ====================
function onDecoDown(data) {
  if (data.type === 'tap') {
    selDeco.value = selDeco.value === data.uid ? null : data.uid
  } else if (data.type === 'pinch') {
    selDeco.value = data.uid
  }
}

function markDecoDirty(uid) {
  const deco = decos.value.find(v => v.uid === uid)
  if (deco?.apiId) {
    dirtyDecos.value = new Set([...dirtyDecos.value, uid])
  }
}

function scaleDeco(uid, delta) {
  decos.value = decos.value.map(v => v.uid === uid ? { ...v, scale: Math.max(DMIN, Math.min(DMAX, v.scale + delta)) } : v)
  markDecoDirty(uid)
}

function flipDeco(uid) {
  decos.value = decos.value.map(v => v.uid === uid ? { ...v, flipped: !v.flipped } : v)
  markDecoDirty(uid)
}

function removeDeco(uid) {
  const deco = decos.value.find(v => v.uid === uid)
  if (deco?.apiId) {
    pendingDeletes.value = [...pendingDeletes.value, deco.apiId]
  } else {
    pendingAdds.value = pendingAdds.value.filter(u => u !== uid)
  }
  decos.value = decos.value.filter(v => v.uid !== uid)
  dirtyDecos.value = new Set([...dirtyDecos.value].filter(u => u !== uid))
  if (selDeco.value === uid) selDeco.value = null
}

function bulkDeleteAllDecos() {
  if (!decos.value.length) return
  const apiIds = decos.value.filter(d => d.apiId).map(d => d.apiId)
  if (apiIds.length > 0) {
    pendingDeletes.value = [...pendingDeletes.value, ...apiIds]
  }
  pendingAdds.value = []
  decos.value = []
  nameTagImg.value = null
  selDeco.value = null
  dirtyDecos.value = new Set()
}

function placeDeco(d) {
  if (d.type === 'phototag') {
    const existing = decos.value.find(v => v.type === 'phototag')
    if (existing) {
      if (existing.apiId) {
        pendingDeletes.value = [...pendingDeletes.value, existing.apiId]
      } else {
        pendingAdds.value = pendingAdds.value.filter(uid => uid !== existing.uid)
      }
      decos.value = decos.value.filter(v => v.type !== 'phototag')
      nameTagImg.value = null
      return
    }
  }

  const tempUid = d.id + '_' + Date.now()
  const newDeco = {
    uid: tempUid, id: d.id, emoji: d.emoji,
    type: d.type || 'emoji',
    x: 30 + Math.random() * 40, y: 30 + Math.random() * 40, scale: 1, flipped: false
  }

  decos.value = [...decos.value, newDeco]
  pendingAdds.value = [...pendingAdds.value, tempUid]
}

// ==================== 네임택 ====================
async function onNameTagImgChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''

  const reader = new FileReader()
  reader.onload = ev => { nameTagImg.value = ev.target.result }
  reader.readAsDataURL(file)

  phototagUploading.value = true
  try {
    const result = await fileService.uploadFiles(file, { fileCode: 'CARRIER' })
    if (result.success && result.data) {
      const fileUrl = result.data.fileUrl || result.data.storedPath
      if (fileUrl) {
        const phototag = decos.value.find(d => d.type === 'phototag')
        if (phototag) {
          phototag.imageUrl = fileUrl
          nameTagImg.value = fileUrl
          markDecoDirty(phototag.uid)
        }
      }
    }
  } catch (err) {
    console.error('[CARRIER] 포토택 이미지 업로드 실패:', err)
  } finally {
    phototagUploading.value = false
  }
}

function clearPhototagImage() {
  nameTagImg.value = null
  const phototag = decos.value.find(d => d.type === 'phototag')
  if (phototag) {
    phototag.imageUrl = null
    markDecoDirty(phototag.uid)
  }
}

function removePhototag() {
  const phototag = decos.value.find(d => d.type === 'phototag')
  if (phototag) {
    removeDeco(phototag.uid)
    nameTagImg.value = null
  }
}

function selectPhototag() {
  const phototag = decos.value.find(d => d.type === 'phototag')
  if (phototag) {
    selDeco.value = selDeco.value === phototag.uid ? null : phototag.uid
  }
}

// ==================== 통합 저장 ====================
async function saveAllChanges() {
  if (!carrierId.value || saving.value) return
  saving.value = true

  try {
    // Phase 1: 스킨 변경
    if (dirtySkin.value) {
      const skinType = SKIN_TYPE_REVERSE[activeSkin.value] || CARRIER_TYPE.DEFAULT
      const skinColor = skinType === CARRIER_TYPE.DEFAULT ? colorIdToSkinColor(defaultColor.value) : null
      await updateSkin(carrierId.value, { skinType, skinColor })
    }

    // Phase 2: 스티커 삭제
    if (pendingDeletes.value.length > 0) {
      if (pendingDeletes.value.length > 1) {
        await apiBulkDeleteStickers(carrierId.value, pendingDeletes.value)
      } else {
        await apiRemoveSticker(carrierId.value, pendingDeletes.value[0])
      }
    }

    // Phase 3: 새 스티커 추가
    for (const uid of pendingAdds.value) {
      const deco = decos.value.find(v => v.uid === uid)
      if (!deco) continue

      const stickerType = deco.type === 'phototag' ? 'PHOTO_TAG' : 'EMOJI'
      const addData = {
        stickerType,
        content: deco.emoji || null,
        imageUrl: deco.imageUrl || null,
        positionX: deco.x / 100,
        positionY: deco.y / 100,
        zIndex: 0,
        rotation: deco.rotation ?? 0,
        scaleRatio: deco.scale ?? 1.0
      }
      const result = await apiAddSticker(carrierId.value, addData)
      if (result.success && result.data?.id) {
        deco.apiId = result.data.id
      }
    }

    // Phase 4: 변경된 스티커 위치/스케일 업데이트
    const updatePromises = []
    for (const uid of dirtyDecos.value) {
      const deco = decos.value.find(v => v.uid === uid)
      if (deco?.apiId) {
        const updateData = {
          positionX: deco.x / 100,
          positionY: deco.y / 100,
          scaleRatio: deco.scale,
          rotation: deco.rotation ?? 0
        }
        if (deco.type === 'phototag') {
          updateData.imageUrl = deco.imageUrl ?? null
        }
        updatePromises.push(apiUpdateSticker(carrierId.value, deco.apiId, updateData))
      }
    }

    // Phase 5: 버블 위치 저장
    const canvas = canvasRef.value
    if (dirtyBubbles.value && canvas?.posRef?.current?.length) {
      const cDims = canvas.dims
      const b = getBounds(cDims.w, cDims.h)
      const bw = b.right - b.left, bh = b.bottom - b.top
      if (bw > 0 && bh > 0) {
        const itemPositions = canvas.posRef.current.map(p => ({
          itemId: p.id,
          positionX: Math.max(0, Math.min(1, (p.x - b.left) / bw)),
          positionY: Math.max(0, Math.min(1, (p.y - b.top) / bh)),
          zIndex: 0
        }))
        updatePromises.push(updatePositions(carrierId.value, itemPositions, null))
      }
    }

    await Promise.all(updatePromises)

    // Phase 6: dirty 상태 초기화
    dirtyDecos.value = new Set()
    dirtyBubbles.value = false
    pendingAdds.value = []
    pendingDeletes.value = []
    dirtySkin.value = false
    decos.value = [...decos.value]
  } finally {
    saving.value = false
  }
}

// ==================== API 데이터 로드 ====================
async function loadCarrierData() {
  await fetchMyCarriers()

  if (carriers.value.length === 0) {
    const result = await createCarrier({ name: '캐꾸 1', skinType: CARRIER_TYPE.DEFAULT, skinColor: '#7c3aed' })
    if (result.success) {
      await fetchMyCarriers()
    }
  }

  slotCarrierIds.value = [null, null]
  carriers.value.forEach((c, i) => {
    if (i < SLOT_COUNT) slotCarrierIds.value[i] = c.id
  })

  await loadSlot(0)
}

async function loadSlot(idx) {
  slotSwitching.value = true
  try {
    let cid = slotCarrierIds.value[idx]
    if (!cid) {
      const result = await createCarrier({ name: `캐꾸 ${idx + 1}`, skinType: CARRIER_TYPE.DEFAULT, skinColor: '#7c3aed' })
      if (!result.success) return
      await fetchMyCarriers()
      cid = result.data.id
      slotCarrierIds.value[idx] = cid
    }
    const detail = await fetchCarrier(cid)
    if (detail) {
      carrierId.value = cid
      activeSlotIdx.value = idx
      applyCarrierData(detail)
    }
  } finally {
    slotSwitching.value = false
  }
}

async function selectSlot(idx) {
  if (idx === activeSlotIdx.value || slotSwitching.value) return
  if (hasUnsavedChanges.value) {
    const result = await openConfirm({
      title: '변경사항을 저장할까요?',
      message: '다른 캐꾸로 이동하기 전에 현재 변경사항을 저장합니다.',
      confirmText: '저장하기',
      cancelText: '저장 안 함'
    })
    if (result === null) return
    if (result === true) await saveAllChanges()
  }
  await loadSlot(idx)
}

function applyCarrierData(carrier) {
  pendingAdds.value = []
  pendingDeletes.value = []
  dirtySkin.value = false
  dirtyDecos.value = new Set()
  dirtyBubbles.value = false

  const skinId = SKIN_TYPE_MAP[carrier.skinType] || 'default'
  activeSkin.value = skinId

  if (skinId === 'default' && carrier.skinColor) {
    defaultColor.value = skinColorToColorId(carrier.skinColor)
  }

  items.value = (carrier.items || []).map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.productName || '상품',
    brand: item.brandName || '',
    imageUrl: item.productImageUrl || null,
    positionX: item.positionX ?? 0.5,
    positionY: item.positionY ?? 0.5,
    zIndex: item.zIndex ?? 0
  }))

  const apiStickers = carrier.stickers || []
  nameTagImg.value = null
  selDeco.value = null
  decos.value = apiStickers.map(s => ({
    uid: 'api_' + s.id,
    apiId: s.id,
    id: s.stickerType,
    emoji: s.content || s.stickerType,
    type: s.stickerType === 'PHOTO_TAG' ? 'phototag' : 'emoji',
    content: s.content || null,
    imageUrl: s.imageUrl || null,
    stickerType: s.stickerType,
    x: (s.positionX ?? 0.5) * 100,
    y: (s.positionY ?? 0.5) * 100,
    scale: s.scaleRatio ?? 1,
    flipped: false,
    rotation: s.rotation ?? 0
  }))

  const phototag = decos.value.find(d => d.type === 'phototag')
  if (phototag?.imageUrl) {
    nameTagImg.value = phototag.imageUrl
  }
}

onMounted(() => {
  loadCarrierData()
})

// 스킨 변경 시 dirty 마킹
watch(activeSkin, (newSkin, oldSkin) => {
  if (!carrierId.value || !oldSkin || slotSwitching.value) return
  dirtySkin.value = true
}, { flush: 'sync' })

watch(defaultColor, () => {
  if (!carrierId.value || activeSkin.value !== 'default' || slotSwitching.value) return
  dirtySkin.value = true
}, { flush: 'sync' })

onBeforeUnmount(async () => {
  if (hasUnsavedChanges.value) {
    await saveAllChanges()
  }
})
</script>

<style>
/* ==================== 기본 레이아웃 ==================== */
.carrier-page {
  min-height: 100vh;
  background: #fff;
  color: #1a1a1a;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

/* ==================== 헤더 ==================== */
.carrier-top-header {
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}
.carrier-top-header .header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.carrier-top-header .back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: none;
  background: #f5f3ff;
  color: #7c3aed;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.carrier-top-header .back-btn:hover { background: #ede9fe; }
.header-title-area {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.header-page-title {
  font-size: 17px;
  font-weight: 800;
  color: #111;
  margin: 0;
  white-space: nowrap;
}
.header-item-count {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}


/* ==================== 모바일 탭 바 ==================== */
.mobile-tab-bar {
  display: none;
}

.carrier-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 60px;
}

.carrier-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: center;
}

.left-panel { flex: 0 0 280px; display: flex; flex-direction: column; gap: 16px; }
.center-panel { flex: 1 1 400px; min-width: 280px; max-width: 480px; display: flex; flex-direction: column; gap: 6px; }
.right-panel { flex: 0 0 220px; min-width: 200px; max-width: 240px; display: flex; flex-direction: column; gap: 16px; }

.panel-title-row { display: flex; align-items: center; gap: 6px; padding: 0 2px; margin-bottom: -6px; }
.panel-label { font-size: 14px; font-weight: 700; color: #333; letter-spacing: -0.3px; }

/* ==================== 카드 공통 ==================== */
.shop-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ebe7f2;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(124, 58, 237, 0.04);
}
.shop-card-header {
  padding: 12px 14px;
  border-bottom: 1px solid #f3f1f8;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.shop-card-title { font-size: 12px; font-weight: 700; color: #7c3aed; letter-spacing: -0.2px; }
.shop-card-actions { display: flex; align-items: center; gap: 6px; }

/* ==================== 스킨 캐러셀 ==================== */
.current-skin-badge {
  background: #f5f3ff;
  padding: 3px 10px;
  border-radius: 10px;
}
.current-skin-badge span { font-size: 10px; color: #7c3aed; font-weight: 600; }

.skin-carousel {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
}
.carousel-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  width: 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 1;
  transition: background .15s;
}
.carousel-btn:not(:disabled) { background: #f5f3ff; }
.carousel-btn:disabled { opacity: 0.25; cursor: default; }

.skin-viewport {
  width: calc(110px * 2 + 8px + 55px);
  overflow: hidden;
  flex-shrink: 0;
}
.skin-track {
  display: flex;
  gap: 8px;
  transition: transform .35s cubic-bezier(.4,0,.2,1);
}

.skin-item-wrap { flex: 0 0 110px; position: relative; }

.skin-preview {
  cursor: pointer;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  border: 1.5px solid #e0d8f5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s;
  background: #fff;
}
.skin-preview.active {
  border: 2.5px solid #7c3aed;
  box-shadow: 0 4px 16px rgba(124,58,237,0.15);
}

.skin-badge {
  position: absolute;
  z-index: 10;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 3px 8px;
}
.skin-badge.sp { top: 0; right: 0; background: linear-gradient(135deg,#f59e0b,#d97706); border-radius: 0 12px 0 8px; }

.skin-svg-wrap { padding: 12px 8px 8px; display: flex; justify-content: center; }
.skin-info { padding: 4px 10px 10px; text-align: center; }
.skin-name { font-size: 12px; font-weight: 700; color: #333; }
.skin-name.empty { color: #bbb; }
.skin-desc { font-size: 10px; color: #999; margin-top: 1px; }
.skin-desc.empty { color: #ccc; }
.skin-active-bar { height: 3px; background: linear-gradient(90deg, #7c3aed, #a78bfa); }

/* ==================== 스티커 팔레트 ==================== */
.deco-page-nav { display: flex; align-items: center; gap: 6px; }
.page-info { font-size: 10px; color: #aaa; }
.page-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-btn:not(:disabled) { background: #f5f3ff; }
.page-btn:disabled { opacity: 0.25; cursor: default; }

.sticker-pack-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 4px;
}
.pack-tabs-left {
  display: flex;
  gap: 5px;
}
.pack-tab {
  padding: 4px 12px;
  border: none;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  background: #f3f0ff;
  color: #7c3aed;
  transition: all .2s;
}
.pack-tab.active {
  background: #7c3aed;
  color: #fff;
}

.deco-grid-viewport { padding: 6px 0 8px; overflow: hidden; }
.deco-track {
  display: flex;
  transition: transform .35s cubic-bezier(.4,0,.2,1);
}
.deco-page {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 6px;
  padding: 0 10px;
  box-sizing: border-box;
  height: 120px;
}
.deco-item {
  cursor: pointer;
  border-radius: 10px;
  border: 1.5px solid #e0d8f5;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  transition: all .2s;
  background: #faf8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  min-width: 0;
  min-height: 0;
}
.deco-item.deco-empty {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  cursor: default;
  pointer-events: none;
}
.deco-item:hover { border-color: #c4b5fd; transform: translateY(-2px); }

.save-deco-wrap { padding: 0 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.clear-all-deco-btn {
  width: 100%;
  padding: 8px;
  border: 1.5px solid #ef4444;
  border-radius: 10px;
  background: #fff;
  color: #ef4444;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}
.clear-all-deco-btn:hover { background: #fef2f2; }
.clear-all-deco-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.mobile-clear-wrap { display: none; }

/* 캐꾸 저장 바 */
.deco-save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 10px 8px;
  padding: 8px 10px;
  background: #f5f3ff;
  border-radius: 10px;
}
.deco-save-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.deco-save-label {
  font-size: 11px;
  font-weight: 600;
  color: #7c3aed;
  white-space: nowrap;
}
.deco-save-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all .15s;
}
.deco-save-btn:hover { background: #6d28d9; }
.deco-save-btn.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}
.deco-bar-enter-active,
.deco-bar-leave-active { transition: all .2s ease; }
.deco-bar-enter-from,
.deco-bar-leave-to { opacity: 0; transform: translateY(-4px); }

/* ==================== 캐꾸 슬롯 탭 ==================== */
.carrier-slot-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 2px 0;
}
.carrier-slot-tabs::-webkit-scrollbar { display: none; }
.slot-tab {
  flex: 0 0 auto;
  min-width: 100px;
  position: relative;
  padding: 9px 18px;
  border: 1.5px dashed #d5d0e0;
  border-radius: 12px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #a8a3b3;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.slot-tab.active {
  border-style: solid;
  border-color: #7c3aed;
  background: #f9f5ff;
  color: #7c3aed;
}
.slot-tab:not(.active):hover {
  border-color: #b8b0c8;
  background: #faf8fd;
  color: #7c6b94;
}
.slot-tab:disabled {
  opacity: 0.6;
  cursor: wait;
}
.slot-unsaved-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f87171;
  margin-left: 5px;
  vertical-align: middle;
}
.slot-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 24px;
}

/* ==================== 캐리어 뷰 ==================== */
.carrier-box-wrap { position: relative; }
.carrier-box {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #e0d8f5;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}

/* FAB 그룹 */
.fab-group {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.share-fab {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #7c3aed;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  transition: background 0.15s, transform 0.15s;
}
.share-fab:hover { background: #f5f3ff; transform: scale(1.08); }

.toggle-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.color-picker {
  display: flex;
  align-items: center;
  gap: 5px;
}
.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(255,255,255,0.8);
  transition: all .15s;
}
.color-dot.active { border: 2.5px solid #333; transform: scale(1.15); }
.color-dot:hover:not(.active) { transform: scale(1.1); }

.view-toggle-bar {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.inline-slot-tabs {
  display: none;
}
.view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.toggle-label { font-size: 12px; color: #888; font-weight: 500; }
.toggle-switch {
  width: 52px;
  height: 28px;
  border-radius: 14px;
  cursor: pointer;
  background: #e5e7eb;
  position: relative;
  transition: background .3s;
  flex-shrink: 0;
}
.toggle-switch.on { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.toggle-knob {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 3px;
  transition: left .3s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 1px 4px rgba(0,0,0,.15);
}

.carrier-view-area {
  position: absolute;
  inset: 48px 16px 16px 16px;
}

.carrier-layer {
  position: absolute;
  inset: 0;
  transition: opacity .5s;
  opacity: 0;
  pointer-events: none;
  border-radius: 18px;
  overflow: hidden;
}
.carrier-layer.visible { opacity: 1; pointer-events: auto; }

.carrier-frame-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.physics-area { position: absolute; inset: 0; }
.empty-carrier {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c4b5fd;
  font-size: 14px;
}

/* ==================== 버블 ==================== */
.bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.bubble-name {
  font-weight: 700;
  max-width: 150%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
  pointer-events: none;
}
.bubble-brand { margin-top: 2px; pointer-events: none; }

.rank-badge {
  position: absolute;
  font-weight: 900;
  padding: 1px 6px;
  pointer-events: none;
}
.rank-badge.top {
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4px;
}
.rank-badge.normal {
  top: -4px;
  right: -4px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  border: 1.5px solid #fff;
}

.bubble-remove {
  position: absolute;
  top: -5px;
  left: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid #fff;
  z-index: 10;
}

/* ==================== 데코 오버레이 ==================== */
.deco-overlay { position: absolute; }
.deco-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.15));
  border-radius: 8px;
  background: transparent;
  transition: outline .15s, background .15s;
}
.deco-emoji.selected { outline: 2.5px solid #7c3aed; outline-offset: 3px; background: rgba(124,58,237,.06); }

/* 리사이즈 핸들 */
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #7c3aed;
  border-radius: 50%;
  z-index: 25;
  touch-action: none;
}
.resize-handle:hover { background: #7c3aed; }
.corner-nw { top: -5px; left: -5px; cursor: nwse-resize; }
.corner-ne { top: -5px; right: -5px; cursor: nesw-resize; }
.corner-sw { bottom: -5px; left: -5px; cursor: nesw-resize; }
.corner-se { bottom: -5px; right: -5px; cursor: nwse-resize; }

/* 포토택 */
.phototag-fixed .nt-del { opacity: 0; transition: opacity .15s; }

/* 스페셜 스티커 아이템 */
.deco-item.deco-special {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
}
.deco-item.deco-special .special-icon { font-size: 20px; }
.deco-item.deco-special .special-label { font-size: 9px; font-weight: 700; color: #7c3aed; }
.deco-item.deco-active { background: rgba(124,58,237,0.1); outline: 2px solid #7c3aed; outline-offset: -2px; border-radius: 8px; }

.deco-toolbar {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: #fff;
  border-radius: 10px;
  padding: 3px 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,.15);
  border: 1px solid #e0d8f5;
  z-index: 30;
  white-space: nowrap;
}
.tb-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 7px;
  background: #f5f3ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #7c3aed;
}
.tb-btn:disabled { background: #f5f5f5; color: #ccc; cursor: default; }
.tb-btn.remove { background: #fef2f2; color: #ef4444; font-size: 11px; }
.tb-sep { width: 1px; height: 16px; background: #e5e7eb; margin: 0 2px; }
.tb-scale { font-size: 10px; font-weight: 700; color: #7c3aed; min-width: 32px; text-align: center; }

/* ==================== 아이템 목록 ==================== */
.item-count-badge { background: #f5f3ff; padding: 2px 8px; border-radius: 10px; }
.item-count-badge span { font-size: 11px; color: #7c3aed; font-weight: 700; }

.empty-items { padding: 30px 14px; text-align: center; color: #ccc; font-size: 12px; }

.item-list { overflow: hidden; position: relative; }
.item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
  background: transparent;
  cursor: pointer;
  transition: all .2s;
  border-left: 3px solid transparent;
  animation: fadeIn .3s ease both;
}
.item-row:last-child { border-bottom: none; }
.item-row.selected { background: #f5f3ff; border-left-color: #7c3aed; }
.item-row:hover:not(.selected) { background: #fcfbff; }
.item-row.faded { max-height: 28px; overflow: hidden; opacity: 0.4; mask-image: linear-gradient(to bottom, black 0%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%); }

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  background: #f5f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #e0d8f5;
  position: relative;
  transition: all .2s;
}
.item-icon.selected { background: #ede9fe; border-color: #c4b5fd; }
.item-rank {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 900;
  border: 1.5px solid #fff;
}

.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 12px; font-weight: 650; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.item-meta { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.item-brand { font-size: 10px; color: #999; }
.meta-dot { font-size: 9px; color: #e0e0e0; }
.item-rating { font-size: 10px; color: #f59e0b; }

.item-remove {
  border: none;
  background: none;
  cursor: pointer;
  color: #ddd;
  font-size: 12px;
  padding: 3px;
  border-radius: 6px;
  transition: all .15s;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-remove:hover { color: #ef4444; background: #fef2f2; }

.expand-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-top: 1px solid #f3f4f6;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #7c3aed;
  transition: all .15s;
}
.expand-btn:hover { background: #f5f3ff; }
.expand-btn svg { transition: transform .2s; }

.add-more-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: #9333EA;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(147,51,234,0.25);
  transition: all .2s;
}
.add-more-btn:hover { transform: translateY(-1px); }

/* ==================== 아이템 상세 ==================== */
.item-detail-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e0d8f5;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,.04);
  animation: slideUp .3s ease;
}
.detail-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f5f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #e0d8f5;
}
.detail-name { font-size: 14px; font-weight: 700; color: #111; }
.detail-brand { font-size: 11px; color: #999; }
.detail-rank {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 8px;
}

.detail-stats {
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.stat-box {
  background: #f5f3ff;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: center;
}
.stat-box.full { grid-column: 1 / -1; }
.stat-label { font-size: 10px; color: #999; margin-bottom: 2px; }
.stat-value { font-size: 16px; font-weight: 800; color: #7c3aed; }

/* ==================== 공유 모달 ==================== */
.share-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.share-modal {
  background: #fff;
  border-radius: 20px;
  padding: 0;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
  animation: modalIn .25s ease;
  overflow: hidden;
  position: relative;
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  border: none;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(4px);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  font-weight: 700;
  transition: background .15s;
}
.modal-close:hover { background: rgba(255,255,255,0.95); }

.share-preview {
  padding: 28px 24px 20px;
  display: flex;
  justify-content: center;
  transition: background .3s;
}
.share-svg-wrap { width: 320px; height: 420px; }

.share-nickname-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  margin-top: 16px;
}
.nickname-icon { flex-shrink: 0; }
.share-nickname-input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #e8e0f5;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background: #faf8ff;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
  font-family: 'HancomMalangMalang', 'SUIT', sans-serif;
}
.share-nickname-input::placeholder { color: #bbb; font-family: 'SUIT', sans-serif; font-weight: 400; }
.share-nickname-input:focus {
  border-color: #9333EA;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.share-save-btn {
  width: calc(100% - 40px);
  margin: 14px 20px 20px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #9333EA;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background .15s;
}
.share-save-btn:hover { background: #7e22ce; }
.share-save-btn:active { transform: scale(0.98); }

/* ==================== 로딩 ==================== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
  gap: 16px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0d8f5;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ==================== 유틸리티 ==================== */
.no-select { user-select: none; }

/* ==================== 저장 FAB ==================== */
.save-fab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border: none;
  border-radius: 50px;
  background: #7c3aed;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(124,58,237,0.4);
  transition: all .2s;
}
.save-fab:hover:not(:disabled) { background: #6d28d9; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.5); }
.save-fab:active:not(:disabled) { transform: translateY(0); }
.save-fab.saving { background: #a78bfa; cursor: wait; }
.save-fab:disabled { opacity: 0.85; }

.save-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.save-fab-enter-active { animation: saveFabIn .3s ease; }
.save-fab-leave-active { animation: saveFabIn .2s ease reverse; }
@keyframes saveFabIn { from { opacity: 0; transform: translateY(16px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }

@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

/* ==================== 태블릿 (1024px 이하) ==================== */
@media (max-width: 1024px) {
  .carrier-layout {
    flex-wrap: wrap;
  }
  .left-panel {
    flex: 0 0 100%;
    order: 2;
  }
  .center-panel {
    flex: 1 1 100%;
    max-width: 480px;
    order: 1;
  }
  .right-panel {
    flex: 0 0 100%;
    order: 3;
  }
  .skin-viewport {
    width: 100% !important;
    max-width: 400px;
  }
}

/* 모바일 스티커 FAB: 데스크톱 숨김 */
.mobile-sticker-fab { display: none; }

/* ==================== 모바일 (768px 이하) ==================== */
@media (max-width: 768px) {
  .carrier-page {
    background: #fff;
    padding-bottom: 0;
  }

  .center-panel .carrier-slot-tabs {
    display: none;
  }
  .inline-slot-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .inline-slot-btn {
    position: relative;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1.5px dashed rgba(124, 58, 237, 0.3);
    background: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    font-weight: 700;
    color: #a8a3b3;
    cursor: pointer;
    transition: all 0.15s;
    backdrop-filter: blur(4px);
  }
  .inline-slot-btn.active {
    border-style: solid;
    border-color: #7c3aed;
    background: rgba(245, 243, 255, 0.9);
    color: #7c3aed;
  }
  .inline-slot-btn:disabled { opacity: 0.5; cursor: wait; }
  .inline-slot-dot {
    position: absolute;
    top: 1px;
    right: 1px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #f87171;
  }

  .mobile-tab-bar {
    display: flex;
    background: #fff;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 52px;
    z-index: 99;
    padding: 0;
  }
  .mobile-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 4px 8px;
    border: none;
    background: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 11px;
    font-weight: 600;
    transition: all 0.2s;
    position: relative;
  }
  .mobile-tab.active {
    color: #7c3aed;
  }
  .mobile-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 2.5px;
    background: #7c3aed;
    border-radius: 2px 2px 0 0;
  }

  .carrier-content {
    padding: 12px 12px 24px;
  }

  .carrier-layout {
    flex-direction: column;
    gap: 0;
  }

  .left-panel,
  .center-panel,
  .right-panel {
    display: none;
    width: 100%;
    flex: none;
    max-width: 100%;
    min-width: 0;
  }
  .left-panel.mobile-active,
  .center-panel.mobile-active,
  .right-panel.mobile-active {
    display: flex;
  }

  .center-panel.mobile-active {
    height: calc(100dvh - 94px);
    overflow: hidden;
    gap: 0;
    padding: 4px 0 0;
  }
  .center-panel.mobile-active .carrier-box-wrap {
    flex: 1;
    min-height: 0;
  }
  .center-panel.mobile-active .carrier-box {
    aspect-ratio: unset;
    height: 100%;
  }
  .mobile-clear-wrap {
    display: flex;
    justify-content: flex-start;
    padding: 6px 8px 4px;
    flex-shrink: 0;
  }
  .mobile-clear-btn {
    padding: 6px 14px;
    border: 1.5px solid #ef4444;
    border-radius: 8px;
    background: #fff;
    color: #ef4444;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  .mobile-clear-btn:active { background: #fef2f2; }

  .carrier-box {
    border-radius: 20px;
    border: 1px solid #e0d8f5;
  }

  .skin-viewport {
    width: 100% !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .skin-track {
    gap: 6px;
  }
  .skin-item-wrap {
    flex: 0 0 95px;
  }
  .carousel-btn {
    display: none;
  }
  .skin-carousel {
    padding: 10px 8px;
  }

  .deco-item {
    font-size: 22px;
    border-radius: 10px;
  }

  .mobile-sticker-fab {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #a78bfa);
    border: none;
    box-shadow: 0 4px 16px rgba(124,58,237,0.4);
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .mobile-sticker-fab:active {
    transform: scale(0.92);
    box-shadow: 0 2px 8px rgba(124,58,237,0.3);
  }

  .right-panel .shop-card {
    border-radius: 16px;
  }
  .item-row {
    padding: 12px 14px;
    gap: 12px;
  }
  .item-icon {
    width: 40px;
    height: 40px;
  }
  .item-name {
    font-size: 13px;
  }
  .item-remove {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .add-more-btn {
    border-radius: 12px;
    padding: 14px;
    font-size: 14px;
  }

  .item-detail-card {
    border-radius: 16px;
  }

  .view-toggle-bar {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  .color-dot {
    width: 26px;
    height: 26px;
  }

  .fab-group {
    bottom: 20px;
    right: 16px;
  }
  .save-fab {
    padding: 10px 18px;
    font-size: 13px;
  }

  .share-modal {
    max-width: calc(100% - 32px);
    border-radius: 20px;
    max-height: 88vh;
    overflow-y: auto;
  }
  .share-modal-overlay {
    align-items: center;
    padding: 16px;
  }
  .share-preview { padding: 20px 16px 14px; }
  .share-svg-wrap {
    width: 100%;
    max-width: 280px;
    height: auto;
    aspect-ratio: 380 / 500;
  }
  .share-nickname-row { padding: 0 16px; margin-top: 14px; }
  .share-save-btn { width: calc(100% - 32px); margin: 12px 16px 16px; }
}

/* ==================== 작은 모바일 (480px 이하) ==================== */
@media (max-width: 480px) {
  .header-page-title {
    font-size: 15px;
  }
  .header-item-count {
    font-size: 11px;
  }
  .carrier-content {
    padding: 8px 8px 20px;
  }
  .shop-card {
    border-radius: 14px;
  }
  .carrier-box {
    border-radius: 16px;
  }
  .deco-page {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 6px;
  }
}

@keyframes slideUpModal { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
