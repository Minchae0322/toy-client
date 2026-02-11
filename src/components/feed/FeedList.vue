<template>
  <section class="feed-container">
    <header class="feed-header">
      <div class="title-with-badge">
        <h2 class="section-title">최신 피드</h2>
        <span class="sub-title">사용자들이 올린 솔직한 리뷰</span>
      </div>

      <div class="filter-bar">
        <div class="view-switcher">
          <button
              class="view-btn"
              :class="{ active: viewMode === 'feed' }"
              @click="$emit('view-mode-change', 'feed')"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1"/>
              <rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/>
              <rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
          <button
              class="view-btn"
              :class="{ active: viewMode === 'list' }"
              @click="$emit('view-mode-change', 'list')"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="3" rx="0.5"/>
              <rect x="1" y="7" width="14" height="3" rx="0.5"/>
              <rect x="1" y="12" width="14" height="3" rx="0.5"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Empty State -->
    <div v-if="!loading && feeds.length === 0" class="feed-empty-state">
      <div class="empty-illustration">
        <div class="illustration-circle circle-1"></div>
        <div class="illustration-circle circle-2"></div>
        <svg class="illustration-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
      </div>
      <div class="empty-content">
        <h3 class="empty-title">아직 게시물이 없습니다</h3>
        <p class="empty-description">첫 번째 리뷰를 작성해 보세요!</p>
      </div>
    </div>

    <!-- Feed Grid View -->
    <div v-else-if="viewMode === 'feed'" class="modern-grid">
      <!-- 스켈레톤: 초기 로딩 -->
      <template v-if="loading && feeds.length === 0">
        <article v-for="n in 12" :key="'skeleton-' + n" class="skeleton-card">
          <div class="skeleton-image-container">
            <div class="skeleton-image"></div>
          </div>
          <div class="skeleton-content">
            <!-- primary-review -->
            <div class="skeleton-review">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
            <!-- hashtag-group -->
            <div class="skeleton-hashtags">
              <span class="skeleton-tag"></span>
              <span class="skeleton-tag"></span>
              <span class="skeleton-tag"></span>
            </div>
            <!-- product-info-box -->
            <div class="skeleton-product-box">
              <div class="skeleton-category"></div>
              <div class="skeleton-product-name"></div>
            </div>
            <!-- post-footer -->
            <div class="skeleton-footer">
              <div class="skeleton-user">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-user-meta">
                  <div class="skeleton-nickname"></div>
                  <div class="skeleton-date"></div>
                </div>
              </div>
              <div class="skeleton-actions">
                <div class="skeleton-stat-pill"></div>
                <div class="skeleton-stat-pill"></div>
                <div class="skeleton-stat-pill"></div>
              </div>
            </div>
          </div>
        </article>
      </template>
      <!-- 실제 피드 카드 -->
      <FeedCard
          v-else
          v-for="feed in feeds"
          :key="feed.feedId"
          :feed="feed"
          @update="(data) => $emit('update', data)"
          @click="(id) => $emit('post-click', id)"
      />
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list'" class="list-view">
      <!-- 스켈레톤: 초기 로딩 -->
      <template v-if="loading && feeds.length === 0">
        <article v-for="n in 8" :key="'skeleton-list-' + n" class="list-item skeleton-list-item">
          <div class="list-image">
            <div class="skeleton-list-image"></div>
          </div>
          <div class="list-content">
            <div class="list-header">
              <span class="skeleton-line" style="height: 11px; width: 60px;"></span>
              <span class="skeleton-line" style="height: 11px; width: 40px;"></span>
            </div>
            <div class="skeleton-line" style="height: 18px; width: 70%; margin: 4px 0;"></div>
            <div class="skeleton-line" style="height: 14px; width: 100%; margin-bottom: 4px;"></div>
            <div class="skeleton-line" style="height: 14px; width: 85%; flex: 1;"></div>
            <div class="list-footer">
              <div class="list-author">
                <div class="skeleton-list-avatar"></div>
                <span class="skeleton-line" style="height: 13px; width: 50px;"></span>
              </div>
              <div class="list-stats">
                <span class="skeleton-line" style="height: 13px; width: 35px;"></span>
                <span class="skeleton-line" style="height: 13px; width: 35px;"></span>
              </div>
            </div>
          </div>
        </article>
      </template>
      <!-- 실제 리스트 아이템 -->
      <template v-else>
        <article v-for="feed in feeds" :key="feed.feedId" class="list-item" @click="$emit('post-click', feed.feedId)">
          <div class="list-image">
            <img :src="feed.thumbnailUrl?.fileUrl || 'https://placehold.co/400x300?text=No+Image'" :alt="feed.productName" />
            <div v-if="feed.feedEvaluation" class="list-badges-top">
              <span :class="['list-eval-badge', getEvaluationClass(feed.feedEvaluation)]">
                <span class="eval-dot"></span>
                {{ getEvaluationLabel(feed.feedEvaluation) }}
              </span>
            </div>
          </div>
          <div class="list-content">
            <p class="list-review">
              <span class="list-quote">"</span>{{ feed.reviewSummary }}<span class="list-quote">"</span>
            </p>

            <div class="list-product-info-box">
              <span class="list-buy-place">
                <svg class="list-place-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {{ feed.buyPlace || '미등록' }}
              </span>
              <span class="list-product-name">{{ feed.productName }}</span>
            </div>

            <div v-if="feed.hashtags?.length" class="list-hashtags">
              <span v-for="tag in feed.hashtags.slice(0, 2)" :key="tag" class="list-tag">#{{ tag }}</span>
            </div>

            <!-- 푸터: 작성자 + 조회수/좋아요/댓글 -->
            <div class="list-footer">
              <div class="list-author">
                <img :src="getProfileImageUrl(feed) || '/default-avatar.png'" class="list-avatar" />
                <div class="list-author-meta">
                  <span class="list-nickname">{{ getDisplayNickname(feed) }}</span>
                  <span class="list-time">{{ formatDate(feed.createdAt) }}</span>
                </div>
              </div>
              <div class="list-stats">
                <span class="stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
                  {{ formatCount(feed.viewCount || 0) }}
                </span>
                <span :class="['stat', 'like-btn', { active: feed.userReactions?.hasLike }]" @click.stop="handleLike(feed)">
                  <svg viewBox="0 0 24 24" :fill="feed.userReactions?.hasLike ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {{ formatCount(feed.likeCount || 0) }}
                </span>
                <span class="stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  {{ formatCount(feed.commentCount || 0) }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </template>
    </div>

    <!-- Loading Indicator & Infinite Scroll Target -->
    <div ref="observerTarget" class="scroll-status">
      <span v-if="loading && feeds.length > 0" class="loader"></span>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import FeedCard from './FeedCard.vue';
