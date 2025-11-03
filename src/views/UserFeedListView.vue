<template>
  <div class="app-container">
    <!-- ⭐ FeedHomeView와 동일한 왼쪽 사이드바 사용 -->
    <AppSidebar />

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <!-- 사용자 프로필 헤더 -->
      <header class="user-profile-header">
        <button class="back-button" @click="handleBack">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="profile-section">
          <!-- 프로필 카드 -->
          <div class="profile-card">
            <div class="profile-avatar-large">
              <img v-if="userInfo.profileImageUrl" :src="userInfo.profileImageUrl" :alt="userInfo.nickname" />
              <span v-else class="avatar-placeholder">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
              </span>
              <div class="level-badge">
                <svg class="level-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Lv.{{ userInfo.level || 1 }}
              </div>
            </div>

            <div class="profile-info">
              <h1 class="profile-name">{{ userInfo.nickname || '사용자' }}</h1>
              <p v-if="userInfo.bio" class="profile-bio">{{ userInfo.bio }}</p>
              <div class="profile-meta">
                <span class="meta-item">
                  <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {{ userInfo.location || '위치 정보 없음' }}
                </span>
                <span class="meta-dot">·</span>
                <span class="meta-item">
                  <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ userInfo.joinDate || '2024.01' }} 가입
                </span>
              </div>
            </div>
          </div>

          <!-- 통계 & 팔로우 -->
          <div class="stats-section">
            <div class="stats-row">
              <div class="stat-box">
                <div class="stat-value">{{ userStats.feeds || 0 }}</div>
                <div class="stat-label">게시물</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">{{ formatNumber(userStats.followers) }}</div>
                <div class="stat-label">팔로워</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">{{ formatNumber(userStats.following) }}</div>
                <div class="stat-label">팔로잉</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">{{ formatNumber(userStats.totalLikes) }}</div>
                <div class="stat-label">총 좋아요</div>
              </div>
            </div>
            <button class="follow-button" @click="handleFollow">
              <svg v-if="!isFollowing" class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ isFollowing ? '팔로잉' : '팔로우' }}
            </button>
          </div>
        </div>

        <!-- 탭 메뉴 -->
        <nav class="tabs-menu">
          <button
              v-for="(menu, index) in menuItems"
              :key="index"
              :class="['tab-item', { active: activeMenu === menu.value }]"
              @click="activeMenu = menu.value"
          >
            {{ menu.label }}
          </button>
        </nav>
      </header>

      <!-- 피드 리스트 -->
      <section class="feed-section">
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
      </section>
    </main>

    <!-- ⭐ FeedHomeView와 동일한 오른쪽 사이드바 사용 -->
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

const router = useRouter();
const route = useRoute();
const feedService = useFeed();

