<template>
  <div class="info-section">
    <!-- Header -->
    <div class="header">
      <div :class="['eval-badge', getEvaluationClass(feed.feedEvaluation)]">
        <span class="eval-dot" />
        <span>{{ getEvaluationLabel(feed.feedEvaluation) }}</span>
      </div>
      <h1 class="title">{{ getProductName }}</h1>
      <p class="category">{{ getCategoryName }}</p>
    </div>

    <!-- Review -->
    <div class="review-card">
      <svg class="quote-icon" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
      </svg>
      <p class="review-text">{{ feed.review }}</p>
    </div>

    <!-- Info Row -->
    <div class="info-row">
      <div v-if="feed.buyPlace" class="info-item">
        <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span>{{ feed.buyPlace }}</span>
      </div>
      <div v-if="feed.buyPrice || feed.price" class="info-item price">
        <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 8v2"/>
        </svg>
        <span>{{ formatPrice(feed.buyPrice || feed.price) }}</span>
      </div>
    </div>

    <!-- Hashtags -->
    <div v-if="feed.hashtags?.length" class="hashtags">
      <button
          v-for="tag in feed.hashtags"
          :key="tag.hashtagId"
          class="hashtag"
          @click="$emit('search-hashtag', tag.name)"
      >
        #{{ tag.name }}
      </button>
    </div>

    <div class="divider" />

    <!-- Reactions -->
    <div class="reactions">
      <button @click="$emit('hot')" :class="['react-btn', { active: feed.userReactions?.hasHot, hot: true }]">
        <svg class="react-icon" :fill="feed.userReactions?.hasHot ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
        </svg>
        <span>{{ feed.hotCount || 0 }}</span>
      </button>
      <button @click="$emit('like')" :class="['react-btn', { active: feed.userReactions?.hasLike, like: true }]">
        <svg class="react-icon" :fill="feed.userReactions?.hasLike ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        <span>{{ feed.likeCount || 0 }}</span>
      </button>
      <button class="react-btn" @click="$emit('scroll-to-comments')">
        <svg class="react-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span>{{ feed.commentCount || 0 }}</span>
      </button>
      <button @click="$emit('save')" :class="['react-btn bookmark', { active: isSaved }]">
        <svg class="react-icon" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
      </button>
    </div>

    <div class="divider" />

    <!-- Author -->
    <div class="author">
      <img :src="getAuthorProfileImage" class="avatar" alt="" />
      <div class="author-info">
        <span class="name">{{ getAuthorNickname }}</span>
        <span class="meta">{{ formatDate(feed.createdAt) }} · 조회 {{ feed.viewCount?.toLocaleString() || 0 }}</span>
      </div>
      <button
          @click="isFollowing ? $emit('unfollow') : $emit('follow')"
          :class="['follow-btn', { active: isFollowing }]"
      >
        {{ isFollowing ? '팔로잉' : '팔로우' }}
      </button>
    </div>

    <!-- CTA -->
    <button class="cta-btn" @click="handleSendMessage" :disabled="isCreatingChatRoom">
      <template v-if="!isCreatingChatRoom">
        <svg class="cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        문의하기
      </template>
      <template v-else>
        <div class="spinner" />
        연결 중...
      </template>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { chatService } from '@/services/ChatService'

const router = useRouter()

const props = defineProps({
  feed: { type: Object, required: true },
  isFollowing: { type: Boolean, default: false },
  isSaved: { type: Boolean, default: false }
})

const emit = defineEmits([
  'follow', 'unfollow', 'like', 'hot', 'save',
  'search-store', 'search-hashtag', 'scroll-to-comments'
])

const isCreatingChatRoom = ref(false)

const getProductName = computed(() =>
    props.feed?.product?.name || props.feed?.productNameCustom || props.feed?.productName || '상품명 없음'
)

const getCategoryName = computed(() =>
    props.feed?.subCategoryDetail?.subCategoryName || props.feed?.subCategoryDetail?.categoryName || props.feed?.product?.brand || ''
)

const getAuthorProfileImage = computed(() => {
  const userInfo = props.feed?.userInfo
  if (!userInfo) return 'https://i.pravatar.cc/150'
  return userInfo.profileImageFile?.fileUrl || userInfo.profileImageUrl || 'https://i.pravatar.cc/150'
})

const getAuthorNickname = computed(() =>
    props.feed?.userInfo?.nickname || props.feed?.userInfo?.nickName || '사용자'
)

const getEvaluationCode = computed(() => {
  const eval_ = props.feed?.feedEvaluation
  return typeof eval_ === 'string' ? eval_ : eval_?.code
})

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub
  } catch { return null }
}

const formatDate = (date) => date ? new Date(date).toLocaleDateString('ko-KR') : ''

