<template>
  <router-link :to="{ name: 'FeedDetail', params: { id: feed.feedId } }" class="post-card">
    <div class="post-image-container" @dblclick.prevent="handleDoubleTapLike">
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

      <div v-if="feed.imageCount > 1" class="multi-photo-indicator">
        <span v-for="i in Math.min(feed.imageCount, 5)" :key="i" class="indicator-dot" :class="{ active: i === 1 }"></span>
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

      <div v-if="feed.hashtags?.length" class="hashtag-group">
        <span v-for="tag in feed.hashtags.slice(0, 3)" :key="tag" class="tag-item">#{{ tag }}</span>
      </div>

      <div class="post-footer">
        <div class="user-block" role="link" tabindex="0" @click.stop.prevent="goToUser" @keydown.enter.prevent="goToUser">
          <img :src="profileImageUrl || '/default-avatar.png'" class="user-avatar" />
          <div class="user-meta">
            <div class="nickname-row">
              <span class="user-nickname">{{ displayNickname }}</span>
              <UserLevelTag v-if="userLevel != null" :level="userLevel" size="xs" variant="dark" />
              <UserBadgeInline v-if="primaryBadgeId" :badge-id="primaryBadgeId" size="xs" />
            </div>
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
          <div class="stat-pill" :class="{ active: localIsLiked }" @click.stop.prevent="handleLike">
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
  </router-link>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { feedService, feedUtils } from '@/services/FeedService';
import { useAuth } from '@/composables/useAuth';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import UserLevelTag from '@/components/identity/UserLevelTag.vue';
import UserBadgeInline from '@/components/identity/UserBadgeInline.vue';

const props = defineProps({ feed: { type: Object, required: true } });
const emit = defineEmits(['update']);
const router = useRouter();
const route = useRoute();
const { isLoggedIn } = useAuth();
const { openLoginRequired } = useConfirmDialog();

const goToUser = () => {
  const userId = props.feed.userInfo?.userId;
  if (userId != null) router.push({ name: 'UserFeedList', params: { userId: String(userId) } });
};

const localIsLiked = ref(props.feed.userReactions?.hasLike === true);
const localLikeCount = ref(props.feed.likeCount || 0);

// userInfo: 프로필(닉네임/사진/뱃지) · userRewardInfo: 레벨/tier
const profileImageUrl = computed(() => props.feed.userInfo?.profileImageFile?.fileUrl || props.feed.userInfo?.profileImgUrl);
const displayNickname = computed(() => props.feed.userInfo?.nickname || '익명');
const userLevel = computed(() => props.feed.userRewardInfo?.level ?? null);
const primaryBadgeId = computed(() => {
  const u = props.feed.userInfo;
  return u?.primaryBadgeId || u?.representativeBadgeId || (Array.isArray(u?.badgeIds) ? u.badgeIds[0] : null);
});

const handleLike = async () => {
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('좋아요를 누르려면 로그인이 필요합니다.');
    if (confirmed) {
      router.push({ name: 'Login', query: { redirect: route.fullPath } });
    }
    return;
  }

  const prevLiked = localIsLiked.value;
  localIsLiked.value = !localIsLiked.value;
  localLikeCount.value += localIsLiked.value ? 1 : -1;
  try {
    const response = await feedService.toggleLike(props.feed.feedId);
    if (!response.success) throw new Error();
  } catch (e) {
    localIsLiked.value = prevLiked;
    localLikeCount.value += prevLiked ? 1 : -1;
  }
};

const handleDoubleTapLike = () => {
  if (!isLoggedIn.value) {
    handleLike();
    return;
  }
  if (!localIsLiked.value) {
    handleLike();
  }
};

const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation);
const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  return { 'BEST': 'eb-best', 'GOOD': 'eb-good', 'OKAY': 'eb-okay', 'BAD': 'eval-bad' }[code] || '';
};
const formatCount = (count) => feedUtils.formatCount(count);
const formatDate = (date) => feedUtils.formatDate(date);
</script>

<style scoped>
/* 색상: #191F28 / #4E5968 / #8B95A1 / #B0B8C1 (토스 계열) */
/* 간격: 4px 그리드 (4, 8, 12, 16, 20, 24) */

.post-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.04),
    0 4px 16px rgba(15, 23, 42, 0.04);
}
.post-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.06),
    0 12px 28px rgba(15, 23, 42, 0.08);
}

/* 이미지 영역 */
.post-image-container {
  position: relative; width: 100%; aspect-ratio: 1 / 1;
  overflow: hidden; background: #F7F8FA;
}
.post-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.post-card:hover .post-image { transform: scale(1.02); }

/* 이미지 상단 뱃지 */
.image-badges-top {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  display: flex; align-items: center; gap: 4px;
}
.evaluation-badge {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 700;
  letter-spacing: -0.2px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}
.eval-dot { width: 5px; height: 5px; border-radius: 50%; }