// Props (userId를 route params에서 가져옴)
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
    // TODO: 실제 사용자 정보 API 호출
    // const response = await userService.getUserInfo(userId.value);
    // if (response.success) {
    //   userInfo.value = response.data.userInfo;
    //   userStats.value = response.data.stats;
    //   isFollowing.value = response.data.isFollowing;
    // }

    // 임시 데이터
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
  if (loading.value || !hasNext.value) {
    console.log('⏸️ 로딩 중단:', { loading: loading.value, hasNext: hasNext.value });
    return;
  }

  try {
    loading.value = true;

    const searchCondition = {
      creatorId: userId.value,
      cursor: cursor.value,
      size: 20,
      isActive: true
    };

    console.log('🔍 사용자 피드 로드 요청:', searchCondition);

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

      console.log('✅ 사용자 피드 로드 성공:', {
        총피드수: feeds.value.length,
        다음커서: cursor.value,
        다음페이지: hasNext.value
      });
    }
  } catch (error) {
    console.error('❌ 사용자 피드 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

const resetAndLoadFeeds = () => {
  console.log('🔄 피드 초기화');
  feeds.value = [];
  cursor.value = null;
  hasNext.value = true;
  likedPosts.value.clear();
  hotPosts.value.clear();
  loadUserFeeds();
};

const handleReactionUpdate = ({ feedId, likeCount, hotCount, action, reactionType }) => {
  console.log('🔄 리액션 업데이트:', { feedId, action, reactionType });

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
  router.push({ name: 'FeedDetail', params: { id: feedId }, hash: '#comments' });
};

const openPost = (feedId) => {
  console.log('📖 피드 상세 페이지로 이동:', feedId);
  router.push({ name: 'FeedDetail', params: { id: feedId } });
};

const handleBack = () => {
  router.back();
};

const handleFollow = async () => {
  try {
    // TODO: 팔로우/언팔로우 API 호출
    isFollowing.value = !isFollowing.value;
    console.log('✅ 팔로우 상태 변경:', isFollowing.value);
  } catch (error) {
    console.error('❌ 팔로우 처리 실패:', error);
  }
};

const formatNumber = (num) => {
  if (!num) return 0;
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num;
};

// Lifecycle
let observer = null;

onMounted(async () => {
  console.log('✅ UserFeedListView 마운트');
  console.log('👤 사용자 ID:', userId.value);

  await loadUserInfo();
  await loadUserFeeds();

  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext.value && !loading.value) {
          console.log('👁️ 스크롤 감지 - 다음 페이지 로드');
          loadUserFeeds();
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
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

/* 메인 컨텐츠 */
.main-content {
  margin-left: 0;
  margin-right: 0;
  min-height: 100vh;
  padding-bottom: 40px;
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

/* 사용자 프로필 헤더 */
.user-profile-header {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 30;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: transparent;
  border: none;
  color: var(--secondary);
  fontSize: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.back-button:hover {
  color: var(--primary);
}

.back-button .icon {
  width: 20px;
  height: 20px;
}

@media (min-width: 1024px) {
  .back-button {
    padding: 20px 32px;
  }
}

/* 프로필 섹션 */
.profile-section {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 768px) {
  .profile-section {
    flex-direction: row;
    align-items: flex-start;
    padding: 32px;
  }
}

.profile-card {
  display: flex;
  gap: 20px;
  flex: 1;
}

.profile-avatar-large {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.profile-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
}

.avatar-placeholder svg {
  width: 50px;
  height: 50px;
}

.level-badge {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  fontSize: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
  white-space: nowrap;
}

.level-icon {
  width: 14px;
  height: 14px;
}

.profile-info {
  flex: 1;
  padding-top: 8px;
}

.profile-name {
  fontSize: 24px;
  font-weight: 800;
  color: var(--primary);
  margin: 0 0 8px 0;
}

.profile-bio {
  fontSize: 14px;
  color: var(--secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  fontSize: 13px;
  color: var(--secondary);
}

.meta-icon {
  width: 16px;
  height: 16px;
}

.meta-dot {
  color: var(--border);
  font-weight: 700;
}

/* 통계 섹션 */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .stats-section {
    min-width: 300px;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: var(--bg);
  padding: 16px;
  border-radius: 16px;
}

.stat-box {
  text-align: center;
}

.stat-value {
  fontSize: 20px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 4px;
}

.stat-label {
  fontSize: 11px;
  color: var(--secondary);
  font-weight: 600;
}

.follow-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  fontSize: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.follow-button:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.follow-button:active {
  transform: translateY(0);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* 탭 메뉴 */
.tabs-menu {
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
  border-bottom: 1px solid var(--border);
}

@media (min-width: 1024px) {
  .tabs-menu {
    padding: 0 32px 16px;
  }
}

.tab-item {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 12px;
  fontSize: 14px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.tab-item:hover {
  background: var(--hover);
  color: var(--primary);
}

.tab-item.active {
  background: var(--primary);
  color: white;
}

/* 피드 섹션 */
.feed-section {
  padding: 32px 20px;
}

@media (min-width: 1024px) {
  .feed-section {
    padding: 40px 32px;
  }
}
</style>