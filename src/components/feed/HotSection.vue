<template>
  <section class="hot-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-icon"></span>
        지금 가장 핫한 인증
      </h2>
      <button class="see-all" @click="handleSeeAll">
        전체보기
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
        </svg>
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="hot-grid">
      <div v-for="n in 5" :key="n" class="hot-card skeleton">
        <div class="hot-image skeleton-box"></div>
        <div class="hot-info">
          <div class="skeleton-text skeleton-box"></div>
          <div class="skeleton-text-small skeleton-box"></div>
        </div>
      </div>
    </div>

    <!-- 데이터 없음 -->
    <div v-else-if="!hotFeeds || hotFeeds.length === 0" class="empty-state">
      <span class="empty-icon"></span>
      <p class="empty-text">아직 핫한 게시물이 없습니다</p>
    </div>

    <!-- 핫 피드 목록 -->
    <div v-else class="hot-grid">
      <div
          v-for="feed in hotFeeds"
          :key="feed.feedId"
          class="hot-card"
          @click="$emit('feed-click', feed.feedId)"
      >
        <div class="hot-image">
          <img
              v-if="feed.hotFeedThumbnailDto.fileUrl"
              :src="feed.hotFeedThumbnailDto.fileUrl"
              :alt="feed.productName"
              @error="handleImageError"
          />
          <div v-else class="no-image">
            <span>📷</span>
          </div>

          <div class="hot-overlay">
            <div class="hot-stats">
              <span class="stat-item">
                <span class="fire">🔥</span>
                {{ formatNumber(feed.hotCount) }}
              </span>
              <span class="stat-item">
                <span class="like">❤️</span>
                {{ formatNumber(feed.likeCount) }}
              </span>
              <span class="stat-item">
                <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                {{ formatNumber(feed.viewCount) }}
              </span>
            </div>
            <div class="hot-score">
              <span class="score-label">🔥 핫스코어</span>
              <span class="score-value">{{ formatScore(feed.hotScore) }}</span>
            </div>
          </div>
        </div>
        <div class="hot-info">
          <p class="hot-product" :title="feed.productName">
            {{ feed.productName }}
          </p>
          <p class="hot-review" :title="feed.reviewSummary">
            {{ feed.reviewSummary }}
          </p>
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

/**
 * 핫 피드 조회
 */
const loadHotFeeds = async () => {
  try {
    loading.value = true;

    const response = await feedService.getHotFeeds({
      page: 0,
      size: props.limit
    });

    console.log('🔥 핫 피드 응답:', response);

    if (response.success && response.data) {
      hotFeeds.value = response.data.content || response.data;
      console.log('✅ 핫 피드 로드 성공:', hotFeeds.value.length, '개');
    }
  } catch (error) {
    console.error('❌ 핫 피드 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * 전체보기 클릭
 */
const handleSeeAll = () => {
  emit('see-all');
};

/**
 * 이미지 로드 실패 처리
 */
const handleImageError = (event) => {
  event.target.style.display = 'none';
  event.target.parentElement.classList.add('no-image');
};

/**
 * 숫자 포맷팅
 */
const formatNumber = (num) => {
  if (!num || num === 0) return '0';

  if (num >= 10000) {
    return Math.floor(num / 10000) + '만';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }

  return num.toString();
};

/**
 * 핫 스코어 포맷팅
 */
const formatScore = (score) => {
  if (!score || score === 0) return '0.0';
  return parseFloat(score).toFixed(1);
};

onMounted(() => {
  console.log('🔥 HotSection 마운트 - 핫 피드 로드 시작');
  loadHotFeeds();
});
</script>

<style scoped>
.hot-section {
  padding: 32px 20px;
  background: var(--card);
}

@media (min-width: 1024px) {
  .hot-section {
    padding: 40px 32px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 24px;
  }
}

.title-icon {
  font-size: 24px;
}

@media (min-width: 1024px) {
  .title-icon {
    font-size: 28px;
  }
}

.see-all {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.see-all:hover {
  background: var(--hover);
  color: var(--primary);
}

.see-all .icon {
  width: 16px;
  height: 16px;
}

/* 로딩 스켈레톤 */
.skeleton {
  pointer-events: none;
}

.skeleton-box {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-text {
  height: 16px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-text-small {
  height: 14px;
  width: 60%;
  border-radius: 4px;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
}

/* 핫 그리드 */
.hot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .hot-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .hot-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }
}

.hot-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.hot-card:hover {
  transform: translateY(-4px);
}

.hot-image {
  position: relative;
  width: 100%;
  padding-bottom: 120%;
  background: var(--hover);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
}

.hot-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.hot-card:hover .hot-image img {
  transform: scale(1.05);
}

.no-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hover);
  font-size: 48px;
  opacity: 0.3;
}

.hot-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.hot-card:hover .hot-overlay {
  opacity: 1;
}

.hot-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.stat-item .fire,
.stat-item .like {
  font-size: 14px;
}

.stat-item .icon {
  width: 14px;
  height: 14px;
}

.hot-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: rgba(249, 115, 22, 0.9);
  border-radius: 8px;
}

.score-label {
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.score-value {
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.hot-info {
  padding: 0 4px;
}

.hot-product {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-review {
  font-size: 12px;
  color: var(--secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

@media (max-width: 767px) {
  .hot-grid {
    gap: 12px;
  }

  .hot-image {
    padding-bottom: 130%;
  }

  .hot-stats {
    gap: 6px;
  }

  .stat-item {
    font-size: 11px;
  }
}
</style>