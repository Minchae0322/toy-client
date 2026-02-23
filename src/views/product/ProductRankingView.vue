<template>
  <div class="app-container" :class="{ 'no-select': !!dragging }">
    <AppSidebar />

    <main class="main-content">
      <CommonCategoryFilter
        :categories="categories"
        :show-view-toggle="false"
        :initial-category-id="selectedCategoryId"
        @category-change="handleCategoryChange"
      />

      <div class="ranking-view">
        <!-- 헤더 -->
        <header class="page-header">
          <span class="header-label">WEEKLY CHART</span>
          <h1>HOT 100</h1>
          <p class="header-desc">버블이 클수록 이번 주 인기가 높아요</p>
        </header>

        <!-- 검색 -->
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchKeyword" class="search-input" placeholder="아이템 이름 또는 브랜드로 검색" />
          <button v-if="searchKeyword" class="search-clear" @click="searchKeyword = ''">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- 로딩 -->
        <Transition name="view-fade" mode="out-in">
        <div v-if="loading && !products.length" key="loading" class="loading-state">
          <div class="spinner"></div>
          <p>랭킹을 불러오는 중...</p>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="!filtered.length && !loading" key="empty" class="empty-state">
          <p>{{ searchKeyword ? '검색 결과가 없습니다' : '등록된 아이템이 없습니다' }}</p>
        </div>

        <div v-else-if="filtered.length" key="content">
          <!-- 버블 차트 -->
          <div class="bubble-wrapper">
            <div
              ref="containerRef"
              class="bubble-area"
              :style="{ height: dims.h + 'px' }"
              @mousemove="handleMouseMove"
              @mouseleave="onAreaLeave"
            >
              <!-- 그리드 배경 -->
              <svg class="grid-bg">
                <defs>
                  <pattern id="bgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" stroke-width="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#bgGrid)"/>
              </svg>

              <!-- 버블 -->
              <div
                v-for="(product, i) in bubbleProducts"
                :key="product.id"
                class="bubble"
                :class="{
                  'is-hovered': hovered === product.id && !dragging,
                  'is-dragging': dragging?.id === product.id,
                  'is-dimmed': hovered && hovered !== product.id && !dragging,
                  'is-bagged': isBagged(product.id),
                  'has-image': !!getThumbnailUrl(product)
                }"
                :style="getBubbleStyle(i)"
                @mouseenter="!dragging && (hovered = product.id)"
                @mouseleave="!dragging && (hovered = null)"
                @mousedown.prevent="startDrag($event, product)"
                @touchstart.prevent="startDrag($event, product)"
              >
                <!-- 배경 이미지 -->
                <img v-if="getThumbnailUrl(product)" :src="getThumbnailUrl(product)" alt="" class="bubble-bg-image" />
                <!-- 이미지 위 오버레이 (텍스트 가독성) -->
                <div v-if="getThumbnailUrl(product)" class="bubble-overlay"></div>

                <span v-if="nodes[i]?.r > 45" class="bubble-name" :style="{ fontSize: Math.max(9, nodes[i].r * 0.13) + 'px', color: getThumbnailUrl(product) || i < 3 ? '#fff' : '#333', maxWidth: nodes[i].r * 1.4 + 'px' }">{{ product.name }}</span>
                <span v-if="nodes[i]?.r > 55" class="bubble-brand" :style="{ fontSize: Math.max(8, nodes[i].r * 0.1) + 'px', color: getThumbnailUrl(product) || i < 3 ? 'rgba(255,255,255,0.85)' : '#999' }">{{ product.brand }}</span>

                <!-- Top 3 뱃지 -->
                <div v-if="i < 3" class="rank-badge-top" :class="'rank-' + (i + 1)" :style="{ fontSize: Math.max(8, nodes[i].r * 0.11) + 'px' }">{{ i + 1 }}</div>
                <!-- 4위 이하 뱃지 -->
                <div v-else class="rank-badge-sm" :style="{ width: Math.max(16, nodes[i].r * 0.24) + 'px', height: Math.max(16, nodes[i].r * 0.24) + 'px', fontSize: Math.max(8, nodes[i].r * 0.12) + 'px' }">{{ i + 1 }}</div>

                <!-- 담김 표시 -->
                <div v-if="isBagged(product.id)" class="bagged-check" :style="{ width: Math.max(16, nodes[i].r * 0.26) + 'px', height: Math.max(16, nodes[i].r * 0.26) + 'px', fontSize: Math.max(8, nodes[i].r * 0.12) + 'px' }">✓</div>
              </div>

              <!-- 범례 -->
              <div class="bubble-legend">
                <div class="legend-item">
                  <div class="legend-dot big"></div>
                  <span>인기 높음</span>
                </div>
                <svg width="28" height="10" viewBox="0 0 28 10" fill="none">
                  <line x1="0" y1="5" x2="24" y2="5" stroke="#ccc" stroke-width="1.5"/>
                  <path d="M20 1L27 5L20 9" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="legend-item">
                  <div class="legend-dot small"></div>
                  <span>인기 낮음</span>
                </div>
              </div>

              <!-- 툴팁 -->
              <div v-if="tooltipProduct && !dragging" class="bubble-tooltip" :style="tooltipStyle">
                <div class="tooltip-header">
                  <span class="tooltip-name">{{ tooltipProduct.name }}</span>
                  <span class="tooltip-rank">#{{ filtered.indexOf(tooltipProduct) + 1 }}</span>
                </div>
                <span class="tooltip-brand">{{ tooltipProduct.brand }}</span>
                <div class="tooltip-metrics">
                  <div><div class="metric-label">평점</div><div class="metric-value">⭐ {{ formatRating(tooltipProduct.averageRating) }}</div></div>
                  <div><div class="metric-label">피드</div><div class="metric-value">{{ formatCount(tooltipProduct.reviewCount) }}</div></div>
                  <div><div class="metric-label">관심도</div><div class="metric-value purple">{{ getPopularityScore(tooltipProduct) }}</div></div>
                </div>
                <div class="tooltip-hint">
                  <span>드래그해서 캐리어에 담기</span>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 2L9 9M9 9H3M9 9V3" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
              </div>
            </div>

            <!-- 캐리어 패널 -->
            <div ref="carrierPanelRef" class="carrier-panel">
              <!-- 담긴 목록 -->
              <Transition name="panel-fade">
                <div v-if="bagOpen" class="carrier-items">
                  <div class="carrier-items-header">
                    <span>내 캐리어 ({{ bagged.length }}개)</span>
                    <button v-if="bagged.length" class="carrier-clear-all" @click="clearAllBagged">전체 삭제</button>
                  </div>
                  <div v-if="!bagged.length" class="carrier-empty">아직 담긴 아이템이 없어요</div>
                  <div v-else class="carrier-list">
                    <div v-for="item in bagged" :key="item.id" class="carrier-chip">
                      <div class="carrier-chip-info">
                        <div class="carrier-chip-name">{{ item.name }}</div>
                        <div class="carrier-chip-brand">{{ item.brand }}</div>
                      </div>
                      <button class="carrier-chip-remove" @click="removeBagged(item.id)">✕</button>
                    </div>
                  </div>
                  <button class="carrier-go-btn" @click="goToCarrier">내 캐리어 보러가기</button>
                </div>
              </Transition>

              <!-- 드롭 힌트 -->
              <div v-if="isOverBag && dragging" class="carrier-drop-hint">놓아서 담기!</div>

              <!-- 캐리어 아이콘 -->
              <div
                ref="bagRef"
                class="carrier-icon"
                :class="{ active: isOverBag, 'has-items': bagged.length > 0 }"
                :key="bounceKey"
                @click="toggleBag"
              >
                <svg width="50" height="50" viewBox="0 0 56 60" fill="none">
                  <rect x="19" y="3" width="18" height="8" rx="4" :stroke="carrierColor" stroke-width="2.5" fill="none"/>
                  <rect x="6" y="11" width="44" height="38" rx="7" :fill="carrierBg" :stroke="carrierColor" stroke-width="2.5"/>
                  <line x1="6" y1="22" x2="50" y2="22" :stroke="carrierColor" stroke-width="1.8"/>
                  <line x1="6" y1="37" x2="50" y2="37" :stroke="carrierColor" stroke-width="1.8"/>
                  <line x1="28" y1="11" x2="28" y2="49" :stroke="carrierColor" stroke-width="1.2" stroke-dasharray="3 3"/>
                  <rect x="23" y="27" width="10" height="7" rx="2.5" :fill="carrierColor" opacity="0.75"/>
                  <circle cx="15" cy="53" r="4" :fill="carrierColor"/>
                  <circle cx="41" cy="53" r="4" :fill="carrierColor"/>
                </svg>
                <div v-if="bagged.length" class="carrier-badge">{{ bagged.length }}</div>
              </div>
            </div>
          </div>

          <!-- 전체 순위 리스트 -->
          <div class="rank-list">
            <div class="rank-list-header">전체 순위</div>
            <div
              v-for="(product, i) in rankListVisible"
              :key="product.id"
              class="rank-item"
              @click="goToDetail(product)"
            >
              <span class="rank-num" :class="{ gold: i === 0, silver: i === 1, bronze: i === 2 }">{{ i + 1 }}</span>
              <div class="rank-info">
                <div class="rank-name">{{ product.name }}</div>
                <div class="rank-brand">{{ product.brand }}</div>
              </div>
              <div class="rank-stats">
                <div class="rank-rating">⭐ {{ formatRating(product.averageRating) }}</div>
                <div class="rank-review">{{ formatCount(product.reviewCount) }}개</div>
              </div>
              <div class="rank-bar">
                <div class="rank-bar-fill" :style="{ width: getScorePercent(product) + '%' }"></div>
              </div>
            </div>
            <button v-if="filtered.length > 3" class="rank-toggle-btn" @click="rankExpanded = !rankExpanded">
              {{ rankExpanded ? '접기' : `4위부터 보기 (${filtered.length - 3}개)` }}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" :style="{ transform: rankExpanded ? 'rotate(180deg)' : 'none' }">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- 더보기 -->
          <div v-if="hasNext" class="load-more">
            <button class="load-more-btn" :disabled="loading" @click="loadMore">
              {{ loading ? '불러오는 중...' : '더 보기' }}
            </button>
          </div>
        </div>
        </Transition>
      </div>
    </main>

    <BottomNavigation />

    <!-- 드래그 고스트 -->
    <Teleport to="body">
      <div v-if="dragging" class="drag-ghost" :style="{ left: dragging.x + 'px', top: dragging.y + 'px' }">
        <div class="drag-ghost-circle">
          <img v-if="dragging.image" :src="dragging.image" alt="" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import CommonCategoryFilter from '@/components/category/CommonCategoryFilter.vue'
