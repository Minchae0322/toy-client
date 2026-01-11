<template>
  <section class="feed-container">
    <header class="feed-header">
      <div class="title-group">
        <h2 class="main-title">인기 포스트</h2>
        <p class="sub-title">실시간으로 올라오는 솔직한 리뷰</p>
      </div>

      <div class="filter-bar">
        <div class="view-switch">
          <button @click="$emit('view-mode-change', 'feed')" :class="{ active: viewMode === 'feed' }">그리드</button>
          <button @click="$emit('view-mode-change', 'list')" :class="{ active: viewMode === 'list' }">리스트</button>
        </div>
      </div>
    </header>

    <!-- Feed Grid View -->
    <div v-if="viewMode === 'feed'" class="modern-grid">
      <!-- 스켈레톤: 초기 로딩 -->
      <template v-if="loading && feeds.length === 0">
        <article v-for="n in 12" :key="'skeleton-' + n" class="post-card skeleton-card">
          <div class="post-image-container">
            <div class="skeleton-image"></div>
          </div>
          <div class="post-content">
            <div class="skeleton-line" style="height: 16px; width: 90%; margin-bottom: 6px;"></div>
            <div class="skeleton-line" style="height: 16px; width: 70%; margin-bottom: 14px;"></div>
            <div class="hashtag-group">
              <span class="skeleton-line" style="height: 14px; width: 45px;"></span>
              <span class="skeleton-line" style="height: 14px; width: 55px;"></span>
              <span class="skeleton-line" style="height: 14px; width: 40px;"></span>
            </div>
            <div class="product-info-box">
              <div class="product-details">
                <div class="skeleton-line" style="height: 10px; width: 50px; margin-bottom: 4px;"></div>
                <div class="skeleton-line" style="height: 14px; width: 100px;"></div>
              </div>
              <div class="skeleton-line" style="height: 16px; width: 60px;"></div>
            </div>
            <div class="post-footer">
              <div class="user-block">
                <div class="skeleton-avatar"></div>
                <div class="user-meta">
                  <div class="skeleton-line" style="height: 12px; width: 50px; margin-bottom: 2px;"></div>
                  <div class="skeleton-line" style="height: 10px; width: 35px;"></div>
                </div>
              </div>
              <div class="interaction-group">
                <div class="skeleton-stat-pill"></div>
                <div class="skeleton-stat-pill"></div>
              </div>
            </div>
          </div>
        </article>
      </template>
      <!-- 실제 피드 카드 -->
      <FeedCard
          v-else
          v-for="feed in feeds"
          :key="feed.feedId"
          :feed="feed"
          @update="(data) => $emit('update', data)"
          @click="(id) => $emit('post-click', id)"
      />
    </div>

    <!-- List View -->
    <div v-else class="list-view">
      <!-- 스켈레톤: 초기 로딩 -->
      <template v-if="loading && feeds.length === 0">
        <article v-for="n in 8" :key="'skeleton-list-' + n" class="list-item skeleton-list-item">
          <div class="list-image">
            <div class="skeleton-list-image"></div>
          </div>
          <div class="list-content">
            <div class="list-header">
              <span class="skeleton-line" style="height: 11px; width: 60px;"></span>
              <span class="skeleton-line" style="height: 11px; width: 40px;"></span>
            </div>
            <div class="skeleton-line" style="height: 18px; width: 70%; margin: 4px 0;"></div>
            <div class="skeleton-line" style="height: 14px; width: 100%; margin-bottom: 4px;"></div>
            <div class="skeleton-line" style="height: 14px; width: 85%; flex: 1;"></div>
            <div class="list-footer">
              <div class="list-author">
                <div class="skeleton-list-avatar"></div>
                <span class="skeleton-line" style="height: 13px; width: 50px;"></span>
              </div>
              <div class="list-stats">
                <span class="skeleton-line" style="height: 13px; width: 35px;"></span>
                <span class="skeleton-line" style="height: 13px; width: 35px;"></span>
              </div>
            </div>
          </div>
        </article>
      </template>
      <!-- 실제 리스트 아이템 -->
      <template v-else>
        <article v-for="feed in feeds" :key="feed.feedId" class="list-item" @click="$emit('post-click', feed.feedId)">
          <div class="list-image">
            <img :src="feed.thumbnailUrl?.fileUrl || 'https://placehold.co/400x300?text=No+Image'" :alt="feed.productName" />
            <div v-if="feed.feedEvaluation" class="list-eval-overlay">
              <span :class="['list-eval-badge', getEvaluationClass(feed.feedEvaluation)]">
                {{ getEvaluationLabel(feed.feedEvaluation) }}
              </span>
            </div>
            <div v-if="feed.price" class="list-price-overlay">
              {{ formatPrice(feed.price) }}
            </div>
          </div>
          <div class="list-content">
            <div class="list-header">
              <span class="list-category">{{ feed.categoryName }}</span>
              <span class="list-time">{{ formatDate(feed.createdAt) }}</span>
            </div>
            <h3 class="list-title">{{ feed.productName }}</h3>
            <p class="list-review">{{ feed.reviewSummary }}</p>
            <div class="list-footer">
              <div class="list-author">
                <img :src="getProfileImageUrl(feed) || '/default-avatar.png'" class="list-avatar" />
                <span class="list-nickname">{{ getDisplayNickname(feed) }}</span>
              </div>
              <div class="list-stats">
                <span :class="['stat', { active: feed.userReactions?.hasLike }]">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  {{ formatCount(feed.likeCount || 0) }}
                </span>
                <span class="stat">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  {{ formatCount(feed.commentCount || 0) }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </template>
    </div>

    <!-- Loading & Empty States -->
    <div ref="observerTarget" class="scroll-status">
      <span v-if="loading && feeds.length > 0" class="loader"></span>
      <div v-else-if="!loading && feeds.length === 0" class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
        <span>아직 게시물이 없습니다</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import FeedCard from './FeedCard.vue';
import { feedUtils } from '@/services/FeedService';

const props = defineProps({
  feeds: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  viewMode: { type: String, default: 'feed' }
});

const emit = defineEmits(['update', 'post-click', 'view-mode-change']);
const observerTarget = ref(null);

const getProfileImageUrl = (feed) => feed.userInfo?.profileImageFile?.fileUrl || feed.userInfo?.profileImgUrl || null;
const getDisplayNickname = (feed) => feed.userInfo?.nickname || feed.userInfo?.nickName || '익명';
const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation);
const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  return { 'BEST': 'eval-best', 'GOOD': 'eval-good', 'OKAY': 'eval-okay', 'BAD': 'eval-bad' }[code] || '';
};
const formatDate = (dateString) => feedUtils.formatDate(dateString);
const formatPrice = (price) => feedUtils.formatPrice(price);
const formatCount = (count) => feedUtils.formatCount(count);

