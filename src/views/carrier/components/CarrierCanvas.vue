<template>
  <div class="center-panel" :class="{ 'mobile-active': mobileTab === 'carrier' }">
    <!-- 캐꾸 슬롯 탭 -->
    <div class="carrier-slot-tabs">
      <button
        v-for="idx in SLOT_COUNT"
        :key="idx - 1"
        class="slot-tab"
        :class="{ active: activeSlotIdx === idx - 1, empty: !slotCarrierIds[idx - 1] }"
        :disabled="slotSwitching"
        @click="$emit('select-slot', idx - 1)"
      >
        내 캐리어 {{ idx }}<span v-if="activeSlotIdx === idx - 1 && hasUnsavedChanges" class="slot-unsaved-dot"></span>
      </button>
    </div>

    <div class="carrier-box-wrap">
      <div v-if="slotSwitching" class="slot-loading-overlay">
        <div class="spinner"></div>
      </div>
      <div ref="boxRef" class="carrier-box" @click="$emit('deselect')">

        <!-- 토글 바 -->
        <div class="view-toggle-bar">
          <div class="toggle-bar-left">
            <div class="inline-slot-tabs">
              <button
                v-for="idx in SLOT_COUNT"
                :key="idx - 1"
                class="inline-slot-btn"
                :class="{ active: activeSlotIdx === idx - 1 }"
                :disabled="slotSwitching"
                @click="$emit('select-slot', idx - 1)"
              >{{ idx }}<span v-if="activeSlotIdx === idx - 1 && hasUnsavedChanges" class="inline-slot-dot"></span></button>
            </div>
            <!-- 컬러 피커 (기본 스킨 전용) -->
            <div v-if="activeSkin === 'default'" class="color-picker">
              <div
                v-for="c in DEFAULT_COLORS"
                :key="c.id"
                class="color-dot"
                :class="{ active: defaultColor === c.id }"
                :style="{ background: c.dot, boxShadow: defaultColor === c.id ? `0 0 0 2px ${c.dot}44` : '0 2px 6px rgba(0,0,0,0.12)' }"
                @click.stop="$emit('update:defaultColor', c.id)"
              ></div>
            </div>
          </div>
          <div class="view-toggle">
            <span class="toggle-label">내부 보기</span>
            <div class="toggle-switch" :class="{ on: isOpen }" @click="toggle">
              <div class="toggle-knob" :style="{ left: isOpen ? '27px' : '3px' }"></div>
            </div>
          </div>
        </div>

        <div ref="viewAreaRef" class="carrier-view-area">
          <!-- 외관 보기 -->
          <div class="carrier-layer" :class="{ visible: !isOpen }">
            <svg width="100%" height="100%" viewBox="0 0 300 400" fill="none" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="bI" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="b1"/>
                  <feOffset dx="6" dy="6" result="o1"/>
                  <feComposite in="o1" in2="SourceGraphic" operator="in" result="s1"/>
                  <feFlood flood-color="#6b5b9a" flood-opacity=".2" result="sc"/>
                  <feComposite in="sc" in2="s1" operator="in" result="sh"/>
                  <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b2"/>
                  <feOffset dx="-5" dy="-5" result="o2"/>
                  <feComposite in="o2" in2="SourceGraphic" operator="in" result="h1"/>
                  <feFlood flood-color="#fff" flood-opacity=".5" result="hc"/>
                  <feComposite in="hc" in2="h1" operator="in" result="hl"/>
                  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge>
                </filter>
                <linearGradient id="sG" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" :stop-color="currentSkin.body.grad1"/>
                  <stop offset="100%" :stop-color="currentSkin.body.grad2"/>
                </linearGradient>
                <filter id="iS" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/>
                  <feOffset dx="-2" dy="1" result="ob"/>
                  <feComposite in="ob" in2="SourceGraphic" operator="in" result="s"/>
                  <feFlood flood-color="#7b6fa8" flood-opacity=".3" result="sc2"/>
                  <feComposite in="sc2" in2="s" operator="in" result="is"/>
                  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="is"/></feMerge>
                </filter>
              </defs>
              <rect x="30" y="50" width="240" height="320" rx="20" fill="url(#sG)" :stroke="currentSkin.body.stroke" stroke-width="3" filter="url(#bI)"/>
              <line x1="52" y1="122" x2="52" y2="289" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".3"/>
              <rect x="122" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
              <rect x="170" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
              <rect x="116" y="6" width="68" height="18" rx="9" :fill="currentSkin.handle.grip" :stroke="currentSkin.handle.stroke" stroke-width="2.5"/>
              <rect x="98" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2" filter="url(#iS)"/>
              <rect x="139" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2" filter="url(#iS)"/>
              <rect x="180" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2" filter="url(#iS)"/>
              <!-- 스킨 스티커 -->
              <template v-for="(st, i) in currentSkin.stickers" :key="'sk-' + i">
                <g v-if="st.type === 'smallheart'" :transform="`translate(${st.x},${st.y})`">
                  <path d="M0 7C-2 5-9 1-9-4C-9-8-5-10 0-6C5-10 9-8 9-4C9 1 2 5 0 7Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/>
                </g>
                <g v-else-if="st.type === 'bigbow'" :transform="`translate(${st.x},${st.y})`">
                  <path d="M-20 0C-20-15-4-15 0 0C4-15 20-15 20 0C20 15 4 15 0 0C-4 15-20 15-20 0Z" fill="#dc2626" stroke="#222" stroke-width="1.5"/>
                  <circle r="5" fill="#dc2626" stroke="#222" stroke-width="1.2"/>
                </g>
                <g v-else-if="st.type === 'stamp'" :transform="`translate(${st.x},${st.y})`">
                  <rect x="-28" y="-16" width="56" height="32" rx="4" fill="none" :stroke="st.color" stroke-width="2.5" stroke-dasharray="3 2" opacity="0.7"/>
                  <text x="0" y="5" text-anchor="middle" font-size="11" font-weight="900" :fill="st.color" opacity="0.75" font-family="monospace">{{ st.label }}</text>
                </g>
                <circle v-else-if="st.type === 'star'" :cx="st.x" :cy="st.y" :r="st.size || 4" fill="#e0e7ff" opacity="0.6">
                  <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite"/>
                </circle>
                <g v-else-if="st.type === 'planet'" :transform="`translate(${st.x},${st.y})`">
                  <circle r="12" fill="#818cf8" opacity="0.6"/>
                  <ellipse rx="20" ry="5" fill="none" stroke="#c7d2fe" stroke-width="1.5" opacity="0.5" transform="rotate(-20)"/>
                </g>
              </template>
              <!-- 포토택 -->
              <g v-if="hasPhototag" transform="rotate(-4,126,53)" class="phototag-fixed"
                 @mouseenter="onPhototagHover($event, true)"
                 @mouseleave="onPhototagHover($event, false)">
                <line x1="126" y1="53" x2="126" y2="78" :stroke="currentSkin.body.stroke" stroke-width="1.5" opacity=".4" stroke-linecap="round"/>
                <rect x="97" y="78" width="58" height="76" rx="4" fill="#fff" fill-opacity=".92" :stroke="currentSkin.body.stroke" stroke-width="1.2" opacity=".6"/>
                <circle cx="126" cy="86" r="3" fill="none" :stroke="currentSkin.body.stroke" stroke-width=".8" opacity=".3"/>
                <line x1="98" y1="96" x2="154" y2="96" :stroke="currentSkin.body.stroke" stroke-width=".5" opacity=".15"/>
                <template v-if="nameTagImg">
                  <defs><clipPath id="ntC"><rect x="97.6" y="96.5" width="56.8" height="57.4" rx="3"/></clipPath></defs>
                  <image :href="nameTagImg" x="97.6" y="96.5" width="56.8" height="57.4" preserveAspectRatio="xMidYMid slice" clip-path="url(#ntC)"/>
                </template>
                <text v-else-if="phototagUploading" text-anchor="middle" font-size="10" :fill="currentSkin.body.stroke" opacity=".6">
                  <tspan x="126" y="125">업로드 중...</tspan>
                </text>
                <text v-else text-anchor="middle" font-size="11" font-weight="800" :fill="currentSkin.body.stroke" opacity=".5" font-family="monospace" letter-spacing="1">
                  <tspan x="126" y="120">PHOTO</tspan>
                  <tspan x="126" dy="14">TAG</tspan>
                </text>
                <rect x="98" y="97" width="56" height="56" rx="3" fill="transparent" style="cursor: pointer" @click.stop="$emit('phototag-upload')"/>
                <g v-if="nameTagImg && !phototagUploading" class="nt-del" @click.stop="$emit('phototag-clear')" style="cursor: pointer">
                  <circle cx="154" cy="98" r="7" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
                  <text x="154" y="101.5" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">✕</text>
                </g>
                <rect x="97" y="53" width="58" height="43" rx="4" fill="transparent" style="cursor: pointer" @click.stop="$emit('phototag-select')"/>
              </g>
              <!-- 바퀴 -->
              <rect x="62" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
              <circle cx="70" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/>
              <circle cx="70" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
              <rect x="222" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
              <circle cx="230" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/>
              <circle cx="230" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
            </svg>
          </div>

          <!-- 내부 보기 (물리 버블) -->
          <div class="carrier-layer" :class="{ visible: isOpen }">
            <svg class="carrier-frame-svg" viewBox="0 0 300 400" fill="none" preserveAspectRatio="xMidYMid meet">
              <rect x="122" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
              <rect x="170" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
              <rect x="116" y="6" width="68" height="18" rx="9" :fill="currentSkin.handle.grip" :stroke="currentSkin.handle.stroke" stroke-width="2.5"/>
              <rect x="30" y="50" width="240" height="320" rx="20" :stroke="currentSkin.body.stroke" stroke-width="2" stroke-dasharray="8 4" fill="none" opacity=".5"/>
              <line x1="30" y1="140" x2="270" y2="140" :stroke="currentSkin.body.stroke" stroke-width="1.5" stroke-dasharray="6 4" opacity=".3"/>
              <line x1="30" y1="260" x2="270" y2="260" :stroke="currentSkin.body.stroke" stroke-width="1.5" stroke-dasharray="6 4" opacity=".3"/>
              <rect x="62" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
              <circle cx="70" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/><circle cx="70" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
              <rect x="222" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
              <circle cx="230" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/><circle cx="230" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
            </svg>
            <div ref="innerRef" class="physics-area">
              <div v-if="items.length === 0" class="empty-carrier">캐리어가 비어있어요</div>
              <div
                v-for="(pos, i) in rendered"
                :key="sortedItems[i]?.id"
                v-show="sortedItems[i] && pos"
                class="bubble"
                :class="{
                  'is-selected': selected === sortedItems[i]?.id,
                  'is-dragging': dragId === sortedItems[i]?.id
                }"
                :style="getBubbleStyle(i, pos)"
                @mousedown.prevent="onBubbleDown($event, sortedItems[i]?.id)"
                @touchstart.prevent="onBubbleDown($event, sortedItems[i]?.id)"
                @click="!dragId && $emit('toggle-select', sortedItems[i]?.id)"
              >
                <span v-if="nodes[i]?.r > 24" class="bubble-name" :style="{ fontSize: Math.max(11, nodes[i].r * 0.22) + 'px', color: getRankStyle(i + 1, sortedItems.length).tc }">
                  {{ sortedItems[i]?.name }}
                </span>
                <span v-if="nodes[i]?.r > 40" class="bubble-brand" :style="{ fontSize: Math.max(9, nodes[i].r * 0.14) + 'px', color: getRankStyle(i + 1, sortedItems.length).sc }">
                  {{ sortedItems[i]?.brand }}
                </span>
                <div v-if="i < 3" class="rank-badge top" :style="{ background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32', color: i === 0 ? '#7a5a00' : i === 1 ? '#444' : '#5a2d00', fontSize: Math.max(8, (nodes[i]?.r || 30) * 0.12) + 'px' }">
                  {{ i + 1 }}
                </div>
                <div v-else class="rank-badge normal" :style="{ width: Math.max(14, (nodes[i]?.r || 30) * 0.24) + 'px', height: Math.max(14, (nodes[i]?.r || 30) * 0.24) + 'px', fontSize: Math.max(7, (nodes[i]?.r || 30) * 0.12) + 'px' }">
                  {{ i + 1 }}
                </div>
                <div
                  v-if="selected === sortedItems[i]?.id && dragId !== sortedItems[i]?.id"
                  class="bubble-remove"
                  @mousedown.stop.prevent
                  @click.stop="$emit('remove-item', sortedItems[i]?.id)"
                  @touchstart.stop.prevent
                  @touchend.stop.prevent="$emit('remove-item', sortedItems[i]?.id)"
                >✕</div>
              </div>
            </div>
          </div>

          <!-- 데코 오버레이 -->
          <template v-if="!isOpen">
            <div
              v-for="d in emojiDecos"
              :key="d.uid"
              class="deco-overlay"
              :style="getDecoOverlayStyle(d)"
              @click.stop
            >
              <div
                class="deco-emoji"
                :class="{ selected: selDeco === d.uid }"
                :style="{ fontSize: decoFont * d.scale + 'px', width: decoBase * d.scale + 'px', height: decoBase * d.scale + 'px', transform: d.flipped ? 'scaleX(-1)' : 'scaleX(1)' }"
                @mousedown.prevent.stop="onDecoDown($event, d.uid)"
                @touchstart.prevent.stop="onDecoDown($event, d.uid)"
              >{{ d.emoji }}</div>
              <template v-if="selDeco === d.uid">
                <div class="resize-handle corner-nw" @mousedown.prevent.stop="onResizeDown($event, d)" @touchstart.prevent.stop="onResizeDown($event, d)"></div>
                <div class="resize-handle corner-ne" @mousedown.prevent.stop="onResizeDown($event, d)" @touchstart.prevent.stop="onResizeDown($event, d)"></div>
                <div class="resize-handle corner-sw" @mousedown.prevent.stop="onResizeDown($event, d)" @touchstart.prevent.stop="onResizeDown($event, d)"></div>
                <div class="resize-handle corner-se" @mousedown.prevent.stop="onResizeDown($event, d)" @touchstart.prevent.stop="onResizeDown($event, d)"></div>
              </template>
              <div v-if="selDeco === d.uid" class="deco-toolbar" @click.stop>
                <button class="tb-btn" @click.stop="$emit('flip-deco', d.uid)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 3 3 7 7 11"/><path d="M3 7h13a5 5 0 010 10h-4"/></svg>
                </button>
                <div class="tb-sep"></div>
                <button class="tb-btn" :disabled="d.scale <= DMIN" @click.stop="$emit('scale-deco', d.uid, -DSTEP)">−</button>
                <span class="tb-scale">{{ Math.round(d.scale * 100) }}%</span>
                <button class="tb-btn" :disabled="d.scale >= DMAX" @click.stop="$emit('scale-deco', d.uid, DSTEP)">+</button>
                <div class="tb-sep"></div>
                <button class="tb-btn remove" @click.stop="$emit('remove-deco', d.uid)">✕</button>
              </div>
            </div>
          </template>

          <!-- 포토택 선택 시 툴바 -->
          <div v-if="selPhototag" class="deco-overlay" :style="phototagToolbarStyle" @click.stop>
            <div class="deco-toolbar" @click.stop>
              <button class="tb-btn" @click.stop="$emit('phototag-upload')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              <div class="tb-sep"></div>
              <button class="tb-btn remove" @click.stop="$emit('phototag-remove')">✕</button>
            </div>
          </div>

        </div>
      </div>

      <!-- 모바일 전체삭제 -->
      <div v-if="decos.length > 0" class="mobile-clear-wrap">
        <button class="mobile-clear-btn" @click="$emit('bulk-delete')">
          전체 삭제 ({{ decos.length }})
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { DMIN, DMAX, DSTEP, MIN_R, MAX_R, CVB, SLOT_COUNT, DEFAULT_COLORS, getBounds, getRankStyle } from '../constants.js'

const props = defineProps({
  currentSkin: { type: Object, required: true },
  isOpen: { type: Boolean, default: false },
  items: { type: Array, required: true },
  decos: { type: Array, required: true },
  selDeco: { type: [String, null], default: null },
  selected: { type: [String, Number, null], default: null },
  nameTagImg: { type: String, default: null },
  phototagUploading: { type: Boolean, default: false },
  hasPhototag: { type: Boolean, default: false },
  activeSkin: { type: String, default: 'default' },
  defaultColor: { type: String, default: 'violet' },
  activeSlotIdx: { type: Number, default: 0 },
  slotCarrierIds: { type: Array, default: () => [null, null] },
  slotSwitching: { type: Boolean, default: false },
  hasUnsavedChanges: { type: Boolean, default: false },
  mobileTab: { type: String, default: 'carrier' }
})

const emit = defineEmits([
  'toggle', 'toggle-select', 'remove-item', 'select-slot', 'deselect',
  'update:defaultColor', 'deco-down', 'resize-down',
  'scale-deco', 'flip-deco', 'remove-deco', 'bulk-delete',
  'phototag-upload', 'phototag-clear', 'phototag-select', 'phototag-remove',
  'bubble-drag-end', 'deco-drag-end', 'deco-resize-end', 'update:decos'
])

const boxRef = ref(null)
const innerRef = ref(null)
const viewAreaRef = ref(null)
const dims = reactive({ w: 0, h: 0 })
const viewDims = reactive({ w: 0, h: 0 })
const rendered = ref([])
const dragId = ref(null)

// 캐리어 본체 대비 비례 크기 (공유 SVG 기준: font=24, base=36, body=240)
const decoFont = computed(() => {
  if (!viewDims.w || !viewDims.h) return 24
  const b = getBounds(viewDims.w, viewDims.h)
  return (b.right - b.left) * (24 / 240)
})
const decoBase = computed(() => decoFont.value * 1.5)

// 물리 시뮬레이션 상태
const posRef = { current: [] }
const ds = { current: { dragging: false, id: null, ox: 0, oy: 0, lastX: 0, lastY: 0, velX: 0, velY: 0 } }
let frameRef = null
let resizeObserver = null
let viewResizeObserver = null
let anim = false

const sortedItems = computed(() => [...props.items])

const nodes = computed(() => {
  const count = sortedItems.value.length
  return sortedItems.value.map((p, i) => {
    const ratio = count <= 1 ? 1 : 1 - (i / count) * 0.4
    return { id: p.id, r: MIN_R + (MAX_R - MIN_R) * ratio }
  })
})

const emojiDecos = computed(() => props.decos.filter(d => d.type !== 'phototag'))
const selPhototag = computed(() => {
  const pt = props.decos.find(d => d.type === 'phototag')
  return pt && props.selDeco === pt.uid ? pt : null
})
const phototagToolbarStyle = computed(() => {
  if (!viewDims.w || !viewDims.h) return { display: 'none' }
  const b = getBounds(viewDims.w, viewDims.h)
  const bw = b.right - b.left, bh = b.bottom - b.top
  const px = b.left + ((126 - CVB.x1) / (CVB.x2 - CVB.x1)) * bw
  const py = b.top + ((78 - CVB.y1) / (CVB.y2 - CVB.y1)) * bh
  return { position: 'absolute', left: px + 'px', top: (py - 4) + 'px', zIndex: 20 }
})

function toggle() {
  if (anim) return
  anim = true
  emit('toggle')
  setTimeout(() => { anim = false }, 500)
}

function onPhototagHover(e, enter) {
  const del = e.currentTarget.querySelector('.nt-del')
  if (del) del.style.opacity = enter ? '1' : '0'
}

// ==================== 물리 시뮬레이션 ====================
function initLayout(nodeList, W, H) {
  if (!nodeList.length || !W || !H) return []
  const cx = W / 2
  const so = nodeList.map((n, i) => ({ ...n, idx: i })).sort((a, b) => a.r - b.r)
  const pos = so.map(n => ({ x: cx + (Math.random() - 0.5) * W * 0.3, y: H - n.r - 10, vx: 0, vy: 0, r: n.r, idx: n.idx }))
  for (let t = 0; t < 500; t++) {
    const a = Math.max(0.001, 1 - t / 500)
    for (let i = 0; i < pos.length; i++) {
      pos[i].vy += 0.2 * a
      pos[i].vx += (cx - pos[i].x) * 0.004 * a
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const mn = pos[i].r + pos[j].r + 3
        if (d < mn) {
          const f = (mn - d) / d * 0.4
          pos[i].vx += dx * f; pos[i].vy += dy * f
          pos[j].vx -= dx * f; pos[j].vy -= dy * f
        }
      }
      pos[i].vx *= 0.6; pos[i].vy *= 0.6
      pos[i].x += pos[i].vx; pos[i].y += pos[i].vy
      const pd = pos[i].r + 2
      pos[i].x = Math.max(pd, Math.min(W - pd, pos[i].x))
      pos[i].y = Math.max(pd, Math.min(H - pd, pos[i].y))
    }
  }
  const res = new Array(nodeList.length)
  pos.forEach(p => { res[p.idx] = { x: p.x, y: p.y } })
  return res
}

function startPhysics() {
  if (frameRef) cancelAnimationFrame(frameRef)
  if (!dims.w || !dims.h) return
  const GRAVITY = 0.15, FRICTION = 0.92, BOUNCE = 0.55, COLLISION_SOFTNESS = 0.5
  const step = () => {
    const bodies = posRef.current
    if (!bodies.length) { frameRef = requestAnimationFrame(step); return }
    const d = ds.current
    const b = getBounds(dims.w, dims.h)
    for (let i = 0; i < bodies.length; i++) {
      const o = bodies[i]
      if (d.dragging && d.id === o.id) {
        const pad = o.r + 2
        o.x = Math.max(b.left + pad, Math.min(b.right - pad, o.x))
        o.y = Math.max(b.top + pad, Math.min(b.bottom - pad, o.y))
        o.vx = d.velX || 0; o.vy = d.velY || 0
        continue
      }
      o.vy += GRAVITY; o.vx *= FRICTION; o.vy *= FRICTION
      o.x += o.vx; o.y += o.vy
      const pad = o.r + 2
      if (o.x < b.left + pad) { o.x = b.left + pad; o.vx = Math.abs(o.vx) * BOUNCE }
      if (o.x > b.right - pad) { o.x = b.right - pad; o.vx = -Math.abs(o.vx) * BOUNCE }
      if (o.y < b.top + pad) { o.y = b.top + pad; o.vy = Math.abs(o.vy) * BOUNCE }
      if (o.y > b.bottom - pad) { o.y = b.bottom - pad; o.vy = -Math.abs(o.vy) * BOUNCE }
    }
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], bb = bodies[j]
        const dx = a.x - bb.x, dy = a.y - bb.y
        const dd = Math.sqrt(dx * dx + dy * dy) || 1
        const minD = a.r + bb.r + 2
        if (dd < minD) {
          const nx = dx / dd, ny = dy / dd, ov = (minD - dd) * 0.5
          const aL = d.dragging && d.id === a.id, bL = d.dragging && d.id === bb.id
          if (aL) { bb.x -= nx * ov * 2; bb.y -= ny * ov * 2 }
          else if (bL) { a.x += nx * ov * 2; a.y += ny * ov * 2 }
          else { a.x += nx * ov; a.y += ny * ov; bb.x -= nx * ov; bb.y -= ny * ov }
          const dvx = a.vx - bb.vx, dvy = a.vy - bb.vy
          const imp = (dvx * nx + dvy * ny) * COLLISION_SOFTNESS
          if (!aL) { a.vx -= imp * nx; a.vy -= imp * ny }
          if (!bL) { bb.vx += imp * nx; bb.vy += imp * ny }
        }
      }
    }
    for (let i = 0; i < bodies.length; i++) {
      const o = bodies[i], pad = o.r + 2
      if (o.x < b.left + pad) { o.x = b.left + pad; if (o.vx < 0) o.vx *= -BOUNCE }
      if (o.x > b.right - pad) { o.x = b.right - pad; if (o.vx > 0) o.vx *= -BOUNCE }
      if (o.y < b.top + pad) { o.y = b.top + pad; if (o.vy < 0) o.vy *= -BOUNCE }
      if (o.y > b.bottom - pad) { o.y = b.bottom - pad; if (o.vy > 0) o.vy *= -BOUNCE }
    }
    rendered.value = bodies.map(o => ({ x: o.x, y: o.y }))
    frameRef = requestAnimationFrame(step)
  }
  frameRef = requestAnimationFrame(step)
}

