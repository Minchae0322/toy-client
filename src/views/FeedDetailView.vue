<template>
  <div class="detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">로딩 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button @click="loadFeedDetail" class="btn-retry">다시 시도</button>
    </div>

    <!-- Content -->
    <template v-else-if="feed">
      <!-- Header -->
      <FeedDetailHeader
          @back="goBack"
          @share="handleShare"
          @copy-link="handleCopyLink"
          @report="handleReport"
      />

      <!-- Main Content (2 Column Layout on Desktop) -->
      <main class="detail-main">
        <div class="detail-wrapper">
          <!-- Left: Image Gallery -->
          <FeedDetailImageGallery
              :images="imageList"
              :product-name="getProductName"
              @like="handleLike"
          />

          <!-- Right: Info Section -->
          <FeedDetailInfo
              :feed="feed"
              :is-following="isFollowing"
              :is-saved="isSaved"
              :comments="comments"
              :comment-sort="commentSort"
              @follow="handleFollow"
              @unfollow="handleUnfollow"
              @like="handleLike"
              @hot="handleHot"
              @save="handleSave"
              @send-message="sendMessage"
              @search-store="searchByStore"
              @search-hashtag="searchByHashtag"
              @submit-comment="submitComment"
              @reply-comment="replyToComment"
              @like-comment="likeComment"
              @update:comment-sort="commentSort = $event"
          />
        </div>
      </main>
    </template>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {feedService, feedUtils} from '@/services/FeedService'

import FeedDetailHeader from '@/components/feed/detail/FeedDetailHeader.vue'
import FeedDetailImageGallery from '@/components/feed/detail/FeedDetailImageGallery.vue'
import FeedDetailInfo from '@/components/feed/detail/FeedDetailInfo.vue'

const router = useRouter()
const route = useRoute()

// State
const loading = ref(true)
const error = ref(null)
const feed = ref(null)
const isSaved = ref(false)
const isFollowing = ref(false)
const commentSort = ref('popular')
const comments = ref([])

// Computed
const imageList = computed(() => {
  if (!feed.value?.attachmentFiles) return []
  return feed.value.attachmentFiles
})

const getProductName = computed(() => {
  return feed.value?.product?.name || feed.value?.productName || '상품명 없음'
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

const handleLike = async () => {
  try {
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
  if (navigator.share) {
    navigator.share({
      title: getProductName.value,
      url: window.location.href
    }).catch(err => console.log('Share failed:', err))
  }
}

const handleCopyLink = () => {
  navigator.clipboard.writeText(window.location.href)
  .then(() => alert('링크가 복사되었습니다!'))
  .catch(err => console.error('Copy failed:', err))
}

const handleReport = () => {
  console.log('Report feed')
}

const searchByStore = () => {
  console.log('Search by store:', feed.value?.buyPlace)
}

const searchByHashtag = (tag) => {
  console.log('Search by hashtag:', tag)
  router.push({path: '/feed', query: {hashtag: tag}})
}

const sendMessage = () => {
  console.log('Send DM to:', feed.value?.userInfo?.userId)
}

const submitComment = (commentText) => {
  const comment = {
    id: Date.now(),
    author: {
      name: 'current_user',
      image: 'https://i.pravatar.cc/150?img=12',
      level: 'LV.5'
    },
    text: commentText,
    time: '방금',
    fire: 0,
    isLiked: false,
    isAuthor: false,
    showReplies: false,
    replies: []
  }

  comments.value.unshift(comment)
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

onMounted(() => {
  loadFeedDetail()
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #1A1A1A;
  --secondary: #666666;
  --tertiary: #999999;
  --accent: #FF6B35;
  --border: #E5E5E5;
  --bg: #FAFAFA;
  --card: #FFFFFF;
  --hover: #F5F5F5;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.detail-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 40px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--secondary);
  letter-spacing: -0.02em;
}

.error-text {
  color: #DC2626;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 24px;
  text-align: center;
  line-height: 1.5;
}

.btn-retry {
  padding: 14px 32px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  letter-spacing: -0.02em;
}

.btn-retry:hover {
  background: #E55A2B;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.25);
}

/* Main Content */
.detail-main {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0;
}

.detail-wrapper {
  display: flex;
  flex-direction: column;
  background: var(--card);
}

/* Desktop: 2 Column Layout */
@media (min-width: 1024px) {
  .detail-main {
    padding: 32px;
  }

  .detail-wrapper {
    flex-direction: row;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
    min-height: calc(100vh - 140px);
  }
}
</style>