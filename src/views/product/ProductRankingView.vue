<template>
  <div class="app-container" :class="{ 'no-select': !!dragging }">
    <AppSidebar />

    <main class="main-content">
      <div class="ranking-view">
        <!-- 헤더 (피드 섹션 타이틀 톤과 통일) — 카테고리 필터 위로 이동 -->
        <header class="page-header">
          <div class="title-with-badge">
            <h2 class="section-title">핫 <span class="title-accent">아이템</span></h2>
            <span class="sub-title">버블이 클수록 이번 주 인기가 높아요</span>
          </div>
        </header>

        <CommonCategoryFilter
          :categories="categories"
          :show-view-toggle="false"
          :initial-category-id="selectedCategoryId"
          @category-change="handleCategoryChange"
        />

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

        <!-- 로딩 스켈레톤 -->
        <div v-if="loading && !products.length" class="skeleton-wrapper">
          <!-- 버블 차트 스켈레톤 -->
          <div class="skeleton-bubble-area">
            <div class="skeleton-bubble skeleton-bubble-1"></div>
            <div class="skeleton-bubble skeleton-bubble-2"></div>
            <div class="skeleton-bubble skeleton-bubble-3"></div>
            <div class="skeleton-bubble skeleton-bubble-4"></div>
            <div class="skeleton-bubble skeleton-bubble-5"></div>
            <div class="skeleton-bubble skeleton-bubble-6"></div>
            <div class="skeleton-bubble skeleton-bubble-7"></div>
            <div class="skeleton-bubble skeleton-bubble-8"></div>
          </div>

          <!-- 순위 리스트 스켈레톤 -->
          <div class="skeleton-rank-list">
            <div class="skeleton-rank-header">
              <div class="skeleton-line" style="width: 70px; height: 13px;"></div>
            </div>
            <div v-for="n in 3" :key="'skel-rank-' + n" class="skeleton-rank-item">
              <div class="skeleton-rank-num"></div>
              <div class="skeleton-rank-info">
                <div class="skeleton-line" style="width: 55%; height: 14px;"></div>
                <div class="skeleton-line" style="width: 35%; height: 11px; margin-top: 4px;"></div>
              </div>
              <div class="skeleton-rank-stats">
                <div class="skeleton-line" style="width: 40px; height: 12px;"></div>
                <div class="skeleton-line" style="width: 28px; height: 10px; margin-top: 3px;"></div>
              </div>
              <div class="skeleton-rank-bar"></div>
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="!filtered.length && !loading" class="empty-state">
          <p>{{ searchKeyword ? '검색 결과가 없습니다' : '등록된 아이템이 없습니다' }}</p>
        </div>

        <div v-else-if="filtered.length">
          <!-- 캐꾸(캐리어 꾸미기) 가이드 배너 -->
          <div v-if="showCarrierGuide" class="carrier-guide-banner">
            <div class="cgb-icon-wrap">
              <svg class="cgb-hand" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
              </svg>
            </div>
            <div class="cgb-text">
              <span class="cgb-title">내 캐리어를 꾸며보세요</span>
              <span class="cgb-sub">버블을 잡아 캐리어로 끌어다 놓으면 나만의 캐꾸가 시작돼요</span>
            </div>
            <button class="cgb-close" @click="dismissCarrierGuide" aria-label="안내 닫기">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- 버블 차트 -->
          <div class="bubble-wrapper">
            <div
              ref="containerRef"
              class="bubble-area"
              :style="{ height: dims.h + 'px' }"
              @mousemove="handleMouseMove"
              @mouseleave="onAreaLeave"
            >
              <!-- 레이아웃 계산 중 overlay (빈 그리드 플리커 방지) -->
              <div v-if="!layoutHasRendered" class="bubble-layout-overlay">
                <div class="skeleton-bubble skeleton-bubble-1"></div>
                <div class="skeleton-bubble skeleton-bubble-2"></div>
                <div class="skeleton-bubble skeleton-bubble-3"></div>
                <div class="skeleton-bubble skeleton-bubble-4"></div>
                <div class="skeleton-bubble skeleton-bubble-5"></div>
                <div class="skeleton-bubble skeleton-bubble-6"></div>
              </div>

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

                <span v-if="nodes[i]?.r > radiusBounds.min * 1.3" class="bubble-name" :style="{ fontSize: Math.max(10, nodes[i].r * 0.14) + 'px', color: getThumbnailUrl(product) || i < 3 ? '#fff' : '#333', maxWidth: nodes[i].r * 1.4 + 'px' }">{{ product.name }}</span>
                <span v-if="nodes[i]?.r > radiusBounds.min * 1.6" class="bubble-brand" :style="{ fontSize: Math.max(9, nodes[i].r * 0.11) + 'px', color: getThumbnailUrl(product) || i < 3 ? 'rgba(255,255,255,0.85)' : '#999' }">{{ product.brand }}</span>

                <!-- Top 3 뱃지 -->
                <div v-if="i < 3" class="rank-badge-top" :class="'rank-' + (i + 1)" :style="{ fontSize: Math.max(8, nodes[i].r * 0.11) + 'px' }">{{ i + 1 }}</div>
                <!-- 4위 이하 뱃지 -->
                <div v-else class="rank-badge-sm" :style="{ width: Math.max(16, nodes[i].r * 0.24) + 'px', height: Math.max(16, nodes[i].r * 0.24) + 'px', fontSize: Math.max(8, nodes[i].r * 0.12) + 'px' }">{{ i + 1 }}</div>

                <!-- 담김 표시 -->
                <div v-if="isBagged(product.id)" class="bagged-check" :style="{ width: Math.max(16, nodes[i].r * 0.26) + 'px', height: Math.max(16, nodes[i].r * 0.26) + 'px', fontSize: Math.max(8, nodes[i].r * 0.12) + 'px' }">✓</div>
              </div>


              <!-- 툴팁 -->
              <div v-if="tooltipProduct && !dragging" class="bubble-tooltip" :style="tooltipStyle">
                <div class="tooltip-header">
                  <span class="tooltip-name">{{ tooltipProduct.name }}</span>
                  <span class="tooltip-rank">#{{ filtered.indexOf(tooltipProduct) + 1 }}</span>
                </div>
                <span class="tooltip-brand">{{ tooltipProduct.brand }}</span>
                <div class="tooltip-metrics">
                  <div><div class="metric-label">평점</div><div class="metric-value"><svg class="star-icon" width="14" height="14" viewBox="0 0 14 14" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1.16666L8.795 4.81249L12.8333 5.40166L9.91667 8.24916L10.59 12.2717L7 10.3792L3.41 12.2717L4.08333 8.24916L1.16667 5.40166L5.205 4.81249L7 1.16666Z"/></svg> {{ formatRating(tooltipProduct.averageRating) }}</div></div>
                  <div><div class="metric-label">피드</div><div class="metric-value">{{ formatCount(tooltipProduct.reviewCount) }}</div></div>
                  <div><div class="metric-label">관심도</div><div class="metric-value purple">{{ Number(getPopularityScore(tooltipProduct)).toFixed(2) }}</div></div>
                </div>
                <div class="tooltip-hint">
                  <span>드래그해서 캐리어에 담기</span>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 2L9 9M9 9H3M9 9V3" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
              </div>
            </div>

            <!-- 캐리어 패널 -->
            <div ref="carrierPanelRef" class="carrier-panel">
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
              <div v-if="isOverBag && dragging" class="carrier-drop-hint">놓아서 담기!</div>
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
            <div class="rank-list-header">
              <span class="rank-list-title">전체 순위</span>
              <span class="rank-list-count">총 {{ filtered.length }}개</span>
            </div>
            <div
              v-for="(product, i) in filtered"
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
                <div class="rank-heat">
                  <Flame class="heat-icon" :size="16" :stroke-width="2.2" />
                  <span class="heat-value">{{ formatCount(getPopularityScore(product)) }}</span>
                </div>
              </div>
              <div class="rank-bar">
                <div class="rank-bar-fill" :style="{ width: getScorePercent(product) + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- 더보기 -->
          <div v-if="hasNext" class="load-more">
            <button class="load-more-btn" :disabled="loading" @click="loadMore">
              {{ loading ? '불러오는 중...' : '더 보기' }}
              <svg v-if="!loading" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
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
import { Flame } from 'lucide-vue-next'
import { productService } from '@/services/ProductService.js'
import { carrierService } from '@/services/CarrierService.js'
import { useCategoryCache } from '@/composables/useCategoryCache.js'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const { allCategories: cachedCategories, loadAllCategories } = useCategoryCache()
const { isLoggedIn } = useAuth()

