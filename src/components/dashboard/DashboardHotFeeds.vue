<template>
  <!-- PC 핫 피드 섹션 -->
  <section class="content-section hot-feeds-section">
    <div class="section-header">
      <div class="title-with-badge">
        <h2 class="section-title">지금 뜨는 <span class="title-accent">핫-기록</span></h2>
        <span class="sub-title">실시간 인기 리뷰</span>
      </div>
      <router-link :to="{ name: 'FeedHome' }" class="view-all-link">
        전체보기
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6" /></svg>
      </router-link>
    </div>

    <div v-if="loading" class="dashboard-feed-scroll">
      <div v-for="i in 3" :key="i" class="skeleton dash-card-skeleton"></div>
    </div>

    <div v-else-if="feeds.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      </div>
      <p class="empty-text">아직 인기 피드가 없습니다</p>
    </div>

    <div v-else class="dashboard-feed-scroll">
      <router-link
        v-for="(feed, index) in feeds"
        :key="feed.feedId"
        :to="{ name: 'FeedDetail', params: { id: feed.feedId } }"
        class="dash-feed-card"
      >
        <div class="card-visual-wrapper">
          <img :src="feed.hotFeedThumbnailDto?.fileUrl" :alt="feed.productName" @error="handleImageError" />
          <div class="card-overlay">
            <div class="overlay-top">
              <span class="rank-num">0{{ index + 1 }}</span>
              <span v-if="feed.isTrending" class="trending-tag">HOT</span>
            </div>
            <div class="overlay-bottom">
              <span v-if="feed.feedEvaluation?.code" :class="['eval-pill', feed.feedEvaluation.code.toLowerCase()]">
                {{ feed.feedEvaluation.description }}
              </span>
              <p v-if="feed.reviewSummary" class="review-main">"{{ feed.reviewSummary }}"</p>
              <span class="product-name-sub">{{ feed.productName }}</span>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </section>

  <!-- 모바일 핫 피드 섹션 -->
  <section class="content-section mhot-section">
    <div class="mhot-header">
      <div class="mhot-header-main">
        <h2 class="mhot-title">
          지금 뜨는 <span class="mhot-accent">핫-기록</span>
          <span class="mhot-live"><span class="mhot-live-dot"></span>LIVE</span>
        </h2>
        <p class="mhot-sub">실시간으로 가장 많이 본 인기 리뷰</p>
      </div>
      <router-link :to="{ name: 'FeedHome' }" class="mhot-more">
        <span>전체보기</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </router-link>
    </div>

    <div v-if="loading" class="mhot-scroll">
      <div v-for="i in 4" :key="i" class="skeleton mhot-sk"></div>
    </div>

    <div v-else-if="feeds.length === 0" class="mhot-empty">
      <div class="mhot-empty-content">
        <div class="mhot-empty-icon">🔥</div>
        <p class="mhot-empty-text">현재 집계 중인 인기 피드가 없어요</p>
      </div>
    </div>

    <div v-else class="mhot-scroll">
      <router-link
        v-for="(feed, index) in feeds"
        :key="'mhot-' + feed.feedId"
        :to="{ name: 'FeedDetail', params: { id: feed.feedId } }"
        class="mhot-card"
      >
        <div class="mhot-visual">
          <img :src="feed.hotFeedThumbnailDto?.fileUrl" :alt="feed.productName" loading="lazy" @error="handleImageError" />
          <div class="mhot-overlay-top">
            <div class="mhot-rank">{{ index + 1 }}</div>
            <span v-if="feed.isTrending" class="mhot-trending">HOT</span>
          </div>
          <div class="mhot-overlay">
            <div class="mhot-tag-group">
              <span v-if="feed.feedEvaluation?.code" :class="['mhot-eval', feed.feedEvaluation.code.toLowerCase()]">
                {{ feed.feedEvaluation.description }}
              </span>
            </div>
            <h3 v-if="feed.reviewSummary" class="mhot-review">{{ feed.reviewSummary }}</h3>
            <span class="mhot-product">{{ feed.productName }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
defineProps({
  feeds: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>

<style scoped>
/* ==================== PC 섹션 ==================== */
.hot-feeds-section {
  background: #fff;
  border-radius: 16px;
  padding: 1.375rem;
  margin-bottom: 0.75rem;
  border: 1px solid #efefef;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

@media (min-width: 768px) {
  .hot-feeds-section { padding: 1.625rem; }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.title-with-badge { display: flex; flex-direction: column; gap: 4px; }

.section-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #18181b;
  margin: 0;
  letter-spacing: -0.02em;
  border-left: 3px solid #a1a1aa;
  padding-left: 0.75rem;
}
.section-title .title-accent { color: #9333ea; }

@media (min-width: 1280px) {
  .section-title { font-size: 1.3125rem; }
}

.sub-title {
  font-size: 12px;
  color: #999;
  font-weight: 400;
  padding-left: calc(0.75rem + 3px);
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0.375rem 0.875rem;
  background: #f5f5f6;
  border: none;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
  text-decoration: none;
}
.view-all-link:hover { background: #eaeaeb; color: #555; }

.dashboard-feed-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 6px 4px 14px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.dashboard-feed-scroll::-webkit-scrollbar { display: none; }

.dash-feed-card {
  flex: 0 0 160px;
  height: 230px;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
}

@media (min-width: 640px) {
  .dash-feed-card { flex: 0 0 180px; height: 250px; }
}
@media (min-width: 1280px) {
  .dash-feed-card { flex: 0 0 200px; height: 280px; }
}

.dash-feed-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.card-visual-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.card-visual-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.dash-feed-card:hover .card-visual-wrapper img { transform: scale(1.03); }

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.85) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px;
}
@media (min-width: 640px) { .card-overlay { padding: 16px; } }

.overlay-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.rank-num {
  font-size: 24px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  font-style: italic;
  line-height: 1;
}
@media (min-width: 640px) { .rank-num { font-size: 26px; } }
@media (min-width: 1280px) { .rank-num { font-size: 30px; } }

.trending-tag {
  background: rgba(251, 113, 133, 0.85);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 0.3px;
}

.overlay-bottom { color: #fff; }

.eval-pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
  backdrop-filter: blur(4px);
}
.eval-pill.best { background: rgba(251, 191, 36, 0.85); color: #fff; }
.eval-pill.good { background: rgba(34, 197, 94, 0.8); color: #fff; }
.eval-pill.okay { background: rgba(139, 92, 246, 0.8); color: #fff; }
.eval-pill.bad { background: rgba(239, 68, 68, 0.8); color: #fff; }

.review-main {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (min-width: 640px) { .review-main { font-size: 15px; } }
@media (min-width: 1280px) { .review-main { font-size: 16px; } }

.product-name-sub {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-card-skeleton {
  flex: 0 0 160px;
  height: 230px;
  border-radius: 20px;
}
@media (min-width: 640px) { .dash-card-skeleton { flex: 0 0 180px; height: 250px; } }
@media (min-width: 1280px) { .dash-card-skeleton { flex: 0 0 200px; height: 280px; } }

.skeleton {
  background: linear-gradient(90deg, #f1f3f6 25%, #e8eaed 37%, #f1f3f6 63%);
  background-size: 400% 100%;
  animation: hf-shimmer 1.4s ease-in-out infinite;
}
@keyframes hf-shimmer {
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
.empty-text {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

/* ==================== 모바일 섹션 (기본 숨김) ==================== */
.mhot-section { display: none; }

/* PC: 모바일 hover 무력화 */
@media (hover: none) {
  .dash-feed-card:hover { transform: none; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .dash-feed-card:hover .card-visual-wrapper img { transform: none; }
}

/* ==================== 모바일 (≤767px) ==================== */
@media (max-width: 767px) {
  /* PC 섹션 숨김 */
  .hot-feeds-section { display: none !important; }

  /* 모바일 섹션 노출 */
  .mhot-section {
    display: block;
    background: #ffffff;
    border: none;
    border-bottom: 1px solid #f1f3f6;
    box-shadow: none;
    border-radius: 0;
    padding: 22px 0.625rem 24px 0.625rem;
    margin: 0;
  }

  .mhot-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
  }

  .mhot-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: #111;
    display: flex;
    align-items: center;
    gap: 6px;
    letter-spacing: -0.03em;
    margin: 0;
  }

  .mhot-accent { color: #7c3aed; }

  .mhot-live {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    color: #ef4444;
    font-weight: 700;
    margin-left: 4px;
  }

  .mhot-live-dot {
    width: 5px;
    height: 5px;
    background-color: #ef4444;
    border-radius: 50%;
    animation: mhot-pulse 1.5s infinite;
  }

  @keyframes mhot-pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }

  .mhot-sub {
    font-size: 13px;
    color: #71717a;
    margin: 4px 0 0;
  }

  .mhot-more {
    font-size: 13px;
    font-weight: 600;
    color: #a1a1aa;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  .mhot-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .mhot-scroll::-webkit-scrollbar { display: none; }

  .mhot-card {
    flex: 0 0 160px;
    aspect-ratio: 3 / 4.2;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    text-decoration: none;
    background: #f4f4f5;
    isolation: isolate;
  }

  .mhot-visual {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .mhot-visual img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .mhot-card:hover .mhot-visual img { transform: scale(1.1); }

  .mhot-overlay-top {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
  }

  .mhot-rank {
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    font-style: italic;
  }

  .mhot-trending {
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.9);
    color: #111;
    font-size: 10px;
    font-weight: 800;
    border-radius: 4px;
  }

  .mhot-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 40px 14px 16px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%);
    color: #fff;
    z-index: 1;
  }

  .mhot-tag-group { margin-bottom: 8px; }

  .mhot-eval {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    color: #fff;
  }
  .mhot-eval.best { background: #f59e0b; }
  .mhot-eval.good { background: #10b981; }
  .mhot-eval.okay { background: #6366f1; }
  .mhot-eval.bad { background: #ef4444; }

  .mhot-review {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    margin: 0 0 4px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    color: #fff;
  }

  .mhot-product {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mhot-sk {
    flex: 0 0 160px;
    aspect-ratio: 3 / 4.2;
    border-radius: 14px;
  }

  .mhot-empty {
    height: 200px;
    background: #fafafa;
    border: 1px dashed #e4e4e7;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mhot-empty-content { text-align: center; }
  .mhot-empty-icon { font-size: 24px; margin-bottom: 8px; }
  .mhot-empty-text {
    font-size: 13px;
    color: #a1a1aa;
    font-weight: 500;
    margin: 0;
  }
}

@media (max-width: 640px) {
  .mhot-title { font-size: 1.125rem; }
  .mhot-card { flex: 0 0 145px; }
  .mhot-review { font-size: 13px; -webkit-line-clamp: 2; }
}
</style>
