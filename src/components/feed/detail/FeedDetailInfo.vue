<template>
  <div class="info-section">
    <!-- Author Info -->
    <FeedDetailAuthor
        :user-info="feed.userInfo"
        :created-at="feed.createdAt"
        :view-count="feed.viewCount"
        :category-name="feed.subCategoryDetail?.subCategoryName"
        :is-following="isFollowing"
        @follow="$emit('follow')"
        @unfollow="$emit('unfollow')"
    />

    <!-- Scrollable Content -->
    <div class="scrollable-content">
      <!-- Product Info -->
      <div class="product-section">
        <!-- Title + Evaluation -->
        <div class="product-header">
          <h2 class="product-name">{{ getProductName }}</h2>
          <span v-if="feed.feedEvaluation" :class="['evaluation-badge', getEvaluationClass(feed.feedEvaluation)]">
            {{ getEvaluationLabel(feed.feedEvaluation) }}
          </span>
        </div>

        <!-- Meta Info -->
        <div class="product-meta">
          <span v-if="feed.product?.brand" class="meta-tag brand">{{ feed.product.brand }}</span>
          <span v-if="feed.subCategoryDetail?.subCategoryName" class="meta-tag category">
            {{ feed.subCategoryDetail.subCategoryName }}
          </span>
        </div>

        <!-- Price Section -->
        <div class="price-container">
          <div class="price-wrapper">
            <span class="price-label">구매가격</span>
            <span class="price-value">{{ formatPrice(feed.buyPrice) }}</span>
          </div>
          <div v-if="feed.buyPlace" class="store-info" @click="$emit('search-store')">
            <svg class="store-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            <span class="store-name">{{ feed.buyPlace }}</span>
          </div>
        </div>

        <!-- Review -->
        <div class="review-container">
          <p class="review-text">{{ feed.review }}</p>
        </div>

        <!-- Hashtags -->
        <div v-if="feed.hashtags && feed.hashtags.length > 0" class="hashtags-container">
          <button
              v-for="tag in feed.hashtags"
              :key="tag.hashtagId"
              class="hashtag-button"
              @click="$emit('search-hashtag', tag.name)"
          >
            #{{ tag.name }}
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="section-divider"></div>

      <!-- Reaction Bar -->
      <div class="reaction-container">
        <div class="reaction-stats">
          <button @click="$emit('hot')" :class="['reaction-button', { active: feed.userReactions?.hasHot }]">
            <svg class="reaction-icon hot" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
            </svg>
            <span class="reaction-count">{{ feed.hotCount || 0 }}</span>
          </button>

          <button @click="$emit('like')" :class="['reaction-button', { active: feed.userReactions?.hasLike }]">
            <svg class="reaction-icon like" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
            <span class="reaction-count">{{ feed.likeCount || 0 }}</span>
          </button>

          <button class="reaction-button">
            <svg class="reaction-icon comment" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span class="reaction-count">{{ comments.length }}</span>
          </button>

          <button @click="$emit('save')" :class="['reaction-button save', { active: isSaved }]">
            <svg class="reaction-icon bookmark" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </button>
        </div>

        <!-- Message Button -->
        <button class="btn-message" @click="$emit('send-message')">
          <svg class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span>판매자에게 문의하기</span>
        </button>
      </div>

      <!-- Divider -->
      <div class="section-divider"></div>

      <!-- Comments -->
      <div class="comment-section">
        <div class="comment-section-header">
          <h3 class="comment-title">
            댓글 <span class="comment-count-badge">{{ comments.length }}</span>
          </h3>
          <select
              :value="commentSort"
              @change="$emit('update:comment-sort', $event.target.value)"
              class="comment-sort-select"
          >
            <option value="popular">인기순</option>
            <option value="latest">최신순</option>
          </select>
        </div>

        <!-- Comment Input -->
        <div class="comment-input-wrapper">
          <img src="https://i.pravatar.cc/150?img=12" alt="User" class="comment-input-avatar" />
          <input
              ref="commentInput"
              type="text"
              placeholder="댓글을 입력하세요"
              v-model="newComment"
              @keyup.enter="submitComment"
              class="comment-input"
          />
          <button
              :disabled="!newComment.trim()"
              @click="submitComment"
              class="btn-comment-send"
              :class="{ active: newComment.trim() }"
          >
            <svg class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>

        <!-- Comment List -->
        <div v-if="sortedComments.length > 0" class="comment-list">
          <article v-for="comment in sortedComments" :key="comment.id" class="comment-item">
            <img :src="comment.author.image" :alt="comment.author.name" class="comment-avatar" />
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author.name }}</span>
                <span v-if="comment.isAuthor" class="author-label">작성자</span>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
              <p class="comment-text">{{ comment.text }}</p>
              <div class="comment-actions">
                <button class="comment-action-button" @click="$emit('reply-comment', comment.id)">
                  답글
                </button>
                <button
                    @click="$emit('like-comment', comment.id)"
                    :class="['comment-action-button like', { active: comment.isLiked }]"
                >
                  <svg class="comment-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                  </svg>
                  <span>{{ comment.fire }}</span>
                </button>
              </div>

              <!-- Replies -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
                <button
                    v-if="!comment.showReplies"
                    class="show-replies-button"
                    @click="comment.showReplies = true"
                >
                  답글 {{ comment.replies.length }}개 보기
                </button>
                <div v-else class="replies-list">
                  <article v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <img :src="reply.author.image" :alt="reply.author.name" class="reply-avatar" />
                    <div class="reply-content">
                      <div class="reply-header">
                        <span class="reply-author">{{ reply.author.name }}</span>
                        <span class="reply-time">{{ reply.time }}</span>
                      </div>
                      <p class="reply-text">
                        <span class="mention">@{{ reply.mentionTo }}</span>
                        {{ reply.text }}
                      </p>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div v-else class="comment-empty">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p class="empty-text">아직 댓글이 없습니다</p>
          <p class="empty-subtext">첫 댓글을 남겨보세요</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { feedUtils } from '@/services/FeedService'
