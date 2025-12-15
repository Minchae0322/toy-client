<template>
  <div class="comment-section">
    <div class="comment-inner">
      <!-- 헤더 -->
      <div class="comment-header">
        <h3 class="comment-title">댓글 {{ totalCount > 0 ? totalCount : '' }}</h3>
      </div>

      <!-- 입력창 -->
      <div class="input-row">
        <img :src="currentUserProfile" class="avatar" />
        <div class="input-wrapper">
          <input
              type="text"
              v-model="newComment"
              @keyup.enter="submitComment"
              placeholder="댓글을 입력하세요..."
              class="input"
          />
          <button
              v-show="newComment.trim()"
              @click="submitComment"
              class="btn-post"
          >
            게시
          </button>
        </div>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { feedUtils } from '@/services/FeedService'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
  feedCreatorId: { type: Number, default: null },
  currentUserProfile: { type: String, default: 'https://i.pravatar.cc/150' }
})

const emit = defineEmits(['submit', 'update', 'delete', 'load-more'])

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

const submitComment = () => {
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
}

.comment-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .comment-inner {
    padding: 0 24px;
  }
}

/* Header */
.comment-header {
  padding: 20px 0 16px;
  border-bottom: 1px solid #e5e7eb;
}

.comment-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* Input */
.input-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 10px 16px;
}

.input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #262626;
  background: transparent;
}

.input::placeholder {
  color: #9ca3af;
}

.btn-post {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #7c3aed;
  cursor: pointer;
  padding: 0;
  white-space: nowrap;
}

.btn-post:hover {
  color: #6d28d9;
}

/* List */
.list-container {
  padding: 0 0 40px;
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
  border-bottom: 1px solid #f3f4f6;
}

.item:last-child {
  border-bottom: none;
}

.body {
  flex: 1;
  min-width: 0;
}

.comment-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.author {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.badge {
  font-size: 11px;
  font-weight: 500;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.time {
  font-size: 13px;
  color: #9ca3af;
}

.edited {
  font-size: 12px;
  color: #9ca3af;
}

.text {
  font-size: 14px;
  color: #374151;
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
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
}

.meta-btn:hover {
  color: #6b7280;
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  background: #f9fafb;
}

.edit-input:focus {
  border-color: #7c3aed;
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
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
}

.btn-text.primary {
  color: #7c3aed;
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
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  text-align: center;
}

.btn-more:hover {
  background: #f3f4f6;
  color: #374151;
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
  border: 2px solid #e5e7eb;
  border-top-color: #7c3aed;
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
  color: #374151;
  margin: 0 0 4px;
}

.empty span {
  font-size: 14px;
  color: #9ca3af;
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