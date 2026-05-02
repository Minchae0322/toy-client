<template>
  <section class="yogurt-bom-section">
    <div class="yb-header">
      <div class="yb-header-left">
        <div class="yb-status-badge">
          <span class="pulse-dot"></span>
          LIVE
        </div>
        <h2 class="yb-main-title">실시간 요거 봄</h2>
        <span class="yb-header-divider">|</span>
        <span class="yb-update-time">{{ lastUpdateTime }}</span>
      </div>
      <div v-if="ybPages.length > 1" class="yb-pagination">
        <button class="yb-page-btn" :class="{ active: ybCurrentPage === 0 }" @click="setYbPage(0)"></button>
        <button class="yb-page-btn" :class="{ active: ybCurrentPage === 1 }" @click="setYbPage(1)"></button>
      </div>
    </div>

    <div class="yb-body">
      <div v-if="loading" class="yb-list">
        <div v-for="i in 6" :key="i" class="yb-item skeleton-item">
          <div class="skeleton yb-sk-rank"></div>
          <div class="yb-sk-content">
            <div class="skeleton yb-sk-line"></div>
            <div class="skeleton yb-sk-line short"></div>
          </div>
        </div>
      </div>

      <div v-else-if="feeds.length === 0" class="empty-state compact">
        <p class="empty-text">실시간 데이터가 없습니다</p>
      </div>

      <div v-else ref="ybSwipeRef" class="yb-swipe-container" @scroll="onYbSwipe">
        <div v-for="(page, pageIdx) in ybPages" :key="pageIdx" class="yb-swipe-page">
          <div class="yb-list">
            <router-link
              v-for="(feed, index) in page"
              :key="feed.feedId"
              :to="{ name: 'FeedDetail', params: { id: feed.feedId } }"
              class="yb-item"
            >
              <span class="yb-rank-badge" :class="'rank-' + (pageIdx * (isYbMobile ? 4 : 6) + index + 1)">{{ pageIdx * (isYbMobile ? 4 : 6) + index + 1 }}</span>
              <div class="yb-info">
                <span class="yb-product">{{ feed.productName }}</span>
                <span class="yb-author-name">{{ feed.buyPlace || '' }}</span>
              </div>
              <div class="yb-tag-group">
                <span v-if="isHotFeed(feed)" class="yb-tag hot">HOT</span>
                <span v-if="isNewFeed(feed)" class="yb-tag new">NEW</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { feedService } from '@/services/FeedService'

const props = defineProps({
  hotFeedIds: { type: Array, default: () => [] }
})

const feeds = ref([])
const lastUpdateTime = ref('')
const ybCurrentPage = ref(0)
const ybSwipeRef = ref(null)
const loading = ref(true)
let ybAutoSlideTimer = null
let ybSwipeTimeout = null

// 캐시 (5분)
const CACHE_DURATION = 5 * 60 * 1000
let cache = { data: null, timestamp: 0, updateTime: '' }

const ybVw = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const onYbResize = () => { ybVw.value = window.innerWidth }
const isYbMobile = computed(() => ybVw.value < 768)

const ybPages = computed(() => {
  if (isYbMobile.value) {
    const src = feeds.value.slice(0, 8)
    const pages = []
    for (let i = 0; i < src.length; i += 4) pages.push(src.slice(i, i + 4))
    return pages
  }
  const pages = []
  for (let i = 0; i < feeds.value.length; i += 6) pages.push(feeds.value.slice(i, i + 6))
  return pages
})

const setYbPage = (page) => {
  ybCurrentPage.value = page
  if (ybSwipeRef.value) {
    const pageWidth = ybSwipeRef.value.offsetWidth
    ybSwipeRef.value.scrollTo({ left: page * pageWidth, behavior: 'smooth' })
  }
  resetYbAutoSlide()
}

