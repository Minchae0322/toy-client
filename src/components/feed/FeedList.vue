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
      <FeedCard
          v-for="feed in feeds"
          :key="feed.feedId"
          :feed="feed"
          @update="(data) => $emit('update', data)"
          @click="(id) => $emit('post-click', id)"
      />
    </div>

    <!-- List View -->
    <div v-else class="list-view">
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
    </div>

    <!-- Loading & Empty States -->
    <div ref="observerTarget" class="scroll-status">
      <span v-if="loading" class="loader"></span>
      <div v-else-if="feeds.length === 0" class="empty-state">
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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #a1a1aa;
  font-size: 14px;
}
.empty-state svg { width: 40px; height: 40px; }

/* PC - 카드 90% 배율 */
@media (min-width: 769px) {
  .modern-grid :deep(.post-card) {
    transform: scale(0.9);
    transform-origin: top center;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .feed-container {
    padding: 20px 12px;
  }

  .feed-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
  .main-title { font-size: 22px; }
  .sub-title { font-size: 13px; }

  .modern-grid { grid-template-columns: 1fr; gap: 12px; }

  .list-view { gap: 12px; }

  .list-item { border-radius: 16px; }
  .list-item:hover { transform: none; }
  .list-item:active { transform: scale(0.98); }

  .list-image { width: 120px; min-width: 120px; }

  .list-content { padding: 14px; gap: 6px; }
  .list-title { font-size: 15px; }
  .list-review { font-size: 13px; -webkit-line-clamp: 2; }

  .list-footer { padding-top: 10px; }
  .list-avatar { width: 24px; height: 24px; }
  .list-nickname { font-size: 12px; }
  .stat { font-size: 12px; }
  .stat svg { width: 14px; height: 14px; }
}
</style>
