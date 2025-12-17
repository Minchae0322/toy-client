<template>
  <section class="profile-section">
    <div class="profile-container">
      <!-- 아바타 -->
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

      <!-- 프로필 정보 -->
      <div class="profile-info">
        <!-- 상단: 이름 + 팔로우 버튼 -->
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

        <!-- 통계 -->
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

        <!-- 자기소개 -->
        <p v-if="profileData.description" class="bio">{{ profileData.description }}</p>

        <!-- 가입일 -->
        <div class="meta-info">
          <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>{{ formatJoinDate(profileData.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 구분선 -->
    <div class="divider" />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService, userUtils } from '@/services/UserService'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, userId } = useAuth()

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

const isOwnProfile = computed(() => {
  return isLoggedIn.value && userId.value === profileData.value.userId
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
    const confirmed = confirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')
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
    alert('팔로우 처리 중 오류가 발생했습니다.')
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
  padding: 48px 40px;
}

.profile-container {
  display: flex;
  align-items: flex-start;
  gap: 48px;
  max-width: 1200px;
}

/* 아바타 */
.avatar-wrapper {
  flex-shrink: 0;
}

.avatar {
  width: 144px;
  height: 144px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder svg {
  width: 64px;
  height: 64px;
  color: #d1d5db;
}

/* 프로필 정보 */
.profile-info {
  flex: 1;
  padding-top: 8px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.username {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* 팔로우 버튼 */
.follow-btn {
  padding: 8px 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
  background: #9333EA;
  color: #ffffff;
}

.follow-btn:hover:not(:disabled) {
  opacity: 0.9;
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
  gap: 40px;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  margin: -4px -8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.stat:hover {
  background: #f9fafb;
}

.stat:hover .stat-value {
  color: #9333EA;
}

.stat:hover .stat-label {
  color: #9333EA;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  transition: color 0.2s;
}

.stat-label {
  font-size: 16px;
  color: #6b7280;
  transition: color 0.2s;
}

/* 자기소개 */
.bio {
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 12px 0;
  max-width: 500px;
}

/* 메타 정보 */
.meta-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #9ca3af;
}

.meta-icon {
  width: 16px;
  height: 16px;
}

/* 구분선 */
.divider {
  border-top: 1px solid #f3f4f6;
  margin-top: 40px;
  max-width: 1200px;
}
</style>