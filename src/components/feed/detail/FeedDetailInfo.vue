<template>
  <div class="info-section">
    <div class="scrollable-content">
      <!-- 1. Product Info - Primary -->
      <div class="product-section">
        <!-- Evaluation + Category -->
        <div class="meta-row">
          <span v-if="feed.feedEvaluation" :class="['eval-badge', getEvaluationClass(feed.feedEvaluation)]">
            {{ getEvaluationLabel(feed.feedEvaluation) }}
          </span>
          <span class="category">{{ getCategoryName }}</span>
        </div>

        <!-- Title -->
        <h1 class="product-name">{{ getProductName }}</h1>

        <!-- Price + Store -->
        <div class="price-row">
          <span class="buy-price">{{ formatPrice(feed.buyPrice || feed.price) }}</span>
          <div v-if="feed.buyPlace" class="store" @click="$emit('search-store')">
            <svg class="store-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            {{ feed.buyPlace }}
          </div>
        </div>

        <!-- Review -->
        <p class="review-text">{{ feed.review }}</p>

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
      </div>

      <div class="divider"></div>

      <!-- 2. Reactions + CTA -->
      <div class="reaction-section">
        <div class="reaction-row">
          <div class="reaction-buttons">
            <button @click="$emit('hot')" :class="['reaction-btn', { active: feed.userReactions?.hasHot }]">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
              </svg>
              {{ feed.hotCount || 0 }}
            </button>

            <button @click="$emit('like')" :class="['reaction-btn', { active: feed.userReactions?.hasLike }]">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
              </svg>
              {{ feed.likeCount || 0 }}
            </button>

            <button class="reaction-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              {{ feed.commentCount || comments.length }}
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

      <!-- 3. Author - Secondary -->
      <div class="author-section">
        <div class="author-info">
          <img :src="getAuthorProfileImage" class="author-avatar" />
          <div class="author-details">
            <span class="author-name">{{ getAuthorNickname }}</span>
            <span class="author-meta">{{ formatDate(feed.createdAt) }} · 조회 {{ feed.viewCount?.toLocaleString() || 0 }}</span>
          </div>
        </div>
        <button
            @click="isFollowing ? $emit('unfollow') : $emit('follow')"
            :class="['btn-follow', { active: isFollowing }]"
        >
          {{ isFollowing ? '팔로잉' : '팔로우' }}
        </button>
      </div>

      <div class="divider"></div>

      <!-- 4. Comments -->
      <div class="comment-section">
        <div class="comment-header">
          <h3 class="comment-title">댓글 <span class="count">{{ feed.commentCount || comments.length }}</span></h3>
          <select :value="commentSort" @change="$emit('update:comment-sort', $event.target.value)" class="comment-sort">
            <option value="popular">인기순</option>
            <option value="latest">최신순</option>
          </select>
        </div>

        <div class="comment-input-wrapper">
          <input
              type="text"
              v-model="newComment"
              @keyup.enter="submitComment"
              placeholder="댓글을 입력하세요"
              class="comment-input"
          />
          <button @click="submitComment" :disabled="!newComment.trim()" :class="['btn-send', { active: newComment.trim() }]">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>

        <div v-if="sortedComments.length" class="comment-list">
          <article v-for="c in sortedComments" :key="c.id" class="comment-item">
            <img :src="c.author.image" class="comment-avatar" />
            <div class="comment-content">
              <div class="comment-meta">
                <span class="comment-author">{{ c.author.name }}</span>
                <span v-if="c.isAuthor" class="author-badge">작성자</span>
                <span class="comment-time">{{ c.time }}</span>
              </div>
              <p class="comment-text">{{ c.text }}</p>
              <div class="comment-actions">
                <button class="action-btn" @click="$emit('reply-comment', c.id)">답글</button>
                <button @click="$emit('like-comment', c.id)" :class="['action-btn', { active: c.isLiked }]">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                  </svg>
                  {{ c.fire }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="comment-empty">
          <p>아직 댓글이 없습니다</p>
          <span>첫 댓글을 남겨보세요</span>
        </div>
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
  isSaved: { type: Boolean, default: false },
  comments: { type: Array, default: () => [] },
  commentSort: { type: String, default: 'popular' }
})

defineEmits([
  'follow', 'unfollow', 'like', 'hot', 'save',
  'search-store', 'search-hashtag',
  'submit-comment', 'reply-comment', 'like-comment',
  'update:comment-sort'
])

const isCreatingChatRoom = ref(false)
const newComment = ref('')

// ========== 상품명: product 있으면 product.name, 없으면 productNameCustom ==========
const getProductName = computed(() => {
  return props.feed?.product?.name
      || props.feed?.productNameCustom
      || props.feed?.productName
      || '상품명 없음'
})

// ========== 카테고리명 ==========
const getCategoryName = computed(() => {
  return props.feed?.subCategoryDetail?.subCategoryName
      || props.feed?.subCategoryDetail?.categoryName
      || props.feed?.product?.brand
      || ''
})

