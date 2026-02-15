<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <!-- 헤더 -->
          <div class="modal-header">
            <div class="item-preview">
              <img :src="itemImage" :alt="itemName" class="item-thumb" @error="handleImageError" />
              <div class="item-info">
                <h3 class="item-name">{{ itemName }}</h3>
                <span class="comment-count">PICK 한마디 {{ totalCount }}개</span>
              </div>
            </div>
            <button class="close-btn" @click="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- 정렬 탭 -->
          <div class="tab-header">
            <button
              :class="['tab-btn', { active: sortType === 'likeCount,desc' }]"
              @click="changeSort('likeCount,desc')"
            >
              공감순
              <span class="tab-count">{{ totalCount }}</span>
            </button>
            <button
              :class="['tab-btn', { active: sortType === 'createdAt,desc' }]"
              @click="changeSort('createdAt,desc')"
            >
              최신순
            </button>
          </div>

          <!-- 코멘트 목록 -->
          <div class="comment-list" ref="listRef">
            <!-- 로딩 -->
            <div v-if="loading && comments.length === 0" class="loading-state">
              <div class="spinner"></div>
              <p>불러오는 중...</p>
            </div>

            <!-- 빈 상태 -->
            <div v-else-if="!loading && comments.length === 0" class="empty-state">
              <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>아직 PICK 한마디가 없어요</p>
              <p class="sub">첫 번째 한마디를 남겨보세요!</p>
            </div>

            <!-- 코멘트 리스트 -->
            <template v-else>
              <BattleCommentItem
                v-for="(comment, index) in comments"
                :key="comment.commentId"
                :comment="comment"
                :is-best="index === 0 && sortType === 'likeCount,desc'"
                :is-owner="isMyComment(comment)"
                @like="handleLike"
                @edit="handleEdit"
                @delete="handleDelete"
              />

              <!-- 더보기 버튼 -->
              <div v-if="hasNext" class="load-more">
                <button class="load-more-btn" @click="loadMore" :disabled="loading">
                  {{ loading ? '불러오는 중...' : '더보기' }}
                </button>
              </div>
            </template>
          </div>

          <!-- 입력창 -->
          <BattleCommentInput
            ref="inputRef"
            :disabled="submitting || !isLoggedIn"
            :placeholder="inputPlaceholder"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { battleService } from '@/services/BattleService.js'
import { useAuth } from '@/composables/useAuth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import BattleCommentItem from './BattleCommentItem.vue'
import BattleCommentInput from './BattleCommentInput.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  battleId: {
    type: [String, Number],
    default: null
  },
  itemId: {
    type: [String, Number],
    default: null
  },
  itemName: {
    type: String,
    default: ''
  },
  itemImage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'comment-created'])

const { isLoggedIn, userId } = useAuth()
const { open, openLoginRequired } = useConfirmDialog()

// 상태
const comments = ref([])
const sortType = ref('likeCount,desc')
const page = ref(0)
const totalCount = ref(0)
const hasNext = ref(false)
const loading = ref(false)
const submitting = ref(false)

const listRef = ref(null)
const inputRef = ref(null)

const inputPlaceholder = computed(() => {
  if (!isLoggedIn.value) return '로그인 후 PICK 한마디를 남겨보세요'
  return 'PICK 한마디를 남겨보세요! (100자 이내)'
})

// 내 코멘트인지 확인
const isMyComment = (comment) => {
  return isLoggedIn.value && userId.value && comment.creatorId === userId.value
}

// 이미지 에러 핸들링
const handleImageError = (e) => {
  e.target.src = 'https://placehold.co/80x80?text=No+Image'
}

// 코멘트 목록 로드
const loadComments = async (reset = false) => {
  if (loading.value) return
  if (!props.battleId || !props.itemId) {
    console.log('battleId 또는 itemId가 없습니다:', props.battleId, props.itemId)
    return
  }

  try {
    loading.value = true
    console.log('코멘트 로드 시작:', props.battleId, props.itemId, sortType.value)

    if (reset) {
      page.value = 0
      comments.value = []
    }

    const response = await battleService.getComments(props.battleId, props.itemId, {
      sort: sortType.value,
      page: page.value,
      size: 20
    })

    console.log('코멘트 응답:', response)

    if (response.success && response.data) {
      if (reset) {
        comments.value = response.data.comments
      } else {
        comments.value = [...comments.value, ...response.data.comments]
      }
      totalCount.value = response.data.totalElements
      hasNext.value = response.data.hasNext
      page.value = response.data.page
    }
  } catch (err) {
    console.error('코멘트 로드 실패:', err)
    await open({
      type: 'alert',
      title: '오류',
      message: 'PICK 한마디를 불러오는데 실패했습니다.'
    })
  } finally {
    loading.value = false
  }
}

// 더보기
const loadMore = () => {
  if (!hasNext.value || loading.value) return
  page.value++
  loadComments(false)
}

// 정렬 변경
const changeSort = (newSort) => {
  if (sortType.value === newSort) return
  sortType.value = newSort
  loadComments(true)
}

