<template>
  <article class="post-card" @click="handleCardClick">
    <div class="post-image-container" @dblclick="handleDoubleTapLike">
      <img
          :src="feed.thumbnailUrl?.fileUrl || 'https://placehold.co/400x300?text=No+Image'"
          :alt="feed.productName"
          class="post-image"
      />

      <div v-if="feed.feedEvaluation" class="eval-overlay-top">
        <div :class="['evaluation-badge', getEvaluationClass(feed.feedEvaluation)]">
          <span class="eval-dot"></span>
          <span class="eval-text">{{ getEvaluationLabel(feed.feedEvaluation) }}</span>
        </div>
      </div>

      <Transition name="heart-pop">
        <div v-if="showLikeAnimation" class="like-animation">
          <svg fill="#9993ea" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
        </div>
      </Transition>
    </div>

    <div class="post-content">
      <p class="primary-review">
        <span class="quote">“</span>{{ feed.reviewSummary }}<span class="quote">”</span>
      </p>

      <div v-if="feed.hashtags?.length" class="hashtag-group">
        <span v-for="tag in feed.hashtags.slice(0, 3)" :key="tag" class="tag-item">
          #{{ tag }}
        </span>
      </div>

      <div class="product-info-box">
        <div class="product-details">
          <span class="category-tag">{{ feed.categoryName }}</span>
          <h3 class="product-name">{{ feed.productName }}</h3>
        </div>
        <div class="price-tag">
          {{ formatPrice(feed.price) }}
        </div>
      </div>

      <div class="post-footer">
        <div class="user-block">
          <img :src="profileImageUrl || '/default-avatar.png'" class="user-avatar" />
          <div class="user-meta">
            <span class="user-nickname">{{ displayNickname }}</span>
            <span class="post-date">{{ formatDate(feed.createdAt) }}</span>
          </div>
        </div>

        <div class="interaction-group">
          <div class="stat-pill" :class="{ active: localIsLiked }" @click.stop="handleLike">
            <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            {{ formatCount(localLikeCount) }}
          </div>
          <div class="stat-pill" @click.stop="handleComment">
            <svg class="icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            {{ formatCount(feed.commentCount || 0) }}
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue';
import { feedService, feedUtils } from '@/services/FeedService';

const props = defineProps({ feed: { type: Object, required: true } });
const emit = defineEmits(['update', 'click']);

const showLikeAnimation = ref(false);
const localIsLiked = ref(props.feed.userReactions?.hasLike === true);
const localLikeCount = ref(props.feed.likeCount || 0);

const profileImageUrl = computed(() => props.feed.userInfo?.profileImageFile?.fileUrl || props.feed.userInfo?.profileImgUrl);
const displayNickname = computed(() => props.feed.userInfo?.nickname || '익명');

const handleLike = async () => {
  const prevLiked = localIsLiked.value;
  localIsLiked.value = !localIsLiked.value;
  localLikeCount.value += localIsLiked.value ? 1 : -1;
  try {
    const response = await feedService.toggleLike(props.feed.feedId);
    if (!response.success) throw new Error();
  } catch (e) { localIsLiked.value = prevLiked; }
};

const handleDoubleTapLike = () => {
  if (!localIsLiked.value) {
    handleLike();
    showLikeAnimation.value = true;
    setTimeout(() => { showLikeAnimation.value = false; }, 800);
  }
};

const handleCardClick = () => emit('click', props.feed.feedId);
const handleComment = () => emit('click', props.feed.feedId);

const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation);
const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  return { 'BEST': 'eb-best', 'GOOD': 'eb-good', 'OKAY': 'eb-okay', 'BAD': 'eval-bad' }[code] || '';
};
const formatPrice = (price) => feedUtils.formatPrice(price);
const formatCount = (count) => feedUtils.formatCount(count);
const formatDate = (date) => feedUtils.formatDate(date);
</script>

<style scoped>
.post-card {
  background: white; border-radius: 28px; border: 1px solid #f0f0f5;
  overflow: hidden; transition: all 0.3s ease; cursor: pointer;
}
.post-card:hover { transform: translateY(-6px); box-shadow: 0 15px 35px rgba(0,0,0,0.07); }

