<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 뒤로가기 버튼 + 헤더 -->
      <div class="page-header">
        <button class="back-btn" @click="$router.back()">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="page-title">{{ profileNickname }}</h1>
      </div>

      <!-- 탭 -->
      <div class="tab-section">
        <button
            class="tab"
            :class="{ active: activeTab === 'followers' }"
            @click="switchTab('followers')"
        >
          <span class="tab-count">{{ formatCount(followerCount) }}</span>
          <span class="tab-label">팔로워</span>
        </button>
        <button
            class="tab"
            :class="{ active: activeTab === 'followings' }"
            @click="switchTab('followings')"
        >
          <span class="tab-count">{{ formatCount(followingCount) }}</span>
          <span class="tab-label">팔로잉</span>
        </button>
        <div class="tab-indicator" :class="activeTab" />
      </div>

      <!-- 검색바 -->
      <div class="search-section">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
              v-model="searchQuery"
              type="text"
              placeholder="검색"
              class="search-input"
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <span class="result-count">{{ filteredList.length }}명</span>
      </div>

      <!-- 유저 리스트 -->
      <div class="list-section">
        <template v-if="filteredList.length > 0">
          <div class="user-grid">
            <div
                v-for="user in filteredList"
                :key="user.userId"
                class="user-card"
                @click="goToProfile(user.userId)"
            >
              <!-- 아바타 -->
              <img
                  v-if="user.profileImageUrl"
                  :src="user.profileImageUrl"
                  :alt="user.nickname"
                  class="avatar"
              />
              <div v-else class="avatar avatar-placeholder">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
              </div>

              <!-- 유저 정보 -->
              <div class="user-info">
                <span class="nickname">{{ user.nickname }}</span>
              </div>

              <!-- 팔로잉 탭에서만 버튼 표시 -->
              <button
                  v-if="activeTab === 'followings'"
                  class="follow-btn"
                  :class="{ active: followState[user.userId] }"
                  @click.stop="toggleFollow(user.userId)"
              >
                {{ followState[user.userId] ? '팔로잉' : '팔로우' }}
              </button>
            </div>
          </div>

          <!-- 로딩 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner" />
          </div>

          <!-- 무한 스크롤 트리거 -->
          <div ref="observerTarget" class="observer-target" />
        </template>

        <!-- 빈 상태 -->
        <div v-else-if="!loading" class="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p class="empty-title">
            {{ searchQuery ? '검색 결과가 없습니다' : (activeTab === 'followers' ? '팔로워가 없습니다' : '팔로잉이 없습니다') }}
          </p>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation - Mobile Only -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService, userUtils } from '@/services/UserService'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'

const route = useRoute()
const router = useRouter()

// State
const activeTab = ref('followers')
const searchQuery = ref('')
const loading = ref(false)

const profileNickname = ref('')
const followerCount = ref(0)
const followingCount = ref(0)

const followers = ref([])
const followings = ref([])
const followerCursor = ref(null)
const followingCursor = ref(null)
const followerHasNext = ref(true)
const followingHasNext = ref(true)

const followState = ref({})
const observerTarget = ref(null)
let observer = null

// Computed
const userId = computed(() => route.params.userId)

const currentList = computed(() =>
    activeTab.value === 'followers' ? followers.value : followings.value
)

const filteredList = computed(() => {
  if (!searchQuery.value) return currentList.value
  const query = searchQuery.value.toLowerCase()
  return currentList.value.filter(user =>
      user.nickname.toLowerCase().includes(query)
  )
})

// Methods
const formatCount = (num) => userUtils.formatFollowCount(num)

const loadProfile = async () => {
  try {
    const response = await userService.getUserProfile(userId.value)
    if (response.success && response.data) {
      profileNickname.value = response.data.nickname
      followerCount.value = response.data.followerCount
      followingCount.value = response.data.followingCount
    }
  } catch (error) {
    console.error('프로필 로드 실패:', error)
  }
}

