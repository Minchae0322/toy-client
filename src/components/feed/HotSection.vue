<template>
  <section class="hot-section">
    <div class="section-header">
      <div class="title-with-badge">
        <h2 class="section-title">지금 뜨는 핫-기록</h2>
        <span class="live-indicator"><span class="dot"></span> LIVE</span>
      </div>
      <button class="view-all-link" @click="handleSeeAll">
        전체보기
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="dashboard-feed-scroll">
      <div v-for="n in 3" :key="n" class="skeleton dash-card-skeleton"></div>
    </div>

    <!-- 데이터 없음 -->
    <div v-else-if="!hotFeeds || hotFeeds.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      </div>
      <p class="empty-text">아직 인기 피드가 없습니다</p>
    </div>

    <!-- 핫 피드 목록 -->
    <div v-else class="dashboard-feed-scroll">
      <div
        v-for="(feed, index) in hotFeeds"
        :key="feed.feedId"
        class="dash-feed-card"
        @click="$emit('feed-click', feed.feedId)"
      >
        <div class="card-visual-wrapper">
          <img
            :src="feed.hotFeedThumbnailDto?.fileUrl"
            :alt="feed.productName"
            @error="handleImageError"
          />

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
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFeed } from '@/services/FeedService';

const props = defineProps({
  limit: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['feed-click', 'see-all']);

const feedService = useFeed();
const hotFeeds = ref([]);
const loading = ref(false);

const loadHotFeeds = async () => {
  try {
    loading.value = true;
    const response = await feedService.getHotFeeds({
      page: 0,
      size: props.limit
    });

    if (response.success && response.data) {
      hotFeeds.value = response.data.content || response.data;
    }
  } catch (error) {
    console.error('핫 피드 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

const handleSeeAll = () => emit('see-all');

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/200x280?text=No+Image';
};

onMounted(() => loadHotFeeds());
</script>

<style scoped>
.hot-section {
  padding: 20px 0;
  margin-bottom: 1.5rem;
}

/* 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 100px;
  letter-spacing: 0.5px;
}

.live-indicator .dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.view-all-link:hover {
  background: #f5f5f5;
  color: #666;
}

/* 가로 스크롤 영역 */
.dashboard-feed-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 4px 20px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dashboard-feed-scroll::-webkit-scrollbar {
  display: none;
}

/* 카드 디자인 */
.dash-feed-card {
  flex: 0 0 180px;
  height: 260px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
}

@media (min-width: 640px) {
  .dash-feed-card {
    flex: 0 0 200px;
    height: 280px;
  }
}

.dash-feed-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 30px rgba(0,0,0,0.15);
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

.dash-feed-card:hover .card-visual-wrapper img {
  transform: scale(1.05);
}

/* 럭셔리 그라데이션 오버레이 */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.3) 0%,
    transparent 40%,
    rgba(0,0,0,0.85) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px;
}

@media (min-width: 640px) {
  .card-overlay {
    padding: 16px;
  }
}

.overlay-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.rank-num {
  font-size: 22px;
  font-weight: 900;
  color: rgba(255,255,255,0.35);
  font-style: italic;
  line-height: 1;
}

@media (min-width: 640px) {
  .rank-num {
    font-size: 24px;
  }
}

.trending-tag {
  background: rgba(251, 113, 133, 0.85);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 0.3px;
}

.overlay-bottom {
  color: #fff;
}

.eval-pill {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
  backdrop-filter: blur(4px);
}

.eval-pill.best {
  background: rgba(251, 191, 36, 0.85);
  color: #fff;
}

.eval-pill.good {
  background: rgba(34, 197, 94, 0.8);
  color: #fff;
}

.eval-pill.okay {
  background: rgba(139, 92, 246, 0.8);
  color: #fff;
}

.eval-pill.bad {
  background: rgba(239, 68, 68, 0.8);
  color: #fff;
}

.review-main {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 640px) {
  .review-main {
    font-size: 14px;
  }
}

.product-name-sub {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 스켈레톤 */
.dash-card-skeleton {
  flex: 0 0 180px;
  height: 260px;
  border-radius: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@media (min-width: 640px) {
  .dash-card-skeleton {
    flex: 0 0 200px;
    height: 280px;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  background: #fafafa;
  border-radius: 10px;
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.625rem;
  color: #bbb;
}

.empty-text {
  font-size: 0.8125rem;
  color: #999;
  margin: 0;
}
</style>
