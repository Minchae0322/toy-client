<template>
  <section class="profile-section">
    <!-- 로딩 중 스켈레톤 -->
    <div v-if="!isProfileLoaded" class="profile-container">
      <!-- 모바일 스켈레톤 -->
      <div class="mobile-layout">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text skeleton-name"></div>
        <div class="skeleton-text skeleton-btn"></div>
        <div class="skeleton-stats">
          <div class="skeleton-text skeleton-stat"></div>
          <div class="skeleton-text skeleton-stat"></div>
        </div>
        <div class="skeleton-text skeleton-bio"></div>
      </div>
      <!-- PC 스켈레톤 -->
      <div class="desktop-layout">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-text skeleton-name"></div>
          <div class="skeleton-stats">
            <div class="skeleton-text skeleton-stat"></div>
            <div class="skeleton-text skeleton-stat"></div>
          </div>
          <div class="skeleton-text skeleton-bio"></div>
        </div>
      </div>
    </div>

    <!-- 로드 완료 후 실제 컨텐츠 -->
    <div v-else class="profile-container">
      <!-- 모바일 레이아웃: 세로 중앙 정렬 -->
      <div class="mobile-layout">
        <div class="avatar-wrapper">
          <img
              v-if="profileData.profilePicture?.fileUrl"
              :src="profileData.profilePicture.fileUrl"
              :alt="profileData.nickname"
              class="avatar"
          />
          <div v-else class="avatar avatar-placeholder">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
          </div>
        </div>

        <h1 class="username">{{ profileData.nickname || '사용자' }}</h1>

        <button
            v-if="!isOwnProfile"
            class="follow-btn"
            :class="{ active: profileData.isFollowing }"
            @click="handleFollow"
            :disabled="isFollowLoading"
        >
          {{ profileData.isFollowing ? '팔로잉' : '팔로우' }}
        </button>

        <div class="stats-bar">
          <button class="stat" @click="goToFollowList('followers')">
            <span class="stat-value">{{ formatNumber(profileData.followerCount) }}</span>
            <span class="stat-label">팔로워</span>
          </button>
          <button class="stat" @click="goToFollowList('followings')">
            <span class="stat-value">{{ formatNumber(profileData.followingCount) }}</span>
            <span class="stat-label">팔로잉</span>
          </button>
        </div>

        <p v-if="profileData.description" class="bio">{{ profileData.description }}</p>

        <div class="meta-info">
          <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>{{ formatJoinDate(profileData.createdAt) }}</span>
        </div>
      </div>

      <!-- PC/태블릿 레이아웃: 가로 왼쪽 정렬 -->
      <div class="desktop-layout">
        <div class="avatar-wrapper">
          <img
              v-if="profileData.profilePicture?.fileUrl"
              :src="profileData.profilePicture.fileUrl"
              :alt="profileData.nickname"
              class="avatar"
          />
          <div v-else class="avatar avatar-placeholder">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
          </div>
        </div>

        <div class="profile-info">
          <div class="profile-header">
            <h1 class="username">{{ profileData.nickname || '사용자' }}</h1>
            <button
                v-if="!isOwnProfile"
                class="follow-btn"
                :class="{ active: profileData.isFollowing }"
                @click="handleFollow"
                :disabled="isFollowLoading"
            >
              {{ profileData.isFollowing ? '팔로잉' : '팔로우' }}
            </button>
          </div>

          <div class="stats-bar">
            <button class="stat" @click="goToFollowList('followers')">
              <span class="stat-value">{{ formatNumber(profileData.followerCount) }}</span>
              <span class="stat-label">팔로워</span>
            </button>
            <button class="stat" @click="goToFollowList('followings')">
              <span class="stat-value">{{ formatNumber(profileData.followingCount) }}</span>
              <span class="stat-label">팔로잉</span>
            </button>
          </div>

          <p v-if="profileData.description" class="bio">{{ profileData.description }}</p>

          <div class="meta-info">
            <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>{{ formatJoinDate(profileData.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="divider" />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService, userUtils } from '@/services/UserService'
import { useAuth } from '@/composables/useAuth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, userId } = useAuth()
const { open, openLoginRequired } = useConfirmDialog()

const profileData = ref({
  userId: null,
  nickname: '',
  description: '',
  followerCount: 0,
  followingCount: 0,
  isFollowing: false,
  profilePicture: null,
  createdAt: null,
  updatedAt: null
})

const isFollowLoading = ref(false)
const isProfileLoaded = ref(false)

const isOwnProfile = computed(() => {
  if (!profileData.value.userId) return true
  return isLoggedIn.value && String(userId.value) === String(profileData.value.userId)
})

const loadProfile = async () => {
  try {
    const targetUserId = route.params.userId || userId.value
    if (!targetUserId) {
      console.error('사용자 ID를 찾을 수 없습니다.')
      return
    }
    const response = await userService.getUserProfile(targetUserId)
    if (response.success && response.data) {
      profileData.value = response.data
    }
  } catch (error) {
    console.error('프로필 로드 실패:', error)
  } finally {
    isProfileLoaded.value = true
  }
}

const goToFollowList = (tab) => {
  const targetUserId = route.params.userId || userId.value
  router.push({
    name: 'FollowList',
    params: { userId: targetUserId },
    query: { tab }
  })
}

const handleFollow = async () => {
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')
    if (confirmed) {
      await router.push({ name: 'Login', query: { redirect: route.fullPath } })
    }
    return
  }
  if (isFollowLoading.value) return

  try {
    isFollowLoading.value = true
    const response = await userService.toggleFollow(profileData.value.userId)
    if (response.success && response.data) {
      profileData.value.isFollowing = response.data.isFollowing
      profileData.value.followerCount += response.data.isFollowing ? 1 : -1
    }
  } catch (error) {
    console.error('팔로우 토글 실패:', error)
    await open({ type: 'alert', title: '오류', message: '팔로우 처리 중 오류가 발생했습니다.' })
  } finally {
    isFollowLoading.value = false
  }
}

const formatNumber = (num) => userUtils.formatFollowCount(num)

const formatJoinDate = (dateString) => {
  if (!dateString) return '가입일 미상'
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')} 가입`
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-section {
  background: #ffffff;
}

.profile-container {
  padding: 24px 20px;
}

@media (min-width: 768px) {
  .profile-container {
    padding: 32px;
  }
}

/* 모바일 레이아웃: 세로 중앙 정렬 */
.mobile-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

@media (min-width: 768px) {
  .mobile-layout {
    display: none;
  }
}

/* PC/태블릿 레이아웃: 가로 배치 */
.desktop-layout {
  display: none;
}

@media (min-width: 768px) {
  .desktop-layout {
    display: flex;
    align-items: flex-start;
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .desktop-layout {
    gap: 32px;
  }
}

/* 아바타 */
.avatar-wrapper {
  flex-shrink: 0;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .avatar-wrapper {
    margin-bottom: 0;
  }
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1);
}

@media (min-width: 768px) {
  .avatar {
    width: 96px;
    height: 96px;
  }
}

@media (min-width: 1024px) {
  .avatar {
    width: 112px;
    height: 112px;
  }
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.avatar-placeholder svg {
  width: 36px;
  height: 36px;
  color: #d1d5db;
}

@media (min-width: 768px) {
  .avatar-placeholder svg {
    width: 44px;
    height: 44px;
  }
}

@media (min-width: 1024px) {
  .avatar-placeholder svg {
    width: 52px;
    height: 52px;
  }
}

/* 프로필 정보 (PC) */
.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

@media (min-width: 1024px) {
  .profile-header {
    gap: 20px;
    margin-bottom: 16px;
  }
}

/* 닉네임 */
.username {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

@media (min-width: 768px) {
  .username {
    font-size: 20px;
    margin: 0;
  }
}

@media (min-width: 1024px) {
  .username {
    font-size: 22px;
  }
}

/* 팔로우 버튼 */
.follow-btn {
  padding: 8px 24px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: #9333EA;
  color: #ffffff;
  white-space: nowrap;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .follow-btn {
    padding: 6px 20px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 0;
  }
}

.follow-btn:hover:not(:disabled) {
  background: #7c3aed;
}

.follow-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.follow-btn.active {
  background: #f3f4f6;
  color: #374151;
}

.follow-btn.active:hover:not(:disabled) {
  background: #e5e7eb;
}

/* 통계 */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .stats-bar {
    gap: 24px;
    margin-bottom: 12px;
  }
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

@media (min-width: 768px) {
  .stat {
    flex-direction: row;
    gap: 6px;
  }
}

.stat:hover {
  background: #f9fafb;
}

.stat:hover .stat-value,
.stat:hover .stat-label {
  color: #9333EA;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  transition: color 0.2s;
}

@media (min-width: 768px) {
  .stat-value {
    font-size: 15px;
    font-weight: 600;
  }
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  transition: color 0.2s;
}

@media (min-width: 768px) {
  .stat-label {
    font-size: 14px;
  }
}

/* 자기소개 */
.bio {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 12px 0;
  word-break: break-word;
  padding: 0 8px;
}

@media (min-width: 768px) {
  .bio {
    font-size: 14px;
    padding: 0;
    margin: 0 0 8px 0;
    max-width: 400px;
  }
}

/* 메타 정보 */
.meta-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
}

@media (min-width: 768px) {
  .meta-info {
    font-size: 13px;
  }
}

.meta-icon {
  width: 14px;
  height: 14px;
}

@media (min-width: 768px) {
  .meta-icon {
    width: 14px;
    height: 14px;
  }
}

/* 구분선 */
.divider {
  border-top: 1px solid #f3f4f6;
}

/* 스켈레톤 로딩 */
.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .skeleton-avatar {
    width: 96px;
    height: 96px;
    margin-bottom: 0;
    flex-shrink: 0;
  }
}

@media (min-width: 1024px) {
  .skeleton-avatar {
    width: 112px;
    height: 112px;
  }
}

.skeleton-info {
  flex: 1;
}

.skeleton-text {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-name {
  width: 120px;
  height: 24px;
  margin-bottom: 12px;
}

.mobile-layout .skeleton-name {
  margin-left: auto;
  margin-right: auto;
}

.skeleton-btn {
  width: 80px;
  height: 36px;
  border-radius: 9999px;
  margin-bottom: 16px;
}

.skeleton-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
}

.mobile-layout .skeleton-stats {
  justify-content: center;
}

@media (min-width: 768px) {
  .skeleton-stats {
    gap: 24px;
    margin-bottom: 12px;
  }
}

.skeleton-stat {
  width: 60px;
  height: 18px;
}

.skeleton-bio {
  width: 200px;
  height: 16px;
}

.mobile-layout .skeleton-bio {
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 768px) {
  .skeleton-bio {
    width: 280px;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>