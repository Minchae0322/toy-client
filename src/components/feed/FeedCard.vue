<template>
  <article class="post-card" @click="handleCardClick">
    <!-- 컴팩트 Header -->
    <div class="post-header">
      <div class="post-author-info">
        <div class="author-avatar">
          <img v-if="profileImageUrl" :src="profileImageUrl" alt="" />
          <svg v-else class="avatar-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
        </div>
        <span class="author-name">{{ displayNickname }}</span>
        <span class="category-badge">{{ feed.categoryName }}</span>
        <span class="dot">·</span>
        <span class="post-time">{{ formatDate(feed.createdAt) }}</span>
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
          :src="feed.thumbnailUrl?.fileUrl || 'https://via.placeholder.com/400'"
          :alt="feed.productName"
          class="post-image"
          loading="lazy"
      />
      <div v-if="feed.feedEvaluation" class="eval-overlay">
        <span :class="['evaluation-status', getEvaluationClass(feed.feedEvaluation)]">
          <svg class="eval-icon-small" :fill="getEvaluationIconFill(feed.feedEvaluation)" stroke="currentColor" viewBox="0 0 24 24">
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
      <div class="post-actions">
        <div class="action-left">
          <button @click="handleHot" :class="['action-btn', { hot: localIsHot }]" :disabled="isHotLoading">
            <svg class="action-icon" :fill="localIsHot ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
            </svg>
            <span>{{ formatCount(localHotCount) }}</span>
          </button>
          <button @click="handleLike" :class="['action-btn', { liked: localIsLiked }]" :disabled="isLikeLoading">
            <svg class="action-icon" :fill="localIsLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
            <span>{{ formatCount(localLikeCount) }}</span>
          </button>
          <button @click="handleComment" class="action-btn">
            <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span>{{ formatCount(feed.commentCount || 0) }}</span>
          </button>
          <button @click="handleShare" class="action-btn">
            <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>
        </div>
        <button @click="handleSave" :class="['action-btn', 'save-btn', { saved: localIsSaved }]">
          <svg class="action-icon" :fill="localIsSaved ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
      </div>

      <div class="post-info">
        <div class="post-title-row">
          <h3 class="post-title">{{ feed.productName }}</h3>
          <span v-if="feed.price" class="post-price">{{ formatPrice(feed.price) }}</span>
        </div>
        <p v-if="feed.reviewSummary" class="post-review">{{ feed.reviewSummary }}</p>
        <div v-if="feed.price || feed.buyPlace" class="post-details">
          <span v-if="feed.buyPlace" class="store">{{ feed.buyPlace }}</span>
          <span v-if="feed.price" class="buy-price">{{ formatPrice(feed.price) }}</span>
          <span v-if="showDiscount" class="discount">{{ discountRate }}%</span>
        </div>
        <div v-if="feed.hashtags && feed.hashtags.length > 0" class="post-hashtags">
          <span v-for="tag in feed.hashtags" :key="tag" class="hashtag" @click="handleHashtagClick(tag, $event)">#{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <ShareModal
        :visible="showShareModal"
        :title="shareTitle"
        :description="feed.reviewSummary || ''"
        :url="shareUrl"
        :image="shareImage"
        @close="closeShareModal"
    />
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { feedService, feedUtils } from '@/services/FeedService';
import ShareModal from '@/components/common/ShareModal.vue';

const props = defineProps({
  feed: { type: Object, required: true },
  isLiked: { type: Boolean, default: false },
  isHot: { type: Boolean, default: false },
  isSaved: { type: Boolean, default: false }
});

const emit = defineEmits(['like', 'hot', 'save', 'comment', 'menu', 'search-tag', 'update', 'click', 'share']);

const showLikeAnimation = ref(false);
const showShareModal = ref(false);
const isLikeLoading = ref(false);
const isHotLoading = ref(false);

// ========== 반응형 상태 ==========
const localIsLiked = ref(props.feed.userReactions?.hasLike === true);
const localIsHot = ref(props.feed.userReactions?.hasHot === true);
const localIsSaved = ref(props.isSaved);
const localLikeCount = ref(props.feed.likeCount || 0);
const localHotCount = ref(props.feed.hotCount || 0);

// props 변경 시 로컬 상태 동기화
watch(() => props.feed, (newFeed) => {
  localIsLiked.value = newFeed.userReactions?.hasLike === true;
  localIsHot.value = newFeed.userReactions?.hasHot === true;
  localLikeCount.value = newFeed.likeCount || 0;
  localHotCount.value = newFeed.hotCount || 0;
}, { deep: true });

watch(() => props.isLiked, (val) => { localIsLiked.value = val; });
watch(() => props.isHot, (val) => { localIsHot.value = val; });
watch(() => props.isSaved, (val) => { localIsSaved.value = val; });