function initPhysicsLayout() {
  if (!dims.w || !dims.h || !nodes.value.length) {
    posRef.current = []
    rendered.value = []
    return
  }
  const b = getBounds(dims.w, dims.h)
  const bw = b.right - b.left, bh = b.bottom - b.top
  const hasSavedPositions = sortedItems.value.some(item =>
    item.positionX !== undefined && item.positionX !== 0.5 ||
    item.positionY !== undefined && item.positionY !== 0.5
  )
  if (hasSavedPositions) {
    posRef.current = nodes.value.map((n, i) => {
      const item = sortedItems.value[i]
      const px = item?.positionX ?? 0.5
      const py = item?.positionY ?? 0.5
      return { x: b.left + px * bw, y: b.top + py * bh, vx: 0, vy: 0, r: n.r, id: n.id }
    })
  } else {
    const layout = initLayout(nodes.value, bw * 0.85, bh * 0.85)
    const ox = b.left + bw * 0.075, oy = b.top + bh * 0.075
    posRef.current = layout.map((p, i) => ({
      x: p.x + ox, y: p.y + oy, vx: 0, vy: 0, r: nodes.value[i].r, id: nodes.value[i].id
    }))
  }
  rendered.value = posRef.current.map(p => ({ x: p.x, y: p.y }))
}

