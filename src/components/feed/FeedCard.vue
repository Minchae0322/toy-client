<template>
  <article class="post-card" @click="handleCardClick">
    <!-- Header -->
    <div class="post-header">
      <div class="post-author-info">
        <div class="author-avatar-small">
          <img v-if="feed.userInfo?.profileImageUrl" :src="feed.userInfo.profileImageUrl" alt="" />
          <span v-else class="avatar-placeholder">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
          </span>
        </div>
        <div class="author-details">
          <div class="author-name-row">
            <span class="author-name">{{ feed.userInfo?.nickname || '익명' }}</span>
            <span class="author-level-badge">
              <svg class="level-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </span>
          </div>
          <div class="post-meta">
            <span>{{ formatDate(feed.createdAt) }}</span>
            <span class="meta-dot">·</span>
            <span class="post-category-badge">{{ feed.categoryName }}</span>
          </div>
        </div>
      </div>
      <button class="btn-more" @click="handleMenu">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
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
      <!-- 🔥 Evaluation Badge Overlay -->
      <div v-if="feed.feedEvaluation" class="evaluation-badge-overlay">
        <span :class="['evaluation-badge', getEvaluationClass(feed.feedEvaluation)]">
          <svg class="eval-icon" :fill="getEvaluationIconFill(feed.feedEvaluation)" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getEvaluationIconPath(feed.feedEvaluation)"/>
          </svg>
          {{ getEvaluationLabel(feed.feedEvaluation) }}
        </span>
      </div>
      <div v-if="showLikeAnimation" class="like-animation">
        <svg class="heart-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="post-content">
      <!-- Actions -->
      <div class="post-actions">
        <div class="action-left">
          <!-- LIKE 버튼 -->
          <button
              @click="handleLike"
              :class="['action-btn', { liked: localIsLiked }]"
              :disabled="isLoading"
          >
            <svg class="icon fire-icon" :fill="localIsLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
            </svg>
            <span>{{ formatCount(localLikeCount) }}</span>
          </button>

          <!-- HOT 버튼 -->
          <button
              @click="handleHot"
              :class="['action-btn', { hot: localIsHot }]"
              :disabled="isLoading"
          >
            <svg class="icon" :fill="localIsHot ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <span>{{ formatCount(localHotCount) }}</span>
          </button>

          <!-- 댓글 버튼 -->
          <button @click="handleComment" class="action-btn">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span>{{ formatCount(feed.commentCount || 0) }}</span>
          </button>
        </div>

        <!-- 저장 버튼 -->
        <button
            @click="handleSave"
            :class="['action-btn', 'save', { saved: localIsSaved }]"
            :disabled="isLoading"
        >
          <svg class="icon" :fill="localIsSaved ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
      </div>

      <!-- Info -->
      <div class="post-info">
        <!-- 🔥 제목 + Evaluation Badge -->
        <div class="post-title-row">
          <h3 class="post-title">{{ feed.productName }}</h3>
          <span v-if="feed.feedEvaluation" :class="['evaluation-status', getEvaluationClass(feed.feedEvaluation)]">
            <svg class="eval-icon-small" :fill="getEvaluationIconFill(feed.feedEvaluation)" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getEvaluationIconPath(feed.feedEvaluation)"/>
            </svg>
            {{ getEvaluationLabel(feed.feedEvaluation) }}
          </span>
        </div>

        <!-- 리뷰 -->
        <p v-if="feed.reviewSummary" class="post-review">{{ feed.reviewSummary }}</p>

        <!-- 가격 정보 -->
        <div v-if="feed.price || feed.buyPlace" class="post-details">
          <span v-if="feed.buyPlace" class="store">{{ feed.buyPlace }}</span>
          <span v-if="feed.price" class="price">{{ formatPrice(feed.price) }}</span>
          <span v-if="showDiscount" class="discount">{{ discountRate }}%</span>
        </div>

        <!-- 해시태그 -->
        <div v-if="feed.hashtags && feed.hashtags.length > 0" class="post-hashtags">
          <span v-for="tag in feed.hashtags" :key="tag" class="hashtag" @click="handleHashtagClick(tag, $event)">
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue';
import { feedService, feedUtils } from '@/services/FeedService';

const props = defineProps({
  feed: {
    type: Object,
    required: true
  },
  isLiked: {
    type: Boolean,
    default: false
  },
  isHot: {
    type: Boolean,
    default: false
  },
  isSaved: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'like', 'hot', 'save', 'comment', 'menu', 'search-tag', 'update', 'click'
]);

const showLikeAnimation = ref(false);
const isLoading = ref(false);

// ⭐ 초기 상태를 feed.userReactions에서 가져옴
const localIsLiked = ref(props.feed.userReactions?.hasLike || props.isLiked);
const localIsHot = ref(props.feed.userReactions?.hasHot || props.isHot);
const localIsSaved = ref(props.isSaved);

