<template>
  <div class="comment-section">
    <!-- 헤더 -->
    <div class="comment-header">
      <h3 class="comment-title">댓글 <span v-if="totalCount > 0" class="count">{{ totalCount }}</span></h3>
    </div>

    <!-- 입력창 -->
    <div class="input-row">
      <input
          type="text"
          v-model="newComment"
          @keyup.enter="submitComment"
          :placeholder="commentPlaceholder"
          class="input"
      />
      <button
          @click="submitComment"
          :disabled="!newComment.trim()"
          class="btn-post"
      >
        게시
      </button>
    </div>

    <!-- 댓글 목록 -->
    <div class="list-container">
      <div v-if="loading && !comments.length" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="!comments.length" class="empty">
        <p>아직 댓글이 없습니다</p>
        <span>첫 댓글의 주인공이 되어보세요</span>
      </div>

      <ul v-else class="list">
        <li v-for="comment in comments" :key="comment.commentId" class="item">
          <img
              :src="comment.creatorProfileUrl || 'https://i.pravatar.cc/150'"
              class="avatar"
          />
          <div class="body">
            <div v-if="editingId === comment.commentId" class="edit-mode">
              <textarea
                  v-model="editingContent"
                  @keyup.esc="cancelEdit"
                  class="edit-input"
                  rows="2"
              ></textarea>
              <div class="edit-actions">
                <button @click="cancelEdit" class="btn-text">취소</button>
                <button
                    @click="saveEdit(comment.commentId)"
                    :disabled="!editingContent.trim()"
                    class="btn-text primary"
                >
                  저장
                </button>
              </div>
            </div>

            <template v-else>
              <div class="comment-top">
                <span class="author">{{ comment.creatorNickname || '사용자' }}</span>
                <span v-if="comment.creatorId === feedCreatorId" class="badge">작성자</span>
                <span class="dot">·</span>
                <span class="time">{{ formatDate(comment.createdAt) }}</span>
                <span v-if="isEdited(comment)" class="edited">(수정됨)</span>
              </div>
              <p class="text">{{ comment.content }}</p>
              <div v-if="isMyComment(comment.creatorId)" class="meta">
                <button @click="startEdit(comment)" class="meta-btn">수정</button>
                <button @click="handleDelete(comment.commentId)" class="meta-btn delete">삭제</button>
              </div>
            </template>
          </div>
        </li>
      </ul>

      <button v-if="hasNext && !loading" @click="$emit('load-more')" class="btn-more">
        댓글 더보기
      </button>

      <div v-if="loading && comments.length" class="loading-more">
        <div class="spinner small"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { feedUtils } from '@/services/FeedService'
import { useAuth } from '@/composables/useAuth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
  feedCreatorId: { type: Number, default: null },
  currentUserProfile: { type: String, default: 'https://i.pravatar.cc/150' }
})

const emit = defineEmits(['submit', 'update', 'delete', 'load-more'])

const { isLoggedIn } = useAuth()
const { openLoginRequired } = useConfirmDialog()
const router = useRouter()
const route = useRoute()

const commentPlaceholder = computed(() => {
  return isLoggedIn.value ? '댓글을 입력하세요...' : '로그인 후 댓글을 작성할 수 있습니다'
})

const newComment = ref('')
const editingId = ref(null)
const editingContent = ref('')

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub
  } catch { return null }
}

const isMyComment = (creatorId) => {
  const currentUserId = getCurrentUserId()
  return currentUserId && currentUserId === creatorId
}

const isEdited = (comment) => comment.updatedAt && comment.updatedAt !== comment.createdAt
const formatDate = (date) => feedUtils.formatCommentDate(date)

const submitComment = async () => {
  // 로그인 체크
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('댓글을 작성하려면 로그인이 필요합니다.')
    if (confirmed) {
      router.push({ path: '/login', query: { redirect: route.fullPath } })
    }
    return
  }

  if (newComment.value.trim()) {
    emit('submit', newComment.value.trim())
    newComment.value = ''
  }
}

const startEdit = (comment) => {
  editingId.value = comment.commentId
  editingContent.value = comment.content
}

const cancelEdit = () => {
  editingId.value = null
  editingContent.value = ''
}

const saveEdit = (commentId) => {
  if (editingContent.value.trim()) {
    emit('update', { commentId, content: editingContent.value.trim() })
    cancelEdit()
  }
}

const handleDelete = (commentId) => {
  emit('delete', commentId)
}
</script>

<style scoped>
.comment-section {
  background: #fff;
  padding: 0 20px 40px;
}

/* Header */
.comment-header {
  padding: 20px 0 16px;
}

.comment-title {
  font-size: 15px;
  font-weight: 600;
  color: #1c1917;
  margin: 0;
}

.count {
  color: #a8a29e;
  font-weight: 500;
}

/* Input */
.input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f5f5f4;
}

.input {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  border: 1px solid #e7e5e4;
  border-radius: 10px;
  font-size: 14px;
  color: #1c1917;
  background: #fafaf9;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
  box-sizing: border-box;
}

.input::placeholder {
  color: #a8a29e;
}

.input:focus {
  border-color: #d6d3d1;
  background: #fff;
}

.btn-post {
  padding: 12px 20px;
  background: #1c1917;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-post:hover:not(:disabled) {
  background: #44403c;
}

.btn-post:disabled {
  background: #e7e5e4;
  color: #a8a29e;
  cursor: not-allowed;
}

/* List */
.list-container {
  padding-top: 8px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
}

.item + .item {
  border-top: 1px solid #f5f5f4;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.body {
  flex: 1;
  min-width: 0;
}

.comment-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.author {
  font-size: 14px;
  font-weight: 600;
  color: #1c1917;
}

.badge {
  font-size: 11px;
  font-weight: 500;
  color: #8b5cf6;
  background: #f5f3ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.dot {
  color: #d6d3d1;
  font-size: 12px;
}

.time {
  font-size: 13px;
  color: #a8a29e;
}

.edited {
  font-size: 12px;
  color: #a8a29e;
}

.text {
  font-size: 14px;
  color: #44403c;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.meta-btn {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: #a8a29e;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.meta-btn:hover {
  color: #78716c;
}

.meta-btn.delete:hover {
  color: #ef4444;
}

/* Edit */
.edit-mode {
  width: 100%;
}

.edit-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  background: #fafaf9;
  box-sizing: border-box;
}

.edit-input:focus {
  border-color: #d6d3d1;
  background: #fff;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-text {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #a8a29e;
  cursor: pointer;
  padding: 0;
}

.btn-text.primary {
  color: #1c1917;
}

.btn-text:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* More */
.btn-more {
  display: block;
  width: 100%;
  margin: 16px 0 0;
  padding: 12px;
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #78716c;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s;
}

.btn-more:hover {
  background: #f5f5f4;
}

/* States */
.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e7e5e4;
  border-top-color: #78716c;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner.small {
  width: 16px;
  height: 16px;
}

.empty p {
  font-size: 15px;
  font-weight: 600;
  color: #57534e;
  margin: 0 0 4px;
}

.empty span {
  font-size: 14px;
  color: #a8a29e;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>