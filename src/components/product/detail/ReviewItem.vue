<template>
  <article class="review-item">
    <div class="review-header">
      <div class="author-section">
        <div class="avatar">
          {{ getInitial(review.creatorName) }}
        </div>
        <div class="author-info">
          <div class="author-name">{{ review.creatorName || '익명' }}</div>
          <div class="review-meta">
            <div class="rating-stars">
              <span
                  v-for="i in 5"
                  :key="i"
                  class="star"
                  :class="{ filled: i <= review.rating }"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M7 1.167L8.603 4.417L12.25 4.942L9.625 7.492L10.207 11.117L7 9.415L3.793 11.117L4.375 7.492L1.75 4.942L5.397 4.417L7 1.167Z"/>
                </svg>
              </span>
            </div>
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button
            v-if="showMenu"
            @click="toggleMenu"
            class="btn-menu"
            :class="{ active: menuOpen }"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
          </svg>
        </button>

        <Transition name="menu">
          <div v-if="menuOpen" class="menu-dropdown">
            <button v-if="isOwnReview" @click="handleEdit" class="menu-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.333 2L14 4.667L5.333 13.333H2.667V10.667L11.333 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              수정
            </button>
            <button v-if="isOwnReview" @click="handleDelete" class="menu-item danger">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M6.667 7.333V11.333M9.333 7.333V11.333M3.333 4L4 13.333C4 13.687 4.14 14.026 4.391 14.276C4.641 14.527 4.98 14.667 5.333 14.667H10.667C11.02 14.667 11.359 14.527 11.609 14.276C11.86 14.026 12 13.687 12 13.333L12.667 4M6 4V2.667C6 2.313 6.14 1.974 6.391 1.724C6.641 1.473 6.98 1.333 7.333 1.333H8.667C9.02 1.333 9.359 1.473 9.609 1.724C9.86 1.974 10 2.313 10 2.667V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              삭제
            </button>
            <button v-if="!isOwnReview && isLoggedIn" @click="handleReport" class="menu-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.333V14.667M8 1.333C8 1.333 10 3.333 12.667 3.333V9.333C12.667 9.333 10 11.333 8 14.667M8 1.333C8 1.333 6 3.333 3.333 3.333V9.333C3.333 9.333 6 11.333 8 14.667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              신고
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <div class="review-content">
      <p class="review-text">{{ review.comment }}</p>

      <div v-if="hasImages" class="review-images">
        <div
            v-for="(file, index) in review.attachmentFiles"
            :key="index"
            class="image-wrapper"
            @click="openImageModal(index)"
        >
          <img :src="file.fileUrl" :alt="`리뷰 이미지 ${index + 1}`" />
        </div>
      </div>
    </div>

    <div class="review-footer">
      <button
          @click="$emit('like', review.id)"
          :class="{ active: review.hasLike }"
          class="btn-like"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
              d="M8 13.5C8 13.5 2 10 2 5.5C2 4.25 3.25 3 4.5 3C5.75 3 8 4.5 8 4.5C8 4.5 10.25 3 11.5 3C12.75 3 14 4.25 14 5.5C14 10 8 13.5 8 13.5Z"
              :fill="review.hasLike ? '#EF4444' : 'none'"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>
        <span>도움돼요</span>
        <span v-if="review.likeCount > 0" class="like-count">{{ review.likeCount }}</span>
      </button>

      <span v-if="review.status !== 'ACTIVE'" class="status-badge" :class="review.status.toLowerCase()">
        {{ getStatusText(review.status) }}
      </span>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  review: {
    type: Object,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['like', 'report', 'delete', 'edit'])

const { userId } = useAuth()

const menuOpen = ref(false)

// Computed
const isOwnReview = computed(() => {
  return props.isLoggedIn && userId.value === props.review.creatorId
})

const showMenu = computed(() => {
  return props.isLoggedIn
})

const hasImages = computed(() => {
  return props.review.attachmentFiles?.length > 0
})

// Methods
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleEdit = () => {
  menuOpen.value = false
  emit('edit', props.review.id)
}

const handleDelete = () => {
  menuOpen.value = false
  emit('delete', props.review.id)
}

const handleReport = () => {
  menuOpen.value = false
  emit('report', props.review.id)
}

const openImageModal = (index) => {
  console.log('Open image modal:', index)
  // TODO: 이미지 모달 구현
}

// Utility
const getInitial = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const weeks = Math.floor(diff / 604800000)

  if (minutes < 1) return '방금'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  if (weeks < 4) return `${weeks}주 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'DELETED': '삭제됨',
    'REPORTED': '신고됨',
    'BLOCKED': '차단됨'
  }
  return statusMap[status] || status
}

// 외부 클릭 감지
const handleClickOutside = (event) => {
  if (menuOpen.value && !event.target.closest('.menu-dropdown') && !event.target.closest('.btn-menu')) {
    menuOpen.value = false
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
/* 리뷰 아이템 */
.review-item {
  background: white;
  border: 1px solid #F3F4F6;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.review-item:hover {
  border-color: #E5E7EB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 헤더 */
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.author-section {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #111827 0%, #374151 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.01em;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #E5E7EB;
  transition: color 0.2s;
}

.star.filled {
  color: #FBBF24;
}

.review-date {
  font-size: 13px;
  color: #9CA3AF;
  font-weight: 500;
}

/* 액션 버튼 */
.actions {
  position: relative;
}

.btn-menu {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-menu:hover,
.btn-menu.active {
  background: #F3F4F6;
  color: #6B7280;
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  z-index: 10;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background: #F9FAFB;
}

.menu-item.danger {
  color: #EF4444;
}

.menu-item.danger:hover {
  background: #FEF2F2;
}

/* 메뉴 트랜지션 */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.15s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 컨텐츠 */
.review-content {
  margin-bottom: 16px;
}

.review-text {
  font-size: 15px;
  color: #374151;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  letter-spacing: -0.01em;
}

.review-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #F9FAFB;
  transition: all 0.2s;
}

.image-wrapper:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.2s;
}

/* 푸터 */
.review-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #F3F4F6;
}

.btn-like {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #E5E7EB;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-like:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-like.active {
  color: #EF4444;
  border-color: #FEE2E2;
  background: #FEF2F2;
}

.btn-like svg {
  flex-shrink: 0;
}

.like-count {
  font-weight: 700;
  color: inherit;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #F3F4F6;
  color: #6B7280;
  letter-spacing: -0.01em;
}

.status-badge.deleted {
  background: #FEE2E2;
  color: #DC2626;
}

.status-badge.reported {
  background: #FEF3C7;
  color: #D97706;
}

.status-badge.blocked {
  background: #E5E7EB;
  color: #374151;
}

/* 반응형 */
@media (max-width: 768px) {
  .review-item {
    padding: 20px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    font-size: 15px;
  }

  .author-name {
    font-size: 14px;
  }

  .review-text {
    font-size: 14px;
  }

  .review-images {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .review-item {
    padding: 16px;
  }

  .avatar {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .review-images {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>