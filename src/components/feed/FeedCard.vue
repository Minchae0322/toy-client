<template>
  <article class="feed-card" @click="handleCardClick">
    <!-- Header -->
    <div class="feed-header">
      <div class="header-left">
        <div class="avatar">
          <img v-if="profileImageUrl" :src="profileImageUrl" alt="" />
          <span v-else class="avatar-initial">{{ displayNickname[0] }}</span>
        </div>
        <span class="nickname">{{ displayNickname }}</span>
        <span class="category-badge">{{ feed.categoryName }}</span>
        <span class="time-dot">{{ formatDate(feed.createdAt) }}</span>
      </div>
      <button class="btn-more" @click="handleMenu">
        <svg class="more-icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
      </button>
    </div>

    <!-- Image -->
    <div class="feed-image" @dblclick="handleDoubleTapLike">
      <img
          :src="feed.thumbnailUrl?.fileUrl || 'https://placehold.co/400x300?text=No+Image'"
          :alt="feed.productName"
          loading="lazy"
      />
      <!-- Evaluation Badge -->
      <div v-if="feed.feedEvaluation" class="eval-badge-wrap">
        <span :class="['eval-badge', evalStyle.bg, evalStyle.text, evalStyle.border]">
          {{ getEvalLabel(feed.feedEvaluation) }}
        </span>
      </div>
      <!-- Thread Indicator -->
      <div v-if="feed.threadReviews?.length > 0" class="thread-indicator">
        <svg class="thread-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        {{ feed.threadReviews.length }}개의 후속 리뷰
      </div>
      <!-- Like Animation -->
      <div v-if="showLikeAnimation" class="like-animation">
        <svg class="heart-anim" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="feed-content">
      <!-- Actions -->
      <div class="feed-actions">
        <div class="action-left">
          <button @click="handleHot" :class="['action-btn', { active: localIsHot }]" :disabled="isHotLoading">
            <svg class="action-icon" :fill="localIsHot ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
            </svg>
            {{ formatCount(localHotCount) }}
          </button>
          <button @click="handleLike" :class="['action-btn', { active: localIsLiked }]" :disabled="isLikeLoading">
            <svg class="action-icon" :fill="localIsLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
            {{ formatCount(localLikeCount) }}
          </button>
          <button @click="handleComment" class="action-btn">
            <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            {{ feed.commentCount || 0 }}
          </button>
        </div>
        <button @click="handleSave" :class="['action-btn save-btn', { active: localIsSaved }]">
          <svg class="action-icon" :fill="localIsSaved ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
      </div>

      <!-- Info -->
      <div class="feed-info">
        <div class="info-row">
          <h3 class="product-name">{{ feed.productName }}</h3>
          <span v-if="displayPrice" class="price">{{ formatPrice(displayPrice) }}</span>
        </div>
        <p v-if="feed.reviewSummary" class="review-summary">{{ feed.reviewSummary }}</p>
        <div v-if="feed.hashtags?.length > 0" class="hashtags">
          <span
            v-for="tag in feed.hashtags.slice(0, 4)"
            :key="tag"
            class="hashtag"
            @click="handleHashtagClick(tag, $event)"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Thread Section -->
    <div v-if="feed.threadReviews?.length > 0 && showThread" class="thread-section">
      <!-- Thread Header -->
      <button class="thread-header" @click.stop="toggleThread">
        <div class="thread-title">
          <div class="thread-bar"></div>
          <span class="thread-label">후속 리뷰</span>
          <span class="thread-count">{{ feed.threadReviews.length }}</span>
        </div>
        <svg :class="['chevron', { expanded: showThread }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <!-- Thread Items -->
      <div class="thread-list">
        <div class="timeline-line"></div>
        <div class="thread-items">
          <div
            v-for="review in visibleThreads"
            :key="review.id"
            class="thread-item"
          >
            <div :class="['timeline-dot', getThreadEvalStyle(review.evaluation).dot]"></div>
            <div class="thread-card">
              <div class="thread-card-header">
                <span :class="['thread-eval', getThreadEvalStyle(review.evaluation).bg, getThreadEvalStyle(review.evaluation).text]">
                  {{ getEvalLabel(review.evaluation) }}
                </span>
                <span class="thread-time">{{ review.daysAgo }}일 전</span>
                <span class="thread-likes">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {{ review.likeCount }}
                </span>
              </div>
              <p class="thread-content">{{ review.content }}</p>
            </div>
          </div>
        </div>

        <!-- Show More -->
        <button
          v-if="feed.threadReviews.length > 2"
          class="show-more-btn"
          @click.stop="toggleExpanded"
        >
          <span>{{ expandedThread ? '접기' : `${feed.threadReviews.length - 2}개 더 보기` }}</span>
          <svg :class="['show-more-chevron', { expanded: expandedThread }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Collapsed Thread Toggle -->
    <button
      v-if="feed.threadReviews?.length > 0 && !showThread"
      class="thread-collapsed"
      @click.stop="toggleThread"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
      후속 리뷰 {{ feed.threadReviews.length }}개 보기
    </button>
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
const showThread = ref(true);
const expandedThread = ref(false);

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

