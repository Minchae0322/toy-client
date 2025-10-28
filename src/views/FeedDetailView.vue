<template>
  <div class="detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>로딩 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button @click="loadFeedDetail" class="btn-retry">다시 시도</button>
    </div>

    <!-- Content -->
    <template v-else-if="feed">
      <!-- Header -->
      <header class="detail-header">
        <button class="btn-back" @click="goBack">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="header-title">인증 상세</h1>
        <button class="btn-more" @click="showMoreMenu = !showMoreMenu">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </button>

        <!-- More Menu -->
        <div v-if="showMoreMenu" class="more-menu" @click.stop>
          <button class="menu-item" @click="handleShare">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            <span>공유하기</span>
          </button>
          <button class="menu-item" @click="handleCopyLink">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            <span>링크 복사</span>
          </button>
          <button class="menu-item danger" @click="handleReport">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span>신고하기</span>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="detail-content">
        <!-- Author Info -->
        <section class="author-section">
          <div class="author-info">
            <img
                :src="getUserProfileImage"
                :alt="feed.userInfo?.nickname"
                class="author-avatar"
                @click="goToProfile"
            />
            <div class="author-details">
              <div class="author-name-row">
                <span class="author-name" @click="goToProfile">{{ feed.userInfo?.nickname || '알 수 없음' }}</span>
                <span class="author-level">🔥</span>
                <span class="level-name">마니아</span>
              </div>
              <div class="author-meta">
                <span class="post-time">{{ formatDate(feed.createdAt) }}</span>
                <span class="meta-dot">·</span>
                <span class="post-category">{{ feed.subCategoryDetail?.subCategoryName || '카테고리 없음' }}</span>
                <span class="meta-dot">·</span>
                <span class="view-count">
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  {{ formatCount(feed.viewCount) }}
                </span>
              </div>
            </div>
          </div>
          <button v-if="!isFollowing" class="btn-follow" @click="handleFollow">
            팔로우
          </button>
          <button v-else class="btn-following" @click="handleUnfollow">
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
            팔로잉
          </button>
        </section>

        <!-- Image Gallery -->
        <section class="image-gallery">
          <div class="image-container" @dblclick="handleLike">
            <img
                :src="getCurrentImage"
                :alt="getProductName"
                class="main-image"
            />

            <!-- Like Animation -->
            <div v-if="showLikeAnimation" class="like-animation">
              <svg class="heart-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
            </div>

            <!-- Navigation Arrows -->
            <button v-if="currentImageIndex > 0" class="nav-btn prev" @click="prevImage">
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
              </svg>
            </button>
            <button v-if="currentImageIndex < imageList.length - 1" class="nav-btn next" @click="nextImage">
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
              </svg>
            </button>

            <!-- Image Indicators -->
            <div v-if="imageList.length > 1" class="image-indicators">
              <span
                  v-for="(img, idx) in imageList"
                  :key="idx"
                  :class="['indicator', { active: idx === currentImageIndex }]"
                  @click="currentImageIndex = idx"
              ></span>
            </div>
          </div>

          <!-- Thumbnail Strip -->
          <div v-if="imageList.length > 1" class="thumbnail-strip">
            <div
                v-for="(img, idx) in imageList"
                :key="idx"
                :class="['thumbnail', { active: idx === currentImageIndex }]"
                @click="currentImageIndex = idx"
            >
              <img :src="img.fileUrl" :alt="`${getProductName} ${idx + 1}`" />
            </div>
          </div>
        </section>

        <!-- Product Info -->
        <section class="product-section">
          <div class="product-header">
            <h2 class="product-name">{{ getProductName }}</h2>
            <span v-if="feed.product?.brand" class="product-brand">{{ feed.product.brand }}</span>
          </div>

          <div class="product-details">
            <div v-if="feed.buyPlace" class="detail-row">
              <span class="detail-label">구매처</span>
              <span class="detail-value store" @click="searchByStore">📍 {{ feed.buyPlace }}</span>
            </div>
            <div v-if="feed.buyPrice" class="detail-row">
              <span class="detail-label">구매 가격</span>
              <span class="detail-value price">{{ formatPrice(feed.buyPrice) }}</span>
            </div>
            <div v-if="feed.product?.price" class="detail-row">
              <span class="detail-label">정가</span>
              <span class="detail-value">{{ feed.product.price }}</span>
            </div>
          </div>

          <div v-if="feed.feedEvaluation" class="product-evaluation">
            <span :class="['evaluation-badge', getEvaluationClass(feed.feedEvaluation)]">
              {{ getEvaluationIcon(feed.feedEvaluation) }} {{ getEvaluationLabel(feed.feedEvaluation) }}
            </span>
          </div>

          <div class="product-review">
            <p class="review-text">{{ feed.review }}</p>
          </div>

          <div v-if="feed.hashtags && feed.hashtags.length > 0" class="product-hashtags">
            <span
                v-for="tag in feed.hashtags"
                :key="tag.hashtagId"
                class="hashtag"
                @click="searchByHashtag(tag.name)"
            >
              #{{ tag.name }}
            </span>
          </div>
        </section>

        <!-- Reactions -->
        <section class="reaction-section">
          <div class="reaction-stats">
            <button @click="handleHot" :class="['reaction-btn', { active: feed.userReactions?.hasHot }]">
              <span class="fire">🔥</span>
              <span>{{ feed.hotCount || 0 }}</span>
            </button>
            <button @click="handleLike" :class="['reaction-btn', { active: feed.userReactions?.hasLike }]">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
              </svg>
              <span>{{ feed.likeCount || 0 }}</span>
            </button>
            <button class="reaction-btn" @click="focusCommentInput">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <span>{{ comments.length }}</span>
            </button>
            <button @click="handleSave" :class="['reaction-btn save', { active: isSaved }]">
              <svg class="icon" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
          </div>

          <button class="btn-dm" @click="sendMessage">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span>메시지 보내기</span>
          </button>
        </section>

        <!-- Comments -->
        <section class="comment-section">
          <div class="comment-header">
            <h3 class="section-title">댓글 {{ comments.length }}개</h3>
            <select class="comment-sort" v-model="commentSort">
              <option value="popular">인기순</option>
              <option value="latest">최신순</option>
            </select>
          </div>

          <div class="comment-list">
            <article v-for="comment in sortedComments" :key="comment.id" class="comment">
              <img :src="comment.author.image" :alt="comment.author.name" class="comment-avatar" />
              <div class="comment-content">
                <div class="comment-header-info">
                  <span class="comment-author">{{ comment.author.name }}</span>
                  <span class="comment-level">{{ comment.author.level }}</span>
                  <span v-if="comment.isAuthor" class="author-badge">작성자</span>
                  <span class="comment-time">{{ comment.time }}</span>
                </div>
                <p class="comment-text">{{ comment.text }}</p>
                <div class="comment-actions">
                  <button class="comment-action" @click="replyToComment(comment.id)">답글</button>
                  <button @click="likeComment(comment.id)" :class="['comment-action', { active: comment.isLiked }]">
                    <span>🔥</span>
                    <span>{{ comment.fire }}</span>
                  </button>
                </div>

                <!-- Replies -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies">
                  <button v-if="!comment.showReplies" class="show-replies" @click="comment.showReplies = true">
                    답글 {{ comment.replies.length }}개 보기
                  </button>
                  <div v-else class="reply-list">
                    <article v-for="reply in comment.replies" :key="reply.id" class="reply">
                      <img :src="reply.author.image" :alt="reply.author.name" class="reply-avatar" />
                      <div class="reply-content">
                        <div class="reply-header">
                          <span class="reply-author">{{ reply.author.name }}</span>
                          <span class="reply-level">{{ reply.author.level }}</span>
                          <span class="reply-time">{{ reply.time }}</span>
                        </div>
                        <p class="reply-text">
                          <span class="mention">@{{ reply.mentionTo }}</span>
                          {{ reply.text }}
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty State -->
          <div v-if="comments.length === 0" class="empty-comments">
            <span class="empty-icon">💬</span>
            <p class="empty-text">아직 댓글이 없어요</p>
            <p class="empty-sub">첫 댓글을 남겨보세요!</p>
          </div>
        </section>
      </main>

      <!-- Comment Input (Fixed) -->
      <div class="comment-input-container">
        <img :src="currentUser.image" alt="User" class="input-avatar" />
        <input
            ref="commentInput"
            type="text"
            placeholder="댓글을 입력하세요..."
            v-model="newComment"
            @keyup.enter="submitComment"
            class="comment-input"
        />
        <button :disabled="!newComment.trim()" @click="submitComment" class="btn-send">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { feedService, feedUtils } from '@/services/FeedService'

