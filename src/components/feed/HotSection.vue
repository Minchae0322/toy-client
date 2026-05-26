<template>
  <section class="hot-section">
    <div class="section-header">
      <div class="title-with-badge">
        <div class="title-row">
          <span class="title-flame" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </span>
          <h2 class="section-title">지금 뜨는 <span class="title-accent">요거픽</span></h2>
        </div>
        <span class="sub-title">실시간으로 가장 많이 본 인기 리뷰</span>
      </div>
      <button class="view-all-link" @click="handleSeeAll">
        더보기
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="dashboard-feed-scroll">
      <div v-for="n in 3" :key="n" class="skeleton dash-card-skeleton"></div>
    </div>

    <!-- 데이터 없음 -->
    <div v-else-if="!hotFeeds || hotFeeds.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      </div>
      <p class="empty-text">아직 인기 피드가 없습니다</p>
    </div>

    <!-- 핫 피드 목록 -->
    <div v-else class="scroll-wrapper">
      <!-- PC 이전 버튼 -->
      <button
        v-if="canScrollLeft"
        class="nav-arrow nav-arrow-left"
        @click="scrollByCards(-1)"
        aria-label="이전"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <div ref="scrollContainer" class="dashboard-feed-scroll" @scroll="handleScroll">
        <article
          v-for="(feed, index) in hotFeeds"
          :key="feed.feedId"
          class="hot-card"
          @click="$emit('feed-click', feed.feedId)"
          tabindex="0"
          role="button"
          :aria-label="`${index + 1}위 ${feed.productName}`"
        >
          <!-- 사진 -->
          <div class="hot-card-photo">
            <img
              :src="feed.hotFeedThumbnailDto?.fileUrl"
              :alt="feed.productName"
              loading="lazy"
              @error="handleImageError"
            />
          </div>

          <!-- 디자인 요소: 큰 랭크 숫자 -->
          <div class="rank-display" aria-hidden="true">
            <span class="rank-number">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>

          <!-- 상단 배지 -->
          <div class="card-top">
            <span v-if="feed.isTrending" class="badge-hot">
              <span class="badge-dot" aria-hidden="true"></span>
              HOT
            </span>
            <span
              v-else-if="feed.feedEvaluation?.code"
              :class="['badge-eval', feed.feedEvaluation.code.toLowerCase()]"
            >
              {{ feed.feedEvaluation.description }}
            </span>
          </div>

          <!-- 하단 정보 -->
          <div class="card-bottom">
            <p class="product-tag">#{{ feed.productName }}</p>
            <div class="meta-row">
              <span class="meta-user">
                <span class="meta-avatar" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4.4 0-8 2.7-8 6v2h16v-2c0-3.3-3.6-6-8-6z"/></svg>
                </span>
                <span class="meta-name">{{ feed.nickname || '익명' }}</span>
              </span>
              <span class="meta-stat">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
                <span class="meta-count">{{ formatCount(feed.hotCount || feed.likeCount) }}</span>
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- PC 다음 버튼 -->
      <button
        v-if="canScrollRight"
        class="nav-arrow nav-arrow-right"
        @click="scrollByCards(1)"
        aria-label="다음"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      <!-- 페이지네이션 도트 -->
      <div v-if="hotFeeds.length > 1" class="pagination-dots" aria-hidden="true">
        <span
          v-for="i in hotFeeds.length"
          :key="i"
          class="pagination-dot"
          :class="{ active: i - 1 === activeIndex }"
        ></span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useFeed } from '@/services/FeedService';