const onYbSwipe = () => {
  if (!ybSwipeRef.value) return
  if (ybSwipeTimeout) clearTimeout(ybSwipeTimeout)
  ybSwipeTimeout = setTimeout(() => {
    const container = ybSwipeRef.value
    if (!container) return
    const pageWidth = container.offsetWidth
    const page = Math.round(container.scrollLeft / pageWidth)
    if (page !== ybCurrentPage.value) {
      ybCurrentPage.value = page
      resetYbAutoSlide()
    }
  }, 50)
}

const resetYbAutoSlide = () => {
  if (ybAutoSlideTimer) {
    clearInterval(ybAutoSlideTimer)
    ybAutoSlideTimer = null
  }
  ybAutoSlideTimer = setInterval(() => {
    const nextPage = ybCurrentPage.value === 0 ? 1 : 0
    ybCurrentPage.value = nextPage
    if (ybSwipeRef.value) {
      const pageWidth = ybSwipeRef.value.offsetWidth
      ybSwipeRef.value.scrollTo({ left: nextPage * pageWidth, behavior: 'smooth' })
    }
  }, 5000)
}

const loadFeeds = async (forceRefresh = false) => {
  const now = Date.now()
  if (!forceRefresh && cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    feeds.value = cache.data
    lastUpdateTime.value = cache.updateTime
    loading.value = false
    return
  }

  loading.value = true
  try {
    const response = await feedService.getHotFeeds({ size: 12, sort: 'viewCount,desc' })
    if (response.success) {
      const list = response.data?.content || response.data || []
      feeds.value = list

      const date = new Date()
      const y = date.getFullYear()
      const m = (date.getMonth() + 1).toString().padStart(2, '0')
      const d = date.getDate().toString().padStart(2, '0')
      const dayNames = ['일', '월', '화', '수', '목', '금', '토']
      const dayName = dayNames[date.getDay()]
      const h = date.getHours().toString().padStart(2, '0')
      const updateTimeStr = `${y}.${m}.${d} (${dayName}) ${h}:00`
      lastUpdateTime.value = updateTimeStr

      cache = { data: list, timestamp: now, updateTime: updateTimeStr }
    }
  } catch (e) {
    console.error('요거 봄 피드 로드 실패:', e)
  } finally {
    loading.value = false
  }
}

const isNewFeed = (feed) => {
  if (!feed.createdAt) return false
  let createdAt
  if (Array.isArray(feed.createdAt)) {
    const [y, m, d, h = 0, min = 0, s = 0] = feed.createdAt
    createdAt = new Date(y, m - 1, d, h, min, s)
  } else {
    const dateStr = feed.createdAt.replace(' ', 'T')
    createdAt = new Date(dateStr)
  }
  if (isNaN(createdAt.getTime())) return false
  const diffHours = (new Date() - createdAt) / (1000 * 60 * 60)
  return diffHours < 24
}

const isHotFeed = (feed) => {
  return props.hotFeedIds.includes(feed.feedId)
}

onMounted(() => {
  window.addEventListener('resize', onYbResize)
  loadFeeds()
  resetYbAutoSlide()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onYbResize)
  if (ybAutoSlideTimer) clearInterval(ybAutoSlideTimer)
  if (ybSwipeTimeout) clearTimeout(ybSwipeTimeout)
})
</script>

<style scoped>
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.yogurt-bom-section {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #efefef;
  position: relative;
  overflow: hidden;
  gap: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.yb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.yb-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.yb-header-divider {
  color: #CBD5E1;
  font-weight: 300;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.yb-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 100px;
  width: fit-content;
  letter-spacing: 0.05em;
}

.pulse-dot {
  width: 5px;
  height: 5px;
  background: #ef4444;
  border-radius: 50%;
  animation: yb-pulse 1.5s infinite;
}

@keyframes yb-pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.yb-main-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0A0E1A;
  margin: 0;
  letter-spacing: -0.02em;
}

.yb-update-time {
  font-size: 0.8125rem;
  color: #64748B;
  font-weight: 500;
  white-space: nowrap;
}