// ==================== 캐리어 가이드 ====================
const CARRIER_GUIDE_DISMISS_KEY = 'hot_carrier_guide_dismissed'
const showCarrierGuide = ref(sessionStorage.getItem(CARRIER_GUIDE_DISMISS_KEY) !== '1')
const dismissCarrierGuide = () => {
  showCarrierGuide.value = false
  sessionStorage.setItem(CARRIER_GUIDE_DISMISS_KEY, '1')
}

// ==================== 상수 ====================
const bubbleLimit = computed(() => dims.value.w < 600 ? 10 : 20)
const PAGE_SIZE = 20

// ==================== 유틸 함수 ====================
function calcRadiusBounds(count, W, H) {
  const area = W * H
  if (count <= 0 || !area) return { min: 28, max: 110 }
  // 전체 면적의 ~65%를 버블이 채우도록
  const fillRatio = 0.65
  const totalBubbleArea = area * fillRatio
  // 제품 1개면 영역의 40% 지름, 많을수록 작아짐
  const maxR = Math.min(W, H) * (count === 1 ? 0.4 : count <= 3 ? 0.3 : 0.25)
  const minR = Math.max(20, maxR * 0.25)
  return { min: Math.round(minR), max: Math.round(Math.min(maxR, Math.min(W, H) * 0.45)) }
}

