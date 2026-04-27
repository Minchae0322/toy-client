<template>
  <div class="detail-container">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button @click="loadFeedDetail" class="btn-retry">다시 시도</button>
    </div>

    <!-- Content -->
    <template v-else-if="feed">
      <FeedDetailHeader
          :is-owner="isOwner"
          :is-admin="isAdmin"
          @back="goBack"
          @share="handleShare"
          @copy-link="handleCopyLink"
          @edit="handleEdit"
          @delete="handleDelete"
          @report="handleReport"
      />

      <main class="detail-main">
        <div class="content-wrapper">
          <div class="main-card">
            <div class="image-area">
              <FeedDetailImageGallery
                  :images="imageList"
                  :product-name="getProductName"
              />
            </div>

            <div class="info-area">
              <FeedDetailInfo
                  v-if="feed"
                  :feed="feed"
                  :is-following="isFollowing"
                  :is-saved="isSaved"
                  @follow="handleFollow"
                  @unfollow="handleUnfollow"
                  @like="handleLike"
                  @hot="handleHot"
                  @save="handleSave"
                  @search-store="searchByStore"
                  @search-hashtag="searchByHashtag"
                  @scroll-to-comments="scrollToComments"
                  @send-message="handleSendMessage"
              />
            </div>
          </div>
        </div>

        <section ref="commentSectionRef" class="comment-section-wrapper">
          <FeedCommentSection
              :comments="comments"
              :total-count="feed?.commentCount || 0"
              :loading="commentLoading"
              :has-next="commentPagination.hasNext"
              :feed-creator-id="feed?.userInfo?.userId"
              :current-user-profile="currentUserProfile"
              @submit="submitComment"
              @update="updateComment"
              @delete="deleteComment"
              @load-more="loadMoreComments"
          />
        </section>
      </main>

      <!-- Share Modal -->
      <ShareModal
          :visible="showShareModal"
          :title="getProductName"
          :description="feed?.reviewSummary || ''"
          :image="shareImage"
          @close="closeShareModal"
      />

      <!-- Edit Modal -->
      <FeedEditModal
          v-if="feed"
          :visible="showEditModal"
          :feed="feed"
          @close="showEditModal = false"
          @updated="handleFeedUpdated"
      />

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { feedService } from '@/services/FeedService.js'
import { chatService } from '@/services/ChatService.js'
import { userService } from '@/services/UserService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { showExpGrant } from '@/composables/useExpToast'
import { useAuth } from '@/composables/useAuth'

import FeedDetailHeader from '@/components/feed/detail/FeedDetailHeader.vue'
import FeedDetailImageGallery from '@/components/feed/detail/FeedDetailImageGallery.vue'
import FeedDetailInfo from '@/components/feed/detail/FeedDetailInfo.vue'
import FeedCommentSection from '@/components/feed/detail/FeedCommentSection.vue'
import ShareModal from '@/components/common/ShareModal.vue'
import FeedEditModal from '@/components/feed/detail/FeedEditModal.vue'

const router = useRouter()
const route = useRoute()
const { open, openLoginRequired } = useConfirmDialog()
const { userId: currentUserId, isLoggedIn, isAdmin } = useAuth()

const loading = ref(true)
const error = ref(null)
const feed = ref(null)
const isSaved = ref(false)
const isFollowing = ref(false)
const commentSectionRef = ref(null)
const showShareModal = ref(false)
const showEditModal = ref(false)

const comments = ref([])
const commentLoading = ref(false)
const commentPagination = ref({
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  hasNext: false
})

const imageList = computed(() => feed.value?.attachmentFiles || [])
const getProductName = computed(() => feed.value?.product?.name || feed.value?.productNameCustom || feed.value?.productName || '상품명 없음')
const isOwner = computed(() => {
  if (!feed.value?.userInfo?.userId || !currentUserId.value) return false
  return feed.value.userInfo.userId === currentUserId.value
})
const currentUserProfile = computed(() => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return 'https://i.pravatar.cc/150'
    return 'https://i.pravatar.cc/150'
  } catch { return 'https://i.pravatar.cc/150' }
})

