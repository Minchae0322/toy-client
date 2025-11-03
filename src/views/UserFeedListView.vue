<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <div class="content-wrapper">
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
      </div>
    </main>

    <RightSidebar />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFeed } from '@/services/FeedService';
import AppSidebar from '@/components/feed/AppSidebar.vue';
import RightSidebar from '@/components/feed/RightSidebar.vue';
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  background: #FAFAFA;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', sans-serif;
}

.main-content {
  margin-left: 0;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: 280px;
  }
}

@media (min-width: 1280px) {
  .main-content {
    margin-right: 380px;
  }
}

.content-wrapper {
  max-width: 935px;
  margin: 0 auto;
  padding: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 16px 0 0 16px;
  background: transparent;
  border: none;
  color: #262626;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #F5F5F5;
}

.back-btn .icon {
  width: 24px;
  height: 24px;
}

@media (min-width: 768px) {
  .back-btn {
    margin: 24px 0 0 24px;
  }
}

.feed-container {
  background: white;
  min-height: 400px;
}

@media (hover: none) {
  .back-btn {
    min-height: 44px;
  }
}
</style>