import FeedDetailAuthor from './FeedDetailAuthor.vue'

const props = defineProps({
  feed: {
    type: Object,
    required: true
  },
  isFollowing: {
    type: Boolean,
    default: false
  },
  isSaved: {
    type: Boolean,
    default: false
  },
  comments: {
    type: Array,
    default: () => []
  },
  commentSort: {
    type: String,
    default: 'popular'
  }
})

defineEmits([
  'follow',
  'unfollow',
  'like',
  'hot',
  'save',
  'send-message',
  'search-store',
  'search-hashtag',
  'submit-comment',
  'reply-comment',
  'like-comment',
  'update:comment-sort'
])

const newComment = ref('')

const getProductName = computed(() => {
  return props.feed?.product?.name || props.feed?.productName || '상품명 없음'
})

const sortedComments = computed(() => {
  if (props.commentSort === 'popular') {
    return [...props.comments].sort((a, b) => b.fire - a.fire)
  }
  return props.comments
})

const submitComment = () => {
  if (!newComment.value.trim()) return
  // emit은 부모에서 처리
  newComment.value = ''
}

// Utility functions
const formatPrice = (price) => feedUtils.formatPrice(price)
const getEvaluationLabel = (evaluation) => feedUtils.getEvaluationLabel(evaluation)

const getEvaluationClass = (evaluation) => {
  const code = typeof evaluation === 'string' ? evaluation : evaluation?.code
  const classMap = {
    'BEST': 'eval-best',
    'GOOD': 'eval-good',
    'OKAY': 'eval-okay',
    'BAD': 'eval-bad'
  }
  return classMap[code] || ''
}
</script>

<style scoped>
.info-section {
  display: flex;
  flex-direction: column;
  background: var(--card);
}

@media (min-width: 1024px) {
  .info-section {
    width: 520px;
    flex-shrink: 0;
    border-left: 1px solid var(--border);
  }
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

@media (min-width: 1024px) {
  .scrollable-content {
    max-height: calc(100vh - 180px);
  }
}

/* Scrollbar Styling */
.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: var(--secondary);
}

/* Product Section */
.product-section {
  padding: 28px 24px;
}

@media (min-width: 1024px) {
  .product-section {
    padding: 32px 28px;
  }
}

.product-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.product-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.35;
  flex: 1;
  letter-spacing: -0.04em;
}

@media (min-width: 1024px) {
  .product-name {
    font-size: 24px;
  }
}

.evaluation-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

.evaluation-badge.eval-best {
  background: linear-gradient(135deg, #FFF4E6 0%, #FFE7CC 100%);
  color: #C2410C;
}

.evaluation-badge.eval-good {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  color: #065F46;
}

.evaluation-badge.eval-okay {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  color: #1E40AF;
}

.evaluation-badge.eval-bad {
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  color: #991B1B;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.meta-tag {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.meta-tag.brand {
  background: var(--hover);
  color: var(--primary);
}

.meta-tag.category {
  background: #F0F9FF;
  color: #0369A1;
}

.price-container {
  padding: 20px;
  background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #FDE68A;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}

.price-label {
  font-size: 14px;
  font-weight: 500;
  color: #92400E;
  letter-spacing: -0.01em;
}

.price-value {
  font-size: 28px;
  font-weight: 800;
  color: #B45309;
  letter-spacing: -0.04em;
}

.store-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.store-info:hover {
  transform: translateX(2px);
}

.store-icon {
  width: 16px;
  height: 16px;
  color: #92400E;
  flex-shrink: 0;
}

.store-name {
  font-size: 14px;
  font-weight: 600;
  color: #92400E;
  letter-spacing: -0.01em;
}

.review-container {
  margin-bottom: 24px;
}

.review-text {
  font-size: 15px;
  color: var(--primary);
  line-height: 1.65;
  word-break: keep-all;
  letter-spacing: -0.02em;
}

.hashtags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag-button {
  padding: 8px 14px;
  background: var(--hover);
  color: #2563EB;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  letter-spacing: -0.01em;
}

.hashtag-button:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
  color: #1D4ED8;
  transform: translateY(-1px);
}

/* Section Divider */
.section-divider {
  height: 8px;
  background: var(--bg);
}

/* Reaction Container */
.reaction-container {
  padding: 20px 24px;
}

@media (min-width: 1024px) {
  .reaction-container {
    padding: 24px 28px;
  }
}

.reaction-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.reaction-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  letter-spacing: -0.01em;
}

