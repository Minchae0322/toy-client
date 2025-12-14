<template>
  <section class="feed-section">
    <div class="section-header">
      <h2 class="section-title">최신 인증</h2>
      <div class="header-controls">
        <div class="view-toggle">
          <button
              @click="$emit('view-mode-change', 'feed')"
              :class="['view-btn', { active: viewMode === 'feed' }]"
              title="피드 뷰"
          >
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </button>
          <button
              @click="$emit('view-mode-change', 'list')"
              :class="['view-btn', { active: viewMode === 'list' }]"
              title="리스트 뷰"
          >
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
            </svg>
          </button>
        </div>
        <select class="sort-select" v-model="sortOption">
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="discussed">댓글 많은순</option>
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
          <img :src="feed.thumbnailUrl?.fileUrl || 'https://via.placeholder.com/400'" :alt="feed.productName" />
          <div v-if="feed.feedEvaluation" class="list-evaluation-badge-overlay">
            <span :class="['list-evaluation-badge', getEvaluationClass(feed.feedEvaluation)]">
              <svg class="list-eval-icon" :fill="getEvaluationIconFill(feed.feedEvaluation)" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getEvaluationIconPath(feed.feedEvaluation)"/>
              </svg>
              {{ getEvaluationLabel(feed.feedEvaluation) }}
            </span>
          </div>
        </div>
        <div class="list-content">
          <div class="list-header">
            <div class="list-author-info">
              <div class="author-avatar-small">
                <img v-if="getProfileImageUrl(feed)" :src="getProfileImageUrl(feed)" alt="User" />
                <span v-else class="avatar-placeholder">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                </span>
              </div>
              <span class="author-name">{{ getDisplayNickname(feed) }}</span>
              <span class="list-category">{{ getCategoryName(feed) }}</span>
              <span class="list-time">{{ formatDate(feed.createdAt) }}</span>
            </div>
            <button class="btn-more" @click.stop>
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>
          </div>

          <div class="list-main">
            <h3 class="list-title">{{ feed.productName }}</h3>
            <p class="list-review" v-html="formatReview(feed.reviewSummary)"></p>
            <div class="list-meta">
              <div class="list-reactions">
                <span :class="['reaction-item', { active: feed.userReactions?.hasHot }]">
                  <svg class="icon-small fire-icon" :fill="feed.userReactions?.hasHot ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                  </svg>
                  {{ feed.hotCount || 0 }}
                </span>
                <span :class="['reaction-item', { active: feed.userReactions?.hasLike }]">
                  <svg class="icon-small" :fill="feed.userReactions?.hasLike ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                  </svg>
                  {{ feed.likeCount || 0 }}
                </span>
                <span class="reaction-item">
                  <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  {{ feed.commentCount || 0 }}
                </span>
              </div>
              <div class="price-place">
                <span v-if="getDisplayPrice(feed)" class="buy-price">{{ formatBuyPrice(getDisplayPrice(feed)) }}</span>
              </div>
            </div>
            <div class="list-hashtags" v-if="feed.hashtags && feed.hashtags.length > 0">
              <span v-for="tag in feed.hashtags.slice(0, 3)" :key="tag" class="hashtag" @click.stop>
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Loading & Observer Target -->
    <div ref="observerTarget" class="load-more-section">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">로딩 중...</p>
      </div>
      <div v-else-if="!hasNext && feeds.length > 0" class="end-message">
        <svg class="end-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <p>모든 게시물을 확인했습니다</p>
      </div>
      <div v-else-if="feeds.length === 0 && !loading" class="empty-message">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p>아직 게시물이 없습니다</p>
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

// ========== 사용자 정보 헬퍼 함수 ==========
const getProfileImageUrl = (feed) => {
  const userInfo = feed.userInfo;
  if (!userInfo) return null;
  return userInfo.profileImageFile?.fileUrl
      || userInfo.profileImageUrl
      || userInfo.profileImgUrl
      || null;
};

