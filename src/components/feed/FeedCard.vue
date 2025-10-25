<template>
  <article class="post-card">
    <div class="post-header">
      <div class="post-author-info">
        <div class="author-avatar-small">
          <img v-if="feed.userInfo?.profileImageUrl" :src="feed.userInfo.profileImageUrl" alt="User" />
          <span v-else>👤</span>
        </div>
        <div class="author-details">
          <div class="author-name-row">
            <span class="author-name">{{ feed.userInfo?.nickname || '익명' }}</span>
            <span class="author-level">🔥</span>
          </div>
          <div class="post-meta">
            <span>{{ formatDate(feed.createdAt) }}</span>
            <span class="meta-dot">·</span>
            <span class="post-category-badge">{{ feed.categoryName }}</span>
          </div>
        </div>
      </div>
      <button class="btn-more">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
      </button>
    </div>

    <div class="post-image-container" @dblclick="$emit('like', feed.feedId)">
      <img :src="feed.thumbnailUrl?.fileUrl || 'https://via.placeholder.com/400'" :alt="feed.productName" class="post-image" />
      <div v-if="isLiked" class="like-animation">
        <svg class="heart-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
        </svg>
      </div>
    </div>

    <div class="post-content">
      <div class="post-actions">
        <div class="action-left">
          <button @click="$emit('like', feed.feedId)" :class="['action-btn', { liked: isLiked }]">
            <span class="fire">🔥</span>
            <span>{{ (feed.reactionStats?.likeCount || 0) + (isLiked ? 1 : 0) }}</span>
          </button>
          <button class="action-btn">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <span>{{ feed.reactionStats?.hotCount || 0 }}</span>
          </button>
          <button @click="$emit('comment', feed.feedId)" class="action-btn">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span>0</span>
          </button>
        </div>
        <button @click="$emit('save', feed.feedId)" :class="['action-btn save', { saved: isSaved }]">
          <svg class="icon" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
      </div>

      <div class="post-info">
        <h3 class="post-title">{{ feed.productName }}</h3>
        <div class="post-details">
          <span v-if="feed.buyPrice" class="price">{{ formatPrice(feed.buyPrice) }}</span>
          <span v-if="feed.price" class="original-price">{{ formatPrice(feed.price) }}</span>
        </div>
        <p class="post-review">{{ feed.reviewSummary }}</p>
        <div class="post-hashtags" v-if="feed.hashtags && feed.hashtags.length > 0">
          <span v-for="tag in feed.hashtags" :key="tag" class="hashtag">#{{ tag }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  feed: {
    type: Object,
    required: true
  },
  isLiked: {
    type: Boolean,
    default: false
  },
  isSaved: {
    type: Boolean,
    default: false
  }
});

defineEmits(['like', 'save', 'comment']);

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
</script>

<style scoped>
.post-card {
  background: var(--card);
  border-radius: 20px;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: all 0.3s;
}

.post-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.post-author-info {
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

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

.post-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--secondary);
}

.meta-dot {
  color: var(--border);
}

.post-category-badge {
  padding: 2px 8px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
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

.post-image-container {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.post-image {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
}

@media (min-width: 1024px) {
  .post-image {
    height: 280px;
  }
}

.like-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: likeZoom 0.6s ease-out;
  pointer-events: none;
}

.heart-icon {
  width: 80px;
  height: 80px;
  color: white;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

@keyframes likeZoom {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.post-content {
  padding: 16px;
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  gap: 8px;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
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

.post-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.4;
}

.post-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
}

.price {
  font-weight: 700;
  color: var(--primary);
}

.original-price {
  text-decoration: line-through;
  color: var(--secondary);
  font-size: 12px;
}

.post-review {
  font-size: 14px;
  color: var(--secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
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

  .action-left {
    gap: 8px;
  }
}

@media (max-width: 767px) {
  .post-card {
    border-radius: 16px;
  }
}
</style>