const scrollToComments = () => {
  commentSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const loadFeedDetail = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await feedService.getFeed(route.params.id)
    console.log('Feed response:', response) // 디버깅용
    if (response.success && response.data) {
      feed.value = response.data
      await loadComments()
    } else {
      throw new Error(response.message || '피드를 불러오는데 실패했습니다.')
    }
  } catch (err) {
    console.error('Feed load error:', err) // 디버깅용
    error.value = err.message || '피드를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const loadComments = async (page = 0) => {
  try {
    commentLoading.value = true
    const response = await feedService.getComments(route.params.id, { page, size: 20 })
    if (response.success && response.data) {
      if (page === 0) {
        comments.value = response.data.comments || []
      } else {
        comments.value = [...comments.value, ...(response.data.comments || [])]
      }
      commentPagination.value = {
        page: response.data.page || 0,
        size: response.data.size || 20,
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
        hasNext: response.data.hasNext || false
      }
    }
  } catch (err) {
    console.error('댓글 조회 실패:', err)
  } finally {
    commentLoading.value = false
  }
}

const loadMoreComments = () => {
  if (commentPagination.value.hasNext && !commentLoading.value) {
    loadComments(commentPagination.value.page + 1)
  }
}

const submitComment = async (payload) => {
  // 로그인 체크
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('댓글을 작성하려면 로그인이 필요합니다.')
    if (confirmed) {
      router.push({ name: 'Login', query: { redirect: route.fullPath } })
    }
    return
  }

  // 이전 시그니처(content 문자열) 호환
  const { content, parentCommentId = null } =
      typeof payload === 'string' ? { content: payload } : (payload || {})

  if (!content?.trim()) return

  try {
    const response = await feedService.createComment(route.params.id, content, parentCommentId)
    if (response.success) {
      showExpGrant(response.data?.expGrant, { mode: 'burst-only' })
      await loadComments(0)
      if (feed.value) {
        feed.value.commentCount = (feed.value.commentCount || 0) + 1
      }
    }
  } catch (err) {
    console.error('댓글 작성 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '댓글 작성에 실패했습니다.' })
  }
}

