<template>
  <article class="post-card" @click="handleCardClick">
    <!-- Header -->
    <div class="post-header">
      <div class="post-author-info">
        <div class="author-avatar">
          <img v-if="profileImageUrl" :src="profileImageUrl" alt="" />
          <svg v-else class="avatar-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
        </div>
        <div class="author-meta">
          <span class="author-name">{{ displayNickname }}</span>
          <div class="meta-row">
            <span class="category-badge">{{ feed.categoryName }}</span>
            <span class="post-time">{{ formatDate(feed.createdAt) }}</span>
          </div>
        </div>
      </div>
      <button class="btn-more" @click="handleMenu">
        <svg class="more-icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
      </button>
    </div>

    <!-- Image -->
    <div class="post-image-container" @dblclick="handleDoubleTapLike">
      <img
          :src="feed.thumbnailUrl?.fileUrl || 'https://placehold.co/400x300?text=No+Image'"
          :alt="feed.productName"
          class="post-image"
          loading="lazy"
      />
      <div v-if="feed.feedEvaluation" class="eval-overlay">
        <span :class="['evaluation-badge', getEvaluationClass(feed.feedEvaluation)]">
          <svg class="eval-icon" :fill="getEvaluationIconFill(feed.feedEvaluation)" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getEvaluationIconPath(feed.feedEvaluation)"/>
          </svg>
          {{ getEvaluationLabel(feed.feedEvaluation) }}
        </span>
      </div>
      <div v-if="showLikeAnimation" class="like-animation">
        <svg class="heart-anim" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="post-content">
      <div class="post-info">
        <h3 class="post-title">{{ feed.productName }}</h3>
        <p v-if="feed.reviewSummary" class="post-review">{{ feed.reviewSummary }}</p>
        <div v-if="feed.price || feed.buyPlace" class="post-details">
          <span v-if="feed.buyPlace" class="store">{{ feed.buyPlace }}</span>
          <span v-if="feed.price" class="buy-price">{{ formatPrice(feed.price) }}</span>
        </div>
      </div>

      <div class="post-actions">
        <div class="action-left">
          <button @click="handleHot" :class="['action-btn', { active: localIsHot }]" :disabled="isHotLoading">
            <svg class="action-icon" :fill="localIsHot ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
            </svg>
            <span>{{ formatCount(localHotCount) }}</span>
          </button>
          <button @click="handleLike" :class="['action-btn', { active: localIsLiked }]" :disabled="isLikeLoading">
            <svg class="action-icon" :fill="localIsLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
            <span>{{ formatCount(localLikeCount) }}</span>
          </button>
          <button @click="handleComment" class="action-btn">
            <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span>{{ formatCount(feed.commentCount || 0) }}</span>
          </button>
        </div>
        <button @click="handleSave" :class="['action-btn save-btn', { active: localIsSaved }]">
          <svg class="action-icon" :fill="localIsSaved ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
      </div>

      <div v-if="feed.hashtags && feed.hashtags.length > 0" class="post-hashtags">
        <span v-for="tag in feed.hashtags.slice(0, 4)" :key="tag" class="hashtag" @click="handleHashtagClick(tag, $event)">#{{ tag }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { feedService, feedUtils } from '@/services/FeedService';

const props = defineProps({
  feed: { type: Object, required: true },
  isLiked: { type: Boolean, default: false },
  isHot: { type: Boolean, default: false },
  isSaved: { type: Boolean, default: false }
});

const emit = defineEmits(['like', 'hot', 'save', 'comment', 'menu', 'search-tag', 'update', 'click', 'share']);

const showLikeAnimation = ref(false);
const isLikeLoading = ref(false);
const isHotLoading = ref(false);

const localIsLiked = ref(props.feed.userReactions?.hasLike === true);
const localIsHot = ref(props.feed.userReactions?.hasHot === true);
const localIsSaved = ref(props.isSaved);
const localLikeCount = ref(props.feed.likeCount || 0);
const localHotCount = ref(props.feed.hotCount || 0);

watch(() => props.feed, (newFeed) => {
  localIsLiked.value = newFeed.userReactions?.hasLike === true;
  localIsHot.value = newFeed.userReactions?.hasHot === true;
  localLikeCount.value = newFeed.likeCount || 0;
  localHotCount.value = newFeed.hotCount || 0;
}, { deep: true });

watch(() => props.isSaved, (val) => { localIsSaved.value = val; });

const profileImageUrl = computed(() => {
  const userInfo = props.feed.userInfo;
  if (!userInfo) return null;
  return userInfo.profileImageFile?.fileUrl || userInfo.profileImgUrl || null;
});

const displayNickname = computed(() => {
  const userInfo = props.feed.userInfo;
  return userInfo?.nickname || userInfo?.nickName || '익명';
});

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

const handleCardClick = (event) => {
  if (event.target.closest('.action-btn') || event.target.closest('.btn-more') || event.target.closest('.hashtag')) return;
  emit('click', props.feed.feedId);
};

const handleLike = async (event) => {
  event.stopPropagation();
  if (isLikeLoading.value) return;
  const prev = localIsLiked.value;
  const prevCount = localLikeCount.value;
  localIsLiked.value = !prev;
  localLikeCount.value = prev ? Math.max(0, prevCount - 1) : prevCount + 1;
  try {
    isLikeLoading.value = true;
    const response = await feedService.toggleLike(props.feed.feedId);
    if (response.success && response.data) {
      localLikeCount.value = response.data.likeCount;
      localHotCount.value = response.data.hotCount;
      localIsLiked.value = response.data.action === 'added';
      emit('update', { feedId: props.feed.feedId, likeCount: response.data.likeCount, hotCount: response.data.hotCount, action: response.data.action, reactionType: 'LIKE' });
    } else { localIsLiked.value = prev; localLikeCount.value = prevCount; }
  } catch { localIsLiked.value = prev; localLikeCount.value = prevCount; }
  finally { isLikeLoading.value = false; }
};