function getRadius(score, maxScore, minR, maxR) {
  if (!maxScore) return minR
  return minR + (maxR - minR) * Math.sqrt(score / maxScore)
}

function getRankColor(rank) {
  if (rank === 1) return { bg: '#7c3aed', border: '#7c3aed', glow: 'rgba(124,58,237,0.25)' }
  if (rank === 2) return { bg: '#6366f1', border: '#6366f1', glow: 'rgba(99,102,241,0.18)' }
  if (rank === 3) return { bg: '#8b5cf6', border: '#8b5cf6', glow: 'rgba(139,92,246,0.18)' }
  return { bg: '#fff', border: '#e5e7eb', glow: 'transparent' }
}

function computeLayout(nodeList, W, H) {
  if (!nodeList.length || !W || !H) return []
  const cx = W / 2, cy = H / 2
  const n = nodeList.length

  // 1개일 때 정중앙
  if (n === 1) return [{ x: cx, y: cy }]

  const pos = nodeList.map((nd, i) => {
    const angle = (i / n) * Math.PI * 2
    const spread = n <= 5 ? 0.2 : 0.4
    const dist = 30 + Math.min(cx, cy) * spread * (i / n)
    return { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, vx: 0, vy: 0, r: nd.r }
  })

  const gap = n <= 5 ? 4 : 6
  const centerPull = n <= 5 ? 0.015 : 0.01
  const maxTicks = 150

  for (let tick = 0; tick < maxTicks; tick++) {
    const alpha = Math.max(0.001, 1 - tick / maxTicks)
    let settled = true
    for (let i = 0; i < pos.length; i++) {
      const dx = cx - pos[i].x, dy = cy - pos[i].y
      const pull = centerPull * alpha * (i < 3 ? 1.8 : 0.3)
      pos[i].vx += dx * pull; pos[i].vy += dy * pull
      for (let j = i + 1; j < pos.length; j++) {
        const ddx = pos[i].x - pos[j].x, ddy = pos[i].y - pos[j].y
        const d = Math.sqrt(ddx * ddx + ddy * ddy) || 1
        const minD = pos[i].r + pos[j].r + gap
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
      if (Math.abs(pos[i].vx) > 0.5 || Math.abs(pos[i].vy) > 0.5) settled = false
    }
    if (settled && tick > 60) break
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
  return [...products.value].sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
})

const bubbleProducts = computed(() => filtered.value.slice(0, bubbleLimit.value))
const maxScore = computed(() => getPopularityScore(filtered.value[0]) || 1)

const radiusBounds = computed(() =>
  calcRadiusBounds(bubbleProducts.value.length, dims.value.w, dims.value.h)
)

const nodes = computed(() => {
  const { min, max } = radiusBounds.value
  const items = bubbleProducts.value
  if (items.length === 0) return []

  const { w, h } = dims.value
  if (!w || !h) return items.map(p => ({ id: p.id, r: min }))

  const scores = items.map(p => Math.max(0, getPopularityScore(p) || 0))
  const total = scores.reduce((s, x) => s + x, 0)

  // 모바일은 컨테이너가 좁아 빈 공간이 두드러지므로 fill ratio 를 더 높여 꽉 차게
  const isMobile = w < 600
  const fillRatio = isMobile ? 0.62 : 0.5
  const targetArea = w * h * fillRatio

  // 모두 0 이면 균일 분배 (점수 정보가 없으니 같은 크기)
  if (total === 0) {
    const uniformR = Math.sqrt(targetArea / (items.length * Math.PI))
    const r = Math.round(Math.max(min, Math.min(uniformR, max * 0.7)))
    return items.map(p => ({ id: p.id, r }))
  }

  // 점수 비례로 면적 배분 (압축 X) → r = √(area/π)
  // 1위가 압도적(예: 285 vs 1.1)이면 raw 가 max 를 크게 초과 → 일반 max 로
  // clamp 해버리면 빈 공간이 많아지고 1위의 "압도적" 느낌이 사라짐.
  // 그래서 "지배적 버블"은 topMax(=min(w,h)*0.36, 일반 max 의 약 1.4 배)까지 허용,
  // 나머지는 남은 budget 안에서 자기들끼리 점수 비율 그대로 재분배한다.
  //   → 1위는 압도적으로 크고, 2~꼴찌는 자기들끼리 정확한 비율 유지 + min 이상으로 보임.
  const topMax = Math.min(Math.min(w, h) * 0.36, max * 1.5)
  const raw = scores.map(s => Math.sqrt((targetArea * (s / total)) / Math.PI))
  const rs = new Array(items.length).fill(0)

  // 1단계: raw 가 일반 max 를 크게 넘는 지배적 버블만 먼저 배치
  let dominantArea = 0
  const isDom = raw.map(r => r > max * 1.05)
  for (let i = 0; i < items.length; i++) {
    if (isDom[i]) {
      rs[i] = Math.min(raw[i], topMax)
      dominantArea += Math.PI * rs[i] * rs[i]
    }
  }

  // 2단계: 비-지배 버블 → 남은 budget 으로 자기들 점수 비율대로 재분배
  const otherIdxs = []
  let otherScoreTotal = 0
  for (let i = 0; i < items.length; i++) {
    if (!isDom[i]) { otherIdxs.push(i); otherScoreTotal += scores[i] }
  }
  const otherBudget = Math.max(0, targetArea - dominantArea)

  if (otherIdxs.length > 0) {
    if (otherScoreTotal === 0 || otherBudget === 0) {
      for (const i of otherIdxs) rs[i] = min
    } else {
      for (const i of otherIdxs) {
        const share = scores[i] / otherScoreTotal
        const r = Math.sqrt((otherBudget * share) / Math.PI)
        rs[i] = Math.max(min, Math.min(r, max))
      }
      // 3단계: 비-지배 그룹 안에서 min/max 클램프로 어긋난 면적을 재분배
      for (let it = 0; it < 6; it++) {
        let used = dominantArea
        for (const i of otherIdxs) used += Math.PI * rs[i] * rs[i]
        const delta = targetArea - used
        if (Math.abs(delta) < targetArea * 0.015) break
        const flexIdxs = otherIdxs.filter(i => rs[i] > min + 0.5 && rs[i] < max - 0.5)
        let flexArea = 0
        for (const i of flexIdxs) flexArea += Math.PI * rs[i] * rs[i]
        if (!flexIdxs.length || flexArea <= 0) break
        const scale = Math.sqrt(Math.max(0, (flexArea + delta) / flexArea))
        for (const i of flexIdxs) {
          rs[i] = Math.max(min, Math.min(rs[i] * scale, max))
        }
      }
    }
  }

  return items.map((p, i) => ({ id: p.id, r: Math.round(rs[i]) }))
})

// positions: 동기 computed 대신 RAF 지연으로 메인 스레드 블로킹 방지
const positions = ref([])
let layoutRafId = null
watch([nodes, dims], ([n, d]) => {
  if (layoutRafId) cancelAnimationFrame(layoutRafId)
  layoutRafId = requestAnimationFrame(() => {
    positions.value = computeLayout(n, d.w, d.h)
    layoutRafId = null
  })
}, { immediate: true })

// 최초 레이아웃 계산 완료 여부 — 그 전까지 overlay 유지해서 빈 그리드 플리커 방지
const layoutHasRendered = ref(false)
watch(positions, (p) => { if (p.length > 0 && !layoutHasRendered.value) layoutHasRendered.value = true })

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
    if (searchKeyword.value.trim()) {
      searchCondition.keyword = searchKeyword.value.trim()
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
    const data = await loadAllCategories('PRODUCT')
    categories.value = data
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
let searchTimer = null
watch(searchKeyword, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchRanking(true)
  }, 300)
})

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
  if (layoutRafId) cancelAnimationFrame(layoutRafId)
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
  background: var(--bg-base);
  min-height: 100vh;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100%;
  overflow-x: clip;
  padding: 0 1rem;
  color: var(--text-primary);
}
@media (min-width: 768px) { .app-container { padding: 0 2rem; } }
@media (min-width: 1280px) { .app-container { padding: 0 3rem; max-width: 1920px; margin: 0 auto; } }
@media (min-width: 1920px) { .app-container { padding: 0 4rem; } }

