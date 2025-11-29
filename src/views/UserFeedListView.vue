<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 뒤로가기 버튼 -->
      <button class="back-btn" @click="handleBack">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <!-- ⭐ 프로필 헤더 컴포넌트 -->
      <UserProfileHeader
          :user-info="userInfo"
          :user-stats="userStats"
          :is-following="isFollowing"
          @follow="handleFollow"
      />

      <!-- ⭐ 탭 네비게이션 컴포넌트 -->
      <UserTabNavigation
          v-model="activeMenu"
          :menu-items="menuItems"
      />

      <!-- 피드 리스트 -->
      <div class="feed-container">
        <FeedList
            ref="feedListRef"
            :feeds="feeds"
            :loading="loading"
            :has-next="hasNext"
            :view-mode="viewMode"
            :liked-posts="likedPosts"
            :hot-posts="hotPosts"
            :saved-posts="savedPosts"
            @update="handleReactionUpdate"
            @save="handleSave"
            @comment="handleComment"
            @post-click="openPost"
            @view-mode-change="viewMode = $event"
        />
      </div>
    </main>

    <!-- Bottom Navigation - Mobile Only -->
    <nav class="bottom-nav">
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        <span>홈</span>
      </button>
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
        </svg>
        <span>배틀</span>
      </button>
      <button class="bottom-nav-fab" @click="$router.push({name: 'FeedCreate'})">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
        </svg>
        <span>메시지</span>
        <span class="nav-badge">3</span>
      </button>
      <button class="bottom-nav-item active">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
        </svg>
        <span>MY</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFeed } from '@/services/FeedService';
import AppSidebar from '@/components/feed/AppSidebar.vue';
import FeedList from '@/components/feed/FeedList.vue';
import UserProfileHeader from '@/components/userFeed/UserProfileHeader.vue';
import UserTabNavigation from '@/components/userFeed/UserTabNavigation.vue';

const router = useRouter();
const route = useRoute();
const feedService = useFeed();

const userId = computed(() => route.params.userId);

// State
const userInfo = ref({
  nickname: '',
  profileImageUrl: '',
  level: 1,
  bio: '',
  location: '',
  joinDate: ''
});

const userStats = ref({
  feeds: 0,
  followers: 0,
  following: 0,
  totalLikes: 0
});

const feeds = ref([]);
const cursor = ref(null);
const hasNext = ref(true);
const loading = ref(false);
const likedPosts = ref(new Set());
const hotPosts = ref(new Set());
const savedPosts = ref(new Set());
const isFollowing = ref(false);

const viewMode = ref('feed');
const activeMenu = ref('feeds');

const menuItems = [
  { label: '내 게시물', value: 'feeds' },
  { label: '좋아요한 글', value: 'liked' },
  { label: '저장한 글', value: 'saved' }
];

const feedListRef = ref(null);

// Methods
const loadUserInfo = async () => {
  try {
    userInfo.value = {
      nickname: '뷰티러버',
      profileImageUrl: 'https://i.pravatar.cc/300?img=5',
      level: 12,
      bio: '좋은 제품을 찾아 공유합니다 ✨',
      location: '서울',
      joinDate: '2023.03'
    };

    userStats.value = {
      feeds: 127,
      followers: 3542,
      following: 892,
      totalLikes: 15234
    };

    console.log('✅ 사용자 정보 로드 완료');
  } catch (error) {
    console.error('❌ 사용자 정보 로드 실패:', error);
  }
};