const router = useRouter()
const route = useRoute()

// State
const loading = ref(true)
const error = ref(null)
const feed = ref(null)
const currentImageIndex = ref(0)
const showLikeAnimation = ref(false)
const isSaved = ref(false)
const isFollowing = ref(false)
const showMoreMenu = ref(false)
const commentSort = ref('popular')
const newComment = ref('')
const commentInput = ref(null)

// Mock data (댓글은 아직 API가 없으므로 임시)
const currentUser = {
  image: 'https://i.pravatar.cc/150?img=12'
}

const comments = ref([])

// Computed
const imageList = computed(() => {
  if (!feed.value?.attachmentFiles) return []
  return feed.value.attachmentFiles
})

const getCurrentImage = computed(() => {
  if (imageList.value.length === 0) return ''
  return imageList.value[currentImageIndex.value]?.fileUrl || ''
})

const getProductName = computed(() => {
  return feed.value?.product?.name || feed.value?.productName || '상품명 없음'
})

const getUserProfileImage = computed(() => {
  return feed.value?.userInfo?.profileImageFile?.fileUrl || 'https://i.pravatar.cc/150?img=33'
})

const sortedComments = computed(() => {
  if (commentSort.value === 'popular') {
    return [...comments.value].sort((a, b) => b.fire - a.fire)
  }
  return comments.value
})