const updateComment = async ({ commentId, content }) => {
  try {
    const response = await feedService.updateComment(route.params.id, commentId, content)
    if (response.success) {
      // 부모/답글 양쪽에서 탐색
      const now = new Date().toISOString()
      const parentIdx = comments.value.findIndex(c => c.commentId === commentId)
      if (parentIdx !== -1) {
        comments.value[parentIdx].content = content
        comments.value[parentIdx].updatedAt = now
      } else {
        for (const c of comments.value) {
          const reply = c.replies?.find(r => r.commentId === commentId)
          if (reply) {
            reply.content = content
            reply.updatedAt = now
            break
          }
        }
      }
    }
  } catch (err) {
    console.error('댓글 수정 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '댓글 수정에 실패했습니다.' })
  }
}

const deleteComment = async (commentId) => {
  const confirmed = await open({ type: 'danger', title: '댓글 삭제', message: '댓글을 삭제하시겠습니까?' })
  if (!confirmed) return
  try {
    const response = await feedService.deleteComment(route.params.id, commentId)
    if (response.success) {
      // 서버에서 부모의 deleted 플래그 전이가 있을 수 있으므로 목록 재조회가 가장 안전
      await loadComments(0)
      if (feed.value && feed.value.commentCount > 0) {
        feed.value.commentCount -= 1
      }
    }
  } catch (err) {
    console.error('댓글 삭제 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '댓글 삭제에 실패했습니다.' })
  }
}

const goBack = () => router.back()

const likeLoading = ref(false)
const handleLike = async () => {
  if (!feed.value || likeLoading.value) return

  // 로그인 체크
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('좋아요를 누르려면 로그인이 필요합니다.')
    if (confirmed) {
      router.push({ name: 'Login', query: { redirect: route.fullPath } })
    }
    return
  }

  // Optimistic update - 즉시 UI 반영
  const previousHasLike = feed.value.userReactions?.hasLike || false
  const previousLikeCount = feed.value.likeCount || 0

  feed.value.userReactions = { ...feed.value.userReactions, hasLike: !previousHasLike }
  feed.value.likeCount = previousHasLike ? Math.max(0, previousLikeCount - 1) : previousLikeCount + 1

  likeLoading.value = true
  try {
    const response = await feedService.toggleLike(feed.value.feedId)
    if (response.success && response.data) {
      // 서버 응답으로 실제 값 동기화
      feed.value.likeCount = response.data.likeCount
      feed.value.userReactions = { ...feed.value.userReactions, hasLike: response.data.action === 'added' }
    } else {
      // 실패 시 롤백
      feed.value.userReactions = { ...feed.value.userReactions, hasLike: previousHasLike }
      feed.value.likeCount = previousLikeCount
    }
  } catch (err) {
    console.error('좋아요 실패:', err)
    // 에러 시 롤백
    feed.value.userReactions = { ...feed.value.userReactions, hasLike: previousHasLike }
    feed.value.likeCount = previousLikeCount
  } finally {
    likeLoading.value = false
  }
}

const hotLoading = ref(false)
const handleHot = async () => {
  if (!feed.value || hotLoading.value) return

  // 로그인 체크
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('핫 반응을 남기려면 로그인이 필요합니다.')
    if (confirmed) {
      router.push({ name: 'Login', query: { redirect: route.fullPath } })
    }
    return
  }

  // 옵티미스틱 UI: 즉시 상태 토글
  const previousHasHot = feed.value.userReactions?.hasHot || false
  const previousHotCount = feed.value.hotCount || 0

  feed.value.userReactions = { ...feed.value.userReactions, hasHot: !previousHasHot }
  feed.value.hotCount = previousHasHot ? Math.max(0, previousHotCount - 1) : previousHotCount + 1

  hotLoading.value = true
  try {
    const response = await feedService.toggleHot(feed.value.feedId)
    if (response.success && response.data) {
      // 서버 응답으로 실제 값 동기화
      feed.value.hotCount = response.data.hotCount
      feed.value.userReactions = { ...feed.value.userReactions, hasHot: response.data.action === 'added' }
    } else {
      // 실패 시 롤백
      feed.value.userReactions = { ...feed.value.userReactions, hasHot: previousHasHot }
      feed.value.hotCount = previousHotCount
    }
  } catch (err) {
    console.error('핫 실패:', err)
    // 에러 시 롤백
    feed.value.userReactions = { ...feed.value.userReactions, hasHot: previousHasHot }
    feed.value.hotCount = previousHotCount
  } finally {
    hotLoading.value = false
  }
}

const handleSave = () => { isSaved.value = !isSaved.value }
const handleFollow = () => { isFollowing.value = true }
const handleUnfollow = () => { isFollowing.value = false }

const handleShare = () => {
  showShareModal.value = true
}

const handleCopyLink = async () => {
  await navigator.clipboard.writeText(window.location.href)
  await open({ type: 'alert', title: '링크 복사', message: '링크가 복사되었습니다!' })
}

const closeShareModal = () => {
  showShareModal.value = false
}

const shareImage = computed(() => imageList.value?.[0]?.fileUrl || '')

const handleReport = () => console.log('Report feed')

const handleEdit = () => {
  showEditModal.value = true
}

const handleFeedUpdated = async () => {
  await loadFeedDetail()
}

