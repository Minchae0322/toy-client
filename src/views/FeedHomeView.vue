<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <AppHeader />

      <CategoryFilter
          :categories="rootCategories"
          v-model:viewMode="viewMode"
          @category-change="handleCategoryChange"
      />

      <HotSection
          :hot-posts="mockHotPosts"
          @post-click="openPost"
      />

      <FeedList
          ref="feedListRef"
          :feeds="feeds"
          :loading="loading"
          :has-next="hasNext"
          :view-mode="viewMode"
          :liked-posts="likedPosts"
          :saved-posts="savedPosts"
          @like="handleLike"
          @save="handleSave"
          @comment="handleComment"
          @post-click="openPost"
      />
    </main>

    <RightSidebar />

    <!-- Bottom Navigation - Mobile Only -->
    <nav class="bottom-nav">
      <button class="bottom-nav-item active">
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
      <button class="bottom-nav-fab" @click="handleCreateFeed">
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
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
        </svg>
        <span>MY</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCategory } from '@/services/CategoryService';
import { useFeed } from '@/services/FeedService';

import AppSidebar from '@/components/feed/AppSidebar.vue';
import AppHeader from '@/components/feed/AppHeader.vue';
import RightSidebar from '@/components/feed/RightSidebar.vue';
import CategoryFilter from '@/components/feed/CategoryFilter.vue';
import HotSection from '@/components/feed/HotSection.vue';
import FeedList from '@/components/feed/FeedList.vue';

const router = useRouter();
const categoryService = useCategory();
const feedService = useFeed();

// State
const rootCategories = ref([]);
const feeds = ref([]);
const cursor = ref(null);
const hasNext = ref(true);
const loading = ref(false);
const likedPosts = ref(new Set());
const savedPosts = ref(new Set());
const viewMode = ref('feed');
const feedListRef = ref(null);
const selectedCategoryId = ref(null);

// Mock Data
const mockHotPosts = [
  {
    id: 1,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    product: '조던 4 레트로 브레드',
    author: { name: 'sneaker_king' },
    reactions: { fire: 234, views: 1200 }
  },
  {
    id: 2,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    product: '에어팟 맥스',
    author: { name: 'tech_guru' },
    reactions: { fire: 189, views: 890 }
  },
  {
    id: 3,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800'],
    product: '디올 립글로우',
    author: { name: 'beauty_queen' },
    reactions: { fire: 156, views: 670 }
  },
  {
    id: 4,
    images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'],
    product: '아미 로고 후드티',
    author: { name: 'fashion_icon' },
    reactions: { fire: 142, views: 520 }
  },
  {
    id: 5,
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'],
    product: '블루보틀 커피 원두',
    author: { name: 'coffee_lover' },
    reactions: { fire: 98, views: 450 }
  }
];

// Methods
const loadCategories = async () => {
  try {
    const response = await categoryService.getCategories({ isActive: true });
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
    console.log('⏸️ 로딩 중단:', { loading: loading.value, hasNext: hasNext.value });
    return;
  }

  try {
    loading.value = true;

    const searchCondition = {
      categoryId: selectedCategoryId.value,
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

const resetAndLoadFeeds = () => {
  console.log('🔄 피드 초기화');
  feeds.value = [];
  cursor.value = null;
  hasNext.value = true;
  loadFeeds();
};

const handleCategoryChange = ({ category, subCategory }) => {
  selectedCategoryId.value = subCategory?.categoryId || category?.categoryId;
  console.log('📌 카테고리 변경:', selectedCategoryId.value);
  resetAndLoadFeeds();
};

const handleLike = (feedId) => {
  const newSet = new Set(likedPosts.value);
  if (newSet.has(feedId)) {
    newSet.delete(feedId);
  } else {
    newSet.add(feedId);
  }
  likedPosts.value = newSet;
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
  console.log('댓글:', feedId);
  // 나중에 댓글 모달 구현 시 사용
};

const openPost = (feedId) => {
  console.log('📖 피드 상세 페이지로 이동:', feedId);
  router.push({ name: 'FeedDetail', params: { id: feedId } });
};

const handleCreateFeed = () => {
  console.log('✍️ 피드 작성 페이지로 이동');
  router.push({ name: 'FeedCreate' });
};

// Lifecycle
let observer = null;

onMounted(() => {
  console.log('✅ FeedHomeView 마운트');

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
  --primary: #0F172A;
  --secondary: #64748B;
  --accent: #F97316;
  --border: #E2E8F0;
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --hover: #F1F5F9;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
}

.main-content {
  margin-left: 0;
  margin-right: 0;
  min-height: 100vh;
  padding-bottom: 80px;
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: 280px;
    padding-bottom: 40px;
  }
}

@media (min-width: 1280px) {
  .main-content {
    margin-right: 380px;
  }
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
  padding: 8px 0;
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
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.bottom-nav-item.active {
  color: var(--primary);
}

.bottom-nav-item .icon {
  width: 24px;
  height: 24px;
}

.bottom-nav-item span {
  font-size: 11px;
  font-weight: 600;
}

.nav-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #DC2626;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-nav-fab {
  width: 56px;
  height: 56px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
  margin-top: -28px;
  transition: all 0.2s;
}

.bottom-nav-fab:active {
  transform: scale(0.95);
}

.bottom-nav-fab .icon {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}
</style>