// Methods
const loadFeedDetail = async () => {
  try {
    loading.value = true
    error.value = null

    const feedId = route.params.id
    console.log('🔍 [FEED_DETAIL] 피드 상세 조회 시작:', feedId)

    const response = await feedService.getFeed(feedId)

    if (response.success && response.data) {
      feed.value = response.data
      console.log('✅ [FEED_DETAIL] 피드 상세 조회 성공:', feed.value)
    } else {
      throw new Error(response.message || '피드를 불러오는데 실패했습니다.')
    }
  } catch (err) {
    console.error('❌ [FEED_DETAIL] 피드 조회 실패:', err)
    error.value = err.message || '피드를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToProfile = () => {
  console.log('Go to profile:', feed.value?.userInfo?.userId)
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const nextImage = () => {
  if (currentImageIndex.value < imageList.value.length - 1) {
    currentImageIndex.value++
  }
}

const handleLike = async () => {
  try {
    showLikeAnimation.value = true
    setTimeout(() => {
      showLikeAnimation.value = false
    }, 600)

    const response = await feedService.toggleLike(feed.value.feedId)

    if (response.success && response.data) {
      feed.value.likeCount = response.data.likeCount
      feed.value.userReactions = {
        ...feed.value.userReactions,
        hasLike: response.data.action === 'added'
      }
      console.log('✅ [FEED_DETAIL] 좋아요 토글 완료')
    }
  } catch (err) {
    console.error('❌ [FEED_DETAIL] 좋아요 실패:', err)
  }
}

const handleHot = async () => {
  try {
    const response = await feedService.toggleHot(feed.value.feedId)

    if (response.success && response.data) {
      feed.value.hotCount = response.data.hotCount
      feed.value.userReactions = {
        ...feed.value.userReactions,
        hasHot: response.data.action === 'added'
      }
      console.log('✅ [FEED_DETAIL] 핫 토글 완료')
    }
  } catch (err) {
    console.error('❌ [FEED_DETAIL] 핫 실패:', err)
  }
}

const handleSave = () => {
  isSaved.value = !isSaved.value
}

const handleFollow = () => {
  isFollowing.value = true
}

const handleUnfollow = () => {
  isFollowing.value = false
}

const handleShare = () => {
  showMoreMenu.value = false
  if (navigator.share) {
    navigator.share({
      title: getProductName.value,
      url: window.location.href
    }).catch(err => console.log('Share failed:', err))
  }
}

const handleCopyLink = () => {
  showMoreMenu.value = false
  navigator.clipboard.writeText(window.location.href)
  .then(() => alert('링크가 복사되었습니다!'))
  .catch(err => console.error('Copy failed:', err))
}

const handleReport = () => {
  showMoreMenu.value = false
  console.log('Report feed')
}

const searchByStore = () => {
  console.log('Search by store:', feed.value?.buyPlace)
}

const searchByHashtag = (tag) => {
  console.log('Search by hashtag:', tag)
  router.push({ path: '/feed', query: { hashtag: tag } })
}

const sendMessage = () => {
  console.log('Send DM to:', feed.value?.userInfo?.userId)
}

const focusCommentInput = () => {
  commentInput.value?.focus()
}

const submitComment = () => {
  if (!newComment.value.trim()) return

  const comment = {
    id: Date.now(),
    author: {
      name: 'current_user',
      image: currentUser.image,
      level: '💪'
    },
    text: newComment.value,
    time: '방금',
    fire: 0,
    isLiked: false,
    isAuthor: false,
    showReplies: false,
    replies: []
  }

  comments.value.unshift(comment)
  newComment.value = ''
}

const replyToComment = (commentId) => {
  console.log('Reply to comment:', commentId)
}

const likeComment = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.isLiked = !comment.isLiked
    comment.fire += comment.isLiked ? 1 : -1
  }
}

