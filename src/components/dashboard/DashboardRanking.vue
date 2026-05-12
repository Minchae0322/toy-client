<template>
  <section class="content-section ranking-section">
    <!-- 헤더 (PC·모바일 통일 톤) -->
    <div class="mranking-header">
      <div class="mranking-header-main">
        <h2 class="mranking-title">
          실시간 <span class="mranking-accent">제품 랭킹</span>
          <span class="mranking-live"><span class="mranking-live-dot"></span>LIVE</span>
        </h2>
        <p class="mranking-sub">지금 가장 주목받는 아이템</p>
        <span class="sort-indicator mranking-sort">
          <span class="sort-dot" style="width:10px;height:10px;background:#7c3aed;"></span>
          <span class="sort-dot" style="width:8px;height:8px;background:#a78bfa;"></span>
          <span class="sort-dot" style="width:6px;height:6px;background:#c4b5fd;"></span>
          <span class="sort-label">크면 인기 많은 제품</span>
        </span>
      </div>
      <router-link :to="{ name: 'ProductRanking' }" class="mranking-more">
        <span>전체보기</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </router-link>
    </div>

    <!-- 캐꾸 안내 배너 -->
    <router-link v-if="!loading && hotProducts.length > 0" :to="{ name: 'ProductRanking' }" class="dash-cgo-banner">
      <div class="dash-cgo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>
      </div>
      <div class="dash-cgo-text">
        <span class="dash-cgo-title">버블을 끌어 캐리어에 담고 싶다면?</span>
        <span class="dash-cgo-sub">핫 아이템 페이지에서 캐꾸를 시작할 수 있어요</span>
      </div>
      <span class="dash-cgo-cta">
        핫 아이템으로
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </span>
    </router-link>

    <div v-if="loading" class="dash-bubble-wrapper">
      <div class="skeleton" style="width:100%;height:320px;border-radius:12px;"></div>
    </div>

    <div v-else-if="hotProducts.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      </div>
      <p class="empty-text">등록된 제품이 없습니다</p>
    </div>

    <div v-else class="dash-bubble-wrapper">
      <div
        ref="bubbleContainerRef"
        class="dash-bubble-area"
        :style="{ height: bubbleDims.h + 'px' }"
        @mousemove="handleBubbleMouseMove"
        @mouseleave="bubbleHovered = null"
      >
        <div v-if="!bubbleLayoutRendered" class="dash-bubble-layout-overlay">
          <div class="skeleton" style="width:100%;height:100%;border-radius:12px;"></div>
        </div>
        <svg class="dash-grid-bg">
          <defs>
            <pattern id="dashBgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashBgGrid)"/>
        </svg>

        <router-link
          v-for="(product, i) in dashBubbleProducts"
          :key="product.id"
          :to="{ name: 'ProductDetail', params: { id: product.id } }"
          class="dash-bubble"
          :class="{
            'is-hovered': bubbleHovered === product.id,
            'is-dimmed': bubbleHovered && bubbleHovered !== product.id,
            'has-image': !!getProductThumbnail(product)
          }"
          :style="getDashBubbleStyle(i)"
          @mouseenter="bubbleHovered = product.id"
          @mouseleave="bubbleHovered = null"
        >
          <img v-if="getProductThumbnail(product)" :src="getProductThumbnail(product)" alt="" class="dash-bubble-bg-image" @error="handleImageError" />
          <div v-if="getProductThumbnail(product)" class="dash-bubble-overlay"></div>

          <span v-if="dashBubbleNodes[i]?.r > dashRadiusBounds.min * 1.3" class="dash-bubble-name" :style="{ fontSize: Math.max(9, dashBubbleNodes[i].r * 0.14) + 'px', color: getProductThumbnail(product) || i < 3 ? '#fff' : i < 6 ? '#3b1a6e' : '#4a3560', maxWidth: dashBubbleNodes[i].r * 1.4 + 'px' }">{{ product.name }}</span>
          <span v-if="dashBubbleNodes[i]?.r > dashRadiusBounds.min * 1.6" class="dash-bubble-brand" :style="{ fontSize: Math.max(8, dashBubbleNodes[i].r * 0.11) + 'px', color: getProductThumbnail(product) || i < 3 ? 'rgba(255,255,255,0.85)' : 'rgba(90,60,120,0.7)' }">{{ product.brand }}</span>

          <div v-if="i < 3" class="dash-rank-badge-top" :class="'rank-' + (i + 1)" :style="{ fontSize: Math.max(8, dashBubbleNodes[i].r * 0.12) + 'px' }">{{ i + 1 }}</div>
          <div v-else class="dash-rank-badge-sm" :style="{ width: Math.max(14, dashBubbleNodes[i].r * 0.24) + 'px', height: Math.max(14, dashBubbleNodes[i].r * 0.24) + 'px', fontSize: Math.max(7, dashBubbleNodes[i].r * 0.12) + 'px' }">{{ i + 1 }}</div>
        </router-link>

        <div v-if="bubbleTooltipProduct" class="dash-bubble-tooltip" :style="bubbleTooltipStyle">
          <div class="dash-tooltip-header">
            <span class="dash-tooltip-name">{{ bubbleTooltipProduct.name }}</span>
            <span class="dash-tooltip-rank">#{{ hotProducts.indexOf(bubbleTooltipProduct) + 1 }}</span>
          </div>
          <span class="dash-tooltip-brand">{{ bubbleTooltipProduct.brand }}</span>
          <div class="dash-tooltip-metrics">
            <div class="dash-tooltip-metric">
              <div class="dash-metric-label">평점</div>
              <div class="dash-metric-value"><svg class="dash-star-icon" width="14" height="14" viewBox="0 0 14 14" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1.16666L8.795 4.81249L12.8333 5.40166L9.91667 8.24916L10.59 12.2717L7 10.3792L3.41 12.2717L4.08333 8.24916L1.16667 5.40166L5.205 4.81249L7 1.16666Z"/></svg> {{ bubbleTooltipProduct.averageRating ? Number(bubbleTooltipProduct.averageRating).toFixed(1) : '0.0' }}</div>
            </div>
            <div class="dash-tooltip-metric">
              <div class="dash-metric-label">피드</div>
              <div class="dash-metric-value">{{ formatNumber(bubbleTooltipProduct.reviewCount || 0) }}개</div>
            </div>
            <div class="dash-tooltip-metric">
              <div class="dash-metric-label">관심도</div>
              <div class="dash-metric-value purple">{{ Number(getProductPopularityScore(bubbleTooltipProduct)).toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, defineExpose } from 'vue'
import { productService } from '@/services/ProductService'

const emit = defineEmits(['products-loaded'])

const hotProducts = ref([])
const loading = ref(true)

const bubbleContainerRef = ref(null)
const bubbleDims = ref({ w: 0, h: 0 })
const bubbleHovered = ref(null)
const bubbleMousePos = ref({ x: 0, y: 0 })
let bubbleResizeObserver = null
let bubbleRafId = null

const dashBubbleLimit = computed(() => bubbleDims.value.w < 600 ? 10 : 20)

function calcDashRadiusBounds(count, W, H) {
  const area = W * H
  if (count <= 0 || !area) return { min: 28, max: 110 }
  const maxR = Math.min(W, H) * (count === 1 ? 0.4 : count <= 3 ? 0.3 : 0.25)
  const minR = Math.max(20, maxR * 0.25)
  return { min: Math.round(minR), max: Math.round(Math.min(maxR, Math.min(W, H) * 0.45)) }
}

function getDashRankColor(rank, total) {
  if (rank === 1) return { bg: '#7c3aed', border: '#7c3aed', glow: 'rgba(124,58,237,0.12)' }
  if (rank === 2) return { bg: '#6366f1', border: '#6366f1', glow: 'rgba(99,102,241,0.1)' }
  if (rank === 3) return { bg: '#8b5cf6', border: '#8b5cf6', glow: 'rgba(139,92,246,0.1)' }
  const n = Math.max(total || 20, 5)
  const t = Math.min((rank - 4) / (n - 4), 1)
  const r = Math.round(168 + t * (229 - 168))
  const g = Math.round(139 + t * (231 - 139))
  const b = Math.round(250 + t * (235 - 250))
  const bg = `rgb(${r},${g},${b})`
  const borderAlpha = 0.4 - t * 0.2
  return { bg, border: `rgba(139,92,246,${borderAlpha})`, glow: `rgba(139,92,246,${0.08 - t * 0.05})` }
}

function computeBubbleLayout(nodeList, W, H) {
  if (!nodeList.length || !W || !H) return []
  const cx = W / 2, cy = H / 2
  const n = nodeList.length

  if (n === 1) return [{ x: cx, y: cy }]

  const pos = nodeList.map((nd, i) => {
    const angle = (i / n) * Math.PI * 2
    const spread = n <= 5 ? 0.2 : 0.4
    const dist = 30 + Math.min(cx, cy) * spread * (i / n)
    return { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, vx: 0, vy: 0, r: nd.r }
  })

  const gap = n <= 5 ? 4 : 6
  const centerPull = n <= 5 ? 0.015 : 0.01
  const maxTicks = n <= 5 ? 40 : 60
  const settleFloor = n <= 5 ? 12 : 20
  const settleVel2 = 1.2 * 1.2

  for (let tick = 0; tick < maxTicks; tick++) {
    const alpha = Math.max(0.001, 1 - tick / maxTicks)
    let settled = true
    for (let i = 0; i < pos.length; i++) {
      const pi = pos[i]
      const dx = cx - pi.x, dy = cy - pi.y
      const pull = centerPull * alpha * (i < 3 ? 1.8 : 0.3)
      pi.vx += dx * pull; pi.vy += dy * pull
      for (let j = i + 1; j < pos.length; j++) {
        const pj = pos[j]
        const ddx = pi.x - pj.x, ddy = pi.y - pj.y
        const minD = pi.r + pj.r + gap
        const d2 = ddx * ddx + ddy * ddy
        if (d2 < minD * minD) {
          const d = Math.sqrt(d2) || 1
          const f = (minD - d) / d * 0.3
          pi.vx += ddx * f; pi.vy += ddy * f
          pj.vx -= ddx * f; pj.vy -= ddy * f
        }
      }
      pi.vx *= 0.7; pi.vy *= 0.7
      pi.x += pi.vx; pi.y += pi.vy
      const pad = pi.r + 2
      pi.x = Math.max(pad, Math.min(W - pad, pi.x))
      pi.y = Math.max(pad, Math.min(H - pad, pi.y))
      if (pi.vx * pi.vx + pi.vy * pi.vy > settleVel2) settled = false
    }
    if (settled && tick > settleFloor) break
  }
  return pos.map(p => ({ x: p.x, y: p.y }))
}

const dashBubbleProducts = computed(() => {
  const sorted = [...hotProducts.value].sort((a, b) => getProductPopularityScore(b) - getProductPopularityScore(a))
  return sorted.slice(0, dashBubbleLimit.value)
})

const dashRadiusBounds = computed(() =>
  calcDashRadiusBounds(dashBubbleProducts.value.length, bubbleDims.value.w, bubbleDims.value.h)
)

const dashBubbleNodes = computed(() => {
  const { min, max } = dashRadiusBounds.value
  const items = dashBubbleProducts.value
  if (items.length === 0) return []

  const { w, h } = bubbleDims.value
  if (!w || !h) return items.map(p => ({ id: p.id, r: min }))

  const scores = items.map(p => Math.max(0, getProductPopularityScore(p) || 0))
  const total = scores.reduce((s, x) => s + x, 0)

  // 모바일은 컨테이너가 좁아 빈 공간이 두드러지므로 fill ratio 를 더 높여 꽉 차게
  const isMobile = w < 600
  const fillRatio = isMobile ? 0.62 : 0.5
  const targetArea = w * h * fillRatio

  // 모두 0 이면 균일 분배
  if (total === 0) {
    const uniformR = Math.sqrt(targetArea / (items.length * Math.PI))
    const r = Math.round(Math.max(min, Math.min(uniformR, max * 0.7)))
    return items.map(p => ({ id: p.id, r }))
  }

  // 1단계: "내 점수 / 전체 합" 비율로 면적 배분 → r = √(area/π)
  const raw = scores.map(s => Math.sqrt((targetArea * (s / total)) / Math.PI))
  const rs = raw.map(r => Math.max(min, Math.min(r, max)))

  // 2단계: 클램프로 남거나 부족해진 면적을 비-클램프 버블에 재분배
  //        → 총 버블 면적이 target 에 맞도록 꽉 채움 (비율은 유지)
  for (let it = 0; it < 6; it++) {
    let used = 0
    for (let i = 0; i < rs.length; i++) used += Math.PI * rs[i] * rs[i]
    const delta = targetArea - used
    if (Math.abs(delta) < targetArea * 0.015) break

    let flexArea = 0
    const flexIdxs = []
    for (let i = 0; i < rs.length; i++) {
      if (rs[i] > min + 0.5 && rs[i] < max - 0.5) {
        flexIdxs.push(i)
        flexArea += Math.PI * rs[i] * rs[i]
      }
    }
    if (!flexIdxs.length || flexArea <= 0) break
    const scale = Math.sqrt(Math.max(0, (flexArea + delta) / flexArea))
    for (const i of flexIdxs) {
      rs[i] = Math.max(min, Math.min(rs[i] * scale, max))
    }
  }

  return items.map((p, i) => ({ id: p.id, r: Math.round(rs[i]) }))
})

const dashBubblePositions = ref([])

watch([dashBubbleNodes, bubbleDims], ([nodes, dims]) => {
  if (bubbleRafId) cancelAnimationFrame(bubbleRafId)
  bubbleRafId = requestAnimationFrame(() => {
    dashBubblePositions.value = computeBubbleLayout(nodes, dims.w, dims.h)
    bubbleRafId = null
  })
}, { immediate: true })

const bubbleLayoutRendered = ref(false)
watch(dashBubblePositions, (p) => { if (p.length > 0 && !bubbleLayoutRendered.value) bubbleLayoutRendered.value = true })

const bubbleTooltipProduct = computed(() => {
  if (!bubbleHovered.value) return null
  return hotProducts.value.find(p => p.id === bubbleHovered.value) || null
})

const bubbleTooltipStyle = computed(() => {
  if (!bubbleTooltipProduct.value) return {}
  const W = bubbleDims.value.w < 480 ? 190 : 240
  let left = bubbleMousePos.value.x - W / 2
  let top = bubbleMousePos.value.y - 140
  if (top < 0) top = bubbleMousePos.value.y + 10
  if (left < 0) left = 4
  if (left + W > bubbleDims.value.w) left = bubbleDims.value.w - W - 4
  return { left: left + 'px', top: top + 'px', width: W + 'px' }
})

function getDashBubbleStyle(i) {
  if (!dashBubblePositions.value[i] || !dashBubbleNodes.value[i]) return { display: 'none' }
  const pos = dashBubblePositions.value[i]
  const r = dashBubbleNodes.value[i].r
  const rank = i + 1
  const total = dashBubbleProducts.value.length
  const colors = getDashRankColor(rank, total)
  const product = dashBubbleProducts.value[i]
  const isHov = bubbleHovered.value === product?.id
  const hasImage = !!getProductThumbnail(product)

  return {
    left: (pos.x - r) + 'px',
    top: (pos.y - r) + 'px',
    width: (r * 2) + 'px',
    height: (r * 2) + 'px',
    background: hasImage ? '#000' : colors.bg,
    borderColor: isHov ? '#7c3aed' : colors.border,
    boxShadow: isHov ? `0 8px 32px ${colors.glow}, 0 0 0 4px rgba(124,58,237,0.1)`
      : `0 4px 16px ${colors.glow}`,
    zIndex: isHov ? 50 : rank <= 3 ? 10 : 1,
    textDecoration: 'none',
    animationDelay: (i * 50) + 'ms'
  }
}

function handleBubbleMouseMove(e) {
  if (!bubbleContainerRef.value) return
  const rect = bubbleContainerRef.value.getBoundingClientRect()
  bubbleMousePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function computeBubbleHeight(w) {
  if (w < 480) return Math.max(320, Math.min(420, w * 1.05))
  if (w < 768) return Math.max(380, Math.min(520, w * 0.9))
  return Math.max(500, Math.min(700, w * 0.75))
}

function initBubbleContainer() {
  if (!bubbleContainerRef.value) return
  const rect = bubbleContainerRef.value.getBoundingClientRect()
  bubbleDims.value = { w: rect.width, h: computeBubbleHeight(rect.width) }

  let resizeTimer = null
  bubbleResizeObserver = new ResizeObserver(entries => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const entry = entries[0]
      if (entry) {
        const w = entry.contentRect.width
        bubbleDims.value = { w, h: computeBubbleHeight(w) }
      }
    }, 150)
  })
  bubbleResizeObserver.observe(bubbleContainerRef.value)
}