const handleHot = async (event) => {
  event.stopPropagation();
  if (isHotLoading.value) return;
  const prev = localIsHot.value;
  const prevCount = localHotCount.value;
  localIsHot.value = !prev;
  localHotCount.value = prev ? Math.max(0, prevCount - 1) : prevCount + 1;
  try {
    isHotLoading.value = true;
    const response = await feedService.toggleHot(props.feed.feedId);
    if (response.success && response.data) {
      localLikeCount.value = response.data.likeCount;
      localHotCount.value = response.data.hotCount;
      localIsHot.value = response.data.action === 'added';
      emit('update', { feedId: props.feed.feedId, likeCount: response.data.likeCount, hotCount: response.data.hotCount, action: response.data.action, reactionType: 'HOT' });
    } else { localIsHot.value = prev; localHotCount.value = prevCount; }
  } catch { localIsHot.value = prev; localHotCount.value = prevCount; }
  finally { isHotLoading.value = false; }
};

const handleDoubleTapLike = () => {
  if (!localIsLiked.value) {
    handleLike({ stopPropagation: () => {} });
    showLikeAnimation.value = true;
    setTimeout(() => { showLikeAnimation.value = false; }, 600);
  }
};

const handleSave = (event) => { event.stopPropagation(); localIsSaved.value = !localIsSaved.value; emit('save', props.feed.feedId); };
const handleComment = (event) => { event.stopPropagation(); emit('comment', props.feed.feedId); };
const handleMenu = (event) => { event.stopPropagation(); emit('menu', props.feed.feedId); };
const handleHashtagClick = (tag, event) => { event.stopPropagation(); emit('search-tag', tag); };

const formatDate = (dateString) => feedUtils.formatDate(dateString);
const formatPrice = (price) => feedUtils.formatPrice(price);
const formatCount = (count) => feedUtils.formatCount(count);
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.post-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.post-card:hover {
  border-color: #d0d0d0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* Header */
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f5f5f5;
}

.post-author-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.author-avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-icon { width: 18px; height: 18px; color: #999; }

.author-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.author-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-row { display: flex; align-items: center; gap: 6px; }

.category-badge {
  padding: 2px 7px;
  background: #f5f5f5;
  color: #666;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid #ebebeb;
}

.post-time { font-size: 11px; color: #999; }

.btn-more {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-more:hover { background: #f5f5f5; }
.more-icon { width: 16px; height: 16px; color: #999; }

/* Image */
.post-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #fafafa;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card:hover .post-image { transform: scale(1.02); }

.eval-overlay { position: absolute; top: 10px; left: 10px; }

.evaluation-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.3);
}

.eval-icon { width: 14px; height: 14px; }

.evaluation-badge.eval-best { background: rgba(255,237,213,0.95); color: #ea580c; }
.evaluation-badge.eval-good { background: rgba(220,252,231,0.95); color: #16a34a; }
.evaluation-badge.eval-okay { background: rgba(224,231,255,0.95); color: #4f46e5; }
.evaluation-badge.eval-bad { background: rgba(254,226,226,0.95); color: #dc2626; }

.like-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: heartPop 0.6s ease-out forwards;
  pointer-events: none;
}

.heart-anim { width: 56px; height: 56px; color: white; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3)); }

@keyframes heartPop {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}

/* Content */
.post-content { padding: 14px; }

.post-info { margin-bottom: 12px; }

.post-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-review {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.post-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.store { color: #999; }

.buy-price {
  font-weight: 600;
  color: #1a1a1a;
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 4px;
}

/* Actions */
.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-left { display: flex; align-items: center; gap: 2px; }

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover:not(:disabled) { background: #f5f5f5; color: #333; }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.action-btn.active { color: #f59e0b; background: #fffbeb; }
.action-btn.save-btn.active { color: #6366f1; background: #eef2ff; }

.action-icon { width: 18px; height: 18px; }

/* Hashtags */
.post-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.hashtag {
  font-size: 12px;
  color: #6366f1;
  font-weight: 500;
  padding: 4px 8px;
  background: #f5f5ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid #ebebff;
}

.hashtag:hover { background: #eef2ff; border-color: #dde4ff; }

/* ===== Mobile ===== */
@media (max-width: 767px) {
  .post-card {
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .post-card:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }

  .post-header { padding: 10px 12px; }

  .author-avatar { width: 32px; height: 32px; border-radius: 8px; }
  .avatar-icon { width: 16px; height: 16px; }
  .author-name { font-size: 12px; }
  .category-badge { font-size: 10px; padding: 2px 5px; }
  .post-time { font-size: 10px; }

  .post-image-container { aspect-ratio: 16 / 10; }

  .evaluation-badge { padding: 4px 8px; font-size: 10px; }
  .eval-icon { width: 12px; height: 12px; }

  .post-content { padding: 12px; }
  .post-title { font-size: 14px; }
  .post-review { font-size: 12px; -webkit-line-clamp: 2; }

  .action-btn { padding: 5px 8px; font-size: 11px; }
  .action-icon { width: 16px; height: 16px; }

  .hashtag { font-size: 11px; padding: 3px 6px; }
}
</style>