.main-content { flex: 1; min-width: 0; padding-bottom: calc(80px + env(safe-area-inset-bottom)); padding-left: 1.5rem; }
@media (max-width: 767px) { .main-content { padding-left: 0; } }
@media (min-width: 768px) { .main-content { padding-bottom: 0; } }

.ranking-view { max-width: 1000px; margin: 0; }

/* 헤더 — BattleListView 등 다른 메뉴 섹션 타이틀과 톤 통일
   filter-container 의 padding-top(16px)이 아래 간격 역할이라
   헤더 자체 margin-bottom 은 0, 위쪽엔 적당한 padding-top 만 */
.page-header { padding-top: 16px; margin-bottom: 0; }
.page-header .title-with-badge {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.75rem;
  border-left: 3px solid var(--c-text-400);
}
.page-header .section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.page-header .section-title .title-accent { color: var(--c-brand); }
@media (min-width: 1280px) {
  .page-header .section-title { font-size: 1.3125rem; }
}
.sub-title { font-size: 12px; font-weight: 400; color: var(--c-text-400); }

/* 검색 */
.search-box { position: relative; margin-bottom: 16px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.search-input { width: 100%; padding: 12px 40px; border: 1px solid var(--border-strong); border-radius: 12px; font-size: 14px; font-family: inherit; background: var(--bg-elevated); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.search-input:focus { border-color: var(--c-brand); box-shadow: 0 0 0 3px rgba(147,51,234,0.1); }
.search-input::placeholder { color: var(--c-text-400); }
.search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; background: var(--border-default); border: none; border-radius: 50%; color: var(--c-text-500); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.search-clear:hover { background: var(--border-strong); }

/* 빈 상태 */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 0; color: var(--c-text-400); }

/* ==================== 스켈레톤 로딩 ==================== */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.skeleton-wrapper { pointer-events: none; }

.skeleton-line {
  background: var(--bg-subtle);
  border-radius: 4px;
  animation: skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 버블 차트 스켈레톤 */
.skeleton-bubble-area {
  position: relative;
  width: 100%;
  height: 500px;
  background: var(--bg-elevated);
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  overflow: hidden;
  margin-bottom: 16px;
}

.skeleton-bubble {
  position: absolute;
  border-radius: 50%;
  background: var(--bg-subtle);
  animation: skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-bubble-1 { width: 160px; height: 160px; top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 0s; }
.skeleton-bubble-2 { width: 120px; height: 120px; top: 18%; left: 28%; animation-delay: 0.15s; }
.skeleton-bubble-3 { width: 110px; height: 110px; top: 22%; right: 18%; animation-delay: 0.3s; }
.skeleton-bubble-4 { width: 80px; height: 80px; bottom: 18%; left: 15%; animation-delay: 0.1s; }
.skeleton-bubble-5 { width: 70px; height: 70px; bottom: 22%; right: 14%; animation-delay: 0.25s; }
.skeleton-bubble-6 { width: 56px; height: 56px; top: 12%; left: 58%; animation-delay: 0.35s; }
.skeleton-bubble-7 { width: 50px; height: 50px; bottom: 12%; left: 45%; animation-delay: 0.2s; }
.skeleton-bubble-8 { width: 44px; height: 44px; top: 55%; left: 12%; animation-delay: 0.4s; }

/* 순위 리스트 스켈레톤 */
.skeleton-rank-list {
  background: var(--bg-elevated);
  border-radius: 14px;
  border: 1px solid var(--border-strong);
  overflow: hidden;
  margin-bottom: 16px;
}

.skeleton-rank-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-default);
}

.skeleton-rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--bg-subtle);
}
.skeleton-rank-item:last-child { border-bottom: none; }