watch(() => hotProducts.value.length, (len) => {
  if (len > 0) {
    nextTick(() => initBubbleContainer())
  }
})

const loadHotProducts = async () => {
  loading.value = true
  try {
    const response = await productService.getProducts({ status: 'APPROVED' }, { size: 20, sort: 'popularityScore,DESC' })
    if (response.success) {
      hotProducts.value = response.data?.content || response.data || []
      emit('products-loaded', hotProducts.value)
    }
  } catch (e) {
    console.error('제품 로드 실패:', e)
  } finally {
    loading.value = false
  }
}

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return Math.floor(num / 10000) + '만'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const getProductThumbnail = (product) => {
  return product.thumbnailUrl || product.thumbnailDto?.fileUrl || 'https://placehold.co/56x56?text=No+Image'
}

const getProductPopularityScore = (product) => {
  if (!product) return 0
  if (product.popularityScore) return product.popularityScore
  return (product.viewCount || 0) + ((product.likeCount || 0) * 3) + ((product.reviewCount || 0) * 2)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

defineExpose({ hotProducts })

onMounted(() => {
  loadHotProducts()
})

onUnmounted(() => {
  if (bubbleResizeObserver) {
    bubbleResizeObserver.disconnect()
    bubbleResizeObserver = null
  }
  if (bubbleRafId) {
    cancelAnimationFrame(bubbleRafId)
    bubbleRafId = null
  }
})
</script>

<style scoped>
/* PC 카드 스타일 — DashboardView의 .content-section 기본을 덮어쓰면서 동일 톤 유지 */
.content-section.ranking-section {
  background: #fff;
  border: 1px solid #efefef;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  padding: 1.375rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .content-section.ranking-section {
    padding: 1.625rem;
    margin-bottom: 1.125rem;
  }
}

