<template>
  <section class="profile-section">
    <!-- 프로필 헤더 -->
    <div class="profile-header">
      <div class="profile-left">
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
          <h1 class="username">{{ profileData.nickname || '사용자' }}</h1>
          <p v-if="profileData.description" class="bio">{{ profileData.description }}</p>
          <div class="meta-info">
            <span class="meta-text">
              <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {{ formatJoinDate(profileData.createdAt) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 팔로우 버튼 -->
      <button
          v-if="!isOwnProfile"
          class="follow-btn"
          :class="{ active: profileData.isFollowing }"
          @click="handleFollow"
          :disabled="isFollowLoading"
      >
        <svg v-if="!profileData.isFollowing" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        {{ profileData.isFollowing ? '팔로잉' : '팔로우' }}
      </button>
    </div>

    <!-- 통계 바 -->
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-value">{{ formatNumber(profileData.followerCount) }}</span>
        <span class="stat-label">팔로워</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ formatNumber(profileData.followingCount) }}</span>
        <span class="stat-label">팔로잉</span>
      </div>
    </div>
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

// 본인 프로필 여부
const isOwnProfile = computed(() => {
  return isLoggedIn.value && userId.value === profileData.value.userId
})

// 프로필 로드
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

// 팔로우 토글
const handleFollow = async () => {
  console.log('=== 팔로우 버튼 클릭 ===')
  console.log('로그인 상태:', isLoggedIn.value)

  // 로그인 체크
  if (!isLoggedIn.value) {
    const confirmed = confirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')

    if (confirmed) {
      console.log('✅ 로그인 페이지로 이동')
      await router.push({
        name: 'Login',
        query: { redirect: route.fullPath }
      })
    } else {
      console.log('❌ 취소됨')
    }
    return
  }

  if (isFollowLoading.value) return

  try {
    isFollowLoading.value = true

    const response = await userService.toggleFollow(profileData.value.userId)

    if (response.success && response.data) {
      // 팔로우 상태 업데이트
      profileData.value.isFollowing = response.data.isFollowing

      // 팔로워 수 업데이트
      if (response.data.isFollowing) {
        profileData.value.followerCount++
      } else {
        profileData.value.followerCount--
      }

      console.log('✅ 팔로우 토글 완료:', response.data)
    }
  } catch (error) {
    console.error('❌ 팔로우 토글 실패:', error)
    alert('팔로우 처리 중 오류가 발생했습니다.')
  } finally {
    isFollowLoading.value = false
  }
}

// 숫자 포맷팅
const formatNumber = (num) => {
  return userUtils.formatFollowCount(num)
}

// 가입일 포맷팅
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
/* ==================== 프로필 섹션 ==================== */
.profile-section {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #DBDBDB;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .profile-section {
    padding: 24px 32px 20px;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .profile-section {
    padding: 32px 40px 24px;
  }
}

/* ==================== 프로필 헤더 ==================== */
.profile-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

/* 태블릿 이상: 가로 레이아웃 */
@media (min-width: 768px) {
  .profile-header {
    flex-direction: row;
    align-items: flex-start;
    gap: 32px;
    margin-bottom: 20px;
  }
}

/* ==================== 프로필 왼쪽 (아바타 + 정보) ==================== */
.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

/* 태블릿 이상: 가로 레이아웃 */
@media (min-width: 768px) {
  .profile-left {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }
}

/* ==================== 아바타 ==================== */
.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 77px;
  height: 77px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #DBDBDB;
}

/* 태블릿 */
@media (min-width: 768px) {
  .avatar {
    width: 110px;
    height: 110px;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .avatar {
    width: 150px;
    height: 150px;
  }
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667EEA, #764BA2);
  color: white;
}

.avatar-placeholder svg {
  width: 40%;
  height: 40%;
}

/* ==================== 프로필 정보 ==================== */
.profile-info {
  flex: 1;
  min-width: 0;
  text-align: center;
}

/* 태블릿 이상: 왼쪽 정렬 */
@media (min-width: 768px) {
  .profile-info {
    text-align: left;
  }
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* 태블릿 */
@media (min-width: 768px) {
  .username {
    font-size: 22px;
    font-weight: 400;
    margin-bottom: 6px;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .username {
    font-size: 28px;
    margin-bottom: 8px;
  }
}

.bio {
  font-size: 13px;
  color: #262626;
  line-height: 1.5;
  margin-bottom: 8px;
  word-break: break-word;
}

@media (min-width: 768px) {
  .bio {
    font-size: 14px;
  }
}

/* 메타 정보 */
.meta-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #737373;
}

/* 태블릿 이상: 왼쪽 정렬 */
@media (min-width: 768px) {
  .meta-info {
    justify-content: flex-start;
    font-size: 13px;
  }
}

.meta-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .meta-icon {
    width: 14px;
    height: 14px;
  }
}

/* ==================== 팔로우 버튼 ==================== */
.follow-btn {
  width: 100%;
  height: 32px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #0095F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

/* 태블릿 이상: 고정 너비 */
@media (min-width: 768px) {
  .follow-btn {
    width: auto;
    min-width: 120px;
  }
}

.follow-btn:hover:not(:disabled) {
  background: #1877F2;
}

.follow-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.follow-btn.active {
  background: transparent;
  color: #262626;
  border: 1px solid #DBDBDB;
}

.follow-btn.active:hover:not(:disabled) {
  background: #FAFAFA;
}

.follow-btn .icon {
  width: 16px;
  height: 16px;
}

/* ==================== 통계 바 ==================== */
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding-top: 12px;
  border-top: 1px solid #EFEFEF;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .stats-bar {
    justify-content: flex-start;
    gap: 48px;
    padding-top: 16px;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .stats-bar {
    gap: 56px;
    padding-top: 20px;
  }
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

/* 태블릿 이상: 가로 레이아웃 */
@media (min-width: 768px) {
  .stat {
    flex-direction: row;
    gap: 4px;
    align-items: baseline;
  }
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #262626;
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .stat-value {
    font-size: 15px;
    font-weight: 600;
  }
}

.stat-label {
  font-size: 12px;
  color: #737373;
  font-weight: 400;
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .stat-label {
    font-size: 14px;
  }
}

/* ==================== 애니메이션 ==================== */
.profile-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 터치 최적화 ==================== */
@media (hover: none) and (pointer: coarse) {
  .follow-btn {
    min-height: 44px;
  }
}

/* ==================== 작은 모바일 (320px) ==================== */
@media (max-width: 375px) {
  .profile-section {
    padding: 12px;
  }

  .username {
    font-size: 16px;
  }

  .bio {
    font-size: 12px;
  }

  .stats-bar {
    gap: 32px;
  }

  .stat-label {
    font-size: 11px;
  }
}

/* ==================== 큰 데스크탑 (1440px+) ==================== */
@media (min-width: 1440px) {
  .profile-section {
    padding: 40px 48px 28px;
  }

  .username {
    font-size: 32px;
  }
}
</style>