.skeleton-rank-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-subtle);
  flex-shrink: 0;
  animation: skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-rank-info { flex: 1; min-width: 0; }

.skeleton-rank-stats { text-align: right; flex-shrink: 0; }

.skeleton-rank-bar {
  width: 50px;
  height: 4px;
  background: var(--bg-subtle);
  border-radius: 2px;
  flex-shrink: 0;
  animation: skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 640px) {
  .skeleton-bubble-area { height: 360px; }
  .skeleton-bubble-1 { width: 120px; height: 120px; }
  .skeleton-bubble-2 { width: 90px; height: 90px; }
  .skeleton-bubble-3 { width: 80px; height: 80px; }
  .skeleton-bubble-4 { width: 60px; height: 60px; }
  .skeleton-bubble-5 { width: 52px; height: 52px; }
  .skeleton-bubble-6 { width: 44px; height: 44px; }
  .skeleton-bubble-7 { width: 40px; height: 40px; }
  .skeleton-bubble-8 { width: 36px; height: 36px; }
  .skeleton-rank-bar { display: none; }
}

/* ==================== 버블 차트 ==================== */
.bubble-wrapper { position: relative; margin-bottom: 16px; }

/* ==================== 캐리어 가이드 배너 ==================== */
.carrier-guide-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  margin: 0 0 14px;
  background: var(--c-brand-soft);
  border: 1px solid var(--c-brand-soft);
  border-radius: 14px;
  position: relative;
  animation: cgb-slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cgb-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--c-brand);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.25);
}
.cgb-hand {
  animation: cgb-hand-wiggle 1.6s ease-in-out infinite;
  transform-origin: 50% 80%;
}
.cgb-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.cgb-title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--c-brand-hover);
  letter-spacing: -0.3px;
}
.cgb-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--c-brand-hover);
  letter-spacing: -0.2px;
}
.cgb-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--c-brand);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.cgb-close:hover { background: var(--c-brand-soft); }