// ========== 사용자 정보 computed (다양한 필드명 대응) ==========
const profileImageUrl = computed(() => {
  const userInfo = props.feed.userInfo;
  if (!userInfo) return null;

  // 가능한 모든 필드명 체크
  return userInfo.profileImageFile?.fileUrl
      || userInfo.profileImgUrl
      || userInfo.profilePictureUrl
      || userInfo.profilePicture?.fileUrl
      || userInfo.profileImg?.fileUrl
      || null;
});

const displayNickname = computed(() => {
  const userInfo = props.feed.userInfo;
  if (!userInfo) return '익명';

  // 가능한 모든 필드명 체크
  return userInfo.nickname
      || userInfo.nickName
      || userInfo.userName
      || userInfo.username
      || userInfo.name
      || '익명';
});

const discountRate = computed(() => {
  const originalPrice = props.feed.product?.price;
  const buyPrice = props.feed.price;
  if (!originalPrice || !buyPrice || originalPrice <= buyPrice) return 0;
  return Math.round(((originalPrice - buyPrice) / originalPrice) * 100);
});

const showDiscount = computed(() => discountRate.value > 0);

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

  // Optimistic update - 즉시 UI 반영
  const previousIsLiked = localIsLiked.value;
  const previousLikeCount = localLikeCount.value;
  localIsLiked.value = !previousIsLiked;
  localLikeCount.value = previousIsLiked ? Math.max(0, previousLikeCount - 1) : previousLikeCount + 1;

  try {
    isLikeLoading.value = true;
    const response = await feedService.toggleLike(props.feed.feedId);
    if (response.success && response.data) {
      // 서버 응답으로 실제 값 동기화
      localLikeCount.value = response.data.likeCount;
      localHotCount.value = response.data.hotCount;
      localIsLiked.value = response.data.action === 'added';
      emit('update', { feedId: props.feed.feedId, likeCount: response.data.likeCount, hotCount: response.data.hotCount, action: response.data.action, reactionType: 'LIKE' });
    } else {
      // 실패 시 롤백
      localIsLiked.value = previousIsLiked;
      localLikeCount.value = previousLikeCount;
    }
  } catch (error) {
    console.error('❌ LIKE 실패:', error);
    // 에러 시 롤백
    localIsLiked.value = previousIsLiked;
    localLikeCount.value = previousLikeCount;
  } finally {
    isLikeLoading.value = false;
  }
};

const handleHot = async (event) => {
  event.stopPropagation();
  if (isHotLoading.value) return;

  // Optimistic update - 즉시 UI 반영
  const previousIsHot = localIsHot.value;
  const previousHotCount = localHotCount.value;
  localIsHot.value = !previousIsHot;
  localHotCount.value = previousIsHot ? Math.max(0, previousHotCount - 1) : previousHotCount + 1;

  try {
    isHotLoading.value = true;
    const response = await feedService.toggleHot(props.feed.feedId);
    if (response.success && response.data) {
      // 서버 응답으로 실제 값 동기화
      localLikeCount.value = response.data.likeCount;
      localHotCount.value = response.data.hotCount;
      localIsHot.value = response.data.action === 'added';
      emit('update', { feedId: props.feed.feedId, likeCount: response.data.likeCount, hotCount: response.data.hotCount, action: response.data.action, reactionType: 'HOT' });
    } else {
      // 실패 시 롤백
      localIsHot.value = previousIsHot;
      localHotCount.value = previousHotCount;
    }
    emit('hot', props.feed.feedId);
  } catch (error) {
    console.error('❌ HOT 실패:', error);
    // 에러 시 롤백
    localIsHot.value = previousIsHot;
    localHotCount.value = previousHotCount;
  } finally {
    isHotLoading.value = false;
  }
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
const handleShare = (event) => { event.stopPropagation(); showShareModal.value = true; emit('share', props.feed.feedId); };
const closeShareModal = () => { showShareModal.value = false; };

// 공유용 정보
const shareUrl = computed(() => `${window.location.origin}/feed/${props.feed.feedId}`);
const shareImage = computed(() => props.feed.thumbnailUrl?.fileUrl || '');
const shareTitle = computed(() => props.feed.product?.name || props.feed.productNameCustom || props.feed.productName || '');

const formatDate = (dateString) => feedUtils.formatDate(dateString);
const formatPrice = (price) => feedUtils.formatPrice(price);
const formatCount = (count) => feedUtils.formatCount(count);
</script>

<style scoped>
/* 스타일은 기존과 동일 - 생략 */
:root {
  --primary: #0F172A;
  --secondary: #64748B;
  --accent: #F97316;
  --border: #E2E8F0;
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --hover: #F1F5F9;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

.post-card {
  background: var(--card);
  border-radius: 16px;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: all 0.3s;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  cursor: pointer;
}

.post-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
}

.post-author-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.author-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  width: 14px;
  height: 14px;
  color: white;
}