/* ===== 헤더 (PC·모바일 공통) ===== */
.mranking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.25rem;
}
.mranking-header-main { flex: 1; min-width: 0; }
.mranking-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.03em;
  margin: 0;
}
.mranking-accent { color: #9333ea; }
.mranking-live {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #ef4444;
  font-weight: 700;
  margin-left: 4px;
}
.mranking-live-dot {
  width: 5px;
  height: 5px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: mranking-pulse 1.5s infinite;
}
@keyframes mranking-pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}
.mranking-sub {
  font-size: 13px;
  color: #71717a;
  margin: 4px 0 8px;
}
.mranking-more {
  font-size: 13px;
  font-weight: 600;
  color: #a1a1aa;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.mranking-sort {
  margin-top: 0;
}

@media (max-width: 640px) {
  .mranking-title { font-size: 1.125rem; }
}

.sort-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #f6f4fa;
  border: 1px solid #eceaf0;
  border-radius: 12px;
  white-space: nowrap;
}

.sort-dot { border-radius: 50%; flex-shrink: 0; }

.sort-label {
  font-size: 11px;
  font-weight: 500;
  color: #7c6cba;
  margin-left: 2px;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #71717a;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.15s ease;
}
.view-all-btn:hover { color: #18181b; background: #f4f4f5; }

.dash-bubble-wrapper { position: relative; }

/* 캐꾸 안내 배너 */
.dash-cgo-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin: 0 0 14px;
  background: #FAF5FF;
  border: 1px solid #E9D5FF;
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.dash-cgo-banner:hover {
  background: #F3E8FF;
  border-color: #C4B5FD;
}
.dash-cgo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #9333EA;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dash-cgo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.dash-cgo-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #4C1D95;
  letter-spacing: -0.3px;
}
.dash-cgo-sub {
  font-size: 12px;
  font-weight: 500;
  color: #7C3AED;
  letter-spacing: -0.2px;
}
.dash-cgo-cta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 7px 11px;
  background: #fff;
  border: 1px solid #E9D5FF;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  color: #7C3AED;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .dash-cgo-banner { padding: 10px 12px; gap: 10px; border-radius: 10px; }
  .dash-cgo-icon { width: 32px; height: 32px; border-radius: 8px; }
  .dash-cgo-title { font-size: 12.5px; }
  .dash-cgo-sub { font-size: 11px; }
  .dash-cgo-cta { padding: 6px 9px; font-size: 11px; }
}

