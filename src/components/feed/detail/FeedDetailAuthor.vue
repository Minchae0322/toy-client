<template>
  <div class="author-section">
    <div class="author-info">
      <img
          :src="getUserProfileImage"
          :alt="userInfo?.nickname"
          class="author-avatar"
      />
      <div class="author-details">
        <div class="author-name-wrapper">
          <span class="author-name">{{ userInfo?.nickname || '알 수 없음' }}</span>
          <span class="author-badge">인증</span>
        </div>
        <div class="author-meta">
          <span class="meta-item">{{ formatDate(createdAt) }}</span>
          <span class="meta-divider"></span>
          <span class="meta-item view-count">
            <svg class="meta-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            {{ formatCount(viewCount) }}
          </span>
        </div>
      </div>
    </div>

    <button v-if="!isFollowing" class="btn-follow" @click="$emit('follow')">
      <span>팔로우</span>
    </button>
    <button v-else class="btn-following" @click="$emit('unfollow')">
      <svg class="check-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
      </svg>
      <span>팔로잉</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { feedUtils } from '@/services/FeedService'

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  },
  createdAt: {
    type: String,
    default: ''
  },
  viewCount: {
    type: Number,
    default: 0
  },
  categoryName: {
    type: String,
    default: ''
  },
  isFollowing: {
    type: Boolean,
    default: false
  }
})

defineEmits(['follow', 'unfollow'])

const getUserProfileImage = computed(() => {
  return props.userInfo?.profileImageFile?.fileUrl || 'https://i.pravatar.cc/150?img=33'
})

const formatDate = (dateString) => feedUtils.formatDate(dateString)
const formatCount = (count) => feedUtils.formatCount(count)
</script>

<style scoped>
.author-section {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

@media (min-width: 1024px) {
  .author-section {
    padding: 24px 28px;
  }
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--border);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.author-info:hover .author-avatar {
  transform: scale(1.05);
  border-color: var(--accent);
}

.author-details {
  flex: 1;
  min-width: 0;
}

.author-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.03em;
}

.author-badge {
  padding: 2px 8px;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}

.author-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-item {
  font-size: 13px;
  color: var(--secondary);
  font-weight: 400;
  letter-spacing: -0.01em;
}

.meta-divider {
  width: 1px;
  height: 12px;
  background: var(--border);
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  width: 14px;
  height: 14px;
  color: var(--tertiary);
}

.btn-follow,
.btn-following {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  flex-shrink: 0;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-follow {
  background: var(--accent);
  color: white;
}

.btn-follow:hover {
  background: #E55A2B;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.btn-follow:active {
  transform: translateY(0);
}

.btn-following {
  background: var(--hover);
  color: var(--secondary);
  border: 1px solid var(--border);
}

.btn-following:hover {
  background: var(--bg);
  border-color: var(--secondary);
}

.check-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 640px) {
  .author-section {
    padding: 16px 20px;
  }

  .author-name {
    font-size: 15px;
  }

  .btn-follow,
  .btn-following {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>