import feedService, { feedUtils } from '@/services/FeedService';

const props = defineProps({
  feeds: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  viewMode: { type: String, default: 'feed' }
});

const emit = defineEmits(['update', 'post-click', 'view-mode-change']);
const observerTarget = ref(null);

const getProfileImageUrl = (feed) => feed.userInfo?.profileImageFile?.fileUrl || feed.userInfo?.profileImgUrl || null;
const getDisplayNickname = (feed) => feed.userInfo?.nickname || feed.userInfo?.nickName || '익명';
const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation);
const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code;
  return { 'BEST': 'eval-best', 'GOOD': 'eval-good', 'OKAY': 'eval-okay', 'BAD': 'eval-bad' }[code] || '';
};
const formatDate = (dateString) => feedUtils.formatDate(dateString);
const formatPrice = (price) => feedUtils.formatPrice(price);
const formatCount = (count) => feedUtils.formatCount(count);

const handleLike = async (feed) => {
  const prevLiked = feed.userReactions?.hasLike;
  const prevCount = feed.likeCount || 0;

  // Optimistic update
  if (!feed.userReactions) feed.userReactions = {};
  feed.userReactions.hasLike = !prevLiked;
  feed.likeCount = prevLiked ? prevCount - 1 : prevCount + 1;

  try {
    const response = await feedService.toggleLike(feed.feedId);
    if (!response.success) throw new Error();
    // 서버 응답으로 정확한 값 업데이트
    if (response.data) {
      feed.likeCount = response.data.likeCount ?? feed.likeCount;
      feed.userReactions.hasLike = response.data.hasLike ?? feed.userReactions.hasLike;
    }
    emit('update', { feedId: feed.feedId, likeCount: feed.likeCount, hasLike: feed.userReactions.hasLike });
  } catch (e) {
    // 실패 시 롤백
    feed.userReactions.hasLike = prevLiked;
    feed.likeCount = prevCount;
  }
};

defineExpose({ observerTarget });
</script>