const handleDelete = async () => {
  const confirmed = await open({
    type: 'danger',
    title: '피드 삭제',
    message: '이 피드를 삭제하시겠습니까?\n삭제된 피드는 복구할 수 없습니다.'
  })
  if (!confirmed) return

  try {
    const response = await feedService.deleteFeed(feed.value.feedId)
    if (response.success) {
      await open({ type: 'alert', title: '완료', message: '피드가 삭제되었습니다.' })
      router.push('/feed')
    } else {
      throw new Error(response.message || '피드 삭제에 실패했습니다.')
    }
  } catch (err) {
    console.error('피드 삭제 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '피드 삭제에 실패했습니다.' })
  }
}
const searchByStore = () => console.log('Search by store:', feed.value?.buyPlace)
const searchByHashtag = (tag) => router.push({ path: '/feed', query: { hashtag: tag } })

const handleSendMessage = async (feedData) => {
  if (!feedData?.userInfo?.userId) {
    await open({ type: 'alert', title: '오류', message: '상대방 정보를 찾을 수 없습니다.' })
    return
  }

  const myUserId = currentUserId.value
  const targetUserId = feedData.userInfo.userId

  console.log('[FeedDetail] 채팅 시작 - myUserId:', myUserId, 'targetUserId:', targetUserId)

  if (!myUserId) {
    await open({ type: 'alert', title: '로그인 필요', message: '메시지를 보내려면 로그인이 필요합니다.' })
    return
  }

  // 본인에게 메시지 보내기 방지
  if (myUserId === targetUserId) {
    await open({ type: 'alert', title: '알림', message: '본인에게는 메시지를 보낼 수 없습니다.' })
    return
  }

  // participantIds에 두 명 포함 (본인 + 상대방)
  const participantIds = [Number(myUserId), Number(targetUserId)]
  console.log('[FeedDetail] participantIds:', participantIds)

  try {
    const response = await chatService.startChat({
      chatContext: 'PRODUCT_TRADE',
      chatContextId: feedData.feedId,
      creatorId: targetUserId,
      participantIds: participantIds
    })

    if (response.success && response.data?.roomId) {
      router.push({ name: 'ChatWithRoom', params: { roomId: response.data.roomId } })
    } else {
      throw new Error(response.message || '채팅방 생성에 실패했습니다.')
    }
  } catch (err) {
    console.error('채팅 시작 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '채팅을 시작할 수 없습니다.' })
  }
}

// 같은 라우트로 다른 feedId 진입 시 이전 피드 state 잔존 방지
const resetFeedState = () => {
  feed.value = null
  comments.value = []
  commentLoading.value = false
  commentPagination.value = { page: 0, size: 20, totalElements: 0, totalPages: 0, hasNext: false }
  isSaved.value = false
  isFollowing.value = false
  showShareModal.value = false
  showEditModal.value = false
  error.value = null
  loading.value = true
}

watch(() => route.params.id, (newId, oldId) => {
  if (!newId || newId === oldId) return
  resetFeedState()
  loadFeedDetail()
})

onMounted(() => loadFeedDetail())
</script>

<style scoped>
/* 색상: #0A0E1A / #191F28 / #4E5968 / #8B95A1 / #B0B8C1 / #F2F4F6 / #F7F8FA */

.detail-container {
  background: #ffffff;
  min-height: 100vh;
  color: #191F28;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  letter-spacing: -0.2px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  background: #ffffff;
  gap: 16px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2.5px solid #F2F4F6;
  border-top-color: #0A0E1A;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-text {
  color: #4E5968;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.btn-retry {
  padding: 11px 22px;
  background: #0A0E1A;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.2px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.18s ease, transform 0.1s ease;
}
.btn-retry:hover { background: #191F28; }
.btn-retry:active { background: #333D4B; transform: scale(0.98); }

.detail-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
}

.main-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.04),
      0 8px 32px rgba(15, 23, 42, 0.06);
}

.image-area {
  background: #F7F8FA;
  overflow: hidden;
}

.info-area {
  background: #ffffff;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .main-card {
    flex-direction: row;
    align-items: stretch;
  }

  .image-area {
    flex: 1;
    min-width: 0;
    position: sticky;
    top: 80px;
  }

  .info-area {
    flex: 1;
    min-width: 0;
    border-left: 1px solid #F2F4F6;
  }
}

@media (max-width: 1023px) {
  .detail-main {
    padding: 0;
  }

  .main-card {
    border-radius: 0;
    box-shadow: none;
  }
}

.comment-section-wrapper {
  margin-top: 16px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.04),
      0 8px 32px rgba(15, 23, 42, 0.06);
}

@media (max-width: 1023px) {
  .comment-section-wrapper {
    margin-top: 8px;
    border-radius: 0;
    border-top: 1px solid #F2F4F6;
    box-shadow: none;
  }
}
</style>