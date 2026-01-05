<template>
  <aside class="sidebar">
    <!-- 인기 해시태그 -->
    <div class="sidebar-card">
      <div class="sidebar-header">
        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
        </svg>
        <h3 class="sidebar-title">인기 해시태그</h3>
      </div>
      <div class="hashtag-list">
        <button
            v-for="(tag, index) in popularHashtags"
            :key="tag.name"
            class="hashtag-item"
            @click="$emit('search-tag', tag.name)"
        >
          <span class="hashtag-rank" :class="getRankClass(index)">{{ index + 1 }}</span>
          <span class="hashtag-name">#{{ tag.name }}</span>
          <span class="hashtag-count">{{ formatCount(tag.count) }}</span>
        </button>
      </div>
    </div>

    <!-- 트렌딩 카테고리 -->
    <div class="sidebar-card">
      <div class="sidebar-header">
        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
        <h3 class="sidebar-title">트렌딩</h3>
      </div>
      <div class="trending-list">
        <button
            v-for="category in trendingCategories"
            :key="category.id"
            class="trending-item"
            @click="$emit('filter-category', category.id)"
        >
          <span class="trending-emoji">{{ category.emoji }}</span>
          <div class="trending-info">
            <span class="trending-name">{{ category.name }}</span>
            <span class="trending-desc">{{ category.description }}</span>
          </div>
          <span class="trending-badge" v-if="category.isHot">HOT</span>
        </button>
      </div>
    </div>

    <!-- 추천 유저 -->
    <div class="sidebar-card">
      <div class="sidebar-header">
        <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h3 class="sidebar-title">추천 리뷰어</h3>
      </div>
      <div class="user-list">
        <div v-for="user in recommendedUsers" :key="user.id" class="user-item">
          <div class="user-avatar">
            <img v-if="user.avatar" :src="user.avatar" alt="" />
            <span v-else class="avatar-fallback">{{ user.name.charAt(0) }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-stats">리뷰 {{ user.reviewCount }}개</span>
          </div>
          <button class="follow-btn" @click="$emit('follow-user', user.id)">팔로우</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  popularHashtags: {
    type: Array,
    default: () => [
      { name: '가성비', count: 1523 },
      { name: '다이소', count: 1204 },
      { name: '편의점신상', count: 987 },
      { name: '무신사', count: 856 },
      { name: '올리브영', count: 743 },
      { name: '꿀템', count: 621 },
      { name: '일상템', count: 534 },
      { name: '뷰티', count: 489 }
    ]
  },
  trendingCategories: {
    type: Array,
    default: () => [
      { id: 1, name: '뷰티/코스메틱', emoji: '💄', description: '오늘 +128건', isHot: true },
      { id: 2, name: '패션/의류', emoji: '👕', description: '오늘 +95건', isHot: true },
      { id: 3, name: '식품/음료', emoji: '🍜', description: '오늘 +87건', isHot: false },
      { id: 4, name: '생활용품', emoji: '🏠', description: '오늘 +64건', isHot: false }
    ]
  },
  recommendedUsers: {
    type: Array,
    default: () => [
      { id: 1, name: '뷰티마니아', avatar: null, reviewCount: 234 },
      { id: 2, name: '가성비헌터', avatar: null, reviewCount: 189 },
      { id: 3, name: '일상리뷰어', avatar: null, reviewCount: 156 }
    ]
  }
});

defineEmits(['search-tag', 'filter-category', 'follow-user']);

const getRankClass = (index) => {
  if (index === 0) return 'rank-gold';
  if (index === 1) return 'rank-silver';
  if (index === 2) return 'rank-bronze';
  return '';
};

const formatCount = (count) => {
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count;
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 20px;
  height: fit-content;
}

.sidebar-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.sidebar-icon { width: 16px; height: 16px; color: #6366f1; }

.sidebar-title { font-size: 13px; font-weight: 700; color: #1a1a1a; }

/* Hashtag List */
.hashtag-list { display: flex; flex-direction: column; gap: 2px; }

.hashtag-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
  font-family: inherit;
}

.hashtag-item:hover { background: #f8f8f8; }

.hashtag-rank {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #666;
}

.hashtag-rank.rank-gold { background: #fef3c7; color: #d97706; }
.hashtag-rank.rank-silver { background: #e5e7eb; color: #4b5563; }
.hashtag-rank.rank-bronze { background: #fed7aa; color: #c2410c; }

.hashtag-name { flex: 1; font-size: 13px; font-weight: 500; color: #1a1a1a; }

.hashtag-count { font-size: 11px; color: #999; }

/* Trending List */
.trending-list { display: flex; flex-direction: column; gap: 2px; }

.trending-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
  font-family: inherit;
}

.trending-item:hover { background: #f8f8f8; }

.trending-emoji { font-size: 18px; }

.trending-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }

.trending-name { font-size: 12px; font-weight: 600; color: #1a1a1a; }

.trending-desc { font-size: 10px; color: #999; }

.trending-badge {
  padding: 2px 5px;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
}

/* User List */
.user-list { display: flex; flex-direction: column; gap: 6px; }

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}

.user-item:hover { background: #f8f8f8; }

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-fallback { font-size: 12px; font-weight: 600; color: white; }

.user-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }

.user-name { font-size: 12px; font-weight: 600; color: #1a1a1a; }

.user-stats { font-size: 10px; color: #999; }

.follow-btn {
  padding: 5px 10px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.follow-btn:hover { background: #6366f1; color: white; border-color: #6366f1; }

/* 1024px 이하에서 숨김 */
@media (max-width: 1024px) {
  .sidebar { display: none; }
}
</style>