// ResizeObserver
watch(innerRef, (el) => {
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
  if (el) {
    resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      dims.w = width; dims.h = height
    })
    resizeObserver.observe(el)
  }
})

watch(viewAreaRef, (el) => {
  if (viewResizeObserver) { viewResizeObserver.disconnect(); viewResizeObserver = null }
  if (el) {
    viewResizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      viewDims.w = width; viewDims.h = height
    })
    viewResizeObserver.observe(el)
  }
})

const itemKey = computed(() => props.items.map(i => i.id).join(','))
watch([itemKey, () => dims.w, () => dims.h], () => {
  initPhysicsLayout()
}, { flush: 'post' })

watch([() => dims.w, () => dims.h], () => {
  startPhysics()
})

onBeforeUnmount(() => {
  if (frameRef) cancelAnimationFrame(frameRef)
  if (resizeObserver) resizeObserver.disconnect()
  if (viewResizeObserver) viewResizeObserver.disconnect()
})

// ==================== 버블 스타일/드래그 ====================
function getBubbleStyle(i, pos) {
  if (!pos || !nodes.value[i]) return { display: 'none' }
  const r = nodes.value[i].r
  const rk = i + 1
  const rs = getRankStyle(rk, sortedItems.value.length)
  const isSel = props.selected === sortedItems.value[i]?.id
  const isD = dragId.value === sortedItems.value[i]?.id
  const imgUrl = sortedItems.value[i]?.imageUrl
  return {
    position: 'absolute',
    left: (pos.x - r) + 'px',
    top: (pos.y - r) + 'px',
    width: r * 2 + 'px',
    height: r * 2 + 'px',
    borderRadius: '50%',
    background: imgUrl ? `url(${imgUrl}) center/cover no-repeat` : rs.bg,
    border: `${isSel ? '2.5px' : '2px'} solid ${isSel ? '#7c3aed' : rs.border}`,
    boxShadow: isD ? '0 12px 40px rgba(124,58,237,.35)' : `0 4px 16px ${rs.glow}`,
    zIndex: isD ? 100 : isSel ? 50 : rk <= 3 ? 10 : 1,
    transform: isD ? 'scale(1.08)' : 'scale(1)',
    transition: isD ? 'none' : 'transform .2s cubic-bezier(.34,1.56,.64,1)',
    cursor: isD ? 'grabbing' : 'grab',
    userSelect: 'none'
  }
}