const getDisplayNickname = (feed) => {
  const userInfo = feed.userInfo;
  if (!userInfo) return '익명';
  return userInfo.nickname || userInfo.nickName || '익명';
};

// ========== 카테고리 & 가격 헬퍼 ==========
const getCategoryName = (feed) => {
  return feed.subCategoryDetail?.subCategoryName
      || feed.subCategoryDetail?.categoryName
      || feed.categoryName
      || '';
};

const getDisplayPrice = (feed) => {
  return feed.buyPrice || feed.price || null;
};

// ========== 평가 관련 ==========
const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation);

const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  return { 'BEST': 'eval-best', 'GOOD': 'eval-good', 'OKAY': 'eval-okay', 'BAD': 'eval-bad' }[code] || '';
};

const getEvaluationIconPath = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  const icons = {
    'BEST': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    'GOOD': 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5',
    'OKAY': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'BAD': 'M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5'
  };
  return icons[code] || icons['OKAY'];
};

const getEvaluationIconFill = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  return code === 'BEST' ? 'currentColor' : 'none';
};

// ========== 이벤트 핸들러 ==========
const handleUpdate = (data) => emit('update', data);
const handleSave = (feedId) => emit('save', feedId);
const handleComment = (feedId) => emit('comment', feedId);
const handlePostClick = (feedId) => emit('post-click', feedId);

// ========== 포맷 함수 ==========
const formatDate = (dateString) => feedUtils.formatDate(dateString);
const formatBuyPrice = (price) => feedUtils.formatPrice(price);
const formatReview = (text) => {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
};

defineExpose({ observerTarget });
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #0F172A;
  --secondary: #64748B;
  --accent: #F97316;
  --border: #E2E8F0;
  --bg: #FFFFFF;
  --card: #FFFFFF;
  --hover: #F8FAFC;
  --shadow: rgba(0, 0, 0, 0.08);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

.feed-section {
  padding: 32px 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background: var(--bg);
}

@media (min-width: 1024px) {
  .feed-section { padding: 40px 0; }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
  padding: 0 20px 20px;
  border-bottom: 1px solid var(--border);
}

@media (min-width: 1024px) {
  .section-header { padding: 0 32px 24px; }
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

@media (min-width: 1024px) {
  .section-title { font-size: 24px; }
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle {
  display: flex;
  background: var(--hover);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.view-btn:hover {
  color: var(--primary);
  background: rgba(0, 0, 0, 0.03);
}

.view-btn.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.view-btn .icon { width: 18px; height: 18px; }

.sort-select {
  padding: 10px 36px 10px 16px;
  background: var(--hover);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5L6 8L9 5' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  font-family: inherit;
  transition: all 0.2s;
}

.sort-select:hover {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
}

@media (max-width: 767px) {
  .section-header { gap: 12px; padding: 0 12px 16px; }
  .section-title { font-size: 18px; flex: 1 1 100%; }
  .header-controls { width: 100%; justify-content: space-between; }
  .view-btn { width: 34px; height: 34px; }
  .view-btn .icon { width: 16px; height: 16px; }
  .sort-select { font-size: 13px; padding: 8px 30px 8px 12px; }
}

.feed-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 0 20px;
}

@media (min-width: 768px) {
  .feed-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .feed-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; padding: 0 32px; }
}

@media (min-width: 1600px) {
  .feed-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 767px) {
  .feed-grid { padding: 0 8px; gap: 12px; }
}

.list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px;
}

@media (min-width: 1024px) {
  .list-view { gap: 20px; padding: 0 32px; }
}

.list-item {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 20px;
  transition: all 0.25s;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.list-item:hover {
  box-shadow: 0 4px 12px var(--shadow);
  transform: translateY(-2px);
  border-color: rgba(0, 0, 0, 0.1);
}

.list-image {
  position: relative;
  width: 200px;
  aspect-ratio: 4 / 3;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--hover);
}

