<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 프로필 헤더 컴포넌트 (자체 로드) -->
      <UserProfileHeader />

      <!-- 탭 네비게이션 컴포넌트 -->
      <UserTabNavigation
          v-model="activeMenu"
          :menu-items="menuItems"
          class="tab-nav"
      />

      <!-- 피드 리스트 -->
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
    </main>

    <!-- Bottom Navigation - Mobile Only -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFeed } from '@/services/FeedService';
import AppSidebar from '@/components/feed/AppSidebar.vue';
import FeedList from '@/components/feed/FeedList.vue';
import UserProfileHeader from '@/components/userFeed/UserProfileHeader.vue';
import UserTabNavigation from '@/components/userFeed/UserTabNavigation.vue';
import BottomNavigation from '@/components/common/BottomNavigation.vue';

const router = useRouter();
const route = useRoute();
const feedService = useFeed();

const userId = computed(() => route.params.userId);

// State
const feeds = ref([]);
const cursor = ref(null);
const hasNext = ref(true);
const loading = ref(false);
const likedPosts = ref(new Set());
const hotPosts = ref(new Set());
const savedPosts = ref(new Set());

// localStorage에서 뷰 모드 불러오기
const getStoredViewMode = () => {
  try {
    return localStorage.getItem('feedViewMode') || 'feed';
  } catch (error) {
    console.error('localStorage 읽기 실패:', error);
    return 'feed';
  }
};

const viewMode = ref(getStoredViewMode());
const activeMenu = ref('feeds');

const menuItems = [
  { label: '게시물', value: 'feeds' },
  { label: '좋아요', value: 'liked' },
  { label: '저장', value: 'saved' }
];

const feedListRef = ref(null);

// viewMode 변경 감지 및 저장
watch(viewMode, (newMode) => {
  try {
    localStorage.setItem('feedViewMode', newMode);
  } catch (error) {
    console.error('localStorage 저장 실패:', error);
  }
});

// Methods
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

// Lifecycle
let observer = null;

onMounted(async () => {
  console.log('✅ UserFeedListView 마운트');
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
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .app-container {
    padding: 0 2rem;
  }
}

@media (min-width: 1280px) {
  .app-container {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 1920px) {
  .app-container {
    padding: 0 4rem;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding-top: 1rem;
  padding-bottom: 5rem;
  padding-left: 1.5rem;
}

@media (max-width: 767px) {
  .main-content {
    padding-left: 0;
  }
}

@media (min-width: 768px) {
  .main-content {
    padding-top: 1.5rem;
    padding-bottom: 2.5rem;
  }
}

.tab-nav {
  margin-bottom: 0.5rem;
}

</style>