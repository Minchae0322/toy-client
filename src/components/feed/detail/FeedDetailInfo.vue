<template>
  <div class="info-section">
    <div class="info-content">
      <section class="review-section">
        <div class="badge-row">
          <div :class="['eval-badge', getEvaluationClass(feed.feedEvaluation)]">
            <span class="eval-dot" />
            {{ getEvaluationLabel(feed.feedEvaluation) }}
          </div>
          <div v-if="feed.isTrending" class="trend-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            급상승
          </div>
          <span class="category-breadcrumb">
            카테고리 <span class="breadcrumb-arrow">›</span> {{ getCategoryName }}
          </span>
        </div>

        <div class="quote-wrapper">
          <svg class="quote-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          <p class="review-text">{{ feed.review }}</p>
        </div>
      </section>

      <section class="product-info-banner" @click="$emit('search-store', getProductName)">
        <div class="product-main">
          <span class="buy-place">
            <svg class="place-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {{ feed.buyPlace || '미등록' }}
          </span>
          <h1 class="product-title">{{ getProductName }}</h1>
        </div>
        <div class="price-area">
          <span class="price-label">구매가</span>
          <span class="price-value">{{ feed.buyPrice == null ? '가격정보 없음' : feed.buyPrice === 0 ? '무료' : formatPrice(feed.buyPrice) }}</span>
        </div>
      </section>

      <section class="interaction-bar">
        <div class="stat-group">
          <button
              :class="['stat-btn', { active: feed.userReactions?.hasLike }]"
              @click="$emit('like')"
          >
            <svg class="icon" viewBox="0 0 24 24" :fill="feed.userReactions?.hasLike ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{{ feed.likeCount || 0 }}</span>
          </button>
          <button class="stat-btn" @click="$emit('scroll-to-comments')">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{{ feed.commentCount || 0 }}</span>
          </button>
        </div>
        <button :class="['bookmark-btn', { active: isSaved }]" @click="$emit('save')">
          <svg class="icon" viewBox="0 0 24 24" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </section>

      <section v-if="feed.hashtags?.length" class="hashtag-section">
        <button
            v-for="tag in feed.hashtags"
            :key="tag.hashtagId"
            class="tag-chip"
            @click="$emit('search-hashtag', tag.name)"
        >
          #{{ tag.name }}
        </button>
      </section>
    </div>

    <div class="info-footer">
      <!-- 등록일시 · 조회수 (우측) -->
      <div class="post-meta">
        {{ formatDate(feed.createdAt) }} · 조회 {{ feed.viewCount?.toLocaleString() }}
      </div>
      <div class="divider" />

      <section class="author-section">
        <img :src="getAuthorProfileImage" class="author-avatar" alt="" />
        <div class="author-meta">
          <span class="author-name">{{ getAuthorNickname }}</span>
        </div>
        <div class="author-actions">
          <button
              @click="isFollowing ? $emit('unfollow') : $emit('follow')"
              :class="['follow-btn', { active: isFollowing }]"
          >
            {{ isFollowing ? '팔로잉' : '팔로우' }}
          </button>
          <button class="message-btn" @click="handleSendMessage" :disabled="isCreatingChatRoom">
            <svg v-if="!isCreatingChatRoom" class="message-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6l-4 4V6c0-1.1.9-2 2-2z"/>
              <line x1="9" y1="10" x2="15" y2="10"/>
              <line x1="9" y1="14" x2="13" y2="14"/>
            </svg>
            {{ isCreatingChatRoom ? '...' : '메시지' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  feed: { type: Object, required: true },
  isFollowing: { type: Boolean, default: false },
  isSaved: { type: Boolean, default: false }
})

const emit = defineEmits(['follow', 'unfollow', 'like', 'save', 'search-store', 'search-hashtag', 'scroll-to-comments', 'send-message'])

const isCreatingChatRoom = ref(false)

/* 헬퍼 함수 및 계산된 속성 */
const getProductName = computed(() => props.feed?.product?.name || props.feed?.productNameCustom || props.feed?.productName || '상품 정보')
const getCategoryName = computed(() => props.feed?.subCategoryDetail?.subCategoryName || props.feed?.subCategoryDetail?.categoryName || '카테고리')
const getAuthorProfileImage = computed(() => props.feed?.userInfo?.profileImageFile?.fileUrl || props.feed?.userInfo?.profileImageUrl || 'https://i.pravatar.cc/150')
const getAuthorNickname = computed(() => props.feed?.userInfo?.nickname || '사용자')

const formatDate = (date) => date ? new Date(date).toLocaleDateString('ko-KR') : ''
const formatPrice = (price) => {
  if (!price && price !== 0) return '가격 미정'
  const s = String(price).replace(/,/g, '').trim()
  const m = s.match(/^(\d+)\s*~\s*(\d+)$/)
  if (m) return Number(m[1]).toLocaleString() + ' ~ ' + Number(m[2]).toLocaleString() + '원'
  const n = Number(s)
  return isNaN(n) ? '가격 미정' : n.toLocaleString() + '원'
}

const getEvaluationLabel = (ev) => {
  const code = typeof ev === 'string' ? ev : ev?.code
  return { 'BEST': '강력추천', 'GOOD': '추천', 'OKAY': '보통', 'BAD': '별로' }[code] || '평가 정보'
}

