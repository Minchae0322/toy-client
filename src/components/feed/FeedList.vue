<template>
  <section class="feed-section">
    <div class="section-header">
      <h2 class="section-title">최신 인증</h2>
      <div class="header-controls">
        <div class="view-toggle">
          <button @click="$emit('view-mode-change', 'feed')" :class="['view-btn', { active: viewMode === 'feed' }]">
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </button>
          <button @click="$emit('view-mode-change', 'list')" :class="['view-btn', { active: viewMode === 'list' }]">
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
            </svg>
          </button>
        </div>
        <select class="sort-select" v-model="sortOption">
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="discussed">댓글순</option>
        </select>
      </div>
    </div>

    <!-- Feed Grid View -->
    <div v-if="viewMode === 'feed'" class="feed-grid">
      <FeedCard
          v-for="feed in feeds"
          :key="feed.feedId"
          :feed="feed"
          :is-liked="likedPosts.has(feed.feedId)"
          :is-hot="hotPosts.has(feed.feedId)"
          :is-saved="savedPosts.has(feed.feedId)"
          @update="handleUpdate"
          @save="handleSave"
          @comment="handleComment"
          @click="handlePostClick"
      />
    </div>

    <!-- List View -->
    <div v-else class="list-view">
      <article v-for="feed in feeds" :key="feed.feedId" class="list-item" @click="handlePostClick(feed.feedId)">
        <div class="list-image">
          <img :src="feed.thumbnailUrl?.fileUrl || 'https://placehold.co/400x300?text=No+Image'" :alt="feed.productName" />
          <div v-if="feed.feedEvaluation" class="list-eval-overlay">
            <span :class="['list-eval-badge', getEvaluationClass(feed.feedEvaluation)]">
              {{ getEvaluationLabel(feed.feedEvaluation) }}
            </span>
          </div>
        </div>
        <div class="list-content">
          <div class="list-header">
            <div class="list-author">
              <div class="author-avatar-sm">
                <img v-if="getProfileImageUrl(feed)" :src="getProfileImageUrl(feed)" alt="" />
                <span v-else class="avatar-placeholder">
                  <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>
                </span>
              </div>
              <span class="author-name">{{ getDisplayNickname(feed) }}</span>
              <span class="list-time">{{ formatDate(feed.createdAt) }}</span>
            </div>
          </div>
          <h3 class="list-title">{{ feed.productName }}</h3>
          <p class="list-review">{{ feed.reviewSummary }}</p>
          <div class="list-footer">
            <div class="list-reactions">
              <span :class="['reaction', { active: feed.userReactions?.hasLike }]">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 14a5 5 0 1 0 0 8 5 5 0 1 0 0-8M10 14l7-7M19 4a2 2 0 1 0 0 4 2 2 0 1 0 0-4"/></svg>
                {{ feed.likeCount || 0 }}
              </span>
              <span class="reaction">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                {{ feed.commentCount || 0 }}
              </span>
            </div>
            <span v-if="getDisplayPrice(feed)" class="list-price">{{ formatBuyPrice(getDisplayPrice(feed)) }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- Loading & Observer -->
    <div ref="observerTarget" class="load-section">
      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
        <span>로딩 중...</span>
      </div>
      <div v-else-if="!hasNext && feeds.length > 0" class="end-box">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span>모든 게시물을 확인했습니다</span>
      </div>
      <div v-else-if="feeds.length === 0 && !loading" class="empty-box">
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
  hasNext: { type: Boolean, default: true },
  viewMode: { type: String, default: 'feed' },
  likedPosts: { type: Set, default: () => new Set() },
  hotPosts: { type: Set, default: () => new Set() },
  savedPosts: { type: Set, default: () => new Set() }
});

const emit = defineEmits(['like', 'hot', 'save', 'comment', 'post-click', 'view-mode-change', 'update']);

const sortOption = ref('latest');
const observerTarget = ref(null);

const getProfileImageUrl = (feed) => feed.userInfo?.profileImageFile?.fileUrl || feed.userInfo?.profileImgUrl || null;
const getDisplayNickname = (feed) => feed.userInfo?.nickname || feed.userInfo?.nickName || '익명';
const getDisplayPrice = (feed) => feed.buyPrice || feed.price || null;
const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation);
const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  return { 'BEST': 'eval-best', 'GOOD': 'eval-good', 'OKAY': 'eval-okay', 'BAD': 'eval-bad' }[code] || '';
};

