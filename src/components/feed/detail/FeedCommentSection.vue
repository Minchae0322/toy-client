<template>
  <div class="comment-section">
    <div class="comment-inner">
      <!-- 입력창 -->
      <div class="input-row">
        <img :src="currentUserProfile" class="avatar" />
        <input
            type="text"
            v-model="newComment"
            @keyup.enter="submitComment"
            placeholder="댓글 달기..."
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
                <p class="text">
                  <span class="author">{{ comment.creatorNickname }}</span>
                  <span v-if="comment.creatorId === feedCreatorId" class="badge">작성자</span>
                  {{ comment.content }}
                </p>
                <div class="meta">
                  <span class="time">{{ formatDate(comment.createdAt) }}</span>
                  <span v-if="isEdited(comment)" class="edited">수정됨</span>
                  <template v-if="isMyComment(comment.creatorId)">
                    <button @click="startEdit(comment)" class="meta-btn">수정</button>
                    <button @click="handleDelete(comment.commentId)" class="meta-btn delete">삭제</button>
                  </template>
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

/* Input */
.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #efefef;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
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
  color: #8e8e8e;
}

.btn-post {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #0095f6;
  cursor: pointer;
  padding: 0;
}

.btn-post:hover {
  color: #00376b;
}

/* List */
.list-container {
  padding: 8px 0 40px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}

.body {
  flex: 1;
  min-width: 0;
}

.text {
  font-size: 14px;
  color: #262626;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
}

.author {
  font-weight: 600;
  margin-right: 4px;
}

.badge {
  font-size: 11px;
  font-weight: 500;
  color: #0095f6;
  background: #e8f4fd;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 4px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.time,
.edited {
  font-size: 12px;
  color: #8e8e8e;
}

.meta-btn {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #8e8e8e;
  cursor: pointer;
  padding: 0;
}

.meta-btn:hover {
  color: #262626;
}

.meta-btn.delete:hover {
  color: #ed4956;
}

/* Edit */
.edit-mode {
  width: 100%;
}

.edit-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
  outline: none;
  font-family: inherit;
}

.edit-input:focus {
  border-color: #262626;
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
  color: #8e8e8e;
  cursor: pointer;
  padding: 0;
}

.btn-text.primary {
  color: #0095f6;
}

.btn-text:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* More */
.btn-more {
  display: block;
  margin: 8px 0 0;
  padding: 0;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #8e8e8e;
  cursor: pointer;
}

.btn-more:hover {
  color: #262626;
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
  border: 2px solid #efefef;
  border-top-color: #262626;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner.small {
  width: 16px;
  height: 16px;
}

.empty p {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 4px;
}

.empty span {
  font-size: 14px;
  color: #8e8e8e;
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