// ⭐ likeCount, hotCount 직접 접근
const localLikeCount = ref(props.feed.likeCount || 0);
const localHotCount = ref(props.feed.hotCount || 0);

const discountRate = computed(() => {
  const originalPrice = props.feed.product?.price;
  const buyPrice = props.feed.price;

  if (!originalPrice || !buyPrice) return 0;
  if (originalPrice <= buyPrice) return 0;

  return Math.round(((originalPrice - buyPrice) / originalPrice) * 100);
});

const showDiscount = computed(() => discountRate.value > 0);

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

const handleCardClick = (event) => {
  if (
      event.target.closest('.action-btn') ||
      event.target.closest('.btn-more') ||
      event.target.closest('.hashtag')
  ) {
    return;
  }

  console.log('🎯 카드 클릭:', props.feed.feedId);
  emit('click', props.feed.feedId);
};

// ⭐ 백엔드 응답 구조 반영
const handleLike = async (event) => {
  event.stopPropagation();
  if (isLoading.value) return;

  const prevIsLiked = localIsLiked.value;
  const prevIsHot = localIsHot.value;
  const prevLikeCount = localLikeCount.value;
  const prevHotCount = localHotCount.value;

  // 낙관적 업데이트
  localIsLiked.value = !localIsLiked.value;
  localLikeCount.value += localIsLiked.value ? 1 : -1;

  // LIKE 추가 시 HOT 제거 (백엔드 로직)
  if (localIsLiked.value && localIsHot.value) {
    localIsHot.value = false;
    localHotCount.value = Math.max(0, localHotCount.value - 1);
  }

  try {
    isLoading.value = true;
    const response = await feedService.toggleLike(props.feed.feedId);

    if (response.success && response.data) {
      // ⭐ 백엔드 응답으로 정확한 상태 동기화
      // response.data = { reactionType, action, message, likeCount, hotCount }
      localLikeCount.value = response.data.likeCount;
      localHotCount.value = response.data.hotCount;

      // action 기반 상태 업데이트
      if (response.data.action === 'added') {
        localIsLiked.value = true;
        localIsHot.value = false;
      } else if (response.data.action === 'removed') {
        localIsLiked.value = false;
      } else if (response.data.action === 'changed') {
        // HOT에서 LIKE로 변경
        localIsLiked.value = true;
        localIsHot.value = false;
      }

      emit('update', {
        feedId: props.feed.feedId,
        likeCount: response.data.likeCount,
        hotCount: response.data.hotCount
      });

      console.log('✅ LIKE 완료:', response.data);
    }

    emit('like', props.feed.feedId);
  } catch (error) {
    console.error('❌ LIKE 실패:', error);
    // 롤백
    localIsLiked.value = prevIsLiked;
    localIsHot.value = prevIsHot;
    localLikeCount.value = prevLikeCount;
    localHotCount.value = prevHotCount;
  } finally {
    isLoading.value = false;
  }
};

const handleHot = async (event) => {
  event.stopPropagation();
  if (isLoading.value) return;

  const prevIsLiked = localIsLiked.value;
  const prevIsHot = localIsHot.value;
  const prevLikeCount = localLikeCount.value;
  const prevHotCount = localHotCount.value;

  // 낙관적 업데이트
  localIsHot.value = !localIsHot.value;
  localHotCount.value += localIsHot.value ? 1 : -1;

  // HOT 추가 시 LIKE 제거 (백엔드 로직)
  if (localIsHot.value && localIsLiked.value) {
    localIsLiked.value = false;
    localLikeCount.value = Math.max(0, localLikeCount.value - 1);
  }

  try {
    isLoading.value = true;
    const response = await feedService.toggleHot(props.feed.feedId);

    if (response.success && response.data) {
      // ⭐ 백엔드 응답으로 정확한 상태 동기화
      // response.data = { reactionType, action, message, likeCount, hotCount }
      localLikeCount.value = response.data.likeCount;
      localHotCount.value = response.data.hotCount;

      // action 기반 상태 업데이트
      if (response.data.action === 'added') {
        localIsHot.value = true;
        localIsLiked.value = false;
      } else if (response.data.action === 'removed') {
        localIsHot.value = false;
      } else if (response.data.action === 'changed') {
        // LIKE에서 HOT으로 변경
        localIsHot.value = true;
        localIsLiked.value = false;
      }

      emit('update', {
        feedId: props.feed.feedId,
        likeCount: response.data.likeCount,
        hotCount: response.data.hotCount
      });

      console.log('✅ HOT 완료:', response.data);
    }

    emit('hot', props.feed.feedId);
  } catch (error) {
    console.error('❌ HOT 실패:', error);
    // 롤백
    localIsLiked.value = prevIsLiked;
    localIsHot.value = prevIsHot;
    localLikeCount.value = prevLikeCount;
    localHotCount.value = prevHotCount;
  } finally {
    isLoading.value = false;
  }
};