const displayPrice = computed(() => props.feed.buyPrice || props.feed.price || null);

const visibleThreads = computed(() => {
  if (!props.feed.threadReviews) return [];
  return expandedThread.value ? props.feed.threadReviews : props.feed.threadReviews.slice(0, 2);
});

const evalStyle = computed(() => getEvalStyle(props.feed.feedEvaluation));

const getEvalStyle = (eval_) => {
  const code = typeof eval_ === 'string' ? eval_ : eval_?.code;
  return {
    BEST: { bg: 'bg-amber', text: 'text-amber', border: 'border-amber', dot: 'dot-amber' },
    GOOD: { bg: 'bg-emerald', text: 'text-emerald', border: 'border-emerald', dot: 'dot-emerald' },
    OKAY: { bg: 'bg-sky', text: 'text-sky', border: 'border-sky', dot: 'dot-sky' },
    BAD: { bg: 'bg-rose', text: 'text-rose', border: 'border-rose', dot: 'dot-rose' }
  }[code] || { bg: 'bg-slate', text: 'text-slate', border: 'border-slate', dot: 'dot-slate' };
};

const getThreadEvalStyle = (eval_) => getEvalStyle(eval_);

const getEvalLabel = (e) => {
  const code = typeof e === 'string' ? e : e?.code;
  return { BEST: '최고예요', GOOD: '좋아요', OKAY: '괜찮아요', BAD: '별로예요' }[code] || '';
};

