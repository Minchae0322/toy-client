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
        <li v-for="comment in visibleComments" :key="comment.commentId" class="item">
          <!-- 부모 댓글 -->
          <div class="comment-row">
            <img
                :src="comment.deleted ? deletedAvatar : resolveProfileImage(comment.creatorProfileUrl)"
                :class="['avatar', { clickable: !comment.deleted && comment.creatorId }]"
                @click="!comment.deleted && goToUser(comment.creatorId)"
                @error="onAvatarError"
            />
            <div class="body">
              <!-- 삭제된 부모 (답글만 남음) -->
              <template v-if="comment.deleted">
                <div class="comment-top">
                  <span class="author deleted-label">삭제된 댓글</span>
                  <span class="dot">·</span>
                  <span class="time">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text deleted-text">{{ comment.content || '삭제된 댓글입니다.' }}</p>
              </template>

              <!-- 수정 모드 -->
              <div v-else-if="editingId === comment.commentId" class="edit-mode">
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

              <!-- 일반 표시 -->
              <template v-else>
                <div class="comment-top">
                  <span
                      :class="['author', { clickable: !!comment.creatorId }]"
                      @click="goToUser(comment.creatorId)"
                  >{{ comment.creatorNickname || '사용자' }}</span>
                  <span v-if="comment.creatorId === feedCreatorId" class="badge">작성자</span>
                  <span class="dot">·</span>
                  <span class="time">{{ formatDate(comment.createdAt) }}</span>
                  <span v-if="isEdited(comment)" class="edited">(수정됨)</span>
                </div>
                <p class="text">{{ comment.content }}</p>
                <div class="meta">
                  <button @click="toggleReply(comment.commentId)" class="meta-btn">
                    {{ replyingTo === comment.commentId ? '답글 취소' : '답글' }}
                  </button>
                  <template v-if="isMyComment(comment.creatorId)">
                    <button @click="startEdit(comment)" class="meta-btn">수정</button>
                    <button @click="handleDelete(comment.commentId)" class="meta-btn delete">삭제</button>
                  </template>
                </div>
              </template>
            </div>
          </div>

          <!-- 답글 입력 -->
          <div v-if="replyingTo === comment.commentId" class="reply-input-wrapper">
            <div class="input-bar reply" :class="{ focused: replyFocused }">
              <input
                  ref="replyInputRef"
                  type="text"
                  v-model="replyContent"
                  @keyup.enter="submitReply(comment.commentId)"
                  @keyup.esc="cancelReply"
                  @focus="replyFocused = true"
                  @blur="replyFocused = false"
                  :placeholder="`@${comment.creatorNickname || '사용자'} 에게 답글 달기...`"
                  class="input"
              />
              <button
                  @click="submitReply(comment.commentId)"
                  :disabled="!replyContent.trim()"
                  :class="['btn-post', { active: replyContent.trim() }]"
              >
                <svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 답글 목록 -->
          <ul v-if="comment.replies?.length" class="reply-list">
            <li v-for="reply in comment.replies" :key="reply.commentId" class="reply-item">
              <img
                  :src="resolveProfileImage(reply.creatorProfileUrl)"
                  :class="['avatar', 'reply-avatar', { clickable: !!reply.creatorId }]"
                  @click="goToUser(reply.creatorId)"
                  @error="onAvatarError"
              />
              <div class="body">
                <div v-if="editingId === reply.commentId" class="edit-mode">
                  <textarea
                      v-model="editingContent"
                      @keyup.esc="cancelEdit"
                      class="edit-input"
                      rows="2"
                  ></textarea>
                  <div class="edit-actions">
                    <button @click="cancelEdit" class="btn-text">취소</button>
                    <button
                        @click="saveEdit(reply.commentId)"
                        :disabled="!editingContent.trim()"
                        class="btn-text primary"
                    >
                      저장
                    </button>
                  </div>
                </div>

                <template v-else>
                  <div class="comment-top">
                    <svg class="reply-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 10l-5 5 5 5M4 15h12a4 4 0 004-4V5"/>
                    </svg>
                    <span
                        :class="['author', { clickable: !!reply.creatorId }]"
                        @click="goToUser(reply.creatorId)"
                    >{{ reply.creatorNickname || '사용자' }}</span>
                    <span v-if="reply.creatorId === feedCreatorId" class="badge">작성자</span>
                    <span class="dot">·</span>
                    <span class="time">{{ formatDate(reply.createdAt) }}</span>
                    <span v-if="isEdited(reply)" class="edited">(수정됨)</span>
                  </div>
                  <p class="text">{{ reply.content }}</p>
                  <div v-if="isMyComment(reply.creatorId)" class="meta">
                    <button @click="startEdit(reply)" class="meta-btn">수정</button>
                    <button @click="handleDelete(reply.commentId)" class="meta-btn delete">삭제</button>
                  </div>
                </template>
              </div>
            </li>
          </ul>
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
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { feedUtils } from '@/services/FeedService'
import { getUserId } from '@/utils/auth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useUserBlock } from '@/composables/useUserBlock.js'
import { DEFAULT_AVATAR_URL, resolveProfileImage, onAvatarError } from '@/utils/defaultAvatar'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
  feedCreatorId: { type: Number, default: null },
  currentUserProfile: { type: String, default: DEFAULT_AVATAR_URL }
})