.dash-bubble-area {
  position: relative;
  width: 100%;
  min-height: 360px;
  background: #f9f9fa;
  border-radius: 16px;
  border: 1px solid #efefef;
  overflow: hidden;
  cursor: default;
}

.dash-grid-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.2;
}

.dash-bubble-layout-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  padding: 0;
}

.dash-bubble {
  position: absolute;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  user-select: none;
  text-decoration: none;
  animation: dash-bubble-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes dash-bubble-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .dash-bubble { animation: none; }
}

.dash-bubble:hover { transform: scale(1.06); z-index: 20 !important; }
.dash-bubble.is-dimmed { filter: brightness(0.65) saturate(0.25); opacity: 0.65; }

.dash-bubble-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  z-index: 0;
}
.dash-bubble-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}
.dash-bubble.has-image .dash-bubble-name,
.dash-bubble.has-image .dash-bubble-brand {
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 6px rgba(0,0,0,0.6);
}
.dash-bubble.has-image .dash-rank-badge-top,
.dash-bubble.has-image .dash-rank-badge-sm { z-index: 3; }

.dash-bubble-name {
  font-weight: 700;
  margin-top: 3px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 6px;
  letter-spacing: -0.01em;
}
.dash-bubble-brand {
  margin-top: 2px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.dash-rank-badge-top {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  z-index: 5;
}
.dash-rank-badge-top.rank-1 { background: #fbbf24; color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
.dash-rank-badge-top.rank-2 { background: #94a3b8; color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.dash-rank-badge-top.rank-3 { background: #d97706; color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

.dash-rank-badge-sm {
  position: absolute;
  top: -3px;
  right: -3px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #7c3aed;
  box-shadow: 0 1px 4px rgba(124,58,237,0.1);
  border: 1.5px solid rgba(139,92,246,0.3);
}

.dash-bubble-tooltip {
  position: absolute;
  z-index: 100;
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.12);
  border: 1px solid #eeeef0;
  pointer-events: none;
  animation: tooltipFadeIn 0.15s ease;
}
.dash-tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.dash-tooltip-name {
  font-weight: 700;
  font-size: 14px;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.dash-tooltip-rank {
  font-size: 11px;
  color: #7c3aed;
  font-weight: 700;
  flex-shrink: 0;
  margin-left: 8px;
}
.dash-tooltip-brand { font-size: 12px; color: #888; }
.dash-tooltip-metrics { display: flex; gap: 12px; margin-top: 10px; }
.dash-tooltip-metric { display: flex; flex-direction: column; }
.dash-metric-label { font-size: 10px; color: #aaa; }
.dash-metric-value {
  font-weight: 700;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
.dash-metric-value.purple { color: #7c3aed; }
.dash-star-icon { flex-shrink: 0; }

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Skeleton */
.skeleton {
  background: linear-gradient(90deg, #f1f3f6 25%, #e8eaed 37%, #f1f3f6 63%);
  background-size: 400% 100%;
  animation: rk-shimmer 1.4s ease-in-out infinite;
  border-radius: 4px;
}
@keyframes rk-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: #94a3b8;
  gap: 12px;
}
.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f4f4f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
}
.empty-text { font-size: 14px; font-weight: 500; margin: 0; }

@media (hover: none) {
  .dash-bubble:hover { transform: none; }
}

@media (max-width: 767px) {
  .content-section.ranking-section {
    background: #ffffff;
    border: none;
    border-bottom: 1px solid #f1f3f6;
    box-shadow: none;
    border-radius: 0;
    padding: 16px 0.625rem 24px 0.625rem;
    margin: 0;
  }

  .mranking-header { margin-bottom: 16px; }
}
</style>
