<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">


      <!-- 카테고리 필터 - ⭐ show-all-button 제거, initial-selected 추가 -->
      <CommonCategoryFilter
          :categories="rootCategories"
          :initial-selected="selectedCategoryId"
          @category-change="handleCategoryChange"
      />

      <HotSection
          :limit="5"
          @feed-click="openPost"
          @see-all="handleSeeAllHot"
      />

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
    <BottomNavigation :unread-count="unreadMessages" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCategory } from '@/services/CategoryService.js';
import { useFeed } from '@/services/FeedService.js';
import * as authUtils from '@/utils/auth.js';

import AppSidebar from '@/components/feed/AppSidebar.vue';
import CommonCategoryFilter from '@/components/category/CommonCategoryFilter.vue';
import HotSection from '@/components/feed/HotSection.vue';
import FeedList from '@/components/feed/FeedList.vue';
import BottomNavigation from '@/components/common/BottomNavigation.vue';

const router = useRouter();

// 읽지 않은 메시지 수 (추후 실제 데이터로 연동)
const unreadMessages = ref(3);
const categoryService = useCategory();
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
const feedListRef = ref(null);
const selectedCategoryId = ref(null); // ⭐ 초기값 null = 전체

// viewMode 변경 감지 및 저장
watch(viewMode, (newMode) => {
  try {
    localStorage.setItem('feedViewMode', newMode);
    console.log('💾 뷰 모드 저장:', newMode);
  } catch (error) {
    console.error('localStorage 저장 실패:', error);
  }
});

// Methods
const loadCategories = async () => {
  try {
    const response = await categoryService.getCategories({isActive: true});
    if (response.success && response.data) {
      rootCategories.value = response.data;
      console.log('✅ 카테고리 로드 성공:', rootCategories.value);
    }
  } catch (error) {
    console.error('❌ 카테고리 로드 실패:', error);
  }
};

const loadFeeds = async () => {
  if (loading.value || !hasNext.value) {
    console.log('⏸️ 로딩 중단:', {loading: loading.value, hasNext: hasNext.value});
    return;
  }

  try {
    loading.value = true;

    const searchCondition = {
      categoryId: selectedCategoryId.value, // null이면 전체 조회
      cursor: cursor.value,
      size: 20,
      isActive: true
    };

    console.log('🔍 피드 로드 요청:', searchCondition);

    const response = await feedService.getFeedsWithCursor(searchCondition);

    console.log('📦 피드 응답:', response);

    if (response.success && response.data) {
      feeds.value = [...feeds.value, ...response.data.feeds];
      cursor.value = response.data.nextCursor;
      hasNext.value = response.data.hasNext;

      response.data.feeds.forEach(feed => {
        if (feed.userReactions?.hasLike) {
          likedPosts.value.add(feed.feedId);
        }
        if (feed.userReactions?.hasHot) {
          hotPosts.value.add(feed.feedId);
        }
      });

      console.log('✅ 피드 로드 성공:', {
        총피드수: feeds.value.length,
        다음커서: cursor.value,
        다음페이지: hasNext.value
      });
    }
  } catch (error) {
    console.error('❌ 피드 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

const handleReactionUpdate = ({feedId, likeCount, hotCount, action, reactionType}) => {
  console.log('🔄 리액션 업데이트:', {feedId, action, reactionType});

  const newLikedSet = new Set(likedPosts.value);
  const newHotSet = new Set(hotPosts.value);

  if (reactionType === 'LIKE') {
    if (action === 'added') {
      newLikedSet.add(feedId);
    } else if (action === 'removed') {
      newLikedSet.delete(feedId);
    }
  } else if (reactionType === 'HOT') {
    if (action === 'added') {
      newHotSet.add(feedId);
    } else if (action === 'removed') {
      newHotSet.delete(feedId);
    }
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
  console.log('🔄 피드 초기화');
  feeds.value = [];
  cursor.value = null;
  hasNext.value = true;
  likedPosts.value.clear();
  hotPosts.value.clear();
  loadFeeds();
};

// ⭐ handleCategoryChange 수정 - 전체 선택 처리
const handleCategoryChange = ({category, subCategory}) => {
  // 전체 선택 시 null
  if (!category && !subCategory) {
    selectedCategoryId.value = null;
  } else {
    selectedCategoryId.value = subCategory?.categoryId || category?.categoryId;
  }

  console.log('📌 카테고리 변경:', selectedCategoryId.value || '전체');
  resetAndLoadFeeds();
};

const handleSave = (feedId) => {
  const newSet = new Set(savedPosts.value);
  if (newSet.has(feedId)) {
    newSet.delete(feedId);
  } else {
    newSet.add(feedId);
  }
  savedPosts.value = newSet;
};

const handleComment = (feedId) => {
  console.log('💬 댓글:', feedId);
  router.push({name: 'FeedDetail', params: {id: feedId}, hash: '#comments'});
};

const openPost = (feedId) => {
  console.log('📖 피드 상세 페이지로 이동:', feedId);
  router.push({name: 'FeedDetail', params: {id: feedId}});
};

const handleSeeAllHot = () => {
  console.log('🔥 핫 피드 전체보기');
  alert('핫 피드 전체보기 페이지는 준비중입니다.');
};

// Lifecycle
let observer = null;

onMounted(() => {
  console.log('✅ FeedHomeView 마운트');
  console.log('📋 저장된 뷰 모드:', viewMode.value);

  // 🔍 디버그: 토큰 상태 확인
  const token = authUtils.getAccessToken();
  console.log('🔐 [FeedHome] 현재 토큰 상태:', {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 50) + '...' : 'null',
    userInfo: authUtils.getUserInfo()
  });

  loadCategories();
  loadFeeds();

  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext.value && !loading.value) {
          console.log('👁️ 스크롤 감지 - 다음 페이지 로드');
          loadFeeds();
        }
      },
      {
        threshold: 0.5,
        rootMargin: '100px'
      }
  );

  setTimeout(() => {
    if (feedListRef.value?.observerTarget) {
      observer.observe(feedListRef.value.observerTarget);
      console.log('✅ Intersection Observer 연결');
    }
  }, 100);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    console.log('🔌 Intersection Observer 해제');
  }
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

/* 모바일: 여백 없음 (인스타그램 스타일) */
.app-container {
  padding: 0;
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

</style>