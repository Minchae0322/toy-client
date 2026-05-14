<template>
  <div class="author-section">
    <div class="author-info">
      <img
          :src="getUserProfileImage"
          :alt="userInfo?.nickname"
          class="author-avatar"
          @error="onAvatarError"
      />
      <div class="author-details">
        <div class="author-name-row">
          <span class="author-name">{{ userInfo?.nickname || '알 수 없음' }}</span>
          <span v-if="userInfo?.verified" class="verified-badge">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
          </span>
        </div>
        <div class="author-meta">
          <span>{{ formatDate(createdAt) }}</span>
          <span class="meta-dot"></span>
          <span class="view-count">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            {{ formatCount(viewCount) }}
          </span>
        </div>
      </div>
    </div>

    <button
        @click="isFollowing ? $emit('unfollow') : $emit('follow')"
        :class="['btn-follow', { 'btn-follow--active': isFollowing }]"
    >
      <svg v-if="isFollowing" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
      </svg>
      {{ isFollowing ? '팔로잉' : '팔로우' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { feedUtils } from '@/services/FeedService'
import { resolveProfileImage, onAvatarError } from '@/utils/defaultAvatar'

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
  return resolveProfileImage(props.userInfo?.profileImageFile?.fileUrl, props.userInfo?.profileImageUrl, props.userInfo?.profileImgUrl)
})

const formatDate = (dateString) => feedUtils.formatDate(dateString)
const formatCount = (count) => feedUtils.formatCount(count)
</script>

<style scoped>
.author-section {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--bg-subtle);
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
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.author-info:hover .author-avatar {
  transform: scale(1.05);
}

.author-details {
  flex: 1;
  min-width: 0;
}

.author-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verified-badge {
  flex-shrink: 0;
}

.verified-badge svg {
  width: 16px;
  height: 16px;
  color: var(--c-brand);
}

.author-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--c-text-400);
}

.meta-dot {
  width: 2px;
  height: 2px;
  border-radius: 9999px;
  background: var(--c-text-300);
}

.view-count {
  display: flex;
  align-items: center;
  gap: 3px;
}

.view-count svg {
  width: 14px;
  height: 14px;
}

.btn-follow {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  background: var(--c-brand);
  color: white;
}

.btn-follow:hover {
  background: var(--c-brand);
}

.btn-follow--active {
  background: var(--border-default);
  color: var(--c-text-500);
}

.btn-follow--active:hover {
  background: var(--border-strong);
}

.btn-follow svg {
  width: 14px;
  height: 14px;
}
</style>