/* 이미지 영역 */
.post-image-container { position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; background: #f8f8fa; }
.post-image { width: 100%; height: 100%; object-fit: cover; }

/* [수정] 제품평가 뱃지: 파스텔 스타일 */
.eval-overlay-top { position: absolute; top: 16px; left: 16px; z-index: 2; }
.evaluation-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 100px;
  font-size: 11px; font-weight: 800;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.eval-dot { width: 6px; height: 6px; border-radius: 50%; }

/* 평가별 파스텔 컬러셋 */
.eb-best { background-color: #fef3c7; color: #92400e; }
.eb-best .eval-dot { background-color: #f59e0b; }

.eb-good { background-color: #dcfce7; color: #166534; }
.eb-good .eval-dot { background-color: #10b981; }

.eb-okay { background-color: #f3e8ff; color: #6b21a8; }
.eb-okay .eval-dot { background-color: #9333ea; }

.eval-bad { background-color: #fee2e2; color: #991b1b; }
.eval-bad .eval-dot { background-color: #ef4444; }

/* 콘텐츠 영역 */
.post-content { padding: 22px; }

.primary-review {
  font-size: 16.5px; font-weight: 600; color: #1a1a1b; line-height: 1.55; margin-bottom: 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.quote { color: #9993ea; font-size: 18px; font-family: serif; margin-right: 2px; }

.hashtag-group { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.tag-item { font-size: 12px; color: #6b6b72; font-weight: 500; }

/* [수정] 제품 정보 섹션: 가로 확장 및 배치 최적화 */
.product-info-box {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8f8fa;
  margin-left: -10px; margin-right: -10px; /* 카드 패딩보다 넓게 확장 */
  padding: 10px 20px;
  border-radius: 16px;
  margin-bottom: 22px;
  border: 1px solid #f1f1f5;
}
.product-details { flex: 1; padding-right: 12px; }
.category-tag { font-size: 10px; font-weight: 800; color: #9333ea; text-transform: uppercase; margin-bottom: 3px; display: block; }
.product-name { font-size: 15px; font-weight: 600; color: #3a3a3f; margin: 0; line-height: 1.3; }
.price-tag { font-size: 16px; font-weight: 800; color: #9333ea; white-space: nowrap; }

/* 푸터 레이아웃 */
.post-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 18px; border-top: 1px solid #f4f4f7;
}
.user-block { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.user-meta { display: flex; flex-direction: column; gap: 1px; }
.user-nickname { font-size: 13px; font-weight: 700; color: #18181b; }
.post-date { font-size: 12px; color: #a1a1aa; font-weight: 400; }

.interaction-group { display: flex; gap: 6px; }
.stat-pill {
  display: flex; align-items: center; gap: 5px; padding: 7px 12px;
  background: #f4f4f7; border-radius: 100px; font-size: 12px; font-weight: 700; color: #a1a1aa; transition: 0.2s;
}
.stat-pill.active { background: #f5f4ff; color: #9993ea; }
.icon { width: 16px; height: 16px; }

/* 하트 팝 애니메이션 */
.like-animation { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.like-animation svg { width: 80px; height: 80px; }
.heart-pop-enter-active { animation: heart-pop 0.5s cubic-bezier(0.17, 0.89, 0.32, 1.49); }
@keyframes heart-pop { 0% { transform: scale(0); } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 0; } }

/* 모바일: 스레드 스타일 (얇은 경계선) */
@media (max-width: 768px) {
  .post-card {
    border-radius: 0;
    border: none;
    background: transparent;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #d0d0d0;
  }
  .post-card:hover {
    transform: none;
    box-shadow: none;
  }
  .post-card:active {
    background: #fafafa;
  }

  /* 이미지 전체 너비 */
  .post-image-container {
    border-radius: 0;
  }

  /* 평가 뱃지 위치 조정 */
  .eval-overlay-top {
    top: 12px;
    left: 12px;
  }
  .evaluation-badge {
    padding: 5px 12px;
    font-size: 10px;
  }

  /* 콘텐츠 영역 */
  .post-content {
    padding: 14px 16px 4px;
  }

  .primary-review {
    font-size: 14px;
    margin-bottom: 10px;
    line-height: 1.5;
  }
  .quote {
    font-size: 16px;
  }

  .hashtag-group {
    margin-bottom: 12px;
    gap: 6px;
  }
  .tag-item {
    font-size: 11px;
  }

  /* 제품 정보 박스 - 경계 제거 */
  .product-info-box {
    margin-left: -4px;
    margin-right: -4px;
    padding: 10px 14px;
    border-radius: 12px;
    margin-bottom: 10px;
    border: none;
  }
  .category-tag {
    font-size: 9px;
  }
  .product-name {
    font-size: 13px;
  }
  .price-tag {
    font-size: 14px;
  }

  /* 푸터 - 경계 제거 */
  .post-footer {
    padding-top: 8px;
    border-top: none;
  }
  .user-avatar {
    width: 28px;
    height: 28px;
  }
  .user-nickname {
    font-size: 12px;
  }
  .post-date {
    font-size: 11px;
  }

  .stat-pill {
    padding: 6px 10px;
    font-size: 11px;
  }
  .icon {
    width: 14px;
    height: 14px;
  }
}
</style>