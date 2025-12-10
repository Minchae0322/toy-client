<template>
  <div class="detail-container">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">로딩 중...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button @click="loadFeedDetail" class="btn-retry">다시 시도</button>
    </div>

    <!-- Content -->
    <template v-else-if="feed">
      <FeedDetailHeader
          @back="goBack"
          @share="handleShare"
          @copy-link="handleCopyLink"
          @report="handleReport"
      />

      <main class="detail-main">
        <div class="detail-wrapper">
          <FeedDetailImageGallery
              :images="imageList"
              :product-name="getProductName"
              @like="handleLike"
          />

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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { feedService } from '@/services/FeedService.js'

import FeedDetailHeader from '@/components/feed/detail/FeedDetailHeader.vue'
import FeedDetailImageGallery from '@/components/feed/detail/FeedDetailImageGallery.vue'
import FeedDetailInfo from '@/components/feed/detail/FeedDetailInfo.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref(null)
const feed = ref(null)
const isSaved = ref(false)
const isFollowing = ref(false)
const commentSort = ref('popular')
const comments = ref([])

const imageList = computed(() => feed.value?.attachmentFiles || [])
const getProductName = computed(() => feed.value?.product?.name || feed.value?.productName || '상품명 없음')

const loadFeedDetail = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await feedService.getFeed(route.params.id)
    if (response.success && response.data) {
      feed.value = response.data
    } else {
      throw new Error(response.message || '피드를 불러오는데 실패했습니다.')
    }
  } catch (err) {
    error.value = err.message || '피드를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

const handleLike = async () => {
  try {
    const response = await feedService.toggleLike(feed.value.feedId)
    if (response.success && response.data) {
      feed.value.likeCount = response.data.likeCount
      feed.value.userReactions = { ...feed.value.userReactions, hasLike: response.data.action === 'added' }
    }
  } catch (err) {
    console.error('좋아요 실패:', err)
  }
}

const handleHot = async () => {
  try {
    const response = await feedService.toggleHot(feed.value.feedId)
    if (response.success && response.data) {
      feed.value.hotCount = response.data.hotCount
      feed.value.userReactions = { ...feed.value.userReactions, hasHot: response.data.action === 'added' }
    }
  } catch (err) {
    console.error('핫 실패:', err)
  }
}

const handleSave = () => { isSaved.value = !isSaved.value }
const handleFollow = () => { isFollowing.value = true }
const handleUnfollow = () => { isFollowing.value = false }

const handleShare = () => {
  if (navigator.share) navigator.share({ title: getProductName.value, url: window.location.href })
}

const handleCopyLink = () => {
  navigator.clipboard.writeText(window.location.href).then(() => alert('링크가 복사되었습니다!'))
}

const handleReport = () => console.log('Report feed')
const searchByStore = () => console.log('Search by store:', feed.value?.buyPlace)
const searchByHashtag = (tag) => router.push({ path: '/feed', query: { hashtag: tag } })

const submitComment = (text) => {
  comments.value.unshift({
    id: Date.now(),
    author: { name: 'current_user', image: 'https://i.pravatar.cc/150?img=12' },
    text,
    time: '방금',
    fire: 0,
    isLiked: false,
    isAuthor: false
  })
}

const replyToComment = (id) => console.log('Reply to:', id)
const likeComment = (id) => {
  const c = comments.value.find(x => x.id === id)
  if (c) { c.isLiked = !c.isLiked; c.fire += c.isLiked ? 1 : -1 }
}

onMounted(() => loadFeedDetail())
</script>

<style scoped>
.detail-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #fff;
  min-height: 100vh;
  color: #111827;
  -webkit-font-smoothing: antialiased;
}

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
  width: 36px;
  height: 36px;
  border: 3px solid #f3f4f6;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text {
  margin-top: 14px;
  font-size: 14px;
  color: #6b7280;
}

.error-text {
  color: #dc2626;
  font-size: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.btn-retry {
  padding: 12px 24px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-retry:hover { background: #7c22ce; }

.detail-main {
  max-width: 1280px;
  margin: 0 auto;
}

.detail-wrapper {
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .detail-wrapper {
    flex-direction: row;
    min-height: calc(100vh - 56px);
  }
}
</style>