const handleDoubleTapLike = () => {
  if (!localIsLiked.value) {
    const mockEvent = { stopPropagation: () => {} };
    handleLike(mockEvent);
    showLikeAnimation.value = true;
    setTimeout(() => {
      showLikeAnimation.value = false;
    }, 600);
  }
};

const handleSave = (event) => {
  event.stopPropagation();
  localIsSaved.value = !localIsSaved.value;
  emit('save', props.feed.feedId);
};

const handleComment = (event) => {
  event.stopPropagation();
  emit('comment', props.feed.feedId);
};

const handleMenu = (event) => {
  event.stopPropagation();
  emit('menu', props.feed.feedId);
};

const handleHashtagClick = (tag, event) => {
  event.stopPropagation();
  emit('search-tag', tag);
};

const formatDate = (dateString) => {
  return feedUtils.formatDate(dateString);
};

const formatPrice = (price) => {
  return feedUtils.formatPrice(price);
};

const formatCount = (count) => {
  return feedUtils.formatCount(count);
};
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #0F172A;
  --secondary: #64748B;
  --accent: #F97316;
  --border: #E2E8F0;
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --hover: #F1F5F9;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.post-card {
  background: var(--card);
  border-radius: 20px;
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
  padding: 16px;
}

.post-author-info {
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

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.author-level-badge {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.level-icon {
  width: 16px;
  height: 16px;
  color: #F59E0B;
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

.post-image-container {
  position: relative;
  width: 100%;
  user-select: none;
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

.evaluation-badge-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
}

.evaluation-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.eval-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  stroke-width: 2;
}

.evaluation-badge.eval-best {
  background: rgba(249, 115, 22, 0.95);
  color: white;
}

.evaluation-badge.eval-good {
  background: rgba(16, 185, 129, 0.95);
  color: white;
}

.evaluation-badge.eval-okay {
  background: rgba(59, 130, 246, 0.95);
  color: white;
}

.evaluation-badge.eval-bad {
  background: rgba(239, 68, 68, 0.95);
  color: white;
}

.post-card:hover .evaluation-badge {
  transform: scale(1.05);
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
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  gap: 4px;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 6px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  flex-shrink: 0;
}

.action-btn:hover:not(:disabled) {
  background: var(--hover);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.liked {
  color: var(--accent);
}

.action-btn.hot {
  color: #DC2626;
}

.action-btn .icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  flex-shrink: 0;
}

.action-btn .fire-icon {
  width: 19px;
  height: 19px;
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

.post-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.4;
  letter-spacing: -0.3px;
  flex: 0 1 auto;
}

@media (min-width: 768px) {
  .post-title {
    font-size: 18px;
  }
}

.evaluation-status {
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

.eval-icon-small {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  stroke-width: 2;
}

.evaluation-status.eval-best {
  background: #FFF7ED;
  color: #F97316;
}

.evaluation-status.eval-good {
  background: #D1FAE5;
  color: #059669;
}

.evaluation-status.eval-okay {
  background: #DBEAFE;
  color: #2563EB;
}

.evaluation-status.eval-bad {
  background: #FEE2E2;
  color: #DC2626;
}

.post-review {
  font-size: 14px;
  font-weight: 400;
  color: var(--primary);
  line-height: 1.6;
  letter-spacing: -0.2px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
}

.post-details {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.store {
  color: var(--secondary);
  font-weight: 500;
}

.price {
  font-weight: 600;
  color: var(--secondary);
  font-size: 12px;
}

.discount {
  padding: 2px 6px;
  background: #FEE2E2;
  color: #DC2626;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.post-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hashtag {
  font-size: 12px;
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
    padding: 3px 5px;
    font-size: 11px;
    gap: 2px;
  }

  .action-btn .icon {
    width: 16px;
    height: 16px;
  }

  .action-btn .fire-icon {
    width: 17px;
    height: 17px;
  }

  .action-left {
    gap: 4px;
  }
}

@media (max-width: 767px) {
  .post-card {
    border-radius: 16px;
  }

  .post-title {
    font-size: 16px;
  }

  .post-review {
    font-size: 13px;
  }

  .evaluation-badge-overlay {
    top: 8px;
    left: 8px;
  }

  .evaluation-badge {
    padding: 5px 10px;
    font-size: 11px;
    gap: 4px;
  }

  .eval-icon {
    width: 14px;
    height: 14px;
  }

  .evaluation-status {
    padding: 2px 8px;
    font-size: 10px;
  }

  .eval-icon-small {
    width: 12px;
    height: 12px;
  }
}
</style>