const handleUpdate = (data) => emit('update', data);
const handleSave = (feedId) => emit('save', feedId);
const handleComment = (feedId) => emit('comment', feedId);
const handlePostClick = (feedId) => emit('post-click', feedId);

const formatDate = (dateString) => feedUtils.formatDate(dateString);
const formatBuyPrice = (price) => feedUtils.formatPrice(price);

defineExpose({ observerTarget });
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.feed-section {
  padding: 16px 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background: #ffffff;
  min-height: 100vh;
}

/* Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.section-title { font-size: 18px; font-weight: 700; color: #1a1a1a; }

.header-controls { display: flex; align-items: center; gap: 8px; }

.view-toggle {
  display: flex;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 2px;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #999;
  cursor: pointer;
  transition: all 0.15s;
}

.view-btn:hover { color: #666; }
.view-btn.active { background: #fff; color: #1a1a1a; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.view-btn .icon { width: 15px; height: 15px; }

.sort-select {
  padding: 7px 26px 7px 10px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}

/* Feed Grid - PC에서 2열 그리드 */
.feed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* 피드 카드 이미지 비율 조정 (세로로 1.5개 보이도록) */
.feed-grid :deep(.post-image-container) {
  aspect-ratio: 4 / 3;
}

.feed-grid :deep(.post-content) {
  padding: 10px 12px;
}

.feed-grid :deep(.post-info) {
  margin-bottom: 8px;
}

.feed-grid :deep(.post-review) {
  -webkit-line-clamp: 1;
  margin-bottom: 4px;
}

.feed-grid :deep(.post-hashtags) {
  margin-top: 6px;
}

/* List View - 컴팩트 */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.list-item:hover {
  border-color: #d0d0d0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.list-image {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
}

.list-image img { width: 100%; height: 100%; object-fit: cover; }

.list-eval-overlay { position: absolute; top: 6px; left: 6px; }

.list-eval-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  backdrop-filter: blur(6px);
}

.list-eval-badge.eval-best { background: rgba(255,237,213,0.95); color: #ea580c; }
.list-eval-badge.eval-good { background: rgba(220,252,231,0.95); color: #16a34a; }
.list-eval-badge.eval-okay { background: rgba(224,231,255,0.95); color: #4f46e5; }
.list-eval-badge.eval-bad { background: rgba(254,226,226,0.95); color: #dc2626; }

.list-content { flex: 1; display: flex; flex-direction: column; min-width: 0; gap: 4px; }

.list-header { margin-bottom: 2px; }

.list-author { display: flex; align-items: center; gap: 6px; }

.author-avatar-sm {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.author-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder svg { width: 10px; height: 10px; color: #999; }

.list-author .author-name { font-size: 11px; font-weight: 600; color: #1a1a1a; }

.list-time { font-size: 10px; color: #999; }

.list-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.list-review {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.list-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.list-reactions { display: flex; gap: 10px; }

.reaction {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 500;
  color: #888;
}

.reaction svg { width: 12px; height: 12px; }
.reaction.active { color: #f59e0b; }

.list-price {
  font-size: 11px;
  font-weight: 600;
  color: #1a1a1a;
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 4px;
}

/* Loading States */
.load-section {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

.loading-box, .end-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #999;
  font-size: 13px;
  font-weight: 500;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e8e8e8;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.end-box svg, .empty-box svg { width: 36px; height: 36px; }

/* ===== Mobile ===== */
@media (max-width: 767px) {
  .feed-section { padding: 12px 0; }

  .section-header { padding: 0 0 12px; margin-bottom: 12px; }
  .section-title { font-size: 16px; }
  .view-btn { width: 28px; height: 28px; }
  .view-btn .icon { width: 14px; height: 14px; }
  .sort-select { padding: 6px 24px 6px 8px; font-size: 11px; }

  .feed-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 0 4px;
  }

  .feed-grid :deep(.post-image-container) {
    aspect-ratio: 3 / 2;
  }

  .list-view { gap: 10px; }

  .list-item {
    padding: 10px;
    gap: 10px;
    border-radius: 10px;
  }

  .list-item:active {
    transform: scale(0.98);
  }

  .list-image {
    width: 90px;
    height: 90px;
    border-radius: 8px;
  }

  .list-title { font-size: 13px; }
  .list-review { font-size: 11px; -webkit-line-clamp: 2; }

  .load-section { padding: 28px 0; }
}
</style>