import { productService } from '@/services/ProductService.js'
import { carrierService } from '@/services/CarrierService.js'
import { useCategoryCache } from '@/composables/useCategoryCache.js'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const { allCategories: cachedCategories, loadAllCategories } = useCategoryCache()
const { isLoggedIn } = useAuth()

// ==================== 상수 ====================
const MIN_RADIUS = 28
const MAX_RADIUS = 110
const BUBBLE_LIMIT = 30
const PAGE_SIZE = 20

// ==================== 유틸 함수 ====================
function getRadius(score, maxScore) {
  if (!maxScore) return MIN_RADIUS
  return MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.sqrt(score / maxScore)
}

function getRankColor(rank) {
  if (rank === 1) return { bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: '#7c3aed', glow: 'rgba(124,58,237,0.3)' }
  if (rank === 2) return { bg: 'linear-gradient(135deg,#6366f1,#818cf8)', border: '#6366f1', glow: 'rgba(99,102,241,0.2)' }
  if (rank === 3) return { bg: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', border: '#8b5cf6', glow: 'rgba(139,92,246,0.2)' }
  return { bg: '#fff', border: '#e5e7eb', glow: 'transparent' }
}

function computeLayout(nodeList, W, H) {
  if (!nodeList.length || !W || !H) return []
  const cx = W / 2, cy = H / 2
  const pos = nodeList.map((n, i) => {
    const angle = (i / nodeList.length) * Math.PI * 2
    const dist = 50 + Math.min(cx, cy) * 0.4 * (i / nodeList.length)
    return { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, vx: 0, vy: 0, r: n.r }
  })
  for (let tick = 0; tick < 300; tick++) {
    const alpha = Math.max(0.001, 1 - tick / 300)
    for (let i = 0; i < pos.length; i++) {
      const dx = cx - pos[i].x, dy = cy - pos[i].y
      const pull = 0.01 * alpha * (i < 3 ? 1.8 : 0.3)
      pos[i].vx += dx * pull; pos[i].vy += dy * pull
      for (let j = i + 1; j < pos.length; j++) {
        const ddx = pos[i].x - pos[j].x, ddy = pos[i].y - pos[j].y
        const d = Math.sqrt(ddx * ddx + ddy * ddy) || 1
        const minD = pos[i].r + pos[j].r + 6
        if (d < minD) {
          const f = (minD - d) / d * 0.3
          pos[i].vx += ddx * f; pos[i].vy += ddy * f
          pos[j].vx -= ddx * f; pos[j].vy -= ddy * f
        }
      }
      pos[i].vx *= 0.7; pos[i].vy *= 0.7
      pos[i].x += pos[i].vx; pos[i].y += pos[i].vy
      const pad = pos[i].r + 2
      pos[i].x = Math.max(pad, Math.min(W - pad, pos[i].x))
      pos[i].y = Math.max(pad, Math.min(H - pad, pos[i].y))
    }
  }
  return pos.map(p => ({ x: p.x, y: p.y }))
}

// ==================== Refs ====================
const containerRef = ref(null)
const bagRef = ref(null)
const carrierPanelRef = ref(null)

// ==================== 상태 ====================
const products = ref([])
const loading = ref(true)
const hasNext = ref(true)
const currentPage = ref(0)
const searchKeyword = ref('')
const selectedCategoryId = ref(null)
const selectedCategoryDepth = ref(null)
const categories = ref([])

const dims = ref({ w: 0, h: 0 })
const hovered = ref(null)
const mousePos = ref({ x: 0, y: 0 })
const dragging = ref(null)
const isOverBag = ref(false)
const isOverPanel = ref(false)
const bagged = ref([])
const bagOpen = ref(false)
const bounceKey = ref(0)
const rankExpanded = ref(false)
const defaultCarrierId = ref(null)
const carrierItemMap = ref({}) // productId → carrierItemId

let resizeObserver = null
let isDraggingFlag = false

// ==================== Computed ====================
const getPopularityScore = (product) => {
  if (!product) return 0
  if (product.popularityScore != null) return product.popularityScore
  return (product.viewCount || 0) + ((product.likeCount || 0) * 3) + ((product.shareCount || 0) * 5) + ((product.reviewCount || 0) * 2)
}

const filtered = computed(() => {
  let list = products.value
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.toLowerCase().trim()
    list = list.filter(p => p.name?.toLowerCase().includes(kw) || p.brand?.toLowerCase().includes(kw))
  }
  return list.sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
})

