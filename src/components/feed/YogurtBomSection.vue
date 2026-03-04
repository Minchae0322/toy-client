<template>
  <section
    class="yb-card"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- Header -->
    <div class="yb-header">
      <div class="yb-header-left">
        <div class="yb-header-top">
          <span class="yb-trend-badge">TREND</span>
          <span class="yb-time">{{ currentTime }} 기준</span>
        </div>
        <h2 class="yb-title">
          실시간 <span class="yb-title-accent">요거 봄</span>
        </h2>
      </div>
      <div class="yb-dots">
        <button
          v-for="(_, i) in pages"
          :key="i"
          class="yb-dot"
          :class="{ active: currentPage === i }"
          @click="goToPage(i)"
        />
      </div>
    </div>

    <!-- List Area -->
    <div class="yb-list-area">
      <!-- Loading -->
      <div v-if="loading" class="yb-slider">
        <div class="yb-page">
          <div v-for="i in 6" :key="i" class="yb-item skeleton-item">
            <div class="yb-rank skeleton-block" style="width: 24px; height: 18px;"></div>
            <div class="yb-content">
              <div class="skeleton-block" style="width: 70%; height: 15px; margin-bottom: 4px;"></div>
              <div class="skeleton-block" style="width: 45%; height: 13px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="feeds.length === 0" class="yb-empty">
        <p>실시간 데이터가 없습니다</p>
      </div>

      <!-- Feed List -->
      <div v-else class="yb-slider" :style="{ transform: `translateX(-${currentPage * 100}%)` }">
        <div v-for="(page, pIdx) in pages" :key="pIdx" class="yb-page">
          <router-link
            v-for="(feed, idx) in page"
            :key="feed.feedId"
            :to="{ name: 'FeedDetail', params: { id: feed.feedId } }"
            class="yb-item"
            @mouseenter="hovered = `${pIdx}-${idx}`"
            @mouseleave="hovered = null"
          >
            <!-- Rank Number -->
            <span
              class="yb-rank"
              :class="{ 'top3': pIdx * 6 + idx < 3 }"
            >{{ pIdx * 6 + idx + 1 }}</span>

            <!-- Content -->
            <div class="yb-content">
              <div class="yb-name-row">
                <span class="yb-product-name">{{ feed.productName }}</span>
                <span v-if="isHotFeed(feed)" class="yb-badge hot">HOT</span>
              </div>
              <span class="yb-buy-place">{{ feed.buyPlace || '' }}</span>
            </div>

            <!-- Arrow -->
            <div class="yb-arrow" :class="{ visible: hovered === `${pIdx}-${idx}` }">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 5l5 5-5 5" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  feeds: { type: Array, default: () => [] },
  hotFeedIds: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const currentPage = ref(0)
const hovered = ref(null)
const animating = ref(false)
let touchStartX = null

const pages = computed(() => {
  const result = []
  for (let i = 0; i < props.feeds.length; i += 6) {
    result.push(props.feeds.slice(i, i + 6))
  }
  return result.length > 0 ? result : [[]]
})

const currentTime = computed(() => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})

const isHotFeed = (feed) => {
  return props.hotFeedIds.includes(feed.feedId)
}

const goToPage = (i) => {
  if (i === currentPage.value || animating.value) return
  animating.value = true
  currentPage.value = i
  setTimeout(() => { animating.value = false }, 400)
}

const onTouchStart = (e) => {
  touchStartX = e.touches[0].clientX
}

const onTouchEnd = (e) => {
  if (touchStartX == null) return
  const diff = touchStartX - e.changedTouches[0].clientX
  if (Math.abs(diff) > 40) {
    if (diff > 0 && currentPage.value < pages.value.length - 1) goToPage(currentPage.value + 1)
    if (diff < 0 && currentPage.value > 0) goToPage(currentPage.value - 1)
  }
  touchStartX = null
}
</script>

<style scoped>
.yb-card {
  background: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.03);
  margin-bottom: 0.75rem;
}

/* Header */
.yb-header {
  padding: 24px 20px 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.yb-header-left {
  display: flex;
  flex-direction: column;
}

.yb-header-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.yb-trend-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #FFF;
  letter-spacing: 0.05em;
}

.yb-time {
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
}

.yb-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.03em;
}

.yb-title-accent {
  color: #7C3AED;
}

/* Pagination dots */
.yb-dots {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.yb-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  border: none;
  background: #E5E7EB;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  padding: 0;
}

.yb-dot.active {
  width: 24px;
  background: #7C3AED;
}

/* List area */
.yb-list-area {
  padding: 0 12px 24px;
  overflow: hidden;
}

.yb-slider {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.yb-page {
  min-width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px 12px;
}

/* Item */
.yb-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 16px;
  background: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  position: relative;
}

.yb-item:hover {
  background: #F9FAFB;
  transform: translateY(-2px);
}

/* Rank */
.yb-rank {
  width: 32px;
  font-size: 18px;
  font-weight: 800;
  color: #D1D5DB;
  font-style: italic;
  margin-right: 12px;
  text-align: center;
  flex-shrink: 0;
}

.yb-rank.top3 {
  color: #7C3AED;
}

/* Content */
.yb-content {
  flex: 1;
  overflow: hidden;
}

.yb-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.yb-product-name {
  font-size: 15px;
  font-weight: 700;
  color: #1F2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.yb-badge {
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
}

.yb-badge.hot {
  background-color: #FEE2E2;
  color: #EF4444;
}

.yb-buy-place {
  font-size: 13px;
  color: #9CA3AF;
  font-weight: 400;
}

/* Arrow */
.yb-arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.yb-arrow.visible {
  opacity: 1;
  transform: translateX(0);
}

/* Skeleton */
.skeleton-item {
  pointer-events: none;
}

.skeleton-block {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty */
.yb-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #9CA3AF;
  font-size: 14px;
}

/* PC */
@media (min-width: 768px) {
  .yb-card {
    border-radius: 32px;
  }

  .yb-header {
    padding: 32px 32px 24px;
  }

  .yb-title {
    font-size: 26px;
  }

  .yb-list-area {
    padding: 0 20px 32px;
  }

  .yb-page {
    grid-template-columns: 1fr 1fr;
    gap: 8px 12px;
  }

  .yb-item {
    padding: 16px;
    border-radius: 20px;
  }
}
</style>
