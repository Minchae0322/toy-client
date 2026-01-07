<template>
  <div class="info-section">
    <section class="review-section">
      <div :class="['eval-badge', getEvaluationClass(feed.feedEvaluation)]">
        <span class="eval-dot" />
        {{ getEvaluationLabel(feed.feedEvaluation) }}
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
        <span class="category-tag">{{ getCategoryName }}</span>
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

    <div class="divider" />

    <section class="author-section">
      <img :src="getAuthorProfileImage" class="author-avatar" alt="" />
      <div class="author-meta">
        <span class="author-name">{{ getAuthorNickname }}</span>
        <span class="post-info">{{ formatDate(feed.createdAt) }} · 조회 {{ feed.viewCount?.toLocaleString() }}</span>
      </div>
      <button
          @click="isFollowing ? $emit('unfollow') : $emit('follow')"
          :class="['follow-btn', { active: isFollowing }]"
      >
        {{ isFollowing ? '팔로잉' : '팔로우' }}
      </button>
    </section>

    <button class="cta-floating-btn" @click="handleSendMessage" :disabled="isCreatingChatRoom">
      <template v-if="!isCreatingChatRoom">
        <svg class="cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        이 유저에게 문의하기
      </template>
      <span v-else class="loader">연결 중...</span>
    </button>
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
.info-section { padding: 24px; background: #fff; max-width: 600px; margin: 0 auto; }

/* 2. Review Section */
.review-section { margin-bottom: 28px; }

/* [중요] 파스텔톤 뱃지 스타일 */
.eval-badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px;
  font-size: 11px; font-weight: 800; margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.eval-badge.best { background-color: #fef3c7; color: #92400e; }
.eval-badge.good { background-color: #dcfce7; color: #166534; }
.eval-badge.okay { background-color: #f3e8ff; color: #6b21a8; }
.eval-badge.bad { background-color: #fee2e2; color: #991b1b; }

.eval-dot { width: 6px; height: 6px; border-radius: 50%; background-color: currentColor; opacity: 0.6; }

.quote-wrapper { position: relative; padding-left: 28px; }
.quote-icon { position: absolute; left: 0; top: 0; width: 18px; height: 18px; color: #9993ea; opacity: 0.4; }
.review-text { font-size: 16px; line-height: 1.7; color: #1f2937; font-weight: 500; white-space: pre-line; margin: 0; }

/* 3 & 4. Product Banner */
.product-info-banner {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8f8fa; padding: 18px 22px; border-radius: 20px; margin-bottom: 28px;
  border: 1px solid #f1f1f5; cursor: pointer; transition: 0.2s;
}
.product-info-banner:active { transform: scale(0.98); background: #f1f1f5; }
.category-tag { font-size: 10px; font-weight: 800; color: #9333ea; text-transform: uppercase; letter-spacing: 0.5px; }
.product-title { font-size: 15px; font-weight: 700; color: #111827; margin: 2px 0 0; }
.price-area { text-align: right; }
.price-label { display: block; font-size: 10px; color: #9ca3af; margin-bottom: 2px; font-weight: 600; }
.price-value { font-size: 17px; font-weight: 800; color: #9333ea; }

/* 5. Interaction Bar */
.interaction-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 0 4px; }
.stat-group { display: flex; gap: 16px; }
.stat-btn {
  display: flex; align-items: center; gap: 6px; background: none; border: none;
  font-size: 14px; font-weight: 700; color: #6b7280; cursor: pointer; transition: 0.2s;
}
.stat-btn .icon { width: 22px; height: 22px; }
.stat-btn.active { color: #f43f5e; }
.bookmark-btn { background: none; border: none; color: #6b7280; cursor: pointer; }
.bookmark-btn .icon { width: 22px; height: 22px; }
.bookmark-btn.active { color: #9333ea; }

/* 6. Hashtags */
.hashtag-section { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
.tag-chip {
  padding: 8px 14px; border-radius: 12px; background: #f3f4f6; border: none;
  font-size: 12px; font-weight: 600; color: #4b5563; cursor: pointer; transition: 0.2s;
}
.tag-chip:active { background: #e5e7eb; }

.divider { height: 1px; background: #f1f5f9; margin-bottom: 32px; }

/* 7. Author Section */
.author-section { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.author-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px solid #f1f5f9; }
.author-meta { flex: 1; }
.author-name { display: block; font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 2px; }
.post-info { font-size: 12px; color: #9ca3af; font-weight: 500; }
.follow-btn {
  padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; border: none;
  background: #111827; color: #fff; cursor: pointer;
}
.follow-btn.active { background: #f3f4f6; color: #6b7280; }

/* 8. CTA Button */
.cta-floating-btn {
  width: 100%; padding: 16px; border-radius: 16px; border: none;
  background: #9333ea; color: #fff; font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 10px 20px -5px rgba(147, 51, 234, 0.3); cursor: pointer; transition: 0.3s;
  white-space: nowrap;
}
.cta-floating-btn:active { transform: translateY(2px); box-shadow: none; }
.cta-floating-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.cta-icon { width: 20px; height: 20px; flex-shrink: 0; }
.loader { font-size: 14px; letter-spacing: 0.5px; }
</style>