const formatPrice = (price) => {
  if (!price) return ''
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

const getEvaluationLabel = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code
  return { 'BEST': '강력추천', 'GOOD': '추천', 'OKAY': '보통', 'BAD': '별로' }[code] || ''
}

const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code
  return { 'BEST': 'best', 'GOOD': 'good', 'OKAY': 'okay', 'BAD': 'bad' }[code] || ''
}

const handleSendMessage = async () => {
  if (isCreatingChatRoom.value) return
  try {
    isCreatingChatRoom.value = true
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      alert('로그인이 필요한 서비스입니다.')
      router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
      return
    }
    if (currentUserId === props.feed.userInfo?.userId) {
      alert('본인의 게시글에는 문의할 수 없습니다.')
      return
    }
    const response = await chatService.startChat({
      chatContext: 'PRODUCT_TRADE',
      chatContextId: props.feed.feedId,
      creatorId: props.feed.userInfo.userId,
      participantIds: [props.feed.userInfo.userId, currentUserId]
    })
    if (!response.success) throw new Error(response.error || '채팅방 생성에 실패했습니다.')
    router.push({
      name: 'ChatWithRoom',
      params: { roomId: response.data.roomId },
      query: { userName: getAuthorNickname.value, feedId: props.feed.feedId, productName: getProductName.value }
    })
  } catch (error) {
    alert(error.message || '채팅방 생성에 실패했습니다.')
  } finally {
    isCreatingChatRoom.value = false
  }
}
</script>

<style scoped>
.info-section {
  padding: 20px;
}

/* Header */
.header {
  margin-bottom: 20px;
}

.eval-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.eval-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.eval-badge.best { background: #fff7ed; color: #ea580c; }
.eval-badge.best .eval-dot { background: #fb923c; }

.eval-badge.good { background: #ecfdf5; color: #059669; }
.eval-badge.good .eval-dot { background: #34d399; }

.eval-badge.okay { background: #f5f5f4; color: #78716c; }
.eval-badge.okay .eval-dot { background: #a8a29e; }

.eval-badge.bad { background: #fef2f2; color: #dc2626; }
.eval-badge.bad .eval-dot { background: #f87171; }

.title {
  font-size: 18px;
  font-weight: 700;
  color: #1c1917;
  line-height: 1.4;
  margin-bottom: 4px;
}

.category {
  font-size: 14px;
  color: #a8a29e;
}

/* Review */
.review-card {
  position: relative;
  background: #fafaf9;
  border-radius: 12px;
  padding: 16px;
  padding-left: 40px;
  margin-bottom: 16px;
}

.quote-icon {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 18px;
  height: 18px;
  color: #d6d3d1;
}

.review-text {
  font-size: 14px;
  color: #57534e;
  line-height: 1.7;
  white-space: pre-line;
}

/* Info Row */
.info-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #78716c;
}

.info-item.price {
  font-weight: 500;
  color: #44403c;
}

.info-icon {
  width: 16px;
  height: 16px;
  color: #a8a29e;
}

/* Hashtags */
.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.hashtag {
  font-size: 12px;
  color: #8b5cf6;
  background: #f5f3ff;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.hashtag:hover {
  background: #ede9fe;
}

/* Divider */
.divider {
  height: 1px;
  background: #f5f5f4;
  margin: 16px 0;
}

/* Reactions */
.reactions {
  display: flex;
  gap: 8px;
}

.react-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: #fafaf9;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #a8a29e;
  cursor: pointer;
  transition: all 0.15s;
}

.react-btn:hover {
  background: #f5f5f4;
}

.react-icon {
  width: 16px;
  height: 16px;
}

.react-btn.hot.active {
  background: #fff7ed;
  color: #ea580c;
}

.react-btn.hot.active .react-icon {
  color: #ea580c;
}

.react-btn.like.active {
  background: #fff1f2;
  color: #f43f5e;
}

.react-btn.bookmark {
  margin-left: auto;
  padding: 8px;
}

.react-btn.bookmark.active {
  background: #f5f3ff;
  color: #8b5cf6;
}

/* Author */
.author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: #1c1917;
}

.meta {
  font-size: 12px;
  color: #a8a29e;
}

.follow-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: #1c1917;
  color: #fff;
  transition: all 0.15s;
}

.follow-btn:hover {
  background: #44403c;
}

.follow-btn.active {
  background: #f5f5f4;
  color: #78716c;
}

.follow-btn.active:hover {
  background: #e7e5e4;
}

/* CTA */
.cta-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: #8b5cf6;
  color: #fff;
  transition: background 0.15s;
}

.cta-btn:hover:not(:disabled) {
  background: #7c3aed;
}

.cta-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cta-icon {
  width: 20px;
  height: 20px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>