@keyframes cgb-slide-in {
  0% { opacity: 0; transform: translateY(-6px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes cgb-hand-wiggle {
  0%, 100% { transform: translateX(0) rotate(0); }
  30% { transform: translateX(3px) rotate(8deg); }
  60% { transform: translateX(-3px) rotate(-6deg); }
}

@media (max-width: 600px) {
  .carrier-guide-banner {
    padding: 12px 14px;
    gap: 10px;
    border-radius: 12px;
  }
  .cgb-icon-wrap { width: 36px; height: 36px; border-radius: 10px; }
  .cgb-title { font-size: 13px; }
  .cgb-sub { font-size: 11.5px; }
}

@media (prefers-reduced-motion: reduce) {
  .carrier-guide-banner,
  .cgb-hand { animation: none; }
}

.bubble-area {
  position: relative; width: 100%; min-height: 500px;
  background: var(--bg-elevated); border-radius: 6px; border: 1px solid var(--border-strong);
  overflow: hidden; cursor: default;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.grid-bg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.3; }

/* 레이아웃 계산 중 overlay — 빈 그리드 플리커 방지 */
.bubble-layout-overlay {
  position: absolute;
  inset: 0;
  background: var(--bg-elevated);
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bubble-layout-overlay .skeleton-bubble {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-brand-soft) 0%, var(--c-brand-soft) 100%);
  opacity: 0.7;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.bubble-layout-overlay .skeleton-bubble-1 { width: 160px; height: 160px; top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 0s; }
.bubble-layout-overlay .skeleton-bubble-2 { width: 120px; height: 120px; top: 18%; left: 28%; animation-delay: 0.15s; }
.bubble-layout-overlay .skeleton-bubble-3 { width: 110px; height: 110px; top: 22%; right: 18%; animation-delay: 0.3s; }
.bubble-layout-overlay .skeleton-bubble-4 { width: 80px; height: 80px; bottom: 18%; left: 15%; animation-delay: 0.1s; }
.bubble-layout-overlay .skeleton-bubble-5 { width: 70px; height: 70px; bottom: 22%; right: 14%; animation-delay: 0.25s; }
.bubble-layout-overlay .skeleton-bubble-6 { width: 56px; height: 56px; top: 12%; left: 58%; animation-delay: 0.35s; }

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
  font-weight: 700; padding: 2px 8px; border-radius: 4px;
  letter-spacing: 0.04em; white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12); z-index: 5;
}
.rank-badge-top.rank-1 { background: #FFD700; color: #7a5a00; }
.rank-badge-top.rank-2 { background: #C0C0C0; color: var(--c-text-600); }
.rank-badge-top.rank-3 { background: #CD7F32; color: #5a2d00; }

/* 4위+ 뱃지 */
.rank-badge-sm {
  position: absolute; top: -4px; right: -4px; border-radius: 50%;
  background: var(--border-default); display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: var(--c-text-400);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1.5px solid var(--bg-elevated);
}

/* 담김 표시 */
.bagged-check {
  position: absolute; top: -4px; left: -4px; border-radius: 50%;
  background: var(--c-brand-hover); display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--bg-elevated); box-shadow: 0 1px 4px rgba(124,58,237,0.4);
  color: #fff; font-weight: 700;
}


/* 툴팁 */
.bubble-tooltip {
  position: absolute; z-index: 100;
  background: var(--bg-elevated); border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15); border: 1px solid var(--border-strong);
  pointer-events: none; animation: fadeIn 0.15s ease;
}
.tooltip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.tooltip-name { font-weight: 700; font-size: 14px; color: var(--text-primary); }
.tooltip-rank { font-size: 11px; color: var(--c-brand-hover); font-weight: 700; }
.tooltip-brand { font-size: 12px; color: var(--c-text-400); }
.tooltip-metrics { display: flex; gap: 12px; margin-top: 10px; }
.metric-label { font-size: 10px; color: var(--c-text-400); }
.metric-value { font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 3px; }
.metric-value.purple { color: var(--c-brand-hover); }
.tooltip-hint { margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 10px; color: var(--c-text-400); }

/* ==================== 캐리어 패널 ==================== */
.carrier-panel {
  position: absolute; bottom: 12px; right: 12px; z-index: 200;
  display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
}

.carrier-items {
  background: var(--bg-elevated); border-radius: 16px; border: 1px solid var(--border-strong);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12); padding: 14px 14px 10px;
  min-width: 230px; max-width: 280px;
}
.carrier-items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 12px; font-weight: 700; color: var(--c-brand-hover); letter-spacing: 0.03em; }
.carrier-clear-all { font-size: 10px; color: var(--c-brand); border: none; background: none; cursor: pointer; }
.carrier-empty { font-size: 12px; color: var(--c-text-300); text-align: center; padding: 10px 0; }
.carrier-list { display: flex; flex-direction: column; gap: 6px; max-height: 265px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--c-brand-soft) var(--c-brand-soft); }