const bubbleProducts = computed(() => filtered.value.slice(0, BUBBLE_LIMIT))
const maxScore = computed(() => getPopularityScore(filtered.value[0]) || 1)

const nodes = computed(() =>
  bubbleProducts.value.map(p => ({ id: p.id, r: getRadius(getPopularityScore(p), maxScore.value) }))
)

const positions = computed(() => computeLayout(nodes.value, dims.value.w, dims.value.h))

const tooltipProduct = computed(() => {
  if (!hovered.value) return null
  return filtered.value.find(p => p.id === hovered.value) || null
})

const tooltipStyle = computed(() => {
  if (!tooltipProduct.value) return {}
  const W = 220
  let left = mousePos.value.x - W / 2
  let top = mousePos.value.y - 160
  if (top < 0) top = mousePos.value.y + 10
  if (left < 0) left = 4
  if (left + W > dims.value.w) left = dims.value.w - W - 4
  return { left: left + 'px', top: top + 'px', width: W + 'px' }
})

const rankListVisible = computed(() => rankExpanded.value ? filtered.value : filtered.value.slice(0, 3))

const carrierColor = computed(() => (isOverBag.value || bagged.value.length > 0) ? '#7c3aed' : '#9ca3af')
const carrierBg = computed(() => (isOverBag.value || bagged.value.length > 0) ? '#ede9fe' : '#f5f3ff')

