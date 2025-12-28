<template>
  <article class="feed-card">
    <!-- 헤더 -->
    <div class="feed-header">
      <div class="avatar">{{ feed.avatar }}</div>
      <div class="user-info">
        <p class="username">{{ feed.user }}</p>
        <p class="time">{{ feed.time }}</p>
      </div>
      <button class="more-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="6" r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
          <circle cx="12" cy="18" r="1.5"/>
        </svg>
      </button>
    </div>

    <!-- 콘텐츠 -->
    <div class="feed-content">
      <p>{{ feed.content }}</p>
    </div>

    <!-- 이미지 (4:3 비율) -->
    <div v-if="feed.image" class="feed-image">
      <img :src="feed.image" alt="" />
    </div>

    <!-- 액션 -->
    <div class="feed-actions">
      <button
          :class="['action-btn', { active: feed.liked }]"
          @click="$emit('like', feed.id)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" :fill="feed.liked ? '#7c3aed' : 'none'" :stroke="feed.liked ? '#7c3aed' : 'currentColor'" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>{{ feed.likes }}</span>
      </button>
      <button class="action-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span>{{ feed.comments }}</span>
      </button>
      <button class="action-btn share-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      </button>
    </div>
  </article>
</template>

<script setup>
defineProps({
  feed: {
    type: Object,
    required: true
  }
})

defineEmits(['like'])
</script>

<style scoped>
.feed-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}

.feed-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin: 0;
}

.time {
  font-size: 12px;
  color: #999;
  margin: 2px 0 0;
}

.more-btn {
  padding: 8px;
  border: none;
  background: none;
  color: #999;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s;
}

.more-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.feed-content {
  padding: 0 16px 12px;
}

.feed-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

/* 이미지 4:3 비율 */
.feed-image {
  padding: 0 16px 12px;
}

.feed-image img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.feed-actions {
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: none;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s;
}

.action-btn:hover {
  color: #7c3aed;
}

.action-btn.active {
  color: #7c3aed;
}

.share-btn {
  margin-left: auto;
}
</style>