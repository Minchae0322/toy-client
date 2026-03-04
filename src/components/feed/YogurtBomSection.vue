<template>
  <section class="yb-card">
    <div class="yb-layout">
      <!-- Left: Title -->
      <div class="yb-left">
        <h2 class="yb-title">
          실시간<br/><span class="yb-title-accent">요거 봄</span>
        </h2>
        <p class="yb-subtitle">업데이트 {{ currentTime }}</p>
      </div>

      <!-- Right: List + Dots -->
      <div class="yb-right">
        <div
          class="yb-list-area"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <!-- Loading -->
          <div v-if="loading" class="yb-slider">
            <div class="yb-page">
              <div v-for="i in 6" :key="i" class="yb-item skeleton-item">
                <div class="skeleton-block" style="width: 20px; height: 15px;"></div>
                <div class="yb-content">
                  <div class="skeleton-block" style="width: 65%; height: 14px; margin-bottom: 4px;"></div>
                  <div class="skeleton-block" style="width: 40%; height: 12px;"></div>
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
              >
                <!-- Rank -->
                <span
                  class="yb-rank"
                  :class="{ top3: pIdx * 6 + idx < 3 }"
                >{{ pIdx * 6 + idx + 1 }}</span>

                <!-- Info -->
                <div class="yb-content">
                  <div class="yb-name-row">
                    <span
                      class="yb-product-name"
                      :class="{ top3: pIdx * 6 + idx < 3 }"
                    >{{ feed.productName }}</span>
                    <span v-if="isHotFeed(feed)" class="yb-badge hot">HOT</span>
                    <span v-if="isNewFeed(feed)" class="yb-badge new">NEW</span>
                  </div>
                  <p class="yb-buy-place">{{ feed.buyPlace || '' }}</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Dots -->
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
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
})

const isHotFeed = (feed) => {
  return props.hotFeedIds.includes(feed.feedId)
}

const isNewFeed = (feed) => {
  if (!feed.createdAt) return false
  let createdAt
  if (Array.isArray(feed.createdAt)) {
    const [y, m, d, h = 0, min = 0, s = 0] = feed.createdAt
    createdAt = new Date(y, m - 1, d, h, min, s)
  } else {
    createdAt = new Date(String(feed.createdAt).replace(' ', 'T'))
  }
  if (isNaN(createdAt.getTime())) return false
  return (new Date() - createdAt) / (1000 * 60 * 60) < 24
}

const goToPage = (i) => {
  if (i === currentPage.value || animating.value) return
  animating.value = true
  currentPage.value = i
  setTimeout(() => { animating.value = false }, 450)
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
  border: 1px solid #F2F2F2;
  border-radius: 14px;
  background: #FFFFFF;
  overflow: hidden;
  margin-bottom: 0.75rem;
  padding: 1rem 1.25rem;
}

/* Layout: left title + right list */
.yb-layout {
  display: flex;
  gap: 1rem;
}

/* Left */
.yb-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.yb-title {
  font-size: 15px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.4;
  white-space: nowrap;
}

.yb-title-accent {
  color: #9333EA;
}

.yb-subtitle {
  font-size: 11px;
  color: #ADB5BD;
  font-weight: 500;
  margin: 0;
}

/* Right */
.yb-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* List area */
.yb-list-area {
  flex: 1;
  overflow: hidden;
}

.yb-slider {
  display: flex;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.yb-page {
  flex: 0 0 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(3, auto);
  gap: 2px 4px;
}

/* Item */
.yb-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 8px;
  background: transparent;
  transition: background 0.15s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.yb-item:hover {
  background: #F8F9FA;
}

/* Rank */
.yb-rank {
  width: 20px;
  font-size: 14px;
  font-weight: 700;
  color: #DEE2E6;
  margin-right: 8px;
  flex-shrink: 0;
}

.yb-rank.top3 {
  color: #9333EA;
}

/* Content */
.yb-content {
  flex: 1;
  min-width: 0;
}

.yb-name-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.yb-product-name {
  font-size: 13px;
  font-weight: 600;
  color: #4E5968;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.yb-product-name.top3 {
  color: #1A1A1A;
}

.yb-badge {
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.yb-badge.hot {
  background: #F3EAFF;
  color: #9333EA;
}

.yb-badge.new {
  background: #ECFDF5;
  color: #10B981;
}

.yb-buy-place {
  font-size: 11px;
  color: #8B95A1;
  font-weight: 400;
  margin: 1px 0 0 0;
}

/* Dots */
.yb-dots {
  display: flex;
  justify-content: center;
  gap: 5px;
  padding-top: 8px;
}

.yb-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  background: #E9ECEF;
  transition: background 0.2s ease;
  cursor: pointer;
  padding: 0;
}

.yb-dot.active {
  background: #9333EA;
}

/* Skeleton */
.skeleton-item {
  pointer-events: none;
}

.skeleton-block {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty */
.yb-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #ADB5BD;
  font-size: 13px;
}

/* PC */
@media (min-width: 768px) {
  .yb-card {
    padding: 1.25rem 1.5rem;
  }

  .yb-title {
    font-size: 16px;
  }

  .yb-page {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: repeat(2, auto);
    gap: 2px 1.5rem;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .yb-layout {
    flex-direction: column;
    gap: 0.75rem;
  }

  .yb-left {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .yb-title {
    font-size: 14px;
  }

  .yb-title br {
    display: none;
  }

  .yb-title-accent {
    margin-left: 4px;
  }

  .yb-card {
    padding: 0.75rem;
    border-radius: 12px;
  }

  .yb-page {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(3, auto);
    grid-auto-flow: column;
    gap: 2px 0.75rem;
  }

  .yb-item {
    padding: 5px 6px;
  }

  .yb-rank {
    font-size: 12px;
    width: 16px;
    margin-right: 6px;
  }

  .yb-product-name {
    font-size: 12px;
  }

  .yb-buy-place {
    font-size: 10px;
  }

  .yb-badge {
    font-size: 9px;
  }
}
</style>