// 코멘트 작성
const handleSubmit = async (content) => {
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')
    if (confirmed) {
      close()
    }
    return
  }

  try {
    submitting.value = true

    const response = await battleService.createComment(props.battleId, props.itemId, content)

    if (response.success) {
      await loadComments(true)
      emit('comment-created')

      nextTick(() => {
        if (listRef.value) {
          listRef.value.scrollTop = 0
        }
      })
    } else {
      throw new Error(response.message || 'PICK 한마디 작성에 실패했습니다.')
    }
  } catch (err) {
    console.error('코멘트 작성 실패:', err)
    await open({
      type: 'alert',
      title: '오류',
      message: err.message || 'PICK 한마디 작성에 실패했습니다.'
    })
  } finally {
    submitting.value = false
  }
}

// 공감 토글 (낙관적 업데이트)
const handleLike = async (commentId) => {
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')
    if (confirmed) {
      close()
    }
    return
  }

  const comment = comments.value.find(c => c.commentId === commentId)
  if (!comment) return

  const prevLiked = comment.hasLiked
  const prevCount = comment.likeCount

  comment.hasLiked = !comment.hasLiked
  comment.likeCount += comment.hasLiked ? 1 : -1

  try {
    const response = await battleService.toggleCommentLike(props.battleId, props.itemId, commentId)

    if (!response.success) {
      throw new Error('공감 처리에 실패했습니다.')
    }

    if (response.data?.likeCount !== undefined) {
      comment.likeCount = response.data.likeCount
    }
  } catch (err) {
    comment.hasLiked = prevLiked
    comment.likeCount = prevCount
    console.error('공감 실패:', err)
  }
}

// 코멘트 수정
const handleEdit = async (commentId, newContent) => {
  try {
    const response = await battleService.updateComment(props.battleId, props.itemId, commentId, newContent)

    if (response.success) {
      const comment = comments.value.find(c => c.commentId === commentId)
      if (comment) {
        comment.content = newContent
        comment.isEdited = true
      }
    } else {
      throw new Error(response.message || '수정에 실패했습니다.')
    }
  } catch (err) {
    console.error('코멘트 수정 실패:', err)
    await open({
      type: 'alert',
      title: '오류',
      message: err.message || 'PICK 한마디 수정에 실패했습니다.'
    })
  }
}

// 코멘트 삭제
const handleDelete = async (commentId) => {
  const confirmed = await open({
    type: 'danger',
    title: 'PICK 한마디 삭제',
    message: '이 PICK 한마디를 삭제하시겠습니까?',
    confirmText: '삭제',
    cancelText: '취소'
  })

  if (!confirmed) return

  try {
    const response = await battleService.deleteComment(props.battleId, props.itemId, commentId)

    if (response.success) {
      comments.value = comments.value.filter(c => c.commentId !== commentId)
      totalCount.value = Math.max(0, totalCount.value - 1)
      emit('comment-created')
    } else {
      throw new Error(response.message || '삭제에 실패했습니다.')
    }
  } catch (err) {
    console.error('코멘트 삭제 실패:', err)
    await open({
      type: 'alert',
      title: '오류',
      message: err.message || 'PICK 한마디 삭제에 실패했습니다.'
    })
  }
}

// 모달 닫기
const close = () => {
  emit('close')
}

// visible, battleId, itemId가 모두 유효할 때 데이터 로드
watch(
  () => [props.visible, props.battleId, props.itemId],
  ([newVisible, newBattleId, newItemId]) => {
    if (newVisible && newBattleId && newItemId) {
      console.log('Watch triggered - visible:', newVisible, 'battleId:', newBattleId, 'itemId:', newItemId)
      sortType.value = 'likeCount,desc'
      loadComments(true)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
}

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-container {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (min-width: 768px) {
  .modal-container {
    border-radius: 20px;
    max-height: 80vh;
  }
}

/* 헤더 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.item-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-thumb {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  background: #f5f5f5;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-count {
  font-size: 12px;
  color: #6b7280;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* 탭 헤더 (시안 스타일) */
.tab-header {
  display: flex;
  border-bottom: 1.5px solid #f0f0f0;
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 14px 0;
  font-size: 14px;
  font-weight: 700;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  position: relative;
  transition: color 0.2s;
}

.tab-btn.active {
  color: #4a6cf7;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1.5px;
  left: 20%;
  right: 20%;
  height: 3px;
  background: #4a6cf7;
  border-radius: 3px;
}

.tab-count {
  font-size: 11px;
  font-weight: 600;
  background: #f3f4f6;
  padding: 2px 7px;
  border-radius: 10px;
  margin-left: 4px;
}

.tab-btn.active .tab-count {
  background: #eff2ff;
  color: #4a6cf7;
}

/* 코멘트 목록 */
.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  min-height: 200px;
}

/* 로딩/빈 상태 */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: #9ca3af;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top-color: #4a6cf7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.empty-state .sub {
  font-size: 13px;
  color: #d1d5db;
  margin-top: 4px;
}

/* 더보기 */
.load-more {
  padding: 16px 0;
  text-align: center;
}

.load-more-btn {
  padding: 10px 24px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 트랜지션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .modal-enter-from .modal-container {
    transform: translateY(20px) scale(0.95);
  }
}

.modal-leave-to .modal-container {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .modal-leave-to .modal-container {
    transform: translateY(20px) scale(0.95);
  }
}
</style>