function onBubbleDown(e, id) {
  const rect = innerRef.value?.getBoundingClientRect()
  if (!rect) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const cx = clientX - rect.left, cy = clientY - rect.top
  const b = posRef.current.find(b => b.id === id)
  if (!b) return
  ds.current = { dragging: true, id, ox: b.x - cx, oy: b.y - cy, lastX: cx, lastY: cy, velX: 0, velY: 0 }
  dragId.value = id
  const onMove = (ev) => {
    const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left
    const py = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top
    const d = ds.current
    d.velX = (px - d.lastX) * 0.6
    d.velY = (py - d.lastY) * 0.6
    d.lastX = px; d.lastY = py
    const body = posRef.current.find(b => b.id === id)
    if (body) { body.x = px + d.ox; body.y = py + d.oy }
  }
  const onUp = () => {
    const d = ds.current
    const body = posRef.current.find(b => b.id === id)
    if (body) { body.vx = d.velX; body.vy = d.velY }
    ds.current = { dragging: false, id: null, ox: 0, oy: 0, lastX: 0, lastY: 0, velX: 0, velY: 0 }
    dragId.value = null
    emit('bubble-drag-end')
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onUp)
}

// ==================== 데코 스타일/드래그 ====================
function getDecoOverlayStyle(d) {
  if (!viewDims.w || !viewDims.h) return { display: 'none' }
  const b = getBounds(viewDims.w, viewDims.h)
  const bw = b.right - b.left, bh = b.bottom - b.top
  const px = b.left + (d.x / 100) * bw
  const py = b.top + (d.y / 100) * bh
  const sw = decoBase.value * d.scale
  const sh = decoBase.value * d.scale
  return {
    position: 'absolute',
    left: (px - sw / 2) + 'px',
    top: (py - sh / 2) + 'px',
    width: sw + 'px',
    height: sh + 'px',
    zIndex: props.selDeco === d.uid ? 20 : 5
  }
}

