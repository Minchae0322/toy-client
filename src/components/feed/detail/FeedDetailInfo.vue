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
          <!-- 카테고리 (우측) -->
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
          <span class="price-value">{{ formatPrice(feed.buyPrice || feed.price) }}</span>
        </div>
      </section>

      <section class="interaction-bar">
        <div class="stat-group">
          <button
              :class="['stat-btn', { active: feed.userReactions?.hasLike }]"
              @click="$emit('like')"
          >
            <svg class="icon" :fill="feed.userReactions?.hasLike ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span>{{ feed.likeCount || 0 }}</span>
          </button>
          <button class="stat-btn" @click="$emit('scroll-to-comments')">
            <svg class="icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span>{{ feed.commentCount || 0 }}</span>
          </button>
        </div>
        <button :class="['bookmark-btn', { active: isSaved }]" @click="$emit('save')">
          <svg class="icon" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
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
            <svg v-if="!isCreatingChatRoom" class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
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
const formatPrice = (price) => price ? new Intl.NumberFormat('ko-KR').format(price) + '원' : '가격 미정'

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
.info-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 24px 24px;
  background: #fff;
}

.info-content {
  flex: 1;
}

.info-footer {
  margin-top: auto;
}

/* 2. Review Section */
.review-section { margin-bottom: 20px; }

.badge-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }

.category-breadcrumb {
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  color: #9333ea;
}

.breadcrumb-arrow {
  margin: 0 4px;
  color: #c4b5fd;
}

/* [중요] 파스텔톤 뱃지 스타일 */
.eval-badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 100px;
  font-size: 13px; font-weight: 800;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

/* 급상승 뱃지 */
.trend-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 16px; border-radius: 100px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  font-size: 13px; font-weight: 800; color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  animation: pulse-trend 2s ease-in-out infinite;
}
@keyframes pulse-trend {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.eval-badge.best { background-color: #fef3c7; color: #92400e; }
.eval-badge.good { background-color: #dcfce7; color: #166534; }
.eval-badge.okay { background-color: #f3e8ff; color: #6b21a8; }
.eval-badge.bad { background-color: #fee2e2; color: #991b1b; }

.eval-dot { width: 6px; height: 6px; border-radius: 50%; background-color: currentColor; opacity: 0.6; }

.quote-wrapper { position: relative; padding-left: 32px; }
.quote-icon { position: absolute; left: 0; top: 2px; width: 20px; height: 20px; color: #9993ea; opacity: 0.4; }
.review-text { font-size: 18px; line-height: 1.7; color: #1f2937; font-weight: 600; white-space: pre-line; margin: 0; }

/* 3 & 4. Product Banner */
.product-info-banner {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8f8fa; padding: 18px 22px; border-radius: 20px; margin-bottom: 16px;
  border: 1px solid #f1f1f5; cursor: pointer; transition: 0.2s;
}
.product-info-banner:active { transform: scale(0.98); background: #f1f1f5; }
.buy-place {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 500;
  color: #9333ea;
  margin-bottom: 4px;
}
.place-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.product-main { min-width: 0; flex: 1; }
.product-title { font-size: 18px; font-weight: 700; color: #111827; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.price-area { text-align: right; flex-shrink: 0; margin-left: 12px; }
.price-label { display: block; font-size: 12px; color: #9ca3af; margin-bottom: 2px; font-weight: 600; }
.price-value { font-size: 20px; font-weight: 800; color: #9333ea; white-space: nowrap; }

/* 5. Interaction Bar */
.interaction-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 0 4px; }
.stat-group { display: flex; gap: 16px; }
.stat-btn {
  display: flex; align-items: center; gap: 5px; background: none; border: none;
  font-size: 14px; font-weight: 600; color: #6b7280; cursor: pointer; transition: 0.2s;
}
.stat-btn .icon { width: 20px; height: 20px; }
.stat-btn.active { color: #f43f5e; }
.bookmark-btn { background: none; border: none; color: #6b7280; cursor: pointer; }
.bookmark-btn .icon { width: 24px; height: 24px; }
.bookmark-btn.active { color: #9333ea; }

/* 6. Hashtags */
.hashtag-section { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
.tag-chip {
  padding: 8px 14px; border-radius: 12px; background: #f3f4f6; border: none;
  font-size: 12px; font-weight: 600; color: #4b5563; cursor: pointer; transition: 0.2s;
}
.tag-chip:active { background: #e5e7eb; }

/* 등록일시 · 조회수 */
.post-meta {
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  margin-bottom: 12px;
}

.divider { height: 1px; background: #f1f5f9; margin-bottom: 20px; }

/* 7. Author Section */
.author-section { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.author-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px solid #f1f5f9; }
.author-meta { flex: 1; }
.author-name { display: block; font-size: 16px; font-weight: 700; color: #111827; }
.author-actions { display: flex; gap: 8px; }
.follow-btn {
  padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 700; border: none;
  background: #111827; color: #fff; cursor: pointer; transition: 0.2s;
}
.follow-btn:active { transform: scale(0.96); }
.follow-btn.active { background: #f3f4f6; color: #6b7280; }
.message-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 700; border: none;
  background: #9333ea; color: #fff; cursor: pointer; transition: 0.2s;
}
.message-btn:active { transform: scale(0.96); }
.message-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.message-icon { width: 16px; height: 16px; flex-shrink: 0; }
</style>