const { isBlocked } = useUserBlock()
const visibleComments = computed(() =>
  props.comments
    .filter((c) => !isBlocked(c?.creatorId))
    .map((c) => ({
      ...c,
      replies: Array.isArray(c.replies)
        ? c.replies.filter((r) => !isBlocked(r?.creatorId))
        : c.replies,
    }))
)

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

const replyingTo = ref(null)
const replyContent = ref('')
const replyFocused = ref(false)
const replyInputRef = ref(null)

const deletedAvatar = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><rect width=%2232%22 height=%2232%22 rx=%2216%22 fill=%22%23E5E8EB%22/><path d=%22M16 10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 10c-3.3 0-6 1.8-6 4v2h12v-2c0-2.2-2.7-4-6-4z%22 fill=%22%23B0B8C1%22/></svg>'

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

const goToUser = (userId) => {
  if (userId == null) return
  router.push({ name: 'UserFeedList', params: { userId: String(userId) } })
}

const ensureLoggedIn = async (message) => {
  if (getUserId()) return true
  const confirmed = await openLoginRequired(message)
  if (confirmed) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
  }
  return false
}

const submitComment = async () => {
  if (!(await ensureLoggedIn('댓글을 작성하려면 로그인이 필요합니다.'))) return
  if (newComment.value.trim()) {
    emit('submit', { content: newComment.value.trim(), parentCommentId: null })
    newComment.value = ''
  }
}

const toggleReply = async (commentId) => {
  if (!(await ensureLoggedIn('답글을 작성하려면 로그인이 필요합니다.'))) return
  if (replyingTo.value === commentId) {
    cancelReply()
    return
  }
  replyingTo.value = commentId
  replyContent.value = ''
  // reply ref는 v-for 내부라 배열로 들어올 수 있음
  await nextTick()
  const target = Array.isArray(replyInputRef.value) ? replyInputRef.value[0] : replyInputRef.value
  target?.focus?.()
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const submitReply = async (parentCommentId) => {
  if (!(await ensureLoggedIn('답글을 작성하려면 로그인이 필요합니다.'))) return
  const content = replyContent.value.trim()
  if (!content) return
  emit('submit', { content, parentCommentId })
  cancelReply()
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
/* 색상: var(--text-primary) / var(--c-text-600) / var(--c-text-400) / var(--c-text-300) */

.comment-section {
  background: var(--bg-elevated);
  /* iOS 홈 인디케이터 회피: env()는 PC에서 0 */
  padding: 0 20px calc(32px + env(safe-area-inset-bottom));
}

/* 헤더 */
.comment-header {
  padding: 20px 0 12px;
}

.comment-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.count {
  color: var(--c-text-400);
  font-weight: 500;
  margin-left: 4px;
}

/* 입력 바 */
.input-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 4px 4px 4px 16px;
  background: var(--bg-subtle);
  border: 1px solid var(--bg-mute);
  border-radius: 24px;
  margin-bottom: 16px;
  transition: all 0.15s ease;
}
.input-bar.focused {
  border-color: var(--border-default);
  background: var(--bg-elevated);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.06);
}
.input-bar.reply {
  margin-bottom: 8px;
}