const handleCardClick = (event) => {
  if (event.target.closest('.action-btn') || event.target.closest('.btn-more') ||
      event.target.closest('.hashtag') || event.target.closest('.thread-header') ||
      event.target.closest('.show-more-btn') || event.target.closest('.thread-collapsed')) return;
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
const toggleThread = () => { showThread.value = !showThread.value; };
const toggleExpanded = () => { expandedThread.value = !expandedThread.value; };

const formatDate = (dateString) => feedUtils.formatDate(dateString);
const formatPrice = (price) => feedUtils.formatPrice(price);
const formatCount = (count) => feedUtils.formatCount(count);
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.feed-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.feed-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Header */
.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(to bottom, rgba(248, 250, 252, 0.5), transparent);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #ffffff;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.nickname {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.category-badge {
  padding: 2px 8px;
  background: linear-gradient(to right, #eef2ff, #f5f3ff);
  color: #4f46e5;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.time-dot {
  font-size: 12px;
  color: #94a3b8;
}

.time-dot::before {
  content: '· ';
}

.btn-more {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-more:hover {
  background: rgba(241, 245, 249, 0.8);
}

.more-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

/* Image */
.feed-image {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f1f5f9;
}

.feed-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.eval-badge-wrap {
  position: absolute;
  top: 12px;
  left: 12px;
}

.eval-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  border-width: 1px;
  border-style: solid;
}

/* Evaluation Colors */
.bg-amber { background: rgb(254, 243, 199); }
.text-amber { color: #d97706; }
.border-amber { border-color: rgba(253, 230, 138, 0.6); }

.bg-emerald { background: rgb(209, 250, 229); }
.text-emerald { color: #059669; }
.border-emerald { border-color: rgba(167, 243, 208, 0.6); }

.bg-sky { background: rgb(224, 242, 254); }
.text-sky { color: #0284c7; }
.border-sky { border-color: rgba(186, 230, 253, 0.6); }

.bg-rose { background: rgb(254, 226, 226); }
.text-rose { color: #e11d48; }
.border-rose { border-color: rgba(254, 205, 211, 0.6); }

.bg-slate { background: rgb(241, 245, 249); }
.text-slate { color: #475569; }
.border-slate { border-color: rgba(226, 232, 240, 1); }

/* Thread Indicator */
.thread-indicator {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.thread-icon {
  width: 14px;
  height: 14px;
}

/* Like Animation */
.like-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: heartPop 0.6s ease-out forwards;
  pointer-events: none;
}

.heart-anim {
  width: 56px;
  height: 56px;
  color: white;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

@keyframes heartPop {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}

/* Content */
.feed-content {
  padding: 16px;
}

/* Actions */
.feed-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 4px;
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
  font-weight: 500;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover:not(:disabled) {
  background: #f8fafc;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.active {
  background: linear-gradient(to right, #fef3c7, #ffedd5);
  color: #f97316;
}

.action-btn.save-btn.active {
  background: linear-gradient(to right, #eef2ff, #f5f3ff);
  color: #6366f1;
}

.action-icon {
  width: 18px;
  height: 18px;
}

/* Info */
.feed-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  flex-shrink: 0;
  margin-left: 12px;
}

.review-summary {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 4px;
}

.hashtag {
  padding: 4px 10px;
  background: linear-gradient(to right, #e0f2fe, #cffafe);
  color: #0284c7;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.hashtag:hover {
  background: linear-gradient(to right, #bae6fd, #a5f3fc);
}

/* Thread Section */
.thread-section {
  border-top: 1px solid #f1f5f9;
}

.thread-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.thread-header:hover {
  background: rgba(248, 250, 252, 0.5);
}

.thread-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.thread-bar {
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, #a78bfa, #8b5cf6);
  border-radius: 2px;
}

.thread-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.thread-count {
  padding: 2px 8px;
  background: #f5f3ff;
  color: #7c3aed;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.chevron {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  transition: transform 0.2s;
}

.chevron.expanded {
  transform: rotate(180deg);
}

/* Thread List */
.thread-list {
  position: relative;
  padding: 0 16px 16px;
}

.timeline-line {
  position: absolute;
  left: 27px;
  top: 0;
  bottom: 16px;
  width: 2px;
  background: linear-gradient(to bottom, #c4b5fd, #ddd6fe, #f1f5f9);
  border-radius: 1px;
}

.thread-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thread-item {
  position: relative;
  padding-left: 32px;
}

.timeline-dot {
  position: absolute;
  left: 7px;
  top: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px #ffffff;
}

.dot-amber { background: #fbbf24; }
.dot-emerald { background: #34d399; }
.dot-sky { background: #38bdf8; }
.dot-rose { background: #fb7185; }
.dot-slate { background: #94a3b8; }

.thread-card {
  padding: 14px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8), #ffffff);
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.15s;
  cursor: pointer;
}

.thread-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.thread-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.thread-eval {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}

.thread-time {
  font-size: 12px;
  color: #94a3b8;
}

.thread-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  font-size: 12px;
  color: #94a3b8;
}

.thread-likes svg {
  width: 12px;
  height: 12px;
}

.thread-content {
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.thread-card:hover .thread-content {
  -webkit-line-clamp: unset;
}

/* Show More Button */
.show-more-btn {
  position: relative;
  margin-left: 32px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 500;
  color: #7c3aed;
  cursor: pointer;
  transition: color 0.15s;
}

.show-more-btn:hover {
  color: #6d28d9;
}

.show-more-chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
}

.show-more-chevron.expanded {
  transform: rotate(180deg);
}

/* Collapsed Thread Toggle */
.thread-collapsed {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
  background: transparent;
  border-left: none;
  border-right: none;
  border-bottom: none;
  font-size: 14px;
  font-weight: 500;
  color: #7c3aed;
  cursor: pointer;
  transition: background 0.15s;
}

.thread-collapsed:hover {
  background: rgba(245, 243, 255, 0.5);
}

.thread-collapsed svg {
  width: 16px;
  height: 16px;
}

/* Mobile */
@media (max-width: 767px) {
  .feed-card {
    border-radius: 16px;
  }

  .feed-header {
    padding: 10px 12px;
  }

  .avatar {
    width: 28px;
    height: 28px;
  }

  .avatar-initial {
    font-size: 12px;
  }

  .nickname {
    font-size: 13px;
  }

  .category-badge {
    font-size: 11px;
    padding: 2px 6px;
  }

  .time-dot {
    font-size: 11px;
  }

  .feed-image {
    aspect-ratio: 16 / 10;
  }

  .eval-badge {
    padding: 4px 10px;
    font-size: 11px;
  }

  .thread-indicator {
    padding: 4px 8px;
    font-size: 11px;
  }

  .feed-content {
    padding: 12px;
  }

  .action-btn {
    padding: 5px 8px;
    font-size: 13px;
  }

  .action-icon {
    width: 16px;
    height: 16px;
  }

  .product-name {
    font-size: 15px;
  }

  .price {
    font-size: 13px;
  }

  .review-summary {
    font-size: 13px;
  }

  .hashtag {
    font-size: 11px;
    padding: 3px 8px;
  }

  .thread-header {
    padding: 10px 12px;
  }

  .thread-label {
    font-size: 13px;
  }

  .thread-list {
    padding: 0 12px 12px;
  }

  .timeline-line {
    left: 23px;
  }

  .thread-item {
    padding-left: 28px;
  }

  .timeline-dot {
    left: 3px;
  }

  .thread-card {
    padding: 12px;
  }

  .thread-content {
    font-size: 13px;
  }

  .show-more-btn {
    margin-left: 28px;
  }
}
</style>