// Utility functions
const formatCount = (count) => feedUtils.formatCount(count)
const formatPrice = (price) => feedUtils.formatPrice(price)
const formatDate = (dateString) => feedUtils.formatDate(dateString)

const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation)
const getEvaluationIcon = (evaluation) => feedUtils.getEvaluationIcon(evaluation)

const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code
  const classMap = {
    'BEST': 'best',
    'GOOD': 'good',
    'OKAY': 'okay',
    'BAD': 'bad'
  }
  return classMap[code] || ''
}

onMounted(() => {
  loadFeedDetail()
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #0F172A;
  --secondary: #64748B;
  --accent: #F97316;
  --border: #E2E8F0;
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --hover: #F1F5F9;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.detail-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
  padding-bottom: 80px;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-text {
  color: #DC2626;
  font-size: 16px;
  margin-bottom: 16px;
}

.btn-retry {
  padding: 12px 24px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

/* Header */
.detail-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-back,
.btn-more {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-back:hover,
.btn-more:hover {
  background: var(--hover);
}

.btn-back .icon,
.btn-more .icon {
  width: 24px;
  height: 24px;
  color: var(--primary);
  stroke-width: 2;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.more-menu {
  position: absolute;
  top: 60px;
  right: 20px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  min-width: 180px;
  z-index: 60;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--primary);
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
  text-align: left;
}

.menu-item:hover {
  background: var(--hover);
}

.menu-item.danger {
  color: #DC2626;
}

.menu-item .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* Main Content */
.detail-content {
  max-width: 800px;
  margin: 0 auto;
}

/* Author Section */
.author-section {
  padding: 20px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid var(--border);
  transition: all 0.2s;
}

.author-avatar:hover {
  border-color: var(--accent);
  transform: scale(1.05);
}

.author-details {
  flex: 1;
}

.author-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.author-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  cursor: pointer;
  transition: color 0.2s;
}

.author-name:hover {
  color: var(--accent);
}

.author-level {
  font-size: 16px;
}

.level-name {
  padding: 2px 8px;
  background: #FFF7ED;
  color: var(--accent);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.author-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--secondary);
}

.meta-dot {
  color: var(--border);
}

.post-category {
  font-weight: 600;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-count .icon {
  width: 14px;
  height: 14px;
}

.btn-follow,
.btn-following {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  flex-shrink: 0;
}

.btn-follow {
  background: var(--accent);
  color: white;
}

.btn-follow:hover {
  background: #EA580C;
  transform: translateY(-1px);
}

.btn-following {
  background: var(--hover);
  color: var(--secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-following .icon {
  width: 16px;
  height: 16px;
}

/* Image Gallery */
.image-gallery {
  background: var(--card);
}

.image-container {
  position: relative;
  width: 100%;
  background: black;
}

.main-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  display: block;
}

.like-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: likeZoom 0.6s ease-out;
  pointer-events: none;
}

.heart-icon {
  width: 100px;
  height: 100px;
  color: white;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

@keyframes likeZoom {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-container:hover .nav-btn {
  opacity: 1;
}

.nav-btn:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.nav-btn.prev {
  left: 16px;
}

.nav-btn.next {
  right: 16px;
}

.nav-btn .icon {
  width: 24px;
  height: 24px;
  color: var(--primary);
}

.image-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.indicator.active {
  width: 24px;
  border-radius: 4px;
  background: white;
}

.thumbnail-strip {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  overflow-x: auto;
  scrollbar-width: none;
}

.thumbnail-strip::-webkit-scrollbar {
  display: none;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s;
  flex-shrink: 0;
  border: 2px solid transparent;
}

.thumbnail:hover {
  opacity: 0.8;
}

.thumbnail.active {
  opacity: 1;
  border-color: var(--accent);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Section */
.product-section {
  padding: 24px 20px;
  background: var(--card);
  border-bottom: 8px solid var(--bg);
}

.product-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.product-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.3;
  flex: 1;
}

.product-brand {
  padding: 6px 12px;
  background: var(--bg);
  color: var(--secondary);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg);
  border-radius: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-label {
  font-size: 14px;
  color: var(--secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
}

.detail-value.store {
  cursor: pointer;
  transition: color 0.2s;
}

.detail-value.store:hover {
  color: var(--accent);
}

.detail-value.price {
  color: var(--accent);
  font-size: 18px;
}

.product-evaluation {
  margin-bottom: 16px;
}

.evaluation-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.evaluation-badge.best {
  background: #FFF7ED;
  color: #F97316;
}

.evaluation-badge.good {
  background: #D1FAE5;
  color: #059669;
}

.evaluation-badge.okay {
  background: #DBEAFE;
  color: #1D4ED8;
}

.evaluation-badge.bad {
  background: #FEE2E2;
  color: #DC2626;
}

.product-review {
  margin-bottom: 16px;
}

.review-text {
  font-size: 15px;
  color: var(--primary);
  line-height: 1.7;
}

.product-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag {
  font-size: 14px;
  color: #1D4ED8;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.hashtag:hover {
  color: #1E40AF;
  text-decoration: underline;
}

/* Reaction Section */
.reaction-section {
  padding: 20px;
  background: var(--card);
  border-bottom: 8px solid var(--bg);
}

.reaction-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.reaction-btn:hover {
  background: var(--hover);
  transform: translateY(-1px);
}

.reaction-btn.active {
  background: #FFF7ED;
  color: var(--accent);
}

.reaction-btn .fire {
  font-size: 20px;
}

.reaction-btn .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.reaction-btn.save {
  margin-left: auto;
  padding: 8px;
}

.btn-dm {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-dm:hover {
  background: #DBEAFE;
  border-color: #93C5FD;
  transform: translateY(-1px);
}

.btn-dm .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* Comment Section */
.comment-section {
  padding: 24px 20px;
  background: var(--card);
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.comment-sort {
  padding: 6px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  font-family: inherit;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.comment-author {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.comment-level {
  font-size: 14px;
}

.author-badge {
  padding: 2px 6px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.comment-time {
  font-size: 12px;
  color: var(--secondary);
}

.comment-text {
  font-size: 14px;
  color: var(--primary);
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.comment-action:hover {
  background: var(--hover);
}

.comment-action.active {
  color: var(--accent);
}

.replies {
  margin-top: 16px;
  padding-left: 20px;
  border-left: 2px solid var(--border);
}

.show-replies {
  padding: 6px 12px;
  background: var(--bg);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.show-replies:hover {
  background: var(--hover);
  color: var(--primary);
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply {
  display: flex;
  gap: 10px;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.reply-author {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
}

.reply-level {
  font-size: 13px;
}

.reply-time {
  font-size: 11px;
  color: var(--secondary);
}

.reply-text {
  font-size: 13px;
  color: var(--primary);
  line-height: 1.6;
}

.mention {
  color: #1D4ED8;
  font-weight: 600;
}

.empty-comments {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 8px;
}

.empty-sub {
  font-size: 14px;
  color: var(--secondary);
}

/* Comment Input */
.comment-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 40;
  max-width: 800px;
  margin: 0 auto;
}

.input-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-input {
  flex: 1;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--primary);
  transition: all 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
}

.comment-input::placeholder {
  color: var(--secondary);
}

.btn-send {
  padding: 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled) {
  background: #EA580C;
  transform: scale(1.05);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-send .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

@media (max-width: 768px) {
  .detail-header {
    padding: 12px 16px;
  }

  .author-section {
    padding: 16px;
  }

  .product-section {
    padding: 20px 16px;
  }

  .reaction-section {
    padding: 16px;
  }

  .comment-section {
    padding: 20px 16px;
  }

  .comment-input-container {
    padding: 12px 16px;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }

  .nav-btn.prev {
    left: 12px;
  }

  .nav-btn.next {
    right: 12px;
  }
}
</style>