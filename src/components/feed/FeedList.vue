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
      <article v-for="feed in feeds" :key="feed.feedId" class="list-item">
        <div class="list-image" @click="handlePostClick(feed.feedId)">
          <img :src="feed.thumbnailUrl?.fileUrl || 'https://via.placeholder.com/400'" :alt="feed.productName" />
        </div>
        <div class="list-content">
          <div class="list-header">
            <div class="list-author-info">
              <div class="author-avatar-small">
                <img v-if="feed.userInfo?.profileImageUrl" :src="feed.userInfo.profileImageUrl" alt="User" />
                <span v-else>👤</span>
              </div>
              <div>
                <div class="author-name-row">
                  <span class="author-name">{{ feed.userInfo?.nickname || '익명' }}</span>
                  <span class="author-level">🔥</span>
                  <span class="list-category">{{ feed.categoryName }}</span>
                </div>
                <span class="list-time">{{ formatDate(feed.createdAt) }}</span>
              </div>
            </div>
            <button class="btn-more">
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>
          </div>
          <div class="list-main" @click="handlePostClick(feed.feedId)">
            <h3 class="list-title">{{ feed.productName }}</h3>
            <p class="list-review">{{ feed.reviewSummary }}</p>
            <div class="list-details">
              <span v-if="feed.price" class="price">{{ formatPrice(feed.price) }}</span>
            </div>
            <div class="list-hashtags" v-if="feed.hashtags && feed.hashtags.length > 0">
              <span v-for="tag in feed.hashtags.slice(0, 3)" :key="tag" class="hashtag">#{{ tag }}</span>
            </div>
          </div>
          <div class="list-actions">
            <button @click="handleLike(feed.feedId)" :class="['action-btn', { liked: likedPosts.has(feed.feedId) }]">
              <span class="fire">🔥</span>
              <span>{{ feed.reactionStats?.likeCount || 0 }}</span>
            </button>
            <button class="action-btn">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <span>{{ feed.reactionStats?.hotCount || 0 }}</span>
            </button>
            <button @click="handleComment(feed.feedId)" class="action-btn">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <span>{{ feed.commentCount || 0 }}</span>
            </button>
            <button @click="handleSave(feed.feedId)" :class="['action-btn save', { saved: savedPosts.has(feed.feedId) }]">
              <svg class="icon" :fill="savedPosts.has(feed.feedId) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
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
        <span class="emoji">✨</span>
        <p>모든 게시물을 확인했습니다</p>
      </div>
      <div v-else-if="feeds.length === 0 && !loading" class="empty-message">
        <span class="emoji">📭</span>
        <p>아직 게시물이 없습니다</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import FeedCard from './FeedCard.vue';

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
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString('ko-KR');
};

const formatPrice = (price) => {
  if (!price) return '무료';
  return '₩' + price.toLocaleString('ko-KR');
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
}

.list-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.list-image {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
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

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-author-info {
  display: flex;
  align-items: center;
  gap: 10px;
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
}

.author-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.author-level {
  font-size: 14px;
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
  cursor: pointer;
}

.list-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.list-review {
  font-size: 14px;
  color: var(--secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.list-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
  margin-bottom: 8px;
}

.price {
  font-weight: 700;
  color: var(--primary);
}

.list-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hashtag {
  font-size: 13px;
  color: #1D4ED8;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.hashtag:hover {
  color: #1E40AF;
  text-decoration: underline;
}

.list-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  flex-shrink: 0;
}

.action-btn:hover {
  background: var(--hover);
}

.action-btn.liked {
  color: var(--accent);
}

.action-btn .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  flex-shrink: 0;
}

.action-btn .fire {
  font-size: 18px;
  flex-shrink: 0;
}

.action-btn.save {
  margin-left: auto;
}

.action-btn.saved {
  color: #1D4ED8;
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

.end-message .emoji,
.empty-message .emoji {
  font-size: 48px;
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
}

@media (max-width: 1279px) {
  .action-btn {
    padding: 6px 8px;
    font-size: 13px;
    gap: 4px;
  }

  .action-btn .icon {
    width: 18px;
    height: 18px;
  }

  .action-btn .fire {
    font-size: 16px;
  }
}
</style>