.input {
  flex: 1;
  min-width: 0;
  padding: 8px 0;
  border: none;
  font-size: 14px;
  color: var(--text-primary);
  background: transparent;
  outline: none;
  letter-spacing: -0.01em;
}
.input::placeholder { color: var(--c-text-300); }

.btn-post {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-mute);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  color: var(--c-text-300);
}
.btn-post.active { background: var(--c-brand); color: #ffffff; }
.btn-post.active:active { background: var(--c-brand); transform: scale(0.92); }
.btn-post:disabled { cursor: not-allowed; }
.send-icon { width: 18px; height: 18px; }

/* 목록 */
.list-container { padding-top: 4px; }

.list { list-style: none; padding: 0; margin: 0; }

.item {
  padding: 14px 0;
}
.item + .item { border-top: 1px solid var(--bg-mute); }

.comment-row {
  display: flex;
  gap: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bg-mute);
}
.avatar.clickable { cursor: pointer; transition: opacity 0.15s ease; }
.avatar.clickable:hover { opacity: 0.85; }

.body { flex: 1; min-width: 0; }

.comment-top {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.reply-arrow {
  width: 12px;
  height: 12px;
  color: var(--c-text-300);
  margin-right: 2px;
  flex-shrink: 0;
}

.author {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}
.author.clickable { cursor: pointer; transition: color 0.15s ease; }
.author.clickable:hover { color: var(--c-brand); }
.author.deleted-label {
  color: var(--c-text-300);
  font-weight: 500;
}

.badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--c-brand);
  background: var(--c-brand-soft);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 2px;
}

.dot { color: var(--c-text-300); font-size: 11px; }

.time { font-size: 12px; color: var(--c-text-300); }

.edited { font-size: 11px; color: var(--c-text-300); }

.text {
  font-size: 14px;
  color: var(--c-text-600);
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
  letter-spacing: -0.01em;
}
.text.deleted-text {
  color: var(--c-text-300);
  font-style: italic;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.meta-btn {
  background: none; border: none; padding: 0;
  font-size: 12px; font-weight: 500; color: var(--c-text-400);
  cursor: pointer; transition: color 0.15s ease;
}
.meta-btn:hover { color: var(--c-text-600); }
.meta-btn:active { color: var(--c-text-600); }
.meta-btn.delete:hover { color: #E53935; }
.meta-btn.delete:active { color: #E53935; }

/* 답글 입력 */
.reply-input-wrapper {
  margin: 8px 0 4px 44px;
}

/* 답글 목록 */
.reply-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 44px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-item {
  display: flex;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--bg-mute);
}

.reply-avatar {
  width: 26px;
  height: 26px;
}

/* 수정 */
.edit-mode { width: 100%; }

.edit-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  background: var(--bg-subtle);
  box-sizing: border-box;
  color: var(--text-primary);
}
.edit-input:focus { border-color: var(--c-text-400); background: var(--bg-elevated); }

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-text {
  background: none; border: none; padding: 0;
  font-size: 13px; font-weight: 600; color: var(--c-text-400); cursor: pointer;
}
.btn-text.primary { color: var(--text-primary); }
.btn-text:disabled { opacity: 0.4; cursor: not-allowed; }

/* 더보기 */
.btn-more {
  display: block;
  width: 100%;
  margin: 12px 0 0;
  padding: 10px;
  background: var(--bg-subtle);
  border: 1px solid var(--bg-mute);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-400);
  cursor: pointer;
  text-align: center;
  transition: background 0.15s ease;
}
.btn-more:active { background: var(--bg-mute); }

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
  border: 2px solid var(--bg-mute);
  border-top-color: var(--c-text-400);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
.spinner.small { width: 16px; height: 16px; }

.empty p {
  font-size: 14px; font-weight: 600;
  color: var(--c-text-600); margin: 0 0 4px;
}
.empty span {
  font-size: 13px; color: var(--c-text-300);
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