.carrier-chip { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 10px; background: var(--c-brand-soft); animation: chipIn 0.2s ease; }
.carrier-chip-info { flex: 1; min-width: 0; }
.carrier-chip-name { font-size: 12px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.carrier-chip-brand { font-size: 10px; color: var(--c-text-400); }
.carrier-chip-remove { border: none; background: none; cursor: pointer; color: var(--c-brand); font-size: 14px; line-height: 1; padding: 2px 4px; }

.carrier-go-btn { width: 100%; margin-top: 10px; padding: 9px 0; border-radius: 8px; border: none; background: var(--c-brand-hover); color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; letter-spacing: 0.02em; font-family: inherit; }
.carrier-go-btn:hover { background: var(--c-brand-hover); }

.carrier-drop-hint { background: #ede9fe; border: 2px dashed var(--c-brand-hover); border-radius: 12px; padding: 6px 14px; font-size: 12px; color: var(--c-brand-hover); font-weight: 600; animation: fadeIn 0.1s ease; white-space: nowrap; }

.carrier-icon {
  width: 72px; height: 72px; border-radius: 22px;
  background: var(--bg-elevated); border: 2px solid var(--border-strong);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  position: relative;
}
.carrier-icon.active { background: #ede9fe; border: 2.5px dashed var(--c-brand-hover); box-shadow: 0 0 0 5px rgba(124,58,237,0.15), 0 8px 24px rgba(124,58,237,0.2); animation: bagBounce 0.5s ease; }
.carrier-icon.has-items { border-color: var(--c-brand-soft); }

/* 비어있고 드래그 중이 아닐 때만 펄스로 시선 유도 */
.carrier-icon:not(.has-items):not(.active)::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 2px solid var(--c-brand);
  opacity: 0;
  animation: carrier-pulse 2.2s ease-out infinite;
  pointer-events: none;
}
@keyframes carrier-pulse {
  0% { opacity: 0.55; transform: scale(1); }
  70% { opacity: 0; transform: scale(1.18); }
  100% { opacity: 0; transform: scale(1.18); }
}
@media (prefers-reduced-motion: reduce) {
  .carrier-icon:not(.has-items):not(.active)::before { animation: none; display: none; }
}

.carrier-badge {
  position: absolute; top: -7px; right: -7px;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--c-brand-hover); color: #fff;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(124,58,237,0.3); border: 2px solid var(--bg-elevated);
  animation: popIn 0.25s ease;
}

/* ==================== 순위 리스트 ==================== */
.rank-list { background: var(--bg-elevated); border-radius: 14px; border: 1px solid var(--border-strong); overflow: hidden; margin-bottom: 16px; }
.rank-list-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid var(--border-default);
}
.rank-list-title { font-size: 14px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.2px; }
.rank-list-count { font-size: 12px; font-weight: 600; color: var(--c-text-400); letter-spacing: -0.1px; }