.eb-best { background-color: #FEF3C7; color: #92400e; }
.eb-best .eval-dot { background-color: #f59e0b; }
.eb-good { background-color: #DCFCE7; color: #166534; }
.eb-good .eval-dot { background-color: #16a34a; }
.eb-okay { background-color: #F3E8FF; color: #6b21a8; }
.eb-okay .eval-dot { background-color: #9333ea; }
.eval-bad { background-color: #FEE2E2; color: #991b1b; }
.eval-bad .eval-dot { background-color: #ef4444; }

.trend-badge {
  display: flex; align-items: center; gap: 3px;
  padding: 5px 9px; border-radius: 999px;
  background: #EF4444;
  font-size: 11px; font-weight: 700; color: #ffffff;
  letter-spacing: -0.2px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
}

/* 멀티 사진 인디케이터 */
.multi-photo-indicator {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}
.indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: background 0.2s;
}
.indicator-dot.active {
  background: #fff;
}

/* 콘텐츠 영역 */
.post-content {
  padding: 14px 18px 18px;
  display: flex; flex-direction: column; flex: 1;
}

.category-label {
  font-size: 11px; font-weight: 600; color: #8B95A1;
  display: block; margin-bottom: 6px; letter-spacing: -0.2px;
}
.category-arrow { margin: 0 2px; color: #CBD5E1; }

.primary-review {
  font-size: 15px; font-weight: 700; color: #0A0E1A;
  line-height: 1.5; margin-bottom: 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: calc(1.5em * 2);
  letter-spacing: -0.3px; word-break: keep-all;
}
.quote { color: #C4B5FD; font-size: 15px; font-family: 'SUIT', sans-serif; margin-right: 1px; }

/* 제품 정보 박스 */
.product-info-box {
  background: #F7F8FA; border-radius: 10px;
  padding: 10px 12px; margin-bottom: 12px; border: none;
}
.buy-place {
  display: flex; align-items: center; gap: 3px;
  font-size: 11px; font-weight: 600; color: #9333EA; margin-bottom: 2px;
}
.place-icon { width: 11px; height: 11px; flex-shrink: 0; }
.product-name {
  font-size: 13px; font-weight: 700; color: #4E5968;
  margin: 2px 0 0; line-height: 1.3;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  letter-spacing: -0.01em;
}

/* 해시태그 */
.hashtag-group { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; min-height: 16px; }
.tag-item { font-size: 12px; color: #8B95A1; font-weight: 500; }

/* 푸터 */
.post-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 14px; border-top: 1px solid #F2F4F6; margin-top: auto;
}
.user-block { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; display: block; flex-shrink: 0; }
.user-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.nickname-row { display: flex; align-items: center; gap: 4px; min-width: 0; }
.user-nickname { font-size: 13px; font-weight: 600; color: #4E5968; letter-spacing: -0.2px; }
.post-date { font-size: 11px; color: #B0B8C1; font-weight: 500; letter-spacing: -0.1px; }

.interaction-group { display: flex; gap: 4px; }
.stat-pill {
  display: flex; align-items: center; gap: 4px; padding: 5px 9px;
  background: #F2F4F6; border-radius: 999px;
  font-size: 11px; font-weight: 600; color: #8B95A1;
  letter-spacing: -0.1px;
  transition: background 0.15s ease, color 0.15s ease;
}
.stat-pill.active { background: #F3E8FF; color: #9333EA; }
.stat-pill.active:hover { background: #E9D5FF; }
.icon { width: 13px; height: 13px; }

/* 모바일 */
@media (max-width: 768px) {
  .post-card {
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    padding-bottom: 0; margin-bottom: 0;
    border-bottom: 1px solid #F2F4F6;
  }
  .post-card:hover { transform: none; box-shadow: none; }
  .post-card:active { background: #F7F8FA; }

  .post-image-container { border-radius: 0; }
  .post-card:hover .post-image { transform: none; }

  .image-badges-top { top: 8px; left: 8px; }
  .evaluation-badge { padding: 4px 8px; font-size: 10px; }
  .trend-badge { padding: 4px 7px; font-size: 10px; }

  .post-content { padding: 12px 16px 16px; }

  .category-label { font-size: 11px; margin-bottom: 4px; }

  .primary-review {
    font-size: 15px; margin-bottom: 8px; line-height: 1.5;
    min-height: unset;
  }
  .quote { font-size: 15px; }

  .product-info-box {
    padding: 8px 12px; margin-bottom: 8px;
    border-radius: 8px; border: none;
  }
  .buy-place { font-size: 10px; }
  .product-name { font-size: 12px; }

  .hashtag-group { margin-bottom: 8px; gap: 4px; min-height: unset; }
  .hashtag-group:empty { display: none; }
  .tag-item { font-size: 11px; }

  .post-footer { padding-top: 8px; border-top: none; }
  .user-avatar { width: 24px; height: 24px; }
  .user-nickname { font-size: 12px; font-weight: 600; }
  .post-date { font-size: 11px; color: #B0B8C1; }

  .stat-pill { padding: 4px 8px; font-size: 11px; }
  .icon { width: 12px; height: 12px; }
}
</style>