<style scoped>
.feed-container { max-width: 1200px; margin: 0 auto; padding: 12px 0; width: 100%; }

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid #9333ea;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 1.125rem;
  }
}

@media (min-width: 1280px) {
  .section-title {
    font-size: 1.3125rem;
  }
}

.sub-title {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 100px;
}

/* 뷰 모드 스위처 */
.view-switcher {
  display: flex;
  gap: 0.125rem;
}

.view-btn {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  color: #94a3b8;
}

.view-btn.active {
  color: #64748b;
}

/* Grid View */
.modern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* PC - 카드 세로 여백 축소 */
@media (min-width: 769px) {
  .modern-grid :deep(.post-content) { padding: 16px; }
  .modern-grid :deep(.primary-review) { margin-bottom: 10px; font-size: 15px; }
  .modern-grid :deep(.hashtag-group) { margin-bottom: 12px; }
  .modern-grid :deep(.product-info-box) { margin-bottom: 14px; padding: 10px 12px; }
  .modern-grid :deep(.post-footer) { padding-top: 10px; }
  .modern-grid :deep(.user-avatar) { width: 28px; height: 28px; }
  .modern-grid :deep(.user-nickname) { font-size: 11px; }
  .modern-grid :deep(.post-date) { font-size: 9px; }
  .modern-grid :deep(.stat-pill) { padding: 5px 10px; font-size: 11px; }
  .modern-grid :deep(.icon) { width: 14px; height: 14px; }
}

/* List View */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  display: flex;
  gap: 0;
  background: white;
  border: 1px solid #f1f1f5;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  border-color: #9993ea;
}

.list-image {
  position: relative;
  width: 180px;
  min-width: 180px;
  aspect-ratio: 1 / 1;
  background: #f8f8fa;
  overflow: hidden;
}

.list-image img { width: 100%; height: 100%; object-fit: cover; }

/* 이미지 뱃지 영역 */
.list-badges-top {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 2;
}