// ==================== 메서드 ====================
function getBubbleStyle(i) {
  if (!positions.value[i] || !nodes.value[i]) return { display: 'none' }
  const pos = positions.value[i]
  const r = nodes.value[i].r
  const rank = i + 1
  const colors = getRankColor(rank)
  const product = bubbleProducts.value[i]
  const isHov = hovered.value === product?.id && !dragging.value
  const isDrag = dragging.value?.id === product?.id
  const inBag = isBagged(product?.id)
  const hasImage = !!getThumbnailUrl(product)

  return {
    left: (pos.x - r) + 'px',
    top: (pos.y - r) + 'px',
    width: (r * 2) + 'px',
    height: (r * 2) + 'px',
    background: hasImage ? '#000' : (rank <= 3 ? colors.bg : '#fff'),
    borderColor: isHov ? '#7c3aed' : inBag ? '#7c3aed' : colors.border,
    borderWidth: inBag ? '2.5px' : '2px',
    boxShadow: isDrag ? 'none'
      : isHov ? `0 8px 32px ${colors.glow}, 0 0 0 4px rgba(124,58,237,0.1)`
      : rank <= 3 ? `0 4px 16px ${colors.glow}` : '0 2px 8px rgba(0,0,0,0.06)',
    opacity: isDrag ? 0.25 : 1,
    zIndex: isHov ? 50 : rank <= 3 ? 10 : 1
  }
}

function isBagged(id) { return bagged.value.some(b => b.id === id) }

function getScorePercent(product) {
  const score = getPopularityScore(product)
  if (!score || !maxScore.value) return 0
  return Math.round((score / maxScore.value) * 100)
}

function formatCount(count) {
  if (!count) return '0'
  if (count >= 10000) return (count / 10000).toFixed(1) + '만'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toLocaleString()
}

function formatRating(rating) {
  if (!rating) return '0.0'
  return typeof rating === 'number' ? rating.toFixed(1) : rating
}

function getThumbnailUrl(product) {
  return product.thumbnailDto?.fileUrl || product.thumbnailDto?.filePath || product.thumbnailUrl || null
}

function goToDetail(product) {
  router.push({ name: 'ProductDetail', params: { id: product.id } })
}

function goToCarrier() {
  router.push('/carrier')
}

