<template>
  <router-link :to="{ name: 'FeedDetail', params: { id: feed.feedId } }" class="post-card">
    <div
        class="post-image-container"
        @dblclick.prevent="handleDoubleTapLike"
        @touchstart.passive="onImageTouchStart"
        @touchend.passive="onImageTouchEnd"
    >
      <img
          :src="feed.thumbnailUrl?.fileUrl || 'https://placehold.co/400x300?text=No+Image'"
          :alt="feed.productName"
          class="post-image"
      />

      <span v-if="isNew" class="new-badge" aria-label="새 게시물">NEW</span>

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
          <img :src="profileImageUrl" class="user-avatar" @error="onAvatarError" />
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
          <div class="stat-pill">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            {{ formatCount(feed.commentCount || 0) }}
          </div>
          <div class="stat-pill" :class="{ active: localIsLiked }" @click.stop.prevent="handleLike">
            <svg class="icon" viewBox="0 0 24 24" :fill="localIsLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {{ formatCount(localLikeCount) }}
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
import { resolveProfileImage, onAvatarError } from '@/utils/defaultAvatar';

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
const profileImageUrl = computed(() => resolveProfileImage(props.feed.userInfo?.profileImageFile?.fileUrl, props.feed.userInfo?.profileImgUrl));

// 작성 후 24시간 이내 피드에 NEW 뱃지
const isNew = computed(() => {
  const created = props.feed?.createdAt
  if (!created) return false
  const ms = Date.now() - new Date(created).getTime()
  return ms >= 0 && ms < 24 * 60 * 60 * 1000
})
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

// 가로 스와이프 감지: 인스타식 캐러셀 대신 상세 페이지로 유도.
// (탭은 router-link 가 처리하지만 스와이프는 click 이 발화하지 않아 별도 핸들링 필요)
const swipeData = { x: 0, y: 0, t: 0 };
const onImageTouchStart = (e) => {
  const t = e.touches[0];
  swipeData.x = t.clientX;
  swipeData.y = t.clientY;
  swipeData.t = Date.now();
};
const onImageTouchEnd = (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - swipeData.x;
  const dy = t.clientY - swipeData.y;
  const dt = Date.now() - swipeData.t;
  // 가로 50px+ · 가로가 세로의 1.5배 이상 · 600ms 이내면 스와이프로 판정
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 600) {
    router.push({ name: 'FeedDetail', params: { id: props.feed.feedId } });
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
/* 색상: var(--text-primary) / var(--c-text-600) / var(--c-text-400) / var(--c-text-300) (토스 계열) */
/* 간격: 4px 그리드 (4, 8, 12, 16, 20, 24) */

.post-card {
  background: var(--bg-elevated);
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
  overflow: hidden; background: var(--bg-subtle);
}
.post-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.post-card:hover .post-image { transform: scale(1.02); }

/* 이미지 상단 뱃지 */
.image-badges-top {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  display: flex; align-items: center; gap: 4px;
}
.evaluation-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  font-size: 11px; font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
  box-shadow: none;
}
.eval-dot {
  width: 6px; height: 6px; border-radius: 50%;
  box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.28);
}

.eb-best .eval-dot { background-color: #FACC15; }
.eb-good .eval-dot { background-color: #4ADE80; }
.eb-okay .eval-dot { background-color: #C084FC; }
.eval-bad .eval-dot { background-color: #F87171; }

.trend-badge {
  display: flex; align-items: center; gap: 3px;
  padding: 5px 9px; border-radius: 999px;
  background: var(--c-danger);
  font-size: 11px; font-weight: 700; color: #ffffff;
  letter-spacing: -0.2px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
}

/* NEW 뱃지 — 우상단 단독, 흰 캡슐 + 빨간 'NEW' 텍스트 */
.new-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--c-danger);
  font-size: 10.5px;
  font-weight: 800;
  font-family: inherit;
  letter-spacing: 0.5px;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
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
  background: var(--bg-elevated);
}

/* 콘텐츠 영역 */
.post-content {
  padding: 14px 18px 18px;
  display: flex; flex-direction: column; flex: 1;
}

.category-label {
  font-size: 11px; font-weight: 600; color: var(--c-text-400);
  display: block; margin-bottom: 6px; letter-spacing: -0.2px;
}
.category-arrow { margin: 0 2px; color: var(--c-text-300); }

.primary-review {
  font-size: 15px; font-weight: 700; color: var(--text-primary);
  line-height: 1.5; margin-bottom: 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: calc(1.5em * 2);
  letter-spacing: -0.3px; word-break: keep-all;
  overflow-wrap: anywhere;
}
.quote { color: var(--c-brand-soft); font-size: 15px; font-family: 'SUIT', sans-serif; margin-right: 1px; }

/* 제품 정보 박스 */
.product-info-box {
  background: var(--bg-subtle); border-radius: 10px;
  padding: 10px 12px; margin-bottom: 12px; border: none;
}
.buy-place {
  display: flex; align-items: center; gap: 3px;
  font-size: 11px; font-weight: 600; color: var(--c-brand); margin-bottom: 2px;
}
.place-icon { width: 11px; height: 11px; flex-shrink: 0; }
.product-name {
  font-size: 13px; font-weight: 700; color: var(--c-text-600);
  margin: 2px 0 0; line-height: 1.3;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  letter-spacing: -0.01em;
}

/* 해시태그 */
.hashtag-group { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; min-height: 16px; }
.tag-item { font-size: 12px; color: var(--c-text-400); font-weight: 500; }

/* 푸터 */
.post-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 14px; border-top: 1px solid var(--bg-mute); margin-top: auto;
}
.user-block { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; display: block; flex-shrink: 0; }
.user-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.nickname-row { display: flex; align-items: center; gap: 4px; min-width: 0; }
.user-nickname { font-size: 13px; font-weight: 600; color: var(--c-text-600); letter-spacing: -0.2px; }
.post-date { font-size: 11px; color: var(--c-text-300); font-weight: 500; letter-spacing: -0.1px; }

.interaction-group { display: flex; gap: 5px; }
.stat-pill {
  display: flex; align-items: center; gap: 4px; padding: 6px 10px;
  background: var(--bg-mute); border-radius: 999px;
  font-size: 12px; font-weight: 600; color: var(--c-text-400);
  letter-spacing: -0.1px;
  transition: background 0.15s ease, color 0.15s ease;
}
.stat-pill.active { background: var(--c-brand-soft); color: var(--c-brand); }
.stat-pill.active:hover { background: var(--c-brand-soft); }
.icon { width: 14px; height: 14px; }

/* 모바일 */
@media (max-width: 768px) {
  .post-card {
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    padding-bottom: 8px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border-strong);
  }
  .post-card:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
  .post-card:hover { transform: none; box-shadow: none; }
  .post-card:active { background: var(--bg-subtle); }

  .post-image-container { border-radius: 0; }
  .post-card:hover .post-image { transform: none; }

  .image-badges-top { top: 8px; left: 8px; }
  .evaluation-badge { padding: 0; font-size: 10px; gap: 4px; }
  .evaluation-badge .eval-dot { width: 5px; height: 5px; }
  .trend-badge { padding: 4px 7px; font-size: 10px; }
  .new-badge { top: 8px; right: 8px; padding: 3px 8px; font-size: 9.5px; }

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
  .post-date { font-size: 11px; color: var(--c-text-300); }

  .stat-pill { padding: 6px 11px; font-size: 12px; }
  .icon { width: 14px; height: 14px; }
}
</style>