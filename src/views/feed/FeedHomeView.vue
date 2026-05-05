<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <HotSection
          :limit="10"
          @feed-click="openPost"
          @see-all="handleSeeAllHot"
      />

      <div class="content-layout">
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
        >
          <template #after-header>
            <!-- 카테고리 필터 (최신 피드 제목 아래) -->
            <CommonCategoryFilter
                :categories="rootCategories"
                :initial-category-id="selectedCategoryId"
                content-type="FEED"
                @category-change="handleCategoryChange"
            />
          </template>
        </FeedList>

        <RightSidebar
            :popular-hashtags="popularHashtags"
            :trending-categories="trendingCategories"
            :recommended-users="recommendedUsers"
            @search-tag="handleSearchTag"
            @filter-category="handleFilterCategory"
            @follow-user="handleFollowUser"
        />
      </div>
    </main>

    <!-- Bottom Navigation - Mobile Only -->
    <BottomNavigation :unread-count="unreadMessages" />
  </div>
</template>

<script>
export default { name: 'FeedHomeView' }
</script>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoryCache } from '@/composables/useCategoryCache.js';
import { useFeed } from '@/services/FeedService.js';
import * as authUtils from '@/utils/auth.js';

import AppSidebar from '@/components/feed/AppSidebar.vue';
import CommonCategoryFilter from '@/components/category/CommonCategoryFilter.vue';
import HotSection from '@/components/feed/HotSection.vue';
import FeedList from '@/components/feed/FeedList.vue';
import RightSidebar from '@/components/feed/RightSidebar.vue';
import BottomNavigation from '@/components/common/BottomNavigation.vue';
import { useConfirmDialog } from '@/composables/useConfirmDialog';

const { open } = useConfirmDialog();

const router = useRouter();

const unreadMessages = ref(3);
const { allCategories: cachedCategories, loadAllCategories } = useCategoryCache();
const feedService = useFeed();

// State
const rootCategories = ref([]);
const feeds = ref([]);
const cursor = ref(null);
const hasNext = ref(true);
const loading = ref(false);
const likedPosts = ref(new Set());
const hotPosts = ref(new Set());
const savedPosts = ref(new Set());

// 사이드바 데이터
const popularHashtags = ref([]);

const trendingCategories = ref([
  {id: 1, name: '뷰티/코스메틱', emoji: '💄', description: '오늘 +128건', isHot: true},
  {id: 2, name: '패션/의류', emoji: '👕', description: '오늘 +95건', isHot: true},
  {id: 3, name: '식품/음료', emoji: '🍜', description: '오늘 +87건', isHot: false},
  {id: 4, name: '생활용품', emoji: '🏠', description: '오늘 +64건', isHot: false}
]);

const recommendedUsers = ref([
  {id: 1, name: '뷰티마니아', avatar: null, reviewCount: 234},
  {id: 2, name: '가성비헌터', avatar: null, reviewCount: 189},
  {id: 3, name: '일상리뷰어', avatar: null, reviewCount: 156}
]);

const getStoredViewMode = () => {
  try {
    return localStorage.getItem('feedViewMode') || 'feed';
  } catch (error) {
    return 'feed';
  }
};

const viewMode = ref(getStoredViewMode());
const feedListRef = ref(null);
const selectedCategoryId = ref(null);
const selectedCategoryDepth = ref(null);

watch(viewMode, (newMode) => {
  try {
    localStorage.setItem('feedViewMode', newMode);
  } catch (error) {
    console.error('localStorage 저장 실패:', error);
  }
});

// Methods
const loadCategories = async () => {
  try {
    // 피드 페이지는 type=FEED 카테고리만 로드
    const data = await loadAllCategories('FEED');
    rootCategories.value = data;
  } catch (error) {
    console.error('❌ 카테고리 로드 실패:', error);
  }
};

const loadPopularHashtags = async () => {
  try {
    const response = await feedService.getHotHashtags({}, { size: 10, sort: 'usageCount,DESC' });
    if (response.success && response.data) {
      const hashtags = response.data.content || response.data;
      popularHashtags.value = hashtags.map(tag => ({
        name: tag.name,
        count: tag.usageCount || 0
      }));
    }
  } catch (error) {
    console.error('❌ 인기 해시태그 로드 실패:', error);
  }
};