.yb-body {
  flex: 1;
  min-width: 0;
}

.yb-swipe-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 767px) {
  .yb-swipe-container {
    overscroll-behavior-x: contain;
  }
}

.yb-swipe-container::-webkit-scrollbar {
  display: none;
}

.yb-swipe-page {
  flex: 0 0 100%;
  min-width: 0;
  scroll-snap-align: start;
}

.yb-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.125rem 0.75rem;
}

.yb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.15s ease;
  min-width: 0;
  overflow: hidden;
}

.yb-item:hover {
  background: #f8f6fb;
}

.yb-rank-badge {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
  background: #f3f3f4;
  color: #999;
}

.yb-rank-badge.rank-1 { background: #18181b; color: #fff; }
.yb-rank-badge.rank-2 { background: #3f3f46; color: #fff; }
.yb-rank-badge.rank-3 { background: #71717a; color: #fff; }

.yb-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.yb-product {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1e;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.yb-author-name {
  font-size: 0.6875rem;
  color: #bbb;
}

.yb-tag-group { display: flex; gap: 2px; }

.yb-tag {
  font-size: 0.5625rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

.yb-tag.hot { background: #fef2f2; color: #ef4444; }
.yb-tag.new { background: #f3e8ff; color: #9333ea; }

.yb-item.skeleton-item { background: transparent; }

.yb-sk-rank {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.yb-sk-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.yb-sk-line { height: 14px; border-radius: 4px; width: 60%; }
.yb-sk-line.short { width: 30%; height: 12px; }

.yb-pagination {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 5px;
  padding-top: 0.5rem;
}

.yb-page-btn {
  width: 6px;
  height: 6px;
  background: #e5e7eb;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0;
  position: relative;
}
.yb-page-btn::before {
  content: '';
  position: absolute;
  inset: -19px;
}
.yb-page-btn:hover { background: #c4b5fd; }
.yb-page-btn.active { width: 16px; background: #9333ea; }

.empty-state.compact {
  padding: 1.5rem 1rem;
  background: #fafafa;
  border-radius: 10px;
}
.empty-text {
  font-size: 14px;
  color: #94a3b8;
  text-align: center;
  margin: 0;
}

.skeleton {
  background: linear-gradient(90deg, #f1f3f6 25%, #e8eaed 37%, #f1f3f6 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
  border-radius: 4px;
}
@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

/* 모바일에서는 부모 dash-top-area가 숨김 처리 */
@media (max-width: 767px) {
  .yogurt-bom-section { display: none !important; }

  .yb-header { flex-wrap: wrap; gap: 0.5rem 0.5rem; }
  .yb-header-left { gap: 0.375rem; flex: 1 1 auto; min-width: 0; }
  .yb-header-divider { display: none; }
  .yb-main-title { font-size: 0.9375rem; }
  .yb-update-time { font-size: 0.625rem; white-space: nowrap; }
  .yb-status-badge { font-size: 0.5625rem; padding: 2px 7px; flex-shrink: 0; }
  .yb-list { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.125rem 0.375rem; }
  .yb-item { padding: 0.3rem 0.375rem; gap: 0.375rem; border-radius: 6px; }
  .yb-rank-badge { width: 20px; height: 20px; border-radius: 6px; font-size: 0.6875rem; }
  .yb-product { font-size: 0.8125rem; }
  .yb-author-name { font-size: 0.625rem; }
  .yb-tag { font-size: 0.5rem; padding: 1px 4px; }
  .yb-pagination { padding-top: 0.25rem; }
  .yb-page-btn.active { width: 18px; }
  .yb-sk-rank { width: 14px; height: 14px; }
  .yb-sk-line { height: 12px; }
  .yb-sk-line.short { height: 10px; }

  .yb-item { -webkit-user-select: none; user-select: none; }
}

@media (hover: none) {
  .yb-item:hover { background: transparent; transform: none; }
}
</style>
