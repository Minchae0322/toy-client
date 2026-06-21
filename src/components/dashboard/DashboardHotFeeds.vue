<template>
  <section class="hot-feeds-section">
    <DashboardSectionHeader
      prefix="방금 올라온"
      accent="새 리뷰"
      sub="따끈따끈한 최신 피드"
      :to="{ name: 'FeedHome' }"
    />

    <div v-if="loading" class="hot-feed-scroll">
      <div v-for="i in 4" :key="i" class="skeleton hot-card-skeleton"></div>
    </div>

    <div v-else-if="feeds.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      </div>
      <p class="empty-text">아직 올라온 피드가 없어요</p>
    </div>

    <div v-else class="hot-feed-scroll">
      <router-link
        v-for="feed in feeds"
        :key="feed.feedId"
        :to="{ name: 'FeedDetail', params: { id: feed.feedId } }"
        class="hot-feed-card"
      >
        <div class="card-visual">
          <img
            v-if="getThumbnail(feed)"
            :src="getThumbnail(feed)"
            :alt="getProductName(feed)"
            loading="lazy"
            @error="handleImageError"
          />
          <div v-else class="no-image">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>

          <div class="card-overlay-bottom">
            <span
              v-if="feed.feedEvaluation?.code"
              :class="['eval-pill', feed.feedEvaluation.code.toLowerCase()]"
            >
              {{ feed.feedEvaluation.description }}
            </span>
            <p v-if="getReviewText(feed)" class="review-main">{{ getReviewText(feed) }}</p>
            <span class="product-name">{{ getProductName(feed) }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import DashboardSectionHeader from './DashboardSectionHeader.vue'

defineProps({
  feeds: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const getThumbnail = (feed) => {
  return feed.thumbnailUrl?.fileUrl
    || feed.hotFeedThumbnailDto?.fileUrl
    || feed.attachmentFiles?.[0]?.fileUrl
    || ''
}

const getProductName = (feed) => {
  return feed.productNameCustom || feed.product?.name || feed.productName || ''
}

const getReviewText = (feed) => {
  return feed.reviewSummary || feed.review || ''
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>

<style scoped>
.hot-feeds-section {
  width: 100%;
}

/* 가로 스크롤 컨테이너 — 살짝 음수 마진으로 화면 끝까지 보이게 */
.hot-feed-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  padding: 2px 0 4px;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.hot-feed-scroll::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .hot-feed-scroll {
    gap: 16px;
    margin: 0 -32px;
    padding-left: 32px;
    padding-right: 32px;
  }
}

@media (min-width: 1024px) {
  .hot-feed-scroll {
    margin: 0 -40px;
    padding-left: 40px;
    padding-right: 40px;
  }
}

/* 모바일: 2열 그리드 (가로 스크롤 X) */
@media (max-width: 767px) {
  .hot-feed-scroll {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    overflow: visible;
    margin: 0;
    padding: 0;
  }
}

/* 카드 — 그림자 약하게, 라운드 크게 */
.hot-feed-card {
  flex: 0 0 156px;
  aspect-ratio: 3 / 4.2;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  text-decoration: none;
  color: inherit;
  background: var(--bg-mute, #F2F4F6);
  transition: transform 0.2s ease;
  isolation: isolate;
}

@media (max-width: 767px) {
  .hot-feed-card {
    flex: none;
    width: 100%;
    aspect-ratio: 4 / 5;
  }
}

@media (min-width: 768px) {
  .hot-feed-card {
    flex: 0 0 180px;
    border-radius: 18px;
  }
}

@media (min-width: 1280px) {
  .hot-feed-card {
    flex: 0 0 200px;
  }
}

.hot-feed-card:hover {
  transform: translateY(-2px);
}

.hot-feed-card:active {
  transform: scale(0.98);
}

.card-visual {
  width: 100%;
  height: 100%;
  position: relative;
}

.card-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.hot-feed-card:hover .card-visual img {
  transform: scale(1.04);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-300);
  background: var(--bg-mute, #F2F4F6);
}

/* 상단 오버레이 — 랭크 + HOT */
.card-overlay-top {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.rank-num {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  font-style: italic;
  line-height: 1;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

@media (min-width: 768px) {
  .rank-num { font-size: 22px; }
}

.trending-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff;
  background: rgba(239, 68, 68, 0.92);
  padding: 3px 8px;
  border-radius: 100px;
  backdrop-filter: blur(4px);
}

/* 하단 오버레이 — 평가 / 리뷰 / 제품명 (backdrop blur 글래스 띠) */
.card-overlay-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 14px 14px;
  background: rgba(10, 14, 26, 0.32);
  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
  color: #fff;
  z-index: 1;
}

@media (min-width: 768px) {
  .card-overlay-bottom { padding: 16px; }
}

.eval-pill {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 100px;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
  background: rgba(255, 255, 255, 0.94);
  color: #0A0E1A;
  backdrop-filter: blur(10px) saturate(1.4);
  -webkit-backdrop-filter: blur(10px) saturate(1.4);
  line-height: 1.2;
}

.eval-pill.best { color: #B45309; }
.eval-pill.good { color: #15803D; }
.eval-pill.okay { color: #7E22CE; }
.eval-pill.bad  { color: #B91C1C; }

.review-main {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.025em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

@media (max-width: 767px) {
  .review-main { font-size: 16px; }
}

@media (min-width: 1280px) {
  .review-main { font-size: 16px; }
}

.product-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  letter-spacing: -0.01em;
  font-weight: 500;
}

@media (min-width: 768px) {
  .product-name { font-size: 12.5px; }
}

/* Skeleton */
.hot-card-skeleton {
  flex: 0 0 156px;
  aspect-ratio: 3 / 4.2;
  border-radius: 16px;
}

@media (max-width: 767px) {
  .hot-card-skeleton { flex: none; width: 100%; aspect-ratio: 4 / 5; }
}

@media (min-width: 768px) {
  .hot-card-skeleton { flex: 0 0 180px; border-radius: 18px; }
}

@media (min-width: 1280px) {
  .hot-card-skeleton { flex: 0 0 200px; }
}

.skeleton {
  background: linear-gradient(90deg, var(--border-default, #F1F3F6) 25%, #E8EAED 37%, var(--border-default, #F1F3F6) 63%);
  background-size: 400% 100%;
  animation: hf-shimmer 1.4s ease-in-out infinite;
}

@keyframes hf-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  gap: 12px;
}

.empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--bg-subtle, #F7F8FA);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-300);
}

.empty-text {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--c-text-400);
  margin: 0;
}

@media (hover: none) {
  .hot-feed-card:hover {
    transform: none;
  }
  .hot-feed-card:hover .card-visual img {
    transform: none;
  }
}

@media (max-width: 767px) {
  .hot-feed-card {
    -webkit-user-select: none;
    user-select: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hot-feed-card:hover,
  .hot-feed-card:hover .card-visual img {
    transform: none;
  }
  .skeleton {
    animation: none;
    background: var(--bg-subtle, #F7F8FA);
  }
}
</style>