const loadFollowers = async () => {
  if (loading.value || !followerHasNext.value) return
  try {
    loading.value = true
    const response = await userService.getFollowers(userId.value, {
      cursor: followerCursor.value,
      size: 20
    })
    if (response.success && response.data) {
      followers.value = [...followers.value, ...response.data.followers]
      followerCursor.value = response.data.nextCursor
      followerHasNext.value = response.data.hasNext
    }
  } catch (error) {
    console.error('팔로워 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

const loadFollowings = async () => {
  if (loading.value || !followingHasNext.value) return
  try {
    loading.value = true
    const response = await userService.getFollowings(userId.value, {
      cursor: followingCursor.value,
      size: 20
    })
    if (response.success && response.data) {
      followings.value = [...followings.value, ...response.data.followings]
      followingCursor.value = response.data.nextCursor
      followingHasNext.value = response.data.hasNext
      response.data.followings.forEach(user => {
        followState.value[user.userId] = true
      })
    }
  } catch (error) {
    console.error('팔로잉 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (activeTab.value === 'followers') {
    loadFollowers()
  } else {
    loadFollowings()
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  searchQuery.value = ''
  if (tab === 'followers' && followers.value.length === 0) {
    loadFollowers()
  } else if (tab === 'followings' && followings.value.length === 0) {
    loadFollowings()
  }
}

const toggleFollow = async (targetUserId) => {
  try {
    const response = await userService.toggleFollow(targetUserId)
    if (response.success && response.data) {
      followState.value[targetUserId] = response.data.isFollowing
    }
  } catch (error) {
    console.error('팔로우 토글 실패:', error)
  }
}

const goToProfile = (targetUserId) => {
  router.push({ name: 'UserFeed', params: { userId: targetUserId } })
}

// Watchers
watch(() => route.query.tab, (newTab) => {
  if (newTab && ['followers', 'followings'].includes(newTab)) {
    activeTab.value = newTab
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  await loadProfile()
  if (activeTab.value === 'followers') {
    await loadFollowers()
  } else {
    await loadFollowings()
  }

  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading.value) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
  )

  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #222222;
  --secondary: #64748B;
  --accent: #9333EA;
  --bg: #FFFFFF;
  --card: #FFFFFF;
  --border: #E2E8F0;
  --hover: #F8FAFC;
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
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100vw;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .app-container { padding: 0 2rem; }
}

@media (min-width: 1280px) {
  .app-container {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding-bottom: 5rem;
  padding-left: 1rem;
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
    padding-left: 2rem;
  }
}

@media (min-width: 1280px) {
  .main-content {
    padding-left: 3rem;
  }
}

/* 헤더 */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1.5rem 1rem 1rem 0;
}

@media (min-width: 768px) {
  .page-header {
    padding: 2rem 2rem 1.5rem 0;
  }
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: transparent;
  border: none;
  color: var(--primary);
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:hover { background: var(--hover); }
.back-btn .icon { width: 1.5rem; height: 1.5rem; }

.page-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary);
}

/* 탭 */
.tab-section {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid var(--border);
  position: relative;
  margin-bottom: 1.5rem;
  padding-right: 1rem;
}

@media (min-width: 768px) {
  .tab-section {
    padding-right: 2rem;
  }
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--secondary);
  transition: color 0.2s;
}

.tab.active { color: var(--primary); }
.tab-count { font-size: 15px; font-weight: 700; }
.tab-label { font-size: 14px; font-weight: 500; }

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--accent);
  transition: transform 0.3s ease, width 0.3s ease;
  width: 70px;
}

.tab-indicator.followings { transform: translateX(94px); }

/* 검색 */
.search-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 1.5rem;
  padding-right: 1rem;
}

@media (min-width: 768px) {
  .search-section {
    padding-right: 2rem;
  }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #F5F5F5;
  border-radius: 8px;
  flex: 1;
  max-width: 320px;
}

.search-box:focus-within {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.search-icon { color: var(--secondary); flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--primary);
  outline: none;
  font-family: inherit;
}

.search-input::placeholder { color: var(--secondary); }

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--secondary);
  padding: 0;
}

.result-count {
  font-size: 13px;
  color: var(--secondary);
  flex-shrink: 0;
}

/* 리스트 */
.list-section {
  min-height: 300px;
  padding-right: 1rem;
}

@media (min-width: 768px) {
  .list-section {
    padding-right: 2rem;
  }
}

.user-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

@media (min-width: 768px) {
  .user-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}

@media (min-width: 1280px) {
  .user-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1536px) {
  .user-grid { grid-template-columns: repeat(4, 1fr); }
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  border-color: #D1D5DB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #9333EA, #C084FC);
  color: white;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-btn {
  padding: 6px 14px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  font-family: inherit;
}

.follow-btn:hover { background: #7C22CB; }

.follow-btn.active {
  background: var(--hover);
  color: var(--primary);
  border: 1px solid var(--border);
}

.follow-btn.active:hover { background: #E5E7EB; }

/* 로딩 */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.observer-target { height: 1px; }

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 12px;
  color: var(--secondary);
}

.empty-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--primary);
  margin: 0;
}

</style>