async function removeBagged(id) {
  bagged.value = bagged.value.filter(b => b.id !== id)
  if (isLoggedIn.value && defaultCarrierId.value && carrierItemMap.value[id]) {
    try {
      await carrierService.removeItem(defaultCarrierId.value, carrierItemMap.value[id])
      delete carrierItemMap.value[id]
    } catch (e) {
      console.error('캐리어 아이템 제거 실패:', e)
    }
  }
}

async function clearAllBagged() {
  const itemsToRemove = [...bagged.value]
  bagged.value = []
  if (isLoggedIn.value && defaultCarrierId.value) {
    for (const item of itemsToRemove) {
      const carrierItemId = carrierItemMap.value[item.id]
      if (carrierItemId) {
        try {
          await carrierService.removeItem(defaultCarrierId.value, carrierItemId)
        } catch (e) {
          console.error('캐리어 아이템 제거 실패:', e)
        }
        delete carrierItemMap.value[item.id]
      }
    }
  }
}

function toggleBag() {
  if (isDraggingFlag) return
  bagOpen.value = !bagOpen.value
}

// ==================== 마우스/터치 ====================
function handleMouseMove(e) {
  const rect = containerRef.value?.getBoundingClientRect()
  if (rect) mousePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onAreaLeave() {
  if (!dragging.value) hovered.value = null
}

function startDrag(e, product) {
  hovered.value = null
  isDraggingFlag = true
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const thumb = product.thumbnailDto?.fileUrl || product.thumbnailDto?.filePath || null
  dragging.value = { id: product.id, image: thumb, x: clientX, y: clientY, startX: clientX, startY: clientY }
}

function onGlobalMove(e) {
  if (!dragging.value) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  dragging.value = { ...dragging.value, x: clientX, y: clientY }

  let overIcon = false, overPanel = false
  const bagEl = bagRef.value
  const panelEl = carrierPanelRef.value
  if (bagEl) {
    const r = bagEl.getBoundingClientRect()
    if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) overIcon = true
  }
  if (bagOpen.value && panelEl) {
    const r = panelEl.getBoundingClientRect()
    if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) overPanel = true
  }
  isOverBag.value = overIcon
  isOverPanel.value = overPanel
}

async function onGlobalUp() {
  if (!dragging.value) return
  const dx = dragging.value.x - dragging.value.startX
  const dy = dragging.value.y - dragging.value.startY
  const dist = Math.sqrt(dx * dx + dy * dy)
  // 드래그 거리가 짧으면 클릭으로 간주 → 디테일 이동
  if (dist < 5 && !isOverBag.value && !isOverPanel.value) {
    const product = products.value.find(p => p.id === dragging.value.id)
    dragging.value = null
    isOverBag.value = false
    isOverPanel.value = false
    isDraggingFlag = false
    if (product) goToDetail(product)
    return
  }
  if (isOverBag.value || isOverPanel.value) {
    const product = products.value.find(p => p.id === dragging.value.id)
    if (product && !isBagged(product.id)) {
      bagged.value = [...bagged.value, product]
      bagOpen.value = true
      bounceKey.value++
      // API 연동: 캐리어에 아이템 추가
      if (isLoggedIn.value && defaultCarrierId.value) {
        try {
          const res = await carrierService.addItem(defaultCarrierId.value, {
            productId: product.id,
            positionX: 0.5,
            positionY: 0.5,
            zIndex: 0
          })
          if (res.success && res.data?.id) {
            carrierItemMap.value[product.id] = res.data.id
          }
        } catch (e) {
          console.error('캐리어 아이템 추가 실패:', e)
        }
      }
    }
  }
  dragging.value = null
  isOverBag.value = false
  isOverPanel.value = false
  setTimeout(() => { isDraggingFlag = false }, 100)
}

function onClickOutside(e) {
  if (isDraggingFlag) return
  if (carrierPanelRef.value?.contains(e.target)) return
  if (bagRef.value?.contains(e.target)) return
  bagOpen.value = false
}

// ==================== 캐리어 ====================
async function loadDefaultCarrier() {
  if (!isLoggedIn.value) return
  try {
    const res = await carrierService.getMyCarriers()
    if (res.success && res.data?.length) {
      const carrier = res.data.find(c => c.isDefault) || res.data[0]
      defaultCarrierId.value = carrier.id
      const detail = await carrierService.getCarrier(carrier.id)
      if (detail.success && detail.data?.items) {
        for (const item of detail.data.items) {
          carrierItemMap.value[item.productId] = item.id
          if (!bagged.value.some(b => b.id === item.productId)) {
            bagged.value.push({ id: item.productId, name: item.productName, brand: item.brandName })
          }
        }
      }
    }
  } catch (e) {
    console.error('캐리어 로드 실패:', e)
  }
}