.author-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

.category-badge {
  padding: 2px 6px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.dot { color: var(--secondary); font-size: 10px; }

.post-time {
  font-size: 11px;
  color: var(--secondary);
  white-space: nowrap;
}

.btn-more {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-more:hover { background: var(--hover); }

.more-icon {
  width: 14px;
  height: 14px;
  color: var(--secondary);
}

.post-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  user-select: none;
  overflow: hidden;
  background: #f1f5f9;
}

.post-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.eval-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
}

.evaluation-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.eval-icon-small {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.evaluation-status.eval-best {
  background: rgba(255, 247, 237, 0.85);
  color: #F97316;
  border: 1px solid rgba(253, 186, 116, 0.8);
  backdrop-filter: blur(4px);
}

.evaluation-status.eval-good {
  background: rgba(209, 250, 229, 0.85);
  color: #059669;
  border: 1px solid rgba(110, 231, 183, 0.8);
  backdrop-filter: blur(4px);
}

.evaluation-status.eval-okay {
  background: rgba(219, 234, 254, 0.85);
  color: #2563EB;
  border: 1px solid rgba(147, 197, 253, 0.8);
  backdrop-filter: blur(4px);
}

.evaluation-status.eval-bad {
  background: rgba(254, 226, 226, 0.85);
  color: #DC2626;
  border: 1px solid rgba(252, 165, 165, 0.8);
  backdrop-filter: blur(4px);
}

.like-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: likeZoom 0.6s ease-out;
  pointer-events: none;
  z-index: 2;
}

.heart-anim {
  width: 60px;
  height: 60px;
  color: white;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

@keyframes likeZoom {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}

.post-content { padding: 12px 14px; }

.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.action-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.action-btn:hover:not(:disabled) { background: var(--hover); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.action-btn.liked {
  color: #f43f5e;
  background: #fff1f2;
}
.action-btn.hot {
  color: #ea580c;
  background: #fff7ed;
  border: 1px solid transparent;
}

.action-btn.hot .action-icon {
  color: #ea580c;
}
.action-btn.saved {
  color: #1D4ED8;
  background: rgba(29, 78, 216, 0.1);
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.save-btn { margin-left: auto; }

.post-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.post-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.post-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

.post-price {
  font-size: 12px;
  font-weight: 500;
  color: var(--secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.post-review {
  font-size: 13px;
  color: var(--primary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-details {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}

.store { color: var(--secondary); }
.buy-price { font-weight: 600; color: var(--secondary); }
.discount { padding: 2px 5px; background: #FEE2E2; color: #DC2626; border-radius: 4px; font-size: 10px; font-weight: 700; }

.post-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.hashtag {
  font-size: 11px;
  color: #1D4ED8;
  font-weight: 500;
  cursor: pointer;
}

.hashtag:hover { text-decoration: underline; }

@media (min-width: 1024px) {
  .post-title { font-size: 16px; }
}

@media (max-width: 767px) {
  /* 카드 스타일 제거 - 자연스러운 피드 흐름 */
  .post-card {
    border-radius: 0;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: none;
    background: transparent;
  }

  .post-card:hover {
    box-shadow: none;
    transform: none;
  }

  .post-header { padding: 12px 16px 8px; }
  .author-avatar { width: 32px; height: 32px; }
  .avatar-icon { width: 16px; height: 16px; }
  .author-name { font-size: 13px; max-width: 100px; font-weight: 600; }
  .category-badge { font-size: 10px; padding: 2px 6px; }
  .post-time { font-size: 11px; color: #94A3B8; }
  .more-icon { width: 14px; height: 14px; }

  .post-image-container {
    border-radius: 0;
  }

  .evaluation-status { padding: 5px 10px; font-size: 11px; gap: 4px; }
  .eval-icon-small { width: 14px; height: 14px; }
  .heart-anim { width: 50px; height: 50px; }

  .post-content { padding: 12px 16px 16px; }
  .post-actions {
    border-bottom: none;
    margin-bottom: 8px;
    padding-bottom: 0;
  }
  .action-icon { width: 20px; height: 20px; }
  .action-btn { padding: 4px 6px; font-size: 13px; gap: 4px; }
  .post-title { font-size: 15px; }
  .post-review { font-size: 14px; color: #475569; -webkit-line-clamp: 3; }

  .post-details {
    border-top: none;
    padding-top: 8px;
  }

  .post-hashtags {
    margin-top: 8px;
  }

  .hashtag {
    font-size: 13px;
    color: #6366F1;
  }
}
</style>