const loadUserFeeds = async () => {
  if (loading.value || !hasNext.value) return;

  try {
    loading.value = true;

    const searchCondition = {
      creatorId: userId.value,
      cursor: cursor.value,
      size: 20,
      isActive: true
    };

    const response = await feedService.getFeedsWithCursor(searchCondition);

    if (response.success && response.data) {
      feeds.value = [...feeds.value, ...response.data.feeds];
      cursor.value = response.data.nextCursor;
      hasNext.value = response.data.hasNext;

      response.data.feeds.forEach(feed => {
        if (feed.userReactions?.hasLike) likedPosts.value.add(feed.feedId);
        if (feed.userReactions?.hasHot) hotPosts.value.add(feed.feedId);
      });
    }
  } catch (error) {
    console.error('❌ 사용자 피드 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

const handleReactionUpdate = ({ feedId, likeCount, hotCount, action, reactionType }) => {
  const newLikedSet = new Set(likedPosts.value);
  const newHotSet = new Set(hotPosts.value);

  if (reactionType === 'LIKE') {
    action === 'added' ? newLikedSet.add(feedId) : newLikedSet.delete(feedId);
  } else if (reactionType === 'HOT') {
    action === 'added' ? newHotSet.add(feedId) : newHotSet.delete(feedId);
  }

  likedPosts.value = newLikedSet;
  hotPosts.value = newHotSet;

  const feedIndex = feeds.value.findIndex(f => f.feedId === feedId);
  if (feedIndex !== -1) {
    feeds.value[feedIndex].likeCount = likeCount;
    feeds.value[feedIndex].hotCount = hotCount;
    feeds.value[feedIndex].userReactions = {
      hasLike: newLikedSet.has(feedId),
      hasHot: newHotSet.has(feedId)
    };
  }
};

const handleSave = (feedId) => {
  const newSet = new Set(savedPosts.value);
  newSet.has(feedId) ? newSet.delete(feedId) : newSet.add(feedId);
  savedPosts.value = newSet;
};

const handleComment = (feedId) => {
  router.push({ name: 'FeedDetail', params: { id: feedId }, hash: '#comments' });
};

const openPost = (feedId) => {
  router.push({ name: 'FeedDetail', params: { id: feedId } });
};

const handleBack = () => {
  router.back();
};

const handleFollow = async () => {
  try {
    isFollowing.value = !isFollowing.value;
    console.log('✅ 팔로우 상태 변경:', isFollowing.value);
  } catch (error) {
    console.error('❌ 팔로우 처리 실패:', error);
  }
};

// Lifecycle
let observer = null;

onMounted(async () => {
  console.log('✅ UserFeedListView 마운트');
  await loadUserInfo();
  await loadUserFeeds();

  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext.value && !loading.value) {
          loadUserFeeds();
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
  );

  setTimeout(() => {
    if (feedListRef.value?.observerTarget) {
      observer.observe(feedListRef.value.observerTarget);
    }
  }, 100);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #222222;
  --secondary: #64748B;
  --accent: #F97316;
  --bg: #FFFFFF;
  --card: #FFFFFF;
  --border: #E2E8F0;
  --hover: #F8FAFC;
  --shadow: rgba(0, 0, 0, 0.04);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  display: flex;
  max-width: 100vw;
}

/* 모바일: 작은 여백 */
.app-container {
  padding: 0 1rem;
}

/* 태블릿: 중간 여백 */
@media (min-width: 768px) {
  .app-container {
    padding: 0 2rem;
  }
}

/* 데스크톱: 큰 여백 */
@media (min-width: 1280px) {
  .app-container {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* 대형 화면: 더 큰 여백 */
@media (min-width: 1920px) {
  .app-container {
    padding: 0 4rem;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding-bottom: 5rem;
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
  }
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin: 1rem 0 0 0;
  background: transparent;
  border: none;
  color: var(--primary);
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--hover);
}

.back-btn .icon {
  width: 1.5rem;
  height: 1.5rem;
}

@media (min-width: 768px) {
  .back-btn {
    margin: 1.5rem 0 0 0;
  }
}

.feed-container {
  background: transparent;
  min-height: 25rem;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card);
  border-top: 1px solid var(--border);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem 0;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
  }
}

.bottom-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  min-width: 3.5rem;
}

.bottom-nav-item.active {
  color: var(--primary);
}

.bottom-nav-item .icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.bottom-nav-item span:not(.nav-badge) {
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
}

.nav-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.3125rem;
  background: #DC2626;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 0.5625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bottom-nav-fab {
  width: 3.5rem;
  height: 3.5rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0.5rem 1.25rem rgba(249, 115, 22, 0.4);
  margin-top: -1.75rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.bottom-nav-fab:active {
  transform: scale(0.95);
}

.bottom-nav-fab .icon {
  width: 1.75rem;
  height: 1.75rem;
  stroke-width: 2.5;
  flex-shrink: 0;
}

/* 고해상도 디스플레이 대응 */
@media (max-resolution: 1dppx) {
  .bottom-nav-item .icon {
    width: 1.375rem;
    height: 1.375rem;
  }

  .bottom-nav-fab {
    width: 3.25rem;
    height: 3.25rem;
  }
}

/* 터치 디바이스 대응 */
@media (hover: none) {
  .back-btn {
    min-height: 2.75rem;
    min-width: 2.75rem;
  }
}
</style>