.list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.list-item:hover .list-image img { transform: scale(1.05); }

.list-evaluation-badge-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}

.list-evaluation-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.list-eval-icon { width: 13px; height: 13px; flex-shrink: 0; stroke-width: 2; }

.list-evaluation-badge.eval-best {
  background: rgba(255, 247, 237, 0.85);
  color: #F97316;
  border: 1px solid rgba(253, 186, 116, 0.8);
  backdrop-filter: blur(4px);
}

.list-evaluation-badge.eval-good {
  background: rgba(209, 250, 229, 0.85);
  color: #059669;
  border: 1px solid rgba(110, 231, 183, 0.8);
  backdrop-filter: blur(4px);
}

.list-evaluation-badge.eval-okay {
  background: rgba(219, 234, 254, 0.85);
  color: #2563EB;
  border: 1px solid rgba(147, 197, 253, 0.8);
  backdrop-filter: blur(4px);
}

.list-evaluation-badge.eval-bad {
  background: rgba(254, 226, 226, 0.85);
  color: #DC2626;
  border: 1px solid rgba(252, 165, 165, 0.8);
  backdrop-filter: blur(4px);
}

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 180px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.list-author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.author-avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  color: white;
}

.author-avatar-small img { width: 100%; height: 100%; object-fit: cover; }

.avatar-placeholder svg { width: 14px; height: 14px; }

.author-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.list-category {
  padding: 2px 6px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.list-time { font-size: 12px; color: var(--secondary); white-space: nowrap; }

.btn-more {
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.btn-more:hover { background: var(--hover); }
.btn-more .icon { width: 16px; height: 16px; color: var(--secondary); }

.list-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.list-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.4;
  margin-bottom: 6px;
}

.list-review {
  font-size: 14px;
  color: var(--secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  margin-bottom: auto;
}

.list-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.list-reactions { display: flex; align-items: center; gap: 12px; }

.reaction-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--primary);
  font-weight: 600;
}

/* 리액션 활성화 스타일 */
.reaction-item.active { color: #F97316; }
.reaction-item.active .icon-small { color: #F97316; }

.icon-small { width: 16px; height: 16px; stroke-width: 2; flex-shrink: 0; color: var(--secondary); }
.icon-small.fire-icon { width: 17px; height: 17px; }

.price-place { display: flex; align-items: center; }

.buy-price {
  font-weight: 700;
  color: var(--primary);
  font-size: 14px;
  white-space: nowrap;
}

.list-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.hashtag {
  font-size: 12px;
  color: #1D4ED8;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  background: #EFF6FF;
  padding: 4px 8px;
  border-radius: 6px;
}

.hashtag:hover { color: #1E40AF; background: #DBEAFE; }

.load-more-section {
  width: 100%;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #E2E8F0;
  border-top-color: #F97316;
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
}

@keyframes spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text { font-size: 15px; font-weight: 600; color: #64748B; margin: 0; }

.end-message, .empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  background: var(--hover);
  border: 1px solid var(--border);
  border-radius: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.end-icon, .empty-icon { width: 48px; height: 48px; color: var(--secondary); }
.end-message p, .empty-message p { font-size: 15px; font-weight: 600; color: var(--secondary); margin: 0; }

@media (max-width: 767px) {
  .feed-section { padding: 24px 0; }
  .list-view { gap: 12px; padding: 0 8px; }
  .list-item { flex-direction: column; padding: 16px; }
  .list-image { width: 100%; aspect-ratio: 4 / 3; }
  .list-content { min-height: auto; }
  .author-avatar-small { width: 24px; height: 24px; }
  .avatar-placeholder svg { width: 12px; height: 12px; }
  .author-name { font-size: 12px; max-width: 80px; }
  .list-category { font-size: 9px; padding: 2px 5px; }
}
</style>