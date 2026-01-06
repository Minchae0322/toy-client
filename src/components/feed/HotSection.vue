<template>
  <section class="hot-section">
    <div class="section-header">
      <div class="title-group">
        <div class="title-badge">HOT</div>
        <h2 class="section-title">지금 가장 핫한 인증</h2>
      </div>
      <button class="see-all" @click="handleSeeAll">
        전체보기
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="hot-grid">
      <div v-for="n in 5" :key="n" class="hot-card">
        <div class="hot-image skeleton"></div>
        <div class="hot-info">
          <div class="skeleton-text"></div>
          <div class="skeleton-text-small"></div>
        </div>
      </div>
    </div>

    <!-- 데이터 없음 -->
    <div v-else-if="!hotFeeds || hotFeeds.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <p class="empty-text">아직 핫한 피드가 없습니다</p>
    </div>

    <!-- 핫 피드 목록 -->
    <div v-else class="hot-grid">
      <div
          v-for="(feed, index) in hotFeeds"
          :key="feed.feedId"
          class="hot-card"
          @click="$emit('feed-click', feed.feedId)"
      >
        <div class="hot-image">
          <!-- 순위 뱃지 -->
          <div v-if="index < 3" :class="['rank-badge', `rank-${index + 1}`]">
            {{ index + 1 }}
          </div>

          <img
              v-if="feed.hotFeedThumbnailDto?.fileUrl"
              :src="feed.hotFeedThumbnailDto.fileUrl"
              :alt="feed.content"
              @error="handleImageError"
          />
          <div v-else class="no-image">
            <span>📷</span>
          </div>

          <!-- 호버 오버레이 -->
          <div class="hot-overlay">
            <div class="hot-stats">
              <span class="stat-item">🥄 {{ formatNumber(feed.spoonCount) }}</span>
              <span class="stat-item">👁 {{ formatNumber(feed.viewCount) }}</span>
            </div>
            <div class="nickname-badge">@{{ feed.nickname }}</div>
          </div>
        </div>

        <div class="hot-info">
          <p class="hot-nickname">{{ feed.nickname }}</p>
          <p class="hot-content">{{ feed.content }}</p>
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
  event.target.style.display = 'none';
  event.target.parentElement.classList.add('no-image');
};

const formatNumber = (num) => {
  if (!num || num === 0) return '0';
  if (num >= 10000) return Math.floor(num / 10000) + '만';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

onMounted(() => loadHotFeeds());
</script>

<style scoped>
.hot-section {
  padding: 32px 20px;
  background: #FAFAFA;
}

@media (min-width: 1024px) {
  .hot-section {
    padding: 40px 32px;
  }
}

/* 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.section-title {
  font-size: 20px;
  font-weight: 650;
  color: #1A1A1A;
  margin: 0;
  letter-spacing: -0.3px;
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 22px;
  }
}

.see-all {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #E8E8E8;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.see-all:hover {
  background: #F5F5F5;
  border-color: #DDD;
  color: #333;
}

/* 그리드 */
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

/* 카드 */
.hot-card {
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.hot-card:hover {
  transform: translateY(-6px);
}

/* 이미지 컨테이너 */
.hot-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  background: #F5F5F5;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.25s ease;
}

.hot-card:hover .hot-image {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.hot-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hot-card:hover .hot-image img {
  transform: scale(1.03);
}

/* 순위 뱃지 */
.rank-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.rank-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%);
}

.rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #A0522D 100%);
}

/* 이미지 없음 */
.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #F0F0F0;
  font-size: 40px;
  opacity: 0.4;
}

/* 호버 오버레이 */
.hot-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  border-radius: 0 0 16px 16px;
}

.hot-card:hover .hot-overlay {
  opacity: 1;
}

.hot-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.stat-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.nickname-badge {
  display: inline-flex;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  font-size: 11px;
  color: white;
  font-weight: 600;
}

/* 피드 정보 */
.hot-info {
  padding: 0 4px;
}

.hot-nickname {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.hot-content {
  font-size: 12px;
  color: #888;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

/* 스켈레톤 로딩 */
.skeleton {
  background: linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 16px;
  border-radius: 6px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text-small {
  height: 14px;
  width: 60%;
  border-radius: 6px;
  background: linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
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
  padding: 60px 20px;
  color: #888;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

/* 모바일 최적화 */
@media (max-width: 767px) {
  .hot-grid {
    gap: 12px;
  }

  .hot-image {
    border-radius: 12px;
  }

  .rank-badge {
    width: 24px;
    height: 24px;
    font-size: 11px;
    top: 8px;
    left: 8px;
  }

  .hot-overlay {
    padding: 12px;
  }

  .hot-stats {
    gap: 8px;
  }

  .stat-item {
    font-size: 11px;
  }
}
</style>