.rank-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 20px;
  border-bottom: 1px solid var(--bg-subtle); cursor: pointer; transition: background 0.15s;
}
.rank-item:last-of-type { border-bottom: none; }
.rank-item:hover { background: var(--bg-subtle); }

.rank-num {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; background: var(--border-default); color: var(--c-text-400);
}
.rank-num.gold { background: #f5c518; color: #5a4200; }
.rank-num.silver { background: var(--c-text-300); color: var(--c-text-600); }
.rank-num.bronze { background: #c8874d; color: #fff; }

.rank-info { flex: 1; min-width: 0; }
.rank-name { font-size: 14px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rank-brand { font-size: 11px; color: var(--c-text-400); }

.rank-stats { text-align: right; flex-shrink: 0; }
.rank-heat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 800;
  color: var(--c-heat, #F97316);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
  line-height: 1;
}
.rank-heat .heat-icon {
  color: var(--c-heat, #F97316);
  flex-shrink: 0;
}
.rank-heat .heat-value { line-height: 1; }

.rank-bar { width: 50px; height: 4px; background: var(--border-default); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
.rank-bar-fill { height: 100%; border-radius: 2px; background: #9b7be8; transition: width 0.3s; }

/* 더보기 */
.load-more { text-align: center; padding: 8px 0 32px; }
.load-more-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 13px 36px; background: var(--bg-elevated); border: 1px solid var(--border-strong); border-radius: 10px;
  font-size: 14px; font-weight: 600; color: var(--c-text-600); cursor: pointer; font-family: inherit;
  letter-spacing: -0.2px; transition: all 0.15s;
}
.load-more-btn:hover:not(:disabled) { border-color: var(--c-brand-hover); color: var(--c-brand-hover); background: var(--c-brand-soft); }
.load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ==================== 애니메이션 ==================== */
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes popIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
@keyframes bagBounce { 0%,100% { transform: scale(1); } 30% { transform: scale(1.18) rotate(-4deg); } 60% { transform: scale(0.94) rotate(2deg); } }
@keyframes chipIn { from { opacity: 0; transform: translateY(8px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }

.panel-fade-enter-active { animation: fadeIn 0.2s ease; }
.panel-fade-leave-active { transition: opacity 0.15s; }
.panel-fade-leave-to { opacity: 0; }

/* 모바일 */
@media (max-width: 640px) {
  .page-header { padding-top: 12px; margin-bottom: 0; }
  .page-header .section-title { font-size: 1.125rem; }
  .page-header .title-with-badge { padding-left: 0.625rem; border-left-width: 2.5px; }
  .sub-title { font-size: 11px; }
  .carrier-panel {
    /* BottomNavigation(약 84px) + FAB(52px+14gap) 위로 띄워 + 버튼과 겹치지 않게 */
    position: fixed; bottom: calc(170px + env(safe-area-inset-bottom)); right: auto; left: 50%; z-index: 200;
    transform: translateX(-50%);
    max-width: calc(400px + 32px); width: 100%; padding-right: 24px; box-sizing: border-box;
    pointer-events: none;
  }
  .carrier-panel > * { pointer-events: auto; }
  .carrier-icon { width: 56px; height: 56px; border-radius: 16px; }
  .carrier-icon svg { width: 36px; height: 36px; }
  .carrier-panel { padding-right: 20px; }
  .carrier-items { min-width: 210px; max-width: 260px; }
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
  background: var(--c-brand-hover);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(124,58,237,0.35);
  border: 3px solid var(--bg-elevated); opacity: 0.93; overflow: hidden;
}
.drag-ghost-circle img { width: 100%; height: 100%; object-fit: cover; }
</style>
