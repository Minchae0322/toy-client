<template>
  <div :class="['arg-card', { best: isBest }]">
    <!-- 아바타 -->
    <div class="arg-avatar">
      <img v-if="comment.creatorProfileUrl" :src="comment.creatorProfileUrl" alt="프로필" />
      <span v-else>{{ avatarInitial }}</span>
    </div>

    <!-- 내용 -->
    <div class="arg-body">
      <div class="arg-meta">
        <span class="arg-nickname">{{ comment.creatorNickname }}</span>
        <span v-if="isBest" class="best-badge">BEST</span>
        <span v-if="comment.isEdited" class="edited-label">수정됨</span>
        <span class="arg-time">{{ formatTime(comment.createdAt) }}</span>
      </div>

      <!-- 수정 모드 -->
      <div v-if="isEditing" class="edit-form">
        <input
          ref="editInput"
          v-model="editContent"
          type="text"
          class="edit-input"
          maxlength="100"
          placeholder="수정할 내용을 입력하세요"
          @keyup.enter="submitEdit"
          @keyup.esc="cancelEdit"
        />
        <div class="edit-actions">
          <button class="btn-cancel" @click="cancelEdit">취소</button>
          <button class="btn-save" @click="submitEdit" :disabled="!editContent.trim()">저장</button>
        </div>
      </div>

      <!-- 일반 모드 -->
      <template v-else>
        <p class="arg-text">{{ comment.content }}</p>

        <div class="arg-footer">
          <!-- 공감 버튼 -->
          <button
            :class="['like-btn', { liked: comment.hasLiked }]"
            @click.stop="handleLike"
            :disabled="likeLoading"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" :fill="comment.hasLiked ? 'currentColor' : 'none'">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ comment.likeCount }}</span>
          </button>

          <!-- 본인 코멘트: 수정/삭제 -->
          <div v-if="isOwner" class="owner-actions">
            <button class="action-btn" @click.stop="startEdit">수정</button>
            <button class="action-btn delete" @click.stop="handleDelete">삭제</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  isBest: {
    type: Boolean,
    default: false
  },
  isOwner: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['like', 'edit', 'delete'])

const isEditing = ref(false)
const editContent = ref('')
const editInput = ref(null)
const likeLoading = ref(false)

const avatarInitial = computed(() => {
  return (props.comment.creatorNickname || '?').charAt(0).toUpperCase()
})

const formatTime = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const handleLike = async () => {
  if (likeLoading.value) return
  likeLoading.value = true
  emit('like', props.comment.commentId)
  setTimeout(() => {
    likeLoading.value = false
  }, 300)
}

const startEdit = () => {
  editContent.value = props.comment.content
  isEditing.value = true
  nextTick(() => {
    editInput.value?.focus()
  })
}

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}

const submitEdit = () => {
  if (!editContent.value.trim()) return
  if (editContent.value.trim() === props.comment.content) {
    cancelEdit()
    return
  }
  emit('edit', props.comment.commentId, editContent.value.trim())
  isEditing.value = false
}

const handleDelete = () => {
  emit('delete', props.comment.commentId)
}
</script>

<style scoped>
/* 변론 카드 - 시안 스타일 */
.arg-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #fafbfc;
  border-radius: 14px;
  margin-bottom: 10px;
  transition: all 0.15s;
}

.arg-card:hover {
  background: #f5f7ff;
}

.arg-card.best {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
}

/* 아바타 */
.arg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #4a6cf7;
  flex-shrink: 0;
  overflow: hidden;
}

.arg-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.arg-body {
  flex: 1;
  min-width: 0;
}

.arg-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.arg-nickname {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
}

.best-badge {
  font-size: 10px;
  font-weight: 700;
  color: #f59e0b;
  background: #fffbeb;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #fde68a;
}

.edited-label {
  font-size: 10px;
  color: #9ca3af;
}

.arg-time {
  font-size: 10px;
  color: #bbb;
  margin-left: auto;
}

.arg-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.5;
  margin: 0 0 8px 0;
  word-break: break-word;
}

.arg-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 공감 버튼 - 시안 스타일 */
.like-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.like-btn:hover:not(:disabled) {
  border-color: #f43f5e;
  color: #f43f5e;
  background: #fff5f5;
}

.like-btn.liked {
  border-color: #f43f5e;
  color: #f43f5e;
  background: #fff5f5;
}

.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.owner-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.action-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  transition: color 0.15s ease;
  font-family: inherit;
}

.action-btn:hover {
  color: #374151;
}

.action-btn.delete:hover {
  color: #ef4444;
}

/* 수정 폼 */
.edit-form {
  margin-top: 4px;
}

.edit-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
  color: #333;
}

.edit-input::placeholder {
  color: #bbb;
}

.edit-input:focus {
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.08);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.btn-cancel,
.btn-save {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-cancel {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #4a6cf7;
  border: none;
  color: #fff;
}

.btn-save:hover:not(:disabled) {
  background: #3b5ce4;
}

.btn-save:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
