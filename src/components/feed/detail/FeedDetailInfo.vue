<template>
  <div class="info-section">
    <div class="scrollable-content">
      <!-- 1. Product Info -->
      <div class="product-section">
        <div class="meta-row">
          <span v-if="feed.feedEvaluation" :class="['eval-badge', getEvaluationClass(feed.feedEvaluation)]">
            {{ getEvaluationLabel(feed.feedEvaluation) }}
          </span>
          <span class="category">{{ getCategoryName }}</span>
        </div>
        <h1 class="product-name">{{ getProductName }}</h1>
        <div class="price-row">
          <span class="buy-price">{{ formatPrice(feed.buyPrice || feed.price) }}</span>
          <div v-if="feed.buyPlace" class="store" @click="$emit('search-store')">
            <svg class="store-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            {{ feed.buyPlace }}
          </div>
        </div>
        <p class="review-text">{{ feed.review }}</p>
        <div v-if="feed.hashtags?.length" class="hashtags">
          <button v-for="tag in feed.hashtags" :key="tag.hashtagId" class="hashtag" @click="$emit('search-hashtag', tag.name)">
            #{{ tag.name }}
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 2. Reactions -->
      <div class="reaction-section">
        <div class="reaction-row">
          <div class="reaction-buttons">
            <button @click="$emit('hot')" :class="['reaction-btn', 'hot', { active: feed.userReactions?.hasHot }]">
              <svg :fill="feed.userReactions?.hasHot ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
              </svg>
              {{ feed.hotCount || 0 }}
            </button>
            <button @click="$emit('like')" :class="['reaction-btn', 'liked', { active: feed.userReactions?.hasLike }]">
              <svg :fill="feed.userReactions?.hasLike ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
              </svg>
              {{ feed.likeCount || 0 }}
            </button>
            <button class="reaction-btn" @click="scrollToComments">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              {{ feed.commentCount || 0 }}
            </button>
          </div>
          <button @click="$emit('save')" :class="['reaction-btn bookmark', { active: isSaved }]">
            <svg :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </button>
        </div>
        <button class="btn-message" @click="handleSendMessage" :disabled="isCreatingChatRoom">
          <svg v-if="!isCreatingChatRoom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <div v-else class="spinner-small"></div>
          {{ isCreatingChatRoom ? '연결 중...' : '문의하기' }}
        </button>
      </div>

      <div class="divider"></div>

      <!-- 3. Author -->
      <div class="author-section">
        <div class="author-info">
          <img :src="getAuthorProfileImage" class="author-avatar" />
          <div class="author-details">
            <span class="author-name">{{ getAuthorNickname }}</span>
            <span class="author-meta">{{ formatDate(feed.createdAt) }} · 조회 {{ feed.viewCount?.toLocaleString() || 0 }}</span>
          </div>
        </div>
        <button @click="isFollowing ? $emit('unfollow') : $emit('follow')" :class="['btn-follow', { active: isFollowing }]">
          {{ isFollowing ? '팔로잉' : '팔로우' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { feedUtils } from '@/services/FeedService'
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

const getProductName = computed(() => props.feed?.product?.name || props.feed?.productNameCustom || props.feed?.productName || '상품명 없음')
const getCategoryName = computed(() => props.feed?.subCategoryDetail?.subCategoryName || props.feed?.subCategoryDetail?.categoryName || props.feed?.product?.brand || '')
const getAuthorProfileImage = computed(() => {
  const userInfo = props.feed?.userInfo
  if (!userInfo) return 'https://i.pravatar.cc/150'
  return userInfo.profileImageFile?.fileUrl || userInfo.profileImageUrl || 'https://i.pravatar.cc/150'
})
const getAuthorNickname = computed(() => props.feed?.userInfo?.nickname || props.feed?.userInfo?.nickName || '사용자')

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub
  } catch { return null }
}

const scrollToComments = () => {
  emit('scroll-to-comments')
}

const formatPrice = (price) => feedUtils.formatPrice(price)
const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation)
const formatDate = (date) => date ? new Date(date).toLocaleDateString('ko-KR') : ''

const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code
  return { 'BEST': 'eval-best', 'GOOD': 'eval-good', 'OKAY': 'eval-okay', 'BAD': 'eval-bad' }[code] || ''
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
  display: flex;
  flex-direction: column;
  background: white;
}

.scrollable-content {
  flex: 1;
}

.product-section {
  padding: 24px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.eval-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.eval-best { background: #fef3c7; color: #d97706; }
.eval-good { background: #d1fae5; color: #059669; }
.eval-okay { background: #dbeafe; color: #2563eb; }
.eval-bad { background: #fee2e2; color: #dc2626; }

.category {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.product-name {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  margin-bottom: 16px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.buy-price {
  font-size: 24px;
  font-weight: 700;
  color: #7c3aed;
}

.store {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s;
}

.store:hover {
  background: #f3f4f6;
  color: #374151;
}

.store-icon { width: 14px; height: 14px; }

.review-text {
  font-size: 15px;
  color: #374151;
  line-height: 1.7;
  margin-bottom: 16px;
  white-space: pre-line;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag {
  font-size: 14px;
  color: #7c3aed;
  background: #f5f3ff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.hashtag:hover {
  background: #ede9fe;
  color: #6d28d9;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0 24px;
}

.reaction-section {
  padding: 20px 24px;
}

.reaction-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.reaction-buttons {
  display: flex;
  gap: 8px;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.reaction-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.reaction-btn.active.hot {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #ea580c;
}

.reaction-btn.active.liked {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.reaction-btn.active {
  background: #f5f3ff;
  border-color: #c4b5fd;
  color: #7c3aed;
}

.reaction-btn.bookmark {
  padding: 10px;
}

.reaction-btn.bookmark.active {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #2563eb;
}

.reaction-btn svg {
  width: 18px;
  height: 18px;
}

.btn-message {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-message:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-message:active:not(:disabled) {
  transform: translateY(0);
}

.btn-message:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-message svg {
  width: 20px;
  height: 20px;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.author-section {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f3f4f6;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.author-meta {
  font-size: 13px;
  color: #9ca3af;
}

.btn-follow {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #7c3aed;
  color: white;
  border: none;
}

.btn-follow:hover {
  background: #6d28d9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.btn-follow.active {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  box-shadow: none;
  transform: none;
}

.btn-follow.active:hover {
  background: #e5e7eb;
}
</style>