let decoDragActive = false

function onDecoDown(e, uid) {
  decoDragActive = false
  const box = viewAreaRef.value?.getBoundingClientRect()
  if (!box) return
  if (e.touches && e.touches.length >= 2) {
    emit('deco-down', { uid, type: 'pinch', event: e })
    const deco = props.decos.find(d => d.uid === uid)
    if (!deco) return
    const initDist = Math.hypot(
      e.touches[1].clientX - e.touches[0].clientX,
      e.touches[1].clientY - e.touches[0].clientY
    )
    const initScale = deco.scale
    const onPinchMove = (ev) => {
      if (!ev.touches || ev.touches.length < 2) return
      ev.preventDefault()
      const dist = Math.hypot(
        ev.touches[1].clientX - ev.touches[0].clientX,
        ev.touches[1].clientY - ev.touches[0].clientY
      )
      const newScale = Math.max(DMIN, Math.min(DMAX, initScale * (dist / initDist)))
      emit('update:decos', props.decos.map(d => d.uid === uid ? { ...d, scale: newScale } : d))
    }
    const onPinchEnd = () => {
      emit('deco-resize-end', uid)
      window.removeEventListener('touchmove', onPinchMove)
      window.removeEventListener('touchend', onPinchEnd)
    }
    window.addEventListener('touchmove', onPinchMove, { passive: false })
    window.addEventListener('touchend', onPinchEnd)
    return
  }
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const cx = clientX - box.left, cy = clientY - box.top
  const b = getBounds(box.width, box.height)
  const deco = props.decos.find(d => d.uid === uid)
  if (!deco) return
  const bw = b.right - b.left, bh = b.bottom - b.top
  const dpx = b.left + (deco.x / 100) * bw
  const dpy = b.top + (deco.y / 100) * bh
  const ox = dpx - cx, oy = dpy - cy
  const onMove = (ev) => {
    if (ev.touches && ev.touches.length >= 2) return
    decoDragActive = true
    const mx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - box.left
    const my = (ev.touches ? ev.touches[0].clientY : ev.clientY) - box.top
    const px = Math.max(2, Math.min(98, ((mx + ox - b.left) / bw) * 100))
    const py = Math.max(2, Math.min(98, ((my + oy - b.top) / bh) * 100))
    emit('update:decos', props.decos.map(d => d.uid === uid ? { ...d, x: px, y: py } : d))
  }
  const onUp = () => {
    if (!decoDragActive) {
      emit('deco-down', { uid, type: 'tap' })
    } else {
      emit('deco-drag-end', uid)
    }
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onUp)
}

function onResizeDown(e, deco) {
  e.stopPropagation()
  const box = viewAreaRef.value?.getBoundingClientRect()
  if (!box) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const b = getBounds(box.width, box.height)
  const bw = b.right - b.left, bh = b.bottom - b.top
  const centerX = box.left + b.left + (deco.x / 100) * bw
  const centerY = box.top + b.top + (deco.y / 100) * bh
  const initDist = Math.hypot(clientX - centerX, clientY - centerY) || 1
  const initScale = deco.scale
  const uid = deco.uid
  const onMove = (ev) => {
    ev.preventDefault()
    const mx = ev.touches ? ev.touches[0].clientX : ev.clientX
    const my = ev.touches ? ev.touches[0].clientY : ev.clientY
    const dist = Math.hypot(mx - centerX, my - centerY)
    const newScale = Math.max(DMIN, Math.min(DMAX, initScale * (dist / initDist)))
    emit('update:decos', props.decos.map(d => d.uid === uid ? { ...d, scale: newScale } : d))
  }
  const onUp = () => {
    emit('deco-resize-end', uid)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onUp)
}

// expose for parent (saveAllChanges needs posRef and dims)
defineExpose({
  posRef,
  dims,
  getBounds
})
</script>
