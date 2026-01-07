<template>
  <article class="post-card" @click="handleCardClick">
    <div class="post-image-container" @dblclick="handleDoubleTapLike">
      <img
          :src="feed.thumbnailUrl?.fileUrl || 'https://placehold.co/400x300?text=No+Image'"
          :alt="feed.productName"
          class="post-image"
      />
      <div v-if="feed.price" class="price-overlay">
        {{ formatPrice(feed.price) }}
      </div>

      <div v-if="feed.feedEvaluation" class="eval-overlay">
        <span :class="['evaluation-badge', getEvaluationClass(feed.feedEvaluation)]">
          {{ getEvaluationLabel(feed.feedEvaluation) }}
        </span>
      </div>

      <Transition name="heart-pop">
        <div v-if="showLikeAnimation" class="like-animation">
          <svg fill="#9993ea" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
        </div>
      </Transition>
    </div>

    <div class="post-content">
      <div class="header-row">
        <span class="category-tag">{{ feed.categoryName }}</span>
        <span class="post-time">{{ formatDate(feed.createdAt) }}</span>
      </div>

      <h3 class="post-title">{{ feed.productName }}</h3>

      <p class="post-review">{{ feed.reviewSummary }}</p>

      <div v-if="feed.hashtags?.length" class="hashtag-group">
        <span v-for="tag in feed.hashtags.slice(0, 2)" :key="tag" class="hashtag-item">
          #{{ tag }}
        </span>
      </div>

      <div class="post-footer">
        <div class="user-info">
          <img :src="profileImageUrl || '/default-avatar.png'" class="mini-avatar" />
          <span class="nickname">{{ displayNickname }}</span>
        </div>

        <div class="interaction-group">
          <div class="stat-item" :class="{ liked: localIsLiked }" @click.stop="handleLike">
            <svg class="icon" :fill="localIsLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {{ formatCount(localLikeCount) }}
          </div>
          <div class="stat-item" @click.stop="handleComment">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            {{ formatCount(feed.commentCount || 0) }}
          </div>
        </div>
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
  isSaved: { type: Boolean, default: false }
});
const emit = defineEmits(['update', 'click', 'menu', 'comment', 'save']);

const showLikeAnimation = ref(false);
const isLikeLoading = ref(false);
const localIsLiked = ref(props.feed.userReactions?.hasLike === true);
const localLikeCount = ref(props.feed.likeCount || 0);

watch(() => props.feed, (newFeed) => {
  localIsLiked.value = newFeed.userReactions?.hasLike === true;
  localLikeCount.value = newFeed.likeCount || 0;
}, { deep: true });

const profileImageUrl = computed(() => props.feed.userInfo?.profileImageFile?.fileUrl || props.feed.userInfo?.profileImgUrl);
const displayNickname = computed(() => props.feed.userInfo?.nickname || '익명');
const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation);
const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  return { 'BEST': 'eval-best', 'GOOD': 'eval-good', 'OKAY': 'eval-okay', 'BAD': 'eval-bad' }[code] || '';
};

const handleCardClick = () => emit('click', props.feed.feedId);
const handleComment = () => emit('click', props.feed.feedId);

const handleLike = async () => {
  if (isLikeLoading.value) return;
  const prevIsLiked = localIsLiked.value;
  const prevCount = localLikeCount.value;
  localIsLiked.value = !prevIsLiked;
  localLikeCount.value = prevIsLiked ? Math.max(0, prevCount - 1) : prevCount + 1;
  try {
    isLikeLoading.value = true;
    const response = await feedService.toggleLike(props.feed.feedId);
    if (response.success) {
      localLikeCount.value = response.data.likeCount;
      localIsLiked.value = response.data.action === 'added';
      emit('update', { feedId: props.feed.feedId, ...response.data });
    } else {
      localIsLiked.value = prevIsLiked;
      localLikeCount.value = prevCount;
    }
  } catch (e) {
    localIsLiked.value = prevIsLiked;
    localLikeCount.value = prevCount;
  } finally {
    isLikeLoading.value = false;
  }
};

const handleDoubleTapLike = () => {
  if (!localIsLiked.value) {
    handleLike();
    showLikeAnimation.value = true;
    setTimeout(() => { showLikeAnimation.value = false; }, 800);
  }
};

const formatDate = (date) => feedUtils.formatDate(date);
const formatPrice = (price) => feedUtils.formatPrice(price);
const formatCount = (count) => feedUtils.formatCount(count);
</script>

<style scoped>
.post-card {
  background: white; border-radius: 20px; border: 1px solid #f1f1f5;
  overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer; display: flex; flex-direction: column;
}

.post-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); border-color: #9993ea; }

/* Image Area */
.post-image-container { position: relative; width: 100%; aspect-ratio: 1.1 / 1; background: #f8f8fa; overflow: hidden; }
.post-image { width: 100%; height: 100%; object-fit: cover; }

.price-overlay {
  position: absolute; bottom: 12px; right: 12px;
  background: rgba(24, 24, 27, 0.85); color: white;
  padding: 4px 10px; border-radius: 8px; font-size: 13px; font-weight: 800; backdrop-filter: blur(4px);
}

.eval-overlay { position: absolute; top: 12px; left: 12px; }
.evaluation-badge {
  padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 800;
  background: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.eval-best { color: #f59e0b; }
.eval-good { color: #10b981; }
.eval-okay { color: #6366f1; }
.eval-bad { color: #ef4444; }

/* Content Area */
.post-content { padding: 16px; display: flex; flex-direction: column; gap: 8px; }

.header-row { display: flex; justify-content: space-between; align-items: center; }
.category-tag { font-size: 11px; font-weight: 800; color: #9993ea; text-transform: uppercase; }
.post-time { font-size: 11px; color: #a1a1aa; }

.post-title { font-size: 16px; font-weight: 800; color: #18181b; line-height: 1.4;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.post-review { font-size: 13px; color: #52525b; line-height: 1.5; height: 39px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.hashtag-group { display: flex; gap: 6px; }
.hashtag-item { font-size: 12px; color: #71717a; font-weight: 500; }

/* Footer */
.post-footer {
  margin-top: 8px; padding-top: 12px; border-top: 1px solid #f4f4f7;
  display: flex; justify-content: space-between; align-items: center;
}
.user-info { display: flex; align-items: center; gap: 8px; }
.mini-avatar { width: 24px; height: 24px; border-radius: 8px; object-fit: cover; }
.nickname { font-size: 12px; font-weight: 700; color: #3f3f46; }

.interaction-group { display: flex; gap: 12px; }
.stat-item { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: #a1a1aa; cursor: pointer; transition: color 0.2s; }
.stat-item:hover { color: #71717a; }
.stat-item.liked { color: #9993ea; }
.icon { width: 16px; height: 16px; }

/* Heart Animation */
.like-animation { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.like-animation svg { width: 60px; height: 60px; }
.heart-pop-enter-active { animation: heart-in 0.4s ease-out; }
.heart-pop-leave-active { animation: heart-out 0.4s ease-in; }
@keyframes heart-in { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
@keyframes heart-out { 0% { opacity: 1; } 100% { opacity: 0; } }

/* Mobile */
@media (max-width: 768px) {
  .post-card { border-radius: 16px; }
  .post-card:hover { transform: none; }
  .post-card:active { transform: scale(0.98); }
  .post-image-container { aspect-ratio: 4 / 3; }
  .post-content { padding: 12px; gap: 6px; }
  .post-title { font-size: 14px; }
  .post-review { font-size: 12px; height: 36px; }
  .post-footer { margin-top: 6px; padding-top: 10px; }
}
</style>