// ==================== API ====================
let fetchingRanking = false
async function fetchRanking(reset = false) {
  if (fetchingRanking) return
  fetchingRanking = true
  loading.value = true
  try {
    if (reset) { products.value = []; currentPage.value = 0; hasNext.value = true }

    const searchCondition = { status: 'APPROVED' }
    if (selectedCategoryId.value) {
      searchCondition.categoryId = selectedCategoryId.value
      searchCondition.categoryDepth = selectedCategoryDepth.value
    }

    const response = await productService.getProducts(searchCondition, {
      page: currentPage.value,
      size: PAGE_SIZE,
      sort: 'popularityScore,DESC'
    })

    if (response.success && response.data) {
      const pageData = response.data
      if (pageData.content) {
        products.value = reset ? pageData.content : [...products.value, ...pageData.content]
        hasNext.value = !pageData.last
      } else if (Array.isArray(pageData)) {
        products.value = reset ? pageData : [...products.value, ...pageData]
        hasNext.value = pageData.length >= PAGE_SIZE
      }
    } else {
      hasNext.value = false
    }
  } catch (e) {
    console.error('랭킹 로드 실패:', e)
    hasNext.value = false
  } finally {
    loading.value = false
    fetchingRanking = false
  }
}

async function fetchCategories() {
  try {
    await loadAllCategories()
    categories.value = cachedCategories.value
  } catch (e) {
    console.error('카테고리 로드 실패:', e)
  }
}

function handleCategoryChange({ categoryId, categoryDepth, subCategory }) {
  selectedCategoryId.value = categoryId
  selectedCategoryDepth.value = categoryDepth || (subCategory ? 2 : 1)
  fetchRanking(true)
}

function loadMore() {
  currentPage.value++
  fetchRanking(false)
}

// ==================== 라이프사이클 ====================
watch(() => route.query, (query) => {
  if (query.categoryId) {
    selectedCategoryId.value = Number(query.categoryId)
  }
}, { immediate: true })

// containerRef가 조건부 렌더링 안에 있으므로, DOM에 나타날 때 ResizeObserver 연결
watch(containerRef, (el, oldEl) => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (el) {
    resizeObserver = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      dims.value = { w: width, h: Math.max(500, Math.min(700, width * 0.75)) }
    })
    resizeObserver.observe(el)
  }
})

