<template>
  <section class="feed-section">
    <div class="section-header">
      <h2 class="section-title">최신 인증</h2>
      <select class="sort-select" v-model="sortOption">
        <option value="latest">최신순</option>
        <option value="popular">인기순</option>
        <option value="discussed">댓글 많은순</option>
      </select>
    </div>

    <!-- Feed Grid View -->
    <div v-if="viewMode === 'feed'" class="feed-grid">
      <FeedCard
          v-for="feed in feeds"
          :key="feed.feedId"
          :feed="feed"
          :is-liked="likedPosts.has(feed.feedId)"
          :is-saved="savedPosts.has(feed.feedId)"
          @like="handleLike"
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
          <!-- 🔥 Evaluation Badge Overlay (List View) -->
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
                <img v-if="feed.userInfo?.profileImageUrl" :src="feed.userInfo.profileImageUrl" alt="User" />
                <span v-else class="avatar-placeholder">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                </span>
              </div>
              <div>
                <div class="author-name-row">
                  <span class="author-name">{{ feed.userInfo?.nickname || '익명' }}</span>
                  <span class="author-level-badge">
                    <svg class="level-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </span>
                  <span class="list-category">{{ feed.categoryName }}</span>
                </div>
                <span class="list-time">{{ formatDate(feed.createdAt) }}</span>
              </div>
            </div>
            <button class="btn-more" @click.stop>
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>
          </div>

          <div class="list-main">
            <!-- 🔥 제목 + Evaluation Badge -->
            <div class="list-title-row">
              <h3 class="list-title">{{ feed.productName }}</h3>
              <span v-if="feed.feedEvaluation" :class="['list-evaluation-status', getEvaluationClass(feed.feedEvaluation)]">
                <svg class="list-eval-icon-small" :fill="getEvaluationIconFill(feed.feedEvaluation)" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getEvaluationIconPath(feed.feedEvaluation)"/>
                </svg>
                {{ getEvaluationLabel(feed.feedEvaluation) }}
              </span>
            </div>

            <p class="list-review">{{ feed.reviewSummary }}</p>

            <!-- 🔥 리액션 & 가격 정보 -->
            <div class="list-meta">
              <div class="list-reactions">
                <span class="reaction-item">
                  <svg class="icon-small fire-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                  </svg>
                  {{ feed.reactionStats?.likeCount || 0 }}
                </span>
                <span class="reaction-item">
                  <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {{ feed.reactionStats?.hotCount || 0 }}
                </span>
                <span class="reaction-item">
                  <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  {{ feed.commentCount || 0 }}
                </span>
              </div>
              <span v-if="feed.price" class="price">{{ formatPrice(feed.price) }}</span>
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
    <div ref="observerTarget" class="load-more">
      <div v-if="loading" class="spinner">
        <div class="spinner-icon"></div>
        <p>로딩 중...</p>
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
  feeds: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasNext: {
    type: Boolean,
    default: true
  },
  viewMode: {
    type: String,
    default: 'feed'
  },
  likedPosts: {
    type: Set,
    default: () => new Set()
  },
  savedPosts: {
    type: Set,
    default: () => new Set()
  }
});

const emit = defineEmits(['like', 'save', 'comment', 'post-click']);

const sortOption = ref('latest');
const observerTarget = ref(null);

// 🔥 Evaluation 유틸리티 메서드
const getEvaluationLabel = (evaluation) => {
  return feedUtils.getEvaluationLabel(evaluation);
};

const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  const classMap = {
    'BEST': 'eval-best',
    'GOOD': 'eval-good',
    'OKAY': 'eval-okay',
    'BAD': 'eval-bad'
  };
  return classMap[code] || '';
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

const handleLike = (feedId) => {
  console.log('👍 FeedList - Like:', feedId);
  emit('like', feedId);
};

const handleSave = (feedId) => {
  console.log('💾 FeedList - Save:', feedId);
  emit('save', feedId);
};

const handleComment = (feedId) => {
  console.log('💬 FeedList - Comment:', feedId);
  emit('comment', feedId);
};

const handlePostClick = (feedId) => {
  console.log('🎯 FeedList - Post Click:', feedId);
  emit('post-click', feedId);
};

const formatDate = (dateString) => {
  return feedUtils.formatDate(dateString);
};

const formatPrice = (price) => {
  return feedUtils.formatPrice(price);
};

defineExpose({
  observerTarget
});
</script>

<style scoped>
.feed-section {
  padding: 32px 20px;
}