const getEvaluationClass = (ev) => {
  const code = typeof ev === 'string' ? ev : ev?.code
  return code?.toLowerCase() || ''
}

const handleSendMessage = () => {
  if (isCreatingChatRoom.value) return
  emit('send-message', props.feed)
}
</script>

<style scoped>
/* 색상: #191F28 / #4E5968 / #8B95A1 / #B0B8C1 (토스 계열) */
/* 간격: 4px 그리드 */

.info-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px 24px;
  background: #fff;
}

.info-content { flex: 1; }
.info-footer { margin-top: auto; }

/* 리뷰 섹션 */
.review-section { margin-bottom: 20px; }

.badge-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }

.category-breadcrumb {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: #8B95A1;
  letter-spacing: -0.01em;
}
.breadcrumb-arrow { margin: 0 2px; color: #B0B8C1; }

/* 뱃지 */
.eval-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 100px;
  font-size: 12px; font-weight: 700;
}
.eval-badge.best { background-color: rgba(254,243,199,0.92); color: #92400e; }
.eval-badge.good { background-color: rgba(220,252,231,0.92); color: #166534; }
.eval-badge.okay { background-color: rgba(243,232,255,0.92); color: #6b21a8; }
.eval-badge.bad { background-color: rgba(254,226,226,0.92); color: #991b1b; }

.eval-dot { width: 6px; height: 6px; border-radius: 50%; background-color: currentColor; opacity: 0.6; }

.trend-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 100px;
  background: #f43f5e;
  font-size: 12px; font-weight: 700; color: white;
  animation: pulse-trend 2s ease-in-out infinite;
}
@keyframes pulse-trend {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* 리뷰 텍스트 */
.quote-wrapper { position: relative; padding-left: 28px; }
.quote-icon {
  position: absolute; left: 0; top: 2px;
  width: 18px; height: 18px; color: #9333EA; opacity: 0.3;
}
.review-text {
  font-size: 16px; line-height: 1.7; color: #191F28;
  font-weight: 600; white-space: pre-line; margin: 0;
  letter-spacing: -0.02em; word-break: keep-all;
}

/* 제품 배너 */
.product-info-banner {
  display: flex; justify-content: space-between; align-items: center;
  background: #F7F8FA; padding: 16px 20px; border-radius: 12px;
  margin-bottom: 16px; border: none;
  cursor: pointer; transition: all 0.15s ease;
}
.product-info-banner:active { transform: scale(0.98); background: #F2F4F6; }
.product-main { min-width: 0; flex: 1; }
.buy-place {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 600; color: #9333EA; margin-bottom: 4px;
}
.place-icon { width: 13px; height: 13px; flex-shrink: 0; }
.product-title {
  font-size: 16px; font-weight: 700; color: #191F28;
  margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  letter-spacing: -0.02em;
}
.price-area { text-align: right; flex-shrink: 0; margin-left: 16px; }
.price-label { display: block; font-size: 11px; color: #8B95A1; margin-bottom: 2px; font-weight: 500; }
.price-value { font-size: 17px; font-weight: 700; color: #9333EA; white-space: nowrap; letter-spacing: -0.02em; }

/* 인터랙션 바 */
.interaction-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; padding: 12px 0;
  border-bottom: 1px solid #F2F4F6;
}
.stat-group { display: flex; gap: 12px; }
.stat-btn {
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; padding: 0;
  font-size: 14px; font-weight: 600; color: #8B95A1;
  cursor: pointer; transition: color 0.15s ease;
}
.stat-btn .icon { width: 20px; height: 20px; }
.stat-btn.active { color: #f43f5e; }
.bookmark-btn {
  background: none; border: none; padding: 0;
  color: #8B95A1; cursor: pointer; transition: color 0.15s ease;
}
.bookmark-btn .icon { width: 22px; height: 22px; }
.bookmark-btn.active { color: #9333EA; }

/* 해시태그 */
.hashtag-section { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.tag-chip {
  padding: 6px 12px; border-radius: 8px;
  background: #F2F4F6; border: none;
  font-size: 13px; font-weight: 500; color: #4E5968;
  cursor: pointer; transition: background 0.15s ease;
}
.tag-chip:active { background: #E5E8EB; }

/* 메타 */
.post-meta {
  text-align: right;
  font-size: 12px; color: #B0B8C1;
  font-weight: 400; margin-bottom: 12px;
}

.divider { height: 1px; background: #F2F4F6; margin-bottom: 16px; }

/* 작성자 */
.author-section { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.author-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  object-fit: cover; border: 1px solid #F2F4F6;
}
.author-meta { flex: 1; }
.author-name {
  display: block; font-size: 15px; font-weight: 600;
  color: #191F28; letter-spacing: -0.01em;
}
.author-actions { display: flex; gap: 8px; }
.follow-btn {
  padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 700; border: none;
  background: #191F28; color: #fff;
  cursor: pointer; transition: all 0.15s ease;
}
.follow-btn:active { transform: scale(0.96); }
.follow-btn.active { background: #F2F4F6; color: #8B95A1; }
.message-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 700; border: none;
  background: #9333EA; color: #fff;
  cursor: pointer; transition: all 0.15s ease;
}
.message-btn:active { transform: scale(0.96); }
.message-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.message-icon { width: 14px; height: 14px; flex-shrink: 0; }
</style>