.reaction-button:hover {
  background: var(--hover);
  border-color: var(--secondary);
  transform: translateY(-1px);
}

.reaction-button.active.hot {
  background: #FFF7ED;
  border-color: #FDBA74;
  color: #EA580C;
}

.reaction-button.active.like {
  background: #F0F9FF;
  border-color: #7DD3FC;
  color: #0284C7;
}

.reaction-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  flex-shrink: 0;
}

.reaction-count {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.reaction-button.save {
  margin-left: auto;
  padding: 8px;
  min-width: 40px;
}

.reaction-button.save.active {
  background: #FFFBEB;
  border-color: #FCD34D;
  color: #D97706;
}

.btn-message {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  letter-spacing: -0.02em;
}

.btn-message:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.btn-message:active {
  transform: translateY(0);
}

.message-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* Comment Section */
.comment-section {
  padding: 24px;
}

@media (min-width: 1024px) {
  .comment-section {
    padding: 28px;
  }
}

.comment-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.comment-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.03em;
}

.comment-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: var(--accent);
  color: white;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.comment-sort-select {
  padding: 6px 12px;
  background: var(--hover);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--secondary);
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: all 0.2s;
}

.comment-sort-select:hover {
  border-color: var(--secondary);
}

.comment-sort-select:focus {
  outline: none;
  border-color: var(--primary);
}

.comment-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--hover);
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.comment-input-wrapper:focus-within {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.05);
}

.comment-input-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-input {
  flex: 1;
  padding: 0;
  background: transparent;
  border: none;
  font-size: 14px;
  font-family: inherit;
  color: var(--primary);
  letter-spacing: -0.01em;
}

.comment-input:focus {
  outline: none;
}

.comment-input::placeholder {
  color: var(--tertiary);
}

.btn-comment-send {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--border);
  color: var(--tertiary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.btn-comment-send.active {
  background: var(--accent);
  color: white;
}

.btn-comment-send.active:hover {
  background: #E55A2B;
  transform: scale(1.05);
}

.btn-comment-send:disabled {
  cursor: not-allowed;
}

.send-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.comment-author {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: -0.02em;
}

.author-label {
  padding: 2px 8px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.comment-time {
  font-size: 13px;
  color: var(--tertiary);
  letter-spacing: -0.01em;
}

.comment-text {
  font-size: 14px;
  color: var(--primary);
  line-height: 1.6;
  margin-bottom: 10px;
  word-break: keep-all;
  letter-spacing: -0.01em;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.comment-action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  letter-spacing: -0.01em;
}

.comment-action-button:hover {
  background: var(--hover);
  color: var(--primary);
}

.comment-action-button.like.active {
  color: #0284C7;
}

.comment-action-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.replies-container {
  margin-top: 16px;
  padding-left: 20px;
  border-left: 2px solid var(--border);
}

.show-replies-button {
  padding: 8px 14px;
  background: var(--hover);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  letter-spacing: -0.01em;
}

.show-replies-button:hover {
  background: var(--bg);
  color: var(--primary);
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.reply-item {
  display: flex;
  gap: 10px;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.reply-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: -0.02em;
}

.reply-time {
  font-size: 12px;
  color: var(--tertiary);
  letter-spacing: -0.01em;
}

.reply-text {
  font-size: 13px;
  color: var(--primary);
  line-height: 1.6;
  word-break: keep-all;
  letter-spacing: -0.01em;
}

.mention {
  color: #2563EB;
  font-weight: 600;
}

.comment-empty {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  color: var(--border);
  margin: 0 auto 16px;
  stroke-width: 1.5;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--secondary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.empty-subtext {
  font-size: 14px;
  color: var(--tertiary);
  letter-spacing: -0.01em;
}

@media (max-width: 640px) {
  .product-section,
  .reaction-container,
  .comment-section {
    padding: 20px;
  }

  .product-name {
    font-size: 20px;
  }

  .price-value {
    font-size: 24px;
  }
}
</style>