defineExpose({ observerTarget });
</script>

<style scoped>
.feed-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }

.feed-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
.main-title { font-size: 26px; font-weight: 900; color: #18181b; }
.sub-title { font-size: 14px; color: #71717a; margin-top: 4px; }

.view-switch { background: #f4f4f5; padding: 4px; border-radius: 12px; display: flex; }
.view-switch button {
  border: none; background: none; padding: 6px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 700; color: #71717a; cursor: pointer; transition: all 0.2s;
}
.view-switch button.active { background: white; color: #18181b; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

/* Grid View */
.modern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* PC - 카드 세로 여백 축소 */
@media (min-width: 769px) {
  .modern-grid :deep(.post-content) { padding: 16px; }
  .modern-grid :deep(.primary-review) { margin-bottom: 10px; font-size: 15px; }
  .modern-grid :deep(.hashtag-group) { margin-bottom: 12px; }
  .modern-grid :deep(.product-info-box) { margin-bottom: 14px; padding: 8px 16px; }
  .modern-grid :deep(.post-footer) { padding-top: 10px; }
  .modern-grid :deep(.user-avatar) { width: 28px; height: 28px; }
  .modern-grid :deep(.user-nickname) { font-size: 11px; }
  .modern-grid :deep(.post-date) { font-size: 9px; }
  .modern-grid :deep(.stat-pill) { padding: 5px 10px; font-size: 11px; }
  .modern-grid :deep(.icon) { width: 14px; height: 14px; }
}

/* List View */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  display: flex;
  gap: 0;
  background: white;
  border: 1px solid #f1f1f5;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  border-color: #9993ea;
}

.list-image {
  position: relative;
  width: 180px;
  min-width: 180px;
  aspect-ratio: 1 / 1;
  background: #f8f8fa;
  overflow: hidden;
}

.list-image img { width: 100%; height: 100%; object-fit: cover; }

.list-eval-overlay { position: absolute; top: 12px; left: 12px; }
.list-eval-badge {
  padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;
  background: white; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.eval-best { color: #f59e0b; }
.eval-good { color: #10b981; }
.eval-okay { color: #6366f1; }
.eval-bad { color: #ef4444; }

.list-price-overlay {
  position: absolute; bottom: 10px; right: 10px;
  background: rgba(24, 24, 27, 0.85); color: white;
  padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; backdrop-filter: blur(4px);
}

.list-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.list-header { display: flex; align-items: center; gap: 12px; }
.list-category { font-size: 11px; font-weight: 800; color: #9993ea; text-transform: uppercase; }
.list-time { font-size: 11px; color: #a1a1aa; }

.list-title {
  font-size: 18px; font-weight: 800; color: #18181b; line-height: 1.4;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.list-review {
  font-size: 14px; color: #52525b; line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  flex: 1;
}

.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f4f4f7;
}

.list-author { display: flex; align-items: center; gap: 8px; }
.list-avatar { width: 28px; height: 28px; border-radius: 8px; object-fit: cover; }
.list-nickname { font-size: 13px; font-weight: 700; color: #3f3f46; }

.list-stats { display: flex; gap: 16px; }
.stat {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 700; color: #a1a1aa;
}
.stat svg { width: 16px; height: 16px; }
.stat.active { color: #9993ea; }

/* Scroll Status */
.scroll-status { height: 80px; display: flex; align-items: center; justify-content: center; }
.loader { width: 24px; height: 24px; border: 3px solid #f4f4f5; border-top-color: #9993ea; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 스켈레톤 애니메이션 ===== */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton-line {
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 6px;
  display: block;
}

/* ===== 그리드 뷰 스켈레톤 카드 (FeedCard와 동일한 레이아웃) ===== */
.skeleton-card {
  pointer-events: none;
  background: white;
  border-radius: 28px;
  border: 1px solid #f0f0f5;
  overflow: hidden;
}

.skeleton-card .post-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f8f8fa;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-card .post-content {
  padding: 22px;
}

.skeleton-card .hashtag-group {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.skeleton-card .product-info-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f8fa;
  margin-left: -10px;
  margin-right: -10px;
  padding: 10px 20px;
  border-radius: 16px;
  margin-bottom: 22px;
  border: 1px solid #f1f1f5;
}

.skeleton-card .product-details {
  flex: 1;
  padding-right: 12px;
}

.skeleton-card .post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid #f4f4f7;
}

.skeleton-card .user-block {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skeleton-card .user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skeleton-card .interaction-group {
  display: flex;
  gap: 6px;
}

.skeleton-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  flex-shrink: 0;
}

.skeleton-stat-pill {
  width: 50px;
  height: 30px;
  border-radius: 100px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* ===== 리스트 뷰 스켈레톤 ===== */
.skeleton-list-item {
  pointer-events: none;
}

.skeleton-list-image {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-list-item .list-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-list-item .list-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-list-item .list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f4f4f7;
}

.skeleton-list-item .list-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-list-item .list-stats {
  display: flex;
  gap: 16px;
}

.skeleton-list-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #a1a1aa;
  font-size: 14px;
}
.empty-state svg { width: 40px; height: 40px; }

/* Mobile: 인스타/스레드 스타일 (경계선만 있는 형태) */
@media (max-width: 768px) {
  .feed-container {
    padding: 0;
    background: white;
  }

  .feed-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 0;
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;
  }
  .main-title { font-size: 20px; }
  .sub-title { font-size: 12px; }

  /* 그리드 뷰: 간격 제거, 전체 너비 */
  .modern-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  /* 리스트 뷰: 경계선 스타일 */
  .list-view {
    gap: 0;
  }

  .list-item {
    border-radius: 0;
    border: none;
    border-bottom: 1px solid #e5e5e5;
    background: transparent;
  }
  .list-item:hover {
    transform: none;
    box-shadow: none;
    border-color: #e5e5e5;
  }
  .list-item:active {
    background: #fafafa;
    transform: none;
  }

  .list-image { width: 120px; min-width: 120px; }

  .list-content { padding: 12px 14px; gap: 4px; }
  .list-title { font-size: 14px; }
  .list-review { font-size: 13px; -webkit-line-clamp: 2; }

  .list-footer { padding-top: 8px; }
  .list-avatar { width: 22px; height: 22px; }
  .list-nickname { font-size: 11px; }
  .stat { font-size: 11px; }
  .stat svg { width: 13px; height: 13px; }

  /* 모바일 스켈레톤: 그리드 뷰 */
  .skeleton-card {
    border-radius: 0;
    border: none;
    background: transparent;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #d0d0d0;
  }

  .skeleton-card .post-image-container {
    border-radius: 0;
  }

  .skeleton-card .post-content {
    padding: 14px 16px 4px;
  }

  .skeleton-card .hashtag-group {
    margin-bottom: 12px;
    gap: 6px;
  }

  .skeleton-card .product-info-box {
    margin-left: -4px;
    margin-right: -4px;
    padding: 10px 14px;
    border-radius: 12px;
    margin-bottom: 10px;
    border: none;
  }

  .skeleton-card .post-footer {
    padding-top: 8px;
    border-top: none;
  }

  .skeleton-avatar {
    width: 28px;
    height: 28px;
  }

  .skeleton-stat-pill {
    width: 45px;
    height: 26px;
  }

  /* 모바일 스켈레톤: 리스트 뷰 */
  .skeleton-list-avatar {
    width: 22px;
    height: 22px;
  }

  .skeleton-list-item .list-footer {
    padding-top: 8px;
  }
}

/* 접근성: 모션 감소 선호 시 */
@media (prefers-reduced-motion: reduce) {
  .skeleton-line,
  .skeleton-image,
  .skeleton-avatar,
  .skeleton-stat-pill,
  .skeleton-list-image,
  .skeleton-list-avatar {
    animation: none;
    background-color: #e5e7eb;
  }
}
</style>