const props = defineProps({
  limit: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits(['feed-click', 'see-all']);

const feedService = useFeed();
const hotFeeds = ref([]);
const loading = ref(false);

const scrollContainer = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const activeIndex = ref(0);

const updateScrollState = () => {
  const el = scrollContainer.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 4;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;

  const card = el.querySelector('.hot-card');
  if (!card) return;
  const cardWidth = card.offsetWidth;
  const gap = 14;
  const stride = cardWidth + gap;
  if (stride > 0) {
    activeIndex.value = Math.round(el.scrollLeft / stride);
  }
};

const handleScroll = () => {
  updateScrollState();
};

const scrollByCards = (direction) => {
  const el = scrollContainer.value;
  if (!el) return;
  const card = el.querySelector('.hot-card');
  const cardWidth = card?.offsetWidth || 200;
  const gap = 14;
  const scrollAmount = (cardWidth + gap) * 2;
  el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
};

const formatCount = (n) => {
  const num = Number(n) || 0;
  if (num >= 10000) return `${(num / 10000).toFixed(1).replace(/\.0$/, '')}만`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}천`;
  return String(num);
};

let resizeObserver = null;

const loadHotFeeds = async () => {
  try {
    loading.value = true;
    const response = await feedService.getHotFeeds({
      page: 0,
      size: props.limit,
      sort: 'hotScore,desc'
    });

    if (response.success && response.data) {
      hotFeeds.value = response.data.content || response.data;
      nextTick(() => updateScrollState());
    }
  } catch (error) {
    console.error('핫 피드 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

const handleSeeAll = () => emit('see-all');

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/400x560?text=No+Image';
};

onMounted(() => {
  loadHotFeeds();
  resizeObserver = new ResizeObserver(() => updateScrollState());
  nextTick(() => {
    if (scrollContainer.value) {
      resizeObserver.observe(scrollContainer.value);
    }
  });
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>
.hot-section {
  padding: 12px 0 4px;
  margin-bottom: 0.5rem;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

/* ---------- 헤더 ---------- */
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
}

.title-with-badge {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.title-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.title-flame {
  color: #F97316;
  display: inline-flex;
}

.section-title {
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.section-title .title-accent {
  color: var(--c-brand);
}

@media (min-width: 768px) {
  .section-title { font-size: 1.25rem; }
}

@media (min-width: 1280px) {
  .section-title { font-size: 1.375rem; }
}

.sub-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-400);
  letter-spacing: -0.01em;
}

@media (min-width: 768px) {
  .sub-title { font-size: 13px; }
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-text-400);
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
  font-family: inherit;
  flex-shrink: 0;
}

.view-all-link:hover {
  background: var(--bg-subtle);
  color: var(--c-text-600);
}

/* ---------- 스크롤 래퍼 ---------- */
.scroll-wrapper {
  position: relative;
}

.nav-arrow { display: none; }

@media (min-width: 768px) {
  .nav-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: calc(50% - 14px);
    transform: translateY(-50%);
    z-index: 10;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--border-strong);
    background: var(--header-blur-bg);
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
    color: var(--c-text-600);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  }
  .nav-arrow:hover {
    background: var(--bg-elevated);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
    color: var(--text-primary);
    transform: translateY(-50%) scale(1.05);
  }
  .nav-arrow-left { left: -16px; }
  .nav-arrow-right { right: -16px; }
}

.dashboard-feed-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 6px 4px 18px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 4px;
  overscroll-behavior-x: contain;
}

.dashboard-feed-scroll::-webkit-scrollbar { display: none; }

/* ---------- 카드 ---------- */
.hot-card {
  flex: 0 0 168px;
  aspect-ratio: 3 / 4.25;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: #0A0E1A;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 12px 28px rgba(15, 23, 42, 0.14);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
  scroll-snap-align: start;
  isolation: isolate;
  outline: none;
}

.hot-card:focus-visible {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px var(--c-brand),
    0 12px 28px rgba(15, 23, 42, 0.14);
}

@media (min-width: 640px) {
  .hot-card { flex: 0 0 188px; }
}

@media (min-width: 1024px) {
  .hot-card { flex: 0 0 204px; }
}

@media (hover: hover) {
  .hot-card:hover {
    transform: translateY(-6px);
    box-shadow:
      0 2px 4px rgba(15, 23, 42, 0.08),
      0 22px 40px rgba(15, 23, 42, 0.18);
  }
}

/* 사진 */
.hot-card-photo {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hot-card-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg,
      rgba(0, 0, 0, 0.32) 0%,
      rgba(0, 0, 0, 0) 28%,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0.55) 82%,
      rgba(0, 0, 0, 0.85) 100%);
  pointer-events: none;
}

.hot-card-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (hover: hover) {
  .hot-card:hover .hot-card-photo img { transform: scale(1.06); }
}

/* 디자인 랭크 숫자 */
.rank-display {
  position: absolute;
  top: -4px;
  right: 6px;
  z-index: 1;
  pointer-events: none;
  line-height: 0.85;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.rank-number {
  font-size: 68px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.06em;
  color: rgba(255, 255, 255, 0.92);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  font-variant-numeric: tabular-nums;
}

@media (min-width: 640px) {
  .rank-number { font-size: 78px; }
}

@media (min-width: 1024px) {
  .rank-number { font-size: 86px; }
}

/* 상단 배지 */
.card-top {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  display: flex;
  gap: 6px;
}

.badge-hot {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px 4px 8px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 100px;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #F97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.25);
  animation: badge-pulse 1.6s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.25); }
  50% { box-shadow: 0 0 0 5px rgba(249, 115, 22, 0.05); }
}

.badge-eval {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.badge-eval.best { background: rgba(234, 179, 8, 0.92); }
.badge-eval.good { background: rgba(22, 163, 74, 0.92); }
.badge-eval.okay { background: rgba(147, 51, 234, 0.92); }
.badge-eval.bad { background: rgba(239, 68, 68, 0.92); }

/* 하단 정보 */
.card-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 32px 12px 12px;
  color: #fff;
}

.product-tag {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

@media (min-width: 640px) {
  .product-tag { font-size: 14px; }
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.meta-user {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.meta-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
}

.meta-name {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.meta-stat {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #F97316;
  flex-shrink: 0;
}

.meta-count {
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

/* ---------- 페이지네이션 도트 ---------- */
.pagination-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  padding: 4px 0 0;
}

.pagination-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--border-strong, #CBD5E1);
  transition: width 0.25s ease, background 0.25s ease;
}

.pagination-dot.active {
  width: 18px;
  border-radius: 100px;
  background: var(--c-brand, #9333EA);
}

@media (min-width: 768px) {
  .pagination-dots { display: none; }
}

/* ---------- 스켈레톤 ---------- */
.dash-card-skeleton {
  flex: 0 0 168px;
  aspect-ratio: 3 / 4.25;
  border-radius: 20px;
  background: linear-gradient(90deg,
    var(--bg-subtle) 25%,
    var(--border-strong) 50%,
    var(--bg-subtle) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@media (min-width: 640px) { .dash-card-skeleton { flex: 0 0 188px; } }
@media (min-width: 1024px) { .dash-card-skeleton { flex: 0 0 204px; } }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ---------- 빈 상태 ---------- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  background: var(--bg-subtle);
  border-radius: 16px;
  gap: 12px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-mute, #F2F4F6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-300);
}

.empty-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-400);
  margin: 0;
}
</style>
