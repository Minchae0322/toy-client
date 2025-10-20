<!-- CommentSection.vue -->
<template>
  <section class="section">
    <div class="header">
      <h3 class="section-title">댓글</h3>
      <span class="count">{{ comments.length }}</span>
    </div>

    <div v-if="isLoggedIn" class="comment-form">
      <textarea
          :value="newComment"
          @input="$emit('update:new-comment', $event.target.value)"
          placeholder="댓글을 작성해주세요"
          class="textarea"
      />
      <button @click="$emit('submit')" :disabled="!newComment.trim()" class="btn-submit">
        등록
      </button>
    </div>

    <div class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment">
        <div class="comment-avatar">{{ comment.userName?.[0] || '?' }}</div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="author">{{ comment.userName }}</span>
            <span class="date">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="text">{{ comment.content }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  comments: { type: Array, default: () => [] },
  isLoggedIn: { type: Boolean, default: false },
  newComment: { type: String, default: '' }
})

defineEmits(['update:new-comment', 'submit'])

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))

  if (diff === 0) return '오늘'
  if (diff === 1) return '어제'
  if (diff < 7) return `${diff}일 전`
  return d.toLocaleDateString('ko-KR')
}
</script>

<style scoped>
.section {
  padding-top: 3rem;
  border-top: 1px solid #E5E5E5;
}

.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1A1A1A;
}

.count {
  font-size: 0.875rem;
  color: #737373;
}

.comment-form {
  margin-bottom: 2rem;
}

.textarea {
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 1px solid #D4D4D4;
  border-radius: 8px;
  font-size: 0.9375rem;
  resize: vertical;
  margin-bottom: 0.75rem;
  font-family: inherit;
}

.textarea:focus {
  outline: none;
  border-color: #1A1A1A;
}

.btn-submit {
  padding: 0.625rem 1.5rem;
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #404040;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment {
  display: flex;
  gap: 0.75rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  background: #E5E5E5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #737373;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.author {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1A1A1A;
}

.date {
  font-size: 0.75rem;
  color: #A3A3A3;
}

.text {
  font-size: 0.9375rem;
  color: #525252;
  line-height: 1.6;
}
</style>