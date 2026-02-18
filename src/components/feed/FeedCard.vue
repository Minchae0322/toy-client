<template>
  <article class="post-card" @click="handleCardClick">
    <div class="post-image-container" @dblclick="handleDoubleTapLike">
      <img
          :src="feed.thumbnailUrl?.fileUrl || 'https://placehold.co/400x300?text=No+Image'"
          :alt="feed.productName"
          class="post-image"
      />

      <div class="image-badges-top">
        <div v-if="feed.feedEvaluation" :class="['evaluation-badge', getEvaluationClass(feed.feedEvaluation)]">
          <span class="eval-dot"></span>
          <span class="eval-text">{{ getEvaluationLabel(feed.feedEvaluation) }}</span>
        </div>
        <div v-if="feed.isTrending" class="trend-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          인기
        </div>
      </div>

    </div>

    <div class="post-content">
      <span class="category-label">카테고리 <span class="category-arrow">›</span> {{ feed.categoryName }}</span>

      <p class="primary-review">
        <span class="quote">"</span>{{ feed.reviewSummary }}<span class="quote">"</span>
      </p>

      <div class="product-info-box">
        <span class="buy-place">
          <svg class="place-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {{ feed.buyPlace || '미등록' }}
        </span>
        <h3 class="product-name">{{ feed.productName }}</h3>
      </div>

      <div class="hashtag-group">
        <span v-for="tag in feed.hashtags?.slice(0, 3)" :key="tag" class="tag-item">#{{ tag }}</span>
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
          <div class="stat-pill">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
            </svg>
            {{ formatCount(feed.viewCount || 0) }}
          </div>
          <div class="stat-pill" :class="{ active: localIsLiked }" @click.stop="handleLike">
            <svg class="icon" viewBox="0 0 24 24" :fill="localIsLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {{ formatCount(localLikeCount) }}
          </div>
          <div class="stat-pill">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
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
  }
};

const handleCardClick = () => emit('click', props.feed.feedId);

const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation);
const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  return { 'BEST': 'eb-best', 'GOOD': 'eb-good', 'OKAY': 'eb-okay', 'BAD': 'eval-bad' }[code] || '';
};
const formatCount = (count) => feedUtils.formatCount(count);
const formatDate = (date) => feedUtils.formatDate(date);
</script>

<style scoped>
.post-card {
  background: white; border-radius: 28px; border: 1px solid #f0f0f5;
  overflow: hidden; transition: all 0.3s ease; cursor: pointer;
  display: flex; flex-direction: column;
}
.post-card:hover { transform: translateY(-6px); box-shadow: 0 15px 35px rgba(0,0,0,0.07); }

/* 이미지 영역 */
.post-image-container { position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; background: #f8f8fa; }
.post-image { width: 100%; height: 100%; object-fit: cover; }

/* 이미지 상단 뱃지 영역 */
.image-badges-top { position: absolute; top: 16px; left: 16px; z-index: 2; display: flex; align-items: center; gap: 6px; }
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

/* 인기 뱃지 */
.trend-badge {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 10px; border-radius: 100px;
  background: linear-gradient(to right, #f43f5e, #ec4899);
  font-size: 11px; font-weight: 800; color: white;
}

/* 콘텐츠 영역 */
.post-content {
  padding: 8px 22px 22px;
  display: flex; flex-direction: column; flex: 1;
}

.primary-review {
  font-size: 17.5px; font-weight: 600; color: #1a1a1b; line-height: 1.55; margin-bottom: 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.quote { color: #9993ea; font-size: 18px; font-family: serif; margin-right: 2px; }

.hashtag-group { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; min-height: 18px; }
.tag-item { font-size: 12px; color: #a1a1aa; font-weight: 500; }

/* 제품 정보 박스 */
.product-info-box {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid #f1f1f5;
}
.buy-place {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #9333ea;
  margin-bottom: 2px;
}
.place-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}
.category-label {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  display: block;
  margin-bottom: 2px;
}
.category-arrow {
  margin: 0 2px;
  color: #d1d5db;
}
.product-name {
  font-size: 12px;
  font-weight: 700;
  color: #3f3f46;
  margin: 2px 0 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 푸터 레이아웃 */
.post-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 18px; border-top: 1px solid #f4f4f7;
  margin-top: auto;
}
.user-block { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.user-meta { display: flex; flex-direction: column; gap: 1px; }
.user-nickname { font-size: 13px; font-weight: 700; color: #18181b; }
.post-date { font-size: 12px; color: #a1a1aa; font-weight: 400; }

.interaction-group { display: flex; gap: 5px; }
.stat-pill {
  display: flex; align-items: center; gap: 4px; padding: 6px 10px;
  background: #f4f4f5; border-radius: 100px; font-size: 12px; font-weight: 600; color: #a1a1aa;
  transition: all 0.2s ease;
}
.stat-pill.active { background: #ede9fe; color: #7c3aed; }
.stat-pill.active:hover { background: #ddd6fe; }
.icon { width: 14px; height: 14px; }

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

  /* 뱃지 위치 조정 */
  .image-badges-top {
    top: 12px;
    left: 12px;
  }
  .evaluation-badge {
    padding: 5px 12px;
    font-size: 10px;
  }
  .trend-badge {
    padding: 5px 10px;
    font-size: 10px;
  }

  /* 콘텐츠 영역 */
  .post-content {
    padding: 12px 16px 4px;
  }

  .primary-review {
    font-size: 16px;
    margin-bottom: 10px;
    line-height: 1.5;
  }
  .quote {
    font-size: 16px;
  }

  .hashtag-group {
    margin-bottom: 10px;
    gap: 6px;
    min-height: 16px;
  }
  .tag-item {
    font-size: 11px;
  }

  /* 제품 정보 */
  .product-info-box {
    padding: 10px 12px;
    margin-bottom: 10px;
    border-radius: 10px;
    border: none;
  }
  .category-label {
    font-size: 9px;
    margin-bottom: 8px;
  }
  .buy-place {
    font-size: 9px;
    gap: 3px;
  }
  .place-icon {
    width: 10px;
    height: 10px;
  }
  .product-name {
    font-size: 13px;
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