/* 평가 뱃지 - 그리드 뷰와 동일한 파스텔 스타일 */
.list-eval-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.list-eval-badge .eval-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.eval-best { background-color: #fef3c7; color: #92400e; }
.eval-best .eval-dot { background-color: #f59e0b; }
.eval-good { background-color: #dcfce7; color: #166534; }
.eval-good .eval-dot { background-color: #10b981; }
.eval-okay { background-color: #f3e8ff; color: #6b21a8; }
.eval-okay .eval-dot { background-color: #9333ea; }
.eval-bad { background-color: #fee2e2; color: #991b1b; }
.eval-bad .eval-dot { background-color: #ef4444; }

/* 급상승 뱃지 */
.list-trend-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 9px;
  border-radius: 100px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  font-size: 9px;
  font-weight: 800;
  color: white;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

/* 콘텐츠 영역 */
.list-content {
  flex: 1;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

/* 제품 정보 박스 */
.list-product-info-box {
  background: #f9fafb;
  border-radius: 8px;
  padding: 6px 10px;
  border: 1px solid #f1f1f5;
}
.list-buy-place {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 600;
  color: #9333ea;
  margin-bottom: 1px;
}
.list-place-icon {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

.list-product-name {
  font-size: 13px;
  font-weight: 700;
  color: #3f3f46;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  margin-top: 1px;
}

/* 리뷰 요약 */
.list-review {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.list-quote {
  color: #9993ea;
  font-family: serif;
  font-size: 16px;
  margin-right: 1px;
}

/* 해시태그 */
.list-hashtags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.list-tag {
  font-size: 11px;
  color: #a1a1aa;
  font-weight: 500;
}


/* 푸터 */
.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f4f4f7;
}

.list-author { display: flex; align-items: center; gap: 8px; }
.list-author-meta { display: flex; flex-direction: column; gap: 1px; }
.list-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
.list-nickname { font-size: 12px; font-weight: 700; color: #18181b; }
.list-time { font-size: 10px; color: #a1a1aa; }

.list-stats { display: flex; gap: 6px; }
.stat {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 10px;
  background: #f4f4f5;
  border-radius: 100px;
  font-size: 11px; font-weight: 600; color: #a1a1aa;
  transition: all 0.2s;
}
.stat svg { width: 14px; height: 14px; }
.stat.active { background: #ede9fe; color: #7c3aed; }
.stat.like-btn { cursor: pointer; }
.stat.like-btn:hover { color: #7c3aed; background: #ede9fe; }

/* Scroll Status */
.scroll-status { height: 80px; display: flex; align-items: center; justify-content: center; }
.loader { width: 24px; height: 24px; border: 3px solid #f4f4f5; border-top-color: #9993ea; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 스켈레톤 애니메이션 ===== */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ===== 그리드 뷰 스켈레톤 카드 (FeedCard와 동일한 레이아웃) ===== */
.skeleton-card {
  width: 100%;
  pointer-events: none;
  background: white;
  border-radius: 28px;
  border: 1px solid #f0f0f5;
  overflow: hidden;
}

/* 이미지 영역 - FeedCard .post-image-container와 동일 */
.skeleton-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f8f8fa;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 콘텐츠 영역 - FeedCard .post-content와 동일 */
.skeleton-content {
  padding: 22px;
}

/* 리뷰 텍스트 - FeedCard .primary-review와 동일 */
.skeleton-review {
  margin-bottom: 14px;
}

.skeleton-line {
  height: 16px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 6px;
  margin-bottom: 6px;
}

.skeleton-line.short {
  width: 70%;
  margin-bottom: 0;
}

/* 해시태그 - FeedCard .hashtag-group와 동일 */
.skeleton-hashtags {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.skeleton-tag {
  height: 14px;
  width: 50px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 6px;
}

.skeleton-tag:nth-child(2) { width: 60px; }
.skeleton-tag:nth-child(3) { width: 45px; }

/* 제품 정보 박스 스켈레톤 */
.skeleton-product-box {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid #f1f1f5;
}

.skeleton-category {
  height: 10px;
  width: 50px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
  margin-bottom: 6px;
}

.skeleton-product-name {
  height: 15px;
  width: 100px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 6px;
}

/* 푸터 - FeedCard .post-footer와 동일 */
.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid #f4f4f7;
}

.skeleton-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skeleton-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  flex-shrink: 0;
}

.skeleton-user-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.skeleton-nickname {
  height: 13px;
  width: 50px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
}

.skeleton-date {
  height: 10px;
  width: 35px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
}

.skeleton-actions {
  display: flex;
  gap: 6px;
}

.skeleton-stat-pill {
  width: 55px;
  height: 30px;
  border-radius: 100px;
  background-color: #f4f4f7;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* ===== 리스트 뷰 스켈레톤 ===== */
.skeleton-list-item {
  pointer-events: none;
}

.skeleton-list-image {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-list-item .list-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-list-item .list-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-list-item .list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f4f4f7;
}

.skeleton-list-item .list-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-list-item .list-stats {
  display: flex;
  gap: 16px;
}

.skeleton-list-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  flex-shrink: 0;
}

/* Feed Empty State */
.feed-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  min-height: 400px;
}

.feed-empty-state .empty-illustration {
  position: relative;
  width: 140px;
  height: 140px;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feed-empty-state .illustration-circle {
  position: absolute;
  border-radius: 50%;
  animation: empty-pulse 3s ease-in-out infinite;
}

.feed-empty-state .circle-1 {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, rgba(153, 147, 234, 0.15) 0%, rgba(153, 147, 234, 0.05) 100%);
  animation-delay: 0s;
}

.feed-empty-state .circle-2 {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(153, 147, 234, 0.2) 0%, rgba(153, 147, 234, 0.1) 100%);
  animation-delay: 0.5s;
}

.feed-empty-state .illustration-icon {
  width: 56px;
  height: 56px;
  color: #9993ea;
  z-index: 1;
}

@keyframes empty-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.7;
  }
}

.feed-empty-state .empty-content {
  max-width: 300px;
}

.feed-empty-state .empty-title {
  font-size: 20px;
  font-weight: 800;
  color: #18181b;
  margin: 0 0 8px 0;
}

.feed-empty-state .empty-description {
  font-size: 14px;
  color: #71717a;
  line-height: 1.5;
  margin: 0;
}

/* Mobile */
@media (max-width: 768px) {
  .feed-container {
    padding: 12px 0;
    background: white;
  }

  .feed-header {
    margin-bottom: 12px;
  }

  .section-title { font-size: 1rem; }

  /* 모바일 Empty State */
  .feed-empty-state {
    padding: 60px 24px;
    min-height: 300px;
    margin-top: 16px;
  }
  .feed-empty-state .empty-illustration {
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
  }
  .feed-empty-state .circle-1 {
    width: 100px;
    height: 100px;
  }
  .feed-empty-state .circle-2 {
    width: 70px;
    height: 70px;
  }
  .feed-empty-state .illustration-icon {
    width: 40px;
    height: 40px;
  }
  .feed-empty-state .empty-title {
    font-size: 17px;
  }
  .feed-empty-state .empty-description {
    font-size: 13px;
  }

  /* 그리드 뷰: 간격 제거, 전체 너비 */
  .modern-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  /* 리스트 뷰: 경계선 스타일 */
  .list-view {
    gap: 0;
  }

  .list-item {
    border-radius: 0;
    border: none;
    border-bottom: 1px solid #e5e5e5;
    background: transparent;
  }
  .list-item:hover {
    transform: none;
    box-shadow: none;
    border-color: #e5e5e5;
  }
  .list-item:active {
    background: #fafafa;
    transform: none;
  }

  .list-image { width: 120px; min-width: 120px; }

  .list-badges-top { top: 8px; left: 8px; gap: 4px; }
  .list-eval-badge { padding: 3px 7px; font-size: 9px; gap: 4px; }
  .list-eval-badge .eval-dot { width: 4px; height: 4px; }
  .list-trend-badge { padding: 3px 6px; font-size: 8px; }
  .list-price-overlay { bottom: 6px; right: 6px; font-size: 10px; padding: 2px 6px; }

  .list-content { padding: 10px 12px; gap: 6px; }
  .list-review { font-size: 12px; -webkit-line-clamp: 2; }
  .list-quote { font-size: 13px; }
  .list-hashtags { gap: 5px; }
  .list-tag { font-size: 10px; }

  .list-product-info-box { padding: 5px 8px; border-radius: 6px; border: none; }
  .list-buy-place { font-size: 8px; gap: 2px; }
  .list-place-icon { width: 9px; height: 9px; }
  .list-product-name { font-size: 11px; }
  .list-hashtags { gap: 4px; }
  .list-tag { font-size: 9px; }

  .list-footer { padding-top: 6px; }
  .list-avatar { width: 22px; height: 22px; }
  .list-nickname { font-size: 10px; }
  .list-time { font-size: 9px; }
  .stat { font-size: 10px; padding: 4px 8px; }
  .stat svg { width: 12px; height: 12px; }

  /* 모바일 스켈레톤: 그리드 뷰 - FeedCard 모바일과 동일 */
  .skeleton-card {
    border-radius: 0;
    border: none;
    background: transparent;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #d0d0d0;
  }

  .skeleton-image-container {
    border-radius: 0;
  }

  .skeleton-content {
    padding: 14px 16px 4px;
  }

  .skeleton-review {
    margin-bottom: 10px;
  }

  .skeleton-line {
    height: 14px;
    margin-bottom: 4px;
  }

  .skeleton-hashtags {
    margin-bottom: 12px;
    gap: 6px;
  }

  .skeleton-tag {
    height: 12px;
    width: 40px;
  }

  .skeleton-tag:nth-child(2) { width: 50px; }
  .skeleton-tag:nth-child(3) { width: 35px; }

  .skeleton-product-box {
    padding: 10px 12px;
    margin-bottom: 10px;
    border-radius: 10px;
    border: none;
  }

  .skeleton-category {
    height: 9px;
    width: 45px;
  }

  .skeleton-product-name {
    height: 13px;
    width: 80px;
  }

  .skeleton-footer {
    padding-top: 8px;
    border-top: none;
  }

  .skeleton-avatar {
    width: 28px;
    height: 28px;
  }

  .skeleton-nickname {
    height: 12px;
    width: 45px;
  }

  .skeleton-date {
    height: 9px;
    width: 30px;
  }

  .skeleton-stat-pill {
    width: 45px;
    height: 26px;
  }

  /* 모바일 스켈레톤: 리스트 뷰 */
  .skeleton-list-avatar {
    width: 22px;
    height: 22px;
  }

  .skeleton-list-item .list-footer {
    padding-top: 8px;
  }
}

/* 접근성: 모션 감소 선호 시 */
@media (prefers-reduced-motion: reduce) {
  .skeleton-line,
  .skeleton-image,
  .skeleton-avatar,
  .skeleton-stat-pill,
  .skeleton-tag,
  .skeleton-category,
  .skeleton-product-name,
  .skeleton-category,
  .skeleton-nickname,
  .skeleton-date,
  .skeleton-list-image,
  .skeleton-list-avatar {
    animation: none;
    background-color: #e5e7eb;
  }
}
</style>
