<template>
  <div class="comment-section">
    <!-- 헤더 -->
    <div class="comment-header">
      <h3 class="comment-title">댓글 <span v-if="totalCount > 0" class="count">{{ totalCount }}</span></h3>
    </div>

    <!-- 입력창 -->
    <div class="input-bar" :class="{ focused: inputFocused }">
      <input
          type="text"
          v-model="newComment"
          @keyup.enter="submitComment"
          @focus="inputFocused = true"
          @blur="inputFocused = false"
          :placeholder="commentPlaceholder"
          class="input"
      />
      <button
          @click="submitComment"
          :disabled="!newComment.trim()"
          :class="['btn-post', { active: newComment.trim() }]"
      >
        <svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7l7 7-7 7"/>
        </svg>
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
import { getUserId } from '@/utils/auth.js'
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

const { openLoginRequired } = useConfirmDialog()
const router = useRouter()
const route = useRoute()

const commentPlaceholder = computed(() => {
  return getUserId() ? '댓글을 입력하세요...' : '로그인 후 댓글을 작성할 수 있습니다'
})

const newComment = ref('')
const inputFocused = ref(false)
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
  if (!getUserId()) {
    const confirmed = await openLoginRequired('댓글을 작성하려면 로그인이 필요합니다.')
    if (confirmed) {
      router.push({ name: 'Login', query: { redirect: route.fullPath } })
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
/* 색상: #191F28 / #4E5968 / #8B95A1 / #B0B8C1 */

.comment-section {
  background: #fff;
  padding: 0 20px 32px;
}

/* 헤더 */
.comment-header {
  padding: 20px 0 12px;
}

.comment-title {
  font-size: 15px;
  font-weight: 700;
  color: #191F28;
  margin: 0;
  letter-spacing: -0.02em;
}

.count {
  color: #8B95A1;
  font-weight: 500;
  margin-left: 4px;
}

/* 입력 바 */
.input-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 4px 4px 4px 16px;
  background: #F7F8FA;
  border: 1px solid #F2F4F6;
  border-radius: 24px;
  margin-bottom: 16px;
  transition: all 0.15s ease;
}
.input-bar.focused {
  border-color: #E5E8EB;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.06);
}

.input {
  flex: 1;
  min-width: 0;
  padding: 8px 0;
  border: none;
  font-size: 14px;
  color: #191F28;
  background: transparent;
  outline: none;
  letter-spacing: -0.01em;
}
.input::placeholder { color: #B0B8C1; }

.btn-post {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F2F4F6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  color: #B0B8C1;
}
.btn-post.active { background: #9333EA; color: #fff; }
.btn-post.active:active { background: #7E22CE; transform: scale(0.92); }
.btn-post:disabled { cursor: not-allowed; }
.send-icon { width: 18px; height: 18px; }

/* 목록 */
.list-container { padding-top: 4px; }

.list { list-style: none; padding: 0; margin: 0; }

.item {
  display: flex;
  gap: 12px;
  padding: 14px 0;
}
.item + .item { border-top: 1px solid #F2F4F6; }

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.body { flex: 1; min-width: 0; }

.comment-top {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.author {
  font-size: 13px;
  font-weight: 600;
  color: #191F28;
  letter-spacing: -0.01em;
}

.badge {
  font-size: 10px;
  font-weight: 700;
  color: #9333EA;
  background: #F3E8FF;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 2px;
}

.dot { color: #B0B8C1; font-size: 11px; }

.time { font-size: 12px; color: #B0B8C1; }

.edited { font-size: 11px; color: #B0B8C1; }

.text {
  font-size: 14px;
  color: #4E5968;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
  letter-spacing: -0.01em;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.meta-btn {
  background: none; border: none; padding: 0;
  font-size: 12px; font-weight: 500; color: #8B95A1;
  cursor: pointer; transition: color 0.15s ease;
}
.meta-btn:active { color: #4E5968; }
.meta-btn.delete:active { color: #E53935; }

/* 수정 */
.edit-mode { width: 100%; }

.edit-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E5E8EB;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  background: #F7F8FA;
  box-sizing: border-box;
  color: #191F28;
}
.edit-input:focus { border-color: #8B95A1; background: #fff; }

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-text {
  background: none; border: none; padding: 0;
  font-size: 13px; font-weight: 600; color: #8B95A1; cursor: pointer;
}
.btn-text.primary { color: #191F28; }
.btn-text:disabled { opacity: 0.4; cursor: not-allowed; }

/* 더보기 */
.btn-more {
  display: block;
  width: 100%;
  margin: 12px 0 0;
  padding: 10px;
  background: #F7F8FA;
  border: 1px solid #F2F4F6;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #8B95A1;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s ease;
}
.btn-more:active { background: #F2F4F6; }

/* 상태 */
.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.spinner {
  width: 20px; height: 20px;
  border: 2px solid #F2F4F6;
  border-top-color: #8B95A1;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
.spinner.small { width: 16px; height: 16px; }

.empty p {
  font-size: 14px; font-weight: 600;
  color: #4E5968; margin: 0 0 4px;
}
.empty span {
  font-size: 13px; color: #B0B8C1;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>