<template>
  <article class="post-card" @click="handleCardClick">
    <!-- Header -->
    <div class="post-header">
      <div class="post-author-info">
        <div class="author-avatar-small">
          <img v-if="feed.userInfo?.profileImageUrl" :src="feed.userInfo.profileImageUrl" alt="" />
          <span v-else>{{ feed.userInfo?.nickname?.charAt(0) || '👤' }}</span>
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
            <span class="fire">🔥</span>
            <span>{{ formatCount(localLikeCount) }}</span>
          </button>

          <!-- HOT 버튼 -->
          <button
              @click="handleHot"
              :class="['action-btn', { hot: localIsHot }]"
              :disabled="isLoading"
          >
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <!-- 제품명 -->
        <h3 class="post-title">{{ feed.productName }}</h3>

        <!-- 리뷰 - 메인 콘텐츠 -->
        <p v-if="feed.reviewSummary" class="post-review">{{ feed.reviewSummary }}</p>

        <!-- 가격 정보 - 작고 간결하게 -->
        <div v-if="feed.price || feed.buyPlace" class="post-details">
          <span v-if="feed.buyPlace" class="store">{{ feed.buyPlace }}</span>
          <span v-if="feed.price" class="price">{{ formatPrice(feed.price) }}</span>
          <span v-if="showDiscount" class="discount">{{ discountRate }}%</span>
        </div>

        <!-- 해시태그 -->
        <div v-if="feed.hashtags && feed.hashtags.length > 0" class="post-hashtags">
          <span
              v-for="tag in feed.hashtags"
              :key="tag"
              class="hashtag"
              @click="handleHashtagClick(tag, $event)"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue';
import { feedService } from '@/services/FeedService';

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

// Local State
const showLikeAnimation = ref(false);
const isLoading = ref(false);

// Local 반응 상태 (낙관적 업데이트용)
const localIsLiked = ref(props.isLiked);
const localIsHot = ref(props.isHot);
const localIsSaved = ref(props.isSaved);
const localLikeCount = ref(props.feed.reactionStats?.likeCount || 0);
const localHotCount = ref(props.feed.reactionStats?.hotCount || 0);

// Computed
const discountRate = computed(() => {
  const originalPrice = props.feed.product?.price;
  const buyPrice = props.feed.price;

  if (!originalPrice || !buyPrice) return 0;
  if (originalPrice <= buyPrice) return 0;

  return Math.round(((originalPrice - buyPrice) / originalPrice) * 100);
});

const showDiscount = computed(() => discountRate.value > 0);

// 카드 클릭 핸들러
const handleCardClick = (event) => {
  // 버튼 클릭은 카드 클릭으로 전파하지 않음
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

// Methods
const handleLike = async (event) => {
  event.stopPropagation();
  if (isLoading.value) return;

  // 낙관적 업데이트
  const prevIsLiked = localIsLiked.value;
  const prevCount = localLikeCount.value;

  localIsLiked.value = !localIsLiked.value;
  localLikeCount.value += localIsLiked.value ? 1 : -1;

  // HOT이 활성화되어 있으면 해제
  if (localIsHot.value) {
    localIsHot.value = false;
    localHotCount.value = Math.max(0, localHotCount.value - 1);
  }

  try {
    isLoading.value = true;
    const response = await feedService.likeFeed(props.feed.feedId);

    console.log('👍 LIKE 응답:', response);

    // 서버 응답으로 실제 값 업데이트
    if (response.success && response.data) {
      localIsLiked.value = response.data.isActive;
      localLikeCount.value = response.data.likeCount || localLikeCount.value;

      // 부모에게 업데이트 알림
      emit('update', {
        feedId: props.feed.feedId,
        reactionStats: {
          ...props.feed.reactionStats,
          likeCount: response.data.likeCount,
          hotCount: response.data.hotCount
        }
      });
    }

    emit('like', props.feed.feedId);
  } catch (error) {
    console.error('❌ LIKE 실패:', error);
    // 실패 시 롤백
    localIsLiked.value = prevIsLiked;
    localLikeCount.value = prevCount;
  } finally {
    isLoading.value = false;
  }
};

const handleHot = async (event) => {
  event.stopPropagation();
  if (isLoading.value) return;

  // 낙관적 업데이트
  const prevIsHot = localIsHot.value;
  const prevCount = localHotCount.value;

  localIsHot.value = !localIsHot.value;
  localHotCount.value += localIsHot.value ? 1 : -1;

  // LIKE가 활성화되어 있으면 해제
  if (localIsLiked.value) {
    localIsLiked.value = false;
    localLikeCount.value = Math.max(0, localLikeCount.value - 1);
  }

  try {
    isLoading.value = true;
    const response = await feedService.hotFeed(props.feed.feedId);

    console.log('🔥 HOT 응답:', response);

    // 서버 응답으로 실제 값 업데이트
    if (response.success && response.data) {
      localIsHot.value = response.data.isActive;
      localHotCount.value = response.data.hotCount || localHotCount.value;

      // 부모에게 업데이트 알림
      emit('update', {
        feedId: props.feed.feedId,
        reactionStats: {
          ...props.feed.reactionStats,
          likeCount: response.data.likeCount,
          hotCount: response.data.hotCount
        }
      });
    }

    emit('hot', props.feed.feedId);
  } catch (error) {
    console.error('❌ HOT 실패:', error);
    // 실패 시 롤백
    localIsHot.value = prevIsHot;
    localHotCount.value = prevCount;
  } finally {
    isLoading.value = false;
  }
};

const handleDoubleTapLike = () => {
  if (!localIsLiked.value) {
    // 이벤트 객체 생성
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

// Formatters
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
  if (!price || price === 0) return '무료';
  return '₩' + new Intl.NumberFormat('ko-KR').format(price);
};

const formatCount = (count) => {
  if (!count) return '0';
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
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

/* Header */
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

.author-level {
  font-size: 14px;
  flex-shrink: 0;
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

/* Image */
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

/* Content */
.post-content {
  padding: 16px;
}

/* Actions */
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

.action-btn.hot .icon {
  fill: #DC2626;
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

/* Info */
.post-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 제품명 - 강조 */
.post-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.4;
  letter-spacing: -0.3px;
}

@media (min-width: 768px) {
  .post-title {
    font-size: 19px;
  }
}

/* 리뷰 - 메인 콘텐츠로 강조 */
.post-review {
  font-size: 15px;
  font-weight: 400;
  color: var(--primary);
  line-height: 1.7;
  letter-spacing: -0.2px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
}

/* 가격 정보 - 덜 강조 */
.post-details {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12px;
  padding-top: 4px;
  border-top: 1px solid var(--border);
  padding-top: 8px;
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

/* 해시태그 */
.post-hashtags {
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

/* Responsive */
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

  .post-title {
    font-size: 17px;
  }

  .post-review {
    font-size: 14px;
  }
}
</style>