const loadFeeds = async () => {
  if (loading.value || !hasNext.value) return;

  try {
    loading.value = true;
    const searchCondition = {
      categoryId: selectedCategoryId.value,
      categoryDepth: selectedCategoryDepth.value,
      cursor: cursor.value,
      size: 20,
      isActive: true
    };

    console.log('[FeedHome] 피드 조회 조건:', {
      categoryId: selectedCategoryId.value,
      categoryDepth: selectedCategoryDepth.value
    });

    const response = await feedService.getFeedsWithCursor(searchCondition);

    if (response.success && response.data) {
      feeds.value = [...feeds.value, ...response.data.feeds];
      cursor.value = response.data.nextCursor;
      hasNext.value = response.data.hasNext;

      response.data.feeds.forEach(feed => {
        if (feed.userReactions?.hasLike) likedPosts.value.add(feed.feedId);
        if (feed.userReactions?.hasHot) hotPosts.value.add(feed.feedId);
      });
    } else {
      // API 실패 시 더 이상 호출하지 않도록 설정
      hasNext.value = false;
    }
  } catch (error) {
    console.error('❌ 피드 로드 실패:', error);
    // 에러 발생 시 무한 스크롤 중단
    hasNext.value = false;
  } finally {
    loading.value = false;
  }
};

const handleReactionUpdate = ({feedId, likeCount, hotCount, action, reactionType}) => {
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

const resetAndLoadFeeds = () => {
  feeds.value = [];
  cursor.value = null;
  hasNext.value = true;
  likedPosts.value.clear();
  hotPosts.value.clear();
  loadFeeds();
};

const handleCategoryChange = ({category, subCategory, categoryDepth}) => {
  console.log('[FeedHome] 카테고리 변경:', { category: category?.categoryName, subCategory: subCategory?.categoryName, categoryDepth });
  if (!category && !subCategory) {
    selectedCategoryId.value = null;
    selectedCategoryDepth.value = null;
  } else {
    const targetCategory = subCategory || category;
    selectedCategoryId.value = targetCategory?.categoryId;
    // categoryDepth 우선, 없으면 depth 필드, 그래도 없으면 subCategory면 2, 아니면 1
    selectedCategoryDepth.value = categoryDepth || targetCategory?.depth || targetCategory?.categoryDepth || (subCategory ? 2 : 1);
  }
  console.log('[FeedHome] 선택된 값:', { categoryId: selectedCategoryId.value, categoryDepth: selectedCategoryDepth.value });
  resetAndLoadFeeds();
};

const handleSave = (feedId) => {
  const newSet = new Set(savedPosts.value);
  newSet.has(feedId) ? newSet.delete(feedId) : newSet.add(feedId);
  savedPosts.value = newSet;
};

const handleComment = (feedId) => {
  router.push({name: 'FeedDetail', params: {id: feedId}, hash: '#comments'});
};

const openPost = (feedId) => {
  router.push({name: 'FeedDetail', params: {id: feedId}});
};

const handleSeeAllHot = () => {
  // 피드 리스트 섹션으로 스크롤
  const feedSection = document.querySelector('.content-layout')
  if (feedSection) {
    feedSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
};

// 사이드바 이벤트 핸들러
const handleSearchTag = (tagName) => {
  console.log('🔍 해시태그 검색:', tagName);
  // TODO: 해시태그 검색 페이지로 이동 또는 필터링
  router.push({name: 'Search', query: {tag: tagName}});
};

const handleFilterCategory = (categoryId) => {
  console.log('📂 카테고리 필터:', categoryId);
  selectedCategoryId.value = categoryId;
  resetAndLoadFeeds();
};

const handleFollowUser = (userId) => {
  console.log('👤 유저 팔로우:', userId);
  // TODO: 팔로우 API 호출
};

// Lifecycle
let observer = null;

onMounted(() => {
  loadCategories();
  loadFeeds();
  loadPopularHashtags();

  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext.value && !loading.value) {
          loadFeeds();
        }
      },
      {threshold: 0.5, rootMargin: '100px'}
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
  background: #ffffff;
  min-height: 100vh;
  color: #191F28;
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

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  /* BottomNavigation + iOS 홈 인디케이터 회피 */
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

.content-layout {
  display: flex;
  gap: 24px;
}

/* FeedList가 남은 공간을 차지하도록 */
.content-layout :deep(.feed-section) {
  flex: 1;
  min-width: 0;
}

/* 제목 바로 아래 들어가는 카테고리 필터 — 여백 살짝 */
.content-layout :deep(.feed-header) {
  margin-bottom: 12px;
}

.content-layout :deep(.filter-container) {
  padding: 0 0 12px;
  border-bottom: none;
}

.content-layout :deep(.category-tabs-wrapper) {
  padding: 4px 0 0;
}

@media (max-width: 767px) {
  .content-layout :deep(.feed-header) {
    margin-bottom: 10px;
  }
  .content-layout :deep(.filter-container) {
    padding: 0 0 10px;
  }
  .content-layout :deep(.category-tabs-wrapper) {
    padding: 2px 0 0;
  }
}
</style>