@media (min-width: 1024px) {
  .feed-section {
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

.sort-select {
  padding: 8px 32px 8px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5L6 8L9 5' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  font-family: inherit;
  transition: all 0.2s;
}

.sort-select:hover {
  border-color: var(--primary);
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Feed Grid */
.feed-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .feed-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (min-width: 1024px) {
  .feed-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1600px) {
  .feed-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

/* List View */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-item {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  gap: 20px;
  transition: all 0.3s;
  cursor: pointer;
}

.list-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 🔥 List View - Image with Evaluation Badge */
.list-image {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  background: var(--hover);
}

.list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.list-item:hover .list-image img {
  transform: scale(1.05);
}

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
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.list-eval-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  stroke-width: 2;
}

.list-evaluation-badge.eval-best {
  background: rgba(249, 115, 22, 0.95);
  color: white;
}

.list-evaluation-badge.eval-good {
  background: rgba(16, 185, 129, 0.95);
  color: white;
}

.list-evaluation-badge.eval-okay {
  background: rgba(59, 130, 246, 0.95);
  color: white;
}

.list-evaluation-badge.eval-bad {
  background: rgba(239, 68, 68, 0.95);
  color: white;
}

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.list-author-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.author-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  overflow: hidden;
  color: white;
}

.author-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder svg {
  width: 20px;
  height: 20px;
}

.author-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.author-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.author-level-badge {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.level-icon {
  width: 14px;
  height: 14px;
  color: #F59E0B;
}

.list-category {
  padding: 2px 8px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.list-time {
  font-size: 12px;
  color: var(--secondary);
}

.btn-more {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.btn-more:hover {
  background: var(--hover);
}

.btn-more .icon {
  width: 18px;
  height: 18px;
  color: var(--secondary);
}

.list-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 🔥 제목 + Evaluation Badge 한 줄에 */
.list-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.list-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.4;
  flex: 0 1 auto;
}

/* 🔥 List View - Evaluation Status (제목 옆) */
.list-evaluation-status {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.list-eval-icon-small {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  stroke-width: 2;
}

.list-evaluation-status.eval-best {
  background: #FFF7ED;
  color: #F97316;

}

.list-evaluation-status.eval-good {
  background: #D1FAE5;
  color: #059669;
}

.list-evaluation-status.eval-okay {
  background: #DBEAFE;
  color: #2563EB;
}

.list-evaluation-status.eval-bad {
  background: #FEE2E2;
  color: #DC2626;
}

.list-review {
  font-size: 14px;
  color: var(--secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 🔥 리액션 & 가격 정보 */
.list-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
}

.list-reactions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reaction-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--primary);
  font-weight: 600;
}

.icon-small {
  width: 15px;
  height: 15px;
  stroke-width: 2;
  flex-shrink: 0;
}

.icon-small.fire-icon {
  width: 16px;
  height: 16px;
}

.price {
  font-weight: 700;
  color: var(--primary);
  font-size: 13px;
  white-space: nowrap;
  margin-left: auto;
}

.list-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 4px;
}

.hashtag {
  font-size: 11px;
  color: #1D4ED8;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.hashtag:hover {
  color: #1E40AF;
  text-decoration: underline;
}

/* Loading & Empty States */
.load-more {
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--secondary);
}

.spinner-icon {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner p {
  font-size: 14px;
  font-weight: 600;
}

.end-message,
.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  background: var(--hover);
  border-radius: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.end-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--secondary);
}

.end-message p,
.empty-message p {
  font-size: 15px;
  font-weight: 600;
  color: var(--secondary);
  margin: 0;
}

@media (max-width: 767px) {
  .feed-section {
    padding: 24px 16px;
  }

  .list-view {
    gap: 16px;
  }

  .list-item {
    flex-direction: column;
    padding: 16px;
  }

  .list-image {
    width: 100%;
    height: 200px;
  }

  .list-evaluation-badge-overlay {
    top: 8px;
    left: 8px;
  }

  .list-evaluation-badge {
    padding: 4px 8px;
    font-size: 9px;
    gap: 3px;
  }

  .list-eval-icon {
    width: 10px;
    height: 10px;
  }

  .list-title {
    font-size: 16px;
  }

  .list-evaluation-status {
    padding: 2px 8px;
    font-size: 10px;
  }

  .list-eval-icon-small {
    width: 11px;
    height: 11px;
  }

  .list-meta {
    flex-wrap: wrap;
  }

  .list-reactions {
    gap: 6px;
  }

  .reaction-item {
    font-size: 10px;
    gap: 2px;
  }

  .icon-small {
    width: 13px;
    height: 13px;
  }

  .price {
    font-size: 12px;
  }
}
</style>