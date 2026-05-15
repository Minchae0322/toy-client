<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <div class="profile-shell">
        <!-- 프로필 헤더 컴포넌트 (자체 로드) -->
        <UserProfileHeader />

        <!-- 탭 네비게이션 컴포넌트 (sticky underline) -->
        <UserTabNavigation
            v-model="activeMenu"
            :menu-items="menuItems"
            class="tab-nav"
        />

        <!-- 피드 리스트 -->
        <section class="feed-shell">
          <FeedList
              ref="feedListRef"
              :feeds="feeds"
              :loading="loading"
              :has-next="hasNext"
              :view-mode="viewMode"
              :liked-posts="likedPosts"
              :hot-posts="hotPosts"
              :saved-posts="savedPosts"
              hide-title
              @update="handleReactionUpdate"
              @save="handleSave"
              @comment="handleComment"
              @post-click="openPost"
              @view-mode-change="viewMode = $event"
          />
        </section>
      </div>
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
const feedIdSet = new Set();

// 유저 전환(같은 라우트 이름, 다른 userId) 시 전체 state 리셋
const resetFeedState = () => {
  feeds.value = [];
  cursor.value = null;
  hasNext.value = true;
  loading.value = false;
  likedPosts.value = new Set();
  hotPosts.value = new Set();
  savedPosts.value = new Set();
  feedIdSet.clear();
};

watch(userId, (newId, oldId) => {
  if (newId === oldId) return;
  resetFeedState();
  if (newId) loadUserFeeds();
});

const loadUserFeeds = async () => {
  // 방어 — userId 없으면 즉시 중단 (전체 피드 폭주 방지)
  if (!userId.value) { hasNext.value = false; return; }
  if (loading.value || !hasNext.value) return;

  try {
    loading.value = true;

    const prevCursor = cursor.value;

    const searchCondition = {
      creatorId: userId.value,
      cursor: cursor.value,
      size: 20,
      isActive: true
    };

    const response = await feedService.getFeedsWithCursor(searchCondition);

    // 응답 스키마 방어
    if (!response?.success || !response.data || !Array.isArray(response.data.feeds)) {
      hasNext.value = false;
      return;
    }

    // 동일 cursor 반복 반환 방어 (무한 루프)
    if (response.data.nextCursor != null && response.data.nextCursor === prevCursor) {
      hasNext.value = false;
      return;
    }

    // feedId 중복 제거
    const newFeeds = response.data.feeds.filter(f => {
      if (!f || f.feedId == null || feedIdSet.has(f.feedId)) return false;
      feedIdSet.add(f.feedId);
      return true;
    });

    // 서버는 다음 있다는데 신규 0개 → 루프 의심, 중단
    if (newFeeds.length === 0 && response.data.hasNext) {
      hasNext.value = false;
      return;
    }

    feeds.value = [...feeds.value, ...newFeeds];
    cursor.value = response.data.nextCursor;
    hasNext.value = !!response.data.hasNext;

    newFeeds.forEach(feed => {
      if (feed.userReactions?.hasLike) likedPosts.value.add(feed.feedId);
      if (feed.userReactions?.hasHot) hotPosts.value.add(feed.feedId);
    });
  } catch (error) {
    console.error('❌ 사용자 피드 로드 실패:', error);
    hasNext.value = false;
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
let unmounted = false;
let observedEl = null;

const attachObserver = (el) => {
  if (!observer || !el || unmounted) return;
  if (observedEl === el) return;
  if (observedEl) observer.unobserve(observedEl);
  observer.observe(el);
  observedEl = el;
};

onMounted(async () => {
  await loadUserFeeds();
  if (unmounted) return;

  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext.value && !loading.value) {
          loadUserFeeds();
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
  );

  // viewMode 전환으로 observerTarget DOM이 바뀌면 재관찰
  watch(
      () => feedListRef.value?.observerTarget,
      (el) => attachObserver(el),
      { flush: 'post' }
  );

  // 초기 부착 (마운트 직후 ref가 바인딩되어 있지 않을 수 있어 nextTick 대신 microtask)
  Promise.resolve().then(() => attachObserver(feedListRef.value?.observerTarget));
});

onUnmounted(() => {
  unmounted = true;
  if (observer) observer.disconnect();
  observedEl = null;
  feedIdSet.clear();
});
</script>

<style scoped>
.app-container {
  background: var(--bg-base);
  min-height: 100vh;
  color: var(--text-primary);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100%;
  overflow-x: clip;
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

/* ============ 메인 컬럼 ============ */
.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  /* BottomNavigation + iOS 홈 인디케이터 */
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  padding-left: 1.5rem;
}

@media (max-width: 767px) {
  .main-content {
    padding-left: 0;
  }
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
  }
}

/* ============ 프로필 쉘: FeedHomeView와 동일하게 가로 제약 없음 ============ */
.profile-shell {
  width: 100%;
  padding-top: 4px;
}

@media (min-width: 768px) {
  .profile-shell {
    padding-top: 16px;
  }
}

/* ============ 탭 네비게이션 ============
   프로필 하단 divider가 바로 위에 있으므로 탭은 자체 top border 없이
   sticky 시 bottom border(`var(--border-default)`)만 유지 */
.tab-nav { }

/* ============ 피드 영역 ============
   인스타 프로필처럼 탭과 피드 사이는 최소 여백 */
.feed-shell {
  padding-top: 12px;
}

@media (min-width: 768px) {
  .feed-shell {
    padding-top: 20px;
  }
}

/* 프로필 피드 그리드 — 데스크톱 2열, 모바일 1열 */
.feed-shell :deep(.modern-grid) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

@media (min-width: 1280px) {
  .feed-shell :deep(.modern-grid) {
    gap: 24px;
  }
}

@media (max-width: 767px) {
  .feed-shell :deep(.modern-grid) {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

/* FeedList 헤더(뷰 스위처) 우측 정렬 다듬기 */
.feed-shell :deep(.feed-header) {
  padding: 0 0 12px;
  border-bottom: 0;
}

@media (min-width: 768px) {
  .feed-shell :deep(.feed-header) {
    padding: 0 0 16px;
  }
}
</style>