onMounted(async () => {
  // 글로벌 이벤트
  window.addEventListener('mousemove', onGlobalMove)
  window.addEventListener('mouseup', onGlobalUp)
  window.addEventListener('touchmove', onGlobalMove, { passive: false })
  window.addEventListener('touchend', onGlobalUp)
  document.addEventListener('click', onClickOutside)

  await fetchCategories()
  fetchRanking(true)
  loadDefaultCarrier()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('mousemove', onGlobalMove)
  window.removeEventListener('mouseup', onGlobalUp)
  window.removeEventListener('touchmove', onGlobalMove)
  window.removeEventListener('touchend', onGlobalUp)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
* { box-sizing: border-box; }

.no-select { user-select: none; }

.app-container {
  background: #fff;
  min-height: 100vh;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100%;
  overflow-x: clip;
  padding: 0 1rem;
  color: #222;
}
@media (min-width: 768px) { .app-container { padding: 0 2rem; } }
@media (min-width: 1280px) { .app-container { padding: 0 3rem; max-width: 1920px; margin: 0 auto; } }

.main-content { flex: 1; min-width: 0; padding-bottom: 80px; padding-left: 1.5rem; }
@media (max-width: 767px) { .main-content { padding-left: 0; } }
@media (min-width: 768px) { .main-content { padding-bottom: 0; } }

.ranking-view { max-width: 1000px; margin: 0; }

/* 헤더 */
.page-header { padding: 20px 0 16px; }
.header-label { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; color: #7c3aed; display: block; margin-bottom: 4px; padding-left: 13px; }
.page-header h1 { font-size: 26px; font-weight: 800; color: #111; margin: 4px 0; border-left: 3px solid #9333ea; padding-left: 10px; }
.header-desc { font-size: 13px; color: #94a3b8; margin: 0; padding-left: 13px; }

/* 검색 */
.search-box { position: relative; margin-bottom: 16px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.search-input { width: 100%; padding: 12px 40px; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 14px; font-family: inherit; background: #fff; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.search-input:focus { border-color: #9333ea; box-shadow: 0 0 0 3px rgba(147,51,234,0.1); }
.search-input::placeholder { color: #9ca3af; }
.search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; background: #f3f4f6; border: none; border-radius: 50%; color: #6b7280; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.search-clear:hover { background: #e5e7eb; }

/* 로딩 & 빈 상태 */
.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 0; color: #888; }
.spinner { width: 32px; height: 32px; border: 2px solid #f0f0f0; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ==================== 버블 차트 ==================== */
.bubble-wrapper { position: relative; margin-bottom: 16px; }

.bubble-area {
  position: relative; width: 100%; min-height: 500px;
  background: #fff; border-radius: 6px; border: 1px solid #e5e7eb;
  overflow: hidden; cursor: default;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.grid-bg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.3; }

/* 버블 */
.bubble {
  position: absolute; border-radius: 50%; border: 2px solid;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: grab; transition: opacity 0.15s, box-shadow 0.2s, border-color 0.2s, filter 0.2s;
  user-select: none;
}
.bubble.is-dimmed { filter: brightness(0.55) saturate(0.3); }
.bubble.is-dragging { opacity: 0.25 !important; }

/* 버블 배경 이미지 */
.bubble-bg-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; border-radius: 50%;
  z-index: 0;
}
.bubble-overlay {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}
.bubble.has-image .bubble-name,
.bubble.has-image .bubble-brand { position: relative; z-index: 2; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
.bubble.has-image .rank-badge-top,
.bubble.has-image .rank-badge-sm,
.bubble.has-image .bagged-check { z-index: 3; }

.bubble-name { font-weight: 700; margin-top: 3px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 4px; }
.bubble-brand { margin-top: 1px; }

/* Top 3 뱃지 */
.rank-badge-top {
  position: absolute; top: 6px; left: 50%; transform: translateX(-50%);
  font-weight: 900; padding: 2px 8px; border-radius: 4px;
  letter-spacing: 0.06em; white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0,0,0,0.18); z-index: 5;
}
.rank-badge-top.rank-1 { background: #FFD700; color: #7a5a00; }
.rank-badge-top.rank-2 { background: #C0C0C0; color: #444; }
.rank-badge-top.rank-3 { background: #CD7F32; color: #5a2d00; }

/* 4위+ 뱃지 */
.rank-badge-sm {
  position: absolute; top: -4px; right: -4px; border-radius: 50%;
  background: #f3f4f6; display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #888;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1.5px solid #fff;
}

/* 담김 표시 */
.bagged-check {
  position: absolute; top: -4px; left: -4px; border-radius: 50%;
  background: #7c3aed; display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff; box-shadow: 0 1px 4px rgba(124,58,237,0.4);
  color: #fff; font-weight: 700;
}

/* 범례 */
.bubble-legend {
  position: absolute; bottom: 14px; left: 16px;
  display: flex; align-items: center; gap: 8px; pointer-events: none;
}
.legend-item { display: flex; align-items: center; gap: 5px; }
.legend-item span { font-size: 11px; color: #888; }
.legend-dot.big { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg,#7c3aed,#a78bfa); }
.legend-dot.small { width: 13px; height: 13px; border-radius: 50%; border: 1.5px solid #e5e7eb; background: #fff; }

/* 툴팁 */
.bubble-tooltip {
  position: absolute; z-index: 100;
  background: #fff; border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15); border: 1px solid #e5e7eb;
  pointer-events: none; animation: fadeIn 0.15s ease;
}
.tooltip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.tooltip-name { font-weight: 700; font-size: 14px; color: #111; }
.tooltip-rank { font-size: 11px; color: #7c3aed; font-weight: 700; }
.tooltip-brand { font-size: 12px; color: #888; }
.tooltip-metrics { display: flex; gap: 12px; margin-top: 10px; }
.metric-label { font-size: 10px; color: #aaa; }
.metric-value { font-weight: 700; font-size: 14px; color: #333; }
.metric-value.purple { color: #7c3aed; }
.tooltip-hint { margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 10px; color: #aaa; }

/* ==================== 캐리어 패널 ==================== */
.carrier-panel {
  position: absolute; bottom: 12px; right: 12px; z-index: 200;
  display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
}

.carrier-items {
  background: #fff; border-radius: 16px; border: 1px solid #e5e7eb;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12); padding: 14px 14px 10px;
  min-width: 230px; max-width: 280px;
}
.carrier-items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 12px; font-weight: 700; color: #7c3aed; letter-spacing: 0.03em; }
.carrier-clear-all { font-size: 10px; color: #c084fc; border: none; background: none; cursor: pointer; }
.carrier-empty { font-size: 12px; color: #bbb; text-align: center; padding: 10px 0; }
.carrier-list { display: flex; flex-direction: column; gap: 6px; max-height: 265px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #c4b5fd #f5f3ff; }

.carrier-chip { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 10px; background: #faf5ff; animation: chipIn 0.2s ease; }
.carrier-chip-info { flex: 1; min-width: 0; }
.carrier-chip-name { font-size: 12px; font-weight: 600; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.carrier-chip-brand { font-size: 10px; color: #999; }
.carrier-chip-remove { border: none; background: none; cursor: pointer; color: #c084fc; font-size: 14px; line-height: 1; padding: 2px 4px; }

.carrier-go-btn { width: 100%; margin-top: 10px; padding: 9px 0; border-radius: 8px; border: none; background: #7c3aed; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; letter-spacing: 0.02em; font-family: inherit; }
.carrier-go-btn:hover { background: #6d28d9; }

.carrier-drop-hint { background: #ede9fe; border: 2px dashed #7c3aed; border-radius: 12px; padding: 6px 14px; font-size: 12px; color: #7c3aed; font-weight: 600; animation: fadeIn 0.1s ease; white-space: nowrap; }

.carrier-icon {
  width: 72px; height: 72px; border-radius: 22px;
  background: #fff; border: 2px solid #e5e7eb;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  position: relative;
}
.carrier-icon.active { background: #ede9fe; border: 2.5px dashed #7c3aed; box-shadow: 0 0 0 5px rgba(124,58,237,0.15), 0 8px 24px rgba(124,58,237,0.2); animation: bagBounce 0.5s ease; }
.carrier-icon.has-items { border-color: #c4b5fd; }

.carrier-badge {
  position: absolute; top: -7px; right: -7px;
  width: 22px; height: 22px; border-radius: 50%;
  background: linear-gradient(135deg,#7c3aed,#a78bfa); color: #fff;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(124,58,237,0.4); border: 2px solid #fff;
  animation: popIn 0.25s ease;
}

/* ==================== 순위 리스트 ==================== */
.rank-list { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 16px; }
.rank-list-header { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; font-weight: 600; color: #666; }

.rank-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 20px;
  border-bottom: 1px solid #f8f8f8; cursor: pointer; transition: background 0.15s;
}
.rank-item:last-of-type { border-bottom: none; }
.rank-item:hover { background: #fafafa; }

.rank-num {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; background: #f3f4f6; color: #888;
}
.rank-num.gold { background: linear-gradient(135deg,#FFD700,#FFA500); color: #000; }
.rank-num.silver { background: linear-gradient(135deg,#E8E8E8,#B8B8B8); color: #fff; }
.rank-num.bronze { background: linear-gradient(135deg,#CD7F32,#8B4513); color: #fff; }

.rank-info { flex: 1; min-width: 0; }
.rank-name { font-size: 14px; font-weight: 600; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rank-brand { font-size: 11px; color: #999; }

.rank-stats { text-align: right; flex-shrink: 0; }
.rank-rating { font-size: 12px; font-weight: 600; color: #333; }
.rank-review { font-size: 10px; color: #aaa; }

.rank-bar { width: 50px; height: 4px; background: #f3f4f6; border-radius: 2px; overflow: hidden; flex-shrink: 0; }
.rank-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg,#8B5CF6,#A78BFA); transition: width 0.3s; }

.rank-toggle-btn {
  width: 100%; padding: 12px 0; border: none; background: none; cursor: pointer;
  font-size: 13px; font-weight: 600; color: #7c3aed; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 4px; transition: background 0.15s;
}
.rank-toggle-btn:hover { background: #faf5ff; }
.rank-toggle-btn svg { transition: transform 0.2s; }

/* 더보기 */
.load-more { text-align: center; padding: 8px 0 32px; }
.load-more-btn { padding: 12px 32px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-weight: 500; color: #666; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.load-more-btn:hover:not(:disabled) { border-color: #7c3aed; color: #7c3aed; }
.load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ==================== 애니메이션 ==================== */
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes popIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
@keyframes bagBounce { 0%,100% { transform: scale(1); } 30% { transform: scale(1.18) rotate(-4deg); } 60% { transform: scale(0.94) rotate(2deg); } }
@keyframes chipIn { from { opacity: 0; transform: translateY(8px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }

.panel-fade-enter-active { animation: fadeIn 0.2s ease; }
.panel-fade-leave-active { transition: opacity 0.15s; }
.panel-fade-leave-to { opacity: 0; }

/* 로딩/빈/콘텐츠 상태 전환 */
.view-fade-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.view-fade-leave-active { transition: opacity 0.15s ease; }
.view-fade-enter-from { opacity: 0; transform: translateY(8px); }
.view-fade-leave-to { opacity: 0; }

/* 모바일 */
@media (max-width: 640px) {
  .page-header h1 { font-size: 22px; }
  .carrier-icon { width: 60px; height: 60px; border-radius: 18px; }
  .carrier-icon svg { width: 40px; height: 40px; }
  .rank-bar { display: none; }
}
</style>

<!-- 드래그 고스트 (Teleport → body이므로 non-scoped) -->
<style>
.drag-ghost {
  position: fixed; transform: translate(-50%, -50%);
  pointer-events: none; z-index: 9999;
}
.drag-ghost-circle {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 28px rgba(124,58,237,0.5);
  border: 3px solid #fff; opacity: 0.93; overflow: hidden;
}
.drag-ghost-circle img { width: 100%; height: 100%; object-fit: cover; }
</style>