// ========== 작성자 프로필 이미지 ==========
const getAuthorProfileImage = computed(() => {
  const userInfo = props.feed?.userInfo
  if (!userInfo) return 'https://i.pravatar.cc/150'

  return userInfo.profileImageFile?.fileUrl
      || userInfo.profileImageUrl
      || userInfo.profileImgUrl
      || userInfo.profileImage
      || 'https://i.pravatar.cc/150'
})

// ========== 작성자 닉네임 ==========
const getAuthorNickname = computed(() => {
  const userInfo = props.feed?.userInfo
  if (!userInfo) return '사용자'

  return userInfo.nickname
      || userInfo.nickName
      || userInfo.userName
      || '사용자'
})

const sortedComments = computed(() => {
  if (props.commentSort === 'popular') return [...props.comments].sort((a, b) => b.fire - a.fire)
  return props.comments
})

const submitComment = () => {
  if (newComment.value.trim()) {
    // TODO: emit submit-comment
    newComment.value = ''
  }
}

const formatPrice = (price) => feedUtils.formatPrice(price)
const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation)
const formatDate = (date) => date ? new Date(date).toLocaleDateString('ko-KR') : ''

const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code
  return { 'BEST': 'eval-best', 'GOOD': 'eval-good', 'OKAY': 'eval-okay', 'BAD': 'eval-bad' }[code] || ''
}

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub
  } catch { return null }
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
      query: {
        userName: getAuthorNickname.value,
        feedId: props.feed.feedId,
        productName: getProductName.value
      }
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

@media (min-width: 1024px) {
  .info-section {
    width: 420px;
    flex-shrink: 0;
    border-left: 1px solid #f3f4f6;
  }
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 56px);
}

.scrollable-content::-webkit-scrollbar { width: 0; }

/* Product Section */
.product-section { padding: 20px; }

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.eval-badge {
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.eval-best { background: rgba(249, 115, 22, 0.95); color: white; }
.eval-good { background: rgba(16, 185, 129, 0.95); color: white; }
.eval-okay { background: rgba(59, 130, 246, 0.95); color: white; }
.eval-bad { background: rgba(239, 68, 68, 0.95); color: white; }

.category { font-size: 13px; color: #9ca3af; }

.product-name {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  margin-bottom: 16px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.buy-price { font-size: 24px; font-weight: 700; color: #9333ea; }

.store {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #9ca3af;
  cursor: pointer;
}

.store:hover { color: #6b7280; }
.store-icon { width: 14px; height: 14px; }

.review-text {
  font-size: 15px;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 16px;
  white-space: pre-line;
}

.hashtags { display: flex; flex-wrap: wrap; gap: 8px; }

.hashtag {
  font-size: 14px;
  color: #9333ea;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.hashtag:hover { color: #7c22ce; }

/* Divider */
.divider { height: 8px; background: #f9fafb; }

/* Reactions */
.reaction-section { padding: 16px 20px; }

.reaction-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.reaction-buttons { display: flex; gap: 6px; }

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: #f9fafb;
  border: none;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.reaction-btn:hover { background: #f3f4f6; }
.reaction-btn.active { background: #f3e8ff; color: #9333ea; }
.reaction-btn.bookmark { padding: 8px; }
.reaction-btn svg { width: 18px; height: 18px; }

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
  transition: background 0.2s;
}

.btn-message:hover:not(:disabled) { background: #000; }
.btn-message:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-message svg { width: 20px; height: 20px; }

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Author */
.author-section {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-info { display: flex; align-items: center; gap: 10px; }

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  object-fit: cover;
}

.author-details { display: flex; flex-direction: column; gap: 2px; }
.author-name { font-size: 14px; font-weight: 600; color: #111827; }
.author-meta { font-size: 12px; color: #9ca3af; }

.btn-follow {
  padding: 7px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: #9333ea;
  border: 1px solid #9333ea;
}

.btn-follow:hover { background: #faf5ff; }
.btn-follow.active { background: #f3f4f6; color: #6b7280; border-color: #e5e7eb; }

/* Comments */
.comment-section { padding: 20px; }

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.comment-title { font-size: 16px; font-weight: 600; color: #111827; }
.comment-title .count { color: #9333ea; }

.comment-sort {
  font-size: 13px;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
}

.comment-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 20px;
}

.comment-input {
  flex: 1;
  background: none;
  border: none;
  font-size: 14px;
  outline: none;
}

.comment-input::placeholder { color: #9ca3af; }

.btn-send {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-send svg { width: 16px; height: 16px; color: #9ca3af; }
.btn-send.active { background: #9333ea; }
.btn-send.active svg { color: white; }

.comment-list { display: flex; flex-direction: column; gap: 16px; }

.comment-item { display: flex; gap: 10px; }

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.comment-content { flex: 1; }

.comment-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.comment-author { font-size: 13px; font-weight: 600; color: #111827; }

.author-badge {
  font-size: 10px;
  font-weight: 600;
  color: #9333ea;
  background: #f3e8ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.comment-time { font-size: 12px; color: #9ca3af; }

.comment-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 6px;
}

.comment-actions { display: flex; gap: 12px; }

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.action-btn:hover { color: #6b7280; }
.action-btn.active { color: #9333ea; }
.action-btn svg { width: 14px; height: 14px; }

.comment-empty {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.comment-empty p {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.comment-empty span { font-size: 13px; }
</style>